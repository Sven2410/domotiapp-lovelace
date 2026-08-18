"""Pytest-opzet voor de custom integration."""

from __future__ import annotations

from typing import Any

import pytest

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.domotiapp_lovelace.const import DOMAIN, STORAGE_KEY
from custom_components.domotiapp_lovelace.store import ATTR_MEMBER_ENTITY_IDS

pytest_plugins = "pytest_homeassistant_custom_component"

# De light group waar de meeste tests op draaien.
GROEP_ENTITY_ID = "light.lampen_slaapkamer"
GROEP_UNIQUE_ID = "groep-slaapkamer"
LEDEN = ["light.plafond_slaapkamer", "light.bedlamp_links", "light.leeslamp"]


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Laat Home Assistant custom_components/ zien in elke test."""
    return


@pytest.fixture
def lees_opslag(hass_storage: dict[str, Any]):
    """Lees terug wat er weggeschreven is.

    `hass_storage` is de standaard-testvervanger voor `.storage/`: hij
    onderschept `Store`-schrijfacties en bewaart het resultaat ná een echte
    JSON-serialisatieronde (`mock_storage` in
    `pytest_homeassistant_custom_component/common.py`). Wat hier uitkomt is dus
    letterlijk wat er in het bestand had gestaan — inclusief het effect van het
    heen-en-weer gaan door JSON.

    Bewust niet via de Store-laag: verschillende tests moeten kunnen aantonen
    wat er feitelijk is opgeslagen, niet wat de laag ervan maakt.
    """

    def _lees() -> dict[str, Any] | None:
        return hass_storage.get(STORAGE_KEY)

    return _lees


@pytest.fixture
def schrijf_opslag(hass_storage: dict[str, Any]):
    """Zet opslag klaar vóór de integratie geladen wordt."""

    def _schrijf(groups: dict[str, Any], version: int = 1, minor_version: int = 1):
        hass_storage[STORAGE_KEY] = {
            "version": version,
            "minor_version": minor_version,
            "key": STORAGE_KEY,
            "data": {"groups": groups},
        }

    return _schrijf


def registreer_lichtgroep(
    hass: HomeAssistant,
    entity_id: str = GROEP_ENTITY_ID,
    unique_id: str = GROEP_UNIQUE_ID,
    leden: list[str] | None = None,
) -> str:
    """Maak een light group in het entity registry én in de state machine.

    Geeft het registry-entry-ID terug — de opslagsleutel uit SPEC 10.2.
    """
    registry = er.async_get(hass)
    entry = registry.async_get_or_create(
        "light",
        "group",
        unique_id,
        suggested_object_id=entity_id.split(".", 1)[1],
    )
    hass.states.async_set(
        entry.entity_id,
        "on",
        {ATTR_MEMBER_ENTITY_IDS: LEDEN if leden is None else leden},
    )
    return entry.id


async def zet_integratie_op(hass: HomeAssistant) -> MockConfigEntry:
    """Zet de integratie op, met frontend erachter.

    Als functie en niet alleen als fixture, omdat sommige tests eerst een
    Store-bestand op schijf moeten zetten — de opslaglaag leest dat één keer
    bij setup.
    """
    assert await async_setup_component(hass, "frontend", {})
    await hass.async_block_till_done()

    entry = MockConfigEntry(domain=DOMAIN, title="DomotiApp Lovelace", data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


@pytest.fixture
async def opgezet(hass: HomeAssistant) -> MockConfigEntry:
    """De integratie volledig opgezet, met frontend erachter."""
    return await zet_integratie_op(hass)


@pytest.fixture
def geldige_scenes() -> list[dict[str, Any]]:
    """Drie geldige scenes, met alle vormen uit SPEC 10.5 erin.

    Scene 1 heeft een aan/uit-lamp zonder brightness en een lamp met
    kleurtemperatuur; scene 2 zet alles uit; scene 3 is leeg. `light.leeslamp`
    komt nergens voor en is dus niet ingesteld.
    """
    return [
        {
            "icon": "mdi:weather-sunset",
            "lights": {
                "light.plafond_slaapkamer": {"state": "on"},
                "light.bedlamp_links": {
                    "state": "on",
                    "brightness": 102,
                    "color_temp_kelvin": 2700,
                },
            },
        },
        {
            "icon": "mdi:weather-night",
            "lights": {
                "light.plafond_slaapkamer": {"state": "off"},
                "light.bedlamp_links": {"state": "off"},
            },
        },
        {"icon": "mdi:numeric-3-circle-outline", "lights": {}},
    ]
