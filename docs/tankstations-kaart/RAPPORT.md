# De kaart met alle tankstations, onder de prijsborden — 0.144.0

## Waarom

De eigenaar, 27 november 2026, via zijn beheersessie: *"of zou je een map kunnen maken met zoekbalk in heel NL?"*. Na het
uitzoeken van prijzen per pomp: *"oke ik wil alleen een map dan met tankstations en dan gewoon de gemiddelde adviesprijs
bovenaan. Geen prijzen in de buurt"*. De prijsborden kwamen in 0.143.0. Deze ronde zet de kaart eronder.

## Drie keuzes, en waarom

**1. De stations gaan als momentopname mee, en een klant vraagt Overpass nooit zelf.**
- De openbare Overpass-server zei op 27 november zelf, bij een volle wachtrij: *"This public endpoint is intended for
  browser-based and human-operated tools. For automated or high-volume use, run a local Overpass API instance"*. Elke
  Home Assistant die er elke week om vraagt, is precies dat automatische gebruik.
- Daarom haalt `scripts/tankstations.py` ze op, met de hand, bij een uitgave. Het resultaat staat in
  `custom_components/domotiapp_lovelace/gegevens/tankstations-nl.json`: 4031 stations, 370 kB, en gzip maakt er 110 kB
  van.
- De integratie biedt het bestand aan op `/domotiapp_lovelace/gegevens/` zonder inloggen. Het zijn openbare gegevens, net
  als de afbeeldingen.
- **De licentie** is ODbL 1.0, © OpenStreetMap-bijdragers. Ze staat in het bestand zelf en in `gegevens/LEESMIJ.md`, en
  op de kaart staat "Tankstations © OpenStreetMap-bijdragers (ODbL)".
- **Wat eruit gaat:** het gebied NL van OpenStreetMap neemt Caribisch Nederland mee; dat gaat eruit, net als pompen met
  `access=private/no/customers`.

**2. Een eigen Leaflet, en niet `ha-map`.**
- De eerste opzet gebruikte de kaart van Home Assistant zelf (`ha-map`). Die is lui geladen, maar uit te lokken via
  `loadCardHelpers`, en in de testinstance (2026.8) stonden de 4000 punten er netjes op.
- Toen las ik `src/components/map/ha-map.ts` van de frontend van nu. Die tekent met een vector-engine (MapLibre), geeft
  geen `leafletMap` of `Leaflet` meer prijs, en neemt eigen punten alleen als entiteit aan. Bij een klant op 2026.11 had
  de kaart dus geen enkel punt gehad, en dat was in de testinstance niet te zien.
- Daarom zit Leaflet 1.9.4 (BSD-2, uit 2023) nu in de bundel, met zijn CSS als tekst in de shadow root. De bundel groeit
  daardoor van 1,75 naar 1,92 MB.
- De bundel laat commentaar weg, ook de copyrightregels. Die staan nu in `frontend/LICENTIES.md`, voor Leaflet en lit.

**3. De ondergrond komt van de tegelproxy van de core, en anders van OpenStreetMap zelf.**
- Home Assistant haalt zijn ondergrond sinds 2026.9 via `/api/map_tiles` (component `map_tiles`, gelezen in core en
  frontend). Een `<img>` stuurt geen inlog mee, dus het token van `map_tiles/access_token` gaat in het adres
  (`?token=`).
- De core houdt twee tokens geldig en wisselt elk half uur. Hier komt elke twintig minuten een nieuw, en na een geweigerde
  tegel ook (hooguit eens per minuut).
- **Zonder proxy** (2026.8, de testinstance) komen de tegels rechtstreeks van `tile.openstreetmap.org`, zoals in de demo
  van Home Assistant. De oude ondergrond van 2026.8, CARTO, geeft intussen bij elke aanvraag "API KEY REQUIRED"; met
  curl nagekeken, met en zonder verwijzer.
- In donker gaat er een filter over de tegels, en de knoppen en de naamsvermelding volgen het thema.

## Wat er op de kaart staat

- **Zoekbalk:** 16 px tekst, dus geen zoom in Safari. Hij zoekt op naam, merk, straat, postcode en plaats; elk woord moet
  voorkomen, zonder accenten of leestekens. Een merk of naam die met het woord begint telt zwaarder dan een straat, en bij
  gelijke stand gaat het dichtst bij huis voor. Er komen hoogstens zes uitkomsten.
- **Kaart:** 320 hoog, en hij begint op het huis van Home Assistant (zoom 11). De punten staan als één laag op een canvas.
- **Een tik op een uitkomst of een punt:**
  - de kaart vliegt erheen (zoom 15) en de pomp krijgt een ring;
  - eronder staan de naam, het merk, het adres en de openingstijden ("24/7" wordt "Dag en nacht open");
  - daarbij de brandstoffen die OpenStreetMap noemt, en een link "Route" (Google Maps, die op een telefoon de app opent).
- **Geen prijs per pomp:** daar is in Nederland geen open bron voor, en de eigenaar wil hem niet.
- **Editor:** `kaart` (standaard aan) zet de kaart onder de prijsborden.

## Proeven

**NIEUW GEDRAG.** Allebei vallen ze om op 0.143.0, omdat het bestand en het script daar niet bestaan:

