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


def test_het_leidende_dashboard_gaat_voor() -> None:
    """NIEUW GEDRAG, 6 oktober 2026.

    Bij de eigenaar stond dezelfde kaart op zijn hoofddashboard (22:00, net
    aangepast) en op een kopie voor de wandtablet (19:30). De kopie werd eerst
    gevonden en won; zijn wijziging deed niets. Het dashboard waar hij het
    laatst is aangepast hoort voor te gaan, waar het ook staat.
    """
    hoofd = {**KAART, "tijd_morgen": "22:00:00"}
    tablet = {**KAART, "tijd_morgen": "19:30:00"}
    gevonden = [("dashboard-test", tablet), ("", hoofd)]

    samen = kaarten.voeg_samen(gevonden, {"afval": ""})
    assert samen["afval"].tijden["morgen"] == "22:00"
    assert samen["afval"].dashboards == ["", "dashboard-test"]

    samen = kaarten.voeg_samen(gevonden, {"afval": "dashboard-test"})
    assert samen["afval"].tijden["morgen"] == "19:30"


def test_zonder_herinnering_gaat_het_standaarddashboard_voor() -> None:
    """NIEUW GEDRAG. Tot 0.55.0 won de eerste die Home Assistant teruggaf."""
    hoofd = {**KAART, "tijd_morgen": "22:00:00"}
    tablet = {**KAART, "tijd_morgen": "19:30:00"}
    samen = kaarten.voeg_samen([("dashboard-test", tablet), ("", hoofd)])
    assert samen["afval"].tijden["morgen"] == "22:00"


def test_overview_als_opgeslagen_dashboard_is_ook_het_standaarddashboard() -> None:
    """NIEUW GEDRAG. Bij de eigenaar heet Overview `lovelace` (HA 2026.8).

    Home Assistant geeft dat dashboard voorrang boven het oude zonder naam, en
    hier dus ook. Precies zijn situatie: de kopie wordt eerst gevonden.
    """
    hoofd = {**KAART, "tijd_morgen": "22:00:00"}
    tablet = {**KAART, "tijd_morgen": "19:30:00"}
    oud = {**KAART, "tijd_morgen": "07:00:00"}
    samen = kaarten.voeg_samen([("dashboard-test", tablet), ("", oud), ("lovelace", hoofd)])
    assert samen["afval"].tijden["morgen"] == "22:00"
    assert samen["afval"].dashboards == ["lovelace", "", "dashboard-test"]


def test_een_leidend_dashboard_zonder_de_kaart_telt_niet() -> None:
    """Weggehaald van het leidende dashboard: dan weer het standaarddashboard."""
    hoofd = {**KAART, "tijd_morgen": "22:00:00"}
    tablet = {**KAART, "tijd_morgen": "19:30:00"}
    samen = kaarten.voeg_samen([("dashboard-test", tablet), ("", hoofd)], {"afval": "weg"})
    assert samen["afval"].tijden["morgen"] == "22:00"


async def test_leest_de_echte_lovelace(hass: HomeAssistant) -> None:
    await zet_integratie_op(hass)
    assert await kaarten.async_lees(hass) == {}

    await zet_dashboard(hass, [{"type": "vertical-stack", "cards": [KAART]}])
    gelezen = await kaarten.async_lees(hass)
    assert list(gelezen) == ["afval"]
    assert gelezen["afval"].personen == [SVEN, LIEKE]
    assert gelezen["afval"].diensten == {SVEN: "test_sven", LIEKE: "test_lieke"}


# ---------------------------------------------------------------------------
# 0.50.0: de kaart is algemeen, en elke soort heeft een eigen schakelaar.
# ---------------------------------------------------------------------------


def test_afval_uit_op_de_kaart_verstuurt_niets() -> None:
    """NIEUW GEDRAG. De schakelaar Afvalmeldingen uit = geen afvalmelding.

    Op de code van vóór 0.50.0 kende de kaart geen schakelaar: hij WAS afval, en
    deze kaart leverde dus gewoon een melding op.
    """
    kaart = {**KAART, "afval": False}
    assert kaarten.melding_uit(kaart) is None
    assert kaarten.voeg_samen([("telefoon", kaart)]) == {}


def test_afval_aan_zonder_soort() -> None:
    """NIEUW GEDRAG. Een nieuwe kaart schrijft `afval: true` en geen `soort`."""
    kaart = {k: v for k, v in KAART.items() if k != "soort"}
    melding = kaarten.melding_uit({**kaart, "afval": True})
    assert melding is not None
    assert melding.id == "afval"
    assert melding.soort == "afval"


def test_een_eigen_id_blijft_het_id() -> None:
    """REGRESSIEWACHT. Onder het id staat opgeslagen wie er aan staat."""
    assert kaarten.melding_uit({**KAART, "afval": True, "id": "tweede-adres"}).id == "tweede-adres"


def test_een_kaart_van_voor_de_schakelaar_blijft_afval() -> None:
    """REGRESSIEWACHT. `soort: afval` zonder `afval`: dat is een kaart uit 0.48.0.

    Zo staat hij bij de eigenaar in zijn dashboard. Die moet na de update
    gewoon blijven versturen, onder hetzelfde id.
    """
    assert kaarten.melding_uit({**KAART, "soort": "afval"}).id == "afval"
    zonder_soort = {k: v for k, v in KAART.items() if k != "soort"}
    assert kaarten.melding_uit(zonder_soort).id == "afval"


def test_soort_aan_leest_zoals_de_kaart() -> None:
    """NIEUW GEDRAG. Dezelfde regel als `soortAan` in meldingen-logica.js."""
    assert kaarten.soort_aan({"afval": True}, "afval") is True
    assert kaarten.soort_aan({"afval": False, "soort": "afval"}, "afval") is False
    assert kaarten.soort_aan({"soort": "afval"}, "afval") is True
    assert kaarten.soort_aan({}, "afval") is True
    assert kaarten.soort_aan({"soort": "wasmachine"}, "afval") is False
