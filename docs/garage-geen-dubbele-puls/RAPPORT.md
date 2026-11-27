# De garagedeur: geen tweede puls terwijl hij dichtgaat — 0.140.1

## Waarom

De beheersessie van een klant liet op 27 november 2026 de echte deur bewegen, met toestemming van de eigenaar, en mat:

- de schakelaar geeft een puls van 0,5 s;
- na een puls om te openen zegt het contact na 3,2 s open (zodra de deur loskomt);
- na een puls om te sluiten zegt het contact pas na 18,3 s dicht.

In 0.139.0 keek Deur sluiten alleen of het contact open zegt. Dat doet het tijdens het sluiten nog 18 seconden. Tikt in
die tijd nog iemand op Deur sluiten, dan gaat er een tweede puls uit. Bij een pulsdeur betekent dat: de deur stopt
halverwege, en de volgende puls keert hem om. Dat kan gebeuren als:

- twee mensen vlak na elkaar tikken, voordat de melding bij de ander weg is;
- één persoon twee keer tikt.

Daarbij een eis van de eigenaar, via dezelfde sessie: "Als ik op ignore heb gedrukt moet hij ook een ha restart daarna
overleven!"

## Wat er veranderd is

| wat | hoe |
|---|---|
| een tweede Deur sluiten | binnen `SLUIT_CONTROLE` (90 s) na een Sluiten geen puls, met de reden "De deur gaat al dicht" ("The door is already closing"). Daarna mag het weer, want dan is nagekeken of hij dicht is, en staat hij nog open, dan moet je opnieuw kunnen sluiten |
| twee tikken die tegelijk binnenkomen | het Sluiten staat nu in de opslag VOOR de puls, niet erna. Een tweede tik die binnenkomt terwijl de schakelaar nog antwoordt, ziet hem dan al. Mislukt de puls, dan gaat het Sluiten er weer uit |
| na een herstart | dat Sluiten staat in de opslag, dus de grens geldt ook na een herstart |
| negeren na een herstart | geen wijziging: `negeer_tot`, `negeer_door` en `avond_gemeld` stonden al in de opslag, en alleen een echte `off` wist ze. Nu met proeven |

## Proeven

`tests/meldingen/test_garage.py`, zeven proeven erbij.

**NIEUW GEDRAG**, vallen om op de code van main:

- `test_geen_tweede_puls_terwijl_hij_dichtgaat`, in drie stappen:
  - eerst een tik 10 s na een andere;
  - dan twee tikken tegelijk (`asyncio.gather`) met een schakelaar die niet meteen antwoordt;
  - na de controle mag het weer.
- `test_een_sluiten_van_voor_de_herstart`: een Sluiten 30 s voor de herstart. Een tik direct erna stuurt geen puls, en
  de klok kijkt na met "niet dichtgegaan".

```
FAILED tests/meldingen/test_garage.py::test_geen_tweede_puls_terwijl_hij_dichtgaat
FAILED tests/meldingen/test_garage.py::test_een_sluiten_van_voor_de_herstart
2 failed, 22 passed
```

Dat het deel "tegelijk" de volgorde van opslaan nodig heeft, is apart getoond: met alleen de tijdgrens en het opslaan
weer na de puls gaf `asyncio.gather` twee pulsen (`assert [True, True] == [True, False]`). Daarvoor moest de nagemaakte
schakelaar in de proef één keer aan de beurt laten (`asyncio.sleep(0)`). Zonder dat antwoordt hij meteen, en dan komen
twee tikken nooit echt tegelijk binnen.

**REGRESSIEWACHT**, slagen ook op main: negeren na een herstart.

- `test_negeren_komt_op_schijf`: een tik op Negeer 1 uur staat binnen enkele seconden in de opslag op schijf, met wie en
  tot wanneer.
- `test_negeren_overleeft_een_herstart`, twee keer:
  - genegeerd tot 16:00, herstart om 15:30: om 15:59 niets, om 16:00 de melding;
  - hetzelfde met een contact dat na de start eerst `unavailable` en dan `unknown` zegt. Het negeren en `open_sinds`
    blijven staan.
- `test_negeren_dat_tijdens_een_herstart_afliep`: bij de eerste tik de melding, en maar één keer.
- `test_tot_morgen_overleeft_een_herstart_in_de_nacht`: geen tweede avondmelding en niets tot 07:00.

Alles: 2579 JS-proeven en 1216 Python-proeven groen, plus `verify`, `check:registratie`, `check:controls`,
`check:css` en `check:taal`.

## Niet in de browser gemeten

Er verandert niets aan een kaart of scherm: alleen de server en een Engelse zin. De bundel is opnieuw gebouwd omdat het
versienummer erin staat.

## Samenvatting

Een tweede Deur sluiten binnen 90 seconden stuurt geen puls meer, ook niet als twee telefoons tegelijk tikken, en ook
niet vlak na een herstart. Dat negeren een herstart overleeft, klopte al en is nu met vijf proeven vastgelegd.

## Wat niet lukte

- Niet met de echte deur nagedaan; de tijden komen uit de meting van de beheersessie.
- Of het contact van die klant bij het opstarten even een valse `off` geeft, is niet bekend. Doet het dat terwijl de
  deur open staat, dan wist de code het negeren, net als bij een echte keer dicht. Dan komt er later een melding
  te veel, maar er valt er geen weg. De beheersessie kijkt het bij de volgende herstart na.

## Aannames

- 90 s is lang genoeg voor elke deur: deze sluit in 18 s. Een deur die langer dan 90 s nodig heeft, kreeg in 0.139.0 al
  "niet dichtgegaan", en daar verandert niets aan.
- De pop-up heeft geen knop Deur sluiten, alleen negeren. De dubbele tik komt dus van meldingen op telefoons.

## `git status --porcelain`

(vlak voor het vastleggen)

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/engels/meldingen.json
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M custom_components/domotiapp_lovelace/meldingen/motor.py
 M tests/meldingen/test_garage.py
?? docs/garage-geen-dubbele-puls/
```
