# 0.110.0: de vakantieregels klappen open met de vakantiemodus

De eigenaar op 6 november 2026: *"En als vakantiemodus uit staat moet hij alle regels verbergen tot je hem aan zet en dan
kan je hem openklappen snap je?"*

## Wat er veranderd is

Op de automatiseringskaart staat bij een uitgeschakelde vakantiemodus alleen nog de regel **Vakantiemodus** met zijn
schakelaar. Het blok **Vakantieregels** zit eronder: het plusje, de regels en de uitleg over de 15 minuten. Dat blok
klapt open zodra de schakelaar aan gaat, en weer dicht als hij uit gaat. Zolang de server nog niets zei, is het blok
dicht.

Dit is de vorm uit de vormregels: een schakelaar op één regel, en het blok eronder alleen als hij aan staat.

De beslissing staat als `vakantieOpen(stand)` in `automatisering-logica.js`, met een test. De server is niet veranderd:
vakantieregels die er al zijn blijven bestaan en draaien gewoon als de vakantiemodus aan staat.

## Gemeten

In de testinstance (Playwright, view `automatisering` van `kaart-test`), met echte kliks op de schakelaar:

```
BUNDEL schijf 460aef0852dd geladen ["460aef0852dd"]
BEGIN       schakelaar false  blok zichtbaar false  kaart 248 px
NA KLIK AAN schakelaar true   blok zichtbaar true   kaart 312 px
NA KLIK UIT schakelaar false  blok zichtbaar false  kaart 248 px
KLIKS isTrusted: true, true
fouten []
```

248 en 312 liggen allebei op het raster (4 en 5 rijen). De kaart groeit en krimpt mee.

`tests/js/automatisering-vakantie-inklappen.test.mjs`: 2 tests. Tegen `main` faalt hij: `vakantieOpen` bestaat daar
niet. Alles: JS 2322, Python 1107, `verify`, `check:taal`, `check:css`, `check:controls`, `check:registratie` groen.

## Samenvatting

Vakantieregels staan er pas als de vakantiemodus aan staat.

## Wat niet lukte

Niets.

## Aannames

- "Openklappen" is: het blok klapt vanzelf open bij aanzetten, zonder nog een tik op een pijltje.
- Gevolg: wie vakantieregels vooraf wil maken, zet daarvoor de vakantiemodus aan, en dan pauzeren de gewone regels
  zolang hij aan staat.

## git status --porcelain

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/automatisering-card.js
 M src/cards/automatisering-logica.js
?? docs/vakantieregels-inklappen/
?? tests/js/automatisering-vakantie-inklappen.test.mjs
```
