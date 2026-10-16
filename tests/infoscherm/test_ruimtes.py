"""Ruimtes boeken op het infoscherm. Alles **NIEUW GEDRAG** (16 oktober 2026):
vóór deze ronde kende de opslag geen `ruimtes`, geen code, en bestonden de
commando's `ruimtes/boek`, `ruimtes/vrijgeven` en `ruimtes/code` niet.

Gevraagd op 16 oktober 2026: *"kunnen we iets maken voor een planning van
ruimtes. (...) een spreekruimte kleine vergader ruimte etc etc?"* Per ruimte
een agenda in Home Assistant; op het scherm alleen vrij of bezet; boeken in het
beheer, en op de iPad *"met een ingestelde code die de medewerkers krijgen"*.

De agenda hier is nagebootst: een echte `CalendarEntity` in het echte
agenda-component van Home Assistant, met de afspraken in een lijst. Zo loopt
alles wat de server doet (de entiteit opzoeken, de mogelijkheden nakijken,
lezen, aanmaken, verwijderen) door dezelfde code als bij een Lokale agenda.
"""

from __future__ import annotations

from datetime import datetime, timedelta

import pytest

from homeassistant.components.calendar import CalendarEntity, CalendarEvent
from homeassistant.components.calendar.const import DATA_COMPONENT, CalendarEntityFeature
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
from homeassistant.util import dt as dt_util

from custom_components.domotiapp_lovelace.infoscherm.const import CODE_POGINGEN, MAX_RUIMTES
from custom_components.domotiapp_lovelace.infoscherm.ruimtes import TITEL_BEHEER, TITEL_SCHERM
from custom_components.domotiapp_lovelace.infoscherm.store import (
    InfoFout,
    InfoStore,
    leeg_installatie,
    valideer_code,
    valideer_indeling,
    valideer_installatie,
)

from .conftest import stuur

SPREEK = "calendar.spreekruimte"
VERGADER = "calendar.kleine_vergaderruimte"


class NepAgenda(CalendarEntity):
    """Een agenda met de afspraken in een lijst."""

    def __init__(self, entity_id: str, naam: str, kan: CalendarEntityFeature | None = None) -> None:
        self.entity_id = entity_id
        self._attr_name = naam
        self._attr_supported_features = (
            CalendarEntityFeature.CREATE_EVENT | CalendarEntityFeature.DELETE_EVENT if kan is None else kan
        )
        self.afspraken: list[CalendarEvent] = []
        self._teller = 0

    @property
    def event(self) -> CalendarEvent | None:
        nu = dt_util.now()
        komend = sorted(
            (e for e in self.afspraken if e.end_datetime_local > nu), key=lambda e: e.start_datetime_local
        )
        return komend[0] if komend else None

    async def async_get_events(self, hass, start_date: datetime, end_date: datetime) -> list[CalendarEvent]:
        return [
            e for e in self.afspraken if e.start_datetime_local < end_date and e.end_datetime_local > start_date
        ]

    async def async_create_event(self, **kwargs) -> None:
        self._teller += 1
        self.afspraken.append(
            CalendarEvent(
                start=kwargs["dtstart"],
                end=kwargs["dtend"],
                summary=kwargs["summary"],
                description=kwargs.get("description"),
                uid=f"afspraak-{self._teller}",
            )
        )
        self.async_write_ha_state()

    async def async_delete_event(self, uid: str, recurrence_id=None, recurrence_range=None) -> None:
        self.afspraken = [e for e in self.afspraken if e.uid != uid]
        self.async_write_ha_state()


@pytest.fixture
async def agendas(hass: HomeAssistant, infoscherm_op, store) -> dict[str, NepAgenda]:
    """Twee ruimtes met een agenda, en een derde agenda die alleen kan lezen."""
    assert await async_setup_component(hass, "calendar", {})
    await hass.async_block_till_done()
    uit = {
        SPREEK: NepAgenda(SPREEK, "Spreekruimte"),
        VERGADER: NepAgenda(VERGADER, "Kleine vergaderruimte"),
        "calendar.feestdagen": NepAgenda("calendar.feestdagen", "Feestdagen", CalendarEntityFeature(0)),
    }
    await hass.data[DATA_COMPONENT].async_add_entities(list(uit.values()))
    await hass.async_block_till_done()
    await store().async_zet_installatie(
        {"ruimtes": [SPREEK, VERGADER, "calendar.feestdagen"]}, mag_entiteiten_wijzigen=True
    )
    yield uit
    # Een agenda zet een timer op het begin en het eind van zijn volgende
    # afspraak; weghalen ruimt die op.
    for agenda in uit.values():
        await agenda.async_remove()
    await hass.async_block_till_done()


