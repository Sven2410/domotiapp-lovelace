# Rapport 0.80.1: iconen van Home Assistant staan recht

## Aanleiding

De eigenaar op 19 oktober 2026, met een schermafdruk van twee
robotstofzuigerkaarten: *"bij de stofzuiger kaarten zie je de icons van de
kamers wat naar beneden staan en niet helemaal uitgelijnd"*.

De kamers krijgen hun icoon van de Dreame-integratie, en dat is altijd een
icoon van Home Assistant (`mdi:sofa`, `mdi:bed` en zo). Die komen via
`resolve()` in `icons.js` als `<ha-icon>` op de kaart. Onze eigen tekeningen
zijn een `<svg>`, en daar speelde het niet.

## Wat er mis was

### 1. De tekening staat op een tekstregel

In een `ha-icon` zit een `ha-svg-icon`, en in Home Assistant 2026.8 is die:

```
display: var(--ha-icon-display, inline-flex); vertical-align: middle;
width: var(--mdc-icon-size, 24px); height: var(--mdc-icon-size, 24px);
```

Hij staat dus op een tekstregel, en die regel is zo hoog als de
`line-height` die hij erft: 20px op een kaart. Een icoon van 15px op een regel
van 20px zakt. Het VAK van de `ha-icon` stond keurig in het midden; de
tekening erin niet. Daarom viel het met een gewone meting niet op.

Gemeten in de kamerchips (34px hoog):

| | 0.80.0 | 0.80.1 |
|---|---|---|
| vak van de `ha-icon` | 9,5 tot 24,5 (midden 17) | 9,5 tot 24,5 (midden 17) |
| de tekening (`ha-svg-icon`) | 12,7 tot 27,7 (midden 20,2) | 9,5 tot 24,5 (midden 17) |
| midden van het label | 17 | 17 |

### 2. Het vak kleiner, de tekening niet

Een regel met alleen `width` en `height` maakt het vak kleiner. De tekening
volgt `--mdc-icon-size`, en die is standaard 24px. Zo stond er bij de
vaatwasser een tekening van 24 in een vak van 20: 2px te laag en 2px te ver
naar rechts. Bij de grote hoes van de mediakaart stond hij als een icoontje
van 24px linksboven in een vak van 64.

## Het zat in de hele familie

Op een nieuwe view `iconen` op `kaart-test` staan de 36 kaarten van `thema`,
met `mdi:sofa` op elke plek waar een icoon gekozen kan worden. Erboven staan
vriezer, koelkast, stofzuiger, boiler en airco. Per plek is gemeten hoe ver
het midden van de tekening van het midden van het vak lag:

| plek | maat | 0.80.0 | 0.80.1 |
|---|---|---|---|
| separator, chip | 16 | 3,3 omlaag | 0 |
| stofzuiger, kamer | 15 | 3,2 omlaag | 0 |
| entiteiten, chip | 17 | 2,8 omlaag | 0 |
| terugknop (kaart en badge), badge | 18 | 2,3 omlaag | 0 |
| vaatwasser, rookmelder, hvac: chip | 20 | 24 in 20: 2 omlaag, 2 naar rechts | 0 |
| tabbladen | 18 | 1,6 omlaag | 0 |
| media en scene, chip | 20 | 1,3 omlaag | 0 |
| weersvoorspelling, chip | 22 | 24 in 22: 1 omlaag, 1 naar rechts | 0 |
| navbalk, auto | 22 | 0,3 omlaag | 0 |
| verlichting, klimaat, printer | 20 | 0 | 0 |
| media, grote hoes | 64 | een tekening van 24 linksboven | 0, en 64 groot |

Na de reparatie zijn het 24 soorten plekken, en op elk daarvan is de tekening
even groot als het vak en staat hij er precies in (0 in beide richtingen). Dat
geldt ook voor de chip en de stip van de vriezer, de chip van stofzuiger,
boiler en airco, en de 18 kamerchips.

## De reparatie

1. **`resolve()` geeft de `ha-icon` `style="--ha-icon-display: block"` mee.**
   De `ha-svg-icon` staat dan niet meer op een tekstregel maar bovenin zijn
   vak, en dat vak is even groot. Home Assistant doet het in zijn eigen
   frontend net zo: `--ha-icon-display:block` staat er 58 keer in. Het staat in
   `resolve()` en niet in `baseCss`, omdat de editors en de schermen aan
   `document.body` dat stijlblad niet hebben en dezelfde `ha-icon` krijgen.
   `resolve()` is de enige plek die een `ha-icon` maakt (nagezocht met grep).
2. **`--mdc-icon-size` bij elke maat van een icoon in een chip of een stip.**
   Twaalf regels hadden hem niet: de chip van vaatwasser, weersvoorspelling,
   rookmelder, hvac, vriezer en meldingen, en de stip van vaatwasser, vriezer,
   boiler, stofzuiger, batterij en laadpaal. Daarbij komt de grote hoes van de
   mediakaart. Bij de meldingen, de batterij en de laadpaal komt er nu alleen
   een eigen tekening in; daar staat hij erbij zodat de bewaker geen
   uitzondering nodig heeft.

## Bewijs

### Tests tegen de oude code

Gedraaid tegen `git archive HEAD` (0.80.0), met de nieuwe tests erbij. Beide
falen op de bewering zelf:

