"""Wat er in een afvalmelding staat. Alles **NIEUW GEDRAG**: `meldingen/` bestond
niet vóór deze ronde.

De automatisering die dit vervangt stuurde alleen iets bij precies `papier`,
`gft`, `pmd` of `restafval`. Hier is alles afval behalve wat "niets" betekent.
"""

from __future__ import annotations

import pytest

from custom_components.domotiapp_lovelace.meldingen import afval


@pytest.mark.parametrize(
    ("toestand", "verwacht"),
    [
        ("gft", ["GFT"]),
        ("GFT", ["GFT"]),
        ("pmd", ["PMD"]),
        ("papier", ["Papier"]),
        ("restafval", ["Restafval"]),
        # Wat de vaste lijst liet vallen:
        ("textiel", ["Textiel"]),
        ("kerstbomen", ["Kerstbomen"]),
        ("gft, papier", ["GFT", "Papier"]),
        ("gft en pmd", ["GFT", "PMD"]),
        # Een soort die niemand kent, krijgt een hoofdletter en gaat gewoon mee.
        ("snoeihout", ["Snoeihout"]),
        ("Grof Huisvuil", ["Grof Huisvuil"]),
    ],
)
def test_elke_soort_telt(toestand: str, verwacht: list[str]) -> None:
    assert afval.soorten(toestand) == verwacht


@pytest.mark.parametrize(
    "toestand",
    ["", None, "Geen", "geen", "none", "unknown", "unavailable", "-", "2026-09-27", "0"],
)
def test_niets_is_niets(toestand) -> None:
    assert afval.soorten(toestand) == []


def test_de_avond_ervoor() -> None:
    assert afval.bericht("morgen", ["GFT"]) == (
        "Morgen GFT",
        "Morgen wordt GFT opgehaald. Zet de container vanavond aan de straat.",
    )


def test_de_ochtend_zelf() -> None:
    assert afval.bericht("vandaag", ["PMD"]) == (
        "Vandaag PMD",
        "Vandaag wordt PMD opgehaald. Zet de container aan de straat als dat nog niet gebeurd is.",
    )


def test_twee_bakken_in_een_zin() -> None:
    titel, tekst = afval.bericht("morgen", ["GFT", "Papier"])
    assert titel == "Morgen GFT en Papier"
    assert tekst == "Morgen worden GFT en Papier opgehaald. Zet de containers vanavond aan de straat."
    assert afval.opsomming(["GFT", "PMD", "Papier"]) == "GFT, PMD en Papier"


@pytest.mark.parametrize(
    ("tijd", "verwacht"),
    [("07:30", "07:30"), ("7:30", "07:30"), ("19:30:00", "19:30"), ("25:00", None), ("", None), (None, None)],
)
def test_tijd(tijd, verwacht) -> None:
    assert afval.tijd_geldig(tijd) == verwacht