```
# Error: ENOENT: no such file or directory, open '.../oud-main/custom_components/domotiapp_lovelace/gegevens/tankstations-nl.json'
ERROR tests/test_tankstations.py - FileNotFoundError: [Errno 2] No such file ...
```

`tests/test_tankstations.py` heeft drie proeven:
- wat het script maakt van een steekproef uit het echte antwoord van Overpass
  (`tests/js/vaste-invoer/overpass-tankstations-steekproef.json`). De privépomp en die op Curaçao vallen af, een `way`
  telt met zijn midden, en een TinQ in Utrecht en een Shell die dag en nacht open is met LPG komen goed door;
- het meegeleverde bestand: meer dan 3500 stations, alle in Europees Nederland, en alleen bekende brandstofletters;
- de integratie biedt het aan zonder inloggen, en `../manifest.json` erachter niet.

`tests/js/brandstof-stations.test.mjs` heeft vier proeven, op het echte bestand:
- een rij wordt een station;
- "arnhem esso" en "esso   ARNHEM" geven dezelfde drie Esso's in Arnhem;
- "s hertogenbosch" vindt 's-Hertogenbosch;
- "tinq" geeft met een huis in Utrecht eerst een TinQ in Utrecht;
- een merk gaat voor een straat met dezelfde naam.

Alles samen: 2606 JS-proeven en 1253 Python-proeven groen, plus `verify`, `check:registratie`, `check:controls`, `check:css`
en `check:taal`. `check:css` ving een kaartvlak in de kaartkleur zonder rand.

## In de browser gemeten

In de testinstance (2026.8, zonder proxy), op `kaart-test/brandstof`, in Playwright op 390 breed (`isMobile` en
`hasTouch`), in donker en licht, met echte tikken en echte toetsen. Bundel geladen `e876efbcab6d`, gelijk aan schijf.

- **Laden:** de stations komen van `/domotiapp_lovelace/gegevens/tankstations-nl.json` (369.546 bytes). De ondergrond komt
  van `tile.openstreetmap.org` (de terugval), en in donker staat het filter erop. De naamsvermelding: "Leaflet |
  © OpenStreetMap".
- **Zoekveld:** 16 px en 40 hoog. Typen met `keyboard.type` gaf "arnhem esso", met de spatie als `isTrusted: true`. Dat gaf
  vier uitkomsten: drie Esso's in Arnhem en de Esso Express in Beek (Arnhemseweg).
- **Tik op de eerste uitkomst** (`click:true`): de kaart ging naar 52,00766, 5,81151 op zoom 15, met eronder "Esso Arnhem
  Slenkweg · Esso · Slenkweg 1, 6816VX Arnhem · Dag en nacht open · Route".
- **Tik op een punt** op het canvas (`click:true` op `canvas.leaflet-interactive`): dat station kwam eronder; in een eerdere
  meting "Q8".
- **Breedte:** niets steekt uit. `scrollWidth` is 348/348 voor de kaart en 390/390 voor de pagina; de kaart is 348 bij 320.
- **Fouten in de console:** geen.

Op **1180 breed** staan twee kaarten naast elkaar, zonder fouten.

**De eerste meting vond een fout:** een tik op een uitkomst kwam aan, maar koos niets. Het lijstje werd leeggemaakt voordat
het station eruit gelezen was. Dat is gerepareerd en opnieuw gemeten.

## Samenvatting

Onder de adviesprijzen staat nu een kaart met alle 4031 tankstations van Nederland:
- een zoekbalk op plaats, merk en straat;
- een tik toont adres, openingstijden en een route.

De stations zijn een momentopname uit OpenStreetMap die met elke uitgave mee kan. Klanten vragen Overpass niets. De kaart
is een eigen Leaflet op de ondergrond van Home Assistant, zodat hij werkt op elke versie.

## Wat niet lukte

- **De tegelproxy van de core is hier niet gemeten.** De testinstance draait 2026.8, en die heeft hem niet. De code volgt
  precies wat de frontend van Home Assistant doet: hetzelfde adres en hetzelfde token in de query. Of de tegels bij een
  klant op 2026.11 via `/api/map_tiles` komen, kijkt de beheersessie na zodra de uitrol hem erop zet.
- **De editor** is niet met tikken gemeten. Het is één schakelaar van Home Assistant.
- **Slepen op een telefoon:** met één vinger verschuift de kaart, net als de kaart van Home Assistant. Wie de pagina wil
  scrollen, doet dat naast de kaart.

## Aannames

- Een momentopname per uitgave is vers genoeg. Tankstations komen en gaan langzaam.
- Google Maps voor "Route" is wat de meeste klanten op hun telefoon hebben. Het is een gewone link, geen logo.

## `git status --porcelain`

(vlak voor het vastleggen)

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/__init__.py
 M custom_components/domotiapp_lovelace/const.py
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M package-lock.json
 M package.json
 M scripts/build.mjs
 M src/cards/brandstof-card.js
 M src/cards/brandstof-logica.js
 M src/i18n/en/brandstof.js
?? custom_components/domotiapp_lovelace/frontend/LICENTIES.md
?? custom_components/domotiapp_lovelace/gegevens/
?? docs/tankstations-kaart/
?? scripts/tankstations.py
?? src/cards/brandstof-kaart.js
?? tests/js/brandstof-stations.test.mjs
?? tests/js/vaste-invoer/overpass-tankstations-steekproef.json
?? tests/test_tankstations.py
```
