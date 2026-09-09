"""Uploaden en uitserveren. Alles **NIEUW GEDRAG**.

Vooral over wie er NIET bij mag, en over wat er NIET naar binnen mag.
"""

from __future__ import annotations

from aiohttp import FormData

from homeassistant.core import HomeAssistant

from .conftest import JPG, PNG, SVG

PAD = "/api/domotiapp_lovelace/infoscherm"


def _form(inhoud: bytes, naam: str = "logo.png") -> FormData:
    form = FormData()
    form.add_field("bestand", inhoud, filename=naam, content_type="application/octet-stream")
    return form


async def test_uploaden_en_terughalen(
    hass: HomeAssistant, infoscherm_op, store, hass_client
) -> None:
    client = await hass_client()
    antwoord = await client.post(f"{PAD}/upload", data=_form(PNG))
    assert antwoord.status == 200
    meta = await antwoord.json()
    assert meta["soort"] == "png"
    assert meta["naam"] == "logo.png"
    assert meta["grootte"] == len(PNG)
    assert store().bestand(meta["id"])["soort"] == "png"

    terug = await client.get(meta["url"])
    assert terug.status == 200
    assert terug.content_type == "image/png"
    assert await terug.read() == PNG
    assert terug.headers["X-Content-Type-Options"] == "nosniff"


async def test_de_soort_komt_uit_de_inhoud_niet_uit_de_naam(
    hass: HomeAssistant, infoscherm_op, hass_client
) -> None:
    client = await hass_client()
    antwoord = await client.post(f"{PAD}/upload", data=_form(JPG, naam="plaatje.png"))
    assert (await antwoord.json())["soort"] == "jpg"


async def test_een_svg_wordt_in_een_sandbox_uitgeserveerd(
    hass: HomeAssistant, infoscherm_op, hass_client
) -> None:
    client = await hass_client()
    meta = await (await client.post(f"{PAD}/upload", data=_form(SVG, naam="logo.svg"))).json()
    terug = await client.get(meta["url"])
    assert terug.content_type == "image/svg+xml"
    assert "sandbox" in terug.headers["Content-Security-Policy"]


async def test_geen_afbeelding_wordt_geweigerd(
    hass: HomeAssistant, infoscherm_op, hass_client
) -> None:
    client = await hass_client()
    antwoord = await client.post(f"{PAD}/upload", data=_form(b"MZ dit is een exe", naam="x.png"))
    assert antwoord.status == 415


async def test_zonder_inloggen_geen_upload_en_geen_bestand(
    hass: HomeAssistant, infoscherm_op, hass_client, hass_client_no_auth
) -> None:
    ingelogd = await hass_client()
    meta = await (await ingelogd.post(f"{PAD}/upload", data=_form(PNG))).json()

    anoniem = await hass_client_no_auth()
    assert (await anoniem.post(f"{PAD}/upload", data=_form(PNG))).status == 401
    assert (await anoniem.get(meta["url"])).status == 401


async def test_het_kioskaccount_mag_niet_uploaden(
    hass: HomeAssistant,
    infoscherm_op,
    store,
    hass_client,
    hass_read_only_user,
    hass_read_only_access_token,
) -> None:
    await store().async_zet_instellingen(
        {"kiosk_gebruikers": [hass_read_only_user.id]}, mag_kiosk_wijzigen=True
    )
    kiosk = await hass_client(hass_read_only_access_token)
    assert (await kiosk.post(f"{PAD}/upload", data=_form(PNG))).status == 403


async def test_een_onbekend_of_verwijderd_bestand_geeft_404(
    hass: HomeAssistant, infoscherm_op, hass_client, hass_ws_client
) -> None:
    client = await hass_client()
    assert (await client.get(f"{PAD}/bestand/01ARZ3NDEKTSV4RRFFQ69G5FAV")).status == 404
    assert (await client.get(f"{PAD}/bestand/../../configuration.yaml")).status == 404

    meta = await (await client.post(f"{PAD}/upload", data=_form(PNG))).json()
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id(
        {"type": "domotiapp_lovelace/infoscherm/bestand/verwijder", "bestand": meta["id"]}
    )
    antwoord = await ws.receive_json()
    assert antwoord["result"]["verwijderd"] is True
    assert (await client.get(meta["url"])).status == 404
