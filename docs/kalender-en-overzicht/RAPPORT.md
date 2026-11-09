# 0.118.0: de kalender per dag, maand en jaar, het overzicht zonder favorieten, en iCloud

De eigenaar, 9 november 2026, over de overzichtskaart op zijn eigen dashboard. De beheersessie gaf het door, met wat ze in
zijn installatie had nagelezen.

1. "ik wil dat die kaart niet de favorieten laat zien. Die favorieten moeten gewoon links blijven staan op hun eigen kaart."
2. "voor de calendar wil ik een optie hebben om de calender helemaal te laten zien per dag per maand en per jaar". Over
   "en 3 meer": "kan er niet op klikken etc."
3. "aanmaken werkt wel trouwens maar wijzigen niet van een bestaande uit apple agenda"
4. Een fout in het log, sinds hij Apple koppelde: "Error in event filter", 24 keer in twee minuten.
5. "als ik test er in heb gezet moet ik de webpagina vernieuwen om hem er in te laten zien"

## Wat er aan de hand was

- **Favorieten.** De overzichtskaart had de favorietenkaart altijd links in zich, zonder instelling.
- **Kalender.** Er was alleen een lijst van de komende dagen. "en n meer" was een regel zonder actie.
- **iCloud.** Home Assistant kan in een CalDAV-agenda alleen afspraken maken. De agenda's van iCloud hebben
  `supported_features` 1, en Google heeft er 3. Wijzigen en verwijderen kan dus niet, en Home Assistant zelf kan het ook
  niet. Het scherm zei dan "Deze agenda is hier alleen te lezen. Wijzig de afspraak (...) zoals in Google Agenda." Bij een
  agenda waarin je wel kunt maken, en die van Apple is, klopte dat niet.
- **De fout in het log.** In `agenda.py` las het filter op het entiteitenregister `event.data`. Home Assistant geeft een
  `event_filter` de gegevens van de gebeurtenis (een dict), niet de gebeurtenis zelf. Elke wijziging in het register gaf
  daardoor een fout, en het abonnement stuurde dan niets.
- **Vernieuwen.** `calendar/event/subscribe` stuurt pas iets als een agenda zijn toestand opnieuw schrijft. Een Lokale
  agenda doet dat na een wijziging. CalDAV doet het niet: `async_create_event` slaat de afspraak op bij iCloud, en de
  coordinator haalt pas na vijftien minuten opnieuw op (`caldav/coordinator.py`, Home Assistant 2026.8).

## Wat er veranderd is

- **Overzicht zonder favorieten.** In de editor heet de nieuwe instelling "Favorieten links op de kaart" (`favorieten`).
  Hij staat standaard uit, ook voor een kaart die al bestond. Het overzicht vult dan zijn eigen sectie, en de
  favorietenkaart hoort in de sectie ernaast. De kaart staat alleen op het dashboard van de eigenaar.
- **De kalender.** Het agendascherm heeft een stand `kalender` met drie weergaven:
  - **Maand:** zes weken, met per dag de afspraken in de kleur van de agenda. Op een telefoon worden dat stippen.
  - **Dag:** de lijst van die dag.
  - **Jaar:** twaalf maanden, met een tint op de dagen waarop iets staat.

  Navigeren gaat met vorige en volgende, en met Vandaag. Een tik op een dag opent die dag, een tik op een maand in het jaar
  opent die maand, en een tik op een afspraak opent hem. Terug brengt je weer in de kalender. "+ Afspraak" maakt een
  afspraak op de gekozen dag, om 9 uur. Het scherm haalt zelf op wat er in beeld is, met een abonnement per agenda. De
  rekenregels staan in `agenda-logica.js`.
- **Waar de kalender opent:**
  - op de overzichtskaart met de nieuwe knop Kalender;
  - met een tik op "en n meer" bij de agenda;
  - op de agendakaart met het agenda-icoon. Agenda's heeft daar nu een tandwiel.
- **Een afspraak van verder dan 60 dagen** komt op het overzicht uit de toestand, zonder uid. Die heeft nu een knop
  "Wijzigen in de kalender", want daar staat hij wel met alles erbij.
- **iCloud.** Het scherm zegt bij zo'n afspraak waar het wel kan (`nietTeWijzigen`): "Een afspraak in iCloud kan Home
  Assistant niet wijzigen of verwijderen. Dat doe je in de Agenda-app op je iPhone, iPad of Mac." Een andere
  CalDAV-agenda en een agenda die alleen kan maken krijgen elk een eigen zin. Bij Agenda toevoegen staat bij Apple nu
  "wijzigen doe je op je iPhone". De herkomst komt van de server (de soort waarmee de klant hem toevoegde), anders van het
  platform in het entiteitenregister.
- **De fout.** Het filter leest nu de dict. Daarbij hoort een test met een echte wijziging in het register.
- **Vernieuwen.** Na maken, wijzigen of weghalen meldt het scherm dat (`meldGewijzigd`). De agendakaart, de
  overzichtskaart en de kalender abonneren dan opnieuw op die agenda (`bijWijziging`), meteen en na vier tellen nog een
  keer. Opnieuw abonneren vraagt de afspraken bij iCloud zelf op, niet bij de coordinator. De tweede keer is voor de
  zekerheid en niet gemeten.

