# 0.55.0 — De laatst aangepaste kaart bepaalt de tijd, en een proefknop

## De melding

6 oktober 2026, kort na 0.54.1:

> *"ik heb de tijd even op 22:00 gezet maar ik krijg geen melding op me
> teelefoon"*

## Wat er in zijn Home Assistant stond

Alleen gelezen, om 22:13 (`lovelace/config`, `meldingen/subscribe`,
`system_log/list`). Geen dienst aangeroepen, niets weggeschreven.

| | |
|---|---|
| meldingenkaart op `lovelace` (Overview) | `tijd_morgen: "22:00:00"`, door hem aangepast |
| dezelfde kaart op `dashboard-test` (de wandtablet, een kopie) | `tijd_morgen: "19:30:00"` |
| beide kaarten | geen `id`, dus allebei melding `afval` |
| stand van de melding | `verstuurd.morgen = "2026-10-06"` |
| systeemlog | *"Twee meldingenkaarten met id 'afval' hebben andere instellingen (dashboard-test en lovelace); die van dashboard-test gaan voor"* |

## Twee oorzaken tegelijk

1. **De melding van die avond was al verstuurd**, om 19:30 (zie
   `docs/twee-bakken-op-een-dag/`). De motor stuurt één avondmelding per dag:
   `verstuurd` is er zodat een herstart om 19:30:10 geen tweede oplevert. Een
   latere tijd gaf die avond dus niets meer, wat hij ook instelde.
2. **Zijn 22:00 werd genegeerd.** Staat dezelfde kaart op twee dashboards met
   andere instellingen, dan kwamen die van de eerste kaart die gevonden werd.
   Dat is de volgorde waarin Home Assistant zijn dashboards bewaart, en bij hem
   kwam `dashboard-test` eerst. Morgen was de melding dus óók om 19:30 gekomen,
   niet om 22:00, en dat was nergens te zien. De pop-up van zijn kaart zei
   "melding om 22:00".

## Wat er veranderd is

**Serverkant (`meldingen/`):**

- **De laatst aangepaste kaart gaat voor.** De motor onthoudt per dashboard en
  per melding de instellingen van de vorige keer lezen. Zijn ze veranderd, dan
  wordt dat dashboard *leidend* voor die melding, bewaard in de opslag
  (`leidend`), zodat het een herstart overleeft. Zonder zo'n herinnering gaat
  het standaarddashboard voor.
