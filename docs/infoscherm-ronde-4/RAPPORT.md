# Infoscherm ronde 4: alles schaalt mee, het blok Energie, en de knop die onder het scherm lag

**Datum:** 10 september 2026
**Uitgave:** 0.39.0
**Tak:** `fase-44/infoscherm-ronde-4`

## Wat er gevraagd is

Eén bericht van de eigenaar op 10 september 2026, na het proberen van 0.38.0,
met drie schermafdrukken. Uit elkaar getrokken:

| # | vraag | waar het zit |
|---|---|---|
| 1 | "bij de beheerderskaart zie ik nog steeds een licht theme" (schermafdruk van de keuzelijst *Pagina Aanwezig*, met twee grijze opties) | het menu van de browser-`<select>` nam de doorschijnende achtergrond over; de keuzes uit twee of drie zijn nu knoppen naast elkaar, en de keuzelijst die overblijft heeft een dichte achtergrond |
| 2 | "als installateur kan ik geen verlichting toevoegen in de GUI-editor" | de editor deed het; de knop **Bewerken** was in een panel-view niet te bereiken (zie hieronder) |
| 3 | een nieuwe tab Energie met het verbruik in een bijpassend live lijngrafiekje; de sensor in de GUI-editor, net als het weer | blok en pagina **Energie**, veld *Energiesensor* in de kaarteditor |
| 4 | "ik kan niet swipen op mededelingen" | met een muis is de baan nu te slepen; de stippen zijn knoppen |
| 5 | het weer wordt getoond maar de tekst niet (schermafdruk van een weerblok van één rij) | de tekst staat er nu ook in een blok van één rij, op één regel |
| 6 | "alles van alle kaarten moet meegeschaald worden als je ze kleiner en groter maakt"; de stapgrootte is goed | elke maat in een blok volgt nu de maat van het blok (`--b`) |
| 7 | nieuws met "toon 10": er past nog een bericht bij, "maak dan alles dezelfde grootte en passend; in dit geval moeten er 7 passen" | de rijen die passen zijn even hoog en vullen het blok; blijft er bijna een rij over, dan gaat alles een tikje kleiner zodat die erbij past (`pasLijst`) |
| 8 | "Alles dicht" is in de GUI-editor van het beheer niet te kiezen | de waarde was `""`, en een lege waarde wordt uit de config gehaald; nu `geen` |

## Wat er gebouwd is

### De knop Bewerken lag onder het scherm (punt 2)

Lampen toevoegen in de editor werkte in de testinstance gewoon, met een
gevulde én met een lege config (zoals bij hem na de update). Wat NIET werkte:
de editor **openen** vanaf het dashboard. In de bewerkmodus zet Home Assistant
onder elke kaart een balk met "Bewerken", en een beeldvullende kaart in een
panel-view duwt die balk onder de rand van het venster; de view scrolt niet.

Gemeten vóór de fix, in een venster van 855 hoog:

| | top | bottom |
|---|---|---|
| kaart | 110 | 861 |
| knop Bewerken | 874 | 914 |

Na de fix (in de bewerkmodus is de kaart 72px korter; `inBewerkmodus_` zoekt
`hui-card-options` als voorouder):

| | top | bottom |
|---|---|---|
| kaart | 110 | 796 |
| knop Bewerken | 809 | 849 |

Daarna met een echte klik op die knop de editor geopend: dialoog open, het
veld *Energiesensor* erin, `isTrusted` op de klik. Zie de aanname hieronder:
dit is wat ik denk dat hij tegenkwam.

### Alles in een blok schaalt met het blok (punten 5, 6, 7)

Elke maat in een blok was al `calc(px * var(--s))` met `--s` de schermschaal.
Nu is `--s` in een blok `schermschaal × --b × --pas`:

- `--b` komt uit `blokSchaal(soort, w, h)`: een blok van 2×2 is 1; breder of
  hoger is groter (tot 1,45 bij 6 breed, 1,5 bij 6 hoog), smaller of lager
  kleiner (0,85 bij 1 breed, 0,8 bij 1 hoog). Een **lijstblok** (aanwezig,
  nieuws, verlichting, agenda, verjaardagen) volgt alleen zijn breedte: een
  hoger blok toont méér, niet groter. De andere blokken nemen het meetkundig
  gemiddelde van beide, zodat een welkomblok van 6×1 op 1,08 uitkomt en niet
  op 1,45.
