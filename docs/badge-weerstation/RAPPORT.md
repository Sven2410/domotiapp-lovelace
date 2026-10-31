# 0.90.0: badge met de soort Weerstation

Gevraagd op 31 oktober 2026: *"kan je ook bij de badge weerstation toevoegen? Daar kan
ik dan de temperatuur kiezen. Net als keuze menu van badge type light dus weerstation
er bij"*.

## Samenvatting

In de keuzelijst **Soort badge** staat nu **Weerstation**. Daaronder kies je de
temperatuur, uit de sensoren met `device_class: temperature`. De badge toont de waarde
("15,6 °C", hoogstens één decimaal, met de eenheid van de sensor) met een thermometer.
Een lege kop wordt "Buiten"; een kop die er al stond blijft staan. Het kleurveld blijft
werken, en een tik opent de details van de sensor.

## Gemeten

Testinstance op de mini-pc (HA 2026.8.1), headless Chromium met Playwright en echte
kliks (`isTrusted: true`). De `?v=` van de geladen bundel (`c25aa524a84f`) was gelijk aan
de sha256 op schijf.

| Stap | Uitkomst |
|---|---|
| Weerstation kiezen in de echte keuzelijst | `mode: "weerstation"`, `icon: "thermo"` |
| de kiezer openen | vier temperatuursensoren, en geen andere |
| `sensor.outside_temperature` kiezen en opslaan | `entity` in de YAML |
| na herladen, op de view | "15,6 °C" bij sensorwaarde 15.6, thermometer, blauw, 36 hoog |
| tik op de badge | de details gaan open |

De badge is 36 hoog, de maat van een badge van Home Assistant. Geen paginafouten.

**Proeven:** `tests/js/badge-weerstation.test.mjs`, 6 tests, NIEUW GEDRAG: op de code van
vóór deze ronde valt het bestand om (`temperatuurTekst` bestaat niet). JS 2130 groen;
`verify`, `check:registratie`, `check:css`, `check:controls` en `check:taal` groen.
Python-tests zijn niet gewijzigd.

## Wat niet lukte

- **Niet gemeten op het echte weerstation.**
- **De standaardkop "Buiten" is niet in de browser gezien:** de proefbadge had al een
  kop. Hij loopt via dezelfde `SOORT_STANDAARD` als de andere soorten.
- **Niet gemeten:** het lichte thema en een sensor die niet bereikbaar is.

## Aannames

- Beheer stelde voor dat de badge een regenicoon krijgt als het regent. Dat is niet
  gebouwd: de vraag ging over de temperatuur. Met een icoon via een sjabloon kan het wel.
- Een sensor zonder `device_class: temperature` staat niet in de kiezer.

## git status --porcelain

Leeg na de commit van deze ronde.
