# 0.113.0: afval, lampen en wie er thuis is van de overzichtskaart af

De eigenaar, 8 november 2026, over 0.112.0: *"Afval heb ik links bij favorieten al staan dus die wil ik niet op het
overzichtkaart. Lampen aan ook niet dat is een badge. Wie er thuis is ook niet dat is de person kaart snap je"*

## Wat er veranderd is

De regels afval, lampen en thuis zijn helemaal weg, niet alleen uit te zetten: de instellingen `afval`, `lampen`, `thuis`
en `personen` staan niet meer in de editor, en een kaart die ze uit 0.112.0 nog heeft, slaat ze over. Op de kaart blijven
alarm, open/niet op slot, agenda en batterij. In de kop van `overzicht-logica.js` staat waarom, zodat ze er niet terugkomen.

## Bewijs

- `tests/js/overzicht-logica.test.mjs`: de lijst in volgorde zonder die drie, en een nieuwe toets (**NIEUW GEDRAG**)
  die afval, lampen en thuis meegeeft en een lege lijst eist. Op 0.112.0 faalt hij:

  ```
  not ok 3 - afval, lampen en wie er thuis is staan er niet op, ook niet als ze worden meegegeven
    Expected values to be strictly deep-equal:
    + [ { bij: 'morgen', entity: 'sensor.gft', icoon: 'bin', soort: 'afval', tekst: 'GFT', toon: 'warn' } ...
  ```

- JS 2338 groen (vijf toetsen vervielen met de functies), `check:taal`, `check:css`, `check:registratie`,
  `check:controls` groen.
- In de testinstance, verse bundel (`?v=e0efebeeedf6` gelijk aan schijf), dezelfde config als bij 0.112.0 (met
  afvalsensoren erin): regels alarm, open (2), agenda (3) en batterij; geen afval, lampen of thuis. Op het raster op
  iPad staand (568) en telefoon (632). Tik op een favoriet en op een regel met `isTrusted: true` werkten. De editor heeft
  negen velden, en het naamveld nam "Bram Visser" met een echte spatie aan.

## Wat niet lukte

Niet op een echte iPad bekeken.

## Aannames

Geen aannames gedaan.

## git status --porcelain

Leeg na de commit.
