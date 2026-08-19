"""De alarmcode van DomotiApp: opslaan, controleren, en niet te raden.

## Waarom deze code aan de serverkant staat

Een code die de kaart kent, staat in de dashboardconfig van de klant. Die is met
één rechterklik te lezen, staat in elke backup, en gaat mee als je het dashboard
deelt. Dat is geen code maar een sticker op de deur.

Dus: de code staat hier, gehasht met PBKDF2-HMAC-SHA256 en een eigen salt. Wat
er op schijf terechtkomt is niet terug te rekenen naar de code zelf, en de kaart
krijgt hem nooit te zien -- die stuurt wat er ingetikt is en hoort alleen "ja" of
"nee".

## Wat dit WEL en NIET is

Het is een slot op de kaart, niet op Home Assistant. Wie in Home Assistant kan
komen, kan `alarm_control_panel.alarm_disarm` ook rechtstreeks aanroepen via de
ontwikkelaarstools -- daar gaat geen enkele dashboardkaart iets aan veranderen.
Dit houdt tegen dat iemand die langsloopt het alarm van de muur af uitzet, en dat
is precies waar hij voor bedoeld is. Wil je een slot dat óók tegen een ingelogde
gebruiker beschermt, dan hoort de code in het alarmsysteem zelf (of in een
integratie als Alarmo) en stuurt de kaart hem door -- dat kan deze kaart ook, en
dan staat `code_format` op de entiteit.

## Raden

Een code van vier cijfers is in tienduizend pogingen te raden, en een computer
doet dat in een seconde. Vandaar de teller: vijf misgeslagen pogingen binnen een
minuut en er gaat een minuut lang niets meer doorheen. Die teller staat in het
geheugen en niet op schijf -- na een herstart mag je opnieuw, want een herstart
is duurder dan vijf pogingen.
"""

from __future__ import annotations

import hashlib
import hmac
import logging
import os
import time
from typing import Any, Final

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.storage import Store

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

DATA_CODE_STORE: Final = "panel_code_store"
DATA_CODE_WS_REGISTERED: Final = "panel_code_ws_registered"

STORAGE_KEY: Final = f"{DOMAIN}.panel_code"
STORAGE_VERSION: Final = 1

# 210.000 rondes is wat OWASP voor PBKDF2-HMAC-SHA256 aanhoudt. Het kost hier
# ongeveer een tiende seconde per controle, en dat gebeurt in een executor --
# de event loop mag er niet op wachten.
ITERATIES: Final = 210_000
SALT_BYTES: Final = 16

# De pogingsteller.
MAX_POGINGEN: Final = 5
POGING_VENSTER: Final = 60.0

TYPE_STATUS: Final = f"{DOMAIN}/panel/code/status"
TYPE_VERIFY: Final = f"{DOMAIN}/panel/code/verify"


class TeVeelPogingen(Exception):
    """Er is te vaak achter elkaar een verkeerde code ingevoerd."""


def _hash(code: str, salt: bytes, iteraties: int) -> str:
    return hashlib.pbkdf2_hmac("sha256", code.encode("utf-8"), salt, iteraties).hex()


class PaneelCodeStore:
    """De opgeslagen alarmcode, gehasht."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict[str, Any] | None = None
        self._mislukt: list[float] = []

    async def async_load(self) -> None:
        self._data = await self._store.async_load() or None

    @property
    def heeft_code(self) -> bool:
        return bool(self._data and self._data.get("hash"))

    async def async_zet_code(self, code: str | None) -> None:
        """Zet een nieuwe code, of wis hem met `None`.

        Het salt is nieuw bij elke wijziging: hergebruik zou verraden dat twee
        opeenvolgende codes gelijk zijn.
        """
        if not code:
            self._data = None
            await self._store.async_remove()
            self._mislukt.clear()
            _LOGGER.debug("Alarmcode gewist")
            return

        salt = os.urandom(SALT_BYTES)
        gehasht = await self.hass.async_add_executor_job(_hash, code, salt, ITERATIES)
        self._data = {
            "hash": gehasht,
            "salt": salt.hex(),
            "iterations": ITERATIES,
            "algorithm": "pbkdf2_sha256",
        }
        await self._store.async_save(self._data)
        self._mislukt.clear()
        _LOGGER.debug("Alarmcode ingesteld")

    def _te_vaak(self) -> bool:
        grens = time.monotonic() - POGING_VENSTER
        self._mislukt = [t for t in self._mislukt if t > grens]
        return len(self._mislukt) >= MAX_POGINGEN

    async def async_controleer(self, code: str) -> bool:
        """Klopt deze code? Gooit `TeVeelPogingen` na te veel missers."""
        if not self.heeft_code:
            return False
        if self._te_vaak():
            raise TeVeelPogingen

        data = self._data or {}
        gehasht = await self.hass.async_add_executor_job(
            _hash,
            code,
            bytes.fromhex(data["salt"]),
            int(data.get("iterations", ITERATIES)),
        )
        # `compare_digest` en niet `==`: een gewone vergelijking stopt bij het
        # eerste verschillende teken, en dat verschil is meetbaar.
        goed = hmac.compare_digest(gehasht, str(data.get("hash", "")))
        if goed:
            self._mislukt.clear()
        else:
            self._mislukt.append(time.monotonic())
        return goed


def _store(hass: HomeAssistant) -> PaneelCodeStore:
    return hass.data[DOMAIN][DATA_CODE_STORE]


@websocket_api.websocket_command({vol.Required("type"): TYPE_STATUS})
@callback
def _handle_status(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Is er een code ingesteld? Meer geeft dit commando niet prijs."""
    connection.send_result(msg["id"], {"has_code": _store(hass).heeft_code})


@websocket_api.websocket_command(
    {vol.Required("type"): TYPE_VERIFY, vol.Required("code"): cv.string}
)
@websocket_api.async_response
async def _handle_verify(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Klopt deze code?

    Bewust géén `require_admin`: klanten bedienen hun alarm vanaf een tablet met
    een niet-admin account, en juist zij moeten hun alarm uit kunnen zetten.
    """
    try:
        goed = await _store(hass).async_controleer(msg["code"])
    except TeVeelPogingen:
        connection.send_error(
            msg["id"],
            "te_veel_pogingen",
            "Te vaak een verkeerde code. Wacht een minuut en probeer het opnieuw.",
        )
        return
    connection.send_result(msg["id"], {"ok": goed})


_COMMANDOS = (_handle_status, _handle_verify)


@callback
def async_register(hass: HomeAssistant) -> None:
    """Registreer de commando's, één keer per HA-run."""
    data = hass.data.setdefault(DOMAIN, {})
    if data.get(DATA_CODE_WS_REGISTERED):
        return
    for commando in _COMMANDOS:
        websocket_api.async_register_command(hass, commando)
    data[DATA_CODE_WS_REGISTERED] = True
