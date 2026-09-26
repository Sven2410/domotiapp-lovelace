"""Wat de meldingen onthouden: wie er aan staat, en wat er al gebeurd is.

De INSTELLINGEN staan hier niet; die staan in de dashboards (zie `kaarten.py`).
Hier staat alleen wat de kaart niet kan bewaren:

| sleutel | wat |
|---|---|
| `aan` | per melding, per persoon: krijgt hij hem? Standaard ja |
| `buiten` | per melding: voor welke ophaaldag iemand "Staat buiten" tikte, en wie |
| `verstuurd` | per melding, per moment: op welke dag hij al is uitgegaan |

`verstuurd` is er zodat een herstart om 19:30:10 geen tweede melding oplevert.
"""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_VERSION

_LOGGER = logging.getLogger(__name__)

# Een toggle schrijft binnen een seconde weg: wie hem omzet en meteen de app
# sluit, hoort hem bij terugkomst nog zo te zien staan.
OPSLAAN_NA = 1


class MeldingOpslag:
    """De staat van alle meldingen, in één bestand."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict[str, Any] = {"aan": {}, "buiten": {}, "verstuurd": {}}

    async def async_load(self) -> None:
        rauw = await self._store.async_load()
        if not isinstance(rauw, dict):
            return
        for sleutel in ("aan", "buiten", "verstuurd"):
            waarde = rauw.get(sleutel)
            if isinstance(waarde, dict):
                self._data[sleutel] = waarde
            else:
                _LOGGER.warning("Meldingenopslag: %r ontbreekt of is geen object; leeg begonnen", sleutel)

    @callback
    def _bewaar(self) -> None:
        self._store.async_delay_save(lambda: self._data, OPSLAAN_NA)

    # ---------------------------------------------------------------- aan/uit

    @callback
    def aan(self, melding: str, persoon: str) -> bool:
        """Krijgt deze persoon deze melding? Wie nog nooit is omgezet: ja."""
        return bool(self._data["aan"].get(melding, {}).get(persoon, True))

    @callback
    def alle_aan(self, melding: str) -> dict[str, bool]:
        return dict(self._data["aan"].get(melding, {}))

    @callback
    def zet_aan(self, melding: str, persoon: str, aan: bool) -> None:
        self._data["aan"].setdefault(melding, {})[persoon] = bool(aan)
        self._bewaar()

    # ----------------------------------------------------------------- buiten

    @callback
    def buiten(self, melding: str) -> dict[str, Any] | None:
        waarde = self._data["buiten"].get(melding)
        return dict(waarde) if isinstance(waarde, dict) else None

    @callback
    def zet_buiten(self, melding: str, datum: str, door: str | None, om: str) -> None:
        self._data["buiten"][melding] = {"datum": datum, "door": door, "om": om}
        self._bewaar()

    # -------------------------------------------------------------- verstuurd

    @callback
    def verstuurd(self, melding: str, moment: str) -> str | None:
        return self._data["verstuurd"].get(melding, {}).get(moment)

    @callback
    def zet_verstuurd(self, melding: str, moment: str, datum: str) -> None:
        self._data["verstuurd"].setdefault(melding, {})[moment] = datum
        self._bewaar()
