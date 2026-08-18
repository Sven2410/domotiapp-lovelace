"""WebSocket-commando's voor DomotiApp Lovelace (SPEC.md sectie 11).

Vier commando's:

| Commando | Wie |
|---|---|
| `domotiapp_lovelace/scenes/get`    | iedere ingelogde gebruiker |
| `domotiapp_lovelace/scenes/save`   | iedere ingelogde gebruiker |
| `domotiapp_lovelace/snapshot/create`| iedere ingelogde gebruiker |
| `domotiapp_lovelace/snapshot/close` | iedere ingelogde gebruiker |
| `domotiapp_lovelace/storage/list`  | alleen admin |
| `domotiapp_lovelace/storage/delete`| alleen admin |

Dat `scenes/save` uitdrukkelijk niet admin-only is, is geen slordigheid: de
klant draait Fully Kiosk met een niet-adminaccount en moet juist zijn eigen
scenes kunnen aanpassen (SPEC 14).

De twee `storage/*`-commando's hebben in v1 nog geen frontend-aanroeper — het
opruimoverzicht wordt een options flow, die de opslaglaag rechtstreeks
aanroept. Ze staan er om de twee operaties één keer vast te leggen en omdat de
options flow en deze handlers dezelfde functie in `store.py` gebruiken
(SPEC 11.6).
"""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.components.light import DOMAIN as LIGHT_DOMAIN
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv

from . import snapshot as snapshot_beheer
from .const import DATA_STORE, DATA_WS_REGISTERED, DOMAIN
from .store import (
    CorruptGroupError,
    GroupNotFoundError,
    NotALightGroupError,
    SceneStore,
    SchemaError,
    StoreUnusableError,
    lege_scenes,
    resolve_light_group,
    valideer_scenes,
)

_LOGGER = logging.getLogger(__name__)


@callback
def async_register(hass: HomeAssistant) -> None:
    """Registreer de commando's, hooguit één keer per HA-run.

    De guard is nodig omdat de integratie meerdere config entries kan hebben en
    `async_register_command` per commando maar één handler kent.
    """
    data = hass.data.setdefault(DOMAIN, {})
    if data.get(DATA_WS_REGISTERED):
        return

    websocket_api.async_register_command(hass, ws_scenes_get)
    websocket_api.async_register_command(hass, ws_scenes_save)
    websocket_api.async_register_command(hass, ws_snapshot_create)
    websocket_api.async_register_command(hass, ws_snapshot_close)
    websocket_api.async_register_command(hass, ws_storage_list)
    websocket_api.async_register_command(hass, ws_storage_delete)

    data[DATA_WS_REGISTERED] = True
    _LOGGER.debug("WebSocket-commando's geregistreerd")


@callback
def _store(hass: HomeAssistant) -> SceneStore | None:
    """De opslaglaag uit hass.data, of None als de integratie niet geladen is.

    Dat tweede geval is niet theoretisch. De commando's zijn per HA-run één
    keer geregistreerd en niet af te melden, dus een kaart die na het
    verwijderen van de integratie nog op een dashboard staat, blijft
    commando's sturen (SPEC 11.7).
    """
    return hass.data.get(DOMAIN, {}).get(DATA_STORE)


