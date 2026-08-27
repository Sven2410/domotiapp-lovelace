"""Van een persoon naar zijn telefoon. Alles **NIEUW GEDRAG**.

Dit is het enige stuk van de keten dat op de testinstance niet in het echt aan
te tonen is: daar staat geen `mobile_app`. Vandaar dat het hier tot in de
dienstnaam wordt vastgelegd.
"""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr, entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.domotiapp_lovelace.bewaking import meldingen

TRACKER = "device_tracker.telefoon_van_sven"
PERSOON = "person.sven"


@pytest.fixture
def telefoon(hass: HomeAssistant, device_registry: dr.DeviceRegistry,
             entity_registry: er.EntityRegistry):
    """Een mobile_app-registratie zoals de companion-app hem aanmaakt.

    `device_name` is de naam waarop de notify-dienst geregistreerd wordt --
    `components/mobile_app/notify.py:148` levert de doelen aan als
    `{entry.data["device_name"]: webhook_id}`, en de legacy notify-laag maakt
    daar `slugify(f"mobile_app_{naam}")` van.
    """
    entry = MockConfigEntry(
        domain="mobile_app",
        data={"device_name": "iPhone van Sven", "webhook_id": "abc"},
    )
    entry.add_to_hass(hass)
    apparaat = device_registry.async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={("mobile_app", "toestel-1")},
        name="iPhone van Sven",
    )
    entity_registry.async_get_or_create(
        "device_tracker", "mobile_app", "toestel-1",
        suggested_object_id="telefoon_van_sven",
        config_entry=entry,
        device_id=apparaat.id,
    )
    hass.states.async_set(
        PERSOON, "not_home",
        {"friendly_name": "Sven", "device_trackers": [TRACKER]},
    )
    return entry


async def test_de_dienst_van_een_persoon_wordt_gevonden(
    hass: HomeAssistant, bewaking_op, telefoon
) -> None:
    hass.services.async_register("notify", "mobile_app_iphone_van_sven", lambda call: None)

    assert meldingen.dienst_voor(hass, PERSOON) == "mobile_app_iphone_van_sven"


async def test_een_dienst_die_niet_bestaat_wordt_niet_teruggegeven(
    hass: HomeAssistant, bewaking_op, telefoon
) -> None:
    """Een naam die er goed uitziet en niets doet, is erger dan geen naam.

    De editor toont wat hier uitkomt; `None` levert daar "geen telefoon
    gevonden" op, en dat is te zien. Een verzonnen dienstnaam niet.
    """
    assert meldingen.dienst_voor(hass, PERSOON) is None


async def test_een_persoon_zonder_mobiele_app_geeft_niets(
    hass: HomeAssistant, bewaking_op
) -> None:
    hass.states.async_set("person.gast", "home", {"friendly_name": "Gast"})
    assert meldingen.dienst_voor(hass, "person.gast") is None


async def test_de_url_bij_een_melding_is_absoluut_en_ondertekend(
    hass: HomeAssistant, bewaking_op
) -> None:
    """De telefoon opent de melding buiten de websocket om.

    Ondertekend namens de *content user* en niet namens wie toevallig de kaart
    openhad: een melding wordt uren later opengeklikt, en een handtekening van
    een gebruiker die zich inmiddels heeft afgemeld is dan waardeloos.
    """
    await hass.config.async_update(external_url="https://svenkool.ui.nabu.casa")

    url = meldingen.beeld_url(hass, "01AAAAAAAAAAAAAAAAAAAAAAAA")

    assert url.startswith("https://svenkool.ui.nabu.casa/api/domotiapp_lovelace/beeld/")
    assert "authSig=" in url


async def test_zonder_extern_adres_gaat_de_melding_zonder_beeld(
    hass: HomeAssistant, bewaking_op
) -> None:
    """Een melding zonder foto is een melding; geen melding is niets."""
    with patch(
        "custom_components.domotiapp_lovelace.bewaking.meldingen.get_url",
        side_effect=meldingen.NoURLAvailableError,
    ):
        assert meldingen.beeld_url(hass, "01AAAAAAAAAAAAAAAAAAAAAAAA") is None


async def test_de_melding_draagt_het_beeld_voor_android_en_ios(
    hass: HomeAssistant, bewaking_op, telefoon
) -> None:
    gebeld = []
    hass.services.async_register(
        "notify", "mobile_app_iphone_van_sven", lambda call: gebeld.append(call.data)
    )
    await hass.config.async_update(external_url="https://svenkool.ui.nabu.casa")

    gelukt = await meldingen.async_stuur(
        hass, ontvangers=[PERSOON], diensten={}, titel="Oprit", tekst="Persoon",
        beeld_id="01AAAAAAAAAAAAAAAAAAAAAAAA", camera="camera.oprit",
    )

    assert gelukt == ["mobile_app_iphone_van_sven"]
    data = gebeld[0]["data"]
    # `image` leest de Android-app, `attachment` leest iOS. Beide meesturen
    # scheelt een tabel met welk toestel wat kan.
    assert data["image"].startswith("https://svenkool.ui.nabu.casa/")
    assert data["attachment"]["url"] == data["image"]
    # Eén regel op het scherm per camera in plaats van een stapel.
    assert data["tag"] == "domotiapp-camera.oprit"


async def test_een_telefoon_die_weigert_houdt_de_andere_niet_tegen(
    hass: HomeAssistant, bewaking_op, telefoon
) -> None:
    hass.states.async_set(
        "person.partner", "not_home",
        {"friendly_name": "Partner", "device_trackers": []},
    )

    def stuk(call):
        raise RuntimeError("telefoon staat uit")

    hass.services.async_register("notify", "mobile_app_iphone_van_sven", stuk)
    gebeld = []
    hass.services.async_register("notify", "mobile_app_partner", lambda c: gebeld.append(c))

    gelukt = await meldingen.async_stuur(
        hass, ontvangers=[PERSOON, "person.partner"],
        diensten={"person.partner": "mobile_app_partner"},
        titel="Oprit", tekst="Persoon", beeld_id=None, camera="camera.oprit",
    )

    assert gelukt == ["mobile_app_partner"]
    assert len(gebeld) == 1


async def test_het_overzicht_toont_wie_er_een_telefoon_heeft(
    hass: HomeAssistant, bewaking_op, telefoon
) -> None:
    """De editor toont dit, zodat de klant het kan controleren."""
    hass.services.async_register("notify", "mobile_app_iphone_van_sven", lambda c: None)
    hass.states.async_set("person.gast", "home", {"friendly_name": "Gast"})

    overzicht = meldingen.overzicht(hass)

    assert overzicht == [
        {"entity_id": "person.gast", "naam": "Gast", "dienst": None, "thuis": True},
        {
            "entity_id": PERSOON,
            "naam": "Sven",
            "dienst": "mobile_app_iphone_van_sven",
            "thuis": False,
        },
    ]
