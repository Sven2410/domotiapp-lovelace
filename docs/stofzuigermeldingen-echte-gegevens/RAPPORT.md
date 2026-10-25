# 0.85.1: de stofzuigermeldingen naast de echte gegevens

0.85.0 was gebouwd op de dumps van 15 oktober 2026 en op de bron van Tasshack.
Op 25 oktober 2026 las de beheersessie bij de klant 14 dagen geschiedenis van
beide robots uit, alleen lezen. Het staat in de privénotities van die klant,
want de namen en adressen horen niet in deze repo.

## Wat de gegevens lieten zien, en wat er veranderd is

| Gezien bij de klant | 0.85.0 | 0.85.1 |
|---|---|---|
| Bij bijvullen en legen zegt de tanksensor een à twee minuten `not_installed` of `not_installed_or_full` (18:30 en 18:31 bij de L40s, 16:41 en 16:42 bij de X50) | meteen "De schoonwatertank is niet geplaatst", terwijl je hem in je handen hebt | een tankmelding gaat pas uit als het na 3 minuten (`STATION_WACHT`) nog zo is |
| `low_water_warning` ging om 17:55 naar `no_water_left` en bleef daar na het bijvullen om 18:05. Dreame wist hem pas als iemand de melding in Home Assistant wegklikt | de melding zou blijven staan en de volgende keer niet opnieuw komen | doet niet meer mee; de tanksensor ging wél terug van `low_water` naar `installed` |
| `error: battery_low` midden in een beurt, telkens één minuut (22-10 en 25-10, de X50) | "Storing: ..." bij elke lange beurt | geen storing (`GEEN_STORING`); de robot laadt en gaat zelf verder |
| Rond elke herstart staat alles even op `unavailable` | een lopende melding werd van de telefoon gehaald | een waarde naar `unavailable` of `unknown` wordt genegeerd |

Wat wél klopte: `task_status` ging bij de L40s om 15:27 naar `cleaning` en om
17:52 naar `completed`. Er zat een herstart tussen, en de robot zelf reed zeven
keer heen en weer om de pads te wassen (`returning`, `docked`, `cleaning`).
Dat gaf één "klaar". De waarden `cleaning` en `room_cleaning` vallen onder de
regel, die op het woord `cleaning` let.

Wie op `docked` van de robot zelf afging, had zeven keer "klaar" gekregen.
Daarom wacht de reserve voor een merk zonder `task_status` nu vijf minuten
(`KLAAR_ZONDER_TAAK`): klaar telt pas als de robot in het station BLIJFT. Bij
de klant stond een robot binnen een beurt hooguit een minuut in het station.

Verder uit de gegevens:
- de meldingen van de integratie zelf staan bij beide robots aan;
- er zijn geen eigen automatiseringen (valkuil 38 speelt hier niet);
- er staat nog geen meldingenkaart op een dashboard.

## Gemeten

In de testinstance op de mini-pc, met de nagebootste L40s: de vuilwatertank
op `not_installed_or_full` gezet om 20:56:24.

```
na 5 s:       []
na 2 min:     []
na 3 min 15:  ['De vuilwatertank is vol of niet geplaatst. Leeg hem.']
```

## Toetsen

`tests/meldingen/test_stofzuiger.py` heeft er zes bij; twee bestaande zijn
aangepast aan het wachten. De reeksen komen uit de geschiedenis van de klant:
het bijvullen, en de hele beurt van 15:27 tot 17:52. Op de code van 0.85.0
falen er 8:

```
FAILED tests/meldingen/test_stofzuiger.py::test_de_motor_volgt_de_sensoren_van_het_apparaat
FAILED tests/meldingen/test_stofzuiger.py::test_vuilwatertank_vol - Assertion...
FAILED tests/meldingen/test_stofzuiger.py::test_een_tank_eruit_halen_is_geen_melding
FAILED tests/meldingen/test_stofzuiger.py::test_de_waterwaarschuwing_doet_niet_mee
FAILED tests/meldingen/test_stofzuiger.py::test_bijna_lege_batterij_is_geen_storing
FAILED tests/meldingen/test_stofzuiger.py::test_een_herstart_wist_geen_storing
FAILED tests/meldingen/test_stofzuiger.py::test_zonder_taak_klaar_als_hij_in_het_station_blijft
FAILED tests/meldingen/test_stofzuiger.py::test_geen_fout_is_geen_storing - A...
8 failed, 20 passed
```

Twee zijn als REGRESSIEWACHT gelabeld, omdat ze ook op 0.85.0 slagen: de
echte beurt (één "klaar") en bijna leeg plus weer bijgevuld.

Totaal: 2063 JS-tests en 931 Python-tests groen; `verify`,
`check:registratie`, `check:css`, `check:controls` en `check:taal` groen.

## Samenvatting

Vergeleken met de echte geschiedenis van twee Dreames geeft 0.85.1 geen
melding meer bij het bijvullen of legen, geen storing bij een bijna lege
batterij, geen blijvende waterwaarschuwing, en wist een herstart niets van de
telefoon.

## Wat niet lukte

- De gebeurtenissen op de bus (`dreame_vacuum_*`) zijn nog niet gevangen; de
  beheersessie luistert nog. Ze zijn niet nodig voor deze kaart, wel als
  controle.
- Niet op een echte telefoon gezien.

## Aannames

- Drie minuten wachten is genoeg voor bijvullen en legen: bij de klant duurde
  dat telkens één à twee minuten.
- Vijf minuten in het station betekent klaar voor een ander merk. Dat is niet
  bij een ander merk gezien; het volgt uit wat de Dreames deden.

## git status --porcelain

```
(zie de PR; na de commit leeg)
```