```
✖ REGRESSIEWACHT: elke maat zet ook --mdc-icon-size
    actual: [ 'batterij-card.js: .st .stip .icon', 'boiler-card.js: .st .stip .icon',
      'dishwasher-card.js: .chip .icon', 'dishwasher-card.js: .st .stip .icon',
      'forecast-card.js: .chip .icon', 'hvac-card.js: .chip .icon',
      'laadpaal-card.js: .st .stip .icon', 'meldingen-card.js: .chip .icon',
      'smoke-card.js: .chip .icon', 'stofzuiger-card.js: .st .stip .icon',
      'vriezer-card.js: .chip .icon', 'vriezer-card.js: .st .stip .icon' ],
    expected: [],
✖ zet de tekening in een ha-icon niet op een tekstregel (NIEUW GEDRAG)
    actual: '<ha-icon class="icon" icon="mdi:sofa"></ha-icon>',
    expected: /style="--ha-icon-display: block"/,
ℹ tests 17
ℹ pass 15
ℹ fail 2
```

Labels:

- **NIEUW GEDRAG** in `tests/js/icoon-resolve.test.mjs`: `resolve("mdi:sofa")`
  heeft de `style`, een eigen tekening niet.
- **REGRESSIEWACHT** in `tests/js/icoon-maat.test.mjs`: elke regel die een
  icoon in een `.chip` of `.stip` een breedte en hoogte geeft, zet ook
  `--mdc-icon-size`. De test heeft een ondergrens op het aantal gevonden
  regels (nu 25), zodat hij niet stil ophoudt met bewaken. Hij laat zien dat
  hij de chip van de vaatwasser uit 0.80.0 vangt en een goede regel met rust
  laat.

### Alle checks lokaal

| | |
|---|---|
| `npm run verify` | OK, versie 0.80.1, 1.184.333 bytes, sha256 `e09e63888bc4…` |
| `check:registratie` | OK |
| `check:controls` | OK |
| `check:css` | OK |
| `npm test` | 2006 groen (was 2002) |
| Python (Docker) | 876 groen (ongewijzigd; er is geen Python veranderd) |

### In de browser

Gemeten in de testinstance, op verse code: de `?v=` in de pagina was gelijk
aan de eerste twaalf tekens van de sha256 op schijf. Die meting is gedaan met
de bundel vóór de versiewissel (`5cc6ae09ed33`); de versiewissel verandert
alleen het nummer.

- **De meting** gaat op de `ha-svg-icon` in de shadow root van elke `ha-icon`
  in een kaart van ons. Per plek: de maat van het vak, de maat van de
  tekening, en het verschil tussen de twee middens. De tabellen hierboven
  komen daaruit.
- **De kamers op de stofzuigerkaart**: uitvergroot nagekeken, icoon en label
  op één lijn.
- **De editor**: de icoonkiezer met de hand in de pagina gehangen met
  `mdi:sofa`. De tekening is 20 bij 20 in een vak van 20 bij 20, met 0 verschil.
  Zonder de nieuwe `style` was dat daar ook al 0, want daar is de
  `line-height` `normal`. De editors gaan er dus niet op achteruit.

Er is niet geklikt: dit is een wijziging in de opmaak, en geen knop doet iets
anders. De kamerchips zijn dezelfde knoppen als in 0.80.0.

## Samenvatting

- **De kamericoontjes op de stofzuigerkaart stonden 3,2 px te laag.** De
  oorzaak zat in hoe een icoon van Home Assistant zich tekent, niet in de
  stofzuigerkaart. Daardoor stond het bij elke kaart met zo'n icoon scheef,
  van 0,3 tot 3,3 px.
- **Twee reparaties:** `resolve()` zet de tekening niet meer op een
  tekstregel, en dertien CSS-regels zetten nu ook `--mdc-icon-size`. Na de
  reparatie staat de tekening op alle 24 gemeten plekken precies in zijn vak.
- **Een nieuwe view `iconen`** op `kaart-test` en valkuil 77 in `CLAUDE.md`,
  zodat de volgende keer meteen op de tekening gemeten wordt.

## Wat niet lukte

- **Niet elke plek is gemeten.** De pop-up van de navbalk (`.regel`), de
  editors van de navbalk en de tabbladen, en de schermen aan `document.body`
  staan niet open in de proefview. Daar zet elke regel al
  `--mdc-icon-size`, en de reparatie in `resolve()` geldt er ook. Alleen de
  icoonkiezer is daarvan echt gemeten.
- **De bewaker kijkt alleen naar `.chip` en `.stip`.** De grote hoes van de
  mediakaart (`.hoesgroot`) valt erbuiten; die is met de hand gerepareerd.
  Een bewaker over ELKE icoonregel gaf 97 regels, en bijna allemaal krijgen
  ze alleen een eigen tekening: dat was ruis.
- **De echte stofzuiger** van de eigenaar is niet nagekeken. Dat kan hij na de
  update zelf zien.

## Aannames

- **Een eigen tekening verandert niet.** Die is een `<svg class="icon">` met
  `display: block` uit `baseCss`, en daar komt de nieuwe `style` niet op. De
  test controleert dat.
- **`--ha-icon-display` blijft bestaan in Home Assistant.** Het staat in
  2026.8 in de stijl van `ha-svg-icon`, en de frontend gebruikt het zelf op
  58 plekken.

## git status --porcelain

Na de commit van deze ronde:

```
(leeg)
```
