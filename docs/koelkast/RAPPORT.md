# Rapport 0.80.0: de koelkast op de vriezerkaart

## Aanleiding

De vraag kwam op 18 oktober 2026 via de beheersessie van een klant. Die klant
heeft naast de Miele-vriezer (FNS 7710 E, sinds 0.70.0 op de vriezerkaart) nu
ook een Miele-koelkast: een K 7747 C, inbouw. De eigenaar wilde een kaart "net
als de vriezerkaart":

- **Op de kaart:** temperatuur, instellen, deur en melding.
- **Niet op de kaart:** superkoelen en de modus. Dat is dezelfde keuze als
  supervriezen en de modus bij de vriezer.
- **Merk, type en foto,** zoals bij de andere Miele-apparaten.

Of het een eigen kaart werd of een soort in de vriezerkaart, liet hij aan ons.

## Wat er gebouwd is

### Eén kaart, die zelf ziet wat het is

De vriezerkaart toont nu ook een koelkast. Het `type` blijft
`domotiapp-vriezer-card`, en in de kaartkiezer heet hij **DomotiApp Koelkast en
vriezer**. Dat volgt de vaatwasserkaart, die sinds 0.70.0 ook de wasmachine en
de droger toont, onder zijn oude `type`.

Waarom geen tweede kaart: alles wat erop staat is gelijk. Er verschillen maar
twee dingen:

| | Vriezer | Koelkast |
|---|---|---|
| naam als het apparaat er geen heeft | Vriezer | Koelkast |
| de melding van het apparaat | Melding op de vriezer | Melding op de koelkast |

Er staat **geen instelling** voor in de editor. De kaart beslist het zelf
(`koelSoort` in `vriezer-logica.js`):

1. **Miele zegt het in de `translation_key` van de climate:** `refrigerator` of
   `freezer`.
2. **Bij een ander merk telt het bereik:** wie boven nul instelt is een
   koelkast (de K 7747 C gaat van 3 tot 9), wie eronder instelt een vriezer.
3. **Zonder bereik** blijft het een vriezer, zoals de kaart altijd was.

De delen van het apparaat zoekt de kaart op dezelfde manier als bij de
vriezer: de temperatuursensor, de deur, en de twee meldingen
(`probleem`/storing en `notification_active`). Superkoelen en de modus komen
er niet bij; daar is een test voor.

### De foto

`afbeeldingen/koelkasten/miele-k-7747-c.webp` is 170×396 en 9.488 bytes. Dat
is dezelfde hoogte als de vriezer (168×396). Hij is gemaakt uit de foto die de
beheersessie aanleverde (2196×5120): bijgesneden op de doorzichtige rand en
verkleind. Net als de vriezer staat hij met de deur open, zoals Miele hem
aanlevert. Het fotorecht voor Miele gaf de eigenaar op 15 oktober 2026.

Het pad staat in `VASTE_WEBP` van `tests/test_afbeeldingen.py`. Het is een
nieuw adres; er is niets hernoemd.

De lijst met merken en types heet nu `KOELEN_EN_VRIEZEN` (was `VRIEZERS`). Daar
staan beide Miele-types in, met de soort in het label: "FNS 7710 E (vriezer)"
en "K 7747 C (koelkast)". In de config staat de sleutel (`fns_7710_e`), niet
het label. Een bestaand dashboard merkt er dus niets van.

### Een fout in bestaand werk: de spookzones op -328

Miele maakt bij een koelkast en een vriezer elk ook twee "spookzones":
`climate.<apparaat>_zone_2` en `_zone_3`, zonder eigen vak. De kaart sloeg ze
over met `isEchteZone`, dat keek of er een temperatuur was.

In de dump van 15 oktober stond daar `null`. Op 18 oktober meldde dezelfde
installatie **-328**, bij de koelkast en bij de vriezer. Dat is Miele's "geen
waarde": -32768 honderdsten. Met -328 telden de spookzones als echte zones:

- **Bij het toevoegen** van een kaart kon de kaart een spookzone kiezen. Met
  alleen een koelkast kwam hij uit op `climate.koelkast_zone_2`, omdat die
  vóór `climate.koelkast` in de lijst staat en de oude zoekopdracht alleen
  "vriez/freez" kende.
- **Op een spookzone** zou de kaart "Instellen op -328 °C" tonen.

De regel is nu: **een temperatuur onder het absolute nulpunt is geen
temperatuur** (`graden` in `vriezer-logica.js`). Dat geldt voor de zone, voor
het doel en voor de sensor. De oude `null` blijft gewoon werken.

## Bewijs

### Vaste testinvoer

`tests/js/vaste-invoer/miele-koelkast.json` komt uit de dump van de
beheersessie, omgezet naar de vorm van de frontend (devices, entities, states).
Serienummer en `hw_version` waren al weg. De unique_ids, de tijdstippen en de
bronregel met de naam van de klant zijn er ook uitgehaald.

### De tests tegen de oude code

De nieuwe tests zijn gedraaid tegen `git archive HEAD` (de code van vóór deze
ronde), met de nieuwe test en de nieuwe invoer erbij. De drie tests over de
spookzones falen daar op de bewering zelf, niet op een ontbrekende functie:

```
  ✔ heeft een climate met -28 tot -15 in hele graden, en twee spookzones (1.436ms)
  ✔ kiest bij het toevoegen geen spookzone (0.9123ms)
  ✔ heeft een climate van 3 tot 9 in hele graden, en twee spookzones op -328 (0.2318ms)
  ✖ kiest bij het toevoegen geen spookzone, ook niet met -328 als temperatuur (1.3279ms)
  ✖ doet dat ook bij de vriezer, die op 18 oktober ook -328 gaf (0.3125ms)
  ✖ toont op een spookzone geen -328 en geen instelknop (0.3054ms)
ℹ tests 6
ℹ pass 3
ℹ fail 3
    actual: true,      expected: false
    actual: true,      expected: false
    actual: -328,      expected: null
```

