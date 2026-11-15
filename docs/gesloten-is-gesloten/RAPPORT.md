# Coach Assist: gesloten is gesloten (0.129.0)

De eigenaar, 15 november 2026 (doorgegeven door de werkmap-sessie): *"als een ticket gesloten is moet je niet meer
opnieuw kunnen typen en de klant moet ook goed kunnen zien wat open staat en gesloten is"*. De afspraak staat in de
notities van de werkmap ("Wijziging 15-11-2026 (avond)"). Het paneel van de coach krijgt hetzelfde via een werkbon.

## Wat er veranderd is

**De lijst Tickets:**
- **Open** staat bovenaan, met het aantal ("Open · 12"). Daaronder komt **Gesloten · n** als knop, ingeklapt; een tik
  klapt het open.
- Gesloten tickets zijn minder opvallend (dekking 0,72).
- Staat er in een gesloten ticket een antwoord dat je nog niet las, dan is Gesloten al open.

**Een etiket per ticket**, voor het nummer en de soort:

| Etiket | Kleur | Bij de stand |
|---|---|---|
| **Open** | accent | `nieuw` |
| **In behandeling** | oranje | `in_behandeling`, `bij_beheerder`, en elke stand die de kaart niet kent |
| **Gesloten** | grijs | `klaar` |

Boven een gesloten ticket staat ook "Gesloten"; dat was "Afgerond".

**Een gesloten ticket** opent nog, om terug te lezen, maar zonder veld om te typen. In plaats daarvan:
- de zin "Dit ticket is gesloten. Is het er weer? Maak een nieuw ticket.";
- de knop **Nieuw ticket**, met de soort van het gesloten ticket al gekozen. Bij Geen DomotiCare is dat altijd
  Storing. Zijn de tickets van vandaag op, dan is die knop er niet.

**De fout `ticket_gesloten`** van de coach staat er als "Dit ticket is gesloten. Is het er weer? Maak dan een nieuw
ticket." De getypte tekst blijft staan.

Het contract is niet veranderd. `klaar` stond al in de dump van v0.220.0, en `ticket_gesloten` is alleen een foutcode.

## Gemeten

Playwright, 390 en 320 breed, `isMobile`, `hasTouch`, met tikken. Verse code: de geladen `?v=699121cdcca9` is gelijk
aan de sha256 op schijf. In de testinstance zijn steeds twee tickets gesloten (`set_state` naar `klaar`) en daarna
teruggezet.

**De lijst:**
- Geopend: "Open · 12" met de open tickets, en "Gesloten · 2" ingeklapt (`aria-expanded` false).
- Na een tik op Gesloten: de twee gesloten tickets eronder, met het etiket "Gesloten" in grijs (`rgba(28,27,24,.6)`)
  en dekking 0,72. Het etiket "Open" is accent (`rgb(10,106,166)`), "In behandeling" oranje (`rgb(148,98,0)`).

**Een gesloten ticket:**
- Geen veld; wel de zin en Nieuw ticket.
- Boven het ticket staat "Gesloten".
- Nieuw ticket opende het scherm Nieuw ticket met Storing gekozen, net als het gesloten ticket.

**Een open ticket** heeft gewoon zijn veld.

**Breedte:**
- 390: de pagina 390 = 390, de lijst 328 = 328, het vak 356 = 356.
- 320: de pagina 320 = 320, de lijst 258 = 258, het vak 286 = 286.

Geen paginafouten. De schermafdrukken van de lijst met Gesloten open en van een gesloten ticket zijn bekeken.

## Proeven

`tests/js/gesloten-is-gesloten.test.mjs` heeft 6 proeven, NIEUW GEDRAG. Ze toetsen:
- de etiketten voor elke stand, met de standen uit de echte dump van v0.220.0, en in het Engels;
- de fout;
- en, door de bron te lezen, de groepen, het verborgen veld en de soort die meegaat.

Tegen de code van main: `pass 0`, `fail 6`.

Twee oude proeven verwachtten bij `klaar` nog "Afgerond" en zeggen nu "Gesloten" (`bot-logica.test.mjs` en
`bot-dump-0220.test.mjs`). Die verandering is de bedoeling.

Alles bij elkaar:
- 2501 JS-proeven en 1155 Python-proeven, groen;
- `verify`, `check:registratie`, `check:controls`, `check:css` en `check:taal`, groen.

## Samenvatting

0.129.0 zet open en gesloten tickets apart, elk ticket met een etiket voor zijn stand. Een gesloten ticket is alleen
nog terug te lezen, met een knop voor een nieuw ticket van dezelfde soort.

## Wat niet lukte

- **De fout `ticket_gesloten` niet in het echt gezien.** De coach die hem geeft is nog niet uit (werkbon bij de
  werkplaats). De kaart laat bij een gesloten ticket ook geen veld meer zien, dus de fout komt alleen bij een ticket dat
  sluit terwijl je typt.
- **"foto verwijderd" bij `bijlagen_weg` zit er nog niet in.** Dat is een nieuw veld van de coach, en dat leest de kaart
  pas als het in een dump van een uitgebrachte coach stond (de regel van 12 oktober 2026).
- **Niet op een echte iPhone gezien.**
- **Alleen in het lichte thema gemeten.**

## Aannames

- `bij_beheerder` heeft het etiket "In behandeling"; in woorden staat er nog "Ligt bij DomotiTech" boven het ticket.
- De kleuren: Open accent, In behandeling oranje, Gesloten grijs.
- Versie 0.129.0: iets nieuws op het scherm.

## git status --porcelain

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/bot-logica.js
 M src/cards/bot-scherm.js
 M src/i18n/en/bot.js
 M tests/js/bot-dump-0220.test.mjs
 M tests/js/bot-logica.test.mjs
?? docs/gesloten-is-gesloten/
?? tests/js/gesloten-is-gesloten.test.mjs
```
