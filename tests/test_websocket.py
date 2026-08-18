"""Tests op de WebSocket-commando's (SPEC 11).

Alles hier is **NIEUW GEDRAG**: vóór fase 3 bestonden deze commando's niet.
Waar een test gedrag bewaakt dat elders al vastligt — HA's eigen rechten- of
schemabehandeling — staat dat als **REGRESSIEWACHT** in de docstring.
"""

from __future__ import annotations

from typing import Any

import pytest

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from custom_components.domotiapp_lovelace.const import DEFAULT_ICONS

from .conftest import (
    GROEP_ENTITY_ID,
    LEDEN,
    registreer_lichtgroep,
    zet_integratie_op,
)


async def _get(client, entity_id: str = GROEP_ENTITY_ID) -> dict[str, Any]:
    await client.send_json_auto_id(
        {"type": "domotiapp_lovelace/scenes/get", "entity_id": entity_id}
    )
    return await client.receive_json()


async def _save(
    client, scenes: Any, entity_id: str = GROEP_ENTITY_ID
) -> dict[str, Any]:
    await client.send_json_auto_id(
        {
            "type": "domotiapp_lovelace/scenes/save",
            "entity_id": entity_id,
            "scenes": scenes,
        }
    )
    return await client.receive_json()


# --------------------------------------------------------------------------
# 11.1 / 11.2 — de rondgang
# --------------------------------------------------------------------------


