"""De tijdelijke snapshot-scene (SPEC 9).

**De integratie beheert de snapshot, niet de kaart.** Dat is de beslissing van
fase 4b-2 en de reden staat in SPEC 9.2: zo hoeft de kaart nooit een
registry-entry-ID te kennen (SPEC 10.2 blijft daarmee volledig overeind) en
liggen de rechten bij de integratie in plaats van bij een kioskgebruiker.

De naam wordt hier samengesteld, uit het registry-entry-ID van de light group
(SPEC 9.4). Die naam verlaat de server nooit; de kaart stuurt alleen een
entity-ID mee, net als bij alle andere commando's.

Twee dingen uit `components/homeassistant/scene.py` bepalen de vorm van deze
module, en ze zijn allebei stil:

1. `create_service` **doet niets en logt alleen een WARNING** als de scene leeg
   zou worden ("Empty scenes are not allowed") of als er al een niet-dynamische
   scene met die naam bestaat ("The scene %s already exists"). Er komt dus geen
   exception. Daarom wordt na het aanmaken gecontroleerd of de entiteit er
   werkelijk is; zo niet, dan is dat hier een fout en geen stilte (SPEC 18.1).
2. `async_add_entities` plant het toevoegen als taak, dus de state staat er niet
   gegarandeerd meteen na een `blocking=True`-aanroep. Daarom wordt er kort en
   begrensd op gewacht.
"""

from __future__ import annotations

import asyncio
import logging

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError

from .const import SNAPSHOT_SCENE_ID_PREFIX

_LOGGER = logging.getLogger(__name__)

SCENE_DOMAIN = "scene"
SERVICE_CREATE = "create"
SERVICE_DELETE = "delete"
SERVICE_TURN_ON = "turn_on"

# Dezelfde seconde als bij het toepassen (SPEC 8.2 en 9.2).
TRANSITION_SECONDEN = 1

# Hoe lang er hoogstens gewacht wordt tot de scene-entiteit verschijnt.
_WACHTSTAPPEN = (0, 0.05, 0.1, 0.2, 0.4, 0.8)


def scene_entity_id(registry_entry_id: str) -> str:
    """De entity-ID van de snapshot van deze groep (SPEC 9.4)."""
    return f"{SCENE_DOMAIN}.{SNAPSHOT_SCENE_ID_PREFIX}{registry_entry_id}"


def bestaat(hass: HomeAssistant, registry_entry_id: str) -> bool:
    """Staat er op dit moment een snapshot voor deze groep?"""
    return hass.states.get(scene_entity_id(registry_entry_id)) is not None


async def async_maak(
    hass: HomeAssistant, registry_entry_id: str, leden: list[str]
) -> bool:
    """Maak de snapshot, of laat een bestaande met rust (SPEC 9.3).

    Geeft `True` als er in deze aanroep een snapshot is aangemaakt, en `False`
    als er al een was. Een tweede voorbeeld maakt dus geen tweede scene.

    De snapshot omvat **alle** leden van de groep, ook de niet-ingestelde.
    Anders zou een lamp die tijdens het bewerken alsnog wordt ingesteld bij het
    herstellen buiten beeld vallen.
    """
    if bestaat(hass, registry_entry_id):
        return False

    if not leden:
        # `create_service` zou hier stil niets doen; dat melden we zelf.
        raise HomeAssistantError(
            "Er is geen snapshot te maken: deze lichtgroep bevat geen lampen"
        )

    scene_id = f"{SNAPSHOT_SCENE_ID_PREFIX}{registry_entry_id}"
    await hass.services.async_call(
        SCENE_DOMAIN,
        SERVICE_CREATE,
        {"scene_id": scene_id, "snapshot_entities": leden},
        blocking=True,
    )

    if not await _async_wacht_op_scene(hass, registry_entry_id):
        # scene.create logt alleen een WARNING als hij niets doet. Stil
        # doorgaan zou een voorbeeld zonder weg terug opleveren (SPEC 18.1).
        raise HomeAssistantError(
            f"De snapshot {scene_entity_id(registry_entry_id)} is niet aangemaakt"
        )

    _LOGGER.debug("Snapshot %s aangemaakt", scene_entity_id(registry_entry_id))
    return True


async def async_sluit(
    hass: HomeAssistant, registry_entry_id: str, *, herstel: bool
) -> tuple[bool, bool]:
    """Herstel de snapshot en/of verwijder hem (SPEC 9.3).

    Geeft `(hersteld, verwijderd)` terug. Is er geen snapshot, dan gebeurt er
    niets en is dat `(False, False)` — dat is het geval "er is nooit op
    Voorbeeld gedrukt", en ook het geval waarin twee sluit-events achter elkaar
    binnenkomen: de tweede vindt niets meer.

    `herstel=False` is wat Opslaan doet: de laatst getoonde stand blijft staan,
    alleen de tijdelijke scene gaat weg.
    """
    entity_id = scene_entity_id(registry_entry_id)
    if hass.states.get(entity_id) is None:
        return False, False

    hersteld = False
    if herstel:
        await hass.services.async_call(
            SCENE_DOMAIN,
            SERVICE_TURN_ON,
            {"entity_id": entity_id, "transition": TRANSITION_SECONDEN},
            blocking=True,
        )
        hersteld = True

    # Verwijderen gebeurt ook als het herstellen faalde — dan is de scene al
    # toegepast of niet, maar hij hoort hoe dan ook niet te blijven staan. Een
    # fout uit turn_on komt via de exception naar boven; dit pad wordt dan niet
    # bereikt, en de opruimlus van SPEC 9.3.1 vangt de rest bij de volgende
    # reload.
    await hass.services.async_call(
        SCENE_DOMAIN, SERVICE_DELETE, {"entity_id": entity_id}, blocking=True
    )

    _LOGGER.debug(
        "Snapshot %s gesloten (hersteld=%s)", entity_id, hersteld
    )
    return hersteld, True


async def _async_wacht_op_scene(hass: HomeAssistant, registry_entry_id: str) -> bool:
    """Wacht begrensd tot de scene-entiteit in de state machine staat."""
    for wachttijd in _WACHTSTAPPEN:
        if wachttijd:
            await asyncio.sleep(wachttijd)
        else:
            await asyncio.sleep(0)
        if bestaat(hass, registry_entry_id):
            return True
    return False
