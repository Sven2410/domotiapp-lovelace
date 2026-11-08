# 0.116.0: de agendakaart

De eigenaar, 8 november 2026: "Ik wil dat de klant ook zelf een agenda kan aanmaken en evenementen etc kan maken. Of een
bestaande toevoegen zoals google of apple".

## Wat er is

**DomotiApp Agenda** (`domotiapp-agenda-card`):

- De afspraken van de komende dagen, per dag ("Vandaag", "Morgen", "Donderdag 24 december"). Elke afspraak heeft een
  streep in de kleur van zijn agenda, met de tijd, de titel, en eronder de plaats en de agenda.
- **+ Afspraak**: titel, agenda (pillen, alleen agenda's die het kunnen), hele dag (dan van en tot en met), datum,
  begin, eind, plaats en omschrijving.
- **Een tik op een afspraak** opent hem, met Wijzigen en Verwijderen als de agenda dat kan. Bij een herhalende afspraak
  gaat dat alleen over deze keer.
- **De knop met de agenda's** toont welke er op de kaart staan, en wat elke agenda kan: lezen en schrijven, lezen en
  afspraken maken, of alleen lezen. Daar voegt de klant er een toe:
  - een **nieuwe agenda** in Home Assistant (Lokale agenda), om in te lezen en te schrijven;
  - **Google Agenda**, met het geheime adres in iCal-indeling, met de stappen erbij. Alleen te lezen;
  - **Apple iCloud** via CalDAV, met de Apple ID en een app-specifiek wachtwoord. Te lezen, en er kan een afspraak bij.
- Wat de klant zelf toevoegde, kan hij er daar ook weer af halen, met een bevestigingsvraag.
- Editor: titel, agenda's, dagen vooruit (standaard 14, tot 60), en of de klant agenda's mag toevoegen.

**Overzichtskaart:** de agenda's die de klant zelf toevoegde, staan er ook op. Een tik op een afspraak opent nu hetzelfde
scherm als op de agendakaart, in plaats van het venster van Home Assistant.

## Keuzes die ik maakte

- **Google alleen lezen.** De volledige Google-koppeling vraagt een eigen project bij Google met OAuth-sleutels. Dat is
  werk voor de installateur, en het werkt niet als de klant zelf op een knop drukt. Het geheime iCal-adres werkt voor
  iedereen. Wie de volledige koppeling heeft (de eigenaar zelf), kiest die agenda gewoon in de editor; dan kan de klant
  er ook afspraken in maken en verwijderen, want Google kan dat in Home Assistant (`supported_features` 3).
- **Apple via iCloud CalDAV.** Lezen en een afspraak maken; wijzigen en verwijderen kan de CalDAV-integratie van Home
  Assistant niet.
- **Geen adres naar keuze.** Agenda's toevoegen doet de server namens de klant (een integratie toevoegen mag in Home
  Assistant alleen een beheerder), en dan mag hij Home Assistant geen willekeurig adres laten ophalen. Google mag alleen
  `https://calendar.google.com/calendar/ical/.../basic.ics` zijn, Apple gaat altijd naar `caldav.icloud.com`.
- **Wie het mag:** een beheerder altijd. Een gewone gebruiker alleen als er op een dashboard een agendakaart staat
  waarop toevoegen niet uit staat. De server leest de dashboards zelf, net als bij de automatiseringskaart.
- **Afspraken** lopen via de commando's van Home Assistant zelf (`calendar/event/create`, `update`, `delete`). Die mag
  elke gebruiker, en Home Assistant kijkt zelf of de agenda het kan.
- **Wat de klant toevoegde, onthoudt de server** (`.storage/domotiapp_lovelace.agenda`), zodat het een herstart overleeft
  en zonder dat iemand het dashboard hoeft te wijzigen. Weghalen van een Lokale agenda die al bestond (gekoppeld, niet
  door de kaart gemaakt) maakt hem alleen los.
- **De tijd is die van Home Assistant**, niet die van het toestel: een afspraak om 10:30 gaat als 09:30 UTC naar Home
  Assistant (in de winter, Amsterdam).

## Gemeten

**Unittests (NIEUW GEDRAG).** `tests/js/agenda-logica.test.mjs` (15) en `tests/test_agenda.py` (7). Op de code van
0.115.1 falen ze allebei bij het importeren: `agenda-logica.js` en `agenda.py` bestonden niet. De JS-tests slagen ook als
het toestel in Amsterdam, New York of Tokio staat.

