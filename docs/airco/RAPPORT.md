# Airco's: op het infoscherm, in het beheer en als eigen kaart (0.63.0)

13 oktober 2026, tak `fase-84/airco`.

## Wat er gevraagd was

> ik wil bij het infoscherm en beheer infoscherm ook airco's hebben. (...) Ik
> heb daar 2 airco's gekoppeld in HA Mel Cloud Home. Ik krijg veel entiteiten
> en een climate entitie met allemaal atributen. Ik wil dat je hem universeel
> bouwd dat elke airco werkt. Op de ipad moet gewoon de room temp en de
> ingestelde temp laten zien en als je op meer klikt dan opent hij een andere
> tab net als alle andere tabs zoals nieuws etc en dan kan je de airco's
> bedienen. Ik wil dus ook een airco kaart hebben net als de laadpaal kaart en
> accu kaart etc (...) Ik heb nog geen airco's in de coach dus de koppeling
> met de coach moeten we even kijken hoe dat gaat.

Uit elkaar getrokken in zes punten:

1. airco's op het infoscherm: de kamertemperatuur en de ingestelde temperatuur;
2. "meer" opent een pagina, net als bij nieuws, en daar bedien je de airco's;
3. airco's in het beheer van het infoscherm;
4. een losse airco-kaart, zoals de laadpaal- en de batterijkaart;
5. universeel: elke airco moet werken, niet alleen MELCloud;
6. de koppeling met de coach uitzoeken, samen met de coach-sessie.

Daarbij de vraag "in welke map moet ik de airco zetten?". Dat lees ik als:
waar moeten de productfoto's heen. Zie *Foto's* hieronder.

## Wat er bij de klant staat (alleen gelezen)

Gelezen op 13 oktober 2026 rond 20:00, over de API, zonder iets te wijzigen.
Er staan twee Mitsubishi-binnenunits, via de integratie `melcloud_home`. Per
airco:

| Rol | Entiteit (translation_key) | Wat |
|---|---|---|
| de airco | `climate` (`ata_unit`) | standen off/heat/cool/auto/dry/fan_only, 7–35 °C, ventilator auto + speed_1..5, lamellen position_1..5 en opzij left..right, `supported_features` 937 |
| kamertemperatuur | `sensor` (`room_temperature`) | gelijk aan `current_temperature` |
| energie | `sensor` (`energy_consumed`) | kWh per maand |
| standby | `switch` en `binary_sensor` (`standby`) | |
| storing | `binary_sensor` (`error`) | diagnostisch |
| vorst- en oververhittingsbeveiliging | `switch`, `number` en `binary_sensor` | config; nu `unavailable` |

**MELCloud meldt GEEN `hvac_action`.** De kaart weet dus wat er gevraagd is,
maar niet of de compressor draait. Is `hvac_action` er wel, dan gaat die voor.

Het apparaat ververst zich ongeveer **één keer per minuut**: elke minuut op
:10 staat er een nieuwe regel in de geschiedenis. Dat heeft de bediening
gevormd; zie *Wat er getikt is*.

De dump staat geanonimiseerd als vaste testinvoer in
`tests/js/vaste-invoer/melcloud-home-airco.json`: andere namen en id's,
dezelfde attributen, translation_keys en categorieën.

## Wat er gebouwd is

### 1. Gedeelde logica: `src/cards/airco-logica.js`

Eén laag zonder DOM, voor het infoscherm én de kaart. Universeel betekent hier
dat de kaart **leest wat de entiteit zelf aanbiedt**:

- de standen (`hvac_modes`) en de ventilator (`fan_modes`);
- de lamellen (`swing_modes` en `swing_horizontal_modes`) en de programma's
  (`preset_modes`);
- één doel (`temperature`) of een bereik (`target_temp_low`/`_high`);
- wat de airco kan (`supported_features`).

Alleen de woorden worden vertaald: `speed_3` wordt "3", `left_centre` wordt
"Links-midden", `on_low` wordt "Laag".

Getoetst op vier soorten airco's:

