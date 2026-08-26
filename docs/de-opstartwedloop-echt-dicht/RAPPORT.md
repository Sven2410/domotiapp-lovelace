# De opstartwedloop echt dicht, en de pagina die zichzelf ververst

Uitgave **0.18.0**. Vervolg op 0.17.0, dat dezelfde klacht al zou moeten hebben
opgelost en dat niet deed.

---

## Wat er aan de hand was

De eigenaar meldde op 26 augustus 2026, ná de uitgave van 0.17.0, dat één
Android-telefoon de scenes nog steeds niet laadde: *"De scenes konden niet
geladen worden. Unknown command."* Zijn vermoeden: het ligt aan die telefoon.

Dat vermoeden klopte, maar niet om de reden die voor de hand lag. Eerst is er
op zijn eigen installatie gemeten (alleen gelezen, over de websocket en REST):

| gemeten | uitkomst |
|---|---|
| Home Assistant | 2026.8.3, `RUNNING`, **479 componenten, 179 config entries** |
| Onze config entry | `domotiapp_lovelace`, state `loaded` |
| Bundel die zijn server uitserveert | sha256 `9d59a992…`, 478.453 bytes |
| Diezelfde bundel hier op schijf | sha256 `9d59a992…`, 478.453 bytes — **gelijk** |
| De lader | `?v=9d59a9920158`, `Cache-Control: no-store` |
| De Lovelace-resource | wijst naar diezelfde hash |

**De serverkant was dus in orde en 0.17.0 stond er al.** De telefoon draaide
gewoon oude code. Hij heeft het bevestigd door in de companion-app de
frontendcache te legen: daarna werkte het meteen.

En toen stelde hij de enige juiste vervolgvraag: *"Kunnen we dat niet tackelen
dat we dat niet meer hoeven te doen?"*

---

## Waarom 0.17.0 niet genoeg was

Drie gaten, en ze zijn alle drie gedicht.

### 1. De herkansing gaf definitief op

`WACHTTIJDEN` liep in 0.17.0 tot ruim twee minuten en daarna hield het op.
Niets bracht hem terug. Op een installatie van 479 componenten is twee minuten
geen ruime marge, en de enige weg terug was een herlading van de pagina — die
in de companion-app nooit vanzelf komt.

Het gedragsverschil, gemeten op beide versies met dezelfde nepklok
(`wachttijden: [10, 20]`, zes rondes):

```
oud    | gepland: 2 van 6 rondes | tussenpozen: 10, 20
nieuw  | gepland: 6 van 6 rondes | tussenpozen: 10, 20, 999, 999, 999, 999
```

Nu: de wachttijden waarin de kaart LAADT lopen tot ruim een minuut; daarna
toont de kaart de fout — eerlijk zijn over wat er niet lukt — maar blijft hij
elke minuut doorvragen en vult zichzelf in zodra het antwoord er is.

### 2. Niets reageerde op de herverbinding

Een herstart van Home Assistant verbreekt de websocket en herstelt hem, en
precies in dat gat worden onze commando's opnieuw geregistreerd. Dat signaal
werd niet gebruikt. `Verbindingswacht` doet dat nu: de scene- en de wekkerkaart
vragen opnieuw zodra `hass.connected` van `false` naar `true` gaat. In de
companion-app is dat het énige signaal dat er iets veranderd is.

### 3. De commando's werden als laatste geregistreerd

`websocket.async_register` stond onderaan `async_setup_entry`, ná het lezen van
de bundel, het statische pad, de lader en het wegschrijven van de
Lovelace-resource. Elke `await` daarvóór verlengt het gat waarin een kaart
`Unknown command.` krijgt. Dat is geen twee minuten, maar het was gratis weg te
nemen.

Nu staat `_async_zet_commandos_klaar` vooraan: eerst de migratie en de twee
opslaglagen, dan de drie registraties (scenes, wekker, media), en pas daarna de
frontendketen. De opslag gaat er bewust aan vooraf — een geregistreerd commando
zonder opslag antwoordt `not_allowed` en is geen winst.

**Nieuwe test, en hij faalt op de oude code:**

```
tests/test_init.py::test_commandos_staan_er_voordat_de_frontend_wordt_geregistreerd
```

Tegen `__init__.py` van 0.17.0:

```
E  AssertionError: scenes/get was nog niet geregistreerd toen de frontendketen
   al liep; een kaart die op dat moment vraagt krijgt 'Unknown command.'
E  assert False is True
1 failed in 0.86s
```

Die test meet niet onze eigen vlag maar het commandoregister van
`websocket_api` zelf.

### En erbij: de mediakaarten deden helemaal niet mee

`media/search` en `media/speakers` gingen in dezelfde wedloop meteen op de kale
fout. Zoeken meldt nu *"Home Assistant start nog op"* in plaats van *"Zoeken
lukte niet"*, en probeert het zelf opnieuw; de speakerbalk komt er alsnog
zonder dat het scherm dicht en open hoeft.

---

## De kern: de pagina ververst zichzelf

Dit is het antwoord op zijn vraag, en het is nieuw.

