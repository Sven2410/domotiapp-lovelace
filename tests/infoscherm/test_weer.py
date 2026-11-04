"""Het weer op het infoscherm als de weerintegratie wegvalt (0.105.0). NIEUW GEDRAG.

Bij een klant was Met.no op 4 november 2026 een uur `unavailable`, en het scherm toonde geen weer. Zie de kop van
`infoscherm/weer.py`. Op 0.104.2 bestaat `infoscherm/weer` niet en herlaadt niemand iets: alles hier is daar rood.
"""

from __future__ import annotations

from datetime import timedelta
from typing import Any
from unittest.mock import AsyncMock, patch

import pytest

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse
from homeassistant.helpers import entity_registry as er

from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

from custom_components.domotiapp_lovelace.const import DOMAIN

from .conftest import stuur

W = "weather.forecast_home"
UREN = [{"datetime": f"2026-11-04T{u:02d}:00:00+00:00", "condition": "cloudy", "temperature": 9 + u % 3, "wind_bearing": 200} for u in range(60)]
DAGEN = [{"datetime": f"2026-11-{d:02d}T11:00:00+00:00", "condition": "rainy", "temperature": 11, "templow": 4} for d in range(4, 14)]


@pytest.fixture
def met(hass: HomeAssistant) -> MockConfigEntry:
    """Een weerintegratie met zijn entiteit, en een nagebootste `weather.get_forecasts`.

    Een domein dat niet bestaat: met `met` laadt Home Assistant bij het afsluiten de echte, en in CI ontbreekt `metno`.
    """
    entry = MockConfigEntry(domain="nep_weer", title="Home", state=ConfigEntryState.LOADED)
    entry.add_to_hass(hass)
    er.async_get(hass).async_get_or_create("weather", "nep_weer", "home", config_entry=entry, suggested_object_id="forecast_home")

    async def voorspel(call: ServiceCall) -> dict[str, Any]:
        return {call.data["entity_id"]: {"forecast": UREN if call.data["type"] == "hourly" else DAGEN}}

    hass.services.async_register("weather", "get_forecasts", voorspel, supports_response=SupportsResponse.ONLY)
    hass.states.async_set(W, "partlycloudy", {"temperature": 9.4, "humidity": 88, "wind_speed": 12.2, "wind_speed_unit": "km/h", "pressure": 1012})
    return entry


@pytest.fixture
async def opgezet(hass: HomeAssistant, met, infoscherm_op, store, freezer):
    freezer.move_to("2026-11-04T06:40:00+00:00")
    await store().async_zet_installatie({"weer": W}, mag_entiteiten_wijzigen=True)
    return infoscherm_op


async def _minuten(hass: HomeAssistant, freezer, n: int) -> None:
    for _ in range(n):
        freezer.tick(timedelta(minutes=1))
        async_fire_time_changed(hass)
        await hass.async_block_till_done()


async def _laatst(hass: HomeAssistant, hass_ws_client) -> dict[str, Any] | None:
    client = await hass_ws_client(hass)
    antwoord = await stuur(client, "weer")
    assert antwoord["success"], antwoord
    return antwoord["result"]["laatst"]


async def test_het_laatste_weer_blijft_als_de_entiteit_wegvalt(hass: HomeAssistant, opgezet, freezer, hass_ws_client) -> None:
    await _minuten(hass, freezer, 1)
    gezet = hass.states.get(W).last_updated.isoformat()
    hass.states.async_set(W, "unavailable", {})
    await _minuten(hass, freezer, 2)
    laatst = await _laatst(hass, hass_ws_client)
    assert laatst["entiteit"] == W
    assert laatst["nu"] == {"state": "partlycloudy", "temperature": 9.4, "humidity": 88, "wind_speed": 12.2, "wind_speed_unit": "km/h"}
    # Alleen wat het scherm toont, en niet meer dan twee dagen uren en een week dagen.
    assert len(laatst["uren"]) == 48 and set(laatst["uren"][0]) == {"datetime", "condition", "temperature"}
    assert len(laatst["dagen"]) == 8 and laatst["dagen"][0]["templow"] == 4
    assert laatst["tijd"] == gezet


async def test_een_nieuwe_stand_vervangt_de_oude(hass: HomeAssistant, opgezet, freezer, hass_ws_client) -> None:
    await _minuten(hass, freezer, 1)
    hass.states.async_set(W, "rainy", {"temperature": 7.0})
    await _minuten(hass, freezer, 1)
    laatst = await _laatst(hass, hass_ws_client)
    assert laatst["nu"] == {"state": "rainy", "temperature": 7.0}


