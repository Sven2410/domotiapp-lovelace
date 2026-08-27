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

from . import loader, migratie, resource, websocket
from .alarm import afvuren as alarm_afvuren
from .alarm import meldingen as alarm_meldingen
from .alarm import planner as alarm_planner_mod
from .alarm import voorbeeld as alarm_voorbeeld
from .alarm import websocket as alarm_websocket
from .media import sleeptimer as media_sleeptimer
from .media import websocket as media_websocket
from .alarm.const import DATA_PLANNER as ALARM_DATA_PLANNER
from .alarm.const import DATA_STORE as ALARM_DATA_STORE
from .alarm.const import LEGACY_STORAGE_KEY as ALARM_LEGACY_STORAGE_KEY
from .alarm.const import STORAGE_KEY as ALARM_STORAGE_KEY
from .alarm.const import STORAGE_VERSION as ALARM_STORAGE_VERSION
from .alarm.store import AlarmStore
from .const import (
    CARD_FILENAME,
    CARD_URL_PATH,
    DATA_ENTRY_COUNT,
    DATA_JS_URL,
    DATA_RESOURCE_ID,
    DATA_STATIC_PATH_REGISTERED,
    DATA_STORE,
    DOMAIN,
    HASH_LENGTE,
    LEGACY_STORAGE_KEY,
    LOADER_URL_PATH,
    SNAPSHOT_ENTITY_ID_PREFIX,
    STORAGE_KEY,
    STORAGE_VERSION,
)
from .store import SceneStore

_LOGGER = logging.getLogger(__name__)

def _bereken_hash(pad: Path) -> str:
    """SHA-256 van het bundelbestand, afgekapt. Blokkerende I/O."""
    digest = hashlib.sha256(pad.read_bytes()).hexdigest()
    return digest[:HASH_LENGTE]


