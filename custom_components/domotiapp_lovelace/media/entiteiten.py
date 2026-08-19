"""Welke speakers de mediakaart mag aanbieden om mee te groeperen.

Alle filtering gebeurt **server-side**, net als bij de wekker: labels worden
uitgerold over entiteit, apparaat én gebied, en dat wil je niet twee keer
uitleggen -- één keer in Python en één keer in JavaScript.

Het verschil met de wekkerkant is bewust klein gehouden. Daar vallen groepen af
(groepsvolume is relatief, en een wekker die op een groep afgaat komt op een
onvoorspelbaar volume uit); hier niet, want als de klant een MA-groep labelt wil
hij hem zien. Wat hier wél telt is of een speler te groeperen is: dat leest de
kaart uit `supported_features`, zodat er nooit een vinkje staat bij een speaker
die zich niet laat koppelen.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

from homeassistant.components.media_player import MediaPlayerEntityFeature
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from ..labels import entiteiten_met_label, label_id_van_naam, naam_van_entiteit
from ..ma import MA_DOMAIN
from .const import LABEL_MEDIA_NAAM

_LOGGER = logging.getLogger(__name__)

MEDIA_PLAYER_DOMAIN = "media_player"


@dataclass(slots=True)
class Selectie:
    """Wat `media/speakers` teruggeeft.

    `label_exists` staat er apart in om drie situaties uit elkaar te houden die
    er in de kaart alle drie als "leeg" uitzien, en die alle drie een andere
    uitleg verdienen:

    | Situatie | `label_exists` | `entities` | `filtered_out` |
    |---|---|---|---|
    | het label bestaat niet | `False` | leeg | 0 |
    | het label bestaat, er hangt niets aan | `True` | leeg | 0 |
    | het label hangt op dingen die geen MA-speaker zijn | `True` | leeg | > 0 |
    """

    label_exists: bool
    entities: list[dict[str, Any]] = field(default_factory=list)
    filtered_out: int = 0

    def as_dict(self) -> dict[str, Any]:
        return {
            "label_exists": self.label_exists,
            "label_name": LABEL_MEDIA_NAAM,
            "entities": self.entities,
            "filtered_out": self.filtered_out,
        }


def is_ma_speler(hass: HomeAssistant, entity_id: str) -> tuple[bool, str | None]:
    """Is dit een Music Assistant-speler? Geeft `(True, None)` of `(False, reden)`.

    De platformcheck is het vangnet onder het label: bij een Sonos maken zowel
    de Sonos-integratie als Music Assistant een entiteit aan voor dezelfde
    fysieke speaker, met bijna dezelfde naam. Zonder deze check zou de kaart de
    Sonos-entiteit kunnen kiezen, waarop `music_assistant.play_media` niet werkt.
    """
    if not entity_id.startswith(f"{MEDIA_PLAYER_DOMAIN}."):
        return False, f"{entity_id} zit niet in het {MEDIA_PLAYER_DOMAIN}-domein"

    entry = er.async_get(hass).async_get(entity_id)
    if entry is None:
        return False, f"{entity_id} heeft geen entity registry entry"
    if entry.platform != MA_DOMAIN:
        return False, f"{entity_id} komt van {entry.platform!r} en niet van {MA_DOMAIN!r}"
    if hass.states.get(entity_id) is None:
        return False, f"{entity_id} heeft geen state"
    return True, None


def _kan_groeperen(hass: HomeAssistant, entity_id: str) -> bool:
    """Laat deze speler zich koppelen aan een andere?

    `supported_features` overleeft `unavailable` (`helpers/entity.py:1169-1170`),
    dus een speaker die net weg is verliest zijn vinkje niet.
    """
    state = hass.states.get(entity_id)
    if state is None:
        return False
    try:
        kenmerken = MediaPlayerEntityFeature(int(state.attributes.get("supported_features") or 0))
    except ValueError:
        return False
    return MediaPlayerEntityFeature.GROUPING in kenmerken


def speakers(hass: HomeAssistant) -> Selectie:
    """De gelabelde Music Assistant-speakers, met of ze te groeperen zijn."""
    label_id = label_id_van_naam(hass, LABEL_MEDIA_NAAM)
    if label_id is None:
        # Het label bestaat niet. Dat is de situatie bij een verse installatie en
        # geen fout: de kaart legt uit welk label er geplakt moet worden.
        return Selectie(label_exists=False)

    registry = er.async_get(hass)
    gevonden: list[dict[str, Any]] = []
    afgevallen = 0
    for entity_id in sorted(entiteiten_met_label(hass, label_id)):
        geschikt, reden = is_ma_speler(hass, entity_id)
        if not geschikt:
            _LOGGER.debug("Speaker %s valt af: %s", entity_id, reden)
            afgevallen += 1
            continue
        gevonden.append(
            {
                "entity_id": entity_id,
                "name": naam_van_entiteit(hass, entity_id, registry.async_get(entity_id)),
                "can_group": _kan_groeperen(hass, entity_id),
            }
        )
    return Selectie(label_exists=True, entities=gevonden, filtered_out=afgevallen)