De tests van de koelkast zelf falen op de oude code omdat `koelSoort` en
`KOELEN_EN_VRIEZEN` er niet bestaan. In totaal: 16 van de 22 falen op de oude
code en 22 van de 22 slagen op de nieuwe.

Labels in `tests/js/vriezer-logica.test.mjs`:

- **REGRESSIEWACHT:** de koelkast in de dump. Dat is de dump zelf: 3 tot 9,
  `refrigerator`, de zones op -328.
- **NIEUW GEDRAG:** de spookzones op -328 (drie tests) en de koelkast (zeven
  tests).

### Alle checks lokaal

| | |
|---|---|
| `npm run verify` | OK, versie 0.80.0, 1.184.001 bytes, sha256 `a177bdef8a28…` |
| `check:registratie` | OK |
| `check:controls` | OK |
| `check:css` | OK |
| `npm test` | 2002 groen (was 1990) |
| Python (Docker) | 876 groen (was 874; de nieuwe foto telt twee keer: in de repo en geserveerd) |

### In de browser

Gemeten in de testinstance, view `miele` op `kaart-test`. Daar staat nu een
sectie Koelkast met twee kaarten: de standaardbreedte (246 px) en de volle
breedte van de sectie (500 px). De nagebootste Miele (`nep_miele`, niet in git)
heeft er een koelkast bij met de entity_id's, `translation_key`'s, het model en
de model_id uit de dump. Zijn spookzones staan op -328, en die van de vriezer
nu ook.

**Verse code:** de `?v=` van de bundel in de pagina was `a177bdef8a28`, gelijk
aan de eerste twaalf tekens van de sha256 op schijf.

**Wat er staat** (beide kaarten):

| | |
|---|---|
| naam | Koelkast |
| statusregel | Deur dicht |
| temperatuur | 5 °C |
| instellen op | 5 °C |
| foto | `/domotiapp_lovelace/afbeeldingen/koelkasten/miele-k-7747-c.webp`, geladen (naturalWidth 170) |
| hoogte van het kaartvlak | 120 (twee rasterrijen) |

**Instellen, met echte kliks:**

- Twee kliks op "−": allebei `isTrusted: true`, pad `path < svg < button`,
  label "Kouder". Er ging **één** aanroep uit, met 3 graden (gezien als
  gebeurtenis `nep_miele`: `set_temperature`, `climate.koelkast`,
  `temperature: 3`). Daarna stond "−" uit: 3 is de ondergrens.
- Twee kliks op "+": `isTrusted: true`, label "Minder koud". Weer één aanroep,
  met 5 graden.

**Melding en open deur** (met `nep_miele.zet`):

- De statusregel werd "Deur open" en "Melding op de koelkast", op twee regels.
- `--tone` werd `#fab219`, gelijk aan `--dac-warn`, en het icoontje in de
  statusregel ging aan.

**In het lichte thema:** de koelkast staat op het getinte vlak, en de kaart
heeft `dac-thema="licht"`. Daarna is het thema teruggezet (`dac-thema="donker"`).

**In de kaartkiezer** (`window.customCards`): "DomotiApp Koelkast en vriezer",
met de nieuwe omschrijving.

**Bij het toevoegen** (`getStubConfig`):

- Met alle entiteiten koos hij `climate.vriezer`.
- Met alleen `["climate.koelkast_zone_2", "climate.koelkast_zone_3",
  "climate.koelkast"]` koos hij `climate.koelkast`. De oude code had hier
  `climate.koelkast_zone_2` gekozen.

## Samenvatting

- **De vriezerkaart toont nu ook een koelkast,** en ziet zelf welke van de
  twee het is. Het `type` bleef hetzelfde; in de kaartkiezer heet hij
  "DomotiApp Koelkast en vriezer".
- **Superkoelen en de modus staan er niet op,** zoals gevraagd.
- **De Miele K 7747 C** heeft een productfoto en wordt automatisch herkend aan
  zijn `model_id`.
- **De spookzones van Miele** melden nu -328 in plaats van `null`. Een
  temperatuur onder het absolute nulpunt telt sindsdien als geen. Dat
  repareert ook de vriezer.

## Wat niet lukte

- **Een halve kaart met een open deur én een melding wordt drie rasterrijen
  hoog (184).** "Melding op de koelkast" loopt dan over twee regels. De vriezer
  doet precies hetzelfde: nagemeten, ook 184 bij 246 px. Het is dus geen
  nieuwe fout, en ik heb het niet veranderd. Op de volle breedte blijft het
  120.
- **De editor is niet in de browser geopend.** Daar zijn alleen teksten
  veranderd: het label "Koelkast of vriezer", de hulptekst, en de typelabels
  met de soort erachter. Er is geen nieuw veld en geen tekstveld bij gekomen.
- **De echte koelkast** is niet nagekeken. Dat doet de beheersessie na de
  uitgave, op het dashboard Ontwikkeling.

## Aannames

- **-328 betekent "geen waarde".** Dat volgt uit -32768 honderdsten, en de
  waarde staat alleen bij de spookzones (bereik 7-35). Elke temperatuur onder
  -273,15 °C telt als geen; een echte meting kan daar nooit liggen.
- **"Koelkast boven nul, vriezer eronder"** voor een ander merk dan Miele. Daar
  is nog geen dump van, dus het staat niet in een echte meting.

## git status --porcelain

Na de commit van deze ronde (het rapport zelf kwam in een tweede commit):

```
(leeg)
```
