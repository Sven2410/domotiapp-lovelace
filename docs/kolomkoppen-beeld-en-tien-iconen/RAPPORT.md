# Kolomkoppen, een beeldvorm, tien iconen — en een ronde zonder browser

Acht punten uit één avond. **Lees eerst "Wat niet lukte": deze ronde is niet in
een browser geverifieerd, en dat is een afwijking van de werkafspraak.**

| # | Melding | Wat het geworden is |
|---|---|---|
| 1 | "kan je controleren of je nog andere kaarten ziet met de schaduw?" | gecontroleerd; alle kaartvlakken liepen al via hetzelfde token |
| 2 | "een naam kunnen toevoegen aan een kolom van de entiteiten kaart" | `column_names` per rij, een kop boven elke kolom |
| 3 | "een entiteit met een afbeelding iets groter (…) een wifi kaart van maken" | een vierde vorm: **Beeld**, met instelbare afmeting |
| 4 | "en dat ik ze kan centreren nu zijn ze links uitgelijnd" | uitlijning per rij: links of midden |
| 5 | "ik kan een rolluik entity niet de naam aanpassen" | een naamveld per rolluik in de editor |
| 6 | "haal de optie om elke entiteit apart eruit" | uit de keuzelijst; bestaande configs blijven werken |
| 7 | tien ontbrekende iconen | getekend, met zoekwoorden en een plek in het raster |
| 8 | "als ik een subknop toevoeg moet hij beneden" | staat achteraan én wordt in beeld gebracht |

---

## 1. De schaduw: gecontroleerd, en er was niets meer te doen

Elke `box-shadow` in de bron langsgelopen. Er zijn er precies twee soorten:

**Kaartvlakken** — die gaan allemaal via `--dac-shadow`:

```
theme.js:104           .surface { box-shadow: var(--dac-shadow) }
header-card.js:81      .strip  { box-shadow: var(--dac-shadow) }
```

Elke kaart in de familie tekent zijn vlak met `.surface`; de kopkaart heeft zijn
eigen strip maar gebruikt hetzelfde token. Sinds 0.14.0 draagt dat token alleen
nog de haarlijn bovenlangs, dus **alle** kaarten zijn in één keer meegegaan --
inclusief de rolluikkaart waar hij later naar wees.

**De rest is geen kaartvlak** en houdt zijn schaduw met opzet:

| Waar | Waarom hij blijft |
|---|---|
| `navbar-card` (de balk en zijn menu) | die zweven boven de pagina; zonder schaduw plakken ze erop |
| `media/zoekscherm` (twee panelen) | idem, het zijn lagen over het dashboard |
| `slider.js` (de knop van de schuif) | een schaduwtje van 6px onder een greepje, geen vlak |

En de gekleurde gloed op een AAN-staande plek (`0 0 12px -3px` in de eigen
kleur) is geen slagschaduw: hij zit niet onder de kaart maar eromheen, en hij
staat er alleen als er iets aan is.

Kortom: er was niets meer te vinden. Dat is de uitkomst van het controleren, en
die hoort net zo goed opgeschreven te worden als een vondst.

## 2 en 4. Kolomkoppen en uitlijning

Een rij van de entiteitenkaart kan nu koppen boven zijn kolommen dragen, en zijn
inhoud links of gecentreerd zetten.

```yaml
type: custom:domotiapp-entities-card
columns: 2
column_names: [Ketel, Warmtepomp]
align: midden
items: [...]
```

Wat er in de logica bewaakt wordt, met tests:

- **Zoveel namen als kolommen.** Eén naam bij twee kolommen geeft `["Ketel", ""]`
  en niet een rij die verschuift. Drie namen bij twee kolommen wordt afgekapt.
- **Niets ingevuld is geen koppenrij.** `["", "  "]` levert `[]` op -- anders
  staat er een lege regel die de kaart wél een stuk hoger maakt.
- **De koppen kosten hun eigen regel**, en dat is in `kaartHoogte` verrekend:
  precies `KOP_H + GAP` erbij. Zonder dat komt de kaart op een halve rasterrij
  uit en schildert hij over zijn buurman (valkuil 8 en 12).

