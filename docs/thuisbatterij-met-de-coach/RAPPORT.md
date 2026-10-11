# 0.60.0 — De thuisbatterijkaart, met DomotiApp Coach

**Uitgebracht na de echte dump van coach v0.112.1** (11 oktober 2026, 22:53).
Afgesproken was dat er niets uitgaat dat attributen leest die nog niet in een
echte dump hebben gestaan. Eén uitzondering staat hieronder: de velden van een
planblok. Bij de eigenaar is het plan leeg, dus die velden zijn nagelezen in de
bron van de coach. Zie *Tegen coach v0.112.1*.

## De vraag

11 oktober 2026, samen met de laadpaal: een kaart voor de thuisbatterij die met
de coach werkt, voor in een bubble-pop-up. De foto's: *"ja anker heb ik ook
toestemming voor."* Keuzelijst in de editor: Solarbank Max AC, Solarbank Max
AC met uitbreiding, plus een eigen afbeelding.

## Het contract (coach v0.112.0, contract 1)

Per thuisbatterij een apparaat met fabrikant "DomotiApp Coach" en model
"Thuisbatterij":

- **sensor `coach`**: de stand (`nul_op_de_meter` / `zonneladen` / `laden` /
  `ontladen` / `stil`), `soc`, `temperatuur`, `reason`, `zelf`, `plan`,
  `opgeleverd_vandaag/_maand/_totaal/_sinds`, `override` (vol / leeg / None),
  `leeg_tot`, `vakantie`, `vakantie_max`, `reserve`, `ondergrens`;
- **knoppen** `vol_laden`, `leegladen` en `terug_naar_plan`;
- **number** `leeg_tot` (0-100, stap 5, nooit onder de ondergrens);
- **switch** `vakantiestand`.

Twee vragen van deze sessie, beantwoord door de coach-sessie op 11 oktober:

- `plan[].kw` is het verwachte gemiddelde van het blok, laden positief en
  ontladen negatief. Bij "nul op de meter" is het níet nul. Een blok kan een
  kwartier zijn, en er zijn hooguit 48 blokken.
- `opgeleverd_sinds` is een datum zonder tijd. `opgeleverd_*` is None (niet 0)
  zolang het nog niet bekend is.

## Wat er gebouwd is

`custom:domotiapp-batterij-card`, met een lege config bruikbaar.

1. **De kop:** de foto (liggend, want een Solarbank is breder dan hoog), de
   naam, de stand in de woorden van de coach met het icoon van de stand, en
   waarom. Rechts de lading groot en de temperatuur.
2. **De lading als balk**, met een streepje op de ondergrens, en op de
   vakantiegrens als de vakantiestand aan staat. Daaronder de grenzen:
   "ondergrens 10% · reserve 20% · vakantie tot 60%".
3. **Vol laden**, en **Terug naar het plan** alleen als er een opdracht loopt.
   De lopende opdracht staat aan.
4. **Leegladen tot [− 25% +] [Leegladen]**: eerst het getal, dan de knop, zoals
   de coach-sessie vroeg. De coach leest `leeg_tot` op het moment van drukken.
   Daarom stuurt een tik op Leegladen eerst het getal dat er staat, wacht tot
   dat binnen is, en drukt dan pas. Zo krijgt wie snel tikt en drukt niet de
   oude waarde.
5. **De vakantiestand**, met de grens van de installateur in de zin erbij
   ("Vakantiestand staat aan: de batterij blijft onder 60%."). Die grens is
   hier niet te wijzigen.
6. **Het plan als staafjes rond een nullijn:** laden omhoog in het accent,
   ontladen omlaag in het groenblauw uit de identiteitsset. De breedte komt uit
   start en eind, de hoogte uit `kw` tegen het grootste vermogen in beeld.
7. **Opgeleverd**: "vandaag € 0,42 · deze maand € 12,30 · € 140,00 sinds 1 mrt
   2026". Wat None is, valt weg.

