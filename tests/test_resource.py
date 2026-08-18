"""De tweede laadroute: de kaart óók als Lovelace-resource (SPEC 16.5).

Alles hier is **NIEUW GEDRAG** behalve waar anders vermeld: vóór fase 9
registreerde de integratie geen enkele Lovelace-resource, dus elke test die
naar de resourcelijst kijkt faalt op de oude code.

De aanleiding staat in `docs/fase-7/RAPPORT.md` en `docs/fase-8/RAPPORT.md`:
Home Assistant serveert `index.html` zonder cache-validatie-headers, waardoor
een browser een index van vóór de installatie kan vasthouden — zonder onze
import. Een resource wordt uit de dashboardconfiguratie geladen en heeft daar
geen last van.
"""

from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Any

import pytest

from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL
from homeassistant.components.lovelace.const import LOVELACE_DATA
from homeassistant.components.lovelace.resources import (
    ResourceStorageCollection,
    ResourceYAMLCollection,
)
from homeassistant.core import HomeAssistant

from custom_components.domotiapp_lovelace.const import (
    CARD_URL_PATH,
    DOMAIN,
    LOADER_URL_PATH,
)

from .conftest import zet_integratie_op

BUNDEL = (
    Path(__file__).parent.parent
    / "custom_components"
    / DOMAIN
    / "frontend"
    / "domotiapp-lovelace.js"
)


def verwachte_url() -> str:
    """De URL die de integratie hoort te gebruiken: pad + hash van de bundel."""
    hash_ = hashlib.sha256(BUNDEL.read_bytes()).hexdigest()[:12]
    return f"{CARD_URL_PATH}?v={hash_}"


async def lees_resources(hass: HomeAssistant) -> list[dict[str, Any]]:
    """De resourcelijst, met de collectie gegarandeerd ingelezen."""
    collectie = hass.data[LOVELACE_DATA].resources
    await collectie.async_get_info()
    return list(collectie.async_items())


async def onze_resources(hass: HomeAssistant) -> list[dict[str, Any]]:
    """Alleen de resources die naar ons bundelpad wijzen."""
    return [
        item
        for item in await lees_resources(hass)
        if item["url"].partition("?")[0] == CARD_URL_PATH
    ]


# --------------------------------------------------------------------------
# Aanmaken
# --------------------------------------------------------------------------


