"""Meldingen van de robotstofzuiger (0.85.0). Alles **NIEUW GEDRAG**.

De robot is de L40s Pro Ultra uit de echte dump
(`tests/js/vaste-invoer/dreame-r9419h.json`): dezelfde entity_id's,
`translation_key`'s, toestanden en attributen, en hetzelfde apparaat. Wat er
verandert, wordt hier met `hass.states.async_set` gezet, zoals de integratie
van Dreame het zou doen.
"""

from __future__ import annotations

from datetime import timedelta
import json
import pathlib
from typing import Any

import pytest

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

from custom_components.domotiapp_lovelace.const import DOMAIN
from custom_components.domotiapp_lovelace.meldingen import kaarten, stofzuiger
from custom_components.domotiapp_lovelace.meldingen.const import DATA_MOTOR, KAART_TYPE

from ..conftest import zet_integratie_op
from .conftest import ANNA, BRAM, KAART, zet_dashboard

DUMP = json.loads(
    (pathlib.Path(__file__).parents[1] / "js" / "vaste-invoer" / "dreame-r9419h.json").read_text(encoding="utf-8")
)
ROBOT = "vacuum.dreame_boven"

STOFZUIGERKAART: dict[str, Any] = {
    "type": KAART_TYPE,
    "afval": False,
    "stofzuiger": True,
    "stofzuigers": [ROBOT],
    "personen": [BRAM, ANNA],
    "diensten": {BRAM: "notify.test_bram", ANNA: "test_anna"},
}


async def zet_robot_neer(hass: HomeAssistant) -> None:
    """Het apparaat, de entiteiten en hun toestanden uit de dump."""
    entry = MockConfigEntry(domain="dreame_vacuum", title="dreame boven")
    entry.add_to_hass(hass)
    apparaat_dump = next(iter(DUMP["devices"].values()))
    apparaat = dr.async_get(hass).async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={("dreame_vacuum", "dreame-boven")},
        manufacturer=apparaat_dump["manufacturer"],
        model=apparaat_dump["model"],
        name=apparaat_dump["name"],
    )
    reg = er.async_get(hass)
    for entity_id, info in DUMP["entities"].items():
        domein, object_id = entity_id.split(".", 1)
        reg.async_get_or_create(
            domein,
            "dreame_vacuum",
            entity_id,
            suggested_object_id=object_id,
            config_entry=entry,
            device_id=apparaat.id,
            translation_key=info.get("translation_key"),
        )
    for entity_id, st in DUMP["states"].items():
        hass.states.async_set(entity_id, st["state"], st["attributes"])
    await hass.async_block_till_done()


@pytest.fixture
async def motor(hass: HomeAssistant):
    await hass.config.async_set_time_zone("Europe/Amsterdam")
    hass.states.async_set(BRAM, "home", {"friendly_name": "Bram", "user_id": "gebruiker-bram"})
    hass.states.async_set(ANNA, "home", {"friendly_name": "Anna", "user_id": "gebruiker-anna"})
    await zet_robot_neer(hass)
    await zet_integratie_op(hass)
    await zet_dashboard(hass, [STOFZUIGERKAART])
    return hass.data[DOMAIN][DATA_MOTOR]


def zet(hass: HomeAssistant, entity_id: str, state: str, **extra: Any) -> None:
    """Een nieuwe toestand, met de attributen uit de dump."""
    attributen = {**DUMP["states"][entity_id]["attributes"], **extra}
    hass.states.async_set(entity_id, state, attributen)


async def wacht_klaar(hass: HomeAssistant) -> None:
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=11))
    await hass.async_block_till_done()


# --------------------------------------------------------------- de kaart


def test_de_kaart_zonder_keuze_meldt_alles() -> None:
    m = kaarten.stofzuiger_uit(STOFZUIGERKAART)
    assert m is not None and m.id == "stofzuiger"
    assert m.stofzuigers == [ROBOT]
    assert m.gebeurtenissen == ["klaar", "storing", "station", "onderhoud"]


def test_een_kaart_zonder_schakelaar_heeft_geen_stofzuiger() -> None:
    assert kaarten.stofzuiger_uit(KAART) is None
    assert kaarten.stofzuiger_uit({**STOFZUIGERKAART, "stofzuiger": False}) is None


def test_afval_en_stofzuiger_op_een_kaart_zijn_twee_meldingen() -> None:
    samen = kaarten.voeg_samen([("", {**KAART, "afval": True, "stofzuiger": True, "stofzuigers": [ROBOT]})])
    assert sorted(samen) == ["afval", "stofzuiger"]


def test_de_robots_van_twee_kaarten_tellen_allebei() -> None:
    samen = kaarten.voeg_samen(
        [("", STOFZUIGERKAART), ("tablet", {**STOFZUIGERKAART, "stofzuigers": ["vacuum.x50_ultra_complete"]})]
    )
    assert samen["stofzuiger"].stofzuigers == [ROBOT, "vacuum.x50_ultra_complete"]


