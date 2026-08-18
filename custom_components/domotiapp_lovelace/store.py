"""Opslaglaag voor DomotiApp Lovelace.

Implementeert SPEC.md sectie 10 (schema, sleutel, migratie) en sectie 18.2
(foutgedrag bij onleesbare of ongeldige opslag).

De kern van dit bestand is de scheiding uit SPEC 18.2.2: **valideren is niet
hetzelfde als parsen.** Een groep die valideert komt als getypt object in
`_groups`; een groep die dat niet doet, wordt onbewerkt bewaard in `_corrupt`
en bij elke opslagronde letterlijk teruggeschreven. Zo blijft de kapotte data
behouden zonder dat één kapotte kamer het opslaan van alle andere kamers
blokkeert.
"""

from __future__ import annotations

from dataclasses import dataclass, field
import logging
from typing import Any, Final

from homeassistant.components.light import DOMAIN as LIGHT_DOMAIN
from homeassistant.const import STATE_OFF, STATE_ON
from homeassistant.core import HomeAssistant, callback, valid_entity_id
from homeassistant.helpers import entity_registry as er, issue_registry as ir
from homeassistant.helpers.storage import Store

from .const import (
    DEFAULT_ICONS,
    DOMAIN,
    ISSUE_CORRUPT_GROUP_PREFIX,
    ISSUE_STORE_UNUSABLE,
    SCENE_COUNT,
    STORAGE_KEY,
    STORAGE_MINOR_VERSION,
    STORAGE_VERSION,
)

_LOGGER = logging.getLogger(__name__)

# Attribuut waarin een light group zijn leden opsomt zolang hij beschikbaar is
# (SPEC 5.1).
ATTR_MEMBER_ENTITY_IDS: Final = "entity_id"

# Sleutels van de config entry van een group helper. Bewust als losse
# constanten en niet via een import van `homeassistant.components.group`: we
# lezen alleen configuratie en willen geen afhankelijkheid op die integratie.
# Vindplaatsen: `components/group/config_flow.py:163-177` voor de waarden van
# group_type, en `components/group/light.py:105-107` voor het gebruik van
# options["entities"].
GROUP_INTEGRATION_DOMAIN: Final = "group"
CONF_GROUP_TYPE: Final = "group_type"
CONF_ENTITIES: Final = "entities"

# De vier kleurattributen sluiten elkaar uit (SPEC 10.4).
COLOR_KEYS: Final = ("color_temp_kelvin", "rgb_color", "hs_color", "xy_color")

# Alles wat naast "state" in een lampobject mag staan.
_ALLOWED_LIGHT_KEYS: Final = frozenset({"state", "brightness", *COLOR_KEYS})

_COLOR_LENGTHS: Final = {"rgb_color": 3, "hs_color": 2, "xy_color": 2}


# --------------------------------------------------------------------------
# Fouten
# --------------------------------------------------------------------------


class SchemaError(ValueError):
    """De data voldoet niet aan het schema uit SPEC 10.4."""


class GroupNotFoundError(LookupError):
    """De entiteit bestaat niet, of staat niet in het entity registry."""


class NotALightGroupError(LookupError):
    """De entiteit bestaat wel, maar is geen light group."""


class StoreUnusableError(RuntimeError):
    """De hele opslag is onbruikbaar (SPEC 18.2, geval C).

    Anders dan bij geval B is er geen sleutel per groep, dus valt er niets per
    kamer te markeren en niets terug te zetten bij een schrijfronde. Elke
    schrijfactie zou de hele inhoud weggooien; daarom wordt er in deze toestand
    niet geschreven en niet gelezen.
    """

    def __init__(self, reden: str) -> None:
        """Onthoud waarom de opslag onbruikbaar is."""
        super().__init__(f"De opgeslagen scenes zijn onleesbaar: {reden}")
        self.reden = reden


