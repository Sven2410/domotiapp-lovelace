# Een agenda als afvalbron — 0.136.0

## Waarom

Een bedrijf krijgt van zijn afvalverwerker geen huishoudkalender. De integratie Afvalbeheer gaf bij het bedrijfsadres
alleen `customData`, dus er was geen sensor met een ophaaldatum, en het infoscherm zei "Geen afvalsensoren gekozen". Wat
er wel is, is een pdf met de ophaaldagen. De eigenaar vroeg of we die kunnen inlezen.

De beheersessie leest de pdf en zet de ophaaldagen in een Lokale agenda: elke ophaling een afspraak voor de hele dag, met
de soort als titel ("Restafval", "Papier"). Dat is gewoon Home Assistant: het overleeft een herstart, de receptie kan het
in de agenda van Home Assistant zelf aanpassen, en volgend jaar komt de nieuwe pdf erin. Een pdf lezen in de kaart zelf
is bewust niet gedaan: elke verwerker heeft een andere opmaak, en een upload van een klant is een risico.

Deze ronde zorgt dat de kaarten zo'n agenda als bron aannemen. Dat werkt ook voor een klant met een .ics-adres van zijn
gemeente, of met een integratie die alleen een agenda geeft.

## Wat er veranderd is

| Waar | Wat |
|---|---|
| afvalkaart | `sensors` mag een `calendar.*` bevatten; die wordt per soort een bak met de eerstvolgende ophaling (`src/cards/afval-agenda.js`). In de lijstvorm komt er een rij bij als er een bak bijkomt (`vraagOpnieuw`). De kleurkeuze per sensor slaat een agenda over: zijn bakken krijgen de kleur op hun naam |
| infoscherm | `installatie.afval` mag een agenda zijn (opslag en kaarteditor van het beheer); het afvalblok en de pagina lezen dezelfde bakken |
| meldingenkaart | `afval_vandaag` en `afval_morgen` mogen een agenda zijn, allebei dezelfde. De pop-up zegt wat er vandaag en morgen komt |
| server, meldingen | de melding leest de afspraken van de ophaaldag zelf (`_namen_op` in `meldingen/motor.py`); de pop-up kent meteen de bakken van de komende 62 dagen (`gezien`) |
| gedeeld | de soort komt uit de titel met dezelfde regels als een toestand: `afvalSoorten` (JS) en `uit_titels` (Python). "Geen ophaling" is geen soort, "Papier, PMD" zijn er twee |

De afspraken komen live binnen met `calendar/event/subscribe` (`src/afval-agenda-bron.js`), van vandaag tot 62 dagen
verder. Na middernacht wordt het opnieuw gevraagd, en na een herverbinding ook.

## Proeven

- `tests/js/afval-agenda.test.mjs`, 7 proeven, **NIEUW GEDRAG**. Op main faalt het bestand met `ERR_MODULE_NOT_FOUND`.
- `tests/meldingen/test_afval_agenda.py`, 6 proeven, tegen een echte `CalendarEntity`. 4 zijn **NIEUW GEDRAG**, en 2 zijn
  **REGRESSIEWACHTEN**: "geen ophaling morgen" en "agenda bestaat niet" slagen ook op main.
- `tests/infoscherm/test_store.py`: `test_een_agenda_mag_een_afvalbron_zijn` is **NIEUW GEDRAG**. De bestaande proef
  die een agenda weigerde, weigert nu alleen nog een lamp.

Tegen de code van main (`git archive main`):

```
FAILED tests/meldingen/test_afval_agenda.py::test_de_soort_komt_uit_de_titels
FAILED tests/meldingen/test_afval_agenda.py::test_de_avond_ervoor_noemt_de_afspraken_van_morgen
FAILED tests/meldingen/test_afval_agenda.py::test_de_ochtend_zelf_noemt_de_afspraken_van_vandaag
FAILED tests/meldingen/test_afval_agenda.py::test_de_pop_up_kent_de_bakken_van_de_komende_weken
FAILED tests/infoscherm/test_store.py::test_een_agenda_mag_een_afvalbron_zijn
5 failed, 41 passed
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../src/cards/afval-agenda.js'
```

Alles: 1192 Python-proeven en 2542 JS-proeven groen, plus `verify`, `check:registratie`, `check:controls`, `check:css` en
`check:taal`.

## Gemeten in de testinstance