## Gemeten

**Tests, NIEUW GEDRAG.** Elke nieuwe test faalt op 0.117.1:

- `tests/test_agenda.py`, "een agenda in het register stuurt de lijst opnieuw zonder fout". Op 0.117.1:
  `AttributeError: 'dict' object has no attribute 'data'` in `is_agenda`, dezelfde fout als in het log van de eigenaar.
- `tests/js/agenda-logica.test.mjs`, "de kalender" en "nietTeWijzigen". Op 0.117.1 faalt het bestand al bij het
  importeren: `does not provide an export named 'eersteWeekdag'`.
- `tests/js/overzicht-logica.test.mjs`, "bij de agenda opent 'en n meer' de kalender". Op 0.117.1 faalt de vergelijking:
  `kalender` staat er niet op.

**Testinstance** (Playwright, view `overzicht` en `agenda`). De geladen bundel was die op schijf: `bca8db1e4b7e` voor
allebei. Alle 33 kliks en toetsaanslagen waren `isTrusted: true`, met 2 spaties getypt in de titel. Voor de meting stond
het overzicht tijdelijk op 60 dagen vooruit, en daarna is de config teruggezet.

| stap | uitkomst |
|---|---|
| overzicht | geen favorietenkaart erin. De kaart is 960 × 504 (op het raster), het vlak erachter ook 504 hoog. Knoppen Kalender, Agenda's en Afspraak |
| tik op "en 7 meer" | de kalender, maand, "November 2026", 42 dagen, het vak 860 breed |
| volgende, Jaar, december, Vandaag, dag 9 | "December 2026"; 12 maanden en 21 dagen met een afspraak; december; "Maandag 9 november 2026" met de afspraken van die dag |
| + Afspraak in de dag, "Etentje bij Tom" getypt, Opslaan | terug in de dag, met "19:00 – 20:00 Etentje bij Tom"; op de kaart "Etentje bij Tom · 19:00" |
| opnieuw abonneren na opslaan | overzicht en kalender allebei meteen (11438 ms) en vier tellen later (15439 ms) |
| afspraak openen, Terug, opnieuw openen, Verwijderen | Terug brengt je in de dag; na verwijderen staat hij er niet meer |
| telefoon (390), licht | het vak 358 breed met 16 px marge; dagen 44 × 54 met stippen, zonder titels; geen horizontale scroll (390) |
| agendakaart, het agenda-icoon | de kalender, maand |

"Tandarts Anna" staat twee keer op 9 november. Dat zijn twee afspraken met een eigen uid in de testagenda, nagelezen via
`/api/calendars`. Geen fouten in de console.

Een eerste meting gaf het overzicht zonder favorieten 6 kolommen. In een sections-view is dat een halve sectie: 234 pixels
breed. Dat is teruggezet naar de hele sectie.

JS-tests 2379 groen, Python 1122 groen, alle bewakers groen.

## Samenvatting

- Het overzicht toont de favorieten niet meer, tenzij dat in de editor aan staat.
- De kalender laat de agenda per dag, per maand en per jaar zien. Hij opent met de knop Kalender, met "en n meer" en op
  de agendakaart.
- Een nieuwe, gewijzigde of verwijderde afspraak staat meteen op de kaarten, ook bij iCloud.
- Bij een afspraak uit iCloud zegt het scherm dat wijzigen in de Agenda-app op de iPhone gaat.
- De fout in het log is weg.

## Wat niet lukte

- **iCloud wijzigen kan niet**, en dat ligt niet aan de kaart: Home Assistant kan het in een CalDAV-agenda zelf niet.
- **Niet nagemeten in de browser:**
  - de uitleg bij iCloud, want er is hier geen CalDAV-agenda (wel met tests);
  - het opnieuw ophalen tegen een echte iCloud. In de testinstance is het gemeten met een Lokale agenda, die zichzelf
    ook al bijwerkt. Dat hij opnieuw abonneert is gemeten, maar niet dat iCloud dan meteen de nieuwe afspraak teruggeeft.
    Dat kijkt de beheersessie na op het dashboard van de eigenaar.

## Aannames

- Favorieten standaard uit, ook op een bestaande kaart: dat is wat de eigenaar vroeg, en de kaart staat alleen bij hem.
- De kalender opent op de maand. Een week-weergave is er niet; daar is niet om gevraagd.
- "Optie" lees ik als "een manier om de kalender helemaal te zien", niet als een instelling in de editor.

## git status --porcelain

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/agenda.py
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/agenda-card.js
 M src/cards/agenda-client.js
 M src/cards/agenda-logica.js
 M src/cards/agenda-scherm.js
 M src/cards/overzicht-card.js
 M src/cards/overzicht-logica.js
 M src/i18n/en/agenda.js
 M src/i18n/en/overzicht.js
 M tests/js/agenda-logica.test.mjs
 M tests/js/overzicht-logica.test.mjs
 M tests/test_agenda.py
?? docs/kalender-en-overzicht/
```
