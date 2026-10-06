# 0.54.1 — Twee bakken op één dag lichten allebei op

## De melding

6 oktober 2026, met een schermafdruk van de afvalkaart:

> *"kijk in mijn HA daar zie je dat nu 2 afvaltypes morgen an de straat moeten
> en er is maar 1 gehighlight (...) ook krijg ik maar 1 melding van afval maar
> die melding moet eigenlijk 2 afvaltypes bevatten snap je"*

Twee onderwerpen: de kaart, en de melding op de telefoon.

## Wat er in zijn Home Assistant stond

Alleen gelezen, over de websocket (`get_states`, `history/history_during_period`,
`logbook/get_events`, `system_log/list`, `manifest/get`,
`domotiapp_lovelace/meldingen/subscribe`). Geen dienst aangeroepen, niets
weggeschreven.

| Entiteit | Toestand |
|---|---|
| `sensor.mijnafvalwijzer_restafval` | `07-10-2026` |
| `sensor.mijnafvalwijzer_papier` | `07-10-2026` |
| `sensor.mijnafvalwijzer_pmd` | `13-10-2026` |
| `sensor.mijnafvalwijzer_gft` | `15-10-2026` |
| `sensor.mijnafvalwijzer_morgen` | `Papier, Restafval` (sinds 00:00:18) |

Geïnstalleerde versie: 0.54.0.

## 1. De kaart: dit was een fout

`paint()` in `waste-card.js` nam `komend[0]`, de eerste van de op datum
gesorteerde lijst, en keek niet of de volgende op dezelfde dag viel. Restafval
kwam in de config vóór Papier, dus Restafval stond uitgelicht en Papier eronder
met "morgen 7 okt", alsof dat een bak voor later was. Het infoscherm
(`htmlAfvalEerst_` in `infoscherm-card.js`) deed precies hetzelfde.

**Wat er veranderd is:**

- `eersteOphaaldag(komend, dag)` in het nieuwe `src/cards/afval-logica.js` geeft
  alle bakken van de eerste ophaaldag. Pure functie, gedeeld door de kaart en
  het infoscherm.
- **Afvalkaart, lijstvorm:** het uitgelichte vlak toont alle bakken van die dag,
  "Restafval en Papier", met een icoon per bak in de eigen kleur. Met meer dan
  één bak is het vlak zelf neutraal: anders kleurt het naar de eerste bak en
  drukt die de tweede weg. Vanaf drie bakken worden de iconen kleiner (32px in
  plaats van 40px). De lijst eronder toont alleen nog wat later komt.
- **Afvalkaart, brede vorm:** alle bakken van die dag lichten op, niet alleen de
  eerste.
- **Infoscherm:** hetzelfde in het blok en op de afvalpagina.
- **Bijvangst, het infoscherm werkte niet bij.** `watched()` noemde de
  afvalsensoren niet, dus een nieuwe ophaaldatum kwam pas in beeld als er
  toevallig iets anders veranderde. Bij hem thuis valt dat weg tegen het
  energieverbruik, dat elke paar seconden verandert; bij een installatie zonder
  energiesensor bleef het staan. Gevonden bij het nameten.
- **Bijvangst, de kaart werkte niet bij om middernacht.** De handtekening
  waarmee de lijst en de brede vorm bepalen of ze opnieuw tekenen bevatte de
  datum maar niet het aantal dagen. Om middernacht wordt "morgen" dan
  "vandaag" zonder dat er een datum verandert. Het aantal dagen zit er nu in.

## 2. De melding: geen fout gevonden

De melding van 19:30 is wél met beide bakken verstuurd, volgens alles wat in
zijn Home Assistant te zien is:

- Het logboek laat om 19:30:00 tot 19:30:02 vijf notify-entiteiten na elkaar
  bijwerken: Sven, Lieke, Peter, Rinette en Bertus. Dat is precies de lijst
  personen op de meldingenkaart, in dezelfde volgorde.
