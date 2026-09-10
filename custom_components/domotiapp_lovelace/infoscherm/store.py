"""De opslag van het infoscherm: praktijk, personen, mededelingen, nieuws,
scherm, installatie, indeling, instellingen en de lijst van bestanden.

Eén `Store`, want alles hier verandert alleen als iemand in het beheer iets
wijzigt of op de iPad op een naam tikt. Dat is een handvol keren per dag.

Zelfde lijn als `../store.py` en `bewaking/store.py`: **valideren is niet
hetzelfde als parsen.** Wat de beheerkaart stuurt wordt streng nagekeken en bij
een fout in zijn geheel geweigerd, met uitleg. Wat bij het lezen niet deugt
wordt per onderdeel overgeslagen met een logregel, en sleept de rest niet mee:
een kapot nieuwsbericht mag de personenlijst niet leegmaken.

De beheerkaart stuurt per onderdeel de HELE lijst (alle personen, alle
berichten). Dat is bewust simpel: er is één receptie, en een lijst van
tweehonderd namen is nog altijd kleiner dan één foto.

## Sinds ronde 2 (10 september 2026): de inhoud staat hier, niet in de kaart

- `scherm`: wat de receptie over het uiterlijk beslist (logo, accent, licht of
  donker, terugvaltijd, hoe de aanwezigen staan, wat er in het welkomblok
  staat, hoe snel de mededelingen wisselen);
- `installatie`: de entiteiten (weer, energie, lampen, agenda's). Sinds ronde 3 kiest
  de installateur die in de KAARTEDITOR van het infoscherm; de kaart stuurt ze
  hierheen (`async_zet_installatie_van_kaart`) zodat het beheer de lampen kent
  en de receptie hun NAMEN kan wijzigen. Het blok Installatie in het beheer is
  weg: *"installatie helemaal weg, dat moet ik via de GUI editor doen."*
- `indeling`: welke blokken er op het welkomscherm staan, waar, hoe groot en
  met hoeveel items. De receptie sleept ze in het beheer.
- `verjaardagen`: naam en geboortedatum, voor het blok Verjaardagen (ronde 3).

## Wat er in ronde 3 (10 september 2026) uit is gegaan

De nachtstand, de middernachtregel ("iedereen op afwezig"), de schakelaar voor
afbeeldingen bij het nieuws, en het eigen nieuws van het pand: *"Nieuws van het
pand mag helemaal weg, dat moet gewoon mededelingen worden."* Oude berichten
worden bij het laden eenmalig mededelingen (`async_load`); de sleutel `nieuws`
in de opslag wordt daarna niet meer gelezen. Van `praktijk` blijven alleen de
openingstijden en de uitzonderingen over; naam, adres en welkomsteksten zijn
weg (de welkomsttekst verhuist naar `scherm.welkom_tekst`).

Het logo en het accent stonden tot 0.36.0 in `praktijk`; bij het laden
verhuizen ze eenmalig naar `scherm` (zie `async_load`).
"""

from __future__ import annotations

from datetime import date, datetime
import logging
import re
from typing import Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util
from homeassistant.util.ulid import ulid_now

from .bestanden import SOORTEN, is_geldig_id
from .const import (
    AANWEZIG_WEERGAVEN,
    BLOK_SOORTEN,
    DAGEN,
    KOLOMMEN,
    MAX_AGENDAS,
    MAX_BESTANDEN,
    MAX_BLOKKEN,
    MAX_FEEDS,
    MAX_KORT,
    MAX_LAMPEN,
    MAX_LANG,
    MAX_MEDEDELINGEN,
    MAX_MIDDEL,
    MAX_PERSONEN,
    MAX_UITZONDERINGEN,
    MAX_VERJAARDAGEN,
    RIJEN,
    STORAGE_KEY,
    STORAGE_VERSION,
)

_LOGGER = logging.getLogger(__name__)

_HEX = re.compile(r"^#[0-9a-fA-F]{6}$")
_TIJD = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")
_ENTITEIT = re.compile(r"^[a-z_]+\.[a-z0-9_]+$")


class InfoFout(ValueError):
    """Wat er gestuurd is voldoet niet aan het schema."""


# --------------------------------------------------------------------------
# Bouwstenen
# --------------------------------------------------------------------------


def _tekst(rauw: Any, veld: str, maximum: int, verplicht: bool = False) -> str:
    if rauw is None:
        rauw = ""
    if not isinstance(rauw, str):
        raise InfoFout(f"'{veld}' moet tekst zijn")
    waarde = rauw.strip()
    if verplicht and not waarde:
        raise InfoFout(f"'{veld}' mag niet leeg zijn")
    if len(waarde) > maximum:
        raise InfoFout(f"'{veld}' mag hoogstens {maximum} tekens lang zijn")
    return waarde


def _datum(rauw: Any, veld: str) -> str | None:
    """Een datum als `JJJJ-MM-DD`, of None. Een lege tekst telt als None."""
    if rauw is None or rauw == "":
        return None
    if not isinstance(rauw, str):
        raise InfoFout(f"'{veld}' moet een datum zijn, zoals 2026-09-20")
    try:
        return date.fromisoformat(rauw[:10]).isoformat()
    except ValueError:
        raise InfoFout(f"'{veld}' moet een datum zijn, zoals 2026-09-20") from None