- `--pas` komt uit `pasLijst`: hoeveel rijen er op hun eigen maat passen, en
  of er met een klein beetje kleiner (nooit onder 72%) nog een rij bij kan.
  De rijen die er staan worden over de hoogte uitgesmeerd
  (`grid-template-rows: repeat(n, 1fr)`), dus elke rij even hoog en geen gat
  onderaan. De openingstijden krimpen op dezelfde manier als de zeven dagen
  net niet passen.
- De kop van een blok schaalt NIET mee (`.blok > .bk { --s: var(--ss) }`),
  anders leest het raster als zeven verschillende kaarten.

Gemeten op 1920×855 (`--ss` 0,958) met deze indeling: weer 2×1, energie 2×2,
openingstijden 2×2, aanwezig 2×3 (alle), mededelingen 2×1, verlichting 2×1
(toon 4), nieuws 2×5 (toon 10):

| blok | `--b` | `--pas` | rijen | getoond | rijhoogte | rest onderaan |
|---|---|---|---|---|---|---|
| nieuws 2×5, toon 10 | 1 | 0,917 | 6 | 6 van 10, kop "nog 9" | 6 × 73 px | 0 px |
| aanwezig 2×3 | 1 | 1 (dicht) | 4 | 7 van 7 | 7 × 57 px | 0 px |
| verlichting 2×1 | 1 | 1 | 1 | 2 van 4, kop "nog 3" | 44 px | 0 px |
| openingstijden 2×2 | 1 | 0,886 | -- | 7 van 7 | 18 px | 3 px |
| weer 2×1 | 0,894 | -- | -- | tekst zichtbaar, 11,1 px, 13 px boven de onderrand | | |
| welkom 6×1 | 1,077 | -- | | | | |
| mededelingen 2×1 | 0,894 | -- | | | | |

Geen enkel zichtbaar kind had `scrollHeight > clientHeight` (niets afgesneden).
Vóór deze ronde stond in hetzelfde nieuwsblok 3 van 10 met een gat eronder, en
toonde het aanwezigblok 4 van 7.

Zijn eigen geval (zes berichten met bijna een rij over) is in een unittest
nagerekend: `pasLijst({beschikbaar: 640, hoogte: 92, gap: 8, aantal: 10})`
geeft 7 rijen op 0,919.

**Eén ding dat daarbij tijd kostte:** zolang de lijst `flex: 1` is in het
blok, maakt Chrome zijn automatische rasterrijen zo hoog als er past en niet
zo hoog als de inhoud -- lampen van 17 px met een chip van 31 px erin. Meten
gebeurt daarom even op `flex: none` (valkuil 54 in CLAUDE.md).

### Het blok Energie (punt 3)

- Kaarteditor: veld **Energiesensor (vermogen of tellerstand)**, een
  `sensor`. Gaat net als het weer via `sync_` naar de opslag, zodat het
  beheer weet dat het blok gevuld kan worden (`installatie.energie`, ook aan
  de serverkant).
- Het blok: het getal van nu in neutrale inkt, daaronder een lijn in het
  accent met een vlak eronder, een stip op het laatste punt, de piek als
  opschrift, en de tijden onderaan. Eén rij hoog: getal links, lijn rechts.
- De pagina: tegels Nu / Gemiddeld / Piek (en bij een tellerstand Afgelopen
  24 uur), en de grote grafiek met vijf tijden.
- De gegevens: `history/history_during_period` over de afgelopen 25 uur bij
  het laden en om het kwartier; tussendoor komt elke nieuwe waarde uit `hass`
  achter de reeks (`energieLive_`). Een vermogenssensor (W, kW) wordt de lijn
  van de afgelopen 24 uur; een tellerstand (kWh, of `state_class`
  `total_increasing`) wordt verbruik per uur, en een teller die terugspringt
  telt als nul. Watt wordt kilowatt vanaf 1000.
- Het rekenwerk (`energiePunten`, `energieReeks`, `energieSamenvatting`,
  `lijnPad`, `formatEnergie`, `isTellerstand`) staat in
  `infoscherm-logica.js` met unittests.

Gemeten in de testinstance met `sensor.power_consumption` (demo, W), waar
eerst vijf waarden in gezet zijn (240, 410, 180, 520, 330): blok met getal
"100 W" (de demo zet hem na een herstart terug), opschrift "piek 520 W", stip
op 81,7% van boven, tijden `03:48 · 15:48 · nu`; de pagina met tegels
`Nu 100 W · Gemiddeld 248 W · Piek 520 W` en tijden
`03:51 · 09:51 · 15:51 · 21:51 · nu`, grafiek 392 px hoog.

