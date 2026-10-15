# 0.71.0: de deur en het programma altijd op de Miele-kaarten

De wens van de eigenaar, met 0.70.0 bij de klant, via de beheersessie:
*"ik wil ook de deurstatus op de wasmachine droger en de vriezer zien. Ook
programma etc"*. Met de machines uit stond er op wasmachine en droger alleen
"Uit", en op de vriezer niets onder de naam.

Beheer las het zo:
1. **De deurstatus op alle drie, altijd:** ook "Deur dicht", niet alleen een
   waarschuwing als hij open staat.
2. **Op wasmachine en droger programma, fase en de rest,** ook als de machine
   niet draait.

Beheer bood aan een voorstel met schermafdruk aan de eigenaar voor te leggen.
Dat is gedaan, met twee afdrukken uit de testinstance (zie *Het voorstel*).
Zijn antwoord: *"Ja, uitbrengen"*.

## Wat er gebouwd is

### Wasmachine en droger: tegels

Onder de kop staan tegels die er ALTIJD zijn, met een streep waar niets is
(`programmaTegels` in `programma-logica.js`). Ze hebben de vorm van de tegels
op de airco-kaart: de waarde groot, het label eronder, en een tik opent de
sensor met zijn geschiedenis.

| Wasmachine (acht, twee rijen van vier) | Droger (vijf) |
|---|---|
| Deur, Programma, Fase, Klaar om | Deur, Programma, Fase |
| Energie, Water, TwinDos 1, TwinDos 2 | Klaar om, Energie |

Wat er in de tegels staat:
- **Deur**: "Open" of "Dicht". Miele geeft de deur geen `translation_key`, dus
  `apparaatRollen` vindt hem aan zijn `device_class` (`door`). Bij een
  vaatwasser heet de tegel "Klep".
- **Programma**: in de woorden van Home Assistant ("Katoen"), en "Geen" bij
  `no_program`.
- **Fase**: in de woorden van Home Assistant ("Wassen"), en een streep bij
  `not_running`.
- **Klaar om**: de eindtijd als klok ("23:24"), "morgen 00:13" als het morgen
  is, en anders een streep.
- **Energie en water**: vóór de start de verwachting van Miele ("55%", met
  het label "Energie verwacht"), daarna het verbruik ("0,3 kWh", "12 L").
- **TwinDos 1 en 2** in procenten.

De resterende tijd staat niet in een tegel. Hij staat al in de statusregel
("Draait · nog 1 u 12 min"), en met een tegel erbij werd de kaart een rij
hoger.

Het rijtje programma en fase, en de regels voor verbruik en TwinDos uit 0.70.0,
zijn opgegaan in de tegels.

### Vriezer: de deur altijd in de statusregel

De statusregel noemt altijd de deur: "Deur dicht", of "Deur open" in oranje.
Een storing of een melding komt ervoor, elk op een eigen regel ("Storing",
"Deur dicht"); achter elkaar liep dat op een halve kaart over drie regels. De
kleur is die van het ergste.

### De vormregel

"Statusregels weglaten als er niets te melden is" staat in CLAUDE.md. Daar
staat nu ook dat hij op deze kaarten zelf om de deur en de tegels vroeg, zodat
een volgende ronde het niet terugdraait.

## Het voorstel

Twee schermafdrukken uit de testinstance, aan beheer gestuurd om voor te
leggen:
- alles uit, zoals nu bij de klant: wasmachine "Uit" met de deur open,
  droger "Uit", vriezer "Deur dicht";
- de wasmachine draait, de droger heeft een programma gekozen, en de
  vriezerdeur staat open.

## Bewijs

### Tests

Tegen de code van `main` (0.70.0, `git archive main`):

```
programma-miele.test.mjs   pass 19   fail 7
  ✖ vindt bij de wasmachine de deur, tijden, programma, ...    (de deur)
  ✖ toont de wasmachine van de dump, uit, met acht tegels en strepen
  ✖ toont de droger van de dump met vijf: geen water en geen TwinDos
  ✖ toont vóór de start de verwachting, en daarna het verbruik
  ✖ toont programma en fase in de woorden van Home Assistant, en de eindtijd als klok
  ✖ noemt de deur van een vaatwasser een klep, en opent bij een tik de sensor zelf
  ✖ geeft een vaatwasser zonder apparaat geen tegels
vriezer-logica.test.mjs    pass 8    fail 2
  ✖ toont de stand van de dump: -18 °C, ingesteld op -18, en de deur dicht
  ✖ meldt een open deur eerst, dan een storing, dan een melding, en de dichte deur achteraan
```

