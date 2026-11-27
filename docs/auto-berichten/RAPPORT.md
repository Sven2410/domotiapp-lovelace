# De berichten van de auto: op de kaart en als melding — 0.141.0

## Waarom

De eigenaar, 27 november 2026, via zijn beheersessie: *"kan je ook de lovelace vragen voor een berichten melding in de
kaart en berichten wissen? (...) Ook om een notificatie te krijgen in HA van de bus bijvoorbeeld. Dus bij woning
instellingen en dan notificaties naast afval en camera ook van je bus etc snap je?"* En daarna: *"dat moet eigenlijk voor
elke auto merk zijn dus we moeten het kunnen uitbreiden voor merken etc"*.

Zijn bus hangt aan FordPass (HACS, marq24 "fordpass 2025"). Daar stonden acht keer "Waarschuwing controlesysteem
bandenspanning" in, die hij nergens zag.

## De echte dump

De beheersessie las de sensor en de knoppen bij de eigenaar, alleen lezend. Zonder VIN en met verzonnen `messageId`'s staat
die dump in `tests/js/vaste-invoer/fordpass-berichten.json`; het script dat hem maakte stond in de kladmap. Wat hij liet
zien:

| wat | gevolg |
|---|---|
| de sensor `..._messages` (`translation_key: messages`) heeft het AANTAL als toestand ("8", eenheid `messages`) | de tegel leest de toestand |
| de berichten staan twee keer in de attributen: `json_src` (een lijst, met `isRead`) en plat `msg001_Date/_Type/_Subject/_Content`... | beide vormen worden gelezen |
| `json_src` staat NIET in de recorder, de platte vorm wel | de sleutel van een bericht is in beide vormen gelijk: de datum en het onderwerp, letterlijk |
| bij 0 berichten staat geen van beide er | 0 is "geen berichten", `unavailable` is "niets te zeggen" |
| `createdDate` is "11/10/2026 06:50:04 AM", maand eerst | `fordDatum` / `datum`; volgens de beheersessie UTC |
| `contentType` is "Html" | de tekst gaat zonder tags door |
| de knop `..._msgdeleteall` (`translation_key: msgdeleteall`) wist bij Ford: 8 naar 0 in 20 s | de kaart zoekt die knop zelf op het apparaat |
| `..._msgdeletelast` staat uit | een uitgeschakelde knop staat niet in `hass.entities` en telt niet |

## Wat er gebouwd is

### Per merk

Het merk is het `platform` van de gekozen sensor in het entiteitenregister, niet een naam. Per merk staat er één regel in
`MERKEN`, aan twee kanten:

- `src/cards/auto-berichten.js`;
- `custom_components/.../meldingen/auto.py`.

Elke regel zegt drie dingen:

- hoe de berichten gelezen worden;
- welke `translation_key` de berichtensensor heeft (voor de editor);
- welke knop op hetzelfde apparaat ze wist.

Een proef eist dat beide kanten gelijk zijn. Ford staat er als eerste in. Een volgend merk is een lezer en een regel, met
een echte dump. Een sensor van een merk dat er niet in staat:

- op de kaart: alleen het getal, en een tik opent de kaart van Home Assistant;
- in de meldingen: niets.

Het veld `brand` uit het autoprofiel van de coach is niet gebruikt: dat heeft nog niet in een dump van deze kant gestaan,
en het platform zegt het al.

### De autokaart

Er zijn twee velden bij: **Berichten van de auto** (`messages`) en **Knop om de berichten te wissen** (`messages_clear`).

- **De editor** biedt alleen de berichtensensoren van bekende merken aan. Het knopveld verschijnt pas als er een sensor
  gekozen is; leeg laten is de knop die de kaart zelf vindt.
- **Op de kaart** staat een tegel Berichten met het aantal. Zolang het meer dan 0 is, is het getal oranje: het zijn
  waarschuwingen.
- **Een tik** opent `auto-berichten-scherm.js`. Dat scherm:
  - toont per bericht het onderwerp, de dag en tijd op de klok van Home Assistant, en de tekst;
  - heeft onderaan **Alles wissen**, als er een knop is;
  - vraagt eerst "Alle berichten wissen? Ze worden bij Ford gewist. Dat is niet terug te draaien." en drukt pas daarna op de
    knop. Komt de lege lijst binnen, dan tekent het scherm die vanzelf.
