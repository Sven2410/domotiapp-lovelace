# Onderbroken is een pauze (0.78.2)

16 oktober 2026, dezelfde avond als 0.78.0 en 0.78.1.

## De vraag

Een Miele-wasmachine, -droger of -vaatwasser met de status
`program_interrupted` stond op de programmakaart als STORING:
- in rood;
- met "Programma onderbroken".

In de dump van de klant (`vaste-invoer/miele-beurten.json`) gebeurde dat één
keer, bij een afgebroken start:

```
08:59:18  programmed
08:59:26  in_use
08:59:42  program_interrupted
08:59:55  programmed
09:00:16  in_use
```

Dertien tellen onderbroken, en daarna werd hetzelfde programma opnieuw
klaargezet. Dat is geen defect. DomotiApp Coach telt het sinds v0.127.0 ook
als pauze. Het voorstel vanuit deze sessie was oranje met "Onderbroken". De
eigenaar antwoordde "prima" in de coach-sessie, en die sessie gaf dat door
(16 oktober 2026).

## Wat er veranderd is

**De status** (`MIELE_STATUS` in `src/cards/vaatwasser-logica.js`):
`program_interrupted` is nu een PAUZE met het woord "Onderbroken". Daarmee
gaat hij precies als een pauze:
- de toon is `warn` (oranje) in plaats van `bad` (rood);
- staat de deur open, dan komt "Deur open" erachter;
- de voortgangsbalk blijft staan, want er is nog een programma;
- draaien doet hij niet, dus geen animatie.

`failure` blijft een storing, in rood.

**De laatste beurt** (`laatsteBeurt` in `src/cards/programma-logica.js`): een
beurt eindigt nu op het laatste moment dat hij DRAAIDE, en niet op het laatste
moment in de beurt. Dat is nodig omdat een pauze bij de beurt hoort:

| reeks | tot 0.78.2 | met alleen de nieuwe status | 0.78.2 |
|---|---|---|---|
| draait 09:10, onderbroken 09:40, uit 10:30 | 09:10 – 09:40 | 09:10 – 10:30 | **09:10 – 09:40** |
| draait 09:10, pauze 09:40, uit 10:30 | 09:10 – 10:30 | 09:10 – 10:30 | **09:10 – 09:40** |
| draait, onderbroken of pauze middenin, klaar, uit | hele beurt | hele beurt | hele beurt |
| de zes beurten van de dump | | | ongewijzigd |

Zonder die tweede wijziging was een onderbroken beurt die daarna uitging
ineens langer geworden, tot het moment van uit. Dat het nu ook bij een
gewone pauze aan het eind zo gaat, staat zo in de beschrijving van 0.78.0:
"hij eindigt waar hij ophoudt te draaien".

"Loopt nog" is ook veranderd. Een beurt is pas klaar als de laatste status
geen draaien, pauze of onderbreking is. Tot nu toe gaf een reeks die op
"onderbroken" eindigde al een beurt terug. Op de kaart maakte dat niets uit,
want die vraagt de laatste beurt alleen op als de machine uit staat.

## Tests

**Bijgesteld** in `tests/js/programma-miele.test.mjs` (twee verwachtingen):
- `program_interrupted` is `PAUZE` en niet `FOUT`;
- de tekst is "Onderbroken" en niet "Programma onderbroken".

**Nieuw** in hetzelfde bestand, NIEUW GEDRAG (0.78.2):
- oranje en "Onderbroken";
- met de deur open erachter;
- de balk blijft staan.

Daarbij een REGRESSIEWACHT: een storing blijft rood, en onderbroken draait
niet.

**Nieuw** in `tests/js/programma-beurt.test.mjs`, "0.78.2: een beurt eindigt
waar hij ophield te draaien":
- NIEUW GEDRAG:
  - gepauzeerd en daarna uit telt tot de pauze;
  - zolang hij onderbroken staat, is er geen laatste beurt.
- REGRESSIEWACHT:
  - onderbroken en daarna uit telt tot de onderbreking;
  - een onderbreking of pauze middenin hoort bij de beurt;
  - gepauzeerd is nog geen laatste beurt;
  - de afgebroken start van 08:59 telt nog steeds niet.

Tegen de oude code (`git archive main | tar -x`, de twee testbestanden erin):

```
✖ NIEUW GEDRAG: gepauzeerd en daarna uit telt tot de pauze, niet tot uit
    actual: '09:10 – 10:30 (80 min)',  expected: '09:10 – 09:40 (30 min)'
✖ NIEUW GEDRAG: zolang hij onderbroken staat, is er geen laatste beurt
    actual: { start: ..., eind: ..., minuten: 30, ... },  expected: null
✖ kent elke stand van een wasmachine          actual: 'fout',  expected: 'pauze'
✖ zegt het in woorden op de kaart             actual: 'Programma onderbroken',  expected: 'Onderbroken'
✖ oranje en "Onderbroken", net als de coach hem telt
    actual: [ 'fout', 'Programma onderbroken', 'bad' ],  expected: [ 'pauze', 'Onderbroken', 'warn' ]
✖ met de deur open erachter, zoals bij een pauze
✖ de balk blijft staan: er is nog een programma   actual: false,  expected: true
ℹ pass 49
ℹ fail 7
```

