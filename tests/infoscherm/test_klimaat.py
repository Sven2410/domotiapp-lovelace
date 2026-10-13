"""De airco's op het infoscherm. Alles **NIEUW GEDRAG** (13 oktober 2026):
vóór deze ronde kende de opslag geen `klimaat`, en weigerde het raster een
blok van die soort.

Gevraagd op 13 oktober 2026: *"ik wil bij het infoscherm en beheer infoscherm
ook airco's hebben."* Ze lopen precies zoals de lampen: de installateur kiest
de entiteiten in de kaarteditor, de receptie geeft ze een naam en een
volgorde, en ze bepaalt of ze op het scherm staan en of je ze daar mag
bedienen.
"""

from __future__ import annotations

import pytest

from homeassistant.core import HomeAssistant

from custom_components.domotiapp_lovelace.infoscherm.const import MAX_AIRCOS
from custom_components.domotiapp_lovelace.infoscherm.store import (
    InfoFout,
    InfoStore,
    leeg_installatie,
    leeg_instellingen,
    valideer_indeling,
    valideer_installatie,
    valideer_instellingen,
)

from .conftest import stuur


def test_een_airco_is_een_climate_met_een_naam_en_dubbel_valt_weg() -> None:
    i = valideer_installatie(
        {
            "klimaat": [
                {"entity": "climate.kantoor_raam", "naam": "Raam"},
                "climate.kantoor_deur",
                "climate.kantoor_raam",
            ]
        }
    )
    assert i["klimaat"] == [
        {"entity": "climate.kantoor_raam", "naam": "Raam"},
        {"entity": "climate.kantoor_deur", "naam": ""},
    ]


@pytest.mark.parametrize("fout", ["light.lamp", "sensor.kamer_temperatuur", "switch.kantoor_raam_standby"])
def test_alleen_climate_mag_een_airco_zijn(fout: str) -> None:
    with pytest.raises(InfoFout, match="klimaat"):
        valideer_installatie({"klimaat": [fout]})


def test_niet_meer_dan_de_grens() -> None:
    te_veel = [f"climate.airco_{i}" for i in range(MAX_AIRCOS + 1)]
    with pytest.raises(InfoFout):
        valideer_installatie({"klimaat": te_veel})


def test_een_oude_opslag_zonder_klimaat_krijgt_een_lege_lijst() -> None:
    """Een installatie van vóór deze ronde heeft de sleutel niet. Het scherm
    leest hem onvoorwaardelijk, dus hij moet er zijn."""
    assert valideer_installatie({"weer": "weather.thuis"})["klimaat"] == []
    assert leeg_installatie()["klimaat"] == []


def test_tonen_en_bedienen_staan_standaard_aan_en_zijn_los_uit_te_zetten() -> None:
    assert leeg_instellingen()["klimaat_tonen"] is True
    assert leeg_instellingen()["klimaat_bedienen"] is True
    # Een beheerkaart van vóór deze ronde stuurt ze niet mee: dan blijven ze aan.
    oud = valideer_instellingen({"verlichting_tonen": True, "feeds": [], "kiosk_gebruikers": []})
    assert oud["klimaat_tonen"] is True
    assert oud["klimaat_bedienen"] is True
    nieuw = valideer_instellingen({"klimaat_tonen": True, "klimaat_bedienen": False})
    assert nieuw["klimaat_bedienen"] is False


def test_het_raster_kent_het_klimaatblok() -> None:
    i = valideer_indeling({"blokken": [{"soort": "klimaat", "x": 0, "y": 0, "w": 2, "h": 2, "aantal": 3}]})
    assert i["blokken"][0]["soort"] == "klimaat"


