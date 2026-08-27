# De thermostaten die door elkaar liepen, twee dingen op de mediakaart, en drie nieuwe kaarten

Ronde van 27 augustus 2026 — uitgave **0.20.0**.

Zes verzoeken in één bericht, plus één die er tijdens het bouwen bij kwam. Ze
staan hieronder in de volgorde waarin ze zijn afgewerkt: eerst de fout in
bestaand werk, dan de mediakaart, dan het nieuwe.

---

## 1. De thermostaten liepen door elkaar heen

> *"Je hebt gisteren gemaakt dat de thermostaten op telefoon goed leesbaar zijn
> door een instelling: vorm onder elkaar. Maar ze gaan door elkaar heen dan."*

Met een schermafdruk erbij: zes klimaatkaarten in een pop-up, waarvan de koppen
dwars over de tegels van de kaart erboven vielen.

### Wat het NIET was

Niet de gestapelde vorm zelf. Die tekent netjes 184px — drie rasterrijen, precies
zoals bedoeld.

### Wat het wél was, gemeten

Er is op zijn eigen installatie gekeken (read-only, met het token uit
`C:\dev\tokens\thuis.txt`). In zijn dashboard staan **53 klimaatkaarten, waarvan
twaalf op "Onder elkaar"**. Alle twaalf staan in een tabbladenkaart, en alle
twaalf dragen dit:

```json
{
  "type": "custom:domotiapp-climate-card",
  "layout": "gestapeld",
  "grid_options": { "columns": 6, "rows": 1 }
}
```

Die `rows: 1` was ooit terecht: de klimaatkaart WAS één rasterrij hoog. Sinds de
vorm "Onder elkaar" zijn het er drie.

In een sectie van Home Assistant zou dat niets uitmaken — HA klemt zo'n getal
tegen `min_rows` uit `getGridOptions()` van de kaart zelf (valkuil 12). **Onze
tabbladenkaart deed dat niet.** Hij nam het getal rauw over, gaf een vak van 56px
aan een kaart die er 184 tekent, en dus liep elke kaart 128px over zijn buurman.

### De reparatie

In `src/cards/tab-indeling.js` en `src/cards/tabs-card.js`, niet in de
klimaatkaart. Het raakt namelijk **élke groeikaart in een tabblad** — een
mediakaart, een weersvoorspelling, een lampkaart met kleurstrips.

- `indelingVoorKaart(gridOptions, grenzen)` klemt nu tussen `min_rows`/`max_rows`
  en `min_columns`/`max_columns`, precies zoals HA zelf doet.
- `grenzenVan(huiCard)` leest die grenzen van het echte kaartelement.
- `herijkIndeling_()` doet dat opnieuw bij elke nieuwe `hass` én na het opbouwen.
  Dat moet: de ondergrens is *gemeten* (`gemetenRijen`), dus bij het eerste
  tekenen bestaat hij nog niet.

### Het bewijs dat de test de bug vangt

Dezelfde aanroep tegen de code van vóór de fix:

```
OUDE CODE, config van zijn dashboard {columns:6, rows:1} + min_rows 3:
  height = "56px"   <- terwijl de kaart er 184 tekent
```

En met de fix: `184px`. De test staat in `tests/js/tab-indeling.test.mjs`
("klemt een te laag rijaantal op tot de ondergrens van de kaart").

### Gemeten in een echte browser

Vier gestapelde klimaatkaarten in een tabbladenkaart, met exact zijn config:

| kaart | config zegt | krijgt | tekent | staat op |
|---|---|---|---|---|
| Entree | `rows: 1` | `height: 184px` | 184px | top 144 |
| Slaapkamer B.G. | `rows: 1` | `height: 184px` | 184px | top 144 |
| Keuken B.G. | `rows: 1` | `height: 184px` | 184px | top 336 |
| Badkamer B.G. | `rows: 1` | `height: 184px` | 184px | top 336 |

Rij 1 op 144, rij 2 op 336: **192px ertussen, en dat is 184 + 8** — de kaart plus
precies één rastergat. Overlap gemeten: **geen**. De grenzen die de kaart opgaf:
`{columns: 12, rows: "auto", min_columns: 4, min_rows: 3}`.

**Wat dit voor hem betekent:** hij hoeft niets aan te passen. Die `rows: 1` mag
gewoon in zijn dashboard blijven staan.

---

## 2. Een afspeellijst verwijderen stond niet in het menu

> *"Ook kan ik geen afspeellijst verwijderen. Ik klik op de drie puntjes en dan
> staat er geen verwijderen tussen. Als ik op verwijderen klik wil ik wel een
> confirmation message hebben."*

Dat klopte. Verwijderen zat alleen achter de prullenbak in de KOP van een
geopende afspeellijst — dus alleen als je de lijst eerst opende. In het
driepuntjesmenu stond hij niet.

