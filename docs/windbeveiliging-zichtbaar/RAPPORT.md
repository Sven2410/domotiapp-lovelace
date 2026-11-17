# De windbeveiliging staat op de automatiseringskaart (0.132.0)

De eigenaar, 17 november 2026, via zijn beheersessie. Bij een windstoot gingen zijn zonneschermen omlaag, en hij wist niet
waarom. De beveiliging stond nergens op de kaart, alleen in de editor. Twee keer kwamen de windstoten boven de grens van
30 km/h (9,4 en 11,4 m/s). Telkens stuurde de motor `close_cover` naar de vier zonneschermen van de kaart.

Drie van die vier zijn knikarmschermen die Somfy (Overkiz) als ExteriorScreen kent, met `device_class: blind`. Daar is
`close_cover` de motor omlaag, en dat is bij een knikarm **uitrollen**. Intrekken bij de wind rolde ze dus juist uit.

Wat hij wil:
1. de windbeveiliging zichtbaar op de kaart: de sensor, de grens, welke schermen, en wanneer hij voor het laatst ingreep;
2. zonneschermen kunnen omkeren.

## Wat er veranderd is

**Het blok Windbeveiliging.** Het staat op elke automatiseringskaart met zonneschermen, onder Favorieten:

| Stand | Kop | Kleur van het icoon |
|---|---|---|
| rustig | "Wind 7 km/h", met "Boven 30 km/h gaan de zonneschermen in en rollen ze niet uit." | accent |
| te hard | "Wind 41 km/h: te hard", met "Boven 30 km/h rollen de zonneschermen niet uit." | let op (kop ook) |
| geen meting | "Geen windmeting", met "Zonder meting rollen de zonneschermen niet uit." | let op (kop ook) |
| geen sensor | "Geen windsensor", met "De zonneschermen hebben geen windgrens." | grijs |

Daaronder staan drie regels:
- de sensor;
- de schermen, met de namen van de kaart;
- de laatste ingreep, bijvoorbeeld "Laatst ingetrokken: vandaag 14:40, bij 41 km/h" of "Laatst tegengehouden: gisteren 12:00,
  zonder windmeting". Is er nog niets gebeurd, dan staat er "Nog niet ingegrepen".

Een tik op het blok opent de windsensor.

Het blok laat zien wat de MOTOR doet, niet wat er op deze ene kaart staat. De server geeft daarom `wind` mee in de stand:
`{sensor, max, schermen, laatst}`. De motor kent één windsensor voor het hele huis, die van de eerste kaart met een
windsensor. De wind van nu leest de kaart zelf uit de sensor, met dezelfde omrekening als de server (`windKmh`). Zo loopt
het getal mee zonder dat de server bij elke meting iets stuurt.

**De laatste ingreep staat in de opslag** (`wind` in `automatisering/store.py`), en overleeft dus een herstart. Er zijn
twee soorten:
- `ingetrokken`: de wind kwam boven de grens;
- `niet_uitgerold`: een regel of favoriet wilde uitrollen, maar de motor hield het tegen.

**Wat al in staat, krijgt geen opdracht.** Dit was het voorstel van de beheersessie:
- Meldt een scherm zelf dat hij in staat, dan stuurt de motor niets. In staat is `closed`, of `open` bij een scherm in
  `omgekeerd`. Staan ze allemaal al in, dan is dat ook geen ingreep.
- Een motor zonder terugmelding (`assumed_state`, of een onbekende stand) gaat wel altijd in, zoals voorheen.

**Zonneschermen omkeren kon al.** De editor bood "Motor omgekeerd" sinds 0.104.0 aan voor rolluiken én zonneschermen
(`schema()` voegt ze samen), en de motor keerde ze om. Alleen de uitleg noemde alleen rolluiken. Nu zegt de uitleg
"Rolluiken en zonneschermen".

Er is ook een waarschuwing bij elk zonnescherm dat zich niet als zonnescherm (`awning`) meldt en niet omgekeerd staat:

> Let op: Keuken, Kantoor melden zich niet als zonnescherm. Rolt zo'n scherm uit als Home Assistant hem dicht doet, zet hem
> dan hier. Anders rolt de wind hem juist uit.

## Gemeten

Playwright, op 390 en 320 breed, `isMobile` en `hasTouch`. Verse code: de geladen `?v=ce9ca2683311` is gelijk aan de
sha256 op schijf.

De meting gebruikt view `automatisering` van `kaart-test`:
- de demo-`cover.kitchen_window` als zonnescherm;
- de windstoten van het nagebootste weerstation als windsensor (in m/s);
- een grens van 30 km/h.

De stand van de server was `{"sensor": "sensor.weather_station_speed_2", "max": 30.0, "schermen": ["cover.kitchen_window"],
"laatst": null}`.

