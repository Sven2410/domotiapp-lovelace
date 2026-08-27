"""Bewaking: snapshots bij een detectie, een timeline, en meldingen.

Alles wat de klant hiervan ziet zit aan één vinkje in de editor van de
camerakaart. Staat dat uit, dan staat er niets in de opslag, luistert de motor
naar niets en ligt er geen enkel beeld op schijf.

Deze module doet alleen het opzetten en afbreken; de inhoud staat in:

| bestand | wat |
|---|---|
| `const.py` | de getallen, en waaróm ze zo staan |
| `store.py` | de regels per camera, en de index van de timeline |
| `beelden.py` | de jpeg's op schijf |
| `opruimen.py` | welke beelden weg mogen (pure functies, met tests) |
| `motor.py` | detectie -> rustperiode -> beeld -> melding |
| `meldingen.py` | van een persoon naar zijn notify-dienst |
| `http.py` | één beeld uitserveren, met authenticatie |
| `websocket.py` | de commando's en het abonnement voor de kaart |
"""

from __future__ import annotations

from functools import partial
import logging

from homeassistant.core import HomeAssistant, callback

from ..const import DOMAIN
from . import http as bewaking_http
from . import websocket as bewaking_ws
from .const import DATA_INDEX, DATA_MOTOR, DATA_REGELS
from .motor import Motor
from .store import BeeldIndex, RegelStore

_LOGGER = logging.getLogger(__name__)


async def async_zet_op(hass: HomeAssistant) -> None:
    """Opslag, commando's, view en motor. Eén keer, bij de eerste config entry.

    De commando's worden hier meteen na de opslag geregistreerd, om dezelfde
    reden als bij de scenekant: zolang een commando niet geregistreerd is
    antwoordt Home Assistant `Unknown command.`, en dat is de fout die een
    kaart te zien krijgt die net na een herstart opnieuw verbindt.
    """
    data = hass.data.setdefault(DOMAIN, {})

    if DATA_REGELS not in data:
        regels = RegelStore(hass)
        await regels.async_load()
        data[DATA_REGELS] = regels

    if DATA_INDEX not in data:
        index = BeeldIndex(hass)
        await index.async_load()
        data[DATA_INDEX] = index

    bewaking_ws.async_register(hass)
    bewaking_http.async_registreer(hass)

    if DATA_MOTOR not in data:
        motor = Motor(
            hass,
            data[DATA_REGELS],
            data[DATA_INDEX],
            partial(bewaking_ws.async_meld_aan_abonnees, hass),
        )
        data[DATA_MOTOR] = motor
        await motor.async_start()
        _LOGGER.debug(
            "Bewaking gestart met %d regel(s)", len(data[DATA_REGELS].alle())
        )


@callback
def async_stop(hass: HomeAssistant) -> None:
    """Laat de motor los bij de laatste config entry.

    Zonder dit blijft er een luisteraar op de melders staan die straks schrijft
    naar een opslag van een integratie die er niet meer is -- dezelfde reden
    waarom de wekkerplanner hier ook wordt gestopt.
    """
    data = hass.data.get(DOMAIN, {})
    if (motor := data.pop(DATA_MOTOR, None)) is not None:
        motor.async_stop()
        _LOGGER.debug("Bewakingsmotor gestopt")
    data.pop(DATA_REGELS, None)
    data.pop(DATA_INDEX, None)
