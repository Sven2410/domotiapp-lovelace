"""Eenmalig overnemen wat de losse pakketten hebben opgeslagen.

Dit pakket komt voort uit twee integraties die apart draaiden:
`domotiapp_scene` bewaarde scenes per lichtgroep, `domotiapp_alarm` wekkers per
persoon. Wie overstapt heeft dat al ingesteld, en het opnieuw laten invoeren
omdat het pakket een andere naam kreeg is geen migratie maar een straf.

Drie regels, en ze staan er alle drie met opzet:

1. **Alleen als ons eigen bestand nog niet bestaat.** Daarna is onze opslag de
   waarheid en mag er niets overheen.
2. **Alleen als het oude bestand er is.** Er wordt niet eens een `Store`
   aangemaakt voor een sleutel die niet bestaat -- dat scheelt een leesronde en,
   belangrijker, het houdt deze code volledig buiten beeld voor wie hier nooit
   vandaan komt. Ook in de tests: die draaien op een lege `.storage`, en dus
   raakt dit bestand daar geen enkele testuitkomst.
3. **Het origineel blijft staan.** Niet verplaatsen, niet wissen. Wie terugstapt
   naar het oude pakket vindt zijn scenes en wekkers terug waar hij ze liet.

Gooit nooit. Een oud bestand dat niet te lezen is, is geen reden om de
integratie niet te laten starten -- dan begin je leeg, precies zoals iemand die
hier vers binnenkomt.
"""

from __future__ import annotations

import logging
import os
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

_LOGGER = logging.getLogger(__name__)


def _bestaat(hass: HomeAssistant, sleutel: str) -> bool:
    """Staat er een opslagbestand met deze sleutel? Blokkerende I/O."""
    return os.path.isfile(hass.config.path(".storage", sleutel))


async def async_neem_over(
    hass: HomeAssistant, eigen_sleutel: str, oude_sleutel: str, versie: int
) -> None:
    """Kopieer de opslag van een voorganger naar onze eigen sleutel."""
    bestaat_al, bestaat_oud = await hass.async_add_executor_job(
        lambda: (_bestaat(hass, eigen_sleutel), _bestaat(hass, oude_sleutel))
    )
    if bestaat_al or not bestaat_oud:
        return

    oud: Store[dict[str, Any]] = Store(hass, versie, oude_sleutel)
    try:
        data = await oud.async_load()
    except Exception as fout:  # noqa: BLE001 - overnemen mag nooit fataal zijn
        _LOGGER.warning(
            "De opslag %s van een vorige integratie kon niet gelezen worden; "
            "er wordt leeg begonnen: %s",
            oude_sleutel,
            fout,
        )
        return

    if data is None:
        return

    nieuw: Store[dict[str, Any]] = Store(hass, versie, eigen_sleutel)
    try:
        await nieuw.async_save(data)
    except Exception as fout:  # noqa: BLE001 - zie hierboven
        _LOGGER.warning("Overnemen uit %s is niet gelukt: %s", oude_sleutel, fout)
        return

    _LOGGER.info(
        "Opslag overgenomen uit %s naar %s. Het oorspronkelijke bestand blijft staan.",
        oude_sleutel,
        eigen_sleutel,
    )
