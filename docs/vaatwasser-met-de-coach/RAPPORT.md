# 0.58.0 — De vaatwasserkaart met de knoppen van de coach

## De vraag

11 oktober 2026, via de coach-sessie (ingekort):

> Vaatwasserkaart: die leest nu de coach-sensor "start om". In het coachpaneel
> heeft hij ook de knoppen "Ingeruimd, morgen starten" en "Ingeruimd, nu
> starten" (en "Handmatige besturing"). "Dat moet ook op de vaatwasser kaart
> komen." Universeel: in de GUI-editor een vinkje "in combinatie met de coach".
> Heeft een klant de coach: vinkje aan. Zonder coach: vinkje uit, gewone
> vaatwasserkaart.

Dezelfde vraag gaat ook over een laadpaal- en een thuisbatterijkaart. Die
volgen in eigen rondes; dit is de eerste, omdat het een bestaande kaart is.

## De afspraak met de coach

De coach-sessie en deze sessie hebben op 11 oktober 2026 een contract
afgesproken (**contract 1, coach v0.110.0**), en de eigenaar heeft het
goedgekeurd. Voor de vaatwasser komt het hierop neer:

| Wat | Hoe |
|---|---|
| het apparaat | per coach-apparaat één HA-apparaat, fabrikant `DomotiApp Coach`, model `Vaatwasser` / `Wasmachine` / `Droger` / ... |
| de rol van een entiteit | `translation_key`, een vaste sleutel die hernoemen overleeft |
| sensor `start` (bestond al) | attributen `start`, `klaar_om`, `nu`, `vrijgegeven`, `stand` (`niet_vrijgegeven` / `gepland` / `start_nu` / `draait` / `klaar`), `contract`, `type`, `entiteiten`, `release_switch` |
| binary_sensor `vrijgegeven` | de waarheid van de coach |
| knoppen | `ingeruimd_morgen`, `ingeruimd_nu`, `vrijgave_intrekken` |
| `entiteiten` | wat de klant bij de coach invulde: `door`, `start`, `stop`, `program`, `remaining`, ... |

**De toestand van de sensor is tekst voor mensen; de kaart leest alleen
attributen.** Dat is valkuil 67: de kaart is in 0.47.0 gebouwd tegen een
toestand die een dag later anders werd.

Geen websocket van de coach in de kaart: een kaart in een pop-up moet ook
werken voor een bewoner, in een automatisering en in een bubble-card zonder
eigen code. De knoppen zijn gewone `button.press`-aanroepen.

**Gemeten voordat het contract vastlag:** Home Assistant geeft
`translation_key` en `platform` mee aan de frontend. In het image 2026.8 zet
`helpers/entity_registry.py` `"tk"` en `"pl"` in de display-entry, en de
frontend maakt er `hass.entities[id].translation_key` en `.platform` van. In
de testinstance nagemeten op de echte `hass` (zie *Bewijs*).

## Wat er gebouwd is

**In de editor** een schakelaar *In combinatie met DomotiApp Coach*, met
eronder (alleen als hij aan staat) een uitklapblok met de apparaatkiezer. Dat
is de vorm die hij op 28 augustus 2026 vroeg voor de presets: een functie die
je in zijn geheel aan of uit zet. De kiezer toont alleen apparaten van de
coach met een model dat een programma heeft. Leeg laten betekent: de vaatwasser
van de coach, als er precies één is.

**Op de kaart** komt er een rij met de knoppen van de coach, met de woorden van
het coachpaneel (`views/overview.js` in domotiapp-coach):

| Stand van de coach | Knoppen | Statusregel |
|---|---|---|
| niet vrijgegeven, klaar-tijd vandaag | **Ingeruimd** · Nu starten · Handmatig | Klaar om te starten |
| niet vrijgegeven, klaar-tijd van vandaag voorbij | **Morgen starten** · Nu starten · Handmatig | Klaar om te starten |
| gepland | **Vrijgegeven** (aan; tik = intrekken) · Nu starten · Handmatig | Start om 21:45 |
| start nu | **Vrijgegeven** · Handmatig | Start nu |
| draait | Handmatig | Draait · nog 1 u 24 min |

