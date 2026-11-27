"""De klok die de meldingen verstuurt, en de knop "Staat buiten".

## Eén tik per minuut, en pas lezen als er iets te doen is

Elke minuut wordt gekeken of het tijd is voor een van de bekende meldingen.
Alleen op zo'n minuut worden de dashboards opnieuw gelezen, zodat een kaart die
net is weggehaald of aangepast meteen telt. Daarnaast wordt er gelezen bij
`lovelace_updated` (iemand sloeg een dashboard op) en eens per uur, voor een
dashboard dat in zijn geheel is verwijderd.

## "Staat buiten"

Elke melding heeft een knop. Tikt iemand hem aan op de melding van de avond
ervoor, dan:

- vervalt de melding van de ochtend zelf -- de container staat er al;
- verdwijnt de avondmelding van de telefoons van de anderen
  (`clear_notification` met dezelfde `tag`);
- zegt de kaart erbij wie het deed.

De knop werkt alleen via de notify-DIENST van de companion-app
(`notify.mobile_app_...`), niet via de notify-entiteit: `notify.send_message`
neemt alleen een titel en een tekst, geen knoppen en geen tag. Dat is ook de
reden dat de telefoon bij een PERSOON gezocht wordt (`bewaking/meldingen.py`)
en niet als notify-entiteit gekozen.

## Eén avondmelding per dag, ook als de tijd verschuift

Is de melding van vanavond al verstuurd, dan levert een latere tijd vandaag
niets meer op. Dat is met opzet: wie om 21:00 de tijd van 19:30 naar 22:00 zet,
wil morgen om 22:00 een melding, niet vanavond een tweede aan het hele huis.
Om te kijken of het werkt is er de PROEF (de knop in de pop-up van een
persoon): die gaat alleen naar die persoon, telt niet als verstuurd, en heeft
een eigen tag, zodat hij de echte melding op de telefoon niet vervangt.

## De robotstofzuiger: geen klok maar een verandering

Sinds 0.85.0. Wat er gemeld wordt staat in `stofzuiger.py`; hier staat HOE.
Na elke lezing van de dashboards volgt de motor de entiteiten van de gekozen
robots (`async_track_state_change_event`): de stofzuiger zelf en de sensoren
van hetzelfde apparaat met een rol. Een melding over een TOESTAND (storing,
station, onderhoud) gaat één keer uit als hij begint, met een tag per robot en
per ding, en wordt van de telefoons gehaald (`clear_notification`) als het weer
in orde is. "Klaar" wacht tien tellen: Dreame zet het oppervlak en de duur van
de beurt soms net na de taak.

## De garagedeur

Sinds 0.139.0. Wat er gemeld wordt en wanneer staat in `garage.py`; hier staat HOE.
De motor volgt het contact. Gaat het open, dan komt `open_sinds` in de opslag;
gaat het dicht, dan verdwijnt alles van de telefoons en uit de opslag. Elke minuut
vraagt de klok `garage.volgende` of er nu een melding moet. Alles wat die nodig
heeft staat in de opslag, dus een herstart gaat gewoon verder. De knoppen in de
melding komen binnen als `mobile_app_notification_action`, net als "Staat
buiten". Sluiten wordt na `SLUIT_CONTROLE` seconden nagekeken; staat de wekker er
na een herstart niet meer, dan doet de klok het.

## De auto

Sinds 0.141.0. Wat een bericht is staat in `auto.py`; hier staat HOE. De motor volgt de berichtensensoren van de
kaart. Wat er al gemeld is (of er al stond toen een sensor voor het eerst gelezen werd) staat per sensor in de
opslag (`auto`), dus een herstart meldt niets dubbel, en een bericht dat tijdens een herstart binnenkwam komt
alsnog bij de eerste lezing erna. Een bericht dat verdwijnt (gewist bij de fabrikant, op de kaart of in de app)
gaat ook van de telefoons af: elk bericht heeft een eigen tag.

Sinds 0.142.0 ook laden klaar en accu laag, van de sensoren op hetzelfde apparaat (`auto_delen`). Een verandering zet
alleen de stand in de opslag (`_auto_laden`); de klok van elke minuut (`_auto_tik`) kijkt of de wachttijd om is en
stuurt dan. Zo gaat een herstart midden in het wachten gewoon verder. Zie de kop van `auto.py` waarom er gewacht wordt.

## Een agenda als afvalbron

Sinds 0.136.0 mag `afval_vandaag` of `afval_morgen` een `calendar.*` zijn (zie
de kop van `afval.py`). Dan zegt niet de toestand welke bakken het zijn, maar
de afspraken op de ophaaldag zelf (`_namen_op`). De pop-up leert de bakken van
een agenda meteen kennen: de afspraken van de komende `AGENDA_VOORUIT_DAGEN`.
"""

from __future__ import annotations

from collections.abc import Callable
from datetime import date, datetime, timedelta
import logging
from typing import Any

from homeassistant.components.calendar.const import DATA_COMPONENT as AGENDA_COMPONENT
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
    async_track_time_change,
    async_track_time_interval,
)
from homeassistant.util import dt as dt_util, slugify

from ..bewaking import meldingen as telefoons
from ..bewaking.const import DATA_INDEX as BEWAKING_INDEX, DATA_REGELS as BEWAKING_REGELS
from ..const import DOMAIN
from ..taal import t, taal_van
from . import afval, auto, camera, garage, kaarten, stofzuiger
from .const import (
    ACTIE_BUITEN,
    EVENT_ACTIE,
    HERLEES_INTERVAL_MIN,
    MOMENT_VANDAAG,
    MOMENTEN,
    SOORT_AFVAL,
    SOORT_AUTO,
    SOORT_CAMERA,
    SOORT_GARAGE,
    SOORT_STOFZUIGER,
)
from .kaarten import Melding
from .store import MeldingOpslag

_LOGGER = logging.getLogger(__name__)

# Hoe ver de pop-up vooruitkijkt in een afvalagenda om de bakken te leren
# kennen. Een gemeente haalt elke soort minstens eens in de acht weken op.
AGENDA_VOORUIT_DAGEN = 62

EVENT_LOVELACE_UPDATED = "lovelace_updated"


# Op de plek van de ophaaldag in de tag en de knop van een proefmelding. Een tik
# op "Staat buiten" in een proef doet daardoor niets: zie `_actie`.
PROEF = "proef"


def tag_voor(melding: str, ophaaldag: date | str) -> str:
    """Eén regel per ophaaldag: de ochtendmelding vervangt die van de avond."""
    return f"domotiapp-{melding}-{ophaaldag}"


def actie_voor(melding: str, ophaaldag: date | str) -> str:
    return f"{ACTIE_BUITEN}|{melding}|{ophaaldag}"


def lees_actie(actie: str) -> tuple[str, str] | None:
    """(melding, ophaaldag) uit het id van de knop, of None als het niet de onze is."""
    delen = str(actie or "").split("|")
    if len(delen) != 3 or delen[0] != ACTIE_BUITEN or not delen[1] or not delen[2]:
        return None
    return delen[1], delen[2]