class CorruptGroupError(RuntimeError):
    """De opgeslagen data van deze groep valideert niet (SPEC 18.2, geval B)."""

    def __init__(self, registry_entry_id: str, reden: str) -> None:
        """Onthoud welke groep het betreft en waarom hij faalde."""
        super().__init__(
            f"Opgeslagen scenes van {registry_entry_id} zijn onleesbaar: {reden}"
        )
        self.registry_entry_id = registry_entry_id
        self.reden = reden


# --------------------------------------------------------------------------
# Getypte data
# --------------------------------------------------------------------------


@dataclass(slots=True)
class SceneData:
    """Eén scene: een icoon en de ingestelde lampen.

    `lights` bevat uitsluitend **ingestelde** lampen. Een lamp die er niet in
    staat is niet ingesteld (SPEC 7.2); er is geen vlag en geen null-waarde.
    De waarden zijn gevalideerde, genormaliseerde dicts — niet verder
    gemodelleerd, omdat elke extra laag een kans is om onbedoeld iets te
    verliezen bij het heen-en-weer omzetten.
    """

    icon: str
    lights: dict[str, dict[str, Any]] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        """Serialiseer naar het formaat uit SPEC 10.4."""
        return {
            "icon": self.icon,
            "lights": {
                entity_id: dict(waarde) for entity_id, waarde in self.lights.items()
            },
        }


@dataclass(slots=True)
class GroupData:
    """Alles wat er van één light group is opgeslagen."""

    last_known_entity_id: str
    scenes: list[SceneData]

    def to_dict(self) -> dict[str, Any]:
        """Serialiseer naar het formaat uit SPEC 10.4."""
        return {
            "last_known_entity_id": self.last_known_entity_id,
            "scenes": [scene.to_dict() for scene in self.scenes],
        }


@callback
def lege_scenes() -> list[SceneData]:
    """Drie lege scenes met de standaardiconen (SPEC 3 en 11.1)."""
    return [SceneData(icon=icoon, lights={}) for icoon in DEFAULT_ICONS]


# --------------------------------------------------------------------------
# Validatie (SPEC 10.4)
# --------------------------------------------------------------------------


def _valideer_lampwaarde(entity_id: str, waarde: Any) -> dict[str, Any]:
    """Valideer één lampobject en geef het genormaliseerd terug."""
    if not isinstance(waarde, dict):
        raise SchemaError(f"{entity_id}: waarde is geen object")

    onbekend = set(waarde) - _ALLOWED_LIGHT_KEYS
    if onbekend:
        raise SchemaError(f"{entity_id}: onbekende sleutels {sorted(onbekend)}")

    staat = waarde.get("state")
    if staat not in (STATE_ON, STATE_OFF):
        raise SchemaError(f"{entity_id}: state moet 'on' of 'off' zijn, kreeg {staat!r}")

    # "state: off heeft geen andere sleutels" (SPEC 10.4).
    if staat == STATE_OFF:
        extra = set(waarde) - {"state"}
        if extra:
            raise SchemaError(
                f"{entity_id}: bij state 'off' zijn geen andere sleutels toegestaan, "
                f"kreeg {sorted(extra)}"
            )
        return {"state": STATE_OFF}

    genormaliseerd: dict[str, Any] = {"state": STATE_ON}

    # brightness is optioneel; aanwezig betekent een geheel getal 1..255.
    if "brightness" in waarde:
        helderheid = waarde["brightness"]
        # bool is een subklasse van int; True zou anders als 1 doorglippen.
        if isinstance(helderheid, bool) or not isinstance(helderheid, int):
            raise SchemaError(
                f"{entity_id}: brightness moet een geheel getal zijn, "
                f"kreeg {helderheid!r}"
            )
        if not 1 <= helderheid <= 255:
            raise SchemaError(
                f"{entity_id}: brightness moet tussen 1 en 255 liggen, "
                f"kreeg {helderheid}"
            )
        genormaliseerd["brightness"] = helderheid

    # Hooguit één kleurattribuut (SPEC 10.4).
    aanwezig = [sleutel for sleutel in COLOR_KEYS if sleutel in waarde]
    if len(aanwezig) > 1:
        raise SchemaError(
            f"{entity_id}: hooguit één kleurattribuut toegestaan, kreeg {aanwezig}"
        )

    if aanwezig:
        sleutel = aanwezig[0]
        genormaliseerd[sleutel] = _valideer_kleur(entity_id, sleutel, waarde[sleutel])

    return genormaliseerd


