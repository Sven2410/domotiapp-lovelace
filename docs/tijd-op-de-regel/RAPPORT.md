# Tijd op de regel — een input_datetime die je meteen zet

**Melding van de eigenaar:** "Bij de entiteitenkaart wil ik een oplossing voor een
input_datetime. Als ik die als entiteit toevoeg moet ik er eerst op klikken om vervolgens
de tijd in te vullen. Kan dat niet net als die schakelaar rechts op de kaart, direct?"

**Uitgevoerd op:** 25 augustus 2026, branch `fase-20/tijd-op-de-regel`, versie **0.9.0**.

---

## Samenvatting

Een `input_datetime` op de entiteitenkaart toonde alleen zijn waarde. Verzetten kostte vier
handelingen: regel opentikken, venster van Home Assistant afwachten, veld zoeken, venster
sluiten. Nu staat op diezelfde plek — rechts op de regel, waar de schuifschakelaar van een
lamp staat — een veld dat je meteen zet. Eén tik opent de klok of de kalender van het
toestel zelf.

Het geldt voor alle vier de domeinen die een moment dragen: `input_datetime`, en de `time`,
`date` en `datetime` van een apparaat.

**Het is geen instelling.** De waarde stond er toch al en bewerkbaar tonen kost geen ruimte;
een schakelaar is opt-in omdat daar een echte keuze ligt (tekst óf schakelaar), hier niet.
Wie helemaal geen waarde op de regel wil, zet **Status tonen** uit — dat is dezelfde knop
die de tekst weghaalt, en het veld ís hier wat de tekst was.

### Wat er gebouwd is

| Bestand | Wat |
|---|---|
| `src/cards/tijdveld.js` (nieuw) | Het rekenwerk: welk veld hoort bij welke entiteit, wat er in staat, welke service-aanroep eruit komt. Geen DOM, geen `hass`. |
| `src/cards/entities-card.js` | Het veld in de regel: opmaak, opbouw in `paint()`, gedrag in `wire()`, en de statustekst die wegvalt waar een veld staat. |
| `src/icons.js` | `input_datetime`, `time` en `datetime` krijgen de klok, `date` de kalender. Een helper zonder tijd ook de kalender. |
| `src/editor/entities-editor.js` | Twee stukjes uitleg: bij **Status tonen** en bij **Waar de status staat**. |
| `tests/js/tijdveld.test.mjs` (nieuw) | 19 tests over de vier spellingen, de veldkeuze en de vier service-aanroepen. |
| `dev/preview.html` | Zeven tijdentiteiten, vier demokaarten, en de werkbank logt voortaan ook `hass-more-info`. |

### Drie beslissingen die uitleg verdienen

1. **Het is een echt invoerveld van de browser**, geen nagebouwde kiezer. Op een telefoon
   opent dan de klok van het toestel zelf, en op een toetsenbord werkt gewoon typen. Wat
   eraf gehaald is, is het kalenderknopje van de browser (eigen maat, eigen kleur); het veld
   opent zijn kiezer daarom zelf bij een tik (`showPicker()`), met een terugval op typen als
   de browser dat niet kent.
2. **De aanroep wacht 600 ms.** Een invoerveld meldt zich per vak: typ je `08:45`, dan komt
   er een wijziging na elk cijfer. Gemeten in de browser: bij een datum leverde `17112026`
   acht tussenwaarden op, waaronder de jaren `0002`, `0020` en `0202`. Ongefilterd waren dat
   acht service-aanroepen naar Home Assistant, met tussenstanden waar een automatisering op
   een wektijd wakker van wordt. Nu gaat er één aanroep uit, met de laatste waarde, en bij
   het verlaten van het veld meteen.
3. **Het gedrag hangt aan de REGEL, niet aan het veld.** Het veld wordt pas in `paint()`
   gebouwd — dan pas is bekend of er een klok, een kalender of allebei in zit — en zou bij
   elke verbouwing zijn luisteraars kwijt zijn. De tik wordt in de **vangfase** gestopt,
   want de regel eronder luistert zelf in de bubbelfase: pas daar stoppen betekent dat de
   pop-up al open is voordat het veld zijn tik krijgt.

---

## Bewijs

### Verse code gemeten

Werkbank op een **nieuwe poort** (8232), want de browser houdt ES-modules vast over een
gewone herlading heen.

| Bron | Lengte |
|---|---|
| `src/cards/entities-card.js` op schijf | 24936 bytes |
| Opgehaald met `fetch(..., {cache:"reload"})` in de pagina | 24936 bytes |

`bron.includes("setTimeout(stuur, 600)")` → `true`. Het venster stond vooraan:
`document.visibilityState === "visible"`, `document.hasFocus() === true`.

### Echte kliks en echte toetsaanslagen (`isTrusted: true`)

