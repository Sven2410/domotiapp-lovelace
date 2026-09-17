# DomotiApp Badge — een eigen badge met sjablonen

**Ronde van 17 september 2026.** Branch `fase-48/template-badge`.

## Wat er gevraagd is

> "oke dan wil ik een extra kaart hebben die je gaat maken zie de screenshot.
> dat zijn custom mushroom templates badges. Die wil ik zelf als domotiapp card
> hebben ik wil helemaal weg van custom cards van derden puur mijn eigen kaart.
> (…) Het moet een community badge worden waar ik ook de achtergrond helemaal
> weg kan halen en geen omranding etc."

Met acht stuks YAML erbij: alarm, vaatwasser, rookmelders, 3D-printer,
instellingen, verbruik, lampen-aan. Allemaal `custom:mushroom-template-badge`
met een `card_mod`-blok dat de achtergrond weghaalt.

En halverwege deze ronde:

> "zorg wel dat ik de icons kan kiezen uit onze eigen icon bibliotheek"

Dat laatste heeft het ontwerp van de editor veranderd — zie *De icoonkiezer*.

## Het antwoord: ja, en het is er

Er is één nieuwe badge, `custom:domotiapp-template-badge`. Hij staat in de
badgekiezer onder **Community-badges**, naast Mushroom Template en Browser Mod.

**Jouw bestaande YAML werkt letterlijk.** Alleen de regel `type:` verandert, en
het `card_mod`-blok kan weg (daar is nu een vinkje voor). De acht badges van je
kop zijn dus acht keer zoeken-en-vervangen, geen acht keer overtypen.

## Waarom één badge en geen acht

Je acht badges verschillen alleen in welk sjabloon er in `icon` en `content`
staat. Een alarm-badge, een printer-badge en een vaatwasser-badge bouwen zou
drie keer dezelfde badge zijn met drie keer een andere `if`-boom erin — en de
negende die je morgen bedenkt zou er weer niet bij zitten.

## Wat er gemeten is vóór er iets gebouwd werd

Er is geen documentatie gebruikt. Alles hieronder is op de testinstance tegen
**HA 2026.8.1** nagemeten, want een badge is iets anders dan een kaart en dat
verschil valt nergens op als je het verkeerd hebt.

| Wat | Gemeten |
|---|---|
| Het register | `window.customBadges` — bestaat daar al als lege array |
| Het type in de config | `custom:<tag>`, net als bij een kaart |
| Het contract | `setConfig(config)` + een `hass`-setter; identiek aan een kaart |
| Waar HA hem hangt | `hui-badge` → `hui-view-badges` → `hui-view-header` |
| De maten van HA's eigen badge | 36 px hoog, radius 18 px, padding `0 12px`, gap 8 px |

Een badge die per ongeluk in `window.customCards` belandt verschijnt netjes in
de **kaart**kiezer, is daar niet te gebruiken, en ontbreekt in de badgekiezer —
zonder dat er ergens iets roods staat. Vandaar dat dit gemeten is en niet
aangenomen, en vandaar `tests/js/badge-registratie.test.mjs`.

### De sjablonen

`render_template` over de websocket, ook nagemeten:

```
{type: "render_template", template: "...", variables: {...}, report_errors: true}
  ->  {result: "Aan", listeners: {entities: ["light.test_lamp_dim"], all: false, time: false}}
```

Twee dingen daaraan zijn de reden dat dit werkt zoals het werkt:

1. **Home Assistant houdt zelf bij waar een sjabloon van afhangt** en stuurt
   vanzelf een nieuwe waarde. Wij volgen niets en pollen niets. Een badge met
   `{{ now() }}` erin tikt dus ook zonder dat wij een timer zetten.
2. **`variables` werkt.** Daarom is `entity` in je sjablonen beschikbaar en
   hoeft `{% set s = states(entity) %}` niet herschreven te worden.

Met `report_errors: true` komt een kapot sjabloon terug als
`{error: "TemplateSyntaxError: …"}` in plaats van dat het abonnement omvalt. Dat
is met opzet gevraagd: in de editor is elk sjabloon halverwege elke zin
ongeldig.

## De achtergrond weg

Het vinkje **Achtergrond weglaten** staat onderaan de editor, net als bij elke
kaart. Op een badge haalt hij méér weg dan op een kaart: niet alleen de vulling
en de schaduw maar ook **de rand en de binnenmarge**. Een pil zonder vulling met
wél een rand is geen van beide, en met binnenmarge zonder vlak staan twee badges
24 px uit elkaar zonder dat er iets tussen staat.

