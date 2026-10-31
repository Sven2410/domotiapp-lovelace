"""Wanneer een regel iets doet. Alles NIEUW GEDRAG."""

from __future__ import annotations

from datetime import timedelta

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from custom_components.domotiapp_lovelace.automatisering import regels
from custom_components.domotiapp_lovelace.automatisering.const import VAKANTIE_WISSEL_MIN

from .conftest import om, regel


async def _nl(hass: HomeAssistant) -> None:
    await hass.config.async_set_time_zone("Europe/Amsterdam")
    hass.config.latitude = 52.37
    hass.config.longitude = 4.89


async def test_een_tijd_is_de_klok_van_het_huis(hass: HomeAssistant) -> None:
    await _nl(hass)
    r = regel(id="x")
    assert regels.laatste_tussen(hass, r, om(2, 17, 59), om(2, 18, 0)) == (dt_util.as_utc(om(2, 18)), "aan")
    assert regels.laatste_tussen(hass, r, om(2, 18, 0), om(2, 18, 1)) is None


async def test_alleen_het_laatste_moment_telt(hass: HomeAssistant) -> None:
    """Aan en uit allebei gemist: de lamp hoort uit te zijn, niet eerst nog aan."""
    await _nl(hass)
    assert regels.laatste_tussen(hass, regel(id="x"), om(2, 17), om(2, 23, 30))[1] == "uit"


async def test_een_uit_voor_de_aan_is_de_volgende_dag(hass: HomeAssistant) -> None:
    await _nl(hass)
    r = regel(id="x", aan={"soort": "tijd", "tijd": "22:00"}, uit={"soort": "tijd", "tijd": "01:00"}, dagen=[0])
    # Alleen maandag aan, en dus dinsdagnacht uit.
    assert regels.laatste_tussen(hass, r, om(3, 0, 59), om(3, 1, 0)) == (dt_util.as_utc(om(3, 1)), "uit")
    assert regels.laatste_tussen(hass, r, om(2, 0, 59), om(2, 1, 0)) is None


async def test_de_dagen_gaan_over_de_aan(hass: HomeAssistant) -> None:
    await _nl(hass)
    r = regel(id="x", dagen=[1])  # dinsdag
    assert regels.laatste_tussen(hass, r, om(2, 17, 59), om(2, 18, 0)) is None
    assert regels.laatste_tussen(hass, r, om(3, 17, 59), om(3, 18, 0))[1] == "aan"


async def test_de_zon_met_een_verschuiving(hass: HomeAssistant) -> None:
    """Half uur voor zonsondergang valt precies een half uur eerder dan zonsondergang."""
    await _nl(hass)
    zon = regels.moment_op(hass, {"soort": "zonsondergang", "verschil": 0}, om(2, 12).date())
    voor = regels.moment_op(hass, {"soort": "zonsondergang", "verschil": -30}, om(2, 12).date())
    assert voor == zon - timedelta(minutes=30)
    # Begin november gaat de zon in Amsterdam tussen vijf en zes onder.
    assert 17 <= dt_util.as_local(zon).hour < 18
    opkomst = regels.moment_op(hass, {"soort": "zonsopkomst"}, om(2, 12).date())
    assert 7 <= dt_util.as_local(opkomst).hour < 8


async def test_een_dag_zonder_zonsondergang_doet_niets(hass: HomeAssistant) -> None:
    """Spitsbergen in juni: geen fout, geen moment."""
    await hass.config.async_set_time_zone("Arctic/Longyearbyen")
    hass.config.latitude = 78.2
    hass.config.longitude = 15.6
    dag = dt_util.parse_datetime("2026-06-21T12:00:00+00:00").date()
    assert regels.moment_op(hass, {"soort": "zonsondergang"}, dag) is None


async def test_een_regel_met_alleen_uit(hass: HomeAssistant) -> None:
    await _nl(hass)
    r = regel(id="x", aan=None)
    assert regels.laatste_tussen(hass, r, om(2, 22, 59), om(2, 23))[1] == "uit"


def test_de_wissel_is_vast_en_blijft_binnen_de_grens() -> None:
    dag = om(2, 12).date()
    assert regels.wissel("abc", dag, "aan") == regels.wissel("abc", dag, "aan")
    gezien = {regels.wissel("abc", dag + timedelta(days=i), "aan") for i in range(200)}
    assert all(-VAKANTIE_WISSEL_MIN <= x <= VAKANTIE_WISSEL_MIN for x in gezien)
    # Hij wisselt echt, en gebruikt beide kanten.
    assert len(gezien) > 10 and min(gezien) < 0 < max(gezien)


async def test_een_vakantieregel_schuift_mee_en_een_gewone_niet(hass: HomeAssistant) -> None:
    await _nl(hass)
    dag = om(2, 12).date()
    verschil = timedelta(minutes=regels.wissel("x", dag, "aan"))
    r = regel(id="x", vakantie=True, uit=None)
    op = dt_util.as_utc(om(2, 18)) + verschil
    assert regels.laatste_tussen(hass, r, op - timedelta(seconds=1), op) == (op, "aan")
    gewoon = regel(id="x", uit=None)
    assert regels.laatste_tussen(hass, gewoon, om(2, 17, 59), om(2, 18))[0] == dt_util.as_utc(om(2, 18))
