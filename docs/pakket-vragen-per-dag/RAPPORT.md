# Coach Assist en het abonnement: DomotiCare (0.128.0)

De eigenaar, 15 november 2026 (doorgegeven door de werkmap-sessie):
- klanten krijgen een abonnement: DomotiCare (10 vragen per dag), DomotiCare Plus (25) of DomotiCare Onbeperkt, en
  *"elk abbo heeft geen maandlimiet"*;
- daarna ook een grens op nieuwe tickets, tegen spam (5, 10 of geen);
- *"ik wil bij de coach assist ook zien welk abbo je hebt zoals domoticare of domoticare plus"*;
- een vierde keuze, Geen DomotiCare: *"Dan moet er geen AI assistant in zitten etc"*, en daarna *"Ja zonder care wel
  een storing melden"*.

De coach houdt de grenzen bij en geeft ze door. De kaart laat ze zien. Afgestemd met de werkplaats; het paneel van de
coach doet hetzelfde.

## Wat de klant ziet

**Vragen:**
- Onder het veld staat "Nog 7 vragen vandaag". Bij 3 of minder is dat opvallender.
- Op 0 gaat het veld uit. De getypte tekst blijft staan, eronder komt de zin van de coach, en de knop
  **Meld een storing**.
- Meld een storing opent Nieuw ticket met Storing gekozen, en neemt de getypte tekst mee.

**Tickets:**
- Bij 2 of minder staat er "Nog 1 ticket vandaag" bij de knop Nieuw ticket.
- Op 0 is die knop weg, met de zin van de coach eronder. Ook Versturen op het scherm Nieuw ticket is dan weg, en
  Meld een storing bij Vragen.

**Wanneer het weer kan:** om middernacht in de tijdzone van Home Assistant (`opnieuw`) gaat het vanzelf weer open, ook
zonder bericht van de coach.

**Een vraag of ticket te veel:** gebruikte een ander toestel net de laatste, dan weigert de coach (`pakket_op`). De
kaart toont dan zijn zin, de tekst blijft staan, en het veld of de knop gaat dicht tot middernacht.

**Welk abonnement:**
- De naam staat als etiket bij de titel van het scherm. Op een telefoon past "Vraag het Coach Assist" er niet naast,
  dus daar staat het eronder.
- Op de tegel staat het alleen als het naast de naam past. Op een tegel van de volle breedte op 390 is dat zo, op een
  halve niet. Elke tegel blijft 56 hoog.

**Geen DomotiCare** (`coach_assist: false`):
- De tegel heet **Meld een storing**, zonder etiket.
- Het scherm heeft alleen Tickets, zonder tabblad Vragen.
- Een nieuw ticket is altijd een storing.
- De fout `geen_coach_assist` staat er als "Coach Assist zit niet in je abonnement. Een storing melden kan altijd."

**Zonder abonnement** (`pakket: null`) werkt alles zoals in 0.127.0.

## Wat de coach geeft

De dump komt uit coach v0.225.0: `tests/js/vaste-invoer/coach-0.225.0-pakket.json`, met een proef
(`bot-dump-0225.test.mjs`). Hij is gemaakt met `tickets.py` van die uitgave, letterlijk in de nagebootste coach van de
testinstance, en de websocket volgens `websocket.py` van die tag. Daarin staat:
- `pakket` altijd in `list` en in het eerste event, ook als `null`;
- `{ticket, pakket}` na een vraag en na een nieuw ticket;
- `{pakket}` alleen, na `set_plan`;
- `pakket_op` op een vraag en op een ticket;
- `geen_coach_assist`;
- Onbeperkt;
- geen pakket.

Een storing melden bij Geen DomotiCare weigert v0.225.0 nog. Dat komt in de volgende coach (werkbon bij de
werkplaats). Tot dan toont de kaart de zin van hierboven, en blijft de tekst staan.

## Gemeten

Playwright, `isMobile`, `hasTouch`, met tikken, tegen de echte code van v0.225.0. Verse code: de geladen `?v=` is
gelijk aan de sha256 op schijf.

**Vragen en tickets**, op 390 en op 320:

| stap | Vragen | Tickets |
|---|---|---|
| één vraag en twee tickets over | "Nog 1 vraag vandaag" (opvallend), veld aan | "Nog 2 tickets vandaag" |
| de laatste vraag gesteld (getypt, vijf spaties `isTrusted`) | veld uit, zin, Meld een storing | |
| Meld een storing | Nieuw ticket, Storing gekozen, de tekst ging mee | |
| dat ticket verstuurd | | "Nog 1 ticket vandaag" |
| alles op 0 | veld uit, geen Meld een storing | Nieuw ticket weg, zin eronder |
| een ander toestel stelde de laatste vraag, daarna verstuurd | `pakket_op`: veld uit, de tekst staat er nog | |
| een ander toestel maakte het laatste ticket, daarna verstuurd | | `pakket_op`: de zin, de tekst staat er nog, Versturen weg |
| geen pakket | | zoals 0.127.0 |

Pagina en scherm schuiven niet opzij: 390 = 390 en 356 = 356, en 320 = 320 en 286 = 286.

**Het etiket:**
- Op een tegel van de volle breedte op 390 staat het helemaal in beeld: 16 hoog, op de naamregel.
- Op een halve tegel, en op 320, is het er niet (geen plek).
- Elke tegel is 56 hoog.
- In het scherm staat het etiket als pil (radius 999 px, het accent op 12%) onder de titel. De kop wordt 52 hoog, en
  44 zonder etiket.

**Geen DomotiCare**, op 390 en op 320:
- Beide tegels heten "Meld een storing", zonder etiket.
- Het scherm opent op Tickets, zonder tabbladen, met de kop "Meld een storing".
- Nieuw ticket heeft alleen Storing, met de ondertitel "Iets doet het niet zoals het hoort.".
- Versturen gaf `geen_coach_assist` met de zin. De getypte tekst bleef staan.
- Het abonnement terug op DomotiCare: de tabbladen en het etiket zijn er weer.

Geen paginafouten.

## Proeven

Twee nieuwe proefbestanden, samen 25 proeven, NIEUW GEDRAG:
- `pakket-vragen.test.mjs` (20);
- `bot-dump-0225.test.mjs` (5).

Tegen de code van main (`git archive`): `pass 0`, `fail 25`.

Alles bij elkaar:
- 2495 JS-proeven en 1155 Python-proeven, groen;
- `verify`, `check:registratie`, `check:controls`, `check:css` en `check:taal`, groen.

## Samenvatting

0.128.0 laat het abonnement zien in Coach Assist:
- hoeveel vragen en tickets er vandaag nog zijn;
- een veld of knop die op 0 dicht gaat, met de zin van de coach en een weg naar een storing;
- de naam van het abonnement;
- en bij Geen DomotiCare een tegel Meld een storing met alleen tickets.

## Wat niet lukte

- **Een storing melden bij Geen DomotiCare** weigert coach v0.225.0 nog. De kaart is er klaar voor; het werkt zodra de
  volgende coach uit is.
- **Niet op een echte iPhone gezien.**
- **Alleen in het lichte thema gemeten.**
- **Onderweg drie fouten van mij, alle drie hersteld:**
  - Een bewerking haalde een groot stuk uit `bot-logica.js` weg. De bouwstap ving het, en het is uit main teruggezet.
  - De stijl van het etiket stond ná het stijlblad dat hem gebruikt. Daardoor was het geen pil en was de sluitknop
    vierkant. Gezien op een schermafdruk; er staat nu een proef op.
  - In een tussenversie verborg Geen DomotiCare de tegel, en kwam hij nooit terug. Die versie is vervangen door de
    storingstegel.

## Aannames

- Bij Geen DomotiCare heet de tegel altijd "Meld een storing", ook als er in de editor een eigen naam staat.
- De tegel houdt het logo van COACH.
- Versie 0.128.0: iets nieuws op het scherm.

## git status --porcelain

Vóór de laatste commit van de tak (de eerdere stappen staan al in eigen commits):

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M src/cards/bot-card.js
 M src/cards/bot-logica.js
 M src/cards/bot-scherm.js
 M src/i18n/en/bot.js
 M tests/js/pakket-vragen.test.mjs
?? docs/pakket-vragen-per-dag/
?? tests/js/bot-dump-0225.test.mjs
?? tests/js/vaste-invoer/coach-0.225.0-pakket.json
```