def _valideer_kleur(entity_id: str, sleutel: str, waarde: Any) -> Any:
    """Valideer één kleurattribuut."""
    if sleutel == "color_temp_kelvin":
        if isinstance(waarde, bool) or not isinstance(waarde, int):
            raise SchemaError(
                f"{entity_id}: color_temp_kelvin moet een geheel getal zijn, "
                f"kreeg {waarde!r}"
            )
        if waarde <= 0:
            raise SchemaError(
                f"{entity_id}: color_temp_kelvin moet groter dan 0 zijn, kreeg {waarde}"
            )
        return waarde

    lengte = _COLOR_LENGTHS[sleutel]
    if not isinstance(waarde, (list, tuple)) or len(waarde) != lengte:
        raise SchemaError(
            f"{entity_id}: {sleutel} moet een lijst van {lengte} getallen zijn, "
            f"kreeg {waarde!r}"
        )
    for onderdeel in waarde:
        if isinstance(onderdeel, bool) or not isinstance(onderdeel, (int, float)):
            raise SchemaError(
                f"{entity_id}: {sleutel} bevat een niet-numerieke waarde "
                f"{onderdeel!r}"
            )
    if sleutel == "rgb_color":
        for onderdeel in waarde:
            if not isinstance(onderdeel, int) or not 0 <= onderdeel <= 255:
                raise SchemaError(
                    f"{entity_id}: rgb_color-onderdelen moeten gehele getallen "
                    f"0..255 zijn, kreeg {onderdeel!r}"
                )
    return list(waarde)


def valideer_scenes(raw: Any) -> list[SceneData]:
    """Valideer een lijst van precies drie scene-objecten (SPEC 10.4).

    Dit is dezelfde code die het inlezen van de Store gebruikt én die
    `scenes/save` op zijn invoer loslaat. Eén implementatie, dus onmogelijk dat
    er via de WebSocket iets binnenkomt dat bij het volgende laden alsnog als
    kapot geldt.
    """
    if not isinstance(raw, list):
        raise SchemaError("scenes moet een lijst zijn")
    if len(raw) != SCENE_COUNT:
        raise SchemaError(f"scenes moet precies {SCENE_COUNT} objecten bevatten, kreeg {len(raw)}")

    resultaat: list[SceneData] = []
    for index, ruwe_scene in enumerate(raw):
        if not isinstance(ruwe_scene, dict):
            raise SchemaError(f"scene {index}: is geen object")

        onbekend = set(ruwe_scene) - {"icon", "lights"}
        if onbekend:
            raise SchemaError(f"scene {index}: onbekende sleutels {sorted(onbekend)}")

        icoon = ruwe_scene.get("icon")
        if not isinstance(icoon, str) or not icoon.strip():
            raise SchemaError(f"scene {index}: icon ontbreekt of is leeg")

        ruwe_lampen = ruwe_scene.get("lights")
        if not isinstance(ruwe_lampen, dict):
            raise SchemaError(f"scene {index}: lights ontbreekt of is geen object")

        lampen: dict[str, dict[str, Any]] = {}
        for entity_id, waarde in ruwe_lampen.items():
            if not isinstance(entity_id, str) or not valid_entity_id(entity_id):
                raise SchemaError(f"scene {index}: {entity_id!r} is geen geldig entity-ID")
            if entity_id.split(".")[0] != LIGHT_DOMAIN:
                raise SchemaError(
                    f"scene {index}: {entity_id} zit niet in het light-domein"
                )
            lampen[entity_id] = _valideer_lampwaarde(entity_id, waarde)

        resultaat.append(SceneData(icon=icoon, lights=lampen))

    return resultaat