def _tijd(rauw: Any, veld: str) -> str:
    if not isinstance(rauw, str) or not _TIJD.match(rauw):
        raise InfoFout(f"'{veld}' moet een tijd zijn, zoals 08:30")
    return rauw


def _datum_tijd(rauw: Any, veld: str) -> str | None:
    """Een datum met of zonder tijd: `2026-09-20` of `2026-09-20T12:00`.

    Sinds ronde 3 mag een mededeling op een TIJDSTIP ingaan of aflopen
    ("vanaf 12:00 gesloten"): *"nu heb je alleen de datum."* Een kale datum
    blijft toegestaan en betekent de hele dag.
    """
    if rauw is None or rauw == "":
        return None
    if not isinstance(rauw, str):
        raise InfoFout(f"'{veld}' moet een datum zijn, zoals 2026-09-20 of 2026-09-20T12:00")
    datum = _datum(rauw[:10], veld)
    rest = rauw[10:]
    if not rest:
        return datum
    if rest[0] not in "T " or not _TIJD.match(rest[1:6]):
        raise InfoFout(f"'{veld}' moet een datum zijn, zoals 2026-09-20 of 2026-09-20T12:00")
    return f"{datum}T{rest[1:6]}"


def _bestand_id(rauw: Any, veld: str) -> str | None:
    if rauw is None or rauw == "":
        return None
    if not is_geldig_id(rauw):
        raise InfoFout(f"'{veld}' wijst niet naar een geüpload bestand")
    return rauw


def _id(rauw: Any) -> str:
    """Het ID van een lijstitem. Nieuw als het er niet is; anders zoals het was.

    Het ID komt van de server bij de eerste keer opslaan en blijft daarna
    staan, zodat een foto of een aanwezigheid aan een persoon blijft hangen
    als zijn naam verandert.
    """
    if isinstance(rauw, str) and 1 <= len(rauw) <= 40 and rauw.isalnum():
        return rauw
    return ulid_now()


def _lijst(rauw: Any, veld: str, maximum: int) -> list:
    if rauw is None:
        return []
    if not isinstance(rauw, list):
        raise InfoFout(f"'{veld}' is een lijst")
    if len(rauw) > maximum:
        raise InfoFout(f"'{veld}' mag hoogstens {maximum} items hebben")
    return rauw


def _uniek(items: list[dict[str, Any]], veld: str) -> list[dict[str, Any]]:
    """Twee items met hetzelfde ID zouden elkaar bij het tikken overschrijven."""
    gezien: set[str] = set()
    uit = []
    for item in items:
        if item["id"] in gezien:
            item = {**item, "id": ulid_now()}
        gezien.add(item["id"])
        uit.append(item)
    return uit


def _getal(rauw: Any, veld: str, laag: float, hoog: float, standaard: float) -> float:
    if rauw is None or rauw == "":
        return standaard
    if isinstance(rauw, bool) or not isinstance(rauw, (int, float)):
        try:
            rauw = float(rauw)
        except (TypeError, ValueError):
            raise InfoFout(f"'{veld}' moet een getal zijn") from None
    if not laag <= rauw <= hoog:
        raise InfoFout(f"'{veld}' ligt tussen {laag:g} en {hoog:g}")
    return rauw


def _keuze(rauw: Any, veld: str, opties: tuple[str, ...], standaard: str) -> str:
    if rauw is None or rauw == "":
        return standaard
    if rauw not in opties:
        raise InfoFout(f"'{veld}' is een van: {', '.join(opties)}")
    return rauw


def _entiteit(rauw: Any, veld: str, domeinen: tuple[str, ...]) -> str:
    if not isinstance(rauw, str) or not _ENTITEIT.match(rauw):
        raise InfoFout(f"'{veld}' moet een entiteit zijn, zoals {domeinen[0]}.woonkamer")
    if rauw.split(".", 1)[0] not in domeinen:
        raise InfoFout(f"'{veld}' moet een {' of '.join(domeinen)}-entiteit zijn")
    return rauw


def initialen(naam: str) -> str:
    """'Dennis van den dam' -> 'DD', 'Sven Kool' -> 'SK'.

    De eerste letter van het EERSTE woord en de eerste letter van het LAATSTE
    woord, hoofdletter of niet. Tot 0.36.0 telden alleen woorden met een
    hoofdletter mee, en dan werd een naam met een tussenvoegsel in kleine
    letters ('van den dam') gewoon 'DE'. Gemeld op 10 september 2026.
    """
    delen = naam.split()
    if not delen:
        return "?"
    if len(delen) == 1:
        return delen[0][:2].upper()
    return (delen[0][0] + delen[-1][0]).upper()


# --------------------------------------------------------------------------
# Personen
# --------------------------------------------------------------------------