class Motor:
    """Leest de kaarten, verstuurt op tijd, en luistert naar de knop."""

    def __init__(
        self,
        hass: HomeAssistant,
        opslag: MeldingOpslag,
        meld: Callable[[str | None], None],
    ) -> None:
        self.hass = hass
        self.opslag = opslag
        self._meld = meld
        self.meldingen: dict[str, Melding] = {}
        self._uit: list[CALLBACK_TYPE] = []
        # Per (dashboard, melding) de instellingen van de vorige keer lezen. None
        # tot de eerste lezing: wat er bij het opstarten staat is geen wijziging.
        self._gezien: dict[tuple[str, str], tuple[Any, ...]] | None = None
        # De robotstofzuigers: per gevolgde entiteit (robot, rol, translation_key),
        # het abonnement, de robots die aan het schoonmaken zijn (voor een merk
        # zonder taak), en per (robot, sleutel) wat elke entiteit nu meldt.
        self._robot_rollen: dict[str, tuple[str, str, str]] = {}
        self._robot_uit: CALLBACK_TYPE | None = None
        self._bezig: set[str] = set()
        self._meldt: dict[tuple[str, str], dict[str, str]] = {}
        # Wat er echt naar de telefoons ging (alleen dat wordt gewist), en wat
        # nog wacht: een tank die bij het bijvullen even uit staat (0.85.1).
        self._gemeld: set[tuple[str, str]] = set()
        self._wacht: dict[tuple[str, str], CALLBACK_TYPE] = {}
        # De garagedeur: het gevolgde contact, en de wekker die Sluiten nakijkt.
        self._garage_contact: str | None = None
        self._garage_uit: CALLBACK_TYPE | None = None
        self._sluit_later: CALLBACK_TYPE | None = None
        # De auto: de gevolgde berichtensensoren.
        self._auto_sensoren: tuple[str, ...] = ()
        self._auto_uit: CALLBACK_TYPE | None = None
        # Per gevolgde entiteit: (berichtensensor van die auto, rol). Rol is berichten, laden, stekker of accu.
        self._auto_rollen: dict[str, tuple[str, str]] = {}

    async def async_start(self) -> None:
        await self.async_herlees()
        self._uit.append(async_track_time_change(self.hass, self._tik, second=0))
        self._uit.append(async_track_time_interval(
            self.hass, self._herlees_tik, timedelta(minutes=HERLEES_INTERVAL_MIN)
        ))
        self._uit.append(self.hass.bus.async_listen(EVENT_LOVELACE_UPDATED, self._herlees_tik))
        self._uit.append(self.hass.bus.async_listen(EVENT_ACTIE, self._actie))

    @callback
    def async_stop(self) -> None:
        while self._uit:
            self._uit.pop()()
        if self._robot_uit is not None:
            self._robot_uit()
            self._robot_uit = None
        for weg in self._wacht.values():
            weg()
        self._wacht.clear()
        for weg in (self._garage_uit, self._sluit_later, self._auto_uit):
            if weg is not None:
                weg()
        self._garage_uit = self._sluit_later = self._auto_uit = None
        self._auto_sensoren = ()

    async def async_herlees(self) -> None:
        gelezen = await kaarten.async_lees_kaarten(self.hass)
        self._onthoud_wijzigingen(gelezen)
        self.meldingen = kaarten.voeg_samen(gelezen, self.opslag.alle_leidend())
        await self._onthoud_bakken()
        self._volg_stofzuigers()
        self._volg_garage()
        self._volg_auto()
        self._meld(None)

    async def _onthoud_bakken(self) -> None:
        """Welke bakken de afvalsensoren nu noemen: zo leert de pop-up ze kennen.

        Er wordt elk uur gelezen, en de sensor van morgen noemt een hele dag de
        bak van morgen; na een paar weken staan ze er dus allemaal (0.87.0).
        Een agenda noemt ze meteen: alles wat de komende weken komt.
        """
        vandaag = dt_util.now().date()
        for melding in self.meldingen.values():
            if melding.soort != SOORT_AFVAL:
                continue
            for bron in dict.fromkeys(melding.sensoren.values()):
                if _is_agenda(bron):
                    namen = await self._namen_uit_agenda(
                        bron, vandaag, vandaag + timedelta(days=AGENDA_VOORUIT_DAGEN)
                    )
                elif (st := self.hass.states.get(bron)) is not None:
                    namen = afval.soorten(st.state)
                else:
                    namen = None
                if namen:
                    self.opslag.voeg_gezien(melding.id, namen)

    async def _namen_op(self, bron: str, dag: date) -> list[str]:
        """De bakken die deze sensor of agenda voor `dag` noemt; leeg = niets."""
        if _is_agenda(bron):
            return await self._namen_uit_agenda(bron, dag, dag + timedelta(days=1)) or []
        st = self.hass.states.get(bron)
        return afval.soorten(st.state) if st is not None else []

    async def _namen_uit_agenda(self, bron: str, van: date, tot: date) -> list[str] | None:
        """De soorten in de titels van de afspraken van `van` tot `tot`. None als de agenda er niet is.

        Een afspraak voor de hele dag loopt tot middernacht erna; die van gisteren
        raakt vandaag dus net, en telt niet mee.
        """
        component = self.hass.data.get(AGENDA_COMPONENT)
        agenda = component.get_entity(bron) if component is not None else None
        if agenda is None:
            return None
        begin = dt_util.start_of_local_day(van)
        einde = dt_util.start_of_local_day(tot)
        try:
            afspraken = await agenda.async_get_events(self.hass, begin, einde)
        except Exception as fout:  # noqa: BLE001 - een agenda die hapert houdt de melding niet tegen
            _LOGGER.warning("Afvalagenda %s niet te lezen: %s", bron, fout)
            return None
        afspraken = sorted(
            (a for a in afspraken if a.start_datetime_local < einde and a.end_datetime_local > begin),
            key=lambda a: a.start_datetime_local,
        )
        return afval.uit_titels(a.summary for a in afspraken)

    @callback
    def _onthoud_wijzigingen(self, gelezen: list[tuple[str, dict[str, Any]]]) -> None:
        """Is een kaart aangepast sinds de vorige keer? Dan gaat zijn dashboard voor.

        Alleen een kaart die er de vorige keer ook stond, met andere
        instellingen. Een NIEUWE kaart telt niet: wie een dashboard kopieert om
        er een wandtablet van te maken, krijgt een kaart met de instellingen van
        toen, en die hoort niet ineens voor te gaan. Zie de kop van kaarten.py.
        """
        nu = {
            (m.dashboards[0], m.id): m.vergelijkbaar()
            for m in kaarten.meldingen_per_kaart(gelezen)
        }
        if self._gezien is not None:
            for sleutel, instellingen in nu.items():
                dashboard, ident = sleutel
                if sleutel in self._gezien and self._gezien[sleutel] != instellingen:
                    _LOGGER.info(
                        "Meldingenkaart %r op %s aangepast; die instellingen gaan voor",
                        ident,
                        dashboard or "standaard",
                    )
                    self.opslag.zet_leidend(ident, dashboard)
        self._gezien = nu

    async def _herlees_tik(self, *_: Any) -> None:
        await self.async_herlees()

    async def _tik(self, nu: datetime) -> None:
        try:
            await self._garage_tik(nu)
        except Exception:  # noqa: BLE001 - de garage houdt het afval niet tegen
            _LOGGER.exception("Garagemelding: de klok liep vast")
        try:
            await self._auto_tik(nu)
        except Exception:  # noqa: BLE001 - de auto houdt het afval niet tegen
            _LOGGER.exception("Automelding: de klok liep vast")
        klok = nu.strftime("%H:%M")
        if not any(m.tijden.get(mo) == klok for m in self.meldingen.values() for mo in MOMENTEN):
            return
        # Vers lezen: een kaart die net is weggehaald hoort niets meer te sturen.
        await self.async_herlees()
        for melding in list(self.meldingen.values()):
            for moment in MOMENTEN:
                if melding.tijden.get(moment) == klok:
                    uitkomst = await self.async_verstuur(melding.id, moment, nu)
                    _LOGGER.debug("Melding %s (%s): %s", melding.id, moment, uitkomst)

    async def async_verstuur(
        self,
        ident: str,
        moment: str,
        nu: datetime | None = None,
        *,
        proef: bool = False,
        alleen: str | None = None,
    ) -> dict[str, Any]:
        """Stuur de melding van dit moment. Geeft terug wat er gebeurde en waarom.

        `proef` slaat de controles op tijd over (al verstuurd, staat al buiten)
        en stuurt ook als er niets opgehaald wordt, met een voorbeeld. Zo kan de
        klant zien of zijn telefoon gevonden wordt zonder tot 19:30 te wachten.
        `alleen` beperkt het tot die ene persoon: een proef om 22:00 hoort niet
        bij het hele huis binnen te komen.
        """
        nu = nu or dt_util.now()
        melding = self.meldingen.get(ident)
        if melding is None:
            return {"reden": t(self.hass, "Deze melding staat op geen enkel opgeslagen dashboard")}
        if melding.soort == SOORT_STOFZUIGER:
            if not proef:
                return {"reden": t(self.hass, "Een stofzuigermelding komt niet op een tijd")}
            return await self.async_proef_stofzuiger(melding, alleen)
        if melding.soort == SOORT_CAMERA:
            if not proef:
                return {"reden": t(self.hass, "Een cameramelding komt niet op een tijd")}
            return await self.async_proef_camera(melding, alleen)
        if melding.soort == SOORT_GARAGE:
            if not proef:
                return {"reden": t(self.hass, "Een garagemelding komt niet op een tijd")}
            if alleen is None:
                return {"reden": t(self.hass, "Een proef gaat naar één persoon")}
            return await self._stuur_garage(melding, "eerste", nu, alleen=alleen, proef=True)
        if melding.soort == SOORT_AUTO:
            if not proef:
                return {"reden": t(self.hass, "Een automelding komt niet op een tijd")}
            return await self.async_proef_auto(melding, alleen)
        if melding.soort != SOORT_AFVAL:
            return {"reden": t(self.hass, "Deze melding staat op geen enkel opgeslagen dashboard")}

        vandaag = nu.date()
        ophaaldag = vandaag if moment == MOMENT_VANDAAG else vandaag + timedelta(days=1)

        sensor = melding.sensoren.get(moment)
        namen = await self._namen_op(sensor, ophaaldag) if sensor else []
        if not proef:
            if not sensor:
                if moment == MOMENT_VANDAAG:
                    return {"reden": t(self.hass, "Geen sensor voor vandaag")}
                return {"reden": t(self.hass, "Geen sensor voor morgen")}
            if not namen:
                return {"reden": t(self.hass, "Er wordt niets opgehaald")}
            if self.opslag.verstuurd(ident, moment) == vandaag.isoformat():
                return {"reden": t(self.hass, "Vandaag al verstuurd")}
            buiten = self.opslag.buiten(ident)
            if moment == MOMENT_VANDAAG and buiten and buiten.get("datum") == ophaaldag.isoformat():
                return {"reden": t(self.hass, "Staat al buiten")}

        titel, tekst = afval.bericht(moment, namen or ["GFT"], taal_van(self.hass))
        if proef:
            titel = t(self.hass, "Proef · {titel}", titel=titel)

        # Een proef krijgt een eigen tag: met die van de ophaaldag zou hij de
        # echte melding van vanavond op de telefoon vervangen.
        sleutel = PROEF if proef else ophaaldag
        data = {
            "tag": tag_voor(ident, sleutel),
            "group": "domotiapp-afval",
            "actions": [{"action": actie_voor(ident, sleutel), "title": t(self.hass, "Staat buiten")}],
        }

        if namen:
            self.opslag.voeg_gezien(ident, namen)
        if alleen is not None:
            # Wie de proef vraagt, wil hem krijgen, ook met het vinkje uit.
            ontvangers = [(alleen, titel, tekst)]
        else:
            ontvangers = []
            for p in melding.personen:
                if not self.opslag.aan(ident, p):
                    continue
                # Sinds 0.87.0 kiest ieder zelf wanneer en welke bakken. De
                # melding noemt dan alleen zijn bakken; zijn er geen, niets.
                if proef:
                    # Een proef laat zien of de telefoon gevonden wordt, niet
                    # wat iemand koos.
                    ontvangers.append((p, titel, tekst))
                    continue
                keuze = self.opslag.keuze(ident, p)
                if "momenten" in keuze and moment not in keuze["momenten"]:
                    continue
                niet = {b.lower() for b in keuze.get("bakken_niet", [])}
                eigen = [n for n in namen if n.lower() not in niet]
                if not eigen:
                    continue
                if len(eigen) == len(namen):
                    ontvangers.append((p, titel, tekst))
                else:
                    ontvangers.append((p, *afval.bericht(moment, eigen, taal_van(self.hass))))
        gelukt: list[str] = []
        zonder: list[str] = []
        for persoon, titel_p, tekst_p in ontvangers:
            dienst = melding.diensten.get(persoon) or telefoons.dienst_voor(self.hass, persoon)
            if not dienst:
                zonder.append(persoon)
                continue
            try:
                await self.hass.services.async_call(
                    "notify", dienst, {"title": titel_p, "message": tekst_p, "data": data}, blocking=True
                )
            except Exception as fout:  # noqa: BLE001 - één telefoon houdt de rest niet tegen
                _LOGGER.warning("Afvalmelding naar %s (%s) mislukte: %s", persoon, dienst, fout)
                zonder.append(persoon)
                continue
            gelukt.append(persoon)

        if zonder:
            _LOGGER.warning("Geen telefoon gevonden voor %s; die krijgt geen afvalmelding", ", ".join(zonder))

        if not proef:
            self.opslag.zet_verstuurd(ident, moment, vandaag.isoformat())
        self._meld(ident)
        return {"verstuurd": gelukt, "zonder_telefoon": zonder, "titel": titel, "tekst": tekst}

    @callback
    def _persoon_van(self, user_id: str | None) -> str | None:
        if not user_id:
            return None
        for st in self.hass.states.async_all("person"):
            if st.attributes.get("user_id") == user_id:
                return st.entity_id
        return None

    async def _actie(self, event: Event) -> None:
        if (knop := garage.lees_actie(event.data.get("action"))) is not None:
            await self.async_garage_knop(*knop, event.context.user_id)
            return
        gelezen = lees_actie(event.data.get("action"))
        if gelezen is None:
            return
        ident, datum = gelezen
        if datum == PROEF:
            # Een tik in een proefmelding zet niets buiten.
            return
        door = self._persoon_van(event.context.user_id)
        self.opslag.zet_buiten(ident, datum, door, dt_util.now().isoformat())
        _LOGGER.info("Afval %s voor %s staat buiten (%s)", ident, datum, door or "onbekend")
        self._meld(ident)

        # Bij de anderen hoeft hij niet meer op het scherm te staan.
        melding = self.meldingen.get(ident)
        if melding is None:
            return
        for persoon in melding.personen:
            if persoon == door:
                continue
            dienst = melding.diensten.get(persoon) or telefoons.dienst_voor(self.hass, persoon)
            if not dienst:
                continue
            try:
                await self.hass.services.async_call(
                    "notify",
                    dienst,
                    {"message": "clear_notification", "data": {"tag": tag_voor(ident, datum)}},
                    blocking=False,
                )
            except Exception as fout:  # noqa: BLE001
                _LOGGER.debug("Wissen bij %s lukte niet: %s", persoon, fout)

    # ------------------------------------------------------- de robotstofzuiger

    @callback
    def _volg_stofzuigers(self) -> None:
        """Volg de entiteiten van de robots op de kaarten; opnieuw als dat er andere zijn."""
        melding = self.meldingen.get(SOORT_STOFZUIGER)
        rollen: dict[str, tuple[str, str, str]] = {}
        if melding is not None and melding.soort == SOORT_STOFZUIGER:
            for robot in melding.stofzuigers:
                rollen[robot] = (robot, "stofzuiger", "")
                for entiteit, (rol, tk) in robot_delen(self.hass, robot).items():
                    rollen.setdefault(entiteit, (robot, rol, tk))
        if rollen.keys() == self._robot_rollen.keys() and self._robot_uit is not None:
            self._robot_rollen = rollen
            return
        if self._robot_uit is not None:
            self._robot_uit()
            self._robot_uit = None
        self._robot_rollen = rollen
        if rollen:
            self._robot_uit = async_track_state_change_event(
                self.hass, list(rollen), self._robot_verandert
            )
            _LOGGER.debug("Stofzuigermeldingen volgen %d entiteiten", len(rollen))

    @callback
    def _robot_verandert(self, event: Event) -> None:
        eid = event.data.get("entity_id")
        info = self._robot_rollen.get(eid)
        nieuw = event.data.get("new_state")
        if info is None or nieuw is None:
            return
        robot, rol, tk = info
        oud = event.data.get("old_state")
        ov = oud.state if oud is not None else None
        nv = nieuw.state
        # NAAR `unavailable` is een herstart of een wegvallende verbinding: dat
        # zegt niets over de robot, en mag een lopende melding niet wissen.
        if not stofzuiger.heeft_waarde(nv):
            return
        # Uit `unavailable` of `unknown` is een robot die (weer) verbindt: wat
        # er dan staat, wordt onthouden maar niet gemeld.
        melden = stofzuiger.heeft_waarde(ov)
        taal = taal_van(self.hass)

        if rol == "stofzuiger":
            if nv in stofzuiger.STOFZUIGER_BEZIG:
                self._bezig.add(robot)
                self._stop_wacht((robot, "klaar"))
            elif nv == "docked" and robot in self._bezig and not self._rol_van(robot, "taak"):
                # Zonder taaksensor: pas klaar als hij in het station BLIJFT.
                self._later((robot, "klaar"), stofzuiger.KLAAR_ZONDER_TAAK, lambda: self._klaar_zonder_taak(robot))
            if not self._rol_van(robot, "fout"):
                tekst = t(self.hass, "Storing") if nv == "error" else ""
                self._toestand(robot, stofzuiger.SOORT_STORING, "storing", eid, tekst, melden)
        elif rol == "taak":
            if stofzuiger.is_klaar("taak", ov, nv):
                self._klaar_straks(robot)
        elif rol == "fout":
            fout = stofzuiger.fout_tekst(nv, nieuw.attributes.get("description"))
            tekst = stofzuiger.storing_tekst(fout, taal) if fout else ""
            self._toestand(robot, stofzuiger.SOORT_STORING, "storing", eid, tekst, melden)
        elif rol in stofzuiger.STATION_SLEUTEL:
            tekst = stofzuiger.station_tekst(rol, nv, taal)
            sleutel = stofzuiger.STATION_SLEUTEL[rol]
            self._toestand(
                robot, stofzuiger.SOORT_STATION, sleutel, eid, tekst, melden, wacht=stofzuiger.STATION_WACHT
            )
        elif rol == "onderhoud":
            pct = stofzuiger.onderhoud_procent(nv)
            naam = str(nieuw.attributes.get("friendly_name") or "")
            tekst = stofzuiger.onderhoud_tekst(tk, pct, naam, taal) if pct is not None else ""
            # Een onderdeel dat al onder de grens zat en verder zakt, is geen
            # nieuwe melding: alleen de overgang telt (zie `_toestand`).
            melden = melden and stofzuiger.onderhoud_procent(ov) is None
            self._toestand(robot, stofzuiger.SOORT_ONDERHOUD, f"onderhoud-{tk}", eid, tekst, melden, opnieuw=False)

    @callback
    def _rol_van(self, robot: str, rol: str) -> str | None:
        for entiteit, (r, ro, _) in self._robot_rollen.items():
            if r == robot and ro == rol:
                return entiteit
        return None

    @callback
    def _toestand(
        self,
        robot: str,
        soort: str,
        sleutel: str,
        entiteit: str,
        tekst: str,
        melden: bool,
        *,
        opnieuw: bool = True,
        wacht: int = 0,
    ) -> None:
        """Een toestand die begint, verandert of ophoudt.

        Twee entiteiten kunnen dezelfde sleutel delen (de schoonwatertank en de
        waterwaarschuwing): de melding staat aan zolang een van beide iets zegt.
        `opnieuw` is of een ANDERE tekst bij een toestand die al liep een nieuwe
        melding is (een andere storing wel, een onderdeel van 8 naar 7 % niet).
        `wacht` is hoeveel seconden de toestand moet blijven voor hij gemeld
        wordt; is hij eerder voorbij, dan gaat er niets uit.
        """
        sl = (robot, sleutel)
        bron = self._meldt.setdefault(sl, {})
        voor = next((x for x in bron.values() if x), "")
        bron[entiteit] = tekst
        na = next((x for x in bron.values() if x), "")
        if na and na != voor and melden and (opnieuw or not voor):
            if wacht:
                self._later(sl, wacht, lambda: self._meld_als_nog(robot, soort, sleutel, na))
            else:
                self._meld_robot(robot, soort, sleutel, na)
        elif voor and not na:
            self._stop_wacht(sl)
            if sl in self._gemeld:
                self._gemeld.discard(sl)
                self.hass.async_create_task(self._wis_robot(robot, sleutel))

    @callback
    def _meld_robot(self, robot: str, soort: str, sleutel: str, tekst: str) -> None:
        self._gemeld.add((robot, sleutel))
        self.hass.async_create_task(self._stuur_robot(robot, soort, sleutel, tekst))

    @callback
    def _meld_als_nog(self, robot: str, soort: str, sleutel: str, tekst: str) -> None:
        """Na het wachten: alleen als de toestand nog precies zo is."""
        nu = next((x for x in self._meldt.get((robot, sleutel), {}).values() if x), "")
        if nu == tekst:
            self._meld_robot(robot, soort, sleutel, tekst)

    @callback
    def _later(self, sl: tuple[str, str], seconden: int, doe: Callable[[], None]) -> None:
        self._stop_wacht(sl)

        @callback
        def nu(_: Any) -> None:
            self._wacht.pop(sl, None)
            doe()

        self._wacht[sl] = async_call_later(self.hass, seconden, nu)

    @callback
    def _stop_wacht(self, sl: tuple[str, str]) -> None:
        if (weg := self._wacht.pop(sl, None)) is not None:
            weg()

    @callback
    def _klaar_zonder_taak(self, robot: str) -> None:
        st = self.hass.states.get(robot)
        if st is not None and st.state == "docked" and robot in self._bezig:
            self._bezig.discard(robot)
            self._klaar_straks(robot)

    @callback
    def _klaar_straks(self, robot: str) -> None:
        @callback
        def nu(_: Any) -> None:
            delen = {ro: e for e, (r, ro, _) in self._robot_rollen.items() if r == robot}
            oppervlak = self.hass.states.get(delen.get("oppervlak", ""))
            duur = self.hass.states.get(delen.get("duur", ""))
            tekst = stofzuiger.klaar_tekst(
                oppervlak.state if oppervlak else None, duur.state if duur else None, taal_van(self.hass)
            )
            self.hass.async_create_task(self._stuur_robot(robot, stofzuiger.SOORT_KLAAR, "klaar", tekst))

        self._uit.append(async_call_later(self.hass, 10, nu))

    def _ontvangers(self, melding: kaarten.Melding, soort: str | None, robot: str | None = None) -> list[str]:
        """Wie deze melding krijgt: aan, en (sinds 0.86.0) zelf gekozen.

        De kaart zegt wat er te kiezen is (`gebeurtenissen`); ieder kiest daar
        zelf uit, en uit de robots. Wie niets koos, krijgt alles.
        """
        if soort is not None and soort not in melding.gebeurtenissen:
            return []
        uit: list[str] = []
        for p in melding.personen:
            if not self.opslag.aan(melding.id, p):
                continue
            keuze = self.opslag.keuze(melding.id, p)
            if soort is not None and "gebeurtenissen" in keuze and soort not in keuze["gebeurtenissen"]:
                continue
            if robot is not None and "robots" in keuze and robot not in keuze["robots"]:
                continue
            uit.append(p)
        return uit

    async def _stuur_robot(
        self, robot: str, soort: str, sleutel: str, tekst: str, *, alleen: str | None = None, proef: bool = False
    ) -> dict[str, Any]:
        melding = self.meldingen.get(SOORT_STOFZUIGER)
        if melding is None or (robot not in melding.stofzuigers and not proef):
            return {"verstuurd": [], "zonder_telefoon": []}
        titel = robot_naam(self.hass, robot)
        if proef:
            titel = t(self.hass, "Proef · {titel}", titel=titel)
        data = {
            "tag": robot_tag(robot, "proef" if proef else sleutel),
            "group": "domotiapp-stofzuiger",
        }
        ontvangers = [alleen] if alleen is not None else self._ontvangers(melding, soort, robot)
        gelukt, zonder = await self._stuur(melding, ontvangers, {"title": titel, "message": tekst, "data": data})
        if ontvangers:
            _LOGGER.info("Stofzuigermelding %s (%s): %s", robot, sleutel, tekst)
        return {"verstuurd": gelukt, "zonder_telefoon": zonder, "titel": titel, "tekst": tekst}

    async def _wis_robot(self, robot: str, sleutel: str) -> None:
        melding = self.meldingen.get(SOORT_STOFZUIGER)
        if melding is None:
            return
        # `clear_notification` is een opdracht aan de app van Home Assistant.
        # De dienst voor proeven zonder telefoon (`notify.persistent_notification`,
        # zie CLAUDE.md) zou er een melding met die tekst van maken.
        ontvangers = [
            p for p in melding.personen if melding.diensten.get(p) != "persistent_notification"
        ]
        await self._stuur(
            melding,
            ontvangers,
            {"message": "clear_notification", "data": {"tag": robot_tag(robot, sleutel)}},
            stil=True,
        )

    async def _stuur(
        self, melding: kaarten.Melding, ontvangers: list[str], bericht: dict[str, Any], *, stil: bool = False
    ) -> tuple[list[str], list[str]]:
        gelukt: list[str] = []
        zonder: list[str] = []
        for persoon in ontvangers:
            dienst = melding.diensten.get(persoon) or telefoons.dienst_voor(self.hass, persoon)
            if not dienst:
                zonder.append(persoon)
                continue
            try:
                await self.hass.services.async_call("notify", dienst, bericht, blocking=True)
            except Exception as fout:  # noqa: BLE001 - één telefoon houdt de rest niet tegen
                if not stil:
                    _LOGGER.warning("Melding (%s) naar %s (%s) mislukte: %s", melding.soort, persoon, dienst, fout)
                zonder.append(persoon)
                continue
            gelukt.append(persoon)
        if zonder and not stil:
            _LOGGER.warning("Geen telefoon gevonden voor %s; die krijgt geen melding (%s)", ", ".join(zonder), melding.soort)
        return gelukt, zonder

    async def async_proef_stofzuiger(self, melding: kaarten.Melding, alleen: str | None) -> dict[str, Any]:
        """Een proef: "klaar" van de eerste robot, met de cijfers van zijn laatste beurt.

        Alleen naar `alleen`, net als de proef van afval; zonder persoon gaat er
        niets uit (de knop zit in de pop-up van een persoon).
        """
        if not melding.stofzuigers:
            return {"reden": t(self.hass, "Nog geen stofzuiger gekozen")}
        if alleen is None:
            return {"reden": t(self.hass, "Een proef gaat naar één persoon")}
        robot = melding.stofzuigers[0]
        per_rol = {rol: e for e, (rol, _) in robot_delen(self.hass, robot).items()}
        oppervlak = self.hass.states.get(per_rol.get("oppervlak", ""))
        duur = self.hass.states.get(per_rol.get("duur", ""))
        tekst = stofzuiger.klaar_tekst(
            oppervlak.state if oppervlak else None, duur.state if duur else None, taal_van(self.hass)
        )
        return await self._stuur_robot(robot, stofzuiger.SOORT_KLAAR, "klaar", tekst, alleen=alleen, proef=True)


    # ------------------------------------------------------------- de camera

    @callback
    def camera_regels(self) -> list[Any]:
        """De regels van de bewaking die aan staan: daaruit valt te kiezen."""
        regels = self.hass.data.get(DOMAIN, {}).get(BEWAKING_REGELS)
        return regels.actieve() if regels is not None else []

    @callback
    def camera_keuze(self, persoon: str) -> dict[str, Any]:
        """Wat deze persoon van de camera krijgt. Zie camera.py."""
        return camera.keuze(self.opslag, SOORT_CAMERA, persoon, self.camera_regels())

    @callback
    def camera_ontvangers(self, regel: Any, melder: str | None) -> list[str]:
        """Wie de melding van deze regel krijgt. De bewakingsmotor vraagt dit.

        Zonder meldingenkaart met `camera: true` de ontvangers van de
        camerakaart, zoals voor 0.109.0.
        """
        melding = self.meldingen.get(SOORT_CAMERA)
        if melding is None or melding.soort != SOORT_CAMERA:
            return list(regel.ontvangers)
        return camera.ontvangers(
            regel,
            melder,
            personen=melding.personen,
            opslag=self.opslag,
            melding=SOORT_CAMERA,
            regels=self.camera_regels(),
        )

    @callback
    def camera_diensten(self, regel: Any) -> dict[str, str]:
        """De telefoons uit de YAML: die van de meldingenkaart, aangevuld met die van de camera."""
        melding = self.meldingen.get(SOORT_CAMERA)
        return {**(regel.diensten or {}), **(melding.diensten if melding is not None else {})}

    async def async_proef_camera(self, melding: kaarten.Melding, alleen: str | None) -> dict[str, Any]:
        """Een proef: het laatste beeld van een camera die deze persoon krijgt.

        Alleen naar `alleen`, en met een eigen tag, zodat hij een echte melding
        op de telefoon niet vervangt. Is er nog geen beeld, dan gaat hij zonder.
        """
        regels = self.camera_regels()
        if not regels:
            return {"reden": t(self.hass, "Nog geen camera met snapshots en meldingen")}
        if alleen is None:
            return {"reden": t(self.hass, "Een proef gaat naar één persoon")}
        gekozen = self.camera_keuze(alleen)["cameras"] or camera.cameras(regels)
        index = self.hass.data.get(DOMAIN, {}).get(BEWAKING_INDEX)
        beelden = index.voor(gekozen, 1) if index is not None else []
        beeld = beelden[0] if beelden else None
        cam = beeld["camera"] if beeld else gekozen[0]
        st = self.hass.states.get(cam)
        naam = (st.attributes.get("friendly_name") if st else None) or cam
        titel = t(self.hass, "Proef · {titel}", titel=naam)
        tekst = (beeld or {}).get("naam") or t(self.hass, "Proefmelding van de camera")
        regel = next((r for r in regels if r.camera == cam), None)
        gelukt = await telefoons.async_stuur(
            self.hass,
            ontvangers=[alleen],
            diensten=self.camera_diensten(regel) if regel is not None else dict(melding.diensten),
            titel=titel,
            tekst=tekst,
            beeld_id=beeld["id"] if beeld else None,
            camera=cam,
            melder=PROEF,
        )
        return {
            "verstuurd": [alleen] if gelukt else [],
            "zonder_telefoon": [] if gelukt else [alleen],
            "titel": titel,
            "tekst": tekst,
        }

    # ------------------------------------------------------------ de garagedeur

    @callback
    def _garage(self) -> Melding | None:
        melding = self.meldingen.get(SOORT_GARAGE)
        return melding if melding is not None and melding.garage is not None else None

    @callback
    def _garage_open(self, melding: Melding) -> bool | None:
        st = self.hass.states.get(melding.garage.contact) if melding.garage.contact else None
        return garage.is_open(st.state) if st is not None else None

    @callback
    def _volg_garage(self) -> None:
        """Volg het contact van de kaart; opnieuw als het een ander is."""
        melding = self._garage()
        contact = melding.garage.contact if melding is not None else ""
        if contact == (self._garage_contact or "") and (self._garage_uit is not None or not contact):
            return
        if self._garage_uit is not None:
            self._garage_uit()
            self._garage_uit = None
        self._garage_contact = contact or None
        if not contact:
            return
        self._garage_uit = async_track_state_change_event(self.hass, [contact], self._garage_verandert)
        # Hoe staat hij NU? Na een herstart: open telt vanaf nu, als de opslag
        # niet weet sinds wanneer; dicht wist wat er nog op de telefoons stond.
        self._garage_toestand(self._garage_open(melding))

    @callback
    def _garage_verandert(self, event: Event) -> None:
        nieuw = event.data.get("new_state")
        if nieuw is not None:
            self._garage_toestand(garage.is_open(nieuw.state))

    @callback
    def _garage_toestand(self, open_: bool | None) -> None:
        """Het contact zegt open, dicht of niets (`unavailable`: dan blijft alles staan)."""
        stand = self.opslag.garage(SOORT_GARAGE)
        nu = dt_util.now().isoformat()
        if open_ is True and not stand.get("open_sinds"):
            self.opslag.zet_garage(SOORT_GARAGE, open_sinds=nu)
            self._meld(SOORT_GARAGE)
        elif open_ is False and (stand.get("open_sinds") or stand.get("gemeld") or stand.get("negeer_tot")):
            # Dicht, op welke manier ook: niets meer op de telefoons, en een
            # negeertijd vervalt. De volgende keer open begint weer vooraan.
            sluit = stand.get("sluit") or {}
            self.opslag.zet_garage(
                SOORT_GARAGE,
                open_sinds=None,
                gemeld=None,
                laatste_melding=None,
                negeer_tot=None,
                negeer_door=None,
                negeer_om=None,
                sluit=None,
                dicht_om=nu,
                dicht_door=sluit.get("door"),
            )
            if self._sluit_later is not None:
                self._sluit_later()
                self._sluit_later = None
            if stand.get("gemeld"):
                self.hass.async_create_task(self._wis_garage())
            self._meld(SOORT_GARAGE)

    async def _garage_tik(self, nu: datetime) -> None:
        melding = self._garage()
        if melding is None:
            return
        stand = self.opslag.garage(SOORT_GARAGE)
        # Een Sluiten van voor een herstart: de wekker is weg, dus de klok kijkt na.
        sluit = stand.get("sluit")
        if sluit and (om := _tijd(sluit.get("om"))) and nu - om >= timedelta(seconds=garage.SLUIT_CONTROLE + 30):
            await self._controleer_sluit()
            stand = self.opslag.garage(SOORT_GARAGE)
        open_ = self._garage_open(melding)
        if open_ is True and not stand.get("open_sinds"):
            self._garage_toestand(True)
            return
        wat = garage.volgende(stand, melding.garage, nu, open_ is True)
        if wat:
            await self._stuur_garage(melding, wat, nu)

    @callback
    def _is_android(self, dienst: str) -> bool:
        """Draait deze notify-dienst op Android? Dan passen er drie knoppen."""
        for entry in self.hass.config_entries.async_entries("mobile_app"):
            naam = entry.data.get("device_name")
            if naam and slugify(f"mobile_app_{naam}") == dienst:
                return str(entry.data.get("os_name") or "").lower() == "android"
        return False

    async def _stuur_garage(
        self, melding: Melding, wat: str, nu: datetime, *, alleen: str | None = None, proef: bool = False
    ) -> dict[str, Any]:
        inst = melding.garage
        stand = self.opslag.garage(melding.id)
        sinds = _tijd(stand.get("open_sinds")) or nu
        minuten = inst.minuten if proef else int((nu - sinds).total_seconds() // 60)
        taal = taal_van(self.hass)
        titel, tekst = garage.bericht(wat, inst.naam, minuten, taal, klok=inst.avond or "")
        if proef:
            titel = t(self.hass, "Proef · {titel}", titel=titel)
        tag = garage_tag("proef" if proef else melding.id)
        ontvangers = [alleen] if alleen is not None else [p for p in melding.personen if self.opslag.aan(melding.id, p)]
        gelukt: list[str] = []
        zonder: list[str] = []
        for persoon in ontvangers:
            dienst = melding.diensten.get(persoon) or telefoons.dienst_voor(self.hass, persoon)
            if not dienst:
                zonder.append(persoon)
                continue
            data: dict[str, Any] = {
                "tag": tag,
                "group": "domotiapp-garage",
                "actions": garage.knoppen(melding.id, inst, wat, taal, android=self._is_android(dienst), proef=proef),
            }
            if inst.pad:
                # `url` voor iOS, `clickAction` voor Android.
                data["url"] = data["clickAction"] = inst.pad
            try:
                await self.hass.services.async_call(
                    "notify", dienst, {"title": titel, "message": tekst, "data": data}, blocking=True
                )
            except Exception as fout:  # noqa: BLE001 - één telefoon houdt de rest niet tegen
                _LOGGER.warning("Garagemelding naar %s (%s) mislukte: %s", persoon, dienst, fout)
                zonder.append(persoon)
                continue
            gelukt.append(persoon)
        if zonder:
            _LOGGER.warning("Geen telefoon gevonden voor %s; die krijgt geen garagemelding", ", ".join(zonder))
        if not proef:
            velden: dict[str, Any] = {"gemeld": nu.isoformat(), "laatste_melding": wat}
            if wat == "na_negeer":
                velden.update(negeer_tot=None, negeer_door=None, negeer_om=None)
            if wat == "avond":
                velden["avond_gemeld"] = nu.date().isoformat()
            self.opslag.zet_garage(melding.id, **velden)
            _LOGGER.info("Garagemelding (%s): %s", wat, tekst)
            self._meld(melding.id)
        return {"verstuurd": gelukt, "zonder_telefoon": zonder, "titel": titel, "tekst": tekst}

    async def _wis_garage(self) -> None:
        """De melding van alle telefoons halen. Zie `_wis_robot` waarom niet bij de proefdienst."""
        melding = self._garage()
        if melding is None:
            return
        for persoon in melding.personen:
            if melding.diensten.get(persoon) == "persistent_notification":
                continue
            dienst = melding.diensten.get(persoon) or telefoons.dienst_voor(self.hass, persoon)
            if not dienst:
                continue
            try:
                await self.hass.services.async_call(
                    "notify", dienst, {"message": "clear_notification", "data": {"tag": garage_tag(melding.id)}}, blocking=False
                )
            except Exception as fout:  # noqa: BLE001
                _LOGGER.debug("Wissen bij %s lukte niet: %s", persoon, fout)

    async def async_garage_knop(self, ident: str, cmd: str, arg: str, user_id: str | None) -> dict[str, Any]:
        """Een knop in de melding, of dezelfde keuze op de kaart. Geeft terug wat er gebeurde."""
        melding = self._garage()
        if ident == "proef" or melding is None or melding.id != ident:
            # Een knop in een proefmelding doet niets.
            return {"gedaan": False}
        door = self._persoon_van(user_id)
        nu = dt_util.now()
        inst = melding.garage
        if cmd == garage.CMD_SLUIT:
            # Alleen een puls als het contact OPEN zegt: op een dichte deur zet
            # dezelfde puls hem juist open.
            if self._garage_open(melding) is not True:
                _LOGGER.info("Garagedeur: Sluiten door %s, maar het contact zegt niet open; niets gedaan", door or "onbekend")
                return {"gedaan": False, "reden": t(self.hass, "De deur staat niet open")}
            # Tijdens het sluiten zegt het contact nog open (gemeten: 18 s). Een
            # tweede puls in die tijd zet een pulsdeur halverwege stil, dus na
            # een Sluiten geen puls meer tot de controle geweest is. Twee
            # telefoons die vlak na elkaar tikken, of één die twee keer tikt.
            eerder = _tijd((self.opslag.garage(ident).get("sluit") or {}).get("om"))
            if eerder is not None and nu - eerder < timedelta(seconds=garage.SLUIT_CONTROLE):
                _LOGGER.info("Garagedeur: Sluiten door %s, maar hij gaat al dicht; niets gedaan", door or "onbekend")
                return {"gedaan": False, "reden": t(self.hass, "De deur gaat al dicht")}
            oproep = garage.bediening_oproep(inst.bediening)
            if oproep is None:
                return {"gedaan": False, "reden": t(self.hass, "Er is geen bediening gekozen")}
            # Vóór de puls in de opslag: een tweede tik die binnenkomt terwijl de
            # dienst nog loopt, ziet hem dan al.
            self.opslag.zet_garage(ident, sluit={"door": door, "om": nu.isoformat()})
            try:
                await self.hass.services.async_call(*oproep, blocking=True)
            except Exception as fout:  # noqa: BLE001
                _LOGGER.warning("Garagedeur sluiten (%s) mislukte: %s", inst.bediening, fout)
                self.opslag.zet_garage(ident, sluit=None)
                return {"gedaan": False, "reden": str(fout)}
            _LOGGER.info("Garagedeur: Sluiten door %s (%s.%s)", door or "onbekend", oproep[0], oproep[1])
            if self._sluit_later is not None:
                self._sluit_later()

            @callback
            def kijk(_: Any) -> None:
                self._sluit_later = None
                self.hass.async_create_task(self._controleer_sluit())

            self._sluit_later = async_call_later(self.hass, garage.SLUIT_CONTROLE, kijk)
        elif cmd in (garage.CMD_NEGEER, garage.CMD_MORGEN):
            if cmd == garage.CMD_MORGEN:
                tot = garage.morgen_moment(nu, inst.morgen)
            else:
                try:
                    minuten = int(arg)
                except ValueError:
                    return {"gedaan": False}
                if not 0 < minuten <= 7 * 24 * 60:
                    return {"gedaan": False}
                tot = nu + timedelta(minutes=minuten)
            self.opslag.zet_garage(ident, negeer_tot=tot.isoformat(), negeer_door=door, negeer_om=nu.isoformat())
            _LOGGER.info("Garagemelding genegeerd tot %s door %s", tot.isoformat(), door or "onbekend")
        elif cmd == "hervat":
            self.opslag.zet_garage(ident, negeer_tot=None, negeer_door=None, negeer_om=None)
        else:
            return {"gedaan": False}
        # Wie op een knop drukte, haalt de melding bij de anderen weg.
        if cmd != "hervat":
            await self._wis_garage()
        self._meld(ident)
        return {"gedaan": True}

    async def _controleer_sluit(self) -> None:
        """Na Sluiten: is hij dicht? Zo niet, dan een melding."""
        melding = self._garage()
        stand = self.opslag.garage(SOORT_GARAGE)
        if melding is None or not stand.get("sluit"):
            return
        self.opslag.zet_garage(SOORT_GARAGE, sluit=None)
        if self._garage_open(melding) is True:
            _LOGGER.warning("Garagedeur: na Sluiten staat het contact nog open")
            await self._stuur_garage(melding, "niet_dicht", dt_util.now())
        self._meld(SOORT_GARAGE)

    @callback
    def garage_stand(self) -> dict[str, Any] | None:
        """Wat de kaart van de garagedeur laat zien."""
        melding = self._garage()
        if melding is None:
            return None
        stand = self.opslag.garage(melding.id)
        negeer_tot = _tijd(stand.get("negeer_tot"))
        return {
            "contact": melding.garage.contact,
            "bediening": bool(melding.garage.bediening),
            "open": self._garage_open(melding),
            "open_sinds": stand.get("open_sinds"),
            "gemeld": stand.get("gemeld"),
            "negeer_tot": stand.get("negeer_tot") if negeer_tot and negeer_tot > dt_util.now() else None,
            "negeer_door": stand.get("negeer_door"),
            "sluit": stand.get("sluit"),
            "dicht_om": stand.get("dicht_om"),
            "dicht_door": stand.get("dicht_door"),
            "negeer": list(melding.garage.negeer),
            "minuten": melding.garage.minuten,
        }

    # ------------------------------------------------------------------ de auto

    @callback
    def _volg_auto(self) -> None:
        """Volg de auto's van de kaart: de berichten, en de laadstatus, stekker en accu van hetzelfde apparaat.

        Opnieuw als het andere entiteiten zijn. Daarna kijken wat er nu staat: wat er tijdens een herstart binnenkwam.
        """
        melding = self.meldingen.get(SOORT_AUTO)
        rollen: dict[str, tuple[str, str]] = {}
        for sensor in melding.autos if melding is not None else []:
            rollen[sensor] = (sensor, "berichten")
            for rol, eid in auto_delen(self.hass, sensor).items():
                rollen[eid] = (sensor, rol)
        sensoren = tuple(sorted(rollen))
        if sensoren == self._auto_sensoren and (self._auto_uit is not None or not sensoren):
            return
        if self._auto_uit is not None:
            self._auto_uit()
            self._auto_uit = None
        self._auto_sensoren = sensoren
        self._auto_rollen = rollen
        if not sensoren:
            return
        self._auto_uit = async_track_state_change_event(self.hass, list(sensoren), self._auto_verandert)
        for sensor in melding.autos:
            if (st := self.hass.states.get(sensor)) is not None:
                self._auto_berichten(sensor, None, st)
            self._auto_laden(sensor)

    @callback
    def _auto_verandert(self, event: Event) -> None:
        nieuw = event.data.get("new_state")
        if nieuw is None or (wat := self._auto_rollen.get(event.data["entity_id"])) is None:
            return
        sensor, rol = wat
        if rol == "berichten":
            self._auto_berichten(sensor, event.data.get("old_state"), nieuw)
        else:
            self._auto_laden(sensor)

    @callback
    def _auto_staat(self, sensor: str, rol: str) -> str | None:
        eid = next((e for e, (s, r) in self._auto_rollen.items() if s == sensor and r == rol), None)
        st = self.hass.states.get(eid) if eid else None
        return st.state if st is not None else None

    @callback
    def _auto_laden(self, sensor: str) -> None:
        """Laadt hij, is hij gestopt, is de accu laag? Alleen de stand in de opslag; versturen doet `_auto_tik`.

        `unavailable` verandert niets: elke ochtend om 07:00 staat alles een paar tellen zo. De laadstatus van Ford
        verandert elke paar minuten van attributen; wat er al zo staat, wordt niet opnieuw gezet of gewist.
        """
        laden = auto.laad_stand(self._auto_staat(sensor, "laden"))
        stekker = auto.stekker_erin(self._auto_staat(sensor, "stekker"))
        pct = auto.procent(self._auto_staat(sensor, "accu"))
        stand = self.opslag.auto_laden(sensor)
        nu = dt_util.now().isoformat()
        velden: dict[str, Any] = {}
        wis: list[str] = []
        if laden == "laadt":
            velden.update(laadt=True, gestopt_om=None, laden_op_telefoon=None, accu_op_telefoon=None)
            # Hij laadt (weer): wat er over klaar of laag op de telefoons stond, klopt niet meer.
            wis += [s for s, k in (("laden", "laden_op_telefoon"), ("accu", "accu_op_telefoon")) if stand.get(k)]
        elif stekker is False or laden == "los":
            # De stekker is eruit: iemand heeft hem gehaald, en weet dus dat hij klaar is.
            velden.update(laadt=None, gestopt_om=None, laden_op_telefoon=None)
            wis += ["laden"] if stand.get("laden_op_telefoon") else []
        elif laden in ("aan", "klaar") and stand.get("laadt"):
            velden.update(laadt=None, gestopt_om=nu)
        if pct is not None:
            melding = self.meldingen.get(SOORT_AUTO)
            grens = melding.accu_grens if melding is not None else auto.ACCU_GRENS
            aan_lader = laden in ("laadt", "aan", "klaar") or stekker is True
            if pct >= grens + auto.ACCU_MARGE:
                velden.update(laag_sinds=None, laag_gemeld=None, accu_op_telefoon=None)
                wis += ["accu"] if stand.get("accu_op_telefoon") and "accu" not in wis else []
            elif pct < grens and not aan_lader:
                if not stand.get("laag_sinds") and not stand.get("laag_gemeld"):
                    velden.update(laag_sinds=nu)
            else:
                velden.update(laag_sinds=None)
        if wis:
            self.hass.async_create_task(self._wis_auto_tags(sensor, wis))
        if velden and self.opslag.zet_auto_laden(sensor, **velden):
            self._meld(SOORT_AUTO)

    async def _auto_tik(self, nu: datetime) -> None:
        """Elke minuut: is een auto lang genoeg gestopt met laden, of lang genoeg laag? Dan de melding.

        Eerst opnieuw zoeken welke sensoren er op de auto staan. Na een herstart laadt de integratie van de auto vaak
        NA deze: dan stonden laadstatus, stekker en accu er bij het eerste zoeken nog niet. Gemeten in de testinstance
        op 27 november 2026. Is er niets veranderd, dan doet `_volg_auto` niets.
        """
        melding = self.meldingen.get(SOORT_AUTO)
        if melding is None:
            return
        self._volg_auto()
        taal = taal_van(self.hass)
        for sensor in melding.autos:
            stand = self.opslag.auto_laden(sensor)
            pct = auto.procent(self._auto_staat(sensor, "accu"))
            gestopt = _tijd(stand.get("gestopt_om"))
            if gestopt is not None and nu - gestopt >= timedelta(minutes=auto.LADEN_WACHT):
                self.opslag.zet_auto_laden(sensor, gestopt_om=None, laden_op_telefoon=True)
                if "laden" in melding.gebeurtenissen:
                    titel, tekst = auto.laden_melding(auto_naam(self.hass, sensor), pct, taal)
                    await self._stuur_auto_stand(melding, sensor, "laden", titel, tekst)
            laag = _tijd(stand.get("laag_sinds"))
            if laag is not None and nu - laag >= timedelta(minutes=auto.ACCU_WACHT):
                if pct is None or pct >= melding.accu_grens:
                    self.opslag.zet_auto_laden(sensor, laag_sinds=None)
                    continue
                self.opslag.zet_auto_laden(sensor, laag_sinds=None, laag_gemeld=True, accu_op_telefoon=True)
                if "accu" in melding.gebeurtenissen:
                    titel, tekst = auto.accu_melding(auto_naam(self.hass, sensor), pct, taal)
                    await self._stuur_auto_stand(melding, sensor, "accu", titel, tekst)

    async def _stuur_auto_stand(
        self, melding: Melding, sensor: str, soort: str, titel: str, tekst: str, *, alleen: str | None = None
    ) -> dict[str, Any]:
        """Laden klaar of accu laag: één regel per auto en per soort, een nieuwe vervangt de vorige."""
        data: dict[str, Any] = {"tag": auto_tag(sensor, "proef" if alleen else soort), "group": "domotiapp-auto"}
        if melding.pad:
            data["url"] = data["clickAction"] = melding.pad
        ontvangers = [alleen] if alleen is not None else self._ontvangers(melding, soort)
        gelukt, zonder = await self._stuur(melding, ontvangers, {"title": titel, "message": tekst, "data": data})
        if ontvangers and alleen is None:
            _LOGGER.info("Automelding %s (%s): %s", sensor, soort, tekst)
        return {"verstuurd": gelukt, "zonder_telefoon": zonder, "titel": titel, "tekst": tekst}

    async def _wis_auto_tags(self, sensor: str, soorten: list[str]) -> None:
        melding = self.meldingen.get(SOORT_AUTO)
        if melding is None:
            return
        ontvangers = [p for p in melding.personen if melding.diensten.get(p) != "persistent_notification"]
        for s in soorten:
            await self._stuur(
                melding, ontvangers, {"message": "clear_notification", "data": {"tag": auto_tag(sensor, s)}}, stil=True
            )

    @callback
    def _auto_berichten(self, sensor: str, oud: Any, nieuw: Any) -> None:
        """Nieuwe berichten melden, weggehaalde van de telefoons halen.

        Een sensor die voor het eerst gelezen wordt, meldt niets: wat er dan staat is oud nieuws, en anders
        krijgt het hele huis bij het aanzetten acht keer de bandenspanning. `unavailable` verandert niets.
        """
        platform = auto_platform(self.hass, sensor)
        nu_lijst = auto.berichten(platform, nieuw.state, dict(nieuw.attributes))
        if nu_lijst is None:
            return
        sleutels = [b["sleutel"] for b in nu_lijst]
        gezien = self.opslag.auto_gezien(sensor)
        if gezien is None:
            _LOGGER.info("Autoberichten %s: voor het eerst gelezen, %d bericht(en) staan er al", sensor, len(sleutels))
            self.opslag.zet_auto_gezien(sensor, sleutels, auto.GEZIEN_MAX)
        else:
            al = set(gezien)
            nieuwe = [b for b in nu_lijst if b["sleutel"] not in al]
            if nieuwe:
                # Eerst in de opslag, dan versturen: een herstart halverwege meldt liever niets dan dubbel.
                self.opslag.zet_auto_gezien(sensor, gezien + [b["sleutel"] for b in reversed(nieuwe)], auto.GEZIEN_MAX)
                self.hass.async_create_task(self._stuur_auto(sensor, nieuwe))
        oud_lijst = auto.berichten(platform, oud.state, dict(oud.attributes)) if oud is not None else None
        if oud_lijst:
            weg = {b["sleutel"] for b in oud_lijst} - set(sleutels)
            if weg:
                self.hass.async_create_task(self._wis_auto(sensor, sorted(weg)))
        self._meld(SOORT_AUTO)

    async def _stuur_auto(
        self, sensor: str, nieuwe: list[dict[str, Any]], *, alleen: str | None = None, proef: bool = False
    ) -> dict[str, Any]:
        melding = self.meldingen.get(SOORT_AUTO)
        if melding is None or (sensor not in melding.autos and not proef):
            return {"verstuurd": [], "zonder_telefoon": []}
        naam = auto_naam(self.hass, sensor)
        taal = taal_van(self.hass)
        # Eén melding per bericht, met zijn eigen tag; vanaf `SAMEN_VANAF` één melding met het aantal.
        groepen = [nieuwe] if len(nieuwe) >= auto.SAMEN_VANAF else [[b] for b in reversed(nieuwe)]
        ontvangers = [alleen] if alleen is not None else self._ontvangers(melding, "berichten")
        gelukt: list[str] = []
        zonder: list[str] = []
        titel = tekst = ""
        for groep in groepen:
            titel, tekst = auto.melding(naam, groep, taal)
            if proef:
                titel = t(self.hass, "Proef · {titel}", titel=titel)
            data: dict[str, Any] = {
                "tag": auto_tag(sensor, "proef" if proef else (groep[0]["sleutel"] if len(groep) == 1 else "samen")),
                "group": "domotiapp-auto",
            }
            if melding.pad:
                # `url` voor iOS, `clickAction` voor Android.
                data["url"] = data["clickAction"] = melding.pad
            gelukt, zonder = await self._stuur(melding, ontvangers, {"title": titel, "message": tekst, "data": data})
        if ontvangers and not proef:
            _LOGGER.info("Automelding %s: %d nieuw bericht(en)", sensor, len(nieuwe))
        return {"verstuurd": gelukt, "zonder_telefoon": zonder, "titel": titel, "tekst": tekst}

    async def _wis_auto(self, sensor: str, sleutels: list[str]) -> None:
        """Weggehaalde berichten van de telefoons. Zie `_wis_robot` waarom niet bij de proefdienst."""
        melding = self.meldingen.get(SOORT_AUTO)
        if melding is None:
            return
        ontvangers = [p for p in melding.personen if melding.diensten.get(p) != "persistent_notification"]
        for s in [*sleutels, "samen"]:
            await self._stuur(
                melding, ontvangers, {"message": "clear_notification", "data": {"tag": auto_tag(sensor, s)}}, stil=True
            )

    async def async_proef_auto(self, melding: Melding, alleen: str | None) -> dict[str, Any]:
        """Een proef: het nieuwste bericht van de eerste auto, of een voorbeeld als er geen is."""
        if not melding.autos:
            return {"reden": t(self.hass, "Nog geen auto gekozen")}
        if alleen is None:
            return {"reden": t(self.hass, "Een proef gaat naar één persoon")}
        sensor = melding.autos[0]
        st = self.hass.states.get(sensor)
        lijst = auto.berichten(auto_platform(self.hass, sensor), st.state, dict(st.attributes)) if st is not None else None
        if not lijst:
            lijst = [{
                "sleutel": "proef",
                "onderwerp": t(self.hass, "Een bericht van de auto"),
                "tekst": t(self.hass, "Zo ziet een bericht van de auto eruit."),
                "datum": None,
                "gelezen": None,
            }]
        return await self._stuur_auto(sensor, lijst[:1], alleen=alleen, proef=True)


def auto_tag(sensor: str, sleutel: str) -> str:
    """Eén regel per bericht: als het bericht verdwijnt, gaat de melding mee."""
    return f"domotiapp-auto-{sensor.split('.', 1)[-1]}-{slugify(sleutel)}"


def auto_delen(hass: HomeAssistant, sensor: str) -> dict[str, str]:
    """Laadstatus, stekker en accu op het apparaat van deze berichtensensor: rol -> entiteit.

    Op APPARAAT, platform en de `translation_key` van het merk (`MERKEN` in auto.py), net als `robot_delen`. Een
    uitgeschakelde entiteit telt niet.
    """
    reg = er.async_get(hass)
    eigen = reg.async_get(sensor)
    merk = auto.MERKEN.get(eigen.platform) if eigen is not None else None
    if merk is None or not eigen.device_id:
        return {}
    zoek = {tk: rol for rol, tk in (("laden", merk.laden), ("stekker", merk.stekker), ("accu", merk.accu)) if tk}
    uit: dict[str, str] = {}
    for e in er.async_entries_for_device(reg, eigen.device_id):
        if e.platform == eigen.platform and e.disabled_by is None and (rol := zoek.get(str(e.translation_key or ""))):
            uit[rol] = e.entity_id
    return uit


def auto_platform(hass: HomeAssistant, sensor: str) -> str | None:
    """Het merk van deze berichtensensor: de integratie erachter. Zie `MERKEN` in auto.py."""
    reg = er.async_get(hass).async_get(sensor)
    return reg.platform if reg is not None else None


def auto_naam(hass: HomeAssistant, sensor: str) -> str:
    """De naam van de auto: het APPARAAT, niet de sensor (die heet "Berichten")."""
    reg = er.async_get(hass).async_get(sensor)
    if reg is not None and reg.device_id and (apparaat := dr.async_get(hass).async_get(reg.device_id)) is not None:
        naam = (apparaat.name_by_user or apparaat.name or "").strip()
        if naam:
            return naam
    st = hass.states.get(sensor)
    naam = " ".join(str(st.attributes.get("friendly_name") or "").split()) if st else ""
    return naam or sensor


def garage_tag(ident: str) -> str:
    """Eén regel per garagemelding: een herinnering vervangt de vorige."""
    return f"domotiapp-garage-{ident}"


def _tijd(waarde: Any) -> datetime | None:
    try:
        return datetime.fromisoformat(str(waarde)) if waarde else None
    except ValueError:
        return None


def robot_tag(robot: str, sleutel: str) -> str:
    """Eén regel per robot en per ding: een nieuwe storing vervangt de vorige."""
    return f"domotiapp-stofzuiger-{robot.split('.', 1)[-1]}-{sleutel}"


def robot_naam(hass: HomeAssistant, robot: str) -> str:
    """De naam van het apparaat, zoals op de stofzuigerkaart (`naamVan`)."""
    reg = er.async_get(hass).async_get(robot)
    if reg is not None:
        if reg.name:
            return reg.name
        if reg.device_id and (apparaat := dr.async_get(hass).async_get(reg.device_id)) is not None:
            naam = (apparaat.name_by_user or apparaat.name or "").strip()
            if naam:
                return naam
    st = hass.states.get(robot)
    naam = " ".join(str(st.attributes.get("friendly_name") or "").split()) if st else ""
    return naam or robot


def robot_delen(hass: HomeAssistant, robot: str) -> dict[str, tuple[str, str]]:
    """De sensoren van hetzelfde apparaat met een rol: entiteit -> (rol, translation_key).

    Op APPARAAT en `translation_key`, net als `stofzuigerDelen` op de kaart.
    Een uitgeschakelde entiteit telt niet. Een onderhoudsonderdeel is een
    sensor `<onderdeel>_left` in procenten.
    """
    reg = er.async_get(hass)
    eigen = reg.async_get(robot)
    if eigen is None or not eigen.device_id:
        return {}
    uit: dict[str, tuple[str, str]] = {}
    for e in er.async_entries_for_device(reg, eigen.device_id):
        if e.entity_id == robot or e.domain != "sensor" or e.disabled_by is not None:
            continue
        tk = str(e.translation_key or "")
        if rol := stofzuiger.ROLLEN.get(tk):
            uit[e.entity_id] = (rol, tk)
            continue
        if stofzuiger.ONDERHOUD.match(tk) and not tk.endswith("_time_left"):
            st = hass.states.get(e.entity_id)
            eenheid = (st.attributes.get("unit_of_measurement") if st else None) or e.unit_of_measurement
            if eenheid == "%":
                uit[e.entity_id] = ("onderhoud", tk)
    return uit


def _is_agenda(bron: str) -> bool:
    return bron.startswith("calendar.")
