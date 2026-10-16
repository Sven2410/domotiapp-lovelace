"""Constanten voor het infoscherm.

Gevraagd op 9 september 2026: *"Nu heb ik wat aanvragen gekregen van bedrijven
zoals tandartsen, woon-zorg instellingen. Die willen een algemeen informatie
screen hebben zoals weer tijd, logo, eventueel aanwezigheid van de
medewerkers."* Met daarna de invulling: een iPad van 11 inch in kioskmodus,
aanwezigheid door op de naam te tikken, nieuws van het pand, verlichting, en
een receptioniste die het geheel vanaf haar eigen pc beheert.

## Waarom dit een serverkant heeft

Wie de inhoud beheert is een GEWONE gebruiker, en een gewone gebruiker kan in
Home Assistant geen dashboardconfig opslaan. Namen, aanwezigheid, nieuws en het
logo kunnen dus niet in de kaartconfig wonen; ze staan hier, in een eigen
`Store`, bereikbaar via eigen WebSocket-commando's die voor iedere ingelogde
gebruiker openstaan. Dezelfde redenering als SPEC 14 voor `scenes/save`.

## Wie wat mag

Er zijn drie soorten gebruikers, en het verschil zit niet in HA's adminvlag:

- de installateur (admin): plaatst de kaarten, kiest in de kaarteditor van
  het infoscherm de entiteiten (weer, lampen, agenda's) en wijst daar de
  kioskaccounts aan; de kaart stuurt dat naar de opslag (ronde 3);
- de receptie (gewone gebruiker): beheert alles wat op het scherm staat;
- het kioskaccount (gewone gebruiker, de iPad): mag ALLEEN aanwezigheid
  omzetten, verlichting schakelen, en (sinds 16 oktober 2026) een ruimte
  boeken met de code die de receptie instelt.

Welke accounts kiosk zijn staat in de opslag (`instellingen.kiosk_gebruikers`)
en is alleen door een admin te wijzigen. Al het andere beheer is voor elke
ingelogde gebruiker die geen kiosk is.
"""

from __future__ import annotations

from datetime import timedelta
from typing import Final

from ..const import DOMAIN

STORAGE_KEY: Final = f"{DOMAIN}.infoscherm"
STORAGE_VERSION: Final = 1

DATA_STORE: Final = "infoscherm_store"
DATA_FEEDS: Final = "infoscherm_feeds"
DATA_RUIMTES: Final = "infoscherm_ruimtes"
DATA_WS_REGISTERED: Final = "infoscherm_ws_registered"
DATA_VIEW_REGISTERED: Final = "infoscherm_view_registered"
DATA_ABONNEES: Final = "infoscherm_abonnees"

# Bestanden (logo, foto's, nieuwsafbeeldingen) staan naast de camerabeelden,
# onder de configuratiemap en niet onder `www/`: alles onder `www/` is zonder
# inloggen op te vragen, en een personeelsfoto hoort daar niet.
MAP_NAAM: Final = f"{DOMAIN}/infoscherm"
URL_PREFIX: Final = f"/api/{DOMAIN}/infoscherm"

# Een logo van een tandarts is zelden groter dan een paar honderd kB; vier MB
# laat een foto van een telefoon rechtstreeks door zonder dat iemand hem eerst
# hoeft te verkleinen.
MAX_BESTAND: Final = 4 * 1024 * 1024
MAX_BESTANDEN: Final = 500

# Wat de beheerkaart mag opsturen. Ruim, maar begrensd: dit is een tekstveld
# waar iedereen met een login in kan typen.
MAX_PERSONEN: Final = 200
MAX_MEDEDELINGEN: Final = 50
MAX_VERJAARDAGEN: Final = 300
MAX_FEEDS: Final = 10
MAX_UITZONDERINGEN: Final = 100

MAX_LAMPEN: Final = 40
MAX_AGENDAS: Final = 10
# Afvalsensoren voor de afvalkalender. Tien is ruim: een gemeente kent er
# doorgaans vier tot zes (rest, gft, papier, pmd, kerstboom, textiel).
MAX_AFVAL: Final = 10
# Airco's en andere climate-entiteiten (13 oktober 2026). Een praktijk heeft er
# een paar; twintig is ruim voor een verdieping vol kantoren.
MAX_AIRCOS: Final = 20
# Ruimtes om te boeken (16 oktober 2026): per ruimte een agenda in Home
# Assistant. Een praktijk heeft er een paar; twintig is ruim.
MAX_RUIMTES: Final = 20
# Een boeking duurt hooguit een dag, en ligt hooguit een jaar vooruit.
MAX_BOEKING_UREN: Final = 24
MAX_BOEKING_VOORUIT_DAGEN: Final = 366
# De code om op het scherm te boeken: alleen cijfers, want de iPad toont een
# cijferblok en geen toetsenbord.
CODE_MIN: Final = 4
CODE_MAX: Final = 8
# Wie vaker dan dit een verkeerde code geeft, wacht even. Het is geen kluis,
# maar een kind in de wachtkamer hoort niet binnen een minuut alle codes van
# vier cijfers af te kunnen lopen.
CODE_POGINGEN: Final = 5
CODE_WACHT: Final = timedelta(minutes=5)
# Elk soort blok hooguit één keer. Met het ruimteblok zijn er dertien
# soorten; de grens heeft nog ruimte voor de volgende.
MAX_BLOKKEN: Final = 16

MAX_KORT: Final = 120
MAX_MIDDEL: Final = 500
MAX_LANG: Final = 5000

# Nieuws van buiten wordt elk kwartier opgehaald. Vaker heeft geen zin voor
# een wachtkamer, en zeldener laat een bericht van 's ochtends tot na de
# middag op het scherm staan.
FEED_INTERVAL: Final = timedelta(minutes=15)
FEED_TIMEOUT: Final = 15
FEED_MAX_ITEMS: Final = 15

DAGEN: Final = ("ma", "di", "wo", "do", "vr", "za", "zo")

# Het welkomscherm is een raster van zes bij zes. De receptie sleept de
# blokken in het beheer; het scherm tekent ze op precies die plek.
KOLOMMEN: Final = 6
RIJEN: Final = 6
BLOK_SOORTEN: Final = (
    "welkom",
    "weer",
    "mededeling",
    "openingstijden",
    "aanwezig",
    "nieuws",
    "verlichting",
    "agenda",
    "verjaardagen",
    "energie",
    # Ronde 5 (17 september 2026): de afvalkalender, op verzoek van de eigenaar
    # ("zodat de beheerder die ook kan toevoegen op het kiosk scherm").
    "afval",
    # 13 oktober 2026: de airco's. Op het blok de temperatuur in de kamer en
    # wat er ingesteld is; op de pagina erachter bedienen.
    "klimaat",
    # 16 oktober 2026: de ruimtes. Op het blok per ruimte vrij of bezet; op de
    # pagina erachter de dag, en boeken met een code.
    "ruimtes",
)
AANWEZIG_WEERGAVEN: Final = ("gescheiden", "functie", "lijst")

EVENT_STAND: Final = "stand"
EVENT_FEEDS: Final = "feeds"
