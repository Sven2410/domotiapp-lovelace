# Wasmachine en droger: alleen uitlezen, en de laatste beurt (0.78.0)

16 oktober 2026. De vraag kwam via een beheersessie bij een klant met een
Miele-wasmachine (WWI880) en -droger (TWH780WP), na de eerste echte beurten.
De eigenaar:

> *"wasmachines en drogers moeten alleen read only en info kaarten zijn ik wil
> ook dan de laatste beurt als geschiedenis op de kaart zien tot dat hij aan
> staat dan de live data zien"*

Starten op afstand werkte daar niet. Miele vraagt "start op afstand" op de
machine zelf, bij elk programma opnieuw. Daardoor werd de startknop nooit
beschikbaar, en de knop aan/uit gaf "Failed to set state".

**Dit is een voorstel.** Op zijn verzoek eerst schermafdrukken, net als bij
0.71.0. De PR wordt pas gemerged en uitgebracht na zijn akkoord.

## Wat er gebouwd is

### Geen knoppen bij wasmachine en droger

De programmakaart (`custom:domotiapp-dishwasher-card`) toont bij een wasmachine
of droger geen start, pauze en stop, geen programmakeuze, geen Slim, en ook de
knoppen van de coach niet (Ingeruimd, Nu starten, Handmatig).
- **Wat blijft:** de geplande start van de coach in de statusregel, want dat
  is uitlezen.
- **Wat met de vaatwasser gebeurt:** niets. Die noemde hij niet, en die houdt
  zijn knoppen.

Of het een wasmachine of droger is, ziet de kaart aan het apparaat in Home
Assistant (`apparaatSoort`, zoals sinds 0.70.0). In de editor van zo'n kaart
staan de velden voor programmakeuze, start, pauze, stop en slimme sturing ook
niet meer. De hulptekst bij het vinkje Coach zegt wat dat dan nog doet.

### De laatste beurt als hij uit staat

Staat hij uit, dan zegt de statusregel:

> Uit · laatste beurt vandaag 12:48 – 13:09

En de tegels zijn die van die beurt, in **dezelfde aantallen als live**. Zo
verspringt de kaart niet van hoogte als hij aan- of uitgaat.

| | live (zoals 0.71.0) | uit, de laatste beurt |
|---|---|---|
| wasmachine | deur, programma, fase, klaar om, energie, water, TwinDos 1 en 2 | deur, programma, **temperatuur**, **duur**, energie, water, TwinDos 1 en 2 |
| droger | deur, programma, fase, klaar om, energie | deur, programma, **droogtegraad**, **duur**, energie |

- **Deur en TwinDos** zijn die van nu; die horen niet bij een beurt.
- **Programma en droogtegraad** staan er in de woorden van Home Assistant zelf
  ("Express 20", "Extra droog").
- **"Vandaag"** wordt om middernacht vanzelf "gisteren", daarna "vr 16 okt".
- **Een tik op een tegel** opent de sensor, met zijn geschiedenis.

Zodra hij aangaat (ook alleen klaargezet) staan de live gegevens er weer.

**Waarom uit de recorder.** Bij "uit" zet Miele alles van het programma
tegelijk op `unknown`: programma, verbruik, temperatuur, de tijden. Wat er
liep, weet de kaart dus alleen nog uit de geschiedenis. De kaart vraagt die op
(`history/history_during_period`, tien dagen terug, alleen de zes sensoren die
hij nodig heeft). Dat gebeurt één keer per keer dat de machine uitging, en net
na het uitgaan pas na acht seconden, want de recorder schrijft met vertraging
weg (valkuil 32). Tot het antwoord er is, staan de tegels van nu er (strepen).

**Wat een beurt is** (`laatsteBeurt` in `programma-logica.js`), afgeleid uit
een dump van een hele dag bij de klant:
- de status loopt `off`, `programmed`, `in_use`, `program_ended`, `off`;
- de beurt begint bij de `in_use` na de laatste `programmed`. Een afgebroken
  start (`in_use`, `program_interrupted`, `programmed`, `in_use`) telt dan niet
  mee;