Nu wel: **"Afspeellijst verwijderen"**, onderaan het menu, in de kritieke kleur
met een scheidingslijn erboven. Alleen bij een lijst die van jou is
(`is_editable`) — een lijst van Spotify zelf kun je niet weggooien, en een knop
die altijd een foutmelding geeft is erger dan geen knop.

**En de bevestiging.** De oude "twee keer tikken op de prullenbak" is eruit. Zijn
verzoek is terecht: twee keer tikken is geen vraag, het is dezelfde handeling nog
een keer — wie de eerste per ongeluk deed, doet de tweede net zo makkelijk. Er
komt nu een echt scherm:

> **Afspeellijst verwijderen?**
> "&lt;naam&gt;" wordt uit Music Assistant gehaald. De nummers zelf blijven gewoon in
> je bibliotheek staan.
> *[Annuleren] [Verwijderen]*

De focus staat op Annuleren, zodat wie op Enter ramt niets onomkeerbaars doet.

---

## 3. De sleeptimer

> *"Dan wil ik een sleeptimer hebben, hier wil ik zelf de minuten in kunnen
> zetten. Als ik hem start dan loopt de tijd af en dan wordt op de speaker die
> geselecteerd is fade out toegepast bij het eind."*

Aan te zetten per kaart: **Sleeptimer tonen** in de editor. Er komt dan een knop
bij shuffle en herhalen.

Het scherm: snelknoppen **15 / 30 / 45 / 60 / 90**, een veld om zelf een aantal
minuten te typen (1 tot 720), en een veld voor hoe lang het uitfaden duurt
(standaard 30 seconden).

### Hij loopt in Home Assistant, niet in de kaart

Dit is de belangrijkste keuze van dit onderdeel. Een teller in JavaScript was een
halve dag minder werk geweest en hij zou niet werken: een sleeptimer is per
definitie het ding dat door moet lopen nadat je je telefoon hebt weggelegd, en
dan bevriest de browser zijn timers of sluit de companion-app de pagina.

Dus draait hij in de integratie
(`custom_components/domotiapp_lovelace/media/sleeptimer.py`), met drie
WebSocket-commando's erbij. De kaart zet hem, vraagt zijn stand op, en telt
zichtbaar af — maar de kaart mag onderweg verdwijnen.

### Wat er aan het eind gebeurt

1. Tot het laatste stuk gebeurt er niets. Muziek die vanaf de eerste minuut
   wegzakt is geen sleeptimer maar een storing.
2. De laatste 30 seconden zakt het volume in stapjes van een seconde naar nul.
3. De speler pauzeert — of stopt, als hij niet kan pauzeren. Een radiozender kan
   dat niet, en zonder die toets speelt de radio door met het volume op nul.
4. **Het volume gaat terug naar waar het stond.** Zonder die stap staat de
   speaker de volgende ochtend op nul, hoort niemand er iets uitkomen, en is de
   conclusie "de speaker is stuk".

Annuleren midden in de fade zet het volume ook terug. Anders is annuleren geen
annuleren.

### Eén ding dat onderweg is omgegooid

De eerste versie gebruikte `asyncio.sleep`. Dat werkt, maar het is de verkeerde
klok: de tests zaten er écht zeventig seconden per stuk op te wachten. Dat is
geen testprobleem — het is het signaal dat de timer niet aan Home Assistants
eigen tijdtracking hing. Omgezet naar `async_track_point_in_utc_time`; dezelfde
elf tests draaien nu in **0,74 seconde**.

Daarbij nog een val die het noteren waard is: de wekker plannen met een `lambda`
eromheen maakt de `@callback`-markering onzichtbaar, en dan draait Home Assistant
hem in een aparte thread:

```
RuntimeError: Non-thread-safe operation invoked on an event loop other than the current one
```

Met een `functools.partial` blijft die markering staan, want `HassJob` kijkt daar
wél doorheen.

### Gemeten in een echte browser

Op `media_player.living_room`, spelend:

- Sleeptimerknop aangeklikt — het scherm opent, 30 voorgeselecteerd.
- In het minutenveld **7** getypt met een echte toetsaanslag:
  `{toets: "7", isTrusted: true, doel: "min"}`. De snelknop 30 gaf zijn markering
  af, want 7 is geen 30.
- Op Starten geklikt. Het scherm telt af: **6:52 → 6:49** over drie seconden.
- De server bevestigt het onafhankelijk:
  `{entity_id: "media_player.living_room", seconds_left: 408, fade: 30}`.
- Op "Timer stoppen" geklikt: `gestopt_op_de_server: true`, lijst leeg.

---

## 4. De 3D-printerkaart (Bambu Lab X1D met AMS 2 Pro)

