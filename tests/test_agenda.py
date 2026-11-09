"""Een agenda toevoegen via de agendakaart. Alles **NIEUW GEDRAG** (0.116.0): `agenda.py` bestond niet vóór deze ronde, en
op de code van ervoor faalt dit bestand bij het importeren.

De eigenaar, 8 november 2026: "Ik wil dat de klant ook zelf een agenda kan aanmaken en evenementen etc kan maken. Of een
bestaande toevoegen zoals google of apple".

De Lokale agenda is de ECHTE van Home Assistant (net als in `infoscherm/test_ruimtes_maken.py`). Google en Apple gaan naar
internet; daar wordt alleen getoetst wat er de config flow in gaat en hoe zijn antwoord bij de klant aankomt.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any
from unittest.mock import patch

import pytest

from homeassistant.components.lovelace.const import LOVELACE_DATA
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers import entity_registry as er
from homeassistant.setup import async_setup_component

from custom_components.domotiapp_lovelace.agenda import DATA_AGENDA, ICLOUD, KAART_TYPE, OVERZICHT_TYPE, Agendas, google_adres
from custom_components.domotiapp_lovelace.const import DOMAIN

from .conftest import zet_integratie_op

GEHEIM = "https://calendar.google.com/calendar/ical/bram.visser%40gmail.com/private-0123456789abcdef/basic.ics"


@pytest.fixture
async def agenda_op(hass: HomeAssistant):
    """De integratie, het agenda-component, en na de test de Lokale agenda's weer weg (zie test_ruimtes_maken.py)."""
    (Path(hass.config.config_dir) / ".storage").mkdir(exist_ok=True)
    assert await async_setup_component(hass, "calendar", {})
    await zet_integratie_op(hass)
    await hass.async_block_till_done()
    yield
    for entry in hass.config_entries.async_entries("local_calendar"):
        await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()


@pytest.fixture
async def klant(hass: HomeAssistant, hass_ws_client):
    """Een gewone gebruiker (groep Gebruikers), geen beheerder: zoals een klant. Niet de alleen-lezen-gebruiker van de
    testomgeving, want die mag geen enkele entiteit bedienen, ook geen afspraak zetten."""
    gebruiker = await hass.auth.async_create_user("Bram Visser", group_ids=["system-users"])
    assert not gebruiker.is_admin
    vernieuw = await hass.auth.async_create_refresh_token(gebruiker, "https://example.com/")
    token = hass.auth.async_create_access_token(vernieuw)
    return lambda: hass_ws_client(hass, token)


async def zet_kaart(hass: HomeAssistant, kaart_type: str = KAART_TYPE, **config: Any) -> None:
    await hass.data[LOVELACE_DATA].dashboards[None].async_save(
        {"views": [{"type": "sections", "sections": [{"type": "grid", "cards": [{"type": kaart_type, **config}]}]}]}
    )
    await hass.async_block_till_done()


async def stuur(client, commando: str, **velden: Any) -> dict[str, Any]:
    await client.send_json_auto_id({"type": f"{DOMAIN}/agenda/{commando}", **velden})
    return await client.receive_json()


def test_alleen_een_ical_adres_van_google() -> None:
    assert google_adres(GEHEIM) == GEHEIM
    assert google_adres("  " + GEHEIM.replace("https://", "webcal://") + " ") == GEHEIM
    openbaar = "https://calendar.google.com/calendar/ical/nl.dutch%23holiday%40group.v.calendar.google.com/public/basic.ics"
    assert google_adres(openbaar) == openbaar
    for fout in (
        GEHEIM.replace("https://", "http://"),
        GEHEIM.replace("calendar.google.com", "calendar.google.com.evil.example"),
        "https://192.168.1.1/calendar/ical/x/public/basic.ics",
        GEHEIM + "?x=1",
        "https://calendar.google.com/calendar/ical/../../admin/public/basic.ics",
        "https://calendar.google.com/calendar/embed?src=x",
        None,
        42,
    ):
        assert google_adres(fout) is None, fout


