# Stofzuiger per kamer, en het icoon van een garagedeur — 0.138.0

## Waarom

Twee wensen van een klant, via de beheersessie. De eigenaar zei ja op het advies van lovelace, met erbij: "bouw alles op
jouw advies over die kamernummers etc het moet niet fout gaan!"

1. **Stofzuigen per kamer.** In elke kamer-pop-up een knop die alleen die kamer laat stofzuigen, en die laat zien of de
   robot daar bezig is. Een kale knop met een segmentnummer gaat stil fout. De robot van de klant heeft drie kaarten
   (verdiepingen), en de nummers lopen per kaart opnieuw: 2 is op de ene kaart het kantoor en op de andere "Room 2".
2. **Garagedeur.** Een magneetcontact (`binary_sensor`, `device_class: garage_door`) stond als schild op de kaart, en met
   een vast icoon "garage" was niet te zien of de deur open stond.

## Wat er veranderd is

| Waar | Wat |
|---|---|
| nieuwe kaart `domotiapp-stofzuiger-kamer-card` | één rij van 56 px: icoon, kamernaam, wat de robot doet, en een knop (Starten, Pauzeren of Hervatten). Een tik op de rest opent de stofzuiger in Home Assistant |
| de kamer kiezen (`kamerDoel`) | op NAAM binnen een gekozen KAART. Starten kan alleen als `selected_map` die kaart is en elke naam er precies één keer op staat; dan gaat het nummer dat erbij hoort naar `dreame_vacuum.vacuum_clean_segment`. Anders staat de knop uit, met de reden. Een nummer in de config is alleen een hint: staat de naam er niet meer, dan zegt de kaart wie nu dat nummer heeft |
| loopt er een beurt (`beurtLoopt`) | ook als de toestand `docked` of `paused` is terwijl `started`, `running`, `paused`, `segment_cleaning` of `active_segments` staat. Zo is het in de echte gegevens: midden in een kamerbeurt wast hij de pads in het station, en hij rijdt met `running: false` |
| starten | vraagt altijd eerst. Loopt er een beurt ergens anders, dan heet de vraag "Lopende beurt afbreken?" en zegt hij waar hij bezig is. Na het ja kijkt de kaart opnieuw (`nogGeldig`): een andere kaart, een beurt die begon of nummers die verschoven, en hij start niets |
| meer kamers in één kaart | `kamers: [{naam, id}, ...]`: samen in één beurt, allebei in de naam. Ze moeten allemaal kloppen |
| de editor | robot, kaart (uit `rooms`), de kamers op die kaart als vinkjes, naam. Hij schrijft `{naam, id}`, met het nummer als hint |
| de grote stofzuigerkaart | dezelfde `beurtLoopt`: tijdens het wassen van de pads midden in een beurt waren de kamers daar weer te kiezen. Nu niet meer, en de kamers van de beurt staan aangedrukt |
| `defaultIcon` | een binary_sensor zonder eigen icoon: `garage_door` is `garageOpen` of `garageClosed` naar de toestand, `lock` is `lockOpen` of `lock`, `door` en `opening` de deur, `window` het raam. De rest blijft het schild |

Voorbeeld:

```yaml
type: custom:domotiapp-stofzuiger-kamer-card
entity: vacuum.x50_ultra_complete
kaart: Begane grond
kamers:
  - naam: Kitchen
    id: 13
```

## Uit echte gegevens

De beheersessie las de attributen van beide robots bij de klant (27 november 2026): `rooms` met alle kaarten, een live
stand midden in een kamerbeurt, en dezelfde beurt uit de geschiedenis. Ze staan geanonimiseerd in
`tests/js/vaste-invoer/dreame-kamers-meerdere-kaarten.json`; een kaartnaam met een plaats en kamers met een persoonsnaam
zijn vervangen. Een tweede proef van de beheersessie (een kamerbeurt en daarna een stop) staat als proef in de tekst van
`stofzuiger-kamer.test.mjs`: `running: false` terwijl hij reed, en `paused` in het station met `active_segments` nog
gezet.

