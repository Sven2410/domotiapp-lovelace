"""De commando's van de bewaking, en het abonnement dat een open kaart bijwerkt.

| Commando | Wie |
|---|---|
| `bewaking/get` | iedere ingelogde gebruiker |
| `bewaking/save` | iedere ingelogde gebruiker |
| `bewaking/timeline` | iedere ingelogde gebruiker |
| `bewaking/subscribe` | iedere ingelogde gebruiker |

Niet admin-only, om dezelfde reden als bij de scenes: de klant draait Fully
Kiosk met een niet-adminaccount en moet zijn eigen camerakaart kunnen
instellen.

## De URL van een beeld wordt hier ondertekend en niet in de kaart samengesteld

De kaart krijgt een kant-en-klare `url` mee. Dat is met opzet: ondertekenen kan
alleen aan de serverkant, en het is meteen de plek waar de rechten liggen. Wie
dit commando mag aanroepen is ingelogd; wie de URL daarna heeft, heeft er twee
uur wat aan.
"""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.components.http.auth import async_sign_path
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv

from . import meldingen
from ..const import DOMAIN
from .const import (
    DATA_ABONNEES,
    DATA_INDEX,
    DATA_MOTOR,
    DATA_REGELS,
    DATA_WS_REGISTERED,
    EVENT_REGELS,
    GELDIG_KAART,
    MAX_LEEFTIJD,
    MAX_PER_CAMERA,
    STANDAARD_RUSTPERIODE,
    STANDAARD_WACHTTIJD,
    URL_PREFIX,
)
from .store import RegelFout, valideer_regel

_LOGGER = logging.getLogger(__name__)

# Hoeveel beelden de kaart hoogstens in één keer krijgt. De strook toont er een
# stuk of tien; meer opsturen kost een wandtablet geheugen aan miniaturen die
# niemand langsloopt.
STANDAARD_LIMIET = 60
MAX_LIMIET = 500


@callback
def async_register(hass: HomeAssistant) -> None:
    """Registreer de commando's, hooguit één keer per HA-run."""
    data = hass.data.setdefault(DOMAIN, {})
    if data.get(DATA_WS_REGISTERED):
        return

    websocket_api.async_register_command(hass, ws_get)
    websocket_api.async_register_command(hass, ws_save)
    websocket_api.async_register_command(hass, ws_timeline)
    websocket_api.async_register_command(hass, ws_subscribe)

    data[DATA_WS_REGISTERED] = True
    _LOGGER.debug("Bewakingscommando's geregistreerd")


# --------------------------------------------------------------------------
# Abonnees
# --------------------------------------------------------------------------


@callback
def async_meld_aan_abonnees(hass: HomeAssistant, soort: str, lading: dict[str, Any]) -> None:
    """Stuur een gebeurtenis naar elke open kaart.

    Nieuwe beelden krijgen hier hun ondertekende URL, per abonnee apart: de
    handtekening hangt aan de gebruiker die het abonnement opende, en die is
    per verbinding anders.
    """
    abonnees = hass.data.get(DOMAIN, {}).get(DATA_ABONNEES) or []
    if not abonnees:
        return

    for connection, msg_id, cameras in list(abonnees):
        bericht = _filter_voor(hass, soort, lading, cameras)
        if bericht is None:
            continue
        connection.send_message(
            websocket_api.event_message(msg_id, {"soort": soort, **bericht})
        )


@callback
def _filter_voor(
    hass: HomeAssistant, soort: str, lading: dict[str, Any], cameras: list[str] | None
) -> dict[str, Any] | None:
    """Wat deze abonnee van deze gebeurtenis moet zien, of None."""
    if soort == EVENT_REGELS:
        return dict(lading)

    if (beeld := lading.get("beeld")) is not None:
        if cameras is not None and beeld.get("camera") not in cameras:
            return None
        return {"beeld": _met_url(hass, beeld)}

    if (ids := lading.get("ids")) is not None:
        # Opruimen gaat ongefilterd door: een kaart die een ID niet kent, doet
        # er niets mee, en filteren zou een lijst met camera's per ID vergen die
        # er op dat moment juist niet meer is.
        return {"ids": list(ids)}

    return dict(lading)


