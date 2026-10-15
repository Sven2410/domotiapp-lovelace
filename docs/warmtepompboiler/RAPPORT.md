# De warmtepompboilerkaart (0.68.0)

15 oktober 2026. Een nieuwe kaart, `custom:domotiapp-boiler-card`
("DomotiApp Warmtepompboiler"), gevraagd via de beheersessie. De dump kwam
ook van daar, van een LG bij een klant.

## Wat er gevraagd is

De eigenaar, doorgegeven door de beheersessie:

- **Alleen voor een warmtepompboiler (tapwater).** Een warmtepomp voor de
  verwarming wordt later een eigen kaart; deze dus niet algemeen maken.
- **Merk, type en foto** zoals bij de andere kaarten. Het eerste type is de LG
  WH27S (270 liter). Dat de modelcode `WHT_056905_WW` een WH27S is, is zijn
  woord: online staat de code nergens.
- **Op de kaart**, naast de foto en de watertemperatuur:
  - de temperatuur instellen (35 tot 60 graden, stap 1);
  - de stand kiezen, met de woorden Warmtepomp, Auto, Turbo en Vakantie;
  - een grafiek van de watertemperatuur over de afgelopen 24 uur.
- **Foto:** een fabrieksfoto van LG mag, met zijn toestemming als installateur
  (15 oktober 2026).

## Wat LG meldt

De dump (`tests/js/vaste-invoer/lg-wh27s.json`, core-integratie `lg_thinq`)
heeft vijf entiteiten, meer niet:

| Entiteit | `translation_key` | Wat |
|---|---|---|
| `water_heater.water_heater` | (geen) | stand en doel; `supported_features` 3, dus geen aan/uit |
| `select.water_heater_bedrijfsmodus` | `current_job_mode` | dezelfde stand in de namen van LG |
| `number.water_heater_temperatuur` | `target_temperature` | hetzelfde doel |
| `sensor.water_heater_current_temperature` | `current_temperature` | het water |
| `binary_sensor.water_heater_vermogen` | `water_heater_operation_mode` | aan of uit, alleen te lezen |

Er is geen energie, geen vermogen en geen aan/uit-knop. Of de compressor of
het element draait, zegt LG ook niet. De kaart beweert daar dus niets over.

## Wat er gebouwd is

```
[foto] Boiler                                   58°
       Turbo                                    water
[-]                 58° doel                   [+]
( Warmtepomp ) ( Auto ) ( Turbo ) ( Vakantie )
Snel: de warmtepomp en het element samen.
Afgelopen 24 uur                       44° tot 58°
[ de watertemperatuur als lijn            ]  60°
                                             50°
      00:00        06:00        12:00        40°
```

- **De kaart stuurt de `water_heater`**, met de diensten van Home Assistant
  zelf (`set_temperature`, `set_operation_mode`). De select en de number van
  LG lopen vanzelf mee. LG vertaalt zijn eigen namen: `turbo` wordt
  `performance` en `auto` wordt `eco`.
- **De standen** staan in zijn volgorde en met zijn woorden. Onder de knoppen
  staat één regel over de gekozen stand:
  - Warmtepomp: "Zuinig: alleen de warmtepomp.";
  - Auto: "Kiest zelf tussen de warmtepomp en het element.";
  - Turbo: "Snel: de warmtepomp en het element samen.";
  - Vakantie: "Houdt het water warm op een laag pitje."

  Een stand die een ander merk heeft en LG niet, komt achteraan met zijn eigen
  naam.
- **Het doel** werkt als op de airco: tikken loopt voor in het accent, en pas
  als je klaar bent gaat er één aanroep uit. Op de grens gaat de knop grijs.
- **De grafiek:**
  - **de lijn:** de temperatuursensor uit de recorder, en daarna elke nieuwe
    meting erbij. Hij is vloeiend, op een rooster van een kwartier, zonder
    lussen (valkuil 56);
  - **de y-as:** in hele vijftallen, met het doel erbinnen en minstens 10
    graden hoog. De getallen staan in een eigen strook rechts, zodat ze nooit
    over de lijn vallen;
  - **de tijden:** onder de grafiek, elke zes uur;
  - **de kruisdraad:** wijs of tik erin, en hij toont de tijd en de meting die
    toen gold;
  - **de vorm**, volgens de dataviz-regels: een lijn van 2 px, een vlak van
    10 %, een haarlijn als raster, en tekst in inkt;
  - **verversen:** om het kwartier vraagt de kaart de recorder opnieuw.
