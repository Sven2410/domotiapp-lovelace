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
    standaard_indeling,
    valideer_indeling,
    valideer_installatie,
    valideer_instellingen,
    valideer_mededeling,
    valideer_verjaardag,
    valideer_persoon,
    valideer_praktijk,
    valideer_scherm,
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
        # NIEUW GEDRAG (10 september 2026): het laatste woord telt, ook zonder
        # hoofdletter. De oude regel gaf hier "PI" en "TE".
        ("Pieter van der berg", "PB"),
        ("Tessa de groot", "TG"),
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
    # Het accent hoort sinds ronde 2 bij `scherm`; in praktijk wordt het genegeerd.
    assert "accent" not in p


def test_een_sluittijd_voor_de_opentijd_wordt_geweigerd() -> None:
    with pytest.raises(InfoFout, match="ligt niet vóór"):
        valideer_praktijk({"openingstijden": {"ma": [["17:00", "08:00"]]}})


def test_een_verkeerde_kleur_wordt_geweigerd() -> None:
    with pytest.raises(InfoFout, match="accent"):
        valideer_scherm({"accent": "blauw"})


# ------------------------------------------------------------- scherm, installatie, indeling
# Alles hieronder is NIEUW GEDRAG van 10 september 2026: de kaartconfig is weg
# en deze drie onderdelen bestonden niet.


def test_scherm_heeft_standaarden_en_grenzen() -> None:
    s = valideer_scherm({"accent": "#0B8A6A", "terug_na": "90", "uiterlijk": "licht"})
    assert s["accent"] == "#0b8a6a"
    assert s["terug_na"] == 90
    assert s["uiterlijk"] == "licht"
    assert s["aanwezig_weergave"] == "gescheiden"
    assert s["schaal"] == 1.0
    with pytest.raises(InfoFout, match="uiterlijk"):
        valideer_scherm({"uiterlijk": "paars"})
    with pytest.raises(InfoFout, match="schaal"):
        valideer_scherm({"schaal": 9})


def test_installatie_eist_het_juiste_domein_en_ontdubbelt() -> None:
    i = valideer_installatie(
        {
            "weer": "weather.thuis",
            "agendas": ["calendar.praktijk", "calendar.praktijk"],
            "verlichting": [
                {"entity": "light.wachtkamer", "naam": "Wachtkamer"},
                "light.wachtkamer",
                "switch.balie",
            ],
        }
    )
    assert i["weer"] == "weather.thuis"
    assert i["agendas"] == ["calendar.praktijk"]
    assert [l["entity"] for l in i["verlichting"]] == ["light.wachtkamer", "switch.balie"]
    assert i["verlichting"][0]["naam"] == "Wachtkamer"
    with pytest.raises(InfoFout, match="weather"):
        valideer_installatie({"weer": "sensor.temperatuur"})
    with pytest.raises(InfoFout, match="calendar"):
        valideer_installatie({"agendas": ["light.x"]})


def test_indeling_standaard_past_in_het_raster_zonder_overlap() -> None:
    std = valideer_indeling(standaard_indeling())
    assert {b["soort"] for b in std["blokken"]} >= {"welkom", "weer", "aanwezig", "nieuws"}
    assert valideer_indeling(None) == standaard_indeling()


def test_indeling_weigert_overlap_en_buiten_het_raster() -> None:
    with pytest.raises(InfoFout, match="overlappen"):
        valideer_indeling(
            {
                "blokken": [
                    {"soort": "weer", "x": 0, "y": 0, "w": 2, "h": 2},
                    {"soort": "nieuws", "x": 1, "y": 1, "w": 2, "h": 2},
                ]
            }
        )
    with pytest.raises(InfoFout, match="buiten het raster"):
        valideer_indeling({"blokken": [{"soort": "weer", "x": 5, "y": 0, "w": 2, "h": 1}]})
    with pytest.raises(InfoFout, match="soort"):
        valideer_indeling({"blokken": [{"soort": "klok", "x": 0, "y": 0, "w": 1, "h": 1}]})


async def test_logo_en_accent_verhuizen_van_praktijk_naar_scherm(
    hass: HomeAssistant, hass_storage
) -> None:
    """Een opslag van 0.36.0 heeft het logo nog in praktijk. Eén keer overnemen."""
    bid = "01ARZ3NDEKTSV4RRFFQ69G5FAV"
    hass_storage["domotiapp_lovelace.infoscherm"] = {
        "version": 1,
        "minor_version": 1,
        "key": "domotiapp_lovelace.infoscherm",
        "data": {
            "praktijk": {"naam": "De Molen", "logo": bid, "accent": "#0B8A6A"},
            "bestanden": {bid: {"soort": "png", "naam": "logo.png", "grootte": 1}},
        },
    }
    store = InfoStore(hass)
    await store.async_load()
    stand = store.snapshot()
    assert stand["scherm"]["logo"] == bid
    assert stand["scherm"]["accent"] == "#0b8a6a"
    assert "logo" not in stand["praktijk"]
    assert store.in_gebruik(bid) is True


