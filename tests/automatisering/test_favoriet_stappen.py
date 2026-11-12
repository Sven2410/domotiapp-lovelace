"""Een favoriet die na een tijd nog iets doet (0.122.0). Alles NIEUW GEDRAG.

De eigenaar, 12 november 2026: "ik wil dat als optie hebben na zoveel tijd ook iets aan of uit". Het voorbeeld is Slapen:
beneden uit en de overloop aan, en tien minuten later de overloop weer uit. Wat hier vooral getoetst wordt, is de
herstart: de stap staat met zijn tijdstip in de opslag, en komt na een herstart gewoon.
"""

from __future__ import annotations

from datetime import timedelta
from typing import Any

import pytest

from homeassistant.const import EVENT_HOMEASSISTANT_STOP
from homeassistant.core import HomeAssistant

from custom_components.domotiapp_lovelace.automatisering.const import DATA_MOTOR, STORAGE_KEY
from custom_components.domotiapp_lovelace.automatisering.motor import doelen_van_stap
from custom_components.domotiapp_lovelace.const import DOMAIN

from .conftest import GEHEIM, KAART, KEUKEN, WOONKAMER, laat_starten, om, tik, zet_dashboard

T = f"{DOMAIN}/automatisering"
SPEAKER = "media_player.keuken"


def _slapen(**extra: Any) -> dict[str, Any]:
    """Woonkamer uit en de keuken aan, en na tien minuten de keuken weer uit."""
    return {
        "naam": "Slapen",
        "icoon": "sleep",
        "lampen": [WOONKAMER, KEUKEN],
        "helderheden": {WOONKAMER: 0, KEUKEN: 40},
        "daarna": [{"na": 10, "lampen": [KEUKEN], "helderheden": {KEUKEN: 0}}],
        **extra,
    }


@pytest.fixture
async def ws(hass: HomeAssistant, opgezet, hass_ws_client, hass_read_only_access_token):
    return await hass_ws_client(hass, hass_read_only_access_token)


async def _vraag(ws, **bericht: Any) -> dict[str, Any]:
    await ws.send_json_auto_id(bericht)
    return await ws.receive_json()


async def _bewaar(ws, **extra: Any) -> dict[str, Any]:
    uit = await _vraag(ws, type=f"{T}/favoriet_opslaan", favoriet=_slapen(**extra))
    assert uit["success"], uit
    return uit["result"]["favoriet"]


async def _druk(hass: HomeAssistant, ws, favoriet: dict[str, Any]) -> None:
    uit = await _vraag(ws, type=f"{T}/favoriet_uitvoeren", favoriet=favoriet["id"])
    assert uit["success"], uit
    await hass.async_block_till_done()


async def _herstart(hass: HomeAssistant, freezer, tot, netjes: bool = True) -> None:
    """Stop (met of zonder afsluiten, zoals bij een stroomstoring) en start opnieuw op dit tijdstip."""
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    if netjes:
        hass.bus.async_fire(EVENT_HOMEASSISTANT_STOP)
        await hass.async_block_till_done()
    await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    freezer.move_to(tot)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await laat_starten(hass, freezer, tot)


UIT_KEUKEN = ("turn_off", {"entity_id": [KEUKEN]})


async def test_de_stap_komt_na_de_gekozen_tijd(hass: HomeAssistant, ws, opgezet, lampen, freezer) -> None:
    f = await _bewaar(ws)
    assert f["daarna"] == [{"na": 10, "lampen": [KEUKEN], "helderheden": {KEUKEN: 0}}]
    await tik(hass, freezer, om(2, 12, 1))
    await _druk(hass, ws, f)
    assert ("turn_off", {"entity_id": [WOONKAMER]}) in lampen
    assert ("turn_on", {"entity_id": [KEUKEN], "brightness_pct": 40}) in lampen
    lampen.clear()
    await tik(hass, freezer, om(2, 12, 10, 59))
    assert lampen == []
    await tik(hass, freezer, om(2, 12, 11, 1))
    assert lampen == [UIT_KEUKEN]
    assert opgezet.opslag.gepland == []
    await tik(hass, freezer, om(2, 12, 30))
    assert lampen == [UIT_KEUKEN]


async def test_een_tweede_tik_begint_opnieuw(hass: HomeAssistant, ws, opgezet, lampen, freezer) -> None:
    f = await _bewaar(ws)
    await tik(hass, freezer, om(2, 12, 1))
    await _druk(hass, ws, f)
    await tik(hass, freezer, om(2, 12, 6))
    await _druk(hass, ws, f)
    lampen.clear()
    await tik(hass, freezer, om(2, 12, 11, 30))
    assert lampen == []
    await tik(hass, freezer, om(2, 12, 16, 1))
    assert lampen == [UIT_KEUKEN]


