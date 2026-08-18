"""Constanten voor DomotiApp Lovelace."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "domotiapp_lovelace"

# Bestandsnaam van de gebundelde Lovelace-kaart, en het URL-pad waarop de
# integratie hem serveert.
CARD_FILENAME: Final = "domotiapp-lovelace.js"
CARD_URL_PATH: Final = f"/{DOMAIN}/{CARD_FILENAME}"

# Sleutels in hass.data[DOMAIN]. Het aantal entries is nodig omdat de
# frontend-registratie hoort te verdwijnen zodra de laatste entry weg is.
DATA_STATIC_PATH_REGISTERED: Final = "static_path_registered"
DATA_JS_URL: Final = "js_url"
DATA_ENTRY_COUNT: Final = "entry_count"
DATA_STORE: Final = "store"
DATA_WS_REGISTERED: Final = "ws_registered"
DATA_RESOURCE_ID: Final = "resource_id"

# De tweede laadroute (SPEC 16.5). `module` is het enige type dat een ES-module
# importeert; de andere drie (`js`, `css`, `html`) doen dat niet.
RESOURCE_TYPE: Final = "module"

# De lader die in index.html terechtkomt, overgenomen uit de wekkerintegratie.
# Hij staat onder /api/ omdat HA's service worker dat pad als enige NOOIT cachet,
# en zijn URL verandert NOOIT -- daar berust de hele constructie op. In
# index.html een gehashte URL zetten werkte niet: dat document wordt zelf
# gecachet, en dan kreeg de klant na een update de oude hash terug. Zie
# loader.py voor de meting waar dit uit voortkomt.
LOADER_URL_PATH: Final = f"/api/{DOMAIN}/loader.js"
DATA_LOADER_REGISTERED: Final = "loader_hash"

# Lengte van de hash in de ?v=.
HASH_LENGTE: Final = 12

# --- Opslag (SPEC 10.4 en 10.6) -----------------------------------------
STORAGE_KEY: Final = f"{DOMAIN}.scenes"
STORAGE_VERSION: Final = 1
STORAGE_MINOR_VERSION: Final = 1

# De opslagsleutel van de losse scene-integratie waar dit pakket uit voortkomt.
#
# Wie daarvandaan komt heeft zijn scenes per kamer al ingesteld, en die staan in
# een bestand met een andere naam. Dat bestand wordt EENMALIG en ALLEEN-LEZEND
# overgenomen als onze eigen opslag nog niet bestaat; zie `SceneStore.async_load`.
# Het origineel wordt nooit aangeraakt, zodat de oude integratie blijft werken
# zolang die nog geinstalleerd is.
LEGACY_STORAGE_KEY: Final = "domotiapp_scene.scenes"

# Precies drie scenes, hardcoded, uit één constante (SPEC 3, INVENTARIS punt n).
SCENE_COUNT: Final = 3

# Standaardiconen bij een lege opslag (SPEC 3).
#
# Namen uit de eigen getekende set van de kaart, niet uit mdi: een verse
# scenekaart hoort uit dezelfde set te komen als de kaarten ernaast. Deze drie
# staan ook in src/scene/const.js en horen gelijk te blijven; wijkt er een af,
# dan toont de kaart een ander icoon dan de opslag zegt.
DEFAULT_ICONS: Final = ("een", "twee", "drie")

# --- Tijdelijke snapshot-scenes (SPEC 9.3.1 en 9.4) ----------------------
SNAPSHOT_SCENE_ID_PREFIX: Final = f"{DOMAIN}_snapshot_"
SNAPSHOT_ENTITY_ID_PREFIX: Final = f"scene.{SNAPSHOT_SCENE_ID_PREFIX}"

# --- Reparatiemeldingen --------------------------------------------------
ISSUE_CORRUPT_GROUP_PREFIX: Final = "corrupte_opslag_"
ISSUE_STORE_UNUSABLE: Final = "opslag_onbruikbaar"
