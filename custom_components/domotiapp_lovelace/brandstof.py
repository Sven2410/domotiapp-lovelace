"""De brandstofprijzen van Nederland: de landelijke adviesprijs (GLA) per brandstof, voor de brandstofkaart.

De eigenaar, 27 november 2026, toen de HACS-integratie die hij ervoor had niet meer werkte: *"kan jij zelf niet met
lovelace iets maken? Dus een brandstofprijzen kaart van NL?"*, en over prijzen per pomp: *"nee ik wil de adviesprijzen
want je kan toch niet elke pomp in Nederland pakken of wel?"*

## De bron

UnitedConsumers publiceert elke dag de Gemiddelde Landelijke Adviesprijs. robots.txt staat het lezen toe. Gelezen op
27 november 2026; de pagina's staan ingekort in `tests/js/vaste-invoer/unitedconsumers-*.html`:

| pagina | wat erin staat | hoe het gelezen wordt |
|---|---|---|
| `LIJST` | per brandstof een link `/tanken/brandstofprijzen/product/<slug>` met `title="<naam>"`, en daarna "€ 2,377"; onderaan "Datum overzicht 27 november 2026" | op de link. De klassen zijn gehasht (`_root_170bn_1`) en veranderen; de HACS-integratie die op een markering zocht, viel daardoor om |
| `PRODUCT` | een jaar dagprijzen als JSON `{"date":"2025-11-27T00:00:00","price":2.188}`, tot en met gisteren | daaruit komen gisteren en het verloop |

## Wanneer

Alleen als een kaart erom vraagt (`brandstof/prijzen`), en dan hooguit eens per uur de lijst (`LIJST_INTERVAL`) en eens
per dag elke productpagina. Een installatie zonder brandstofkaart haalt dus niets op. Wat er opgehaald is, staat in de
opslag: na een herstart staan de laatste prijzen er meteen, en lukt het ophalen niet, dan blijven ze staan, met de fout
erbij.

**Geen adres van de kaart**, net als bij het nieuws (zie de kop van `nieuws.py`): de kaart kiest brandstoffen, en alleen
de server kent de adressen. Een slug van de lijst wordt alleen gebruikt als hij uit letters, cijfers en streepjes bestaat.
"""

from __future__ import annotations

import asyncio
from datetime import date, datetime, timedelta
import html as html_lib
import logging
import re
from typing import Any
from urllib.parse import unquote

import aiohttp
import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

DATA_BRANDSTOF = "brandstof"
DATA_WS = "brandstof_ws_registered"
STORAGE_KEY = f"{DOMAIN}.brandstof"

LIJST = "https://www.unitedconsumers.com/tanken/brandstofprijzen"
PRODUCT = LIJST + "/product/{slug}"
BRON = "UnitedConsumers"

LIJST_INTERVAL = timedelta(hours=1)
OPNIEUW_NA_FOUT = timedelta(minutes=5)
TIMEOUT = 20
MAX_BYTES = 2 * 1024 * 1024
# Zoveel dagen gaan er naar de kaart: genoeg voor een grafiekje van een maand.
DAGEN_NAAR_KAART = 31

_MAANDEN = ("januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober",
            "november", "december")
_LINK = re.compile(r'<a\b[^>]*href="/tanken/brandstofprijzen/product/([^"?#]+)"[^>]*>', re.I)
_TITEL = re.compile(r'title="([^"]*)"')
_PRIJS = re.compile(r"€\s*(?:<!--\s*-->\s*)?(\d+,\d+)")
_DATUM = re.compile(r"Datum overzicht\s*(?:<[^>]*>\s*)*(\d{1,2}) (" + "|".join(_MAANDEN) + r") (\d{4})", re.I)
_REEKS = re.compile(r'\\?"date\\?":\\?"(\d{4}-\d{2}-\d{2})T00:00:00\\?",\\?"price\\?":(\d+(?:\.\d+)?)')
_SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def slug_van(href: str) -> str:
    """`super%20mlv` en `super-mlv` zijn dezelfde: `super-mlv`."""
    return re.sub(r"\s+", "-", unquote(href).strip().lower())


def lees_lijst(tekst: str) -> tuple[date | None, dict[str, dict[str, Any]]]:
    """De datum van het overzicht, en per brandstof de naam en de prijs (in euro per liter)."""
    prijzen: dict[str, dict[str, Any]] = {}
    for m in _LINK.finditer(tekst):
        titel = _TITEL.search(m.group(0))
        slug = slug_van(m.group(1))
        if not titel or slug in prijzen or not _SLUG.match(slug):
            continue
        # De prijs staat vlak na de link; niet verder dan de volgende link.
        volgende = _LINK.search(tekst, m.end())
        stuk = tekst[m.end() : volgende.start() if volgende else m.end() + 2000]
        if (p := _PRIJS.search(stuk)) is None:
            continue
        prijzen[slug] = {"naam": html_lib.unescape(titel.group(1)).strip(), "prijs": float(p.group(1).replace(",", "."))}
    datum = None
    if d := _DATUM.search(tekst):
        try:
            datum = date(int(d.group(3)), _MAANDEN.index(d.group(2).lower()) + 1, int(d.group(1)))
        except ValueError:
            datum = None
    return datum, prijzen


