"""Rolluiken in de regels, en de favorieten (0.97.0). Alles NIEUW GEDRAG."""

from __future__ import annotations

from typing import Any

import pytest

from homeassistant.components.cover import CoverEntityFeature
from homeassistant.const import EVENT_HOMEASSISTANT_STOP
from homeassistant.core import HomeAssistant, ServiceCall

from custom_components.domotiapp_lovelace.automatisering.const import DATA_ABONNEES, DATA_MOTOR, STORAGE_KEY
from custom_components.domotiapp_lovelace.const import DOMAIN

from .conftest import GEHEIM, KAART, KEUKEN, WOONKAMER, om, regel, tik, zet_dashboard

T = f"{DOMAIN}/automatisering"
OPEN_DICHT = "cover.zonder_stand"
MET_STAND = "cover.met_stand"
ANDERSOM = "cover.andersom"
BUITEN = "cover.niet_op_de_kaart"
KAART_ROLLUIK = {**KAART, "rolluiken": [OPEN_DICHT, {"entity": MET_STAND, "name": "Woonkamer"}, ANDERSOM], "omgekeerd": [ANDERSOM]}


@pytest.fixture
def rolluiken(hass: HomeAssistant) -> list[tuple[str, dict[str, Any]]]:
    aanroepen: list[tuple[str, dict[str, Any]]] = []

    async def ontvang(call: ServiceCall) -> None:
        aanroepen.append((call.service, dict(call.data)))

    for dienst in ("open_cover", "close_cover", "set_cover_position"):
        hass.services.async_register("cover", dienst, ontvang)
    basis = CoverEntityFeature.OPEN | CoverEntityFeature.CLOSE
    hass.states.async_set(OPEN_DICHT, "closed", {"supported_features": int(basis)})
    met = int(basis | CoverEntityFeature.SET_POSITION)
    hass.states.async_set(MET_STAND, "open", {"supported_features": met, "current_position": 70})
    hass.states.async_set(ANDERSOM, "open", {"supported_features": met, "current_position": 70})
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


def _maak(motor, **extra) -> None:
    motor.opslag.zet_regel({"id": "r1", "actief": True, "vakantie": False, **regel(**extra)})
    motor.regels_gewijzigd()


# ---------------------------------------------------------------- rolluiken in een regel


async def test_aan_is_open_op_de_stand_en_uit_is_dicht(hass: HomeAssistant, motor, rolluiken, lampen, freezer) -> None:
    _maak(motor, lampen=[MET_STAND], helderheden={MET_STAND: 40})
    await tik(hass, freezer, om(2, 18))
    assert rolluiken == [("set_cover_position", {"entity_id": [MET_STAND], "position": 40})]
    await tik(hass, freezer, om(2, 23))
    assert rolluiken[-1] == ("close_cover", {"entity_id": [MET_STAND]})
    assert lampen == []


async def test_helemaal_open_is_open_cover(hass: HomeAssistant, motor, rolluiken, freezer) -> None:
    _maak(motor, lampen=[MET_STAND], helderheden={MET_STAND: 100})
    await tik(hass, freezer, om(2, 18))
    assert rolluiken == [("open_cover", {"entity_id": [MET_STAND]})]


async def test_een_rolluik_zonder_stand_gaat_gewoon_open(hass: HomeAssistant, motor, rolluiken, freezer) -> None:
    _maak(motor, lampen=[OPEN_DICHT], helderheden={})
    await tik(hass, freezer, om(2, 18))
    assert rolluiken == [("open_cover", {"entity_id": [OPEN_DICHT]})]
    rolluiken.clear()
    # Ook als er toch een percentage staat, bijvoorbeeld omdat hij later is vervangen.
    _maak(motor, lampen=[OPEN_DICHT], helderheden={OPEN_DICHT: 40})
    await tik(hass, freezer, om(3, 18))
    assert rolluiken == [("open_cover", {"entity_id": [OPEN_DICHT]})]


