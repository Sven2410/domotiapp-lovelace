"""De opslag van het infoscherm: praktijk, personen, mededelingen, nieuws,
instellingen en de lijst van bestanden.

Eén `Store`, want alles hier verandert alleen als iemand in het beheer iets
opslaat of op de iPad op een naam tikt. Dat is een handvol keren per dag.

Zelfde lijn als `../store.py` en `bewaking/store.py`: **valideren is niet
hetzelfde als parsen.** Wat de beheerkaart stuurt wordt streng nagekeken en bij
een fout in zijn geheel geweigerd, met uitleg. Wat bij het lezen niet deugt
wordt per onderdeel overgeslagen met een logregel, en sleept de rest niet mee:
een kapot nieuwsbericht mag de personenlijst niet leegmaken.

De beheerkaart stuurt per blok de HELE lijst (alle personen, alle berichten).
Dat is bewust simpel: er is één receptie, en een lijst van tweehonderd namen
is nog altijd kleiner dan één foto.
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
    DAGEN,
    MAX_BESTANDEN,
    MAX_FEEDS,
    MAX_KORT,
    MAX_LANG,
    MAX_MEDEDELINGEN,
    MAX_MIDDEL,
    MAX_NIEUWS,
    MAX_PERSONEN,
    MAX_UITZONDERINGEN,
    MAX_WELKOM,
    STORAGE_KEY,
    STORAGE_VERSION,
)

_LOGGER = logging.getLogger(__name__)

_HEX = re.compile(r"^#[0-9a-fA-F]{6}$")
_TIJD = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


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


def initialen(naam: str) -> str:
    """'Marieke de Vries' -> 'MV'. Tussenvoegsels tellen niet mee."""
    delen = [d for d in naam.split() if d and d[0].isupper()] or naam.split()
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
        "tekst": _tekst(rauw.get("tekst"), "tekst", MAX_MIDDEL, verplicht=True),
        "van": _datum(rauw.get("van"), "van"),
        "tot": _datum(rauw.get("tot"), "tot"),
    }


def valideer_mededelingen(rauw: Any) -> list[dict[str, Any]]:
    return _uniek(
        [valideer_mededeling(m) for m in _lijst(rauw, "mededelingen", MAX_MEDEDELINGEN)],
        "mededelingen",
    )


def valideer_nieuws_item(rauw: Any) -> dict[str, Any]:
    if not isinstance(rauw, dict):
        raise InfoFout("een nieuwsbericht is een object")
    gemaakt = rauw.get("gemaakt")
    if not isinstance(gemaakt, str) or dt_util.parse_datetime(gemaakt) is None:
        gemaakt = dt_util.utcnow().isoformat()
    return {
        "id": _id(rauw.get("id")),
        "titel": _tekst(rauw.get("titel"), "titel", MAX_KORT, verplicht=True),
        "tekst": _tekst(rauw.get("tekst"), "tekst", MAX_LANG),
        "afbeelding": _bestand_id(rauw.get("afbeelding"), "afbeelding"),
        "van": _datum(rauw.get("van"), "van"),
        "tot": _datum(rauw.get("tot"), "tot"),
        "vast": bool(rauw.get("vast", False)),
        "gemaakt": gemaakt,
    }


def valideer_nieuws(rauw: Any) -> list[dict[str, Any]]:
    return _uniek([valideer_nieuws_item(n) for n in _lijst(rauw, "nieuws", MAX_NIEUWS)], "nieuws")


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
        "naam": "",
        "adres": "",
        "welkom": [],
        "logo": None,
        "accent": None,
        "openingstijden": {dag: [] for dag in DAGEN},
        "uitzonderingen": [],
    }


def valideer_praktijk(rauw: Any) -> dict[str, Any]:
    if not isinstance(rauw, dict):
        raise InfoFout("'praktijk' is een object")
    accent = rauw.get("accent") or None
    if accent is not None and not (isinstance(accent, str) and _HEX.match(accent)):
        raise InfoFout("'accent' is een kleur als #026fa1")
    welkom = [
        _tekst(regel, "welkom", MAX_MIDDEL)
        for regel in _lijst(rauw.get("welkom"), "welkom", MAX_WELKOM)
    ]
    uitzonderingen = [
        valideer_uitzondering(u)
        for u in _lijst(rauw.get("uitzonderingen"), "uitzonderingen", MAX_UITZONDERINGEN)
    ]
    uitzonderingen.sort(key=lambda u: u["datum"])
    return {
        "naam": _tekst(rauw.get("naam"), "naam", MAX_KORT),
        "adres": _tekst(rauw.get("adres"), "adres", MAX_KORT),
        "welkom": [w for w in welkom if w],
        "logo": _bestand_id(rauw.get("logo"), "logo"),
        "accent": accent.lower() if accent else None,
        "openingstijden": valideer_openingstijden(rauw.get("openingstijden")),
        "uitzonderingen": uitzonderingen,
    }


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
        "reset_middernacht": True,
        "verlichting_tonen": True,
        "feeds": [],
        "kiosk_gebruikers": [],
    }


def valideer_instellingen(rauw: Any) -> dict[str, Any]:
    if not isinstance(rauw, dict):
        raise InfoFout("'instellingen' is een object")
    gebruikers = _lijst(rauw.get("kiosk_gebruikers"), "kiosk_gebruikers", 50)
    for g in gebruikers:
        if not isinstance(g, str) or not g:
            raise InfoFout("'kiosk_gebruikers' is een lijst met gebruikers-ID's")
    return {
        "reset_middernacht": bool(rauw.get("reset_middernacht", True)),
        "verlichting_tonen": bool(rauw.get("verlichting_tonen", True)),
        "feeds": [valideer_feed(f) for f in _lijst(rauw.get("feeds"), "feeds", MAX_FEEDS)],
        "kiosk_gebruikers": list(dict.fromkeys(gebruikers)),
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
        self._nieuws: list[dict[str, Any]] = []
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
        self._personen = self._lees_lijst(data.get("personen"), valideer_persoon, "persoon")
        self._mededelingen = self._lees_lijst(data.get("mededelingen"), valideer_mededeling, "mededeling")
        self._nieuws = self._lees_lijst(data.get("nieuws"), valideer_nieuws_item, "nieuwsbericht")
        bestanden = data.get("bestanden") or {}
        self._bestanden = {
            bid: meta
            for bid, meta in bestanden.items()
            if is_geldig_id(bid) and isinstance(meta, dict) and meta.get("soort") in SOORTEN
        }

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
            "nieuws": [dict(n) for n in self._nieuws],
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
        if self._praktijk.get("logo") == bestand_id:
            return True
        if any(p.get("foto") == bestand_id for p in self._personen):
            return True
        return any(n.get("afbeelding") == bestand_id for n in self._nieuws)

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

    async def async_reset_aanwezig(self) -> int:
        aantal = 0
        for p in self._personen:
            if p["aanwezig"]:
                p["aanwezig"] = False
                aantal += 1
        if aantal:
            await self._async_save()
        return aantal

    async def async_zet_mededelingen(self, rauw: Any) -> list[dict[str, Any]]:
        self._mededelingen = valideer_mededelingen(rauw)
        await self._async_save()
        return self.snapshot()["mededelingen"]

    async def async_zet_nieuws(self, rauw: Any) -> list[dict[str, Any]]:
        self._nieuws = valideer_nieuws(rauw)
        await self._async_save()
        return self.snapshot()["nieuws"]

    async def async_zet_praktijk(self, rauw: Any) -> dict[str, Any]:
        self._praktijk = valideer_praktijk(rauw)
        await self._async_save()
        return dict(self._praktijk)

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
        if self._praktijk.get("logo") == bestand_id:
            self._praktijk["logo"] = None
        for p in self._personen:
            if p.get("foto") == bestand_id:
                p["foto"] = None
        for n in self._nieuws:
            if n.get("afbeelding") == bestand_id:
                n["afbeelding"] = None
        await self._async_save()
        return meta

    async def _async_save(self) -> None:
        await self._store.async_save(
            {
                "praktijk": self._praktijk,
                "personen": self._personen,
                "mededelingen": self._mededelingen,
                "nieuws": self._nieuws,
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
