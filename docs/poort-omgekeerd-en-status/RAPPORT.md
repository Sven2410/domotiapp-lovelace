# Poort, omgekeerd aangesloten, en een status die weg mag

30 augustus 2026 · release **0.34.0** · branch `fase-39/poort-omgekeerd-en-status`

Vijf dingen in één bericht:

> ikl wil dat je bij de rolluikkaart dat ik kan aanvinken dat het een poort is
> dan wil ik de pijltjes veranderen in OPenen en sluiten. Ook wil ik de
> mogelijkheid om de inputs te inverteren zoals open is dicht en dicht is
> openenen. Dan wil ik een poort icon hebben. en een speelkamer icon. Ook wil ik
> de status van de cover kunnen verbergen

Alle vijf zitten erin.

---

## 1. Een poort in plaats van een rolluik

Een vinkje **"<naam> is een poort"** per rolluik. Staat hij aan, dan verdwijnen
de pijlen omhoog en omlaag en staat er **Openen** en **Sluiten**, met de
stopknop ertussen. De poort krijgt bovendien vanzelf het nieuwe poorticoon.

Waarom woorden en geen andere pijl: een poort schuift of draait **opzij**.
Omhoog en omlaag zeggen daar niets over, in welke richting je ze ook tekent.

Draagt de entiteit `device_class: gate`, dan krijgt hij het poorticoon ook
zonder vinkje. Het vinkje doet dat bewust niet andersom -- een selectievakje dat
aan hoort te staan omdat de entiteit toevallig iets zegt, staat in de editor
leeg terwijl de kaart zich anders gedraagt, en dan lijkt aanvinken niets te
doen.

## 2. Omgekeerd aangesloten

Een vinkje **"<naam> omgekeerd aangesloten"** per rolluik. Voor een motor waar
de draadjes gewisseld zijn: wat Home Assistant open noemt is in het echt dicht.

**De inversie is heel, niet half.** Vier dingen draaien samen om:

| | zonder | met |
|---|---|---|
| de knop Openen roept aan | `open_cover` | `close_cover` |
| toestand `closed` leest als | Dicht | Open |
| toestand `closing` leest als | Gaat dicht | Gaat open |
| positie 20 leest als | 20% open | 80% open |
| de schuif op 80% stuurt | `position: 80` | `position: 20` |

Zou alleen de aflezing omdraaien, dan zou je op Openen drukken en Dicht zien
verschijnen -- dat is geen instelling maar een defect. Zou alleen de knop
omdraaien, dan beweegt het rolluik goed en meldt de kaart het verkeerd.

Meegenomen: het uitgrijzen van een knop volgt nu de dienst die hij werkelijk
aanroept. Een omgekeerde motor die alleen dicht kan, toonde anders een werkende
Openen-knop die niets doet.

## 3 en 4. Twee iconen erbij

`gate` (poort dicht), `gateOpen` (poort open) en `speelkamer`. Alle drie op de
lijndikte 1,6 van de rest van de set, en alle drie te vinden op het woord dat je
zelf zou typen -- "poort", "oprit", "hek", "speelkamer", "kinderkamer",
"speelgoed", "knuffel".

De poort is met opzet géén tweede `fence`: die heeft punten op de staanders, de
poort heeft een kader met een naad in het midden waar de twee vleugels op elkaar
sluiten. De speelkamer werd een beer en geen blokkendoos -- die laatste leest op
19px als de `storage`-dozen die er al stonden.

De eerste `gateOpen` had twee balkjes per vleugel; op 20px waren dat vier
verticale strepen links en vier rechts, en dat werd een hekje. Teruggebracht tot
één sluitbalk per vleugel na het te hebben nagekeken op ware grootte.

## 5. De status verbergen

Een schakelaar **Status tonen** op de kaart. Uit betekent dat Open, Dicht en het
percentage onder de naam wegblijven; alleen de naam staat er dan nog.

**Niet bereikbaar blijft wél altijd staan.** Dat is geen status maar een defect,
en dat stilzwijgend weglaten geeft een kaart die net doet alsof alles in orde
is. Staat zo in de hulptekst van de schakelaar.

---

## Wat er in de editor veranderde

Per gekozen rolluik staan er nu drie velden: de naam (die was er al), en de twee
vinkjes. Elk label draagt de naam van dat rolluik erin -- *"Poort oprit is een
poort"* -- want met drie rolluiken onder elkaar is "Poort" op zichzelf niet te
plaatsen. Typ je een eigen naam, dan volgen de labels meteen mee.

