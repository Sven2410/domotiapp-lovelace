# 0.120.0: elk deel van de overzichtskaart tonen of verbergen

De eigenaar, 9 november 2026: "ik wil ook de mogelijkheid hebben om de agenda te verbergen op de overzichtkaart. Eigenlijk
alle opties kunnen weergeven en verbergen".

## Wat er veranderd is

- **Een schakelaar per deel in de editor:**
  - Begroeting, Datum en Klok;
  - Weer;
  - Agenda, met daarbinnen "Knoppen onder de agenda" (Kalender, Agenda's, + Afspraak);
  - Let op, Melders en Batterijen.

  In de config is dat `toon_<deel>`. Zonder die sleutel staat het deel er, zoals voor 0.120.0. Een bestaand dashboard
  verandert dus niet.
- **De instellingen van een deel staan in een uitklapblok onder zijn schakelaar**, en alleen als hij aan staat. Dat is de
  vorm uit de Vormregels: een schakelaar op één regel, en het blok eronder. Verbergen gooit de instellingen niet weg. Zet
  je het deel weer aan, dan staan ze er nog.
- **Een verborgen agenda haalt ook niets op.** Er komen dan geen abonnementen op de agenda's en geen lijst met
  toegevoegde agenda's.
- **Zonder kop en weer** is de lijst het eerste op de kaart, en dan staat er geen streep boven. Staat van de kop alleen de
  klok aan, dan blijft die rechts.
- De logica staat in `zichtbaar` en `ONDERDELEN` in `overzicht-logica.js`. Een deel toevoegen kan daar.

## Gemeten

**Test, NIEUW GEDRAG.** `tests/js/overzicht-logica.test.mjs`, "zichtbaar", 3 tests:
- zonder instelling staat alles erop;
- `toon_<deel>: false` verbergt dat deel;
- de knoppen gaan mee weg met de agenda.

Op 0.119.1 faalt het bestand: `does not provide an export named 'ONDERDELEN'`.

**Testinstance, als telefoon.** 390 breed, met `isMobile` en `hasTouch`. De geladen bundel was die op schijf
(`baa50e64bcc1`).

| stand | wat er staat | agenda-abonnementen | kaart (b × h) | pagina scrollWidth / clientWidth |
|---|---|---|---|---|
| standaard | alles; regels open, open, agenda, agenda | 4 | 374 × 504 | 390 / 390 |
| agenda uit | regels open, open; geen knoppen | 0, en geen lijst toegevoegde | 374 × 376 | 390 / 390 |
| knoppen uit | regels met agenda, geen knoppen | 4 | 374 × 440 | 390 / 390 |
| kop en weer uit | alleen regels en knoppen; streep boven de lijst 0px | 4 | 374 × 248 | 390 / 390 |
| alleen de klok van de kop | klok 17px van de rechterrand, zoals standaard | 4 | 374 × 440 | 390 / 390 |

De hoogtes vallen op de rasterrijen.

**De editor, op de telefoon.** De kaart is geopend in de echte bewerkmodus van Home Assistant, met een tik op de kaart.
Daarna is "Agenda tonen" uitgetikt. Het blok Agenda met zijn vier velden ging weg, en in de editor stond
`toon_agenda: false`. Het voorbeeld in de dialoog toonde daarna geen agendaregels, geen knoppen en 0 abonnementen. Alle 5
gebeurtenissen waren `isTrusted: true`, waarvan 2 tikken. Er waren geen fouten in de console. Daarna is niet opgeslagen,
en de config van de kaart is teruggezet.

JS-tests 2389 groen. Bundel, registratie, controls, css en taal groen. Python is niet gewijzigd.

## Samenvatting

Op de overzichtskaart is elk deel aan of uit te zetten in de editor: begroeting, datum, klok, weer, agenda (en apart de
knoppen eronder), let op, melders en batterijen. Standaard staat alles aan, zoals het was.

## Wat niet lukte

Niets.

## Aannames

- "Alle opties" lees ik als de delen van de kaart. De favorieten hadden al een schakelaar. De regel met dagen van het weer
  gaat al weg met "Dagen vooruit" op 0, en houdt dus geen eigen schakelaar.
- De knoppen onder de agenda staan apart aan of uit, binnen het blok Agenda. Een klant kan dan de afspraken zien zonder
  er iets aan te kunnen doen.

## git status --porcelain

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/overzicht-card.js
 M src/cards/overzicht-logica.js
 M src/i18n/en/overzicht.js
 M tests/js/overzicht-logica.test.mjs
?? docs/overzicht-onderdelen/
```
