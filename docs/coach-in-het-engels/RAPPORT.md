# 0.80.2: "Start nu" uit de stand van de coach, niet uit zijn woorden

19 oktober 2026.

## Aanleiding

De coach-sessie meldde vandaag dat DomotiApp Coach ook Engels wordt: één taal
per installatie (`installation.language`: auto, nl of en). In v0.139.0 is het
paneel Engels, en in v0.140.0 (in de maak) ook wat de coach zelf schrijft:
redenen, meldingen en de toestand van tekstsensoren. De startsensor zegt dan
"at 14:00" in plaats van "om 14:00".

Het contract met de kaarten blijft gelijk: de attribuutnamen en de vaste
waarden (`stand`, `type`, `modus`, `contract`, `entiteiten`) veranderen niet.
De vraag van de coach-sessie was of een kaart ergens toch op de tekst van een
toestand of reden beslist.

## Wat er nagelopen is

Alles wat de vaatwasser-, programma-, laadpaal- en batterijkaart van de coach
lezen (`vaatwasser-logica.js`, `programma-logica.js`, `laadpaal-logica.js`,
`batterij-logica.js`, `coach-logica.js`):

| Wat | Hoe de kaart het gebruikt | Engels |
|---|---|---|
| toestand en `reason` van laadpaal en batterij | één op één getoond, met een hoofdletter vooraan | gaat goed: dan staat er Engelse tekst |
| `stand`, `vrijgegeven`, `nu`, `modus_actief`, `planning_nu` | vaste sleutels | gaat goed |
| `start`, `klaar_om`, `klaar_om_volgende` | tijdstippen | gaat goed |
| de time-entiteit `klaar_om` | gelezen als klok ("14:00:00") | gaat goed |
| `later` ("morgen", "maandag") | letterlijk in de knop "Morgen starten" | breekt niets, maar dan staat er een Engels woord in een Nederlandse knop |
| **de toestand van de startsensor bij "nu"** | **herkend met `/^(nu\|now)$/i`** | **breekt bij elk ander woord** |

Die laatste is de enige plek waar een kaart op de woorden van de coach beslist.
Bij "nu" staat het attribuut `start` op null (de coach start hem op dit
moment), en dan bleef alleen de toestand over. Elk ander Engels woord dan "now"
("starting now", "Start now") liet "Start nu" van de kaart verdwijnen, zonder
fout. Dat is valkuil 67 in een nieuwe vorm.

## De reparatie

`startMoment` in `src/cards/vaatwasser-logica.js` kijkt nu eerst naar
`stand === "start_nu"`. Die waarde staat sinds v0.110.0 in het contract van de
coach (`programma_stand` in `sensor.py` van domotiapp-coach) en hoort bij
precies dezelfde voorwaarde als de toestand "nu". De toestand "nu" of "now"
blijft als terugval, voor een coach van vóór v0.110.0.

Een toestand `unknown` wint nog steeds van alles: dan draait hij of is er niets
gepland, ook als de stand nog achterloopt.

De coach-sessie heeft ondertussen toegezegd dat de toestand "nu" in het Engels
precies "now" wordt. Er gaat dus ook voor wie 0.80.2 nog niet heeft niets mis.
Deze reparatie zorgt dat het zo blijft als er ooit een ander woord komt.

## Tests

In `tests/js/vaatwasser-start.test.mjs`:

- **NIEUW GEDRAG**: "'nu' komt uit de stand, niet uit de woorden". Drie
  toestanden ("starting now", "Start now", "nu meteen") met `stand: "start_nu"`
  moeten allemaal het moment nu en de tekst "Start nu" geven.
- **REGRESSIEWACHT**: een Engelse tekst ("at 14:00") met het tijdstip in
  `start` geeft "Start om 14:00".
- **REGRESSIEWACHT**: `unknown` wint van de stand.

Tegen de oude code (`git archive HEAD | tar -x` naar de kladmap, met alleen
het nieuwe testbestand erin):

