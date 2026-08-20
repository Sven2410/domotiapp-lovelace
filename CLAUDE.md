# CLAUDE.md — DomotiApp Lovelace

Lees dit eerst, daarna `SPEC.md`. Dit bestand gaat over **hoe** we werken;
`SPEC.md` gaat over **wat** we bouwen en is bindend.

---

## Werkafspraken

- **Fases met een duidelijk stoppunt.** Elke ronde eindigt met een PR waarin het
  bewijs in de beschrijving staat. Sinds 19 augustus 2026 mag Claude Code die
  zelf mergen, maar **pas als alle CI-checks groen zijn** -- `main` is en blijft
  de laatste geverifieerde staat.
- **Branch per ronde:** `fase-<N>/<korte-naam>`, één PR naar `main`.
- **Een test telt pas als hij aantoonbaar faalt op de code van vóór de fix.**
  Toon dat ook — draai de nieuwe test tegen de oude code en plak de uitvoer.
  Regressiewachten mógen op oude code slagen, maar worden dan expliciet als
  **REGRESSIEWACHT** gelabeld; nieuw gedrag als **NIEUW GEDRAG**.
- **Frontendwijzigingen worden in een echte browser met echte kliks
  geverifieerd** via `claude-in-chrome`. Een synthetisch event bewijst de
  handler, niet de control. **Toon `isTrusted`.**
- **Tekstvelden worden met échte toetsaanslagen geverifieerd**, nooit met
  `.value =` of een programmatisch `input`-event, en **in elk tekstveld wordt
  expliciet een spatie getypt**. Toon `isTrusted` op de keydown van die spatie.
  Dit is geen formaliteit: het naamveld van de config-editor accepteerde een
  fase lang geen spatie, en de meting die dat had moeten vangen gebruikte één
  woord zonder spatie (zie `docs/fase-4b-1/RAPPORT-FIX.md`).
- **Uitlijning en verdeling worden met gemeten posities aangetoond**, niet op
  het oog: lees de `getBoundingClientRect()` van de elementen uit en toon de
  afstanden. Een screenshot laat zien dát iets scheef staat, niet hoe scheef.
- **Bewijs eerst dat je verse code meet.** De service worker wissen is niet
  genoeg. Gebruik `fetch(url, {cache:'reload'})` en vergelijk hash of lengte met
  het bestand op schijf. Toon beide getallen.
- **Geen jsdom-tests die een browser nabootsen.** jsdom stubt `ha-form` volledig
  en beoordeelt de CSS-cascade niet; geen enkele jsdom-test bewijst dat een
  control een klik accepteert of welke kleur er rendert. Pure logica mag wél in
  een gewone unittest (zie `src/apply-scene.js` en `tests/js/`).
- **Elk rapport eindigt met**, in deze volgorde: samenvatting, wat niet lukte,
  aannames (of letterlijk "geen aannames gedaan"), en `git status --porcelain`.
- **Elk rapport gaat óók naar `docs/fase-<N>/RAPPORT.md`** en wordt meegecommit.
  De terminaluitvoer is bij de eigenaar niet betrouwbaar over te nemen; hij
  leest het rapport uit de repo.
- **Kleuren lopen via HA-themavariabelen, nooit hardcoded.** Uitzondering:
  iconen mogen vaste kleuren en gradients dragen.
- **Tags en releases zonder `v`-prefix.** Sinds 19 augustus 2026 mag Claude Code
  ze zelf zetten: versie in `manifest.json` omhoog, bundel opnieuw bouwen en
  meecommitten, tag, `gh release create` met de wijzigingen in gewone taal.
  **Mergen mag ook** -- de eigenaar heeft dat op 20 augustus 2026 bevestigd toen
  deze regel de vorige tegensprak. De enige voorwaarde staat hierboven: pas
  mergen als alle CI-checks groen zijn.
- **`SPEC.md` is bindend.** Wijkt een opdracht ervan af, dan wint `SPEC.md` en
  meld je dat. Blijkt `SPEC.md` ergens niet uitvoerbaar of feitelijk onjuist,
  dan **wijzig je hem niet zelf**: melden en stoppen. (Uitzondering: een ronde
  waarin de eigenaar expliciet om een SPEC-correctie vraagt, zoals fase 2b en
  4a-bis.)

