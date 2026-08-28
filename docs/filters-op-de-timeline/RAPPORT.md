# Filters op de timeline, en de presets onder één vinkje

**Uitgave 0.30.0 — 28 augustus 2026**

Twee berichten. Eerst:

> "Ik wil dat de presets onder een uitklapmenu vallen, dat ik ze kan aanzetten
> met 1 vinkje, iets van presets en dan een vinkje er achter — zo houd je
> overzicht op de GUI. Draaien links rechts etc hoort daar ook onder. Dan wil ik
> dat ik bij de camera card filters ga krijgen dat ik kan filteren op datum maar
> ook op type. Tikken op het beeld groot werkt ook al als het uit staat maar dat
> is prima, dat mag weg. Maar die filters ook met timeline koppelen. Ik wil 5
> icons hebben: mens, dier, voertuig, aanbellen en ontgrendeling waarop ik kan
> filteren."

En daarna, en dat bericht bepaalde de vorm:

> "Je haalt de gebeurtenissen toch uit wat je zelf hebt gemaakt, dat per 1
> minuut, snap je, want je stuurt mij ook een melding. Ik wil gewoon op de
> meldingen en die foto's die er nu onder staan een timeline met filters zoals
> tijd, welke camera etc."

---

## Eerst iets rechtzetten over deze ronde

De filters zijn éérst gebouwd op de **geschiedenis van Home Assistant**: elke
keer dat een melder aanging als gebeurtenis, met een balk van een etmaal
eronder. Dat was verkeerd, en zijn tweede bericht zei precies waarom.

