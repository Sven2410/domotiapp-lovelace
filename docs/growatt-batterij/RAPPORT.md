# 0.69.0: Growatt op de thuisbatterijkaart

**Status: gebouwd en gemeten, nog NIET uitgebracht.** Het wacht op de echte dump
van coach 0.123.0 (zie *Wat er nog moet*).

De vraag, via de beheersessie op 15 oktober 2026: *"naast Anker moet ook Growatt
erop, met type en productfoto."* Het gaat om een Growatt ARK 15.3H bij een
klant. Die heeft zes modules ARK 2.5H-A1 (2,56 kWh, 51,2 V), samen 15,36 kWh.
Hij hangt aan een MIX-hybride, via de core-integratie `growatt_server` (cloud,
eens per vijf minuten).

De fotorechten: de eigenaar zei op 15 oktober 2026 *"ja growatt mag in de
publieke repo"*, als installateur.

## Afgestemd met de coach

De coach stuurt een Growatt NOOIT, ook dat is de keuze van de eigenaar: *"nee
sturen niet voor growatt alleen uitlezen"*. Met de coach-sessie is afgesproken
wat er vanaf v0.123.0 op de sensor `coach` van een thuisbatterij staat.
Contract 1 blijft; er komt alleen iets bij:

| Attribuut | Wat |
|---|---|
| `alleen_lezen` | `true` bij een Growatt, en bij elke batterij die de coach niet mag sturen. Dan is `stand` "stil", `plan` leeg, `soc` null, `reason` leeg |
| `capaciteit` | kWh: eerst een capaciteitssensor, anders wat de installateur intypte, anders null. Gevraagd door deze kant, voor de foto |
| `brand` | "growatt", "anker", "overig". De kaart leest dit niet |
| `accu_fabrikant` / `accu_model` | zoals altijd uit het register: bij een MIX "Growatt" en "", want `growatt_server` zet geen model |

De accustand en het vermogen staan dan NIET op de sensor. De kaart leest ze
zelf uit `entiteiten`:
- `soc` in %;
- `charge_power` en `discharge_power`: in kW bij een MIX, in W bij een SPH.

De knoppen, `leeg_tot` en de vakantiestand bestaan wel, maar doen niets.

## Wat de kaart doet

**Bij `alleen_lezen`** (`uitgelezenStand` in `batterij-logica.js`):
- **De stand** komt uit laden min ontladen: laden, ontladen, of stil onder
  50 W. Het icoon is dat van die stand.
- **Het vermogen** staat RECHTS onder de lading ("4,7 kW"), op de plek van
  de temperatuur, en niet in de regel met de stand. Eerst stond er
  "Ontladen · 4,7 kW", maar in de halve kaart van de bewerkmodus werd dat
  "Ontladen · 4,7 …", en het getal is juist wat je wilt zien. Bij stil staat
  er geen vermogen.
- **Eenheden**: W en kW worden omgerekend. Bij een andere eenheid, of geen,
  laat de kaart het weg; raden kan een factor duizend schelen.
- **Geen gegevens**: geeft de cloud niets, dan staat er "Vermogen onbekend",
  zonder lading en zonder balk. De kaart verzint geen stand.
- **Wat weggaat**: Vol laden, Leegladen, Terug naar het plan, Leegladen tot,
  de vakantieregel, de grenzen onder de balk en het plan. Ook als de
  vakantiestand nog aan staat (getoetst): die doet hier niets.
- **Een tik op de kop** opent de accustand (de geschiedenis van de Growatt),
  niet de sensor van de coach, die hier leeg is.
- **Verversen**: de kaart tekent opnieuw als een van die drie sensoren
  verandert (`watched()`).

**De foto.** `thuisbatterijen/growatt-ark-15-3h.webp` is 201×396 en 4,4 kB.
Hij is uitgesneden uit de bronfoto in `_ref`; de losse spikkels rond het
product zijn weg. Het type staat nergens in Home Assistant. Automatisch
herkent een ARK daarom aan het aantal modules:
- **Wat telt:** een model met "ARK 15.3H" erin, en anders de `capaciteit`
  van de coach.
- **De regel:** het getal moet binnen 0,15 kWh van een heel aantal modules
  van 2,56 liggen. 15,3 en 15,36 worden de 15.3H.
- **Bij twijfel geen foto.** Een gemeten 12 kWh (wat er bij de klant per 100%
  uitkwam) zit er twee modules naast. Een ARK met een ander aantal modules is
  hoger of lager, en daar is geen foto van.