def morgen(uur: int, minuut: int = 0) -> str:
    """Morgen om dit uur, zoals de kaart het stuurt (lokale tijd, zonder zone)."""
    d = dt_util.now() + timedelta(days=1)
    return f"{d.date().isoformat()}T{uur:02d}:{minuut:02d}"


async def kiosk_op(hass, store, hass_ws_client, gebruiker, token):
    await store().async_zet_instellingen({"kiosk_gebruikers": [gebruiker.id]}, mag_kiosk_wijzigen=True)
    return await hass_ws_client(hass, token)


# --------------------------------------------------------------------------
# De opslag
# --------------------------------------------------------------------------


def test_een_ruimte_is_een_agenda_met_een_naam_en_dubbel_valt_weg() -> None:
    i = valideer_installatie({"ruimtes": [{"entity": SPREEK, "naam": "Spreekkamer"}, VERGADER, SPREEK]})
    assert i["ruimtes"] == [{"entity": SPREEK, "naam": "Spreekkamer"}, {"entity": VERGADER, "naam": ""}]


@pytest.mark.parametrize("fout", ["light.lamp", "sensor.spreekruimte", "climate.spreekruimte"])
def test_alleen_een_agenda_mag_een_ruimte_zijn(fout: str) -> None:
    with pytest.raises(InfoFout, match="ruimtes"):
        valideer_installatie({"ruimtes": [fout]})


def test_niet_meer_ruimtes_dan_de_grens() -> None:
    with pytest.raises(InfoFout):
        valideer_installatie({"ruimtes": [f"calendar.ruimte_{i}" for i in range(MAX_RUIMTES + 1)]})


def test_een_oude_opslag_zonder_ruimtes_krijgt_een_lege_lijst() -> None:
    assert valideer_installatie({"weer": "weather.thuis"})["ruimtes"] == []
    assert leeg_installatie()["ruimtes"] == []


def test_het_raster_kent_het_ruimteblok() -> None:
    i = valideer_indeling({"blokken": [{"soort": "ruimtes", "x": 0, "y": 0, "w": 2, "h": 2, "aantal": 3}]})
    assert i["blokken"][0]["soort"] == "ruimtes"


@pytest.mark.parametrize("goed", ["", "1234", "00000000", " 4321 "])
def test_een_code_is_leeg_of_vier_tot_acht_cijfers(goed: str) -> None:
    assert valideer_code(goed) == goed.strip()


@pytest.mark.parametrize("fout", ["123", "123456789", "12a4", "١٢٣٤", 1234])
def test_een_andere_code_wordt_geweigerd(fout) -> None:
    with pytest.raises(InfoFout):
        valideer_code(fout)


async def test_de_code_staat_niet_in_de_stand_maar_wel_in_de_opslag(hass: HomeAssistant, infoscherm_op, store) -> None:
    """De stand gaat naar elk scherm, ook naar de iPad. Wat die van de code
    weet is alleen of er een is."""
    assert store().snapshot()["boeken_op_scherm"] is False
    await store().async_zet_ruimte_code("2468")
    stand = store().snapshot()
    assert stand["boeken_op_scherm"] is True
    assert "2468" not in repr(stand)

    # Na een herstart is hij er nog.
    opnieuw = InfoStore(hass)
    await opnieuw.async_load()
    assert opnieuw.ruimte_code == "2468"


async def test_de_receptie_geeft_ruimtes_een_naam_en_een_volgorde_maar_kiest_ze_niet(
    hass: HomeAssistant, infoscherm_op, store
) -> None:
    await store().async_zet_installatie({"ruimtes": [SPREEK, VERGADER]}, mag_entiteiten_wijzigen=True)
    await store().async_zet_installatie(
        {"ruimtes": [{"entity": VERGADER, "naam": "Vergaderen"}, {"entity": "calendar.vreemd", "naam": "X"}]},
        mag_entiteiten_wijzigen=False,
    )
    assert store().snapshot()["installatie"]["ruimtes"] == [
        {"entity": VERGADER, "naam": "Vergaderen"},
        {"entity": SPREEK, "naam": ""},
    ]
    # En de kaartconfig van de installateur houdt die namen en die volgorde.
    await store().async_zet_installatie_van_kaart({"ruimtes": [SPREEK, VERGADER]})
    assert store().snapshot()["installatie"]["ruimtes"] == [
        {"entity": VERGADER, "naam": "Vergaderen"},
        {"entity": SPREEK, "naam": ""},
    ]