**De foto's** komen van de integratie (`/domotiapp_lovelace/afbeeldingen/
thuisbatterijen/`, bijgesneden, WebP: 33 en 10 KB). De coach meldt geen merk
voor de batterij, dus er is geen Automatisch: zonder keuze is het de
Solarbank.

Twee dingen die gedeeld zijn met de andere coachkaarten: `coachMelding` neemt
nu de coachversie mee die de kaart nodig heeft (de batterij: 0.112.0), en
`tikken` (de tijden onder een balk) komt uit `laadpaal-logica.js`.

## Bewijs

### Tests

`batterij-logica.test.mjs` heeft 23 tests, allemaal NIEUW GEDRAG. Tegen de
laadpaaltak laden ze niet
(`ERR_MODULE_NOT_FOUND ... src/cards/batterij-logica.js`). Python:
`test_afbeeldingen.py` krijgt de twee foto's erbij (meegeleverd en geserveerd
als `image/webp`), en de submap `thuisbatterijen/` in de toets dat er geen
mapinhoud te zien is.

`npm test` 1480 groen; verify, registratie, controls en css (bij de build)
groen.

### In de browser, tegen een nep-coach

In de testinstance (niet in git) heeft de nep-integratie `domotiapp_coach` nu
ook een thuisbatterij met de zes entiteiten uit het contract. Het plan begint
met vier kwartieren, en dan uren. Bundel gemeten tegen de sha256 op schijf
(laatste vóór 0.60.0: `2904d5685012`).

Echte kliks, allemaal `isTrusted: true`:

| Klik | Aanroep | Kaart daarna |
|---|---|---|
| Vol laden | `button.press` vol_laden | "Laden", pijl omhoog, Vol laden aan, **Terug naar het plan** verschijnt |
| Terug naar het plan | `button.press` terug_naar_plan | "Nul op de meter", alleen Vol laden |
| − en meteen Leegladen | eerst `number.set_value` 25, dan `button.press` leegladen (3 ms later) | de coach heeft `leeg_tot: 25` en `override: leeg`; "Ontladen" |
| Vakantie | `switch.turn_on` vakantiestand | "Vakantiestand staat aan: de batterij blijft onder 60%", "vakantie tot 60%" en een tweede streepje in de balk |

**De editor**, met echte kliks:
- De apparaatkiezer toont alleen "Thuisbatterij", niet de vaatwasser of de
  laadpaal.
- De keuzelijst Afbeelding geeft precies de twee Solarbanks, Eigen afbeelding
  en Geen. Met uitbreiding gekozen: het voorbeeld toont
  `.../thuisbatterijen/anker-solarbank-max-ac-uitbreiding.webp`, en het
  dashboard houdt de gewone.
- Naam "Accu garage": 11 toetsen, allemaal `isTrusted: true`, de spatie ook.
- Geen geneste sleutels (valkuil 33). Gesloten met Annuleren.

**Breedte en raster** (de kaart met de hand in de pagina gehangen):

| Breedte | Hoogte | Afgekapt | Opdrachtknoppen |
|---|---|---|---|
| 500 (de view) | 504 | niets | Vol laden · Terug naar het plan |
| 380 | 504 | niets | Vol laden · Terug naar het plan |
| 320 | 504 | niets | Vol laden · **Naar plan** |

Op 320 werd "Terug naar het plan" eerst afgekapt; nu staat er "Naar plan", met
de hele naam in `aria-label`.

**Licht thema**: laden en ontladen elk in een eigen kleur, het accent op een
lopende opdracht en op de vakantiestand, en de foto los op de kaart.

## Tegen coach v0.112.1

Dump van 22:53, gestuurd door de coach-sessie. Alleen de apparaatnaam is
vervangen. Vaste testinvoer: `tests/js/vaste-invoer/coach-0.112.1-batterij.json`,
met de tests in `batterij-dump-0112.test.mjs` (14).

**Wat klopte zonder wijziging:**
- de zes rollen en contract 1;
- "Nul op de meter" met het huisje, 5%, 21 °C, en `zelf: true`;
- "ondergrens 5%", zonder reserve en met de vakantiestand uit;
- "vandaag € 0,00 · deze maand € 1,05 · € 4,04 sinds 28 sep 2026";
- Vol laden en Leegladen, zonder Terug naar het plan;
- de knoppen op "unknown" tot de eerste druk.

**Drie dingen die de dump liet zien:**

1. **Merk en model**: `accu_fabrikant` "Anker", `accu_model` "Anker SOLIX
   Solarbank Max AC". De afbeelding heeft nu **Automatisch**, en dat is de
   standaard. Er wordt op een deel van het model gezocht: alleen een
   "Solarbank Max AC" krijgt de foto. Een andere Solarbank ziet er anders uit,
   en een batterij van een ander merk krijgt geen foto. Tot nu toe was het
   zonder keuze altijd de Solarbank. De uitbreiding is aan het model niet te
   zien; die kies je zelf.
2. **Leegladen gaat niet onder de ondergrens.** De number loopt van 0 tot 100,
   en de ondergrens is 5. Met de ondergrens als minimum staat − uit op 5%; eerst
   sprong de kaart naar 0% en daarna terug naar 5%. `leeg_tot` op de sensor is
   null: dat is alleen het doel van een lopende leegbeurt, de instelling is de
   number.
3. **Het plan is leeg** (een vast contract, en het rendement is onbekend). Een
   leeg plan verborg de kaart al.

**Niet in een dump gezien:** de velden van een planblok (`start`, `end`,
`actie`, `kw`, `price`, `soc_eind`). Nagelezen in `accu_plan` in `entiteit.py`
van de coach (main `473f0e4`). Een echte dump met een dynamisch contract komt
pas bij een klant die er een heeft.

### Tests tegen de code van vóór de dump

`git archive` van de tak vóór deze wijziging, met het nieuwe testbestand
erbij. Zeven vallen om, precies de zeven NIEUW GEDRAG:

```
  ✖ leest fabrikant en model zoals de coach ze meldt
  ✖ neemt bij hem thuis de Solarbank Max AC
  ✖ geeft een andere Solarbank geen foto, want die ziet er anders uit
  ✖ toont zonder merk niets, en niet stilletjes de Solarbank
  ✖ laat een gekozen foto en een eigen afbeelding voorgaan
  ✔ REGRESSIEWACHT: de number zelf zou naar 0 gaan, hij loopt van 0 tot 100
  ✖ met de ondergrens erbij staat − uit op 5%, en gaat + naar 10%
  ✖ zonder ondergrens blijft de number zoals hij is
  ✔ (zes keer REGRESSIEWACHT: rollen, stand, leeg plan, grenzen, opgeleverd, knoppen)
