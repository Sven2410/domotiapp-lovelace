"""Tests op de snapshot-commando's (SPEC 9 en 11.5).

Alles hier is **NIEUW GEDRAG**: vóór fase 4b-2 bestonden
`domotiapp_lovelace/snapshot/create` en `/close` niet, en beheerde niemand de
tijdelijke scene. Waar een test gedrag bewaakt dat elders al vastligt — HA's
eigen rechtenafhandeling, of de opruimlus uit fase 3 — staat dat als
**REGRESSIEWACHT** in de docstring.

De `scene`-integratie wordt hier echt opgezet, niet nagebootst: de hele reden
dat SPEC 9.2 deze route koos is dat `scene.create`, `scene.turn_on` en
`scene.delete` zich op een bepaalde manier gedragen, en dat wil je toetsen tegen
de echte implementatie.
"""

from __future__ import annotations

from typing import Any

import pytest

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import async_mock_service

from custom_components.domotiapp_lovelace.const import SNAPSHOT_ENTITY_ID_PREFIX

from .conftest import GROEP_ENTITY_ID, LEDEN, registreer_lichtgroep, zet_integratie_op


async def _zet_scene_op(hass: HomeAssistant) -> None:
    """De echte scene-integratie, want daar draait SPEC 9.2 helemaal op."""
    assert await async_setup_component(hass, "scene", {})
    await hass.async_block_till_done()


class _Lampaanroepen:
    """De opgevangen `light.turn_on`- en `turn_off`-aanroepen bij elkaar.

    Twee losse lijsten optellen met `+` zou een kopie geven die daarna niets
    meer binnenkrijgt; vandaar deze kleine wikkel.
    """

    def __init__(self, aan: list[ServiceCall], uit: list[ServiceCall]) -> None:
        self._aan = aan
        self._uit = uit

    @property
    def alles(self) -> list[ServiceCall]:
        return [*self._aan, *self._uit]

    def __len__(self) -> int:
        return len(self.alles)


def _vang_lampaanroepen(hass: HomeAssistant) -> _Lampaanroepen:
    """Vang `light.turn_on`/`turn_off` op.

    Het herstellen loopt via `scene.turn_on`, en dat reproduceert de bewaarde
    states met gewone light-services. Er draait in deze tests geen echt
    lichtplatform, dus we kijken naar de aanroepen die eruit komen — dat is
    bovendien de grens die hier telt: dát er hersteld wordt, met welke waarden,
    en met welke transition. Of HA een lamp daarna daadwerkelijk omzet, is
    HA's eigen werk.
    """
    return _Lampaanroepen(
        async_mock_service(hass, "light", "turn_on"),
        async_mock_service(hass, "light", "turn_off"),
    )


def _zet_lampen(hass: HomeAssistant, stand: str, brightness: int | None = None) -> None:
    """Geef alle groepsleden een bekende stand."""
    for entity_id in LEDEN:
        attributen: dict[str, Any] = {"supported_color_modes": ["brightness"]}
        if brightness is not None:
            attributen["brightness"] = brightness
            attributen["color_mode"] = "brightness"
        hass.states.async_set(entity_id, stand, attributen)


def _snapshot_entiteiten(hass: HomeAssistant) -> list[str]:
    return [
        state.entity_id
        for state in hass.states.async_all("scene")
        if state.entity_id.startswith(SNAPSHOT_ENTITY_ID_PREFIX)
    ]


async def _create(client, entity_id: str = GROEP_ENTITY_ID) -> dict[str, Any]:
    await client.send_json_auto_id(
        {"type": "domotiapp_lovelace/snapshot/create", "entity_id": entity_id}
    )
    return await client.receive_json()


async def _close(
    client, *, restore: bool, entity_id: str = GROEP_ENTITY_ID
) -> dict[str, Any]:
    await client.send_json_auto_id(
        {
            "type": "domotiapp_lovelace/snapshot/close",
            "entity_id": entity_id,
            "restore": restore,
        }
    )
    return await client.receive_json()


@pytest.fixture
async def klaar(hass: HomeAssistant):
    """Integratie op, scene-integratie op, en een geregistreerde light group."""
    await _zet_scene_op(hass)
    await zet_integratie_op(hass)
    registreer_lichtgroep(hass)
    return None


# --------------------------------------------------------------------------
# Aanmaken
# --------------------------------------------------------------------------


