# Navbalk, zoeken in de iconen, en de achtergrond overal uit

25 augustus 2026. Vier dingen die de eigenaar deze ronde vroeg, in de volgorde
waarin ze binnenkwamen.

---

## 1. De navbalk

Een vaste navigatiebalk onderaan het scherm, in de vormtaal van de familie, met
een meer-menu rechts voor wat er in de breedte niet bij past.

**Wat hij koos** (vier vragen, expliciet beantwoord op 25 augustus):

| Vraag | Keuze |
|---|---|
| Positie | Altijd onderaan, telefoon én desktop |
| Breedte op de desktop | Gecentreerde pil |
| Meer-menu | Verticale lijst boven de meer-knop |
| Wat een knop kan | **Alleen navigeren** — naam, icoon, pad |

Er zit dus bewust géén badge, géén actie bij vasthouden, en géén knop die
oplicht omdat je op die pagina staat. Alle drie zijn los toe te voegen.

### Waarom deze kaart anders in het rooster staat

Elke andere kaart valt op een rasterrij en scrollt mee. Deze staat vast. Dat
botst met het sections-raster: de kaart krijgt daar een vak, en dat vak zou als
gat achterblijven terwijl de balk er zwevend overheen staat.

Opgelost door het eigen `hui-card` uit de rasterstroom te halen
(`position: absolute`, nul bij nul). **Niet** met `display: none`: een verborgen
voorouder verbergt ook wat vast gepositioneerd is, en dan is de balk weg. In de
bewerkmodus en in het voorbeeld van de kaarteditor gebeurt dit niet — daar moet
je de kaart kunnen aanklikken en slepen, en tekent hij zich als een gewone kaart
in zijn vak.

De view krijgt onderaan ruimte bij ter hoogte van de balk plus 32px, anders ligt
de balk over de laatste kaart.

### Twee dingen die pas uit een echte klik bleken

1. **`pointer-events: none` op het vak maakte de hele balk onklikbaar.** Dat
   stond er om te voorkomen dat een leeg vak klikken zou afvangen. Maar
   `pointer-events` erft door, en de balk is een afstammeling van dat vak ook al
   staat hij ergens anders op het scherm. Gevonden met een hit-test op het
   klikpunt: die kwam uit op `hui-sections-view` in plaats van op de knop. Een
   vak van nul bij nul vangt uit zichzelf niets af, dus de regel is weg.

2. **`.chip` is een gedeelde klasse in `theme.js`** die een gevulde cirkel met
   een rand in de accentkleur tekent. De balk gebruikte diezelfde naam voor het
   omhulsel van zijn icoon, en kreeg daarmee vier accentringen naast elkaar —
   wat leest als vier knoppen die aanstaan. De eigenaar zag het meteen op een
   schermafdruk ("die mogen weg! Alleen de icons"). Hernoemd naar `.ico`.

### Gemeten in Home Assistant 2026.8 op poort 8127

Verse code eerst bewezen: `fetch(url, {cache:"reload"})` in de pagina gaf
354.561 bytes en sha256 `d526895d…`, gelijk aan het bestand op schijf
(`gelijkAanSchijf: true`).

```
vak (hui-card)   position: absolute, 0 x 0        -> geen gat in het raster
balk             282 x 64, 16px boven de onderrand
balkmidden       607   inhoudsmidden 607          -> scheef: 0
knopmiddens      858 / 926 / 994 / 1062           -> stappen 68 / 68 / 68
menu             190 x 178, 9px boven de balk
menu rechts      1px verschil met de meer-knop
menuregels y     596 / 638 / 679 / 721            -> 40px hoog, 2px ertussen
```

Het scheefstaan is een **correctie uit deze ronde**. Eerst stond de pil op het
midden van het VENSTER (960 van 1920) terwijl de inhoud op 1088 gecentreerd
stond: 128px mis, omdat de zijbalk van Home Assistant niet bij de pagina hoort.
De kaart meet nu het midden van de view en houdt dat bij met een
`ResizeObserver`, want de zijbalk klapt in en uit.

### Echte kliks

| Wat | `isTrusted` |
|---|---|
| Meer-knop -> menu open (`aria-expanded="true"`) | **true** |
| Regel "Tuin" -> menu dicht, `location-changed` gevuurd | **true** |
| Meer-knop opnieuw, daarna ernaast klikken -> menu dicht | **true** |

Het `location-changed`-event zelf staat op `isTrusted: false`, en dat hoort:
dat is het synthetische event dat de kaart afvuurt, precies zoals Home Assistant
zijn eigen navigatie doet.