# --------------------------------------------------------------------------
# Commando's
# --------------------------------------------------------------------------


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/bewaking/get",
        vol.Optional("camera"): cv.string,
    }
)
@callback
def ws_get(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """De regels, plus alles wat de editor nodig heeft om ze te tonen."""
    regels = hass.data.get(DOMAIN, {}).get(DATA_REGELS)
    if regels is None:
        connection.send_error(msg["id"], "not_loaded", "De integratie is niet geladen")
        return

    if (camera := msg.get("camera")) is not None:
        regel = regels.voor(camera)
        gevonden = {camera: regel.als_dict()} if regel else {}
    else:
        gevonden = {naam: regel.als_dict() for naam, regel in regels.alle().items()}

    connection.send_result(
        msg["id"],
        {
            "regels": gevonden,
            # De personen mét de dienst die erbij gevonden is, zodat de editor
            # kan tonen wélke telefoon er gebeld wordt in plaats van dat de
            # klant het moet geloven.
            "personen": meldingen.overzicht(hass),
            "standaard": {
                "rustperiode": STANDAARD_RUSTPERIODE,
                "wachttijd": STANDAARD_WACHTTIJD,
            },
            "grenzen": {
                "max_per_camera": MAX_PER_CAMERA,
                "max_dagen": MAX_LEEFTIJD.days,
            },
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/bewaking/save",
        vol.Required("regel"): dict,
    }
)
@websocket_api.async_response
async def ws_save(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Sla de regel van één camera op en zet de motor er meteen op."""
    data = hass.data.get(DOMAIN, {})
    regels = data.get(DATA_REGELS)
    if regels is None:
        connection.send_error(msg["id"], "not_loaded", "De integratie is niet geladen")
        return

    try:
        regel = valideer_regel(msg["regel"])
    except RegelFout as fout:
        connection.send_error(msg["id"], "invalid_format", str(fout))
        return

    await regels.async_zet(regel)

    # De motor luistert naar de melders van de actieve regels; die verzameling
    # is zojuist veranderd.
    if (motor := data.get(DATA_MOTOR)) is not None:
        motor.async_herzie()

    async_meld_aan_abonnees(hass, EVENT_REGELS, {"camera": regel.camera})
    connection.send_result(msg["id"], {"regel": regel.als_dict()})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/bewaking/timeline",
        vol.Optional("cameras"): [cv.string],
        vol.Optional("limiet"): vol.All(int, vol.Range(min=1, max=MAX_LIMIET)),
    }
)
@callback
def ws_timeline(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """De timeline, nieuwste eerst, met een ondertekende URL per beeld."""
    index = hass.data.get(DOMAIN, {}).get(DATA_INDEX)
    if index is None:
        connection.send_error(msg["id"], "not_loaded", "De integratie is niet geladen")
        return

    beelden = index.voor(
        msg.get("cameras"), msg.get("limiet", STANDAARD_LIMIET)
    )
    connection.send_result(
        msg["id"], {"beelden": [_met_url(hass, beeld) for beeld in beelden]}
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/bewaking/subscribe",
        vol.Optional("cameras"): [cv.string],
    }
)
@callback
def ws_subscribe(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Blijf op de hoogte van nieuwe en opgeruimde beelden."""
    data = hass.data.setdefault(DOMAIN, {})
    abonnees = data.setdefault(DATA_ABONNEES, [])
    inschrijving = (connection, msg["id"], msg.get("cameras"))
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


@callback
def _met_url(hass: HomeAssistant, beeld: dict[str, Any]) -> dict[str, Any]:
    """Hetzelfde beeld, met een ondertekende URL erbij.

    Twee uur geldig. De kaart vraagt de timeline op het moment dat hij hem
    toont, dus dat is ruim; en een URL die uit een schermafdruk of een
    browsergeschiedenis lekt, is daarna niets meer waard.
    """
    return {
        **beeld,
        "url": async_sign_path(hass, f"{URL_PREFIX}/{beeld['id']}", GELDIG_KAART),
    }
