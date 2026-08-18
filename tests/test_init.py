"""Setup van de integratie: frontend-registratie en de opruimlus.

De frontend-tests zijn **REGRESSIEWACHT** op gedrag dat in fase 1 in een echte
browser is aangetoond. De opruimlus is **NIEUW GEDRAG** uit fase 3.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from unittest.mock import patch

import pytest

from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.domotiapp_lovelace.const import (
    CARD_URL_PATH,
    DOMAIN,
    SNAPSHOT_ENTITY_ID_PREFIX,
)

from .conftest import zet_integratie_op

BUNDEL = (
    Path(__file__).parent.parent
    / "custom_components"
    / DOMAIN
    / "frontend"
    / "domotiapp-lovelace.js"
)
MANIFEST_PAD = Path(__file__).parent.parent / "custom_components" / DOMAIN / "manifest.json"


async def test_setup_registreert_pad_en_meldt_kaart_aan(hass: HomeAssistant) -> None:
    """REGRESSIEWACHT — fase 1: statisch pad + add_extra_js_url.

    Bewaakt dat de keten die in fase 1 in een browser is aangetoond intact
    blijft: het bestand wordt op zijn eigen URL geserveerd en die URL wordt bij
    de frontend aangemeld, zonder Lovelace-resource.
    """
    from homeassistant.setup import async_setup_component

    assert await async_setup_component(hass, "frontend", {})
    await hass.async_block_till_done()

    entry = MockConfigEntry(domain=DOMAIN, title="DomotiApp Lovelace", data={})
    entry.add_to_hass(hass)

    with patch.object(
        type(hass.http), "async_register_static_paths", autospec=True
    ) as mock_static_paths:
        assert await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()

    assert mock_static_paths.call_count == 1
    (configs,) = mock_static_paths.call_args.args[1:]
    assert len(configs) == 1
    config = configs[0]
    assert config.url_path == CARD_URL_PATH
    assert Path(config.path).as_posix().endswith(
        "custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js"
    )
    assert config.cache_headers is True

    (url,) = [
        url
        for url in hass.data[DATA_EXTRA_MODULE_URL].urls
        if url.startswith(CARD_URL_PATH)
    ]
    assert url.startswith(f"{CARD_URL_PATH}?v=")


async def test_de_v_parameter_is_de_hash_van_de_bundel(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG — SPEC 16.2.

    Tot fase 2 stond het versienummer uit manifest.json in de `?v=`. Dat
    verandert niet als de bundel verandert, dus tijdens ontwikkeling meet je
    oude code. De `?v=` is nu de hash van het bestand zelf.
    """
    await zet_integratie_op(hass)

    verwacht = hashlib.sha256(BUNDEL.read_bytes()).hexdigest()[:12]
    manifest_versie = json.loads(MANIFEST_PAD.read_text(encoding="utf-8"))["version"]

    (url,) = [
        url
        for url in hass.data[DATA_EXTRA_MODULE_URL].urls
        if url.startswith(CARD_URL_PATH)
    ]

    assert url == f"{CARD_URL_PATH}?v={verwacht}"
    # En expliciet: het is niet meer het versienummer.
    assert url != f"{CARD_URL_PATH}?v={manifest_versie}"


async def test_unload_verwijdert_exact_dezelfde_url(hass: HomeAssistant) -> None:
    """REGRESSIEWACHT — SPEC 16.4.

    `UrlManager` bewaart hele URL-strings in een frozenset; een afwijkende
    string verwijdert niets en laat een verweesde import achter.
    """
    entry = await zet_integratie_op(hass)

    assert any(
        url.startswith(CARD_URL_PATH) for url in hass.data[DATA_EXTRA_MODULE_URL].urls
    )

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()

    assert not any(
        url.startswith(CARD_URL_PATH) for url in hass.data[DATA_EXTRA_MODULE_URL].urls
    )


# --------------------------------------------------------------------------
# Opruimlus — SPEC 9.3.1
# --------------------------------------------------------------------------


async def test_opruimlus_verwijdert_alleen_onze_snapshots(
    hass: HomeAssistant, service_calls
) -> None:
    """NIEUW GEDRAG — SPEC 9.3.1: opruimen op onze eigen naamprefix."""
    hass.states.async_set(f"{SNAPSHOT_ENTITY_ID_PREFIX}abc123", "scening")
    hass.states.async_set(f"{SNAPSHOT_ENTITY_ID_PREFIX}def456", "scening")
    # Van de klant; deze mag niet aangeraakt worden.
    hass.states.async_set("scene.avond", "scening")
    hass.states.async_set("scene.domotiapp_iets_anders", "scening")

    await zet_integratie_op(hass)

    aangeroepen = {
        call.data["entity_id"]
        for call in service_calls
        if call.domain == "scene" and call.service == "delete"
    }
    assert aangeroepen == {
        f"{SNAPSHOT_ENTITY_ID_PREFIX}abc123",
        f"{SNAPSHOT_ENTITY_ID_PREFIX}def456",
    }


async def test_opruimlus_doet_niets_bij_een_verse_start(
    hass: HomeAssistant, service_calls
) -> None:
    """NIEUW GEDRAG — SPEC 9.3.1: bij een verse start is de lijst leeg."""
    await zet_integratie_op(hass)

    assert not [
        call
        for call in service_calls
        if call.domain == "scene" and call.service == "delete"
    ]


async def test_setup_slaagt_ook_als_scene_delete_faalt(
    hass: HomeAssistant, caplog: pytest.LogCaptureFixture
) -> None:
    """NIEUW GEDRAG — SPEC 9.3.1: async_setup_entry faalt hier nooit op.

    Elke delete staat in zijn eigen try; een mislukking levert WARNING op en de
    volgende komt gewoon aan de beurt.
    """
    hass.states.async_set(f"{SNAPSHOT_ENTITY_ID_PREFIX}eerste", "scening")
    hass.states.async_set(f"{SNAPSHOT_ENTITY_ID_PREFIX}tweede", "scening")

    from homeassistant.config_entries import ConfigEntryState

    geprobeerd: list[str] = []

    async def _delete_faalt(call: ServiceCall) -> None:
        """Een scene.delete die altijd faalt, zoals bij een YAML-scene."""
        geprobeerd.append(call.data["entity_id"])
        raise HomeAssistantError("scene bestaat niet of is niet dynamisch aangemaakt")

    hass.services.async_register("scene", "delete", _delete_faalt)

    entry = await zet_integratie_op(hass)

    # De integratie draait gewoon ...
    assert entry.state is ConfigEntryState.LOADED

    # ... beide deletes zijn geprobeerd ...
    assert len(geprobeerd) == 2

    # ... en er staat een WARNING per mislukking.
    waarschuwingen = [
        record
        for record in caplog.records
        if record.levelname == "WARNING"
        and "snapshot-scene" in record.getMessage()
    ]
    assert len(waarschuwingen) == 2