### Niet gemeten

**De telefoonbreedte (< 620px) is niet in een browser opgemeten.** Onder die
grens gaat de balk van `left: 8px; right: 8px` in plaats van gecentreerd, en dat
is gewone CSS die hier niet is aangetoond. Het venster verkleinen kon niet: de
eigenaar zat op datzelfde moment in dat Chrome-venster te werken, en een meting
in een iframe van 430px liep vast omdat een verborgen tabblad geen
`requestAnimationFrame` krijgt en de view daar dus nooit opbouwde. Dit staat nog
open.

---

## 2. Zoeken in de iconenset

De kiezer toonde ruim honderd iconen in elf groepen en verder niets. Dat werkt
zolang je weet in welke groep iets zit. Erger: de sleutels zijn Engels
(`bulb`, `shutter`, `bin`) en de kaarten Nederlands, dus het woord dat je intypt
is precies het woord dat er niet staat.

Er staat nu een zoekveld bovenaan de kiezer, en onder elk icoon zijn Nederlandse
naam. Waar een icoon op te vinden is staat in `src/editor/icoon-zoek.js` —
zonder DOM, zodat het in een gewone Node-test past.

- Elk woord in de zoekopdracht moet raak zijn: "slaapkamer kast" geeft de
  kledingkast en niet het bed.
- Drie treden: precies gelijk > begint ermee > zit erin. Een term die vooraan in
  de lijst staat weegt zwaarder dan een die achteraan staat, zodat "buiten" het
  terras boven de auto zet.
- Niets gevonden komt **leeg** terug en valt niet stil terug op alles.
- Een bewaker in de test: elk getekend icoon staat in het raster én heeft
  zoekwoorden. Vergeet je die bij een nieuw icoon, dan is het alleen op zijn
  Engelse sleutel te vinden — in de praktijk onvindbaar.

### Gemeten met echte toetsaanslagen

In de editor van de navbalk, in de icoonkiezer:

```
getypt            "slaap kamer"
toetsaanslagen    11, alle 11 isTrusted: true
de spatie         { key: " ", code: "Space", isTrusted: true }
veldwaarde na     "slaap kamer"        <- de spatie kwam aan
resultaat         3 gevonden: slaapkamer, tweepersoonsbed, kledingkast

getypt            "sleep"
resultaat         2 gevonden: slaapkamer, tweepersoonsbed

geklikt op        slaapkamer  (isTrusted true)
config werd       { icon: "bed", name: "Thuis", path: "/kaart-test/navbalk" }
kiezer toont      "slaapkamer -- DomotiApp-icoon -- bed"
```

De spatie is hier geen formaliteit: het naamveld van de config-editor accepteerde
een fase lang geen spatie en de meting die dat had moeten vangen gebruikte één
woord (zie `docs/fase-4b-1/RAPPORT-FIX.md`).

Eén ding bijgesteld na de meting: een `input type=search` krijgt van de browser
zijn eigen kruisje, en naast het onze stonden er twee naast elkaar. Die van de
browser is weg.

---

## 3. Elf nieuwe iconen

De set had **geen enkel kamericoon**. Dat kwam bovendrijven doordat de eigenaar
naar "sleep" zocht en niets vond.

| Sleutel | Naam | Waarvoor |
|---|---|---|
| `bed` | slaapkamer | waar hij om vroeg |
| `bedDouble` | tweepersoonsbed | op zijn verzoek |
| `wardrobe` | kledingkast | op zijn verzoek |
| `hanger` | kleerhanger | op zijn verzoek |
| `sofa` | woonkamer | |
| `kitchen` | keuken | |
| `shower` | badkamer | |
| `toilet` | wc | |
| `desk` | kantoor | |
| `stairs` | trap | |
| `tree` | tuin | |
| `parasol` | terras | "buiten" |
| `fence` | erf | "buiten" |

Allemaal op lijndikte 1.6, gelijk aan de rest van de set. Twee nieuwe groepen in
de kiezer: **Kamers** en **Buiten**.

`tree` is halverwege opnieuw getekend. Een bol met een steeltje leest op 19px —
de maat in het meer-menu — als een ballon; het is nu een naaldboom.

Totaal: 108 getekende iconen, alle 108 in het raster en alle 108 met
zoekwoorden.

---

## 4. Achtergrond weglaten, op elke kaart

