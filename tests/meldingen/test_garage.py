"""De garagedeurmelding (0.139.0). Alles **NIEUW GEDRAG**.

Het gedrag is dat van de eigenaar, 27 november 2026: na vijf minuten open een
melding, daarna elk uur; Sluiten (alleen als het contact open zegt, en daarna
nakijken) en negeren voor het hele huis; om 22:00 hoe dan ook, met "tot morgen";
dicht is alles weg; en een herstart gaat gewoon verder.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta
from typing import Any

import pytest

from homeassistant.core import Context, HomeAssistant, ServiceCall
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

from custom_components.domotiapp_lovelace.const import DOMAIN
from custom_components.domotiapp_lovelace.meldingen import garage
from custom_components.domotiapp_lovelace.meldingen.const import DATA_MOTOR, KAART_TYPE, STORAGE_KEY

from ..conftest import zet_integratie_op
from .conftest import ANNA, BRAM, zet_dashboard

AMS = dt_util.get_time_zone("Europe/Amsterdam")
CONTACT = "binary_sensor.garagedeur"
PULS = "switch.garage_puls"
TAG = "domotiapp-garage-garage"

KAART: dict[str, Any] = {
    "type": KAART_TYPE,
    "afval": False,
    "garage": True,
    "garage_contact": CONTACT,
    "garage_bediening": PULS,
    "garage_pad": "/dashboard-thuis/0#garage",
    "personen": [BRAM, ANNA],
    "diensten": {BRAM: "notify.test_bram", ANNA: "test_anna"},
}


def om(dag: int, uur: int, minuut: int, seconde: int = 0) -> datetime:
    return datetime(2026, 11, dag, uur, minuut, seconde, tzinfo=AMS)


# ------------------------------------------------------------ pure functies


def test_de_standaard_van_de_eigenaar() -> None:
    inst = garage.instelling_uit({"garage": True, "garage_contact": CONTACT})
    assert (inst.minuten, inst.herhaal, inst.negeer, inst.avond, inst.morgen) == (5, 60, [15, 60, 240], "22:00", "07:00")
    assert garage.instelling_uit({"garage_avond_aan": False}).avond is None
    assert garage.instelling_uit({"garage_negeer": ["30", 15, 0, "x", 15]}).negeer == [15, 30]
    # Een melding opent alleen een pad binnen Home Assistant.
    assert garage.instelling_uit({"garage_pad": "https://ergens.nl"}).pad == ""
    assert garage.instelling_uit({"garage_pad": "/dashboard-thuis/0#garage"}).pad == "/dashboard-thuis/0#garage"
    assert garage.instelling_uit({"garage_bediening": "light.x"}).bediening == ""


def test_het_verloop_van_een_open_deur() -> None:
    inst = garage.instelling_uit({})
    open14 = {"open_sinds": om(27, 14, 0).isoformat()}
    assert garage.volgende(open14, inst, om(27, 14, 4), True) is None
    assert garage.volgende(open14, inst, om(27, 14, 5), True) == "eerste"
    gemeld = {**open14, "gemeld": om(27, 14, 5).isoformat()}
    assert garage.volgende(gemeld, inst, om(27, 15, 4), True) is None
    assert garage.volgende(gemeld, inst, om(27, 15, 5), True) == "herinner"
    # Dicht is niets.
    assert garage.volgende(gemeld, inst, om(27, 15, 5), False) is None
    # Negeren: tot de tijd om is niets, daarna een nieuwe melding.
    negeer = {**gemeld, "negeer_tot": om(27, 16, 0).isoformat()}
    assert garage.volgende(negeer, inst, om(27, 15, 59), True) is None
    assert garage.volgende(negeer, inst, om(27, 16, 0), True) == "na_negeer"


def test_om_tien_uur_hoe_dan_ook_ook_tijdens_negeren() -> None:
    inst = garage.instelling_uit({})
    negeer = {"open_sinds": om(27, 20, 0).isoformat(), "gemeld": om(27, 20, 5).isoformat(), "negeer_tot": om(28, 0, 0).isoformat()}
    assert garage.volgende(negeer, inst, om(27, 21, 59), True) is None
    assert garage.volgende(negeer, inst, om(27, 22, 0), True) == "avond"
    # Eén keer per avond.
    assert garage.volgende({**negeer, "avond_gemeld": "2026-11-27"}, inst, om(27, 22, 30), True) is None
    # Wie om 23:00 opendoet, krijgt de gewone melding na vijf minuten.
    laat = {"open_sinds": om(27, 23, 0).isoformat()}
    assert garage.volgende(laat, inst, om(27, 23, 2), True) is None
    assert garage.volgende(laat, inst, om(27, 23, 5), True) == "eerste"
    # Uitgezet: geen avond.
    assert garage.volgende(negeer, garage.instelling_uit({"garage_avond_aan": False}), om(27, 22, 0), True) is None
    # Tot morgen: om 22:00 is dat 07:00 de volgende dag, om 05:00 dezelfde dag.
    assert garage.morgen_moment(om(27, 22, 0), "07:00") == om(28, 7, 0)
    assert garage.morgen_moment(om(28, 5, 0), "07:00") == om(28, 7, 0)


def test_de_knoppen_en_de_teksten() -> None:
    inst = garage.instelling_uit({"garage_bediening": PULS})
    titels = [k["title"] for k in garage.knoppen("garage", inst, "eerste", "nl")]
    assert titels == ["Deur sluiten", "Negeer 15 min", "Negeer 1 uur", "Negeer 4 uur"]
    # Android: drie.
    assert len(garage.knoppen("garage", inst, "eerste", "nl", android=True)) == 3
    avond = [k["title"] for k in garage.knoppen("garage", inst, "avond", "en")]
    assert avond == ["Close door", "Until tomorrow 07:00", "Ignore for 15 min", "Ignore for 1 hour", "Ignore for 4 hours"]
    # Zonder bediening geen Sluiten.
    assert garage.knoppen("garage", garage.instelling_uit({}), "eerste", "nl")[0]["title"] == "Negeer 15 min"
    assert garage.lees_actie("DOMOTIAPP_GARAGE|garage|negeer|15") == ("garage", "negeer", "15")
    assert garage.lees_actie("DOMOTIAPP_GARAGE|garage|weg|") is None
    assert garage.lees_actie("DOMOTIAPP_AFVAL_BUITEN|afval|2026-09-27") is None
    assert garage.bericht("eerste", "", 65, "nl") == ("Garagedeur", "De garagedeur staat al 1 uur en 5 minuten open.")
    assert garage.bericht("niet_dicht", "", 0, "en")[1] == "The garage door did not close. It is still open."
    assert garage.bericht("avond", "Poort", 0, "en", "22:00") == ("Poort", "It is 22:00 and the garage door is still open.")


# ------------------------------------------------------------ de motor


@pytest.fixture
def telefoons(hass: HomeAssistant) -> list[tuple[str, dict[str, Any]]]:
    aanroepen: list[tuple[str, dict[str, Any]]] = []

    async def ontvang(call: ServiceCall) -> None:
        aanroepen.append((call.service, dict(call.data)))

    for naam in ("test_bram", "test_anna", "mobile_app_telefoon_anna"):
        hass.services.async_register("notify", naam, ontvang)
    return aanroepen


@pytest.fixture
def pulsen() -> list[dict[str, Any]]:
    """De pulsen naar de schakelaar. `zet_op` hangt de nep-dienst op NA het opzetten:
    de integratie laadt de echte schakelaars, en die zou hem vervangen."""
    return []


async def zet_op(hass: HomeAssistant, freezer, wanneer: datetime, kaart: dict[str, Any] = KAART, pulsen: list | None = None):
    await hass.config.async_set_time_zone("Europe/Amsterdam")
    freezer.move_to(wanneer)
    hass.states.async_set(BRAM, "home", {"friendly_name": "Bram", "user_id": "gebruiker-bram"})
    hass.states.async_set(ANNA, "home", {"friendly_name": "Anna", "user_id": "gebruiker-anna"})
    await zet_integratie_op(hass)
    if pulsen is not None:

        async def puls(call: ServiceCall) -> None:
            pulsen.append(dict(call.data))
            # Een echte schakelaar (via de cloud) antwoordt niet meteen.
            await asyncio.sleep(0)

        hass.services.async_register("switch", "toggle", puls)
    await zet_dashboard(hass, [kaart])
    return hass.data[DOMAIN][DATA_MOTOR]


async def doe_open(hass: HomeAssistant, freezer, wanneer: datetime) -> None:
    freezer.move_to(wanneer)
    hass.states.async_set(CONTACT, "on", {"device_class": "garage_door"})
    await hass.async_block_till_done()


async def knop(hass: HomeAssistant, actie: str, wie: str) -> None:
    hass.bus.async_fire("mobile_app_notification_action", {"action": actie}, context=Context(user_id=wie))
    await hass.async_block_till_done()


meldingen = lambda telefoons: [(d, x["message"]) for d, x in telefoons if x["message"] != "clear_notification"]  # noqa: E731
gewist = lambda telefoons: sorted(d for d, x in telefoons if x["message"] == "clear_notification")  # noqa: E731


async def test_na_vijf_minuten_een_melding_met_knoppen_en_daarna_elk_uur(hass: HomeAssistant, freezer, telefoons) -> None:
    hass.states.async_set(CONTACT, "off", {"device_class": "garage_door"})
    motor = await zet_op(hass, freezer, om(27, 13, 0))
    await doe_open(hass, freezer, om(27, 14, 0))
    assert motor.opslag.garage("garage")["open_sinds"] == om(27, 14, 0).isoformat()

    await motor._tik(om(27, 14, 4))
    assert telefoons == []
    await motor._tik(om(27, 14, 5))
    assert meldingen(telefoons) == [
        ("test_bram", "De garagedeur staat al 5 minuten open."),
        ("test_anna", "De garagedeur staat al 5 minuten open."),
    ]
    data = telefoons[0][1]["data"]
    assert data["tag"] == TAG
    assert data["url"] == data["clickAction"] == "/dashboard-thuis/0#garage"
    assert [k["action"] for k in data["actions"]] == [
        "DOMOTIAPP_GARAGE|garage|sluit|",
        "DOMOTIAPP_GARAGE|garage|negeer|15",
        "DOMOTIAPP_GARAGE|garage|negeer|60",
        "DOMOTIAPP_GARAGE|garage|negeer|240",
    ]
    telefoons.clear()
    await motor._tik(om(27, 14, 30))
    assert telefoons == []
    await motor._tik(om(27, 15, 5))
    assert meldingen(telefoons)[0] == ("test_bram", "De garagedeur staat al 1 uur en 5 minuten open.")


async def test_dicht_op_welke_manier_ook_wist_alles(hass: HomeAssistant, freezer, telefoons) -> None:
    hass.states.async_set(CONTACT, "off")
    motor = await zet_op(hass, freezer, om(27, 13, 0))
    await doe_open(hass, freezer, om(27, 14, 0))
    await motor._tik(om(27, 14, 5))
    telefoons.clear()

    # Een gewone afstandsbediening: alleen het contact zegt het.
    freezer.move_to(om(27, 14, 7))
    hass.states.async_set(CONTACT, "off")
    await hass.async_block_till_done()
    assert gewist(telefoons) == ["test_anna", "test_bram"]
    stand = motor.opslag.garage("garage")
    assert "open_sinds" not in stand and "gemeld" not in stand
    # Opnieuw open begint weer bij vijf minuten.
    telefoons.clear()
    await doe_open(hass, freezer, om(27, 14, 10))
    await motor._tik(om(27, 14, 14))
    assert telefoons == []
    await motor._tik(om(27, 14, 15))
    assert len(meldingen(telefoons)) == 2


async def test_onbereikbaar_wist_niets(hass: HomeAssistant, freezer, telefoons) -> None:
    hass.states.async_set(CONTACT, "off")
    motor = await zet_op(hass, freezer, om(27, 13, 0))
    await doe_open(hass, freezer, om(27, 14, 0))
    await motor._tik(om(27, 14, 5))
    telefoons.clear()
    hass.states.async_set(CONTACT, "unavailable")
    await hass.async_block_till_done()
    assert telefoons == []
    assert motor.opslag.garage("garage")["open_sinds"] == om(27, 14, 0).isoformat()


async def test_sluiten_stuurt_alleen_een_puls_als_hij_open_staat(hass: HomeAssistant, freezer, telefoons, pulsen) -> None:
    hass.states.async_set(CONTACT, "off")
    motor = await zet_op(hass, freezer, om(27, 13, 0), pulsen=pulsen)
    await doe_open(hass, freezer, om(27, 14, 0))
    await motor._tik(om(27, 14, 5))
    telefoons.clear()

    await knop(hass, "DOMOTIAPP_GARAGE|garage|sluit|", "gebruiker-bram")
    assert pulsen == [{"entity_id": PULS}]
    # De melding verdwijnt bij iedereen.
    assert gewist(telefoons) == ["test_anna", "test_bram"]
    assert motor.opslag.garage("garage")["sluit"]["door"] == BRAM

    # De deur gaat dicht: de kaart weet wie het deed.
    freezer.move_to(om(27, 14, 6))
    hass.states.async_set(CONTACT, "off")
    await hass.async_block_till_done()
    assert motor.opslag.garage("garage")["dicht_door"] == BRAM

    # Een tweede tik op een oude melding, nu de deur dicht is: geen puls, want
    # dezelfde puls zet hem juist open.
    await knop(hass, "DOMOTIAPP_GARAGE|garage|sluit|", "gebruiker-anna")
    assert pulsen == [{"entity_id": PULS}]


async def test_geen_tweede_puls_terwijl_hij_dichtgaat(hass: HomeAssistant, freezer, telefoons, pulsen) -> None:
    """NIEUW GEDRAG (0.140.1). Tijdens het sluiten zegt het contact nog open (bij een klant gemeten: 18 s), en een
    tweede puls zet een pulsdeur dan halverwege stil."""
    hass.states.async_set(CONTACT, "off")
    motor = await zet_op(hass, freezer, om(27, 13, 0), pulsen=pulsen)
    await doe_open(hass, freezer, om(27, 14, 0))
    await motor._tik(om(27, 14, 5))

    # Bram tikt, en tien tellen later Anna, op haar eigen telefoon: het contact zegt nog open.
    freezer.move_to(om(27, 14, 5))
    await knop(hass, "DOMOTIAPP_GARAGE|garage|sluit|", "gebruiker-bram")
    freezer.move_to(om(27, 14, 5) + timedelta(seconds=10))
    assert await motor.async_garage_knop("garage", garage.CMD_SLUIT, "", "gebruiker-anna") == {
        "gedaan": False,
        "reden": "De deur gaat al dicht",
    }
    assert pulsen == [{"entity_id": PULS}]
    assert motor.opslag.garage("garage")["sluit"]["door"] == BRAM

    # Twee tikken die tegelijk binnenkomen: de tweede ziet de eerste, ook terwijl die nog op de schakelaar wacht.
    hass.states.async_set(CONTACT, "off")
    await hass.async_block_till_done()
    await doe_open(hass, freezer, om(27, 15, 0))
    pulsen.clear()
    uitkomst = await asyncio.gather(
        motor.async_garage_knop("garage", garage.CMD_SLUIT, "", "gebruiker-bram"),
        motor.async_garage_knop("garage", garage.CMD_SLUIT, "", "gebruiker-anna"),
    )
    assert [u["gedaan"] for u in uitkomst] == [True, False]
    assert pulsen == [{"entity_id": PULS}]

    # Na de controle mag het weer: de deur ging niet dicht, en dan moet je opnieuw kunnen sluiten.
    freezer.move_to(om(27, 15, 0) + timedelta(seconds=garage.SLUIT_CONTROLE + 1))
    async_fire_time_changed(hass, dt_util.now())
    await hass.async_block_till_done()
    assert (await motor.async_garage_knop("garage", garage.CMD_SLUIT, "", "gebruiker-anna"))["gedaan"] is True
    assert len(pulsen) == 2


async def test_niet_dicht_na_sluiten_is_een_melding(hass: HomeAssistant, freezer, telefoons, pulsen) -> None:
    hass.states.async_set(CONTACT, "off")
    motor = await zet_op(hass, freezer, om(27, 13, 0), pulsen=pulsen)
    await doe_open(hass, freezer, om(27, 14, 0))
    await motor._tik(om(27, 14, 5))
    await knop(hass, "DOMOTIAPP_GARAGE|garage|sluit|", "gebruiker-bram")
    telefoons.clear()

    freezer.move_to(om(27, 14, 5) + timedelta(seconds=garage.SLUIT_CONTROLE + 1))
    async_fire_time_changed(hass, dt_util.now())
    await hass.async_block_till_done()
    assert meldingen(telefoons) == [
        ("test_bram", "De garagedeur is niet dichtgegaan. Hij staat nog open."),
        ("test_anna", "De garagedeur is niet dichtgegaan. Hij staat nog open."),
    ]
    assert "sluit" not in motor.opslag.garage("garage")


async def test_negeren_geldt_voor_iedereen_en_daarna_komt_hij_terug(hass: HomeAssistant, freezer, telefoons) -> None:
    hass.states.async_set(CONTACT, "off")
    motor = await zet_op(hass, freezer, om(27, 13, 0))
    await doe_open(hass, freezer, om(27, 14, 0))
    await motor._tik(om(27, 14, 5))
    telefoons.clear()

    freezer.move_to(om(27, 14, 6))
    await knop(hass, "DOMOTIAPP_GARAGE|garage|negeer|15", "gebruiker-anna")
    assert gewist(telefoons) == ["test_anna", "test_bram"]
    stand = motor.opslag.garage("garage")
    assert (stand["negeer_tot"], stand["negeer_door"]) == (om(27, 14, 21).isoformat(), ANNA)
    telefoons.clear()
    await motor._tik(om(27, 14, 20))
    assert telefoons == []
    await motor._tik(om(27, 14, 21))
    assert len(meldingen(telefoons)) == 2
    assert "negeer_tot" not in motor.opslag.garage("garage")


async def test_om_tien_uur_en_tot_morgen(hass: HomeAssistant, freezer, telefoons) -> None:
    hass.states.async_set(CONTACT, "off")
    motor = await zet_op(hass, freezer, om(27, 19, 0))
    await doe_open(hass, freezer, om(27, 20, 0))
    await motor._tik(om(27, 20, 5))
    freezer.move_to(om(27, 20, 6))
    await knop(hass, "DOMOTIAPP_GARAGE|garage|negeer|240", "gebruiker-bram")
    telefoons.clear()

    await motor._tik(om(27, 22, 0))
    assert meldingen(telefoons)[0] == ("test_bram", "Het is 22:00 en de garagedeur staat nog open.")
    assert [k["action"] for k in telefoons[0][1]["data"]["actions"]][:2] == [
        "DOMOTIAPP_GARAGE|garage|sluit|",
        "DOMOTIAPP_GARAGE|garage|morgen|",
    ]
    freezer.move_to(om(27, 22, 1))
    await knop(hass, "DOMOTIAPP_GARAGE|garage|morgen|", "gebruiker-bram")
    telefoons.clear()
    # De hele nacht niets, ook niet als de vier uur van eerder om zijn.
    for uur in (23, 0, 1, 2, 6):
        dag = 27 if uur == 23 else 28
        await motor._tik(om(dag, uur, 30))
    assert telefoons == []
    await motor._tik(om(28, 7, 0))
    assert len(meldingen(telefoons)) == 2


async def test_een_herstart_gaat_verder_met_de_klok(hass: HomeAssistant, freezer, telefoons, hass_storage) -> None:
    """Open sinds 13:58 in de opslag, herstart om 14:01: om 14:03 de melding."""
    hass_storage[STORAGE_KEY] = {"version": 1, "data": {"garage": {"garage": {"open_sinds": om(27, 13, 58).isoformat()}}}}
    hass.states.async_set(CONTACT, "on")
    motor = await zet_op(hass, freezer, om(27, 14, 1))
    await motor._tik(om(27, 14, 2))
    assert telefoons == []
    await motor._tik(om(27, 14, 3))
    assert len(meldingen(telefoons)) == 2


async def test_open_bij_de_start_telt_vanaf_de_start(hass: HomeAssistant, freezer, telefoons) -> None:
    hass.states.async_set(CONTACT, "on")
    motor = await zet_op(hass, freezer, om(27, 14, 0))
    assert motor.opslag.garage("garage")["open_sinds"] == om(27, 14, 0).isoformat()
    await motor._tik(om(27, 14, 4))
    assert telefoons == []
    await motor._tik(om(27, 14, 5))
    assert len(meldingen(telefoons)) == 2


async def test_dicht_gegaan_tijdens_een_herstart_wist_de_telefoons(hass: HomeAssistant, freezer, telefoons, hass_storage) -> None:
    hass_storage[STORAGE_KEY] = {
        "version": 1,
        "data": {"garage": {"garage": {"open_sinds": om(27, 13, 0).isoformat(), "gemeld": om(27, 13, 5).isoformat()}}},
    }
    hass.states.async_set(CONTACT, "off")
    motor = await zet_op(hass, freezer, om(27, 14, 0))
    await hass.async_block_till_done()
    assert gewist(telefoons) == ["test_anna", "test_bram"]
    assert "open_sinds" not in motor.opslag.garage("garage")


# De eigenaar, 27-11-2026: "Als ik op ignore heb gedrukt moet hij ook een ha restart daarna overleven!" De code deed dat
# al; deze proeven zijn REGRESSIEWACHT, behalve de laatste. Een herstart is hier: wat de vorige keer in de opslag kwam, en
# een nieuwe start.


async def test_negeren_komt_op_schijf(hass: HomeAssistant, freezer, telefoons, hass_storage) -> None:
    hass.states.async_set(CONTACT, "off")
    motor = await zet_op(hass, freezer, om(27, 14, 0))
    await doe_open(hass, freezer, om(27, 14, 0))
    await motor._tik(om(27, 14, 5))
    freezer.move_to(om(27, 14, 6))
    await knop(hass, "DOMOTIAPP_GARAGE|garage|negeer|60", "gebruiker-anna")
    freezer.move_to(om(27, 14, 6) + timedelta(seconds=5))
    async_fire_time_changed(hass, dt_util.now())
    await hass.async_block_till_done()
    op_schijf = hass_storage[STORAGE_KEY]["data"]["garage"]["garage"]
    assert op_schijf["negeer_tot"] == om(27, 15, 6).isoformat()
    assert op_schijf["negeer_door"] == ANNA
    assert op_schijf["open_sinds"] == om(27, 14, 0).isoformat()


@pytest.mark.parametrize("eerst", [[], ["unavailable", "unknown"]])
async def test_negeren_overleeft_een_herstart(hass: HomeAssistant, freezer, telefoons, hass_storage, eerst) -> None:
    """Genegeerd tot 16:00, herstart om 15:30. Ook als het contact na de start eerst niets weet."""
    hass_storage[STORAGE_KEY] = {"version": 1, "data": {"garage": {"garage": {
        "open_sinds": om(27, 14, 0).isoformat(), "gemeld": om(27, 14, 5).isoformat(),
        "negeer_tot": om(27, 16, 0).isoformat(), "negeer_door": ANNA, "negeer_om": om(27, 15, 0).isoformat(),
    }}}}
    hass.states.async_set(CONTACT, eerst[0] if eerst else "on")
    motor = await zet_op(hass, freezer, om(27, 15, 30))
    for toestand in [*eerst[1:], "on"]:
        hass.states.async_set(CONTACT, toestand)
        await hass.async_block_till_done()
        await motor._tik(om(27, 15, 31))
    stand = motor.opslag.garage("garage")
    assert stand["negeer_tot"] == om(27, 16, 0).isoformat()
    assert stand["open_sinds"] == om(27, 14, 0).isoformat()
    assert motor.garage_stand()["negeer_door"] == ANNA
    await motor._tik(om(27, 15, 59))
    assert meldingen(telefoons) == []
    await motor._tik(om(27, 16, 0))
    assert len(meldingen(telefoons)) == 2


async def test_negeren_dat_tijdens_een_herstart_afliep(hass: HomeAssistant, freezer, telefoons, hass_storage) -> None:
    hass_storage[STORAGE_KEY] = {"version": 1, "data": {"garage": {"garage": {
        "open_sinds": om(27, 14, 0).isoformat(), "gemeld": om(27, 14, 5).isoformat(), "negeer_tot": om(27, 15, 0).isoformat(),
    }}}}
    hass.states.async_set(CONTACT, "on")
    motor = await zet_op(hass, freezer, om(27, 15, 10))
    await motor._tik(om(27, 15, 10))
    assert len(meldingen(telefoons)) == 2
    telefoons.clear()
    await motor._tik(om(27, 15, 11))
    await motor._tik(om(27, 15, 30))
    assert meldingen(telefoons) == []


async def test_tot_morgen_overleeft_een_herstart_in_de_nacht(hass: HomeAssistant, freezer, telefoons, hass_storage) -> None:
    hass_storage[STORAGE_KEY] = {"version": 1, "data": {"garage": {"garage": {
        "open_sinds": om(27, 21, 0).isoformat(), "gemeld": om(27, 22, 0).isoformat(),
        "avond_gemeld": "2026-11-27", "negeer_tot": om(28, 7, 0).isoformat(), "negeer_door": BRAM,
    }}}}
    hass.states.async_set(CONTACT, "on")
    motor = await zet_op(hass, freezer, om(27, 23, 0))
    for nu in (om(27, 23, 0), om(27, 23, 30), om(28, 3, 0), om(28, 6, 59)):
        await motor._tik(nu)
    assert meldingen(telefoons) == []
    await motor._tik(om(28, 7, 0))
    assert len(meldingen(telefoons)) == 2


async def test_een_sluiten_van_voor_de_herstart(hass: HomeAssistant, freezer, telefoons, hass_storage, pulsen) -> None:
    """NIEUW GEDRAG (0.140.1). Sluiten om 14:10:00, herstart om 14:10:30 met het contact nog open: geen tweede puls,
    en de klok kijkt na."""
    hass_storage[STORAGE_KEY] = {"version": 1, "data": {"garage": {"garage": {
        "open_sinds": om(27, 14, 0).isoformat(), "gemeld": om(27, 14, 5).isoformat(),
        "sluit": {"door": BRAM, "om": om(27, 14, 10).isoformat()},
    }}}}
    hass.states.async_set(CONTACT, "on")
    motor = await zet_op(hass, freezer, om(27, 14, 10) + timedelta(seconds=30), pulsen=pulsen)
    assert (await motor.async_garage_knop("garage", garage.CMD_SLUIT, "", "gebruiker-anna"))["gedaan"] is False
    assert pulsen == []
    await motor._tik(om(27, 14, 11))
    assert meldingen(telefoons) == []
    await motor._tik(om(27, 14, 12))
    assert [m for _, m in meldingen(telefoons)] == ["De garagedeur is niet dichtgegaan. Hij staat nog open."] * 2
    assert "sluit" not in motor.opslag.garage("garage")


async def test_android_krijgt_drie_knoppen(hass: HomeAssistant, freezer, telefoons) -> None:
    MockConfigEntry(domain="mobile_app", data={"device_name": "Telefoon Anna", "os_name": "Android"}).add_to_hass(hass)
    hass.states.async_set(CONTACT, "off")
    kaart = {**KAART, "diensten": {BRAM: "test_bram", ANNA: "mobile_app_telefoon_anna"}}
    motor = await zet_op(hass, freezer, om(27, 13, 0), kaart)
    await doe_open(hass, freezer, om(27, 14, 0))
    await motor._tik(om(27, 14, 5))
    knoppen = {d: len(x["data"]["actions"]) for d, x in telefoons}
    assert knoppen == {"test_bram": 4, "mobile_app_telefoon_anna": 3}


async def test_negeren_vanaf_de_kaart(hass: HomeAssistant, freezer, telefoons, hass_ws_client) -> None:
    """Op de echte tijd van nu: het token van de proefklant verloopt na een half uur."""
    await hass.config.async_set_time_zone("Europe/Amsterdam")
    nu = dt_util.now().replace(microsecond=0)
    hass.states.async_set(CONTACT, "off")
    motor = await zet_op(hass, freezer, nu)
    await doe_open(hass, freezer, nu)
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": f"{DOMAIN}/meldingen/subscribe", "melding": "garage"})
    assert (await client.receive_json())["success"]
    stand = (await client.receive_json())["event"]
    assert stand["garage"]["open"] is True
    assert stand["garage"]["negeer"] == [15, 60, 240]

    await client.send_json({"id": 2, "type": f"{DOMAIN}/meldingen/garage", "melding": "garage", "actie": "negeer", "minuten": 60})
    berichten = [await client.receive_json() for _ in range(2)]
    uitslag = next(b for b in berichten if b.get("id") == 2 and b["type"] == "result")
    assert uitslag["result"] == {"gedaan": True}
    assert motor.opslag.garage("garage")["negeer_tot"] == (nu + timedelta(minutes=60)).isoformat()
    assert next(b for b in berichten if b["type"] == "event")["event"]["garage"]["negeer_tot"] == (nu + timedelta(minutes=60)).isoformat()

    await client.send_json({"id": 3, "type": f"{DOMAIN}/meldingen/garage", "melding": "garage", "actie": "hervat"})
    [await client.receive_json() for _ in range(2)]
    assert "negeer_tot" not in motor.opslag.garage("garage")


async def test_een_proef_gaat_naar_een_persoon_en_zijn_knoppen_doen_niets(hass: HomeAssistant, freezer, telefoons, pulsen) -> None:
    hass.states.async_set(CONTACT, "on")
    motor = await zet_op(hass, freezer, om(27, 14, 0), pulsen=pulsen)
    uit = await motor.async_verstuur("garage", "morgen", proef=True, alleen=ANNA)
    assert uit["verstuurd"] == [ANNA]
    assert telefoons[0][1]["title"] == "Proef · Garagedeur"
    assert telefoons[0][1]["data"]["tag"] == "domotiapp-garage-proef"
    await knop(hass, telefoons[0][1]["data"]["actions"][0]["action"], "gebruiker-anna")
    assert pulsen == []
    assert "gemeld" not in motor.opslag.garage("garage")
