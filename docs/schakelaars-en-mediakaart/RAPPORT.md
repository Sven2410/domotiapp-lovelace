# Schakelaars op de knop- en entiteitenkaart, en een mediaspelerkaart

Ronde van 19 augustus 2026. Drie dingen erbij, in één bundel:

1. een **schuifschakelaar** rechts op de knopkaart;
2. dezelfde schakelaar **per regel op de entiteitenkaart**, plus de keuze om de
   status rechts te tonen in plaats van onder de naam;
3. een **mediaspelerkaart**, naar wat de Mushroom-mediakaart doet, in de
   vormtaal van deze familie.

---

## 1. Wat er gebouwd is

### De schakelaar (`src/toggle.js`)

Eén schakelaar voor de hele familie: `toggleHtml()`, `toggleCss`, `bindToggle()`
en `setToggle()`. Te bedienen zoals hij eruitziet -- je pakt de greep en schuift
-- maar een tik werkt ook, want iedereen tikt.

Het schakelen gebeurt bij **loslaten**, niet op `click`. Tijdens een sleep vuurt
de browser óók een click, en dan zou een sleep naar rechts eerst aanzetten
(loslaten) en meteen weer uitzetten (click). De clicktak blijft bestaan voor
toetsenbord en hulptechnologie, herkenbaar aan `detail === 0` / geen voorafgaande
pointer; die is met een echte spatietoets gemeten (zie §3).

De schakelaar stopt zijn eigen pointer- en clickevents. Zonder dat telt een tik
erop ook als een tik op de kaart eronder, en dan opent er een pop-up terwijl je
alleen het licht wilde aandoen. Gemeten: geen enkele `hass-more-info` tijdens al
het schakelen.

### Waar hij wél en niet verschijnt (`kanSchakelen` in `src/ha.js`)

Een schakelaar belooft twee standen die blijven staan. Een scene, een script of
een sensor heeft geen "uit" om naartoe te schuiven. Daarom laten de kaarten hem
daar weg, **ook als de config `toggle: true` zegt**: `light`, `switch`, `fan`,
`input_boolean`, `automation`, `siren`, `humidifier`, `remote` en `water_heater`
krijgen er een, de rest niet. Getoetst in `tests/js/schakelaar.test.mjs`.

### Knopkaart

Nieuwe instelling `toggle` (uit tenzij aangezet). Op een rij staat de schakelaar
rechts, op een tegel rechtsboven (gespiegeld aan de chip linksboven), op een
compacte pil kleiner. De hoogte verandert niet: rij blijft 56px.

### Entiteitenkaart

- Per regel `toggle: true` -- de schakelaar vervangt daar de statustekst, want
  die zou twee keer hetzelfde zeggen.
- Kaartbreed `state_position: "right"` -- de status staat rechts op de regel in
  plaats van onder de naam. Dat is de vorm van Home Assistants eigen
  entiteitenkaart, en de reden dat het gevraagd werd: in een kolom van één
  entiteit per regel komen de waarden dan onder elkaar uit.
- De editor kreeg er twee velden bij: "Waar de status staat" (kaartbreed,
  bovenaan) en "Schakelaar tonen" (per entiteit, in het blok van die entiteit).
  Geen uitklapblok voor weergave -- die horen hier niet, dat is een eerdere
  beslissing.

### Mediaspelerkaart (`src/cards/media-card.js`, `media-logica.js`)

Type `custom:domotiapp-media-card`, naam "DomotiApp Mediaspeler".

Regel 1 is chip + naam + wat er speelt + de knoppen; regel 2 is dempen + de
volumeschuif (dezelfde `bindSlider` als de lampkaart, dus schrijven bij loslaten
en niet bij elke pixel). Staat de speler uit, dan is regel 2 er niet en is de
kaart één rasterrij.

