# Acht meldingen van 26 augustus 2026

Acht dingen, in twee berichten, terwijl 0.10.0 nog geen dag oud was. Zeven
ervan zijn feedback op wat er gisteren is uitgebracht; één is een wens die vorige
ronde bewust was uitgesteld en die nu alsnog is gebouwd.

| # | Melding | Wat het geworden is |
|---|---|---|
| 1 | "bij de achtergrond weglaten wil ik wel die lichte rand er om heen" | de vulling gaat weg, de rand blijft |
| 2 | "DE kaart is niet lekker" (vaatwasser) | de keuzelijst krijgt een eigen regel, de knoppen de regel eronder |
| 3 | "gewoon normale nederlandse namen in de vaatwasser kaart select" | `dishcare_dishwasher_program_kurz_60` → **Kort 60 °C** |
| 4 | geen extra navigatieknoppen "die boven de geklikte icon openen" | subknoppen op de navbalk, met een menu boven de knop |
| 5 | "blijft hij gehighlight staan ... bij iedere knop" | elke hover-regel achter `@media (hover: hover)` |
| 6 | navbalk moet dezelfde radius als andere losse kaarten | `--dac-radius-pill` → `--dac-radius` (20px) |
| 7 | de navbalk duwt de separator "Woning" naar beneden | de lege sectie wordt uit het raster gehaald |
| 8 | "Kan je de tablad editor ... Kaarten toevoegen zoals de gewone HA UI editor?" | kiezen uit een lijst, bewerken met `hui-card-element-editor` |
| 9 | rookmelder: alleen iconen, en niet kunnen scrollen | labels eraf, rij breekt af, kaart groeit mee |

---

## Meetopstelling

Home Assistant 2026.8 in de testcontainer op poort 8127, dashboard `kaart-test`,
view `navbalk`. Alles hieronder is met echte kliks en echte toetsaanslagen
gemeten; `isTrusted` staat er telkens bij.

**Bewijs dat er verse code gemeten is** (CLAUDE.md, valkuil 2):

```
op schijf   414109 bytes   sha256 a4dd4832…
in browser  414109 bytes   sha256 a4dd4832…   (fetch met cache: "reload")
```

> **Nieuwe valkuil onderweg.** `fetch(url, {cache: "reload"})` was **niet**
> genoeg. De service worker van Home Assistant zit ervoor en serveerde de bundel
> van gisteren: 393.653 bytes terwijl er 407.177 op schijf stonden, en de
> container leverde diezelfde 407.177 wél uit toen we hem van binnenuit
> opvroegen. Pas na `navigator.serviceWorker.getRegistrations()` →
> `unregister()` plus `caches.delete()` kwam de verse bundel binnen. Dit staat
> nu als valkuil 15 in CLAUDE.md.

---

## 1. Achtergrond weglaten houdt zijn rand

`bare: true` haalde de achtergrond, de rand, de schaduw, de hoeken én de
binnenmarge weg. Wat er dan overblijft is geen doorzichtige kaart maar losse
inhoud zonder vorm. Nu gaan alleen de **vulling** en de **schaduw** weg.

Gemeten aan een vaatwasserkaart met `bare: true` naast een gewone:

| | met `bare` | zonder |
|---|---|---|
| `background-color` | `rgba(0, 0, 0, 0)` | `rgba(255, 255, 255, 0.04)` |
| rand | `1px solid rgba(232, 228, 222, 0.1)` | idem |
| `border-radius` | `20px` | `20px` |
| `box-shadow` | `none` | de kaartschaduw |
| `padding` | `8px 12px` | idem |

Veertien kaarten aangepast, plus de gedeelde uitleg in de editor. De
entiteitenkaart heeft zijn eigen driewegkeuze (`surface`) en houdt "Geen vlak"
als aparte stand; er is een vierde bij gekomen: **"Alleen een rand, geen
vulling"**, zodat die kaart hetzelfde kan als de rest.

## 2 en 3. De vaatwasserkaart

