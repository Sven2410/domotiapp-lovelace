# CLAUDE.md — DomotiApp Lovelace

Lees dit eerst, daarna `SPEC.md`. Dit bestand gaat over **hoe** we werken;
`SPEC.md` gaat over **wat** we bouwen en is bindend.

En lees daarna `C:\dev\notities\domotiapp-lovelace\waar-gebleven.md`: dat is de
lopende stand — wat er af is, wat er bij de eigenaar ligt, wat er nog beproefd
moet worden. Die map is privé (adressen, entiteiten, klantgegevens mogen daar
wél in) en hoort bijgewerkt te worden zodra er iets af is.

**Waarom die twee bestanden en niet het geheugen van Claude Code:** dat staat in
`~/.claude/projects/...` en is per machine. De eigenaar werkt ook op een MacBook,
en daar is het leeg. Sinds 26 augustus 2026 staat alles wat onthouden moet worden
daarom in git — technische kennis hier, de stand daar.

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

## Hoe de eigenaar werkt

Overgezet uit het geheugen van Claude Code op 26 augustus 2026: dat staat per
machine en reist niet mee.

**Hij stuurt zijn verzoeken terwijl je al aan het bouwen bent**, in losse
berichten, en hij denkt gaandeweg door. Op 25 augustus 2026 kwamen er elf in één
sessie; op 26 augustus twintig, verdeeld over zes uitgaven.

- **Hij verwacht niet dat je stopt en overlegt.** Noteer wat erbij komt, bouw af
  waar je mee bezig bent, en breng het per ronde uit.
- **Vraag je hem om te prioriteren, dan krijg je "kies zelf, uiteindelijk moet
  alles gemaakt worden".** Dus kies zelf, en zet een fout in bestaand werk vóór
  nieuw werk.
- **Zijn feedback komt in halve zinnen met een schermafdruk.** Kijk naar de
  afbeelding, meet het na in de testinstance, en repareer het in dezelfde ronde.
  Maar **neem de diagnose niet over**: de "shadows" waar hij zijn thema van
  verdacht bleken van ons eigen `--dac-shadow` te komen, en dat kwam pas boven
  water door te meten. Zie valkuil 22.
- **Wat wél werkt:** elke paar rondes een korte tussenstand — wat gemerged is,
  wat klaar is maar nog niet uitgebracht, en wat er nog open staat. Daar
  reageert hij op met de volgende vraag, en dan weet je dat de vorige goed was.
- **Het rapport in `docs/<naam>/RAPPORT.md` is hoe hij het leest.** De
  terminaluitvoer is bij hem niet betrouwbaar over te nemen.

**Waarom dit zo hoort:** hij test alles meteen zelf op zijn eigen installatie.
Een ronde die blijft liggen tot er om overleg gevraagd is, is een ronde die hij
niet kan proberen.

De lopende stand — wat er bij hem ligt, wat er open staat — hoort **niet** in
dit bestand maar in `C:\dev\notities\domotiapp-lovelace\waar-gebleven.md`. Werk
dat bij zodra er iets af is, en push het: die repo is privé en reist mee naar
zijn tweede machine.

---

## Vormregels voor elke kaart

Uitgevochten in de rondes van 17 augustus 2026 en sindsdien niet meer ter
discussie. Ze gelden voor élke kaart, ook een nieuwe. **Stel ze niet opnieuw
voor.**

**Hoogte valt op HA's rasterrijen.** Een rij is 56px met 8px ertussen, dus een
kaart is 56, 120, 184 of 248 hoog — nooit ertussenin. Past iets niet op één rij,
maak er dan twee. Reden: een DomotiApp-kaart naast een Mushroom-kaart in
dezelfde kolom moet één kolom blijven. Zie valkuil 8 en 12 voor hoe dat in de
praktijk misgaat.

**Alleen het icoon draagt de toestand**, niet het hele kaartvlak. Een kolom van
acht aanstaande knoppen wordt anders een muur in plaats van een rij.

**Icoon en kaart zijn twee knoppen.** Tikken op het icoon schakelt de entiteit,
tikken op de kaart doet wat er is ingesteld — meestal navigeren naar een pop-up.
Zo doet hij het ook met zijn Mushroom-tegels: lampje aan zonder de kamer te
openen, of andersom.

**Geen statuskleuren in de kleurkiezer.** Kleur is op deze kaarten identiteit,
geen oordeel. Goed, let op en kritiek blijven van de kaart zelf.

**Geen "kleur volgt toestand"-instelling.** Dat is geen keuze: een knop die er
hetzelfde uitziet of het apparaat aan of uit staat, is kapot. De kleur volgt wat
eraan hangt — een lamp draagt de kleur die hij maakt, al het andere krijgt het
accent.

**Er is geen kleurkiezer meer, op één plek na.** Hij bood eerst negen kleuren
aan, daarna nog twee (Automatisch en Accent), en sinds 0.17.0 geen enkele. De
eigenaar op 26 augustus 2026: *"Nu staat er accent en automatisch. Ik wil gewoon
dat dat helemaal weg is."* Kleur is op deze kaarten identiteit, en de identiteit
is het accent van het merk; een knop die zelf een kleur mag kiezen is een knop
die uit de rij gaat lopen.

De uitzondering is de **afvalkaart**, waar de kleur de bák is -- grijs naast
groen naast oranje is de enige manier om te zien welke er woensdag aan straat
moet. Ook daar staat geen Automatisch en geen Accent: één vakje dat de
systeemkleurkiezer opent, een veld voor wie liever typt, en Wissen. Leeg =
de kaart kiest zelf.

**Een `tone` die al in een config staat blijft gewoon getekend**, en een oude
paletnaam houdt zijn eigen vakje met de Nederlandse naam erbij. Hem stil
verbergen zou betekenen dat een dashboard een kleur draagt die nergens meer te
vinden is.

