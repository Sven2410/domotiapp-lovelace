"""Config flow en options flow voor DomotiApp Lovelace.

De config flow heeft één stap met één keuze: het **thema** van de kaarten
(automatisch, licht of donker). Tot 0.54.0 was die stap leeg; de eigenaar vroeg
op 30 september 2026 om een licht thema, met de keuze bij het toevoegen van de
integratie. De keuze staat in de `options` van de entry, zodat hij achteraf te
verzetten is zonder de integratie opnieuw toe te voegen.

De **options flow** begint met een menu: *Uiterlijk* (dezelfde keuze, achteraf)
en *Opgeslagen scenes opruimen* (SPEC 15). Dat laatste is de enige plek waar
een admin opgeslagen scenes van een light group kan weggooien. Twee stappen:
een keuzelijst en een bevestiging.

**Dit wijkt af van de letter van SPEC 15.2 en 19**, die een lege config flow en
een options flow met alleen het opruimoverzicht beschrijven. De opruimstappen
zelf zijn ongewijzigd; er staat een menu voor, en de eerste stap heet `scenes`
in plaats van `init`. Zo stond het ook in 0.5.0, toen er een stap Alarmcode
naast stond. Zie `docs/licht-thema/RAPPORT.md`.

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

from .const import CONF_THEMA, DATA_STORE, DOMAIN, THEMA_AUTO, THEMAS
from .store import StoreUnusableError

CONF_GROEP = "groep"
CONF_BEVESTIGD = "bevestigd"


def _thema_schema(huidig: str) -> vol.Schema:
    """De keuze automatisch, licht of donker, als drie keuzerondjes.

    Een lijst en geen uitklapmenu: het zijn er drie, en dan zie je ze liever
    alle drie staan dan dat je eerst moet tikken om te weten wat er te kiezen
    valt. De namen komen uit `selector.thema.options` in de vertalingen.
    """
    return vol.Schema(
        {
            vol.Required(CONF_THEMA, default=huidig): SelectSelector(
                SelectSelectorConfig(
                    options=list(THEMAS),
                    mode=SelectSelectorMode.LIST,
                    translation_key=CONF_THEMA,
                )
            )
        }
    )


def _als_thema(waarde: Any) -> str:
    """Een bekende keuze, of `auto`."""
    return waarde if waarde in THEMAS else THEMA_AUTO


class DomotiappSceneConfigFlow(ConfigFlow, domain=DOMAIN):
    """Eén stap, één keuze: het thema van de kaarten."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Kies automatisch, licht of donker; automatisch staat voor."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is None:
            return self.async_show_form(
                step_id="user", data_schema=_thema_schema(THEMA_AUTO)
            )

        # In `options` en niet in `data`: dit is een voorkeur die achteraf te
        # verzetten is (Configureren), geen gegeven waar de integratie op
        # draait.
        return self.async_create_entry(
            title="DomotiApp Lovelace",
            data={},
            options={CONF_THEMA: _als_thema(user_input.get(CONF_THEMA))},
        )

    @staticmethod
    @callback
    def async_get_options_flow(entry: ConfigEntry) -> OptionsFlow:
        """Het opruimoverzicht (SPEC 15)."""
        return DomotiappSceneOptionsFlow()


class DomotiappSceneOptionsFlow(OptionsFlow):
    """Configureren: het uiterlijk, of het opruimoverzicht (SPEC 15.2)."""

    def __init__(self) -> None:
        self._gekozen: str | None = None

    # ----------------------------------------------------------------------
    # Stap init — het menu
    # ----------------------------------------------------------------------

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Twee dingen vallen er te doen: het thema kiezen, of opruimen."""
        return self.async_show_menu(
            step_id="init", menu_options=["uiterlijk", "scenes"]
        )

    # ----------------------------------------------------------------------
    # Stap uiterlijk — licht, donker of automatisch
    # ----------------------------------------------------------------------

    async def async_step_uiterlijk(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Dezelfde keuze als bij het toevoegen, met de huidige voorgevuld.

        Een entry van vóór 0.54.0 heeft de keuze niet; die staat dan op
        automatisch, want dat is ook wat de kaarten zonder keuze doen.
        """
        huidig = _als_thema(self.config_entry.options.get(CONF_THEMA))

        if user_input is None:
            return self.async_show_form(
                step_id="uiterlijk", data_schema=_thema_schema(huidig)
            )

        # De rest van de options blijft staan: `async_create_entry` VERVANGT ze.
        return self.async_create_entry(
            title="",
            data={
                **self.config_entry.options,
                CONF_THEMA: _als_thema(user_input.get(CONF_THEMA)),
            },
        )

    # ----------------------------------------------------------------------
    # Stap scenes — de keuzelijst
    # ----------------------------------------------------------------------

    async def async_step_scenes(
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
            step_id="scenes",
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

        # De options gaan ongewijzigd terug. Hier stond `data={}`, en dat was
        # goed zolang er geen options waren; nu zou het de themakeuze wissen
        # bij elke kamer die wordt opgeruimd.
        return self.async_create_entry(title="", data=dict(self.config_entry.options))

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
