# De knoppen van de coach volgen of hij mag sturen (0.79.0)

16 oktober 2026, dezelfde avond als 0.78.0 tot en met 0.78.2.

## De vraag

Sinds 0.78.0 heeft een wasmachine of droger geen enkele knop op de
programmakaart, ook die van de coach niet. De eigenaar zei dat via een
beheersessie: *"wasmachines en drogers moeten alleen read only en info kaarten
zijn"*.

Later die avond gaf de coach-sessie een tweede antwoord van hem door:

> *"wasmachines van bosch bijvoorbeeld en drogers kunnen wel gestuurd worden
> dus in de toekomst ja wel sturen."*

De coach regelt dat met het vinkje "mag sturen" (`controllable`). Sinds
v0.127.0 volgt daaruit:
- het attribuut `alleen_lezen` op de startsensor, altijd true of false;
- of de drie knoppen en `vrijgegeven` beschikbaar zijn.

De coach-sessie stelde voor de knoppen op de kaart daarvan te laten afhangen.
Dat is pas gebouwd na de echte dump (de contractregel).

## De dump

`tests/js/vaste-invoer/coach-0.128.0-wasmachine-droger.json` komt van de
beheersessie bij de klant van 0.78.0. Daar draait nu coach v0.128.0, en geen
van beide machines mag gestuurd worden. Wat erin staat:
- **Startsensors:** `alleen_lezen: true`, `rule: "read-only"`, contract 1.
- **De coach zelf:** Ingeruimd (goedkoopste moment), Ingeruimd (nu starten),
  Vrijgave intrekken en Vrijgegeven staan allemaal op `unavailable`.
- **In `entiteiten`:** nog steeds de start- en stopknop van Miele. Bij de
  klant zijn die in het register uitgeschakeld, dus ze staan niet in
  `hass.states`. De beheersessie wees daar zelf op: kijk niet alleen naar
  wat `entiteiten` noemt.

**Mag sturen staat niet in een dump.** Daarvoor is de bron van de coach
gelezen (v0.128.0, 16 oktober 2026):
- `programma_alleen_lezen(device)` is `not device.get("controllable")`;
- `ProgrammaBediening.available` is daar het omgekeerde van, voor de knoppen
  en `vrijgegeven`;
- de startsensor zet `alleen_lezen` met dezelfde functie.

De coach-sessie bevestigde het: allebei uit hetzelfde vinkje, en sinds
v0.127.0 staat het attribuut er altijd. Een oudere coach heeft het niet.

## Wat er veranderd is

**`welkeKnoppen(soort, startsensor)`** in `src/cards/programma-logica.js`
beslist wat er op de kaart mag:

| apparaat | eigen knoppen (programma, start, pauze, stop, slim, Handmatig) | knoppen van de coach |
|---|---|---|
| vaatwasser | ja, zoals altijd | ja, zoals altijd |
| wasmachine of droger, `alleen_lezen: false` | nee | **ja** |
| wasmachine of droger, `alleen_lezen: true` | nee | nee |
| wasmachine of droger, een coach zonder `alleen_lezen` | nee | nee |

Alleen expliciet `false` telt (`coachStuurt`). Bij de klant van 0.78.0 waren
de knoppen met een oudere coach beschikbaar terwijl starten op afstand niet
kon. Met deze regel komen ze daar niet terug.

**De eigen knoppen van Miele blijven weg**, ook als de coach mag sturen. Het
"read only" van de eigenaar ging over die knoppen ("Failed to set state" op
aan/uit). Een coach die mag sturen, drukt zelf op Starten van Miele (zei de
coach-sessie).

**Een knop van de coach die niet beschikbaar is, staat er niet**
(`coachKnoppen` krijgt `beschikbaar` mee, de kaart geeft `knopKan`). Dat geldt
voor elk apparaat, dus ook voor een vaatwasser waarvan het vinkje uit staat.
Een knop die nooit gedrukt is staat op `unknown`, en die telt wel.

**De kaart volgt de knoppen van de coach** (`watched()`). Gaat het vinkje om,
dan verschijnen of verdwijnen ze zonder herladen.

In de editor verandert alleen de hulptekst bij het vinkje Coach. Er was geen
veld voor de knoppen van de coach, en de velden voor de eigen knoppen blijven
bij een wasmachine of droger weg.

## Tests

`tests/js/coach-miele-dump-0128.test.mjs`, 11 tests.

REGRESSIEWACHT (6), over de dump en wat er al was:
- `alleen_lezen` true, read-only, contract 1;
- de vier bedieningsentiteiten niet beschikbaar;
- de Miele-knoppen in `entiteiten`;
- de dump van v0.124.0 had geen `alleen_lezen`;
- de vaatwasser houdt zijn eigen knoppen en die van de coach;
- `coachKnoppen` zonder `beschikbaar` geeft wat hij altijd gaf.

NIEUW GEDRAG (5):
- **De dump:** geen enkele knop op wasmachine en droger.
- **Mag sturen,** nagebootst uit de dump met precies de twee dingen die de bron
  van de coach verandert: Mag draaien en Nu starten, en nog steeds geen eigen
  knoppen.