- **De naam:** LG noemt elke boiler "Water Heater". Dan zegt de kaart "Boiler"
  (voorstel van de beheersessie). Een naam die de klant zelf gaf, of een Naam in
  de editor, gaat voor.
- **De foto is geen schakelaar.** De boiler heeft geen aan/uit-knop, dus de
  hele kop opent de boiler in Home Assistant.
- **Editor:**
  - Boiler, Naam, Merk (Automatisch, LG, Ander merk, Geen) en Type;
  - Watertemperatuur: leeg is de sensor van de boiler zelf;
  - een schakelaar Grafiek.

  Plat, zonder uitklapblokken.
- **Gedeeld met de robotstofzuiger:** merk, type en foto staan sinds deze
  ronde in `src/cards/productfoto.js`. Eén verruiming: een toevoeging tussen
  haakjes achter de modelcode telt niet mee (LG meldt
  `WHT_056905_WW (DEVICE_WATER_HEATER)`). De toetsen van de stofzuiger zijn
  ongewijzigd groen.
- **`lijnPad` en `vloeiendPad`** (infoscherm-logica.js) kunnen een vast bereik
  krijgen. Zonder bereik werken ze zoals altijd.

## Gemeten

In de testinstance, met een nagebootste LG-boiler (`nep_lg`, niet in git). Hij
heeft de vijf entiteiten van de dump, met dezelfde entity_id's,
`translation_key`'s, fabrikant en modelcode. De geschiedenis van een dag is met
de hand in de recorder gezet: 's nachts afkoelen, een douche om 7 uur, opwarmen
met de warmtepomp, een daling 's avonds en opwarmen in Turbo.

**Verse code:** voor elke meting was de `?v=` op de pagina gelijk aan de sha256
op schijf. De laatste keer was dat de uitgegeven bundel (`0b98fcd8ac28`, met
0.68.0 en zonder fotopad); toen stonden beide kaarten op het raster, met chip
en grafiek.

**Echte kliks, allemaal `isTrusted: true`.** Wat er aankwam, is uit een
abonnement op de gebeurtenissen van de nep gelezen.

| Handeling | Wat er aankwam | Wat de kaart toonde |
|---|---|---|
| 2 × plus (58 → 60) | één `set_temperature` met 60 | het getal liep voor in het accent, plus grijs op 60; de number van LG ging mee naar 60 |
| Warmtepomp | `set_operation_mode`, `heat_pump` | "Warmtepomp", de uitleg, de chip in het accent; de select van LG ging naar `heat_pump` |
| muis over de grafiek (echte `pointermove`) | (geen aanroep) | kruisdraad met "03:10 · 54°" |
| 10 × min (60 → 50) | één `set_temperature` met 50 | 50 doel; het water zakte daarna een graad per minuut, en de kop liep mee |

**Een fout gevonden en gerepareerd:**
- **Wat er misging:** de kaart plakte alleen de meting van NU achter de
  geschiedenis. Een piek van 60 graden verdween dus uit de lijn zodra het
  water weer 58 was, tot de recorder een kwartier later opnieuw gevraagd werd.
  Gemeten in licht: "44° tot 59°" terwijl het water net 60 was geweest.
- **Wat er nu gebeurt:** elke nieuwe meting blijft staan.
- **Nagemeten:**
  - opwarmen: 35 → 37 rijen (59 en 60 erbij);
  - afkoelen naar 59: 38 rijen, en de grafiek zegt nog "44° tot 60°".

**Op het raster:** 376 hoog (6 rijen), met de grafiek uit 248 (4 rijen).

**Licht en donker:** schermafdrukken in allebei bekeken. In licht zijn de
kaarten wit met een rand, en de lijn en het vlak leesbaar.