Alle zeven NIEUW GEDRAG (en de twee bijgestelde verwachtingen) falen. Alle
regressiewachten slagen.

## Bewijs in een echte browser

Testinstance, view `miele` van `kaart-test`, in Chrome op de pc. Halverwege
viel de extensie weg. Daarna is de proef gedaan met de bundel van 0.79.0
(`?v=93454a3a80f1`, gelijk aan de sha256 op schijf), met de config entry
herladen en de service worker en caches gewist. Die bundel bevat 0.78.2
ongewijzigd: 0.79.0 raakt alleen de knoppen (zie
`docs/knoppen-volgen-de-coach/RAPPORT.md`).

De nagebootste Miele-wasmachine is op `program_interrupted` gezet
(`nep_miele.zet`):

| kaart | statusregel | `--tone` | hoogte |
|---|---|---|---|
| wasmachine | Onderbroken | `#fab219` | 184 |
| wasmachine met de coach | Onderbroken · Deur open | `#fab219` | 184 |

`#fab219` is `--dac-warn` op die kaart. `--dac-bad` is `#d03b3b`.

Daarna is hij weer op `off` gezet (`program_interrupted` gevolgd door `off` in
de recorder). Na twaalf tellen zei de kaart nog steeds "Uit · laatste beurt
vandaag 17:49 – 17:50": de onderbreking is geen nieuwe beurt geworden.

Er is aan de bediening niets veranderd, dus er is geen klikproef gedaan.
Schermafdruk (kladmap van de browser, niet in git):
`screenshot-1792186278818-4.png`.

## Controles

- `npm run build` (met `check:css`), `verify`, `check:registratie` en
  `check:controls`: groen.
- `npm test`: 1979 tests, alle groen.
- Python: 874 tests, alle groen (lokaal in Docker). Aan de serverkant is
  niets veranderd.

## Wat hier NIET in zit: knoppen bij wasmachine en droger

De coach-sessie gaf in hetzelfde bericht nog een antwoord van de eigenaar
door: wasmachines en drogers worden *"in de toekomst"* wel gestuurd (Bosch,
bijvoorbeeld). De coach maakt sinds v0.127.0 zijn vrijgaveknoppen onbeschikbaar
bij een apparaat dat hij alleen uitleest, en zet `alleen_lezen` op de
startsensor. Zijn voorstel: laat de knoppen op de kaart afhangen van de
beschikbaarheid.

Dat gebeurt nog niet, om twee redenen:
- **De contractregel.** Er gaat niets uit dat iets van de coach leest dat nog
  niet in een echte dump heeft gestaan. Die dump komt via de beheersessie
  zodra v0.127.0 bij de klant staat.
- **De klant.** Daar draait nog een oudere coach, en daar zijn die knoppen
  gewoon beschikbaar. Een kaart die op beschikbaarheid afgaat, zou daar weer
  knoppen tonen die niets doen.

Het plan voor daarna, zo aan de coach-sessie gemeld:
- **De knoppen van de coach** (Ingeruimd, Nu starten, Handmatig) komen bij een
  wasmachine of droger alleen terug als `alleen_lezen` expliciet `false` is en
  de knop beschikbaar is.
- **De eigen knoppen van Miele** blijven bij wasmachine en droger weg.

## Samenvatting

"Onderbroken" is op de programmakaart nu een pauze, in oranje, net als bij de
coach. Een storing blijft rood. De laatste beurt eindigt waar hij ophield te
draaien, zodat een onderbreking aan het eind de beurt niet langer maakt.

## Wat niet lukte

Niets.

## Aannames

- **Het akkoord kwam via de coach-sessie, niet rechtstreeks.** De eigenaar zei
  "prima" in die sessie, en die sessie gaf het door. Het is een kleur en een
  woord, en terug te draaien met één regel.
- **Een pauze aan het eind telt ook niet meer mee.** Dat volgt uit de regel
  "hij eindigt waar hij ophoudt te draaien" uit 0.78.0. In de dump komt het
  niet voor: daar eindigt elke beurt met `program_ended`.
- **Ook de vaatwasser.** `MIELE_STATUS` geldt voor elk Miele-apparaat, dus een
  onderbroken Miele-vaatwasser is nu ook oranje. Er is geen reden waarom
  "onderbroken" daar wél een storing zou zijn.
- **De coach telt een afgebroken beurt anders.** De coach-sessie meldde het
  na deze wijziging: in zijn verslag eindigt een afgebroken beurt op het
  moment dat hij uitging ("19:05 tot 21:10"), terwijl de kaart tot de
  onderbreking telt. De kaart deed dat al vóór 0.78.2 (toen als storing), en
  die regel is hier alleen behouden. De coach-sessie legt het verschil aan
  de eigenaar voor. Kiest hij voor "tot uit", dan is het hier één regel
  (`SOORT.DRAAIT` terug naar `IN_BEURT` in `laatsteBeurt`), en wordt de
  regressiewacht op de onderbreking een toets op het nieuwe gedrag.

## `git status --porcelain`

Schoon na de commit.
