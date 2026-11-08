# 0.114.0: de nieuwskaart

De eigenaar, 8 november 2026: *"Ik wil ook wat je bij de receptie hebt iets van NOS nieuws. Dat kan een popup zijn en dan
in de navigatiebalk dat ik hem toevoeg. Dus een nieuwskaart"*. En terwijl hij gebouwd werd: *"Ik zit dan te denken aan een
navigatie menu bovenaan zoals NOS, AD etc idk welke dat allemaal ondersteuenen en welke je aanklikt dan de sub
catogorienen zoals algemeen, sport etc"*.

## Wat er is

**DomotiApp Nieuws** (`custom:domotiapp-nieuws-card`):

- bovenaan een rij met de nieuwsbronnen;
- daaronder de rubrieken van de gekozen bron;
- daaronder de berichten: foto, titel (twee regels), bron en tijd ("12 min geleden").

Een tik op een bericht klapt de samenvatting open, met "Lees het hele bericht" (een nieuw tabblad). Er staat één bericht
tegelijk open. Beide rijen vegen opzij als ze niet passen, ook met een muiswiel. Wie van bron wisselt, houdt zijn rubriek
als de nieuwe bron die ook heeft.

Een eigen icoon **`nieuws`** (een krant), voor de knop in de navigatiebalk (`icon: nieuws`) en overal waar Home
Assistant een icoon tekent (`dai:nieuws`).

### Welke bronnen

Allemaal opgehaald en gelezen met de lezer van de integratie, op 8 november 2026:

| bron | rubrieken |
|---|---|
| NOS | Algemeen, Binnenland, Buitenland, Politiek, Economie, Tech, Opmerkelijk, Cultuur en media, Sport, Voetbal |
| NU.nl | Algemeen, Binnenland, Buitenland, Politiek, Economie, Tech, Wetenschap, Opmerkelijk, Entertainment, Sport, Voetbal |
| AD | Algemeen, Binnenland, Buitenland, Politiek, Economie, Tech, Wetenschap, Show, Sport, Voetbal, Auto's, Koken en eten, Gezond |
| RTL Nieuws, De Telegraaf, NRC, de Volkskrant | alleen het hoofdnieuws |

Niet erin, met reden:
- De Telegraaf gaf op elke rubriek-URL hetzelfde als op de voorpagina;
- RTL Nieuws heeft geen rubrieken (404);
- de regio van het AD en van de NOS gaven niets.

De Volkskrant geeft geen samenvatting mee; daar klapt een bericht open met alleen de link.

In de editor kies je welke bronnen er bovenaan staan (niets aangevinkt is allemaal) en hoeveel berichten (1 tot 15, standaard 10).

### Waarom de adressen op de server staan

Een commando van een kaart kan iedere ingelogde gebruiker sturen. Kreeg het commando een URL mee, dan kon iedereen met
een account Home Assistant een adres naar keuze laten ophalen, ook in het eigen netwerk. De kaart vraagt dus een bron en
een rubriek (`domotiapp_lovelace/nieuws`), en alleen `nieuws.py` kent de adressen. Een rubriek blijft een kwartier in het
geheugen: tien tablets halen hem één keer op. Bij een fout blijft staan wat er was, en mag het na een minuut opnieuw.
Het ophalen zelf is dat van het infoscherm (`async_haal_feed` in `infoscherm/feeds.py`, nu een losse functie).

## Bewijs

### Toetsen

- `tests/test_nieuws.py` (**NIEUW GEDRAG**, 6):
  - de kaart en de server kennen dezelfde bronnen en rubrieken;
  - een rubriek komt nieuwste eerst terug, met de naam van de bron;
  - een kwartier lang wordt een rubriek niet opnieuw opgehaald, en elke rubriek apart;
  - bij een fout blijft staan wat er was, en na een minuut mag het opnieuw;
  - een adres, een onbekende bron of een rubriek die de bron niet heeft wordt geweigerd, zonder op te halen;
  - de cache staat klaar na het opzetten.

  Op de code van vóór deze ronde: `ModuleNotFoundError: No module named 'custom_components.domotiapp_lovelace.nieuws'`.
- `tests/js/nieuws-logica.test.mjs` (**NIEUW GEDRAG**, 9): bronnen uit de config, de keuze bij het wisselen, elke rubriek
  een naam, aantal en veilige links. Op de oude code: `ERR_MODULE_NOT_FOUND`.
- Alles: JS 2347 en Python 1113 groen; `check:taal`, `check:css`, `check:registratie`, `check:controls`, `verify` groen.
  Het nieuwe icoon staat in `afbeeldingen/iconen.json` (`scripts/iconen-naar-paden.py`).

### In de testinstance (HA 2026.8.1, Playwright, echte internetfeeds)

View `nieuws` op `kaart-test`. De verse bundel draait (`?v=b7c0678e5765` gelijk aan schijf), na een herstart voor de
Python.

| stap | wat er stond |
|---|---|
| begin | NOS gekozen, de tien NOS-rubrieken, zes berichten met foto ("NOS · vandaag 16:52"), 568 hoog (op het raster) |
| tik op AD | AD gekozen, dertien rubrieken, berichten "AD · 9 min geleden" |
| tik op Sport | AD Sport |
| tik op NOS | Sport bleef gekozen, NOS Sport ("Alcaraz wint ook in Parijs ...") |
| tik op De Telegraaf | de rubriekenrij weg (één rubriek), zes berichten |
| tik op NU.nl, tik op een bericht | open, met de samenvatting en de link naar nu.nl |

- **Alle kliks hadden `isTrusted: true`.**
- **De pagina schoof niet:** `scrollY` bleef 0 bij het wisselen.
- **Een kaart met alleen NOS** heeft geen bronnenrij.
- **De navigatiebalk** met `icon: nieuws` en een tegel met `dai:nieuws` tekenen allebei de krant.
- **Licht thema:** in orde.
- **Telefoon (390):** 374 breed, op het raster.
- **Geen fouten** in de console.

## Wat niet lukte of niet gemeten is

- Niet in een echte Bubble Card-pop-up gezet (die staat niet in de testinstance); wel in een smalle kolom van 414 pixels,
  zo breed als zo'n pop-up op een tablet.
- Niet op een echte iPad, en niet bij de eigenaar.
- De editor is niet in de browser gemeten; hij heeft twee velden (een keuzelijst en een getal) en geen tekstveld.

## Aannames

- "Iets van NOS nieuws" plus "NOS, AD etc": de zeven bronnen hierboven, met de rubrieken die ze echt hebben.
- Wat er gekozen is, onthoudt alleen dat scherm tot het opnieuw laadt.

## git status --porcelain

Leeg na de commit.
