# Rapport — vijf kaarten op de rasterrijen

Branch `fase-20/vaste-rasterrijen`, 20 augustus 2026, avond.

De vorige ronde meldde een bevinding buiten de opdracht: vijf kaarten vielen niet
op het raster van Home Assistant. De lampkaart was 93px, de mediakaart 130px, de
weersvoorspelling 103px — allemaal ergens tussen twee rasterrijen (56, 120, 184)
in, waardoor de kaart eronder op een halve rij begint en een kolom met een
Mushroom-kaart ernaast zichtbaar uit de pas loopt.

Opdracht: die vijf op vaste rasterrijen.

---

## 1. Waarom het niet `rows: <getal>` geworden is

Dat was de voor de hand liggende oplossing en hij is bewust níét gekozen. Twee
metingen wezen een andere kant op.

**Een getal klemt de kaart op zijn vak.** Bij een getal zet
`computeCardGridSize` de hoogte op `rows * 64 - 8` en `fit-rows`. Wordt de inhoud
daarna hoger — een wekker erbij, een foutmelding erbij — dan steekt de kaart
dwars door zijn eigen rand en over de knop eronder heen. Dat staat met zoveel
woorden in `scene-card.js` en `alarm-card.js`; die twee stáán op `"auto"` omdat
het getal daar al eens is geprobeerd en toen 33px uitstak.

**En een kaart kan zijn eigen getal niet corrigeren.** Gemeten met een teller op
`getGridOptions()`:

| Gebeurtenis | Vraagt HA opnieuw? |
|---|---|
| Nieuwe `hass` (toestandswijziging) | **ja** — teller ging 0 → 1 → 2, hoogte 93 → 56 → 93 |
| `ll-rebuild` | nee |
| `card-updated` | nee |
| `iron-resize` | nee |
| venster-resize | nee |

Dus alles wat de hoogte verandert zónder toestandswijziging — een foutmelding,
een icoon dat inlaadt, een naam die bij een smallere kolom over twee regels
breekt — zou een kaart met een vast getal laten uitsteken of een strook leeg
laten.

## 2. Wat het wél geworden is

Alle vijf houden `rows: "auto"`. In plaats daarvan komt hun **inhoud** op de
eerstvolgende rasterhoogte uit: `src/rasterhoogte.js` meet wat de inhoud nodig
heeft en zet `--dac-raster`, en de kaart heeft
`min-height: var(--dac-raster, 56px)`.

Dat werkt omdat Home Assistant een auto-kaart precies de hoogte van zijn inhoud
geeft: een kaart van 120px gevolgd door 8px tussenruimte eindigt exact op de lijn
waar rij 3 begint. Alles lijnt dus uit, en afknijpen kan niet — groeit de inhoud
alsnog voorbij de maat, dan groeit de kaart mee naar de volgende rasterhoogte.

**De maat wordt gemeten, niet uitgerekend.** Een tabel met pixelmaten naast de
CSS loopt uit de pas zodra iemand een `padding` aanpast. `inhoudsHoogte()` telt
de kinderen, de tussenruimte, de binnenmarge en de rand op — nadrukkelijk niet de
hoogte van het vak zelf, want dan zou het opduwen van `min-height` de volgende
meting beïnvloeden en zou de kaart elke ronde een rij groeien.

## 3. Eén bug die de meting boven water haalde

De eerste opzet liet het meten volledig aan een `ResizeObserver` over. Toen bleef
een lampkaart op 120px staan nadat de lamp uitging, terwijl de kleurstrips wel
verdwenen waren.

**Een `ResizeObserver` meldt niets als een kind op `display: none` gaat.** De
strips gingen naar hoogte 0, het vak zelf veranderde niet van hoogte (de
`min-height` hield hem op 120), en er kwam geen enkele melding. Daarom zegt elke
kaart het nu zelf: `meetRaster()` staat aan het eind van `paint()` (of
`updated()` bij de twee lit-kaarten), en de waarnemer is alleen nog het vangnet
voor wat er ná het tekenen binnenkomt.

Een tweede vondst uit dezelfde meting: bij het opbouwen van een view draait
`paint()` vóór de eerste opmaakronde, en dan meet alles nul. Zonder herkansing
bleef een kaart daardoor na het opslaan van een dashboard op 93px staan.
`meetRaster()` probeert het nu tot vier frames later opnieuw.

## 4. Meting op de echte instance

Home Assistant 2026.8 op poort 8127. Verse code bewezen: de bundel achter de
lader gaf 280.796 bytes met sha256 `6be65085…`, gelijk aan `npm run build` op
schijf. Config entry herladen, service worker afgemeld.

**Negentien kaarten, nul naast het raster, nul die uitsteken:**

| Kaart | Vóór | Na |
|---|---|---|
| Verlichting, kleur aan | 93px | **120px** |
| Verlichting, aan/uit | 56px | 56px |
| Mediaspeler, drie regels | 130px | **184px** |
| Mediaspeler, telefoonformaat | 601px | **632px** |
| Weersvoorspelling, geen bron | 103px | **120px** |
| Weersvoorspelling, echte bron | 180px | **184px** |
| Weersvoorspelling, zonder vandaag | 132px | **184px** |
| Scenekaart, foutvorm | 80px | **120px** |
| Scenekaart, lege groep | 120px | 120px |
| Wekkerkaart | 56px | 56px |

De overige negen kaarten stonden al goed en zijn niet veranderd.

**En ze groeien en krimpen nog steeds** — dat was de hele reden dat ze op
`"auto"` stonden. Met echte service-aanroepen:

```
start: lamp 56px, media 184px
lamp aan:      120px
lamp uit:       56px
lamp weer aan: 120px
media uit:      56px
media aan:     184px
```

Steeds een rastermaat, nooit iets ertussenin.

**Overloop gecontroleerd** op alle negentien: `scrollHeight` van het vak is
nergens groter dan de eigen hoogte. Dat is precies de bug waarvoor de twee
lit-kaarten op `"auto"` waren gezet, en die vorm — de scenekaart met een
lichtgroep die niet bestaat — zit in de meting.

## 5. Tests

`tests/js/rasterhoogte.test.mjs`, 7 beweringen over `opRaster()`, met de drie
gemeten hoogtes (93, 103, 130) er letterlijk in. NIEUW GEDRAG: het bestand
bestond niet.

`inhoudsHoogte()` en `volgRaster()` lezen de DOM en staan er bewust níét in — die
horen in de browser gemeten te worden, niet in jsdom. Dat is hierboven gebeurd.

Totaal: **306 JS-tests groen** (was 299).

## 6. Wat niet lukte

**Twee keer ten onrechte een regressie geroepen.** Na een harde herlading is de
view seconden bezig met bouwen; meet je te vroeg, dan vind je nul kaarten en lijkt
alles stuk. Beide keren bleek er niets aan de hand. Staat nu als valkuil in
`CLAUDE.md`.

## 7. Aannames

- **De grote mediakaart (`layout: groot`) is meegegaan**, hoewel zijn hoogte van
  de kolombreedte afhangt (de hoes is vierkant). Hij komt nu op 632px uit in
  plaats van 601. Bij een andere kolombreedte wordt dat een andere rastermaat —
  dat is goed, want de meting loopt mee.
- **De uitlegkaart (`.needs`) doet mee.** Een kaart die nog nergens naar wijst
  hoort de kaart eronder ook niet op een halve rij te laten beginnen.
- Verder geen aannames gedaan.

## 8. `git status --porcelain`

```
(leeg)
```
