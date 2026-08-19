# DomotiApp Lovelace

De kaartenfamilie van DomotiApp, geleverd als integratie. Eén installatie, één
bundel, één versienummer — de knop-, licht-, klimaat-, rolluik-, entiteiten-,
media-, personen-, afval-, scheidings- en headerkaart, plus de **scenekaart** met
zijn opslag per lichtgroep en de **wekkerkaart**.

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

De **knopkaart** en de **entiteitenkaart** kunnen een schuifschakelaar tonen
(instelling *Schakelaar tonen*), voor wat twee standen heeft die blijven staan —
een lamp, een stopcontact, een schakelaar. Op een scene of een script verschijnt
hij niet: daar valt niets aan of uit te zetten. Op de entiteitenkaart kun je
daarnaast kiezen of de status onder de naam staat of rechts op de regel.

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
