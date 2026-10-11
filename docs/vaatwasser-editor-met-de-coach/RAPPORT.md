# 0.58.1 — De vaatwasserkaart met de coach: minder velden, geen vastzittende hoogte, en passend op een telefoon

Drie bevindingen van de eigenaar op 0.58.0, op 11 oktober 2026, doorgegeven
door de coach-sessie met zijn eigen woorden en schermafdrukken. Daarnaast
meldde hij dat de knoppen bij hem thuis werken: *"en de knoppen werken"*. De
coach zag om 20:38:49 "Morgen starten" binnenkomen (vrijgegeven, start morgen
om 11:00) en om 20:39:05 de intrekking.

## 1. Met het vinkje aan horen de velden van de coach weg

> *"ik heb de vaatwasser bij de coach ingevuld. Alleen lijkt mij dat deze
> sensoren invulvelden dan weg kunnen als ik het vinkje aan zet van de coach
> toch?"*
>
> *"en in een normale vaatwasser kaart zonder coach moet geplande start
> sowieso weg want die komt van de coach toch?"*

Op zijn schermafdruk stonden met het vinkje aan nog negen velden ingevuld
onder elkaar.

**Nu:**

| | Velden in de editor |
|---|---|
| zonder coach | Naam, het vinkje, Status, Resterende tijd, Voortgang, Programma, Start, Stop, Klep, Slimme sturing. **Geen Geplande start meer** |
| met de coach | Naam, het vinkje, het coachblok, alleen wat de coach NIET levert (bij hem: Voortgang), en een vinkje **Afwijken van de coach** |
| met Afwijken aan | daaronder een uitklapblok met wat de coach wel levert (status, resterende tijd, programma, start, stop, klep) |

Die vorm (een vinkje, en het blok eronder alleen als het aan staat) is wat hij
op 28 augustus 2026 voor de presets vroeg. Een blok dat een FUNCTIE aan of uit
zet, geen indeling.

**De coach wint van een veld dat je niet ziet.** Zijn oude velden staan nog in
de YAML. Zouden die blijven tellen, dan stuurt een veld dat hij niet meer kan
zien de kaart. Zonder Afwijken gaat daarom de coach voor; een ingevuld veld telt
alleen nog waar de coach niets levert. Met Afwijken aan gaat het veld uit de
editor voor, net als in 0.58.0. Met de coach gaat ook de startsensor van de
coach voor op een `planned_start` in de YAML.

Welke velden de editor toont, staat los in `editorVelden` (vaatwasser-logica.js).
Wat de coach levert leest de editor op dezelfde manier als de kaart: het
apparaat, de startsensor en `entiteiten`.

**Slimme sturing** staat met de coach nergens meer: Ingeruimd is de slimme
sturing, en de knop Slim staat dan niet op de kaart. Zonder coach blijft het
veld; daar zei hij niets over.

**Een `planned_start` die al in een YAML staat, blijft werken** zonder vinkje.
En de route van 0.47.0 (de startsensor van de coach vinden via Slimme sturing)
ook: alleen het veld is weg.

## 2. Handmatig een paar keer open en dicht: de kaart bleef groot

> *"klik ik nog een paar keer op handmatig dan krijg ik ineens dit groote en
> als ik dan de popup sluit en weer open dan is die weer normaal."*

**Oorzaak:** de pendeldemper in `rasterhoogte.js` (`stabielDoel`, er sinds
de melding over de printerkaart van 27 augustus 2026). Die herkent een opmaaklus aan twee hoogtes die om en om komen, en zet
de kaart dan vast op de grootste. Handmatig open en dicht is precies dat:
120, 248, 120, 248. Na drie wisselingen stond de kaart vast op 248, ook
dichtgeklapt. Sluiten en openen van de pop-up bouwde de kaart opnieuw, en
daarmee was de geschiedenis weg. Dat klopt met wat hij zag.

**Nu:** `bewusteWijziging(vak)` in `rasterhoogte.js` wist de geschiedenis van
dat vak. De vaatwasserkaart roept hem aan bij elke klik op Handmatig, vóór het
tekenen. Een lus die daarna alsnog ontstaat, wordt gewoon weer herkend.