`bare: true` bestond al en werkte al in negen kaarten, maar stond in **geen
enkele editor**: je moest ervoor de code-editor in, en dat weet niemand. De
eigenaar wil een dashboard zonder vlakken en had het tot nu toe alleen op de
entiteitenkaart voor elkaar gekregen, door daar per entiteit te klikken.

Het veld staat nu in `DacEditor` zelf, als **gedeeld veld** achter het schema van
elke kaart. Eén plek, en elke volgende kaart in de familie heeft hem vanzelf ook.

- Label: **Achtergrond weglaten**, met uitleg eronder.
- De sectiekop doet niet mee (`gedeeldeVelden()` geeft daar een lege lijst): die
  kaart heeft nooit een vlak gehad, en een schakelaar die niets doet is erger dan
  geen schakelaar.
- De entiteitenkaart houdt zijn eigen keuze **Waar het kaartvlak zit**
  (hele kaart / per entiteit / geen vlak) — die kan meer dan aan of uit.
- De scenekaart en de wekkerkaart (allebei lit) kregen de opmaak en het kenmerk
  erbij; de wekkerkaart ook het veld in zijn editor. Bij de scenekaart moest
  `bare` in `EIGEN_SLEUTELS`, anders waarschuwt `setConfig` over een onbekende
  sleutel.
- De koppen van de header- en afvalkaart noemden dit "Zonder kaartrand" terwijl
  het veld nergens getoond werd. Die eigen labels zijn weg; het gedeelde label
  wint.

Gemeten in de echte instance: twee identieke kolommen naast elkaar, één met en
één zonder. Lampkaart, personenkaart, entiteitenkaart en afvalkaart verliezen
alle vier hun vlak. De schakelaar in de editor van de lampkaart is met een echte
klik omgezet en het voorbeeld verloor meteen zijn rand.

---

## Tests

```
npm test                   399 tests, 399 pass, 0 fail
npm run check:registratie  OK
npm run check:controls     OK
npm run verify             OK (bundel actueel)
```

Twee nieuwe testbestanden, allebei **NIEUW GEDRAG**:

- `tests/js/icoon-zoek.test.mjs`
- `tests/js/navbar-logica.test.mjs`

Beide falen aantoonbaar op de code van vóór deze ronde. Gedraaid in een losse
worktree op `3e45c1f` (de vorige `main`):

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...\src\editor\icoon-zoek.js'
  imported from '...\tests\js\icoon-zoek.test.mjs'
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...\src\cards\navbar-logica.js'
  imported from '...\tests\js\navbar-logica.test.mjs'
```

Twee testfouten onderweg waren echte fouten in de bron, geen fouten in de test:

- `klemBalk(null)` gaf 2 in plaats van 4. `Number(null)` en `Number("")` zijn
  allebei 0, en dat klemde op de ondergrens: een config zónder `max` kreeg twee
  knoppen in plaats van de standaard vier.
- De bewaker "elk icoon heeft een Nederlandse naam die niet zijn sleutel is"
  viel over garage, radio, wifi en tien andere waar het Nederlandse woord
  toevallig het Engelse ís. Die toets bewaakt nu wat er wél fout kan gaan: een
  camelCase-sleutel als `floorB` of `bedDouble` die als naam op het scherm komt.

---

## Wat niet lukte

- **De telefoonbreedte (< 620px) is niet in een browser gemeten.** Zie hierboven
  bij de navbalk. De regel staat er, hij is niet aangetoond.
- **Docker Desktop stond uit** aan het begin van de ronde en is gestart vanaf
  `%LOCALAPPDATA%\Programs\DockerDesktop` — niet vanaf `C:\Program Files`, waar
  hij niet (meer) staat.

## Aannames

- "Alleen navigeren" is gelezen als: géén actief-markering. Dat was een aparte
  optie in dezelfde vraag en hij vinkte alleen "Alleen navigeren" aan. Een
  navbalk waarin niets oplicht is ongebruikelijk; het is er bewust uit gelaten
  en het is in een paar regels alsnog toe te voegen.
- De kleurkeuze van de balk (`tone`) stuurt de hover- en open-stand, niet de
  iconen zelf. Die zijn neutraal wit, zoals de iconen op zijn entiteitenkaart.
- De standaard blijft **mét** achtergrond. "Ik wil eigenlijk geen achtergrond
  hebben bij geen enkele kaart" is een voorkeur, geen opdracht om de standaard om
  te zetten; dat zou elk bestaand dashboard stilletjes van uiterlijk laten
  veranderen. De schakelaar staat er nu overal.

## `git status --porcelain`



Alles hierboven staat op branch `fase-27/navbalk-en-icoonzoek`.
