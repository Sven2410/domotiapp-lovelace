# Snapshots, rustperiode en timeline bij de camerakaart — 0.29.0

**Gevraagd op 27 augustus 2026.** Vier dingen, in zijn eigen woorden:

> *"Ik wil bij de beveiligingskaart een snapshot systeem hebben. We hebben al de
> detecties dus begin is er. Ik wil een delay kunnen instellen want als je door
> bepaalde camera's loopt kan hij wel 10 keer een melding sturen. Dan wil ik
> kunnen kiezen welke personen meldingen ontvangen."*

En daarna, na het eerste voorstel:

> *"doe die delay als optie, by default 0 sec. By default ook 1 min per camera
> hoe ik het had. Niet werken met groepen. (...) Ik wil ook een timeline hebben.
> Als ik in de algemene camera kaart het vinkje timeline en snapshot aan zet dan
> pas alles kunnen invullen en komt er een timeline onder de kaart met de
> snapshots. Ook moet het automatisch opgeruimd worden. De timeline blijft max
> een week staan en verwijdert automatisch de laatste en overschrijft hem. Dus
> niet 10x per min een snapshot ook opslaan maar wel rekening houden met die
> cooldown."*

En één correctie, die de vorm van de motor bepaalt:

> *"je zegt voertuig dier en mens samen een rustperiode delen maar dat moet niet.
> Echt een rustperiode per detectie dus mens apart dier apart etc. Zo soort iets
> heb ik nu ook en werkt perfect."*

---

## Samenvatting

| Wat | Waar |
|---|---|
| Instellingen per camera, achter één vinkje | editor van de camerakaart |
| Detectie → beeld → timeline → melding | `custom_components/domotiapp_lovelace/bewaking/motor.py` |
| Rustperiode **per melder**, standaard 60s | `motor.py` + `const.py` |
| Wachttijd voor het beeld, standaard 0s | idem |
| Meldingen aan gekozen personen, met foto | `bewaking/meldingen.py` |
| Timeline onder de kaart, alle camera's gemengd | `src/cards/camera-card.js` |
| Opruimen: een week én 500 per camera | `bewaking/opruimen.py` |

**591 Python-tests groen, 851 JS-tests groen, alle vier de checks groen.**

## Waarom dit in de integratie zit en niet in de kaart

Een kaart bestaat alleen zolang er een dashboard openstaat. Een telefoon in een
broekzak heeft geen kaart. De keten detectie → beeld → opslag → melding draait
daarom aan de serverkant; de kaart toont wat er ligt en stelt het in.

De **config van de kaart blijft de bron.** Die staat in de YAML, reist mee als
het dashboard gekopieerd wordt, en is waar de eigenaar hem invult. De kaart
stuurt zijn regels bij het laden door naar de server, dus een dashboard dat met
de hand in de code-editor is aangepast komt er net zo goed aan.

## De rustperiode loopt PER MELDER

Dit was in het eerste ontwerp per camera, en dat is op verzoek rechtgezet. De
reden dat hij gelijk heeft: een Reolink meldt persoon, voertuig en huisdier als
drie losse `binary_sensor`-entiteiten. Dat zijn drie verschillende
gebeurtenissen. Een auto die de oprit op rijdt hoort een auto te melden, en de
bestuurder die uitstapt hoort een persoon te melden — dat tweede beeld is juist
het beeld dat je wilt hebben.

De instelling staat wél per camera; één plek om in te vullen, drie klokken die
los van elkaar lopen.

**Aangetoond op een draaiende Home Assistant** (2026.8.1, macOS, poort 8127):

```
--- 1. persoon detecteert ---
gebeurtenissen: [('nieuw', 'Persoon')]

--- 2. persoon nog eens, binnen de rustperiode ---
erbij: 0 (hoort 0 te zijn)

--- 3. VOERTUIG, binnen dezelfde rustperiode ---
erbij: 1 (hoort 1 te zijn: aparte klok per melder)
gebeurtenissen: [('nieuw', 'Persoon'), ('nieuw', 'Voertuig')]
```

De klok gaat om **vóór** het beeld wordt opgehaald en niet erna. Bij een
IP-camera duurt dat al gauw een halve seconde, en met een wachttijd erbij
langer; zou de klok pas na afloop gezet worden, dan glippen alle detecties in
dat gat er alsnog doorheen. Gevolg, en dat is bedoeld: een mislukte poging kost
ook een rustperiode, dus een camera die niet reageert wordt niet elke seconde
opnieuw geprobeerd.

## Het beeld

