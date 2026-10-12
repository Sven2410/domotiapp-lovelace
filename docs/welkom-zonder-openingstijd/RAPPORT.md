# 0.62.1: geen openingstijd meer in het welkomblok

## De vraag

De eigenaar, 12 oktober 2026: *"in het welkoms blok niet de openeingstijd laten
zien dat moet puur in openingstijden blok"*.

SPEC 20 zei dat de receptie kiest of het welkomblok "de regel met de
openingstijd van vandaag" toont. Gevraagd met AskUserQuestion: overal weghalen,
of alleen bij deze klant uitzetten? Zijn keuze: **overal weghalen**, met de
SPEC erbij.

## Wat er veranderd is

| | |
|---|---|
| het welkomblok (`infoscherm-card.js`) | logo, klok met datum, en de welkomtekst. De regel "Vandaag geopend tot ..." / "Gesloten · morgen open om ..." is eruit, ook als de oude schakelaar in de opslag nog aan staat |
| het beheer, Instellingen en logo | de schakelaar "Regel met de openingstijd van vandaag" is weg; de hulptekst zegt dat de openingstijden in hun eigen blok staan |
| `geslotenRegel` (`infoscherm-logica.js`) | weg, met zijn toets: hij werd nergens anders gebruikt |
| `store.py` | `welkom_onder` blijft in de validatie staan, zodat een opgeslagen scherm met die sleutel geldig blijft. Er staat bij dat hij niet meer gebruikt wordt |
| `SPEC.md` 20 | het welkomblok draagt logo, klok en tekst; de openingstijden staan alleen in hun eigen blok. Met zijn akkoord |

## Gemeten in de browser

Testinstance op 8127, Chrome; de geladen bundel was `406fce809480`, gelijk aan
schijf.

| | gemeten |
|---|---|
| `welkom_onder` in de opslag | `true` (de oude stand) |
| de delen van het welkomblok | `logo beeld`, `w-klok`, `w-tekstvak`; geen `.welkom-onder` |
| de tekst in het welkomblok | "19:53 maandag 12 oktober Welkom, neemt u plaats." |
| het blok Openingstijden | "Nu geopend, tot 23:59" |
| het beheer | geen schakelaar `welkom_onder` meer |

Om 18:09 die dag stond er op hetzelfde scherm, met dezelfde opslag, nog
"Vandaag geopend tot 23:59" onder de welkomtekst.

**Een herstel in de testinstance, dat ik zelf veroorzaakt had.** In 0.62.0 had
ik de beheerkaart alleen `lights` gegeven. Bij de synchronisatie gingen weer,
energie, agenda's en afval daardoor naar leeg. Ze zijn teruggezet uit
`.ha-dev-config/redding/testinstance-integratie.json`, via de config van de
beheerkaart. Bij die synchronisatie bleef de versleepte lampvolgorde staan
(kleur_en_wit eerst), terwijl er andere velden wijzigden. Dat is een tweede,
onbedoelde meting van wat 0.62.0 repareerde.

## Tests

`npm test`: 1553 groen (één minder: de toets van `geslotenRegel` is weg).
`verify`, `check:registratie`, `check:controls` en `check:css` zijn groen.
Python: in CI; er is alleen commentaar in `store.py` gewijzigd.

Er is geen nieuwe toets. Er verdwijnt iets uit de html van het welkomblok, en
dat kan alleen in de browser gemeten worden (geen jsdom); zie de tabel
hierboven.

## Samenvatting

De openingstijd staat alleen nog in het blok Openingstijden, bij elke klant.
In het welkomblok staan logo, klok en tekst. De schakelaar ervoor is uit het
beheer, en SPEC 20 is aangepast.

## Wat niet lukte

Niets.

## Aannames

- Een klant die de regel als enige plek voor de openingstijden gebruikte (geen
  blok Openingstijden in de indeling), ziet ze nu nergens meer. Zo'n klant
  moet het blok toevoegen in Indeling. Dat is gevolgd uit "dat moet puur in
  openingstijden blok", niet gevraagd.

## git status --porcelain

Vóór de commit:

```
 M SPEC.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/infoscherm/store.py
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/infoscherm-beheer-card.js
 M src/cards/infoscherm-card.js
 M src/cards/infoscherm-logica.js
 M tests/js/infoscherm-logica.test.mjs
?? docs/welkom-zonder-openingstijd/
```
