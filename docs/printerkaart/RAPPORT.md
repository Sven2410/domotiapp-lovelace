# 0.84.0: een printerkaart (papier)

## Aanleiding

Op 21 oktober 2026 vroeg de eigenaar, via de beheersessie van een klant, om een
printerkaart voor een HP OfficeJet Pro 9730e. Hij wilde merk en productfoto,
net als op de andere productkaarten. Op de kaart moeten de status, de inkt per
kleur en het aantal afdrukken. De printer hangt aan de integratie IPP (core).
De beheersessie stuurde een geanonimiseerde dump.

## Wat er gebouwd is

Een nieuwe kaart, `custom:domotiapp-kantoorprinter-card`. In de kaartkiezer
heet hij "DomotiApp Printer"; de 3D-printer heet daar "DomotiApp 3D printer".

```
[foto/chip] HP OfficeJet Pro 9730e Series        994
            Klaar voor gebruik              afdrukken
[ Zwart 30% ] [ Cyaan 50% ] [ Magenta 50% ] [ Geel 60% ]
```

- **Een entiteit kiezen:** je kiest de statussensor (`translation_key:
  printer`). De patronen (`marker`) en de tellers (`impressions_completed`,
  `monochrome_…`, `color_…`) van hetzelfde apparaat zoekt de kaart zelf, net
  als de vriezerkaart (`printerDelen`).
- **Status:** Klaar voor gebruik, Aan het printen of Gestopt. Bij Gestopt staat
  erachter wat de printer er zelf over zegt (`state_message`), in zijn eigen
  taal. Gestopt maakt de chip rood.
- **Inkt:** elk patroon is een tegel met een balk in de kleur van de inkt. De
  kleur zoekt de kaart op woorden in de naam en de entity_id (`inktKleur`),
  want IPP geeft de naam die de printer zelf opgeeft. Een laserprinter
  ("black toner"), een fotozwart en een lichte cyaan worden zo ook herkend.
  Een patroon dat de kaart niet kent, komt achteraan met zijn eigen naam en
  een grijze balk. Zwart is de inkt van het thema: een zwarte balk zie je op
  een donkere kaart niet.
- **Bijna op:** op of onder `marker_low_level` (bij HP 20%). Het woord kleurt
  dan oranje, de statusregel zegt "Zwart bijna op", en de chip let op.
- **Afdrukken:** het totaal staat rechts in de kop. Zwart-wit en kleur staan
  in de tooltip, zodat de kaart op twee rijen blijft.
- **Tikken:** op de kop opent de printer, en op een patroon opent dat patroon.
  Er valt niets te bedienen; IPP kan een printer niet sturen.
- **Merk en type:** de keuzes uit `productfoto.js` (Automatisch, eigen
  afbeelding, geen afbeelding). De foto van de HP ontbreekt nog: `_ref/printers/`
  is leeg. De lijst `PRINTERS` is daarom nog leeg, en de kaart toont het icoon.
  Komt de foto, dan is het één regel in `PRINTERS`.
- **Engels:** alles staat in `src/i18n/en/apparatuur.js`, en `check:taal` is
  groen.

## Bewijs

**Tests.** `tests/js/kantoorprinter.test.mjs` heeft 8 tests (NIEUW GEDRAG),
tegen de dump in `tests/js/vaste-invoer/ipp-hp-officejet-pro-9730e.json`. De
friendly_names stonden niet in de dump. Ze zijn nagebouwd en staan zo vermeld
in `_toelichting`; de kleur komt ook uit de entity_id. Tegen `main` faalt het
bestand, omdat de module daar niet bestaat:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../src/cards/kantoorprinter-logica.js'
ℹ pass 0
```

Alles is groen: 2048 JS-tests, 901 Python-tests, `verify`, `check:registratie`,
`check:controls`, `check:css` en `check:taal`.

**In Chrome, op de werkbank**, met de toestanden, het register en het apparaat
uit de dump. De laatste bouw vóór het ophogen van de versie was
`d137f5084db175f0`, gelijk aan schijf. Daarna veranderde alleen het
versienummer in de bundel.

| Breedte | Inkt | Hoogte | Statusregel | Chip |
|---|---|---|---|---|
| 440 | zoals de dump | 120 | Klaar voor gebruik | neutraal |
| 175 | zoals de dump | 120 | Klaar voor gebruik (afgekapt) | neutraal |
| 440 | zwart op 12% | 120 | Klaar voor gebruik / Zwart bijna op | let op (`rgb(250,178,25)`) |
| 175 | zwart op 12% | 120 | idem, afgekapt | let op |

- **De eerste meting op 175 breed** gaf 184. De statusregel liep toen over
  drie regels. In de smalle vorm staat nu alleen het getal, zonder
  "afdrukken", en wordt de statusregel afgekapt.
- **Echte kliks:** een klik op Cyaan (`isTrusted=true`) opende
  `sensor.…_cyan_cartridge`, en een klik op de naam opende de printer.
- **Licht thema:** de kaart is wit (`rgb(255,255,255)`), de balk van zwart is
  de inkt van het thema, en "Zwart" bij bijna op is oranje.

## Wat niet lukte

- **Geen productfoto:** `_ref/printers/` is nog leeg. Die komt in een volgende
  ronde.
- **Niet in Home Assistant zelf gemeten:** de kaartkiezer en de editor zijn
  niet getest. Op de MacBook is geen testinstance, en bij de klant staat nog
  0.83.1.
- **Gestopt** komt alleen uit de test: in de dump staat de printer op idle.

## Aannames

- **Het type heet `domotiapp-kantoorprinter-card`**, en niet
  `domotiapp-printer-card`, omdat die naam al van de 3D-printer is.
- **De uitsplitsing zwart-wit/kleur** staat in een tooltip en niet op de
  kaart. De eigenaar vroeg om "het aantal afdrukken", en zo blijft de kaart
  twee rijen.
- **Een patroon met zijn eigen woord:** de kleuren krijgen het woord van de
  kaart (Zwart, Cyaan), net als een stand. Een onbekend patroon houdt de naam
  van de printer.
- **Een patroon op of onder `marker_low_level`** telt als bijna op. Zo noemt
  IPP die grens.

## git status --porcelain

```
(leeg na de commit van dit rapport)
```
