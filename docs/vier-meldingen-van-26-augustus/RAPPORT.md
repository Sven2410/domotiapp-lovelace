# Vier meldingen van 26 augustus 2026

Vier losse dingen, in één ronde afgewerkt. Eén ervan was iets anders dan het
leek.

| Wat hij meldde | Wat het bleek te zijn |
|---|---|
| "Het scherm past niet lekker op mobiel, maak hem passend en kleiner" | De bevestigingsvraag rekende zijn padding NIET mee in zijn breedte |
| "Bij de kleuren staat er accent en automatisch. Ik wil dat dat helemaal weg is" | Gedaan — de kleurkiezer is uit alle editors weg op één na |
| "De naam staat niet in het midden als ik beeld selecteer" | De kolomkoppen kregen de uitlijning van hun rij niet mee |
| "Op een andere telefoon worden de scenes niet geladen — Unknown command" | **Niet Android en niet de gebruiker: een wedloop met het opstarten van Home Assistant** |

Uitgave **0.17.0**. Alles hieronder is in een echte browser met echte kliks
nagemeten (Home Assistant 2026.8.3, bundel `9d59a9920158`, gelijk aan de hash op
schijf).

---

## 1. "De scenes konden niet geladen worden. Unknown command."

Dit is de belangrijkste van de vier, want de diagnose die erbij zat klopte niet.

Zijn vermoeden was Android, en daarna de gebruiker: het toestel dat het niet
deed had een gewone account, geen beheerdersaccount. Allebei nagemeten in een
echte instance met twee echte logins — een beheerder en een gewone gebruiker:

```
als BEHEERDER          success: true, drie scenes, drie leden
als GEWONE GEBRUIKER   success: true, drie scenes, drie leden
```

Geen verschil. Dat kán ook niet: Home Assistant houdt zijn
WebSocket-commando's in één register voor de hele installatie, niet per
verbinding en niet per gebruiker.

**Wat het wél is.** De commando's van deze integratie worden geregistreerd op
het moment dat de config entry wordt opgezet. Tot dat moment kent Home Assistant
`domotiapp_lovelace/scenes/get` eenvoudigweg niet en antwoordt hij
`unknown_command: Unknown command.` — precies de tekst van de schermafdruk.

Gemeten door meteen na een herstart te vragen, zo snel als de websocket het
toeliet:

```
[  3.36s] websocket open
[  3.36s] FOUT — unknown_command: Unknown command.
[  3.87s] OK — scenes geladen
```

Een halve seconde op deze kale testinstance. Op een installatie met veel
integraties is dat venster veel langer. **Wie het eerst terug is na een
herstart, verliest**: de companion-app op een telefoon verbindt onmiddellijk
opnieuw en tekent het scherm dat openstond; een laptop die later wordt
opengeklapt is te laat om het te merken. Dat verklaart ook waarom het op de ene
telefoon wél deed en op de andere niet, en waarom er die avond een
herstartvraag op zijn scherm stond.

En daarna bleef het staan, want **de kaart vroeg het nooit opnieuw**.

### Wat eraan gedaan is

`src/herkansing.js`: herkennen dat een fout "nog niet klaar" betekent, en met
oplopende tussenpozen opnieuw vragen — 0,4s, 1s, 2s, 4s, 8s, 15s, 30s, 30s,
30s, samen ruim twee minuten. Twee foutcodes tellen mee:

- `unknown_command` — de wedloop hierboven;
- `not_allowed` mét onze eigen tekst "is niet geladen" — het commando bestaat,
  de opslaglaag nog niet. Dat gebeurt tussen het herladen en het opnieuw
  opzetten van de entry.

Een `not_allowed` die over rechten gaat wordt met opzet NIET opnieuw geprobeerd:
dat wordt niet beter van nog een poging.

