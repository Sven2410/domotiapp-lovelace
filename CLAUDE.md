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
- **De productie-HA (`192.168.1.88:8123`) mag GELEZEN worden als de eigenaar
  erom vraagt, en verder nooit aangeraakt.** Uitlezen gaat read-only over de
  websocket met het token uit `C:\dev\ha-token.txt`; een service aanroepen of
  config wegschrijven is en blijft verboden. Deze regel stond er eerst als
  "ook niet gelezen"; op 20 augustus 2026 heeft de eigenaar hem versoepeld toen
  hij vroeg naar zijn eigen dashboard te kijken.
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

Sinds 25 augustus 2026 staan er ook helpers voor de keuzelijst, de tabbladen en
de vaatwasser. Allemaal met de hand aangemaakt via de websocket
(`input_select/create` en zo); ze staan in `.storage` en dus niet in git.

| Helper | Waarvoor |
|---|---|
| `input_select.testmodus` | Thuis / Weg / Nacht / Vakantie — de keuzelijst op de entiteitenkaart |
| `select.speed` | bestond al (demo-integratie), een tweede keuzedomein naast `input_select` |
| `input_select.vaatwasser_status` | Ready / Run / Pause / Finished / Inactive — de hele rangorde van de vaatwasserkaart |
| `input_select.vaatwasser_programma` | Eco 50°C / Speed 60°C / Intensief 70°C / Voorspoelen |
| `input_number.vaatwasser_rest` | resterende tijd in minuten |
| `input_number.vaatwasser_voortgang` | 0-100, voor de voortgangsbalk |
| `input_boolean.vaatwasser_klep` | de klepsensor, om de rangorde te toetsen |
| `input_boolean.vaatwasser_slim` | de slimme-sturingsknop |
| `input_button.vaatwasser_start` / `_stop` | de twee knoppen |

In `.ha-dev-config` stond nog een Lovelace-resource naar
`/domotiapp_scene/domotiapp-scene-card.js` — die integratie staat hier niet, dus
hij gaf 503. Zolang de service worker een kopie had, viel dat niet op; zodra die
gewist wordt (valkuil 15) breekt hij het laden van de views. Op 26 augustus 2026
uit de resourcelijst gehaald.

Het testdashboard heet **`kaart-test`**. De view `navbalk` is de werkbank: die
wordt per ronde opnieuw ingericht via `lovelace/config/save`.

---

## Commando's

