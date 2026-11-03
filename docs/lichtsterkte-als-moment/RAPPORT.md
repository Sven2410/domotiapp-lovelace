# Lichtsterkte als moment (0.103.0)

3 november 2026, tak `fase-150/lichtsterkte`. Van de eigenaar rechtstreeks, terwijl 0.102.0 in de maak was: *"en ik wil dat de klant
ook lichtsterkte kan gebruiken als voorwaarde ipv zonsondergang bijvoorbeeld"*, en daarna: *"hij moet dan vragen waarvan je de
lichtsterkte wilt pakken en bij [een klant] is dat het geval dan het weerstation"*.

## Samenvatting

**Naast Tijd, Zonsopkomst en Zonsondergang staat nu Lichtsterkte**, voor aan en voor uit, ook in een onderdeel.

| Waar | Wat |
|---|---|
| de editor | een veld *Lichtsensor* (alleen sensoren met `device_class: illuminance`): waar de lichtsterkte vandaan komt, bijvoorbeeld het weerstation. Zonder sensor staat de keuze er niet |
| het scherm | *Als het donker wordt* of *Als het licht wordt*, een stapper voor de grens ("Donkerder dan 100 lx", in stappen 1, 2, 5, 10, 20, 50, 100, 200, 500, … 50.000), en eronder wat de sensor nu zegt ("Nu 78.000 lx") |
| de kaart | "Aan als het donker wordt (onder 50 lx) · uit om 23:00 · Elke dag" |
| de server | toetst de sensor zoals de lampen: alleen een sensor die op een kaart staat, of die al in de regel stond |

Een lamp begint met *Als het donker wordt*, een rolluik met *Als het licht wordt*; bij uit andersom.

**Wanneer het iets doet** (`automatisering/licht.py`, met de uitleg in de kop):

- **Als de grens overschreden wordt, niet zolang het donker is.** Eerst lichter dan 50 lux, dan donkerder. Anders gaan de lampen om
  middernacht opnieuw aan, en na elke uit meteen weer.
- **Vijf minuten aan een stuk.** Een wolk is nog geen avond.
- **Hooguit één keer per dag** per onderdeel en per aan of uit. Schemer die rond de grens schommelt, doet het niet drie keer. Het is
  de dag waarop het gebeurt, en die moet in de dagen van de regel staan.
- **Geen meting, geen moment.** `unavailable`, `unknown` of iets dat geen getal is: er gebeurt niets.
- **Na een herstart** wordt een overschrijding ingehaald. Wat de sensor de vorige keer zei en of het vandaag al gebeurde, staat in de
  opslag; was het licht toen Home Assistant stopte en donker toen hij terugkwam, dan gaan de lampen alsnog aan. Dezelfde grenzen
  als een tijd: aan tot 4 uur na de laatste keer dat de motor keek, uit tot 24 uur. Alleen de vijf minuten beginnen opnieuw.
- **Een nieuwe of gewijzigde regel kijkt eerst.** Wie om 20:00 een regel maakt voor "als het donker wordt", wil niet dat de lampen
  meteen aangaan. Een regel die uit staat, kijkt ook mee: anders gaan ze aan op het moment dat iemand hem weer aanzet.
- **Geen verschuiving in de vakantiemodus.** Het licht verschuift zelf al elke dag.

**Twee keuzes die ik zelf maakte:**

- **De beheerder kiest de sensor, de klant de grens.** Zo staat het in de vraag van de eigenaar ("hij moet dan vragen waarvan je de
  lichtsterkte wilt pakken"), en zo werkt de kaart al voor lampen: de beheerder bepaalt wat er te kiezen is.
- **Vijf minuten wachten, vast.** Kort genoeg om niet als "te laat" te voelen, lang genoeg voor een wolk. Een instelling erbij is
  het niet waard zolang niemand erom vraagt.

## Gemeten

In de testinstance, met het nagebootste weerstation als lichtsensor (`sensor.weather_station_illuminance`; zie `CLAUDE.md`,
Testmateriaal). Als gewone gebruiker (Receptie), met echte kliks en toetsen. De bundel in de pagina was die op schijf
(`65ab94a9c6a9`). `isTrusted` is `true` op alle 10 kliks en op de spatie in "Licht avond". Geen fouten in de pagina.

| Stap | Uitkomst |
|---|---|
| nieuwe regel, Kitchen Lights | Aan: Tijd, Zonsopkomst, Zonsondergang (gekozen), **Lichtsterkte**, Geen |
| Lichtsterkte | *Als het donker wordt* gekozen, "Donkerder dan 100 lx", "Nu 78.000 lx" |
| plus, min, min | 200, 100, 50: "Donkerder dan 50 lx" |
| opslaan | `aan: {soort: "licht", sensor: "sensor.weather_station_illuminance", lux: 50, richting: "donker"}` |
| de kaart | "Aan als het donker wordt (onder 50 lx) · uit om 23:00 · Elke dag" |

**De schemer, in het echt in de testinstance** (`nep_weerstation.zet`, en de motor zelf):

SCHEMER_UITKOMST

**Posities** (`getBoundingClientRect`, links en rechts in CSS-pixels):

| | 1366 breed | 390 breed |
|---|---|---|
| het blok Aan | 378 – 988 | 31 – 359 |
| de stapper | 378 – 988 | 31 – 359 |
| min en plus | 379 – 423 en 943 – 987 | 32 – 76 en 314 – 358 |
| overloop van het scherm | 0 | 0 |

Op 390 breed lopen de vijf keuzes over drie regels door, net als de andere rijtjes in dit scherm.

**De proeven:** 16 nieuwe in `tests/automatisering/test_licht.py` en 9 nieuwe in `tests/js/automatisering-licht.test.mjs`.

| | op deze tak | op 0.102.0 |
|---|---|---|
| Python, nieuw | 16 groen | 10 rood, 6 groen |
| JS, nieuw | 9 groen | 7 rood, 2 groen |
| alles | 1068 Python, 2278 JS, allemaal groen | |

0.102.0 weigert een moment op het licht bij opslaan, maar de motor leest het daar als zonsondergang (rond 16:55 in de proeven). Een
proef die alleen zegt dat er niets gebeurt, kan daar dus slagen. Die zes zeggen dat in hun eigen kop:
- een wolk om 14:00;
- de dagen;
- een nieuwe regel om 20:00;
- een regel die weer aangezet wordt;
- geen tweede keer na een herstart;
- te lang weg.

De proeven die het gedrag dragen (vijf minuten, één keer per dag, de herstart met inhalen, de sensor die op de kaart moet staan, en
wijzigen) vallen op 0.102.0 om. In de JS slagen daar de regressiewacht op `metSoort` en de proef die het moment ongewijzigd naar de
server stuurt.

## Wat niet lukte

- Niet in het echt bij een klant beproefd. Een echt weerstation geeft ruis, en of vijf minuten daar genoeg is, zie je pas bij echte
  schemer.

## Aannames

- `device_class: illuminance` in de editor. Een lichtsensor zonder die klasse is daar niet te kiezen; in YAML kan hij wel.
- 100 lux als begin. In de stapper staat de meting van nu eronder, zodat de klant ziet waar hij staat.

## git status --porcelain

```
(schoon na de commit)
```