- De stand van de melding zegt `verstuurd.morgen = 2026-10-06`.
- Er is geen eigen automatisering of script meer met "afval" in de naam, en
  het logboek toont om 19:30 geen enkele automatisering die afging. De melding
  kwam dus van ons.
- De sensor zei op dat moment `Papier, Restafval` (geschiedenis: sinds 00:00:18
  ongewijzigd).
- `afval.soorten("Papier, Restafval")` geeft `["Papier", "Restafval"]`, en
  `afval.bericht` maakt daarvan:

  ```
  titel: Morgen Papier en Restafval
  tekst: Morgen worden Papier en Restafval opgehaald. Zet de containers vanavond aan de straat.
  ```

- In het systeemlog staat geen fout bij het versturen om 19:30. De laatste
  "Error sending notification" was om 18:28.

**Wat ik NIET kan zien** is wat er op zijn telefoon is aangekomen; Home
Assistant bewaart de tekst van een pushbericht niet. Staat er op zijn telefoon
toch maar één bak, dan wil ik een schermafdruk van die melding: dan zit er iets
tussen Home Assistant en de telefoon dat hier niet te meten is.

Er staat nu wel een **REGRESSIEWACHT** voor in `tests/meldingen/test_motor.py`,
met letterlijk zijn sensortekst: één melding, beide bakken, het meervoud in de
zin.

## Bewijs

### De nieuwe toets faalt op de oude code

