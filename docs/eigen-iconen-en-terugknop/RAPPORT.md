# Eigen iconen in sjablonen, drie alarmstanden, een tandwiel en een terugknop

**Ronde van 17 september 2026.** Branch `fase-49/eigen-iconen`, uitgave 0.44.0.

## Wat er gevraagd is

Vijf punten, in twee berichten:

| | Wat | Waar het staat |
|---|---|---|
| 1 | *"voor dat icon sjabloon werkt nu alleen met de MDI icons van HA. ik wil daar mijn eigen icons kunnen neerzetten. Moeten we dan iets maken zoals DAI DomotiApp Icons?"* | [Het `dai:`-voorvoegsel](#1-daibulb-naast-mdifire) |
| 2 | *"Ik mis nog eigen icons: Alarm uitgeschakeld, alarm deelinschakeling en alarm ingeschakeld."* | [Drie alarmstanden](#2-drie-alarmstanden) |
| 3 | *"de bovenste titel moet links uitgelijnd worden. Nu is dat rechts uitgelijnd"* | [De uitlijning](#3-de-bovenste-regel-stond-gecentreerd) |
| 4 | *"onze instellingen icon is een zon dat moet een tandwiel zijn"* | [Het tandwiel](#4-cog-was-een-zon) |
| 5 | *"net als de mushroom chips card een terug button die elke keer een stap navigeert naar het home path wat ik kan opgeven in de GUI. Ook daar de mogelijkheid om background weg te halen"* | [De terugknop](#5-de-terugknop) |

Alle vijf gedaan.

---

## 1. `dai:bulb` naast `mdi:fire`

**Het werkte al, maar er was geen manier om dat te weten.** `resolve()` probeerde
altijd eerst de eigen set, dus een sjabloon dat `bulb` teruggaf kreeg onze
tekening. Alleen: op de badge typ je die naam met de hand, en er is geen kiezer
die laat zien welke namen bestaan. De conclusie dat het niet kon was dus
volkomen redelijk.

Zijn eigen voorstel is overgenomen: **DAI, DomotiApp Icons.**

```yaml
icon_template: >
  {% if is_state(entity,'on') %}dai:alarmOn{% else %}dai:alarmOff{% endif %}
```

Twee bibliotheken, twee voorvoegsels, en ze staan naast elkaar:

| Vorm | Wat je krijgt |
|---|---|
| `bulb` | onze tekening (werkte al, blijft werken) |
| `dai:bulb` | hetzelfde, maar expliciet |
| `mdi:fire` | die van Home Assistant, via `<ha-icon>` |

**De volgorde in `resolve()` luistert nauw.** `dai:bulb` bevat een dubbele punt
en zou zonder de nieuwe tak bij `<ha-icon icon="dai:bulb">` belanden — en die
tekent niets, zonder fout en zonder log. Daar staat een test op.

**En de kiezer zegt nu hoe een icoon heet.** Onder elk icoon stond de kale
sleutel; daar staat nu de `dai:`-vorm die je letterlijk kunt overtypen:

```
vaatwasser
DomotiApp-icoon -- dai:dishwasher
```

---

## 2. Drie alarmstanden

`dai:alarmOff`, `dai:alarmPartial`, `dai:alarmOn`.

**Een schild en niet de zwaailamp** die `mdi:alarm-light` tekent. Twee redenen:
een zwaailamp is wat er gebeurt *nadat* het misgaat, terwijl een badge de rest
van de tijd laat zien wat het alarm doet — en we hebben `shield` al, dus de drie
standen lezen als een familie.

Het verschil zit in wat er ín het schild staat, want dat is op 18 pixels het
enige dat nog leesbaar is:

| Icoon | In het schild | Waarvoor |
|---|---|---|
| `dai:alarmOff` | een schuine streep | uitgeschakeld |
| `dai:alarmPartial` | een huisje | deelinschakeling — je bent thuis, alleen de schil staat aan |
| `dai:alarmOn` | een slot | volledig aan |

Te vinden op **deelinschakeling**, **uitgeschakeld**, **ingeschakeld**, en ook op
`armed_away` en `armed_custom_bypass` — de toestanden die je in je sjabloon
uitschrijft, want dat is het woord dat je op dat moment in je hoofd hebt.

---

## 3. De bovenste regel stond gecentreerd

Niet rechts, maar gecentreerd — wat bij een korte bovenregel boven een lange
onderregel hetzelfde oplevert als je meldde.

**De oorzaak:** de badge is een `<button>`, en de useragent-stijl van Chrome
geeft die `text-align: center`. De onderste regel is meestal de breedste en valt
daardoor niet op; de bovenste is kort en schoof naar het midden.

Eén regel CSS: `text-align: left`.

**Waarom het een `<button>` blijft.** Valkuil 43 in CLAUDE.md zegt dat een
klikbare tegel een `<div role="button">` hoort te zijn. Die valkuil gaat over
`-webkit-line-clamp` en hoogte in een button, en dat staat hier niet. Wat een
echte button wél geeft en een div niet, is dat Enter en spatie hem bedienen — en
dat is meer waard dan het vermijden van één CSS-regel.

Gemeten op alle vier de vormen:

| Badge | linkerkant bovenregel | linkerkant onderregel |
|---|---|---|
| Alarm / Volledig aan | 70 | 70 |
| Thuis / Instellingen | 182 | 182 |
| Vaatwasser / Klaar voor gebruik | 303 | 303 |
| Wifi / QR-Codes | 465 | 465 |

---

## 4. `cog` was een zon

Een cirkel met acht **losse straaltjes** eromheen. Dat is een zon — we hebben er
ook een, `sun`, en die zag er bijna hetzelfde uit. Intussen betekent `cog` overal
in het pakket "instellingen": in de navbalk, in het infoschermbeheer, en op elke
badge waar iemand hem kiest. **De zoektermen zeiden zelfs "tandwiel".**

Nu een echt tandwiel: acht tanden, met een tandtop die smaller is dan het dal
zodat de flanken schuin lopen. Dat laatste is wat een tandwiel van een ster
onderscheidt.

---

## 5. De terugknop

Een tweede badge: **DomotiApp Terug** (`custom:domotiapp-terug-badge`).

| Veld | Wat het doet |
|---|---|
| **Waar gaat hij heen** | het vaste pad, bijvoorbeeld `/dashboard/thuis`. Begint het met `#` dan opent hij een pop-up op de huidige view. |
| **Tekst ernaast** | optioneel; leeg is alleen het pijltje |
| **Icoon** | de kiezer, standaard een pijl naar links |
| **Achtergrond weglaten** | vulling, schaduw, rand en binnenmarge |

**Laat je het pad leeg, dan gaat hij één stap terug in de geschiedenis** —
precies wat de `back`-chip van Mushroom doet. Dat is met opzet het gedrag zonder
configuratie: "terug" betekent voor de meeste mensen "waar ik vandaan kwam" en
niet "naar de voorpagina".

### Waarom een eigen badge en geen instelling

Het kon al met de sjabloonbadge: een icoon, geen tekst, en een `tap_action` met
`navigate`. Maar dat zijn vier velden invullen voor een knop die één ding doet,
en drie daarvan gaan over dingen die deze knop niet heeft.

Twee nieuwe iconen erbij die de set miste: `dai:arrowLeft` en `dai:arrowRight`,
plus `dai:chevronLeft`. Een chevron is een aanwijzing ("hier gaat het verder"),
een pijl is een knop — en dat is wat een terugknop is.

---

## Het bewijs uit de browser

### De vier iconenpunten

Alle vier tegelijk gemeten, met echte badges en de echte `hass`:

```
label=Alarm       content=Volledig aan       labelX=70   contentX=70   GELIJK (links)
                  icoon=svg  kleur=rgb(12, 163, 12)      <- dai:alarmOn, groen
label=Thuis       content=Instellingen       labelX=182  contentX=182  GELIJK (links)
                  icoon=svg                              <- het tandwiel
label=Vaatwasser  content=Klaar voor gebruik labelX=303  contentX=303  GELIJK (links)
                  icoon=svg                              <- dai:dishwasher
label=Wifi        content=QR-Codes           labelX=465  contentX=465  GELIJK (links)
                  icoon=ha-icon mdi:wifi                 <- mdi blijft werken
```

`textAlign: left` op alle vier.

### De terugknop, met echte kliks

```
klik 1   isTrusted: true   pad: span > button
         /kaart-test/navbalk  ->  /kaart-test/infoscherm        (vast pad)

klik 2   isTrusted: true   pad: path > svg > span
         /kaart-test/infoscherm  ->  /kaart-test/navbalk        (een stap terug)
```

Geen herlading: `performance` meldt nog steeds de oorspronkelijke navigatie.

### Beide badges in de kiezer

```
domotiapp-template-badge — DomotiApp Badge
domotiapp-terug-badge    — DomotiApp Terug
```

En alle vijf renderen in de echte view, in de kop, op één lijn.

---

## Wat er misging tijdens het meten

### De view bouwde drie keer niet (valkuil 21)

`hui-view` ontbrak, `hui-view-container` had alleen een `hui-view-background`,
en **er stond geen enkele fout in de console** — de bundel meldde netjes
`DOMOTIAPP-LOVELACE 0.44.0`.

De twee toetsen uit CLAUDE.md wezen het meteen uit: het automatisch gegenereerde
dashboard "Thuis" bouwde óók niet, dus het lag aan de frontend in dat tabblad en
niet aan de badge. Service worker en caches gewist, container herstart, vers
tabblad; daarna herstelde het zich vanzelf — zoals de bijstelling bij die valkuil
al zei.

De metingen zijn intussen gedaan met de opstelling die daarvoor bedoeld is: de
badge met de hand in de pagina, met de echte `hass`. Daar kan gewoon in geklikt
worden, en dat is ook gebeurd.

### Geen enkele klik kwam aan (`visibilityState: hidden`)

De hit-test op het klikpunt raakte de badge, maar er kwam niets binnen. Oorzaak:
het tabblad was niet het actieve. Opgelost met de `ZZMCPDOELZZ`-truc uit
CLAUDE.md — titel zetten, `^{TAB}` tot de venstertitel klopt. Drie stappen.

### Valkuil 13 en valkuil 16, allebei opnieuw

Een `\n` in een shell-heredoc werd een echte newline in een JS-string; de test
viel om op *Invalid or unexpected token*. En `npm run build` weigerde meteen op
een backtick in een CSS-commentaar. Allebei gevangen voordat er iets uitging —
de tweede door `check:css`, die daar precies voor is.

---

## Tests

| | Voor | Na |
|---|---|---|
| JS | 1073 | **1091** |
| Python | 668 | 668 (onaangeroerd) |

Eén nieuw bestand, `tests/js/icoon-resolve.test.mjs` (13): NIEUW GEDRAG voor
`dai:` — op de code van ervoor faalt die test, want `dai:bulb` belandde bij
`<ha-icon>`. REGRESSIEWACHT voor de kale naam en voor `mdi:`, plus de toets dat
`cog` geen zon meer is en dat de drie alarmstanden er niet hetzelfde uitzien.

`tests/js/badge-icoon.test.mjs` is uitgebreid met `terugDoel` (5), en
`icoon-zoek.test.mjs` bewaakt zoals altijd dat elk getekend icoon in het raster
staat en zoekwoorden heeft. **Die bewaker sloeg deze ronde aan** toen de drie
alarmiconen wel getekend maar nog niet ingedeeld waren.

## Aannames

Geen aannames gedaan.

## `git status --porcelain`

Zie de PR-beschrijving.