| Wat | Wat er gebeurde |
|---|---|
| Klik op het **tijdveld** (07:30) | Klok van de browser klapte open óp de regel; `isTrusted: true` op `pointerdown` en `click`; **geen** `hass-more-info` |
| `0` `8` `4` `5` getypt | Vier wijzigingen: `00:30`, `08:30`, `08:04`, `08:45` — allemaal `isTrusted: true` |
| 900 ms later | **Eén** aanroep: `input_datetime.set_datetime {"entity_id":"input_datetime.wektijd","time":"08:45:00"}` |
| Klik op de **datum** (12-09-2026) | Kalender klapte open op de regel, donker |
| `17112026` getypt | Acht wijzigingen, waaronder `0002-11-17` en `0020-11-17` |
| 900 ms later | **Eén** aanroep: `input_datetime.set_datetime {"entity_id":"input_datetime.vakantie","date":"2026-11-17"}` |
| Pijl omhoog op **datum + tijd** | Eén aanroep: `{"entity_id":"input_datetime.afspraak","datetime":"2027-08-25 09:15:00"}` |
| Klik op de **regel** (naast het veld) | `hass-more-info input_datetime.wektijd` — de regel opent nog gewoon |
| Klik ergens anders, ná de aanroep | Géén tweede aanroep; het veld hield `08:45` toen de toestand terugkwam |
| Vijfcijferig jaar (`31220-08-25T23:30`, per ongeluk getypt) | Géén aanroep — onleesbaar is geen opdracht |

### Valkuil 2: losgemaakt en teruggehangen

Home Assistant verplaatst kaarten in de DOM. De kaart is met `remove()` losgemaakt en met
`appendChild()` teruggehangen; daarna een echte klik op het veld van **precies die kaart**
(gemeten met een luisteraar op die shadow root: `{"doel":"tijd","isTrusted":true}`) plus
pijl omhoog:

```
14:51:32  input_datetime.set_datetime  {"entity_id":"input_datetime.wektijd","time":"09:30:00"}
```

Eén aanroep, na de verhuizing. Geen dode kaart, geen dubbele luisteraar.

### Vorm

- Op een **tegel** staat het veld rechtsboven, waar de schakelaar ook staat: gemeten 15px van
  de rechterrand en 15px van de bovenkant, bij een padding van 14px.
- Waar een veld staat, staat **geen statustekst**: alle vier de gemeten `.st`-regels waren leeg.
- `Status tonen` uit → **geen veld en geen tekst** (rij "Zonder veld" op de werkbank).
- Een `time`-entiteit op `unknown` (nog nooit gezet) blijft gedimd met "Niet bereikbaar",
  net als elke andere entiteit zonder toestand. Dat is de bestaande regel van de kaart en die
  is hier niet omgegooid.
- Geen fouten in de console.

### Tests

```
node --test tests/js/tijdveld.test.mjs   →  19 tests, 19 pass, 0 fail
npm test                                 →  365 tests, 365 pass, 0 fail
npm run check:registratie                →  OK
npm run check:controls                   →  OK
```

**NIEUW GEDRAG, aantoonbaar falend op de code van vóór deze ronde.** `tijdveld.js` bestond
niet; met dat bestand tijdelijk weggehaald:

```
ℹ pass 0
ℹ fail 1
✖ tests\js\tijdveld.test.mjs (43.6211ms)
  'test failed'          (ERR_MODULE_NOT_FOUND)
```

---

## Wat niet lukte

- **De native kiezer is niet met de browsertool te bedienen.** De klok en de kalender die
  Chrome opent zijn een venster buiten de pagina; een klik op die coördinaten gaat door de
  pagina heen en landde op de kaart eronder. Dat is een beperking van het meetgereedschap,
  geen fout in de kaart: het openen zelf is wél gemeten (schermafdruk) en het invullen is
  met echte toetsaanslagen gemeten.
- **Niet gemeten op de echte instance.** De testinstance op 8127 is deze ronde niet gestart;
  alles staat op de werkbank met een nagemaakte `hass`.
- De aanroep bij het **verlaten van het veld** binnen de 600 ms is niet los aangetoond: elke
  stap van de browsertool duurt langer dan die 600 ms, dus de wachttijd was altijd al
  verstreken. Wel aangetoond is dat er dán géén tweede aanroep meer komt.

## Aannames

- `time.set_value`, `date.set_value` en `datetime.set_value` zijn de diensten van die drie
  domeinen; alleen de `input_datetime`-tak is met echte aanroepen gemeten, de andere drie
  staan in de tests. Bij `datetime` gaat er een moment mét zone de deur uit
  (`2026-08-25T07:30:00+02:00`), zodat er aan de andere kant niets uit te leggen valt.
- Een tijdveld en een schakelaar sluiten elkaar uit. Ze komen nooit samen voor: geen enkel
  tijddomein staat in `SCHAKELBAAR`.

## `git status --porcelain`

Zie de PR-beschrijving; op het moment van schrijven staan alleen de bestanden uit de tabel
hierboven plus de gebouwde bundel en dit rapport in de diff.
