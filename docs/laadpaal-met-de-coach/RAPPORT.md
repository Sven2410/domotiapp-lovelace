# 0.59.0 — De laadpaalkaart, met DomotiApp Coach

**Nog niet uitgebracht.** De kaart leest drie attributen die de coach pas in
v0.111.1 levert (`modus_actief`, `modus_keuzes`, `planning_nu`). Afgesproken is
dat er niets uitgaat dat een nieuw attribuut leest voordat het in een echte
dump van de coach heeft gestaan. De rest is nagelopen tegen de echte dump van
v0.111.0.

## De vraag

11 oktober 2026, via de coach-sessie: *"mooi strak moderne kaart met een
afbeelding van de laadpaal en de noodzakelijke sensoren en aansturingsknoppen
en instellingen zoals schema etc."*, voor in een bubble-pop-up, zodat klanten
niet telkens naar de coach hoeven. Erachteraan: *"in de laadpaal kaart moet ook
de batterij % komen van de auto"*, groot, met het doel erbij.

De foto's: *"ik heb toestemming gekregen omdat ik installateur ben mag ik
product foto's gebruiken."* In de editor een keuzelijst met de vier modellen,
plus een eigen afbeelding.

## Wat er gebouwd is

`custom:domotiapp-laadpaal-card`, met een lege config bruikbaar: de kaart zoekt
zelf de enige laadpaal van de coach.

Van boven naar beneden:

1. **De kop:** de foto van de paal, de naam, de stand van de coach in zijn eigen
   woorden met het icoon van de stand (alleen het icoon draagt de kleur), en
   waarom. Rechts **de accustand van de auto, groot**: "62%", met "→ 80%" en de
   actieradius eronder ("± 62%" als de coach schat).
2. **De accubalk** met een streepje op het doel, en daaronder: verwacht klaar,
   nog zoveel kWh, het vermogen nu en de stroom.
3. **De modus:** Planning / Snel / Continu / Zon. Alleen de knoppen die NU
   iets doen: met een planning voor vandaag zijn dat Planning en Snel, net als
   in het paneel. Aan staat wat er echt geldt (`modus_actief`), niet de
   voorkeur van de paal. Daaronder **Pauze** en **Schema**, en een zin als iets
   per beurt geldt ("Snel: geldt tot de kabel eruit gaat.").
4. **Klaar om** (een tijdveld) en **Laden tot** (−/+ in stappen van 5). Met een
   weekschema verdwijnt Klaar om en staat de week eronder (bewerken in de
   coach, zoals afgesproken), met vandaag omlijnd. Maandag staat op plek 0.
5. **Het laadplan** als balk vanaf nu: zon in de kleur van zon, net in die van
   het net, met tijden eronder.
6. **De laadbeurt:** "Deze laadbeurt · sinds 12:08 · 4% → 80%" en
   "12,5 kWh · 2,1 kWh zon · € 3,59 incl. zon".

**Kleur:** laden op zon is `--dac-solar`, laden van het net het accent, vol is
goed (groen), een storing kritiek (rood), pauze is let op. Rood en groen alleen
voor status, zoals theme.js voorschrijft.

**De foto's** komen van de integratie zelf, op
`/domotiapp_lovelace/afbeeldingen/laadpalen/` (8 tot 14 KB per stuk, WebP,
bijgesneden tot de paal, 560 px hoog). In de editor kies je Automatisch (de
foto bij het merk van de coach), een van de vier modellen, Eigen afbeelding of
Geen. Bij Eigen afbeelding verschijnt de fotokiezer van de autokaart. Die toont
nu een stekker in plaats van een auto, met een neutrale voorbeeldtekst.

## Tegen de echte coach

**v0.111.0**, dump van rond 20:55 uit zijn Home Assistant, net na een volle
auto. Geanonimiseerd: het serienummer van de paal en een stuk van het
chassisnummer waren vervangen. Vaste testinvoer:
`tests/js/vaste-invoer/coach-0.111.0-laadpaal.json`.

