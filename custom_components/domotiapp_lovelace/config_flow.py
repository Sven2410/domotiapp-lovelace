"""Config flow en options flow voor DomotiApp Lovelace.

De config flow is bewust leeg: één bevestigingsstap zonder invoervelden, zodat
de integratie via de UI toe te voegen is. Er valt niets in te stellen.

De **options flow** is het opruimoverzicht (SPEC 15). Dat is geen
instellingenscherm — er is niets in te stellen — maar de enige plek waar een
admin opgeslagen scenes van een light group kan weggooien. Twee stappen: een
keuzelijst en een bevestiging.

Twee dingen die deze flow niet zelf doet, en dat is met opzet:

- **Hij bepaalt niets over de inhoud.** De lijst komt uit
  `SceneStore.async_list_groups()` en het verwijderen uit
  `SceneStore.async_delete_group()` — exact dezelfde twee functies die de
  WebSocket-commando's `storage/list` en `storage/delete` aanroepen (SPEC 11.6).
  Er is dus één implementatie, niet twee.
- **Hij ruimt nooit uit zichzelf op.** Verwijderen gebeurt alleen wanneer een
  admin stap `confirm` met het vinkje aan verstuurt (SPEC 15.3).

Admin-only hoeven we niet zelf te regelen: HA's eigen options-flow-endpoints
staan achter `@require_admin` (`components/config/config_entries.py`,
`OptionManagerFlowIndexView` en `OptionManagerFlowResourceView`).
"""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
)

from .const import DATA_STORE, DOMAIN
from .store import StoreUnusableError

CONF_GROEP = "groep"
CONF_BEVESTIGD = "bevestigd"


