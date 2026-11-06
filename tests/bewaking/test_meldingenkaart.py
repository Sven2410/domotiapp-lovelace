"""De camerakaart en de meldingenkaart gekoppeld (0.109.0).

De eigenaar op 6 november 2026: *"Ik wil per persoon kunnen aanvinken wie welke
meldingen krijgt."* Wie wat krijgt staat in `meldingen/camera.py`.

**NIEUW GEDRAG**, behalve waar REGRESSIEWACHT staat.
"""

from __future__ import annotations

from types import SimpleNamespace

import pytest

from homeassistant.core import HomeAssistant

from custom_components.domotiapp_lovelace.bewaking.store import valideer_regel
from custom_components.domotiapp_lovelace.const import DOMAIN
from custom_components.domotiapp_lovelace.meldingen import camera
from custom_components.domotiapp_lovelace.meldingen.const import DATA_MOTOR, KAART_TYPE
from custom_components.domotiapp_lovelace.meldingen.websocket import stand

from ..meldingen.conftest import zet_dashboard
from .conftest import CAMERA, MELDER_PERSOON, MELDER_VOERTUIG, detecteer

BRAM = "person.bram"
ANNA = "person.anna"
TOM = "person.tom"
TUIN = "camera.tuin"
MELDER_TUIN = "binary_sensor.tuin_beweging"

MELDINGENKAART = {"type": KAART_TYPE, "afval": False, "camera": True, "personen": [BRAM, ANNA]}


# ------------------------------------------------------------ de pure regels


class Opslag:
    """Wat camera.py van de opslag vraagt, zonder Home Assistant."""

    def __init__(self, aan=None, keuzes=None):
        self.aan = aan or {}
        self.keuzes = keuzes or {}

    def aan_gezet(self, melding, persoon):
        return self.aan.get(persoon)

    def keuze(self, melding, persoon):
        return dict(self.keuzes.get(persoon, {}))


def regel(cam, melders, ontvangers=(), soorten=None):
    return SimpleNamespace(camera=cam, melders=list(melders), ontvangers=list(ontvangers), soorten=soorten or {})


OPRIT = regel(CAMERA, [MELDER_PERSOON, MELDER_VOERTUIG], [BRAM], {MELDER_PERSOON: "mens", MELDER_VOERTUIG: "voertuig"})
TUINREGEL = regel(TUIN, [MELDER_TUIN], [BRAM, ANNA])
REGELS = [OPRIT, TUINREGEL]


def test_wie_niets_koos_krijgt_wat_de_camerakaart_al_gaf() -> None:
    """Koppelen verandert niets: Anna stond alleen bij de tuin, Tom nergens."""
    leeg = Opslag()
    assert camera.keuze(leeg, "camera", BRAM, REGELS)["cameras"] == [CAMERA, TUIN]
    assert camera.keuze(leeg, "camera", ANNA, REGELS) == {
        "aan": True,
        "cameras": [TUIN],
        "soorten": ["mens", "voertuig", "beweging"],
    }
    assert camera.keuze(leeg, "camera", TOM, REGELS)["aan"] is False


def test_wie_het_zelf_aanzet_zonder_ontvanger_te_zijn_krijgt_alle_cameras() -> None:
    k = camera.keuze(Opslag(aan={TOM: True}), "camera", TOM, REGELS)
    assert k["aan"] is True
    assert k["cameras"] == [CAMERA, TUIN]


def test_een_melder_zonder_soort_telt_als_beweging() -> None:
    assert camera.soort_van(TUINREGEL, MELDER_TUIN) == "beweging"
    assert camera.soorten(REGELS) == ["mens", "voertuig", "beweging"]


def test_ontvangers_volgen_de_vinkjes_van_ieder() -> None:
    opslag = Opslag(aan={TOM: True}, keuzes={BRAM: {"soorten": ["voertuig"]}, TOM: {"cameras": [CAMERA]}})
    kies = lambda r, m: camera.ontvangers(  # noqa: E731
        r, m, personen=[BRAM, ANNA, TOM], opslag=opslag, melding="camera", regels=REGELS
    )
    # Bram wil op de oprit alleen voertuigen; Anna staat niet bij de oprit; Tom koos de oprit.
    assert kies(OPRIT, MELDER_PERSOON) == [TOM]
    assert kies(OPRIT, MELDER_VOERTUIG) == [BRAM, TOM]
    # De tuin: Bram (alle camera's, maar geen beweging gekozen) niet, Anna wel, Tom niet.
    assert kies(TUINREGEL, MELDER_TUIN) == [ANNA]


def test_wie_niet_op_de_meldingenkaart_staat_houdt_de_camerakaart() -> None:
    """REGRESSIEWACHT: zonder meldingenkaart, of voor wie er niet op staat."""
    assert camera.ontvangers(OPRIT, MELDER_PERSOON, personen=None, opslag=None, melding="camera", regels=REGELS) == [
        BRAM
    ]
    uit = camera.ontvangers(
        TUINREGEL, MELDER_TUIN, personen=[ANNA], opslag=Opslag(aan={ANNA: False}), melding="camera", regels=REGELS
    )
    assert uit == [BRAM]


