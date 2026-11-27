# De garagemelding per persoon, versie 0.145.0

Gevraagd op 27 november 2026, via de beheersessie. De eigenaar: "maar personen kunnen niet instellen dus na hoeveel
minuten etc etc?" en "ja vraag het lovelace". Tot nu toe kon ieder in zijn pop-up de garagemelding alleen aan of uit
zetten. Minuten, herhaling en avondmelding stonden in de editor en golden voor het hele huis.

Later die avond schreef de eigenaar: "ik wil dat elke melding zo ingesteld kan worden". Deze ronde doet de garagedeur.
De andere soorten komen in een volgende ronde, op dezelfde manier: zie *Wat niet lukte*.

## Wat er nu kan

In de pop-up van een persoon klapt het pijltje bij de garagedeur drie rijtjes open:

| rijtje | keuzes |
|---|---|
| **Eerste melding na** | 5 min, 10 min, 15 min, 30 min, 1 uur |
| **Daarna elke** | niet herhalen, 15 min, 30 min, 1 uur, 2 uur |
| **Avondmelding** | geen, 21:00, 22:00, 23:00 |

Staat de standaard van de kaart niet in een rijtje (bijvoorbeeld 45 minuten), dan komt die erbij. In elk rijtje staat er
altijd één aan.

Wat in de editor staat is de **standaard** voor wie niets kiest. Een klant die niets doet, krijgt dus hetzelfde als
voor deze uitgave. Kiest iemand de standaard, dan gaat zijn keuze weg uit de opslag, zodat hij de kaart blijft volgen
als de beheerder die verandert.

Wat van het hele huis blijft:
- de knoppen in de melding;
- negeren, met de tijden van negeren;
- "Tot morgen", met de tijd van "morgen";
- het pad bij een tik op de melding;
- het contact en de bediening.

Of negeren per persoon moet worden, ligt bij de eigenaar.

## Hoe

- **Opslag.** De keuzes staan in `keuzes` van de meldingenopslag, net als die van afval en de stofzuiger: een lijst van
  één waarde onder `garage_minuten`, `garage_herhaal` en `garage_avond`. Avond is een tijd of `uit`.
  `meldingen/keuze` neemt die sleutels nu aan.
- **Server.** `garage.voor_persoon` legt de keuze over de instellingen van de kaart. Wat niet deugt, laat de kaart
  staan.
- **Motor.** De motor houdt per persoon bij wanneer hij de laatste melding en de avondmelding kreeg (`per` in de stand
  van de garage). De klok vraagt `garage.volgende` per persoon. Wie in dezelfde minuut hetzelfde krijgt, krijgt het in
  één ronde.
- **Na het negeren.** Wie al een melding had, krijgt meteen `na_negeer`. Wie er nog geen had (omdat hij een langere
  wachttijd koos), gaat gewoon verder met zijn eerste melding. Het negeren vervalt dan voor iedereen.
- **Bestaande opslag.** Komt de uitgave midden in een open deur, met een opslag van daarvoor, dan krijgt ieder het
  `gemeld` van het huis. Zo krijgt niemand na de herstart meteen een "eerste" melding.
- **Kaart.** `stand.garage` heeft nu ook `herhaal` en `avond`, de standaard van de kaart. De logica staat in
  `meldingen-logica.js`:
  - `garageKeuze`, `garageKeuzes` en `nieuweGarageKeuze` doen dezelfde controle als de server;
  - de regel onder de garagedeur noemt de eigen minuten.

  Een groep in de pop-up kan nu `enkel` zijn: één waarde uit een rijtje, als `radiogroup` met `radio`'s. Dat is de bouw
  die de andere soorten straks ook gebruiken.

## Proeven

**NIEUW GEDRAG**:
- 11 Python-tests in `tests/meldingen/test_garage_per_persoon.py`;
- 5 JS-tests in `tests/js/meldingen-garage-persoon.test.mjs`.

Er zitten twee REGRESSIEWACHT-regels in, voor `na_negeer` en voor de regel zonder persoon.

Ze lopen tegen de code van 0.144.2 (met `git archive main`):

```
11 failed in 1.43s
not ok 1 - de garagedeur per persoon
# pass 0
# fail 5
```

De 24 bestaande garagetests zijn ongewijzigd groen. Alles samen:
- JS: 2612 groen;
- Python: 1264 groen;
- verify, check:css, check:registratie, check:controls en check:taal: groen.

