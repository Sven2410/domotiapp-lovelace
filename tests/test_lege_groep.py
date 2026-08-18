"""De light group zonder `entity_id`-attribuut (fase 4a-bis).

Home Assistant laat **alle** extra state attributes weg zodra een entiteit niet
beschikbaar is (`helpers/entity.py:1118-1124`). Voor een light group betekent
dat: geen `entity_id`-attribuut zodra de groep `unavailable` is. En een groep is
`unavailable` in precies twee gevallen die er voor ons toe doen — nul leden, en
alle leden offline.

Vóór deze fase gaven beide gevallen `not_allowed` ("is geen lichtgroep"). Deze
tests leggen vast dat de ledenlijst dan uit de config entry van de groep komt.
Ze falen aantoonbaar op de code van vóór deze fase, waar `resolve_light_group`
alleen naar het state-attribuut keek.
"""

from __future__ import annotations

from typing import Any

import pytest

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.domotiapp_lovelace.store import (
    NotALightGroupError,
    resolve_light_group,
)

from .conftest import zet_integratie_op

LEDEN = ["light.plafond", "light.bedlamp", "light.leeslamp"]


def maak_light_group(
    hass: HomeAssistant,
    entity_id: str = "light.lampen_zolder",
    leden: list[str] | None = None,
    *,
    beschikbaar: bool,
    group_type: str = "light",
    unique_id: str = "groep-zolder",
) -> str:
    """Maak een light group helper zoals HA hem aanmaakt.

    De config entry draagt de ledenlijst; de state draagt hem alléén als de
    groep beschikbaar is. Dat is precies de situatie die deze fase adresseert.

    Geeft het registry-entry-ID terug.
    """
    leden = LEDEN if leden is None else leden

    config_entry = MockConfigEntry(
        domain="group",
        title="Lampen zolder",
        data={},
        options={
            "all": False,
            "entities": list(leden),
            "group_type": group_type,
            "hide_members": False,
            "name": "Lampen zolder",
        },
    )
    config_entry.add_to_hass(hass)

    registry = er.async_get(hass)
    entry = registry.async_get_or_create(
        "light",
        "group",
        unique_id,
        suggested_object_id=entity_id.split(".", 1)[1],
        config_entry=config_entry,
    )

    if beschikbaar:
        hass.states.async_set(entry.entity_id, "on", {"entity_id": list(leden)})
    else:
        # Zoals HA het schrijft voor een niet-beschikbare entiteit: geen enkele
        # extra state attribute.
        hass.states.async_set(
            entry.entity_id,
            "unavailable",
            {"supported_color_modes": ["onoff"], "friendly_name": "Lampen zolder"},
        )

    return entry.id


