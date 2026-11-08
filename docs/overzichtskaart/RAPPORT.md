# 0.112.0: de overzichtskaart voor een tablet

De eigenaar, 8 november 2026: *"ik ben toch niet tevreden met die header kaart. Ik wil een nieuwe kaart maken. Voor ipad
links komen dan de favorieten en rechts moet een soort info scherm komen met weer en belangrijke dingen kan je dat
maken?"*

## Wat er is

Een nieuwe kaart, **DomotiApp Overzicht** (`custom:domotiapp-overzicht-card`). De headerkaart blijft bestaan; wie hem op
een dashboard heeft, houdt hem.

- **Links: de favorieten.** Dat is de favorietenkaart zelf, als kind in deze kaart. Wat de klant op de
  automatiseringskaart maakt, staat hier precies zo, ook met de link naar de woninginstellingen als er nog niets is.
- **Rechts, in één vlak over de hele hoogte van de kaart:**
  - de begroeting met de voornaam, de datum en de klok, op de tijd van Home Assistant (`src/wandklok.js`), net als het infoscherm;
  - het weer: het icoon, de temperatuur en de toestand, daaronder de hoogste en laagste van vandaag, de
    luchtvochtigheid en de wind; en daaronder de dagen erna, standaard vijf (0 laat de rij weg);
  - de regels die ertoe doen. Een regel staat er alleen als er iets te melden is, in deze volgorde:

| regel | waar hij vandaan komt | instelling |
|---|---|---|
| alarm (rood) | elke rook-, gas-, koolmonoxide-, lek- of hittemelder in huis die afgaat, en een alarm dat afgaat | geen nodig; uit te zetten |
| open (oranje) | wat onder "Let op als dit open staat" staat en open of niet op slot is | deuren, ramen, sloten, de garage |
| agenda | de afspraken van nu tot en met morgen, live (`calendar/event/subscribe`) | agenda's |
| afval | de eerstvolgende ophaaldag tot een week vooruit; oranje als het vandaag of morgen is | dezelfde sensoren als op de afvalkaart |
| batterij (oranje) | een batterij onder 15%; telefoons tellen niet mee | de grens, 0 zet het uit |
| lampen | hoeveel lampen er aan zijn, zonder lichtgroepen | aan of uit |
| thuis | wie er thuis is (voornamen), of "Niemand thuis" | aan of uit, en welke personen |

Van één soort staan er hooguit drie regels; daarna staat er "en n meer". Een tik op een regel met een entiteit (alarm,
open, agenda, afval, batterij) of op het weer opent het venster van Home Assistant.

**Breder dan 600 pixels** staan de twee naast elkaar; smaller (een telefoon) staat het overzicht boven de favorieten.
Dat is een containerquery: de kaart kijkt naar haar eigen breedte (valkuil 46). Hij vraagt de volle breedte van de
sectie (`columns: "full"`); voor een iPad hoort de sectie dus breed te zijn (`column_span`).

## Keuzes die ik zelf maakte

"Belangrijke dingen" was niet nader omschreven. Mijn keuze staat in de tabel hierboven. Wat erbij moet of weg kan, is
één regel in `regels` (`src/cards/overzicht-logica.js`) of een vinkje in de editor.

## Bewijs

### Toetsen

`tests/js/overzicht-logica.test.mjs`, **NIEUW GEDRAG**, 19 toetsen: groet, alarmen (ook verborgen), open en het woord
erbij, lampen zonder groepen, batterijen (de leegste eerst, geen telefoons, 0 is uit), wie er thuis is, afspraken
(van nu tot en met morgen, wanneer), opsomming, "en n meer", en de hele lijst in volgorde. Op de code van vóór deze ronde:

```
# Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../src/cards/overzicht-logica.js' imported from .../tests/js/overzicht-logica.test.mjs
# pass 0
```

Alles: 2343 JS-toetsen en 1107 Python-toetsen groen, `check:taal`, `check:css`, `check:registratie`, `check:controls` en `verify` groen.

### In de testinstance (HA 2026.8.1, Playwright, echte kliks)

View `overzicht` op `kaart-test`. Eerst bewezen dat de verse bundel draait: `?v=` op de pagina gelijk aan de eerste
twaalf tekens van de sha256 op schijf.

Op iPad-breedte (1180 × 820):

```
kaart  x 288  w 860  h 632     (632 + 8 = 640 = 10 × 64: op het raster)
links  x 288  w 426            (de favorieten: "Woning verlaten", "Alles uit")
info   x 722  w 426  h 626
achter x 722  w 426  h 632     (het vlak rechts over de hele hoogte)
weer   7°C, Gedeeltelijk bewolkt, 7° 4° 87% 5 km/h Z; vijf dagen ma t/m vr
regels alarm|bad|Kelder nat|Lekkage
       open|warn|Kitchen Door|niet op slot
       open|warn|Wasmachine Deur|open
       agenda|accent|Verjaardag Mien|vandaag
       agenda|accent|Voetbal Tom|20:00
       agenda|accent|Tandarts Anna|morgen 09:00
       afval|warn|GFT en Papier|morgen
       batterij|warn|Outside Temperature Battery|12%
       lampen|lit|8 lampen aan|
       thuis|accent|Bram en Anna|thuis
```

`lock.front_door` (op slot) en `binary_sensor.slot_voordeur` (dicht) stonden ook onder Let op, en staan er terecht niet.

- **Een tik op een favoriet** (`isTrusted: true`, op de naam): de knop kreeg `data-stand="goed"`; de server voerde hem uit.
- **Een tik op de regel van het slot** (`isTrusted: true`): het venster van "Kitchen Door" ging open.
- **iPad staand (820):** naast elkaar, 756 breed, 632 hoog, op het raster.
- **Telefoon (390):** het overzicht boven (y 80), de favorieten eronder (y 716), 696 hoog, op het raster.
- **Licht thema van Home Assistant:** wit vlak met rand, de kleuren van de regels in de lichte varianten.
- **Geen enkele fout** in de console van de kaart.
- **De editor:** in de pagina gehangen (valkuil 21), het veld "Naam in de begroeting" met de muis aangeklikt en
  "Bram Visser" getypt met echte toetsen. Laatste config `naam: "Bram Visser"`, elf `config-changed`, de spatie met
  `isTrusted: true`. Dertien velden.

## Wat niet lukte of niet gemeten is

- **De editor gaf in die opstelling `Cannot read properties of undefined (reading 'localize')`** van een onderdeel van
  Home Assistant. Dat is de opstelling: de headereditor en de automatiseringseditor geven precies dezelfde fout als je
  ze zo ophangt. De editor is niet in de echte kaarteditor van Home Assistant geopend.
- **Twee fouten onderweg, allebei gevonden met deze meting en gerepareerd:**
  - de favorietenkaart stond eerst als tag in het sjabloon en werd dan niet opgewaardeerd ("setConfig is not a
    function", de hele kaart weg). Nu met `document.createElement`;
  - het vlak rechts stond naast de rij in het vak, en `meetRaster` telde het mee: de kaart groeide bij elke meting een
    rij, tot 1.387.768 pixels. Het staat nu in de rij.
- Niet op een echte iPad bekeken, en niet op de installatie van de eigenaar.

## Aannames

- "Belangrijke dingen" is de lijst hierboven.
- Op een tablet in huis is een voornaam genoeg: "Bram Visser" wordt "Bram", in de begroeting en bij wie er thuis is.
- Een batterij van een telefoon (`mobile_app`) is geen nieuws.

## git status --porcelain

Leeg na de commit.