**Een scherm dat al dicht stond:**
- Een windstoot van 11,4 m/s gaf geen enkele aanroep naar `cover`.
- Er stond geen ingreep.
- Dit is het nieuwe gedrag: de demomarkies meldt zelf `closed`.

**Hetzelfde scherm, eerst open:**

| Stap | Op de kaart | Aanroepen |
|---|---|---|
| 2 m/s | "Wind 7 km/h", icoon accent, "Nog niet ingegrepen" | |
| 11,4 m/s | "Wind 41 km/h: te hard", kop en icoon in de let-op-kleur, "Laatst ingetrokken: vandaag 15:11, bij 41 km/h" | `close_cover` op `cover.kitchen_window`, één keer |
| 2 m/s | "Wind 7 km/h", de laatste ingreep blijft staan | |

**Tikken en breedte:**
- Een tik op het blok kwam aan met `isTrusted: true`, en opende het venster van `sensor.weather_station_speed_2`.
- Niets steekt opzij uit: de pagina is 390 = 390 en 320 = 320, het blok 348 = 348 en 278 = 278.
- De kaart blijft op zijn rasterhoogte (440).

**De editor**, met de echte `hass`:
- Met `cover.kitchen_window` (geen `device_class`) en `cover.garage_door` (`garage`) als zonneschermen staat de
  waarschuwing erbij, met beide namen.
- Staan ze in `omgekeerd`, dan is de waarschuwing weg.
- In de keuzelijst van Motor omgekeerd staan allebei.

Geen paginafouten van de kaart. De schermafdrukken van rustig en van de windstoot zijn bekeken.

## Proeven

`tests/automatisering/test_zonneschermen.py` kreeg 9 proeven:
- **NIEUW GEDRAG** (8):
  - wat al in staat, krijgt geen opdracht;
  - alles al in is geen ingreep;
  - de stand kent de windbeveiliging;
  - zonder zonneschermen geen blok;
  - "niet uitgerold", met en zonder meting;
  - de ingreep overleeft een herstart;
  - het abonnement hoort de ingreep meteen.
- **REGRESSIEWACHT** (1): zonder terugmelding gaat een scherm altijd in. Die slaagde ook op de oude code.

`tests/js/windbeveiliging-zichtbaar.test.mjs` heeft 12 proeven:
- `windKmh` en `windBlok`, in elke stand en in het Engels;
- de laatste ingreep;
- `verdachteSchermen`;
- en, door de bron te lezen, het blok en de uitleg in de editor.

Eén ervan is een **REGRESSIEWACHT**: de editor bood Motor omgekeerd al aan voor zonneschermen.

Tegen de code van main (`git archive`):
- JS: `pass 1`, `fail 11`;
- Python: 8 van de 9 nieuwe falen.

`tests/automatisering/test_websocket.py` vergeleek de hele stand. Die zegt nu ook `"wind": None`.

Alles bij elkaar:
- 2523 JS-proeven en 1164 Python-proeven, groen;
- `verify`, `check:registratie`, `check:controls`, `check:css` en `check:taal`, groen.

## Samenvatting

0.132.0 zet de windbeveiliging op de automatiseringskaart: de wind van nu, de grens, de sensor, de schermen en de laatste
keer dat hij ingreep. Schermen die al in staan, krijgen geen opdracht meer. Een knikarmscherm dat zich als rolluik meldt,
hoort in "Motor omgekeerd" (dat kon al), en de editor waarschuwt daar nu bij.

## Wat niet lukte

- **Niet met een echt Somfy-scherm gezien.** In de testinstance staat een demomarkies. Of de drie ExteriorScreens omgekeerd
  goed intrekken, ziet de eigenaar zodra beheer `omgekeerd` gezet heeft en Overkiz weer aan staat.
- **Alleen in het lichte thema gemeten.**
- **De editor is gemeten als los element in de pagina**, niet in het dialoog van Home Assistant. Dat los hangen gaf
  `localize`-fouten van `ha-form` zelf. De kaart had er geen.

## Aannames

- Het blok staat er altijd als er zonneschermen op de kaart staan, ook zonder windsensor ("Geen windsensor"). Er is geen
  schakelaar om het te verbergen.
- "In staat" volgt de terugmelding van het scherm. Een stand die niet klopt, kan een intrekken overslaan; met
  `assumed_state` gebeurt dat niet.
- Versie 0.132.0: iets nieuws op het scherm.

## git status --porcelain

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/automatisering/motor.py
 M custom_components/domotiapp_lovelace/automatisering/store.py
 M custom_components/domotiapp_lovelace/automatisering/websocket.py
 M custom_components/domotiapp_lovelace/automatisering/wind.py
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/automatisering-card.js
 M src/cards/automatisering-logica.js
 M src/i18n/en/automatisering.js
 M tests/automatisering/test_websocket.py
 M tests/automatisering/test_zonneschermen.py
?? docs/windbeveiliging-zichtbaar/
?? tests/js/windbeveiliging-zichtbaar.test.mjs
```
