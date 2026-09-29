# De mediakaart die over de separator liep (0.48.1)

29 september 2026. Gemeld met een schermafdruk uit een pop-up: een tv-kaart met
een volumeregel en een bronknop, en de separator "Lampen" eronder dwars over die
twee regels heen. *"zoals je ziet overlapt de media kaart iets hij moet de
separator naar beneden drukken"*

## Wat er misging

De kaart kreeg van Home Assistant een vak van één rasterrij (56px), terwijl hij
zelf 120px tekende. De kaarten eronder staan op de rasterlijnen van dat vak, dus
de separator lag over de onderste helft van de kaart.

Zo'n vast vak komt van een `grid_options: {rows: N}` in de config. Het
formaatgreepje en de schakelaar *Automatische hoogte* in het tabblad Indeling
schrijven dat getal weg. Home Assistant klemt het tussen de `min_rows` en
`max_rows` die de kaart zelf opgeeft, en onze kaarten geven daar hun GEMETEN
hoogte op (valkuil 12). Dat klopt, maar Home Assistant vraagt het op wanneer hij
zelf wil, en daarna niet meer tot er ergens een toestand verandert. Kwam de vraag
op een moment dat de kaart zijn nieuwe hoogte nog niet gemeten had, dan bleef
het vak te klein.

Twee manieren waarop dat gebeurt, allebei nagespeeld:

1. **Bij het laden.** Home Assistant vraagt het op voordat de kaart gemeten
   heeft, en krijgt de schatting uit `getCardSize()`. Die schatting telde de
   regel met de bronknop niet mee, en ook niet het volume van een aparte
   geluidsentiteit (`volume_entity`).
2. **In een pop-up die dicht is.** Een kaart die verborgen staat meet nul, en
   houdt dan zijn oude maat. Gaat de tv aan terwijl de pop-up dicht is, dan
   blijft de kaart op één rij staan en hoort Home Assistant bij elke toestand
   "1". Gaat de pop-up open, dan meet de kaart zich opnieuw, maar Home Assistant
   vraagt er niet naar.

Bij hem thuis verandert er elke paar seconden wel een sensor, en dan herstelt het
zich. Maar tussen het openen van de pop-up en die volgende wijziging ligt de
separator over de kaart, en dat is wat de schermafdruk laat zien.

## De reparatie

**`rasterhoogte.js`: de kaart laat Home Assistant het opnieuw vragen.** Elke
sectie hangt aan elke `hui-card` een luisteraar op `card-updated` en tekent
zichzelf dan opnieuw, met een verse `getGridOptions()`. Onze kaart is een gewoon
kind van die `hui-card`, dus een gebeurtenis die vanaf de kaart opborrelt komt
daar langs.

- `opgegevenRijen(vak, schatting)` onthoudt wat Home Assistant het laatst hoorde.
  `minRijen_` in `base.js`, de scenekaart en de wekkerkaart gebruiken hem nu in
  plaats van `gemetenRijen`.
- `meetRaster` vuurt `card-updated` af als het aantal rijen VERANDERT en Home
  Assistant een ander getal had gehoord (`loopAchter`, `vraagOpnieuw`).
- Een kaart waar Home Assistant nooit naar vroeg, krijgt geen seintje. Dat is een
  kaart in een masonry-view of een stapel. Daar klemt niemand iets, en een
  masonry-view zou bij een seintje zijn kolommen herverdelen, waarna een
  camerabeeld dat verhuist opnieuw begint.

Dit geldt niet alleen voor de mediakaart maar voor alle zestien kaarten die hun
ondergrens meten: de veertien met `minRijen_`, plus de scene- en de wekkerkaart.

**De tabbladenkaart luistert zelf.** Die zet zijn kaarten in een eigen raster
van twaalf kolommen, en daar is geen sectie van Home Assistant om het seintje
op te vangen. Hij vangt het nu zelf op en roept `herijkIndeling_()` aan.

**De schatting van de mediakaart klopt nu.** `rijenVoor()` in `media-logica.js`
gebruikt dezelfde voorwaarden als `paintVolume_` en `paintExtra_`: de bronknop
telt mee, en het volume komt van de geluidsentiteit.

