"""De commando's van het infoscherm en de rechten erop. Alles **NIEUW GEDRAG**."""

from __future__ import annotations

from homeassistant.core import HomeAssistant

from custom_components.domotiapp_lovelace.infoscherm import async_middernacht

from .conftest import stuur


async def test_get_geeft_een_lege_stand_met_rechten(
    hass: HomeAssistant, infoscherm_op, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)
    antwoord = await stuur(client, "get")
    assert antwoord["success"] is True
    r = antwoord["result"]
    assert r["stand"]["personen"] == []
    assert r["stand"]["praktijk"]["openingstijden"]["ma"] == []
    assert r["stand"]["scherm"]["terug_na"] == 60
    assert r["stand"]["installatie"]["weer"] is None
    assert [b["soort"] for b in r["stand"]["indeling"]["blokken"]][0] == "welkom"
    assert r["feeds"] == []
    assert r["mag_beheren"] is True
    assert r["is_admin"] is True


async def test_personen_opslaan_en_aanwezig_tikken(
    hass: HomeAssistant, infoscherm_op, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)
    opslaan = await stuur(
        client, "personen/save", personen=[{"naam": "Marieke de Vries", "functie": "Tandarts"}]
    )
    assert opslaan["success"] is True
    persoon = opslaan["result"]["personen"][0]
    assert persoon["initialen"] == "MV"
    assert persoon["aanwezig"] is False

    tik = await stuur(client, "aanwezig", persoon=persoon["id"], aanwezig=True)
    assert tik["success"] is True
    assert tik["result"]["persoon"]["aanwezig"] is True

    onbekend = await stuur(client, "aanwezig", persoon="bestaat-niet", aanwezig=True)
    assert onbekend["success"] is False
    assert onbekend["error"]["code"] == "not_found"


