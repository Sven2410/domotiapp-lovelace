"""De commando's van de meldingenkaart. Alles **NIEUW GEDRAG**."""

from __future__ import annotations

from homeassistant.core import HomeAssistant

from .conftest import LIEKE, SVEN


async def test_een_kaart_krijgt_de_stand_en_elke_wijziging(
    hass: HomeAssistant, motor, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "domotiapp_lovelace/meldingen/subscribe", "melding": "afval"})
    assert (await client.receive_json())["success"]
    eerste = (await client.receive_json())["event"]
    assert eerste["bekend"] is True
    assert eerste["aan"] == {}
    # De telefoon uit de YAML gaat voor wat er gezocht zou worden.
    assert eerste["telefoons"][SVEN] == "test_sven"

    await client.send_json(
        {"id": 2, "type": "domotiapp_lovelace/meldingen/aan", "melding": "afval", "persoon": LIEKE, "aan": False}
    )
    # Eerst de wijziging bij de abonnee, dan het antwoord op het commando.
    bericht = await client.receive_json()
    assert bericht["id"] == 1
    assert bericht["event"]["aan"] == {LIEKE: False}
    assert (await client.receive_json())["result"] == {"aan": False}
    assert motor.opslag.aan("afval", LIEKE) is False


async def test_omzetten_mag_iedereen_een_proef_alleen_de_beheerder(
    hass: HomeAssistant, motor, telefoons, hass_ws_client, hass_read_only_access_token
) -> None:
    kiosk = await hass_ws_client(hass, hass_read_only_access_token)
    await kiosk.send_json(
        {"id": 1, "type": "domotiapp_lovelace/meldingen/aan", "melding": "afval", "persoon": SVEN, "aan": False}
    )
    assert (await kiosk.receive_json())["success"]

    await kiosk.send_json({"id": 2, "type": "domotiapp_lovelace/meldingen/proef", "melding": "afval", "moment": "morgen"})
    antwoord = await kiosk.receive_json()
    assert antwoord["success"] is False
    assert antwoord["error"]["code"] == "unauthorized"
    assert telefoons == []

    beheerder = await hass_ws_client(hass)
    await beheerder.send_json(
        {"id": 1, "type": "domotiapp_lovelace/meldingen/proef", "melding": "afval", "moment": "morgen"}
    )
    antwoord = await beheerder.receive_json()
    # Sven staat uit, dus alleen Lieke.
    assert antwoord["result"]["verstuurd"] == [LIEKE]
    assert [d for d, _ in telefoons] == ["test_lieke"]


async def test_alleen_personen(hass: HomeAssistant, motor, hass_ws_client) -> None:
    client = await hass_ws_client(hass)
    await client.send_json(
        {"id": 1, "type": "domotiapp_lovelace/meldingen/aan", "melding": "afval", "persoon": "notify.x", "aan": False}
    )
    assert (await client.receive_json())["success"] is False
