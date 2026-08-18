"""DomotiApp Lovelace — serveert en registreert zijn eigen Lovelace-kaart.

De integratie doet:

1. `hass.http.async_register_static_paths()` — het gebundelde JS-bestand op
   een eigen URL zetten.
2. `frontend.add_extra_js_url()` — dat bestand door HA laten importeren in
   `index.html`, zodat de klant géén Lovelace-resource hoeft toe te voegen.
3. **Dezelfde URL óók als Lovelace-resource registreren** (SPEC 16.5). Twee
   routes, één URL: `index.html` dekt HA's ingebouwde panelen, de resource
   dekt een browser die nog een `index.html` van vóór de installatie in zijn
   service-workercache heeft. Zie `resource.py` voor het waarom.
4. De opslaglaag laden en de WebSocket-commando's registreren (SPEC 10 en 11).
5. Achtergebleven snapshot-scenes opruimen (SPEC 9.3.1).

De `?v=` in de frontend-URL is de **hash van het bundelbestand**, niet het
versienummer (SPEC 16.2). Alleen dan verandert de URL precies wanneer de
inhoud verandert.
"""

from __future__ import annotations

import hashlib
import logging
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url, remove_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.scene import DOMAIN as SCENE_DOMAIN
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

from . import resource, websocket
from .const import (
    CARD_FILENAME,
    CARD_URL_PATH,
    DATA_ENTRY_COUNT,
    DATA_JS_URL,
    DATA_RESOURCE_ID,
    DATA_STATIC_PATH_REGISTERED,
    DATA_STORE,
    DOMAIN,
    SNAPSHOT_ENTITY_ID_PREFIX,
)
from .store import SceneStore

_LOGGER = logging.getLogger(__name__)

# Lengte van de hash in de ?v= (SPEC 16.2).
_HASH_LENGTE = 12


