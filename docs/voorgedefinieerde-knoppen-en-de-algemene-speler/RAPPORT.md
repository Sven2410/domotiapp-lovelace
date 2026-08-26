# Voorgedefinieerde knoppen, een algemene mediaspeler — en het veld dat je eruit gooide

Elf punten uit één avond, en deze ronde is **wél** in een echte browser
geverifieerd. De testinstance is vanzelf hersteld (zie "De testinstance"
onderaan); elke meting hieronder komt van een echte klik of een echte
toetsaanslag op `localhost:8127`.

| # | Melding | Wat het geworden is |
|---|---|---|
| 1 | "ik wordt er telkens uit gegooid met typen" | de echte oorzaak gevonden en weg |
| 2 | "de kolom titels werken niet, ook niet bij de qr codes" | zelfde oorzaak; ze blijven nu staan |
| 3 | "de tekst moet wat groter en wit zijn van die titel" | 14px in volle inkt, gemeten |
| 4 | "ik kan geen kaart toevoegen" (tabbladen) | twee bugs, allebei weg |
| 5 | "een voorgedefineerde subknop DomotiTech" | keuzemenu achter "Subknop toevoegen" |
| 6 | "een voorgedefineerde subknop die restart home assistant callt" | idem, mét de vraag ervoor |
| 7 | "de kleuren er uit, alles op automatisch en accent" | het palet is twee vakjes |
| 8 | "een vinkje dat het een algemene mediaspeler wordt" | speakerbalk + speakerscherm |
| 9 | zeventien iconen | getekend, plus het DomotiTech-logo ingebakken |
| 10 | "kan ik helpen met je testinstantie?" | niet meer nodig — hij doet het weer |

---

## 1 en 2. Waarom je eruit vloog, en waarom de kolomkoppen niet bleven staan

Dit was **één** fout, en hij zat op een plek waar je hem op het scherm nooit
zou zoeken.

Home Assistant duwt de config die een editor wegschrijft bij **elke
toetsaanslag** terug door `setConfig`. De entiteiten-editor herkent zijn eigen
echo door te vergelijken: leest hij de binnenkomende config in en kleedt hij hem
weer uit, komt er dan precies uit wat hij zelf wegschreef? Zo ja: niets doen.
Zo nee: opnieuw opbouwen — en dan verdwijnt het veld waar je in staat te typen.

Het inlezen liet de nieuwe eigenschappen vallen. Deze regel:

```js
for (const items of groepen) uit.push(vul({ columns: row.columns, layout: row.layout, items }));
```

`columns` en `layout` gaan mee. `align`, `image_size` en `column_names` niet.
Dus: wat eruit ging kwam er ánders in terug, elke aanslag opnieuw, dus elke
aanslag een complete herbouw. En omdat de kolomnamen bij het inlezen sneuvelden,
bleven ze ook niet staan — niet op een gewone rij, en niet op de QR-vorm.

Eén oorzaak, twee klachten die op niets met elkaar te maken leken.

**Wat er nu staat.** Alle eigenschappen van een rij gaan mee. Kolomkoppen alleen
op de eerste groep als een handgeschreven rij van vijf entiteiten in stukken
uiteenvalt — drie keer dezelfde kop is onzin.

**En het rekenwerk staat nu los van het scherm.** `naarRijen`, `uitgekleed` en
`vul` zijn uit de editor gehaald naar `src/editor/entities-rijen.js`. Niet uit
netheid: dit is precies het soort fout dat in een Node-test in één regel te
vangen is en op een dashboard drie dagen kost.

### Wat er in de browser gemeten is

Het naamveld van kolom 1 bevatte "Begane grond". Daar is met **echte
toetsaanslagen** " en de hal" achter getypt — inclusief drie spaties:

```
waarde:           "Begane grond en de hal"     (alle tien tekens aangekomen)
focusNogInVeld:   true                          (het veld hield de cursor)
herbouw:          0                             (de editor bouwde NIET opnieuw op)
alleTrusted:      true                          (11 keydowns, allemaal isTrusted)
spatie-keydowns:  3x  {isTrusted: true, doel: INPUT.k0}
```

En het voorbeeld ernaast liep live mee:

```
koppen in het voorbeeld:  ["Begane grond en de hal", "1e verdieping"]
```

## 3. De koppen zijn groter en wit

Gemeten op de kaart, niet op het oog:

```
font-size:   14px            (was 11px)
color:       rgb(232,228,222)   = --dac-ink, de volle inkt   (was --dac-ink-3)
font-weight: 600
```

Hoofdletters zijn eraf: "BEGANE GROND" op 14px leest als een sectiekop van het
dashboard, en dit is een kop van een kolom.

