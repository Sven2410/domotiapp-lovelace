# 0.70.0: Miele, voor wasmachine, droger en vriezer

De vraag kwam op 15 oktober 2026 via de beheersessie, voor een klant met een
Miele-wasmachine (WWI880), -droger (TWH780WP) en -vriezer (FNS 7710 E), allemaal
via de core-integratie `miele`. De eigenaar koos:

1. **Eén kaart voor alles met een programma.** De vaatwasserkaart wordt de
   kaart voor vaatwasser, wasmachine en droger, met merk, type en foto (Miele
   eerst). Op het dashboard blijft het een kaart per apparaat.
2. **Wat erop staat bij wasmachine en droger**, naast status, programma, fase
   en resterende tijd:
   - start, pauze en stop, alleen als Miele de knop beschikbaar maakt;
   - TwinDos;
   - het verbruik met de verwachting;
   - starten om.

   *"Bouw alleen de noodzakelijke dingen die de integratie toelaat."* Dus geen
   toerental en geen droogtegraad.
3. **De vriezer krijgt een eigen kaart:** de temperatuur, die instellen, deur
   en melding. Geen supervriezen en geen modus.
4. **Fotorecht:** fabrieksfoto's van Miele mogen erin, met toestemming als
   installateur (15 oktober 2026).

## Wat er gebouwd is

### De kaart voor vaatwasser, wasmachine en droger

Het `type` bleef `custom:domotiapp-dishwasher-card`, want dat staat in
dashboards. In de kaartkiezer heet hij nu "DomotiApp Vaatwasser, wasmachine en
droger".

**De rest van het apparaat zoekt de kaart zelf** (`programma-logica.js`). Je
kiest de statussensor, en de kaart zoekt op hetzelfde apparaat en dezelfde
integratie, op `domein:translation_key`. Het domein hoort erbij, want Miele
heeft een knop `start` én een sensor `start`. Wat de kaart zo vindt:
- de resterende tijd, anders de eindtijd;
- de verstreken tijd, voor de balk;
- start, pauze en stop;
- de starttijd en "start in";
- programma en fase;
- TwinDos;
- energie, water en hun verwachting.

Een veld dat in de editor is ingevuld gaat voor. De velden die het apparaat
levert staan niet meer in de editor (`editorVelden`), net als bij de coach.

**De status van Miele heeft een eigen tabel** (`statusDuiding` in
`vaatwasser-logica.js`). Miele meldt vaste sleutels, en die passen niet in de
woordenlijst van de kaart. `on` is bij Miele "Aan" (het display staat aan) en
niet "draait", en `in_use` en `program_ended` stonden er niet in. Een
Miele-sensor herkent de kaart aan zijn opties. Elke andere statussensor gaat
zoals altijd.

**Programma en fase** komen in de woorden van Home Assistant zelf
(`formatEntityState`): "Katoen · Wassen". De integratie heeft 49 programma's
en 23 fasen voor de wasmachine vertaald, en die lijst groeit met elke update.

**De voortgangsbalk** is verstreken gedeeld door verstreken plus resterend.
Miele heeft geen voortgangssensor, maar wel die twee tijden, en samen zijn ze
de duur die de machine zelf noemt.

**Starten om** komt uit de sensor `start`. Volgens `sensor.py` van Miele is
dat bij een uitgestelde start het moment waarop hij begint, en bij een lopend
programma het moment waarop het begon. Dat laatste valt weg, want een moment
in het verleden telt voor "Start om" niet mee.

**Knoppen staan er alleen als ze te drukken zijn** (`knopKan`). Een knop die
`unavailable` is doet niets, en Miele maakt start alleen beschikbaar met
"start op afstand" aan. Er is een veld Pauze bij gekomen. Dat geldt voor elke
vaatwasser, want Miele heeft een aparte pauzeknop.

