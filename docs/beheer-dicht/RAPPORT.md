# Het beheer van het infoscherm begint dicht (0.72.0)

16 oktober 2026. De melding van de eigenaar:

> *"Elke keer als ik beheer open van het infoscherm staat medewerkers
> opengeklapt alles moet gewoon dichtgeklapt blijven tot ik zelf iets open
> klap"*

## Wat er mis was

De beheerkaart had een instelling **"Staat open bij het laden"**, met als
standaard Medewerkers (`open: "personen"` in `STANDAARD`). Een dashboard
zonder die sleutel in zijn config (zoals elk dashboard dat met de stub is
begonnen) opende dus altijd met Medewerkers open. "Alles dicht" bestond als
keuze (`geen`, sinds ronde 4 van het infoscherm), maar dan moest je die eerst
per dashboard in de kaarteditor zetten.

## Wat er veranderd is

- **De instelling is weg**, uit de standaard, uit de editor (veld en label)
  en uit `wire()`. Elk blok begint dicht; wat er open is bepaalt alleen een
  klik.
- **Een `open:` die nog in een config staat doet niets meer.** Er hoeft bij
  geen enkel dashboard iets aangepast te worden.
- **Wat je openklapt blijft open** zolang de kaart er staat, ook als Home
  Assistant hem opnieuw opbouwt (`setConfig`). Dat deed hij al; het is
  nagemeten.

De reden staat in de kop van `src/cards/infoscherm-beheer-card.js`, onder
"ALLES BEGINT DICHT".

## Bewijs

Gemeten in de testinstance (poort 8127), dashboard `infoscherm-beheer`, in een
zichtbaar tabblad (`visibilityState: visible`).

**Verse code.** De `?v=` in `performance.getEntriesByType("resource")` tegen
de sha256 op schijf, na het herladen van de config entry en het wissen van de
service worker:

| bundel | `?v=` geladen | sha256 op schijf |
|---|---|---|
| deze ronde (vóór de versiebump) | `7c7ec9cbb1a5` | `7c7ec9cbb1a5db78…` |
| `main` (0.71.0), tijdelijk teruggezet | `daf65ac1c031` | `daf65ac1c031…` |

**NIEUW GEDRAG, faalt op de oude code:**

| | oude bundel (`main`) | nieuwe bundel |
|---|---|---|
| blokken open na het laden | `["personen"]` | `[]` |
| `config.open` op de kaart | `"personen"` | `null` |

**Een oude config met `open: "personen"`**, met de hand in de pagina gehangen
(valkuil 21): 8 blokken zichtbaar, `open: []`.

**Echte kliks** op de kop van Medewerkers (capture-luisteraar op `window`):

```
klik 1  isTrusted: true  blok: personen  ->  open: ["personen"]
setConfig({...config})                   ->  open: ["personen"]   (blijft open)
klik 2  isTrusted: true  blok: personen  ->  open: []
```

**De editor**: `schema()` geeft `weather, energy, lights, climates, calendars,
waste, title, show_*`; `open` staat er niet meer in (`kiosk_users` ontbreekt
omdat de gebruikerslijst in die meting nog niet geladen was).

Geen unittest: er zit geen logica in om los te toetsen (de beginstand is
`null`), en een jsdom-test is volgens de werkafspraken geen bewijs. Het bewijs
is de meting hierboven, op de oude en de nieuwe bundel.

## Controles

- `npm run build`, `verify`, `check:registratie`, `check:css`,
  `check:controls`: groen.
- `npm test`: 1871 tests, alle groen.
- Python: 821 tests, alle groen (lokaal in Docker en in CI).

## Samenvatting

Het beheer van het infoscherm opent nu met alle blokken dicht. De instelling
die Medewerkers openzette is weg, ook voor bestaande dashboards.

## Wat niet lukte

Niets.

## Aannames

- Dat hij de instelling helemaal kwijt wil en niet alleen een andere
  standaard: *"alles moet gewoon dichtgeklapt blijven"*. Is er een dashboard
  waar een blok bij het laden open MOET staan, dan is de instelling met één
  commit terug te zetten.

## `git status --porcelain`

Schoon na de commit.