Opzet: een Lokale agenda `calendar.afval` (via de config flow) met zeven ophalingen. Op 24 november Papier en Restafval,
op 26 november PMD, en verder GFT, Papier, PMD en Textiel. Op `kaart-test` een view `afvalagenda`. Playwright headless als
telefoon (`isMobile`, `hasTouch`), met tikken.

| Meting | 390 breed | 320 breed |
|---|---|---|
| bundel geladen gelijk aan schijf | `bddd7e2b8fd8` = `bddd7e2b8fd8` | idem |
| pagina `scrollWidth` / `clientWidth` | 390 / 390 | 320 / 320 |
| lijstkaart: uitgelicht | "morgen · Papier en Restafval" | idem |
| lijstkaart: lijst | PMD donderdag, GFT wo 2 dec, Textiel wo 30 dec | idem |
| lijstkaart: hoogte (5 bakken) | 312 (5 rijen) | 312 |
| brede kaart | Papier en Restafval uitgelicht, hoogte 120 | 120 |
| pop-up meldingen (tik, `isTrusted: true`) | "Morgen Papier en Restafval · melding om 19:30" | idem |

Live erbij gezet, zonder herladen: een ophaling Kerstbomen vandaag. Binnen drie tellen was het uitgelichte vlak
"vandaag · Kerstbomen". De lijstkaart ging naar 376 (6 rijen) en de pop-up zei "Vandaag Kerstbomen". Daarna is die
afspraak weer weggehaald.

De eerste meting vond een fout. De lijstkaart bleef 312 bij zes bakken, omdat de kaart het aantal rijen pas na het
binnenkomen vergeleek, en dan was het al het nieuwe aantal. Nu onthoudt hij wat hij Home Assistant het laatst opgaf
(`rijenGemeld_`). Daarna was het 376.

Infoscherm (1180 × 820, de iPad): tijdelijk `installatie.afval = ["calendar.afval"]` en een afvalblok op de plek van de
wifi. Het blok toonde "Papier en Restafval · morgen", met PMD, GFT en Textiel eronder (`scrollWidth` = `clientWidth` =
280). Daarna zijn de installatie en de indeling teruggezet.

Server, met de echte Lokale agenda: de proefmelding van `afval-agenda` gaf "Proef · Morgen Papier en Restafval", "Morgen
worden Papier en Restafval opgehaald. ...".

## Samenvatting

Een agenda mag nu overal staan waar een afvalsensor staat: de afvalkaart, het infoscherm en de afvalmeldingen. De soort
is de titel van de afspraak. De bakken staan er per soort met de eerstvolgende ophaling, en een nieuwe of gewijzigde
afspraak staat er meteen. Een bedrijf zonder afvalintegratie krijgt zo zijn ophaaldagen op het scherm en op de telefoon.

## Wat niet lukte

- Het infoscherm is alleen op iPadformaat gemeten, niet op 390 breed. Het blok gebruikt dezelfde opmaak als met sensoren.
- De editors (de afvalkaart, het beheer, de meldingenkaart) zijn niet in de browser geopend. Er veranderde alleen het
  domein in de entiteitkiezer (`["sensor", "calendar"]`) en een hulptekst.

## Aannames

- Een ophaling staat in de agenda als afspraak voor de hele dag, met alleen de soort als titel. Een afspraak op een tijd
  telt op de dag waarop hij begint, in de tijdzone van Home Assistant.
- 62 dagen vooruit is genoeg om elke soort te zien; een gemeente haalt elke soort minstens eens in de acht weken op. Een
  soort die verder weg ligt, staat er pas als hij binnen dat venster komt.

## `git status --porcelain`

(vlak voor het vastleggen)

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/infoscherm/store.py
 M custom_components/domotiapp_lovelace/manifest.json
 M custom_components/domotiapp_lovelace/meldingen/afval.py
 M custom_components/domotiapp_lovelace/meldingen/motor.py
 M src/cards/infoscherm-beheer-card.js
 M src/cards/infoscherm-card.js
 M src/cards/meldingen-card.js
 M src/cards/waste-card.js
 M src/i18n/en/meldingen.js
 M tests/infoscherm/test_store.py
?? docs/afval-uit-agenda/
?? src/afval-agenda-bron.js
?? src/cards/afval-agenda.js
?? tests/js/afval-agenda.test.mjs
?? tests/meldingen/test_afval_agenda.py
```
