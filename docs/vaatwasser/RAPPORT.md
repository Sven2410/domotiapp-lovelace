# De vaatwasserkaart

25 augustus 2026.

> "ook wil ik een vaatwasser kaart hebben. opties die ik kan invullen: [zie
> afbeelding] dit is een kaart die ik ooit had gemaakt maar ik wil hem mooier en
> in mijn thema. Ook een animatie van dat hij aan staat en een progress bar voor
> de tijd"

---

## Dezelfde velden als zijn oude kaart

Uit de schermafdruk van de "Ultimate Dishwasher"-editor, één op één overgenomen:

| Zijn veld | Hier |
|---|---|
| Status sensor | `status` |
| Resterende tijd sensor | `remaining` |
| Voortgang sensor (optioneel, 0-100%) | `progress` |
| Programma selector | `program` |
| Start / Pauze knop | `start` |
| Stop knop | `stop` |
| Klep / deur sensor | `door` |
| Slim schakelen entity | `smart` |

De twee losse aan/uit-schakelaars uit zijn editor ("Klep / deur sensor",
"Slimme sturing knop") zijn weg: een entiteit invullen ís de schakelaar, en
twee plekken waar hetzelfde aan of uit staat is er één te veel.

Alles behalve de status is optioneel. Zonder programmakeuze en zonder knoppen
blijft er een kop met een balk over, en dan is de kaart één rasterrij lager.

## De twee dingen die hij erbij wilde

**De voortgangsbalk.** Een dunne balk onder de kop, met een verloop in de
accentkleur. Hij staat er zolang er een programma **loopt** — draait,
gepauzeerd of uitgesteld — en niet zodra de sensor toevallig een getal heeft.
Dat verschil is er omdat de voortgangssensor zijn laatste waarde vasthoudt: een
balk op 38% naast het woord "Uit" leest als "gepauzeerd op 38%", terwijl er
niets aan de hand is.

**De animatie.** Er loopt een glans over de balk zolang hij draait. Is er geen
voortgangssensor, dan schuift er in plaats daarvan een streepje heen en weer —
dan is er geen stand, maar wél iets te melden.

De animatie hangt aan de **balk** en niet aan het icoon. Een draaiend icoon
trekt aandacht van een afstand, en dat is precies wat een vaatwasser niet
verdient: er is niets aan de hand, hij doet gewoon zijn werk.

## Gemeten in de echte instance

Met acht nagemaakte entiteiten (status, resterende tijd, voortgang, programma,
start, stop, klep, slim):

```
hoogte in elke stand              120px = 2 rasterrijen, min_rows 2
achtergrond van de programmakeuze rgb(18, 18, 15)   (ondoorzichtig)

klik op "Slim"    isTrusted: true   input_boolean  on -> off, knopmarkering volgde
klik op "Start"   isTrusted: true   input_button   unknown -> een tijdstempel

de rangorde, gemeten door de standen om te zetten
  Run  + klep open    -> "Draait · nog 1 u 24 min"   <- draait wint
  Ready + klep open   -> "Klep open"
  Ready + klep dicht  -> "Klaar om te starten"
  Finished            -> "Programma klaar"
  Inactive            -> "Uit",        balk verdwijnt
  Pause               -> "Gepauzeerd", balk blijft
```

En de animatie, met de twee `prefers-reduced-motion`-regels tijdelijk uit de
stylesheet gehaald en meteen weer teruggezet:

```
met voortgangssensor      animation: glans     2.4s  infinite   (1 lopende animatie)
zonder voortgangssensor   animation: heenweer  2.6s
met bewegingen uit        animation: none                        <- deze Chrome
```

Deze Chrome staat op `prefers-reduced-motion: reduce`, dus de bewegende toestand
is niet als schermafdruk vast te leggen — de meting hierboven is het bewijs, en
tegelijk het bewijs dat de rem werkt.

## Twee fouten die de tests vingen vóór de browser

Allebei echte fouten in de bron, geen fouten in de test:

1. **`Inactive` bevat `active`.** Op "bevat" vergelijken maakte van een
   uitgeschakelde vaatwasser een draaiende, compleet met animatie. Hetzelfde
   geldt voor `off` en `on`. De toestand wordt nu op **hele woorden** geknipt:
   `BSH.Common.EnumType.OperationState.Run` levert het woord `run` op, en
   `Inactive` levert `inactive` op — geen `active`.
2. **`Number("")` is 0.** Een voortgangssensor die nog niets weet, toonde een
   balk op nul, en dat leest als "hij is net begonnen".

## Eén afwijking van zijn oude kaart, met opzet

Zijn kaart had een **groene** Start. Groen is in deze familie gereserveerd voor
de status "goed" (zie de kop van `theme.js`), en een startknop is geen status.
Start draagt daarom het accent. Rood blijft wél op Stop staan: dat is een
waarschuwing en geen identiteit, en een stopknop die eruitziet als de rest is
een stopknop die je per ongeluk indrukt.

## Vier vormen resterende tijd

Dit is waar zo'n kaart stilletjes op stukloopt, en waarom het in een eigen
bestand met tests staat:

| Wat de sensor meldt | Hoe het gelezen wordt |
|---|---|
| `2026-08-25T19:24:00Z` (`device_class: timestamp`) | het MOMENT waarop hij klaar is, niet een duur |
| `1:24:00` of `01:24` | een klok |
| `84` met `unit_of_measurement: min` | minuten |
| `5040` met `s`, `1.5` met `h` | omgerekend |

Een tijdstip als minuten lezen geeft "nog 1970 uur". Dat is precies het soort
fout dat je pas ziet als de vaat er al uit had gemoeten.

## Tests

```
npm test                   485 tests, 485 pass, 0 fail
npm run check:registratie  OK
npm run check:controls     OK  (nu 2 keuzelijsten op kaarten)
npm run verify             OK
```

`tests/js/vaatwasser-logica.test.mjs` is nieuw (**NIEUW GEDRAG**).
`scripts/check-controls.mjs` bewaakt nu een LIJST van kaartbestanden in plaats
van er één: de keuzelijst op de vaatwasserkaart is de tweede plek waar de fout
van fase 12 kon terugkomen, en dat mag geen bewaker zijn die je bij elke nieuwe
select moet uitbreiden zonder het te merken.

## Wat niet lukte

- De bewegende balk staat niet op een schermafdruk: deze browser heeft
  bewegingen uitgezet. De animatie is in plaats daarvan uit de opmaak gemeten.

## Aannames

- **`start` is één knop en geen aparte pauzeknop.** Zijn veld heet "Start /
  Pauze knop", en bij Bosch is dat één entiteit die beide doet. De kaart drukt
  hem in; wat de machine ervan maakt is aan de machine.
- De statussensor mag alles zijn wat een woord meldt. In de test is dat een
  `input_select`; de kaart kijkt alleen naar de toestand.
