"""De vakantiemodus als schakelaar.

De eigenaar op 31 oktober 2026: hij heeft bij klanten standaard een vakantiestand,
en wil dat de integratie die zelf aanmaakt. Een schakelaar en geen `input_boolean`:
dat is een helper, en die hoort niet bij een integratie.

De stand staat in de opslag van de automatiseringen en de motor beslist; dit is
het gezicht ervan, voor wie hem in een eigen automatisering wil gebruiken. Zie de
kop van `automatisering/motor.py`.
"""

from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .automatisering.const import DATA_MOTOR, VAKANTIE_ENTITY_ID, VAKANTIE_UNIQUE_ID
from .automatisering.motor import Motor
from .const import DOMAIN
from .taal import t


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    async_add_entities([VakantieSchakelaar(hass, hass.data[DOMAIN][DATA_MOTOR])])


class VakantieSchakelaar(SwitchEntity):
    """Staat de vakantiemodus aan?"""

    _attr_should_poll = False
    _attr_has_entity_name = False
    _attr_icon = "mdi:beach"
    _attr_unique_id = VAKANTIE_UNIQUE_ID

    def __init__(self, hass: HomeAssistant, motor: Motor) -> None:
        self._motor = motor
        self._attr_name = t(hass, "Vakantiemodus")
        # Alleen een wens: wie hem hernoemt, houdt die naam.
        self.entity_id = VAKANTIE_ENTITY_ID

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(self._motor.volg(self.async_write_ha_state))

    @property
    def is_on(self) -> bool:
        return self._motor.vakantie

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self._motor.async_zet_vakantie(True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self._motor.async_zet_vakantie(False)