**De lege strook**, op zijn tweede schermafdruk, met Handmatig open: gemeten
195 px inhoud. Dat is 11 boven drie rijen (184), dus vier rijen (248), met
28 px lucht boven en 25 onder. Met de coach staat er geen Slim meer, en dan
passen de programmakeuze en Start/Stop naast elkaar (`flex-wrap`): 144 px,
drie rijen. Op een smalle kaart lopen ze door naar een tweede regel. Met 6 in
plaats van 8 px ertussen past dat ook in drie rijen; met 8 kwam het op 185.

## 3. Op de telefoon liepen de knoppen niet lekker

> *"op de telefoon loopt de tekst niet helemaal lekker"* (iPhone, bubble-pop-up,
> ongeveer 380 breed: "Morgen …", "Handmat…")

Alleen iconen (de regel die er al was voor onder 320) is hier geen uitweg: een
vinkje, een driehoek en een hand zeggen samen niet wat er gebeurt. Dus in
stappen, en Handmatig geeft als eerste toe:

| Kaartbreedte | Ingeruimd/Morgen en Nu | Handmatig |
|---|---|---|
| boven 440 | icoon en woord | icoon en woord |
| tot 440 | icoon en woord | alleen het handje (naam in `aria-label` en `title`) |
| tot 340 | alleen het woord, 12px | alleen het handje |
| tot 290 | het korte woord: "Morgen", "Nu" | alleen het handje |

## Bewijs

### Tests

Nieuw: acht tests voor de velden in de editor en wie er wint, twee voor het
korte woord, en twee voor `bewusteWijziging`. Tegen 0.58.0 (`main`, ce71f7c):

```
vaatwasser-coach.test.mjs:
  ✖ laat de coach winnen van een veld dat nog in de editor stond
  ✖ laat zonder coach alles staan, behalve Geplande start
  ✖ laat met de coach alleen zien wat de coach niet levert: bij hem de voortgang
  ✖ laat een veld staan dat de coach niet heeft
  ✖ zet een programmasensor niet onder Afwijken: dat is geen keuzelijst
  ✖ toont met de coach geen Slimme sturing: Ingeruimd is de slimme sturing
ℹ tests 33   ℹ pass 27   ℹ fail 6

rasterpendel.test.mjs:
  ✖ laat een kaart weer krimpen na drie keer open en dicht door een mens
    TypeError: R.bewusteWijziging is not a function
ℹ tests 10   ℹ pass 9   ℹ fail 1
```

De twee tests voor het korte woord zijn later toegevoegd, en ook tegen 0.58.0
gedraaid:

```
  ✖ maakt van 'Morgen starten' 'Morgen' en van 'Nu starten' 'Nu'
  ✖ laat een woord dat al kort is staan
ℹ pass 0   ℹ fail 2
``` Drie tests zijn **REGRESSIEWACHT** en slagen ook op 0.58.0:
- met Afwijken gaat een veld uit de editor voor;
- een ingevuld veld blijft waar de coach niets levert;
- een echte pendel blijft vastgezet.

Op deze tak: `npm test` 1410 groen. Verify, registratie, controls en css zijn
groen.

### In de browser

Bundel steeds na het herladen van de config entry, met service worker en caches
gewist. `?v=` gelijk aan de sha256 op schijf (laatste: `4f2e6ee40915`).

**Zijn situatie nagebootst:** een kaart met het vinkje aan en alle oude velden
nog ingevuld, met de klep bewust naar iets anders dan de coach. De kaart volgt
de klep van de coach: "Klep open" als de coachklep open is en de oude dicht,
en "Klaar om te starten" andersom.

**Handmatig open en dicht**, tien echte kliks (`isTrusted: true`). De hoogte
volgt mee, gelezen met een `MutationObserver` op `--dac-raster` (de
`ResizeObserver` vuurt niet in een verborgen tabblad):

```
248px, 120px, 248px, 120px   (open, dicht, open, dicht)
eindhoogte dichtgeklapt: 120
```

**De open kaart, per breedte.** De echte kaart met de hand in de pagina
gehangen (valkuil 21), in vakken van 380, 320 en 280 breed:

