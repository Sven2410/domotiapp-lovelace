# Zonsopkomst en zonsondergang op de weerstationkaart (0.106.0)

4 november 2026, tak `fase-155/zon-op-het-weerstation`. Een wens van de eigenaar, via een beheersessie: "ook wil ik de
eniteiten zon opkomst en zons ondergang in de weerstation kaart die 2 entiteiten gewoon kunnen invullen van de zon
integratie".

## Samenvatting

- **Twee velden in de editor**, Zonsopkomst en Zonsondergang, onder de eenheid van de wind en boven "Sensoren met de hand
  kiezen". Een sensor met een tijdstip (`sensor.sun_next_rising`, `sensor.sun_next_setting`) of `sun.sun`, dan met het
  tijdstip uit `next_rising` of `next_setting`.
- **Leeg is niet op de kaart.** De zon hangt niet aan het apparaat van het station, dus de kaart zoekt hem niet zelf. Een
  kaart die er al stond, blijft zoals hij was.
- **Twee tegels**, achter de luchtdruk. Een tik opent de entiteit.
- **De tijd van Home Assistant, niet die van het toestel** (`naarWand` uit `wandklok.js`, net als het infoscherm). Het is
  altijd de VOLGENDE zonsopkomst: na zonsopkomst staat er die van morgen, en dan staat er "morgen" onder. Verder weg: de
  dag van de week.

Het rekenwerk staat in `zonTekst` in `weerstation-logica.js`.

## Gemeten

**De proeven.** `tests/js/weerstation-logica.test.mjs` heeft 5 nieuwe proeven (NIEUW GEDRAG). Ze slagen met de machine op
UTC, Londen en Los Angeles. Op 0.105.0 falen ze alle 5: `zonTekst` bestaat daar niet.

| | |
|---|---|
| JS | 2298 groen |
| Python | 1094 groen |
| `verify`, `check:taal`, `check:css`, `check:controls`, `check:registratie` | groen |

**In de testinstance**, met Playwright headless, als beheerder, in een browser op `Europe/London` (13:49). Home Assistant
staat op `Europe/Amsterdam`. De kaart op view `weerstation` kreeg `zonsopkomst: sensor.sun_next_rising` en
`zonsondergang: sun.sun`, zodat allebei de vormen gemeten zijn. De bundel in de pagina (`15bd2d7cf47f`) was gelijk aan die
op schijf.

| | zon-integratie | op de kaart |
|---|---|---|
| zonsopkomst | `2026-11-05T06:37:41+00:00` | **07:37**, "morgen" |
| zonsondergang | `2026-11-04T16:01:53+00:00` | **17:01** |

Op de klok van het toestel was het 06:37 en 16:01 geweest. Een echte klik op de tegel Zonsondergang
(`isTrusted: true`) gaf `hass-more-info` voor `sun.sun`, vanuit de kaart. De editor (de echte `ha-form`) toont de twee
velden met hun waarde en hulptekst.

## Wat niet lukte

- De editor is gemeten met de hand in de pagina gehangen, niet in de dialoog van Home Assistant. Daar gaven de
  entiteitkiezers fouten over `localize`, omdat ze buiten de dialoog staan. Vóór het ophangen van de editor stonden er 0
  fouten in de pagina.
- De pagina herlaadde één keer kort na het openen. Dat is `verouderd.js` na het herladen van de integratie, en zo
  hoort het (valkuil 30). Na die herlaadbeurt is de klik gemeten.

## Aannames

- Geen standaardwaarde. De eigenaar zei "gewoon kunnen invullen", en vanzelf twee tegels toevoegen zou elke kaart bij
  elke klant veranderen.
- De tijd in 24 uur (`07:37`), zoals de klok van het infoscherm.

## git status --porcelain

```
(schoon na de commit)
```
