"""De commando's van de automatiseringskaart.

Iedere ingelogde gebruiker mag ze: de klant is meestal geen beheerder, en juist
daarom bestaat deze kaart. De grens zit in wat er gekozen kan worden: een regel
kan alleen lampen noemen die een beheerder op een kaart zette, en dat toetst de
server hier zelf, niet de kaart.
"""

from __future__ import annotations

import logging
from typing import Any
from uuid import uuid4

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv

from ..const import DOMAIN
from ..taal import t
from .const import (
    DATA_ABONNEES,
    DATA_MOTOR,
    DATA_OPSLAG,
    DATA_WS_REGISTERED,
    MAX_REGELS,
    MAX_VERSCHIL_MIN,
    SOORT_TIJD,
    SOORT_ZONSONDERGANG,
    SOORT_ZONSOPKOMST,
)

_LOGGER = logging.getLogger(__name__)

_TIJD = vol.Match(r"^([01]\d|2[0-3]):[0-5]\d$")
_MOMENT = vol.Any(
    None,
    vol.Schema({vol.Required("soort"): SOORT_TIJD, vol.Required("tijd"): _TIJD}),
    vol.Schema(
        {
            vol.Required("soort"): vol.In((SOORT_ZONSOPKOMST, SOORT_ZONSONDERGANG)),
            vol.Optional("verschil", default=0): vol.All(
                int, vol.Range(min=-MAX_VERSCHIL_MIN, max=MAX_VERSCHIL_MIN)
            ),
        }
    ),
)

_REGEL = vol.Schema(
    {
        # Geen `id` als sleutel op het bericht zelf (valkuil 41); binnen de regel kan dat wel.
        vol.Optional("id"): cv.string,
        vol.Required("lampen"): vol.All([vol.All(cv.string, vol.Match(r"^light\."))], vol.Length(min=1, max=50)),
        vol.Optional("helderheid", default=100): vol.All(int, vol.Range(min=1, max=100)),
        vol.Optional("aan"): _MOMENT,
        vol.Optional("uit"): _MOMENT,
        vol.Required("dagen"): vol.All([vol.All(int, vol.Range(min=0, max=6))], vol.Length(min=1, max=7), vol.Unique()),
        vol.Optional("vakantie", default=False): bool,
    }
)


@callback
def async_register(hass: HomeAssistant) -> None:
    """Registreer de commando's, hooguit één keer per HA-run."""
    data = hass.data.setdefault(DOMAIN, {})
    if data.get(DATA_WS_REGISTERED):
        return
    websocket_api.async_register_command(hass, ws_subscribe)
    websocket_api.async_register_command(hass, ws_opslaan)
    websocket_api.async_register_command(hass, ws_verwijder)
    websocket_api.async_register_command(hass, ws_actief)
    websocket_api.async_register_command(hass, ws_vakantie)
    data[DATA_WS_REGISTERED] = True


@callback
def stand(hass: HomeAssistant) -> dict[str, Any]:
    """Alles wat een kaart moet weten. `brandt` en `laatst` blijven hier: die zijn van de motor."""
    data = hass.data.get(DOMAIN, {})
    opslag = data.get(DATA_OPSLAG)
    motor = data.get(DATA_MOTOR)
    return {
        "regels": opslag.regels if opslag else [],
        "vakantie": opslag.vakantie if opslag else False,
        "gekoppeld": motor.gekoppeld if motor else None,
    }


@callback
def async_meld_aan_abonnees(hass: HomeAssistant) -> None:
    """Stuur de nieuwe stand naar elke open kaart."""
    for connection, msg_id in list(hass.data.get(DOMAIN, {}).get(DATA_ABONNEES, [])):
        try:
            connection.send_message(websocket_api.event_message(msg_id, stand(hass)))
        except Exception:  # noqa: BLE001 - een verbinding die net wegviel
            _LOGGER.debug("Automatiseringsstand niet af te leveren aan %s", msg_id)


def _motor_of_fout(hass: HomeAssistant, connection, msg: dict[str, Any]):
    motor = hass.data.get(DOMAIN, {}).get(DATA_MOTOR)
    if motor is None:
        connection.send_error(msg["id"], "not_allowed", t(hass, "De automatiseringen zijn nog niet geladen"))
    return motor


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/automatisering/subscribe"})
@callback
def ws_subscribe(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    if _motor_of_fout(hass, connection, msg) is None:
        return
    abonnees = hass.data[DOMAIN].setdefault(DATA_ABONNEES, [])
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
    connection.send_message(websocket_api.event_message(msg["id"], stand(hass)))


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/automatisering/opslaan", vol.Required("regel"): _REGEL}
)
@callback
def ws_opslaan(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    motor = _motor_of_fout(hass, connection, msg)
    if motor is None:
        return
    nieuw = msg["regel"]
    if not (nieuw.get("aan") or nieuw.get("uit")):
        connection.send_error(msg["id"], "invalid_format", t(hass, "Kies een moment om aan of uit te gaan"))
        return
    # Een lamp die al in deze regel stond mag blijven: anders is een regel niet
    # meer aan te passen zodra één van zijn lampen van de kaart gehaald is.
    bestaand = next((r for r in motor.opslag.regels if r["id"] == nieuw.get("id")), None)
    mag = motor.toegestaan | set(bestaand["lampen"] if bestaand else [])
    if not set(nieuw["lampen"]) <= mag:
        connection.send_error(msg["id"], "not_allowed", t(hass, "Deze lamp staat niet op de kaart"))
        return
    if bestaand is None and len(motor.opslag.regels) >= MAX_REGELS:
        connection.send_error(msg["id"], "not_allowed", t(hass, "Er staan te veel automatiseringen"))
        return
    regel = {
        **nieuw,
        "aan": nieuw.get("aan"),
        "uit": nieuw.get("uit"),
        "dagen": sorted(nieuw["dagen"]),
        "id": bestaand["id"] if bestaand else uuid4().hex[:12],
        "actief": bestaand.get("actief", True) if bestaand else True,
        # Een bestaande regel wisselt niet van groep: zijn plek op de kaart zegt het.
        "vakantie": bestaand.get("vakantie", False) if bestaand else nieuw["vakantie"],
    }
    motor.opslag.zet_regel(regel)
    motor.regels_gewijzigd()
    connection.send_result(msg["id"], {"regel": regel})


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/automatisering/verwijder", vol.Required("regel"): cv.string}
)
@callback
def ws_verwijder(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    motor = _motor_of_fout(hass, connection, msg)
    if motor is None:
        return
    if not motor.opslag.verwijder_regel(msg["regel"]):
        connection.send_error(msg["id"], "not_found", t(hass, "Deze automatisering bestaat niet meer"))
        return
    motor.regels_gewijzigd()
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/automatisering/actief",
        vol.Required("regel"): cv.string,
        vol.Required("actief"): bool,
    }
)
@callback
def ws_actief(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    motor = _motor_of_fout(hass, connection, msg)
    if motor is None:
        return
    regel = next((r for r in motor.opslag.regels if r["id"] == msg["regel"]), None)
    if regel is None:
        connection.send_error(msg["id"], "not_found", t(hass, "Deze automatisering bestaat niet meer"))
        return
    motor.opslag.zet_regel({**regel, "actief": msg["actief"]})
    motor.regels_gewijzigd()
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/automatisering/vakantie", vol.Required("aan"): bool}
)
@websocket_api.async_response
async def ws_vakantie(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    motor = _motor_of_fout(hass, connection, msg)
    if motor is None:
        return
    await motor.async_zet_vakantie(msg["aan"])
    connection.send_result(msg["id"])
