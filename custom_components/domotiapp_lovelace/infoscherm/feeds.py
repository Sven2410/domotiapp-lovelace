"""Nieuws van buiten: een RSS- of Atom-feed, elk kwartier opgehaald.

Bewust een eigen lezer en niet de `feedreader`-integratie van Home Assistant.
Die levert zijn berichten als gebeurtenissen op de eventbus, en een kaart die
net geopend wordt heeft daar niets aan: hij wil de LIJST van nu, niet wat er
sinds de start langs is gekomen. Bovendien zou de klant dan een tweede
integratie moeten instellen. Hier stelt de receptie een URL in en verder niets.

De parser is met opzet klein: titel, tekst zonder HTML, link, datum, en een
afbeelding als de feed er een meegeeft. Meer toont een wachtkamerscherm niet.
"""

from __future__ import annotations

import asyncio
from datetime import datetime
from email.utils import parsedate_to_datetime
import hashlib
import html
import logging
import re
from typing import Any
from xml.etree import ElementTree as ET

import aiohttp

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.util import dt as dt_util

from .const import FEED_INTERVAL, FEED_MAX_ITEMS, FEED_TIMEOUT

_LOGGER = logging.getLogger(__name__)

# Een feed van meer dan twee megabyte is geen nieuwsfeed meer.
MAX_FEED_BYTES = 2 * 1024 * 1024

_TAGS = re.compile(r"<[^>]+>")
_WIT = re.compile(r"\s+")
_NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "media": "http://search.yahoo.com/mrss/",
    "content": "http://purl.org/rss/1.0/modules/content/",
}


def _kaal(tekst: str | None) -> str:
    """HTML eruit, entiteiten terug naar tekst, witruimte samengevouwen."""
    if not tekst:
        return ""
    zonder = _TAGS.sub(" ", tekst)
    return _WIT.sub(" ", html.unescape(zonder)).strip()


def _datum(tekst: str | None) -> str | None:
    """RFC 822 (RSS) of ISO 8601 (Atom) naar een ISO-tekst in UTC, of None."""
    if not tekst:
        return None
    tekst = tekst.strip()
    moment: datetime | None = None
    try:
        moment = parsedate_to_datetime(tekst)
    except (TypeError, ValueError, IndexError):
        moment = dt_util.parse_datetime(tekst)
    if moment is None:
        return None
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=dt_util.UTC)
    return dt_util.as_utc(moment).isoformat()


def _lokale_naam(el: ET.Element) -> str:
    return el.tag.rsplit("}", 1)[-1]


def _kind(el: ET.Element, naam: str) -> ET.Element | None:
    """Het eerste kind met deze lokale naam, ongeacht namespace."""
    for kind in el:
        if _lokale_naam(kind) == naam:
            return kind
    return None


def _tekst_van(el: ET.Element | None) -> str | None:
    return el.text if el is not None else None


def _afbeelding(el: ET.Element) -> str | None:
    """`enclosure`, `media:content` of `media:thumbnail` met een afbeelding,
    ook als die in een `media:group` zit."""
    for kind in el:
        naam = _lokale_naam(kind)
        if naam == "group":
            if (url := _afbeelding(kind)) is not None:
                return url
            continue
        if naam in ("enclosure", "content", "thumbnail"):
            url = kind.get("url")
            soort = kind.get("type", "")
            if url and (soort.startswith("image/") or naam == "thumbnail" or not soort):
                if naam == "content" and kind.tag == "{%s}encoded" % _NS["content"]:
                    continue
                return url
    return None


_IMG = re.compile(r"""<img[^>]+src=["']([^"']+)["']""", re.IGNORECASE)


def _afbeelding_in_html(html_tekst: str | None) -> str | None:
    """Feeds zonder enclosure zetten hun foto vaak als <img> in de beschrijving."""
    if not html_tekst:
        return None
    m = _IMG.search(html_tekst)
    url = html.unescape(m.group(1)).strip() if m else ""
    return url if url.startswith(("http://", "https://")) else None


def _rss_item(item: ET.Element, bron: str) -> dict[str, Any] | None:
    titel = _kaal(_tekst_van(_kind(item, "title")))
    if not titel:
        return None
    link = (_tekst_van(_kind(item, "link")) or "").strip()
    beschrijving = _tekst_van(_kind(item, "description"))
    tekst = _kaal(beschrijving)
    datum = _datum(_tekst_van(_kind(item, "pubDate")) or _tekst_van(_kind(item, "date")))
    afbeelding = (
        _afbeelding(item)
        or _afbeelding_in_html(beschrijving)
        or _afbeelding_in_html(_tekst_van(_kind(item, "encoded")))
    )
    return _item(bron, titel, tekst, link, datum, afbeelding)


