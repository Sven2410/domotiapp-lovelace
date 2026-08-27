"""Eén beeld uitserveren, met authenticatie.

## Waarom niet gewoon een map onder `www/`

Omdat alles daar op `/local/...` staat en door iedereen op het netwerk zonder
inloggen op te vragen is. Dit zijn beelden van de voordeur van een klant.

## Waarom `requires_auth = True` én ondertekende URL's

Ze bijten elkaar niet, ze vullen elkaar aan. De authenticatiemiddleware van
Home Assistant beschouwt een geldig ondertekende URL als geauthenticeerd
(`components/http/auth.py`), dus met `requires_auth = True` geldt:

- een dashboard dat het beeld in een `<img>` zet, heeft geen header nodig maar
  wel een handtekening -- en die geeft `websocket.py` alleen af aan wie er al
  ingelogd is;
- een telefoon die de melding openklikt, gebruikt de handtekening uit de
  melding;
- iemand die het pad raadt, krijgt 401.

## Waarom het ID langs een witte lijst gaat

Dit pad komt uit een HTTP-verzoek en wordt een bestandsnaam. Een ULID is 26
tekens uit een bekende verzameling; wat daar niet aan voldoet wordt niet
gezocht. Dat is korter dan achteraf uitzoeken of het resultaat nog binnen de
map ligt, en het heeft geen randgevallen met symlinks of met bestandssystemen
die geen verschil zien tussen hoofd- en kleine letters.
"""

from __future__ import annotations

import logging

from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant, callback

from . import beelden as beeldopslag
from ..const import DOMAIN
from .const import DATA_VIEW_REGISTERED, URL_PREFIX

_LOGGER = logging.getLogger(__name__)

# Een beeld verandert nooit meer nadat het er is: het ID is uniek en de inhoud
# staat vast. Een jaar cachen mag dus, en dat scheelt een wandtablet die de
# timeline openhoudt een hoop verkeer.
CACHE_HEADER = "public, max-age=31536000, immutable"


class BeeldView(HomeAssistantView):
    """`/api/domotiapp_lovelace/beeld/<id>`."""

    url = f"{URL_PREFIX}/{{beeld_id}}"
    name = f"api:{DOMAIN}:beeld"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    async def get(self, request: web.Request, beeld_id: str) -> web.Response:
        if not beeldopslag.is_geldig_id(beeld_id):
            return web.Response(status=404)

        inhoud = await self._hass.async_add_executor_job(
            beeldopslag.lees, self._hass, beeld_id
        )
        if inhoud is None:
            return web.Response(status=404)

        return web.Response(
            body=inhoud,
            content_type="image/jpeg",
            headers={"Cache-Control": CACHE_HEADER},
        )


@callback
def async_registreer(hass: HomeAssistant) -> None:
    """Meld de view aan, hooguit één keer per HA-run.

    Dezelfde guard als bij het statische pad in `__init__.py`: aiohttp weigert
    een tweede route op hetzelfde adres, en de integratie kan meerdere config
    entries hebben.
    """
    data = hass.data.setdefault(DOMAIN, {})
    if data.get(DATA_VIEW_REGISTERED):
        return
    hass.http.register_view(BeeldView(hass))
    data[DATA_VIEW_REGISTERED] = True
    _LOGGER.debug("Beeldview geregistreerd op %s", URL_PREFIX)