Zolang er nog pogingen over zijn blijft de kaart **laden** in plaats van een
fout te tonen. Zijn ze op, dan staat er de fout mét een knop **Opnieuw
proberen**. Dezelfde herkansing zit op de wekkerkaart, die hetzelfde soort
commando gebruikt en dus dezelfde wedloop kan verliezen.

### De meting, met een echte kaart in een echte browser

De integratie uitgezet, en toen een verse scenekaart neergezet — precies de
toestand van zijn telefoon:

```
na 1,5 s   toestand: laden   melding: "DomotiApp Lovelace is niet geladen"
           poging: 3, en er mag nog
```

Daarna de integratie weer aangezet, en verder niets aangeraakt:

```
+2 s   laden   (poging 6)
+4 s   laden   (poging 6)
+6 s   KLAAR — 3 scenes, 3 leden, teller terug op 0
```

**De code van vóór deze ronde**, in hetzelfde tabblad, met de herkansing
uitgezet:

```
ZONDER herkansing:  toestand: fout — "DomotiApp Lovelace is niet geladen"
en die bleef staan, ook nadat de integratie er weer was
```

Dat is het verschil, gemeten en niet beredeneerd.

### Wat hij zelf kan doen

Op zijn eigen installatie hoeft hij niets te doen behalve 0.17.0 installeren.
Ziet hij die melding vóór de update nog eens: het dashboard opnieuw laden
verhelpt hem, want dan is Home Assistant intussen klaar met opstarten.

---

## 2. De bevestigingsvraag paste niet op een telefoon

Niet de maten waren het probleem, maar `box-sizing`.

De vraag stond op `width: min(420px, 100%)` met 22px padding — maar zonder
`box-sizing: border-box` telt die padding niet mee. Op een scherm van 390
CSS-pixels werd dat vak dus 350 + 44 padding + 2 rand = **396 breed in een laag
die er 350 te geven had**. Hij liep over zijn eigen marge heen en raakte allebei
de schermranden. Dat is de schermafdruk die hij stuurde.

Gemeten in een venster van 500 pixels breed, met de herstartvraag echt open:

```
VOOR   466 breed, 159 hoog, 17px marge links en rechts
NA     340 breed, 141 hoog, 80px marge links en rechts
```

Wat er veranderd is: `box-sizing: border-box` (dat is de reparatie), en daarnaast
kleinere maten omdat hij daar ook om vroeg — 340 in plaats van 420, padding
16/18, kop 15,5px, tekst 13px, knoppen kleiner. De marge om het vak heen houdt
nu rekening met de inkeping van het toestel (`env(safe-area-inset-*)`).

---

## 3. De kolomkoppen stonden niet boven hun afbeelding

De koppen boven de kolommen stonden in een eigen raster, maar kregen de vorm en
de uitlijning van hun rij niet mee. Bij de **beeldvorm** staat de afbeelding
altijd in het midden van zijn vak — dat is wat die vorm ís — en dan is een kop
die links blijft plakken scheef ten opzichte van het enige dat eronder staat.

Gemeten aan de tekst zelf (niet aan het vakje eromheen — dat is de hele kolom
breed, dus daar zie je niets aan):

```
VOOR  text-align: start    kop staat 47, 46 en 56 px naast het midden van zijn afbeelding
NA    text-align: center   1, 0 en -1 px
```

Daarbij hoort nog iets: de knop **Uitlijning** is bij de beeldvorm verborgen.
Hij deed daar niets — de afbeelding staat toch altijd in het midden — en een
knop die "Links" zegt terwijl je iets in het midden ziet staan, liegt. Met echte
kliks op de vormknoppen:

```
Vorm = Beeld    Uitlijning: verborgen   Grootte van de afbeelding: zichtbaar
Vorm = Rij      Uitlijning: zichtbaar   Grootte van de afbeelding: verborgen
```

---

## 4. Grootte en zichtbaarheid van een kaart in een tabblad

