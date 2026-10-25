"""Wat een robotstofzuiger meldt. Pure functies, zonder `hass`.

Gevraagd op 25 oktober 2026: *"we hebben nu afvalmeldingen. Ik wil ook
meldingen van de robotstofzuiger kunnen instellen."* Eerst voor de twee
Dreames bij een klant (HACS `dreame_vacuum`, Tasshack v2.0.2).

## Op sensoren, niet op de gebeurtenissen van Dreame

`dreame_vacuum` vuurt zelf gebeurtenissen af (`dreame_vacuum_task_status`,
`_error`, `_low_water`, `_consumable`, zie `coordinator.py` daar). Hier wordt
toch naar de SENSOREN gekeken, om twee redenen:

- die sensoren staan in de echte dumps van beide robots
  (`tests/js/vaste-invoer/dreame-*.json`), de gebeurtenissen nog niet. De
  afspraak is dezelfde als bij de coach: er gaat niets uit dat leunt op iets
  wat niet in een echte dump heeft gestaan;
- de rol van een sensor zit in zijn `translation_key`, net als op de
  stofzuigerkaart (`ROLLEN` in `stofzuiger-logica.js`). Een volgend merk is
  dan een regel in `ROLLEN` en geen nieuwe luisteraar.

## Vier soorten

| soort | wanneer |
|---|---|
| `klaar` | de taak (`task_status`) gaat van schoonmaken naar `completed`; zonder die sensor: de stofzuiger zelf van schoonmaken naar `docked` |
| `storing` | de sensor `error` is iets anders dan "geen fout" |
| `station` | de schoonwatertank, de vuilwatertank of de stofzak is niet in orde |
| `onderhoud` | een onderdeel (`<onderdeel>_left`, in %) zakt tot de grens |

`klaar` is een moment. De andere drie zijn een TOESTAND: de melding komt als
hij begint, één keer, en verdwijnt van de telefoon als hij weer in orde is
(zie `motor.py`). Een waarde uit `unavailable` of `unknown` telt niet als
begin: dat is een robot die opnieuw verbindt, en die heeft wat er toen al was
al gemeld. En een waarde NAAR `unavailable` telt niet als einde.

## Wat de echte gegevens leerden (0.85.1)

Uitgelezen bij de klant op 25 oktober 2026, 14 dagen geschiedenis van beide
robots (in de privénotities). Vier dingen die 0.85.0 anders deed:

- **Een tank eruit halen is geen melding.** Wie bijvult of leegt, haalt de
  tank eruit, en dan zegt de sensor een à twee minuten `not_installed` (of
  `not_installed_or_full`). Een melding over het station gaat daarom pas uit
  als hij na `STATION_WACHT` seconden nog zo is.
- **`low_water_warning` doet niet mee.** Hij ging naar `no_water_left` en
  bleef daar staan nadat de tank was bijgevuld: Dreame wist hem pas als
  iemand de melding in Home Assistant wegklikt. De tanksensor ging wél terug
  van `low_water` naar `installed`.
- **`battery_low` is geen storing.** Midden in een beurt, een minuut lang: de
  robot gaat laden en gaat daarna zelf verder.
- **Rond een herstart staat alles even op `unavailable`.** Dat mag een
  lopende melding niet van de telefoon halen.

En wat klopte: `task_status` ging van `cleaning` naar `completed` één keer per
beurt, terwijl de robot zelf zeven keer naar het station reed om de pads te
wassen (`returning`, `docked`, `cleaning`). Zonder taak (een ander merk) telt
`docked` daarom pas als hij er `KLAAR_ZONDER_TAAK` seconden staat.
"""

from __future__ import annotations

import re
from typing import Any

from ..taal import vertaal

SOORT_KLAAR = "klaar"
SOORT_STORING = "storing"
SOORT_STATION = "station"
SOORT_ONDERHOUD = "onderhoud"
GEBEURTENISSEN = (SOORT_KLAAR, SOORT_STORING, SOORT_STATION, SOORT_ONDERHOUD)

# Per `translation_key` (domein sensor) de rol. Dezelfde sleutels als op de
# stofzuigerkaart (`ROLLEN` in stofzuiger-logica.js), plus de taak en wat er
# in de melding "klaar" staat.
ROLLEN = {
    "task_status": "taak",
    "error": "fout",
    "clean_water_tank_status": "schoonwater",
    "dirty_water_tank_status": "vuilwater",
    "dust_bag_status": "stofzak",
    "cleaned_area": "oppervlak",
    "cleaning_time": "duur",
}

