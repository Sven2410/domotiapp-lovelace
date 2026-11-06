"""Wie een melding van de camera krijgt. Pure functies, zonder `hass`.

Gevraagd op 6 november 2026: *"Ik wil eerst dat je een koppeling maakt tussen
de camera kaart met meldingen en de meldingen kaart. Ik wil per persoon kunnen
aanvinken wie welke meldingen krijgt."*

## Wat waar staat

De CAMERAKAART blijft beslissen wat er vastgelegd wordt: welke melders, de
rustperiode, de wachttijd, alleen als er niemand thuis is, de stilschakelaar.
Dat staat in de regels van de bewaking (`bewaking/store.py`), en daar verandert
niets aan.

De MELDINGENKAART beslist sinds 0.109.0 wie het op zijn telefoon krijgt, als er
op die kaart `camera: true` staat. Ieder kiest in zijn pop-up:

- of hij camerameldingen krijgt (`aan`, zoals bij afval en de stofzuiger);
- van welke camera's (`cameras`);
- waarover (`soorten`): mens, dier, voertuig, aanbellen, ontgrendeling of
  beweging. De soort van een melder komt van de camerakaart (`soorten` in de
  regel), zoals de filterknoppen op die kaart hem kennen.

Wie NIET op de meldingenkaart staat, krijgt wat de camerakaart zegt
(`snapshot_ontvangers`), zoals voor 0.109.0. Een huis zonder meldingenkaart
merkt dus niets.

## Koppelen verandert niets aan wie er nu iets krijgt

Wie nog niets koos, krijgt wat hij op de camerakaart al kreeg: `aan` als hij
bij een camera in `ontvangers` staat, en dan die camera's. Bij afval en de
stofzuiger staat een nieuwe persoon standaard aan; hier niet, en dat is met
opzet. Een meldingenkaart heeft vaak het hele huishouden erop, en wie de
camera aanzet op die kaart, hoort niet ineens elke beweging op de oprit naar de
telefoons van de kinderen te sturen. Ieder vinkt het zelf aan.

Zet iemand het zelf aan zonder dat hij ergens ontvanger was, dan krijgt hij
alle camera's: een vinkje dat niets doet is erger dan een vinkje te veel.

Een keuze voor camera's wordt altijd als hele lijst bewaard, nooit als "alles"
(zie `kies` in meldingen-card.js): "alles" zou hier terugvallen op de
standaard, en die is niet altijd alles.

## Een melder zonder soort

De camerakaart raadt de soort uit de naam en de `device_class`, en een melder
waar niets op past heeft er op die kaart geen (zie `ALGEMEEN` in
camera-filters.js: geen filterknop voor iets wat niemand instelde). Hier telt
zo'n melder als `beweging`: anders kan wie alleen "Aanbellen" wil, de gewone
bewegingsmelder van de oprit niet uitzetten.
"""

from __future__ import annotations

from collections.abc import Iterable
from typing import Any, Protocol

from ..bewaking.const import MELDER_SOORTEN as SOORTEN

ZONDER_SOORT = "beweging"


class Regel(Protocol):
    camera: str
    melders: list[str]
    ontvangers: list[str]
    soorten: dict[str, str]


class Keuzes(Protocol):
    def aan_gezet(self, melding: str, persoon: str) -> bool | None: ...

    def keuze(self, melding: str, persoon: str) -> dict[str, list[str]]: ...


def soort_van(regel: Regel, melder: str | None) -> str:
    """De soort van deze melder, zoals de camerakaart hem doorgaf."""
    soort = (getattr(regel, "soorten", None) or {}).get(melder or "")
    return soort if soort in SOORTEN else ZONDER_SOORT


def cameras(regels: Iterable[Regel]) -> list[str]:
    """De camera's om uit te kiezen, in de volgorde van de regels."""
    return list(dict.fromkeys(r.camera for r in regels))


def soorten(regels: Iterable[Regel]) -> list[str]:
    """De soorten die bij deze camera's voorkomen, in vaste volgorde."""
    aanwezig = {soort_van(r, m) for r in regels for m in r.melders}
    return [s for s in SOORTEN if s in aanwezig]


def standaard(persoon: str, regels: list[Regel]) -> dict[str, Any]:
    """Wat iemand krijgt die nog niets koos. Zie de kop van dit bestand."""
    eigen = [r.camera for r in regels if persoon in r.ontvangers]
    return {"aan": bool(eigen), "cameras": list(dict.fromkeys(eigen)) or cameras(regels)}


def keuze(opslag: Keuzes, melding: str, persoon: str, regels: list[Regel]) -> dict[str, Any]:
    """Wat deze persoon krijgt: `aan`, en welke camera's en soorten.

    Binnen wat er te kiezen is: een camera die niet meer bewaakt wordt valt
    eruit.
    """
    std = standaard(persoon, regels)
    gezet = opslag.aan_gezet(melding, persoon)
    eigen = opslag.keuze(melding, persoon)
    alle_cameras = cameras(regels)
    alle_soorten = soorten(regels)
    return {
        "aan": std["aan"] if gezet is None else gezet,
        "cameras": [c for c in alle_cameras if c in eigen["cameras"]] if "cameras" in eigen else std["cameras"],
        "soorten": [s for s in alle_soorten if s in eigen["soorten"]] if "soorten" in eigen else alle_soorten,
    }


def ontvangers(
    regel: Regel,
    melder: str | None,
    *,
    personen: list[str] | None,
    opslag: Keuzes | None,
    melding: str,
    regels: list[Regel],
) -> list[str]:
    """Wie de melding van deze regel en deze melder krijgt.

    `personen` zijn de personen op de meldingenkaarten met `camera: true`, of
    None als die er niet is: dan is het de camerakaart alleen, zoals voor
    0.109.0.
    """
    if personen is None or opslag is None:
        return list(regel.ontvangers)
    soort = soort_van(regel, melder)
    uit = [p for p in regel.ontvangers if p not in personen]
    for p in personen:
        k = keuze(opslag, melding, p, regels)
        if k["aan"] and regel.camera in k["cameras"] and soort in k["soorten"]:
            uit.append(p)
    return uit
