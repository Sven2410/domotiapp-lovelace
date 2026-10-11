# 0.60.0 — De thuisbatterijkaart, met DomotiApp Coach

**Nog niet uitgebracht.** Coach v0.112.0 is uit, maar draait nog niet bij de
eigenaar; er is dus nog geen echte dump van de batterij. Afgesproken is dat er
niets uitgaat dat attributen leest die nog niet in een echte dump hebben
gestaan. Deze PR staat op de laadpaal (#92), die om dezelfde reden wacht.

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

## Wat bij het bouwen boven kwam

- **Twee blauwen.** Ontladen stond eerst in het blauw van het huis, naast het
  accent van laden; op de werkbank waren ze niet uit elkaar te houden. Nu is het
  het groenblauw (`--dac-device-2`).
- **Een klassenaam die twee keer bestond.** Het streepje voor de vakantiegrens
  en de regel van de vakantiestand heetten allebei `.vakantie`;
  `this.$(".vakantie")` pakte het streepje, en de regel bleef verborgen. De
  regel heet nu `.vakantierij`.

## Samenvatting

Een thuisbatterijkaart die alles van de coach haalt: de lading groot, de stand,
vol laden, leegladen tot een getal dat je eerst kiest, de vakantiestand, het plan
als staafjes rond een nullijn, en wat hij opleverde. Met een productfoto van de
Solarbank. Hij gaat uit na een echte dump van coach v0.112.0.

## Wat niet lukte

- **Nog niet uitgebracht en niet tegen een echte dump gemeten**: zie bovenaan.
- **Niet in een bubble-pop-up gemeten**; de breedtes zijn met de hand
  nagebootst.

## Aannames

- Dat zonder keuze de Solarbank Max AC de goede foto is: de coach meldt geen
  merk voor de batterij, en de eigenaar levert die. Komt er een merk of model
  in de coach (zoals bij de laadpaal), dan kan er een Automatisch bij.
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
