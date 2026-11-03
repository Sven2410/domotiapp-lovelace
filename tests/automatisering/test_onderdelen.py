"""Een regel met onderdelen, elk met eigen lampen en tijden (0.102.0).

De eigenaar, 3 november 2026, over drie vakantieregels voor de rolluiken: "ik wil dat dat kan in 1 regel dus eigenlijk
een automatisering net als in HA". NIEUW GEDRAG, behalve wat met REGRESSIEWACHT begint: 0.101.0 weigert `delen` ("extra keys not
allowed"), en de motor voert een regel zonder `lampen` niet uit. `test_een_onderdeel_zonder_moment_weigert_de_server` slaagt
daar dus ook, maar om die reden.
"""

from __future__ import annotations

from typing import Any

import pytest

from homeassistant.components.cover import CoverEntityFeature
from homeassistant.const import EVENT_HOMEASSISTANT_STOP
from homeassistant.core import HomeAssistant, ServiceCall

from custom_components.domotiapp_lovelace.automatisering import regels as regelmaker
from custom_components.domotiapp_lovelace.automatisering.const import DATA_MOTOR
from custom_components.domotiapp_lovelace.const import DOMAIN

from .conftest import GEHEIM, KAART, KEUKEN, WOONKAMER, laat_starten, om, regel, tik, zet_dashboard

T = f"{DOMAIN}/automatisering"
# Vier rolluiken zoals een Somfy zonder terugmelding: alleen open en dicht, en de stand onbekend.
KL, KV, WL, WR = "cover.keuken_links", "cover.keuken_voor", "cover.wk_links", "cover.wk_rechts"
KAART_ROLLUIK = {**KAART, "rolluiken": [KL, KV, WL, WR]}
ELKE_DAG = [0, 1, 2, 3, 4, 5, 6]


def _om(tijd: str) -> dict[str, str]:
    return {"soort": "tijd", "tijd": tijd}


DELEN = [
    {"id": "a", "lampen": [KL], "aan": _om("09:30"), "uit": _om("14:30")},
    {"id": "b", "lampen": [KV], "aan": _om("09:30"), "uit": _om("20:00")},
    {"id": "c", "lampen": [WL, WR], "aan": _om("11:30"), "uit": _om("20:00")},
]


@pytest.fixture
def rolluiken(hass: HomeAssistant) -> list[tuple[str, list[str]]]:
    aanroepen: list[tuple[str, list[str]]] = []

    async def ontvang(call: ServiceCall) -> None:
        aanroepen.append((call.service, sorted(call.data["entity_id"])))

    for dienst in ("open_cover", "close_cover", "set_cover_position"):
        hass.services.async_register("cover", dienst, ontvang)
    for ident in (KL, KV, WL, WR):
        hass.states.async_set(ident, "unknown", {"supported_features": int(CoverEntityFeature.OPEN | CoverEntityFeature.CLOSE)})
    return aanroepen


@pytest.fixture
async def motor(hass: HomeAssistant, opgezet, rolluiken, freezer):
    await zet_dashboard(hass, [KAART_ROLLUIK])
    await opgezet.async_herlees()
    return opgezet


@pytest.fixture
async def ws(hass: HomeAssistant, motor, hass_ws_client, hass_read_only_access_token):
    """Een gewone gebruiker: juist voor die is de kaart er."""
    return await hass_ws_client(hass, hass_read_only_access_token)


async def _vraag(ws, **bericht: Any) -> dict[str, Any]:
    await ws.send_json_auto_id(bericht)
    return await ws.receive_json()


def _maak(motor, delen=DELEN, **extra: Any) -> None:
    lampen = list(dict.fromkeys(lamp for d in delen for lamp in d["lampen"]))
    motor.opslag.zet_regel(
        {"id": "r1", "actief": True, "vakantie": False, "dagen": ELKE_DAG, "lampen": lampen, "aan": None, "uit": None, "delen": delen, **extra}
    )
    motor.regels_gewijzigd()


async def _tot_vanochtend(hass: HomeAssistant, freezer, aanroepen: list) -> None:
    """De klok door maandag heen tot dinsdag 06:00; wat de regel maandag deed, telt niet mee."""
    await tik(hass, freezer, om(3, 6))
    aanroepen.clear()


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


# ------------------------------------------------------------------------- de klok


