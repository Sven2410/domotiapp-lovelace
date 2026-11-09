"""De agendakaart: een agenda toevoegen namens de klant (0.116.0).

De eigenaar, 8 november 2026: "Ik wil dat de klant ook zelf een agenda kan aanmaken en evenementen etc kan maken. Of een
bestaande toevoegen zoals google of apple".

## Afspraken gaan hier NIET langs

Maken, wijzigen en weghalen van een afspraak doet de kaart met de commando's van Home Assistant zelf
(`calendar/event/create`, `update` en `delete`). Die mag elke ingelogde gebruiker; Home Assistant kijkt zelf of de agenda
het kan (`supported_features`). Lezen gaat met `calendar/event/subscribe`, net als op het infoscherm.

## Een agenda toevoegen wel

Een agenda is een integratie, en een integratie toevoegen mag in Home Assistant alleen een beheerder. De klant is dat
meestal niet. Dit doet het namens hem, net als het beheer van het infoscherm een ruimte maakt (`infoscherm/ruimtes.py`),
en ALLEEN deze drie, met vaste adressen:

- **nieuw**: een Lokale agenda in Home Assistant (`local_calendar`) met een naam. Lezen en schrijven. Bestaat er al een met
  die naam, dan wordt die gekoppeld, zonder `gemaakt`: wat een ander maakte, haalt de klant niet weg.
- **google**: het geheime adres in iCal-indeling uit Google Agenda, als Externe agenda (`remote_calendar`). Alleen lezen;
  afspraken maakt de klant in Google zelf. De volledige Google-koppeling (lezen en schrijven) vraagt een eigen project bij
  Google met OAuth, en dat is werk voor de installateur: zo'n agenda kies je gewoon in de editor van de kaart.
- **apple**: iCloud over CalDAV (`caldav`), met de Apple ID en een app-specifiek wachtwoord. Lezen en een afspraak maken;
  wijzigen en weghalen kan de CalDAV-integratie van Home Assistant niet.

**Geen adres naar keuze.** Net als bij het nieuws (zie de kop van `nieuws.py`): een commando dat elke ingelogde gebruiker
kan sturen, mag Home Assistant geen willekeurig adres laten ophalen. Google mag alleen een adres van
`calendar.google.com/calendar/ical/`, Apple gaat altijd naar `caldav.icloud.com`.

**Wie het mag:** een beheerder altijd; een ander alleen als er op een dashboard een agendakaart staat waarop toevoegen
niet uit staat (`toevoegen: false`), of sinds 0.117.0 een overzichtskaart (`agenda_toevoegen: false`). Dezelfde grens als
bij de automatiseringskaart: de server leest de dashboards zelf.

**Wat de klant toevoegde, onthoudt de server** (`STORE_KEY`), zodat de kaarten het laten zien zonder dat iemand het
dashboard hoeft te wijzigen; dat kan de klant niet. Weghalen kan alleen wat via de kaart kwam, en een gekoppelde Lokale
agenda (niet `gemaakt`) wordt dan alleen losgekoppeld.
"""

from __future__ import annotations

import asyncio
import logging
import re
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.config_entries import SOURCE_USER, ConfigEntry
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import async_dispatcher_connect, async_dispatcher_send
from homeassistant.helpers.storage import Store
from homeassistant.util import slugify

from .const import DOMAIN
from .meldingen.kaarten import async_lees_kaarten
from .taal import t

_LOGGER = logging.getLogger(__name__)

KAART_TYPE = "custom:domotiapp-agenda-card"
OVERZICHT_TYPE = "custom:domotiapp-overzicht-card"

DATA_AGENDA = "agenda"
DATA_WS = "agenda_ws_registered"
STORE_KEY = f"{DOMAIN}.agenda"
STORE_VERSION = 1
SIGNAAL = f"{DOMAIN}_agenda"

LOKAAL = "local_calendar"
EXTERN = "remote_calendar"
CALDAV = "caldav"

ICLOUD = "https://caldav.icloud.com"
# Het geheime adres (private-...) of een openbare agenda (public), altijd basic.ics.
GOOGLE = re.compile(r"^https://calendar\.google\.com/calendar/ical/[^/\s?#]+/(?:private-[0-9a-f]+|public)/basic\.ics$")