> "In het visuele kaart toevoegen werkt nu, dat is top, alleen mis ik deze
> editor om de kaart size aan te passen en zichtbaar ook. De configuratie komt
> links in de GUI editor te staan dus we moeten even kijken hoe we dit gaan
> oplossen."

Dat "links" is het antwoord op zijn eigen vraag. Home Assistant zet zijn drie
tabbladen — Configuratie, Zichtbaarheid, Indeling — bovenaan de hele dialoog,
maar die dialoog is bij ons al bezet: daar staat de tabbladenkaart zelf in. De
kaart ÍN een tab wordt een regel lager bewerkt, en daar horen zijn eigen drie
tabbladen dus ook.

### De elementen zijn te leen, net als het bewerkgereedschap

Gemeten in een open kaartdialoog:

```
hui-card-element-editor      gedefinieerd
hui-card-visibility-editor   gedefinieerd
hui-card-layout-editor       gedefinieerd
```

Beide laatste vuren `value-changed` met de **volledige nieuwe kaartconfig** erin
(`{...config, visibility}` en `{...config, grid_options}`), dus verwerken gaat
precies zoals bij de gewone editor.

**Eén val zat erin, en die is met echte kliks gevonden.** Deze twee elementen
tekenen zich uit hun eigen `config`, niet uit die van ons. Gaven we de nieuwe
config niet terug, dan werd de voorwaarde wél opgeslagen maar bleef er "er zijn
geen zichtbaarheidsvoorwaarden ingesteld" staan — en dan denk je dat het niet
gelukt is en druk je nog een keer. Gemeten, gerepareerd, opnieuw gemeten.

### Maar een schuif die niets doet is erger dan geen schuif

De editor is het halve werk. Een tabblad bewaarde `grid_options` en `visibility`
die niemand las: de kaarten in een tab stonden gewoon onder elkaar, met
`createCardElement`, en dat element weet van geen van beide.

Daarom twee dingen erbij:

- **De kaarten in een tab gaan door `hui-card`** — het element waar Home
  Assistant zelf elke kaart in een sectie in zet, en de plek waar zichtbaarheid
  wordt afgehandeld. Nagemeten met een voorwaarde die niet klopte:
  `hidden` werd `true` en de hoogte 0, waar een kale `createCardElement` de
  kaart gewoon liet staan. In het VOORBEELD van de editor staat `preview` aan,
  want een kaart die op dit moment verborgen zou zijn moet je wel kunnen
  aanwijzen.
- **Een tab is een raster van twaalf kolommen**, hetzelfde raster als een sectie
  van Home Assistant. `src/cards/tab-indeling.js` rekent `grid_options` om naar
  een plek daarin. Een kaart zonder keuze staat op alle twaalf, dus een bestaand
  tabblad ziet er precies zo uit als eerst.

### De metingen

**Indeling**, met een echte sleep aan de breedteschuif:

```
wrapper in het voorbeeld:  grid-column: span 6, height: 56px
breedte:                   222 van de 452 px  (de helft van de tab)
na Opslaan, op het dashboard: nog steeds de helft
```

**Zichtbaarheid**, met echte kliks door de hele keten — Voeg voorwaarde toe →
Entiteitsstatus → entiteit `Test lamp rgb` getypt en gekozen → Status = Aan →
Opslaan:

```
lamp uit   de tegel is WEG uit het tabblad
lamp aan   de tegel staat er weer, en nog steeds op de halve breedte
```

Dat laatste zonder iets aan te raken: het is een levende voorwaarde, geen
eenmalige.

---

## De kleurkiezer

> "Dan bij de kleuren. Nu staat er accent en automatisch. Ik wil gewoon dat dat
> helemaal weg is."

De kleurkiezer is weg uit **alle** editors: de entiteitenkaart (per plek), de
navbalk (per knop), de tabbladenkaart, de mediakaart, de rolluikkaart, de
scheidingskaart, de klimaatkaart en de kopkaart. Kleur op deze kaarten is
identiteit, en de identiteit is het accent van het merk.

