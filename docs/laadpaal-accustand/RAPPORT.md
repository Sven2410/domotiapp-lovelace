# 0.64.0: de accustand doorgeven op de laadpaalkaart

## De vraag

Op 14 oktober 2026 stond de integratie van de auto van de eigenaar even uit
Home Assistant, voor een proef. De coach meldde daarop "Geef de accustand door
op de laadpaalkaart", *"maar ik kan nergens de accustand doorgeven."* In de
coach zelf is dat opgelost in v0.116.2: de coachkaart vraagt het nu ook als de
auto wel een sensor heeft, maar die zwijgt. Zijn vervolg, via de coach-sessie:
*"ja ook op de lovelace kaart wil ik die."*

De coach levert er in v0.117.0 een entiteit voor. Contract 1 blijft; er komt
alleen iets bij, aan het laadpaal-apparaat:

| Wat | Hoe |
|---|---|
| entiteit | number met `translation_key` `accustand`, 0 tot 100, stap 1, `%`, mode box |
| toestand | na een opgave de stand waar de coach mee rekent, afgerond; die loopt mee met wat de paal erin laadt. Zonder opgave `unknown` |
| schrijven | `number.set_value`: hetzelfde als Doorgeven op de coachkaart. Kabel eruit, opgave weg |
| `vragen` (bool) | alleen dan het veld tonen: kabel erin, geen gast, accu in het profiel, en de auto zegt zelf niets |
| `wacht` (bool) | de coach wacht hierop om te plannen |
| `sensor` (bool) | de gekozen auto heeft een accusensor in zijn profiel, of die nu iets zegt of niet |