def _valideer_groep(raw: Any) -> GroupData:
    """Valideer één opgeslagen groep."""
    if not isinstance(raw, dict):
        raise SchemaError("groep is geen object")

    onbekend = set(raw) - {"last_known_entity_id", "scenes"}
    if onbekend:
        raise SchemaError(f"onbekende sleutels op groepsniveau: {sorted(onbekend)}")

    label = raw.get("last_known_entity_id")
    if not isinstance(label, str) or not label:
        raise SchemaError("last_known_entity_id ontbreekt of is leeg")

    return GroupData(
        last_known_entity_id=label,
        scenes=valideer_scenes(raw.get("scenes")),
    )


# --------------------------------------------------------------------------
# Identiteit: entity-ID -> registry-entry-ID (SPEC 10.2)
# --------------------------------------------------------------------------


@callback
def resolve_light_group(
    hass: HomeAssistant, entity_id: str
) -> tuple[str, list[str]]:
    """Vertaal een entity-ID naar registry-entry-ID en ledenlijst.

    Geeft `(registry_entry_id, member_entity_ids)` terug, met de groepsentiteit
    er al uitgefilterd (SPEC 5.2).

    Deze vertaling gebeurt bewust server-side: het entity registry is
    server-side gezag, en de kaart hoeft geen tweede identiteitsbegrip te
    dragen (SPEC 10.2).

    De ledenlijst komt bij voorkeur uit het `entity_id`-attribuut van de state.
    Ontbreekt dat, dan valt de lijst terug op de config entry van de groep —
    zie `_leden_uit_config_entry` voor het waarom.
    """
    state = hass.states.get(entity_id)
    if state is None:
        raise GroupNotFoundError(f"{entity_id} bestaat niet")

    registry = er.async_get(hass)
    entry = registry.async_get(entity_id)
    if entry is None:
        # Onder meer de oude YAML-group-integratie; die heeft geen unique_id
        # en dus geen stabiele opslagsleutel (SPEC 5.3).
        raise GroupNotFoundError(f"{entity_id} staat niet in het entity registry")

    ruw = state.attributes.get(ATTR_MEMBER_ENTITY_IDS)
    if ruw is None:
        ruw = _leden_uit_config_entry(hass, entry, entity_id)
    elif isinstance(ruw, str):
        ruw = [ruw]

    # De groep hoort niet in zijn eigen lijst. In het normale geval is dat een
    # no-op, maar bij geneste groepen niet.
    return entry.id, [lid for lid in ruw if lid != entity_id]


@callback
def _leden_uit_config_entry(
    hass: HomeAssistant, registry_entry: er.RegistryEntry, entity_id: str
) -> list[str]:
    """De ledenlijst uit de config entry van een light group helper.

    Nodig omdat het `entity_id`-attribuut van de state verdwijnt zodra de groep
    `unavailable` is: Home Assistant laat alle extra state attributes weg voor
    een niet-beschikbare entiteit (`helpers/entity.py:1118-1124`):

    ```python
    available = self.available
    state = self._stringify_state(available)
    if available:
        if state_attributes := self.state_attributes:
            attr |= state_attributes
        if extra_state_attributes := self.extra_state_attributes:
            attr |= extra_state_attributes
    ```

    Een light group met nul leden is per definitie `unavailable`, en een groep
    waarvan alle lampen offline zijn ook. Zonder deze terugval zouden beide
    gevallen als "geen lichtgroep" gelden.

    De config entry heeft dat probleem niet: `options["entities"]` bestaat
    altijd, ongeacht beschikbaarheid. Het is ook de bron waaruit de groep zelf
    zijn leden haalt (`components/group/light.py:105-107`).
    """
    config_entry_id = registry_entry.config_entry_id
    if config_entry_id is None:
        raise NotALightGroupError(f"{entity_id} is geen lichtgroep")

    config_entry = hass.config_entries.async_get_entry(config_entry_id)
    if config_entry is None or config_entry.domain != GROUP_INTEGRATION_DOMAIN:
        raise NotALightGroupError(f"{entity_id} is geen lichtgroep")

    opties = config_entry.options or {}
    if opties.get(CONF_GROUP_TYPE) != LIGHT_DOMAIN:
        raise NotALightGroupError(f"{entity_id} is geen lichtgroep")

    ruw = opties.get(CONF_ENTITIES)
    if not isinstance(ruw, list):
        raise NotALightGroupError(
            f"{entity_id} is een lichtgroep zonder bruikbare ledenlijst"
        )

    # De lijst mag entity-ID's én registry-UUID's bevatten
    # (`helpers/entity_registry.py:2715-2725`). Een lid waarvan de registratie
    # verdwenen is slaan we over in plaats van de hele lijst te laten vallen.
    registry = er.async_get(hass)
    leden: list[str] = []
    for item in ruw:
        opgelost = er.async_resolve_entity_id(registry, item)
        if opgelost is None:
            _LOGGER.warning(
                "Lid %s van lichtgroep %s bestaat niet meer en wordt overgeslagen",
                item,
                entity_id,
            )
            continue
        leden.append(opgelost)

    return leden


