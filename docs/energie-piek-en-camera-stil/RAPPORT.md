# Het getal bij de piek, en een schakelaar die de camerameldingen stilzet

**Datum:** 10 september 2026
**Uitgave:** 0.41.0
**Tak:** `fase-46/energie-piek-en-camera-stil`

## Wat er gevraagd is

Twee berichten van de eigenaar op 10 september 2026, na 0.40.0:

| # | vraag | waar het zit |
|---|---|---|
| 1 | "haal die tekst weg van piek, gewoon het getal is genoeg" (schermafdruk van het energieblok met "piek 4,69 kW") | het opschrift is alleen nog het getal |
| 2 | in de camerakaart een optie in de GUI om een schakelaar te kiezen; staat die aan, dan geen pushmeldingen; en die schakelaar "ergens mooi in de kaart weggewerkt" | veld **Schakelaar: meldingen uit** in de editor; een belknop in de rij boven de timeline; de server leest de schakelaar bij elke melding |
| 3 | (tweede bericht) het moet een HA-helper zijn die ook elders iets doet: klikken op de helper moet op de kaart te zien zijn, en andersom | het IS de helper: de kaart schakelt de entiteit en toont haar toestand; de server leest diezelfde entiteit |

## Wat er gebouwd is

### De schakelaar (punten 2 en 3)

- **Editor** (`camera-card.js`): onder *Snapshots en meldingen* het veld
  `snapshot_stil`, een `input_boolean` of `switch`. Hulptekst: staat hij aan,
  dan geen melding; het beeld komt wél in de timeline; ook bruikbaar in een
  automatisering.
- **Regel** (`bewaking-logica.js`, `bewaking/store.py`): het veld
  `stil_schakelaar` gaat met de regel mee naar de server; alleen een
  `input_boolean.` of `switch.` wordt aangenomen.
- **Motor** (`bewaking/motor.py`): `_async_meld` slaat de melding over als de
  schakelaar `on` staat, na de toets op "alleen afwezig". Het beeld is dan al
  vastgelegd. Een schakelaar die niet bestaat houdt niets tegen.
- **Kaart**: een belknop naast de opslagknop in de filterrij. Aan: de bel
  doorgestreept in het accent; uit: de gewone bel. Tikken roept
  `homeassistant.toggle` op de entiteit aan; de toestand komt uit `hass`, dus
  een helper die elders wordt omgezet verandert de knop mee (`watched()`
  kent de entiteit). Nieuw icoon `bellOff`, ook in de icoonkiezer.

### Gemeten

In de testinstance, met de kaart met de hand in de pagina (het tabblad stond
op hidden en de view bouwde de nieuwe kaart niet; de kaart heeft dezelfde
`hass` en dezelfde websocket) en een nieuwe helper `input_boolean.camera_stil`:

| stap | resultaat |
|---|---|
| kaart met `snapshot_stil` | de knop staat er, `bell`, `aria-pressed=false`; de regel op de server heeft `stil_schakelaar: input_boolean.camera_stil` |
| echte klik op de knop (`isTrusted: true`, `composedPath` bevat `.stil`, op x=767 y=458) | helper `off -> on` |
| verse `hass` (zoals HA die bij elke wijziging geeft) | knop `aria-pressed=true`, icoon `bellOff`, kleur `rgb(25, 143, 217)`, achtergrond accent op 14% |
| helper via `input_boolean.turn_off` (zoals een automatisering) + verse `hass` | knop terug naar `bell`, `aria-pressed=false` |
| helper weer `turn_on` | knop weer `bellOff` |

De eerste klik landde naast de knop: het beeld van de camera was intussen
geladen en de rij was 63 px gezakt. Opnieuw gemeten en geklikt.

Server: `test_de_stilschakelaar_houdt_de_melding_tegen_maar_niet_het_beeld`
(helper aan: één beeld in de timeline, nul meldingen),
`test_de_stilschakelaar_uit_of_onbekend_laat_de_melding_door`, en de
validatie (`light.x` wordt geweigerd). Kaart: `regelsVoorKaart` neemt
`snapshot_stil` over en anders `null`.

### Het getal bij de piek (punt 1)

`<span class="e-piek">` toont alleen nog het getal.

### Bundel en tests

- JS: 1034 tests, alle groen (1 nieuw). Python: 667 tests, alle groen
  (3 nieuw).
- Bundel uit de server = bundel op schijf (801.936 bytes, sha256 gelijk; na
  de versiebump alleen de versiestring anders).

## Samenvatting

Het woord "piek" is weg. De camerakaart heeft een veld voor een helper of
schakelaar die de meldingen stilzet, met een belknop in de kaart die diezelfde
entiteit omzet en haar toestand toont; de server leest de entiteit bij elke
melding.

## Wat niet lukte

- De editor van de camerakaart is niet in HA's bewerkdialoog geopend (tabblad
  hidden, valkuil 40); het veld staat in het schema, dat is de enige wijziging
  daar.
- De knop is gemeten op een kaart die met de hand in de pagina hangt; in de
  view geeft Home Assistant dezelfde `hass` door.

## Aannames

1. De knop staat in de rij boven de timeline (naast de opslagknop) en is er
   alleen als er een schakelaar gekozen is.
2. "Aan" op de helper betekent "meldingen uit". Het label zegt dat.

## git status --porcelain

```
 M custom_components/domotiapp_lovelace/bewaking/motor.py
 M custom_components/domotiapp_lovelace/bewaking/store.py
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/bewaking-logica.js
 M src/cards/camera-card.js
 M src/cards/infoscherm-card.js
 M src/editor/icoon-zoek.js
 M src/icons.js
 M tests/bewaking/test_motor.py
 M tests/js/bewaking-logica.test.mjs
?? docs/energie-piek-en-camera-stil/
```