| | MELCloud (echt) | demo hvac | demo ecobee | demo heatpump |
|---|---|---|---|---|
| `hvac_action` | nee | ja | nee | ja |
| doel | enkel | enkel | **bereik** | enkel |
| standen | 6 | 6 | 6, met heat_cool **en** auto | alleen heat |

De belangrijkste regels:

- **Aan en uit.** `climate.turn_on` als de airco het kan; dat gaat verder in de
  stand van daarnet. Anders zet de kaart zelf een stand.
- **Een bereik gaat in één aanroep.** Laag en hoog gaan samen in
  `set_temperature`, want Home Assistant wil op zo'n entiteit allebei.
- **Twee keer "Auto" bestaat niet.** Heeft een airco `heat_cool` naast `auto`
  (de ecobee), dan heet heat_cool "Warm/koud". Zonder die regel stonden er twee
  knoppen "Auto"; gezien in de browser, zie hieronder.
- **De rest van het apparaat vindt de kaart zelf** (`apparaatDelen`). Dat gaat
  op apparaat en `device_class`, niet op naam: kamertemperatuur, buitenvoeler,
  vochtigheid, vermogen, energie en storing.
- **De kleur volgt wat de airco doet:** verwarmen in de kleur van de zon,
  koelen, drogen en ventileren blauw, auto in het accent.

Twee nieuwe iconen: `flame` en `snowflake`, met tekening, groep en
zoekwoorden. `snow` was een wolk met vlokken, en dat is het weer.

### 2. Het infoscherm: blok Klimaat en pagina Klimaat

**Het blok.** Per airco de naam, "Ingesteld 24°" (of "Uit") en rechts groot de
temperatuur in de ruimte. Het icoon draagt wat hij doet. Een tik op een airco
of op "Alles bekijken" opent de pagina.

**De pagina** (`PAGINA_KOP.klimaat`, "Airco's") heeft per airco een paneel met:

- aan/uit;
- de temperatuur nu;
- de ingestelde temperatuur met − en + (bij een bereik twee: Van en Tot);
- de standen als vijf gelijke vakken, met het icoon boven het woord;
- als hij aan staat: de ventilator.

Op een iPad van 11 inch staan er twee panelen naast elkaar.

**Wat er getikt is.** Een cloud-airco meldt zich hooguit eens per minuut.
Zonder voorzorg sprong een getikte 22° na een tel terug naar 24°, en een
minuut later weer naar 22°. Daarom:

- blijft wat er getikt is zichtbaar (in het accent) tot de airco het zelf
  meldt, ten hoogste 90 seconden;
- zijn zes tikken op + één aanroep (na 450 ms stilte).

**Lamellen staan er op het scherm niet op.** Een wachtkamer is geen
bedieningspaneel. Op de losse kaart staan ze wel.

### 3. Het beheer

- **Kaarteditor:** het veld *Airco's op het scherm* (`climates`, elke
  `climate`, ten hoogste twintig). Het gaat mee met de synchronisatie naar de
  opslag, net als de lampen.
- **Blok Klimaat** in het beheer, net als Verlichting:
  - per airco een naam op het scherm;
  - een greep om de volgorde te slepen;
  - **Airco's op het scherm tonen**;
  - **Op het scherm laten bedienen**. Staat die uit, dan is de pagina alleen
    om te kijken. Die schakelaar is erbij gekomen omdat het een wachtkamer is.
- **Rechten:** de receptie wijzigt alleen namen en volgorde. Welke airco's er
  zijn kiest de installateur, de admin (server, `_namen_en_volgorde`).
- **Het blok staat niet in de standaardindeling.** Die is vol (36 van 36
  cellen). Het komt erbij via Indeling, *Blok toevoegen*.

### 4. De kaart DomotiApp Airco (`custom:domotiapp-airco-card`)

Gebouwd door een hulpagent naar mijn opdracht, en daarna door mij in Home
Assistant nagemeten. De opbouw is die van de laadpaal- en de batterijkaart:

- **kop:** foto of chip, naam, status, en rechts groot de kamertemperatuur;
- **standen:** Uit en de standen van de airco;
- **doel:** het doel, of twee bij een bereik;
- **ventilator:** knoppen bij korte woorden, anders een keuzelijst;
- **lamellen:** op en neer, en opzij;
- **programma;**
- **tegels:** energie, vermogen, vochtigheid en buiten, alleen wat er is.

