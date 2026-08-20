# Rapport — de knopkaart, het alarmpaneel en de personenkaart

Branch `fase-18/entiteitenkaart-slikt-de-knopkaart`, 20 augustus 2026.

Drie opdrachten van de eigenaar, in deze volgorde binnengekomen:

1. Voeg de knopkaart en de entiteitenkaart samen tot één kaart, die
   entiteitenkaart heet. Alles wat de knop kon moet de entiteitenkaart krijgen.
   Een losse knop is dan een kaart van één kolom.
2. Haal het alarmpaneel er helemaal uit — een alarm hoort niet via een
   dashboardkaart uitgeschakeld te worden.
3. Maak de personenkaart veel compacter: de statustekst mag weg, de kleuren
   moeten blijven.

Onderweg is de tweede weerbron met de UV-index van de headerkaart gehaald en op
verzoek weer teruggezet. Daar is niets van blijven hangen: de bundelhash na het
terugzetten (`325246238aed…`) is exact dezelfde als ervoor.

---

## 1. De knopkaart gaat op in de entiteitenkaart

`custom:domotiapp-button-card` bestaat niet meer. Op expliciet verzoek zonder
schil die het oude type opvangt: een dashboard dat het type nog gebruikt, toont
"Custom element doesn't exist" tot het is omgezet. De omzetting staat in
`README.md`.

**Drie keuzes zijn gemaakt en één daarvan is aan de eigenaar voorgelegd.**

De VORM (rij, tegel, compact) zit **per rij**. Per kaart zou betekenen dat een
raster tegels boven een lijst regels twee kaarten kost; per entiteit zou blokjes
van ongelijke hoogte naast elkaar zetten in dezelfde rij. Een rij is precies de
eenheid waarop een vorm klopt. Dit is de keuze die is voorgelegd en waarop
"per rij" het antwoord was.

Het KAARTVLAK is nieuw en is niet voorgelegd: `surface: card` (zoals het was),
`items` (elke entiteit een eigen vlak — zo zag de knopkaart eruit) of `none`.
Zonder die instelling kan een raster ruimtetegels er niet uitzien zoals de
knopkaart eruitzag, en dat was de opdracht. `bare: true` blijft werken als de
oude spelling van `none`.

Een plek ZONDER ENTITEIT mag bestaan: dat is een navigatieknop. Daarmee is
"heeft een entiteit" niet meer hetzelfde als "is ingevuld", en dat raakt de hele
editor — `gevuld()` staat nu overal waar eerst `item.entity` stond.

Verder overgenomen van de knopkaart: icoon of naam verbergen per entiteit, en
dubbeltikken. Bij dat laatste schrijft de editor `{action:"none"}` **niet** weg;
zou hij dat wel doen, dan wacht elke tik 260ms op een tweede.

---

## 2. Het alarmpaneel eruit

De kaart was de enige gebruiker van alles wat eromheen zat, dus is dat meegegaan:
`alarm-logica.js`, `codepad.js`, `paneelcode.py`, de options-flow-stap Alarmcode
met het menu ervoor, de teksten in de drie taalbestanden, en beide testbestanden.

`config_flow.py`, `strings.json`, de twee vertalingen en `test_options_flow.py`
zijn teruggezet op de staat van vlak vóór de alarmcode (`7dcd25b`). Dat is exact
en niet met de hand nagebouwd: `git log 7dcd25b..HEAD --` op die vier bestanden
geeft alleen de alarmcode-commits.

Het staat in een **eigen commit** (`95b8c78`), zodat een revert volstaat als de
eigenaar er toch op terugkomt. Daarna wel `npm run build`, want de bundel zit in
de commit erna.

**De wekker is niet geraakt.** Die heet in de kaartkiezer "DomotiApp Alarm" —
verwarrend naast "DomotiApp Alarmpaneel", maar het is een ander ding en het
staat los van deze verwijdering.

---

## 3. De personenkaart

Statustekst weg, kleuren gebleven. Gemeten in de werkbank: **55px, één
rasterrij**, waar het er 84px en twee waren. Het `aria-label` noemt de plaats nog
voluit, inclusief zonenamen ("Peter, Werk").