@callback
def huidig_entity_id(hass: HomeAssistant, registry_entry_id: str) -> str | None:
    """Het entity-ID dat nú bij een registry-entry-ID hoort, of None."""
    registry = er.async_get(hass)
    entry = registry.entities.get_entry(registry_entry_id)
    return entry.entity_id if entry else None


# --------------------------------------------------------------------------
# De Store
# --------------------------------------------------------------------------


class _MigratingStore(Store[dict[str, Any]]):
    """Store met een migratiehaak (SPEC 10.6).

    Er bestaat nog geen enkele oudere versie, dus deze haak hoeft in v1 alleen
    te bestaan en `NotImplementedError` te gooien. HA vangt dat zelf netjes af:
    is alleen de `minor_version` gewijzigd, dan gebruikt het de data ongewijzigd;
    is de `version` gewijzigd, dan wordt de fout doorgegeven
    (`helpers/storage.py:449-457`).
    """

    async def _async_migrate_func(
        self,
        old_major_version: int,
        old_minor_version: int,
        old_data: dict[str, Any],
    ) -> dict[str, Any]:
        """Migreer oude opslag. Er is nog niets om van te migreren."""
        raise NotImplementedError(
            f"Geen migratiepad van {old_major_version}.{old_minor_version} "
            f"naar {STORAGE_VERSION}.{STORAGE_MINOR_VERSION}"
        )


