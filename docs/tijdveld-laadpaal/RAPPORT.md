# 0.80.3: het tijdveld op de laadpaalkaart staat recht

19 oktober 2026.

## Aanleiding

De eigenaar stuurde via de coach-sessie een schermafdruk van een iPhone, met
één zin: *"niet lekker uitgelijnd"*. Het ging om de laadpaalkaart van een
laadpaal zonder auto, met het schema aan, in het lichte thema. Onder "Pauze |
Schema" staan twee vakken naast elkaar: "Klaar om" met 08:00 en "Laden tot"
met − 100% +. Het linkervak was omcirkeld.

De diagnose die meekwam was dat het linkervak lager en smaller was dan het
rechter, met een andere bovenkant en hoogte, en een label dat anders
inspringt.

## Gemeten op de schermafdruk

In pixels van de schermafdruk (739 breed; ongeveer 1,88 per CSS-pixel). De
rode cirkel van de eigenaar is eruit gefilterd door alleen grijze pixels mee
te tellen.

| | Klaar om | Laden tot |
|---|---|---|
| vak links–rechts | 44–360 | 377–694 |
| vak boven–onder | 1071–1142 | 1071–1142 |
| label begint | 9 px in het vak | 9 px in het vak |
| label boven–onder | 1038–1053 | 1038–1053 |
| cijfers boven–onder | **1085–1104, midden 1094,5** | 1096–1116, midden 1106 |
| cijfers horizontaal | midden 202, vakmidden 202 | midden 536, vakmidden 535,5 |
| vulling | **wit (255)** | **grijs (243)** |

De vakken zijn dus even hoog en even breed, en de labels staan gelijk. De
rechterkant van het linkervak is rond, dus niet afgeknipt (de reparatie van
0.62.2 werkt). Wat wél scheef stond:

1. **De tijd stond 11,5 pixels (ruim 6 CSS-pixels) boven het midden** van zijn
   vak; de 100% ernaast stond op het midden.
2. **Het tijdveld was wit en de stapper grijs.** Daardoor oogt het witte vak
   kleiner en lager. Dat verklaart de diagnose "lager en smaller".

## Oorzaak

1. **De hoogte van de tijd.** In `html.css` van WebKit (bron op GitHub, main)
   is een tijdveld standaard:

   ```css
   input:is([type="date"], [type="time"], ...) {
       align-items: center;
       display: inline-flex;
       ...
   }
   input::-webkit-date-and-time-value {   /* op iOS */
       margin: 0px; text-align: center; inline-size: 100%;
   }
   ```

   De tijd staat op iOS dus op het midden doordat het veld een flexvak is.
   Sinds 0.62.2 gaf de laadpaalkaart het veld `display: block`, om het de
   breedte te laten volgen. Een block zet zijn waarde bovenaan het vak. In
   Chrome is de opbouw van het veld anders, en daar staat de tijd ook met een
   block op het midden. Gemeten in de werkbank vóór de reparatie: +0,2 px,
   voor de tijd en de 80% allebei. Daarom is het in 0.62.2 niet opgevallen.

2. **De vulling.** Het tijdveld had `var(--dac-surface)`, en dat is in licht
   wit. De stapper heeft `rgba(var(--dac-tint), .05)`, zoals elke stapper in
   de familie (airco, batterij, boiler, klimaat, hvac, vriezer). In donker
   scheelt het weinig (wit op 3,8% tegen 5%), in licht is het wit tegen grijs.

## De reparatie

In `src/cards/laadpaal-card.js`, `.tijd`:

- `display: flex; align-items: center; justify-content: center;` in plaats van
  `display: block`. Dat is hoe WebKit het veld zelf opbouwt, en een flexvak
  volgt de breedte net zo goed als een block.
- `background-color: rgba(var(--dac-tint), .05)`, dezelfde als de stapper.

Het tijdveld op de entiteitenkaart heeft geen eigen `display` en geen vaste
hoogte, en heeft het probleem dus niet. Valkuil 78 in CLAUDE.md legt het vast.

## Tests

`tests/js/tijdveld-css.test.mjs` (nieuw):

- **REGRESSIEWACHT** "geen display die de tijd bovenaan zet". Hij zoekt in
  elke kaart de `<input type="time">` op en zijn klasse, en eist dat elke regel
  die dat veld een `display` geeft `flex` of `inline-flex` is met
  `align-items: center` (verbergen mag). Hij vindt er minstens twee.
- Twee zelftoetsen: hij vangt het veld van 0.80.2, en laat een flexvak, de
  binnenkant van het veld en `display: none` met rust.
- **NIEUW GEDRAG** "op de laadpaalkaart dezelfde achtergrond als de stapper
  ernaast".

Tegen de oude code (`git archive HEAD | tar -x` naar de kladmap, met alleen
het nieuwe testbestand erin):

