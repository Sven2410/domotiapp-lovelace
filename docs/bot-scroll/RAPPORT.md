# Botkaart: de pagina eronder staat vast (0.124.1)

De eigenaar, 13 november 2026, op zijn iPhone, over de popup van de bot (doorgegeven door de werkmap-sessie):

1. "dat oranje vind ik niet mooi, moet de kleuren zijn van onze huisstijl";
2. "ik kan de achtergrond scrollen als de bot geopend is, dat moet ook niet".

Hij keek naar het paneel van DomotiApp Coach. De werkmap vroeg de kaart (`custom:domotiapp-bot-card`) hetzelfde te
laten doen, zodat kaart en paneel gelijk blijven.

## 1. De kleuren: hoefden in de kaart niet te veranderen

Het oranje zat in het paneel van de coach (`rgba(250,178,25,…)`, de waarschuwingskleur). Daarvoor ligt een werkbon bij de
werkplaats. De kaart gebruikte al het accent van de huisstijl:
- het actieve tabblad;
- de hoofdknoppen Versturen en Nieuw ticket;
- het bericht van de klant;
- de gekozen soort;
- een lopend ticket;
- de stip.

Allemaal `--dac-accent` of `--dac-accent-hi`; geteld in `bot-scherm.js` en `bot-card.js`. De waarschuwingskleur
`--dac-warn` staat er op twee plekken, en daar hoort hij:
- het vak dat zegt dat de coach weg is;
- een fout onder het veld (versturen lukte niet).

Dat is status, en die kleur is daarvoor gereserveerd (*Vormregels*).

## 2. De achtergrond scrolde mee

Het scherm hangt aan `document.body` en is `position: fixed`. Scrol je op een plek die zelf niet scrolt, dan gaat de
beweging naar de pagina. Dat is hetzelfde wat het zoekscherm van de media had, en dezelfde oplossing:
- `zetScrollSlot()` uit `src/scrollslot.js` bij `open()`, één keer;
- loslaten bij `sluit()` en in `disconnectedCallback`;
- `overscroll-behavior: contain` op de ticketlijst, de gesprekken en het formulier voor een nieuw ticket.

Het slot zet de body op `position: fixed`, omdat `overflow: hidden` Safari op iOS niet tegenhoudt. Het onthoudt de
scrollpositie en zet die bij het sluiten terug.

## Gemeten

Playwright, 390 bij 844, `isMobile` en `hasTouch`, op view `thema` van `kaart-test` (5324 hoog). De pagina stond op 900
gescrold. De kaart hing met de hand in de pagina (valkuil 21) in een vast vakje.

Openen ging met een echte tik (`isTrusted: true`), sluiten met een tik op het kruisje. Daarna kwamen vier bewegingen:
- drie veegbewegingen met echte aanraakgebeurtenissen (CDP `Input.dispatchTouchEvent`): omlaag over de kop, omhoog
  over de berichten, en omlaag over de berichten;
- een muiswiel over de donkere laag.

Gemeten is waar de inhoud van de pagina staat (`top` van de view), want onder `position: fixed` is `scrollY` 0.

Verse code: `?v=27f794547bc4` in de pagina, gelijk aan de sha256 op schijf.

| | 0.124.0 (main) | 0.124.1 |
|---|---|---|
| net open | -900 | -900 |
| veeg omlaag over de kop | **-615** | -900 |
| veeg omhoog over de berichten | **-850** | -900 |
| veeg omlaag over de berichten | **-565** | -900 |
| muiswiel over de laag | **-1165** | -900 |
| na sluiten, `scrollY` | 1165 | 900 (terug op de plek) |
| body na sluiten | leeg | leeg (`position` en `top` terug) |
| daarna `scrollTo(0, 400)` | -400 | -400 (de pagina scrolt weer) |

Ook gemeten:
- het vak is 356 breed, met `scrollWidth` gelijk aan `clientWidth`;
- de pagina is 390 breed, met `scrollWidth` gelijk aan `clientWidth`;
- er waren geen paginafouten.

## Proeven

- `tests/js/bot-scroll.test.mjs` (NIEUW GEDRAG, 3 proeven): het scherm zet het slot in `open`, laat het los in `sluit`
  en `disconnectedCallback`, en de drie scrollende delen hebben `overscroll-behavior: contain`. Het leest de bron,
  want een custom element laden we niet buiten een browser. Tegen de code van main:

  ```
  not ok 1 - zet het slot bij openen, één keer
  not ok 2 - laat het los bij sluiten en als het scherm uit de pagina gaat
  not ok 3 - houdt het scrollen in de lijst en de gesprekken
  # pass 0
  # fail 3
  ```

- Het slot zelf staat al getoetst in `scrollslot.test.mjs`.
- Alles: 2436 JS-proeven en 1153 Python-proeven groen. `verify`, `check:registratie`, `check:controls`, `check:css` en
  `check:taal` zijn groen.

## Samenvatting

0.124.1 zet de pagina vast zolang het botscherm open is, en zet hem bij sluiten terug op dezelfde plek. In 0.124.0
schoof de pagina bij elke veegbeweging mee, tot 335 pixels. De kleuren van de kaart waren al die van de huisstijl. Het
oranje zat in het paneel van de coach, en daarvoor ligt een werkbon bij de werkplaats.

## Wat niet lukte

- Niet op een echte iPhone gemeten. Chrome met `isMobile` en aanraakgebeurtenissen is niet Safari. Het slot is wel
  hetzelfde dat het zoekscherm van de media en de camerakaart al gebruiken.
- Niet apart gemeten dat een lang gesprek binnen het scherm nog scrolt. Het gesprek in de testinstance is te kort
  om te scrollen. `overflow-y: auto` is niet veranderd, en `overscroll-behavior: contain` houdt alleen de
  doorgifte tegen.

## Aannames

- Versie 0.124.1: een reparatie, geen nieuwe functie.
- Het paneel van de coach wordt gelijkgetrokken via de werkbon
  (`2026-11-13-thuis-botpopup-huisstijl-en-scrollen.md`); de kaart volgt hier al de tokens die het paneel gaat
  gebruiken.

## git status --porcelain

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/bot-scherm.js
?? docs/bot-scroll/
?? tests/js/bot-scroll.test.mjs
```