class DomotiappSceneConfigFlow(ConfigFlow, domain=DOMAIN):
    """Lege flow — er valt niets te configureren."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Bevestigingsstap zonder velden."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is None:
            return self.async_show_form(step_id="user")

        return self.async_create_entry(title="DomotiApp Lovelace", data={})

    @staticmethod
    @callback
    def async_get_options_flow(entry: ConfigEntry) -> OptionsFlow:
        """Het opruimoverzicht (SPEC 15)."""
        return DomotiappSceneOptionsFlow()


class DomotiappSceneOptionsFlow(OptionsFlow):
    """Het opruimoverzicht: kies een groep, bevestig, verwijder (SPEC 15.2)."""

    def __init__(self) -> None:
        self._gekozen: str | None = None

    # ----------------------------------------------------------------------
    # Stap init — de keuzelijst
    # ----------------------------------------------------------------------

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Toon alle opgeslagen groepen, of meld dat er niets is."""
        store = self.hass.data.get(DOMAIN, {}).get(DATA_STORE)
        if store is None:
            # Kan alleen als de entry net wordt uitgeladen (SPEC 11.9).
            return self.async_abort(reason="niet_geladen")

        try:
            groepen = store.async_list_groups()
        except StoreUnusableError:
            # Geval C uit SPEC 18.2: de hele opslag is onbruikbaar. Er valt dan
            # niets per groep op te ruimen — er zijn geen sleutels — en de
            # reparatiemelding wijst de weg naar buiten.
            return self.async_abort(reason="opslag_onbruikbaar")

        if not groepen:
            # Een leeg select is geen scherm dat je iemand voorzet (SPEC 15.2).
            return self.async_abort(reason="niets_opgeslagen")

        if user_input is not None:
            self._gekozen = user_input[CONF_GROEP]
            return await self.async_step_confirm()

        opties = [
            SelectOptionDict(
                value=groep["registry_entry_id"], label=self._label(groep)
            )
            for groep in groepen
        ]

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_GROEP): SelectSelector(
                        SelectSelectorConfig(
                            options=opties,
                            mode=SelectSelectorMode.DROPDOWN,
                        )
                    )
                }
            ),
        )

    # ----------------------------------------------------------------------
    # Stap confirm — de bevestiging
    # ----------------------------------------------------------------------

    async def async_step_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Vraag om een expliciet vinkje en verwijder pas daarna."""
        store = self.hass.data.get(DOMAIN, {}).get(DATA_STORE)
        if store is None:
            return self.async_abort(reason="niet_geladen")

        groep = _zoek(store.async_list_groups(), self._gekozen)
        if groep is None:
            # Tussen de twee stappen door weggehaald — bijvoorbeeld door een
            # tweede admin, of door een herladen opslag.
            return self.async_abort(reason="niet_gevonden")

        schema = vol.Schema({vol.Required(CONF_BEVESTIGD, default=False): bool})
        placeholders = {"groep": self._label(groep)}

        if user_input is None:
            return self.async_show_form(
                step_id="confirm",
                data_schema=schema,
                description_placeholders=placeholders,
            )

        if not user_input.get(CONF_BEVESTIGD):
            # Het HA-patroon voor "je moet dit echt bevestigen": dezelfde vorm
            # opnieuw, met een fout erbij (SPEC 15.2).
            return self.async_show_form(
                step_id="confirm",
                data_schema=schema,
                description_placeholders=placeholders,
                errors={"base": "bevestiging_vereist"},
            )

        # Exact dezelfde handeling als `domotiapp_lovelace/storage/delete`
        # (SPEC 11.4): één functie, twee aanroepers.
        await store.async_delete_group(self._gekozen)

        return self.async_create_entry(title="", data={})

    def _label(self, groep: dict[str, Any]) -> str:
        """Het label van deze groep, met de naam die HA er nu voor kent."""
        return maak_label(groep, self._friendly_name)

    def _friendly_name(self, entity_id: str) -> str | None:
        state = self.hass.states.get(entity_id)
        if state is None:
            return None
        naam = state.attributes.get("friendly_name")
        return naam if isinstance(naam, str) and naam else None


# --------------------------------------------------------------------------
# Labels
# --------------------------------------------------------------------------


def _zoek(groepen: list[dict[str, Any]], registry_entry_id: str | None):
    """De groep met dit registry-entry-ID, of None."""
    for groep in groepen:
        if groep["registry_entry_id"] == registry_entry_id:
            return groep
    return None


def maak_label(groep: dict[str, Any], friendly_name=lambda _entity_id: None) -> str:
    """Eén regel tekst per groep (SPEC 15.2).

    Drie vormen, want er zijn drie gevallen die een admin uit elkaar moet
    kunnen houden vóórdat hij iets weggooit:

        Slaapkamer (light.lampen_slaapkamer) — 2/2/0 lampen
        light.oude_naam — bestaat niet meer — 3/1/0 lampen
        light.kapotte_kamer — onleesbaar

    De aantallen zijn `configured_light_count` per scene, zodat zichtbaar is of
    je iets leegs weggooit of iets waar werk in zit. Bij een onleesbare groep is
    dat aantal `null` en staat er niets: dat aantal is niet te bepalen zonder de
    data te interpreteren, en interpreteren is precies wat we bij onleesbare
    data niet doen (SPEC 11.3.1).
    """
    entity_id = groep["current_entity_id"] or groep["last_known_entity_id"]
    naam = entity_id
    if groep["exists"] and groep["current_entity_id"]:
        # Bestaat de entiteit nog, dan is zijn naam het herkenbaarst; het
        # entity-ID gaat erachteraan zodat twee kamers met dezelfde naam uit
        # elkaar te houden zijn.
        vriendelijk = friendly_name(groep["current_entity_id"])
        if vriendelijk:
            naam = f"{vriendelijk} ({groep['current_entity_id']})"

    if groep.get("corrupt"):
        return f"{naam} — onleesbaar"

    aantallen = groep.get("configured_light_count")
    achtervoegsel = (
        f" — {'/'.join(str(getal) for getal in aantallen)} lampen"
        if aantallen is not None
        else ""
    )

    if not groep["exists"]:
        return f"{naam} — bestaat niet meer{achtervoegsel}"

    return f"{naam}{achtervoegsel}"
