"""Infoscherm: een wachtkamerscherm op een iPad, beheerd door de receptie.

Zie `const.py` voor het verhaal. Deze module doet alleen het opzetten en
afbreken; de inhoud staat in:

| bestand | wat |
|---|---|
| `const.py` | de getallen, en wie wat mag |
| `store.py` | openingstijden, personen, mededelingen, verjaardagen, scherm, installatie, indeling, instellingen |
| `bestanden.py` | logo en foto's op schijf |
| `feeds.py` | nieuws van buiten (RSS/Atom) |
| `http.py` | uploaden en uitserveren |
| `websocket.py` | de commando's en het abonnement voor de kaarten |
"""

from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant, callback

from ..const import DOMAIN
from . import http as infoscherm_http
from . import websocket as infoscherm_ws
from .const import DATA_FEEDS, DATA_STORE
from .feeds import FeedLezer
from .store import InfoStore

_LOGGER = logging.getLogger(__name__)


async def async_zet_op(hass: HomeAssistant) -> None:
    """Opslag, commando's, views en de feedlezer. Eén keer.

    Tot 0.37.0 stond hier ook een klok die om middernacht iedereen op afwezig
    zette. Weg sinds ronde 3: *"Iedereen moet gewoon zijn eigen aanwezigheid
    controleren."*
    """
    data = hass.data.setdefault(DOMAIN, {})

    if DATA_STORE not in data:
        store = InfoStore(hass)
        await store.async_load()
        data[DATA_STORE] = store

    infoscherm_ws.async_register(hass)
    infoscherm_http.async_registreer(hass)

    if DATA_FEEDS not in data:
        lezer = FeedLezer(
            hass,
            lambda: data[DATA_STORE].instellingen.get("feeds", []),
            lambda: infoscherm_ws.async_meld_feeds(hass),
        )
        data[DATA_FEEDS] = lezer
        await lezer.async_start()


@callback
def async_stop(hass: HomeAssistant) -> None:
    """Laat de feedlezer los bij de laatste config entry."""
    data = hass.data.get(DOMAIN, {})
    if (lezer := data.pop(DATA_FEEDS, None)) is not None:
        lezer.async_stop()
    data.pop(DATA_STORE, None)
