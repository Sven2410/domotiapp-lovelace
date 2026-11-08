"""Het nieuws voor de nieuwskaart: vaste bronnen en rubrieken, een kwartier in het geheugen. **NIEUW GEDRAG** (0.114.0).

`nieuws.py` bestond niet vóór deze ronde; op de code van ervoor faalt dit bestand bij het importeren.
"""

from __future__ import annotations

import json
from pathlib import Path
import re

from homeassistant.core import HomeAssistant

from custom_components.domotiapp_lovelace.const import DOMAIN
from custom_components.domotiapp_lovelace.nieuws import BRONNEN, DATA_NIEUWS, NieuwsCache

from .conftest import zet_integratie_op

NOS_ALGEMEEN = BRONNEN["nos"][1]["algemeen"]
AD_SPORT = BRONNEN["ad"][1]["sport"]


def rss(*items: tuple[str, str, str]) -> str:
    regels = "".join(
        f"<item><title>{titel}</title><link>{link}</link><pubDate>{datum}</pubDate>"
        f'<enclosure url="{link}.jpg" type="image/jpeg" length="1"/></item>'
        for titel, link, datum in items
    )
    return f'<?xml version="1.0"?><rss version="2.0"><channel><title>x</title>{regels}</channel></rss>'


ALGEMEEN = rss(
    ("Kabinet valt", "https://nos.nl/1", "Sun, 08 Nov 2026 09:00:00 +0100"),
    ("Storm op komst", "https://nos.nl/2", "Sun, 08 Nov 2026 11:00:00 +0100"),
)


async def vraag(hass: HomeAssistant, hass_ws_client, **bericht) -> dict:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/nieuws", **bericht})
    return await client.receive_json()


def test_de_kaart_kent_dezelfde_bronnen_en_rubrieken_als_de_server() -> None:
    bron = (Path(__file__).parent.parent / "src/cards/nieuws-logica.js").read_text(encoding="utf-8")
    blok = re.search(r"/\* bronnen \*/(.*?)/\* einde \*/", bron, re.S).group(1)
    kaart = json.loads(blok)
    server = {sleutel: {"naam": naam, "rubrieken": list(adressen)} for sleutel, (naam, adressen) in BRONNEN.items()}
    assert kaart == server


async def test_een_rubriek_nieuwste_eerst_met_de_naam_van_de_bron(hass: HomeAssistant, hass_ws_client, aioclient_mock) -> None:
    aioclient_mock.get(NOS_ALGEMEEN, text=ALGEMEEN)
    await zet_integratie_op(hass)

    antwoord = await vraag(hass, hass_ws_client, bron="nos", rubriek="algemeen")
    assert antwoord["success"] is True
    items = antwoord["result"]["items"]
    assert [i["titel"] for i in items] == ["Storm op komst", "Kabinet valt"]
    assert items[0]["afbeelding"] == "https://nos.nl/2.jpg"
    assert {i["bron"] for i in items} == {"NOS"}
    assert antwoord["result"]["fout"] is None


async def test_een_kwartier_lang_niet_opnieuw_opgehaald_en_per_rubriek(hass: HomeAssistant, aioclient_mock) -> None:
    aioclient_mock.get(NOS_ALGEMEEN, text=ALGEMEEN)
    aioclient_mock.get(AD_SPORT, text=ALGEMEEN)
    nu = [1000.0]
    cache = NieuwsCache(hass, klok=lambda: nu[0])

    await cache.async_berichten("nos", "algemeen")
    await cache.async_berichten("nos", "algemeen")
    assert aioclient_mock.call_count == 1
    await cache.async_berichten("ad", "sport")
    assert aioclient_mock.call_count == 2

    nu[0] += 15 * 60
    await cache.async_berichten("nos", "algemeen")
    assert aioclient_mock.call_count == 3


async def test_een_fout_houdt_wat_er_was_en_probeert_na_een_minuut_opnieuw(hass: HomeAssistant, aioclient_mock) -> None:
    aioclient_mock.get(NOS_ALGEMEEN, text=ALGEMEEN)
    nu = [1000.0]
    cache = NieuwsCache(hass, klok=lambda: nu[0])
    await cache.async_berichten("nos", "algemeen")

    aioclient_mock.clear_requests()
    aioclient_mock.get(NOS_ALGEMEEN, status=503)
    nu[0] += 15 * 60
    uit = await cache.async_berichten("nos", "algemeen")
    assert [i["titel"] for i in uit["items"]] == ["Storm op komst", "Kabinet valt"]
    assert uit["fout"] == "HTTP 503"

    nu[0] += 30
    await cache.async_berichten("nos", "algemeen")
    assert aioclient_mock.call_count == 1
    nu[0] += 31
    await cache.async_berichten("nos", "algemeen")
    assert aioclient_mock.call_count == 2


async def test_een_adres_of_een_onbekende_bron_of_rubriek_wordt_geweigerd(
    hass: HomeAssistant, hass_ws_client, aioclient_mock
) -> None:
    await zet_integratie_op(hass)
    for bericht in (
        {"bron": "http://192.168.1.1/admin", "rubriek": "algemeen"},
        {"bron": "nos", "rubriek": "http://192.168.1.1/admin"},
        {"bron": "telegraaf", "rubriek": "sport"},
        {"bron": "nos"},
    ):
        antwoord = await vraag(hass, hass_ws_client, **bericht)
        assert antwoord["success"] is False, bericht
        assert antwoord["error"]["code"] == "invalid_format"
    assert aioclient_mock.call_count == 0


async def test_de_cache_staat_klaar_na_het_opzetten(hass: HomeAssistant) -> None:
    await zet_integratie_op(hass)
    assert isinstance(hass.data[DOMAIN][DATA_NIEUWS], NieuwsCache)
