# 0.59.0 — De laadpaalkaart, met DomotiApp Coach

**Uitgebracht na de echte dump van coach v0.112.1** (11 oktober 2026, 22:53).
Afgesproken was dat er niets uitgaat dat een nieuw attribuut leest voordat het
in een echte dump van de coach heeft gestaan. Alles wat de kaart leest staat
nu in een dump: `modus_actief`, `modus_keuzes`, `planning_nu`, `kosten_net`,
`paal_fabrikant` en `paal_model`. Zie *Tegen coach v0.112.1* hieronder.

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

## Tegen coach v0.112.1

Dump van 22:53, kort na een herstart, gestuurd door de coach-sessie. Alleen de
serienummers van paal en auto zijn vervangen, en het plan is ingekort tot drie
blokken. Vaste testinvoer: `tests/js/vaste-invoer/coach-0.112.1-laadpaal.json`,
met de tests in `laadpaal-dump-0112.test.mjs`.

**Wat klopte zonder wijziging:** de zes rollen, contract 1, "Geen auto" in rust
met de laatst bekende accustand (77%), Planning en Snel als enige knoppen met
Planning aan terwijl de paal zelf op "zon" staat (`modus_actief`), en de vorige
laadbeurt met beide bedragen: "15,5 kWh · 2,1 kWh zon · € 3,19 net · € 3,64
incl. zon", "4% → 80%".

**Twee dingen die de dump liet zien:**

1. **Zonder auto rekent de coach toch door.** Bij `stand: geen_auto` stonden er
   een plan, "klaar om 23:02" en 0,6 kWh nodig. Dat is wat er zou gebeuren als
   er nu een auto aan ging, gerekend met de laatst bekende accustand. De
   coach-sessie: *"Toon 'vol rond' en het plan alleen als stand niet geen_auto
   is."* Zonder auto toont de kaart dus geen "verwacht klaar", geen "nog x kWh"
   en geen plan. Met een auto staan ze er weer.
2. **Merk en model van de paal**: `paal_fabrikant` "Easee", `paal_model`
   "Charge Max". Automatisch kiest de foto nu op de fabrikant, met het model als
   verfijning: een Charge Up krijgt de Charge Up, een Eve Double de Double, en
   een ander model van hetzelfde merk de gewone foto van dat merk. Er wordt
   gezocht op een deel van de tekst, want een model kan zelf ook het merk
   bevatten (de batterij heet "Anker SOLIX Solarbank Max AC"). Een coach van
   vóór 0.112.1 meldt alleen `brand`, en dan blijft het zoals het was. Een merk
   zonder foto (Zaptec) geeft geen foto, en zeker geen verkeerde.

**Gezien maar niet getoond:** `sessie.accu_kwh` (0,263 kWh uit de
thuisbatterij) en `sessie.net_kwh`. De regel onder de laadbeurt is op een
telefoon al twee regels lang; er nog een getal bij zetten is een keuze voor de
eigenaar.

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

**Na de dump van v0.112.1:** `laadpaal-dump-0112.test.mjs` (13 tests). Tegen
de code van vóór deze wijziging (commit `9868493`, in een losse worktree)
vallen er zeven om, precies de zeven NIEUW GEDRAG:

```
  ✔ REGRESSIEWACHT: de coach rekent wel door: plan, 23:02 en 0,6 kWh staan in de dump
  ✖ toont geen 'verwacht klaar' en geen 'nog x kWh'
  ✖ toont geen plan
  ✔ REGRESSIEWACHT: toont ze wel zodra er een auto aan hangt
  ✖ leest fabrikant en model zoals de coach ze meldt
  ✖ neemt bij hem thuis de Charge Max
  ✖ verfijnt op het model: een Charge Up en een Eve Double
  ✖ de fabrikant gaat voor `brand`, en zonder fabrikant telt `brand`
  ✖ een merk zonder foto geeft geen foto, en geen verkeerde
  ✔ (vier keer REGRESSIEWACHT: rollen, Geen auto, modusknoppen, laadbeurt)
ℹ pass 6
ℹ fail 7
```

De bestaande fototests geven nu de stand mee in plaats van alleen het merk
(`laadpaalAfbeelding(keuze, stand, eigen)`). `npm test` 1470 groen.

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

### In de browser, tegen de nep-coach in de vorm van v0.112.1

De nep-coach in de testinstance (niet in git) kreeg `paal_fabrikant` "Easee",
`paal_model` "Charge Up", en een schakelaar "Auto aan de paal". Zonder auto is
de stand `geen_auto`, maar levert hij wel een plan van twaalf blokken, "klaar om
04:00" en 13,6 kWh, net als de echte coach. Bundel gemeten: `?v=b5e280976eb4`
in de pagina, gelijk aan de sha256 op schijf.

| Toestand | Feiten | Plan | Foto | Hoogte |
|---|---|---|---|---|
| geen auto | verborgen | verborgen | `easee-charge-up.webp` (geladen, 417 px breed) | 376 |
| auto aan | "verwacht klaar 04:00 · nog 13,6 kWh" | 4 laadblokken | idem | 504 |
| weer geen auto | verborgen | verborgen | idem | 376 |

Beide hoogtes vallen op het raster (6 en 8 rijen). Met auto aan twee echte
kliks op Pauze: allebei `isTrusted: true`, de pauze ging aan
(`switch.oprit_pauze` on, stand `pauze`) en weer uit.

De editor ging in dit verborgen tabblad niet open (valkuil 40: de klik op het
potlood kwam aan, maar de bewerkmodus laadde niet). De nieuwe teksten zijn
daarom uit de echte editorklasse in de pagina gelezen: "Automatisch (merk en
model van de paal)", en in de hulptekst "coach 0.112.1 of nieuwer".

## Samenvatting

Een laadpaalkaart die alles van de coach haalt: de accustand van de auto groot
bovenaan, de modus zoals hij echt geldt, pauze, schema, klaar om, laden tot,
het laadplan en de laadbeurt. Met een foto van de paal die je in de editor
kiest. Hij is nagelopen tegen de echte dumps van coach v0.111.0 en
v0.112.1. Na die laatste toont hij zonder auto geen vooruitplan meer, en kiest
Automatisch de foto op merk en model van de paal.

## Wat niet lukte

- **De editor is in deze laatste ronde niet met kliks geopend**: het tabblad
  stond verborgen. Alleen twee teksten zijn veranderd; die zijn uit de echte
  editor in de pagina gelezen.
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

- Dat Automatisch bij een Easee die geen Charge Up is de Charge Max & Pro
  moet tonen, en bij een Alfen die geen Double is de Eve Single Plus. Hoe de
  integraties van Alfen en van een Charge Up hun model noemen, is niet gemeten.
  Er is alleen de Easee van de eigenaar ("Charge Max").
- Dat knoppen die nu niets doen beter weg kunnen dan uitgegrijsd. Zo doet het
  paneel het ook.

## git status --porcelain

Vóór het vastleggen van de eerste ronde:

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

Vóór het vastleggen van de ronde na de dump van v0.112.1:

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M docs/laadpaal-met-de-coach/RAPPORT.md
 M src/cards/laadpaal-card.js
 M src/cards/laadpaal-logica.js
 M tests/js/laadpaal-dump.test.mjs
 M tests/js/laadpaal-logica.test.mjs
?? tests/js/laadpaal-dump-0112.test.mjs
?? tests/js/vaste-invoer/coach-0.112.1-laadpaal.json
```
