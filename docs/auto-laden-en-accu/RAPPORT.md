# Klaar met laden en accu laag bij de Autoberichten — 0.142.0

## Waarom

Bij 0.141.0 vroeg ik de eigenaar of hij behalve de berichten van de auto ook meldingen wilde over het laden en de accu. Zijn
antwoord, via de beheersessie: *"ja ook laden klaar en accu laag erbij"*.

## De echte dump

De beheersessie las drie dagen geschiedenis van de bus bij de eigenaar (24 tot 27 november), alleen lezend. Het ging om
drie sensoren van FordPass: de laadstatus (`elvehcharging`), de stekker (`elvehplug`) en de laadtoestand (`soc`).

Die dump staat zonder VIN in `tests/js/vaste-invoer/fordpass-laden.json`, met de toestand, de registerregels en een tijdlijn
van 88 veranderingen. Wat erin stond:

| wat | gevolg |
|---|---|
| de laadstatus kent `NOT_PLUGGED_IN`, `IN_PROGRESS` en `PAUSED`; een woord voor vol kwam niet voor | IN_PROGRESS is laden, PAUSED is aan de lader. De autokaart kende ze geen van tweeën en toonde "In progress" en "Paused"; dat is in dezelfde ronde goed gezet (`auto-logica.js`) |
| 25-11: laden tot 80 % (het doel van de coach), om 13:19:11 `PAUSED`, de stekker bleef erin tot 18:31 | het einde van een beurt is PAUSED met de stekker erin |
| 27-11 16:01:36: `PAUSED` midden in een beurt, om 16:07:12 weer `IN_PROGRESS` (de coach die stopt en start) | **klaar met laden** pas na 15 minuten zonder laden met de stekker erin (`LADEN_WACHT`) |
| `PAUSED` ook bij het inpluggen, vóór het laden begint | geen melding: hij laadde nog niet |
| 25-11 12:13:02: de laadtoestand sprong van 35 naar 23, 34 s voordat de stekker `CONNECTED` zei | **accu laag** pas na 5 minuten onder de grens zonder stekker (`ACCU_WACHT`) |
| elke ochtend om 07:00 en bij herladen een paar tellen `unavailable` | verandert niets |
| de laadstatus krijgt elke paar minuten nieuwe attributen | er wordt alleen iets gezet of gewist als het echt verandert |

## Wat er gebouwd is

**De sensoren:** de laadstatus, de stekker en de accu zoekt de server zelf op het apparaat van de berichtensensor. Dat gaat
op platform en `translation_key`, met drie nieuwe velden per merk in `MERKEN` (`laden`, `stekker`, `accu`). Op de kaart
komt er dus niets bij om in te vullen.

**Klaar met laden:**
- de melding komt als hij 15 minuten niet laadt terwijl de stekker erin zit;
- titel "Bus: klaar met laden", tekst "De accu staat op 80% en laadt niet meer. De stekker zit er nog in.";
- haalt iemand de stekker eruit, dan gaat de melding van de telefoon. Komt hij in die 15 minuten weer, dan wordt er niets
  gemeld.

**Accu laag:**
- de melding komt als de accu 5 minuten onder de grens is zonder stekker. De grens is standaard 20 %, en
  `auto_accu_grens` op de meldingenkaart;
- titel "Bus: accu laag", tekst "De accu staat op 18%.";
- er komt één melding per daling. Een nieuwe komt pas als hij eerst 5 % boven de grens is geweest;
- gaat hij laden, dan gaat de melding van de telefoon.

**De klok:** een verandering zet alleen de stand in de opslag (`auto_laden`). De klok van elke minuut kijkt of de wachttijd
om is. Een herstart midden in het wachten gaat dus gewoon verder. Bij de start wordt gekeken wat er nu staat: is de stekker
eruit, dan vervalt het.

**Keuzes:**
- in de pop-up kiest iedereen zelf waarover: Berichten van de fabrikant, Klaar met laden, Accu laag. Dat gaat net als bij
  de robotstofzuiger, met de bestaande keuze `gebeurtenissen`;
- in de editor kiest de beheerder wat er te kiezen is (`auto_meldingen`) en de grens;
- de regel in de pop-up zegt het: "Berichten, klaar met laden en accu laag (onder 20%) · Bus".

**Niet gebruikt:** `session.ended` en `target_percent` van de coach. Daar is van deze kant nog geen dump van, en de sensoren
van de auto zelf zijn er bij elke klant, ook zonder coach.

## Proeven

`tests/meldingen/test_auto_laden.py` heeft elf proeven. Tien vallen om op 0.141.0 en één is een REGRESSIEWACHT. Hieronder
de uitvoer van de eerste tien; de elfde, `test_de_sensoren_van_de_auto_komen_na_ons`, kwam erbij na de proef in de
testinstance:

```
FAILED tests/meldingen/test_auto_laden.py::test_de_woorden_uit_de_dump - Attr...
FAILED tests/meldingen/test_auto_laden.py::test_de_teksten - AttributeError: ...
FAILED tests/meldingen/test_auto_laden.py::test_grens_en_keuzes_op_de_kaart
FAILED tests/meldingen/test_auto_laden.py::test_drie_dagen_uit_de_dump - Asse...
FAILED tests/meldingen/test_auto_laden.py::test_het_moment_van_klaar_en_van_laag
FAILED tests/meldingen/test_auto_laden.py::test_een_hogere_grens_en_de_sprong_bij_het_inpluggen
FAILED tests/meldingen/test_auto_laden.py::test_wie_alleen_berichten_wil - As...
FAILED tests/meldingen/test_auto_laden.py::test_gestopt_voor_een_herstart - A...
FAILED tests/meldingen/test_auto_laden.py::test_stekker_eruit_tijdens_een_herstart
9 failed, 1 passed in 3.20s
```

Wat ze toetsen:

- **Drie dagen uit de dump.** Die worden minuut voor minuut afgespeeld. Er komen precies twee meldingen: "25-11 13:35 klaar
  met laden" (80 %) en "27-11 15:16 accu laag" (18 %). De stekker eruit om 18:31 wist de eerste, het laden op 27-11 de
  tweede. De PAUSED tussendoor, de PAUSED bij het inpluggen en 07:00 `unavailable` geven niets.
- **Het moment.** Om 13:34 nog niets, om 13:35 wel. Om 15:15 nog niets, om 15:16 wel.
- **Een grens van 25 %.** Op 25-11 sprong de accu naar 23 vlak voor het inpluggen: geen melding. Op 27-11 om 13:25:55 naar
  20: één melding, ook al zakt hij daarna naar 18, 15 en 13.
- **Keuzes.** Wie alleen berichten wil, krijgt niets over laden. Een kaart zonder laden geeft niemand iets.
- **Herstart.** Gestopt om 13:19:11 en herstart om 13:25 geeft een melding om 13:35, één keer. Is de stekker eruit
  getrokken tijdens de herstart, dan komt er niets. REGRESSIEWACHT: accu laag gemeld, herstart, en verder gezakt geeft geen
  tweede melding.

`tests/js/auto-berichten.test.mjs` heeft drie proeven erbij:

- de autokaart kent IN_PROGRESS en PAUSED (alle woorden uit de tijdlijn);
- `MERKEN` noemt de `translation_key`'s uit het register, en is aan beide kanten gelijk;
- aanbod, keuze per persoon, grens en de regel in de pop-up.

Op 0.141.0 valt het bestand om met `SyntaxError: The requested module '../../src/cards/meldingen-logica.js' does not provide
an export named 'autoAccuGrens'`.

Alles samen: 2597 JS-proeven en 1240 Python-proeven groen, plus `verify`, `check:registratie`, `check:controls`, `check:css`
en `check:taal`.

## In de testinstance

De nagebootste FordPass (`.ha-dev-config/custom_components/fordpass/`, niet in git) heeft nu ook de laadstatus, de stekker
en de laadtoestand, met de entity_id's en `translation_key`'s uit de dump. `fordpass.nep_laden {laden, stekker, soc}` zet
ze.

**In het echt, met de echte wachttijden** (`laden200.py` in de kladmap):

Eerst ging de testinstance opnieuw aan, zodat hij net als bij een klant herstart was. De meldingen kwamen binnen via
`notify.persistent_notification`. Lokale tijd:

```
17:04:13 zet {'laden': 'NOT_PLUGGED_IN', 'stekker': 'DISCONNECTED', 'soc': 45}
17:05:23 zet {'soc': 18}
na 2,5 min:
na 6,5 min:
17:11:53 MELDING 16:11:00 | Bus: accu laag | De accu staat op 18%.
17:11:53 zet {'laden': 'PAUSED', 'stekker': 'CONNECTED', 'soc': 15}
17:12:33 zet {'laden': 'IN_PROGRESS'}
17:13:13 zet {'laden': 'PAUSED'}
17:16:13 zet {'laden': 'IN_PROGRESS', 'soc': 60}
17:17:24 zet {'laden': 'PAUSED', 'soc': 80}
na 10 min gepauzeerd:
na 16 min gepauzeerd:
17:33:24 MELDING 16:33:00 | Bus: klaar met laden | De accu staat op 80% en laadt niet meer. De stekker zit er nog in.
```

Bij de melding staat de tijd in UTC. Wat het laat zien:

- **Accu laag** komt na de wachttijd, op de eerste tik erna.
- **De pauze van 3 minuten tussendoor** geeft niets.
- **Klaar met laden** komt 15 minuten na het laatste PAUSED.

