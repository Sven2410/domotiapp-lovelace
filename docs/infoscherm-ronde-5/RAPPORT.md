# Infoscherm ronde 5: de installatie in het beheer, de klok in het welkomblok, en de pagina Mededelingen

**Datum:** 10 september 2026
**Uitgave:** 0.40.0
**Tak:** `fase-45/infoscherm-ronde-5`

## Wat er gevraagd is

Twee berichten van de eigenaar op 10 september 2026, na het proberen van
0.39.0, met vijf schermafdrukken. Uit elkaar getrokken:

| # | vraag | waar het zit |
|---|---|---|
| 1 | "je hebt de GUI-editor precies andersom gebouwd": de installatie hoort in de editor van het **beheer**; het infoscherm is "één keer de kaart toevoegen en klaar, niks instellen" | de velden weer, energie, lampen, agenda's en kioskaccounts staan nu in de kaarteditor van het beheer; de beheerkaart stuurt ze naar de opslag; het infoscherm heeft geen editor en geen config meer |
| 2 | in een verlichtingsblok van 2×1 met "toon 4" passen er maar 2 | in een blok van één rij zijn lamp- en persoontegels een smalle regel (chip 22 px) |
| 3 | de energielijn is te gedetailleerd; "mooier en vloeiender"; bij Alles bekijken mag hij wél zo gedetailleerd | in het blok een vloeiende kromme door het gemiddelde per halfuur (`verdunReeks`, `vloeiendPad`); de pagina houdt elke meting |
| 4 | bij Mededelingen geen "Alles bekijken"; hij wil een pagina met alle meldingen overzichtelijk | pagina Mededelingen: alles wat nu geldt met de periode erbij, daaronder wat er klaarstaat |
| 5 | op de weerpagina moet de onderste rij (dagen) in het midden onder de bovenste (uren); de titel "De komende dagen" klopt niet, er staan ook uren van vandaag | dagen even breed als de uurvakken en gecentreerd; titel "Vandaag en de komende dagen" |
| 6 | bij energie "nu · afgelopen 24 uur" weg en het getal centreren | weg; het getal staat in het midden (verticaal in een laag blok, horizontaal in een hoog) |
| 7 | de kop Mededelingen en het icoon zijn niet meegekleurd zoals de andere koppen met een pagina | met de pagina (punt 4) is de kop een knop en dus gekleurd |
| 8 | "bovenin loze ruimte; de klok naar links, dat links het vak is met de klok en het logo; het logo linksboven" | de kop boven het raster is weg; het welkomblok draagt logo (linksboven), klok, datum en welkomtekst; de standaardindeling zet dat blok linksboven op 2×2 |
| 9 | (tweede bericht) "bij weer mag er ook wel de uurverwachting onder, nu is de kaart zo leeg" | in een weerblok van 2×2 viel de uurrij er net af en werd verborgen; nu gaat het blok iets kleiner (tot 72%) zodat hij past |

## Wat er gebouwd is

### De installatie in de beheerkaart (punt 1)

- `infoscherm-beheer-card.js`: de editor begint met Weerentiteit,
  Energiesensor, Lampen en schakelaars, Agenda's en (voor een admin)
  Kioskaccounts; daaronder de kaart zelf. De kaart stuurt die velden naar
  de opslag (`sync_`) zodra een beheerder hem ziet -- alleen als de config
  die velden heeft. Een beheerkaart zonder (een tweede, voor de receptie)
  laat de opslag met rust.
- Staat er in de config nog niets van de installatie (na de update: in
  0.39.0 stond hij in het infoscherm), dan vult de editor het formulier met
  wat er in de opslag staat. Niemand hoeft opnieuw te kiezen; zodra er iets
  wijzigt gaat het geheel mee de config in.
- `infoscherm-card.js`: geen editor, geen config; alles komt uit de opslag.
  Een oude `weather` of `lights` in de config wordt genegeerd.

Gemeten (de editor met de hand in de pagina, met een lege config): schema
`weather, energy, lights, calendars, kiosk_users, title, open, …`; na het
laden staan de vijf lampen, het weer, de energiesensor en de agenda uit de
opslag in het formulier (`gezaaid: true`). De kaart zelf, met de hand in de
pagina: config met 4 lampen -> opslag 4; een kaart zonder installatie ->
opslag blijft 4; config met 5 -> opslag 5.

### De klok in het welkomblok (punt 8)

