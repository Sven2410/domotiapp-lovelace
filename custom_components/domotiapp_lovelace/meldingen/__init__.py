"""Meldingen: herinneringen naar de telefoon, met per persoon een schakelaar.

Voorlopig één soort, **afval**: de avond ervoor en de ochtend zelf een melding
over wat er opgehaald wordt, naar iedereen die op de kaart aan staat. Het
vervangt de automatisering "Afval Notificaties" die de eigenaar zelf draaide.

| bestand | wat |
|---|---|
| `const.py` | de getallen, en waarom dit in de integratie zit |
| `afval.py` | wat er in de melding staat (pure functies, met tests) |
| `kaarten.py` | de kaarten uit de opgeslagen dashboards halen |
| `store.py` | wie er aan staat, en wat er al gebeurd is |
| `motor.py` | de klok, het versturen, en de knop "Staat buiten" |
| `websocket.py` | de commando's en het abonnement voor de kaart |
"""

from __future__ import annotations

from functools import partial
import logging

from homeassistant.core import HomeAssistant, callback

from ..const import DOMAIN
from . import websocket as meldingen_ws
from .const import DATA_ABONNEES, DATA_MOTOR, DATA_OPSLAG
from .motor import Motor
from .store import MeldingOpslag

_LOGGER = logging.getLogger(__name__)


async def async_zet_op(hass: HomeAssistant) -> None:
    """Opslag, commando's en motor. Eén keer, bij de eerste config entry.

    De commando's direct na de opslag, om dezelfde reden als overal in dit
    pakket: een kaart die net na een herstart verbindt, hoort geen
    `Unknown command.` te krijgen (valkuil 28).
    """
    data = hass.data.setdefault(DOMAIN, {})
    if DATA_OPSLAG not in data:
        opslag = MeldingOpslag(hass)
        await opslag.async_load()
        data[DATA_OPSLAG] = opslag

    meldingen_ws.async_register(hass)

    if DATA_MOTOR not in data:
        motor = Motor(hass, data[DATA_OPSLAG], partial(meldingen_ws.async_meld_aan_abonnees, hass))
        data[DATA_MOTOR] = motor
        await motor.async_start()
        _LOGGER.debug("Meldingen gestart met %d melding(en)", len(motor.meldingen))


@callback
def async_stop(hass: HomeAssistant) -> None:
    """Laat de klok los bij de laatste config entry."""
    data = hass.data.get(DOMAIN, {})
    if (motor := data.pop(DATA_MOTOR, None)) is not None:
        motor.async_stop()
    data.pop(DATA_OPSLAG, None)
    data.pop(DATA_ABONNEES, None)
