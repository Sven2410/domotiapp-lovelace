# DomotiApp HVAC, en de afvalkaart bij een klant

**Datum:** 7 september 2026
**Uitgave:** 0.35.0
**Tak:** `fase-40/hvac-en-afvaldatum`

## Wat er gevraagd is

Twee dingen in één bericht:

1. *"ik wil een kaart voor een airco, warmtepomp, ventilatie etc. Dat is
   allemaal 1 kaart en je kan kiezen wat het is. Hij heet DomotiApp HVAC.
   Zoveel mogelijk opties kunnen kiezen als sensoren etc maak wat logisch is
   per apparaat voor jou."*
2. De afvalkaart bij een klant (niet bij hemzelf): *"horizontaal functie
   aangeklikt op de telefoon laat het niet goed zien, en dat is geweest en
   geen datum snap ik niet want bij de attributen staat gewoon een datum."*
   Met drie schermafdrukken: de brede kaart op de pc, dezelfde op de
   telefoon, en de sensorlijst van Circulus.

## 1. De afvalkaart: drie fouten, twee oorzaken

### "is geweest" en "geen datum" -- één oorzaak

De sensoren van de klant (Afvalbeheer, Circulus) hebben als toestand:

```
sensor.circulus_restafval   Vandaag, 07-09-2026
sensor.circulus_gft         Maandag, 14-09-2026
sensor.circulus_papier      02-10-2026
sensor.circulus_pmd         16-09-2026
```

Bij de eigenaar zelf (Mijnafvalwijzer) staat er alleen `18-08-2026`, en dat
patroon stond in `parseDate` **vooraan verankerd**. Met een dagnaam ervoor sloeg
het niet aan, en dan viel de functie terug op `new Date()`. Bewezen in Node:

```
"Vandaag, 07-09-2026"  ->  Thu Jul 09 2026      (9 juli: Amerikaans gelezen)
"Maandag, 14-09-2026"  ->  Invalid Date         (maand 14 bestaat niet)
```

Negen juli is voorbij, dus "is geweest". Ongeldig is "geen datum". Twee
verschillende fouten op één kaart, met dezelfde oorzaak.

**Fix:** `parseDate` zoekt de datum nu ergens in de tekst (dag-maand-jaar met
`-`, `.` of `/`, of jaar-maand-dag), en `new Date()` krijgt nooit meer een
tekst met zo'n datum erin. De afvalkaart leest bovendien
`Year_month_day_date` uit de attributen als extra terugval -- dat is het veld
waar de eigenaar op wees.

**Test:** `tests/js/afval-datum.test.mjs`, NIEUW GEDRAG. Tegen de oude
`ha.js` (via `git stash`):

```
✔ leest een kale dag-maand-jaar (REGRESSIEWACHT)
✖ leest de Circulus-vorm met een dagnaam ervoor
✖ leest de samenvattende sensoren, met de fractie erachter
✖ laat de Amerikaanse lezing nergens meer toe
✔ leest een jaar-maand-dag met tijd erachter
✔ geeft null voor wat geen datum is
ℹ pass 3   ℹ fail 3
```

Tegen de nieuwe: 6 van 6.

### De brede vorm op de telefoon

De brede vorm stond vast op **één rasterrij** (56px). Op een telefoon is naast
de titel zo'n 220px over, vier bakken van minstens 86px breken dan af naar
twee-bij-twee, en twee rijen bakken zijn 66px: de tekst zat tegen de rand en
tegen elkaar. Dat is de schermafdruk van de telefoon.

**Fix:** de hoogte wordt gemeten, zoals bij de weerkaart (`rows: "auto"`,
`meetRaster`, `volgRaster`, gemeten `min_rows`). Past het op één rij dan
blijft het één rij; breekt het af, dan wordt het 120px. Daarvoor is `.rij` als
tussenlaag toegevoegd, want `inhoudsHoogte` telt kinderen ONDER elkaar op en
`.card` was een rij.

