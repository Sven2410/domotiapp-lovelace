"""Tests op het opruimoverzicht (SPEC 15).

Alles hier is **NIEUW GEDRAG**: vóór fase 5 had de integratie geen options flow.
Waar een test gedrag bewaakt dat elders al vastligt — dat er nergens automatisch
wordt opgeruimd — staat dat als **REGRESSIEWACHT** in de docstring.

De flow wordt via `hass.config_entries.options` gedraaid, dus langs precies
dezelfde weg als de UI. Het admin-slot zit niet in onze code maar in HA's eigen
endpoints; dat wordt hieronder op de bron nagegaan in plaats van nagebootst.
"""

from __future__ import annotations

from typing import Any

from homeassistant import data_entry_flow
from homeassistant.core import HomeAssistant

from custom_components.domotiapp_lovelace.config_flow import (
    CONF_BEVESTIGD,
    CONF_GROEP,
    maak_label,
)
from custom_components.domotiapp_lovelace.const import DATA_STORE, DOMAIN

from .conftest import registreer_lichtgroep, zet_integratie_op

GROEP_A = "aaaa1111"
GROEP_B = "bbbb2222"
GROEP_KAPOT = "cccc3333"


def _scene(lampen: dict[str, Any] | None = None) -> dict[str, Any]:
    return {"icon": "mdi:weather-sunset", "lights": lampen or {}}


def _gezonde_groep(entity_id: str, aantallen: tuple[int, int, int]) -> dict[str, Any]:
    """Een geldige groep met een gegeven aantal ingestelde lampen per scene."""
    scenes = []
    for aantal in aantallen:
        lampen = {f"light.l{i}": {"state": "on"} for i in range(aantal)}
        scenes.append(_scene(lampen))
    return {"last_known_entity_id": entity_id, "scenes": scenes}


async def _start(hass: HomeAssistant) -> dict[str, Any]:
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    return await hass.config_entries.options.async_init(entry.entry_id)


# --------------------------------------------------------------------------
# Stap init — de keuzelijst
# --------------------------------------------------------------------------


