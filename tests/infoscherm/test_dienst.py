"""De dienst `infoscherm_aanwezigheid`, voor een automatisering (0.135.0). Alles **NIEUW GEDRAG**.

De eigenaar wil iedereen op afwezig zetten als het alarm aangaat. Zie de kop van
`infoscherm/diensten.py`.
"""

from __future__ import annotations

from unittest.mock import patch

import pytest

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError

from custom_components.domotiapp_lovelace.const import DOMAIN
from custom_components.domotiapp_lovelace.infoscherm.store import InfoStore

from .conftest import stuur

DIENST = "infoscherm_aanwezigheid"


async def _drie_aanwezig(hass, store) -> dict[str, str]:
    await store().async_zet_personen(
        [{"naam": "Bram Visser"}, {"naam": "Anna de Wit"}, {"naam": "Tom Bakker"}]
    )
    ids = {p["naam"]: p["id"] for p in store().snapshot()["personen"]}
    await store().async_zet_aanwezigheid(True)
    return ids


async def _roep(hass, **data):
    return await hass.services.async_call(DOMAIN, DIENST, data, blocking=True, return_response=True)


def _aanwezig(store) -> dict[str, bool]:
    return {p["naam"]: p["aanwezig"] for p in store().snapshot()["personen"]}


async def test_de_dienst_bestaat(hass: HomeAssistant, infoscherm_op) -> None:
    assert hass.services.has_service(DOMAIN, DIENST)


async def test_zonder_personen_gaat_iedereen_op_afwezig(hass: HomeAssistant, infoscherm_op, store) -> None:
    await _drie_aanwezig(hass, store)
    antwoord = await _roep(hass, aanwezig=False)
    assert _aanwezig(store) == {"Bram Visser": False, "Anna de Wit": False, "Tom Bakker": False}
    assert sorted(p["naam"] for p in antwoord["veranderd"]) == ["Anna de Wit", "Bram Visser", "Tom Bakker"]


async def test_twee_keer_is_een_keer_en_schrijft_niets(hass: HomeAssistant, infoscherm_op, store) -> None:
    """Een start-tak na een herstart roept hem gerust nog eens aan."""
    await _drie_aanwezig(hass, store)
    await _roep(hass, aanwezig=False)
    with patch.object(InfoStore, "_async_save") as opslaan:
        antwoord = await _roep(hass, aanwezig=False)
    assert antwoord == {"veranderd": []}
    opslaan.assert_not_called()
    assert set(_aanwezig(store).values()) == {False}


async def test_personen_op_naam_of_id(hass: HomeAssistant, infoscherm_op, store) -> None:
    ids = await _drie_aanwezig(hass, store)
    # Een naam zonder op hoofdletters te letten, met spaties eromheen; een id gewoon.
    await _roep(hass, aanwezig=False, personen=["  bram visser ", ids["Tom Bakker"]])
    assert _aanwezig(store) == {"Bram Visser": False, "Anna de Wit": True, "Tom Bakker": False}
    # Eén naam als tekst mag ook.
    await _roep(hass, aanwezig=False, personen="Anna de Wit")
    assert _aanwezig(store)["Anna de Wit"] is False


async def test_een_onbekende_naam_verandert_niets(hass: HomeAssistant, infoscherm_op, store) -> None:
    await _drie_aanwezig(hass, store)
    with pytest.raises(ServiceValidationError, match="Bram Visers"):
        await _roep(hass, aanwezig=False, personen=["Anna de Wit", "Bram Visers"])
    assert set(_aanwezig(store).values()) == {True}


async def test_elk_open_scherm_krijgt_de_nieuwe_stand(
    hass: HomeAssistant, infoscherm_op, store, hass_ws_client
) -> None:
    await _drie_aanwezig(hass, store)
    client = await hass_ws_client(hass)
    assert (await stuur(client, "subscribe"))["success"] is True

    await _roep(hass, aanwezig=False)
    stand = None
    for _ in range(4):
        bericht = await client.receive_json()
        if bericht.get("type") == "event" and bericht["event"]["soort"] == "stand":
            stand = bericht["event"]["stand"]
            break
    assert stand is not None
    assert [p["aanwezig"] for p in stand["personen"]] == [False, False, False]


async def test_afwezig_overleeft_een_herstart(hass: HomeAssistant, infoscherm_op, store, hass_storage) -> None:
    await _drie_aanwezig(hass, store)
    await _roep(hass, aanwezig=False)
    await hass.async_block_till_done()
    opnieuw = InfoStore(hass)
    await opnieuw.async_load()
    assert {p["aanwezig"] for p in opnieuw.snapshot()["personen"]} == {False}
