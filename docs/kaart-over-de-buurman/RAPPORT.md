# Een kaart die over zijn buurman heen schildert

25 augustus 2026.

> "de speaker kaart kan een andere kaart laten overlappen fix dat ook"

---

## Wat er aan de hand was

De mediakaart geeft `rows: "auto"` op, en dat is precies om overlopen te
voorkomen (zie de kop van `rasterhoogte.js`). Dat beschermt alleen zolang
niemand er een getal overheen zet — en dat gebeurt vanzelf: **het
formaatgreepje in de kaarteditor schrijft `grid_options: {rows: N}` in de
config**, en die wint van wat de kaart zelf opgeeft.

Home Assistant klemt dat getal tussen `min_rows` en `max_rows` uit
`getGridOptions()`. Onze kaarten gaven daar een **vast** getal op, en meestal
was dat 1. Dus mocht het vak kleiner worden dan de inhoud, en dan schildert de
kaart gewoon door — over de kaart eronder heen.

Op zijn eigen dashboard staat precies dat:

```
views[0].sections[5].cards[7].cards[3]
  type: custom:domotiapp-media-card
  entity: media_player.one_sl_opa_oma_2
  layout: row
  grid_options: { columns: 12, rows: 2 }     <-- twee rijen = 120px
  buren: [..., domotiapp-media-card, mushroom-chips-card]
```

Die kaart heeft een volumeregel en een knoppenregel, dus zijn inhoud is 184px =
**drie** rijen. Het vak was er twee. De 64px die overbleven kwamen op de
chips-kaart eronder terecht — de ronde terugknop in zijn schermafdruk.

## Gemeten, vóór en ná

Nagebouwd in de testinstance met exact diezelfde `grid_options`:

```
VOOR
  mediakaart   vak 208..392  (tekent 184px)
  buurman      vak 336..392
  -> 56px overlap

NA
  opgegeven min_rows   3      (was 1)
  mediakaart   vak 208..392
  buurman      vak 400..456
  -> 8px ertussen, precies de rastertussenruimte
```

Ter controle stond er een tweede mediakaart zonder `grid_options` naast: die
stond vóór en ná op 8px van zijn buurman.

## De oplossing

`gemetenRijen()` in `rasterhoogte.js` rekent de meting die `meetRaster` al
wegschrijft (`--dac-raster`) terug naar een aantal rasterrijen. Elke kaart met
`rows: "auto"` geeft dat getal nu op als `min_rows`:

| Kaart | Was | Nu |
|---|---|---|
| Media (rij) | `min_rows: 1` | gemeten, schatting `getCardSize()` |
| Media (groot) | `min_rows: 6` | gemeten, schatting 6 |
| Verlichting | `min_rows: 1` | gemeten, schatting 1 |
| Weersvoorspelling | `min_rows: 2` | gemeten, schatting 2 |
| Scene | *niet opgegeven* | gemeten, schatting 1 |
| Wekker | *niet opgegeven* | gemeten, schatting 1 |

Het leest de **meting** en niet de eigen hoogte van het vak. Dat verschil is de
kern: de eigen hoogte is al door Home Assistant afgeknepen, en dan zou de
ondergrens de afknijping bevestigen in plaats van corrigeren.

De schatting is er voor de allereerste aanroep, vóór de eerste meting. Home
Assistant vraagt `getGridOptions()` opnieuw bij elke nieuwe `hass` (gemeten op
20 augustus 2026, staat in CLAUDE.md), dus daarna klopt het getal.

Bijkomend effect, en het is een goede: in de kaarteditor kun je een kaart nu
niet meer kleiner slepen dan zijn inhoud. Groter mag nog steeds.

## Tests

```
npm test                   429 tests, 429 pass, 0 fail
npm run check:registratie  OK
npm run check:controls     OK
npm run verify             OK
```

`tests/js/rasterhoogte.test.mjs` uitgebreid met `gemetenRijen()`
(**NIEUW GEDRAG**), inclusief het gemeten geval: 184px hoort 3 rijen te zijn en
niet 2. Faalt op de vorige `main` met
`does not provide an export named 'gemetenRijen'`.

## Wat niet lukte

- Niets. Het geval is nagebouwd, gemeten, opgelost en opnieuw gemeten.

## Aannames

- Zijn `grid_options: {rows: 2}` blijft gewoon in zijn config staan; Home
  Assistant klemt hem nu omhoog. Er wordt niets in zijn dashboard
  weggeschreven — dat mag ook niet.
- `max_rows` blijft ongezet: groter maken dan de inhoud is een keuze, kleiner
  maken is een fout.