async def test_lege_opslag_toont_bericht_en_geen_keuzelijst(
    hass: HomeAssistant, hass_storage, opgezet
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 6 (SPEC 15.2).

    Een leeg `select` is geen scherm dat je iemand voorzet; de flow eindigt met
    een bericht.
    """
    resultaat = await _start(hass)

    assert resultaat["type"] is data_entry_flow.FlowResultType.ABORT
    assert resultaat["reason"] == "niets_opgeslagen"


async def test_lijst_bevat_groep_waarvan_de_entiteit_weg_is(
    hass: HomeAssistant, schrijf_opslag
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 2 (SPEC 15.2).

    De waarde achter elk item is het registry-entry-ID, juist zodat de flow ook
    werkt voor een groep die niet meer bestaat.
    """
    # De groep die nog bestaat krijgt zijn echte registry-entry-ID; alleen dan
    # kan de Store hem terugvinden. GROEP_B bestaat niet meer.
    bestaand_id = registreer_lichtgroep(
        hass, entity_id="light.bestaat_nog", unique_id="groep-bestaat-nog"
    )
    schrijf_opslag(
        {
            bestaand_id: _gezonde_groep("light.bestaat_nog", (2, 2, 0)),
            GROEP_B: _gezonde_groep("light.oude_naam", (3, 1, 0)),
        }
    )
    await zet_integratie_op(hass)

    resultaat = await _start(hass)

    assert resultaat["type"] is data_entry_flow.FlowResultType.FORM
    assert resultaat["step_id"] == "init"

    opties = _opties(resultaat)
    waarden = {optie["value"] for optie in opties}
    assert GROEP_B in waarden, "de verdwenen groep hoort in de lijst te staan"

    labels = {optie["value"]: optie["label"] for optie in opties}
    assert "bestaat niet meer" in labels[GROEP_B]
    assert "3/1/0 lampen" in labels[GROEP_B]
    assert "bestaat niet meer" not in labels[bestaand_id]
    assert "2/2/0 lampen" in labels[bestaand_id]


async def test_onleesbare_groep_staat_gemarkeerd_in_de_lijst(
    hass: HomeAssistant, schrijf_opslag
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 3 (SPEC 11.3.1).

    Juist de kamer die opgeruimd moet worden mag niet de enige zijn die je niet
    ziet. Het aantal lampen is `null`, want dat is niet te bepalen zonder de
    data te interpreteren — en interpreteren is precies wat we hier niet doen.
    """
    schrijf_opslag(
        {
            GROEP_A: _gezonde_groep("light.gezond", (1, 0, 0)),
            GROEP_KAPOT: {
                "last_known_entity_id": "light.kapotte_kamer",
                "scenes": [{"icon": "mdi:x", "lights": {"light.a": {"state": "wat?"}}}],
            },
        }
    )
    await zet_integratie_op(hass)

    resultaat = await _start(hass)
    labels = {optie["value"]: optie["label"] for optie in _opties(resultaat)}

    assert GROEP_KAPOT in labels
    assert labels[GROEP_KAPOT] == "light.kapotte_kamer — onleesbaar"
    assert "lampen" not in labels[GROEP_KAPOT], "geen aantal bij onleesbare data"


# --------------------------------------------------------------------------
# Stap confirm — bevestigen en verwijderen
# --------------------------------------------------------------------------


async def test_verwijderen_wist_precies_een_groep(
    hass: HomeAssistant, schrijf_opslag, lees_opslag
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 4 (SPEC 15.2)."""
    schrijf_opslag(
        {
            GROEP_A: _gezonde_groep("light.blijft", (2, 2, 0)),
            GROEP_B: _gezonde_groep("light.weg", (1, 0, 0)),
        }
    )
    await zet_integratie_op(hass)

    resultaat = await _start(hass)
    resultaat = await hass.config_entries.options.async_configure(
        resultaat["flow_id"], {CONF_GROEP: GROEP_B}
    )
    assert resultaat["step_id"] == "confirm"

    resultaat = await hass.config_entries.options.async_configure(
        resultaat["flow_id"], {CONF_BEVESTIGD: True}
    )
    await hass.async_block_till_done()

    assert resultaat["type"] is data_entry_flow.FlowResultType.CREATE_ENTRY

    groepen = lees_opslag()["data"]["groups"]
    assert set(groepen) == {GROEP_A}, "alleen de gekozen groep is weg"
    assert groepen[GROEP_A]["last_known_entity_id"] == "light.blijft"


async def test_zonder_vinkje_wordt_er_niets_verwijderd(
    hass: HomeAssistant, schrijf_opslag, lees_opslag
) -> None:
    """NIEUW GEDRAG (SPEC 15.2).

    Het HA-patroon voor "je moet dit echt bevestigen": dezelfde vorm opnieuw,
    met een fout erbij. En vooral: er is nog niets gebeurd.
    """
    schrijf_opslag({GROEP_A: _gezonde_groep("light.blijft", (1, 1, 1))})
    await zet_integratie_op(hass)

    resultaat = await _start(hass)
    resultaat = await hass.config_entries.options.async_configure(
        resultaat["flow_id"], {CONF_GROEP: GROEP_A}
    )
    resultaat = await hass.config_entries.options.async_configure(
        resultaat["flow_id"], {CONF_BEVESTIGD: False}
    )
    await hass.async_block_till_done()

    assert resultaat["type"] is data_entry_flow.FlowResultType.FORM
    assert resultaat["step_id"] == "confirm"
    assert resultaat["errors"] == {"base": "bevestiging_vereist"}
    assert set(lees_opslag()["data"]["groups"]) == {GROEP_A}


async def test_annuleren_in_stap_confirm_wist_niets(
    hass: HomeAssistant, schrijf_opslag, lees_opslag
) -> None:
    """NIEUW GEDRAG — verplicht testgeval 5 (SPEC 15.2).

    "Annuleren" is in een options flow: de dialoog wegklikken, oftewel de flow
    afbreken. Er is geen tussenstaat — het verwijderen gebeurt pas bij het
    verzenden van stap `confirm` met het vinkje aan.
    """
    schrijf_opslag(
        {
            GROEP_A: _gezonde_groep("light.een", (2, 0, 0)),
            GROEP_B: _gezonde_groep("light.twee", (1, 1, 1)),
        }
    )
    await zet_integratie_op(hass)

    resultaat = await _start(hass)
    resultaat = await hass.config_entries.options.async_configure(
        resultaat["flow_id"], {CONF_GROEP: GROEP_B}
    )
    assert resultaat["step_id"] == "confirm"

    hass.config_entries.options.async_abort(resultaat["flow_id"])
    await hass.async_block_till_done()

    assert set(lees_opslag()["data"]["groups"]) == {GROEP_A, GROEP_B}


async def test_de_flow_gebruikt_dezelfde_opslagfuncties_als_de_commandos(
    hass: HomeAssistant, schrijf_opslag
) -> None:
    """NIEUW GEDRAG (SPEC 11.6).

    Eén implementatie, twee aanroepers. Deze test vervangt de twee functies in
    de Store en controleert dat de flow er langs komt — zou de flow zijn eigen
    lijst of eigen verwijdering hebben, dan merkt hij daar niets van.
    """
    schrijf_opslag({GROEP_A: _gezonde_groep("light.een", (1, 0, 0))})
    await zet_integratie_op(hass)
    store = hass.data[DOMAIN][DATA_STORE]

    gezien: list[str] = []
    echte_lijst = store.async_list_groups
    echte_verwijder = store.async_delete_group

    def lijst_met_spion():
        gezien.append("async_list_groups")
        return echte_lijst()

    async def verwijder_met_spion(registry_entry_id: str):
        gezien.append("async_delete_group")
        return await echte_verwijder(registry_entry_id)

    store.async_list_groups = lijst_met_spion
    store.async_delete_group = verwijder_met_spion

    resultaat = await _start(hass)
    resultaat = await hass.config_entries.options.async_configure(
        resultaat["flow_id"], {CONF_GROEP: GROEP_A}
    )
    await hass.config_entries.options.async_configure(
        resultaat["flow_id"], {CONF_BEVESTIGD: True}
    )
    await hass.async_block_till_done()

    assert "async_list_groups" in gezien
    assert "async_delete_group" in gezien


# --------------------------------------------------------------------------
# Rechten
# --------------------------------------------------------------------------


def test_de_options_flow_endpoints_zijn_admin_only() -> None:
    """NIEUW GEDRAG — verplicht testgeval 1 (SPEC 15.1).

    Het admin-slot zit niet in onze code maar in HA zelf: beide views van de
    options flow staan achter `@require_admin`. Deze test leest dat af aan de
    bron in plaats van het na te bootsen, want een nagebootste controle zou
    blijven slagen als HA het ooit anders doet.
    """
    import inspect

    from homeassistant.components.config import config_entries as ha_config_entries

    for naam in ("OptionManagerFlowIndexView", "OptionManagerFlowResourceView"):
        view = getattr(ha_config_entries, naam)
        bron = inspect.getsource(view)
        assert "@require_admin" in bron, f"{naam} is niet meer admin-only"


# --------------------------------------------------------------------------
# Nooit automatisch opruimen (SPEC 15.3 en 15.4)
# --------------------------------------------------------------------------


async def test_store_blijft_bestaan_na_verwijderen_van_de_config_entry(
    hass: HomeAssistant, schrijf_opslag, lees_opslag
) -> None:
    """REGRESSIEWACHT — verplicht testgeval 7 (SPEC 15.4).

    Slaagt ook op de code van vóór fase 5, en dat hoort zo: deze wacht bewaakt
    dat de options flow er geen opruimgedrag bij heeft gesmokkeld. Opruimen
    gebeurt nooit als bijwerking — wie de integratie verwijdert en opnieuw
    installeert krijgt zijn scenes terug.
    """
    schrijf_opslag({GROEP_A: _gezonde_groep("light.blijft", (2, 2, 2))})
    entry = await zet_integratie_op(hass)

    assert await hass.config_entries.async_remove(entry.entry_id)
    await hass.async_block_till_done()

    opslag = lees_opslag()
    assert opslag is not None, "de Store is verdwenen bij het verwijderen"
    assert set(opslag["data"]["groups"]) == {GROEP_A}


async def test_er_wordt_bij_het_opstarten_niets_opgeruimd(
    hass: HomeAssistant, schrijf_opslag, lees_opslag
) -> None:
    """REGRESSIEWACHT (SPEC 15.3).

    Ook een groep waarvan de entiteit niet meer bestaat blijft gewoon staan.
    Een kaart die tijdelijk van een dashboard is gehaald moet zijn scenes
    houden; automatisch opruimen zou van "kaart even weghalen" een
    onomkeerbare handeling maken.
    """
    schrijf_opslag(
        {
            GROEP_A: _gezonde_groep("light.bestaat_niet_meer", (3, 3, 3)),
            GROEP_KAPOT: {
                "last_known_entity_id": "light.kapot",
                "scenes": [{"icon": "mdi:x", "lights": {"light.a": {"state": "?"}}}],
            },
        }
    )
    await zet_integratie_op(hass)
    await hass.async_block_till_done()

    groepen = lees_opslag()["data"]["groups"]
    assert set(groepen) == {GROEP_A, GROEP_KAPOT}


async def test_uitladen_en_opnieuw_laden_raakt_de_opslag_niet(
    hass: HomeAssistant, schrijf_opslag, lees_opslag
) -> None:
    """REGRESSIEWACHT (SPEC 15.3)."""
    schrijf_opslag({GROEP_A: _gezonde_groep("light.een", (1, 1, 1))})
    entry = await zet_integratie_op(hass)

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    assert set(lees_opslag()["data"]["groups"]) == {GROEP_A}


# --------------------------------------------------------------------------
# Labels
# --------------------------------------------------------------------------


def test_labels_maken_de_drie_gevallen_uit_elkaar_te_houden() -> None:
    """NIEUW GEDRAG (SPEC 15.2)."""
    bestaat = {
        "registry_entry_id": GROEP_A,
        "last_known_entity_id": "light.slaapkamer",
        "current_entity_id": "light.slaapkamer",
        "exists": True,
        "configured_light_count": [2, 2, 0],
        "corrupt": False,
    }
    weg = {
        **bestaat,
        "current_entity_id": None,
        "exists": False,
        "last_known_entity_id": "light.oude_naam",
        "configured_light_count": [3, 1, 0],
    }
    kapot = {
        **weg,
        "last_known_entity_id": "light.kapot",
        "configured_light_count": None,
        "corrupt": True,
    }

    assert (
        maak_label(bestaat, lambda _e: "Slaapkamer")
        == "Slaapkamer (light.slaapkamer) — 2/2/0 lampen"
    )
    # Zonder friendly_name valt het label terug op het entity-ID.
    assert maak_label(bestaat) == "light.slaapkamer — 2/2/0 lampen"
    assert maak_label(weg) == "light.oude_naam — bestaat niet meer — 3/1/0 lampen"
    assert maak_label(kapot) == "light.kapot — onleesbaar"


def _opties(resultaat: dict[str, Any]) -> list[dict[str, Any]]:
    """De keuzelijst uit het formulier van stap init."""
    schema = resultaat["data_schema"].schema
    for sleutel, waarde in schema.items():
        if str(sleutel) == CONF_GROEP:
            return waarde.config["options"]
    raise AssertionError("geen keuzelijst in het formulier")
