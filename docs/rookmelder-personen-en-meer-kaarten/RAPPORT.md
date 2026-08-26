# Vijf meldingen van 26 augustus 2026, ronde twee

De ochtendronde (`docs/feedback-26-augustus/`) leverde 0.11.0 op. Dit is wat er
diezelfde dag op terugkwam.

| # | Melding | Wat het geworden is |
|---|---|---|
| 1 | "als ik een enkele heb dan hebben de icons een omlijning dat moet niet" | het omhulsel om een meting is overal weg |
| 2 | "Slaapkamer B.G. kan er net niet helemaal op ... fix dat die naam er altijd op kan" | de naam breekt af in plaats van afgekapt te worden |
| 3 | personenkaart staat "iets te ver naar boven" | gemeten: 1,5px; gecorrigeerd tot 0,0 |
| 4 | "bij de tabs kaart kan ik nu maar 1 kaart toevoegen" | een tab draagt een LIJST kaarten, met een editor per kaart |
| 5 | "als ik op de rookmelder klik en weer terug blijft ie staan" | dat was geen hover maar `:focus-visible` na een dialoog |

---

## Meetopstelling

Home Assistant 2026.8 op poort 8127, dashboard `kaart-test`, view `navbalk`.
Verse code aangetoond zoals CLAUDE.md valkuil 2 en 15 voorschrijven: service
worker en caches gewist, daarna bundel `67c4c2bd591b` in de browser tegen
dezelfde hash op schijf.

Vijf rookmelderkaarten naast elkaar op verschillende breedtes (500, 246 en
161px), een personenkaart, en de tabbladenkaart uit de vorige ronde — die stond
nog in de oude vorm (`card`, enkelvoud) en is dus meteen de terugwaartse test.

---

## 5. De highlight die bleef staan — en dit keer was het niet de hover

Dit is het belangrijkste van deze ronde, want de diagnose van vanochtend was
maar de helft.

Vanochtend bleef een knop oplichten na een tik; dat was `:hover` op een
aanraakscherm, en dat is opgelost met een mediaquery. De navigatieknoppen doen
het sindsdien goed — dat bevestigde de eigenaar ook. Maar op de rookmelderkaart
bleef er iets staan, en dat is **een andere fout die er hetzelfde uitziet**.

Gemeten, na een echte klik op de kaart en het sluiten van de more-info-dialoog:

```
actief in de shadow root   .top
matches(":focus")          true
matches(":focus-visible")  true
outline                    2px solid rgb(25, 143, 217)      <- de accentkleur
```

Home Assistant zet de focus op het element dat de dialoog opende en **geeft die
focus terug** zodra de dialoog dichtgaat. Die teruggave is programmatisch, en
dan matcht `:focus-visible` — ook als je met je vinger begon. De ring uit
`theme.js` gaat dan aan en blijft staan tot je ergens anders tikt.

### De ring mag niet gewoon weg

Voor iemand die met het toetsenbord werkt is die ring het enige dat laat zien
waar hij staat. Er wordt daarom niet op de ring gestuurd maar op de **manier
waarop de focus binnenkwam**. In `DacCard` (dus in elke kaart in de familie
tegelijk):

- was de laatste handeling in deze kaart een tik of een klik, en matcht het
  element daarna alsnog `:focus-visible`, dan is dat een teruggave → focus eraf;
- kwam de laatste handeling van het toetsenbord, dan blijft alles staan;
- velden waarin je typt of kiest (`input`, `select`, `textarea`) blijven altijd
  met rust: die hebben hun focus nodig.

Een gewone muisklik raakt dit niet, en dat is óók gemeten. Klik op een echte
knop (de tabknop van de tabbladenkaart), met een luisteraar op de shadow root:

```
pointerdown   .nm
focusin       .tab      focus-visible: false      <- geen focusout erachteraan
na afloop     document.activeElement in de kaart: .tab
```

De knop houdt zijn focus, precies zoals een knop hoort te doen. En na de
dialoog:

```
actief in de shadow root   niets
matches(":focus")          false
matches(":focus-visible")  false
outline-style              none
```

## 1. Geen omlijning meer om een meting

Er zat een pil om elke meting — een vlak met een rand — die verdween zodra de
kaart smal werd. Dat gaf twee gezichten voor hetzelfde ding, en de eigenaar zag
het omlijnde gezicht terug op een kaart met één sensor.

Nu is er één gezicht: het icoon met zijn waarde. Gemeten op alle vijf de
kaarten, ongeacht breedte:

```
border      0px none
background  rgba(0, 0, 0, 0)
padding     0px
```

De uitkleedstap "haal het omhulsel weg" is daarmee overbodig geworden en is uit
`pasAan_()` verdwenen; wat overblijft is één stap (`krapper`: kleinere
tussenruimte en een halve punt kleiner) voordat de rij afbreekt.

## 2. De langste naam past

`white-space: nowrap` met een ellipsis maakte van "Slaapkamer B.G." een
"Slaapkamer B..." — en dan weet je niet welke kamer het is. De naam breekt nu af
over maximaal twee regels, en omdat de kaart sinds vanochtend meegroeit
(`rows: "auto"`) valt er niets meer af.

Gemeten met dezelfde naam op twee breedtes:

| kaartbreedte | regels | volledig zichtbaar |
|---|---|---|
| 246 px | 1 | ja |
| 161 px | 2 | ja |

## 3. De personenkaart stond 1,5 pixel te hoog

