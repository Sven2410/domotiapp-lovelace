# De botkaart: "Vraag het de DomotiTech Bot"

Tak `fase-178/bot-kaart`, PR #199, versie 0.124.0. **Nog niet uitgebracht.** Gebouwd volgens contract 1 in
`notities/werkmap/domotitech-bot.md`, met de wijziging van 13 november 2026. Coach v0.220.0 heeft het sinds 13 november
2026; de kaart is daarna nagemeten tegen de ECHTE gegevenslaag van die coach (zie *Tegen coach v0.220.0*), en een
echte dump staat als vaste testinvoer. Bij de eigenaar thuis is hij nog niet geprobeerd: dat kan pas na een uitgave.

## De vraag

De eigenaar, 12 november 2026, in de werkmap-sessie: *"het moet in een popup komen zoals Vraag het de DomotiTech Bot
snap je? Alles in HA [...] Niet iedereen heeft en wil telegram."* En: *"Lovelace moet een eigen kaart hebben en dat
moet hetzelfde zijn in de coach snap je?"*

Op 13 november 2026, na de eerste vorm: *"die ticket kaart moet uitgebreider. Gewoon een vraag stellen over de
installatie en echt een ticket aan maken zijn aparte dingen."* Op de vraag hoe koos hij:
- het vragen-deel wordt **één doorlopende chat**;
- bij een ticket horen de **soort** en **een foto bijvoegen**.

Dat staat als wijziging in de afspraak, en de werkplaats bouwt het zo in v0.220.0.

## Wat er is

- **`custom:domotiapp-bot-card`**: één tegel van één rasterrij (56 hoog), met het nieuwe icoon `chat`. Onder de naam
  staat "2 nieuwe antwoorden", of "1 ticket loopt", of niets. Een stip op het icoon betekent dat er ergens een antwoord
  is dat deze gebruiker nog niet las, in het gesprek of in een ticket. In de editor staan alleen een naam en een icoon.
- **Het scherm** (`bot-scherm.js`) hangt aan `document.body` (valkuil 34). Bovenaan staan twee tabbladen; een stip op
  een tabblad betekent dat daar iets nieuws is.
  - **Vragen**: het gesprek van het huis (`id` 0 in het contract), zoals een chat. Typen, Versturen, en het antwoord
    komt eronder. Zonder berichten staat er een voorbeeldvraag, en de tip om een ticket te maken als er iets niet
    werkt.
  - **Tickets**: Nieuw ticket, met daaronder de lijst. Het laatst bijgewerkte ticket staat bovenaan, met `#nummer ·
    soort · stand`, de tijd en een stip.
  - **Een ticket openen** toont zijn gesprek, met een veld en een knop Foto.
  - **Nieuw ticket**: kies Storing of Aanvraag, beschrijf het, voeg tot vier foto's toe (camera of fotorol), en tik
    Versturen. Daarna staat het ticket open met "Ontvangen, we kijken ernaar", tot er een antwoord is.
- **Waar het scherm opent**: het opent op Vragen. Staat er alleen in de tickets iets nieuws, dan opent het op
  Tickets.
- **Foto's**:
  - De kaart verkleint elke foto tot een JPEG met een lange kant van hoogstens 2000 px (`fotoMaat`). Een staande foto
    blijft staand.
  - Daarna gaat hij met `hass.fetchWithAuth` naar `POST /api/domotiapp_coach/tickets/bijlage`, en het id gaat mee in
    `bijlagen`.
  - Bekijken gaat via een ondertekend pad (`auth/sign_path`, een uur geldig). Zo staat er geen token in een `<img>`.
  - `bijlagePad` maakt alleen een adres van een id van 32 hex-tekens.
  - Een tik op een foto toont hem groot.
- **De standen voor de klant**:

  | stand | wat de klant leest |
  |---|---|
  | `nieuw` | Ontvangen |
  | `in_behandeling` | In behandeling |
  | `bij_beheerder` | Ligt bij DomotiTech |
  | `klaar` | Afgerond |
  | een stand die er later bijkomt | In behandeling |
