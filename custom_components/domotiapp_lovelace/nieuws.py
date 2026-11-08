"""Het nieuws voor de nieuwskaart: vaste bronnen en rubrieken, hooguit eens per kwartier opgehaald.

De eigenaar, 8 november 2026: "Ik wil ook wat je bij de receptie hebt iets van NOS nieuws. Dat kan een popup zijn en dan
in de navigatiebalk dat ik hem toevoeg. Dus een nieuwskaart". En daarna: "een navigatie menu bovenaan zoals NOS, AD etc
(...) en welke je aanklikt dan de sub catogorienen zoals algemeen, sport etc".

**Een vaste lijst, met opzet.** Bij het infoscherm stelt het beheer een eigen URL in, en die URL staat in de opslag van
de integratie. Een kaart heeft zo'n plek niet: wat er in een kaart staat, komt in een commando dat ELKE ingelogde
gebruiker kan sturen. Mocht dat commando een URL meekrijgen, dan kon iedereen met een account Home Assistant een adres
naar keuze laten ophalen, ook een adres in het eigen netwerk. Dus kiest de kaart een bron en een rubriek, en kent alleen
de server de adressen. Een bron erbij is een regel in `BRONNEN` hier, en dezelfde sleutels in `src/cards/nieuws-logica.js`;
`tests/test_nieuws.py` eist dat die twee gelijk zijn.

**Eén keer ophalen voor iedereen.** Elke rubriek staat een kwartier in het geheugen (`FEED_INTERVAL`, net als het
infoscherm). Tien tablets met dezelfde kaart halen hem dus één keer per kwartier op, niet tien keer. Na een herstart is
het geheugen leeg en haalt de eerste kaart die vraagt het opnieuw: dat is nieuws, geen stand die bewaard moet blijven.

De feed wordt gelezen door dezelfde lezer als bij het infoscherm (`infoscherm/feeds.py`), hooguit 15 berichten per feed.
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN
from .infoscherm.const import FEED_INTERVAL
from .infoscherm.feeds import async_haal_feed

_LOGGER = logging.getLogger(__name__)

DATA_NIEUWS = "nieuws"
DATA_WS = "nieuws_ws_registered"

_NOS = "https://feeds.nos.nl/"
_NU = "https://www.nu.nl/rss/"
_AD = "https://www.ad.nl/"

# bron -> (naam, {rubriek: adres}). Allemaal opgehaald en gelezen op 8 november 2026.
BRONNEN: dict[str, tuple[str, dict[str, str]]] = {
    "nos": (
        "NOS",
        {
            "algemeen": _NOS + "nosnieuwsalgemeen",
            "binnenland": _NOS + "nosnieuwsbinnenland",
            "buitenland": _NOS + "nosnieuwsbuitenland",
            "politiek": _NOS + "nosnieuwspolitiek",
            "economie": _NOS + "nosnieuwseconomie",
            "tech": _NOS + "nosnieuwstech",
            "opmerkelijk": _NOS + "nosnieuwsopmerkelijk",
            "cultuur": _NOS + "nosnieuwscultuurenmedia",
            "sport": _NOS + "nossportalgemeen",
            "voetbal": _NOS + "nosvoetbal",
        },
    ),
    "nu": (
        "NU.nl",
        {
            "algemeen": _NU + "Algemeen",
            "binnenland": _NU + "Binnenland",
            "buitenland": _NU + "Buitenland",
            "politiek": _NU + "Politiek",
            "economie": _NU + "Economie",
            "tech": _NU + "Tech",
            "wetenschap": _NU + "Wetenschap",
            "opmerkelijk": _NU + "Opmerkelijk",
            "entertainment": _NU + "Entertainment",
            "sport": _NU + "Sport",
            "voetbal": _NU + "Voetbal",
        },
    ),
    "ad": (
        "AD",
        {
            "algemeen": _AD + "home/rss.xml",
            "binnenland": _AD + "binnenland/rss.xml",
            "buitenland": _AD + "buitenland/rss.xml",
            "politiek": _AD + "politiek/rss.xml",
            "economie": _AD + "economie/rss.xml",
            "tech": _AD + "tech/rss.xml",
            "wetenschap": _AD + "wetenschap/rss.xml",
            "show": _AD + "show/rss.xml",
            "sport": _AD + "sport/rss.xml",
            "voetbal": _AD + "voetbal/rss.xml",
            "auto": _AD + "auto/rss.xml",
            "eten": _AD + "koken-en-eten/rss.xml",
            "gezond": _AD + "gezond/rss.xml",
        },
    ),
    "rtl": ("RTL Nieuws", {"algemeen": "https://www.rtlnieuws.nl/rss.xml"}),
    "telegraaf": ("De Telegraaf", {"algemeen": "https://www.telegraaf.nl/rss"}),
    "nrc": ("NRC", {"algemeen": "https://www.nrc.nl/rss/"}),
    "volkskrant": ("de Volkskrant", {"algemeen": "https://www.volkskrant.nl/voorpagina/rss.xml"}),
}

# Een fout mag na een minuut opnieuw, niet pas na een kwartier.
OPNIEUW_NA_FOUT = 60


class NieuwsCache:
    """Per rubriek de laatste berichten, en wanneer ze opgehaald zijn."""

    def __init__(self, hass: HomeAssistant, klok=time.monotonic) -> None:
        self._hass = hass
        self._klok = klok
        self._rubrieken: dict[tuple[str, str], dict[str, Any]] = {}
        self._sloten: dict[tuple[str, str], asyncio.Lock] = {}

    async def async_berichten(self, bron: str, rubriek: str) -> dict[str, Any]:
        """`{items, fout}`, vers als het ouder is dan een kwartier. Bij een fout blijft wat er was."""
        sleutel = (bron, rubriek)
        slot = self._sloten.setdefault(sleutel, asyncio.Lock())
        async with slot:
            nu = self._klok()
            oud = self._rubrieken.get(sleutel)
            if oud and nu < oud["geldig_tot"]:
                return {"items": oud["items"], "fout": oud["fout"]}
            naam, adressen = BRONNEN[bron]
            try:
                items = await async_haal_feed(self._hass, adressen[rubriek], naam)
                nieuw = {"items": items, "fout": None, "geldig_tot": nu + FEED_INTERVAL.total_seconds()}
            except Exception as fout:  # noqa: BLE001 - de kaart toont het, en houdt wat er was
                _LOGGER.info("Nieuws %s/%s niet opgehaald: %s", bron, rubriek, fout)
                nieuw = {
                    "items": oud["items"] if oud else [],
                    "fout": str(fout) or fout.__class__.__name__,
                    "geldig_tot": nu + OPNIEUW_NA_FOUT,
                }
            self._rubrieken[sleutel] = nieuw
            return {"items": nieuw["items"], "fout": nieuw["fout"]}


@callback
def async_zet_op(hass: HomeAssistant) -> None:
    data = hass.data.setdefault(DOMAIN, {})
    data.setdefault(DATA_NIEUWS, NieuwsCache(hass))
    if data.get(DATA_WS):
        return
    websocket_api.async_register_command(hass, ws_nieuws)
    data[DATA_WS] = True


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/nieuws",
        vol.Required("bron"): vol.In(list(BRONNEN)),
        vol.Required("rubriek"): vol.In(sorted({r for _, adressen in BRONNEN.values() for r in adressen})),
    }
)
@websocket_api.async_response
async def ws_nieuws(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Iedere ingelogde gebruiker: het zijn openbare berichten van vaste adressen."""
    if msg["rubriek"] not in BRONNEN[msg["bron"]][1]:
        connection.send_error(msg["id"], websocket_api.ERR_INVALID_FORMAT, f"{msg['bron']} heeft geen rubriek {msg['rubriek']}")
        return
    cache: NieuwsCache = hass.data[DOMAIN][DATA_NIEUWS]
    connection.send_result(msg["id"], await cache.async_berichten(msg["bron"], msg["rubriek"]))