De timeline bestond al. 0.29.0 (PR #46, gisteravond uitgebracht) heeft een
bewakingsmotor aan de serverkant die bij elke detectie een snapshot maakt, hem
een week bewaart en een melding stuurt — met een **rustperiode per melder van
standaard 60 seconden**. Dat is wat hij bedoelde met *"dat per 1 minuut"* en met
*"die foto's die er nu onder staan"*.

Wat hij vroeg is dus geen tweede tijdlijn maar **filters op de bestaande**. Die
eerste tak is gesloten (PR #47); wat er bruikbaar in zat — het raden van de
soort, de dagkiezer, het icoon, de presets-inklap — is meeverhuisd.

Twee dingen die daarmee vervallen en waar ik in de bron geen restanten van heb
laten staan: gebeurtenissen uit `history/history_during_period`, en het zelf
dunnen van meldingen binnen een minuut. Dat tweede doet de motor al, en beter:
zijn klok loopt per melder.

---

## 1. De presets onder één vinkje

In de editor staat nu op één regel: **Presets en draaien**, met een schakelaar
ernaast. Staat hij aan, dan verschijnt daaronder een uitklapblok met de zes
instellingen die erbij horen — de keuzelijst, de losse presetknoppen en de vier
richtingen. Staat hij uit, dan is er geen uitklapblok, en verdwijnen de
presetknoppen én het draaikruis van het beeld.

**Wat je gekozen hebt blijft staan.** Het vinkje uitzetten gooit geen entiteiten
weg; aanvinken zet alles terug zoals het was. Een kaart die al presets had,
begint met het vinkje aan.

**Waarom het vinkje ERBOVEN staat en niet in de kop van het uitklapblok.**
`ha-form` kent geen schakelaar in die kop. Die er met de hand in prikken zou
betekenen dat we in de shadow-DOM van Home Assistant gaan knutselen, en dat is
het soort ding dat bij de eerstvolgende HA-versie zonder foutmelding begeeft.

**De vier snapshot-instellingen hebben dezelfde behandeling gekregen.** Die
stonden al achter één vinkje — dat vroeg hij op 27 augustus — maar los in het
formulier. Nu zitten ze in een blok "Snapshots en meldingen". Dat is mijn eigen
keuze, in de lijn van wat hij vroeg; hij heeft er niet apart om gevraagd.

### Een fout die daarbij boven water kwam

`section()` in `src/editor/base.js` gaf zijn uitklapblok een `name`. `ha-form`
geeft een blok met een naam de waarde `data[name]` mee in plaats van de hele
config — dan was `presets` in de YAML als `presets_blok: {presets: ...}` beland
en had de kaart zijn eigen instellingen niet meer teruggevonden. Die functie
stond er sinds het begin en was door geen enkele kaart gebruikt, dus het is
nooit opgevallen. Hij heeft nu een lege naam en een aparte `title`.

Gemeten in de echte editor: `genest: []`.

## 2. Tikken op het beeld groot

Hij had gelijk, en het was precies de fout die hij beschreef: de KAART behandelt
een ontbrekende `tap_zoom` als *aan*, de EDITOR tekende dat vakje als *uit*. Het
vinkje beweerde het tegenovergestelde van wat de kaart deed.

Het vakje is weg, zoals hij vroeg. `tap_zoom: false` in de YAML blijft werken
voor wie het al heeft staan (de wandtablet waar per ongeluk aanraken makkelijk
gaat).

Dezelfde fout is meteen bij de nieuwe velden voorkomen: de editor **zaait** wat
de kaart als standaard hanteert, zowel het presets-vinkje als de soort per
melder.

## 3. De filters boven de timeline

Boven de strook met snapshots staat nu:

| | |
|---|---|
| **Dagkiezer** | `‹ Alles ›`. Eén tik op "Alles" springt naar vandaag, nog een tik opent de kalender. Vooruit stopt bij vandaag. |
| **Vijf filterknoppen** | Mens, dier, voertuig, aanbellen, ontgrendeling — met het aantal erbij. Ze staan er alle vijf, ook als er van die soort niets is; dan gedempt. |
| **Camerakeuze** | `Alle · Oprit · Tuin`, alleen bij meer dan één camera op de kaart. |
| **Teller** | "13 van 13", rechts in de dagrij. |

Ze staan **boven** de strook en niet erin: de strook schuift opzij, en een filter
dat wegscrollt terwijl je zoekt is geen filter.

De lege strook zegt nu twee verschillende dingen: **"Nog geen beelden"** als er
nooit iets gemaakt is, en **"Niets binnen dit filter"** als je hebt weggefilterd
wat er wél is. Dat is het verschil tussen een kaart die nog moet beginnen en een
kaart waar je zelf een knop hebt ingedrukt.

### De zesde knop

Hij vroeg om vijf iconen en die staan er. Maar een gewone
`binary_sensor.oprit_motion` is geen van die vijf, en die hangt bij hem wél op de
kaart. Zo'n melder onder één van de vijf schuiven zou het filter laten liegen;
hem weglaten zou beelden opleveren die je nergens kunt aanvinken. Er is daarom
een zesde knop **Beweging**, en die verschijnt alleen als er werkelijk zo'n
melder of zo'n beeld is.

### Een soort per melder, en die stuurt ook het beeld

Elke melder krijgt in de editor een keuzelijst *"↳ wat ziet hij"*. Hij wordt
**geraden** uit het entity_id en de naam, dus een Reolink klopt vanzelf. Gemeten
in de testinstance, en dit is wat de editor er zelf in zette:

| melder | geraden |
|---|---|
| `binary_sensor.persoon_oprit` | mens |
| `binary_sensor.auto_oprit` | voertuig |
| `binary_sensor.huisdier_tuin` | dier |
| `binary_sensor.deurbel` | aanbellen |
| `binary_sensor.slot_voordeur` | ontgrendeling |
| `binary_sensor.beweging_tuin` | beweging |

Er wordt op **hele woorden** gezocht en niet op stukjes. Dat onderscheid is niet
decoratief: `binary_sensor.deurbel_person` bevat "bel", en op stukjes zoeken
maakt van de persoonsmelder van een deurbel een aanbelmelding. Er staat een test
op.

Het beeld in de timeline draagt zijn melder mee, dus een oud beeld valt nog
steeds onder de goede knop — ook als die melder inmiddels van de kaart af is.

**Dezelfde instelling stuurt het merkje op het beeld.** Dat droeg altijd het
persoon-icoon, ook bij "Auto oprit". Nu draagt het merkje het icoon van zijn
soort; in de browser nagemeten aan het pad van de SVG (`M4.2 15.4h15.6` is de
auto).

## 4. Een icoon erbij: `dier`

Vier tenen en een kussen. Geen hond en geen kat, want een Reolink meldt "pet" en
dat is allebei.

**De eerste versie was op ware grootte een streepje stippen.** Naast elkaar gezet
op 14, 20 en 32 pixels — de maten waarop hij werkelijk gebruikt wordt — was hij
te fijn. De tenen zijn nu r 2,3 in plaats van 1,75. Dezelfde les als bij `gras`
en `kruiden` in 0.28.0, en hij is deze keer vóór het uitbrengen getrokken in
plaats van erna.

Nu 158 getekende iconen.

---

## Wat er gemeten is, in een echte browser

Testinstance op poort 8127, container `ha-lovelace`, met **echte snapshots van
de bewakingsmotor** — er is niets nagebootst. Zes sjabloonmelders in
`.ha-dev-config`, aangezet via `POST /api/states`, waarna de motor zelf het beeld
maakte en wegschreef.

**Verse code.** De bundel die Home Assistant uitserveerde tegen die op schijf:

```
/domotiapp_lovelace/domotiapp-lovelace.js?v=abf00423d03a
608405 bytes   sha256 abf00423d03aff14be503917345a558b0a84bbe694c7389b16994d71fb59b73e
op schijf:     abf00423d03aff14be503917345a558b0a84bbe694c7389b16994d71fb59b73e
```

**Elke klik met `isTrusted: true`**, met zijn `composedPath()` erbij zodat
zichtbaar is waar hij landde:

| klik | pad | gevolg |
|---|---|---|
| filter Mens | `svg › button[mens] › div.rij › div.filters` | 2 van 11, en in de strook alleen "Persoon oprit" (twee camera's) |
| camera Tuin | `button[cam:camera.demo_camera_png]` | 1 van 11, alleen de Tuin-opname |
| dagnaam "Alles" | `button.datum` | wordt "Vandaag", vooruitpijl gaat uit |
| dag terug | `path › svg › button.pijl[dag-1]` | "Gisteren", 0 van 11, **"Niets binnen dit filter."** |
| dag vooruit | `button.pijl[dag1]` | terug op "Vandaag" |
| Mens uit / Alle camera's | `button[mens]`, `button[cam:alle]` | 13 van 13, hele strook terug |
| schakelaar Presets | in de editor | uitklapblok verdwijnt, en het voorbeeld verliest zijn presetknoppen én zijn draaikruis |

**Live erbij, mét het filter aan.** Met de dag op "Gisteren" een detectie
uitgelokt: de tellers liepen van 11 naar 13 beelden en de voertuigknop van 2 naar
4, terwijl de strook leeg bleef — het filter hield stand terwijl er beelden
binnenkwamen.

**De editor**, uitgelezen na een echte klik op de schakelaar:

```
presets_aan: false        (was true)
blokken:     ["Snapshots en meldingen"]   -- het presetsblok is weg
tap_zoom:    geen veld meer in het schema
genest:      []
voorbeeld:   .presets hidden, .ptz hidden
```

**Uitlijning, gemeten en niet op het oog.** Alle rijen boven de strook staan op
dezelfde randen, en de eerste miniatuur begint op diezelfde lijn:

```
kaart        838 .. 1338
dagrij       849 .. 1327
soorten      849 .. 1327
camerakeuze  849 .. 1327
1e miniatuur 849 ..  953
```

**En de inhoud past in de kaart** — de les van 0.25.0:
`scrollHeight 579 <= hoogte 581`.

**Geen fouten in de console** na een verse lading.

## Proeven

```
npm test                   876 groen (25 nieuw — NIEUW GEDRAG)
npm run check:css          OK
npm run check:registratie  OK
npm run verify             OK — bundel actueel
```

De 25 nieuwe proeven zijn **NIEUW GEDRAG**: `src/cards/camera-filters.js`
bestond niet, dus op de code van vóór deze ronde faalt het hele bestand op de
import.

De Python-kant is niet aangeraakt; er is geen enkel bestand onder
`custom_components/.../bewaking/` gewijzigd.

## Wat niet lukte

- **De kalender zelf invullen.** Een native datumkiezer van de browser staat
  buiten de pagina en is met de browsertool niet te bedienen (zie `CLAUDE.md`,
  *Meten in een echte browser*). Het OPENEN is aangetoond; het rekenwerk eromheen
  (`alsDatumveld`/`uitDatumveld`) staat in de tests.

## Aannames

- **De filterkeuze wordt niet bewaard.** Ververs je de pagina, dan staan alle
  soorten weer uit (= alles zichtbaar) en staat de dag weer op "Alles". Een
  filter in de config zetten zou hem voor iedereen op dat dashboard vastzetten.
- **"Alles" is de begintoestand van de dagkiezer** en niet "Vandaag". De strook
  toont dan wat hij altijd toonde; wie op een dag wil filteren tikt er zelf op.
  Zo verandert er niets voor wie de filters niet gebruikt.
- **De snapshot-instellingen in een uitklapblok** is mijn keuze, niet zijn
  verzoek. Zie punt 1.

## `git status --porcelain`

```
M  CLAUDE.md
M  custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
M  custom_components/domotiapp_lovelace/manifest.json
A  docs/filters-op-de-timeline/RAPPORT.md
M  src/cards/camera-card.js
A  src/cards/camera-filters.js
M  src/editor/base.js
M  src/editor/icoon-zoek.js
M  src/icons.js
A  tests/js/camera-filters.test.mjs
```
