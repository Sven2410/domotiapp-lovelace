# SPEC bijgewerkt: de themakeuze en het menu onder Configureren

## De vraag

Sinds 0.54.0 (30 september 2026) heeft de integratie een themakeuze. Je kiest
hem bij het toevoegen, en Configureren begint met een menu: *Uiterlijk* en
*Opgeslagen scenes opruimen*. `SPEC.md` zei nog iets anders:

- 15.2 en 19: een lege config flow;
- Configureren alleen voor het opruimoverzicht.

Dat stond in CLAUDE.md en in de kop van `config_flow.py` als "wijkt af van de
letter van de SPEC". De SPEC pas ik alleen op verzoek aan. Op 14 oktober 2026
gevraagd, en zijn antwoord was: ja.

## Wat er veranderd is

Alleen tekst; er verandert niets aan wat de integratie doet.

- **SPEC 2** (de bestandslijst): `config_flow.py` is "themakeuze + options
  flow: Uiterlijk en opruimen".
- **SPEC 15.1**:
  - Configureren begint met een menu (`init`, `async_show_menu`) met Uiterlijk
    en Opgeslagen scenes opruimen;
  - de integratie heet daar nu DomotiApp Lovelace. Er stond nog "DomotiApp
    Scene", de naam uit de tijd dat de scenekaart een eigen pakket was.
- **SPEC 15.2**:
  - de eerste stap van het opruimen heet `scenes` (was `init`);
  - het afsluiten geeft de bestaande options terug in plaats van `data={}`,
    want een lege dict wist de themakeuze.
- **SPEC 15.5 (nieuw), Uiterlijk: licht of donker**:
  - de drie keuzes;
  - stap `user` bij het toevoegen en stap `uiterlijk` achteraf;
  - de opslag in `entry.options["thema"]`;
  - een entry zonder keuze geldt als Automatisch;
  - een wijziging herlaadt de integratie niet.

  Hoe de kaart Automatisch beslist, staat in CLAUDE.md onder *Licht en donker*.
  Dat wordt niet twee keer beschreven.
- **SPEC 19**: de regel "Instellingen op de integratie" zegt nu dat er precies
  één instelling is, het thema.
- **CLAUDE.md** en de kop van **`config_flow.py`**: de zin over de afwijking
  is vervangen door een verwijzing naar de bijgewerkte SPEC.

## Bewijs

- Elke zin in 15.1, 15.2 en 15.5 is nagelopen tegen de code:
  - `config_flow.py`: `async_step_user`, `async_step_init` met
    `menu_options=["uiterlijk", "scenes"]`, `async_step_uiterlijk`,
    `async_step_scenes`, `async_step_confirm` met
    `data=dict(self.config_entry.options)`;
  - `_als_thema`: geen keuze wordt `auto`;
  - `const.py`: `CONF_THEMA = "thema"`, `THEMAS`.
- `npm run build` geeft dezelfde bundel (sha256 `901a5abcb271…`), en `npm run
  verify` is OK: de bundel verandert niet.
- Geen nieuwe tests. Er is geen nieuw gedrag; alleen een docstring in Python is
  veranderd.

## Samenvatting

`SPEC.md` beschrijft nu wat de integratie sinds 0.54.0 doet: een themakeuze bij
het toevoegen, en een menu onder Configureren. CLAUDE.md en `config_flow.py`
noemen geen afwijking meer. Er is geen uitgave nodig, want de bundel en het
gedrag zijn gelijk.

## Wat niet lukte

Niets.

## Aannames

- Dat "DomotiApp Scene" in 15.1 een overblijfsel is en "DomotiApp Lovelace"
  moet zijn. Zo heet de integratie in `manifest.json`.

## git status --porcelain

Vóór de commit:

```
 M CLAUDE.md
 M SPEC.md
 M custom_components/domotiapp_lovelace/config_flow.py
?? docs/spec-uiterlijk/
```

Na de commit: leeg.
