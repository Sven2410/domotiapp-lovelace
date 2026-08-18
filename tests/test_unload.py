"""Wat de WebSocket-commando's doen nadat de integratie verwijderd is.

De commando's worden per HA-run één keer geregistreerd en zijn **niet af te
melden** — HA kent geen `async_unregister_command`. Een client die de kaart nog
op een dashboard heeft staan, blijft dus commando's sturen nadat de integratie
is verwijderd. Dit bestand legt vast wat er dan gebeurt (SPEC 11.7).
"""

from __future__ import annotations

from typing import Any

import pytest

from homeassistant.core import HomeAssistant

from custom_components.domotiapp_lovelace.const import DATA_STORE, DOMAIN

from .conftest import GROEP_ENTITY_ID, registreer_lichtgroep, zet_integratie_op


async def _alle_commandos(client, scenes: Any) -> dict[str, Any]:
    """Roep alle vier de commando's aan en geef per commando het antwoord."""
    resultaten: dict[str, Any] = {}

    await client.send_json_auto_id(
        {"type": "domotiapp_lovelace/scenes/get", "entity_id": GROEP_ENTITY_ID}
    )
    resultaten["scenes/get"] = await client.receive_json()

    await client.send_json_auto_id(
        {
            "type": "domotiapp_lovelace/scenes/save",
            "entity_id": GROEP_ENTITY_ID,
            "scenes": scenes,
        }
    )
    resultaten["scenes/save"] = await client.receive_json()

    await client.send_json_auto_id({"type": "domotiapp_lovelace/storage/list"})
    resultaten["storage/list"] = await client.receive_json()

    await client.send_json_auto_id(
        {"type": "domotiapp_lovelace/storage/delete", "registry_entry_id": "wat-dan-ook"}
    )
    resultaten["storage/delete"] = await client.receive_json()

    return resultaten


async def test_commandos_weigeren_netjes_na_verwijderen(
    hass: HomeAssistant,
    hass_ws_client,
    lees_opslag,
    geldige_scenes,
    caplog: pytest.LogCaptureFixture,
) -> None:
    """REGRESSIEWACHT op een gerepareerde fout — faalt op de code van vóór fase 3b.

    Vóór de fix bleven alle vier de commando's gewoon werken nadat de config
    entry verwijderd was: `scenes/get` gaf scenes terug en `scenes/save` gaf
    `{"stored": True}` — een kaart die op een dashboard was blijven staan schreef
    dus door naar de opslag van een integratie die er niet meer was. Er was geen
    crash en geen traceback, maar wel precies het stille gedrag dat SPEC 18
    bestrijdt.

    Deze test faalt aantoonbaar op die code: daar was `success` `True` waar hier
    `not_allowed` wordt verwacht.
    """
    registreer_lichtgroep(hass)
    entry = await zet_integratie_op(hass)
    client = await hass_ws_client(hass)

    # Eerst iets opslaan, zodat er ook echt data is om per ongeluk te wijzigen.
    await client.send_json_auto_id(
        {
            "type": "domotiapp_lovelace/scenes/save",
            "entity_id": GROEP_ENTITY_ID,
            "scenes": geldige_scenes,
        }
    )
    assert (await client.receive_json())["success"] is True
    voor_verwijderen = lees_opslag()

    assert await hass.config_entries.async_remove(entry.entry_id)
    await hass.async_block_till_done()

    caplog.clear()
    resultaten = await _alle_commandos(client, geldige_scenes)

    # Alle vier weigeren, met dezelfde nette fout.
    for naam, antwoord in resultaten.items():
        assert antwoord["success"] is False, f"{naam} slaagde ten onrechte"
        assert antwoord["error"]["code"] == "not_allowed", naam
        assert antwoord["error"]["message"] == "DomotiApp Lovelace is niet geladen", naam

    # Geen onafgevangen exception en geen traceback in het log.
    assert not [record for record in caplog.records if record.exc_info]

    # En de opslag op schijf is niet aangeraakt.
    assert lees_opslag() == voor_verwijderen


async def test_opslaglaag_verdwijnt_bij_de_laatste_entry(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG — de guard uit de vorige test hangt hieraan.

    De opslaglaag wordt losgelaten zodra de laatste config entry weg is. De
    vlaggen die niet ongedaan te maken zijn — het statische pad en de
    WebSocket-registratie — blijven wél staan.
    """
    entry = await zet_integratie_op(hass)
    assert DATA_STORE in hass.data[DOMAIN]

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()

    assert DATA_STORE not in hass.data[DOMAIN]
    assert hass.data[DOMAIN]["ws_registered"] is True
    assert hass.data[DOMAIN]["static_path_registered"] is True


async def test_herladen_zet_de_opslaglaag_weer_terug(
    hass: HomeAssistant, hass_ws_client, geldige_scenes
) -> None:
    """REGRESSIEWACHT — een reload is unload + setup en mag niets breken.

    De opslaglaag wordt bij unload losgelaten en bij setup opnieuw ingelezen.
    Dat mag de opgeslagen scenes niet kwijtraken; ze komen na een reload gewoon
    weer van schijf.
    """
    registreer_lichtgroep(hass)
    entry = await zet_integratie_op(hass)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {
            "type": "domotiapp_lovelace/scenes/save",
            "entity_id": GROEP_ENTITY_ID,
            "scenes": geldige_scenes,
        }
    )
    assert (await client.receive_json())["success"] is True

    await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()

    assert DATA_STORE in hass.data[DOMAIN]

    await client.send_json_auto_id(
        {"type": "domotiapp_lovelace/scenes/get", "entity_id": GROEP_ENTITY_ID}
    )
    antwoord = await client.receive_json()

    assert antwoord["success"] is True
    assert antwoord["result"]["stored"] is True
    assert antwoord["result"]["scenes"] == geldige_scenes