# --------------------------------------------------------------------------
# De code: alleen voor wie beheert
# --------------------------------------------------------------------------


async def test_get_geeft_de_code_alleen_aan_wie_mag_beheren(
    hass: HomeAssistant, infoscherm_op, store, hass_ws_client, hass_read_only_user, hass_read_only_access_token
) -> None:
    await store().async_zet_ruimte_code("2468")
    admin = await hass_ws_client(hass)
    assert (await stuur(admin, "get"))["result"]["ruimte_code"] == "2468"

    kiosk = await kiosk_op(hass, store, hass_ws_client, hass_read_only_user, hass_read_only_access_token)
    antwoord = (await stuur(kiosk, "get"))["result"]
    assert "ruimte_code" not in antwoord
    assert "2468" not in repr(antwoord)
    assert antwoord["stand"]["boeken_op_scherm"] is True


async def test_de_code_instellen_mag_het_beheer_en_niet_de_kiosk(
    hass: HomeAssistant, infoscherm_op, store, hass_ws_client, hass_read_only_user, hass_read_only_access_token
) -> None:
    kiosk = await kiosk_op(hass, store, hass_ws_client, hass_read_only_user, hass_read_only_access_token)
    geweigerd = await stuur(kiosk, "ruimtes/code", code="1111")
    assert geweigerd["error"]["code"] == "unauthorized"

    beheer = await hass_ws_client(hass)
    await stuur(beheer, "subscribe")
    antwoord = await stuur(beheer, "ruimtes/code", code="1357")
    # De stand gaat eerst rond (boeken_op_scherm), dan komt het antwoord.
    if antwoord.get("type") == "event":
        assert antwoord["event"]["stand"]["boeken_op_scherm"] is True
        antwoord = await beheer.receive_json()
    assert antwoord["result"] == {"code": "1357"}
    assert store().ruimte_code == "1357"

    fout = await stuur(beheer, "ruimtes/code", code="12")
    assert fout["error"]["code"] == "invalid_format"
    assert store().ruimte_code == "1357"


# --------------------------------------------------------------------------
# Boeken
# --------------------------------------------------------------------------


async def test_het_beheer_boekt_zonder_code_en_de_omschrijving_gaat_mee(
    hass: HomeAssistant, agendas, hass_ws_client
) -> None:
    beheer = await hass_ws_client(hass)
    antwoord = await stuur(
        beheer, "ruimtes/boek", ruimte=SPREEK, start=morgen(10), eind=morgen(11, 30), omschrijving="Teamoverleg zorg"
    )
    assert antwoord["success"] is True, antwoord
    [ev] = agendas[SPREEK].afspraken
    assert ev.summary == "Teamoverleg zorg"
    assert "in het beheer" in ev.description
    assert ev.start_datetime_local.strftime("%H:%M") == "10:00"
    assert ev.end_datetime_local.strftime("%H:%M") == "11:30"

    # Zonder omschrijving een vaste titel.
    await stuur(beheer, "ruimtes/boek", ruimte=VERGADER, start=morgen(9), eind=morgen(10))
    assert agendas[VERGADER].afspraken[0].summary == TITEL_BEHEER


async def test_de_kiosk_boekt_alleen_met_de_juiste_code(
    hass: HomeAssistant, agendas, store, hass_ws_client, hass_read_only_user, hass_read_only_access_token
) -> None:
    kiosk = await kiosk_op(hass, store, hass_ws_client, hass_read_only_user, hass_read_only_access_token)
    boek = dict(ruimte=SPREEK, start=morgen(14), eind=morgen(15))

    # Geen code ingesteld: boeken op het scherm staat uit.
    assert (await stuur(kiosk, "ruimtes/boek", code="1234", **boek))["error"]["code"] == "geen_code"

    await store().async_zet_ruimte_code("2468")
    assert (await stuur(kiosk, "ruimtes/boek", **boek))["error"]["code"] == "verkeerde_code"
    assert (await stuur(kiosk, "ruimtes/boek", code="1111", **boek))["error"]["code"] == "verkeerde_code"
    assert agendas[SPREEK].afspraken == []

    # Een omschrijving van het scherm telt niet: daar is geen veld voor.
    goed = await stuur(kiosk, "ruimtes/boek", code="2468", omschrijving="iets", **boek)
    assert goed["success"] is True, goed
    [ev] = agendas[SPREEK].afspraken
    assert ev.summary == TITEL_SCHERM
    assert "op het infoscherm" in ev.description