async def test_eerste_voorbeeld_maakt_een_snapshot(
    hass: HomeAssistant, klaar, hass_ws_client
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 1, eerste helft (SPEC 9.3)."""
    _zet_lampen(hass, "on", 120)
    client = await hass_ws_client(hass)

    antwoord = await _create(client)
    await hass.async_block_till_done()

    assert antwoord["success"] is True
    assert antwoord["result"] == {"created": True}
    assert len(_snapshot_entiteiten(hass)) == 1


async def test_tweede_voorbeeld_maakt_geen_tweede_snapshot(
    hass: HomeAssistant, klaar, hass_ws_client
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 1, tweede helft (SPEC 9.3)."""
    _zet_lampen(hass, "on", 120)
    client = await hass_ws_client(hass)

    eerste = await _create(client)
    await hass.async_block_till_done()
    tweede = await _create(client)
    await hass.async_block_till_done()

    assert eerste["result"] == {"created": True}
    assert tweede["result"] == {"created": False}
    assert len(_snapshot_entiteiten(hass)) == 1


async def test_snapshot_omvat_alle_leden_ook_de_niet_ingestelde(
    hass: HomeAssistant, klaar, hass_ws_client
) -> None:
    """NIEUW GEDRAG (SPEC 9.3).

    De snapshot gaat over de hele groep, niet over wat er is ingesteld. Anders
    valt een lamp die tijdens het bewerken alsnog wordt ingesteld bij het
    herstellen buiten beeld.
    """
    _zet_lampen(hass, "on", 120)
    client = await hass_ws_client(hass)

    await _create(client)
    await hass.async_block_till_done()

    scene = hass.states.get(_snapshot_entiteiten(hass)[0])
    assert set(scene.attributes["entity_id"]) == set(LEDEN)


async def test_lege_lichtgroep_levert_een_nette_fout(
    hass: HomeAssistant, hass_ws_client
) -> None:
    """NIEUW GEDRAG (SPEC 18.1).

    `scene.create` doet bij een lege scene stil niets en logt alleen een
    WARNING. Stil doorgaan zou een voorbeeld zonder weg terug opleveren, dus
    dat wordt hier een expliciete fout.
    """
    await _zet_scene_op(hass)
    await zet_integratie_op(hass)
    registreer_lichtgroep(hass, leden=[])
    client = await hass_ws_client(hass)

    antwoord = await _create(client)

    assert antwoord["success"] is False
    assert antwoord["error"]["code"] == "home_assistant_error"
    assert _snapshot_entiteiten(hass) == []


async def test_onbekende_groep_geeft_not_found(
    hass: HomeAssistant, klaar, hass_ws_client
) -> None:
    """NIEUW GEDRAG (SPEC 11.1, dezelfde foutcodes als scenes/get)."""
    client = await hass_ws_client(hass)

    antwoord = await _create(client, entity_id="light.bestaat_niet")

    assert antwoord["success"] is False
    assert antwoord["error"]["code"] == "not_found"


async def test_gewone_lamp_geeft_not_allowed(
    hass: HomeAssistant, klaar, hass_ws_client
) -> None:
    """NIEUW GEDRAG (SPEC 11.1)."""
    hass.states.async_set("light.gewone_lamp", "on", {})
    client = await hass_ws_client(hass)

    antwoord = await _create(client, entity_id="light.gewone_lamp")

    assert antwoord["success"] is False
    assert antwoord["error"]["code"] in ("not_found", "not_allowed")


# --------------------------------------------------------------------------
# Sluiten
# --------------------------------------------------------------------------


async def test_annuleren_herstelt_en_verwijdert(
    hass: HomeAssistant, klaar, hass_ws_client
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 3, eerste helft (SPEC 9.1)."""
    _zet_lampen(hass, "on", 120)
    client = await hass_ws_client(hass)

    await _create(client)
    await hass.async_block_till_done()

    # Het "voorbeeld": de lampen gaan om.
    _zet_lampen(hass, "off")
    aanroepen = _vang_lampaanroepen(hass)

    antwoord = await _close(client, restore=True)
    await hass.async_block_till_done()

    assert antwoord["result"] == {"restored": True, "deleted": True}
    assert _snapshot_entiteiten(hass) == []

    # Alle drie de lampen worden teruggezet naar hun bewaarde stand, met de
    # transition uit SPEC 9.2.
    def _ids(call: ServiceCall) -> list[str]:
        doel = call.data["entity_id"]
        return [doel] if isinstance(doel, str) else list(doel)

    hersteld = {
        entity_id: call for call in aanroepen.alles for entity_id in _ids(call)
    }
    assert set(hersteld) == set(LEDEN)
    for call in hersteld.values():
        assert call.service == "turn_on"
        assert call.data["transition"] == 1


async def test_opslaan_verwijdert_alleen(
    hass: HomeAssistant, klaar, hass_ws_client
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 3, tweede helft (SPEC 9.3).

    Bij Opslaan blijft de laatst getoonde stand staan; er wordt niet hersteld.
    """
    _zet_lampen(hass, "on", 120)
    client = await hass_ws_client(hass)

    await _create(client)
    await hass.async_block_till_done()
    _zet_lampen(hass, "off")
    aanroepen = _vang_lampaanroepen(hass)

    antwoord = await _close(client, restore=False)
    await hass.async_block_till_done()

    assert antwoord["result"] == {"restored": False, "deleted": True}
    assert _snapshot_entiteiten(hass) == []
    assert aanroepen.alles == [], "er is geen enkele lamp aangeraakt"


async def test_sluiten_zonder_voorbeeld_doet_niets(
    hass: HomeAssistant, klaar, hass_ws_client
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 4 (SPEC 9.1)."""
    _zet_lampen(hass, "on", 120)
    client = await hass_ws_client(hass)

    aanroepen = _vang_lampaanroepen(hass)

    antwoord = await _close(client, restore=True)
    await hass.async_block_till_done()

    assert antwoord["result"] == {"restored": False, "deleted": False}
    assert aanroepen.alles == [], "geen enkele service-aanroep"


async def test_tweede_sluiting_doet_niets_meer(
    hass: HomeAssistant, klaar, hass_ws_client
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 5, serverkant (SPEC 9.3).

    De kaart zorgt er zelf al voor dat sluiten hoogstens één keer wordt
    gevraagd, maar het commando is ook op zichzelf idempotent. Twee keer
    sluiten herstelt dus niet twee keer.
    """
    _zet_lampen(hass, "on", 120)
    client = await hass_ws_client(hass)

    await _create(client)
    await hass.async_block_till_done()
    _zet_lampen(hass, "off")

    aanroepen = _vang_lampaanroepen(hass)

    eerste = await _close(client, restore=True)
    await hass.async_block_till_done()
    na_eerste = len(aanroepen)

    tweede = await _close(client, restore=True)
    await hass.async_block_till_done()

    assert eerste["result"] == {"restored": True, "deleted": True}
    assert tweede["result"] == {"restored": False, "deleted": False}
    assert na_eerste > 0, "de eerste sluiting heeft wél hersteld"
    assert len(aanroepen) == na_eerste, "de tweede sluiting herstelt niet nog eens"


# --------------------------------------------------------------------------
# Rechten en gedrag na uitladen
# --------------------------------------------------------------------------


async def test_niet_admin_mag_beide_commandos(
    hass: HomeAssistant, klaar, hass_ws_client, hass_read_only_access_token: str
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 6 (SPEC 14).

    Klanten draaien Fully Kiosk met een niet-adminaccount. Zou hier
    `require_admin` op staan, dan is Voorbeeld voor de doelgroep onbruikbaar.
    """
    _zet_lampen(hass, "on", 120)
    client = await hass_ws_client(hass, hass_read_only_access_token)

    aanmaken = await _create(client)
    await hass.async_block_till_done()
    sluiten = await _close(client, restore=True)
    await hass.async_block_till_done()

    assert aanmaken["success"] is True, aanmaken.get("error")
    assert sluiten["success"] is True, sluiten.get("error")


async def test_commandos_weigeren_na_uitladen(
    hass: HomeAssistant, klaar, hass_ws_client
) -> None:
    """REGRESSIEWACHT (SPEC 11.7).

    De commando's blijven per HA-run geregistreerd, ook nadat de integratie is
    verwijderd. Een achtergebleven kaart mag daar geen snapshot meer mee maken.
    Dit bewaakt dat de nieuwe commando's dezelfde guard hebben als de vier
    bestaande.
    """
    entry = hass.config_entries.async_entries("domotiapp_lovelace")[0]
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()

    client = await hass_ws_client(hass)
    aanmaken = await _create(client)
    sluiten = await _close(client, restore=True)

    for antwoord in (aanmaken, sluiten):
        assert antwoord["success"] is False
        assert antwoord["error"]["code"] == "not_allowed"
        assert "niet geladen" in antwoord["error"]["message"]
