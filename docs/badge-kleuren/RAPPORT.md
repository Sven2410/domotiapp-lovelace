# Kleuren op de badge, en de soorten Energie en Alarm (0.51.0)

Gevraagd op 29 september 2026, met een schermafdruk van de kop van zijn view
(Verbruik -411 W, Lampen aan 13, WiFi, Thuis):

*"en bij die badges kan ik de kleur niet instellen nu is de lampen blauw maar die
wil ik de kleur van de verlichting hebben en dat moet standaard zijn omdat ik de
badge heb gemaakt als lampenteller. Dan wil ik ook een optie ipv lampenteller
voor energie. (...) en dan dat ik 3 waardes kan invullen en de kleur groen oranje
en rood dus <0 tm 1000w (1kw) is groen 1kw tot 5kw is oranje en daarboven rood
bijvoorbeeld. Alarm badge ook. Uitgeschakeld en ingeschakeld en
deelingeschakeld ook de kleuren in kunnen vullen. status zelf invullen die ik
uit de atributen haal want dat is nog wel eens anders. Alle andere dingen gewoon
blauw tenzij anders aangegeven in de GUI. DIe kleur dinges werkt nu niet
namelijk"*

Uit elkaar gehaald, en wat ermee gebeurd is:

| | vraag | nu |
|---|---|---|
| 1 | het kleurveld werkt niet | gerepareerd, zie hieronder waarom het niet werkte |
| 2 | lampenteller in de kleur van de verlichting, standaard | ja: het gemiddelde van de lampen die branden |
| 3 | energie, met grenzen en groen/oranje/rood | soort **Energie** |
| 4 | alarm, met status zelf in te vullen en een kleur per stand | soort **Alarm** |
| 5 | alle andere badges blauw | "Automatisch" is blauw |

## 1. Waarom het kleurveld niet werkte

Gemeten op de code van vóór deze ronde, met de badge met de hand in de pagina
gehangen:

| badge | kleur van het icoon (oud) | nu |
|---|---|---|
| `color: red` (zoals in zijn Mushroom-YAML) | grijs `rgba(232,228,222,.62)`: **genegeerd** | rood `rgb(208,59,59)` |
| `tone: red` | **blauw** `rgb(25,143,217)` | rood |
| `tone` als sjabloon dat "amber" teruggeeft | grijs | geel `rgb(250,178,25)` |
| Verbruik zonder entiteit | grijs | blauw |
| lampenteller | blauw | `rgb(240,145,96)`, de kleur van de brandende lampen |

Twee oorzaken:

- **De badge las `color` niet.** Zijn badges kwamen van
  `mushroom-template-badge`, waar de kleur onder `color:` staat. De belofte bij
  0.43.0 was dat zijn YAML over te nemen is met alleen een andere `type:`, maar
  de kleur viel stil weg.
- **Het veld kende alleen onze eigen woorden.** `goed`, `kritiek`, `groen`,
  `rood` werkten; `red`, `orange`, `amber` (de namen van Mushroom) gaven stil
  het accent.

Nu leest de badge `tone_template`, dan `tone`, en dan `color`, en kent hij de
namen van Mushroom, onze Nederlandse namen, `#hex`, `rgb()` en elke CSS-kleur
die de browser kent (`kleurCss` in `badge-logica.js`). In de editor is het veld
een **keuzelijst** geworden (Automatisch, Blauw, Groen, Geel, Oranje, Rood,
Lampkleur, Grijs), met een apart veld **Kleur via een sjabloon** voor een kleur
die meebeweegt. Een oude waarde die niet in de lijst staat (een `#hex`) houdt
zijn eigen regel in de lijst.

## 2 t/m 5. Soort badge

Bovenaan de editor staat nu **Soort badge**:

| soort | wat hij toont | kleur |
|---|---|---|
| Eigen tekst (sjablonen) | zoals tot nu toe | Automatisch = blauw; een apparaat dat uit staat is gedempt; een lamp in zijn eigen kleur |
| Lampenteller | het aantal lampen dat aan staat | Automatisch = de kleur van de verlichting; grijs als alles uit is |
| Energie | het vermogen: "-411 W", "4,2 kW" | per band: tot en met de eerste grens, tot en met de tweede, daarboven |
| Alarm | Uitgeschakeld / Deels ingeschakeld / Ingeschakeld | per stand, en het icoon volgt de stand |

Per soort staat het blok met zijn instellingen eronder (de vorm uit de
vormregels). Een badge uit 0.49.0 met `light_counter: true` is een lampenteller
en blijft dat.

**Energie**: een sensor (W of kW; de grenzen zijn altijd in watt), twee grenzen
(standaard 1000 en 5000) en drie kleuren (standaard groen, oranje, rood).
Terugleveren valt in de eerste band. Hij noemde "3 waardes": dat zijn er hier
twee grenzen en drie kleuren, want de derde band loopt door tot boven. Wil hij
toch een derde grens (een vierde kleur), dan is dat een uitbreiding.

**Alarm**: een entiteit, een optioneel attribuut ("status uit de attributen"),
en per stand de waarde(n) waarbij hij hoort, met een komma ertussen, plus een
kleur. Standaard: `disarmed` groen, `armed_home, armed_night` oranje,
`armed_away, armed_vacation` rood. Hoofdletters maken niet uit. Een stand die
nergens bij hoort (`triggered`) toont de tekst van Home Assistant in blauw.
Staat er een attribuut dat niet bestaat, dan zegt de badge "Attribuut
ontbreekt".

