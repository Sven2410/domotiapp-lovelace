"""De bibliotheek: favorieten en afspeellijsten, over de WebSocket.

Alles hier is **NIEUW GEDRAG**: vóór deze ronde bestond geen van deze commando's
en had `ma.py` geen enkele functie die de Music Assistant-client leende. Op de
oude code falen ze met `unknown_command`; dat is een triviale mislukking, en
daarom legt elke test iets vast dat ook later nog kan sneuvelen.

Twee dingen krijgen extra aandacht, want daar zit de fragiliteit:

1. **De geleende client.** `entry.runtime_data.mass` is een veld van Home
   Assistant zelf. Hernoemt HA dat, dan hoort de kaart een leesbare melding te
   krijgen en geen `AttributeError` diep in een scherm.
2. **De twee vormen van een favoriet.** Aanzetten gaat op uri, uitzetten op
   bibliotheeknummer plus soort. Dat is niet ons ontwerp maar dat van MA, en het
   is precies het soort verschil dat je een keer omdraait.
"""

from __future__ import annotations

from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest

from homeassistant.core import HomeAssistant

from custom_components.domotiapp_lovelace import ma
from custom_components.domotiapp_lovelace.media.const import DOMAIN

from ..alarm.conftest import zet_integratie_op


async def _stuur(client, payload: dict[str, Any]) -> dict[str, Any]:
    await client.send_json_auto_id(payload)
    return await client.receive_json()


class MetNaam:
    """Iets met alleen een `name`, zoals MA een artiest of album teruggeeft.

    Bewust géén MagicMock: die heeft zelf een `name`-argument voor de naam van
    de mock, en dan zet je het attribuut niet maar het label.
    """

    def __init__(self, naam: str) -> None:
        self.name = naam


class NepNummer:
    """Zoals de MA-client een nummer teruggeeft: een object, geen dict."""

    def __init__(self, naam: str, item_id: str = "12", favorite: bool = True) -> None:
        self.name = naam
        self.uri = f"library://track/{item_id}"
        self.item_id = item_id
        self.favorite = favorite
        self.provider = "library"
        self.image = None
        self.artists = [MetNaam("De Artiest")]
        self.album = MetNaam("Het Album")
        self.is_editable = False


@pytest.fixture
def nep_mass(hass: HomeAssistant, monkeypatch: pytest.MonkeyPatch) -> MagicMock:
    """Een nagebootste MA-client op de plek waar `ma.client()` hem zoekt."""
    mass = MagicMock()
    mass.music = MagicMock()
    # Standaard geen hoes. Zonder dit geeft de MagicMock een mock terug waar een
    # URL hoort te staan, en die is niet naar JSON te schrijven -- dan faalt elk
    # commando met "Invalid JSON in response" in plaats van met de fout die je
    # aan het toetsen was.
    mass.get_media_item_image_url = MagicMock(return_value=None)
    monkeypatch.setattr(ma, "client", lambda _hass: mass)
    return mass


# ---------------------------------------------------------------- de client


async def test_client_zonder_music_assistant(hass: HomeAssistant) -> None:
    """Geen MA-integratie: een nette uitzondering, geen AttributeError."""
    with pytest.raises(ma.MANietBeschikbaar):
        ma.client(hass)


async def test_client_als_home_assistant_het_veld_hernoemt(
    hass: HomeAssistant, monkeypatch: pytest.MonkeyPatch
) -> None:
    """De entry is er wél, maar `runtime_data.mass` niet.

    Dit is het geval waar de hele constructie op kan breken bij een HA-update.
    Hij hoort te eindigen in `MANietBeschikbaar` -- de kaart zegt dan dat Music
    Assistant niet beschikbaar is -- en niet in een AttributeError.
    """
    entry = MagicMock()
    entry.runtime_data = object()  # geen `mass` erop
    monkeypatch.setattr(
        hass.config_entries, "async_loaded_entries", lambda domein: [entry]
    )
    with pytest.raises(ma.MANietBeschikbaar):
        ma.client(hass)


