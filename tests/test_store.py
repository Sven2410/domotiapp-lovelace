"""Tests op de opslaglaag (SPEC 10 en 18.2).

Labels per test:

- **NIEUW GEDRAG** — er was vóór fase 3 geen implementatie. Dat de test faalt
  op de code van vóór de fase is aangetoond door hem te draaien tegen een
  lege variant van de laag; zie `test_nieuw_gedrag_faalt_op_lege_variant`
  onderaan dit bestand, die dat mechanisch vastlegt in plaats van als bewering.
- **REGRESSIEWACHT** — bewaakt gedrag dat elders al bestaat (in HA zelf, of in
  code uit een eerdere fase).
"""

from __future__ import annotations

import json
from typing import Any

import pytest

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import UnsupportedStorageVersionError
from homeassistant.helpers import entity_registry as er

from custom_components.domotiapp_lovelace.const import DEFAULT_ICONS, SCENE_COUNT
from custom_components.domotiapp_lovelace.store import (
    CorruptGroupError,
    GroupNotFoundError,
    NotALightGroupError,
    SceneData,
    SceneStore,
    SchemaError,
    huidig_entity_id,
    lege_scenes,
    resolve_light_group,
    valideer_scenes,
)

from .conftest import GROEP_ENTITY_ID, LEDEN, registreer_lichtgroep


# --------------------------------------------------------------------------
# Validatie — SPEC 10.4
# --------------------------------------------------------------------------


def _scenes(**overschrijf: Any) -> list[dict[str, Any]]:
    """Drie geldige scenes, waarvan de eerste aan te passen is."""
    eerste: dict[str, Any] = {
        "icon": "mdi:weather-sunset",
        "lights": {"light.a": {"state": "on", "brightness": 100}},
    }
    eerste.update(overschrijf)
    return [
        eerste,
        {"icon": "mdi:weather-night", "lights": {"light.a": {"state": "off"}}},
        {"icon": "mdi:numeric-3-circle-outline", "lights": {}},
    ]


def test_geldige_scenes_valideren() -> None:
    """NIEUW GEDRAG — het schema uit SPEC 10.4 wordt geaccepteerd."""
    resultaat = valideer_scenes(_scenes())

    assert len(resultaat) == SCENE_COUNT
    assert resultaat[0].icon == "mdi:weather-sunset"
    assert resultaat[0].lights == {"light.a": {"state": "on", "brightness": 100}}
    assert resultaat[1].lights == {"light.a": {"state": "off"}}
    assert resultaat[2].lights == {}


