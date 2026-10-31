"""De klok, de herstart en de vakantiemodus. Alles NIEUW GEDRAG."""

from __future__ import annotations

from datetime import timedelta

from homeassistant.core import HomeAssistant
from homeassistant.const import EVENT_HOMEASSISTANT_STOP
from homeassistant.util import dt as dt_util

from custom_components.domotiapp_lovelace.automatisering import regels as regelmaker
from custom_components.domotiapp_lovelace.automatisering.const import (
    DATA_MOTOR,
    STORAGE_KEY,
    VAKANTIE_ENTITY_ID,
)
from custom_components.domotiapp_lovelace.const import DOMAIN

from ..conftest import zet_integratie_op
from .conftest import GEHEIM, KAART, KEUKEN, WOONKAMER, laat_starten, om, regel, tik, zet_dashboard


def _maak(motor, **extra):
    r = {"id": extra.pop("id", "r1"), "actief": True, "vakantie": False, **regel(**extra)}
    motor.opslag.zet_regel(r)
    motor.regels_gewijzigd()
    return r


async def test_de_regel_doet_zijn_werk_op_tijd(hass: HomeAssistant, opgezet, lampen, freezer) -> None:
    _maak(opgezet)
    await tik(hass, freezer, om(2, 17, 59))
    assert lampen == []
    await tik(hass, freezer, om(2, 18))
    assert lampen == [("turn_on", {"entity_id": [WOONKAMER], "brightness_pct": 60})]
    await tik(hass, freezer, om(2, 18, 1))
    assert len(lampen) == 1
    await tik(hass, freezer, om(2, 23))
    assert lampen[-1] == ("turn_off", {"entity_id": [WOONKAMER]})


async def test_een_regel_die_uit_staat_doet_niets(hass: HomeAssistant, opgezet, lampen, freezer) -> None:
    r = _maak(opgezet)
    opgezet.opslag.zet_regel({**r, "actief": False})
    await tik(hass, freezer, om(2, 18))
    assert lampen == []


async def test_een_lamp_die_van_de_kaart_ging_wordt_niet_meer_geschakeld(
    hass: HomeAssistant, opgezet, lampen, freezer
) -> None:
    _maak(opgezet, lampen=[WOONKAMER, GEHEIM])
    await tik(hass, freezer, om(2, 18))
    assert lampen[0][1]["entity_id"] == [WOONKAMER]


async def test_een_nieuwe_regel_haalt_niets_in(hass: HomeAssistant, opgezet, lampen, freezer) -> None:
    """Een regel van 18:00 gemaakt om 20:00 gaat vandaag niet meer aan."""
    await tik(hass, freezer, om(2, 20))
    _maak(opgezet, uit=None)
    await tik(hass, freezer, om(2, 20, 1))
    assert lampen == []


# ------------------------------------------------------------------- de herstart


async def _herstart(hass: HomeAssistant, freezer, tot) -> object:
    """Stop de integratie met wegschrijven, en start hem opnieuw op dit tijdstip."""
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    hass.bus.async_fire(EVENT_HOMEASSISTANT_STOP)
    await hass.async_block_till_done()
    await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    freezer.move_to(tot)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    motor = hass.data[DOMAIN][DATA_MOTOR]
    await laat_starten(hass, freezer, tot)
    return motor


async def test_een_gemist_moment_wordt_ingehaald(hass: HomeAssistant, opgezet, lampen, freezer) -> None:
    """Aan om 18:00, Home Assistant weg van 17:50 tot 18:30: de lamp gaat alsnog aan."""
    _maak(opgezet)
    await tik(hass, freezer, om(2, 17, 50))
    await _herstart(hass, freezer, om(2, 18, 30))
    assert lampen == [("turn_on", {"entity_id": [WOONKAMER], "brightness_pct": 60})]


async def test_na_de_herstart_gebeurt_het_niet_nog_een_keer(hass: HomeAssistant, opgezet, lampen, freezer) -> None:
    _maak(opgezet)
    await tik(hass, freezer, om(2, 18))
    assert len(lampen) == 1
    await _herstart(hass, freezer, om(2, 18, 30))
    assert len(lampen) == 1


async def test_de_herstart_zet_niet_terug_wat_de_bewoner_veranderde(
    hass: HomeAssistant, opgezet, lampen, freezer
) -> None:
    """Lamp om 18:00 aan, om 20:00 met de hand uit, herstart om 21:00: hij blijft uit."""
    _maak(opgezet)
    await tik(hass, freezer, om(2, 18))
    await tik(hass, freezer, om(2, 21))
    lampen.clear()
    await _herstart(hass, freezer, om(2, 21, 5))
    assert lampen == []


