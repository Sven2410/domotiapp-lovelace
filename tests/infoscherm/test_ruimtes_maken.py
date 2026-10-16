"""Een ruimte maken en weghalen in het beheer. Alles **NIEUW GEDRAG**
(16 oktober 2026, 0.76.0): vóór deze ronde bestonden `ruimtes/nieuw` en
`ruimtes/weg` niet, en kon alleen een beheerder een ruimte kiezen, in de
kaartconfig.

De vraag kwam via een beheersessie bij een klant: *"De receptioniste moet dat
zelf kunnen maken."* Een Lokale agenda toevoegen mag in Home Assistant alleen een
beheerder; de server doet het namens wie het infoscherm mag beheren.

Met de ECHTE Lokale agenda van Home Assistant (`local_calendar`, met `ical` uit
requirements-test.txt): de config flow, de opslag op schijf, en boeken erin.
"""

from __future__ import annotations

from datetime import timedelta
from pathlib import Path

import pytest

from homeassistant.config_entries import SOURCE_USER
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
from homeassistant.util import dt as dt_util

from .conftest import stuur


@pytest.fixture
async def opgeruimd(hass: HomeAssistant, infoscherm_op):
    """Het agenda-component staat er al, en de Lokale agenda's gaan na de test
    weer weg (een agenda met een afspraak zet een timer op het begin en het eind).

    Eerst opzetten, want het agenda-component meldt een webadres aan, en de
    testclient bevriest de webserver zodra hij start. In Home Assistant zelf
    mag dat later (http zet het bevriezen uit), en bij een klant zonder één
    agenda gebeurt het ook pas bij de eerste ruimte."""
    # De Lokale agenda schrijft zijn .ics in .storage; in een echte installatie
    # bestaat die map, in de tijdelijke configmap van de test niet.
    (Path(hass.config.config_dir) / ".storage").mkdir(exist_ok=True)
    assert await async_setup_component(hass, "calendar", {})
    assert await async_setup_component(hass, "file_upload", {})
    await hass.async_block_till_done()
    yield
    for entry in hass.config_entries.async_entries("local_calendar"):
        await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()


async def receptie_op(hass, hass_ws_client, token):
    """Een gewone gebruiker, geen beheerder en geen kiosk: de receptie."""
    return await hass_ws_client(hass, token)


def morgen(uur: int) -> str:
    d = dt_util.now() + timedelta(days=1)
    return f"{d.date().isoformat()}T{uur:02d}:00"


async def test_de_receptie_maakt_een_ruimte_met_een_eigen_lokale_agenda(
    hass: HomeAssistant, opgeruimd, store, hass_ws_client, hass_read_only_user, hass_read_only_access_token
) -> None:
    assert not hass_read_only_user.is_admin
    receptie = await receptie_op(hass, hass_ws_client, hass_read_only_access_token)
    antwoord = await stuur(receptie, "ruimtes/nieuw", naam="Kleine vergaderruimte")
    assert antwoord["success"] is True, antwoord
    assert antwoord["result"]["gemaakt"] is True
    assert antwoord["result"]["ruimte"] == {"entity": "calendar.kleine_vergaderruimte", "naam": "", "gemaakt": True}

    [entry] = hass.config_entries.async_entries("local_calendar")
    assert entry.title == "Kleine vergaderruimte"
    assert hass.states.get("calendar.kleine_vergaderruimte") is not None
    assert store().snapshot()["installatie"]["ruimtes"] == [antwoord["result"]["ruimte"]]


async def test_in_een_gemaakte_ruimte_kan_meteen_geboekt_worden(
    hass: HomeAssistant, opgeruimd, hass_ws_client
) -> None:
    beheer = await hass_ws_client(hass)
    await stuur(beheer, "ruimtes/nieuw", naam="Spreekruimte")
    boek = await stuur(beheer, "ruimtes/boek", ruimte="calendar.spreekruimte", start=morgen(10), eind=morgen(11))
    assert boek["success"] is True, boek
    # En de echte agenda weigert een dubbele.
    dubbel = await stuur(beheer, "ruimtes/boek", ruimte="calendar.spreekruimte", start=morgen(10), eind=morgen(11))
    assert dubbel["error"]["code"] == "bezet"


async def test_de_kiosk_maakt_geen_ruimte(
    hass: HomeAssistant, opgeruimd, store, hass_ws_client, hass_read_only_user, hass_read_only_access_token
) -> None:
    await store().async_zet_instellingen({"kiosk_gebruikers": [hass_read_only_user.id]}, mag_kiosk_wijzigen=True)
    kiosk = await hass_ws_client(hass, hass_read_only_access_token)
    assert (await stuur(kiosk, "ruimtes/nieuw", naam="Spreekruimte"))["error"]["code"] == "unauthorized"
    assert hass.config_entries.async_entries("local_calendar") == []