Een soort kiezen vult zijn standaarden in de velden in (zichtbaar, en aan te
passen). De kop en het icoon worden alleen vervangen als ze leeg zijn of nog de
standaard van de vorige soort dragen. De velden van een andere soort blijven
bewaard, voor als je terugwisselt.

## Bewijs

### Unittests (`tests/js/badge-kleuren.test.mjs`)

14 tests: `kleurCss` (Mushroom-namen, de keuzes, hex/rgb, CSS-namen, niets),
`lampKleur`, `badgeSoort`, `vermogen` en `energieBand` met zijn eigen voorbeeld,
en `alarmStand` met standaardwaarden en met een eigen attribuut. Op de code van
vóór deze ronde falen ze alle 14 (de functies bestonden niet; het gedrag van
toen staat in de tabel onder punt 1). Hele suite: **1241 JS-tests groen**.

### In de testinstance, zonder kliks

Bundel vers (sha256 gelijk aan schijf). Energie met een sensor via
`POST /api/states`, alarm op het demo-alarm `alarm_control_panel.security`:

```
energie 1000 W:  1,0 kW groen      alarm armed_home:  Deels ingeschakeld  oranje  alarmPartial
energie 1001 W:  1,0 kW oranje     alarm armed_night: Deels ingeschakeld  oranje  alarmPartial
energie 4217 W:  4,2 kW oranje     alarm armed_away:  Ingeschakeld        rood    alarmOn
energie 5001 W:  5,0 kW rood       alarm triggered:   Geactiveerd         blauw   shield
energie 1,25 kW: 1,3 kW oranje     alarm disarmed:    Uitgeschakeld       groen   alarmOff
energie -2300 W: -2,3 kW groen
```

Alle badges 36px hoog, de maat van die van Home Assistant.

### In de editor, met echte kliks

Nadat de eigenaar zei het tabblad naar voren te halen. Elke klik en toets
gelogd met `isTrusted: true`:

| stap | uitkomst |
|---|---|
| editor van een badge met `color: red` openen | soort "Eigen tekst", kleur "Rood" in de lijst |
| soort → Energie (keuzelijst) | blok Energie; 1000/5000, groen/oranje/rood ingevuld; kop en icoon behouden |
| sensor kiezen (typen + aanklikken) | voorbeeld "-411 W" groen |
| eerste grens → `-500` getypt | voorbeeld oranje |
| grens en kleur op één rij | allebei y=629 en y=717: 0px verschil (valkuil 39) |
| soort → Alarm | kop werd "Alarm" (was de standaard van energie), bliksem weg, statussen ingevuld |
| alarm kiezen | voorbeeld "Uitgeschakeld" groen, `alarmOff` |
| attribuut "arm mode" getypt (spatie `isTrusted`) en weer gewist | toen leeg, nu "Attribuut ontbreekt" |
| ", uit" achter "disarmed" getypt (spatie `isTrusted`) | `disarmed, uit`; nog steeds Uitgeschakeld |
| kleur Uitgeschakeld → Blauw (keuzelijst) | voorbeeld blauw |
| Opslaan | `mode: alarm`, geen `color` of `light_counter` meer; in de kop "Alarm / Uitgeschakeld" blauw |

Het toetsenlogboek bevat alleen mijn eigen aanslagen. Het tabblad van de
eigenaar is daarna teruggezet (Ctrl+Shift+Tab in zijn venster).

## Samenvatting

- Het kleurveld werkt: het leest ook `color` van Mushroom en de Engelse namen,
  en in de editor is het een keuzelijst.
- De lampenteller staat standaard in de kleur van de verlichting.
- Nieuw: de soorten Energie en Alarm, met een kleur per band of stand.
- Alles wat niets anders vraagt is blauw.
- CLAUDE.md: de badge is de tweede uitzondering op "geen kleurkiezer", met de
  reden erbij (status, geen identiteit).

## Wat niet lukte

- **"Attribuut ontbreekt"** is na de klikproef toegevoegd en daarna alleen met
  een met de hand gehangen badge gemeten, niet opnieuw in de editor.
- **Zijn eigen badges** zijn niet uitgelezen. Dat de kleur bij hem via `color:`
  liep is afgeleid uit waar ze vandaan kwamen (Mushroom), niet gezien.
- Een echt alarm met een status in een attribuut is niet beproefd: het
  demo-alarm heeft geen attribuut met een stand erin.

## Aannames

- "3 waardes" = drie banden met twee grenzen ertussen. Staat hierboven.
- Een apparaat dat UIT staat blijft gedempt, ook met "alle andere dingen
  gewoon blauw": dat is de vormregel over aan/uit, en die heb ik niet willen
  overschrijven zonder dat hij het zegt.
- Oranje is `--dac-solar` (#dc7300) en Geel is `--dac-warn` (#fab219): zijn
  "oranje" bij energie is het echte oranje, niet het amber van "let op".
- "Blauw" is voortaan het accent (#198fd9) en niet meer het huisblauw
  (#235efa). Wie dat laatste wil: `donkerblauw`.

## git status --porcelain

Bij het schrijven van dit rapport, vóór de commit:

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/badges/badge-logica.js
 M src/badges/template-badge.js
?? docs/badge-kleuren/
?? tests/js/badge-kleuren.test.mjs
```
