# Tien iconen, en de tv die niet op nul stond

Ronde van 27 augustus 2026 — uitgave **0.28.0**. Tien iconen, in drie berichten
achter elkaar gevraagd, plus een melding over de mediakaart.

| icoon | waarvoor | waarom geen bestaand icoon |
|---|---|---|
| `eettafel` | de eetkamer | `desk` is het bureau: een la, tegen de muur |
| `veranda` | een overkapping in de tuin | `awning` is het zonnescherm aan de gevel |
| `pollenradar` | de pollenverwachting | radarringen, geen bloem — dit is de verwachting |
| `gras` | graspollen | — |
| `kruiden` | kruidpollen (bijvoet) | — |
| `circulatiepomp` | de cv-pomp | `heatPump` is de warmtepomp buiten |
| `koelkast` | koelkast en vriezer | — |
| `oven` | de oven | — |
| `magnetron` | de magnetron | breder dan hoog, anders dan `oven` |
| `handmatig` | met de hand bedienen | het tegenovergestelde van "de automatisering doet het" |

Voor **boompollen** is er niets bijgekomen: `tree` stond er al en doet precies
dat.

## Twee iconen zijn opnieuw getekend nadat ze op ware grootte waren bekeken

Dit is het deel dat het opschrijven waard is.

`gras` en `kruiden` waren als tekening in orde: sprieten met aren, en een steel
met geveerde blaadjes. Op **twintig pixels** — de maat waarop ze op een kaart
staan — las de eerste als een sterretje en de tweede als een schroef.

Ze zijn opnieuw getekend met minder lijnen en meer verschil:

- **gras**: sprieten die uit een grondlijn omhoogkomen, recht en dun;
- **kruiden**: een takje met drie brede blaadjes, rond en vol.

Dat verschil doet ertoe omdat ze op een pollenkaart naast elkaar komen te staan,
naast `tree`. Nu zijn het drie duidelijk verschillende vormen: een driehoek, een
rechte spriet, en een rond takje.

**De bewaker op de icoonset controleert dit niet.** Die eist dat elk getekend
icoon een plek in het raster en zoekwoorden heeft — niet of het leesbaar is. Dat
blijft handwerk, en het is precies waarom deze ronde in een echte browser is
bekeken en niet alleen gebouwd.

## Waar ze staan

Alle tien staan in de icoonkiezer, in de groep waar je ze zoekt: Kamers, Buiten,
Weermetingen, Verwarming en klimaat, Apparaten, Status. Met Nederlandse
zoekwoorden — "hooikoorts" vindt de drie pollensoorten, "cv-pomp" de
circulatiepomp, "combimagnetron" de magnetron.

## Gemeten in een echte browser

Alle tien naast elkaar op een entiteitenkaart, op ware grootte, en daarna nog een
keer met de buren erbij waar ze mee verward konden worden (`desk`, `leaf`,
`tree`, `awning`).

---

## De tv-ontvanger die "0%" toonde

> *"Als ik een mediabox heb en geen speaker heb geselecteerd, staat het geluid op
> nul, maar dan speelt het tv-geluid — dus dan moet dat weg."*

Met een schermafdruk van zijn televisiekaart: *RTL Nieuws - 18:00 uur · RTL 4*,
de knoppen, en daaronder **0%** naast de bronknop.

### Wat er misging

Zijn kastje meldt geen `volume_level` — het kán er ook niets mee, het geluid komt
uit de televisie. Maar `volumePct` maakt van een ontbrekende waarde een 0:

```js
Math.round(... Number(st?.attributes?.volume_level ?? 0) ... * 100)   // -> 0
```

En het percentage werd altijd meegerenderd, ook als er geen schuif en geen
stapjesknoppen waren. Dus stond er "0%" terwijl de tv gewoon geluid gaf.

Dat is niet alleen lelijk maar ook **onwaar**. Het geluid komt van de televisie,
en die staat niet op nul.

### Wat er nu gebeurt

Er is een `heeftVolume()` bij: kent deze speler zijn volume écht? Het percentage
verschijnt alleen als dat zo is én er ook iets te regelen valt.

**Een volume van nul is iets anders dan geen volume.** Een speaker die je zelf op
nul hebt gezet toont nog steeds "0%" — dat is waar, en dat moet blijven staan.
Dat verschil zit als aparte test vast.

### Het bewijs dat de test de bug vangt

```
OUDE CODE, zijn mediabox zonder volume_level:
  heeftVolume bestaat?   undefined
  volumePct(box)         0        <- dit stond er op de kaart

NIEUWE CODE:
  heeftVolume(box)       false    <- dus geen percentage
  een speaker op nul     true     <- die toont wel 0%
```

## Wat niet lukte

- **De mediafix is niet met zijn eigen tv-ontvanger gemeten.** Die staat hier
  niet. De situatie is nagebouwd met precies wat zijn kastje meldt: een speler
  die speelt, een bron kent, en geen `volume_level` heeft.

## Aannames

- De drie pollensoorten (boom, gras, kruiden) zijn de indeling die Nederlandse
  pollenradars aanhouden. Als hij een vierde nodig heeft, is dat een icoon erbij.

## Tellingen

- **157 getekende iconen** (was 147).
- **833 JS-tests** groen; `check:css` en `check:registratie` OK.
- Versie 0.28.0.

## git status --porcelain

Zie de PR; de werkmap is bij het uitbrengen schoon.
