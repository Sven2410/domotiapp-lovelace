# 0.109.0: de camera op de meldingenkaart

De eigenaar op 6 november 2026: *"Ik wil eerst dat je een koppeling maakt tussen de camera kaart met meldingen en de
meldingen kaart. Ik wil per persoon kunnen aanvinken wie welke meldingen krijgt."*

## Wat er nu is

**Op de meldingenkaart staat een derde soort: Camerameldingen** (`camera: true` in de editor, naast Afval en
Robotstofzuiger). In de pop-up van een persoon staat dan:

- het vinkje **Camerameldingen**: krijgt deze persoon ze;
- **Van welke camera**: de camera's van de camerakaarten met Snapshots en meldingen aan (alleen bij meer dan één);
- **Waarover**: mens, dier, voertuig, aanbellen, ontgrendeling of beweging, alleen de soorten die bij die camera's
  voorkomen (alleen bij meer dan één).

Elk vinkje werkt meteen, zonder Opslaan, net als bij afval en de stofzuiger. De proefknop stuurt ook een cameramelding,
met het laatste beeld, alleen naar die persoon.

## Wat waar beslist wordt

| | waar |
|---|---|
| wat er vastgelegd wordt: melders, rustperiode, wachttijd, alleen als er niemand thuis is, de stilschakelaar | de camerakaart, zoals het was |
| wie het op zijn telefoon krijgt, per camera en waarover | de meldingenkaart, voor wie erop staat |
| wie NIET op de meldingenkaart staat | de camerakaart (`snapshot_ontvangers`), zoals het was |

**Koppelen verandert niets aan wie er nu iets krijgt.** Wie nog niets koos, krijgt wat hij van de camerakaart al kreeg: aan
als hij daar ontvanger was, en dan die camera's. Bij afval en de stofzuiger staat een nieuwe persoon standaard aan; hier
niet, met opzet: op een meldingenkaart staat vaak het hele huishouden, en wie Camera aanzet hoort niet elke beweging op
de oprit naar alle telefoons te sturen. Zet iemand het zelf aan zonder ergens ontvanger te zijn, dan krijgt hij alle
camera's. Een huis zonder meldingenkaart met Camera merkt niets.

## Hoe

- **Serverkant** (`meldingen/camera.py`, pure functies): `keuze` rekent per persoon uit wat hij krijgt (zijn eigen keuze,
  anders de standaard uit de camerakaart), `ontvangers` wie een melding van één regel en één melder krijgt. De
  bewakingsmotor vraagt het aan de meldingenmotor (`camera_ontvangers`); zijn de meldingen niet geladen, dan blijft het de
  camerakaart.
- **De soort per melder** gaat sinds deze versie mee in de regel van de camerakaart (`soorten`): wat er in de editor
  gekozen is, anders geraden, zoals de filterknoppen het doen. Een melder zonder soort telt bij de meldingen als
  beweging, anders kan wie alleen "Aanbellen" wil de gewone bewegingsmelder niet uitzetten. Op de camerakaart zelf
  verandert daar niets aan (geen filterknop voor iets wat niemand instelde).
- **De stand van de camera** (`meldingen/subscribe` met `camera`) heeft de camera's en soorten om uit te kiezen, en per
  persoon wat hij KRIJGT, ook zonder keuze. De kaart rekent de standaard niet zelf na: die volgt de camerakaart, en die
  kent hij niet.
- **Camera's worden als hele lijst bewaard**, nooit als "alles": "alles" valt op de server terug op de standaard, en die
  is niet altijd alles. Soorten wel als "alles" (`null`), want daar is de standaard alles.
- Een opgeslagen camerakaart werkt een open meldingenkaart meteen bij.

## Gemeten

### In een echte browser (Playwright, testinstance op 8127)

Een view met een camerakaart (twee demo-camera's; Persoon oprit en Deurbel bij de eerste, Auto oprit bij de tweede;
ontvanger alleen de beheerder, rustperiode 0) en een meldingenkaart met de beheerder en een tweede persoon, Camera aan.
Beide telefoons zijn `notify.persistent_notification`; geteld is elke aanroep van notify.

