#!/usr/bin/env python3
"""Zet onze iconen om naar gevulde paden, voor overal waar Home Assistant zelf een icoon tekent.

Home Assistant kan een eigen iconenset tekenen (`dai:bed` in `ha-icon`, bijvoorbeeld in de kop van een
Bubble Card-pop-up), maar `ha-svg-icon` kent alleen een gevulde vorm. Onze tekeningen zijn lijnen van 1.6.
Dit script maakt van elke lijn de omtrek, en schrijft `afbeeldingen/iconen.json`. De lader leest dat bestand.

Na een nieuw of gewijzigd icoon opnieuw draaien; `tests/js/iconen-paden.test.mjs` valt anders om:

    python3 -m venv /tmp/v && /tmp/v/bin/pip install shapely svgelements
    /tmp/v/bin/python scripts/iconen-naar-paden.py

Niet in CI en niet bij de klant: het bestand wordt meegecommit, net als de bundel.
"""

from __future__ import annotations

import hashlib
import io
import json
import math
import subprocess
from pathlib import Path as Pad

from shapely import LinearRing, LineString, Point, Polygon
from shapely.geometry.polygon import orient
from shapely.ops import unary_union
from svgelements import SVG, Close, Line, Move, Path, Shape

REPO = Pad(__file__).resolve().parent.parent
UIT = REPO / "custom_components" / "domotiapp_lovelace" / "afbeeldingen" / "iconen.json"

# Een stap over een bocht en de afwijking die mag, op het raster van 24. Op 48 px is 0,015 een derde van een
# beeldpunt op zijn hoogst: niet te zien, en het bestand wordt er de helft kleiner van.
STAP = 0.25
AFWIJKING = 0.015

DUMP = """
import { icons } from "./src/icons.js";
import { TERMEN } from "./src/editor/icoon-zoek.js";
console.log(JSON.stringify({ icons, TERMEN }));
"""


def _punten(sub: Path) -> tuple[list[tuple[float, float]], bool]:
    """Een deelpad als lijn van punten, en of het gesloten is."""
    uit: list[tuple[float, float]] = []
    dicht = False
    for stuk in sub:
        if isinstance(stuk, Move):
            uit.append((stuk.end.x, stuk.end.y))
        elif isinstance(stuk, Close):
            dicht = True
        elif isinstance(stuk, Line):
            uit.append((stuk.end.x, stuk.end.y))
        else:
            n = max(4, math.ceil(stuk.length() / STAP))
            for i in range(1, n + 1):
                p = stuk.point(i / n)
                uit.append((p.x, p.y))
    return uit, dicht


def _lijn(punten: list[tuple[float, float]], dicht: bool, breedte: float):
    """De omtrek van een lijn, met ronde uiteinden en hoeken."""
    r = breedte / 2
    uniek = list(dict.fromkeys(punten))
    if len(uniek) < 2:
        # Een punt: `M12 12h0` is een rond stipje.
        return Point(punten[0]).buffer(r, quad_segs=6)
    vorm = LinearRing(punten) if dicht and len(uniek) >= 3 else LineString(punten)
    return vorm.buffer(r, quad_segs=6, cap_style="round", join_style="round")


def _getal(n: float) -> str:
    """Zo kort mogelijk: 0.50 wordt .5, -0.5 wordt -.5."""
    tekst = f"{n:.2f}".rstrip("0").rstrip(".")
    if tekst in ("-0", ""):
        return "0"
    if tekst.startswith("0."):
        return tekst[1:]
    if tekst.startswith("-0."):
        return "-" + tekst[2:]
    return tekst


def _paar(a: float, b: float) -> str:
    x, y = _getal(a), _getal(b)
    return f"{x}{y}" if y.startswith("-") else f"{x} {y}"


def _ring(ring) -> str:
    punten = [(round(x, 2), round(y, 2)) for x, y in ring.coords]
    d = "M" + _paar(*punten[0]) + "l"
    stukken: list[str] = []
    for (x0, y0), (x1, y1) in zip(punten, punten[1:]):
        if (x0, y0) == (x1, y1):
            continue
        stukken.append(_paar(x1 - x0, y1 - y0))
    regel = ""
    for stuk in stukken:
        # Een negatief getal of een punt scheidt zichzelf van het vorige.
        regel += stuk if not regel or stuk[0] == "-" else " " + stuk
    return d + regel + "z"


def _pad(vorm) -> str:
    # Buitenrand en gaten andersom gedraaid: ha-svg-icon vult met nonzero.
    delen = vorm.geoms if hasattr(vorm, "geoms") else [vorm]
    uit = []
    for deel in delen:
        if deel.is_empty or deel.geom_type != "Polygon":
            continue
        goed = orient(deel, sign=1.0)
        uit.append(_ring(goed.exterior))
        uit.extend(_ring(gat) for gat in goed.interiors)
    return "".join(uit)


def vorm_van(svg_tekst: str):
    """De tekening als één vorm: op volgorde, want een vlak in de achtergrondkleur haalt weg wat eronder ligt."""
    svg = SVG.parse(io.StringIO(svg_tekst))
    breedte_kop = float(svg.values.get("stroke-width", 1.6))
    vorm = Polygon()
    for e in svg.elements():
        if not isinstance(e, Shape) or isinstance(e, SVG):
            continue
        waarden = e.values
        vulling = waarden.get("fill", "none")
        lijn = waarden.get("stroke", "none")
        breedte = float(waarden.get("stroke-width", breedte_kop))
        pad = abs(Path(e))
        delen = [_punten(sub) for sub in pad.as_subpaths()]
        delen = [(p, d) for p, d in delen if p]
        if vulling and vulling != "none":
            vlak = unary_union([Polygon(p).buffer(0) for p, _ in delen if len(p) >= 3])
            vorm = vorm.difference(vlak) if vulling.startswith("var(") else vorm.union(vlak)
        if lijn and lijn != "none":
            vorm = vorm.union(unary_union([_lijn(p, d, breedte) for p, d in delen]))
    return vorm.simplify(AFWIJKING, preserve_topology=True)


def main() -> None:
    bron = json.loads(
        subprocess.run(
            ["node", "--input-type=module", "-e", DUMP], cwd=REPO, capture_output=True, text=True, check=True
        ).stdout
    )
    uit = {}
    for naam, tekening in sorted(bron["icons"].items()):
        # Het logo is een plaatje, en dat kan ha-icon niet.
        if not tekening.startswith("<svg"):
            continue
        uit[naam] = {
            "h": hashlib.sha1(tekening.encode()).hexdigest()[:10],
            "d": _pad(vorm_van(tekening)),
            "w": bron["TERMEN"].get(naam, []),
        }
    UIT.write_text(json.dumps(uit, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
    print(f"{len(uit)} iconen, {UIT.stat().st_size} bytes")


if __name__ == "__main__":
    main()
