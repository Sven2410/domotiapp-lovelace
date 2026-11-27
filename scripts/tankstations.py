"""De tankstations van Nederland uit OpenStreetMap, voor de kaart op de brandstofkaart (sinds 0.144.0).

    python3 scripts/tankstations.py            # haalt op en schrijft custom_components/.../gegevens/tankstations-nl.json
    python3 scripts/tankstations.py osm.json   # leest een eerder opgehaald antwoord van Overpass

Dit draait een ONTWIKKELAAR, met de hand, bij een uitgave: niet de integratie bij een klant. De openbare Overpass-server
zegt zelf (27 november 2026, bij een volle wachtrij): "This public endpoint is intended for browser-based and
human-operated tools. For automated or high-volume use, run a local Overpass API instance". Elke Home Assistant die er
elke week om vraagt is precies dat automatische gebruik. Dus gaat er een momentopname mee in de integratie, en ververst
een volgende uitgave hem.

De gegevens zijn van de OpenStreetMap-bijdragers, onder de Open Database License (ODbL 1.0). Het bestand zegt dat zelf
(`bron`, `licentie`), en de kaart toont "© OpenStreetMap-bijdragers". Zie `gegevens/LEESMIJ.md`.

De vorm is compact, want de kaart haalt het hele bestand: per station een rij met
`[breedte, lengte, naam, merk, adres, postcode, plaats, openingstijden, brandstoffen]`. Brandstoffen zijn letters:
d diesel, 9 Euro95 (of E10), 8 98, l LPG, a AdBlue, c CNG.
"""

from __future__ import annotations

from datetime import date
import json
from pathlib import Path
import sys
import urllib.parse
import urllib.request

OVERPASS = "https://overpass-api.de/api/interpreter"
VRAAG = '[out:json][timeout:120];area["ISO3166-1"="NL"][admin_level=2]->.nl;nwr["amenity"="fuel"](area.nl);out center tags;'
UIT = Path(__file__).resolve().parent.parent / "custom_components" / "domotiapp_lovelace" / "gegevens" / "tankstations-nl.json"
VELDEN = ["breedte", "lengte", "naam", "merk", "adres", "postcode", "plaats", "open", "brandstoffen"]
BRANDSTOF = {"d": ("fuel:diesel",), "9": ("fuel:octane_95", "fuel:e10"), "8": ("fuel:octane_98",), "l": ("fuel:lpg",),
             "a": ("fuel:adblue",), "c": ("fuel:cng",)}


def haal() -> dict:
    data = urllib.parse.urlencode({"data": VRAAG}).encode()
    verzoek = urllib.request.Request(OVERPASS, data=data, headers={"User-Agent": "DomotiApp Lovelace, scripts/tankstations.py"})
    with urllib.request.urlopen(verzoek, timeout=180) as antwoord:
        return json.load(antwoord)


def station(el: dict) -> list | None:
    tags = el.get("tags") or {}
    plek = el.get("center") or el
    if "lat" not in plek or "lon" not in plek:
        return None
    # Alleen Europees Nederland: het gebied NL van OpenStreetMap neemt Caribisch Nederland mee (breedte 12).
    if not (50.6 < plek["lat"] < 53.8 and 3.2 < plek["lon"] < 7.3):
        return None
    # Een pomp die niet voor iedereen is (een bedrijfspomp), staat er niet op.
    if tags.get("access") in ("private", "no", "customers") or tags.get("disused:amenity") == "fuel":
        return None
    straat = " ".join(x for x in (tags.get("addr:street"), tags.get("addr:housenumber")) if x)
    merk = tags.get("brand") or ""
    naam = tags.get("name") or tags.get("branch") or merk
    soorten = "".join(k for k, sleutels in BRANDSTOF.items() if any(tags.get(s) == "yes" for s in sleutels))
    return [round(plek["lat"], 5), round(plek["lon"], 5), naam, merk, straat, tags.get("addr:postcode") or "",
            tags.get("addr:city") or "", tags.get("opening_hours") or "", soorten]


def maak(osm: dict) -> dict:
    stations = sorted(filter(None, (station(e) for e in osm.get("elements", []))), key=lambda s: (s[6], s[2], s[0]))
    return {
        "bron": "OpenStreetMap",
        "licentie": "ODbL 1.0, © OpenStreetMap-bijdragers, https://www.openstreetmap.org/copyright",
        "datum": (osm.get("osm3s", {}).get("timestamp_osm_base") or date.today().isoformat())[:10],
        "velden": VELDEN,
        "stations": stations,
    }


if __name__ == "__main__":
    osm = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8")) if len(sys.argv) > 1 else haal()
    uit = maak(osm)
    UIT.parent.mkdir(parents=True, exist_ok=True)
    UIT.write_text(json.dumps(uit, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"{len(uit['stations'])} tankstations van {uit['datum']} naar {UIT} ({UIT.stat().st_size} bytes)")
