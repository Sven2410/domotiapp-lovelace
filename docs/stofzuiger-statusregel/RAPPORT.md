# 0.84.4: de statusregel van de stofzuigerkaart leesbaar op een telefoon

Gemeld op 25 oktober 2026 met een schermafdruk van een iPhone in staande
stand: op de stofzuigerkaart (een L40s Pro Ultra, in een pop-up met
tabbladen) stond onder de naam "Adding w..." en daarachter
"· Living Room · ...". Twee afgekapte stukken die samen niets zeiden.

## Waarom het afgesneden werd

De statusregel in de kop (`.st`) was één flexregel met drie kinderen: de stip,
het woord (`.woord`) en het detail (`.detail`). Woord en detail hadden allebei
`white-space: nowrap`, `overflow: hidden` en `text-overflow: ellipsis`, en
mochten allebei krimpen. Past de regel niet, dan krimpen ze dus allebei, en
krijgt ELK zijn eigen beletselteken.

Op een iPhone is de kaart ruim 338 CSS-pixels breed. Daarvan gaan de foto
(54 px in de smalle vorm), de padding en de accu af, en blijft er 187 px over
voor de tekst. "Adding water · Living Room · 12 %" is bij 12 px breder dan
dat. Op een brede kaart (380 px, 214 px tekst) paste het net, en daarom is
het op de werkbank nooit opgevallen.

## Wat er veranderd is

- **Woord en detail lopen als gewone tekst door** in één `.regel`, die over
  hoogstens twee regels mag (`-webkit-line-clamp: 2`). Pas daarna komt er een
  beletselteken, en dan één.
- **Een harde spatie vóór elk puntje en vóór "%"**, zodat geen regel met
  "·" begint en "%" nooit alleen op de tweede regel staat. Het puntje vóór het
  detail is `"\00a0· "` in de CSS; in het detail zelf zet `paint` een harde
  spatie vóór elke `·` en `%`. De logica (`stofzuigerStand`) is niet
  veranderd.
- **De kop wordt er niet hoger van.** Naast de foto (62 hoog in de smalle
  vorm, anders 72) passen naam en twee regels status gewoon: 17,5 + 2 + 31 =
  50,5. Alleen met een storing erbij groeit de kop van 62 naar 68; de kaart
  blijft op dezelfde rasterhoogte.

## Gemeten

Op een nieuwe werkbank `dev/stofzuiger.html`: de echte bundel, de dump van de
L40s Pro Ultra (`tests/js/vaste-invoer/dreame-r9419h.json`) met de toestand
aangepast (schoonmaken, "Vult water bij", kamer "Living Room", 12 %), in het
Engels, op 380, 338 en 280 px breed. Headless Chromium (Playwright), met de
foto opgevangen uit `afbeeldingen/`. Oude bundel (0.84.3) naast de nieuwe:

| breedte | tekst | 0.84.3 | 0.84.4 | kop 0.84.3 → 0.84.4 |
|---|---|---|---|---|
| 380 | 214 px | past op één regel | één regel | 72 → 72 |
| 338 | 187 px | **woord én detail afgekapt** | twee regels, niets afgekapt | 62 → 62 |
| 280 | 129 px | woord én detail afgekapt | twee regels, niets afgekapt | 62 → 62 |
| 338, lange kamernaam | 187 px | afgekapt | twee regels, niets afgekapt | 62 → 62 |
| 338, met storing | 187 px | afgekapt | twee regels | 62 → 68 |

Op 338 px staat er nu "Adding water · Living Room ·" en daaronder "12 %". Bij
280 px en een kamernaam van 27 tekens is het tweede deel nog afgekapt
("Slaapkamer achte…"), maar dan na twee volle regels.

Wat niet gemeten is: de kaart op een echte iPhone. Safari kent
`-webkit-line-clamp` met `display: -webkit-box` al jaren (het is waar die
vorm vandaan komt), maar de eigenaar ziet het pas na bijwerken.

## Toets

`tests/js/stofzuiger-statusregel.test.mjs`, **NIEUW GEDRAG**. Drie gevallen:
woord en detail in één regel met een clamp van twee, geen `nowrap` of
`text-overflow` op woord en detail apart, en de harde spaties. Tegen de code
van 0.84.3 (`git archive HEAD`, met de nieuwe toets erin):

```
    not ok 1 - woord en detail staan samen in één regel die over twee regels mag
    not ok 2 - woord en detail kappen niet elk apart af
    not ok 3 - het puntje hangt aan wat ervoor staat, het getal aan zijn %
# pass 0
# fail 3
```

Op de nieuwe code: 3 van 3 groen. Hele suite: 2054 JS-tests groen; `verify`,
`check:registratie`, `check:css`, `check:controls` en `check:taal` groen.

## Samenvatting

De statusregel van de stofzuigerkaart kapte op een telefoon woord en detail
elk apart af. Nu mag hij over twee regels, breekt hij op woordgrenzen en blijft
de kop even hoog.

## Wat niet lukte

- Niet in Home Assistant zelf gemeten: op de mini-pc staat geen testinstance.
  Gemeten op de werkbank met de echte bundel en de echte dump.
- De Python-tests zijn lokaal niet gedraaid (geen Python veranderd); CI draait
  ze.

## Aannames

- "Adding w..." op de schermafdruk is "Adding water" (`clean_add_water`, de
  Engelse vertaling van "Vult water bij"); de kamer en de voortgang staan in
  het detail. Dat is de enige toestand met een woord dat zo begint.
- 338 px is de breedte van de kaart op zijn iPhone, geschat uit de
  schermafdruk (393 CSS-pixels breed, de pop-up en de tabbladenkaart eromheen).

## git status --porcelain

```
(zie de PR; na de commit leeg)
```
