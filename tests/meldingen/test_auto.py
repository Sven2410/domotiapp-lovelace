"""De berichten van de auto als melding (0.141.0). Alles **NIEUW GEDRAG**.

Gevraagd door de eigenaar op 27 november 2026: een melding van de bus, naast afval en camera. De invoer is de
echte dump van FordPass (`tests/js/vaste-invoer/fordpass-berichten.json`): live met `json_src` (de eerste 6 van
8), uit de recorder met alleen de platte `msgNNN_`, en na het wissen.
"""

from __future__ import annotations

import copy
from datetime import UTC, datetime, timedelta
import json
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

from custom_components.domotiapp_lovelace.const import DOMAIN
from custom_components.domotiapp_lovelace.meldingen import auto, kaarten
from custom_components.domotiapp_lovelace.meldingen.const import DATA_MOTOR, KAART_TYPE, STORAGE_KEY
from custom_components.domotiapp_lovelace.meldingen.motor import auto_tag

from ..conftest import zet_integratie_op
from .conftest import ANNA, BRAM, zet_dashboard

DUMP = json.loads((Path(__file__).parents[1] / "js" / "vaste-invoer" / "fordpass-berichten.json").read_text())
SENSOR = DUMP["live_8"]["entity_id"]

KAART: dict[str, Any] = {
    "type": KAART_TYPE,
    "afval": False,
    "auto": True,
    "auto_berichten": [SENSOR],
    "auto_pad": "/dashboard-thuis/0#auto",
    "personen": [BRAM, ANNA],
    "diensten": {BRAM: "notify.test_bram", ANNA: "test_anna"},
}

meldingen = lambda telefoons: [(d, x["title"], x["message"]) for d, x in telefoons if x["message"] != "clear_notification"]  # noqa: E731
gewist = lambda telefoons: [(d, x["data"]["tag"]) for d, x in telefoons if x["message"] == "clear_notification"]  # noqa: E731


def toestand(naam: str) -> tuple[str, dict[str, Any]]:
    d = copy.deepcopy(DUMP[naam])
    return d["state"], d["attributes"]


def met_nieuw(naam: str, *nieuw: tuple[str, str, str]) -> tuple[str, dict[str, Any]]:
    """De platte vorm met nieuwe berichten bovenaan (datum, onderwerp, tekst), zoals FordPass ze nummert."""
    oud = auto.berichten("fordpass", *toestand(naam))
    rijen = [(d, o, t) for d, o, t in nieuw] + [
        (b["datum"].strftime("%m/%d/%Y %I:%M:%S %p"), b["onderwerp"], b["tekst"]) for b in oud
    ]
    attr: dict[str, Any] = {"unit_of_measurement": "messages", "friendly_name": "Berichten"}
    for i, (d, o, t) in enumerate(rijen, 1):
        attr |= {f"msg{i:03}_Date": d, f"msg{i:03}_Type": "EXTERNALNOTIFICATIONREQUEST", f"msg{i:03}_Subject": o, f"msg{i:03}_Content": t}
    return str(len(rijen)), attr


OLIE = ("11/27/2026 03:05:00 PM", "Olie verversen", "Het is tijd voor een <b>onderhoudsbeurt</b>.<br>Maak een afspraak.")


# ------------------------------------------------------------ pure functies


def test_de_twee_vormen_noemen_dezelfde_berichten() -> None:
    live = auto.berichten("fordpass", *toestand("live_8"))
    plat = auto.berichten("fordpass", *toestand("geschiedenis_8"))
    assert len(live) == 6 and len(plat) == 8
    # De nieuwste eerst, en de sleutel is in beide vormen gelijk.
    assert [b["sleutel"] for b in live] == [b["sleutel"] for b in plat][:6]
    assert live[0]["onderwerp"] == "Waarschuwing controlesysteem bandenspanning"
    assert live[0]["datum"] == datetime(2026, 11, 10, 6, 50, 4, tzinfo=UTC)
    assert live[0]["gelezen"] is False and plat[0]["gelezen"] is None
    assert plat[1]["datum"] == datetime(2026, 11, 8, 21, 44, 53, tzinfo=UTC)
    assert live[0]["tekst"].startswith("Het Controlesysteem Bandenspanning")


def test_geen_berichten_en_geen_toestand_zijn_iets_anders() -> None:
    assert auto.berichten("fordpass", *toestand("nu_0")) == []
    assert auto.berichten("fordpass", *toestand("herstart")) is None
    assert auto.berichten("fordpass", "unknown", {}) is None
    # Een aantal zonder één leesbaar bericht: de attributen zijn er nog niet.
    assert auto.berichten("fordpass", "8", {"unit_of_measurement": "messages"}) is None
    # Een merk dat niet in MERKEN staat: niets, ook met attributen die op die van Ford lijken.
    assert auto.berichten("tesla_custom", *toestand("live_8")) is None
    assert auto.berichten(None, *toestand("live_8")) is None


