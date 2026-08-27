"""Het uitserveren van één beeld. Alles **NIEUW GEDRAG**.

Dit is de enige plek waar camerabeelden van een klant het huis uit gaan, dus
de tests gaan vooral over wie er NIET bij mag.
"""

from __future__ import annotations

from homeassistant.core import HomeAssistant

from .conftest import MELDER_PERSOON, detecteer

PAD = "/api/domotiapp_lovelace/beeld"


async def _eerste_beeld(hass, index) -> dict:
    return index().alle()[0]


async def test_een_ingelogde_gebruiker_krijgt_het_beeld(
    hass: HomeAssistant, bewaking_op, zet_regel, index, hass_client
) -> None:
    await zet_regel()
    await detecteer(hass, MELDER_PERSOON)
    beeld = await _eerste_beeld(hass, index)

    client = await hass_client()
    antwoord = await client.get(f"{PAD}/{beeld['id']}")

    assert antwoord.status == 200
    assert antwoord.content_type == "image/jpeg"
    assert await antwoord.read() == b"\xff\xd8\xff\xe0 nep-jpeg"


async def test_zonder_inloggen_krijg_je_niets(
    hass: HomeAssistant, bewaking_op, zet_regel, index, hass_client_no_auth
) -> None:
    await zet_regel()
    await detecteer(hass, MELDER_PERSOON)
    beeld = await _eerste_beeld(hass, index)

    client = await hass_client_no_auth()
    antwoord = await client.get(f"{PAD}/{beeld['id']}")

    assert antwoord.status == 401


async def test_een_ondertekende_url_werkt_zonder_header(
    hass: HomeAssistant, bewaking_op, zet_regel, hass_ws_client, hass_client_no_auth
) -> None:
    """Dit is waar een `<img>` op een dashboard op draait.

    Een `<img src>` stuurt geen Authorization-header mee. De handtekening die de
    kaart via het WebSocket-commando krijgt, is wat het beeld toch laat laden.
    """
    await zet_regel()
    await detecteer(hass, MELDER_PERSOON)

    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": "domotiapp_lovelace/bewaking/timeline"})
    url = (await ws.receive_json())["result"]["beelden"][0]["url"]

    client = await hass_client_no_auth()
    antwoord = await client.get(url)

    assert antwoord.status == 200
    assert await antwoord.read() == b"\xff\xd8\xff\xe0 nep-jpeg"


async def test_een_onbekend_id_geeft_404(
    hass: HomeAssistant, bewaking_op, hass_client
) -> None:
    client = await hass_client()
    antwoord = await client.get(f"{PAD}/01ZZZZZZZZZZZZZZZZZZZZZZZZ")
    assert antwoord.status == 404


async def test_een_id_dat_geen_ulid_is_wordt_niet_eens_gezocht(
    hass: HomeAssistant, bewaking_op, hass_client
) -> None:
    """De witte lijst uit `beelden.is_geldig_id`.

    Dit pad wordt een bestandsnaam. Een ID met puntjes of streepjes erin komt
    er niet doorheen, en dan is er geen discussie over waar het uitkomt.

    Niet altijd 404: `..%2F..%2Fsecrets.yaml` haalt onze view niet eens, want
    de `security_filter`-middleware van Home Assistant geeft daar zelf al 400
    op. Dat is een tweede slot en geen probleem -- waar het om gaat is dat er
    nooit een 200 uitkomt. De kleine letters in de laatste zijn er expres: een
    ULID is hoofdletters, en op macOS ziet het bestandssysteem geen verschil.
    """
    client = await hass_client()
    for slecht in ("..", "kort", "..%2F..%2Fsecrets.yaml", "01zzzzzzzzzzzzzzzzzzzzzzzz"):
        antwoord = await client.get(f"{PAD}/{slecht}")
        assert antwoord.status in (400, 404), f"{slecht} gaf {antwoord.status}"


async def test_een_beeld_wordt_lang_gecachet(
    hass: HomeAssistant, bewaking_op, zet_regel, index, hass_client
) -> None:
    """Het ID is uniek en de inhoud verandert nooit meer.

    Scheelt een wandtablet dat de timeline openhoudt een hoop verkeer.
    """
    await zet_regel()
    await detecteer(hass, MELDER_PERSOON)
    beeld = await _eerste_beeld(hass, index)

    client = await hass_client()
    antwoord = await client.get(f"{PAD}/{beeld['id']}")

    assert "immutable" in antwoord.headers["Cache-Control"]