**Ze staan onder elkaar en niet naast elkaar, en dat is gemeten.** Twee
schakelaars naast elkaar in een `row()` leek korter, maar `ha-form` lijnt de
cellen van een raster bovenlangs uit: staat onder de ene een hulptekst van twee
regels en onder de andere een van drie, dan staan de schakelaars **17,8px** uit
elkaar. Gemeten in de echte editor:

```
row():        schakelaar 1 op y=617,5   schakelaar 2 op y=635,3   -> 17,8px scheef
onder elkaar: y=678,3  758,8  839,0  919,3  999,8  -> gaten 80,5 80,2 80,3 80,5
              rechterkant van alle vijf: x=935 (één waarde)
```

---

## De proeven

### De nieuwe test tegen de code van vóór de fix

`src/cards/cover-logica.js` is nieuw: het rekenwerk dat eerst in `paint()` stond
is eruit getrokken, precies omdat dit ronde over RICHTINGEN gaat en dat je niet
met een schermafdruk bewijst. Om te tonen dat de test werkelijk faalt op de oude
code is de oude inline-logica letterlijk overgenomen in een tijdelijk bestand met
dezelfde export-namen, en is de nieuwe test daartegen gedraaid:

```
ℹ tests 31
ℹ pass  18      <- de REGRESSIEWACHTen: zonder poort en zonder inversie
ℹ fail  13      <- het nieuwe gedrag

  ✖ valt terug op de kaart als de regel zwijgt
  ✖ zet er woorden op in plaats van pijlen
  ✖ draait open en dicht om als de motor omgekeerd hangt — NIEUW GEDRAG
  ✖ koppelt elke dienst aan de feature-bit die hij nodig heeft
  ✖ draait open, dicht en allebei de bewegingen om — NIEUW GEDRAG
  ✖ telt hem af van honderd — NIEUW GEDRAG
  ✖ gaat weg als hij verborgen is — NIEUW GEDRAG
  ✖ geeft een poort zijn eigen icoon — NIEUW GEDRAG
  ✖ herkent device_class gate zonder dat er iets aangevinkt is — NIEUW GEDRAG
  ✖ leest de toestand om
  ✖ stuurt de knop Sluiten naar open_cover
  ✖ zet Openen en Sluiten op de knoppen
  ✖ laat de statusregel leeg
```

Op de nieuwe code slagen alle 31. Dat de 18 regressiewachten óók op de oude code
slagen is precies de bedoeling: het bewijst dat een rolluik zonder deze
instellingen zich geen millimeter anders gedraagt dan gisteren.

Volledig: **931 JS-tests groen** (900 + 31), **604 Python-tests groen**.

### Verse code, en dat is gemeten

Service worker en caches gewist, vers tabblad, en toen de bundel opgehaald zoals
de lader hem noemt:

```
npm run build   ->  628.871 bytes   sha256 d9693e5911b31c51f9e8efd6695447ada788507929478009cb63d486e52c89e5
in de browser   ->  628.871 bytes   sha256 d9693e5911b31c51f9e8efd6695447ada788507929478009cb63d486e52c89e5
de lader geeft  ->  ?v=d9693e5911b3
```

Dat is de bundel van 0.34.0. De metingen hieronder zijn gedaan op de bundel met
dezelfde inhoud maar nog het oude versienummer erin
(`a1b0306fd256bdeb71b9e2b78911190f84639e308a57262618fca86ef5003609`); daarna is
alleen `manifest.json` opgehoogd, opnieuw gebouwd, de config entry herladen en
nagekeken dat de poortkaart nog steeds `[Openen stop Sluiten]` tekent.

### Echte kliks, met `isTrusted`

Vier kliks op de kaart in de testinstance (`cover.kitchen_window` als poort,
`cover.living_room_window` als omgekeerde motor), met een capture-luisteraar op
`window` en één abonnement op `call_service`:

| klik | isTrusted | landde op | dienst |
|---|---|---|---|
| "Openen" (poort) | **true** | `BUTTON` data-act=open | `cover.open_cover` op `kitchen_window` |
| "Sluiten" (poort) | **true** | `BUTTON` data-act=close | `cover.close_cover` op `kitchen_window` |
| ↑ (omgekeerd) | **true** | `BUTTON` data-act=open | **`cover.close_cover`** op `living_room_window` |
| ↓ (omgekeerd) | **true** | `BUTTON` data-act=close | **`cover.open_cover`** op `living_room_window` |

En de schuif, echt gesleept van links naar 80% van de baan:

```
gesleept naar 80%  ->  set_cover_position  position: 20
motor uitgelopen   ->  entiteit staat op current_position 20
```

Diezelfde entiteit stond op dat moment op twee kaarten tegelijk:

```
cover.living_room_window  current_position = 20
   omgekeerde kaart:  schuif 80   "80% open"   icoon open
   gewone kaart:      schuif 20   "20% open"   icoon open
```

