# De robotstofzuigerkaart (0.67.0)

15 oktober 2026. Een nieuwe kaart, `custom:domotiapp-stofzuiger-card`
("DomotiApp Robotstofzuiger"), gevraagd via de beheersessie. De entiteiten en
de dumps kwamen ook van daar, van twee Dreames bij een klant.

## Wat er gevraagd is

De eigenaar, doorgegeven door de beheersessie:

- **Net als de laadpaal en de thuisbatterij:** eerst een merk, dan een type, en
  bij dat type hoort een productfoto. Het eerste merk is Dreame, met twee types:
  - de X50 Ultra Complete (`dreame.vacuum.r5048h`);
  - de L40s Pro Ultra (`dreame.vacuum.r9419h`). Dat de r9419h een L40s Pro
    Ultra is, is zijn woord: de code staat nergens online.
- **Overzichtelijk:** de entiteiten die nodig zijn, plus de kaart van het huis.
  Niet alle 302.
- **Op de kaart:** naast foto, status, accu en start, pauze en naar het station
  vier blokken:
  - kamers kiezen en laten schoonmaken, met de live kaart erbij;
  - de stand (zuigen, dweilen, allebei, dweilen na zuigen), de zuigkracht en
    hoe nat hij dweilt;
  - het station: zelfreiniging, drogen en leegzuigen, met de watertanks en de
    stofzak;
  - onderhoud: hoofd- en zijborstel, filter en sensoren, in procenten.

  De instellingen (de vijftig schakelaars) blijven eraf.
- **Eén kaart per robot.**
- **Foto's:** fabrieksfoto's van Dreame mogen in de repo, met zijn
  toestemming als installateur (15 oktober 2026), net als bij Anker en
  Mitsubishi.

## Wat er gebouwd is

```
[foto] X50 Ultra Complete                           55 %
       Droogt de dweilpads · 33 % · nog 2 uur        laadt op
( > Starten )  ( Naar station )
[ de live kaart van het huis                        ]
Kamers                                          Wis keuze
( Kantoor ) ( Gang ) ( Keuken ) ...      -> Start 2 kamers
CleanGenius  ( Uit ) ( Routine ) ( Grondig )
Stand        ( Zuigen ) ( Dweilen ) ( Allebei ) ( Na zuigen )
Zuigkracht   ( Stil ) ( Standaard ) ( Sterk ) ( Turbo )
Dweilen      ( Iets droog ) ( Vochtig ) ( Nat )
Station      [In orde Schoon water] [In orde Vuil water] [In orde Stofzak]
             ( Reinigen ) ( Drogen ) ( Leegzuigen )
Onderhoud    [67 % Hoofdborstel] [51 % Zijborstel] [35 % Filter] [78 % Sensoren]
```

- **De rest van het apparaat zoekt de kaart zelf** op `translation_key`, niet
  op naam. Bij de ene robot heet alles `x50_ultra_complete_*` en bij de andere
  `dreame_boven_*`. De editor vraagt daarom alleen om de `vacuum`-entiteit.
- **De status komt uit de sensor `state` en niet uit de stofzuiger.** De
  stofzuiger zei "docked" terwijl het station de pads droogde; de kaart zegt
  "Droogt de dweilpads · 33 % · nog 2 uur". Tijdens een beurt staat er de kamer
  en de voortgang.
- **De accu komt uit `battery_level`.** Niet uit `battery_charge_level`: dat is
  de laadgrens, een instelling.
- **De naam komt van het apparaat.** De `friendly_name` van de X50 is "X50
  Ultra Complete  X50 Ultra Complete".
- **Kamers:** alleen die van de kaart die de robot nu gebruikt
  (`selected_map`). De X50 heeft drie kaarten (verdiepingen). Kiezen en dan
  "Start 2 kamers" roept `dreame_vacuum.vacuum_clean_segment` aan. Tijdens een
  beurt staan de kamers waar hij mee bezig is aangedrukt, en valt er niets te
  kiezen.
