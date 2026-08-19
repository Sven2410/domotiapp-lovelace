"""Labels uitlezen: van een naam naar de entiteiten die eronder vallen.

De wekker gebruikt dit voor zijn speakers en lampen, de mediaspelerkaart voor de
speakers die je mag groeperen. Twee kanten, één uitleg van wat een label bereikt
-- anders zou "een label op het apparaat telt ook" bij de een wel gelden en bij
de ander niet.
"""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from homeassistant.helpers import label_registry as lr
from homeassistant.helpers.target import (
    TargetSelection,
    async_extract_referenced_entity_ids,
)


def label_id_van_naam(hass: HomeAssistant, naam: str) -> str | None:
    """Het `label_id` bij een labelnaam, of `None` als het label niet bestaat.

    We werken verder met het `label_id` en niet met de naam: hernoemen laat het
    `label_id` ongemoeid (`helpers/label_registry.py:182-213`).

    Dat de opzoeking zélf op naam gaat is de prijs daarvan: hernoemt de klant
    het label, dan vindt de integratie het niet meer. Daar hoort de kaart een
    uitleg over te tonen in plaats van een lege lijst.
    """
    label = lr.async_get(hass).async_get_label_by_name(naam)
    return label.label_id if label else None


def entiteiten_met_label(hass: HomeAssistant, label_id: str) -> set[str]:
    """Alle entiteiten die dit label bereikt: via entiteit, apparaat of gebied.

    Rechtstreeks `entity_entry.labels` lezen vindt alleen het eerste geval. De
    helper uit `helpers/target.py` rolt alle drie uit.

    `TargetSelection` en niet `TargetSelectorData`: dat laatste verdwijnt in HA
    2026.12.

    `primary_entities_only=True` is de standaard en blijft staan: een gelabeld
    apparaat levert zijn speaker op en niet zijn signaalsterktesensor.
    """
    selectie = async_extract_referenced_entity_ids(
        hass, TargetSelection({"label_id": label_id})
    )
    return selectie.referenced | selectie.indirectly_referenced


def naam_van_entiteit(hass: HomeAssistant, entity_id: str, entry=None) -> str:
    """De weergavenaam, ook als de entiteit `unavailable` is.

    `friendly_name` overleeft onbeschikbaarheid (`helpers/entity.py:1166-1167`),
    anders zou een weggevallen speaker als kaal entity-ID in de lijst staan.
    """
    state = hass.states.get(entity_id)
    if state is not None:
        naam = state.attributes.get("friendly_name")
        if naam:
            return str(naam)
    if entry is not None:
        return entry.name or entry.original_name or entity_id
    return entity_id
