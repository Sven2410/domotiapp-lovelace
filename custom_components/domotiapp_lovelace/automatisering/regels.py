"""Wanneer een regel iets doet. Pure functies, met tests.

Een regel ziet er zo uit:

    {
      "id": "a1b2c3", "actief": true, "vakantie": false, "naam": "Avond beneden",
      "lampen": ["light.woonkamer", "light.keuken"],
      "helderheden": {"light.woonkamer": 60, "light.keuken": 25},
      "aan": {"soort": "zonsondergang", "verschil": -30},
      "uit": {"soort": "tijd", "tijd": "23:00"},
      "dagen": [0, 1, 2, 3, 4, 5, 6]
    }

`naam` mag ontbreken (sinds 0.96.0); de kaart noemt dan de lampen.

`lampen` en `helderheden` gaan sinds 0.97.0 ook over rolluiken (`cover.`): aan is open
op die stand (100 is helemaal open), uit is dicht. De sleutels heten nog zo omdat ze in
de opslag staan van wie al regels heeft.

`helderheden` is per lamp (sinds 0.94.0). Een lamp die er niet in staat, gaat aan
zonder helderheid: hij kan niet dimmen. Een regel van daarvoor heeft geen
`helderheden` maar één `helderheid`, en die geldt dan voor al zijn lampen.

`dagen` gaat over de dag waarop hij AAN gaat, met maandag als 0. Valt de uit-tijd
vóór de aan-tijd, dan is dat de volgende dag: aan om 22:00, uit om 01:00. Een
regel kan ook alleen aan of alleen uit hebben ("alles uit om 23:00").
"""

from __future__ import annotations

from datetime import date, datetime, time, timedelta
import hashlib
from typing import Any

from homeassistant.const import SUN_EVENT_SUNRISE, SUN_EVENT_SUNSET
from homeassistant.core import HomeAssistant
from homeassistant.helpers.sun import get_astral_event_date
from homeassistant.util import dt as dt_util

from .const import SOORT_TIJD, SOORT_ZONSOPKOMST, VAKANTIE_WISSEL_MIN


def helderheid_van(regel: dict[str, Any], lamp: str) -> int | None:
    """De helderheid van deze lamp in deze regel, of None als hij alleen aan gaat."""
    per_lamp = regel.get("helderheden")
    if isinstance(per_lamp, dict):
        return per_lamp.get(lamp)
    return regel.get("helderheid")


def wissel(regel_id: str, dag: date, wat: str) -> int:
    """Hoeveel minuten een vakantieregel deze dag verschuift.

    Afgeleid van de regel en de dag, en niet geloot: na een herstart hoort
    dezelfde tijd te gelden, anders kan een moment twee keer komen of wegvallen.
    Zonder `random` is er niets om te onthouden.
    """
    breedte = 2 * VAKANTIE_WISSEL_MIN + 1
    samen = f"{regel_id}|{dag.isoformat()}|{wat}".encode()
    return int(hashlib.sha256(samen).hexdigest(), 16) % breedte - VAKANTIE_WISSEL_MIN


def moment_op(hass: HomeAssistant, moment: dict[str, Any], dag: date) -> datetime | None:
    """Dit moment op deze dag, in UTC. None als de zon die dag niet opkomt of ondergaat."""
    if moment["soort"] == SOORT_TIJD:
        uur, minuut = (int(x) for x in moment["tijd"].split(":")[:2])
        return dt_util.as_utc(datetime.combine(dag, time(uur, minuut), dt_util.get_default_time_zone()))
    gebeurtenis = SUN_EVENT_SUNRISE if moment["soort"] == SOORT_ZONSOPKOMST else SUN_EVENT_SUNSET
    zon = get_astral_event_date(hass, gebeurtenis, dag)
    if zon is None:
        return None
    return zon + timedelta(minutes=int(moment.get("verschil") or 0))


def _op(hass: HomeAssistant, regel: dict[str, Any], wat: str, dag: date, wisseldag: date) -> datetime | None:
    moment = regel.get(wat)
    if not moment:
        return None
    op = moment_op(hass, moment, dag)
    if op is not None and regel.get("vakantie"):
        op += timedelta(minutes=wissel(regel["id"], wisseldag, wat))
    return op


def laatste_tussen(
    hass: HomeAssistant, regel: dict[str, Any], van: datetime, tot: datetime
) -> tuple[datetime, str] | None:
    """Het laatste moment van deze regel na `van`, tot en met `tot`.

    Alleen het laatste: stond Home Assistant uit tijdens zowel aan als uit, dan
    hoort de lamp uit te zijn, en niet eerst nog even aan te gaan.
    """
    dag = dt_util.as_local(van).date() - timedelta(days=1)
    einde = dt_util.as_local(tot).date()
    laatste: tuple[datetime, str] | None = None
    while dag <= einde:
        if dag.weekday() in regel["dagen"]:
            aan = _op(hass, regel, "aan", dag, dag)
            uit = _op(hass, regel, "uit", dag, dag)
            if aan is not None and uit is not None and uit <= aan:
                uit = _op(hass, regel, "uit", dag + timedelta(days=1), dag)
            for op, wat in ((aan, "aan"), (uit, "uit")):
                if op is not None and van < op <= tot and (laatste is None or op >= laatste[0]):
                    laatste = (op, wat)
        dag += timedelta(days=1)
    return laatste
