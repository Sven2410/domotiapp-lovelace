"""De taal van wat de SERVER schrijft (0.81.0). Alles hier is **NIEUW GEDRAG**.

Vóór deze ronde schreef de integratie alleen Nederlands: de afvalmelding op de
telefoon, de knop "Staat buiten", de redenen die de proefknop toont, de tekst
van de wekker en de regel "Morgen 07:00", en de fouten bij het boeken van een
ruimte. Nu volgen ze de keuze Taal bij de integratie (`taal.py`).

De laatste toets is de controle uit de coach (`tools/vertaalcheck.py` daar):
elke zin in een `t()`, `vertaal()`, `tn()` of `nt()` in de Python-bron heeft
Engels, met dezelfde waarden tussen accolades en zonder gedachtestreepje.
"""

from __future__ import annotations

import ast
from datetime import datetime
import json
import pathlib
import re
from types import SimpleNamespace

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
import pytest

from custom_components.domotiapp_lovelace import loader
from custom_components.domotiapp_lovelace.alarm.meldingen import (
    KIND_SKIPPED_GRACE_WINDOW,
    KIND_SOUND_GONE,
    bouw_message,
)
from custom_components.domotiapp_lovelace.alarm.volgende import tekst_voor as volgende_tekst
from custom_components.domotiapp_lovelace.const import DATA_TAAL, DOMAIN
from custom_components.domotiapp_lovelace.infoscherm.ruimtes import valideer_boeking
from custom_components.domotiapp_lovelace.infoscherm.store import InfoFout
from custom_components.domotiapp_lovelace.meldingen import afval
from custom_components.domotiapp_lovelace.taal import ENGELS, t, taal_van, tn, vertaal

from .meldingen.conftest import motor, telefoons  # noqa: F401 - fixtures

AMS = dt_util.get_time_zone("Europe/Amsterdam")
BRON = pathlib.Path(__file__).resolve().parent.parent / "custom_components" / "domotiapp_lovelace"


def nep_hass(keuze: str | None, taal: str | None) -> SimpleNamespace:
    data = {} if keuze is None else {DOMAIN: {DATA_TAAL: keuze}}
    return SimpleNamespace(data=data, config=SimpleNamespace(language=taal))


@pytest.mark.parametrize(
    ("keuze", "ha_taal", "verwacht"),
    [
        ("nl", "en", "nl"),
        ("en", "nl", "en"),
        ("auto", "en", "en"),
        ("auto", "en-GB", "en"),
        ("auto", "nl", "nl"),
        ("auto", "de", "nl"),
        (None, "en", "en"),
        (None, "nl", "nl"),
        (None, None, "nl"),
        ("fr", "nl", "nl"),
    ],
)
def test_taal_van(keuze, ha_taal, verwacht) -> None:
    """De keuze wint; bij automatisch (of zonder keuze) Engels als Home Assistant 'en...' spreekt."""
    assert taal_van(nep_hass(keuze, ha_taal)) == verwacht


def test_t_en_tn() -> None:
    en = nep_hass("en", "nl")
    nl = nep_hass("nl", "en")
    assert t(en, "Vandaag al verstuurd") == "Already sent today"
    assert t(nl, "Vandaag al verstuurd") == "Vandaag al verstuurd"
    # Wat (nog) geen Engels heeft, blijft Nederlands.
    assert t(en, "Een zin die nergens staat") == "Een zin die nergens staat"
    assert t(en, "Morgen {wat}", wat="GFT") == "Tomorrow GFT"
    assert tn(en, 2, "Vandaag {wat}", "Morgen {wat}", wat="PMD") == "Tomorrow PMD"
    # Een accolade in een INGEVULDE waarde wordt niet nog eens ingevuld.
    assert vertaal("en", "Proef · {titel}", titel="{wat}") == "Test · {wat}"


def test_het_afvalbericht_in_het_nederlands_is_letterlijk_hetzelfde() -> None:
    """REGRESSIEWACHT: zonder taal, en met "nl", precies de zinnen van vóór 0.81.0."""
    for taal in ((), ("nl",)):
        assert afval.bericht("morgen", ["GFT"], *taal) == (
            "Morgen GFT",
            "Morgen wordt GFT opgehaald. Zet de container vanavond aan de straat.",
        )
        assert afval.bericht("vandaag", ["GFT", "PMD", "Papier"], *taal) == (
            "Vandaag GFT, PMD en Papier",
            "Vandaag worden GFT, PMD en Papier opgehaald. Zet de containers aan de straat "
            "als dat nog niet gebeurd is.",
        )


