# 0.117.1: altijd de eerstvolgende afspraak

De eigenaar, 9 november 2026, na 0.117.0 (doorgegeven door de beheersessie): "ik wil dat hij altijd de eerstvolgende
afspraak laat zien mits het eerder is".

Gelezen als: staat er binnen `agenda_dagen` iets, dan blijft het zoals het was (wat eerder is gaat voor). Is dat venster
leeg, dan staat de eerstvolgende afspraak erop, hoe ver die ook weg is. In 0.117.0 hield dat op bij 60 dagen.

## Wat er veranderd is

- De kaart haalt de afspraken nog steeds zelf op tot 60 dagen vooruit. Die kunnen gewijzigd en verwijderd worden.
- Voorbij die 60 dagen komt de eerstvolgende uit de **toestand** van de agenda: Home Assistant zet de lopende of
  eerstvolgende afspraak in de attributen (`message`, `start_time`, `end_time`, `all_day`, `location`, `description`),
  zonder grens in de tijd. De tijden staan daar als "2026-12-17 19:00:00" in de tijdzone van Home Assistant, en dat is
  al wandtijd (`volgendeUitToestand` in `agenda-logica.js`; de vorm is gelezen in `state_attributes` van
  `homeassistant/components/calendar/__init__.py`).
- Zo'n afspraak heeft geen `uid`. Een tik opent hem dan zonder Wijzigen en Verwijderen. Is dezelfde afspraak ook
  opgehaald, dan gaat de opgehaalde voor.

## Gemeten

**Unittests (NIEUW GEDRAG), allebei falend op 0.117.0:**

- `agenda-logica.test.mjs`, `volgendeUitToestand` (3 tests): `does not provide an export named 'volgendeUitToestand'`.
- `overzicht-logica.test.mjs`, "de eerstvolgende uit de toestand van de agenda, zonder grens; wat in het venster staat
  gaat voor": `not ok 4`.

**Testinstance** (Playwright, view `overzicht`, tijdelijk zonder agenda in de editor en alleen vandaag). De bundel op
schijf was de geladen bundel (`6cd2c1bd2109`); de eerste ronde draaide nog de vorige (valkuil 2) en is opnieuw gedaan
na een herstart. Beide kliks waren `isTrusted: true`.

| stap | uitkomst |
|---|---|
| met het abonnement | "Sinterklaasavond · za 5 dec", uid van Google |
| abonnementen gestopt en geleegd (0 opgehaald) | nog steeds "Sinterklaasavond · za 5 dec", nu met uid `null`: uit de toestand van `calendar.feestdagen_nl` |
| tik op die regel | het scherm "Zaterdag 5 december, hele dag", alleen Sluiten |

De kaart bleef op het raster (440). Geen fouten in de console. Daarna is de config teruggezet.

JS-tests 2370 groen, Python 1121 groen, alle bewakers groen.

## Samenvatting

Bij een lege week toont de overzichtskaart nu altijd de eerstvolgende afspraak, ook als die verder dan twee maanden weg
is. Wat in het venster staat, gaat voor.

## Wat niet lukte

- In de testinstance staat geen agenda met als eerste afspraak iets voorbij 60 dagen. Het pad via de toestand is daarom
  gemeten door de opgehaalde afspraken weg te halen, niet met een echte afspraak van ver weg.

## Aannames

- "mits het eerder is" betekent: wat binnen het venster staat gaat voor. De beheersessie las het ook zo.

## git status --porcelain

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/agenda-logica.js
 M src/cards/overzicht-card.js
 M src/cards/overzicht-logica.js
 M tests/js/agenda-logica.test.mjs
 M tests/js/overzicht-logica.test.mjs
?? docs/altijd-de-eerstvolgende/
```
