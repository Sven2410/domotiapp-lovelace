# Het energiedashboard op het infoscherm, en een afvalkalender

**Ronde van 17 september 2026.** Branch `fase-50/energie-en-afval`, uitgave 0.45.0.

## Wat er gevraagd is

> "dan wil ik bij het domotiapp infoscherm dat als je op de energie klikt dat hij
> een heel overzicht laat zien van de historie en geschiedenis etc. Dit moet hij
> van de ingestelde waardes halen van HA energydashboard. Ook wil ik een
> afvalkalender tablat hebben zodat de beheerder die ook kan toevoegen op het
> kiosk scherm"

Allebei gedaan.

---

## 1. De energiepagina komt uit het energiedashboard

Het blok toonde één sensor uit de kaartconfig. De **pagina erachter** is nu het
energiedashboard van de klant zelf: het weet wat een aansluiting is, wat
zonnepanelen zijn, wat er is teruggeleverd en welke apparaten apart gemeten
worden. Er valt dus niets te kiezen en niets in te stellen — dat heeft de klant
al gedaan toen hij zijn energiedashboard invulde.

| | |
|---|---|
| Periodes | Dag, Week, Maand, Jaar, met pijlen terug in de tijd |
| Tegels | van het net, opgewekt, teruggeleverd, accu, gas, water, kosten |
| Grafiek | gestapelde staven per tijdvak, met een legenda van wat er echt in staat |
| Bronnen | alles wat verbruikt is, uitgeschreven, met de apparaten erbij |

Het blok blijft de live-sensor tonen als die er is. **Is er geen sensor maar wel
een dashboard, dan toont het blok het verbruik van vandaag** — zo is er iets om
op te tikken. Is er geen van beide, dan staat het blok er niet.

### Het contract, gemeten en niet aangenomen

Tegen **HA 2026.8.1**, want dit is nergens betrouwbaar gedocumenteerd:

```
energy/get_prefs
  -> {energy_sources: [...], device_consumption: [...], device_consumption_water: [...]}

recorder/statistics_during_period
  {start_time, end_time, statistic_ids, period: "hour"|"day"|"month", types: ["change"]}
  -> {"<statistic_id>": [{start, end, sum, state, change}, ...]}
```

**`change` is het getal dat je wilt**, niet `sum` of `state`. `sum` is de
meterstand sinds het begin der tijden; `change` is wat er in dát tijdvak
doorheen ging. Het verschil tussen twee `sum`-waarden nemen zou bij een
teruggezette meter — een nieuwe omvormer, een sensor die opnieuw begint — een
negatief getal van duizenden kWh geven.

### De val die een uur kostte

**In HA 2026.8 bestaan `flow_from` en `flow_to` niet meer.** Een
grid-aansluiting is sinds die versie één "unified connection" met
`stat_energy_from` (import) en `stat_energy_to` (export) op het bronobject zelf,
net als bij een batterij.

Elk voorbeeld dat je vindt gebruikt nog de oude vorm, en `energy/save_prefs`
antwoordt daarop met een kaal `invalid_format` **zonder te zeggen welke sleutel
niet deugt**. Dat staat pas in het HA-log:

```
extra keys not allowed @ data['energy_sources'][0]['flow_from']
extra keys not allowed @ data['energy_sources'][0]['flow_to']
required key not provided @ data['energy_sources'][0]['cost_adjustment_day']
```

Het echte schema staat in `homeassistant/components/energy/data.py` in de
container. Dat is uiteindelijk de bron geweest — raden kostte drie pogingen,
lezen één.

`bronnenUit()` leest **allebei** de vormen: een klant die nog niet is
overgestapt heeft de oude in zijn opslag staan.

### Twee fouten die de tests vingen vóór de browser

1. **Een apparaat zonder naam heette "Apparaat"** — drie keer onder elkaar, wat
   niets zegt. Het houdt nu zijn statistiek-id.
2. **`vastePrijzen` sloeg de oude vorm over.** De prijs staat daar *binnen*
   `flow_from`, en de lus keek eerst op de bron zelf en deed `continue` voordat
   hij erbij kwam.

### En één die de browser ving

**Een jaar gaf veertien staven in plaats van twaalf.** De eerste versie van
`vulAan` leidde de stap af uit de gevonden tijdvakken: het kleinste gat tussen
twee rijen. Februari is de kortste maand, dus die stap werd 28 dagen — en daar
passen er 13,04 in een jaar.

Een maand is geen vast aantal dagen en een dag is geen vast aantal uren (de
nacht waarin de klok verzet wordt telt er 23 of 25). Het loopt nu met `Date`
over de kalender.

### Waarom het venster wordt aangevuld

Zonder aanvulling volgt de grafiek alleen de uren waarvan de recorder iets weet.
Dan is een dag om 01:00 twee staven van een half scherm breed, en versmalt elke
staaf gedurende de dag doordat er steeds meer bijkomen. Een dag heeft nu altijd
24 staven, ook de uren die nog moeten komen.

---

## 2. De afvalkalender

