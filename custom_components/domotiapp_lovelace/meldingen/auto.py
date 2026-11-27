"""Wat een auto meldt: de berichten van de fabrikant. Pure functies, zonder `hass`.

Gevraagd op 27 november 2026, via de beheersessie van de eigenaar: *"Ook om een notificatie te krijgen in HA
van de bus bijvoorbeeld. Dus bij woning instellingen en dan notificaties naast afval en camera ook van je bus
etc snap je?"* En meteen daarna: *"dat moet eigenlijk voor elke auto merk zijn dus we moeten het kunnen
uitbreiden voor merken etc"*.

## Per merk een regel in `MERKEN`

Elke auto-integratie zet zijn berichten anders neer. Het merk wordt herkend aan het `platform` van de gekozen
sensor in het entiteitenregister (FordPass: `fordpass`), niet aan een naam of een gok. Per merk staat er:

| veld | wat |
|---|---|
| `lees` | van de attributen van de sensor naar een lijst berichten: `sleutel`, `onderwerp`, `tekst`, `datum`, `gelezen` |
| `sensor` | de `translation_key` van de berichtensensor, zodat de editor hem kan voorstellen |
| `wis_knop` | de `translation_key` van de knop op hetzelfde apparaat die alles wist, of None |

Een volgend merk (Tesla, Volkswagen, Kia/Hyundai, BMW, Renault) is een functie `_lees_<merk>` en een regel hier,
met een echte dump als testinvoer. Hetzelfde staat in `MERKEN` van `src/cards/auto-berichten.js`; die twee horen
gelijk te blijven (`tests/js/auto-berichten.test.mjs`). Een sensor van een merk dat er niet in staat, meldt niets.

## FordPass (HACS, marq24 "fordpass 2025")

De dump staat in `tests/js/vaste-invoer/fordpass-berichten.json`. De sensor `..._messages`
(`translation_key: messages`) heeft het aantal als toestand, en de berichten twee keer in de attributen:

| vorm | wat erin staat | waar |
|---|---|---|
| `json_src` | een lijst met per bericht `messageSubject`, `messageBody`, `createdDate`, `isRead`, `messageId` en meer | alleen live: de recorder bewaart hem niet |
| `msg001_Date`, `_Type`, `_Subject`, `_Content`, ... | hetzelfde, plat | live en in de recorder |

Bij 0 berichten staat geen van beide er. Hier wordt `json_src` gelezen als hij er is, anders de platte vorm. De
sleutel van een bericht is in beide vormen gelijk (`createdDate` en het onderwerp, letterlijk), zodat een
toestand met en een zonder `json_src` dezelfde berichten noemen. `messageId` staat alleen in `json_src` en is
daarom geen sleutel. Hetzelfde onderwerp komt vaak terug (acht keer de bandenspanning); de datum maakt ze apart.

`createdDate` is "11/10/2026 06:50:04 AM": maand eerst, in UTC (volgens de beheersessie; niet nagemeten).
`contentType` is "Html"; de tekst gaat hier zonder tags door, want een melding op een telefoon is platte tekst.
De knop `button.*_msgdeleteall` (`translation_key: msgdeleteall`) wist ze bij Ford; beproefd: 8 naar 0 in 20 s.

## Laden klaar en accu laag (0.142.0)

De eigenaar, op de vraag of die erbij moesten: *"ja ook laden klaar en accu laag erbij"*. De sensoren staan op hetzelfde
apparaat als de berichten, met een `translation_key` per merk (`laden`, `stekker`, `accu` in `MERKEN`). De dump staat in
`tests/js/vaste-invoer/fordpass-laden.json`: drie dagen laadstatus, stekker en laadtoestand van een elektrische bus.

| wat de dump liet zien | wat het hier betekent |
|---|---|
| de laadstatus kent `NOT_PLUGGED_IN`, `IN_PROGRESS` en `PAUSED`; een woord voor vol kwam niet voor | een beurt tot het doel (80 %) eindigt met `PAUSED`, met de stekker erin |
| `PAUSED` komt ook vlak na het inpluggen, en 5,5 minuut tussendoor (de coach die stopt en start) | **laden klaar** pas als het `LADEN_WACHT` minuten niet laden blijft, met de stekker erin |
| bij het inpluggen sprong de laadtoestand van 35 naar 23, 34 s VOOR de stekker `CONNECTED` zei | **accu laag** pas als hij `ACCU_WACHT` minuten onder de grens blijft zonder stekker |
| elke ochtend om 07:00 en bij herladen staat alles een paar tellen op `unavailable` | `unavailable` verandert niets |

De stand (laadt hij, sinds wanneer gestopt, sinds wanneer laag, al gemeld) staat in de opslag, en de klok van elke minuut
kijkt of het tijd is: zo gaat een herstart midden in het wachten gewoon verder. Accu laag komt één keer, en pas weer
als de accu eerst `ACCU_MARGE` boven de grens is geweest.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime
import html
import re
from typing import Any

from ..taal import vertaal

# Na zoveel berichten tegelijk één melding met het aantal, in plaats van een rij meldingen op het scherm.
SAMEN_VANAF = 4

# Zoveel sleutels per sensor in de opslag; de oudste gaan eruit. Ford bewaart er minder.
GEZIEN_MAX = 200

_PLAT = re.compile(r"^msg(\d+)_(Date|Type|Subject|Content)$")
_DATUM = re.compile(r"^(\d{1,2})/(\d{1,2})/(\d{4}) (\d{1,2}):(\d{2}):(\d{2}) ?(AM|PM)$", re.I)
_TAG = re.compile(r"<[^>]+>")
_REGELEINDE = re.compile(r"<\s*(br|/p|/div|/li)\s*/?\s*>", re.I)


def bruikbaar(toestand: str | None) -> bool:
    """Zegt deze toestand iets? `unavailable` en `unknown` niet: dat is een herstart of een verbinding die hapert."""
    return toestand not in (None, "", "unavailable", "unknown")


def datum(tekst: Any) -> datetime | None:
    """"11/10/2026 06:50:04 AM" als moment in UTC, of None."""
    m = _DATUM.match(str(tekst or "").strip())
    if not m:
        return None
    maand, dag, jaar, uur, minuut, seconde, ampm = m.groups()
    uur_i = int(uur) % 12 + (12 if ampm.upper() == "PM" else 0)
    try:
        return datetime(int(jaar), int(maand), int(dag), uur_i, int(minuut), int(seconde), tzinfo=UTC)
    except ValueError:
        return None


def platte_tekst(tekst: Any) -> str:
    """De tekst zonder html: regeleindes blijven, tags gaan eruit, `&amp;` wordt `&`."""
    s = _REGELEINDE.sub("\n", str(tekst or ""))
    s = html.unescape(_TAG.sub("", s))
    return "\n".join(r.strip() for r in s.splitlines() if r.strip())


def sleutel(datum_tekst: Any, onderwerp: Any) -> str:
    return f"{str(datum_tekst or '').strip()}|{str(onderwerp or '').strip()}"


def _bericht(sleutel_: str, onderwerp: Any, tekst: Any, wanneer: datetime | None, gelezen: Any = None) -> dict[str, Any]:
    return {
        "sleutel": sleutel_,
        "onderwerp": str(onderwerp or "").strip(),
        "tekst": platte_tekst(tekst),
        "datum": wanneer,
        "gelezen": gelezen if isinstance(gelezen, bool) else None,
    }


def _lees_ford(attr: dict[str, Any]) -> list[dict[str, Any]]:
    lijst = attr.get("json_src")
    if isinstance(lijst, list) and lijst:
        return [
            _bericht(sleutel(b.get("createdDate"), b.get("messageSubject")), b.get("messageSubject"),
                     b.get("messageBody"), datum(b.get("createdDate")), b.get("isRead"))
            for b in lijst
            if isinstance(b, dict)
        ]
    per: dict[str, dict[str, Any]] = {}
    for k, v in attr.items():
        if m := _PLAT.match(k):
            per.setdefault(m.group(1), {})[m.group(2)] = v
    return [
        _bericht(sleutel(d.get("Date"), d.get("Subject")), d.get("Subject"), d.get("Content"), datum(d.get("Date")))
        for d in (per[nr] for nr in sorted(per, key=int))
    ]


@dataclass(frozen=True, slots=True)
class Merk:
    naam: str
    lees: Callable[[dict[str, Any]], list[dict[str, Any]]]
    sensor: str
    wis_knop: str | None = None
    # Op hetzelfde apparaat: de laadstatus, de stekker en de laadtoestand in %. None: dat merk meldt het niet.
    laden: str | None = None
    stekker: str | None = None
    accu: str | None = None


# Op `platform` uit het entiteitenregister. Zie de kop.
MERKEN: dict[str, Merk] = {
    "fordpass": Merk("Ford", _lees_ford, sensor="messages", wis_knop="msgdeleteall", laden="elvehcharging", stekker="elvehplug", accu="soc"),
}

# Waarover de auto meldt, in de volgorde van de editor. Dezelfde sleutels als `AUTO_GEBEURTENISSEN` op de kaart.
GEBEURTENISSEN = ("berichten", "laden", "accu")

LADEN_WACHT = 15  # minuten niet laden met de stekker erin, voordat het "klaar" is
ACCU_WACHT = 5  # minuten onder de grens zonder stekker
ACCU_GRENS = 20  # %, zoals de oranje balk op de autokaart
ACCU_MARGE = 5  # % boven de grens voordat er weer een melding kan komen

# De woorden van een laadstatus, zoals `laadStand` in auto-logica.js. IN_PROGRESS en PAUSED komen uit de dump van Ford.
_LAADT = {"charging", "charge", "fast_charging", "dc_charging", "in_progress", "on", "true", "laden"}
_KLAAR = {"complete", "completed", "fully_charged", "full", "done", "finished"}
_AAN = {"connected", "plugged", "plugged_in", "cable_connected", "ready_to_charge", "paused"}
_LOS = {"not_plugged_in", "not_plugged", "notpluggedin", "unplugged", "disconnected", "not_charging", "notcharging", "off", "false", "idle", "no"}


def laad_stand(toestand: str | None) -> str | None:
    """"laadt", "klaar", "aan" (aan de lader, niet ladend), "los", of None (niets te zeggen of een onbekend woord)."""
    if not bruikbaar(toestand):
        return None
    w = str(toestand).strip().lower()
    for stand, woorden in (("laadt", _LAADT), ("klaar", _KLAAR), ("aan", _AAN), ("los", _LOS)):
        if w in woorden:
            return stand
    return None


def stekker_erin(toestand: str | None) -> bool | None:
    """CONNECTED of DISCONNECTED (Ford), of None."""
    if not bruikbaar(toestand):
        return None
    w = str(toestand).strip().lower()
    if w in ("connected", "plugged", "plugged_in", "on", "true"):
        return True
    if w in ("disconnected", "not_plugged_in", "unplugged", "off", "false"):
        return False
    return None


def procent(toestand: str | None) -> float | None:
    try:
        n = float(toestand)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None
    return n if 0 <= n <= 100 else None


def laden_melding(auto: str, pct: float | None, taal: str) -> tuple[str, str]:
    titel = vertaal(taal, "{auto}: klaar met laden", auto=auto)
    if pct is None:
        return titel, vertaal(taal, "Hij laadt niet meer en de stekker zit er nog in.")
    return titel, vertaal(taal, "De accu staat op {pct}% en laadt niet meer. De stekker zit er nog in.", pct=round(pct))


def accu_melding(auto: str, pct: float, taal: str) -> tuple[str, str]:
    return vertaal(taal, "{auto}: accu laag", auto=auto), vertaal(taal, "De accu staat op {pct}%.", pct=round(pct))


def berichten(platform: str | None, toestand: str | None, attributen: dict[str, Any] | None) -> list[dict[str, Any]] | None:
    """De berichten in deze toestand, de nieuwste eerst. None als de sensor niets zegt of het merk onbekend is.

    Elk bericht: `sleutel`, `onderwerp`, `tekst`, `datum` (datetime of None), `gelezen` (None als het merk het
    niet zegt). Een aantal boven 0 zonder één leesbaar bericht is ook None: dan zijn de attributen er (nog)
    niet, en dat is iets anders dan geen berichten.
    """
    merk = MERKEN.get(platform or "")
    if merk is None or not bruikbaar(toestand):
        return None
    uit = merk.lees(attributen or {})
    try:
        aantal = float(toestand)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        aantal = None
    if not uit and aantal:
        return None
    oud = datetime.min.replace(tzinfo=UTC)
    uit.sort(key=lambda b: b["datum"] or oud, reverse=True)
    return uit


def melding(auto: str, nieuw: list[dict[str, Any]], taal: str) -> tuple[str, str]:
    """Titel en tekst voor nieuwe berichten: één bericht zoals het is, vanaf `SAMEN_VANAF` samen."""
    if len(nieuw) >= SAMEN_VANAF:
        return auto, vertaal(taal, "{n} nieuwe berichten. Het laatste: {onderwerp}", n=len(nieuw), onderwerp=nieuw[0]["onderwerp"])
    b = nieuw[0]
    if not b["tekst"]:
        return auto, b["onderwerp"]
    return f"{auto}: {b['onderwerp']}", b["tekst"]