### Vegen met de muis (punt 4)

Een scrollvak veegt niet met een muis; op de iPad deed de baan het al (met
scroll-snap). Nu: `pointerdown` met een muis of pen sleept de baan zelf
(snap uit tijdens het slepen, anders springt hij terug), en bij het loslaten
landt hij op de buur als er meer dan een vijfde van de breedte is gesleept.
De stippen eronder zijn knoppen geworden.

Gemeten met een echte sleep (`left_click_drag`) van x=900 naar x=1250, met
de automatische klok stilgezet: `pointerdown` en `pointerup` beide
`isTrusted: true`, de baan van mededeling 2 naar mededeling 1 ("2 van 3"
-> "1 van 3"), de stip mee.

### Het beheer (punten 1 en 8)

- De keuzes uit twee of drie (*Uiterlijk*, *Vorm van de foto's*, *Pagina
  Aanwezig*) zijn knoppen naast elkaar in de vormtaal van de kaart, geen
  `<select>` meer. Gemeten met een echte klik op "Eén lijst": `isTrusted`,
  de server op `lijst`, status "Opgeslagen 03:54"; daarna teruggezet.
- De keuzelijst die overblijft (*Blok toevoegen*) heeft een dichte
  achtergrond en de inkt van de kaart, ook op elke optie:
  `background rgb(18, 18, 15)`, `color rgb(232, 228, 222)`.
- "Alles dicht" heeft de waarde `geen`. Gemeten in HA's bewerkdialoog met
  echte kliks: keuzelijst open, "Alles dicht" gekozen, `config.open ===
  "geen"`, het voorbeeld met alle blokken dicht.

## Metingen aan de code

- Bundel op schijf en uit de server, ná het wissen van niets (de lader geeft
  een verse hash): 794.390 bytes, sha256 gelijk
  (`b3e13d3a…`; na de versiebump 82e5fb1f…, alleen de versiestring).
- JS: 1026 tests, alle groen (18 nieuw: `blokSchaal`, `pasLijst`, energie).
- Python: 664 tests, alle groen (2 nieuw: energie in de installatie, het
  energieblok in de indeling).

## Samenvatting

Acht punten, acht gedaan. De grootste: alles in een blok schaalt nu met de
maat van het blok, en lijsten vullen hun blok met even hoge rijen. Nieuw is
het blok Energie met een live lijn. De "geen verlichting toevoegen" bleek de
knop Bewerken die in een panel-view onder het scherm lag.

## Wat niet lukte

- Vegen met een **vinger** op de iPad is niet gemeten (geen aanraakscherm
  hier); de baan doet dat met scroll-snap, en die code is niet veranderd.
- Een **tellerstand** (kWh) staat alleen in de unittests; in de testinstance
  is met een vermogenssensor gemeten.
- Het beheer in Home Assistants **lichte thema** is niet gemeten; de
  testinstance draait donker. De keuzelijsten die het menu van de browser
  gebruikten zijn weg, en de laatste heeft een dichte achtergrond.
- De editor van het infoscherm op zijn eigen installatie: als het daar iets
  anders was dan de onbereikbare knop, dan is dat nog open.

## Aannames

1. "Ik kan geen verlichting toevoegen in de GUI-editor" is de knop Bewerken
   die in de panel-view niet te bereiken was. De editor zelf voegde lampen
   toe, met een gevulde en met een lege config.
2. "Een licht theme" bij de beheerderskaart is het menu van de
   browser-keuzelijst (de schermafdruk toonde die lijst).
3. De energiegrafiek is de afgelopen 24 uur, rollend; een tellerstand wordt
   verbruik per uur.
4. Lijsten vullen hun blok ook als er weinig items zijn: drie berichten in
   een hoog blok worden dan hoge berichten. Zo las ik "alles dezelfde
   grootte en passend".
5. De kop van een blok schaalt niet mee.

## git status --porcelain

Zie de commit; bij het schrijven van dit rapport:

```
 M SPEC.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/infoscherm/const.py
 M custom_components/domotiapp_lovelace/infoscherm/store.py
 M custom_components/domotiapp_lovelace/infoscherm/websocket.py
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/infoscherm-beheer-card.js
 M src/cards/infoscherm-card.js
 M src/cards/infoscherm-logica.js
 M tests/infoscherm/test_store.py
 M tests/js/infoscherm-logica.test.mjs
?? docs/infoscherm-ronde-4/
```