- zonder `programmed` (meteen aan de knop) begint hij bij de eerste `in_use`;
- een pauze hoort bij de beurt;
- hij eindigt waar hij ophoudt te draaien (`program_ended`, of `off` bij een
  beurt die met de hand gestopt is);
- de waarden zijn de laatste die bekend waren vóór de status "uit" werd.

### Wat er NIET op staat: het toerental

Beheer noemde het toerental bij de laatste beurt van de wasmachine. Het staat er
niet op. Met negen tegels krijgt de wasmachine een derde rij, en springt de
kaart van hoogte bij aan en uit. Bij 0.70.0 zei de eigenaar bovendien
*"geen toerental en geen droogtegraad"* (voor live). De droogtegraad staat er
bij de laatste beurt wél, op de plek van de fase; dat past zonder extra rij.
Allebei is één regel om te wisselen. **Dit is de vraag aan de eigenaar.**

## De dump

`tests/js/vaste-invoer/miele-beurten.json`: het antwoord van
`/api/history/period` over 16 oktober 00:00–17:30. Een beheersessie haalde het
op, en voor de repo is het ingekort tot de tien sensoren die tellen, met drie
attributen. Er stonden geen namen of serienummers in.

Wat de kaart eruit haalt, afgekapt op een moment dat de machine uit stond:

| | beurt | van – tot | duur | programma | | energie | water |
|---|---|---|---|---|---|---|---|
| wasmachine | 1 | 09:00 – 10:10 | 70 min | Katoen | 30 °C | 0,3 kWh | 46 L |
| | 2 | 10:27 – 11:33 | 66 min | Katoen | 30 °C | 0,2 kWh | 33 L |
| | 3 | 12:48 – 13:09 | 22 min | Express 20 | 40 °C | 0,2 kWh | 17 L |
| droger | 1 | 10:25 – 11:27 | 62 min | Katoen | normaal | 0,4 kWh | |
| | 2 | 11:50 – 12:17 | 27 min | Katoen | normaal | 0,1 kWh | |
| | 3 | 12:25 – 12:50 | 26 min | Katoen | extra droog | 0,2 kWh | |

Dat is precies wat de beheersessie per beurt beschreef. De afgebroken start van
08:59 telt niet mee, en het korte "aan" om 12:17 (zonder programma) ook niet.

## Bewijs in een echte browser

Testinstance, als beheerder, view `miele` van `kaart-test`. Verse code:
`?v=30c8c10948dd`, de sha256 op schijf. Daarna ging alleen het versienummer
naar 0.78.0.

**De nagebootste Miele** (`.ha-dev-config/custom_components/nep_miele/`, niet in
git) kan nu meer:
- hij geeft temperatuur, toerental en droogtegraad;
- bij "uit" zet hij alles op `unknown`, net als de echte.

**De dag van de dump in de recorder.** De dag uit de dump is met de hand in de
recorder van de testinstance gezet, met dezelfde entity_id's. Daarmee tonen de
kaarten de echte beurten:
- **wasmachine:** "Uit · laatste beurt vandaag 12:48 – 13:09", met Express 20,
  40 °C, 22 min, 0,2 kWh en 17 L;
- **droger:** "Uit · laatste beurt vandaag 12:25 – 12:50", met Katoen, Extra
  droog, 26 min en 0,2 kWh.

Geen knoppen, en beide kaarten zijn 184 hoog.

**Een beurt live nagespeeld** met de nep: klaargezet, draaien, klaar, uit. De
knoppen van de nep stonden daarbij met opzet aan ("start op afstand"). Een
waarnemer op de kaart legde vast (ms, statusregel, en wat de nep op dat moment
te drukken had):

```
     0  Uit · laatste beurt vandaag 12:48 – 13:09                    knoppen op kaart: geen
     6  Klaar om te starten        (nep: Start te drukken)           knoppen op kaart: geen
  2511  Draait · nog 3 min         (nep: Pauze en Stop te drukken)   knoppen op kaart: geen
 27566  Programma klaar                                              knoppen op kaart: geen
 42988  Uit                        (tegels met strepen)
 51006  Uit · laatste beurt vandaag 17:49 – 17:50  Katoen | 30 °C | 0 min | 0,1 kWh | 2 L
```

