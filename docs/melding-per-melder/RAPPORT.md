# Twee gebeurtenissen op één camera zijn twee meldingen

**Uitgave 0.33.1 — 28 augustus 2026**

> "Nu als ik de melding ingedrukt houd dan wil hij een livestream starten, maar
> ik wil net als de camera's een snapshot hebben van de aanbellen en
> ontgrendeling."

---

## Eerst wat er in zijn installatie staat

Read-only uitgelezen, met zijn toestemming. **Het werkt al.** Zijn regels:

```
camera.voordeur   aan=True  rust=60s
   - event.voordeur_deurbel_drukken   naam=Aanbellen
   - event.voordeur_toegang           naam=Ontgrendelen
```

En in de timeline staat het beeld ook:

```
14:52:11   camera.voordeur   Aanbellen
```

Dus onze kaart maakt sinds 0.33.0 een snapshot van het aanbellen en stuurt die
mee in de melding. Van het ontgrendelen staat er nog niets, en dat klopt met de
geschiedenis: `event.voordeur_toegang` vuurde vandaag om 12:26 — vóór de
uitgave.

## Waar die livestream dan vandaan komt

Uit zijn **eigen automatiseringen**. Ze staan er allebei, en ze gingen tien
seconden ná de onze af:

```
14:52:21   automation.bezoeker_voordeur_snapshot_notificatie
14:52:10   automation.test_bezoeker_intercom
12:26:21   automation.ontgrendeling_voordeur_snapshot_notificatie
```

Ze draaien op zijn eigen blueprint
`Sven2410/universele_snapshot_notificatie_met_cooldown_+_bestandsopslag.yaml`,
met `trigger_entity: event.voordeur_deurbel_drukken` en `camera_entity:
camera.voordeur` — precies dezelfde twee melders die hij nu ook op de kaart heeft
gezet.

**Hij krijgt dus twee meldingen per aanbellen.** Onze melding draagt het beeld
(`image` voor Android, `attachment` voor iOS) en verder niets; er zit geen
`entity_id` in, dus wij starten nooit een livestream. Die komt uit die van hem.

**Wat hij kan doen:** die twee automatiseringen uitzetten. Dan houdt hij onze
melding over, met de snapshot. Zet hij ze aan, dan krijgt hij ze allebei — en dat
mag, maar dan is één ervan die met de livestream.

Dit is niet met zekerheid te zeggen zonder zijn telefoon: welke van de twee hij
lang indrukte, is aan onze kant niet te zien. Wat er wél staat, staat hierboven.

## Wat er wél mis was

Bij het nakijken kwam een echte fout boven water, en die raakt precies deze twee
melders.

De melding droeg **één tag per camera**: `domotiapp-camera.voordeur`. Android
vervangt een melding met dezelfde tag. Dat is met opzet — twintig bewegingen op
dezelfde oprit horen één regel te zijn en geen stapel — maar aan zijn voordeur
hangen **twee verschillende melders aan dezelfde camera**:

```
event.voordeur_deurbel_drukken  ->  camera.voordeur
event.voordeur_toegang          ->  camera.voordeur
```

Belt er iemand aan en gaat de deur daarna van slot, dan **duwde "Ontgrendelen"
de melding "Aanbellen" van zijn scherm**. Weg voordat hij gekeken had.

**De tag gaat nu per camera én melder.** Herhaalde bewegingen van dezelfde melder
vallen nog steeds samen; twee verschillende gebeurtenissen blijven allebei staan.
Ze houden dezelfde `group`, dus ze staan wel netjes bij elkaar.

---

## Wat er gemeten is

**Op zijn installatie** (alleen gelezen): de bewakingsregels, de timeline, de
lijst automatiseringen met hun `last_triggered`, en de configuratie van de twee
blueprint-automatiseringen.

**Op de testinstance**, in de proeven: twee meldingen van dezelfde camera met
verschillende melders krijgen verschillende tags en dezelfde groep. Een melding
zonder melder valt terug op de oude vorm.

## Proeven

```
npm test         900 groen
python -m pytest 604 groen (2 nieuw, in tests/bewaking/test_meldingen.py)
check:css / check:registratie / verify   OK
```

## Wat niet lukte

**Welke melding hij lang indrukte is niet vast te stellen.** Dat gebeurt op zijn
telefoon; aan onze kant is alleen te zien wat wij verstuurd hebben. De conclusie
hierboven berust op wat er in zijn installatie staat: twee systemen die allebei
een melding sturen bij hetzelfde aanbellen, waarvan er één van ons is en zonder
livestream.

## Aannames

- **Geen aannames over zijn telefoon.** De vraag "krijg je er twee?" ligt bij
  hem; het antwoord bepaalt of er nog iets te doen is.
- **De tagwijziging staat los van die vraag** en is hoe dan ook goed: twee
  gebeurtenissen op één camera hoorden nooit elkaars melding te overschrijven.

## `git status --porcelain`

```
M  CLAUDE.md
M  custom_components/domotiapp_lovelace/bewaking/meldingen.py
M  custom_components/domotiapp_lovelace/bewaking/motor.py
M  custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
M  custom_components/domotiapp_lovelace/manifest.json
AM docs/melding-per-melder/RAPPORT.md
M  tests/bewaking/test_meldingen.py
```
