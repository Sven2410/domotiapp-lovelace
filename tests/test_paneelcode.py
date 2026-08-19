"""De alarmcode: gehasht opgeslagen, en niet te raden.

Alles hier is **NIEUW GEDRAG**: vóór deze ronde was er geen code.

De belangrijkste test is de eerste: wat er op schijf komt te staan mag de code
zelf niet bevatten. Dat is de hele reden dat deze code aan de serverkant staat en
niet in de dashboardconfig.
"""

from __future__ import annotations

import asyncio
from typing import Any

import pytest

from homeassistant.core import HomeAssistant

from custom_components.domotiapp_lovelace.const import DOMAIN
from custom_components.domotiapp_lovelace.paneelcode import (
    DATA_CODE_STORE,
    MAX_POGINGEN,
    STORAGE_KEY,
    PaneelCodeStore,
    TeVeelPogingen,
)

from .conftest import zet_integratie_op


async def _stuur(client, payload: dict[str, Any]) -> dict[str, Any]:
    await client.send_json_auto_id(payload)
    return await client.receive_json()


@pytest.fixture
async def store(hass: HomeAssistant) -> PaneelCodeStore:
    s = PaneelCodeStore(hass)
    await s.async_load()
    return s


async def test_code_staat_niet_leesbaar_op_schijf(
    hass: HomeAssistant, store: PaneelCodeStore, hass_storage: dict[str, Any]
) -> None:
    """Wat er wordt opgeslagen bevat de code niet, in geen enkel veld."""
    await store.async_zet_code("4711")

    ruw = hass_storage[STORAGE_KEY]
    plat = str(ruw)
    assert "4711" not in plat, "de code zelf mag nergens in het opslagbestand staan"
    assert ruw["data"]["algorithm"] == "pbkdf2_sha256"
    assert len(ruw["data"]["hash"]) == 64
    assert ruw["data"]["salt"] != ""


async def test_controleren(hass: HomeAssistant, store: PaneelCodeStore) -> None:
    """De juiste code is goed, elke andere niet."""
    await store.async_zet_code("4711")
    assert await store.async_controleer("4711") is True
    assert await store.async_controleer("4712") is False
    assert await store.async_controleer("") is False


async def test_zonder_code_klopt_niets(
    hass: HomeAssistant, store: PaneelCodeStore
) -> None:
    """Is er geen code, dan slaagt er ook niets — ook niet een lege invoer."""
    assert store.heeft_code is False
    assert await store.async_controleer("") is False
    assert await store.async_controleer("0000") is False


async def test_nieuw_salt_bij_elke_wijziging(
    hass: HomeAssistant, store: PaneelCodeStore, hass_storage: dict[str, Any]
) -> None:
    """Twee keer dezelfde code geeft een andere hash.

    Zonder nieuw salt zou aan het opslagbestand te zien zijn dat iemand zijn
    oude code opnieuw heeft ingesteld.
    """
    await store.async_zet_code("4711")
    eerste = dict(hass_storage[STORAGE_KEY]["data"])
    await store.async_zet_code("4711")
    tweede = hass_storage[STORAGE_KEY]["data"]

    assert eerste["salt"] != tweede["salt"]
    assert eerste["hash"] != tweede["hash"]
    assert await store.async_controleer("4711") is True


async def test_wissen(hass: HomeAssistant, store: PaneelCodeStore) -> None:
    """Wissen haalt de code weg; daarna vraagt de kaart nergens meer om."""
    await store.async_zet_code("4711")
    await store.async_zet_code(None)
    assert store.heeft_code is False
    assert await store.async_controleer("4711") is False


async def test_te_veel_pogingen(hass: HomeAssistant, store: PaneelCodeStore) -> None:
    """Na vijf missers gaat de deur een minuut op slot.

    Een code van vier cijfers is anders in tienduizend pogingen te raden, en dat
    is voor een computer een seconde werk.
    """
    await store.async_zet_code("4711")
    for _ in range(MAX_POGINGEN):
        assert await store.async_controleer("0000") is False

    with pytest.raises(TeVeelPogingen):
        await store.async_controleer("0000")
    # Ook de JUISTE code komt er niet doorheen: anders is de teller te omzeilen
    # door tussendoor te blijven proberen.
    with pytest.raises(TeVeelPogingen):
        await store.async_controleer("4711")


