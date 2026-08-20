# DomotiApp Lovelace

De kaartenfamilie van DomotiApp, geleverd als integratie. Eén installatie, één
bundel, één versienummer — de entiteiten-, licht-, klimaat-, rolluik-, media-,
rookmelder-, alarmpaneel-, weersvoorspelling-, personen-, afval-, scheidings- en
headerkaart, plus de **scenekaart** met zijn opslag per lichtgroep en de
**wekkerkaart**.

## Waarom een integratie en geen losse kaartresource

De kaarten alleen zouden prima een gewone Lovelace-plugin zijn. De scenekaart
niet: die legt per lichtgroep drie scenes vast, en dat moet aan de serverkant
bewaard worden. Anders hangen de scenes aan het dashboard in plaats van aan de
kamer, zijn ze weg zodra je de kaart verplaatst, staan ze dubbel zodra je hem op
een tweede dashboard zet, en kan alleen een beheerder ze nog instellen — want een
scene opslaan zou dan het dashboard bewerken zijn.

Nu er toch een integratie is, meldt die de bundel ook zelf aan bij de frontend.
**Je hoeft geen Lovelace-resource toe te voegen.**

## Installeren

1. **HACS → drie puntjes → Custom repositories.** Vul
   `https://github.com/Sven2410/domotiapp-lovelace` in, kies bij *Type* de waarde
   **Integration**, en klik op **ADD**.
2. Zoek op **DomotiApp Lovelace** en klik **Download**.
3. **Herstart Home Assistant.** Een nieuwe integratie wordt pas na een herstart
   ingelezen.
4. **Instellingen → Apparaten & diensten → Integratie toevoegen**, zoek
   **DomotiApp Lovelace** en bevestig. Er valt niets in te stellen.

Zie je de kaarten daarna niet in de kaartkiezer staan, herlaad de pagina dan hard
(Ctrl+F5).

### Kom je van de losse pakketten?

Haal ze weg nadat dit pakket draait, anders laadt dezelfde kaart twee keer:

- **`domotiapp-cards`** (de plugin): verwijderen in HACS, en de resource-regel
  weghalen bij **Instellingen → Dashboards → drie puntjes → Bronnen**. De
  kaarttypes zijn niet veranderd, dus je dashboards blijven werken.
- **`domotiapp-scene`** (de integratie): je scenes worden **eenmalig overgenomen**
  zodra dit pakket voor het eerst start. Het oude bestand wordt daarbij niet
  aangeraakt en niet gewist, dus je kunt terug zolang je die integratie nog hebt
  staan.

## Wat erin zit

Alle kaarten heten nog `custom:domotiapp-*-card`, zoals ze heetten. De scenekaart
is `custom:domotiapp-scene-card` en verwacht een **lichtgroep-helper** in het
`light`-domein: **Instellingen → Apparaten & diensten → Helpers → Helper
aanmaken → Groep → Lichtgroep**.

De **mediaspelerkaart** (`custom:domotiapp-media-card`) toont wat er speelt, de
knoppen die de speler aankan en het volume. Welke knoppen dat zijn leest hij uit
de speler zelf: wat een speler niet kan, komt niet op de kaart.

Op de mediakaart zit een **zoekknop** die Music Assistant over het hele scherm
opent: zoeken in je hele bibliotheek en al je providers, tikken speelt meteen af,
vasthouden geeft de keuze tussen nu, hierna en achteraan in de wachtrij.

Onderin dat scherm staat een regel per speaker. Aantikken laat hem meespelen, en
wie meespeelt krijgt daar **zijn eigen volumeschuif** naast. Een speaker die bij
de groep komt neemt meteen het volume over van de speler waar hij bij komt —
anders begint een speaker die nog op vol volume stond daar ook op.

Zit het geluid ergens anders dan het beeld (een tv met een soundbar eronder),
vul dan **Geluid van** in op de kaart: de volumeregeling gaat dan naar die
speler.

De mediakaart heeft twee vormen. **Rij** is één rasterrij hoog, om er zes onder
elkaar te zetten. **Groot** is telefoonformaat — grote hoes, grote knoppen — voor
waar de kaart alle ruimte krijgt, zoals een bubble-pop-up of een eigen kolom. In
die vorm is de hoes zelf de knop die start en pauzeert.

> **Eenmalig instellen:** maak in Home Assistant een label **`Music Assistant
> Media`** aan (*Instellingen → Gebieden, labels en zones → Labels*) en plak het
> op de Music Assistant-speakers die op de kaart mogen meespelen. Zonder dat
> label werkt zoeken en afspelen gewoon, maar blijft de speakerlijst leeg. Het is
> met opzet een ander label dan `Music Assistant Wekker`: op een wekker horen
> andere speakers dan op een mediakaart.

De **rookmelderkaart** (`custom:domotiapp-smoke-card`) neemt vijf optionele
entiteiten: rook, koolmonoxide, warmte, temperatuur en batterij. Vul in wat je
melder heeft. Eén regel zegt wat er aan de hand is — rook verslaat een lege
batterij, een lege batterij verslaat "alles rustig".

De **alarmpaneelkaart** (`custom:domotiapp-alarm-panel-card`) toont de standen die
je paneel aankan: Uitgeschakeld, Afwezig en Thuis.

**Met een code.** Uitschakelen kan om een code vragen, inschakelen niet — dat is
de standaard. De code komt uit een van twee plekken, en de kaart kiest zelf:

1. **Je alarmsysteem zelf.** Meldt de entiteit `code_format`, dan heeft je paneel
   een eigen code (Alarmo, de `manual`-integratie, een systeem van een merk). De
   kaart toont het codepaneel en stuurt de code mee.