Alles wat gevraagd is zit erin: camera, voorbeeldplaat, bedtemperatuur, eindtijd,
nozzletemperatuur, printstatus, printvoortgang, de deursensor, en de vier trays
van de AMS.

**De camera en de plaat delen één beeldvlak**, met een wisselknop in de hoek. Ze
naast elkaar zetten maakt de kaart twee keer zo hoog voor een dashboard waar je
meestal maar naar één van de twee kijkt. De camera is de standaard zodra er iets
loopt, en gaat dan ook echt live; staat de printer stil, dan is een plaatje per
paar seconden genoeg en scheelt het een stream die de hele dag openstaat. Wie het
anders wil zet **Altijd live** aan.

**De trays halen hun kleur uit de attributen**, zoals gevraagd. Dat is meer werk
dan het lijkt: Bambu levert `RRGGBBAA` — mét alfakanaal, soms zonder hekje, soms
in kleine letters. Rechtstreeks in CSS zetten geeft een tray zonder kleur, zonder
fout. Het omrekenen staat in `printer-logica.js` met tests eronder. Een lege tray
meldt vaak `00000000`; die wordt géén zwarte tray maar een gestreept vakje, want
zwart filament bestaat en "niets" hoort daar niet op te lijken.

**De aan/uit-schakelaar**, zijn latere verzoek:

> *"Een schakelaar om hem in te schakelen, dat is een switch-entiteit. Als ik hem
> uit zet moet het een melding geven, weet je zeker dat je hem uit wil zetten.
> Dit om per ongeluk uitzetten te voorkomen."*

Aanzetten gaat meteen — dat is gratis. **Uitzetten vraagt eerst**, en loopt er een
print, dan staat dat er met zoveel woorden bij, mét hoe ver hij was:

> **Printer uitzetten?**
> Er loopt een print (62% klaar). Uitzetten breekt hem af, en dat is niet terug
> te draaien.

### Gemeten in een echte browser

- Op de schakelaar geklikt: `{isTrusted: true, pad: ["path", "svg",
  "button.aanuit", "div.kop"]}`.
- Het scherm verschijnt: "Printer uitzetten?"
- **De schakelaar staat op dat moment nog steeds `on`** — er wordt niets
  geschakeld vóór het antwoord.
- Op "Aan laten" geklikt (`isTrusted: true`): scherm dicht, schakelaar nog steeds
  `on`.

Eén ding dat de meting opleverde en meteen is verwerkt: een statushelper die
`Run` meldt kwam als "onbekend" op de kaart. Bambu schrijft zelf `RUNNING`, maar
wie een eigen sjabloonsensor bouwt schrijft `Run`. Toegevoegd, met test.

---

## 5. De autokaart

> *"Kunnen selecteren brandstof, hybride of elektrisch. Actieradiusbalk en
> laadtoestandbalk, verschillende sensoren die ik kan invullen. Afbeelding
> uploaden van de auto etc etc, maak hem universeel en zoveel mogelijk opties om
> in te vullen. Wel minimalistische GUI-editor."*

**De aandrijving is een keuze en geen gok.** De kaart had kunnen raden aan de hand
van welke sensoren zijn ingevuld — en dan toont hij bij een half ingevulde kaart
de verkeerde balk, zonder dat er iets te zien is dat verkeerd staat.

**"Zoveel mogelijk opties" en "minimalistische editor" botsen**, en het antwoord
is: niet minder kunnen invullen, maar niet alles tegelijk zien. Kies je
elektrisch, dan zijn de tankvelden er niet — en kun je ze dus ook niet half
invullen.

Wat erin kan: actieradius, accupercentage (met accu-inhoud voor wie in kWh meldt),
tankniveau (idem met tankinhoud in liters), laadstatus, klaar-met-laden-om,
laadvermogen, portierslot, deuren, ramen, voorverwarmen, waar hij staat,
kilometerstand, en **een vrije lijst eigen sensoren** die als tegels onderaan
komen — bandenspanning, buitentemperatuur, de volgende beurt.

**De foto** gaat via HA's eigen afbeeldingskiezer, dus met een echte uploadknop.
Klein naast de naam, of groot over de hele breedte. De foto vult de kaart
bewust níét: witte cijfers over een foto die de klant zelf kiest is een gok over
leesbaarheid die je één keer verkeerd hebt.

Wat universeel maken hier betekende: elke integratie meldt zijn eigen eenheden.
De actieradius wordt **niet omgerekend** — wie zijn Home Assistant op mijlen heeft
staan, wil mijlen zien. Een tank in liters wordt wél een percentage, als je de
tankinhoud invult.

---

## 6. De beveiligingscamerakaart

> *"Met een camera die presets ondersteunt, dat dat ook weergegeven wordt. Live
> kunnen kijken en kunnen inzoomen bijvoorbeeld. Ben benieuwd of je dat lukt."*