- **Met de hand:** in de editor staat "Growatt ARK 15.3H" onder Afbeelding,
  na de twee Solarbanks.

**De reeks** (7.6H tot 25.6H) is niet meegenomen: er is maar één foto.

**Een staande foto.** Het fotovak was vast 84×64, voor de liggende Solarbank.
De ARK stond daarin met 25,8 px leeg aan elke kant. Nu volgt de breedte de
foto, met 84 als maximum:

| Kaart | Vak voor | Vak na | Foto tot naam, voor | Foto tot naam, na |
|---|---|---|---|---|
| Solarbank | 84×64 | 84×64 | 14 | 14 |
| Solarbank met uitbreiding | 84×64 | 67,6×64 | 22,2 | **14** |
| Growatt | 84×64 | 32,5×64 | 39,8 | **14** |
| Growatt, smal (onder 360) | 64×50 | 25,4×50 | 33,3 | **14** |

De Solarbank met uitbreiding verandert dus mee: de naam staat 8 px dichter bij
de foto, net als bij de gewone Solarbank.

## Bewijs

### Tests

`tests/js/batterij-growatt.test.mjs`, 19 tests. Ze draaien tegen de vaste invoer
`vaste-invoer/growatt-mix-ark.json`: ingekort uit de echte dump van de klant
(alleen de omvormer, het serienummer was al vervangen), met de eenheden en de
geschiedenis van die avond (ontladen tot 6,1 kW).

Tegen de code van `main` (`git archive main`, de test en de invoer erbij):

```
✔ REGRESSIEWACHT: de dump van de Growatt zelf
✖ NIEUW GEDRAG: wat de coach over een batterij zegt die hij alleen uitleest   (2 van 2)
✖ NIEUW GEDRAG: de accustand en het vermogen uit de sensoren van de batterij  (9 van 9)
✖ NIEUW GEDRAG: de foto van een Growatt ARK                                    (3 van 7)
  ✔ REGRESSIEWACHT: geeft geen foto bij twijfel (12 kWh)
  ✔ REGRESSIEWACHT: geeft een ARK met een ander aantal modules geen foto
  ✔ REGRESSIEWACHT: geeft een Growatt zonder capaciteit geen foto
  ✔ REGRESSIEWACHT: de Anker houdt zijn foto
ℹ tests 19   pass 5   fail 14
```

De vijf die op de oude code slagen zijn allemaal als REGRESSIEWACHT gelabeld:
daar kreeg een Growatt nooit een foto. Op deze tak: 1821 JS-tests groen. Ook
groen: `verify`, `check:registratie`, `check:controls` en `check:css`.
`VASTE_WEBP` in `tests/test_afbeeldingen.py` heeft de nieuwe foto.

### In een echte browser, tegen de nagebootste coach

De nagebootste coach in de testinstance heeft een tweede thuisbatterij, "Accu
schuur", met de attributen van v0.123.0 zoals de coach-sessie ze beschreef. Hij
heeft ook een apparaat "Growatt omvormer" met de sensoren uit de dump, in
dezelfde eenheden (zie CLAUDE.md, *Testmateriaal*).

Verse code: de service worker en de caches gewist en de entry herladen. De
`?v=` op de pagina is `76d9f59ae5c5`, gelijk aan de sha256 van de bundel op
schijf (`76d9f59ae5c56b3d…`).

De sensoren van de Growatt gezet met `POST /api/states`; de kaart volgde binnen
1,2 s:

| Sensoren | Kaart |
|---|---|
| soc 15, laden 0, ontladen 0 (de dump) | "Stil", pauze-icoon, 15%, niets onder de lading |
| ontladen 6,1 kW, soc 20 | "Ontladen", pijl omlaag, 20%, de balk op 20% |
| laden 2,3 kW, soc 41 | "Laden", pijl omhoog, 41% |
| alle drie `unavailable` | "Vermogen onbekend", lading en balk weg |
| vakantiestand aan (`vakantie: true` op de coach) | geen vakantieregel, geen grenzen, geen streepje in de balk |

Bij alle vijf weg: opdrachtknoppen, Leegladen tot, vakantie, plan, grenzen,
opgeleverd, reden en melding.

**Een echte klik** op de naam: `isTrusted: true`, op het pad `nm < midden <
kop < card`. Er ging een more-info open voor
`sensor.growatt_omvormer_state_of_charge`.

**De editor**, met echte kliks:
- De lijst Afbeelding toont Automatisch, de twee Solarbanks, **Growatt ARK
  15.3H**, Eigen afbeelding en Geen afbeelding. De Growatt gekozen.
