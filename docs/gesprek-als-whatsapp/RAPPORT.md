# Het gesprek van Coach Assist zoals WhatsApp (0.127.0)

De eigenaar, 15 november 2026, nadat een klant het gesprek een paar keer gebruikte (doorgegeven door de sessie van die
klant):

> kijk even goed hoe whatsapp het doet. Blokken rechts van je eigen tekst, blokken links van de antwoorden. En duidelijk
> aangeven of het de gebruiker is met de naam of de coach snap je
>
> standaard naar het laatste bericht scrollen, ipv bovenaan beginnen
>
> Evt de historische dagen ingevouwen? Tot een week max

Halverwege zei hij in de werkplaats van de coach nog: *"Bij datum een dropdown niet zo veel datums laten zien ivm
ruimtegebrek"*. Het paneel van de coach (`tickets-sheet.js`, v0.224.0) en deze kaart zijn samen afgestemd. Ze lezen
hetzelfde, op één verschil na, zie *Aannames*.

## Wat er veranderd is

**De zijden.** Rechts staat alleen wat de gebruiker die kijkt zelf schreef (`isEigen`: `user_id` van het bericht tegen de
ingelogde gebruiker). De antwoorden staan links, en ook een andere bewoner, zoals WhatsApp in een groep. Tot nu stond
elk klantbericht rechts, ook dat van een huisgenoot.

**De naam.** De naam staat boven elk blok:
- bij een bewoner zijn naam, ook boven je eigen bericht;
- bij een antwoord "Coach Assist" in de accentkleur, met het COACH-logo ervoor.

**Het blok.** Elk blok is hoogstens 80% breed. Je eigen blok heeft de accenttint en een rechte hoek rechtsboven. Een
antwoord heeft het gewone vlak met een rechte hoek linksboven. De tijd staat klein rechtsonder in het blok (alleen de
klok), en een foto staat ook in het blok.

**De dagen.** Boven elke dag staat een pil: "Vandaag", "Gisteren", binnen een week de weekdag met de datum
("Vrijdag 13 november"), en ouder alleen de datum.

**Wat in beeld staat:**
- de laatste dag met berichten, ook als dat niet vandaag is (anders opent een stil gesprek leeg);
- elke dag met een antwoord dat je nog niet las.

Alle andere dagen staan in één keuzelijst boven het gesprek:
- Eerst "Eerdere dagen", daarna de dagen, nieuwste eerst ("Gisteren · 2 berichten").
- Alles van meer dan 7 dagen vóór het laatste bericht is samen één keuze: "Oudere berichten · n berichten".
- Kies je een dag, dan komt die op zijn plek in het gesprek, en schuift het gesprek naar het begin van die dag. Er staat
  er één tegelijk.
- De keuze blijft staan tot het scherm weer opengaat, ook als er een bericht bijkomt.
- Is er alleen vandaag, dan is er geen lijst.

In een ticket staan alle dagen met hun scheiding, zonder lijst.

**Scrollen.** Het gesprek gaat naar onderen:
- bij openen en bij wisselen naar het tabblad;
- na je eigen bericht, altijd;
- bij een antwoord alleen als je al onderaan stond. Wie terugleest, wordt niet weggetrokken.

De foto's hebben een vaste maat (96 bij 96), dus een plaatje dat later laadt duwt niets weg. Het onderaan openen deed de
kaart al; dat stond alleen in het paneel van de coach verkeerd. Gemeten, zie hieronder.

## Hoe het erin zit

| Wat | Waar |
|---|---|
| de zijde, de dagen, de lijst | `isEigen`, `dagKop`, `klokVan` en `inDagen` in `src/cards/bot-logica.js`, zonder DOM |
| het tekenen en het scrollen | `tekenBerichten_`, `tekenKeuzes_` en `berichtEl_` in `src/cards/bot-scherm.js` |
| de keuzelijst | `<select class="keuze dagen">`, met een eigen achtergrondkleur voor de opties; `check:controls` bewaakt nu ook dit bestand |

`user_id` op een bericht staat in de echte dump van coach v0.220.0 (`tests/js/vaste-invoer/coach-0.220.0-tickets.json`).
Een klantbericht zonder `user_id` telt als eigen, zoals tot nu. Het contract is niet veranderd.

## Gemeten

Playwright, 390 bij 844, `isMobile`, `hasTouch`, `deviceScaleFactor` 3, met tikken.

**Verse code:** de geladen `?v=8e321adf1152` is gelijk aan de sha256 op schijf.

**De gegevens:** het gesprek in de testinstance kreeg 12 berichten over vijf dagen, van twee accounts:
- 4 november, meer dan een week terug;
- 12 en 13 november;
- gisteren;
- vandaag.

Het account `dev` kijkt; het andere account heet in de gegevens Anna.

**Geopend:**
- Alleen "Vandaag" staat in beeld, met onderaan 0 px te gaan.
- De keuzelijst heeft "Eerdere dagen", "Gisteren · 2 berichten", "Vrijdag 13 november · 2 berichten", "Donderdag
  12 november · 2 berichten" en "Oudere berichten · 2 berichten".
