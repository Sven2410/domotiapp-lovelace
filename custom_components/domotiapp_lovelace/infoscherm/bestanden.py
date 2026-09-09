"""De bestanden van het infoscherm op schijf: logo, foto's, nieuwsafbeeldingen.

Dezelfde opzet als `bewaking/beelden.py`, om dezelfde redenen: niet onder
`www/` (dat is zonder inloggen bereikbaar), niet in `.storage/` (daar hoort
JSON, geen jpeg van een megabyte), en elk ID gaat langs een witte lijst voordat
het een bestandsnaam wordt.

Wat hier anders is: er zijn meer soorten dan jpeg. Het bestandstype wordt uit
de INHOUD gelezen en niet uit de naam of de header die de browser meestuurt,
want allebei zijn door de afzender te kiezen. Wat niet als een van de vier
herkende soorten begint, wordt geweigerd.

Alle functies raken de schijf en horen in een executor. Ze zijn met opzet
synchroon geschreven, zodat aan de aanroep te zien is dát er een executor
nodig is.
"""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.core import HomeAssistant

from .const import MAP_NAAM

_LOGGER = logging.getLogger(__name__)

# Wat we uitserveren, per herkende soort. SVG staat erbij omdat een logo van
# een praktijk meestal als SVG wordt aangeleverd; het wordt met `sandbox`
# uitgeserveerd zodat een script erin nooit draait.
SOORTEN: dict[str, str] = {
    "png": "image/png",
    "jpg": "image/jpeg",
    "gif": "image/gif",
    "webp": "image/webp",
    "svg": "image/svg+xml",
}

_ULID_TEKENS = frozenset("0123456789ABCDEFGHJKMNPQRSTVWXYZ")


def herken_soort(inhoud: bytes) -> str | None:
    """De soort uit de eerste bytes, of None als het geen afbeelding is."""
    if inhoud.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if inhoud.startswith(b"\xff\xd8\xff"):
        return "jpg"
    if inhoud.startswith((b"GIF87a", b"GIF89a")):
        return "gif"
    if inhoud[:4] == b"RIFF" and inhoud[8:12] == b"WEBP":
        return "webp"
    kop = inhoud[:512].lstrip()
    if kop.startswith((b"<svg", b"<?xml")) and b"<svg" in inhoud[:4096]:
        return "svg"
    return None


def is_geldig_id(bestand_id: str) -> bool:
    """Een ULID: 26 tekens uit Crockfords base32, hoofdletters."""
    return (
        isinstance(bestand_id, str)
        and len(bestand_id) == 26
        and all(teken in _ULID_TEKENS for teken in bestand_id)
    )


def map_pad(hass: HomeAssistant) -> Path:
    return Path(hass.config.path(MAP_NAAM))


def bestand_pad(hass: HomeAssistant, bestand_id: str, soort: str) -> Path:
    """Het pad van één bestand. Het ID is vóór gebruik gecontroleerd."""
    return map_pad(hass) / f"{bestand_id}.{soort}"


def bewaar(hass: HomeAssistant, bestand_id: str, soort: str, inhoud: bytes) -> None:
    """Schrijf één bestand weg. Blokkerend. Eerst tijdelijk, dan hernoemen."""
    doel = bestand_pad(hass, bestand_id, soort)
    doel.parent.mkdir(parents=True, exist_ok=True)
    tijdelijk = doel.with_suffix(".deel")
    tijdelijk.write_bytes(inhoud)
    tijdelijk.replace(doel)


def lees(hass: HomeAssistant, bestand_id: str, soort: str) -> bytes | None:
    """De bytes, of None als het bestand er niet (meer) is. Blokkerend."""
    try:
        return bestand_pad(hass, bestand_id, soort).read_bytes()
    except FileNotFoundError:
        return None
    except OSError as fout:
        _LOGGER.warning("Bestand %s kon niet gelezen worden: %s", bestand_id, fout)
        return None


def verwijder(hass: HomeAssistant, bestand_id: str, soort: str) -> bool:
    """Haal één bestand weg. Een bestand dat er al niet is, is geen fout."""
    try:
        bestand_pad(hass, bestand_id, soort).unlink()
    except FileNotFoundError:
        return False
    except OSError as fout:
        _LOGGER.warning("Bestand %s kon niet verwijderd worden: %s", bestand_id, fout)
        return False
    return True