def valideer_persoon(rauw: Any) -> dict[str, Any]:
    if not isinstance(rauw, dict):
        raise InfoFout("een persoon is een object")
    naam = _tekst(rauw.get("naam"), "naam", MAX_KORT, verplicht=True)
    return {
        "id": _id(rauw.get("id")),
        "naam": naam,
        "functie": _tekst(rauw.get("functie"), "functie", MAX_KORT),
        "foto": _bestand_id(rauw.get("foto"), "foto"),
        "aanwezig": bool(rauw.get("aanwezig", False)),
        "initialen": initialen(naam),
    }


def valideer_personen(rauw: Any) -> list[dict[str, Any]]:
    return _uniek([valideer_persoon(p) for p in _lijst(rauw, "personen", MAX_PERSONEN)], "personen")


# --------------------------------------------------------------------------
# Mededelingen en nieuws
# --------------------------------------------------------------------------


def valideer_mededeling(rauw: Any) -> dict[str, Any]:
    if not isinstance(rauw, dict):
        raise InfoFout("een mededeling is een object")
    return {
        "id": _id(rauw.get("id")),
        "tekst": _tekst(rauw.get("tekst"), "tekst", MAX_LANG, verplicht=True),
        "van": _datum_tijd(rauw.get("van"), "van"),
        "tot": _datum_tijd(rauw.get("tot"), "tot"),
    }


def valideer_mededelingen(rauw: Any) -> list[dict[str, Any]]:
    return _uniek(
        [valideer_mededeling(m) for m in _lijst(rauw, "mededelingen", MAX_MEDEDELINGEN)],
        "mededelingen",
    )


def nieuws_naar_mededeling(rauw: Any) -> dict[str, Any] | None:
    """Een bericht van het pand uit een opslag van vóór ronde 3 als mededeling.

    De titel wordt de eerste regel, de tekst komt eronder. De afbeelding gaat
    verloren: een mededeling heeft er geen. None als er niets bruikbaars in
    staat.
    """
    if not isinstance(rauw, dict):
        return None
    titel = rauw.get("titel") if isinstance(rauw.get("titel"), str) else ""
    tekst = rauw.get("tekst") if isinstance(rauw.get("tekst"), str) else ""
    samen = "\n".join(r for r in (titel.strip(), tekst.strip()) if r)
    if not samen:
        return None
    try:
        return valideer_mededeling(
            {"id": rauw.get("id"), "tekst": samen[:MAX_LANG], "van": rauw.get("van"), "tot": rauw.get("tot")}
        )
    except InfoFout:
        return None


# --------------------------------------------------------------------------
# Verjaardagen
# --------------------------------------------------------------------------


def valideer_verjaardag(rauw: Any) -> dict[str, Any]:
    """Naam en geboortedatum. Iedereen mag erin, niet alleen medewerkers:
    *"een verjaardagskalender dat beheer iedereen kan toevoegen met de
    geboortedatum."* Het jaar mag ontbreken (dan geen leeftijd op het scherm)."""
    if not isinstance(rauw, dict):
        raise InfoFout("een verjaardag is een object")
    datum = _datum(rauw.get("datum"), "datum")
    if datum is None:
        raise InfoFout("een verjaardag heeft een datum")
    return {
        "id": _id(rauw.get("id")),
        "naam": _tekst(rauw.get("naam"), "naam", MAX_KORT, verplicht=True),
        "datum": datum,
        "jaar_tonen": bool(rauw.get("jaar_tonen", True)),
    }


def valideer_verjaardagen(rauw: Any) -> list[dict[str, Any]]:
    return _uniek(
        [valideer_verjaardag(v) for v in _lijst(rauw, "verjaardagen", MAX_VERJAARDAGEN)],
        "verjaardagen",
    )


# --------------------------------------------------------------------------
# Praktijk
# --------------------------------------------------------------------------


def valideer_tijdvakken(rauw: Any, veld: str) -> list[list[str]]:
    """Hoogstens twee vakken per dag: [["08:00","12:30"],["13:30","17:00"]]."""
    vakken = _lijst(rauw, veld, 2)
    uit = []
    for vak in vakken:
        if not isinstance(vak, (list, tuple)) or len(vak) != 2:
            raise InfoFout(f"'{veld}' bestaat uit paren van een open- en een sluittijd")
        open_, dicht = _tijd(vak[0], veld), _tijd(vak[1], veld)
        if open_ >= dicht:
            raise InfoFout(f"'{veld}': {open_} ligt niet vóór {dicht}")
        uit.append([open_, dicht])
    return uit


def valideer_openingstijden(rauw: Any) -> dict[str, list[list[str]]]:
    if rauw is None:
        rauw = {}
    if not isinstance(rauw, dict):
        raise InfoFout("'openingstijden' is een object per dag (ma, di, ...)")
    return {dag: valideer_tijdvakken(rauw.get(dag), f"openingstijden.{dag}") for dag in DAGEN}


def valideer_uitzondering(rauw: Any) -> dict[str, Any]:
    if not isinstance(rauw, dict):
        raise InfoFout("een uitzondering is een object")
    datum = _datum(rauw.get("datum"), "datum")
    if datum is None:
        raise InfoFout("een uitzondering heeft een datum")
    return {
        "datum": datum,
        "tijden": valideer_tijdvakken(rauw.get("tijden"), "tijden"),
        "reden": _tekst(rauw.get("reden"), "reden", MAX_KORT),
    }