**Merk, type en foto** gaan via `productfoto.js`, dat nu ook in `model_id`
zoekt. Miele zet daar het type ("WWI880"), en in `model` de soort ("Washing
machine"). Het icoon zonder foto is dat van de soort: een wasmachine krijgt
geen vaatwasser. Daarom heeft de kaart geen vast icoon `dishwasher` meer.

### De vriezerkaart

`custom:domotiapp-vriezer-card` ("DomotiApp Vriezer"), `vriezer-card.js` en
`vriezer-logica.js`.
- **Je kiest de climate.** De temperatuursensor, de deur, de storing
  (`probleem`, zonder `translation_key`) en de melding
  (`notification_active`) zoekt de kaart op hetzelfde apparaat.
- **Wat erop staat:** de temperatuur groot rechts, en "Instellen op
  [− -18 °C +]" in hele graden van -28 tot -15. Tikken loopt voor, en pas na
  600 ms gaat er één aanroep uit.
- **De statusregel** staat er alleen als er iets is, in deze volgorde: deur
  open, storing, melding. Alleen het icoon draagt de kleur.
- **Spookzones:** Miele maakt ook `climate.vriezer_zone_2` en `_zone_3`, zonder
  temperatuur. Bij het toevoegen kiest de kaart daarom een climate mét
  temperatuur.

### De foto's

Ze staan onder `afbeeldingen/`, uitgesneden en op 396 hoog, samen 37 kB:

| Bestand | Maat |
|---|---|
| `wasmachines/miele-wwi880.webp` | 278×396 |
| `wasdrogers/miele-twh780wp.webp` | 279×396 |
| `vriezers/miele-fns-7710-e.webp` | 168×396, met de deur open, zo levert Miele hem aan |

## Bewijs

### Tests

Twee nieuwe testbestanden draaien tegen de vaste invoer
`vaste-invoer/miele-was-droog-vries.json`. Die is gemaakt uit de dump van de
klant, in de vorm van de frontend (devices, entities, states), met
serienummers en ids vervangen:
- `programma-miele.test.mjs`, 24 tests;
- `vriezer-logica.test.mjs`, 10 tests.

De dump liet zien:
- de wasmachine en de droger stonden uit;
- de knoppen stonden door de integratie uit, dus niet in `hass.entities`;
- deur en probleem hebben geen `translation_key`.

Een lopend programma stond er niet in. Die toetsen zetten de toestanden zelf,
met de sleutels uit de opties van de dump.

**Tegen de code van `main`** (`git archive main`):
- **De twee nieuwe testbestanden laden niet eens:** `programma-logica.js` en
  `vriezer-logica.js` bestonden niet. De REGRESSIEWACHT-tests daarin toetsen
  alleen de dump zelf (de vorm van `model` en `model_id`, de opties, de
  spookzones), en een vaatwasser zonder Miele-opties die blijft zoals hij was.
- **`vaatwasser-coach.test.mjs`:** drie bestaande tests zijn aangepast, want
  de veldlijst van de editor heeft nu Pauze. Op `main` vallen precies die drie
  om; de rest slaagt.

Op deze tak:
- 1862 JS-tests groen;
- `verify`, `check:registratie`, `check:controls` en `check:css` groen;
- de Python-tests groen in de CI van PR #117. Ze dekken `VASTE_WEBP`, met de
  drie nieuwe foto's.

### In een echte browser, tegen een nagebootste Miele

De nagebootste Miele in de testinstance speelt de dump na: dezelfde 62
entiteiten, `translation_key`'s, opties, `model` en `model_id`, met de
vertalingen van de echte integratie (zie CLAUDE.md, *Testmateriaal*). Na het
wissen van de service worker en de caches was de `?v=` van de pagina telkens
gelijk aan de sha256 op schijf, het laatst `6cf9a40c19b7`.

**De wasmachine, met echte kliks** (allemaal `isTrusted: true`, gemeten met een
abonnement op `nep_miele`):

| Stap | Op de bus | Op de kaart |
|---|---|---|
| uit (de dump) | - | "Uit", TwinDos 95% · 100%, geen knoppen, 120 hoog |
| programma gekozen, start op afstand aan | - | "Klaar om te starten", "Katoen", "Energieverwachting 60% · Waterverwachting 70%", alleen Start |
| klik op **Start** | `start`, kon: true | "Draait · nog 1 u 30 min", "Katoen · Wassen", balk, Pauze en Stop, het icoontje in de statusregel blauw |
| 20 s later | - | "nog 1 u 27 min", balk 3%, "Energie 0,1 kWh (verwachting 60%) · Water 2 L (verwachting 70%)" |
| klik op **Pauze** | `pause`, kon: true | "Gepauzeerd", het icoontje oranje, Start en Stop |
| klik op **Stop** | `stop`, kon: true | "Aan", geen programma, geen knoppen, weer 120 hoog |

Daarna via de nep:

| Stand | Op de kaart |
|---|---|
| uitgestelde start, 150 min | "Start morgen om 00:13" (uit de starttijd 22:13 UTC), "ECO 40-60", Start en Stop |
| programma klaar | "Programma klaar", "ECO 40-60 · Einde", "Energie 0,7 kWh (verwachting 60%) · Water 46 L (verwachting 70%)" |
| storing | "Storing" |
| droger draait | "Draait · nog 1 u 35 min", "Katoen · Drogen", alleen energie (geen water en geen TwinDos), Pauze en Stop |

**De vriezer**, met echte kliks:
- Twee tikken op "−": de kaart toonde direct "-20 °C", gemarkeerd als
  onderweg, zonder aanroep. Daarna ging er precies één `set_temperature` met
  -20 uit.
- De temperatuur liep van -18 naar -20.

De meldingen via de nep:

| Toestand | Statusregel | Icoontje |
|---|---|---|
| rust | geen | geen |
| deur open | "Deur open" | oranje |
| storing | "Storing" | rood |
| melding | "Melding op de vriezer" | oranje |

De kaart bleef in alle vier 120 hoog.

**Uitlijning van de vriezer** (246 breed): foto, naam en temperatuur op
dezelfde hartlijn (151,6), "Instellen op" en de stepper ook (203,6), en 13 px
marge links en rechts.

**Smal**, met de kaart met de hand in een vak gehangen (valkuil 40):

| Kaart | 170 | 190 | 220 | 246 | 380 |
|---|---|---|---|---|---|
| vriezer, deur open, voor de reparatie | stepper liep 52 px buiten de kaart, "Deur op..." | "Deur op..." | "Deur op..." | goed | |
| vriezer, na de reparatie | 120, alles binnen, "Deur open" over twee regels | idem | 120 | 120 | |
| wasmachine, draait | 248, status heel (na de reparatie) | | | 184 | 184, knoppen met tekst |

De reparatie: onder 230 breed een kleinere foto en temperatuur, een melding die
mag doorlopen, en alleen de stepper. De statusregel van de wasmachine mag onder
240 doorlopen; eerst stond er "Draait · nog 4...".

**De editors**, met echte kliks:
- **Wasmachine.** De editor toont Naam, Merk, de coach, de statussensor, de
  programmakeuze, de deursensor en Slimme sturing. Resterende tijd,
  voortgang, start, pauze en stop zijn weg, want die vindt de kaart zelf.
  - Merk "Miele" gekozen: Type verscheen, vanzelf op "WWI880 (wasmachine)".
  - "Wasmachine zolder" getypt: 17 toetsen, allemaal `isTrusted: true`, de
    spatie in het `input`-veld.
  - Config: `{merk: "miele", model: "wwi880", name: "Wasmachine zolder",
    status: ...}`, zonder geneste sleutels.
- **Vriezer.** De editor toont Vriezer, Naam en Merk.
  - "Vriezer kelder" getypt: 14 toetsen, allemaal `isTrusted: true`, de spatie
    in het `input`-veld.
  - Geen geneste sleutels.

Beide gesloten met Annuleren.

**Regressie:** de gewone vaatwasser op de view `thema` (helpers
`input_select`, `input_button`) ziet eruit als voorheen: het vaatwasser-icoon,
"Klaar om te starten", de programmakeuze, Slim, Start en Stop, 184 hoog.

**Licht thema:** de witte machines blijven zichtbaar op hun eigen vlakje. Het
thema staat daarna weer op standaard.

## Wat er nog komt

- **Een dump van een DRAAIEND programma** bij de klant (beheer maakt hem). De
  sleutels staan al in de opties van de dump, en de tijden volgen de broncode
  van Miele. Toch is het pas met een echte dump zeker.
- **De coach gaat wasmachine, droger en vriezer weer als apparaat kennen.**
  Wasmachine en droger mag hij starten, de vriezer leest hij alleen uit. De
  kaart volgt bij de coach al de modellen Wasmachine en Droger, met Ingeruimd
  ("Mag draaien"), Nu starten en Handmatig. Welke entiteiten de coach in
  `entiteiten` zet, stem ik met de coachsessie af. Daar wordt niets van
  uitgebracht voordat het in een echte dump staat.

## Samenvatting

- **Eén kaart voor alles met een programma.** De vaatwasserkaart is nu de kaart
  voor vaatwasser, wasmachine en droger, met merk, type en foto. Bij Miele
  zoekt hij de rest van het apparaat zelf:
  - tijden, programma en fase;
  - start, pauze en stop, alleen als ze kunnen;
  - TwinDos, verbruik en de geplande start.
- **De vriezerkaart is nieuw.** Hij toont de temperatuur, laat hem instellen,
  en meldt deur, storing en melding.
- **Getoetst en gemeten.** Alles is getoetst tegen een echte dump van de klant,
  en in een echte browser gemeten tegen een nagebootste Miele die die dump
  naspeelt.

## Wat niet lukte

- **Niet tegen een draaiende echte Miele.** De dump is van machines die uit
  stonden; de lopende standen zijn nagebootst.
- **Op 175 breed wordt de wasmachinekaart 248 hoog** (vier rijen), omdat het
  verbruik met de verwachting over drie regels loopt. Op 246 en breder is hij
  184. Weglaten zou informatie kosten; ingekort is het niet.
- **De twee nieuwe testbestanden zijn op de oude code alleen als geheel
  omgevallen** (de modules bestonden niet). Hun regressiewachten zijn daar dus
  niet los aangetoond.

## Aannames

- Miele `on`, `idle` en `reserved` zijn "Aan", `programmed` is "Klaar om te
  starten", `service` heet "Instellingen" (het woord van Home Assistant), en
  `rinse_hold` "Spoelstop". Een sleutel die niet in de tabel staat is rust.
- Bij Miele zet de kaart de deursensor NIET vanzelf in de statusregel: de
  eigenaar koos die niet voor wasmachine en droger. Wie hem wil, vult het veld
  in, en dan heet het "Deur open".
- "Verwachting" voor de procenten die Home Assistant "Energieverbruik
  voorspelling" noemt.
- Het verbruik staat er ook als het 0 is, want 0 kWh aan het begin van een
  programma is een waarde.

## git status --porcelain

Na het vastleggen leeg (`git status --porcelain` geeft niets).