Gemeten op de testinstance met `bare: true`:
`background-color: rgba(0, 0, 0, 0)`, `border-color: rgba(0, 0, 0, 0)`.

## De icoonkiezer

Eerst stond er één multiline tekstveld voor het icoon — het is immers in de
helft van de gevallen een `{% if %}`-boom. Op jouw verzoek is de **icoonkiezer**
erbij gekomen, met onze eigen set voorop.

Dat zijn nu twee velden, met een duidelijke voorrang:

| Veld | Wat het is |
|---|---|
| **Icoon** | De kiezer: onze eigen set, met het `mdi:`-veld als terugval |
| **Icoon via een sjabloon** | Alleen invullen als het icoon per toestand moet verschillen. Staat hier iets, dan wint dat. |

En er is een derde geval, dat je niets kost: **staat de Jinja gewoon in `icon`
zoals in je bestaande YAML, dan werkt dat ook.** De badge ziet zelf dat het een
sjabloon is. De editor tilt hem bij het openen naar het sjabloonveld zodat de
kiezer bruikbaar blijft; dat gebeurt alleen voor de weergave — een dashboard dat
je alleen openslaat om te kijken verandert niet.

## De kleur

Er staat **geen kleurkiezer** in de editor. Dat is de vormregel van dit pakket
en die blijft staan: kleur is op deze kaarten identiteit, geen keuze.

Wat er wél is, is een tekstveld **Kleur van het icoon** waar een sjabloon in mag.
Dat is iets anders dan een kiezer: een rookmelder die rook ziet hoort rood te
zijn, en alleen het sjabloon weet wanneer dat zo is. Laat je het leeg — en dat
is de bedoeling — dan volgt het icoon vanzelf de toestand: een lamp draagt de
kleur die hij maakt, aan is het accent, uit is gedempt.

**Meld het als je vindt dat dit veld er niet hoort.** Het is één regel om het
weg te halen.

## Wat er misging tijdens het bouwen

Drie dingen, alle drie gevonden door te meten en niet door te kijken.

### 1. "goed" gaf blauw

Het kleurveld heeft een Nederlandse hulptekst, maar `toneValue` in `base.js`
kent alleen de Engelse sleutels (`good`, `warn`, `bad`). Een badge met
`tone: "{% if … %}kritiek{% else %}goed{% endif %}"` kreeg daardoor
`rgb(25, 143, 217)` — het accent — in plaats van groen. **Er stond nergens dat
het misging.**

Opgelost met een vertaaltabel in `badge-logica.js`: de Nederlandse namen die in
de hulptekst staan werken, de Engelse blijven werken, en een `#hex` of een
`var(--…)` gaat ongewijzigd door. `toneValue` zelf is niet aangeraakt — die
namen staan in elke bestaande kaartconfig.

### 2. Een vaatwasser die draait stond gedempt

`isOn()` maakt van een `input_select` op `"Run"` een "uit", want dat is niet
`"on"`. Het icoon stond dus in `rgba(232,228,222,0.38)` terwijl de machine
draaide.

Opgelost met een lijst domeinen waar aan/uit echt iets betekent. Daarbuiten is
neutrale inkt het eerlijke antwoord: de badge weet niet of er iets "aan" is, en
doet dan ook niet alsof.

### 3. Valkuil 16 en valkuil 27, allebei gevangen door een bewaker

`npm run build` weigerde meteen: een backtick in een CSS-commentaar
(`` `bare` ``). Precies waar `check:css` voor is.

En de eerste versie zette `icoonBron` en `kleurnaam` in `template-badge.js`
zelf. Dat bestand importeert `base.js`, waar `class DacCard extends HTMLElement`
op modulescope staat, en een gewone Node-test viel dan om op *HTMLElement is not
defined*. Dat is valkuil 27; de pure logica staat nu in `badges/badge-logica.js`,
zoals bij elke andere kaart.

## Het bewijs uit de browser

Alles hieronder is op de testinstance gemeten, met echte kliks en echte
toetsaanslagen.

### De badges staan er, op één lijn met die van Home Assistant

Zeven badges naast elkaar, waarvan zes van ons en één van HA:

| Badge | Wat er staat | Hoogte | Bovenkant |
|---|---|---|---|
| Vaatwasser | Bezig met afwassen | 36 | 80 |
| Lampen aan | 12 | 36 | 80 |
| Rookmelders | Geen rook | 36 | 80 |
| Thuis (achtergrond uit) | Instellingen | 30 | 80 |
| Lamp | Aan | 36 | 80 |
| Kapot | Sjabloonfout | 36 | 80 |
| **HA's eigen entity-badge** | 100% | **36** | **80** |

