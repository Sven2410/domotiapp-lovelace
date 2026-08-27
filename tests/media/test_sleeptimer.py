"""De sleeptimer van de mediakaart — NIEUW GEDRAG.

Gevraagd op 27 augustus 2026. Wat hier vastligt is niet dát er een timer loopt,
maar wat er aan het EIND gebeurt: uitfaden, pauzeren, en het volume terugzetten.
Dat laatste is de stap die je pas mist als je de volgende ochtend niets uit de
speaker hoort komen.

De klok wordt vooruitgezet met `freezer` en `async_fire_time_changed`; er wordt
hier nergens echt gewacht. Dat kan omdat de timer aan Home Assistants eigen
tijdtracking hangt — zie de kop van sleeptimer.py voor waarom dat niet altijd zo
was.
"""

from __future__ import annotations

from datetime import timedelta

import pytest

from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import async_fire_time_changed

from custom_components.domotiapp_lovelace.media import sleeptimer as st

SPEAKER = "media_player.slaapkamer"

# MediaPlayerEntityFeature.PAUSE
PAUSE = 1
# MediaPlayerEntityFeature.STOP
STOP = 4096


@pytest.fixture(name="speler")
def speler_fixture(hass: HomeAssistant) -> str:
    """Een spelende speaker op 40% met een pauzeknop."""
    hass.states.async_set(
        SPEAKER,
        "playing",
        {"volume_level": 0.4, "supported_features": PAUSE},
    )
    return SPEAKER


@pytest.fixture(name="oproepen")
def oproepen_fixture(hass: HomeAssistant) -> list:
    """Alles wat er op `media_player` wordt aangeroepen, op volgorde."""
    gezien: list = []

    async def _vang(call):
        gezien.append((call.service, dict(call.data)))

    for dienst in ("volume_set", "media_pause", "media_stop", "turn_off"):
        hass.services.async_register("media_player", dienst, _vang)
    return gezien


async def _spoel(hass: HomeAssistant, freezer, seconden: float, stap: float = 1) -> None:
    """Zet de klok vooruit en laat de geplande wekkers afgaan.

    Per stap en niet in één sprong: de fade zet zijn volume in stapjes van een
    seconde, en elke stap plant de volgende. Eén sprong van dertig seconden zou
    dus één stap opleveren.

    Dat dit werkt zónder echt te wachten is precies waarom de timer aan
    `async_track_point_in_utc_time` hangt en niet aan `asyncio.sleep`. Zie de kop
    van sleeptimer.py.
    """
    for _ in range(int(seconden / stap)):
        freezer.tick(timedelta(seconds=stap))
        async_fire_time_changed(hass)
        await hass.async_block_till_done()


async def test_zet_geeft_een_eindtijd_terug(hass: HomeAssistant, speler: str, freezer) -> None:
    """Wat de kaart terugkrijgt is genoeg om zelf af te tellen."""
    stand = st.timers(hass).zet(speler, 30, fade=30)

    assert stand["entity_id"] == speler
    assert stand["fade"] == 30
    assert 1780 <= stand["seconds_left"] <= 1800
    assert stand["ends_at"]


async def test_de_fade_past_binnen_de_looptijd(hass: HomeAssistant, speler: str, freezer) -> None:
    """Vijf minuten uitfaden op een timer van één minuut wordt één minuut.

    Zonder deze klem zou de fade vier minuten geleden hebben moeten beginnen, en
    dan zakt het volume meteen bij het instellen weg.
    """
    stand = st.timers(hass).zet(speler, 1, fade=300)
    assert stand["fade"] == 60


async def test_er_gebeurt_niets_tot_aan_de_fade(
    hass: HomeAssistant, speler: str, oproepen: list, freezer
) -> None:
    """Muziek die vanaf de eerste minuut wegzakt is geen sleeptimer."""
    st.timers(hass).zet(speler, 2, fade=10)
    await _spoel(hass, freezer, 30, stap=10)

    assert oproepen == []