async def test_een_gewone_gebruiker_maakt_een_nieuwe_agenda_en_die_overleeft_een_herstart(
    hass: HomeAssistant, agenda_op, klant
) -> None:
    await zet_kaart(hass)
    klant = await klant()

    antwoord = await stuur(klant, "toevoegen", soort="nieuw", naam="Gezin Visser")
    assert antwoord["success"] is True, antwoord
    assert antwoord["result"]["entiteiten"] == ["calendar.gezin_visser"]
    assert antwoord["result"]["gemaakt"] is True
    [entry] = hass.config_entries.async_entries("local_calendar")
    assert entry.title == "Gezin Visser"

    # In de agenda die de klant maakte, kan hij meteen een afspraak zetten, met het commando van Home Assistant zelf.
    await klant.send_json_auto_id(
        {
            "type": "calendar/event/create",
            "entity_id": "calendar.gezin_visser",
            "event": {"summary": "Tandarts Anna", "dtstart": "2026-11-20T09:00:00+01:00", "dtend": "2026-11-20T09:30:00+01:00"},
        }
    )
    assert (await klant.receive_json())["success"] is True

    # Na een herstart leest een nieuwe lijst hem uit de opslag.
    await hass.data[DOMAIN][DATA_AGENDA]._store._async_handle_write_data()
    opnieuw = Agendas(hass)
    await opnieuw.async_laad()
    assert [(a["naam"], a["soort"], a["entiteiten"]) for a in opnieuw.lijst()] == [("Gezin Visser", "nieuw", ["calendar.gezin_visser"])]


async def test_het_abonnement_geeft_de_lijst_en_opnieuw_na_toevoegen(hass: HomeAssistant, agenda_op, hass_ws_client) -> None:
    beheer = await hass_ws_client(hass)
    await beheer.send_json_auto_id({"type": f"{DOMAIN}/agenda/subscribe"})
    assert (await beheer.receive_json())["success"] is True
    assert (await beheer.receive_json())["event"] == {"agendas": []}

    toevoegen = await hass_ws_client(hass)
    assert (await stuur(toevoegen, "toevoegen", soort="nieuw", naam="Werk"))["success"] is True
    gezien = []
    while not gezien or not gezien[-1]:
        gezien.append((await beheer.receive_json())["event"]["agendas"])
    assert [a["entiteiten"] for a in gezien[-1]] == [["calendar.werk"]]


async def test_een_agenda_in_het_register_stuurt_de_lijst_opnieuw_zonder_fout(
    hass: HomeAssistant, agenda_op, hass_ws_client, caplog: pytest.LogCaptureFixture
) -> None:
    """NIEUW GEDRAG (0.118.0). Een `event_filter` krijgt van Home Assistant de gegevens van de gebeurtenis, niet de gebeurtenis
    zelf. Tot 0.117.1 vroeg het filter `event.data`, en dan stond er bij elke wijziging in het register "Error in event
    filter" in het log (bij de eigenaar 24 keer in twee minuten, nadat hij Apple koppelde), en kwam er niets."""
    beheer = await hass_ws_client(hass)
    await beheer.send_json_auto_id({"type": f"{DOMAIN}/agenda/subscribe"})
    assert (await beheer.receive_json())["success"] is True
    assert (await beheer.receive_json())["event"] == {"agendas": []}

    register = er.async_get(hass)
    register.async_get_or_create("sensor", "proef", "iets_anders")
    register.async_get_or_create("calendar", "proef", "verjaardagen")
    await hass.async_block_till_done()

    assert "Error in event filter" not in caplog.text
    assert (await beheer.receive_json())["event"] == {"agendas": []}


async def test_een_bestaande_lokale_agenda_wordt_gekoppeld_en_bij_weghalen_alleen_losgemaakt(
    hass: HomeAssistant, agenda_op, hass_ws_client
) -> None:
    beheer = await hass_ws_client(hass)
    eerst = hass.data[DOMAIN][DATA_AGENDA]
    # Iemand anders maakte "Gezin" al, buiten de kaart om.
    await eerst._async_flow("local_calendar", {"calendar_name": "Gezin", "import": "create_empty"})
    await hass.async_block_till_done()

    antwoord = await stuur(beheer, "toevoegen", soort="nieuw", naam="Gezin")
    assert antwoord["result"]["gemaakt"] is False
    assert len(hass.config_entries.async_entries("local_calendar")) == 1

    weg = await stuur(beheer, "weg", entry_id=antwoord["result"]["entry_id"])
    assert weg["result"]["integratie_weg"] is False
    assert len(hass.config_entries.async_entries("local_calendar")) == 1
    assert eerst.lijst() == []


