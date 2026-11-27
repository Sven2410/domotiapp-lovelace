"""Laden klaar en accu laag bij de Autoberichten (0.142.0). **NIEUW GEDRAG**, op één REGRESSIEWACHT na.

De eigenaar, 27 november 2026: *"ja ook laden klaar en accu laag erbij"*. De invoer is de echte tijdlijn van drie dagen
laadstatus, stekker en laadtoestand van een elektrische bus met FordPass (`tests/js/vaste-invoer/fordpass-laden.json`),
die hier minuut voor minuut wordt afgespeeld.
"""

from __future__ import annotations

from datetime import datetime, timedelta
import json
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.domotiapp_lovelace.const import DOMAIN
from custom_components.domotiapp_lovelace.meldingen import auto, kaarten
from custom_components.domotiapp_lovelace.meldingen.const import DATA_MOTOR, KAART_TYPE, STORAGE_KEY
from custom_components.domotiapp_lovelace.meldingen.motor import auto_tag

from ..conftest import zet_integratie_op
from .conftest import ANNA, BRAM, zet_dashboard

LADEN = json.loads((Path(__file__).parents[1] / "js" / "vaste-invoer" / "fordpass-laden.json").read_text())
BERICHTEN = "sensor.fordpass_voorbeeld_messages"
ROL = {r: LADEN["register"][r]["entity_id"] for r in ("laden", "stekker", "accu")}
TIJDLIJN = [(datetime.fromisoformat(t), r, s) for t, r, s in LADEN["tijdlijn"]]
AMS = dt_util.get_time_zone("Europe/Amsterdam")

KAART: dict[str, Any] = {
    "type": KAART_TYPE,
    "afval": False,
    "auto": True,
    "auto_berichten": [BERICHTEN],
    "personen": [BRAM, ANNA],
    "diensten": {BRAM: "notify.test_bram", ANNA: "test_anna"},
}

meldingen = lambda telefoons: [(d, x["title"], x["message"]) for d, x in telefoons if x["message"] != "clear_notification"]  # noqa: E731
gewist = lambda telefoons: [(d, x["data"]["tag"]) for d, x in telefoons if x["message"] == "clear_notification"]  # noqa: E731


def lokaal(t: datetime) -> str:
    return t.astimezone(AMS).strftime("%d-%m %H:%M")


# ------------------------------------------------------------ pure functies


def test_de_woorden_uit_de_dump() -> None:
    assert [auto.laad_stand(s) for s in ("IN_PROGRESS", "PAUSED", "NOT_PLUGGED_IN", "unavailable", "WIE_WEET")] == [
        "laadt", "aan", "los", None, None,
    ]
    assert [auto.stekker_erin(s) for s in ("CONNECTED", "DISCONNECTED", "unknown")] == [True, False, None]
    assert auto.procent("80.0") == 80.0 and auto.procent("unavailable") is None and auto.procent("140") is None
    # Alles wat de tijdlijn zegt, kennen we.
    for _, rol, s in TIJDLIJN:
        if s != "unavailable":
            assert {"laden": auto.laad_stand, "stekker": auto.stekker_erin, "accu": auto.procent}[rol](s) is not None, s


def test_de_teksten() -> None:
    assert auto.laden_melding("Bus", 80.0, "nl") == ("Bus: klaar met laden", "De accu staat op 80% en laadt niet meer. De stekker zit er nog in.")
    assert auto.accu_melding("Bus", 18.0, "en") == ("Bus: battery low", "The battery is at 18%.")


def test_grens_en_keuzes_op_de_kaart() -> None:
    m = kaarten.auto_uit(KAART)
    assert (m.gebeurtenissen, m.accu_grens) == (["berichten", "laden", "accu"], 20)
    m = kaarten.auto_uit({**KAART, "auto_meldingen": ["accu", "iets"], "auto_accu_grens": "25"})
    assert (m.gebeurtenissen, m.accu_grens) == (["accu"], 25)
    assert kaarten.auto_uit({**KAART, "auto_accu_grens": 0}).accu_grens == 20


# ------------------------------------------------------------ de motor