# -------------------------------------------------------------- de motor


async def test_de_motor_volgt_de_sensoren_van_het_apparaat(hass: HomeAssistant, motor) -> None:
    rollen = {e: r for e, (_, r, _) in motor._robot_rollen.items()}
    assert rollen[ROBOT] == "stofzuiger"
    assert rollen["sensor.dreame_boven_task_status"] == "taak"
    assert rollen["sensor.dreame_boven_error"] == "fout"
    assert rollen["sensor.dreame_boven_dirty_water_tank_status"] == "vuilwater"
    assert rollen["sensor.dreame_boven_main_brush_left"] == "onderhoud"
    # De resterende TIJD is geen onderdeel.
    assert "sensor.dreame_boven_main_brush_time_left" not in rollen


async def test_klaar_met_schoonmaken(hass: HomeAssistant, motor, telefoons) -> None:
    zet(hass, "sensor.dreame_boven_task_status", "segment_cleaning")
    await hass.async_block_till_done()
    zet(hass, "sensor.dreame_boven_task_status", "completed")
    await hass.async_block_till_done()
    assert telefoons == [], "klaar wacht tien tellen op het oppervlak en de duur"
    await wacht_klaar(hass)

    assert [d for d, _ in telefoons] == ["test_bram", "test_anna"]
    data = telefoons[0][1]
    assert data["title"] == "dreame boven"
    assert data["message"] == "Klaar met schoonmaken: 51 m² in 52 min."
    assert data["data"] == {"tag": "domotiapp-stofzuiger-dreame_boven-klaar", "group": "domotiapp-stofzuiger"}


async def test_een_plattegrond_maken_is_geen_schoonmaakbeurt(hass: HomeAssistant, motor, telefoons) -> None:
    zet(hass, "sensor.dreame_boven_task_status", "fast_mapping")
    await hass.async_block_till_done()
    zet(hass, "sensor.dreame_boven_task_status", "completed")
    await wacht_klaar(hass)
    assert telefoons == []


async def test_een_storing_komt_en_gaat_weer_weg(hass: HomeAssistant, motor, telefoons) -> None:
    zet(hass, "sensor.dreame_boven_error", "mop_removed", description="Dweilpad verwijderd")
    await hass.async_block_till_done()
    assert [d for d, _ in telefoons] == ["test_bram", "test_anna"]
    assert telefoons[0][1]["message"] == "Storing: Dweilpad verwijderd"
    tag = telefoons[0][1]["data"]["tag"]
    assert tag == "domotiapp-stofzuiger-dreame_boven-storing"

    telefoons.clear()
    zet(hass, "sensor.dreame_boven_error", "no_error")
    await hass.async_block_till_done()
    assert [(d, b["message"], b["data"]["tag"]) for d, b in telefoons] == [
        ("test_bram", "clear_notification", tag),
        ("test_anna", "clear_notification", tag),
    ]


async def test_dezelfde_storing_komt_niet_twee_keer(hass: HomeAssistant, motor, telefoons) -> None:
    zet(hass, "sensor.dreame_boven_error", "mop_removed", description="Dweilpad verwijderd")
    await hass.async_block_till_done()
    zet(hass, "sensor.dreame_boven_error", "mop_removed", description="Dweilpad verwijderd", extra="iets")
    await hass.async_block_till_done()
    assert len(telefoons) == 2


async def test_vuilwatertank_vol(hass: HomeAssistant, motor, telefoons) -> None:
    zet(hass, "sensor.dreame_boven_dirty_water_tank_status", "not_installed_or_full")
    await hass.async_block_till_done()
    assert telefoons[0][1]["message"] == "De vuilwatertank is vol of niet geplaatst. Leeg hem."
    assert telefoons[0][1]["data"]["tag"] == "domotiapp-stofzuiger-dreame_boven-vuilwater"


async def test_tank_en_waterwaarschuwing_zijn_een_melding(hass: HomeAssistant, motor, telefoons) -> None:
    zet(hass, "sensor.dreame_boven_low_water_warning", "low_water")
    await hass.async_block_till_done()
    zet(hass, "sensor.dreame_boven_clean_water_tank_status", "low_water")
    await hass.async_block_till_done()
    assert [b["message"] for _, b in telefoons] == ["Het schone water is bijna op. Vul de tank bij."] * 2

    # De tank zegt weer "geplaatst", maar de waarschuwing staat nog: niet wissen.
    telefoons.clear()
    zet(hass, "sensor.dreame_boven_clean_water_tank_status", "installed")
    await hass.async_block_till_done()
    assert telefoons == []
    zet(hass, "sensor.dreame_boven_low_water_warning", "no_warning")
    await hass.async_block_till_done()
    assert {b["message"] for _, b in telefoons} == {"clear_notification"}


