"""De taal van wat de SERVER naar mensen stuurt (0.81.0).

De kaarten vertalen zichzelf (`src/taal.js`, zie `docs/taal.md`). Maar een paar
zinnen maakt de integratie zelf: de afvalmelding op de telefoon, de tekst van de
wekker op de kaart en in de meldingenlijst van Home Assistant, de regel "Morgen
07:00" onder de wekkers, en de fouten bij het boeken van een ruimte op het
infoscherm. Die volgen dezelfde keuze als de kaarten: Configureren, Uiterlijk,
Taal (`CONF_TAAL`, door de lader vastgelegd in `hass.data[DOMAIN][DATA_TAAL]`).

De manier van werken komt van DomotiApp Coach (`taal.py` daar), zodat er één
manier is. Het Nederlands blijft in de bron staan en is de sleutel:
`t(hass, "Vandaag al verstuurd")`. In het Engels zoekt `t` de zin op in de
JSON-bestanden in `engels/`; wat daar niet staat blijft Nederlands. Een waarde
gaat tussen accolades: `t(hass, "Morgen {wat}", wat=namen)`. Zo blijft elke
toets die Nederlandse tekst narekent gelden.

Een zuivere functie zonder `hass` (afval.py, de wekkerteksten) krijgt de taal
als argument en gebruikt `vertaal(taal, ...)`. Een tabel die bij het laden van
een module al bestaat, markeert zijn Nederlands met `nt(...)` en vertaalt waar
hij gebruikt wordt.

De JSON wordt bij het IMPORTEREN gelezen, niet bij de eerste zin: Home
Assistant importeert een eigen integratie in een executor, en een `open` in de
event loop is blokkerende I/O.
"""

from __future__ import annotations

import json
import pathlib
import re
from typing import Any

from .const import DATA_TAAL, DOMAIN

ENGELS = pathlib.Path(__file__).with_name("engels")

NL = "nl"
EN = "en"


def _lees_engels() -> dict[str, str]:
    """Alle JSON-bestanden in engels/ samen."""
    samen: dict[str, str] = {}
    for pad in sorted(ENGELS.glob("*.json")):
        samen.update(json.loads(pad.read_text(encoding="utf-8")))
    return samen


_EN: dict[str, str] = _lees_engels()


def taal_van(hass: Any) -> str:
    """"nl" of "en": de keuze bij de integratie, bij automatisch die van Home Assistant."""
    keuze = None
    data = getattr(hass, "data", None) or {}
    domein = data.get(DOMAIN)
    if isinstance(domein, dict):
        keuze = domein.get(DATA_TAAL)
    if keuze in (NL, EN):
        return keuze
    taal = getattr(getattr(hass, "config", None), "language", None)
    return EN if str(taal or "").lower().startswith("en") else NL


def vertaal(taal: str, nl: str, **waarden: object) -> str:
    """Een zin in deze taal, met de waarden tussen accolades ingevuld."""
    zin = _EN.get(nl, nl) if taal == EN else nl
    if not waarden:
        return zin
    return re.sub(
        r"\{(\w+)\}",
        lambda m: str(waarden[m.group(1)]) if m.group(1) in waarden else m.group(0),
        zin,
    )


def t(hass: Any, nl: str, **waarden: object) -> str:
    """Een zin in de taal van deze installatie."""
    return vertaal(taal_van(hass), nl, **waarden)


def tn(hass: Any, n: float, een: str, meer: str, **waarden: object) -> str:
    """Enkelvoud of meervoud: `tn(hass, n, "{n} bak", "{n} bakken")`."""
    return t(hass, een if n == 1 else meer, n=n, **waarden)


def nt(nl: str) -> str:
    """Markeert Nederlands dat later vertaald wordt. Doet zelf niets."""
    return nl
