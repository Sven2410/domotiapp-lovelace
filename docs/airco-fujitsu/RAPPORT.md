# Fujitsu General op de airco-kaart (0.93.0)

31 oktober 2026, tak `fase-137/airco-fujitsu`. Gevraagd door de eigenaar: de airco-kaart
uitbreiden met het merk Fujitsu, met een eigen foto, en een externe temperatuursensor
voor elk merk airco. Een beheersessie heeft de airco's bij een klant alleen uitgelezen,
inclusief tien dagen geschiedenis en de broncode van de integratie.

## Samenvatting

**Het merk op het apparaat is niet Fujitsu.** De twee werkende airco's melden zich als
fabrikant `Atlantic` via de HACS-integratie `cozytouch`, met als model
`Air Conditioner (<kamer>)`. De eigenaar kent ze als Fujitsu en de foto is een Fujitsu
General. De foto hangt daarom aan allebei de namen, en niet aan een type, want dat wordt
niet doorgegeven.

| Wat | Voor | Nu |
|---|---|---|
| Foto op een Atlantic of Fujitsu | icoon | `aircos/fujitsu-general.webp`, automatisch; in de editor te kiezen voor elke airco |
| Kamertemperatuur op een Cozytouch-airco | **16° binnen**, de ingestelde minimumgrens | niets, tot er een sensor gekozen is |
| Lamellen | Up, Middle up, Middle down, Down | Boven, Midden-boven, Midden-onder, Onder |
| Presets | None, Activity, Basic, Prog, Override | Geen, Activiteit, Basis, Weekprogramma, Tijdelijk |
| Keuzelijst als de airco een keuze niet overneemt | bleef de keuze tonen | na 3 tellen terug naar wat er echt staat |
| Externe temperatuursensor | bestond al als veld Kamertemperatuur | hetzelfde veld, de hulptekst noemt het nu zo |

**De externe sensor hoefde niet gebouwd te worden.** De airco-kaart had het veld al, los
van merk en integratie, en die sensor gaat voor wat de airco zelf meet. Alleen de
hulptekst is aangepast, zodat het te vinden is.

**De 16° was een echte fout, niet alleen bij dit merk.** `apparaatDelen` nam de eerste
`temperature`-sensor van het apparaat als kamertemperatuur, en dat was hier de ingestelde
grens (`temperature_adjustment_min`). Nu tellen grenzen en doelen niet meer mee, voor elk
merk. `thermostat_temperature_z1` van Cozytouch ook niet: die stond tien dagen op één
waarde, ook terwijl de airco verwarmde op 1367 W.

## Gemeten

Testinstance met een nagebootste Atlantic (`nep_atlantic`, niet in git), naar de
uitlezing: zelfde fabrikant, model, `translation_key`'s en attributen, `temperature`
`null` bij uit en fan_only, per stand een eigen doel, en de lamellen die vanzelf meegaan.
Bundel op schijf `24b6f7ff912f`, geladen `24b6f7ff912f`. Kliks `isTrusted: true`.

| Proef | Uitkomst |
|---|---|
| uit, zonder sensor | Uit, foto 360×169 geladen in een vak van 104×56, geen "binnen", geen doel |
| Verwarmen | `heat`, doel 20°, lamellen Onder, kaart 376 hoog (op het raster) |
| doel + | 20,5 aangekomen op de airco |
| Stil, Midden-boven | `fan: quiet`, `swing: middle_up` |
| Koelen | `cool`, doel 24°, ondergrens 18, lamellen Boven |
| Ventileren | geen doel |
| tik op de foto | `off` |
| Basis kiezen | de nep leest terug als `none`: lijst toont Basis, 3 tellen later Geen |
| Eco kiezen | `eco`, en de lijst blijft op Eco |
| sensor kiezen in de editor, met de echte kiezer | `temperature: sensor.weather_station_temperature` in de YAML |
| gewone gebruiker, 393 breed | 24,7° binnen, geen overloop (0), tik op Koelen komt aan |
| licht en donker | de foto is in allebei te zien, op zijn eigen vlak |

**Proeven.** JS 2171 groen, Python 991 groen, `verify`, `check:registratie`, `check:css`,
`check:controls` en `check:taal` groen.

**Tegen de oude code** (`git archive main`, de nieuwe proef erin): 8 van de 20 falen,
allemaal gelabeld NIEUW GEDRAG; de 12 regressiewachten slagen. Onder de 8 de kamertemperatuur:

```
not ok 1 - NIEUW GEDRAG: de ingestelde minimumtemperatuur is geen kamertemperatuur
not ok 2 - NIEUW GEDRAG: de kaart zegt dus niets over binnen, en verzint geen getal
not ok 5 - NIEUW GEDRAG: ook een doel of een grens van een ander merk telt niet als kamer
```

De keuzelijst die terugspringt zit in de kaart zelf en is alleen in de browser gemeten.

## Wat niet lukte

- **Niet op een echte airco.** De beheersessie heeft niets geschakeld. Alles hierboven is
  op de nep, die naar de uitlezing en de broncode is gemaakt.
- **Niet gezien in tien dagen geschiedenis, dus onbekend of het iets doet:** de standen
  Auto, Ventileren en Drogen, alle presets behalve Geen, ventilator Stil, lamellen
  Midden-boven en Midden-onder. De kaart biedt ze wel aan, want de entiteit biedt ze aan.
- **Of de airco draait, kan de kaart hier niet zeggen.** Er is geen `hvac_action`. Dat is
  alleen af te lezen aan een losse slimme stekker, en die koppelt de kaart niet.
- **Hoe snel de kaart een stand laat zien, is niet gemeten.** Cozytouch is een cloud met
  polling elke 60 seconden. Laat de integratie een keuze niet meteen zien, dan staat de
  knop tot de volgende melding op de oude stand.
- **Het doel staat er niet bij uit.** `temperature` is dan `null`. Het staat wel in de
  numbers van de integratie, maar die leest de kaart niet.

## Aannames

- Atlantic en Fujitsu General horen bij elkaar: de units heten Atlantic op het apparaat en
  Fujitsu volgens de eigenaar. Een andere Atlantic krijgt deze foto ook; in de editor is
  dat om te zetten naar Geen of Eigen.
- Beide types bij de klant zien er hetzelfde uit, volgens de eigenaar.
- De woorden Activiteit, Basis, Weekprogramma en Tijdelijk zijn gekozen uit wat de
  broncode van de integratie ermee doet. Niet met de app vergeleken.

De foto is van de fabrikant en staat hier met toestemming van de eigenaar. De bron staat
in `_ref/aircos`.

## git status --porcelain

Leeg na de commit.