**Gemeten in de testinstance**, echte kaart met echte `hass`, in een `div` van
350px (de telefoonbreedte):

| | |
|---|---|
| bakken | `[119,77] [239,77] [119,114] [239,114]`: twee rijen, twee kolommen |
| `--dac-raster` | `120px` |
| hoogte `.card` | 120 |
| `getGridOptions()` | `{rows: "auto", min_rows: 1}` vóór meting, daarna 2 |

Op 500px breed (de pc): één rij, 56px, `--dac-raster: 56px`.

Het "vandaag" van restafval staat nu vooraan met de ring om zijn stip, GFT op
"ma 14 sep", PMD op "wo 16 sep", papier op "vr 2 okt".

## 2. DomotiApp HVAC

Eén kaart, `custom:domotiapp-hvac-card`, met een veld **Soort apparaat**:

| soort | hoofdentiteit | metingen (tegels) | bediening |
|---|---|---|---|
| Airco | `climate` | binnen, buiten, vochtigheid, vermogen, energie | standen (`hvac_modes`), doeltemperatuur, ventilatorsnelheid (`fan_modes`), storing |
| Warmtepomp | `climate` (optioneel) | aanvoer, retour, buiten, tapwater, COP, vermogen, thermisch vermogen, energie, compressor, debiet, waterdruk | standen, doeltemperatuur, statussensor, storing, bedrijfsmodus (`select`), boost |
| Ventilatie (WTW) | `fan`, `select`, `input_select` of `climate` | CO₂, vochtigheid, VOC, binnen, buiten, toevoer, afvoer, filter, bypass, vermogen | standen (`preset_modes` of vier percentages), statussensor, storing, boost |
| Boiler | `water_heater` of `climate` | watertemperatuur, vermogen, energie | standen (`operation_list`), doeltemperatuur, verwarmt-sensor, storing, bedrijfsmodus, boost |

De editor toont alleen de velden van de gekozen soort, plat, zonder
uitklapblokken. Alles is optioneel; de kaart tekent wat er ingevuld is.

### Hoe hij leest

- **Statusregel** met rangorde: storing (rood) > niet bereikbaar > wat het
  apparaat doet (verwarmt oranje, koelt/ventileert blauw, standby stil) >
  statussensor. "Filter vervangen" hangt er als waarschuwing achter.
- **Tegels** in neutrale inkt; alleen CO₂ (oranje ≥ 1200, rood ≥ 1600 ppm) en
  het filter oordelen. Aantal decimalen per eenheid: 21,4 °C, 640 ppm,
  1.250 W, 4,13 COP.
- **Standen** komen uit de entiteit zelf en worden vertaald (low → Laag,
  fan_only → Ventileren, heat_pump → Warmtepomp, ...). Een ventilator zonder
  presets krijgt Uit / Laag / Midden / Hoog op 0/33/66/100%, afgerond op zijn
  `percentage_step`; de dichtstbijzijnde licht op.
- **Doeltemperatuur** over de volle breedte, halve graad bij een climate en
  hele bij een boiler, verzonden 450 ms na de laatste tik (als op de
  klimaatkaart).
- **Boost**: een `switch` of `input_boolean` wordt een schuifschakelaar, een
  `button`, `input_button` of `script` een drukknop.
- Hoogte gemeten (`rows: "auto"`), tegels drie naast elkaar en twee onder
  340px.

### Logica los van de DOM

`src/cards/hvac-logica.js`, met `tests/js/hvac-logica.test.mjs` (42 tests,
NIEUW GEDRAG: het bestand bestond niet). Eén test is later toegevoegd op een
fout die in de browser boven kwam: de demo-boiler van Home Assistant meldt
`current_temperature: null`, `Number(null)` is 0, en de kaart toonde "0,0 °C".
Tegen de oude functie:

```
✖ leest current_temperature: null NIET als nul graden
ℹ pass 41   ℹ fail 1
```