Alle zeven op `top = 80`. Dat was de eis achter die 36 px.

### De sjablonen rekenen mee

| Badge | Gemeten |
|---|---|
| Vaatwasser (`input_select` op `Run`) | icoon `rgba(232,228,222,0.62)` — **niet meer gedempt** |
| Rookmelders (`tone: goed`) | icoon `rgb(12, 163, 12)` — **groen** |
| Thuis (`bare: true`) | achtergrond en rand `rgba(0, 0, 0, 0)` |
| Lampen aan | eigen `svg` uit onze set; telt 12 |
| Lamp (Jinja in `icon`) | `ha-icon` met `mdi:lightbulb` |
| Kapot (`{{ boem( }}`) | content "Sjabloonfout", rood, badge staat overeind |

### Een echte klik

Klik op de Lamp-badge, met een capture-luisteraar erop:

```
isTrusted: true   x=1234  y=98   pad: span > span > button

light.test_lamp_dim   voor: on    na: off
badge content         voor: Aan   na: Uit
badge icoon           voor: mdi:lightbulb   na: mdi:lightbulb-off
```

Dat is het hele mechanisme in één meting: echte klik → service → toestand
verandert → Home Assistant rendert het sjabloon opnieuw → badge tekent zich
opnieuw.

### De icoonkiezer, met echte toetsaanslagen

De editor met de hand in de pagina gehangen (valkuil 21), met een config waarin
de Jinja in `icon` staat zoals in jouw YAML:

```
kiezer aanwezig      true
kiezer label         "Icoon"
kiezer waarde        ""              <- de Jinja is naar het sjabloonveld getild
velden               entity, label, content, icon_template, tone,
                     tap_action, hold_action, bare
```

In het zoekveld getypt: **"vaat wasser"** — elf toetsaanslagen, allemaal
`isTrusted: true`, en de spatie ook:

```
spatie  isTrusted: true
```

Daarna "vaatwasser" getypt (1 treffer: `dishwasher`) en erop geklikt:

```
klik            isTrusted: true   pad: svg > button > div > div
kiezer waarde   "dishwasher"
config.icon     "dishwasher"
bijschrift      "vaatwasser — DomotiApp-icoon"
```

### Verse code gemeten

Bundel opnieuw gebouwd, config entry herladen via de REST-API (valkuil 2),
daarna de pagina herladen. De badge verscheen in `window.customBadges`, wat
alleen kan als de nieuwe bundel draait.

## Tests

| | Voor | Na |
|---|---|---|
| JS-tests | 1035 | **1073** |
| Python-tests | 668 | **668** (onaangeroerd) |

Drie nieuwe bestanden, alle **NIEUW GEDRAG** — op de code van vóór deze ronde
falen ze met `ERR_MODULE_NOT_FOUND`:

- `tests/js/sjabloon.test.mjs` (20) — de sjabloonlaag, met een nagebootste
  verbinding. Toetst onder meer dat een set zijn abonnementen **vasthoudt**
  zolang er niets verandert: dat is valkuil 23, en zonder die toets zou de badge
  bij elke toetsaanslag in de editor leeg knipperen.
- `tests/js/badge-registratie.test.mjs` (5) — `customBadges` en niet
  `customCards`.
- `tests/js/badge-icoon.test.mjs` (13) — waar het icoon vandaan komt, welke
  domeinen aan/uit kennen, en wat een kleurnaam betekent.

## Wat er NIET in zit

- **Geen `picture`-veld.** Mushroom heeft er een; hier is er geen entiteit die
  er om vroeg. De CSS staat klaar (een ronde afbeelding van 22 px in de pil), dus
  het is klein werk als je het wilt.
- **Geen eigen zichtbaarheidsregel.** Home Assistant heeft dat zelf op elke
  badge ("Zichtbaarheid"), en dat werkt op deze ook.
- **Geen `badge_icon`** (een stip op de stip). Dat leest niet op 36 px.

## Aannames

Eén, en hij is hierboven al gemeld: het veld **Kleur van het icoon** is er,
terwijl de vormregels zeggen dat er geen kleurkiezer meer is. De redenering
staat bij *De kleur*; het is een tekstveld voor een sjabloon en geen vakje om
uit te prikken. Zeg het als je het er niet in wilt.

Verder geen aannames gedaan.

## `git status --porcelain`

Zie de PR-beschrijving; op het moment van schrijven staat alles op de branch
`fase-48/template-badge` en is de werkmap schoon op dit rapport na.