**Eén plek houdt hem: de afvalkaart.** Daar ís de kleur de bak — een grijze
kliko naast een groene naast een oranje is geen versiering maar de enige manier
om te zien welke bak er woensdag aan straat moet. Ook daar staat er geen
"Automatisch" en geen "Accent" meer: één vakje dat de systeemkleurkiezer opent,
een veld voor wie liever typt, en een knop om hem leeg te maken. Leeg betekent
dat de kaart zelf kiest.

**Bestaande dashboards veranderen niet van uiterlijk.** Een `tone` die al in een
config staat wordt gewoon getekend. En een kaart die nog een oude paletkleur
draagt, houdt zijn eigen vakje met de juiste kleur en de Nederlandse naam erbij
— gemeten met `solar`: *"Kleur: Oranje"*, vakje gevuld met `var(--dac-solar)`.
Zo draagt geen enkel dashboard een kleur die nergens meer te zien of weg te
klikken is.

Zeg je het woord, dan gaat hij ook bij de afvalkaart weg.

---

## De proeven

```
npm test                   612 tests, 612 pass, 0 fail   (was 589)
npm run verify             OK   (0.17.0, 478453 bytes)
npm run check:registratie  OK
npm run check:controls     OK
npm run check:css          OK
pytest -q                  526 passed
```

De nieuwe tests, allebei **NIEUW GEDRAG** en allebei aantoonbaar niet te draaien
op de code van vóór deze ronde (de modules bestonden niet):

| Bestand | Wat het vastlegt |
|---|---|
| `tests/js/herkansing.test.mjs` | welke fouten "nog niet klaar" betekenen, de oplopende wachttijden, niet twee tellers tegelijk, terug naar nul na een geslaagde poging, stoppen als de kaart van het scherm gaat |
| `tests/js/tab-indeling.test.mjs` | `grid_options` naar een plek in het raster: hele breedte zonder keuze, klemmen op 1 tot 12, 56/120/184/248 bij een gekozen aantal rijen, en géén vaste hoogte bij "auto" |

```
$ mv src/herkansing.js weg && node --test tests/js/herkansing.test.mjs
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../src/herkansing.js'

$ mv src/cards/tab-indeling.js weg && node --test tests/js/tab-indeling.test.mjs
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../src/cards/tab-indeling.js'
```

---

## Nieuw: de testinstance draait nu ook op de MacBook, zonder Docker

Er staat geen Docker op de MacBook, en dat hoeft ook niet: Home Assistant
draait daar gewoon in een virtualenv.

```bash
python3.14 -m venv venv
./venv/bin/pip install "homeassistant==2026.8.*"
./venv/bin/hass -c ./config          # poort 8127, zoals altijd
```

Twee dingen die daarbij zijn tegengekomen:

- **De demo-integratie start niet op macOS**: `camera.py` wil `libturbojpeg`,
  die er niet is, en dan valt de hele entry om — inclusief de demolampen.
  Drie sjabloonlampen in `configuration.yaml` doen hetzelfde werk. En let op:
  het oude `light: - platform: template` bestaat niet meer, het moet onder de
  eigen `template:`-sleutel.
- **`hass` herstart zichzelf niet.** De service `homeassistant.restart` laat het
  proces afsluiten en verwacht iets dat hem weer start; een lusje van drie
  regels eromheen is genoeg.

Ook de **Python-tests draaien er gewoon** (526 groen), dus daar is de omweg via
Docker niet meer voor nodig.

---

## Wat niet lukte

Niets. Alle vier de meldingen zijn afgewerkt en nagemeten.

## Aannames

Eén, en die staat hierboven al: bij *"ik wil gewoon dat dat helemaal weg is"* is
de afvalkaart als uitzondering aangehouden, omdat de kleur daar de inhoud is en
niet de versiering. De rest van de kleurkiezers is wél overal weg.

## `git status --porcelain`

```
(leeg — alles gecommit)
```
