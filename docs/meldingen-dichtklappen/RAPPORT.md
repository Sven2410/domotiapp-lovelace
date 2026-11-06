# 0.111.0: de keuzes in de meldingenpop-up klappen dicht

De eigenaar op 6 november 2026, met een schermafdruk van zijn pop-up (afval en camera, allebei open): *"en ik wil de
meldingen kunnen dichtklappen dadelijk staat alles heel veel onder elkaar en wordt het onoverzichtelijk"*

## Wat er veranderd is

- In de pop-up van een persoon op de meldingenkaart staat naast het vinkje van elke soort nu een rond pijltje.
- De keuzes onder een soort staan standaard dicht. Bij afval is dat Wanneer en Welke bakken, bij de stofzuiger Waarover en Van welke robot, bij de camera Van welke camera en Waarover. De regel onder de soort zegt al wat iemand krijgt.
- Een tik op het pijltje klapt de keuzes open of dicht, zonder het vinkje te raken. Met het toetsenbord gaat het met Enter of de spatie.
- Een soort die uit staat of niets te kiezen heeft, heeft geen pijltje.
- Elke opening van de pop-up begint dichtgeklapt. Open of dicht is alleen voor dit scherm; de server weet er niets van.

De beslissing staat als `klapStand(soort, open)` in `meldingen-logica.js`, met een test.

## Gemeten

In de testinstance (Playwright, view `camera-meldingen` van `kaart-test`). Daarop staat een meldingenkaart met de
robotstofzuiger (twee robots) en de camera (twee camera's, drie soorten), en daarmee echte kliks en een echte Enter:

```
BUNDEL schijf ad7e47d1a2d2 geladen ["ad7e47d1a2d2"]
OPEN POPUP                stofzuiger dicht, camera dicht, pijltjes zichtbaar     vak 315 px
KLIK PIJL CAMERA          camera open (aria-expanded true), vinkje blijft aan   vak 443 px
ENTER OP PIJL STOFZUIGER  stofzuiger open                                         vak 611 px
KLIK PIJL CAMERA DICHT    camera dicht                                            vak 483 px
VINK STOFZUIGER UIT       vinkje uit, pijltje weg, keuzes weg                     vak 299 px
VINK STOFZUIGER AAN       vinkje aan, pijltje terug                               vak 483 px
KLIKS/TOETSEN isTrusted: true (6x)
fouten []
```

Met alles open is de pop-up 611 px hoog, dichtgeklapt 315 px.

`tests/js/meldingen-dichtklappen.test.mjs`: 2 tests. Tegen `main` faalt hij: `klapStand` bestaat daar niet. Alles: JS
2324, Python 1107, `verify`, `check:taal`, `check:css`, `check:controls`, `check:registratie` groen.

## Samenvatting

De keuzes per soort in de meldingenpop-up staan dicht tot je op het pijltje tikt.

## Wat niet lukte

Niets.

## Aannames

- Elke opening begint dicht, ook als het de vorige keer open stond. Binnen één opening onthoudt hij wat open stond, ook
  als je het vinkje even uit en weer aan zet.

## git status --porcelain

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/meldingen-logica.js
 M src/cards/meldingen-scherm.js
 M src/i18n/en/meldingen.js
?? docs/meldingen-dichtklappen/
?? tests/js/meldingen-dichtklappen.test.mjs
```