# Een onderhoudsonderdeel: `<onderdeel>_left`, in procenten.
ONDERHOUD = re.compile(r"^(.+)_left$")

# Onder of op dit percentage is een onderdeel aan de beurt. Gelijk aan
# `ONDERHOUD_GRENS` op de stofzuigerkaart: daar wordt het balkje dan oranje.
ONDERHOUD_GRENS = 10

# Wat geen waarde is: een robot die (nog) niet verbonden is.
GEEN_WAARDE = frozenset({"", "unavailable", "unknown", "none"})

# Wat geen fout is, in de sensor `error`. Zelfde lijst als op de kaart.
GEEN_FOUT = frozenset({"no_error", "none", "ok", "0"})

# Een fout van Dreame die de robot zelf oplost: hij gaat laden en daarna weer
# verder. Bij de klant twee keer in tien dagen, telkens een minuut. Op de kaart
# staat hij wel (dat is wat de robot zegt); een melding is het niet.
GEEN_STORING = frozenset({"battery_low"})

# Zo lang moet een tank niet in orde zijn voor er een melding komt: wie
# bijvult, haalt de tank er een à twee minuten uit.
STATION_WACHT = 180

# Zo lang staat een robot zonder taaksensor in het station voor het "klaar" is.
# Een Dreame reed binnen een beurt zeven keer heen en weer, en stond daar
# hooguit een minuut.
KLAAR_ZONDER_TAAK = 300

# Een taak die schoonmaakt. Tasshack, `DreameVacuumTaskStatus`: auto_cleaning,
# zone_cleaning, segment_cleaning, spot_cleaning, en hun *_paused,
# *_mopping_paused en *_docking_paused. Niet fast_mapping (een plattegrond
# maken) en niet cruising (rondrijden met de camera).
SCHOONMAKEN = re.compile(r"(cleaning|mopping|docking_paused)")
GEEN_SCHOONMAAKTAAK = re.compile(r"^(station_cleaning|fast_mapping|cruising)")

# Wat de stofzuiger zelf zegt als hij schoonmaakt, voor een merk zonder taak.
STOFZUIGER_BEZIG = frozenset({"cleaning"})

# De sensoren van het station: per rol de waarden die NIET in orde zijn, met
# de zin voor de telefoon. De waarden zijn die van Tasshack (`types.py`):
# `DreameVacuumCleanWaterTankStatus`, `DirtyWaterTankStatus` en
# `DustBagStatus`. Bij de klant gezien: `low_water`, `not_installed` en
# `not_installed_or_full`.
STATION = {
    "schoonwater": {
        "low_water": "Het schone water is bijna op. Vul de tank bij.",
        "not_installed": "De schoonwatertank is niet geplaatst.",
    },
    "vuilwater": {
        "not_installed_or_full": "De vuilwatertank is vol of niet geplaatst. Leeg hem.",
        "full": "De vuilwatertank is vol. Leeg hem.",
        "not_installed": "De vuilwatertank is niet geplaatst.",
    },
    "stofzak": {
        "full": "De stofzak is vol. Vervang hem.",
        "check": "Controleer de stofzak.",
        "not_installed": "De stofzak is niet geplaatst.",
    },
}

# Rol -> sleutel van de melding.
STATION_SLEUTEL = {"schoonwater": "schoonwater", "vuilwater": "vuilwater", "stofzak": "stofzak"}

# De onderdelen bij naam. Wat hier niet staat krijgt de naam die Home
# Assistant de sensor geeft (`naam` in `onderhoud_tekst`).
ONDERDELEN = {
    "main_brush_left": "Hoofdborstel",
    "side_brush_left": "Zijborstel",
    "filter_left": "Filter",
    "sensor_dirty_left": "Sensoren",
    "mop_pad_left": "Dweilpads",
    "wheel_dirty_left": "Wielen",
    "scale_inhibitor_left": "Antikalk",
    "silver_ion_left": "Zilverion",
    "detergent_left": "Schoonmaakmiddel",
    "squeegee_left": "Wisser",
    "tank_filter_left": "Tankfilter",
    "deodorizer_left": "Geurverdrijver",
}