Een airco die uit staat toont alleen de kop, de standen en de tegels.

**De chip is een eigen knop.** Een tik op de chip zet de airco aan of uit; een
tik op de rest van de kop opent Home Assistant. Dat is de vormregel "icoon en
kaart zijn twee knoppen".

**De editor:**

- airco (climate);
- naam;
- afbeelding: Automatisch, Eigen afbeelding of Geen;
- kamertemperatuur en energie, allebei optioneel om te overschrijven.

**Hoe hij zich verhoudt tot de HVAC-kaart:** die blijft bestaan, voor de
warmtepomp, de ventilatie en de boiler, met hun vele sensoren. De airco-kaart
is de productkaart, en voor een airco nu de betere keus.

### 5. SPEC

§20.4 en §20.7 zijn aangevuld met het klimaatblok, de opslag (`klimaat`,
`klimaat_tonen`, `klimaat_bedienen`) en de rechten. Dat gebeurde bij elk
eerder infoschermblok ook, zoals bij het afval in ronde 5.

## Foto's

Zet de productfoto's in **`C:\dev\_ref\aircos\`**. Die map heb ik aangemaakt,
naast `laadpalen\` en `thuisbatterijen\`. Het liefst PNG met transparantie, en
in de bestandsnaam het merk en het model.

Twee dingen moet ik van je weten voordat ze in de kaart gaan:

- **Mag het?** De repo is publiek. Voor Alfen, Easee en Anker heb je gezegd dat
  het mocht omdat je installateur bent. Voor Mitsubishi (of een ander merk) heb
  ik dat nog niet van je.
- **Welke modellen?** Bijvoorbeeld de binnenunit bij Dovida. MELCloud Home
  geeft geen model door: `model` is leeg, de fabrikant is "Mitsubishi
  Electric".

Het mechanisme staat al klaar (`AIRCO_FOTOS`, `aircoAfbeelding`, en de keuze
Automatisch/Eigen/Geen in de editor). Er hoeven alleen foto's bij.

## De coach

Ik heb het met de coach-sessie overlegd. Het hele voorstel staat in
`C:\dev\notities\domotiapp-coach\airco.md`.

**Er is nu niets om aan te binden.** Een airco staat in de coach alleen als
apparaat dat gemeten wordt; er is geen HA-apparaat "Airco". De kaart werkt dus
zonder coach, en dat is zo afgesproken.

**Het voorstel, in drie trappen. Jij kiest welke.**

- **A. Zon in de kamer stoppen.** Bij een overschot schuift de coach het doel
  op in de richting die jij koos.
- **B. Dure uren ontwijken:** voorkoelen of voorverwarmen.
- **C. Op temperatuur om een tijdstip.**

Grenzen in het voorstel:

- niet wisselen tussen verwarmen en koelen;
- ventilator en lamellen niet aanraken;
- liefst alleen het doel schuiven;
- wie het laatst bewoog wint.

**Bij Dovida mist een vermogensmeting.** `energy_consumed` per maand is geen
vermogen. Zonder vermogen en zonder `hvac_action` ziet de coach niet of de
compressor draait.

**Voorlopige sleutels, nog niet gebouwd en dus nergens gelezen:** model
"Airco", fabrikant "DomotiApp Coach". Daarbij:

- een sensor `coach`, met o.a. `klimaat`, `doel_bewoner`, `doel_coach`,
  `ruimte` en `plan`;
- de switches `pauze` en `schema`;
- de number `afwijking`;
- de time `klaar_om`, alleen bij trap C.

Eén coach-apparaat per airco; twee in één ruimte krijgen hetzelfde `ruimte`.
Het contract blijft 1.

**Volgende stap:** jij kiest een trap, de coach bouwt hem, en zodra je die
versie draait stuurt de coach een echte dump. Pas dan leg ik de koppeling,
volgens de regel "niets lezen wat niet in een echte dump stond".

## Bewijs

### Tests die falen op de code van vóór deze ronde

Gedraaid tegen `git archive HEAD` van `main` (1f4516c), in een kopie in de
kladmap, dus niet in een worktree (valkuil 68).

**JS: `tests/js/infoscherm-klimaat.test.mjs`.** Eerst valt het hele bestand
om:

```
SyntaxError: The requested module '../../src/cards/infoscherm-logica.js' does not provide an export named 'klimaatBedienbaar'
```

Met die twee imports als nep-functie, per test:

```
  ✖ is een blok met een pagina erachter en een aantal, en schaalt als een lijst
  ✖ staat er als de installateur airco's koos en de receptie het niet uitzette
  ✖ de pagina komt na de verlichting
  ✖ blokOntbreekt zegt waarom het er niet staat
  ✖ bedienen mag, tenzij de receptie het uitzette
  ✔ REGRESSIEWACHT: de standaardindeling blijft zoals hij was, zonder klimaatblok
