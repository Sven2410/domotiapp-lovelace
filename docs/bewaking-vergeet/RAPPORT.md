# 0.123.0: de regel van een camera weghalen, voor het beheer

Gevraagd door een beheersessie, 12 november 2026. Bij een klant staan bewakingsregels van de camerakaart voor vier camera's
die daar niet bestaan. De eigenaar wil dat ze weg mogen. Er was geen commando om een regel weg te halen: `bewaking/store.py`
kon het wel (`async_verwijder`), maar de websocket bood alleen `get`, `save`, `timeline`, `verwijder` (beelden op id) en
`subscribe`.

## Wat er veranderd is

- **Een nieuw commando:** `domotiapp_lovelace/bewaking/vergeet {camera}`. Het haalt de regel van die camera weg uit de
  opslag. Daarna kijkt de motor opnieuw naar welke melders hij luistert, en een open camerakaart en meldingenkaart horen
  het. Dat gaat net als bij `save`.
- **Alleen voor een beheerder** (`require_admin`). De andere bewakingscommando's mag iedereen, omdat de klant zijn eigen
  camerakaart instelt. Dit commando is voor het beheer, niet voor de kaart.
- **Een camera zonder regel** geeft `not_found`: "Voor deze camera is geen regel".
- **De beelden die er al zijn blijven staan.** Die ruimen vanzelf op, net als altijd.

## Gemeten

**Tests, NIEUW GEDRAG.** In `tests/bewaking/test_websocket.py` staan er 5 bij:
- weghalen, waarna de motor niet meer luistert (een detectie geeft geen beeld);
- weg uit de opslag;
- een camera zonder regel;
- alleen een beheerder, want een gewone gebruiker krijgt `unauthorized` en de regel blijft;
- een open kaart hoort het.

Op 0.122.0 vallen de eerste vier om met `unknown_command`. De vijfde wacht daar eeuwig op een gebeurtenis die niet komt,
en is daarom bij die proef overgeslagen.

**Testinstance** (na een herstart, Python veranderde), als beheerder over de websocket:
- `save` voor `camera.camera_9`, een camera die niet bestaat, met een melder die niet bestaat: in de lijst.
- `vergeet` op `camera.camera_9`: `success`, en de camera is weg uit `get`.
- Nog een keer: `not_found`, "Voor deze camera is geen regel".
- In `.storage/domotiapp_lovelace.bewaking` staat `camera_9` daarna 0 keer.

JS-tests 2405 groen, Python 1153 groen. Bundel, taal, css, registratie en controls groen. Aan de kaarten verandert
niets, alleen het versienummer in de bundel.

## Samenvatting

Een beheerder kan de bewakingsregel van een camera weghalen met `bewaking/vergeet`, ook van een camera die niet meer
bestaat.

## Wat niet lukte

Niets. Weghalen bij de klant doet de beheersessie.

## Aannames

- **Alleen een beheerder.** Het commando is voor gereedschap, en de kaart gebruikt het niet. Het is de tegenhanger van
  `save`, maar dan zonder knop.
- **De beelden van die camera blijven staan**, tot ze vanzelf opruimen. Het commando haalt de regel weg, niet de beelden.

## git status --porcelain

```
 M custom_components/domotiapp_lovelace/bewaking/websocket.py
 M custom_components/domotiapp_lovelace/engels/gedeeld.json
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M tests/bewaking/test_websocket.py
?? docs/bewaking-vergeet/
```