```bash
npm run build              # bundelt src/ -> custom_components/.../frontend/
npm run verify             # faalt als de gecommitte bundel afwijkt van de bron
npm run check:registratie  # bewaakt de registratieregel (zie valkuil 1)
npm run check:css          # hover op aanraakschermen + backticks in CSS (14, 16)
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

8. **Kaarten komen op de rasterrijen uit via hun INHOUD, niet via `rows`.**
   Het sections-raster is 56px per rij met 8px ertussen. Geef je een getal aan
   `getGridOptions`, dan klemt `computeCardGridSize` het vak op `rows * 64 - 8`
   en steekt de kaart eruit zodra de inhoud groeit. Daarom staan de kaarten die
   kunnen groeien op `rows: "auto"` en duwt `src/rasterhoogte.js` hun inhoud op
   naar 56, 120, 184 of 248. Twee dingen die daarbij gemeten zijn op
   20 augustus 2026:
   - Home Assistant vraagt `getGridOptions()` **alleen opnieuw bij een nieuwe
     `hass`**. Niet op `ll-rebuild`, `card-updated`, `iron-resize` of een
     venster-resize -- alle vier geprobeerd, teller bleef staan.
   - Een `ResizeObserver` meldt **niets** als een kind op `display: none` gaat.
     De kleurstrips van een lamp die uitging verdwenen wel, maar de kaart bleef
     op 120px staan. Daarom roept elke kaart `meetRaster()` zelf aan in
     `paint()` (of `updated()`), en is de waarnemer alleen het vangnet voor wat
     er ná het tekenen binnenkomt.

9. **Een view heeft na een harde herlading seconden nodig om te bouwen.** Meet
   je te vroeg, dan vind je nul kaarten en lijkt het of alles stuk is. Dat is
   twee keer ten onrechte voor een regressie aangezien; wacht tot
   `hui-card`-elementen kinderen hebben.

10. **`.chip` is een GEDEELDE klasse in `theme.js`** die een gevulde cirkel met
   een rand in de accentkleur tekent. Gebruik je die naam voor het omhulsel van
   een gewoon icoon, dan krijg je er ongevraagd een ring omheen — vier ringen
   naast elkaar in een navbalk leest als vier knoppen die aanstaan. Dat is op
   25 augustus 2026 op een schermafdruk gemeld. Kies een eigen naam
   (`.ico`, `.mi`) als je alleen het icoon wilt.

11. **`pointer-events: none` erft door naar afstammelingen, ook naar een kind dat
   ergens anders op het scherm staat.** De navbalk zet zijn eigen `hui-card` uit
   de rasterstroom; stond daar `pointer-events: none` bij, dan was de hele balk
   onklikbaar terwijl hij er perfect uitzag. Gevonden met een hit-test op het
   klikpunt (valkuil 6), die op `hui-sections-view` uitkwam in plaats van op de
   knop.

12. **`rows: "auto"` beschermt niet tegen het formaatgreepje.** Dat schrijft
   `grid_options: {rows: N}` in de config, en dat wint. Home Assistant klemt dat
   getal tussen `min_rows` en `max_rows` uit `getGridOptions()`; staat `min_rows`
   op een vast getal dat te laag is, dan schildert de kaart over zijn buurman.
   Elke groeikaart geeft daarom `gemetenRijen()` op als ondergrens. Zie
   `docs/kaart-over-de-buurman/RAPPORT.md`.

13. **Schrijf broncode met backslashes of dollartekens niet via een
   shell-heredoc.** Op deze machine at die route `\\d` op tot `d` en maakte van
   `this.$$(...)` een `this.$(...)` — met een lege view tot gevolg. En let op:
   `$$` in de vervanging van `String.replace` betekent één `$`, dus de reparatie
   lijkt te lukken en verandert niets. Gebruik een vervangfunctie, of schrijf
   het bestand rechtstreeks weg.

14. **Zoek kaartelementen niet met een eigen deep-query door shadow roots.** Dat
   heeft twee keer ten onrechte "0 kaarten" opgeleverd. Gebruik een
   capture-listener op `window` en lees `event.composedPath()` — robuuster, en
   dichter bij wat een echte klik doet.

15. **`fetch(url, {cache: "reload"})` is NIET genoeg om verse code te meten.**
   De service worker van Home Assistant zit ervoor en serveert zijn eigen kopie.
   Op 26 augustus 2026 leverde hij 393.653 bytes terwijl er 407.177 op schijf
   stonden — en de container gaf diezelfde 407.177 wél uit toen we hem van
   binnenuit opvroegen. Wis eerst de service worker én de caches:
   ```js
   for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
   for (const n of await caches.keys()) await caches.delete(n);
   ```
   Daarna pas meten, en de sha256 vergelijken met het bestand op schijf.

16. **Geen backticks in een CSS-commentaar.** Alle CSS staat in een
   sjabloonliteral, dus een backtick in een commentaar sluit die string af. Vaak
   is dat een bouwfout binnen een minuut — maar niet altijd: `` `.surface` ``
   werd `` ` + .surface + ` ``, en dat is geldige JavaScript. Het bouwde, het
   laadde, en toen viel de hele bundel om op `X(...).surface is not a function`,
   met geen enkele geregistreerde kaart en een leeg dashboard. Bewaakt door
   `npm run check:css`, die niet de backtick meet maar het gevolg: een sjabloon
   dat midden in een blokcommentaar ophoudt.

17. **`Array.map(functie)` geeft de INDEX als tweede argument mee.** Heeft die
   functie een tweede parameter met een standaardwaarde — `asItem(ruw, diep =
   true)` — dan krijgt element 0 daar `0` voor, en alleen element 0 gedraagt
   zich anders dan de rest. In de navbalk verloor daardoor uitsluitend de eerste
   knop zijn submenu. Schrijf `.map((x) => f(x))`.

18. **Een blijvende highlight heeft TWEE oorzaken, en ze zien er hetzelfde uit.**
   De eerste is de hover van valkuil 14. De tweede is `:focus-visible`: Home
   Assistant zet de focus op het element dat een dialoog opende en GEEFT DIE
   TERUG als de dialoog dichtgaat. Die teruggave is programmatisch, en dan matcht
   `:focus-visible` wél — ook na een tik met je vinger. Gemeten op de
   rookmelderkaart op 26 augustus 2026: `outline: 2px solid rgb(25,143,217)` die
   bleef staan tot je ergens anders tikte. Opgelost in `DacCard`
   (`bewaakFocusRing_`) voor alle kaarten tegelijk: focus die na een TIK alsnog
   `:focus-visible` matcht gaat eraf, focus na een TOETS blijft staan. Repareer
   je alleen de hover, dan blijft de helft van de klacht staan — dat is precies
   wat er gebeurde.

19. **Het bewerkgereedschap van Home Assistant is te leen, en dat scheelt een
   nabouw.** In de bewerkmodus zijn `hui-card-edit-mode` (de overlay met het
   potlood en het driepuntsmenu), `ha-sortable` (slepen) en `hui-section`
   allemaal gedefinieerd. Ze hebben genoeg aan een NEP-`lovelace`
   (`{editMode: true, saveConfig: async () => {}}`) en melden wat ze doen met
   gebeurtenissen die omhoog borrelen (`ll-edit-card`, `ll-duplicate-card`,
   `ll-delete-card`, `ll-copy-card`, `ll-change-grid-options`). En de
   kaartkiezer (`hui-dialog-create-card`) is niet aan te roepen maar wel uit te
   lokken: een verborgen `hui-section` met een nepdashboard, en dan
   `ll-create-card` afvuren vanuit zijn `_layoutElement`. Vondst van Bubble
   Card; zie `docs/kaarten-bewerken-als-in-ha/RAPPORT.md`.

20. **Maar die kiezer opent daarna HA's eigen `hui-dialog-edit-card`, en dat is
   DEZELFDE dialoog waar jouw editor in staat.** Home Assistant hergebruikt het
   element en zet er andere parameters in; jouw editor is dan weg, met de config
   die erin stond. Gemeten op 26 augustus 2026. Vang het `show-dialog`-signaal af
   (`stopImmediatePropagation`), haal `detail.dialogParams.cardConfig` eruit, en
   **sluit de kiezer zelf** — hij sluit normaal pas bij het doorgeven dat je net
   hebt tegengehouden.

21. **Na het wissen van de service worker (valkuil 15) stopt Home Assistant in
   dat tabblad met het opbouwen van views.** `hui-root` krijgt geen `_curView`
   meer, het scherm blijft leeg, en er staat geen fout in de console. Elke
   conclusie die je daarna uit een leeg scherm trekt is onzin -- op 26 augustus
   2026 zijn er zo twee onterechte "deze kaart sloopt de view" uit gerold.
   Herstellen: `docker restart ha-lovelace` EN een vers tabblad. En let op: in
   deze build geeft rechtstreeks naar `?edit=1` navigeren ook een lege view;
   de bewerkmodus zet je aan met het potlood rechtsboven.

22. **De slagschaduw op een kaart van één rasterrij is een vlek.** Een schaduw
   van 18px omlaag met 40px onscherpte valt weg onder een kaart van drie rijen,
   maar staat onder een kaart van 56px net zo hoog als de kaart zelf -- en drie
   van die kaarten onder elkaar geven donkere banden. `--dac-shadow` draagt
   daarom sinds 0.14.0 alleen nog de haarlijn bovenlangs. Zwevende dingen (de
   navbalk, zijn menu, het mediazoekscherm) houden hun schaduw wél: daar is hij
   de enige aanwijzing dat er iets boven iets anders hangt.

---

## Projectstand

De fase-tabel van fase 0 tot en met 6 stond hier tot 25 augustus 2026 en is
vervangen: het pakket is al sinds 0.1.0 uitgebracht en de rondes gaan sindsdien
per onderwerp, niet per fase. Wat er per ronde gebeurd is staat in `docs/<naam>/RAPPORT.md`;
`git log --oneline` leest als de inhoudsopgave.

**Wat er draait:** één integratie die haar eigen bundel serveert en registreert,
met **zestien kaarttypes**:

| | |
|---|---|
| Kop en indeling | header, separator, **navbalk**, **tabbladen** |
| Bediening | entiteiten (rij/tegel/compact, schuifschakelaar, tijdveld, keuzelijst), verlichting, klimaat, rolluiken |
| Media | media (rij en groot), scene, wekker |
| Meldingen | rookmelder, personen, afval, weersvoorspelling, **vaatwasser** |

Serverkant: een eigen `Store` met validatie en foutgedrag, WebSocket-commando's
voor de scenes en voor Music Assistant, `labels.py`, `ma.py`, `migratie.py` en een
options flow.

**Laatste release: 0.15.0** (26 augustus 2026) — de vijfde ronde van die dag:
kolomkoppen en een beeldvorm op de entiteitenkaart, een naam per rolluik, tien
iconen erbij, en de schaduwaudit over alle kaarten. Zie
`docs/kolomkoppen-beeld-en-tien-iconen/RAPPORT.md`.

**Die ronde is NIET in een browser geverifieerd** — de testinstance was
onbruikbaar geworden (valkuil 21) en niet meer te herstellen zonder de ingelogde
sessie weg te gooien. Alles wat zonder browser te controleren is, is
gecontroleerd; hoe het eruitziet niet. Dat staat groot in het rapport.

Die dag kende vijf rondes: **0.11.0** (`docs/feedback-26-augustus/`), **0.12.0**
(`docs/rookmelder-personen-en-meer-kaarten/`), **0.13.0**
(`docs/kaarten-bewerken-als-in-ha/`), **0.14.0**
(`docs/voorbeeld-bewerken-en-de-schaduw/`) en deze.

**Tellingen op het moment van schrijven:** 562 JS-tests en 136 Python-tests,
alle groen; bundel 439.005 bytes; 122 getekende iconen.

**Wat er open staat:**

- **Het logo van DomotiTech als icoon in de set**, zodat er een subknop op de
  navbalk mee gemaakt kan worden die naar `https://domotitech.nl` gaat. Het
  mechanisme is er al (een subknop met een icoon en een https-pad werkt); wat
  ontbreekt is de tekening. Gevraagd op 26 augustus 2026; het bestand moet nog
  aangeleverd worden in `dev/domotitech.svg`.
- **Alles van ronde 0.15.0 moet nog met eigen ogen bekeken worden**, want die
  ronde is zonder browser gebouwd. Zie de projectstand hierboven.

De donkere vlek waar hij sinds 0.10.0 zijn thema van verdacht, is opgelost: het
was onze eigen slagschaduw (valkuil 22).
