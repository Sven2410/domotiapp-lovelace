"""De klok die de regels uitvoert, en de vakantiemodus.

## De klok

Elke minuut kijkt de motor welke momenten er zijn geweest sinds de vorige keer
(`laatst`). Een herstart is daarmee geen apart geval: de eerste keer na het
opstarten is alleen een langer stuk. Zonsondergang 18:40, Home Assistant terug om
19:10: de lampen gaan alsnog aan.

Het zet NIET neer wat er volgens de regel nu zou moeten. Wie om 20:00 de lamp zelf
uitdeed en om 21:00 een herstart kreeg, wil niet dat hij weer aangaat. Alleen wat
echt gemist is, wordt ingehaald.

## De vakantiemodus

Keuze van de eigenaar, 31 oktober 2026: staat hij aan, dan pauzeren de gewone
regels en draaien alleen de vakantieregels. Het omgekeerde net zo.

Een regel die zijn lamp al aan zette, doet zijn UIT wel (`brandt`). Anders blijft
de lamp de hele vakantie branden als iemand om 20:00 de deur uit gaat, terwijl de
regel om 23:00 uit had gemoeten. Een lamp die iemand anders aan zette, blijft er
af: de uit van een gepauzeerde regel hoort de lamp van een vakantieregel niet uit
te doen.

## Een gekoppelde vakantiestand

Heeft de klant al een eigen stand (`vakantie_entiteit` in de kaartconfig), dan
volgt de motor die, en gaat een schakeling door naar die entiteit. De eigen
schakelaar blijft bestaan en zegt hetzelfde, zodat er één waarheid is. Is de
gekoppelde entiteit even niet bereikbaar, dan geldt de laatst bekende stand.
"""

from __future__ import annotations

from collections.abc import Callable
from datetime import datetime, timedelta
import logging
from typing import Any

from homeassistant.const import EVENT_HOMEASSISTANT_STOP, STATE_OFF, STATE_ON
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
    async_track_time_change,
    async_track_time_interval,
)
from homeassistant.helpers.start import async_at_started
from homeassistant.util import dt as dt_util

from ..meldingen import kaarten as dashboards
from . import regels as regelmaker
from .const import (
    HERLEES_INTERVAL_MIN,
    INHAAL_AAN_UUR,
    INHAAL_NA_SEC,
    INHAAL_UIT_UUR,
    KAART_TYPE,
    KOPPEL_DOMEINEN,
)
from .store import AutomatiseringOpslag

_LOGGER = logging.getLogger(__name__)

EVENT_LOVELACE_UPDATED = "lovelace_updated"


def lampen_uit(kaart: dict[str, Any]) -> list[str]:
    """De lampen op deze kaart: een entity_id of `{entity, name}`."""
    uit: list[str] = []
    for item in kaart.get("lampen") or []:
        ident = item.get("entity") if isinstance(item, dict) else item
        if isinstance(ident, str) and ident.startswith("light.") and ident not in uit:
            uit.append(ident)
    return uit


