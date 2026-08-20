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
from homeassistant.exceptions import HomeAssistantError

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


# ---------------------------------------------------------------------------
# De bibliotheek: favorieten en afspeellijsten
# ---------------------------------------------------------------------------
#
# Alles hierboven loopt via `hass.services.async_call`. Dat kan hier niet: de
# Home Assistant-integratie van Music Assistant heeft precies zes acties
# (`get_library`, `get_queue`, `play_announcement`, `play_media`, `search`,
# `transfer_queue`) en geen daarvan maakt een favoriet, laat staan een
# afspeellijst. Beheren zit alleen in de eigen API van de MA-server.
#
# Daar rechtstreeks naartoe verbinden kan, maar sinds MA 2.9 vraagt die API
# authenticatie ("Authentication required. Please send auth command first." --
# uitgeprobeerd op 20 augustus 2026 tegen 2.9.13). Dan zou de klant een token
# moeten aanmaken en beheren, voor elke installatie opnieuw.
#
# Home Assistant heeft die verbinding al: `entry.runtime_data.mass` is een
# ingelogde `MusicAssistantClient`. Die lenen we. Dat is HA-intern en dus een
# afhankelijkheid die bij een update kan verschuiven -- vandaar dat `client()`
# hem voorzichtig ophaalt en een leesbare fout geeft in plaats van een
# AttributeError diep in een scherm.

BIBLIOTHEEK_TIMEOUT_SECONDEN: Final = 20

# Van onze soortnaam naar de methode op `mass.music`. De sleutels zijn dezelfde
# woorden die de kaart gebruikt, zodat er nergens een tweede vertaaltabel staat.
BIBLIOTHEEK_METHODE: Final[dict[str, str]] = {
    "tracks": "get_library_tracks",
    "albums": "get_library_albums",
    "artists": "get_library_artists",
    "playlists": "get_library_playlists",
    "radio": "get_library_radios",
    "podcasts": "get_library_podcasts",
    "audiobooks": "get_library_audiobooks",
}

# Van onze soortnaam naar het `media_type` dat MA in zijn eigen API gebruikt.
SOORT_MEDIA_TYPE: Final[dict[str, str]] = {
    "tracks": "track",
    "albums": "album",
    "artists": "artist",
    "playlists": "playlist",
    "radio": "radio",
    "podcasts": "podcast",
    "audiobooks": "audiobook",
}


def client(hass: HomeAssistant):
    """De ingelogde Music Assistant-client van Home Assistant.

    Zie het blok hierboven: dit is bewust geleend en niet zelf opgezet.
    `runtime_data` is een veld van Home Assistant zelf, dus het wordt met
    `getattr` opgehaald en niet aangenomen.
    """
    entries = hass.config_entries.async_loaded_entries(MA_DOMAIN)
    if not entries:
        raise MANietBeschikbaar
    mass = getattr(getattr(entries[0], "runtime_data", None), "mass", None)
    if mass is None or getattr(mass, "music", None) is None:
        _LOGGER.warning(
            "De Music Assistant-integratie is geladen, maar de verbinding zit niet "
            "op de plek waar wij hem verwachten (entry.runtime_data.mass). "
            "Waarschijnlijk heeft Home Assistant dat veld hernoemd."
        )
        raise MANietBeschikbaar
    return mass


def _als_lijst(items: Any) -> list[Any]:
    """MA geeft dataclasses terug; soms een lijst, soms iets met `.items`."""
    if items is None:
        return []
    if isinstance(items, list):
        return items
    binnenin = getattr(items, "items", None)
    return list(binnenin) if isinstance(binnenin, list) else []


def _naam(waarde: Any) -> str | None:
    """De naam van een artiest of album, of het nu een object of een string is."""
    if waarde is None:
        return None
    if isinstance(waarde, str):
        return waarde
    return getattr(waarde, "name", None) or (waarde.get("name") if isinstance(waarde, dict) else None)


def bibliotheekItem(item: Any, soort: str) -> dict[str, Any]:
    """Eén item, in dezelfde vorm als `treffers()` teruggeeft.

    Dezelfde vorm, want het zoekscherm en het favorietenscherm tonen dezelfde
    regels. Er komen drie velden bij die alleen de bibliotheek kent: of het een
    favoriet is, het bibliotheeknummer (nodig om een favoriet er weer af te
    halen) en of een afspeellijst bewerkbaar is.
    """
    haal = (lambda naam, standaard=None: item.get(naam, standaard)) if isinstance(item, dict) else (
        lambda naam, standaard=None: getattr(item, naam, standaard)
    )
    afbeelding = haal("image")
    if afbeelding is not None and not isinstance(afbeelding, (str, dict)):
        afbeelding = {"path": getattr(afbeelding, "path", None), "provider": getattr(afbeelding, "provider", None)}

    artiesten = [n for n in (_naam(a) for a in _als_lijst(haal("artists"))) if n]

    return {
        "name": haal("name"),
        "uri": haal("uri"),
        "media_type": SOORT_MEDIA_TYPE.get(soort, soort),
        "image": afbeelding,
        "artists": artiesten or None,
        "album": _naam(haal("album")),
        "favorite": bool(haal("favorite", False)),
        "library_item_id": str(haal("item_id")) if haal("item_id") is not None else None,
        "provider": haal("provider"),
        "is_editable": bool(haal("is_editable", False)),
    }


