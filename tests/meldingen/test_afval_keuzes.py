"""Afval per persoon (0.87.0): wanneer, en welke bakken. **NIEUW GEDRAG**, op
twee gelabelde REGRESSIEWACHTEN na.

Gevraagd op 25 oktober 2026, na hetzelfde voor de robotstofzuiger: *"ja doe dat
ook voor afval"*.
"""

from __future__ import annotations

from datetime import datetime

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from custom_components.domotiapp_lovelace.meldingen.websocket import stand

from .conftest import ANNA, BRAM, KAART, zet_dashboard

AMS = dt_util.get_time_zone("Europe/Amsterdam")


def om(dag: int, uur: int, minuut: int) -> datetime:
    return datetime(2026, 9, dag, uur, minuut, tzinfo=AMS)


async def test_alleen_de_ochtend(hass: HomeAssistant, motor, telefoons) -> None:
    motor.opslag.zet_keuze("afval", ANNA, "momenten", ["vandaag"])
    hass.states.async_set("sensor.afval_morgen", "gft")
    await motor._tik(om(26, 19, 30))
    assert [d for d, _ in telefoons] == ["test_bram"]

    telefoons.clear()
    hass.states.async_set("sensor.afval_vandaag", "gft")
    await motor._tik(om(27, 7, 30))
    assert [d for d, _ in telefoons] == ["test_bram", "test_anna"]


async def test_alleen_de_eigen_bakken_in_de_melding(hass: HomeAssistant, motor, telefoons) -> None:
    motor.opslag.zet_keuze("afval", ANNA, "bakken_niet", ["Papier"])
    hass.states.async_set("sensor.afval_morgen", "Papier, Restafval")
    await motor._tik(om(26, 19, 30))
    per = {d: b for d, b in telefoons}
    assert per["test_bram"]["title"] == "Morgen Papier en Restafval"
    assert per["test_anna"]["title"] == "Morgen Restafval"
    assert per["test_anna"]["message"] == "Morgen wordt Restafval opgehaald. Zet de container vanavond aan de straat."
    # Dezelfde tag en knop: "Staat buiten" blijft één ding voor het huis.
    assert per["test_anna"]["data"] == per["test_bram"]["data"]


async def test_geen_van_zijn_bakken_is_geen_melding(hass: HomeAssistant, motor, telefoons) -> None:
    motor.opslag.zet_keuze("afval", ANNA, "bakken_niet", ["gft"])
    hass.states.async_set("sensor.afval_morgen", "GFT")
    await motor._tik(om(26, 19, 30))
    assert [d for d, _ in telefoons] == ["test_bram"]


async def test_een_nieuwe_bak_krijgt_iedereen(hass: HomeAssistant, motor, telefoons) -> None:
    """REGRESSIEWACHT (slaagt ook op 0.86.0, waar nog niemand kon kiezen).
    Bewaard is wat iemand NIET wil: een bak die later opduikt, krijgt hij gewoon."""
    motor.opslag.zet_keuze("afval", ANNA, "bakken_niet", ["Papier"])
    hass.states.async_set("sensor.afval_morgen", "Kerstbomen")
    await motor._tik(om(26, 19, 30))
    assert [d for d, _ in telefoons] == ["test_bram", "test_anna"]


async def test_de_kaart_leert_de_bakken(hass: HomeAssistant, motor) -> None:
    await zet_dashboard(hass, [{**KAART, "afval_bakken": ["papier", "PMD"]}])
    hass.states.async_set("sensor.afval_morgen", "gft")
    await motor.async_herlees()
    hass.states.async_set("sensor.afval_morgen", "Papier, Restafval")
    await motor.async_herlees()
    assert motor.opslag.gezien("afval") == ["GFT", "Papier", "Restafval"]
    # Eerst wat in de editor staat, dan wat de sensor noemde.
    assert stand(hass, "afval")["bakken"] == ["Papier", "PMD", "GFT", "Restafval"]


async def test_de_proef_kijkt_niet_naar_de_keuze(hass: HomeAssistant, motor, telefoons) -> None:
    """REGRESSIEWACHT (slaagt ook op 0.86.0): een proef gaat altijd."""
    motor.opslag.zet_keuze("afval", ANNA, "momenten", [])
    uitkomst = await motor.async_verstuur("afval", "morgen", proef=True, alleen=ANNA)
    assert uitkomst["verstuurd"] == [ANNA]


async def test_keuze_momenten_via_de_websocket(hass: HomeAssistant, motor, hass_ws_client) -> None:
    ws = await hass_ws_client(hass)
    await ws.send_json({
        "id": 1, "type": "domotiapp_lovelace/meldingen/keuze", "melding": "afval",
        "persoon": BRAM, "soort": "momenten", "waarden": ["morgen"],
    })
    antwoord = await ws.receive_json()
    assert antwoord["success"], antwoord
    assert motor.opslag.keuze("afval", BRAM) == {"momenten": ["morgen"]}