ℹ pass 7
ℹ fail 7
```

`npm test` 1520 groen, in UTC.

### In een echte browser, in een proefopstelling

**Niet in Home Assistant gemeten.** De testinstance is om 23:03 met de hele
projectmap verloren gegaan; zie valkuil 68. Daarom `dev/batterij.html`: de echte
bundel, de echte dump als `hass`, in drie situaties op 500 en 320 px, plus de
editor met dezelfde echo-lus als Home Assistant (bevroren config terug via
`setConfig`).

| Situatie | Foto bij Automatisch | Leegladen tot | − | Opdrachten |
|---|---|---|---|---|
| 1. echte dump | `.../anker-solarbank-max-ac.webp` | 5% | uit | Vol laden |
| 2. lopende leegbeurt tot 30% | idem | 30% | aan | Vol laden · Terug naar het plan |
| 3. Zendure SolarFlow 2400 AC | geen (het stekkertje) | 5% | uit | Vol laden |

De foto zelf is in de proefopstelling niet te zien: die komt van de integratie,
en die draait daar niet. Het adres klopt.

Echte kliks, met een luisteraar op `window`:

- **+ op 5%**: `pointerdown` en `click`, `isTrusted: true`. Het getal werd 10%,
  en na de pauze kwam `number.set_value {"value":10}`.
- **− op 5%**: alleen een `pointerdown` (`isTrusted: true`) op de uitgezette
  knop. Geen klik, geen aanroep, en het getal bleef 5%.
- **Editor, Afbeelding**: zonder keuze staat er "Automatisch (merk en model van
  de batterij)". Met een klik en daarna pijl omlaag en Enter (alle drie
  `isTrusted: true`) kwam er één `config-changed` met
  `afbeelding: "anker_solarbank_max_ac"`. Geen geneste sleutels (valkuil 33).

Twee dingen die aan de proefopstelling lagen en niet aan de kaart:

- De eerste twee kliks kwamen niet aan: er kwam ook geen `pointerdown`. Het
  tabblad stond verborgen. De derde kwam wel aan.
- In situatie 3 bleef de kaart eerst 342 en 358 hoog, dus niet op het raster.
  De proefopstelling geeft de kaart zijn `hass` voordat hij in de pagina hangt.
  De herkansing van `meetRaster` loopt via `requestAnimationFrame`, en die
  vuurt in een verborgen tabblad niet, net als de `ResizeObserver`. Na één
  `paint()` met de kaart in de pagina stonden alle zes op 376.

## Wat bij het bouwen boven kwam

- **Twee blauwen.** Ontladen stond eerst in het blauw van het huis, naast het
  accent van laden; op de werkbank waren ze niet uit elkaar te houden. Nu is het
  het groenblauw (`--dac-device-2`).
- **Een klassenaam die twee keer bestond.** Het streepje voor de vakantiegrens
  en de regel van de vakantiestand heetten allebei `.vakantie`;
  `this.$(".vakantie")` pakte het streepje, en de regel bleef verborgen. De
  regel heet nu `.vakantierij`.

## Samenvatting

Een thuisbatterijkaart die alles van de coach haalt:
- de lading groot, met de stand;
- vol laden, en leegladen tot een getal dat je eerst kiest, niet onder de
  ondergrens;
- de vakantiestand;
- het plan als staafjes rond een nullijn, als er een plan is;
- wat hij opleverde.

Automatisch kiest de foto op merk en model van de batterij. Getoetst tegen de
echte dump van coach v0.112.1.

## Wat niet lukte

- **De ronde na de dump is niet in Home Assistant zelf gemeten**, alleen in de
  proefopstelling: de testinstance is weg (valkuil 68). De ronde daarvoor is
  wel in Home Assistant gemeten.
- **De velden van een planblok** zijn niet in een echte dump gezien; zie
  *Tegen coach v0.112.1*.
- **Niet in een bubble-pop-up gemeten**; de breedtes zijn met de hand
  nagebootst.

## Aannames

- Dat een andere Solarbank dan de Max AC beter geen foto krijgt dan die van de
  Max AC. De coach-sessie vond dat ook.
- Dat ontladen het groenblauw van de identiteitsset mag dragen. Een batterij
  heeft geen eigen identiteitskleur in theme.js.

## git status --porcelain

Vóór het vastleggen:

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/coach-logica.js
 M src/cards/laadpaal-logica.js
 M src/index.js
 M tests/test_afbeeldingen.py
?? custom_components/domotiapp_lovelace/afbeeldingen/thuisbatterijen/
?? docs/thuisbatterij-met-de-coach/
?? src/cards/batterij-card.js
?? src/cards/batterij-logica.js
?? tests/js/batterij-logica.test.mjs
```

Vóór het vastleggen van de ronde na de dump (de code stond al vast in
`Batterij tegen de echte coach 0.112.1`; dit is het rapport met de proefopstelling):

```
 M docs/thuisbatterij-met-de-coach/RAPPORT.md
?? dev/batterij.html
```