De regelhoogte is óók gemeten — 22,4px — en `KOP_H` in `entities-logica.js` is
op 22 gezet in plaats van op een geschat getal. Daar hangt de rasterhoogte aan
(valkuil 8 en 12). De twee testkaarten kwamen daarna uit op **120px en 248px**:
precies twee en vier rasterrijen, `min_rows` 2 en 4.

## 4. "Ik kan geen kaart toevoegen" — twee bugs

**Bug één: de kaartencache werd nooit geleegd.** `DacCard.setConfig` gooit de
hele shadow-DOM weg en bouwt opnieuw op. De gebouwde kindkaarten stonden in een
`Map` die dat niet wist, en `bouw_()` haakte af op "die heb ik al". Gevolg: na de
eerste wijziging in de editor bleef een tab **leeg**. Dus ook: een kaart
toevoegen die daarna niet verscheen. De cache wordt nu geleegd bij elke nieuwe
config.

**Bug twee: een lege tab had helemaal geen knop.** De editor zei "voeg er een toe
in het voorbeeld hiernaast" en hiernaast stond een leeg vak met een zin erin.
De knop stond alleen in de tak voor tabs die al kaarten hadden.

Dat repareren kostte drie pogingen, en de derde is de leerzame:

1. De knop meteen bij het tekenen erbij zetten. **Werkt niet**: Home Assistant
   bouwt het voorbeeld en de editor los van elkaar, en de editor is er dan nog
   niet.
2. Een herkansing van een halve seconde. **Werkt niet**: de editor komt later.
   Gemeten — met de hand aangeroepen ná die halve seconde verscheen de knop wél.
3. Een herkansing van drie seconden die op de **dialoog** wacht in plaats van op
   de editor, en het vak elke ronde opnieuw opzoekt. **Werkt.**

Die laatste helft is de val die er echt in zat: de eerste versie hield een
verwijzing naar het vak vast en toetste `vak.isConnected`. Bij de eerste opbouw
hangt de kaart nog niet in het document, dus `isConnected` was `false`, dus de
herkansing stopte meteen — en kwam nooit meer terug. Nu wordt het vak elke ronde
opgezocht, en de editor pas bij de KLIK.

**Gemeten in de browser:** de knop "＋ Kaart toevoegen" staat in het voorbeeld
van een lege tab, opent HA's eigen "Toevoegen aan dashboard", en na het kiezen
van een kaarttype staat die kaart in de tab met de knop eronder.

## 5 en 6. Kant-en-klare subknoppen

"Subknop toevoegen" is een menu geworden:

| | |
|---|---|
| **Lege subknop** | zoals eerst; komt **onderaan**, in de volgorde waarin je ze maakt |
| **DomotiTech** | logo, naar `https://domotitech.nl`; komt **bovenaan** |
| **Herstart Home Assistant** | roept `homeassistant.restart` aan, met de vraag ervoor; komt **bovenaan** |

De twee kant-en-klare knoppen komen bovenaan omdat ze een vaste plek in het menu
zijn, zoals op je schermafdruk. Een lege maak je zelf en die hoort onderaan —
dat was de melding van gisteren.

Ze staan als **data** in `navbar-logica.js`, niet in de editor: een typefout in
`homeassistant.restart` merk je anders pas als je erop drukt.

**Gemeten:** het menu klapt open met de drie regels; een klik op DomotiTech zet
hem op index 0:

```
sub: [DomotiTech, DomotiTech, Herstart, Auto]     (de nieuwe vooraan)
```

### De bevestiging is er zelf een, en dat is met opzet

Eerste opzet: HA's eigen `dialog-box` openen met een `show-dialog`-signaal. Dat
is wat `showConfirmationDialog` intern doet. Toen gemeten:

```
customElements.get("dialog-box")   ->  undefined
```

Op een vers geladen dashboard bestaat dat element helemaal niet — het wordt lui
geladen. HA's dialoogbeheerder doet dan `document.createElement` op iets dat er
niet is, en er gebeurt niets. Een herstartknop die soms wel en soms geen vraag
stelt is precies het soort ding dat je één keer op de verkeerde manier ontdekt.

Dus: `src/vraag.js`, een eigen scherm in de vormtaal van de familie. De focus
staat op **Annuleren** en niet op OK — wie op Enter ramt hoort niets
onomkeerbaars te doen. Naast het vak klikken is annuleren, nooit bevestigen.