**Welke knoppen erop staan, beslist de speler.** `supported_features` bepaalt
alles: een Chromecast zonder "vorige" krijgt hem niet, een radiostream zonder
pauze krijgt stop in plaats van afspelen, een tv die alleen stapjes kent krijgt
plus en min in plaats van een schuif, en een speler die er niets van kan krijgt
geen volumeregel. Dat is dezelfde afspraak als `supported_color_modes` bij de
lampkaart: het apparaat vertelt het zelf, niemand vinkt het aan.

De albumhoes vult de chip (dezelfde regel als de clublogo's elders); een eigen
icoon wint daarvan.

### Iconen

Zeven erbij, op 1.6px net als de rest: `play`, `pause`, `next`, `prev`,
`volume`, `volumeMute`, `music`. Ze staan in de icoonkiezer onder een nieuwe
groep **Media**. `defaultIcon` kent nu `media_player` (tv / receiver / speaker).

---

## 2. Tests

`npm test`: **243 groen** (was 216).

| Bestand | Wat | Soort |
|---|---|---|
| `tests/js/media-logica.test.mjs` | 26 tests: bitmasker → knoppen, volumeregel, volumepercentage, wat er speelt, icoon per soort speler | **NIEUW GEDRAG** |
| `tests/js/schakelaar.test.mjs` | waar een schakelaar mag staan en waar niet | **NIEUW GEDRAG** |

Beide gaan over code die vóór deze ronde niet bestond; ze kunnen dus niet tegen
de oude code gedraaid worden. Wat er wél tegen de oude code gedraaid is:
`npm run verify`, `npm run check:registratie`, `npm run check:controls` en de
216 bestaande tests -- alle vier groen vóór én na.

Bewust geen jsdom: de schakelaar en de knoppen zijn DOM en cascade, en daar zegt
jsdom niets zinnigs over. Die zijn in de browser gemeten.

---

## 3. Browsermeting

Werkbank `dev/preview.html` in Chrome, via een lokale server. De werkbank kreeg
er vier mediaspelers, een pomp en de vijf regels uit de schermafdruk van de
eigenaar bij, plus de editors.

**Verse code bewezen**: `fetch(..., {cache:'reload'})` van de gebundelde
`domotiapp-lovelace.js` gaf 238.191 bytes en sha256 `458cb5be…f355b` -- gelijk
aan wat `npm run build` op schijf schreef.

Alle interacties hieronder zijn **echte kliks en toetsen**; van elk is
`isTrusted` uitgelezen via een capture-listener op `window` die
`composedPath()` leest (geen eigen deep-query door shadow roots).

| Handeling | `isTrusted` | Gevolg |
|---|---|---|
| Klik op pauze (Sonos) | true | `media_player.media_pause`, icoon wordt afspelen, toestand `paused` |
| Klik op volgende | true | `media_player.media_next_track`, titel verandert mee |
| Sleep volumeschuif | true | **één** `volume_set` met `0.76` bij loslaten, kaart toont 76% |
| Klik op dempen | true | `volume_mute` met `true`, icoon wordt doorgestreept, tekst "Gedempt" |
| Klik op schakelaar (entiteitenkaart) | true | `homeassistant.turn_on`, stand omgezet |
| **Sleep** schakelaar 20px naar links | true | `homeassistant.turn_off` -- één aanroep, geen dubbele |
| Klik op schakelaar (knopkaart) | true | `homeassistant.turn_on`, `on` op de host, tweede regel "Aan" |
| **Spatietoets** op dezelfde schakelaar | true | `homeassistant.turn_off` -- de toetsenbordtak werkt |

Bij al deze handelingen: **nul** `hass-more-info`-events. De schakelaar lekt dus
niet door naar de kaart eronder.

**Gemeten posities** (`getBoundingClientRect`, niet op het oog):

- Entiteitenkaart met status rechts: rechterrand van de schakelaars en van de
  statusteksten allebei op **724px** -- 0px verschil, dus de kolom loopt door.
- Knopkaart, rij: chip 13px van de linkerrand, schakelaar 13px van de
  rechterrand.
- Knopkaart, tegel: chip 15px van linksboven, schakelaar 15px van rechtsboven,
  geen overlap.
- Kaarthoogtes: mediaspeler 93px met volumeregel, 56px zonder (`rows: "auto"`,
  zoals de lampkaart); knopkaart met schakelaar onveranderd 56px.

**Editors, door de echo-lus van Home Assistant** (de werkbank bevriest de config
en duwt hem terug via `setConfig`, precies zoals `hui-dialog-edit-card`):

- Mediakaart-editor, naamveld met **echte toetsaanslagen inclusief twee spaties**
  (`isTrusted` op de spatie: true): veld houdt "Sonos keuken beneden", cursor op
  positie 20, geen terugsprong; config krijgt `name` met spaties en al.
- Entiteiteneditor: "Schakelaar tonen" uitvinken haalt `toggle` uit de config,
  opnieuw aanvinken zet hem terug -- dus ook de tweede en derde wijziging komen
  aan, geen bevroren object.
- "Waar de status staat" met een echte pijltoets van Rechts naar Onder: 
  `state_position` verdwijnt uit de config (standaard wordt niet weggeschreven)
  en `toggle: true` blijft staan.

Console: geen enkele fout uit deze bundel. Eén waarschuwing van de wekkerkaart
(`subscribeMessage` bestaat niet in de nagemaakte hass) -- die stond er al en
hoort bij de werkbank, niet bij Home Assistant.

---

## 4. Wat niet lukte

- **De Python-tests zijn niet gedraaid.** Ze draaien niet op Windows (Home
  Assistant importeert `fcntl`) en Docker Desktop stond uit; het commando uit
  CLAUDE.md kon dus niet. Er is deze ronde geen regel Python gewijzigd -- alleen
  frontend en tests -- dus de dekking daarvan is ongewijzigd. CI draait ze bij
  de PR alsnog.
- **Niet in een echte Home Assistant gemeten**, om dezelfde reden. De werkbank
  bootst `hass`, `ha-form` en de bevriezing na, maar niet de sections-layout.
  Wat daar nog gekeken moet worden is de kaarthoogte in een echt raster.
- **Geen kaarttitel met hoofdschakelaar.** Op de schermafdruk staat boven de
  lijst een titelregel met een eigen schakelaar. Die zit hier niet in; daar is de
  separator- of headerkaart voor, of hij moet apart gevraagd worden.

## 5. Wat opviel

De entiteitenkaart claimt in het sections-raster meer hoogte dan zijn inhoud:
vijf regels is 256px inhoud, en dat wordt 5 rasterrijen = 312px. Die 56px extra
zat er al vóór deze ronde (bij drie regels is het 28px) en komt doordat een regel
44px hoog is terwijl het raster met 64px per rij loopt. Exact laten uitkomen zou
betekenen dat een regel ~58px hoog wordt. Dat is een vormkeuze en die is hier
niet gemaakt.

## 6. Aannames

- **De status is rechts uitlijnen een kaartbrede keuze, niet per regel.** Anders
  loopt de kolom met waarden niet meer door, en dat was juist het punt.
- **Waar een schakelaar staat, staat geen statustekst.** De stand van de
  schakelaar zégt aan of uit; de tekst ernaast zou hetzelfde nog eens zeggen.
- **De volumeregel verschijnt ook als er niets speelt** (maar de speler wel
  aanstaat): je zet het volume goed vóórdat de muziek begint. Alleen "uit" en
  "niet bereikbaar" krijgen geen regel.
- **De mediakaart heeft geen instelling voor welke knoppen erop staan.** Dat
  leest hij uit `supported_features`, volgens de afspraak in deze familie.

## 7. `git status --porcelain`

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M dev/preview.html
 M src/cards/button-card.js
 M src/cards/entities-card.js
 M src/editor/entities-editor.js
 M src/editor/icon-picker.js
 M src/ha.js
 M src/icons.js
 M src/index.js
?? docs/schakelaars-en-mediakaart/RAPPORT.md
?? src/cards/media-card.js
?? src/cards/media-logica.js
?? src/toggle.js
?? tests/js/media-logica.test.mjs
?? tests/js/schakelaar.test.mjs
```
