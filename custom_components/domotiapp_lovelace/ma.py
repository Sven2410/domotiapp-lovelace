"""Alles wat met Music Assistant te maken heeft, op één plek.

Twee kanten van dit pakket praten met Music Assistant: de wekker (welk geluid
gaat er af) en de mediaspelerkaart (waar zoek je muziek en wat speel je af).
Zonder dit bestand zou de MA-config-entry op twee plekken opgezocht worden, zou
de zoekopdracht twee keer platgeslagen worden, en zouden die twee stilletjes uit
elkaar kunnen lopen -- precies wat er in dit pakket vaker misging.

Wat hier NIET in zit: het afspelen zelf. `music_assistant.play_media` richt zich
op een entiteit en heeft geen config-entry nodig, dus dat mag de kaart
rechtstreeks aanroepen. Zoeken kan dat niet: dat vraagt `config_entry_id`, en
dan zou de kaart moeten weten hoe Home Assistant zijn config entries noemt.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any, Final

from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

MA_DOMAIN: Final = "music_assistant"

# Het attribuut waarin MA het spelertype zet. Let op: extra state attributes
# verdwijnen zodra een entiteit unavailable is, dus dit is nooit de enige zeef.
ATTR_MASS_PLAYER_TYPE: Final = "mass_player_type"
MASS_PLAYER_TYPE_GROUP: Final = "group"

# De emmers die `music_assistant.search` teruggeeft. De volgorde hier is de
# volgorde in het antwoord.
EMMERS: Final[tuple[str, ...]] = (
    "playlists",
    "radio",
    "artists",
    "albums",
    "tracks",
    "podcasts",
    "audiobooks",
)

# Van emmernaam naar het `media_type` dat `music_assistant.play_media` verwacht.
# MA geeft het type per treffer al mee; dit is de terugval voor het geval dat
# veld ontbreekt, en het is de reden dat de kaart niet hoeft te raden.
EMMER_SOORT: Final[dict[str, str]] = {
    "playlists": "playlist",
    "radio": "radio",
    "artists": "artist",
    "albums": "album",
    "tracks": "track",
    "podcasts": "podcast",
    "audiobooks": "audiobook",
}

ZOEK_TIMEOUT_SECONDEN: Final = 10


class MANietBeschikbaar(Exception):
    """Er is geen geladen Music Assistant-config-entry."""


def config_entry_id(hass: HomeAssistant) -> str:
    """De entry waar de MA-acties op gericht worden.

    Zijn er meerdere, dan wint de eerste. Dat is een keuze en geen fout: MA
    draait bij vrijwel iedereen één keer, en de alternatieve keuze -- de klant
    laten kiezen -- zet een instelling in de weg die niemand ooit aanraakt.
    """
    entries = hass.config_entries.async_loaded_entries(MA_DOMAIN)
    if not entries:
        raise MANietBeschikbaar
    if len(entries) > 1:
        _LOGGER.debug(
            "Er zijn %d Music Assistant-config-entries; de eerste wordt gebruikt (%s)",
            len(entries),
            entries[0].entry_id,
        )
    return entries[0].entry_id


async def zoek(
    hass: HomeAssistant,
    query: str,
    *,
    media_types: list[str] | None = None,
    limit: int | None = None,
    timeout: float = ZOEK_TIMEOUT_SECONDEN,
) -> dict[str, Any]:
    """Roep `music_assistant.search` aan en geef het ruwe antwoord terug.

    De time-out is er omdat MA's eigen bibliotheek in milliseconden antwoordt
    maar de providers erachter niet: RadioBrowser gaf tijdens het bouwen van de
    wekker minutenlang fouten. Een trage provider mag geen scherm laten hangen.
    """
    data: dict[str, Any] = {
        "config_entry_id": config_entry_id(hass),
        "name": query,
    }
    if limit is not None:
        data["limit"] = limit
    if media_types:
        data["media_type"] = media_types

    async with asyncio.timeout(timeout):
        antwoord = await hass.services.async_call(
            MA_DOMAIN,
            "search",
            data,
            blocking=True,
            return_response=True,
        )
    return antwoord or {}


def treffers(antwoord: dict[str, Any]) -> list[dict[str, Any]]:
    """Eén platte lijst uit de emmers van MA.

    Plat en niet per emmer, omdat allebei de kanten die dit gebruiken één lijst
    tonen. Wie wél wil groeperen heeft `media_type` per treffer.
    """
    resultaten: list[dict[str, Any]] = []
    for emmer in EMMERS:
        for item in antwoord.get(emmer) or []:
            if not isinstance(item, dict):
                continue
            resultaten.append(
                {
                    "name": item.get("name"),
                    "uri": item.get("uri"),
                    "media_type": item.get("media_type") or EMMER_SOORT.get(emmer),
                    "image": item.get("image"),
                    "artists": item.get("artists"),
                    "album": item.get("album"),
                }
            )
    return resultaten
