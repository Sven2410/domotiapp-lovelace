"""Twee opslaglagen: de regels per camera, en de index van de timeline.

Ze staan in **twee bestanden** en dat is een keuze:

- de regels veranderen alleen als iemand de editor van de camerakaart opent;
- de index verandert bij elk beeld.

In één bestand zou elke snapshot de instellingen opnieuw wegschrijven, en zou
een index die onleesbaar raakt de instellingen meeslepen. De klant zou dan zijn
melders en zijn ontvangers kwijt zijn omdat er een plaatje misging.

Zelfde lijn als `../store.py`: **valideren is niet hetzelfde als parsen.** Een
regel die niet valideert wordt niet stilzwijgend gerepareerd en ook niet stil
weggegooid -- hij wordt geweigerd bij het opslaan, en bij het lezen overgeslagen
mét een logregel.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
import logging
from typing import Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    MAX_RUSTPERIODE,
    MAX_WACHTTIJD,
    MIN_RUSTPERIODE,
    MIN_WACHTTIJD,
    STANDAARD_RUSTPERIODE,
    STANDAARD_WACHTTIJD,
    STORAGE_KEY_INDEX,
    STORAGE_KEY_REGELS,
    STORAGE_VERSION,
)

_LOGGER = logging.getLogger(__name__)

# De index wordt vertraagd weggeschreven. Tien seconden: een reeks detecties
# vlak na elkaar levert dan één schrijfronde op in plaats van vijf, en meer dan
# tien seconden werk raak je bij een harde herstart nooit kwijt. De bestanden
# zelf staan er dan al; `opruimen.verweesd` vindt het paar terug.
INDEX_VERTRAGING = 10


class RegelFout(ValueError):
    """De regel voldoet niet aan het schema."""


@dataclass(slots=True)
class Regel:
    """Wat er per camera is ingesteld.

    `aan` is het vinkje uit de editor: *"Als ik in de algemene camera kaart het
    vinkje timeline en snapshot aan zet dan pas alles kunnen invullen."* Staat
    het uit, dan luistert de motor niet eens naar de melders van deze camera.
    """

    camera: str
    aan: bool = False
    melders: list[str] = field(default_factory=list)
    # De naam per melder, zoals hij in de editor van de camerakaart staat. De
    # kaart heeft dat veld al ("ik heb bijvoorbeeld een beweging voor persoon,
    # auto, etc. en dan kan ik bij de persoon-entiteit de naam erbij zetten"),
    # en een melding die "Persoon" zegt in plaats van
    # "binary_sensor.oprit_persoon" is dezelfde afspraak op de telefoon.
    namen: dict[str, str] = field(default_factory=dict)
    # Per camera ingesteld, per melder geteld. Zie const.py.
    rustperiode: int = STANDAARD_RUSTPERIODE
    wachttijd: int = STANDAARD_WACHTTIJD
    # Personen, niet apparaten. De notify-dienst wordt opgezocht.
    ontvangers: list[str] = field(default_factory=list)
    # Handmatige overschrijving per persoon, voor wie geen mobile_app heeft of
    # bij wie het opzoeken de verkeerde telefoon vindt.
    diensten: dict[str, str] = field(default_factory=dict)
    # Standaard uit. Snoeit in de praktijk meer meldingen weg dan de
    # rustperiode, maar het is een keuze van de klant.
    alleen_afwezig: bool = False

    def als_dict(self) -> dict[str, Any]:
        return asdict(self)


def valideer_regel(rauw: Any) -> Regel:
    """Maak een `Regel` van wat de kaart stuurt, of gooi `RegelFout`.

    Bewust streng op de entity-ID's en soepel op de rest: een camera-ID dat
    nergens naar wijst levert een regel op die nooit afgaat en waar niemand ooit
    achterkomt.
    """
    if not isinstance(rauw, dict):
        raise RegelFout("een regel is een object")

    camera = rauw.get("camera")
    if not isinstance(camera, str) or not camera.startswith("camera."):
        raise RegelFout("'camera' moet een entity-ID zijn, zoals camera.oprit")

    melders = _lijst_van_ids(rauw.get("melders"), "melders")
    ontvangers = _lijst_van_ids(rauw.get("ontvangers"), "ontvangers")
    for persoon in ontvangers:
        if not persoon.startswith("person."):
            raise RegelFout(f"{persoon!r} is geen persoon, zoals person.sven")

    namen_rauw = rauw.get("namen") or {}
    if not isinstance(namen_rauw, dict):
        raise RegelFout("'namen' is een object van melder naar naam")
    namen = {
        str(melder): str(naam)
        for melder, naam in namen_rauw.items()
        if isinstance(naam, str) and naam.strip()
    }

    diensten_rauw = rauw.get("diensten") or {}
    if not isinstance(diensten_rauw, dict):
        raise RegelFout("'diensten' is een object van persoon naar dienst")
    diensten = {
        str(persoon): str(dienst)
        for persoon, dienst in diensten_rauw.items()
        if isinstance(dienst, str) and dienst
    }

    return Regel(
        camera=camera,
        aan=bool(rauw.get("aan", False)),
        melders=melders,
        namen=namen,
        rustperiode=_getal(
            rauw.get("rustperiode"), STANDAARD_RUSTPERIODE, MIN_RUSTPERIODE, MAX_RUSTPERIODE, "rustperiode"
        ),
        wachttijd=_getal(
            rauw.get("wachttijd"), STANDAARD_WACHTTIJD, MIN_WACHTTIJD, MAX_WACHTTIJD, "wachttijd"
        ),
        ontvangers=ontvangers,
        diensten=diensten,
        alleen_afwezig=bool(rauw.get("alleen_afwezig", False)),
    )


def _lijst_van_ids(rauw: Any, veld: str) -> list[str]:
    if rauw is None:
        return []
    if not isinstance(rauw, list):
        raise RegelFout(f"'{veld}' is een lijst met entity-ID's")
    uit: list[str] = []
    for item in rauw:
        if not isinstance(item, str) or "." not in item:
            raise RegelFout(f"{item!r} is geen entity-ID")
        if item not in uit:
            uit.append(item)
    return uit


def _getal(rauw: Any, standaard: int, laag: int, hoog: int, veld: str) -> int:
    if rauw is None or rauw == "":
        return standaard
    try:
        waarde = int(rauw)
    except (TypeError, ValueError):
        raise RegelFout(f"'{veld}' moet een geheel getal seconden zijn") from None
    if not laag <= waarde <= hoog:
        raise RegelFout(f"'{veld}' moet tussen {laag} en {hoog} seconden liggen")
    return waarde


class RegelStore:
    """De instellingen per camera."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._store: Store[dict[str, Any]] = Store(
            hass, STORAGE_VERSION, STORAGE_KEY_REGELS
        )
        self._regels: dict[str, Regel] = {}

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if not data:
            return
        for camera, rauw in (data.get("cameras") or {}).items():
            try:
                self._regels[camera] = valideer_regel({**rauw, "camera": camera})
            except RegelFout as fout:
                # Overslaan en melden, niet repareren. Een regel die stil wordt
                # rechtgetrokken meldt straks iets anders dan er staat.
                _LOGGER.warning(
                    "Bewakingsregel voor %s overgeslagen: %s", camera, fout
                )

    @callback
    def alle(self) -> dict[str, Regel]:
        return dict(self._regels)

    @callback
    def voor(self, camera: str) -> Regel | None:
        return self._regels.get(camera)

    @callback
    def actieve(self) -> list[Regel]:
        """De regels die aanstaan én iets te doen hebben."""
        return [r for r in self._regels.values() if r.aan and r.melders]

    async def async_zet(self, regel: Regel) -> None:
        self._regels[regel.camera] = regel
        await self._async_bewaar()

    async def async_verwijder(self, camera: str) -> bool:
        if self._regels.pop(camera, None) is None:
            return False
        await self._async_bewaar()
        return True

    async def _async_bewaar(self) -> None:
        # Meteen, niet vertraagd: dit gebeurt als iemand op Opslaan drukt in de
        # editor, en dat hoort de herstart erna te overleven.
        await self._store.async_save(
            {
                "cameras": {
                    camera: {
                        sleutel: waarde
                        for sleutel, waarde in regel.als_dict().items()
                        if sleutel != "camera"
                    }
                    for camera, regel in self._regels.items()
                }
            }
        )


