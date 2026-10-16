# De duur van de laatste beurt volgt de klok (0.78.1)

16 oktober 2026, een paar uur na 0.78.0. De beheersessie bij de klant met de
Miele-wasmachine en -droger bekeek de kaarten op de echte installatie en meldde:

> De duur is afgerond op de echte seconden (in_use 12:48:07 tot program_ended
> 13:09:42, en 12:25:08 tot 12:50:55). Daardoor staat er een minuut meer dan
> het verschil tussen de klokken op de statusregel.

Op één kaart stond dus "Uit · laatste beurt vandaag 12:48 – 13:09" boven een
tegel "22 min". Wie de klokken van elkaar aftrekt komt op 21. Beheer vond het
goed zo. Maar twee getallen op één kaart die elkaar tegenspreken lezen als een
fout, en de eigenaar leest zijn kaarten zo.

## Wat er veranderd is

`laatsteBeurt` in `src/cards/programma-logica.js` rekent de duur nu als het
verschil tussen de MINUTEN van begin en eind. Dat zijn precies de tijden die
de statusregel toont (`beurtWanneer` kapt de seconden af). Eerst werden de
seconden afgerond.

| beurt | echte tijden | statusregel | 0.78.0 | 0.78.1 |
|---|---|---|---|---|
| wasmachine 3 | 12:48:07 – 13:09:42 | 12:48 – 13:09 | 22 min | **21 min** |
| droger 3 | 12:25:08 – 12:50:55 | 12:25 – 12:50 | 26 min | **25 min** |
| de andere vier van die dag | | | gelijk | gelijk |
| een beurt van 25 s over een minuutgrens | 17:49:50 – 17:50:15 | 17:49 – 17:50 | 0 min | **1 min** |

De getoonde duur wijkt altijd minder dan een minuut af van de echte. Elke
tijdzone verschuift in hele minuten, dus het verschil is in lokale tijd
hetzelfde als in UTC.

## Tests

In `tests/js/programma-beurt.test.mjs`:
- **Aangepaste verwachtingen:** de bestaande verwachtingen voor de derde beurt
  van allebei en voor de twee tegelrijen zijn bijgesteld (22 naar 21, 26 naar
  25).
- **NIEUW GEDRAG (0.78.1), drie toetsen:**
  - bij alle zes de beurten van de dump is de duur het verschil tussen de
    klokken;
  - 12:48:07 tot 13:09:42 is "12:48 – 13:09" en 21 min;
  - over een minuutgrens heen is het minstens 1 min, binnen één minuut 0.

De toets met de statusregel bouwt zijn tijden in lokale tijd, net als de
bestaande toets voor `beurtWanneer`. CI draait in UTC, en een tijd met
`+02:00` erin zou daar "10:48" geven. Gedraaid met `TZ=UTC` en
`TZ=Europe/Amsterdam`: allebei 20 van 20.

Tegen de oude code (`git archive main | tar -x`, de nieuwe toets erin):

```
✖ de derde, aan het eind van de dag
    actual:   { van: '12:48', tot: '13:09', min: 22, ... }
    expected: { van: '12:48', tot: '13:09', min: 21, ... }
✖ de eerste, de tweede (zonder klaarzetten) en de derde
    actual:   { van: '12:25', tot: '12:50', min: 26, ... }
    expected: { van: '12:25', tot: '12:50', min: 25, ... }
✖ de wasmachine: acht tegels ...      'Duur: 22 min'  in plaats van  'Duur: 21 min'
✖ de droger: vijf tegels ...          'Duur: 26 min'  in plaats van  'Duur: 25 min'
✖ bij alle zes de beurten van de dump
✖ 12:48:07 tot 13:09:42 is 21 min     22 !== 21
✖ over een minuutgrens heen ...       0 in plaats van 1
ℹ pass 13
ℹ fail 7
```

## Bewijs in een echte browser

Testinstance, view `miele` van `kaart-test`. Daarvoor is de config entry
herladen en zijn de service worker en de caches gewist. De `?v=` van de
geladen bundel was `17c056a6ee16`, en dat is de sha256 op schijf
(`17c056a6ee169c57…`).

| kaart | statusregel | duur | hoogte |
|---|---|---|---|
| Wasmachine | Uit · laatste beurt vandaag 17:49 – 17:50 | 1 min (0.78.0: 0 min) | 184 |
| Wasdroger | Uit · laatste beurt vandaag 12:25 – 12:50 | 25 min (0.78.0: 26 min) | 184 |

De wasmachine heeft als laatste beurt de beurt die bij 0.78.0 met de nep live
is nagespeeld. De droger heeft de echte beurt uit de dump. Er is aan de
bediening niets veranderd, dus er is geen klikproef gedaan.

## Controles

- `npm run build` (met `check:css`), `verify`, `check:registratie`,
  `check:controls`: groen.
- `npm test`: 1969 tests, alle groen.
- Python: zie de PR. Aan de serverkant is niets veranderd.

## Samenvatting

De duur op de tegel van de laatste beurt is nu het verschil tussen de twee
klokken op de statusregel. Daardoor staat er "12:48 – 13:09" met 21 min, en
niet meer met 22.

## Wat niet lukte

Niets.

## Aannames

- **Kloppen met de statusregel gaat voor op afronden.** De echte beurt duurde
  21 minuten en 35 seconden; 22 was dichter bij de waarheid. Maar de kaart
  laat de seconden nergens zien, en twee getallen die elkaar tegenspreken
  vallen meer op dan een halve minuut. De andere route (de klokken afronden in
  plaats van afkappen, dan "12:48 – 13:10" met 22) wijkt af van hoe Home
  Assistant overal tijden toont.

## `git status --porcelain`

Schoon na de commit.