**Waarom `loader.py` dit niet al oploste.** De lader zorgt dat elke
PAGINALADING op de juiste bundel uitkomt: vaste URL, nooit gecachet, de hash
van dit moment in zijn antwoord. Maar in de companion-app gebeurt er geen
paginalading. Die houdt zijn webview dagen in leven; een herstart van Home
Assistant herstelt de websocket en laat de JavaScript staan.

**Wat er nu gebeurt.** De bundel weet met welke hash hij zelf geladen is — die
staat in de `?v=` van `import.meta.url`. De lader weet welke hash er nu geldt.
Verschillen die twee, dan draait deze pagina oude code, en één `location.reload()`
is genoeg.

Gecontroleerd wanneer de pagina zichtbaar WORDT — op een telefoon precies
wanneer je de app opent, vóór je iets aanraakt — en elk half uur, voor een
wandtablet dat nooit uit beeld gaat. Nooit terwijl er een dialoog openstaat.

Twee dingen die hier gevaarlijk zijn, en hoe ze zijn afgedekt:

1. **Een herlaadlus.** `sessionStorage` onthoudt vóór welke serverhash er al een
   keer herladen is; een tweede keer gebeurt niet.
2. **Onze eigen hash niet kennen.** Dan gebeurt er niets. Niet weten is geen
   reden om iemands dashboard te herladen.

---

## De meting in een echte browser

Testinstance `ha-lovelace`, poort 8127, Home Assistant 2026.8.3.

**De verversing is end-to-end aangetoond**, en met een echte `visibilityState`:

| stap | gemeten |
|---|---|
| Pagina geladen | draait bundel `4f30cd0ed712` |
| Bundel gewijzigd en entry herladen | lader geeft nu `dcc63f0fc615` |
| Toestand van de pagina | `verouderd: true` — draait `4f30cd0ed712`, server heeft `dcc63f0fc615` |
| Tabblad werd kortstondig actief | pagina herlaadde zichzelf |
| Daarna | `paginaDraait: dcc63f0fc615`, `serverHeeft: dcc63f0fc615`, `gelijk: true` |

Het bewijs dat ónze code dat deed en niet iets anders:

```
sessionStorage["domotiapp-lovelace-verversing"] === "dcc63f0fc615"
```

Die sleutel stond eerder op `null` en wordt uitsluitend geschreven door
`bewaard()` in `verouderd.js`, vlak vóór `herlaad()`.

Onderweg viel op dat esbuild commentaar wegwerpt: een gewijzigde
commentaarregel gaf een byte-identieke bundel en dus dezelfde hash. De proef is
daarna met een echte inhoudswijziging gedaan.

---

## Wat NIET gelukt is

**De herkansing en de herverbinding zijn niet op een echt dashboard in de
browser nagemeten.** Het tabblad was niet actief te krijgen — de route uit
CLAUDE.md (`SetForegroundWindow` plus `Ctrl+Tab`) stuurde de toetsaanslagen
naar een ánder venster, en daarna bevroor Chrome de renderer van het
achtergrondtabblad (`Runtime.evaluate` liep af na 45s). Na drie pogingen is
daarmee gestopt in plaats van door te blijven trekken.

Wat er wél is: 637 JS-tests, waarvan 19 nieuw voor deze twee onderdelen, plus
de getalsmatige vergelijking oud/nieuw hierboven. Wat er niet is: een meting
van een scenekaart die zich op een dashboard herstelt na
`docker restart ha-lovelace`. Dat is de eerste klus als het tabblad wél vooraan
staat.

---

## Aannames

Eén, en hij is expliciet: dat de Android-telefoon van de eigenaar oude code
draaide is niet rechtstreeks bewezen — er is geen serverkant die vastlegt welke
bundel een client draait. Wat wél gemeten is: zijn server serveerde de nieuwe
bundel, en na het legen van de frontendcache werkte het. Die twee samen laten
geen andere verklaring over, en hij heeft het zelf bevestigd.

---

## Samenvatting

- De herkansing geeft niet meer op, en herstelt zich op de herverbinding.
- De WebSocket-commando's staan er vóór de frontendketen, met een test die op
  de oude code faalt.
- De mediakaarten doen mee in dezelfde wedloop.
- **De pagina ververst zichzelf als hij verouderde code draait** — dat is wat
  het handmatig legen van de frontendcache overbodig maakt.

Eén kanttekening voor de eigenaar: dit werkt vanaf 0.18.0. De telefoon moet die
bundel dus één keer te pakken krijgen — dat gebeurt bij de eerstvolgende
herlading van de pagina, of meteen door de frontendcache nog één keer te legen.
**Daarna is dat niet meer nodig.**

## Tellingen

- 637 JS-tests (was 619), alle groen
- 527 Python-tests (was 526), alle groen
- Bundel 480.465 bytes, sha256 `4f30cd0e…`, versie 0.18.0

## git status --porcelain

```
 M custom_components/domotiapp_lovelace/__init__.py
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/alarm/alarm-card.js
 M src/herkansing.js
 M src/index.js
 M src/media/zoekscherm.js
 M src/scene/scene-card.js
 M tests/js/herkansing.test.mjs
 M tests/test_init.py
?? docs/de-opstartwedloop-echt-dicht/RAPPORT.md
?? src/verouderd.js
?? tests/js/verouderd.test.mjs
```
