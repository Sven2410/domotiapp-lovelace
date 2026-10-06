"""De klok, het versturen, en de knop "Staat buiten". Alles **NIEUW GEDRAG**."""

from __future__ import annotations

from datetime import datetime

from homeassistant.core import Context, HomeAssistant
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import async_fire_time_changed

from custom_components.domotiapp_lovelace.meldingen.motor import lees_actie

from ..conftest import zet_integratie_op
from .conftest import KAART, LIEKE, SVEN, zet_dashboard

AMS = dt_util.get_time_zone("Europe/Amsterdam")


def om(dag: int, uur: int, minuut: int) -> datetime:
    return datetime(2026, 9, dag, uur, minuut, tzinfo=AMS)


async def test_om_half_acht_s_avonds_krijgt_iedereen_de_melding(
    hass: HomeAssistant, motor, telefoons
) -> None:
    hass.states.async_set("sensor.afval_morgen", "gft")
    await motor._tik(om(26, 19, 30))

    assert [d for d, _ in telefoons] == ["test_sven", "test_lieke"]
    data = telefoons[0][1]
    assert data["title"] == "Morgen GFT"
    assert data["message"] == "Morgen wordt GFT opgehaald. Zet de container vanavond aan de straat."
    # De ochtendmelding krijgt dezelfde tag en vervangt die van de avond.
    assert data["data"]["tag"] == "domotiapp-afval-2026-09-27"
    assert data["data"]["actions"] == [
        {"action": "DOMOTIAPP_AFVAL_BUITEN|afval|2026-09-27", "title": "Staat buiten"}
    ]


async def test_twee_bakken_op_een_dag_staan_samen_in_een_melding(
    hass: HomeAssistant, motor, telefoons
) -> None:
    """REGRESSIEWACHT, 6 oktober 2026.

    De eigenaar meldde dat er maar één bak in zijn melding stond terwijl er
    twee aan straat moesten. Zijn sensor zei om 19:30 letterlijk wat hier staat
    (uitgelezen uit de geschiedenis); deze toets houdt vast dat daar één
    melding met allebei de bakken uit komt, en niet twee en niet één bak.
    """
    hass.states.async_set("sensor.afval_morgen", "Papier, Restafval")
    await motor._tik(om(26, 19, 30))

    assert [d for d, _ in telefoons] == ["test_sven", "test_lieke"]
    data = telefoons[0][1]
    assert data["title"] == "Morgen Papier en Restafval"
    assert data["message"] == (
        "Morgen worden Papier en Restafval opgehaald. Zet de containers vanavond aan de straat."
    )


async def test_wie_uit_staat_krijgt_niets(hass: HomeAssistant, motor, telefoons) -> None:
    hass.states.async_set("sensor.afval_morgen", "gft")
    motor.opslag.zet_aan("afval", LIEKE, False)
    await motor._tik(om(26, 19, 30))
    assert [d for d, _ in telefoons] == ["test_sven"]


async def test_geen_afval_is_geen_melding(hass: HomeAssistant, motor, telefoons) -> None:
    hass.states.async_set("sensor.afval_morgen", "Geen")
    await motor._tik(om(26, 19, 30))
    assert telefoons == []


async def test_op_een_andere_minuut_gebeurt_er_niets(hass: HomeAssistant, motor, telefoons) -> None:
    hass.states.async_set("sensor.afval_morgen", "gft")
    await motor._tik(om(26, 19, 31))
    assert telefoons == []


async def test_niet_twee_keer_op_een_dag(hass: HomeAssistant, motor, telefoons) -> None:
    hass.states.async_set("sensor.afval_morgen", "gft")
    await motor._tik(om(26, 19, 30))
    await motor._tik(om(26, 19, 30))
    assert len(telefoons) == 2