async def test_elk_onderdeel_op_zijn_eigen_tijd(hass: HomeAssistant, motor, rolluiken, freezer) -> None:
    """De drie vakantieregels van de eigenaar als één regel, met rolluiken waarvan de stand onbekend is."""
    _maak(motor)
    await _tot_vanochtend(hass, freezer, rolluiken)
    await tik(hass, freezer, om(3, 9, 30))
    assert sorted(rolluiken) == [("open_cover", [KL]), ("open_cover", [KV])]
    rolluiken.clear()
    await tik(hass, freezer, om(3, 11, 30))
    assert rolluiken == [("open_cover", [WL, WR])]
    rolluiken.clear()
    await tik(hass, freezer, om(3, 14, 30))
    assert rolluiken == [("close_cover", [KL])]
    rolluiken.clear()
    await tik(hass, freezer, om(3, 20))
    assert sorted(rolluiken) == [("close_cover", [KV]), ("close_cover", [WL, WR])]


async def test_een_regel_met_onderdelen_die_uit_staat_doet_niets(hass: HomeAssistant, motor, rolluiken, freezer) -> None:
    _maak(motor, actief=False)
    await tik(hass, freezer, om(3, 9, 30))
    assert rolluiken == []


async def test_na_een_herstart_haalt_elk_onderdeel_zelf_in(hass: HomeAssistant, motor, rolluiken, freezer) -> None:
    """Home Assistant weg van 09:20 tot 15:00.

    Keuken links miste open én dicht: alleen dicht. Keuken voor ging om 09:30 open, meer dan 4 uur geleden: dat blijft
    achterwege. De woonkamer ging om 11:30 open, 3,5 uur geleden: die gaat alsnog open.
    """
    _maak(motor)
    await _tot_vanochtend(hass, freezer, rolluiken)
    await tik(hass, freezer, om(3, 9, 20))
    await _herstart(hass, freezer, om(3, 15))
    assert sorted(rolluiken) == [("close_cover", [KL]), ("open_cover", [WL, WR])]


async def test_de_regel_met_onderdelen_staat_na_een_herstart_nog_in_de_opslag(
    hass: HomeAssistant, motor, rolluiken, freezer
) -> None:
    _maak(motor)
    await tik(hass, freezer, om(3, 9))
    await _herstart(hass, freezer, om(3, 9, 10))
    opgeslagen = hass.data[DOMAIN][DATA_MOTOR].opslag.regels[0]
    assert [d["id"] for d in opgeslagen["delen"]] == ["a", "b", "c"]
    rolluiken.clear()
    await tik(hass, freezer, om(3, 9, 30))
    assert sorted(rolluiken) == [("open_cover", [KL]), ("open_cover", [KV])]


async def test_de_pauze_geldt_per_onderdeel(hass: HomeAssistant, motor, lampen, freezer) -> None:
    """Om 19:00 de vakantie aan. De woonkamer brandde al en gaat om 23:00 uit; de keuken was nog niet aan en blijft eraf."""
    _maak(
        motor,
        delen=[
            {"id": "w", "lampen": [WOONKAMER], "aan": _om("18:00"), "uit": _om("23:00")},
            {"id": "k", "lampen": [KEUKEN], "aan": _om("21:00"), "uit": _om("22:00")},
        ],
    )
    await _tot_vanochtend(hass, freezer, lampen)
    await tik(hass, freezer, om(3, 18))
    # Zonder `helderheden` gaat een lamp in een onderdeel gewoon aan.
    assert lampen == [("turn_on", {"entity_id": [WOONKAMER]})]
    lampen.clear()
    await motor.async_zet_vakantie(True)
    for uur in (21, 22):
        await tik(hass, freezer, om(3, uur))
    assert lampen == []
    await tik(hass, freezer, om(3, 23))
    assert lampen == [("turn_off", {"entity_id": [WOONKAMER]})]


def test_elk_onderdeel_van_een_vakantieregel_verschuift_op_zich() -> None:
    delen = regelmaker.delen_van({"id": "r1", "vakantie": True, "dagen": ELKE_DAG, "delen": DELEN})
    assert [d["id"] for d in delen] == ["r1:a", "r1:b", "r1:c"]
    assert all(d["vakantie"] is True and d["dagen"] == ELKE_DAG for d in delen)


def test_regressiewacht_een_regel_zonder_onderdelen_is_zichzelf() -> None:
    """REGRESSIEWACHT: zelfde id, dus zelfde verschuiving en `brandt` als voor 0.102.0."""
    r = {"id": "r1", "vakantie": True, **regel()}
    assert regelmaker.delen_van(r) == [r]