def leeg_praktijk() -> dict[str, Any]:
    return {
        "openingstijden": {dag: [] for dag in DAGEN},
        "uitzonderingen": [],
    }


def valideer_praktijk(rauw: Any) -> dict[str, Any]:
    """De openingstijden en de afwijkende dagen. Meer niet.

    Naam, adres en welkomsteksten stonden hier tot ronde 3; de eigenaar:
    *"Praktijk en openingstijden veranderen in openingstijden. Naam, adres en
    welkomsteksten weg."* Staan ze nog in wat er gestuurd wordt (oude opslag,
    oude kaart), dan worden ze genegeerd en niet geweigerd. Net als `logo` en
    `accent`, die sinds ronde 2 bij `scherm` horen.
    """
    if not isinstance(rauw, dict):
        raise InfoFout("'praktijk' is een object")
    uitzonderingen = [
        valideer_uitzondering(u)
        for u in _lijst(rauw.get("uitzonderingen"), "uitzonderingen", MAX_UITZONDERINGEN)
    ]
    uitzonderingen.sort(key=lambda u: u["datum"])
    return {
        "openingstijden": valideer_openingstijden(rauw.get("openingstijden")),
        "uitzonderingen": uitzonderingen,
    }


# --------------------------------------------------------------------------
# Scherm: wat de receptie over het uiterlijk beslist
# --------------------------------------------------------------------------


def leeg_scherm() -> dict[str, Any]:
    return {
        "logo": None,
        "accent": None,
        "uiterlijk": "donker",
        "foto_vorm": "rond",
        "terug_na": 60,
        "aanwezig_weergave": "gescheiden",
        "aanwezig_teller": True,
        "weer_animatie": True,
        "schaal": 1.0,
        "mededeling_interval": 10,
        "welkom_tekst": "Welkom",
        "logo_verbergen": False,
        "welkom_onder": True,
    }


def valideer_scherm(rauw: Any) -> dict[str, Any]:
    if rauw is None:
        rauw = {}
    if not isinstance(rauw, dict):
        raise InfoFout("'scherm' is een object")
    accent = rauw.get("accent") or None
    if accent is not None and not (isinstance(accent, str) and _HEX.match(accent)):
        raise InfoFout("'accent' is een kleur als #026fa1")
    standaard = leeg_scherm()
    return {
        "logo": _bestand_id(rauw.get("logo"), "logo"),
        "accent": accent.lower() if accent else None,
        "uiterlijk": _keuze(rauw.get("uiterlijk"), "uiterlijk", ("donker", "licht"), "donker"),
        "foto_vorm": _keuze(rauw.get("foto_vorm"), "foto_vorm", ("rond", "vierkant"), "rond"),
        "terug_na": int(_getal(rauw.get("terug_na"), "terug_na", 0, 3600, standaard["terug_na"])),
        "aanwezig_weergave": _keuze(
            rauw.get("aanwezig_weergave"), "aanwezig_weergave", AANWEZIG_WEERGAVEN, "gescheiden"
        ),
        "aanwezig_teller": bool(rauw.get("aanwezig_teller", True)),
        "weer_animatie": bool(rauw.get("weer_animatie", True)),
        "schaal": float(_getal(rauw.get("schaal"), "schaal", 0.5, 2, 1.0)),
        # Hoe lang één mededeling blijft staan voordat de volgende erin
        # schuift. Minstens drie seconden, anders is het geen lezen meer.
        "mededeling_interval": int(
            _getal(rauw.get("mededeling_interval"), "mededeling_interval", 3, 600, standaard["mededeling_interval"])
        ),
        # Het welkomblok: de tekst (leeg = geen tekst), het logo erin, en de
        # regel met "Vandaag geopend tot 17:00" eronder.
        "welkom_tekst": _tekst(
            rauw.get("welkom_tekst", standaard["welkom_tekst"]), "welkom_tekst", MAX_KORT
        ),
        # Ronde 4: het logo staat standaard in het welkomblok (er is geen kop
        # meer); de oude sleutel welkom_logo (standaard False) vervalt.
        "logo_verbergen": bool(rauw.get("logo_verbergen", False)),
        "welkom_onder": bool(rauw.get("welkom_onder", True)),
    }


# --------------------------------------------------------------------------
# Installatie: de entiteiten die de installateur kiest
# --------------------------------------------------------------------------


def leeg_installatie() -> dict[str, Any]:
    return {"weer": None, "energie": None, "agendas": [], "verlichting": []}


def valideer_lamp(rauw: Any) -> dict[str, Any]:
    if isinstance(rauw, str):
        rauw = {"entity": rauw}
    if not isinstance(rauw, dict):
        raise InfoFout("een lamp is een object met 'entity' en 'naam'")
    return {
        "entity": _entiteit(rauw.get("entity"), "verlichting.entity", ("light", "switch")),
        "naam": _tekst(rauw.get("naam"), "verlichting.naam", MAX_KORT),
    }