En dat is precies wat hij zag. De oorzaak: de ring om een avatar wordt met
`box-shadow` **buiten** de avatar getekend, en een box-shadow telt niet mee in
de afmetingen. Het blok dat gecentreerd wordt is dus 3px korter dan wat je ziet
— bovenaan steekt de ring eruit, onderaan houdt de naam op waar zijn regel
ophoudt.

```
                        vóór        ná
midden van de kaart     443,2      443,2
midden van wat je ziet  441,7      443,2
afwijking                -1,5        0,0
```

De correctie zit in de binnenmarge (boven een halve ring erbij, onder een halve
ring eraf) en niet in een marge op de inhoud. Dat is geen smaak: de **som**
blijft 8px, dus de kaart wordt er geen pixel hoger van — en deze kaart komt op
55 van de 56 pixels uit, dus daar is geen ruimte.

## 4. Meerdere kaarten in een tab

Een tab droeg één kaart. Een lijst werd tot één `vertical-stack` samengevouwen,
en dat betekende: wil je twee kaarten, maak dan eerst zelf een stack. Dat is
precies wat de eigenaar niet wilde, met een schermafdruk van Bubble Card erbij
waar het wél gewoon kan.

Nu draagt een tab een **lijst**, tekent de kaart die onder elkaar (met 8px
ertussen, dezelfde maat die Home Assistant zelf aanhoudt), en heeft de editor er
een blok per kaart voor: uitklappen om te bewerken, pijltjes om te verplaatsen,
een kruisje om weg te gooien, en "＋ Kaart toevoegen" eronder.

Geen `vertical-stack` eromheen: die brengt zijn eigen vlak en zijn eigen
tussenruimte mee, en dan staat er een kaart in een kaart in een tab.

**Terugwaarts.** `card` (enkelvoud) blijft gelezen worden — dat is de spelling
van `simple-tabs` én van onze eigen configs van vóór vandaag. De kaart in de
testinstance stond nog in die vorm en werd zonder ingreep als lijst van één
ingelezen; pas bij het opslaan werd het `cards`.

Gemeten met echte kliks in de bewerkdialoog:

```
vóór    tabs: [{name: "Woning", card: {…entities-card}}, …]
        editor toont: 1 kaartblok + "Kaart toevoegen"

klik "Kaart toevoegen" -> klik "Tegel"

ná      tabs: [{name: "Woning", cards: [{…entities-card}, {type: "tile", entity: "sensor.…"}]}, …]
        editor toont: "2 KAARTEN", twee blokken, twee hui-card-element-editors
        dialoogconfig: nog steeds custom:domotiapp-tabs-card
```

Die laatste regel is de val uit de vorige ronde: `hui-card-element-editor` vuurt
`config-changed`, en zonder `stopPropagation()` zou Home Assistant denken dat de
tabbladenkaart zelf een tegel geworden is. Met twee editors in beeld geldt dat
twee keer.

Na opslaan staan beide kaarten onder elkaar in de tab op het dashboard.

---

## Tests

```
npm test                   528 tests, 528 pass, 0 fail   (was 526)
npm run check:registratie  OK
npm run check:controls     OK
npm run check:css          OK
npm run verify             OK
```

De tabblad-tests zijn aangepast aan de nieuwe vorm en aangevuld. **Aantoonbaar
falend op de code van vóór deze ronde:**

```
$ node --test tests/js/tabs-logica.test.mjs      # met de oude tabs-logica
  ✖ neemt de vorm van simple-tabs over
  ✖ houdt een lijst kaarten een lijst
  ✖ laat een lijst van één een lijst van één
  ✖ laat `cards` winnen van `card` als er allebei staat
  ✖ gooit rommel uit de lijst
  ✖ maakt van rommel lege velden in plaats van undefined
  ✖ noemt een tab gevuld zodra er iets in staat
ℹ pass 20
ℹ fail 7
```

Vier daarvan zijn **NIEUW GEDRAG** (de lijst), drie zijn bestaande
**REGRESSIEWACHTEN** die meeveranderd zijn omdat de vorm van een tab veranderd
is — `card: null` is `cards: []` geworden.

## Wat niet lukte

- **De toetsenbordkant van de focusbewaker is niet end-to-end gemeten.** Tab
  bracht de focus in deze instance niet tot in een kaart: na elf aanslagen stond
  hij nog steeds in de schil van Home Assistant. Wat wél gemeten is: een gewone
  muisklik laat de focus staan (geen ring, geen ingreep), en de teruggave na een
  dialoog wordt weggehaald. De toetsenbordtak hangt aan één voorwaarde
  (`toets >= tik`) die in dezelfde functie staat.
- **Op een extreem smalle kaart wordt de naam alsnog afgekapt.** Twee regels is
  de grens; in de bewerkmodus, waar de kolommen smaller zijn dan op het
  dashboard, liep "Slaapkamer B.G." daar tegenaan. Op de breedtes die op een
  dashboard voorkomen (161px en breder) past hij.

## Aannames

- **Twee regels is genoeg voor een naam.** Meer zou de kop hoger maken dan de
  metingen eronder, en dan is het geen kop meer.
- **Een tab zonder kaarten blijft toegestaan.** Je maakt een tab meestal voordat
  je hem vult.
- **De kaarten in een tab staan met 8px ertussen**, dezelfde maat als tussen
  twee kaarten in een sectie.

## `git status --porcelain`

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/base.js
 M src/cards/person-card.js
 M src/cards/smoke-card.js
 M src/cards/tabs-card.js
 M src/cards/tabs-logica.js
 M src/editor/tabs-editor.js
 M tests/js/tabs-logica.test.mjs
?? docs/rookmelder-personen-en-meer-kaarten/
```
