"""De getallen van de automatiseringskaart, en waarom dit in de integratie zit.

Gevraagd op 31 oktober 2026, via de beheersessie: de klant maakt zelf eenvoudige
automatiseringen, en de eigenaar bepaalt uit welke lampen hij kiest.

**Geen echte automatiseringen van Home Assistant.** `config/automation/config`
mag alleen een beheerder, en een klant is dat meestal niet. De regels staan dus
in de opslag van de integratie, die ze zelf uitvoert. Zo blijven ze ook gescheiden
van wat de installateur zelf maakte.

**De lijst met lampen staat in de kaartconfig.** Die kan alleen een beheerder
wijzigen, en de SERVER leest hem zelf uit de dashboards (`meldingen/kaarten.py`):
wat een kaart vraagt, wordt daaraan getoetst.
"""

from __future__ import annotations

from ..const import DOMAIN

DATA_OPSLAG = "automatisering_opslag"
DATA_MOTOR = "automatisering_motor"
DATA_ABONNEES = "automatisering_abonnees"
DATA_WS_REGISTERED = "automatisering_ws_registered"

STORAGE_KEY = f"{DOMAIN}.automatisering"
STORAGE_VERSION = 1

KAART_TYPE = "custom:domotiapp-automatisering-card"

# Alleen een wens; zie VakantieSchakelaar in switch.py.
VAKANTIE_ENTITY_ID = "switch.domotiapp_vakantiemodus"
VAKANTIE_UNIQUE_ID = f"{DOMAIN}_vakantiemodus"
# Wat er als bestaande vakantiestand aan de kaart gekoppeld kan worden.
KOPPEL_DOMEINEN = ("input_boolean", "switch")

SOORT_TIJD = "tijd"
SOORT_ZONSOPKOMST = "zonsopkomst"
SOORT_ZONSONDERGANG = "zonsondergang"
# Sinds 0.103.0: de lichtsterkte van een sensor die de beheerder op de kaart zette (`lichtsensor`). Zie de kop van licht.py.
SOORT_LICHT = "licht"
SOORTEN = (SOORT_TIJD, SOORT_ZONSOPKOMST, SOORT_ZONSONDERGANG, SOORT_LICHT)
RICHTING_DONKER = "donker"
RICHTING_LICHT = "licht"
# Zolang moet het donker (of licht) blijven voordat de regel iets doet: een wolk is nog geen avond.
LICHT_WACHT_MIN = 5
MAX_LUX = 200000

# Hoe ver een verschuiving op de zon mag: drie uur, zoals de kaart hem aanbiedt.
MAX_VERSCHIL_MIN = 180
# Keuze van de eigenaar, 31 oktober 2026: elke dag hoogstens een kwartier vroeger
# of later, vast ingebouwd.
VAKANTIE_WISSEL_MIN = 15

# Wat Music Assistant afspeelt (sinds 0.101.0): de soorten uit zijn zoekresultaten.
MEDIA_SOORTEN = ("track", "album", "artist", "playlist", "radio", "podcast", "audiobook")
MAX_URI = 500

# Muziek die gemist is, haalt de motor niet in: een wekkerlijst die om 07:00 moest en na een herstart om 09:30 alsnog
# begint, is erger dan stilte. Een paar minuten mag, want een tik kan net na de herstart vallen.
MEDIA_INHAAL_MIN = 5

# Een favoriet kan na een tijd nog iets doen (sinds 0.122.0): `daarna`, stappen met elk `na` minuten na de tik. De
# eigenaar, 12 november 2026: "ik wil dat als optie hebben na zoveel tijd ook iets aan of uit". Zie `Motor.plan_favoriet`.
MAX_STAPPEN = 10
MAX_NA_MIN = 24 * 60

# Een grens zodat een open commando de opslag niet vol kan schrijven.
MAX_REGELS = 200
MAX_FAVORIETEN = 50
MAX_LAMPEN_PER_REGEL = 200
MAX_NAAM = 60
# Onderdelen in één regel (sinds 0.102.0), elk met eigen lampen en tijden.
MAX_DELEN = 24

# Hoe lang een gemist moment na een herstart nog telt. Uit langer dan aan: een
# lamp die de hele dag blijft branden is erger dan een die laat uitgaat, en een
# lamp die om 07:00 aan moest, hoort niet 's middags ineens aan te gaan.
INHAAL_AAN_UUR = 4
INHAAL_UIT_UUR = 24

# Zolang wachten na het opstarten. Lampen van Zigbee en wifi zijn er dan meestal.
INHAAL_NA_SEC = 30

# Elk uur opnieuw de dashboards lezen, net als de meldingen: `lovelace_updated`
# zegt niets over een dashboard dat in zijn geheel weggaat.
HERLEES_INTERVAL_MIN = 60
