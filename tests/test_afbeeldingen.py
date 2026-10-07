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
VASTE_NAMEN = ["achtergrond.png"]

PNG_HANDTEKENING = b"\x89PNG\r\n\x1a\n"


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