**Wat klopte:** fabrikant en model op alle zes, de zes translation_keys,
contract 1, `stand: vol`, `brand: easee`, de select met de vier opties, laden tot
10-100 in stappen van 5.

**Wat er niet in het contract stond, en nu gelezen wordt:**
- `sessie.actief`: waar zolang de kabel erin zit, ook als hij vol is;
- `sessie.soc_eind`;
- `sessie.kosten` telt de zon mee tegen wat die anders had opgeleverd. Bij hem
  was dat € 3,59, terwijl het verslag op zijn telefoon alleen het net noemt
  (€ 3,13). Daarom heet het op de kaart "incl. zon".

**Wat in v0.111.1 komt** (vraag van deze sessie, antwoord van de coach): bij
hem stond de select op "zon" terwijl het schema aan stond, en dan wint de
planning. De kaart zou "Zon" als actief tonen, en een tik op Zon doet dan niets
zichtbaars. De coach levert daarom `modus_actief`, `modus_keuzes` en
`planning_nu`. Zonder die attributen volgt de kaart de select.

## Bewijs

### Tests

Nieuw: `laadpaal-logica.test.mjs` (35 tests) en `laadpaal-dump.test.mjs` (10
tests). Tegen `main` laden ze allebei niet
(`ERR_MODULE_NOT_FOUND ... src/cards/laadpaal-logica.js`). Op de stand vóór de
dump faalden drie van de vier laadbeurt-tests; de vierde ("deze laadbeurt"
zolang hij loopt) is REGRESSIEWACHT. Python: `test_afbeeldingen.py` heeft er
negen bij: vier keer meegeleverd, vier keer geserveerd als `image/webp` zonder
token, en een REGRESSIEWACHT dat de submap geen inhoud toont.

`npm test` 1455 groen; verify, registratie, controls en css groen.

### In de browser, tegen een nep-coach in de vorm van de dump

In de testinstance staat (niet in git) een nep-integratie `domotiapp_coach` met
een apparaat "Oprit" (model Laadpaal) en de zes entiteiten van het contract. Hij
heeft de vorm van v0.111.0, plus wat v0.111.1 belooft. De bundel is steeds
gemeten tegen de sha256 op schijf (laatste `00ea9bea0368`, en daarna 0.59.0).

**Echte kliks**, allemaal `isTrusted: true`:

| Klik | Aanroep | Kaart daarna |
|---|---|---|
| Snel | `select.select_option` snel | "Laadt", bliksem, "7,4 kW · 16 A", "Snel: geldt tot de kabel eruit gaat." |
| Zon | `select.select_option` zon | "Laadt op zon", zon-icoon, de balk in zonkleur |
| Pauze aan | `switch.turn_on` pauze | "Gepauzeerd", knop in waarschuwingskleur `rgb(250, 178, 25)` |
| Pauze uit | `switch.turn_off` pauze | |
| + + (laden tot) | **een** `number.set_value` 90 | "→ 90%", "Zon en laden tot 90%: geldt tot de kabel eruit gaat." |
| Klaar om, getypt 0815 + Tab | **een** `time.set_value` 08:15:00 | de entiteit staat op 08:15:00 |
| Schema uit | `switch.turn_off` schema | alle vier de modusknoppen |
| Zon (zonder planning) | `select.select_option` zon | Zon actief |
| Schema aan | `switch.turn_on` schema | alleen Planning (actief) en Snel. De coach staat op `modus: zon`, `modus_actief: planning`, en de noot over Zon is weg |

Die laatste is zijn situatie thuis, nagebootst.

**Weekschema** (`per_dag` nagebootst): ma 07:30 · di 07:30 · wo 08:00 ·
do 07:30 · vr 07:00 · za — · zo —, met zondag (vandaag) omlijnd. Klaar om
verdwijnt; Laden tot neemt dan de hele regel.

