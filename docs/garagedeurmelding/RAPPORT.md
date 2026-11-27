# De garagedeur in de meldingenkaart — 0.139.0

## Waarom

Een wens van een klant, via de beheersessie, met het ja van de eigenaar. Het geldt voor alle klanten, en alles moet in de
kaart in te stellen zijn: "Ja alles via lovelace in te kunnen stellen ook de klant". Er hangt een magneetcontact op de
deur (aan = open) en een relais dat de deur met een puls laat bewegen. De beheersessie stuurde het gedrag in twee berichten
op 27 november 2026; het tweede verving "Leave open" door negeertijden.

## Wat er veranderd is

Een vierde soort in de meldingenkaart, naast afval, de robotstofzuiger en de camera. Het versturen doet de integratie.

| wat | hoe |
|---|---|
| eerste melding | na `garage_minuten` open (standaard 5) |
| herinnering | daarna elke `garage_herhaal` minuten (standaard 60; 0 is geen) zolang hij open staat |
| knoppen in de melding | Deur sluiten (alleen met een bediening), en een knop per negeertijd (`garage_negeer`, standaard 15 min, 1 uur, 4 uur). Android krijgt er hoogstens drie |
| Deur sluiten | zonder Face ID. Alleen een puls als het contact op dat moment open zegt: op een dichte deur zet dezelfde puls hem juist open. Na 90 seconden kijkt de motor na, en staat hij nog open, dan komt "De garagedeur is niet dichtgegaan" |
| negeren | voor het hele huis: de melding verdwijnt bij iedereen, de pop-up zegt door wie en tot hoe laat. Is de tijd om en staat hij nog open, dan komt er een nieuwe melding |
| de avond | om `garage_avond` (standaard 22:00) staat hij open: hoe dan ook een melding, ook tijdens negeren, met de knop Tot morgen (`garage_morgen`, standaard 07:00). Uit te zetten. Alleen als hij om die tijd al open stond |
| dicht | op welke manier ook (er zijn ook gewone afstandsbedieningen): alles weg van de telefoons, en een negeertijd vervalt. De volgende keer open begint weer vooraan |
| een tik op de melding | opent `garage_pad` (`url` voor iOS, `clickAction` voor Android). Alleen een pad binnen Home Assistant |
| de pop-up van een persoon | het vinkje (aan of uit voor die persoon), de regel ("Open sinds 14:05", "Open · genegeerd tot 16:30 door Anna", "Dicht · melding na 5 min open"), en zolang hij open staat de knoppen om te negeren, of Weer melden |
| de editor | Garagedeur aan of uit, met daaronder: contact, bediening, naam in de melding, de minuten, de negeertijden, de avondmelding met tijd, tot morgen, en het pad |
| een herstart | alles wat de klok nodig heeft staat in de opslag (`garage` in `domotiapp_lovelace.meldingen`): sinds wanneer hij open staat, de laatste melding, negeren, en een Sluiten die nog nagekeken wordt. Staat hij bij het opstarten open zonder dat de opslag weet sinds wanneer, dan telt het vanaf de start. Is hij tijdens de herstart dichtgegaan, dan gaan de meldingen van de telefoons |

De beslisregel staat los in `meldingen/garage.py` (`volgende`), de rest in `motor.py`. Geen camerabeeld: de eigenaar
"camera gaan we niet doen".

Voorbeeld:

```yaml
type: custom:domotiapp-meldingen-card
personen: [person.bram, person.anna]
garage: true
garage_contact: binary_sensor.garagedeur
garage_bediening: switch.garage_puls
garage_pad: /dashboard-home/0#garage
```

## Proeven

`tests/meldingen/test_garage.py`, 17 proeven, **NIEUW GEDRAG**:

- de standaard, en wat er van een kaart gelezen wordt (een pad van buiten en een verkeerde bediening vallen weg);
- het verloop van een open deur: 4 minuten niets, 5 minuten de eerste, een uur later de herinnering, negeren en daarna;
- 22:00 tijdens negeren, één keer per avond, niet voor wie om 23:00 opendoet, uit te zetten, en tot morgen;
- de knoppen en de teksten, ook in het Engels, en drie op Android;
- de motor met een vastgezette klok: de melding met tag, knoppen en pad; dicht wist bij iedereen; `unavailable` wist
  niets; Deur sluiten stuurt een puls bij open en niet bij dicht; niet dicht na 90 s; negeren voor iedereen; de avond en
  tot morgen de hele nacht; een herstart met `open_sinds` in de opslag; open bij de start; dicht tijdens de herstart; een
  telefoon met Android (echte `mobile_app`-entry met `os_name`); negeren via de websocket; een proef naar één persoon
  waarvan de knoppen niets doen.

`tests/js/meldingen-garage.test.mjs`, 3 proeven, **NIEUW GEDRAG**: de soort op de kaart, de regel en de knoppen in de
pop-up.

Op de code van main (`git archive`, met de nieuwe proeven erin):

