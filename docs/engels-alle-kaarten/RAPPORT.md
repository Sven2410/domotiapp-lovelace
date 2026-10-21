# 0.82.0: alle kaarten in het Engels

## Aanleiding

Dit is het vervolg op 0.81.0 (`docs/engels-fundament/RAPPORT.md`). De eigenaar
zei op 21 oktober 2026 *"ga volledig je gang"*. Daarom is de rest in één keer
gedaan, ook het infoscherm. Dat was in het plan de laatste ronde, en de vraag
of het infoscherm mee moest beantwoordde "volledig".

## Wat er vertaald is

Met deze uitgave is elke kaart tweetalig, met zijn editor.

| Groep | Bestanden (onder `src/`) | Deel in `src/i18n/en/` |
|---|---|---|
| entiteiten | `entities-card`, `editor/entities-editor`, `toggle` | `entiteiten.js` |
| verlichting en scenes | `light-card`, `scene/*` | `scene.js` |
| klimaat, rolluiken, HVAC | `climate-card`, `cover-*`, `hvac-*` | `klimaat.js` |
| media | `media-card`, `media-logica`, `media/*` (zoekscherm, bron-, speaker- en slaaptimerkiezer) | `media.js` |
| kop en indeling | `header-card`, `navbar-*`, `editor/navbar-editor`, `tabs-*`, `editor/tabs-editor`, `separator-card`, `terug-*`, `badges/terug-badge` | `indeling.js` |
| meldingen | afval, personen, weer, rookmelder, meldingen | `meldingen.js` |
| camera | `camera-card`, `camera-archief`, `camera-filters` | `camera.js` |
| apparaten | airco, robotstofzuiger, warmtepompboiler | `apparaten.js` |
| apparatuur | vriezer en koelkast, 3D-printer, auto, wifi | `apparatuur.js` |
| wekker | `alarm/*` | `wekker.js` |
| gedeeld | `ha.js` (dagen, datums, getallen), `editor/base.js`, de icoon-, foto-, kleur- en kaartkiezer, `vraag.js`, de badges, `energie-dashboard.js` | `gedeeld.js` |
| infoscherm | `infoscherm-card`, `infoscherm-logica`, `ruimtes-logica`, `infoscherm-logo`, `infoscherm-client` | `infoscherm.js` |
| beheer | `infoscherm-beheer-card` | `beheer.js` |

**De serverkant** (`custom_components/domotiapp_lovelace/taal.py`, met het
Engels in `engels/*.json`). Vertaald zijn:
- de afvalmelding: titel, tekst, de knop "Put out" en de proef;
- de tekst van de wekker en zijn regel "volgende keer";
- de fouten bij het boeken van een ruimte, en de titel van een boeking in de
  agenda;
- de vaste foutteksten van de commando's.

Bij Automatisch volgt de server `hass.config.language`. Zie `docs/taal.md`.

**De icoonkiezer vindt ook Engelse zoekwoorden** ("bed", "curtain",
"dishwasher"), naast de Nederlandse.

**Nieuw in `taal.js`:** `tc("context", "Stil")`, voor een Nederlands woord dat
in het Engels twee woorden is. "Stil" is bij een batterij "Idle" en bij een
ventilator "Quiet"; "Dicht" is een toestand ("Closed") en een knop ("Close").

## Gevonden en gerepareerd

1. **De editor van de vriezer- en koelkastkaart viel om.** Hij riep
   `merkKeuzes(VRIEZERS)` aan, en die naam bestaat niet. Gemeten in Chrome:
   - op de bundel van main gaf `editor.schema()` de fout
     `ReferenceError: VRIEZERS is not defined`;
   - op de nieuwe bundel geeft hij `schema: entity,name,merk`.

   Nieuwe toets `tests/js/productfoto-namen.test.mjs` (NIEUW GEDRAG). Die
   faalt op main met `'vriezer-card.js: VRIEZERS'`.
2. **Een camerakaart zonder ingevulde naam heette altijd "Camera".** Sinds
   27 augustus 2026 stond "Camera" als derde argument van `nameOf`, en dat is
   daar geen terugval maar een vaste naam. Nu staat er de naam van de camera
   in Home Assistant.