### De editor, met echte toetsaanslagen

In het naamveld " noord" achter "Poort oprit" getypt:

```
toetsen        : End, " ", n, o, o, r, d
spatie isTrusted: true
config-changed  : 6   (zes aanslagen, zes configs -- niets bevriest)
diepe focus na  : INPUT met waarde "Poort oprit noord"
uit de editor   : covers: [{entity, name: "Poort oprit noord", poort: true}]
```

De labels van de twee vinkjes liepen live mee: *"Poort oprit noord is een
poort"*.

Daarna het vinkje **omgekeerd** aangeklikt (`isTrusted: true`, op `HA-SWITCH`).
Het voorbeeld sloeg meteen om -- `cover.kitchen_window` staat op `closed` en de
kaart zei "Open" met `gateOpen`. En weer uit: knoppen terug naar pijlen,
`keys`-klasse zonder `woorden`, icoon terug naar `shutter`.

Valkuil 33 nagelopen: `Object.keys(config).filter(k => typeof config[k] ===
"object" && !Array.isArray(...))` gaf `[]`. Er nestelt niets.

### Wat de kaarten tekenden

Alle vijf proefkaarten, uitgelezen uit de shadow-DOM op het einde:

```
kaart 0  hoogte 56px
   Poort oprit        closed/gate          status="Dicht"   getekend=true   [Openen stop Sluiten]
kaart 1  hoogte 120px
   Omgekeerd          open/shutterOpen     status="80% open" getekend=true  [open stop close]
kaart 2  hoogte 184px
   Zonder status      closed/shutter       status=""        getekend=false  [open stop close]
   Zonder status 2    open/shutterOpen     status=""        getekend=false  [open stop close]
kaart 3  hoogte 184px
   Gewoon rolluik     closed/shutter       status="Dicht"   getekend=true   [open stop close]
   Met schuif         open/shutterOpen     status="20% open" getekend=true  [open stop close]
kaart 4  hoogte 120px
   Poort met invert   open/gateOpen        status="Open"    getekend=true   [Openen stop Sluiten]
   Garage             closed/garageClosed  status="Dicht"   getekend=true   [open stop(uit) close]
```

56, 120, 184, 184, 120 -- allemaal op de rasterrijen. `stop(uit)` op de garage is
de feature-bit die werkt: die entiteit adverteert geen STOP.

Console: geen enkele fout, alleen de gewone versieregel.

---

## Samenvatting

Vijf verzoeken, vijf keer gedaan: het poortvinkje met Openen/Sluiten, de
inversie (knoppen, toestand, schuif en status samen), een poorticoon in twee
standen, een speelkamericoon, en een schakelaar om de statusregel te verbergen.
Alles per rolluik in te stellen waar het bij het apparaat hoort, en op de kaart
waar het over de kaart gaat.

## Wat niet lukte

- **Het tabblad kwam niet vanzelf naar voren.** `document.visibilityState` bleef
  `hidden`, en dan komt er geen enkele klik aan (valkuil uit CLAUDE.md). Het
  venster naar voren halen met `SetForegroundWindow`, `BringWindowToTop`,
  `ShowWindow` en `^{TAB}` via `WScript.Shell` lukte geen van alle -- ook niet
  nadat het juiste venster gevonden was door de paginatitel tijdelijk op een
  uniek woord te zetten. De eigenaar heeft het tabblad zelf vooraan gezet;
  daarna `visible`, en alle kliks landden.
- **Er is geen `device_class: gate` in de testinstance.** Dat de gate-iconen
  ook zonder vinkje verschijnen bij die device_class is dus alleen in de
  unittest bewezen, niet in de browser.

## Aannames

- **De inversie draait ook de KNOPPEN om, niet alleen de aflezing.** "open is
  dicht en dicht is openen" laat allebei toe. Gekozen voor heel omdraaien, want
  half omdraaien geeft een kaart die zichzelf tegenspreekt (zie boven).
- **"Niet bereikbaar" valt niet onder de verborgen status.** Een defect
  verbergen is iets anders dan een status verbergen.
- **`poort` en `invert` staan per rolluik, `show_state` op de kaart.** De eerste
  twee zijn eigenschappen van het apparaat, de derde is een keuze over hoe de
  kaart eruitziet. Een kaartbrede `poort:` of `invert:` in de YAML werkt
  overigens ook, als terugvalwaarde.

## `git status --porcelain`

Zie het eind van deze ronde; bij het schrijven van dit rapport stond er:

```
?? docs/poort-omgekeerd-en-status/
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/cover-card.js
 M src/editor/icoon-zoek.js
 M src/icons.js
?? src/cards/cover-logica.js
?? tests/js/cover-logica.test.mjs
```
