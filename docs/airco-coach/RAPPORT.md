# De airco-kaart met DomotiApp Coach (nog niet uitgebracht)

## De vraag

Op 14 oktober 2026 koos de eigenaar wat DomotiApp Coach met een airco mag. De
coach-sessie bouwt het en gaf het door:

- De coach zet de airco **aan en uit**. Bij het aanzetten zet hij de
  temperatuur die de bewoner **op de kaart** koos. Hij kiest zelf verwarmen of
  koelen: is de kamer kouder dan gewenst, dan verwarmt hij, anders koelt hij.
  Hij wisselt nooit terwijl de airco loopt, en raakt ventilator, swing en
  lamellen nooit aan.
- **Aan** gaat hij als de kamer nog niet op temperatuur is EN er zon over is
  (minstens het vermogen van de airco), of het een uur onder het daggemiddelde
  van de prijs is (alleen bij een dynamisch contract).
- **Uit** gaat hij als de zon op is (na minstens tien minuten aan) of als het
  goedkope uur voorbij is.
- **Bewoner wint:** zet de bewoner hem zelf aan of uit, dan blijft de coach er
  tot middernacht vanaf.

Het oude voorstel (het doel binnen een band schuiven, number `afwijking`) is
vervallen.

Het contract blijft 1; er komt alleen iets bij. Gevraagd en beantwoord die
avond, voorlopig tot de echte dump:

| Wat | Hoe |
|---|---|
| apparaat | fabrikant DomotiApp Coach, model "Airco", één per airco |
| sensor `coach` | `klimaat` (de climate), `stand`, `modus` (heat/cool), `reason` (een zin om te tonen), `dynamisch`, `bewoner_tot` (ISO, middernacht), `ruimte` |
| `stand` | `zon`, `goedkoop`, `op_temperatuur`, `uit`, `bewoner`, `pauze`, `geen_meting` |
| number `doeltemperatuur` | wat de bewoner wil; min, max en step zijn die van de climate. Vóór de eerste keuze de `temperature` van de climate |
| switch `alleen_zon` | blijft ook bij een vast contract bestaan; `dynamisch` zegt of hij ertoe doet |
| switch `pauze` | de coach doet niets |

De coach schrijft een nieuw doel **meteen** naar de climate als de airco
aanstaat, wie hem ook aanzette. Staat hij uit, dan bewaart hij het. Een
temperatuur op de afstandsbediening of in de app van de airco neemt hij over in
de number: wie het laatst bewoog wint. Wisselen tussen verwarmen en koelen
telt als zelf bedienen; een temperatuur niet. Punt 3 en het wisselen legt de
coach-sessie nog aan de eigenaar voor. Voor de kaart verandert dat niets: die
stuurt de stand gewoon naar de airco.

## Wat er veranderd is

**Een coach-apparaat hoort er niet in de editor bij.** De kaart vindt hem zelf.
Hij zoekt een apparaat van de coach met model "Airco" waarvan de sensor `coach`
deze climate in `klimaat` heeft (`aircoCoach` in `airco-logica.js`). Wie de
airco kiest, krijgt de coach erbij. Is de coach onbereikbaar, dan is het een
gewone airco-kaart, zoals in 0.63.0.

**Het doel gaat naar de coach, niet naar de airco.** Schreef de kaart de
climate, dan zette de coach bij het aanzetten zijn eigen doel terug.
`metCoachDoel` zet het doel van de coach in de climate:

- `temperature` wordt de waarde van de number;
- min, max en stap komen van de number;
- een bereik valt weg, want de coach kiest zelf en heeft één doel.

Alles wat het doel tekent of verzet werkt daardoor ongewijzigd. Alleen het
opsturen kiest: `doelOproepVoor` stuurt `number.set_value` met een coach en
`climate.set_temperature` zonder.

**Op de airco-kaart:**

- **Het doel staat er ook als de airco uit staat.** Met een coach is het wat de
  bewoner wil, en dat stel je juist in als hij uit staat.
- **Onder de status staat de zin van de coach** (`reason`), heel en niet
  afgekapt, net als op de laadpaal.
  - Stuurt de coach geen zin, dan maakt de kaart zelf een korte zin bij de
    stand (`coachRegel`). Bijvoorbeeld:
    - "Wacht op zon of een goedkoop uur.";
    - "Wacht op zon." (bij Alleen op zon, of een vast contract);
    - "Zelf bediend. De coach doet weer mee vanaf middernacht.".
  - Een stand die de kaart niet kent geeft geen zin: liever niets dan iets
    verkeerds.
- **Twee knoppen onder het doel: Alleen op zon en Pauze.** Ze hebben dezelfde
  vorm als Pauze en Schema op de laadpaal. Pauze kleurt als waarschuwing.
  Alleen op zon staat er alleen als `dynamisch` waar is.
