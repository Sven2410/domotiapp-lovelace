"""De validatie en de opslag van het infoscherm. Alles **NIEUW GEDRAG**:
`custom_components/domotiapp_lovelace/infoscherm/` bestond niet vóór
9 september 2026."""

from __future__ import annotations

from datetime import datetime

import pytest

from homeassistant.core import HomeAssistant

from custom_components.domotiapp_lovelace.infoscherm.store import (
    InfoFout,
    InfoStore,
    initialen,
    valideer_instellingen,
    valideer_nieuws_item,
    valideer_persoon,
    valideer_praktijk,
    vandaag_open,
)


# ------------------------------------------------------------- initialen


@pytest.mark.parametrize(
    ("naam", "verwacht"),
    [
        ("Marieke de Vries", "MV"),
        ("Jeroen Bakker", "JB"),
        ("Sanne", "SA"),
        ("anouk van den berg", "AB"),
        ("", "?"),
    ],
)
def test_initialen(naam: str, verwacht: str) -> None:
    assert initialen(naam) == verwacht


# ------------------------------------------------------------- personen


def test_een_persoon_krijgt_een_id_en_initialen() -> None:
    p = valideer_persoon({"naam": "  Marieke de Vries  ", "functie": "Tandarts"})
    assert p["naam"] == "Marieke de Vries"
    assert p["initialen"] == "MV"
    assert p["aanwezig"] is False
    assert p["foto"] is None
    assert len(p["id"]) == 26


def test_een_bestaand_id_blijft_staan() -> None:
    p = valideer_persoon({"id": "abc123", "naam": "X"})
    assert p["id"] == "abc123"


def test_een_persoon_zonder_naam_wordt_geweigerd() -> None:
    with pytest.raises(InfoFout, match="naam"):
        valideer_persoon({"naam": "   "})


def test_een_foto_moet_een_bestands_id_zijn() -> None:
    with pytest.raises(InfoFout, match="foto"):
        valideer_persoon({"naam": "X", "foto": "../etc/passwd"})


# ------------------------------------------------------------- praktijk


def test_praktijk_openingstijden_worden_per_dag_gevuld() -> None:
    p = valideer_praktijk(
        {
            "naam": "De Molen",
            "openingstijden": {"ma": [["08:00", "17:00"]], "wo": [["08:00", "12:30"], ["13:30", "20:00"]]},
            "accent": "#0B8A6A",
        }
    )
    assert p["openingstijden"]["ma"] == [["08:00", "17:00"]]
    assert p["openingstijden"]["wo"] == [["08:00", "12:30"], ["13:30", "20:00"]]
    assert p["openingstijden"]["zo"] == []
    assert p["accent"] == "#0b8a6a"


def test_een_sluittijd_voor_de_opentijd_wordt_geweigerd() -> None:
    with pytest.raises(InfoFout, match="ligt niet vóór"):
        valideer_praktijk({"openingstijden": {"ma": [["17:00", "08:00"]]}})


def test_een_verkeerde_kleur_wordt_geweigerd() -> None:
    with pytest.raises(InfoFout, match="accent"):
        valideer_praktijk({"accent": "blauw"})


def test_uitzonderingen_worden_op_datum_gesorteerd_en_hebben_een_datum() -> None:
    p = valideer_praktijk(
        {
            "uitzonderingen": [
                {"datum": "2026-12-25", "reden": "Kerst"},
                {"datum": "2026-09-20", "tijden": [["08:00", "12:00"]]},
            ]
        }
    )
    assert [u["datum"] for u in p["uitzonderingen"]] == ["2026-09-20", "2026-12-25"]
    with pytest.raises(InfoFout, match="datum"):
        valideer_praktijk({"uitzonderingen": [{"reden": "zonder datum"}]})


def test_vandaag_open_volgt_de_dag_en_de_uitzondering() -> None:
    p = valideer_praktijk(
        {
            "openingstijden": {"wo": [["08:00", "17:00"]]},
            "uitzonderingen": [{"datum": "2026-09-16", "reden": "Studiedag"}],
        }
    )
    # Woensdag 9 september 2026, 10:00: open.
    assert vandaag_open(p, datetime(2026, 9, 9, 10, 0))["open"] is True
    # Dezelfde woensdag om 17:00: dicht (de sluittijd zelf telt niet meer).
    assert vandaag_open(p, datetime(2026, 9, 9, 17, 0))["open"] is False
    # Woensdag 16 september: de uitzondering wint, gesloten met reden.
    dag = vandaag_open(p, datetime(2026, 9, 16, 10, 0))
    assert dag == {"tijden": [], "reden": "Studiedag", "open": False}


# ------------------------------------------------------------- nieuws en instellingen


def test_een_nieuwsbericht_krijgt_een_aanmaaktijd() -> None:
    n = valideer_nieuws_item({"titel": "Nieuw", "gemaakt": "geen datum"})
    assert n["gemaakt"].startswith("20")
    assert n["vast"] is False


