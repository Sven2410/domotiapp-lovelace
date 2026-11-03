"""Zonneschermen en de windgrens (0.104.0).

De eigenaar wil zonneschermen op de automatiseringskaart kunnen kiezen; de windgrens is het voorstel van de beheersessie. Zie de
kop van `automatisering/wind.py`. Alles NIEUW GEDRAG, behalve wat met REGRESSIEWACHT begint: 0.103.0 kent `zonneschermen` op de
kaart niet, en weigert ze dus in een regel.
"""

from __future__ import annotations

from typing import Any

import pytest

from homeassistant.components.cover import CoverEntityFeature
from homeassistant.const import EVENT_HOMEASSISTANT_STOP
from homeassistant.core import HomeAssistant, ServiceCall

from custom_components.domotiapp_lovelace.automatisering.const import DATA_MOTOR
from custom_components.domotiapp_lovelace.const import DOMAIN

from .conftest import KAART, laat_starten, om, tik, zet_dashboard

T = f"{DOMAIN}/automatisering"
KEUKEN, WOONKAMER, ANDERSOM = "cover.zonnescherm_keuken", "cover.zonnescherm_woonkamer", "cover.zonnescherm_andersom"
ROLLUIK = "cover.rolluik"
WIND = "sensor.weerstation_windstoten"
KAART_SCHERM = {
    **KAART,
    "rolluiken": [ROLLUIK],
    "zonneschermen": [{"entity": KEUKEN, "name": "Keuken"}, WOONKAMER, ANDERSOM],
    "omgekeerd": [ANDERSOM],
    "wind_sensor": WIND,
    "wind_max": 30,
}
ELKE_DAG = [0, 1, 2, 3, 4, 5, 6]


def zet_wind(hass: HomeAssistant, waarde: Any, eenheid: str | None = "m/s") -> None:
    hass.states.async_set(WIND, str(waarde), {"unit_of_measurement": eenheid} if eenheid else {})


@pytest.fixture
def schermen(hass: HomeAssistant) -> list[tuple[str, list[str]]]:
    aanroepen: list[tuple[str, list[str]]] = []

    async def ontvang(call: ServiceCall) -> None:
        aanroepen.append((call.service, sorted(call.data["entity_id"])))

    for dienst in ("open_cover", "close_cover", "set_cover_position"):
        hass.services.async_register("cover", dienst, ontvang)
    # Somfy io zonder terugmelding: de stand is onbekend, en open en dicht is alles wat hij kan.
    for ident in (KEUKEN, WOONKAMER, ANDERSOM, ROLLUIK):
        hass.states.async_set(ident, "unknown", {"supported_features": int(CoverEntityFeature.OPEN | CoverEntityFeature.CLOSE)})
    return aanroepen


async def _kaart(hass: HomeAssistant, motor, kaart: dict[str, Any]) -> None:
    await zet_dashboard(hass, [kaart])
    await motor.async_herlees()


@pytest.fixture
async def motor(hass: HomeAssistant, opgezet, schermen, freezer):
    zet_wind(hass, 2)  # 7,2 km/h
    await _kaart(hass, opgezet, KAART_SCHERM)
    return opgezet


@pytest.fixture
async def ws(hass: HomeAssistant, motor, hass_ws_client, hass_read_only_access_token):
    return await hass_ws_client(hass, hass_read_only_access_token)


async def _vraag(ws, **bericht: Any) -> dict[str, Any]:
    await ws.send_json_auto_id(bericht)
    return await ws.receive_json()


def _maak(motor, lampen: list[str], **extra: Any) -> None:
    motor.opslag.zet_regel(
        {
            "id": "r1",
            "actief": True,
            "vakantie": False,
            "lampen": lampen,
            "aan": {"soort": "tijd", "tijd": "12:00"},
            "uit": {"soort": "tijd", "tijd": "18:00"},
            "dagen": ELKE_DAG,
            **extra,
        }
    )
    motor.regels_gewijzigd()


async def _herstart(hass: HomeAssistant, freezer, tot) -> None:
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    hass.bus.async_fire(EVENT_HOMEASSISTANT_STOP)
    await hass.async_block_till_done()
    await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    freezer.move_to(tot)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await hass.data[DOMAIN][DATA_MOTOR].async_herlees()
    await laat_starten(hass, freezer, tot)


# ------------------------------------------------------------------- uitrollen


async def test_uitrollen_bij_weinig_wind_ook_zonder_bekende_stand(hass: HomeAssistant, motor, schermen, freezer) -> None:
    _maak(motor, [KEUKEN])
    await tik(hass, freezer, om(3, 12))
    assert schermen == [("open_cover", [KEUKEN])]
    await tik(hass, freezer, om(3, 18))
    assert schermen[-1] == ("close_cover", [KEUKEN])


async def test_niet_uitrollen_boven_de_grens_maar_het_rolluik_wel(hass: HomeAssistant, motor, schermen, freezer) -> None:
    """10 m/s is 36 km/h, boven de 30."""
    _maak(motor, [KEUKEN, ROLLUIK])
    zet_wind(hass, 10)
    await hass.async_block_till_done()
    schermen.clear()
    await tik(hass, freezer, om(3, 12))
    assert schermen == [("open_cover", [ROLLUIK])]
    # De volgende dag is het rustig: dan wel.
    zet_wind(hass, 2)
    await tik(hass, freezer, om(4, 11))
    schermen.clear()
    await tik(hass, freezer, om(4, 12))
    assert schermen == [("open_cover", sorted([KEUKEN, ROLLUIK]))]


