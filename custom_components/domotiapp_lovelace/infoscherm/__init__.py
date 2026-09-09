"""Infoscherm: een wachtkamerscherm op een iPad, beheerd door de receptie.

Zie `const.py` voor het verhaal. Deze module doet alleen het opzetten en
afbreken; de inhoud staat in:

| bestand | wat |
|---|---|
| `const.py` | de getallen, en wie wat mag |
| `store.py` | praktijk, personen, mededelingen, nieuws, instellingen |
| `bestanden.py` | logo en foto's op schijf |
| `feeds.py` | nieuws van buiten (RSS/Atom) |
| `http.py` | uploaden en uitserveren |
| `websocket.py` | de commando's en het abonnement voor de kaarten |
"""

from __future__ import annotations

from functools import partial
import logging

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_track_time_change

from ..const import DOMAIN
from . import http as infoscherm_http
from . import websocket as infoscherm_ws
from .const import DATA_FEEDS, DATA_MIDDERNACHT, DATA_STORE
from .feeds import FeedLezer
from .store import InfoStore

_LOGGER = logging.getLogger(__name__)


async def async_zet_op(hass: HomeAssistant) -> None:
    """Opslag, commando's, views, feedlezer en de middernachtklok. Eén keer."""
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

    if DATA_MIDDERNACHT not in data:
        # Tien seconden na middernacht en niet precies erop: dan is een
        # uitzondering op de openingstijden van "morgen" al "vandaag".
        data[DATA_MIDDERNACHT] = async_track_time_change(
            hass, partial(async_middernacht, hass), hour=0, minute=0, second=10
        )


async def async_middernacht(hass: HomeAssistant, _nu=None) -> int:
    """Iedereen op afwezig, zodat het scherm 's ochtends niet liegt.

    Instelbaar per praktijk: een zorginstelling met nachtdienst wil dit uit.
    Geeft terug hoeveel personen er zijn afgemeld.
    """
    store = hass.data.get(DOMAIN, {}).get(DATA_STORE)
    if store is None or not store.instellingen.get("reset_middernacht", True):
        return 0
    aantal = await store.async_reset_aanwezig()
    if aantal:
        _LOGGER.debug("Infoscherm: %d perso(o)n(en) om middernacht op afwezig gezet", aantal)
        infoscherm_ws.async_meld_stand(hass)
    return aantal


@callback
def async_stop(hass: HomeAssistant) -> None:
    """Laat de feedlezer en de klok los bij de laatste config entry."""
    data = hass.data.get(DOMAIN, {})
    if (lezer := data.pop(DATA_FEEDS, None)) is not None:
        lezer.async_stop()
    if (stop_klok := data.pop(DATA_MIDDERNACHT, None)) is not None:
        stop_klok()
    data.pop(DATA_STORE, None)
