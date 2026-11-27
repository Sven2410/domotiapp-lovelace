"""De garagemelding per persoon (0.145.0). Alles **NIEUW GEDRAG**, behalve waar REGRESSIEWACHT staat.

De eigenaar, 27 november 2026: "maar personen kunnen niet instellen dus na hoeveel minuten etc etc?". Ieder kiest in zijn
pop-up na hoeveel minuten, hoe vaak daarna en de avondmelding; de kaart is de standaard. Negeren blijft van het huis.
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from custom_components.domotiapp_lovelace.const import DOMAIN
from custom_components.domotiapp_lovelace.meldingen import garage
from custom_components.domotiapp_lovelace.meldingen.const import STORAGE_KEY

from .conftest import ANNA, BRAM
from .test_garage import CONTACT, KAART, doe_open, knop, meldingen, om, telefoons, zet_op  # noqa: F401 - telefoons is een fixture

wie = lambda telefoons: sorted(d for d, _ in meldingen(telefoons))  # noqa: E731


# ------------------------------------------------------------ pure functies


def test_wat_iemand_koos_gaat_over_de_kaart_heen() -> None:
    kaart = garage.instelling_uit({"garage_minuten": 10, "garage_herhaal": 30, "garage_avond": "22:30"})
    # Niets gekozen: de kaart.
    assert garage.voor_persoon(kaart, {}).vergelijkbaar() == kaart.vergelijkbaar()
    eigen = garage.voor_persoon(kaart, {"garage_minuten": ["15"], "garage_herhaal": ["0"], "garage_avond": ["21:00"]})
    assert (eigen.minuten, eigen.herhaal, eigen.avond) == (15, 0, "21:00")
    assert garage.voor_persoon(kaart, {"garage_avond": ["uit"]}).avond is None
    # Wat niet deugt, laat de kaart staan; buiten de grenzen wordt de grens.
    raar = garage.voor_persoon(kaart, {"garage_minuten": ["x"], "garage_herhaal": [], "garage_avond": ["25:00"]})
    assert (raar.minuten, raar.herhaal, raar.avond) == (10, 30, "22:30")
    assert garage.voor_persoon(kaart, {"garage_minuten": ["0"]}).minuten == 1
    # De kaart zelf blijft wat hij was.
    assert (kaart.minuten, kaart.herhaal, kaart.avond) == (10, 30, "22:30")


def test_na_negeren_gaat_wie_nog_niets_kreeg_verder_met_zijn_eerste() -> None:
    inst = garage.instelling_uit({"garage_minuten": 60})
    negeer = {"open_sinds": om(27, 14, 0).isoformat(), "negeer_tot": om(27, 14, 30).isoformat()}
    assert garage.volgende(negeer, inst, om(27, 14, 30), True) is None
    assert garage.volgende(negeer, inst, om(27, 15, 0), True) == "eerste"
    # REGRESSIEWACHT: wie al een melding had, krijgt na het negeren meteen een nieuwe.
    assert garage.volgende({**negeer, "gemeld": om(27, 14, 5).isoformat()}, inst, om(27, 14, 30), True) == "na_negeer"


# ------------------------------------------------------------ de motor


async def test_ieder_zijn_eigen_minuten_en_herhaling(hass: HomeAssistant, freezer, telefoons) -> None:
    hass.states.async_set(CONTACT, "off")
    motor = await zet_op(hass, freezer, om(27, 13, 0))
    motor.opslag.zet_keuze("garage", BRAM, "garage_minuten", ["15"])
    motor.opslag.zet_keuze("garage", BRAM, "garage_herhaal", ["0"])
    await doe_open(hass, freezer, om(27, 14, 0))

    await motor._tik(om(27, 14, 5))
    assert meldingen(telefoons) == [("test_anna", "De garagedeur staat al 5 minuten open.")]
    telefoons.clear()
    await motor._tik(om(27, 14, 14))
    assert telefoons == []
    await motor._tik(om(27, 14, 15))
    assert meldingen(telefoons) == [("test_bram", "De garagedeur staat al 15 minuten open.")]
    telefoons.clear()
    # Anna elk uur (de kaart), Bram geen herinnering.
    await motor._tik(om(27, 15, 5))
    assert wie(telefoons) == ["test_anna"]
    telefoons.clear()
    await motor._tik(om(27, 16, 15))
    assert wie(telefoons) == ["test_anna"]
    # Wat ieder kreeg, staat in de opslag.
    per = motor.opslag.garage("garage")["per"]
    assert per[BRAM]["gemeld"] == om(27, 14, 15).isoformat()
    assert per[ANNA]["gemeld"] == om(27, 16, 15).isoformat()


async def test_ieder_zijn_eigen_avond(hass: HomeAssistant, freezer, telefoons) -> None:
    hass.states.async_set(CONTACT, "off")
    motor = await zet_op(hass, freezer, om(27, 19, 0), {**KAART, "garage_herhaal": 0})
    motor.opslag.zet_keuze("garage", BRAM, "garage_avond", ["21:30"])
    motor.opslag.zet_keuze("garage", ANNA, "garage_avond", ["uit"])
    await doe_open(hass, freezer, om(27, 20, 0))
    await motor._tik(om(27, 20, 5))
    assert wie(telefoons) == ["test_anna", "test_bram"]
    telefoons.clear()

    await motor._tik(om(27, 21, 30))
    assert meldingen(telefoons) == [("test_bram", "Het is 21:30 en de garagedeur staat nog open.")]
    telefoons.clear()
    # Om 22:00 (de kaart) niemand: Bram had zijn avond al, Anna wil er geen.
    await motor._tik(om(27, 22, 0))
    assert telefoons == []


async def test_negeren_blijft_van_het_hele_huis(hass: HomeAssistant, freezer, telefoons) -> None:
    hass.states.async_set(CONTACT, "off")
    motor = await zet_op(hass, freezer, om(27, 13, 0))
    motor.opslag.zet_keuze("garage", ANNA, "garage_minuten", ["60"])
    await doe_open(hass, freezer, om(27, 14, 0))
    await motor._tik(om(27, 14, 5))
    assert wie(telefoons) == ["test_bram"]
    freezer.move_to(om(27, 14, 6))
    await knop(hass, "DOMOTIAPP_GARAGE|garage|negeer|240", "gebruiker-bram")
    telefoons.clear()

    # Anna's uur is om terwijl er genegeerd wordt: niets.
    await motor._tik(om(27, 15, 0))
    assert telefoons == []
    # Na het negeren: Bram meteen, Anna (die nog niets kreeg) ook, want haar uur is al voorbij.
    await motor._tik(om(27, 18, 6))
    assert wie(telefoons) == ["test_anna", "test_bram"]
    assert "negeer_tot" not in motor.opslag.garage("garage")


async def test_na_negeren_wacht_wie_nog_niet_aan_de_beurt_was(hass: HomeAssistant, freezer, telefoons) -> None:
    hass.states.async_set(CONTACT, "off")
    motor = await zet_op(hass, freezer, om(27, 13, 0))
    motor.opslag.zet_keuze("garage", ANNA, "garage_minuten", ["60"])
    await doe_open(hass, freezer, om(27, 14, 0))
    await motor._tik(om(27, 14, 5))
    freezer.move_to(om(27, 14, 6))
    await knop(hass, "DOMOTIAPP_GARAGE|garage|negeer|15", "gebruiker-bram")
    telefoons.clear()

    await motor._tik(om(27, 14, 21))
    assert wie(telefoons) == ["test_bram"]
    # Negeren is voorbij, ook voor Anna: zij krijgt gewoon haar eerste na een uur.
    assert "negeer_tot" not in motor.opslag.garage("garage")
    telefoons.clear()
    await motor._tik(om(27, 14, 59))
    assert telefoons == []
    await motor._tik(om(27, 15, 0))
    assert meldingen(telefoons) == [("test_anna", "De garagedeur staat al 1 uur open.")]


async def test_een_opslag_van_voor_0_145_midden_in_een_open_deur(hass: HomeAssistant, freezer, telefoons, hass_storage) -> None:
    """Gemeld om 14:05 voor het hele huis, uitgave en herstart om 14:30: niemand krijgt meteen een eerste melding."""
    hass_storage[STORAGE_KEY] = {"version": 1, "data": {"garage": {"garage": {
        "open_sinds": om(27, 14, 0).isoformat(), "gemeld": om(27, 14, 5).isoformat(), "laatste_melding": "eerste",
    }}}}
    hass.states.async_set(CONTACT, "on")
    motor = await zet_op(hass, freezer, om(27, 14, 30))
    await motor._tik(om(27, 14, 30))
    assert telefoons == []
    assert motor.opslag.garage("garage")["per"] == {BRAM: {"gemeld": om(27, 14, 5).isoformat()}, ANNA: {"gemeld": om(27, 14, 5).isoformat()}}
    await motor._tik(om(27, 15, 5))
    assert wie(telefoons) == ["test_anna", "test_bram"]


async def test_keuzes_en_per_persoon_overleven_een_herstart(hass: HomeAssistant, freezer, telefoons, hass_storage) -> None:
    """Bram koos 15 minuten en geen herhaling, en kreeg om 14:15 zijn melding; herstart om 14:40."""
    hass_storage[STORAGE_KEY] = {"version": 1, "data": {
        "keuzes": {"garage": {BRAM: {"garage_minuten": ["15"], "garage_herhaal": ["0"]}}},
        "garage": {"garage": {
            "open_sinds": om(27, 14, 0).isoformat(), "gemeld": om(27, 14, 15).isoformat(),
            "per": {ANNA: {"gemeld": om(27, 14, 5).isoformat()}, BRAM: {"gemeld": om(27, 14, 15).isoformat()}},
        }},
    }}
    hass.states.async_set(CONTACT, "on")
    motor = await zet_op(hass, freezer, om(27, 14, 40))
    await motor._tik(om(27, 14, 40))
    assert telefoons == []
    await motor._tik(om(27, 15, 5))
    assert wie(telefoons) == ["test_anna"]


async def test_dicht_wist_ook_wat_ieder_kreeg(hass: HomeAssistant, freezer, telefoons) -> None:
    hass.states.async_set(CONTACT, "off")
    motor = await zet_op(hass, freezer, om(27, 13, 0))
    await doe_open(hass, freezer, om(27, 14, 0))
    await motor._tik(om(27, 14, 5))
    assert "per" in motor.opslag.garage("garage")
    hass.states.async_set(CONTACT, "off")
    await hass.async_block_till_done()
    assert "per" not in motor.opslag.garage("garage")


async def test_de_proef_volgt_wat_die_persoon_koos(hass: HomeAssistant, freezer, telefoons) -> None:
    hass.states.async_set(CONTACT, "on")
    motor = await zet_op(hass, freezer, om(27, 14, 0))
    motor.opslag.zet_keuze("garage", ANNA, "garage_minuten", ["30"])
    await motor.async_verstuur("garage", "morgen", proef=True, alleen=ANNA)
    assert meldingen(telefoons) == [("test_anna", "De garagedeur staat al 30 minuten open.")]


async def test_kiezen_over_de_websocket_en_de_standaard_in_de_stand(hass: HomeAssistant, freezer, telefoons, hass_ws_client) -> None:
    """Op de echte tijd van nu: het token van de proefklant verloopt na een half uur."""
    await hass.config.async_set_time_zone("Europe/Amsterdam")
    hass.states.async_set(CONTACT, "off")
    motor = await zet_op(hass, freezer, dt_util.now().replace(microsecond=0), {**KAART, "garage_minuten": 10, "garage_avond_aan": False})
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": f"{DOMAIN}/meldingen/subscribe", "melding": "garage"})
    assert (await client.receive_json())["success"]
    stand: dict[str, Any] = (await client.receive_json())["event"]
    assert (stand["garage"]["minuten"], stand["garage"]["herhaal"], stand["garage"]["avond"]) == (10, 60, None)

    await client.send_json({
        "id": 2, "type": f"{DOMAIN}/meldingen/keuze", "melding": "garage", "persoon": ANNA,
        "soort": "garage_avond", "waarden": ["21:00"],
    })
    berichten = [await client.receive_json() for _ in range(2)]
    uitslag = next(b for b in berichten if b.get("id") == 2 and b["type"] == "result")
    assert uitslag["result"] == {"keuze": {"garage_avond": ["21:00"]}}
    assert next(b for b in berichten if b["type"] == "event")["event"]["keuzes"][ANNA] == {"garage_avond": ["21:00"]}
    assert motor._garage_inst(motor._garage(), ANNA).avond == "21:00"
    assert motor._garage_inst(motor._garage(), BRAM).avond is None