def test_een_nieuwsbron_moet_een_url_zijn() -> None:
    with pytest.raises(InfoFout, match="http"):
        valideer_instellingen({"feeds": [{"naam": "NOS", "url": "nos.nl"}]})
    i = valideer_instellingen({"feeds": [{"naam": "NOS", "url": "https://feeds.nos.nl/x"}]})
    assert i["feeds"] == [{"naam": "NOS", "url": "https://feeds.nos.nl/x"}]
    assert i["reset_middernacht"] is True


# ------------------------------------------------------------- de opslag


async def test_opslaan_en_terugladen(hass: HomeAssistant, hass_storage) -> None:
    store = InfoStore(hass)
    await store.async_load()
    personen = await store.async_zet_personen([{"naam": "Marieke de Vries"}, {"naam": "Jeroen"}])
    await store.async_zet_aanwezig(personen[0]["id"], True)

    opnieuw = InfoStore(hass)
    await opnieuw.async_load()
    stand = opnieuw.snapshot()
    assert [p["naam"] for p in stand["personen"]] == ["Marieke de Vries", "Jeroen"]
    assert stand["personen"][0]["aanwezig"] is True


async def test_de_receptie_overschrijft_de_aanwezigheid_van_de_ipad_niet(
    hass: HomeAssistant, hass_storage
) -> None:
    """De iPad zet iemand op aanwezig terwijl het beheer de lijst openhad.
    Opslaan van die lijst (zonder `aanwezig`) mag dat niet terugdraaien."""
    store = InfoStore(hass)
    await store.async_load()
    personen = await store.async_zet_personen([{"naam": "Marieke"}])
    pid = personen[0]["id"]
    await store.async_zet_aanwezig(pid, True)

    bijgewerkt = await store.async_zet_personen([{"id": pid, "naam": "Marieke de Vries"}])
    assert bijgewerkt[0]["aanwezig"] is True

    # Wordt `aanwezig` WEL meegestuurd, dan is dat een bewuste keuze in het beheer.
    bijgewerkt = await store.async_zet_personen([{"id": pid, "naam": "Marieke", "aanwezig": False}])
    assert bijgewerkt[0]["aanwezig"] is False


async def test_reset_zet_iedereen_op_afwezig(hass: HomeAssistant, hass_storage) -> None:
    store = InfoStore(hass)
    await store.async_load()
    personen = await store.async_zet_personen([{"naam": "A", "aanwezig": True}, {"naam": "B"}])
    assert await store.async_reset_aanwezig() == 1
    assert all(p["aanwezig"] is False for p in store.snapshot()["personen"])
    assert await store.async_reset_aanwezig() == 0
    del personen


async def test_een_kapot_item_in_de_opslag_sleept_de_rest_niet_mee(
    hass: HomeAssistant, hass_storage
) -> None:
    hass_storage["domotiapp_lovelace.infoscherm"] = {
        "version": 1,
        "minor_version": 1,
        "key": "domotiapp_lovelace.infoscherm",
        "data": {
            "personen": [{"naam": ""}, {"naam": "Goed"}],
            "nieuws": "geen lijst",
            "praktijk": {"accent": "kapot"},
        },
    }
    store = InfoStore(hass)
    await store.async_load()
    stand = store.snapshot()
    assert [p["naam"] for p in stand["personen"]] == ["Goed"]
    assert stand["nieuws"] == []
    assert stand["praktijk"]["accent"] is None


async def test_een_bestand_vergeten_haalt_de_verwijzingen_weg(
    hass: HomeAssistant, hass_storage
) -> None:
    store = InfoStore(hass)
    await store.async_load()
    bid = "01ARZ3NDEKTSV4RRFFQ69G5FAV"
    await store.async_registreer_bestand(bid, {"soort": "png", "naam": "logo.png", "grootte": 1})
    await store.async_zet_praktijk({"logo": bid})
    personen = await store.async_zet_personen([{"naam": "A", "foto": bid}])
    assert store.in_gebruik(bid) is True

    assert (await store.async_vergeet_bestand(bid))["soort"] == "png"
    stand = store.snapshot()
    assert stand["praktijk"]["logo"] is None
    assert stand["personen"][0]["foto"] is None
    assert store.in_gebruik(bid) is False
    del personen


async def test_alleen_een_admin_wijzigt_de_kioskaccounts(hass: HomeAssistant, hass_storage) -> None:
    store = InfoStore(hass)
    await store.async_load()
    await store.async_zet_instellingen({"kiosk_gebruikers": ["ipad"]}, mag_kiosk_wijzigen=True)
    assert store.is_kiosk("ipad") is True

    await store.async_zet_instellingen({"kiosk_gebruikers": []}, mag_kiosk_wijzigen=False)
    assert store.is_kiosk("ipad") is True
