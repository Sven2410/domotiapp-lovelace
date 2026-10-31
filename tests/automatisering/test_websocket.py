"""De commando's van de kaart, ook als gewone gebruiker. Alles NIEUW GEDRAG."""

from __future__ import annotations

from typing import Any

import pytest

from homeassistant.core import HomeAssistant

from custom_components.domotiapp_lovelace.const import DOMAIN

from .conftest import GEHEIM, KEUKEN, WOONKAMER, regel

T = f"{DOMAIN}/automatisering"


@pytest.fixture
async def ws(hass: HomeAssistant, opgezet, hass_ws_client, hass_read_only_access_token):
    """Een gewone gebruiker: dat is de klant."""
    return await hass_ws_client(hass, hass_read_only_access_token)


async def _vraag(ws, **bericht: Any) -> dict[str, Any]:
    await ws.send_json_auto_id(bericht)
    return await ws.receive_json()


async def test_een_gewone_gebruiker_maakt_een_regel(ws, opgezet) -> None:
    uit = await _vraag(ws, type=f"{T}/opslaan", regel=regel())
    assert uit["success"], uit
    gemaakt = uit["result"]["regel"]
    assert gemaakt["id"] and gemaakt["actief"] is True and gemaakt["vakantie"] is False
    assert opgezet.opslag.regels == [gemaakt]


async def test_een_lamp_buiten_de_kaart_weigert_de_server(ws, opgezet) -> None:
    uit = await _vraag(ws, type=f"{T}/opslaan", regel=regel(lampen=[WOONKAMER, GEHEIM]))
    assert uit["success"] is False and uit["error"]["code"] == "not_allowed"
    assert opgezet.opslag.regels == []


async def test_een_lamp_die_van_de_kaart_ging_blokkeert_het_aanpassen_niet(ws, opgezet) -> None:
    opgezet.opslag.zet_regel({"id": "r1", "actief": True, "vakantie": False, **regel(lampen=[GEHEIM])})
    uit = await _vraag(ws, type=f"{T}/opslaan", regel={**regel(lampen=[GEHEIM], helderheid=20), "id": "r1"})
    assert uit["success"], uit
    assert opgezet.opslag.regels[0]["helderheid"] == 20


@pytest.mark.parametrize(
    "fout",
    [
        {"lampen": []},
        {"lampen": ["switch.iets"]},
        {"dagen": []},
        {"dagen": [7]},
        {"dagen": [1, 1]},
        {"helderheid": 0},
        {"helderheid": 101},
        {"aan": {"soort": "tijd", "tijd": "25:00"}},
        {"aan": {"soort": "zonsondergang", "verschil": 500}},
        {"aan": {"soort": "maan"}},
        {"aan": None, "uit": None},
    ],
)
async def test_wat_niet_klopt_komt_er_niet_in(ws, opgezet, fout) -> None:
    uit = await _vraag(ws, type=f"{T}/opslaan", regel=regel(**fout))
    assert uit["success"] is False, fout
    assert opgezet.opslag.regels == []


async def test_aanpassen_houdt_id_stand_en_groep(ws, opgezet) -> None:
    eerst = (await _vraag(ws, type=f"{T}/opslaan", regel=regel(vakantie=True)))["result"]["regel"]
    await _vraag(ws, type=f"{T}/actief", regel=eerst["id"], actief=False)
    tweede = await _vraag(ws, type=f"{T}/opslaan", regel=regel(id=eerst["id"], lampen=[KEUKEN], vakantie=False))
    assert tweede["success"], tweede
    nu = opgezet.opslag.regels
    assert len(nu) == 1
    assert nu[0]["id"] == eerst["id"] and nu[0]["lampen"] == [KEUKEN]
    assert nu[0]["actief"] is False and nu[0]["vakantie"] is True


async def test_verwijderen_en_uitzetten(ws, opgezet) -> None:
    r = (await _vraag(ws, type=f"{T}/opslaan", regel=regel()))["result"]["regel"]
    assert (await _vraag(ws, type=f"{T}/actief", regel=r["id"], actief=False))["success"]
    assert opgezet.opslag.regels[0]["actief"] is False
    assert (await _vraag(ws, type=f"{T}/verwijder", regel=r["id"]))["success"]
    assert opgezet.opslag.regels == []
    assert (await _vraag(ws, type=f"{T}/verwijder", regel=r["id"]))["error"]["code"] == "not_found"


