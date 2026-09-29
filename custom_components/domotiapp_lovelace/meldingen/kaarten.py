"""De meldingenkaarten uit de opgeslagen dashboards halen.

Zie de kop van `const.py` voor WAAROM hier gelezen wordt en niet door de kaart
gestuurd. Dit bestand gaat over HOE.

## Waar de dashboards staan

`hass.data[LOVELACE_DATA].dashboards` is een `dict` van `url_path` naar een
`LovelaceConfig`, met `None` voor het standaarddashboard. `async_load(False)`
geeft de opgeslagen config, zonder hem opnieuw van schijf te lezen. Een
dashboard dat nog nooit is opgeslagen gooit `ConfigNotFound`; dat is gewoon
"geen kaarten".

Dit is interne Home Assistant, en daarom staat er een test tegen de echte
Lovelace-code naast (`tests/meldingen/test_kaarten.py`). Verschuift dit bij een
update van Home Assistant, dan valt die test in CI om, en niet pas bij de klant
die om 19:30 geen melding krijgt.

## Waar de kaart in een dashboard kan zitten

Overal: in een sectie, in een stapel, in een voorwaardelijke kaart, in een
pop-up van bubble-card. Er wordt dus niet naar `views[].cards[]` gekeken maar
door de hele boom gelopen, op zoek naar elk object met ons `type`.

## Twee kaarten, één melding

Staat dezelfde kaart op de telefoon en op de tablet, dan is dat ÉÉN melding:
ze delen hun `id` (standaard de soort, dus `afval`). De personen worden
samengevoegd; de instellingen komen van de eerste kaart die gevonden wordt, en
als ze verschillen staat dat in het logboek.
"""

from __future__ import annotations

from dataclasses import dataclass, field
import logging
from typing import Any

from homeassistant.core import HomeAssistant

from .afval import tijd_geldig
from .const import KAART_TYPE, MOMENT_MORGEN, MOMENT_VANDAAG, SOORT_AFVAL, STANDAARD_TIJD

_LOGGER = logging.getLogger(__name__)


@dataclass(slots=True)
class Melding:
    """Eén melding, zoals de kaarten hem samen beschrijven."""

    id: str
    soort: str
    titel: str = ""
    # Per moment de sensor en de tijd. Geen sensor = dat moment staat uit.
    sensoren: dict[str, str] = field(default_factory=dict)
    tijden: dict[str, str] = field(default_factory=dict)
    personen: list[str] = field(default_factory=list)
    # Alleen via YAML: een eigen notify-dienst per persoon, voor wie geen
    # companion-app heeft of wiens telefoon niet vanzelf gevonden wordt.
    diensten: dict[str, str] = field(default_factory=dict)
    # Waar hij staat, voor het logboek.
    dashboards: list[str] = field(default_factory=list)

    def vergelijkbaar(self) -> tuple[Any, ...]:
        """Wat twee kaarten gelijk moeten hebben om hetzelfde te doen."""
        return (self.soort, tuple(sorted(self.sensoren.items())), tuple(sorted(self.tijden.items())))


def zoek_kaarten(knoop: Any) -> list[dict[str, Any]]:
    """Alle meldingenkaarten in deze boom, in de volgorde waarin ze staan."""
    gevonden: list[dict[str, Any]] = []

    def loop(k: Any) -> None:
        if isinstance(k, dict):
            if k.get("type") == KAART_TYPE:
                gevonden.append(k)
                return
            for waarde in k.values():
                loop(waarde)
        elif isinstance(k, list):
            for waarde in k:
                loop(waarde)

    loop(knoop)
    return gevonden


def soort_aan(kaart: dict[str, Any], soort: str) -> bool:
    """Staat deze soort aan op deze kaart?

    Sinds 0.50.0 is de kaart algemeen en heeft elke soort een eigen schakelaar:
    `afval: true`. Staat die er niet, dan is de kaart van daarvoor, toen hij
    één soort WAS -- en die stond in `soort`, met afval als standaard. Precies
    zo leest `soortAan` in meldingen-logica.js het, en dat moet gelijk blijven:
    wat de kaart als aan toont, hoort hier verstuurd te worden.
    """
    waarde = kaart.get(soort)
    if isinstance(waarde, bool):
        return waarde
    return str(kaart.get("soort") or SOORT_AFVAL) == soort


