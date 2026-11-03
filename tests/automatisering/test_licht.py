"""De lichtsterkte als moment (0.103.0).

De eigenaar, 3 november 2026: "ik wil dat de klant ook lichtsterkte kan gebruiken als voorwaarde ipv zonsondergang
bijvoorbeeld". Alles NIEUW GEDRAG, behalve wat met REGRESSIEWACHT begint. 0.102.0 weigert `soort: licht` bij opslaan, en leest het in de motor als
zonsondergang (rond 16:55 in deze proeven). Proeven die alleen zeggen dat er NIETS gebeurt, kunnen daar dus ook slagen: dat staat
er dan bij.
"""

from __future__ import annotations

from typing import Any

import pytest

from homeassistant.components.cover import CoverEntityFeature
from homeassistant.const import EVENT_HOMEASSISTANT_STOP
from homeassistant.core import HomeAssistant, ServiceCall

from custom_components.domotiapp_lovelace.automatisering.const import DATA_MOTOR
from custom_components.domotiapp_lovelace.const import DOMAIN

from .conftest import KAART, KEUKEN, WOONKAMER, laat_starten, om, tik, zet_dashboard

T = f"{DOMAIN}/automatisering"
LUX = "sensor.weerstation_lichtsterkte"
ANDERE = "sensor.niet_op_de_kaart"
SCHERM = "cover.zonnig"
KAART_LICHT = {**KAART, "lichtsensor": LUX, "rolluiken": [SCHERM]}
ELKE_DAG = [0, 1, 2, 3, 4, 5, 6]


def donker(lux: int = 100) -> dict[str, Any]:
    return {"soort": "licht", "sensor": LUX, "lux": lux, "richting": "donker"}


def licht(lux: int = 200) -> dict[str, Any]:
    return {"soort": "licht", "sensor": LUX, "lux": lux, "richting": "licht"}


def zet_lux(hass: HomeAssistant, waarde: Any) -> None:
    hass.states.async_set(LUX, str(waarde), {"unit_of_measurement": "lx", "device_class": "illuminance"})


@pytest.fixture
async def motor(hass: HomeAssistant, opgezet, freezer):
    zet_lux(hass, 5000)
    hass.states.async_set(SCHERM, "unknown", {"supported_features": int(CoverEntityFeature.OPEN | CoverEntityFeature.CLOSE)})
    await zet_dashboard(hass, [KAART_LICHT])
    await opgezet.async_herlees()
    return opgezet


@pytest.fixture
def rolluiken(hass: HomeAssistant) -> list[tuple[str, list[str]]]:
    aanroepen: list[tuple[str, list[str]]] = []

    async def ontvang(call: ServiceCall) -> None:
        aanroepen.append((call.service, call.data["entity_id"]))

    for dienst in ("open_cover", "close_cover"):
        hass.services.async_register("cover", dienst, ontvang)
    return aanroepen


@pytest.fixture
async def ws(hass: HomeAssistant, motor, hass_ws_client, hass_read_only_access_token):
    return await hass_ws_client(hass, hass_read_only_access_token)


async def _vraag(ws, **bericht: Any) -> dict[str, Any]:
    await ws.send_json_auto_id(bericht)
    return await ws.receive_json()


def _maak(motor, **extra: Any) -> None:
    motor.opslag.zet_regel(
        {
            "id": "r1",
            "actief": True,
            "vakantie": False,
            "lampen": [WOONKAMER],
            "aan": donker(),
            "uit": {"soort": "tijd", "tijd": "23:00"},
            "dagen": ELKE_DAG,
            **extra,
        }
    )
    motor.regels_gewijzigd()


async def _schemer(hass: HomeAssistant, freezer, dag: int = 2) -> None:
    """Licht om 17:00, donker vanaf 17:30. De motor kijkt om 17:00, 17:30 en 17:34."""
    zet_lux(hass, 900)
    await tik(hass, freezer, om(dag, 17))
    zet_lux(hass, 60)
    await tik(hass, freezer, om(dag, 17, 30))
    await tik(hass, freezer, om(dag, 17, 34))


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


async def test_aan_als_het_donker_wordt_na_vijf_minuten(hass: HomeAssistant, motor, lampen, freezer) -> None:
    _maak(motor)
    await _schemer(hass, freezer)
    assert lampen == []
    await tik(hass, freezer, om(2, 17, 35))
    assert lampen == [("turn_on", {"entity_id": [WOONKAMER]})]
    # Het blijft donker: niets meer, ook niet om middernacht.
    for uur in (18, 20):
        await tik(hass, freezer, om(2, uur))
    await tik(hass, freezer, om(2, 22, 59))
    assert len(lampen) == 1


