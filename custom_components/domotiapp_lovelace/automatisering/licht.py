"""De lichtsterkte als moment (sinds 0.103.0).

De eigenaar, 3 november 2026: "ik wil dat de klant ook lichtsterkte kan gebruiken als voorwaarde ipv zonsondergang
bijvoorbeeld", en: "hij moet dan vragen waarvan je de lichtsterkte wilt pakken". De beheerder kiest de sensor op de kaart
(`lichtsensor`); de klant kiest in een regel "als het donker wordt" of "als het licht wordt", met een grens in lux:

    {"soort": "licht", "sensor": "sensor.weerstation_illuminance", "lux": 100, "richting": "donker"}

## Wanneer het iets doet

Een tijd of de zon heeft een tijdstip; dit niet. De motor kijkt elke minuut naar de sensor, en het moment is er als de
grens OVERSCHREDEN wordt: eerst lichter dan 100 lux, dan donkerder. Niet zolang het donker IS, anders gaan de lampen om
middernacht opnieuw aan.

- **Vijf minuten aan een stuk** (`LICHT_WACHT_MIN`): een wolk is nog geen avond.
- **Eén keer per dag** per onderdeel en per aan of uit: schemer die rond de grens schommelt, doet het niet drie keer.
  Dat is de dag waarop het gebeurt, en die dag moet in `dagen` staan.
- **Geen meting, geen moment.** Zegt de sensor `unavailable` of iets dat geen getal is, dan gebeurt er niets, en telt
  het ook niet als een overschrijding als hij terugkomt: wat hij daarvoor zei, blijft gelden.
- **Geen verschuiving op vakantie.** Het licht verschuift zelf al elke dag.

## Na een herstart

Wat de sensor de vorige keer zei (`was`) en of het vandaag al gebeurd is (`gedaan`), staat in de opslag. Was het licht toen
Home Assistant stopte en is het donker als hij terugkomt, dan is dat een overschrijding, en die wordt ingehaald met
dezelfde grenzen als een tijd: aan tot `INHAAL_AAN_UUR` na de laatste keer dat de motor keek, uit tot `INHAAL_UIT_UUR`.
Wanneer het precies donker werd, weet niemand; daarom telt het hele gat. Alleen het wachten van vijf minuten begint na
een herstart opnieuw: dat staat met opzet niet in de opslag, want te laat is hier beter dan te vroeg.

Een nieuwe regel, of een sensor die de motor nog nooit zag, doet niets tot de eerste overschrijding: wie om 20:00 een
regel maakt voor "als het donker wordt", wil niet dat de lampen meteen aangaan.
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant

from .const import RICHTING_DONKER, SOORT_LICHT
from .regels import delen_van


def lux_van(hass: HomeAssistant, sensor: str) -> float | None:
    """De lichtsterkte nu, of None als de sensor niets bruikbaars zegt."""
    status = hass.states.get(sensor)
    if status is None:
        return None
    try:
        waarde = float(status.state)
    except (TypeError, ValueError):
        return None
    return waarde if waarde == waarde and waarde >= 0 else None  # NaN is geen meting


def voorbij(moment: dict[str, Any], lux: float) -> bool:
    """Is het donkerder (of lichter) dan de grens?"""
    return lux < moment["lux"] if moment["richting"] == RICHTING_DONKER else lux > moment["lux"]


def sleutel(regel_id: str, wat: str) -> str:
    """Waaronder een onderdeel zijn stand voor de lichtsterkte bewaart: `regel-id|aan` of `regel-id:deel|uit`."""
    return f"{regel_id}|{wat}"


def momenten_van(regel: dict[str, Any]) -> list[tuple[dict[str, Any], str, dict[str, Any]]]:
    """Elk moment op de lichtsterkte in deze regel: (onderdeel, aan of uit, moment)."""
    uit = []
    for deel in delen_van(regel):
        for wat in ("aan", "uit"):
            moment = deel.get(wat)
            if isinstance(moment, dict) and moment.get("soort") == SOORT_LICHT:
                uit.append((deel, wat, moment))
    return uit


def sensoren_van(regel: dict[str, Any] | None) -> set[str]:
    """De lichtsensoren waar deze regel op let."""
    if not regel:
        return set()
    if "id" not in regel:
        regel = {**regel, "id": ""}
    return {m["sensor"] for _, _, m in momenten_van({"dagen": [], **regel})}
