"""Geval C uit SPEC 18.2: het bestand parseert, maar `data.groups` is geen object.

Dit gedrag is in fase 3b aangescherpt. **De code van vóór die aanscherping
faalt op deze tests**: die logde wel een `ERROR`, maar ging daarna verder met
een lege staat — en een volgende `scenes/save` schreef dan gewoon over de
onleesbare inhoud heen. Dat is precies wat SPEC 18.1 verbiedt.
"""

from __future__ import annotations

from typing import Any

import pytest

from homeassistant.core import HomeAssistant

from custom_components.domotiapp_lovelace.const import ISSUE_STORE_UNUSABLE, STORAGE_KEY
from custom_components.domotiapp_lovelace.store import SceneStore, StoreUnusableError

from .conftest import GROEP_ENTITY_ID, registreer_lichtgroep, zet_integratie_op

# Vormen die geen object met registry-entry-ID's zijn.
ONBRUIKBARE_VORMEN: list[tuple[str, Any]] = [
    ("een lijst", []),
    ("een gevulde lijst", [{"last_known_entity_id": "light.a", "scenes": []}]),
    ("een string", "kwijt"),
    ("null", None),
    ("een getal", 42),
]


def _zet_onbruikbaar(hass_storage: dict[str, Any], groups: Any) -> None:
    """Zet opslag klaar waarvan `groups` niet het verwachte object is."""
    hass_storage[STORAGE_KEY] = {
        "version": 1,
        "minor_version": 1,
        "key": STORAGE_KEY,
        "data": {"groups": groups},
    }


@pytest.mark.parametrize(("vorm", "groups"), ONBRUIKBARE_VORMEN)
async def test_onbruikbare_opslag_wordt_herkend(
    hass: HomeAssistant, hass_storage, caplog: pytest.LogCaptureFixture, vorm, groups
) -> None:
    """NIEUW GEDRAG — SPEC 18.2 geval C regel 1 en 2.

    De hele opslag geldt als onbruikbaar, en dat wordt op `ERROR` gelogd.
    """
    _zet_onbruikbaar(hass_storage, groups)

    store = SceneStore(hass)
    await store.async_load()

    with pytest.raises(StoreUnusableError):
        store.async_get_group("wat-dan-ook")

    fouten = [
        record
        for record in caplog.records
        if record.levelname == "ERROR" and "onbruikbaar" in record.getMessage()
    ]
    assert len(fouten) == 1, vorm


async def test_onbruikbare_opslag_wordt_niet_overschreven(
    hass: HomeAssistant, hass_storage, lees_opslag
) -> None:
    """NIEUW GEDRAG — SPEC 18.2 geval C regel 4, de kern van dit geval.

    Faalt op de code van vóór fase 3b: die schreef bij de eerste `save` een
    vers `{"groups": {...}}` over de onleesbare inhoud heen, waarmee het
    origineel definitief weg was.
    """
    from custom_components.domotiapp_lovelace.store import valideer_scenes

    origineel = ["dit was ooit iets", {"en": "dit ook"}]
    _zet_onbruikbaar(hass_storage, origineel)
    voor = lees_opslag()

    store = SceneStore(hass)
    await store.async_load()

    scenes = valideer_scenes(
        [
            {"icon": "mdi:x", "lights": {}},
            {"icon": "mdi:y", "lights": {}},
            {"icon": "mdi:z", "lights": {}},
        ]
    )

    with pytest.raises(StoreUnusableError):
        await store.async_save_group("groep", GROEP_ENTITY_ID, scenes)

    with pytest.raises(StoreUnusableError):
        await store.async_delete_group("groep")

    # Er is niets geschreven; het bestand staat er nog precies zo.
    assert lees_opslag() == voor
    assert lees_opslag()["data"]["groups"] == origineel


async def test_onbruikbare_opslag_geeft_een_reparatiemelding(
    hass: HomeAssistant, hass_storage, issue_registry
) -> None:
    """NIEUW GEDRAG — SPEC 18.2 geval C regel 3."""
    _zet_onbruikbaar(hass_storage, "kwijt")

    store = SceneStore(hass)
    await store.async_load()

    melding = issue_registry.async_get_issue("domotiapp_lovelace", ISSUE_STORE_UNUSABLE)
    assert melding is not None
    assert melding.translation_key == "opslag_onbruikbaar"


