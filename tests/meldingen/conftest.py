"""Gedeelde opzet voor de meldingentests."""

from __future__ import annotations

from typing import Any

import pytest

from homeassistant.components.lovelace.const import LOVELACE_DATA
from homeassistant.core import HomeAssistant, ServiceCall

from custom_components.domotiapp_lovelace.const import DOMAIN
from custom_components.domotiapp_lovelace.meldingen.const import DATA_MOTOR, KAART_TYPE

from ..conftest import zet_integratie_op

SVEN = "person.sven"
LIEKE = "person.lieke"

KAART: dict[str, Any] = {
    "type": KAART_TYPE,
    "soort": "afval",
    "name": "Afvalmeldingen",
    "afval_vandaag": "sensor.afval_vandaag",
    "afval_morgen": "sensor.afval_morgen",
    "tijd_vandaag": "07:30:00",
    "tijd_morgen": "19:30:00",
    "personen": [SVEN, LIEKE],
    # De testharnas heeft geen companion-app; de telefoon komt uit de YAML.
    "diensten": {SVEN: "notify.test_sven", LIEKE: "test_lieke"},
}


async def zet_dashboard(hass: HomeAssistant, kaarten: list[dict[str, Any]]) -> None:
    """Sla het standaarddashboard op met deze kaarten erin, in een sectie."""
    await hass.data[LOVELACE_DATA].dashboards[None].async_save(
        {"views": [{"type": "sections", "sections": [{"type": "grid", "cards": kaarten}]}]}
    )
    await hass.async_block_till_done()


@pytest.fixture
def telefoons(hass: HomeAssistant) -> list[tuple[str, dict[str, Any]]]:
    """Twee nep-telefoons. Geeft de lijst met (dienst, data) terug."""
    aanroepen: list[tuple[str, dict[str, Any]]] = []

    async def ontvang(call: ServiceCall) -> None:
        aanroepen.append((call.service, dict(call.data)))

    for naam in ("test_sven", "test_lieke"):
        hass.services.async_register("notify", naam, ontvang)
    return aanroepen


@pytest.fixture
async def motor(hass: HomeAssistant):
    """De integratie opgezet in Nederlandse tijd, met de kaart op een dashboard."""
    await hass.config.async_set_time_zone("Europe/Amsterdam")
    hass.states.async_set(SVEN, "home", {"friendly_name": "Sven", "user_id": "gebruiker-sven"})
    hass.states.async_set(LIEKE, "home", {"friendly_name": "Lieke", "user_id": "gebruiker-lieke"})
    await zet_integratie_op(hass)
    await zet_dashboard(hass, [KAART])
    return hass.data[DOMAIN][DATA_MOTOR]
