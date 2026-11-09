"""Een afspraak in een CalDAV-agenda (iCloud) wijzigen of weghalen, wat Home Assistant zelf niet kan (0.119.0).

De eigenaar, 9 november 2026, na "aanmaken werkt wel trouwens maar wijzigen niet van een bestaande uit apple agenda", en
de vraag of je dus geen afspraak kunt verwijderen: "ja doe maar".

## Waarom hier, en niet met `calendar/event/update` en `delete`

De CalDAV-integratie van Home Assistant (2026.8) kan alleen een afspraak MAKEN (`supported_features` 1,
`caldav/calendar.py`). Wijzigen en weghalen heeft hij niet, dus die commando's antwoorden met "not supported".

Zijn entiteit heeft de verbinding met de server wel: `entity.coordinator.calendar` is het `caldav.Calendar`-object dat
hij zelf ook gebruikt om op te halen en te maken. Daarmee zoeken we de afspraak op zijn uid en halen hem weg of wijzigen
hem. **We lezen dus geen wachtwoord en bouwen geen eigen verbinding**: het is dezelfde verbinding, naar dezelfde server,
met dezelfde inlog die de installateur of de klant bij het koppelen gaf.

## Zoeken op een tijdvak, niet op de uid

De bibliotheek zoekt een afspraak standaard op zijn uid (`event_by_uid`, een REPORT met een text-match op UID). **iCloud
weigert dat** met "412 Precondition Failed". De eigenaar zag het meteen bij de eerste proef op 0.119.0: "De agenda gaf een
fout: ReportError at '412 Precondition Failed', reason no reason". Een zoekvraag op een tijdvak doet iCloud wel: zo haalt de
integratie van Home Assistant de afspraken ook op (`calendar.search(start, end, event=True)`). De kaart stuurt daarom het
begin en eind van de afspraak mee, en de server zoekt in dat tijdvak (met een dag marge aan beide kanten) naar de uid. Pas
als dat niets vindt, of de kaart geen tijden meegaf, op de uid.

## De grenzen

- **Wie het mag:** wie de agenda mag bedienen (`POLICY_CONTROL`), net als Home Assistant zelf bij `calendar/event/delete`.
- **Alleen een agenda van de integratie `caldav`.** Elke andere gaat langs Home Assistant zelf.
- **Geen herhalende afspraak.** Op de server is dat één afspraak met een regel (RRULE), en weghalen op de uid zou de
  hele reeks weghalen, terwijl de klant op één keer tikte. Die blijft voor de Agenda-app op de iPhone; de kaart zegt dat.
- **Na een wijziging haalt de agenda opnieuw op** (`async_request_refresh`), zodat zijn toestand (de eerstvolgende
  afspraak) niet een kwartier achterloopt.

De afspraak wijzigen gaat op de iCalendar-gegevens zelf: titel, begin, eind, plaats en omschrijving, met `SEQUENCE` een
hoger (dat doet de bibliotheek) en een nieuwe `LAST-MODIFIED` en `DTSTAMP`, zodat de iPhone ziet dat het een nieuwere versie is. Wat de kaart niet
kent (deelnemers, meldingen, een URL) blijft staan.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta
import logging
from typing import Any

import voluptuous as vol

from homeassistant.auth.permissions.const import POLICY_CONTROL
from homeassistant.components import websocket_api
from homeassistant.components.calendar.const import DATA_COMPONENT
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError, Unauthorized
from homeassistant.util import dt as dt_util

from .const import DOMAIN
from .taal import t

_LOGGER = logging.getLogger(__name__)

PLATFORM = "caldav"


class CaldavFout(HomeAssistantError):
    """Een fout in woorden voor de klant."""


def caldav_agenda(hass: HomeAssistant, entity_id: str) -> tuple[Any, Any] | None:
    """De agenda op de server (`caldav.Calendar`) en de entiteit, of None als het geen agenda van `caldav` is."""
    component = hass.data.get(DATA_COMPONENT)
    entity = component.get_entity(entity_id) if component else None
    if entity is None or getattr(getattr(entity, "platform", None), "platform_name", None) != PLATFORM:
        return None
    agenda = getattr(getattr(entity, "coordinator", None), "calendar", None)
    return (agenda, entity) if agenda is not None else None


def _moment(waarde: str) -> date | datetime:
    """"2026-12-24" is een hele dag; een tijdstip met zone (zoals de kaart het stuurt, in UTC) blijft een tijdstip."""
    if len(waarde) == 10:
        return date.fromisoformat(waarde)
    tijd = dt_util.parse_datetime(waarde)
    if tijd is None or tijd.tzinfo is None:
        raise vol.Invalid(f"geen tijdstip met tijdzone: {waarde}")
    return tijd


MARGE = timedelta(days=1)


def _in_tijdvak(agenda: Any, uid: str, van: datetime, tot: datetime) -> Any:
    """De afspraak met deze uid in het tijdvak, of None. Zonder `expand`: een herhalende komt zo terug met zijn regel."""
    for obj in agenda.search(start=van - MARGE, end=tot + MARGE, event=True, expand=False):
        if str(obj.icalendar_component.get("UID", "")) == uid:
            return obj
    return None


def _zoek(hass: HomeAssistant, agenda: Any, uid: str, van: datetime | None = None, tot: datetime | None = None) -> Any:
    """De afspraak op de server. Draait in een executor: de bibliotheek praat synchroon met de server."""
    obj = None
    fout: Exception | None = None
    if van is not None and tot is not None:
        try:
            obj = _in_tijdvak(agenda, uid, van, tot)
        except Exception as err:  # noqa: BLE001
            fout = err
    if obj is None:
        try:
            obj = agenda.event_by_uid(uid)
        except Exception as err:  # noqa: BLE001 - de bibliotheek heeft geen gedeelde basisklasse voor "niet gevonden"
            if type(err).__name__ == "NotFoundError" and fout is None:
                raise CaldavFout(t(hass, "Deze afspraak staat niet meer in de agenda.")) from err
            # Zocht het tijdvak foutloos en niets gevonden, dan is een weigering op de uid (iCloud) geen fout maar weg.
            if van is not None and fout is None:
                raise CaldavFout(t(hass, "Deze afspraak staat niet meer in de agenda.")) from err
            raise CaldavFout(t(hass, "De agenda gaf een fout: {fout}", fout=fout or err)) from err
    onderdeel = obj.icalendar_component
    if "RRULE" in onderdeel or "RECURRENCE-ID" in onderdeel:
        raise CaldavFout(t(hass, "Een herhalende afspraak uit iCloud wijzig of verwijder je in de Agenda-app op je iPhone, iPad of Mac."))
    return obj


def weghalen(hass: HomeAssistant, agenda: Any, uid: str, van: datetime | None = None, tot: datetime | None = None) -> None:
    obj = _zoek(hass, agenda, uid, van, tot)
    try:
        obj.delete()
    except Exception as err:  # noqa: BLE001
        raise CaldavFout(t(hass, "De agenda gaf een fout: {fout}", fout=err)) from err


def wijzigen(
    hass: HomeAssistant, agenda: Any, uid: str, event: dict[str, Any], van: datetime | None = None, tot: datetime | None = None
) -> None:
    obj = _zoek(hass, agenda, uid, van, tot)
    onderdeel = obj.icalendar_component
    begin = _moment(event["dtstart"])
    eind = _moment(event["dtend"])

    def zet(sleutel: str, waarde: Any) -> None:
        onderdeel.pop(sleutel, None)
        if waarde not in (None, ""):
            onderdeel.add(sleutel, waarde)

    zet("SUMMARY", event["summary"])
    zet("DTSTART", begin)
    zet("DTEND", eind)
    onderdeel.pop("DURATION", None)
    zet("LOCATION", event.get("location"))
    zet("DESCRIPTION", event.get("description"))
    nu = dt_util.utcnow().replace(microsecond=0)
    zet("LAST-MODIFIED", nu)
    zet("DTSTAMP", nu)
    # SEQUENCE ophogen doet de bibliotheek bij het opslaan, maar alleen als hij er al staat. caldav 2.1.0 doet dat ook met
    # `increase_seqno=False` (gemeten tegen een echte CalDAV-server: zelf ophogen gaf van 0 naar 2). Dus hier alleen
    # zorgen dat hij er staat.
    if "SEQUENCE" not in onderdeel:
        onderdeel.add("SEQUENCE", 0)
    try:
        obj.save()
    except Exception as err:  # noqa: BLE001
        raise CaldavFout(t(hass, "De agenda gaf een fout: {fout}", fout=err)) from err


def _event_schema(waarde: dict[str, Any]) -> dict[str, Any]:
    begin = _moment(waarde["dtstart"])
    eind = _moment(waarde["dtend"])
    if isinstance(begin, datetime) != isinstance(eind, datetime):
        raise vol.Invalid("begin en eind zijn allebei een datum of allebei een tijdstip")
    if eind <= begin:
        raise vol.Invalid("het eind ligt voor het begin")
    return waarde


EVENT = vol.All(
    vol.Schema(
        {
            vol.Required("summary"): vol.All(str, vol.Length(min=1, max=200)),
            vol.Required("dtstart"): str,
            vol.Required("dtend"): str,
            vol.Optional("location"): vol.All(str, vol.Length(max=200)),
            vol.Optional("description"): vol.All(str, vol.Length(max=2000)),
        }
    ),
    _event_schema,
)


def _tijd(waarde: str | None) -> datetime | None:
    """Het begin of eind dat de kaart meestuurt (ISO, met zone), of None."""
    tijd = dt_util.parse_datetime(waarde) if waarde else None
    return tijd if tijd is not None and tijd.tzinfo is not None else None


async def _voer_uit(hass: HomeAssistant, connection, msg: dict[str, Any], werk) -> None:
    entity_id = msg["entity_id"]
    if not connection.user.permissions.check_entity(entity_id, POLICY_CONTROL):
        raise Unauthorized(entity_id=entity_id)
    gevonden = caldav_agenda(hass, entity_id)
    if gevonden is None:
        connection.send_error(msg["id"], "not_supported", t(hass, "Dit kan alleen in een CalDAV-agenda, zoals iCloud."))
        return
    agenda, entity = gevonden
    try:
        await hass.async_add_executor_job(werk, agenda)
    except CaldavFout as err:
        connection.send_error(msg["id"], "failed", str(err))
        return
    connection.send_result(msg["id"])
    # De eerstvolgende afspraak in de toestand bijwerken; anders loopt die tot een kwartier achter.
    try:
        await entity.coordinator.async_request_refresh()
    except Exception:  # noqa: BLE001 - de wijziging zelf is gelukt
        _LOGGER.debug("Opnieuw ophalen van %s lukte niet", entity_id, exc_info=True)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/agenda/caldav_weg",
        vol.Required("entity_id"): str,
        vol.Required("uid"): str,
        vol.Optional("start"): str,
        vol.Optional("end"): str,
    }
)
@websocket_api.async_response
async def ws_caldav_weg(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    van, tot = _tijd(msg.get("start")), _tijd(msg.get("end"))
    await _voer_uit(hass, connection, msg, lambda agenda: weghalen(hass, agenda, msg["uid"], van, tot))


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/agenda/caldav_wijzig",
        vol.Required("entity_id"): str,
        vol.Required("uid"): str,
        vol.Required("event"): EVENT,
        vol.Optional("start"): str,
        vol.Optional("end"): str,
    }
)
@websocket_api.async_response
async def ws_caldav_wijzig(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    van, tot = _tijd(msg.get("start")), _tijd(msg.get("end"))
    await _voer_uit(hass, connection, msg, lambda agenda: wijzigen(hass, agenda, msg["uid"], msg["event"], van, tot))
