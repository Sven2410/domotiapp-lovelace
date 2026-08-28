"""De motor: van een melder die afgaat naar een beeld in de timeline.

Dit is het enige stuk dat draait zonder dat er iemand kijkt. Een kaart bestaat
alleen zolang er een dashboard openstaat; een telefoon in een broekzak heeft
geen kaart. De hele keten staat daarom hier.

## De keten

    binary_sensor gaat van uit naar aan
      -> hoort er een regel bij, en staat die aan?
      -> is de rustperiode van DEZE MELDER voorbij?          <- de klok, meteen gezet
      -> wachttijd afwachten (standaard 0)
      -> beeld ophalen bij de camera
      -> ruimte maken in de timeline, bestand wegschrijven, regel erbij
      -> melding naar de gekozen personen
      -> open kaarten bijwerken

## Waarom de klok VOOR het beeld gezet wordt en niet erna

Het ophalen van een beeld duurt bij een IP-camera al gauw een halve seconde, en
met een wachttijd erbij langer. Zou de klok pas na afloop gezet worden, dan
glippen alle detecties die in dat gat vallen er alsnog doorheen -- precies de
tien meldingen die dit moest oplossen.

Gevolg, en dat is bedoeld: een mislukte poging kost ook een rustperiode. Een
camera die niet reageert wordt dus niet elke seconde opnieuw geprobeerd.

## Waarom de klok PER MELDER loopt

Op 27 augustus 2026 gecorrigeerd door de eigenaar. Een Reolink meldt persoon,
voertuig en huisdier los; dat zijn drie gebeurtenissen en geen drie manieren om
hetzelfde te zeggen. De auto die de oprit op rijdt en de bestuurder die
uitstapt horen allebei een beeld op te leveren.

## Wat er bij een herstart gebeurt

De klok begint niet op nul: `BeeldIndex.laatste_tijd` geeft terug wanneer deze
melder voor het laatst een beeld opleverde, en dat telt gewoon door. En een
melder die bij het opstarten zijn toestand terugkrijgt (`old_state is None`)
telt niet als detectie -- anders regent het beelden na elke herstart.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta
import logging
from typing import Any

from homeassistant.components import camera as camera_component
from homeassistant.const import STATE_ON
from homeassistant.core import CALLBACK_TYPE, Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.util import dt as dt_util
from homeassistant.util.ulid import ulid_now

from . import beelden as beeldopslag
from . import meldingen
from .const import (
    EVENT_NIEUW,
    EVENT_OPGERUIMD,
    MAX_LEEFTIJD,
    MAX_PER_CAMERA,
)
from .opruimen import bepaal_opruiming, maak_ruimte, verweesd
from .store import BeeldIndex, RegelStore

_LOGGER = logging.getLogger(__name__)

# Hoe lang er hoogstens op een camera gewacht wordt. Langer dan dit en het beeld
# is toch niet meer het beeld van de detectie.
CAMERA_TIMEOUT = 10


class Motor:
    """Luistert naar de melders van alle actieve regels."""

    def __init__(
        self,
        hass: HomeAssistant,
        regels: RegelStore,
        index: BeeldIndex,
        meld_aan_abonnees,
    ) -> None:
        self._hass = hass
        self._regels = regels
        self._index = index
        self._meld = meld_aan_abonnees
        self._afmelden: CALLBACK_TYPE | None = None
        # Per melder: wanneer hij voor het laatst een poging opleverde.
        self._laatste: dict[str, datetime] = {}
        self._taken: set[asyncio.Task] = set()

    # --- opstarten en afsluiten -----------------------------------------

    async def async_start(self) -> None:
        """Zet de luisteraars neer en ruim op wat er is blijven liggen."""
        self.async_herzie()
        await self._async_ruim_op_bij_start()

    @callback
    def async_stop(self) -> None:
        """Alle luisteraars weg en alle lopende pogingen afbreken."""
        if self._afmelden is not None:
            self._afmelden()
            self._afmelden = None
        for taak in list(self._taken):
            taak.cancel()
        self._taken.clear()

    @callback
    def async_herzie(self) -> None:
        """Luister opnieuw, na een wijziging in de regels.

        Eén luisteraar voor alle melders samen, en die wordt bij elke wijziging
        vervangen. Per melder een eigen abonnement zou hetzelfde doen met meer
        boekhouding, en dit is bovendien wat `async_track_state_change_event`
        zelf ook doet -- hij groepeert intern per entity-ID.
        """
        if self._afmelden is not None:
            self._afmelden()
            self._afmelden = None

        melders = sorted(
            {melder for regel in self._regels.actieve() for melder in regel.melders}
        )
        if not melders:
            _LOGGER.debug("Geen actieve bewakingsregels; er wordt niet geluisterd")
            return

        self._afmelden = async_track_state_change_event(
            self._hass, melders, self._async_melder_veranderde
        )
        _LOGGER.debug("Bewaking luistert naar %d melder(s): %s", len(melders), melders)

    # --- de detectie -----------------------------------------------------

    @callback
    def _async_melder_veranderde(self, event: Event[EventStateChangedData]) -> None:
        nieuw = event.data.get("new_state")
        oud = event.data.get("old_state")

        if nieuw is None or nieuw.state != STATE_ON:
            return
        if oud is None:
            # Het opstarten van Home Assistant, niet een detectie.
            return
        if oud.state == STATE_ON:
            # Alleen het omslaan telt; een attribuutwijziging is geen detectie.
            return

        melder = event.data["entity_id"]
        regels = self._regels_voor_melder(melder)
        if not regels:
            return

        # De langste rustperiode wint als deze melder aan meer dan één camera
        # hangt. Anders zou de kortste bepalen hoe vaak de andere camera een
        # beeld maakt, en dat is niet wat daar is ingevuld.
        rustperiode = max(regel.rustperiode for regel in regels)

        nu = dt_util.utcnow()
        if not self._mag_nu(melder, rustperiode, nu):
            _LOGGER.debug(
                "%s viel binnen de rustperiode van %ss en is overgeslagen",
                melder,
                rustperiode,
            )
            return

        # De klok gaat NU om, niet na afloop. Zie de kop van dit bestand. Eén
        # klok voor deze melder, ook als er meerdere camera's aan hangen: het is
        # één gebeurtenis die door meerdere lenzen gezien wordt.
        self._laatste[melder] = nu

        for regel in regels:
            # De naam uit de editor gaat voor die van Home Assistant: de eigenaar
            # heeft in de camerakaart al per melder ingevuld hoe die heet, en dat
            # is de naam die op de kaart staat. Twee namen voor dezelfde melder
            # zou betekenen dat de melding iets anders zegt dan de timeline.
            naam = regel.namen.get(melder) or nieuw.attributes.get("friendly_name")
            taak = self._hass.async_create_task(
                self._async_leg_vast(regel, melder, naam)
            )
            self._taken.add(taak)
            taak.add_done_callback(self._taken.discard)

    @callback
    def _regels_voor_melder(self, melder: str) -> list:
        """Alle camera's waar deze melder aan hangt.

        Meestal precies één: `camera-logica.js` koppelt een melder aan de camera
        waar hij op hetzelfde apparaat zit, en bij een Reolink is dat een feit.

        Maar een melder die NERGENS aan te koppelen is -- een sjabloonsensor
        bijvoorbeeld -- hoort volgens diezelfde logica bij álle camera's van de
        kaart, en dan staat hij ook in alle regels. Dan hoort er ook van elke
        camera een beeld te komen: je weet immers niet welke het gezien heeft,
        en dát is precies waarom hij bij allemaal hoort.

        Eerder werd hier de eerste de beste regel gepakt. Dat leverde één beeld
        op van een willekeurige camera -- willekeurig, want het hing aan de
        volgorde in de opslag.
        """
        return [regel for regel in self._regels.actieve() if melder in regel.melders]

    def _mag_nu(self, melder: str, rustperiode: int, nu: datetime) -> bool:
        if rustperiode <= 0:
            return True
        laatste = self._laatste.get(melder)
        if laatste is None:
            # Nog niets in het geheugen: kijk in de timeline, zodat een herstart
            # de rustperiode niet terugzet op nul.
            laatste = self._index.laatste_tijd(melder)
            if laatste is not None:
                self._laatste[melder] = laatste
        if laatste is None:
            return True
        return nu - laatste >= timedelta(seconds=rustperiode)

    # --- het beeld -------------------------------------------------------

    async def _async_leg_vast(self, regel, melder: str, melder_naam: str | None) -> None:
        """Haal het beeld op, zet het weg, en meld het. Gooit nooit naar boven."""
        try:
            if regel.wachttijd > 0:
                await asyncio.sleep(regel.wachttijd)

            inhoud = await self._async_haal_beeld(regel.camera)
            if inhoud is None:
                return

            beeld = await self._async_bewaar(regel, melder, melder_naam, inhoud)
            if beeld is None:
                return

            await self._async_meld(regel, beeld)
        except asyncio.CancelledError:
            raise
        except Exception:  # noqa: BLE001 - de motor mag nooit omvallen
            _LOGGER.exception(
                "Vastleggen van %s na detectie door %s is misgegaan",
                regel.camera,
                melder,
            )

    async def _async_haal_beeld(self, camera: str) -> bytes | None:
        """Het beeld bij de camera opvragen.

        Met `async_get_image` en NIET met de service `camera.snapshot`. Die
        tweede schrijft naar een bestandspad en eist dat de klant
        `allowlist_external_dirs` in zijn `configuration.yaml` zet; dat is werk
        dat we bij de klant niet horen neer te leggen voor iets dat de
        integratie zelf kan.
        """
        try:
            plaatje = await camera_component.async_get_image(
                self._hass, camera, timeout=CAMERA_TIMEOUT
            )
        except Exception as fout:  # noqa: BLE001 - elke camera-integratie gooit iets anders
            _LOGGER.warning("Geen beeld van %s: %s", camera, fout)
            return None
        return plaatje.content

    async def _async_bewaar(
        self, regel, melder: str, melder_naam: str | None, inhoud: bytes
    ) -> dict[str, Any] | None:
        """Ruimte maken, bestand wegschrijven, regel in de index."""
        nu = dt_util.utcnow()

        # Eerst ruimte maken, dan pas erbij: "en overschrijft hem".
        weg = maak_ruimte(
            self._index.alle(),
            camera=regel.camera,
            nu=nu,
            max_leeftijd=MAX_LEEFTIJD,
            max_per_camera=MAX_PER_CAMERA,
        )
        if weg:
            await self._async_ruim(weg)

        beeld_id = ulid_now()
        try:
            await self._hass.async_add_executor_job(
                beeldopslag.bewaar, self._hass, beeld_id, inhoud
            )
        except OSError as fout:
            _LOGGER.error("Beeld van %s kon niet worden opgeslagen: %s", regel.camera, fout)
            return None

        beeld = {
            "id": beeld_id,
            "camera": regel.camera,
            "melder": melder,
            "naam": melder_naam or melder,
            "tijd": nu.isoformat(),
            "bytes": len(inhoud),
        }
        self._index.voeg_toe(beeld)
        self._meld(EVENT_NIEUW, {"beeld": beeld})
        _LOGGER.debug("Beeld %s van %s vastgelegd (%d bytes)", beeld_id, regel.camera, len(inhoud))
        return beeld

    async def _async_meld(self, regel, beeld: dict[str, Any]) -> None:
        if not regel.ontvangers:
            return
        if regel.alleen_afwezig and self._iemand_thuis():
            _LOGGER.debug(
                "Er is iemand thuis; melding voor %s overgeslagen", regel.camera
            )
            return

        camera_state = self._hass.states.get(regel.camera)
        camera_naam = (
            camera_state.attributes.get("friendly_name") if camera_state else None
        ) or regel.camera

        await meldingen.async_stuur(
            self._hass,
            ontvangers=regel.ontvangers,
            diensten=regel.diensten,
            titel=camera_naam,
            tekst=beeld["naam"],
            beeld_id=beeld["id"],
            camera=regel.camera,
        )

    @callback
    def _iemand_thuis(self) -> bool:
        return any(
            state.state == "home" for state in self._hass.states.async_all("person")
        )

    # --- opruimen --------------------------------------------------------

    async def async_verwijder(self, beeld_ids: list[str]) -> int:
        """Verwijder beelden op verzoek van de gebruiker.

        Gevraagd op 28 augustus 2026: *"dan een verwijder snapshots knop of iets
        dat ik handmatig ook kan verwijderen."*

        Dezelfde weg als het automatische opruimen -- index, schijf, en de open
        kaarten op de hoogte stellen -- want een beeld dat met de hand weggaat
        hoort net zo goed te verdwijnen als een beeld dat over zijn week heen is.
        Er is met opzet GEEN "verwijder alles"-opdracht aan de serverkant: wie
        wist, stuurt de ID's die hij bedoelt. Zo kan een verdwaald commando nooit
        meer weghalen dan er op het scherm stond.

        Geeft terug hoeveel er werkelijk uit de index gingen.
        """
        eruit = self._index.haal_weg(beeld_ids)
        if not eruit:
            return 0
        await self._hass.async_add_executor_job(
            beeldopslag.verwijder, self._hass, [b["id"] for b in eruit]
        )
        # Meteen wegschrijven en niet vertraagd: dit is een handeling van een
        # mens, en die verwacht dat het weg is. Valt Home Assistant er een
        # seconde later uit, dan is het nog steeds weg.
        await self._index.async_bewaar_nu()
        self._meld(EVENT_OPGERUIMD, {"ids": [b["id"] for b in eruit]})
        return len(eruit)

    async def _async_ruim(self, beeld_ids: list[str]) -> None:
        """Haal beelden uit de index én van schijf."""
        eruit = self._index.haal_weg(beeld_ids)
        if not eruit:
            return
        await self._hass.async_add_executor_job(
            beeldopslag.verwijder, self._hass, [b["id"] for b in eruit]
        )
        self._meld(EVENT_OPGERUIMD, {"ids": [b["id"] for b in eruit]})

    async def _async_ruim_op_bij_start(self) -> None:
        """Eén opruimronde bij het opstarten.

        Drie dingen tegelijk, en ze horen bij elkaar omdat ze alle drie het
        gevolg zijn van een Home Assistant die is omgevallen op een ongelukkig
        moment:

        1. beelden die inmiddels ouder zijn dan een week (de klok liep door
           terwijl HA uit stond);
        2. bestanden waar geen regel meer bij hoort -- die vindt niemand terug
           en ze groeien stil door;
        3. regels waar geen bestand meer bij hoort -- die zouden een gebroken
           plaatje in de timeline geven.
        """
        try:
            await self._hass.async_add_executor_job(beeldopslag.zorg_voor_map, self._hass)
            halve = await self._hass.async_add_executor_job(
                beeldopslag.ruim_halve_op, self._hass
            )
        except OSError as fout:
            _LOGGER.warning("De beeldmap kon niet worden klaargezet: %s", fout)
            return

        oud = bepaal_opruiming(
            self._index.alle(),
            nu=dt_util.utcnow(),
            max_leeftijd=MAX_LEEFTIJD,
            max_per_camera=MAX_PER_CAMERA,
        )
        if oud:
            await self._async_ruim(oud)

        op_schijf = await self._hass.async_add_executor_job(
            beeldopslag.op_schijf, self._hass
        )
        zonder_regel, zonder_bestand = verweesd(self._index.alle(), op_schijf)

        if zonder_bestand:
            self._index.haal_weg(zonder_bestand)
        if zonder_regel:
            await self._hass.async_add_executor_job(
                beeldopslag.verwijder, self._hass, zonder_regel
            )

        if halve or oud or zonder_regel or zonder_bestand:
            _LOGGER.debug(
                "Bewaking opgeruimd bij start: %d half, %d verlopen, %d zwerfbestand, "
                "%d regel zonder bestand",
                halve,
                len(oud),
                len(zonder_regel),
                len(zonder_bestand),
            )