async def test_een_wolk_is_nog_geen_avond(hass: HomeAssistant, motor, lampen, freezer) -> None:
    """Slaagt ook op 0.102.0: om 14:00 is de zon nog op."""
    _maak(motor)
    zet_lux(hass, 900)
    await tik(hass, freezer, om(2, 14))
    zet_lux(hass, 60)
    await tik(hass, freezer, om(2, 14, 1))
    await tik(hass, freezer, om(2, 14, 4))
    zet_lux(hass, 900)
    await tik(hass, freezer, om(2, 14, 5))
    await tik(hass, freezer, om(2, 14, 10))
    assert lampen == []


async def test_een_keer_per_dag_ook_als_de_schemer_schommelt(hass: HomeAssistant, motor, lampen, freezer) -> None:
    _maak(motor, uit=None)
    await _schemer(hass, freezer)
    assert lampen == []
    await tik(hass, freezer, om(2, 17, 35))
    zet_lux(hass, 300)
    await tik(hass, freezer, om(2, 17, 40))
    zet_lux(hass, 50)
    await tik(hass, freezer, om(2, 17, 41))
    await tik(hass, freezer, om(2, 17, 50))
    assert [d for d, _ in lampen] == ["turn_on"]
    # De volgende avond weer.
    lampen.clear()
    await _schemer(hass, freezer, dag=3)
    await tik(hass, freezer, om(3, 17, 35))
    assert lampen == [("turn_on", {"entity_id": [WOONKAMER]})]


async def test_alleen_op_de_gekozen_dagen(hass: HomeAssistant, motor, lampen, freezer) -> None:
    """De 2e is een maandag. Slaagt ook op 0.102.0: daar gelden de dagen net zo."""
    _maak(motor, dagen=[5, 6])
    await _schemer(hass, freezer)
    await tik(hass, freezer, om(2, 17, 35))
    assert lampen == []


async def test_een_nieuwe_regel_als_het_al_donker_is_doet_niets(hass: HomeAssistant, motor, lampen, freezer) -> None:
    """Slaagt ook op 0.102.0: daar is de zon om 20:00 al onder."""
    zet_lux(hass, 40)
    await tik(hass, freezer, om(2, 20))
    _maak(motor)
    for minuut in (1, 6, 30):
        await tik(hass, freezer, om(2, 20, minuut))
    assert lampen == []


async def test_zonder_meting_gebeurt_er_niets(hass: HomeAssistant, motor, lampen, freezer) -> None:
    _maak(motor)
    zet_lux(hass, 900)
    await tik(hass, freezer, om(2, 17))
    for minuut, waarde in ((30, "unavailable"), (35, "unknown"), (40, "geen getal"), (45, "unavailable")):
        zet_lux(hass, waarde)
        await tik(hass, freezer, om(2, 17, minuut))
    assert lampen == []


async def test_rolluik_open_als_het_licht_wordt(hass: HomeAssistant, motor, rolluiken, freezer) -> None:
    """Een Somfy zonder stand ("unknown") gaat gewoon open."""
    _maak(motor, lampen=[SCHERM], aan=licht(200), uit=donker(20))
    zet_lux(hass, 5)
    await tik(hass, freezer, om(3, 6))
    zet_lux(hass, 400)
    await tik(hass, freezer, om(3, 7, 50))
    await tik(hass, freezer, om(3, 7, 55))
    assert rolluiken == [("open_cover", [SCHERM])]
    zet_lux(hass, 10)
    await tik(hass, freezer, om(3, 18))
    await tik(hass, freezer, om(3, 18, 5))
    assert rolluiken[-1] == ("close_cover", [SCHERM])


async def test_een_regel_die_uit_stond_gaat_bij_aanzetten_niet_meteen_aan(
    hass: HomeAssistant, motor, lampen, freezer
) -> None:
    """Slaagt ook op 0.102.0, waar de zon om 17:36 al onder is."""
    _maak(motor, actief=False)
    await _schemer(hass, freezer)
    await tik(hass, freezer, om(2, 17, 35))
    assert lampen == []
    _maak(motor, actief=True)
    for minuut in (36, 45):
        await tik(hass, freezer, om(2, 17, minuut))
    assert lampen == []


async def test_lichtsterkte_in_een_onderdeel(hass: HomeAssistant, motor, lampen, freezer) -> None:
    _maak(
        motor,
        lampen=[WOONKAMER, KEUKEN],
        aan=None,
        uit=None,
        delen=[
            {"id": "a", "lampen": [WOONKAMER], "aan": donker(100), "uit": None},
            {"id": "b", "lampen": [KEUKEN], "aan": {"soort": "tijd", "tijd": "17:32"}, "uit": None},
        ],
    )
    await _schemer(hass, freezer)
    assert [d["entity_id"] for _, d in lampen] == [[KEUKEN]]
    await tik(hass, freezer, om(2, 17, 35))
    assert sorted(d["entity_id"][0] for _, d in lampen) == [KEUKEN, WOONKAMER]