**De indeling.** De keuzelijst en de drie knoppen stonden op één regel. In een
pop-up van 430 pixels breed nam de lijst de ruimte en werden Slim, Start en Stop
zo smal dat hun woorden over elkaar vielen — dat staat op de schermafdruk van de
eigenaar. Het is de val van `flex: 1 1 auto` naast `flex: 1 1 0`: allebei willen
groeien, en wie het eerst komt wint. Nu heeft de keuzelijst een eigen regel en
delen de knoppen de regel eronder in gelijke stukken.

**De namen.** Een `select`-entiteit meldt zijn opties als sleutels. Nu wordt er
in deze volgorde gezocht: de vertaling van Home Assistant zelf
(`hass.formatEntityState(stateObj, optie)`), ons eigen woordenboek, en anders
opschonen. Gemeten met de sleutels van zijn eigen machine in
`input_select.vaatwasser_programma`:

| waarde in de config | label op de kaart |
|---|---|
| `dishcare_dishwasher_program_eco_50` | Eco 50 °C |
| `dishcare_dishwasher_program_kurz_60` | **Kort 60 °C** |
| `dishcare_dishwasher_program_intensiv_70` | Intensief 70 °C |
| `dishcare_dishwasher_program_auto_2` | Automatisch 2 |
| `dishcare_dishwasher_program_pre_rinse` | Voorspoelen |

Let op de vierde: een getal tussen 30 en 95 is een temperatuur, een lager getal
is een variant. `auto_2` is dus niet "Automatisch 2 °C".

**En de waarde blijft de sleutel.** Met een echte klik op de lijst en echte
pijltoetsen erin (`isTrusted: true` op elke aanslag) kwam er één service-aanroep
uit — één abonnement op `call_service`, valkuil 7:

```json
{"domein":"input_select","dienst":"select_option",
 "data":{"entity_id":"input_select.vaatwasser_programma",
         "option":"dishcare_dishwasher_program_kurz_60"}}
```

Label Nederlands, waarde onaangeroerd. Hetzelfde geldt nu voor de keuzelijst op
de entiteitenkaart.

## 4. Subknoppen op de navbalk

Een knop kan nu zelf knoppen dragen (`items:` binnen een `item`). Heeft hij die,
dan klapt hij een menu open **boven zichzelf** in plaats van ergens heen te gaan.
Eén laag diep, maximaal acht per knop.

Gemeten met een echte klik op de knop "Media":

```
klik            isTrusted: true, knop "Media", geraakt element <svg>
menu            open, aria-expanded="true", drie regels
knop            x 1055, breedte 66  → midden 1088
menu            x  994, breedte 190 → midden 1089
verschil        1 px          (gecentreerd boven de knop)
afstand         15 px         (menu-onderkant tot knop-bovenkant)
```

En een echte klik op "Keuken" in dat menu: `isTrusted: true`, het pad werd
`/kaart-test/1` en alle menu's gingen dicht.

Valt een knop met subknoppen zelf achter de meer-knop, dan staan zijn subknoppen
daar ingesprongen onder hem — een menu in een menu is op een telefoon niet te
raken.

**Een val die de test ving en de kaart niet.** `itemsVan` deed
`ruw.map(asItem)`, en `Array.map` geeft de **index** als tweede argument mee.
Dat tweede argument is bij de nieuwe `asItem` net het vlaggetje dat bepaalt of de
subknoppen meekomen. Knop 0 — en alleen knop 0 — verloor daarmee zijn hele menu.

## 5. De highlight die bleef staan

Geen focus, maar `:hover`. Chrome en Safari op een aanraakscherm passen hover
toe op wat je aantikt en laten dat staan tot je ergens anders tikt. Tik je op een
knop die een pop-up opent, dan sluit je die pop-up en licht de knop erachter nog
op — wat leest als "deze staat aan".

Alle 36 hover-regels op kaarten staan nu achter `@media (hover: hover)`. Gemeten
in de **CSSOM van de kaart die op het scherm stond**, niet in de bron:

