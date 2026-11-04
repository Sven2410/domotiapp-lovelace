# De klok van Home Assistant, en het weer als de weerintegratie wegvalt (0.105.0)

4 november 2026, tak `fase-154/klok-en-weer-van-ha`. Twee meldingen van de eigenaar over het infoscherm bij een klant, op
dezelfde ochtend:

- "bij [de klant] was de metreo integratie unavible waardoor hij geen weer liet zien op de receptie etc. Kan lovelace de
  gebruike integratie herladen als hij op unabible staat bijvoorbeeld?"
- "en waarom staat [de klant] op 8:30 ipv 9:30?", en daarna: "tijd van HA inderdaad" en "ja bouw alles".

## Wat er bij de klant gebeurde

Alleen gelezen, niets gewijzigd.

- **Het weer.** De weerentiteit is Met.no. Die was op 4 november van 07:51 tot 08:52 `unavailable`. Met.no haalt het
  weer één keer per uur op, en de keer van 07:51 mislukte. Een uur later lukte het vanzelf. Op hetzelfde moment haperden
  ook andere apparaten (de meterkast, de P1-meter), dus waarschijnlijk het netwerk. Het systeemlog van toen is weg door een
  herstart om 09:08.
- **De klok.** Home Assistant staat op `Europe/Amsterdam`. De klok op het scherm las de tijd van de tablet, en die stond
  een uur achter: de tijd van Londen. Waarom de tablet zo staat, is van buitenaf niet te zien.

## Samenvatting

**1. Het infoscherm rekent met de klok van Home Assistant** (`src/wandklok.js`). JavaScript kan de tijdzone van een
pagina niet zetten. Daarom rekent de kaart met een wandtijd: een `Date` waarvan de lokale velden de klok van Home Assistant
zijn. Dat geldt voor alles op het scherm, niet alleen de klok:

- de klok en de datum;
- de openingstijden ("nu geopend");
- mededelingen met een begin en eind;
- verjaardagen en afval ("vandaag", "morgen");
- de agenda en de ruimtes, ook "Nu" bij boeken;
- de uren en dagen van het weer;
- de energiegrafiek (van middernacht tot middernacht) en het energiedashboard;
- de tijd bij een nieuwsbericht.

Op twee plekken wordt omgezet:

- **wat binnenkomt** met een tijdzone (afspraken, voorspellingen, statistieken) gaat naar de wandtijd;
- **wat naar Home Assistant gaat** (de agenda opvragen, de recorder) gaat terug naar het echte tijdstip.

Een boeking ging al als "2026-10-16T14:00" naar de server, en dat is nu ook de tijd van Home Assistant.

**2. Het laatst bekende weer blijft staan** (`infoscherm/weer.py`). De server kijkt elke minuut naar de weerentiteit van
het infoscherm. Bij elke nieuwe stand bewaart hij die met de uur- en dagvoorspelling in een eigen opslag, zodat het ook een
herstart overleeft. Valt de entiteit weg, dan vraagt de kaart het op (`infoscherm/weer`, voor iedere ingelogde gebruiker)
en toont het met "bijgewerkt 12 min geleden".

**3. De weerintegratie herladen, met grenzen:**

- **pas na 10 minuten** `unavailable`;
- **hooguit één keer per uur**;
- **alleen als de integratie geladen is.** Bij `setup_retry` is Home Assistant zelf al bezig.
- **alleen de integratie achter die ene weerentiteit**, nooit iets anders;
- met een waarschuwing in het log.

## Gemeten

**De proeven.**

| | op deze tak | op 0.104.2 |
|---|---|---|
| `tests/infoscherm/test_weer.py`, 8 nieuw | 8 groen | 8 rood |
| `tests/js/wandklok.test.mjs`, 8 nieuw | 8 groen, ook met de machine op UTC, Londen, Amsterdam en Los Angeles | rood: `src/wandklok.js` bestaat niet |
| alles | 1094 Python, 2293 JS, allemaal groen | |

Drie proeven over wanneer er níet herladen wordt, slaagden eerst ook op 0.104.2: die herlaadt nooit. Ze toetsen daarom
daarna ook het geval waarin het wél moet. Eén wandklokproef ging eerst rood op 02:30 op 25 oktober: die kloktijd bestaat
twee keer, omdat de klok dan teruggaat. Terugrekenen geeft er een van de twee, en de proef zegt nu dat.

**In de testinstance**, die net als de klant een echte Met.no-integratie heeft. Gemeten als het iPad-account (een
kioskaccount), met Playwright headless, in een browser op de tijdzone `Europe/London`. De bundel in de pagina
(`9337abd028af`) was gelijk aan die op schijf, en er waren geen fouten in de pagina.

| | |
|---|---|
| het toestel | `Europe/London`, 08:42 |
| Home Assistant | `Europe/Amsterdam`, 09:42 |
| de klok op het scherm | **09:42**, woensdag 4 november |
| de uren in het weerblok | 10:00, 11:00, 12:00, 13:00 |
| het weer | "5° Half bewolkt · 80% vochtig · wind 18 km/h" |
| weerentiteit op `unavailable` (09:42:08) | "5° Half bewolkt · 80% vochtig · wind 18 km/h · **bijgewerkt 2 min geleden**", met de 4 uren |

De opslag stond er binnen een minuut na de start: `weather.forecast_thuis`, 48 uren en 6 dagen.

**Het herladen, in de testinstance zelf.** De weerentiteit bleef `unavailable` vanaf 09:42:08. Daarna:

| Tijd | Wat er gebeurde |
|---|---|
| 09:53:01.044 | log (WARNING): "Het weer van het infoscherm (weather.forecast_thuis) is al 10 minuten niet beschikbaar: integratie Home (met) wordt herladen" |
| 09:53:01.166 | `weather.forecast_thuis` weer `partlycloudy`, 5,3° |

Dat is 10 minuten en 53 seconden: tien minuten, plus de minuut waarin de server kijkt. Verder werd niets herladen.

**CI** viel eerst om op de weerproeven. Een nagebootste integratie heette `met`, en bij het afsluiten van de proef laadt Home
Assistant dan de echte, waarvoor in CI `metno` ontbreekt. Lokaal stond die er toevallig wel. Nu heet hij `nep_weer`.

## Wat niet lukte

- De tablet bij de klant staat nog verkeerd. Het scherm toont na deze uitgave de goede tijd, maar de tablet zelf
  goedzetten is iets bij de klant.
- Of herladen bij de klant had geholpen, is niet te zeggen: als het internet weg was, helpt het niet. Het laatste weer
  blijft in elk geval staan.

## Aannames

- Het beheer (op de pc van de receptie) gebruikt nog de klok van dat toestel. Het meldde de eigenaar niet, en een pc staat
  bijna altijd goed.
- 10 minuten en één keer per uur zijn mijn keuze.

## git status --porcelain

```
(schoon na de commit)
```
