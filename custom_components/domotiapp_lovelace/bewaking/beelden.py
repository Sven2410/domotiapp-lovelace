"""De beelden op schijf. Eén map, één bestand per beeld, verder niets.

## Waarom niet in `www/`

Dat is de map waar de meeste HACS-kaarten hun plaatjes in zetten, en het is hier
de verkeerde keuze: alles onder `www/` wordt door Home Assistant uitgeserveerd
op `/local/...` **zonder inloggen**. Dit zijn beelden van de voordeur van een
klant. Ze staan daarom onder de configuratiemap en gaan alleen via
`http.py` naar buiten, met een handtekening erop.

## Waarom niet in `.storage/`

Daar hoort JSON, geen jpeg's van 150 kB. En een volledige back-up van Home
Assistant neemt `.storage/` altijd mee; een week aan camerabeelden in elke
back-up is niet wat iemand bedoelt als hij op "back-up maken" drukt.

## Blokkerende I/O

Elke functie hier raakt de schijf en hoort dus in een executor. Ze zijn met
opzet gewoon synchroon geschreven en niet `async`: dan is in de aanroep te zien
dát er een executor aan te pas komt, in plaats van dat het in deze module
verstopt zit.
"""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.core import HomeAssistant

from .const import MAP_NAAM

_LOGGER = logging.getLogger(__name__)

# Alleen jpeg. Een camera die iets anders levert wordt niet omgezet -- dat zou
# Pillow of ffmpeg als afhankelijkheid meebrengen voor een geval dat zich bij
# een IP-camera niet voordoet. Zie `bewaar` voor wat er dan gebeurt.
EXTENSIE = ".jpg"


def map_pad(hass: HomeAssistant) -> Path:
    """De map waarin de beelden staan."""
    return Path(hass.config.path(MAP_NAAM))


def bestand_pad(hass: HomeAssistant, beeld_id: str) -> Path:
    """Het pad van één beeld.

    `beeld_id` is een ULID en wordt vóór gebruik gecontroleerd (`is_geldig_id`).
    Zonder die controle zou een ID met `../` erin buiten de map kunnen wijzen,
    en dit pad komt uit een HTTP-verzoek.
    """
    return map_pad(hass) / f"{beeld_id}{EXTENSIE}"


def is_geldig_id(beeld_id: str) -> bool:
    """Een ULID: 26 tekens uit Crockfords base32, hoofdletters.

    Bewust geen `Path`-controle achteraf maar een controle vooraf op de vorm.
    Een witte lijst is hier te maken, en dan is er geen discussie over
    `..`, over symlinks en over hoofdletterongevoelige bestandssystemen.
    """
    return (
        isinstance(beeld_id, str)
        and len(beeld_id) == 26
        and all(teken in _ULID_TEKENS for teken in beeld_id)
    )


_ULID_TEKENS = frozenset("0123456789ABCDEFGHJKMNPQRSTVWXYZ")


def zorg_voor_map(hass: HomeAssistant) -> None:
    """Maak de map als hij er niet is. Blokkerend."""
    map_pad(hass).mkdir(parents=True, exist_ok=True)


def bewaar(hass: HomeAssistant, beeld_id: str, inhoud: bytes) -> None:
    """Schrijf één beeld weg. Blokkerend.

    Eerst naar een tijdelijk bestand en dan hernoemen, zodat een halve schrijf
    nooit als heel beeld in de timeline komt te staan. `replace` is op één
    bestandssysteem atomair.
    """
    doel = bestand_pad(hass, beeld_id)
    doel.parent.mkdir(parents=True, exist_ok=True)
    tijdelijk = doel.with_suffix(".deel")
    tijdelijk.write_bytes(inhoud)
    tijdelijk.replace(doel)


def lees(hass: HomeAssistant, beeld_id: str) -> bytes | None:
    """De bytes van één beeld, of None als hij er niet (meer) is. Blokkerend."""
    pad = bestand_pad(hass, beeld_id)
    try:
        return pad.read_bytes()
    except FileNotFoundError:
        return None
    except OSError as fout:
        _LOGGER.warning("Beeld %s kon niet gelezen worden: %s", beeld_id, fout)
        return None


def verwijder(hass: HomeAssistant, beeld_ids: list[str]) -> int:
    """Verwijder de genoemde beelden. Geeft terug hoeveel er werkelijk weg zijn.

    Een bestand dat er al niet meer is telt niet mee en is geen fout: opruimen
    dat struikelt over werk dat al gedaan is, ruimt de tweede keer niets meer op.
    """
    weg = 0
    for beeld_id in beeld_ids:
        if not is_geldig_id(beeld_id):
            continue
        try:
            bestand_pad(hass, beeld_id).unlink()
        except FileNotFoundError:
            continue
        except OSError as fout:
            _LOGGER.warning("Beeld %s kon niet verwijderd worden: %s", beeld_id, fout)
            continue
        weg += 1
    return weg


def op_schijf(hass: HomeAssistant) -> list[str]:
    """De ID's van alle beelden die er werkelijk liggen. Blokkerend.

    Halve schrijfacties (`.deel`) tellen niet mee: die zijn geen beeld.
    """
    map_ = map_pad(hass)
    if not map_.is_dir():
        return []
    return [
        pad.stem
        for pad in map_.iterdir()
        if pad.suffix == EXTENSIE and is_geldig_id(pad.stem)
    ]


def ruim_halve_op(hass: HomeAssistant) -> int:
    """Gooi achtergebleven `.deel`-bestanden weg. Blokkerend.

    Die blijven liggen als Home Assistant omvalt tussen het schrijven en het
    hernoemen. Ze horen bij niets en groeien anders stil door.
    """
    map_ = map_pad(hass)
    if not map_.is_dir():
        return 0
    weg = 0
    for pad in map_.iterdir():
        if pad.suffix != ".deel":
            continue
        try:
            pad.unlink()
        except OSError:
            continue
        weg += 1
    return weg
