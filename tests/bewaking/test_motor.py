"""De motor: detectie -> rustperiode -> beeld -> timeline -> melding.

Alles hier is **NIEUW GEDRAG**: vóór deze ronde bestond de bewaking niet.
"""

from __future__ import annotations

from datetime import timedelta
from unittest.mock import AsyncMock, call, patch

from freezegun.api import FrozenDateTimeFactory
import pytest

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from .conftest import (
    CAMERA,
    MELDER_PERSOON,
    MELDER_VOERTUIG,
    detecteer,
    herstel,
)


async def test_een_detectie_levert_een_beeld_in_de_timeline(
    hass: HomeAssistant, bewaking_op, zet_regel, index, camera_beeld, beeldmap
) -> None:
    await zet_regel()

    await detecteer(hass, MELDER_PERSOON)

    beelden = index().alle()
    assert len(beelden) == 1
    assert beelden[0]["camera"] == CAMERA
    assert beelden[0]["melder"] == MELDER_PERSOON
    assert beelden[0]["naam"] == "Persoon"
    camera_beeld.assert_awaited_once()

    # En het bestand ligt er ook werkelijk.
    op_schijf = list((beeldmap / "domotiapp_lovelace" / "beelden").glob("*.jpg"))
    assert [p.stem for p in op_schijf] == [beelden[0]["id"]]


async def test_zelfde_melder_binnen_de_rustperiode_levert_niets(
    hass: HomeAssistant, bewaking_op, zet_regel, index
) -> None:
    """Dit is de tien-meldingen-klacht: dezelfde melder die blijft omslaan."""
    await zet_regel(rustperiode=60)

    await detecteer(hass, MELDER_PERSOON)
    await herstel(hass, MELDER_PERSOON)
    await detecteer(hass, MELDER_PERSOON)
    await herstel(hass, MELDER_PERSOON)
    await detecteer(hass, MELDER_PERSOON)

    assert len(index().alle()) == 1


async def test_een_andere_melder_op_dezelfde_camera_telt_apart(
    hass: HomeAssistant, bewaking_op, zet_regel, index
) -> None:
    """De correctie van 27 augustus 2026.

    *"Echt een rustperiode per detectie dus mens apart dier apart etc."*

    De auto die de oprit op rijdt en de bestuurder die uitstapt zijn twee
    gebeurtenissen, ook al kijkt dezelfde camera ernaar. Met één klok per
    camera zou het tweede beeld -- dat met de persoon erop -- wegvallen.
    """
    await zet_regel(rustperiode=60)

    await detecteer(hass, MELDER_VOERTUIG)
    await detecteer(hass, MELDER_PERSOON)

    beelden = index().alle()
    assert [b["melder"] for b in beelden] == [MELDER_VOERTUIG, MELDER_PERSOON]


async def test_na_de_rustperiode_mag_het_weer(
    hass: HomeAssistant, bewaking_op, zet_regel, index, freezer: FrozenDateTimeFactory
) -> None:
    await zet_regel(rustperiode=60)

    await detecteer(hass, MELDER_PERSOON)
    await herstel(hass, MELDER_PERSOON)

    freezer.tick(timedelta(seconds=61))
    await detecteer(hass, MELDER_PERSOON)

    assert len(index().alle()) == 2


async def test_rustperiode_nul_laat_alles_door(
    hass: HomeAssistant, bewaking_op, zet_regel, index
) -> None:
    await zet_regel(rustperiode=0)

    await detecteer(hass, MELDER_PERSOON)
    await herstel(hass, MELDER_PERSOON)
    await detecteer(hass, MELDER_PERSOON)

    assert len(index().alle()) == 2


async def test_een_uitgezette_regel_doet_niets(
    hass: HomeAssistant, bewaking_op, zet_regel, index, camera_beeld
) -> None:
    """Staat het vinkje uit, dan wordt er niet eens geluisterd."""
    await zet_regel(aan=False)

    await detecteer(hass, MELDER_PERSOON)

    assert index().alle() == []
    camera_beeld.assert_not_awaited()


async def test_een_melder_die_bij_het_opstarten_aan_staat_is_geen_detectie(
    hass: HomeAssistant, bewaking_op, zet_regel, index
) -> None:
    """`old_state is None` is Home Assistant die zijn toestand terugzet.

    Zonder deze grens regent het beelden na elke herstart.
    """
    await zet_regel()

    hass.states.async_remove(MELDER_PERSOON)
    await hass.async_block_till_done()
    hass.states.async_set(MELDER_PERSOON, "on", {"friendly_name": "Persoon"})
    await hass.async_block_till_done()

    assert index().alle() == []


