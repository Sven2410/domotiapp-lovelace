# Een naam op de kaart, een keuzelijst op de regel, en de rookmelder rechtgezet

25 augustus 2026, tweede ronde van die dag. Vier verzoeken, in de volgorde
waarin ze binnenkwamen.

---

## 1. Een optionele naam op de entiteitenkaart

> "ik wil ook een naam optioneel kunnen geven aan een entiteitenkaartconfiguratie"

Gevraagd en bevestigd: een **kop op de kaart zelf**, zichtbaar op het dashboard,
en **alleen op de entiteitenkaart** — de andere kaarten hebben al een naamveld
voor hun entiteit.

Het veld staat bovenaan het kaartblok in de editor: *Naam van de kaart
(optioneel)*. Leeg laten geeft geen kop.

De kop kost een rasterrij, en dat is met opzet. `kaartHoogte()` telt er
`TITEL_H + GAP` = 22 + 6 = 28px bij op. Een enkele regel gaat daarmee van
12 + 44 = **56** naar **84**, en dat klemt op twee rasterrijen. Een kop die zich
in dezelfde 56px propt zou de regel eronder platduwen.

Alleen spaties telt als leeg. Anders levert een per ongeluk aangetikte
spatiebalk een onzichtbare kop op die de kaart wél een rij hoger maakt, en dan
zoek je waar die lege ruimte vandaan komt.

**Gemeten in de echte instance:**

```
zonder naam                 56px  -> 1 rasterrij
met naam "Slaapkamer"      120px  -> 2 rasterrijen
met naam, twee kolommen    120px  -> 2 rasterrijen
```

Precies op het raster, geen halve rij.

---

## 2. Een keuzelijst op de regel, voor een `input_select`

> "een oplossing voor een input select entity dat ik de dropdown krijg. Zelfde
> principe als een input date time entity"

Dat is precies wat het geworden is: `src/cards/keuzeveld.js` staat naast
`src/cards/tijdveld.js` en doet hetzelfde voor alles met een lijst standen. De
lijst verschijnt zonder dat je erom vraagt, op de plek van de statustekst;
`Status tonen` uit haalt met de tekst ook de lijst weg.

Twee domeinen, één vorm: `input_select` en `select`. Allebei heten hun service
`select_option` met de sleutel `option` — alleen het domein verschilt, en dat is
precies het soort verschil dat je een keer over het hoofd ziet.

**Eén verschil met het tijdveld, met opzet: geen wachttijd.** Het tijdveld wacht
600ms omdat een invoerveld zich per vak meldt (`17112026` gaf acht
tussenwaarden). Een keuzelijst kent dat niet: één keuze is één `change`, en er
bestaan geen tussenstanden om weg te filteren. Wachten zou hier alleen betekenen
dat de lamp een halve seconde later aangaat.

### De val van fase 12, opnieuw en op tijd

De browser tekent het **uitklappaneel** van een `select` met de achtergrondkleur
van de select zelf, en dat paneel valt buiten onze shadow root. Transparant
betekent daar "val terug op wit", en met lichte tekst wordt de lijst onleesbaar.
Dat kostte in fase 12 een release omdat niemand de dropdown had uitgeklapt.

Daarom staat `.keuze` op een **ondoorzichtige** kleur, net als de opties en de
markering. `scripts/check-controls.mjs` bewaakte dat alleen in
`src/alarm/editor.js`; die bewaker kijkt nu ook naar `entities-card.js`. Een
bewaker die één bestand kent, mist de fout op de volgende plek waar iemand een
select neerzet.

**Gemeten in de browser:**

```
achtergrond van de select   rgb(18, 18, 15)   (ondoorzichtig, niet rgba(0,0,0,0))
uitklappaneel               donker, vier opties leesbaar  -> schermafdruk
```

### Echte bediening

```
ArrowDown op de gefocuste lijst
  change-event      { waarde: "Weg", isTrusted: true }
  input_select      "Thuis" -> "Weg"   (echt gewijzigd in Home Assistant)
  tweede kaart met dezelfde entiteit   sprong mee naar "Weg"
klik op de lijst    het native paneel opent, donker en leesbaar
```

Een `change` met `isTrusted: true` kan niet uit een script komen; en de stand in
Home Assistant is echt veranderd. Het native paneel zelf is niet met de
browsertool te bedienen — dat is een venster buiten de pagina (bekende
beperking, staat in CLAUDE.md) — dus daar is de schermafdruk het bewijs.

`input_select` en `select` kregen ook een standaardicoon. Zonder dat stond er
een **vraagteken** naast elke keuzelijst, en dat leest als een kaart die de
entiteit niet kent. Gezien in de echte instance en meteen rechtgezet.

---

## 3. De rookmelderkaart

> "Rookmelder kaart is niet helemaal lekker de layout. Ook wil ik de tekst
> aanpassen Bij rook moet er staan Geen als er geen rook is"

### De tekst

Er stond overal "Rustig". Naast het woord "Rook" is dat geen antwoord op de
vraag die de pil stelt. Nu:

| Soort | Rust | Alarm |
|---|---|---|
| Rook | **Geen** | Alarm |
| Koolmonoxide | **Geen** | Alarm |
| Warmte | **Normaal** | Alarm |

"Warmte Geen" zou onzin zijn — warmte is er altijd, alleen niet te veel.
"Rustig" is wat de KAART als geheel is, en dat staat al in de kop.

### De layout

Twee kaarten naast elkaar in een sectie geeft een kaart van rond de 200px. Daar
passen drie pillen mét label niet in, en dan schoof de derde half buiten beeld —
een pil die halverwege tegen de kaartrand knalt leest als een kapotte kaart.

Onder 340px vervalt nu het **omhulsel** van de pil (de rand, het vlak en de
binnenmarge) en het label. Wat overblijft is het icoon met zijn waarde, en dat
past wel. De gegevens blijven dus staan; alleen de decoratie eromheen gaat weg.
Daarboven blijft alles zoals het was.

En loopt de rij tóch door — vijf soorten op een smalle kaart — dan **vervaagt**
de laatste pil in plaats van afgesneden te worden. Past alles, dan valt er in
die laatste 20px niets te vervagen en zie je er niets van.

Gemeten met twee kaarten naast elkaar (200px) en één over de volle breedte
(490px): op de smalle staan alle drie de waarden er, niets afgekapt; op de brede
staan de labels erbij.

---

## 4. Drie nieuwe iconen, en één opnieuw getekend

> "ook wil ik een rookmelder icon en een co icon"
> "de icon rook zie ik nu als een wolkje met regen klopt dat?"

Dat klopte. Er stond een bol met drie streepjes eronder, en dat leest als een
regenwolk — op een rookmelderkaart precies het verkeerde woord.

| Sleutel | Naam | Wat |
|---|---|---|
| `smoke` | rook | **Opnieuw getekend**: drie slierten die omhoog kringelen |
| `smokeDetector` | rookmelder | Het apparaat aan het plafond, met rook eronder |
| `co` | koolmonoxide | De twee letters. Een waarschuwingsdriehoek zegt "let op", niet "CO" |
| `keuzelijst` | keuzelijst | Voor `input_select` en `select` |

De rookmelderkaart toont in **rust** nu het apparaat (`smokeDetector`) en niet
een rookpluim: een pluim naast "Alles rustig" leest als rook die er niet is. Bij
alarm komt de pluim wél, want dan is er rook. Koolmonoxide had een
waarschuwingsdriehoek en heeft nu zijn eigen letters.

Totaal: 112 getekende iconen, alle 112 in het raster en alle 112 met
zoekwoorden.

---

## Tests

```
npm test                   430 tests, 430 pass, 0 fail
npm run check:registratie  OK
npm run check:controls     OK  (nu ook de keuzelijst op de entiteitenkaart)
npm run verify             OK
```

Nieuw: `tests/js/keuzeveld.test.mjs` (**NIEUW GEDRAG**).
Uitgebreid: `tests/js/entiteiten-logica.test.mjs` (**NIEUW GEDRAG**, de kop) en
`tests/js/smoke-logica.test.mjs` (**GEWIJZIGD GEDRAG**, het rustwoord en de
iconen).

Alle drie falen aantoonbaar op `ec2c044`, de vorige `main`. Gedraaid in een
losse worktree:

```
Cannot find module '...\src\cards\keuzeveld.js'
The requested module '.../entities-logica.js' does not provide an export named 'TITEL_H'
The requested module '.../smoke-logica.js' does not provide an export named 'rustWoord'
```

---

## Twee fouten die deze ronde zelf zijn gemaakt en gevangen

Allebei door de gereedschapsketen, niet door het denkwerk, en allebei het
opschrijven waard omdat ze er weer in sluipen:

1. **`$$` werd `$` onderweg naar het bestand.** Een patch die via een
   shell-heredoc en een template-literal liep, leverde
   `this.$(".it").forEach(...)` op in plaats van `this.$$(".it")`. Resultaat:
   `TypeError: this.$(...).forEach is not a function`, en een hele sectie van de
   view die niet meer opbouwde. Gezien in de console van de echte instance.
   Dezelfde route at ook backslashes op in een regex. **Les: schrijf broncode
   met backslashes of dollartekens rechtstreeks weg, niet via een heredoc.**

2. **`$$` in een replacement-string van `String.replace` betekent één `$`.** De
   reparatie van fout 1 leek te lukken en veranderde niets. Met een
   vervangfunctie in plaats van een string werkt het wel.

## Wat niet lukte

- Er is deze ronde niets blijven liggen van wat gevraagd is.

## Aannames

- "Warmte" krijgt "Normaal" in plaats van "Geen". Er is alleen naar rook
  gevraagd; "Warmte Geen" zou onzin zijn, dus die twee zijn los gehouden.
- De naam op de kaart is de **kaartbrede** naam en niet die van een rij. Die
  laatste bestond al, per entiteit.

## `git status --porcelain`

Zie de commit van deze ronde; de werkboom is daarna schoon.