@callback
def _meld_niet_geladen(
    connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Antwoord met een nette fout als de integratie niet geladen is."""
    connection.send_error(
        msg["id"],
        websocket_api.const.ERR_NOT_ALLOWED,
        "DomotiApp Lovelace is niet geladen",
    )


# --------------------------------------------------------------------------
# 11.1 domotiapp_lovelace/scenes/get
# --------------------------------------------------------------------------


@websocket_api.websocket_command(
    {
        vol.Required("type"): "domotiapp_lovelace/scenes/get",
        # Een entity_id buiten het light-domein geeft vol.Invalid, en dat
        # vertaalt het framework zelf naar invalid_format
        # (websocket_api/connection.py:296-297).
        vol.Required("entity_id"): cv.entity_domain(LIGHT_DOMAIN),
    }
)
@websocket_api.async_response
async def ws_scenes_get(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Haal de drie scenes van één light group op."""
    if (store := _store(hass)) is None:
        _meld_niet_geladen(connection, msg)
        return

    entity_id: str = msg["entity_id"]

    try:
        registry_entry_id, leden = resolve_light_group(hass, entity_id)
    except GroupNotFoundError as fout:
        connection.send_error(msg["id"], websocket_api.const.ERR_NOT_FOUND, str(fout))
        return
    except NotALightGroupError as fout:
        connection.send_error(msg["id"], websocket_api.const.ERR_NOT_ALLOWED, str(fout))
        return

    try:
        data = store.async_get_group(registry_entry_id)
    except (CorruptGroupError, StoreUnusableError) as fout:
        connection.send_error(
            msg["id"], websocket_api.const.ERR_HOME_ASSISTANT_ERROR, str(fout)
        )
        return

    if data is None:
        scenes = lege_scenes()
        opgeslagen = False
    else:
        scenes = data.scenes
        opgeslagen = True
        # Het label bijwerken na een hernoeming (SPEC 10.2). Schrijft alleen
        # als er daadwerkelijk iets verandert.
        await store.async_update_label(registry_entry_id, entity_id)

    connection.send_result(
        msg["id"],
        {
            "scenes": [scene.to_dict() for scene in scenes],
            "member_entity_ids": leden,
            "stored": opgeslagen,
        },
    )


# --------------------------------------------------------------------------
# 11.2 domotiapp_lovelace/scenes/save
# --------------------------------------------------------------------------


@websocket_api.websocket_command(
    {
        vol.Required("type"): "domotiapp_lovelace/scenes/save",
        vol.Required("entity_id"): cv.entity_domain(LIGHT_DOMAIN),
        vol.Required("scenes"): list,
    }
)
@websocket_api.async_response
async def ws_scenes_save(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Sla alle drie de scenes van één light group in één keer op."""
    if (store := _store(hass)) is None:
        _meld_niet_geladen(connection, msg)
        return

    entity_id: str = msg["entity_id"]

    try:
        registry_entry_id, _leden = resolve_light_group(hass, entity_id)
    except GroupNotFoundError as fout:
        connection.send_error(msg["id"], websocket_api.const.ERR_NOT_FOUND, str(fout))
        return
    except NotALightGroupError as fout:
        connection.send_error(msg["id"], websocket_api.const.ERR_NOT_ALLOWED, str(fout))
        return

    # Volledig valideren vóór er ook maar iets geschreven wordt (SPEC 11.2).
    try:
        scenes = valideer_scenes(msg["scenes"])
    except SchemaError as fout:
        connection.send_error(
            msg["id"], websocket_api.const.ERR_INVALID_FORMAT, str(fout)
        )
        return

    try:
        await store.async_save_group(registry_entry_id, entity_id, scenes)
    except (CorruptGroupError, StoreUnusableError) as fout:
        connection.send_error(
            msg["id"], websocket_api.const.ERR_HOME_ASSISTANT_ERROR, str(fout)
        )
        return
    except (HomeAssistantError, OSError) as fout:
        # Schrijven naar de Store mislukt (SPEC 11.2). Store.async_save schrijft
        # meteen door en wacht die schrijfactie af, dus een schijffout komt hier
        # terecht en niet pas veel later.
        _LOGGER.error("Opslaan van %s mislukt: %s", entity_id, fout)
        connection.send_error(
            msg["id"], websocket_api.const.ERR_HOME_ASSISTANT_ERROR, str(fout)
        )
        return

    connection.send_result(msg["id"], {"stored": True})


# --------------------------------------------------------------------------
# 11.3 domotiapp_lovelace/storage/list
# --------------------------------------------------------------------------


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "domotiapp_lovelace/storage/list"})
@websocket_api.async_response
async def ws_storage_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Alle opgeslagen groepen, met of ze nog bestaan."""
    if (store := _store(hass)) is None:
        _meld_niet_geladen(connection, msg)
        return

    connection.send_result(msg["id"], {"groups": store.async_list_groups()})


# --------------------------------------------------------------------------
# 11.4 domotiapp_lovelace/storage/delete
# --------------------------------------------------------------------------


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "domotiapp_lovelace/storage/delete",
        # Bewust op registry-entry-ID: je moet juist opslag kunnen wissen van
        # groepen die niet meer bestaan (SPEC 11.4).
        vol.Required("registry_entry_id"): cv.string,
    }
)
@websocket_api.async_response
async def ws_storage_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Verwijder de opslag van één groep."""
    if (store := _store(hass)) is None:
        _meld_niet_geladen(connection, msg)
        return

    registry_entry_id: str = msg["registry_entry_id"]

    try:
        verwijderd = await store.async_delete_group(registry_entry_id)
    except StoreUnusableError as fout:
        connection.send_error(
            msg["id"], websocket_api.const.ERR_HOME_ASSISTANT_ERROR, str(fout)
        )
        return

    if not verwijderd:
        connection.send_error(
            msg["id"],
            websocket_api.const.ERR_NOT_FOUND,
            f"{registry_entry_id} komt niet in de opslag voor",
        )
        return

    connection.send_result(msg["id"], {"deleted": True})


# --------------------------------------------------------------------------
# 11.5 domotiapp_lovelace/snapshot/create en /close
#
# De integratie beheert de snapshot; de kaart roept `scene.create` en
# `scene.delete` nooit zelf aan (SPEC 9.2). Daardoor blijft SPEC 10.2 volledig
# overeind: de kaart stuurt alleen een entity-ID mee en krijgt nooit een
# registry-entry-ID te zien, ook niet als deelstring in een scenenaam.
#
# Twee commando's en niet drie: sluiten eindigt altijd in `scene.delete`, en
# herstellen is daar een schakelaar op. Dat maakt het sluiten bovendien
# idempotent — is er geen snapshot, dan gebeurt er niets en komt er geen fout.
# Precies dat is wat de editor nodig heeft, want `ha-dialog` kan het sluiten
# twee keer melden.
# --------------------------------------------------------------------------


@websocket_api.websocket_command(
    {
        vol.Required("type"): "domotiapp_lovelace/snapshot/create",
        vol.Required("entity_id"): cv.entity_domain(LIGHT_DOMAIN),
    }
)
@websocket_api.async_response
async def ws_snapshot_create(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Maak de snapshot van één light group, of laat een bestaande met rust."""
    if (store := _store(hass)) is None:
        _meld_niet_geladen(connection, msg)
        return
    del store

    entity_id: str = msg["entity_id"]

    try:
        registry_entry_id, leden = resolve_light_group(hass, entity_id)
    except GroupNotFoundError as fout:
        connection.send_error(msg["id"], websocket_api.const.ERR_NOT_FOUND, str(fout))
        return
    except NotALightGroupError as fout:
        connection.send_error(msg["id"], websocket_api.const.ERR_NOT_ALLOWED, str(fout))
        return

    try:
        aangemaakt = await snapshot_beheer.async_maak(hass, registry_entry_id, leden)
    except (HomeAssistantError, OSError) as fout:
        _LOGGER.error("Snapshot van %s maken mislukt: %s", entity_id, fout)
        connection.send_error(
            msg["id"], websocket_api.const.ERR_HOME_ASSISTANT_ERROR, str(fout)
        )
        return

    connection.send_result(msg["id"], {"created": aangemaakt})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "domotiapp_lovelace/snapshot/close",
        vol.Required("entity_id"): cv.entity_domain(LIGHT_DOMAIN),
        # True bij Annuleren, de X, Escape en wegklikken; False bij Opslaan
        # (SPEC 9.3).
        vol.Required("restore"): cv.boolean,
    }
)
@websocket_api.async_response
async def ws_snapshot_close(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Herstel de snapshot en/of verwijder hem."""
    if (store := _store(hass)) is None:
        _meld_niet_geladen(connection, msg)
        return
    del store

    entity_id: str = msg["entity_id"]

    try:
        registry_entry_id, _leden = resolve_light_group(hass, entity_id)
    except GroupNotFoundError as fout:
        connection.send_error(msg["id"], websocket_api.const.ERR_NOT_FOUND, str(fout))
        return
    except NotALightGroupError as fout:
        connection.send_error(msg["id"], websocket_api.const.ERR_NOT_ALLOWED, str(fout))
        return

    try:
        hersteld, verwijderd = await snapshot_beheer.async_sluit(
            hass, registry_entry_id, herstel=msg["restore"]
        )
    except (HomeAssistantError, OSError) as fout:
        _LOGGER.error("Snapshot van %s sluiten mislukt: %s", entity_id, fout)
        connection.send_error(
            msg["id"], websocket_api.const.ERR_HOME_ASSISTANT_ERROR, str(fout)
        )
        return

    connection.send_result(msg["id"], {"restored": hersteld, "deleted": verwijderd})
