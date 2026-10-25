# 0.86.0: stofzuigermeldingen kiest ieder zelf

Gevraagd op 25 oktober 2026: *"ik wil dat de gebruiker ook zelf kan kiezen
welke meldingen hij van de stofzuiger wilt ontvangen. Nu moet ik al beheerder
in de gui alles aanklikken en dan krijgt de gebruiker ook alles snap je. Het
moet zo instelbaar mogelijk zijn voor de gebruiker."*

## Wat er veranderd is

**In de pop-up achter het potlood** staan onder het vinkje Robotstofzuiger,
zolang dat aan staat, twee rijen rondjes met een vinkje:

- **Waarover**: Klaar met schoonmaken, Storing, Water en stofzak, Onderhoud;
- **Van welke robot**: één per robot, alleen als de kaart er meer dan één
  heeft.

Een tik werkt meteen, net als het vinkje zelf. De regel onder Robotstofzuiger
zegt wat DEZE persoon krijgt: *"Klaar, tanks en onderhoud · Dreame boven"*.
Een groep met maar één keuze staat er niet: die zegt hetzelfde als het vinkje
erboven.

**In de editor** heet "Waarover" nu **Te kiezen**. De beheerder kiest daar wat
er te kiezen valt, en welke robots er zijn. De persoon kiest daarbinnen.

**Wie niets kiest, krijgt alles** wat de kaart aanbiedt. Dat wordt bewaard als
een lijst die ONTBREEKT, niet als de volle lijst. Komt er later een robot of
een soort bij op de kaart, dan krijgt wie alles had die er vanzelf bij
(`nieuweKeuze` in `meldingen-logica.js`). Een lege lijst is niets.

## Waar het staat

| Wat | Waar |
|---|---|
| de keuze per persoon | `keuzes` in de opslag van de meldingen (`store.py`), per melding per persoon `gebeurtenissen` en `robots` |
| het commando | `domotiapp_lovelace/meldingen/keuze` `{melding, persoon, soort, waarden}`, `waarden: null` is alles. Iedereen mag het, net als `meldingen/aan`: de kaart hangt ook op een tablet met een kioskaccount |
| wie een melding krijgt | `_ontvangers` in `motor.py`: aan, binnen wat de kaart aanbiedt, en binnen zijn eigen keuze |
| wat de pop-up toont | `keuzes_` en `kies` in `meldingen-card.js`, de rondjes in `meldingen-scherm.js` |

## Gemeten

In de testinstance op de mini-pc (8127), met een echte browser (Chromium van
Playwright, 393 breed, `isMobile`) en echte kliks (`isTrusted: true` op alle
vijf). Bundel `?v=7c2208c74fff`, gelijk aan de sha256 op schijf.

- Pop-up van `dev`, vóór: vier rondjes Waarover en twee robots, allemaal aan.
  Het vak is 361 breed (x 16 tot 377). Het rechtste rondje eindigt op x 335,
  binnen het vak. De twee rijen Waarover staan op y 404,3 en 444,3, en de
  robots op 506,3. Elk rondje is 34 hoog.
- Tik op "Storing" en op "X50 Ultra Complete": die twee staan uit. De regel
  werd *"Klaar, tanks en onderhoud · Dreame boven"*, en in de opslag van de
  server stond
  `{'gebeurtenissen': ['klaar', 'station', 'onderhoud'], 'robots': ['vacuum.dreame_boven']}`.
- Hoofdvinkje uit: de rondjes verdwijnen. Weer aan: ze zijn er weer, met de
  keuze van daarnet.
- Daarna in Home Assistant, met de melding van `dev` naar
  `notify.persistent_notification`:
  - een storing op Dreame boven gaf niets (`dev` wil geen storing);
  - Storing weer aan, en een storing op de X50: niets (`dev` wil alleen Dreame
    boven);
  - een storing op Dreame boven: *"Storing: Wiel vast"*.

De keuzes van `dev` zijn daarna weer op alles gezet.

## Toetsen

Python: vijf erbij in `tests/meldingen/test_stofzuiger.py`:
- waarover per persoon;
- welke robot;
- niets gekozen is alles en leeg is niets;
- de kaart beperkt wat er te kiezen is;
- het commando over de websocket.

JS: vier erbij in `tests/js/meldingen-stofzuiger.test.mjs`. Alle negen zijn
**NIEUW GEDRAG**. Op de code van 0.85.1:

```
FAILED tests/meldingen/test_stofzuiger.py::test_ieder_kiest_zelf_waarover - A...
FAILED tests/meldingen/test_stofzuiger.py::test_ieder_kiest_zelf_van_welke_robot
FAILED tests/meldingen/test_stofzuiger.py::test_niets_gekozen_is_alles_en_leeg_is_niets
FAILED tests/meldingen/test_stofzuiger.py::test_de_kaart_beperkt_wat_er_te_kiezen_is
FAILED tests/meldingen/test_stofzuiger.py::test_keuze_via_de_websocket - KeyE...
5 failed, 28 passed
    not ok 1 - niets gekozen is alles wat de kaart aanbiedt
    not ok 2 - een keuze binnen wat de kaart aanbiedt, in de volgorde van de kaart
    not ok 3 - een tik maakt een lijst, en alles weer aan is null
    not ok 4 - de regel zegt wat deze persoon krijgt
# pass 9
# fail 4
```

Totaal: 2067 JS-tests en 936 Python-tests groen; `verify`,
`check:registratie`, `check:css`, `check:controls` en `check:taal` groen.

## Samenvatting

Bij de robotstofzuiger kiest ieder nu in zijn eigen pop-up waarover hij een
melding wil en van welke robot. De beheerder bepaalt in de editor alleen nog
wat er te kiezen valt.

## Wat niet lukte

- Niet op een echte telefoon gezien; de pop-up wel op telefoonbreedte.
- Afval heeft (nog) geen keuzes per persoon: daar is alleen aan of uit. Als de
  eigenaar dat daar ook wil (bijvoorbeeld alleen de ochtend, of alleen GFT),
  is het dezelfde opzet.

## Aannames

- "Zo instelbaar mogelijk" is per persoon waarover en van welke robot. Een
  eigen grens voor onderhoud of een eigen wachttijd per persoon zit er niet
  in.
- Een groep met één keuze laat ik weg (een kaart met één robot toont geen
  robotkeuze).

## git status --porcelain

```
(zie de PR; na de commit leeg)
```
