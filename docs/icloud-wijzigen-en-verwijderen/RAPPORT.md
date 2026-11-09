# 0.119.0: een afspraak uit iCloud wijzigen en verwijderen

De eigenaar, 9 november 2026, na "aanmaken werkt wel trouwens maar wijzigen niet van een bestaande uit apple agenda". Hij
vroeg: "kan je dus geen afspraak verwijderen in HA?" Op het voorstel om het zelf te doen, via de iCloud-koppeling die er
al is: "ja doe maar".

## Wat er aan de hand was

De CalDAV-integratie van Home Assistant 2026.8 kan in een agenda alleen een afspraak maken (`supported_features` 1).
Wijzigen en verwijderen heeft hij niet. `calendar/event/update` en `calendar/event/delete` antwoorden dan met "not
supported", en de kaart bood die knoppen dus ook niet aan.

## Wat er veranderd is

- **Server: `agenda_caldav.py`, met twee commando's: `agenda/caldav_wijzig` en `agenda/caldav_weg`.**
  - Ze gebruiken de verbinding die de CalDAV-integratie al heeft: het `caldav.Calendar`-object van zijn entiteit
    (`coordinator.calendar`). We lezen geen wachtwoord en bouwen geen eigen verbinding.
  - De afspraak wordt op zijn uid opgezocht en verwijderd of gewijzigd. Bij wijzigen veranderen titel, begin, eind,
    plaats en omschrijving. `SEQUENCE` gaat een hoger en `LAST-MODIFIED` en `DTSTAMP` worden nieuw.
  - Wat de kaart niet kent, blijft staan: deelnemers, meldingen, een URL.
  - Na de wijziging haalt de agenda opnieuw op. Anders loopt zijn toestand tot een kwartier achter.
- **Wie het mag:** wie de agenda mag bedienen (`POLICY_CONTROL`), net als bij `calendar/event/delete` van Home Assistant
  zelf. Alleen voor een agenda van de integratie `caldav`.
- **Een herhalende afspraak niet.** Op de server is een reeks één afspraak met een regel (RRULE). Verwijderen op de uid
  zou de hele reeks weghalen, terwijl de klant op één keer tikte. Het scherm zegt dan dat het in de Agenda-app op de
  iPhone moet, en de server weigert het ook.
- **Het scherm:** bij een CalDAV-afspraak staan nu Wijzigen en Verwijderen, en die gaan via onze server (`watKan` in
  `agenda-logica.js`). Elke andere agenda gaat zoals het ging, langs Home Assistant zelf. In de lijst Agenda's staat een
  CalDAV-agenda nu als "lezen en schrijven". Bij Apple iCloud toevoegen staat nu: "Hier maak, wijzig en verwijder je ze
  ook."
- **Op een telefoon, in de maand:** een tik op een dag opent die dag, ook als de vinger op een stipje valt. Die bevinding
  kwam uit de meting hieronder: een tik midden op 12 november opende eerst meteen de ene afspraak die daar stond.

**Een eigenaardigheid van caldav 2.1.0.** De bibliotheek hoogt `SEQUENCE` bij het opslaan zelf op, ook met
`increase_seqno=False`. Toen ik hem eerst zelf ophoogde, ging hij op de server van 0 naar 2. Nu zorgt de server alleen
dat `SEQUENCE` er staat, en het ophogen doet de bibliotheek.

## Gemeten

**Tests, NIEUW GEDRAG.** Op 0.118.1 vallen ze allebei om bij het importeren.

- `tests/test_agenda_caldav.py`, 8 tests: `cannot import name 'agenda_caldav'`. De tests gebruiken de echte
  `caldav.Event` en zijn `save`, zodat ook het ophogen van `SEQUENCE` door de bibliotheek gemeten is. Alleen het versturen
  is vervangen. Getoetst:
  - wijzigen, met het behoud van de deelnemer en de melding;
  - een hele dag;
  - een afspraak zonder `SEQUENCE`;
  - verwijderen;
  - een herhalende afspraak (geweigerd) en een afspraak die er niet meer is;
  - dat een Lokale agenda geen CalDAV is;
  - de commando's, met een eind voor het begin als fout.

  `caldav`, `icalendar` en `vobject` staan daarvoor in `requirements-test.txt`, in de versies van Home Assistant 2026.8.
