"""Het thema van de kaarten: de keuze bij het toevoegen, in Configureren, en in de lader.

Alles hier is **NIEUW GEDRAG** (0.54.0), op één test na die als
**REGRESSIEWACHT** gelabeld staat. Vóór deze ronde was de config flow leeg,
begon de options flow meteen met het opruimoverzicht, en gaf de lader alleen de
importregel terug.

De flows worden langs `hass.config_entries.flow` en `.options` gedraaid, dus
langs dezelfde weg als de UI. De lader wordt met een echte HTTP-client
opgevraagd, zonder inlog, want zo haalt de browser hem ook op.
"""

from __future__ import annotations

from typing import Any

import pytest

from homeassistant import config_entries, data_entry_flow
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component

from custom_components.domotiapp_lovelace.config_flow import CONF_BEVESTIGD, CONF_GROEP
from custom_components.domotiapp_lovelace.const import (
    CARD_URL_PATH,
    CONF_THEMA,
    DOMAIN,
    LOADER_URL_PATH,
    THEMA_AUTO,
    THEMA_DONKER,
    THEMA_GLOBALE,
    THEMA_LICHT,
    THEMAS,
)

from .conftest import zet_integratie_op

GROEP_A = "aaaa1111"


def _groep(entity_id: str) -> dict[str, Any]:
    scene = {"icon": "mdi:weather-sunset", "lights": {"light.a": {"state": "on"}}}
    return {"last_known_entity_id": entity_id, "scenes": [scene, scene, scene]}


def _keuzes(resultaat: dict[str, Any]) -> list[str]:
    """De waarden van het themaveld in een formulier."""
    for sleutel, selector in resultaat["data_schema"].schema.items():
        if str(sleutel) == CONF_THEMA:
            return list(selector.config["options"])
    raise AssertionError("het formulier heeft geen themaveld")


def _standaard(resultaat: dict[str, Any]) -> str:
    """De voorgevulde waarde van het themaveld."""
    for sleutel in resultaat["data_schema"].schema:
        if str(sleutel) == CONF_THEMA:
            return sleutel.default()
    raise AssertionError("het formulier heeft geen themaveld")


async def _lader(hass: HomeAssistant, hass_client_no_auth) -> str:
    client = await hass_client_no_auth()
    antwoord = await client.get(LOADER_URL_PATH)
    assert antwoord.status == 200
    return await antwoord.text()


# --------------------------------------------------------------------------
# De config flow — de keuze bij het toevoegen
# --------------------------------------------------------------------------