```
  ✖ NIEUW GEDRAG: 'nu' komt uit de stand, niet uit de woorden (0.6816ms)
  AssertionError [ERR_ASSERTION]: starting now
    actual: 0,
    expected: 1790417760000,
  ✔ REGRESSIEWACHT: een Engelse tekst met het tijdstip in start (0.1184ms)
  ✔ REGRESSIEWACHT: unknown wint van de stand (0.0662ms)
ℹ tests 31
ℹ pass 30
ℹ fail 1
```

`actual: 0` is `+null`: de oude code vond geen moment. Op de nieuwe code slagen
alle 31.

## Controles

| | |
|---|---|
| `npm run build` | 0.80.2, 1.184.393 bytes, sha256 `074fd46372b0ecc25260d337a978b2871a5b6a85dd0f69953929023f4cb5cd48` |
| `npm run verify` | OK, bundel actueel |
| `check:registratie`, `check:css`, `check:controls` | OK |
| `npm test` | 2009 van 2009 groen (was 2006) |
| Python (Docker, `python:3.14-slim`) | 876 passed (ongewijzigd, er is geen Python aangeraakt) |

## In de browser

Testinstance op poort 8127, view `miele` van `kaart-test`, de kaart
"Wasmachine met de coach". Eerst de entry herladen en de service worker en de
caches gewist. Daarna gemeten dat de code vers is:

- `?v=074fd46372b0` in `performance.getEntriesByType("resource")`, gelijk aan
  de eerste twaalf tekens van de hash op schijf;
- een verse fetch van 1.184.393 bytes, met de sha256 gelijk aan schijf.

Daarna de startsensor van de nagebootste coach (`sensor.wasmachine_start`) met
`POST /api/states` op een Engelse tekst gezet, en de `aria-label` van de kop
van de kaart gelezen:

| startsensor | kaart zegt |
|---|---|
| zoals hij stond (`unknown`, `niet_vrijgegeven`) | Wasmachine, Deur open · laatste beurt … |
| "starting now", stand `gepland`, `start` null | Wasmachine, Deur open · laatste beurt … |
| "starting now", stand `start_nu`, `start` null | Wasmachine, **Start nu** · laatste beurt … |
| "at 22:00", stand `gepland`, `start` om 22:00 | Wasmachine, **Start om 22:00** · laatste beurt … |
| teruggezet | Wasmachine, Deur open · laatste beurt … |

De tweede regel laat zien dat de tekst alleen niets meer beslist. "Deur open"
komt van de nagebootste Miele, waarvan de deur openstaat.

## Samenvatting

De coach wordt Engels, en de kaarten lezen hem op één plek na op vaste
sleutels en tijdstippen. Die ene plek was "Start nu" op de vaatwasser- en
programmakaart: die herkende "nu" aan de toestandstekst. Sinds 0.80.2 komt het
uit `stand: "start_nu"`, en de tekst is alleen nog terugval voor een oude
coach. Met een nieuwe test die op de oude code faalt, en gemeten in een echte
browser met Engelse tekst op de startsensor.

## Wat niet lukte

- Niet gemeten tegen een echte coach in het Engels: v0.140.0 is nog niet uit.
  Gemeten is met de nagebootste coach, met de tekst met de hand gezet.
- Of de kaarten zelf ook Engels moeten, is niet beantwoord. Dat is een keuze
  van de eigenaar, en de coach-sessie legt hem die voor. Zolang de kaarten
  Nederlands zijn, staat bij een Engelse coach Engelse tekst (de reden, de
  toestand van laadpaal en batterij, het woord `later`) in een verder
  Nederlandse kaart.

## Aannames

- `stand === "start_nu"` hoort bij precies dezelfde situatie als de toestand
  "nu". Gelezen in `sensor.py` van domotiapp-coach (main, v0.139.1):
  `start_tekst` geeft "nu" en `programma_stand` geeft "start_nu" bij dezelfde
  toets (`rule in NU_STARTEN and charge`). Het enige verschil: `programma_stand`
  zegt eerst "niet_vrijgegeven" als hij niet vrijgegeven is. In dat geval
  start de coach hem niet, en dan is geen "Start nu" juist goed.

## git status --porcelain

```
(leeg na de commit)
```
