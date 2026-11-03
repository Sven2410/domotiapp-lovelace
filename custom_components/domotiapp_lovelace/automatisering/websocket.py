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
    MAX_DELEN,
    MAX_FAVORIETEN,
    MAX_LAMPEN_PER_REGEL,
    MAX_NAAM,
    MAX_REGELS,
    MAX_URI,
    MAX_VERSCHIL_MIN,
    MEDIA_SOORTEN,
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

_APPARAAT = vol.All(cv.string, vol.Match(r"^(light|cover|media_player)\."))
# Wat er speelt, uit het zoeken in Music Assistant. Eén per regel of favoriet, voor al zijn speakers.
_MEDIA = vol.Schema(
    {
        vol.Required("uri"): vol.All(cv.string, vol.Length(min=1, max=MAX_URI)),
        vol.Optional("naam", default=""): vol.All(cv.string, vol.Length(max=200)),
        vol.Optional("soort"): vol.In(MEDIA_SOORTEN),
        vol.Optional("beeld"): vol.All(cv.string, vol.Length(max=2000)),
    }
)
_APPARATEN = vol.All([_APPARAAT], vol.Length(min=1, max=MAX_LAMPEN_PER_REGEL))

_FAVORIET = vol.Schema(
    {
        vol.Optional("id"): cv.string,
        vol.Required("naam"): vol.All(cv.string, vol.Length(min=1, max=MAX_NAAM)),
        vol.Optional("icoon", default="star"): vol.All(cv.string, vol.Length(max=40)),
        vol.Required("lampen"): _APPARATEN,
        # 0 is uit of dicht. Een lamp die er niet in staat, gaat alleen aan. Bij een speaker is het het volume, en 0 stoppen.
        vol.Optional("helderheden", default=dict): {_APPARAAT: vol.All(int, vol.Range(min=0, max=100))},
        vol.Optional("media"): vol.Any(None, _MEDIA),
    }
)

# Een onderdeel van een regel (sinds 0.102.0): wat er gebeurt en wanneer. Zie de kop van regels.py.
_DEEL = vol.Schema(
    {
        vol.Optional("id"): vol.All(cv.string, vol.Length(max=40)),
        vol.Required("lampen"): _APPARATEN,
        vol.Optional("helderheden"): {_APPARAAT: vol.All(int, vol.Range(min=1, max=100))},
        vol.Optional("aan"): _MOMENT,
        vol.Optional("uit"): _MOMENT,
        vol.Optional("media"): vol.Any(None, _MEDIA),
    }
)

_REGEL = vol.Schema(
    {
        # Geen `id` als sleutel op het bericht zelf (valkuil 41); binnen de regel kan dat wel.
        vol.Optional("id"): cv.string,
        vol.Optional("naam"): vol.All(cv.string, vol.Length(max=MAX_NAAM)),
        # Of `lampen` met aan en uit, of `delen`: dat toetst ws_opslaan.
        vol.Optional("lampen"): _APPARATEN,
        vol.Optional("helderheid", default=100): vol.All(int, vol.Range(min=1, max=100)),
        vol.Optional("helderheden"): {_APPARAAT: vol.All(int, vol.Range(min=1, max=100))},
        vol.Optional("aan"): _MOMENT,
        vol.Optional("uit"): _MOMENT,
        vol.Optional("delen"): vol.All([_DEEL], vol.Length(min=1, max=MAX_DELEN)),
        vol.Required("dagen"): vol.All([vol.All(int, vol.Range(min=0, max=6))], vol.Length(min=1, max=7), vol.Unique()),
        vol.Optional("vakantie", default=False): bool,
        vol.Optional("media"): vol.Any(None, _MEDIA),
    }
)


def _met_media(nieuw: dict[str, Any]) -> dict[str, Any]:
    """`media` alleen als er een speaker in staat; anders blijft er niets van over in de opslag."""
    if nieuw.get("media") and any(lamp.startswith("media_player.") for lamp in nieuw["lampen"]):
        return {"media": nieuw["media"]}
    return {"media": None} if "media" in nieuw else {}