**Smal (met de hand in een vak gehangen, valkuil 40):**
- **De eerste meting:** op 360 px viel "Warmtepomp" af ("Warmtepo…"). De vier
  knoppen waren even breed, en Warmtepomp is drie keer Auto. Ze zijn nu breed
  naar hun woord.
- **Nagemeten:**
  - op 360 px: knoppen van 108, 61, 67 en 82 px;
  - op 320 px: 98, 51, 57 en 72 px.

  Niets afgekapt, en de kaart blijft op het raster (6 rijen).

**Editor, in HA's eigen dialoog:**
- in Naam "Warm water" getypt met echte toetsen, de spatie incluis, allemaal
  `isTrusted`;
- Merk → LG: het type "WH27S (270 liter)" stond er meteen, herkend aan de
  modelcode;
- Grafiek uit: `grafiek: false`, het blok weg uit het voorbeeld.

Daarna Annuleren.

**Console:** geen fouten na een verse lading.

## Toetsen

- `tests/js/boiler-logica.test.mjs`: **NIEUW GEDRAG**, 27 toetsen tegen de
  echte dump. Ze dekken:
  - de onderdelen, de naam, de kop en de standen;
  - de vertaling van LG naar Home Assistant;
  - het doel;
  - de grafiek: het venster, de schaal, de paden binnen het vak, de tijden en
    de kruisdraad;
  - merk, type en foto.

  Tegen `main` (3e87bb4):

  ```
  Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...\src\cards\boiler-logica.js'
  ℹ tests 1
  ℹ pass 0
  ℹ fail 1
  ```

- `tests/js/lijnpad-bereik.test.mjs`: het vaste bereik van `lijnPad` en
  `vloeiendPad`. Tegen `main`:

  ```
  ✖ NIEUW GEDRAG: 40 tot 65 vult het vak, 45 staat dicht bij de onderrand
  ✖ NIEUW GEDRAG: vloeiendPad geeft het bereik door
  ✔ REGRESSIEWACHT: zonder bereik vanaf nul, met de piek op 95%
      actual: 0,
      expected: 40,
  ```

- De toetsen van de robotstofzuiger (59) zijn na het verhuizen naar
  `productfoto.js` ongewijzigd groen. Ze zijn een **REGRESSIEWACHT** voor
  merk, type en foto.

Alles samen: 1802 JS-toetsen en 811 Python-toetsen groen. `check:css`,
`check:registratie`, `check:controls` en `verify` OK.

## Samenvatting

Een kaart voor de warmtepompboiler, met de LG WH27S als eerste type. Op de
kaart staan de watertemperatuur, het doel, de vier standen met zijn woorden en
een grafiek van 24 uur met een kruisdraad. Alles is met echte kliks gemeten
tegen een nagebootste LG met de echte entiteiten. Daarbij zijn twee dingen
gevonden en gerepareerd: een verdwijnende piek in de grafiek, en een
afgekapte knop op een telefoon.

## Wat niet lukte

- **De foto van de WH27S zat er niet bij.** Bij de uitgave stond er nog niets
  in `C:\dev\_ref\warmtepompen\`, ook niet na een kwartier wachten.
  - **Nu:** het type wordt herkend en is te kiezen, maar heeft nog geen `pad`.
    De kaart toont het boilericoon, zonder een adres dat 404 geeft. Gemeten:
    nul verzoeken naar `warmtepompboilers/`.
  - **Als de foto komt:** `pad: "warmtepompboilers/lg-wh27s.webp"` in
    `BOILERS`, de WebP in die map, de naam in `VASTE_WEBP`, en een nieuwe
    uitgave.

- Niet gemeten tegen de echte boiler bij de klant, en niet op een iPhone.
- De geschiedenis in de testinstance is nagebootst. Bij de klant staat de
  integratie er pas sinds 15 oktober 18:20. Tot er een dag voorbij is, toont
  de grafiek dus alleen de uren sinds dan, en dat is ook juist.

## Aannames

- De uitleg onder de standen is mijn verwoording van wat LG ermee bedoelt.
  Vakantie houdt het water warm op een laag pitje; dat de boiler dan een lage
  minimumtemperatuur aanhoudt, is niet in de dump te zien.
- Het doel blijft in te stellen in elke stand, ook in Vakantie. Of LG het daar
  gebruikt, beslist LG.
- `eco` heet op deze kaart "Auto", omdat LG zijn `auto` zo naar Home
  Assistant vertaalt. Bij een ander merk kan `eco` iets anders betekenen. Dat
  zien we bij het tweede merk.
- De grafiek leest de sensor `current_temperature`. Een boiler zonder zo'n
  sensor krijgt geen grafiek (de editor heeft een veld om er een te kiezen).

## git status --porcelain

Vóór de commit:

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/infoscherm-logica.js
 M src/cards/stofzuiger-card.js
 M src/cards/stofzuiger-logica.js
 M src/index.js
?? docs/warmtepompboiler/
?? src/cards/boiler-card.js
?? src/cards/boiler-logica.js
?? src/cards/productfoto.js
?? tests/js/boiler-logica.test.mjs
?? tests/js/lijnpad-bereik.test.mjs
?? tests/js/vaste-invoer/lg-wh27s.json
```

