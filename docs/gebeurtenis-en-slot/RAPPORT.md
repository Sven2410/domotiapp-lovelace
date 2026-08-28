# Niet elke melder wordt "on" — ontgrendelen en aanbellen bij UniFi

**Uitgave 0.33.0 — 28 augustus 2026**

> "De ontgrendeling werkt niet helemaal. Bij UniFi bijvoorbeeld is de
> ontgrendeling een gebeurtenis. Kijk even mijn logs na in mijn eigen HA, want ik
> heb de deur ontgrendeld maar er komt niks binnen. Ik heb wel een automatisering
> voorheen die gewoon werkt. Bij ontgrendeling wil ik ook een snapshot, en
> aanbellen — kan je dat checken?"

Gecheckt. Hij had gelijk, en het lag aan ons.

---

## Wat er in zijn Home Assistant stond

Met zijn toestemming read-only uitgelezen. Zijn ontgrendeling van vanmiddag
staat er gewoon in — drie keer zelfs:

```
12:26:03   event.voordeur_toegang   -> 2026-08-28T12:26:03.818+00:00
12:26:20   lock.voordeur            -> unlocked
12:26:21   event.voordeur_toegang   -> 2026-08-28T12:26:21.448+00:00
12:26:25   lock.voordeur            -> locked
```

En dit hangt eraan:

| entiteit | wat |
|---|---|
| `event.voordeur_toegang` | "Voordeur Deur Gebeurtenis", `event_types: [unifi_access_entry, unifi_access_exit, unifi_access_access]` |
| `event.voordeur_deurbel_drukken` | "Voordeur Deurbel", `device_class: doorbell`, `event_types: [..._doorbell_start, ..._doorbell_stop, ring]` |
| `event.meterkast_deurbel_deurbel` | een tweede deurbel, `event_types: [ring]` |
| `lock.voordeur` | het slot zelf |
| `event.fietsenhok_voertuig` | UniFi Protect levert zijn slimme detecties óók als gebeurtenis |

## Waarom er niets binnenkwam

De bewakingsmotor keek naar één ding:

```python
if nieuw is None or nieuw.state != STATE_ON:
    return
```

**Geen van die regels wordt ooit `on`.** De toestand van een `event`-entiteit is
het *tijdstip* van de laatste gebeurtenis; er valt niets om te slaan. En een
`lock` gaat naar `unlocked`.

Zijn eigen automatisering werkte wél, want die luistert op de gebeurtenis zelf.
Onze motor deed dat niet.

## Wat er nu gebeurt

`is_detectie()` in `motor.py` kijkt per domein:

| domein | wat telt |
|---|---|
| `event` | elke NIEUWE geldige waarde. `unknown` en `unavailable` niet |
| `lock` | van slot gaan. Weer op slot niet |
| `cover` | opengaan. Een poort die opengaat is hetzelfde soort moment |
| de rest | `on`, en alleen het omslaan |

En de kaart herkent nu waar het over gaat:

- **`device_class: doorbell` is een feit**, geen gok — dat gaat vóór het raden op
  woorden. Zijn `event.voordeur_deurbel_drukken` wordt dus aanbellen, ook al zou
  hij hem hernoemen.
- **"toegang", "access", "entry", "keypad", "badge", "pas"** herkennen nu als
  ontgrendeling. Zijn `event.voordeur_toegang` viel daar eerst buiten.

## Wat hij moet instellen

Drie dingen, en het derde is niet vanzelfsprekend:

1. `event.voordeur_toegang` **of** `lock.voordeur` bij de bewegingsmelders zetten
   (allebei mag; dan krijgt hij twee beelden per ontgrendeling).
2. `event.voordeur_deurbel_drukken` erbij voor het aanbellen.
3. **Bij allebei "↳ hoort bij welke camera" invullen.** Uit zijn eigen
   apparatenregister:

   ```
   event.voordeur_toegang        -> apparaat 4c5b85cc… ("Voordeur", UniFi Access)
   event.voordeur_deurbel_drukken-> apparaat 4c5b85cc… ("Voordeur", UniFi Access)
   lock.voordeur                 -> apparaat 4c5b85cc… ("Voordeur", UniFi Access)
   camera.voordeur               -> apparaat 54137d5e… ("Voordeur", UniFi Protect)
   ```

   **Zelfde naam, ánder apparaat.** De kaart koppelt een melder vanzelf aan een
   camera op het APPARAAT (zie `camera-logica.js`) en niet op de naam — dat is
   een bewuste keuze, want een naam is een gewoonte en een apparaat is een feit.
   Hier valt die automatische koppeling dus weg, en dan hoort de melder bij ALLE
   camera's van de kaart: één ontgrendeling zou vijf snapshots opleveren, één per
   camera. Met dat veld ingevuld is het er één.

---

## Wat er gemeten is

**Op zijn installatie**, alleen gelezen: de geschiedenis hierboven, de
attributen van de vijf entiteiten, en het apparatenregister.

**Op de testinstance**, de hele keten met echte service-aanroepen:

```
beelden vooraf                                   8
lock.unlock op lock.front_door                   9   <- het slot levert een beeld
event.push_button_press krijgt een tijdstip     10   <- de gebeurtenis ook
lock.lock op lock.front_door                    10   <- weer op slot: geen beeld
```

En de kaart eromheen:

```
lock.front_door           -> ontgrendeling   (domein, een feit)
event.push_button_press   -> aanbellen       (device_class: doorbell, een feit)
binary_sensor.persoon_op… -> mens            (geraden uit de naam)

filterknoppen: mens 0 · aanbellen 1 · ontgrendeling 1
```

**Verse code:**

```
625497 bytes   sha256 4dd8106e5e1e51cbe015a9469a33e8ccc2ce1c77f5eb3001f3a1f06af707c353
```

**Geen fouten in de console.**

## Proeven

```
npm test         900 groen (5 nieuw)
python -m pytest 602 groen (5 nieuw, in tests/bewaking/test_motor.py)
check:css / check:registratie / verify   OK
```

De Python-proeven staan op `is_detectie` los (een `event` met dezelfde waarde is
geen nieuwe gebeurtenis; een slot dat weer op slot gaat ook niet) én op de hele
keten: een `event`-melder en een `lock`-melder die elk een beeld opleveren.

## Wat niet lukte

Niets.

## Aannames

- **Elke nieuwe waarde van een `event` telt**, ook `unifi_access_doorbell_stop`
  of `unifi_access_exit`. Filteren op `event_type` zou nauwkeuriger zijn, maar
  die lijst verschilt per integratie en per merk — en de rustperiode (standaard
  60 seconden) vangt de dubbele al op: bij een deurbel die start én stop meldt,
  wint de eerste.
- **Zijn `lock.voordeur` en `event.voordeur_toegang` melden hetzelfde moment.**
  Zet hij ze allebei op de kaart, dan krijgt hij twee beelden. Dat is zijn keuze;
  wij gooien er niet stilzwijgend een weg.

## `git status --porcelain`

```
M  CLAUDE.md
M  custom_components/domotiapp_lovelace/bewaking/motor.py
M  custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
M  custom_components/domotiapp_lovelace/manifest.json
AM docs/gebeurtenis-en-slot/RAPPORT.md
M  src/cards/camera-card.js
M  src/cards/camera-filters.js
M  tests/bewaking/test_motor.py
M  tests/js/camera-filters.test.mjs
```