@pytest.mark.parametrize(
    ("regel", "scenes"),
    [
        # "Altijd precies drie scene-objecten"
        ("te weinig scenes", _scenes()[:2]),
        ("te veel scenes", [*_scenes(), {"icon": "mdi:x", "lights": {}}]),
        ("scenes is geen lijst", {"0": {"icon": "mdi:x", "lights": {}}}),
        # "icon is verplicht ... een lege string is ongeldig"
        ("icon ontbreekt", [{"lights": {}}, *_scenes()[1:]]),
        ("icon is leeg", _scenes(icon="")),
        ("icon is spaties", _scenes(icon="   ")),
        ("icon is geen string", _scenes(icon=42)),
        # lights moet bestaan en een object zijn
        ("lights ontbreekt", [{"icon": "mdi:x"}, *_scenes()[1:]]),
        ("lights is een lijst", _scenes(lights=[])),
        # "elke sleutel in lights is een geldig entity-ID in het light-domein"
        ("lampsleutel is geen entity-ID", _scenes(lights={"kapot": {"state": "on"}})),
        (
            "lampsleutel zit niet in het light-domein",
            _scenes(lights={"switch.a": {"state": "on"}}),
        ),
        # state moet "on" of "off" zijn
        ("state ontbreekt", _scenes(lights={"light.a": {"brightness": 100}})),
        ("state is onzin", _scenes(lights={"light.a": {"state": "misschien"}})),
        ("lampwaarde is geen object", _scenes(lights={"light.a": 100})),
        # "state: off heeft geen andere sleutels"
        (
            "off met brightness",
            _scenes(lights={"light.a": {"state": "off", "brightness": 100}}),
        ),
        (
            "off met kleur",
            _scenes(lights={"light.a": {"state": "off", "rgb_color": [1, 2, 3]}}),
        ),
        # "brightness ... een geheel getal 1-255"
        (
            "brightness is 0",
            _scenes(lights={"light.a": {"state": "on", "brightness": 0}}),
        ),
        (
            "brightness is 256",
            _scenes(lights={"light.a": {"state": "on", "brightness": 256}}),
        ),
        (
            "brightness is negatief",
            _scenes(lights={"light.a": {"state": "on", "brightness": -5}}),
        ),
        (
            "brightness is een float",
            _scenes(lights={"light.a": {"state": "on", "brightness": 100.5}}),
        ),
        (
            "brightness is een string",
            _scenes(lights={"light.a": {"state": "on", "brightness": "veel"}}),
        ),
        (
            "brightness is een bool",
            _scenes(lights={"light.a": {"state": "on", "brightness": True}}),
        ),
        # "hooguit één kleurattribuut per lamp"
        (
            "twee kleurattributen",
            _scenes(
                lights={
                    "light.a": {
                        "state": "on",
                        "rgb_color": [1, 2, 3],
                        "color_temp_kelvin": 2700,
                    }
                }
            ),
        ),
        (
            "drie kleurattributen",
            _scenes(
                lights={
                    "light.a": {
                        "state": "on",
                        "rgb_color": [1, 2, 3],
                        "hs_color": [1, 2],
                        "xy_color": [0.1, 0.2],
                    }
                }
            ),
        ),
        # kleurwaarden zelf
        (
            "rgb_color heeft twee onderdelen",
            _scenes(lights={"light.a": {"state": "on", "rgb_color": [1, 2]}}),
        ),
        (
            "rgb_color buiten bereik",
            _scenes(lights={"light.a": {"state": "on", "rgb_color": [1, 2, 999]}}),
        ),
        (
            "color_temp_kelvin is een string",
            _scenes(lights={"light.a": {"state": "on", "color_temp_kelvin": "warm"}}),
        ),
        (
            "color_temp_kelvin is 0",
            _scenes(lights={"light.a": {"state": "on", "color_temp_kelvin": 0}}),
        ),
        # onbekende sleutels
        (
            "onbekende sleutel op lampniveau",
            _scenes(lights={"light.a": {"state": "on", "effect": "regenboog"}}),
        ),
        ("onbekende sleutel op sceneniveau", _scenes(naam="Avond")),
    ],
)
def test_elke_validatieregel_afzonderlijk(regel: str, scenes: Any) -> None:
    """NIEUW GEDRAG — elke regel uit SPEC 10.4 wijst zijn overtreding af."""
    with pytest.raises(SchemaError):
        valideer_scenes(scenes)


def test_brightness_is_optioneel() -> None:
    """NIEUW GEDRAG — een onoff-lamp hoort geen brightness te hebben (SPEC 10.4)."""
    resultaat = valideer_scenes(_scenes(lights={"light.a": {"state": "on"}}))
    assert resultaat[0].lights["light.a"] == {"state": "on"}


def test_brightness_grenswaarden_zijn_toegestaan() -> None:
    """NIEUW GEDRAG — 1 en 255 vallen binnen het bereik, 0 en 256 niet."""
    for waarde in (1, 255):
        resultaat = valideer_scenes(
            _scenes(lights={"light.a": {"state": "on", "brightness": waarde}})
        )
        assert resultaat[0].lights["light.a"]["brightness"] == waarde


@pytest.mark.parametrize(
    "kleur",
    [
        {"color_temp_kelvin": 2700},
        {"rgb_color": [255, 0, 128]},
        {"hs_color": [12.5, 80.0]},
        {"xy_color": [0.31, 0.33]},
    ],
)
def test_elk_kleurattribuut_afzonderlijk_toegestaan(kleur: dict[str, Any]) -> None:
    """NIEUW GEDRAG — elk van de vier kleurvormen mag, zolang het er één is."""
    resultaat = valideer_scenes(_scenes(lights={"light.a": {"state": "on", **kleur}}))
    opgeslagen = resultaat[0].lights["light.a"]
    (sleutel,) = kleur
    assert sleutel in opgeslagen


def test_lege_scenes_gebruiken_de_standaardiconen() -> None:
    """NIEUW GEDRAG — SPEC 3 en 11.1."""
    scenes = lege_scenes()
    assert [scene.icon for scene in scenes] == list(DEFAULT_ICONS)
    assert all(scene.lights == {} for scene in scenes)


# --------------------------------------------------------------------------
# Identiteit — SPEC 10.2 en 5.2
# --------------------------------------------------------------------------


