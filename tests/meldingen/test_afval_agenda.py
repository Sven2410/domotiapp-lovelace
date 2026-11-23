"""Een agenda als afvalbron (0.136.0). **NIEUW GEDRAG**, behalve de twee die
zeggen dat er niets komt: dat zijn **REGRESSIEWACHTEN** (ze slagen ook op de
code van daarvoor, want een agenda zonder lopende afspraak staat op "off").

Een bedrijf zonder afvalintegratie zet de ophaaldagen in een Lokale agenda: elke
ophaling een afspraak voor de hele dag, met de soort als titel. Zie de kop van
`meldingen/afval.py`. Op de code van daarvoor zegt de melding "On" of niets.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta

import pytest

from homeassistant.components.calendar import CalendarEntity, CalendarEvent
from homeassistant.components.calendar.const import DATA_COMPONENT
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
from homeassistant.util import dt as dt_util

from custom_components.domotiapp_lovelace.meldingen import afval

from .conftest import KAART, zet_dashboard

AMS = dt_util.get_time_zone("Europe/Amsterdam")
AGENDA = "calendar.afval"


def om(dag: int, uur: int, minuut: int) -> datetime:
    return datetime(2026, 9, dag, uur, minuut, tzinfo=AMS)


def ophaling(dag: date, soort: str) -> CalendarEvent:
    return CalendarEvent(start=dag, end=dag + timedelta(days=1), summary=soort)


class AfvalAgenda(CalendarEntity):
    def __init__(self) -> None:
        self.entity_id = AGENDA
        self._attr_name = "Afval"
        self.afspraken: list[CalendarEvent] = []

    @property
    def event(self) -> CalendarEvent | None:
        return None

    async def async_get_events(self, hass, start_date: datetime, end_date: datetime) -> list[CalendarEvent]:
        return [
            e for e in self.afspraken if e.start_datetime_local < end_date and e.end_datetime_local > start_date
        ]


@pytest.fixture
async def agenda(hass: HomeAssistant, motor):
    assert await async_setup_component(hass, "calendar", {})
    await hass.async_block_till_done()
    nep = AfvalAgenda()
    await hass.data[DATA_COMPONENT].async_add_entities([nep])
    await hass.async_block_till_done()
    await zet_dashboard(hass, [{**KAART, "afval_vandaag": AGENDA, "afval_morgen": AGENDA}])
    yield nep
    await nep.async_remove()
    await hass.async_block_till_done()


def test_de_soort_komt_uit_de_titels() -> None:
    assert afval.uit_titels(["Papier", "restafval", "Papier, PMD", "Geen ophaling", ""]) == [
        "Papier",
        "Restafval",
        "PMD",
    ]


async def test_de_avond_ervoor_noemt_de_afspraken_van_morgen(
    hass: HomeAssistant, motor, agenda, telefoons
) -> None:
    agenda.afspraken = [
        ophaling(date(2026, 9, 26), "GFT"),  # vandaag: hoort niet in de melding van morgen
        ophaling(date(2026, 9, 27), "Papier"),
        ophaling(date(2026, 9, 27), "Restafval"),
        ophaling(date(2026, 9, 28), "PMD"),
    ]
    await motor._tik(om(26, 19, 30))

    assert [d for d, _ in telefoons] == ["test_bram", "test_anna"]
    assert telefoons[0][1]["title"] == "Morgen Papier en Restafval"
    assert telefoons[0][1]["data"]["tag"] == "domotiapp-afval-2026-09-27"


async def test_de_ochtend_zelf_noemt_de_afspraken_van_vandaag(
    hass: HomeAssistant, motor, agenda, telefoons
) -> None:
    agenda.afspraken = [ophaling(date(2026, 9, 25), "Papier"), ophaling(date(2026, 9, 26), "gft")]
    await motor._tik(om(26, 7, 30))

    assert telefoons[0][1]["title"] == "Vandaag GFT"


async def test_zonder_afspraak_morgen_geen_melding(hass: HomeAssistant, motor, agenda, telefoons) -> None:
    """REGRESSIEWACHT: een ophaling vandaag of overmorgen is geen melding voor morgen."""
    agenda.afspraken = [ophaling(date(2026, 9, 26), "GFT"), ophaling(date(2026, 9, 29), "PMD")]
    uitkomst = await motor.async_verstuur("afval", "morgen", om(26, 19, 30))

    assert uitkomst == {"reden": "Er wordt niets opgehaald"}
    assert telefoons == []


async def test_de_pop_up_kent_de_bakken_van_de_komende_weken(hass: HomeAssistant, motor, agenda) -> None:
    """Een sensor noemt een bak pas de dag ervoor; een agenda noemt ze meteen."""
    vandaag = dt_util.now().date()
    agenda.afspraken = [
        ophaling(vandaag - timedelta(days=3), "Kerstbomen"),  # voorbij
        ophaling(vandaag + timedelta(days=2), "Papier"),
        ophaling(vandaag + timedelta(days=20), "Textiel"),
        ophaling(vandaag + timedelta(days=200), "Grofvuil"),  # te ver
    ]
    await motor.async_herlees()

    assert motor.opslag.gezien("afval") == ["Papier", "Textiel"]


async def test_een_agenda_die_er_niet_is_geeft_geen_fout(hass: HomeAssistant, motor, telefoons) -> None:
    """REGRESSIEWACHT. Na een herstart kan de agenda later komen dan de motor; dan gewoon niets."""
    await zet_dashboard(hass, [{**KAART, "afval_morgen": "calendar.bestaat_niet"}])
    uitkomst = await motor.async_verstuur("afval", "morgen", om(26, 19, 30))

    assert uitkomst == {"reden": "Er wordt niets opgehaald"}
