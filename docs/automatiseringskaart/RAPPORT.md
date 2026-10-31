# 0.89.0: de automatiseringskaart

Gevraagd op 31 oktober 2026, via een beheersessie: de klant maakt zelf eenvoudige
automatiseringen. Eerst verlichting, daarna rolluiken. De eigenaar zet de lampen
met de goede naam in de configuratie; daaruit kiest de klant. De vakantiemodus
staat nadrukkelijk apart.

## Samenvatting

**De kaart** `custom:domotiapp-automatisering-card`:

- een plusje maakt een regel: welke lampen, hoe fel, wanneer aan, wanneer uit, op
  welke dagen;
- aan en uit zijn elk een tijd, zonsopkomst of zonsondergang met een verschuiving
  (stappen van 15 minuten, tot 3 uur), of Geen;
- elke regel heeft een schakelaar en een prullenbak (met een vraag ervoor), en een
  tik op de rij wijzigt hem;
- een eigen blok Vakantiemodus: schakelaar, eigen plusje, eigen regels. Op de
  gewone rijen staat niets over vakantie.

**De editor** (beheerder): de lampen met per lamp een naam, een vinkje voor de
vakantiemodus, en een bestaande vakantiestand om te koppelen.

**De server** (`automatisering/`):

| Wat | Hoe |
|---|---|
| geen echte automatiseringen | die mag alleen een beheerder maken; de regels staan in de opslag van de integratie, die ze zelf uitvoert |
| wie het mag | iedere ingelogde gebruiker |
| de grens | alleen lampen die op een kaart in een dashboard staan. De server leest dat zelf en weigert de rest; ook bij het uitvoeren wordt het opnieuw getoetst |
| de schakelaar | `switch.domotiapp_vakantiemodus`, altijd aanwezig; met een gekoppelde stand zeggen ze hetzelfde |

**Keuzes van de eigenaar:** gewone regels pauzeren tijdens de vakantiemodus, en
vakantieregels lopen elke dag tot 15 minuten vroeger of later (vast ingebouwd).

**Keuzes die ik zelf maakte:**

- **Een herstart haalt alleen in wat echt gemist is.** Hij zet niet neer wat er
  volgens de regel nu zou moeten: wie om 20:00 zelf de lamp uitdeed, wil niet dat
  hij na een herstart om 21:00 weer aangaat.
- **Van een gemist stuk telt alleen het laatste moment.** Aan en uit allebei gemist
  is dus uit, zonder eerst aan.
- **Een gemiste aan telt 4 uur, een gemiste uit 24 uur.** Een lamp hoort niet
  's middags ineens aan te gaan omdat hij om 07:00 moest.
- **Een regel die zijn lamp aan zette, doet zijn uit ook tijdens de pauze.** Anders
  blijft de lamp de hele vakantie branden als iemand om 20:00 de deur uit gaat.
- **De wissel is afgeleid van regel en dag**, en niet geloot: na een herstart geldt
  dezelfde tijd.
- **Regels van twee kaarten delen één opslag.** Een kaart toont de regels met
  minstens één lamp van die kaart.

## Gemeten

Testinstance op de mini-pc (HA 2026.8.1), headless Chromium met Playwright. De
klant is het account `Receptie` (`is_admin: false`), op 393 breed met `isMobile`,
met echte tikken (`isTrusted: true` op alle tikken van de rondes die het logden).
Bij de eerste ronde was de `?v=` van de geladen bundel gelijk aan de sha256 op
schijf (`23ba7d502af0`). Daarna kwam nog een kleine CSS-wijziging (de inhoud in het
midden); de latere rondes draaiden daarop.

**Als beheerder, in de editor:** "Lamp woonkamer" getypt in het naamveld, met een
echte spatie (`keydown` `" "`, `isTrusted: true`, 14 aanslagen). In de YAML:
`{"entity":"light.test_lamp_dim","name":"Lamp woonkamer"}`.

**Als klant, op de telefoon:**