async def test_het_abonnement_krijgt_elke_wijziging(ws, opgezet) -> None:
    assert (await _vraag(ws, type=f"{T}/subscribe"))["success"]
    eerste = await ws.receive_json()
    assert eerste["event"] == {"regels": [], "vakantie": False, "gekoppeld": None}
    await ws.send_json_auto_id({"type": f"{T}/vakantie", "aan": True})
    gezien = [await ws.receive_json() for _ in range(2)]
    gebeurtenis = next(g for g in gezien if g["type"] == "event")
    assert gebeurtenis["event"]["vakantie"] is True
    assert opgezet.vakantie is True


async def test_de_helderheid_per_lamp_wordt_bewaard(ws, opgezet) -> None:
    r = regel(lampen=[WOONKAMER, KEUKEN], helderheden={WOONKAMER: 60, KEUKEN: 25})
    uit = await _vraag(ws, type=f"{T}/opslaan", regel=r)
    assert uit["success"], uit
    assert opgezet.opslag.regels[0]["helderheden"] == {WOONKAMER: 60, KEUKEN: 25}


async def test_een_helderheid_van_een_lamp_die_er_niet_in_zit_valt_weg(ws, opgezet) -> None:
    r = regel(lampen=[WOONKAMER], helderheden={WOONKAMER: 60, KEUKEN: 25})
    assert (await _vraag(ws, type=f"{T}/opslaan", regel=r))["success"]
    assert opgezet.opslag.regels[0]["helderheden"] == {WOONKAMER: 60}


@pytest.mark.parametrize("fout", [{WOONKAMER: 0}, {WOONKAMER: 101}, {"switch.x": 50}])
async def test_een_verkeerde_helderheid_komt_er_niet_in(ws, opgezet, fout) -> None:
    uit = await _vraag(ws, type=f"{T}/opslaan", regel=regel(helderheden=fout))
    assert uit["success"] is False
    assert opgezet.opslag.regels == []


async def test_regressiewacht_een_kaart_van_voor_093_stuurt_een_helderheid(ws, opgezet) -> None:
    """REGRESSIEWACHT: een telefoon die de oude bundel nog vasthoudt, kan gewoon opslaan."""
    assert (await _vraag(ws, type=f"{T}/opslaan", regel=regel(helderheid=35)))["success"]
    assert opgezet.opslag.regels[0]["helderheid"] == 35
    assert "helderheden" not in opgezet.opslag.regels[0]


async def test_de_naam_wordt_bewaard_en_kan_weer_weg(ws, opgezet) -> None:
    """NIEUW GEDRAG (0.96.0)."""
    regel = {"lampen": ["light.woonkamer"], "aan": {"soort": "tijd", "tijd": "18:00"}, "dagen": [0]}
    antwoord = await _vraag(ws, type=f"{DOMAIN}/automatisering/opslaan", regel={**regel, "naam": "Avond beneden"})
    assert antwoord["success"]
    gemaakt = antwoord["result"]["regel"]
    assert gemaakt["naam"] == "Avond beneden"
    antwoord = await _vraag(ws, type=f"{DOMAIN}/automatisering/opslaan", regel={**regel, "id": gemaakt["id"]})
    assert "naam" not in antwoord["result"]["regel"]


async def test_een_te_lange_naam_komt_er_niet_in(ws, opgezet) -> None:
    """REGRESSIEWACHT (0.96.0): de oude server weigerde elke naam, deze alleen een te lange."""
    regel = {"lampen": ["light.woonkamer"], "aan": {"soort": "tijd", "tijd": "18:00"}, "dagen": [0], "naam": "x" * 61}
    antwoord = await _vraag(ws, type=f"{DOMAIN}/automatisering/opslaan", regel=regel)
    assert not antwoord["success"]


async def test_een_regel_mag_meer_dan_vijftig_lampen_hebben(ws, opgezet) -> None:
    """NIEUW GEDRAG (0.96.0): een kaart kan er 55 hebben; de lamp-toets blijft gelden."""
    lampen = [f"light.lamp_{i}" for i in range(55)]
    regel = {"lampen": lampen, "aan": {"soort": "tijd", "tijd": "18:00"}, "dagen": [0]}
    antwoord = await _vraag(ws, type=f"{DOMAIN}/automatisering/opslaan", regel=regel)
    # Niet door de vorm geweigerd, maar omdat deze lampen niet op de kaart staan.
    assert antwoord["error"]["code"] == "not_allowed"