- **De aan-knop en de standen gaan gewoon naar de airco.** Zelf bedienen is
  voor de coach "bewoner wint", en dat hoort zo.
- **De hulptekst in de editor** zegt dat de kaart de coach zelf vindt.

**Op het infoscherm** (blok Klimaat en de pagina Airco's) lezen en schrijven
de tegels en het paneel het doel ook via de coach (`aircoSt_`,
`aircoCoach_`). Het doel staat er al als de airco uit staat, maar was dan
gedimd. Met een coach is het niet meer gedimd.

**Wat de kaart niet doet:** beslissen op de toestandstekst of op `reason`
(valkuil 67). Wat hij kiest, kiest hij op `stand` en `dynamisch`.

## Bewijs

### Tests

`tests/js/airco-coach.test.mjs`: 24 tests, **NIEUW GEDRAG**. Ze staan in zes
groepen:

- de coach vinden;
- de attributen;
- de regel op de kaart;
- het doel van de coach;
- waar het doel heen gaat;
- de knoppen.

Tegen de code van 0.64.0 (`git archive HEAD src tests package.json` in een
vaste map, HEAD = 45b9537) falen ze alle 24:

```
      8   TypeError: A.aircoCoach is not a function
      9   TypeError: A.aircoCoachStand is not a function
      2   TypeError: A.doelOproepVoor is not a function
      4   TypeError: A.metCoachDoel is not a function
      1   TypeError: Cannot convert undefined or null to object
      1 ℹ fail 24
      1 ℹ pass 0
      1 ℹ tests 24
```

De laatste is `Object.keys(A.COACH_STANDEN)`, dat in 0.64.0 niet bestaat.

Op deze tak: **1671 JS-tests groen** (was 1647). `npm run verify`,
`check:registratie`, `check:css` en `check:controls` zijn OK. De
Python-tests (de Python is niet veranderd) staan onder *Samenvatting*.

### In Home Assistant

Gemeten in de testinstance (poort 8127) tegen een **nep-coach** met het
contract hierboven. Die staat in `.ha-dev-config/custom_components/domotiapp_coach/airco.py`,
niet in git:

- een apparaat "Airco werkplek" met model "Airco", `klimaat`
  `climate.hvac` (de demo-airco);
- de number `doeltemperatuur`, met grenzen van de climate;
- de switches `alleen_zon` en `pauze`;
- om te meten: een select voor de stand, en switches voor "dynamisch" en
  "met reden".

De nep-coach doet wat de coach beloofde:

- een nieuw doel meteen naar de climate als die aanstaat;
- een temperatuur op de climate zelf wordt het doel.

**Verse code:** de geladen bundel had `?v=846cea5c5782`. Dat is de sha256 van
de gebouwde bundel (`846cea5c5782…`). Op de kaart bestond `coach_`.

Alle kliks zijn echte kliks van de browsertool. Een capture-luisteraar op
`window` ziet `isTrusted: true`, en een abonnement op `call_service` laat zien
wat er naar Home Assistant ging:

| Meting | Wat er ging |
|---|---|
| airco AAN (koelen), twee kliks op + | kaart: één `number.set_value` 22. Daarna de nep-coach: `climate.set_temperature` 22 |
| klik op Uit | `climate.turn_off` (naar de airco, zoals altijd) |
| airco UIT: het doel blijft staan; één klik op + | alleen `number.set_value` 22,5; de climate bleef op 22 |
| klik op Alleen op zon, dan op Pauze | `switch.turn_on` op `alleen_op_zon` en op `pauze`. Pauze kleurt `rgb(250,178,25)` (= `--dac-warn`), Alleen op zon het accent |
| temperatuur op de climate zelf naar 19 (de afstandsbediening nagespeeld) | number 19,0, kaart "19° doel" |
| een airco ZONDER coach (`climate.heatpump`), klik op + | `climate.set_temperature` 20,5: zoals in 0.64.0 |

De regel van de coach in de echte kaart, met de reden van de nep-coach uit:

| Toestand | Regel op de kaart |
|---|---|
| stand `uit`, Alleen op zon aan | "Wacht op zon." |
| stand `uit`, Alleen op zon uit | "Wacht op zon of een goedkoop uur." |
| `dynamisch` uit | "Wacht op zon.", en de knop Alleen op zon is weg |
| stand `bewoner`, `bewoner_tot` middernacht | "Zelf bediend. De coach doet weer mee vanaf middernacht." |
| stand `zon` | "Aan op zon." |

**Maten:**

- De kaart is 504 hoog met de airco aan (met ventilator en lamellen) en 376
  met de airco uit. Allebei zijn het rasterrijen.
- Alleen op zon begint op x=711, net als de knop Uit.
- Pauze eindigt op 1057, net als de knop Koelen (946 + 111).

**Licht thema** (`dac-thema="licht"`): de regel staat in
`rgba(26,26,23,.68)` en de knoppen hebben een haarlijn. Op de schermafdruk is
alles leesbaar. Daarna is het thema teruggezet op het standaard donkere.

**280 px breed** (de kaart met de hand in een vak gehangen, valkuil 40):

- beide knoppen zijn 122 breed, en "Alleen op zon" (76) en "Pauze" passen
  zonder afkappen;
- de stelknop heeft links en rechts 15 px marge;
- er scrolt niets;
- de hoogte is 376.

**Infoscherm** (`infoscherm-wachtkamer`, pagina Airco's):

- Als beheerder: het paneel van Werkplek raam toont "19°, Ingesteld", niet
  gedimd, terwijl de airco uit staat. Twee echte tikken op + gaven één
  `number.set_value` 20. De climate bleef op 19 en "off".
- **Als het iPad-account** (`ipad.localhost`, `is_admin: false`):
  - het account ziet 66 apparaten en vindt de coach (`aircoCoach_` gaf de
    number);
  - een echte tik op − zette de number op 19,5;
  - de `context.user_id` van die wijziging is die van de iPad.

  Een gewone gebruiker kan dit dus.

## Wat er nog moet voor de uitgave

**Afspraak met de eigenaar (12 oktober 2026): er gaat niets uit dat een
attribuut van de coach leest voordat het in een echte dump heeft gestaan.** Dit
is gebouwd op wat de coach-sessie over de vorm schreef, vóór haar uitgave.
Daarom:

1. de coach-sessie meldt zich na haar uitgave met een dump van een
   Airco-apparaat;
2. die komt als `tests/js/vaste-invoer/coach-<versie>-airco.json` erbij, met een
   test zoals `laadpaal-dump-0117.test.mjs`. Daarbij nagaan:
   - de entity_id's (de kaart zoekt op translation_key);
   - of `klimaat` echt de entity_id van de climate is;
   - of `dynamisch` en `bewoner_tot` er zo staan;
   - de vorm van `reason`;
3. pas dan de versie omhoog, de PR mergen en uitbrengen.

## Samenvatting

- De airco-kaart vindt een coach-apparaat met model "Airco" zelf, aan
  `klimaat` op zijn sensor.
- Met een coach:
  - het doel gaat naar de number `doeltemperatuur`;
  - het staat er ook als de airco uit staat;
  - de zin van de coach staat onder de status;
  - Alleen op zon (alleen bij een dynamisch contract) en Pauze staan eronder.
- Het infoscherm leest en schrijft het doel ook via de coach.
- Zonder coach is er niets veranderd.
- 24 nieuwe tests, die alle 24 falen op 0.64.0. 1671 JS-tests zijn groen.
- Gemeten in Home Assistant met echte kliks tegen een nep-coach: als beheerder
  en als het iPad-account, donker en licht, en op 280 px.
- **Nog niet uitgebracht:** wacht op de echte dump van de coach.

## Wat niet lukte

- Geen meting tegen de echte coach: die is er nog niet. Alles is gemeten tegen
  de nep-coach, die het contract nadoet zoals het beschreven is.
- Niet op een iPhone of een echte iPad gemeten.
- Het aan- en uitzetten door de coach zelf is niet gemeten: dat is de kant van
  de coach. De nep-coach zet de stand met de hand.
- De proefopstelling in `dev/airco.html` heeft geen situatie met een coach
  gekregen; de meting is in Home Assistant zelf gedaan.

## Aannames

- `klimaat` is de entity_id van de climate als tekst, zoals de coach-sessie
  schreef. Staat er in de dump iets anders, dan vindt de kaart de coach niet,
  en is het een gewone airco-kaart.
- `reason` is altijd een zin om te tonen, net als bij de laadpaal en de batterij
  (in elke dump tot nu toe). De zinnen van de kaart zelf zijn een vangnet.
- `bewoner_tot` heeft een tijdzone. Middernacht wordt lokaal gelezen; in een
  test staat het daarom zonder zone.
- Twee airco's in één ruimte (`ruimte`) krijgen elk hun eigen kaart. Groeperen
  per ruimte is niet gevraagd.

## git status --porcelain

Vóór de commit:

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M src/cards/airco-card.js
 M src/cards/airco-logica.js
 M src/cards/infoscherm-card.js
?? docs/airco-coach/
?? tests/js/airco-coach.test.mjs
```

Na de commit van dit rapport: leeg.
