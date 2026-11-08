# 0.115.0: op de overzichtskaart staat alleen wat je kiest, en de agenda kijkt verder vooruit

De eigenaar, 8 november 2026: "nu pakt hij alle batterij sensoren ik wil dat je alles moet kiezen in de GUI editor. En
waarom werkt de agenda niet?"

## Waarom de agenda leeg leek

Uitgelezen op zijn eigen installatie (alleen lezen, HA 2026.11.0): de kaart staat met zijn Google-agenda op het
ontwikkeldashboard, en die agenda geeft gewoon afspraken. Alleen keek de kaart tot nu toe naar vandaag en morgen, en
zijn eerstvolgende afspraak staat over ruim vijf weken. Er was dus niets kapot, maar er was ook niets te zien.

## Wat er veranderd is

- **Melders** (`melders`): een lijst in de editor, gefilterd op rook-, gas-, koolmonoxide-, lek- en hittemelders en
  alarmsystemen. Tot nu toe zocht de kaart zelf ALLE melders in huis; nu alleen wat gekozen is. De oude schakelaar
  `alarmen` doet niets meer.
- **Batterijen** (`batterijen`): een lijst in de editor, gefilterd op `device_class: battery`. Tot nu toe zocht de kaart
  zelf alle batterijen (behalve telefoons). De grens blijft (`batterij_grens`, standaard 15%).
- **Agenda: dagen vooruit** (`agenda_dagen`): 1 is alleen vandaag, standaard 7, tot 60. Een afspraak verder dan
  overmorgen staat er met dag en datum: "do 17 dec 18:00".

Let op voor wie de kaart al had: zonder keuze staan er nu geen melders en geen batterijen meer op. Dat is wat er
gevraagd is.

## Gemeten

Unittests: zeven nieuwe tests in `tests/js/overzicht-logica.test.mjs` (**NIEUW GEDRAG**). Tegen de code van 0.114.1
vallen ze alle zeven (na het weghalen van de import van `AGENDA_DAGEN`, die er toen nog niet was):

```
not ok 1 - van de gekozen melders wat afgaat
not ok 2 - niets uit zichzelf: een melder die afgaat maar niet gekozen is, staat er niet
not ok 1 - van de gekozen de leegste eerst, een melder zonder getal vooraan
not ok 2 - niets uit zichzelf: een lege batterij die niet gekozen is, staat er niet
not ok 1 - standaard een week vooruit, op begintijd, een hele dag vooraan
not ok 2 - zoveel dagen als ingesteld: 2 is vandaag en morgen, 60 haalt een afspraak van weken later
not ok 3 - zegt wanneer
```

Testinstance (Playwright, bundel geladen = op schijf). Er stonden een rookmelder die afging, een batterij op 6% en de
demobatterij op 12%, en in de lokale agenda een afspraak over drie weken.

| config | wat er op de kaart stond | hoogte |
|---|---|---|
| oude config (`alarmen: true`), niets gekozen | open (2), agenda vandaag en morgen; geen rookmelder, geen batterij | 440, op het raster |
| melder en batterij gekozen, `agenda_dagen: 30` | Rookmelder zolder (Rook), open (2), agenda (3, ook "zo 29 nov 10:00"), Knop gang batterij 6%; de demobatterij van 12% niet | 568, op het raster |

De editor in de echte bewerkmodus geopend met een klik op de kaart. Velden: Weerentiteit, Dagen vooruit, Naam in de
begroeting, Agenda's, Agenda: dagen vooruit, Let op als dit open staat, Melders, Batterijen, Batterij bijna leeg onder
(%), Achtergrond weglaten. Geen fouten in de console.

JS-tests 2349 groen, alle bewakers groen.

## Samenvatting

Melders en batterijen komen alleen nog uit de editor. De agenda kijkt standaard een week vooruit en is in te stellen tot
60 dagen. De agenda was niet kapot: hij keek alleen niet ver genoeg vooruit.

## Wat niet lukte

Niet op een echte iPad. De kiezers voor melders en batterijen zijn wel getekend, maar er is niet met een echte klik een
melder in gekozen; de keuze is via de config gezet.

## Aannames

"Alles kiezen" geldt ook voor de melders, niet alleen voor de batterijen. Een week is de standaard voor de agenda.

## git status --porcelain

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/overzicht-card.js
 M src/cards/overzicht-logica.js
 M src/i18n/en/overzicht.js
 M tests/js/overzicht-logica.test.mjs
?? docs/overzicht-alles-kiezen/
```