async def zet_op(hass: HomeAssistant, freezer, wanneer: datetime, kaart: dict[str, Any] = KAART, stand: dict[str, str] | None = None):
    await hass.config.async_set_time_zone("Europe/Amsterdam")
    freezer.move_to(wanneer)
    hass.states.async_set(BRAM, "home", {"friendly_name": "Bram", "user_id": "gebruiker-bram"})
    hass.states.async_set(ANNA, "home", {"friendly_name": "Anna", "user_id": "gebruiker-anna"})
    bron = MockConfigEntry(domain="fordpass")
    bron.add_to_hass(hass)
    apparaat = dr.async_get(hass).async_get_or_create(config_entry_id=bron.entry_id, identifiers={("fordpass", "x")}, name="Bus")
    reg = er.async_get(hass)
    for eid, tk in [(BERICHTEN, "messages"), *((ROL[r], LADEN["register"][r]["translation_key"]) for r in ROL)]:
        reg.async_get_or_create("sensor", "fordpass", tk, suggested_object_id=eid.split(".", 1)[1], device_id=apparaat.id,
                                config_entry=bron, translation_key=tk)
    # Na het register: een toestand die er al staat, geeft de registerregel een `_2`.
    hass.states.async_set(BERICHTEN, "0", {"unit_of_measurement": "messages"})
    for rol, s in (stand or {}).items():
        zet(hass, rol, s)
    await zet_integratie_op(hass)
    await zet_dashboard(hass, [kaart])
    return hass.data[DOMAIN][DATA_MOTOR]


def zet(hass: HomeAssistant, rol: str, s: str) -> None:
    attr = {"unit_of_measurement": "%", "device_class": "battery"} if rol == "accu" else {}
    hass.states.async_set(ROL[rol], s, attr, force_update=True)


def begin(tot: datetime) -> dict[str, str]:
    """De laatste stand van elke rol vóór dit moment."""
    stand: dict[str, str] = {}
    for t, rol, s in TIJDLIJN:
        if t < tot:
            stand[rol] = s
    return stand


async def speel_af(hass: HomeAssistant, freezer, motor, van: datetime, tot: datetime, telefoons: list | None = None) -> list[str]:
    """De tijdlijn van `van` tot `tot`, met elke minuut een tik. Geeft "dd-mm uu:mm titel" van wat Bram kreeg."""
    gekregen: list[str] = []
    # Eerst de stand van dat moment: een proef die van 25-11 naar 27-11 springt, slaat de dagen ertussen over.
    freezer.move_to(van)
    for rol, s in begin(van).items():
        zet(hass, rol, s)
    await hass.async_block_till_done()
    rijen = [x for x in TIJDLIJN if van <= x[0] < tot]
    minuut = van.replace(second=0, microsecond=0) + timedelta(minutes=1)
    i = 0
    while minuut <= tot:
        while i < len(rijen) and rijen[i][0] < minuut:
            freezer.move_to(rijen[i][0])
            zet(hass, rijen[i][1], rijen[i][2])
            await hass.async_block_till_done()
            i += 1
        freezer.move_to(minuut)
        voor = len(telefoons) if telefoons is not None else 0
        await motor._tik(dt_util.now())
        await hass.async_block_till_done()
        if telefoons is not None:
            gekregen += [f"{lokaal(minuut)} {x['title']}" for d, x in telefoons[voor:] if d == "test_bram" and x["message"] != "clear_notification"]
        minuut += timedelta(minutes=1)
    return gekregen


async def test_drie_dagen_uit_de_dump(hass: HomeAssistant, freezer, telefoons) -> None:
    """Twee meldingen in drie dagen: klaar met laden na de beurt tot 80 %, en accu laag op 18 %.

    Niet: de PAUSED van 5,5 minuut tussendoor op 27-11 om 16:01, de PAUSED bij het inpluggen, 07:00 `unavailable`.
    """
    van = TIJDLIJN[0][0] + timedelta(seconds=1)
    motor = await zet_op(hass, freezer, van, stand=begin(van))
    gekregen = await speel_af(hass, freezer, motor, van, TIJDLIJN[-1][0] + timedelta(minutes=30), telefoons)
    assert gekregen == ["25-11 13:35 Bus: klaar met laden", "27-11 15:16 Bus: accu laag"]
    teksten = [t for d, _, t in meldingen(telefoons) if d == "test_bram"]
    assert teksten == ["De accu staat op 80% en laadt niet meer. De stekker zit er nog in.", "De accu staat op 18%."]
    tags = [x["data"]["tag"] for d, x in telefoons if d == "test_bram" and x["message"] != "clear_notification"]
    assert tags == [auto_tag(BERICHTEN, "laden"), auto_tag(BERICHTEN, "accu")]
    # De stekker eruit op 25-11 om 18:31 haalde "klaar" weg; het laden op 27-11 "accu laag".
    assert [t for d, t in gewist(telefoons) if d == "test_bram"] == [auto_tag(BERICHTEN, "laden"), auto_tag(BERICHTEN, "accu")]