class SceneStore:
    """De opslaglaag: laden, valideren, wegschrijven, verwijderen."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Bouw de Store op met de versies uit SPEC 10.6."""
        self.hass = hass
        self._store = _MigratingStore(
            hass,
            STORAGE_VERSION,
            STORAGE_KEY,
            minor_version=STORAGE_MINOR_VERSION,
        )
        # Gevalideerd.
        self._groups: dict[str, GroupData] = {}
        # Onbewerkt, plus de reden waarom validatie faalde (SPEC 18.2.2).
        self._corrupt: dict[str, tuple[Any, str]] = {}
        # Gezet als de hele opslag onbruikbaar is (SPEC 18.2, geval C).
        self._onbruikbaar: str | None = None
        self._geladen = False

    # -- laden ------------------------------------------------------------

    async def async_load(self) -> None:
        """Laad de opslag en splits gevalideerde van onleesbare groepen."""
        if self._geladen:
            return

        ruw = await self._store.async_load()
        self._groups = {}
        self._corrupt = {}
        self._onbruikbaar = None

        if ruw is not None:
            groepen = ruw.get("groups")
            if not isinstance(groepen, dict):
                # Geval C uit SPEC 18.2: het bestand parseert, maar er is geen
                # object met registry-entry-ID's. Er is dus geen sleutel om per
                # groep te markeren en niets om bij een schrijfronde terug te
                # zetten. De hele opslag geldt als onbruikbaar en er wordt niet
                # geschreven, zodat het bestand intact blijft.
                aangetroffen = type(groepen).__name__
                self._onbruikbaar = f"groups is geen object maar {aangetroffen}"
                _LOGGER.error(
                    "Opslag %s is onbruikbaar: 'groups' is geen object maar %s; "
                    "er wordt niet gelezen en niet geschreven tot dit is opgelost",
                    STORAGE_KEY,
                    aangetroffen,
                )
                groepen = {}

            for registry_entry_id, ruwe_groep in groepen.items():
                try:
                    self._groups[registry_entry_id] = _valideer_groep(ruwe_groep)
                except SchemaError as fout:
                    # Punt 3 uit SPEC 18.2.2: een sleutel gaat naar precies één
                    # van de twee dicts, nooit naar allebei.
                    self._corrupt[registry_entry_id] = (ruwe_groep, str(fout))
                    _LOGGER.error(
                        "Opgeslagen scenes van %s zijn onleesbaar en worden "
                        "onaangeroerd bewaard: %s",
                        registry_entry_id,
                        fout,
                    )

        self._geladen = True
        self._werk_meldingen_bij()

    def _werk_meldingen_bij(self) -> None:
        """Maak reparatiemeldingen aan (SPEC 18.2, geval B regel 4 en geval C regel 3)."""
        if self._onbruikbaar is not None:
            ir.async_create_issue(
                self.hass,
                DOMAIN,
                ISSUE_STORE_UNUSABLE,
                is_fixable=False,
                is_persistent=True,
                severity=ir.IssueSeverity.ERROR,
                translation_key="opslag_onbruikbaar",
                translation_placeholders={
                    "opslagsleutel": STORAGE_KEY,
                    "reden": self._onbruikbaar,
                },
            )
        else:
            ir.async_delete_issue(self.hass, DOMAIN, ISSUE_STORE_UNUSABLE)

        for registry_entry_id, (_ruw, reden) in self._corrupt.items():
            ir.async_create_issue(
                self.hass,
                DOMAIN,
                f"{ISSUE_CORRUPT_GROUP_PREFIX}{registry_entry_id}",
                is_fixable=False,
                is_persistent=True,
                severity=ir.IssueSeverity.ERROR,
                translation_key="corrupte_opslag",
                translation_placeholders={
                    "entity_id": huidig_entity_id(self.hass, registry_entry_id)
                    or registry_entry_id,
                    "reden": reden,
                },
            )

    @callback
    def _verwijder_melding(self, registry_entry_id: str) -> None:
        """Sluit de reparatiemelding van één groep (SPEC 18.2.3 stap 2)."""
        ir.async_delete_issue(
            self.hass, DOMAIN, f"{ISSUE_CORRUPT_GROUP_PREFIX}{registry_entry_id}"
        )

    # -- wegschrijven -----------------------------------------------------

    @callback
    def _as_stored(self) -> dict[str, Any]:
        """Bouw het te schrijven object uit beide dicts (SPEC 18.2.2 punt 2)."""
        groups: dict[str, Any] = {
            registry_entry_id: data.to_dict()
            for registry_entry_id, data in self._groups.items()
        }
        for registry_entry_id, (ruw, _reden) in self._corrupt.items():
            # Letterlijk terug, niet opnieuw opgebouwd (SPEC 18.2.2 punt 4).
            groups[registry_entry_id] = ruw
        return {"groups": groups}

    async def _async_schrijf(self) -> None:
        """Schrijf de hele opslag weg."""
        await self._store.async_save(self._as_stored())
        _LOGGER.debug(
            "Opslag weggeschreven: %d geldige groepen, %d onleesbaar",
            len(self._groups),
            len(self._corrupt),
        )

    # -- lezen ------------------------------------------------------------

    @callback
    def is_corrupt(self, registry_entry_id: str) -> bool:
        """Of de opgeslagen data van deze groep onleesbaar is."""
        return registry_entry_id in self._corrupt

    @callback
    def _controleer_bruikbaar(self) -> None:
        """Gooi als de hele opslag onbruikbaar is (SPEC 18.2, geval C)."""
        if self._onbruikbaar is not None:
            raise StoreUnusableError(self._onbruikbaar)

    @callback
    def async_get_group(self, registry_entry_id: str) -> GroupData | None:
        """De opgeslagen groep, of None als er nog niets is opgeslagen.

        Gooit `CorruptGroupError` als de opgeslagen data van deze groep niet
        valideert; dan is "nog niets opgeslagen" juist het verkeerde antwoord
        (SPEC 18.1). Gooit `StoreUnusableError` als de hele opslag onbruikbaar
        is.
        """
        self._controleer_bruikbaar()
        if (kapot := self._corrupt.get(registry_entry_id)) is not None:
            raise CorruptGroupError(registry_entry_id, kapot[1])
        return self._groups.get(registry_entry_id)

    @callback
    def async_list_groups(self) -> list[dict[str, Any]]:
        """Alle opgeslagen groepen, voor het opruimoverzicht (SPEC 11.3).

        Onleesbare groepen staan er ook in — juist die wil een admin kunnen
        opruimen. Hun `configured_light_count` is `null`, want dat aantal is
        niet te bepalen zonder de data te interpreteren.
        """
        resultaat: list[dict[str, Any]] = []

        for registry_entry_id, data in self._groups.items():
            huidig = huidig_entity_id(self.hass, registry_entry_id)
            resultaat.append(
                {
                    "registry_entry_id": registry_entry_id,
                    "last_known_entity_id": data.last_known_entity_id,
                    "current_entity_id": huidig,
                    "exists": huidig is not None,
                    "configured_light_count": [
                        len(scene.lights) for scene in data.scenes
                    ],
                    "corrupt": False,
                }
            )

        for registry_entry_id, (ruw, _reden) in self._corrupt.items():
            huidig = huidig_entity_id(self.hass, registry_entry_id)
            label = registry_entry_id
            if isinstance(ruw, dict) and isinstance(
                ruw.get("last_known_entity_id"), str
            ):
                label = ruw["last_known_entity_id"]
            resultaat.append(
                {
                    "registry_entry_id": registry_entry_id,
                    "last_known_entity_id": label,
                    "current_entity_id": huidig,
                    "exists": huidig is not None,
                    "configured_light_count": None,
                    "corrupt": True,
                }
            )

        return resultaat

    # -- schrijven --------------------------------------------------------

    async def async_save_group(
        self,
        registry_entry_id: str,
        last_known_entity_id: str,
        scenes: list[SceneData],
    ) -> None:
        """Sla de drie scenes van één groep op.

        Weigert een groep die als onleesbaar gemarkeerd staat, zodat de kapotte
        data niet per ongeluk overschreven wordt (SPEC 18.2 regel 3).
        """
        self._controleer_bruikbaar()
        if (kapot := self._corrupt.get(registry_entry_id)) is not None:
            raise CorruptGroupError(registry_entry_id, kapot[1])

        self._groups[registry_entry_id] = GroupData(
            last_known_entity_id=last_known_entity_id,
            scenes=scenes,
        )
        await self._async_schrijf()

    async def async_update_label(
        self, registry_entry_id: str, entity_id: str
    ) -> None:
        """Werk het laatst bekende entity-ID bij (SPEC 10.2, laatste regel).

        Doet niets als er nog niets is opgeslagen, als de groep onleesbaar is,
        of als het label al klopt — een leesactie hoort geen schrijfronde uit te
        lokken zolang er niets verandert.
        """
        if self._onbruikbaar is not None:
            return
        data = self._groups.get(registry_entry_id)
        if data is None or data.last_known_entity_id == entity_id:
            return
        data.last_known_entity_id = entity_id
        await self._async_schrijf()

    async def async_delete_group(self, registry_entry_id: str) -> bool:
        """Verwijder de opslag van één groep. Geeft False als hij niet bestond."""
        self._controleer_bruikbaar()
        aanwezig = False
        if registry_entry_id in self._groups:
            del self._groups[registry_entry_id]
            aanwezig = True
        if registry_entry_id in self._corrupt:
            del self._corrupt[registry_entry_id]
            self._verwijder_melding(registry_entry_id)
            aanwezig = True

        if not aanwezig:
            return False

        await self._async_schrijf()
        return True