De avatar ging van 38 naar 28 en de ring van 3,5px naar 3px. Dat laatste is geen
smaak: de ring wordt búiten de avatar getekend en zou bij deze maten tegen de
naam eronder aan komen te staan.

---

## 4. Tests

`src/cards/entities-logica.js` is nieuw en draagt de drie dingen die stilletjes
fout kunnen gaan: de vorm per rij, wanneer een plek gevuld is, en de hoogte.
Zelfde patroon als `media-logica.js` en `smoke-logica.js`, en om dezelfde reden:
in de kaart zelf is het niet te toetsen zonder browser.

`tests/js/entiteiten-logica.test.mjs` — 28 beweringen, gelabeld:

- **REGRESSIEWACHT** op de oude configvormen (`items`, `entities`, een item als
  string, `bare: true`). Die hangen op draaiende dashboards.
- **NIEUW GEDRAG** op de vorm per rij, de plek zonder entiteit en de hoogte.

**De negen NIEUW GEDRAG-beweringen falen alle negen op de code van vóór deze
ronde.** Aangetoond door ze te draaien tegen de `toRows` en de hoogteberekening
zoals die letterlijk in `main:src/cards/entities-card.js` stonden:

```
NIEUW GEDRAG 1 — de vorm per rij
  FAALT: een rij zonder vorm is een gewone rij     layout: undefined !== "row"
  FAALT: neemt tegel over                          layout: undefined !== "tile"
  FAALT: de oude platte vorm mag zijn layout meenemen   layout: undefined !== "tile"

NIEUW GEDRAG 2 — een plek zonder entiteit is een navigatieknop
  FAALT: een naam maakt een navigatieknop          gevuld: false !== true
  FAALT: een icoon maakt een navigatieknop         gevuld: false !== true
  FAALT: een tikactie maakt een navigatieknop      gevuld: false !== true

NIEUW GEDRAG 3 — de hoogte houdt rekening met vorm en vlak
  FAALT: een tegelrij is hoger dan een gewone rij  hoogte: 56 !== 108
  FAALT: een tegelrij vraagt twee rasterrijen      rasterrijen: 1 !== 2
  FAALT: zonder eigen kaartvlak vervalt de marge   hoogte: 56 !== 44

9 van de 9 beweringen falen op de oude code.
```

Tellingen op de gecommitte staat: **299 JS-tests, 494 Python-tests, alle groen.**
`npm run verify`, `npm run check:registratie` en `npm run check:controls` ook.

---

## 5. Browsermeting

Werkbank `dev/preview.html` via een lokale server, Chrome vooraan
(`visibilityState: "visible"` uitgelezen en getoond — bij een geminimaliseerd
venster komt er geen enkele echte klik door).

**Verse code bewezen.** De werkbank draait de BRON, niet de bundel (de inline
module importeert `../src/index.js`). `fetch("/src/cards/entities-card.js",
{cache:"reload"})` gaf **18.312 bytes**, gelijk aan `wc -c` op schijf. De bundel
is los geverifieerd met `npm run verify` (277.917 bytes, sha256 `14174951…`).

> De browser hield de ES-modules vast over een gewone reload heen. Dat is één
> keer een verkeerde meting geweest — de eerste toetsmeting liep tegen het oude
> testdubbel aan. Opgelost door op een andere poort te serveren, zodat elke
> module-URL verandert. Vermeld omdat het de volgende keer weer gebeurt.

Alle interacties hieronder zijn **echte kliks en toetsen**; `isTrusted` is van
elk uitgelezen via een capture-listener op `window` die `composedPath()` leest.
Vóór elke klik een hit-test met `elementFromPoint`.

| Handeling | `isTrusted` | Gevolg |
|---|---|---|
| Klik op vormknop "Compact" | true | één `config-changed`, `layout: "compact"`, aria-pressed verschoven, kop werd "2 kolommen · Compact · …" |
| Klik op kolomknop "3" (ín de rijkop) | true | rij bleef **open**, derde plek erbij en meteen opengeklapt, `columns: 3` |
| Typen in het naamveld, spatie erin | true op de spatie-keydown | **8 aanslagen → 8 configs**, elk één teken langer: `"Woning "` … `"Woning en tuin"` |
| Klik op een tegel **zonder entiteit** | true | `location-changed`, URL werd `#x` — de navigatieknop werkt |