- **Bedienen:** de kaart bedient verder niets, zoals de eigenaar in augustus vroeg. Wissen is de ene uitzondering. Die vroeg
  hij nu zelf, en ze zit in het scherm, niet op de kaart.

### De meldingenkaart: Autoberichten

Er is een vijfde soort bij, naast Afval, Robotstofzuiger, Camera en Garagedeur:

- `auto: true`;
- `auto_berichten`: de berichtensensoren;
- `auto_pad`: waar een tik op de melding heen gaat.

De soort heet **Autoberichten** en niet "Auto": "Auto" is al de klimaatstand "Auto", en in het Engels moet dit "Car messages"
zijn. In de pop-up staat "Bij elk nieuw bericht van Bus", met de naam van het APPARAAT, net als in de melding.

| wat | hoe |
|---|---|
| een nieuw bericht | een melding met de naam van de auto en het onderwerp als titel, en de tekst. Elk bericht heeft een eigen tag |
| vier of meer tegelijk | één melding: "8 nieuwe berichten. Het laatste: ..." |
| wat er al stond toen een sensor voor het eerst gelezen werd | geen melding. Anders krijgt het hele huis bij het aanzetten acht keer de bandenspanning |
| een bericht dat weggaat (gewist bij Ford, op de kaart of in de app) | gaat ook van de telefoons (`clear_notification` met zijn tag) |
| `unavailable` of `unknown` | verandert niets |
| een herstart | wat al gemeld is staat per sensor in de opslag (`auto`, hoogstens 200). Een bericht dat tijdens de herstart binnenkwam, komt bij de eerste lezing erna, één keer |
| ieder | zet hem in zijn pop-up aan of uit. Een proef stuurt het nieuwste bericht, of een voorbeeld |

Voorgesteld door de beheersessie, maar NIET gebouwd: laden klaar of gestopt, en accu laag. Die heeft de eigenaar
niet gevraagd; dat ligt bij hem.

## Proeven

**NIEUW GEDRAG.** Beide bestanden vallen op main om, omdat de modules daar niet bestaan:

- `tests/js/auto-berichten.test.mjs` (13 proeven): `ERR_MODULE_NOT_FOUND ... src/cards/auto-berichten.js`;
- `tests/meldingen/test_auto.py` (13 proeven): `ImportError: cannot import name 'auto' from
  'custom_components.domotiapp_lovelace.meldingen'`.

Uitvoer tegen de code van main, met `git archive main` in de kladmap:

```
# Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../oud-main/src/cards/auto-berichten.js'
# tests 1
# pass 0
E   ImportError: cannot import name 'auto' from 'custom_components.domotiapp_lovelace.meldingen'
```

Wat ze toetsen:

**De twee vormen uit de dump.** Live geeft 6, uit de recorder 8, met dezelfde sleutels. Na het wissen `[]`, bij een
herstart `null`. Een aantal zonder één leesbaar bericht geeft `null`.

**Per merk:**

- een onbekend platform geeft geen lijst en geen knop, wel het getal;
- de wisknop moet van hetzelfde apparaat zijn: een knop met dezelfde `translation_key` op een ander apparaat telt niet;
- `MERKEN` is aan beide kanten gelijk.

**De melding:**

- wat er al stond, gaat niet uit;
- een nieuw bericht gaat naar beide telefoons, met tag, groep en pad;
- dezelfde berichten met `json_src` erbij geven niets;
- onbereikbaar en terug geeft niets;
- wissen haalt alles van beide telefoons;
- acht tegelijk wordt één melding;
- iemand die het in de pop-up uitzette, krijgt niets;
- de proef werkt.

**Een herstart:**

- de opslag kent er 8 en bij de start staan er 9: één melding, en na een nieuwe lezing niets dubbel;
- een sensor die bij de start onbereikbaar is, meldt pas als hij terugkomt;
- de opslag staat binnen enkele seconden op schijf.

Alles samen: 2592 JS-proeven en 1229 Python-proeven groen, plus `verify`, `check:registratie`, `check:controls`, `check:css`
en `check:taal`.

## In de browser gemeten

In de testinstance staat een nagebootste FordPass (`.ha-dev-config/custom_components/fordpass/`, niet in git). Die heeft:

- het domein `fordpass`, versie 9.0.0 vanwege valkuil 72;
- een apparaat "Bus";
- de sensor en de knop met de entity_id's en `translation_key`'s uit de dump;
- de berichten uit de dump.

