"""Wat een garagedeur meldt. Pure functies, zonder `hass`.

Gevraagd op 27 november 2026, via de beheersessie, voor alle klanten. De eigenaar:
"Ja alles via lovelace in te kunnen stellen ook de klant". Een klant liet de deur
openstaan zonder het te merken; er hangt een magneetcontact op (aan = open) en een
relais dat de deur met een puls laat bewegen.

## Wanneer er een melding komt (`volgende`)

| wat | wanneer |
|---|---|
| `eerste` | de deur staat `minuten` open (standaard 5) |
| `herinner` | daarna elke `herhaal` minuten (standaard 60) zolang hij open staat |
| `na_negeer` | iemand koos "negeer" en die tijd is om, terwijl de deur nog open staat |
| `avond` | om `avond` (standaard 22:00) staat hij open: OOK als er genegeerd wordt. Uit te zetten |
| `niet_dicht` | iemand tikte Sluiten, en na `SLUIT_CONTROLE` seconden zegt het contact nog open |

Negeren geldt voor het hele huis en vervalt zodra de deur dichtgaat. De volgende
keer open begint weer bij de eerste melding. "Tot morgen" (bij de avondmelding) is
negeren tot `morgen` (standaard 07:00). Na het negeren krijgt wie al een melding had
`na_negeer`; wie er nog geen had, gaat gewoon verder met zijn eerste melding.

## Per persoon (sinds 0.145.0)

De eigenaar, 27 november 2026: "maar personen kunnen niet instellen dus na hoeveel
minuten etc etc?". Ieder kiest in zijn pop-up na hoeveel minuten de eerste melding
komt, hoe vaak daarna, en de avondmelding (uit of een eigen tijd). Dat staat in
`keuzes` van de opslag, als lijst van één waarde (`KEUZES`), net als de keuzes van
afval en de stofzuiger; zie `voor_persoon`. Wat iemand niet koos, komt van de kaart:
die waarden zijn de standaard, dus wie niets doet krijgt hetzelfde als voor 0.145.0.
De knoppen, negeren en "Tot morgen" blijven van het hele huis. Daarom houdt de motor
per persoon bij wanneer hij de laatste melding kreeg (`per` in de opslag), en vraagt
hij `volgende` per persoon.

## Het contact is de waarheid

Er zijn ook gewone afstandsbedieningen. Wat de deur doet, staat dus in het
contact, niet in wie op welke knop drukte: dicht is dicht, en dan verdwijnen de
meldingen bij iedereen. Sluiten stuurt alleen een puls als het contact op dat
moment open zegt: een puls op een dichte deur zet hem juist open. Er is geen Face
ID (de eigenaar: niet gebruiken); de deur stopt zelf als er iets onder staat.

## Wat in de opslag staat

Alles wat de klok nodig heeft: sinds wanneer hij open staat, de laatste melding,
negeren tot wanneer en door wie, per persoon de laatste melding en avondmelding
(`per`), en een Sluiten die nog nagekeken moet worden. Een
herstart midden in een open deur gaat dus gewoon verder. Staat de deur bij het
opstarten open en weet de opslag niet sinds wanneer, dan telt het vanaf de start:
`last_changed` is na een herstart het moment van de herstart, en dus niet beter.
"""

from __future__ import annotations

from dataclasses import dataclass, field, replace
from datetime import date, datetime, timedelta
from typing import Any

from ..taal import nt, vertaal
from .afval import tijd_geldig

ACTIE_GARAGE = "DOMOTIAPP_GARAGE"
CMD_SLUIT = "sluit"
CMD_NEGEER = "negeer"
CMD_MORGEN = "morgen"

STANDAARD_MINUTEN = 5
STANDAARD_HERHAAL = 60
STANDAARD_NEGEER = (15, 60, 240)
STANDAARD_AVOND = "22:00"
STANDAARD_MORGEN = "07:00"

# De keuzes per persoon in de opslag (sinds 0.145.0), elk een lijst van één waarde. Avond is een tijd of `AVOND_UIT`.
KEUZE_MINUTEN = "garage_minuten"
KEUZE_HERHAAL = "garage_herhaal"
KEUZE_AVOND = "garage_avond"
KEUZES = (KEUZE_MINUTEN, KEUZE_HERHAAL, KEUZE_AVOND)
AVOND_UIT = "uit"

# Na zoveel seconden wordt nagekeken of de deur na Sluiten echt dicht is.
SLUIT_CONTROLE = 90

# Android toont hoogstens drie knoppen in een melding, iOS tien.
ANDROID_KNOPPEN = 3

# Welke domeinen de deur kunnen laten bewegen, en hoe. Een schakelaar met een puls
# (een Sonoff die zichzelf uitzet) krijgt `toggle`, zoals de knop op het dashboard
# van de eerste klant het al deed.
BEDIENING = {
    "switch": ("switch", "toggle"),
    "button": ("button", "press"),
    "input_button": ("input_button", "press"),
    "script": ("script", "turn_on"),
    "cover": ("cover", "close_cover"),
}