- **Live**: de kaart is geabonneerd met `BlijvendAbonnement` (valkuil 70). Een wijziging met `id` 0 gaat naar het
  gesprek, de rest naar de tickets.
- **Zonder coach**, of **met een coach die de tickets niet kent**: dan staat er een zin. De coach is te oud als hij
  er wel staat en het na twintig tellen nog `unknown_command` geeft.
- **Tekst is tekst**: alles van de klant en van DomotiTech gaat er met `textContent` in.
- **De velden** hebben 16px tekst, geen eigen rand die meetelt (valkuil 79) en geen sleepgreepje. Ctrl of Cmd met
  Enter verstuurt.

## Hoe het gemeten is

De nagemaakte coach staat in `.ha-dev-config/custom_components/domotiapp_coach/tickets.py` (niet in git). Hij volgt
het contract met de wijziging:
- het gesprek met `id` 0;
- `new` alleen voor storing en aanvraag;
- de foto's: upload, `bijlagen`, en bekijken met GET.

Op `kaart-test` staat een view `bot`.

Playwright, 390 breed, `isMobile` en `hasTouch`, met tikken. Antwoorden komen zoals de mini-pc ze stuurt: als
beheerder `answer`, over een eigen websocket. De foto is gekozen met een echte tik op Foto, en daarna via de
bestandskiezer van de browser (`filechooser`).

```
BUNDEL schijf 32ad6693a325 geladen ["32ad6693a325"]
OPEN {"stand":"vragen","tabs":["Vragen:true","Tickets:false"]}
VRAAGVELD px 16px spaties isTrusted 5
MELDING VRAAG "" VELD LEEG true
GESPREK ["klant: Hoe vol is mijn accu nu?","domotitech: Je thuisbatterij staat op 64 procent. Va"]
FOTO origineel 260985 bytes                      (4032 x 3024)
GEKOZEN 1 spaties 5
NA TICKET {"stand":"ticket","kop":"#10 · Storing","ontvangen":"Ontvangen, we kijken ernaar.","fotos":[{"geladen":true,"maat":[2000,1500],"ondertekend":true}]}
BIJ DE COACH {"id":10,"soort":"storing","tekst":"De lamp in de gang knippert","bijlagen":[{"id":"1b9e...","type":"image/jpeg","grootte":40633}]}
GROOT true
KAART na antwoord, dicht {"regel":"2 nieuwe antwoorden","stip":true}
OPENT OP tickets
BREEDTE vragen        {"pagina":[390,390],"vak":[356,356,16,374,82,762,390,844]}
BREEDTE tickets       {"pagina":[390,390],"vak":[356,356,16,374,159,685,390,844]}
BREEDTE nieuw ticket  {"pagina":[390,390],"vak":[356,356,16,374,195,649,390,844]}
FOUTEN []
```

- **Klikken en tikken**: in het logboek is elke tik `touchstart:true click:true`. Er is één `click:false`: dat is de
  kaart zelf, die de verborgen bestandskiezer opent.
- **De breedte**: `vak` is `[scrollWidth, clientWidth, links, rechts, boven, onder, venster]`. In alle standen past het
  vak binnen het scherm, en de pagina scrolt nergens opzij.
  - In de eerste vorm liep de lijst 14 px over de rechterrand (386 breed, van 16 tot 404). Een raster met een
    automatische kolom groeit mee met een onderwerp dat niet afbreekt. Gerepareerd met `minmax(0, 1fr)`.
  - Op 1366 breed is het vak 438.
- **Gevonden en gerepareerd: na een vraag stond er "Versturen lukte niet: this.fotos_[e] is not iterable".** De vraag
  ging wel weg, maar het leegmaken van de foto's daarna kende het vak Vragen niet. Na de reparatie staat er geen
  melding en is het veld leeg (zie `MELDING VRAAG` hierboven).