async def test_een_omgekeerde_motor_krijgt_de_andere_dienst(hass: HomeAssistant, motor, rolluiken, freezer) -> None:
    _maak(motor, lampen=[ANDERSOM], helderheden={ANDERSOM: 100})
    await tik(hass, freezer, om(2, 18))
    await tik(hass, freezer, om(2, 23))
    assert [d for d, _ in rolluiken] == ["close_cover", "open_cover"]
    rolluiken.clear()
    _maak(motor, lampen=[ANDERSOM], helderheden={ANDERSOM: 30})
    await tik(hass, freezer, om(3, 18))
    assert rolluiken == [("set_cover_position", {"entity_id": [ANDERSOM], "position": 70})]


async def test_lampen_en_rolluiken_in_een_regel(hass: HomeAssistant, motor, rolluiken, lampen, freezer) -> None:
    _maak(motor, lampen=[WOONKAMER, MET_STAND], helderheden={WOONKAMER: 60, MET_STAND: 60})
    await tik(hass, freezer, om(2, 18))
    assert lampen == [("turn_on", {"entity_id": [WOONKAMER], "brightness_pct": 60})]
    assert rolluiken == [("set_cover_position", {"entity_id": [MET_STAND], "position": 60})]


async def test_de_server_kent_het_rolluik_op_de_kaart_en_weigert_de_rest(ws, motor) -> None:
    goed = await _vraag(ws, type=f"{T}/opslaan", regel=regel(lampen=[MET_STAND], helderheden={MET_STAND: 40}))
    assert goed["success"], goed
    fout = await _vraag(ws, type=f"{T}/opslaan", regel=regel(lampen=[BUITEN]))
    assert fout["error"]["code"] == "not_allowed"
    switch = await _vraag(ws, type=f"{T}/opslaan", regel=regel(lampen=["switch.iets"]))
    assert not switch["success"]


# --------------------------------------------------------------------- de favorieten


def _favoriet(**extra: Any) -> dict[str, Any]:
    return {
        "naam": "Woning verlaten",
        "icoon": "homeLeave",
        "lampen": [WOONKAMER, KEUKEN, MET_STAND],
        "helderheden": {WOONKAMER: 0, KEUKEN: 50, MET_STAND: 0},
        **extra,
    }


async def _bewaar(ws, **extra: Any) -> dict[str, Any]:
    uit = await _vraag(ws, type=f"{T}/favoriet_opslaan", favoriet=_favoriet(**extra))
    assert uit["success"], uit
    return uit["result"]["favoriet"]


async def test_een_gewone_gebruiker_maakt_en_gebruikt_een_favoriet(
    hass: HomeAssistant, ws, motor, lampen, rolluiken
) -> None:
    f = await _bewaar(ws)
    assert f["id"] and f["naam"] == "Woning verlaten" and f["icoon"] == "homeLeave"
    assert motor.opslag.favorieten == [f]
    uit = await _vraag(ws, type=f"{T}/favoriet_uitvoeren", favoriet=f["id"])
    assert uit["result"] == {"geschakeld": 3}
    await hass.async_block_till_done()
    assert ("turn_off", {"entity_id": [WOONKAMER]}) in lampen
    assert ("turn_on", {"entity_id": [KEUKEN], "brightness_pct": 50}) in lampen
    assert rolluiken == [("close_cover", {"entity_id": [MET_STAND]})]


async def test_een_lamp_zonder_waarde_gaat_alleen_aan(hass: HomeAssistant, ws, motor, lampen) -> None:
    f = await _bewaar(ws, lampen=[KEUKEN], helderheden={})
    await _vraag(ws, type=f"{T}/favoriet_uitvoeren", favoriet=f["id"])
    await hass.async_block_till_done()
    assert lampen == [("turn_on", {"entity_id": [KEUKEN]})]


async def test_een_lamp_buiten_de_kaart_weigert_de_server(ws, motor) -> None:
    uit = await _vraag(ws, type=f"{T}/favoriet_opslaan", favoriet=_favoriet(lampen=[GEHEIM], helderheden={}))
    assert uit["error"]["code"] == "not_allowed"


