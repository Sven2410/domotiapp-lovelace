# Coach Assist: Foto verwijderd, en gesloten is gesloten met coach v0.230.0 (0.130.0)

Coach v0.230.0 ruimt op, met het akkoord van de eigenaar (15 november 2026):
- een gesloten ticket staat na een dag niet meer in de lijst;
- na 30 dagen gaan zijn foto's weg;
- na 90 dagen gaat het ticket zelf weg.

Is een foto weg, dan krijgt het bericht `bijlagen_weg: true`, en zijn `bijlagen` zijn verdwenen. In die versie weigert
de coach ook een reactie op een gesloten ticket (`ticket_gesloten`). De kaart wist dat al sinds 0.129.0; deze ronde
meet het tegen de echte coach.

## Wat er veranderd is

- **Foto verwijderd.** Bij `bijlagen_weg` staat er in het blok "Foto verwijderd" (Engels "Photo removed"), cursief,
  met het icoon van de camera. Geen leeg of kapot vak. Zo doet het paneel van de coach het ook.
- **Nieuw ticket bij een gesloten ticket neemt de getypte tekst mee.** Dat is voor als een ticket dichtging terwijl
  iemand typte. Zo doet het paneel het ook; de werkplaats meldde het als enige verschil.

## Wat de coach geeft

De dump `tests/js/vaste-invoer/coach-0.230.0-gesloten.json` is gemaakt met `tickets.py` van de tag v0.230.0. Alleen de
vertaalfunctie is vervangen. De stappen, op vaste tijden:
1. een storing met een foto;
2. een antwoord;
3. sluiten (`gesloten` in het ticket);
4. reply en answer op het gesloten ticket (allebei `ticket_gesloten`, met de zin);
5. de lijst na 3 uur (staat erin) en na 2 dagen (weg);
6. opruimen na 31 dagen (`bijlagen` weg, `bijlagen_weg: true`);
7. weer openen (`gesloten` weg).

De nagebootste coach in de testinstance draait nu `tickets.py` van v0.230.0 letterlijk.

## Gemeten

Playwright, 390 en 320 breed, `isMobile`, `hasTouch`, met tikken. Verse code: `?v=2ee28e25e51a`, gelijk aan de sha256
op schijf. Op beide breedtes is de uitkomst gelijk.

**Foto verwijderd.** In de testopslag heeft het bericht met de foto van ticket #1 `bijlagen_weg` gekregen, zoals de
coach dat na 30 dagen doet:
- er staat "Foto verwijderd", 171 bij 15, binnen het blok;
- de kleur is ink-3;
- er is geen `<img>`;
- het vak schuift niet opzij (356 = 356, en 286 = 286).

**Een ticket gaat dicht terwijl je typt:**
- Getypt is "Hij doet het weer niet", met vier spaties, alle aanslagen `isTrusted`.
- De kaart miste even het bericht van de coach, en de beheerder sloot het ticket (`set_state` naar `klaar`).
- Daarna Versturen: de coach (v0.230.0) zei `ticket_gesloten`. De kaart toonde "Dit ticket is gesloten. Is het er
  weer? Maak dan een nieuw ticket.", en de tekst bleef staan.
- Na het volgende bericht van de coach staat het ticket dicht: geen veld, wel de zin, en "Gesloten" boven het ticket.
- Nieuw ticket opende met Storing gekozen en met "Hij doet het weer niet" in het veld.

Geen paginafouten. De schermafdruk van "Foto verwijderd" is bekeken.

## Proeven

`tests/js/bot-dump-0230.test.mjs` heeft 6 proeven:
- **NIEUW GEDRAG** (2): "Foto verwijderd" bij `bijlagen_weg`, en de tekst die meegaat.
- **REGRESSIEWACHT** (4): de dump door de logica van de kaart: gesloten, `ticket_gesloten`, de lijst na een dag, en
  `bijlagen_weg`. 0.129.0 kende `klaar` en `ticket_gesloten` al.

Tegen de code van main: de 4 regressiewachten slagen, de 2 nieuwe falen (`pass 4`, `fail 2`).

Alles bij elkaar:
- 2507 JS-proeven en 1155 Python-proeven, groen;
- `verify`, `check:registratie`, `check:controls`, `check:css` en `check:taal`, groen.

## Samenvatting

0.130.0 zegt "Foto verwijderd" waar de coach een foto heeft opgeruimd, en neemt bij een gesloten ticket de getypte
tekst mee naar een nieuw ticket. Gesloten is gesloten werkt tegen de echte coach v0.230.0.

## Wat niet lukte

- **Niet op een echte iPhone gezien.**
- **Alleen in het lichte thema gemeten.**
- **"Foto verwijderd" kwam niet echt na 30 dagen.** Het is gezet in de testopslag, op een open ticket, want een
  gesloten ticket staat na een dag niet meer in de lijst. De vorm van het bericht komt wel uit de echte functie van de
  coach (de dump).

## Aannames

- De tekst is "Foto verwijderd", ook als een bericht er meer dan één had. De coach zegt niet hoeveel.
- Versie 0.130.0: iets nieuws op het scherm.

## git status --porcelain

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/bot-scherm.js
 M src/i18n/en/bot.js
?? docs/foto-verwijderd/
?? tests/js/bot-dump-0230.test.mjs
?? tests/js/vaste-invoer/coach-0.230.0-gesloten.json
```