@pytest.mark.parametrize(
    ("waarde", "eenheid"),
    [("unavailable", "m/s"), ("unknown", "m/s"), ("geen getal", "m/s"), ("2", None), ("2", "mm/h")],
)
async def test_zonder_bruikbare_meting_niet_uitrollen(
    hass: HomeAssistant, motor, schermen, freezer, waarde: str, eenheid: str | None
) -> None:
    _maak(motor, [KEUKEN])
    zet_wind(hass, waarde, eenheid)
    await hass.async_block_till_done()
    await tik(hass, freezer, om(3, 12))
    assert schermen == []
    # Met een goede meting de volgende dag wel: het was de meting, niet het scherm.
    zet_wind(hass, 2)
    await tik(hass, freezer, om(4, 11))
    schermen.clear()
    await tik(hass, freezer, om(4, 12))
    assert schermen == [("open_cover", [KEUKEN])]


async def test_inrollen_gaat_altijd(hass: HomeAssistant, motor, schermen, freezer) -> None:
    _maak(motor, [KEUKEN], aan=None)
    zet_wind(hass, "unavailable")
    await hass.async_block_till_done()
    await tik(hass, freezer, om(3, 18))
    assert schermen == [("close_cover", [KEUKEN])]


async def test_de_eenheid_wordt_omgerekend(hass: HomeAssistant, motor, schermen, freezer) -> None:
    """25 km/h mag, 25 m/s niet."""
    _maak(motor, [KEUKEN])
    zet_wind(hass, 25, "km/h")
    await hass.async_block_till_done()
    await tik(hass, freezer, om(3, 12))
    assert schermen == [("open_cover", [KEUKEN])]


async def test_een_favoriet_rolt_ook_niet_uit_bij_harde_wind(hass: HomeAssistant, motor, schermen) -> None:
    zet_wind(hass, 12)
    await hass.async_block_till_done()
    schermen.clear()
    motor.voer_favoriet_uit({"id": "f1", "lampen": [KEUKEN, WOONKAMER], "helderheden": {KEUKEN: 100, WOONKAMER: 0}})
    await hass.async_block_till_done()
    assert schermen == [("close_cover", [WOONKAMER])]


async def test_zonder_windsensor_op_de_kaart_is_er_geen_grens(hass: HomeAssistant, motor, schermen, freezer) -> None:
    await _kaart(hass, motor, {k: v for k, v in KAART_SCHERM.items() if k not in ("wind_sensor", "wind_max")})
    zet_wind(hass, "unavailable")
    _maak(motor, [KEUKEN])
    await tik(hass, freezer, om(3, 12))
    assert schermen == [("open_cover", [KEUKEN])]


# ------------------------------------------------------------------- intrekken


async def test_harde_wind_trekt_ze_een_keer_in(hass: HomeAssistant, motor, schermen) -> None:
    zet_wind(hass, 10)
    await hass.async_block_till_done()
    # Een motor die andersom hangt, gaat in met open_cover; net als op de rolluikkaart.
    assert sorted(schermen) == [("close_cover", [KEUKEN, WOONKAMER]), ("open_cover", [ANDERSOM])]
    schermen.clear()
    # Het blijft hard waaien: niets meer, zodat wie hem zelf uitrolt niet steeds wordt overruled.
    for waarde in (11, 14, 9):
        zet_wind(hass, waarde)
        await hass.async_block_till_done()
    assert schermen == []
    # Rustig, en dan weer hard: opnieuw in.
    zet_wind(hass, 3)
    await hass.async_block_till_done()
    zet_wind(hass, 12)
    await hass.async_block_till_done()
    assert sorted(d for d, _ in schermen) == ["close_cover", "open_cover"]


async def test_het_rolluik_blijft_waar_het_is(hass: HomeAssistant, motor, schermen) -> None:
    zet_wind(hass, 10)
    await hass.async_block_till_done()
    assert schermen and all(ROLLUIK not in ids for _, ids in schermen)


async def test_na_een_herstart_met_harde_wind_gaan_ze_in(hass: HomeAssistant, motor, schermen, freezer) -> None:
    await tik(hass, freezer, om(3, 9))
    zet_wind(hass, 15)
    await _herstart(hass, freezer, om(3, 10))
    assert ("close_cover", [KEUKEN, WOONKAMER]) in schermen


async def test_regressiewacht_zonder_zonneschermen_doet_de_wind_niets(hass: HomeAssistant, motor, schermen, freezer) -> None:
    """REGRESSIEWACHT: een kaart met alleen rolluiken (en een windsensor) blijft zoals hij was."""
    await _kaart(hass, motor, {**KAART, "rolluiken": [ROLLUIK], "wind_sensor": WIND})
    zet_wind(hass, 20)
    await hass.async_block_till_done()
    _maak(motor, [ROLLUIK])
    await tik(hass, freezer, om(3, 12))
    assert schermen == [("open_cover", [ROLLUIK])]


# ------------------------------------------------------------------- de commando's


async def test_een_gewone_gebruiker_kiest_een_zonnescherm(ws, motor) -> None:
    regel = {"lampen": [KEUKEN], "aan": {"soort": "tijd", "tijd": "12:00"}, "uit": {"soort": "tijd", "tijd": "18:00"}, "dagen": ELKE_DAG}
    uit = await _vraag(ws, type=f"{T}/opslaan", regel=regel)
    assert uit["success"], uit
    assert motor.opslag.regels[0]["lampen"] == [KEUKEN]