async def test_client_zonder_music_controller(
    hass: HomeAssistant, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Een client die er is maar (nog) geen `music` heeft, telt niet mee."""
    entry = MagicMock()
    entry.runtime_data = MagicMock(mass=MagicMock(music=None))
    monkeypatch.setattr(
        hass.config_entries, "async_loaded_entries", lambda domein: [entry]
    )
    with pytest.raises(ma.MANietBeschikbaar):
        ma.client(hass)


# ------------------------------------------------------------ het platslaan


def test_bibliotheekitem_slaat_een_ma_object_plat() -> None:
    """De kaart krijgt dezelfde vorm als bij zoeken, plus drie velden erbij."""
    regel = ma.bibliotheekItem(NepNummer("Het Nummer"), "tracks")
    assert regel["name"] == "Het Nummer"
    assert regel["media_type"] == "track"
    assert regel["artists"] == ["De Artiest"]
    assert regel["album"] == "Het Album"
    assert regel["favorite"] is True
    # Het bibliotheeknummer is een STRING: MA levert soms een int, en de kaart
    # stuurt hem onveranderd terug.
    assert regel["library_item_id"] == "12"


def test_bibliotheekitem_verdraagt_een_kale_dict() -> None:
    """Sommige providers geven een dict terug in plaats van een dataclass."""
    regel = ma.bibliotheekItem(
        {"name": "Radio 1", "uri": "radio://1", "item_id": 7, "favorite": False}, "radio"
    )
    assert regel["name"] == "Radio 1"
    assert regel["media_type"] == "radio"
    assert regel["favorite"] is False
    assert regel["library_item_id"] == "7"
    assert regel["artists"] is None


# ------------------------------------------------------------------ lezen


async def test_library_geeft_favorieten(hass: HomeAssistant, hass_ws_client, nep_mass) -> None:
    """`favorite: true` vraagt MA alleen om favorieten."""
    await zet_integratie_op(hass)
    nep_mass.music.get_library_tracks = AsyncMock(return_value=[NepNummer("Favoriet")])
    client = await hass_ws_client(hass)

    antwoord = await _stuur(
        client, {"type": f"{DOMAIN}/media/library", "kind": "tracks", "favorite": True}
    )
    assert antwoord["success"], antwoord
    assert [i["name"] for i in antwoord["result"]["items"]] == ["Favoriet"]
    nep_mass.music.get_library_tracks.assert_awaited_once()
    assert nep_mass.music.get_library_tracks.await_args.kwargs["favorite"] is True


async def test_library_zonder_favorietfilter_vraagt_alles(
    hass: HomeAssistant, hass_ws_client, nep_mass
) -> None:
    """`favorite: false` betekent ALLES, niet "alleen niet-favorieten".

    Dat verschil zit in `favoriet=True if ... else None`. Zou daar `False`
    staan, dan vraagt de kaart MA om alles wat géén favoriet is -- en dan is het
    bibliotheekoverzicht precies verkeerd om.
    """
    await zet_integratie_op(hass)
    nep_mass.music.get_library_playlists = AsyncMock(return_value=[])
    client = await hass_ws_client(hass)

    await _stuur(client, {"type": f"{DOMAIN}/media/library", "kind": "playlists"})
    assert nep_mass.music.get_library_playlists.await_args.kwargs["favorite"] is None


async def test_library_weigert_een_onbekende_soort(
    hass: HomeAssistant, hass_ws_client, nep_mass
) -> None:
    """Een soort die MA niet kent komt niet eens langs de schemacontrole."""
    await zet_integratie_op(hass)
    client = await hass_ws_client(hass)
    antwoord = await _stuur(
        client, {"type": f"{DOMAIN}/media/library", "kind": "onzin"}
    )
    assert not antwoord["success"]


async def test_library_zonder_music_assistant(hass: HomeAssistant, hass_ws_client) -> None:
    """Zonder MA een leesbare melding, geen stille fout."""
    await zet_integratie_op(hass)
    client = await hass_ws_client(hass)
    antwoord = await _stuur(client, {"type": f"{DOMAIN}/media/library", "kind": "tracks"})
    assert not antwoord["success"]
    assert "Music Assistant" in antwoord["error"]["message"]


# --------------------------------------------------------------- favorieten


async def test_favoriet_aan_gaat_op_uri(hass: HomeAssistant, hass_ws_client, nep_mass) -> None:
    await zet_integratie_op(hass)
    nep_mass.music.add_item_to_favorites = AsyncMock()
    client = await hass_ws_client(hass)

    antwoord = await _stuur(
        client,
        {"type": f"{DOMAIN}/media/favorite", "favorite": True, "uri": "library://track/12"},
    )
    assert antwoord["success"], antwoord
    nep_mass.music.add_item_to_favorites.assert_awaited_once_with("library://track/12")


async def test_favoriet_uit_gaat_op_nummer_en_soort(
    hass: HomeAssistant, hass_ws_client, nep_mass
) -> None:
    """Uitzetten gebruikt het bibliotheeknummer én het MA-media_type."""
    await zet_integratie_op(hass)
    nep_mass.music.remove_item_from_favorites = AsyncMock()
    client = await hass_ws_client(hass)

    antwoord = await _stuur(
        client,
        {
            "type": f"{DOMAIN}/media/favorite",
            "favorite": False,
            "kind": "radio",
            "library_item_id": "7",
        },
    )
    assert antwoord["success"], antwoord
    # "radio" is ONZE naam; MA wil "radio" als media_type -- en voor "tracks"
    # wil hij "track". Die vertaling hoort hier te gebeuren.
    nep_mass.music.remove_item_from_favorites.assert_awaited_once_with("radio", "7")


async def test_favoriet_uit_zonder_nummer_klaagt(
    hass: HomeAssistant, hass_ws_client, nep_mass
) -> None:
    await zet_integratie_op(hass)
    client = await hass_ws_client(hass)
    antwoord = await _stuur(client, {"type": f"{DOMAIN}/media/favorite", "favorite": False})
    assert not antwoord["success"]
    assert "bibliotheeknummer" in antwoord["error"]["message"]


# ------------------------------------------------------------ afspeellijsten


async def test_afspeellijst_maken(hass: HomeAssistant, hass_ws_client, nep_mass) -> None:
    await zet_integratie_op(hass)
    lijst = NepNummer("Mijn lijst", item_id="99", favorite=False)
    lijst.is_editable = True
    nep_mass.music.create_playlist = AsyncMock(return_value=lijst)
    client = await hass_ws_client(hass)

    antwoord = await _stuur(
        client, {"type": f"{DOMAIN}/media/playlist/create", "name": "  Mijn lijst  "}
    )
    assert antwoord["success"], antwoord
    assert antwoord["result"]["playlist"]["name"] == "Mijn lijst"
    assert antwoord["result"]["playlist"]["is_editable"] is True
    # De spaties eromheen gaan eraf: "Mijn lijst " en "Mijn lijst" zijn voor een
    # mens dezelfde lijst.
    nep_mass.music.create_playlist.assert_awaited_once_with("Mijn lijst")


async def test_afspeellijst_zonder_naam_mag_niet(
    hass: HomeAssistant, hass_ws_client, nep_mass
) -> None:
    await zet_integratie_op(hass)
    client = await hass_ws_client(hass)
    antwoord = await _stuur(client, {"type": f"{DOMAIN}/media/playlist/create", "name": ""})
    assert not antwoord["success"]


async def test_afspeellijst_verwijderen(hass: HomeAssistant, hass_ws_client, nep_mass) -> None:
    await zet_integratie_op(hass)
    nep_mass.music.remove_playlist = AsyncMock()
    client = await hass_ws_client(hass)

    antwoord = await _stuur(
        client, {"type": f"{DOMAIN}/media/playlist/remove", "library_item_id": "99"}
    )
    assert antwoord["success"], antwoord
    # `recursive=False`: alleen de lijst, nooit de nummers erin.
    nep_mass.music.remove_playlist.assert_awaited_once_with("99", recursive=False)


async def test_afspeellijst_nummers_dragen_hun_positie(
    hass: HomeAssistant, hass_ws_client, nep_mass
) -> None:
    """Verwijderen gaat op POSITIE, dus die moet mee naar de kaart.

    Zonder positie zou het scherm moeten gokken welk nummer op welke plek staat,
    en dan gooit een klant het verkeerde nummer weg.
    """
    await zet_integratie_op(hass)
    een, twee = NepNummer("Een", "1"), NepNummer("Twee", "2")
    een.position, twee.position = 0, 1
    nep_mass.music.get_playlist_tracks = AsyncMock(return_value=[een, twee])
    client = await hass_ws_client(hass)

    antwoord = await _stuur(
        client,
        {
            "type": f"{DOMAIN}/media/playlist/tracks",
            "library_item_id": "99",
            "provider": "library",
        },
    )
    assert antwoord["success"], antwoord
    assert [t["position"] for t in antwoord["result"]["tracks"]] == [0, 1]


async def test_nummers_toevoegen_en_verwijderen(
    hass: HomeAssistant, hass_ws_client, nep_mass
) -> None:
    await zet_integratie_op(hass)
    nep_mass.music.add_playlist_tracks = AsyncMock()
    nep_mass.music.remove_playlist_tracks = AsyncMock()
    client = await hass_ws_client(hass)

    toe = await _stuur(
        client,
        {
            "type": f"{DOMAIN}/media/playlist/add_tracks",
            "library_item_id": "99",
            "uris": ["library://track/1", "library://track/2"],
        },
    )
    assert toe["success"], toe
    assert toe["result"]["added"] == 2
    nep_mass.music.add_playlist_tracks.assert_awaited_once_with(
        "99", ["library://track/1", "library://track/2"]
    )

    weg = await _stuur(
        client,
        {
            "type": f"{DOMAIN}/media/playlist/remove_tracks",
            "library_item_id": "99",
            "positions": [1],
        },
    )
    assert weg["success"], weg
    # MA wil een tuple, geen lijst -- dat is de reden dat `nummers_verwijderen`
    # hem omzet.
    nep_mass.music.remove_playlist_tracks.assert_awaited_once_with("99", (1,))


async def test_lege_lijst_toevoegen_mag_niet(
    hass: HomeAssistant, hass_ws_client, nep_mass
) -> None:
    await zet_integratie_op(hass)
    client = await hass_ws_client(hass)
    antwoord = await _stuur(
        client,
        {"type": f"{DOMAIN}/media/playlist/add_tracks", "library_item_id": "99", "uris": []},
    )
    assert not antwoord["success"]


# ------------------------------------------------- wat er op de echte MA misging


async def test_nummers_ophalen_vraagt_een_verse_lijst(
    hass: HomeAssistant, hass_ws_client, nep_mass
) -> None:
    """`force_refresh=True`, en dat is de kern van "toevoegen doet niets".

    Music Assistant cachet de nummers van een afspeellijst en voegt nieuwe
    nummers toe in een achtergrondtaak. Zonder deze vlag kreeg het scherm de
    lijst zoals hij wás terug -- gemeten op de installatie van de eigenaar op
    20 augustus 2026: drie nummers toegevoegd, direct daarna 0 in de lijst, even
    later alle drie.
    """
    await zet_integratie_op(hass)
    nep_mass.music.get_playlist_tracks = AsyncMock(return_value=[])
    client = await hass_ws_client(hass)

    await _stuur(
        client,
        {
            "type": f"{DOMAIN}/media/playlist/tracks",
            "library_item_id": "40",
            "provider": "library",
        },
    )
    assert nep_mass.music.get_playlist_tracks.await_args.kwargs["force_refresh"] is True


async def test_posities_beginnen_bij_een(hass: HomeAssistant, hass_ws_client, nep_mass) -> None:
    """MA telt de posities in een afspeellijst vanaf 1.

    Uitgelezen op de echte installatie: een lijst van twaalf nummers had de
    posities 1 tot en met 12. Zou de terugval vanaf 0 tellen, dan haalt een tik
    op het kruisje het nummer erbóven weg.
    """
    await zet_integratie_op(hass)
    # Nummers zonder eigen `position`: dan telt onze terugval.
    een, twee = NepNummer("Een", "1"), NepNummer("Twee", "2")
    nep_mass.music.get_playlist_tracks = AsyncMock(return_value=[een, twee])
    client = await hass_ws_client(hass)

    antwoord = await _stuur(
        client,
        {
            "type": f"{DOMAIN}/media/playlist/tracks",
            "library_item_id": "40",
            "provider": "library",
        },
    )
    assert [t["position"] for t in antwoord["result"]["tracks"]] == [1, 2]


class GeenRechten(Exception):
    """Zoals music_assistant_models hem noemt."""


GeenRechten.__name__ = "InsufficientPermissions"


async def test_verwijderen_zonder_beheerrechten_zegt_wat_er_aan_de_hand_is(
    hass: HomeAssistant, hass_ws_client, nep_mass
) -> None:
    """Music Assistant laat een afspeellijst verwijderen alleen aan een beheerder toe.

    De verbinding die Home Assistant heeft is dat niet. Op de installatie van de
    eigenaar kwam dat als "Unknown error" op het scherm; dat vertelt niemand
    iets. Nu staat er wát er aan de hand is en waar het wél kan.
    """
    await zet_integratie_op(hass)
    nep_mass.music.remove_playlist = AsyncMock(side_effect=GeenRechten("Admin access required"))
    client = await hass_ws_client(hass)

    antwoord = await _stuur(
        client, {"type": f"{DOMAIN}/media/playlist/remove", "library_item_id": "40"}
    )
    assert not antwoord["success"]
    bericht = antwoord["error"]["message"]
    assert "beheerder" in bericht
    assert "Unknown error" not in bericht


async def test_een_gewone_fout_blijft_gewoon_doorkomen(
    hass: HomeAssistant, hass_ws_client, nep_mass
) -> None:
    """Alleen de fouten die we kennen worden vertaald; de rest blijft zichzelf."""
    await zet_integratie_op(hass)
    nep_mass.music.create_playlist = AsyncMock(side_effect=RuntimeError("iets anders"))
    client = await hass_ws_client(hass)

    antwoord = await _stuur(client, {"type": f"{DOMAIN}/media/playlist/create", "name": "X"})
    assert not antwoord["success"]
    assert "iets anders" in antwoord["error"]["message"]


async def test_verwijderen_probeert_een_tweede_route(
    hass: HomeAssistant, hass_ws_client, nep_mass
) -> None:
    """Weigert `music/playlists/remove`, dan volgt `music/library/remove_item`.

    Twee verschillende commando's met een eigen rechtencontrole. Lukt de tweede
    wél, dan is de afspeellijst gewoon weg en hoeft niemand iets in te stellen.
    """
    await zet_integratie_op(hass)
    nep_mass.music.remove_playlist = AsyncMock(side_effect=GeenRechten("Admin access required"))
    nep_mass.music.remove_item_from_library = AsyncMock()
    client = await hass_ws_client(hass)

    antwoord = await _stuur(
        client, {"type": f"{DOMAIN}/media/playlist/remove", "library_item_id": "40"}
    )
    assert antwoord["success"], antwoord
    # recursive=False: deze route heet in de client zelf "Destructive! Will
    # remove the item and all dependants". Alleen de lijst mag weg, nooit de
    # nummers erin.
    nep_mass.music.remove_item_from_library.assert_awaited_once_with(
        "playlist", "40", recursive=False
    )


async def test_verwijderen_meldt_pas_als_beide_routes_weigeren(
    hass: HomeAssistant, hass_ws_client, nep_mass
) -> None:
    """Weigeren ze allebei, dan komt de uitleg over beheerrechten alsnog."""
    await zet_integratie_op(hass)
    nep_mass.music.remove_playlist = AsyncMock(side_effect=GeenRechten("Admin access required"))
    nep_mass.music.remove_item_from_library = AsyncMock(
        side_effect=GeenRechten("Admin access required")
    )
    client = await hass_ws_client(hass)

    antwoord = await _stuur(
        client, {"type": f"{DOMAIN}/media/playlist/remove", "library_item_id": "40"}
    )
    assert not antwoord["success"]
    assert "beheerder" in antwoord["error"]["message"]


async def test_de_gewone_route_gaat_niet_recursief(
    hass: HomeAssistant, hass_ws_client, nep_mass
) -> None:
    """Ook de eerste route mag alleen de lijst weghalen, niet wat erin zit."""
    await zet_integratie_op(hass)
    nep_mass.music.remove_playlist = AsyncMock()
    client = await hass_ws_client(hass)

    await _stuur(client, {"type": f"{DOMAIN}/media/playlist/remove", "library_item_id": "40"})
    nep_mass.music.remove_playlist.assert_awaited_once_with("40", recursive=False)


class NepImage:
    """Een MediaItemImage zoals MA hem levert: geen URL maar een object."""

    def __init__(self) -> None:
        self.path = "covers/ochtend.jpg"
        self.provider = "library"
        self.remotely_accessible = False


async def test_de_hoes_wordt_een_url(hass: HomeAssistant, hass_ws_client, nep_mass) -> None:
    """Music Assistant levert geen URL maar een object.

    De kaart zet dit rechtstreeks in een `src`, dus wat er niet als string uit
    komt, wordt `[object Object]` en dan blijft het hoesvakje leeg -- precies
    wat er gemeld werd over de afspeellijsten. De client kan de vertaling zelf
    (`get_media_item_image_url`), dus die gebruiken we.
    """
    await zet_integratie_op(hass)
    lijst = NepNummer("Ochtend", item_id="1", favorite=False)
    lijst.image = NepImage()
    nep_mass.music.get_library_playlists = AsyncMock(return_value=[lijst])
    nep_mass.get_media_item_image_url = MagicMock(
        return_value="http://192.168.1.88:8095/imageproxy/abc?size=256"
    )
    client = await hass_ws_client(hass)

    antwoord = await _stuur(client, {"type": f"{DOMAIN}/media/library", "kind": "playlists"})
    assert antwoord["success"], antwoord
    plaatje = antwoord["result"]["items"][0]["image"]
    assert plaatje == "http://192.168.1.88:8095/imageproxy/abc?size=256"
    assert isinstance(plaatje, str)


async def test_zonder_hoes_geen_object(hass: HomeAssistant, hass_ws_client, nep_mass) -> None:
    """Kan de client er geen URL van maken, dan is het `null` en geen object.

    Een ontbrekende hoes mag nooit een `[object Object]` in de `src` opleveren;
    de kaart tekent dan zijn eigen muzieknoot.
    """
    await zet_integratie_op(hass)
    lijst = NepNummer("Zonder hoes", item_id="2", favorite=False)
    lijst.image = NepImage()
    nep_mass.music.get_library_playlists = AsyncMock(return_value=[lijst])
    nep_mass.get_media_item_image_url = MagicMock(side_effect=RuntimeError("geen hoes"))
    client = await hass_ws_client(hass)

    antwoord = await _stuur(client, {"type": f"{DOMAIN}/media/library", "kind": "playlists"})
    assert antwoord["success"], antwoord
    assert antwoord["result"]["items"][0]["image"] is None


async def test_favoriet_aan_geeft_terug_waar_het_item_belandde(
    hass: HomeAssistant, hass_ws_client, nep_mass
) -> None:
    """Een zoekresultaat heeft nog geen bibliotheeknummer.

    Dat krijgt het pas doordat MA het bij het favoriet maken in de bibliotheek
    zet -- en het hartje weer UIT zetten gaat op bibliotheeknummer plus soort.
    Zonder deze opzoeking kon je een zoekresultaat wel favoriet maken maar niet
    meteen weer afvinken: "Dit item kan niet favoriet gemaakt worden", terwijl
    het er gewoon stond. Gemeld op 20 augustus 2026.
    """
    await zet_integratie_op(hass)
    nep_mass.music.add_item_to_favorites = AsyncMock()
    gevonden = NepNummer("Guus", item_id="77")
    gevonden.media_type = "track"
    nep_mass.music.get_item_by_uri = AsyncMock(return_value=gevonden)
    client = await hass_ws_client(hass)

    antwoord = await _stuur(
        client,
        {"type": f"{DOMAIN}/media/favorite", "favorite": True, "uri": "spotify://track/x"},
    )
    assert antwoord["success"], antwoord
    assert antwoord["result"]["library_item_id"] == "77"
    assert antwoord["result"]["kind"] == "tracks"


async def test_favoriet_aan_werkt_ook_als_opzoeken_mislukt(
    hass: HomeAssistant, hass_ws_client, nep_mass
) -> None:
    """De nazorg mag de handeling niet laten mislukken.

    Het hartje staat dan gewoon aan; alleen kan de kaart hem pas na een
    verversing weer uitzetten. Dat is beter dan het favoriet maken laten falen
    omdat het opzoeken erna niet lukte.
    """
    await zet_integratie_op(hass)
    nep_mass.music.add_item_to_favorites = AsyncMock()
    nep_mass.music.get_item_by_uri = AsyncMock(side_effect=RuntimeError("weg"))
    client = await hass_ws_client(hass)

    antwoord = await _stuur(
        client,
        {"type": f"{DOMAIN}/media/favorite", "favorite": True, "uri": "spotify://track/x"},
    )
    assert antwoord["success"], antwoord
    assert antwoord["result"]["favorite"] is True
    assert "library_item_id" not in antwoord["result"]