De koppen staan in een EIGEN raster met dezelfde kolommen, niet als eerste regel
in het bestaande raster: anders zouden ze meetellen in de rijhoogte van de
plekken eronder en even hoog worden als een knop.

## 3. De beeldvorm

Een vierde vorm naast Rij, Tegel en Compact: **Beeld**. De afbeelding van de
entiteit komt groot in beeld met de naam eronder, en de afmeting is instelbaar
van 48 tot 320 pixels (standaard 120).

Bedoeld voor alles wat je moet KUNNEN ZIEN in plaats van aflezen -- de
QR-code van je wifi, een plattegrond, een cameraplaatje. Vandaar ook
`object-fit: contain` op de foto in deze vorm: een QR-code die voor een vijfde
buiten beeld valt, is een QR-code die je telefoon niet meer pakt.

Zonder afbeelding blijft het icoon staan, op dezelfde maat, zodat de rij niet
verspringt zodra een entiteit even geen plaatje meldt.

De hoogte van de rij wordt uit die afmeting gerekend (`rijHoogte`), zodat de
kaart ook in deze vorm op hele rasterrijen uitkomt.

**Een val die de test ving.** `clampBeeld(null)` gaf eerst 48 in plaats van de
standaard 120: `Number(null)` is 0, en 0 klemt op de ondergrens. Dat is
letterlijk dezelfde val als bij `klemBalk` in de navbalk, die daar al met een
opmerking staat. Nu ook hier, met dezelfde opmerking erbij.

## 5. Een naam per rolluik

De KAART kende die naam al -- `nameOf(hass, cfg.entity, cfg.name)` staat er
sinds hij bestaat -- maar er was geen veld om hem in te typen: de editor had
alleen een meervoudige entiteitenkiezer.

Nu staat er onder de kiezer een tekstveld per gekozen rolluik, met dezelfde
steiger als de personenkaart al gebruikte: elk rolluik wordt een veld
`naam:<entity>` in het formulier, en `serialize` vouwt dat terug in
`covers: [{ entity, name }]`. Die steiger komt nooit in de YAML terecht.

## 6. "Om elke entiteit apart" is uit de lijst

Hij gebruikt in plaats daarvan "Alleen een rand, geen vulling". De keuze staat
niet meer in het uitklaplijstje.

**Maar de kaart begrijpt hem nog wel.** Een dashboard waar `surface: items` in
staat, verandert niet stil van vorm; dat zou een vorm van gegevensverlies zijn
die je pas ziet als je het dashboard opent.

## 7. Tien iconen

`beach` (strand), `sleep` (de zzz), `boiler` (ketelstatus), `pressure` (druk in
bar), `bell` (notificatie), `refill` (water bijvullen), `football`, `sports`
(een bal én een racket, zodat het niet één tak van sport wordt), `raceCar`
(Formule 1) en `cctv` (de bewakingscamera -- het bestaande `camera` is een
fototoestel en lijkt er niet op).

Allemaal op dezelfde lijndikte van 1.6, allemaal met zoekwoorden, en er is een
nieuwe groep **Sport en vrije tijd** in het raster bij gekomen.

Dat laatste is niet op mijn woord: `tests/js/icoon-zoek.test.mjs` heeft een
bewaker die van ELK getekend icoon eist dat het in `GROEPEN` én in `TERMEN`
staat, en dat er geen camelCase-sleutel als naam op het scherm komt. Die staat
groen. Zo weet ik zonder browser dat "formule 1", "zzz", "waterdruk" en
"bewakingscamera" alle tien iets vinden.

## 8. Een subknop komt onderaan

Hij werd al achteraan toegevoegd (`push`), dus de volgorde klopte. Wat er niet
gebeurde: het scherm bracht het nieuwe blok niet in beeld. De schuifbalk bleef
staan waar hij stond, en dan lijkt het alsof er bovenaan iets is bijgekomen.

Nu wordt het nieuwe blok na het bijmaken in beeld gescrold.

Zijn schermafdruk bevestigde dat achteraf: "Nieuwe subknop" staat er als
LAATSTE in de lijst, netjes boven de knop "Subknop toevoegen". De volgorde
klopte dus al; wat er ontbrak was dat je hem zag.