async def test_een_onderdeel_dat_aan_de_beurt_is(hass: HomeAssistant, motor, telefoons) -> None:
    zet(hass, "sensor.dreame_boven_main_brush_left", "11")
    await hass.async_block_till_done()
    assert telefoons == []
    zet(hass, "sensor.dreame_boven_main_brush_left", "10")
    await hass.async_block_till_done()
    assert telefoons[0][1]["message"] == "Hoofdborstel: nog 10 %. Tijd om te vervangen of schoon te maken."
    # Verder zakken is geen nieuwe melding.
    telefoons.clear()
    zet(hass, "sensor.dreame_boven_main_brush_left", "9")
    await hass.async_block_till_done()
    assert telefoons == []


async def test_na_opnieuw_verbinden_wordt_niets_gemeld(hass: HomeAssistant, motor, telefoons) -> None:
    hass.states.async_set("sensor.dreame_boven_dust_bag_status", "unavailable")
    await hass.async_block_till_done()
    zet(hass, "sensor.dreame_boven_dust_bag_status", "check")
    await hass.async_block_till_done()
    assert telefoons == []


async def test_wie_uit_staat_krijgt_niets(hass: HomeAssistant, motor, telefoons) -> None:
    motor.opslag.zet_aan("stofzuiger", ANNA, False)
    zet(hass, "sensor.dreame_boven_dust_bag_status", "check")
    await hass.async_block_till_done()
    assert [d for d, _ in telefoons] == ["test_bram"]
    assert telefoons[0][1]["message"] == "Controleer de stofzak."


async def test_alleen_wat_op_de_kaart_gekozen_is(hass: HomeAssistant, motor, telefoons) -> None:
    await zet_dashboard(hass, [{**STOFZUIGERKAART, "stofzuiger_meldingen": ["klaar"]}])
    zet(hass, "sensor.dreame_boven_error", "mop_removed", description="Dweilpad verwijderd")
    await hass.async_block_till_done()
    assert telefoons == []


async def test_in_het_engels(hass: HomeAssistant, motor, telefoons) -> None:
    hass.config.language = "en"
    zet(hass, "sensor.dreame_boven_dirty_water_tank_status", "not_installed_or_full")
    await hass.async_block_till_done()
    assert telefoons[0][1]["message"] == "The dirty water tank is full or not installed. Empty it."


async def test_een_kaart_weghalen_stopt_de_meldingen(hass: HomeAssistant, motor, telefoons) -> None:
    await zet_dashboard(hass, [KAART])
    zet(hass, "sensor.dreame_boven_dust_bag_status", "check")
    await hass.async_block_till_done()
    assert telefoons == []


async def test_de_proef_gaat_alleen_naar_die_persoon(hass: HomeAssistant, motor, telefoons) -> None:
    uitkomst = await motor.async_verstuur("stofzuiger", "morgen", proef=True, alleen=ANNA)
    assert uitkomst["verstuurd"] == [ANNA]
    assert [d for d, _ in telefoons] == ["test_anna"]
    assert telefoons[0][1]["title"] == "Proef · dreame boven"
    assert telefoons[0][1]["data"]["tag"] == "domotiapp-stofzuiger-dreame_boven-proef"


async def test_de_klok_stuurt_geen_stofzuigermelding(hass: HomeAssistant, motor, telefoons) -> None:
    uitkomst = await motor.async_verstuur("stofzuiger", "morgen")
    assert "reden" in uitkomst
    assert telefoons == []


# ------------------------------------------------------- de pure functies


def test_klaar_alleen_na_een_schoonmaaktaak() -> None:
    assert stofzuiger.is_klaar("taak", "auto_cleaning", "completed")
    assert stofzuiger.is_klaar("taak", "segment_mopping_paused", "completed")
    assert stofzuiger.is_klaar("taak", "zone_docking_paused", "completed")
    assert not stofzuiger.is_klaar("taak", "station_cleaning", "completed")
    assert not stofzuiger.is_klaar("taak", "cruising_path", "completed")
    assert not stofzuiger.is_klaar("taak", "completed", "completed")
    assert not stofzuiger.is_klaar("taak", "unavailable", "completed")


def test_klaar_tekst_zonder_getallen() -> None:
    assert stofzuiger.klaar_tekst("unavailable", None, "nl") == "Klaar met schoonmaken."
    assert stofzuiger.klaar_tekst("51", "65", "nl") == "Klaar met schoonmaken: 51 m² in 1 uur 5 min."
    assert stofzuiger.klaar_tekst("51", "65", "en") == "Finished cleaning: 51 m² in 1 h 5 min."


def test_geen_fout_is_geen_storing() -> None:
    assert stofzuiger.fout_tekst("no_error", "Geen fout") == ""
    assert stofzuiger.fout_tekst("unavailable") == ""
    assert stofzuiger.fout_tekst("bumper_stuck") == "Bumper stuck"
    assert stofzuiger.fout_tekst("x", "Wiel vast\nTil de robot op") == "Wiel vast"