def test_datum_en_tekst() -> None:
    assert auto.datum("12/01/2026 12:05:00 AM") == datetime(2026, 12, 1, 0, 5, tzinfo=UTC)
    assert auto.datum("12/01/2026 12:05:00 PM") == datetime(2026, 12, 1, 12, 5, tzinfo=UTC)
    assert auto.datum("13/40/2026 01:00:00 AM") is None
    assert auto.datum(None) is None
    assert auto.platte_tekst(OLIE[2]) == "Het is tijd voor een onderhoudsbeurt.\nMaak een afspraak."
    assert auto.platte_tekst("A &amp; B") == "A & B"


def test_de_tekst_van_de_melding() -> None:
    nieuw = auto.berichten("fordpass", *met_nieuw("nu_0", OLIE))
    assert auto.melding("Bus", nieuw, "nl") == ("Bus: Olie verversen", "Het is tijd voor een onderhoudsbeurt.\nMaak een afspraak.")
    vijf = auto.berichten("fordpass", *toestand("geschiedenis_8"))[:5]
    assert auto.melding("Bus", vijf, "nl") == ("Bus", "5 nieuwe berichten. Het laatste: Waarschuwing controlesysteem bandenspanning")
    assert auto.melding("Bus", vijf, "en")[1] == "5 new messages. The latest: Waarschuwing controlesysteem bandenspanning"


def test_de_kaarten_samen() -> None:
    tablet = {**KAART, "auto_berichten": ["sensor.tweede_messages", SENSOR, "light.geen_sensor"]}
    uit = kaarten.voeg_samen([("", KAART), ("tablet", tablet)])
    assert uit["auto"].autos == [SENSOR, "sensor.tweede_messages"]
    assert uit["auto"].pad == "/dashboard-thuis/0#auto"
    assert kaarten.auto_uit({**KAART, "auto": False}) is None
    assert kaarten.auto_uit({**KAART, "auto_pad": "https://ergens.nl"}).pad == ""


# ------------------------------------------------------------ de motor


async def zet_op(
    hass: HomeAssistant, naam: str = "geschiedenis_8", kaart: dict[str, Any] = KAART, eerst: tuple | None = None
):
    await hass.config.async_set_time_zone("Europe/Amsterdam")
    hass.states.async_set(BRAM, "home", {"friendly_name": "Bram", "user_id": "gebruiker-bram"})
    hass.states.async_set(ANNA, "home", {"friendly_name": "Anna", "user_id": "gebruiker-anna"})
    # De auto als apparaat, zoals FordPass hem zet: de melding heet naar het apparaat, niet naar de sensor.
    bron = MockConfigEntry(domain="fordpass")
    bron.add_to_hass(hass)
    apparaat = dr.async_get(hass).async_get_or_create(config_entry_id=bron.entry_id, identifiers={("fordpass", "x")}, name="Bus")
    er.async_get(hass).async_get_or_create(
        "sensor", "fordpass", "voorbeeld_messages", suggested_object_id="fordpass_voorbeeld_messages",
        device_id=apparaat.id, config_entry=bron, translation_key="messages",
    )
    # Na het register: een toestand die er al staat, geeft de registerregel een `_2`.
    hass.states.async_set(SENSOR, *(eerst or toestand(naam)))
    await zet_integratie_op(hass)
    await zet_dashboard(hass, [kaart])
    return hass.data[DOMAIN][DATA_MOTOR]


async def zet(hass: HomeAssistant, state: str, attr: dict[str, Any]) -> None:
    hass.states.async_set(SENSOR, state, attr)
    await hass.async_block_till_done()


async def test_wat_er_al_stond_is_geen_melding_een_nieuw_bericht_wel(hass: HomeAssistant, telefoons) -> None:
    motor = await zet_op(hass)
    await hass.async_block_till_done()
    assert telefoons == []
    assert len(motor.opslag.auto_gezien(SENSOR)) == 8

    await zet(hass, *met_nieuw("geschiedenis_8", OLIE))
    assert meldingen(telefoons) == [
        ("test_bram", "Bus: Olie verversen", "Het is tijd voor een onderhoudsbeurt.\nMaak een afspraak."),
        ("test_anna", "Bus: Olie verversen", "Het is tijd voor een onderhoudsbeurt.\nMaak een afspraak."),
    ]
    data = telefoons[0][1]["data"]
    assert data["tag"] == auto_tag(SENSOR, auto.sleutel(*OLIE[:2]))
    assert data["group"] == "domotiapp-auto"
    assert data["url"] == data["clickAction"] == "/dashboard-thuis/0#auto"

    # Dezelfde berichten opnieuw (FordPass ververst, nu met json_src erbij): niets.
    telefoons.clear()
    state, attr = met_nieuw("geschiedenis_8", OLIE)
    await zet(hass, state, {**attr, "json_src": DUMP["live_8"]["attributes"]["json_src"]})
    assert meldingen(telefoons) == []


