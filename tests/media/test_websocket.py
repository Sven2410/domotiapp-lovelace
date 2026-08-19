"""De twee WebSocket-commando's van de mediakant, via een echte verbinding.

Alles hier is **NIEUW GEDRAG**: vóór deze ronde bestond geen van beide
commando's, dus elke test faalt op de oude code met `unknown_command`. Dat is een
triviale mislukking, en daarom legt elke test een eigenschap vast die ook bij een
latere wijziging kan sneuvelen -- niet alleen dát het commando bestaat.

De speakerlijst is bewust een ander label dan die van de wekker. Dat is de kern
van de test hieronder: wie het wekkerlabel plakt, hoort niet automatisch op de
mediakaart te staan, en andersom.
"""

from __future__ import annotations

from typing import Any

from homeassistant.components.media_player import MediaPlayerEntityFeature
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er, label_registry as lr

from custom_components.domotiapp_lovelace.media.const import DOMAIN, LABEL_MEDIA_NAAM

from ..alarm.conftest import maak_speaker, zet_integratie_op

GROEPEERBAAR = int(MediaPlayerEntityFeature.GROUPING | MediaPlayerEntityFeature.PLAY_MEDIA)


async def _stuur(client, payload: dict[str, Any]) -> dict[str, Any]:
    await client.send_json_auto_id(payload)
    return await client.receive_json()


async def test_speakers_zonder_label(hass: HomeAssistant, hass_ws_client) -> None:
    """Bestaat het label niet, dan `label_exists: false`.

    Dat onderscheid is wat het zoekscherm nodig heeft om "plak dit label op je
    speakers" te tonen in plaats van een lege balk -- twee verschillende
    boodschappen bij een verse installatie.
    """
    await zet_integratie_op(hass)
    client = await hass_ws_client(hass)

    antwoord = await _stuur(client, {"type": f"{DOMAIN}/media/speakers"})
    assert antwoord["success"], antwoord
    assert antwoord["result"]["label_exists"] is False
    assert antwoord["result"]["entities"] == []
    assert antwoord["result"]["label_name"] == LABEL_MEDIA_NAAM


async def test_speakers_met_label(hass: HomeAssistant, hass_ws_client) -> None:
    """De gelabelde MA-speakers, met of ze te groeperen zijn.

    Met twee negatieve controles ernaast: een Sonos-entiteit van het
    `sonos`-platform (die het label draagt maar geen MA-speler is) en een
    MA-speler zonder het label.
    """
    ma = maak_speaker(hass, "media_player.keuken", features=GROEPEERBAAR, naam="Keuken")
    los = maak_speaker(hass, "media_player.solo", features=0, naam="Solo")
    sonos = maak_speaker(
        hass, "media_player.arc", platform="sonos", features=GROEPEERBAAR, naam="Arc"
    )
    ongelabeld = maak_speaker(hass, "media_player.zolder", features=GROEPEERBAAR, naam="Zolder")
    await zet_integratie_op(hass)

    label = lr.async_get(hass).async_create(LABEL_MEDIA_NAAM)
    registry = er.async_get(hass)
    for entity_id in (ma, los, sonos):
        registry.async_update_entity(entity_id, labels={label.label_id})

    client = await hass_ws_client(hass)
    antwoord = await _stuur(client, {"type": f"{DOMAIN}/media/speakers"})
    assert antwoord["success"], antwoord
    resultaat = antwoord["result"]

    assert resultaat["label_exists"] is True
    assert resultaat["entities"] == [
        {"entity_id": ma, "name": "Keuken", "can_group": True},
        {"entity_id": los, "name": "Solo", "can_group": False},
    ]
    # De Sonos-entiteit draagt het label maar komt niet van Music Assistant. Dat
    # wordt geteld, niet verzwegen: anders is "er hangt niets aan het label" niet
    # te onderscheiden van "er hing wel iets aan maar het viel af".
    assert resultaat["filtered_out"] == 1
    assert all(s["entity_id"] != ongelabeld for s in resultaat["entities"])


async def test_wekkerlabel_telt_hier_niet(hass: HomeAssistant, hass_ws_client) -> None:
    """Het label van de wekker vult de mediakaart niet.

    Twee lijsten, twee labels -- dat is de hele reden dat hier een eigen label
    staat. Op de wekker horen alleen de speakers waar je wakker van wilt worden.
    """
    speaker = maak_speaker(hass, "media_player.slaapkamer", features=GROEPEERBAAR)
    await zet_integratie_op(hass)

    wekker = lr.async_get(hass).async_create("Music Assistant Wekker")
    er.async_get(hass).async_update_entity(speaker, labels={wekker.label_id})

    client = await hass_ws_client(hass)
    antwoord = await _stuur(client, {"type": f"{DOMAIN}/media/speakers"})
    assert antwoord["success"], antwoord
    assert antwoord["result"]["label_exists"] is False
    assert antwoord["result"]["entities"] == []


async def test_search_zonder_music_assistant(hass: HomeAssistant, hass_ws_client) -> None:
    """Geen geladen MA-config-entry: `not_found` met uitleg.

    Zonder Music Assistant valt er niets te zoeken, en dat hoort de kaart als
    zin te krijgen -- niet als lege lijst, want dan lijkt het alsof er niets
    gevonden is.
    """
    await zet_integratie_op(hass)
    client = await hass_ws_client(hass)

    antwoord = await _stuur(client, {"type": f"{DOMAIN}/media/search", "query": "jazz"})
    assert not antwoord["success"]
    assert antwoord["error"]["code"] == "not_found"
    assert "Music Assistant" in antwoord["error"]["message"]


async def test_search_weigert_een_lege_limiet(hass: HomeAssistant, hass_ws_client) -> None:
    """De limiet zit aan een boven- en ondergrens vast.

    Niet uit netheid: `limit` gaat rechtstreeks naar Music Assistant, en een
    zoekopdracht zonder plafond laat de providers erachter alles ophoesten wat
    ze hebben.
    """
    await zet_integratie_op(hass)
    client = await hass_ws_client(hass)

    antwoord = await _stuur(
        client, {"type": f"{DOMAIN}/media/search", "query": "jazz", "limit": 500}
    )
    assert not antwoord["success"]
    assert antwoord["error"]["code"] == "invalid_format"