async def test_de_stap_overleeft_een_herstart_halverwege(
    hass: HomeAssistant, ws, opgezet, lampen, freezer, hass_storage
) -> None:
    """Tik om 12:01, herstart van 12:05 tot 12:06: om 12:11 gaat de keuken toch uit, en één keer."""
    f = await _bewaar(ws)
    await tik(hass, freezer, om(2, 12, 1))
    await _druk(hass, ws, f)
    await tik(hass, freezer, om(2, 12, 5))
    assert [g["sleutel"] for g in hass_storage[STORAGE_KEY]["data"]["gepland"]] == [f"{f['id']}:0"]
    lampen.clear()
    await _herstart(hass, freezer, om(2, 12, 6))
    assert lampen == []
    await tik(hass, freezer, om(2, 12, 11, 1))
    assert lampen == [UIT_KEUKEN]
    await tik(hass, freezer, om(2, 12, 20))
    assert lampen == [UIT_KEUKEN]
    assert hass.data[DOMAIN][DATA_MOTOR].opslag.gepland == []


async def test_wat_tijdens_de_herstart_moest_gebeurt_alsnog(
    hass: HomeAssistant, ws, opgezet, lampen, freezer
) -> None:
    """Weg van 12:05 tot 12:20, ook zonder netjes afsluiten: de keuken gaat na het opstarten uit."""
    f = await _bewaar(ws)
    await tik(hass, freezer, om(2, 12, 1))
    await _druk(hass, ws, f)
    await tik(hass, freezer, om(2, 12, 5))
    lampen.clear()
    await _herstart(hass, freezer, om(2, 12, 20), netjes=False)
    assert lampen == [UIT_KEUKEN]
    await tik(hass, freezer, om(2, 12, 30))
    assert lampen == [UIT_KEUKEN]


async def test_weghalen_haalt_ook_de_stap_weg(hass: HomeAssistant, ws, opgezet, lampen, freezer) -> None:
    f = await _bewaar(ws)
    await tik(hass, freezer, om(2, 12, 1))
    await _druk(hass, ws, f)
    assert (await _vraag(ws, type=f"{T}/favoriet_verwijder", favoriet=f["id"]))["success"]
    lampen.clear()
    await tik(hass, freezer, om(2, 12, 12))
    assert lampen == []
    assert opgezet.opslag.gepland == []


async def test_een_lamp_die_van_de_kaart_ging_blijft_eraf(
    hass: HomeAssistant, ws, opgezet, lampen, freezer
) -> None:
    f = await _bewaar(ws)
    await tik(hass, freezer, om(2, 12, 1))
    await _druk(hass, ws, f)
    await zet_dashboard(hass, [{**KAART, "lampen": [WOONKAMER]}])
    await opgezet.async_herlees()
    lampen.clear()
    await tik(hass, freezer, om(2, 12, 12))
    assert lampen == []


async def test_zonder_stappen_is_er_niets_gepland(hass: HomeAssistant, ws, opgezet, lampen, freezer) -> None:
    """REGRESSIEWACHT: een favoriet van voor 0.122.0 doet wat hij deed."""
    f = await _bewaar(ws, daarna=[])
    await _druk(hass, ws, f)
    assert opgezet.opslag.gepland == []


@pytest.mark.parametrize(
    "stap",
    [
        {"na": 0, "lampen": [KEUKEN]},
        {"na": 24 * 60 + 1, "lampen": [KEUKEN]},
        {"na": 10, "lampen": []},
        {"na": 10, "lampen": [KEUKEN], "helderheden": {KEUKEN: 101}},
    ],
)
async def test_een_stap_die_niet_klopt_komt_er_niet_in(ws, opgezet, stap) -> None:
    uit = await _vraag(ws, type=f"{T}/favoriet_opslaan", favoriet=_slapen(daarna=[stap]))
    assert not uit["success"]
    assert opgezet.opslag.favorieten == []


async def test_een_lamp_buiten_de_kaart_in_een_stap_weigert_de_server(ws, opgezet) -> None:
    uit = await _vraag(ws, type=f"{T}/favoriet_opslaan", favoriet=_slapen(daarna=[{"na": 5, "lampen": [GEHEIM]}]))
    assert uit["error"]["code"] == "not_allowed"


def test_te_laat_volgt_de_grenzen_van_een_regel() -> None:
    stap = {"lampen": [WOONKAMER, KEUKEN, SPEAKER], "helderheden": {WOONKAMER: 0, KEUKEN: 50, SPEAKER: 30}}
    mag = {WOONKAMER, KEUKEN, SPEAKER}
    assert doelen_van_stap(stap, mag, timedelta(0)) == {WOONKAMER: 0, KEUKEN: 50, SPEAKER: 30}
    # Muziek alleen vlak na de tijd.
    assert doelen_van_stap(stap, mag, timedelta(minutes=10)) == {WOONKAMER: 0, KEUKEN: 50}
    # Aan tot een paar uur, uit tot een etmaal.
    assert doelen_van_stap(stap, mag, timedelta(hours=5)) == {WOONKAMER: 0}
    assert doelen_van_stap(stap, mag, timedelta(hours=25)) == {}
    # Wat niet meer op de kaart staat, nooit.
    assert doelen_van_stap(stap, {KEUKEN}, timedelta(0)) == {KEUKEN: 50}
