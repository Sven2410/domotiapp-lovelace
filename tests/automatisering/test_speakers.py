"""Speakers van Music Assistant in de regels en de favorieten (0.101.0).

De eigenaar, 2 november 2026: "ik wil dat de klant in de automatisering kaart ook media kan afspelen. Nu heb je
verlichting en rolluiken". Alles NIEUW GEDRAG: op 0.100.2 weigert de server een `media_player` in een regel.
"""

from __future__ import annotations

from typing import Any

import pytest

from homeassistant.const import EVENT_HOMEASSISTANT_STOP
from homeassistant.core import HomeAssistant, ServiceCall

from custom_components.domotiapp_lovelace.automatisering.const import DATA_MOTOR
from custom_components.domotiapp_lovelace.const import DOMAIN

from .conftest import KAART, WOONKAMER, laat_starten, om, regel, tik, zet_dashboard

T = f"{DOMAIN}/automatisering"
KEUKEN_SPK = "media_player.keuken"
BAD_SPK = "media_player.badkamer"
TV = "media_player.tv"
KAART_SPEAKER = {**KAART, "speakers": [{"entity": KEUKEN_SPK, "name": "Keuken"}, BAD_SPK]}
LIJST = {"uri": "library://playlist/12", "naam": "Ochtend", "soort": "playlist", "beeld": "https://ma.local/hoes.jpg"}


@pytest.fixture
def spelers(hass: HomeAssistant) -> list[tuple[str, str, dict[str, Any]]]:
    """Nep-diensten van media_player en Music Assistant, op volgorde: (domein, dienst, data)."""
    aanroepen: list[tuple[str, str, dict[str, Any]]] = []

    async def ontvang(call: ServiceCall) -> None:
        aanroepen.append((call.domain, call.service, dict(call.data)))

    for dienst in ("volume_set", "media_stop", "media_play"):
        hass.services.async_register("media_player", dienst, ontvang)
    hass.services.async_register("music_assistant", "play_media", ontvang)
    for ident in (KEUKEN_SPK, BAD_SPK):
        hass.states.async_set(ident, "idle", {"mass_player_type": "player"})
    return aanroepen


@pytest.fixture
async def motor(hass: HomeAssistant, opgezet, spelers, freezer):
    await zet_dashboard(hass, [KAART_SPEAKER])
    await opgezet.async_herlees()
    return opgezet


@pytest.fixture
async def ws(hass: HomeAssistant, motor, hass_ws_client, hass_read_only_access_token):
    """Een gewone gebruiker: juist voor die is de kaart er."""
    return await hass_ws_client(hass, hass_read_only_access_token)


async def _vraag(ws, **bericht: Any) -> dict[str, Any]:
    await ws.send_json_auto_id(bericht)
    return await ws.receive_json()


def _maak(motor, **extra) -> None:
    motor.opslag.zet_regel({"id": "r1", "actief": True, "vakantie": False, **regel(**extra)})
    motor.regels_gewijzigd()


def _wekker(**extra: Any) -> dict[str, Any]:
    return {
        "lampen": [KEUKEN_SPK, BAD_SPK],
        "helderheden": {KEUKEN_SPK: 30, BAD_SPK: 30},
        "media": LIJST,
        "aan": {"soort": "tijd", "tijd": "07:00"},
        "uit": {"soort": "tijd", "tijd": "08:00"},
        **extra,
    }


# ------------------------------------------------------------------------- de klok


async def test_aan_is_eerst_het_volume_en_dan_afspelen_en_uit_is_stoppen(
    hass: HomeAssistant, motor, spelers, freezer
) -> None:
    _maak(motor, **_wekker())
    await tik(hass, freezer, om(3, 7))
    assert spelers == [
        ("media_player", "volume_set", {"entity_id": [KEUKEN_SPK, BAD_SPK], "volume_level": 0.3}),
        (
            "music_assistant",
            "play_media",
            {
                "entity_id": [KEUKEN_SPK, BAD_SPK],
                "media_id": "library://playlist/12",
                "media_type": "playlist",
                "enqueue": "replace",
            },
        ),
    ]
    spelers.clear()
    await tik(hass, freezer, om(3, 8))
    assert spelers == [("media_player", "media_stop", {"entity_id": [KEUKEN_SPK, BAD_SPK]})]


async def test_zonder_media_speelt_hij_verder_waar_hij_was(hass: HomeAssistant, motor, spelers, freezer) -> None:
    _maak(motor, **_wekker(media=None, lampen=[KEUKEN_SPK], helderheden={KEUKEN_SPK: 40}))
    await tik(hass, freezer, om(3, 7))
    assert spelers == [
        ("media_player", "volume_set", {"entity_id": [KEUKEN_SPK], "volume_level": 0.4}),
        ("media_player", "media_play", {"entity_id": [KEUKEN_SPK]}),
    ]


async def test_lampen_en_speakers_in_een_regel(hass: HomeAssistant, motor, spelers, lampen, freezer) -> None:
    _maak(motor, **_wekker(lampen=[WOONKAMER, KEUKEN_SPK], helderheden={WOONKAMER: 60, KEUKEN_SPK: 20}))
    await tik(hass, freezer, om(3, 7))
    assert lampen == [("turn_on", {"entity_id": [WOONKAMER], "brightness_pct": 60})]
    assert [d for _, d, _ in spelers] == ["volume_set", "play_media"]


async def _herstart(hass: HomeAssistant, freezer, tot) -> None:
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    hass.bus.async_fire(EVENT_HOMEASSISTANT_STOP)
    await hass.async_block_till_done()
    await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    freezer.move_to(tot)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await hass.data[DOMAIN][DATA_MOTOR].async_herlees()
    await laat_starten(hass, freezer, tot)


