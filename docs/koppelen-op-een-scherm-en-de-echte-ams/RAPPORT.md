# Koppelen op één scherm, en de AMS met echte attributen

Ronde van 27 augustus 2026 — uitgave **0.21.0**. Direct na 0.20.0.

Twee dingen: de openstaande wens uit 0.16.1 (groeperen op één scherm), en de
3D-printerkaart bijgewerkt op de échte attributen van zijn AMS, die hij tijdens
het bouwen opstuurde.

---

## 1. Kiezen én koppelen op één scherm

Dit stond sinds 0.16.1 open. Op een algemene mediakaart kon je wel groeperen,
maar dat ging via de **zoekknop** — een scherm verder dan de speakerkiezer, en
dus precies niet waar je het zoekt. Een echte Sonos-kaart doet kiezen en
koppelen naast elkaar.

Nu staat het koppelen in de speakerkiezer zelf: per speaker een knop rechts van
de regel.

### Twee handelingen, bewust uit elkaar

- **Op de regel tikken** kiest waar de kaart over gaat.
- **Op de knop rechts tikken** laat die speaker meespelen met wat er nu speelt,
  of haalt hem eruit. **Het scherm blijft dan open** — koppelen doe je zelden één
  voor één: je zet de keuken erbij, en dan de tuin.

Ze samenvoegen tot "tikken = ook koppelen" zou betekenen dat je niet meer naar
een andere speaker kunt overstappen zonder de eerste mee te slepen.

Een speaker die zich niet laat koppelen krijgt een uitgeschakelde knop met een
tooltip die zegt waarom. `MediaPlayerEntityFeature.GROUPING` is bit 524288; een
tv-kastje meldt dat niet, en een knop die gegarandeerd mislukt is erger dan geen
knop.

### Wat er in de aanroep toe doet

`join` gaat naar de **baas** met de nieuwe speaker als `group_members`. `unjoin`
gaat naar de **speaker zelf** — die verlaat de groep. Dat naar de baas sturen zou
de hele groep opheffen, en die verwarring is echt te maken: Home Assistant zet
dezelfde `group_members` op élke speler in de groep.

### Gemeten in een echte browser

Op een algemene mediakaart met vier spelers, bundel `945e8af6d033` (gelijk aan de
sha256 op schijf):

| speaker | knop | waarom |
|---|---|---|
| Group | ERBIJ | kan koppelen |
| Kitchen | ERBIJ → **MEE** | gekoppeld met een echte klik |
| Living Room | ERBIJ, uitgeschakeld | meldt GROUPING niet |
| Walkman | *geen knop* | dat is de speler van de kaart zelf |

De klik: `{isTrusted: true, pad: ["rect", "svg", "button.mee"]}`. Daarna:

- `group_members` van de Walkman: `["media_player.walkman", "media_player.kitchen"]`
- de knop van Kitchen sprong om naar **MEE**
- de regel eronder las: *"… · speelt mee"*
- **het scherm bleef open**, zoals bedoeld

### Eén ding dat twee keer gemeten is en één keer teruggedraaid

Dit hoort in het rapport, want het is precies het geval waarin je jezelf voor de
gek houdt.

Na het loskoppelen bleef de knop op **MEE** staan. Gemeten: de demo-integratie
zette de eigen `group_members` van de keukenspeaker netjes op `[]`, maar de
speler waar hij aan hing bleef hem in ZIJN lijst melden.

De eerste reactie was om de speaker zelf te geloven: "zegt hij dat hij in geen
groep zit, dan speelt hij niet mee." Dat is ingebouwd, en één meting later bleek
het fout: **diezelfde demo zet bij `join` óók alleen de lijst van de baas bij.**
Met die regel leek koppelen daarna niet meer te werken.

De demo is aan de kant van het lid dus in beide richtingen onbetrouwbaar. Dat is
**geen reden om de productiecode te sturen op wat een demo doet** — het is een
reden om de afspraak van Home Assistant te volgen (`group_members` staat op élke
speler, en Sonos en Music Assistant houden zich daaraan) en het verschil op te
schrijven. De regel is teruggedraaid; de eigen lijst van een speaker telt nu
alleen nog als het hoofd helemaal niets meldt, en spreekt hem nooit tegen.

Dat het aan de demo ligt en niet aan onze aanroep is apart aangetoond: dezelfde
`unjoin` rechtstreeks aanroepen, buiten de kaart om, gaf exact hetzelfde
resultaat.