MAX_NAAM = 60

SOORTEN = ("nieuw", "google", "apple")


class AgendaFout(Exception):
    """Toevoegen lukt niet. `code` gaat als foutcode naar de kaart, de tekst is voor mensen."""

    def __init__(self, code: str, tekst: str) -> None:
        super().__init__(tekst)
        self.code = code


def google_adres(rauw: Any) -> str | None:
    """Het adres als het een iCal-adres van Google Agenda is (ook als webcal://), anders None."""
    if not isinstance(rauw, str):
        return None
    adres = rauw.strip()
    if adres.startswith("webcal://"):
        adres = "https://" + adres[len("webcal://") :]
    return adres if GOOGLE.match(adres) else None


def _naam(hass: HomeAssistant, rauw: Any) -> str:
    tekst = rauw.strip() if isinstance(rauw, str) else ""
    if not tekst or len(tekst) > MAX_NAAM or not any(teken.isalnum() for teken in tekst):
        raise AgendaFout("invalid_format", t(hass, "Geef de agenda een naam."))
    return tekst


class Agendas:
    """Wat de klant via de kaart toevoegde: per config entry de soort, de naam en of wij hem maakten."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, STORE_VERSION, STORE_KEY)
        self._lijst: list[dict[str, Any]] = []
        self._slot = asyncio.Lock()

    async def async_laad(self) -> None:
        data = await self._store.async_load() or {}
        self._lijst = [a for a in data.get("agendas", []) if isinstance(a, dict) and a.get("entry_id")]

    async def _async_bewaar(self) -> None:
        await self._store.async_save({"agendas": self._lijst})
        async_dispatcher_send(self._hass, SIGNAAL)

    def lijst(self) -> list[dict[str, Any]]:
        """Wat er nog bestaat, met de agenda's (entiteiten) erbij. Een weggehaalde integratie valt er vanzelf af."""
        register = er.async_get(self._hass)
        uit = []
        for a in self._lijst:
            if self._hass.config_entries.async_get_entry(a["entry_id"]) is None:
                continue
            entiteiten = sorted(
                ent.entity_id
                for ent in er.async_entries_for_config_entry(register, a["entry_id"])
                if ent.domain == "calendar" and not ent.disabled
            )
            uit.append({**a, "entiteiten": entiteiten})
        return uit

    async def _async_entiteiten(self, entry: ConfigEntry) -> list[str]:
        """De agenda's van een nieuwe integratie. Ze worden opgezet terwijl de flow afrondt; geef ze een paar tellen."""
        register = er.async_get(self._hass)
        for _ in range(100):
            gevonden = [
                ent.entity_id
                for ent in er.async_entries_for_config_entry(register, entry.entry_id)
                if ent.domain == "calendar" and self._hass.states.get(ent.entity_id) is not None
            ]
            if gevonden:
                return sorted(gevonden)
            await asyncio.sleep(0.1)
        return []

    async def _async_flow(self, domein: str, invoer: dict[str, Any]) -> dict[str, Any]:
        """De config flow van Home Assistant, in één stap. Een flow die niet afrondt, wordt afgebroken."""
        flow = await self._hass.config_entries.flow.async_init(domein, context={"source": SOURCE_USER})
        if flow.get("type") != FlowResultType.FORM:
            return flow
        uit = await self._hass.config_entries.flow.async_configure(flow["flow_id"], invoer)
        if uit.get("type") == FlowResultType.FORM:
            self._hass.config_entries.flow.async_abort(uit["flow_id"])
        return uit

    def _fout_uit(self, uit: dict[str, Any], soort: str = "") -> AgendaFout:
        """Wat de flow zei, in woorden voor de klant.

        iCloud antwoordt op een onbekende Apple ID of een verkeerd wachtwoord met 403 Forbidden, en de CalDAV-integratie noemt
        dat `cannot_connect` (alleen 401 is `invalid_auth`). Gemeten op 8 november 2026 in het log. Bij Apple is het adres
        vast, dus dan ligt het aan de gegevens, of iCloud is weg: dat zeggen we allebei."""
        hass = self._hass
        if uit.get("type") == FlowResultType.ABORT and uit.get("reason") == "already_configured":
            return AgendaFout("bestaat_al", t(hass, "Deze agenda staat er al."))
        fout = (uit.get("errors") or {}).get("base") or uit.get("reason") or str(uit.get("type"))
        if uit.get("type") == FlowResultType.FORM and uit.get("step_id") == "auth":
            fout = "forbidden"
        teksten = {
            "invalid_auth": ("verkeerd_wachtwoord", "Apple ID of wachtwoord klopt niet. Gebruik een app-specifiek wachtwoord."),
            "cannot_connect": ("kan_niet_verbinden", "De agenda is niet te bereiken. Kijk het adres na."),
            "timeout_connect": ("kan_niet_verbinden", "De agenda is niet te bereiken. Kijk het adres na."),
            "invalid_ics_file": ("geen_agenda", "Op dit adres staat geen agenda."),
            "forbidden": ("geen_toegang", "Deze agenda is niet te lezen. Gebruik het geheime adres."),
        }
        if soort == "apple" and fout in ("cannot_connect", "timeout_connect"):
            teksten[fout] = ("verkeerd_wachtwoord", "iCloud gaf geen toegang. Kijk je Apple ID en het app-specifieke wachtwoord na.")
        code, tekst = teksten.get(fout, ("mislukt", "De agenda kon niet toegevoegd worden ({reden})."))
        return AgendaFout(code, t(hass, tekst, reden=fout))

    async def async_toevoegen(self, soort: str, gegevens: dict[str, Any]) -> dict[str, Any]:
        hass = self._hass
        async with self._slot:
            if soort == "nieuw":
                naam = _naam(hass, gegevens.get("naam"))
                sleutel = slugify(naam)
                entry = next((e for e in hass.config_entries.async_entries(LOKAAL) if e.data.get("storage_key") == sleutel), None)
                gemaakt = entry is None
                if gemaakt:
                    uit = await self._async_flow(LOKAAL, {"calendar_name": naam, "import": "create_empty"})
                    if uit.get("type") != FlowResultType.CREATE_ENTRY:
                        raise self._fout_uit(uit)
                    entry = uit["result"]
            elif soort == "google":
                naam = _naam(hass, gegevens.get("naam"))
                adres = google_adres(gegevens.get("adres"))
                if adres is None:
                    raise AgendaFout(
                        "invalid_format",
                        t(hass, "Dit is geen iCal-adres van Google Agenda. Het begint met https://calendar.google.com/calendar/ical/."),
                    )
                uit = await self._async_flow(EXTERN, {"calendar_name": naam, "url": adres, "verify_ssl": True})
                if uit.get("type") != FlowResultType.CREATE_ENTRY:
                    raise self._fout_uit(uit)
                entry, gemaakt = uit["result"], True
            elif soort == "apple":
                gebruiker = gegevens.get("gebruiker").strip() if isinstance(gegevens.get("gebruiker"), str) else ""
                wachtwoord = gegevens.get("wachtwoord") if isinstance(gegevens.get("wachtwoord"), str) else ""
                if "@" not in gebruiker or not wachtwoord.strip():
                    raise AgendaFout("invalid_format", t(hass, "Vul je Apple ID en een app-specifiek wachtwoord in."))
                uit = await self._async_flow(
                    CALDAV, {"url": ICLOUD, "username": gebruiker, "password": wachtwoord.strip(), "verify_ssl": True}
                )
                if uit.get("type") != FlowResultType.CREATE_ENTRY:
                    raise self._fout_uit(uit, "apple")
                entry, gemaakt, naam = uit["result"], True, gebruiker
            else:
                raise AgendaFout("invalid_format", t(hass, "Onbekende soort agenda."))

            entiteiten = await self._async_entiteiten(entry)
            if not any(a["entry_id"] == entry.entry_id for a in self._lijst):
                self._lijst.append({"entry_id": entry.entry_id, "soort": soort, "naam": naam, "gemaakt": gemaakt})
                await self._async_bewaar()
        _LOGGER.info("Agenda %s toegevoegd via de kaart (%s, %s)", naam, soort, ", ".join(entiteiten) or "nog geen entiteit")
        return {"entry_id": entry.entry_id, "entiteiten": entiteiten, "gemaakt": gemaakt}

    async def async_weg(self, entry_id: str) -> dict[str, Any]:
        """Een agenda die via de kaart kwam weer weghalen. Wat wij maakten gaat helemaal weg, een koppeling alleen los."""
        hass = self._hass
        async with self._slot:
            item = next((a for a in self._lijst if a["entry_id"] == entry_id), None)
            if item is None:
                raise AgendaFout("not_found", t(hass, "Deze agenda is niet via de kaart toegevoegd."))
            self._lijst.remove(item)
            await self._async_bewaar()
            weg = bool(item.get("gemaakt")) and hass.config_entries.async_get_entry(entry_id) is not None
            if weg:
                await hass.config_entries.async_remove(entry_id)
        _LOGGER.info("Agenda %s via de kaart weggehaald (%s)", item.get("naam"), "met de integratie" if weg else "alleen losgekoppeld")
        return {"entry_id": entry_id, "integratie_weg": weg}