- **Een oudere coach** zonder `alleen_lezen` stuurt niet.
- **Alleen expliciet `false`** telt (null, geen attribuut, `true`, `"false"`).
- **Een knop die niet beschikbaar is** staat er niet, ook bij een vaatwasser.

Tegen de code van vóór deze wijziging (`git archive` van de tak van 0.78.2):

```
✖ de dump: geen enkele knop op de wasmachine en de droger
    actual:   [ { eigen: true, coach: true }, [ 'Mag draaien', 'Nu starten' ], [] ]
    expected: [ { eigen: false, coach: false }, [], [] ]
✖ mag sturen: Mag draaien en Nu starten, en nog steeds geen eigen knoppen van Miele
    actual:   [ { eigen: true, coach: true }, [ 'Mag draaien', 'Nu starten' ], [] ]
    expected: [ { eigen: false, coach: true }, [ 'Mag draaien', 'Nu starten' ], [] ]
✖ een oudere coach zonder alleen_lezen stuurt niet     TypeError: P.coachStuurt is not a function
✖ alleen expliciet false telt ...                       TypeError: P.coachStuurt is not a function
✖ een knop die niet beschikbaar is staat er niet        actual: [ 'Ingeruimd', 'Nu starten' ]  expected: [ 'Nu starten' ]
ℹ pass 6
ℹ fail 5
```

Eerlijk erbij: op de KAART toonde de oude code bij de dump ook geen knoppen.
Dat besliste de kaart toen zelf, op het soort apparaat. De eerste toets faalt
op de oude code omdat de beslissing nu in een functie zonder DOM staat. Het
echte nieuwe gedrag is de tweede toets en de laatste.

## Bewijs in een echte browser

Testinstance, view `miele` van `kaart-test`, in Chrome op de pc. Verse code:
- de config entry is herladen, en de service worker en de caches zijn
  gewist;
- de `?v=` van de geladen bundel was `93454a3a80f1`;
- dat is de sha256 op schijf (`93454a3a80f1b42c…`).

**De nagebootste coach** (`.ha-dev-config/custom_components/domotiapp_coach/was.py`,
niet in git) heeft nu een wasmachine, met:
- dezelfde entity_id's als in de dump;
- een dienst `domotiapp_coach.mag_sturen` die doet wat het vinkje bij de
  echte coach doet: `alleen_lezen` en de beschikbaarheid samen.

Zijn `entiteiten` wijzen naar de nagebootste Miele-wasmachine. Op de view
staat een tweede wasmachinekaart, met de coach aan.

| moment | kaart met coach | knoppen | hoogte |
|---|---|---|---|
| vinkje uit (zoals de dump) | Deur open · laatste beurt vandaag 17:49 – 17:50 | geen | 184 |
| vinkje aan, zonder herladen | idem | Mag draaien, Nu starten | 248 |
| echte klik op Mag draaien | Start morgen om 01:30 · laatste beurt … · Deur open | Vrijgegeven, Nu starten | 248 |
| vinkje weer uit | Deur open · laatste beurt vandaag 17:49 – 17:50 | geen | 184 |

**De klik:**
- `isTrusted: true`;
- het pad was `lb` → `knop vrijgave` → `rij coach` → `card surface`;
- de coach ging op `vrijgegeven: true`, met stand `gepland`.

**Daaromheen:**
- de wasmachine- en drogerkaart zonder coach hadden steeds geen knoppen, en
  waren 184 hoog;
- de vaatwasser zonder coach (view `thema`) had Slim, Start en Stop.

## Controles

- `npm run build` (met `check:css`), `verify`, `check:registratie` en
  `check:controls`: groen.
- `npm test`: 1990 tests, alle groen.
- Python: 874 tests, alle groen (lokaal in Docker). Aan de serverkant is
  niets veranderd.

## Samenvatting

Een wasmachine of droger krijgt de knoppen van de coach (Mag draaien, Nu
starten) als de coach hem mag sturen, en anders niet. Dat volgt het vinkje
bij de coach, zonder herladen. De eigen knoppen van de machine blijven weg.
Bij de klant met de Miele-machines verandert er niets: daar staat het vinkje
uit.

## Wat niet lukte

- **Een vaatwasser MET de coach is niet in de browser nagelopen.** Op de view
  `thema` staat de vaatwasser zonder coach. De verandering daar (een
  onbeschikbare coachknop valt weg) staat wel in de unittests. De knoppen van
  de nagebootste vaatwasser zijn altijd beschikbaar, dus in de browser zou er
  niets anders te zien zijn geweest.
- **"Mag sturen" komt niet uit een echte dump** maar uit de bron van de coach
  (zie De dump). Komt er een installatie waar het vinkje aan staat, dan hoort
  die dump erbij.

## Aannames

- **De eigen knoppen van Miele blijven weg, ook als de coach mag sturen.** Zo
  afgestemd met de coach-sessie: die drukt dan zelf op Starten. Wil de
  eigenaar ze er toch bij hebben, dan is dat `eigen` in `welkeKnoppen`.
- **Een onbeschikbare coachknop weglaten geldt voor elk apparaat.** Bij een
  vaatwasser van de eigenaar mag de coach sturen, dus daar verandert niets.
  Een knop die niets doet, hoort er nergens te staan.

## `git status --porcelain`

Schoon na de commit.