async def test_gezonde_opslag_heeft_geen_melding(
    hass: HomeAssistant, issue_registry
) -> None:
    """REGRESSIEWACHT — de melding mag niet blijven hangen als alles klopt."""
    store = SceneStore(hass)
    await store.async_load()

    assert (
        issue_registry.async_get_issue("domotiapp_lovelace", ISSUE_STORE_UNUSABLE) is None
    )


async def test_lijst_is_leeg_bij_onbruikbare_opslag(
    hass: HomeAssistant, hass_storage
) -> None:
    """NIEUW GEDRAG — SPEC 18.2 geval C regel 6: er zijn geen sleutels te tonen."""
    _zet_onbruikbaar(hass_storage, [{"iets": "anders"}])

    store = SceneStore(hass)
    await store.async_load()

    assert store.async_list_groups() == []


async def test_commandos_bij_onbruikbare_opslag(
    hass: HomeAssistant, hass_storage, hass_ws_client, lees_opslag, geldige_scenes
) -> None:
    """NIEUW GEDRAG — SPEC 18.2 geval C regel 5 en 6, over de WebSocket."""
    _zet_onbruikbaar(hass_storage, ["kapot"])
    voor = lees_opslag()

    registreer_lichtgroep(hass)
    await zet_integratie_op(hass)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {"type": "domotiapp_lovelace/scenes/get", "entity_id": GROEP_ENTITY_ID}
    )
    ophalen = await client.receive_json()
    assert ophalen["success"] is False
    assert ophalen["error"]["code"] == "home_assistant_error"

    await client.send_json_auto_id(
        {
            "type": "domotiapp_lovelace/scenes/save",
            "entity_id": GROEP_ENTITY_ID,
            "scenes": geldige_scenes,
        }
    )
    opslaan = await client.receive_json()
    assert opslaan["success"] is False
    assert opslaan["error"]["code"] == "home_assistant_error"

    await client.send_json_auto_id({"type": "domotiapp_lovelace/storage/list"})
    lijst = await client.receive_json()
    assert lijst["success"] is True
    assert lijst["result"] == {"groups": []}

    await client.send_json_auto_id(
        {"type": "domotiapp_lovelace/storage/delete", "registry_entry_id": "iets"}
    )
    verwijderen = await client.receive_json()
    assert verwijderen["success"] is False
    assert verwijderen["error"]["code"] == "home_assistant_error"

    # En na dat alles staat het bestand er nog onaangeroerd.
    assert lees_opslag() == voor


async def test_herstel_na_opruimen_van_het_bestand(
    hass: HomeAssistant, hass_storage, hass_ws_client, geldige_scenes
) -> None:
    """NIEUW GEDRAG — de uitweg uit SPEC 18.2 geval C.

    Het bestand verwijderen en de integratie opnieuw laden brengt alles terug
    in een werkende toestand, en de reparatiemelding verdwijnt.
    """
    _zet_onbruikbaar(hass_storage, "kwijt")

    store = SceneStore(hass)
    await store.async_load()
    with pytest.raises(StoreUnusableError):
        store.async_get_group("x")

    # De admin verwijdert het bestand en HA laadt opnieuw.
    hass_storage.pop(STORAGE_KEY)

    registreer_lichtgroep(hass)
    await zet_integratie_op(hass)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {
            "type": "domotiapp_lovelace/scenes/save",
            "entity_id": GROEP_ENTITY_ID,
            "scenes": geldige_scenes,
        }
    )
    assert (await client.receive_json())["success"] is True

    await client.send_json_auto_id(
        {"type": "domotiapp_lovelace/scenes/get", "entity_id": GROEP_ENTITY_ID}
    )
    antwoord = await client.receive_json()
    assert antwoord["success"] is True
    assert antwoord["result"]["scenes"] == geldige_scenes
