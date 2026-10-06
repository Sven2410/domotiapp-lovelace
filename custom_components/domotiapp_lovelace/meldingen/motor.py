"""De klok die de meldingen verstuurt, en de knop "Staat buiten".

## Eén tik per minuut, en pas lezen als er iets te doen is

Elke minuut wordt gekeken of het tijd is voor een van de bekende meldingen.
Alleen op zo'n minuut worden de dashboards opnieuw gelezen, zodat een kaart die
net is weggehaald of aangepast meteen telt. Daarnaast wordt er gelezen bij
`lovelace_updated` (iemand sloeg een dashboard op) en eens per uur, voor een
dashboard dat in zijn geheel is verwijderd.

## "Staat buiten"

Elke melding heeft een knop. Tikt iemand hem aan op de melding van de avond
ervoor, dan:

- vervalt de melding van de ochtend zelf -- de container staat er al;
- verdwijnt de avondmelding van de telefoons van de anderen
  (`clear_notification` met dezelfde `tag`);
- zegt de kaart erbij wie het deed.

De knop werkt alleen via de notify-DIENST van de companion-app
(`notify.mobile_app_...`), niet via de notify-entiteit: `notify.send_message`
neemt alleen een titel en een tekst, geen knoppen en geen tag. Dat is ook de
reden dat de telefoon bij een PERSOON gezocht wordt (`bewaking/meldingen.py`)
en niet als notify-entiteit gekozen.

## Eén avondmelding per dag, ook als de tijd verschuift

Is de melding van vanavond al verstuurd, dan levert een latere tijd vandaag
niets meer op. Dat is met opzet: wie om 21:00 de tijd van 19:30 naar 22:00 zet,
wil morgen om 22:00 een melding, niet vanavond een tweede aan het hele huis.
Om te kijken of het werkt is er de PROEF (de knop in de pop-up van een
persoon): die gaat alleen naar die persoon, telt niet als verstuurd, en heeft
een eigen tag, zodat hij de echte melding op de telefoon niet vervangt.
"""

from __future__ import annotations

from collections.abc import Callable
from datetime import date, datetime, timedelta
import logging
from typing import Any

from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers.event import async_track_time_change, async_track_time_interval
from homeassistant.util import dt as dt_util

from ..bewaking import meldingen as telefoons
from . import afval, kaarten
from .const import (
    ACTIE_BUITEN,
    EVENT_ACTIE,
    HERLEES_INTERVAL_MIN,
    MOMENT_VANDAAG,
    MOMENTEN,
)
from .kaarten import Melding
from .store import MeldingOpslag

_LOGGER = logging.getLogger(__name__)

EVENT_LOVELACE_UPDATED = "lovelace_updated"


# Op de plek van de ophaaldag in de tag en de knop van een proefmelding. Een tik
# op "Staat buiten" in een proef doet daardoor niets: zie `_actie`.
PROEF = "proef"


def tag_voor(melding: str, ophaaldag: date | str) -> str:
    """Eén regel per ophaaldag: de ochtendmelding vervangt die van de avond."""
    return f"domotiapp-{melding}-{ophaaldag}"


def actie_voor(melding: str, ophaaldag: date | str) -> str:
    return f"{ACTIE_BUITEN}|{melding}|{ophaaldag}"


def lees_actie(actie: str) -> tuple[str, str] | None:
    """(melding, ophaaldag) uit het id van de knop, of None als het niet de onze is."""
    delen = str(actie or "").split("|")
    if len(delen) != 3 or delen[0] != ACTIE_BUITEN or not delen[1] or not delen[2]:
        return None
    return delen[1], delen[2]


