# Onbekend in plaats van niets bij een pomp, en de openingstijden in het Nederlands — 0.144.1

## Waarom

De eigenaar, 27 november 2026, met een schermafdruk van een pomp op de kaart met alleen naam, adres en Route: *"waarom
geen openingstijden en welke brandstof?"* Hij koos via de beheersessie: *"ja doe 3 en 2"*:

- **Wens 3:** "Openingstijden onbekend" en "Brandstoffen onbekend" tonen, zodat te zien is dat het ontbreekt. Die zit in
  deze uitgave.
- **Wens 2:** de gegevens aanvullen vanaf de sites van de merken. Die ligt eerst bij de eigenaar; zie Wat niet lukte.

In de momentopname heeft een derde van de 4031 stations geen openingstijden (1295), en twee derde geen brandstoffen
(2456). Dat zijn gaten in OpenStreetMap zelf.

## Wat er veranderd is

- **`stationRegels` in `brandstof-logica.js`** geeft de regel voor openingstijden en voor brandstoffen, met `bekend`.
  Onbekend staat er cursief en gedempt.
- **Openingstijden in het Nederlands.** OpenStreetMap schrijft "PH,Mo-Su 07:00-21:00", en dat stond er zo, in het
  Engels. In het Nederlands wordt het "feestdagen, ma-zo 07:00-21:00", en `off` wordt "dicht". In het Engels blijft het
  zoals OpenStreetMap het schrijft.

## Proeven

`tests/js/brandstof-stations.test.mjs`:
- **NIEUW GEDRAG:** een echt station zonder gegevens geeft twee keer onbekend, en een station dat dag en nacht open is
  met LPG geeft het gewoon. Op 0.144.0 valt de proef om met `B.stationRegels is not a function`.
- **De openingstijden:** drie vormen, met feestdagen en dicht.

Alles samen: 2607 JS-proeven en 1253 Python-proeven groen, plus alle controles.

## In de browser gemeten

Op 390 breed, met `isMobile` en `hasTouch`, in donker en licht, met echte toetsen ("tinq norbruislaan", de spatie als
`isTrusted: true`) en een tik op de uitkomst (`click:true`). Bundel `a74989fdedb7`, gelijk aan schijf.

Onder de kaart stond: "TinQ · Burgemeester Norbruislaan 71, 3555ED Utrecht · Open: feestdagen, ma-zo 07:00-21:00 ·
Brandstoffen onbekend · Route". `scrollWidth` is 390/390 en er waren geen fouten in de console.

## Samenvatting

Weet OpenStreetMap de openingstijden of de brandstoffen van een pomp niet, dan staat er nu "onbekend". De openingstijden
staan er in het Nederlands.

## Wat niet lukte

**Aanvullen vanaf de sites van de merken (wens 2)** is niet gebouwd. Het ligt bij de eigenaar, want het is moeilijk
terug te draaien:

- De momentopname staat in een openbare repo; HACS haalt de integratie daar vandaan. Wat erin staat, blijft in de
  geschiedenis staan.
- Alle stationspagina's van een merk ophalen en publiceren is het overnemen van een flink deel van hun databank. Daar
  geldt in de EU een databankrecht voor, ook zonder gebruiksvoorwaarden.
- TinQ heeft op zijn site alleen een privacy- en een cookieverklaring; robots.txt laat `/tankstations` toe.
- Het bestand staat onder ODbL. Gegevens van een merk horen daar niet in.

Een andere weg: de Home Assistant van de klant haalt alleen de pagina op van de pomp waar hij op tikt, zoals een browser
dat doet, en bewaart hem. Dan komt er niets in de repo. In OpenStreetMap heeft daarvoor:
- TinQ: 108 van de 377 stations een link naar de stationspagina;
- Argos: 94 van de 176;
- Esso: 200 van de 321, op esso.nl;
- Shell: alleen een link naar een app.

## Aannames

Geen aannames gedaan.

## `git status --porcelain`

(vlak voor het vastleggen)

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/brandstof-kaart.js
 M src/cards/brandstof-logica.js
 M src/i18n/en/brandstof.js
 M tests/js/brandstof-stations.test.mjs
?? docs/pomp-onbekend/
```