async def test_het_laatste_weer_overleeft_een_herstart(hass: HomeAssistant, opgezet, freezer, hass_ws_client) -> None:
    await _minuten(hass, freezer, 1)
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    # Na de herstart is het weer er nog niet: dan geldt wat er bewaard was.
    hass.states.async_set(W, "unavailable", {})
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    laatst = await _laatst(hass, hass_ws_client)
    assert laatst is not None and laatst["nu"]["temperature"] == 9.4


async def test_een_andere_weerentiteit_heeft_geen_laatste_weer(hass: HomeAssistant, opgezet, store, freezer, hass_ws_client) -> None:
    await _minuten(hass, freezer, 1)
    await store().async_zet_installatie({"weer": "weather.ergens_anders"}, mag_entiteiten_wijzigen=True)
    assert await _laatst(hass, hass_ws_client) is None


async def test_herladen_na_tien_minuten_en_hooguit_eens_per_uur(hass: HomeAssistant, opgezet, met, freezer, caplog) -> None:
    await _minuten(hass, freezer, 1)
    with patch.object(hass.config_entries, "async_reload", AsyncMock(return_value=True)) as herlaad:
        hass.states.async_set(W, "unavailable", {})
        await _minuten(hass, freezer, 9)
        assert herlaad.await_count == 0
        await _minuten(hass, freezer, 2)
        assert [c.args for c in herlaad.await_args_list] == [(met.entry_id,)]
        assert "is al 10 minuten niet beschikbaar: integratie Home (nep_weer) wordt herladen" in caplog.text
        # Blijft hij weg, dan pas na een uur opnieuw.
        await _minuten(hass, freezer, 55)
        assert herlaad.await_count == 1
        await _minuten(hass, freezer, 6)
        assert herlaad.await_count == 2


async def test_een_korte_hapering_herlaadt_niets(hass: HomeAssistant, opgezet, freezer) -> None:
    with patch.object(hass.config_entries, "async_reload", AsyncMock(return_value=True)) as herlaad:
        hass.states.async_set(W, "unavailable", {})
        await _minuten(hass, freezer, 5)
        hass.states.async_set(W, "cloudy", {"temperature": 8.0})
        await _minuten(hass, freezer, 30)
        assert herlaad.await_count == 0
        # Blijft hij de volgende keer wel weg, dan telt de tijd vanaf dat moment.
        hass.states.async_set(W, "unavailable", {})
        await _minuten(hass, freezer, 11)
        assert herlaad.await_count == 1


async def test_niet_herladen_als_home_assistant_al_opnieuw_probeert(hass: HomeAssistant, opgezet, met, freezer) -> None:
    met.mock_state(hass, ConfigEntryState.SETUP_RETRY)
    with patch.object(hass.config_entries, "async_reload", AsyncMock(return_value=True)) as herlaad:
        hass.states.async_set(W, "unavailable", {})
        await _minuten(hass, freezer, 15)
        assert herlaad.await_count == 0
        # Komt hij geladen terug en is het weer nog steeds weg, dan wel.
        met.mock_state(hass, ConfigEntryState.LOADED)
        await _minuten(hass, freezer, 1)
        assert [c.args for c in herlaad.await_args_list] == [(met.entry_id,)]


async def test_alleen_de_weerintegratie_van_het_infoscherm(hass: HomeAssistant, opgezet, met, freezer) -> None:
    """Een andere entiteit die wegvalt, herlaadt niets: ook niet als hij bij een andere integratie hoort."""
    ander = MockConfigEntry(domain="nep_zigbee", title="Zigbee", state=ConfigEntryState.LOADED)
    ander.add_to_hass(hass)
    er.async_get(hass).async_get_or_create("light", "nep_zigbee", "lamp", config_entry=ander, suggested_object_id="keuken")
    with patch.object(hass.config_entries, "async_reload", AsyncMock(return_value=True)) as herlaad:
        hass.states.async_set("light.keuken", "unavailable", {})
        await _minuten(hass, freezer, 15)
        assert herlaad.await_count == 0
        # Valt daarna ook het weer weg, dan alleen de weerintegratie.
        hass.states.async_set(W, "unavailable", {})
        await _minuten(hass, freezer, 11)
        assert [c.args for c in herlaad.await_args_list] == [(met.entry_id,)]
