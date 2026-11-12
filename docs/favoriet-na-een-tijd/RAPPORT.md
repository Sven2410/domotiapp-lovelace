# 0.122.0: een favoriet die na een tijd nog iets doet

De eigenaar, 12 november 2026, via een beheersessie: "ik wil dat als optie hebben na zoveel tijd ook iets aan of uit. Dus
lovelace moet dat bouwen". Het voorbeeld is een knop Slapen:
1. beneden alles uit;
2. de overloop, badkamer en entree aan;
3. tien minuten later die weer uit.

Stap 3 kon een favoriet niet.

## Wat er veranderd is

- **Een favoriet heeft stappen.** De tik zelf is stap 1. Met "Daarna nog iets doen, na een tijd" komt er een stap bij. Een
  stap heeft eigen lampen, rolluiken en speakers, elk op een eigen stand, en een tijd: "Na 10 min". De stapper gaat van
  1 minuut tot 24 uur, in vaste stappen.
- **Een nieuwe stap begint met uit wat de vorige aan zette.** Dat is het gewone geval, en wat anders moet, past de klant
  aan.
- **In het scherm werkt het als de onderdelen van een regel.** Er staat een lijst Stappen, met "Meteen · aan" en "Na 10 min
  · uit". Het vak eronder hoort bij de gekozen stap. De vinkjes horen bij stap 1, en stap 1 kan niet weg.
- **In de lijst van de automatiseringskaart** staat het erbij: "Overloop Spots, Overloop Plafond · na 2 min uit".
- **De server plant de stappen** (`plan_favoriet` in `automatisering/motor.py`). Bij de tik komt elke stap met zijn
  TIJDSTIP in de opslag (`gepland`), en pas daarna wordt er een wekker gezet.
- **Een herstart.** Daarna zet de motor de wekkers terug. Wat er tijdens de herstart had moeten gebeuren, doet hij alsnog,
  met de grenzen van een regel (`doelen_van_stap`):
  - uit en dicht tot een etmaal te laat;
  - aan tot vier uur te laat;
  - muziek alleen binnen vijf minuten.
- **Nog een tik op dezelfde favoriet:** wat hij eerder plande vervalt, en de nieuwe tijden gelden. Een favoriet weghalen
  haalt ook zijn geplande stappen weg.
- **De grens blijft die van de kaart.** De server weigert een lamp in een stap die niet op de kaart staat, en een lamp die
  er later afging wordt niet geschakeld.
- **Het naamveld en de zoekvelden van dit scherm hadden 14px tekst**, en het tijdveld 15px. Daarop zoomt Safari op een
  telefoon in. Met een aanraakscherm zijn ze nu 16px. Dat zat er al voor deze ronde, en kwam bij het meten boven.

## Gemeten

**Tests, NIEUW GEDRAG.**
- `tests/automatisering/test_favoriet_stappen.py`, 14 tests:
  - de stap op tijd;
  - een tweede tik;
  - een herstart halverwege;
  - een herstart over de tijd heen, ook zonder netjes afsluiten;
  - weghalen;
  - een lamp die van de kaart ging;
  - foute invoer;
  - een lamp buiten de kaart;
  - de grenzen van te laat.

  Daarvan is één een REGRESSIEWACHT: zonder stappen wordt er niets gepland. Op 0.121.0 faalt het bestand:
  `ImportError: cannot import name 'doelen_van_stap'`.
- `tests/js/automatisering-stappen.test.mjs`, 11 tests. Op 0.121.0 vallen er 9 om. De 2 die slagen zijn
  REGRESSIEWACHTEN (geen `daarna` zonder stappen, en geen stapnummer bij één stap).

**Testinstance, als telefoon.** 390 breed, met `isMobile` en `hasTouch`. De view was `huis`, met 55 lampen. De geladen
bundel was die op schijf (`b814734ff9d6`).
- **Tikken:** de plus bij Favorieten. Dan in het naamveld "Slapen proef" getypt (de spatie `isTrusted`), en "overloop" in
  het zoekveld. Daarna de twee overlooplampen, "Daarna nog iets doen, na een tijd", en drie keer Eerder.
- **De velden met focus:** naam 16px, zoeken 16px.
- **Het scherm:**
  - Stappen: "Meteen · aan" (zonder prullenbak) en "Na 2 min · uit". Kop "Stap 2", en de stapper "Na 2 min".
  - In stap 2 stond de groep op Uit, zonder vinkjes. Stap 1 had geen stapper, en de groep op 100%.
  - De stapper liep van 44 tot 346, binnen het vak van 16 tot 374, en de knoppen stonden binnen de stapper.
  - Vak en pagina: scrollWidth gelijk aan clientWidth (356/356 en 390/390).
  - Deze randen komen uit de eerste ronde, nog met 14px in de velden. Die velden staan niet in de stapper, en hebben een
    vaste hoogte.
- **Opslaan** gaf op de server `daarna: [{na: 2, lampen: [overloop_spots, overloop_plafond], helderheden: {…: 0}}]`.
- **Een echte herstart halverwege:**
  - 19:53:37: tik op de favoriet op de favorietenkaart. `light.turn_on` op de twee lampen, en ze staan aan.
  - 19:53:50: `pm2 restart ha-lovelace`, een echte herstart van Home Assistant.
  - Daarna stonden de nep-lampen uit, want die onthouden hun stand niet.
  - 19:55:37: `light.turn_off` op de twee lampen. Dat is precies twee minuten na de tik, door de server na de herstart.
- Alle 44 gebeurtenissen waren `isTrusted: true`, waarvan 12 tikken. Er waren geen fouten in de console.
- De proeffavoriet is daarna weggehaald.

Een verse browser wordt door Home Assistant een paar tellen na de eerste lading één keer herladen. Onze eigen verversing
was het niet: die zet een sleutel in sessionStorage, en die bleef leeg. Het meetscript wacht dat af.

JS-tests 2405 groen, Python 1148 groen. Bundel, registratie, controls, css en taal groen.

## Samenvatting

Een favoriet kan na een gekozen tijd nog lampen, rolluiken of speakers aan of uit zetten, in één of meer stappen. De
server bewaart de geplande stap met zijn tijdstip, zodat hij een herstart overleeft. Dat is gemeten met een echte
herstart.

## Wat niet lukte

Niet bij een klant gemeten. De beheersessie zet daar de knoppen om naar favorieten.

## Aannames

- **Stappen tellen vanaf de tik, niet vanaf de vorige stap.** "Na 10 min" en "Na 30 min" zijn 10 en 30 minuten na de tik.
- **De stapper heeft vaste stappen:** 1, 2, 3, 5, 10, 15, 20, 30, 45 minuten, en 1, 1,5, 2, 3, 4, 6, 8, 12 en 24 uur.
  Met de hand een tijd intypen kan niet.
- **Wijzigen tijdens het wachten** verandert een geplande stap niet. Wat bij de tik gepland is, gebeurt zo. Weghalen
  haalt hem wel weg.
- **Op de favorietenkaart is niet te zien** dat er nog een stap komt. Daar is niet om gevraagd.

## git status --porcelain

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/automatisering/const.py
 M custom_components/domotiapp_lovelace/automatisering/motor.py
 M custom_components/domotiapp_lovelace/automatisering/store.py
 M custom_components/domotiapp_lovelace/automatisering/websocket.py
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/automatisering-card.js
 M src/cards/automatisering-logica.js
 M src/cards/automatisering-scherm.js
 M src/i18n/en/automatisering.js
?? docs/favoriet-na-een-tijd/
?? tests/automatisering/test_favoriet_stappen.py
?? tests/js/automatisering-stappen.test.mjs
```