async def test_toevoegen_vraagt_om_het_thema(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG.

    De eerste stap toont de drie keuzes, met Automatisch voorgevuld. Op de code
    van vóór 0.54.0 heeft de stap geen `data_schema`.
    """
    assert await async_setup_component(hass, "frontend", {})

    resultaat = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )

    assert resultaat["type"] is data_entry_flow.FlowResultType.FORM
    assert resultaat["step_id"] == "user"
    assert _keuzes(resultaat) == list(THEMAS)
    assert _standaard(resultaat) == THEMA_AUTO


@pytest.mark.parametrize("keuze", [THEMA_AUTO, THEMA_LICHT, THEMA_DONKER])
async def test_de_keuze_bij_het_toevoegen_belandt_in_de_options(
    hass: HomeAssistant, keuze: str
) -> None:
    """NIEUW GEDRAG.

    In `options` en niet in `data`: alleen dan is hij achteraf te verzetten via
    Configureren zonder de integratie opnieuw toe te voegen.
    """
    assert await async_setup_component(hass, "frontend", {})

    resultaat = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    resultaat = await hass.config_entries.flow.async_configure(
        resultaat["flow_id"], {CONF_THEMA: keuze}
    )
    await hass.async_block_till_done()

    assert resultaat["type"] is data_entry_flow.FlowResultType.CREATE_ENTRY
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    assert entry.options == {CONF_THEMA: keuze}
    assert entry.data == {}


# --------------------------------------------------------------------------
# De options flow — het menu en de stap Uiterlijk
# --------------------------------------------------------------------------


async def test_configureren_begint_met_een_menu(hass: HomeAssistant, opgezet) -> None:
    """NIEUW GEDRAG.

    Twee keuzes, en het opruimoverzicht van SPEC 15 is er één van. Op de code
    van vóór 0.54.0 is de eerste stap meteen de keuzelijst (of een afbreking
    als er niets is opgeslagen).
    """
    resultaat = await hass.config_entries.options.async_init(opgezet.entry_id)

    assert resultaat["type"] is data_entry_flow.FlowResultType.MENU
    assert resultaat["menu_options"] == ["uiterlijk", "scenes"]


async def test_uiterlijk_toont_de_huidige_keuze(hass: HomeAssistant, opgezet) -> None:
    """NIEUW GEDRAG.

    Een entry van vóór 0.54.0 heeft de keuze niet. Die staat op Automatisch,
    want dat is ook wat de kaarten zonder keuze doen.
    """
    menu = await hass.config_entries.options.async_init(opgezet.entry_id)
    resultaat = await hass.config_entries.options.async_configure(
        menu["flow_id"], {"next_step_id": "uiterlijk"}
    )

    assert resultaat["type"] is data_entry_flow.FlowResultType.FORM
    assert resultaat["step_id"] == "uiterlijk"
    assert _standaard(resultaat) == THEMA_AUTO

    # En na een keuze staat die er de volgende keer.
    await hass.config_entries.options.async_configure(
        resultaat["flow_id"], {CONF_THEMA: THEMA_LICHT}
    )
    await hass.async_block_till_done()
    assert opgezet.options == {CONF_THEMA: THEMA_LICHT}

    menu = await hass.config_entries.options.async_init(opgezet.entry_id)
    resultaat = await hass.config_entries.options.async_configure(
        menu["flow_id"], {"next_step_id": "uiterlijk"}
    )
    assert _standaard(resultaat) == THEMA_LICHT


async def test_opruimen_laat_de_themakeuze_staan(
    hass: HomeAssistant, schrijf_opslag
) -> None:
    """NIEUW GEDRAG, en de reden dat `data={}` uit SPEC 15.2 niet kon blijven.

    `async_create_entry` van een options flow VERVANGT de options. Sloot de
    opruimstap af met een lege dict, dan stond het thema na elke opgeruimde
    kamer weer op Automatisch.
    """
    schrijf_opslag({GROEP_A: _groep("light.kamer")})
    entry = await zet_integratie_op(hass)
    hass.config_entries.async_update_entry(entry, options={CONF_THEMA: THEMA_LICHT})
    await hass.async_block_till_done()

    menu = await hass.config_entries.options.async_init(entry.entry_id)
    resultaat = await hass.config_entries.options.async_configure(
        menu["flow_id"], {"next_step_id": "scenes"}
    )
    resultaat = await hass.config_entries.options.async_configure(
        resultaat["flow_id"], {CONF_GROEP: GROEP_A}
    )
    resultaat = await hass.config_entries.options.async_configure(
        resultaat["flow_id"], {CONF_BEVESTIGD: True}
    )
    await hass.async_block_till_done()

    assert resultaat["type"] is data_entry_flow.FlowResultType.CREATE_ENTRY
    assert entry.options == {CONF_THEMA: THEMA_LICHT}


# --------------------------------------------------------------------------
# De lader — hoe de keuze bij de kaarten komt
# --------------------------------------------------------------------------


async def test_de_lader_zet_het_thema_voor_de_import(
    hass: HomeAssistant, hass_client_no_auth, opgezet
) -> None:
    """NIEUW GEDRAG.

    De globale staat VOOR de import: de import start de bundel, en die leest
    hem bij het laden. Andersom tekent de eerste kaart zich zonder de keuze te
    kennen, en dat is de flits die dit moet voorkomen.
    """
    tekst = await _lader(hass, hass_client_no_auth)

    zet = f'globalThis.{THEMA_GLOBALE}="{THEMA_AUTO}";'
    assert zet in tekst
    assert tekst.index(zet) < tekst.index(f'import("{CARD_URL_PATH}?v=')


async def test_de_lader_volgt_de_keuze_zonder_herladen(
    hass: HomeAssistant, hass_client_no_auth, opgezet
) -> None:
    """NIEUW GEDRAG.

    De keuze verzetten in Configureren is genoeg; de integratie hoeft er niet
    voor herladen te worden en Home Assistant niet herstart. Dat het zonder
    herladen gaat is af te lezen aan de entry: die blijft dezelfde en blijft
    geladen.
    """
    menu = await hass.config_entries.options.async_init(opgezet.entry_id)
    resultaat = await hass.config_entries.options.async_configure(
        menu["flow_id"], {"next_step_id": "uiterlijk"}
    )
    await hass.config_entries.options.async_configure(
        resultaat["flow_id"], {CONF_THEMA: THEMA_DONKER}
    )
    await hass.async_block_till_done()

    tekst = await _lader(hass, hass_client_no_auth)
    assert f'globalThis.{THEMA_GLOBALE}="{THEMA_DONKER}";' in tekst
    assert opgezet.state is config_entries.ConfigEntryState.LOADED


async def test_de_lader_laat_geen_onbekende_waarde_door(
    hass: HomeAssistant, hass_client_no_auth
) -> None:
    """NIEUW GEDRAG.

    De waarde gaat letterlijk een stuk JavaScript in dat zonder inlog wordt
    uitgeserveerd. Wat er ook in de options staat -- een met de hand bewerkt
    `.storage`-bestand, een waarde uit een latere versie -- er komt alleen een
    van de drie bekende keuzes uit.
    """
    entry = await zet_integratie_op(hass)
    hass.config_entries.async_update_entry(
        entry, options={CONF_THEMA: '";alert(1);//'}
    )
    await hass.async_block_till_done()

    tekst = await _lader(hass, hass_client_no_auth)
    assert "alert" not in tekst
    assert f'globalThis.{THEMA_GLOBALE}="{THEMA_AUTO}";' in tekst


async def test_de_lader_bevat_nog_steeds_precies_een_hash(
    hass: HomeAssistant, hass_client_no_auth, opgezet
) -> None:
    """REGRESSIEWACHT.

    Een bundel van vóór 0.54.0 die nog in een tabblad draait leest de hash uit
    dit antwoord met `[?&]v=([0-9a-f]+)` (src/verouderd.js). Staat er door de
    nieuwe regel een tweede `v=` in, of staat de hash er niet meer, dan herlaadt
    die pagina zich niet meer naar de nieuwe versie.
    """
    tekst = await _lader(hass, hass_client_no_auth)
    assert tekst.count("?v=") == 1
    assert "&v=" not in tekst
