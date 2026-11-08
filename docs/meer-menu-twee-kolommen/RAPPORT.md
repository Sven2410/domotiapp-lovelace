# 0.115.1: een menu in de navigatiebalk met meer dan 8 knoppen

De wens kwam via de beheersessie van de eigenaar, met zijn eigen woorden. Hij vroeg: "Waar is me wekker gebleven in de
navbar?" En daarna: "Zeg tegen lovelace dat hij daar een fix voor moet maken 2 rijen naast elkaar met een subtile
scheidingslijn".

## Wat er mis was

Onder één knop mochten hooguit 8 subknoppen hangen (`SUB_MAX`). `asItem` kapte de rest af, zonder melding. Bij de
eigenaar stonden er 9 onder Meer, want Nieuws kwam erbij voor de nieuwskaart. Daardoor viel de negende, de Wekker, weg.

## Wat er veranderd is

- Er mogen er nu 16 (`SUB_MAX = 2 * KOLOM_MAX`).
- Tot en met 8 blijft het menu zoals het was: één kolom.
- Vanaf 9 komen er twee kolommen (`kolommenVoor`). De linker wordt eerst gevuld, van boven naar onder. Ertussen staat
  een lijn van 1 pixel in de randkleur van het thema, die meeloopt in licht en donker.
- Het menu wordt nog steeds binnen de balk geklemd (`plaatsMenu_`), nu op zijn bredere maat.

## Gemeten

De test in `tests/js/navbar-logica.test.mjs` is **NIEUW GEDRAG**. Op 0.115.0 faalt hij: `kolommenVoor` bestaat daar niet,
en `asItem` geeft 8 knoppen terug in plaats van 9.

In de testinstance stond een navigatiebalk met Meer en negen subknoppen, met dezelfde namen als bij de eigenaar. Het
menu is geopend met een echte klik (`isTrusted: true`), en de bundel die geladen was, was dezelfde als op schijf.

| venster | menu | links (x) | rechts (x) | rijen | alle negen in beeld |
|---|---|---|---|---|---|
| 1180 | 340 × 220, x 549–889 | 556: DomotiTech t/m Sport | 726: Nieuws t/m Wekker | 5 en 4 | ja |
| 390 | 340 × 220, x 37–377 | 44 | 214 | 5 en 4 | ja |

`display: grid`, en de lijn is de eerste achtergrond van het menu. Geen fouten in de console. JS-tests en alle bewakers
groen.

## Samenvatting

Een knop in de navigatiebalk kan nu 16 subknoppen hebben. Boven de 8 staan ze in twee kolommen met een dunne lijn
ertussen. De Wekker van de eigenaar komt na de update vanzelf terug; de config van de navigatiebalk hoeft niet te
veranderen.

## Wat niet lukte

Niet nagekeken op zijn eigen tablet; dat doet de beheersessie na de update.

## Aannames

"2 rijen naast elkaar" lees ik als twee kolommen naast elkaar, net als de beheersessie. Het menu achter de knop Meer
die de balk zelf maakt (als er te veel knoppen zijn) is niet veranderd: daar staan subknoppen ingesprongen onder hun
kop, en dat breekt als je het in kolommen deelt.

## git status --porcelain

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/navbar-card.js
 M src/cards/navbar-logica.js
 M tests/js/navbar-logica.test.mjs
?? docs/meer-menu-twee-kolommen/
```
