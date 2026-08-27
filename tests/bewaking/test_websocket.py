"""De commando's van de bewaking. Alles **NIEUW GEDRAG**."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant

from .conftest import CAMERA, MELDER_PERSOON, MELDER_VOERTUIG, detecteer

CAMERA2 = "camera.achterdeur"


async def _save(client, **velden) -> dict[str, Any]:
    regel = {
        "camera": CAMERA,
        "aan": True,
        "melders": [MELDER_PERSOON],
        **velden,
    }
    await client.send_json_auto_id(
        {"type": "domotiapp_lovelace/bewaking/save", "regel": regel}
    )
    return await client.receive_json()


async def test_save_gevolgd_door_get_geeft_dezelfde_regel(
    hass: HomeAssistant, bewaking_op, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)

    opslaan = await _save(client, rustperiode=120, wachttijd=3, namen={MELDER_PERSOON: "Persoon"})
    assert opslaan["success"] is True

    await client.send_json_auto_id(
        {"type": "domotiapp_lovelace/bewaking/get", "camera": CAMERA}
    )
    ophalen = await client.receive_json()

    assert ophalen["success"] is True
    regel = ophalen["result"]["regels"][CAMERA]
    assert regel["aan"] is True
    assert regel["melders"] == [MELDER_PERSOON]
    assert regel["rustperiode"] == 120
    assert regel["wachttijd"] == 3
    assert regel["namen"] == {MELDER_PERSOON: "Persoon"}


async def test_de_standaarden_staan_in_het_antwoord(
    hass: HomeAssistant, bewaking_op, hass_ws_client
) -> None:
    """De editor hoeft ze niet zelf te weten; anders lopen ze uit elkaar."""
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "domotiapp_lovelace/bewaking/get"})
    antwoord = await client.receive_json()

    assert antwoord["result"]["standaard"] == {"rustperiode": 60, "wachttijd": 0}
    assert antwoord["result"]["grenzen"] == {"max_per_camera": 500, "max_dagen": 7}


async def test_een_persoon_zonder_telefoon_blijft_in_de_lijst_staan(
    hass: HomeAssistant, bewaking_op, hass_ws_client
) -> None:
    """Met `dienst: null`. Hem verbergen levert de vraag op waaróm hij weg is."""
    hass.states.async_set("person.sven", "home", {"friendly_name": "Sven"})
    client = await hass_ws_client(hass)

    await client.send_json_auto_id({"type": "domotiapp_lovelace/bewaking/get"})
    antwoord = await client.receive_json()

    personen = antwoord["result"]["personen"]
    assert personen == [
        {"entity_id": "person.sven", "naam": "Sven", "dienst": None, "thuis": True}
    ]


async def test_een_ongeldige_regel_wordt_geweigerd_met_uitleg(
    hass: HomeAssistant, bewaking_op, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)

    antwoord = await _save(client, camera="niet_eens_een_entiteit")

    assert antwoord["success"] is False
    assert antwoord["error"]["code"] == "invalid_format"
    assert "camera.oprit" in antwoord["error"]["message"]


async def test_een_rustperiode_buiten_de_grenzen_wordt_geweigerd(
    hass: HomeAssistant, bewaking_op, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)
    antwoord = await _save(client, rustperiode=999999)
    assert antwoord["success"] is False
    assert antwoord["error"]["code"] == "invalid_format"


async def test_opslaan_zet_de_motor_er_meteen_op(
    hass: HomeAssistant, bewaking_op, hass_ws_client, index
) -> None:
    """Zonder herstart en zonder herladen van de config entry."""
    client = await hass_ws_client(hass)
    await _save(client)

    await detecteer(hass, MELDER_PERSOON)

    assert len(index().alle()) == 1


async def test_de_timeline_komt_nieuwste_eerst_met_een_url(
    hass: HomeAssistant, bewaking_op, zet_regel, hass_ws_client
) -> None:
    await zet_regel(rustperiode=0)
    await detecteer(hass, MELDER_VOERTUIG)
    await detecteer(hass, MELDER_PERSOON)

    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "domotiapp_lovelace/bewaking/timeline"})
    antwoord = await client.receive_json()

    beelden = antwoord["result"]["beelden"]
    assert [b["melder"] for b in beelden] == [MELDER_PERSOON, MELDER_VOERTUIG]
    for beeld in beelden:
        assert beeld["url"].startswith("/api/domotiapp_lovelace/beeld/")
        # Ondertekend, dus bruikbaar in een <img> zonder header.
        assert "authSig=" in beeld["url"]


async def test_de_timeline_mengt_de_cameras_van_de_kaart(
    hass: HomeAssistant, bewaking_op, zet_regel, hass_ws_client, index
) -> None:
    """Op verzoek van 27 augustus 2026: één strook, op tijd, alle camera's.

    En het filter werkt: een camera die niet op de kaart staat blijft eruit.
    """
    await zet_regel(rustperiode=0)
    await detecteer(hass, MELDER_PERSOON)
    # Een beeld van een andere camera, zoals een tweede kaartregel dat zou doen.
    index().voeg_toe(
        {
            "id": "01AAAAAAAAAAAAAAAAAAAAAAAA",
            "camera": CAMERA2,
            "melder": "binary_sensor.achterdeur",
            "naam": "Achterdeur",
            "tijd": "2026-08-27T23:59:00+00:00",
        }
    )

    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {"type": "domotiapp_lovelace/bewaking/timeline", "cameras": [CAMERA, CAMERA2]}
    )
    beide = (await client.receive_json())["result"]["beelden"]
    assert {b["camera"] for b in beide} == {CAMERA, CAMERA2}

    await client.send_json_auto_id(
        {"type": "domotiapp_lovelace/bewaking/timeline", "cameras": [CAMERA]}
    )
    alleen = (await client.receive_json())["result"]["beelden"]
    assert {b["camera"] for b in alleen} == {CAMERA}


async def test_een_abonnee_krijgt_een_nieuw_beeld_binnen(
    hass: HomeAssistant, bewaking_op, zet_regel, hass_ws_client
) -> None:
    """Zo blijft een wandtablet met een open kaart bij zonder te pollen."""
    await zet_regel()
    client = await hass_ws_client(hass)

    await client.send_json_auto_id({"type": "domotiapp_lovelace/bewaking/subscribe"})
    assert (await client.receive_json())["success"] is True

    await detecteer(hass, MELDER_PERSOON)

    bericht = await client.receive_json()
    assert bericht["type"] == "event"
    assert bericht["event"]["soort"] == "nieuw"
    assert bericht["event"]["beeld"]["camera"] == CAMERA
    assert "authSig=" in bericht["event"]["beeld"]["url"]


async def test_een_abonnee_met_een_camerafilter_krijgt_de_rest_niet(
    hass: HomeAssistant, bewaking_op, zet_regel, hass_ws_client
) -> None:
    await zet_regel()
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {"type": "domotiapp_lovelace/bewaking/subscribe", "cameras": [CAMERA2]}
    )
    assert (await client.receive_json())["success"] is True

    await detecteer(hass, MELDER_PERSOON)

    # Niets van deze camera; wel gewoon antwoord op het volgende commando.
    await client.send_json_auto_id({"type": "domotiapp_lovelace/bewaking/timeline"})
    volgende = await client.receive_json()
    assert volgende["type"] == "result"


async def test_opzeggen_laat_geen_abonnee_achter(
    hass: HomeAssistant, bewaking_op, zet_regel, hass_ws_client
) -> None:
    from custom_components.domotiapp_lovelace.bewaking.const import DATA_ABONNEES
    from custom_components.domotiapp_lovelace.const import DOMAIN

    await zet_regel()
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "domotiapp_lovelace/bewaking/subscribe"})
    inschrijving = await client.receive_json()
    assert len(hass.data[DOMAIN][DATA_ABONNEES]) == 1

    await client.send_json_auto_id(
        {"type": "unsubscribe_events", "subscription": inschrijving["id"]}
    )
    await client.receive_json()

    assert hass.data[DOMAIN][DATA_ABONNEES] == []