def _deel(nieuw: dict[str, Any]) -> dict[str, Any]:
    """Wat er van één onderdeel (of een regel zonder onderdelen) in de opslag komt."""
    return {
        "lampen": nieuw["lampen"],
        "aan": nieuw.get("aan"),
        "uit": nieuw.get("uit"),
        **(
            {"helderheden": {lamp: pct for lamp, pct in nieuw["helderheden"].items() if lamp in nieuw["lampen"]}}
            if "helderheden" in nieuw
            else {}
        ),
        **_met_media(nieuw),
    }


def _delen(nieuw: dict[str, Any]) -> list[dict[str, Any]]:
    """De onderdelen met een vast id: dat van de kaart als het er een is, anders een nieuw."""
    uit: list[dict[str, Any]] = []
    gezien: set[str] = set()
    for deel in nieuw["delen"]:
        deel_id = str(deel.get("id") or "")
        # Een id dat dubbel komt of vreemde tekens heeft, wordt een nieuw; anders botsen twee onderdelen in `brandt`.
        if not deel_id or deel_id in gezien or not deel_id.isalnum():
            deel_id = uuid4().hex[:8]
        gezien.add(deel_id)
        uit.append({"id": deel_id, **_deel(deel)})
    return uit


@callback
def async_register(hass: HomeAssistant) -> None:
    """Registreer de commando's, hooguit één keer per HA-run."""
    data = hass.data.setdefault(DOMAIN, {})
    if data.get(DATA_WS_REGISTERED):
        return
    websocket_api.async_register_command(hass, ws_stand)
    websocket_api.async_register_command(hass, ws_subscribe)
    websocket_api.async_register_command(hass, ws_opslaan)
    websocket_api.async_register_command(hass, ws_verwijder)
    websocket_api.async_register_command(hass, ws_actief)
    websocket_api.async_register_command(hass, ws_vakantie)
    websocket_api.async_register_command(hass, ws_favoriet_opslaan)
    websocket_api.async_register_command(hass, ws_favoriet_verwijder)
    websocket_api.async_register_command(hass, ws_favoriet_uitvoeren)
    data[DATA_WS_REGISTERED] = True