async def test_teller_loopt_leeg_na_een_goede_poging(
    hass: HomeAssistant, store: PaneelCodeStore
) -> None:
    """Wie zich vertikt en het daarna goed doet, begint weer met een schone lei."""
    await store.async_zet_code("4711")
    for _ in range(MAX_POGINGEN - 1):
        assert await store.async_controleer("0000") is False
    assert await store.async_controleer("4711") is True

    for _ in range(MAX_POGINGEN - 1):
        assert await store.async_controleer("0000") is False
    # Zonder het legen zou deze poging al geblokkeerd zijn.
    assert await store.async_controleer("4711") is True


async def test_websocket_status_en_verify(hass: HomeAssistant, hass_ws_client) -> None:
    """De twee commando's, over een echte verbinding.

    `status` geeft alleen prijs dát er een code is, nooit welke.
    """
    await zet_integratie_op(hass)
    store: PaneelCodeStore = hass.data[DOMAIN][DATA_CODE_STORE]
    client = await hass_ws_client(hass)

    antwoord = await _stuur(client, {"type": f"{DOMAIN}/panel/code/status"})
    assert antwoord["success"], antwoord
    assert antwoord["result"] == {"has_code": False}

    await store.async_zet_code("4711")
    antwoord = await _stuur(client, {"type": f"{DOMAIN}/panel/code/status"})
    assert antwoord["result"] == {"has_code": True}

    antwoord = await _stuur(client, {"type": f"{DOMAIN}/panel/code/verify", "code": "4711"})
    assert antwoord["success"], antwoord
    assert antwoord["result"] == {"ok": True}

    antwoord = await _stuur(client, {"type": f"{DOMAIN}/panel/code/verify", "code": "0000"})
    assert antwoord["success"], antwoord
    assert antwoord["result"] == {"ok": False}


async def test_websocket_verify_zonder_admin(
    hass: HomeAssistant, hass_ws_client, hass_read_only_access_token: str
) -> None:
    """Een tablet met een niet-admin account moet het alarm uit kunnen zetten.

    Daarom staat er geen `require_admin` op deze twee commando's. De code ZETTEN
    kan alleen via de options flow, en die staat wél achter HA's eigen
    admin-controle (`components/config/config_entries.py`).
    """
    await zet_integratie_op(hass)
    store: PaneelCodeStore = hass.data[DOMAIN][DATA_CODE_STORE]
    await store.async_zet_code("4711")

    client = await hass_ws_client(hass, hass_read_only_access_token)

    antwoord = await _stuur(client, {"type": f"{DOMAIN}/panel/code/status"})
    assert antwoord["success"], antwoord
    antwoord = await _stuur(client, {"type": f"{DOMAIN}/panel/code/verify", "code": "4711"})
    assert antwoord["success"], antwoord
    assert antwoord["result"]["ok"] is True


async def test_websocket_te_veel_pogingen(hass: HomeAssistant, hass_ws_client) -> None:
    """De pogingsteller geldt ook over de websocket, met een eigen foutcode."""
    await zet_integratie_op(hass)
    store: PaneelCodeStore = hass.data[DOMAIN][DATA_CODE_STORE]
    await store.async_zet_code("4711")
    client = await hass_ws_client(hass)

    for _ in range(MAX_POGINGEN):
        antwoord = await _stuur(client, {"type": f"{DOMAIN}/panel/code/verify", "code": "0000"})
        assert antwoord["result"] == {"ok": False}

    antwoord = await _stuur(client, {"type": f"{DOMAIN}/panel/code/verify", "code": "0000"})
    assert not antwoord["success"]
    assert antwoord["error"]["code"] == "te_veel_pogingen"


async def test_hashen_blokkeert_de_lus_niet(
    hass: HomeAssistant, store: PaneelCodeStore
) -> None:
    """Het hashen gaat naar een executor.

    210.000 rondes PBKDF2 kosten ongeveer een tiende seconde. Op de event loop
    zou dat betekenen dat heel Home Assistant even stilstaat bij elke poging --
    en bij vijf pogingen achter elkaar is dat zichtbaar.
    """
    await store.async_zet_code("4711")

    tikken = 0

    async def tel() -> None:
        nonlocal tikken
        for _ in range(20):
            await asyncio.sleep(0)
            tikken += 1

    taak = hass.async_create_task(tel())
    assert await store.async_controleer("4711") is True
    await taak
    assert tikken == 20, "de lus moet door kunnen draaien tijdens het hashen"