async def test_een_ander_account_op_het_scherm_krijgt_de_code_ook_nagekeken(
    hass: HomeAssistant, agendas, store, hass_ws_client
) -> None:
    """Een klant zonder kioskaccount: de iPad is dan een gewone gebruiker. Het
    scherm stuurt altijd een code mee, en die wordt nagekeken."""
    await store().async_zet_ruimte_code("2468")
    scherm = await hass_ws_client(hass)
    fout = await stuur(scherm, "ruimtes/boek", ruimte=SPREEK, start=morgen(8), eind=morgen(9), code="0000")
    assert fout["error"]["code"] == "verkeerde_code"
    assert agendas[SPREEK].afspraken == []


async def test_na_te_veel_verkeerde_codes_even_niet(
    hass: HomeAssistant, agendas, store, hass_ws_client, hass_read_only_user, hass_read_only_access_token
) -> None:
    await store().async_zet_ruimte_code("2468")
    kiosk = await kiosk_op(hass, store, hass_ws_client, hass_read_only_user, hass_read_only_access_token)
    boek = dict(ruimte=SPREEK, start=morgen(14), eind=morgen(15))
    for _ in range(CODE_POGINGEN):
        assert (await stuur(kiosk, "ruimtes/boek", code="0000", **boek))["error"]["code"] == "verkeerde_code"
    # Nu ook met de goede code niet meer.
    assert (await stuur(kiosk, "ruimtes/boek", code="2468", **boek))["error"]["code"] == "te_vaak"
    assert agendas[SPREEK].afspraken == []


async def test_een_bezette_ruimte_wordt_niet_dubbel_geboekt(hass: HomeAssistant, agendas, hass_ws_client) -> None:
    beheer = await hass_ws_client(hass)
    assert (await stuur(beheer, "ruimtes/boek", ruimte=SPREEK, start=morgen(10), eind=morgen(11)))["success"]

    botst = await stuur(beheer, "ruimtes/boek", ruimte=SPREEK, start=morgen(10, 30), eind=morgen(12))
    assert botst["error"]["code"] == "bezet"
    assert "van 10:00 tot 11:00" in botst["error"]["message"]

    # Aansluitend mag wel, en een andere ruimte op dezelfde tijd ook.
    assert (await stuur(beheer, "ruimtes/boek", ruimte=SPREEK, start=morgen(11), eind=morgen(12)))["success"]
    assert (await stuur(beheer, "ruimtes/boek", ruimte=VERGADER, start=morgen(10), eind=morgen(11)))["success"]
    assert len(agendas[SPREEK].afspraken) == 2


async def test_een_hele_dag_in_de_agenda_maakt_de_ruimte_bezet(hass: HomeAssistant, agendas, hass_ws_client) -> None:
    dag = (dt_util.now() + timedelta(days=1)).date()
    agendas[SPREEK].afspraken.append(
        CalendarEvent(start=dag, end=dag + timedelta(days=1), summary="Schilder", uid="schilder")
    )
    beheer = await hass_ws_client(hass)
    botst = await stuur(beheer, "ruimtes/boek", ruimte=SPREEK, start=morgen(10), eind=morgen(11))
    assert botst["error"]["code"] == "bezet"
    assert "de hele dag" in botst["error"]["message"]