3. **De CSS-bewaker gaf vals alarm** op `t("...", { n })` binnen een
   `${...}`: de accolade van het objectje sloot het sjabloon voor zijn scanner
   te vroeg af. Een gewone accolade telt nu mee. Nagemeten:
   - een echte backtick in een CSS-commentaar wordt nog gevangen
     (`separator-card.js:21`);
   - de kopie terugzetten geeft weer OK.
4. **"Wekker undefined bewerken".** `t()` vulde een ontbrekende waarde in als
   "undefined". Nu wordt dat een lege tekst, zoals de oude sjabloontekst deed.
   Er is een toets bij.

## Bewijs

**Tests.**
- Alles groen: 2024 JS-tests en 901 Python-tests. `verify`,
  `check:registratie`, `check:controls`, `check:css` en `check:taal`
  ("Alles vertaald.") zijn OK.
- **NIEUW GEDRAG:** `tests/test_taal_server.py` (20 tests). Tegen HEAD faalt
  hij met `ModuleNotFoundError: No module named
  'custom_components.domotiapp_lovelace.taal'`. Verder de nieuwe toetsen in
  `taal.test.mjs` (`tc`, en een lege waarde) en `productfoto-namen.test.mjs`.
- **Testharnas.** `tests/conftest.py` zet de taal van Home Assistant op "nl".
  Het harnas zet hem op "en", en dan zou Automatisch alle bestaande
  Nederlandse toetsen Engels maken.

**Het Nederlands is gelijk gebleven.** Gemeten in Chrome op de werkbank
(`dev/preview.html`):
- **Aanpak.** De pagina draaide twee keer: eerst met de bundel van main (op
  een eigen poort, uit `git archive`), daarna met de nieuwe. Per kaart zijn
  alle tekstknopen plus `aria-label`, `title` en `placeholder` vergeleken.
- **Uitkomst: 56 van 56 kaarten letter voor letter gelijk.** De nieuwe bundel
  was 1.345.800 bytes, sha256 `4c0eefcb15ab7374…`, gelijk aan schijf. De
  eerste meting gaf 55 van 56; het verschil was punt 4 hierboven.

**Het Engels.** Ook gemeten op `dev/preview.html?taal=en`, en daar is geen
Nederlandse tekst van de kaarten zelf meer over. Wat er nog Nederlands staat:
- namen die de bewoner koos ("Keuken Voor", "Wekker slaapkamer");
- mediatitels ("RTL Nieuws");
- de nagemaakte toestanden van de werkbank ("Over 10 uur", "Niet actief").

Gezien in het Engels: "Good morning", "Wednesday 21 October", "13 km/h NW" en
"65% open".

## Wat niet lukte

- **Niet nagemeten in Home Assistant zelf.** Op de MacBook staat geen
  testinstance, en de nagebootste coach, Miele, Dreame en UniFi staan alleen op
  de pc. De kaarten met een nagebootst apparaat (programmakaart, stofzuiger,
  boiler, vriezer, wifi, batterij) zijn alleen in de logica (Node-tests) en,
  waar er een werkbank is, in Chrome gemeten. Het infoscherm en het beheer
  zijn alleen in de logica gemeten.
- **De meervouden die al niet klopten zijn zo gebleven.** Het Nederlands
  moest letterlijk gelijk blijven. Het gaat om "1 dagen geleden", "1 lampen",
  "1 blokken" in het beheer, en "1 images" in het opslagscherm van de camera.

## Aannames

- **Een standaardwaarde die bij het toevoegen in de config komt**, krijgt de
  taal van dat moment. Voorbeelden: de titel van een nieuwe afvalkaart, de
  knoppen van een nieuwe navbalk en de kop van een badge. Daarna is het tekst
  van de klant, en die blijft zoals hij is.
- **De beschrijving van de scene- en wekkerkaart in de kaartkiezer** heeft
  geen versienummer meer. Een sleutel die per uitgave verandert, is niet te
  vertalen.
- **Een klant met Home Assistant in het Engels krijgt Engels**, als de keuze
  op Automatisch staat. Dat geldt na het bijwerken voor de kaarten en voor de
  afvalmelding. Dat staat in de releasenotes.

## git status --porcelain

```
(leeg na de commit van dit rapport)
```
