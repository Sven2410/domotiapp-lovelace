"""De vijf competitiesensoren: een naam met een logo, voor de sportpop-up.

Gevraagd op 7 oktober 2026, via de beheersessie: op het DomotiApp-dashboard
staan in de pop-up #sport vijf knoppen, één per competitie, met het logo als
`entity_picture` van een sensor. Die sensoren waren bij elke klant een
sjabloonhelper met het logo uit `customize.yaml`. Nu maakt de integratie ze zelf,
met het logo dat ze zelf meelevert (zie test_afbeeldingen.py).

Drie dingen die vastliggen omdat dashboards erop rekenen:

1. **De entity_id's**, letterlijk: de dashboards noemen ze bij naam.
2. **Een vaste unique_id**, zodat een sensor die iemand hernoemt hernoemd blijft
   en er geen tweede bij komt.
3. **Bezet is bezet.** Bij de bestaande installaties staan ze er al als
   sjabloonhelper. Een tweede sensor met dezelfde naam wordt dan
   `sensor.eredivisie_2`, en dan verandert er niets zichtbaars terwijl er
   dubbel staat. Daarom maakt de integratie hem dan NIET, meldt ze welke
   entiteit in de weg zit (log en Reparaties), en maakt ze hem alsnog zodra de
   naam vrij is en de integratie opnieuw start.

Alles hier is NIEUW GEDRAG: vóór deze ronde maakte de integratie geen enkele
sensor. Op de oude code valt elke test om op een ontbrekende toestand.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import issue_registry as ir

from .alarm.conftest import zet_integratie_op

DOMEIN = "domotiapp_lovelace"
MAP = Path(__file__).parent.parent / "custom_components" / DOMEIN / "afbeeldingen"

# Zoals ze bij de eigenaar thuis staan (uitgelezen op 7 oktober 2026): de
# toestand is de naam, en verder alleen een naam en een plaatje.
VERWACHT = {
    "sensor.eredivisie": ("Eredivisie", "eredivisie.png"),
    "sensor.premier_league": ("Premier League", "premierleague.png"),
    "sensor.bundesliga": ("Bundesliga", "bundesliga.png"),
    "sensor.la_liga": ("La Liga", "laliga.png"),
    "sensor.formule_1": ("Formule 1", "formule1.png"),
}


def onze(hass: HomeAssistant) -> dict[str, er.RegistryEntry]:
    """De registerregels van deze integratie, per entity_id."""
    return {
        e.entity_id: e
        for e in er.async_get(hass).entities.values()
        if e.platform == DOMEIN and e.domain == "sensor"
    }


@pytest.mark.parametrize("entity_id", list(VERWACHT))
async def test_de_sensor_staat_er_zoals_het_dashboard_hem_kent(
    hass: HomeAssistant, entity_id: str
) -> None:
    """Toestand, naam en plaatje, en het plaatje bestaat ook echt."""
    await zet_integratie_op(hass)

    naam, bestand = VERWACHT[entity_id]
    st = hass.states.get(entity_id)
    assert st is not None, f"{entity_id} ontbreekt"
    assert st.state == naam
    assert st.attributes["friendly_name"] == naam
    assert st.attributes["entity_picture"] == f"/domotiapp_lovelace/afbeeldingen/{bestand}"
    assert (MAP / bestand).is_file()


async def test_een_vaste_unique_id_per_sensor(hass: HomeAssistant) -> None:
    """Dezelfde unique_id na een herstart; anders is elke hernoeming kwijt."""
    await zet_integratie_op(hass)

    regels = onze(hass)
    assert set(regels) == set(VERWACHT)
    assert {regels[i].unique_id for i in VERWACHT} == {
        "domotiapp_lovelace_competitie_eredivisie",
        "domotiapp_lovelace_competitie_premier_league",
        "domotiapp_lovelace_competitie_bundesliga",
        "domotiapp_lovelace_competitie_la_liga",
        "domotiapp_lovelace_competitie_formule_1",
    }


async def test_hernoemd_blijft_hernoemd(hass: HomeAssistant) -> None:
    """Wie hem een andere naam gaf, krijgt er na herladen geen tweede bij."""
    entry = await zet_integratie_op(hass)
    er.async_get(hass).async_update_entity("sensor.eredivisie", new_entity_id="sensor.mijn_voetbal")
    await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()

    assert hass.states.get("sensor.mijn_voetbal").state == "Eredivisie"
    assert hass.states.get("sensor.eredivisie") is None
    assert "sensor.eredivisie" not in onze(hass)


async def test_bezet_is_bezet_en_wordt_gemeld(
    hass: HomeAssistant, caplog: pytest.LogCaptureFixture
) -> None:
    """Een sjabloonhelper met dezelfde id: niet ernaast, wel zeggen waarom.

    Zo staat het bij de eigenaar: `sensor.eredivisie` van het platform
    `template`, met een config entry.
    """
    reg = er.async_get(hass)
    reg.async_get_or_create("sensor", "template", "oude-helper-eredivisie", suggested_object_id="eredivisie")
    reg.async_get_or_create("sensor", "template", "oude-helper-formule-1", suggested_object_id="formule_1")

    await zet_integratie_op(hass)

    regels = onze(hass)
    # De twee bezette niet, en ook geen _2 ernaast.
    assert "sensor.eredivisie" not in regels
    assert "sensor.formule_1" not in regels
    assert not [i for i in hass.states.async_entity_ids("sensor") if i.endswith("_2")]
    # De andere drie gewoon wel.
    assert {"sensor.premier_league", "sensor.bundesliga", "sensor.la_liga"} <= set(regels)

    # In het log, met de naam van wat er in de weg zit.
    assert "sensor.eredivisie" in caplog.text and "sensor.formule_1" in caplog.text

    # En onder Reparaties, zodat het zonder log te zien is.
    melding = ir.async_get(hass).async_get_issue(DOMEIN, "competities_bezet")
    assert melding is not None
    assert "sensor.eredivisie" in melding.translation_placeholders["entiteiten"]
    assert "sensor.formule_1" in melding.translation_placeholders["entiteiten"]


async def test_vrij_gemaakt_komt_hij_alsnog(hass: HomeAssistant) -> None:
    """Helper weg, integratie opnieuw: dan precies onder die naam, en de melding weg."""
    reg = er.async_get(hass)
    reg.async_get_or_create("sensor", "template", "oude-helper-eredivisie", suggested_object_id="eredivisie")
    entry = await zet_integratie_op(hass)
    assert ir.async_get(hass).async_get_issue(DOMEIN, "competities_bezet") is not None

    reg.async_remove("sensor.eredivisie")
    await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()

    assert hass.states.get("sensor.eredivisie").state == "Eredivisie"
    assert onze(hass)["sensor.eredivisie"].unique_id == "domotiapp_lovelace_competitie_eredivisie"
    assert ir.async_get(hass).async_get_issue(DOMEIN, "competities_bezet") is None