async def test_beide_gemist_is_alleen_uit(hass: HomeAssistant, opgezet, lampen, freezer) -> None:
    _maak(opgezet)
    await tik(hass, freezer, om(2, 17, 50))
    await _herstart(hass, freezer, om(2, 23, 30))
    assert [d for d, _ in lampen] == ["turn_off"]


async def test_een_aan_van_lang_geleden_blijft_achterwege(hass: HomeAssistant, opgezet, lampen, freezer) -> None:
    """Aan om 07:00 zonder uit, terug om 15:00: de lamp hoort nu niet ineens aan te gaan."""
    _maak(opgezet, aan={"soort": "tijd", "tijd": "07:00"}, uit=None, dagen=[1])
    await tik(hass, freezer, om(2, 23, 59))
    await _herstart(hass, freezer, om(3, 15))
    assert lampen == []


async def test_een_stroomstoring_zonder_afsluiten(hass: HomeAssistant, opgezet, lampen, freezer, hass_storage) -> None:
    """Geen STOP, dus `laatst` is oud. De lamp gaat aan, en precies één keer."""
    _maak(opgezet)
    await tik(hass, freezer, om(2, 17))
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    await hass.config_entries.async_unload(entry.entry_id)
    freezer.move_to(om(2, 18, 30))
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await laat_starten(hass, freezer, om(2, 18, 30))
    assert [d for d, _ in lampen] == ["turn_on"]
    await tik(hass, freezer, om(2, 18, 40))
    assert len(lampen) == 1


async def test_regels_en_vakantie_staan_na_een_herstart_nog_in_de_opslag(
    hass: HomeAssistant, opgezet, freezer, hass_storage
) -> None:
    _maak(opgezet)
    await opgezet.async_zet_vakantie(True)
    await tik(hass, freezer, om(2, 12, 30))
    motor = await _herstart(hass, freezer, om(2, 13))
    assert [r["id"] for r in motor.opslag.regels] == ["r1"]
    assert motor.vakantie is True
    assert hass_storage[STORAGE_KEY]["data"]["vakantie"] is True
    assert hass.states.get(VAKANTIE_ENTITY_ID).state == "on"


# ---------------------------------------------------------------- de vakantiemodus


async def test_gewone_regels_pauzeren_tijdens_de_vakantie(hass: HomeAssistant, opgezet, lampen, freezer) -> None:
    _maak(opgezet)
    await opgezet.async_zet_vakantie(True)
    await tik(hass, freezer, om(2, 18))
    assert lampen == []


async def test_vakantieregels_draaien_alleen_tijdens_de_vakantie(hass: HomeAssistant, opgezet, lampen, freezer) -> None:
    _maak(opgezet, vakantie=True, uit=None)
    dag = om(2, 12).date()
    op = om(2, 18) + timedelta(minutes=regelmaker.wissel("r1", dag, "aan") + 1)
    await tik(hass, freezer, op)
    assert lampen == []
    # De volgende dag, met de vakantiemodus aan.
    await opgezet.async_zet_vakantie(True)
    dag = om(3, 12).date()
    op = om(3, 18) + timedelta(minutes=regelmaker.wissel("r1", dag, "aan") + 1)
    await tik(hass, freezer, op)
    assert [d for d, _ in lampen] == ["turn_on"]


async def test_een_lamp_die_de_regel_aan_zette_gaat_ook_tijdens_de_vakantie_uit(
    hass: HomeAssistant, opgezet, lampen, freezer
) -> None:
    """Om 18:00 aan, om 20:00 de deur uit met de vakantiemodus: om 23:00 toch uit."""
    _maak(opgezet)
    await tik(hass, freezer, om(2, 18))
    await tik(hass, freezer, om(2, 20))
    await opgezet.async_zet_vakantie(True)
    await tik(hass, freezer, om(2, 23))
    assert [d for d, _ in lampen] == ["turn_on", "turn_off"]
    # En de dag erna pauzeert hij gewoon.
    await tik(hass, freezer, om(3, 18))
    await tik(hass, freezer, om(3, 23))
    assert len(lampen) == 2


async def test_de_uit_van_een_gepauzeerde_regel_blijft_van_een_andere_lamp_af(
    hass: HomeAssistant, opgezet, lampen, freezer
) -> None:
    _maak(opgezet)
    await opgezet.async_zet_vakantie(True)
    await tik(hass, freezer, om(2, 23))
    assert lampen == []


async def test_de_schakelaar_bestaat_en_schakelt(hass: HomeAssistant, opgezet) -> None:
    assert hass.states.get(VAKANTIE_ENTITY_ID).state == "off"
    await hass.services.async_call("switch", "turn_on", {"entity_id": VAKANTIE_ENTITY_ID}, blocking=True)
    assert opgezet.vakantie is True
    assert hass.states.get(VAKANTIE_ENTITY_ID).state == "on"