`tests/js/afval-eerste-dag.test.mjs` met `src/cards/afval-logica.js` weggehaald:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\dev\domotiapp-lovelace\src\cards\afval-logica.js' imported from C:\dev\domotiapp-lovelace\tests\js\afval-eerste-dag.test.mjs
ℹ pass 0
ℹ fail 1
```

Op de nieuwe code: 6 van 6 groen. De gegevens zijn de zijne van vandaag.

| Toets | Soort |
|---|---|
| geeft beide bakken van morgen, niet alleen de eerste | **NIEUW GEDRAG** |
| laat wat later komt in de lijst staan | **NIEUW GEDRAG** |
| geeft één bak als hij alleen komt | **REGRESSIEWACHT** |
| neemt drie bakken op één dag allemaal mee | **NIEUW GEDRAG** |
| geeft een lege lijst als er niets komt | **NIEUW GEDRAG** |
| werkt ook met de sleutel van de afvalkaart (days) | **NIEUW GEDRAG** |
| `test_twee_bakken_op_een_dag_staan_samen_in_een_melding` (Python) | **REGRESSIEWACHT**: de servercode is niet veranderd |

### Verse code

In de testinstance (`ha-lovelace`, poort 8127), na het herladen van de config
entry en het wissen van de service worker:

```
?v= in performance.getEntriesByType("resource"):  fa62ccef16c4
sha256 van de bundel op schijf:                   fa62ccef16c41ada27abc618b25986b4866626c06d8fd8cd89848bcc39c59b95
```

(Dat was de bouw vóór het verhogen van het versienummer. Daarna is alleen
`0.54.0` in `0.54.1` veranderd.)

### Gemeten in Chrome

Zijn vier sensoren met zijn datums nagebootst (`POST /api/states`), en de kaart
met zijn config op de werkbank (`kaart-test/navbalk`): een keer als lijst en
een keer over de breedte.

**Afvalkaart, lijstvorm** (`donker.jpg`):

```
uitgelicht:  "morgen"  "Restafval en Papier"   2 iconen
iconen:      rgba(232, 228, 222, 0.38) (restafval), rgb(18, 155, 228) (papier)
vlak:        var(--dac-ink-3)
lijst:       "PMD di 13 okt", "GFT do 15 okt"
hoogte:      248px (vier rasterrijen, net als eerst)
```

Posities (`getBoundingClientRect`):

```
vlak     y 124,6  h 58   midden 153,6
icoon 1  x 598    40×40  midden 153,6
icoon 2  x 644    40×40  midden 153,6
tussen de iconen   6px
icoon tot tekst   12px
tekst afgekapt    nee
```

**Afvalkaart, brede vorm:**

```
true  Restafval morgen
true  Papier morgen
false PMD di 13 okt
false GFT do 15 okt
hoogte 56px
```

**Drie bakken op één dag** (PMD even op 07-10 gezet): "Restafval, Papier en
PMD", drie iconen van 32px op dezelfde middellijn (152,6), tekst niet afgekapt,
in de lijst alleen nog GFT.

**Licht thema** (`licht.png`, HA-standaardthema licht): het restafvalicoon
`rgba(26, 26, 23, 0.5)`, papier `rgb(18, 155, 228)`, de kaart op
`dac-thema="licht"`. Daarna teruggezet op standaard donker, zoals het stond.

**Infoscherm** (`infoscherm.jpg`): het blok toont "Papier en Restafval 7 okt
morgen" met twee iconen op dezelfde middellijn als het vlak (556,4), en
daaronder PMD en GFT. Echte klik op "Alles bekijken":

```
{ trusted: true, pad: "txt < bk-meer < bk < blok afval" }
pagina: "Papier en Restafval 7 okt morgen PMD di 13 okt · over 7 dagen GFT do 15 okt · over 9 dagen"
```

Live bijwerken, zonder de pagina te herladen: PMD op 07-10 gezet.

```
voor: Papier en Restafval 7 okt morgen PMD di 13 okt GFT do 15 okt
na:   PMD, Papier en Restafval 7 okt morgen GFT do 15 okt
```

Op de code van vóór deze ronde bleef het blok na het zetten van de sensoren
"Geen ophaaldata gevonden." zeggen tot de pagina herladen werd. Dat is gezien
tijdens deze meting; zo is de tweede bijvangst gevonden.

### Tellingen

- JS: 1328 toetsen, alle groen.
- Python: 738 toetsen, alle groen (lokaal in Docker, `python:3.14-slim`).
- `verify`, `check:registratie`, `check:controls`, `check:css`: OK.
- Bundel 895.440 bytes.

## Samenvatting

De afvalkaart en het infoscherm lichten nu alle bakken van de eerstvolgende
ophaaldag uit, niet alleen de eerste. Bij twee of meer bakken krijgt elke bak
een eigen icoon in zijn eigen kleur, en is het vlak eromheen neutraal. De
melding van 19:30 is volgens zijn eigen Home Assistant met beide bakken
verstuurd ("Morgen Papier en Restafval"); daar is niets aan veranderd, maar er
staat nu een regressiewacht voor. Bijvangst: het infoscherm werkt nu bij als een
afvalsensor verandert, en de kaart om middernacht.

## Wat niet lukte

- **Wat er op zijn telefoon aankwam** kan ik niet zien. De tekst van een
  pushbericht wordt nergens in Home Assistant bewaard. Alles wat wél te zien
  is, wijst op een melding met beide bakken.
- Niet op een telefoon gemeten; de kaart is alleen in Chrome op 1920 breed
  bekeken (kolom van 474px, vergelijkbaar met de zijne).
- Niet op zijn eigen installatie bekeken. Dat kan pas na de update.

## Aannames

- Dat "1 melding" betekent dat er in die ene melding maar één bak stond, en niet
  dat hij er één per bak verwachtte. Zijn zin ("die melding moet eigenlijk 2
  afvaltypes bevatten") wijst op het eerste, en zo werkt het al.
- Dat het vlak neutraal hoort als er meer bakken op één dag zijn. Het
  alternatief, het vlak in de kleur van de eerste bak, gaf een grijs vlak met
  een blauwe bak erin, en dan lijkt Papier er alsnog bij te hangen.

## git status --porcelain

Vlak voor de commit:

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/infoscherm-card.js
 M src/cards/waste-card.js
 M tests/meldingen/test_motor.py
?? docs/twee-bakken-op-een-dag/
?? src/cards/afval-logica.js
?? tests/js/afval-eerste-dag.test.mjs
```
