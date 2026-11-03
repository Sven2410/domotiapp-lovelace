"""Zonneschermen en de wind (sinds 0.104.0).

De eigenaar, 3 november 2026, via de beheersessie: hij wil zonneschermen op de automatiseringskaart kunnen kiezen. Een
zonnescherm dat een regel uitrolt terwijl het stormt, is schade. De beheersessie stelde daarom een windgrens voor, en die staat
erbij: de beheerder kiest op de kaart een windsensor (`wind_sensor`) en een grens in km/h (`wind_max`, standaard
`WIND_MAX_STANDAARD`). Bij een weerstation met windstoten is dat de sensor van de windstoten.

- **Niet uitrollen** boven de grens, en ook niet als de sensor niets bruikbaars zegt (`unavailable`, geen getal, een eenheid die
  geen snelheid is). Inrollen gaat altijd. Dat geldt voor een regel en voor een favoriet; het voorbeeld laat de zonneschermen
  helemaal met rust.
- **Intrekken** zodra de wind boven de grens komt: één keer, bij het overschrijden. Daarna doet de motor niets meer tot de
  wind weer onder de grens is geweest, zodat wie een scherm zelf weer uitrolt niet elke minuut wordt overruled. Na een herstart
  met harde wind trekt hij ze één keer in: wat er tijdens de herstart gebeurde, weet niemand.
- **Zonder windsensor** op de kaart is er geen grens. Dat is de keuze van de beheerder, en de editor zegt erbij wat dat betekent.

De eenheid komt van de sensor zelf (`unit_of_measurement`) en wordt omgerekend; een Shelly-weerstation meldt m/s.
"""

from __future__ import annotations

from homeassistant.const import UnitOfSpeed
from homeassistant.core import HomeAssistant, State
from homeassistant.util.unit_conversion import SpeedConverter

# Een veilige grens voor een gewoon knikarmscherm: windkracht 4 is 20 tot 28 km/h.
WIND_MAX_STANDAARD = 30

# Alleen snelheden: de omrekening van Home Assistant kent ook neerslag in mm/h.
_SNELHEDEN = {str(e.value) for e in UnitOfSpeed}


def kmh_van(hass: HomeAssistant, sensor: str) -> float | None:
    """De wind in km/h, of None als de sensor niets bruikbaars zegt."""
    return kmh_uit(hass.states.get(sensor))


def kmh_uit(status: State | None) -> float | None:
    """Hetzelfde, uit een toestand: ook de vorige, bij een wijziging."""
    if status is None:
        return None
    eenheid = status.attributes.get("unit_of_measurement")
    if eenheid not in _SNELHEDEN:
        return None
    try:
        waarde = float(status.state)
    except (TypeError, ValueError):
        return None
    if waarde != waarde or waarde < 0:  # NaN of onzin
        return None
    return SpeedConverter.convert(waarde, eenheid, UnitOfSpeed.KILOMETERS_PER_HOUR)


def te_hard(kmh: float | None, grens: float) -> bool:
    """Mag er NIET uitgerold worden? Ook zonder meting niet."""
    return kmh is None or kmh > grens