async def test_een_abonnee_krijgt_elke_wijziging(
    hass: HomeAssistant, infoscherm_op, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": "domotiapp_lovelace/infoscherm/subscribe"})
    inschrijving = await client.receive_json()
    assert inschrijving["success"] is True

    # Bewust niet via `stuur`: die leest één antwoord terug, en het eerste
    # bericht na een save is het stand-EVENT (dat gaat vóór het resultaat de
    # deur uit). `stuur` at dat event op, en de test zocht daarna vergeefs.
    await client.send_json_auto_id(
        {
            "type": "domotiapp_lovelace/infoscherm/mededelingen/save",
            "mededelingen": [{"tekst": "Vrijdag gesloten"}],
        }
    )
    # Het stand-event, het resultaat van save, en mogelijk een feeds-event van
    # de feedlezer die bij het opstarten zijn (lege) lijst meldt: de volgorde
    # is niet gegarandeerd, dus we zoeken het stand-event.
    stand = None
    gezien = []
    for _ in range(4):
        bericht = await client.receive_json()
        gezien.append((bericht.get("type"), bericht.get("event", {}).get("soort"), bericht.get("success")))
        if bericht.get("type") == "event" and bericht["event"]["soort"] == "stand":
            stand = bericht["event"]["stand"]
            break
    assert stand is not None, f"geen stand-event ontvangen; gezien: {gezien}"
    assert stand["mededelingen"][0]["tekst"] == "Vrijdag gesloten"


async def test_een_ongeldige_lijst_wordt_geweigerd_met_uitleg(
    hass: HomeAssistant, infoscherm_op, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)
    antwoord = await stuur(client, "personen/save", personen=[{"naam": ""}])
    assert antwoord["success"] is False
    assert antwoord["error"]["code"] == "invalid_format"
    assert "naam" in antwoord["error"]["message"]


async def test_het_kioskaccount_mag_tikken_maar_niet_beheren(
    hass: HomeAssistant,
    infoscherm_op,
    store,
    hass_ws_client,
    hass_read_only_user,
    hass_read_only_access_token,
) -> None:
    """Het scherm op de iPad zet aanwezig; de rest is voor de receptie."""
    await store().async_zet_instellingen(
        {"kiosk_gebruikers": [hass_read_only_user.id]}, mag_kiosk_wijzigen=True
    )
    personen = await store().async_zet_personen([{"naam": "Marieke"}])

    kiosk = await hass_ws_client(hass, hass_read_only_access_token)
    rechten = await stuur(kiosk, "get")
    assert rechten["result"]["mag_beheren"] is False
    assert rechten["result"]["is_admin"] is False

    tik = await stuur(kiosk, "aanwezig", persoon=personen[0]["id"], aanwezig=True)
    assert tik["success"] is True

    beheer = await stuur(kiosk, "personen/save", personen=[])
    assert beheer["success"] is False
    assert beheer["error"]["code"] == "unauthorized"
    # En de lijst staat er nog.
    assert len(store().snapshot()["personen"]) == 1


async def test_een_gewone_gebruiker_mag_wel_beheren_maar_geen_kiosk_aanwijzen(
    hass: HomeAssistant,
    infoscherm_op,
    store,
    hass_ws_client,
    hass_read_only_user,
    hass_read_only_access_token,
) -> None:
    """De receptie is geen admin, en dat mag geen belemmering zijn."""
    receptie = await hass_ws_client(hass, hass_read_only_access_token)
    antwoord = await stuur(
        receptie, "praktijk/save", praktijk={"naam": "De Molen", "welkom": ["Welkom"]}
    )
    assert antwoord["success"] is True
    assert antwoord["result"]["praktijk"]["naam"] == "De Molen"

    antwoord = await stuur(
        receptie, "instellingen/save", instellingen={"kiosk_gebruikers": [hass_read_only_user.id]}
    )
    assert antwoord["success"] is True
    assert antwoord["result"]["instellingen"]["kiosk_gebruikers"] == []

    gebruikers = await stuur(receptie, "gebruikers")
    assert gebruikers["success"] is False
    assert gebruikers["error"]["code"] == "unauthorized"


async def test_een_admin_ziet_de_gebruikers_en_wijst_de_kiosk_aan(
    hass: HomeAssistant, infoscherm_op, hass_ws_client, hass_read_only_user
) -> None:
    admin = await hass_ws_client(hass)
    gebruikers = await stuur(admin, "gebruikers")
    assert gebruikers["success"] is True
    ids = {g["id"] for g in gebruikers["result"]["gebruikers"]}
    assert hass_read_only_user.id in ids

    antwoord = await stuur(
        admin, "instellingen/save", instellingen={"kiosk_gebruikers": [hass_read_only_user.id]}
    )
    assert antwoord["result"]["instellingen"]["kiosk_gebruikers"] == [hass_read_only_user.id]


async def test_middernacht_zet_iedereen_op_afwezig_tenzij_uitgezet(
    hass: HomeAssistant, infoscherm_op, store
) -> None:
    personen = await store().async_zet_personen([{"naam": "A", "aanwezig": True}])
    assert personen[0]["aanwezig"] is True

    assert await async_middernacht(hass) == 1
    assert store().snapshot()["personen"][0]["aanwezig"] is False

    await store().async_zet_aanwezig(personen[0]["id"], True)
    await store().async_zet_instellingen({"reset_middernacht": False}, mag_kiosk_wijzigen=True)
    assert await async_middernacht(hass) == 0
    assert store().snapshot()["personen"][0]["aanwezig"] is True


# ------------------------------------------------------------- ronde 2 (NIEUW GEDRAG)


async def test_de_receptie_bewaart_scherm_en_indeling_maar_geen_entiteiten(
    hass: HomeAssistant,
    infoscherm_op,
    store,
    hass_ws_client,
    hass_read_only_access_token,
) -> None:
    """Alles wat de receptie in het beheer sleept en instelt gaat gewoon door;
    de entiteiten blijven van de installateur."""
    admin = await hass_ws_client(hass)
    r = await stuur(
        admin,
        "installatie/save",
        installatie={"weer": "weather.thuis", "verlichting": [{"entity": "light.a", "naam": "A"}]},
    )
    assert r["success"] is True
    assert r["result"]["installatie"]["weer"] == "weather.thuis"

    receptie = await hass_ws_client(hass, hass_read_only_access_token)
    r = await stuur(receptie, "scherm/save", scherm={"uiterlijk": "licht", "terug_na": 30})
    assert r["success"] is True
    assert r["result"]["scherm"]["uiterlijk"] == "licht"

    r = await stuur(
        receptie,
        "indeling/save",
        indeling={"blokken": [{"soort": "welkom", "x": 0, "y": 0, "w": 6, "h": 1, "aantal": 0}]},
    )
    assert r["success"] is True
    assert len(r["result"]["indeling"]["blokken"]) == 1

    r = await stuur(
        receptie,
        "installatie/save",
        installatie={
            "weer": None,
            "verlichting": [{"entity": "light.a", "naam": "Wachtkamer"}, {"entity": "light.z", "naam": "Z"}],
        },
    )
    assert r["success"] is True
    assert r["result"]["installatie"]["weer"] == "weather.thuis"
    assert r["result"]["installatie"]["verlichting"] == [{"entity": "light.a", "naam": "Wachtkamer"}]


async def test_een_overlappende_indeling_wordt_geweigerd(
    hass: HomeAssistant, infoscherm_op, hass_ws_client
) -> None:
    client = await hass_ws_client(hass)
    r = await stuur(
        client,
        "indeling/save",
        indeling={
            "blokken": [
                {"soort": "weer", "x": 0, "y": 0, "w": 2, "h": 2},
                {"soort": "nieuws", "x": 1, "y": 0, "w": 2, "h": 2},
            ]
        },
    )
    assert r["success"] is False
    assert r["error"]["code"] == "invalid_format"
    assert "overlappen" in r["error"]["message"]