async def test_de_receptie_hernoemt_lampen_maar_kiest_ze_niet(
    hass: HomeAssistant, hass_storage
) -> None:
    store = InfoStore(hass)
    await store.async_load()
    await store.async_zet_installatie(
        {
            "weer": "weather.thuis",
            "verlichting": [{"entity": "light.a", "naam": "A"}, {"entity": "light.b", "naam": "B"}],
        },
        mag_entiteiten_wijzigen=True,
    )
    uit = await store.async_zet_installatie(
        {
            "weer": None,
            "verlichting": [{"entity": "light.a", "naam": "Wachtkamer"}, {"entity": "light.c", "naam": "C"}],
        },
        mag_entiteiten_wijzigen=False,
    )
    assert uit["weer"] == "weather.thuis"
    assert uit["verlichting"] == [
        {"entity": "light.a", "naam": "Wachtkamer"},
        {"entity": "light.b", "naam": "B"},
    ]


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


def test_een_mededeling_mag_een_tijdstip_dragen() -> None:
    """Ronde 3 (NIEUW GEDRAG): "vanaf 12:00 gesloten" is een grens met een tijd."""
    m = valideer_mededeling({"tekst": "Vanmiddag dicht", "van": "2026-09-20T12:00", "tot": "2026-09-20"})
    assert m["van"] == "2026-09-20T12:00"
    assert m["tot"] == "2026-09-20"
    assert valideer_mededeling({"tekst": "x", "van": "2026-09-20 08:30"})["van"] == "2026-09-20T08:30"
    with pytest.raises(InfoFout, match="datum"):
        valideer_mededeling({"tekst": "x", "van": "2026-09-20T25:00"})
    with pytest.raises(InfoFout, match="datum"):
        valideer_mededeling({"tekst": "x", "tot": "morgen"})


def test_een_verjaardag_heeft_een_naam_en_een_datum() -> None:
    """Ronde 3 (NIEUW GEDRAG)."""
    v = valideer_verjaardag({"naam": " Marieke ", "datum": "1990-09-10"})
    assert v["naam"] == "Marieke"
    assert v["datum"] == "1990-09-10"
    assert v["jaar_tonen"] is True
    assert v["id"]
    with pytest.raises(InfoFout, match="datum"):
        valideer_verjaardag({"naam": "X"})
    with pytest.raises(InfoFout, match="naam"):
        valideer_verjaardag({"naam": "", "datum": "1990-09-10"})


def test_een_nieuwsbron_moet_een_url_zijn() -> None:
    with pytest.raises(InfoFout, match="http"):
        valideer_instellingen({"feeds": [{"naam": "NOS", "url": "nos.nl"}]})
    i = valideer_instellingen({"feeds": [{"naam": "NOS", "url": "https://feeds.nos.nl/x"}]})
    assert i["feeds"] == [{"naam": "NOS", "url": "https://feeds.nos.nl/x"}]
    # De middernachtregel is er sinds ronde 3 niet meer.
    assert "reset_middernacht" not in i


def test_de_praktijk_is_alleen_nog_de_openingstijden() -> None:
    """Ronde 3: naam, adres en welkomsteksten worden genegeerd, niet geweigerd."""
    p = valideer_praktijk({"naam": "De Molen", "adres": "x", "welkom": ["Hoi"], "openingstijden": {"ma": [["08:00", "17:00"]]}})
    assert set(p) == {"openingstijden", "uitzonderingen"}
    assert p["openingstijden"]["ma"] == [["08:00", "17:00"]]


def test_scherm_kent_het_welkomblok_en_de_mededelingentijd_en_geen_nachtstand() -> None:
    """Ronde 3 (NIEUW GEDRAG)."""
    s = valideer_scherm({"welkom_tekst": "", "welkom_logo": True, "welkom_onder": False, "mededeling_interval": 7, "nachtstand": True})
    assert s["welkom_tekst"] == ""
    assert s["welkom_logo"] is True
    assert s["welkom_onder"] is False
    assert s["mededeling_interval"] == 7
    assert "nachtstand" not in s and "nieuws_afbeeldingen" not in s
    assert valideer_scherm({})["welkom_tekst"] == "Welkom"
    with pytest.raises(InfoFout, match="mededeling_interval"):
        valideer_scherm({"mededeling_interval": 1})