def test_weg_met_de_regel_is_weg_met_de_onderdelen_in_brandt(motor) -> None:
    _maak(motor)
    motor.opslag.zet_brandt("r1:a", True)
    motor.opslag.zet_brandt("r1:c", True)
    motor.opslag.zet_brandt("r10", True)
    # Onderdeel c gaat eruit: dat brandt dan ook niet meer.
    _maak(motor, delen=DELEN[:2])
    assert motor.opslag.brandt("r1:a") and not motor.opslag.brandt("r1:c")
    motor.opslag.verwijder_regel("r1")
    assert not motor.opslag.brandt("r1:a")
    assert motor.opslag.brandt("r10")


# ------------------------------------------------------------------- de commando's


async def test_een_gewone_gebruiker_slaat_een_regel_met_onderdelen_op(ws, motor) -> None:
    zonder_id = [{k: v for k, v in d.items() if k != "id"} for d in DELEN]
    uit = await _vraag(ws, type=f"{T}/opslaan", regel={"naam": "Vakantie rolluiken", "vakantie": True, "dagen": ELKE_DAG, "delen": zonder_id})
    assert uit["success"], uit
    r = motor.opslag.regels[0]
    assert r["naam"] == "Vakantie rolluiken" and r["vakantie"] is True
    assert r["lampen"] == [KL, KV, WL, WR]
    assert r["aan"] is None and r["uit"] is None and "helderheid" not in r
    ids = [d["id"] for d in r["delen"]]
    assert len(set(ids)) == 3
    assert [d["lampen"] for d in r["delen"]] == [[KL], [KV], [WL, WR]]

    # Opnieuw opslaan met dezelfde id's houdt ze, zodat `brandt` blijft kloppen.
    uit = await _vraag(ws, type=f"{T}/opslaan", regel={"id": r["id"], "dagen": ELKE_DAG, "delen": r["delen"][:2]})
    assert uit["success"], uit
    assert [d["id"] for d in motor.opslag.regels[0]["delen"]] == ids[:2]


async def test_een_onderdeel_is_een_gewone_regel(ws, motor) -> None:
    uit = await _vraag(ws, type=f"{T}/opslaan", regel={"dagen": ELKE_DAG, "delen": [DELEN[0]]})
    assert uit["success"], uit
    r = motor.opslag.regels[0]
    assert "delen" not in r
    assert r["lampen"] == [KL] and r["aan"] == _om("09:30") and r["uit"] == _om("14:30")


async def test_terug_naar_een_onderdeel_haalt_de_onderdelen_weg(ws, motor) -> None:
    eerst = await _vraag(ws, type=f"{T}/opslaan", regel={"dagen": ELKE_DAG, "delen": DELEN})
    regel_id = eerst["result"]["regel"]["id"]
    uit = await _vraag(ws, type=f"{T}/opslaan", regel={"id": regel_id, "dagen": ELKE_DAG, "delen": [DELEN[2]]})
    assert uit["success"], uit
    r = motor.opslag.regels[0]
    assert "delen" not in r and r["lampen"] == [WL, WR] and r["aan"] == _om("11:30")


async def test_een_lamp_die_niet_op_de_kaart_staat_weigert_de_server_ook_in_een_onderdeel(ws, motor) -> None:
    delen = [DELEN[0], {"lampen": [GEHEIM], "aan": _om("10:00")}]
    uit = await _vraag(ws, type=f"{T}/opslaan", regel={"dagen": ELKE_DAG, "delen": delen})
    assert uit["error"]["code"] == "not_allowed"
    assert motor.opslag.regels == []


async def test_een_onderdeel_zonder_moment_weigert_de_server(ws, motor) -> None:
    delen = [DELEN[0], {"lampen": [KV], "aan": None, "uit": None}]
    uit = await _vraag(ws, type=f"{T}/opslaan", regel={"dagen": ELKE_DAG, "delen": delen})
    assert uit["error"]["code"] == "invalid_format"


async def test_regressiewacht_een_regel_zonder_onderdelen_slaat_op_zoals_altijd(ws, motor) -> None:
    """REGRESSIEWACHT: de vorm van voor 0.102.0 komt er hetzelfde uit."""
    uit = await _vraag(ws, type=f"{T}/opslaan", regel={**regel(), "helderheden": {WOONKAMER: 40}})
    assert uit["success"], uit
    r = motor.opslag.regels[0]
    assert "delen" not in r
    assert r["lampen"] == [WOONKAMER] and r["helderheden"] == {WOONKAMER: 40} and r["aan"] == _om("18:00")
