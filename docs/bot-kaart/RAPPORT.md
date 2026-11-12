# De botkaart: "Vraag het de DomotiTech Bot"

Tak `fase-178/bot-kaart`. **Nog niet uitgebracht**: de tickets bestaan in de coach nog niet. Gebouwd en beproefd tegen
een nagemaakte coach in de testinstance, volgens contract 1 zoals het op 13 november 2026 is afgesproken. Het gaat pas
uit als het bij de eigenaar thuis in het echt werkt, met een echte dump van de coach als vaste testinvoer.

## De vraag

De eigenaar, 12 november 2026, in de werkmap-sessie: *"het moet in een popup komen zoals Vraag het de DomotiTech Bot
snap je? Alles in HA [...] Niet iedereen heeft en wil telegram."* En: *"Lovelace moet een eigen kaart hebben en dat
moet hetzelfde zijn in de coach snap je? Hetzelfde als de laadpaal kaart bijvoorbeeld."*

De klant stelt een vraag, doet een aanvraag of meldt een storing. Dat is een ticket. De coach bewaart het, en
DomotiTech antwoordt erop van buiten Home Assistant.

## Wat er is

- **`custom:domotiapp-bot-card`**: één tegel van één rasterrij (56 hoog), met het nieuwe icoon `chat`. Onder de naam
  staat "2 nieuwe antwoorden", of "1 vraag loopt", of niets. Een stip op het icoon betekent dat er een antwoord is dat
  deze gebruiker nog niet las. In de editor staan alleen een naam en een icoon.
- **Het scherm** (`bot-scherm.js`) hangt aan `document.body` (valkuil 34) en heeft drie standen:
  - **Lijst**: Nieuw, en daaronder de tickets. Het laatst bijgewerkte ticket staat bovenaan, met onderwerp, `#nummer ·
    soort · stand`, de tijd en een stip bij een ongelezen antwoord.
  - **Gesprek**: de berichten. Die van de klant staan rechts, die van DomotiTech links. Onderaan staat een veld om te
    reageren. Een gesprek openen stuurt `read`, maar alleen als er iets na het gelezene kwam.
  - **Nieuw**: kies Vraag, Aanvraag of Storing, typ, en Versturen. Daarna staat het gesprek er met "Ontvangen, we kijken
    ernaar", tot er een antwoord is. Het ticket staat dan ook in de lijst.
- **De standen voor de klant**:

  | stand | wat de klant leest |
  |---|---|
  | `nieuw` | Ontvangen |
  | `in_behandeling` | In behandeling |
  | `bij_beheerder` | Ligt bij DomotiTech (zoals de werkmap voorstelde) |
  | `klaar` | Afgerond |
  | een stand die er later bijkomt | In behandeling |

  Een onbekende soort is een vraag.
- **Live**: de kaart is geabonneerd met `BlijvendAbonnement` (valkuil 70) en neemt de beginlijst en daarna elk ticket
  over. Een antwoord komt binnen terwijl het gesprek open staat. Een herstart van Home Assistant overleeft hij zonder
  herladen.
- **Zonder coach**: de tegel zegt "Heeft DomotiApp Coach nodig". Het scherm zegt dat de bot via de coach werkt, zonder
  knop Nieuw.
- **Met een coach die de tickets niet kent**: Home Assistant zegt dan `unknown_command`, net als tijdens het opstarten.
  De herkansing vraagt het gewoon opnieuw. Staat de coach er en lukt het na twintig tellen nog niet, dan zegt de kaart
  "Werk DomotiApp Coach bij".
- **Tekst is tekst**: alles van de klant en van DomotiTech gaat er met `textContent` in. Een `<b>` in een antwoord
  staat er letterlijk.
- **Het veld** heeft 16px tekst (anders zoomt Safari in), geen eigen rand die meetelt (valkuil 79) en geen sleepgreepje.
  Ctrl of Cmd met Enter verstuurt.

## Hoe het gemeten is

Een nagemaakte coach in `.ha-dev-config/custom_components/domotiapp_coach/tickets.py` (niet in git). Hij volgt contract
1 uit de afspraak: `list`, `subscribe`, `new`, `reply`, `read`, `answer` en `set_state`, met een Store en de
gebeurtenis. Op `kaart-test` staat een view `bot`, met de kaart over de volle breedte, een tweede op halve breedte naast
een tegel van Home Assistant, en de favorietenkaart.

Playwright, 390 breed, `isMobile` en `hasTouch`, met tikken. Antwoorden komen zoals de mini-pc ze stuurt: als beheerder
`answer`.

```
BUNDEL schijf b9ea5c4fe720 geladen ["b9ea5c4fe720"]
MATEN [top, hoogte, links, breedte] {"bot":[80,56,8,374],"bot2":[208,56,8,183],"tile":[208,56,199,183]}
VELD {"waarde":"De lamp in de gang doet het niet meer","px":"16px","actief":true} spaties keydown:true:spatie (8x)
NA VERSTUREN {"stand":"gesprek","kop":"#5 · Storing","onder":"Ontvangen","berichten":["De lamp in de gang doet het niet meer"],"ontvangen":"Ontvangen, we kijken ernaar."}
ANTWOORD LIVE {"ontvangenNogDaar":false,"onder":"In behandeling","laatste":"Dank je. Zit er een <b>nieuwe</b> lamp in?\nZo niet: ...","html":false}
REACTIEVELD px 16px spaties 5
KAART na sluiten {"regel":"1 nieuw antwoord","stip":true}
BREEDTE nieuw    {"pagina":[390,390],"vak":[356,356,16,374,390]}
BREEDTE gesprek  {"pagina":[390,390],"vak":[356,356,16,374,390]}
BREEDTE lijst    {"pagina":[390,390],"vak":[356,356,16,374,390]}
ZONDER COACH / TE OUD {"geen":"Heeft DomotiApp Coach nodig","oud":"Werk DomotiApp Coach bij"}
LOG kliks touchstart:true click:true (5x)
FOUTEN []
```