| Handeling | Uitkomst |
|---|---|
| plusje zonder lamp | Opslaan uit, "Kies minstens één lamp." |
| tik op 40% van de schuif | 40% |
| tijd typen met echte toetsen | 14:35 |
| uit op zonsondergang, twee keer min | "30 min ervoor" |
| opslaan | rij "Lamp woonkamer": "Aan om 14:35 · uit 30 min voor zonsondergang · 40% · Elke dag" |
| **wachten tot 14:35** | **`light.test_lamp_dim` gaat om 14:35 echt aan, helderheid 102 (40% van 255)** |
| regel met een andere lamp via de websocket | `not_allowed`: "Deze lamp staat niet op de kaart" |
| schakelaar op de rij, heen en terug | `data-aan` false, dan true, zonder dat het scherm opent |
| tik op de rij, een lamp erbij | kop "Automatisering wijzigen", de rij noemt beide lampen |
| alleen een aan/uit-lamp gekozen | geen helderheidsschuif |
| vakantiemodus aan op de kaart | `switch.domotiapp_vakantiemodus` on, regel "Gepauzeerd: de vakantiemodus staat aan." |
| schakelaar uit in Home Assistant | de kaart volgt, de regel gaat weg |
| plusje in het vakantieblok | kop "Nieuwe vakantieregel", regel in het eigen blok |
| woord "vakantie" op de gewone rijen | niet |
| prullenbak | vraag "Automatisering verwijderen?", na OK weg |

Kaarthoogte 312 en 376: (hoogte + 8) / 64 valt op het raster. Geen horizontaal
scrollen (`scrollWidth` 393). Het vak van het scherm is 361 breed, zonder overloop.
Geen paginafouten, en niets van de automatiseringen in het logboek.

**Een echte herstart, twee keer:**

| Proef | Uitkomst |
|---|---|
| regel op 14:45, `pm2 stop` om 14:43:07, `pm2 start` om 14:45:37 | lamp om 14:46:12 aan, helderheid 64 (25% van 255) |
| lamp met de hand uit, vakantie aan, `pm2 restart`, ruim een minuut later | lamp nog uit, vakantie nog aan, de regel staat er nog |

**Proeven:**
- 44 nieuwe Python-tests in `tests/automatisering/` (klok, zon, wissel, herstart,
  stroomstoring zonder afsluiten, pauze, koppeling, commando's als gewone gebruiker).
- 12 nieuwe JS-tests in `tests/js/automatisering-logica.test.mjs`.
- Allemaal NIEUW GEDRAG: de kaart bestond niet. Een run op de oude code zegt daarom
  niets en is niet gedraaid.
- JS 2118 groen, Python 987 groen.
- `verify`, `check:registratie`, `check:css`, `check:controls` en `check:taal` groen.

## Wat niet lukte

- **Niet op een echte installatie gemeten.** Dat doet de beheersessie na de uitgave.
- **Niet gemeten op een iPhone.** De tijdkiezer is daar een native kiezer; de CSS
  volgt valkuil 78 en de bewaker daarvan is groen.
- **De wissel van 15 minuten en de pauze zijn alleen in tests beproefd,** niet in de
  testinstance op de echte klok.
- **De koppeling met een bestaande vakantiestand is alleen in tests beproefd.**
- **Het donkere thema is alleen bekeken in de voorvertoning in de editor,** het
  invulscherm alleen in licht. Er zijn geen kleuren buiten de tokens gebruikt.
- **Bij de meting van `isTrusted`:** de tikken van de eerste ronde zijn gelogd tot de
  rij op de kaart stond; de rest in de tweede ronde.

**Bekend, en zo gelaten:**

- Zet iemand de vakantiemodus om 19:00 aan, dan gaat een vakantieregel van 18:00 pas
  de volgende dag aan.
- Een regel die wordt uitgezet of verwijderd terwijl zijn lamp brandt, doet de lamp
  niet uit.
- Een regel kan niet in een kiosk-account worden tegengehouden: wie de kaart ziet,
  kan hem gebruiken. Zet de kaart dus niet op een scherm voor bezoekers.

**Een vers browserprofiel herlaadt ongeveer 7 seconden na het eerste bezoek eenmalig
de pagina;** een tweede bezoek niet. Een scherm dat dan openstaat, is daarna weg. Het
komt niet uit `verouderd.js` (geen merk in `sessionStorage`). Waar het wél vandaan
komt is niet uitgezocht; alleen een allereerste bezoek heeft er last van.

## Aannames

- Rolluiken komen in een volgende ronde; de vorm van een regel laat dat toe.
- Voorwaarden, scènes en sensoren als trigger zijn uitgesteld, zoals in de vraag.
- Vakantieregels krijgen dezelfde lampen als de gewone regels.

## git status --porcelain

Leeg na de commit van deze ronde.
