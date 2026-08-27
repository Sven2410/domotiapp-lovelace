"""Constanten voor de bewaking: snapshots, rustperiode, timeline.

Gevraagd op 27 augustus 2026: *"ik wil bij de beveiligingskaart een snapshot
systeem hebben. (...) Ik wil een delay kunnen instellen want als je door
bepaalde camera's loopt kan hij wel 10 keer een melding sturen. Dan wil ik
kunnen kiezen welke personen meldingen ontvangen."*

## Waarom dit in de integratie zit en niet in de kaart

Een kaart bestaat alleen zolang er een dashboard openstaat. Een telefoon in een
broekzak heeft geen kaart. De keten detectie -> beeld -> opslag -> melding moet
dus aan de serverkant draaien; de kaart toont wat er ligt en stelt het in.

## Waarom de regel aan de CAMERA hangt, maar de rustperiode PER MELDER telt

De instellingen staan per camera: welke melders, hoe lang de rustperiode, hoe
lang de wachttijd, wie er een melding krijgt. Dat is één plek om in te vullen.

De **klok** loopt per melder. Op 27 augustus 2026 gecorrigeerd door de eigenaar,
nadat hier eerst één klok per camera stond: *"je zegt voertuig dier en mens
samen een rustperiode delen maar dat moet niet. Echt een rustperiode per
detectie dus mens apart dier apart etc. Zo soort iets heb ik nu ook en werkt
perfect."*

Hij heeft gelijk, en het is precies andersom dan de aanname erachter. Een
Reolink meldt persoon, voertuig en huisdier als drie losse
`binary_sensor`-entiteiten, en dat zijn drie verschillende gebeurtenissen. Een
auto die de oprit op rijdt hoort een auto te melden, en de bestuurder die
uitstapt hoort een persoon te melden -- dat tweede beeld is juist het beeld dat
je wilt hebben. Eén klok per camera zou dat weggooien.

Wat de rustperiode wél wegneemt is dezelfde melder die binnen een minuut
opnieuw afgaat, en dat is waar de tien meldingen vandaan kwamen.

Groepen over camera's heen zijn bewust NIET gebouwd. Voorgesteld op
27 augustus 2026 en afgewezen: *"Niet werken met groepen. Want ik kan ook een
andere camera niet instellen voor beweging bijvoorbeeld."* Een camera die je niet
instelt doet niets, en daarmee is het groeperen een oplossing voor een probleem
dat je ook door niets in te vullen kunt vermijden.
"""

from __future__ import annotations

from datetime import timedelta
from typing import Final

from ..const import DOMAIN

# --- opslag ---------------------------------------------------------------
# Twee bestanden, met opzet. De regels veranderen alleen als iemand de editor
# opent; de index verandert bij elk beeld. In één bestand zou elke snapshot de
# instellingen opnieuw wegschrijven, en zou een onleesbaar geworden index de
# instellingen meeslepen.
STORAGE_KEY_REGELS: Final = f"{DOMAIN}.bewaking"
STORAGE_KEY_INDEX: Final = f"{DOMAIN}.beelden"
STORAGE_VERSION: Final = 1

# --- sleutels in hass.data ------------------------------------------------
DATA_REGELS: Final = "bewaking_regels"
DATA_INDEX: Final = "bewaking_index"
DATA_MOTOR: Final = "bewaking_motor"
DATA_WS_REGISTERED: Final = "bewaking_ws_registered"
DATA_VIEW_REGISTERED: Final = "bewaking_view_registered"
DATA_ABONNEES: Final = "bewaking_abonnees"

# --- standaardwaarden -----------------------------------------------------
# 60 seconden, op verzoek: *"By default ook 1 min per camera hoe ik het had."*
# Ingesteld per camera, maar geteld per melder -- zie de kop hierboven.
# Bewust niet nul: een instelling die standaard uitstaat, staat bij de meeste
# klanten voor altijd uit, en dan is de rustperiode er alleen voor wie hem al
# begreep.
STANDAARD_RUSTPERIODE: Final = 60

# De wachttijd tussen de detectie en het beeld. Standaard NUL, op verzoek. Hij
# is er omdat de eerste seconde van een detectie vaak nog een lege oprit of een
# rug oplevert, maar dat is een keuze van de klant en geen aanname van ons.
STANDAARD_WACHTTIJD: Final = 0

# Ondergrenzen en bovengrenzen, zodat een typefout geen camera sloopt.
MIN_RUSTPERIODE: Final = 0
MAX_RUSTPERIODE: Final = 24 * 60 * 60
MIN_WACHTTIJD: Final = 0
MAX_WACHTTIJD: Final = 60

# --- opruimen -------------------------------------------------------------
# *"De timeline blijft max een week staan en verwijdert automatisch de laatste
# en overschrijft hem."*
MAX_LEEFTIJD: Final = timedelta(days=7)

# En een bovengrens op het AANTAL, die de eigenaar er op 27 augustus 2026 bij
# koos. Reden: met een rustperiode van één minuut past er in een week ruim
# 10.000 beelden, en dat is bij ~150 kB per stuk enkele gigabytes op de
# installatie van een klant. 500 is ongeveer 75 MB per camera.
MAX_PER_CAMERA: Final = 500

# --- beelden op schijf ----------------------------------------------------
# Onder de configuratiemap en NIET onder `www/`: alles daar is voor iedereen op
# het netwerk op te vragen zonder in te loggen, en dit zijn beelden van de
# voordeur van een klant.
MAP_NAAM: Final = f"{DOMAIN}/beelden"

# Het pad waarop een beeld wordt uitgeserveerd. Onder /api/, met authenticatie;
# de kaart krijgt ondertekende URL's zodat een <img> zonder header werkt.
URL_PREFIX: Final = f"/api/{DOMAIN}/beeld"

# Hoe lang een ondertekende URL geldig is.
#
# Voor de kaart kort: hij vraagt de timeline op het moment dat hij hem toont.
# Voor een melding lang, want een melding wordt uren later pas opengeklikt en
# de telefoon haalt het plaatje dan alsnog op.
GELDIG_KAART: Final = timedelta(hours=2)
GELDIG_MELDING: Final = timedelta(days=7)

# --- soorten gebeurtenissen naar de abonnees ------------------------------
EVENT_NIEUW: Final = "nieuw"
EVENT_OPGERUIMD: Final = "opgeruimd"
EVENT_REGELS: Final = "regels"