- **De tegel** is 56 hoog, net als de tegel van Home Assistant ernaast (bovenkant 208, hoogte 56, allebei).
- **De breedte**: `vak` is `[scrollWidth, clientWidth, links, rechts, venster]`. In de eerste meting liep de lijst over
  de rand: het vak was 386 breed, van 16 tot 404, op een scherm van 390. Een raster met een automatische kolom groeit mee
  met een onderwerp dat niet afbreekt. Na de reparatie (een vaste kolom `minmax(0, 1fr)`) is het vak in alle drie de
  standen 356 breed, van 16 tot 374. Op 1366 breed is het 438, en de pagina scrolt nergens opzij.
- **Zonder coach en te oud** zijn gemeten met de echte kaart met de hand in de pagina (valkuil 21):
  - een `hass` zonder `domotiapp_coach` in de componenten;
  - een verbinding die `unknown_command` geeft, en dan twintig tellen wachten.
- **De herstart**: de pagina bleef open, en Home Assistant herstartte met `pm2 restart`. Daarna kwam er een antwoord via
  een eigen websocket, niet vanuit de pagina:

  ```
  23:13:33 VOOR {"regel":"2 vragen lopen","stip":false} navigaties 2
  23:13:35 HERSTART
  23:13:56 TERUG {"regel":"2 vragen lopen","stip":false}
  antwoord True 3
  23:13:59 NA ANTWOORD {"regel":"1 nieuw antwoord","stip":true} navigaties 2
  ```

  Het aantal navigaties bleef 2. Dat zijn de eerste lading en de herlading die Home Assistant zelf doet. De kaart herlaadde
  dus niet; hij abonneerde zich opnieuw.
- **Licht thema**: schermafdrukken van tegel, lijst en gesprek. Kaart en scherm staan op `dac-thema="licht"`.

## Proeven

`tests/js/bot-logica.test.mjs`, 17 proeven, allemaal **NIEUW GEDRAG**. Ze gaan over:
- het abonnement: de beginlijst, een ticket dat verandert of erbij komt, en het contract;
- gelezen per gebruiker;
- de regel op de tegel, ook in het Engels;
- de standen en soorten, ook onbekende;
- nakijken voor versturen;
- foutzinnen en tijden.

Op de code van main bestaat `bot-logica.js` niet:

```
# Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../src/cards/bot-logica.js'
```

Alles samen: 2422 JS-proeven groen. `check:taal`, `check:css`, `check:registratie`, `check:controls` en `verify` zijn
ook groen. Python is niet veranderd.

Het icoon `chat` staat op de vier plekken: de tekening, de groep, de zoekwoorden en `iconen.json`
(`scripts/iconen-naar-paden.py`).

## Samenvatting

Een nieuwe kaart `custom:domotiapp-bot-card`: één tegel en een scherm met de tickets van het huis, een gesprek, en een
nieuwe vraag, aanvraag of storing. De tickets komen live van de coach (contract 1). Gemeten als telefoon met echte
tikken en getypte spaties, over een herstart van Home Assistant heen, in licht en donker, en zonder coach.

## Wat niet lukte

- **Niet tegen de echte coach**: die heeft de tickets nog niet. De werkplaats bouwt ze als v0.220.0. Tot er een echte
  dump is, gaat dit niet uit (CLAUDE.md, *Het contract met DomotiApp Coach*).
- De editor (naam en icoon) is niet in een browser geopend. Er staan alleen standaardvelden in: een tekstveld van
  `ha-form` en de icoonkiezer van de familie.
- iOS zelf is niet gemeten. Het veld volgt de regels van valkuil 79, maar wat het toetsenbord met een venster van vaste
  hoogte doet, laat Chrome niet zien.

## Aannames

- Een tijd wordt getoond in de tijdzone van het toestel, niet die van Home Assistant. Voor een gesprek is dat wat de
  klant verwacht.
- De lijst sorteert op `bijgewerkt` en niet op nummer. Zo staat een ticket met een nieuw antwoord bovenaan.
- `bij_beheerder` heet voor de klant "Ligt bij DomotiTech", zoals de werkmap voorstelde.
- Het versienummer 0.124.0 in de commentaren is het volgende vrije. Komt er eerst een andere uitgave, dan schuift dat op.

## git status --porcelain

Bij het schrijven van dit rapport, vóór de commit:

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/afbeeldingen/iconen.json
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M src/editor/icoon-zoek.js
 M src/i18n/en.js
 M src/icons.js
 M src/index.js
?? docs/bot-kaart/
?? src/cards/bot-card.js
?? src/cards/bot-logica.js
?? src/cards/bot-scherm.js
?? src/i18n/en/bot.js
?? tests/js/bot-logica.test.mjs
```
