# 0.60.1: batterij, laadpaal en wekker, na de eerste proef

## De vraag

Antwoorden en bevindingen van de eigenaar in de nacht van 11 op 12 oktober
2026, doorgegeven door de coach-sessie:

1. **Batterijkaart, met schermafdruk:** *"ook op pc snijd de tekst af van de
   batterij kaart"*. De reden onder "Nul op de meter" hield na twee regels op:
   "... wat het huis vraagt komt…". Hij wil de tekst heel, op de batterij- en
   op de laadpaalkaart.
2. **Batterijkaart:** *"en vol laden en leeg laden moet naast elkaar staan op de
   batterij"*. "Leegladen tot [− % +]" wordt een instelling apart.
3. **Laadpaal:** op de laadbeurt ook wat er uit de thuisbatterij kwam ("0,3 kWh
   accu"): ja.
4. **Wekker:** een wekker die 's avonds is aangemaakt, meldde na een herstart in
   de nacht dat hij die ochtend "niet was afgegaan", terwijl hij toen nog niet
   bestond. Gevonden op 30 september (zie de notities). Zijn antwoord:
   repareren.

## Wat er veranderd is

**De reden heel.** Op beide kaarten is de afkapping na twee regels weg
(`-webkit-line-clamp`). De kaart wordt hoger als het moet, en valt op het
raster.

**Vol laden en Leegladen naast elkaar.** De knoppenrij is nu Vol laden en
Leegladen. Loopt er een opdracht, dan komt Terug naar het plan op een eigen
regel eronder. Met drie op een rij werd "Terug naar het plan" op 380 px
afgekapt; zo blijft de hele naam staan, ook op 280. Het korte woord "Naar plan"
is daardoor niet meer nodig. Daaronder staat "Leegladen tot [− 5% +]" als
instelling. Leegladen werkt zoals voorheen: wie net op + of − tikte, krijgt
eerst dat getal naar de coach, en daarna pas de knop.

**De thuisbatterij op de laadbeurt.** "15,5 kWh · 2,1 kWh zon · 0,3 kWh accu ·
€ 3,19 net · € 3,64 incl. zon". Bij nul of zonder `accu_kwh` valt het weg.

**De wekker meldt niets van vóór hij bestond.** Een wekker heeft nu een veld
`geldt_sinds`, dat alleen de server beheert (naast `last_fired` en
`last_message`). De server zet het:
- bij een nieuwe wekker;
- bij een andere tijd of andere dagen;
- bij het aanzetten van een wekker die uit stond.

Alleen de naam of het geluid veranderen laat het staan. De inhaalslag bij het
opstarten laat elk moment van vóór `geldt_sinds` liggen. Een wekker van vóór
0.60.1 heeft het veld niet, en gedraagt zich zoals voorheen. De kaart stuurt
alleen de velden van de gebruiker terug (`conceptVan`), dus het nieuwe veld
komt nooit van de kaart.

## Bewijs

### Tests

**JS**, `laadpaal-accu-op-de-laadbeurt.test.mjs` (3). Tegen 0.60.0 (`git
archive` van main):

```
  ✖ staat na de zon, in de echte laadbeurt van 11 oktober
  ✖ staat er ook zonder zon
  ✔ REGRESSIEWACHT: valt weg bij nul en als de coach het niet levert
ℹ pass 1
ℹ fail 2
```

De dumptest van 0.112.1 verwacht nu "0,3 kWh accu" in de regel. `npm test`
1528 groen, in UTC.

**Python**: twee tests in `test_planner.py` en drie in `test_websocket.py`.
Tegen 0.60.0 vallen alle vijf om:

```
FAILED test_planner.py::test_een_nieuwe_wekker_meldt_geen_gemist_moment_van_voor_hij_bestond
FAILED test_planner.py::test_een_echt_gemist_moment_wordt_nog_steeds_gemeld
FAILED test_websocket.py::test_een_nieuwe_wekker_krijgt_geldt_sinds
FAILED test_websocket.py::test_geldt_sinds_verschuift_alleen_als_het_schema_verandert
FAILED test_websocket.py::test_aanzetten_zet_geldt_sinds_alleen_als_hij_uit_stond
```

Op 0.60.0 vallen de twee plannertests om omdat `geldt_sinds` daar een onbekend
veld is. Dat bewijst het gedrag nog niet. Daarom ook de oude planner met alleen
de nieuwe validatie gedraaid. Dan valt de eerste test om op precies de melding
van 30 september:

```
E  assert {'at': '2026-08-10T23:46:00+02:00', 'kind': 'skipped_grace_window', 'severity': 'notice',
           'text': 'Je wekker van 06:45 is niet afgegaan; Home Assistant heeft dat moment gemist.'} is None
FAILED test_een_nieuwe_wekker_meldt_geen_gemist_moment_van_voor_hij_bestond
1 failed, 1 passed
```

De tweede (een echt gemist moment wordt nog steeds gemeld) slaagt daar, en is
een REGRESSIEWACHT. De alarmtests zijn 336 groen.

### In een echte browser, in de proefopstellingen

Niet in Home Assistant: de testinstance is nog weg (valkuil 68). Gemeten in
`dev/batterij.html` en `dev/laadpaal.html`, nu op 380 (de pc-breedte van zijn
schermafdruk), 320 en 280 px. Roboto staat niet op deze pc; het font is daar
Segoe UI, en dat is breder dan het Roboto van Home Assistant.

**Batterij**, de echte dump en een lopende leegbeurt:

| Breedte | Hoogte | Knoppen | Leegladen tot | Reden |
|---|---|---|---|---|
| 380 | 376 | Vol laden 172 · Leegladen 172 | kopje 77, getal 170 | heel, 3 regels |
| 320 | 440 | 142 · 142 | 77, 170 | heel, 4 regels |
| 280 | 440 | 122 · 122 | 77, 163 | heel, 5 regels |
| 380, leegbeurt | 440 | Vol laden · Leegladen (aan) · Terug naar het plan 350 | 77, 170 | heel |
| 320, leegbeurt | 504 | idem, Terug naar het plan 290 | 77, 170 | heel |
| 280, leegbeurt | 504 | idem, Terug naar het plan 250 | 77, 163 | heel |

Niets afgekapt. In de eerste meting waren twee dingen wél afgekapt:
- "Terug naar het plan" op 380, als derde op de rij (113 breed);
- het kopje "Leegladen tot" op 280 (75 van 77).

Allebei gerepareerd en opnieuw gemeten (de tabel hierboven).

Drie echte kliks, alle drie `isTrusted: true`. Eerst + en 204 ms later
Leegladen, daarna Vol laden:

```
callService number.set_value {"entity_id":"number.batterij_leegladen_tot","value":10}
callService button.press {"entity_id":"button.batterij_nu_leegladen"}
callService button.press {"entity_id":"button.batterij_nu_vol_laden"}
```

**Laadpaal**, met een lange reden erin gezet ("Hij wacht tot 01:00, want dan is
stroom het goedkoopst van de nacht, en dan is de auto ruim voor 06:00 vol tot
80%."). De reden staat er heel, op 3, 4 en 5 regels, en de kaart is op 380, 320
en 280 dan 440, 440 en 504 hoog. De laadbeurt: "15,5 kWh · 2,1 kWh zon · 0,3 kWh
accu · € 3,19 net · € 3,64 incl. zon", op twee regels.

Kliks kwamen in het verborgen tabblad pas aan na een schermafdruk; de eerste
drie na het laden van de pagina gaven niet eens een `pointerdown`. Dat was de
vorige keer ook zo.

## Samenvatting

Na zijn eerste proef:
- de reden staat heel op de batterij- en de laadpaalkaart;
- Vol laden en Leegladen staan naast elkaar, met "Leegladen tot" als
  instelling eronder;
- de laadbeurt noemt ook wat er uit de thuisbatterij kwam;
- de wekker meldt geen gemist moment meer van vóór hij bestond, of van toen hij
  uit stond.

## Wat niet lukte

- **Niet in Home Assistant zelf gemeten**, alleen in de proefopstellingen. De
  testinstance is weg (valkuil 68); hoe hij terugkomt is zijn keuze.
- **De wekker is niet in een echte browser nagelopen.** Er verandert niets aan
  de kaart, alleen aan de server, en dat is in Python getest.

## Aannames

- Dat Terug naar het plan op een eigen regel onder Vol laden en Leegladen mag
  staan. Hij vroeg alleen dat die twee naast elkaar staan.
- Dat "0,3 kWh accu" op een laadpaalkaart als de thuisbatterij leest en niet als
  de accu van de auto. Zo stond het in de vraag waar hij ja op zei.
- Dat het wijzigen van alleen de naam of het geluid van een wekker geen nieuw
  `geldt_sinds` hoort te geven: wat er gemist is, blijft gemist.

## git status --porcelain

Vóór het vastleggen:

```
 M custom_components/domotiapp_lovelace/alarm/planner.py
 M custom_components/domotiapp_lovelace/alarm/validatie.py
 M custom_components/domotiapp_lovelace/alarm/websocket.py
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M dev/batterij.html
 M dev/laadpaal.html
 M src/cards/batterij-card.js
 M src/cards/laadpaal-card.js
 M src/cards/laadpaal-logica.js
 M tests/alarm/test_planner.py
 M tests/alarm/test_websocket.py
 M tests/js/laadpaal-dump-0112.test.mjs
?? docs/batterij-laadpaal-en-wekker-na-de-proef/
?? tests/js/laadpaal-accu-op-de-laadbeurt.test.mjs
```