Na de commit: leeg.

---

# 0.68.1: de foto van de WH27S

15 oktober 2026, later op de avond. De foto kwam na de uitgave van 0.68.0. De
beheersessie zette hem in `C:\dev\_ref\warmtepompen\LG WH27S 270L.png`: een
fabrieksfoto van LG, met toestemming van de eigenaar als installateur. De
beheersessie bekeek hem en zei: de zilveren 270 liter met de zwarte strook en
het display bovenaan.

## Wat er veranderd is

- `afbeeldingen/warmtepompboilers/lg-wh27s.webp`: bijgesneden op de alfa en
  geschaald naar 396 hoog, net als de stofzuigers (161 × 396, 8.820 bytes). De
  bron blijft in `_ref`.
- `BOILERS.lg.modellen.wh27s` krijgt zijn `pad`, en die naam staat in
  `VASTE_WEBP`.

## Gemeten

- **Verse code:** `?v=10aa5828a0b7`, gelijk aan de sha256 op schijf.
- **De foto:** geladen in zijn natuurlijke maat van 161 × 396, en getekend op
  zijn vlak van 58 × 72. Het standicoon staat in de statusregel.
- **Schermafdrukken:** in donker en in licht bekeken; de zilveren boiler is in
  allebei goed te zien.
- **Op het raster:** de kaart met foto is 440 (7 rijen), want de foto is hoger
  dan de chip. Die zonder foto is 376 (6 rijen).

## Toetsen

- `boiler-logica.test.mjs`:
  - "de WH27S heeft zijn foto" (**NIEUW GEDRAG**). Tegen `main` (4f31ac2):
    `actual: ''`, `expected: '/domotiapp_lovelace/afbeeldingen/warmtepompboilers/lg-wh27s.webp'`;
  - de toets voor een type zonder pad blijft, met een eigen lijst.
- `test_afbeeldingen.py`: de nieuwe naam. Tegen `main`:

  ```
  FAILED tests/test_afbeeldingen.py::test_de_laadpaalfoto_is_meegeleverd[warmtepompboilers/lg-wh27s.webp]
  FAILED tests/test_afbeeldingen.py::test_de_laadpaalfoto_wordt_geserveerd[warmtepompboilers/lg-wh27s.webp]
  2 failed, 35 passed
  ```

- Alles samen: 1802 JS-toetsen groen, `test_afbeeldingen.py` 37 groen. De
  volledige Python-set draait in CI.

## Samenvatting

De WH27S toont nu zijn productfoto, automatisch herkend aan de modelcode.

## Wat niet lukte

Niets nieuws. Nog steeds niet gemeten tegen de echte boiler, en niet op een
iPhone.

## Aannames

Geen aannames gedaan.

## git status --porcelain

Vóór de commit:

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M docs/warmtepompboiler/RAPPORT.md
 M src/cards/boiler-logica.js
 M tests/js/boiler-logica.test.mjs
 M tests/test_afbeeldingen.py
?? custom_components/domotiapp_lovelace/afbeeldingen/warmtepompboilers/
```

Na de commit: leeg.