2. **DomotiApp.** Heeft je paneel geen eigen code, stel er dan een in bij de
   integratie: *Instellingen → Apparaten & diensten → DomotiApp Lovelace →
   Configureren → Alarmcode*. Die staat gehasht op de server en is daarna niet
   meer uit te lezen — ook niet door jou.

> **Wat dit wel en niet is.** Het is een slot op de kaart, niet op Home Assistant.
> Wie kan inloggen, kan het alarm ook via de ontwikkelaarstools uitschakelen. Het
> houdt tegen dat iemand die langsloopt het alarm van de muur af uitzet. Wil je
> een slot dat ook tegen een ingelogde gebruiker beschermt, gebruik dan de code
> van je alarmsysteem zelf.

Na vijf verkeerde pogingen binnen een minuut gaat er een minuut lang niets meer
doorheen.

De **weersvoorspellingkaart** (`custom:domotiapp-forecast-card`) vraagt alleen de
weerentiteit. Per dag of per uur; wat je bron niet levert, komt er niet op.

## De entiteitenkaart

`custom:domotiapp-entities-card` is de werkkaart. Hij is opgebouwd uit **rijen**,
en elke rij heeft twee eigen keuzes:

- **Hoeveel kolommen** — één, twee of drie entiteiten naast elkaar. Het
  kolomaantal ís het aantal plekken: wil je een vierde, dan maak je een tweede
  rij.
- **Welke vorm** — *Rij* (icoon, naam en status naast elkaar), *Tegel* (icoon
  boven de naam, met een vleug identiteitskleur, voor een raster ruimtes) of
  *Compact* (een pil met alleen icoon en naam).

Daarnaast staat er één keuze voor de hele kaart: **waar het kaartvlak zit**. Om
de hele kaart (een lijst op één vlak), om elke entiteit apart (losse blokken —
zo zag de oude knopkaart eruit), of geen vlak.

**Er was een aparte knopkaart** (`custom:domotiapp-button-card`). Die is er sinds
0.6.0 uit: een knop is niets anders dan deze kaart met één rij van één kolom, en
twee kaarten die hetzelfde doen lopen vroeg of laat uit de pas. Alles wat de
knopkaart kon zit hier: de drie vormen, icoon of naam verbergen, dubbeltikken, en
een plek zónder entiteit — dat is een navigatieknop. Gebruik je het oude type nog
in een dashboard, zet het dan om naar:

```yaml
type: custom:domotiapp-entities-card
surface: items          # zoals de knopkaart: een eigen vlak per knop
rows:
  - columns: 1
    layout: row         # of tile / compact
    items:
      - entity: light.woonkamer
        icon: bulb
        tap_action: { action: navigate, navigation_path: "#woonkamer" }
```

Per entiteit kun je verder een **schuifschakelaar** tonen (*Schakelaar tonen*),
voor wat twee standen heeft die blijven staan — een lamp, een stopcontact, een
schakelaar. Op een scene of een script verschijnt hij niet: daar valt niets aan
of uit te zetten. En voor de hele kaart kun je kiezen of de status onder de naam
staat of rechts op de regel.

De scenes horen bij die lichtgroep, niet bij het dashboard. Zet je de kaart
ergens anders neer, dan gaan ze mee. Verwijder je een kamer, dan blijven ze
bewaard tot je ze opruimt via **Configureren** bij de integratie.

## Voor ontwikkelaars

`SPEC.md` beschrijft **wat** de scenekant doet en is bindend; `CLAUDE.md`
beschrijft **hoe** eraan gewerkt wordt.

```bash
npm ci
npm run build              # bundelt src/ -> custom_components/.../frontend/
npm run verify             # faalt als de gecommitte bundel afwijkt van de bron
npm run check:registratie  # bewaakt hoe de custom elements geregistreerd worden
npm test                   # JS-unittests (node --test), geen jsdom
```

De gebouwde bundel wordt **meegecommit**, want HACS levert wat er in de repo
staat. CI vergelijkt hem byte-voor-byte met een verse build. Het versienummer
komt uit één bron: `version` in
`custom_components/domotiapp_lovelace/manifest.json`.

### De werkbank

`dev/preview.html` toont alle kaarten en editors met een nagemaakte `hass`, met
de websocketcommando's van de scenekaart in het geheugen nagebootst. Serveer de
map en open hem:

```bash
python -m http.server 8778
# http://localhost:8778/dev/preview.html
```

De werkbank doet twee dingen na die je in Home Assistant pas laat zou merken: hij
**bevriest** de config die een editor wegschrijft en duwt hem terug via
`setConfig` — precies wat `hui-dialog-edit-card` doet — en hij zet zelf het
element `home-assistant` neer, want daarop wacht de registratielus.

### Twee families in één bundel

De kaarten in `src/cards` zijn framework-vrij (`DacCard` in `src/base.js`); de
scenekaart in `src/scene` draait op lit en is overgenomen uit een werkend
product, inclusief zijn tests. Zijn logica is met opzet ongemoeid gelaten; alleen
zijn uiterlijk is gelijkgetrokken. Wat ze delen is de vormtaal uit
`src/theme.js` — `src/scene/vormtaal.js` giet dezelfde tokens in een lit-`css` —
en één registratielus in `src/registratie.js`.

Dat laatste is geen netheid. Deze bundel wordt uit `index.html` geïmporteerd,
náást de app van Home Assistant, en wie die race wint bepaalt in wélke
custom-element-registry je landt. Te vroeg registreren betekent onzichtbaar zijn
voor Home Assistant, zonder fout en zonder log. Daarom definieert alleen
`src/scene/registreer.js` iets, en bewaakt `npm run check:registratie` dat.

Python-tests draaien niet op Windows (Home Assistant importeert `fcntl`); CI
draait ze. Er is een wegwerp-testinstance in `docker-compose.yml`.
