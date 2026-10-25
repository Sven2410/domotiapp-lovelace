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
"""

from __future__ import annotations

from collections.abc import Callable
from datetime import date, datetime, timedelta
import logging
from typing import Any

from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
    async_track_time_change,
    async_track_time_interval,
)
from homeassistant.util import dt as dt_util

from ..bewaking import meldingen as telefoons
from ..taal import t, taal_van
from . import afval, kaarten, stofzuiger
from .const import (
    ACTIE_BUITEN,
    EVENT_ACTIE,
    HERLEES_INTERVAL_MIN,
    MOMENT_VANDAAG,
    MOMENTEN,
    SOORT_AFVAL,
    SOORT_STOFZUIGER,
)
from .kaarten import Melding
from .store import MeldingOpslag

_LOGGER = logging.getLogger(__name__)

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

    async def async_herlees(self) -> None:
        gelezen = await kaarten.async_lees_kaarten(self.hass)
        self._onthoud_wijzigingen(gelezen)
        self.meldingen = kaarten.voeg_samen(gelezen, self.opslag.alle_leidend())
        self._volg_stofzuigers()
        self._meld(None)

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
        if melding.soort != SOORT_AFVAL:
            return {"reden": t(self.hass, "Deze melding staat op geen enkel opgeslagen dashboard")}

        vandaag = nu.date()
        ophaaldag = vandaag if moment == MOMENT_VANDAAG else vandaag + timedelta(days=1)

        sensor = melding.sensoren.get(moment)
        namen: list[str] = []
        if sensor and (st := self.hass.states.get(sensor)) is not None:
            namen = afval.soorten(st.state)
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

        if alleen is not None:
            # Wie de proef vraagt, wil hem krijgen, ook met het vinkje uit.
            ontvangers = [alleen]
        else:
            ontvangers = [p for p in melding.personen if self.opslag.aan(ident, p)]
        gelukt: list[str] = []
        zonder: list[str] = []
        for persoon in ontvangers:
            dienst = melding.diensten.get(persoon) or telefoons.dienst_voor(self.hass, persoon)
            if not dienst:
                zonder.append(persoon)
                continue
            try:
                await self.hass.services.async_call(
                    "notify", dienst, {"title": titel, "message": tekst, "data": data}, blocking=True
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
        # Uit `unavailable` of `unknown` is een robot die (weer) verbindt: wat
        # er dan staat, wordt onthouden maar niet gemeld.
        melden = stofzuiger.heeft_waarde(ov)
        taal = taal_van(self.hass)

        if rol == "stofzuiger":
            if nv in stofzuiger.STOFZUIGER_BEZIG:
                self._bezig.add(robot)
            elif nv == "docked" and robot in self._bezig:
                self._bezig.discard(robot)
                if not self._rol_van(robot, "taak"):
                    self._klaar_straks(robot)
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
            self._toestand(robot, stofzuiger.SOORT_STATION, sleutel, eid, tekst, melden)
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
    ) -> None:
        """Een toestand die begint, verandert of ophoudt.

        Twee entiteiten kunnen dezelfde sleutel delen (de schoonwatertank en de
        waterwaarschuwing): de melding staat aan zolang een van beide iets zegt.
        `opnieuw` is of een ANDERE tekst bij een toestand die al liep een nieuwe
        melding is (een andere storing wel, een onderdeel van 8 naar 7 % niet).
        """
        bron = self._meldt.setdefault((robot, sleutel), {})
        voor = next((x for x in bron.values() if x), "")
        bron[entiteit] = tekst
        na = next((x for x in bron.values() if x), "")
        if na and na != voor and melden and (opnieuw or not voor):
            self.hass.async_create_task(self._stuur_robot(robot, soort, sleutel, na))
        elif voor and not na:
            self.hass.async_create_task(self._wis_robot(robot, sleutel))

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

    def _ontvangers(self, melding: kaarten.Melding, soort: str | None) -> list[str]:
        if soort is not None and soort not in melding.gebeurtenissen:
            return []
        return [p for p in melding.personen if self.opslag.aan(melding.id, p)]

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
        ontvangers = [alleen] if alleen is not None else self._ontvangers(melding, soort)
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
                    _LOGGER.warning("Stofzuigermelding naar %s (%s) mislukte: %s", persoon, dienst, fout)
                zonder.append(persoon)
                continue
            gelukt.append(persoon)
        if zonder and not stil:
            _LOGGER.warning("Geen telefoon gevonden voor %s; die krijgt geen stofzuigermelding", ", ".join(zonder))
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
