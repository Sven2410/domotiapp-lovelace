"""De wifi voor gasten op het infoscherm. Alles **NIEUW GEDRAG** (16 oktober
2026): vóór deze ronde kende de opslag geen `installatie.wifi`, geen
`scherm.wifi_naam` en `wifi_wachtwoord`, en weigerde het raster een blok van
die soort.

Gevraagd op 16 oktober 2026: *"en ik wil een wifi gastennetwerk kaart hebben
dat ook op het dashboard kan ik heb een qr code van unifi als entiteit
namelijk"*. De QR-code kiest de installateur; de naam en het wachtwoord op het
scherm zijn van de receptie, want UniFi geeft het wachtwoord niet door.
"""

from __future__ import annotations

import pytest

from homeassistant.core import HomeAssistant

from custom_components.domotiapp_lovelace.infoscherm.const import MAX_KORT
from custom_components.domotiapp_lovelace.infoscherm.store import (
    InfoFout,
    InfoStore,
    leeg_installatie,
    leeg_scherm,
    valideer_indeling,
    valideer_installatie,
    valideer_scherm,
)

QR = "image.gastnetwerk_qr_code"


def test_de_wifi_is_een_image() -> None:
    assert valideer_installatie({"wifi": QR})["wifi"] == QR
    assert valideer_installatie({"wifi": ""})["wifi"] is None


@pytest.mark.parametrize("fout", ["camera.voordeur", "sensor.gastnetwerk_clients", "switch.gastnetwerk"])
def test_alleen_een_image_mag_de_wifi_zijn(fout: str) -> None:
    with pytest.raises(InfoFout, match="wifi"):
        valideer_installatie({"wifi": fout})


def test_een_oude_opslag_zonder_wifi_heeft_er_geen() -> None:
    assert valideer_installatie({"weer": "weather.thuis"})["wifi"] is None
    assert leeg_installatie()["wifi"] is None


def test_naam_en_wachtwoord_op_het_scherm_zijn_leeg_tenzij_ingevuld() -> None:
    assert leeg_scherm()["wifi_naam"] == ""
    assert leeg_scherm()["wifi_wachtwoord"] == ""
    # Een scherm van vóór deze ronde heeft de sleutels niet.
    oud = valideer_scherm({"uiterlijk": "licht"})
    assert oud["wifi_naam"] == ""
    assert oud["wifi_wachtwoord"] == ""
    nieuw = valideer_scherm({"wifi_naam": " Wifi voor patiënten ", "wifi_wachtwoord": "welkom 2026"})
    assert nieuw["wifi_naam"] == "Wifi voor patiënten"
    assert nieuw["wifi_wachtwoord"] == "welkom 2026"


def test_een_te_lang_wachtwoord_wordt_geweigerd() -> None:
    with pytest.raises(InfoFout, match="wifi_wachtwoord"):
        valideer_scherm({"wifi_wachtwoord": "x" * (MAX_KORT + 1)})


def test_het_raster_kent_het_wifiblok() -> None:
    i = valideer_indeling({"blokken": [{"soort": "wifi", "x": 0, "y": 0, "w": 2, "h": 2}]})
    assert i["blokken"][0]["soort"] == "wifi"


async def test_de_installateur_kiest_de_qr_en_de_receptie_niet(hass: HomeAssistant) -> None:
    store = InfoStore(hass)
    r = await store.async_zet_installatie_van_kaart({"wifi": QR})
    assert r["gewijzigd"] is True
    assert store.snapshot()["installatie"]["wifi"] == QR
    # De receptie stuurt een andere: die telt niet.
    await store.async_zet_installatie({"wifi": "image.kantoor_qr_code"}, mag_entiteiten_wijzigen=False)
    assert store.snapshot()["installatie"]["wifi"] == QR
    # Dezelfde kaartconfig nog eens: niets gewijzigd.
    assert (await store.async_zet_installatie_van_kaart({"wifi": QR}))["gewijzigd"] is False