@callback
def stand(hass: HomeAssistant) -> dict[str, Any]:
    """Alles wat een kaart moet weten. `brandt` en `laatst` blijven hier: die zijn van de motor."""
    data = hass.data.get(DOMAIN, {})
    opslag = data.get(DATA_OPSLAG)
    motor = data.get(DATA_MOTOR)
    return {
        "regels": opslag.regels if opslag else [],
        "favorieten": opslag.favorieten if opslag else [],
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


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/automatisering/stand"})
@callback
def ws_stand(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Eén keer de stand, zonder abonnement: voor gereedschap dat geen gebeurtenissen kan lezen."""
    if _motor_of_fout(hass, connection, msg) is None:
        return
    connection.send_result(msg["id"], stand(hass))


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
    nieuw = dict(msg["regel"])
    # Eén onderdeel is een gewone regel; zo staat een regel maar op één manier in de opslag.
    if len(nieuw.get("delen") or []) == 1:
        enig = nieuw.pop("delen")[0]
        enig.pop("id", None)
        nieuw = {**{k: v for k, v in nieuw.items() if k not in ("helderheden", "media")}, **enig}
        nieuw.setdefault("aan", None)
        nieuw.setdefault("uit", None)
    delen = nieuw.get("delen")
    if delen is None and "lampen" not in nieuw:
        connection.send_error(msg["id"], "invalid_format", t(hass, "Kies minstens één lamp"))
        return
    if not all(d.get("aan") or d.get("uit") for d in delen or [nieuw]):
        connection.send_error(msg["id"], "invalid_format", t(hass, "Kies een moment om aan of uit te gaan"))
        return
    lampen = list(dict.fromkeys(lamp for d in delen or [nieuw] for lamp in d["lampen"]))
    # Een lamp die al in deze regel stond mag blijven: anders is een regel niet
    # meer aan te passen zodra één van zijn lampen van de kaart gehaald is.
    bestaand = next((r for r in motor.opslag.regels if r["id"] == nieuw.get("id")), None)
    mag = motor.toegestaan | set(bestaand["lampen"] if bestaand else [])
    if not set(lampen) <= mag:
        connection.send_error(msg["id"], "not_allowed", t(hass, "Deze lamp staat niet op de kaart"))
        return
    if bestaand is None and len(motor.opslag.regels) >= MAX_REGELS:
        connection.send_error(msg["id"], "not_allowed", t(hass, "Er staan te veel automatiseringen"))
        return
    if delen is None:
        inhoud = {**nieuw, **_deel(nieuw)}
    else:
        # Met onderdelen staat er bovenaan alleen wat voor de hele regel geldt, en `lampen` voor de kaart.
        inhoud = {
            **{k: v for k, v in nieuw.items() if k not in ("helderheid", "helderheden", "media")},
            "lampen": lampen,
            "aan": None,
            "uit": None,
            "delen": _delen(nieuw),
        }
    regel = {
        **inhoud,
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


# ------------------------------------------------------------------ de favorieten


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/automatisering/favoriet_opslaan", vol.Required("favoriet"): _FAVORIET}
)
@callback
def ws_favoriet_opslaan(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    motor = _motor_of_fout(hass, connection, msg)
    if motor is None:
        return
    nieuw = msg["favoriet"]
    bestaand = next((f for f in motor.opslag.favorieten if f["id"] == nieuw.get("id")), None)
    # Dezelfde grens als bij een regel: wat al in deze favoriet stond, mag blijven.
    mag = motor.toegestaan | set(bestaand["lampen"] if bestaand else [])
    if not set(nieuw["lampen"]) <= mag:
        connection.send_error(msg["id"], "not_allowed", t(hass, "Deze lamp staat niet op de kaart"))
        return
    if bestaand is None and len(motor.opslag.favorieten) >= MAX_FAVORIETEN:
        connection.send_error(msg["id"], "not_allowed", t(hass, "Er staan te veel favorieten"))
        return
    favoriet = {
        **nieuw,
        "helderheden": {lamp: pct for lamp, pct in nieuw["helderheden"].items() if lamp in nieuw["lampen"]},
        **_met_media(nieuw),
        "id": bestaand["id"] if bestaand else uuid4().hex[:12],
    }
    motor.opslag.zet_favoriet(favoriet)
    async_meld_aan_abonnees(hass)
    connection.send_result(msg["id"], {"favoriet": favoriet})


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/automatisering/favoriet_verwijder", vol.Required("favoriet"): cv.string}
)
@callback
def ws_favoriet_verwijder(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    motor = _motor_of_fout(hass, connection, msg)
    if motor is None:
        return
    if not motor.opslag.verwijder_favoriet(msg["favoriet"]):
        connection.send_error(msg["id"], "not_found", t(hass, "Deze favoriet bestaat niet meer"))
        return
    async_meld_aan_abonnees(hass)
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/automatisering/favoriet_uitvoeren", vol.Required("favoriet"): cv.string}
)
@callback
def ws_favoriet_uitvoeren(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    motor = _motor_of_fout(hass, connection, msg)
    if motor is None:
        return
    favoriet = next((f for f in motor.opslag.favorieten if f["id"] == msg["favoriet"]), None)
    if favoriet is None:
        connection.send_error(msg["id"], "not_found", t(hass, "Deze favoriet bestaat niet meer"))
        return
    connection.send_result(msg["id"], {"geschakeld": motor.voer_favoriet_uit(favoriet)})

