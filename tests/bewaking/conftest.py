"""Gedeelde opzet voor de bewakingstests."""

from __future__ import annotations

from collections.abc import Callable
from unittest.mock import AsyncMock, patch

import pytest

from homeassistant.core import HomeAssistant

from custom_components.domotiapp_lovelace.bewaking.const import (
    DATA_INDEX,
    DATA_MOTOR,
    DATA_REGELS,
)
from custom_components.domotiapp_lovelace.const import DOMAIN

from ..conftest import zet_integratie_op

CAMERA = "camera.oprit"
MELDER_PERSOON = "binary_sensor.oprit_persoon"
MELDER_VOERTUIG = "binary_sensor.oprit_voertuig"


@pytest.fixture
def beeldmap(hass: HomeAssistant, tmp_path):
    """Schrijf de beelden naar een tijdelijke map en niet in de repo."""
    hass.config.config_dir = str(tmp_path)
    return tmp_path


@pytest.fixture
def camera_beeld():
    """Vervang het ophalen bij de camera door vaste bytes.

    De testinstance heeft geen camera, en dit is ook precies de grens die we
    willen testen: alles ná het beeld. Dát `async_get_image` werkt, is de
    verantwoordelijkheid van Home Assistant zelf.
    """
    plaatje = AsyncMock()
    plaatje.content = b"\xff\xd8\xff\xe0 nep-jpeg"
    with patch(
        "custom_components.domotiapp_lovelace.bewaking.motor."
        "camera_component.async_get_image",
        return_value=plaatje,
    ) as mock:
        yield mock


@pytest.fixture
def stuur_melding():
    """Onderschep het versturen, zodat er geen notify-dienst nodig is.

    Bewust NIET in `bewaking_op`: `motor.meldingen` en `meldingen` zijn hetzelfde
    module-object, dus deze patch raakt ook een test die `meldingen.async_stuur`
    rechtstreeks aanroept. Een test die het echte versturen wil toetsen, vraagt
    deze fixture dus niet aan.
    """
    with patch(
        "custom_components.domotiapp_lovelace.bewaking.motor.meldingen.async_stuur",
        new_callable=AsyncMock,
        return_value=["notify.mobile_app_test"],
    ) as mock:
        yield mock


@pytest.fixture
async def bewaking_op(hass: HomeAssistant, beeldmap, camera_beeld):
    """De integratie opgezet, met de camera en twee melders in de state machine."""
    hass.states.async_set(CAMERA, "idle", {"friendly_name": "Oprit"})
    hass.states.async_set(MELDER_PERSOON, "off", {"friendly_name": "Persoon"})
    hass.states.async_set(MELDER_VOERTUIG, "off", {"friendly_name": "Voertuig"})
    await zet_integratie_op(hass)
    return hass.data[DOMAIN]


@pytest.fixture
def regels(hass: HomeAssistant):
    return lambda: hass.data[DOMAIN][DATA_REGELS]


@pytest.fixture
def index(hass: HomeAssistant):
    return lambda: hass.data[DOMAIN][DATA_INDEX]


@pytest.fixture
def motor(hass: HomeAssistant):
    return lambda: hass.data[DOMAIN][DATA_MOTOR]


@pytest.fixture
def zet_regel(hass: HomeAssistant) -> Callable:
    """Sla een regel op en zet de motor erop, zoals het commando dat doet."""

    async def _zet(**velden):
        from custom_components.domotiapp_lovelace.bewaking.store import valideer_regel

        rauw = {
            "camera": CAMERA,
            "aan": True,
            "melders": [MELDER_PERSOON, MELDER_VOERTUIG],
            **velden,
        }
        regel = valideer_regel(rauw)
        await hass.data[DOMAIN][DATA_REGELS].async_zet(regel)
        hass.data[DOMAIN][DATA_MOTOR].async_herzie()
        return regel

    return _zet


async def _zet(hass: HomeAssistant, melder: str, stand: str) -> None:
    """Zet de stand om MET behoud van de attributen.

    `async_set` vervangt de attributen als je ze weglaat, en dan is de
    `friendly_name` na één omslag weg. Home Assistant houdt ze in het echt
    gewoon vast; een test die dat niet nabootst toetst iets anders dan wat er
    draait.
    """
    huidig = hass.states.get(melder)
    hass.states.async_set(melder, stand, dict(huidig.attributes) if huidig else {})
    await hass.async_block_till_done()


async def detecteer(hass: HomeAssistant, melder: str) -> None:
    """Laat een melder van uit naar aan gaan, en wacht tot alles klaar is."""
    await _zet(hass, melder, "on")


async def herstel(hass: HomeAssistant, melder: str) -> None:
    await _zet(hass, melder, "off")