**Wat dat betekent voor zijn installatie:** loskoppelen is op de demo niet
zichtbaar te maken. Op zijn Sonos met Music Assistant hoort het gewoon te werken,
want die melden hun groep aan beide kanten. Dit is het onderdeel om als eerste
zelf te proberen.

---

## 2. De AMS met zijn eigen attributen

Hij stuurde tijdens het bouwen de attributen van tray 1 op. Dat is meer waard dan
raden, en er zaten vier dingen in die de kaart nu gebruikt:

```
color: #FFFFFFFF        cols: #FFFFFFFF      empty: false
name: Bambu PLA Matte   type: PLA            remain: 97
remain_enabled: true    active: false        slot: 1
```

**`name` gaat nu vóór `type`.** Met vier trays PLA is "PLA" vier keer hetzelfde
woord; "Bambu PLA Matte" zegt welke rol erin zit.

**`empty` wint van onze gok.** De kaart raadde of een tray leeg was aan de hand
van "geen kleur en geen soort". De printer zegt het gewoon — en een lege tray die
nog een kleur in zijn geheugen heeft zou anders als gevuld op de kaart komen.

**`remain` wordt getoond**, als een streepje onder het kleurvlakje. Een getal
erbij zou vier keer op een rij staan en de rij onleesbaar maken; het percentage
staat wel in de tooltip. En bij `remain_enabled: false` — een rol zonder chip —
staat er niets, want dan stelt het getal niets voor.

**`active` markeert de tray die de printer nú gebruikt**, met een accentrand.
Geen kleur: kleur is op deze kaart het filament en niet de toestand.

**`cols`** (de meervoudsvorm, voor tweekleurig filament) wordt gelezen als er geen
`color` is; de eerste is de kleur die je ziet.

### Een echte fout die deze attributen aan het licht brachten

De test met zijn tray erin liep vast op iets anders: `trayKleur("PLA")` gaf
`"PLA"` terug. De kleurherkenning accepteerde elke losse letterreeks als
kleurnaam — bedoeld voor wie in de editor "red" typt, maar met als gevolg dat het
SOORT filament als kleur gold, waarna de tray als leeg werd gezien.

Kleurnamen worden nu alleen nog geaccepteerd waar er expliciet om gevraagd wordt:
uit het veld in de editor. Een attribuut moet een hexwaarde of een `rgb()` zijn.

### Gemeten in een echte browser

Vier trays op de kaart:

| | ingevuld | wordt | leeg |
|---|---|---|---|
| Tray 1 | `FF6A13FF` | `#FF6A13` | nee |
| Tray 2 | `#1E88E5` | `#1E88E5` | nee |
| Tray 3 | `00000000` | *geen kleur* | **ja** |
| Tray 4 | `E8E4DEFF` | `#E8E4DE` | nee |

Tray 3 is de belangrijke: `00000000` is volledig doorzichtig zwart, en dat is wat
een lege tray meldt. Zonder die toets zou hij als zwart filament op de kaart
staan.

---

## Wat niet lukte

- **Loskoppelen is niet zichtbaar te maken op de testinstance.** Zie hierboven:
  de demo-integratie werkt de lijst van de baas niet bij. De aanroep zelf is
  correct en met tests vastgelegd, en de demo doet met een rechtstreekse aanroep
  precies hetzelfde.
- **Het restpercentage en de actieve tray zijn niet visueel geverifieerd.** Daar
  is een entiteit mét attributen voor nodig, en die is er hier niet — de
  testconfig gebruikt de handmatige kleurvelden. Het rekenwerk staat wel vast in
  `printer-logica.js`, met zijn eigen attributen letterlijk in de test.

## Aannames

- **De attributen die hij opstuurde zijn representatief voor alle vier de
  trays.** Tray 2 tot en met 4 zijn niet gezien; ze horen dezelfde vorm te
  hebben.
- **Zijn Sonos meldt `group_members` aan beide kanten**, zoals Home Assistant
  voorschrijft en zoals Music Assistant het doet. Blijkt dat niet zo, dan is het
  één regel in `speeltMee`.

## Tellingen

- **768 JS-tests** groen, **538 Python-tests** groen.
- `verify`, `check:css` en `check:registratie`: alle drie OK.
- Bundel `93c2cb13cc9f`, versie 0.21.0.

De browsermetingen hierboven draaiden op bundel `945e8af6d033`. Dat is dezelfde
code: het enige verschil is het versienummer in `manifest.json`, dat pas ná het
meten omhoog ging — en dat zit in de bundel, dus de hash verandert ermee.

## git status --porcelain

Zie de PR; de werkmap is bij het uitbrengen schoon.