def valideer_installatie(rauw: Any) -> dict[str, Any]:
    if rauw is None:
        rauw = {}
    if not isinstance(rauw, dict):
        raise InfoFout("'installatie' is een object")
    weer = rauw.get("weer") or None
    # Ronde 4 (10 september 2026): een energiesensor voor het blok Energie.
    energie = rauw.get("energie") or None
    lampen = [valideer_lamp(l) for l in _lijst(rauw.get("verlichting"), "verlichting", MAX_LAMPEN)]
    gezien: set[str] = set()
    uniek = []
    for lamp in lampen:
        if lamp["entity"] not in gezien:
            gezien.add(lamp["entity"])
            uniek.append(lamp)
    agendas = [
        _entiteit(a, "agendas", ("calendar",))
        for a in _lijst(rauw.get("agendas"), "agendas", MAX_AGENDAS)
    ]
    return {
        "weer": _entiteit(weer, "weer", ("weather",)) if weer else None,
        "energie": _entiteit(energie, "energie", ("sensor",)) if energie else None,
        "agendas": list(dict.fromkeys(agendas)),
        "verlichting": uniek,
    }


# --------------------------------------------------------------------------
# Indeling: de blokken op het welkomscherm
# --------------------------------------------------------------------------


def standaard_indeling() -> dict[str, Any]:
    """Zes kolommen bij zes rijen. Sinds ronde 4 is er geen kop meer boven
    het raster: het welkomblok linksboven draagt logo, klok en welkomtekst,
    daaronder het weer en de openingstijden; de aanwezigen in het midden en
    het nieuws als hoge kolom rechts. Tweeling van standaardIndeling in
    infoscherm-logica.js."""
    blokken = [
        ("welkom", 0, 0, 2, 2, 0),
        ("weer", 0, 2, 2, 2, 0),
        ("openingstijden", 0, 4, 2, 2, 0),
        ("aanwezig", 2, 0, 2, 3, 6),
        ("mededeling", 2, 3, 2, 1, 0),
        ("verlichting", 2, 4, 2, 2, 4),
        ("nieuws", 4, 0, 2, 6, 6),
    ]
    return {
        "blokken": [
            {"id": f"std-{soort}", "soort": soort, "x": x, "y": y, "w": w, "h": h, "aantal": aantal}
            for soort, x, y, w, h, aantal in blokken
        ]
    }


def valideer_blok(rauw: Any) -> dict[str, Any]:
    if not isinstance(rauw, dict):
        raise InfoFout("een blok is een object")
    soort = rauw.get("soort")
    if soort not in BLOK_SOORTEN:
        raise InfoFout(f"'soort' is een van: {', '.join(BLOK_SOORTEN)}")
    x = int(_getal(rauw.get("x"), "x", 0, KOLOMMEN - 1, 0))
    y = int(_getal(rauw.get("y"), "y", 0, RIJEN - 1, 0))
    w = int(_getal(rauw.get("w"), "w", 1, KOLOMMEN, 1))
    h = int(_getal(rauw.get("h"), "h", 1, RIJEN, 1))
    if x + w > KOLOMMEN or y + h > RIJEN:
        raise InfoFout(f"een blok van {w}x{h} op ({x},{y}) valt buiten het raster van {KOLOMMEN}x{RIJEN}")
    blok_id = rauw.get("id")
    if not (isinstance(blok_id, str) and 1 <= len(blok_id) <= 40 and re.match(r"^[A-Za-z0-9_-]+$", blok_id)):
        blok_id = ulid_now()
    return {
        "id": blok_id,
        "soort": soort,
        "x": x,
        "y": y,
        "w": w,
        "h": h,
        "aantal": int(_getal(rauw.get("aantal"), "aantal", 0, 50, 0)),
    }


def overlapt(a: dict[str, Any], b: dict[str, Any]) -> bool:
    return a["x"] < b["x"] + b["w"] and b["x"] < a["x"] + a["w"] and a["y"] < b["y"] + b["h"] and b["y"] < a["y"] + a["h"]


def valideer_indeling(rauw: Any) -> dict[str, Any]:
    if rauw is None:
        return standaard_indeling()
    if not isinstance(rauw, dict):
        raise InfoFout("'indeling' is een object met 'blokken'")
    blokken = [valideer_blok(b) for b in _lijst(rauw.get("blokken"), "blokken", MAX_BLOKKEN)]
    gezien: set[str] = set()
    for i, blok in enumerate(blokken):
        if blok["id"] in gezien:
            blok["id"] = ulid_now()
        gezien.add(blok["id"])
        for ander in blokken[:i]:
            if overlapt(blok, ander):
                raise InfoFout(f"de blokken '{blok['soort']}' en '{ander['soort']}' overlappen elkaar")
    return {"blokken": blokken}


# --------------------------------------------------------------------------
# Instellingen
# --------------------------------------------------------------------------