async def test_oud_nieuws_van_het_pand_wordt_een_mededeling(hass: HomeAssistant, hass_storage) -> None:
    """Ronde 3 (NIEUW GEDRAG): "Nieuws van het pand mag helemaal weg, dat moet
    gewoon mededelingen worden." Eén keer overgenomen bij het laden."""
    hass_storage["domotiapp_lovelace.infoscherm"] = {
        "version": 1,
        "minor_version": 1,
        "key": "domotiapp_lovelace.infoscherm",
        "data": {
            "mededelingen": [{"id": "m1", "tekst": "Bestond al"}],
            "nieuws": [
                {"id": "n1", "titel": "Nieuwe collega", "tekst": "Vanaf maandag.", "tot": "2026-12-31"},
                {"id": "n2", "titel": "", "tekst": ""},
            ],
            "praktijk": {"welkom": ["Welkom bij De Molen", "Fijn dat u er bent"]},
        },
    }
    store = InfoStore(hass)
    await store.async_load()
    stand = store.snapshot()
    assert [m["tekst"] for m in stand["mededelingen"]] == ["Bestond al", "Nieuwe collega\nVanaf maandag."]
    assert stand["mededelingen"][1]["tot"] == "2026-12-31"
    assert stand["scherm"]["welkom_tekst"] == "Welkom bij De Molen"
    assert "nieuws" not in stand
    # En weggeschreven, zodat het niet elke start opnieuw gebeurt.
    assert "nieuws" not in hass_storage["domotiapp_lovelace.infoscherm"]["data"]


async def test_de_kaart_stuurt_zijn_installatie_en_de_namen_blijven(hass: HomeAssistant) -> None:
    """Ronde 3 (NIEUW GEDRAG): de entiteiten komen uit de kaartconfig; de
    lampnamen zijn van de receptie en blijven staan."""
    store = InfoStore(hass)
    await store.async_zet_installatie(
        {"weer": "weather.oud", "verlichting": [{"entity": "light.a", "naam": "Wachtkamer"}]},
        mag_entiteiten_wijzigen=True,
    )
    r = await store.async_zet_installatie_van_kaart(
        {"weer": "weather.thuis", "agendas": ["calendar.x"], "verlichting": ["light.b", "light.a"], "kiosk_gebruikers": ["u1"]}
    )
    assert r["gewijzigd"] is True
    assert r["installatie"] == {
        "weer": "weather.thuis",
        "agendas": ["calendar.x"],
        "verlichting": [{"entity": "light.b", "naam": ""}, {"entity": "light.a", "naam": "Wachtkamer"}],
    }
    assert store.instellingen["kiosk_gebruikers"] == ["u1"]
    # Dezelfde config nog eens: niets gewijzigd.
    r = await store.async_zet_installatie_van_kaart(
        {"weer": "weather.thuis", "agendas": ["calendar.x"], "verlichting": ["light.b", "light.a"], "kiosk_gebruikers": ["u1"]}
    )
    assert r["gewijzigd"] is False
    with pytest.raises(InfoFout):
        await store.async_zet_installatie_van_kaart({"weer": "sensor.x"})


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


async def test_een_kapot_item_in_de_opslag_sleept_de_rest_niet_mee(
    hass: HomeAssistant, hass_storage
) -> None:
    hass_storage["domotiapp_lovelace.infoscherm"] = {
        "version": 1,
        "minor_version": 1,
        "key": "domotiapp_lovelace.infoscherm",
        "data": {
            "personen": [{"naam": ""}, {"naam": "Goed"}],
            "verjaardagen": [{"naam": "Zonder datum"}, {"naam": "Goed", "datum": "1990-01-01"}],
            "praktijk": {"openingstijden": "kapot"},
            "scherm": {"accent": "kapot"},
        },
    }
    store = InfoStore(hass)
    await store.async_load()
    stand = store.snapshot()
    assert [p["naam"] for p in stand["personen"]] == ["Goed"]
    assert [v["naam"] for v in stand["verjaardagen"]] == ["Goed"]
    assert stand["praktijk"]["openingstijden"]["ma"] == []
    assert stand["scherm"]["accent"] is None


async def test_een_bestand_vergeten_haalt_de_verwijzingen_weg(
    hass: HomeAssistant, hass_storage
) -> None:
    store = InfoStore(hass)
    await store.async_load()
    bid = "01ARZ3NDEKTSV4RRFFQ69G5FAV"
    await store.async_registreer_bestand(bid, {"soort": "png", "naam": "logo.png", "grootte": 1})
    await store.async_zet_scherm({"logo": bid})
    personen = await store.async_zet_personen([{"naam": "A", "foto": bid}])
    assert store.in_gebruik(bid) is True

    assert (await store.async_vergeet_bestand(bid))["soort"] == "png"
    stand = store.snapshot()
    assert stand["scherm"]["logo"] is None
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