Net als in het paneel is de vrijgave één knop die wisselt: Ingeruimd geeft
vrij, en een tik op Vrijgegeven trekt de vrijgave in. Bij een wasmachine of
droger heet hij *Mag draaien*, net als in het paneel. "Morgen" wordt de naam
van de dag als de volgende klaar-tijd verder weg ligt ("Dinsdag starten").

**Handmatig** klapt de programmakeuze en Start/Stop van de machine zelf open.
In het paneel zit dat ook een stap verder weg: het zijn de enige knoppen die
langs de coach heen gaan. De knop Slim vervalt met de coach, want Ingeruimd
is de slimme sturing.

**Lege velden vult de kaart met wat de klant bij de coach koos**
(`entiteiten`): resterende tijd, klep, start, stop en programma. Een veld uit de
editor gaat voor. Een statussensor heeft de coach niet; zonder statussensor
leest de kaart de stand van de coach (draait, klaar, of in rust).

**De naam** is met de coach die van het coach-apparaat ("Vaatwasser"), niet die
van de statussensor ("Vaatwasser Operation state" bij Home Connect).

**Als de knoppen er niet kunnen staan, zegt de kaart waarom:**

| Situatie | Zin op de kaart |
|---|---|
| geen coach-apparaat met een programma | Geen apparaat van DomotiApp Coach gevonden. Daarvoor is coach 0.110.0 of nieuwer nodig. |
| twee vaatwassers, niets gekozen | Kies in de editor welk apparaat van de coach deze kaart volgt. |
| het gekozen apparaat is weg | Het gekozen apparaat van de coach bestaat niet meer. |
| een sensor zonder `contract` | Werk DomotiApp Coach bij naar 0.110.0 of nieuwer. |

**Zonder het vinkje verandert er niets.** De route van 0.47.0 (de startsensor
vinden via `release_switch` = het veld Slimme sturing) blijft werken, ook met
de nieuwe coach: `release_switch` blijft op de sensor staan.

| Bestand | Wat |
|---|---|
| `src/cards/coach-logica.js` | NIEUW. Apparaat kiezen, entiteiten per rol, contract, `entiteiten`. Gedeeld met de laadpaal- en batterijkaart die nog komen. |
| `src/cards/vaatwasser-logica.js` | `coachStand`, `coachKnoppen`, `coachMelding`, `metCoachVelden`, `statusUitCoach` |
| `src/cards/dishwasher-card.js` | de rij, Handmatig, de editor |

## Bewijs

### De tests falen op de code van vóór deze ronde

De nieuwe tests zijn in een worktree van `main` (fbc2180) gedraaid, met alleen
de twee testbestanden erbij:

```
✖ tests\js\coach-logica.test.mjs
  Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...\src\cards\coach-logica.js'
✖ NIEUW GEDRAG: wat de coach zegt, uit de attributen
✖ NIEUW GEDRAG: een status uit de coach, voor wie geen statussensor heeft
✖ NIEUW GEDRAG: de knoppen van de coach
✖ NIEUW GEDRAG: de velden die de coach invult
ℹ tests 24
ℹ pass 0
ℹ fail 24
```

Alles is **NIEUW GEDRAG**: 23 tests in `vaatwasser-coach.test.mjs` die elk
afzonderlijk falen, plus `coach-logica.test.mjs` dat als bestand niet laadt (16
tests). Op deze tak zijn alle 39 groen, en de hele suite ook:

```
ℹ tests 1387
ℹ pass 1387
ℹ fail 0
```

`npm run verify`, `check:registratie`, `check:controls` en `check:css` (bij de
build) zijn groen.

### Een nep-coach in de testinstance

Een nagebootste toestand via `POST /api/states` maakt geen vermelding in het
register, en dan is vinden via apparaat + `translation_key` niet te meten.
Daarom staat er in `.ha-dev-config/custom_components/domotiapp_coach/` (niet in
git) een kleine integratie met hetzelfde domein. Die maakt een apparaat
"Vaatwasser" (model Vaatwasser) met precies de entiteiten en sleutels uit het
contract, en ernaast een laadpaal "Oprit" om te zien dat die er niet tussen
komt. De knoppen veranderen de stand zoals de coach dat doet. `entiteiten`
wijst naar de vaatwasserhelpers die er al stonden (`input_button.vaatwasser_start`
en zo).

