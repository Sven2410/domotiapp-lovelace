# 0.81.0: de kaarten in het Engels, eerste ronde

## Aanleiding

DomotiApp Coach kan sinds v0.140.0 Engels. Op 21 oktober 2026 zei de
eigenaar via de coach-sessie dat de kaarten ook Engels moeten worden. Na het
plan zei hij: *"ga volledig je gang"*. Het plan heeft zes rondes. Dit is de
eerste: de basis, plus de drie kaarten waar Engels van de coach nu naast
Nederlands van de kaart stond (laadpaal, thuisbatterij, programmakaart).

## Wat er gebouwd is

**De keuze.** Onder Configureren, Uiterlijk (en bij het toevoegen) staat
**Taal / Language**, met de keuzes Automatisch, Nederlands en English. Het
label staat bewust in twee talen, zodat wie in de verkeerde taal zit hem toch
vindt.
- Automatisch neemt de taal van Home Assistant: Engels als die met "en"
  begint, anders Nederlands.
- Een entry van vóór 0.81.0 staat op Automatisch.
- Het zijn dezelfde drie keuzes als `installation.language` van de coach.

**De weg naar de kaarten.** Die is dezelfde als voor het thema:
- De lader (`loader.py`) zet `__domotiappLovelaceTaal` vóór de import.
- `src/thema.js` haalt het antwoord van de lader opnieuw op en geeft de taal
  door aan `src/taal.js`.
- Een gewijzigde keuze komt dus zonder herstart aan, uiterlijk binnen vijf
  minuten.

**De vertaling.** Die gaat op de manier van het paneel van de coach: `t()` met
de Nederlandse zin als sleutel, en het Engels in `src/i18n/en/*.js`. De regels
staan in `docs/taal.md`. Daarbij:
- **`DacCard`** bouwt zich opnieuw op als de taal wisselt (`taalGewisseld_`),
  want zijn tekst staat in `template()`.
- **Lit-kaarten** (scene en wekker) renderen opnieuw via `MetThema`.
- **De kaartkiezer** krijgt naam en beschrijving als getters, die vertalen op
  het moment dat Home Assistant ze leest.
- **Getallen, bedragen en datums** volgen de taal: 12,4 en € 3,59 tegen 12.4
  en €3.59, dagnamen uit `toLocaleDateString`.

**De controle.** `npm run check:taal` staat in CI. Die meldt:
- elke zin in een `t()` zonder Engels;
- een zin die in twee delen anders vertaald is;
- een vertaling met andere waarden tussen accolades;
- een gedachtestreepje.

**Vertaald in deze ronde:**

| Kaart | Bestanden |
|---|---|
| laadpaal | `laadpaal-card.js`, `laadpaal-logica.js`, `coach-logica.js` |
| thuisbatterij | `batterij-card.js`, `batterij-logica.js` |
| programmakaart (vaatwasser, wasmachine, droger) | `dishwasher-card.js`, `programma-logica.js`, `vaatwasser-logica.js` |
| gedeeld | `productfoto.js` (merkkeuzes van vijf editors), `programmanaam.js` (een Engelse tabel naast de Nederlandse, voor programmasleutels die Home Assistant niet vertaalt) |

Het gaat om de kaarten én hun editors. Waar het paneel van de coach dezelfde
zin heeft, is het Engels gelijk.

**Wat bewust Nederlands blijft:**
- **Tekst van de coach:** de toestand, `reason` en `later`. Die schrijft de
  coach in zijn eigen taal.
- **Namen die van Home Assistant komen:** programma's, fases en apparaatnamen.
- **Modelnamen waarop gezocht wordt:** `"Laadpaal"` in `kiesApparaat`.

## Bewijs

**Tests.**
- **NIEUW GEDRAG:** `tests/js/taal.test.mjs` (8) en `tests/test_taal.py` (5).
  Tegen de code van `main` (via `git archive`) vallen ze allebei om:

  ```
  Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../oud/src/taal.js'
  E   ImportError: cannot import name 'CONF_TAAL' from 'custom_components.domotiapp_lovelace.const'
  ```

- **Bijgewerkt in `tests/test_thema.py`:** twee asserts. De options bevatten
  nu ook `taal: "auto"`, want het formulier Uiterlijk heeft een veld erbij.
- **Alles:** 2021 JS-tests en 881 Python-tests groen. `verify`,
  `check:registratie`, `check:controls`, `check:css` en `check:taal` zijn OK.

**In een echte browser.** Gemeten in Chrome op de werkbank (`dev/`), niet in
Home Assistant. Op deze MacBook staat geen testinstance, en de nagebootste
coach staat alleen op de pc.
- **Verse code.** De bundel uit de pagina is 1.201.833 bytes, met sha256
  `35d9c98ef7b1b2e5…`. Dat is gelijk aan het bestand op schijf.
- **De wissel.** Ik heb in `dev/laadpaal.html` echt op "Taal wisselen"
  geklikt, en twee keer kwam `isTrusted: true` binnen op `#taalknop`. Alle 21
  kaarten bouwden zich om naar Engels: Fast, Schedule, Ready by, Charge to, en
  "Previous session · … 15.5 kWh · 2.1 kWh solar · 0.3 kWh battery · €3.19
  grid · €3.64 incl. solar".
- **Terug naar Nederlands.** Na nog een klik was de `textContent` van alle 21
  kaarten letter voor letter gelijk aan een verse Nederlandse lading (21 van
  21).
- **De andere werkbanken.**
  - `dev/batterij.html?taal=en`: Charge to full, Discharge, Holiday mode is
    off, Earned.
  - `dev/programma.html` (nieuw): Running · 1 h 24 min left, Programme
    finished, Start now. Nederlands en Engels gedragen zich gelijk; alleen
    de woorden verschillen.
- **Gevonden bij het meten en gerepareerd:** een laadbeurt van meer dan een
  week oud toonde "11-10" ook in het Engels. Het is nu "11/10".

## Wat niet lukte

- **Niet nagemeten in Home Assistant zelf** (zie hierboven). Wat daar nog te
  zien moet zijn:
  - het formulier Uiterlijk met het veld Taal;
  - een dashboard dat binnen vijf minuten omslaat na een andere keuze;
  - de namen in de kaartkiezer.

## Wat er nog komt

- **Het attribuut `taal` van de coach** (v0.140.2) staat klaar aan de kant
  van de coach. Met dat attribuut volgt Automatisch de taal van de coach.
  Volgens de contractregel lees ik het pas als het in een echte dump heeft
  gestaan. Tot dan geeft een Nederlandse coach naast een Engelse kaart
  bijvoorbeeld "Start morgen".
- **Rondes 2 tot en met 6:**
  - de kaarten voor elke dag;
  - de apparatuur;
  - de overige editors;
  - de server (pushmeldingen), de wekker en de badges;
  - het infoscherm.

## Aannames

- **Brits Engels**, zoals de coach.
- **"Klaar om" is overal "Ready by"**, ook bij een wasmachine, waar "Done at"
  ook had gekund. Eén sleutel heeft één vertaling.
- **Een naam die al in de config staat blijft zoals hij is**, ook als het de
  Nederlandse standaard van de stub was (`name: "Vaatwasser"`).

## git status --porcelain

```
(leeg na de commit van dit rapport)
```
