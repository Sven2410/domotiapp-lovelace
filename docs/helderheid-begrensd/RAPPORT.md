# De helderheid blijft tussen 0 en 100 % (0.131.0)

Bij een klant toonde de lichtkaart "Hanglamp 89864600%". Dat meldde beheer van die klant op 16 november 2026, met een
schermafdruk van de eigenaar.

De oorzaak zit buiten de kaart, maar de kaart nam de waarde zonder controle over:
- Een Shelly Dimmer Gen3 met firmware 2.2.0 begint na een firmware-update zonder geldige helderheid
  (-2147483648 of 2147483647).
- Dimmen met de knop rekent daar verder mee.
- Home Assistant gaf `brightness: 229154730` door.
- De kaart rekende `229154730 / 255 × 100` uit, en dat is precies 89 864 600.

De eigenaar: *"begrens het helderheidspercentage in de kaarten tot 0–100 %"*.

## Wat er veranderd is

`helderheidProcent(brightness)` in `src/cards/light-logica.js` is nu de enige omrekening:
- 0 tot 255 wordt een percentage, en een brandende lamp staat op minstens 1 %, zoals voorheen;
- al het andere (buiten 0 tot 255, geen getal, oneindig) geeft `null`: geen meting.

Daar gebruiken de drie kaarten die zelf rekenden hem nu voor:

| Kaart | Bij een geldige helderheid | Bij een onzinwaarde |
|---|---|---|
| lichtkaart | "50%", schuif op 50 | "Aan", schuif vol (de lamp brandt) |
| entiteitenkaart | "50%" | "Aan" (de toestand van Home Assistant) |
| infoscherm | "Aan · 50%" | "Aan" |

Een getal boven de 100 % komt dus nergens meer op het scherm. Een getal dat er niet is, verzint de kaart ook niet.

De scènekaart en de scène-editor hadden het al goed: die klemmen de helderheid op 0 tot 255 (`alsProcent` en
`klem` in `src/scene/lamp-besturing.js`).

## Gemeten

Playwright, 390 breed, `isMobile` en `hasTouch`. Verse code: `?v=cc21625c5d8b`, gelijk aan de sha256 op schijf.

In de testinstance zijn met `POST /api/states` vier lampen aangezet:

| Lamp | brightness |
|---|---|
| `light.test_lamp_dim` | 229154730 (de waarde van de klant) |
| `light.test_lamp_kleurtemp` | -2147483648 |
| `light.bed_light` | 2147483647 |
| `light.ceiling_lights` | 128 (gewoon) |

Wat de kaarten op view `thema` tonen:
- **Lichtkaart:** bij de dim-lamp, de kleurtemperatuurlamp en Bed Light "Aan", met de schuif vol; bij de RGB-lamp
  (255) "100%".
- **Entiteitenkaart:** "Bed Light Aan", en "Ceiling Lights 50%".
- **Infoscherm:** "Aan" voor de twee lampen met een onzinwaarde, en "Aan · 70%" voor een gewone lamp.

Alle kaarten houden hun hoogte. De pagina is 390 = 390 breed. Geen paginafouten.

## Proeven

`tests/js/helderheid-begrensd.test.mjs` heeft 4 proeven, NIEUW GEDRAG:
- `helderheidProcent` met geldige waarden;
- `helderheidProcent` met de waarden van de Shelly en de randen (256, -1, NaN, Infinity, null, een tekst);
- en, door de bron te lezen, dat de drie kaarten niet meer zelf door 255 delen, en dat de lichtkaart "Aan" zegt.

Tegen de code van main valt hij al bij het laden:

```
# SyntaxError: The requested module '../../src/cards/light-logica.js' does not provide an export named 'helderheidProcent'
# pass 0
# fail 1
```

Alles bij elkaar:
- 2511 JS-proeven en 1155 Python-proeven, groen;
- `verify`, `check:registratie`, `check:controls`, `check:css` en `check:taal`, groen.

## Samenvatting

0.131.0 toont nooit meer dan 100 %. Meldt een lamp een helderheid die geen meting kan zijn, zoals een Shelly na een
update, dan staat er "Aan" zonder getal.

## Wat niet lukte

- **Niet met een echte Shelly gezien.** De waarde is nagebootst met `POST /api/states`. Bij de klant is de Shelly al
  gerepareerd, met een script in de dimmer.
- **Alleen op 390 breed gemeten.** Er verandert alleen tekst, dus geen maat.

## Aannames

- Bij een onzinwaarde staat de schuif vol, met "Aan" ernaast. Leeg zou lezen als uit, en de lamp brandt.
- Versie 0.131.0: een reparatie op drie kaarten, met een nieuwe gedeelde functie.

## git status --porcelain

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/entities-card.js
 M src/cards/infoscherm-card.js
 M src/cards/light-card.js
 M src/cards/light-logica.js
?? docs/helderheid-begrensd/
?? tests/js/helderheid-begrensd.test.mjs
```