async def test_lege_light_group_geeft_lege_lijst(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG — verplicht testgeval 1 (SPEC 13.3).

    Een lege light group is altijd `unavailable` en heeft dus geen
    `entity_id`-attribuut. Vóór deze fase gaf dat `NotALightGroupError`, waardoor
    de kaart de foutkaart toonde in plaats van de uitgeschakelde knoppen.
    """
    registry_entry_id = maak_light_group(hass, leden=[], beschikbaar=False)

    gevonden, leden = resolve_light_group(hass, "light.lampen_zolder")

    assert gevonden == registry_entry_id
    assert leden == []


async def test_unavailable_light_group_geeft_alle_leden(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG — verplicht testgeval 2 (SPEC 13.6).

    Alle lampen offline maakt de groep `unavailable`, maar de kaart en de editor
    horen gewoon te werken.
    """
    registry_entry_id = maak_light_group(hass, beschikbaar=False)

    gevonden, leden = resolve_light_group(hass, "light.lampen_zolder")

    assert gevonden == registry_entry_id
    assert leden == LEDEN


async def test_beschikbare_groep_gebruikt_het_state_attribuut(
    hass: HomeAssistant,
) -> None:
    """REGRESSIEWACHT — de gewone route blijft de primaire.

    De state is hier bewust actueler dan de config entry: als de terugval ten
    onrechte voorgaat, valt dat hier op.
    """
    maak_light_group(hass, beschikbaar=True)
    hass.states.async_set(
        "light.lampen_zolder", "on", {"entity_id": ["light.nieuw_lid"]}
    )

    _rid, leden = resolve_light_group(hass, "light.lampen_zolder")

    assert leden == ["light.nieuw_lid"]


async def test_gewone_lamp_blijft_not_allowed(hass: HomeAssistant) -> None:
    """REGRESSIEWACHT — verplicht testgeval 3.

    Een gewone lamp heeft geen `entity_id`-attribuut en geen groep-config-entry,
    en moet dus nog steeds worden geweigerd.
    """
    config_entry = MockConfigEntry(domain="demo", title="Demo")
    config_entry.add_to_hass(hass)
    registry = er.async_get(hass)
    entry = registry.async_get_or_create(
        "light", "demo", "losse-lamp", config_entry=config_entry
    )
    hass.states.async_set(entry.entity_id, "on", {"brightness": 100})

    with pytest.raises(NotALightGroupError):
        resolve_light_group(hass, entry.entity_id)


async def test_groep_van_een_ander_type_blijft_not_allowed(
    hass: HomeAssistant,
) -> None:
    """NIEUW GEDRAG — een switch group is geen light group.

    Grenswaarde van de nieuwe terugval: zonder de controle op `group_type` zou
    die elke groep accepteren. Deze test slaagt ook op de code van vóór de fase,
    omdat die alles weigerde; hij bewaakt dat de nieuwe deur niet te ver opengaat.
    """
    maak_light_group(hass, beschikbaar=False, group_type="switch")

    with pytest.raises(NotALightGroupError):
        resolve_light_group(hass, "light.lampen_zolder")


async def test_entiteit_zonder_config_entry_blijft_not_allowed(
    hass: HomeAssistant,
) -> None:
    """NIEUW GEDRAG — zonder config entry is er geen ledenlijst om op terug te vallen.

    Ook een grenswaarde: slaagt op de oude code, en bewaakt dat de terugval niet
    op een entiteit zonder config entry probeert te lezen.
    """
    registry = er.async_get(hass)
    entry = registry.async_get_or_create("light", "iets", "zonder-config-entry")
    hass.states.async_set(entry.entity_id, "unavailable", {})

    with pytest.raises(NotALightGroupError):
        resolve_light_group(hass, entry.entity_id)


async def test_groep_zit_nooit_in_de_eigen_lijst(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG — verplicht testgeval 4 (SPEC 5.2), ook via de terugval."""
    maak_light_group(
        hass, leden=[*LEDEN, "light.lampen_zolder"], beschikbaar=False
    )

    _rid, leden = resolve_light_group(hass, "light.lampen_zolder")

    assert "light.lampen_zolder" not in leden
    assert leden == LEDEN


async def test_verdwenen_lid_wordt_overgeslagen(
    hass: HomeAssistant, caplog: pytest.LogCaptureFixture
) -> None:
    """NIEUW GEDRAG — een lid dat als UUID is opgeslagen en niet meer bestaat.

    De config entry mag entity-ID's én registry-UUID's bevatten
    (`helpers/entity_registry.py:2715-2725`). Eén onvindbaar lid mag niet de
    hele ledenlijst laten vallen.
    """
    maak_light_group(
        hass,
        leden=["light.plafond", "01ABCDEF0123456789ABCDEF01", "light.bedlamp"],
        beschikbaar=False,
    )

    _rid, leden = resolve_light_group(hass, "light.lampen_zolder")

    assert leden == ["light.plafond", "light.bedlamp"]
    assert any(
        "bestaat niet meer" in record.getMessage()
        for record in caplog.records
        if record.levelname == "WARNING"
    )


async def test_uuid_lid_wordt_opgelost_naar_entity_id(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG — een lid dat als registry-UUID is opgeslagen."""
    registry = er.async_get(hass)
    lid = registry.async_get_or_create("light", "demo", "lamp-als-uuid")

    maak_light_group(hass, leden=[lid.id], beschikbaar=False)

    _rid, leden = resolve_light_group(hass, "light.lampen_zolder")

    assert leden == [lid.entity_id]


# --------------------------------------------------------------------------
# Over de WebSocket
# --------------------------------------------------------------------------


async def test_scenes_get_op_lege_groep_slaagt(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """NIEUW GEDRAG — de kaart krijgt nu een leeg antwoord, geen fout.

    Dit is wat de LEEG-tak van de kaart bereikbaar maakt: `member_entity_ids`
    is leeg, dus toont de kaart uitgeschakelde knoppen met de melding uit
    SPEC 13.3 in plaats van de foutkaart.
    """
    maak_light_group(hass, leden=[], beschikbaar=False)
    await zet_integratie_op(hass)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {"type": "domotiapp_lovelace/scenes/get", "entity_id": "light.lampen_zolder"}
    )
    antwoord = await client.receive_json()

    assert antwoord["success"] is True, antwoord.get("error")
    assert antwoord["result"]["member_entity_ids"] == []
    assert antwoord["result"]["stored"] is False
    assert len(antwoord["result"]["scenes"]) == 3


async def test_scenes_get_op_unavailable_groep_geeft_leden(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """NIEUW GEDRAG — SPEC 13.6 over de hele keten."""
    maak_light_group(hass, beschikbaar=False)
    await zet_integratie_op(hass)
    client = await hass_ws_client(hass)

    await client.send_json_auto_id(
        {"type": "domotiapp_lovelace/scenes/get", "entity_id": "light.lampen_zolder"}
    )
    antwoord = await client.receive_json()

    assert antwoord["success"] is True, antwoord.get("error")
    assert antwoord["result"]["member_entity_ids"] == LEDEN


async def test_scenes_save_op_unavailable_groep_slaagt(
    hass: HomeAssistant, hass_ws_client, lees_opslag
) -> None:
    """NIEUW GEDRAG — ook opslaan werkt weer op een offline kamer (SPEC 13.6)."""
    registry_entry_id = maak_light_group(hass, beschikbaar=False)
    await zet_integratie_op(hass)
    client = await hass_ws_client(hass)

    scenes: list[dict[str, Any]] = [
        {"icon": "mdi:a", "lights": {"light.plafond": {"state": "on"}}},
        {"icon": "mdi:b", "lights": {}},
        {"icon": "mdi:c", "lights": {}},
    ]
    await client.send_json_auto_id(
        {
            "type": "domotiapp_lovelace/scenes/save",
            "entity_id": "light.lampen_zolder",
            "scenes": scenes,
        }
    )
    antwoord = await client.receive_json()

    assert antwoord["success"] is True, antwoord.get("error")
    assert lees_opslag()["data"]["groups"][registry_entry_id]["scenes"] == scenes