async def test_een_attribuutwijziging_terwijl_hij_aan_staat_is_geen_detectie(
    hass: HomeAssistant, bewaking_op, zet_regel, index
) -> None:
    await zet_regel()

    await detecteer(hass, MELDER_PERSOON)
    hass.states.async_set(MELDER_PERSOON, "on", {"friendly_name": "Persoon", "extra": 1})
    await hass.async_block_till_done()

    assert len(index().alle()) == 1


async def test_een_camera_die_geen_beeld_geeft_kost_wel_een_rustperiode(
    hass: HomeAssistant, bewaking_op, zet_regel, index, camera_beeld
) -> None:
    """Een kapotte camera wordt niet elke seconde opnieuw geprobeerd."""
    camera_beeld.side_effect = HomeAssistantErrorAchtig("camera doet niets")
    await zet_regel(rustperiode=60)

    await detecteer(hass, MELDER_PERSOON)
    await herstel(hass, MELDER_PERSOON)
    await detecteer(hass, MELDER_PERSOON)

    assert index().alle() == []
    assert camera_beeld.await_count == 1


class HomeAssistantErrorAchtig(Exception):
    """Wat een camera-integratie zoal gooit."""


async def test_de_wachttijd_stelt_het_beeld_uit(
    hass: HomeAssistant, bewaking_op, zet_regel, index, camera_beeld
) -> None:
    """Standaard nul, maar wie hem zet krijgt een later beeld.

    Het wachten zelf wordt onderschept in plaats van uitgezeten: een test die
    twee seconden stilstaat toetst `asyncio.sleep` en niet onze code.
    """
    with patch(
        "custom_components.domotiapp_lovelace.bewaking.motor.asyncio.sleep",
        new_callable=AsyncMock,
    ) as wachten:
        await zet_regel(wachttijd=2)
        await detecteer(hass, MELDER_PERSOON)

    # Niet `assert_awaited_once_with`: `asyncio.sleep` is een gedeeld object en
    # Home Assistant gebruikt hem zelf ook -- er staat altijd minstens een
    # `sleep(0)` in de lijst. Waar het om gaat is dat ONZE wachttijd erin zit.
    #
    # De tegenhanger (standaard nul betekent niet wachten) staat hier niet als
    # eigen test: elke andere test in dit bestand draait op de standaard en
    # krijgt zijn beeld binnen dezelfde `async_block_till_done`. Een test die
    # `sleep(0)` uitsluit zou op HA's eigen aanroep stuklopen en niets over onze
    # code zeggen.
    assert call(2) in wachten.await_args_list
    # En daarna komt het beeld er gewoon.
    assert len(index().alle()) == 1


async def test_de_rustperiode_overleeft_een_herstart(
    hass: HomeAssistant, bewaking_op, zet_regel, index, motor
) -> None:
    """De klok begint niet op nul na een herstart.

    Nagebootst door het geheugen van de motor leeg te maken; de index blijft,
    net als na een echte herstart.
    """
    await zet_regel(rustperiode=3600)
    await detecteer(hass, MELDER_PERSOON)
    await herstel(hass, MELDER_PERSOON)
    assert len(index().alle()) == 1

    motor()._laatste.clear()

    await detecteer(hass, MELDER_PERSOON)

    assert len(index().alle()) == 1


async def test_de_melding_gaat_naar_de_gekozen_personen(
    hass: HomeAssistant, bewaking_op, zet_regel, stuur_melding
) -> None:
    hass.states.async_set("person.sven", "not_home", {"friendly_name": "Sven"})
    await zet_regel(ontvangers=["person.sven"])

    await detecteer(hass, MELDER_PERSOON)

    stuur_melding.assert_awaited_once()
    argumenten = stuur_melding.await_args.kwargs
    assert argumenten["ontvangers"] == ["person.sven"]
    assert argumenten["titel"] == "Oprit"
    assert argumenten["tekst"] == "Persoon"
    assert argumenten["camera"] == CAMERA


async def test_zonder_ontvangers_wordt_er_niets_gestuurd(
    hass: HomeAssistant, bewaking_op, zet_regel, stuur_melding, index
) -> None:
    """Wel een beeld in de timeline, geen melding."""
    await zet_regel(ontvangers=[])

    await detecteer(hass, MELDER_PERSOON)

    assert len(index().alle()) == 1
    stuur_melding.assert_not_awaited()