def _atom_entry(entry: ET.Element, bron: str) -> dict[str, Any] | None:
    titel = _kaal(_tekst_van(_kind(entry, "title")))
    if not titel:
        return None
    link = ""
    for kind in entry:
        if _lokale_naam(kind) == "link" and kind.get("rel", "alternate") == "alternate":
            link = kind.get("href", "")
            break
    inhoud = _tekst_van(_kind(entry, "summary")) or _tekst_van(_kind(entry, "content"))
    tekst = _kaal(inhoud)
    datum = _datum(_tekst_van(_kind(entry, "published")) or _tekst_van(_kind(entry, "updated")))
    return _item(bron, titel, tekst, link, datum, _afbeelding(entry) or _afbeelding_in_html(inhoud))


def _item(bron, titel, tekst, link, datum, afbeelding) -> dict[str, Any]:
    sleutel = hashlib.sha1(f"{bron}|{link or titel}".encode()).hexdigest()[:16]
    return {
        "id": f"feed-{sleutel}",
        "bron": bron,
        "titel": titel[:200],
        "tekst": tekst[:600],
        "link": link,
        "datum": datum,
        "afbeelding": afbeelding,
    }


def parse_feed(tekst: str, bron: str) -> list[dict[str, Any]]:
    """RSS 2.0, RSS 1.0 of Atom naar een lijst berichten. Nieuwste eerst."""
    try:
        wortel = ET.fromstring(tekst)
    except ET.ParseError as fout:
        raise ValueError(f"geen geldige feed: {fout}") from None

    items: list[dict[str, Any]] = []
    naam = _lokale_naam(wortel)
    if naam == "feed":
        for entry in wortel:
            if _lokale_naam(entry) == "entry" and (i := _atom_entry(entry, bron)):
                items.append(i)
    else:
        for el in wortel.iter():
            if _lokale_naam(el) == "item" and (i := _rss_item(el, bron)):
                items.append(i)

    items.sort(key=lambda i: i["datum"] or "", reverse=True)
    return items[:FEED_MAX_ITEMS]


class FeedLezer:
    """Haalt de ingestelde feeds op en houdt de laatste lijst vast."""

    def __init__(self, hass: HomeAssistant, feeds_van, meld) -> None:
        self._hass = hass
        self._feeds_van = feeds_van
        self._meld = meld
        self._items: list[dict[str, Any]] = []
        self._fouten: dict[str, str] = {}
        self._stop_interval = None
        self._bezig: asyncio.Lock = asyncio.Lock()

    async def async_start(self) -> None:
        self._stop_interval = async_track_time_interval(self._hass, self._tik, FEED_INTERVAL)
        self._hass.async_create_background_task(self.async_ververs(), "infoscherm feeds")

    @callback
    def async_stop(self) -> None:
        if self._stop_interval:
            self._stop_interval()
            self._stop_interval = None

    @callback
    def items(self) -> list[dict[str, Any]]:
        return [dict(i) for i in self._items]

    @callback
    def fouten(self) -> dict[str, str]:
        return dict(self._fouten)

    async def _tik(self, _nu) -> None:
        await self.async_ververs()

    async def async_ververs(self) -> None:
        """Alle feeds ophalen. Een feed die faalt laat de andere met rust."""
        async with self._bezig:
            feeds = self._feeds_van()
            items: list[dict[str, Any]] = []
            fouten: dict[str, str] = {}
            for feed in feeds:
                naam = feed.get("naam") or feed["url"]
                try:
                    items.extend(await self._haal(feed["url"], naam))
                except Exception as fout:  # noqa: BLE001 - de fout gaat naar het beheer
                    fouten[feed["url"]] = str(fout) or fout.__class__.__name__
                    _LOGGER.info("Nieuwsbron %s niet opgehaald: %s", naam, fout)
            items.sort(key=lambda i: i["datum"] or "", reverse=True)
            self._items = items
            self._fouten = fouten
        self._meld()

    async def _haal(self, url: str, naam: str) -> list[dict[str, Any]]:
        sessie = async_get_clientsession(self._hass)
        async with sessie.get(
            url,
            timeout=aiohttp.ClientTimeout(total=FEED_TIMEOUT),
            headers={"User-Agent": "DomotiApp Infoscherm (Home Assistant)"},
        ) as antwoord:
            if antwoord.status != 200:
                raise ValueError(f"HTTP {antwoord.status}")
            # In stukken lezen tot het einde. `content.read(n)` geeft wat er
            # TOEVALLIG binnen is en niet de hele feed; zo kwam de NOS-feed op
            # 9 september 2026 half aan, met "unclosed CDATA section" als fout.
            delen: list[bytes] = []
            totaal = 0
            async for stuk in antwoord.content.iter_chunked(64 * 1024):
                totaal += len(stuk)
                if totaal > MAX_FEED_BYTES:
                    raise ValueError("de feed is groter dan 2 MB")
                delen.append(stuk)
        return parse_feed(b"".join(delen).decode("utf-8", errors="replace"), naam)