def test_het_afvalbericht_in_het_engels() -> None:
    """De namen van de bakken blijven zoals de sensor ze geeft; "en" wordt "and"."""
    assert afval.bericht("morgen", ["GFT"], "en") == (
        "Tomorrow GFT",
        "GFT will be collected tomorrow. Put the bin out tonight.",
    )
    assert afval.bericht("vandaag", ["GFT", "PMD", "Papier"], "en") == (
        "Today GFT, PMD and Papier",
        "GFT, PMD and Papier will be collected today. Put the bins out if that has not happened yet.",
    )


def om(dag: int, uur: int, minuut: int) -> datetime:
    return datetime(2026, 9, dag, uur, minuut, tzinfo=AMS)


async def test_de_afvalmelding_op_de_telefoon_in_het_engels(
    hass: HomeAssistant, motor, telefoons  # noqa: F811
) -> None:
    """Automatisch, met Home Assistant in het Engels: titel, tekst en de knop."""
    hass.config.language = "en"
    assert hass.data[DOMAIN][DATA_TAAL] == "auto"
    hass.states.async_set("sensor.afval_morgen", "Papier, Restafval")
    await motor._tik(om(26, 19, 30))

    assert [d for d, _ in telefoons] == ["test_bram", "test_anna"]
    data = telefoons[0][1]
    assert data["title"] == "Tomorrow Papier and Restafval"
    assert data["message"] == "Papier and Restafval will be collected tomorrow. Put the bins out tonight."
    assert data["data"]["actions"] == [
        {"action": "DOMOTIAPP_AFVAL_BUITEN|afval|2026-09-27", "title": "Put out"}
    ]
    # Het id van de knop en de tag blijven sleutels, in elke taal hetzelfde.
    assert data["data"]["tag"] == "domotiapp-afval-2026-09-27"

    # De reden die de proefknop op de kaart toont.
    uitkomst = await motor.async_verstuur("afval", "morgen", om(26, 19, 30))
    assert uitkomst == {"reden": "Already sent today"}


async def test_de_keuze_english_wint_van_een_nederlandse_home_assistant(
    hass: HomeAssistant, motor, telefoons  # noqa: F811
) -> None:
    assert hass.config.language == "nl"
    loader.zet_taal(hass, "en")
    hass.states.async_set("sensor.afval_morgen", "Geen")
    uitkomst = await motor.async_verstuur("afval", "morgen", om(26, 12, 0), proef=True)
    assert telefoons[0][1]["title"] == "Test · Tomorrow GFT"
    assert uitkomst["titel"] == "Test · Tomorrow GFT"

    uitkomst = await motor.async_verstuur("afval", "morgen", om(26, 12, 0))
    assert uitkomst == {"reden": "Nothing is being collected"}


async def test_zonder_keuze_blijft_het_nederlands(
    hass: HomeAssistant, motor, telefoons  # noqa: F811
) -> None:
    """REGRESSIEWACHT: Automatisch op een Nederlandse Home Assistant, net als vóór 0.81.0."""
    hass.states.async_set("sensor.afval_morgen", "gft")
    await motor._tik(om(26, 19, 30))
    data = telefoons[0][1]
    assert data["title"] == "Morgen GFT"
    assert data["message"] == "Morgen wordt GFT opgehaald. Zet de container vanavond aan de straat."
    assert data["data"]["actions"][0]["title"] == "Staat buiten"
    uitkomst = await motor.async_verstuur("afval", "morgen", om(26, 19, 30))
    assert uitkomst == {"reden": "Vandaag al verstuurd"}


def test_de_tekst_van_de_wekker() -> None:
    wekker = {"id": "w1", "time": "07:00", "sound": {"name": "Radio 1"}}
    nl = bouw_message(KIND_SOUND_GONE, wekker, ma_reden="Niet gevonden")
    en = bouw_message(KIND_SOUND_GONE, wekker, "en", ma_reden="Niet gevonden")
    assert nl["text"] == (
        "De wekker van 07:00 is niet afgegaan: het geluid 'Radio 1' kon niet gestart worden. "
        'Music Assistant meldde: "Niet gevonden". Controleer het geluid in Music Assistant, of kies een ander.'
    )
    assert en["text"] == (
        "The 07:00 alarm did not go off: the sound 'Radio 1' could not be started. "
        'Music Assistant said: "Niet gevonden". Check the sound in Music Assistant, or choose another one.'
    )
    # De soort blijft een sleutel.
    assert en["kind"] == nl["kind"] == KIND_SOUND_GONE
    assert bouw_message(KIND_SKIPPED_GRACE_WINDOW, wekker, "en")["text"] == (
        "Your 07:00 alarm did not go off; Home Assistant missed that moment."
    )


