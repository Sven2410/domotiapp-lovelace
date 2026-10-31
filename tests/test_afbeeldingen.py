"""De afbeeldingen die de integratie zelf meelevert.

Gevraagd op 7 oktober 2026: de standaardafbeeldingen van het
DomotiApp-dashboard moesten bij elke klant met de hand in /config/www. Nu levert
de integratie ze, net als de bundel, op een vast adres onder
/domotiapp_lovelace/afbeeldingen/. Ook zonder internet, want ze komen van de
eigen Home Assistant.

Die ADRESSEN zijn een belofte: ze staan in de dashboards van klanten. Een
afbeelding hernoemen of weghalen geeft daar een leeg vlak, zonder fout. Daarom
staat hier de lijst met namen die er moeten zijn, en valt deze test om als er
een ontbreekt.

NIEUW GEDRAG, behalve de twee tests die met REGRESSIEWACHT beginnen: geen
mapinhoud en niet buiten de map. Die slaagden vóór deze ronde vanzelf, want
er was geen map.

De tests gebruiken het adres LETTERLIJK en niet de constante: het adres is
het contract, en zo valt elke test op de oude code om zijn eigen reden om in
plaats van allemaal op één importfout.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from homeassistant.core import HomeAssistant

from custom_components.domotiapp_lovelace import const

from .alarm.conftest import zet_integratie_op

ADRES = "/domotiapp_lovelace/afbeeldingen"
MAP = Path(__file__).parent.parent / "custom_components" / "domotiapp_lovelace" / "afbeeldingen"

# De namen die in dashboards van klanten staan. Alleen aanvullen, nooit
# hernoemen of weghalen.
VASTE_NAMEN = [
    "achtergrond.png",
    # Sinds 0.57.0: de logo's van de competitiesensoren (zie test_competities.py).
    "eredivisie.png",
    "premierleague.png",
    "bundesliga.png",
    "laliga.png",
    "formule1.png",
]

PNG_HANDTEKENING = b"\x89PNG\r\n\x1a\n"

# Sinds 0.59.0: de foto's van de laadpalen, voor de laadpaalkaart. WebP, want
# met transparantie is dat een tiende van een PNG. Productfoto's van de
# fabrikant, gebruikt met toestemming van de eigenaar als installateur
# (11 oktober 2026). Ook hier: alleen aanvullen, nooit hernoemen of weghalen --
# een gekozen foto staat als pad in het dashboard.
VASTE_WEBP = [
    # Sinds 0.93.0: Fujitsu General op de airco-kaart. Met toestemming van de eigenaar
    # (31 oktober 2026).
    "aircos/fujitsu-general.webp",
    # Sinds 0.92.0: de weerstationkaart. Met toestemming van de eigenaar en van Shelly
    # (31 oktober 2026).
    "weerstations/shelly-blu-weather-station.webp",
    "laadpalen/easee-charge-up.webp",
    "laadpalen/easee-charge-max-pro.webp",
    "laadpalen/alfen-eve-single-plus.webp",
    "laadpalen/alfen-eve-double-plus.webp",
    # Sinds 0.60.0: de thuisbatterijkaart. Ook productfoto's, met toestemming van
    # de eigenaar als installateur (11 oktober 2026).
    "thuisbatterijen/anker-solarbank-max-ac.webp",
    "thuisbatterijen/anker-solarbank-max-ac-uitbreiding.webp",
    # Sinds 0.63.1: de airco-kaart. Productfoto van Mitsubishi Electric, met
    # toestemming van de eigenaar als installateur (13 oktober 2026).
    "aircos/mitsubishi-premium-onyx-black.webp",
    # Sinds 0.67.0: de robotstofzuigerkaart. Productfoto's van Dreame, met
    # toestemming van de eigenaar als installateur (15 oktober 2026).
    "robotstofzuigers/dreame-x50-ultra-complete.webp",
    "robotstofzuigers/dreame-l40s-pro-ultra.webp",
    # Sinds 0.68.1: de warmtepompboilerkaart. Productfoto van LG, met
    # toestemming van de eigenaar als installateur (15 oktober 2026).
    "warmtepompboilers/lg-wh27s.webp",
    # Sinds 0.69.0: Growatt op de thuisbatterijkaart. Productfoto van Growatt,
    # met toestemming van de eigenaar als installateur (15 oktober 2026).
    "thuisbatterijen/growatt-ark-15-3h.webp",
    # Sinds 0.70.0: Miele op de kaart voor vaatwasser, wasmachine en droger, en
    # de vriezerkaart. Productfoto's van Miele, met toestemming van de eigenaar
    # als installateur (15 oktober 2026).
    "wasmachines/miele-wwi880.webp",
    "wasdrogers/miele-twh780wp.webp",
    "vriezers/miele-fns-7710-e.webp",
    # de koelkast op de vriezerkaart (0.80.0), ook van Miele (18 oktober 2026)
    "koelkasten/miele-k-7747-c.webp",
    # Sinds 0.84.3: de printerkaart. Productfoto van HP, met toestemming van de
    # eigenaar als installateur (21 oktober 2026).
    "printers/hp-officejet-pro-9730e.webp",
]


def is_webp(data: bytes) -> bool:
    """RIFF....WEBP: de kop van elk WebP-bestand."""
    return data[:4] == b"RIFF" and data[8:12] == b"WEBP"


def test_het_adres_staat_vast() -> None:
    """Het adres zelf, letterlijk: het staat in dashboards van klanten."""
    assert getattr(const, "AFBEELDINGEN_URL_PATH", None) == ADRES


@pytest.mark.parametrize("naam", VASTE_NAMEN)
def test_de_afbeelding_is_meegeleverd(naam: str) -> None:
    """HACS levert wat er in de repo staat, dus de bestanden horen erin."""
    pad = MAP / naam
    assert pad.is_file(), f"{pad} ontbreekt"
    assert pad.read_bytes().startswith(PNG_HANDTEKENING)


@pytest.mark.parametrize("naam", VASTE_NAMEN)
async def test_de_afbeelding_wordt_geserveerd(
    hass: HomeAssistant, hass_client_no_auth, naam: str
) -> None:
    """Zonder token, als PNG, en byte voor byte het bestand uit de repo.

    Zonder token, want een `background-image` of een `<img>` stuurt er geen
    mee: een adres achter inloggen geeft in het dashboard een leeg vlak.
    """
    await zet_integratie_op(hass)
    client = await hass_client_no_auth()

    antwoord = await client.get(f"{ADRES}/{naam}")

    assert antwoord.status == 200
    assert antwoord.headers.get("Content-Type") == "image/png"
    assert await antwoord.read() == (MAP / naam).read_bytes()


async def test_geen_maand_in_de_browsercache(
    hass: HomeAssistant, hass_client_no_auth
) -> None:
    """Het adres verandert nooit, dus de inhoud mag niet een maand vastzitten.

    Met `cache_headers=True` zet Home Assistant `max-age` op 31 dagen. Dat is
    goed voor de bundel, die bij elke wijziging een nieuwe `?v=` krijgt, maar
    een vervangen achtergrond zou dan een maand lang de oude blijven.
    """
    await zet_integratie_op(hass)
    client = await hass_client_no_auth()

    antwoord = await client.get(f"{ADRES}/achtergrond.png")

    assert "max-age" not in antwoord.headers.get("Cache-Control", "")
    # Wel een ETag of Last-Modified, zodat de browser kan vragen of hij nog
    # klopt in plaats van alles opnieuw op te halen.
    assert antwoord.headers.get("ETag") or antwoord.headers.get("Last-Modified")


async def test_regressiewacht_de_map_toont_geen_inhoud(hass: HomeAssistant, hass_client_no_auth) -> None:
    """REGRESSIEWACHT: wat er in de map staat is geen lijst om door te bladeren."""
    await zet_integratie_op(hass)
    client = await hass_client_no_auth()

    for adres in (ADRES, f"{ADRES}/"):
        antwoord = await client.get(adres)
        assert antwoord.status in (403, 404), (adres, antwoord.status)


async def test_regressiewacht_niet_buiten_de_map(hass: HomeAssistant, hass_client_no_auth) -> None:
    """REGRESSIEWACHT: een pad met .. erin komt niet bij de rest van de integratie."""
    await zet_integratie_op(hass)
    client = await hass_client_no_auth()

    antwoord = await client.get(f"{ADRES}/..%2Fmanifest.json")

    assert antwoord.status != 200 or "domain" not in await antwoord.text()


@pytest.mark.parametrize("naam", VASTE_WEBP)
def test_de_laadpaalfoto_is_meegeleverd(naam: str) -> None:
    """NIEUW GEDRAG: de foto's van de laadpaalkaart staan in de repo, als WebP."""
    pad = MAP / naam
    assert pad.is_file(), f"{pad} ontbreekt"
    assert is_webp(pad.read_bytes())