**De presets.** Er is geen standaard voor, dus de kaart doet geen aanname. Reolink
en ONVIF leveren een `select` met de presets als opties — kies je die, dan wordt
elke optie een knop, en een preset die je later in de camera-app toevoegt
verschijnt er vanzelf bij. Amcrest en Dahua leveren losse `button`-entiteiten; die
kunnen er als tweede lijst naast. Allebei tegelijk mag ook.

**Live.** Op de kaart staat standaard een beeld dat zichzelf ververst; met de knop
rechtsonder gaat hij echt live. Een dashboard met zes camera's zou anders zes
streams openhouden.

**Inzoomen** met het wiel, met twee vingers, met + en −, of met een dubbeltik. Het
zoomt rondom je vinger, zodat wat je bekijkt blijft staan waar het staat, en het
klemt binnen het beeld — schuif je verder dan de rand, dan kijk je naar de
achtergrond en ziet dat eruit als een camera die het niet doet. Het rekenwerk
staat in `zoom-logica.js` met tests.

Verder: een **draaikruis** (vier knoppen die jouw eigen PTZ-entiteiten indrukken —
`ptz_move` heet bij elk merk anders, dus dat kennen we bewust niet), een merkje
**Beweging** zolang je bewegingsmelder aanstaat, en **meerdere camera's op één
kaart** met een rij namen eronder.

### Gemeten in een echte browser

- De presets uit `input_select.testmodus` staan als knoppen op de kaart: Thuis,
  Weg, Nacht, Vakantie — met **Weg** gemarkeerd, want dat is de stand van de
  entiteit.
- Het beeld gebruikt HA's eigen `hui-image` (niet de terugval).
- Op de inzoomknop geklikt: `{isTrusted: true, pad: ["path", "svg", "button",
  "div.knoppen"]}`, en de transform ging van `scale(1) translate(0.000%, 0.000%)`
  naar **`scale(1.5) translate(0.000%, 0.000%)`**. De uitzoomknop werd bruikbaar.

---

## Wat niet lukte

- **Het verwijderen van een afspeellijst is niet in een echte browser
  aangetoond.** De testinstance heeft geen Music Assistant, dus er is geen
  afspeellijst om het driepuntjesmenu op te openen. De code eromheen is dezelfde
  weg als de bestaande knop (`verwijderLijst`), en de bevestiging is hetzelfde
  scherm dat bij de printer wél met een echte klik is gemeten. Maar gemeten is
  gemeten, en dit is het niet.
- **Er is één klik misgegaan en dat is de moeite van het opschrijven waard.** De
  eerste poging om op de inzoomknop te klikken landde op het beeld eronder, wat
  een pop-up opende. Niet omdat de knop kapot was: er was gemeten vlak na een
  `scrollIntoView`, en de pagina schoof daarna nog. De capture-luisteraar liet dat
  meteen zien (`pad: ["div.vak", ...]` in plaats van de knop) — zonder die
  luisteraar was de conclusie "de zoomknop doet niets" geweest. Meet de positie
  op een **verse** schermafdruk, niet op een die een handeling oud is.
- **De trays zijn met handmatige kleuren getoetst, niet met een echte AMS.** Er
  staat hier geen Bambu Lab. Het omrekenen van `RRGGBBAA` is wel met tests
  vastgelegd, inclusief de lege tray (`00000000`).

## Aannames

- **De aan/uit-schakelaar van de printer is een `switch` of een
  `input_boolean`**, zoals hij zei. De kaart roept `turn_on`/`turn_off` aan op het
  domein van de entiteit die je kiest.
- **De AMS-trays worden per stuk ingevuld**, elk met een eigen entiteit. Levert
  jouw integratie geen entiteit per tray, dan is er per tray een veld voor de
  kleur en de naam met de hand.
- **De PTZ-knoppen zijn `button`-entiteiten uit je eigen integratie.** Er is
  bewust geen merkspecifieke service ingebouwd.
- De sleeptimer staat standaard **uit** op een mediakaart, dus een bestaande kaart
  verandert niet.

## Tellingen

- **748 JS-tests** groen (`npm test`), **538 Python-tests** groen.
- `npm run verify`, `npm run check:css` en `npm run check:registratie`: alle drie OK.
- Bundel **555.916 bytes**, sha256 `4827c074…`, versie 0.20.0.
- Negentien kaarttypes (drie erbij).

De browser draaide aantoonbaar verse code: de geladen bundel was
`?v=d2e3f2840415`, en dat is de eerste twaalf tekens van de sha256 van het bestand
op schijf op dat moment (`d2e3f284041522d9…`). Service worker en caches waren
daarvóór gewist (valkuil 15).

## git status --porcelain

Zie de PR; de werkmap is bij het uitbrengen schoon.