async def test_save_gevolgd_door_get_geeft_dezelfde_data(
    hass: HomeAssistant, opgezet, hass_ws_client, geldige_scenes
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 1.

    Een geldige save gevolgd door een get levert exact dezelfde data op.
    """
    registreer_lichtgroep(hass)
    client = await hass_ws_client(hass)

    opslaan = await _save(client, geldige_scenes)
    assert opslaan["success"] is True
    assert opslaan["result"] == {"stored": True}

    ophalen = await _get(client)
    assert ophalen["success"] is True
    assert ophalen["result"]["scenes"] == geldige_scenes
    assert ophalen["result"]["stored"] is True
    assert ophalen["result"]["member_entity_ids"] == LEDEN


async def test_get_zonder_opslag_geeft_lege_scenes(
    hass: HomeAssistant, opgezet, hass_ws_client
) -> None:
    """NIEUW GEDRAG — SPEC 11.1: drie lege scenes en stored: false."""
    registreer_lichtgroep(hass)
    client = await hass_ws_client(hass)

    antwoord = await _get(client)

    assert antwoord["success"] is True
    assert antwoord["result"]["stored"] is False
    assert [scene["icon"] for scene in antwoord["result"]["scenes"]] == list(
        DEFAULT_ICONS
    )
    assert all(scene["lights"] == {} for scene in antwoord["result"]["scenes"])


async def test_get_op_onbekende_entiteit_geeft_not_found(
    hass: HomeAssistant, opgezet, hass_ws_client
) -> None:
    """NIEUW GEDRAG — SPEC 11.1 foutentabel."""
    client = await hass_ws_client(hass)
    antwoord = await _get(client, "light.bestaat_niet")

    assert antwoord["success"] is False
    assert antwoord["error"]["code"] == "not_found"


async def test_get_op_gewone_lamp_geeft_not_allowed(
    hass: HomeAssistant, opgezet, hass_ws_client
) -> None:
    """NIEUW GEDRAG — SPEC 11.1: geen entity_id-attribuut is geen light group."""
    registry = er.async_get(hass)
    entry = registry.async_get_or_create("light", "demo", "losse-lamp")
    hass.states.async_set(entry.entity_id, "on", {"brightness": 100})

    client = await hass_ws_client(hass)
    antwoord = await _get(client, entry.entity_id)

    assert antwoord["success"] is False
    assert antwoord["error"]["code"] == "not_allowed"


async def test_get_buiten_light_domein_geeft_invalid_format(
    hass: HomeAssistant, opgezet, hass_ws_client
) -> None:
    """REGRESSIEWACHT — HA vertaalt vol.Invalid zelf naar invalid_format.

    Bewaakt dat het schema `cv.entity_domain("light")` blijft gebruiken; zonder
    dat zou een switch-entiteit tot een andere foutcode leiden.
    """
    client = await hass_ws_client(hass)
    antwoord = await _get(client, "switch.iets")

    assert antwoord["success"] is False
    assert antwoord["error"]["code"] == "invalid_format"


# --------------------------------------------------------------------------
# 11.2 — validatie schrijft niets weg
# --------------------------------------------------------------------------


@pytest.mark.parametrize(
    ("regel", "scenes"),
    [
        ("te weinig scenes", [{"icon": "mdi:x", "lights": {}}]),
        (
            "lege icon",
            [{"icon": "", "lights": {}}, *[{"icon": "mdi:x", "lights": {}}] * 2],
        ),
        (
            "off met brightness",
            [
                {
                    "icon": "mdi:x",
                    "lights": {"light.a": {"state": "off", "brightness": 5}},
                },
                *[{"icon": "mdi:x", "lights": {}}] * 2,
            ],
        ),
        (
            "twee kleurattributen",
            [
                {
                    "icon": "mdi:x",
                    "lights": {
                        "light.a": {
                            "state": "on",
                            "rgb_color": [1, 2, 3],
                            "color_temp_kelvin": 2700,
                        }
                    },
                },
                *[{"icon": "mdi:x", "lights": {}}] * 2,
            ],
        ),
        (
            "brightness 0",
            [
                {
                    "icon": "mdi:x",
                    "lights": {"light.a": {"state": "on", "brightness": 0}},
                },
                *[{"icon": "mdi:x", "lights": {}}] * 2,
            ],
        ),
        (
            "lampsleutel buiten light-domein",
            [
                {"icon": "mdi:x", "lights": {"switch.a": {"state": "on"}}},
                *[{"icon": "mdi:x", "lights": {}}] * 2,
            ],
        ),
    ],
)
async def test_ongeldige_save_geeft_invalid_format_en_schrijft_niets(
    hass: HomeAssistant,
    opgezet,
    hass_ws_client,
    lees_opslag,
    regel: str,
    scenes: Any,
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 2.

    Per validatieregel: een overtreding geeft `invalid_format` **en** er is
    niets weggeschreven (SPEC 11.2, "bij één fout wordt er niets geschreven").
    """
    registreer_lichtgroep(hass)
    client = await hass_ws_client(hass)

    voor = lees_opslag()

    antwoord = await _save(client, scenes)

    assert antwoord["success"] is False, regel
    assert antwoord["error"]["code"] == "invalid_format", regel
    assert lees_opslag() == voor, f"{regel}: er is toch geschreven"


async def test_ongeldige_save_overschrijft_bestaande_opslag_niet(
    hass: HomeAssistant, opgezet, hass_ws_client, lees_opslag, geldige_scenes
) -> None:
    """NIEUW GEDRAG — een tweede, ongeldige save laat de eerste intact."""
    registreer_lichtgroep(hass)
    client = await hass_ws_client(hass)

    assert (await _save(client, geldige_scenes))["success"] is True
    na_geldige_save = lees_opslag()

    antwoord = await _save(client, [{"icon": "mdi:x", "lights": {}}])
    assert antwoord["success"] is False
    assert antwoord["error"]["code"] == "invalid_format"

    assert lees_opslag() == na_geldige_save


# --------------------------------------------------------------------------
# Verplicht testgeval 3 — kapotte groep blokkeert gezonde groep niet
# --------------------------------------------------------------------------


async def test_kapotte_groep_blokkeert_andere_kamer_niet_via_websocket(
    hass: HomeAssistant,
    schrijf_opslag,
    lees_opslag,
    hass_ws_client,
    geldige_scenes,
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 3, over de hele keten.

    Dit is het kerngeval van fase 2b correctie 1. Twee kamers in één Store; de
    zolder is onleesbaar. Dan moet gelden:

    1. de zolder geeft zelf `home_assistant_error` op `scenes/get`;
    2. de slaapkamer kan gewoon opslaan — de kapotte kamer blokkeert niets;
    3. de kapotte data staat na die schrijfronde nog byte-voor-byte op schijf.

    De setup gebeurt binnen de test en niet via de `opgezet`-fixture: het
    Store-bestand moet er al staan vóór de opslaglaag het inleest, en de
    sleutel moet het echte registry-entry-ID van de zolder zijn.
    """
    # Twee light groups, allebei echt geregistreerd.
    zolder_id = registreer_lichtgroep(
        hass,
        entity_id="light.lampen_zolder",
        unique_id="groep-zolder",
        leden=["light.zolderlamp"],
    )
    slaapkamer_id = registreer_lichtgroep(hass)

    # De zolder heeft onleesbare opslag: twee scenes in plaats van drie, een
    # onbekende sleutel, en een lampwaarde die het schema verbiedt.
    kapot_ruw: dict[str, Any] = {
        "last_known_entity_id": "light.lampen_zolder",
        "scenes": [
            {"icon": "mdi:x", "lights": {"light.zolderlamp": {"state": "misschien"}}},
            {"icon": "mdi:y", "lights": {}},
        ],
        "iets_van_een_toekomstige_versie": {"blijft": "staan"},
    }
    schrijf_opslag({zolder_id: kapot_ruw})

    await zet_integratie_op(hass)
    client = await hass_ws_client(hass)

    # 1. De kapotte kamer meldt zich als onleesbaar.
    zolder = await _get(client, "light.lampen_zolder")
    assert zolder["success"] is False
    assert zolder["error"]["code"] == "home_assistant_error"

    # 2. De gezonde kamer opslaan lukt gewoon.
    opslaan = await _save(client, geldige_scenes)
    assert opslaan["success"] is True, opslaan.get("error")

    op_schijf = lees_opslag()["data"]["groups"]

    # 3. De kapotte data staat er nog precies zoals hij erin ging.
    assert op_schijf[zolder_id] == kapot_ruw
    # ... en de gezonde kamer is erbij gekomen.
    assert op_schijf[slaapkamer_id]["last_known_entity_id"] == GROEP_ENTITY_ID
    assert op_schijf[slaapkamer_id]["scenes"] == geldige_scenes

    # En de gezonde kamer is ook gewoon weer op te halen.
    ophalen = await _get(client)
    assert ophalen["success"] is True
    assert ophalen["result"]["scenes"] == geldige_scenes


async def test_onbruikbare_opslag_wordt_niet_overschreven_via_websocket(
    hass: HomeAssistant, schrijf_opslag, lees_opslag, hass_ws_client, geldige_scenes
) -> None:
    """REGRESSIEWACHT op een gerepareerde fout — SPEC 18.2 geval C regel 4 en 5.

    Faalt aantoonbaar op de code van vóór fase 3b. Daar werd een `groups` die
    geen object is wel gelogd, maar daarna ging de opslaglaag verder met een
    lege staat — en de eerstvolgende `scenes/save` schreef een vers
    `{"groups": {...}}` over de onleesbare inhoud heen. Het origineel was dan
    definitief weg, precies wat SPEC 18.1 verbiedt.

    Deze test gebruikt bewust alleen bestaande symbolen, zodat hij ook tegen de
    oude code te draaien is en daar op zijn assertie faalt in plaats van op een
    importfout.
    """
    registreer_lichtgroep(hass)

    # `groups` is een lijst in plaats van een object: er is geen sleutel per
    # groep, dus valt er niets per kamer te bewaren.
    schrijf_opslag(["dit was ooit iets", {"en": "dit ook"}])
    voor = lees_opslag()

    await zet_integratie_op(hass)
    client = await hass_ws_client(hass)

    antwoord = await _save(client, geldige_scenes)

    assert antwoord["success"] is False
    assert antwoord["error"]["code"] == "home_assistant_error"
    assert lees_opslag() == voor


async def test_opslaan_op_kapotte_kamer_wordt_geweigerd(
    hass: HomeAssistant, schrijf_opslag, lees_opslag, hass_ws_client, geldige_scenes
) -> None:
    """NIEUW GEDRAG — SPEC 18.2 regel 3: de kapotte kamer zelf blijft op slot."""
    zolder_id = registreer_lichtgroep(
        hass,
        entity_id="light.lampen_zolder",
        unique_id="groep-zolder",
        leden=["light.zolderlamp"],
    )
    kapot_ruw = {"last_known_entity_id": "light.lampen_zolder", "scenes": "onzin"}
    schrijf_opslag({zolder_id: kapot_ruw})

    await zet_integratie_op(hass)
    client = await hass_ws_client(hass)

    antwoord = await _save(client, geldige_scenes, entity_id="light.lampen_zolder")

    assert antwoord["success"] is False
    assert antwoord["error"]["code"] == "home_assistant_error"
    assert lees_opslag()["data"]["groups"][zolder_id] == kapot_ruw


# --------------------------------------------------------------------------
# Verplicht testgeval 4 — hernoemen
# --------------------------------------------------------------------------


async def test_hernoemen_laat_de_opslag_vindbaar(
    hass: HomeAssistant, opgezet, hass_ws_client, lees_opslag, geldige_scenes
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 4 (SPEC 13.1).

    Na een hernoeming van de light group zijn de scenes nog te vinden, want de
    sleutel is het registry-entry-ID en niet het entity-ID. Het leesbare label
    schuift mee.
    """
    registry_entry_id = registreer_lichtgroep(hass)
    client = await hass_ws_client(hass)

    assert (await _save(client, geldige_scenes))["success"] is True
    assert (
        lees_opslag()["data"]["groups"][registry_entry_id]["last_known_entity_id"]
        == GROEP_ENTITY_ID
    )

    # Hernoemen: entity-ID verandert, registry-entry-ID niet.
    nieuw = "light.lampen_grote_slaapkamer"
    er.async_get(hass).async_update_entity(GROEP_ENTITY_ID, new_entity_id=nieuw)
    await hass.async_block_till_done()
    hass.states.async_set(nieuw, "on", {"entity_id": LEDEN})

    # Het oude entity-ID bestaat niet meer.
    oud = await _get(client, GROEP_ENTITY_ID)
    assert oud["success"] is False
    assert oud["error"]["code"] == "not_found"

    # Het nieuwe wél, met exact dezelfde scenes.
    antwoord = await _get(client, nieuw)
    assert antwoord["success"] is True
    assert antwoord["result"]["stored"] is True
    assert antwoord["result"]["scenes"] == geldige_scenes

    # De sleutel is niet gewijzigd; alleen het label is bijgewerkt (SPEC 10.2).
    groepen = lees_opslag()["data"]["groups"]
    assert list(groepen) == [registry_entry_id]
    assert groepen[registry_entry_id]["last_known_entity_id"] == nieuw


# --------------------------------------------------------------------------
# 11.3 / 11.4 — storage/list en storage/delete
# --------------------------------------------------------------------------


async def test_storage_list_toont_opgeslagen_groepen(
    hass: HomeAssistant, opgezet, hass_ws_client, geldige_scenes
) -> None:
    """NIEUW GEDRAG — SPEC 11.3."""
    registry_entry_id = registreer_lichtgroep(hass)
    client = await hass_ws_client(hass)
    assert (await _save(client, geldige_scenes))["success"] is True

    await client.send_json_auto_id({"type": "domotiapp_lovelace/storage/list"})
    antwoord = await client.receive_json()

    assert antwoord["success"] is True
    (groep,) = antwoord["result"]["groups"]
    assert groep["registry_entry_id"] == registry_entry_id
    assert groep["last_known_entity_id"] == GROEP_ENTITY_ID
    assert groep["current_entity_id"] == GROEP_ENTITY_ID
    assert groep["exists"] is True
    assert groep["configured_light_count"] == [2, 2, 0]


async def test_storage_delete_op_verdwenen_entiteit_slaagt(
    hass: HomeAssistant, opgezet, hass_ws_client, lees_opslag, geldige_scenes
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 5 (SPEC 11.4, 13.2).

    Verwijderen gaat op registry-entry-ID, juist zodat het werkt als de
    entiteit niet meer bestaat.
    """
    registry_entry_id = registreer_lichtgroep(hass)
    client = await hass_ws_client(hass)
    assert (await _save(client, geldige_scenes))["success"] is True

    # De light group verdwijnt: uit het registry én uit de state machine.
    er.async_get(hass).async_remove(GROEP_ENTITY_ID)
    hass.states.async_remove(GROEP_ENTITY_ID)
    await hass.async_block_till_done()

    await client.send_json_auto_id({"type": "domotiapp_lovelace/storage/list"})
    lijst = await client.receive_json()
    (verweesd,) = lijst["result"]["groups"]
    assert verweesd["exists"] is False
    assert verweesd["current_entity_id"] is None
    assert verweesd["last_known_entity_id"] == GROEP_ENTITY_ID

    await client.send_json_auto_id(
        {
            "type": "domotiapp_lovelace/storage/delete",
            "registry_entry_id": registry_entry_id,
        }
    )
    antwoord = await client.receive_json()

    assert antwoord["success"] is True
    assert antwoord["result"] == {"deleted": True}
    assert lees_opslag()["data"]["groups"] == {}


async def test_storage_delete_op_onbekend_id_geeft_not_found(
    hass: HomeAssistant, opgezet, hass_ws_client
) -> None:
    """NIEUW GEDRAG — SPEC 11.4 foutentabel."""
    client = await hass_ws_client(hass)
    await client.send_json_auto_id(
        {"type": "domotiapp_lovelace/storage/delete", "registry_entry_id": "bestaat-niet"}
    )
    antwoord = await client.receive_json()

    assert antwoord["success"] is False
    assert antwoord["error"]["code"] == "not_found"


# --------------------------------------------------------------------------
# Verplicht testgeval 6 — rechten (SPEC 14)
# --------------------------------------------------------------------------


async def test_niet_admin_mag_scenes_lezen_en_opslaan(
    hass: HomeAssistant,
    opgezet,
    hass_ws_client,
    hass_read_only_access_token: str,
    geldige_scenes,
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 6, eerste helft.

    Klanten draaien Fully Kiosk met een niet-adminaccount en moeten hun scenes
    juist wél kunnen aanpassen (SPEC 14). Faalt dit, dan is het product stuk
    voor de doelgroep.
    """
    registreer_lichtgroep(hass)
    client = await hass_ws_client(hass, hass_read_only_access_token)

    opslaan = await _save(client, geldige_scenes)
    assert opslaan["success"] is True, opslaan.get("error")

    ophalen = await _get(client)
    assert ophalen["success"] is True
    assert ophalen["result"]["scenes"] == geldige_scenes


async def test_niet_admin_krijgt_unauthorized_op_storage_commandos(
    hass: HomeAssistant, opgezet, hass_ws_client, hass_read_only_access_token: str
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 6, tweede helft (SPEC 11.3, 11.4)."""
    registreer_lichtgroep(hass)
    client = await hass_ws_client(hass, hass_read_only_access_token)

    await client.send_json_auto_id({"type": "domotiapp_lovelace/storage/list"})
    lijst = await client.receive_json()
    assert lijst["success"] is False
    assert lijst["error"]["code"] == "unauthorized"

    await client.send_json_auto_id(
        {"type": "domotiapp_lovelace/storage/delete", "registry_entry_id": "wat-dan-ook"}
    )
    verwijderen = await client.receive_json()
    assert verwijderen["success"] is False
    assert verwijderen["error"]["code"] == "unauthorized"


async def test_admin_mag_de_storage_commandos_wel(
    hass: HomeAssistant, opgezet, hass_ws_client
) -> None:
    """REGRESSIEWACHT — bewaakt dat require_admin niet per ongeluk op alles staat."""
    client = await hass_ws_client(hass)

    await client.send_json_auto_id({"type": "domotiapp_lovelace/storage/list"})
    antwoord = await client.receive_json()

    assert antwoord["success"] is True
    assert antwoord["result"] == {"groups": []}