class BeeldIndex:
    """De timeline: wat er is, van welke camera, wanneer, en waarom.

    De bytes staan op schijf (`beelden.py`); hier staat alleen de regel erbij.
    Oudste eerst, zodat opruimen aan de voorkant gebeurt en toevoegen aan de
    achterkant.
    """

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._store: Store[dict[str, Any]] = Store(
            hass, STORAGE_VERSION, STORAGE_KEY_INDEX
        )
        self._beelden: list[dict[str, Any]] = []

    async def async_load(self) -> None:
        data = await self._store.async_load()
        if not data:
            return
        rauw = data.get("beelden")
        if not isinstance(rauw, list):
            _LOGGER.warning("De beeldindex was onleesbaar en is opnieuw begonnen")
            return
        self._beelden = [b for b in rauw if isinstance(b, dict) and b.get("id")]

    @callback
    def alle(self) -> list[dict[str, Any]]:
        return list(self._beelden)

    @callback
    def voor(
        self, cameras: list[str] | None = None, limiet: int | None = None
    ) -> list[dict[str, Any]]:
        """De timeline, nieuwste eerst.

        `cameras=None` is alles. Dat is wat de kaart vraagt: de eigenaar koos op
        27 augustus 2026 voor één strook met alle camera's van de kaart door
        elkaar, op tijd gesorteerd, met per miniatuur een label welke camera het
        was.
        """
        uit = [
            beeld
            for beeld in reversed(self._beelden)
            if cameras is None or beeld.get("camera") in cameras
        ]
        return uit[:limiet] if limiet else uit

    @callback
    def voeg_toe(self, beeld: dict[str, Any]) -> None:
        self._beelden.append(beeld)
        self._bewaar_straks()

    @callback
    def haal_weg(self, beeld_ids: list[str]) -> list[dict[str, Any]]:
        """Haal regels uit de index. Geeft terug wat er werkelijk uit ging."""
        if not beeld_ids:
            return []
        weg = set(beeld_ids)
        eruit = [b for b in self._beelden if b.get("id") in weg]
        if eruit:
            self._beelden = [b for b in self._beelden if b.get("id") not in weg]
            self._bewaar_straks()
        return eruit

    @callback
    def laatste_tijd(self, melder: str) -> Any:
        """Wanneer deze melder voor het laatst een beeld opleverde.

        Hiermee begint de rustperiode na een herstart niet op nul. Zonder dit
        zou een herstart midden in een minuut alsnog een tweede beeld
        opleveren.
        """
        for beeld in reversed(self._beelden):
            if beeld.get("melder") == melder:
                return dt_util.parse_datetime(beeld.get("tijd") or "")
        return None

    def _bewaar_straks(self) -> None:
        self._store.async_delay_save(
            lambda: {"beelden": self._beelden}, INDEX_VERTRAGING
        )

    async def async_bewaar_nu(self) -> None:
        """Forceer een schrijfronde. Voor het afsluiten en voor tests."""
        await self._store.async_save({"beelden": self._beelden})