def test_de_regel_met_de_volgende_wekker() -> None:
    nu = datetime(2026, 8, 13, 22, 0, tzinfo=AMS)  # een donderdag
    assert volgende_tekst(datetime(2026, 8, 13, 23, 0, tzinfo=AMS), nu, "en") == "Today 23:00"
    assert volgende_tekst(datetime(2026, 8, 14, 7, 0, tzinfo=AMS), nu, "en") == "Tomorrow 07:00"
    assert volgende_tekst(datetime(2026, 8, 15, 8, 0, tzinfo=AMS), nu, "en") == "Saturday 08:00"
    nu = datetime(2026, 8, 10, 22, 0, tzinfo=AMS)  # een week eerder
    assert volgende_tekst(datetime(2026, 8, 17, 8, 0, tzinfo=AMS), nu, "en") == "Mon 17 Aug 08:00"
    assert volgende_tekst(datetime(2026, 8, 17, 8, 0, tzinfo=AMS), nu) == "ma 17 aug 08:00"


def test_een_boeking_die_niet_kan_in_het_engels() -> None:
    nu = datetime(2026, 10, 16, 12, 0, tzinfo=AMS)
    with pytest.raises(InfoFout, match="^this time has already passed$"):
        valideer_boeking("2026-10-15T09:00", "2026-10-15T10:00", "", nu, "en")
    with pytest.raises(InfoFout, match="^deze tijd is al voorbij$"):
        valideer_boeking("2026-10-15T09:00", "2026-10-15T10:00", "", nu)


# --- elke zin heeft Engels --------------------------------------------------


def _zinnen(pad: pathlib.Path) -> set[str]:
    """De letterlijke zinnen in t(), vertaal(), tn() en nt() van een bestand."""
    uit: set[str] = set()
    for knoop in ast.walk(ast.parse(pad.read_text(encoding="utf-8"))):
        if not isinstance(knoop, ast.Call):
            continue
        func = knoop.func
        naam = func.id if isinstance(func, ast.Name) else getattr(func, "attr", "")
        args = knoop.args
        kandidaten = {
            "t": args[1:2],
            "vertaal": args[1:2],
            "tn": args[2:4],
            "nt": args[:1],
        }.get(naam, [])
        for arg in kandidaten:
            if isinstance(arg, ast.Constant) and isinstance(arg.value, str):
                uit.add(arg.value)
    return uit


def test_elke_zin_van_de_server_heeft_engels() -> None:
    delen = {p.name: json.loads(p.read_text(encoding="utf-8")) for p in sorted(ENGELS.glob("*.json"))}
    samen: dict[str, str] = {}
    verschillend = []
    for deel, lijst in delen.items():
        for nl, en in lijst.items():
            if nl in samen and samen[nl] != en:
                verschillend.append(f"{nl!r} ({deel})")
            samen.setdefault(nl, en)
    assert not verschillend, verschillend

    gevonden: set[str] = set()
    ontbreekt: dict[str, list[str]] = {}
    for pad in sorted(BRON.rglob("*.py")):
        if pad.name == "taal.py":
            continue
        zinnen = _zinnen(pad)
        gevonden |= zinnen
        if mist := sorted(z for z in zinnen if z not in samen):
            ontbreekt[str(pad.relative_to(BRON))] = mist
    assert not ontbreekt, ontbreekt
    # De controle ziet echt iets: de afvalmelding en de wekker staan erin.
    assert "Staat buiten" in gevonden
    assert "Je wekker van {tijd} is niet afgegaan; Home Assistant heeft dat moment gemist." in gevonden

    waarden = lambda s: sorted(re.findall(r"\{(\w+)\}", s))  # noqa: E731
    assert [nl for nl, en in samen.items() if waarden(nl) != waarden(en)] == []
    assert [nl for nl, en in samen.items() if re.search(r"[—–]", en)] == []
