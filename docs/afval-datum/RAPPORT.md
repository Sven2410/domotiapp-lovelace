# De datum in het afvalvlak van het infoscherm brak in tweeën, versie 0.144.2

Gemeld op 27 november 2026 met een schermafdruk van het infoscherm bij een klant. In het vlak met de eerstvolgende bak stond
"Restafval 27" op de eerste regel en "nov" op de tweede: "27 staat niet voor november".

## De oorzaak

In `htmlAfvalEerst_` (`src/cards/infoscherm-card.js`) staan de naam (`.af-n`) en de datum (`.af-w`) als twee spans in
`.af-t`, en geen van beide had een eigen `display`. Het waren dus gewone woorden op één regel. Is het blok breed genoeg voor
"Restafval 27" maar niet voor "Restafval 27 nov", dan breekt de browser tussen 27 en nov. Bij een breder blok stond alles
op één regel, bij een smaller blok de hele datum eronder. Alleen in het smalle stuk ertussen ging het mis, en daar zat het
blok bij de klant.

## De reparatie

`.af-t` is nu een kolom: de naam boven, de datum eronder, elk op een eigen regel. De datum breekt niet meer
(`white-space: nowrap`, met een beletselteken als hij echt niet past). De regel voor "dagen" naast het getal rechts heeft
een eigen selector gekregen (`.af-d .af-w`), zodat die niet meegaat.

## Gemeten

Gemeten in de testinstance (HA 2026.8.1), met Playwright headless op 1180 × 820. Het afvalvlak is door de kaart zelf
getekend (`htmlAfvalEerst_` met de echte `afvalLijst_()`), in een `.blok` op schaal 1. Dat blok is in het scherm gehangen
omdat het afvalblok niet in de indeling van het testscherm staat. De vier afvalsensoren zijn met `POST /api/states` gezet,
met restafval vandaag zoals op de schermafdruk.

Eerst is nagegaan dat de verse bundel draait. De `?v=` in `performance` is gelijk aan de eerste twaalf tekens van de sha256
op schijf:

```
oud    BUNDEL schijf a74989fdedb7 geladen ["a74989fdedb7"]
nieuw  BUNDEL schijf 531b66fd6733 geladen ["531b66fd6733"]
```

Het vlak op 270 px breed, ongeveer de breedte op de schermafdruk. "regels" is het aantal `getClientRects()` van de
datum: 2 betekent dat hij in twee stukken staat.

| | naam (links, boven, breed, hoog) | datum (links, boven, breed, hoog) | regels datum |
|---|---|---|---|
| oud | 474, 323, 77, 23 | 474, 329, 94, 40 | **2** |
| nieuw | 474, 320, 105, 30 | 474, 350, 105, 21 | **1** |

Oud begint de datum op dezelfde hoogte als de naam (329 tegen 323) en loopt hij over twee regels: dat is "27" naast de
naam en "nov" eronder. Nieuw staat de datum heel, 30 px onder de naam. In beide gevallen steekt er niets uit het vlak
(`scrollWidth` 268, `clientWidth` 268), en er waren geen fouten op de pagina.

Op 230 px breed staat de datum nieuw ook op één regel. Een eerste versie gaf de naam `overflow-wrap: anywhere`, maar
daarmee brak "Restafval" op 230 px midden in het woord. Dat is er weer uit.

**REGRESSIEWACHT** is er niet bij: het is een CSS-regel, en een jsdom-test zegt niets over hoe een browser afbreekt
(zie CLAUDE.md). Het bewijs is de meting hierboven, oud tegen nieuw.

## Samenvatting

In het afvalvlak van het infoscherm staan naam en datum nu elk op een eigen regel, en de datum breekt niet meer. Gemeten
op 270 px: oud stond de datum in twee stukken, nieuw op één regel onder de naam. Alle 2607 JS-tests en 1253 Python-tests
zijn groen, en ook verify, check:css, check:registratie, check:controls en check:taal.

## Wat niet lukte

- **Geen opname van oud tegen nieuw.** De opname van het vlak in een eigen laag liet bij oud ook een hele datum zien.
  Ofwel was die laag net iets anders van breedte, zodat het smalle stuk niet geraakt werd, ofwel draaide daar nog de
  nieuwe bundel. De `?v=` is in dat script niet nagekeken. De meting in de tabel is wél nagekeken.
- **Niet op het scherm bij de klant gezien.** Dat gebeurt na de uitrol.

## Aannames

- Het scherm bij de klant gebruikt een afvalsensor of een agenda; het vlak is in beide gevallen hetzelfde
  (`htmlAfvalEerst_`).
- Naam en datum onder elkaar was altijd de bedoeling, net als op de afvalkaart. In een breed blok stonden ze tot nu toe
  naast elkaar ("Restafval 27 nov"); nu staan ze daar ook onder elkaar.

## git status --porcelain

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/infoscherm-card.js
?? docs/afval-datum/
```
