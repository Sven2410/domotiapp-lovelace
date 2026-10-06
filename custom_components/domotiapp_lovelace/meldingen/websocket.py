"""De commando's van de meldingenkaart.

| Commando | Wie |
|---|---|
| `meldingen/subscribe` | iedere ingelogde gebruiker |
| `meldingen/aan` | iedere ingelogde gebruiker |
| `meldingen/proef` | alleen beheerders; met `persoon` alleen naar die persoon |

Omzetten mag iedereen: de kaart hangt op een tablet met een kioskaccount, en
daar hoort Lieke haar eigen meldingen uit te kunnen zetten. Een proefmelding
naar het hele huishouden sturen is iets anders, en dat is voorbehouden aan wie
het dashboard ook mag bewerken.
"""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv

from ..bewaking import meldingen as telefoons
from ..const import DOMAIN
from .const import DATA_ABONNEES, DATA_MOTOR, DATA_OPSLAG, DATA_WS_REGISTERED, MOMENTEN

_LOGGER = logging.getLogger(__name__)


@callback
def async_register(hass: HomeAssistant) -> None:
    """Registreer de commando's, hooguit één keer per HA-run."""
    data = hass.data.setdefault(DOMAIN, {})
    if data.get(DATA_WS_REGISTERED):
        return
    websocket_api.async_register_command(hass, ws_subscribe)
    websocket_api.async_register_command(hass, ws_aan)
    websocket_api.async_register_command(hass, ws_proef)
    data[DATA_WS_REGISTERED] = True


@callback
def stand(hass: HomeAssistant, ident: str) -> dict[str, Any]:
    """Alles wat een kaart over deze melding moet weten.

    `telefoons` staat er voor ÁLLE personen in, niet alleen voor die van de
    opgeslagen melding: in de editor voegt iemand een persoon toe die de server
    nog niet kent, en het voorbeeld hoort dan meteen te zeggen of er een
    telefoon bij gevonden is.

    `tijden` zijn de tijden die de server ECHT gebruikt. Staat dezelfde kaart
    op twee dashboards met andere tijden, dan zegt de kaart met de verliezende
    tijd anders iets wat niet gebeurt (zie de kop van kaarten.py).
    """
    data = hass.data.get(DOMAIN, {})
    opslag = data.get(DATA_OPSLAG)
    motor = data.get(DATA_MOTOR)
    melding = motor.meldingen.get(ident) if motor else None
    buiten = opslag.buiten(ident) if opslag else None
    return {
        "id": ident,
        "bekend": melding is not None,
        "aan": opslag.alle_aan(ident) if opslag else {},
        "buiten": buiten,
        "verstuurd": {m: opslag.verstuurd(ident, m) for m in MOMENTEN} if opslag else {},
        "tijden": dict(melding.tijden) if melding else None,
        "telefoons": {
            p["entity_id"]: (melding.diensten.get(p["entity_id"]) if melding else None) or p["dienst"]
            for p in telefoons.overzicht(hass)
        },
    }


@callback
def async_meld_aan_abonnees(hass: HomeAssistant, ident: str | None) -> None:
    """Stuur de nieuwe stand naar elke open kaart van deze melding (None = alle)."""
    for connection, msg_id, sub_id in list(hass.data.get(DOMAIN, {}).get(DATA_ABONNEES, [])):
        if ident is not None and sub_id != ident:
            continue
        try:
            connection.send_message(websocket_api.event_message(msg_id, stand(hass, sub_id)))
        except Exception:  # noqa: BLE001 - een verbinding die net wegviel
            _LOGGER.debug("Meldingenstand niet af te leveren aan %s", msg_id)


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/meldingen/subscribe", vol.Required("melding"): cv.string}
)
@callback
def ws_subscribe(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    data = hass.data.setdefault(DOMAIN, {})
    if DATA_OPSLAG not in data:
        connection.send_error(msg["id"], "not_allowed", "De meldingen zijn nog niet geladen")
        return
    abonnees = data.setdefault(DATA_ABONNEES, [])
    inschrijving = (connection, msg["id"], msg["melding"])
    abonnees.append(inschrijving)

    @callback
    def opzeggen() -> None:
        try:
            abonnees.remove(inschrijving)
        except ValueError:
            pass

    connection.subscriptions[msg["id"]] = opzeggen
    connection.send_result(msg["id"])
    connection.send_message(websocket_api.event_message(msg["id"], stand(hass, msg["melding"])))


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/meldingen/aan",
        vol.Required("melding"): cv.string,
        vol.Required("persoon"): vol.All(cv.string, vol.Match(r"^person\.")),
        vol.Required("aan"): bool,
    }
)
@callback
def ws_aan(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    opslag = hass.data.get(DOMAIN, {}).get(DATA_OPSLAG)
    if opslag is None:
        connection.send_error(msg["id"], "not_allowed", "De meldingen zijn nog niet geladen")
        return
    opslag.zet_aan(msg["melding"], msg["persoon"], msg["aan"])
    async_meld_aan_abonnees(hass, msg["melding"])
    connection.send_result(msg["id"], {"aan": msg["aan"]})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/meldingen/proef",
        vol.Required("melding"): cv.string,
        vol.Required("moment"): vol.In(MOMENTEN),
        # Niet `id` noemen: dat is het berichtnummer (valkuil 41).
        vol.Optional("persoon"): vol.All(cv.string, vol.Match(r"^person\.")),
    }
)
@websocket_api.async_response
async def ws_proef(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    motor = hass.data.get(DOMAIN, {}).get(DATA_MOTOR)
    if motor is None:
        connection.send_error(msg["id"], "not_allowed", "De meldingen zijn nog niet geladen")
        return
    # Vers lezen: de proef hoort bij de kaart zoals hij NU is opgeslagen.
    await motor.async_herlees()
    uitkomst = await motor.async_verstuur(
        msg["melding"], msg["moment"], proef=True, alleen=msg.get("persoon")
    )
    connection.send_result(msg["id"], uitkomst)
