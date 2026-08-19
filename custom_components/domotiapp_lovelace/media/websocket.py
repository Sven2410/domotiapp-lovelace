"""De twee WebSocket-commando's van de mediakant.

`media/search` en `media/speakers`. Meer is er niet nodig, en dat is met opzet:
afspelen, groeperen, shuffle en herhalen zijn gewone service-aanroepen op een
entiteit, en die kan de kaart zelf doen. Alleen deze twee kunnen dat niet --
zoeken vraagt de MA-config-entry, en de speakerlijst vraagt het label- en
entity-registry. Alles wat de kaart zelf kan, doet de kaart zelf.

Geen enkel commando is admin-only, om dezelfde reden als bij de wekker: klanten
draaien een tablet met een niet-admin account, en juist zij bedienen deze kaart.
"""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv

from .. import ma
from . import entiteiten
from .const import DATA_WS_REGISTERED, DOMAIN, SEARCH_LIMIT_DEFAULT, SEARCH_LIMIT_MAX

_LOGGER = logging.getLogger(__name__)

TYPE_SEARCH = f"{DOMAIN}/media/search"
TYPE_SPEAKERS = f"{DOMAIN}/media/speakers"


@websocket_api.websocket_command(
    {
        vol.Required("type"): TYPE_SEARCH,
        vol.Required("query"): cv.string,
        vol.Optional("media_types"): [cv.string],
        vol.Optional("limit", default=SEARCH_LIMIT_DEFAULT): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=SEARCH_LIMIT_MAX)
        ),
    }
)
@websocket_api.async_response
async def _handle_search(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Zoeken in Music Assistant, voor het zoekscherm van de mediakaart."""
    try:
        antwoord = await ma.zoek(
            hass,
            msg["query"],
            media_types=msg.get("media_types"),
            limit=msg["limit"],
        )
    except ma.MANietBeschikbaar:
        connection.send_error(
            msg["id"],
            websocket_api.ERR_NOT_FOUND,
            "Music Assistant is niet beschikbaar. Zonder Music Assistant kan er niet "
            "gezocht worden.",
        )
        return
    except TimeoutError:
        connection.send_error(
            msg["id"],
            websocket_api.ERR_HOME_ASSISTANT_ERROR,
            "Zoeken duurt te lang. Probeer het opnieuw.",
        )
        return
    except HomeAssistantError as fout:
        connection.send_error(msg["id"], websocket_api.ERR_HOME_ASSISTANT_ERROR, str(fout))
        return

    connection.send_result(msg["id"], {"results": ma.treffers(antwoord)})


@websocket_api.websocket_command({vol.Required("type"): TYPE_SPEAKERS})
@callback
def _handle_speakers(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """De gelabelde Music Assistant-speakers, om mee te groeperen."""
    connection.send_result(msg["id"], entiteiten.speakers(hass).as_dict())


_COMMANDOS = (_handle_search, _handle_speakers)


@callback
def async_register(hass: HomeAssistant) -> None:
    """Registreer de commando's, één keer per HA-run.

    HA kent geen `async_unregister_command`, dus een tweede registratie zou de
    eerste overschrijven. De vlag voorkomt dat bij een tweede config entry.
    """
    data = hass.data.setdefault(DOMAIN, {})
    if data.get(DATA_WS_REGISTERED):
        return
    for commando in _COMMANDOS:
        websocket_api.async_register_command(hass, commando)
    data[DATA_WS_REGISTERED] = True
    _LOGGER.debug("%d WebSocket-commando's van de mediakant geregistreerd", len(_COMMANDOS))