def test_de_regel_bewaart_de_soort_per_melder() -> None:
    r = valideer_regel(
        {"camera": CAMERA, "melders": [MELDER_PERSOON], "soorten": {MELDER_PERSOON: "mens", "x.y": "onzin"}}
    )
    assert r.soorten == {MELDER_PERSOON: "mens"}
    # Een regel van voor 0.109.0 heeft ze niet.
    assert valideer_regel({"camera": CAMERA}).soorten == {}


# --------------------------------------------------------- met de motor erbij


@pytest.fixture
async def gekoppeld(hass: HomeAssistant, bewaking_op, zet_regel):
    hass.states.async_set(BRAM, "not_home", {"friendly_name": "Bram"})
    hass.states.async_set(ANNA, "not_home", {"friendly_name": "Anna"})
    await zet_regel(ontvangers=[BRAM], soorten={MELDER_PERSOON: "mens", MELDER_VOERTUIG: "voertuig"})
    await zet_dashboard(hass, [MELDINGENKAART])
    motor = hass.data[DOMAIN][DATA_MOTOR]
    await motor.async_herlees()
    return motor


async def test_de_meldingenkaart_beslist_wie_de_melding_krijgt(
    hass: HomeAssistant, gekoppeld, stuur_melding
) -> None:
    gekoppeld.opslag.zet_aan("camera", ANNA, True)
    gekoppeld.opslag.zet_keuze("camera", BRAM, "soorten", ["voertuig"])

    await detecteer(hass, MELDER_PERSOON)
    assert stuur_melding.await_args.kwargs["ontvangers"] == [ANNA]

    await detecteer(hass, MELDER_VOERTUIG)
    assert stuur_melding.await_args.kwargs["ontvangers"] == [BRAM, ANNA]


async def test_wie_alles_uitvinkt_krijgt_niets_maar_het_beeld_komt_er_wel(
    hass: HomeAssistant, gekoppeld, stuur_melding, index
) -> None:
    gekoppeld.opslag.zet_aan("camera", BRAM, False)
    await detecteer(hass, MELDER_PERSOON)
    stuur_melding.assert_not_awaited()
    assert len(index().alle()) == 1


async def test_zonder_camera_op_de_meldingenkaart_blijft_het_zoals_het_was(
    hass: HomeAssistant, gekoppeld, stuur_melding
) -> None:
    """REGRESSIEWACHT."""
    await zet_dashboard(hass, [{**MELDINGENKAART, "camera": False}])
    await gekoppeld.async_herlees()
    gekoppeld.opslag.zet_aan("camera", BRAM, False)

    await detecteer(hass, MELDER_PERSOON)
    assert stuur_melding.await_args.kwargs["ontvangers"] == [BRAM]


async def test_de_stand_zegt_wat_ieder_krijgt_en_wat_er_te_kiezen_is(hass: HomeAssistant, gekoppeld) -> None:
    s = stand(hass, "camera")
    assert s["bekend"] is True
    assert s["cameras"] == [CAMERA]
    assert s["soorten"] == ["mens", "voertuig"]
    # Anna was nergens ontvanger: uit, tot ze het zelf aanzet.
    assert s["aan"] == {BRAM: True, ANNA: False}
    assert s["keuzes"][BRAM] == {"cameras": [CAMERA], "soorten": ["mens", "voertuig"]}


async def test_de_keuze_overleeft_een_herstart(hass: HomeAssistant, gekoppeld) -> None:
    """Een vinkje staat in de opslag van de meldingen, niet in het geheugen."""
    from custom_components.domotiapp_lovelace.meldingen.store import MeldingOpslag

    gekoppeld.opslag.zet_aan("camera", ANNA, True)
    gekoppeld.opslag.zet_keuze("camera", ANNA, "soorten", ["voertuig"])
    # Wat de vertraagde schrijfronde na een seconde doet.
    await gekoppeld.opslag._store.async_save(gekoppeld.opslag._data)  # noqa: SLF001

    opnieuw = MeldingOpslag(hass)
    await opnieuw.async_load()
    assert opnieuw.aan_gezet("camera", ANNA) is True
    assert opnieuw.keuze("camera", ANNA) == {"soorten": ["voertuig"]}


async def test_een_proef_gaat_alleen_naar_die_persoon(hass: HomeAssistant, gekoppeld, stuur_melding) -> None:
    uit = await gekoppeld.async_verstuur("camera", "morgen", proef=True, alleen=ANNA)
    kw = stuur_melding.await_args.kwargs
    assert kw["ontvangers"] == [ANNA]
    assert kw["titel"] == "Proef · Oprit"
    assert kw["melder"] == "proef"
    assert uit["verstuurd"] == [ANNA]


async def test_buiten_de_proef_komt_een_cameramelding_niet_op_een_tijd(hass: HomeAssistant, gekoppeld) -> None:
    uit = await gekoppeld.async_verstuur("camera", "morgen")
    assert uit == {"reden": "Een cameramelding komt niet op een tijd"}