- `tests/js/agenda-logica.test.mjs`, "nietTeWijzigen en watKan": `does not provide an export named 'watKan'`.

**Testinstance, van begin tot eind.** Er was geen iCloud-account, dus heb ik een eigen CalDAV-server gedraaid (Radicale
3.9.0, op de mini-pc, op 127.0.0.1). Die is gekoppeld met de integratie `caldav` van Home Assistant zelf, en zo ontstond
`calendar.werk_icloud` met `supported_features` 1, net als de agenda's van de eigenaar. Daarin stonden een losse afspraak
(met een melding van 15 minuten) en een herhalende. De meting liep als telefoon: 390 breed, met `isMobile` en `hasTouch`.
De geladen bundel was die op schijf (`791b93296d39`). Alle 56 gebeurtenissen waren `isTrusted: true`: 15 tikken en 3
spaties getypt. Wat er op de server stond, is rechtstreeks gelezen.

| stap | in het scherm | op de server |
|---|---|---|
| vooraf | | `SUMMARY:Tandarts Anna`, `DTSTART:20261112T090000Z`, `SEQUENCE:0`, `TRIGGER:-PT15M` |
| Agenda's | "Werk iCloud lezen en schrijven" | |
| tik op 12 november, dan op de afspraak | de dag, en daarna de afspraak met Verwijderen en Wijzigen | |
| Wijzigen: "Tandarts Anna en Tom" getypt, begin 11:00 | in de dag: "11:00 – 12:00 Tandarts Anna en Tom" | `SUMMARY:Tandarts Anna en Tom`, `DTSTART:20261112T100000Z`, `SEQUENCE:1`, de melding staat er nog |
| Verwijderen | de dag is leeg | `HTTP 404` |
| de herhalende afspraak | alleen Terug, met "Een herhalende afspraak in deze agenda wijzig of verwijder je in de app van de agenda zelf." | onveranderd |

Na afloop zijn de koppeling en de testserver weer weg, en de config van de kaart is teruggezet. Geen fouten in de console.

JS-tests 2386 groen, Python 1130 groen, alle bewakers groen.

## Samenvatting

Een afspraak uit iCloud is nu op de kaart te wijzigen en te verwijderen. Dat doet onze server, met de verbinding die de
iCloud-koppeling van Home Assistant al heeft. Een herhalende afspraak blijft voor de iPhone, en het scherm zegt dat.

## Wat niet lukte

- **Niet tegen iCloud zelf gemeten,** alleen tegen een andere CalDAV-server. Het protocol is hetzelfde, maar iCloud kan
  in kleine dingen anders zijn: hoe hij een uid opzoekt, en of hij een afspraak meteen teruggeeft. Dat moet de eigenaar,
  of de beheersessie, op een testafspraak nalopen.
- **De weigering voor wie de agenda niet mag bedienen** is niet in een test gezet: een gewone gebruiker in Home Assistant
  mag standaard alles bedienen. Het is dezelfde regel als in Home Assistant zelf.

## Aannames

- Een herhalende afspraak niet aanraken. Eén keer eruit halen kan in CalDAV wel (EXDATE), maar dat gaat over de hele
  reeks op de server. Het is veiliger om dat op de iPhone te laten doen.
- De plaats leegmaken haalt de plaats weg; dat is wat de klant in het formulier doet.

## git status --porcelain

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/agenda.py
 M custom_components/domotiapp_lovelace/engels/agenda.json
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M requirements-test.txt
 M src/cards/agenda-client.js
 M src/cards/agenda-logica.js
 M src/cards/agenda-scherm.js
 M src/i18n/en/agenda.js
 M tests/js/agenda-logica.test.mjs
?? custom_components/domotiapp_lovelace/agenda_caldav.py
?? docs/icloud-wijzigen-en-verwijderen/
?? tests/test_agenda_caldav.py
```