```
BUNDEL schijf fee687e10b92 geladen ["fee687e10b92"]
REGELS demo_camera: soorten {persoon_oprit: mens, deurbel: aanbellen}; demo_camera_png: {auto_oprit: voertuig}
STAND BEGIN aan {beheerder: true, tweede: false}
1 deurbel, niemand koos iets:              ["Deurbel"]                          (alleen de beheerder, zoals voorheen)
POPUP (echte klik op de rij)               Camerameldingen uit; "Van welke camera", "Waarover"
  echte klik op Camerameldingen
2 deurbel, ook de tweede aan:              ["Deurbel","Deurbel"]
  echte kliks: Aanbellen uit, Demo camera png uit
POPUP  regel "Mens en voertuig · Demo camera"
3 deurbel (tweede wil geen aanbellen):     ["Deurbel"]
4 persoon (allebei):                       ["Persoon oprit","Persoon oprit"]
5 auto op camera 2 (tweede niet):          ["Auto oprit"]
KLIKS isTrusted: true, true, true, true (rij, Camerameldingen, Aanbellen, Demo camera png)
fouten []
```

**Na een echte herstart** van de testinstance (`pm2 restart`) gaf de stand dezelfde keuzes terug: de tweede aan, alleen
de eerste camera, mens en voertuig.

### Tests

- `tests/bewaking/test_meldingenkaart.py`: 13 tests (de pure regels, de motor met de meldingenkaart, de stand, een
  herstart van de opslag, de proef).
- `tests/js/meldingen-camera.test.mjs`: 8 tests (de soort, de keuzes, de regel in de pop-up, de soort per melder uit de
  camerakaart).

Tegen de code van `main`: de JS-tests vallen allemaal om. De Python-tests vallen om bij het importeren van
`meldingen.camera`; zonder die import (en zonder `soorten` in de regel) vallen de vijf gedragstests om
(`beslist`, `uitvinkt`, `stand_zegt`, `herstart`, `proef`) en slaagt de REGRESSIEWACHT
`zonder_camera_op_de_meldingenkaart_blijft_het_zoals_het_was`, zoals het hoort.

Alles: 1107 Python-tests, 2320 JS-tests, `verify`, `check:taal`, `check:css`, `check:controls`, `check:registratie`
groen.

## Samenvatting

De meldingenkaart heeft een soort Camerameldingen. Ieder op die kaart vinkt zelf aan of hij camerameldingen krijgt, van
welke camera en waarover. Wie nog niets koos, krijgt wat de camerakaart hem al gaf; wie niet op de meldingenkaart staat,
houdt de camerakaart.

## Wat niet lukte

Niets. Niet gemeten op een echte telefoon: de testinstance heeft geen app van Home Assistant, dus de melding zelf (met
beeld) is alleen als aanroep van notify geteld. Het versturen zelf is ongewijzigd (`bewaking/meldingen.py`).

## Aannames

- Een melder zonder soort telt bij de meldingen als beweging (zie hierboven waarom).
- Wie zelf Camerameldingen aanzet zonder ergens ontvanger te zijn, krijgt alle camera's.
- Een camerakaart moet één keer geladen zijn (op een dashboard, niet in de editor) om de soorten door te geven; tot dan
  telt elke melder als beweging. De camerakaart doet dat bij het laden vanzelf.

## git status --porcelain

Bij het schrijven van dit rapport, vóór de commit:

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/bewaking/const.py
 M custom_components/domotiapp_lovelace/bewaking/motor.py
 M custom_components/domotiapp_lovelace/bewaking/store.py
 M custom_components/domotiapp_lovelace/bewaking/websocket.py
 M custom_components/domotiapp_lovelace/engels/meldingen.json
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M custom_components/domotiapp_lovelace/meldingen/const.py
 M custom_components/domotiapp_lovelace/meldingen/kaarten.py
 M custom_components/domotiapp_lovelace/meldingen/motor.py
 M custom_components/domotiapp_lovelace/meldingen/store.py
 M custom_components/domotiapp_lovelace/meldingen/websocket.py
 M src/cards/bewaking-logica.js
 M src/cards/camera-card.js
 M src/cards/meldingen-card.js
 M src/cards/meldingen-logica.js
 M src/i18n/en/camera.js
 M src/i18n/en/meldingen.js
?? custom_components/domotiapp_lovelace/meldingen/camera.py
?? docs/camera-op-de-meldingenkaart/
?? tests/bewaking/test_meldingenkaart.py
?? tests/js/meldingen-camera.test.mjs
```
