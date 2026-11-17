# Windbeveiliging: onder Automatiseringen, en niet bij elke vlaag opnieuw (0.133.0)

De eigenaar had twee wensen, op 17 november 2026 en via zijn beheersessie, na 0.132.0 op zijn eigen installatie.

1. **Niet bij elke windvlaag opnieuw intrekken.** Bij vlagerige wind kwam de windsensor die middag acht keer boven de
   30 km/h:
   - 14:02, 14:40, 14:42, 14:45, 14:48, 14:49, 15:10 en 15:12.
   - Drie schermen zijn Somfy RTS. Die hebben `assumed_state` en een onbekende stand.
   - Volgens 0.132.0 kregen ze dus bij elke overschrijding een opdracht. Dat is geen schade, maar hij wil het niet.
   - Het voorstel van de beheersessie heeft hij goedgekeurd.
2. **De windbeveiliging onder Automatiseringen.** Hij wil hem als de eerste rij in die lijst, niet als eigen blok onder
   Favorieten. Er stond "Nog geen automatiseringen" terwijl er wel een draaide.

## Wat er veranderd is

**Niet bij elke vlaag.** Een scherm met een bekende stand blijft zoals in 0.132.0: staat hij al in, dan geen opdracht,
anders wel.

Een scherm zonder bekende stand (`assumed_state`, of een stand die geen `open`, `closed`, `opening` of `closing` is) krijgt
na een ingreep pas weer een intrekopdracht als een van deze twee geldt:
- **(a)** er ging sindsdien een andere opdracht dan intrekken naar dat scherm.
  - Dat kan van welke bron ook komen: een regel, een kaart of een dienstaanroep. De motor luistert op `call_service` voor
    `cover`.
  - Intrekken is `close_cover`, bij een omgekeerd scherm `open_cover`, of `set_cover_position` op 0 (omgekeerd 100).
  - Een doel op ruimte, apparaat, verdieping of label telt voor alle zonneschermen, want welke eronder vallen weet de motor
    niet.
- **(b)** er zijn 30 minuten verstreken sinds de vorige ingreep (`WIND_OPNIEUW_MIN`), omdat uitrollen met de
  afstandsbediening niet in Home Assistant te zien is.

Per scherm staat in de opslag (`wind_schermen`) wanneer de wind hem introk, en of er sindsdien iets anders naartoe ging.
Zo overleeft het een herstart.

**De rij Windbeveiliging** staat direct onder de kop Automatiseringen, vóór de regels:
- het icoon van het zonnescherm;
- "Windbeveiliging" als naam;
- daaronder dezelfde tekst als in 0.132.0.

Staat de rij er, dan staat "Nog geen automatiseringen" er niet. Tussen de rij en een regel eronder staat een lijn, net als
tussen twee regels. Het eigen blok onder Favorieten is weg.

## Gemeten

Playwright, 390 en 320 breed, `isMobile` en `hasTouch`. Verse code: `?v=0ff4be2c10d6`, gelijk aan de sha256 op schijf.
De meting gebruikt view `automatisering` van `kaart-test`, met de demo-`cover.kitchen_window` als zonnescherm.

**De plek, op 390:**

| | Kop Automatiseringen | Leeg-tekst | Windbeveiliging | Eerste regel | Favorieten |
|---|---|---|---|---|---|
| zonder regel | 104–138 | weg | 146–269 | | 285–379 |
| met een regel | 106–140 | weg | 148–271 | 280–339, lijn erboven 1px | 347–441 |

Verder:
- Niets steekt opzij uit: het vak is 348 = 348, de pagina 390 = 390 en 320 = 320.
- Een tik op de rij kwam aan met `isTrusted: true` en opende de windsensor.
- Geen paginafouten. De schermafdruk met een regel eronder is bekeken.

**De vlagen.** Het scherm is nagebootst als Somfy RTS: met `POST /api/states` op `unknown` gezet, met `assumed_state`.

| Stap | Aanroepen |
|---|---|
| eerste vlaag (11 m/s) | `close_cover` |
| rustig, scherm weer onbekend, tweede vlaag binnen het half uur | geen |
| rustig, `open_cover` via Home Assistant (uitrollen), derde vlaag | `close_cover` |

Op 320 gaf de eerste vlaag terecht niets. De meting op 390 had dat scherm een minuut eerder ingetrokken, en die tijd stond
in de opslag.

## Proeven

`tests/automatisering/test_zonneschermen.py` kreeg 6 proeven, NIEUW GEDRAG:
- de middag van de eigenaar: binnen het half uur één keer, daarna weer;
- een uitrolopdracht mag meteen weer;
- een opdracht op een ruimte telt voor alle schermen, behalve als het voor dat scherm intrekken is;
- `set_cover_position` naar ingetrokken telt niet als uitrollen;
- met een bekende stand geldt het half uur niet;
- het half uur overleeft een herstart.

Tegen de code van main falen alle 6. `test_harde_wind_trekt_ze_een_keer_in` liet een tweede vlaag direct weer intrekken.
Hij doet dat nu een half uur later; zo hoort het nu.

`tests/js/windbeveiliging-zichtbaar.test.mjs` kreeg 1 proef, NIEUW GEDRAG: de volgorde in de bron (leeg-tekst, wind,
lijst, favorieten) en de leeg-tekst die wijkt.

Alles bij elkaar:
- 2524 JS-proeven en 1170 Python-proeven, groen;
- `verify`, `check:registratie`, `check:controls`, `check:css` en `check:taal`, groen.

## Samenvatting

0.133.0 zet de windbeveiliging als eerste rij onder Automatiseringen. Een scherm zonder terugmelding krijgt na een ingreep
pas weer een intrekopdracht na een uitrolopdracht in Home Assistant, of na 30 minuten. Op de middag van de eigenaar waren
dat 2 ingrepen in plaats van 8.

## Wat niet lukte

- **Niet met een echt RTS-scherm gezien.** De onbekende stand is nagebootst op een demomarkies.
- **Alleen in het lichte thema gemeten.**

## Aannames

- "Uitrollen" is elke opdracht die geen intrekken is, ook stoppen of omschakelen. Liever een keer te veel intrekken dan
  een uitgerold scherm missen.
- Een doel op ruimte, apparaat, verdieping of label telt voor alle zonneschermen.
- Een scherm met een bekende stand houdt de regel van 0.132.0: alleen wat niet in staat.
- Versie 0.133.0: ander gedrag en een andere plek op het scherm.

## git status --porcelain

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/automatisering/motor.py
 M custom_components/domotiapp_lovelace/automatisering/store.py
 M custom_components/domotiapp_lovelace/automatisering/wind.py
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/automatisering-card.js
 M tests/automatisering/test_zonneschermen.py
 M tests/js/windbeveiliging-zichtbaar.test.mjs
?? docs/wind-niet-bij-elke-vlaag/
```
