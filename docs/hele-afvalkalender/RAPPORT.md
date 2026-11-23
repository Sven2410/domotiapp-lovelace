# De hele afvalkalender op het infoscherm — 0.137.0

## Waarom

De eigenaar, 23 november 2026, bij het infoscherm met een afvalagenda als bron: "Kan je wel instellen als ik op de
kalender klik dat ik heel de afvalkalender kan zien?" De knop Kalender op het afvalblok opende de pagina Afval, en die
toonde per bak alleen de eerstvolgende ophaling.

Over de kleur van het vlak (de bak, niet het accent) zei hij in hetzelfde gesprek: "nee is prima zo". Die blijft dus.

## Wat er veranderd is

| Waar | Wat |
|---|---|
| pagina Afval van het infoscherm | onder de bakken een kop "Alle ophalingen", met per maand een vak: de dag ("di 24") en de soorten met hun kleur. De eerstvolgende dag staat in het accent. Zoveel maanden naast elkaar als er passen; de pagina scrolt |
| `AfvalAgendaBron` | een optie `dagen`. Het infoscherm haalt `KALENDER_VOORUIT_DAGEN` (731, twee jaar) op; de afvalkaart en de meldingenkaart blijven op 62 |
| `bakkenUit` | houdt zelf de grens van 62 dagen aan (`vooruit`). Zonder die grens werd met de afspraken van een heel jaar binnen een soort van over drie maanden ook een bak, en dan toonde het infoscherm andere bakken dan de afvalkaart |
| `kalenderUit`, `perMaand` | nieuw in `afval-agenda.js`: alle ophalingen vanaf vandaag uit een of meer agenda's, per dag samengevoegd zonder dubbele soorten, en per maand gegroepeerd |

Alleen met een agenda als bron. Een afvalsensor kent alleen de volgende datum, en die staat er al boven; dan verandert er
niets aan de pagina.

## Proeven

`tests/js/afval-agenda.test.mjs`, drie proeven erbij, **NIEUW GEDRAG**:

- de bakken blijven binnen 62 dagen, ook met de afspraken van een heel jaar;
- de hele kalender: vanaf vandaag, per dag de soorten uit elke agenda, zonder dubbele;
- per maand, ook over de jaargrens.

Op de code van main faalt het bestand:

```
SyntaxError: The requested module '../../src/cards/afval-agenda.js' does not provide an export named 'kalenderUit'
# pass 0
# fail 1
```

En de grens los, met Papier op 24 november en Kerstbomen op 10 februari:

```
oud:    [ 'Papier', 'Kerstbomen' ]
nieuw:  [ 'Papier' ]
```

Alles: 2545 JS-proeven en 1192 Python-proeven groen, plus `verify`, `check:registratie`, `check:controls`, `check:css` en
`check:taal`.

## Gemeten in de testinstance

Opzet: `installatie.afval = ["calendar.afval"]`, een afvalblok van 2×1, en vijf tijdelijke ophalingen in januari en maart
2027 erbij (twaalf in totaal). Playwright headless, met `isMobile` en `hasTouch`; een tik op de knop Kalender in de kop
van het afvalblok. Daarna zijn de ophalingen, de installatie en de indeling teruggezet.

| | 1180 × 820 (iPad) | 390 × 844 (telefoon) |
|---|---|---|
| bundel geladen = schijf | `809b742e5204` = `809b742e5204` | idem |
| tik op Kalender | `isTrusted: true`, pagina Afval open | idem |
| kop | "Alle ophalingen" | idem |
| maanden | november 2026, december 2026, januari 2027, maart 2027; 4 kolommen van 210 px | dezelfde, 4 kolommen van 88 px (het hele scherm schaalt mee) |
| januari | "vr 8 Kerstbomen", "wo 20 Papier", "do 21 Restafval" | idem |
| maart, ruim drie maanden vooruit | "do 4 PMD Restafval" | idem |
| eerstvolgende dag | "di 24" in het accent (`rgb(11, 138, 106)`) | idem |
| een maandvak steekt uit | nee | nee |
| inhoud `scrollWidth` / `clientWidth` | 868 / 868 | 365 / 365 |
| pagina | 1180 / 1180 | 390 / 390 |

Geen fouten op de pagina.

## Samenvatting

Een tik op Kalender op het afvalblok laat nu de hele afvalkalender zien: alle ophalingen uit de agenda, per maand, tot
twee jaar vooruit. De bakken bovenaan en op de andere kaarten blijven zoals ze waren.

## Wat niet lukte

- Niet gemeten op het echte scherm van de klant; daar komt het met de uitrol.
- Op telefoonbreedte is het klein, maar dat is het hele infoscherm daar: het is gemaakt voor een iPad aan de muur.

## Aannames

- Twee jaar vooruit is genoeg voor "heel de kalender": een ophaalschema loopt meestal tot het eind van het volgend jaar.
- De afvalkaart zelf (buiten het infoscherm) heeft geen kalenderpagina; daar is niet om gevraagd.

## `git status --porcelain`

(vlak voor het vastleggen)

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/afval-agenda-bron.js
 M src/cards/afval-agenda.js
 M src/cards/infoscherm-card.js
 M src/i18n/en/infoscherm.js
 M tests/js/afval-agenda.test.mjs
?? docs/hele-afvalkalender/
```