## Proeven

`tests/js/stofzuiger-kamer.test.mjs`, 19 proeven, **NIEUW GEDRAG**, op de echte gegevens:

- Kitchen op de begane grond is 13; op Map 2 staat de knop uit ("Robot staat op een andere kaart (Map 2).");
- een hernoemde kamer start niets ("nummer 2 is nu Werkkamer"); verschoven nummers: de naam wint;
- een naam die twee keer op de kaart staat start niets; twee kamers moeten allebei kloppen;
- geen kaart gekozen, een kaart die weg is, geen `selected_map`, geen dienst, onbereikbaar: niets;
- de hele echte kamerbeurt uit de geschiedenis telt als beurt, ook tijdens het wassen in het station; `current_segment`
  na de beurt is geen beurt;
- de tweede echte proef: rijden met `running: false`, gepauzeerd in het station is "Gepauzeerd hier";
- een nummer op een andere kaart is nooit "hier";
- de knop: altijd een vraag, bij een beurt elders "afbreken", hier pauzeren of hervatten, en na de vraag alleen door als
  er niets veranderde.

`tests/js/standaard-icoon.test.mjs`: 2× **NIEUW GEDRAG** (garagedeur, deur, raam, slot) en 2× **REGRESSIEWACHT** (rook
en schild blijven, elk icoon bestaat).

Op de code van main (`git archive`, met de nieuwe proeven en de vaste invoer erin):

```
stofzuiger-kamer.test.mjs:
  Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../src/cards/stofzuiger-kamer-logica.js'
  # pass 0  # fail 1
standaard-icoon.test.mjs:
  ✖ NIEUW GEDRAG: een garagedeur is open of dicht
  ✖ NIEUW GEDRAG: deur, opening, raam en slot hebben hun eigen tekening
  ✔ REGRESSIEWACHT: rook blijft rook, de rest blijft het schild, ook zonder toestand
  ✔ REGRESSIEWACHT: elk icoon dat eruit komt bestaat
```

Alles: 2568 JS-proeven en 1192 Python-proeven groen, plus `verify`, `check:registratie`, `check:controls`, `check:css` en
`check:taal`.

## Gemeten in de testinstance

De nagebootste Dreame (`.ha-dev-config`, niet in git) kreeg twee diensten: `nep_kaart` (een andere `selected_map`) en
`nep_wassen` (midden in een beurt `docked`, met `started` en `active_segments` nog gezet), en zet `started` bij een start.
View `kamers` op `kaart-test`: Keuken, Kantoor, Slaapkamer A met Badkamer A (de andere robot), en "Bijkeuken" met hint 13
(bestaat niet), plus een entiteitenkaart met een nagebootste garagedeur. Playwright als telefoon: 390 × 844, `isMobile`,
`hasTouch`, tikken; wat er naar de robot ging gelezen van de gebeurtenis `nep_dreame`.

