"""Een afspraak in een CalDAV-agenda (iCloud) wijzigen en verwijderen. Alles **NIEUW GEDRAG** (0.119.0): `agenda_caldav.py`
bestond niet vóór deze ronde, en op de code van ervoor faalt dit bestand bij het importeren.

De eigenaar, 9 november 2026: "aanmaken werkt wel trouwens maar wijzigen niet van een bestaande uit apple agenda", en op de
vraag of het dan zelf moet: "ja doe maar".

Wat er naar de server gaat, wordt getoetst met de ECHTE bibliotheek (`caldav.Event`, dezelfde versie als de integratie
van Home Assistant 2026.8). Alleen het praten met de server (`save`, `delete`) is vervangen door een opname. iCloud zelf is
hier niet; in de testinstance is het nagemeten met een eigen CalDAV-server (zie het rapport).
"""

from __future__ import annotations

from types import SimpleNamespace
from typing import Any
from unittest.mock import AsyncMock, patch

import caldav
import pytest

from homeassistant.core import HomeAssistant

from custom_components.domotiapp_lovelace import agenda_caldav
from custom_components.domotiapp_lovelace.agenda_caldav import CaldavFout, caldav_agenda, weghalen, wijzigen

from .test_agenda import agenda_op, stuur  # noqa: F401 - fixture en hulp

UID = "6F1C2A40-0B4E-4C1D-9C1F-3B2E7A1D0001"