**Tekst verschijnt zoals het is ingetypt.** Geen `text-transform: uppercase`;
het toetsenbord gaf "Woonkamer" en het scherm maakte er "WOONKAMER" van.

**Eigen afbeelding van een entiteit gaat voor het domeinicoon**, en een
zelfgekozen icoon gaat voor allebei.

**Weergave-blokken in editors houdt hij niet.** Instellingen staan op één
niveau; hij haalde ze bij de kopkaart, het afval en de knop expliciet weg.

**Behalve als hij er zelf om vraagt, en dan met een vinkje ervoor.** Op
28 augustus 2026: *"ik wil dat de presets onder een uitklapmenu vallen, dat ik ze
kan aanzetten met 1 vinkje, iets van presets en dan een vinkje er achter -- zo
houd je overzicht op de GUI."* Het verschil met wat hij eerder weghaalde: die
blokken waren een INDELING van instellingen die er toch stonden, dit blok is een
FUNCTIE die je in zijn geheel aan of uit zet. De vorm is: een schakelaar op één
regel, en het uitklapblok eronder alleen als hij aanstaat. Zie `section()` in
`src/editor/base.js` en valkuil 33.

**Een kaart die zijn hoogte aan zijn INHOUD ontleent, hoort een knop te
hebben om dat vast te zetten.** De camerakaart volgt zijn camera, en dat is goed
in een pop-up waar er één staat. Maar in een `horizontal-stack` staan er drie
naast elkaar, en dan is elke andere beeldverhouding een andere hoogte -- gemeld
op 28 augustus 2026 met een schermafdruk: *"de linker onderste camera is groter,
zie je dat?"* Dus: standaard volgen, met een instelling om het gelijk te trekken.
Niet andersom, want een vaste maat snijdt beeld af en dat is een keuze van de
klant.

**Statusregels weglaten als er niets te melden is.** Zijn rolluiken melden niets
terug, en een zin die zegt dat er niets bekend is maakt de rij alleen hoger.

### De vormtaal komt van DomotiApp Coach

De tokens staan in
`C:\dev\domotiapp-coach\custom_components\domotiapp_coach\frontend\src\theme.js`.
Dat bestand is de bron; hier staat de samenvatting, niet iets om opnieuw te
bedenken.

Ground `#0c0c0a`, raised `#12120f`, oppervlak wit op 3,8%/7%, inkt `#e8e4de` met
62%/38% ladders, accent `#026fa1` / hi `#198fd9` (ook zijn website-accent).
Radius 20/12/pill.

Twee regels die in dat bestand zelf gemotiveerd staan:

1. **Rood en groen zijn gereserveerd voor status** en staan bewust niet in de
   identiteitskleuren. De categorische set is zon `#dc7300`, huis `#235efa`,
   grid-in `#129be4`, grid-out `#bc10c8`, device-1 `#fd0774`, device-2 `#039580`
   — gezocht op OKLCH-scheiding en kleurenblindheidsafstand tegen `#12120f`.
   Niet vervangen zonder die zoektocht opnieuw te draaien.
2. **Het getal draagt nooit de kleur.** Waarden in neutrale inkt; identiteit zit
   in de icoonchip.

**Geen webfonts.** HA's eigen UI-font, zodat er niets geladen wordt. Previews
gebruiken datzelfde font, anders liegen ze over uitlijning en regellengte.

**Waarom dit alles:** hij bouwt een merk (DomotiTech / DomotiApp) en wil dat een
dashboard als één product leest, niet als zes HACS-kaarten naast elkaar.

---

## Distributie via HACS

**Dit pakket is een INTEGRATIE, geen plugin, en dat scheelt de klant werk.** Het
zet zijn bundel op een eigen URL, meldt hem aan bij de frontend én registreert
hem als Lovelace-resource. De klant hoeft niets toe te voegen.

**`hacs.json` heeft `hide_default_branch: true`, en dan MOET er een
GitHub-release zijn** — zonder release biedt HACS niets aan om te installeren.
Vastgesteld op 18 augustus 2026 bij het opzetten van dit pakket. Tags zijn kaal,
zonder `v`-prefix; HACS pakt de repo-inhoud van de tag, een asset is niet nodig.

**Er is precies één resource-URL, dus één gebundeld bestand.** Daarom `src/`
gesplitst plus een esbuild-stap, en de gebouwde bundel meegecommit — `npm run
verify` bewaakt dat die niet achterloopt op de bron. Uit de tijd dat dit nog een
plugin was: `zip_release: true` werkt daar niet, want HACS registreert dan het
zipbestand zelf als JavaScript-module en er laadt geen enkele kaart.

**Een kaart mag NOOIT gooien in `setConfig`.** Dat draait bij elke toetsaanslag
in de editor, en eenmaal met een lege stub zodra je de kaart uit de lijst kiest.
Gooien geeft dan "Ongeldige configuratie" in plaats van een voorbeeld. Een lege
config toont daarom een uitlegkaart via de `INCOMPLETE`-symbol in `src/base.js`.

**HACS ververst de releaselijst van een eigen repository ongeveer eens per
etmaal.** Een verse tag is bij hem dus niet meteen zichtbaar; hij moet
"Informatie bijwerken" doen in HACS. Vastgesteld op 17 augustus 2026. Dat is
géén reden om minder te releasen — hij vraagt om een uitgave per ronde — maar
wel de reden dat hij soms zegt dat een update er nog niet is terwijl hij er wel
staat. Een release kost hem bovendien een herstart van Home Assistant, want de
bundelhash wordt berekend bij het opzetten van de integratie (valkuil 2).

---

## Omgeving

