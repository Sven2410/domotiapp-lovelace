"""Wat de automatiseringen onthouden. Alles staat hier, zodat het een herstart overleeft.

| sleutel | wat |
|---|---|
| `regels` | de regels; zie `regels.py` |
| `vakantie` | staat de vakantiemodus aan? |
| `laatst` | tot waar de klok is gekomen; zie hieronder |
| `brandt` | de regels die hun lamp aan zetten en nog niet uit |

**`laatst` wordt niet elke minuut weggeschreven**, want dat is elke minuut naar de
schijf van een Raspberry Pi. Hij gaat mee zodra er iets uitgevoerd of gewijzigd
is, en bij het afsluiten. Dat is genoeg: valt de stroom weg, dan staat er een oud
tijdstip, maar tussen dat tijdstip en de stroomstoring is niets uitgevoerd, anders
was het nieuwer geweest. Er komt dus niets dubbel, en er valt niets weg.

`brandt` is er voor de pauze: zie `Motor._voer_uit`.
"""

from __future__ import annotations

from datetime import datetime
import logging
from typing import Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import STORAGE_KEY, STORAGE_VERSION

_LOGGER = logging.getLogger(__name__)

# Binnen een seconde weg: wie iets omzet en meteen de app sluit, hoort het bij
# terugkomst nog zo te zien staan.
OPSLAAN_NA = 1


class AutomatiseringOpslag:
    """De regels en de stand, in één bestand."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict[str, Any] = {"regels": [], "vakantie": False, "laatst": None, "brandt": []}

    async def async_load(self) -> None:
        rauw = await self._store.async_load()
        if not isinstance(rauw, dict):
            return
        if isinstance(rauw.get("regels"), list):
            self._data["regels"] = [r for r in rauw["regels"] if isinstance(r, dict) and r.get("id")]
        else:
            _LOGGER.warning("Automatiseringen: 'regels' ontbreekt of is geen lijst; leeg begonnen")
        self._data["vakantie"] = rauw.get("vakantie") is True
        if isinstance(rauw.get("laatst"), str):
            self._data["laatst"] = rauw["laatst"]
        if isinstance(rauw.get("brandt"), list):
            self._data["brandt"] = [str(x) for x in rauw["brandt"]]

    @callback
    def _bewaar(self) -> None:
        self._store.async_delay_save(lambda: self._data, OPSLAAN_NA)

    async def async_schrijf_nu(self) -> None:
        """Meteen, bij het afsluiten: daarna is er geen seconde meer."""
        await self._store.async_save(self._data)

    # ----------------------------------------------------------------- regels

    @property
    def regels(self) -> list[dict[str, Any]]:
        return list(self._data["regels"])

    @callback
    def zet_regel(self, regel: dict[str, Any]) -> None:
        """Een nieuwe regel achteraan, een bestaande op zijn eigen plek."""
        lijst = self._data["regels"]
        for i, bestaand in enumerate(lijst):
            if bestaand["id"] == regel["id"]:
                lijst[i] = regel
                break
        else:
            lijst.append(regel)
        self._bewaar()

    @callback
    def verwijder_regel(self, regel_id: str) -> bool:
        lijst = self._data["regels"]
        over = [r for r in lijst if r["id"] != regel_id]
        if len(over) == len(lijst):
            return False
        self._data["regels"] = over
        self.zet_brandt(regel_id, False)
        self._bewaar()
        return True

    # ------------------------------------------------------------------ stand

    @property
    def vakantie(self) -> bool:
        return self._data["vakantie"]

    @callback
    def zet_vakantie(self, aan: bool) -> None:
        self._data["vakantie"] = bool(aan)
        self._bewaar()

    @property
    def laatst(self) -> datetime | None:
        tekst = self._data["laatst"]
        return dt_util.parse_datetime(tekst) if tekst else None

    @callback
    def zet_laatst(self, op: datetime, bewaar: bool = True) -> None:
        self._data["laatst"] = op.isoformat()
        if bewaar:
            self._bewaar()

    @callback
    def brandt(self, regel_id: str) -> bool:
        return regel_id in self._data["brandt"]

    @callback
    def zet_brandt(self, regel_id: str, aan: bool) -> None:
        lijst = [x for x in self._data["brandt"] if x != regel_id]
        if aan:
            lijst.append(regel_id)
        self._data["brandt"] = lijst
        self._bewaar()