---

## Omgeving

- Windows 11, PowerShell, `C:\dev\domotiapp-lovelace`.
- **Testinstance:** container `ha-lovelace`, compose-project
  `domotiapp-lovelace-dev`, **poort 8127**, image gepind op `2026.8`.
  Config in `.ha-dev-config/` (gitignored).
  De container heette `ha-scene`, net als die van domotiapp-scene, en dan weigert
  Docker de tweede met een naamconflict. Staat `.ha-dev-config/` er nog niet, kopieer
  hem dan uit `domotiapp-scene` (zonder database, logboeken, `deps/` en
  `custom_components/`): daar zitten dezelfde testlampen in, en de ingelogde
  sessie komt mee zodat er geen wachtwoord aan te pas hoeft te komen.
- **De poorten 8123, 8124, 8125 en 8126 zijn bezet door andere projecten en
  mogen nooit gebruikt worden.**
- **De productie-HA wordt nooit aangeraakt, ook niet gelezen.**
- `C:\dev\_ref\ultimate-scene-card` is uitsluitend leesmateriaal, zonder remote.
  **Nooit in schrijven.** De analyse ervan staat in `INVENTARIS.md`.

### Testmateriaal in `.ha-dev-config`

Vier testlampen die samen de vier lampsoorten uit SPEC 6 dekken, plus één
lamp waarvan de beschikbaarheid te schakelen is:

| Entiteit | `supported_color_modes` |
|---|---|
| `light.test_lamp_aanuit` | `["onoff"]` |
| `light.test_lamp_dim` | `["brightness"]` |
| `light.test_lamp_kleurtemp` | `["color_temp"]` |
| `light.test_lamp_rgb` | `["rgb"]` |
| `light.test_lamp_kleur_en_wit` | `["color_temp", "hs"]` — kan **allebei**; toegevoegd in fase 10 voor de keuze Kleur/Wit (SPEC 6.5) |
| `light.test_lamp_wegvallend` | `["brightness"]`, wordt `unavailable` als `input_boolean.lamp_bereikbaar` uit staat |

Light groups (config-entry-helpers, dus in `.storage`, niet in YAML):

| Groep | Leden | Waarvoor |
|---|---|---|
| `light.lampen_slaapkamer` | drie demolampen | de oorspronkelijke groep van de eigenaar — **niet wijzigen** |
| `light.testlampen` | de vijf testlampen | het normale geval |
| `light.lege_groep` | geen | SPEC 13.3 |
| `light.offline_groep` | alleen `light.test_lamp_wegvallend` | SPEC 13.6, "alle lampen offline" |
| `light.fase_10_groep` | `kleur_en_wit`, `kleurtemp`, `dim` | een lamp die allebei kan naast een die er één kan — de keuzeknoppen uit SPEC 6.5 |

---

## Commando's

```bash
npm run build              # bundelt src/ -> custom_components/.../frontend/
npm run verify             # faalt als de gecommitte bundel afwijkt van de bron
npm run check:registratie  # bewaakt de registratieregel (zie valkuil 1)
npm test                   # JS-unittests (node --test), geen jsdom
```

**Python-tests draaien niet op Windows** — Home Assistant importeert `fcntl`.
Draai ze in Linux:

```bash
MSYS_NO_PATHCONV=1 docker run --rm -v "C:/dev/domotiapp-lovelace:/app" -w /app \
  python:3.14-slim sh -c "pip install -q -r requirements-test.txt && python -m pytest -q"
```

CI draait alle drie: bundelvergelijking + registratieregel, JS-tests,
Python-tests.

---

## Valkuilen die ons al tijd hebben gekost

1. **Registreren van custom elements gaat altijd via `src/registreer.js`.**
   HA 2026.8 draait `@webcomponents/scoped-custom-element-registry`; de
   gepatchte `get` leest alleen de eigen Map, zonder fallback naar de native
   registry. Registreer je op modulescope, dan win je soms de race met HA's
   eigen `import()` en is je element daarna onzichtbaar — zonder fout, zonder
   log, met "Configuratiefout" op elke kaart en een kaartkiezer die eindeloos
   laadt. Bewaakt door `npm run check:registratie`. Zie SPEC 17.1.2 en
   `docs/fase-4a/RAPPORT-FIX.md`.