**Gemeten in de browser:** klik op Herstart → de vraag verschijnt ("Weet je het
zeker dat je Home Assistant wilt herstarten?") → Annuleren → dialoog weg,
`get_config().state` nog steeds `RUNNING`. Geen herstart.

`confirmation` zit op `runAction` en niet op de knop, dus hij werkt overal waar
een actie draait — ook op een tikactie van een entiteit.

## 7. De kleuren eruit

De kleurkiezer bood negen identiteitskleuren aan plus een kleurenwiel. Nu twee
vakjes: **Automatisch** en **Accent**. De eigen kleur zit ingeklapt achter
"▸ Eigen kleur" — die is de uitweg voor de huisstijl van een klant of een kliko
in de kleur van de gemeente, en die weghalen zou functie kosten in plaats van
rust opleveren.

**Een kleur die al in een config staat krijgt zijn eigen vakje terug** zolang hij
gekozen is. Hem stil verbergen zou betekenen dat een dashboard een kleur draagt
die nergens meer te vinden of weg te klikken is.

## 8. De algemene mediaspeler

Een vinkje **"Algemene mediaspeler"** zet er een balk boven de kaart met de naam
van de speler waarop je afspeelt. Erop tikken opent een scherm met alle speakers
in huis, met per regel wat er speelt en de huidige gemarkeerd als NU.

**"De inhoud moet hetzelfde blijven" is wat de vorm bepaalde.** De kaart wordt
niet iets anders — hij krijgt er een keuze bovenop. De truc is klein met opzet:
de gekozen speaker wordt de `entity` van de kaart. Alles wat er al was — de
knoppen, het volume, de bron, Music Assistant, groeperen — hangt aan die sleutel
en werkt daardoor ongewijzigd mee. Wat er in de YAML staat blijft ongemoeid.

De keuze staat in `localStorage`, net als bij de tabbladenkaart: kies je op je
telefoon de keuken, dan mag de tablet in de gang op de woonkamer blijven staan.
Een onthouden speaker die niet meer bestaat telt als niets onthouden.

Instelbaar: **welke** speakers je mag kiezen.

**Bijstelling nog dezelfde avond (0.16.1).** "Ik wil alleen dat hij Music
Assistant-speakers laat zien, nu zie ik ook Apple TV." Terecht: "alle
mediaspelers in huis" leverde ook de televisie en de streamer op, en daar stuur
je geen muziek naartoe. Music Assistant markeert zijn eigen spelers met
`mass_player_type`, en dat is precies het onderscheid dat je hier wilt.

Twee dingen die daarbij horen:

- **Draait er geen Music Assistant, dan valt hij terug op alles.** Anders is de
  keuzelijst leeg en lijkt de kaart stuk terwijl er niets stuk is.
- **Vul je de lijst zelf in, dan is dat de lijst** -- wat er ook in staat. Wie
  een Apple TV in zijn keuzelijst wil, kan hem erin zetten.

Gemeten in de browser, met de vlag op twee van de acht demo-spelers gezet:

```
alle mediaspelers in de instance:  8
met de Music Assistant-vlag:       [media_player.bedroom, media_player.kitchen]
wat de kaart aanbiedt:             [media_player.bedroom, media_player.kitchen]
op het scherm:                     "2 speakers" -- Bedroom en Kitchen
```

**Gemeten in de browser:**

```
na een klik op "Kitchen":
  config.entity            media_player.kitchen     (wat de kaart bedient)
  ruwe config              media_player.lounge_room (wat in de YAML staat)
  balk / naam op de kaart  Kitchen
  localStorage             media_player.kitchen

na een volledige herlading:
  config.entity            media_player.kitchen     (de keuze overleefde het)
```

## 9. Zeventien iconen

`floorHeating` (vloerverwarming), `heatPump` (warmtepomp), `qr`, `siren`,
`sirenOff` (sirene uitzetten), `petrol` (benzine), `diesel`, `gas`,
`fuelStation` (tankstation), `homeThermo` (klimaat in de woning), `homeStatus`
(woning status), `lounge`, `dumbbell` (sportschool), `storage` (opslag/dozen),
`celsius`.

Allemaal op dezelfde lijndikte van 1.6, allemaal met Nederlandse zoekwoorden, en
er zijn twee nieuwe groepen bij: **Verwarming en klimaat** en **Auto en tanken**.

En het **DomotiTech-logo**, als zestiende. Dat is geen getekend pad maar het
bestand zelf, ingebakken als data-URI. Een merk teken je niet na op onze
lijndikte, en `currentColor` heeft er niets te zoeken — het logo draagt zijn
eigen kleuren. Dat mag: iconen zijn de uitzondering op de kleurregel in
`CLAUDE.md`.

De bewaker in `tests/js/icoon-zoek.test.mjs` eist van elk getekend icoon een plek
in het raster én zoekwoorden. Die staat groen, dus "warmtepomp", "sportschool",
"tankstation" en "qr-code" geven allemaal resultaat.

## De testinstance

**Hij doet het weer.** Zonder ingrijpen: het browserprofiel dat een paar uur
eerder geen enkele view meer bouwde, bouwde vanavond weer alles. Dat betekent
ook dat de diagnose van die middag niet klopte — het lag niet aan iets
onherstelbaars, het lag aan iets tijdelijks. Hulp is dus niet nodig geweest.

Wat er onderweg wél scherper geworden is: **valkuil 9 is erger dan hij stond.**
Een view heeft na een harde herlading niet "seconden" nodig maar tot ruim
**tien** seconden, zeker in bewerkmodus. Twee keer op een lege view gekeken die
er kort daarna gewoon stond. Dat staat nu met dat getal in `CLAUDE.md`.

---

## Tests

```
npm test                   589 tests, 589 pass, 0 fail   (was 562)
npm run check:registratie  OK
npm run check:controls     OK
npm run check:css          OK
npm run verify             OK   (0.16.1)
pytest                     526 passed
```

Nieuwe suites: `tests/js/entiteiten-rijen.test.mjs` (de echo-lus van de
entiteiten-editor) en `tests/js/media-speaker.test.mjs` (de algemene speler),
plus negen tests op de kant-en-klare subknoppen.

**NIEUW GEDRAG**, aantoonbaar falend op de code van vóór deze ronde. De oude
`naarRijen` teruggezet en de nieuwe suite ertegenaan gedraaid:

```
$ node --test tests/js/entiteiten-rijen.test.mjs     # met de oude code
  x houdt kolomkoppen, uitlijning en beeldmaat vast
  v blijft staan als hij zijn eigen uitvoer opnieuw inleest
  x leest de platte configvorm net zo goed
  x zet de koppen alleen boven de eerste van een opgeknipte rij
  v laat een rij zonder afwijkingen ook zonder sleutels
  v gooit lege plekken en lege rijen weg
i pass 3
i fail 3

  AssertionError: Expected values to be strictly deep-equal:
  + actual - expected
    [
      {
  -     align: 'midden',
```

De drie die slagen zijn **REGRESSIEWACHTEN**: die bewaken gedrag dat er al was.
Let op de tweede — "blijft staan als hij zijn eigen uitvoer opnieuw inleest"
slaagt óók op de oude code, want daar sneuvelden de kolomnamen aan *beide*
kanten even hard. Stabiel, maar fout. De eerste test is degene die dat aantoont.

## Wat niet lukte

Niets van wat gevraagd is. Wel drie dingen om te weten:

- **De bevestigingsdialoog is de onze en niet die van Home Assistant.** Hij ziet
  eruit als de familie en niet als HA. Reden staat bij punt 6; de HA-dialoog was
  aantoonbaar niet beschikbaar.
- **"Om elke entiteit apart" (`surface: items`) staat nog steeds niet in de
  keuzelijst** maar wordt nog wel begrepen. Dat was de afspraak van gisteren.
- **De speakerkiezer groepeert nog niet.** Hij kiest waar je afspeelt; samen
  laten spelen zit nog steeds in het zoekscherm van Music Assistant, waar het al
  zat. Een echte Sonos-kaart doet dat op één scherm. Als je dat erbij wilt, is
  dat een volgende ronde.

## Aannames

- **"Altijd bovenaan" gaat over kant-en-klare knoppen, niet over alle
  subknoppen.** Een lege subknop komt onderaan (jouw melding van gisteren), een
  DomotiTech of Herstart bovenaan (jouw schermafdruk van vandaag). Zo is het
  gebouwd; klopt dat niet, dan is het één regel.
- **"De kleuren eruit" betekent het aanbod, niet het vermogen.** Bestaande
  dashboards met `tone: solar` veranderen niet van kleur, en de eigen kleur
  bestaat nog — ingeklapt.
- **Een algemene mediaspeler biedt standaard ALLE mediaspelers aan.** Dat is wat
  "algemeen" betekent. Wil je een korte lijst, dan vul je die in.

## `git status --porcelain`

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/entities-card.js
 M src/cards/entities-logica.js
 M src/cards/media-card.js
 M src/cards/media-logica.js
 M src/cards/navbar-card.js
 M src/cards/navbar-logica.js
 M src/cards/tabs-card.js
 M src/editor/entities-editor.js
 M src/editor/icoon-zoek.js
 M src/editor/navbar-editor.js
 M src/editor/tabs-editor.js
 M src/editor/tone-picker.js
 M src/ha.js
 M src/icons.js
 M src/index.js
 M tests/js/navbar-logica.test.mjs
?? dev/domotitech.png
?? docs/voorgedefinieerde-knoppen-en-de-algemene-speler/
?? src/editor/entities-rijen.js
?? src/media/spelerkiezer.js
?? src/vraag.js
?? tests/js/entiteiten-rijen.test.mjs
?? tests/js/media-speaker.test.mjs
```
