# 0.121.0: een poort op een pulsrelais

Gemeld door een beheersessie bij een klant, 12 november 2026. De eigenaar: "via de integratie wel, dus ligt aan lovelace".

## Wat er mis was

De poort zit op een pulsrelais: één puls opent, de volgende sluit. De integratie (PalGate) belooft OPEN, CLOSE en STOP
(`supported_features` 11), maar kan alleen `open_cover`. Sluiten op de rolluikkaart stuurde `close_cover`, en Home
Assistant gaf een `NotImplementedError`. Na een puls blijft de toestand ook eeuwig op `opening`, want er komt geen
terugmelding.

Aan `supported_features` ziet de kaart dit niet, omdat die niet kloppen.

## Wat er veranderd is

- **Een vinkje per rolluik: "... werkt met één puls"** (`puls: true` in `covers`, of voor de hele kaart).
- **Met dat vinkje staat er één knop.** Bij een poort heet hij "Openen / sluiten", anders "Open / dicht". Hij stuurt
  altijd `open_cover`, ook bij een omgekeerde motor.
- **Geen stop, geen schuif en geen statusregel**, ook als die aan staan. De toestand wordt genegeerd, en het icoon blijft
  in rust. "Niet bereikbaar" blijft wel staan.
- **De knop is alleen grijs als de entiteit niet eens OPEN belooft**, of niet bereikbaar is.
- **In de editor** verdwijnt "omgekeerd aangesloten" zolang het vinkje aan staat. Een puls heeft geen richting.
- De logica staat in `isPuls`, `knoppen` en `dienstVoor("puls")` in `cover-logica.js`.

## Gemeten

**Test, NIEUW GEDRAG.** `tests/js/cover-logica.test.mjs`, "een poort met één puls", 5 tests. Daarvan is er één een
REGRESSIEWACHT: zonder puls blijven de knoppen gewoon open, stop en dicht. Op 0.120.0 faalt het bestand:
`does not provide an export named 'isPuls'`.

**Testinstance, als telefoon.** 390 breed, met `isMobile` en `hasTouch`. De geladen bundel was die op schijf
(`a52dd1b38b6a`). Nagebootst is `cover.test_poort`: `opening`, `garage`, `supported_features` 11, zoals de echte. Er
stonden drie kaarten:

| kaart | knoppen | schuif | status | kaart (b × h) | vak scrollWidth / clientWidth |
|---|---|---|---|---|---|
| poort met puls, de config van de klant (stop, positie aan) | "Openen / sluiten", 115×32 | nee | leeg | 374 × 56 | 372 / 372 |
| rolluik met positie, met puls | "Open / dicht", 91×32 | nee | leeg | 374 × 56 | 372 / 372 |
| hetzelfde rolluik zonder puls (REGRESSIEWACHT) | open, stop, dicht | ja | "10% open" | 374 × 120 | 372 / 372 |

- De pagina was 390 / 390, en de knoppen stonden 13px van de rechterrand.
- **Tikken op de twee pulsknoppen** gaf op de bus `cover.open_cover {"entity_id":"cover.test_poort"}` en
  `cover.open_cover {"entity_id":"cover.hall_window"}`. Er kwam geen `close_cover` of `stop_cover`. Het poorticoon bleef in
  rust.
- **De editor.** De poortkaart is in de echte bewerkmodus geopend, met een tik. De velden waren: Naam, "Poort is een
  poort", "Poort werkt met één puls", Stopknop, Status. "Omgekeerd aangesloten" stond er niet.
- **Het pulsvinkje uittikken** liet "Poort omgekeerd aangesloten" verschijnen, en haalde `puls` uit de config. Het
  voorbeeld toonde daarna open, stop en dicht.
- Alle 9 gebeurtenissen waren `isTrusted: true`, waarvan 4 tikken. Er waren geen fouten in de console.
- Er is niet opgeslagen, en de proefview is daarna weggehaald.

JS-tests 2394 groen. Bundel, registratie, controls, css en taal groen. Python is niet gewijzigd.

## Samenvatting

De rolluikkaart kent een vinkje per rolluik voor een poort op een pulsrelais. Dan is er één knop die altijd openen
stuurt, zonder stop, schuif of status. Zo werkt een poort waarvan de integratie sluiten belooft maar niet kan.

## Wat niet lukte

Niet tegen de echte poort gemeten: die staat bij een klant, en daar schakelen is aan de beheersessie.

## Aannames

- **Eén knop met beide woorden** ("Openen / sluiten"), en niet twee knoppen die allebei openen sturen. Twee knoppen
  zouden een richting beloven die de kaart niet kent.
- **Het vinkje gaat voor `show_stop` en `show_position`.** Wie puls aanvinkt, wil die bij deze poort niet.
- **Het proefrolluik van de demo** (`cover.hall_window`) ging door de tik open (10% naar 100%). Dat hoort bij de demo, en
  is niet teruggezet.

## git status --porcelain

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/cover-card.js
 M src/cards/cover-logica.js
 M src/i18n/en/klimaat.js
 M tests/js/cover-logica.test.mjs
?? docs/pulspoort/
```