2. **De `?v=` op de frontend-URL is de hash van het bundelbestand**, niet het
   versienummer (SPEC 16.2). Die hash wordt berekend bij setup van de config
   entry. Dus: **na elke `npm run build` de config entry herladen**, daarna pas
   hard herladen in de browser (SPEC 16.3).

3. **Het `entity_id`-attribuut van een light group verdwijnt zodra de groep
   `unavailable` is** (`helpers/entity.py:1118-1124`). Een lege groep is altijd
   unavailable. De ledenlijst valt daarom server-side terug op
   `config_entry.options["entities"]` (SPEC 5.1).

4. **`docker exec` met `/`-paden vanuit Git Bash** vereist `MSYS_NO_PATHCONV=1`,
   anders mangelt Git Bash het pad naar `C:/Program Files/...`.

5. **De browsertool blokkeert uitvoer met query strings** ("Cookie/query string
   data"). Stel het vraagteken samen met `String.fromCharCode(63)` en vergelijk
   op gelijkheid in plaats van de string terug te geven.

6. **Wacht tot de MDI-iconen geladen zijn voordat je klikt.** `ha-icon` laadt
   asynchroon; een klik op een knop die nog geen oppervlak heeft, mist. Doe een
   hit-test met `elementFromPoint` op het klikpunt.

7. **Eén `subscribeEvents`-abonnement per meting.** Twee tegelijk levert elke
   service-aanroep dubbel op, wat makkelijk voor een gedragsverandering
   aangezien wordt.

8. **Zoek kaartelementen niet met een eigen deep-query door shadow roots.** Dat
   heeft twee keer ten onrechte "0 kaarten" opgeleverd. Gebruik een
   capture-listener op `window` en lees `event.composedPath()` — robuuster, en
   dichter bij wat een echte klik doet.

---

## Projectstand

| Fase | Wat | Status |
|---|---|---|
| 0 | Inventarisatie referentiekaart + architectuurverificatie | gemerged (`INVENTARIS.md`, `ONDERZOEK-FRONTEND.md`) |
| 1 | Rooktest, buildketen (esbuild + lit), CI | gemerged |
| 2 / 2b | `SPEC.md` als bron van waarheid | gemerged |
| 3 / 3b | Opslaglaag, validatie, foutgedrag, WebSocket-API, gedrag na unload | gemerged |
| 4a / 4a-fix / 4a-bis | Kaart in rusttoestand, toepassen van een scene, config-editor, registry-race, light group zonder `entity_id` | gemerged |
| 4b-1 / fix / fix2 / fix3 / fix4 | De editor achter het potlood (SPEC 4): tabbladen, icoonkiezer, lampbesturing, "niet ingesteld", Opslaan; spatie in tekstvelden, kelvinverloop, iconen verdeeld, resetknop weg, melding voor nog niet ingestelde lampen | gemerged |
| 4b-2 | Voorbeeld en Annuleren met de snapshotroute (SPEC 9), met de integratie als beheerder van de snapshot | gemerged |
| 4c | `CLAUDE.md` met werkafspraken, omgeving en projectstand | gemerged |
| 5 | Options flow: het opruimoverzicht (SPEC 15) | gemerged |
| **6** | **HACS-klaar maken: manifest, `hacs.json`, README voor de klant, installatietest op een verse instance** | **loopt** |

**Wat er staat:** het product is functioneel compleet. De integratie serveert en
registreert haar eigen kaart zonder Lovelace-resource, heeft een eigen `Store`
met validatie en foutgedrag, zes WebSocket-commando's, een kaart die drie
scene-iconen en een potlood toont en scenes toepast, een editor met drie
tabbladen, icoonkiezer, lampbesturing per `supported_color_modes`, Voorbeeld met
snapshot en herstel bij Annuleren, en een options flow om opgeslagen scenes per
lichtgroep op te ruimen.

**Wat er nog niet is:** de eerste release. Fase 6 maakt de repo
installeerbaar via HACS; de tag en de release maakt de eigenaar zelf.

**Tellingen op het moment van schrijven:** 136 Python-tests, 115 JS-tests, alle
groen; bundel 42.468 bytes.