def heeft_waarde(waarde: Any) -> bool:
    return waarde is not None and str(waarde).strip().lower() not in GEEN_WAARDE


def getal(waarde: Any) -> float | None:
    try:
        return float(str(waarde).replace(",", "."))
    except (TypeError, ValueError):
        return None


def is_klaar(rol: str, oud: Any, nieuw: Any) -> bool:
    """Is dit de overgang van schoonmaken naar klaar?

    `rol` is `taak` (de sensor `task_status`) of `stofzuiger` (de
    vacuum-entiteit zelf, voor een merk zonder taak). Bij de stofzuiger zelf
    beslist de motor of hij eerst schoonmaakte (`bezig`): tussen schoonmaken en
    `docked` zit `returning`.
    """
    if rol == "taak":
        o = str(oud or "").lower()
        return (
            str(nieuw or "").lower() == "completed"
            and bool(SCHOONMAKEN.search(o))
            and not GEEN_SCHOONMAAKTAAK.match(o)
        )
    return False


def fout_tekst(waarde: Any, beschrijving: Any = None) -> str:
    """De storing in woorden, of "" als er geen is.

    `description` is het attribuut van Tasshack, in de taal van Home Assistant
    ("Geen fout" in de dumps). Zonder dat de waarde zelf, leesbaar gemaakt.
    """
    sleutel = str(waarde).strip().lower() if waarde is not None else ""
    if not heeft_waarde(waarde) or sleutel in GEEN_FOUT or sleutel in GEEN_STORING:
        return ""
    tekst = str(beschrijving or "").strip()
    if tekst:
        # Tasshack zet soms een uitleg op de tweede regel; de eerste is de titel.
        return tekst.split("\n", 1)[0].strip()
    return opgeschoond(waarde)


def station_tekst(rol: str, waarde: Any, taal: str) -> str:
    """Wat er aan het station mis is, of "" als het in orde is (of onbekend)."""
    zin = STATION.get(rol, {}).get(str(waarde or "").strip().lower())
    return vertaal(taal, zin) if zin else ""


def onderhoud_procent(waarde: Any) -> float | None:
    """Het percentage als het op of onder de grens zit, anders None."""
    n = getal(waarde)
    if n is None or n < 0 or n > ONDERHOUD_GRENS:
        return None
    return n


def onderhoud_tekst(tk: str, procent: float, naam: str, taal: str) -> str:
    """"Hoofdborstel: nog 8 %. Tijd om te vervangen of schoon te maken."."""
    onderdeel = ONDERDELEN.get(tk)
    onderdeel = vertaal(taal, onderdeel) if onderdeel else (naam or opgeschoond(tk.removesuffix("_left")))
    return vertaal(
        taal,
        "{onderdeel}: nog {pct} %. Tijd om te vervangen of schoon te maken.",
        onderdeel=onderdeel,
        pct=round(procent),
    )


def klaar_tekst(oppervlak: Any, duur: Any, taal: str) -> str:
    """"Klaar met schoonmaken: 51 m² in 52 min." Zonder getallen alleen de zin."""
    m2 = getal(oppervlak) if heeft_waarde(oppervlak) else None
    minuten = getal(duur) if heeft_waarde(duur) else None
    if m2 and minuten:
        return vertaal(taal, "Klaar met schoonmaken: {m2} m² in {duur}.", m2=round(m2), duur=duur_tekst(minuten, taal))
    if m2:
        return vertaal(taal, "Klaar met schoonmaken: {m2} m².", m2=round(m2))
    return vertaal(taal, "Klaar met schoonmaken.")


def duur_tekst(minuten: float, taal: str) -> str:
    """"52 min", "1 uur 5 min". Zelfde vorm als `duurTekst` op de kaart."""
    r = round(minuten)
    if r < 60:
        return f"{r} min"
    u, rest = divmod(r, 60)
    if rest:
        return vertaal(taal, "{u} uur {m} min", u=u, m=rest)
    return vertaal(taal, "{u} uur", u=u)


def storing_tekst(fout: str, taal: str) -> str:
    return vertaal(taal, "Storing: {fout}", fout=fout)


def opgeschoond(waarde: Any) -> str:
    """`not_installed_or_full` -> "Not installed or full"."""
    tekst = str(waarde or "").replace("_", " ").strip()
    return tekst[:1].upper() + tekst[1:]
