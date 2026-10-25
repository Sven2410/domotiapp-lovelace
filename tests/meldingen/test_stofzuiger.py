"""Meldingen van de robotstofzuiger (0.85.0). **NIEUW GEDRAG**, op twee
gelabelde REGRESSIEWACHTEN na. Wat in 0.85.1 is bijgekomen staat erbij.

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
    await wacht(hass, 11)


async def wacht(hass: HomeAssistant, seconden: float) -> None:
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=seconden))
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
    assert "sensor.dreame_boven_low_water_warning" not in rollen
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
    assert telefoons == [], "een tank meldt pas na drie minuten"
    await wacht(hass, 181)
    assert telefoons[0][1]["message"] == "De vuilwatertank is vol of niet geplaatst. Leeg hem."
    assert telefoons[0][1]["data"]["tag"] == "domotiapp-stofzuiger-dreame_boven-vuilwater"


async def test_bijna_leeg_en_weer_bijgevuld(hass: HomeAssistant, motor, telefoons) -> None:
    """REGRESSIEWACHT. Zoals bij de klant op 25-10: low_water om 17:35,
    installed om 18:05. Slaagt ook op 0.85.0, maar nu met het wachten erin."""
    zet(hass, "sensor.dreame_boven_clean_water_tank_status", "low_water")
    await wacht(hass, 181)
    assert [b["message"] for _, b in telefoons] == ["Het schone water is bijna op. Vul de tank bij."] * 2
    telefoons.clear()
    zet(hass, "sensor.dreame_boven_clean_water_tank_status", "installed")
    await hass.async_block_till_done()
    assert {b["message"] for _, b in telefoons} == {"clear_notification"}


async def test_een_tank_eruit_halen_is_geen_melding(hass: HomeAssistant, motor, telefoons) -> None:
    """NIEUW GEDRAG in 0.85.1. Bij de klant op 25-10, het legen en bijvullen:
    schoonwater `not_installed` 18:30 -> `installed` 18:31, vuilwater
    `not_installed_or_full` 18:31 -> `installed` 18:32."""
    zet(hass, "sensor.dreame_boven_clean_water_tank_status", "not_installed")
    await wacht(hass, 60)
    zet(hass, "sensor.dreame_boven_clean_water_tank_status", "installed")
    zet(hass, "sensor.dreame_boven_dirty_water_tank_status", "not_installed_or_full")
    await wacht(hass, 60)
    zet(hass, "sensor.dreame_boven_dirty_water_tank_status", "installed")
    await wacht(hass, 400)
    assert telefoons == []


async def test_de_waterwaarschuwing_doet_niet_mee(hass: HomeAssistant, motor, telefoons) -> None:
    """NIEUW GEDRAG in 0.85.1. Bij de klant bleef `no_water_left` staan na het
    bijvullen; Dreame wist hem pas als iemand de melding in HA wegklikt."""
    zet(hass, "sensor.dreame_boven_low_water_warning", "no_water_left")
    await wacht(hass, 400)
    assert telefoons == []


async def test_bijna_lege_batterij_is_geen_storing(hass: HomeAssistant, motor, telefoons) -> None:
    """NIEUW GEDRAG in 0.85.1. Bij de klant twee keer een minuut midden in een
    beurt: de robot gaat laden en daarna zelf verder."""
    zet(hass, "sensor.dreame_boven_error", "battery_low", description="Batterij bijna leeg")
    await hass.async_block_till_done()
    zet(hass, "sensor.dreame_boven_error", "no_error")
    await hass.async_block_till_done()
    assert telefoons == []


async def test_een_herstart_wist_geen_storing(hass: HomeAssistant, motor, telefoons) -> None:
    """NIEUW GEDRAG in 0.85.1. Rond elke herstart staat alles even op unavailable."""
    zet(hass, "sensor.dreame_boven_error", "mop_removed", description="Dweilpad verwijderd")
    await hass.async_block_till_done()
    telefoons.clear()
    hass.states.async_set("sensor.dreame_boven_error", "unavailable")
    await hass.async_block_till_done()
    zet(hass, "sensor.dreame_boven_error", "mop_removed", description="Dweilpad verwijderd")
    await hass.async_block_till_done()
    assert telefoons == []


async def test_een_echte_beurt_is_een_melding(hass: HomeAssistant, motor, telefoons) -> None:
    """REGRESSIEWACHT, slaagt ook op 0.85.0. De beurt van de L40s bij de klant
    op 25-10, 15:27 tot 17:52: zeven keer
    terug naar het station om de pads te wassen, een herstart ertussen, en één
    keer klaar."""
    reeks = [
        (ROBOT, "cleaning"), ("sensor.dreame_boven_task_status", "cleaning"),
        (ROBOT, "returning"), (ROBOT, "cleaning"), (ROBOT, "returning"), (ROBOT, "cleaning"),
        (ROBOT, "returning"), (ROBOT, "docked"), (ROBOT, "cleaning"),
        (ROBOT, "unavailable"), ("sensor.dreame_boven_task_status", "unavailable"),
        (ROBOT, "cleaning"), ("sensor.dreame_boven_task_status", "cleaning"),
        (ROBOT, "returning"), (ROBOT, "cleaning"), (ROBOT, "returning"), (ROBOT, "docked"),
        (ROBOT, "cleaning"), (ROBOT, "returning"), (ROBOT, "cleaning"), (ROBOT, "returning"),
        (ROBOT, "docked"), (ROBOT, "cleaning"), ("sensor.dreame_boven_task_status", "completed"),
        (ROBOT, "docked"),
    ]
    for entiteit, toestand in reeks:
        if toestand == "unavailable":
            hass.states.async_set(entiteit, toestand)
        else:
            zet(hass, entiteit, toestand)
        await wacht(hass, 60)
    await wacht(hass, 400)
    assert [b["message"] for _, b in telefoons] == ["Klaar met schoonmaken: 51 m² in 52 min."] * 2


async def test_zonder_taak_klaar_als_hij_in_het_station_blijft(
    hass: HomeAssistant, motor, telefoons
) -> None:
    """NIEUW GEDRAG in 0.85.1. Een merk zonder `task_status`: even docken om de
    pads te wassen is niet klaar, vijf minuten in het station wel."""
    ander = "vacuum.ander_merk"
    hass.states.async_set(ander, "docked", {"friendly_name": "Ander merk"})
    await zet_dashboard(hass, [{**STOFZUIGERKAART, "stofzuigers": [ROBOT, ander]}])
    for toestand, seconden in (("cleaning", 60), ("returning", 60), ("docked", 60), ("cleaning", 60), ("docked", 301)):
        hass.states.async_set(ander, toestand, {"friendly_name": "Ander merk"})
        await wacht(hass, seconden)
    await wacht_klaar(hass)
    assert [(b["title"], b["message"]) for _, b in telefoons] == [("Ander merk", "Klaar met schoonmaken.")] * 2


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
    await wacht(hass, 181)
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
    await wacht(hass, 181)
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
    assert stofzuiger.fout_tekst("battery_low", "Batterij bijna leeg") == ""
    assert stofzuiger.fout_tekst("unavailable") == ""
    assert stofzuiger.fout_tekst("bumper_stuck") == "Bumper stuck"
    assert stofzuiger.fout_tekst("x", "Wiel vast\nTil de robot op") == "Wiel vast"
