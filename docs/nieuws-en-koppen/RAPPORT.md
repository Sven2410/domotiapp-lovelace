# De nieuwskoppen weer gewoon, en een eigen tekst per blok (0.75.0)

16 oktober 2026. Drie meldingen van de eigenaar, kort na elkaar.

## 1. "waarom is dit zo groot, het blok staat op 5 tonen"

Met een schermafdruk: een nieuwsblok met drie berichten in koppen van twee keer
de gewone maat, en "nog 12" in de kop.

**Oorzaak: een fout van mij in 0.73.0.** Het boekscherm van de ruimtes kreeg
een regel `.b-titel { font-size: calc(32px * var(--s)) }` (b van boeken). Maar
`.b-titel` was al de titel van een nieuwsbericht (b van bericht, 15px). De
nieuwe regel stond later in het stijlblad en won, dus de nieuwskoppen werden 32
in plaats van 15 pixels. Ze pasten niet meer: drie in een blok dat op vijf
stond. Dat zat in 0.73.0 en 0.74.0.

**Reparatie:** alles van het boekscherm heet nu `rb-` (ruimte boeken). Het
voorvoegsel kwam nog nergens voor, en het nieuws heeft `.b-titel` weer voor
zich alleen. Met de andere nieuwe klassen uit 0.73.0 en 0.74.0 (`ruimte`, `r-`,
`wf-`, `boek`) is niets mis: die zijn nagelopen tegen het stijlblad van vóór
0.73.0 en bestonden daar niet.

**Gemeten** (scherm als kioskaccount, nieuwsblok 2×4 op 5):

| | 0.74.0 | 0.75.0 |
|---|---|---|
| berichten getoond | 3 ("nog 12") | 5 ("nog 10") |
| lettergrootte titel | 28,6 px | 14,4 px (15 × de schermschaal) |
| kop van het blok | 15,3 px | 15,3 px |
| verkleining om te passen (`--pas`) | 0,932 | geen |

Het boekscherm zag er na het hernoemen precies zo uit: titel 30,7 px, de
toetsen 61 px hoog, en geen enkele `b-`-klasse meer.

**Bewaking:** `tests/js/infoscherm-css.test.mjs` telt in het stijlblad van het
infoscherm de regels die met één losse klasse beginnen, en faalt als een klasse
er twee heeft. Op 0.74.0 faalt hij, op `.b-titel`. Een samengestelde regel
(`.blok.klein .bericht`) telt niet: dat is een uitzondering op een bestaande, en
dat mag. Ook valkuil 75 in CLAUDE.md.

## 2. "nu zegt elk blok meer bekijken maar dat vind ik niet toepasselijk"

In de kop stond bij elk blok "Alles bekijken". Nu zegt elk blok wat je erachter
vindt of kunt doen:

| blok | tekst |
|---|---|
| Weer | Verwachting |
| Mededelingen | Alles lezen |
| Aanwezig | Aan- en afmelden |
| Nieuws | Meer nieuws |
| Verlichting | Bedienen |
| Agenda | Hele dag |
| Verjaardagen | Het hele jaar |
| Energie | Overzicht |
| Afvalkalender | Kalender |
| Klimaat | Bedienen, of "Alle airco's" als bedienen op het scherm uit staat |
| Ruimtes | Boeken als er een code is, anders Planning |
| Wifi | Groot tonen |

Alles hooguit zestien tekens (getoetst). Gemeten op het scherm: van alle zeven
koppen met een knop is de titel heel (niet afgekapt) en staat de knop binnen de
kop. De breedste is "Aan- en afmelden" met 127 px, in een blok van twee breed.
De tekst van Ruimtes en Klimaat verandert mee met de stand. Daarom wordt hij
bij elke tekening gezet, en niet alleen bij het bouwen van de kop.

`SPEC.md` 20.7 noemde "Alles bekijken" letterlijk. Dat is bijgewerkt, omdat
de eigenaar er zelf om vroeg.

## 3. "en hoe kies ik ruimtes? (...) In mijn sidebar is agenda sowieso weg"

De keuzelijst *Ruimtes om te boeken* zei "Geen items beschikbaar". Dat klopt:
er was nog geen enkele agenda. Een ruimte is een Lokale agenda, en die moet eerst
gemaakt worden. Home Assistant zet Agenda pas in de zijbalk als er een agenda
is, dus ook dat volgt daaruit. Er is niets stuk.

- **Gevraagd aan de beheersessie:** de eigenaar helpen. Eerst vragen welke
  ruimtes het zijn, dan per ruimte een Lokale agenda, die in de beheerkaart
  zetten, en de code laten kiezen.
- **In de kaart:** het blok Ruimtes in het beheer zegt nu, zolang er geen
  ruimtes zijn, stap voor stap wat er moet gebeuren. Tot nu toe stond daar
  alleen "Er zijn nog geen ruimtes gekozen".

## Controles

- `npm run build`, `verify`, `check:registratie`, `check:css`,
  `check:controls`: groen.
- `npm test`: 1929 tests, alle groen.
- Python: niets aan veranderd sinds 0.74.0 (864 groen); CI draait ze.

## Samenvatting

De nieuwskoppen zijn weer 15 pixels, en een blok op vijf toont er vijf. Dat
was een botsende klassenaam van mij uit 0.73.0, en een toets bewaakt dat
voortaan. Elk blok heeft een eigen tekst in de kop. Bij ruimtes zonder agenda
zegt het beheer nu hoe je ze aanmaakt.

## Wat niet lukte

Niets.

## Aannames

- De teksten in de tabel hierboven zijn mijn keuze. Wil je er een anders, dan
  is dat één regel in `MEER`.

## `git status --porcelain`

Schoon na de commit.
