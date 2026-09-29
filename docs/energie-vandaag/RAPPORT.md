# De energiegrafiek van het infoscherm toont vandaag (0.53.0)

Een open vraag sinds 10 september 2026: de afgelopen 24 uur, of vandaag vanaf
middernacht? Zijn antwoord op 29 september 2026: *"Energiegrafiek vanaf
middenacht."*

## Wat er veranderd is

Het energieblok en de energiepagina van het infoscherm (met een losse
energiesensor) tekenden de afgelopen 24 uur, met "nu" aan de rechterrand. Nu:

- de as loopt van **00:00 tot 24:00** van vandaag, en de lijn **stopt bij nu**,
  zoals het energiedashboard van Home Assistant het tekent;
- het stipje aan het eind van de lijn staat op nu, en niet meer tegen de
  rechterrand;
- de meting van gisteravond is de waarde waarmee de lijn om 00:00 begint;
- de teksten zeggen "vandaag": *Vermogen vandaag*, *Verbruik per uur,
  vandaag*, en bij een kWh-teller de tegel *Vandaag* in plaats van
  *Afgelopen 24 uur*;
- op de dag dat de klok verzet wordt begint en eindigt de as ook om middernacht
  (`dagVenster` rekent met de kalender, niet met 24 uur).

Het uitdunnen van de lijn in het kleine blok (`verdunReeks`) maakt geen punten
meer na nu. Anders had een leeg halfuur na nu de laatste waarde geërfd, en was
de lijn vlak doorgetrokken tot middernacht.

Met een energiedashboard van Home Assistant (zonder losse sensor) toonde het
blok al vandaag; dat is ongewijzigd.

## Bewijs

**Unittests** (`tests/js/infoscherm-energie-vandaag.test.mjs`, 6 tests):
`dagVenster` (vandaag, precies om 00:00, de dag van de klokverzetting),
`energieReeks` met een dagvenster (vermogen en teller: as tot middernacht, lijn
tot nu, niets na nu) en `verdunReeks` (geen punten na nu). Op de code van vóór
deze ronde falen ze alle 6: drie omdat `dagVenster` niet bestond, en drie op
gedrag. `van` was daar "nu min 24 uur" (`1790598600000` in plaats van middernacht), en
`verdunReeks` trok de lijn door tot morgen 00:00. De bestaande tests van de
24-uursreeks slagen nog: zonder `van` en `tot` rekent `energieReeks` zoals
eerst. Hele suite: **1254 JS-tests groen**, en alle CI-controles lokaal groen.

**In de browser**, na zijn "breng alles uit test alles" (29 september 2026,
21:05). Draaiende bundel gecontroleerd op de `?v=` (`9f4b5c4e9798`, gelijk aan
schijf). Het testtabblad was het actieve tabblad in zijn venster en werd
zichtbaar zonder dat er één toets verstuurd is (toetsenlogboek: 0 aanslagen).
Energiesensor `sensor.power_consumption` (demo, 100 W):

| | gemeten |
|---|---|
| energieblok op het welkomscherm | de lijn loopt tot het stipje, en daarna is het vak leeg |
| positie van het stipje | midden op **87,85%** van de grafiek; 21:05 van 24:00 is **87,85%** |
| "Alles bekijken" (echte klik) | opent in de testinstance de pagina van het energiedashboard (die toonde al vandaag, 00-23) |
| sensorpagina in het groot (`htmlEnergie_(true)`, echte gegevens) | titel "Vermogen vandaag", as 00:00 · 06:00 · 12:00 · 18:00 · 24:00, stipje op 87,92% (21:06) |
| blok met as | 00:00 · 12:00 · 24:00 |
| kWh-teller (`sensor.total_energy_kwh`, tijdelijk) | titel "Verbruik per uur, vandaag", tegel **Vandaag 62,0 kWh** (het energiedashboard zei 61,0 kWh voor vandaag); daarna teruggezet |

De sensorpagina in het groot verschijnt alleen als er GEEN energiedashboard is;
in de testinstance is er een, dus die is uit de tekenfunctie van de kaart zelf
gelezen en niet via een klik.

## Wat niet lukte

- **De eerste poging tot een schermcontrole ging mis.** Het infoscherm tekent
  niets in een verborgen tabblad (het meet zijn eigen maat met een
  ResizeObserver), en bij het naar voren halen van het tabblad: de eigenaar had **Fortnite** vooraan staan, `SetForegroundWindow`
  lukte daardoor niet, en het script stuurde zijn 30 keer Ctrl+Tab naar het
  spel in plaats van naar Chrome. Direct gestopt en gemeld; zijn Chrome bleef
  onaangeroerd. Nieuwe **valkuil 60** in CLAUDE.md: nooit een toets sturen
  zonder vóór elke aanslag te controleren dat Chrome vooraan staat.
- In de testinstance is `sensor.power_consumption` als energiesensor voor het
  infoscherm ingesteld, zodat de controle straks meteen kan.

## Aannames

- Een as van middernacht tot middernacht, met de lijn tot nu, en niet een as
  van middernacht tot nu. Om 00:30 zou die laatste een grafiek van een half uur
  breed zijn.

## git status --porcelain

Bij het schrijven van dit rapport, vóór de commit:

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/infoscherm-card.js
 M src/cards/infoscherm-logica.js
?? docs/energie-vandaag/
?? tests/js/infoscherm-energie-vandaag.test.mjs
```
