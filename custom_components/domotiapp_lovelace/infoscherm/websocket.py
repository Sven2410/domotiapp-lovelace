"""De commando's van het infoscherm, en het abonnement dat elk open scherm bijwerkt.

| Commando | Wie |
|---|---|
| `infoscherm/get` | iedere ingelogde gebruiker |
| `infoscherm/subscribe` | iedere ingelogde gebruiker |
| `infoscherm/aanwezig` | iedere ingelogde gebruiker, ook kiosk |
| `infoscherm/personen/save` | iedereen behalve kiosk |
| `infoscherm/mededelingen/save` | idem |
| `infoscherm/nieuws/save` | idem |
| `infoscherm/praktijk/save` | idem |
| `infoscherm/instellingen/save` | idem; `kiosk_gebruikers` erin alleen als admin |
| `infoscherm/bestand/verwijder` | idem |
| `infoscherm/feeds/ververs` | idem |
| `infoscherm/gebruikers` | alleen admin |

Zie `const.py` voor waarom de grens niet bij HA's adminvlag ligt maar bij het
kioskaccount. Een kioskaccount dat toch een beheercommando stuurt krijgt
`unauthorized`; de kaart op de iPad toont dat beheer niet eens.

Na elke wijziging gaat de HELE stand naar elke abonnee. Hij is klein (tekst en
een paar ID's), en het scheelt een kaart die per soort wijziging iets anders
moet samenvoegen -- op een iPad die wekenlang aanstaat is "gooi weg en teken
opnieuw" de vorm die niet uit de pas kan lopen.
"""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv

from ..const import DOMAIN
from . import bestanden
from .const import (
    DATA_ABONNEES,
    DATA_FEEDS,
    DATA_STORE,
    DATA_WS_REGISTERED,
    EVENT_FEEDS,
    EVENT_STAND,
)
from .store import InfoFout

_LOGGER = logging.getLogger(__name__)


@callback
def async_register(hass: HomeAssistant) -> None:
    data = hass.data.setdefault(DOMAIN, {})
    if data.get(DATA_WS_REGISTERED):
        return
    for commando in (
        ws_get,
        ws_subscribe,
        ws_aanwezig,
        ws_personen_save,
        ws_mededelingen_save,
        ws_nieuws_save,
        ws_praktijk_save,
        ws_instellingen_save,
        ws_bestand_verwijder,
        ws_feeds_ververs,
        ws_gebruikers,
    ):
        websocket_api.async_register_command(hass, commando)
    data[DATA_WS_REGISTERED] = True
    _LOGGER.debug("Infoschermcommando's geregistreerd")


# --------------------------------------------------------------------------
# Abonnees
# --------------------------------------------------------------------------


@callback
def async_meld_stand(hass: HomeAssistant) -> None:
    """De nieuwe stand naar elk open scherm en elk open beheer."""
    store = hass.data.get(DOMAIN, {}).get(DATA_STORE)
    if store is None:
        return
    _stuur(hass, {"soort": EVENT_STAND, "stand": store.snapshot()})


@callback
def async_meld_feeds(hass: HomeAssistant) -> None:
    lezer = hass.data.get(DOMAIN, {}).get(DATA_FEEDS)
    if lezer is None:
        return
    _stuur(hass, {"soort": EVENT_FEEDS, "feeds": lezer.items(), "feed_fouten": lezer.fouten()})


@callback
def _stuur(hass: HomeAssistant, bericht: dict[str, Any]) -> None:
    for connection, msg_id in list(hass.data.get(DOMAIN, {}).get(DATA_ABONNEES) or []):
        connection.send_message(websocket_api.event_message(msg_id, bericht))


# --------------------------------------------------------------------------
# Hulp
# --------------------------------------------------------------------------


def _store(hass: HomeAssistant, connection, msg):
    store = hass.data.get(DOMAIN, {}).get(DATA_STORE)
    if store is None:
        connection.send_error(msg["id"], "not_loaded", "De integratie is niet geladen")
    return store


def _mag_beheren(store, connection) -> bool:
    gebruiker = connection.user
    return gebruiker is not None and not store.is_kiosk(gebruiker.id)


def _beheer(hass: HomeAssistant, connection, msg):
    """De store, of None nadat er al een fout is gestuurd."""
    store = _store(hass, connection, msg)
    if store is None:
        return None
    if not _mag_beheren(store, connection):
        connection.send_error(
            msg["id"], websocket_api.ERR_UNAUTHORIZED, "Dit account mag het infoscherm niet beheren"
        )
        return None
    return store


def _rechten(store, connection) -> dict[str, Any]:
    gebruiker = connection.user
    return {
        "mag_beheren": _mag_beheren(store, connection),
        "is_admin": bool(gebruiker and gebruiker.is_admin),
        "gebruiker": gebruiker.id if gebruiker else None,
    }


