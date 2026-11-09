# 0.119.1: iCloud zoekt op een tijdvak, en afspraken op tijd gaan voor

Twee meldingen van de eigenaar, 9 november 2026, bij de eerste proef met 0.119.0 op zijn iPhone:

1. "De agenda gaf een fout: ReportError at '412 Precondition Failed ', reason no reason"
2. "en ik vind afspraken op tijd belangrijker als afspraken voor een hele dag"

## Wat er aan de hand was

- **De fout.** De server zocht de afspraak op zijn uid (`event_by_uid` van de bibliotheek `caldav`). Dat is een REPORT
  met een text-match op de eigenschap UID, en iCloud weigert dat met 412. De CalDAV-server waartegen 0.119.0 gemeten
  was (Radicale) doet het wel, en daarom kwam het daar niet naar boven. Een zoekvraag op een tijdvak doet iCloud wel: zo
  haalt de integratie van Home Assistant zijn afspraken ook op.
- **De volgorde.** Binnen een dag stond een hele dag voorop: op het overzicht, op de agendakaart en in de kalender.
  Omdat het overzicht drie regels per soort laat zien, kon een verjaardag een afspraak met een tijd onder "en n meer"
  duwen.

## Wat er veranderd is

- **Zoeken op een tijdvak.** De kaart stuurt het begin en eind van de afspraak mee, zoals hij nu in de agenda staat, in
  UTC. De server zoekt in dat tijdvak, met een dag marge aan beide kanten, naar de uid (`search(start, end, event=True,
  expand=False)`). Pas als dat niets vindt, of als er geen tijden zijn, zoekt hij op de uid. Vindt het tijdvak hem niet en
  weigert iCloud het zoeken op de uid, dan staat er "Deze afspraak staat niet meer in de agenda." en geen 412. Zonder
  `expand` komt een herhalende afspraak terug met zijn regel, en die blijft geweigerd.
- **Eerst op tijd, dan een hele dag.** De dagen blijven op volgorde; binnen een dag komt eerst wat op een tijd staat (op
  begintijd), daarna een hele dag:
  - het overzicht (`komendeAfspraken`; wat al begon telt bij vandaag);
  - de agendakaart (`perDag`);
  - de kalender, per dag en in de vakjes van de maand (`opDag`).

## Gemeten

**Tests, NIEUW GEDRAG.** Op 0.119.0 vallen ze om.

- `tests/test_agenda_caldav.py`. Een nagebootste agenda die op `event_by_uid` antwoordt zoals iCloud
  (`ReportError("412 Precondition Failed ")`). Vier tests vallen om op 0.119.0:
  - zoeken in het tijdvak, met de juiste marge, en daarna wijzigen en verwijderen;
  - niets in het tijdvak: "staat niet meer in de agenda";
  - een herhalende afspraak ook via het tijdvak niet;
  - het commando neemt `start` en `end` aan.

  Een vijfde laat zien dat zonder tijdvak de fout van iCloud doorkomt. Die slaagt ook op 0.119.0, en is daarmee een
  regressiewacht.
- `tests/js/overzicht-logica.test.mjs` en `tests/js/agenda-logica.test.mjs`: de volgorde. Op 0.119.0 falen 7 tests,
  omdat de verwachte volgorde nu "Voetbal, Eten, Verjaardag" is in plaats van "Verjaardag, Voetbal, Eten".

**Tegen een echte CalDAV-server.**

- **Rechtstreeks.** Radicale 3.9.0 met de echte bibliotheek. Daarbij antwoordde `event_by_uid` zoals iCloud, met 412.
  - Wijzigen: op de server stonden de nieuwe titel en tijd, met `SEQUENCE` van 0 naar 1.
  - Verwijderen: de server gaf daarna 404.
  - Een tweede keer verwijderen gaf "Deze afspraak staat niet meer in de agenda."
- **In de testinstance.** Dezelfde server, gekoppeld met de integratie `caldav` van Home Assistant. Gemeten als
  telefoon: 390 breed, 56 echte gebeurtenissen (alle `isTrusted: true`), met 3 spaties getypt. De geladen bundel was die
  op schijf (`74540411f75f`).
  - **Wijzigen:** gelukt, met `SEQUENCE:1`, en de melding van 15 minuten staat er nog.
  - **Verwijderen:** daarna 404 op de server.
  - **De herhalende afspraak:** zonder knoppen, met de uitleg.
  - **Wat de kaart stuurde:** `caldav_wijzig` met start `2026-11-12T09:00:00.000Z` en end `09:30`, de oude tijd.
    Daarna `caldav_weg` met `10:00` tot `11:00`, de tijd na de wijziging.

  Na afloop zijn de koppeling en de testserver weer weg, en de config van de kaart is teruggezet.

JS-tests 2386 groen, Python 1135 groen, alle bewakers groen.

## Samenvatting

Wijzigen en verwijderen in iCloud zoekt de afspraak nu op zijn tijd, en niet op zijn uid: dat laatste weigert iCloud.
Binnen een dag staan afspraken op een tijd vóór afspraken van een hele dag, op het overzicht, op de agendakaart en in de
kalender.

## Wat niet lukte

- **Nog niet tegen iCloud zelf gemeten.** De 412 is nagebootst op de plek waar iCloud hem gaf (zoeken op de uid). Dat
  iCloud het zoeken op een tijdvak doet, blijkt uit de integratie van Home Assistant, die zo zijn afspraken ophaalt. Of
  `delete` en het opslaan bij iCloud zonder meer lukken, moet de proef bij de eigenaar uitwijzen.

## Aannames

- "Belangrijker" lees ik als: binnen dezelfde dag eerst, en bij te weinig regels als eerste getoond. Een afspraak op tijd
  over een week gaat niet voor een verjaardag van vandaag; de dagen blijven op volgorde.

## git status --porcelain

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/agenda_caldav.py
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/agenda-client.js
 M src/cards/agenda-logica.js
 M src/cards/overzicht-logica.js
 M tests/js/agenda-logica.test.mjs
 M tests/js/overzicht-logica.test.mjs
 M tests/test_agenda_caldav.py
?? docs/icloud-zoeken-en-volgorde/
```