class Motor:
    """Leest de kaarten, verstuurt op tijd, en luistert naar de knop."""

    def __init__(
        self,
        hass: HomeAssistant,
        opslag: MeldingOpslag,
        meld: Callable[[str | None], None],
    ) -> None:
        self.hass = hass
        self.opslag = opslag
        self._meld = meld
        self.meldingen: dict[str, Melding] = {}
        self._uit: list[CALLBACK_TYPE] = []
        # Per (dashboard, melding) de instellingen van de vorige keer lezen. None
        # tot de eerste lezing: wat er bij het opstarten staat is geen wijziging.
        self._gezien: dict[tuple[str, str], tuple[Any, ...]] | None = None

    async def async_start(self) -> None:
        await self.async_herlees()
        self._uit.append(async_track_time_change(self.hass, self._tik, second=0))
        self._uit.append(async_track_time_interval(
            self.hass, self._herlees_tik, timedelta(minutes=HERLEES_INTERVAL_MIN)
        ))
        self._uit.append(self.hass.bus.async_listen(EVENT_LOVELACE_UPDATED, self._herlees_tik))
        self._uit.append(self.hass.bus.async_listen(EVENT_ACTIE, self._actie))

    @callback
    def async_stop(self) -> None:
        while self._uit:
            self._uit.pop()()

    async def async_herlees(self) -> None:
        gelezen = await kaarten.async_lees_kaarten(self.hass)
        self._onthoud_wijzigingen(gelezen)
        self.meldingen = kaarten.voeg_samen(gelezen, self.opslag.alle_leidend())
        self._meld(None)

    @callback
    def _onthoud_wijzigingen(self, gelezen: list[tuple[str, dict[str, Any]]]) -> None:
        """Is een kaart aangepast sinds de vorige keer? Dan gaat zijn dashboard voor.

        Alleen een kaart die er de vorige keer ook stond, met andere
        instellingen. Een NIEUWE kaart telt niet: wie een dashboard kopieert om
        er een wandtablet van te maken, krijgt een kaart met de instellingen van
        toen, en die hoort niet ineens voor te gaan. Zie de kop van kaarten.py.
        """
        nu = {
            (m.dashboards[0], m.id): m.vergelijkbaar()
            for m in kaarten.meldingen_per_kaart(gelezen)
        }
        if self._gezien is not None:
            for sleutel, instellingen in nu.items():
                dashboard, ident = sleutel
                if sleutel in self._gezien and self._gezien[sleutel] != instellingen:
                    _LOGGER.info(
                        "Meldingenkaart %r op %s aangepast; die instellingen gaan voor",
                        ident,
                        dashboard or "standaard",
                    )
                    self.opslag.zet_leidend(ident, dashboard)
        self._gezien = nu

    async def _herlees_tik(self, *_: Any) -> None:
        await self.async_herlees()

    async def _tik(self, nu: datetime) -> None:
        klok = nu.strftime("%H:%M")
        if not any(m.tijden.get(mo) == klok for m in self.meldingen.values() for mo in MOMENTEN):
            return
        # Vers lezen: een kaart die net is weggehaald hoort niets meer te sturen.
        await self.async_herlees()
        for melding in list(self.meldingen.values()):
            for moment in MOMENTEN:
                if melding.tijden.get(moment) == klok:
                    uitkomst = await self.async_verstuur(melding.id, moment, nu)
                    _LOGGER.debug("Melding %s (%s): %s", melding.id, moment, uitkomst)

    async def async_verstuur(
        self,
        ident: str,
        moment: str,
        nu: datetime | None = None,
        *,
        proef: bool = False,
        alleen: str | None = None,
    ) -> dict[str, Any]:
        """Stuur de melding van dit moment. Geeft terug wat er gebeurde en waarom.

        `proef` slaat de controles op tijd over (al verstuurd, staat al buiten)
        en stuurt ook als er niets opgehaald wordt, met een voorbeeld. Zo kan de
        klant zien of zijn telefoon gevonden wordt zonder tot 19:30 te wachten.
        `alleen` beperkt het tot die ene persoon: een proef om 22:00 hoort niet
        bij het hele huis binnen te komen.
        """
        nu = nu or dt_util.now()
        melding = self.meldingen.get(ident)
        if melding is None:
            return {"reden": "Deze melding staat op geen enkel opgeslagen dashboard"}

        vandaag = nu.date()
        ophaaldag = vandaag if moment == MOMENT_VANDAAG else vandaag + timedelta(days=1)

        sensor = melding.sensoren.get(moment)
        namen: list[str] = []
        if sensor and (st := self.hass.states.get(sensor)) is not None:
            namen = afval.soorten(st.state)
        if not proef:
            if not sensor:
                return {"reden": f"Geen sensor voor {moment}"}
            if not namen:
                return {"reden": "Er wordt niets opgehaald"}
            if self.opslag.verstuurd(ident, moment) == vandaag.isoformat():
                return {"reden": "Vandaag al verstuurd"}
            buiten = self.opslag.buiten(ident)
            if moment == MOMENT_VANDAAG and buiten and buiten.get("datum") == ophaaldag.isoformat():
                return {"reden": "Staat al buiten"}

        titel, tekst = afval.bericht(moment, namen or ["GFT"])
        if proef:
            titel = f"Proef · {titel}"

        # Een proef krijgt een eigen tag: met die van de ophaaldag zou hij de
        # echte melding van vanavond op de telefoon vervangen.
        sleutel = PROEF if proef else ophaaldag
        data = {
            "tag": tag_voor(ident, sleutel),
            "group": "domotiapp-afval",
            "actions": [{"action": actie_voor(ident, sleutel), "title": "Staat buiten"}],
        }

        if alleen is not None:
            # Wie de proef vraagt, wil hem krijgen, ook met het vinkje uit.
            ontvangers = [alleen]
        else:
            ontvangers = [p for p in melding.personen if self.opslag.aan(ident, p)]
        gelukt: list[str] = []
        zonder: list[str] = []
        for persoon in ontvangers:
            dienst = melding.diensten.get(persoon) or telefoons.dienst_voor(self.hass, persoon)
            if not dienst:
                zonder.append(persoon)
                continue
            try:
                await self.hass.services.async_call(
                    "notify", dienst, {"title": titel, "message": tekst, "data": data}, blocking=True
                )
            except Exception as fout:  # noqa: BLE001 - één telefoon houdt de rest niet tegen
                _LOGGER.warning("Afvalmelding naar %s (%s) mislukte: %s", persoon, dienst, fout)
                zonder.append(persoon)
                continue
            gelukt.append(persoon)

        if zonder:
            _LOGGER.warning("Geen telefoon gevonden voor %s; die krijgt geen afvalmelding", ", ".join(zonder))

        if not proef:
            self.opslag.zet_verstuurd(ident, moment, vandaag.isoformat())
        self._meld(ident)
        return {"verstuurd": gelukt, "zonder_telefoon": zonder, "titel": titel, "tekst": tekst}

    @callback
    def _persoon_van(self, user_id: str | None) -> str | None:
        if not user_id:
            return None
        for st in self.hass.states.async_all("person"):
            if st.attributes.get("user_id") == user_id:
                return st.entity_id
        return None

    async def _actie(self, event: Event) -> None:
        gelezen = lees_actie(event.data.get("action"))
        if gelezen is None:
            return
        ident, datum = gelezen
        if datum == PROEF:
            # Een tik in een proefmelding zet niets buiten.
            return
        door = self._persoon_van(event.context.user_id)
        self.opslag.zet_buiten(ident, datum, door, dt_util.now().isoformat())
        _LOGGER.info("Afval %s voor %s staat buiten (%s)", ident, datum, door or "onbekend")
        self._meld(ident)

        # Bij de anderen hoeft hij niet meer op het scherm te staan.
        melding = self.meldingen.get(ident)
        if melding is None:
            return
        for persoon in melding.personen:
            if persoon == door:
                continue
            dienst = melding.diensten.get(persoon) or telefoons.dienst_voor(self.hass, persoon)
            if not dienst:
                continue
            try:
                await self.hass.services.async_call(
                    "notify",
                    dienst,
                    {"message": "clear_notification", "data": {"tag": tag_voor(ident, datum)}},
                    blocking=False,
                )
            except Exception as fout:  # noqa: BLE001
                _LOGGER.debug("Wissen bij %s lukte niet: %s", persoon, fout)