- **De tegel** is 56 hoog, net als een tegel van Home Assistant ernaast.
- **Zonder coach en te oud** zijn gemeten met de echte kaart met de hand in de pagina (valkuil 21):
  - een `hass` zonder `domotiapp_coach` geeft "Heeft DomotiApp Coach nodig";
  - een verbinding die `unknown_command` zegt geeft na twintig tellen "Werk DomotiApp Coach bij".

  In beide gevallen toont het scherm een zin en geen knoppen.
- **De herstart**: de pagina bleef open, en Home Assistant herstartte met `pm2 restart`. Daarna kwam er een antwoord
  in het gesprek via een eigen websocket:

  ```
  23:42:08 VOOR {"regel":"6 tickets lopen","stip":false} navigaties 2
  23:42:10 HERSTART
  23:42:32 TERUG {"regel":"6 tickets lopen","stip":false}
  antwoord True 6
  23:42:36 NA ANTWOORD {"regel":"1 nieuw antwoord","stip":true} navigaties 2
  ```

  Er zijn geen nieuwe navigaties bijgekomen. De kaart abonneerde zich opnieuw, zonder dat de pagina herlaadde.
- **Licht thema**: kaart en scherm staan op `dac-thema="licht"`. Er zijn schermafdrukken van de tegel, de lijst en het
  gesprek.

## Tegen coach v0.220.0

De werkplaats bracht v0.220.0 uit op 13 november 2026 en stuurde een dump van `list`. Daarna:

- **De vaste invoer** `tests/js/vaste-invoer/coach-0.220.0-tickets.json` is gemaakt met `tickets.py` van de
  uitgebrachte coach zelf (`overzicht` en `voor_buiten`), niet nagebouwd. Het pakket zelf laadt niet zonder Home
  Assistant, dus alleen dat bestand is geladen. Er staan twee bewoners in, een gesprek, een storing met een foto bij de
  beheerder, een aanvraag die klaar is, een storing van alleen een foto, en een event na een antwoord.
- **De nep-coach in de testinstance** draait nu op die echte gegevenslaag: `echt_tickets.py` is `tickets.py` van
  v0.220.0, letterlijk, alleen zonder Engels. De websocket, de opslag en de twee HTTP-wegen zijn overgenomen uit
  `websocket.py`, `storage.py` en `bijlagen.py`, zonder de pushmelding.
- **De hele telefoonmeting opnieuw**, 390 breed met echte tikken:
  - een vraag in het gesprek, het antwoord eronder, het veld leeg;
  - een storing met een foto van 4032×3024: aangekomen als 2000×1500, 40.633 bytes, met een ondertekend pad;
  - de foto groot;
  - een antwoord terwijl het scherm dicht is: "1 nieuw antwoord" en de stip;
  - nergens iets breder dan het scherm, geen paginafouten.
- **De herstartproef opnieuw**: het ticket staat er na een herstart van Home Assistant nog, en een antwoord daarna
  komt binnen zonder de pagina te herladen (2 navigaties, net als ervoor).
- **De weigeringen van de echte coach**:

  | wat | code |
  |---|---|
  | een vraag als ticket | `soort` |
  | een lege vraag | `leeg` |
  | een foto in het gesprek | `bijlage_gesprek` |
  | een ticket dat niet bestaat | `niet_gevonden` |

  De kaart zegt ze met de zin van de coach erachter ("Versturen lukte niet: ..."). De kaart kan zelf geen foto in het
  gesprek zetten: daar staat geen knop Foto.

Er is in de kaart niets veranderd. Een bericht van alleen een foto heeft bij de coach een lege tekst; de lege regel
was al weg met `.tk:empty`.

## Proeven

`tests/js/bot-dump-0220.test.mjs`, 6 proeven op de echte dump, **NIEUW GEDRAG**. Ze gaan over:
- contract 1, het gesprek apart, de tickets nieuwste eerst;
- elke soort en stand een woord;
- wat elke bewoner nog niet las;
- de foto's als `{id, type, grootte}`;
- een event dat één ticket vervangt.