`sensor` is er op mijn vraag bij gekomen. De eerste zin van de uitleg ("De auto
geeft zijn accustand nu niet door.") geldt alleen voor een auto met een sensor,
en dat was op de number niet te zien: `vragen` is ook waar bij een auto zonder
sensor, en `entiteiten` op de coach-sensor zijn die van de paal. Afleiden of
raden mag niet (kop van `coach-logica.js`); de coach-sessie nam het voorstel
over, met precies die naam.

## Wat er veranderd is

**Op de kaart**, tussen de feiten onder de accubalk en de modus: "Hoe vol is de
auto nu?", een veld met `%` en een knop Doorgeven, en de uitleg eronder. Zelfde
hoogte (38 px) en dezelfde randen als Klaar om en Laden tot.

- **Het veld staat er alleen als de coach erom vraagt** (`vragen` is echt
  `true`). Een coach zonder deze entiteit, of een die onbereikbaar is: geen
  veld, verder niets anders aan de kaart.
- **Wat erin staat:** zonder opgave leeg, daarna de stand van de coach. In de
  kop staat dan "± 45%" (dat komt al uit `soc` en `soc_geschat` op de
  coach-sensor; daar is niets aan veranderd).
- **De uitleg** is die van de coachkaart (0.116.2):
  - zonder opgave, auto met sensor: "De auto geeft zijn accustand nu niet door."
    en dan, bij `wacht`, "Hier wacht de coach op. Zonder dit gaat hij uit van
    een lege accu.", anders "Geef dit door, dan kan de coach het gunstigste
    moment kiezen.";
  - zonder opgave, auto zonder sensor: zonder die eerste zin;
  - na een opgave: "Dit loopt mee met wat de paal erin doet. Zegt de auto iets
    anders, vul dat in en druk op Doorgeven."
- **Wat de bewoner aan het typen is, wordt niet overschreven** door een nieuwe
  toestand. Iets ingetypt dat nog niet is doorgegeven: de knop draagt het
  accent.
- **Enter of Doorgeven** stuurt `number.set_value`, afgerond op de stap en
  binnen 0 tot 100 (140 wordt 100). Daarna gaat het veld los, zodat het
  toetsenbord van een telefoon dichtgaat. Leeg of geen getal: niets.
- **Escape** zet terug naar wat de coach NU zegt, en gaat niet verder omhoog:
  in een pop-up zou die anders meteen dichtgaan. Een Escape zonder iets
  ingetypt gaat gewoon door.
- Na Doorgeven blijft het veld hooguit tien tellen staan op wat er doorgegeven
  is, tot de coach een nieuwe stand meldt. Anders wist een herteken tussendoor
  het veld (de oude toestand is `unknown`).

**In de logica** (`laadpaal-logica.js`, zonder DOM): `accustandVeld(st)` (of het
veld er staat, wat erin hoort en welke uitleg) en `accustandInvoer(tekst, st)`
(wat er naar de coach gaat).

**Geen gedachtestreepjes** in tekst die de klant leest; een test bewaakt dat.

## Bewijs

### Tests

`tests/js/laadpaal-accustand.test.mjs`, 17 tests, allemaal **NIEUW GEDRAG**.
Tegen de code van 0.63.1 (`git archive HEAD src tests` naar een vaste map in de
kladmap, met dit testbestand erbij; geen worktree, zie valkuil 68):

```
✖ NIEUW GEDRAG: wanneer het veld er staat (1.5637ms)
✖ NIEUW GEDRAG: de waarde in het veld (0.5044ms)
✖ NIEUW GEDRAG: de uitleg, gelijk aan de coachkaart (1.5097ms)
✖ NIEUW GEDRAG: wat er naar de coach gaat (0.5581ms)
ℹ tests 17
ℹ suites 4
ℹ pass 0
ℹ fail 17
✖ alleen als de coach erom vraagt (0.5815ms)
  TypeError: L.accustandVeld is not a function
```

Op deze tak: 17 van 17 groen. Alle JS-tests: 1640 groen. Python-tests (in
Docker, `python:3.14-slim`): 807 groen. Bundel actueel, registratieregel,
`check:css` en `check:controls`: OK.

### In Home Assistant, met echte kliks en echte toetsen

Testinstance (`ha-lovelace`, poort 8127), view `kaart-test/navbalk`. De
nep-coach in `.ha-dev-config` (niet in git) kreeg een number `accustand` zoals
hierboven, plus twee schakelaars om de auto zijn sensor te laten hebben en te
laten zwijgen.

**Verse code:** de pagina laadde `?v=415665bb99f3`, de eerste twaalf tekens van
de sha256 van de bundel op schijf op dat moment (`415665bb99f3…`), en
`customElements.get("domotiapp-laadpaal-card").prototype.paintAccustand_`
bestond. (De bundel daarna verschilt alleen in het versienummer: 0.64.0.)

**Typen, met een spatie** (klik in het veld, `4`, spatie, `5`):

```
click    pct  isTrusted true   waarde ""
keydown  "4"  isTrusted true
input              true        waarde "4"
keydown  " "  isTrusted true   waarde "4"    <- de spatie
keydown  "5"  isTrusted true
input              true        waarde "45"
```

Het getalveld weigert de spatie: er komt geen input-event, en de waarde blijft
`4`. Het vak kreeg een accentrand, de knop het accent (`rgb(25, 143, 217)`).

**Enter:** `keydown Enter isTrusted true`, en precies één aanroep:
`number.set_value {"entity_id":"number.oprit_accustand","value":45}`. Daarna:
toestand `45`, coach-sensor `soc 45, soc_geschat true`, in de kop "± 45%", de
uitleg "Dit loopt mee...", geen focus meer op het veld, de knop weer inkt.

**Niet overschrijven tijdens het typen:** in het veld `70` getypt, en toen de
coach (een aanroep van buitenaf) de stand naar 49 liet meelopen: de kop werd
"± 49%", het veld bleef `70`.

**Escape:** het veld werd `49`, zonder aanroep. *Hier zat een fout in die bij
deze meting boven kwam:* Escape zette eerst terug naar de vorige opgave (45) in
plaats van wat de coach nu zei (47). Gerepareerd, opnieuw gebouwd, de entry
herladen, en opnieuw gemeten: 49.

**De knop Doorgeven:** `52` getypt, `click .doorgeven isTrusted true`, één
aanroep met `value: 52`.

**Buiten het bereik:** `140` + Enter gaf `value: 100`.

**Wat de coach doet** (de schakelaars van de nep-coach):

| Situatie | Veld | Kop | Hoogte |
|---|---|---|---|
| de auto zegt weer iets | weg | 62% | 504 |
| zwijgt weer, opgave nog staan | 100 | ± 100% | 632 |
| kabel eruit | weg | niets | 376 |
| kabel er weer in | leeg, uitleg met de eerste zin | niets | 632 |
| auto zonder sensor | uitleg zonder de eerste zin | niets | 568 |

Elke hoogte valt op een rasterrij (56 + 64n).

**Uitlijning** (`getBoundingClientRect`, kaart 500 breed): het vak begint op
x=1119, net als Klaar om; de knop eindigt op x=1589, net als Laden tot. Vak en
knop 38 hoog, net als die twee.

**Licht thema** (`settheme` default, `dark: false`): `dac-thema="licht"`, het
veld `color-scheme: light`, inkt `rgb(26, 26, 23)` op `rgba(20, 20, 10, 0.043)`.
Daarna terug op donker.

### Smal, in de proefopstelling

`dev/laadpaal.html` heeft drie situaties erbij (4 tot 6: de coach wacht, na een
opgave, auto zonder sensor), met de number nagebootst. Gemeten op 380, 320 en
280:

| Breedte | Veld | Knop | Knoptekst past | Randen gelijk met Klaar om / Laden tot |
|---|---|---|---|---|
| 380 | 202 | 97 | ja | ja |
| 320 | 142 | 97 | ja | ja |
| 280 | 102 | 97 | ja | ja |

## Wat nog moet: de echte dump

**Deze ronde gaat pas uit na een echte dump van coach v0.117.0** (CLAUDE.md,
*Het contract met DomotiApp Coach*). De coach-sessie meldt zich met de dump als
v0.117.0 uit is; die komt dan als vaste testinvoer in
`tests/js/vaste-invoer/coach-0.117.0-laadpaal.json`, met een test erop.

## Samenvatting

De laadpaalkaart vraagt "Hoe vol is de auto nu?" zodra de coach dat wil
(`vragen`), met dezelfde zinnen als de coachkaart, en geeft het door met
`number.set_value`. In Home Assistant nagemeten met echte kliks en
toetsaanslagen; daarbij kwam een fout met Escape boven, die is gerepareerd en
opnieuw gemeten.

## Wat niet lukte

- Niet gemeten tegen de echte coach: v0.117.0 is er nog niet. Alles is gemeten
  tegen een nagebootste entiteit volgens de beschrijving van de coach-sessie.
- Niet op een iPhone gemeten (het lettertype van 16 px tegen inzoomen, het
  numerieke toetsenbord).

## Aannames

- Dat de echte number de attributen `vragen`, `wacht` en `sensor` als echte
  booleans geeft, zoals beschreven. De kaart leest alleen `=== true`. Dat wordt
  nagekeken in de dump.
- Dat een lege toestand of `unknown` geen opgave is, en `0` wel.

## git status --porcelain

```
(leeg na de commit van dit rapport)
```
