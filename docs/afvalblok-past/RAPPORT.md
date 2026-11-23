# Het afvalblok past in zijn vak — 0.136.1

## Waarom

De eigenaar stuurde een schermafdruk van een infoscherm met de afvalagenda van 0.136.0: "ziet er niet helemaal goed uit".
Het afvalblok stond daar één rij hoog (2×1). Onder het vlak met de eerstvolgende ophaling stond de volgende bak half
onder de rand. De titel "Afvalkalender" was afgekapt tot "Afvalkale…".

De oorzaak: elk blok met een lijst gaat door `pasBij_`, die de rijen die niet passen verbergt en in de kop "nog n"
zet. De lijst van het afvalblok (`.af-lijst`) stond niet tussen die lijsten. Met vier sensoren in een blok van 2×2
viel dat nooit op; met een kleiner blok wel.

## Wat er veranderd is

| Waar | Wat |
|---|---|
| `pasBij_` in `infoscherm-card.js` | `.af-lijst` doet mee. Het vlak met de eerstvolgende blijft altijd staan; een rij eronder alleen als hij er heel in past. Wat wegvalt, telt mee in "nog n" in de kop |
| `BLOK_INFO` in `infoscherm-logica.js` | de titel van het blok is "Afval" in plaats van "Afvalkalender", net als de pagina. Naast de knop Kalender paste het lange woord niet in een blok van twee kolommen |

## Proeven

Dit is opmaak, en die wordt in de browser gemeten, niet met jsdom (zie CLAUDE.md). Er is dus geen nieuwe unittest. Alle
bestaande zijn groen: 2542 JS-proeven en 1192 Python-proeven, plus `verify`, `check:registratie`, `check:controls`,
`check:css` en `check:taal`.

## Gemeten in de testinstance

Opzet: `installatie.afval = ["calendar.afval"]` (de agenda met ophalingen uit 0.136.0), en een afvalblok van 2×1 op de
plek van het wifiblok. Playwright headless, met `isMobile` en `hasTouch`. Daarna zijn de installatie en de indeling
teruggezet.

**Oude bundel** (main, `bddd7e2b8fd8` geladen = schijf), 1180 × 820:

| | |
|---|---|
| blok | 282 × 113 |
| binnenkant van het blok tot | 674,4 |
| PMD | onderkant 696,3, steekt uit |
| GFT | 722,2, steekt uit |
| Textiel | 748,1, steekt uit |

**Nieuwe bundel** (`edc20f4dfff0` geladen = schijf, daarna `eb2275713a0b` met het versienummer):

| Venster | Blok | Kop | Rijen | Pagina |
|---|---|---|---|---|
| 1180 × 820, blok 2×1 | 282 × 113 | "Afval · nog 3 · Kalender" | alle drie verborgen, niets steekt uit | 1180 / 1180 |
| 1024 × 768, blok 2×1 | 235 × 107 | "Afval · nog 3" (de knoptekst valt weg onder 250 px, zoals altijd) | idem | 1024 / 1024 |
| 1180 × 820, blok 2×2 | 282 × 236 | "Afval · Kalender" | alle drie zichtbaar, laatste onderkant 774,4 binnen 792,7 | 1180 / 1180 |
| 390 × 844, blok 2×1 | 118 × 125 | "Afval · Kalender" | alle drie zichtbaar, laatste onderkant 691,8 binnen 703,8 | 390 / 390 |

De titel is in alle vier niet afgekapt (`scrollWidth` = `clientWidth`). Geen fouten op de pagina.

## De kleur

Het vlak van de eerstvolgende had op de schermafdruk een blauwe rand, terwijl het accent van dat scherm rood is. Dat
is de bedoeling van de code van nu: op de afvalkalender is de kleur de bák (papier blauw, GFT groen, PMD oranje,
restafval grijs), op het infoscherm net als op de afvalkaart. Dat staat in de kop van de CSS van `.af` en bij
`afvalKleur_`. Deze ronde verandert dat niet. Of dat zo moet blijven, ligt bij de eigenaar.

## Samenvatting

Het afvalblok laat geen bak meer half onder de rand staan. Wat niet past, valt weg en staat als "nog n" in de kop, net
als bij de andere blokken. De titel is "Afval" en past naast de knop.

## Wat niet lukte

- Niet gemeten op het echte scherm van de klant. Daar komt het met de uitrol.

## Aannames

- "Afval" als titel van het blok is goed; de pagina heette al zo. Ook de kaartkiezer in het beheer toont nu "Afval".

## `git status --porcelain`

(vlak voor het vastleggen)

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/infoscherm-card.js
 M src/cards/infoscherm-logica.js
?? docs/afvalblok-past/
```