- **De tanks en de stofzak staan er altijd**, zoals gevraagd: "In orde", of
  in let op wat er mis is ("Vol of weg", "Bijna leeg", "Op"). De
  waterwaarschuwing staat bij de schoonwatertank.
- **Een tik op de foto doet wat de eerste knop doet:** starten, pauzeren of
  hervatten. Een tik op de rest van de kop opent de stofzuiger in Home
  Assistant, een tik op de plattegrond opent de camera.
- **Editor:**
  - Robotstofzuiger, Naam, Merk (Automatisch, Dreame, Ander merk (eigen
    afbeelding), Geen afbeelding), en Type als het een merk uit de lijst is;
  - Kaart van het huis: leeg is de live kaart van dezelfde robot;
  - Verbergen: vinkjes per blok.

  Kies je Dreame, dan staat het type van het apparaat er meteen, en anders
  het eerste. Automatisch kiest de foto op de modelcode; een onbekende Dreame
  krijgt het icoon, liever dan een verkeerde foto.
- **Een tweede type erbij** is één regel in `STOFZUIGERS`
  (`src/cards/stofzuiger-logica.js`) plus een WebP onder
  `afbeeldingen/robotstofzuigers/`, en die naam in `VASTE_WEBP`.
- **Een stofzuiger van een ander merk** krijgt de kop, start/pauze/station en
  de zuigkracht van de stofzuiger zelf (`fan_speed_list`). De blokken waar
  niets voor gevonden is blijven weg. Gemeten met de demo-stofzuiger.
