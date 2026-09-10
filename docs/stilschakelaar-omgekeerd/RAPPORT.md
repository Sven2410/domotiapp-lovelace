# De stilschakelaar omgekeerd, en het icoon dat oplicht als de meldingen aanstaan

**Datum:** 10 september 2026
**Uitgave:** 0.42.0
**Tak:** `fase-47/stilschakelaar-omgekeerd`

## Wat er gevraagd is

Drie berichten van de eigenaar op 10 september 2026, na 0.41.0:

| # | vraag | waar het zit |
|---|---|---|
| 1 | "een optie om de schakelaar te inverteren, nu is uit aan en aan uit" | vinkje **Schakelaar omgekeerd: aan = meldingen aan** in de camerakaart, onder het schakelaarveld |
| 2 | "ik bedoelde in de camerakaart, niet in de iPad-view" | dat is waar het zit: editor en belknop van de camerakaart |
| 3 | "het icoon oplichten is aan en niet oplichten is uit" | de belknop licht op (accent, gewone bel) zolang de meldingen AAN staan, en is gedoofd met een doorgestreepte bel als ze uit staan |

## Wat er gebouwd is

- **Editor** (`camera-card.js`): `snapshot_stil_omgekeerd`, een vinkje dat
  pas verschijnt als er een schakelaar gekozen is. Hulptekst: voor een helper
  die al andersom in gebruik is.
- **Regel** (`bewaking-logica.js`, `bewaking/store.py`): `stil_omgekeerd`
  gaat mee naar de server.
- **Motor** (`bewaking/motor.py`, `_stil`): gewoon is aan = stil, omgekeerd
  is uit = stil. Een schakelaar die niet bestaat of `unavailable` is houdt
  nooit iets tegen -- ook niet omgekeerd, anders zou een vergeten helper
  alle meldingen opeten.
- **Belknop** (`paintStil_`): `aria-pressed` betekent nu "meldingen aan";
  dan de gewone bel in het accent. Uit: gedoofd, doorgestreepte bel. De
  omkering draait daarin mee.

## Gemeten

Kaart met de hand in de pagina (tabblad hidden), helper
`input_boolean.camera_stil`, `snapshot_stil_omgekeerd: true`, verse bundel
(802.447 bytes, sha256 gelijk aan schijf vóór de versiebump):

| stap | resultaat |
|---|---|
| helper `off` | knop `aria-pressed=false`, icoon `bellOff`, kleur `rgba(232, 228, 222, 0.62)` (gedoofd), titel "Meldingen staan uit; tik om ze weer aan te zetten" |
| helper via `input_boolean.turn_on` + verse `hass` | knop `aria-pressed=true`, icoon `bell`, kleur `rgb(25, 143, 217)` (opgelicht), titel "Meldingen staan aan; tik om ze uit te zetten" |
| echte klik op de knop (`isTrusted`, pad `svg.icon > BUTTON.stil > DIV.rij dagrij`, x=767 y=458) | helper `on -> off` |
| regel op de server na de herstart | `stil_schakelaar: input_boolean.camera_stil`, `stil_omgekeerd: true` |

Twee eerdere kliks landden naast de knop: de meting van de knop was ouder
dan de camera-afbeelding die intussen laadde en de rij 63 px omlaag duwde.
Meet vlak vóór de klik.

Server: `test_de_omgekeerde_stilschakelaar_houdt_stil_als_hij_uit_staat`
(uit: één beeld, geen melding; aan: melding; onbekend: melding). Kaart:
`regelsVoorKaart` neemt `snapshot_stil_omgekeerd` over.

JS: 1035 tests groen (1 nieuw). Python: 668 groen (1 nieuw; bewaking 70).

## Samenvatting

Een vinkje om de stilschakelaar om te keren, en de belknop licht op als de
meldingen aanstaan.

## Wat niet lukte

- De editor van de camerakaart is niet in HA's dialoog geopend (tabblad
  hidden); het vinkje staat in het schema en verschijnt zodra er een
  schakelaar is gekozen.

## Aannames

1. "Oplichten is aan" gaat over de MELDINGEN: opgelicht = meldingen aan,
   ongeacht of de helper daarbij aan of uit staat.
2. Een omgekeerde schakelaar die niet bestaat houdt de meldingen niet tegen.

## git status --porcelain

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/bewaking/motor.py
 M custom_components/domotiapp_lovelace/bewaking/store.py
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/bewaking-logica.js
 M src/cards/camera-card.js
 M tests/bewaking/test_motor.py
 M tests/js/bewaking-logica.test.mjs
?? docs/stilschakelaar-omgekeerd/
```