# Een contact kan `on` zijn, of als het een cover is `open`/`opening`.
OPEN = frozenset({"on", "open", "opening"})
DICHT = frozenset({"off", "closed", "closing"})


@dataclass(slots=True)
class Instelling:
    """Wat er op de kaart staat. Zie `instelling_uit`."""

    contact: str = ""
    bediening: str = ""
    minuten: int = STANDAARD_MINUTEN
    herhaal: int = STANDAARD_HERHAAL
    negeer: list[int] = field(default_factory=lambda: list(STANDAARD_NEGEER))
    # None: geen avondmelding.
    avond: str | None = STANDAARD_AVOND
    morgen: str = STANDAARD_MORGEN
    pad: str = ""
    naam: str = ""

    def vergelijkbaar(self) -> tuple[Any, ...]:
        return (self.contact, self.bediening, self.minuten, self.herhaal, tuple(self.negeer), self.avond, self.morgen, self.pad, self.naam)


def _getal(waarde: Any, standaard: int, laag: int, hoog: int) -> int:
    try:
        n = int(float(waarde))
    except (TypeError, ValueError):
        return standaard
    return max(laag, min(hoog, n))


def instelling_uit(kaart: dict[str, Any]) -> Instelling:
    """De instellingen uit een kaartconfig, met de standaard voor wat ontbreekt."""
    contact = kaart.get("garage_contact")
    bediening = kaart.get("garage_bediening")
    negeer: list[int] = []
    rauw = kaart.get("garage_negeer")
    for w in [rauw] if isinstance(rauw, (str, int, float)) else rauw or []:
        n = _getal(w, 0, 0, 7 * 24 * 60)
        if n > 0 and n not in negeer:
            negeer.append(n)
    if rauw is None:
        negeer = list(STANDAARD_NEGEER)
    negeer.sort()
    avond = None if kaart.get("garage_avond_aan") is False else (tijd_geldig(kaart.get("garage_avond")) or STANDAARD_AVOND)
    pad = str(kaart.get("garage_pad") or "").strip()
    return Instelling(
        contact=contact if isinstance(contact, str) and "." in contact else "",
        bediening=bediening if isinstance(bediening, str) and bediening.split(".")[0] in BEDIENING else "",
        minuten=_getal(kaart.get("garage_minuten"), STANDAARD_MINUTEN, 1, 24 * 60),
        # 0 is geen herinnering: alleen de eerste melding (en de avond).
        herhaal=_getal(kaart.get("garage_herhaal"), STANDAARD_HERHAAL, 0, 24 * 60),
        negeer=negeer,
        avond=avond,
        morgen=tijd_geldig(kaart.get("garage_morgen")) or STANDAARD_MORGEN,
        # Alleen een pad binnen Home Assistant: een melding opent geen adres van buiten.
        pad=pad if pad.startswith("/") and not pad.startswith("//") else "",
        naam=str(kaart.get("garage_naam") or "").strip(),
    )


def voor_persoon(inst: Instelling, keuze: dict[str, list[str]]) -> Instelling:
    """De instellingen van de kaart met wat deze persoon zelf koos erover (sinds 0.145.0).

    Een keuze die er niet is, of niet deugt, laat de waarde van de kaart staan.
    """

    def een(sleutel: str) -> str | None:
        waarden = keuze.get(sleutel)
        return str(waarden[0]) if isinstance(waarden, list) and waarden else None

    minuten, herhaal, avond = een(KEUZE_MINUTEN), een(KEUZE_HERHAAL), een(KEUZE_AVOND)
    return replace(
        inst,
        negeer=list(inst.negeer),
        minuten=_getal(minuten, inst.minuten, 1, 24 * 60) if minuten is not None else inst.minuten,
        herhaal=_getal(herhaal, inst.herhaal, 0, 24 * 60) if herhaal is not None else inst.herhaal,
        avond=inst.avond if avond is None else None if avond == AVOND_UIT else (tijd_geldig(avond) or inst.avond),
    )


def is_open(toestand: str | None) -> bool | None:
    """True open, False dicht, None onbekend (`unavailable`, een herstart)."""
    if toestand in OPEN:
        return True
    if toestand in DICHT:
        return False
    return None


def bediening_oproep(bediening: str) -> tuple[str, str, dict[str, Any]] | None:
    """De dienst die de deur laat bewegen, of None."""
    domein = bediening.split(".")[0] if bediening else ""
    if domein not in BEDIENING:
        return None
    d, s = BEDIENING[domein]
    return d, s, {"entity_id": bediening}


def _moment(dag: date, klok: str, tz: Any) -> datetime:
    uur, minuut = (int(x) for x in klok.split(":"))
    return datetime(dag.year, dag.month, dag.day, uur, minuut, tzinfo=tz)


def morgen_moment(nu: datetime, morgen: str) -> datetime:
    """Het eerstvolgende `morgen` na nu: vanavond om 22:00 is dat morgen 07:00."""
    vandaag = _moment(nu.date(), morgen, nu.tzinfo)
    return vandaag if vandaag > nu else _moment(nu.date() + timedelta(days=1), morgen, nu.tzinfo)