De Python-tests gebruiken de echte Lokale agenda van Home Assistant, en een gewone gebruiker (groep Gebruikers, geen
beheerder). De alleen-lezen-gebruiker van de testomgeving mag geen afspraak maken; een gewone klant wel.

**Testinstance** (Playwright, bundel geladen = op schijf, alle 304 kliks en toetsaanslagen `isTrusted: true`, 8 spaties
getypt in titel, plaats en naam):

| stap | uitkomst |
|---|---|
| twee agenda's van een vorige ronde weghalen, met de vraag | "Werk Bram gaat weg uit Home Assistant, met alle afspraken erin." Daarna weg |
| + Afspraak, getypt "Tandarts Anna", 1030, 1115, "Dorpsstraat 1" | velden 10:30 / 11:15, opgeslagen, op de kaart onder Morgen: "10:30 – 11:15 · Tandarts Anna · Dorpsstraat 1" |
| tik op de afspraak, Wijzigen, " en Tom" erachter getypt | "Tandarts Anna en Tom" op de kaart |
| hele dag, 24 tot en met 26 december | "Donderdag 24 december, hele dag, Kerst bij oma" |
| nieuwe agenda "Werk Bram" | in de lijst, "lezen en schrijven", met Weghalen |
| Google met `http://192.168.1.1/x` | geweigerd: "Dit is geen iCal-adres van Google Agenda ..." |
| Google met de openbare agenda van de Nederlandse feestdagen | "alleen lezen"; Sinterklaasavond, Kerstavond, Eerste en Tweede Kerstdag, Oudejaarsavond en Nieuwjaarsdag op de kaart |
| Apple met een verzonnen Apple ID | "iCloud gaf geen toegang. Kijk je Apple ID en het app-specifieke wachtwoord na." |
| afspraak verwijderen, met de vraag | weg van de kaart |
| licht thema, telefoon (390) | het scherm is 358 breed, met 16 aan elke kant |
| overzichtskaart, tik op "Tandarts Anna" | het agendascherm, met Wijzigen en Verwijderen |

De kaart viel steeds op het raster (312, 440, 504, ... 1080). Geen fouten in de console.

Bij Apple kwam eerst "De agenda is niet te bereiken". In het log: iCloud antwoordt met 403 Forbidden op een onbekend
account, en de CalDAV-integratie noemt dat `cannot_connect`. Omdat het adres bij Apple vast is, zegt de kaart nu dat het
aan de Apple ID of het wachtwoord ligt (of dat iCloud weg is). Daar staat een test op.

JS-tests 2365 groen, Python 1120 groen, alle bewakers groen.

## Samenvatting

Er is een agendakaart waarop de klant zelf afspraken maakt, wijzigt en verwijdert, en zelf een agenda toevoegt: een
nieuwe in Home Assistant, Google (alleen lezen) of Apple iCloud. De overzichtskaart toont die agenda's ook, en opent een
afspraak in hetzelfde scherm.

## Wat niet lukte

- Apple iCloud is niet met een echt account geprobeerd; alleen het afwijzen van een verzonnen account.
- De volledige Google-koppeling met afspraken maken is niet in de testinstance geprobeerd; die staat er niet. Bij de
  eigenaar staat hij wel, met `supported_features` 3.
- Niet op een echte iPad en niet in een echte Bubble-pop-up.
- Een gewone gebruiker is getoetst in de Python-tests, niet in de browser (daar was het de beheerder).

## Aannames

- Google alleen lezen via het iCal-adres is goed genoeg voor een klant; de volledige koppeling blijft voor de installateur.
- Agenda's die de klant toevoegt, horen ook op de overzichtskaart, al staan ze niet in de editor daarvan. De klant kan
  dat dashboard niet wijzigen, en hij voegde ze zelf toe.

## git status --porcelain

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/__init__.py
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/overzicht-card.js
 M src/cards/overzicht-logica.js
 M src/cards/ruimtes-logica.js
 M src/i18n/en.js
 M src/index.js
?? custom_components/domotiapp_lovelace/agenda.py
?? custom_components/domotiapp_lovelace/engels/agenda.json
?? docs/agendakaart/
?? src/cards/agenda-card.js
?? src/cards/agenda-client.js
?? src/cards/agenda-logica.js
?? src/cards/agenda-scherm.js
?? src/i18n/en/agenda.js
?? tests/js/agenda-logica.test.mjs
?? tests/test_agenda.py
```

(Ten opzichte van main; een deel stond al in een tussencommit op deze tak.)
