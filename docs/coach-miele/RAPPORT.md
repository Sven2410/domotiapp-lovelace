# De programmakaart tegen de echte coach v0.124.0, met Miele

Geen uitgave: de kaart verandert niet. Deze ronde voegt een echte dump toe als
vaste testinvoer, met tests erop, zoals de afspraak in de kop van
`coach-logica.js` vraagt.

## Wat er gebeurde

Coach v0.124.0 maakt wasmachine en droger tot programma-apparaten. Het
contract is dat van de vaatwasser, met `type` "wasmachine" en "droger". Bij een
klant installeerde de eigenaar die coach samen met lovelace 0.71.0. De
beheersessie zette er de Miele-wasmachine en -droger in en maakte om 22:2x een
dump van de entiteiten van de coach. De machines stonden uit en de deur van de
wasmachine stond open.

De dump staat in `tests/js/vaste-invoer/coach-0.124.0-wasmachine-droger.json`.
Er stonden geen persoonsgegevens in, en de ids zijn vervangen. Wat hij laat
zien:
- **Startsensor:** toestand `unknown`, `stand` "niet_vrijgegeven", `type`
  wasmachine of droger, en `later` en `klaar_om` null.
- **`entiteiten`:** de Miele-sensoren zelf: status, program (een SENSOR,
  `program_id`), remaining, door, start, stop, remote_start en energy.
- **Knoppen:** "goedkoopste moment", "nu starten" en "vrijgave intrekken".
- **Namen:** het apparaat van de droger heet in de coach "Droger", bij Miele
  "Wasdroger".

## Tests

`tests/js/coach-miele-dump-0124.test.mjs`, 7 tests. Ze draaien op deze dump
samen met de Miele-dump van dezelfde klant (`miele-was-droog-vries.json`) en
toetsen wat de kaart ermee doet:
- **Kiezen:** twee apparaten van de coach, geen vaatwasser, dus "Kies in de
  editor"; met een gekozen apparaat geen melding.
- **Knoppen:** "Mag draaien" en "Nu starten", met de knoppen van de coach.
- **Velden:** status, resterende tijd, deur, start en stop komen van de coach;
  het programma niet, want dat is een sensor.
- **De rest van het apparaat:** via de status van de coach vindt de kaart
  fase en tegels ("Deur: Open", "Programma: Geen").
- **De deur:** met de coach aan zegt de kaart "Deur open" in oranje zolang de
  machine uit staat, net als "Klep open" bij de vaatwasser.
- **De droger:** de coach noemt hem "Droger", maar de kaart vindt de
  Miele-sensoren van de "Wasdroger".

Ze zijn allemaal gelabeld als REGRESSIEWACHT. De kaart hoefde niet te
veranderen, dus ze slagen ook op `main` (0.71.0): `pass 7, fail 0`. Op deze
tak zijn alle 1871 JS-tests groen.

## Samenvatting

- **De echte dump** van coach v0.124.0 met de Miele-wasmachine en -droger van
  de klant is vaste testinvoer geworden, met zeven tests.
- **De kaart werkt er zonder wijziging mee.** Wat de eigenaar met de coach aan
  ziet: "Mag draaien", "Nu starten" en "Handmatig", de tegels van Miele, en
  "Deur open" zolang de deur openstaat en hij niet draait.

## Wat niet lukte

- **Geen dump met een gekozen of draaiend programma.** Die komt nog van
  beheer.
- **Niet in een browser gemeten met de coach aan.** De nagebootste coach in de
  testinstance heeft geen wasmachine. De kaartlogica is met de echte dump
  getoetst, en de weergave is dezelfde als bij de vaatwasser met de coach.

## Aannames

- "Deur open" in de statusregel met de coach aan is bedoeld: met de deur open
  start hij niet. Aan beheer gemeld met de vraag of de eigenaar dat zo wil.

## git status --porcelain

Na het vastleggen leeg (`git status --porcelain` geeft niets).
