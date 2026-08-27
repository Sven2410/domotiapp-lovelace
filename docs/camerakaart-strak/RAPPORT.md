# De camerakaart strak: geen lege ruimte, melders per camera, en een eigen icoon

Ronde van 27 augustus 2026 — uitgave **0.23.0**. Vier meldingen, allemaal over de
camerakaart, plus een icoon.

---

## 1. "Nog steeds veel ruimte aan de onderkant"

Met een schermafdruk uit zijn beveiligingspop-up: onder de camerakiezer stond een
lege strook van tientallen pixels.

### Waar die vandaan kwam

Elke kaart in deze familie duwt zijn inhoud op naar een rasterhoogte — 56, 120,
184, 248 — zodat een DomotiApp-kaart naast een Mushroom-kaart in dezelfde kolom
blijft uitlijnen. Zie `rasterhoogte.js`.

Bij deze kaart werkt dat niet meer, en het hoeft ook niet:

- **Het kan niet.** Sinds de vaste 16:9 eraf moest (er ging beeld verloren, zie
  0.22.0) bepaalt de camera de hoogte. Die is willekeurig — dus uitlijnen op een
  raster betekent per definitie een strook lege ruimte erbij.
- **Het hoeft niet.** Hij kijkt ernaar in een Bubble Card-pop-up, en daar is
  helemaal geen raster om op uit te lijnen. Die strook was puur verlies.

### De reparatie

De `min-height` van `--dac-raster` is eraf. `meetRaster` blijft wél draaien, want
`min_rows` heeft die meting nodig: zonder eerlijke ondergrens mag het
formaatgreepje het vak kleiner slepen dan de inhoud, en dan schildert de kaart
over zijn buurman heen (valkuil 12).

**Deze kaart is daarmee de enige uitzondering op de rasterregel**, en dat staat
met de reden erbij in `getGridOptions()`.

### Gemeten

```
kaarthoogte:          397px
beeld plus kiezer:    395px
LEGE RUIMTE ONDER:      1px    (de rand)
min-height op de kaart:  0px    (was var(--dac-raster))
```

---

## 2. "De geselecteerde mogelijkheden staan veel te dicht op de camera"

De camerakiezer plakte tegen de onderrand van het beeld: hij had wel ruimte
onder zich, maar niet erboven. Nu 11px aan beide kanten.

---

## 3. Bewegingsmelders bij meerdere camera's

> *"Er moet iets bedacht worden op de bewegingsmelders als ik meerdere camera's
> heb."*

Terecht: alle melders hoorden bij alle camera's, dus wisselde je naar de tuin en
zag je nog steeds het merkje van de oprit.

### Hoe de koppeling nu gelegd wordt

Drie stappen, van zeker naar behulpzaam:

1. **Wat je zelf instelt.** Per melder is er een keuze "hoort bij welke camera",
   die alleen verschijnt zodra er meer dan één camera op de kaart staat.
2. **Hetzelfde APPARAAT.** Een Reolink is één apparaat met de camera én zijn
   `_person`, `_vehicle` en `_pet` eraan. Home Assistant geeft die koppeling mee
   aan de frontend (`hass.entities[id].device_id`) — nagemeten in de
   testinstance, 76 van de 109 entiteiten hebben er een. **Bij een Reolink hoeft
   hij dus niets in te vullen.**
3. **Niets te vinden?** Dan hoort de melder bij alle camera's. Met opzet: een
   melder die je hebt ingesteld en die nergens meer verschijnt is erger dan
   eentje die een keer te vaak verschijnt.

**Niet op de naam matchen.** `camera.oprit` en `binary_sensor.oprit_person`
lijken op elkaar, maar dat hangt volledig af van hoe iemand zijn entiteiten heeft
hernoemd. Het apparaat is een feit, een naam is een gewoonte.

Twee camera's op één apparaat — een dual-lens — laat de vraag open en valt terug
op "bij allemaal". De eerste pakken zou een gok zijn.

### Gemeten in een echte browser

Melder gekoppeld aan camera 1, daarna heen en weer gewisseld:

```
bij camera 1:  ["Persoon"]
bij camera 2:  []
terug:         ["Persoon"]
```

---

## 4. Een 3D-printer-icoon

> *"En ik wil een 3D-printer-icoon."*

Er was er een, maar dat is een papierprinter — op een kaart voor een Bambu Lab
leest dat verkeerd. Er staat nu `printer3d` naast: het frame, het bed, de
portaalbrug en de nozzle. Hij is de standaard op de printerkaart en staat in de
icoonkiezer onder Apparaten, te vinden op "3d printer", "bambu", "prusa",
"filament" en "nozzle".