async def test_alleen_afwezig_houdt_de_melding_tegen_maar_niet_het_beeld(
    hass: HomeAssistant, bewaking_op, zet_regel, stuur_melding, index
) -> None:
    """De timeline blijft compleet; alleen de telefoon blijft stil."""
    hass.states.async_set("person.sven", "home", {"friendly_name": "Sven"})
    await zet_regel(ontvangers=["person.sven"], alleen_afwezig=True)

    await detecteer(hass, MELDER_PERSOON)

    assert len(index().alle()) == 1
    stuur_melding.assert_not_awaited()


async def test_alleen_afwezig_meldt_wel_als_er_niemand_thuis_is(
    hass: HomeAssistant, bewaking_op, zet_regel, stuur_melding
) -> None:
    hass.states.async_set("person.sven", "not_home", {"friendly_name": "Sven"})
    await zet_regel(ontvangers=["person.sven"], alleen_afwezig=True)

    await detecteer(hass, MELDER_PERSOON)

    stuur_melding.assert_awaited_once()


async def test_een_melder_bij_twee_cameras_levert_van_allebei_een_beeld(
    hass: HomeAssistant, bewaking_op, index
) -> None:
    """Een melder die nergens aan te koppelen is, hoort bij ALLE camera's.

    Dat is wat `camera-logica.js` doet, en dan hoort er ook van elke camera een
    beeld te komen: je weet niet welke hem gezien heeft, en dat is precies de
    reden dat hij bij allemaal hoort.

    Eerder werd de eerste de beste regel gepakt -- willekeurig, want dat hing
    aan de volgorde in de opslag.
    """
    from custom_components.domotiapp_lovelace.bewaking.const import (
        DATA_MOTOR,
        DATA_REGELS,
    )
    from custom_components.domotiapp_lovelace.bewaking.store import valideer_regel
    from custom_components.domotiapp_lovelace.const import DOMAIN

    for camera in ("camera.oprit", "camera.achterdeur"):
        await hass.data[DOMAIN][DATA_REGELS].async_zet(
            valideer_regel(
                {"camera": camera, "aan": True, "melders": [MELDER_PERSOON]}
            )
        )
    hass.data[DOMAIN][DATA_MOTOR].async_herzie()

    await detecteer(hass, MELDER_PERSOON)

    beelden = index().alle()
    assert sorted(b["camera"] for b in beelden) == [
        "camera.achterdeur",
        "camera.oprit",
    ]


async def test_een_melder_bij_twee_cameras_heeft_toch_een_klok(
    hass: HomeAssistant, bewaking_op, index
) -> None:
    """Eén gebeurtenis, door twee lenzen gezien -- dus één rustperiode."""
    from custom_components.domotiapp_lovelace.bewaking.const import (
        DATA_MOTOR,
        DATA_REGELS,
    )
    from custom_components.domotiapp_lovelace.bewaking.store import valideer_regel
    from custom_components.domotiapp_lovelace.const import DOMAIN

    for camera in ("camera.oprit", "camera.achterdeur"):
        await hass.data[DOMAIN][DATA_REGELS].async_zet(
            valideer_regel(
                {
                    "camera": camera,
                    "aan": True,
                    "melders": [MELDER_PERSOON],
                    "rustperiode": 60,
                }
            )
        )
    hass.data[DOMAIN][DATA_MOTOR].async_herzie()

    await detecteer(hass, MELDER_PERSOON)
    await herstel(hass, MELDER_PERSOON)
    await detecteer(hass, MELDER_PERSOON)

    assert len(index().alle()) == 2  # één ronde van twee camera's, niet twee


async def test_de_oudste_gaat_eruit_voordat_de_nieuwe_erin_gaat(
    hass: HomeAssistant, bewaking_op, zet_regel, index, beeldmap, monkeypatch
) -> None:
    """"En overschrijft hem", met een verlaagde grens zodat het te zien is."""
    monkeypatch.setattr(
        "custom_components.domotiapp_lovelace.bewaking.motor.MAX_PER_CAMERA", 2
    )
    await zet_regel(rustperiode=0)

    for _ in range(3):
        await detecteer(hass, MELDER_PERSOON)
        await herstel(hass, MELDER_PERSOON)

    beelden = index().alle()
    assert len(beelden) == 2

    # En het weggegooide bestand ligt er ook niet meer.
    op_schijf = {
        p.stem for p in (beeldmap / "domotiapp_lovelace" / "beelden").glob("*.jpg")
    }
    assert op_schijf == {b["id"] for b in beelden}