async def async_mag(hass: HomeAssistant, connection) -> bool:
    """Een beheerder altijd; een ander alleen als er een agenda- of overzichtskaart staat waarop toevoegen niet uit staat."""
    if connection.user.is_admin:
        return True
    if any(kaart.get("toevoegen") is not False for _, kaart in await async_lees_kaarten(hass, KAART_TYPE)):
        return True
    return any(kaart.get("agenda_toevoegen") is not False for _, kaart in await async_lees_kaarten(hass, OVERZICHT_TYPE))


async def async_zet_op(hass: HomeAssistant) -> None:
    data = hass.data.setdefault(DOMAIN, {})
    if DATA_AGENDA not in data:
        agendas = Agendas(hass)
        await agendas.async_laad()
        data[DATA_AGENDA] = agendas
    if data.get(DATA_WS):
        return
    for commando in (ws_subscribe, ws_toevoegen, ws_weg):
        websocket_api.async_register_command(hass, commando)
    data[DATA_WS] = True


def _agendas(hass: HomeAssistant) -> Agendas:
    return hass.data[DOMAIN][DATA_AGENDA]


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/agenda/subscribe"})
@callback
def ws_subscribe(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Wat de klant toevoegde, en opnieuw zodra dat verandert of er een agenda bij komt of weggaat."""

    @callback
    def stuur(*_: Any) -> None:
        connection.send_message(websocket_api.event_message(msg["id"], {"agendas": _agendas(hass).lijst()}))

    @callback
    def is_agenda(event: Event) -> bool:
        return str(event.data.get("entity_id", "")).startswith("calendar.")

    weg_signaal = async_dispatcher_connect(hass, SIGNAAL, stuur)
    weg_register = hass.bus.async_listen(er.EVENT_ENTITY_REGISTRY_UPDATED, stuur, event_filter=is_agenda)

    @callback
    def stop() -> None:
        weg_signaal()
        weg_register()

    connection.subscriptions[msg["id"]] = stop
    connection.send_result(msg["id"])
    stuur()


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/agenda/toevoegen",
        vol.Required("soort"): vol.In(SOORTEN),
        vol.Optional("naam"): str,
        vol.Optional("adres"): str,
        vol.Optional("gebruiker"): str,
        vol.Optional("wachtwoord"): str,
    }
)
@websocket_api.async_response
async def ws_toevoegen(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    if not await async_mag(hass, connection):
        connection.send_error(msg["id"], "unauthorized", t(hass, "Agenda's toevoegen staat uit op deze kaart."))
        return
    try:
        uit = await _agendas(hass).async_toevoegen(msg["soort"], msg)
    except AgendaFout as fout:
        connection.send_error(msg["id"], fout.code, str(fout))
        return
    connection.send_result(msg["id"], uit)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/agenda/weg", vol.Required("entry_id"): str})
@websocket_api.async_response
async def ws_weg(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    if not await async_mag(hass, connection):
        connection.send_error(msg["id"], "unauthorized", t(hass, "Agenda's toevoegen staat uit op deze kaart."))
        return
    try:
        uit = await _agendas(hass).async_weg(msg["entry_id"])
    except AgendaFout as fout:
        connection.send_error(msg["id"], fout.code, str(fout))
        return
    connection.send_result(msg["id"], uit)
