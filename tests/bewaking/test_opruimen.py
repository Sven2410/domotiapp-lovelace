"""De twee grenzen van de timeline: een week, en 500 per camera.

Pure functies, dus een gewone pytest zonder Home Assistant.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from custom_components.domotiapp_lovelace.bewaking.opruimen import (
    bepaal_opruiming,
    maak_ruimte,
    verweesd,
)

NU = datetime(2026, 8, 27, 12, 0, tzinfo=timezone.utc)
WEEK = timedelta(days=7)


def beeld(beeld_id: str, camera: str = "camera.oprit", *, minuten_terug: int = 0):
    return {
        "id": beeld_id,
        "camera": camera,
        "tijd": (NU - timedelta(minutes=minuten_terug)).isoformat(),
    }


def test_niets_weg_als_alles_vers_en_weinig():
    beelden = [beeld(f"b{i}", minuten_terug=i) for i in range(10)]
    assert bepaal_opruiming(beelden, nu=NU, max_leeftijd=WEEK, max_per_camera=500) == []


def test_ouder_dan_een_week_gaat_weg():
    beelden = [
        beeld("vers", minuten_terug=60),
        beeld("randje", minuten_terug=7 * 24 * 60),  # precies een week: blijft
        beeld("oud", minuten_terug=7 * 24 * 60 + 1),
    ]
    assert bepaal_opruiming(beelden, nu=NU, max_leeftijd=WEEK, max_per_camera=500) == [
        "oud"
    ]


def test_boven_de_500_gaat_de_oudste_eruit():
    beelden = [beeld(f"b{i}", minuten_terug=i) for i in range(503)]
    weg = bepaal_opruiming(beelden, nu=NU, max_leeftijd=WEEK, max_per_camera=500)
    # De drie oudste, dus de grootste minuten_terug.
    assert weg == ["b500", "b501", "b502"]


def test_de_grens_telt_per_camera_en_niet_over_het_geheel():
    """Een drukke oprit mag de achterdeur niet wegdrukken."""
    druk = [beeld(f"oprit{i}", "camera.oprit", minuten_terug=i) for i in range(6)]
    stil = [beeld("achter1", "camera.achterdeur", minuten_terug=100)]

    weg = bepaal_opruiming(druk + stil, nu=NU, max_leeftijd=WEEK, max_per_camera=5)

    assert weg == ["oprit5"]
    assert "achter1" not in weg


def test_maak_ruimte_gooit_er_een_uit_voordat_de_nieuwe_erbij_komt():
    """"En overschrijft hem": de oudste gaat eruit VOOR de nieuwe erin."""
    vol = [beeld(f"b{i}", minuten_terug=i) for i in range(5)]

    # Zonder de nieuwe erbij past het precies en hoeft er niets weg.
    assert bepaal_opruiming(vol, nu=NU, max_leeftijd=WEEK, max_per_camera=5) == []
    # Met de nieuwe erbij moet de oudste wijken.
    assert maak_ruimte(
        vol, camera="camera.oprit", nu=NU, max_leeftijd=WEEK, max_per_camera=5
    ) == ["b4"]


def test_maak_ruimte_kijkt_naar_de_juiste_camera():
    vol = [beeld(f"b{i}", "camera.oprit", minuten_terug=i) for i in range(5)]

    # Een nieuw beeld van een ANDERE camera duwt de oprit er niet uit.
    assert (
        maak_ruimte(
            vol, camera="camera.achterdeur", nu=NU, max_leeftijd=WEEK, max_per_camera=5
        )
        == []
    )


def test_maak_ruimte_lekt_de_plaatshouder_nooit():
    assert (
        maak_ruimte(
            [], camera="camera.oprit", nu=NU, max_leeftijd=WEEK, max_per_camera=0
        )
        == []
    )


@pytest.mark.parametrize(
    "kapot",
    [
        {"camera": "camera.oprit", "tijd": NU.isoformat()},  # geen id
        {"id": "x", "camera": "camera.oprit"},  # geen tijd
        {"id": "x", "camera": "camera.oprit", "tijd": "gisteren"},  # onleesbaar
        {"id": "x", "camera": "camera.oprit", "tijd": "2026-08-01T12:00:00"},  # naief
    ],
)
def test_wat_niet_te_lezen_is_blijft_staan(kapot):
    """Weggooien wat je niet begrijpt is de verkeerde kant om."""
    assert bepaal_opruiming(
        [kapot], nu=NU, max_leeftijd=WEEK, max_per_camera=500
    ) == []


def test_verweesd_wijst_beide_kanten_aan():
    beelden = [beeld("a"), beeld("b")]
    los_bestand, los_regel = verweesd(beelden, ["a", "zwerver"])
    assert los_bestand == ["zwerver"]
    assert los_regel == ["b"]