async def test_setup_maakt_de_resource_aan(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG — verplicht testgeval 1 (SPEC 16.5).

    Op de code van vóór fase 9 blijft de lijst leeg.
    """
    await zet_integratie_op(hass)

    resources = await onze_resources(hass)
    assert len(resources) == 1
    assert resources[0]["url"] == verwachte_url()
    assert resources[0]["type"] == "module"


async def test_de_resource_gebruikt_dezelfde_url_als_de_import(
    hass: HomeAssistant,
) -> None:
    """NIEUW GEDRAG — taak B: één URL, dus één evaluatie.

    De modulekaart van de browser dedupliceert op URL. Lopen de twee routes
    uiteen, dan wordt de bundel twee keer opgehaald en geëvalueerd, en klopt de
    cachebusting uit SPEC 16.2 niet meer. Deze test is de enige plek waar dat
    machinaal wordt vastgehouden.
    """
    await zet_integratie_op(hass)

    import_urls = hass.data[DATA_EXTRA_MODULE_URL].urls
    onze_import = {url for url in import_urls if url.startswith(CARD_URL_PATH)}
    resource_urls = {item["url"] for item in await onze_resources(hass)}

    assert len(onze_import) == 1
    assert onze_import == resource_urls


# --------------------------------------------------------------------------
# Bijwerken
# --------------------------------------------------------------------------


async def test_bestaande_resource_met_dezelfde_hash_wordt_niet_verdubbeld(
    hass: HomeAssistant,
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 2.

    De integratie wordt bij elke herstart en elke reload opnieuw opgezet. Zou
    setup blind aanmaken, dan groeide de lijst bij elke rebuild.
    """
    entry = await zet_integratie_op(hass)
    eerste = await onze_resources(hass)
    assert len(eerste) == 1

    await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()

    tweede = await onze_resources(hass)
    assert len(tweede) == 1
    assert tweede[0]["id"] == eerste[0]["id"], "hetzelfde item, niet een nieuw"
    assert tweede[0]["url"] == verwachte_url()


async def test_bestaande_resource_met_andere_hash_wordt_bijgewerkt(
    hass: HomeAssistant,
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 3, en de kostenpost uit fase 8.

    Een resource met een oude `?v=` laat de browser een verouderde bundel uit
    zijn HTTP-cache halen — precies wat SPEC 16.2 met die hash oplost. Blijft
    hij staan, dan is de tweede laadroute erger dan geen.
    """
    await zet_integratie_op(hass)
    collectie: ResourceStorageCollection = hass.data[LOVELACE_DATA].resources
    bestaand = (await onze_resources(hass))[0]

    # Zet er een oude hash op, zoals na een rebuild het geval zou zijn.
    await collectie.async_update_item(
        bestaand["id"], {"res_type": "module", "url": f"{CARD_URL_PATH}?v=oud00000000"}
    )
    assert (await onze_resources(hass))[0]["url"].endswith("v=oud00000000")

    entry = hass.config_entries.async_entries(DOMAIN)[0]
    await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()

    na = await onze_resources(hass)
    assert len(na) == 1, "bijwerken, niet een tweede erbij"
    assert na[0]["id"] == bestaand["id"]
    assert na[0]["url"] == verwachte_url()


async def test_een_bron_van_iemand_anders_blijft_staan(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG.

    Wij raken alleen resources aan die naar ons eigen bundelpad wijzen. De
    kaart van een ander — kiosk-mode bijvoorbeeld — hoort onaangeroerd te
    blijven.
    """
    await zet_integratie_op(hass)
    collectie: ResourceStorageCollection = hass.data[LOVELACE_DATA].resources
    vreemde = await collectie.async_create_item(
        {"res_type": "module", "url": "/hacsfiles/kiosk-mode/kiosk-mode.js"}
    )

    entry = hass.config_entries.async_entries(DOMAIN)[0]
    await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()

    alle = await lees_resources(hass)
    assert vreemde["id"] in {item["id"] for item in alle}
    assert len(await onze_resources(hass)) == 1


# --------------------------------------------------------------------------
# Weghalen
# --------------------------------------------------------------------------


async def test_verwijderen_van_de_integratie_haalt_de_resource_weg(
    hass: HomeAssistant,
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 4.

    Anders dan het statische pad (SPEC 16.4) is een resource wél af te melden.
    """
    entry = await zet_integratie_op(hass)
    assert len(await onze_resources(hass)) == 1

    assert await hass.config_entries.async_remove(entry.entry_id)
    await hass.async_block_till_done()

    assert await onze_resources(hass) == []


async def test_unload_laat_de_resource_staan(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG — verplicht testgeval 5.

    Unload draait ook bij elke reload. Zou de resource daar verdwijnen, dan
    kwam hij bij elke rebuild weg en terug — en zou een dashboard dat precies
    dan laadt de kaart missen.
    """
    entry = await zet_integratie_op(hass)

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()

    resources = await onze_resources(hass)
    assert len(resources) == 1
    assert resources[0]["url"] == verwachte_url()


async def test_verwijderen_laat_de_bron_van_iemand_anders_staan(
    hass: HomeAssistant,
) -> None:
    """NIEUW GEDRAG."""
    entry = await zet_integratie_op(hass)
    collectie: ResourceStorageCollection = hass.data[LOVELACE_DATA].resources
    vreemde = await collectie.async_create_item(
        {"res_type": "module", "url": "/hacsfiles/kiosk-mode/kiosk-mode.js"}
    )
    assert len(await onze_resources(hass)) == 1, "er moet iets te verwijderen zijn"

    assert await hass.config_entries.async_remove(entry.entry_id)
    await hass.async_block_till_done()

    overgebleven = await lees_resources(hass)
    assert [item["id"] for item in overgebleven] == [vreemde["id"]]


# --------------------------------------------------------------------------
# YAML-resourcemodus
# --------------------------------------------------------------------------


async def test_yaml_resourcemodus_laat_de_setup_niet_falen(
    hass: HomeAssistant,
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 6.

    In YAML-modus is de collectie een `ResourceYAMLCollection`: die kan alleen
    lezen. Dat is het probleem van de beheerder, niet van de kaart — de setup
    moet gewoon slagen en de import in `index.html` blijft doen wat hij deed.

    De eerste assertie is de positieve controle: zonder die zou deze test ook
    slagen op code die überhaupt geen resources kent, en dan bewijst hij niets.
    """
    entry = await zet_integratie_op(hass)
    assert len(await onze_resources(hass)) == 1, "positieve controle: opslagmodus werkt"

    await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()

    # De collectie vervangen door de YAML-variant, zoals `lovelace` dat doet
    # wanneer `resource_mode: yaml` is ingesteld.
    hass.data[LOVELACE_DATA].resources = ResourceYAMLCollection([])

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    # De eerste laadroute doet het nog steeds.
    import_urls = hass.data[DATA_EXTRA_MODULE_URL].urls
    assert LOADER_URL_PATH in import_urls


async def test_een_kapotte_collectie_laat_de_setup_niet_falen(
    hass: HomeAssistant,
) -> None:
    """NIEUW GEDRAG.

    Wat er ook misgaat bij het registreren van de resource: de kaart zelf moet
    beschikbaar blijven. Dit is de tegenhanger van SPEC 17.1 aan de serverkant.

    Ook hier een positieve controle vooraf, anders slaagt de test op elke code
    die niets met resources doet.
    """

    class KapotteCollectie(ResourceStorageCollection):
        """Een collectie die op elk gebruik stukgaat."""

        async def async_get_info(self) -> dict[str, int]:
            raise RuntimeError("opslag onbereikbaar")

    entry = await zet_integratie_op(hass)
    assert len(await onze_resources(hass)) == 1, "positieve controle: normaal werkt het"

    await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()

    echt = hass.data[LOVELACE_DATA].resources
    hass.data[LOVELACE_DATA].resources = KapotteCollectie(hass, echt.ll_config)

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    import_urls = hass.data[DATA_EXTRA_MODULE_URL].urls
    assert LOADER_URL_PATH in import_urls


# --------------------------------------------------------------------------
# REGRESSIEWACHT
# --------------------------------------------------------------------------


async def test_de_import_in_index_html_blijft_bestaan(hass: HomeAssistant) -> None:
    """REGRESSIEWACHT — de eerste laadroute mag niet verdwijnen.

    `add_extra_js_url` dekt HA's ingebouwde panelen, waar Lovelace-resources niet
    geladen worden; de resource dekt een browser met een verouderde index. Wat er
    in index.html staat is sinds de samenvoeging niet meer de gehashte bundel-URL
    maar de lader met zijn vaste adres -- zie loader.py voor het waarom.
    """
    await zet_integratie_op(hass)

    import_urls = hass.data[DATA_EXTRA_MODULE_URL].urls
    assert LOADER_URL_PATH in import_urls


@pytest.mark.parametrize("aantal_reloads", [1, 3])
async def test_herhaald_herladen_levert_geen_stapel_resources_op(
    hass: HomeAssistant, aantal_reloads: int
) -> None:
    """NIEUW GEDRAG — de rebuild-lus uit SPEC 16.3, meerdere keren."""
    entry = await zet_integratie_op(hass)

    for _ in range(aantal_reloads):
        await hass.config_entries.async_reload(entry.entry_id)
        await hass.async_block_till_done()

    assert len(await onze_resources(hass)) == 1