async def _async_zet_commandos_klaar(hass: HomeAssistant, data: dict) -> None:
    """De opslaglagen en daarna de WebSocket-commando's, vóór al het andere.

    DIT STAAT MET OPZET VOORAAN, en het stond tot 0.18.0 achteraan.

    Zolang een commando niet geregistreerd is antwoordt Home Assistant
    `unknown_command: Unknown command.` -- de fout die de eigenaar op zijn
    telefoon zag. Elke `await` die hiervóór staat verlengt dus het gat waarin
    een kaart die net verbonden is bot vangt: het lezen van de bundel, het
    statische pad, de lader, het wegschrijven van de Lovelace-resource. Dat is
    geen twee minuten, maar het is meetbaar en het is gratis om weg te nemen.

    De opslaglagen gaan er direct aan vooraf en niet erna, want een commando
    dat geregistreerd is terwijl zijn opslag nog ontbreekt is geen winst: de
    scenekant zou `not_allowed` antwoorden en de wekkerkant zou op een
    KeyError stuklopen.

    Wat híer niet naartoe verhuist is de frontendregistratie. Die mag wachten:
    een kaart die nog niet geladen is, vraagt ook nog niets.
    """
    # Wie van de losse pakketten komt neemt zijn scenes en wekkers mee. Vóór de
    # opslaglagen, want die lezen meteen. Raakt niets aan als ons eigen bestand
    # er al is -- en ook niet als het oude er nooit was. Zie migratie.py.
    await migratie.async_neem_over(hass, STORAGE_KEY, LEGACY_STORAGE_KEY, STORAGE_VERSION)
    await migratie.async_neem_over(
        hass, ALARM_STORAGE_KEY, ALARM_LEGACY_STORAGE_KEY, ALARM_STORAGE_VERSION
    )

    # Opslaglaag: één instantie voor alle config entries.
    if DATA_STORE not in data:
        store = SceneStore(hass)
        await store.async_load()
        data[DATA_STORE] = store

    if ALARM_DATA_STORE not in data:
        alarm_store = AlarmStore(hass)
        await alarm_store.async_load()
        data[ALARM_DATA_STORE] = alarm_store

    # Vanaf hier antwoordt Home Assistant op onze commando's. De mediakant
    # heeft geen eigen opslag; die twee commando's praten met Music Assistant.
    websocket.async_register(hass)
    alarm_websocket.async_register(hass)
    media_websocket.async_register(hass)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Zet de integratie op."""
    await _async_zet_commandos_klaar(hass, hass.data.setdefault(DOMAIN, {}))

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

    # De lader die in index.html terechtkomt. Zijn URL is CONSTANT en de hash zit
    # in zijn antwoord, niet in zijn adres. Daarmee kan een verouderde
    # index.html -- die HA zonder cachevalidatie serveert en die zijn service
    # worker stale-while-revalidate teruggeeft -- ons niet meer op een oude
    # bundel zetten. Dit is de route uit de wekkerintegratie; zie loader.py voor
    # de meting waar hij uit voortkomt.
    loader.async_registreer(hass, bundel_hash)

    # UrlManager houdt een frozenset bij, dus een tweede identieke add() is
    # onschadelijk. `vorige_url` blijft staan voor precies één geval: een
    # installatie die binnen dezelfde HA-run nog de gehashte URL geregistreerd
    # had, moet die kwijt, anders staan er twee import()s in index.html.
    vorige_url = data.get(DATA_JS_URL)
    if vorige_url is not None and vorige_url != LOADER_URL_PATH:
        remove_extra_js_url(hass, vorige_url)

    if vorige_url != LOADER_URL_PATH:
        add_extra_js_url(hass, LOADER_URL_PATH)
        data[DATA_JS_URL] = LOADER_URL_PATH
        _LOGGER.debug("Lader aangemeld bij de frontend als %s", LOADER_URL_PATH)

    # De tweede laadroute (SPEC 16.5). Bewust met dezelfde `js_url`-variabele
    # en niet met een opnieuw opgebouwde string: lopen de twee URL's uit
    # elkaar, dan evalueert de browser de bundel twee keer en klopt de
    # cachebusting uit SPEC 16.2 niet meer. Deze aanroep gooit nooit.
    data[DATA_RESOURCE_ID] = await resource.async_zorg_voor_resource(hass, js_url)

    # De opslaglagen, de scene-, wekker- en mediacommando's staan hierboven in
    # `_async_zet_commandos_klaar`, dat als eerste draait. De sleutels van de
    # wekkerkant dragen een `alarm_`-voorvoegsel, want beide kanten hadden een
    # `store` en een `ws_registered`; zie alarm/const.py.

    # Reparatiemeldingen voor onleesbare opslag. Idempotent: meldingen die er
    # niet meer horen te zijn worden opgeruimd.
    alarm_meldingen.async_werk_reparatiemeldingen_bij(hass, data[ALARM_DATA_STORE])

    # De planner. Ná de frontend-registratie, zodat een inhaalslag het laden van
    # de kaarten niet ophoudt.
    if ALARM_DATA_PLANNER not in data:
        alarm_planner = alarm_planner_mod.Planner(hass)
        data[ALARM_DATA_PLANNER] = alarm_planner
        await alarm_planner.async_start()

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
        # Eerst de wekkerkant, en in deze volgorde. Een planner-listener die na
        # het loslaten van de opslag nog vuurt zou lezen op een Store die er niet
        # meer is; een afgaande wekker heeft timers lopen die anders tikken over
        # een losgelaten hass.data -- en zonder stoptimer speelt de muziek door
        # zonder dat er nog iemand is die hem afzet.
        if (alarm_planner := data.pop(ALARM_DATA_PLANNER, None)) is not None:
            alarm_planner.async_stop()
            _LOGGER.debug("Wekkerplanner gestopt en listeners opgezegd")

        if gestopt := await alarm_afvuren.async_stop_alles(hass):
            _LOGGER.debug("%d afgaande wekker(s) gestopt bij unload", gestopt)

        await alarm_voorbeeld.async_stop_alles(hass)

        # En de sleeptimers van de mediakant, om precies dezelfde reden: een
        # timer die blijft tikken op een losgelaten hass.data zet straks het
        # volume van een speler die niemand meer beheert.
        if (sleeptimers := data.pop(media_sleeptimer.DATA_SLEEPTIMER, None)) is not None:
            sleeptimers.stop_alles()
            _LOGGER.debug("Sleeptimers gestopt bij unload")

        if data.pop(ALARM_DATA_STORE, None) is not None:
            _LOGGER.debug("Wekkeropslag losgelaten")

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