Een nieuw bloktype `afval`, dat de beheerder net als elk ander blok op het
scherm sleept.

De sensoren komen uit de **installatie** (`waste` in de kaartconfig van het
beheer, ten hoogste tien, alleen `sensor`). Dat is waar de lampen en de agenda's
ook staan: het zijn entiteiten, en die kiest de installateur. Wat de receptie
erover te zeggen heeft — staat het blok op het scherm en waar — gaat via de
indeling.

**De datum wordt op dezelfde manier gelezen als op de afvalkaart**: de toestand,
en dan de attributen `date`, `next_date` en `Year_month_day_date`. Die laatste is
van Afvalbeheer, dat zo'n dertig gemeenten bedient. Een tweede lezing bouwen zou
betekenen dat een bak op de kaart wél en op het scherm niet verschijnt.

**De namen worden samen ingekort** op wat ze delen: "Afval GFT" en "Afval
Restafval" worden "GFT" en "Restafval". Wat elke bak in zijn naam deelt is geen
informatie.

**De kleur draagt hier de fractie en niet het accent.** Dat is dezelfde
uitzondering als op de afvalkaart, en om dezelfde reden: grijs naast groen naast
oranje is het enige waaraan je ziet welke bak er woensdag uit moet.

Wat voorbij is of geen datum heeft **blijft staan met de reden erbij**. Een lege
plek in een rij van vier bakken leest in een wachtruimte als kapot.

---

## Het bewijs uit de browser

Alles gemeten op de testinstance, met een echt energiedashboard (aansluiting +
gas, vaste prijzen 0,28 en 1,45) en vier afvalsensoren.

### De energiepagina, alle vier de periodes

```
dag:   24 staven, as 00..23
week:   7 staven, as ma..zo
maand: 30 staven, as 1..30
jaar:  12 staven, as jan..dec
```

En de cijfers, uit de echte recorder:

```
Vandaag      Van het net 3,50 kWh · Gas 0,18 m³ · Kosten € 1,23
Deze maand   Van het net 171 kWh · Gas 8,55 m³ · Kosten € 60,28
Gisteren     0,00 kWh
```

De bron heet "Aansluiting" op het scherm — dat is de naam die in het
energiedashboard is ingevuld, niet een naam van ons.

### Het afvalblok en de pagina

```
blok     GFT  18 sep  ->  morgen        (groen vlak)
         PMD              maandag       (oranje stip)
         Papier           za 26 sep     (blauwe stip)
         Restafval        vr 2 okt      (grijze stip)

pagina   PMD — maandag · over 4 dagen
         Papier — za 26 sep · over 9 dagen
         Restafval — vr 2 okt · over 15 dagen
```

De namen zijn ingekort ("Afval GFT" → "GFT") en de kleuren volgen de fractie.

---

## Wat er misging tijdens het meten

- **Valkuil 21 drie keer**: de view bouwde niet, zonder één foutmelding. De
  toets uit CLAUDE.md wees het meteen uit — het standaarddashboard "Thuis"
  bouwde óók niet. De metingen zijn daarna gedaan met de opstelling die daarvoor
  bedoeld is: de kaart met de hand in de pagina, met de echte `hass`.
- **Valkuil 49**: de serverkant nam het veld `afval` niet aan. Een reload van de
  config entry is niet genoeg voor Python — dat vraagt `docker restart`. Dat is
  deze ronde drie keer nodig geweest.
- **`unknown_command` op een verzonnen commando**: `indeling/zet` bestaat niet,
  het is `indeling/save`, en de indeling is een object met `blokken` en geen
  array. Gevonden door de echte commandonamen op te zoeken in plaats van te
  gokken.
- **`Herkansing` heeft geen `start()`.** Die had ik verzonnen; de aanroep deed
  stil niets, waardoor het dashboard pas geladen werd als je de pagina opende.
  Nu is er één ingang (`dashProbeer_`) die zelf `plan()` doet bij
  `nogNietGereed`.

---

## Tests

| | Voor | Na |
|---|---|---|
| JS | 1091 | **1154** |
| Python | 668 | **670** |

Twee nieuwe bestanden, allebei NIEUW GEDRAG (falen op de oude code met
`ERR_MODULE_NOT_FOUND`):

- `tests/js/energie-dashboard.test.mjs` (50) — de bronnen uit allebei de
  prefs-vormen, de vensters, het optellen van `change`, de staven, de kosten en
  de kalenderaanvulling.
- `tests/js/infoscherm-afval.test.mjs` (13) — waar de datum vandaan komt, de
  sortering, en dat een sensor zonder datum blijft staan met een reden.

In `tests/infoscherm/test_store.py` twee tests erbij voor de afvalsensoren in de
installatie; één bestaande test is bijgewerkt omdat de installatie er een veld
bij heeft.

## SPEC

`SPEC.md` 20.4, 20.7 en de opslagbeschrijving zijn bijgewerkt, zoals bij de
eerdere infoschermrondes op aanwijzing van de eigenaar.

## Aannames

Geen aannames gedaan.

## `git status --porcelain`

Zie de PR-beschrijving.