async def test_de_receptie_hernoemt_en_versleept_airco_s_maar_kiest_ze_niet(hass: HomeAssistant) -> None:
    store = InfoStore(hass)
    abc = [{"entity": f"climate.{x}", "naam": x.upper()} for x in "abc"]
    await store.async_zet_installatie({"klimaat": abc, "verlichting": ["light.a"]}, mag_entiteiten_wijzigen=True)
    uit = await store.async_zet_installatie(
        {
            "klimaat": [
                {"entity": "climate.c", "naam": "Wachtkamer"},
                {"entity": "climate.x", "naam": "Onbekend"},
                {"entity": "climate.a", "naam": "A"},
            ],
            "verlichting": [],
        },
        mag_entiteiten_wijzigen=False,
    )
    assert uit["klimaat"] == [
        {"entity": "climate.c", "naam": "Wachtkamer"},
        {"entity": "climate.a", "naam": "A"},
        {"entity": "climate.b", "naam": "B"},
    ]
    # De lampen raakt ze daarmee ook niet kwijt.
    assert [l["entity"] for l in uit["verlichting"]] == ["light.a"]


async def test_de_kaartconfig_laat_namen_en_volgorde_van_de_receptie_staan(hass: HomeAssistant) -> None:
    store = InfoStore(hass)
    await store.async_zet_installatie_van_kaart({"klimaat": ["climate.a", "climate.b"]})
    await store.async_zet_installatie(
        {"klimaat": [{"entity": "climate.b", "naam": "Balie"}, {"entity": "climate.a", "naam": ""}]},
        mag_entiteiten_wijzigen=False,
    )
    r = await store.async_zet_installatie_van_kaart({"klimaat": ["climate.a", "climate.b"]})
    assert r["gewijzigd"] is False
    assert r["installatie"]["klimaat"] == [
        {"entity": "climate.b", "naam": "Balie"},
        {"entity": "climate.a", "naam": ""},
    ]
    r = await store.async_zet_installatie_van_kaart({"klimaat": ["climate.c", "climate.b"]})
    assert r["gewijzigd"] is True
    assert r["installatie"]["klimaat"] == [
        {"entity": "climate.b", "naam": "Balie"},
        {"entity": "climate.c", "naam": ""},
    ]


async def test_klimaat_overleeft_opslaan_en_terugladen(hass: HomeAssistant, hass_storage) -> None:
    store = InfoStore(hass)
    await store.async_load()
    await store.async_zet_installatie({"klimaat": [{"entity": "climate.a", "naam": "Raam"}]}, mag_entiteiten_wijzigen=True)
    await store.async_zet_instellingen({**store.instellingen, "klimaat_bedienen": False}, mag_kiosk_wijzigen=True)
    opnieuw = InfoStore(hass)
    await opnieuw.async_load()
    stand = opnieuw.snapshot()
    assert stand["installatie"]["klimaat"] == [{"entity": "climate.a", "naam": "Raam"}]
    assert stand["instellingen"]["klimaat_bedienen"] is False


async def test_via_de_websocket_kiest_alleen_de_beheerder_de_airco_s(
    hass: HomeAssistant,
    infoscherm_op,
    hass_ws_client,
    hass_read_only_access_token,
) -> None:
    admin = await hass_ws_client(hass)
    r = await stuur(admin, "installatie/sync", installatie={"klimaat": ["climate.a", "climate.b"]})
    assert r["success"] is True
    assert [a["entity"] for a in r["result"]["installatie"]["klimaat"]] == ["climate.a", "climate.b"]

    receptie = await hass_ws_client(hass, hass_read_only_access_token)
    r = await stuur(receptie, "installatie/sync", installatie={"klimaat": ["climate.z"]})
    assert r["success"] is False

    r = await stuur(
        receptie,
        "installatie/save",
        installatie={"klimaat": [{"entity": "climate.b", "naam": "Balie"}, {"entity": "climate.z", "naam": "Z"}]},
    )
    assert r["success"] is True
    assert r["result"]["installatie"]["klimaat"] == [
        {"entity": "climate.b", "naam": "Balie"},
        {"entity": "climate.a", "naam": ""},
    ]

    r = await stuur(receptie, "instellingen/save", instellingen={"klimaat_tonen": True, "klimaat_bedienen": False})
    assert r["success"] is True
    assert r["result"]["instellingen"]["klimaat_bedienen"] is False
