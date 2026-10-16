# De receptie maakt zelf een ruimte (0.76.0)

16 oktober 2026. Bij een klant wilde de eigenaar de ruimtes instellen. In de
kaarteditor zei de keuzelijst *Ruimtes om te boeken* "Geen items
beschikbaar", want er bestond nog geen enkele agenda. Om dezelfde reden stond
Agenda niet in zijn zijbalk. Een beheersessie vroeg hem welke ruimtes het
moesten worden, en zijn antwoord was:

> *"De receptioniste moet dat zelf kunnen maken."*

Tot nu toe kon dat niet:
- een Lokale agenda toevoegen is een config flow, en dat mag in Home Assistant
  alleen een beheerder;
- de ruimtes stonden in de kaartconfig, en die kan ook alleen een beheerder
  bewerken.

## Wat er gebouwd is

### In het beheer, blok Ruimtes

- **Nieuwe ruimte**: een naam, dan Toevoegen of Enter. De server maakt een
  Lokale agenda met die naam en zet hem als ruimte op het scherm.
- **Weghalen**: alleen bij een ruimte die het beheer maakte. Na een
  bevestiging ("De ruimte verdwijnt van het scherm, en zijn agenda verdwijnt uit
  Home Assistant, met alle boekingen erin.") gaat de ruimte weg, en de agenda
  ook.
- **Een ruimte die de installateur in de kaartinstellingen koos** (bijvoorbeeld
  een agenda van Outlook) heeft geen knop om weg te halen, maar het woord
  "installateur".
- **Zonder ruimtes** zegt het blok: voeg hieronder een ruimte toe.

### Op de server

- `infoscherm/ruimtes/nieuw` (iedereen die het infoscherm mag beheren, ook
  zonder adminrecht, niet de kiosk) start de config flow van `local_calendar`
  (stap user, `create_empty`). Hij wacht tot de agenda er is en zet hem in de
  opslag met `gemaakt: true`. Bestaat er al een Lokale agenda met die naam, dan
  wordt DIE gekoppeld, zonder `gemaakt`; wat een ander maakte, haalt het beheer
  niet weg.
- `infoscherm/ruimtes/weg` weigert een ruimte zonder `gemaakt`. Bij een
  gemaakte haalt hij de config entry weg; de Lokale agenda verwijdert dan zelf
  zijn `.ics`.
- **De kaartconfig laat een gemaakte ruimte staan.** Bij de klant stond
  `rooms: []` in de kaartconfig, en zonder dit zou elke keer dat een beheerder
  het beheer opent de ruimte van de receptie weer weg zijn. Een agenda die de
  installateur kiest, komt erbij.
- **`gemaakt` mag een receptie-account niet zetten.** Anders kon ze een ruimte
  van de installateur "gemaakt" maken en daarna zijn agenda weghalen. Bij het
  opslaan van namen en volgorde blijft `gemaakt` zoals het was.

Dit is met opzet een kleine opening in het recht van Home Assistant: een
gewone gebruiker kan via ons één soort config entry maken, een Lokale agenda
met een naam, en alleen die van zichzelf weer weghalen.

`SPEC.md` 20.4 (rechten) en 20.7 (het blok Ruimtes) zijn bijgewerkt.

## Bewijs in een echte browser

Testinstance, als het **receptie-account** (`Receptie`, `is_admin: false`,
mag beheren) op `receptie.localhost:8127`, met het scherm als kioskaccount
ernaast. Verse code: `?v=3ec6321e34b5`, gelijk aan de sha256 op schijf.

- **Vooraf:** de twee ruimtes van de installateur staan er met "installateur"
  en zonder knop om weg te halen.
- **Toevoegen:** "Grote vergaderzaal" getypt (de spatie `isTrusted: true`),
  dan Enter (`isTrusted: true`). De melding: "Grote vergaderzaal staat erbij,
  met een eigen agenda." `calendar.grote_vergaderzaal` bestaat, in de opslag
  met `gemaakt=true`, en met een knop om weg te halen.
- **Op de iPad** stond hij er zonder herladen bij: "2 van 3 vrij", en Grote
  vergaderzaal op Vrij.
- **Weghalen:** echte klik op de knop, de bevestigingsvraag met de waarschuwing
  over de boekingen, en een echte klik op Weghalen. Daarna is de agenda weg,
  heeft de opslag weer twee ruimtes, en zegt de melding "Grote vergaderzaal is
  weggehaald."
- **Zijbalk:** zodra er agenda's zijn, staat Agenda er bij de receptie ook in.

## Tests

`tests/infoscherm/test_ruimtes_maken.py`, alles **NIEUW GEDRAG**, met de
**echte** Lokale agenda (`ical==14.0.1` erbij in `requirements-test.txt`, de
versie van HA 2026.8). De tests dekken:
- de receptie maakt een ruimte;
- er kan meteen in geboekt worden, en een dubbele boeking weigert de echte
  agenda;
- de kiosk mag het niet;
- een ruimte heeft een naam;
- een bestaande agenda wordt gekoppeld en niet weggehaald;
- weghalen haalt de agenda weg;
- de kaartconfig laat een gemaakte ruimte staan;
- de receptie kan van een ruimte van de installateur geen gemaakte maken.

Twee dingen die de tests boven brachten:
- **`slugify` maakt van "!!!" geen lege tekst.** Home Assistant geeft dan
  `"unknown"`. De server kijkt nu zelf of er een letter of cijfer in de naam
  staat.
- **Een schrijffout van de agenda gaf "Unknown error".** Een `OSError` (de
  Lokale agenda schrijft een `.ics`) wordt nu netjes gemeld.

In twee bestaande tests (`test_ruimtes.py`) staat bij een ruimte nu ook
`gemaakt: false`. Eén clienttest erbij voor de twee nieuwe aanroepen.

## Controles

- `npm run build`, `verify`, `check:registratie`, `check:css`,
  `check:controls`: groen.
- `npm test`: 1930 tests, alle groen.
- Python: 874 tests, alle groen (lokaal in Docker).

## Samenvatting

De receptie maakt een ruimte met alleen een naam, en kan hem ook weer
weghalen. Home Assistant krijgt er een Lokale agenda bij, zonder dat er een
beheerder aan te pas komt. De ruimtes die de installateur koos blijven van de
installateur.

## Wat niet lukte

Niets.

## Aannames (de beheersessie noemde ze een keuze voor de eigenaar)

- **De receptie mag een ruimte die ze zelf maakte ook weghalen**, en dan gaat
  de agenda met alle boekingen mee, na een duidelijke vraag. Wil je liever dat
  weghalen alleen loskoppelt en de agenda laat staan, dan is dat een kleine
  wijziging in `async_weg`.
- **Hernoemen** is de bestaande *Naam op het scherm*. De agenda in Home
  Assistant houdt zijn eerste naam.

## `git status --porcelain`

Schoon na de commit.
