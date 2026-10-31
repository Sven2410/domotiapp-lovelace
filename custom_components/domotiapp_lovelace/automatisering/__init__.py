"""De automatiseringskaart: de klant maakt zelf eenvoudige automatiseringen.

Eerst verlichting, later rolluiken. Zie de kop van `const.py` voor waarom dit
geen echte automatiseringen van Home Assistant zijn.

| bestand | wat |
|---|---|
| `const.py` | de getallen, en waarom dit in de integratie zit |
| `regels.py` | wanneer een regel iets doet (pure functies, met tests) |
| `store.py` | de regels en de stand; alles overleeft een herstart |
| `motor.py` | de klok, het inhalen en de vakantiemodus |
| `websocket.py` | de commando's en het abonnement voor de kaart |
"""

from __future__ import annotations

from functools import partial

from homeassistant.core import HomeAssistant, callback

from ..const import DOMAIN
from . import websocket as automatisering_ws
from .const import DATA_ABONNEES, DATA_MOTOR, DATA_OPSLAG
from .motor import Motor
from .store import AutomatiseringOpslag


async def async_zet_op(hass: HomeAssistant) -> None:
    """Opslag, commando's en motor. De commando's direct na de opslag (valkuil 28)."""
    data = hass.data.setdefault(DOMAIN, {})
    if DATA_OPSLAG not in data:
        opslag = AutomatiseringOpslag(hass)
        await opslag.async_load()
        data[DATA_OPSLAG] = opslag
    automatisering_ws.async_register(hass)
    if DATA_MOTOR not in data:
        motor = Motor(hass, data[DATA_OPSLAG], partial(automatisering_ws.async_meld_aan_abonnees, hass))
        data[DATA_MOTOR] = motor
        await motor.async_start()


@callback
def async_stop(hass: HomeAssistant) -> None:
    """Laat de klok los bij de laatste config entry."""
    data = hass.data.get(DOMAIN, {})
    if (motor := data.pop(DATA_MOTOR, None)) is not None:
        motor.async_stop()
    data.pop(DATA_OPSLAG, None)
    data.pop(DATA_ABONNEES, None)