**De editor**, met echte kliks:
- De apparaatkiezer toont alleen "Oprit" van de coach, niet de vaatwasser.
- De keuzelijst Afbeelding geeft precies: Automatisch, Easee Charge Up, Easee
  Charge Max & Pro, Alfen Eve Single Plus, Alfen Eve Double Plus, Eigen
  afbeelding, Geen afbeelding.
- Alfen Eve Double Plus gekozen: het voorbeeld toont
  `.../laadpalen/alfen-eve-double-plus.webp`, en de kaart op het dashboard
  houdt de Easee (er is niet opgeslagen).
- Eigen afbeelding: de fotokiezer verschijnt, met een stekker en
  "/local/afbeelding.png".
- Naam "Laadpaal oprit": 14 toetsen, allemaal `isTrusted: true`, de spatie
  ook. Het voorbeeld heet daarna zo.

**Rasterhoogte en breedte** (de kaart met de hand in de pagina gehangen):

| Breedte | Hoogte | Modusknoppen | Laadbeurt | Afgekapt |
|---|---|---|---|---|
| 500 (de view) | 504 | Planning · Snel | één regel | niets |
| 380 | 504 | Planning · Snel | één regel | niets |
| 320 | 440 | Planning · Snel | één regel | niets |

Met het weekschema zichtbaar: 568. Alle hoogtes vallen op het raster.

**Licht thema**: Planning en Schema in het accent, zon en net in hun eigen
kleur, de foto los op de kaart.

## Samenvatting

Een laadpaalkaart die alles van de coach haalt: de accustand van de auto groot
bovenaan, de modus zoals hij echt geldt, pauze, schema, klaar om, laden tot,
het laadplan en de laadbeurt. Met een foto van de paal die je in de editor
kiest. Hij is nagelopen tegen de echte dump van coach v0.111.0. Hij gaat uit
zodra de dump van v0.111.1 de nieuwe modusattributen laat zien.

## Wat niet lukte

- **Nog niet uitgebracht**, zie bovenaan.
- **Niet in zijn echte Home Assistant bediend.** Dat is zijn auto; de coach
  heeft de bediening in haar eigen proeven gedaan (proef 144). Samen met hem
  proberen als de kaart er is.
- **Niet in een bubble-pop-up gemeten**: bubble-card staat niet in de
  testinstance. De breedtes 380 en 320 zijn met de hand nagebootst.
- **Twee keer gingen er toetsen naar de verkeerde plek**: na Escape op de
  apparaatkiezer kwam een klik niet in het naamveld, en opende "d" de
  zoekbalk van Home Assistant. Een klik daarin opende een demo-apparaat. Er is
  niets gewijzigd. Daarna eerst de focus gecontroleerd, en toen ging het goed.
- **Valkuil 48 twee keer**: een tabblad sluiten liet de hele tabgroep
  verdwijnen.
- **CI ving een test die van de tijdzone afhing.** De dumptest verwachtte
  "sinds 12:08", maar CI draait in UTC en daar is het 10:08. De kaart toont
  terecht de klok van wie kijkt; de test rekent het nu zelf uit. Daarna lokaal
  nagelopen met `TZ=UTC` en `TZ=America/New_York`: allebei 1455 groen.

## Aannames

- Dat Automatisch bij Easee de Charge Max & Pro moet tonen en bij Alfen de Eve
  Single Plus. De coach meldt alleen het merk, niet het model.
- Dat knoppen die nu niets doen beter weg kunnen dan uitgegrijsd. Zo doet het
  paneel het ook.

## git status --porcelain

Vóór het vastleggen:

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/laadpaal-card.js
 M src/cards/laadpaal-logica.js
 M src/editor/foto-picker.js
 M tests/js/laadpaal-logica.test.mjs
?? docs/laadpaal-met-de-coach/
?? tests/js/laadpaal-dump.test.mjs
?? tests/js/vaste-invoer/coach-0.111.0-laadpaal.json
```
