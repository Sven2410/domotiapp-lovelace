# 0.91.0: de weerstationkaart

Gevraagd op 31 oktober 2026: *"en ik wil eigenlijk ook een weerstation kaart hebben"*,
met *"beheer geeft jou daar de info van wat er op moet"*. Het station is de Shelly BLU
Weather Station (SBWS-90CM) via BTHome.

## Samenvatting

`custom:domotiapp-weerstation-card`. Je kiest de temperatuursensor; de rest zoekt de
kaart op hetzelfde apparaat, op `device_class` en `translation_key`, en niet op de naam.

| Wat | Hoe |
|---|---|
| bovenaan | temperatuur groot, vochtigheid en dauwpunt eronder, "Regent nu" als de moisture-sensor aan staat |
| wind | snelheid, windstoten, en de richting als kompasnaald met tekst ("O (104°)"). Eenheid: zoals de sensor het meldt, km/h, m/s of Beaufort |
| kleine tegels | neerslag, UV-index met de WHO-schaal, lichtsterkte, luchtdruk in hPa met de richting over 3 uur |
| batterij | alleen een waarschuwing onder de 20% |
| een tik | de details van die sensor |

Wat er niet is of niets meldt, staat er niet. Valt de temperatuursensor weg, dan staat er
"Niet bereikbaar". Elke rol is in de editor met de hand te kiezen, onder een uitklapblok.

**De wind:** BTHome noemt wind en windstoot allebei "Speed", zonder verder onderscheid.
De laagste index is de wind. Blijken ze andersom te staan, dan draait de kaart ze om,
want een stoot is nooit lager dan de wind.

**De kompasnaald** wijst naar de gemeten richting. Of 104° betekent dat de wind daar
vandaan komt of daarheen gaat, is niet gecontroleerd op het station; de kaart beweert het
dus niet, en schrijft alleen "O (104°)".

**De trend** vraagt elk kwartier de geschiedenis op. Stijgend of dalend bij minstens 1 hPa
verschil over 3 uur, en pas met minstens een uur aan metingen.

## Gemeten

Testinstance op de mini-pc (HA 2026.8.1), headless Chromium met Playwright en echte kliks
(`isTrusted: true`), met een nagebootst station naar de dump. De `?v=` van de geladen
bundel (`b4d1b911a212`) was gelijk aan de sha256 op schijf.

| Stand | Uitkomst |
|---|---|
| de dump | 24,7 °C · Vochtigheid 39 % · Dauwpunt 9,8 °C · Wind 0,9 m/s, stoten 1,7 m/s, O (104°), naald `rotate(104deg)` · Neerslag 0,0 mm · UV 5 Matig · 78.000 lx · 1.011,8 hPa stijgend |
| regen, storm, UV 9, batterij 12% | "Regent nu", Wind 8,0, stoten 14,0, ZW (225°), naald `rotate(225deg)`, UV 9 Zeer hoog met een rode stip, "Batterij bijna leeg: 12%" |
| wind 14, stoot 8 | rechtgezet: Wind 8,0, stoten 14,0 |
| klik op de windtegel | de details van de sensor die nu de wind is |
| km/h in de echte keuzelijst, opslaan | Wind 29 km/h, stoten 50 km/h; `wind_eenheid: "kmh"` in de YAML |
| temperatuursensor weg | "Niet bereikbaar" |
| telefoon, 393 breed | geen overloop, `scrollWidth` 393, tegels twee naast twee |

De kaarthoogte is 376, en (376 + 8) / 64 valt op het raster. Geen paginafouten.

De trend is gemeten op drie metingen die met de hand in de recorder zijn gezet (1009,2 tot
1010,8 hPa), naast de huidige 1011,8.

**Proeven:** `tests/js/weerstation-logica.test.mjs`, 17 tests, NIEUW GEDRAG, op de echte
dump (`tests/js/vaste-invoer/shelly-blu-weerstation.json`, zonder MAC en zonder
installatie). De kaart bestond niet, dus een run op de oude code zegt niets en is niet
gedraaid. JS 2147 en Python 987 groen; `verify`, `check:registratie`, `check:css`,
`check:controls` en `check:taal` groen.

## Wat niet lukte

- **Niet op het echte station gemeten.** Dat doet de beheersessie na de uitgave.
- **De tegelindeling na de laatste wijziging** is gemeten op de telefoon; de vier tegels op
  één rij bij een brede kaart zijn niet in beeld gezien.
- **Niet gemeten:** het lichte thema, en Beaufort in de browser (wel in de tests).
- **Niet gebouwd:** de verwachting uit een weather-entiteit, die beheer optioneel noemde,
  en een compacte stand.

## Aannames

- De volgorde en inhoud zijn het voorstel van de beheersessie, die zei dat de eigenaar dat
  aan die sessie overliet.
- Regen krijgt het accent; UV de statuskleuren, want daar is de kleur een oordeel.
- De neerslag staat er als "Neerslag" zonder periode: de sensor zegt niet over welke
  periode hij telt.
- Een kale `device_class` temperature in de kiezer: een sensor zonder die klasse is alleen
  via de code-editor te kiezen.

## git status --porcelain

Leeg na de commit van deze ronde.
