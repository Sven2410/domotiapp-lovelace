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
SOORTEN = (SOORT_TIJD, SOORT_ZONSOPKOMST, SOORT_ZONSONDERGANG)

# Hoe ver een verschuiving op de zon mag: drie uur, zoals de kaart hem aanbiedt.
MAX_VERSCHIL_MIN = 180
# Keuze van de eigenaar, 31 oktober 2026: elke dag hoogstens een kwartier vroeger
# of later, vast ingebouwd.
VAKANTIE_WISSEL_MIN = 15

# Een grens zodat een open commando de opslag niet vol kan schrijven.
MAX_REGELS = 200

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