# ------------------------------------------------------------------- de herstart


async def test_donker_geworden_tijdens_een_herstart_wordt_ingehaald(hass: HomeAssistant, motor, lampen, freezer) -> None:
    _maak(motor)
    zet_lux(hass, 900)
    await tik(hass, freezer, om(2, 16))
    zet_lux(hass, 30)
    await _herstart(hass, freezer, om(2, 18))
    # Ook na een herstart eerst vijf minuten donker.
    assert lampen == []
    await tik(hass, freezer, om(2, 18, 6))
    assert lampen == [("turn_on", {"entity_id": [WOONKAMER]})]


async def test_een_herstart_doet_het_niet_nog_een_keer(hass: HomeAssistant, motor, lampen, freezer) -> None:
    """Slaagt ook op 0.102.0, die de zonsondergang ook maar één keer doet."""
    _maak(motor)
    await _schemer(hass, freezer)
    await tik(hass, freezer, om(2, 17, 35))
    await _herstart(hass, freezer, om(2, 19))
    await tik(hass, freezer, om(2, 19, 10))
    assert len(lampen) == 1


async def test_te_lang_weg_is_niet_meer_inhalen(hass: HomeAssistant, motor, lampen, freezer) -> None:
    """Weg van 16:00 tot 22:00: zes uur, meer dan de vier van een aan.

    Slaagt ook op 0.102.0, die het moment als zonsondergang leest, en die is dan ook te lang geleden.
    """
    _maak(motor, uit=None)
    zet_lux(hass, 900)
    await tik(hass, freezer, om(2, 16))
    zet_lux(hass, 30)
    await _herstart(hass, freezer, om(2, 22))
    await tik(hass, freezer, om(2, 22, 6))
    assert lampen == []


# ------------------------------------------------------------------- de commando's


async def test_een_gewone_gebruiker_slaat_een_regel_op_de_lichtsterkte_op(ws, motor) -> None:
    regel = {"lampen": [WOONKAMER], "aan": donker(80), "uit": {"soort": "tijd", "tijd": "23:00"}, "dagen": ELKE_DAG}
    uit = await _vraag(ws, type=f"{T}/opslaan", regel=regel)
    assert uit["success"], uit
    assert motor.opslag.regels[0]["aan"] == donker(80)


async def test_een_lichtsensor_die_niet_op_de_kaart_staat_weigert_de_server(ws, motor) -> None:
    regel = {"lampen": [WOONKAMER], "aan": {**donker(), "sensor": ANDERE}, "dagen": ELKE_DAG}
    uit = await _vraag(ws, type=f"{T}/opslaan", regel=regel)
    assert uit["error"]["code"] == "not_allowed"
    delen = [{"lampen": [WOONKAMER], "aan": donker()}, {"lampen": [KEUKEN], "uit": {**licht(), "sensor": ANDERE}}]
    uit = await _vraag(ws, type=f"{T}/opslaan", regel={"dagen": ELKE_DAG, "delen": delen})
    assert uit["error"]["code"] == "not_allowed"


async def test_wijzigen_begint_opnieuw_te_kijken(hass: HomeAssistant, ws, motor, lampen, freezer) -> None:
    """Om 17:00 licht onder grens 50; om 18:00 wordt de grens 100 terwijl het 70 lux is: dat is geen avond die nu begint."""
    regel = {"lampen": [WOONKAMER], "aan": donker(50), "dagen": ELKE_DAG}
    eerst = await _vraag(ws, type=f"{T}/opslaan", regel=regel)
    zet_lux(hass, 70)
    await tik(hass, freezer, om(2, 17))
    await _vraag(ws, type=f"{T}/opslaan", regel={**regel, "id": eerst["result"]["regel"]["id"], "aan": donker(100)})
    for minuut in (1, 6, 30):
        await tik(hass, freezer, om(2, 17, minuut))
    assert lampen == []


def test_weg_met_de_regel_is_weg_met_zijn_lichtstand(motor) -> None:
    _maak(motor)
    motor.opslag.zet_licht_was("r1|aan", True)
    motor.opslag.zet_licht_was("r10|aan", True)
    motor.opslag.verwijder_regel("r1")
    assert motor.opslag.licht_was("r1|aan") is None
    assert motor.opslag.licht_was("r10|aan") is True