def valideer_feed(rauw: Any) -> dict[str, str]:
    if not isinstance(rauw, dict):
        raise InfoFout("een nieuwsbron is een object")
    url = _tekst(rauw.get("url"), "url", MAX_MIDDEL, verplicht=True)
    if not url.startswith(("http://", "https://")):
        raise InfoFout("een nieuwsbron begint met http:// of https://")
    return {"naam": _tekst(rauw.get("naam"), "naam", MAX_KORT), "url": url}


def leeg_instellingen() -> dict[str, Any]:
    return {
        "verlichting_tonen": True,
        "feeds": [],
        "kiosk_gebruikers": [],
    }


def valideer_kiosk_gebruikers(rauw: Any) -> list[str]:
    gebruikers = _lijst(rauw, "kiosk_gebruikers", 50)
    for g in gebruikers:
        if not isinstance(g, str) or not g:
            raise InfoFout("'kiosk_gebruikers' is een lijst met gebruikers-ID's")
    return list(dict.fromkeys(gebruikers))


def valideer_instellingen(rauw: Any) -> dict[str, Any]:
    if not isinstance(rauw, dict):
        raise InfoFout("'instellingen' is een object")
    return {
        "verlichting_tonen": bool(rauw.get("verlichting_tonen", True)),
        "feeds": [valideer_feed(f) for f in _lijst(rauw.get("feeds"), "feeds", MAX_FEEDS)],
        "kiosk_gebruikers": valideer_kiosk_gebruikers(rauw.get("kiosk_gebruikers")),
    }


# --------------------------------------------------------------------------
# De opslag
# --------------------------------------------------------------------------


