# 0.88.1: de HVAC-kaart zonder hvac_action

Gemeld op 31 oktober 2026, via een beheersessie op verzoek van de eigenaar: een
airco op `cool` (doel 18,5, kamer 20) stond op de kaart als "Standby", grijs en
zonder gloed. De integratie (Daikin Onecta) meldt geen `hvac_action`.

## Samenvatting

**De oorzaak** klopt met de melding: `statusRegel` in `src/cards/hvac-logica.js`
maakte van elke climate die aan staat zonder `hvac_action` de actie `idle`. De
airco-kaart had dit geval al goed (`aircoStand`), de HVAC-kaart niet.

**Nu zegt de stand het, met de gloed:**

| Stand | Tekst | Kleur |
|---|---|---|
| `cool` | Koelen | blauw |
| `heat` | Verwarmen | oranje |
| `dry` | Drogen | blauw |
| `fan_only` | Ventileren | blauw |
| `heat_cool`, `auto` | Auto | accent, net als op de airco-kaart |
| `off` | Uit | grijs, zonder gloed |

Een echte `hvac_action` gaat voor en zegt wat hij al zei ("Koelt", "Standby"). Een
lege `hvac_action` (`null`, `""`, `unknown`) telt als geen. Een stand die de kaart
niet kent krijgt zijn eigen naam, grijs en zonder gloed.

**Let op:** zonder `hvac_action` weet de kaart alleen wat er GEVRAAGD is, niet of
de compressor draait. De gloed blijft dus ook staan als de kamer al op temperatuur
is. Dat is de gevraagde keuze; het verschil is te lezen aan het woord: "Koelen" is
de stand, "Koelt" de melding van het apparaat. Dit geldt voor elke climate op deze
kaart, dus ook voor een radiatorthermostaat op `heat` zonder `hvac_action`.

## Gemeten

Testinstance op de mini-pc (HA 2026.8.1), headless Chromium met Playwright, met een
climate nagebootst via `POST /api/states`. Geen klik nodig: het gaat om wat de kaart
tekent. De `?v=` van de geladen bundel (`6ace216d48f0`) was gelijk aan de sha256 op
schijf.

| Stand | `hvac_action` | Tekst | `bezig` | Gloed | Kleur van de chip |
|---|---|---|---|---|---|
| cool | geen | Koelen | ja | ja | `rgb(18, 155, 228)` |
| heat | geen | Verwarmen | ja | ja | `rgb(220, 115, 0)` |
| dry | geen | Drogen | ja | ja | `rgb(18, 155, 228)` |
| fan_only | geen | Ventileren | ja | ja | `rgb(18, 155, 228)` |
| heat_cool | geen | Auto | ja | ja | `rgb(25, 143, 217)` |
| auto | geen | Auto | ja | ja | `rgb(25, 143, 217)` |
| off | geen | Uit | nee | nee | `rgba(232, 228, 222, 0.38)` |
| cool | cooling | Koelt | ja | ja | `rgb(18, 155, 228)` |
| cool | idle | Standby | nee | nee | `rgba(232, 228, 222, 0.38)` |
| heat | heating | Verwarmt | ja | ja | `rgb(220, 115, 0)` |

Geen paginafouten.

**Proeven:**
- `tests/js/hvac-zonder-actie.test.mjs`: 18 tests, waarvan 9 NIEUW GEDRAG die falen
  op de code van vóór deze ronde (`# pass 9`, `# fail 9`), en 9 REGRESSIEWACHT die
  daar slagen.
- JS 2106 groen (was 2088), Python 943 groen.
- `verify`, `check:registratie`, `check:css`, `check:controls` en `check:taal` groen.

## Wat niet lukte

- **Niet gemeten op de echte installatie met de Daikin:** dat doet de beheersessie
  na de uitgave. De climate hier is nagebootst, met de vorm uit de melding.
- **Niet gemeten:** het lichte thema (de kleuren komen uit bestaande tokens).

## Aannames

- Auto krijgt het accent. De melding noemde geen kleur; de airco-kaart doet het zo.

## git status --porcelain

Leeg na de commit van deze ronde.