Met `camera.async_get_image()` en **niet** met de service `camera.snapshot`. Die
tweede schrijft naar een bestandspad en eist dat de klant
`allowlist_external_dirs` in zijn `configuration.yaml` zet. Dat is werk dat we
bij de klant niet horen neer te leggen voor iets dat de integratie zelf kan.

De jpeg's staan onder de configuratiemap in `domotiapp_lovelace/beelden/` en
**niet onder `www/`**: alles daar is voor iedereen op het netwerk op te vragen
zonder inloggen, en dit zijn beelden van de voordeur van een klant. Ze gaan naar
buiten via één view, met authenticatie, en de kaart krijgt ondertekende URL's
zodat een `<img>` zonder header toch laadt.

**Gemeten, op de draaiende instance:**

```
--- 5. het beeld ophalen zonder inloggen, met de handtekening ---
  status 200 image/jpeg 2017 bytes
  zonder handtekening: 401 (hoort 401 te zijn)
```

Het ID in het pad gaat langs een witte lijst (26 tekens uit Crockfords base32).
Wat daar niet aan voldoet wordt niet gezocht — korter dan achteraf uitzoeken of
het resultaat nog binnen de map ligt, en zonder randgevallen met symlinks of met
bestandssystemen die geen verschil zien tussen hoofd- en kleine letters.

## Opruimen

Twee grenzen, de strengste wint:

1. **Ouder dan een week gaat weg.**
2. **Hoogstens 500 per camera** (~75 MB). Voorgerekend en gekozen: met een
   rustperiode van één minuut past er in een week ruim 10.000 beelden, en dat is
   enkele gigabytes op de installatie van een klant.

De tweede grens telt **per camera** en niet over het geheel: anders zou één
drukke oprit de beelden van de achterdeur wegdrukken, en dan is de camera die
niets ziet precies de camera waarvan je niets meer terugvindt.

Ruimte maken gebeurt **vóór** het nieuwe beeld erbij komt — dat is het "en
overschrijft hem" uit de opdracht. Bij het opstarten draait er één ronde die ook
halve schrijfacties, zwerfbestanden en regels-zonder-bestand opruimt; dat zijn
alle drie gevolgen van een Home Assistant die op een ongelukkig moment omvalt.

## De timeline op de kaart

Alle camera's van de kaart door elkaar, op tijd, nieuwste eerst, met per
miniatuur welke camera het was. Nieuwe beelden komen binnen via een abonnement,
dus een wandtablet met een open kaart blijft bij zonder te pollen.

**Aangetoond in een echte Chrome, met echte kliks:**

- Nieuwe detectie verscheen zonder herladen: `["Persoon 22:58", "Voertuig 22:55",
  "Persoon 22:55"]`, en het plaatje laadde werkelijk
  (`naturalWidth: 192`) — dus de ondertekende URL werkt in een `<img>`.
- Tikken op een miniatuur opent hem groot: `isTrusted: true`, laag zichtbaar,
  onderschrift `"Oprit · Persoon · do 27 aug 22:58"`. Tikken sluit hem weer.
- Twee camera's op één kaart: `["Oprit / Persoon · 23:01", "Achterdeur /
  Voertuig · 23:01", "Oprit / Persoon · 22:58", ...]`.

## Vier dingen die de proef in de browser aan het licht bracht

Alle vier gerepareerd in dezelfde ronde.

### 1. Het voorbeeld in de editor schreef naar de server

Dit is de belangrijkste. Er stond in het commentaar dat het zichzelf zou
herstellen: annuleer je de dialoog, dan zou de echte kaart zijn eigen config er
weer overheen zetten. **Nagemeten, en dat gebeurt niet.** Het voorbeeld had
`wachttijd: 12` opgestuurd, er is op Annuleren gedrukt, en vier seconden later
stond er nog steeds 12 op de server terwijl in het dashboard 0 stond.

De reden: de echte kaart wordt bij het sluiten van de dialoog niet opnieuw
opgebouwd. `wire()` draait bij een aankoppeling en na `setConfig`, en geen van
beide gebeurt bij annuleren.

Nu schrijft het voorbeeld niets; hij toont de timeline wel. Hoe het onderscheid
gemaakt wordt, is gemeten en niet geraden:

```
echt:      hui-grid-section > hui-sections-view > hui-root >
           ha-panel-lovelace > home-assistant-main > home-assistant
voorbeeld: hui-grid-section > hui-dialog-edit-card > home-assistant
```

**Niet op `this.preview` sturen.** Dat lijkt de aangewezen vlag, maar in dezelfde
meting stond hij op **allebei** op `true`: zodra het dashboard in bewerkmodus
staat, zet Home Assistant hem ook op de echte kaart.