async def test_een_lamp_die_van_de_kaart_ging_wordt_niet_meer_geschakeld(
    hass: HomeAssistant, ws, motor, lampen
) -> None:
    f = await _bewaar(ws, lampen=[WOONKAMER, KEUKEN], helderheden={})
    await zet_dashboard(hass, [{**KAART_ROLLUIK, "lampen": [KEUKEN]}])
    await motor.async_herlees()
    uit = await _vraag(ws, type=f"{T}/favoriet_uitvoeren", favoriet=f["id"])
    assert uit["result"] == {"geschakeld": 1}
    await hass.async_block_till_done()
    assert lampen == [("turn_on", {"entity_id": [KEUKEN]})]


@pytest.mark.parametrize(
    "fout",
    [
        {"naam": ""},
        {"naam": "x" * 61},
        {"lampen": []},
        {"lampen": ["switch.iets"]},
        {"helderheden": {WOONKAMER: 101}},
    ],
)
async def test_wat_niet_klopt_komt_er_niet_in(ws, motor, fout) -> None:
    uit = await _vraag(ws, type=f"{T}/favoriet_opslaan", favoriet=_favoriet(**fout))
    assert not uit["success"]
    assert motor.opslag.favorieten == []


async def test_aanpassen_houdt_id_en_plek_en_verwijderen_haalt_weg(ws, motor) -> None:
    a = await _bewaar(ws, naam="A")
    b = await _bewaar(ws, naam="B")
    gewijzigd = await _bewaar(ws, id=a["id"], naam="A2")
    assert gewijzigd["id"] == a["id"]
    assert [f["naam"] for f in motor.opslag.favorieten] == ["A2", "B"]
    uit = await _vraag(ws, type=f"{T}/favoriet_verwijder", favoriet=b["id"])
    assert uit["success"]
    assert [f["naam"] for f in motor.opslag.favorieten] == ["A2"]
    weg = await _vraag(ws, type=f"{T}/favoriet_uitvoeren", favoriet=b["id"])
    assert weg["error"]["code"] == "not_found"


async def test_het_abonnement_krijgt_de_favorieten(ws, motor) -> None:
    await ws.send_json_auto_id({"type": f"{T}/subscribe"})
    assert (await ws.receive_json())["success"]
    assert (await ws.receive_json())["event"]["favorieten"] == []
    await ws.send_json_auto_id({"type": f"{T}/favoriet_opslaan", "favoriet": _favoriet()})
    gezien = [await ws.receive_json(), await ws.receive_json()]
    gebeurtenis = next(x for x in gezien if x["type"] == "event")
    assert [f["naam"] for f in gebeurtenis["event"]["favorieten"]] == ["Woning verlaten"]


async def test_favorieten_overleven_een_herstart(
    hass: HomeAssistant, ws, motor, freezer, hass_storage
) -> None:
    f = await _bewaar(ws)
    await tik(hass, freezer, om(2, 12, 30))
    assert hass_storage[STORAGE_KEY]["data"]["favorieten"] == [f]
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    hass.bus.async_fire(EVENT_HOMEASSISTANT_STOP)
    await hass.async_block_till_done()
    await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    freezer.move_to(om(2, 13))
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert hass.data[DOMAIN][DATA_MOTOR].opslag.favorieten == [f]

async def test_de_stand_is_op_te_vragen_zonder_abonnement(hass: HomeAssistant, ws, motor) -> None:
    """NIEUW GEDRAG: voor gereedschap dat geen gebeurtenissen kan lezen."""
    f = await _bewaar(ws)
    uit = await _vraag(ws, type=f"{T}/stand")
    assert uit["success"], uit
    assert uit["result"]["favorieten"] == [f]
    assert uit["result"]["regels"] == []
    assert uit["result"]["vakantie"] is False
    assert not hass.data[DOMAIN].get(DATA_ABONNEES)