Daarna 42 van 42.

### Gemeten in de testinstance, met echte kliks

Verse code bewezen: `fetch(url, {cache:"reload"})` na het wissen van de service
worker gaf **659.707 bytes, sha256 `4b813cab…`**, gelijk aan de bundel op
schijf op dat moment. (De uitgave heeft daarna nog een versiebump gehad,
`24b2d28c…`; de bron is verder gelijk.)

Vijf kaarten op de werkbank: de brede afvalkaart, een warmtepomp
(`climate.heatpump` plus acht sensoren), een airco (`climate.hvac`), een
ventilatie (`fan.living_room_fan`, presets `auto/smart/sleep/on`) en een boiler
(`water_heater.demo_water_heater_celsius`). Hoogtes, allemaal op het raster:
56, 312, 312, 312, 184.

Elke klik met de browsertool, gelogd met een capture-listener op `window`
(`composedPath()`) en een `call_service`-abonnement:

| klik op | `isTrusted` | doel in `composedPath()` | service |
|---|---|---|---|
| airco: stand "Verwarmen" | true | `button.seg[heat]` | `climate.set_hvac_mode` heat |
| airco: `+` | true | `button` in `div.set` | `climate.set_temperature` 21.5 (na 450 ms) |
| warmtepomp: boost-schakelaar | true | `button.toggle` | `homeassistant.turn_on` |
| ventilatie: stand "Nacht" | true | `button.seg[sleep]` | `fan.set_preset_mode` sleep |
| ventilatie: knop "Boost" | true | `button.knop` | `input_button.press` |
| boiler: stand "Snel" | true | `button.seg[performance]` | `water_heater.set_operation_mode` performance |

Na de kliks stond de airco op "Verwarmen" met doel 21,5°, de ventilatie op
"Ventileert · Nacht · Filter vervangen" en de boost-schakelaar aan.

### De editor

De editorproef (soort wisselen, een spatie typen in het naamveld) is in dit
rapport **niet** gedaan, zie hieronder.

## Wat niet lukte

- **De editor van de HVAC-kaart is niet met echte toetsaanslagen beproefd.**
  Het MCP-tabblad stond op `visibilityState: hidden`, en in die toestand
  laadt Home Assistant zijn `hui-dialog-edit-card` niet meer -- ook niet via
  `ll-edit-card`. Kliks op de kaart kwamen wél aan (zie de tabel), maar de
  bewerkdialoog kwam niet. Bovendien maakte een `resize_window` naar 430px de
  schermafdrukken kapot (valkuil 40 in CLAUDE.md). De editorlogica zelf is
  dezelfde `DacEditor` als bij de andere twintig kaarten, met een schema dat
  van `soort` afhangt; wat er niet bewezen is, is het wisselen van soort en
  het typen in de browser.
- **Het venster verkleinen om een telefoon na te bootsen werkte niet.** De
  smalle vorm is daarom gemeten door de kaarten met de hand in een `div` van
  350px te hangen -- de echte kaart met de echte `hass`, zonder de view-laag.
- **Het `<select>` voor de ventilatorsnelheid** is een native kiezer en niet
  met de browsertool te bedienen; de service-aanroep ervan is alleen in de
  unittest bewezen.

## Aannames

- De klant draait Afvalbeheer (Circulus). Dat is afgeleid van de sensornamen
  en de vorm "Vandaag, 07-09-2026"; zijn installatie is niet uitgelezen.
- Voor een ventilator zonder `preset_modes` zijn 0/33/66/100% de vier standen.
  Een unit met een andere indeling krijgt de dichtstbijzijnde stap die hij
  meldt.
- Rood en oranje bij CO₂ liggen op 1600 en 1200 ppm; dat zijn de gangbare
  grenzen, geen wens van de eigenaar.

## `git status --porcelain`

Zie het commit; bij het schrijven van dit rapport stonden alleen de bestanden
van deze ronde open.