- **Foto's:**
  - `robotstofzuigers/dreame-x50-ultra-complete.webp` (321 × 396, 10.186 bytes);
  - `robotstofzuigers/dreame-l40s-pro-ultra.webp` (279 × 396, 11.576 bytes).

  Allebei bijgesneden op de alfa van de PNG die de eigenaar in de map zette.
  De bronnen staan in `C:\dev\_ref\robotstofzuigers\`, niet in de repo.
- **Nieuw icoon** `stofzuiger` (een robot van bovenaf), op de drie plekken:
  `icons.js`, `GROEPEN`, `TERMEN`.

## Afwijkingen van zijn lijstje, met reden

- **CleanGenius staat erop, al noemde hij het niet.** In de dump van de L40s
  stond CleanGenius op Routine, en dan zet de integratie stand, zuigkracht en
  dweilen alle drie op `unavailable`: CleanGenius kiest ze zelf. Zonder die
  rij had die robot niets van wat hij vroeg, en was er op de kaart geen weg
  terug. Met CleanGenius aan staan er zijn eigen twee standen
  (`cleangenius_mode`) en de zin "CleanGenius kiest zelf de zuigkracht en hoe
  nat hij dweilt." Wil hij het niet, dan is het één vinkje bij Verbergen, of
  één regel in de code.
- **Zoeken en de laatste beurt staan er niet op.** Hij noemde ze niet; beheer
  had ze voorgesteld.
- **Onderhoud: alleen zijn vier.** De wielen en de antikalk van de X50 meet de
  robot wel, maar staan er niet op.

## Gemeten

In de testinstance (HA 2026.8, poort 8127), met een nagebootste
`dreame_vacuum` die beide dumps naspeelt. Die gebruikt dezelfde entity_id's,
`translation_key`'s, toestanden, attributen en dienst. Hij staat in
`.ha-dev-config/custom_components/dreame_vacuum/` en dus niet in git.

**Verse code:** gemeten op twee momenten.
- De kliks: met `?v=1f24e9e6925b`, gelijk aan de sha256 van de bundel op
  schijf op dat moment.
- Na de versieverhoging naar 0.67.0: opnieuw `?v=e574e1f9e405`, gelijk aan de
  uitgegeven bundel. Alle drie de kaarten stonden toen weer op het raster
  (17, 18 en 4 rijen).

Tussen die twee is alleen het versienummer veranderd.

**Echte kliks, allemaal `isTrusted: true`.** Wat er bij Home Assistant
aankwam, is uit een abonnement op de gebeurtenissen van de nep gelezen.

| Klik | Wat er aankwam | Wat de kaart toonde |
|---|---|---|
| Kantoor, Keuken | (niets, alleen kiezen) | twee kamers aangedrukt, hoofdknop "Start 2 kamers", Wis keuze erbij |
| Start 2 kamers | `vacuum_clean_segment`, segmenten `[2, 13]` | "Zuigt en dweilt · Kantoor · 12 %", Pauzeren, kamers grijs en aangedrukt |
| Pauzeren | `pause` | "Gepauzeerd", Hervatten |
| Naar station | `return_to_base` | "Terug naar het station", knop grijs; na 8 s "Laadt op", Starten |
| CleanGenius Uit (L40s) | `select`, cleangenius `off` | stand, zuigkracht en dweilen terug; kaart van 16 naar 18 rijen |
| Stand Dweilen (L40s) | `select`, cleaning_mode `mopping` | Dweilen aangedrukt |
| Stand Zuigen (X50) | `select`, cleaning_mode `sweeping` | de rij Dweilen weg; kaart van 18 naar 17 rijen |
| Leegzuigen (L40s) | `button`, `start_auto_empty` | "Leegt de stofbak", Leegzuigen aangedrukt |
| Foto van de L40s | `start` | "Dweilt · Badkamer A · 12 %", gloed op de chip, icoon in de statusregel |
| Plattegrond | (geen aanroep) | more-info van `camera.x50_ultra_complete_map` |
| Naam in de kop | (geen aanroep; de robot bleef `docked`) | more-info van `vacuum.x50_ultra_complete` |

**Op het raster:** X50 1144 (18 rijen), L40s 1016 (16), demo 248 (4). Na elke
wijziging die de hoogte veranderde weer op een rij: 1144 (18) en 1080 (17).

**Licht en donker:** in licht zijn de kaarten wit met een rand, en de zwarte
stations staan zichtbaar op hun eigen vlak (schermafdruk bekeken). Daarna
teruggezet op donker.

**Smal:** de kaart met de hand in een vak van 360 px gehangen (valkuil 40):
- 345 px kaartbreedte;
- geen enkele tekst afgekapt (`scrollWidth` tegen `clientWidth` op elke knop,
  kamer, tank en tegel);
- het onderhoud 2 × 2, de foto 54 × 62;
- niets loopt over, en 1016 hoog (op het raster).

**Editor, in HA's eigen dialoog:**
- in het naamveld "Robot boven" getypt met echte toetsen: 11 aanslagen,
  allemaal `isTrusted`, de spatie incluis; de config zei
  `"name": "Robot boven"`;
- Merk → Dreame: het veld Type verscheen met "L40s Pro Ultra", herkend aan de
  modelcode, en `model: l40s_pro_ultra` in de config;
- Type → X50 Ultra Complete: het voorbeeld toonde de X50-foto;
- Verbergen → Onderhoud: `verberg: ["onderhoud"]`, het blok weg uit het
  voorbeeld, en de kaart op het raster.

Daarna Annuleren; het testdashboard is ongewijzigd.

**Console:** geen fouten na een verse lading.

## Toetsen

- `tests/js/stofzuiger-logica.test.mjs`: **NIEUW GEDRAG**, 59 toetsen tegen de
  twee echte dumps (ingekort tot wat een proef nodig heeft). Tegen `main`
  (60c6b5a) faalt het bestand bij het importeren:

  ```
  Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...\src\cards\stofzuiger-logica.js'
  ℹ tests 1
  ℹ pass 0
  ℹ fail 1
  ```

- `tests/test_afbeeldingen.py`: twee namen erbij in `VASTE_WEBP`. **NIEUW
  GEDRAG**; tegen `main`:

  ```
  FAILED tests/test_afbeeldingen.py::test_de_laadpaalfoto_is_meegeleverd[robotstofzuigers/dreame-x50-ultra-complete.webp]
  FAILED tests/test_afbeeldingen.py::test_de_laadpaalfoto_is_meegeleverd[robotstofzuigers/dreame-l40s-pro-ultra.webp]
  FAILED tests/test_afbeeldingen.py::test_de_laadpaalfoto_wordt_geserveerd[robotstofzuigers/dreame-x50-ultra-complete.webp]
  FAILED tests/test_afbeeldingen.py::test_de_laadpaalfoto_wordt_geserveerd[robotstofzuigers/dreame-l40s-pro-ultra.webp]
  4 failed, 31 passed
  ```

- De icoontoetsen (**REGRESSIEWACHT**) vragen van een nieuw icoon dat het op
  de drie plekken staat. Ze zijn groen.

Alles samen: 1770 JS-toetsen en 811 Python-toetsen groen. `check:css`,
`check:registratie`, `check:controls` en `verify` OK.

## Samenvatting

Een robotstofzuigerkaart voor elk merk, met Dreame als eerste. Er zijn twee
types met productfoto: de X50 Ultra Complete en de L40s Pro Ultra. Op de kaart
staat wat de eigenaar noemde: status, accu, starten, pauzeren en naar het
station; kamers met de live kaart; stand, zuigkracht en dweilen; het station
met de tanks en de stofzak; en het onderhoud. CleanGenius staat erbij, omdat
de L40s anders niets bedienbaars had. Alles is met echte kliks gemeten tegen
een nagebootste Dreame met de echte entiteiten.

## Wat niet lukte

- **Niet gemeten tegen een echte Dreame.** De robots staan bij een klant, en
  daar wijzigen is een beheersessie. Twee dingen zijn daarom niet bewezen:
  - of de knoppen van het station en `vacuum_clean_segment` daar doen wat de
    nep doet;
  - of CleanGenius uitzetten de drie rijen echt terugbrengt.
- **Niet op een iPhone of iPad gemeten.**
- **Eén schermafdruk liep vast** (`Page.captureScreenshot timed out`). Eerst
  is nagemeten of het aan de kaart lag: nul keer `paint()` en nul
  `card-updated` in drie seconden stilte. De volgende afdruk lukte.
- **In de testinstance heet de L40s "Dreame boven" met een hoofdletter.** Dat
  komt door de nep, die de naam in het register anders zet dan de echte
  integratie: daar is `name` null en het apparaat heet "dreame boven". Aan de
  kaart ligt het niet.

## Aannames

- CleanGenius: dat de rijen terugkomen als hij uit gaat, volgt uit de dump (de
  X50 met CleanGenius uit heeft ze wel) en uit hoe de integratie het doet. Dat
  laatste is niet bij de klant nagemeten.
- De drie stationknoppen gaan met `button.press`. Ze heten "Reinigen",
  "Drogen" en "Leegzuigen", met zijn woorden. Drukken terwijl het station al
  bezig is, laat de integratie beslissen (bij Dreame stopt dat het).
- `vacuum_clean_segment` gaat zonder zuigkracht en water mee. De robot neemt
  dan zijn eigen instellingen, die op de kaart staan.
- Kamers staan er alleen als Home Assistant `dreame_vacuum.vacuum_clean_segment`
  kent. `vacuum.clean_area` (core) wordt niet gebruikt: daarvoor zijn de
  kamers niet aan gebieden van Home Assistant gekoppeld.
- Een tik op de foto start, pauzeert of hervat (Vormregels: het icoon
  schakelt). Bij de airco zet hij aan en uit.

## git status --porcelain

Vóór de commit:

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/editor/icoon-zoek.js
 M src/icons.js
 M src/index.js
 M tests/test_afbeeldingen.py
?? custom_components/domotiapp_lovelace/afbeeldingen/robotstofzuigers/
?? docs/robotstofzuiger/
?? src/cards/stofzuiger-card.js
?? src/cards/stofzuiger-logica.js
?? tests/js/stofzuiger-logica.test.mjs
?? tests/js/vaste-invoer/dreame-r9419h.json
?? tests/js/vaste-invoer/dreame-x50-ultra-complete.json
```

Na de commit: leeg.