async def test_het_moment_van_klaar_en_van_laag(hass: HomeAssistant, freezer, telefoons) -> None:
    """Klaar: 15 minuten na PAUSED om 13:19:11. Laag: 5 minuten na 18 % om 15:10:05."""
    van = datetime(2026, 11, 25, 12, 0, tzinfo=AMS)
    motor = await zet_op(hass, freezer, van, stand=begin(van))
    await speel_af(hass, freezer, motor, van, datetime(2026, 11, 25, 13, 34, tzinfo=AMS))
    assert meldingen(telefoons) == []
    await speel_af(hass, freezer, motor, datetime(2026, 11, 25, 13, 34, tzinfo=AMS), datetime(2026, 11, 25, 13, 35, tzinfo=AMS))
    assert [m[1] for m in meldingen(telefoons)] == ["Bus: klaar met laden"] * 2

    telefoons.clear()
    van = datetime(2026, 11, 27, 15, 0, tzinfo=AMS)
    await speel_af(hass, freezer, motor, van, datetime(2026, 11, 27, 15, 15, tzinfo=AMS))
    assert meldingen(telefoons) == []
    await speel_af(hass, freezer, motor, datetime(2026, 11, 27, 15, 15, tzinfo=AMS), datetime(2026, 11, 27, 15, 16, tzinfo=AMS))
    assert [m[1:] for m in meldingen(telefoons)] == [("Bus: accu laag", "De accu staat op 18%.")] * 2


async def test_een_hogere_grens_en_de_sprong_bij_het_inpluggen(hass: HomeAssistant, freezer, telefoons) -> None:
    """Met 25 %: op 25-11 sprong de accu om 12:13:02 naar 23, 34 s voordat de stekker CONNECTED zei. Geen melding.
    Op 27-11 om 13:25:55 naar 20: wel, om 13:31."""
    kaart = {**KAART, "auto_accu_grens": 25}
    van = datetime(2026, 11, 25, 12, 0, tzinfo=AMS)
    motor = await zet_op(hass, freezer, van, kaart=kaart, stand=begin(van))
    await speel_af(hass, freezer, motor, van, datetime(2026, 11, 25, 12, 30, tzinfo=AMS))
    assert meldingen(telefoons) == []
    van = datetime(2026, 11, 27, 13, 0, tzinfo=AMS)
    await speel_af(hass, freezer, motor, van, datetime(2026, 11, 27, 13, 30, tzinfo=AMS))
    assert meldingen(telefoons) == []
    await speel_af(hass, freezer, motor, datetime(2026, 11, 27, 13, 30, tzinfo=AMS), datetime(2026, 11, 27, 16, 0, tzinfo=AMS))
    # Eén keer, ook al zakt hij daarna naar 18, 15 en 13.
    assert [m[2] for m in meldingen(telefoons) if m[0] == "test_bram"] == ["De accu staat op 20%."]


async def test_wie_alleen_berichten_wil(hass: HomeAssistant, freezer, telefoons) -> None:
    van = datetime(2026, 11, 25, 13, 0, tzinfo=AMS)
    motor = await zet_op(hass, freezer, van, stand=begin(van))
    motor.opslag.zet_keuze("auto", ANNA, "gebeurtenissen", ["berichten"])
    await speel_af(hass, freezer, motor, van, datetime(2026, 11, 25, 13, 40, tzinfo=AMS))
    assert [m[0] for m in meldingen(telefoons)] == ["test_bram"]
    # En een kaart waarop laden niet aan staat: niemand.
    telefoons.clear()
    van = datetime(2026, 11, 27, 15, 0, tzinfo=AMS)
    await zet_dashboard(hass, [{**KAART, "auto_meldingen": ["berichten", "laden"]}])
    await speel_af(hass, freezer, motor, van, datetime(2026, 11, 27, 15, 30, tzinfo=AMS))
    assert meldingen(telefoons) == []


