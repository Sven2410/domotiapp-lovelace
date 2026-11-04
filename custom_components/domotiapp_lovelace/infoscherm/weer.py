"""Het weer op het infoscherm als de weerintegratie wegvalt (sinds 0.105.0).

De eigenaar, 4 november 2026: bij een klant was de Met.no-integratie een uur `unavailable`, en het scherm bij de receptie
toonde geen weer. Gemeten: de update van 07:51 mislukte, en Met.no probeert het pas het uur erna opnieuw. Hij vroeg of
lovelace de integratie kan herladen, en daarna: "ja bouw alles". Twee dingen dus.

## Het laatst bekende weer

Elke minuut kijkt `Weerwacht` naar de weerentiteit van het infoscherm (`installatie.weer`). Is er een nieuwe stand, dan
bewaart hij die met de uur- en dagvoorspelling (`weather.get_forecasts`), in een eigen opslag, zodat het ook een herstart
overleeft. Valt de entiteit weg, dan vraagt de kaart dit op (`infoscherm/weer`) en toont het met "bijgewerkt om".

## Herladen, met grenzen

- **Alleen de integratie achter de weerentiteit van het infoscherm.** Nooit iets anders: een Zigbee of een meterkast
  herladen omdat er iets wegvalt, wil niemand automatisch.
- **Pas na 10 minuten `unavailable`** (`HERLAAD_NA`). Een korte hapering lost zichzelf op.
- **Hooguit één keer per uur** per integratie (`HERLAAD_HOOGSTENS`). Is het internet weg, dan helpt herladen niet, en
  dan hoort het niet elke tien minuten te gebeuren. Lukt het opzetten niet, dan probeert Home Assistant het zelf opnieuw.
- **Alleen als de integratie geladen is** (of bij het opzetten vastliep). Bij `setup_retry` is Home Assistant al bezig.
- **Een regel in het log**, met de integratie en hoe lang hij al weg was.

Wanneer het voor het laatst gebeurde, staat niet in de opslag: een herstart herlaadt alles al.
"""

from __future__ import annotations

from datetime import datetime, timedelta
import logging
from typing import Any, Callable

from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from ..const import DOMAIN

_LOGGER = logging.getLogger(__name__)

STORAGE_KEY = f"{DOMAIN}.infoscherm_weer"
STORAGE_VERSION = 1
KIJK_ELKE = timedelta(minutes=1)
HERLAAD_NA = timedelta(minutes=10)
HERLAAD_HOOGSTENS = timedelta(hours=1)
MAX_UREN = 48
MAX_DAGEN = 8
# Wat het scherm van een voorspelling gebruikt; de rest hoeft niet in de opslag.
_VOORSPELLING = ("datetime", "condition", "temperature", "templow")
_NU = ("temperature", "humidity", "wind_speed", "wind_speed_unit")


def _voorspelling(lijst: Any, max_aantal: int) -> list[dict[str, Any]]:
    if not isinstance(lijst, list):
        return []
    return [{k: f[k] for k in _VOORSPELLING if k in f} for f in lijst[:max_aantal] if isinstance(f, dict)]


class Weerwacht:
    """Bewaart het laatste goede weer, en herlaadt de weerintegratie die blijft hangen."""

    def __init__(self, hass: HomeAssistant, entiteit: Callable[[], str | None]) -> None:
        self.hass = hass
        self._entiteit = entiteit
        self._opslag: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._laatst: dict[str, Any] | None = None
        self._gezien: datetime | None = None
        self._herladen: dict[str, datetime] = {}
        self._bezig = False
        self._stop: Callable[[], None] | None = None

    async def async_start(self) -> None:
        bewaard = await self._opslag.async_load()
        self._laatst = bewaard if isinstance(bewaard, dict) and bewaard.get("entiteit") else None
        self._stop = async_track_time_interval(self.hass, self._async_kijk, KIJK_ELKE)
        await self._async_kijk()

    @callback
    def async_stop(self) -> None:
        if self._stop is not None:
            self._stop()
            self._stop = None

    def laatst(self) -> dict[str, Any] | None:
        """Het laatst bekende weer van de weerentiteit van nu, of None."""
        if self._laatst and self._laatst.get("entiteit") == self._entiteit():
            return self._laatst
        return None

    async def _async_kijk(self, _nu: datetime | None = None) -> None:
        if self._bezig:
            return
        self._bezig = True
        try:
            entiteit = self._entiteit()
            st = self.hass.states.get(entiteit) if entiteit else None
            if st is None:
                return
            if st.state not in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                if st.last_updated != self._gezien or self.laatst() is None:
                    await self._async_bewaar(entiteit, st)
                return
            if st.state == STATE_UNAVAILABLE:
                await self._async_misschien_herladen(entiteit, dt_util.utcnow() - st.last_changed)
        finally:
            self._bezig = False

    async def _async_bewaar(self, entiteit: str, st) -> None:
        voorspelling = {}
        for soort, max_aantal in (("hourly", MAX_UREN), ("daily", MAX_DAGEN)):
            try:
                antwoord = await self.hass.services.async_call(
                    "weather",
                    "get_forecasts",
                    {"entity_id": entiteit, "type": soort},
                    blocking=True,
                    return_response=True,
                )
                voorspelling[soort] = _voorspelling((antwoord or {}).get(entiteit, {}).get("forecast"), max_aantal)
            except Exception:  # noqa: BLE001 - een weerbron zonder deze voorspelling, of die net wegvalt
                voorspelling[soort] = []
        self._gezien = st.last_updated
        self._laatst = {
            "entiteit": entiteit,
            "tijd": st.last_updated.isoformat(),
            "nu": {"state": st.state, **{k: st.attributes[k] for k in _NU if k in st.attributes}},
            "uren": voorspelling["hourly"],
            "dagen": voorspelling["daily"],
        }
        self._opslag.async_delay_save(lambda: self._laatst, 10)

    async def _async_misschien_herladen(self, entiteit: str, weg: timedelta) -> None:
        if weg < HERLAAD_NA:
            return
        registratie = er.async_get(self.hass).async_get(entiteit)
        entry = self.hass.config_entries.async_get_entry(registratie.config_entry_id) if registratie and registratie.config_entry_id else None
        if entry is None or entry.state not in (ConfigEntryState.LOADED, ConfigEntryState.SETUP_ERROR):
            return
        nu = dt_util.utcnow()
        vorige = self._herladen.get(entry.entry_id)
        if vorige is not None and nu - vorige < HERLAAD_HOOGSTENS:
            return
        self._herladen[entry.entry_id] = nu
        _LOGGER.warning(
            "Het weer van het infoscherm (%s) is al %d minuten niet beschikbaar: integratie %s (%s) wordt herladen",
            entiteit,
            weg.total_seconds() // 60,
            entry.title,
            entry.domain,
        )
        try:
            await self.hass.config_entries.async_reload(entry.entry_id)
        except Exception:  # noqa: BLE001 - herladen is een poging; Home Assistant meldt zelf wat er misging
            _LOGGER.exception("Herladen van %s lukte niet", entry.title)
