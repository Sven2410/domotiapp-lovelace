# Alleen de naam in de zoeklijst van de wekker (0.52.1)

29 september 2026, direct na 0.52.0, met een schermafdruk van de lijst
(Bureaulamp met `light.bureaulamp_sven_switch_0` ernaast):
*"ik wil niet de entiteit naam zien alleen de friendly name snap je (...) zelfde
geld voor de speakers"*.

## Wat er veranderd is

- In de zoeklijst van het wake-up light en de speaker staat alleen nog de
  **naam** (de friendly name). Het entity_id rechts ervan is weg.
- **Zoeken gaat alleen nog op die naam.** Wie het entity_id niet ziet, snapt
  niet waarom "sven" de lamp "Bureaulamp" vindt (omdat die
  `light.bureaulamp_sven_switch_0` heet). Wat je ziet en wat je vindt gaan nu
  gelijk op.
- Heeft een entiteit geen naam, dan staat het entity_id er wél, want een
  regel zonder tekst is niet te kiezen (`naamVan` in `editorlogica.js`).

## Bewijs

**Unittest.** De test die in 0.52.0 eiste dat het entity_id gevonden werd, eist
nu het omgekeerde: "hue_color" vindt niets, "leeslamp" vindt
`light.hue_color_lamp_7`. Op de code van 0.52.0 faalt hij (`+ actual` bevat de
lamp); de andere zes slagen op beide versies en bewaken de rest. Hele suite:
**1248 JS-tests groen**, en alle CI-controles lokaal groen (`verify`,
`check:registratie`, `check:controls`, `check:css`).

**In de testinstance.** Draaiende versie gecontroleerd op de `?v=`
(`c1bacc62016d`, gelijk aan schijf). Met de echte wekkerkaart en 18 gelabelde
lampen:

| | uitkomst |
|---|---|
| lijst openen | "Geen lamp", "Bed Light", "Ceiling Lights", ... en **0** entity_id's in beeld |
| "light" | 7 treffers: alleen de lampen met "Light(s)" in de naam (op entity_id waren het er 18 geweest) |
| "kitchen" | Kitchen Lights |
| echte klik op het veld, "test lamp" getypt (spatie `isTrusted`) | alleen namen in beeld |
| Escape, Escape | eerst de lijst dicht, dan de wekker |

In het toetsenlogboek staan alleen mijn eigen aanslagen.

## Samenvatting

- De zoeklijst in de wekker toont alleen de friendly name, bij lampen en
  speakers.
- Er wordt alleen nog op die naam gezocht.

## Wat niet lukte

- De speakerlijst is opnieuw niet met echte Music Assistant-speakers bekeken
  (die zijn er in de testinstance niet); het is hetzelfde onderdeel als bij de
  lampen.
- Het vorige testtabblad was gesloten; Chrome opende voor het nieuwe een eigen
  venster, en dat stond vooraan.

## Aannames

- Dat zoeken op het entity_id ook weg moest, en niet alleen het tonen ervan.
  Zie de reden hierboven. Wil hij er toch op kunnen zoeken, dan is dat één regel.

## git status --porcelain

Bij het schrijven van dit rapport, vóór de commit:

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/alarm/editor.js
 M src/alarm/editorlogica.js
 M tests/js/alarm/zoeken.test.mjs
?? docs/wekker-alleen-naam/
```