En die controle moet op het moment van VERSTUREN gebeuren, niet in `wire()`: op
dat moment hangt het voorbeeld nog niet in de dialoog en wijst de keten omhoog
nog nergens heen. Eerste poging deed het wel in `wire()` en schreef gewoon door.

Beide kanten daarna aangetoond: **Annuleren laat de server op 0 staan, Opslaan
zet hem op 44.**

### 2. Het label bedekte de miniatuur

Gemeten: bij 76×44 was het label 30,7 van de 44 pixels hoog. Dan is de miniatuur
een tekstvakje met een randje beeld eromheen, en een kaart hoort beeld te zijn.
Nu 104×60, met de camera als aparte kleine regel erboven.

### 3. De miniatuur toonde een andere naam dan de kiezerrij erboven

De kiezerrij zei "Achterdeur", de miniatuur eronder `127_0_0_1_2`. Kwam doordat
de timeline `nameOf` gebruikte in plaats van `camNaam_`, die ook het "Naam"-veld
en de `cam:`-velden uit de editor meeneemt.

### 4. De datum stond in het Engels

`"Thu 27 Aug"` op een Nederlandstalig dashboard: `toLocaleDateString` viel terug
op de taal van het besturingssysteem. Nu `hass.locale.language`, zoals `ha.js`
en `header-card.js` al deden.

## Wat er NIET is aangetoond

**De melding op een echte telefoon.** Op de testinstance staat geen
`mobile_app`, dus er is geen toestel om naartoe te sturen. Wat er wél vastligt,
in `tests/bewaking/test_meldingen.py`:

- de vertaling `person.sven` → `notify.mobile_app_iphone_van_sven`, langs de
  keten `device_trackers` → entity registry → config entry → `device_name` →
  `slugify(f"mobile_app_{naam}")`. Die laatste stap is niet verzonnen: de legacy
  notify-laag registreert zo (`components/notify/legacy.py:280`) en `mobile_app`
  levert zijn doelen aan als `{entry.data[ATTR_DEVICE_NAME]: webhook_id}`
  (`components/mobile_app/notify.py:148`);
- dat een dienst die niet bestaat als `None` terugkomt en niet als gok;
- dat de melding het beeld draagt in `data.image` (Android) én
  `data.attachment.url` (iOS);
- dat een telefoon die weigert de andere ontvanger niet tegenhoudt;
- dat een ontbrekend extern adres een melding **zonder** foto oplevert en niet
  géén melding.

**Vraag Sven hier actief naar.** Het is het enige stuk van de keten dat alleen
op tests en op de broncode van Home Assistant rust.

## Wat er bewust niet in zit

- **Groepen over camera's heen.** Voorgesteld en afgewezen: *"Niet werken met
  groepen. Want ik kan ook een andere camera niet instellen voor beweging
  bijvoorbeeld."* Een camera die je niet instelt doet niets, en daarmee is
  groeperen een oplossing voor een probleem dat je ook zo kunt vermijden.
- **Drie beelden per detectie.** Voorgesteld en vervallen: het botst met *"niet
  10x per min een snapshot ook opslaan"*.
- **Beelden met de hand verwijderen.** Niet gevraagd; het opruimen gaat vanzelf.

## Nieuw in de test-afhankelijkheden

`PyTurboJPEG==1.8.3`. De component `camera` importeert dat op modulescope; Home
Assistant installeert het bij de klant zelf mee (het staat in de manifest van
`camera`), de testharnas niet. De **native** `libturbojpeg` hoeft er niet bij:
HA vangt het ontbreken af met "Camera snapshot performance will be sub-optimal"
en werkt door.

## Bewijs dat er verse code gemeten is

```
bytesVanServer: 596560
hashVanServer:  334fa5d8b325beacc25916131c993b0d2adf254e70d893b4cdcb5619fdf0342d
hashOpSchijf:   334fa5d8b325beacc25916131c993b0d2adf254e70d893b4cdcb5619fdf0342d
gelijk: true
```

(gemeten met `fetch(url, {cache:'reload'})`; de uitgebrachte bundel van 0.29.0
heeft hash `abda545d…` en verschilt alleen in het versienummer)

## Aannames

Twee, allebei omdat ze niet uit de opdracht volgden en er geen kant is die
duidelijk fout is:

1. **De rustperiode geldt ook voor het opslaan**, niet alleen voor de melding.
   Binnen de rustperiode gebeurt er niets: geen beeld, geen opslag, geen
   melding. Volgt uit *"niet 10x per min een snapshot ook opslaan maar wel
   rekening houden met die cooldown"*.
2. **`alleen_afwezig` houdt alleen de MELDING tegen, niet het beeld.** De
   timeline blijft compleet; de telefoon blijft stil. Deze instelling staat
   standaard uit.