- **Het standaarddashboard heeft twee namen.** Sinds HA 2026.8 kan Overview
  een gewoon opgeslagen dashboard zijn met `url_path` `lovelace`, en dan geeft
  Home Assistant zelf dát voorrang boven het oude zonder naam
  (`lovelace/websocket.py`: *"When url_path is None, prefer 'lovelace'
  dashboard if it exists"*). Bij hem is dat zo: zijn log noemde het
  hoofddashboard "lovelace". De terugval is daarom eerst `lovelace`, dan het
  oude standaarddashboard. Dat is bij het schrijven van dit rapport gevonden;
  de eerste versie keek alleen naar het oude, en had bij hem dus niets gedaan.
- **Een NIEUWE kaart gaat niet voor.** Wie een dashboard kopieert voor een
  wandtablet krijgt een kaart met de instellingen van toen, en die hoort niet
  ineens te winnen.
- **De stand bevat nu `tijden`**: de tijden die de server echt gebruikt.
- **De proef kan naar één persoon** (`persoon` op `meldingen/proef`), ook als
  zijn vinkje uit staat. Een proef krijgt een eigen tag (`domotiapp-afval-proef`),
  zodat hij de echte melding op de telefoon niet vervangt, en een tik op
  "Staat buiten" in een proef doet niets (anders zou de echte ochtendmelding
  vervallen).
- **Ongewijzigd, met opzet:** één avondmelding per dag. Wie om 21:00 de tijd
  naar 22:00 zet, wil morgen om 22:00 een melding, niet vanavond een tweede aan
  het hele huis. Staat nu als REGRESSIEWACHT in de toetsen en in de kop van
  `motor.py`.

**Kaart:**

- De regel in de pop-up toont de tijd van de **server**, niet die van de kaart.
  De kaart met de verliezende tijd zei eerst iets wat niet gebeurde.
- Is de avondmelding al uit, dan staat er **"melding verstuurd"** in plaats van
  "melding om 22:00".
- **Stuur een proefmelding**: een knop onder in de pop-up van een persoon,
  alleen voor beheerders, en pas als de server de kaart kent. Eronder komt te
  staan wat er gebeurde.

## Bewijs

### De nieuwe toetsen falen op de oude code

De nieuwe toetsbestanden in een worktree van `main` (7220148, 0.54.1), daar
gedraaid. Python:

```
FAILED tests/meldingen/test_kaarten.py::test_het_leidende_dashboard_gaat_voor
FAILED tests/meldingen/test_kaarten.py::test_zonder_herinnering_gaat_het_standaarddashboard_voor
FAILED tests/meldingen/test_kaarten.py::test_een_leidend_dashboard_zonder_de_kaart_telt_niet
FAILED tests/meldingen/test_motor.py::test_de_laatst_aangepaste_kaart_gaat_voor
FAILED tests/meldingen/test_motor.py::test_een_gekopieerde_kaart_gaat_niet_voor
FAILED tests/meldingen/test_motor.py::test_een_proef_naar_een_persoon - TypeE...
FAILED tests/meldingen/test_motor.py::test_staat_buiten_in_een_proef_doet_niets
FAILED tests/meldingen/test_websocket.py::test_een_kaart_krijgt_de_stand_en_elke_wijziging
FAILED tests/meldingen/test_websocket.py::test_een_proef_naar_een_persoon - K...
9 failed, 57 passed in 9.24s
```

Zijn situatie, letterlijk (kopie eerst gevonden, hoofddashboard op 22:00):

```
>       assert samen["afval"].tijden["morgen"] == "22:00"
E       AssertionError: assert '19:30' == '22:00'
```

En de toets voor Overview als opgeslagen dashboard `lovelace` (later toegevoegd,
apart tegen de oude code gedraaid):

```
E       AssertionError: assert '19:30' == '22:00'
1 failed in 0.60s
```

De twee motortoetsen met een echt tweede dashboard vallen op de oude code eerder
om, op `AttributeError: 'MeldingOpslag' object has no attribute 'alle_leidend'`.
De regressiewacht `test_een_latere_tijd_geeft_vandaag_geen_tweede_melding`
slaagt op de oude code, zoals bedoeld.

JavaScript (`tests/js/meldingen-soorten.test.mjs`):

```
✖ zegt dat de melding van vanavond al verstuurd is
✖ toont de tijd die de server gebruikt, niet die van deze kaart
✖ verstuurd: met de titel, en de vraag om te kijken
✖ geen telefoon
✖ de reden van de server komt er letterlijk te staan
ℹ pass 14
ℹ fail 5
```

| Toets | Soort |
|---|---|
| `test_het_leidende_dashboard_gaat_voor` | **NIEUW GEDRAG** |
| `test_zonder_herinnering_gaat_het_standaarddashboard_voor` | **NIEUW GEDRAG** |
| `test_een_leidend_dashboard_zonder_de_kaart_telt_niet` | **NIEUW GEDRAG** |
| `test_overview_als_opgeslagen_dashboard_is_ook_het_standaarddashboard` | **NIEUW GEDRAG** |
| `test_de_laatst_aangepaste_kaart_gaat_voor` (echte Lovelace, twee dashboards) | **NIEUW GEDRAG** |
| `test_een_gekopieerde_kaart_gaat_niet_voor` | **NIEUW GEDRAG** |
| `test_een_latere_tijd_geeft_vandaag_geen_tweede_melding` | **REGRESSIEWACHT** |
| `test_een_proef_naar_een_persoon` (motor en websocket) | **NIEUW GEDRAG** |
| `test_staat_buiten_in_een_proef_doet_niets` | **NIEUW GEDRAG** |
| `tijden` in de stand | **NIEUW GEDRAG** |
| afvalRegel: "melding verstuurd", tijd van de server | **NIEUW GEDRAG** |
| afvalRegel: verstuurd van gisteren telt niet; zonder servertijden die van de kaart | **REGRESSIEWACHT** |
| proefUitkomst (3) | **NIEUW GEDRAG** |

### Verse code

Na `docker restart ha-lovelace` (Python gewijzigd, valkuil 49) en het wissen van
de service worker:

```
?v= in performance.getEntriesByType("resource"):  a09efa2083b7
sha256 van de bundel op schijf:                   a09efa2083b7a751fbe0472576074f3e26793ace08069a95fb79502c0677149a
```

(De bouw vóór het verhogen van het versienummer; daarna is alleen `0.54.1` in
`0.55.0` veranderd.)

### Zijn situatie nagespeeld in de testinstance

Dezelfde meldingenkaart op `kaart-test` en op een nieuw dashboard
`tablet-kopie`, allebei op 19:30, met `sensor.mijnafvalwijzer_morgen` op
`Papier, Restafval`. `diensten` naar `notify.persistent_notification`, zodat de
melding in Home Assistant zelf binnenkomt. De volgorde van de dashboards:
`map, fase-1-rooktest, test-scene, kaart-test, tablet-kopie`. Met de oude code
wint `kaart-test`, de eerste die gevonden wordt.

Om 22:27:42 de tijd op `tablet-kopie` (de laatste in de lijst) naar 22:30:

```
stand.tijden  {"morgen": "22:30", "vandaag": "07:30"}
```

Om 22:30:09, `persistent_notification/get`:

```
20:30:00 Morgen Papier en Restafval | Morgen worden Papier en Restafval opgehaald. Zet de containers vanavond aan de straat.
20:30:00 Morgen Papier en Restafval | Morgen worden Papier en Restafval opgehaald. Zet de containers vanavond aan de straat.
verstuurd: {"morgen": "2026-10-06"}
```

(UTC; 22:30:00 hier.) Twee meldingen: één per persoon.

### De pop-up en de proefknop, met echte kliks

Het testtabblad stond verborgen. Een view bouwde daarin niet (15 seconden nul
kaarten, valkuil 66), dus de echte kaart is met de hand in de pagina gehangen
(valkuil 21): echte `hass`, echte websocket. Hij had dezelfde config als die op
`kaart-test`, met daarin dus **19:30**.

Potlood bij "dev":

```
{ trusted: true, pad: "svg < potlood < rij" }
regel:  "Morgen Papier en Restafval · melding verstuurd"
proefknop zichtbaar: true
```

"Stuur een proefmelding":

```
{ trusted: true, pad: "span < button < proef" }
onder de knop:  "Verstuurd naar dev: “Proef · Morgen Papier en Restafval”. Kijk op de telefoon."
nieuw in persistent_notification:  20:30:33 Proef · Morgen Papier en Restafval   (één, alleen dev)
```

Uitlijning: de afvalregel en de proefknop staan allebei van x=785 tot x=1135
(350 breed) in een vak van 380 breed. Schermafdruk: `popup-proef.png`.

Daarna opgeruimd: de oorspronkelijke kaart op `kaart-test` teruggezet en
`tablet-kopie` verwijderd.

### Tellingen

- JS: 1335 toetsen, alle groen.
- Python: 748 toetsen, alle groen (lokaal in Docker, `python:3.14-slim`).
- `verify`, `check:registratie`, `check:controls`, `check:css`: OK.
- Bundel 897.942 bytes.

## Wat hij moet weten

- **Na de update moet hij de tijd op zijn hoofddashboard nog één keer
  aanpassen en opslaan** (of opnieuw op 22:00 zetten). De wijziging van vanavond
  is gedaan vóór deze versie; die heeft niemand onthouden. Zonder herinnering
  gaat sinds 0.55.0 het standaarddashboard voor, en dat is bij hem Overview
  met 22:00. Dat zou dus vanzelf goed moeten gaan, maar aanpassen maakt het
  zeker.
- Testen gaat met **Stuur een proefmelding** in de pop-up van zijn eigen naam.
  Alleen hij krijgt hem.
- Vanavond komt er niets meer: de melding van vanavond is om 19:30 al uit.

## Samenvatting

Hij kreeg om 22:00 geen melding om twee redenen: de melding van die avond was om
19:30 al verstuurd (en er komt er één per dag), en zijn 22:00 werd genegeerd
omdat dezelfde kaart op de kopie voor de wandtablet (19:30) voorging. Nu gaat de
kaart voor die het laatst is aangepast, toont de pop-up de tijd die de server
echt gebruikt, zegt hij "melding verstuurd" als dat zo is, en is er een knop om
een proefmelding naar één persoon te sturen.

## Wat niet lukte

- **Niet op een echte telefoon** gemeten; de meldingen gingen naar
  `notify.persistent_notification`. De tag en de knop in de proef zijn alleen in
  de toetsen gecontroleerd.
- **Niet in de kaarteditor van Home Assistant**: het tabblad stond verborgen en
  de view bouwde niet. De kaart is met de hand in de pagina gemeten.
- **De knop voor een niet-beheerder** (verborgen) is niet in de browser
  gemeten, alleen de weigering aan de serverkant in de toets.
- **Twee kaarten met hetzelfde id op HETZELFDE dashboard** (bijvoorbeeld in twee
  pop-ups) met andere instellingen: dan wint binnen dat dashboard nog steeds de
  eerste. De herinnering is per dashboard, niet per kaart. Bij hem staat er één
  per dashboard.

## Aannames

- Dat hij met "de tijd op 22:00 gezet" de avondmelding bedoelde (`tijd_morgen`).
  Zo staat het in zijn config.
- Dat het standaarddashboard de beste terugval is als er niets onthouden is.
- Dat een latere tijd op dezelfde dag geen tweede melding hoort te geven. Wil
  hij dat wel, dan is dat één regel; maar dan krijgt het hele huis hem twee keer.

## git status --porcelain

Vlak voor de commit:

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M custom_components/domotiapp_lovelace/meldingen/kaarten.py
 M custom_components/domotiapp_lovelace/meldingen/motor.py
 M custom_components/domotiapp_lovelace/meldingen/store.py
 M custom_components/domotiapp_lovelace/meldingen/websocket.py
 M src/cards/meldingen-card.js
 M src/cards/meldingen-logica.js
 M src/cards/meldingen-scherm.js
 M tests/js/meldingen-soorten.test.mjs
 M tests/meldingen/test_kaarten.py
 M tests/meldingen/test_motor.py
 M tests/meldingen/test_websocket.py
?? docs/melding-om-22-uur/
```