Wat dat laat zien:
- **Na het uitgaan:** de nieuwe beurt staat er 8,0 s later.
- **Hoogte:** de kaart is de hele tijd 184 hoog.
- **De duur van 0 min:** de nep telt een minuut per tien seconden, dus de beurt
  duurde echt 25 seconden.

**Een tegel aantikken:** een echte klik (`isTrusted: true`) op de tegel
Programma van de laatste beurt opende `sensor.wasmachine_programma`, met de
geschiedenis.

**De editor:** in de bewerkmodus, met echte kliks, had de editor van de
wasmachinekaart alleen nog naam, merk, coach, statussensor, deursensor en
kaal. Het voorbeeld toonde de laatste beurt. Geannuleerd, niets opgeslagen.

**De vaatwasser** (view `thema`): "Klaar om te starten", met Slim, Start, Stop
en de programmakeuze, zoals altijd.

**Schermafdrukken voor de eigenaar** (kladmap van de browser, niet in git):
- `screenshot-1792165761042-1.png`: wasmachine en droger uit, met de echte
  laatste beurten;
- `screenshot-1792165792125-2.png`: de wasmachine draait (live, zonder
  knoppen), de droger uit.

## Tests

`tests/js/programma-beurt.test.mjs`, 17 tests. Alle 17 NIEUW GEDRAG, behalve
drie REGRESSIEWACHTEN:
- de vorm van de dag in de dump (twee);
- `apparaatRollen` zonder tweede argument vindt wat hij altijd vond.

De rest:
- de zes beurten van de dump, en geen beurt terwijl hij draait of voor de
  eerste;
- een met de hand gestopte beurt;
- het antwoord van de websocket omzetten;
- wanneer en duur in woorden;
- de tegels: acht en vijf, net als live, met de deur en TwinDos van nu;
- alleen uitlezen, en geen knopvelden in de editor.

Tegen de oude code (`git archive main`, de test en de vaste invoer erin):

```
ℹ pass 2
ℹ fail 15
```

De twee die slagen zijn de regressiewachten op de dump zelf. De wacht op
`apparaatRollen` faalt op de oude code alleen op zijn tweede helft
(`BEURT_ROLLEN` bestond nog niet).

Bestaande tests: ongewijzigd, ook `programma-miele.test.mjs`. Daar staat dat
de rollen van de droger geen droogtegraad bevatten; dat blijft zo, want de
droogtegraad zit in een aparte lijst (`BEURT_ROLLEN`).

## Controles

- `npm run build` (met `check:css`), `verify`, `check:registratie`,
  `check:controls`: groen.
- `npm test`: 1966 tests, alle groen.
- Python: zie de PR. Aan de serverkant is niets veranderd.

## Samenvatting

Een wasmachine en een droger hebben geen knoppen meer. Staat hij uit, dan toont
de kaart de laatste beurt: wanneer, hoe lang, programma, temperatuur of
droogtegraad, energie en water. Die komt uit de recorder, met dezelfde aantallen
tegels als live. Getoetst op een echte dag van de klant, en in de browser live
nagespeeld.

## Wat niet lukte

Niets. Niet getest in de browser: een wasmachine met de coach aan. De
testinstance heeft geen coachapparaat voor een wasmachine. De code slaat het
hele knopdeel over vóórdat de coach aan bod komt (`paintBediening_`).

## Aannames

- **Alleen wasmachine en droger**, aan het apparaat herkend. Een vaatwasser
  houdt zijn knoppen.
- **Toerental niet op de kaart** (zie hierboven); de vraag aan de eigenaar.
- **"Aan" (Miele `on`, het display aan zonder programma) telt als aan**, en
  toont dus de live tegels (met strepen), niet de laatste beurt. Zo stond het
  in de vraag: *"zodra hij aangaat (status niet meer off)"*.
- **Tien dagen terug**, de standaard van de recorder. Staat een machine langer
  stil, dan staan er strepen.

## `git status --porcelain`

Schoon na de commit.