De knop wist na drie tellen. `fordpass.nep_bericht` zet een nieuw bericht bovenaan en `fordpass.nep_terug` zet de dump
terug. Op `kaart-test` staat een view `auto` met de autokaart en een meldingenkaart.

De meting liep in Playwright op 390 breed, `isMobile` en `hasTouch`, met echte tikken, in donker en in licht. Bundel geladen
`2f9a706208ed`, gelijk aan schijf. Zo ging het:

- **Kaart:** de tegel zegt "6 Berichten". Een tik geeft `click:true`.
- **Scherm:**
  - het vak is 358 breed, met 16 px aan elke kant;
  - `scrollWidth` is gelijk aan `clientWidth`: 356/356 voor de lijst en 390/390 voor de pagina;
  - er staan 6 berichten. Het eerste is "10 nov, 07:50", dus 06:50 UTC op de klok van Amsterdam;
  - de onderwerpen zijn 14 px, Alles wissen is 40 px hoog en Sluiten 36 px;
  - de pagina eronder staat vast (`position: fixed`).
- **Wissen:**
  - een tik op Alles wissen opent de vraag: "Alle berichten wissen?" / "Ze worden bij Ford gewist. Dat is niet terug te
    draaien.", met 25 px aan elke kant;
  - een tik op Wissen geeft `click:true` op `.ja`;
  - na 5 s staat er "Geen berichten" en "Er staan geen berichten van de auto.", de knop is uitgeschakeld en de tegel zegt 0;
  - Sluiten maakt de pagina weer los.
- **Melding:**
  - de berichten uit de dump terugzetten gaf geen melding: het zijn dezelfde;
  - een nieuw bericht wel: "Bus: Olie verversen" / "Het is tijd voor een onderhoudsbeurt.\nMaak een afspraak bij de
    dealer.", met de html eruit;
  - de tegel ging naar 7.
- **Pop-up** van de persoon: "Autoberichten · Bij elk nieuw bericht van Bus".
- **Fouten in de console:** geen.

De eerste meting vond twee dingen, die in dezelfde ronde gerepareerd zijn:

- in de pop-up stond "van Berichten": de naam van de entiteit ging voor die van het apparaat;
- de wisknop was 33 px hoog, nu 40.

## Samenvatting

De autokaart toont de berichten van de fabrikant, met Alles wissen achter een bevestiging. De meldingenkaart heeft
Autoberichten: een melding bij elk nieuw bericht, en een bericht dat weggaat verdwijnt ook van de telefoon. Een herstart
stuurt niets dubbel en mist niets. Het merk komt uit het register, met één regel per merk. Ford is de eerste; een volgend
merk heeft een echte dump nodig.

## Wat niet lukte

- **Niet bij de eigenaar zelf gezien.** Zijn berichten zijn gewist, dus een melding komt pas bij het volgende echte bericht
  van de bus. De beheersessie zet de kaarten bij hem.
- **De tijdzone van `createdDate`** is niet nagemeten. Hier staat UTC, op het woord van de beheersessie. Is het lokale tijd,
  dan staat de tijd in het scherm een uur te laat. Op de meldingen heeft dat geen invloed.
- **De dump heeft alleen bandenspanning.** Een ander soort bericht (onderhoud, een storing) heeft er nooit in gestaan.

## Aannames

- `createdDate` is UTC.
- Een bericht is uniek door zijn datum en onderwerp. Twee berichten met hetzelfde onderwerp in dezelfde seconde tellen als
  één.
- Wissen bij Ford is ook wissen in de FordPass-app. Het scherm zegt alleen "bij Ford gewist".

## `git status --porcelain`

(vlak voor het vastleggen)

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/engels/meldingen.json
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M custom_components/domotiapp_lovelace/meldingen/const.py
 M custom_components/domotiapp_lovelace/meldingen/kaarten.py
 M custom_components/domotiapp_lovelace/meldingen/motor.py
 M custom_components/domotiapp_lovelace/meldingen/store.py
 M src/cards/auto-card.js
 M src/cards/meldingen-card.js
 M src/cards/meldingen-logica.js
 M src/i18n/en/apparatuur.js
 M src/i18n/en/meldingen.js
?? custom_components/domotiapp_lovelace/meldingen/auto.py
?? docs/auto-berichten/
?? src/cards/auto-berichten-scherm.js
?? src/cards/auto-berichten.js
?? tests/js/auto-berichten.test.mjs
?? tests/js/vaste-invoer/fordpass-berichten.json
?? tests/meldingen/test_auto.py
```
