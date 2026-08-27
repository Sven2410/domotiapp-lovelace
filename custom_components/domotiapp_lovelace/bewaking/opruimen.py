"""Wat er weg mag uit de timeline. Pure functies, geen HA en geen schijf.

Los van de rest omdat dit het enige stukje is waar een rekenfout stil beelden
weggooit die de klant nog wilde zien -- en omdat het zo in een gewone test
zonder Home Assistant te vangen is.

Twee grenzen, en ze gelden allebei tegelijk (de strengste wint):

1. **Ouder dan een week gaat weg.** Gevraagd op 27 augustus 2026: *"De timeline
   blijft max een week staan en verwijdert automatisch de laatste en overschrijft
   hem."*
2. **Hoogstens 500 per camera.** Daar koos de eigenaar dezelfde dag voor, nadat
   was voorgerekend dat een rustperiode van één minuut in een week ruim 10.000
   beelden kan opleveren.

De tweede grens telt **per camera** en niet over het geheel: anders zou één
drukke oprit de beelden van de achterdeur wegdrukken, en dan is de camera die
niets ziet precies de camera waarvan je niets meer terugvindt.
"""

from __future__ import annotations

from collections.abc import Iterable, Sequence
from datetime import datetime, timedelta
from typing import Any


def bepaal_opruiming(
    beelden: Sequence[dict[str, Any]],
    *,
    nu: datetime,
    max_leeftijd: timedelta,
    max_per_camera: int,
) -> list[str]:
    """Welke beeld-ID's weg mogen. Verandert `beelden` niet.

    De volgorde van de invoer doet er niet toe: er wordt zelf op tijd
    gesorteerd. Een beeld zonder leesbare tijd of zonder ID blijft staan --
    weggooien wat je niet begrijpt is de verkeerde kant om, en zo'n regel valt
    op in de timeline in plaats van stil te verdwijnen.
    """
    te_oud: set[str] = set()
    per_camera: dict[str, list[tuple[datetime, str]]] = {}

    for beeld in beelden:
        beeld_id = beeld.get("id")
        tijd = _tijd_van(beeld)
        if not isinstance(beeld_id, str) or tijd is None:
            continue

        if nu - tijd > max_leeftijd:
            te_oud.add(beeld_id)
            continue

        camera = beeld.get("camera")
        if not isinstance(camera, str):
            # Zonder camera valt hij buiten de tweede grens, maar de eerste
            # heeft hem al gehad als hij oud was.
            continue
        per_camera.setdefault(camera, []).append((tijd, beeld_id))

    te_veel: set[str] = set()
    for rijtje in per_camera.values():
        if len(rijtje) <= max_per_camera:
            continue
        # Nieuwste eerst; alles voorbij de grens is de oudste en gaat weg.
        rijtje.sort(key=lambda paar: paar[0], reverse=True)
        te_veel.update(beeld_id for _, beeld_id in rijtje[max_per_camera:])

    weg = te_oud | te_veel
    # De volgorde van de invoer aanhouden, zodat een test en een logregel er
    # hetzelfde uitzien bij dezelfde invoer.
    return [
        beeld["id"]
        for beeld in beelden
        if isinstance(beeld.get("id"), str) and beeld["id"] in weg
    ]


def maak_ruimte(
    beelden: Sequence[dict[str, Any]],
    *,
    camera: str,
    nu: datetime,
    max_leeftijd: timedelta,
    max_per_camera: int,
) -> list[str]:
    """Wat er weg moet VOORDAT er een nieuw beeld van `camera` bij komt.

    Dit is het "en overschrijft hem" uit de opdracht: bij een volle timeline
    gaat de oudste eruit vóór de nieuwe erin, niet erna. Het verschil is één
    beeld, maar het is wel het verschil tussen een grens die geldt en een grens
    die telkens één te ruim staat.
    """
    weg = bepaal_opruiming(
        [*beelden, {"id": _PLAATSHOUDER, "camera": camera, "tijd": nu.isoformat()}],
        nu=nu,
        max_leeftijd=max_leeftijd,
        max_per_camera=max_per_camera,
    )
    # De plaatshouder staat nog niet in de index en kan er dus ook niet uit.
    # Hij komt hier alleen uit bij een grens van nul, en dan zou zijn ID naar
    # de schijflaag lekken.
    return [beeld_id for beeld_id in weg if beeld_id != _PLAATSHOUDER]


def verweesd(
    beelden: Iterable[dict[str, Any]], op_schijf: Iterable[str]
) -> tuple[list[str], list[str]]:
    """Wat er niet meer bij elkaar hoort: bestanden zonder regel, regels zonder bestand.

    Geeft `(bestanden_zonder_regel, ids_zonder_bestand)`. Het eerste is
    schijfruimte die niemand meer terugvindt; het tweede is een regel in de
    timeline die een gebroken plaatje zou tonen.

    Dat dit kan voorkomen is geen theorie: de index wordt vertraagd
    weggeschreven, en een harde herstart tussen het wegschrijven van het
    bestand en het wegschrijven van de index laat precies zo'n paar achter.
    """
    ids = {b["id"] for b in beelden if isinstance(b.get("id"), str)}
    schijf = set(op_schijf)
    return sorted(schijf - ids), sorted(ids - schijf)


_PLAATSHOUDER = "\x00nieuw"


def _tijd_van(beeld: dict[str, Any]) -> datetime | None:
    """De tijd van een beeld, of None als hij niet te lezen is."""
    rauw = beeld.get("tijd")
    if not isinstance(rauw, str):
        return None
    try:
        gelezen = datetime.fromisoformat(rauw)
    except ValueError:
        return None
    return gelezen if gelezen.tzinfo is not None else None
