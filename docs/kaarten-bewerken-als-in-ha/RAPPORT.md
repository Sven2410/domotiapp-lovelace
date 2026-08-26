# Kaarten in een tabblad bewerken zoals in Home Assistant zelf

> "Nu is het gewoon een kaart toevoegen maar ik wil echt dat drag en drop en
> bewerken zoals in Bubble Card. (…) Check anders de hele github van Bubble Card
> hoe hij dit heeft gedaan bijvoorbeeld."

Gedaan. Wat hier staat is niet zijn code maar zijn vondst — en die vondst is de
moeite waard, want hij haalt het hele bewerkgereedschap van Home Assistant naar
binnen zonder er iets van na te maken.

| Wat er nu kan | Waar het vandaan komt |
|---|---|
| Kaarten slepen om ze te herschikken | `ha-sortable` van Home Assistant |
| Potlood en driepuntsmenu op elke kaart | `hui-card-edit-mode` van Home Assistant |
| Bewerken, Dupliceren, Kopiëren, Knippen, Verwijderen | hetzelfde menu als op een dashboard |
| "Kaart toevoegen" opent **Toevoegen aan dashboard** | `hui-dialog-create-card`, met Per entiteit én Per kaart |

---

## Wat er in de bron van Bubble Card staat, en wat wij ervan gebruiken

Gelezen in `Clooos/Bubble-Card`, `src/cards/pop-up/cards/editor/`. Twee trucs,
allebei nagemeten in onze eigen instance voordat er iets gebouwd is.

**Truc 1 — de overlay is een bestaand element.** `hui-card-edit-mode` is wat
Home Assistant om elke kaart hangt zodra je een dashboard bewerkt. Het heeft
alleen `hass`, een `lovelace` met `editMode: true` en een `path` nodig, en die
lovelace mag nep zijn. Wat het menu doet meldt het met gebeurtenissen die omhoog
borrelen: `ll-edit-card`, `ll-duplicate-card`, `ll-delete-card`,
`ll-copy-card`, `ll-change-grid-options`, `ll-move-to-section`. Slepen doet
`ha-sortable` eromheen.

**Truc 2 — de kaartkiezer is niet aan te roepen, maar wel uit te lokken.**
`hui-dialog-create-card` is intern; er is geen functie voor. Maar hij wordt
geopend door een gebeurtenis die een SECTIE afvuurt. Dus: maak een `hui-section`
die nergens staat (`display: none`), geef hem een nepdashboard met alleen onze
kaarten erin, en vuur `ll-create-card` af vanuit zijn layout-element.

Gemeten dat dat alle drie de elementen beschikbaar zijn zodra je een dashboard
bewerkt — en dat is precies wanneer deze editor open kan staan:

```
hui-section          gedefinieerd
hui-card-edit-mode   gedefinieerd
ha-sortable          gedefinieerd
hui-dialog-create-card   NIET   (die wordt door truc 2 alsnog geladen)
```

## De val die dit duur maakt, en die gemeten is

Kies je in die dialoog een KAARTSOORT, dan opent Home Assistant daarna zijn
eigen `hui-dialog-edit-card` voor de nieuwe kaart. Dat is exact dezelfde dialoog
waar ONZE editor in staat, en Home Assistant hergebruikt het element.

Gemeten, met onze editor open en de kiezer erbovenop:

```
na het openen van de kiezer      onze dialoog: aanwezig, onze editor: aanwezig
na het kiezen van een kaartsoort onze dialoog: aanwezig, onze editor: WEG
```

De halve config van de tabbladenkaart lag daarmee op straat. Bubble Card lost
dat op door zijn eigen dialoog opnieuw te openen met de oude parameters; wij
doen het een slag eenvoudiger:

- het `show-dialog`-signaal voor `hui-dialog-edit-card` wordt **onderschept**
  (`stopImmediatePropagation`), en de kaartconfig die erin zit wordt eruit
  gehaald;
- de kiezer wordt daarna zelf gesloten. Dat moet: hij sluit normaal zodra hij de
  kaart doorgeeft, en dat doorgeven hebben we net tegengehouden. **Gemeten**:
  zonder dat bleef "Toevoegen aan dashboard" open en gebeurde er niets meer;
- de kaart komt in de lijst, en bewerken doe je een regel lager in de editor die
  er toch al stond.

Eén dialoog dus, en geen verdwenen config.

## De metingen

Alles hieronder met echte kliks in een echte bewerkdialoog, bundel `179e89f6ab38`
(gelijk aan de hash op schijf; service worker en caches gewist, valkuil 15).

**De lijst staat er, met echte kaarten erin.** Niet een naam en een type, maar de
kaart zoals hij eruit gaat zien:

```
kaarten in de lijst: domotiapp-entities-card, hui-tile-card, domotiapp-forecast-card
hui-card-edit-mode:  3
ha-sortable:         2   (één per tabblad)
```

**Het menu is dat van Home Assistant.** Een echte klik op de drie puntjes gaf
Bewerken / Dupliceren / Kopiëren / Knippen / Verwijderen — precies de
schermafdruk die de eigenaar meestuurde.

**Dupliceren, met een echte klik op dat menu:**

```
voor  [entities-card, tile, forecast]
na    [entities-card, entities-card, tile, forecast]
onze editor nog in de DOM: ja
```

**Kaart toevoegen, met echte kliks door de hele keten** — onze knop → "Toevoegen
aan dashboard" → "Door alle kaarten bladeren" → "Activiteit":

```
kiezer nog open:            nee   (zelf gesloten, zie hierboven)
onze editor nog in de DOM:  ja
kaarten na:                 entities-card, tile, logbook, forecast
bewerkvakken open:          1     (de nieuwe kaart, meteen invulbaar)
config van de dialoog:      nog steeds custom:domotiapp-tabs-card
```

Die laatste regel blijft het bewijs dat de onderschepping klopt.

**Opslaan** legde het vast in het dashboard, en op de view staan de kaarten in
de tab onder elkaar.

## Wat niet lukte

**De sleepbeweging is niet met een echte muisbeweging aangetoond.** Twee pogingen
met `left_click_drag` (66px en 221px) veranderden niets: Sortable start niet op
een synthetische muisbeweging, die heeft een echte reeks bewegingen nodig. Wat er
wél gemeten is:

- `ha-sortable` staat er, met `draggableSelector` op de kaartvakken, en dat is
  hetzelfde element dat een sectie van Home Assistant zelf gebruikt om kaarten te
  laten slepen;
- de HANDLER klopt. Met een `item-moved` van index 0 naar 2:

```
voor  [entities-card, tile, logbook, forecast]
na    [tile, logbook, entities-card, forecast]
config: [tile, logbook, custom:domotiapp-entities-card]
```

Dat is expliciet een synthetische gebeurtenis, en dus **bewijs van de handler en
niet van de bediening** (CLAUDE.md). Het slepen zelf moet de eigenaar bevestigen.

## Tests

```
npm test                   546 tests, 546 pass, 0 fail   (was 528)
npm run check:registratie  OK
npm run check:controls     OK
npm run check:css          OK
npm run verify             OK   (0.13.0, 426031 bytes)
```

Het indexrekenwerk staat in `pasToe()` — zonder DOM, met achttien tests eronder.
Dat is met opzet uit de editor getrokken: verplaatsen naar een plek die er niet
is, de laatste kaart dupliceren, een menu dat een pad meestuurt van een kaart die
er niet meer is. Geen van die gevallen zie je in een browser vóórdat hij misgaat.

Eén test verdient een aparte vermelding: **dupliceren maakt een echte kopie en
geen tweede verwijzing.** Home Assistant bevriest wat er langskomt; twee
verwijzingen naar één bevroren config betekent dat de tweede kaart nooit meer
los aan te passen is — en dat merk je pas als je hem probeert te bewerken.

**NIEUW GEDRAG**, aantoonbaar falend op de code van vóór deze ronde:

```
$ node --test tests/js/kaartenlijst.test.mjs
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'src\editor\kaartenlijst.js'
ℹ pass 0
```

## Aannames

- **Bewerken opent geen tweede dialoog maar een blok in dezelfde editor.** Bubble
  Card hangt daar zijn eigen dialoog voor terug; dat is een flinke machinerie om
  precies één ding te winnen (een dialoog in plaats van een blok), en het risico
  is de config die je aan het bewerken bent. Eén kaart tegelijk open, met een
  "Klaar"-knop.
- **Kopiëren schrijft naar `sessionStorage.dashboardCardClipboard`**, de sleutel
  die Home Assistant zelf bij plakken leest. Knippen is bij Home Assistant
  kopiëren én verwijderen, en die twee gebeurtenissen komen allebei langs.
- **"Verplaatsen naar een andere sectie" doet niets.** Er ís geen andere sectie
  in een tabblad. De gebeurtenis wordt wel gestopt, anders gaat Home Assistant
  het dashboard eronder verbouwen.
- **Zonder het gereedschap van Home Assistant valt de editor terug** op de lijst
  van de vorige ronde (uitklapblokken en een eigen kaartkiezer). Dat gebeurt als
  deze editor ergens draait waar de bewerkmodus nooit aan heeft gestaan.

## `git status --porcelain`

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/editor/tabs-editor.js
?? docs/kaarten-bewerken-als-in-ha/
?? src/editor/kaartenlijst.js
?? tests/js/kaartenlijst.test.mjs
```