class InfoStore:
    """Alles wat op het scherm staat, en wie het beheert."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._praktijk = leeg_praktijk()
        self._personen: list[dict[str, Any]] = []
        self._mededelingen: list[dict[str, Any]] = []
        self._verjaardagen: list[dict[str, Any]] = []
        self._scherm = leeg_scherm()
        self._installatie = leeg_installatie()
        self._indeling = standaard_indeling()
        self._instellingen = leeg_instellingen()
        self._bestanden: dict[str, dict[str, Any]] = {}

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if not data:
            return
        self._praktijk = self._lees(data.get("praktijk"), valideer_praktijk, leeg_praktijk(), "praktijk")
        self._instellingen = self._lees(
            data.get("instellingen"), valideer_instellingen, leeg_instellingen(), "instellingen"
        )
        self._scherm = self._lees(data.get("scherm"), valideer_scherm, leeg_scherm(), "scherm")
        self._installatie = self._lees(
            data.get("installatie"), valideer_installatie, leeg_installatie(), "installatie"
        )
        self._indeling = self._lees(data.get("indeling"), valideer_indeling, standaard_indeling(), "indeling")
        self._personen = self._lees_lijst(data.get("personen"), valideer_persoon, "persoon")
        self._mededelingen = self._lees_lijst(data.get("mededelingen"), valideer_mededeling, "mededeling")
        self._verjaardagen = self._lees_lijst(data.get("verjaardagen"), valideer_verjaardag, "verjaardag")
        bestanden = data.get("bestanden") or {}
        self._bestanden = {
            bid: meta
            for bid, meta in bestanden.items()
            if is_geldig_id(bid) and isinstance(meta, dict) and meta.get("soort") in SOORTEN
        }
        # Tot 0.36.0 stonden het logo en het accent in `praktijk`. Eén keer
        # overnemen, en alleen als `scherm` ze nog niet heeft.
        oud = data.get("praktijk") if isinstance(data.get("praktijk"), dict) else {}
        verhuisd = False
        if data.get("scherm") is None or "logo" not in (data.get("scherm") or {}):
            if self._scherm["logo"] is None and is_geldig_id(oud.get("logo") or ""):
                self._scherm["logo"] = oud["logo"]
                verhuisd = True
            accent = oud.get("accent")
            if self._scherm["accent"] is None and isinstance(accent, str) and _HEX.match(accent):
                self._scherm["accent"] = accent.lower()
                verhuisd = True
        # Tot 0.37.0 was er nieuws van het pand naast de mededelingen; sinds
        # ronde 3 zijn dat mededelingen. Eén keer overnemen, achteraan.
        oud_nieuws = data.get("nieuws")
        if isinstance(oud_nieuws, list) and oud_nieuws:
            bekend = {m["id"] for m in self._mededelingen}
            erbij = [m for m in (nieuws_naar_mededeling(n) for n in oud_nieuws) if m and m["id"] not in bekend]
            if erbij:
                self._mededelingen = _uniek(self._mededelingen + erbij, "mededelingen")[:MAX_MEDEDELINGEN]
            _LOGGER.info("Infoscherm: %d bericht(en) van het pand zijn mededelingen geworden", len(erbij))
            verhuisd = True
        # En de eerste welkomsttekst uit `praktijk` wordt de tekst van het welkomblok.
        welkom = oud.get("welkom")
        if "welkom_tekst" not in (data.get("scherm") or {}) and isinstance(welkom, list) and welkom:
            eerste = welkom[0]
            if isinstance(eerste, str) and eerste.strip():
                self._scherm["welkom_tekst"] = eerste.strip()[:MAX_KORT]
                verhuisd = True
        if verhuisd:
            _LOGGER.info("Infoscherm: opslag van een oudere uitgave bijgewerkt")
            await self._async_save()

    @staticmethod
    def _lees(rauw: Any, valideer, standaard: dict[str, Any], naam: str) -> dict[str, Any]:
        if rauw is None:
            return standaard
        try:
            return valideer(rauw)
        except InfoFout as fout:
            _LOGGER.warning("Infoscherm: %s in de opslag overgeslagen: %s", naam, fout)
            return standaard

    @staticmethod
    def _lees_lijst(rauw: Any, valideer, naam: str) -> list[dict[str, Any]]:
        uit = []
        for item in rauw or []:
            try:
                uit.append(valideer(item))
            except InfoFout as fout:
                _LOGGER.warning("Infoscherm: %s in de opslag overgeslagen: %s", naam, fout)
        return uit

    # ----------------------------------------------------------- lezen

    @callback
    def snapshot(self) -> dict[str, Any]:
        return {
            "praktijk": dict(self._praktijk),
            "personen": [dict(p) for p in self._personen],
            "mededelingen": [dict(m) for m in self._mededelingen],
            "verjaardagen": [dict(v) for v in self._verjaardagen],
            "scherm": dict(self._scherm),
            "installatie": {
                "weer": self._installatie["weer"],
                "energie": self._installatie.get("energie"),
                "agendas": list(self._installatie["agendas"]),
                "verlichting": [dict(l) for l in self._installatie["verlichting"]],
            },
            "indeling": {"blokken": [dict(b) for b in self._indeling["blokken"]]},
            "instellingen": dict(self._instellingen),
            "bestanden": {bid: dict(meta) for bid, meta in self._bestanden.items()},
        }

    @callback
    def is_kiosk(self, user_id: str | None) -> bool:
        return user_id is not None and user_id in self._instellingen["kiosk_gebruikers"]

    @callback
    def bestand(self, bestand_id: str) -> dict[str, Any] | None:
        return self._bestanden.get(bestand_id)

    @callback
    def in_gebruik(self, bestand_id: str) -> bool:
        if self._scherm.get("logo") == bestand_id:
            return True
        return any(p.get("foto") == bestand_id for p in self._personen)

    @property
    def instellingen(self) -> dict[str, Any]:
        return dict(self._instellingen)

    # ----------------------------------------------------------- schrijven

    async def async_zet_personen(self, rauw: Any) -> list[dict[str, Any]]:
        personen = valideer_personen(rauw)
        # Aanwezigheid komt van het scherm, niet van het beheer: wie op de
        # iPad "aanwezig" tikte terwijl de receptie de lijst openhad, mag niet
        # door het opslaan van die lijst weer afwezig worden.
        bekend = {p["id"]: p["aanwezig"] for p in self._personen}
        for p in personen:
            if p["id"] in bekend and "aanwezig" not in _expliciet(rauw, p["id"]):
                p["aanwezig"] = bekend[p["id"]]
        self._personen = personen
        await self._async_save()
        return self.snapshot()["personen"]

    async def async_zet_aanwezig(self, persoon_id: str, aanwezig: bool) -> dict[str, Any] | None:
        for p in self._personen:
            if p["id"] == persoon_id:
                p["aanwezig"] = bool(aanwezig)
                await self._async_save()
                return dict(p)
        return None

    async def async_zet_mededelingen(self, rauw: Any) -> list[dict[str, Any]]:
        self._mededelingen = valideer_mededelingen(rauw)
        await self._async_save()
        return self.snapshot()["mededelingen"]

    async def async_zet_verjaardagen(self, rauw: Any) -> list[dict[str, Any]]:
        self._verjaardagen = valideer_verjaardagen(rauw)
        await self._async_save()
        return self.snapshot()["verjaardagen"]

    async def async_zet_praktijk(self, rauw: Any) -> dict[str, Any]:
        self._praktijk = valideer_praktijk(rauw)
        await self._async_save()
        return dict(self._praktijk)

    async def async_zet_scherm(self, rauw: Any) -> dict[str, Any]:
        self._scherm = valideer_scherm(rauw)
        await self._async_save()
        return dict(self._scherm)

    async def async_zet_installatie(self, rauw: Any, *, mag_entiteiten_wijzigen: bool) -> dict[str, Any]:
        """De entiteiten kiest de installateur (admin); de receptie mag alleen de
        NAMEN van de lampen wijzigen. Stuurt een receptie-account een andere
        lampenlijst, dan blijven de entiteiten zoals ze waren en gaan alleen de
        namen van de bekende lampen mee."""
        nieuw = valideer_installatie(rauw)
        if not mag_entiteiten_wijzigen:
            namen = {l["entity"]: l["naam"] for l in nieuw["verlichting"]}
            nieuw = {
                "weer": self._installatie["weer"],
                "energie": self._installatie.get("energie"),
                "agendas": list(self._installatie["agendas"]),
                "verlichting": [
                    {"entity": l["entity"], "naam": namen.get(l["entity"], l["naam"])}
                    for l in self._installatie["verlichting"]
                ],
            }
        self._installatie = nieuw
        await self._async_save()
        return self.snapshot()["installatie"]

    async def async_zet_installatie_van_kaart(self, rauw: Any) -> dict[str, Any]:
        """De entiteiten en de kioskaccounts zoals ze in de KAARTCONFIG van het
        infoscherm staan (ronde 3). De kaart stuurt ze zodra een beheerder hem
        met die config ziet -- in de editor of op het dashboard -- en alleen
        als ze afwijken van wat hier staat.

        De namen van de lampen blijven staan: die zijn van de receptie. Een
        lamp die uit de config verdwijnt neemt zijn naam mee; komt hij terug,
        dan begint hij leeg. Geeft True in `gewijzigd` terug als er iets
        veranderd is, zodat de aanroeper weet of er een stand rond moet."""
        if not isinstance(rauw, dict):
            raise InfoFout("'installatie' is een object")
        nieuw = valideer_installatie(
            {
                "weer": rauw.get("weer"),
                "energie": rauw.get("energie"),
                "agendas": rauw.get("agendas"),
                "verlichting": rauw.get("verlichting"),
            }
        )
        namen = {l["entity"]: l["naam"] for l in self._installatie["verlichting"]}
        nieuw["verlichting"] = [
            {"entity": l["entity"], "naam": namen.get(l["entity"], l["naam"])} for l in nieuw["verlichting"]
        ]
        kiosk = valideer_kiosk_gebruikers(rauw.get("kiosk_gebruikers"))
        gewijzigd = nieuw != self._installatie or kiosk != self._instellingen["kiosk_gebruikers"]
        if gewijzigd:
            self._installatie = nieuw
            self._instellingen["kiosk_gebruikers"] = kiosk
            await self._async_save()
        return {"gewijzigd": gewijzigd, "installatie": self.snapshot()["installatie"]}

    async def async_zet_indeling(self, rauw: Any) -> dict[str, Any]:
        self._indeling = valideer_indeling(rauw)
        await self._async_save()
        return self.snapshot()["indeling"]

    async def async_zet_instellingen(self, rauw: Any, *, mag_kiosk_wijzigen: bool) -> dict[str, Any]:
        nieuw = valideer_instellingen(rauw)
        if not mag_kiosk_wijzigen:
            nieuw["kiosk_gebruikers"] = list(self._instellingen["kiosk_gebruikers"])
        self._instellingen = nieuw
        await self._async_save()
        return dict(self._instellingen)

    async def async_registreer_bestand(self, bestand_id: str, meta: dict[str, Any]) -> None:
        if len(self._bestanden) >= MAX_BESTANDEN:
            raise InfoFout(f"er staan al {MAX_BESTANDEN} bestanden; ruim eerst op")
        self._bestanden[bestand_id] = dict(meta)
        await self._async_save()

    async def async_vergeet_bestand(self, bestand_id: str) -> dict[str, Any] | None:
        meta = self._bestanden.pop(bestand_id, None)
        if meta is None:
            return None
        # Waar het bestand nog naar verwezen werd, verdwijnt de verwijzing mee.
        if self._scherm.get("logo") == bestand_id:
            self._scherm["logo"] = None
        for p in self._personen:
            if p.get("foto") == bestand_id:
                p["foto"] = None
        await self._async_save()
        return meta

    async def _async_save(self) -> None:
        await self._store.async_save(
            {
                "praktijk": self._praktijk,
                "personen": self._personen,
                "mededelingen": self._mededelingen,
                "verjaardagen": self._verjaardagen,
                "scherm": self._scherm,
                "installatie": self._installatie,
                "indeling": self._indeling,
                "instellingen": self._instellingen,
                "bestanden": self._bestanden,
            }
        )


def _expliciet(rauw: Any, persoon_id: str) -> dict[str, Any]:
    """Het ruwe item met dit ID, om te zien welke velden er echt gestuurd zijn."""
    if not isinstance(rauw, list):
        return {}
    for item in rauw:
        if isinstance(item, dict) and item.get("id") == persoon_id:
            return item
    return {}


# --------------------------------------------------------------------------
# Openingstijden: nu open?
# --------------------------------------------------------------------------


def vandaag_open(praktijk: dict[str, Any], nu: datetime | None = None) -> dict[str, Any]:
    """De tijdvakken van vandaag, met de uitzonderingen erin verwerkt.

    Geeft `{"tijden": [...], "reden": str, "open": bool}` terug. Staat ook in
    de kaart (`infoscherm-logica.js`), want de kaart toont het en de server
    heeft het voor de nachtstand nodig; deze is de referentie.
    """
    nu = nu or dt_util.now()
    vandaag = nu.date().isoformat()
    reden = ""
    tijden = praktijk["openingstijden"].get(DAGEN[nu.weekday()], [])
    for u in praktijk.get("uitzonderingen", []):
        if u["datum"] == vandaag:
            tijden = u["tijden"]
            reden = u["reden"]
    klok = nu.strftime("%H:%M")
    open_ = any(a <= klok < b for a, b in tijden)
    return {"tijden": tijden, "reden": reden, "open": open_}
