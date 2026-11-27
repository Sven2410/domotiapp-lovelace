"""De tankstations voor de brandstofkaart (0.144.0). **NIEUW GEDRAG**: het script, het bestand en het adres bestaan op
0.143.0 niet.

`scripts/tankstations.py` draait een ontwikkelaar, niet de integratie bij een klant (zie de kop daar). Hier: wat het
van een echt antwoord van Overpass maakt, of het meegeleverde bestand klopt, en of de integratie het aanbiedt.
"""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path

from homeassistant.core import HomeAssistant

from .conftest import zet_integratie_op

ROOT = Path(__file__).parent.parent
STEEKPROEF = json.loads((ROOT / "tests/js/vaste-invoer/overpass-tankstations-steekproef.json").read_text(encoding="utf-8"))
BESTAND = ROOT / "custom_components/domotiapp_lovelace/gegevens/tankstations-nl.json"

_spec = importlib.util.spec_from_file_location("tankstations", ROOT / "scripts/tankstations.py")
script = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(script)


def test_wat_het_script_van_een_echt_antwoord_maakt() -> None:
    uit = script.maak(STEEKPROEF)
    assert uit["velden"] == ["breedte", "lengte", "naam", "merk", "adres", "postcode", "plaats", "open", "brandstoffen"]
    assert uit["licentie"].startswith("ODbL 1.0, © OpenStreetMap-bijdragers")
    namen = [s[2] for s in uit["stations"]]
    # De privépomp en die in Caribisch Nederland vallen af; een way telt met zijn midden; zonder naam of merk blijft hij.
    assert "Curoil Juan Domingo" not in namen and len(uit["stations"]) == 4
    tinq = next(s for s in uit["stations"] if s[3] == "TinQ")
    assert tinq[6] == "Utrecht" and tinq[4] == "Thoriumweg 2"
    shell = next(s for s in uit["stations"] if s[2] == "Shell Lange Amerikaweg")
    assert shell[7] == "24/7" and "l" in shell[8]


def test_het_meegeleverde_bestand() -> None:
    data = json.loads(BESTAND.read_text(encoding="utf-8"))
    assert data["bron"] == "OpenStreetMap" and "ODbL" in data["licentie"]
    stations = data["stations"]
    assert len(stations) > 3500
    assert all(len(s) == len(data["velden"]) for s in stations)
    # Alleen Europees Nederland.
    assert all(50.6 < s[0] < 53.8 and 3.2 < s[1] < 7.3 for s in stations)
    assert all(set(s[8]) <= set(script.BRANDSTOF) for s in stations)


async def test_de_integratie_biedt_het_aan_zonder_inloggen(hass: HomeAssistant, hass_client_no_auth) -> None:
    await zet_integratie_op(hass)
    client = await hass_client_no_auth()
    antwoord = await client.get("/domotiapp_lovelace/gegevens/tankstations-nl.json")
    assert antwoord.status == 200
    assert len((await antwoord.json())["stations"]) > 3500
    assert (await client.get("/domotiapp_lovelace/gegevens/../manifest.json")).status in (403, 404)