TANDARTS = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//iPhone OS 26.0//EN
BEGIN:VEVENT
UID:{UID}
DTSTAMP:20261101T090000Z
SEQUENCE:2
SUMMARY:Tandarts Anna
DTSTART:20261120T080000Z
DTEND:20261120T083000Z
LOCATION:Dorpsstraat 1
DESCRIPTION:Controle
ATTENDEE;CN=Bram Visser:mailto:bram@example.com
BEGIN:VALARM
ACTION:DISPLAY
TRIGGER:-PT15M
DESCRIPTION:Herinnering
END:VALARM
END:VEVENT
END:VCALENDAR
"""

VOETBAL = f"""BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:{UID}
DTSTAMP:20261101T090000Z
SUMMARY:Voetbal Tom
DTSTART:20261107T140000Z
DTEND:20261107T153000Z
RRULE:FREQ=WEEKLY
END:VEVENT
END:VCALENDAR
"""


class Agenda:
    """Een `caldav.Calendar` die één afspraak kent. Opslaan gaat door de echte `save` van de bibliotheek (die ook SEQUENCE
    ophoogt); alleen het versturen (`_create`) en weghalen worden opgenomen."""

    def __init__(self, ics: str | None) -> None:
        self.obj = None
        self.opgeslagen: list[str] = []
        self.weg = 0
        if ics is not None:
            self.obj = caldav.Event(client=None, url=f"https://caldav.example.com/werk/{UID}.ics", data=ics)
            self.obj._create = lambda *_, **__: self.opgeslagen.append(self.obj.data)

            def delete() -> None:
                self.weg += 1

            self.obj.delete = delete

    def event_by_uid(self, uid: str) -> Any:
        if self.obj is None or uid != UID:
            raise caldav.lib.error.NotFoundError("niet gevonden")
        return self.obj


NIEUW = {"summary": "Tandarts Anna en Tom", "dtstart": "2026-11-21T09:00:00.000Z", "dtend": "2026-11-21T10:00:00.000Z", "description": "Controle"}


async def test_wijzigen_zet_titel_tijden_en_plaats_en_laat_de_rest_staan(hass: HomeAssistant) -> None:
    agenda = Agenda(TANDARTS)
    await hass.async_add_executor_job(wijzigen, hass, agenda, UID, NIEUW)

    assert len(agenda.opgeslagen) == 1
    ics = agenda.opgeslagen[0].replace("\r\n ", "")
    assert "SUMMARY:Tandarts Anna en Tom" in ics
    assert "DTSTART:20261121T090000Z" in ics
    assert "DTEND:20261121T100000Z" in ics
    # De plaats was leeg gemaakt: weg. De omschrijving bleef.
    assert "LOCATION" not in ics
    assert "DESCRIPTION:Controle" in ics
    # Een nieuwere versie voor de iPhone: precies één hoger.
    assert "SEQUENCE:3" in ics
    assert "DTSTAMP:20261101T090000Z" not in ics
    # Wat de kaart niet kent, blijft staan.
    assert 'ATTENDEE;CN="Bram Visser":mailto:bram@example.com' in ics
    assert "TRIGGER:-PT15M" in ics
    assert f"UID:{UID}" in ics


async def test_een_hele_dag_wordt_een_datum(hass: HomeAssistant) -> None:
    agenda = Agenda(TANDARTS)
    await hass.async_add_executor_job(
        wijzigen, hass, agenda, UID, {"summary": "Vakantie", "dtstart": "2026-12-24", "dtend": "2026-12-27"}
    )
    ics = agenda.opgeslagen[0]
    assert "DTSTART;VALUE=DATE:20261224" in ics
    assert "DTEND;VALUE=DATE:20261227" in ics


async def test_zonder_sequence_wordt_het_1(hass: HomeAssistant) -> None:
    agenda = Agenda(TANDARTS.replace("SEQUENCE:2\n", ""))
    await hass.async_add_executor_job(wijzigen, hass, agenda, UID, NIEUW)
    assert "SEQUENCE:1" in agenda.opgeslagen[0]


async def test_verwijderen(hass: HomeAssistant) -> None:
    agenda = Agenda(TANDARTS)
    await hass.async_add_executor_job(weghalen, hass, agenda, UID)
    assert agenda.weg == 1


async def test_een_herhalende_afspraak_blijft_staan(hass: HomeAssistant) -> None:
    """Weghalen op de uid zou de hele reeks weghalen, terwijl de klant op één keer tikte."""
    agenda = Agenda(VOETBAL)
    with pytest.raises(CaldavFout, match="herhalende afspraak"):
        await hass.async_add_executor_job(weghalen, hass, agenda, UID)
    with pytest.raises(CaldavFout, match="herhalende afspraak"):
        await hass.async_add_executor_job(wijzigen, hass, agenda, UID, NIEUW)
    assert agenda.weg == 0
    assert agenda.opgeslagen == []


async def test_een_afspraak_die_er_niet_meer_is(hass: HomeAssistant) -> None:
    with pytest.raises(CaldavFout, match="staat niet meer in de agenda"):
        await hass.async_add_executor_job(weghalen, hass, Agenda(None), UID)


async def test_een_lokale_agenda_is_geen_caldav(hass: HomeAssistant, agenda_op, hass_ws_client) -> None:  # noqa: F811
    client = await hass_ws_client(hass)
    assert (await stuur(client, "toevoegen", soort="nieuw", naam="Werk"))["success"] is True
    await hass.async_block_till_done()
    assert hass.states.get("calendar.werk") is not None
    assert caldav_agenda(hass, "calendar.werk") is None
    assert caldav_agenda(hass, "calendar.bestaat_niet") is None

    antwoord = await stuur(client, "caldav_weg", entity_id="calendar.werk", uid=UID)
    assert antwoord["success"] is False
    assert antwoord["error"]["code"] == "not_supported"


async def test_de_commandos(hass: HomeAssistant, agenda_op, hass_ws_client) -> None:  # noqa: F811
    agenda = Agenda(TANDARTS)
    entiteit = SimpleNamespace(coordinator=SimpleNamespace(async_request_refresh=AsyncMock()))
    client = await hass_ws_client(hass)
    with patch.object(agenda_caldav, "caldav_agenda", return_value=(agenda, entiteit)):
        antwoord = await stuur(client, "caldav_wijzig", entity_id="calendar.werk", uid=UID, event=NIEUW)
        assert antwoord["success"] is True, antwoord
        assert "SUMMARY:Tandarts Anna en Tom" in agenda.opgeslagen[0]

        # Het eind voor het begin: niet naar de server.
        fout = await stuur(client, "caldav_wijzig", entity_id="calendar.werk", uid=UID, event={**NIEUW, "dtend": "2026-11-21T08:00:00Z"})
        assert fout["success"] is False
        assert fout["error"]["code"] == "invalid_format"
        assert len(agenda.opgeslagen) == 1

        antwoord = await stuur(client, "caldav_weg", entity_id="calendar.werk", uid=UID)
        assert antwoord["success"] is True
        assert agenda.weg == 1
        # De toestand van de agenda wordt bijgewerkt, na elke wijziging.
        assert entiteit.coordinator.async_request_refresh.await_count == 2

    with patch.object(agenda_caldav, "caldav_agenda", return_value=(Agenda(VOETBAL), entiteit)):
        fout = await stuur(client, "caldav_weg", entity_id="calendar.werk", uid=UID)
        assert fout["success"] is False
        assert fout["error"]["code"] == "failed"
        assert "Agenda-app" in fout["error"]["message"]
