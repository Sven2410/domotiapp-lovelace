"""De aanwezigheid op het infoscherm zetten vanuit een automatisering (0.135.0).

De eigenaar, 20 november 2026, voor een praktijk met een alarm: *"ik wil een
automatisering hebben dat als het alarm wordt ingeschakeld dat iedereen
automatisch op afwezig gezet wordt."* Tot dan kon dat alleen met het commando
`infoscherm/aanwezig`, één persoon per keer, en een automatisering kan geen
websocket aanroepen.

```yaml
action: domotiapp_lovelace.infoscherm_aanwezigheid
data:
  aanwezig: false
  personen:            # mag weg: dan iedereen
    - Bram Visser      # de naam zoals op het scherm, of het id
```

Drie dingen die zo horen:

- **Het infoscherm zet zelf niemand af.** De klok die dat om middernacht deed
  ging er in ronde 3 uit (zie `__init__.py`). Dit is een dienst: wanneer hij
  draait, bepaalt de automatisering van de klant.
- **Twee keer is hetzelfde als één keer.** Wie al zo stond, blijft staan; dan
  gaat er niets naar de schijf en niets naar de schermen. Een automatisering die
  hem na een herstart nog eens aanroept, kan dus geen kwaad.
- **Een naam die niet bestaat, is een fout en verandert niets.** Liever een
  automatisering die in zijn trace zegt dat "Bram Visers" niet bestaat, dan een
  die stil de helft doet.

Iedereen die een dienst mag aanroepen, mag deze aanroepen. Dat is in Home
Assistant iedere ingelogde gebruiker, en dat is hier ook de grens van het
commando: ook het kioskaccount mag iemand aan- of afmelden.
"""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv

from ..const import DOMAIN
from ..taal import t
from .const import DATA_STORE, DIENST_AANWEZIGHEID

SCHEMA = vol.Schema(
    {
        vol.Required("aanwezig"): cv.boolean,
        vol.Optional("personen"): vol.All(cv.ensure_list, [cv.string]),
    }
)


@callback
def async_registreer(hass: HomeAssistant) -> None:
    if hass.services.has_service(DOMAIN, DIENST_AANWEZIGHEID):
        return

    async def aanwezigheid(call: ServiceCall) -> ServiceResponse:
        from .websocket import async_meld_stand

        store = hass.data.get(DOMAIN, {}).get(DATA_STORE)
        if store is None:
            raise ServiceValidationError(t(hass, "Het infoscherm is niet geladen"))
        wie = call.data.get("personen") or None
        ids = None
        if wie is not None:
            ids, onbekend = store.zoek_personen(wie)
            if onbekend:
                raise ServiceValidationError(
                    t(hass, "Niet op het infoscherm: {namen}", namen=", ".join(onbekend))
                )
        veranderd = await store.async_zet_aanwezigheid(call.data["aanwezig"], ids)
        if veranderd:
            async_meld_stand(hass)
        return {"veranderd": [_kort(p) for p in veranderd]}

    hass.services.async_register(
        DOMAIN,
        DIENST_AANWEZIGHEID,
        aanwezigheid,
        schema=SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )


@callback
def async_haal_weg(hass: HomeAssistant) -> None:
    hass.services.async_remove(DOMAIN, DIENST_AANWEZIGHEID)


def _kort(p: dict[str, Any]) -> dict[str, Any]:
    return {"id": p["id"], "naam": p["naam"], "aanwezig": p["aanwezig"]}
