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


async def test_harde_wind_trekt_ze_een_keer_in(hass: HomeAssistant, motor, schermen, freezer) -> None:
    await tik(hass, freezer, om(3, 14))
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
    # Rustig, en een half uur later weer hard: opnieuw in. Zonder bekende stand pas na dat half uur (0.133.0).
    zet_wind(hass, 3)
    await tik(hass, freezer, om(3, 14, 31))
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


# ------------------------------------------------- de windbeveiliging op de kaart (0.132.0)


def _zet_stand(hass: HomeAssistant, ident: str, stand: str, **extra: Any) -> None:
    hass.states.async_set(ident, stand, {"supported_features": int(CoverEntityFeature.OPEN | CoverEntityFeature.CLOSE), **extra})


async def test_wat_al_in_staat_krijgt_geen_opdracht(hass: HomeAssistant, motor, schermen) -> None:
    """NIEUW GEDRAG: in is `closed`, en `open` bij een scherm dat andersom hangt."""
    _zet_stand(hass, KEUKEN, "closed")
    _zet_stand(hass, ANDERSOM, "open")
    _zet_stand(hass, WOONKAMER, "open")
    await hass.async_block_till_done()
    zet_wind(hass, 10)
    await hass.async_block_till_done()
    assert schermen == [("close_cover", [WOONKAMER])]
    assert motor.opslag.wind["schermen"] == [WOONKAMER]


async def test_zonder_terugmelding_gaat_hij_altijd_in(hass: HomeAssistant, motor, schermen) -> None:
    """REGRESSIEWACHT: Somfy RTS zegt wat hij denkt (`assumed_state`); daar valt niet op te bouwen."""
    for ident in (KEUKEN, WOONKAMER):
        _zet_stand(hass, ident, "closed", assumed_state=True)
    _zet_stand(hass, ANDERSOM, "open", assumed_state=True)
    await hass.async_block_till_done()
    zet_wind(hass, 10)
    await hass.async_block_till_done()
    assert sorted(schermen) == [("close_cover", [KEUKEN, WOONKAMER]), ("open_cover", [ANDERSOM])]


async def test_alles_al_in_is_geen_ingreep(hass: HomeAssistant, motor, schermen) -> None:
    """NIEUW GEDRAG"""
    for ident in (KEUKEN, WOONKAMER):
        _zet_stand(hass, ident, "closed")
    _zet_stand(hass, ANDERSOM, "open")
    await hass.async_block_till_done()
    zet_wind(hass, 10)
    await hass.async_block_till_done()
    assert schermen == []
    assert motor.opslag.wind is None


async def test_de_stand_kent_de_windbeveiliging(hass: HomeAssistant, motor, schermen) -> None:
    """NIEUW GEDRAG: sensor, grens en schermen, en na een windstoot de ingreep."""
    from custom_components.domotiapp_lovelace.automatisering.websocket import stand  # noqa: PLC0415

    wind = stand(hass)["wind"]
    assert wind == {"sensor": WIND, "max": 30, "schermen": sorted([KEUKEN, WOONKAMER, ANDERSOM]), "laatst": None}
    zet_wind(hass, 10)
    await hass.async_block_till_done()
    laatst = stand(hass)["wind"]["laatst"]
    assert laatst["wat"] == "ingetrokken"
    assert laatst["kmh"] == 36.0
    assert laatst["schermen"] == sorted([KEUKEN, WOONKAMER, ANDERSOM])
    assert isinstance(laatst["op"], str)


async def test_zonder_zonneschermen_geen_windbeveiliging(hass: HomeAssistant, motor) -> None:
    """NIEUW GEDRAG: dan staat er geen blok op de kaart."""
    from custom_components.domotiapp_lovelace.automatisering.websocket import stand  # noqa: PLC0415

    await _kaart(hass, motor, {**KAART, "rolluiken": [ROLLUIK], "wind_sensor": WIND})
    assert stand(hass)["wind"] is None


async def test_niet_uitgerold_is_ook_een_ingreep(hass: HomeAssistant, motor, schermen, freezer) -> None:
    """NIEUW GEDRAG"""
    _maak(motor, [KEUKEN, ROLLUIK])
    zet_wind(hass, 10)
    await hass.async_block_till_done()
    await tik(hass, freezer, om(3, 12))
    laatst = motor.opslag.wind
    assert laatst["wat"] == "niet_uitgerold"
    assert laatst["schermen"] == [KEUKEN]
    assert laatst["kmh"] == 36.0


async def test_niet_uitgerold_zonder_meting(hass: HomeAssistant, motor, schermen, freezer) -> None:
    """NIEUW GEDRAG: dan is er geen getal."""
    _maak(motor, [KEUKEN])
    zet_wind(hass, "unavailable")
    await hass.async_block_till_done()
    await tik(hass, freezer, om(3, 12))
    assert motor.opslag.wind["wat"] == "niet_uitgerold"
    assert motor.opslag.wind["kmh"] is None


async def test_de_laatste_ingreep_overleeft_een_herstart(hass: HomeAssistant, motor, schermen, freezer) -> None:
    """NIEUW GEDRAG"""
    await tik(hass, freezer, om(3, 9))
    zet_wind(hass, 10)
    await hass.async_block_till_done()
    voor = dict(hass.data[DOMAIN][DATA_MOTOR].opslag.wind)
    zet_wind(hass, 2)
    await hass.async_block_till_done()
    await _herstart(hass, freezer, om(3, 10))
    assert hass.data[DOMAIN][DATA_MOTOR].opslag.wind == voor