Gemeten op de echte `hass` in de pagina:

```
sensor.vaatwasser_start                      device 17feb1  translation_key start
binary_sensor.vaatwasser_vrijgegeven         device 17feb1  translation_key vrijgegeven
button.vaatwasser_ingeruimd_morgen_starten   device 17feb1  translation_key ingeruimd_morgen
button.vaatwasser_ingeruimd_nu_starten       device 17feb1  translation_key ingeruimd_nu
button.vaatwasser_vrijgave_intrekken         device 17feb1  translation_key vrijgave_intrekken
sensor.oprit_coach                           device 055b59  translation_key coach
devices: Vaatwasser (Vaatwasser), Oprit (Laadpaal), fabrikant DomotiApp Coach
```

### Verse code

Na elke build de config entry herladen, service worker en caches gewist, en de
`?v=` uit `performance.getEntriesByType("resource")` vergeleken met de sha256 op
schijf: `bda7e223829d`, daarna `a9db1204872e` en tot slot `4ad876f57d5a`
(0.58.0). Steeds gelijk. Ook `paintCoach_` bestond in de geladen klasse.

### Echte kliks op de kaart

Een capture-luisteraar op `window` (klikdoel en `isTrusted`), en één abonnement
op `call_service`. De kaart staat met `coach: true`, een statussensor en een
voortgang, en verder **geen** velden.

| Klik | `isTrusted` | Aanroep | Kaart daarna |
|---|---|---|---|
| Morgen starten | true | `button.press` → `button.vaatwasser_ingeruimd_morgen_starten` | "Start om 21:45" · **Vrijgegeven** (aan) · Nu starten (aria "Toch nu starten") · Handmatig |
| Nu starten | true | `button.press` → `button.vaatwasser_ingeruimd_nu_starten` | "Start nu" · Vrijgegeven · Handmatig |
| Vrijgegeven | true | `button.press` → `button.vaatwasser_vrijgave_intrekken` | "Klaar om te starten" · Morgen starten · Nu starten · Handmatig |
| Handmatig | true | — | `aria-expanded="true"`, programmakeuze (Eco 50°C / Snel 60°C / Intensief 70°C / Voorspoelen) en Start / Stop, zonder Slim |
| Start (onder Handmatig) | true | `input_button.press` → `input_button.vaatwasser_start` | — |

Die laatste staat niet in de kaartconfig maar komt uit `entiteiten` van de
coach, net als de programmakeuze. "Morgen starten" klopt: de klaar-tijd van de
nep-coach is 16:30, en het was 19:59.

Daarna, met de statussensor op Run: alleen nog **Handmatig**, en "Draait · nog
1 u 24 min". De resterende tijd komt ook uit `entiteiten`. Terug op Ready:
weer alle knoppen.

De meldingen, nagebootst op de kaart in de pagina:

```
sensor zonder contract  ->  "Werk DomotiApp Coach bij naar 0.110.0 of nieuwer."   knoppen: Handmatig, Start, Stop
coach_device weg        ->  "Het gekozen apparaat van de coach bestaat niet meer."  knoppen: geen
weer de echte sensor    ->  geen zin, Morgen starten / Nu starten / Handmatig terug
```

### De rasterhoogte

`getBoundingClientRect().height` van `.card`:

| | Hoogte | Rijen |
|---|---|---|
| met de coach, dicht | 120 | 2 |
| met de coach, Handmatig open | 248 | 4 |
| zonder coach (regressiewacht) | 184 | 3 |

### De editor, met echte kliks en toetsen

In de bewerkmodus, met de editor van de coachkaart open:

- **De apparaatkiezer** (echte klik) toont één regel: *Vaatwasser — DomotiApp
  Coach*. De laadpaal *Oprit* staat er niet bij. Gekozen met een echte klik;
  daarna is `config.coach_device` het id van het apparaat Vaatwasser (op
  gelijkheid vergeleken: de browsertool houdt een apparaat-id tegen als
  "Base64"). Geen geneste sleutels in de config (valkuil 33).