def _bereken_hash(pad: Path) -> str:
    """SHA-256 van het bundelbestand, afgekapt. Blokkerende I/O."""
    digest = hashlib.sha256(pad.read_bytes()).hexdigest()
    return digest[:_HASH_LENGTE]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Zet de integratie op."""
    integration = await async_get_integration(hass, DOMAIN)
    bundel = Path(integration.file_path) / "frontend" / CARD_FILENAME

    # Bestand lezen is blokkerende I/O en hoort dus in een executor — dezelfde
    # reden waarom async_register_static_paths er zelf ook een gebruikt
    # (SPEC 16.2).
    bundel_hash = await hass.async_add_executor_job(_bereken_hash, bundel)
    js_url = f"{CARD_URL_PATH}?v={bundel_hash}"
    _LOGGER.debug("Bundelhash %s -> %s", bundel_hash, js_url)

    data = hass.data.setdefault(DOMAIN, {})

    # Guard tegen dubbele registratie van hetzelfde URL-pad: aiohttp weigert
    # een tweede route op dezelfde prefix, en met meerdere config entries zou
    # setup anders de tweede keer stukgaan.
    if not data.get(DATA_STATIC_PATH_REGISTERED):
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    CARD_URL_PATH,
                    str(bundel),
                    cache_headers=True,
                )
            ]
        )
        data[DATA_STATIC_PATH_REGISTERED] = True
        _LOGGER.debug("Statisch pad geregistreerd op %s", CARD_URL_PATH)

    # UrlManager houdt een frozenset bij, dus een tweede identieke add() is
    # onschadelijk. Een gewijzigde bundel levert wél een andere URL op; de
    # oude moet dan weg, anders staan er twee import()s in index.html.
    vorige_url = data.get(DATA_JS_URL)
    if vorige_url is not None and vorige_url != js_url:
        remove_extra_js_url(hass, vorige_url)

    if vorige_url != js_url:
        add_extra_js_url(hass, js_url)
        data[DATA_JS_URL] = js_url
        _LOGGER.debug("Kaart aangemeld bij de frontend als %s", js_url)

    # De tweede laadroute (SPEC 16.5). Bewust met dezelfde `js_url`-variabele
    # en niet met een opnieuw opgebouwde string: lopen de twee URL's uit
    # elkaar, dan evalueert de browser de bundel twee keer en klopt de
    # cachebusting uit SPEC 16.2 niet meer. Deze aanroep gooit nooit.
    data[DATA_RESOURCE_ID] = await resource.async_zorg_voor_resource(hass, js_url)

    # Opslaglaag: één instantie voor alle config entries.
    if DATA_STORE not in data:
        store = SceneStore(hass)
        await store.async_load()
        data[DATA_STORE] = store

    websocket.async_register(hass)

    data[DATA_ENTRY_COUNT] = data.get(DATA_ENTRY_COUNT, 0) + 1

    # Ná de frontend-registratie, zodat traagheid hier het laden van de kaart
    # niet ophoudt (SPEC 9.3.1).
    await _async_ruim_snapshots_op(hass)

    return True


async def _async_ruim_snapshots_op(hass: HomeAssistant) -> None:
    """Verwijder achtergebleven snapshot-scenes (SPEC 9.3.1).

    Eén lus, één keer, bij setup. Geen periodieke taak.

    Bij een verse start van HA is deze lijst per definitie leeg: een via
    `scene.create` aangemaakte scene heeft geen `unique_id` en overleeft geen
    herstart. De lus doet dus alleen werk bij een reload van de config entry
    terwijl HA doordraait — precies de handeling die na elke rebuild nodig is.

    Deze functie gooit nooit. Opruimen is een nette handeling, geen voorwaarde
    om te kunnen draaien; de integratie niet laten starten omdat een
    cosmetische entiteit bleef staan zou het middel erger maken dan de kwaal.
    """
    verweesd = [
        state.entity_id
        for state in hass.states.async_all(SCENE_DOMAIN)
        if state.entity_id.startswith(SNAPSHOT_ENTITY_ID_PREFIX)
    ]

    if not verweesd:
        return

    _LOGGER.debug("Achtergebleven snapshot-scenes opruimen: %s", verweesd)

    for entity_id in verweesd:
        # Elke delete in een eigen try, zodat één mislukking de andere niet
        # overslaat. scene.delete weigert bovendien zelf alles wat niet
        # dynamisch is aangemaakt, dus de prefix is de eerste zeef, niet de
        # enige.
        try:
            await hass.services.async_call(
                SCENE_DOMAIN,
                "delete",
                {"entity_id": entity_id},
                blocking=True,
            )
        except Exception as fout:  # noqa: BLE001 - opruimen mag nooit fataal zijn
            _LOGGER.warning(
                "Achtergebleven snapshot-scene %s kon niet worden verwijderd: %s",
                entity_id,
                fout,
            )


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Ruim op bij de laatste entry.

    Het statische pad blijft staan: aiohttp kent geen unregister voor routes.
    De vlag blijft daarom ook staan, zodat een herinstallatie binnen dezelfde
    HA-run niet opnieuw registreert. Hetzelfde geldt voor de
    WebSocket-commando's: HA kent geen `async_unregister_command`.

    De opslaglaag verdwijnt hier wél. Zonder dat blijven de commando's na het
    verwijderen van de integratie gewoon lezen én schrijven naar de Store van
    een integratie die er niet meer is (SPEC 11.7).

    **De Lovelace-resource blijft hier ook staan** (SPEC 16.5). Unload draait
    óók bij elke reload — de handeling die na iedere rebuild nodig is — en de
    resource zou dan bij elke herstart verdwijnen en terugkomen. Weghalen
    gebeurt in `async_remove_entry`.
    """
    data = hass.data.get(DOMAIN, {})
    data[DATA_ENTRY_COUNT] = max(0, data.get(DATA_ENTRY_COUNT, 0) - 1)

    if data[DATA_ENTRY_COUNT] == 0:
        if js_url := data.pop(DATA_JS_URL, None):
            remove_extra_js_url(hass, js_url)
            _LOGGER.debug("Kaart afgemeld bij de frontend: %s", js_url)

        if data.pop(DATA_STORE, None) is not None:
            _LOGGER.debug("Opslaglaag losgelaten")

    return True


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Haal de Lovelace-resource weg als de integratie wordt verwijderd.

    Alleen hier, en alleen als dit de laatste entry was. HA verwijdert de entry
    uit zijn lijst vóórdat het deze callback aanroept
    (`config_entries.py`: `del self._entries[...]` gaat vooraf aan
    `entry.async_remove(...)`), dus wat `async_entries()` teruggeeft zijn de
    entries die blíjven.

    De opslag met de scenes blijft staan — dat is SPEC 15.4 en verandert hier
    niet. Alleen de laadroute verdwijnt.
    """
    if hass.config_entries.async_entries(DOMAIN):
        return

    await resource.async_verwijder_resource(hass)
    hass.data.get(DOMAIN, {}).pop(DATA_RESOURCE_ID, None)