async def test_wat_de_klant_maakte_gaat_bij_weghalen_helemaal_weg(hass: HomeAssistant, agenda_op, hass_ws_client) -> None:
    beheer = await hass_ws_client(hass)
    antwoord = await stuur(beheer, "toevoegen", soort="nieuw", naam="Oppas")
    weg = await stuur(beheer, "weg", entry_id=antwoord["result"]["entry_id"])
    assert weg["result"]["integratie_weg"] is True
    assert hass.config_entries.async_entries("local_calendar") == []
    assert (await stuur(beheer, "weg", entry_id=antwoord["result"]["entry_id"]))["error"]["code"] == "not_found"


async def test_google_en_apple_krijgen_een_vast_adres_en_een_fout_in_woorden(hass: HomeAssistant, agenda_op, hass_ws_client) -> None:
    beheer = await hass_ws_client(hass)
    gevraagd: list[tuple[str, dict[str, Any]]] = []

    async def flow(self, domein, invoer):
        gevraagd.append((domein, invoer))
        if domein == "caldav":
            # iCloud zegt 403 bij een onbekende Apple ID, en dat heet bij de CalDAV-integratie cannot_connect.
            fout = "invalid_auth" if invoer["username"].startswith("bram") else "cannot_connect"
            return {"type": FlowResultType.FORM, "step_id": "user", "flow_id": "x", "errors": {"base": fout}}
        return {"type": FlowResultType.ABORT, "reason": "already_configured"}

    with patch.object(Agendas, "_async_flow", flow):
        # Geen adres van Google: de flow wordt niet eens gestart.
        fout = await stuur(beheer, "toevoegen", soort="google", naam="Thuis", adres="http://192.168.1.1/admin")
        assert fout["error"]["code"] == "invalid_format"
        assert gevraagd == []

        dubbel = await stuur(beheer, "toevoegen", soort="google", naam="Thuis", adres=GEHEIM)
        assert dubbel["error"]["code"] == "bestaat_al"
        apple = await stuur(beheer, "toevoegen", soort="apple", gebruiker="bram@example.com", wachtwoord="abcd-efgh-ijkl-mnop")
        assert apple["error"]["code"] == "verkeerd_wachtwoord"
        assert "app-specifiek" in apple["error"]["message"]
        verboden = await stuur(beheer, "toevoegen", soort="apple", gebruiker="anna@example.com", wachtwoord="abcd-efgh-ijkl-mnop")
        assert verboden["error"]["code"] == "verkeerd_wachtwoord"
        assert "iCloud gaf geen toegang" in verboden["error"]["message"]

    assert gevraagd == [
        ("remote_calendar", {"calendar_name": "Thuis", "url": GEHEIM, "verify_ssl": True}),
        ("caldav", {"url": ICLOUD, "username": "bram@example.com", "password": "abcd-efgh-ijkl-mnop", "verify_ssl": True}),
        ("caldav", {"url": ICLOUD, "username": "anna@example.com", "password": "abcd-efgh-ijkl-mnop", "verify_ssl": True}),
    ]


async def test_een_gewone_gebruiker_mag_alleen_als_er_een_agendakaart_staat_met_toevoegen_aan(
    hass: HomeAssistant, agenda_op, klant
) -> None:
    klant = await klant()
    assert (await stuur(klant, "toevoegen", soort="nieuw", naam="Gezin"))["error"]["code"] == "unauthorized"

    await zet_kaart(hass, toevoegen=False)
    assert (await stuur(klant, "toevoegen", soort="nieuw", naam="Gezin"))["error"]["code"] == "unauthorized"
    assert hass.config_entries.async_entries("local_calendar") == []

    await zet_kaart(hass)
    assert (await stuur(klant, "toevoegen", soort="nieuw", naam="Gezin"))["success"] is True


async def test_een_gewone_gebruiker_mag_het_ook_vanaf_de_overzichtskaart(hass: HomeAssistant, agenda_op, klant) -> None:
    """NIEUW GEDRAG in 0.117.0. De eigenaar, 9 november 2026, met alleen een overzichtskaart op zijn dashboard: "ik kan
    niet zelf een agenda maken hoe kan dat?". Faalt op 0.116.0: OVERZICHT_TYPE bestond niet, en de server las alleen
    agendakaarten."""
    klant = await klant()
    await zet_kaart(hass, OVERZICHT_TYPE, agenda_toevoegen=False)
    assert (await stuur(klant, "toevoegen", soort="nieuw", naam="Gezin"))["error"]["code"] == "unauthorized"

    await zet_kaart(hass, OVERZICHT_TYPE, weer="weather.thuis")
    assert (await stuur(klant, "toevoegen", soort="nieuw", naam="Gezin"))["success"] is True