- Windows 11, PowerShell, `C:\dev\domotiapp-lovelace`. Op de MacBook is het
  `~/dev/domotiapp-lovelace`, en daar draait de testinstance ZONDER Docker --
  zie *Een testinstance zonder Docker* hieronder.
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
  websocket met het token uit `C:\dev\tokens\thuis.txt`; een service aanroepen of
  config wegschrijven is en blijft verboden. Deze regel stond er eerst als
  "ook niet gelezen"; op 20 augustus 2026 heeft de eigenaar hem versoepeld toen
  hij vroeg naar zijn eigen dashboard te kijken. Het tokenbestand heette tot
  26 augustus 2026 `ha-token.txt` en staat sindsdien per installatie in
  `C:\dev\tokens\` (niet in git). Wat er verder over zijn installatie bekend
  is -- dashboards, apparatuur, Music Assistant -- staat in de privérepo:
  `C:\dev\notities\domotiapp-lovelace\`. Hier niet, want deze repo is publiek.
- `C:\dev\_ref\ultimate-scene-card` is uitsluitend leesmateriaal, zonder remote.
  **Nooit in schrijven.** De analyse ervan staat in `INVENTARIS.md`.

### Een testinstance zonder Docker (macOS)

Op de MacBook staat geen Docker, en dat hoeft ook niet: Home Assistant draait
daar gewoon in een virtualenv. Opgezet en gebruikt op 26 augustus 2026; de hele
ronde 0.17.0 is er in een echte browser mee nagemeten.

```bash
python3.14 -m venv venv
./venv/bin/pip install "homeassistant==2026.8.*"
ln -s ~/dev/domotiapp-lovelace/custom_components/domotiapp_lovelace \
      ./config/custom_components/domotiapp_lovelace
