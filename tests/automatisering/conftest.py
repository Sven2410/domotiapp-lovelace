"""Gedeelde opzet voor de automatiseringstests."""

from __future__ import annotations

from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

import pytest

from homeassistant.components.lovelace.const import LOVELACE_DATA
from homeassistant.core import HomeAssistant, ServiceCall

from custom_components.domotiapp_lovelace.automatisering.const import DATA_MOTOR, KAART_TYPE, INHAAL_NA_SEC
from custom_components.domotiapp_lovelace.const import DOMAIN
from pytest_homeassistant_custom_component.common import async_fire_time_changed

from ..conftest import zet_integratie_op

AMS = ZoneInfo("Europe/Amsterdam")
WOONKAMER = "light.woonkamer"
KEUKEN = "light.keuken"
GEHEIM = "light.niet_op_de_kaart"
KAART: dict[str, Any] = {
    "type": KAART_TYPE,
    "lampen": [{"entity": WOONKAMER, "name": "Woonkamer"}, KEUKEN],
}


def om(dag: int, uur: int, minuut: int = 0, seconde: int = 0) -> datetime:
    """Een tijdstip in november 2026 (de 2e is een maandag), Nederlandse tijd."""
    return datetime(2026, 11, dag, uur, minuut, seconde, tzinfo=AMS)


def regel(**extra: Any) -> dict[str, Any]:
    return {
        "lampen": [WOONKAMER],
        "helderheid": 60,
        "aan": {"soort": "tijd", "tijd": "18:00"},
        "uit": {"soort": "tijd", "tijd": "23:00"},
        "dagen": [0, 1, 2, 3, 4, 5, 6],
        **extra,
    }


async def zet_dashboard(hass: HomeAssistant, kaarten: list[dict[str, Any]]) -> None:
    await hass.data[LOVELACE_DATA].dashboards[None].async_save(
        {"views": [{"type": "sections", "sections": [{"type": "grid", "cards": kaarten}]}]}
    )
    await hass.async_block_till_done()


async def tik(hass: HomeAssistant, freezer, op: datetime) -> None:
    """De klok naar dit moment, en de motor kijkt."""
    freezer.move_to(op)
    async_fire_time_changed(hass, op)
    await hass.async_block_till_done()


async def laat_starten(hass: HomeAssistant, freezer, op: datetime) -> None:
    """Tot voorbij het wachten na het opstarten."""
    from datetime import timedelta  # noqa: PLC0415

    await tik(hass, freezer, op + timedelta(seconds=INHAAL_NA_SEC + 1))


@pytest.fixture
def lampen(hass: HomeAssistant) -> list[tuple[str, dict[str, Any]]]:
    """Nep-diensten voor light. Geeft de lijst met (dienst, data) terug."""
    aanroepen: list[tuple[str, dict[str, Any]]] = []

    async def ontvang(call: ServiceCall) -> None:
        aanroepen.append((call.service, dict(call.data)))

    hass.services.async_register("light", "turn_on", ontvang)
    hass.services.async_register("light", "turn_off", ontvang)
    return aanroepen


@pytest.fixture
async def opgezet(hass: HomeAssistant, lampen, freezer):
    """De integratie in Nederlandse tijd, met de kaart op een dashboard. De klok loopt."""
    await hass.config.async_set_time_zone("Europe/Amsterdam")
    hass.config.latitude = 52.37
    hass.config.longitude = 4.89
    freezer.move_to(om(2, 12))
    await zet_integratie_op(hass)
    await zet_dashboard(hass, [KAART])
    motor = hass.data[DOMAIN][DATA_MOTOR]
    await motor.async_herlees()
    await laat_starten(hass, freezer, om(2, 12))
    return motor