Bij het typen bleef het veld gefocust met de cursor op 14, en de console bleef
leeg. Dat is precies de lus waar v0.1.8 en v0.1.9 op stukliepen (`Cannot add
property name, object is not extensible`): één letter kwam aan, de rest niet.

**Het testdubbel vuurde dat gat niet.** `dev/ha-form-stub.js` vuurde alleen bij
`change` (dus bij het verlaten van het veld), terwijl `ha-textfield` bij elke
aanslag vuurt. De werkbank kón die bug dus nooit laten zien. Dat is nu recht
gezet — de acht configs hierboven zijn het bewijs dat het dubbel nu wel meet wat
het hoort te meten.

**Gemeten posities en maten**, niet op het oog:

| Wat | Meting |
|---|---|
| Rij, één kolom, kaartvlak om de kaart | plek 44px, kaart 56px = 1 rasterrij |
| Rij, drie kolommen | plekken 115px breed, gelijk verdeeld |
| Tegel, drie kolommen, vlak per plek | 122×100px elk, rand 1px, hoek 20px, wash aanwezig |
| Compact | hoek 999px, chip 32px rond |
| Schakelaar op een tegel | 15px van rechts, 15px van boven |
| Schakelaar op een compacte pil | 23px hoog |
| Scene met `toggle: true` | géén schakelaar — daar valt niets uit te zetten |
| `show_icon: false` / `show_name: false` | chip resp. naamveld ontbreekt, geen fout in `paint()` |
| Personenkaart | 55px, 1 rasterrij, ringen `#0ca30c` / `#d03b3b` / `#fab219` |

De vormcontrole van de werkbank meldt **nul afwijkingen** over alle kaarten.

---

## 6. Wat er niet gelukt is

**Niet gemeten op een echte Home Assistant.** De testinstance op poort 8127 is
deze ronde niet opgestart; alles staat op de werkbank met het `ha-form`-dubbel.
Wat daardoor ongemeten blijft: de kaartkiezer in HA zelf, en de editor door
`hui-dialog-edit-card` heen. De werkbank bootst het bevriezen en het
terugduwen van `setConfig` wél na, en dat is de val die ertoe doet.

**Eén bug gevonden en gefixt tijdens de meting.** `.it.surface` kreeg geen rand:
`.surface` in `theme.js` zet er een, maar `.it` zet `border: 0` en staat verderop
in dezelfde stylesheet — bij gelijke specificiteit wint de laatste. Het gevolg
was een blokje met een achtergrond en zonder rand. De rand staat er nu expliciet
bij, met die uitleg erboven.

---

## 7. Aannames

- **Het kaartvlak per entiteit** is niet voorgelegd. Zonder die stand kan een
  raster tegels er niet uitzien zoals de knopkaart eruitzag, en dat was de
  opdracht. Terugdraaien kost één regel in de editor en één in de kaart.
- **`layout: row` wordt niet weggeschreven** in de YAML: dat is de standaard, en
  YAML waarin op elke rij het gewone geval staat leest slechter dan YAML waarin
  alleen de uitzondering staat.
- **De naam blijft op de personenkaart staan.** De opdracht noemde alleen de
  statustekst; een kaart met zes ringen zonder namen is een raadsel.
- **De alarmcode is aan de serverkant verwijderd, niet alleen de kaart.** "Helemaal
  uit" is zo gelezen. Het opslagbestand in `.storage` blijft staan en wordt
  nergens meer gelezen.

---

## 8. `git status --porcelain`

```
(leeg)
```

Vier commits op `fase-18/entiteitenkaart-slikt-de-knopkaart`:

```
4bb1c2d De bundel opnieuw gebouwd
ec1a57c De personenkaart terug naar één rasterrij
95b8c78 Het alarmpaneel eruit, met de alarmcode erbij
4186e57 De knopkaart gaat op in de entiteitenkaart
```