async def test_faden_pauzeren_en_het_volume_terug(
    hass: HomeAssistant, speler: str, oproepen: list, freezer
) -> None:
    """De hele afloop, in de goede volgorde.

    De laatste regel is waar het om gaat: zonder die stap staat de speaker de
    volgende ochtend op nul en lijkt hij stuk.
    """
    st.timers(hass).zet(speler, 1, fade=4)
    await _spoel(hass, freezer, 70)

    diensten = [naam for naam, _ in oproepen]
    assert "media_pause" in diensten

    volumes = [d["volume_level"] for naam, d in oproepen if naam == "volume_set"]
    # Het zakt, het komt op nul uit, en het gaat daarna terug naar 40%.
    assert volumes[0] < 0.4
    assert volumes == sorted(volumes[:-1], reverse=True) + [volumes[-1]]
    assert volumes[-2] == pytest.approx(0.0)
    assert volumes[-1] == pytest.approx(0.4)

    # En het laatste wat er gebeurt is het terugzetten, ná het pauzeren.
    assert diensten[-1] == "volume_set"
    assert diensten.index("media_pause") == len(diensten) - 2


async def test_een_radio_wordt_gestopt_want_pauzeren_kan_niet(
    hass: HomeAssistant, oproepen: list, freezer
) -> None:
    """Zonder deze toets speelde de radio door met het volume op nul."""
    hass.states.async_set(
        SPEAKER, "playing", {"volume_level": 0.4, "supported_features": STOP}
    )
    st.timers(hass).zet(SPEAKER, 1, fade=2)
    await _spoel(hass, freezer, 70)

    diensten = [naam for naam, _ in oproepen]
    assert "media_stop" in diensten
    assert "media_pause" not in diensten


async def test_annuleren_zet_het_volume_terug(
    hass: HomeAssistant, speler: str, oproepen: list, freezer
) -> None:
    """Annuleren midden in de fade is pas annuleren als het volume terugkomt."""
    st.timers(hass).zet(speler, 1, fade=30)
    await _spoel(hass, freezer, 40)  # de fade loopt
    oproepen.clear()

    assert st.timers(hass).stop(speler) is True
    await hass.async_block_till_done()

    assert ("volume_set", {"entity_id": speler, "volume_level": 0.4}) in oproepen
    assert st.timers(hass).voor(speler) is None


async def test_annuleren_voor_de_fade_raakt_het_volume_niet(
    hass: HomeAssistant, speler: str, oproepen: list, freezer
) -> None:
    """Wie op tijd annuleert, hoort er niets van."""
    st.timers(hass).zet(speler, 5, fade=30)
    assert st.timers(hass).stop(speler) is True
    await hass.async_block_till_done()

    assert oproepen == []


async def test_een_tweede_timer_vervangt_de_eerste(
    hass: HomeAssistant, speler: str, oproepen: list, freezer
) -> None:
    """Twee timers op één speaker zouden allebei aan het volume gaan trekken."""
    timers = st.timers(hass)
    timers.zet(speler, 1, fade=2)
    timers.zet(speler, 60, fade=2)
    await _spoel(hass, freezer, 70)

    # De eerste is weg, dus er is niets gepauzeerd.
    assert [naam for naam, _ in oproepen if naam == "media_pause"] == []
    assert timers.voor(speler) is not None


async def test_de_timer_ruimt_zichzelf_op(
    hass: HomeAssistant, speler: str, oproepen: list, freezer
) -> None:
    """Na afloop staat hij niet meer in de lijst."""
    st.timers(hass).zet(speler, 1, fade=2)
    await _spoel(hass, freezer, 70)

    assert st.timers(hass).lijst() == []


async def test_stoppen_van_iets_dat_niet_loopt_is_geen_fout(hass: HomeAssistant, freezer) -> None:
    """De kaart mag stoppen aanroepen zonder eerst te vragen."""
    assert st.timers(hass).stop("media_player.bestaat_niet") is False


async def test_een_speler_zonder_volume_wordt_gewoon_gepauzeerd(
    hass: HomeAssistant, oproepen: list, freezer
) -> None:
    """Niet elke speler heeft een volume; dat is geen reden om niets te doen."""
    hass.states.async_set(SPEAKER, "playing", {"supported_features": PAUSE})
    st.timers(hass).zet(SPEAKER, 1, fade=5)
    await _spoel(hass, freezer, 70)

    diensten = [naam for naam, _ in oproepen]
    assert diensten == ["media_pause"]
