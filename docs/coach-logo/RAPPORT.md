# Het logo van COACH op de kaarten (0.126.0)

De eigenaar, 13 november 2026, over het nieuwe logo van COACH (doorgegeven door de werkmap-sessie): *"Dat logo moet op
alles komen te staan."* Het staat opgeschoond in alle maten in de huisstijl van de werkmap. Waar en hoe groot was aan
deze sessie.

## Waar het staat

| Kaart | Waar | Maat |
|---|---|---|
| Coach Assist (botkaart) | het icoon op de tegel, in plaats van de tekstballon | 24 px in de chip van 36 |
| het scherm van Coach Assist | het icoon in de kop, naast "Vraag het Coach Assist" | 28 px in het rondje van 44 |
| laadpaal, thuisbatterij, airco | vóór de zin van de coach (waarom hij laadt, levert of wacht) | 1,15 em, 13,2 px |
| vaatwasser, wasmachine, droger | in de statusregel, alleen als de coach het apparaat volgt | 13,2 px |

De keuzes:
- **Coach Assist is de hulp van COACH.** Daar is het logo het hele icoon. Een eigen icoon in de editor gaat nog steeds
  voor (*Vormregels*: "een zelfgekozen icoon gaat voor").
- **Op de apparaatkaarten blijft het icoon of de foto van het APPARAAT staan.** Dat draagt de toestand (*Vormregels*). Het
  logo staat waar de coach aan het woord is, als afzender van zijn zin. Is er geen zin, dan is er ook geen logo.
- **Klein, op de tekstregel**, zodat geen kaart er hoger van wordt (rasterrijen). Gemeten, zie hieronder.

## Hoe het erin zit

- `icons.coach` in `src/icons.js`: het bestand zelf (`coach-96.png`, 96 bij 96, doorzichtig) als data-URI in een
  `<img>`, net als het logo van DomotiTech. Het is een merk in zijn eigen kleuren, niet nagetekend op onze lijndikte.
- `coachMerk()` en `coachMerkCss` in `src/icons.js`: het merkje voor in een zin, met `role="img"` en
  `aria-label="COACH"` voor een schermlezer. De zin zelf staat sinds deze ronde in `.reden .rt`.
- `coach` staat in de icoonkiezer (groep Overig, te vinden op coach, logo, energie, bliksem). Zo kan het ook op een
  knop in de navigatiebalk.
- `afbeeldingen/coach.png` (256 px) staat op `/domotiapp_lovelace/afbeeldingen/coach.png`, voor een dashboard van een
  beheersessie. Vanaf nu een vaste naam: niet hernoemen.

## Gemeten

Playwright, 390 bij 844, `isMobile`, `hasTouch`, `deviceScaleFactor` 3. Dezelfde views op 0.125.0 (main) en 0.126.0.
Verse code: `?v=8877a50719cc` tegen `035b4a4b64a1` op main, gelijk aan de sha256 op schijf.

| view | kaart | hoogte 0.125.0 → 0.126.0 | zin van de coach | merkje |
|---|---|---|---|---|
| batterij | thuisbatterij (2×) | 568 → 568 | 46,5 → 46,5 | 13,2 × 13,2, zichtbaar |
| batterij | Accu schuur (2×, geen zin) | 120 → 120 | geen | verborgen |
| laadpaal-knoppen | laadpaal | 376 → 376 | 31 → 31 | 13,2 × 13,2, zichtbaar |
| airco | met coach | 568 → 568 | 31 → 31 | 13,2 × 13,2, zichtbaar |
| airco | drie zonder zin | 120, 376, 184 → gelijk | geen | verborgen |
| miele | wasmachine met de coach | 184 → 184 | statusregel 14,4 → 14,4 | 13,2 × 13,2, zichtbaar |
| miele | wasmachine en droger zonder coach | 184 → 184 | | verborgen |
| bot | twee tegels | 56 → 56 | | logo 24 × 24 |

Ook gemeten:
- Het plaatje is overal geladen (`naturalWidth` 96).
- In het scherm van Coach Assist staat het logo op 28 × 28. Het scherm ging open met een echte tik (`isTrusted: true`).
- De pagina is op elke view 390 breed, met `scrollWidth` gelijk aan `clientWidth`.
- Geen paginafouten.

De schermafdrukken zijn bekeken: de tegel, de kop van het scherm, de laadpaal en de wasmachine.

## Proeven

`tests/js/coach-logo.test.mjs` (NIEUW GEDRAG, 6 proeven) toetst:
- het icoon (een PNG van 96 bij 96);
- de icoonkiezer;
- het merkje;
- en, door de bron te lezen, waar het staat op de vijf kaarten.

Tegen de code van main valt hij al bij het laden om:

```
# SyntaxError: The requested module '../../src/icons.js' does not provide an export named 'coachMerk'
not ok 1 - .../tests/js/coach-logo.test.mjs
# pass 0
# fail 1
```

De bewaker van de icoonkiezer ving een naam in hoofdletters ("COACH" onder het icoon, voor hem een vergeten
sleutel). Onder het icoon staat daarom "coach", net als "domotitech".

Alles bij elkaar:
- 2449 JS-proeven en 1153 Python-proeven, groen;
- `verify`, `check:registratie`, `check:controls`, `check:css` en `check:taal`, groen.

## Samenvatting

0.126.0 zet het logo van COACH op de kaarten die over de coach gaan:
- als icoon van Coach Assist, op de tegel en in het scherm;
- als klein merkje vóór wat de coach zegt, op de laadpaal, de batterij, de airco en de apparaten met een programma.

Geen kaart is er hoger van geworden. Het logo is ook te kiezen als icoon, en staat als afbeelding op een vast adres.

## Wat niet lukte

- Niet op een echte iPhone gezien.
- Alleen in het lichte thema gemeten (zo stond de testinstance). Volgens de README van de huisstijl is het logo op wit,
  zwart en donkergrijs nagekeken.
- Het blok COACH in de editor van de vaatwasser heeft nog het blad als icoon. `ha-form` tekent daar een icoon van
  Home Assistant, en een plaatje kan daar niet in.

## Aannames

- Op de apparaatkaarten is het logo een afzender vóór de zin van de coach, geen vervanging van het apparaaticoon.
- 96 px als bron: scherp tot 32 px op een scherm met drie beeldpunten per pixel. De grootste plek is 28 px.
- Versie 0.126.0: iets nieuws op de kaarten.

## git status --porcelain

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/airco-card.js
 M src/cards/batterij-card.js
 M src/cards/bot-card.js
 M src/cards/bot-scherm.js
 M src/cards/dishwasher-card.js
 M src/cards/laadpaal-card.js
 M src/editor/icoon-zoek.js
 M src/i18n/en/gedeeld.js
 M src/icons.js
 M tests/test_afbeeldingen.py
?? custom_components/domotiapp_lovelace/afbeeldingen/coach.png
?? docs/coach-logo/
?? tests/js/coach-logo.test.mjs
```
