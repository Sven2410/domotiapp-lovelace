# 0.114.1: geen "Nog geen favorieten" op de overzichtskaart

De eigenaar, 8 november 2026: "nog geen favorieten maak ze in woninginstellingen die moet ook niet op het overzicht".

## Wat er veranderd is

- De favorietenkaart kent een instelling `verberg_leeg`, alleen voor de overzichtskaart en niet in de editor. Staat die
  aan en zijn er geen favorieten, dan tekent hij niets in plaats van de regel "Nog geen favorieten. Maak ze in de
  woninginstellingen.". Op zichzelf zegt de favorietenkaart het nog wel, zoals de eigenaar op 31 oktober vroeg.
- Zonder favorieten zet de favorietenkaart `leeg` op zichzelf. De overzichtskaart ziet dat met `:has()`, verbergt de
  linkerhelft en zet het overzicht over de hele breedte. Een lege halve kaart was het andere alternatief; dat is
  gewoon een gat.
- Het veld Woninginstellingen (`favorieten_pad`) is uit de editor van de overzichtskaart. Het was alleen de link onder
  die regel. Een config die het nog heeft, doet er niets meer mee en geeft geen fout.

## Gemeten

Testinstance, view `overzicht` op `kaart-test`, Playwright, bundel geladen = op schijf (`1b7429bd67f2`, voor het
ophogen van het versienummer). De favorieten zijn via de websocket verwijderd en daarna weer opgeslagen.

| | kaart | linkerhelft | overzicht | regel "Nog geen" |
|---|---|---|---|---|
| met 2 favorieten, 1180 breed | 860 × 440, op het raster | zichtbaar | x 722, 426 breed | er niet |
| zonder favorieten, 1180 breed | 860 × 440, op het raster | `display: none` | x 288, 860 breed | er niet |
| zonder favorieten, 390 breed | 374 × 440, op het raster | `display: none` | 374 breed | er niet |
| favorieten teruggezet | 860 × 440 | zichtbaar | x 722, 426 breed | er niet |

Geen fouten in de console. Op de code van 0.114.0 staat de regel er zonder favorieten wel: dat is de `.leeg` in
`favorieten-card.js` die toen altijd getekend werd.

JS-tests 2347 groen, Python 1113 groen, `check:taal`, `check:css`, `check:registratie`, `check:controls` en
`verify` groen.

## Samenvatting

Op de overzichtskaart staat zonder favorieten geen uitnodiging meer om ze te maken; het overzicht vult dan de kaart.

## Wat niet lukte

Geen nieuwe unittest: het is een tekenkeuze in een custom element, en jsdom-tests zijn hier niet toegestaan. Het bewijs
is de meting hierboven. Niet op een echte iPad gemeten.

## Aannames

Dat zonder favorieten het overzicht over de hele breedte hoort, en niet een lege linkerhelft. De eigenaar vroeg alleen de
regel weg te halen.

## git status --porcelain

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/favorieten-card.js
 M src/cards/overzicht-card.js
 M src/i18n/en/overzicht.js
?? docs/overzicht-zonder-lege-favorieten/
```
