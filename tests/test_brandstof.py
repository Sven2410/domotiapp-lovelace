"""De brandstofprijzen voor de brandstofkaart (0.143.0). **NIEUW GEDRAG**: `brandstof.py` bestond niet vóór deze ronde.

De invoer is echt: de pagina's van UnitedConsumers van 27 november 2026, ingekort tot de prijzen en de reeks
(`tests/js/vaste-invoer/unitedconsumers-*.html`).
"""

from __future__ import annotations

from datetime import date, datetime
import json
from pathlib import Path
import re

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from custom_components.domotiapp_lovelace import brandstof as b
from custom_components.domotiapp_lovelace.const import DOMAIN

from .conftest import zet_integratie_op

INVOER = Path(__file__).parent / "js" / "vaste-invoer"
LIJST = (INVOER / "unitedconsumers-lijst-2026-11-27.html").read_text(encoding="utf-8")
EURO95 = (INVOER / "unitedconsumers-euro95-2026-11-27.html").read_text(encoding="utf-8")
AMS = dt_util.get_time_zone("Europe/Amsterdam")


# ------------------------------------------------------------ lezen


def test_de_lijst_van_27_november() -> None:
    datum, prijzen = b.lees_lijst(LIJST)
    assert datum == date(2026, 11, 27)
    assert {s: (p["naam"], p["prijs"]) for s, p in prijzen.items()} == {
        "euro95": ("Euro95", 2.377),
        "diesel": ("Diesel", 2.42),
        "lpg": ("LPG", 1.335),
        "super": ("Super", 2.579),
        "super-mlv": ("Super MLV", 2.589),
        "premium-benzines": ("Premium benzines", 2.578),
        "premium-diesels": ("Premium diesels", 2.513),
    }


def test_de_reeks_van_een_jaar() -> None:
    reeks = b.lees_reeks(EURO95)
    assert len(reeks) == 365
    assert reeks[0] == ["2025-11-27", 2.188] and reeks[-1] == ["2026-11-26", 2.375]


def test_wat_de_kaart_krijgt() -> None:
    datum, prijzen = b.lees_lijst(LIJST)
    uit = b.voor_kaart({"prijzen": prijzen, "datum": datum.isoformat(), "reeksen": {"euro95": b.lees_reeks(EURO95)}}, date(2026, 11, 27))
    euro95 = next(p for p in uit["producten"] if p["slug"] == "euro95")
    # +0,2 cent, zoals de bron het ook zegt ("Verschil 0,2").
    assert (euro95["gisteren"], euro95["verschil"]) == (2.375, 0.002)
    assert len(euro95["reeks"]) == b.DAGEN_NAAR_KAART and euro95["reeks"][-1] == ["2026-11-27", 2.377]
    diesel = next(p for p in uit["producten"] if p["slug"] == "diesel")
    assert (diesel["gisteren"], diesel["verschil"], diesel["reeks"]) == (None, None, [["2026-11-27", 2.42]])


def test_een_slug_wordt_een_adres_alleen_als_hij_netjes_is() -> None:
    assert b.slug_van("super%20mlv") == "super-mlv" == b.slug_van("Super MLV")
    _, prijzen = b.lees_lijst('<a href="/tanken/brandstofprijzen/product/..%2F..%2Fadmin" title="x">x</a> € 1,000')
    assert prijzen == {}


def test_de_kaart_kent_dezelfde_brandstoffen() -> None:
    logica = (Path(__file__).parent.parent / "src/cards/brandstof-logica.js").read_text(encoding="utf-8")
    kaart = re.findall(r'\{ slug: "([^"]+)", naam: "([^"]+)" \}', logica)
    _, prijzen = b.lees_lijst(LIJST)
    assert kaart == [(s, p["naam"]) for s, p in prijzen.items()]


# ------------------------------------------------------------ ophalen


def bron(aioclient_mock, lijst: str = LIJST, status: int = 200, zonder_reeks: tuple[str, ...] = ()) -> None:
    aioclient_mock.get(b.LIJST, text=lijst, status=status)
    for slug in ("euro95", "diesel", "lpg", "super", "super-mlv", "premium-benzines", "premium-diesels"):
        aioclient_mock.get(b.PRODUCT.format(slug=slug), text="" if slug in zonder_reeks else EURO95)


