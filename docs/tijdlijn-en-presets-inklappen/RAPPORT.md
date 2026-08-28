# De tijdlijn onder het camerabeeld, en de presets onder één vinkje

**Uitgave 0.29.0 — 28 augustus 2026**

Twee berichten, vijf verzoeken:

> "Ik wil dat de presets onder een uitklapmenu vallen, dat ik ze kan aanzetten
> met 1 vinkje, iets van presets en dan een vinkje er achter — zo houd je
> overzicht op de GUI. Draaien links rechts etc hoort daar ook onder. Dan wil ik
> dat ik bij de camera card filters ga krijgen dat ik kan filteren op datum maar
> ook op type. Tikken op het beeld groot werkt ook al als het uit staat maar dat
> is prima, dat mag weg. Maar die filters ook met timeline koppelen. Ik wil 5
> icons hebben: mens, dier, voertuig, aanbellen en ontgrendeling waarop ik kan
> filteren."

> "Je haalt de gebeurtenissen toch uit wat je zelf hebt gemaakt (...) ik wil
> gewoon op de meldingen een timeline met filters zoals tijd, welke camera, etc."

---

## 1. De presets onder één vinkje

In de editor staat nu, op één regel: **Presets en draaien**, met een schakelaar
ernaast. Staat hij aan, dan verschijnt daaronder een uitklapblok met de zes
instellingen die erbij horen — de keuzelijst, de losse presetknoppen en de vier
richtingen. Staat hij uit, dan is er geen uitklapblok en staat er niets meer
over presets in de editor, en verdwijnen de presetknoppen én het draaikruis van
het beeld.

**Wat je gekozen hebt blijft staan.** Het vinkje uitzetten gooit geen entiteiten
weg; aanvinken zet alles terug zoals het was.

**Waarom het vinkje ERBOVEN staat en niet in de kop van het uitklapblok.**
`ha-form` kent geen schakelaar in de kop van een uitklapblok. Die er met de hand
in prikken zou betekenen dat we in de shadow-DOM van Home Assistant gaan zitten
knutselen, en dat is precies het soort ding dat het bij de eerstvolgende
HA-versie zonder foutmelding begeeft. Zo zie je in één regel of het aanstaat, en
klap je alleen open als je iets wilt kiezen.

**Bestaande kaarten veranderen niet.** Staat er al een preset of een
richtingsknop in de config, dan staat het vinkje aan.

### Een fout die daarbij boven water kwam

`section()` in `src/editor/base.js` gaf zijn uitklapblok een `name`. `ha-form`
geeft een blok met een naam de waarde `data[name]` mee in plaats van de hele
config — dan was `presets` in de YAML als `presets_blok: {presets: ...}` beland
en had de kaart zijn eigen instellingen niet meer teruggevonden. Die functie
stond er sinds het begin en was door geen enkele kaart gebruikt, dus het is
nooit opgevallen. Hij heeft nu een lege naam en een aparte `title`.

Gemeten in de echte editor: `genest: []` — er staat geen enkel genest object in
de config, en "Presets (keuzelijst)" toont **Testmodus**, de entiteit uit de
platte config.

## 2. Tikken op het beeld groot

Hij had gelijk, en het was precies de fout die hij beschreef: de KAART behandelt
een ontbrekende `tap_zoom` als *aan*, de EDITOR tekende dat vakje als *uit*. Het
vinkje beweerde dus het tegenovergestelde van wat de kaart deed.

Het vakje is weg, zoals hij vroeg. `tap_zoom: false` in de YAML blijft werken
voor wie het al heeft staan (de wandtablet waar per ongeluk aanraken makkelijk
gaat).

Dezelfde fout is meteen bij de nieuwe velden voorkomen: de editor **zaait** wat
de kaart als standaard hanteert. Zie punt 3.

## 3. De tijdlijn

Onder het beeld — zijn keuze toen ik drie plekken voorlegde. Van boven naar
beneden:

| | |
|---|---|
| **Dagkiezer** | `‹ Vandaag ›`, en een tik op de dagnaam opent de kalender. Vooruit stopt bij vandaag. |
| **Vijf filterknoppen** | Mens, dier, voertuig, aanbellen, ontgrendeling — met het aantal erbij. Ze staan er alle vijf, ook op een dag waarop er van die soort niets was; dan gedempt. |
| **Camerakeuze** | `Alle · Oprit · Tuin`, alleen bij meer dan één camera op de kaart. |
| **De balk** | Eén etmaal van links naar rechts, met een streepje op 0, 6, 12 en 18 uur. |
| **De lijst** | Tijd, icoon, naam, en bij welke camera. Maximaal 168px hoog en dan scrollen. |

**Een tik op een gebeurtenis licht hem op** — in de lijst én op de balk
tegelijk. Er wordt niets geopend en niets afgespeeld; dat is wat hij koos.