def lees_reeks(tekst: str) -> list[list[Any]]:
    """De dagprijzen van een productpagina, oud naar nieuw: `[["2026-11-26", 2.375], ...]`."""
    uit: dict[str, float] = {}
    for m in _REEKS.finditer(tekst):
        uit[m.group(1)] = float(m.group(2))
    return [[d, uit[d]] for d in sorted(uit)]


def voor_kaart(data: dict[str, Any], vandaag: date) -> dict[str, Any]:
    """Wat de kaart krijgt: per brandstof de prijs, die van de dag ervoor, het verschil, en een maand verloop."""
    dag = data.get("datum") or vandaag.isoformat()
    producten: list[dict[str, Any]] = []
    for slug, p in (data.get("prijzen") or {}).items():
        reeks = [r for r in (data.get("reeksen") or {}).get(slug, []) if r[0] < dag]
        gisteren = reeks[-1][1] if reeks else None
        producten.append({
            "slug": slug,
            "naam": p["naam"],
            "prijs": p["prijs"],
            "gisteren": gisteren,
            "verschil": round(p["prijs"] - gisteren, 3) if gisteren is not None else None,
            "reeks": [*reeks[-(DAGEN_NAAR_KAART - 1):], [dag, p["prijs"]]],
        })
    return {"datum": dag, "opgehaald": data.get("opgehaald"), "fout": data.get("fout"), "bron": BRON, "producten": producten}


class Brandstof:
    """De laatste prijzen en reeksen, in de opslag, en wanneer er weer opgehaald mag worden."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, 1, STORAGE_KEY)
        self._data: dict[str, Any] | None = None
        self._slot = asyncio.Lock()
        # Na een fout niet meteen weer: in het geheugen, want een fout hoort niet in de opslag te blijven hangen.
        self._niet_voor: datetime | None = None

    async def async_prijzen(self) -> dict[str, Any]:
        async with self._slot:
            if self._data is None:
                rauw = await self._store.async_load()
                self._data = rauw if isinstance(rauw, dict) else {}
            nu = dt_util.now()
            opgehaald = _tijd(self._data.get("opgehaald"))
            vers = opgehaald is not None and nu - opgehaald < LIJST_INTERVAL
            if not vers and (self._niet_voor is None or nu >= self._niet_voor):
                await self._haal(nu)
            return voor_kaart(self._data, nu.date())

    async def _haal(self, nu: datetime) -> None:
        data = self._data
        try:
            datum, prijzen = lees_lijst(await self._lees(LIJST))
            if not prijzen:
                raise ValueError("geen prijzen gevonden op de pagina")
            data.update(prijzen=prijzen, datum=(datum or nu.date()).isoformat(), opgehaald=nu.isoformat(), fout=None)
            # De reeksen eens per dag, en alleen van wat er nu op de lijst staat. Binnen de dag alleen wat nog ontbreekt.
            reeksen = {s: r for s, r in (data.get("reeksen") or {}).items() if s in prijzen}
            nieuwe_dag = data.get("reeksen_dag") != nu.date().isoformat()
            for slug in [s for s in prijzen if nieuwe_dag or s not in reeksen]:
                try:
                    if reeks := lees_reeks(await self._lees(PRODUCT.format(slug=slug))):
                        reeksen[slug] = reeks
                except Exception as fout:  # noqa: BLE001 - één brandstof houdt de rest niet tegen
                    _LOGGER.info("Brandstofprijzen: verloop van %s niet opgehaald: %s", slug, fout)
            data["reeksen_dag"] = nu.date().isoformat()
            data["reeksen"] = reeksen
            self._niet_voor = None
        except Exception as fout:  # noqa: BLE001 - de kaart toont het, en houdt wat er was
            _LOGGER.info("Brandstofprijzen niet opgehaald: %s", fout)
            data["fout"] = str(fout) or fout.__class__.__name__
            self._niet_voor = nu + OPNIEUW_NA_FOUT
        await self._store.async_save(data)

    async def _lees(self, url: str) -> str:
        sessie = async_get_clientsession(self._hass)
        async with sessie.get(
            url,
            timeout=aiohttp.ClientTimeout(total=TIMEOUT),
            headers={"User-Agent": "DomotiApp Lovelace (Home Assistant)"},
        ) as antwoord:
            if antwoord.status != 200:
                raise ValueError(f"HTTP {antwoord.status}")
            # In stukken tot het einde, met een bovengrens (valkuil 45).
            delen: list[bytes] = []
            totaal = 0
            async for stuk in antwoord.content.iter_chunked(64 * 1024):
                totaal += len(stuk)
                if totaal > MAX_BYTES:
                    raise ValueError("de pagina is groter dan 2 MB")
                delen.append(stuk)
        return b"".join(delen).decode("utf-8", errors="replace")


def _tijd(waarde: Any) -> datetime | None:
    try:
        return datetime.fromisoformat(str(waarde)) if waarde else None
    except ValueError:
        return None


@callback
def async_zet_op(hass: HomeAssistant) -> None:
    data = hass.data.setdefault(DOMAIN, {})
    data.setdefault(DATA_BRANDSTOF, Brandstof(hass))
    if data.get(DATA_WS):
        return
    websocket_api.async_register_command(hass, ws_prijzen)
    data[DATA_WS] = True


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/brandstof/prijzen"})
@websocket_api.async_response
async def ws_prijzen(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Iedere ingelogde gebruiker: openbare prijzen van een vast adres."""
    brandstof: Brandstof = hass.data[DOMAIN][DATA_BRANDSTOF]
    connection.send_result(msg["id"], await brandstof.async_prijzen())