async def test_staat_buiten_slaat_de_ochtend_over_en_wist_bij_de_rest(
    hass: HomeAssistant, motor, telefoons
) -> None:
    hass.states.async_set("sensor.afval_morgen", "gft")
    await motor._tik(om(26, 19, 30))
    telefoons.clear()

    # Sven tikt op "Staat buiten" in zijn melding.
    hass.bus.async_fire(
        "mobile_app_notification_action",
        {"action": "DOMOTIAPP_AFVAL_BUITEN|afval|2026-09-27"},
        context=Context(user_id="gebruiker-sven"),
    )
    await hass.async_block_till_done()

    buiten = motor.opslag.buiten("afval")
    assert buiten["datum"] == "2026-09-27"
    assert buiten["door"] == SVEN
    # Bij Lieke verdwijnt de melding; bij Sven zelf is hij al weg door de tik.
    assert telefoons == [
        ("test_lieke", {"message": "clear_notification", "data": {"tag": "domotiapp-afval-2026-09-27"}})
    ]
    telefoons.clear()

    # De volgende ochtend: geen melding meer, de container staat er al.
    hass.states.async_set("sensor.afval_vandaag", "gft")
    await motor._tik(om(27, 7, 30))
    assert telefoons == []


async def test_zonder_staat_buiten_komt_de_ochtend_gewoon(
    hass: HomeAssistant, motor, telefoons
) -> None:
    hass.states.async_set("sensor.afval_vandaag", "pmd")
    await motor._tik(om(27, 7, 30))
    assert [d["title"] for _, d in telefoons] == ["Vandaag PMD", "Vandaag PMD"]


async def test_een_weggehaalde_kaart_verstuurt_niets(hass: HomeAssistant, motor, telefoons) -> None:
    hass.states.async_set("sensor.afval_morgen", "gft")
    await zet_dashboard(hass, [{"type": "markdown", "content": "leeg"}])
    await motor._tik(om(26, 19, 30))
    assert telefoons == []


async def test_een_nieuwe_tijd_telt_zodra_het_dashboard_is_opgeslagen(
    hass: HomeAssistant, motor, telefoons
) -> None:
    await zet_dashboard(hass, [{**KAART, "tijd_morgen": "20:15:00"}])
    assert motor.meldingen["afval"].tijden["morgen"] == "20:15"


async def test_de_klok_van_home_assistant_tikt_echt(
    hass: HomeAssistant, telefoons, freezer
) -> None:
    """Niet `_tik` met de hand, maar een echte tijdsgebeurtenis.

    De klok moet VÓÓR het opzetten staan: de motor plant zijn volgende tik
    vanaf het moment van opzetten, en een klok die daarna terugspringt haalt
    die tik nooit meer in.
    """
    await hass.config.async_set_time_zone("Europe/Amsterdam")
    freezer.move_to(datetime(2026, 9, 26, 19, 29, 50, tzinfo=AMS))
    hass.states.async_set(SVEN, "home", {"friendly_name": "Sven"})
    hass.states.async_set(LIEKE, "home", {"friendly_name": "Lieke"})
    await zet_integratie_op(hass)
    await zet_dashboard(hass, [KAART])
    hass.states.async_set("sensor.afval_morgen", "papier")

    freezer.move_to(om(26, 19, 30))
    async_fire_time_changed(hass, om(26, 19, 30))
    await hass.async_block_till_done()
    assert [d["title"] for _, d in telefoons] == ["Morgen Papier", "Morgen Papier"]


def test_een_knop_van_een_ander_is_niet_de_onze() -> None:
    assert lees_actie("DOMOTIAPP_AFVAL_BUITEN|afval|2026-09-27") == ("afval", "2026-09-27")
    assert lees_actie("URI") is None
    assert lees_actie("DOMOTIAPP_AFVAL_BUITEN|afval") is None
    assert lees_actie(None) is None


async def test_een_proef_stuurt_ook_zonder_afval(hass: HomeAssistant, motor, telefoons) -> None:
    hass.states.async_set("sensor.afval_morgen", "Geen")
    uitkomst = await motor.async_verstuur("afval", "morgen", om(26, 12, 0), proef=True)
    assert uitkomst["verstuurd"] == [SVEN, LIEKE]
    assert telefoons[0][1]["title"] == "Proef · Morgen GFT"
    # Een proef telt niet als "vandaag al verstuurd".
    assert motor.opslag.verstuurd("afval", "morgen") is None
