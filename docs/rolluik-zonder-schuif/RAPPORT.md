# 0.53.1 — De rolluikkaart met de schuif uit is weer één rij

## Wat er mis was

Een rolluikkaart met `show_position: false` werd toch **twee rijen** hoog (120px)
zodra het rolluik een positie kan zetten (`supported_features` met bit 4,
`SET_POSITION`). De schuif zelf stond er terecht niet, maar `rows_()` telde hem
wel mee: onder elke rolluikregel stond een lege halve kaart.

Gevonden op 30 september 2026 bij het nameten van het demohuis voor de website:
vier rolluiken in een pop-up, elk 120px hoog met de inhoud in het midden. Bij de
eigenaar thuis viel het niet op, want zijn rolluiken melden geen positie
(`supported_features` 11). Bij een klant met rolluiken die dat wél doen, en die
de schuif uitzet, staat het er meteen.

## Wat er veranderd is

- `kaartHoogte({ aantal, kanPositie, toonPositie })` in `src/cards/cover-logica.js`
  rekent de hoogte uit, en telt de schuif alleen als hij er ook STAAT: het
  rolluik kan een positie zetten én `show_position` staat niet uit. Dat is
  dezelfde voorwaarde als waarmee de kaart de schuif tekent (`wantPos`).
- `rows_()` in `cover-card.js` gebruikt die functie.

## Bewijs

### De test faalt op de oude code

`tests/js/cover-hoogte.test.mjs`, tegen `cover-logica.js` van vóór de fix:

```
SyntaxError: The requested module '../../src/cards/cover-logica.js' does not provide an export named 'kaartHoogte'
ℹ pass 0
ℹ fail 1
```

Op de nieuwe code: 4 van 4 groen.

| Test | Soort |
|---|---|
| de schuif uit telt niet mee, ook als het rolluik een positie kan zetten (54px, 1 rij) | **NIEUW GEDRAG** |
| met de schuif aan blijft het twee rijen (84px) | **REGRESSIEWACHT** |
| zonder positie is er nooit een schuif | **REGRESSIEWACHT** |
| een lege lijst telt als één regel | **REGRESSIEWACHT** |

### Verse code gemeten

In het demohuis (`localhost:8128`, dat dezelfde `custom_components`-map gebruikt):
config entry herladen met `hass.callApi`, de service worker en de caches gewist,
de pagina opnieuw geladen. De bundel die de pagina laadde:

```
?v=d197d1ada307   (sha256 op schijf: d197d1ada307fa9f...)   -> klopt
```

### In een echte browser

Pop-up Woonkamer, vier rolluiken met `supported_features` 15 (kan een positie
zetten) en `show_position: false`:

| Rolluik | Kan positie | Schuif in config | Hoogte | Rijen |
|---|---|---|---|---|
| Links | ja | uit | 56px | 1 |
| Rechts | ja | uit | 56px | 1 |
| Achter | ja | uit | 56px | 1 |
| Schuifpui | ja | uit | 56px | 1 |

Vóór de fix waren dat vier keer 120px.

Daarna een echte klik op de pijl omlaag bij "Links":

```
{ "doel": "path>svg>button[close]", "trusted": true }
cover.woonkamer_links -> closed, current_position 0
```

### De rest van CI, lokaal

```
npm run verify             OK (0.53.1, 885320 bytes)
npm run check:registratie  OK
npm run check:controls     OK
npm run check:css          OK
npm test                   1258 van 1258 groen
pytest (Docker)            zie de PR
```

## Samenvatting

Een rolluikkaart met de schuif uit is weer één rij hoog, ook als het rolluik een
positie kan zetten. De schuif telt alleen mee als hij er staat.

## Wat niet lukte

Niets in deze ronde. Buiten deze ronde, gevonden in hetzelfde demohuis: een
wekker die na zijn laatste moment is aangemaakt, meldt na een herstart van Home
Assistant dat hij "niet is afgegaan" voor een moment van vóór hij bestond. Dat
raakt de inhaalslag (SPEC 13.4 van de wekker), en die SPEC staat niet in deze
repo; daarom niet stilzwijgend veranderd maar gemeld. Zie de notities.

## Aannames

Geen aannames gedaan.

## git status --porcelain

```
(leeg na de commit)
```
