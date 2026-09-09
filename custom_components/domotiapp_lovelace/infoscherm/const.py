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

- de installateur (admin): plaatst de kaarten en wijst de kioskaccounts aan;
- de receptie (gewone gebruiker): beheert alles wat op het scherm staat;
- het kioskaccount (gewone gebruiker, de iPad): mag ALLEEN aanwezigheid
  omzetten en verlichting schakelen.

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
DATA_WS_REGISTERED: Final = "infoscherm_ws_registered"
DATA_VIEW_REGISTERED: Final = "infoscherm_view_registered"
DATA_ABONNEES: Final = "infoscherm_abonnees"
DATA_MIDDERNACHT: Final = "infoscherm_middernacht"

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
MAX_NIEUWS: Final = 200
MAX_WELKOM: Final = 10
MAX_FEEDS: Final = 10
MAX_UITZONDERINGEN: Final = 100

MAX_LAMPEN: Final = 40
MAX_AGENDAS: Final = 10
MAX_BLOKKEN: Final = 12

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
)
AANWEZIG_WEERGAVEN: Final = ("gescheiden", "functie", "lijst")

EVENT_STAND: Final = "stand"
EVENT_FEEDS: Final = "feeds"
