"""De meldingenkaarten uit de dashboards halen. Alles **NIEUW GEDRAG**.

De laatste test draait tegen de ECHTE Lovelace van Home Assistant. Dat is de
bewaking van `kaarten.async_lees`, dat interne Home Assistant gebruikt: verschuift
`LOVELACE_DATA` bij een update, dan valt deze test om in CI, en niet pas bij de
klant die om 19:30 geen melding krijgt.
"""

from __future__ import annotations

from homeassistant.core import HomeAssistant

from custom_components.domotiapp_lovelace.meldingen import kaarten
from custom_components.domotiapp_lovelace.meldingen.const import KAART_TYPE

from ..conftest import zet_integratie_op
from .conftest import KAART, LIEKE, SVEN, zet_dashboard


def test_de_kaart_wordt_overal_gevonden() -> None:
    """In een stapel, een voorwaardelijke kaart en een pop-up van bubble-card."""
    diep = {
        "views": [
            {"cards": [{"type": "vertical-stack", "cards": [{"type": KAART_TYPE, "n": 1}]}]},
            {"sections": [{"cards": [{"type": "conditional", "card": {"type": KAART_TYPE, "n": 2}}]}]},
            {"cards": [{"type": "custom:bubble-card", "card_type": "pop-up"},
                       {"type": "vertical-stack", "cards": [{"type": "custom:bubble-card"},
                                                             {"type": KAART_TYPE, "n": 3}]}]},
        ]
    }
    assert [k["n"] for k in kaarten.zoek_kaarten(diep)] == [1, 2, 3]


def test_een_lege_kaart_krijgt_de_tijden_van_zijn_automatisering() -> None:
    melding = kaarten.melding_uit({"type": KAART_TYPE, "afval_morgen": "sensor.x", "personen": [SVEN]})
    assert melding.id == "afval"
    assert melding.tijden == {"vandaag": "07:30", "morgen": "19:30"}
    # Geen sensor voor vandaag: dan is er geen ochtendmelding.
    assert melding.sensoren == {"morgen": "sensor.x"}


def test_alleen_personen_tellen() -> None:
    melding = kaarten.melding_uit(
        {"type": KAART_TYPE, "personen": [SVEN, "notify.iphone", SVEN, 5, LIEKE]}
    )
    assert melding.personen == [SVEN, LIEKE]


def test_een_onbekende_soort_verstuurt_niets() -> None:
    assert kaarten.melding_uit({"type": KAART_TYPE, "soort": "wasmachine"}) is None


def test_twee_kaarten_zijn_een_melding_met_alle_personen() -> None:
    telefoon = {**KAART, "personen": [SVEN]}
    tablet = {**KAART, "personen": [LIEKE, SVEN], "tijd_morgen": "20:00"}
    samen = kaarten.voeg_samen([("telefoon", telefoon), ("tablet", tablet)])
    assert list(samen) == ["afval"]
    assert samen["afval"].personen == [SVEN, LIEKE]
    # De instellingen van de eerste gaan voor.
    assert samen["afval"].tijden["morgen"] == "19:30"
    assert samen["afval"].dashboards == ["telefoon", "tablet"]


async def test_leest_de_echte_lovelace(hass: HomeAssistant) -> None:
    await zet_integratie_op(hass)
    assert await kaarten.async_lees(hass) == {}

    await zet_dashboard(hass, [{"type": "vertical-stack", "cards": [KAART]}])
    gelezen = await kaarten.async_lees(hass)
    assert list(gelezen) == ["afval"]
    assert gelezen["afval"].personen == [SVEN, LIEKE]
    assert gelezen["afval"].diensten == {SVEN: "test_sven", LIEKE: "test_lieke"}