Het verloop in de proeven:
- Bram kiest 15 minuten en niet herhalen; Anna houdt de kaart (5 en 60). Anna krijgt haar melding om 14:05, Bram om
  14:15. Anna krijgt elk uur een herinnering, Bram niet.
- Bram kiest avond 21:30, Anna geen. Om 21:30 krijgt alleen Bram een melding, om 22:00 niemand.
- Wie al een melding had, krijgt na het negeren meteen een nieuwe. Anna (60 minuten, nog niets gehad) krijgt haar
  eerste om 15:00.
- Een herstart met keuzes en `per` in de opslag gaat gewoon verder.
- Een opslag van 0.144.2 midden in een open deur geeft geen dubbele eerste melding.

## Gemeten in de testinstance

Gemeten op 390 × 844, met `isMobile` en `hasTouch`, in donker en licht, met Playwright headless. De verse bundel draait:

```
BUNDEL schijf 96ca2f9a0727 geladen ["96ca2f9a0727"]
```

Alle tikken waren echte tikken (`click:true`). Na de tikken op 15 min, Niet herhalen en 21:00 stuurde de server via het
abonnement:

```
{"person.dev":{"garage_minuten":["15"],"garage_herhaal":["0"],"garage_avond":["21:00"]}}
```

De regel werd "Dicht · melding na 15 min open". Daarna is er teruggetikt:

- **5 min en 1 uur** werden bewaard als eigen keuze. Dat klopt: de proefkaart heeft 1 en 3 minuten als standaard.
- **22:00 is daar de standaard**, en die keuze ging weg uit de opslag. Een tweede tik op 22:00 deed niets.

Alle keuzeknoppen zijn 34 px hoog, en geen ervan steekt uit het vak: `scrollWidth` is gelijk aan `clientWidth`, voor het
vak (356) en voor de pagina (390). Er waren geen fouten in de console.

Daarna een echte herstart (`pm2 restart ha-lovelace`). Daarvoor is `garage_minuten` op 15 gezet, en daarna teruggelezen:

```
na herstart: {'person.dev': {'garage_minuten': ['15']}} standaard 1 3 22:00
```

De proefkeuzes zijn daarna in de testinstance teruggezet.

## Samenvatting

Bij de garagemelding kiest ieder nu in zijn pop-up:
- na hoeveel minuten de eerste melding komt;
- hoe vaak daarna;
- de avondmelding, met geen of een eigen tijd.

De editor is de standaard, en wie niets kiest merkt niets. Negeren blijft van het hele huis. De keuzes en wat ieder kreeg
staan in de opslag, en overleven een herstart (getest en echt gemeten).

## Wat niet lukte

- **De andere soorten nog niet.** Het gaat om de afvaltijden, de accugrens van de auto, en wat er bij de camera en de
  stofzuiger nog kan. Dat is gevraagd terwijl deze ronde liep. Het komt in een volgende ronde, op dezelfde bouw
  (`enkel`).
- **Geen echte melding op een telefoon.** De testinstance heeft geen telefoon. Het versturen per persoon is in de
  Python-proeven nagegaan met nep-notify-diensten.

## Aannames

- "etc etc" is gelezen als: na hoeveel minuten, hoe vaak daarna, en de avondmelding. Zo had de beheersessie het ook
  gelezen.
- De tijden van "Tot morgen", negeren en het pad blijven van het hele huis, omdat ze bij een knop horen die voor
  iedereen geldt.
- De rijtjes hebben vaste waarden, met de standaard van de kaart erbij. Geen vrij invulveld: op een telefoon is tikken
  sneller dan typen.

## git status --porcelain

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M custom_components/domotiapp_lovelace/meldingen/garage.py
 M custom_components/domotiapp_lovelace/meldingen/motor.py
 M custom_components/domotiapp_lovelace/meldingen/store.py
 M custom_components/domotiapp_lovelace/meldingen/websocket.py
 M src/cards/meldingen-card.js
 M src/cards/meldingen-logica.js
 M src/cards/meldingen-scherm.js
 M src/i18n/en/meldingen.js
?? docs/garage-per-persoon/
?? tests/js/meldingen-garage-persoon.test.mjs
?? tests/meldingen/test_garage_per_persoon.py
```
