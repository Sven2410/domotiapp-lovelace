# 0.92.0: merk, type en foto op de weerstationkaart

Gevraagd op 31 oktober 2026: *"ik wil bij het weerstation ook een afbeelding kunnen
toevoegen net als de batterij kaart"*, en *"ook merk kiezen van het weerstation zoals
batterij en overig"*. Over de foto: *"Je hebt toestemming en ik ook van Shelly"*.

## Samenvatting

In de editor van de weerstationkaart staan nu **Merk** en **Type**, met de regels van
`productfoto.js`, net als op de boiler en de stofzuiger:

| Merk | Wat de kaart toont |
|---|---|
| Automatisch | een eigen afbeelding als die er is, anders de foto bij de modelcode, anders de thermometer |
| Shelly, type BLU Weather Station (SBWS-90CM) | de foto van de Shelly |
| Ander merk (eigen afbeelding) | de foto die je kiest, anders de thermometer |
| Geen afbeelding (icoon) | de thermometer |

**Automatisch herkent de Shelly via BTHome niet.** Die meldt geen fabrikant en als model
"BTHome sensor". Op zo'n algemene naam kiezen we geen foto, want een verkeerde foto is
erger dan geen. De hulptekst bij Merk zegt het: kies daar zelf Shelly. De modelcode staat
er voor een integratie die hem wel meldt.

**De foto** kwam van de eigenaar (1000 bij 1000, transparant). De lege rand is eraf en hij
is 396 hoog gemaakt, als `afbeeldingen/weerstations/shelly-blu-weather-station.webp`
(14.906 bytes). Dat adres staat in `VASTE_WEBP`: alleen aanvullen, nooit hernoemen. **Op
het apparaat op de foto staat ook het merk Ecowitt** ("ecowitt WS90, powered by Shelly").

## Gemeten

Testinstance op de mini-pc (HA 2026.8.1), headless Chromium met Playwright en echte kliks
(`isTrusted: true`), met het nagebootste station, dat net als BTHome geen fabrikant meldt.
De `?v=` van de geladen bundel (`8f7c51188664`) was gelijk aan de sha256 op schijf.

| Stap | Uitkomst |
|---|---|
| Automatisch | thermometer, geen foto |
| de echte keuzelijst Merk | Automatisch, Shelly, Ander merk, Geen afbeelding |
| Shelly kiezen | het veld Type verschijnt, het voorbeeld toont de foto (`naturalWidth` 187, vak 58 bij 72) |
| opslaan | `"merk":"shelly","model":"blu_weather_station"` in de YAML |
| na herladen | de foto, de kaart 376 hoog: (376 + 8) / 64 valt op het raster |
| telefoon, 393 breed | de foto, `scrollWidth` 393 |
| licht thema | de foto laadt en het witte station blijft zichtbaar op zijn grijze vlak |

Geen paginafouten.

**Proeven:** 4 nieuwe JS-tests in `tests/js/weerstation-logica.test.mjs` en de foto in
`VASTE_WEBP` van `tests/test_afbeeldingen.py`, NIEUW GEDRAG. Op de oude code bestaat de
functie niet, en de run is niet apart gedraaid. JS 2151 en Python 989 groen; `verify`,
`check:registratie`, `check:css`, `check:controls` en `check:taal` groen.

## Wat niet lukte

- **Niet op de echte installatie gemeten.**
- **"Ander merk" en "Geen afbeelding" zijn niet in de browser gekozen;** de uitkomst ervan
  staat in de tests, en de kiezer is dezelfde als op de andere kaarten.

## Aannames

- De toestemming van Shelly is zoals de eigenaar die noemde; de stukken zelf heb ik niet
  gezien. Of die ook het merk Ecowitt op de foto dekt, is aan de eigenaar.

## git status --porcelain

Leeg na de commit van deze ronde.
