"""De WebSocket-commando's van de mediakant.

`media/search` en `media/speakers` waren er eerst, en daar kwamen de commando's
voor de bibliotheek bij: favorieten en afspeellijsten. De regel is nog steeds
dezelfde:
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
from .const import (
    DATA_WS_REGISTERED,
    DOMAIN,
    LIBRARY_LIMIT_DEFAULT,
    LIBRARY_LIMIT_MAX,
    SEARCH_LIMIT_DEFAULT,
    SEARCH_LIMIT_MAX,
)

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




# ---------------------------------------------------------------------------
# De bibliotheek: favorieten en afspeellijsten
# ---------------------------------------------------------------------------
#
# Dit zijn de commando's die de kaart NIET zelf kan doen. Afspelen blijft een
# gewone service-aanroep; alles hieronder loopt over de geleende MA-client, en
# die zit aan de serverkant. Zie het blok in `ma.py`.
#
# Ook deze zijn niet admin-only: het hele punt is dat de klant zijn eigen
# favorieten kan beheren vanaf de tablet in de gang.

TYPE_LIBRARY = f"{DOMAIN}/media/library"
TYPE_FAVORITE = f"{DOMAIN}/media/favorite"
TYPE_PLAYLIST_CREATE = f"{DOMAIN}/media/playlist/create"
TYPE_PLAYLIST_REMOVE = f"{DOMAIN}/media/playlist/remove"
TYPE_PLAYLIST_TRACKS = f"{DOMAIN}/media/playlist/tracks"
TYPE_PLAYLIST_ADD = f"{DOMAIN}/media/playlist/add_tracks"
TYPE_PLAYLIST_DEL = f"{DOMAIN}/media/playlist/remove_tracks"

SOORTEN = vol.In(tuple(ma.BIBLIOTHEEK_METHODE))


def _fout(connection, msg, err: Exception) -> None:
    """Eén plek waar een MA-fout een leesbare melding wordt.

    Zonder dit staat dezelfde `try/except` zeven keer, en dan wijkt de zevende
    een keer af zonder dat iemand het merkt.
    """
    if isinstance(err, ma.MANietBeschikbaar):
        connection.send_error(
            msg["id"],
            websocket_api.ERR_NOT_FOUND,
            "Music Assistant is niet beschikbaar. Zonder Music Assistant zijn er geen "
            "favorieten of afspeellijsten.",
        )
        return
    if isinstance(err, TimeoutError):
        connection.send_error(
            msg["id"],
            websocket_api.ERR_HOME_ASSISTANT_ERROR,
            "Music Assistant antwoordt niet op tijd. Probeer het opnieuw.",
        )
        return
    _LOGGER.debug("Music Assistant gaf een fout terug: %s", err)
    connection.send_error(msg["id"], websocket_api.ERR_HOME_ASSISTANT_ERROR, str(err))


@websocket_api.websocket_command(
    {
        vol.Required("type"): TYPE_LIBRARY,
        vol.Required("kind"): SOORTEN,
        vol.Optional("favorite", default=False): cv.boolean,
        vol.Optional("search"): cv.string,
        vol.Optional("limit", default=LIBRARY_LIMIT_DEFAULT): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=LIBRARY_LIMIT_MAX)
        ),
        vol.Optional("offset", default=0): vol.All(vol.Coerce(int), vol.Range(min=0)),
    }
)
@websocket_api.async_response
async def _handle_library(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Een stuk van de bibliotheek, of alleen de favorieten daarvan."""
    try:
        items = await ma.bibliotheek(
            hass,
            msg["kind"],
            # `False` betekent hier "alles", niet "alleen niet-favorieten".
            favoriet=True if msg["favorite"] else None,
            zoek_term=msg.get("search"),
            limiet=msg["limit"],
            offset=msg["offset"],
        )
    except (ma.MANietBeschikbaar, TimeoutError, HomeAssistantError) as err:
        _fout(connection, msg, err)
        return
    connection.send_result(msg["id"], {"items": items})


