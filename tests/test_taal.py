"""De taal van de kaarten: de keuze bij het toevoegen, in Configureren, en in de lader.

Alles hier is **NIEUW GEDRAG** (0.81.0). Vóór deze ronde had Uiterlijk alleen
het thema en noemde de lader alleen het thema. De opbouw volgt
`test_thema.py`: de flows langs `hass.config_entries`, de lader met een echte
HTTP-client zonder inlog.
"""

from __future__ import annotations

from typing import Any

from homeassistant import config_entries, data_entry_flow
from homeassistant.core import HomeAssistant

from custom_components.domotiapp_lovelace.const import (
    CARD_URL_PATH,
    CONF_TAAL,
    CONF_THEMA,
    DOMAIN,
    LOADER_URL_PATH,
    TAAL_AUTO,
    TAAL_GLOBALE,
    TALEN,
    THEMA_AUTO,
    THEMA_DONKER,
)

from .conftest import zet_integratie_op


def _veld(resultaat: dict[str, Any], naam: str):
    for sleutel, selector in resultaat["data_schema"].schema.items():
        if str(sleutel) == naam:
            return sleutel, selector
    raise AssertionError(f"het formulier heeft geen veld {naam}")


async def _lader(hass: HomeAssistant, hass_client_no_auth) -> str:
    client = await hass_client_no_auth()
    antwoord = await client.get(LOADER_URL_PATH)
    assert antwoord.status == 200
    return await antwoord.text()


async def _uiterlijk(hass: HomeAssistant, entry) -> dict[str, Any]:
    menu = await hass.config_entries.options.async_init(entry.entry_id)
    return await hass.config_entries.options.async_configure(
        menu["flow_id"], {"next_step_id": "uiterlijk"}
    )


async def test_bij_het_toevoegen_staat_taal_op_automatisch(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG. Drie keuzes, Automatisch voorgevuld, en het komt in de options."""
    resultaat = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    sleutel, selector = _veld(resultaat, CONF_TAAL)
    assert list(selector.config["options"]) == list(TALEN) == ["auto", "nl", "en"]
    assert sleutel.default() == TAAL_AUTO

    resultaat = await hass.config_entries.flow.async_configure(
        resultaat["flow_id"], {CONF_THEMA: THEMA_AUTO, CONF_TAAL: "en"}
    )
    await hass.async_block_till_done()
    assert resultaat["type"] is data_entry_flow.FlowResultType.CREATE_ENTRY
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    assert entry.options == {CONF_THEMA: THEMA_AUTO, CONF_TAAL: "en"}


async def test_uiterlijk_toont_en_bewaart_de_taal(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG.

    Een entry van vóór 0.81.0 heeft geen taal: die staat op Automatisch. Een
    nieuwe keuze laat het thema staan, en staat er de volgende keer.
    """
    entry = await zet_integratie_op(hass)
    hass.config_entries.async_update_entry(entry, options={CONF_THEMA: THEMA_DONKER})
    await hass.async_block_till_done()

    resultaat = await _uiterlijk(hass, entry)
    assert _veld(resultaat, CONF_TAAL)[0].default() == TAAL_AUTO
    assert _veld(resultaat, CONF_THEMA)[0].default() == THEMA_DONKER

    await hass.config_entries.options.async_configure(
        resultaat["flow_id"], {CONF_THEMA: THEMA_DONKER, CONF_TAAL: "nl"}
    )
    await hass.async_block_till_done()
    assert entry.options == {CONF_THEMA: THEMA_DONKER, CONF_TAAL: "nl"}

    resultaat = await _uiterlijk(hass, entry)
    assert _veld(resultaat, CONF_TAAL)[0].default() == "nl"


async def test_de_lader_zet_de_taal_voor_de_import(
    hass: HomeAssistant, hass_client_no_auth
) -> None:
    """NIEUW GEDRAG. Net als het thema: eerst de globale, dan de bundel."""
    await zet_integratie_op(hass)
    tekst = await _lader(hass, hass_client_no_auth)

    zet = f'globalThis.{TAAL_GLOBALE}="{TAAL_AUTO}";'
    assert zet in tekst
    assert tekst.index(zet) < tekst.index(f'import("{CARD_URL_PATH}?v=')


async def test_de_lader_volgt_de_taal_zonder_herladen(
    hass: HomeAssistant, hass_client_no_auth
) -> None:
    """NIEUW GEDRAG. Configureren is genoeg; de entry blijft geladen."""
    entry = await zet_integratie_op(hass)
    resultaat = await _uiterlijk(hass, entry)
    await hass.config_entries.options.async_configure(
        resultaat["flow_id"], {CONF_THEMA: THEMA_AUTO, CONF_TAAL: "en"}
    )
    await hass.async_block_till_done()

    tekst = await _lader(hass, hass_client_no_auth)
    assert f'globalThis.{TAAL_GLOBALE}="en";' in tekst
    assert entry.state is config_entries.ConfigEntryState.LOADED


async def test_de_lader_laat_geen_onbekende_taal_door(
    hass: HomeAssistant, hass_client_no_auth
) -> None:
    """NIEUW GEDRAG. De waarde gaat letterlijk JavaScript in, zonder inlog."""
    entry = await zet_integratie_op(hass)
    hass.config_entries.async_update_entry(entry, options={CONF_TAAL: '";alert(1);//'})
    await hass.async_block_till_done()

    tekst = await _lader(hass, hass_client_no_auth)
    assert "alert" not in tekst
    assert f'globalThis.{TAAL_GLOBALE}="{TAAL_AUTO}";' in tekst
