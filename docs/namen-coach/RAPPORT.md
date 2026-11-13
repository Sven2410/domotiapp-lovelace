# De nieuwe namen: COACH en Coach Assist (0.125.0)

De eigenaar legde op 13 november 2026 de namen vast; de werkmap-sessie gaf ze door. Kort:
- **DomotiTech** is het bedrijf;
- **DomotiApp** is het dashboard van de klant in Home Assistant, dus deze kaarten;
- **COACH** is het energiemanagementsysteem (was "DomotiApp Coach"), in hoofdletters als naam en titel. In een gewone
  zin mag "de coach" blijven;
- **Coach Assist** is de digitale hulp (was "Vraag het de DomotiTech Bot"). Wat de klant leest zegt geen "bot" meer.

Technische namen blijven: `custom:domotiapp-bot-card`, de bestandsnamen, het domein `domotiapp_coach`, de commando's.
Die staan in dashboards van klanten.

## Wat er veranderde

**Coach Assist** (de botkaart):
- de tegel en de kop van het scherm: "Vraag het Coach Assist" (Engels "Ask Coach Assist");
- de naam in de kaartkiezer: "DomotiApp Coach Assist";
- de zinnen zonder coach of met een te oude coach: "Coach Assist werkt via COACH, ...", "Heeft COACH nodig",
  "Werk COACH bij", "COACH kent Coach Assist nog niet. Werk COACH bij.";
- de afzender van een antwoord: **Coach Assist**. De coach zet bij een antwoord `naam`. Tot nu was dat "DomotiTech",
  en zo blijven oude berichten in zijn opslag staan; nieuwe krijgen "Coach Assist" (afgesproken met de werkplaats).
  De kaart noemt een antwoord met naam "DomotiTech" of zonder naam "Coach Assist", net als het paneel. Zo zien oude en
  nieuwe antwoorden er gelijk uit (`afzender` in `bot-logica.js`).
- "Ligt bij DomotiTech" blijft: daar gaat het om het bedrijf.

**COACH** op de kaarten van de laadpaal, de batterij, de vaatwasser (ook wasmachine en droger) en de airco: in de
meldingen ("Geen apparaat van COACH gevonden. Daarvoor is COACH 0.112.1 of nieuwer nodig."), in de editors (het blok
heet "COACH", "In combinatie met COACH") en in de omschrijvingen in de kaartkiezer. Ook in het Engels.

## De fabrikant: beide namen

De kaarten herkennen een apparaat van de coach aan zijn fabrikant, en de werkplaats wil die later ook op "COACH" zetten.
Dat zou de kaarten op drie plekken breken:
- een kaart zonder gekozen apparaat (die neemt "de enige");
- de airco-kaart, die zelf zoekt of de coach een airco stuurt;
- de apparaatkiezer in de editor.

Daarom kennen de kaarten nu allebei: `COACH_FABRIKANTEN` en `coachFilter` in `coach-logica.js`. Afgesproken met de
werkplaats: de fabrikant blijft in de komende coach-uitgave "DomotiApp Coach". Hij gaat pas om als elke klant een
lovelace heeft die beide namen kent, want de uitrol installeert coach en lovelace los van elkaar.

Een kaart met een apparaat dat in de editor gekozen is, volgt dat op zijn id. Die bleef ook op de oude code werken
(gemeten, zie hieronder).

## Gemeten

Playwright, 390 bij 844, `isMobile` en `hasTouch`, view `batterij` van `kaart-test`. In de nagebootste coach stond de
Thuisbatterij voor deze meting op fabrikant **COACH**, en de Accu schuur op **DomotiApp Coach**; daarna teruggezet.

Verse code: `?v=035b4a4b64a1`, gelijk aan de sha256 op schijf; main `?v=27f794547bc4`.

