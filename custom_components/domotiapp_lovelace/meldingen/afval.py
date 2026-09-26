"""Wat er in een afvalmelding staat. Pure functies, zonder `hass`.

## Geen vaste lijst met bakken

Zijn automatisering stuurde alleen iets als de sensor precies `papier`, `gft`,
`pmd` of `restafval` zei. Dat werkt zolang de gemeente niets anders ophaalt;
textiel, kerstbomen of "gft, papier" op dezelfde dag vielen stil weg. Hier is
het andersom: ALLES is afval, behalve wat duidelijk "niets" betekent. Een melding
over textiel die je niet verwachtte is beter dan een bak die blijft staan.

## De namen

`gft` op een telefoonscherm leest als een typefout. Bekende afkortingen worden
hoofdletters, de rest krijgt een hoofdletter vooraan; wat de sensor zelf al met
hoofdletters schrijft, blijft staan.

Dezelfde regels staan voor de kaart in `src/cards/meldingen-logica.js`, met
dezelfde tests ernaast.
"""

from __future__ import annotations

import re

# Wat een ophaalsensor zegt als er niets is. Kleine letters, zonder spaties.
GEEN = frozenset(
    {
        "",
        "geen",
        "none",
        "unknown",
        "unavailable",
        "-",
        "nee",
        "niets",
        "no",
        "false",
        "off",
        "0",
        "geen afval",
        "geen ophaling",
    }
)

# Afkortingen die hoofdletters horen te dragen, en een paar vaste schrijfwijzen.
NAMEN = {
    "gft": "GFT",
    "pmd": "PMD",
    "kca": "KCA",
    "pbd": "PBD",
    "papier": "Papier",
    "oud papier": "Oud papier",
    "restafval": "Restafval",
    "rest": "Restafval",
    "textiel": "Textiel",
    "kerstbomen": "Kerstbomen",
    "kerstboom": "Kerstboom",
    "glas": "Glas",
    "plastic": "Plastic",
    "grofvuil": "Grofvuil",
    "snoeiafval": "Snoeiafval",
}

# Een datum of een getal is geen soort afval. Sommige integraties zetten de
# ophaaldatum in de toestand; die wordt anders "Er wordt 2026-09-27 opgehaald".
_GEEN_SOORT = re.compile(r"^[\d\s:./-]+$")
_SCHEIDING = re.compile(r"\s*(?:,|;|/|&|\+|\ben\b|\band\b)\s*", re.IGNORECASE)


def soorten(toestand: str | None) -> list[str]:
    """De soorten afval in deze toestand, netjes geschreven. Leeg = niets."""
    tekst = str(toestand or "").strip()
    if tekst.lower() in GEEN or _GEEN_SOORT.match(tekst):
        return []
    uit: list[str] = []
    for stuk in _SCHEIDING.split(tekst):
        stuk = stuk.strip()
        if not stuk or stuk.lower() in GEEN or _GEEN_SOORT.match(stuk):
            continue
        naam = NAMEN.get(stuk.lower())
        if naam is None:
            # Wat de sensor zelf al met een hoofdletter schrijft, is zijn keuze.
            naam = stuk if stuk[:1].isupper() else stuk[:1].upper() + stuk[1:]
        if naam not in uit:
            uit.append(naam)
    return uit


def opsomming(namen: list[str]) -> str:
    """"GFT", "GFT en Papier", "GFT, PMD en Papier"."""
    if not namen:
        return ""
    if len(namen) == 1:
        return namen[0]
    return f"{', '.join(namen[:-1])} en {namen[-1]}"


def bericht(moment: str, namen: list[str]) -> tuple[str, str]:
    """Titel en tekst van de melding.

    `moment` is "morgen" (de avond ervoor) of "vandaag" (de ochtend zelf). De
    titel noemt meteen de bak: op een vergrendeld scherm is dat vaak het enige
    wat je leest.
    """
    wat = opsomming(namen)
    meer = len(namen) > 1
    ww = "worden" if meer else "wordt"
    bak = "de containers" if meer else "de container"
    if moment == "morgen":
        return (
            f"Morgen {wat}",
            f"Morgen {ww} {wat} opgehaald. Zet {bak} vanavond aan de straat.",
        )
    return (
        f"Vandaag {wat}",
        f"Vandaag {ww} {wat} opgehaald. Zet {bak} aan de straat als dat nog niet gebeurd is.",
    )


def tijd_geldig(tijd: str | None) -> str | None:
    """"7:30", "07:30" of "07:30:00" als "07:30", of None."""
    m = re.match(r"^\s*(\d{1,2}):(\d{2})(?::\d{2})?\s*$", str(tijd or ""))
    if not m:
        return None
    uur, minuut = int(m.group(1)), int(m.group(2))
    if uur > 23 or minuut > 59:
        return None
    return f"{uur:02d}:{minuut:02d}"