async def test_gemiste_muziek_begint_na_een_herstart_niet_alsnog_maar_de_lamp_wel(
    hass: HomeAssistant, motor, spelers, lampen, freezer
) -> None:
    """Aan om 07:00, Home Assistant weg van 06:50 tot 07:30: de lamp gaat alsnog aan, de wekkerlijst blijft stil.

    Slaagt ook op 0.100.2, maar daar omdat die speakers helemaal niet kent; dat ze hier wél kunnen spelen, toont
    `test_een_paar_minuten_te_laat_speelt_hij_nog_wel`.
    """
    _maak(motor, **_wekker(lampen=[WOONKAMER, KEUKEN_SPK], helderheden={WOONKAMER: 60, KEUKEN_SPK: 20}))
    await tik(hass, freezer, om(3, 6, 50))
    await _herstart(hass, freezer, om(3, 7, 30))
    assert lampen == [("turn_on", {"entity_id": [WOONKAMER], "brightness_pct": 60})]
    assert spelers == []


async def test_een_paar_minuten_te_laat_speelt_hij_nog_wel(hass: HomeAssistant, motor, spelers, freezer) -> None:
    _maak(motor, **_wekker())
    await tik(hass, freezer, om(3, 6, 59))
    await _herstart(hass, freezer, om(3, 7, 2))
    assert [d for _, d, _ in spelers] == ["volume_set", "play_media"]


async def test_gemist_stoppen_wordt_wel_ingehaald(hass: HomeAssistant, motor, spelers, freezer) -> None:
    _maak(motor, **_wekker())
    await tik(hass, freezer, om(3, 7))
    spelers.clear()
    await tik(hass, freezer, om(3, 7, 50))
    await _herstart(hass, freezer, om(3, 9))
    assert spelers == [("media_player", "media_stop", {"entity_id": [KEUKEN_SPK, BAD_SPK]})]


# ------------------------------------------------------------------- de commando's


async def test_een_gewone_gebruiker_slaat_een_regel_met_muziek_op(ws, motor) -> None:
    uit = await _vraag(ws, type=f"{T}/opslaan", regel={**_wekker(), "dagen": [0, 1, 2, 3, 4]})
    assert uit["success"], uit
    opgeslagen = motor.opslag.regels[0]
    assert opgeslagen["media"] == LIJST
    assert opgeslagen["helderheden"] == {KEUKEN_SPK: 30, BAD_SPK: 30}


async def test_een_speaker_die_niet_op_de_kaart_staat_weigert_de_server(ws, motor) -> None:
    uit = await _vraag(ws, type=f"{T}/opslaan", regel={**_wekker(lampen=[TV], helderheden={TV: 30}), "dagen": [0]})
    assert uit["error"]["code"] == "not_allowed"


async def test_een_onbekende_soort_of_een_lege_uri_weigert_de_server(ws, motor) -> None:
    """Slaagt ook op 0.100.2, die elke speaker weigert; hier gaat het om de toets op `media`."""
    for media in ({**LIJST, "soort": "video"}, {**LIJST, "uri": ""}):
        uit = await _vraag(ws, type=f"{T}/opslaan", regel={**_wekker(media=media), "dagen": [0]})
        assert not uit["success"], media


async def test_media_zonder_speaker_blijft_niet_staan(ws, motor) -> None:
    uit = await _vraag(
        ws,
        type=f"{T}/opslaan",
        regel={**_wekker(lampen=[WOONKAMER], helderheden={WOONKAMER: 60}), "dagen": [0]},
    )
    assert uit["success"], uit
    assert motor.opslag.regels[0]["media"] is None


async def test_een_favoriet_stopt_de_muziek_en_een_andere_speelt_af(hass: HomeAssistant, ws, motor, spelers) -> None:
    stil = await _vraag(
        ws,
        type=f"{T}/favoriet_opslaan",
        favoriet={"naam": "Woning verlaten", "lampen": [KEUKEN_SPK, BAD_SPK], "helderheden": {KEUKEN_SPK: 0, BAD_SPK: 0}},
    )
    assert stil["success"], stil
    await _vraag(ws, type=f"{T}/favoriet_uitvoeren", favoriet=stil["result"]["favoriet"]["id"])
    await hass.async_block_till_done()
    assert spelers == [("media_player", "media_stop", {"entity_id": [KEUKEN_SPK, BAD_SPK]})]

    spelers.clear()
    film = await _vraag(
        ws,
        type=f"{T}/favoriet_opslaan",
        favoriet={"naam": "Diner", "lampen": [KEUKEN_SPK], "helderheden": {KEUKEN_SPK: 15}, "media": LIJST},
    )
    assert film["result"]["favoriet"]["media"] == LIJST
    await _vraag(ws, type=f"{T}/favoriet_uitvoeren", favoriet=film["result"]["favoriet"]["id"])
    await hass.async_block_till_done()
    assert [d for _, d, _ in spelers] == ["volume_set", "play_media"]
    assert spelers[0][2]["volume_level"] == 0.15


async def test_regels_met_alleen_lampen_blijven_zoals_ze_waren(hass: HomeAssistant, motor, spelers, lampen, freezer) -> None:
    """REGRESSIEWACHT: een regel van voor 0.101.0, zonder media, doet hetzelfde als altijd."""
    _maak(motor)
    await tik(hass, freezer, om(2, 18))
    assert lampen == [("turn_on", {"entity_id": [WOONKAMER], "brightness_pct": 60})]
    assert spelers == []