async def bibliotheek(
    hass: HomeAssistant,
    soort: str,
    *,
    favoriet: bool | None = None,
    zoek_term: str | None = None,
    limiet: int = 50,
    offset: int = 0,
) -> list[dict[str, Any]]:
    """Een stuk van de bibliotheek, eventueel alleen de favorieten."""
    methode = BIBLIOTHEEK_METHODE.get(soort)
    if methode is None:
        raise HomeAssistantError(f"Onbekende soort: {soort}")
    mass = client(hass)
    async with asyncio.timeout(BIBLIOTHEEK_TIMEOUT_SECONDEN):
        items = await getattr(mass.music, methode)(
            favorite=favoriet,
            search=zoek_term or None,
            limit=limiet,
            offset=offset,
        )
    return [bibliotheekItem(i, soort) for i in _als_lijst(items)]


async def favoriet_aan(hass: HomeAssistant, uri: str) -> None:
    """Zet een hartje. MA zoekt zelf op wat er achter de uri zit."""
    mass = client(hass)
    async with asyncio.timeout(BIBLIOTHEEK_TIMEOUT_SECONDEN):
        await mass.music.add_item_to_favorites(uri)


async def favoriet_uit(hass: HomeAssistant, soort: str, library_item_id: str) -> None:
    """Haal het hartje eraf.

    Dit werkt op het BIBLIOTHEEKNUMMER en niet op de uri -- dat is wat MA
    verwacht, en het is de reden dat `bibliotheekItem` dat nummer meegeeft.
    """
    mass = client(hass)
    media_type = SOORT_MEDIA_TYPE.get(soort, soort)
    async with asyncio.timeout(BIBLIOTHEEK_TIMEOUT_SECONDEN):
        await mass.music.remove_item_from_favorites(media_type, library_item_id)


async def afspeellijst_maken(hass: HomeAssistant, naam: str) -> dict[str, Any]:
    """Een nieuwe, lege afspeellijst.

    Zonder provider: dan kiest MA zelf waar hij landt -- in de praktijk zijn
    eigen bibliotheek, en dat is precies waar een lijst hoort die je hier maakt.
    """
    mass = client(hass)
    async with asyncio.timeout(BIBLIOTHEEK_TIMEOUT_SECONDEN):
        lijst = await mass.music.create_playlist(naam)
    return bibliotheekItem(lijst, "playlists")


async def afspeellijst_verwijderen(hass: HomeAssistant, item_id: str) -> None:
    """Weg met de lijst. Alleen de lijst: de nummers blijven in de bibliotheek."""
    mass = client(hass)
    async with asyncio.timeout(BIBLIOTHEEK_TIMEOUT_SECONDEN):
        await mass.music.remove_playlist(item_id)


async def afspeellijst_nummers(
    hass: HomeAssistant, item_id: str, provider: str
) -> list[dict[str, Any]]:
    """Wat er in een afspeellijst zit, op volgorde.

    De volgorde doet ertoe: verwijderen gaat op POSITIE en niet op uri, dus het
    scherm moet weten welk nummer op welke plek staat.
    """
    mass = client(hass)
    async with asyncio.timeout(BIBLIOTHEEK_TIMEOUT_SECONDEN):
        nummers = await mass.music.get_playlist_tracks(item_id, provider)
    uit: list[dict[str, Any]] = []
    for plek, nummer in enumerate(_als_lijst(nummers)):
        regel = bibliotheekItem(nummer, "tracks")
        # MA nummert de posities in een afspeellijst zelf; die is leidend, want
        # een lijst kan in stukken opgehaald worden.
        positie = getattr(nummer, "position", None)
        regel["position"] = positie if positie is not None else plek
        uit.append(regel)
    return uit


async def nummers_toevoegen(hass: HomeAssistant, item_id: str, uris: list[str]) -> None:
    """Nummers achteraan de lijst."""
    mass = client(hass)
    async with asyncio.timeout(BIBLIOTHEEK_TIMEOUT_SECONDEN):
        await mass.music.add_playlist_tracks(item_id, uris)


async def nummers_verwijderen(hass: HomeAssistant, item_id: str, posities: list[int]) -> None:
    """Nummers eruit, op positie."""
    mass = client(hass)
    async with asyncio.timeout(BIBLIOTHEEK_TIMEOUT_SECONDEN):
        await mass.music.remove_playlist_tracks(item_id, tuple(posities))