async def test_eens_per_uur_en_de_reeksen_eens_per_dag(hass: HomeAssistant, freezer, aioclient_mock) -> None:
    # Een dag is een dag in Nederland: de testharnas staat anders op Pacific-tijd.
    await hass.config.async_set_time_zone("Europe/Amsterdam")
    freezer.move_to(datetime(2026, 11, 27, 9, 0, tzinfo=AMS))
    bron(aioclient_mock)
    brandstof = b.Brandstof(hass)
    uit = await brandstof.async_prijzen()
    assert uit["fout"] is None and len(uit["producten"]) == 7
    assert aioclient_mock.call_count == 8  # de lijst en zeven productpagina's
    freezer.move_to(datetime(2026, 11, 27, 9, 59, tzinfo=AMS))
    await brandstof.async_prijzen()
    assert aioclient_mock.call_count == 8
    # Na een uur alleen de lijst; de reeksen zijn van vandaag.
    freezer.move_to(datetime(2026, 11, 27, 10, 0, tzinfo=AMS))
    await brandstof.async_prijzen()
    assert aioclient_mock.call_count == 9
    # De volgende dag ook de reeksen weer.
    freezer.move_to(datetime(2026, 11, 28, 8, 0, tzinfo=AMS))
    await brandstof.async_prijzen()
    assert aioclient_mock.call_count == 17


async def test_een_ontbrekende_reeks_wordt_binnen_de_dag_alleen_zelf_opnieuw_gevraagd(hass: HomeAssistant, freezer, aioclient_mock) -> None:
    freezer.move_to(datetime(2026, 11, 27, 9, 0, tzinfo=AMS))
    bron(aioclient_mock, zonder_reeks=("lpg",))
    brandstof = b.Brandstof(hass)
    uit = await brandstof.async_prijzen()
    assert next(p for p in uit["producten"] if p["slug"] == "lpg")["gisteren"] is None
    assert aioclient_mock.call_count == 8
    freezer.move_to(datetime(2026, 11, 27, 10, 0, tzinfo=AMS))
    await brandstof.async_prijzen()
    assert [str(c[1]) for c in aioclient_mock.mock_calls[8:]] == [b.LIJST, b.PRODUCT.format(slug="lpg")]


async def test_een_fout_houdt_de_prijzen_en_wacht_vijf_minuten(hass: HomeAssistant, freezer, aioclient_mock) -> None:
    freezer.move_to(datetime(2026, 11, 27, 9, 0, tzinfo=AMS))
    bron(aioclient_mock)
    brandstof = b.Brandstof(hass)
    await brandstof.async_prijzen()
    aioclient_mock.clear_requests()
    bron(aioclient_mock, status=503)
    freezer.move_to(datetime(2026, 11, 27, 10, 30, tzinfo=AMS))
    uit = await brandstof.async_prijzen()
    assert uit["fout"] == "HTTP 503"
    assert {p["slug"]: p["prijs"] for p in uit["producten"]}["euro95"] == 2.377
    freezer.move_to(datetime(2026, 11, 27, 10, 34, tzinfo=AMS))
    await brandstof.async_prijzen()
    assert aioclient_mock.call_count == 1
    freezer.move_to(datetime(2026, 11, 27, 10, 35, tzinfo=AMS))
    await brandstof.async_prijzen()
    assert aioclient_mock.call_count == 2
    # Een pagina zonder prijzen (de site veranderde) is ook een fout, en ook dan blijven de oude staan.
    aioclient_mock.clear_requests()
    bron(aioclient_mock, lijst="<html>verbouwd</html>")
    freezer.move_to(datetime(2026, 11, 27, 10, 41, tzinfo=AMS))
    uit = await brandstof.async_prijzen()
    assert uit["fout"] == "geen prijzen gevonden op de pagina" and len(uit["producten"]) == 7


async def test_na_een_herstart_staan_de_prijzen_er_meteen(hass: HomeAssistant, freezer, aioclient_mock, hass_storage) -> None:
    """De opslag van vorige keer, een half uur oud: niets ophalen, en de prijzen staan er."""
    datum, prijzen = b.lees_lijst(LIJST)
    hass_storage[b.STORAGE_KEY] = {"version": 1, "data": {
        "prijzen": prijzen, "datum": datum.isoformat(), "opgehaald": datetime(2026, 11, 27, 9, 0, tzinfo=AMS).isoformat(),
        "reeksen": {"euro95": b.lees_reeks(EURO95)}, "reeksen_dag": "2026-11-27",
    }}
    freezer.move_to(datetime(2026, 11, 27, 9, 30, tzinfo=AMS))
    uit = await b.Brandstof(hass).async_prijzen()
    assert aioclient_mock.call_count == 0
    assert next(p for p in uit["producten"] if p["slug"] == "euro95")["verschil"] == 0.002


async def test_het_commando(hass: HomeAssistant, hass_ws_client, aioclient_mock) -> None:
    bron(aioclient_mock)
    await zet_integratie_op(hass)
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/brandstof/prijzen"})
    antwoord = await client.receive_json()
    assert antwoord["success"] is True
    assert antwoord["result"]["bron"] == "UnitedConsumers"
    assert json.dumps(antwoord["result"]).count('"slug"') == 7
