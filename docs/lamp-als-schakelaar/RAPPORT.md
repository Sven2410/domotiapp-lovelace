# 0.89.1: de lichtkaart kan een dimbare lamp als schakelaar tonen

Gevraagd op 31 oktober 2026, via een beheersessie: een dimblokje met lampen die niet
kunnen dimmen meldt `supported_color_modes: ["brightness"]`, en dan tekende de kaart
altijd een schuif. Bij zulke spots staat het minimum en maximum op 99 en 100%, en doet
die schuif niets.

## Samenvatting

In de editor van de lichtkaart staat een vinkje **Alleen aan en uit**
(`schakelaar: true`). Dan tekent de kaart de tuimelaar in plaats van de schuif, ook als
de lamp kan dimmen. Zonder vinkje verandert er niets. De lamp kan dit zelf niet melden,
dus het is een keuze van wie de kaart instelt. De kleurstrips volgen hun eigen vinkje.

De beslissing staat in `src/cards/light-logica.js`, zodat hij zonder browser te toetsen
is.

## Gemeten

Testinstance op de mini-pc (HA 2026.8.1), headless Chromium met Playwright en echte
kliks (`isTrusted: true`), met `light.test_lamp_dim` (`["brightness"]`). De `?v=` van de
geladen bundel (`fd8de8047454`) was gelijk aan de sha256 op schijf.

| Stap | Bediening | Tekst | Lamp | Kaarthoogte |
|---|---|---|---|---|
| zonder vinkje | schuif | Uit | uit | 56 |
| vinkje gezet in de editor, voorbeeld | tuimelaar | | | |
| opgeslagen en herladen | tuimelaar | Uit | uit | 56 |
| klik | tuimelaar, aan | Aan | aan | 56 |
| nog een klik | tuimelaar, uit | Uit | uit | 56 |

In de YAML: `"schakelaar": true`. Geen paginafouten.

**Proeven:** `tests/js/lamp-als-schakelaar.test.mjs`, 7 tests. Op de code van vóór deze
ronde valt het bestand om (`ERR_MODULE_NOT_FOUND`): `light-logica.js` bestond niet. De
tests die dat gedrag vastleggen zijn als REGRESSIEWACHT gelabeld. JS 2125 en Python 987
groen; `verify`, `check:registratie`, `check:css`, `check:controls` en `check:taal` groen.

## Wat niet lukte

- **Niet gemeten op de echte lamp.** Dat doet de beheersessie na de uitgave.
- **Niet gemeten:** de telefoonbreedte en het lichte thema; de tuimelaar bestond al.

## Aannames

- De veldnaam `schakelaar` en de tekst "Alleen aan en uit". De vraag stelde `dimmen:
  false` of `schakelaar: true` voor.

## git status --porcelain

Leeg na de commit van deze ronde.
