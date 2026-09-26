"""Constanten voor de meldingenkaart.

Gevraagd op 26 september 2026: *"Dat is een kaart waar je personen kan invullen
in de GUI en dat op een scherm een schakelaar toont om de meldingen aan of uit
te zetten. (...) In de GUI wil ik dan een keuzelijst hebben wat voor meldingen
kaart het is. Voor nu doen we alleen de optie Afval meldingen."*

## Waarom dit in de integratie zit en niet in de kaart

Om 07:30 heeft niemand een dashboard open. Een kaart bestaat alleen zolang er
een scherm naar kijkt; de melding moet dus van de serverkant komen. De kaart
toont wie er aan staat en zet dat om -- verder niets.

## Waarom de instellingen uit de DASHBOARDS gelezen worden

De camerakaart stuurt zijn instellingen naar de server als hij getekend wordt.
Dat werkt bij één kaart, maar met dezelfde kaart op de telefoon en op de
tablet, en één daarvan net aangepast, overschrijven ze elkaar om de beurt. Hier
leest de serverkant de opgeslagen dashboards zelf. Dat geeft één bron, een
verwijderde kaart verstuurt niets meer, en een kiosk-account zonder
beheerdersrechten hoeft niets weg te schrijven.
"""

from __future__ import annotations

from ..const import DOMAIN

# hass.data-sleutels. Met voorvoegsel: de bewaking en het infoscherm hebben
# ook een opslag, een motor en een vlag voor de commando's.
DATA_OPSLAG = "meldingen_opslag"
DATA_MOTOR = "meldingen_motor"
DATA_ABONNEES = "meldingen_abonnees"
DATA_WS_REGISTERED = "meldingen_ws_registered"

STORAGE_KEY = f"{DOMAIN}.meldingen"
STORAGE_VERSION = 1

# Het type in de dashboardconfig. Zo zoekt de serverkant zijn kaarten op.
KAART_TYPE = "custom:domotiapp-meldingen-card"

SOORT_AFVAL = "afval"
SOORTEN = (SOORT_AFVAL,)

# De twee momenten van een afvalmelding. "morgen" is de avond ervoor, over wat
# er de volgende dag opgehaald wordt; "vandaag" is de ochtend zelf.
MOMENT_MORGEN = "morgen"
MOMENT_VANDAAG = "vandaag"
MOMENTEN = (MOMENT_MORGEN, MOMENT_VANDAAG)

# Zoals zijn eigen automatisering ze had.
STANDAARD_TIJD = {MOMENT_VANDAAG: "07:30", MOMENT_MORGEN: "19:30"}

# De knop in de melding. Het id draagt de melding en de ophaaldag mee, zodat
# een tik op een melding van gisteren niets doet met die van vandaag.
ACTIE_BUITEN = "DOMOTIAPP_AFVAL_BUITEN"
EVENT_ACTIE = "mobile_app_notification_action"

# Na zoveel tijd opnieuw alle dashboards lezen, voor wat `lovelace_updated`
# niet meldt: een dashboard dat in zijn geheel verwijderd wordt.
HERLEES_INTERVAL_MIN = 60