### Waar de gebeurtenissen vandaan komen

Uit de geschiedenis van de melders die al op de kaart staan, opgevraagd met
`history/history_during_period`. Elke keer dat een melder aanging is een
gebeurtenis. Dat werkt bij **elke** integratie en heeft geen NVR, geen Frigate en
geen extra opslag nodig.

Twee dingen die daarbij horen:

- **Het gaat zo ver terug als de recorder bewaart.** Standaard tien dagen. Wie
  verder terug wil, zet `purge_keep_days` hoger in `configuration.yaml`.
- **Alles van dezelfde melder binnen een minuut telt als één.** Een Reolink zet
  zijn `_person` een paar keer aan en uit terwijl er één iemand langsloopt;
  ongefilterd worden dat vijf regels voor één gebeurtenis. De EERSTE tijd wint,
  want dat is het moment waarop het begon.

### De zesde knop

Hij vroeg om vijf iconen en die staan er. Maar een gewone
`binary_sensor.oprit_motion` is geen van die vijf, en die hangt bij hem wél op de
kaart. Zo'n melder onder één van de vijf schuiven zou het filter laten liegen;
hem weglaten zou gebeurtenissen opleveren die je nergens kunt aanvinken. Er is
daarom een zesde knop **Beweging**, en die verschijnt alleen als er werkelijk zo'n
melder is.

### Een soort per melder, en die stuurt ook het beeld

Elke melder krijgt in de editor een keuzelijst *"↳ wat ziet hij"*. Hij wordt
**geraden** uit het entity_id en de naam, dus een Reolink klopt vanzelf. Gemeten
in de testinstance:

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

**Dezelfde instelling stuurt het merkje op het beeld.** Dat droeg altijd het
persoon-icoon, ook bij "Auto oprit" — gezien op een schermafdruk uit de
testinstance van vandaag. Nu draagt het merkje het icoon van zijn soort.

## 4. Een icoon erbij: `dier`

Vier tenen en een kussen. Geen hond en geen kat, want een Reolink meldt "pet" en
dat is allebei.

**De eerste versie was op ware grootte een streepje stippen.** Naast elkaar
gezet op 14, 20 en 32 pixels — de maten waarop hij werkelijk gebruikt wordt — was
hij te fijn. De tenen zijn nu r 2,3 in plaats van 1,75. Dezelfde les als bij
`gras` en `kruiden` in 0.28.0, en hij is deze keer vóór het uitbrengen getrokken
in plaats van erna.

Nu 158 getekende iconen.

---

## Wat er gemeten is, in een echte browser

Testinstance op poort 8127, container `ha-lovelace`, met echte kliks.

**Verse code.** De bundel die Home Assistant uitserveerde tegen die op schijf:

```
/domotiapp_lovelace/domotiapp-lovelace.js?v=2cbcd0bba9ad
604857 bytes   sha256 2cbcd0bba9adccebf2d8a93c3b4ebd8780d64ef73b06789d62d42679459e2f82
op schijf:     2cbcd0bba9adccebf2d8a93c3b4ebd8780d64ef73b06789d62d42679459e2f82
```

Dat is de bundel MET het versienummer 0.29.0 erin, na de laatste bouw en een
herlading van de config entry — dus precies wat er uitgebracht wordt. De metingen
hieronder zijn met dezelfde code gedaan; alleen het versienummer in de bundel
verschilde bij een deel ervan, en dat is de enige byte die tussen `56f29f10` en
`2cbcd0bb` anders is.

**Echte gegevens.** Zes melders als sjabloonsensor in `.ha-dev-config`, met een
hele dag geschiedenis in de recorder gezet. De kaart leest die via het gewone
WS-commando; er is niets nagebootst.

**Elke klik met `isTrusted: true`**, en met zijn `composedPath()` erbij zodat
zichtbaar is waar hij landde:

| klik | pad | gevolg |
|---|---|---|
| filter Mens | `svg › button[mens] › div.rij › div.tijdlijn` | 3 van 10, alleen "Persoon oprit", 3 streepjes op de balk |
| filter Voertuig erbij | `svg › button[voertuig]` | 5 van 10, mens én voertuig aangevinkt |
| dag terug | `path › svg › button.pijl[dag-1]` | "Gisteren", "Geen gebeurtenissen op deze dag", "Niets gezien" op de balk |
| dag vooruit | `button.pijl[dag1]` | terug op "Vandaag", vooruitpijl weer uit |
| camera "Oprit" | `button[data-camfilter]` | 9 van 10 — de melder die aan de Tuin hangt valt weg |
| streepje 07:35 | `button.merk-g › div.balk` | balk én lijstregel lichten op, **en er opent geen more-info** |
| dagnaam "Vandaag" | | de kalender van de browser opent op 28 augustus 2026 (schermafdruk) |
| soort → Voertuig | keuzelijst in de editor | dier valt naar 0 en dempt, voertuig gaat van 3 naar 5, het icoon in de lijst wordt een auto |