- "Accu garage" getypt: 11 toetsen, allemaal `isTrusted: true`. De spatie
  kwam aan in het `input`-veld.
- Config: `{afbeelding: "growatt_ark_15_3h", name: "Accu garage",
  coach_device: ...}`, zonder geneste sleutels (valkuil 33). Het voorbeeld toont
  "Accu garage". Gesloten met Annuleren.
- De hulptekst bij Afbeelding noemt de ARK en de capaciteit.

**Breedte**, met de kaart met de hand in een vak gehangen (valkuil 40):

| Breedte | Hoogte | Stand | Onder de lading |
|---|---|---|---|
| 500 (de view) | 120 | "Ontladen", heel | "4,7 kW" |
| 280 | 120 | heel | "4,7 kW" |
| 246 (halve view) | 120 | heel | "4,7 kW" |
| 200 | 120 | heel, de naam wordt "Accu sch…" | "4,7 kW" |
| 170 | 120 | "O…", de naam "Accu…" | "4,7 kW" |

120 is twee rasterrijen. De Anker-kaarten bleven 504.

**Licht thema**: de witte kast blijft op de witte kaart zichtbaar door de grijze
randen van de modules. Het thema staat daarna weer op standaard.

## Wat er nog moet

1. **Coach 0.123.0 komt uit.** De eigenaar installeert hem, en de beheersessie
   zet de accu bij de klant op merk Growatt.
2. **De beheersessie stuurt de echte dump**: de sensor van de thuisbatterij met
   alle attributen, en de toestanden en eenheden van soc, charge_power en
   discharge_power.
3. **Die dump wordt vaste invoer**, `coach-0.123.0-batterij-growatt.json`, met
   een test erop, zoals bij 0.112.1. Wijkt hij af van de beschrijving, dan gaat
   de kaart eerst mee. Pas daarna PR, merge en uitgave 0.69.0. Dat is de
   afspraak in de kop van `coach-logica.js`: er gaat niets uit dat een attribuut
   leest dat nog niet in een echte dump stond.

## Samenvatting

- **Growatt op de kaart.** De thuisbatterijkaart kent een batterij die de coach
  alleen uitleest. De accustand en het vermogen komen uit de eigen sensoren van
  de batterij, en de knoppen, de vakantiestand en het plan zijn weg. Gemeten in
  een echte browser, tegen een nagebootste coach met de sensoren en eenheden van
  de echte Growatt-dump.
- **Foto en type.** De Growatt ARK 15.3H heeft een productfoto. Automatisch
  herkent hem aan de capaciteit bij de coach, en in de editor is hij als type te
  kiezen.
- **Staande foto's.** Het fotovak volgt nu de foto, en daardoor staat ook de
  Solarbank met uitbreiding 8 px dichter bij zijn naam.
- **Nog niet uitgebracht.** Het wacht op de echte dump van coach 0.123.0.

## Wat niet lukte

- **Niet tegen de echte coach 0.123.0 gemeten.** Die is er nog niet; alles is
  gemeten tegen de beschrijving van de coach-sessie. Daarom wacht de uitgave.
- **Op 170 px breed** worden naam en stand afgekapt. Dat geldt voor elke
  batterijkaart op een halve breedte op een telefoon, ook voor "Nul op de meter"
  bij een Anker. Niet opgelost in deze ronde.
- **Een batterij met alleen een vermogenssensor met een teken** (`entity` bij de
  coach, met `power_invert`) krijgt bij `alleen_lezen` geen vermogen op de kaart.
  Een Growatt heeft die niet. Een ander merk dat de coach niet mag sturen
  misschien wel; dan is dat een volgende vraag aan de coach.

## Aannames

- Op de sensor van de coach is de toestand bij `alleen_lezen` leeg. De kaart
  toont hem niet en leest hem niet; de nep zet hem op "".
- 50 W is stil. Growatt meldt in tienden van een kW, dus 0,1 kW is het eerste
  dat telt.
- Een vermogenssensor zonder W of kW als eenheid wordt niet gelezen.
- 0,15 kWh speling rond een heel aantal modules is genoeg voor de afgekapte
  namen (7.6H is 7,68 kWh, 23.0H is 23,04) en voor een getal met één decimaal.

## git status --porcelain

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M src/cards/batterij-card.js
 M src/cards/batterij-logica.js
 M tests/js/batterij-growatt.test.mjs
?? docs/growatt-batterij/
```

(Na het vastleggen leeg; de eerste commit van deze tak stond al op GitHub.)