De bewaker op de icoonset ving dat meteen: een getekend icoon zonder plek in het
raster en zonder zoekwoorden is een fout.

---

---

## 5. "Hij springt steeds weg als ik type"

Over het fotoveld van de autokaart. Gereproduceerd en gerepareerd, en de oorzaak
is er eentje om te onthouden.

### `document.activeElement` wijst nooit naar een genest element

De fotokiezer overschrijft zijn tekstveld niet zolang je erin bezig bent — dat
stond er, met deze toets:

```js
if (document.activeElement !== this && tekst.value !== this.value) ...
```

Die toets slaat **nooit** aan. Bij focus binnen geneste shadow roots wijst
`document.activeElement` het BUITENSTE host-element aan; gemeten in de dialoog
gaf hij `home-assistant`, nooit de picker. Dus was de voorwaarde altijd waar en
werd het veld altijd overschreven.

### Waarom het hier wél leek te werken

De editor geeft de picker bij **elke nieuwe `hass`** zijn waarde uit de config
opnieuw. Op de kale testinstance komt er zelden een update binnen, dus twintig
echte toetsaanslagen — spatie erbij, `isTrusted: true` — gingen hier gewoon goed.

Op zijn installatie met 479 componenten komt er meerdere keren per seconde een
update. Dan is het veld onbruikbaar.

**Dat verschil is de les**: een editorveld dat op een lege testinstance werkt,
zegt niets. De juiste toets is het aantal `hass`-updates opvoeren.

### Gereproduceerd, en daarna gerepareerd

Dezelfde proef, met de bundel ervoor en erna:

```
VOOR:  wat ik typte      "ik ben aan het typen"
       wat er daarna stond  "/local/mijn auto.png"     <- overschreven
       MIJN_TEKST_WEG: true

NA:    na twintig updates   "ik ben aan het typen"
       TEKST_BLIJFT_STAAN: true
       focus nog in het veld: true
```

`shadowRoot.activeElement` kijkt wél binnen de eigen root, en dat is de toets die
er nu staat.

---

## 6. De foto van de auto werd afgesneden

Met een schermafdruk waarop het dak van zijn Ford Transit Connect eraf was.

Precies dezelfde fout als op de camerakaart, en één die ik daar al had
gerepareerd: de grote foto stond op `aspect-ratio: 16/7` met `object-fit: cover`.
Een foto met een andere verhouding verliest dan zijn boven- en onderkant.

Nu bepaalt de foto zijn eigen hoogte. Gemeten met een testafbeelding van 400x300:

```
breedte 474, hoogte 357  ->  verhouding 1.330
verwacht bij 4:3         ->            1.333
VOLLEDIG_ZICHTBAAR: true
```

Vóór de reparatie was dat 2,29 geweest — de 16:7 die eroverheen stond.

---

## 7. Een bedrijfsbus-icoon

> *"Ook wil ik een icoon hebben voor bedrijfsbus."*

`van`: hoge neus, lange laadbak, schuifdeur. Te vinden op "bus", "bedrijfsbus",
"bestelbus", "bestelwagen", "busje", "transit", "camper" en "werkbus". Hij rijdt
een Ford Transit Connect, en `car` leest als een personenauto.

## Wat niet lukte

- **De automatische koppeling op apparaat is niet met een echte Reolink
  beproefd.** De demo-camera's in de testinstance staan niet in het
  entiteitenregister en hebben dus geen `device_id`. Wat wél is aangetoond: dat
  Home Assistant dat veld aan de frontend meegeeft (76 entiteiten hier), en dat
  de handmatige koppeling met een echte klik werkt. Bij hem valt het zonder
  apparaat-koppeling netjes terug op "bij alle camera's" — dus er gaat niets
  stuk, hoogstens verschijnt een melder een keer te vaak.
- **De lege ruimte is gemeten in een gewone sectie, niet in zijn Bubble Card.**
  Die staat niet in de testinstance. In een sectie is de kaart nu 1px groter dan
  zijn inhoud; in een pop-up kan er niets bijkomen, want er is geen raster.

## Aannames

- Zijn camera's en melders zitten op hetzelfde HA-apparaat. Bij Reolink, Amcrest,
  Dahua en ONVIF is dat zo; bij een eigen sjabloonsensor niet, en daar is de
  handmatige keuze voor.

## Tellingen

- **809 JS-tests** groen, **538 Python-tests** groen.
- `verify`, `check:css` en `check:registratie`: alle drie OK.
- Versie 0.23.0.

## git status --porcelain

Zie de PR; de werkmap is bij het uitbrengen schoon.