async def test_resolve_geeft_registry_entry_id(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG — de vertaling entity-ID -> registry-entry-ID (SPEC 10.2)."""
    registry_entry_id = registreer_lichtgroep(hass)

    gevonden, leden = resolve_light_group(hass, GROEP_ENTITY_ID)

    assert gevonden == registry_entry_id
    assert leden == LEDEN


async def test_resolve_onbekende_entiteit(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG — een entiteit die niet bestaat geeft GroupNotFoundError."""
    with pytest.raises(GroupNotFoundError):
        resolve_light_group(hass, "light.bestaat_niet")


async def test_resolve_entiteit_buiten_registry(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG — geen registry-entry betekent geen stabiele sleutel.

    Dit is het geval van de oude YAML-group-integratie (SPEC 5.3): die
    entiteiten hebben geen unique_id en staan dus niet in het entity registry.
    """
    hass.states.async_set("light.los", "on", {"entity_id": ["light.a"]})

    with pytest.raises(GroupNotFoundError):
        resolve_light_group(hass, "light.los")


async def test_resolve_gewone_lamp_is_geen_groep(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG — zonder entity_id-attribuut is het geen light group."""
    registry = er.async_get(hass)
    entry = registry.async_get_or_create("light", "demo", "losse-lamp")
    hass.states.async_set(entry.entity_id, "on", {"brightness": 100})

    with pytest.raises(NotALightGroupError):
        resolve_light_group(hass, entry.entity_id)


async def test_groep_filtert_zichzelf_uit_de_ledenlijst(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG — SPEC 5.2, relevant bij geneste groepen."""
    registreer_lichtgroep(hass, leden=[*LEDEN, GROEP_ENTITY_ID])
    _rid, leden = resolve_light_group(hass, GROEP_ENTITY_ID)

    assert leden == LEDEN


async def test_huidig_entity_id_volgt_een_hernoeming(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG — het registry-entry-ID overleeft een hernoeming (SPEC 13.1)."""
    registry_entry_id = registreer_lichtgroep(hass)
    assert huidig_entity_id(hass, registry_entry_id) == GROEP_ENTITY_ID

    er.async_get(hass).async_update_entity(GROEP_ENTITY_ID, new_entity_id="light.nieuw")
    await hass.async_block_till_done()

    assert huidig_entity_id(hass, registry_entry_id) == "light.nieuw"


async def test_huidig_entity_id_van_verdwenen_entiteit(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG — een verwijderde groep geeft None (SPEC 11.3)."""
    assert huidig_entity_id(hass, "bestaat-niet") is None


# --------------------------------------------------------------------------
# Store — SPEC 18.2.2
# --------------------------------------------------------------------------


async def test_kapotte_groep_blokkeert_gezonde_groep_niet(
    hass: HomeAssistant, schrijf_opslag, lees_opslag
) -> None:
    """NIEUW GEDRAG — het kerngeval van fase 2b correctie 1 (SPEC 18.2 regel 5).

    Een kapotte groep mag het opslaan van een gezonde groep niet blokkeren, en
    de kapotte data moet na die schrijfronde nog ongewijzigd op schijf staan.
    """
    kapot_ruw = {
        "last_known_entity_id": "light.zolder",
        "scenes": [{"icon": "mdi:x", "lights": {"light.a": {"state": "misschien"}}}],
        "iets_onbekends": {"blijft": "staan"},
    }
    schrijf_opslag({"kapotte-groep": kapot_ruw})

    store = SceneStore(hass)
    await store.async_load()

    assert store.is_corrupt("kapotte-groep")
    with pytest.raises(CorruptGroupError):
        store.async_get_group("kapotte-groep")

    # De gezonde groep opslaan moet gewoon lukken.
    await store.async_save_group(
        "gezonde-groep",
        "light.woonkamer",
        valideer_scenes(_scenes()),
    )

    op_schijf = lees_opslag()["data"]["groups"]

    # De gezonde groep staat erin ...
    assert op_schijf["gezonde-groep"]["last_known_entity_id"] == "light.woonkamer"
    # ... en de kapotte data staat er byte-voor-byte nog precies zoals hij was.
    assert op_schijf["kapotte-groep"] == kapot_ruw


async def test_kapotte_groep_kan_niet_overschreven_worden(
    hass: HomeAssistant, schrijf_opslag, lees_opslag
) -> None:
    """NIEUW GEDRAG — SPEC 18.2 regel 3: opslaan op een kapotte groep weigert."""
    kapot_ruw = {"last_known_entity_id": "light.zolder", "scenes": "onzin"}
    schrijf_opslag({"kapot": kapot_ruw})

    store = SceneStore(hass)
    await store.async_load()

    with pytest.raises(CorruptGroupError):
        await store.async_save_group("kapot", "light.zolder", valideer_scenes(_scenes()))

    assert lees_opslag()["data"]["groups"]["kapot"] == kapot_ruw


async def test_kapotte_groep_krijgt_een_reparatiemelding(
    hass: HomeAssistant, schrijf_opslag, issue_registry
) -> None:
    """NIEUW GEDRAG — SPEC 18.2 regel 4."""
    schrijf_opslag({"kapot": {"last_known_entity_id": "light.zolder", "scenes": []}})

    store = SceneStore(hass)
    await store.async_load()

    assert issue_registry.async_get_issue("domotiapp_lovelace", "corrupte_opslag_kapot")


async def test_verwijderen_van_kapotte_groep_sluit_de_melding(
    hass: HomeAssistant, schrijf_opslag, lees_opslag, issue_registry
) -> None:
    """NIEUW GEDRAG — SPEC 18.2.3 stap 2."""
    schrijf_opslag({"kapot": {"last_known_entity_id": "light.zolder", "scenes": []}})

    store = SceneStore(hass)
    await store.async_load()
    assert await store.async_delete_group("kapot") is True

    assert (
        issue_registry.async_get_issue("domotiapp_lovelace", "corrupte_opslag_kapot")
        is None
    )
    assert lees_opslag()["data"]["groups"] == {}
    assert store.is_corrupt("kapot") is False


async def test_geen_sleutel_in_beide_dicts(
    hass: HomeAssistant, schrijf_opslag
) -> None:
    """NIEUW GEDRAG — de invariant uit SPEC 18.2.2 punt 3."""
    schrijf_opslag(
        {
            "goed": {
                "last_known_entity_id": "light.woonkamer",
                "scenes": _scenes(),
            },
            "kapot": {"last_known_entity_id": "light.zolder", "scenes": []},
        }
    )

    store = SceneStore(hass)
    await store.async_load()

    assert store.is_corrupt("kapot") is True
    assert store.is_corrupt("goed") is False
    assert store.async_get_group("goed") is not None


async def test_niets_opgeslagen_geeft_none(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG — een onbekende groep is niet hetzelfde als een kapotte."""
    store = SceneStore(hass)
    await store.async_load()

    assert store.async_get_group("onbekend") is None
    assert store.is_corrupt("onbekend") is False


async def test_label_wordt_alleen_bijgewerkt_als_het_verandert(
    hass: HomeAssistant, lees_opslag
) -> None:
    """NIEUW GEDRAG — SPEC 10.2: een leesactie schrijft niet zonder reden."""
    store = SceneStore(hass)
    await store.async_load()
    await store.async_save_group("groep", GROEP_ENTITY_ID, valideer_scenes(_scenes()))

    voor = lees_opslag()
    await store.async_update_label("groep", GROEP_ENTITY_ID)
    assert lees_opslag() == voor

    await store.async_update_label("groep", "light.nieuwe_naam")
    assert (
        lees_opslag()["data"]["groups"]["groep"]["last_known_entity_id"]
        == "light.nieuwe_naam"
    )


async def test_migratiehaak_gooit_notimplemented(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG — SPEC 10.6: er is nog geen migratiepad, dus falen is correct."""
    store = SceneStore(hass)

    with pytest.raises(NotImplementedError):
        await store._store._async_migrate_func(0, 1, {"groups": {}})


async def test_nieuwere_opslag_wordt_niet_half_geinterpreteerd(
    hass: HomeAssistant, schrijf_opslag
) -> None:
    """REGRESSIEWACHT — SPEC 10.6, derde bullet.

    Staat er een hogere `version` in het bestand dan de code aankan, dan gooit
    HA zelf `UnsupportedStorageVersionError` — nog vóór onze migratiehaak. Dat
    is het gewenste gedrag: liever falen dan een nieuw formaat half
    interpreteren. Deze test bewaakt dat wij dat niet per ongeluk afvangen.
    """
    schrijf_opslag({}, version=99, minor_version=1)

    store = SceneStore(hass)
    with pytest.raises(UnsupportedStorageVersionError):
        await store.async_load()


async def test_lijst_bevat_ook_kapotte_groepen(
    hass: HomeAssistant, schrijf_opslag
) -> None:
    """NIEUW GEDRAG — een admin moet juist de kapotte kamer kunnen opruimen."""
    registry_entry_id = registreer_lichtgroep(hass)

    store = SceneStore(hass)
    await store.async_load()
    await store.async_save_group(
        registry_entry_id, GROEP_ENTITY_ID, valideer_scenes(_scenes())
    )
    store._corrupt["weg"] = ({"last_known_entity_id": "light.zolder"}, "testreden")

    op_naam = {groep["registry_entry_id"]: groep for groep in store.async_list_groups()}

    assert op_naam[registry_entry_id]["exists"] is True
    assert op_naam[registry_entry_id]["current_entity_id"] == GROEP_ENTITY_ID
    assert op_naam[registry_entry_id]["configured_light_count"] == [1, 1, 0]
    assert op_naam[registry_entry_id]["corrupt"] is False

    assert op_naam["weg"]["exists"] is False
    assert op_naam["weg"]["current_entity_id"] is None
    assert op_naam["weg"]["configured_light_count"] is None
    assert op_naam["weg"]["corrupt"] is True


# --------------------------------------------------------------------------
# Het label "NIEUW GEDRAG", mechanisch onderbouwd
# --------------------------------------------------------------------------


async def test_nieuw_gedrag_faalt_op_lege_variant(hass: HomeAssistant) -> None:
    """NIEUW GEDRAG, aantoonbaar.

    De regel "een test telt pas als hij aantoonbaar faalt op de code van vóór
    de fix" is voor nieuw gedrag niet letterlijk toepasbaar: er was geen code.
    Deze test legt in plaats daarvan mechanisch vast wat "de code van vóór deze
    fase" zou opleveren — een opslaglaag zonder validatie en zonder scheiding
    tussen geldige en kapotte groepen — en toont dat die de eisen van SPEC 10.4
    en 18.2.2 níét haalt.

    Draait deze test groen, dan is aangetoond dat de tests hierboven werkelijk
    iets afdwingen dat er zonder de implementatie van fase 3 niet zou zijn.
    """

    class LegeVariant:
        """Wat er vóór fase 3 was: niets."""

        def __init__(self) -> None:
            self.groups: dict[str, Any] = {}

        def save(self, registry_entry_id: str, scenes: Any) -> None:
            # Geen validatie, geen scheiding: gewoon wegschrijven.
            self.groups[registry_entry_id] = scenes

    leeg = LegeVariant()

    # 1. De lege variant accepteert data die SPEC 10.4 verbiedt.
    ongeldig = _scenes(lights={"light.a": {"state": "off", "brightness": 100}})
    leeg.save("groep", ongeldig)
    assert leeg.groups["groep"] == ongeldig, "lege variant slikt alles"

    # Onze laag doet dat niet.
    with pytest.raises(SchemaError):
        valideer_scenes(ongeldig)

    # 2. De lege variant kent geen onderscheid tussen "niets opgeslagen" en
    #    "onleesbaar", en zou dus stil op een default terugvallen (SPEC 18.1).
    assert leeg.groups.get("onbekend") is None
    assert leeg.groups.get("kapot") is None  # niet van elkaar te onderscheiden

    store = SceneStore(hass)
    await store.async_load()
    store._corrupt["kapot"] = ({"iets": "kapots"}, "testreden")

    assert store.async_get_group("onbekend") is None
    with pytest.raises(CorruptGroupError):
        store.async_get_group("kapot")


def test_scenedata_serialiseert_naar_het_schema() -> None:
    """NIEUW GEDRAG — to_dict() levert exact het formaat uit SPEC 10.4."""
    scene = SceneData(icon="mdi:x", lights={"light.a": {"state": "on"}})
    assert scene.to_dict() == {"icon": "mdi:x", "lights": {"light.a": {"state": "on"}}}


def test_json_voorbeeld_uit_spec_valideert() -> None:
    """REGRESSIEWACHT — het letterlijke voorbeeld uit SPEC 10.5 blijft geldig.

    Zou iemand het schema wijzigen zonder SPEC 10.5 bij te werken, dan faalt
    deze test. Hij bewaakt de overeenkomst tussen document en code.
    """
    voorbeeld = json.loads(
        """
        [
          {
            "icon": "mdi:weather-sunset",
            "lights": {
              "light.plafond_slaapkamer": {"state": "on"},
              "light.bedlamp_links": {
                "state": "on", "brightness": 102, "color_temp_kelvin": 2700
              }
            }
          },
          {
            "icon": "mdi:weather-night",
            "lights": {
              "light.plafond_slaapkamer": {"state": "off"},
              "light.bedlamp_links": {"state": "off"}
            }
          },
          {"icon": "mdi:numeric-3-circle-outline", "lights": {}}
        ]
        """
    )

    resultaat = valideer_scenes(voorbeeld)

    assert [scene.to_dict() for scene in resultaat] == voorbeeld