`tests/js/bot-logica.test.mjs`, 22 proeven, allemaal **NIEUW GEDRAG**. Ze gaan over:
- het abonnement: gesprek en tickets apart, en `id` 0;
- gelezen per gebruiker, en samen geteld;
- de regel op de tegel, ook in het Engels;
- de standen, en de soorten (alleen storing en aanvraag);
- nakijken voor versturen: een ticket met alleen een foto mag, met hoogstens vier;
- foutzinnen;
- de maat van een foto, en geen adres zonder een echt id;
- tijden.

Op de code van main bestaat `bot-logica.js` niet, dus beide bestanden vallen daar om (hier de dumpproef):

```
# Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../src/cards/bot-logica.js'
```

Alles samen: 2433 JS-proeven en 1153 Python-proeven groen. `check:taal`, `check:css`, `check:registratie`,
`check:controls` en `verify` zijn ook groen. Python is niet veranderd.

`check:css` ving dat `accept="image/*"` in het sjabloon begint als een CSS-commentaar. Die waarde zet de kaart nu
vanuit JavaScript.

Het icoon `chat` staat op de vier plekken: de tekening, de groep, de zoekwoorden en `iconen.json`.

## Samenvatting

Een nieuwe kaart `custom:domotiapp-bot-card`: één tegel, en een scherm met twee tabbladen.
- **Vragen** is één doorlopend gesprek over de installatie.
- **Tickets** zijn storingen en aanvragen, met foto's.

Alles komt live van de coach. Gemeten als telefoon met echte tikken en getypte spaties, met een echte foto van
telefoonformaat, over een herstart van Home Assistant heen, in licht en donker, en zonder coach. Een fout gevonden en
gerepareerd: "this.fotos_[e] is not iterable" na een vraag. Na de uitgave van coach v0.220.0 alles opnieuw gemeten
tegen zijn echte gegevenslaag, met een echte dump als vaste invoer; daarvoor hoefde er niets aan de kaart te veranderen.

## Wat niet lukte

- **Niet bij de eigenaar thuis**: daar mogen wij niets aan zetten of versturen, en de kaart komt er pas met een uitgave.
  De pushmelding van de coach na een antwoord is dus ook niet gezien.
- **De echte coach als geheel** draaide niet in de testinstance (daar staat een nep met andere apparaten); wel zijn
  gegevenslaag letterlijk, en zijn websocket en HTTP-wegen overgenomen.
- **De editor** (naam en icoon) is niet in een browser geopend. Er staan alleen een standaard tekstveld en de
  icoonkiezer van de familie in.
- **iOS** zelf is niet gemeten:
  - wat het toetsenbord met een venster van vaste hoogte doet;
  - de camera als bron;
  - een HEIC-foto. Safari levert normaal een JPEG aan; lukt verkleinen niet, dan gaat het origineel en beslist de coach.
- **Het icoon van de knop Foto** is `camera`. Die tekening lijkt meer op een filmcamera dan op een fototoestel. Er is
  geen eigen fototoestel-icoon.

## Aannames

- Het gesprek hoort bij het huis, net als de tickets: iedereen in die Home Assistant ziet hetzelfde gesprek.
- Een tijd staat in de tijdzone van het toestel, niet in die van Home Assistant.
- In het gesprek kunnen geen foto's. Zo staat het in de afspraak: foto's zijn voor een ticket.
- 0.124.0 is het volgende vrije versienummer (main staat op 0.123.0); de manifest staat er al op.

## git status --porcelain

Bij het schrijven van dit rapport, vóór de commit:

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M docs/bot-kaart/RAPPORT.md
 M tests/js/bot-logica.test.mjs
?? tests/js/bot-dump-0220.test.mjs
?? tests/js/vaste-invoer/coach-0.220.0-tickets.json
```