class Motor:
    """Leest de kaarten en voert de regels uit."""

    def __init__(self, hass: HomeAssistant, opslag: AutomatiseringOpslag, meld: Callable[[], None]) -> None:
        self.hass = hass
        self.opslag = opslag
        self._meld = meld
        # Wat een regel mag noemen: de lampen van alle kaarten samen.
        self.toegestaan: set[str] = set()
        self.gekoppeld: str | None = None
        self._uit: list[CALLBACK_TYPE] = []
        self._koppeling_uit: CALLBACK_TYPE | None = None
        self._klaar = False
        self._volgers: list[Callable[[], None]] = []

    async def async_start(self) -> None:
        await self.async_herlees()
        self._uit.append(async_track_time_change(self.hass, self._tik, second=0))
        self._uit.append(
            async_track_time_interval(self.hass, self._herlees_tik, timedelta(minutes=HERLEES_INTERVAL_MIN))
        )
        self._uit.append(self.hass.bus.async_listen(EVENT_LOVELACE_UPDATED, self._herlees_tik))
        self._uit.append(self.hass.bus.async_listen(EVENT_HOMEASSISTANT_STOP, self._bij_stop))
        self._uit.append(async_at_started(self.hass, self._gestart))

    @callback
    def async_stop(self) -> None:
        while self._uit:
            self._uit.pop()()
        self._koppel_los()

    @callback
    def _gestart(self, _hass: HomeAssistant) -> None:
        """Pas na het opstarten inhalen: daarvoor bestaan de lampen nog niet allemaal."""

        @callback
        def nu(_: datetime) -> None:
            self._klaar = True
            self._neem_koppeling_over()
            self._tik(dt_util.utcnow())

        self._uit.append(async_call_later(self.hass, INHAAL_NA_SEC, nu))

    async def _bij_stop(self, _event: Event) -> None:
        """Tot hier is de klok gekomen; wat hierna valt, wordt straks ingehaald."""
        if self._klaar:
            self.opslag.zet_laatst(dt_util.utcnow(), bewaar=False)
            await self.opslag.async_schrijf_nu()

    # ---------------------------------------------------------------- de kaarten

    async def async_herlees(self) -> None:
        gelezen = await dashboards.async_lees_kaarten(self.hass, KAART_TYPE)
        self.toegestaan = {lamp for _, kaart in gelezen for lamp in lampen_uit(kaart)}
        koppel = next(
            (
                str(kaart["vakantie_entiteit"])
                for _, kaart in gelezen
                if str(kaart.get("vakantie_entiteit") or "").split(".")[0] in KOPPEL_DOMEINEN
            ),
            None,
        )
        if koppel != self.gekoppeld:
            self._koppel(koppel)
        self._meld()

    async def _herlees_tik(self, _: Any = None) -> None:
        await self.async_herlees()

    # ----------------------------------------------------------------- de klok

    @callback
    def _tik(self, _nu: datetime) -> None:
        if not self._klaar:
            return
        nu = dt_util.utcnow()
        # Een eerste start heeft geen geschiedenis: dan begint de klok nu, en
        # voert hij niets van vanmorgen alsnog uit.
        van = self.opslag.laatst or nu
        van = max(van, nu - timedelta(hours=INHAAL_UIT_UUR))
        self.opslag.zet_laatst(nu, bewaar=self.opslag.laatst is None)
        for regel in self.opslag.regels:
            if not regel.get("actief", True):
                continue
            if (gevonden := regelmaker.laatste_tussen(self.hass, regel, van, nu)) is None:
                continue
            op, wat = gevonden
            if wat == "aan" and nu - op > timedelta(hours=INHAAL_AAN_UUR):
                _LOGGER.info("Regel %s: aan van %s is te lang geleden om in te halen", regel["id"], op)
                continue
            self._voer_uit(regel, wat)

    @callback
    def _voer_uit(self, regel: dict[str, Any], wat: str) -> None:
        # De groep van de regel moet de groep zijn die nu geldt; zie de kop.
        geldt = bool(regel.get("vakantie")) == self.vakantie
        if not geldt and not (wat == "uit" and self.opslag.brandt(regel["id"])):
            return
        # Nog een keer getoetst: de eigenaar kan een lamp uit de kaart gehaald
        # hebben nadat de regel gemaakt is.
        lampen = [lamp for lamp in regel["lampen"] if lamp in self.toegestaan]
        if not lampen:
            return
        self.opslag.zet_brandt(regel["id"], wat == "aan")
        # Elke uitvoering legt de klok vast; zie de kop van store.py.
        self.opslag.zet_laatst(dt_util.utcnow())
        data: dict[str, Any] = {"entity_id": lampen}
        if wat == "aan" and regel.get("helderheid") is not None:
            data["brightness_pct"] = regel["helderheid"]
        _LOGGER.debug("Regel %s: %s %s", regel["id"], wat, lampen)
        self.hass.async_create_task(self._roep_aan("turn_on" if wat == "aan" else "turn_off", data))

    async def _roep_aan(self, dienst: str, data: dict[str, Any]) -> None:
        try:
            await self.hass.services.async_call("light", dienst, data, blocking=True)
        except Exception as fout:  # noqa: BLE001 - één kapotte lamp houdt de klok niet tegen
            _LOGGER.warning("Automatisering: light.%s op %s mislukte: %s", dienst, data["entity_id"], fout)

    # ------------------------------------------------------------ na een wijziging

    @callback
    def regels_gewijzigd(self) -> None:
        """De klok gaat naar nu: een moment van vóór deze wijziging telt niet meer.

        Anders gaat een lamp meteen aan na het maken van een regel met een tijd
        van een uur geleden, en dat ook nog pas na de eerstvolgende herstart.
        """
        self.opslag.zet_laatst(dt_util.utcnow())
        self._meld()

    # --------------------------------------------------------------- de vakantie

    @property
    def vakantie(self) -> bool:
        return self.opslag.vakantie

    @callback
    def volg(self, volger: Callable[[], None]) -> CALLBACK_TYPE:
        """Voor de schakelaar: laat weten als de stand verandert."""
        self._volgers.append(volger)

        @callback
        def stop() -> None:
            self._volgers.remove(volger)

        return stop

    @callback
    def _zet_stand(self, aan: bool) -> None:
        if aan == self.opslag.vakantie:
            return
        self.opslag.zet_vakantie(aan)
        self.regels_gewijzigd()
        for volger in list(self._volgers):
            volger()

    async def async_zet_vakantie(self, aan: bool) -> None:
        """Vanaf de kaart of de schakelaar. Een gekoppelde stand schakelt mee."""
        self._zet_stand(aan)
        if self.gekoppeld and self.hass.states.get(self.gekoppeld) is not None:
            await self.hass.services.async_call(
                "homeassistant", "turn_on" if aan else "turn_off", {"entity_id": self.gekoppeld}, blocking=True
            )

    @callback
    def _koppel(self, ident: str | None) -> None:
        self._koppel_los()
        self.gekoppeld = ident
        if ident is None:
            return

        @callback
        def veranderd(event: Event) -> None:
            nieuw = event.data.get("new_state")
            if nieuw is not None and nieuw.state in (STATE_ON, STATE_OFF):
                self._zet_stand(nieuw.state == STATE_ON)

        self._koppeling_uit = async_track_state_change_event(self.hass, [ident], veranderd)
        if self._klaar:
            self._neem_koppeling_over()

    @callback
    def _koppel_los(self) -> None:
        if self._koppeling_uit is not None:
            self._koppeling_uit()
            self._koppeling_uit = None

    @callback
    def _neem_koppeling_over(self) -> None:
        if self.gekoppeld and (st := self.hass.states.get(self.gekoppeld)) is not None:
            if st.state in (STATE_ON, STATE_OFF):
                self._zet_stand(st.state == STATE_ON)