| geval | oude schatting | `rijenVoor` | gemeten |
|---|---|---|---|
| ontvanger met zenders | 1 | 2 | 120px = 2 |
| tv + soundbar (`volume_entity`) | 1 | 2 | 120px = 2 |
| ontvanger + volume + shuffle | 3 | 3 | 184px = 3 |

## Bewijs

### Unittests

Twee nieuwe bestanden, geen jsdom. Het vak in `rasterhoogte-melden.test.mjs` is
nagemaakt met precies wat `meetRaster` leest (de hoogtes van de kinderen, de
opmaak, de host van de shadow root), en `getComputedStyle` is voor die test
vervangen.

Tegen de code van vóór de fix (`git stash push -- src`):

```
  ✖ vuurt card-updated als Home Assistant een schatting kreeg die niet klopt
  AssertionError [ERR_ASSERTION]: één seintje: de kaart is 3 rijen, HA hoorde 2
  0 !== 1
  ✖ zwijgt zodra Home Assistant het goede getal heeft
  0 !== 1
  ✖ meldt het ook als de kaart KRIMPT
  0 !== 1
  ✔ laat een kaart waar Home Assistant nooit naar vroeg met rust — REGRESSIEWACHT

  ✖ telt de volumeregel mee als er alleen een bronknop op staat
  AssertionError [ERR_ASSERTION]: rijenVoor bestaat niet
  ✖ telt het volume van de soundbar mee, niet dat van de speler
  ✖ drie regels is drie rijen: speler, volume met bron, shuffle
  ✖ volgt de schakelaars in de editor
  ✖ de speakerbalk erbij blijft binnen drie rijen
  ✖ een speler die uit staat of weg is, is één rij
ℹ pass 1
ℹ fail 9
```

De `rijenVoor`-tests falen op de oude code op een ontbrekende functie. De oude
schatting stond inline in `getCardSize()`; wat die gaf voor dezelfde gevallen
staat in de tabel hierboven (1 waar het 2 moest zijn).

Op de nieuwe code: 10 van 10 groen. De hele suite: **1209 JS-tests, alle groen.**

### In een echte browser

Testinstance, HA 2026.8, view `kaart-test/overlap`: drie secties met de vorm
uit zijn pop-up (separator, tv-kaart, separator, lampen). De tv is
`media_player.lounge_room` uit de demo: bronknop "dvd" en een shufflerij,
samen drie regels (184px). Sectie 1 zonder `grid_options`, sectie 2 met
`grid_options: {columns: 12, rows: 1}`, sectie 3 dezelfde in een
tabbladenkaart.

**Verse code.** Config entry herladen, service worker en caches gewist, pagina
herladen. Bundel in de browser: 862.537 bytes, sha256 `457a615a0570...`, gelijk
aan die op schijf. (Na het ophogen naar 0.48.1 is de bundel opnieuw gebouwd;
alleen het versienummer erin verschilt.)

**Vóór de fix, bij het laden, sectie 2:**

```
separator-card: vak 672+56
media-card:     vak 736+120  kaart 736+184  rows=2
separator-card: vak 864+56                  <- 56px in de kaart
```

Met de hand een `card-updated` vanaf de kaart afgevuurd: `getGridOptions()`
werd twee keer opgevraagd, en het vak werd 736+184 met de separator op 928. Dat
was de proef of het seintje werkt, voordat er iets gebouwd werd.

**Na de fix, bij het laden:**

```
sectie 2:  media-card: vak 736+184  kaart 736+184  rows=3
           separator-card: vak 928+56                 928 = 736 + 184 + 8
tabblad:   media-card: vak 1328+184 kaart 1328+184 height=184px
           separator-card: vak 1520                   1520 = 1328 + 184 + 8
```

**Na de fix, de pop-up.** De sectie verborgen (`display: none`, zoals een
dichte pop-up), de tv aangezet, gewacht tot alles binnen was, en de sectie weer
getoond. Vanaf dat moment verandert er geen enkele toestand meer
(`zelfdeHass: true`), dus alleen het seintje kan Home Assistant laten hervragen:

```
1. zichtbaar, tv uit                vragen=2 seintjes=1   media-card: vak 736+56  kaart 736+56   rows=1
3. open, nog niet opnieuw gemeten   vragen=0 seintjes=0   media-card: vak 736+56  kaart 736+130  rows=1
                                                          separator-card: vak 800+56   <- door de kaart heen
4. na één paint()                   vragen=1 seintjes=1   media-card: vak 736+184 kaart 736+184  rows=3
                                                          separator-card: vak 928+56
```

Stap 3 is de schermafdruk: vak 56, kaart 130, separator erdoorheen. Het seintje
kwam van `domotiapp-media-card`, met `bubbles: true` en `composed: true`. Stap 1
laat ook het krimpen zien: de tv ging uit, de kaart werd één rij, en het vak
ging meteen mee.

In de tabbladenkaart hetzelfde: stap 3 vak 56 en kaart 130 met de separator op
1392, na één `paint()` vak 184 en de separator op 1520.

Geen fouten in de console.

## Samenvatting

- Een kaart met een vast aantal rijen in zijn config (formaatgreepje of
  *Automatische hoogte* uit) kon een vak krijgen dat kleiner was dan zijn
  inhoud, en dan liep hij over de kaart eronder. Dat gebeurde bij het laden en
  bij het openen van een pop-up.
- De kaart laat Home Assistant nu opnieuw vragen zodra de gemeten rijen afwijken
  van wat hij had opgegeven. Dat werkt in een sectie en in de tabbladenkaart, en
  geldt voor alle kaarten die groeien.
- De schatting van de mediakaart vóór de eerste meting telt de bronknop en de
  soundbar nu mee.
- CLAUDE.md, valkuil 8: `card-updated` stond daar als "werkt niet". Rechtgezet.

## Wat niet lukte

- **De pop-up met een ECHTE ResizeObserver.** Het testtabblad stond verborgen
  (`visibilityState: hidden`) achter het tabblad waar jij in keek, en in een
  verborgen tabblad vuurt een ResizeObserver niet. Het tabblad naar voren halen
  had jouw scherm overgenomen. Wat de waarnemer bij het openen doet, is met de
  hand gedaan: één aanroep van de eigen `paint()` van de kaart. Die eindigt met
  dezelfde `meetRaster` als de waarnemer. Het stuk "pop-up gaat open, waarnemer
  vuurt" is dus niet in deze ronde gemeten. De waarnemer zelf (`volgRaster`)
  is niet gewijzigd.
- **Bubble Card zelf.** Die staat niet in de testinstance. De dichte pop-up is
  nagebootst met `display: none` op de sectie.
- **Zijn eigen config** is niet uitgelezen, dus welk getal er bij hem in
  `grid_options` staat, weet ik niet. Dat er een getal staat is afgeleid: met
  `rows: "auto"` kan een kaart in een sectie niet over zijn buurman lopen.
- De Python-tests zijn niet lokaal gedraaid; er is geen Python gewijzigd, alleen
  het versienummer in `manifest.json`. CI draait ze.

## Aannames

- Dat zijn pop-up een bubble-card-pop-up in een sectie is (zo staan ze in zijn
  dashboard), en dat de kaart daar een vast aantal rijen in zijn config heeft.
- Dat Bubble Card een dichte pop-up zo verbergt dat de kaart nul meet. Doet hij
  dat anders (alleen verschuiven), dan is het laadgeval de oorzaak, en ook dat
  is gerepareerd.

## git status --porcelain

Bij het schrijven van dit rapport, vóór de commit:

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/alarm/alarm-card.js
 M src/base.js
 M src/cards/media-card.js
 M src/cards/media-logica.js
 M src/cards/tabs-card.js
 M src/rasterhoogte.js
 M src/scene/scene-card.js
?? docs/kaart-over-de-separator/
?? tests/js/media-rijen.test.mjs
?? tests/js/rasterhoogte-melden.test.mjs
```
