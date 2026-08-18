# SPEC — DomotiApp Scene

Bron van waarheid voor alle fasen na fase 2. Wat hier staat is bindend; wijkt
een implementatie ervan af, dan wijzigt eerst dit document.

**Leeswijzer bij de markeringen**

| Markering | Betekenis |
|---|---|
| (geen) | Vastgelegde beslissing, of feit uit HA-broncode / een eerder faserapport. |
| **VOORSTEL** | Door mij ingevuld waar niets vastlag. Mag in een latere fase worden omgestoten zonder dat dit document "fout" was. |

**Er staan geen open vragen meer in dit document.** Alles wat in de eerste
versie als open stond, is inmiddels beslist en in de betreffende sectie
verwerkt.

Verwijzingen naar `INVENTARIS.md` gebruiken de puntletters uit sectie 8 van
dat document. Verwijzingen naar `ONDERZOEK-FRONTEND.md` gebruiken het
vraagnummer. Verwijzingen naar HA-broncode zijn gelezen in de container
`ha-scene` (image `ghcr.io/home-assistant/home-assistant:2026.8`, feitelijke
versie 2026.8.1), pad vanaf `/usr/src/homeassistant/`.

---

## Inhoud

1. [Product en identiteit](#1-product-en-identiteit)
2. [Architectuur in één beeld](#2-architectuur-in-één-beeld)
3. [De kaart in rusttoestand](#3-de-kaart-in-rusttoestand)
4. [De editor](#4-de-editor)
5. [Lampen: herkomst](#5-lampen-herkomst)
6. [Lampeigenschappen: welke besturing bij welke lamp](#6-lampeigenschappen-welke-besturing-bij-welke-lamp)
7. [De toestand "niet ingesteld"](#7-de-toestand-niet-ingesteld)
8. [Toepassen van een scene](#8-toepassen-van-een-scene)
9. [Voorbeeld, snapshot en annuleren](#9-voorbeeld-snapshot-en-annuleren)
10. [Opslag](#10-opslag)
11. [WebSocket-API](#11-websocket-api)
12. [De kaart-config](#12-de-kaart-config)
13. [Randgevallen van de light group](#13-randgevallen-van-de-light-group)
14. [Rechten](#14-rechten)
15. [Opruimoverzicht](#15-opruimoverzicht)
16. [Cache-strategie en de frontend-URL](#16-cache-strategie-en-de-frontend-url)
17. [Frontend-risico's en bouwregels](#17-frontend-risicos-en-bouwregels)
18. [Foutgedrag](#18-foutgedrag)
19. [Wat NIET in v1 zit](#19-wat-niet-in-v1-zit)

---

## 1. Product en identiteit

| | |
|---|---|
| Productnaam | DomotiApp Scene |
| Integratiedomein | `domotiapp_lovelace` |
| Custom element | `domotiapp-scene-card` |
| Lovelace-type in config | `custom:domotiapp-scene-card` |
| Minimum HA-versie | **2026.8** (`hacs.json` → `"homeassistant": "2026.8"`) |
| Taal | Alle zichtbare teksten Nederlands. `translations/en.json` blijft bestaan als fallback voor niet-Nederlandse installaties. |

**Doel.** Een scenekaart die in een bubble pop-up card past, onder de
verlichtingssliders van een kamer. Die plaatsing is een ontwerprandvoorwaarde,
geen toevalligheid: de kaart moet smal en laag blijven en mag geen eigen
scrollgebied of eigen modal-laag introduceren.

### 1.1 Eén bron voor het versienummer

Het versienummer staat **uitsluitend** in
`custom_components/domotiapp_lovelace/manifest.json`, sleutel `version`.

- De build (`scripts/build.mjs`) leest die waarde en injecteert hem als
  `__CARD_VERSION__` in de bundel. In `src/` staat geen versieconstante.
- De integratie leest hem via `async_get_integration(hass, DOMAIN).version`.
- `package.json` heeft bewust **geen** `version`-sleutel.

Dit is de directe correctie op INVENTARIS.md punt **(m)**: daar stonden drie
verschillende nummers (bestandsbanner, `const VERSION`, laatste release) in en
om één bestand.

> **Let op — het versienummer zit vanaf nu níét meer in de `?v=` van de
> frontend-URL.** Zie [sectie 16](#16-cache-strategie-en-de-frontend-url). De
> `version` blijft wel de enige bron voor HACS, voor de tekst op de kaart en
> voor diagnostiek. De regel "één bron" blijft daarmee overeind; de `?v=`
> beantwoordt gewoon een andere vraag ("is de inhoud veranderd?") dan de
> `version` ("welke release is dit?").

---

## 2. Architectuur in één beeld

```
custom_components/domotiapp_lovelace/          de integratie (Python)
├── manifest.json      version = enige bron van het versienummer
├── __init__.py        static path + add_extra_js_url + Store + WS-commando's
├── config_flow.py     lege flow + options flow = het opruimoverzicht (15)
├── const.py
├── store.py           Store-laag, validatie, migratie
├── websocket.py       de commando's uit sectie 11
├── strings.json / translations/{nl,en}.json
└── frontend/
    └── domotiapp-lovelace.js   de gebundelde kaart (meegecommit)

src/                                        de bron van de kaart (lit)
```

De keten die in fase 1 in een echte browser is bewezen
(`ONDERZOEK-FRONTEND.md` vraag 1 t/m 3, plus het faserapport van fase 1):

1. `hass.http.async_register_static_paths([StaticPathConfig(...)])` serveert
   het gebundelde bestand op `/domotiapp_lovelace/domotiapp-lovelace.js`.
2. `frontend.add_extra_js_url(hass, "<pad>?v=<hash>")` zet die URL in
   `hass.data[DATA_EXTRA_MODULE_URL]`.
3. HA rendert daaruit in `index.html` letterlijk
   `<script>import("/domotiapp_lovelace/domotiapp-lovelace.js?v=…");</script>`.
4. De browser voert die import uit vóórdat er een dashboard geladen is, dus
   het custom element is bekend in zowel storage- als YAML-dashboards.

**Er wordt nooit een Lovelace-resource toegevoegd.** Dat is het hele punt van
deze architectuur en is in fase 1 aangetoond: de resourcelijst was leeg vóór
én na installatie.

De opslag loopt **niet** via de kaart naar HA-helpers, maar via WebSocket naar
een eigen `Store` in de integratie. De kaart praat alleen met onze eigen
commando's plus de gewone `light`-services.

---

## 3. De kaart in rusttoestand

Eén rij, van links naar rechts:

```
┌────────────────────────────────────────────┐
│  [ icoon 1 ]  [ icoon 2 ]  [ icoon 3 ]  │  [✏]  │
│                                    scheidingslijn │
└────────────────────────────────────────────┘
```

- **Precies drie scenes.** Hardcoded. Anders dan bij de referentiekaart
  (INVENTARIS.md punt **n**, waar het getal 3 op zeven plaatsen los stond)
  komt het getal uit één constante.
- **Drie scene-knoppen**, elk met het MDI-icoon dat bij die scene is
  opgeslagen. Het icoon is het enige wat een scene visueel onderscheidt; er is
  geen scenenaam. **VOORSTEL** — standaardiconen bij een lege opslag:
  `mdi:numeric-1-circle-outline`, `mdi:numeric-2-circle-outline`,
  `mdi:numeric-3-circle-outline`. Neutraal, en het maakt meteen zichtbaar
  welke knop bij welk tabblad in de editor hoort.
- **Een verticale scheidingslijn** tussen de derde scene-knop en het potlood.
- **Een potloodknop**, icoon hardcoded `mdi:pencil`, opent de editor.
- **Eventueel één regel tekst** onder die rij: de melding uit
  [sectie 3.4](#34-melding-over-nog-niet-ingestelde-lampen), of de melding
  "Deze lichtgroep bevat geen lampen" uit
  [sectie 13.3](#133-de-light-group-wordt-leeggemaakt-nul-leden). Er staat er
  hooguit één; een lege groep heeft immers geen lampen om over te melden.

### 3.1 De knoppen zijn neutraal in v1

De kaart toont **niet** welke scene op dit moment actief is. Alle drie de
knoppen zien er altijd hetzelfde uit.

Dat is een bewust uitstel, geen vergeten functie. De reden hoort hier
vastgelegd te worden omdat hij bij de eerste vraag "waarom licht de actieve
scene niet op?" opnieuw beantwoord moet worden:

1. **Matching met kleur vergt een marge per attribuutsoort.** Een lamp die op
   2700 K staat en een scene die 2700 K voorschrijft, matchen. Maar een lamp
   die na een dimopdracht op 2698 K uitkomt ook — en `brightness` 128 tegen
   127 idem. Elke attribuutsoort (helderheid 0–255, Kelvin, RGB-triplet)
   heeft een eigen zinnige tolerantie, en die tolerantie is bovendien
   merkafhankelijk.
2. **Niet-ingestelde lampen moeten buiten de vergelijking blijven.** Een scene
   die twee van de zes lampen instelt, is "actief" zodra die twee kloppen —
   ongeacht wat de andere vier doen. Dat is te verdedigen, maar het maakt van
   "actief" een gedeeltelijk begrip dat je aan de gebruiker moet uitleggen.
3. Beide punten samen zijn een eigen ontwerpvraagstuk, met eigen
   randgevallen en een eigen testronde. Dat hoort niet in dezelfde fase als
   het opslag- en editorwerk.

Gevolg voor de implementatie: de kaart hoeft in rusttoestand **geen enkele
lampstate te lezen**. Ze rendert drie iconen en een potlood, en abonneert zich
alleen op de opgeslagen scenes. Dat houdt de kaart klein en stil, wat direct
helpt bij [sectie 17](#17-frontend-risicos-en-bouwregels).

### 3.2 Interactie

- Klik op een scene-knop → die scene toepassen ([sectie 8](#8-toepassen-van-een-scene)).
- Klik op het potlood → de editor openen ([sectie 4](#4-de-editor)).
- Er is **geen** long-press, geen dubbelklik, geen swipe.

**Alle klikbare elementen zijn HA's eigen knopcomponenten**
(`ha-icon-button`, `ha-control-button`) — geen zelfgebouwde
touch/click-ontdubbeling. Dit is de correctie op INVENTARIS.md punt **(h)**:
daar stond een handgeschreven venster van 600 ms met `preventDefault()` op
`touchstart`, wat op een trage kiosk een scene twee keer kan afvuren. Dit is
een kioskproduct; dubbel afvuren is een echt risico, geen theoretisch.

### 3.3 Afmetingen

`getCardSize()` geeft `1`. `getGridOptions()` geeft:

```js
{ rows: "auto", columns: "full", min_columns: 6 }
```

INVENTARIS.md punt **(p)** liet zien wat er ontbreekt als je alleen een
constante `getCardSize` levert.

**`rows` is `"auto"` en geen getal, en dat is een gemeten correctie.** Tot fase
10 stond er `rows: 1`. HA's sections-grid geeft een kaart met een **getal** bij
`rows` de klasse `fit-rows`, en die zet een vaste hoogte
(`hui-grid-section.ts`):

```css
.card.fit-rows {
  height: calc((var(--row-size, 1) * (var(--row-height) + var(--row-gap))) - var(--row-gap));
}
```

Met `rows: 1` is dat 56 px. Verschijnt de melding uit
[sectie 3.4](#34-melding-over-nog-niet-ingestelde-lampen), dan wordt de kaart
89 px hoog terwijl zijn vak 56 px blijft: **33 px steekt eruit**, dwars door de
onderrand en over wat eronder staat. Live gemeten in fase 10.

Bij een **string** slaat `computeCardGridSize` de klemming over en blijft
`fit-rows` weg; de hoogte volgt dan de inhoud. `"auto"` is bovendien wat HA
zelf als standaard hanteert voor een kaart die niets opgeeft
(`DEFAULT_GRID_SIZE`).

`min_rows` staat er niet meer: `computeCardGridSize` klemt alleen bij een
getal, dus naast `"auto"` deed hij niets.

`columns: "full"` blijft. De kaart is één rij met drie iconen plus een
potlood; hij hoort de breedte van zijn sectie te vullen. In de grid levert dat
de klasse `full-width` op (`grid-column: 1 / -1`), waardoor de kaart altijd een
eigen rij krijgt.

### 3.4 Melding over nog niet ingestelde lampen

Onder de rij met knoppen staat één regel tekst zodra er lampen zijn die **nog
niet in alle drie de scenes** zijn ingesteld.

- **De voorwaarde is "in alle drie".** Staat een lamp in scene 1 maar niet in 2
  en 3, dan blijft de melding staan. Een lamp uit willen hebben in scene 2 is
  óók een keuze, en die keuze moet iemand een keer maken. Zou de melding al
  verdwijnen bij de eerste scene, dan blijven de andere twee stil onvolledig.
- **Zichtbaar voor iedereen**, ook voor een niet-adminkioskgebruiker. Die mag de
  editor openen ([sectie 14](#14-rechten)) en kan het dus zelf oplossen; een
  melding die alleen de admin ziet zou de klant nergens brengen.
- **Er wordt geen lampstate voor gelezen.** De melding volgt uit de opgeslagen
  scenes en `member_entity_ids`, en die komen allebei al uit
  `domotiapp_lovelace/scenes/get`. [Sectie 3.1](#31-de-knoppen-zijn-neutraal-in-v1)
  blijft dus overeind: de kaart raadpleegt in rusttoestand geen enkele lamp.
- **De melding verdwijnt** zodra elke lamp in alle drie de scenes voorkomt, óf
  zodra de lamp uit de light group wordt gehaald. Dat tweede volgt vanzelf: er
  wordt over `member_entity_ids` geïtereerd, niet over de sleutels in de opslag
  ([sectie 13.5](#135-er-gaat-een-lamp-uit-de-groep)).
- **VOORSTEL** voor de tekst, met het aantal erin:
  - één lamp: `1 lamp nog niet ingesteld`
  - meer: `3 lampen nog niet ingesteld`

  Bewust geen lampnamen en **bewust geen scene**: de kaart is één rij in een
  bubble pop-up en moet kort blijven. Wélke lampen het zijn en in wélke scene ze
  ontbreken staat in de editor, waar het "nieuw"-label per tabblad meekijkt
  ([sectie 4.1](#41-opbouw)).

  > De eerste versie luidde `1 lamp is nog niet in alle scenes ingesteld.` Dat
  > was in fase 4b-1-fix4 te lang voor de plek waar hij staat. De **voorwaarde**
  > is niet veranderd: er wordt nog steeds geteld op "niet in alle drie".

---

## 4. De editor

Openen: klik op het potlood. De editor gebruikt **HA's eigen dialoogsysteem**
(`ha-dialog` / `ha-md-dialog`), niet een zelfgebouwde `div` aan
`document.body`. Dit is de correctie op INVENTARIS.md punt **(l)**: die aanpak
omzeilt Escape, focus-trap, scroll-lock en de correcte stapeling ten opzichte
van andere HA-dialogen. In een bubble pop-up card is die stapeling geen detail.

### 4.1 Opbouw

```
┌─ Scenes bewerken ───────────────────────── [X] ─┐
│  ( Scene 1 )  ( Scene 2 )  ( Scene 3 )          │  ← drie tabbladen
├─────────────────────────────────────────────────┤
│  Icoon:  [ ha-icon-picker            ]          │
├─────────────────────────────────────────────────┤
│  Bureaulamp             [besturing]             │  ← één rij per lamp
│  Plafond                [besturing]             │
│  Leeslamp  [nieuw]      [besturing]             │  ← nog niet ingesteld
├─────────────────────────────────────────────────┤
│            [ Voorbeeld ]  [ Annuleren ] [ Opslaan ] │
└─────────────────────────────────────────────────┘
```

- **Drie tabbladen**, "Scene 1", "Scene 2", "Scene 3". Wisselen van tabblad
  bewaart wat er in het vorige tabblad is ingesteld; er wordt pas naar de
  server geschreven bij Opslaan.
- **Per scene één icoonkiezer**: HA's eigen `ha-icon-picker`. Eén icoon per
  scene, drie in totaal.
- **Per lamp één rij** met een besturing die afhangt van wat die lamp kan
  ([sectie 6](#6-lampeigenschappen-welke-besturing-bij-welke-lamp)). Alle rijen
  zien er hetzelfde uit; er is geen resetknop en geen uitgrijzen
  ([sectie 7.4](#74-hoe-een-lamp-buiten-een-scene-blijft)).
- **Een klein label "nieuw"** naast de naam, bij een lamp die in het **huidige
  tabblad** nog niet is ingesteld. Per tabblad dus, niet per kaart: zo ziet de
  eigenaar bij een servicebezoek meteen wat er in deze scene nog klaarstaat.
  Het label staat op dezelfde regel als de naam en maakt de rij niet hoger.
- **Voorbeeld**, **Annuleren**, **Opslaan** ([sectie 9](#9-voorbeeld-snapshot-en-annuleren)).

### 4.2 Wat de editor bij openen doet

1. `domotiapp_lovelace/scenes/get` aanroepen met het `entity` uit de kaart-config.
2. De lampenlijst afleiden uit het `entity_id`-attribuut van de light group
   ([sectie 5](#5-lampen-herkomst)).
3. Per lamp de opgeslagen waarde opzoeken op **entity-ID**, niet op positie.
4. Nog géén snapshot nemen — dat gebeurt pas bij het eerste Voorbeeld
   ([sectie 9](#9-voorbeeld-snapshot-en-annuleren)).

### 4.3 Reageren op verse `hass`

De editor moet elke `hass`-update verwerken, niet alleen de eerste. Dit
corrigeert INVENTARIS.md punt **(i)** (pickers kregen nooit een verse `hass`)
en punt **(j)** (hertekenen alleen bij een lengteverandering). Met lit is dat
het normale gedrag zolang `hass` een reactieve property is; het is hier
expliciet vastgelegd zodat het ook getest wordt.

### 4.4 De gebruiker ziet procenten, de opslag niet

**Alles wat de gebruiker van helderheid te zien krijgt is een percentage.** Het
label rechts, én de regelaar zelf.

Dat laatste is geen detail. Tot fase 10 stond `ha-control-slider` op HA's
schaal 1–255 terwijl het label een percentage toonde. Die regelaar laat bij het
slepen zijn eigen waarde in een tooltip zien, en die tooltip is niet apart op
te maken: de gebruiker las **"50 %"** in het label en **"127"** in de tooltip —
twee getallen voor hetzelfde, waarvan er één nergens op sloeg. In de
productieomgeving is dat als eerste opgevallen.

- De regelaar staat op **1–100** met `unit="%"`.
- De omrekening zit in `src/lamp-besturing.js` (`alsProcent` en `vanProcent`),
  niet in de editor, en gaat alleen tussen de regelaar en de waarde heen en
  weer.
- **De opslag blijft 0–255** ([sectie 10.4](#104-het-schema)). Er wordt niets
  omgerekend bij lezen of schrijven van de Store, dus een scene die niemand
  aanraakt verschuift ook niet.
- `alsProcent(1)` is **1 %**, niet 0. Een brandende lamp op 0 % is geen stand
  die iets betekent, en de regelaar begint ook op 1.

---

## 5. Lampen: herkomst

### 5.1 Precies één light group per kaart

De lampen komen uit de ledenlijst van **één light group**. Per kamer één light
group en één scenekaart.

Die lijst heeft **twee bronnen**, en dat is geen luxe maar noodzaak.

**Primair: het `entity_id`-attribuut van de state.** `LightGroup` zet in zijn
constructor `self._attr_extra_state_attributes = {ATTR_ENTITY_ID: entity_ids}`
(`components/group/light.py:162`).

**Maar dat attribuut verdwijnt zodra de groep `unavailable` is.** Home
Assistant schrijft de extra state attributes alleen weg voor een beschikbare
entiteit (`helpers/entity.py:1118-1124`):

```python
available = self.available  # only call self.available once per update cycle
state = self._stringify_state(available)
if available:
    if state_attributes := self.state_attributes:
        attr |= state_attributes
    if extra_state_attributes := self.extra_state_attributes:
        attr |= extra_state_attributes
```

`entity_id` is voor een `LightGroup` een *extra* state attribute, dus hij is er
niet meer op het moment dat de groep niet beschikbaar is. Live gemeten op een
lege groep:

```json
{ "state": "unavailable",
  "attributes": ["supported_color_modes", "friendly_name", "supported_features"] }
```

Dat raakt twee gevallen die allebei voorkomen: een groep met **nul leden** is
altijd `unavailable`, en een groep waarvan **alle lampen offline** zijn ook.

> Een eerdere versie van dit document stelde dat het attribuut "altijd
> aanwezig" is, ook bij `unavailable`. Dat was onjuist. De vergissing zat in de
> aanname dat `_attr_available = False` (`group/light.py:149`) alleen de state
> raakt; hij bepaalt via de code hierboven ook of de attributen worden
> geschreven.

**Terugval: de config entry van de groep.** Die heeft het probleem niet —
`options["entities"]` bestaat altijd, ongeacht beschikbaarheid, en het is
dezelfde lijst waaruit de groep zelf zijn leden haalt
(`components/group/light.py:105-107`):

```python
entities = er.async_validate_entity_ids(registry, config_entry.options[CONF_ENTITIES])
```

De integratie valt daarop terug wanneer het state-attribuut ontbreekt. De
config entry wordt gevonden via `registry_entry.config_entry_id`, en herkend
als light group aan `options["group_type"] == "light"`
(`components/group/config_flow.py:163-177`). De lijst mag entity-ID's én
registry-UUID's bevatten; die worden opgelost met
`er.async_resolve_entity_id` (`helpers/entity_registry.py:2715-2725`). Een lid
waarvan de registratie verdwenen is wordt overgeslagen met een `WARNING`, niet
de hele lijst.

Daarmee levert `resolve_light_group` drie onderscheiden uitkomsten die vóór
deze correctie op één hoop lagen:

| Situatie | Uitkomst |
|---|---|
| geen light group (geen groep-config-entry, of een ander `group_type`) | `not_allowed` |
| wel een light group, nul leden | lege lijst, **geen fout** |
| wel een light group, leden bekend | die lijst |

De kaart kan daardoor "leeg" onderscheiden van "geen light group", wat
[sectie 13.3](#133-de-light-group-wordt-leeggemaakt-nul-leden) nodig heeft.

### 5.2 De light group zelf is geen bestuurbare lamp

De kaart stuurt uitsluitend de **leden** aan, nooit de groepsentiteit zelf.
Zou ze de groep meenemen, dan zou het toepassen van een scene zowel de groep
als elk lid aansturen, met een race tussen twee opdrachten voor dezelfde lamp.

De kaart verwijdert daarnaast het entity-ID van de groep uit de ledenlijst
mocht het daarin voorkomen. In de gewone situatie is dat een no-op — een
light group noemt zichzelf niet in zijn eigen `entity_id`-attribuut — maar bij
geneste groepen is het dat niet, en het is goedkoop.

### 5.3 Alleen de light-helper, niet de oude group-integratie

Alleen de **light group helper** (config-entry-variant van de
`group`-integratie, entiteit in het `light`-domein) wordt ondersteund.

De oude YAML-`group:`-integratie valt er in v1 uitdrukkelijk buiten, en dat
volgt uit twee waarneembare eigenschappen, niet uit smaak:

1. Die maakt entiteiten in het **`group`-domein**, niet in `light`:
   `ENTITY_ID_FORMAT = DOMAIN + ".{}"` in `components/group/entity.py:32`,
   gebruikt op regel 218. Een `group.woonkamer` is dus geen `light.*` en valt
   al af op de domeinfilter van de kaart-config.
2. Die entiteiten hebben geen `unique_id` en staan daarmee niet in het entity
   registry — er is dus geen registry-entry-ID om de opslag aan te hangen
   ([sectie 10.2](#102-de-opslagsleutel)).

### 5.4 Namen

De weergegeven naam per lamp is `friendly_name` uit de state.

Een admin kan die per lamp overschrijven in de **Lovelace-kaartconfiguratie**,
sleutel `name_overrides` ([sectie 12](#12-de-kaart-config)).

Vastgelegd, en het is een keuze met gevolgen die het waard zijn om te noemen:

- Overschrijven kan **alleen een admin**, want alleen een admin komt bij de
  kaartconfiguratie. De potlood-editor kent geen naamvelden.
- Overschrijvingen staan **niet in onze Store**. Ze horen bij de kaart, niet
  bij de scenes; twee kaarten op dezelfde light group mogen elk hun eigen
  namen tonen.
- Ze zijn dus **per kaart, niet per scene**, en ze verhuizen niet mee als je
  de kaart naar een ander dashboard kopieert zonder de config mee te nemen.
- Gevolg voor het opslagschema: er komt nooit een naam in
  [sectie 10.4](#104-het-schema). Wie later toch namen per gebruiker wil,
  verandert daarmee het schema en niet alleen de UI.

---

## 6. Lampeigenschappen: welke besturing bij welke lamp

### 6.1 De regel

Bepalend is `supported_color_modes` van de lamp.

| `supported_color_modes` | Besturing in de editor |
|---|---|
| exact `["onoff"]` | Alleen Aan/Uit |
| **alle andere gevallen** | Altijd een helderheidsregelaar, plus extra besturing per aanwezige modus |

Extra besturing per modus:

| Modus in de lijst | Extra besturing |
|---|---|
| `color_temp` | Kleurtemperatuurregelaar in **Kelvin** |
| `hs`, `rgb`, `rgbw`, `rgbww`, `xy` | Kleurkiezer |
| `white` | Geen eigen besturing in v1 ([sectie 19](#19-wat-niet-in-v1-zit)) |

### 6.2 Waarom die regel — dit is in fase 1 waargenomen

De referentiekaart hanteerde dezelfde vorm van de regel
(INVENTARIS.md sectie 3, `_isDimmable`), maar zonder te weten waaróm hij
klopt. Fase 1 heeft dat vastgesteld op vier echte lampen:

| Testlamp | Gemeten `supported_color_modes` |
|---|---|
| `light.test_lamp_aanuit` | `["onoff"]` |
| `light.test_lamp_dim` | `["brightness"]` |
| `light.test_lamp_kleurtemp` | `["color_temp"]` |
| `light.test_lamp_rgb` | `["rgb"]` |

De lampen 3 en 4 melden **geen** `brightness`, en zijn tóch dimbaar: ze
rapporteerden na `turn_on` respectievelijk `brightness: 153` en
`brightness: 204`. De oorzaak staat in `filter_supported_color_modes()`, dat
`onoff` en `brightness` wegstreept zodra er een rijkere modus is
(`components/template/light.py:477-499`).

**Consequentie die vastligt:** je mag `brightness` **niet** in
`supported_color_modes` opzoeken om te bepalen of een lamp dimbaar is. Alleen
de exacte lijst `["onoff"]` betekent niet-dimbaar. Elke andere lijst — ook een
lijst zonder `brightness` — krijgt een helderheidsregelaar.

### 6.3 Kleurtemperatuur in Kelvin, niet in mireds

Er wordt gewerkt met `color_temp_kelvin`, met de grenzen per lamp uit
`min_color_temp_kelvin` en `max_color_temp_kelvin`.

Dat is in 2026.8 niet alleen "de nieuwe manier" maar de enige: een grep op
`mired` in `components/light/` levert nog exact twee treffers op, en dat zijn
allebei **comments** bij `DEFAULT_MIN_KELVIN = 2000` en
`DEFAULT_MAX_KELVIN = 6535` (`components/light/const.py:93-94`). De
mired-attributen bestaan niet meer als constante in
`components/light/__init__.py`; `ATTR_COLOR_TEMP_KELVIN`,
`ATTR_MIN_COLOR_TEMP_KELVIN` en `ATTR_MAX_COLOR_TEMP_KELVIN` wel (regels
141–143).

Ontbreken `min_color_temp_kelvin`/`max_color_temp_kelvin` op een lamp, dan
gebruikt de editor **VOORSTEL** 2000–6535 K als grenzen, gelijk aan HA's eigen
defaults hierboven, en logt dat één keer.

### 6.4 Onbekende of ontbrekende lamp

Staat een entity uit de groep niet in `hass.states`, dan is er geen
`supported_color_modes` om op te beslissen. **VOORSTEL** — de rij wordt dan
getoond als **niet bestuurbaar**, met de melding "lamp niet gevonden", en
krijgt géén besturing. Dat wijkt bewust af van de referentiekaart, die in dat
geval "veilig" een slider toonde (INVENTARIS.md sectie 5): een slider die niet
werkt is misleidender dan geen slider. De opgeslagen waarde voor die lamp
blijft ongemoeid.

### 6.5 Kleur óf wit — nooit allebei

Een lamp die zowel `color_temp` als een kleurmodus meldt (`rgbww` bijvoorbeeld)
kreeg tot fase 10 **beide** regelaars onder elkaar. Dat is fout: een lamp heeft
per moment maar één `color_mode`, en de opslag kent hooguit één kleurattribuut
([sectie 10.4](#104-het-schema)). Twee regelaars naast elkaar nodigen uit tot
een instelling die de lamp niet kan uitvoeren.

**De regel:**

- Bij een lamp die **allebei** kan, staan er naast de aan/uit-schakelaar twee
  keuzeknoppen: **Kleur** en **Wit**. Precies één daarvan is actief.
- Actief "Kleur" toont de kleurkiezer, actief "Wit" toont de
  Kelvin-regelaar. **Nooit allebei.**
- Bij een lamp die maar één van de twee kan, komen de knoppen **niet**. Er valt
  dan niets te kiezen, en een knop zou suggereren dat de lamp iets kan wat hij
  niet kan.
- Bij een lamp die **uit** staat komen ze ook niet: een uit-lamp heeft geen
  kleurattribuut, dus is er niets om tussen te kiezen.
- De keuze is heen en weer te maken. Er gaat geen instelling verloren die de
  gebruiker nog kan zien: wat de regelaar toont ná het wisselen is dezelfde
  waarde die hij zou tonen zonder wissel (`toonKelvin` / `toonHs`).

**Welke stand actief is**, in deze volgorde:

1. **Wat er is opgeslagen.** `color_temp_kelvin` betekent wit; een van de
   kleurattributen betekent kleur. Dit is de enige bron die per definitie klopt
   met wat er bij Opslaan meegaat.
2. **De huidige `color_mode` van de lamp**, als er nog niets is opgeslagen.
   Dezelfde bron waar [sectie 7.3](#73-de-beginwaarde-bij-de-eerste-aanraking)
   de beginwaarde uit haalt.
3. **Wit**, als de lamp geen `color_mode` meldt — hij is uit, `unavailable` of
   `unknown`. **VOORSTEL**, met deze reden: een lamp aanzetten levert in de
   opslag alleen `brightness` op, zonder kleurattribuut. Dat ís wit licht op de
   eigen stand van de lamp. Zou "Kleur" de standaard zijn, dan toonde de editor
   meteen een kleur die de gebruiker nooit heeft gekozen, en zou die kleur bij
   de eerste aanraking van de kleurkiezer ook echt worden opgeslagen.

**Wisselen wist het andere attribuut.** Van Kleur naar Wit verwijdert het
kleurattribuut en zet `color_temp_kelvin`; andersom net zo. Daardoor kunnen er
nooit twee in één waarde staan — ook niet na een reeks wissels heen en weer.

De keuzelogica staat in `src/lamp-besturing.js` (`heeftKleurkeuze`,
`kleurstandVan`, `metKleurstand`, en het `kleurkeuze`/`stand`-veld van
`zichtbareBesturingen`) en niet in de editor, zodat ze zonder DOM toetsbaar is.

---

## 7. De toestand "niet ingesteld"

### 7.1 Definitie

"Niet ingesteld" is een **aparte toestand naast "uit"**.

- Een niet-ingestelde lamp wordt bij het toepassen van de scene **niet
  aangeraakt** — geen `turn_on`, geen `turn_off`.
- Een lamp op "uit" wordt wél aangeraakt: die krijgt `light.turn_off`.

Dit is het verschil dat de referentiekaart structureel niet kon maken: daar
was elke scene een platte array van percentages, waarin 0 "uit" betekende en
"laat met rust" geen representatie had (INVENTARIS.md sectie 3).

### 7.2 Representatie in de opslag

Een lamp die niet in het opgeslagen object voorkomt, **is** niet ingesteld. Er
is geen aparte vlag, geen `"configured": false`, geen null-waarde.

Gevolg: een lamp die nieuw aan de light group wordt toegevoegd begint
automatisch als niet ingesteld, zonder migratie en zonder dat er ergens iets
bijgewerkt hoeft te worden.

### 7.3 In de editor

- Een niet-ingestelde lamp is **niet aan zijn uiterlijk te herkennen**: elke
  lamprij ziet er hetzelfde uit. De eerste aanraking maakt de lamp ingesteld.

  > Hier stond eerder dat zo'n lamp zijn besturing **uitgegrijsd** toont. Dat
  > is in fase 4b-1-fix3 vervallen. Bij vier of vijf lampen werd de dialoog te
  > hoog voor een bubble pop-up, en het grijs verdiende die ruimte niet: het
  > onderscheid tussen "niet ingesteld" en "uit" is een gegeven, geen kleur.
  > Wat ervoor in de plaats komt staat in [sectie 7.4](#74-hoe-een-lamp-buiten-een-scene-blijft):
  > een klein label in de editor en een melding op de kaart.
- **Een niet-ingestelde lamp begint op "uit".** De schakelaar staat uit, wat de
  echte lamp op dat moment ook doet, en er staan dus ook geen regelaars
  ([sectie 10.4](#104-het-schema): een uit-lamp heeft geen helderheid en geen
  kleur).

  > Tot fase 4b-1-fix4 nam de rij de huidige stand van de lamp over, waardoor de
  > schakelaar aan stond als de lamp toevallig brandde. Twee redenen om dat om te
  > draaien: je ziet in één oogopslag welke lampen nog werk nodig hebben, en een
  > klant kan niet per ongeluk een lamp op vol vermogen laten staan doordat hij
  > hem net aan had.
- **Zodra de lamp wordt aangezet, komen helderheid en kleur van de echte lamp**
  zoals die er op dat moment bij staat (zoals nu in `hass.states`), niet van een
  vast getal. Dat maakt "zet de kamer zoals ik hem wil hebben en tik elke lamp
  één keer aan" nog steeds de snelste werkwijze — alleen is het nu twee tikken
  voor een lamp die je aan wilt hebben, en nul voor een lamp die uit mag.
- Staat de lamp op dat moment zelf uit, of is hij `unavailable`, dan is er geen
  huidige stand om over te nemen. De waarde is dan **aan op 100 %, zonder
  kleurattribuut**. Bewust geen kleur: we weten niet welke kleurmodus die lamp
  aankan zolang hij weg is, en een gegokt kleurattribuut zou bij het toepassen
  kunnen falen.
- Aanvaarde consequentie: het resultaat van "aanzetten" hangt af van het moment
  waarop je de editor opent. Dat is de prijs voor de snelle werkwijze hierboven,
  en het is zichtbaar — de gebruiker ziet de waarde die hij krijgt meteen in de
  regelaars staan zodra ze verschijnen.
- **Twee dingen die er hetzelfde uitzien, zijn het niet.** Een lamp die je niet
  hebt aangeraakt staat op uit én is *niet ingesteld*; een lamp die je hebt
  aangezet en weer uitgezet staat op uit én is *ingesteld op `{"state": "off"}`*
  — die gaat bij het toepassen echt uit. Het verschil is zichtbaar aan het
  label "nieuw" ([sectie 4.1](#41-opbouw)), dat alleen bij de eerste staat.
- Een lamp die `unavailable` is, is in de editor **zichtbaar grijs**, maar wel
  instelbaar. Grijs betekent hier "doet nu niet mee", niet "kan niet worden
  ingesteld".

### 7.4 Hoe een lamp buiten een scene blijft

**Er is geen resetknop.** Er is geen weg terug naar "niet ingesteld" via de UI.

> Tot fase 4b-1-fix3 stond hier een resetknop (`mdi:restore`) aan het eind van
> elke lamprij, alleen zichtbaar bij een ingestelde lamp. Die is vervallen.

Wat de klant in plaats daarvan doet: **wil je dat een lamp niet meedoet, dan
zet je hem uit.** De lamp gaat bij het toepassen van die scene dan ook echt
uit. Dat verschil met "niet ingesteld" is bewust geaccepteerd: het is
uitlegbaar in één zin, terwijl "deze lamp doet niet mee, maar die andere gaat
wel uit" dat niet is.

**De toestand "niet ingesteld" blijft wél bestaan in de opslag.** Ze verdwijnt
uit de UI, niet uit het datamodel, en [sectie 7.1](#71-definitie),
[7.2](#72-representatie-in-de-opslag) en [13.4](#134-er-komt-een-lamp-bij-in-de-groep)
blijven onverkort gelden. Dat is geen restant maar de kern van een geval dat in
de praktijk voorkomt: wordt er later een lamp aan de light group van een klant
toegevoegd, dan staat die in geen enkele scene, en zonder deze toestand zou hij
stilletjes uitgaan zodra de klant op een bestaande scene drukt.

Omdat die lamp niet meer aan zijn kleur te herkennen is, wordt hij op twee
plaatsen benoemd:

1. **Een klein label "nieuw"** naast de naam in de editor, bij een lamp die in
   het **huidige tabblad** nog niet is ingesteld
   ([sectie 4.1](#41-opbouw)).
2. **Een melding op de kaart** zolang er lampen zijn die nog niet in **alle
   drie** de scenes staan ([sectie 3.4](#34-melding-over-nog-niet-ingestelde-lampen)).

---

## 8. Toepassen van een scene

### 8.1 Wat er wordt aangeroepen

Per lamp die **ingesteld** is:

| Opgeslagen toestand | Aanroep |
|---|---|
| `"off"` | `light.turn_off` met `transition: 1` |
| `"on"` | `light.turn_on` met `transition: 1`, plus de opgeslagen `brightness` en hooguit één kleurattribuut — voor zover die zijn opgeslagen. Bij een `["onoff"]`-lamp is `light.turn_on` met alleen `transition` de volledige aanroep. |

Per lamp die **niet ingesteld** is: geen aanroep.

Per lamp die `unavailable` of `unknown` is: **geen aanroep**, ook niet als hij
ingesteld is. De lamp wordt overgeslagen. In de editor is hij wel zichtbaar
grijs ([sectie 7.3](#73-in-de-editor)).

### 8.2 Transition

`transition: 1` (seconde) gaat mee bij elke aanroep, ook bij lampen die geen
transition ondersteunen. Dat is veilig: HA verwijdert de parameter zelf voor
zulke lampen —

```python
if LightEntityFeature.TRANSITION not in supported_features:
    params.pop(ATTR_TRANSITION, None)
```

(`components/light/__init__.py:269-270` en `295-296`). Er komt dus geen fout
en er is geen eigen `supported_features`-controle nodig aan onze kant.

### 8.3 Gebundeld of per lamp — en waarom

**Per lamp.** Eén service-aanroep per lamp, alle aanroepen parallel gestart en
samen afgewacht met `Promise.allSettled`. **VOORSTEL** voor de precieze vorm;
de eis om de keuze te verantwoorden ligt vast.

Drie redenen:

1. **Bundelen helpt bijna nooit.** `light.turn_on` is een entity-service: één
   aanroep draagt één set attributen. Twee lampen kunnen alleen samen in één
   aanroep als hun doelstand *identiek* is — zelfde helderheid, zelfde kleur.
   In een scene met per lamp een eigen stand is dat de uitzondering. Het enige
   geval waarin bundelen structureel wint is "alles uit", en dat weegt niet op
   tegen punt 2.
2. **Foutattributie per lamp.** Bij één aanroep per lamp weet je precies welke
   lamp faalde en kun je dat melden. Bij een gebundelde aanroep over vijf
   entiteiten is een fout een fout over het geheel. Voor een kioskproduct waar
   de klant niet bij de logs kan, is per-lampfoutmelding het verschil tussen
   "er ging iets mis" en "de leeslamp reageert niet".
3. **Het visuele argument vervalt door de transition.** De klassieke reden om
   te bundelen is dat lampen anders zichtbaar na elkaar aangaan. Met
   `transition: 1` lopen alle lampen een seconde lang naar hun doelstand; de
   enkele milliseconden spreiding tussen parallel verstuurde WebSocket-berichten
   vallen daarbinnen weg.

Verschil met de referentiekaart: die deed óók één aanroep per lamp, maar
`fire-and-forget` — zonder `await`, zonder returnwaarde, zonder `.catch()`
(INVENTARIS.md sectie 6). Wij wachten wel af en rapporteren wel.

### 8.4 Terugkoppeling

**VOORSTEL** — mislukt een of meer lampen, dan toont de kaart één
HA-toast/`hass-notification` met de namen van de lampen die niet reageerden.
Slaagt alles, dan is er geen melding; de lampen zelf zijn de terugkoppeling.

---

## 9. Voorbeeld, snapshot en annuleren

### 9.1 Het gedrag dat vastligt

- De **Voorbeeld**-knop zet de lampen daadwerkelijk om, met de waarden zoals
  ze nu in de editor staan (nog niet opgeslagen).
- **Vóór het eerste voorbeeld** wordt een snapshot van de huidige lampstand
  genomen.
- **Annuleren herstelt die snapshot.** Dat geldt voor **elke** manier van
  sluiten behalve Opslaan: de X, wegklikken naast de popup, en Escape.
- **Bij Opslaan** blijft de laatst getoonde stand staan; er wordt niet
  hersteld.
- Is er nooit op Voorbeeld gedrukt, dan is er niets omgezet en valt er niets
  te herstellen.

### 9.2 De route: `scene.create` met `snapshot_entities`

**Dit is uit de broncode vast te stellen, en het antwoord is dat het kan en
netjes op te ruimen is.** `components/homeassistant/scene.py`, 2026.8.1:

**Aanmaken.** `create_service` (regel 243-267) accepteert `snapshot_entities`
en zet per entiteit de volledige huidige `State` in de scene:

```python
for entity_id in snapshot:
    if (state := hass.states.get(entity_id)) is None:
        _LOGGER.warning(
            "Entity %s does not exist and therefore cannot be snapshotted", entity_id
        )
        continue
    entities[entity_id] = State(entity_id, state.state, state.attributes)
```

Dat neemt **alle** attributen mee, ook de attributen die wij niet modelleren
(effecten, `rgbww`, `white`). Dat is precies het voordeel van deze route boven
zelf attributen onthouden.

**Opruimen.** De scene wordt aangemaakt met `from_service=True` (regel 268) en
`scene.delete` verwijdert hem weer (regel 274-303). Die service weigert
expliciet alles wat niet dynamisch is aangemaakt:

```python
if not scene.from_service:
    raise ServiceValidationError(
        translation_domain=SCENE_DOMAIN,
        translation_key="entity_not_dynamically_created", ...
    )
```

We kunnen dus nooit per ongeluk een echte scene van de klant wissen.

**Geen registryvervuiling.** De dynamische scene wordt gebouwd als
`SceneConfig(None, scene_id, None, entities)` (regel 261), dus `unique_id` is
`None` (`HomeAssistantScene.unique_id`, regel 354-358). Zonder `unique_id`
komt de entiteit niet in het entity registry: hij bestaat alleen in de state
machine en is na een herstart van HA weg.

**Herstellen met transition.** `scene.turn_on` accepteert `transition`
(`components/scene/__init__.py:76-79`), dus het terugzetten kan met dezelfde
seconde als het toepassen.

**Rechten.** `scene.create` en `scene.delete` zijn geregistreerd met
`hass.services.async_register` (regel 270-271 en 300-303), **niet** met
`async_register_admin_service` — dat laatste gebeurt alleen voor
`scene.reload` (regel 213).

> **Wie roept ze aan (fase 4b-2).** Niet de kaart, maar de **integratie**. De
> kaart vraagt het aan met twee WebSocket-commando's
> ([11.5](#115-domotiapp_lovelacesnapshotcreate) en
> [11.6](#116-domotiapp_lovelacesnapshotclose)) en stuurt daarbij alleen een
> entity-ID mee.
>
> Drie redenen, en de eerste is de aanleiding:
>
> 1. **[Sectie 10.2](#102-de-opslagsleutel) blijft volledig overeind.** De naam
>    van de snapshot bevat het registry-entry-ID
>    ([sectie 9.4](#94-naamgeving-van-de-tijdelijke-scene)), en de kaart mag dat
>    niet kennen — ook niet als deelstring in een naam die hij doorgeeft. Door
>    de naam server-side samen te stellen komt hij daar nooit.
> 2. **De rechten liggen bij de integratie.** Voor een product dat bij klanten
>    draait is dat robuuster dan leunen op het feit dat `scene.create`
>    toevallig geen admin-service is; verandert HA dat ooit, dan raakt het ons
>    niet.
> 3. `scene.create` **meldt stil niets** als hij niets doet (zie 11.5). Die
>    controle hoort thuis waar hij te doen is: server-side.
>
> Dat de twee services geen admin-service zijn blijft dus waar en blijft de
> moeite van het vastleggen waard — het is nu alleen geen voorwaarde meer, maar
> een vangnet. De commando's zelf zijn wél voor iedere ingelogde gebruiker
> ([sectie 14](#14-rechten)); de klant drukt immers zelf op Voorbeeld.

### 9.3 Levensduur van de tijdelijke scene

**VOORSTEL** voor de precieze afspraken:

| Moment | Actie |
|---|---|
| Editor opent | Niets. |
| Eerste keer Voorbeeld | De kaart roept `snapshot/create` aan; de integratie doet `scene.create` met `snapshot_entities` = alle lampen van de groep, `scene_id` volgens 9.4. |
| Volgende keren Voorbeeld | De kaart vraagt niets meer; het beheer weet dat er al een snapshot is. Vraagt hij het tóch, dan antwoordt `snapshot/create` met `created: false` en gebeurt er niets. |
| Annuleren, X, Escape, wegklikken | `snapshot/close` met `restore: true`: `scene.turn_on` op de snapshot met `transition: 1`, daarna `scene.delete`. |
| Opslaan | `snapshot/close` met `restore: false`. Alleen `scene.delete`, niet herstellen. |
| Kaart wordt losgekoppeld (`disconnectedCallback`) terwijl een snapshot bestaat | Behandelen als Annuleren. |

**De snapshot omvat alle leden van de groep, ook de niet-ingestelde.** Anders
zou een lamp die tijdens het bewerken alsnog wordt ingesteld bij het herstellen
buiten beeld vallen: hij is dan wél omgezet door het voorbeeld, maar staat niet
in de scene die hem terug moet zetten.

Wordt het browsertabblad hardhandig gesloten of valt de kiosk uit terwijl er
een snapshot openstaat, dan komt geen van die rijen aan de beurt en blijft er
een `scene.*`-entiteit achter. Die doet niets, maar hij is wel zichtbaar in
entiteitenlijsten en in de zoekfunctie. Dat wordt opgeruimd door 9.3.1.

#### 9.3.1 Opruimen van achtergebleven snapshots

**De integratie ruimt achtergebleven snapshot-scenes op bij setup.** Eén lus,
één keer, aan het einde van `async_setup_entry`. Geen periodieke taak, geen
timer, geen listener.

Herkennen gebeurt op **onze eigen naamprefix**:

```python
PREFIX = "scene.domotiapp_lovelace_snapshot_"
verweesd = [
    state.entity_id
    for state in hass.states.async_all("scene")
    if state.entity_id.startswith(PREFIX)
]
```

Drie eigenschappen maken dat dit veilig is, en ze volgen alle drie uit
[sectie 9.2](#92-de-route-scenecreate-met-snapshot_entities):

1. **De prefix is van ons.** `scene_id` is een `cv.slug` die wij zelf
   samenstellen ([sectie 9.4](#94-naamgeving-van-de-tijdelijke-scene)); een
   scene van de klant heet nooit zo, tenzij iemand hem bewust zo noemt.
2. **`scene.delete` weigert alles wat niet dynamisch is aangemaakt.** Zou een
   klant tóch een YAML-scene met die naam hebben, dan krijgen we een
   `ServiceValidationError` in plaats van dat we zijn scene wissen. De prefix
   is dus de eerste zeef, niet de enige.
3. **Een dynamische scene overleeft een herstart niet** — hij heeft geen
   `unique_id` en staat niet in het entity registry. Bij een verse start is de
   lijst dus per definitie leeg, en de lus is een no-op. Hij doet alleen werk
   in het geval dat ertoe doet: een **reload van de config entry** terwijl HA
   doordraait, precies de handeling die na elke rebuild nodig is
   ([sectie 16.3](#163-de-werkwijze-die-daaruit-volgt)).

**Als `scene.delete` faalt.** Opruimen is een nette handeling, geen
voorwaarde om te kunnen draaien. Daarom:

- elke `scene.delete` staat in zijn eigen `try`, zodat één mislukking de
  andere niet overslaat;
- een mislukking levert **`WARNING`** op met de entity-ID en de fout, meer
  niet: geen repair issue, geen melding aan de gebruiker;
- **`async_setup_entry` faalt nooit op deze lus.** Een achtergebleven
  scene-entiteit is cosmetisch; de integratie niet laten starten omdat je
  hem niet kon wissen zou het middel erger maken dan de kwaal;
- de lus draait ná de registratie van het statische pad en de frontend-URL, om
  te voorkomen dat een traagheid hier het laden van de kaart ophoudt.

Restrisico dat daarmee overblijft en dat expliciet wordt geaccepteerd: valt de
kiosk uit en wordt de integratie daarna niet herladen, dan staat de verweesde
scene er tot de volgende herstart of reload. Dat is zichtbaar en onschadelijk.

### 9.4 Naamgeving van de tijdelijke scene

**VOORSTEL** — `scene_id` = `domotiapp_lovelace_snapshot_<registry_entry_id>`.
`cv.slug` staat letters, cijfers en `_` toe, en een registry-entry-ID is een
hex-achtige string, dus dat valideert.

**Die naam wordt server-side samengesteld** en gaat nooit over de lijn: de kaart
stuurt alleen een entity-ID mee (11.5 en 11.6). Zo blijft
[sectie 10.2](#102-de-opslagsleutel) ongewijzigd gelden. De bijbehorende entity-ID begint dan met
`scene.domotiapp_lovelace_snapshot_`, en dat is de prefix waarop
[sectie 9.3.1](#931-opruimen-van-achtergebleven-snapshots) opruimt.

Eén snapshot per light group. Twee tegelijk geopende editors voor dezelfde
kamer delen dus één snapshot: `create_service` verwijdert een bestaande eigen
scene met dezelfde naam en maakt hem opnieuw (regel 263-267), dus de laatst
geopende editor overschrijft de snapshot van de eerste.

**Dat wordt geaccepteerd.** Geen lock, geen waarschuwing, geen detectie. Het
gaat om één huishouden; twee mensen die op hetzelfde moment dezelfde kamer
bewerken is geen realistisch scenario, en elke voorziening ertegen kost een
mechanisme dat in het normale geval alleen maar in de weg zit. De consequentie
staat als bekende beperking in [sectie 19](#19-wat-niet-in-v1-zit).

### 9.5 Het alternatief, voor het geval 9.2 sneuvelt

Zelf een snapshot bijhouden in de kaart: bij het eerste Voorbeeld per lamp de
relevante attributen uit `hass.states` kopiëren en bij Annuleren terugzetten
met `light.turn_on`/`light.turn_off`.

- Voordeel: geen entiteit in de state machine, geen opruimprobleem.
- Nadeel: herstelt alleen wat wij modelleren. Stond er een effect aan, of een
  `rgbww`-waarde, dan is die na Annuleren weg. Dat is precies het soort stille
  verlies dat dit document elders probeert uit te bannen.

> **Nagelopen in fase 4b-2 en nog steeds geldig.** Route 9.2 is intussen
> gebouwd en werkt, dus dit blijft een reserveplan. Eén ding is wel verschoven:
> zou 9.2 alsnog sneuvelen, dan vervallen daarmee ook de twee commando's uit
> 11.5 en 11.6, en verhuist het bijhouden van de snapshot naar de kaart. De
> afweging zelf verandert daar niet door — het nadeel hierboven is nog steeds
> het doorslaggevende punt.

---

## 10. Opslag

### 10.1 Waar

Een eigen `homeassistant.helpers.storage.Store` in de integratie. Geen
`input_text`-helper, geen enkele tekenlimiet, en de opslag gaat mee in HA's
backups omdat hij in `.storage/` staat.

Daarmee vervallen INVENTARIS.md punten **(a)** en **(b)** volledig: er is geen
255-tekensgrens meer, dus ook geen stille datavernietiging bij ~12 lampen en
geen afhankelijkheid van een `max`-instelling die de gebruiker zelf goed moet
zetten.

**VOORSTEL** — één Store voor alle light groups samen, sleutel
`domotiapp_lovelace.scenes`. De data is klein (enkele kB bij tientallen kamers) en
`Store` schrijft gedebounced weg; per groep een eigen bestand levert alleen
meer bestandshandles op.

> Eén gevolg hiervan is niet vrijblijvend: omdat alle kamers in één bestand
> zitten, is een schrijfverbod op bestandsniveau automatisch een schrijfverbod
> op álle kamers. Daar hangt de regel in
> [sectie 18.2.1](#1821-waarom-regel-5-zo-luidt-en-niet-helemaal-niet-schrijven)
> aan vast. Wie deze VOORSTEL ooit omdraait naar één bestand per groep, moet
> die sectie opnieuw langs — de regel zelf blijft dan goed, maar de
> onderbouwing vervalt.

### 10.2 De opslagsleutel

Per light group is de sleutel het **registry-entry-ID**:
`entity_registry.async_get(hass).async_get(<entity_id>).id`
(`helpers/entity_registry.py:234`).

Waarom niet het entity-ID: dat verandert bij hernoemen. Zou de opslag daaraan
hangen, dan zouden na een hernoeming alle scenes van die kamer stil verdwenen
zijn — en "stil verdwijnen" is exact het faalgedrag dat dit product niet mag
hebben.

De vertaling **entity-ID → registry-entry-ID gebeurt server-side**, in de
integratie. De kaart kent alleen entity-ID's en heeft van registry-entry-ID's
geen weet. Redenen: het entity registry is server-side gezag, en de kaart
hoeft geen tweede identiteitsbegrip te dragen.

> **Deze regel is in fase 4b-2 op de proef gesteld en ongewijzigd gebleven.**
> De snapshot heeft een naam nodig die het registry-entry-ID bevat
> ([sectie 9.4](#94-naamgeving-van-de-tijdelijke-scene)). In plaats van die
> naam — of het ID — naar de kaart te sturen, beheert de integratie de snapshot
> zelf ([sectie 9.2](#92-de-route-scenecreate-met-snapshot_entities)). De kaart
> stuurt alleen een entity-ID mee, precies zoals bij alle andere commando's.
> Dat de regel intact kon blijven was de doorslaggevende reden voor die keuze.

Naast de scenes wordt het **laatst bekende entity-ID** opgeslagen als leesbaar
label. Dat label is uitsluitend voor het opruimoverzicht
([sectie 15](#15-opruimoverzicht)); er wordt **nooit** op teruggezocht, want
een entity-ID kan later door een andere entiteit hergebruikt worden en dan zou
je scenes aan de verkeerde kamer koppelen.

Het label wordt bijgewerkt bij elke succesvolle `scenes/get` en `scenes/save`.

### 10.3 Per lamp op entity-ID, niet op positie

De lampwaarden in een scene staan in een object met het **entity-ID als
sleutel**. Niet in een array op positie.

INVENTARIS.md punt **(e)** laat zien wat positionele koppeling aanricht: één
lamp uit het midden verwijderen schuift alles op en geeft elke volgende lamp
stilzwijgend de waarde van zijn buurman. Bij ons is het risico groter, want de
lampenlijst komt uit een light group en die volgorde staat buiten onze
controle — de admin kan hem in de helper wijzigen zonder ons dashboard aan te
raken.

### 10.4 Het schema

```
data
└── groups                              object, sleutel = registry-entry-ID
    └── <registry_entry_id>
        ├── last_known_entity_id        string, alleen label
        └── scenes                       array van precies 3 objecten
            └── [i]
                ├── icon                 string, MDI-naam
                └── lights               object, sleutel = entity-ID van de lamp
                    └── <entity_id>
                        ├── state        "on" | "off"
                        ├── brightness   int 1..255      (alleen bij state "on")
                        ├── color_temp_kelvin  int       (optioneel, sluit kleur uit)
                        ├── rgb_color    [int,int,int]   (optioneel, sluit temp uit)
                        ├── hs_color     [float,float]   (optioneel)
                        └── xy_color     [float,float]   (optioneel)
```

Regels bij het schema:

- **`lights` bevat alleen ingestelde lampen.** Afwezig = niet ingesteld
  ([sectie 7.2](#72-representatie-in-de-opslag)).
- **`state: "off"` heeft geen andere sleutels.** Helderheid of kleur bij een
  uit-lamp is betekenisloos en wordt bij het lezen als schemafout behandeld.
- **Hooguit één kleurattribuut per lamp.** `color_temp_kelvin`, `rgb_color`,
  `hs_color` en `xy_color` sluiten elkaar uit — HA kent per moment ook maar één
  `color_mode`. Meer dan één aanwezig = schemafout.

  **Ook de UI kan er nooit twee maken** (sinds fase 10). Dat was al zo in het
  datamodel — `metKleur` en `metKleurtemp` wissen allebei eerst de andere drie
  sleutels — maar de editor bood tot dan wél beide regelaars aan, zodat een
  gebruiker een kleur kon zetten die daarna stilletjes verdween zodra hij de
  kelvinregelaar aanraakte. Met de keuze uit
  [sectie 6.5](#65-kleur-óf-wit--nooit-allebei) is er nog maar één regelaar
  tegelijk zichtbaar, en wisselen wist het attribuut van de andere stand.
  Vastgelegd met een test die elke reeks van vier handelingen op één lamprij
  doorloopt — 1296 paden — en na elke reeks eist dat er hooguit één
  kleurattribuut in staat.
- **`brightness` staat op HA's eigen schaal 0–255** — **VOORSTEL**. Reden: dat
  is wat het `brightness`-state-attribuut rapporteert en wat `light.turn_on`
  accepteert. Opslaan in procenten zou bij elke lees/schrijfronde een
  conversie met afronding toevoegen, waardoor een scene die je niet aanraakt
  toch kan verschuiven. De editor mag procenten *tonen*; de opslag doet dat
  niet. Wat de gebruiker ziet is overal een percentage — zie
  [sectie 4.4](#44-de-gebruiker-ziet-procenten-de-opslag-niet).
- **De toegestane waarden zijn 1–255, niet 0.** Nul zou "uit" betekenen en dat
  is al `state: "off"`; twee manieren om hetzelfde te zeggen is precies het
  soort dubbelzinnigheid dat later stille fouten oplevert.
- **`brightness` is optioneel.** Een `["onoff"]`-lamp kent geen helderheid, dus
  bij zo'n lamp hoort het veld er niet te staan
  ([sectie 6.1](#61-de-regel)).
- **`icon` is verplicht** in elk van de drie scene-objecten. Een lege string is
  ongeldig.
- **Altijd precies drie scene-objecten**, ook als er nooit iets is ingesteld.
  Een scene zonder ingestelde lampen is `{"icon": "...", "lights": {}}`.

### 10.5 Letterlijk voorbeeld

Zoals `Store` het naar `.storage/domotiapp_lovelace.scenes` schrijft. De buitenste
sleutels `version`, `minor_version`, `key` en `data` komen van `Store` zelf
(`helpers/storage.py:466-470`), alles binnen `data` is van ons.

Het voorbeeld toont één light group met drie lampen, in scene 1:

- `light.plafond_slaapkamer` — een aan/uit-lamp, ingesteld op aan
- `light.bedlamp_links` — een lamp met kleurtemperatuur, ingesteld op 40 %
  bij 2700 K
- `light.leeslamp` — **niet ingesteld**: hij komt in `lights` simpelweg niet voor

Scene 2 zet dezelfde kamer uit; scene 3 is nog helemaal leeg.

```json
{
  "version": 1,
  "minor_version": 1,
  "key": "domotiapp_lovelace.scenes",
  "data": {
    "groups": {
      "a1b2c3d4e5f60718293a4b5c6d7e8f90": {
        "last_known_entity_id": "light.lampen_slaapkamer",
        "scenes": [
          {
            "icon": "mdi:weather-sunset",
            "lights": {
              "light.plafond_slaapkamer": {
                "state": "on"
              },
              "light.bedlamp_links": {
                "state": "on",
                "brightness": 102,
                "color_temp_kelvin": 2700
              }
            }
          },
          {
            "icon": "mdi:weather-night",
            "lights": {
              "light.plafond_slaapkamer": {
                "state": "off"
              },
              "light.bedlamp_links": {
                "state": "off"
              }
            }
          },
          {
            "icon": "mdi:numeric-3-circle-outline",
            "lights": {}
          }
        ]
      }
    }
  }
}
```

Merk op dat `light.plafond_slaapkamer` in scene 1 **geen** `brightness` heeft.
Dat is geen weglating maar de correcte vastlegging van een `["onoff"]`-lamp:
die kent geen helderheid, dus er valt niets te bewaren
([sectie 6.1](#61-de-regel)).

En merk op dat `light.leeslamp` nergens voorkomt. Er is geen `null`, geen
`"configured": false` en geen lege waarde — afwezigheid *is* de toestand.

### 10.6 Schemaversie en migratie

- `Store(hass, version=1, minor_version=1, key="domotiapp_lovelace.scenes")`.
- **`minor_version` omhoog** bij een wijziging die oude data zonder aanpassing
  kan lezen (een nieuw optioneel veld). **`version` omhoog** bij een wijziging
  die dat niet kan (een veld hernoemd, een eenheid veranderd).
- Migreren gebeurt in een subklasse van `Store` met
  `_async_migrate_func(old_major_version, old_minor_version, old_data)`. HA
  kiest die driearguments-vorm zelf op basis van de signatuur
  (`helpers/storage.py:449-455`) en schrijft direct na een geslaagde migratie
  weg (regel 460).
- **Een oudere codeversie leest nooit nieuwere data.** Staat er een hogere
  `version` in het bestand dan de code aankan, dan gooit HA zelf
  `UnsupportedStorageVersionError` (`helpers/storage.py:437-440`). Dat is het
  gewenste gedrag: liever falen dan een nieuw formaat half interpreteren.
- Migraties zijn **puur en zonder verlies**: kan een migratie een veld niet
  omzetten, dan faalt ze in plaats van het veld weg te laten.

Op dit moment bestaat er nog geen enkele oudere versie, dus
`_async_migrate_func` hoeft in v1 alleen te bestaan en `NotImplementedError` te
gooien voor onbekende versies.

---

## 11. WebSocket-API

Alle commando's zijn `async` en geregistreerd met
`websocket_api.async_register_command`. Naamgeving `domotiapp_lovelace/<zelfst>/<werkw>`.

Foutcodes komen uit `components/websocket_api/const.py`:
`invalid_format`, `not_found`, `not_allowed`, `unauthorized`,
`home_assistant_error`, `unknown_error`.

### 11.1 `domotiapp_lovelace/scenes/get`

Haalt de drie scenes van één light group op.

**Wie:** iedere ingelogde gebruiker.

**Invoer**

| Veld | Type | Verplicht | Betekenis |
|---|---|---|---|
| `type` | `"domotiapp_lovelace/scenes/get"` | ja | |
| `entity_id` | string | ja | entity-ID van de light group |

**Uitvoer**

```json
{
  "scenes": [ { "icon": "mdi:…", "lights": { … } }, { … }, { … } ],
  "member_entity_ids": ["light.plafond_slaapkamer", "light.bedlamp_links", "light.leeslamp"],
  "stored": true
}
```

- `scenes` — altijd precies drie objecten. Is er nog niets opgeslagen, dan
  drie lege scenes met de standaardiconen uit
  [sectie 3](#3-de-kaart-in-rusttoestand), en `stored: false`.
- `member_entity_ids` — het `entity_id`-attribuut van de groep, met de
  groepsentiteit er al uitgefilterd ([sectie 5.2](#52-de-light-group-zelf-is-geen-bestuurbare-lamp)).
  Server-side geleverd zodat kaart en server het over dezelfde lijst hebben.
- `stored` — `false` betekent "deze kamer heeft nog nooit opgeslagen".

**Fouten**

| Code | Wanneer |
|---|---|
| `invalid_format` | `entity_id` ontbreekt of zit niet in het `light`-domein |
| `not_found` | entiteit bestaat niet, of staat niet in het entity registry (zie [sectie 5.3](#53-alleen-de-light-helper-niet-de-oude-group-integratie)) |
| `not_allowed` | de entiteit heeft geen `entity_id`-attribuut, dus is geen light group |
| `home_assistant_error` | de opgeslagen data van deze groep is niet valide ([sectie 18.2](#182-onleesbare-of-ongeldige-opslag)) |

### 11.2 `domotiapp_lovelace/scenes/save`

Slaat alle drie de scenes van één light group in één keer op.

**Wie:** iedere ingelogde gebruiker. Zie [sectie 14](#14-rechten).

**Invoer**

| Veld | Type | Verplicht | Betekenis |
|---|---|---|---|
| `type` | `"domotiapp_lovelace/scenes/save"` | ja | |
| `entity_id` | string | ja | entity-ID van de light group |
| `scenes` | array van 3 objecten | ja | volledige inhoud, geen delta |

Alle drie de scenes gaan altijd mee. Reden: de editor heeft één Opslaan-knop
voor drie tabbladen, dus dat is ook de eenheid van de transactie. Een
gedeeltelijke opslag zou een halve staat kunnen achterlaten.

**Uitvoer:** `{"stored": true}`.

**Validatie vóór schrijven** — bij één fout wordt er **niets** geschreven:

- exact 3 scene-objecten;
- elk met een niet-lege `icon` en een `lights`-object;
- elke sleutel in `lights` is een geldig entity-ID in het `light`-domein;
- elke waarde voldoet aan [sectie 10.4](#104-het-schema), inclusief de regel
  "hooguit één kleurattribuut" en "geen extra sleutels bij `state: off`";
- `brightness`, indien aanwezig, is een geheel getal 1–255.

**Fouten**

| Code | Wanneer |
|---|---|
| `invalid_format` | een van de validatieregels hierboven faalt |
| `not_found` | zoals bij `scenes/get` |
| `not_allowed` | zoals bij `scenes/get` |
| `home_assistant_error` | schrijven naar de Store mislukt |

**VOORSTEL** — lampen die in `lights` staan maar niet (meer) lid van de groep
zijn, worden **niet** geweigerd en **niet** stil verwijderd: ze worden
geschreven zoals ze binnenkomen. Reden: een lamp kan tijdelijk uit de groep
zijn gehaald, en stil weggooien is precies het gedrag dat dit document
bestrijdt. Ze doen niet mee bij het toepassen, want de kaart itereert over de
groepsleden.

### 11.3 `domotiapp_lovelace/storage/list`

Het opruimoverzicht: alle opgeslagen groepen, met of ze nog bestaan.

**Wie:** **alleen admin** (`@websocket_api.require_admin`, zie
`components/websocket_api/decorators.py:54-65`).

**Invoer:** alleen `type`.

**Uitvoer**

```json
{
  "groups": [
    {
      "registry_entry_id": "a1b2c3d4e5f60718293a4b5c6d7e8f90",
      "last_known_entity_id": "light.lampen_slaapkamer",
      "current_entity_id": "light.lampen_slaapkamer",
      "exists": true,
      "configured_light_count": [2, 2, 0],
      "corrupt": false
    },
    {
      "registry_entry_id": "0f1e2d3c4b5a69788796a5b4c3d2e1f0",
      "last_known_entity_id": "light.lampen_zolder",
      "current_entity_id": null,
      "exists": false,
      "configured_light_count": null,
      "corrupt": true
    }
  ]
}
```

- `current_entity_id` — het entity-ID dat nú bij dat registry-entry-ID hoort,
  of `null` als de entiteit niet meer bestaat. Hiermee is een hernoeming
  zichtbaar als verschil met `last_known_entity_id`.
- `exists` — of het registry-entry-ID nog een entiteit heeft.
- `configured_light_count` — per scene het aantal ingestelde lampen, zodat een
  admin ziet of hij iets weggooit wat leeg is of iets waar werk in zit.
  **`null` bij een onleesbare groep**, zie hieronder.
- `corrupt` — of de opgeslagen data van deze groep onleesbaar is
  ([sectie 18.2](#182-onleesbare-of-ongeldige-opslag), geval B).

**Fouten:** `unauthorized` voor een niet-admin.

#### 11.3.1 Onleesbare groepen staan in de lijst

Een groep waarvan de opgeslagen data niet valideert **staat wél in dit
overzicht**. Dat moet ook, want
[sectie 18.2.3](#1823-hoe-je-uit-die-toestand-komt) maakt het opruimoverzicht
de enige uitweg uit die toestand: een admin verwijdert de opslag van die light
group, en daarna kan de klant de kamer opnieuw instellen. Zou de lijst
onleesbare groepen weglaten, dan was de enige kamer die opgeruimd moet worden
juist de enige die je niet ziet.

Twee gevolgen voor de payload:

1. **`configured_light_count` is `null`.** Het aantal ingestelde lampen per
   scene is niet te bepalen zonder de data te interpreteren, en interpreteren
   is precies wat we bij onleesbare data niet doen
   ([sectie 18.2.2](#1822-wat-dat-betekent-voor-de-store-laag) punt 4).
2. **Er is een expliciete `corrupt`-vlag**, geen impliciet signaal.

Dat tweede punt is een bewuste keuze en verdient de onderbouwing, want
`configured_light_count: null` zou op zichzelf al genoeg zijn geweest om de
toestand af te leiden. Precies daarom niet: een `null` die stiekem "onleesbaar"
betekent is verborgen codering, en dat is wat dit document elders consequent
vermijdt. Vergelijk het met
[sectie 7.2](#72-representatie-in-de-opslag), waar afwezigheid wél een
betekenis draagt — maar daar is dat de uitdrukkelijk beredeneerde kern van het
ontwerp, geen bijvangst van een veld dat toevallig niet in te vullen was.

De vlag is bovendien wat de options flow uit
[sectie 15.2](#152-de-stappen) nodig heeft om een regel als "bestaat niet meer"
of "onleesbaar" te labelen zonder zelf uit `null` te moeten afleiden wat er aan
de hand is.

### 11.4 `domotiapp_lovelace/storage/delete`

Verwijdert de opslag van één groep.

**Wie:** **alleen admin**.

**Invoer**

| Veld | Type | Verplicht |
|---|---|---|
| `type` | `"domotiapp_lovelace/storage/delete"` | ja |
| `registry_entry_id` | string | ja |

Bewust op registry-entry-ID en niet op entity-ID: je moet juist opslag kunnen
wissen van groepen die niet meer bestaan.

**Uitvoer:** `{"deleted": true}`.

**Fouten**

| Code | Wanneer |
|---|---|
| `not_found` | dat registry-entry-ID komt niet in de opslag voor |
| `unauthorized` | niet-admin |
| `home_assistant_error` | schrijven mislukt |

### 11.5 `domotiapp_lovelace/snapshot/create`

Maakt de tijdelijke snapshot-scene van één light group, of laat een bestaande
met rust ([sectie 9.3](#93-levensduur-van-de-tijdelijke-scene)).

**Wie:** iedere ingelogde gebruiker. Zie [sectie 14](#14-rechten): de klant
drukt zelf op Voorbeeld.

**Invoer**

| Veld | Type | Verplicht | Betekenis |
|---|---|---|---|
| `type` | `"domotiapp_lovelace/snapshot/create"` | ja | |
| `entity_id` | string | ja | entity-ID van de light group |

De kaart stuurt **alleen** een entity-ID mee. De naam van de scene wordt
server-side samengesteld uit het registry-entry-ID
([sectie 9.4](#94-naamgeving-van-de-tijdelijke-scene)) en verlaat de server
nooit; daarmee blijft [sectie 10.2](#102-de-opslagsleutel) volledig overeind.

**Uitvoer**

```json
{ "created": true }
```

- `created` — `false` betekent "er was al een snapshot". Een tweede Voorbeeld
  maakt er dus geen tweede aan.

**Fouten**

| Code | Wanneer |
|---|---|
| `invalid_format` | `entity_id` ontbreekt of zit niet in het `light`-domein |
| `not_found` | entiteit bestaat niet, of staat niet in het entity registry |
| `not_allowed` | de entiteit is geen light group, of de integratie is niet geladen ([sectie 11.9](#119-gedrag-nadat-de-integratie-verwijderd-is)) |
| `home_assistant_error` | de snapshot kon niet worden aangemaakt |

Dat laatste geval verdient een toelichting, want `scene.create` **meldt zelf
niets**: hij logt een `WARNING` en doet niets als de scene leeg zou worden
("Empty scenes are not allowed") of als er al een niet-dynamische scene met die
naam bestaat. Er komt geen exception. De integratie controleert daarom ná het
aanroepen of de entiteit er werkelijk is, en maakt er anders een fout van.
Stil doorgaan zou een voorbeeld zonder weg terug opleveren, en dat is precies
wat [sectie 18.1](#181-nooit-stil-terugvallen-op-een-default) verbiedt.

Een lege light group levert daarmee `home_assistant_error` op. Dat is geen
praktisch geval — de kaart biedt daar geen editor aan
([sectie 13.3](#133-de-light-group-wordt-leeggemaakt-nul-leden)) — maar het is
wel het eerlijke antwoord.

### 11.6 `domotiapp_lovelace/snapshot/close`

Herstelt de snapshot en/of verwijdert hem
([sectie 9.1](#91-het-gedrag-dat-vastligt) en
[9.3](#93-levensduur-van-de-tijdelijke-scene)).

**Wie:** iedere ingelogde gebruiker.

**Invoer**

| Veld | Type | Verplicht | Betekenis |
|---|---|---|---|
| `type` | `"domotiapp_lovelace/snapshot/close"` | ja | |
| `entity_id` | string | ja | entity-ID van de light group |
| `restore` | boolean | ja | `true` bij Annuleren, de X, Escape en wegklikken; `false` bij Opslaan |

**Uitvoer**

```json
{ "restored": true, "deleted": true }
```

- Bij `restore: true` volgt eerst `scene.turn_on` met `transition: 1`, daarna
  `scene.delete`.
- Bij `restore: false` alleen `scene.delete`.
- Is er **geen** snapshot, dan gebeurt er niets en is het antwoord
  `{"restored": false, "deleted": false}`. Dat is het geval "er is nooit op
  Voorbeeld gedrukt", en tegelijk de reden dat dit commando **idempotent** is:
  een tweede sluiting herstelt niet nog een keer.

**Fouten:** dezelfde vier als bij `snapshot/create`, waarbij
`home_assistant_error` staat voor "herstellen of verwijderen mislukte".

#### 11.6.1 Waarom twee commando's en niet drie

Sluiten eindigt altijd in `scene.delete`; herstellen is daar een schakelaar op.
Een apart `restore`-commando zou de aanroeper laten kiezen om wél te herstellen
en niet te verwijderen, en die combinatie bestaat niet in
[sectie 9.3](#93-levensduur-van-de-tijdelijke-scene).

Belangrijker: door het samen te voegen kan de **server** de garantie geven dat
er hoogstens één keer hersteld wordt. Bestaat de scene niet meer, dan is het
antwoord gewoon `{"restored": false, "deleted": false}`. Dat is precies wat de
editor nodig heeft, want `ha-dialog` kan het sluiten twee keer melden — het
`closed`-event én de eigen knop.

### 11.7 Wat er bewust géén commando is

> Deze lijst was tot fase 4b-2 uitputtend bedoeld. Dat is ze niet gebleven: er
> zijn twee commando's bij gekomen voor de snapshot
> ([11.5](#115-domotiapp_lovelacesnapshotcreate) en
> [11.6](#116-domotiapp_lovelacesnapshotclose)). De reden staat in
> [sectie 9.2](#92-de-route-scenecreate-met-snapshot_entities): de integratie
> beheert de snapshot, zodat de kaart nooit een registry-entry-ID hoeft te
> kennen. De twee punten hieronder gelden onverkort.

- **Geen `apply`-commando.** Een scene toepassen doet de kaart met de gewone
  `light`-services. Dat scheelt een rondgang, houdt de rechten bij HA's eigen
  entity-permissies, en maakt het gedrag zichtbaar in de logbook zoals de
  klant het gewend is.
- **Geen subscribe/push.** De kaart haalt de scenes op bij het openen van de
  editor en na een geslaagde opslag. Twee mensen die tegelijk dezelfde kamer
  bewerken is geen scenario dat v1 hoeft te dekken
  ([sectie 19](#19-wat-niet-in-v1-zit)).
- **Geen `snapshot/status`-commando.** De kaart weet zelf of hij op Voorbeeld
  heeft gedrukt; dat is de enige vraag die ertoe doet. Zou hij het toch aan de
  server vragen, dan zou hij een antwoord krijgen dat een fractie later alweer
  verouderd kan zijn.
- **Geen commando voor de tweede laadroute.** Het registreren van de
  Lovelace-resource uit [sectie 16.5](#165-de-tweede-laadroute) gebeurt
  volledig **server-side**, bij setup van de config entry. De kaart weet er
  niets van en hoeft er niets voor te doen; er komt dus geen commando bij en
  het aantal blijft zes. De collectie die HA daarvoor aanbiedt
  (`hass.data[LOVELACE_DATA].resources`) is een gewone Python-API — een eigen
  WebSocket-laag ertussen zou alleen een tweede plek zijn waar het mis kan
  gaan, en zou de kaart iets laten regelen wat de klant nooit ziet.

### 11.8 De twee admin-commando's hebben in v1 geen frontend-aanroeper

Dat hoort er expliciet bij te staan, anders leest sectie 11.3 en 11.4 als
functionaliteit die er niet is.

Het opruimoverzicht is een **options flow** ([sectie 15](#15-opruimoverzicht)),
en die draait server-side in Python. Zo'n flow praat niet over WebSocket met
zichzelf; hij roept de opslaglaag rechtstreeks aan. In v1 is er dus geen
frontend die `storage/list` of `storage/delete` aanroept.

Waarom ze er toch staan:

1. **Ze definiëren de twee operaties één keer.** De options flow voert exact
   deze twee uit — dezelfde lijst, dezelfde verwijdering op registry-entry-ID.
   Ze staan hier beschreven met hun invoer, uitvoer en foutgevallen, zodat er
   één plek is waar dat gedrag vastligt.
2. **Er is één implementatie.** Zowel de WebSocket-handler als de options flow
   roept dezelfde functie in de opslaglaag aan. Er is geen tweede pad dat kan
   gaan afwijken.
3. **Ze kosten bijna niets** en houden de deur open voor een echt paneel als de
   options flow uit [sectie 15.1](#151-vorm-een-options-flow) in de praktijk
   te onhandig blijkt.

Blijkt dat laatste in fase 3 of later niet te gebeuren, dan is het schrappen
van de twee commando's een prima opruimactie — mits de opslaglaag zijn twee
functies houdt.

### 11.9 Gedrag nadat de integratie verwijderd is

**Alle commando's geven `not_allowed` met de melding "DomotiApp Scene is niet
geladen" zodra er geen config entry meer geladen is.** Dat gold vanaf fase 3b
voor de vier commando's uit 11.1 tot en met 11.4, en sinds fase 4b-2 ook voor
de twee snapshot-commando's.

Dat is geen theoretisch geval. HA kent geen `async_unregister_command`: de
commando's worden per HA-run één keer geregistreerd en blijven daarna bestaan,
ook nadat de integratie is verwijderd. Een klant die de kaart op een dashboard
had staan en de integratie deïnstalleert, heeft die kaart in zijn geopende
browsertabblad nog gewoon draaien — en die blijft commando's sturen.

In fase 3b is gemeten wat er zonder guard gebeurde, en het antwoord was
verrassend: **niet een crash, maar succes.** Alle vier de commando's werkten
door, en `scenes/save` gaf `{"stored": true}`. Een achtergebleven kaart schreef
dus naar de opslag van een integratie die er niet meer was. Geen exception,
geen traceback, geen enkel spoor — precies het stille gedrag dat
[sectie 18](#18-foutgedrag) bestrijdt.

Dat ondermijnt bovendien de belofte uit
[sectie 15.4](#154-de-integratie-verwijderen-laat-de-opslag-staan): de opslag
blijft staan zodat herinstalleren alles terugbrengt. Als een stale kaart na het
verwijderen nog doorschrijft, is wat je terugkrijgt niet meer wat er op het
moment van verwijderen stond.

**De guard.** De opslaglaag wordt bij het uitladen van de laatste config entry
uit `hass.data` gehaald. De commando's controleren op zijn aanwezigheid en
weigeren netjes als hij er niet is. Wat níét verdwijnt, omdat het niet ongedaan
te maken is: de registratie van het statische pad en die van de commando's
zelf.

**Waarom `not_allowed`.** De foutcodes komen uit HA's eigen lijst (zie de
inleiding van [sectie 11](#11-websocket-api)), en `not_allowed` is daarin de
code voor "deze handeling kan nu niet". Die code draagt daarmee twee
betekenissen: hij komt ook voor bij `scenes/get` en `scenes/save` wanneer de
entiteit geen light group is ([sectie 11.1](#111-domotiapp_lovelacescenesget)).
Het bericht maakt het onderscheid, en geen enkele aanroeper hoeft de twee uit
elkaar te houden: in beide gevallen kan de kaart niets anders doen dan de fout
tonen. Een eigen code buiten HA's lijst zou dat onderscheid wél maken, maar
tegen de prijs van een afwijking van de regel dat de codes uit
`websocket_api/const.py` komen.

**Een reload is geen verwijdering.** `async_reload` is uitladen gevolgd door
opzetten; daarbij wordt de opslaglaag losgelaten en direct opnieuw van schijf
ingelezen. Tussen die twee momenten in kan een commando de weigering krijgen.
Dat is een venster van milliseconden en de kaart hoeft er niets bijzonders mee:
opnieuw proberen werkt.

---

## 12. De kaart-config

### 12.1 Sleutels

```yaml
type: custom:domotiapp-scene-card
entity: light.lampen_slaapkamer
name_overrides:
  light.bedlamp_links: Bed links
  light.leeslamp: Leeslamp Anne
```

| Sleutel | Type | Verplicht | Betekenis |
|---|---|---|---|
| `type` | string | ja | `custom:domotiapp-scene-card` |
| `entity` | string | **ja** | entity-ID van de light group |
| `name_overrides` | object | nee | entity-ID → weergavenaam. Ontbreekt een lamp, dan geldt zijn `friendly_name`. |

Meer is er niet. `setConfig` weigert een config zonder `entity` met een
duidelijke fout.

### 12.1.1 `getStubConfig` is verplicht

De kaart levert een `static getStubConfig(hass)` die de eerste light group
teruggeeft die hij vindt.

Dat is geen extraatje maar een gevolg van de regel hierboven. De kaartkiezer
van Lovelace bouwt bij het toevoegen een startconfig en geeft die meteen aan
`setConfig`. Zonder `getStubConfig` is dat `{type: …}` zonder `entity`, weigert
`setConfig` die terecht, en is de kaart **via de UI niet toe te voegen** — alleen
nog met de hand in YAML.

Vindt de stub geen enkele light group, dan geeft hij een lege `entity` terug en
weigert `setConfig` alsnog. Dat is dan ook het juiste antwoord: zonder light
group valt er niets te configureren.

**VOORSTEL** voor onbekende sleutels: **niet weigeren, wel melden.** Een
typefout in een YAML-dashboard hoort zichtbaar te zijn, maar hard weigeren kan
niet: Lovelace hangt zelf lay-outsleutels aan een kaartconfig (in een
sections-dashboard bijvoorbeeld `grid_options`, daarnaast `visibility` en
`view_layout`), en die kent onze kaart niet. `setConfig` accepteert daarom
alles, en schrijft één `console.warn` voor sleutels die noch van ons noch van
HA's lay-outset zijn.

### 12.2 Wat de config-editor toont

De editor die opent via het Lovelace-configuratiescherm (`getConfigElement`),
gebouwd met `ha-form` op een schema — niet met handgeschreven `innerHTML`.
Dat sluit INVENTARIS.md punt **(f)** structureel af: er is geen enkele plek
meer waar een door de gebruiker getypte naam in een HTML-string belandt.

1. **Een entiteitkiezer** voor `entity`, beperkt tot het `light`-domein.
   **VOORSTEL** — de lijst wordt daarnaast gefilterd op entiteiten die een
   `entity_id`-attribuut hebben, zodat alleen light *groups* overblijven en de
   admin niet per ongeluk een losse lamp kiest.
2. **Per lid van de gekozen groep één tekstveld** voor de naam, met de
   `friendly_name` als **label** en het entity-ID als helper-tekst. Leeg laten =
   geen override; er komt dan ook geen sleutel in `name_overrides`.

   > Hier stond eerder "met de `friendly_name` als placeholder". Dat kan niet:
   > `ha-form` in 2026.8 kent `computeLabel` en `computeHelper`, maar **geen**
   > `computePlaceholder` — nagegaan met een grep over de meegeleverde frontend
   > — en `TextSelectorConfig` heeft aan de Python-kant ook geen `placeholder`.
   >
   > Het verschil is in de praktijk klein: bij een **leeg** veld staat het label
   > binnen het kader en is het visueel niet van een placeholder te
   > onderscheiden; zodra de gebruiker typt schuift het omhoog tot een zwevend
   > label. Het entity-ID in de helper-tekst is er bewust bij gezet, zodat twee
   > lampen met dezelfde `friendly_name` uit elkaar te houden zijn.

De editor luistert op elke `hass`-update, niet alleen de eerste
(INVENTARIS.md punt **i**), en hertekent bij elke configwijziging, niet alleen
bij een lengteverandering (punt **j**).

---

## 13. Randgevallen van de light group

De rode draad: **de opslag hangt aan het registry-entry-ID en gaat nergens
vanzelf verloren.** Wat er stukgaat is hooguit de verwijzing vanuit de
kaart-config, en dat is zichtbaar en herstelbaar.

### 13.1 De light group wordt hernoemd (entity-ID verandert)

| | |
|---|---|
| Registry-entry-ID | ongewijzigd |
| Opslag | **volledig intact**, inclusief alle drie de scenes |
| Kaart-config | wijst nog naar het oude entity-ID en klopt dus niet meer |
| Wat de kaart toont | Een foutkaart: "Lichtgroep `light.oude_naam` bestaat niet (meer). Pas de kaart aan." Geen scene-knoppen, geen potlood. |
| Wat de admin doet | In de kaart-config het nieuwe entity-ID kiezen. |
| Daarna | Alles is terug. Het registry-entry-ID is hetzelfde, dus de kaart vindt exact dezelfde scenes. |

Dit is precies het scenario waarvoor
[sectie 10.2](#102-de-opslagsleutel) bestaat. Was de sleutel het entity-ID
geweest, dan waren de scenes hier stil verdwenen.

Er wordt **niet** automatisch teruggezocht op `last_known_entity_id`. Een
entity-ID kan door een andere entiteit hergebruikt worden; terugzoeken zou de
scenes van de slaapkamer aan de badkamer kunnen hangen.

> Alleen de *naam* (`friendly_name`) wijzigen zonder het entity-ID te wijzigen
> heeft géén enkel gevolg — de kaart en de opslag kijken niet naar de naam.

### 13.2 De light group wordt verwijderd

| | |
|---|---|
| Registry-entry-ID | bestaat niet meer |
| Opslag | **blijft staan**, als verweesd item |
| Kaart-config | wijst naar een niet-bestaande entiteit |
| Wat de kaart toont | Dezelfde foutkaart als bij 13.1. |
| Opruimen | Handmatig, via het opruimoverzicht ([sectie 15](#15-opruimoverzicht)). Nooit automatisch. |

Wordt de helper opnieuw aangemaakt met dezelfde naam, dan krijgt hij een
**nieuw** registry-entry-ID en dus lege scenes; het oude item blijft als wees
in de lijst staan. Dat hoort in de klantdocumentatie, want het is onverwacht
gedrag als je het niet weet.

### 13.3 De light group wordt leeggemaakt (nul leden)

| | |
|---|---|
| Registry-entry-ID | ongewijzigd |
| Opslag | ongewijzigd — er wordt niets opgeruimd |
| State van de groep | **`unavailable`** — een groep zonder leden is nooit beschikbaar |
| `entity_id`-attribuut | **afwezig**, niet leeg (zie [sectie 5.1](#51-precies-één-light-group-per-kaart)) |
| Ledenlijst | uit de config entry: een lege lijst |
| `scenes/get` | slaagt, met `member_entity_ids: []` |
| Wat de kaart toont | De drie scene-knoppen en het potlood, maar **uitgeschakeld**, met de tekst "Deze lichtgroep bevat geen lampen." |
| Wat de editor toont | Dezelfde melding, geen lamprijen. Opslaan is uitgeschakeld; anders zou opslaan van een lege editor de bestaande scenes wissen. |

Dat laatste is het punt waar het misgaat als je het niet expliciet regelt:
zonder die blokkade zou "groep even leeghalen, kaart openen, opslaan" alle
scenes van die kamer wissen zonder dat iemand daarom vroeg.

> De regel "het attribuut is een lege lijst" stond hier eerder, en klopte niet.
> Een lege groep is `unavailable` en heeft daardoor helemaal geen extra state
> attributes. Zonder de terugval uit sectie 5.1 zou dit geval niet van "geen
> light group" te onderscheiden zijn, en toonde de kaart de foutkaart in plaats
> van de uitgeschakelde knoppen.

### 13.4 Er komt een lamp bij in de groep

Geen migratie. De nieuwe lamp komt in `member_entity_ids` en is in alle drie de
scenes **niet ingesteld**, want hij staat in geen enkel `lights`-object
([sectie 7.2](#72-representatie-in-de-opslag)). Hij wordt dus door bestaande
scenes niet aangeraakt tot iemand hem instelt.

> Hier stond "geen migratie, **geen melding**". Het eerste geldt onverkort; het
> tweede is in fase 4b-1-fix3 achterhaald. De kaart meldt sindsdien wél dat er
> lampen zijn die nog niet in alle drie de scenes staan
> ([sectie 3.4](#34-melding-over-nog-niet-ingestelde-lampen)) — juist voor dit
> geval, zodat een lamp die er later bij komt niet ongemerkt in geen enkele
> scene blijft hangen. Aan de opslag verandert er niets: er wordt nog steeds
> niets bijgewerkt en niets gemigreerd.

### 13.5 Er gaat een lamp uit de groep

De lamp verdwijnt uit `member_entity_ids` en wordt niet meer getoond of
aangestuurd. Zijn opgeslagen waarden **blijven in de opslag staan**
([sectie 11.2](#112-domotiapp_lovelacescenessave), laatste alinea), zodat ze
terugkomen als de lamp weer lid wordt.

### 13.6 De light group is `unavailable`

Alle leden offline → de groep zelf is `unavailable`, en daarmee verdwijnt het
`entity_id`-attribuut uit de state
([sectie 5.1](#51-precies-één-light-group-per-kaart)). De ledenlijst komt dan
uit de config entry van de groep, dus **de kaart en de editor werken gewoon**:
de drie scene-knoppen staan er, het potlood werkt, en de editor toont alle
lampen.

Elke lamp is in de editor grijs en wordt bij het toepassen overgeslagen
([sectie 8.1](#81-wat-er-wordt-aangeroepen)). Een klik op een scene levert in
dit geval dus **nul service-aanroepen** op — er gebeurt zichtbaar niets, en dat
is correct.

> Ook hier stond eerder dat het attribuut aanwezig blijft. Dat was onjuist, en
> zonder de terugval gaf dit geval `not_allowed`: een kamer waarvan toevallig
> alle lampen offline waren, was daardoor niet te bewerken.

---

## 14. Rechten

| Handeling | Wie |
|---|---|
| Kaart zien, scene toepassen | iedere ingelogde gebruiker |
| Editor openen, Voorbeeld, Opslaan | **iedere ingelogde gebruiker** |
| `domotiapp_lovelace/scenes/get` en `/save` | iedere ingelogde gebruiker |
| Opruimoverzicht bekijken en items verwijderen | **alleen admin** |
| `domotiapp_lovelace/storage/list` en `/delete` | **alleen admin** |
| Kaart aan een dashboard toevoegen of configureren | admin (dat regelt HA zelf) |

Waarom opslaan uitdrukkelijk niet admin-only is: klanten draaien Fully Kiosk
met een niet-admin account, en juist zij moeten hun scenes kunnen aanpassen.
Een implementatie die `require_admin` op `scenes/save` zet, breekt het
product voor de doelgroep.

Dat dit ook voor de snapshot-route werkt is nagegaan in de broncode:
`scene.create` en `scene.delete` zijn niet als admin-service geregistreerd,
alleen `scene.reload` is dat ([sectie 9.2](#92-de-route-scenecreate-met-snapshot_entities)).

Buiten scope voor v1: HA's eigen per-gebruiker entity-policies. Heeft een
gebruiker geen rechten op een lamp, dan faalt de `light`-service voor die lamp
en verschijnt hij in de foutmelding van
[sectie 8.4](#84-terugkoppeling). Wij bouwen daar geen eigen laag overheen.

---

## 15. Opruimoverzicht

### 15.1 Vorm: een options flow

Het opruimoverzicht wordt een **options flow** op de config entry: Instellingen
→ Apparaten & diensten → DomotiApp Scene → **Configureren**. **Admin-only**;
HA laat het knopje voor een niet-admin niet zien.

Een options flow is een formulier en geen lijst met verwijderknoppen, dus dit
is niet de mooiste vorm die denkbaar is. Het is wel de vorm die binnen HA's
eigen mechanismen valt, die meteen op de goede plek zit en die geen eigen
paneel, eigen route of eigen frontend-code kost. De enige gebruiker is de
admin, en die doet dit een paar keer per jaar. Dat weegt zwaarder dan de
elegantie.

### 15.2 De stappen

**Stap `init` — de keuzelijst**

- Toont één `select` met alle opgeslagen groepen, gevuld uit dezelfde data als
  `domotiapp_lovelace/storage/list` ([sectie 11.3](#113-domotiapp_lovelacestoragelist)).
- **VOORSTEL** voor het label per regel:
  - bestaat de entiteit nog: `Slaapkamer (light.lampen_slaapkamer) — 2/2/0 lampen`
  - bestaat hij niet meer: `light.oude_naam — bestaat niet meer — 3/1/0 lampen`
  De drie getallen zijn `configured_light_count`, per scene. Zo ziet de admin
  vóór het kiezen of hij iets weggooit wat leeg is of iets waar werk in zit.
- De waarde achter elk item is het **registry-entry-ID**, niet het entity-ID.
  Zo werkt de flow ook voor groepen die niet meer bestaan.
- **Is er niets opgeslagen**, dan toont deze stap geen keuzelijst maar een
  afsluitend bericht ("Er is nog niets opgeslagen om op te ruimen") en eindigt
  de flow. Een leeg `select` is geen scherm dat je een gebruiker voorzet.
- Er is bewust **geen meervoudige selectie**. Verwijderen moet per kamer een
  bewuste handeling zijn; een lijst met vinkjes nodigt uit tot het per ongeluk
  meenemen van een buur.

**Stap `confirm` — de bevestiging**

- Toont welke groep is gekozen, in dezelfde bewoording als in de lijst, plus
  het aantal ingestelde lampen per scene.
- Bevat één verplicht vinkje: **"Ja, verwijder de scenes van deze lichtgroep"**.
  Zonder dat vinkje geeft de stap dezelfde vorm opnieuw met een foutmelding —
  dat is het HA-patroon voor "je moet dit echt bevestigen".
- Vermeldt dat dit niet ongedaan te maken is en dat de data alleen nog uit een
  backup terug te halen is.
- Bij bevestiging: dezelfde handeling als
  `domotiapp_lovelace/storage/delete` ([sectie 11.4](#114-domotiapp_lovelacestoragedelete)),
  en daarna `async_create_entry(title="", data={})` om de flow te sluiten.

**Annuleren**

- Sluit de gebruiker de dialoog op stap `init` of stap `confirm` — met de X,
  met Escape, of door weg te klikken — dan gebeurt er **niets**. Er is geen
  tussenstaat: de verwijdering vindt pas plaats bij het verzenden van stap
  `confirm` met het vinkje aan.
- Terug van `confirm` naar `init` is niet nodig; opnieuw beginnen is één klik
  op Configureren.

**Meerdere kamers achter elkaar**

Elke doorloop verwijdert er één. Wie er drie wil opruimen, opent de flow drie
keer. **VOORSTEL** — dat is bewust; zie de opmerking over meervoudige selectie
hierboven.

### 15.3 Nooit automatisch

**Er is geen automatische opruiming.** Niet bij het opstarten, niet na een
tijdsduur, en niet bij het verwijderen van de config entry. Reden: een kaart
die tijdelijk van een dashboard is gehaald — bij een verbouwing, bij het testen
van een nieuwe indeling — moet zijn scenes houden. Automatisch opruimen zou van
"kaart even weghalen" een onomkeerbare handeling maken.

Verwijderen is daarmee altijd een bewuste handeling van een admin.

### 15.4 De integratie verwijderen laat de opslag staan

Wordt de **integratie zelf** via de UI verwijderd, dan blijft
`.storage/domotiapp_lovelace.scenes` ongemoeid staan. `async_remove_entry` wist
niets.

Dat is dezelfde regel als hierboven, doorgetrokken naar de grootste knop die er
is: opruimen gebeurt nooit als bijwerking. Wie de integratie verwijdert en
opnieuw installeert, krijgt al zijn scenes terug — mits de light groups
dezelfde registry-entry-ID's hebben, en die overleven een herinstallatie van
*onze* integratie gewoon, want ze horen bij de light group helper en niet bij
ons.

Het gaat wél in tegen wat HA-gebruikers gewend zijn: normaal ruimt een
integratie zijn eigen opslag op bij verwijderen. **Daarom hoort dit expliciet
in de klantdocumentatie**, samen met de manier om het alsnog kwijt te raken:
eerst de kamers opruimen via [sectie 15.2](#152-de-stappen), dán de integratie
verwijderen. Anders staat er een bestand in `.storage/` waarvan niemand meer
weet waar het vandaan komt.

---

## 16. Cache-strategie en de frontend-URL

### 16.1 Het probleem dat dit oplost

Nu staat er `?v=0.1.0` op de URL, en HA serveert het bestand met
`cache_headers=True` — in fase 1 gemeten als
`cache-control: public, max-age=2678400`, dus 31 dagen.

Tijdens fase 3 en verder verandert de kaart voortdurend terwijl `version` in
`manifest.json` gelijk blijft. De URL verandert dan niet, de browser gebruikt
zijn cache, en je meet oude code terwijl je denkt dat je nieuwe meet. Dat is
geen ongemak maar een bron van verkeerde conclusies: fase 1 moest niet voor
niets met `fetch(url, {cache:'reload'})` en een hashvergelijking bewijzen dat
de gemeten code vers was.

### 16.2 De regel

**De `?v=` is de hash van het bundelbestand, niet het versienummer.**

- De integratie berekent bij setup de hash van
  `frontend/domotiapp-lovelace.js` en bouwt de URL
  `/domotiapp_lovelace/domotiapp-lovelace.js?v=<hash>`.
- **VOORSTEL** — SHA-256, hexadecimaal, afgekapt op de eerste 12 tekens. Lang
  genoeg dat een botsing geen praktisch risico is, kort genoeg om leesbaar te
  blijven in de DOM en in een bugrapport.
- Het lezen van het bestand is blokkerende I/O en gaat daarom via
  `hass.async_add_executor_job`. Dat is dezelfde reden waarom
  `async_register_static_paths` zelf een executor gebruikt
  (`ONDERZOEK-FRONTEND.md` vraag 1).
- `cache_headers=True` blijft staan. Sterker: dat is nu pas correct. Een
  content-geadresseerde URL mág agressief gecachet worden, want zodra de
  inhoud verandert, verandert de URL.

Dit werkt in beide richtingen die ertoe doen: tijdens ontwikkeling verandert de
hash bij elke rebuild, en bij een klant verandert hij na een HACS-update — ook
als iemand vergeten was `version` te verhogen.

### 16.3 De werkwijze die daaruit volgt

De hash wordt berekend **bij setup van de config entry**, niet bij elk
indexverzoek — `add_extra_js_url` zet een string in een set, er is geen
haakje per request.

Gevolg, en dit is een harde afspraak voor fase 3 en verder:

> Na elke `npm run build` moet de config entry van DomotiApp Scene herladen
> worden voordat de browser de nieuwe kaart kan zien. Daarna een harde
> herlaadbeurt in de browser.

Dat herladen werkt — in fase 1 is aangetoond dat een reload van de config
entry slaagt en dat er daarna precies één import in `index.html` staat, niet
twee.

### 16.4 Bij unload

`remove_extra_js_url(hass, <exact dezelfde URL>)` bij het verwijderen van de
laatste config entry. Exact dezelfde string, inclusief de `?v=`-hash, want
`UrlManager` bewaart hele URL-strings in een `frozenset`
(`ONDERZOEK-FRONTEND.md` vraag 2). Een afwijkende string verwijdert niets en
laat een verweesde import achter.

Daarom houdt de integratie de laatst aangemelde URL in `hass.data` bij, en
gebruikt ze díe bij het verwijderen — niet een opnieuw opgebouwde string.
Verandert de hash binnen één HA-run (rebuild + reload), dan wordt eerst de oude
URL verwijderd en daarna de nieuwe toegevoegd, in die volgorde.

Het statische pad zelf wordt **niet** afgemeld: aiohttp kent geen unregister
voor routes. De guard tegen dubbele registratie blijft daarom staan zolang HA
draait.

**De Lovelace-resource uit [sectie 16.5](#165-de-tweede-laadroute) is wél af te
melden.** Dat is de uitzondering op de regel hierboven, en het onderscheid is
niet cosmetisch:

| | Afmelden mogelijk? | Wanneer |
|---|---|---|
| Statisch pad | nee — aiohttp kent geen unregister | nooit |
| `add_extra_js_url` | ja — `remove_extra_js_url` met exact dezelfde string | bij unload van de laatste entry |
| Lovelace-resource | ja — `async_delete_item` | **alleen** bij `async_remove_entry` |

De resource verdwijnt dus **niet** bij unload. Unload draait ook bij elke
reload — de handeling die na iedere rebuild nodig is ([sectie 16.3](#163-de-werkwijze-die-daaruit-volgt)) —
en de resource zou dan bij elke herstart weg en terug komen. Weghalen gebeurt
in `async_remove_entry`, en alleen als er geen config entry van ons meer over
is. Home Assistant verwijdert de entry uit zijn lijst vóórdat het die callback
aanroept, dus `hass.config_entries.async_entries(DOMAIN)` levert daar precies
de entries op die blíjven.

### 16.5 De tweede laadroute

De kaart wordt **langs twee wegen** aangemeld: de import in `index.html`
([16.2](#162-de-regel)) én een Lovelace-resource die de **integratie zelf**
aanmaakt. De klant voegt nog steeds niets handmatig toe.

#### Waarom

`add_extra_js_url` alleen is niet betrouwbaar bij een klant. Home Assistant
serveert `index.html` **zonder cache-validatie-headers** — geen
`Cache-Control`, geen `ETag`, geen `Last-Modified` — en zijn service worker
beantwoordt de wortel-URL met `StaleWhileRevalidate`. Een browser die HA al
gebruikte vóór de installatie houdt daardoor een `index.html` van vóór die
installatie vast, zonder onze importregel. De kaart is dan onvindbaar en elk
dashboard toont "Configuratiefout".

Dat is geen fout van ons. Het staat als
[`home-assistant/epics#113`](https://github.com/home-assistant/epics/issues/113)
in HA's eigen issuelijst, met dezelfde oorzaakanalyse. Het onderzoek staat in
`docs/fase-7/RAPPORT.md` (de meting) en `docs/fase-8/RAPPORT.md` (dat het
HA-breed is).

Een Lovelace-resource wordt uit de dashboardconfiguratie geladen, over de
WebSocket, per dashboard. Die route raakt `index.html` niet aan en overleeft
een verouderde index — gemeten op een instance waar de index-route stukliep en
de resource-route wél werkte.

#### Waarom dan niet alleen de resource

Op HA's ingebouwde panelen (`/home/overview`) worden Lovelace-resources
helemaal niet geladen. `add_extra_js_url` dekt die; de resource dekt de kapotte
index. Samen zijn ze dekkend, en dat is de enige reden dat het er twee zijn.

#### De regels

1. **Eén URL voor beide routes.** De resource krijgt exact dezelfde string als
   `add_extra_js_url`, inclusief dezelfde `?v=`-hash. De modulekaart van de
   browser dedupliceert op URL, dus de bundel wordt één keer opgehaald en één
   keer geëvalueerd. Lopen de twee uiteen, dan zijn het er twee — onschadelijk
   dankzij [17.1](#171-de-module-laadt-overal-voor-iedereen), maar zinloos.
2. **Een afwijkende hash wordt bijgewerkt, niet genegeerd.** Blijft er een
   resource met een oude `?v=` staan, dan haalt de browser onder die URL een
   verouderde bundel uit zijn HTTP-cache — precies wat
   [16.2](#162-de-regel) oplost. Bij setup wordt daarom gecontroleerd of de
   bestaande resource dezelfde URL draagt, en zo niet: `async_update_item`.
3. **Nooit een tweede ernaast.** De vergelijking gaat op het pad zonder query,
   niet op de hele URL. Anders levert elke rebuild een extra resource op.
4. **Alleen onze eigen resources.** Wat niet naar `/domotiapp_lovelace/…` wijst,
   blijft onaangeroerd — de kaart van iemand anders, zoals kiosk-mode, is niet
   van ons.
5. **Dit mag de setup nooit laten mislukken.** Draait Lovelace in
   YAML-resourcemodus, dan is de collectie een `ResourceYAMLCollection` die
   alleen kan lezen; daar valt niets te registreren. Dat wordt gelogd en
   verder genegeerd — de import in `index.html` doet dan gewoon wat hij deed.
   Hetzelfde geldt voor elke andere fout in dit pad.

#### Dit is tijdelijk bedoeld

Twee open issues bij Home Assistant zouden dit overbodig maken:

- [`frontend#53208`](https://github.com/home-assistant/frontend/issues/53208) —
  documentnavigaties van `StaleWhileRevalidate` naar `NetworkFirst`.
- [`core#176912`](https://github.com/home-assistant/core/issues/176912) — de
  index serveren met `no-cache` en een `ETag`.

**Waaraan je ziet dat de tweede route weg kan:** landt een van die twee in een
HA-release, dan volstaat de eerste route weer. Het weghalen is dan één
release: de aanmaak vervalt en een bestaande resource wordt bij setup
opgeruimd. De klant merkt daar niets van, want de kaart blijft in dezelfde
paginalading beschikbaar via de import. De ondergrens in `hacs.json`
(`homeassistant`) is het instrument om te bepalen vanaf wanneer dat mag.

Zolang dat niet gebeurd is, blijft deze sectie staan.

---

## 17. Frontend-risico's en bouwregels

### 17.1 De module laadt overal, voor iedereen

`add_extra_js_url` zet de import in `index.html`, dus de bundel wordt geladen
op **elke pagina voor elke gebruiker**, ook op pagina's waar de kaart niet
staat en voor gebruikers die hem nooit zien.

Twee harde regels volgen daaruit:

1. **De bundel blijft klein.** **VOORSTEL** — een bovengrens van 100 kB
   ongecomprimeerd, bewaakt in CI naast de bestaande bundelvergelijking. Ter
   ijking: de rooktestkaart uit fase 1 is 16.079 bytes inclusief lit.
2. **Op topniveau mag nooit een uitzondering ontstaan.** Alles wat bij het
   importeren draait — `customElements.define`, het duwen in
   `window.customCards`, het lezen van globals — staat in code die niet kan
   gooien. De bestaande guards (`if (!customElements.get(...))` en de
   `some()`-controle op `window.customCards`) zijn hiervan het begin, geen
   uitzondering.

**Sinds [16.5](#165-de-tweede-laadroute) weegt regel 2 zwaarder.** De bundel
kan nu langs twee wegen binnenkomen. Bij gelijke URL's blijft het bij één
evaluatie — daar zorgt de modulekaart van de browser voor — maar de guards zijn
wat dat opvangt zodra die URL's om welke reden dan ook uiteenlopen. Ze zijn
daarmee geen vangnet meer maar een dragende constructie: een dubbele evaluatie
mag geen dubbele registratie, geen dubbele regel in `window.customCards` en
geen enkele uitzondering opleveren. Dat is in fase 8 gemeten met twee
verschillende URL's naast elkaar, en het is in fase 9 met een test vastgelegd
dat de twee routes dezelfde URL gebruiken.

Zwaar werk hoort in `setConfig`/`connectedCallback`/`firstUpdated`, niet in de
modulescope.

#### 17.1.2 Registreren gaat altijd via `src/registreer.js`

**Geen enkel bestand mag `customElements.define` op modulescope aanroepen.**
Elk nieuw custom element — ook de dialogen en controls uit fase 4b — wordt
geregistreerd via `src/registreer.js`. Dit is een harde regel, bewaakt door
`scripts/check-registratie.mjs` in CI.

De reden staat in `docs/fase-4a/RAPPORT-FIX.md` en is in de browser gemeten.
Home Assistant 2026.8 draait `@webcomponents/scoped-custom-element-registry`.
Die polyfill vervangt `window.customElements` en patcht
`CustomElementRegistry.prototype`; de gepatchte `get` leest **uitsluitend** de
eigen Map:

```js
get(e) { return this.h.get(e)?.g }
```

Er is geen fallback naar de native registry. Onze `import()` in `index.html` is
een sibling van die van HA's eigen app, dus wie als eerste klaar is, is een
race. Winnen wij, dan roepen we de **native** `define` aan en is het element
daarna onzichtbaar voor HA — zonder fout en zonder log. Symptomen:
"Configuratiefout" op elke kaart, en een kaartkiezer die eindeloos laadt omdat
`whenDefined` bij de andere registry hoort.

`registreer.js` lost dat op door te wachten tot `home-assistant` geregistreerd
is, en `customElements` bij elke poging opnieuw te lezen.

#### 17.1.1 De omvang van de schade wordt in fase 3 gemeten

Hoe ver de schade van zo'n uitzondering reikt, is nog niet vastgesteld. Het
sjabloon in `index.html` doet per module een losse `import()` zonder `.catch()`
(`ONDERZOEK-FRONTEND.md` vraag 2), náást een aparte import van HA's eigen
`core.*.js`. Of een gooiende module daarmee het hele frontend meesleept of
alleen een unhandled rejection oplevert, is beredeneerbaar maar niet gemeten —
en fase 2 mocht geen browser openen.

**In fase 3 komt daar een expliciete meting voor.** Opzet:

1. Tijdelijk een `throw new Error("meting topniveau-fout")` op modulescope in
   de bundel zetten, vóór de `customElements.define`.
2. Bouwen, de config entry herladen ([sectie 16.3](#163-de-werkwijze-die-daaruit-volgt)),
   hard herladen in de browser.
3. Vaststellen: laadt HA's frontend nog? Komt de zijbalk op? Renderen andere
   dashboards? Wat staat er in de console?
4. De throw weer weghalen en de bundelvergelijking in CI laten bevestigen dat
   de bron en het gecommitte bestand weer gelijk zijn.

De uitkomst bepaalt **alleen de urgentie**, niet de regel. Blijkt de schade
beperkt tot een unhandled rejection, dan blijft "op topniveau nooit gooien"
onverkort staan — het scheelt dan alleen dat een fout in ons product niet het
hele huis platlegt. Blijkt het frontend wél mee te gaan, dan verdient de regel
een eigen test in CI.

### 17.2 Safe mode

In HA's safe mode worden extra modules bewust weggelaten
(`components/frontend/__init__.py:874-881`, `ONDERZOEK-FRONTEND.md` vraag 2).
De kaart is dan onbekend en dashboards die hem gebruiken tonen een fout.

Dat is **bedoeld gedrag** — het is het ontsnappingsluik als een custom card HA
onbruikbaar maakt — en hoort daarom in de klantdocumentatie, niet in een
work-around.

### 17.3 Bouwen met lit

De kaart wordt met lit gebouwd. Twee concrete redenen, beide uit
INVENTARIS.md:

- **Punt (f)** — lit escapet interpolaties in `html`-templates automatisch. De
  referentiekaart zette lampnamen ongeëscaped in een `innerHTML`-string, op
  twee plaatsen; één aanhalingsteken in een naam brak het attribuut.
- **Punt (k)** — lit hertekent alleen wat verandert. De referentiekaart zette
  bij elke wijziging de complete `shadowRoot.innerHTML` opnieuw, inclusief
  `<style>`, en hing alle listeners opnieuw aan.

De bundel is zelfstandig: lit wordt meegebundeld, er staan geen imports naar
buiten in het resultaat. Dat is in fase 1 gecontroleerd en wordt door CI
bewaakt.

### 17.4 Stijl

**VOORSTEL** — de kaart gebruikt uitsluitend HA's eigen CSS-variabelen
(`--primary-text-color`, `--secondary-text-color`, `--divider-color`,
`--ha-font-size-*`) en definieert geen eigen kleuren. In een bubble pop-up
staat de kaart tussen andermans componenten; eigen kleuren vallen daar
onvermijdelijk uit de toon bij een themawissel.

---

## 18. Foutgedrag

De rode draad van deze sectie: **stil doorgaan is de ergste uitkomst.** Vier
van de vijf ernstigste punten uit INVENTARIS.md sectie 8 zijn stille fouten.

### 18.1 Nooit stil terugvallen op een default

INVENTARIS.md punt **(c)**: een onparseerbare opslagwaarde viel terug op
"alles 100 %", zonder log en zonder melding, en de eerstvolgende Opslaan
overschreef de kapotte waarde definitief.

Onze regel: **melden, en niet overschrijven voordat de gebruiker het weet.**

### 18.2 Onleesbare of ongeldige opslag

Er zijn twee verschillende gevallen, en ze worden verschillend afgehandeld.

**Geval A — het hele bestand is geen geldige JSON.**

Dat handelt HA zelf al af zoals wij het willen
(`helpers/storage.py:369-421`): het bestand wordt hernoemd naar
`<pad>.corrupt.<isotime>`, er wordt een ERROR gelogd, en er wordt een
**persistent repair issue met severity CRITICAL** aangemaakt
(`storage_corruption_<key>_<isotime>`). `async_load` geeft `None` terug.

Wij hoeven daar niets aan toe te voegen, en mogen er vooral niets aan
afdoen. Het origineel is bewaard onder een andere naam, dus de eis "niet
overschrijven" is al voldaan. Wel moet in de klantdocumentatie staan dat dit
zich als een reparatiemelding aandient en dat de data uit het
`.corrupt.`-bestand of uit een backup terug te halen is.

**Geval B — het bestand parseert, maar onze data klopt niet.**

Dit is het geval waar wij zelf verantwoordelijk voor zijn: een `scenes`-array
met twee in plaats van drie elementen, een `brightness` van `"veel"`, een lamp
met tegelijk `rgb_color` en `color_temp_kelvin`.

Regels:

1. **Per groep, niet per bestand.** Eén kapotte groep maakt de andere kamers
   niet onbruikbaar.
2. De kapotte groep wordt gemarkeerd. `scenes/get` geeft voor die groep
   `home_assistant_error`; de kaart toont "De opgeslagen scenes van deze kamer
   zijn onleesbaar" en biedt géén editor aan.
3. **`scenes/save` wordt voor die groep geweigerd** zolang de markering staat.
   Zo kan de gebruiker de kapotte data niet per ongeluk overschrijven.
4. Er wordt een repair issue aangemaakt met de kamer erin, zodat een admin het
   ziet zonder in logs te kijken.
5. **De kapotte data wordt ongewijzigd bewaard en bij elke opslagronde
   letterlijk teruggeschreven.** Gezonde groepen kunnen gewoon opslaan.
6. **De groep blijft zichtbaar in het opruimoverzicht.**
   `domotiapp_lovelace/storage/list` neemt hem mee, met `corrupt: true` en
   `configured_light_count: null` — zie
   [sectie 11.3.1](#1131-onleesbare-groepen-staan-in-de-lijst) voor de payload
   en de onderbouwing. Zonder die twee velden zou de options flow uit
   [sectie 15](#15-opruimoverzicht) de enige kamer die opgeruimd moet worden
   niet kunnen tonen.

**Geval C — het bestand parseert, maar `data.groups` is geen object.**

Het derde geval is zeldzaam en komt in de praktijk alleen voor na handmatig
bewerken van `.storage/domotiapp_lovelace.scenes`: de JSON is geldig, maar op de
plek waar een object met registry-entry-ID's hoort te staan, staat iets anders
— een lijst, een string, `null`, of `groups` ontbreekt helemaal.

Dit is wezenlijk anders dan geval B, en daarom gelden er andere regels. Bij
geval B is er een sleutel per groep, dus valt er per kamer te markeren en te
bewaren. Hier is er **geen enkele sleutel**: er is niets om per groep te
markeren, en dus ook geen manier om de inhoud bij een schrijfronde
terug te zetten. Elke schrijfactie zou de hele inhoud weggooien.

Regels:

1. **De hele opslag geldt als onbruikbaar**, niet één groep.
2. Er wordt **`ERROR`** gelogd, met de opslagsleutel en wat er is aangetroffen
   in plaats van een object.
3. Er wordt een **repair issue** aangemaakt, zodat een admin het ziet zonder
   in logs te kijken.
4. **Het bestand wordt niet overschreven.** Er wordt in deze toestand
   helemaal niet geschreven.
5. `scenes/get` en `scenes/save` geven **`home_assistant_error`** voor élke
   light group. De kaart toont dat de opslag onleesbaar is en biedt geen
   editor aan.
6. `storage/list` geeft een **lege lijst** — er zijn geen groepen te tonen,
   want er zijn geen sleutels. `storage/delete` geeft
   `home_assistant_error`; er valt niets per groep te verwijderen.

Regel 4 en 5 wijken bewust af van de redenering in
[sectie 18.2.1](#1821-waarom-regel-5-zo-luidt-en-niet-helemaal-niet-schrijven).
Daar was "helemaal niet schrijven" fout omdat één kapotte kamer dan alle
gezonde kamers zou blokkeren. Hier zijn er geen gezonde kamers: de hele inhoud
is onleesbaar. Er valt dus niets te beschermen tegen blokkade, en er valt wél
iets te beschermen tegen overschrijven. Dan wint
[sectie 18.1](#181-nooit-stil-terugvallen-op-een-default).

**Hoe een admin eruit komt.** Anders dan bij geval B helpt het opruimoverzicht
hier niet — dat werkt per registry-entry-ID en die zijn er niet. De uitweg
loopt daarom via het bestand zelf, en de reparatiemelding zegt dat ook:

1. `.storage/domotiapp_lovelace.scenes` uit een backup terugzetten, óf het bestand
   verwijderen om met een schone lei te beginnen;
2. Home Assistant herstarten, of de integratie herladen;
3. is het bestand verwijderd, dan stelt de klant de scenes per kamer opnieuw
   in — `scenes/get` geeft weer drie lege scenes met `stored: false`.

Dat is handwerk, en dat is hier verdedigbaar: deze toestand ontstaat niet
vanzelf. Een geautomatiseerde "gooi alles weg"-knop bouwen voor een geval dat
alleen na handmatig bewerken optreedt, zou een onomkeerbare handeling
toevoegen aan een product dat er verder geen enkele heeft.

#### 18.2.1 Waarom regel 5 zo luidt, en niet "helemaal niet schrijven"

De voor de hand liggende regel — "schrijf niets zolang er een kapotte groep in
zit" — is fout, en het is de moeite waard om op te schrijven waarom.

Er is **één Store voor alle light groups samen**
([sectie 10.1](#101-waar)). Een schrijfverbod op bestandsniveau is dus een
schrijfverbod op *alle* kamers. Eén kapotte kamer die niemand ziet, zou dan het
hele huis blokkeren: de klant drukt op Opslaan in de woonkamer en er gebeurt
niets, om een reden die alleen in een repair issue staat waar hij niet bij kan.
Dat is precies wat regel 1 wil voorkomen, en het is voor een kioskproduct het
slechtst denkbare faalgedrag.

Regel 5 haalt beide eisen tegelijk binnen:

- **"niet overschrijven" (18.1)** — de kapotte groep gaat er byte-voor-byte
  weer in zoals hij eruit kwam;
- **"per groep, niet per bestand" (regel 1)** — de gezonde groepen worden
  gewoon bijgewerkt.

#### 18.2.2 Wat dat betekent voor de Store-laag

De Store-laag moet een groep kunnen doorgeven die ze niet begrijpt. Dat vraagt
één ontwerpbeslissing: **valideren is niet hetzelfde als parsen, en de
laag bewaart het onbewerkte materiaal naast het bewerkte.**

Concreet:

1. **Laden.** `async_load` geeft één dict terug. Per sleutel onder `groups`
   wordt de waarde gevalideerd tegen [sectie 10.4](#104-het-schema). Slaagt
   dat, dan komt er een getypt object in het geheugen. Faalt het, dan wordt de
   **onbewerkte waarde precies zoals hij uit de JSON kwam** bewaard, samen met
   de reden waarom hij faalde.

   ```python
   # schets, geen definitieve code
   self._groups: dict[str, GroupData] = {}     # gevalideerd
   self._corrupt: dict[str, tuple[Any, str]] = {}   # onbewerkt + reden
   ```

2. **Wegschrijven.** De laag bouwt het te schrijven object op uit **beide**
   dicts. De gevalideerde groepen worden geserialiseerd; de kapotte groepen
   worden er onveranderd naast gezet.

   ```python
   def _as_stored(self) -> dict[str, Any]:
       groups = {gid: data.to_dict() for gid, data in self._groups.items()}
       for gid, (raw, _reden) in self._corrupt.items():
           groups[gid] = raw          # letterlijk terug, niet opnieuw opgebouwd
       return {"groups": groups}
   ```

3. **Geen sleutel komt in beide dicts voor.** Bij het laden gaat een
   registry-entry-ID naar precies één van de twee. Dat maakt de samenvoeging
   hierboven een simpele merge zonder voorrangsregel, en het is de enige
   invariant die deze constructie nodig heeft.

4. **De onbewerkte waarde wordt nooit aangeraakt.** Niet genormaliseerd, niet
   gesorteerd, niet door een `dataclass` heen en weer gehaald. Ze gaat
   rechtstreeks de JSON-serialisatie in. Alleen dan kan een admin het
   `.storage`-bestand openen en zien wat er stond.

5. **Migratie slaat kapotte groepen over.** Loopt er ooit een
   `_async_migrate_func` ([sectie 10.6](#106-schemaversie-en-migratie)), dan
   migreert die alleen de groepen die valideren. Een groep die je niet kunt
   lezen, kun je ook niet betrouwbaar omzetten; hem overslaan is het enige
   eerlijke antwoord. Hij blijft in het oude formaat staan en blijft
   gemarkeerd als kapot.

6. **`scenes/save` op een kapotte groep blijft geweigerd** (regel 3). Het
   terugschrijven uit punt 2 gebeurt alleen als *iemand anders* opslaat; de
   kapotte kamer zelf wordt nooit langs die route overschreven.

#### 18.2.3 Hoe je uit die toestand komt

Een kapotte kamer blijft geblokkeerd tot iemand hem opruimt, en daar is geen
nieuw mechanisme voor nodig — het document heeft het al:

1. Een **admin** opent het opruimoverzicht ([sectie 15](#15-opruimoverzicht))
   en verwijdert de opslag van die light group. Dat gaat via
   `domotiapp_lovelace/storage/delete` ([sectie 11.4](#114-domotiapp_lovelacestoragedelete))
   op **registry-entry-ID**, dus het werkt ook als de kamer via de kaart
   onbereikbaar is.
2. De groep verdwijnt daarmee uit `_corrupt`, de markering vervalt, en het
   repair issue wordt gesloten.
3. De **klant** stelt de drie scenes van die kamer opnieuw in. `scenes/get`
   geeft weer drie lege scenes met de standaardiconen, en `stored: false`.

Dat past bij het rollenmodel van dit product: de eigenaar is admin, klanten
niet ([sectie 14](#14-rechten)). Herstellen kost de klant het opnieuw instellen
van één kamer; het alternatief — een "gooi weg en begin opnieuw"-knop voor
iedereen — zou een onomkeerbare handeling in handen van de niet-admin leggen,
en dat is nergens anders in dit document het geval.

Wie de oude waarden alsnog wil zien: die staan onaangeroerd in
`.storage/domotiapp_lovelace.scenes` tot het moment van verwijderen, en anders in
een backup.

### 18.3 Ontbrekende of niet-numerieke waarden worden nooit 100 %

INVENTARIS.md punt **(d)**: `typeof arr[i] === 'number' ? … : 100` liet een
lamp met een ontbrekende waarde op vol vermogen springen. Bij een nachtscene
is dat het verkeerde faalgedrag — je wordt er wakker van.

Onze regel: **een waarde die niet valideert is geen waarde.** De lamp wordt
behandeld als niet ingesteld en dus **niet aangeraakt**. Er wordt nooit een
default helderheid ingevuld — niet 100 %, niet 50 %, niet de laatste bekende.

Dat gaat samen met [sectie 18.2](#182-onleesbare-of-ongeldige-opslag): het feit
dat er een onleesbare waarde was, wordt gemeld. De combinatie is "doe niets, en
zeg dat je niets deed".

### 18.4 Falende service-aanroepen

Een `light.turn_on` die faalt wordt afgevangen, niet genegeerd. Zie
[sectie 8.3](#83-gebundeld-of-per-lamp--en-waarom) en
[sectie 8.4](#84-terugkoppeling). De referentiekaart gebruikte de returnwaarde
niet en had geen `.catch()` (INVENTARIS.md sectie 5 en 6); een offline lamp
mislukte in stilte en de gebruiker zag dezelfde bevestigingsflits als bij
succes.

### 18.5 Logniveaus

**VOORSTEL**

| Niveau | Waarvoor |
|---|---|
| `ERROR` | onleesbare opslag, mislukte schrijfactie |
| `WARNING` | lamp uit de opslag bestaat niet meer; ontbrekende Kelvin-grenzen |
| `DEBUG` | registraties, hashberekening, elke opslagronde |

Geen `INFO` bij normaal gebruik: een kaart die bij elke druk op de knop logt,
vervuilt de logs van de klant.

---

## 19. Wat NIET in v1 zit

Elk punt met één regel waarom.

| Niet in v1 | Waarom |
|---|---|
| Tonen welke scene actief is | Matching vergt een tolerantie per attribuutsoort en een besluit over niet-ingestelde lampen; eigen ontwerpronde ([sectie 3.1](#31-de-knoppen-zijn-neutraal-in-v1)). |
| Meer of minder dan drie scenes | Drie is de vastgelegde vorm; variabel aantal raakt opslagschema, kaartbreedte en editor tegelijk. |
| Scenenamen | Het icoon is het enige onderscheid; namen passen niet in een rij die in een bubble pop-up moet blijven. |
| Andere lampsoorten dan light-entiteiten (schakelaars, media) | De hele lampregel hangt aan `supported_color_modes`, dat alleen lichten hebben. |
| De oude YAML-`group:`-integratie | Maakt entiteiten in het `group`-domein zonder registry-entry, dus geen stabiele opslagsleutel ([sectie 5.3](#53-alleen-de-light-helper-niet-de-oude-group-integratie)). |
| Meerdere light groups per kaart | Eén groep per kamer is het productmodel; meerdere groepen maakt de opslagsleutel meerledig. |
| Effecten, `white`, `rgbw`/`rgbww`-kanalen apart | Elk is een eigen besturing en een eigen opslagveld; helderheid, Kelvin en kleur dekken de vier gevallen die het product moet ondersteunen. |
| Instelbare transition | Eén seconde is vastgelegd; instelbaar maken vergt een plek in de UI en in het schema. |
| Per-scene transition of vertraging per lamp | Zelfde reden, plus het maakt "toepassen" een animatie met eigen faalgevallen. |
| Live meekijken met een andere gebruiker (subscribe/push) | Twee mensen die tegelijk dezelfde kamer bewerken is geen realistisch scenario voor één huishouden ([sectie 11.7](#117-wat-er-bewust-géén-commando-is)). |
| Bescherming tegen twee tegelijk geopende editors | Zelfde reden; de consequentie staat hieronder als bekende beperking. |
| Automatisch opruimen van verweesde opslag | Zou "kaart even weghalen" onomkeerbaar maken ([sectie 15](#15-opruimoverzicht)). |
| Import/export van scenes | Geen vraag naar; de opslag zit in HA's backup. |
| Undo na Opslaan | Annuleren dekt de bewerksessie; undo daarna vergt historie in de opslag. |
| Instellingen op de integratie | De config flow is bewust leeg; er valt niets in te stellen. De options flow bestaat wél, maar uitsluitend als opruimoverzicht ([sectie 15](#15-opruimoverzicht)) — het is geen instellingenscherm. |
| Meertaligheid buiten NL en EN | Het product is Nederlandstalig; `en.json` is er alleen zodat een niet-Nederlandse installatie geen ruwe sleutels toont. |

### 19.1 Bekende beperking: twee editors tegelijk op dezelfde kamer

Er is één snapshot per light group
([sectie 9.4](#94-naamgeving-van-de-tijdelijke-scene)). Openen twee mensen
tegelijk de editor van dezelfde kamer en drukt elk van hen op Voorbeeld, dan
overschrijft de tweede `scene.create` de snapshot van de eerste.

Consequentie: **wie het eerst annuleert, herstelt naar een snapshot die door de
ander is overschreven** — dus naar de lampstand zoals die was toen de tweede
persoon zijn eerste voorbeeld gaf, niet naar de stand van vóór zijn eigen
sessie. En wie daarna annuleert, vindt geen snapshot meer en herstelt niets.

Dit wordt geaccepteerd, zonder lock en zonder waarschuwing. Het gaat om één
huishouden; het scenario vergt dat twee mensen binnen dezelfde minuut dezelfde
kamer bewerken. De lampen komen er niet kapot van — er staat hooguit een
verkeerde lichtstand, die met één druk op een scene-knop verholpen is.