# --------------------------------------------------------------------------
# Lezen
# --------------------------------------------------------------------------


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/infoscherm/get"})
@callback
def ws_get(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    store = _store(hass, connection, msg)
    if store is None:
        return
    lezer = hass.data.get(DOMAIN, {}).get(DATA_FEEDS)
    connection.send_result(
        msg["id"],
        {
            "stand": store.snapshot(),
            "feeds": lezer.items() if lezer else [],
            "feed_fouten": lezer.fouten() if lezer else {},
            **_rechten(store, connection),
        },
    )


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/infoscherm/subscribe"})
@callback
def ws_subscribe(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    data = hass.data.setdefault(DOMAIN, {})
    abonnees = data.setdefault(DATA_ABONNEES, [])
    inschrijving = (connection, msg["id"])
    abonnees.append(inschrijving)

    @callback
    def opzeggen() -> None:
        try:
            abonnees.remove(inschrijving)
        except ValueError:
            pass

    connection.subscriptions[msg["id"]] = opzeggen
    connection.send_result(msg["id"])


# --------------------------------------------------------------------------
# Het scherm
# --------------------------------------------------------------------------


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/infoscherm/aanwezig",
        vol.Required("persoon"): cv.string,
        vol.Required("aanwezig"): bool,
    }
)
@websocket_api.async_response
async def ws_aanwezig(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Eén persoon aan- of afmelden. Ook het kioskaccount mag dit."""
    store = _store(hass, connection, msg)
    if store is None:
        return
    persoon = await store.async_zet_aanwezig(msg["persoon"], msg["aanwezig"])
    if persoon is None:
        connection.send_error(msg["id"], "not_found", "Deze persoon staat niet (meer) in de lijst")
        return
    async_meld_stand(hass)
    connection.send_result(msg["id"], {"persoon": persoon})


# --------------------------------------------------------------------------
# Het beheer
# --------------------------------------------------------------------------


async def _zet(hass, connection, msg, sleutel, zetter) -> None:
    store = _beheer(hass, connection, msg)
    if store is None:
        return
    try:
        resultaat = await zetter(store, msg[sleutel])
    except InfoFout as fout:
        connection.send_error(msg["id"], "invalid_format", str(fout))
        return
    async_meld_stand(hass)
    connection.send_result(msg["id"], {sleutel: resultaat})


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/infoscherm/personen/save", vol.Required("personen"): list}
)
@websocket_api.async_response
async def ws_personen_save(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    await _zet(hass, connection, msg, "personen", lambda s, v: s.async_zet_personen(v))


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/infoscherm/mededelingen/save",
        vol.Required("mededelingen"): list,
    }
)
@websocket_api.async_response
async def ws_mededelingen_save(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    await _zet(hass, connection, msg, "mededelingen", lambda s, v: s.async_zet_mededelingen(v))


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/infoscherm/nieuws/save", vol.Required("nieuws"): list}
)
@websocket_api.async_response
async def ws_nieuws_save(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    await _zet(hass, connection, msg, "nieuws", lambda s, v: s.async_zet_nieuws(v))


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/infoscherm/praktijk/save", vol.Required("praktijk"): dict}
)
@websocket_api.async_response
async def ws_praktijk_save(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    await _zet(hass, connection, msg, "praktijk", lambda s, v: s.async_zet_praktijk(v))


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/infoscherm/instellingen/save",
        vol.Required("instellingen"): dict,
    }
)
@websocket_api.async_response
async def ws_instellingen_save(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Instellingen. Wie de kioskaccounts zijn mag alleen een admin bepalen:
    anders kan een receptie-account zichzelf en het kiosk-account omwisselen."""
    is_admin = bool(connection.user and connection.user.is_admin)

    async def zetter(store, waarde):
        resultaat = await store.async_zet_instellingen(waarde, mag_kiosk_wijzigen=is_admin)
        if (lezer := hass.data.get(DOMAIN, {}).get(DATA_FEEDS)) is not None:
            hass.async_create_background_task(lezer.async_ververs(), "infoscherm feeds")
        return resultaat

    await _zet(hass, connection, msg, "instellingen", zetter)


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/infoscherm/bestand/verwijder", vol.Required("bestand"): cv.string}
)
@websocket_api.async_response
async def ws_bestand_verwijder(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    store = _beheer(hass, connection, msg)
    if store is None:
        return
    bestand_id = msg["bestand"]
    if not bestanden.is_geldig_id(bestand_id):
        connection.send_error(msg["id"], "invalid_format", "Dat is geen bestands-ID")
        return
    meta = await store.async_vergeet_bestand(bestand_id)
    if meta is not None:
        await hass.async_add_executor_job(bestanden.verwijder, hass, bestand_id, meta["soort"])
    async_meld_stand(hass)
    connection.send_result(msg["id"], {"verwijderd": meta is not None})


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/infoscherm/feeds/ververs"})
@websocket_api.async_response
async def ws_feeds_ververs(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Nu ophalen in plaats van over een kwartier, na het invullen van een bron."""
    store = _beheer(hass, connection, msg)
    if store is None:
        return
    lezer = hass.data.get(DOMAIN, {}).get(DATA_FEEDS)
    if lezer is not None:
        await lezer.async_ververs()
    connection.send_result(
        msg["id"],
        {"feeds": lezer.items() if lezer else [], "feed_fouten": lezer.fouten() if lezer else {}},
    )


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/infoscherm/gebruikers"})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_gebruikers(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """De accounts waaruit een admin de kioskaccounts kiest."""
    gebruikers = await hass.auth.async_get_users()
    connection.send_result(
        msg["id"],
        {
            "gebruikers": [
                {"id": g.id, "naam": g.name or g.id, "is_admin": g.is_admin}
                for g in gebruikers
                if g.is_active and not g.system_generated
            ]
        },
    )