| | 0.124.1 (main) | 0.125.0 |
|---|---|---|
| batterijkaart met gekozen apparaat (COACH) | vindt hem | vindt hem |
| batterijkaart zonder keuze, twee batterijen | **toont stil de Accu schuur** (ziet de COACH-batterij niet) | "Kies in de editor welk apparaat van de coach deze kaart volgt." |
| tegel van de botkaart | "Vraag het de DomotiTech Bot" | "Vraag het Coach Assist" |
| kop van het scherm (na een echte tik, `isTrusted: true`) | "Vraag het de DomotiTech Bot" | "Vraag het Coach Assist" |
| afzender van twee antwoorden (opgeslagen met naam "DomotiTech") | "DomotiTech · 07:17" | "Coach Assist · 07:17" |
| "bot" of "DomotiApp Coach" in de tekst van het scherm | ja | nee |

Ook gemeten:
- het vak is 356 breed, met `scrollWidth` gelijk aan `clientWidth`;
- de pagina is 390 breed, met `scrollWidth` gelijk aan `clientWidth`;
- er waren geen paginafouten.

## Proeven

`tests/js/namen-coach.test.mjs` (NIEUW GEDRAG, 7 proeven) toetst vier dingen:
- de twee fabrikanten in `coachApparaten`;
- de filter van de apparaatkiezer;
- de afzender;
- de zinnen in het Nederlands en het Engels.

Een laatste proef leest alle zinnen in `t()`, `nt()`, `tc()` en `tn()`, en het hele Engels. Daar mag geen
"DomotiApp Coach", "DomotiTech Bot" of los "bot" meer in staan. Tegen de code van main:

```
not ok 1 - vindt een apparaat onder elk van de twee
not ok 2 - zet allebei in de filter van de apparaatkiezer, voor elk model
not ok 3 - houdt de oude naam: die staat bij elke klant
not ok 1 - noemt een antwoord Coach Assist, ook een oud met de naam DomotiTech
not ok 2 - laat de naam van een bewoner staan, en een bericht van de klant zonder naam leeg
not ok 1 - zegt COACH en Coach Assist, ook in het Engels
not ok 2 - bevat nergens nog DomotiApp Coach, de DomotiTech Bot of de bot
# pass 0
# fail 7
```

Vier bestaande proeven toetsten de oude zinnen letterlijk; die zijn bijgewerkt. Alles bij elkaar:
- 2443 JS-proeven en 1153 Python-proeven, groen;
- `verify`, `check:registratie`, `check:controls`, `check:css` en `check:taal`, groen.

## Samenvatting

0.125.0 zet de namen van de eigenaar op de kaarten: COACH voor het systeem, Coach Assist voor de botkaart, ook als
afzender van een oud antwoord. De kaarten herkennen een apparaat van de coach nu onder "DomotiApp Coach" én "COACH".
Daardoor kan de werkplaats de fabrikant later omzetten zonder dat een kaart zijn apparaat kwijtraakt.

## Wat niet lukte

- Niet op een echte iPhone gezien.
- De apparaatkiezer in de editor is niet in de browser gemeten, alleen de filter die hij krijgt (proef). Home Assistant
  leest een lijst filters als "een van deze"; zo stond het al met één filter per model.

## Aannames

- De naam in de kaartkiezer wordt "DomotiApp Coach Assist", naar het patroon "DomotiApp + wat het is". Het type blijft
  `custom:domotiapp-bot-card`.
- In zinnen met een versienummer ("Daarvoor is COACH 0.112.1 of nieuwer nodig") is COACH een naam, dus in hoofdletters.
- Versie 0.125.0, want de kaarten herkennen iets nieuws (de fabrikant COACH).

## git status --porcelain

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/airco-card.js
 M src/cards/batterij-card.js
 M src/cards/bot-card.js
 M src/cards/bot-logica.js
 M src/cards/bot-scherm.js
 M src/cards/coach-logica.js
 M src/cards/dishwasher-card.js
 M src/cards/laadpaal-card.js
 M src/i18n/en/apparaten.js
 M src/i18n/en/batterij.js
 M src/i18n/en/bot.js
 M src/i18n/en/coach.js
 M src/i18n/en/programma.js
 M tests/js/bot-logica.test.mjs
 M tests/js/vaatwasser-coach.test.mjs
?? docs/namen-coach/
?? tests/js/namen-coach.test.mjs
```