async def test_een_gekoppelde_stand_gaat_voor_en_schakelt_mee(hass: HomeAssistant, opgezet, freezer) -> None:
    ident = "input_boolean.vakantie"
    hass.states.async_set(ident, "on")
    aanroepen = []

    async def ontvang(call) -> None:
        aanroepen.append((call.service, call.data["entity_id"]))

    hass.services.async_register("homeassistant", "turn_off", ontvang)
    await zet_dashboard(hass, [{**KAART, "vakantie_entiteit": ident}])
    await opgezet.async_herlees()
    assert opgezet.gekoppeld == ident
    assert opgezet.vakantie is True
    assert hass.states.get(VAKANTIE_ENTITY_ID).state == "on"

    hass.states.async_set(ident, "off")
    await hass.async_block_till_done()
    assert opgezet.vakantie is False

    # Even niet bereikbaar: de laatst bekende stand blijft gelden.
    hass.states.async_set(ident, "unavailable")
    await hass.async_block_till_done()
    assert opgezet.vakantie is False

    await opgezet.async_zet_vakantie(False)
    assert opgezet.vakantie is False
    assert aanroepen == [("turn_off", ident)]


async def test_een_eerste_start_voert_niets_van_eerder_uit(hass: HomeAssistant, lampen, freezer) -> None:
    await hass.config.async_set_time_zone("Europe/Amsterdam")
    freezer.move_to(om(2, 19))
    await zet_integratie_op(hass)
    await zet_dashboard(hass, [KAART])
    motor = hass.data[DOMAIN][DATA_MOTOR]
    await motor.async_herlees()
    await laat_starten(hass, freezer, om(2, 19))
    assert motor.opslag.laatst is not None
    assert dt_util.as_local(motor.opslag.laatst).hour == 19
    assert lampen == []


# ------------------------------------------------------------ helderheid per lamp


async def test_elke_lamp_krijgt_zijn_eigen_helderheid(hass: HomeAssistant, opgezet, lampen, freezer) -> None:
    _maak(opgezet, lampen=[WOONKAMER, KEUKEN], helderheden={WOONKAMER: 60, KEUKEN: 25})
    await tik(hass, freezer, om(2, 18))
    assert sorted(lampen, key=lambda x: x[1]["brightness_pct"]) == [
        ("turn_on", {"entity_id": [KEUKEN], "brightness_pct": 25}),
        ("turn_on", {"entity_id": [WOONKAMER], "brightness_pct": 60}),
    ]


async def test_dezelfde_helderheid_gaat_in_een_aanroep(hass: HomeAssistant, opgezet, lampen, freezer) -> None:
    _maak(opgezet, lampen=[WOONKAMER, KEUKEN], helderheden={WOONKAMER: 40, KEUKEN: 40})
    await tik(hass, freezer, om(2, 18))
    assert lampen == [("turn_on", {"entity_id": [WOONKAMER, KEUKEN], "brightness_pct": 40})]


async def test_een_lamp_zonder_helderheid_gaat_gewoon_aan(hass: HomeAssistant, opgezet, lampen, freezer) -> None:
    """Een dimblokje met vaste spots: geen brightness_pct."""
    _maak(opgezet, lampen=[WOONKAMER, KEUKEN], helderheden={WOONKAMER: 60})
    await tik(hass, freezer, om(2, 18))
    assert ("turn_on", {"entity_id": [KEUKEN]}) in lampen
    assert ("turn_on", {"entity_id": [WOONKAMER], "brightness_pct": 60}) in lampen


async def test_uit_is_voor_alle_lampen_een_aanroep(hass: HomeAssistant, opgezet, lampen, freezer) -> None:
    _maak(opgezet, lampen=[WOONKAMER, KEUKEN], helderheden={WOONKAMER: 60, KEUKEN: 25})
    await tik(hass, freezer, om(2, 18))
    lampen.clear()
    await tik(hass, freezer, om(2, 23))
    assert lampen == [("turn_off", {"entity_id": [WOONKAMER, KEUKEN]})]


async def test_regressiewacht_een_oude_regel_met_een_helderheid_blijft_werken(
    hass: HomeAssistant, opgezet, lampen, freezer
) -> None:
    """REGRESSIEWACHT: een regel van 0.89.0 tot en met 0.92.0."""
    _maak(opgezet, lampen=[WOONKAMER, KEUKEN], helderheid=35)
    await tik(hass, freezer, om(2, 18))
    assert lampen == [("turn_on", {"entity_id": [WOONKAMER, KEUKEN], "brightness_pct": 35})]