```
  ✖ REGRESSIEWACHT: geen display die de tijd bovenaan zet
  ✔ de wacht vangt het ook echt: het tijdveld van de laadpaal in 0.80.2
  ✔ en laat een flexvak en de binnenkant van het veld met rust
  ✖ NIEUW GEDRAG: op de laadpaalkaart dezelfde achtergrond als de stapper ernaast
ℹ tests 4
ℹ pass 2
ℹ fail 2
    actual: [ 'laadpaal-card.js: .tijd: display block' ],
    actual: 'var(--dac-surface)',
```

Op de nieuwe code slagen alle vier. De eerste versie van de wacht ving ook
`display: none` op een tijdveld in het beheer van het infoscherm; verbergen
zet niets scheef, en dat is in de wacht uitgezonderd.

## Controles

| | |
|---|---|
| `npm run build` | 0.80.3, 1.185.060 bytes, sha256 `9265ddbbf50c443f85e82bc85965be8df4dde8cb8b9985f720e264240b171f86` |
| `npm run verify` | OK |
| `check:registratie`, `check:css`, `check:controls` | OK |
| `npm test` | 2013 van 2013 groen (was 2009) |
| Python (Docker) | 876 passed (ongewijzigd, er is geen Python aangeraakt) |

## In de browser

Testinstance op poort 8127, de laadpaalkaart van de nagebootste coach (laadpaal
"Oprit", geen auto, schema aan), in het lichte thema van Home Assistant. Na het
herladen van de entry en het wissen van de service worker gemeten dat de code
vers is: `?v=9265ddbbf50c` in de resources, een verse fetch van 1.185.060 bytes
met dezelfde sha256 als op schijf.

Drie kaarten met de hand in de pagina gehangen, in een vak van 375 (de breedte
van de kaart op de schermafdruk), 320 en 280 px. Vakken uit
`getBoundingClientRect()`, cijfers uit een vergrote schermafdruk (1 pixel per
CSS-pixel):

| breedte | tijdveld (b × h) | stapper (b × h) | labels | cijfers tijd | cijfers 80% |
|---|---|---|---|---|---|
| 375 | 168,5 × 38, y 321,5 | 168,5 × 38, y 321,5 | allebei y 304,5, 13 hoog | 335,2–346,2 | 335,2–346,2 |
| 320 | 141 × 38, y 280,3 | 141 × 38, y 280,3 | allebei y 263,3 | 292,6–303,6 | 292,6–303,6 |
| 280 | 121 × 38, y 280,3 | 121 × 38, y 280,3 | allebei y 263,3 | 293,4–304,4 | 293,4–304,4 |

De tijd en de 80% staan op elke breedte op precies dezelfde hoogte, en
horizontaal op het midden van hun vak (binnen 0,5 px). Het verschil van −1,2
en −0,4 px met het berekende vakmidden is de afronding van de vergroting, en is
voor beide vakken gelijk.

- **Vulling:** in licht allebei `rgba(20, 20, 15, 0.05)`, in donker allebei
  `rgba(255, 255, 255, 0.05)`. De rand is in beide `rgba(20, 20, 15, 0.11)`
  (licht).
- **`getComputedStyle`:** `display: flex`, `align-items: center`.
- **Echte klik** op het tijdveld van de kaart van 320: `isTrusted: true`, doel
  `input.tijd`, de focus stond daarna op het veld met het uurdeel geselecteerd.
  Er is niets getypt en niets gewijzigd.

## Samenvatting

"Niet lekker uitgelijnd" waren twee dingen:
- **De tijd stond ruim 6px te hoog.** Op iOS centreert een tijdveld zijn tijd
  met zijn eigen flexbox, en `display: block` (sinds 0.62.2) zette dat uit.
- **Het tijdveld was in licht wit, de stapper ernaast grijs.** Daardoor oogde
  het kleiner.

De vakken zelf en de labels stonden goed, ook op de schermafdruk. Het veld is
nu een flexvak met `align-items: center`, met dezelfde tint als de stapper.
Er is een wacht op elk tijdveld van elke kaart, en valkuil 78 staat in
CLAUDE.md. In de werkbank gemeten op 375, 320 en 280 px.

## Wat niet lukte

- **Niet gemeten op een iPhone.** De fout zit in Safari op iOS, en in Chrome
  stond de tijd ook vóór de reparatie al op het midden. Het bewijs voor iOS is
  de schermafdruk van de eigenaar plus de broncode van WebKit. Na het bijwerken
  is één blik op zijn telefoon de echte toets.
- **Het label "Klaar om" sprong niet anders in** dan "Laden tot": 9 px in het
  vak, allebei, op de schermafdruk en in de werkbank. Daar is niets aan
  veranderd.

## Aannames

- Safari op de iPhone van de eigenaar gebruikt de iOS-regels uit `html.css` van
  WebKit zoals ze nu op main staan. Gelezen op 19 oktober 2026; een oudere iOS
  kan andere regels hebben, maar ook dan is het centreren aan het platform, en
  dat doet een flexvak met `align-items: center` het meest getrouw na.

## git status --porcelain

```
(leeg na de commit)
```
