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

    ## Waarom het hartje hier langskomt

    Music Assistant zoekt in zijn eigen bibliotheek én bij de providers. Een
    treffer die uit de bibliotheek komt weet dat hij een favoriet is; wij lieten
    dat veld vallen, en dus kwam elk zoekresultaat met een leeg hartje binnen --
    ook een nummer dat je een minuut eerder favoriet had gemaakt. Dat is de helft
    van de melding "hij slaat favorieten niet op".

    Het bibliotheeknummer gaat alleen mee als de treffer ECHT uit de bibliotheek
    komt (`provider == "library"`). Bij een provider-treffer is `item_id` het
    nummer van Spotify of Sonos, en een hartje uitzetten gaat op
    bibliotheeknummer -- daar het verkeerde nummer voor gebruiken haalt iets
    anders weg dan wat je aanwees.
    """
    resultaten: list[dict[str, Any]] = []
    for emmer in EMMERS:
        for item in antwoord.get(emmer) or []:
            if not isinstance(item, dict):
                continue
            nummer = item.get("item_id")
            uit_bibliotheek = item.get("provider") == "library" and nummer is not None
            resultaten.append(
                {
                    "name": item.get("name"),
                    "uri": item.get("uri"),
                    "media_type": item.get("media_type") or EMMER_SOORT.get(emmer),
                    "image": item.get("image"),
                    "artists": item.get("artists"),
                    "album": item.get("album"),
                    "favorite": bool(item.get("favorite", False)),
                    "library_item_id": str(nummer) if uit_bibliotheek else None,
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


class MAWeigert(HomeAssistantError):
    """Music Assistant wil dit niet uitvoeren."""


def _vertaal(err: Exception) -> Exception:
    """Van een MA-fout naar iets dat een mens kan lezen.

    De belangrijkste is `InsufficientPermissions`. Music Assistant laat een
    afspeellijst VERWIJDEREN alleen aan een beheerder toe, en de verbinding die
    Home Assistant heeft is dat niet. Zonder deze vertaling kwam dat als
    "Unknown error" op het scherm -- gemeten op de installatie van de eigenaar
    op 20 augustus 2026.

    Op naam en niet op klasse: `music_assistant_models` is een afhankelijkheid
    van de MA-integratie en niet van ons, dus importeren zou dit bestand laten
    breken op een installatie zonder Music Assistant.
    """
    naam = type(err).__name__
    if naam == "InsufficientPermissions":
        return MAWeigert(
            "Music Assistant staat dit alleen toe aan een beheerder. Verwijderen van "
            "een afspeellijst kan daarom niet vanaf de kaart; dat gaat via Music "
            "Assistant zelf."
        )
    if naam in ("MediaNotFoundError", "InvalidDataError"):
        return MAWeigert(f"Music Assistant kent dit item niet ({err}).")
    # Ook wat we niet kennen wordt een HomeAssistantError. Anders ontsnapt hij
    # langs de foutafhandeling van het commando en maakt Home Assistant er
    # "Unknown error" van -- en dat vertelt niemand iets. De oorspronkelijke
    # tekst gaat mee, zodat er in het logboek nog iets te zoeken valt.
    return MAWeigert(f"Music Assistant gaf een fout: {err}")


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


def afbeelding_url(mass: Any, item: Any, grootte: int = 256) -> str | None:
    """De hoes van dit item als iets waar een <img> mee overweg kan.

    Music Assistant levert geen URL maar een `MediaItemImage`: een pad, een
    provider en soms een proxy-id. Alleen een pad dat "remotely accessible" is,
    is rechtstreeks te gebruiken; de rest moet langs de imageproxy van de
    MA-server, met de bundel-URL van die server ervoor.

    Die vertaling zit in de client zelf (`get_media_item_image_url`), dus die
    gebruiken we -- zelf een URL in elkaar zetten is een tweede plek die uit de
    pas gaat lopen. Zonder dit stond er `[object Object]` in de `src` van elke
    hoes op het favorieten- en afspeellijstenblad, en bleef het vakje leeg.
    """
    try:
        return mass.get_media_item_image_url(item, size=grootte)
    except Exception:  # noqa: BLE001 -- een ontbrekende hoes mag niets breken
        return None


def bibliotheekItem(item: Any, soort: str, mass: Any = None) -> dict[str, Any]:
    """Eén item, in dezelfde vorm als `treffers()` teruggeeft.

    Dezelfde vorm, want het zoekscherm en het favorietenscherm tonen dezelfde
    regels. Er komen drie velden bij die alleen de bibliotheek kent: of het een
    favoriet is, het bibliotheeknummer (nodig om een favoriet er weer af te
    halen) en of een afspeellijst bewerkbaar is.
    """
    haal = (lambda naam, standaard=None: item.get(naam, standaard)) if isinstance(item, dict) else (
        lambda naam, standaard=None: getattr(item, naam, standaard)
    )
    # De hoes: een URL of niets. Nooit een object -- de kaart zet dit
    # rechtstreeks in een `src`.
    afbeelding = afbeelding_url(mass, item) if mass is not None else None
    if afbeelding is None:
        ruw = haal("image")
        afbeelding = ruw if isinstance(ruw, str) else None

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
    return [bibliotheekItem(i, soort, mass) for i in _als_lijst(items)]


async def favoriet_aan(hass: HomeAssistant, uri: str) -> dict[str, Any] | None:
    """Zet een hartje, en zeg waar het item daarna in de bibliotheek staat.

    Dat laatste is geen extraatje maar een noodzaak. Een zoekresultaat heeft nog
    geen bibliotheeknummer; dat krijgt het pas doordat MA het bij het favoriet
    maken in de bibliotheek zet. En het hartje weer UIT zetten gaat op
    bibliotheeknummer plus soort -- niet op uri.

    Zonder deze opzoeking kon je een zoekresultaat wel favoriet maken maar niet
    meteen weer afvinken: "Dit item kan niet favoriet gemaakt worden", terwijl
    het er gewoon stond. Gemeld op 20 augustus 2026.
    """
    mass = client(hass)
    try:
        async with asyncio.timeout(BIBLIOTHEEK_TIMEOUT_SECONDEN):
            await mass.music.add_item_to_favorites(uri)
    except TimeoutError:
        raise
    except Exception as err:  # noqa: BLE001 -- MA kent zijn eigen fouten
        raise _vertaal(err) from err

    # Opzoeken mag mislukken: het hartje staat dan gewoon aan, alleen kan de
    # kaart hem pas na een verversing weer uitzetten. Dat is beter dan de hele
    # handeling laten falen omdat de nazorg niet lukte.
    try:
        async with asyncio.timeout(BIBLIOTHEEK_TIMEOUT_SECONDEN):
            item = await mass.music.get_item_by_uri(uri)
    except Exception as err:  # noqa: BLE001
        _LOGGER.debug("Kon %s na het favoriet maken niet opzoeken: %s", uri, err)
        return None

    media_type = str(getattr(item, "media_type", "") or "")
    soort = next((k for k, v in SOORT_MEDIA_TYPE.items() if v == media_type), None)
    nummer = getattr(item, "item_id", None)
    if soort is None or nummer is None:
        return None
    return {"kind": soort, "library_item_id": str(nummer)}


async def favoriet_uit(hass: HomeAssistant, soort: str, library_item_id: str) -> None:
    """Haal het hartje eraf.

    Dit werkt op het BIBLIOTHEEKNUMMER en niet op de uri -- dat is wat MA
    verwacht, en het is de reden dat `bibliotheekItem` dat nummer meegeeft.
    """
    mass = client(hass)
    media_type = SOORT_MEDIA_TYPE.get(soort, soort)
    try:
        async with asyncio.timeout(BIBLIOTHEEK_TIMEOUT_SECONDEN):
            await mass.music.remove_item_from_favorites(media_type, library_item_id)
    except TimeoutError:
        raise
    except Exception as err:  # noqa: BLE001
        raise _vertaal(err) from err


async def afspeellijst_maken(hass: HomeAssistant, naam: str) -> dict[str, Any]:
    """Een nieuwe, lege afspeellijst.

    Zonder provider: dan kiest MA zelf waar hij landt -- in de praktijk zijn
    eigen bibliotheek, en dat is precies waar een lijst hoort die je hier maakt.
    """
    mass = client(hass)
    try:
        async with asyncio.timeout(BIBLIOTHEEK_TIMEOUT_SECONDEN):
            lijst = await mass.music.create_playlist(naam)
    except TimeoutError:
        raise
    except Exception as err:  # noqa: BLE001
        raise _vertaal(err) from err
    return bibliotheekItem(lijst, "playlists", mass)


async def afspeellijst_verwijderen(hass: HomeAssistant, item_id: str) -> None:
    """Weg met de lijst. Alleen de lijst: de nummers blijven in de bibliotheek.

    LET OP: Music Assistant laat dit alleen aan een beheerder toe, en de
    verbinding die Home Assistant heeft is dat niet. Op de installatie van de
    eigenaar geeft dit `InsufficientPermissions`. `_vertaal` maakt daar een
    leesbare melding van; de kaart toont die en gooit de knop niet stilletjes
    weg, want dan zou niemand weten waarom het niet kan.
    """
    mass = client(hass)
    try:
        async with asyncio.timeout(BIBLIOTHEEK_TIMEOUT_SECONDEN):
            await mass.music.remove_playlist(item_id, recursive=False)
    except TimeoutError:
        raise
    except Exception as err:  # noqa: BLE001
        if type(err).__name__ != "InsufficientPermissions":
            raise _vertaal(err) from err
        # Tweede route. `music/playlists/remove` vraagt beheerrechten, maar het
        # algemene `music/library/remove_item` is een ander commando met een
        # eigen rechtencontrole -- misschien wél toegestaan voor de verbinding
        # die Home Assistant heeft.
        #
        # `recursive=False` en dat is geen smaak: de client noemt deze route
        # "Destructive! Will remove the item and all dependants", en bij een
        # afspeellijst zouden dat de nummers kunnen zijn. Alleen de lijst mag
        # weg, nooit de muziek erin.
        try:
            async with asyncio.timeout(BIBLIOTHEEK_TIMEOUT_SECONDEN):
                await mass.music.remove_item_from_library("playlist", item_id, recursive=False)
        except TimeoutError:
            raise
        except Exception as tweede:  # noqa: BLE001
            _LOGGER.debug("Beide routes om een afspeellijst te verwijderen faalden: %s / %s", err, tweede)
            raise _vertaal(err) from tweede


async def afspeellijst_nummers(
    hass: HomeAssistant, item_id: str, provider: str, *, ververs: bool = True
) -> list[dict[str, Any]]:
    """Wat er in een afspeellijst zit, op volgorde.

    De volgorde doet ertoe: verwijderen gaat op POSITIE en niet op uri, dus het
    scherm moet weten welk nummer op welke plek staat. Let op: MA telt die
    posities vanaf 1, niet vanaf 0.

    `ververs` staat standaard AAN, en dat is de reden dat deze functie bestond
    zonder te werken. Music Assistant CACHET de nummers van een afspeellijst, en
    voegt nieuwe nummers bovendien toe in een achtergrondtaak. Wie meteen na het
    toevoegen opnieuw vroeg, kreeg de oude lijst terug -- en concludeerde dat
    toevoegen niet werkte. Gemeten op de installatie van de eigenaar: drie
    nummers toegevoegd, direct daarna 0 in de lijst, even later alle drie.
    """
    mass = client(hass)
    async with asyncio.timeout(BIBLIOTHEEK_TIMEOUT_SECONDEN):
        nummers = await mass.music.get_playlist_tracks(item_id, provider, force_refresh=ververs)
    uit: list[dict[str, Any]] = []
    for plek, nummer in enumerate(_als_lijst(nummers)):
        regel = bibliotheekItem(nummer, "tracks", mass)
        # MA nummert de posities in een afspeellijst zelf en begint daarbij bij
        # EEN. Die nummering is leidend, want een lijst kan in stukken opgehaald
        # worden. De terugval telt daarom ook vanaf 1.
        positie = getattr(nummer, "position", None)
        regel["position"] = positie if positie is not None else plek + 1
        uit.append(regel)
    return uit


async def nummers_toevoegen(hass: HomeAssistant, item_id: str, uris: list[str]) -> None:
    """Nummers achteraan de lijst.

    Music Assistant zet hier een ACHTERGRONDTAAK voor klaar en antwoordt meteen
    ("Creates background tasks to process the action" -- zijn eigen client). Er
    komt dus geen bevestiging dat het gelukt is, en direct daarna terugkijken
    geeft de lijst zoals hij was. Zie `afspeellijst_nummers`.
    """
    mass = client(hass)
    try:
        async with asyncio.timeout(BIBLIOTHEEK_TIMEOUT_SECONDEN):
            await mass.music.add_playlist_tracks(item_id, uris)
    except TimeoutError:
        raise
    except Exception as err:  # noqa: BLE001
        raise _vertaal(err) from err


async def nummers_verwijderen(hass: HomeAssistant, item_id: str, posities: list[int]) -> None:
    """Nummers eruit, op positie."""
    mass = client(hass)
    try:
        async with asyncio.timeout(BIBLIOTHEEK_TIMEOUT_SECONDEN):
            await mass.music.remove_playlist_tracks(item_id, tuple(posities))
    except TimeoutError:
        raise
    except Exception as err:  # noqa: BLE001
        raise _vertaal(err) from err
