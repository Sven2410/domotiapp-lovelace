"""Een ruimte boeken en weer vrijgeven (16 oktober 2026).

Gevraagd op 16 oktober 2026: *"kunnen we iets maken voor een planning van
ruimtes. (...) een spreekruimte kleine vergader ruimte etc etc?"* De keuzes van
de eigenaar:

- de boekingen staan in Home Assistant zelf, in een agenda per ruimte (een
  Lokale agenda). Zo staan ze ook in de agenda van Home Assistant en in de app,
  en kan een automatisering erop reageren;
- op het scherm alleen vrij of bezet en de tijd, nooit een naam of een
  onderwerp: in een wachtkamer kijken bezoekers mee;
- boeken in het beheer, en op de iPad zelf *"maar dat toevoegen moet dan wel
  eerst met een ingestelde code die de medewerkers krijgen"*.

## Lezen gaat hier NIET langs

Scherm en beheer abonneren zich zelf op de agenda's met `calendar/event/subscribe`
van Home Assistant (er sinds 2026.8, onze ondergrens). Dat bericht komt binnen
zodra een agenda iets wegschrijft, ook als iemand in de agenda van Home
Assistant zelf een boeking verplaatst.

## Boeken en vrijgeven wel

- **De code.** De server controleert hem, zodat hij nooit naar de iPad hoeft.
  Wie te vaak een verkeerde geeft, wacht even (`CODE_POGINGEN`, `CODE_WACHT`).
- **Dubbel boeken.** Twee mensen die tegelijk op Boeken drukken krijgen niet
  allebei de ruimte: nakijken en wegschrijven gebeuren onder één slot.
- **Het spoor.** In de omschrijving van de afspraak staat waar en door wie er
  geboekt is.

De code geldt voor alles wat het SCHERM vraagt, ook als het account dat de
iPad gebruikt geen kioskaccount is (bij een klant zonder kioskaccount is het
gewoon een gebruiker). Een kioskaccount MOET een code geven; een ander account
dat er een meestuurt, krijgt hem ook nagekeken. Vrijgeven kan alleen in het
beheer.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta
import hmac
import logging
from typing import Any

import voluptuous as vol

from homeassistant.components.calendar.const import DATA_COMPONENT, CalendarEntityFeature
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.util import dt as dt_util

from .const import (
    CODE_POGINGEN,
    CODE_WACHT,
    MAX_BOEKING_UREN,
    MAX_BOEKING_VOORUIT_DAGEN,
    MAX_KORT,
    MAX_MIDDEL,
)
from .store import InfoFout, InfoStore, _tekst

_LOGGER = logging.getLogger(__name__)

# Wat er in de agenda als titel komt als er niets ingevuld is. Op het scherm
# staat het nooit.
TITEL_BEHEER = "Gereserveerd"
TITEL_SCHERM = "Geboekt op het infoscherm"


class RuimteFout(Exception):
    """Boeken of vrijgeven lukt niet. `code` gaat als foutcode naar de kaart."""

    def __init__(self, code: str, tekst: str) -> None:
        super().__init__(tekst)
        self.code = code


def moment(rauw: Any, veld: str) -> datetime:
    """Een tijdstip zoals de kaart het stuurt: `2026-10-16T14:00`, in de
    tijdzone van Home Assistant. Een tijdzone in de tekst mag ook."""
    if not isinstance(rauw, str):
        raise InfoFout(f"'{veld}' is een tijdstip, zoals 2026-10-16T14:00")
    try:
        t = dt_util.parse_datetime(rauw.strip())
    except ValueError:
        t = None
    if t is None:
        raise InfoFout(f"'{veld}' is een tijdstip, zoals 2026-10-16T14:00")
    if t.tzinfo is None:
        t = t.replace(tzinfo=dt_util.get_default_time_zone())
    return dt_util.as_local(t).replace(second=0, microsecond=0)


def klok(t: datetime) -> str:
    return dt_util.as_local(t).strftime("%H:%M")


def valideer_boeking(start_rauw: Any, eind_rauw: Any, titel_rauw: Any, nu: datetime) -> tuple[datetime, datetime, str]:
    """Begin, eind en titel, of een InfoFout met uitleg."""
    start = moment(start_rauw, "start")
    eind = moment(eind_rauw, "eind")
    titel = _tekst(titel_rauw, "omschrijving", MAX_KORT)
    if eind <= start:
        raise InfoFout("het eind moet na het begin liggen")
    if eind - start > timedelta(hours=MAX_BOEKING_UREN):
        raise InfoFout(f"een boeking duurt hooguit {MAX_BOEKING_UREN} uur")
    if eind <= nu:
        raise InfoFout("deze tijd is al voorbij")
    if start > nu + timedelta(days=MAX_BOEKING_VOORUIT_DAGEN):
        raise InfoFout("zo ver vooruit kan er niet geboekt worden")
    return start, eind, titel


class Ruimtes:
    """Boeken en vrijgeven, met de code en het slot. Eén per installatie."""

    def __init__(self, hass: HomeAssistant, store: InfoStore) -> None:
        self._hass = hass
        self._store = store
        self._slot = asyncio.Lock()
        self._fout: dict[str, list[datetime]] = {}

    def _agenda(self, entity_id: str, kunnen: CalendarEntityFeature, wat: str):
        if not self._store.is_ruimte(entity_id):
            raise RuimteFout("not_found", "Deze ruimte staat niet (meer) op het infoscherm")
        component = self._hass.data.get(DATA_COMPONENT)
        agenda = component.get_entity(entity_id) if component is not None else None
        if agenda is None:
            raise RuimteFout("not_found", "De agenda van deze ruimte bestaat niet in Home Assistant")
        if not (agenda.supported_features or 0) & kunnen:
            raise RuimteFout(
                "not_supported",
                f"De agenda van deze ruimte kan geen boekingen {wat}. Kies een Lokale agenda.",
            )
        return agenda

    def controleer_code(self, gebruiker: str, code: Any) -> None:
        """Gooit RuimteFout als de code niet klopt, of als er te vaak een
        verkeerde gegeven is."""
        nu = dt_util.utcnow()
        pogingen = [t for t in self._fout.get(gebruiker, []) if nu - t < CODE_WACHT]
        self._fout[gebruiker] = pogingen
        if len(pogingen) >= CODE_POGINGEN:
            raise RuimteFout("te_vaak", "Te vaak een verkeerde code. Probeer het over een paar minuten opnieuw.")
        juist = self._store.ruimte_code
        if not juist:
            raise RuimteFout("geen_code", "Boeken op het scherm staat uit: er is in het beheer geen code ingesteld.")
        if not isinstance(code, str) or not hmac.compare_digest(code.encode(), juist.encode()):
            pogingen.append(nu)
            raise RuimteFout("verkeerde_code", "De code klopt niet.")
        self._fout.pop(gebruiker, None)

    async def async_boek(
        self,
        *,
        ruimte: str,
        start: Any,
        eind: Any,
        titel: Any,
        op_scherm: bool,
        door: str,
    ) -> dict[str, Any]:
        """Een boeking in de agenda van de ruimte. Bezet = RuimteFout `bezet`."""
        agenda = self._agenda(ruimte, CalendarEntityFeature.CREATE_EVENT, "aannemen")
        try:
            begin, einde, tekst = valideer_boeking(start, eind, titel, dt_util.now())
        except InfoFout as fout:
            raise RuimteFout("invalid_format", str(fout)) from None
        titel_uit = tekst or (TITEL_SCHERM if op_scherm else TITEL_BEHEER)
        waar = "op het infoscherm" if op_scherm else "in het beheer van het infoscherm"
        omschrijving = f"Geboekt {waar}" + (f" door {door}" if door else "") + "."
        async with self._slot:
            try:
                bestaand = await agenda.async_get_events(self._hass, begin, einde)
            except HomeAssistantError as fout:
                raise RuimteFout("failed", f"De agenda kon niet gelezen worden: {fout}") from None
            botst = sorted(
                (ev for ev in bestaand if ev.start_datetime_local < einde and ev.end_datetime_local > begin),
                key=lambda ev: ev.start_datetime_local,
            )
            if botst:
                ev = botst[0]
                wanneer = "de hele dag" if ev.all_day else f"van {klok(ev.start_datetime_local)} tot {klok(ev.end_datetime_local)}"
                raise RuimteFout("bezet", f"Deze ruimte is dan al bezet, {wanneer}.")
            try:
                await agenda.async_create_event(
                    dtstart=begin,
                    dtend=einde,
                    summary=titel_uit,
                    description=omschrijving[:MAX_MIDDEL],
                )
            except (HomeAssistantError, vol.Invalid, ValueError) as fout:
                raise RuimteFout("failed", f"Boeken lukte niet: {fout}") from None
        _LOGGER.info("Infoscherm: %s geboekt van %s tot %s (%s)", ruimte, begin, einde, waar)
        return {"ruimte": ruimte, "start": begin.isoformat(), "eind": einde.isoformat()}

    async def async_vrijgeven(self, *, ruimte: str, uid: str, recurrence_id: str | None) -> None:
        """Eén boeking weg. Bij een herhalende alleen deze keer."""
        agenda = self._agenda(ruimte, CalendarEntityFeature.DELETE_EVENT, "verwijderen")
        try:
            await agenda.async_delete_event(uid, recurrence_id=recurrence_id or None)
        except (HomeAssistantError, ValueError) as fout:
            raise RuimteFout("failed", f"Vrijgeven lukte niet: {fout}") from None