async def test_een_kaart_hoort_de_ingreep(ws, motor) -> None:
    """NIEUW GEDRAG: het abonnement krijgt de nieuwe stand meteen."""
    await ws.send_json_auto_id({"type": f"{T}/subscribe"})
    assert (await ws.receive_json())["success"]
    eerst = (await ws.receive_json())["event"]
    assert eerst["wind"]["laatst"] is None
    zet_wind(motor.hass, 10)
    nieuw = (await ws.receive_json())["event"]
    assert nieuw["wind"]["laatst"]["wat"] == "ingetrokken"



# ------------------------------------------------- niet bij elke vlaag opnieuw (0.133.0)


async def _vlaag(hass: HomeAssistant, freezer, op) -> None:
    """Even rustig, en dan weer boven de grens."""
    zet_wind(hass, 3)
    await tik(hass, freezer, op)
    zet_wind(hass, 10)
    await hass.async_block_till_done()


async def test_zonder_stand_niet_bij_elke_vlaag(hass: HomeAssistant, motor, schermen, freezer) -> None:
    """NIEUW GEDRAG: de middag bij de eigenaar, acht overschrijdingen. Zonder bekende stand: binnen het half uur één keer."""
    await tik(hass, freezer, om(3, 14, 2))
    zet_wind(hass, 10)
    await hass.async_block_till_done()
    assert len(schermen) == 2
    schermen.clear()
    for minuut in (10, 12, 15, 18, 19):
        await _vlaag(hass, freezer, om(3, 14, minuut))
    assert schermen == []
    # Na een half uur sinds de ingreep wel weer: de afstandsbediening is niet te zien.
    await _vlaag(hass, freezer, om(3, 14, 32))
    assert sorted(schermen) == [("close_cover", [KEUKEN, WOONKAMER]), ("open_cover", [ANDERSOM])]


async def test_een_uitrolopdracht_mag_meteen_weer(hass: HomeAssistant, motor, schermen, freezer) -> None:
    """NIEUW GEDRAG: ging er sindsdien iets anders dan intrekken naartoe, dan wel; van welke bron ook."""
    await tik(hass, freezer, om(3, 14))
    zet_wind(hass, 10)
    await hass.async_block_till_done()
    # Uitrollen met de hand: bij ANDERSOM is dat close_cover. Intrekken (close_cover op KEUKEN) telt niet.
    await hass.services.async_call("cover", "close_cover", {"entity_id": [ANDERSOM, KEUKEN]}, blocking=True)
    await hass.async_block_till_done()
    schermen.clear()
    await _vlaag(hass, freezer, om(3, 14, 5))
    assert schermen == [("open_cover", [ANDERSOM])]


async def test_een_opdracht_op_een_ruimte_telt_voor_alle_schermen(hass: HomeAssistant, motor, schermen, freezer) -> None:
    """NIEUW GEDRAG: wie er onder zo'n doel valt, weet de motor niet; dus allemaal."""
    await tik(hass, freezer, om(3, 14))
    zet_wind(hass, 10)
    await hass.async_block_till_done()
    hass.bus.async_fire("call_service", {"domain": "cover", "service": "open_cover", "service_data": {"area_id": "tuin"}})
    await hass.async_block_till_done()
    schermen.clear()
    await _vlaag(hass, freezer, om(3, 14, 5))
    # Voor ANDERSOM is open_cover juist intrekken: die blijft staan.
    assert schermen == [("close_cover", [KEUKEN, WOONKAMER])]


async def test_intrekken_naar_een_stand_telt_niet_als_uitrollen(hass: HomeAssistant, motor, schermen, freezer) -> None:
    """NIEUW GEDRAG: set_cover_position op 0 (bij omgekeerd 100) is ook intrekken."""
    await tik(hass, freezer, om(3, 14))
    zet_wind(hass, 10)
    await hass.async_block_till_done()
    await hass.services.async_call("cover", "set_cover_position", {"entity_id": KEUKEN, "position": 0}, blocking=True)
    await hass.services.async_call("cover", "set_cover_position", {"entity_id": ANDERSOM, "position": 100}, blocking=True)
    await hass.services.async_call("cover", "set_cover_position", {"entity_id": WOONKAMER, "position": 40}, blocking=True)
    await hass.async_block_till_done()
    schermen.clear()
    await _vlaag(hass, freezer, om(3, 14, 5))
    assert schermen == [("close_cover", [WOONKAMER])]


async def test_met_bekende_stand_geldt_het_half_uur_niet(hass: HomeAssistant, motor, schermen, freezer) -> None:
    """NIEUW GEDRAG: een scherm dat zelf zegt dat hij uit staat, gaat in, ook binnen het half uur; het andere niet."""
    await tik(hass, freezer, om(3, 14))
    _zet_stand(hass, KEUKEN, "open")
    await hass.async_block_till_done()
    zet_wind(hass, 10)
    await hass.async_block_till_done()
    schermen.clear()
    await _vlaag(hass, freezer, om(3, 14, 5))
    assert ("close_cover", [KEUKEN]) in schermen
    assert all(WOONKAMER not in ids for _, ids in schermen)


async def test_het_half_uur_overleeft_een_herstart(hass: HomeAssistant, motor, schermen, freezer) -> None:
    """NIEUW GEDRAG: na een herstart met harde wind binnen het half uur geen nieuwe opdracht; daarna wel."""
    await tik(hass, freezer, om(3, 14))
    zet_wind(hass, 10)
    await hass.async_block_till_done()
    schermen.clear()
    await _herstart(hass, freezer, om(3, 14, 10))
    assert schermen == []
    await _herstart(hass, freezer, om(3, 14, 40))
    assert sorted(schermen) == [("close_cover", [KEUKEN, WOONKAMER]), ("open_cover", [ANDERSOM])]