```
.knop:hover        media: (hover: hover)
.knop:hover .ico   media: (hover: hover)
.regel:hover       media: (hover: hover)
buiten media:      0
```

`scripts/check-css.mjs` bewaakt het en draait mee in CI.

## 6 en 7. De navbalk

**Radius:** `border-radius` van de balk gemeten op `20px`, gelijk aan
`--dac-radius` en dus aan elke andere losse kaart. Was `999px`.

**De separator die naar beneden werd geduwd.** De kaart haalde alleen zijn eigen
`hui-card` uit de rasterstroom. Home Assistant hangt die sinds 2026.8 in een
`div.card.fit-rows`, en dát is het rasteritem — met een vaste hoogte van 56px.
Bovendien blijft de hele `hui-section` zijn plek in het raster van de view
innemen. Nu worden alle drie ingeklapt, en de sectie alleen als de balk er de
enige kaart in is.

Gemeten, drie secties onder elkaar (één kolom), afstand tussen de onderkant van
de eerste en de bovenkant van de laatste:

```
vóór   104 px    (sectie van de navbalk: 56 px hoog, plus twee keer de tussenruimte)
ná      24 px    (alleen de gewone tussenruimte tussen twee secties)
winst   80 px
```

En op een breed scherm: vóór de fix stond de sectie van de navbalk als lege
kolom tussen "Favorieten" en "Woning" (zichtbaar op de schermafdruk, en gemeten
als een `div.section` van 500 × 56 px). Nu meet diezelfde sectie 0 × 0 met
`position: absolute`, en staat "Woning" op x 838 — direct naast "Favorieten" op
x 306, precies één kolombreedte plus tussenruimte (500 + 32) verderop.

## 8. Kaarten toevoegen in de tabbladeneditor

Vorige ronde stond hier: de kaartkiezer van Home Assistant is intern, dus de
inhoud van een tab gaat via de code-editor. Dat is nu anders opgelost, en de
reden staat in de meting:

```
customElements.get("hui-card-element-editor")  ->  wél gedefinieerd
customElements.get("hui-card-picker")          ->  NIET
customElements.get("hui-dialog-create-card")   ->  NIET
```

De **editor** van een kaart is er dus zodra je een kaart bewerkt; de **kiezer**
wordt pas geladen als je in een sectie op "+" drukt. Vandaar de taakverdeling:

- **kiezen** doet een eigen lijst, gevuld uit `window.customCards` (elke custom
  kaart die geïnstalleerd is, de onze vooraan) plus de ingebouwde types van Home
  Assistant. Met een zoekveld.
- **bewerken** doet `hui-card-element-editor` — het echte ding, met de GUI van de
  kaart zelf en de knop naar de code-editor erin.

Alleen het kiezen is dus nagemaakt, en dat is een lijst met namen: geen scherm
dat kan verouderen.

Gemeten in de echte bewerkdialoog:

- `lovelace` komt binnen (`lovelaceDoorgegeven: true`) — daarvoor moet de
  eigenschap wél bestaan, want `hui-element-editor` doet
  `if ("lovelace" in configElement)` en op een kale `HTMLElement` is dat false.
- tab met kaart → `hui-card-element-editor` aanwezig; tab zonder → de knop
  "＋ Kaart toevoegen".
- Zoekveld met **echte toetsaanslagen**: 14 aanslagen, allemaal `isTrusted:
  true`, inclusief de **spatie** (`{key: " ", isTrusted: true, doel: "input"}`);
  veldwaarde werd `domotiapp weer` en de lijst hield één kaart over.
- Klik op die kaart → de tab kreeg
  `{entity: "weather.forecast_thuis", type: "custom:domotiapp-forecast-card"}`
  (uit `getStubConfig`) en daaronder verscheen de echte editor van die kaart.
- **De val die daarbij hoort:** `hui-card-element-editor` vuurt `config-changed`,
  en dat is precies de gebeurtenis waarmee onze editor zijn eigen config aan de
  dialoog doorgeeft. Zonder `stopPropagation()` denkt Home Assistant dat de
  tabbladenkaart zelf een weerkaart geworden is. Gecontroleerd door na te kijken
  wat de dialoog zelf dacht dat de config was: `custom:domotiapp-tabs-card`, met
  de weerkaart netjes in tab 2.