async def test_onbereikbaar_en_terug_is_niets(hass: HomeAssistant, telefoons) -> None:
    await zet_op(hass)
    for naam in ("herstart", "geschiedenis_8", "herstart", "live_8"):
        await zet(hass, *toestand(naam))
    assert telefoons == []


async def test_wissen_haalt_ze_van_de_telefoons(hass: HomeAssistant, telefoons) -> None:
    await zet_op(hass)
    await zet(hass, *toestand("nu_0"))
    weg = gewist(telefoons)
    assert meldingen(telefoons) == []
    # Acht berichten met twee gelijke datums? Nee: acht verschillende sleutels, plus de samenvatting, per telefoon.
    assert len(weg) == 2 * 9
    eerste = auto.berichten("fordpass", *toestand("geschiedenis_8"))[0]["sleutel"]
    assert ("test_bram", auto_tag(SENSOR, eerste)) in weg


async def test_veel_tegelijk_is_een_melding(hass: HomeAssistant, telefoons) -> None:
    await zet_op(hass, "nu_0")
    await hass.async_block_till_done()
    assert telefoons == []
    # Na het wissen komen ze allemaal terug als nieuw: dan één melding, met het aantal.
    await zet(hass, *toestand("geschiedenis_8"))
    assert meldingen(telefoons) == [
        ("test_bram", "Bus", "8 nieuwe berichten. Het laatste: Waarschuwing controlesysteem bandenspanning"),
        ("test_anna", "Bus", "8 nieuwe berichten. Het laatste: Waarschuwing controlesysteem bandenspanning"),
    ]


async def test_een_bericht_tijdens_een_herstart_komt_een_keer(hass: HomeAssistant, freezer, telefoons, hass_storage) -> None:
    """De opslag kent de 8; bij de start staan er 9. Daarna nog een lezing: niets dubbel."""
    gezien = [b["sleutel"] for b in auto.berichten("fordpass", *toestand("geschiedenis_8"))]
    hass_storage[STORAGE_KEY] = {"version": 1, "data": {"auto": {SENSOR: gezien}}}
    motor = await zet_op(hass, eerst=met_nieuw("geschiedenis_8", OLIE))
    await hass.async_block_till_done()
    assert [m[1] for m in meldingen(telefoons)] == ["Bus: Olie verversen", "Bus: Olie verversen"]

    telefoons.clear()
    await motor.async_herlees()
    await zet(hass, *met_nieuw("geschiedenis_8", OLIE))
    assert meldingen(telefoons) == []
    # En het staat op schijf.
    freezer.tick(timedelta(seconds=5))
    async_fire_time_changed(hass, dt_util.now())
    await hass.async_block_till_done()
    assert auto.sleutel(*OLIE[:2]) in hass_storage[STORAGE_KEY]["data"]["auto"][SENSOR]


async def test_een_sensor_die_bij_de_start_onbereikbaar_is(hass: HomeAssistant, telefoons, hass_storage) -> None:
    gezien = [b["sleutel"] for b in auto.berichten("fordpass", *toestand("geschiedenis_8"))]
    hass_storage[STORAGE_KEY] = {"version": 1, "data": {"auto": {SENSOR: gezien}}}
    await zet_op(hass, "herstart")
    assert telefoons == []
    await zet(hass, *met_nieuw("geschiedenis_8", OLIE))
    assert len(meldingen(telefoons)) == 2
    # Uit herstart naar een toestand is geen wissen.
    assert gewist(telefoons) == []


async def test_uit_in_de_pop_up_krijgt_niets(hass: HomeAssistant, telefoons) -> None:
    motor = await zet_op(hass)
    motor.opslag.zet_aan("auto", ANNA, False)
    await zet(hass, *met_nieuw("geschiedenis_8", OLIE))
    assert [m[0] for m in meldingen(telefoons)] == ["test_bram"]


async def test_de_proef(hass: HomeAssistant, telefoons) -> None:
    motor = await zet_op(hass)
    uitkomst = await motor.async_verstuur("auto", "", proef=True, alleen=BRAM)
    assert uitkomst["verstuurd"] == [BRAM]
    assert meldingen(telefoons) == [
        ("test_bram", "Proef · Bus: Waarschuwing controlesysteem bandenspanning",
         "Het Controlesysteem Bandenspanning heeft gedetecteerd dat een of meerdere banden veel te weinig opgepompt is/zijn."),
    ]
    assert telefoons[0][1]["data"]["tag"] == auto_tag(SENSOR, "proef")
    # Zonder berichten een voorbeeld; niet op een tijd.
    await zet(hass, *toestand("nu_0"))
    telefoons.clear()
    await motor.async_verstuur("auto", "", proef=True, alleen=BRAM)
    assert meldingen(telefoons)[0][1] == "Proef · Bus: Een bericht van de auto"
    assert "reden" in await motor.async_verstuur("auto", "morgen")
