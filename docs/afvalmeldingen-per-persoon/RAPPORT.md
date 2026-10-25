# 0.87.0: afvalmeldingen kiest ieder zelf

Gevraagd op 25 oktober 2026, na hetzelfde voor de robotstofzuiger (0.86.0):
*"ja doe dat ook voor afval"*.

## Wat er veranderd is

In de pop-up achter het potlood staan onder **Afvalmeldingen**, zolang dat aan
staat, twee rijen rondjes:

- **Wanneer**: *De avond ervoor* en *De ochtend zelf*. Alleen als de kaart
  allebei de sensoren heeft.
- **Welke bakken**: elke bak die de kaart kent. Alleen als dat er minstens
  twee zijn.

De melding noemt dan alleen de bakken van die persoon. Bij "Papier, Restafval"
krijgt wie geen Papier wil *"Morgen Restafval"*. Gaat er die dag niets van
zijn bakken weg, dan krijgt hij niets. De tag en de knop "Staat buiten" blijven
voor het hele huis dezelfde.

De regel onder Afvalmeldingen zegt *"melding om 19:30"* alleen als deze persoon
die avond ook echt iets krijgt.

## Welke bakken er te kiezen zijn

Bij de stofzuiger staat vast wat er te kiezen is; bij afval verschilt het per
gemeente. Daarom twee bronnen:

1. **Wat de sensor ooit noemde.** De server leest de afvalsensoren bij elke
   lezing van de dashboards: bij het opstarten, bij een opgeslagen dashboard,
   elk uur, en bij het versturen. Elke bak die hij ziet, onthoudt hij
   (`gezien` in de opslag). De sensor van morgen noemt een hele dag de bak van
   morgen, dus na een paar weken staan ze er allemaal.
2. **Wat de beheerder vooraf invult**: het nieuwe veld *Bakken om uit te
   kiezen* in de editor, met een lijst en ook eigen woorden. Die staan meteen
   in de pop-up.

**Bewaard wordt wat iemand NIET wil** (`bakken_niet`). Een bak die later voor
het eerst opduikt (kerstbomen), krijgt iedereen gewoon. Bij de momenten wordt
bewaard wat iemand WEL wil, net als bij de stofzuiger; wie niets kiest krijgt
alles.

## Gemeten

In de testinstance op de mini-pc, met een echte browser (393 breed) en een
echte klik (`isTrusted: true`). Het was een proef van begin tot eind:

1. `sensor.afval_morgen` op *"Papier, Restafval"*. De kaart kreeg
   `afval_bakken: ["GFT"]` en de avondmelding om 22:39 (het was 22:36).
2. In de pop-up van `dev` stonden onder Afvalmeldingen *Wanneer* (De avond
   ervoor, De ochtend zelf) en *Welke bakken* (GFT, Papier, Restafval). GFT
   kwam uit de editor; Papier en Restafval had de server zelf geleerd
   (`gezien: ['Papier', 'Restafval']`).
3. Klik op *Papier*: uit. In de opslag stond `{'bakken_niet': ['Papier']}`.
4. Om 22:39 kwam in Home Assistant binnen:
   *"Morgen Restafval | Morgen wordt Restafval opgehaald. Zet de container
   vanavond aan de straat."*

Daarna zijn de kaart (19:30) en de keuze van `dev` (alles) teruggezet.

## Toetsen

- `tests/meldingen/test_afval_keuzes.py`, 7 gevallen:
  - alleen de ochtend;
  - alleen de eigen bakken in de melding;
  - geen van zijn bakken is geen melding;
  - een nieuwe bak krijgt iedereen;
  - de kaart leert de bakken;
  - de proef kijkt niet naar de keuze;
  - het commando.
- `tests/js/meldingen-afval-keuzes.test.mjs`, 8 gevallen.

Drie zijn REGRESSIEWACHT (ze slagen ook op 0.86.0), de rest NIEUW GEDRAG. Op de
code van 0.86.0:

```
FAILED tests/meldingen/test_afval_keuzes.py::test_alleen_de_ochtend - Asserti...
FAILED tests/meldingen/test_afval_keuzes.py::test_alleen_de_eigen_bakken_in_de_melding
FAILED tests/meldingen/test_afval_keuzes.py::test_geen_van_zijn_bakken_is_geen_melding
FAILED tests/meldingen/test_afval_keuzes.py::test_de_kaart_leert_de_bakken - ...
FAILED tests/meldingen/test_afval_keuzes.py::test_keuze_momenten_via_de_websocket
5 failed, 2 passed
# pass 1
# fail 7
```

Totaal: 2075 JS-tests en 943 Python-tests groen; `verify`,
`check:registratie`, `check:css`, `check:controls` en `check:taal` groen.

## Samenvatting

Bij afval kiest ieder nu in zijn eigen pop-up wanneer hij een melding wil en
voor welke bakken. Zijn melding noemt alleen die bakken. De kaart leert de
bakken zelf van de sensor; de beheerder kan ze vooraf invullen.

## Wat niet lukte

- Niet op een echte telefoon gezien; wel de echte melding in Home Assistant.

## Aannames

- Een bak tellen we op zijn naam zoals de melding hem schrijft ("GFT",
  "Papier"), zonder verschil tussen hoofd- en kleine letters. Noemt de
  gemeente hem ineens anders ("Groente, fruit en tuin"), dan is dat een nieuwe
  bak.

## git status --porcelain

```
(zie de PR; na de commit leeg)
```