@pytest.mark.parametrize(("naam", "uitleg"), [("", "naam"), ("   ", "naam"), ("!!!", "letters")])
async def test_een_ruimte_heeft_een_naam(hass: HomeAssistant, opgeruimd, hass_ws_client, naam, uitleg) -> None:
    beheer = await hass_ws_client(hass)
    fout = await stuur(beheer, "ruimtes/nieuw", naam=naam)
    assert fout["error"]["code"] == "invalid_format"
    assert uitleg in fout["error"]["message"]
    assert hass.config_entries.async_entries("local_calendar") == []


async def test_een_bestaande_lokale_agenda_wordt_gekoppeld_en_niet_weggehaald(
    hass: HomeAssistant, opgeruimd, store, hass_ws_client
) -> None:
    """De installateur maakte al een Lokale agenda met die naam: die wordt de
    ruimte, maar het beheer haalt hem niet weg."""
    flow = await hass.config_entries.flow.async_init("local_calendar", context={"source": SOURCE_USER})
    await hass.config_entries.flow.async_configure(flow["flow_id"], {"calendar_name": "Spreekruimte"})
    await hass.async_block_till_done()

    beheer = await hass_ws_client(hass)
    antwoord = await stuur(beheer, "ruimtes/nieuw", naam="spreekruimte")
    assert antwoord["result"]["gemaakt"] is False
    assert antwoord["result"]["ruimte"]["entity"] == "calendar.spreekruimte"
    assert len(hass.config_entries.async_entries("local_calendar")) == 1

    weg = await stuur(beheer, "ruimtes/weg", ruimte="calendar.spreekruimte")
    assert weg["error"]["code"] == "niet_van_beheer"
    assert len(hass.config_entries.async_entries("local_calendar")) == 1

    # Nog een keer dezelfde naam: hij staat er al.
    dubbel = await stuur(beheer, "ruimtes/nieuw", naam="Spreekruimte")
    assert dubbel["error"]["code"] == "invalid_format"
    assert "al een ruimte" in dubbel["error"]["message"]


async def test_weghalen_haalt_ook_de_agenda_weg(
    hass: HomeAssistant, opgeruimd, store, hass_ws_client, hass_read_only_access_token
) -> None:
    receptie = await receptie_op(hass, hass_ws_client, hass_read_only_access_token)
    await stuur(receptie, "ruimtes/nieuw", naam="Spreekruimte")
    await stuur(receptie, "ruimtes/boek", ruimte="calendar.spreekruimte", start=morgen(9), eind=morgen(10))

    weg = await stuur(receptie, "ruimtes/weg", ruimte="calendar.spreekruimte")
    assert weg["result"] == {"ruimte": "calendar.spreekruimte", "agenda_weg": True}
    await hass.async_block_till_done()
    assert hass.config_entries.async_entries("local_calendar") == []
    assert hass.states.get("calendar.spreekruimte") is None
    assert store().snapshot()["installatie"]["ruimtes"] == []


async def test_de_kaartconfig_van_de_installateur_laat_een_gemaakte_ruimte_staan(
    hass: HomeAssistant, opgeruimd, store, hass_ws_client
) -> None:
    """Bij een klant stond `rooms: []` in de kaartconfig. Zonder dit zou elke
    keer dat een beheerder het beheer opent de ruimte van de receptie weg zijn."""
    beheer = await hass_ws_client(hass)
    await stuur(beheer, "ruimtes/nieuw", naam="Spreekruimte")

    r = await store().async_zet_installatie_van_kaart({"ruimtes": []})
    assert r["gewijzigd"] is False
    assert [x["entity"] for x in store().snapshot()["installatie"]["ruimtes"]] == ["calendar.spreekruimte"]

    # Een agenda die de installateur kiest komt erbij, achteraan.
    await store().async_zet_installatie_van_kaart({"ruimtes": ["calendar.outlook_vergaderzaal"]})
    ruimtes = store().snapshot()["installatie"]["ruimtes"]
    assert [(x["entity"], x["gemaakt"]) for x in ruimtes] == [
        ("calendar.spreekruimte", True),
        ("calendar.outlook_vergaderzaal", False),
    ]


async def test_de_receptie_kan_een_ruimte_van_de_installateur_niet_tot_gemaakt_maken(
    hass: HomeAssistant, opgeruimd, store
) -> None:
    """Anders kon ze daarna met `ruimtes/weg` een agenda van een ander weghalen."""
    await store().async_zet_installatie_van_kaart({"ruimtes": ["calendar.outlook_vergaderzaal"]})
    await store().async_zet_installatie(
        {"ruimtes": [{"entity": "calendar.outlook_vergaderzaal", "naam": "Zaal", "gemaakt": True}]},
        mag_entiteiten_wijzigen=False,
    )
    assert store().snapshot()["installatie"]["ruimtes"] == [
        {"entity": "calendar.outlook_vergaderzaal", "naam": "Zaal", "gemaakt": False}
    ]