---

## Tests

```
npm test                   562 tests, 562 pass, 0 fail   (was 546)
npm run check:registratie  OK
npm run check:controls     OK
npm run check:css          OK
npm run verify             OK   (0.15.0)
```

Zestien nieuwe tests op `entities-logica.js`: de kolomnamen, de beeldmaat, de
uitlijning, de rijhoogte, wat `toRows` meedraagt, en de rekensom dat koppen een
regel kosten. Plus een **REGRESSIEWACHT** die eist dat een bestaande config
precies hetzelfde blijft: `align: "links"`, geen kolomnamen, `layout: "row"`.

**NIEUW GEDRAG**, aantoonbaar falend op de code van vóór deze ronde:

```
$ node --test tests/js/entiteiten-logica.test.mjs      # met de oude logica
SyntaxError: The requested module '../../src/cards/entities-logica.js'
             does not provide an export named 'BEELD_MAX'
ℹ pass 0
ℹ fail 1
```

## Wat niet lukte — en dit is de belangrijkste alinea van dit rapport

**Er is deze ronde NIETS in een browser geverifieerd.** De testinstance is
halverwege onbruikbaar geworden, en niet een beetje: Home Assistant bouwt in dat
browserprofiel geen enkele view meer op. Niet alleen onze dashboards -- ook het
automatisch gegenereerde dashboard van HA zelf, waar geen enkele kaart van ons
in staat, blijft leeg.

Wat is er geprobeerd, in deze volgorde:

1. `docker restart ha-lovelace` (vijf keer, met steeds een vers tabblad);
2. een nieuw tabblad, een nieuw tabgroep;
3. IndexedDB gewist (`hass-icon-db`, `workbox-expiration`);
4. een dashboard zonder onze kaarten.

Alle vier zonder resultaat. De oorzaak is vrijwel zeker het wissen van de
service worker en de caches uit valkuil 15/21: dat is precies waar het mee
begon. Wat er nog over is als middel -- de site-gegevens van dit origin volledig
wissen -- gooit ook de ingelogde sessie weg, en daar is het wachtwoord niet van
bekend.

Onderweg heeft dat me twee **onterechte** conclusies opgeleverd, die ik hier
noteer omdat ze anders in de logboeken blijven staan als feit:

- "de rookmelderkaart sloopt de hele view" -- onjuist;
- "de navbalkkaart sloopt de hele view" -- onjuist.

Beide zijn na een herstart weerlegd: die kaarten tekenden gewoon.

**Wat dat betekent voor deze ronde.** Alles wat zonder browser te controleren is,
is gecontroleerd: 562 unittests, de icoonbewaker, de CSS-bewaker, de
registratiebewaker, de controlbewaker en de bundelvergelijking. Wat NIET
gecontroleerd is, is hoe het eruitziet: de kolomkoppen, de beeldvorm, het
centreren, het naamveld op de rolluikkaart en de tien tekeningen zijn nooit op
een scherm geweest.

De eigenaar test elke ronde meteen zelf; dat is hier de eerste blik op deze
schermen. Dat is niet hoe het hoort, en het staat er daarom zo groot bij.

## Aannames

- **Kolomkoppen horen bij een RIJ en niet bij de kaart.** Een kaart kan meerdere
  rijen hebben met verschillende kolomaantallen; koppen op kaartniveau zouden
  daar niet op passen. Bij de platte configvorm (één rij) mogen ze wél op de
  kaart staan, want daar valt niets te verwarren.
- **48 tot 320 pixels is het bereik van een afbeelding.** Kleiner dan een chip
  heeft geen zin; groter dan 320 past niet op een halve kolom van een telefoon.
- **Een subknop achteraan is wat er bedoeld werd.** Zie punt 8.

## `git status --porcelain`

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/cover-card.js
 M src/cards/entities-card.js
 M src/cards/entities-logica.js
 M src/editor/entities-editor.js
 M src/editor/icoon-zoek.js
 M src/editor/navbar-editor.js
 M src/icons.js
 M tests/js/entiteiten-logica.test.mjs
?? docs/kolomkoppen-beeld-en-tien-iconen/
```