Geen `.kop` meer in de template. Het welkomblok tekent het logo, de klok met
de datum (elke minuut in de bestaande elementen geschreven, dus het logo
knippert niet), en de welkomtekst met de openingsregel. Een laag of breed
blok (hoogte onder 150 px of breedte boven 560 px, via `container-type:
size`) zet ze naast elkaar, een hoog blok onder elkaar, alles links
uitgelijnd. De standaardindeling is nieuw: welkom 2×2 linksboven, weer en
openingstijden eronder, aanwezig en mededelingen en verlichting in het
midden, nieuws als kolom van 6 rechts (JS én Python). Een bestaande
indeling blijft staan: zijn welkomblok van 6×1 krijgt logo, klok en tekst
naast elkaar.

`welkom_logo` (standaard uit, want het logo stond in de kop) is vervangen
door `logo_verbergen` (standaard uit): het logo staat er, tenzij de receptie
het verbergt. Een oude opslag met `welkom_logo: false` verliest zo niet zijn
logo.

Gemeten op 1920×855 in een blok van 2×2: logo 6 px van de linkerrand van het
vak, klok "09:35", datum, tekst; geen kop meer (`.kop` afwezig).

### Alles wat verder gemeten is

| punt | meting |
|---|---|
| 2, verlichting 2×2 met toon 4 | 4 van 4, tegels 85 px; in de standaardindeling |
| 3, energieblok 2×1 | 49 krommen (`C`), 148 x-waarden, 0 keer terug in de tijd; getal verticaal in het midden (y 711 = y 711 van het vak), geen `.e-sub` |
| 5, weerpagina | titel "Vandaag en de komende dagen"; 8 uurvakken en 6 dagvakken allebei 192 px breed, midden van beide rijen op x=1088 |
| 4 en 7, mededelingen | kop en icoon `rgb(11, 138, 106)` (het accent van de testinstance); pagina met drie mededelingen, de eerste met "tot en met 20 september" |
| 9, weer 2×2 | uurrij zichtbaar (4 uren) op `--pas` 0,965, onderrand 1 px boven de rand van het vak |
| aanwezig 2×3, 8 personen | 8 van 8, tegels 75 px, niets afgesneden |
| nieuws 2×6, toon 6 | 6 van 6, rijen 115 px |

**Eén ding dat daarbij naar boven kwam:** de vloeiende kromme (Catmull-Rom)
gaf een lus waar metingen dicht op elkaar stonden naast een groot gat (vijf
waarden binnen een minuut, dan 23 uur niets). Daarom gaat ook een korte
reeks eerst op het gelijke rooster van 48 vakken, en mogen de stuurpunten
niet terug in de tijd. Bewaakt met een test.

### Bundel en tests

- Bundel op schijf en uit de server: 799.682 bytes, sha256 gelijk
  (`15c8d625…`; na de versiebump alleen de versiestring anders).
- JS: 1033 tests, alle groen (7 nieuw). Python: 664 tests, alle groen
  (aangepast: `logo_verbergen`, standaardindeling).

## Samenvatting

Negen punten, negen gedaan. De installatie zit nu in de kaarteditor van het
beheer en het infoscherm is "toevoegen en klaar"; de kop boven het raster is
weg en het welkomblok draagt logo, klok en tekst; er is een pagina
Mededelingen; de energielijn in het blok is vloeiend en het getal staat in het
midden; de weerpagina is gecentreerd met een kloppende titel; in een blok
van één rij passen vier lampen; en de uurverwachting past in een weerblok
van 2×2.

## Wat niet lukte

- De editor van het beheer is met de hand in de pagina gemeten, niet in HA's
  bewerkdialoog: het tabblad stond de hele ronde op `hidden` (de eigenaar
  werkte in Chrome), en dan laadt Home Assistant zijn dialoog niet (valkuil
  40). De velden en het vooraf invullen zijn wel echt.
- Een kWh-teller is alleen in de unittests gemeten.

## Aannames

1. "Alle meldingen overzichtelijk" is: wat nu geldt, uitgeschreven, met de
   periode; daaronder wat er nog komt. Verlopen mededelingen staan er niet.
2. Het logo staat standaard in het welkomblok; wie het niet wil zet
   "Logo op het scherm verbergen" aan.
3. In een laag of breed welkomblok staan logo, klok en tekst naast elkaar;
   in een hoog blok onder elkaar.
4. Het getal van energie staat in een laag blok links naast de lijn
   (verticaal gecentreerd) en in een hoog blok boven de lijn, gecentreerd.

## git status --porcelain

```
 M CLAUDE.md
 M SPEC.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/infoscherm/store.py
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/infoscherm-beheer-card.js
 M src/cards/infoscherm-card.js
 M src/cards/infoscherm-logica.js
 M tests/infoscherm/test_store.py
 M tests/js/infoscherm-logica.test.mjs
?? docs/infoscherm-ronde-5/
```