./venv/bin/hass -c ./config          # poort 8127, net als in de container
```

Onboarding, de config entry, een lichtgroep en een dashboard gaan allemaal via
de API; er hoeft geen dialoog aan te pas te komen. `/api/onboarding/users` geeft
een `auth_code` die je op `/auth/token` inwisselt, en daarna is het dezelfde
REST- en WebSocket-API als altijd.

Drie dingen die daarbij tijd hebben gekost:

- **De demo-integratie start niet op macOS.** `demo/camera.py` wil
  `libturbojpeg`, die er niet is, en dan valt de HELE entry om -- inclusief de
  demolampen, die je juist nodig hebt. Sjabloonlampen in `configuration.yaml`
  doen hetzelfde werk. En let op: `light: - platform: template` bestaat niet
  meer in 2026.8, het moet onder de eigen `template:`-sleutel.
- **`hass` herstart zichzelf niet.** De service `homeassistant.restart` laat het
  proces afsluiten met code 100 en verwacht iets dat hem weer start. Een lusje
  van drie regels eromheen is genoeg -- zonder dat is je instance na één
  herstartproef weg.
- **Een access token uit de onboarding verloopt binnen het uur.** Loopt een
  `curl` ineens op `401: Unauthorized`, dan is dat het; werk verder vanuit de
  paginacontext (`window.hassConnection`) of haal een nieuw token.

**De Python-tests draaien er ook gewoon** (526 groen op 26 augustus 2026):
`./venv/bin/pip install -r requirements-test.txt` en dan `python -m pytest -q`.
Op macOS is de omweg via Docker uit *Commando's* dus niet nodig; die geldt
alleen voor Windows, waar Home Assistant `fcntl` importeert.

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

Sinds 28 augustus 2026 staan er zes **sjabloon-bewegingsmelders** in
`configuration.yaml`, die samen de zes soorten van de cameratijdlijn dekken:
`binary_sensor.persoon_oprit`, `auto_oprit`, `huisdier_tuin`, `deurbel`,
`slot_voordeur` en `beweging_tuin`. Ze staan altijd op `off`; hun GESCHIEDENIS is
met de hand in `home-assistant_v2.db` gezet (container stoppen, `states_meta` en
`states.last_updated_ts` bijwerken, container starten), zodat er een hele dag
te meten valt. Aanzetten voor een proef kan met `POST /api/states/<id>` -- dat
overschrijft de sjabloonwaarde tot de volgende herstart, en het levert een echte
regel in de recorder op.

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

## Hoe de integratie in elkaar zit

Dit pakket is sinds 18 augustus 2026 **de plek waar alles in zit**: alle
kaarten, de scenekaart (uit domotiapp-scene) en de wekkerkaart (uit
domotiapp-alarm), in één bundel, geleverd door één integratie. Bevestigd door de
eigenaar op 20 augustus 2026: **er komt geen kaart meer bij in een losse repo.**
Start een sessie gerust in een oude map — het werk gebeurt alsnog hier.

**De laadroute is die van de wekker.** Een lader onder `/api/` met een VASTE URL
die de bundelhash in zijn *antwoord* geeft. Een gehashte URL rechtstreeks in
`index.html` overleeft HA's service worker niet. Zie ook valkuil 2 en 15.

**De wekkerkant is een subpakket** `alarm/`, met `alarm_`-voorvoegsels op zijn
`hass.data`-sleutels — beide kanten hadden een `store` en een `ws_registered`.

**Overnemen uit een voorganger staat in `migratie.py`**, met een bestandstoets
vóóraf. In de opslaglaag zelf zetten brak de wekkertests. Scenes én wekkers zijn
bij de eerste start automatisch overgenomen; dat is op de echte installatie
bevestigd, niet alleen in tests. De oude opslagbestanden blijven als vangnet
staan.

**Music Assistant loopt via twee bestanden.** `ma.py` (config entry opzoeken,
`music_assistant.search`, antwoord platslaan) en `labels.py` (labelnaam →
entiteiten, uitgerold over entiteit, apparaat en gebied) worden door de wekker-
én de mediakant gebruikt. De mediakant heeft twee WS-commando's, `media/search`
en `media/speakers`; al het andere — afspelen, `join`/`unjoin`, shuffle,
herhalen — doet de kaart met gewone service-aanroepen.

**Twee labels, met opzet gescheiden:** `Music Assistant Wekker` en
`Music Assistant Media`. De opzoeking gaat op **naam**, dus hernoemen in Home
Assistant breekt de koppeling. Sinds 0.8.0 is het label niet meer verplicht: de
mediakaart heeft een veld *Speakers om mee te groeperen*, en leeg laten valt
terug op het label. Sinds 0.16.1 valt een ALGEMENE mediaspeler daar niet op
terug maar op zijn eigen speakerlijst.

### Twee dingen die met opzet zijn weggehaald

- **De knopkaart bestaat niet meer.** `custom:domotiapp-button-card` is opgegaan
  in de entiteitenkaart, zonder schil voor het oude type — dat was zijn keuze.
  Een losse knop is een rij van één kolom. Een plek zónder entiteit is een
  navigatieknop, en daarom staat overal `gevuld()` waar eerst `item.entity`
  stond.
- **Het alarmpaneel is er helemaal uit** (0.6.0), inclusief `paneelcode.py`, de
  options-flow-stap Alarmcode en `codepad.js`. Zijn reden: **een alarm hoort
  niet via een dashboardkaart uitgeschakeld te worden.** Het staat in een eigen
  commit, dus terug te draaien — maar draai het niet terug zonder het te vragen.

**De wekkerkaart heette eerst "DomotiApp Alarm"** en dat las in de kaartkiezer
als een alarmsysteem. Sinds 0.6.0 heet hij **DomotiApp Wekker**; het `type` bleef
`domotiapp-alarm-card`.

---

## Meten in een echte browser

De werkafspraak hierboven zegt dát er met echte kliks gemeten wordt. Deze sectie
zegt **hoe**, want elk van deze valkuilen heeft hier een keer een uur gekost.

**De browsertool klikt in SCHERMAFDRUK-coördinaten, niet in CSS-pixels.** Een
`getBoundingClientRect()` uit de pagina moet je dus omrekenen voordat je hem aan
`computer` geeft, anders klik je honderden pixels mis en lijkt de knop kapot.
Gevonden op 21 augustus 2026, en op 26 augustus 2026 nog twee keer opnieuw
ingelopen.

**Reken de factor per keer uit; het is geen vast getal.** Hij is de breedte van
de schermafdruk gedeeld door `window.innerWidth` op dat moment. Op 26 augustus
2026 was dat 1568 op 1920 (0,817), maar de schermafdruk kwam die sessie in drie
verschillende hoogtes terug (744, 699, 698) omdat het venster meebewoog. Zet dat
getal dus niet vast: lees het af van een VERSE schermafdruk, of gebruik een
hit-test op het klikpunt (valkuil 6) en laat het rekenen erbuiten.

**En als er niets gebeurt, controleer eerst dát er geklikt is.** Hang een
capture-luisteraar op `window` en lees `event.composedPath()` (valkuil 14); dan
zie je het verschil tussen "hij landde ergens anders" en "er is helemaal niets
aangekomen". Dat laatste betekent meestal
`document.visibilityState === "hidden"` — zie hieronder. Zonder die toets
concludeer je dat een knop kapot is terwijl je zelf naast zat; dat is op
26 augustus 2026 twee keer gebeurd.

**Zijn Chrome staat op `prefers-reduced-motion: reduce`.** Elke animatie die je
bouwt is daar uitgeschakeld, dus met een schermafdruk bewijs je niets over
beweging. Meet `getComputedStyle(el, "::after").animationName` met de twee
reduced-motion-regels tijdelijk uit `adoptedStyleSheets[0]` gehaald — en zet ze
meteen terug. Er zijn er **twee**: een globale in `baseCss` van `theme.js` en die
van de kaart zelf.

**Het venster vooraan halen is niet genoeg: het TABBLAD moet het actieve zijn.**
Komt er geen enkele klik aan, controleer dan eerst
`document.visibilityState === "hidden"`. Het Chrome-venster naar voren halen kan
zelf — `Get-Process chrome | where MainWindowHandle -ne 0` plus
`SetForegroundWindow` via `Add-Type` — maar dat zet alleen het venster vooraan.
Zat de MCP-tab achter een ander tabblad in datzelfde venster, dan blijft het
`hidden`. Wat wél werkte: met `WScript.Shell.SendKeys` `^{TAB}` doorstappen tot
de venstertitel de paginatitel is. Daarna `visible` en `hasFocus() === true`.
Je mag het hem ook gewoon vragen; dat deed hij zonder morren.

**Een native kiezer van de browser is niet met de browsertool te bedienen** —
een klok, een kalender, een `<select>`-dropdown. Dat is een venster buiten de
pagina; een klik op die coördinaten gaat er dwars doorheen en landt op de kaart
eronder. Het OPENEN bewijs je met een schermafdruk, het INVULLEN met echte
toetsaanslagen.

**Zonder Docker geen Python-tests op Windows.** Draait Docker Desktop niet, start
hem dan met `Start-Process` op
`AppData\Local\Programs\DockerDesktop\Docker Desktop.exe` en wacht tot
`docker info` slaagt.

### De werkbank in `dev/`

`dev/preview.html` is de grote werkbank; `dev/alarmcode.html` en `dev/cijfers.html`
zijn gerichte proefopstellingen met een vaste hoogte.

- **De werkbank schuift onder je klikken vandaan**: kaarten erboven veranderen
  van hoogte als abonnementen binnenkomen. Voor een gerichte meting hoort er een
  pagina met vaste hoogte te zijn.
- **Het logpaneel onderin ligt over de kaarten heen** (`position: fixed`, de
  onderste ~220px). Scroll je klikdoel daarboven.
- **De browser houdt ES-modules vast over een gewone reload heen.** Serveer op
  een NIEUWE poort na een bronwijziging.
- **`dev/ha-form-stub.js` moet bij ELKE toetsaanslag vuren**, net als HA's
  `ha-textfield`. Hij vuurde eerst alleen bij `change`, en daardoor kon de
  werkbank de bevroren-config-bug (valkuil 23) structureel niet laten zien —
  precies de bug die twee releases kostte. Test een editor door letter voor
  letter te typen en te tellen of er evenveel `config-changed` uitkomen als
  aanslagen.

### De testinstance opzetten

Zie **Omgeving** hierboven voor container, poort en testmateriaal. Twee dingen
die daar niet staan:

- **Controleer wélke map er gemount is** voordat je conclusies trekt:
  `docker inspect ha-lovelace --format '{{range .Mounts}}{{.Source}} {{end}}'`.
  De containernaam stond ooit in twee compose-bestanden, en dan draait er een
  container van een ánder project op onze poort, met een andere integratie erin.
- **Een config entry toevoegen gaat via de API**, niet door drie dialogen: haal
  het token uit `localStorage.hassTokens` in de paginacontext en POST naar
  `/api/config/config_entries/flow`. **Herladen** van die entry na elke
  `npm run build` is verplicht (valkuil 2), en dat is een REST-aanroep —
  `config_entries/reload` bestaat niet als WebSocket-commando:

  ```js
  const c = await window.hassConnection;
  await fetch(`/api/config/config_entries/entry/${entryId}/reload`,
    { method: "POST", headers: { Authorization: "Bearer " + c.auth.accessToken } });
  ```

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

9. **Een view heeft na een harde herlading TOT RUIM TIEN SECONDEN nodig om te
   bouwen**, en in bewerkmodus eerder meer dan minder. Meet je te vroeg, dan
   vind je nul kaarten en lijkt het of alles stuk is. Dat is inmiddels vier keer
   ten onrechte voor een regressie aangezien -- op 26 augustus 2026 nog twee
   keer op een rij, met acht seconden wachten. Wacht tot `hui-card`-elementen kinderen
   hebben, en trek pas een conclusie als de console een fout toont.

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

16. **Geen backticks in een CSS-commentaar.** Sinds 28 augustus 2026 draait
   `check:css` bij ELKE `npm run build`, want die dag ging het opnieuw mis en de
   bewaker was simpelweg niet gedraaid -- bouwen en controleren waren twee
   opdrachten en alleen de eerste hoort bij het meten. Een `` `.groot` `` in een
   commentaar gaf `TypeError: "...".groot is not a function`, geen enkele
   geregistreerde kaart en een leeg dashboard. De bewaker had het gevangen.
   Een fout die een bewaker kan vangen hoort niet af te hangen van of iemand
   eraan denkt hem te draaien. Alle CSS staat in een
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

   **Bijstelling van later diezelfde dag:** het is NIET onherstelbaar. Hetzelfde
   profiel dat 's middags geen enkele view meer bouwde -- ook niet zonder onze
   kaarten -- deed het 's avonds weer, zonder ingrijpen. Trek dus geen conclusie
   over onbruikbaarheid; probeer het later opnieuw.

   **Tweede bijstelling, 28 augustus 2026: het wissen van de service worker is
   ook de WEG ERUIT.** Toen dit opnieuw gebeurde -- `hui-root` zonder `hui-view`,
   `hui-sections-view` niet eens gedefinieerd, geen fout in de console -- hielp
   precies dat: de service worker en de caches wissen, tabblad sluiten, vers
   tabblad. Daarna bouwde alles weer.

   **En hoe je in vijf minuten weet dat het niet aan je kaart ligt.** Deze fout
   is die dag drie keer verkeerd gediagnosticeerd (de nieuwe config, de
   sections-view, de kaart zelf). Twee toetsen die het meteen uitwijzen:

   - **Bouwt het automatisch gegenereerde dashboard "Thuis" nog wel?** Doet die
     het en de rest niet, dan ligt het aan de frontend van HA in dat tabblad.
   - **Hang je kaart met de hand in de pagina** en kijk of hij zich tekent:

     ```js
     const el = document.createElement("domotiapp-camera-card");
     el.setConfig(config);
     el.hass = document.querySelector("home-assistant").hass;
     document.body.appendChild(el);
     ```

     Dat is de echte kaart met de echte `hass` en de echte websocket -- alleen
     zonder de view-laag van Home Assistant eromheen. Tekent hij zich daar wél,
     dan zit het probleem in die laag en niet bij jou. Het is bovendien een
     bruikbare meetopstelling: er kan gewoon met een echte klik in geklikt
     worden.

22. **De slagschaduw op een kaart van één rasterrij is een vlek.** Een schaduw
   van 18px omlaag met 40px onscherpte valt weg onder een kaart van drie rijen,
   maar staat onder een kaart van 56px net zo hoog als de kaart zelf -- en drie
   van die kaarten onder elkaar geven donkere banden. `--dac-shadow` draagt
   daarom sinds 0.14.0 alleen nog de haarlijn bovenlangs. Zwevende dingen (de
   navbalk, zijn menu, het mediazoekscherm) houden hun schaduw wél: daar is hij
   de enige aanwijzing dat er iets boven iets anders hangt.

23. **`ha-form` schrijft zijn config bij ELKE toetsaanslag terug door
   `setConfig`, en een editor die zijn eigen echo niet herkent gooit je eruit.**
   De entiteiten-editor vergelijkt daarvoor `uitgekleed(naarRijen(config))` met
   wat hij zelf wegschreef. Voeg je een eigenschap toe aan de UITVOER
   (`uitgekleed`) maar niet aan het INLEZEN (`naarRijen`), dan verschilt die
   vergelijking altijd, herbouwt de editor per aanslag, en verdwijnt het veld
   onder je vingers. Dat kostte de kolomkoppen én het typen tegelijk. Het
   rekenwerk staat daarom sinds 26 augustus 2026 los in
   `src/editor/entities-rijen.js`, met een test die eist dat alles wat eruit
   gaat er ook weer in komt.

24. **Een kaart die kinderen cachet moet die cache legen in `setConfig`.**
   `DacCard.setConfig` gooit de hele shadow-DOM weg. Wat er in een `Map` staat
   hangt daarna nergens meer, maar de Map weet dat niet -- en een `if
   (cache.has(i)) return` slaat dan het opnieuw opbouwen over. De tabbladenkaart
   bleef zo LEEG na de eerste wijziging in de editor.

25. **`element.isConnected` is `false` tijdens de eerste opbouw in een
   kaarteditor.** Home Assistant maakt het voorbeeld en zet de config VOORDAT
   het element in het document hangt. Een herkansing die daarop afhaakt (`if
   (!el.isConnected) return`) stopt dus meteen en komt nooit terug. Zoek het
   element elke ronde opnieuw op in plaats van een verwijzing vast te houden.
   Idem voor de editor zelf: die komt later dan het voorbeeld -- wacht op de
   `hui-dialog-edit-card`-voorouder en zoek de editor pas op bij de KLIK.

26. **`dialog-box` van Home Assistant is er niet.** Op een vers geladen
   dashboard is `customElements.get("dialog-box")` gewoon `undefined`; hij wordt
   lui geladen. Een `show-dialog` met die tag doet dan niets, zonder fout. Voor
   "Weet je het zeker?" gebruiken we daarom `src/vraag.js` -- een eigen scherm
   dat er altijd is. Gemeten op 26 augustus 2026.

27. **Importeer geen custom element vanuit `ha.js`.** Dat bestand wordt in
   gewone Node-tests geladen, en een `class ... extends HTMLElement` op
   modulescope gooit daar de halve testsuite om. Laat het element zich AANMELDEN
   bij `ha.js` (`meldVraagAan`) en importeer het vanuit `index.js`.

28. **"Unknown command." betekent niet dat er iets stuk is, maar dat je te vroeg
   bent.** De WebSocket-commando's van deze integratie worden geregistreerd als
   de config entry wordt OPGEZET; tot dat moment kent Home Assistant ze niet en
   antwoordt hij `unknown_command`. Gemeten op 26 augustus 2026, meteen na een
   herstart:

   ```
   [  3.36s] websocket open
   [  3.36s] FOUT — unknown_command: Unknown command.
   [  3.87s] OK — scenes geladen
   ```

   Op een kale testinstance een halve seconde; op een installatie met veel
   integraties veel langer. Wie het eerst terug is na een herstart verliest --
   de companion-app op een telefoon verbindt onmiddellijk opnieuw en tekent het
   scherm dat openstond. Dat is precies hoe de eigenaar het meldde: op één
   telefoon deed hij het niet, op een andere telefoon en op Windows wel.

   **En het is NIET de gebruiker.** Zijn vermoeden was dat het aan het gewone
   (niet-beheerders)account lag; nagemeten met twee echte logins in één instance
   en het maakt geen verschil. Het commandoregister van `websocket_api` staat
   per HA-installatie, niet per verbinding en niet per gebruiker. Neem die
   diagnose dus niet over -- meet hem.

   Elke kaart die een eigen WS-commando aanroept hoort daarom `nogNietGereed`
   uit `src/herkansing.js` te gebruiken en het straks opnieuw te vragen.

29. **`box-sizing` staat NIET overal op `border-box`.** De bevestigingsvraag
   stond op `width: min(420px, 100%)` met 22px padding, en zonder border-box
   telt die padding er bovenop: op een scherm van 390 CSS-pixels werd dat vak
   396 breed in een laag die er 350 te geven had, en liep het dus over allebei
   de schermranden. Dat las als "past niet op mobiel", en de verleiding is dan
   om aan de MATEN te gaan draaien. Meet eerst de breedte van het vak tegen
   `window.innerWidth`: 466 in een venster van 500 is geen smaakkwestie.
   Componenten die het wél goed doen zetten `*, *::before, *::after {
   box-sizing: border-box; }` bovenaan hun eigen CSS.

30. **"De server is bij" zegt NIETS over wat een client draait.** Op 26 augustus
   2026 meldde de eigenaar een fout die in de uitgave van een uur eerder was
   opgelost. Gemeten op zijn installatie: de bundel die zijn Home Assistant
   uitserveerde was tot op de sha256 gelijk aan die op schijf. **Zijn telefoon
   draaide gewoon oude code**, en dat is bevestigd doordat het legen van de
   frontendcache het verhielp.

   De reden is de companion-app: die houdt zijn webview **dagen** in leven. Een
   herstart van Home Assistant herstelt de websocket en laat de JavaScript
   staan. `loader.py` zorgt dat elke PAGINALADING op de juiste bundel uitkomt --
   maar er komt geen paginalading.

   Sinds 0.18.0 lost `src/verouderd.js` dat op: de bundel vergelijkt zijn eigen
   hash (`import.meta.url`) met die van de lader en herlaadt eenmalig zodra de
   pagina zichtbaar wordt. **Trek dus nooit een conclusie over de code op een
   toestel uit wat de server serveert**, en vraag bij een melding die "al
   opgelost" zou moeten zijn éérst welke versie dat toestel draait.

31. **esbuild gooit commentaar weg, dus een commentaarwijziging geeft dezelfde
   bundelhash.** Bij het naspelen van een verouderde pagina is er eerst een
   regel commentaar aan een bronbestand toegevoegd en opnieuw gebouwd; de bundel
   was byte-identiek (`480465 bytes`, dezelfde sha256) en er viel dus niets te
   meten. Wil je een andere hash, wijzig dan iets dat de bundel HAALT -- een
   constante, een string. Handig om te weten voor het omgekeerde geval ook: een
   commit die alleen commentaar aanraakt hoeft de gecommitte bundel niet te
   veranderen, en `npm run verify` klaagt dan terecht niet.

32. **De recorder van Home Assistant schrijft met VERTRAGING weg.** Wie
   `history/history_during_period` aanroept vlak nadat er iets gebeurd is, krijgt
   dat laatste er niet bij. Gemeten op 28 augustus 2026 in de testinstance:

   ```
   melder gaat aan   10:55:41
   opgehaald         10:55:43  ->  de nieuwe regel ontbrak
   opgehaald         10:55:59  ->  hij stond er
   ```

   Twee seconden is dus te kort, vijf is genoeg gebleken. Het venijn zit in wat
   je ONDERTUSSEN wél ziet: een merkje dat uit `hass` komt verschijnt meteen, en
   dan lijkt de lijst eronder kapot in plaats van traag. Deze meting komt uit een
   tijdlijn die de geschiedenis las; die is er niet meer (de snapshots van de
   bewakingsmotor zijn de bron geworden), maar de marge geldt voor alles wat de
   recorder kort na een gebeurtenis uitleest.

33. **Een uitklapblok in `ha-form` met een `name` NESTELT zijn waarden.**
   `ha-form` geeft een blok met een naam `data[name]` mee in plaats van de hele
   config, dus `presets` belandt dan als `presets_blok: {presets: ...}` in de
   YAML en de kaart vindt zijn eigen instellingen niet meer terug. Precies
   hetzelfde als bij `row()`, waar de lege `name` ook geen versiering is. Zo
   stond `section()` in `src/editor/base.js` sinds het begin, en het is nooit
   opgevallen omdat geen enkele kaart hem gebruikte -- de eerste die hem gebruikt
   loopt er dus vol in. Sinds 28 augustus 2026 heeft hij een lege naam en een
   aparte `title`, en geeft `DacEditor.label()` voor een `expandable` die titel
   terug. Toets het na met `Object.keys(config).filter(k => typeof config[k] ===
   "object")`: daar hoort niets in te staan.

34. **In een pop-up is `position: fixed` niet vast aan het scherm.** Zodra een
   voorouder een `transform`, `filter` of `backdrop-filter` heeft, wordt DIE het
   referentievlak. De pop-ups van bubble-card -- waar de eigenaar het halve
   dashboard mee opbouwt -- schuiven open met een transform, en dus:

   - vulde het opslagscherm van de camerakaart de pop-up in plaats van het
     scherm, met zijn kop (en dus de terugknop) erbuiten;
   - landde een menu dat met vensterkoördinaten geplaatst werd buiten beeld. Je
     ziet dan alleen dat de knop oplicht en verder niets gebeuren. Gemeld op
     28 augustus 2026: *"als ik op vandaag klik wordt hij blauw en gebeurt er
     niets."*

   **Alles wat over het scherm hoort te liggen, hangt daarom aan
   `document.body`** -- de bevestigingsvraag (`vraag.js`), het mediazoekscherm en
   sinds 0.31.2 ook het opslagscherm van de camera (`cards/camera-archief.js`).
   Dat staat sinds 26 augustus in de kop van `vraag.js`, en het is op 28 augustus
   alsnog misgegaan in een ander bestand: **kennis in één bestand is geen
   bewaking.**

   En andersom: iets dat aan een KAART hoort (een uitklaplijstje bij een knop)
   houd je juist `absolute`. Fixed ontsnapt wel aan `overflow: hidden`, maar valt
   om in een pop-up. Zit de kaart in de weg met `overflow: hidden`, haal dat dan
   daar weg in plaats van naar `fixed` te grijpen.

35. **Niet elke melder wordt `on`.** Een `event`-entiteit draagt het TIJDSTIP van
   de laatste gebeurtenis als toestand -- er valt niets om te slaan -- en een
   `lock` gaat naar `unlocked`. Wie op `state == "on"` filtert, mist ze allebei
   zonder een spoor in het logboek. Gemeld op 28 augustus 2026: het ontgrendelen
   van zijn voordeur leverde geen snapshot op terwijl het in zijn Home Assistant
   keurig binnenkwam:

   ```
   12:26:03   event.voordeur_toegang   -> 2026-08-28T12:26:03.818+00:00
   12:26:20   lock.voordeur            -> unlocked
   ```

   **UniFi doet dit overal:** Access levert ontgrendelen en aanbellen als
   `event`, en Protect levert zijn slimme detecties óók als `event`
   (`event.fietsenhok_voertuig`) naast de `binary_sensor`. Zie `is_detectie()` in
   `bewaking/motor.py` voor de regel per domein.

   **En `device_class` is een feit waar een naam een gok is.** `doorbell` maakt
   van een entiteit een deurbel, hoe hij ook heet. Dat gaat vóór het raden op
   woorden -- zie `raadSoort` in `cards/camera-filters.js`.

36. **Twee integraties kunnen hetzelfde apparaat ANDERS noemen dan hetzelfde
   apparaat.** In zijn huis heten het UniFi Access-slot en de UniFi
   Protect-camera allebei "Voordeur", maar het zijn twee apparaten met twee
   ID's. `camera-logica.js` koppelt een melder aan een camera op het APPARAAT en
   met opzet niet op de naam (zie de kop daar). Bij UniFi valt die koppeling dus
   weg, en dan hoort de melder bij ALLE camera's van de kaart -- één
   ontgrendeling zou vijf snapshots opleveren. Daar is het veld *"↳ hoort bij
   welke camera"* voor, en bij UniFi is het invullen ervan geen luxe.

37. **Een `tag` op een melding VERVANGT de vorige met dezelfde tag.** Dat is
   precies wat je wilt bij twintig bewegingen op dezelfde oprit, en precies wat
   je NIET wilt als er twee verschillende dingen aan dezelfde camera hangen. Bij
   hem hingen `event.voordeur_deurbel_drukken` en `event.voordeur_toegang`
   allebei aan `camera.voordeur`, en dan duwde "Ontgrendelen" de melding
   "Aanbellen" van zijn scherm. Sinds 0.33.1 gaat de tag per camera ÉN melder;
   de `group` blijft gedeeld, zodat ze wel bij elkaar staan.

38. **Hij draait zijn EIGEN automatiseringen naast onze kaarten.** Op zijn
   installatie staan blueprint-automatiseringen die bij dezelfde gebeurtenis ook
   een snapshot maken en een melding sturen (`Bezoeker voordeur snapshot +
   notificatie`, `Ontgrendeling voordeur snapshot + notificatie`, en dezelfde
   voor de oprit en het fietsenhok). Krijgt hij twee meldingen of gedraagt er
   zich één anders dan de onze, kijk dan eerst of het er twee zijn:

   ```
   GET /api/states  ->  automation.*  met attributes.last_triggered
   GET /api/config/automation/config/<id>
   ```

   Vraag het hem daarna; het is zijn huis en zijn keuze welke van de twee blijft.
   Neem niet aan dat een melding die zich vreemd gedraagt van ons is.

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

**Laatste release: 0.17.0** (26 augustus 2026) — vier meldingen van de eigenaar:
de scenes die het op één telefoon niet deden (een wedloop met het opstarten, zie
valkuil 28, opgelost met `src/herkansing.js`), de bevestigingsvraag die niet op
een telefoon paste (valkuil 29), de kolomkoppen die bij de beeldvorm niet in het
midden stonden, en de kleurkiezer die overal weg moest. Daarbij: een kaart in een
tabblad heeft nu de drie tabbladen van Home Assistant zelf — Configuratie,
Zichtbaarheid, Indeling — en die dóen ook iets, want de kaarten in een tab gaan
sindsdien door `hui-card` en staan in een raster van twaalf kolommen. Zie
`docs/vier-meldingen-van-26-augustus/RAPPORT.md`.

**Daarvoor 0.16.1** (26 augustus 2026) — voorgedefinieerde subknoppen
(DomotiTech en "Herstart Home Assistant", met een eigen bevestigingsscherm), een
**algemene mediaspeler** met een speakerkiezer, de kleurkiezer teruggebracht tot
Automatisch en Accent, zeventien iconen erbij, en de fout die maakte dat je uit
het naamveld van de entiteiten-editor werd gegooid. In 0.16.1 kort daarna: de
speakerkiezer toont alleen nog de spelers van Music Assistant, groeperen op een
algemene kaart gaat over diezelfde speakers, en het volume van de hoofdspeaker
wordt alleen overgenomen als die er een heeft. Zie
`docs/voorgedefinieerde-knoppen-en-de-algemene-speler/RAPPORT.md`.

Deze ronde is **wél** in een echte browser geverifieerd: de testinstance is
vanzelf hersteld (zie de bijstelling bij valkuil 21).

De vijf rondes ervoor, dezelfde dag: **0.11.0** (`docs/feedback-26-augustus/`),
**0.12.0** (`docs/rookmelder-personen-en-meer-kaarten/`), **0.13.0**
(`docs/kaarten-bewerken-als-in-ha/`), **0.14.0**
(`docs/voorbeeld-bewerken-en-de-schaduw/`) en **0.15.0**
(`docs/kolomkoppen-beeld-en-tien-iconen/`). Die laatste is als enige zonder
browser uitgebracht, en is met deze ronde alsnog nagelopen.

**Tellingen op 28 augustus 2026 (0.33.1):** 900 JS-tests en 604 Python-tests,
alle groen; bundel 625.497 bytes; 158 getekende iconen (het DomotiTech-logo
meegerekend, dat als data-URI is ingebakken).

**De releaseverhalen hierboven lopen tot 0.17.0 en zijn niet bijgewerkt.** Dat
is met opzet: de lopende stand hoort in
`C:\dev\notities\domotiapp-lovelace\waar-gebleven.md` en de ronde zelf in
`docs/<naam>/RAPPORT.md`. Wat hier staat is het soort kennis dat blijft gelden,
niet wat er het laatst uitgebracht is.

**Wat er open staat:**

- **Groeperen op één scherm.** Sinds 0.16.1 kun je op een algemene mediakaart
  groeperen, maar dat gaat via de zoekknop -- een scherm verder dan de
  speakerkiezer. Een echte Sonos-kaart doet kiezen én koppelen op één scherm.
  De eigenaar is hier niet naar gevraagd; als hij het wil, is het een volgende
  ronde.
- **De kleurkiezer op de afvalkaart.** Die is als enige blijven staan, met een
  reden (zie *Vormregels*). Zegt de eigenaar dat hij ook daar weg moet, dan is
  dat één regel.

Twee dingen die HIER STONDEN en niet meer open staan: het logo van DomotiTech is
op 26 augustus 2026 geleverd als `dev/domotitech.png` en zit als data-URI in de
icoonset; en de donkere vlek waar hij sinds 0.10.0 zijn thema van verdacht bleek
onze eigen slagschaduw (valkuil 22).