**Wat deze proef eerst vond.** Bij de eerste poging kwam er geen melding "accu laag". Na de herstart laadde de nagebootste
FordPass zijn laadstatus, stekker en accu NA onze integratie, en `auto_delen` vond ze toen niet. Pas bij het herladen van de
entry kwamen ze erbij. Bij een klant kan dat na elke herstart zo gaan. Daarom zoekt de klok ze nu elke minuut opnieuw;
alleen als er iets veranderde, wordt er opnieuw geabonneerd. Dat dekt de proef `test_de_sensoren_van_de_auto_komen_na_ons`.
Zonder die regel valt hij om:

```
E       AssertionError: assert [] == ['27-11 15:16 Bus: accu laag']
1 failed, 10 deselected
```

**De extra tegels op de autokaart** (gemeld door de beheersessie, met de bus van de eigenaar). Op 390 breed, bundel
`2f1387615da3`, staat nu:

| waarde | naam |
|---|---|
| 6 | Berichten |
| 58 °C | Water Heater Current temperature |
| Disconnected | Bus EV stekker |
| vandaag 16:53 | Laatst vernieuwd |

Daarvoor stond bij elke extra tegel het entity_id als naam: `nameOf(hass, id, id)`, en het derde argument is de ingevulde
naam. Een tijdstip stond er als ISO-tekst, en de stekker als "CONNECTED". `tegelWaarde` in `auto-logica.js` maakt er nu dit
van:

- een tijd op de klok van Home Assistant;
- de vertaling van Home Assistant;
- zonder vertaling een woord in hoofdletters leesbaar.

`tests/js/auto-tegels.test.mjs` valt op 0.141.0 om:
`does not provide an export named 'tegelWaarde'`.

**De pop-up** van een persoon op 390 breed, met `isMobile` en `hasTouch` en echte tikken, in donker. Bundel geladen
`2deb40a231cc`, gelijk aan schijf.

- Autoberichten zegt: "Berichten, klaar met laden en accu laag (onder 20%) · Bus".
- Het pijltje (`click:true`) klapt "Waarover" open: drie keuzes van 34 px hoog. `scrollWidth` is 390/390.
- Een tik op Klaar met laden (`click:true`) zet hem uit. De regel wordt "Berichten en accu laag (onder 20%) · Bus", en de
  server heeft `{"person.dev":{"gebeurtenissen":["berichten","accu"]}}`.
- Een tweede tik zet hem weer aan.
- Er waren geen fouten in de console.

## Samenvatting

Bij de Autoberichten komen nu ook "klaar met laden" en "accu laag". De wachttijden komen uit wat de echte bus deed:
- 15 minuten na het stoppen met laden, met de stekker erin. Een korte pauze van de coach meldt niets;
- 5 minuten onder de grens zonder stekker. Een sprong vlak voor het inpluggen meldt niets.

Een herstart gaat verder waar hij was, ook als de auto-integratie na deze laadt. Ieder kiest in de pop-up zelf waarover.

Op de autokaart:
- IN_PROGRESS en PAUSED staan er nu als "Aan het laden" en "Aan de lader";
- de extra tegels tonen de naam in plaats van het entity_id;
- een tijd staat er als "vandaag 16:50".

## Wat niet lukte

- **Niet bij de eigenaar zelf gezien.** 0.141.0 staat daar nog niet. Zodra de uitrol hem erop zet, zet de beheersessie het
  aan.
- **Een woord voor "vol"** (COMPLETE en zo) kwam in de dump niet voor. Laadt een auto tot 100 % zonder coach, dan is het
  einde onbekend; het staat in de lijst voor als het komt.
- **Blokladen.** Pauzeert de coach langer dan 15 minuten midden in een beurt (bij een prijsgat), dan komt er "klaar met
  laden" op een tussenstand. Laadt hij daarna verder, dan verdwijnt die melding van de telefoon en komt er aan het eind een
  nieuwe. In de dump van drie dagen kwam dat niet voor.

## Aannames

- 15 minuten is lang genoeg voor een pauze van de coach. Gemeten is 5,5 minuut.
- Een auto zonder stekkersensor (een ander merk) leest de stekker uit de laadstatus. Een merk zonder beide meldt "accu laag"
  ook aan de lader.

## `git status --porcelain`

(vlak voor het vastleggen)

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/engels/meldingen.json
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M custom_components/domotiapp_lovelace/meldingen/auto.py
 M custom_components/domotiapp_lovelace/meldingen/kaarten.py
 M custom_components/domotiapp_lovelace/meldingen/motor.py
 M custom_components/domotiapp_lovelace/meldingen/store.py
 M src/cards/auto-berichten.js
 M src/cards/auto-card.js
 M src/cards/auto-logica.js
 M src/cards/meldingen-card.js
 M src/cards/meldingen-logica.js
 M src/i18n/en/meldingen.js
 M tests/js/auto-berichten.test.mjs
?? docs/auto-laden-en-accu/
?? tests/js/auto-tegels.test.mjs
?? tests/js/vaste-invoer/fordpass-laden.json
?? tests/meldingen/test_auto_laden.py
```