| Breedte | dicht | open | op één regel | afgekapt |
|---|---|---|---|---|
| 500 (de view, echte klik) | 120 | 184 | ja | — |
| 380 | 120 | 184 | ja | niets |
| 320 | 120 | 184 | nee, twee regels | niets |
| 280 | 120 | 184 | nee, twee regels | niets |

Bij 380, 320 en 280 is Handmatig vanuit de pagina opengezet, en niet met een
echte klik. In het tabblad waar die kaarten hingen kwamen na een paar keer
herladen geen kliks meer aan; de hit-test raakte de knop wel. Dat Handmatig op
een echte klik opengaat, is in dezelfde ronde tien keer gemeten. Deze meting
gaat over de opmaak.

**De knoppen per breedte:**

| Breedte | Ingeruimd/Morgen | Nu | Handmatig |
|---|---|---|---|
| 380 | 148 px, icoon + "Morgen starten" (86 px tekst) | 148 px, icoon + "Nu starten" | 43 px, handje |
| 320 | 118 px, "Morgen starten" (83 px) | 118 px, "Nu starten" | 43 px, handje |
| 280 | 98 px, "Morgen" | 98 px, "Nu" | 43 px, handje |

Op 380 blijft er 18 px over in de knop, genoeg voor het iets bredere lettertype
van iOS. Een schermafdruk met de drie breedtes onder elkaar is gemaakt.

**De editor**, met echte kliks:
- Vinkje aan, alle oude velden in de YAML. Het schema is `name, coach,
  [DomotiApp Coach: coach_device], progress, afwijken, bare`.
- Afwijken aan (`ha-switch`, `isTrusted: true`). Daaronder komt het blok
  `[Afwijken van de coach: status, remaining, program, start, stop, door]`.
  Het voorbeeld toont meteen "Klep open": met Afwijken wint de oude klep weer.
- Naam "Keuken vaatwasser": 17 toetsen, allemaal `isTrusted: true`, de spatie
  ook.
- De kaart zonder coach: `name, coach, status, remaining, progress, program,
  start, stop, door, smart, bare`. Geen `planned_start`.
- Geen geneste sleutels in de config (valkuil 33). Gesloten met Annuleren.

**Regressiewacht:** de kaart zonder coach is 184 px, twee regels (keuzelijst,
dan Slim / Start / Stop), zonder het attribuut `coach`.

## Samenvatting

Met het vinkje aan toont de editor alleen nog wat de coach niet weet, met een
vinkje Afwijken voor wie toch iets anders wil. Zonder vinkje is Geplande start
weg. De kaart blijft niet meer groot na een paar keer Handmatig, en open past
hij in drie rijen. Op een telefoon worden de knoppen niet meer afgekapt.

## Wat niet lukte

- **Handmatig open op 380, 320 en 280 is vanuit de pagina gezet**, niet met een
  echte klik. In dat tabblad kwamen geen kliks meer aan (twee pogingen, en de
  hit-test raakte de knop wel). In een vers tabblad werkten kliks weer: de
  brede kaart is daar met een echte klik geopend, en de editor met echte
  kliks nagelopen.
- **Niet op een echte iPhone gemeten.** De breedtes 380, 320 en 280 komen uit
  de melding van de coach-sessie. Het lettertype van iOS is iets breder dan
  dat in Chrome op Windows; er is 18 px marge op 380.
- **Niet in een bubble-pop-up gemeten**: bubble-card staat niet in de
  testinstance. De oorzaak (de pendeldemper) zit niet in de pop-up, en de
  toets meet hem rechtstreeks.

## Aannames

- Dat zijn oude velden met het vinkje aan niet meer moeten tellen. Hij zei dat
  ze weg kunnen; een veld dat je niet ziet en dat toch stuurt, zou de volgende
  verrassing zijn.
- Dat Slimme sturing zonder coach mag blijven. Daar zei hij niets over.

## git status --porcelain

Vóór het vastleggen:

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/dishwasher-card.js
 M src/cards/vaatwasser-logica.js
 M src/rasterhoogte.js
 M tests/js/rasterpendel.test.mjs
 M tests/js/vaatwasser-coach.test.mjs
?? docs/vaatwasser-editor-met-de-coach/
```
