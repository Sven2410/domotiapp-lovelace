# De aanwezigheid op het infoscherm als dienst (0.135.0)

De eigenaar, 20 november 2026, via de beheersessie van een klant met een infoscherm: *"ik wil een automatisering hebben
dat als het alarm wordt ingeschakeld dat iedereen automatisch op afwezig gezet wordt."* Tot nu kon de aanwezigheid alleen
met het websocketcommando `infoscherm/aanwezig`, één persoon tegelijk. Een automatisering kan geen websocket aanroepen.

## Wat er veranderd is

**Een dienst: `domotiapp_lovelace.infoscherm_aanwezigheid`** (`infoscherm/diensten.py`).

```yaml
action: domotiapp_lovelace.infoscherm_aanwezigheid
data:
  aanwezig: false
  personen:            # mag weg: dan iedereen
    - Bram Visser      # de naam zoals op het scherm, of het id
```

- `aanwezig` is verplicht: aan is aanwezig, uit is afwezig.
- `personen` mag weg; dan geldt het voor iedereen. Een naam telt zonder op hoofdletters en spaties eromheen te letten.
  Een id kan ook. Eén naam als tekst mag ook, zonder lijst.
- **Twee keer is één keer.** Wie al zo stond, blijft staan. Is er niemand veranderd, dan gaat er niets naar de schijf
  en niets naar de schermen. Een start-tak na een herstart kan hem dus gerust nog eens aanroepen.
- **Een onbekende naam is een fout, en dan verandert er niets**, ook niet bij de namen die wel kloppen. De trace van de
  automatisering zegt welke naam niet bestaat ("Niet op het infoscherm: ...").
- Het antwoord (`response_variable`) zegt wie er veranderde: `{veranderd: [{id, naam, aanwezig}]}`.
- Elk open scherm en elk open beheer krijgt de nieuwe stand meteen, via hetzelfde abonnement als een tik.

De dienst heeft een beschrijving in het Nederlands en het Engels (`services.yaml`, `strings.json`, `translations/`),
zodat hij in de automatiseringseditor met velden staat.

**Wat niet veranderde:** het infoscherm zet zelf niemand af. De middernachtklok bleef weg (ronde 3: *"Iedereen moet
gewoon zijn eigen aanwezigheid controleren"*). Wanneer de dienst draait, bepaalt de automatisering van de klant.

## Gemeten

In de testinstance, met de acht personen die daar op het infoscherm staan:

| Aanroep | Antwoord | Daarna |
|---|---|---|
| REST, `aanwezig: true` | 6 veranderd (2 stonden al aan) | 8 aanwezig |
| REST, `aanwezig: false` | 8 veranderd | 8 afwezig |
| REST, `aanwezig: false`, nog eens | `veranderd: []` | 8 afwezig |
| REST, één naam in hoofdletters, `aanwezig: true` | 200 | alleen die aanwezig |
| REST, `personen: [Bestaat Niet]` | 500 van Home Assistant zelf (de REST-API vangt alleen `vol.Invalid`) | niets veranderd |
| `execute_script`, zoals een automatisering, iedereen afwezig | gelukt | 8 afwezig |
| `execute_script`, onbekende naam | `service_validation_error`: "Niet op het infoscherm: Bestaat Niet" | niets veranderd |

`get_services` toont de dienst met beide velden en `response: optional`.

Geen browsermeting: er verandert niets aan een kaart. Dat een open scherm meteen bijwerkt, toetst een proef met een echte
abonnee.

## Proeven

`tests/infoscherm/test_dienst.py`, 7 proeven, NIEUW GEDRAG:
- de dienst bestaat;
- zonder personen gaat iedereen op afwezig, en het antwoord noemt ze;
- twee keer is één keer, en de tweede keer schrijft niets;
- personen op naam (hoofdletters, spaties) en op id, en één naam als tekst;
- een onbekende naam geeft een fout en verandert niets;
- een abonnee krijgt de nieuwe stand;
- afwezig overleeft een herstart.

Tegen de code van main falen alle 7.

Alles bij elkaar:
- 1185 Python-proeven en 2535 JS-proeven, groen;
- `verify`, `check:registratie`, `check:controls`, `check:css` en `check:taal`, groen.

## Samenvatting

0.135.0 heeft de dienst `domotiapp_lovelace.infoscherm_aanwezigheid`, met `aanwezig` en optioneel `personen`. Een
automatisering kan daarmee iedereen afwezig zetten als het alarm aangaat. Twee keer aanroepen kan geen kwaad, en een
onbekende naam verandert niets.

## Wat niet lukte

- **Niet met een echt alarm gezien.** De automatisering bij de klant maakt de beheersessie.
- Een onbekende naam via de REST-API geeft een 500 in plaats van een 400. Dat is Home Assistant zelf; in een
  automatisering en via de websocket is het een gewone validatiefout.

## Aannames

- Iedereen die een dienst mag aanroepen, mag deze aanroepen; ook het kioskaccount mag immers iemand aan- of afmelden.
- Een onbekende naam laat alles staan, in plaats van de rest wel te doen.
- Versie 0.135.0: iets nieuws, geen reparatie.

## git status --porcelain

```
M  CLAUDE.md
M  custom_components/domotiapp_lovelace/engels/infoscherm.json
M  custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
M  custom_components/domotiapp_lovelace/infoscherm/__init__.py
M  custom_components/domotiapp_lovelace/infoscherm/const.py
A  custom_components/domotiapp_lovelace/infoscherm/diensten.py
M  custom_components/domotiapp_lovelace/infoscherm/store.py
M  custom_components/domotiapp_lovelace/manifest.json
A  custom_components/domotiapp_lovelace/services.yaml
M  custom_components/domotiapp_lovelace/strings.json
M  custom_components/domotiapp_lovelace/translations/en.json
M  custom_components/domotiapp_lovelace/translations/nl.json
A  docs/aanwezigheid-als-dienst/RAPPORT.md
A  tests/infoscherm/test_dienst.py
```
