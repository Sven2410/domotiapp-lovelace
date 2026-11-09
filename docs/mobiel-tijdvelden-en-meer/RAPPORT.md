# 0.118.1: het agendaformulier en het menu Meer op een telefoon

De eigenaar, 9 november 2026, met twee schermafdrukken van zijn iPhone: "Meer staat niet in het midden en calender op
telefoon loopt niet helemaal lekker over en uitgelijnd. Zorg altijd dat als je iets maakt dat het mobile friendly is".

## Wat er aan de hand was

- **Het formulier Nieuwe afspraak.** Begin en Eind liepen over elkaar, en Eind liep over de rechterrand van het formulier.
  Onderaan stond een schuifbalk opzij. Safari op iOS past `box-sizing: border-box` niet toe op een datum- of tijdveld.
  De padding (2 × 10 px) en de rand (2 × 1 px) kwamen dus bij de 100% erbij. Dat is valkuil 79; de wekkereditor kende
  hem al, het agendascherm niet. In Chrome staan de velden gewoon goed, en daarom zag mijn meting van 0.118.0 het niet.
- **Het menu Meer.** Met negen knoppen staat het menu in twee kolommen, en dan is het bijna zo breed als de balk. Het
  stond boven de knop Meer, geklemd tegen de rechterrand van de balk. Op de telefoon was dat zichtbaar scheef: links
  ruim twee keer zoveel ruimte als rechts.

## Wat er veranderd is

- **Datum- en tijdvelden:**
  - Een veld dat zijn vak vult, heeft zelf geen padding opzij en geen rand meer. De rand is een schaduw naar binnen, en
    die telt niet mee in de breedte.
  - Ze hebben `appearance: none`, zodat Safari geen eigen minimale breedte aanhoudt.
  - Dit geldt in het agendascherm, en ook in het beheer van het infoscherm, de laadpaalkaart en het
    automatiseringsscherm, die hetzelfde soort veld hebben. De laatste twee hadden al `appearance: none`, en hun vak
    knipte af wat uitstak.
- **Het agendascherm:**
  - Op een aanraakscherm hebben de velden 16 px tekst, anders zoomt Safari in zodra je erop tikt.
  - Het vak schuift niet meer opzij.
- **Het menu Meer:** twee kolommen staan altijd in het midden van de balk (`menuMidden` in `navbar-logica.js`). Eén
  kolom blijft boven zijn knop staan.
- **Werkafspraak in CLAUDE.md:** alles wat we maken is mobielvriendelijk, en wordt gemeten op 390 breed met aanraking.
  Daar hoort een meting bij dat niets opzij uitsteekt, en voor datum- en tijdvelden ook een meting met het rekenmodel van
  iOS. Valkuil 79 staat erbij.

## Gemeten

**Tests, NIEUW GEDRAG.** Beide vallen om op 0.118.0.

- **`tests/js/tijdveld-css.test.mjs`:** "zelf geen padding opzij, geen rand, en appearance none". Op 0.118.0 wees hij
  precies de velden aan:
  - het agendascherm: padding 8px 10px, een rand van 1px en geen `appearance: none`;
  - het automatiseringsscherm: padding 0 12px en een rand van 1px;
  - het beheer van het infoscherm: padding 4px 6px, een rand van 1px en geen `appearance: none`.

  Het tijdveld van de entiteitenkaart valt erbuiten: dat is zo breed als zijn inhoud en loopt nergens overheen.
- **`tests/js/navbar-logica.test.mjs`:** "menuMidden". Op 0.118.0 faalt het bestand al bij het importeren.

**Testinstance, als telefoon.** Playwright met 390 × 844, `isMobile`, `hasTouch` en schaal 3. De geladen bundel was die
op schijf (`1badc30d1981`). Alle 31 gebeurtenissen waren `isTrusted: true`: 8 tikken, en toetsen met 2 spaties.

| wat | uitkomst |
|---|---|
| formulier, gewoon | Begin 31–190, Eind 200–359, de binnenkant van het vak eindigt op 360. 10 px tussen de twee, Eind 1 px binnen de rand. Het vak schuift niet opzij (356 = 356). Tekst 16px |
| formulier, met `box-sizing: content-box` op de datum- en tijdvelden (zoals iOS) | precies dezelfde maten |
| kalender: maand, dag en jaar | vak 358 breed met 16 px marge, niets steekt uit, de pagina 390 breed |
| menu Meer, negen knoppen, de knop rechts | balk 8–382, menu 26–366: 18 en 16 px aan weerszijden. Het midden ligt op 196, het scherm op 195 |

De navigatiebalk van view `thema` kreeg voor de meting tijdelijk negen knoppen onder Meer, en is daarna teruggezet.

Bij één run, vlak na de herstart van de testinstance, stond er een 404 op de vorige bundelhash in de console. Bij de
volgende run niet meer: dat was de herstart, niet deze wijziging.

JS-tests 2384 groen, Python 1122 groen, alle bewakers groen.

## Samenvatting

Op een iPhone liepen de tijdvelden van het agendaformulier over elkaar en over de rand, en het menu Meer stond scheef.
Datum- en tijdvelden dragen nu zelf geen padding en rand meer, in elke kaart die zo'n veld zijn vak laat vullen, en een
bewaker houdt dat vast. Het menu met twee kolommen staat in het midden. Mobiel meten is een vaste werkafspraak.

## Wat niet lukte

- Niet op een echte iPhone gemeten: hier draait alleen Chromium. Het rekenmodel van iOS is nagebootst met `box-sizing:
  content-box`. Dat iOS geen eigen minimale breedte meer aanhoudt met `appearance: none`, volgt uit wat de laadpaalkaart
  en de wekkereditor eerder op zijn iPhone lieten zien. Het is niet opnieuw gemeten.

## Aannames

- "Meer staat niet in het midden" gaat over het menu dat opengaat, niet over de knop in de balk. De knop staat op zijn
  vaste plek rechts.

## git status --porcelain

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/agenda-scherm.js
 M src/cards/automatisering-scherm.js
 M src/cards/infoscherm-beheer-card.js
 M src/cards/laadpaal-card.js
 M src/cards/navbar-card.js
 M src/cards/navbar-logica.js
 M tests/js/navbar-logica.test.mjs
 M tests/js/tijdveld-css.test.mjs
?? docs/mobiel-tijdvelden-en-meer/
```