def melding_uit(kaart: dict[str, Any], dashboard: str = "") -> Melding | None:
    """De afvalmelding uit één kaartconfig, of None als die daar niet aan staat."""
    soort = SOORT_AFVAL
    if not soort_aan(kaart, soort):
        return None
    # Onder dit id staat al opgeslagen wie er aan en uit staat, dus het blijft
    # wat het was: `id` uit de config, of anders de soort.
    ident = str(kaart.get("id") or soort).strip() or soort

    sensoren: dict[str, str] = {}
    for moment, sleutel in ((MOMENT_VANDAAG, "afval_vandaag"), (MOMENT_MORGEN, "afval_morgen")):
        waarde = kaart.get(sleutel)
        if isinstance(waarde, str) and "." in waarde:
            sensoren[moment] = waarde

    tijden: dict[str, str] = {}
    for moment, sleutel in ((MOMENT_VANDAAG, "tijd_vandaag"), (MOMENT_MORGEN, "tijd_morgen")):
        tijden[moment] = tijd_geldig(kaart.get(sleutel)) or STANDAARD_TIJD[moment]

    personen: list[str] = []
    for p in kaart.get("personen") or []:
        if isinstance(p, str) and p.startswith("person.") and p not in personen:
            personen.append(p)

    diensten: dict[str, str] = {}
    rauw = kaart.get("diensten")
    if isinstance(rauw, dict):
        for persoon, dienst in rauw.items():
            if isinstance(dienst, str) and dienst.strip():
                # "notify.x" en "x" allebei; de dienst zelf heet "x".
                diensten[str(persoon)] = dienst.strip().removeprefix("notify.")

    return Melding(
        id=ident,
        soort=soort,
        titel=str(kaart.get("name") or ""),
        sensoren=sensoren,
        tijden=tijden,
        personen=personen,
        diensten=diensten,
        dashboards=[dashboard],
    )


def voeg_samen(kaarten: list[tuple[str, dict[str, Any]]]) -> dict[str, Melding]:
    """Van alle kaarten naar één melding per `id`.

    De personen van alle kaarten tellen mee; de rest komt van de eerste. Wie
    iemand op de tablet toevoegt, wil dat die persoon een melding krijgt, ook
    als de kaart op de telefoon hem nog niet noemt.
    """
    uit: dict[str, Melding] = {}
    for dashboard, kaart in kaarten:
        melding = melding_uit(kaart, dashboard)
        if melding is None:
            continue
        bestaand = uit.get(melding.id)
        if bestaand is None:
            uit[melding.id] = melding
            continue
        if bestaand.vergelijkbaar() != melding.vergelijkbaar():
            _LOGGER.warning(
                "Twee meldingenkaarten met id %r hebben andere instellingen "
                "(%s en %s); die van %s gaan voor",
                melding.id,
                bestaand.dashboards[0] or "standaard",
                dashboard or "standaard",
                bestaand.dashboards[0] or "standaard",
            )
        for p in melding.personen:
            if p not in bestaand.personen:
                bestaand.personen.append(p)
        for p, d in melding.diensten.items():
            bestaand.diensten.setdefault(p, d)
        bestaand.dashboards.append(dashboard)
    return uit


async def async_lees(hass: HomeAssistant) -> dict[str, Melding]:
    """Alle meldingen uit alle dashboards.

    Faalt het lezen van één dashboard, dan tellen de andere gewoon mee. Faalt
    het geheel (Lovelace anders dan verwacht), dan zijn er geen meldingen, met
    een foutregel in het logboek.
    """
    try:
        from homeassistant.components.lovelace.const import (  # noqa: PLC0415
            LOVELACE_DATA,
            ConfigNotFound,
        )
    except ImportError:
        _LOGGER.error("Lovelace van deze Home Assistant is anders dan verwacht; geen meldingen")
        return {}

    lovelace = hass.data.get(LOVELACE_DATA)
    if lovelace is None:
        return {}

    kaarten: list[tuple[str, dict[str, Any]]] = []
    for url_path, dashboard in list(lovelace.dashboards.items()):
        try:
            config = await dashboard.async_load(False)
        except ConfigNotFound:
            continue
        except Exception as fout:  # noqa: BLE001 - één kapot dashboard houdt de rest niet tegen
            _LOGGER.warning("Dashboard %s niet te lezen: %s", url_path or "standaard", fout)
            continue
        for kaart in zoek_kaarten(config):
            kaarten.append((url_path or "", kaart))

    return voeg_samen(kaarten)