- **Het naamveld**: "Vaatwasser keuken" getypt, 17 toetsaanslagen, alle 17
  `isTrusted: true`, de spatie ook (`{key: " ", isTrusted: true}`).
  `config.name` is daarna `"Vaatwasser keuken"`.
- **Het vinkje uit** (echte klik): het uitklapblok verdwijnt, en het voorbeeld
  is een gewone vaatwasserkaart zonder de knoppen van de coach.
- **Het vinkje weer aan**: het blok komt terug, met de vaatwasser nog gekozen.
- Gesloten met Annuleren: de werkbank is niet gewijzigd.

### Licht thema

Met `settheme` naar het lichte standaardthema: `dac-thema="licht"` op de kaart.
Vrijgegeven draagt het accent, Handmatig (open) een donkere rand, en de kaart
zonder coach is ongewijzigd. Terug naar het vorige thema (`default`, donker).

### Regressiewacht: de kaart zonder vinkje

Naast de coachkaart staat een kaart zonder vinkje, met alle velden ingevuld
(ook Slim). Die ziet er hetzelfde uit als vóór deze ronde: programmakeuze,
Slim / Start / Stop, 184 px. Ze toont ook "Start om 22:00" als de nep-coach een
plan heeft. Dat is de route van 0.47.0 via `release_switch`, die met de
nieuwe coach dus blijft werken.

### Console

Na een verse lading geen enkele fout in de console.

## Samenvatting

De vaatwasserkaart heeft een vinkje *In combinatie met DomotiApp Coach*. Staat
het aan, dan staan Ingeruimd (of Morgen starten), Nu starten en Handmatig op de
kaart, met de woorden van het coachpaneel. De kaart vindt het apparaat en zijn
knoppen zelf via het register (`translation_key`), en vult lege velden met wat
er bij de coach is ingevuld. Elke knop is met een echte klik nagelopen tegen
een nep-coach die het afgesproken contract nabootst, net als de editor. Zonder
vinkje is de kaart ongewijzigd.

## Wat niet lukte

- **Nog niet gemeten tegen de echte coach.** Coach v0.110.0 is nog niet
  uitgebracht. De nep-coach volgt het contract zoals het op 11 oktober 2026
  is afgesproken, maar hij is door deze sessie geschreven, en dat is precies
  hoe het bij 0.47.0 misging. **Deze uitgave wacht daarom op de echte dump van
  de coach.** Pas als de kaart daartegen is nagelopen, wordt er gemerged en
  uitgebracht.
- **Het testtabblad stond de hele ronde verborgen** (`visibilityState:
  hidden`). Vooraan stond het startvenster DomotiApp, en daar is volgens
  valkuil 60 niets aan veranderd. Kliks, toetsen, de editor en de
  schermafdrukken werkten wel. De view bouwde soms pas na een schermafdruk.
- **Mijn eerste zoektocht naar de kaarten in de pagina vond er nul** (valkuil
  14). Daarna een hit-test op een punt uit de schermafdruk gebruikt.

## Aannames

- Dat de echte coach de entiteiten aanmaakt zoals in het contract: met
  `has_entity_name`, een `translation_key` per rol, en fabrikant en model op het
  apparaat. Dat wordt nagelopen met de dump.
- Dat `klaar_om` op een latere kalenderdag betekent dat de klaar-tijd van
  vandaag voorbij is. Daaraan ontleent de kaart "Morgen starten". Het paneel
  gebruikt daarvoor `missed` uit het besluit, en dat staat niet in het
  contract.
- Dat Handmatig per kaart dicht begint, en open blijft tot je hem weer dichtklapt
  of de pagina herlaadt. Er wordt niets bewaard.

## git status --porcelain

Vóór het vastleggen:

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/dishwasher-card.js
 M src/cards/vaatwasser-logica.js
?? docs/vaatwasser-met-de-coach/
?? src/cards/coach-logica.js
?? tests/js/coach-logica.test.mjs
?? tests/js/vaatwasser-coach.test.mjs
```