| | Uitkomst |
|---|---|
| bundel geladen = schijf | `7e271425eb3a` = `7e271425eb3a` |
| tikken | elke tik `click:true` (`isTrusted`) |
| hoogte | 56 px; 120 px als de reden twee regels is (de andere kaart, de kamer die weg is) |
| breedte | kaart 372 / 372, pagina 390 / 390, knop 11 px van de rand |
| Keuken, Starten, Annuleren | vraag "Keuken stofzuigen?", niets naar de robot |
| Keuken, Starten, Starten | `vacuum_clean_segment [13]` |
| tijdens die beurt | Keuken "Bezig hier · 12 %", Pauzeren, icoon in het accent; Kantoor "Bezig in Keuken", Starten |
| Kantoor, Starten | vraag "Lopende beurt afbreken?", "… is nu bezig in Keuken. Als je Kantoor start, breekt hij die beurt af."; Annuleren: niets |
| pads wassen (`docked`) | Keuken blijft "Bezig hier · Wast de dweilpads" met Pauzeren |
| Pauzeren | `pause`; "Gepauzeerd hier", Hervatten, icoon let op |
| robot op Kaart 2 | "Robot staat op een andere kaart (Kaart 2).", knop uit; een tik geeft geen vraag en niets naar de robot |
| Starten, dan wisselt de robot van kaart, dan het ja | niets naar de robot |
| twee kamers | vraag "Slaapkamer A en Badkamer A stofzuigen?", `vacuum_clean_segment [2,1]` op de andere robot |
| Bijkeuken (hint 13) | "Kamer Bijkeuken staat niet meer op de kaart; nummer 13 is nu Keuken.", in let op, knop uit |
| de vraag | vak van 25 tot 365 op 390 breed |
| garagedeur dicht / open | `garageClosed` / `garageOpen`, de tekst Dicht / Open blijft (`show_state`), het icoon licht op als hij open is |
| garagedeur met vast icoon | blijft `garage`: een eigen icoon gaat voor |
| fouten op de pagina | geen |

De editor, met de hand in de pagina gehangen (zie valkuil 21): zonder kaart staan er alleen de kaarten (Kaart 1, 2, 3);
met Kaart 1 de negen kamers als vinkjes. Twee vinkjes getikt gaf
`kamers: [{naam: "Keuken", id: 13}, {naam: "Eetkamer", id: 15}]`. In het naamveld "Keuken en eetkamer" getypt: twee
spaties, allebei `isTrusted: true`. De echo terug door `setConfig` hield de kamers en de naam. Pagina 390 / 390. In die
opstelling gooien de keuzelijsten van Home Assistant `localize`-fouten. De bestaande stofzuigereditor doet dat op dezelfde
manier ook (84 keer), dus het ligt aan de opstelling buiten de dialoog.

## Samenvatting

De nieuwe kaart Stofzuiger per kamer laat de robot één kamer doen (of een paar samen), en laat zien of hij daar bezig is.
Hij kiest de kamer op naam binnen een kaart, start nooit op een kaal nummer, vraagt altijd eerst (bij een lopende beurt
met "afbreken?") en kijkt na het ja opnieuw. Een binary_sensor van een garagedeur wisselt nu tussen open en dicht.

## Wat niet lukte

- Niet met een echte robot: de nep doet de diensten na. Wat een Dreame doet met `vacuum_clean_segment` midden in een beurt
  (de beurt vervangen of de opdracht negeren) heb ik niet kunnen zien. In geen van beide gevallen doet hij de verkeerde
  kamer.
- Niet op een echte telefoon of in de app.
- Het naamveld in de editor is een veld van Home Assistant met 14 px tekst; dat is in elke editor zo.

## Aannames

- "Hoe ver" is de voortgang van de hele beurt (`cleaning_progress`), niet per kamer. Een beurt van alleen deze kamer is
  dan wel de voortgang van de kamer.
- Twee kamers in één kaart gaan samen in één beurt. Wie ze apart wil, zet twee kaarten neer.
- `returning` telt als een lopende beurt. Dat is voorzichtig: na een beurt terugrijden stelt dan ook de vraag
  "afbreken?".

## `git status --porcelain`

(vlak voor het vastleggen)

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/entities-card.js
 M src/cards/stofzuiger-card.js
 M src/i18n/en/apparaten.js
 M src/icons.js
 M src/index.js
?? docs/stofzuiger-per-kamer/
?? src/cards/stofzuiger-kamer-card.js
?? src/cards/stofzuiger-kamer-logica.js
?? tests/js/standaard-icoon.test.mjs
?? tests/js/stofzuiger-kamer.test.mjs
?? tests/js/vaste-invoer/dreame-kamers-meerdere-kaarten.json
```