async def test_gestopt_voor_een_herstart(hass: HomeAssistant, freezer, telefoons, hass_storage) -> None:
    """Om 13:19:11 gestopt, herstart om 13:25: de klok telt vanaf 13:19:11 en meldt om 13:35, één keer."""
    gestopt = datetime(2026, 11, 25, 13, 19, 11, tzinfo=AMS)
    hass_storage[STORAGE_KEY] = {"version": 1, "data": {"auto_laden": {BERICHTEN: {"gestopt_om": gestopt.isoformat()}}}}
    van = datetime(2026, 11, 25, 13, 25, tzinfo=AMS)
    motor = await zet_op(hass, freezer, van, stand=begin(van))
    await speel_af(hass, freezer, motor, van, datetime(2026, 11, 25, 13, 34, tzinfo=AMS))
    assert meldingen(telefoons) == []
    await speel_af(hass, freezer, motor, datetime(2026, 11, 25, 13, 34, tzinfo=AMS), datetime(2026, 11, 25, 14, 30, tzinfo=AMS))
    assert [m[1] for m in meldingen(telefoons) if m[0] == "test_bram"] == ["Bus: klaar met laden"]


async def test_stekker_eruit_tijdens_een_herstart(hass: HomeAssistant, freezer, telefoons, hass_storage) -> None:
    """Gestopt om 13:19:11, en bij de start na de herstart is de stekker eruit: geen melding."""
    gestopt = datetime(2026, 11, 25, 13, 19, 11, tzinfo=AMS)
    hass_storage[STORAGE_KEY] = {"version": 1, "data": {"auto_laden": {BERICHTEN: {"gestopt_om": gestopt.isoformat()}}}}
    van = datetime(2026, 11, 25, 18, 35, tzinfo=AMS)
    motor = await zet_op(hass, freezer, van, stand=begin(van))
    await speel_af(hass, freezer, motor, van, datetime(2026, 11, 25, 19, 0, tzinfo=AMS))
    assert meldingen(telefoons) == []
    assert "gestopt_om" not in motor.opslag.auto_laden(BERICHTEN)


async def test_laag_gemeld_overleeft_een_herstart(hass: HomeAssistant, freezer, telefoons, hass_storage) -> None:
    """REGRESSIEWACHT (slaagt ook op 0.141.0, die nooit iets over de accu meldde): accu laag is gemeld; na de herstart
    zakt hij verder: geen tweede melding."""
    hass_storage[STORAGE_KEY] = {"version": 1, "data": {"auto_laden": {BERICHTEN: {"laag_gemeld": True, "accu_op_telefoon": True}}}}
    van = datetime(2026, 11, 27, 15, 20, tzinfo=AMS)
    motor = await zet_op(hass, freezer, van, stand=begin(van))
    await speel_af(hass, freezer, motor, van, datetime(2026, 11, 27, 16, 0, tzinfo=AMS))
    assert meldingen(telefoons) == []


async def test_de_sensoren_van_de_auto_komen_na_ons(hass: HomeAssistant, freezer, telefoons) -> None:
    """Na een herstart laadt FordPass vaak na deze integratie. Gemeten in de testinstance op 27-11-2026: de accu zakte
    naar 18 en er kwam niets, tot de entry herladen werd. De klok zoekt ze nu elke minuut opnieuw."""
    van = datetime(2026, 11, 27, 15, 0, tzinfo=AMS)
    await hass.config.async_set_time_zone("Europe/Amsterdam")
    freezer.move_to(van)
    hass.states.async_set(BRAM, "home", {"friendly_name": "Bram", "user_id": "gebruiker-bram"})
    hass.states.async_set(ANNA, "home", {"friendly_name": "Anna", "user_id": "gebruiker-anna"})
    bron = MockConfigEntry(domain="fordpass")
    bron.add_to_hass(hass)
    apparaat = dr.async_get(hass).async_get_or_create(config_entry_id=bron.entry_id, identifiers={("fordpass", "x")}, name="Bus")
    reg = er.async_get(hass)
    reg.async_get_or_create("sensor", "fordpass", "messages", suggested_object_id=BERICHTEN.split(".", 1)[1],
                            device_id=apparaat.id, config_entry=bron, translation_key="messages")
    hass.states.async_set(BERICHTEN, "0", {"unit_of_measurement": "messages"})
    await zet_integratie_op(hass)
    await zet_dashboard(hass, [KAART])
    motor = hass.data[DOMAIN][DATA_MOTOR]
    # Nu pas de rest van de auto.
    for r in ROL:
        tk = LADEN["register"][r]["translation_key"]
        reg.async_get_or_create("sensor", "fordpass", tk, suggested_object_id=ROL[r].split(".", 1)[1], device_id=apparaat.id,
                                config_entry=bron, translation_key=tk)
    gekregen = await speel_af(hass, freezer, motor, van, datetime(2026, 11, 27, 15, 30, tzinfo=AMS), telefoons)
    assert gekregen == ["27-11 15:16 Bus: accu laag"]
