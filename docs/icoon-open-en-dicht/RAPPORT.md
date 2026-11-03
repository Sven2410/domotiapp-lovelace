# Geen power-icoon bij open en dicht (0.104.2)

3 november 2026, tak `fase-153/icoon-open-en-dicht`. De eigenaar, met een schermafdruk van een rolluik zonder stand onder "Alleen open en
dicht": "waarom een power icon bij open en dicht?"

## Samenvatting

Het icoon stond vast in de code: `power` voor de groep zonder stand, en ook voor het moment "Dicht". Het power-icoon betekent aan en
uit, maar een rolluik gaat open en dicht. Nu is het icoon:

| Waar | Alleen rolluiken | Alleen zonneschermen | Met een lamp erbij | Alleen lampen |
|---|---|---|---|---|
| groep "Alleen open en dicht" | rolluik (dicht) | zonnescherm | power (de kop zegt dan "aan en uit, of open en dicht") | power |
| moment Dicht / Uit | rolluik (dicht) | rolluik (dicht) | power | power |
| moment Open / Aan | rolluik (open), zoals het al was | rolluik (open) | rolluik (open) | lamp |

## Gemeten

In de testinstance, als gewone gebruiker (Receptie), met Playwright headless en echte kliks: 8 kliks, alle 8 `isTrusted`. De bundel in
de pagina (`?v=0bf1203a3dc8`) is gelijk aan die op schijf, en er waren geen fouten in de pagina.

`cover.hall_window` stond tijdelijk op alleen open en dicht (`supported_features: 3`, geen stand), net als het rolluik op de
schermafdruk. Daarna is hij teruggezet zoals hij was. `cover.kitchen_window` is het zonnescherm van de testkaart.

Per gekozen apparaat staat hieronder het begin van de tekening in elke kop. Ernaast staat het icoon met hetzelfde begin in `icons.js`.

| Gekozen | Alleen open en dicht | Open / Aan | Dicht / Uit |
|---|---|---|---|
| rolluik zonder stand | `M3.6 4.2h16.8M5.2 4.2v13.4` (shutter) | `…v15.6` (shutterOpen) | `…v13.4` (shutter) |
| zonnescherm | `M2.8 11.4 6.2 5h11.6l3.4 6.4z` (awning) | shutterOpen | shutter |
| rolluik en zonnescherm | shutter | shutterOpen | shutter |
| een lamp | (geen groep) | `M9.4 18.4h5.2` (bulb) | `M12 3.6v8` (power) |

**De proeven:** 2285 JS en `verify`, `check:taal`, `check:controls` en `check:registratie` zijn groen. Er is geen nieuwe proef: dit zit
in het scherm, en dat meten we in een browser, niet met jsdom.

## Wat niet lukte

Niets.

## Aannames

- Het moment Open bij een zonnescherm houdt het open rolluik, zoals het al was. Alleen het power-icoon is weggehaald.

## git status --porcelain

```
(schoon na de commit)
```
