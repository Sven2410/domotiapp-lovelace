"""De sleeptimer van de mediakaart.

WAAROM DIT IN DE INTEGRATIE ZIT EN NIET IN DE KAART

Gevraagd op 27 augustus 2026: *"Dan wil ik een sleeptimer hebben, hier wil ik
zelf de minuten in kunnen zetten. Als ik hem start dan loopt de tijd af en dan
wordt op de speaker die geselecteerd is fade out toegepast bij het eind."*

Een teller in JavaScript was een halve dag minder werk geweest, en hij zou niet
werken. Een sleeptimer is per definitie het ding dat moet blijven lopen nadat je
je telefoon hebt weggelegd -- en dan bevriest de browser zijn timers, sluit de
companion-app de pagina, of gaat het scherm gewoon uit. Wat er dan van de fade
overblijft is een speaker die de hele nacht doorspeelt.

Dus loopt hij hier, in Home Assistant zelf. De kaart zet hem, vraagt zijn stand
op en toont die; de kaart mag onderweg verdwijnen.

WAAROM `async_track_point_in_time` EN NIET `asyncio.sleep`

De eerste versie sliep gewoon. Dat werkt, maar het is de verkeerde klok: Home
Assistant heeft zijn eigen tijdtracking, en alleen wat daaraan hangt is
versnelbaar in een test en bestand tegen een tijdsprong. Met `asyncio.sleep`
zaten de tests van dit bestand écht zeventig seconden te wachten -- acht keer.
Dat is geen testprobleem dat je oplost door langer te wachten; het is het
signaal dat de timer aan de verkeerde klok hing.

WAT ER BIJ HET AFLOPEN GEBEURT

1. Tot aan het laatste stuk gebeurt er niets. Muziek waar het volume al vanaf
   de eerste minuut van wegzakt is geen sleeptimer maar een storing.
2. De laatste `fade` seconden zakt het volume in stapjes naar nul.
3. Dan pauzeert de speler.
4. En dan gaat het volume terug naar waar het stond. DIT IS HET BELANGRIJKSTE
   STUKJE van dit bestand: zonder die laatste stap staat de speaker de volgende
   ochtend op nul, hoort niemand er iets uitkomen, en is de conclusie "de
   speaker is stuk" -- niet "er heeft een sleeptimer gelopen".

Een lopende timer overleeft een herstart van Home Assistant niet. Dat is een
bewuste grens: hem in de opslag leggen betekent hem ook weer moeten oppakken in
een halve staat (fade half gedaan, volume half terug), en dat is meer risico dan
het waard is voor iets dat hoogstens een uur duurt.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from functools import partial
from datetime import datetime, timedelta
from typing import Any, Callable

from homeassistant.const import EVENT_HOMEASSISTANT_STOP
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_track_point_in_utc_time
from homeassistant.util import dt as dt_util

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

DATA_SLEEPTIMER = "media_sleeptimer"

#: Het signaal dat de kaarten wakker maakt. Wie een timer zet op zijn telefoon,
#: hoort hem op de tablet in de keuken ook te zien staan.
EVENT_SLEEPTIMER = f"{DOMAIN}_sleeptimer"

#: De grenzen aan wat je mag instellen. Eén minuut om te kunnen proberen zonder
#: een kwartier te wachten, twaalf uur omdat alles daarboven geen sleeptimer meer
#: is maar een vergeten timer.
MIN_MINUTEN = 1
MAX_MINUTEN = 720

#: Hoe lang het uitfaden duurt, in seconden.
FADE_STANDAARD = 30
FADE_MAX = 600

#: Zo vaak zet de fade het volume een stapje lager. Elke seconde is hoorbaar
#: vloeiend, en het is één service-aanroep per seconde -- dat is voor een speaker
#: rustig. Fijner dan dit levert bij Music Assistant niets meer op, want de
#: speaker zelf verwerkt de stappen ook niet oneindig fijn.
FADE_STAP_S = 1


@dataclass
class Timer:
    """Eén lopende sleeptimer, voor één speler."""

    entity_id: str
    einde: datetime
    fade: int
    #: Het volume waar de speler op stond toen de fade begon. Pas bekend als de
    #: fade begint, want tot dat moment mag je er zelf aan blijven draaien.
    volume_terug: float | None = None
    #: Hoeveel stapjes de fade nog te gaan heeft.
    stap: int = 0
    stappen: int = 0
    #: Het opzeggertje van de eerstvolgende geplande wekker.
    afzeggen: Callable[[], None] | None = field(default=None, repr=False)

    def as_dict(self) -> dict[str, Any]:
        """Wat de kaart hiervan te zien krijgt."""
        return {
            "entity_id": self.entity_id,
            "ends_at": self.einde.isoformat(),
            "seconds_left": max(0, int((self.einde - dt_util.utcnow()).total_seconds())),
            "fade": self.fade,
        }


class SleepTimers:
    """Alle lopende sleeptimers van deze Home Assistant."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._timers: dict[str, Timer] = {}
        # Gaat Home Assistant uit, dan gaan de wekkers mee. Een geplande callback
        # die een afgesloten hass aanroept helpt niemand -- en het is bovendien
        # precies wat de kop belooft: een lopende timer overleeft een herstart
        # niet.
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, self._bij_afsluiten)

    # ------------------------------------------------------------------ lezen

    @callback
    def lijst(self) -> list[dict[str, Any]]:
        """Alles wat er loopt, met wat het eerst klaar is vooraan."""
        return [t.as_dict() for t in sorted(self._timers.values(), key=lambda t: t.einde)]

    @callback
    def voor(self, entity_id: str) -> dict[str, Any] | None:
        timer = self._timers.get(entity_id)
        return timer.as_dict() if timer else None

    # ---------------------------------------------------------------- zetten

    @callback
    def zet(self, entity_id: str, minuten: int, fade: int = FADE_STANDAARD) -> dict[str, Any]:
        """Zet (of vervang) de timer voor deze speler."""
        self.stop(entity_id, melden=False)

        # De fade past binnen de looptijd. Vraagt iemand vijf minuten uitfaden op
        # een timer van één minuut, dan wordt het uitfaden één minuut -- en niet
        # een fade die vier minuten geleden had moeten beginnen.
        fade = max(0, min(int(fade), FADE_MAX, minuten * 60))
        einde = dt_util.utcnow() + timedelta(minutes=minuten)
        timer = Timer(entity_id=entity_id, einde=einde, fade=fade)
        self._timers[entity_id] = timer

        # Wakker worden op het moment dat de fade moet beginnen. Is er geen
        # fade, dan is dat gewoon het einde.
        self._plan(timer, einde - timedelta(seconds=fade), self._begin_fade)
        self._meld(timer.as_dict(), "set")
        return timer.as_dict()

    @callback
    def stop(self, entity_id: str, *, melden: bool = True) -> bool:
        """Haal de timer weg. Was de fade al begonnen, dan gaat het volume terug."""
        timer = self._timers.pop(entity_id, None)
        if timer is None:
            return False
        self._afzeggen(timer)
        if timer.volume_terug is not None:
            # De fade liep al. Het volume terugzetten is geen nettigheid maar de
            # enige manier waarop "annuleren" ook echt annuleren is.
            self._volume(entity_id, timer.volume_terug)
        if melden:
            self._meld({"entity_id": entity_id}, "cancelled")
        return True

    @callback
    def _bij_afsluiten(self, _event) -> None:
        self.stop_alles()

    @callback
    def stop_alles(self) -> None:
        for entity_id in list(self._timers):
            self.stop(entity_id, melden=False)

    # ------------------------------------------------------------- het lopen

    @callback
    def _plan(self, timer: Timer, wanneer: datetime, wat) -> None:
        """Word wakker op dit moment, of meteen als het al voorbij is.

        `partial` en NIET een lambda, en dat is geen stijlkwestie. Home Assistant
        leest aan de functie af of hij een `@callback` is en draait alles wat dat
        niet is in een aparte thread. Een lambda eromheen maakt die markering
        onzichtbaar, en dan komt de callback in een executor terecht:

            RuntimeError: Non-thread-safe operation invoked on an event loop
            other than the current one

        `HassJob` kijkt wél door een `partial` heen naar de functie eronder.
        """
        self._afzeggen(timer)
        nu = dt_util.utcnow()
        timer.afzeggen = async_track_point_in_utc_time(
            self.hass, partial(wat, timer), max(wanneer, nu + timedelta(milliseconds=1))
        )

    @callback
    def _afzeggen(self, timer: Timer) -> None:
        if timer.afzeggen is not None:
            timer.afzeggen()
            timer.afzeggen = None

    @callback
    def _begin_fade(self, timer: Timer, _nu: datetime | None = None) -> None:
        """Het laatste stuk begint: onthoud het volume en zak in stapjes."""
        if self._timers.get(timer.entity_id) is not timer:
            return
        timer.afzeggen = None

        begin = self._volume_nu(timer.entity_id)
        if timer.fade <= 0 or begin is None or begin <= 0:
            # Geen fade gevraagd, of een speler zonder volume. Dan gewoon
            # afronden op het afgesproken moment.
            self._plan(timer, timer.einde, self._afronden)
            return

        timer.volume_terug = begin
        timer.stappen = max(1, int(timer.fade / FADE_STAP_S))
        timer.stap = 0
        self._plan(timer, dt_util.utcnow() + timedelta(seconds=FADE_STAP_S), self._stap)

    @callback
    def _stap(self, timer: Timer, _nu: datetime | None = None) -> None:
        """Eén stapje zachter."""
        if self._timers.get(timer.entity_id) is not timer:
            return
        timer.afzeggen = None
        timer.stap += 1

        begin = timer.volume_terug or 0.0
        # Lineair naar nul. Voor een oor zakt dat aan het eind sneller weg dan
        # aan het begin, en dat is precies goed: je merkt er alleen iets van
        # zolang je nog wakker bent.
        self._volume(timer.entity_id, round(begin * (1 - timer.stap / timer.stappen), 3))

        if timer.stap >= timer.stappen:
            self._afronden(timer)
            return
        self._plan(timer, dt_util.utcnow() + timedelta(seconds=FADE_STAP_S), self._stap)

    @callback
    def _afronden(self, timer: Timer, _nu: datetime | None = None) -> None:
        """Pauzeren, het volume terug, en de timer opruimen."""
        if self._timers.get(timer.entity_id) is not timer:
            return
        self._afzeggen(timer)
        self._pauzeer(timer.entity_id)
        if timer.volume_terug is not None:
            self._volume(timer.entity_id, timer.volume_terug)
        self._timers.pop(timer.entity_id, None)
        self._meld({"entity_id": timer.entity_id}, "finished")

    # ------------------------------------------------------------------ doen

    @callback
    def _volume_nu(self, entity_id: str) -> float | None:
        state = self.hass.states.get(entity_id)
        if state is None:
            return None
        volume = state.attributes.get("volume_level")
        return float(volume) if isinstance(volume, (int, float)) else None

    @callback
    def _volume(self, entity_id: str, niveau: float) -> None:
        self.hass.async_create_task(
            self.hass.services.async_call(
                "media_player",
                "volume_set",
                {"entity_id": entity_id, "volume_level": max(0.0, min(1.0, niveau))},
                blocking=False,
            ),
            name="domotiapp sleeptimer volume",
        )

    @callback
    def _pauzeer(self, entity_id: str) -> None:
        """Pauzeren, en anders stoppen.

        Een radiozender kun je niet pauzeren -- Music Assistant meldt `PAUSE` dan
        niet als ondersteunde functie. Zonder deze toets bleef de radio na de
        timer gewoon doorspelen, met het volume op nul.
        """
        state = self.hass.states.get(entity_id)
        kenmerken = int(state.attributes.get("supported_features", 0)) if state else 0
        # MediaPlayerEntityFeature: PAUSE = 1, STOP = 4096.
        dienst = "media_pause" if kenmerken & 1 else "media_stop" if kenmerken & 4096 else "turn_off"
        self.hass.async_create_task(
            self.hass.services.async_call(
                "media_player", dienst, {"entity_id": entity_id}, blocking=False
            ),
            name="domotiapp sleeptimer pauze",
        )

    @callback
    def _meld(self, gegevens: dict[str, Any], wat: str) -> None:
        self.hass.bus.async_fire(EVENT_SLEEPTIMER, {"action": wat, **gegevens})


@callback
def timers(hass: HomeAssistant) -> SleepTimers:
    """De sleeptimers van deze HA, aangemaakt bij de eerste vraag."""
    data = hass.data.setdefault(DOMAIN, {})
    if DATA_SLEEPTIMER not in data:
        data[DATA_SLEEPTIMER] = SleepTimers(hass)
    return data[DATA_SLEEPTIMER]