```
tests/js/meldingen-garage.test.mjs:
  SyntaxError: The requested module '../../src/cards/meldingen-logica.js' does not provide an export named 'garageKnoppen'
  # pass 0  # fail 1
tests/meldingen/test_garage.py:
  ImportError: cannot import name 'garage' from 'custom_components.domotiapp_lovelace.meldingen'
```

Alles: 2571 JS-proeven en 1209 Python-proeven groen, plus `verify`, `check:registratie`, `check:controls`, `check:css` en
`check:taal`.

## Gemeten in de testinstance

Een view `garage` op `kaart-test` met de meldingenkaart, met als contact `input_boolean.vaatwasser_klep` (die overleeft
een herstart), als bediening de demo-schakelaar `switch.decorative_lights`, `garage_minuten: 1` en `garage_herhaal: 3`. De
telefoon van de persoon is `notify.persistent_notification`, zodat elke melding als melding in Home Assistant binnenkomt.
De pop-up als telefoon met Playwright: 390 × 844, `isMobile`, `hasTouch`, tikken, en de telefoon op New Yorkse tijd.

| | Uitkomst |
|---|---|
| bundel geladen = schijf | `1afd4c0bef9e` = `1afd4c0bef9e` |
| deur open | 10:29:51, `open_sinds` in de opslag |
| eerste melding | 10:31:00, "De garagedeur staat al 1 minuut open." |
| pop-up | "Open sinds 10:29" (de klok van Home Assistant, niet die van de telefoon); knoppen Negeer 15 min, Negeer 1 uur, Negeer 4 uur, 34 px hoog, binnen het vak |
| tik Negeer 15 min | `isTrusted`; "Open · genegeerd tot 10:47 door dev", knop Weer melden |
| tik Weer melden | terug naar "Open sinds 10:29" met de drie knoppen |
| Deur sluiten (de knop in de melding, als `mobile_app_notification_action`) | om 10:32:54 de schakelaar van on naar off, `sluit` in de opslag |
| herinnering | 10:34:00, drie minuten na de vorige |
| niet dicht | 10:34:24, precies 90 s na Sluiten: "De garagedeur is niet dichtgegaan. Hij staat nog open." |
| herstart van Home Assistant met de deur open | 10:34:36; daarna `open_sinds` nog 10:29:51, en de volgende herinnering om 10:38:00 ("8 minuten open") |
| deur dicht | 10:40:09: `open_sinds` en `gemeld` weg, pop-up "Dicht · melding na 1 min open", geen knoppen |
| breedte | pop-up 356 / 356, pagina 390 / 390 |
| fouten op de pagina | geen |

De editor, met de hand in de pagina gehangen (zie het rapport van 0.138.0): met Garagedeur aan staan alle tien de velden
eronder, de negeertijden als "Negeer 15 min" tot "Negeer 8 uur". In het veld voor het pad "/dashboard-home/0#garage deur"
getypt: de spatie `isTrusted: true`, en de echo terug door `setConfig` hield het pad. De standaarden staan in de config
zodra Garagedeur aan gaat.

## Samenvatting

De meldingenkaart heeft een garagedeur: een melding als hij openstaat, herinneringen, Deur sluiten (alleen als hij open is,
en nagekeken), negeren voor het hele huis, om 22:00 hoe dan ook met Tot morgen, en alles weg zodra hij dicht is. Het
overleeft een herstart, en de klant stelt alles zelf in de kaart in. Negeren kan ook in de pop-up, zonder op een melding te
wachten.

## Wat niet lukte

- Niet op een echte telefoon: de knoppen in de melding zijn nagespeeld met `mobile_app_notification_action`, en de
  melding kwam als melding in Home Assistant, zonder knoppen. Hoe iOS en Android de knoppen en het pad tonen, ziet de
  beheersessie straks met een proefmelding.
- Niet met een echte deur en puls: de demo-schakelaar bewoog geen deur, en "dicht" is met de hand gezet.

## Aannames

- Een schakelaar als bediening krijgt `switch.toggle`, zoals de knop op het dashboard van de klant het al deed (een Sonoff
  die zichzelf uitzet). Een knop krijgt `press`, een script `turn_on`, een cover `close_cover`.
- Eén garagedeur per huis (het id is `garage`), net als de robotstofzuiger en de camera één melding per huis zijn.
- Na "niet dichtgegaan" komt de volgende herinnering `garage_herhaal` minuten later, net als na elke andere melding.
- Een avondmelding die door een herstart om 22:00 gemist wordt, wordt tot middernacht ingehaald, daarna niet meer (de
  herinneringen gaan door).

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
 M custom_components/domotiapp_lovelace/meldingen/websocket.py
 M src/cards/meldingen-card.js
 M src/cards/meldingen-logica.js
 M src/cards/meldingen-scherm.js
 M src/i18n/en/meldingen.js
?? custom_components/domotiapp_lovelace/meldingen/garage.py
?? docs/garagedeurmelding/
?? tests/js/meldingen-garage.test.mjs
?? tests/meldingen/test_garage.py
```