@pytest.mark.parametrize("naam", VASTE_WEBP)
async def test_de_laadpaalfoto_wordt_geserveerd(
    hass: HomeAssistant, hass_client_no_auth, naam: str
) -> None:
    """NIEUW GEDRAG: zonder token, als WebP, uit een submap.

    Een submap is niets bijzonders voor de static path van Home Assistant,
    maar het adres is het contract, dus het wordt letterlijk opgevraagd.
    """
    await zet_integratie_op(hass)
    client = await hass_client_no_auth()

    antwoord = await client.get(f"{ADRES}/{naam}")

    assert antwoord.status == 200
    assert antwoord.headers.get("Content-Type") == "image/webp"
    assert await antwoord.read() == (MAP / naam).read_bytes()


async def test_regressiewacht_de_submap_toont_geen_inhoud(hass: HomeAssistant, hass_client_no_auth) -> None:
    """REGRESSIEWACHT: ook de map met laadpalen is geen lijst om door te bladeren.

    Slaagt ook zonder die map (dan is het een 404), maar valt om als iemand
    `show_index` aanzet voor de afbeeldingen.
    """
    await zet_integratie_op(hass)
    client = await hass_client_no_auth()

    for adres in (f"{ADRES}/laadpalen", f"{ADRES}/laadpalen/", f"{ADRES}/thuisbatterijen/"):
        antwoord = await client.get(adres)
        assert antwoord.status in (403, 404), (adres, antwoord.status)