- Opslaan → staat in de dashboardconfig, en de tab "Weer" tekent de weerkaart.

## 9. De rookmelderkaart

Twee dingen: de labels eraf, en niet meer kunnen schuiven. Dat tweede is de
belangrijkste: er zat een schuivende rij in met een vervaging aan de rechterkant,
en dat is de verkeerde afspraak voor een kaart die bij een klant aan de muur
hangt — "klanten weten dan niet of er iets verborgen zit".

De labels ("Rook", "Temperatuur", "Batterij") staan nu in `title` en
`aria-label`, niet op de kaart. Wat overblijft is icoon plus waarde. En de kaart
heeft geen vaste hoogte meer (`rows: "auto"` met een gemeten `min_rows`), dus de
rij mag afbreken en de kaart groeit mee.

Gemeten, dezelfde kaart met vijf sensoren op drie breedtes:

| kaart | breedte | hoogte | uitgekleed | rij past | pil buiten beeld |
|---|---|---|---|---|---|
| breed | 500 px | 94 px | nee | 474 = 474 | 0 |
| half | 246 px | 146 px | ja (beide standen) | 220 = 220 | 0 |
| kwart | 161 px | 146 px | ja (beide standen) | 135 = 135 | 0 |

`scrollWidth == clientWidth` en `scrollHeight == clientHeight` op alle drie: er
valt niets te schuiven en er staat niets buiten beeld. Alle vijf de waarden
staan er in alle drie de gevallen: Geen, Alarm, Normaal, 15,6 °C, 99 %.

`.lb`-elementen in de DOM: **0**. `overflow-x`: `hidden`.

---

## Tests

```
npm test                   526 tests, 526 pass, 0 fail   (was 485)
npm run check:registratie  OK
npm run check:controls     OK
npm run check:css          OK  (36 hover-regels, geen kapot sjabloon)
npm run verify             OK  (0.11.0, 414109 bytes)
```

**NIEUW GEDRAG**, en aantoonbaar falend op de code van vóór deze ronde:

```
$ node --test tests/js/programmanaam.test.mjs tests/js/kaartkiezer.test.mjs
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'src\cards\programmanaam.js'
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'src\editor\kaartkiezer.js'
ℹ pass 0
ℹ fail 2

$ node --test tests/js/navbar-logica.test.mjs        # met de oude navbar-logica
SyntaxError: The requested module '../../src/cards/navbar-logica.js'
             does not provide an export named 'SUB_MAX'
ℹ pass 0
ℹ fail 1
```

Twee bestaande tests in `navbar-logica.test.mjs` zijn aangepast en niet
toegevoegd: ze vergeleken de hele vorm van een knop, en die draagt sinds deze
ronde een (meestal lege) lijst subknoppen mee. Dat is een **bewuste
vormwijziging**, geen test die naar de code toe geschreven is.

## Een nieuwe bewaker: `scripts/check-css.mjs`

Twee dingen, allebei gemeten fouten van vandaag:

1. **`:hover` buiten `@media (hover: hover)`** — melding 5.
2. **Een backtick in een CSS-commentaar.** Alle CSS staat in een
   sjabloonliteral; een backtick in een commentaar sluit die string af. Meestal
   is dat een bouwfout binnen een minuut. Niet altijd: `zie de uitleg bij
   `.surface`` werd `... ` + .surface + ` ...`, en dát is geldige JavaScript. Het
   bouwde, het laadde, en toen viel de héle bundel om op
   `X(...).surface is not a function` — geen enkele kaart geregistreerd, leeg
   dashboard. De bewaker meet niet de backtick maar het gevolg: een sjabloon dat
   MIDDEN in een blokcommentaar ophoudt.

Aangetoond dat hij faalt op de fout en slaagt zonder:

```
$ npm run check:css          # met de backtick terug in scene-card.js
FOUT in de CSS van de kaarten:
  - src/scene/scene-card.js:90 — een sjabloon eindigt midden in een CSS-commentaar
exit=1

$ npm run check:css          # hersteld
OK: 36 hover-regel(s) op kaarten achter @media (hover: hover), en geen sjabloon
    dat midden in een CSS-commentaar ophoudt.
```

Draait mee in CI.

---

## Wat niet lukte

- **Het venster liet zich niet verkleinen.** `resize_window` meldde succes maar
  `window.innerWidth` bleef 1920 (het venster staat gemaximaliseerd). De
  telefoonindeling is daarom nagebootst door het sectieraster op één kolom te
  zetten en de posities uit te lezen; dat is dezelfde rasterstand als op een
  telefoon, maar het is niet zijn toestel.
- **De blijvende hover is niet op een echt aanraakscherm getoond.** Wat er wél
  is: de meting dat elke hover-regel in de geladen opmaak achter
  `(hover: hover)` staat, en dat die query op een aanraakscherm per definitie
  niet matcht. Er is hier geen aanraakscherm.
- **`max_columns` op een view sloopt de view.** Bij het opzetten van de
  meetopstelling bleef de view leeg zodra er `max_columns` in stond, met of
  zonder onze kaarten. Dat is niet verder uitgezocht — het is Home Assistant en
  niet van ons — maar het staat hier omdat het een half uur kostte.
- **Een verweesde resource op de testinstance.** `.ha-dev-config` komt uit
  domotiapp-scene en had nog een resource naar `/domotiapp_scene/...` staan; die
  gaf 503 en brak het laden van de views zodra de service worker weg was. Uit de
  resourcelijst gehaald.

## Aannames

- **Het woordenboek voor programmanamen is Duits én Engels.** BSH (Bosch,
  Siemens, Neff) noemt zijn programma's in het Duits, de rest in het Engels.
  Staat er een woord in dat er niet in staat, dan blijft het staan zoals het is:
  `kurz_60_vario` wordt "Kort 60 °C vario", niet iets verzonnens.
- **Een getal van 30 tot en met 95 in een programmanaam is een temperatuur.**
  Daaronder is het een variant (`auto_1`, `auto_2`).
- **De lijst met ingebouwde kaarttypes in de kiezer is een selectie**, niet alles
  wat Home Assistant heeft. Wat er niet in staat, is bereikbaar via de
  code-editor van diezelfde editor — één klik verder.
- **Een knop met subknoppen navigeert zelf niet.** Twee dingen op één tik (kort
  tikken navigeert, lang tikken opent) is bediening die niemand terugvindt. Dat
  staat ook in de helptekst bij het padveld.

## `git status --porcelain`

```
 M .github/workflows/ci.yml
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M package.json
 M src/alarm/alarm-card.js
 M src/alarm/editor.js
 M src/cards/climate-card.js
 M src/cards/cover-card.js
 M src/cards/dishwasher-card.js
 M src/cards/entities-card.js
 M src/cards/entities-logica.js
 M src/cards/forecast-card.js
 M src/cards/header-card.js
 M src/cards/light-card.js
 M src/cards/media-card.js
 M src/cards/navbar-card.js
 M src/cards/navbar-logica.js
 M src/cards/person-card.js
 M src/cards/smoke-card.js
 M src/cards/tabs-card.js
 M src/cards/waste-card.js
 M src/editor/base.js
 M src/editor/entities-editor.js
 M src/editor/navbar-editor.js
 M src/editor/tabs-editor.js
 M src/media/bronkiezer.js
 M src/media/zoekscherm.js
 M src/scene/scene-card.js
 M src/theme.js
 M src/toggle.js
 M tests/js/navbar-logica.test.mjs
?? docs/feedback-26-augustus/
?? scripts/check-css.mjs
?? src/cards/programmanaam.js
?? src/editor/kaartkiezer.js
?? tests/js/kaartkiezer.test.mjs
?? tests/js/programmanaam.test.mjs
```
