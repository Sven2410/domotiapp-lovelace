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
- **Wat al in staat, blijft staan** (sinds 0.132.0). Meldt een scherm zelf dat hij in staat (`closed`, of `open` als hij
  `omgekeerd` is), dan krijgt hij geen opdracht. Zonder terugmelding (`assumed_state`, of een onbekende stand) gaat hij wel.
- **Op de kaart te zien** (sinds 0.132.0). De eigenaar zag zijn schermen bij een windstoot omlaag gaan en wist niet waarom:
  de beveiliging stond alleen in de editor. De stand geeft daarom `wind` mee (sensor, grens, schermen, en de laatste ingreep
  uit de opslag), en de kaart toont dat als blok Windbeveiliging.

- **Niet bij elke vlaag opnieuw** (sinds 0.133.0). Bij vlagerige wind komt de sensor telkens weer boven de grens: bij de
  eigenaar op één middag acht keer. Een scherm met een bekende stand ziet zelf dat hij al in staat (hierboven). Een scherm
  zonder (Somfy RTS) krijgt na een ingreep pas weer een intrekopdracht als (a) er sindsdien in Home Assistant een andere
  opdracht dan intrekken naar hem ging, van welke bron ook (een regel, een kaart, een dienstaanroep; een doel op ruimte,
  apparaat, verdieping of label telt voor alle schermen), of (b) `WIND_OPNIEUW_MIN` minuten na de vorige ingreep, omdat
  uitrollen met de afstandsbediening niet te zien is. Per scherm in de opslag (`wind_schermen`), dus ook na een herstart.
  Goedgekeurd door de eigenaar, voorstel van de beheersessie.

- **Wijzigen op de kaart** (sinds 0.134.0). De eigenaar wilde de windbeveiliging wijzigen zoals een regel: een tik op de rij.
  Dat staat dan in de opslag (`wind_instelling`), voor het hele huis, zodat twee dashboards met dezelfde kaart gelijk blijven:
  - `aan`: uit is geen windgrens;
  - `sensor` en `max`;
  - `zonder`: zonneschermen van de kaart die NIET meedoen. Een uitsluitlijst en geen lijst van wie meedoet, zodat een scherm
    dat later op een kaart komt meteen beschermd is;
  - `omgekeerd`: per zonnescherm `true` of `false`; dat geldt ook voor de regels. Een scherm dat er niet in staat, volgt de kaart.

  Zolang er niets is opgeslagen, geldt de kaartconfig, en opent het dialoog met die waarden: de overgang gaat vanzelf.
  Alleen een beheerder mag het opslaan (`wind_opslaan` heeft `require_admin`): uitzetten is een scherm in de storm. Een
  gewone gebruiker ziet hetzelfde dialoog om te lezen.

**Een knikarmscherm dat zich als rolluik meldt.** Somfy (Overkiz) kent een knikarmscherm soms als ExteriorScreen, met
`device_class: blind`. Dan is `close_cover` de motor omlaag, en dat is bij een knikarm UITROLLEN. Intrekken bij de wind rolde
ze zo juist uit. Zet zo'n scherm in `omgekeerd` op de kaart; de editor waarschuwt bij een zonnescherm dat zich niet als
`awning` meldt.

De eenheid komt van de sensor zelf (`unit_of_measurement`) en wordt omgerekend; een Shelly-weerstation meldt m/s.
"""

from __future__ import annotations

from homeassistant.const import UnitOfSpeed
from homeassistant.core import HomeAssistant, State
from homeassistant.util.unit_conversion import SpeedConverter

# Een veilige grens voor een gewoon knikarmscherm: windkracht 4 is 20 tot 28 km/h.
WIND_MAX_STANDAARD = 30

# Een scherm zonder bekende stand krijgt na een ingreep pas weer een intrekopdracht als hij sindsdien uitgerold kan zijn:
# een opdracht in Home Assistant, of na deze tijd (de afstandsbediening is niet te zien). Zie de kop.
WIND_OPNIEUW_MIN = 30

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