**De editor**, met echte kliks: uitklapblok open → "Presets (keuzelijst)" toont
*Testmodus*; schakelaar uit → het uitklapblok verdwijnt en het voorbeeld
verliest zijn presetknoppen en zijn draaikruis in hetzelfde beeld.

**Uitlijning, gemeten en niet op het oog.** Alle rijen van de tijdlijn staan op
dezelfde randen:

```
kaart      833 .. 1333
dagrij     844 .. 1322
soorten    844 .. 1322
balk       844 .. 1322
lijst      844 .. 1322
```

**En de inhoud past in de kaart** — de les van 0.25.0:
`scrollHeight 727 <= hoogte 729`.

**Geen fouten in de console.**

## Eén ding dat gemeten is en de code veranderde

De tijdlijn ververst zichzelf zodra een melder aangaat. Die pauze stond op twee
seconden, en dat is te kort — de recorder schrijft zijn regels met vertraging
weg, en `history_during_period` leest alleen wat er al staat:

```
melder gaat aan   10:55:41
opgehaald         10:55:43  ->  11 gebeurtenissen (de nieuwe ontbrak)
opgehaald         10:55:59  ->  12 gebeurtenissen
```

Met twee seconden vraag je dus net te vroeg en blijft de lijst staan tot de
volgende melder afgaat — terwijl het merkje op het beeld wél meteen verschijnt.
Dat maakt het erger, niet beter: je ziet dat er iets is en de lijst eronder
zwijgt. Nu vijf seconden, en daarna opnieuw gemeten:

```
melder gaat aan   10:56:59
zeven tellen later:  12 van 12  ->  13 van 13, met de nieuwe gebeurtenis bovenaan
```

## Proeven

```
npm test                   866 groen  (29 nieuw, allemaal in camera-tijdlijn.test.mjs)
npm run check:css          OK
npm run check:registratie  OK
npm run verify             OK — bundel actueel
```

De 29 nieuwe proeven zijn **NIEUW GEDRAG**: `src/cards/camera-tijdlijn.js`
bestond niet, dus op de code van vóór deze ronde faalt het hele bestand op de
import.

## Wat niet lukte

- **De kalender zelf invullen.** Een native datumkiezer van de browser staat
  buiten de pagina en is met de browsertool niet te bedienen (zie `CLAUDE.md`,
  *Meten in een echte browser*). Het OPENEN is met een schermafdruk aangetoond;
  het rekenwerk eromheen (`alsDatumveld`/`uitDatumveld`) staat in de tests.
- **Gebeurtenissen mét foto.** Zie hieronder — daar is nog een antwoord voor
  nodig.

## Aannames

- **De gebeurtenissen komen uit de melders op de kaart** en niet uit een
  opnamesysteem. Dat is zijn eigen antwoord op de vraag, en zijn eigen zin
  bevestigde het daarna nog eens.
- **De tijdlijn staat standaard UIT.** Eén vinkje "Tijdlijn met gebeurtenissen"
  zet hem aan, in dezelfde vorm als het presets-vinkje. Reden: hij heeft
  camerakaarten op een dashboard staan, en die horen niet uit zichzelf hoger te
  worden.
- **De filterkeuze wordt niet bewaard.** Ververs je de pagina, dan staan alle
  soorten weer uit (= alles zichtbaar) en staat de dag weer op vandaag. Een
  filter in de config zetten zou hem voor iedereen op dat dashboard vastzetten.

## Wat er nog openstaat: de foto bij een gebeurtenis

Hij schreef: *"ik wil gewoon op de meldingen en die foto's die er nu onder
staan een time line."* De meldingen zijn er nu. De **foto's** kunnen nog niet,
en dat is geen onwil maar een ontbrekend gegeven: Home Assistant bewaart de
momentopname die in een telefoonmelding zit nergens uit zichzelf.

Wat er nodig is om het wél te kunnen: het pad waar zijn automatisering de
momentopname neerzet. Staat er in die automatisering iets als
`/config/www/snapshots/oprit.jpg` of `/media/...`, dan kan de kaart die erbij
zetten. Zit de foto alleen in de melding, dan is hij na het versturen weg en
moet er eerst een `camera.snapshot` bij met een naam waar de tijd in zit.

## `git status --porcelain`

```
M  CLAUDE.md
M  custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
M  custom_components/domotiapp_lovelace/manifest.json
A  docs/tijdlijn-en-presets-inklappen/RAPPORT.md
M  src/cards/camera-card.js
A  src/cards/camera-tijdlijn.js
M  src/editor/base.js
M  src/editor/icoon-zoek.js
M  src/icons.js
A  tests/js/camera-tijdlijn.test.mjs
```
