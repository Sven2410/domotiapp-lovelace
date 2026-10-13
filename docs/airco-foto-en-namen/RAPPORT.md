# De foto van de airco, en geen namen meer in de repo (0.63.1)

13 oktober 2026 (avond), tak `fase-86/airco-foto-en-namen`. Twee dingen in
één ronde.

## 1. De productfoto op de airco-kaart

De eigenaar legde `Mitsubishi Electric Premium Onyx Black.png` in
`_ref/aircos` (450 × 168, transparant). Zijn antwoorden op de twee vragen:

| Vraag | Antwoord |
|---|---|
| Mag de foto in de publieke repo? | *"Ja, als installateur mag ik dat"* |
| Wanneer toont de kaart hem? | *"Alleen als ik hem kies"* |

Wat er gebouwd is:

- **Het bestand.** `afbeeldingen/aircos/mitsubishi-premium-onyx-black.webp`:
  de lege rand eraf, 360 × 136 px, 1952 bytes. Het staat in
  `VASTE_WEBP` van `tests/test_afbeeldingen.py`, want dat adres komt in
  dashboards.
- **De keuze.** `AIRCO_FOTOS.mitsubishi_premium_onyx`, met als naam in de
  editor "Mitsubishi Electric Premium (Onyx Black)".
- **Geen `merk`, met opzet.** Automatisch kiest de foto daardoor nooit zelf.
  MELCloud Home geeft geen model door, en een witte of zilveren Mitsubishi zou
  anders als zwarte unit verschijnen.
- **Een eigen vlak achter de foto.** In de browser was de zwarte unit op een
  donkere kaart een donker streepje van 88 × 33 px. Nu staat hij op een vlak
  van 104 × 56 in de tint van het thema: in donker iets lichter, in licht
  zachtgrijs. Onder 360 px containerbreedte is het vlak 84 × 46.

**Gemeten in de testinstance** (bundel `?v=8ae5bcded24c`, gelijk aan de sha256
op schijf):

- de foto staat op 104 × 56, in de natuurlijke maat van 360 × 136;
- de kaarthoogtes zijn 376 en 440, allebei op het raster;
- in donker en in licht is de unit zichtbaar (schermafdrukken bekeken);
- het adres `/domotiapp_lovelace/afbeeldingen/aircos/mitsubishi-premium-onyx-black.webp`
  geeft 200 met 1952 bytes.

**Test, NIEUW GEDRAG** (`airco-kaart.test.mjs`):

- `AIRCO_FOTOS` heeft precies deze ene sleutel;
- Automatisch geeft bij een Mitsubishi uit de echte dump GEEN foto;
- gekozen geeft hij het juiste adres.

Op de oude code faalt deze test, want daar was `AIRCO_FOTOS` leeg.

## 2. Geen namen in de publieke repo

Na #105 (de klantnaam) en #106 (valkuil 71) meldde de coach-sessie dat de
volledige naam van de eigenaar nog in de repo stond. De eigenaar, via die
sessie: *"… geen namen in een publieke repo"*. Alleen de
huidige stand; **de geschiedenis wordt niet herschreven**, ook dat was zijn
keuze.

Gevonden en vervangen:

- **Zijn voor- en achternaam:**
  - in tests, in de werkbank `dev/preview.html` en in rapporten;
  - in twee foutmeldingen van de wekkerkaart (`zoals person.<naam>`). Daarmee
    stond de naam ook in de bundel.
- **Het adres van zijn Nabu Casa,** als voorbeeld in een test.
- **De voornamen van vijf huisgenoten.**

Vervangen door verzonnen namen, overal dezelfde:

- Bram Visser (`person.bram`, BV);
- Anna, Tom, Sophie, Kees en Mien;
- `voorbeeldhuis.ui.nabu.casa`.

Waar het over de eigenaar zelf ging ("Vraag … hier actief naar"), staat nu "de
eigenaar". Zijn GitHub-naam blijft staan: die zit in elke URL.

**Controle:**

- `git grep -i` op elke naam (per woord, de hele repo, CLAUDE.md incluis) en op
  alle klantnamen: 0 treffers;
- in de bundel: 0 treffers.

**Wat de vervanging brak, en gerepareerd is:**
`test_het_overzicht_toont_wie_er_een_telefoon_heeft`. Het overzicht sorteert op
naam, en "Bram" komt vóór "Gast" waar de echte naam erna kwam. De verwachte
volgorde is omgedraaid.

CLAUDE.md valkuil 71 is aangevuld met de eigenaar en zijn huisgenoten, de
vaste verzonnen namen, en de val van de volgorde. De echte namen staan er niet
in.

## Controles

```
npm test                   ℹ pass 1623 · fail 0
npm run check:css          OK
npm run verify             OK: bundel is actueel (versie 0.63.1)
python -m pytest -q        807 passed in 165.21s
```

## Samenvatting

0.63.1 heeft twee wijzigingen:

- **De airco-kaart kan de Mitsubishi Premium (Onyx Black) tonen,** als je hem
  kiest. De foto staat op een vlak dat hem op een donkere kaart zichtbaar
  houdt.
- **Er staan geen namen meer in de huidige stand van de repo:** niet die van
  de eigenaar, niet die van zijn huisgenoten en niet die van klanten.

## Wat niet lukte

Niets, voor zover gemeten. In de geschiedenis staan de namen nog; dat is met
opzet zo, op zijn keuze.

## Aannames

- "Anna, Tom, Sophie, Kees en Mien" en "Bram Visser" zijn verzonnen. Dat het
  echte personen kunnen zijn, is bij elke gewone naam zo; ze horen bij niemand
  uit de notities.
- "Ruben van der lee" (uit #106, bij `initialen`) is ook verzonnen.

## git status --porcelain

Na het vastleggen van dit rapport: schoon.