Wat op `main` slaagt is gedrag dat niet veranderde.

Drie tests uit 0.70.0 zijn weggehaald, omdat de functies weg zijn
(`programmaRegel`, `twinDosTekst`, `verbruikTekst`). De tegeltests nemen hun
plaats in.

Op de tak:
- 1864 JS-tests groen;
- `verify`, `check:registratie` en `check:controls` groen;
- `check:css` draait bij elke build en is ook groen.

### In een echte browser, tegen de nagebootste Miele

Na elke build heb ik de entry herladen en de service worker en de caches
gewist. De `?v=` van de pagina was telkens gelijk aan de sha256 op schijf, het
laatst `daf65ac1c031` (0.71.0).

**Alles uit (de dump):**
- de wasmachine: "Deur: Open, Programma: Geen, Fase: –, Klaar om: –,
  Energie: –, Water: –, TwinDos 1: 95%, TwinDos 2: 100%";
- de droger: "Deur: Dicht, Programma: Geen, Fase: –, Klaar om: –, Energie: –";
- beide kaarten 184 hoog;
- de vriezer: "Deur dicht", 120 hoog.

**In gebruik:**
- de wasmachine: "Dicht, Katoen, Wassen, 23:24, 0,3 kWh, 12 L, 95%, 100%",
  met Pauze en Stop, 248 hoog;
- de droger, met een programma gekozen: "Katoen, –, 23:47" en "55% Energie
  verwacht", met Start, 248 hoog;
- de vriezer: "Deur open", met het icoontje oranje.

**Een echte tik op de tegel Programma:** `isTrusted: true`, op het pad
`w < tegel < tegels`. Er ging een more-info open voor
`sensor.wasmachine_programma`.

**Breedte** (de kaart met de hand in een vak gehangen):

| Kaart | 175 | 246 | 380 |
|---|---|---|---|
| wasmachine, in gebruik | 2 naast elkaar, 376 hoog | 3, 312 hoog | 4, 248 hoog |
| droger, programma gekozen | 2, 312 hoog | 3, 248 hoog | |

Op geen enkele breedte wordt een waarde of label afgekapt (gemeten met
`scrollWidth` en `scrollHeight`). Onderweg gerepareerd:
- **op 175 stonden er toch drie naast elkaar:** de regel voor twee woog lichter
  dan die voor acht;
- **"Energie verwacht" paste op 246 niet:** het label mag nu over twee regels.

**De vriezer:**

| Toestand | 170 | 190 | 246 |
|---|---|---|---|
| rust ("Deur dicht") | 120 | 120 | 120 |
| deur open | 120 | 120 | 120 |
| storing en deur dicht | 184 | 184 | 120 |

## Samenvatting

- **Wasmachine en droger:** tegels die er altijd staan, met een streep waar
  niets is: deur, programma, fase, klaar om, energie, water en TwinDos. Vóór
  de start staat er de verwachting, daarna het verbruik.
- **Vriezer:** de statusregel noemt altijd de deur.
- **Goedgekeurd en uitgebracht:** de eigenaar zag het voorstel met twee
  schermafdrukken en zei *"Ja, uitbrengen"*. Uitgebracht als 0.71.0 (PR #118).

## Wat niet lukte

- **Een storing op een halve telefoonkaart (170 of 190) maakt de vriezer
  tijdelijk drie rijen hoog**, omdat "Deur dicht" daar onder "Storing" over
  twee regels loopt. Op 246 is het twee rijen.
- **Op 175 breed is de draaiende wasmachine 376 hoog** (zes rijen): acht tegels
  in twee kolommen. Drie kolommen kapten daar "0,4 kWh" af.
- **Niet tegen een draaiende echte Miele.** De lopende standen zijn nog steeds
  nagebootst.

## Aannames

- **"Programma etc"** lees ik als programma, fase, klaar om, verbruik en
  TwinDos: wat er al was, nu altijd zichtbaar. De resterende tijd staat in de
  statusregel.
- **De deur op de wasmachine en de droger** staat in een tegel, niet in de
  statusregel. Een wasmachine die met de deur open staat te luchten hoort niet
  de hele dag oranje "Deur open" te zeggen.
- **"Geen" bij het programma** en een streep bij de rest, zoals beheer
  voorstelde.

## git status --porcelain

Na het vastleggen leeg (`git status --porcelain` geeft niets).