ℹ pass 1
ℹ fail 5
```

**JS: `airco-logica.test.mjs` (27 tests) en `airco-kaart.test.mjs` (30
tests).** Op de oude code `ERR_MODULE_NOT_FOUND`, want het bestand bestond
niet. Alles NIEUW GEDRAG.

**Python: `tests/infoscherm/test_klimaat.py`.** Op de oude code eerst
`ImportError: cannot import name 'MAX_AIRCOS'`. Met die ene import vervangen
door het getal:

```
FAILED tests/infoscherm/test_klimaat.py::test_een_airco_is_een_climate_met_een_naam_en_dubbel_valt_weg
FAILED tests/infoscherm/test_klimaat.py::test_alleen_climate_mag_een_airco_zijn[light.lamp]
FAILED tests/infoscherm/test_klimaat.py::test_alleen_climate_mag_een_airco_zijn[sensor.kamer_temperatuur]
FAILED tests/infoscherm/test_klimaat.py::test_alleen_climate_mag_een_airco_zijn[switch.kantoor_raam_standby]
FAILED tests/infoscherm/test_klimaat.py::test_niet_meer_dan_de_grens
FAILED tests/infoscherm/test_klimaat.py::test_een_oude_opslag_zonder_klimaat_krijgt_een_lege_lijst
FAILED tests/infoscherm/test_klimaat.py::test_tonen_en_bedienen_staan_standaard_aan_en_zijn_los_uit_te_zetten
FAILED tests/infoscherm/test_klimaat.py::test_het_raster_kent_het_klimaatblok
FAILED tests/infoscherm/test_klimaat.py::test_de_receptie_hernoemt_en_versleept_airco_s_maar_kiest_ze_niet
FAILED tests/infoscherm/test_klimaat.py::test_de_kaartconfig_laat_namen_en_volgorde_van_de_receptie_staan
FAILED tests/infoscherm/test_klimaat.py::test_klimaat_overleeft_opslaan_en_terugladen
FAILED tests/infoscherm/test_klimaat.py::test_via_de_websocket_kiest_alleen_de_beheerder_de_airco_s
12 failed in 1.81s
```

Op de nieuwe code: `12 passed in 1.09s`. Eén bestaande test is bijgewerkt:
`test_de_kaart_stuurt_zijn_installatie_en_de_namen_blijven` vergelijkt de hele
installatie, en daar hoort nu `"klimaat": []` bij.

### In een echte browser, testinstance op 8127

**Verse code.** Na de herstart van de container (Python gewijzigd, valkuil 49)
en het herladen van de entry was de `?v=` van de geladen bundel gelijk aan de
eerste twaalf tekens van de sha256 op schijf:

- `1a4159b8d265`;
- na de verbeteringen `c42f9ca104c7`.

`customElements.get("domotiapp-infoscherm-card").prototype.htmlAircoPaneel_`
bestond.

**Beheer:**

| Wat | Gemeten |
|---|---|
| synchronisatie | een beheerder opende het beheer, en de opslag kreeg de vier airco's uit de kaartconfig; teller "4 airco's" |
| blok Klimaat openen | echte klik op de kop, `isTrusted: true` |
| naam typen | "Werkplek raam" letter voor letter: 13 aanslagen, allemaal `isTrusted: true`; de spatie `{key: " ", trusted: true, doel: "k_naam"}`; opgeslagen als `"naam": "Werkplek raam"` |
| volgorde | HeatPump aan de greep naar boven gesleept; opgeslagen als `climate.heatpump, climate.hvac, climate.ecobee, climate.kantoor_raam` |
| blok toevoegen | Indeling, *Blok toevoegen*, met echte toetsen (Escape, k; native keuzelijst, dus niet met de muis); opgeslagen als `klimaat 4,0 2x2 n3` |

**Scherm (`infoscherm-wachtkamer`):**

- **Blok:** drie tegels met icoon, naam, "Ingesteld 20°", "Uit" of
  "Ingesteld 21–24°", en rechts 25,0° / 22,0° / 23,0°. In de kop "nog 1".
- **Tik op een tegel** (echte klik): de pagina Airco's opent.
- **Twee tikken op +** (echt, `isTrusted: true`):
  - meteen daarna "22°" in het accent, en nog GEEN aanroep;
  - daarna precies één `climate.set_temperature {"temperature": 22}`;
  - de toestand werd 22, en het accent ging eraf.
- **Verwarmen, ventilator Laag, aan/uit** (echt): achtereenvolgens
  `set_hvac_mode heat`, `set_fan_mode on_low` en `turn_off`. Daarna toonde het
  paneel "Uit", een gedimde stelknop en geen ventilatorrij.
- **Na de verbeteringen gemeten:**
  - in de dubbele stelknop staat aan beide kanten van het getal 18,3 px vrij
    tussen getal en knop;
  - de vijf standvakken zijn elk 89 px breed, op één regel;
  - het paneel loopt niet over (`scrollWidth` = `clientWidth`).
- **iPad-maat:** de kaart opgehangen in een vak van 1194 × 834 (valkuil 40:
  het venster niet verkleind). `--ss` is 1,000; er staan twee panelen van
  554 px naast elkaar, met standvakken van 96 px. Op het welkomscherm zijn de
  tegels 58 px hoog en wordt er geen naam afgekapt.
- **Licht uiterlijk:** goed leesbaar (schermafdruk).
- **"Op het scherm laten bedienen" uit:** 0 knoppen op de pagina. De
  ingestelde temperaturen blijven staan, en "Ventilator Auto laag" staat er
  als tekst.

**Het kioskaccount van de iPad mag bedienen.** Ingelogd als het
`ipad`-account (kiosk) met de gegevens uit `INLOG.md`. Daarna
`POST /api/services/climate/set_temperature` op `climate.heatpump`: **200**, en
het doel werd 21,5.

**Airco-kaart (view `airco` op `kaart-test`).**

*Hoogtes.* Allemaal op de rasterrijen:

| Airco | Hoogte | `min_rows` |
|---|---|---|
| HeatPump | 184 | 3 |
| Ecobee | 376 | 6 |
| Werkplek raam (uit) | 248 | 4 |
| Kantoor raam | 184 | 3 |

*Klikken op de kaart van Werkplek raam* (echte kliks, `isTrusted: true`):

- **Koelen:** `set_hvac_mode cool`. De kaart klapte uit naar **440** (7 rijen,
  `min_rows` 7).
- **Twee keer +:** één `set_temperature {"temperature": 23}`.
- **Tik op de chip:** `climate.turn_off`, zonder more-info-dialoog. Terug naar
  **248**.

*Editor* (via het potlood, niet via `?edit=1`, valkuil 21):

- "Airco wachtkamer" getypt: 16 aanslagen, de spatie `isTrusted: true`;
- het voorbeeld tekende de naam; daarna geannuleerd.

*Licht thema:* alle vier de kaarten `dac-thema="licht"`, en goed leesbaar.

### Wat de meting veranderde

Gevonden in de browser en in deze ronde gerepareerd:

1. **Twee knoppen "Auto"** bij de ecobee: `heat_cool` heet nu "Warm/koud". Er
   is een test bij.
2. **De dubbele stelknop:** het getal liep onder de knoppen. Nu kleinere
   knoppen, en 18,3 px vrij aan elke kant.
3. **De vijfde stand** (Ventileren) stond op een eigen regel over de volle
   breedte. Nu staan de standen in gelijke vakken.
4. **Eén stand is geen keuze:** de warmtepomp die alleen verwarmt kreeg een
   standenrij met één knop. Die staat er nu niet meer.

De volledige Python-suite ving daarna een fout die de browsermeting niet zag.
In `store.py` had ik voor de lampen en de airco's een hulpfunctie `_uniek`
gezet, maar die naam bestond al: daarmee worden personen, mededelingen en
verjaardagen ontdubbeld. De nieuwe overschreef de oude, en daarmee viel het
opslaan van personen en verjaardagen om:

```
TypeError: _uniek() takes 1 positional argument but 2 were given
9 failed, 796 passed in 296.08s
```

De functie heet nu `_eerste_per_entiteit`. Die negen tests zijn de bestaande
tests voor personen en verjaardagen, en ze vingen het precies.

**Dit stond ook in de testinstance.** Daar zijn in deze ronde geen personen of
verjaardagen opgeslagen. Hij is herstart met de reparatie.

### Controles

```
npm test                   ℹ tests 1623 · pass 1623 · fail 0
npm run check:registratie  OK: alleen src/scene/registreer.js registreert, en de bundel wacht op "home-assistant".
npm run check:css          OK: 81 hover-regel(s) (...) geen kaart draagt een kleur die alleen in donker klopt.
npm run check:controls     OK: 1 select(s) in de wekkereditor, elk in een .vak, plus 3 keuzelijst(en) op kaarten (...)
npm run verify             OK: bundel is actueel
python -m pytest -q        805 passed in 164.12s (na de reparatie van _uniek; ervoor 9 failed, 796 passed)
```

## Bij de klant (Dovida): wat er na de update moet gebeuren

Niets daarvan heb ik gedaan; het is een wijziging bij de klant.

1. 0.63.0 installeren via HACS en Home Assistant herstarten.
2. In **Tablet Beheer**, in de kaarteditor van de beheerkaart: bij *Airco's op
   het scherm* de twee airco's kiezen.
3. In het beheer, bij **Indeling**: *Blok toevoegen*, dan **Klimaat**. Zet het
   op een plek met ruimte: het raster is vol, dus er moet een blok kleiner of
   weg.
4. In het blok **Klimaat** van het beheer:
   - eventueel namen geven;
   - beslissen of bezoekers mogen bedienen (*Op het scherm laten bedienen*).

## Wat niet lukte of niet gedaan is

- **Niet bij de klant gemeten.** Daar staat 0.63.0 nog niet, en het zijn
  echte airco's in een praktijk. Gemeten is in de testinstance, met de demo-
  airco's en een nagebootste MELCloud-airco. Die laatste is een `POST
  /api/states` met de echte attributen: hij tekent wel, maar is niet te
  bedienen.
- **Hoe snel MELCloud een opdracht verwerkt, is niet gemeten.** De 90 seconden
  wachten is een schatting op basis van het pollen per minuut.
- **De productfoto's:** wachten op jouw foto's en jouw ja (zie *Foto's*).
- **De coach-koppeling:** wacht op jouw keuze van een trap en op een dump.
- **De eerste lokale Python-run** gaf na 16 minuten geen uitslag; ik heb hem
  gestopt. Waar hij op wachtte heb ik niet uitgezocht. De runs daarna (met
  `--timeout 120`) waren in 5 en 3 minuten klaar.

## Aannames

- "In welke map moet ik de airco zetten" ging over de foto's.
- Een blok heet **Klimaat** en de pagina **Airco's**. "Klimaat" omdat er ook
  een thermostaat of een warmtepomp in kan.
- **Lamellen niet op het infoscherm**, wel op de kaart.
- De schakelaar **"Op het scherm laten bedienen"** is erbij gekomen zonder dat
  je erom vroeg. Hij staat standaard **aan**, dus zonder iets te doen werkt het
  zoals je vroeg.
- Een airco die uit staat toont op de tegel "Uit" en niet "Ingesteld 24°",
  omdat die 24° dan niets doet. Op de pagina staat de 24° er gedimd bij.

## git status --porcelain

Na het vastleggen van dit rapport: schoon.
