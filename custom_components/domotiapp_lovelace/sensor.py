"""Vijf competitiesensoren: een naam met een logo, voor de sportpop-up.

Gevraagd op 7 oktober 2026, via de beheersessie. Op het DomotiApp-dashboard
staan in de pop-up #sport vijf knoppen, één per competitie, en elke knop toont
het `entity_picture` van een sensor. Die sensoren waren bij elke klant een
sjabloonhelper, met het logo uit `customize.yaml` en het plaatje met de hand in
`/config/www`. Nu maakt de integratie ze zelf, met de logo's die ze zelf
meelevert (`afbeeldingen/`, zie const.py). Op de vraag of dat bij elke
installatie moet of achter een schakelaar, koos de eigenaar: altijd.

De toestand is de naam, en verder is er niets: zo stonden ze bij hem thuis, en
het dashboard rekent op niets anders dan de entity_id en het plaatje.

DE ENTITY_ID'S STAAN VAST, en een bestaande gaat voor

De dashboards noemen deze sensoren bij naam. Bij de installaties die er al
waren, staan ze er als sjabloonhelper (platform `template`, met een config
entry). Een sensor die dan ook nog `sensor.eredivisie` wil heten, wordt
`sensor.eredivisie_2`: er staat dubbel, en er verandert niets zichtbaars.

Daarom: is de naam bezet door iets anders, dan wordt hij NIET aangemaakt, en
zegt de integratie welke entiteit in de weg zit -- in het log en onder
Reparaties. Haalt iemand die helper weg en start de integratie opnieuw (herstart
of herladen), dan komt de sensor alsnog, onder precies die naam. Weghalen doen
we zelf niet: het is de configuratie van de klant.

De unique_id staat ook vast. Wie een sensor hernoemt, houdt die naam; de
integratie herkent hem aan de unique_id en maakt er geen tweede bij.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import AFBEELDINGEN_URL_PATH, DOMAIN

_LOGGER = logging.getLogger(__name__)

ISSUE_BEZET = "competities_bezet"


@dataclass(frozen=True)
class Competitie:
    """Eén knop in de sportpop-up."""

    sleutel: str  # het deel achter "sensor." en in de unique_id
    naam: str  # toestand en naam
    logo: str  # bestandsnaam in afbeeldingen/

    @property
    def entity_id(self) -> str:
        return f"sensor.{self.sleutel}"

    @property
    def unique_id(self) -> str:
        return f"{DOMAIN}_competitie_{self.sleutel}"


# Volgorde en namen zoals bij de eigenaar thuis. Alleen aanvullen: een
# sleutel veranderen is een andere entity_id in elk dashboard.
COMPETITIES: tuple[Competitie, ...] = (
    Competitie("eredivisie", "Eredivisie", "eredivisie.png"),
    Competitie("premier_league", "Premier League", "premierleague.png"),
    Competitie("bundesliga", "Bundesliga", "bundesliga.png"),
    Competitie("la_liga", "La Liga", "laliga.png"),
    Competitie("formule_1", "Formule 1", "formule1.png"),
)


def _in_de_weg(hass: HomeAssistant, reg: er.EntityRegistry, comp: Competitie) -> str | None:
    """De entity_id die deze competitie bezet houdt, of None als hij vrij is.

    Staat onze eigen unique_id al in het register, dan is er niets in de weg,
    ook als hij intussen anders heet: dan is dat zijn naam.
    """
    if reg.async_get_entity_id("sensor", DOMAIN, comp.unique_id):
        return None
    if reg.async_get(comp.entity_id) is not None or hass.states.get(comp.entity_id) is not None:
        return comp.entity_id
    return None


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Maak de sensoren waarvan de naam vrij (of al van ons) is."""
    reg = er.async_get(hass)
    nieuw: list[CompetitieSensor] = []
    bezet: list[str] = []
    for comp in COMPETITIES:
        if (iets := _in_de_weg(hass, reg, comp)) is not None:
            bezet.append(iets)
            continue
        nieuw.append(CompetitieSensor(comp))

    if bezet:
        _LOGGER.warning(
            "Niet aangemaakt, want de naam is al in gebruik: %s. Meestal is dat een "
            "sjabloonhelper van vroeger. Haal die weg en herstart Home Assistant, dan "
            "maakt DomotiApp Lovelace de sensor zelf, met het logo erbij.",
            ", ".join(bezet),
        )
        ir.async_create_issue(
            hass,
            DOMAIN,
            ISSUE_BEZET,
            is_fixable=False,
            severity=ir.IssueSeverity.WARNING,
            translation_key=ISSUE_BEZET,
            translation_placeholders={"entiteiten": ", ".join(bezet)},
        )
    else:
        ir.async_delete_issue(hass, DOMAIN, ISSUE_BEZET)

    async_add_entities(nieuw)


class CompetitieSensor(SensorEntity):
    """De naam van een competitie, met het logo als plaatje."""

    _attr_should_poll = False
    _attr_has_entity_name = False

    def __init__(self, comp: Competitie) -> None:
        self._attr_unique_id = comp.unique_id
        self._attr_name = comp.naam
        self._attr_native_value = comp.naam
        self._attr_entity_picture = f"{AFBEELDINGEN_URL_PATH}/{comp.logo}"
        # Alleen een wens: staat de unique_id al in het register (ook onder
        # een andere naam), dan wint het register.
        self.entity_id = comp.entity_id