@websocket_api.websocket_command(
    {
        vol.Required("type"): TYPE_FAVORITE,
        vol.Required("favorite"): cv.boolean,
        # Aanzetten gaat op uri (MA zoekt zelf op wat erachter zit), uitzetten
        # op bibliotheeknummer plus soort. Dat is niet ons ontwerp maar dat van
        # MA; het staat hier expliciet zodat de kaart niet hoeft te raden.
        vol.Optional("uri"): cv.string,
        vol.Optional("kind"): SOORTEN,
        vol.Optional("library_item_id"): cv.string,
    }
)
@websocket_api.async_response
async def _handle_favorite(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Een hartje aan- of uitzetten."""
    plek: dict[str, Any] | None = None
    try:
        if msg["favorite"]:
            if not msg.get("uri"):
                raise HomeAssistantError("Om iets favoriet te maken is een uri nodig.")
            plek = await ma.favoriet_aan(hass, msg["uri"])
        else:
            if not msg.get("kind") or not msg.get("library_item_id"):
                raise HomeAssistantError(
                    "Om een favoriet weg te halen zijn de soort en het bibliotheeknummer nodig."
                )
            await ma.favoriet_uit(hass, msg["kind"], msg["library_item_id"])
    except (ma.MANietBeschikbaar, TimeoutError, HomeAssistantError) as err:
        _fout(connection, msg, err)
        return
    # `plek` vertelt de kaart waar het item nu in de bibliotheek staat, zodat het
    # hartje meteen weer uit kan. Zie `favoriet_aan`.
    connection.send_result(msg["id"], {"favorite": msg["favorite"], **(plek or {})})


@websocket_api.websocket_command(
    {vol.Required("type"): TYPE_PLAYLIST_CREATE, vol.Required("name"): vol.All(cv.string, vol.Length(min=1))}
)
@websocket_api.async_response
async def _handle_playlist_create(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Een nieuwe, lege afspeellijst."""
    try:
        lijst = await ma.afspeellijst_maken(hass, msg["name"].strip())
    except (ma.MANietBeschikbaar, TimeoutError, HomeAssistantError) as err:
        _fout(connection, msg, err)
        return
    connection.send_result(msg["id"], {"playlist": lijst})


@websocket_api.websocket_command(
    {vol.Required("type"): TYPE_PLAYLIST_REMOVE, vol.Required("library_item_id"): cv.string}
)
@websocket_api.async_response
async def _handle_playlist_remove(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Een afspeellijst weggooien. De nummers blijven in de bibliotheek."""
    try:
        await ma.afspeellijst_verwijderen(hass, msg["library_item_id"])
    except (ma.MANietBeschikbaar, TimeoutError, HomeAssistantError) as err:
        _fout(connection, msg, err)
        return
    connection.send_result(msg["id"], {"removed": msg["library_item_id"]})


@websocket_api.websocket_command(
    {
        vol.Required("type"): TYPE_PLAYLIST_TRACKS,
        vol.Required("library_item_id"): cv.string,
        vol.Required("provider"): cv.string,
    }
)
@websocket_api.async_response
async def _handle_playlist_tracks(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Wat er in een afspeellijst zit, mét de positie van elk nummer."""
    try:
        nummers = await ma.afspeellijst_nummers(hass, msg["library_item_id"], msg["provider"])
    except (ma.MANietBeschikbaar, TimeoutError, HomeAssistantError) as err:
        _fout(connection, msg, err)
        return
    connection.send_result(msg["id"], {"tracks": nummers})


@websocket_api.websocket_command(
    {
        vol.Required("type"): TYPE_PLAYLIST_ADD,
        vol.Required("library_item_id"): cv.string,
        vol.Required("uris"): vol.All([cv.string], vol.Length(min=1)),
    }
)
@websocket_api.async_response
async def _handle_playlist_add(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Nummers achteraan een afspeellijst."""
    try:
        await ma.nummers_toevoegen(hass, msg["library_item_id"], msg["uris"])
    except (ma.MANietBeschikbaar, TimeoutError, HomeAssistantError) as err:
        _fout(connection, msg, err)
        return
    connection.send_result(msg["id"], {"added": len(msg["uris"])})


@websocket_api.websocket_command(
    {
        vol.Required("type"): TYPE_PLAYLIST_DEL,
        vol.Required("library_item_id"): cv.string,
        vol.Required("positions"): vol.All([vol.Coerce(int)], vol.Length(min=1)),
    }
)
@websocket_api.async_response
async def _handle_playlist_del(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Nummers uit een afspeellijst, op positie."""
    try:
        await ma.nummers_verwijderen(hass, msg["library_item_id"], msg["positions"])
    except (ma.MANietBeschikbaar, TimeoutError, HomeAssistantError) as err:
        _fout(connection, msg, err)
        return
    connection.send_result(msg["id"], {"removed": len(msg["positions"])})


_COMMANDOS = (
    _handle_search,
    _handle_speakers,
    _handle_library,
    _handle_favorite,
    _handle_playlist_create,
    _handle_playlist_remove,
    _handle_playlist_tracks,
    _handle_playlist_add,
    _handle_playlist_del,
)


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
