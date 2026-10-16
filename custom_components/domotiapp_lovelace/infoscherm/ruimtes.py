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

## Een ruimte maken in het beheer (sinds 0.76.0)

*"De receptioniste moet dat zelf kunnen maken."* (16 oktober 2026, via een
beheersessie bij een klant). Een Lokale agenda toevoegen is een config flow, en
dat mag in Home Assistant alleen een beheerder. Dit doet het namens wie het
infoscherm mag beheren, en ALLEEN voor een Lokale agenda met een naam:

- `async_nieuw` maakt de agenda (`local_calendar`, stap user) en zet hem als
  ruimte op het scherm, met `gemaakt: true`. Bestaat er al een Lokale agenda met
  die naam, dan wordt DIE gekoppeld, zonder `gemaakt`: wat iemand anders maakte,
  haalt het beheer niet weg;
- `async_weg` haalt een ruimte met `gemaakt` weer weg, en verwijdert dan ook de
  agenda, met alle boekingen erin. Een ruimte die de installateur in de
  kaartconfig koos, laat het staan.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta
import hmac
import logging
from typing import Any

import voluptuous as vol

from homeassistant.components.calendar.const import DATA_COMPONENT, CalendarEntityFeature
from homeassistant.config_entries import SOURCE_USER, ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util, slugify

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

# De Lokale agenda van Home Assistant, en de velden van zijn config flow.
LOKAAL = "local_calendar"
LOKAAL_NAAM = "calendar_name"
LOKAAL_SLEUTEL = "storage_key"

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
            except (HomeAssistantError, vol.Invalid, ValueError, OSError) as fout:
                # OSError: de Lokale agenda schrijft een .ics-bestand weg, en een
                # schijf die vol of alleen-lezen is gaf anders "Unknown error".
                raise RuimteFout("failed", f"Boeken lukte niet: {fout}") from None
        _LOGGER.info("Infoscherm: %s geboekt van %s tot %s (%s)", ruimte, begin, einde, waar)
        return {"ruimte": ruimte, "start": begin.isoformat(), "eind": einde.isoformat()}

    def _lokale_agenda(self, sleutel: str) -> ConfigEntry | None:
        """De Lokale agenda met deze naam (zijn `storage_key`), als die er is."""
        for entry in self._hass.config_entries.async_entries(LOKAAL):
            if entry.data.get(LOKAAL_SLEUTEL) == sleutel:
                return entry
        return None

    async def _agenda_van(self, entry: ConfigEntry) -> str | None:
        """De calendar-entiteit van een config entry. Een nieuwe agenda wordt
        opgezet terwijl de flow afrondt; geef hem een paar tellen."""
        register = er.async_get(self._hass)
        for _ in range(50):
            for ent in er.async_entries_for_config_entry(register, entry.entry_id):
                if ent.domain == "calendar" and self._hass.states.get(ent.entity_id) is not None:
                    return ent.entity_id
            await asyncio.sleep(0.1)
        return None

    async def async_nieuw(self, naam: Any) -> dict[str, Any]:
        """Een ruimte maken: een Lokale agenda met deze naam, als ruimte op het scherm."""
        try:
            tekst = _tekst(naam, "naam", MAX_KORT, verplicht=True)
        except InfoFout as fout:
            raise RuimteFout("invalid_format", "Geef de ruimte een naam.") from fout
        # `slugify` van Home Assistant maakt van "!!!" geen lege tekst maar
        # "unknown"; dus zelf kijken of er iets in staat.
        if not any(teken.isalnum() for teken in tekst):
            raise RuimteFout("invalid_format", "Een naam met letters of cijfers, graag.")
        sleutel = slugify(tekst)
        async with self._slot:
            entry = self._lokale_agenda(sleutel)
            gemaakt = entry is None
            if gemaakt:
                flow = await self._hass.config_entries.flow.async_init(LOKAAL, context={"source": SOURCE_USER})
                uit = await self._hass.config_entries.flow.async_configure(
                    flow["flow_id"], {LOKAAL_NAAM: tekst, "import": "create_empty"}
                )
                if uit.get("type") != FlowResultType.CREATE_ENTRY:
                    raise RuimteFout("failed", f"De agenda kon niet gemaakt worden ({uit.get('reason') or uit.get('type')}).")
                entry = uit["result"]
            entity_id = await self._agenda_van(entry)
            if entity_id is None:
                raise RuimteFout("failed", "De agenda is er, maar Home Assistant heeft hem nog niet klaar. Probeer het zo opnieuw.")
            try:
                item = await self._store.async_voeg_ruimte_toe(entity_id, gemaakt=gemaakt)
            except InfoFout as fout:
                raise RuimteFout("invalid_format", str(fout)) from None
        _LOGGER.info("Infoscherm: ruimte %s %s (%s)", tekst, "gemaakt" if gemaakt else "gekoppeld", entity_id)
        return {"ruimte": item, "gemaakt": gemaakt}

    async def async_weg(self, ruimte: str) -> dict[str, Any]:
        """Een ruimte die het beheer maakte weer weghalen, met zijn agenda."""
        item = self._store.ruimte(ruimte)
        if item is None:
            raise RuimteFout("not_found", "Deze ruimte staat niet (meer) op het infoscherm")
        if not item.get("gemaakt"):
            raise RuimteFout(
                "niet_van_beheer",
                "Deze ruimte heeft de installateur gekozen; die haalt hem weg in de kaartinstellingen van het beheer.",
            )
        ent = er.async_get(self._hass).async_get(ruimte)
        entry = self._hass.config_entries.async_get_entry(ent.config_entry_id) if ent and ent.config_entry_id else None
        async with self._slot:
            await self._store.async_haal_ruimte_weg(ruimte)
            if entry is not None and entry.domain == LOKAAL:
                await self._hass.config_entries.async_remove(entry.entry_id)
        _LOGGER.info("Infoscherm: ruimte %s weggehaald, met zijn agenda", ruimte)
        return {"ruimte": ruimte, "agenda_weg": entry is not None and entry.domain == LOKAAL}

    async def async_vrijgeven(self, *, ruimte: str, uid: str, recurrence_id: str | None) -> None:
        """Eén boeking weg. Bij een herhalende alleen deze keer."""
        agenda = self._agenda(ruimte, CalendarEntityFeature.DELETE_EVENT, "verwijderen")
        try:
            await agenda.async_delete_event(uid, recurrence_id=recurrence_id or None)
        except (HomeAssistantError, ValueError, OSError) as fout:
            raise RuimteFout("failed", f"Vrijgeven lukte niet: {fout}") from None
