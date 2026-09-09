"""Gedeelde opzet voor de infoschermtests."""

from __future__ import annotations

from typing import Any

import pytest

from homeassistant.core import HomeAssistant

from custom_components.domotiapp_lovelace.const import DOMAIN
from custom_components.domotiapp_lovelace.infoscherm.const import DATA_FEEDS, DATA_STORE

from ..conftest import zet_integratie_op

PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64
JPG = b"\xff\xd8\xff\xe0" + b"\x00" * 64
SVG = b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'


@pytest.fixture
def bestandsmap(hass: HomeAssistant, tmp_path):
    """Schrijf de bestanden naar een tijdelijke map en niet in de repo."""
    hass.config.config_dir = str(tmp_path)
    return tmp_path


@pytest.fixture
async def infoscherm_op(hass: HomeAssistant, bestandsmap, aioclient_mock):
    """De integratie opgezet. De feedlezer vindt geen bronnen en haalt niets."""
    await zet_integratie_op(hass)
    await hass.async_block_till_done()
    return hass.data[DOMAIN]


@pytest.fixture
def store(hass: HomeAssistant):
    return lambda: hass.data[DOMAIN][DATA_STORE]


@pytest.fixture
def lezer(hass: HomeAssistant):
    return lambda: hass.data[DOMAIN][DATA_FEEDS]


async def stuur(client, type_: str, **velden: Any) -> dict[str, Any]:
    await client.send_json_auto_id({"type": f"domotiapp_lovelace/infoscherm/{type_}", **velden})
    return await client.receive_json()
