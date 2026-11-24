# Coach Assist is bezig: drie bewegende puntjes — 0.138.0

## Waarom

De eigenaar, 25 november 2026, over Coach Assist: "Laat ook zien dat een bericht in behandeling is met 3 puntjes die
bewegen ... Zo weet de klant dat je aan het nadenken bent." Een vraag doorgeven gaat binnen een minuut, het uitzoeken
kost twee tot tien minuten, en in die tijd zag de klant niets.

De coach doet het veld in v0.243.0: `bezig` = `{sinds, tot}` met tijdzone, op het gesprek (id 0) en op een ticket, in
`tickets/list`, `tickets/read` en `tickets/subscribe`, binnen contract 1. Een beheerder zet het met
`domotiapp_coach/tickets/busy` (standaard 15 minuten, hoogstens 120, 0 haalt het weg). Elk antwoord haalt het weg, en
na `tot` laat de coach het zelf weg, ook na een herstart. Er komt geen gebeurtenis `domotiapp_coach_ticket` en geen
pushmelding bij.

## Wat er veranderd is

| Waar | Wat |
|---|---|
| `bezigTot` in `bot-logica.js` | tot wanneer Coach Assist bezig is, in milliseconden, of `null`. `tot` is een echt moment, dus naast `Date.now()` en niet naast de klok van het huis |
| het gesprek en een ticket (`bot-scherm.js`) | onderaan een bubbel aan de kant van Coach Assist, met zijn naam en merkje, en drie puntjes die om de beurt opveren. Met `prefers-reduced-motion` staan ze stil. Voor een schermlezer `role="status"` met "Coach Assist is bezig" |
| scrollen | komen de puntjes erbij terwijl je onderaan stond, dan schuift het mee; wie omhoog leest blijft staan |
| een scherm dat lang openstaat | de coach stuurt niets als `tot` voorbijgaat, dus de kaart zet zelf een wekker op `tot` en tekent dan opnieuw |
| Engels | "Coach Assist is working on it", zoals in het paneel van de coach |

De kaart stuurt zelf nooit `busy`; dat mag alleen een beheerder, en dat doet `klantenbot.py` op de mini-pc.

## Volgens de coach, nog niet uit een echte dump

De regel van de coachvelden: er gaat niets uit dat een veld van de coach leest dat nog niet in een echte dump van een
installatie stond. Deze ronde is gebouwd naar de bron van coach v0.243.0 (`zet_bezig`, `bezig_geldt`,
`_zonder_verlopen` in `tickets.py`, `async_tickets_busy` in `websocket.py`, `bezigNu` in `tickets-sheet.js`). De sessie
van de coach bij een klant stuurt een echte dump van `tickets/list` en `tickets/read` zodra Coach Assist daar een echte
vraag op bezig zet. Tot dan blijft de PR een concept.

## Proeven

`tests/js/bot-logica.test.mjs`, drie proeven erbij:

- **NIEUW GEDRAG**: bezig tot `tot`, ook in een andere tijdzone, en daarna niet meer;
- **NIEUW GEDRAG**: zonder `bezig`, of met iets wat geen moment is, niet;
- **REGRESSIEWACHT**: het abonnement neemt `bezig` over met het hele ticket, en een antwoord zonder `bezig` haalt het
  weg. `verwerk` deed dat al; deze proef valt op de oude code alleen om `bezigTot`.

Op de code van main (`git archive`, met het nieuwe proefbestand erin):

```
not ok 1 - NIEUW GEDRAG: tot `tot`, en daarna niet meer, ook zonder antwoord
  error: 'B.bezigTot is not a function'
not ok 2 - NIEUW GEDRAG: zonder `bezig`, of met iets wat geen moment is, niet
not ok 3 - REGRESSIEWACHT: het abonnement neemt `bezig` over, en een antwoord zonder `bezig` haalt het weg
```

`tests/js/gesprek-als-whatsapp.test.mjs` leest de regel waarmee het gesprek naar onderen gaat; die regel heeft er een
deel bij gekregen (de puntjes, alleen als je onderaan stond), en de proef is meegegaan.

Alles: 2548 JS-proeven en 1192 Python-proeven groen, plus `verify`, `check:registratie`, `check:controls`, `check:css`
en `check:taal`.

## Gemeten in de testinstance

De nagemaakte coach in `.ha-dev-config` (niet in git) heeft `tickets.py` van coach v0.243.0 letterlijk en de opdracht
`tickets/busy` zoals `websocket.py` van v0.243.0. Playwright headless als telefoon: 390 × 844, `isMobile`, `hasTouch`,
tikken. De kaart op view `bot` van `kaart-test`; `busy` en `answer` als beheerder over de websocket, zoals
`klantenbot.py` het doet.

| | Uitkomst |
|---|---|
| bundel geladen = schijf | `bd0cd1f49520` = `bd0cd1f49520` |
| tik op de kaart, Tickets, ticket 8 | `click:true` (`isTrusted`) |
| `busy` op het gesprek, 1 minuut | puntjes er, als laatste in het gesprek, `role="status"`, "Coach Assist is bezig", naam en merkje erboven |
| plaats | links, 2 px van de rand, net als het antwoord erboven (2 px); blok 57 × 34, onderkant in beeld |
| de puntjes | drie van 7 × 7, animatie `puntje`, vertraging 0 / 0,15 / 0,3 s |
| `prefers-reduced-motion: reduce` | animatie `none` bij alle drie |
| 2 tellen vóór `tot` | puntjes er |
| 1,5 tel na `tot`, zonder bericht van de coach | puntjes weg |
| laag vak, omhoog aan het lezen (`scrollTop` 0), puntjes erbij | `scrollTop` blijft 0 |
| laag vak, onderaan, puntjes erbij | mee naar onderen (`scrollTop` 84 → 147, 0 van onderen) |
| `answer` | puntjes weg, het antwoord is het laatste bericht |
| `busy` op ticket 8, het ticket open | puntjes er, links, als laatste |
| `busy` met 0 minuten | puntjes weg |
| `scrollWidth` / `clientWidth` | vak 328 / 328, pagina 390 / 390 |
| fouten op de pagina | geen |

Het lage vak is in de meting met `max-height: 110px` gezet: het gesprek van vandaag paste in beeld, en dan valt er
niets te scrollen.

## Samenvatting

Zolang Coach Assist aan een vraag of een ticket werkt, staan onderaan het gesprek drie bewegende puntjes aan zijn kant.
Ze gaan weg bij het antwoord, met 0 minuten, en vanzelf na `tot`, ook als de coach niets meer stuurt. Gemeten als
telefoon tegen de bron van coach v0.243.0. Uitbrengen wacht op een echte dump.

## Wat niet lukte

- Nog geen echte dump met `bezig`: die komt van de coach-sessie, na een echte vraag bij een klant.
- Niet op een echte telefoon bekeken, en niet in de app.

## Aannames

- De vorm van `bezig` is die uit de bron van coach v0.243.0 en uit het bericht van de werkplaats ("naam en vorm staan
  vast").
- Op de tegel van de kaart staat niets over bezig; daar is niet om gevraagd, en de puntjes horen in het gesprek.

## `git status --porcelain`

(vlak voor het vastleggen)

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/bot-logica.js
 M src/cards/bot-scherm.js
 M src/i18n/en/bot.js
 M tests/js/bot-logica.test.mjs
 M tests/js/gesprek-als-whatsapp.test.mjs
?? docs/coach-assist-bezig/
```