def _tijd(waarde: Any) -> datetime | None:
    try:
        return datetime.fromisoformat(str(waarde)) if waarde else None
    except ValueError:
        return None


def volgende(stand: dict[str, Any], inst: Instelling, nu: datetime, open_: bool) -> str | None:
    """Welke melding er NU uit moet, of None. Zie de kop van dit bestand.

    De motor vraagt dit elke minuut. `stand` is wat er in de opslag staat.
    """
    sinds = _tijd(stand.get("open_sinds"))
    if not open_ or sinds is None:
        return None
    gemeld = _tijd(stand.get("gemeld"))
    negeer_tot = _tijd(stand.get("negeer_tot"))

    # De avond gaat voor alles, ook voor negeren. Alleen als hij om die tijd al
    # open stond: wie om 23:00 opendoet, krijgt gewoon na vijf minuten een melding.
    if inst.avond:
        avond = _moment(nu.date(), inst.avond, nu.tzinfo)
        if nu >= avond and sinds <= avond and stand.get("avond_gemeld") != nu.date().isoformat():
            return "avond"

    if negeer_tot is not None:
        if nu < negeer_tot:
            return None
        # Wie voor het negeren nog geen melding had, gaat verder met zijn eerste.
        if gemeld is not None:
            return "na_negeer"
    if gemeld is None:
        return "eerste" if nu - sinds >= timedelta(minutes=inst.minuten) else None
    if inst.herhaal and nu - gemeld >= timedelta(minutes=inst.herhaal):
        return "herinner"
    return None


def duur(minuten: int, taal: str) -> str:
    """"5 minuten", "1 uur", "1 uur en 5 minuten", "3 uur"."""
    uren, rest = divmod(max(0, int(minuten)), 60)
    m = vertaal(taal, "1 minuut") if rest == 1 else vertaal(taal, "{n} minuten", n=rest)
    if not uren:
        return m
    u = vertaal(taal, "1 uur") if uren == 1 else vertaal(taal, "{n} uur", n=uren)
    return u if not rest else vertaal(taal, "{uur} en {minuten}", uur=u, minuten=m)


def negeer_label(minuten: int, taal: str) -> str:
    """De knop: "Negeer 15 min", "Negeer 1 uur"."""
    uren, rest = divmod(minuten, 60)
    if uren == 1 and not rest:
        return vertaal(taal, "Negeer 1 uur")
    if uren and not rest:
        return vertaal(taal, "Negeer {n} uur", n=uren)
    return vertaal(taal, "Negeer {n} min", n=minuten)


def bericht(wat: str, naam: str, open_minuten: int, taal: str, klok: str = "") -> tuple[str, str]:
    """Titel en tekst van de melding."""
    titel = naam or vertaal(taal, "Garagedeur")
    if wat == "niet_dicht":
        return titel, vertaal(taal, "De garagedeur is niet dichtgegaan. Hij staat nog open.")
    if wat == "avond":
        return titel, vertaal(taal, "Het is {klok} en de garagedeur staat nog open.", klok=klok)
    return titel, vertaal(taal, "De garagedeur staat al {duur} open.", duur=duur(open_minuten, taal))


def actie_voor(ident: str, cmd: str, arg: str | int = "") -> str:
    return f"{ACTIE_GARAGE}|{ident}|{cmd}|{arg}"


def lees_actie(actie: Any) -> tuple[str, str, str] | None:
    """(melding, opdracht, argument) uit het id van de knop, of None als het niet de onze is."""
    delen = str(actie or "").split("|")
    if len(delen) != 4 or delen[0] != ACTIE_GARAGE or not delen[1] or delen[2] not in (CMD_SLUIT, CMD_NEGEER, CMD_MORGEN):
        return None
    return delen[1], delen[2], delen[3]


def knoppen(ident: str, inst: Instelling, wat: str, taal: str, *, android: bool = False, proef: bool = False) -> list[dict[str, str]]:
    """De knoppen in de melding. Bij de avond: Sluiten en "Tot morgen".

    Op Android passen er drie; de langere tijden staan dan in de pop-up van de
    kaart. Een proef krijgt knoppen die niets doen (`proef` als melding).
    """
    eigen = "proef" if proef else ident
    uit: list[dict[str, str]] = []
    if inst.bediening:
        uit.append({"action": actie_voor(eigen, CMD_SLUIT), "title": vertaal(taal, "Deur sluiten")})
    if wat == "avond":
        uit.append({"action": actie_voor(eigen, CMD_MORGEN), "title": vertaal(taal, "Tot morgen {klok}", klok=inst.morgen)})
    for n in inst.negeer:
        uit.append({"action": actie_voor(eigen, CMD_NEGEER, n), "title": negeer_label(n, taal)})
    return uit[:ANDROID_KNOPPEN] if android else uit


# Zinnen die alleen in een tabel staan; zo vindt de vertaaltoets ze.
_ = (nt("Garagedeur"),)