- De lijst is 312 bij 34, met 16px tekst.

| bericht | zij | naam | links | rechts | breedte |
|---|---|---|---|---|---|
| Anna 09:12 | ander | Anna | 2 | 66,8 | 79% |
| antwoord 09:14 | ander | Coach Assist (logo 13,8 × 13,8) | 2 | 66,8 | 79% |
| dev 10:02 | eigen | dev | 66,8 | 2 | 79% |
| antwoord 10:03 | ander | Coach Assist | 2 | 66,8 | 79% |

Dezelfde gegevens op 0.126.0 (de bundel van main teruggezet en de entry herladen):
- Anna staat RECHTS (links 50,6, rechts 2).
- Alle 18 berichten van twee weken staan onder elkaar, met de datum in de naamregel.

**De keuzelijst.** Kiezen ging met een echte tik op de lijst en daarna het toetsenbord, want het uitklappaneel is van
het systeem. De `change` had `isTrusted: true`.
- "Gisteren": Gisteren staat op zijn plek boven Vandaag. De scheiding staat 2 px onder de bovenrand van het gesprek.
- Daarna "Oudere berichten": Gisteren is weg, 4 november staat erbij, en het gesprek staat bovenaan.

**Typen en versturen:**
- Getypt is "Werkt de laadpaal nog?", met echte toetsen.
- De drie spaties hadden een `keydown` met `isTrusted: true`.
- Het veld heeft 16px tekst.
- Verstuurd terwijl het gesprek bovenaan stond: daarna onderaan (0 px te gaan), het blok rechts.

**Een antwoord:**
- Terwijl je bovenaan staat: `scrollTop` blijft 0.
- Terwijl je onderaan staat: weer 0 px te gaan.

**Dicht en weer open:** alleen Vandaag in beeld, de keuze is weg, en het opent onderaan.

**Breedte:**
- 390: de pagina 390 = 390, het vak 356 = 356, het gesprek 328 = 328.
- 320: de pagina 320 = 320, het vak 286 = 286, het gesprek 258 = 258. De blokken zijn ook hier hoogstens 79% breed.
- Geen paginafouten.

De schermafdrukken zijn bekeken: geopend, en met Gisteren gekozen.

## Proeven

`tests/js/gesprek-als-whatsapp.test.mjs` heeft 21 proeven. Ze zijn NIEUW GEDRAG, op één REGRESSIEWACHT na: de naam
boven het blok, die er al was. Ze toetsen:
- de zijde, met de echte dump;
- de dagscheiding, in het Nederlands en het Engels;
- de keuzelijst: de volgorde, één keuze, Oudere berichten, ongelezen, vast, een keuze die er niet meer is, en in een
  ticket;
- en, door de bron te lezen, de regels voor het scrollen en de 16px van de lijst.

Tegen de code van main (`git archive`) slaagt alleen de regressiewacht:

```
# pass 1
# fail 20
```

Alles bij elkaar:
- 2470 JS-proeven en 1155 Python-proeven, groen;
- `verify`, `check:registratie`, `check:controls`, `check:css` en `check:taal`, groen.

## Samenvatting

0.127.0 maakt het gesprek van Coach Assist als WhatsApp:
- jouw berichten rechts, de antwoorden en de andere bewoners links;
- boven elk blok de naam, met het logo bij Coach Assist;
- een pil per dag;
- alleen de laatste dag in beeld, en de eerdere dagen in één keuzelijst;
- openen bij het laatste bericht, en niet weggetrokken worden terwijl je terugleest.

Het paneel van de coach doet hetzelfde (v0.224.0).

## Wat niet lukte

- Niet op een echte iPhone gezien. Het uitklappaneel van de keuzelijst is op iOS een eigen kiezer, en die is niet te
  meten in Chrome.
- Alleen in het lichte thema gemeten.
- De herlading die de bundelverversing een paar tellen na het laden doet (`verouderd.js`, na het herladen van de entry),
  maakte de eerste meting kapot. De meting wacht nu 15 tellen. Dat is geen fout van de kaart.

## Aannames

- De naam staat ook boven je eigen blok. WhatsApp laat hem daar weg, maar de eigenaar vroeg "duidelijk aangeven of het
  de gebruiker is met de naam".
- De keuzelijst heeft 16px tekst, anders zoomt Safari in zodra hij opengaat. Het paneel van de coach heeft dat niet
  gezegd; dat is het enige verschil, en het staat in het bericht aan de werkplaats.
- Na de proef staat het gesprek van 12 (nu 18) berichten nog in de testinstance, als testmateriaal. De oude opslag staat
  in de kladmap.
- Versie 0.127.0: iets nieuws op het scherm.

## git status --porcelain

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M scripts/check-controls.mjs
 M src/cards/bot-logica.js
 M src/cards/bot-scherm.js
 M src/i18n/en/bot.js
?? docs/gesprek-als-whatsapp/
?? tests/js/gesprek-als-whatsapp.test.mjs
```