@pytest.mark.parametrize(
    ("start", "eind", "reden"),
    [
        (lambda: morgen(11), lambda: morgen(10), "na het begin"),
        (lambda: morgen(10), lambda: morgen(10), "na het begin"),
        (lambda: morgen(0), lambda: (dt_util.now() + timedelta(days=2)).date().isoformat() + "T01:00", "hooguit"),
        (lambda: "2020-01-01T10:00", lambda: "2020-01-01T11:00", "voorbij"),
        (lambda: "morgen om tien", lambda: morgen(11), "tijdstip"),
    ],
)
async def test_een_onmogelijke_tijd_wordt_uitgelegd(
    hass: HomeAssistant, agendas, hass_ws_client, start, eind, reden
) -> None:
    beheer = await hass_ws_client(hass)
    fout = await stuur(beheer, "ruimtes/boek", ruimte=SPREEK, start=start(), eind=eind())
    assert fout["error"]["code"] == "invalid_format"
    assert reden in fout["error"]["message"]
    assert agendas[SPREEK].afspraken == []


async def test_alleen_een_ruimte_van_het_scherm_met_een_agenda_die_kan_boeken(
    hass: HomeAssistant, agendas, store, hass_ws_client
) -> None:
    beheer = await hass_ws_client(hass)
    tijd = dict(start=morgen(10), eind=morgen(11))
    # Een agenda die geen ruimte is.
    assert (await stuur(beheer, "ruimtes/boek", ruimte="calendar.prive", **tijd))["error"]["code"] == "not_found"
    # Een ruimte waarvan de agenda niet (meer) bestaat.
    await store().async_zet_installatie({"ruimtes": [SPREEK, "calendar.weg"]}, mag_entiteiten_wijzigen=True)
    assert (await stuur(beheer, "ruimtes/boek", ruimte="calendar.weg", **tijd))["error"]["code"] == "not_found"
    # Een agenda die alleen kan lezen (Google zonder schrijfrecht, een feestdagenagenda).
    await store().async_zet_installatie({"ruimtes": ["calendar.feestdagen"]}, mag_entiteiten_wijzigen=True)
    fout = await stuur(beheer, "ruimtes/boek", ruimte="calendar.feestdagen", **tijd)
    assert fout["error"]["code"] == "not_supported"
    assert "Lokale agenda" in fout["error"]["message"]


# --------------------------------------------------------------------------
# Vrijgeven
# --------------------------------------------------------------------------


async def test_vrijgeven_mag_het_beheer_en_niet_de_kiosk(
    hass: HomeAssistant, agendas, store, hass_ws_client, hass_read_only_user, hass_read_only_access_token
) -> None:
    beheer = await hass_ws_client(hass)
    await stuur(beheer, "ruimtes/boek", ruimte=SPREEK, start=morgen(10), eind=morgen(11))
    uid = agendas[SPREEK].afspraken[0].uid

    kiosk = await kiosk_op(hass, store, hass_ws_client, hass_read_only_user, hass_read_only_access_token)
    assert (await stuur(kiosk, "ruimtes/vrijgeven", ruimte=SPREEK, uid=uid))["error"]["code"] == "unauthorized"
    assert len(agendas[SPREEK].afspraken) == 1

    assert (await stuur(beheer, "ruimtes/vrijgeven", ruimte=SPREEK, uid=uid))["result"] == {"vrijgegeven": True}
    assert agendas[SPREEK].afspraken == []


async def test_een_kioskaccount_leest_de_agenda_zelf(
    hass: HomeAssistant, agendas, store, hass_ws_client, hass_read_only_user, hass_read_only_access_token
) -> None:
    """Het scherm abonneert zich met `calendar/event/subscribe` van Home
    Assistant. Een kioskaccount is een gewone gebruiker; dat moet mogen, en een
    nieuwe boeking moet meteen doorkomen."""
    kiosk = await kiosk_op(hass, store, hass_ws_client, hass_read_only_user, hass_read_only_access_token)
    nu = dt_util.now()
    await kiosk.send_json_auto_id(
        {
            "type": "calendar/event/subscribe",
            "entity_id": SPREEK,
            "start": nu.replace(hour=0, minute=0).isoformat(),
            "end": (nu + timedelta(days=2)).isoformat(),
        }
    )
    assert (await kiosk.receive_json())["success"] is True
    assert (await kiosk.receive_json())["event"]["events"] == []

    beheer = await hass_ws_client(hass)
    assert (await stuur(beheer, "ruimtes/boek", ruimte=SPREEK, start=morgen(10), eind=morgen(11)))["success"]
    await hass.async_block_till_done()
    bericht = await kiosk.receive_json()
    [ev] = bericht["event"]["events"]
    assert ev["summary"] == TITEL_BEHEER
    assert ev["uid"] == "afspraak-1"
