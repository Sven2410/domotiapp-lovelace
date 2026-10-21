# Taal: Nederlands en Engels (sinds 0.81.0)

De eigenaar op 21 oktober 2026, toen DomotiApp Coach Engels werd: de kaarten
ook. Eén taal per installatie, net als bij de coach. Onder Configureren,
Uiterlijk staat **Taal / Language**: Automatisch, Nederlands of English.
Automatisch neemt de taal van Home Assistant: Engels als die met "en" begint,
anders Nederlands. De manier van werken komt van het paneel van de coach
(`docs/taal.md` in domotiapp-coach), zodat er één manier is.

## Hoe het werkt

| Wat | Waar |
|---|---|
| de keuze bij de integratie | `CONF_TAAL` in `const.py`, de stap Uiterlijk in `config_flow.py` |
| de keuze naar de kaarten | de lader (`loader.py`) zet `__domotiappLovelaceTaal`; `src/thema.js` haalt hem opnieuw op, samen met het thema |
| de taal van nu, `t()`, `tn()`, `nt()`, `getal()`, `locale()` | `src/taal.js` (zonder DOM, getoetst) |
| het Engels | `src/i18n/en/*.js`, samengevoegd in `src/i18n/en.js` |
| de controle | `npm run check:taal`, ook in CI |

Het Nederlands blijft in de bron staan en is de sleutel:

```js
import { nt, t, tn } from "../taal.js";

`<span class="kopje">${t("Laden tot")}</span>`
t("Laden tot {pct}%, {min} tot {max}", { pct, min, max })
tn(n, "{n} lamp", "{n} lampen")
```

In het Engels zoekt `t` de zin op in `EN`; wat er niet in staat blijft
Nederlands. Daardoor blijft elke toets die Nederlandse tekst narekent gelden.

**Een andere taal bouwt de kaart opnieuw op.** De tekst staat in de DOM uit
`template()`, dus `DacCard` doet bij een wissel wat hij bij een nieuwe config
doet (`taalGewisseld_` in `base.js`). De naam en de beschrijving in de
kaartkiezer zijn getters (`inKiezer` in `registratie.js`), zodat ze vertaald
zijn op het moment dat Home Assistant ze leest.

## Regels bij het vertalen

1. **Alleen wat iemand leest**: tekst in de templates, `textContent`, labels en
   hulpteksten in de editor, `placeholder`, `title` en `aria-label`, de namen
   in een keuzelijst, de naam en beschrijving in `registerCard`.
2. **De sleutel is precies de Nederlandse tekst**, tussen dubbele
   aanhalingstekens, nooit een template literal. Een waarde gaat tussen
   accolades: `` `nog ${x} kWh` `` wordt `t("nog {kwh} kWh", { kwh: x })`. Een
   getal met alleen een eenheid ("4,2 kW") hoeft niet.
3. **Geen HTML in de sleutel** als het niet hoeft. Staat er opmaak midden in
   een zin (`<b>`), dan mag die in de sleutel, met dezelfde opmaak in het
   Engels.
4. **Meervoud** met `tn`. **Getallen** met `getal()` of
   `toLocaleString(locale(), ...)`, **datums** met
   `toLocaleDateString(locale(), ...)`, nooit met `"nl-NL"` erin. Namen van
   dagen en maanden uit `toLocaleDateString(locale(), { weekday: "long" })`,
   niet uit een eigen lijst.
5. **Nooit `t()` bij het laden van een module**: dan is de taal nog niet
   bekend. Een tabel met namen houdt het Nederlands, gemerkt met
   `nt("Laadpaal")`, en vertaalt waar hij getoond wordt: `t(soort.label)`. Dat
   geldt ook voor `registerCard({ name: nt(...), description: nt(...) })`.
6. **Niet vertalen**: tekst waarmee vergeleken, gezocht of gerekend wordt,
   sleutels en id's, wat in de config of de opslag bewaard wordt, CSS,
   `console`-regels, de namen die de bewoner zelf koos, en tekst die van de
   coach of van Home Assistant komt (die is al in de taal van de installatie).
7. **Het Nederlands blijft letterlijk hetzelfde.** De toetsen zien dat.
8. **Eén Nederlands woord, twee betekenissen**: `tc("stand", "Stil")`. Het
   Engels staat dan onder `"Stil|stand"` ("Quiet"), terwijl `t("Stil")` bij
   de batterij "Idle" blijft. `check:taal` eist die sleutel.
9. Een variabele die `t` heet in een kaart botst met de import: hernoem hem
   (`tik`, `beurt`).

## Schrijfwijze van het Engels

Brits Engels (`en-GB`: 24 uur, dag voor maand), kort en duidelijk, zoals het
Nederlands. **Geen gedachtestreepjes** (de controle zoekt ze). Knoppen in de
gebiedende wijs ("Save", "Submit"), koppen met een hoofdletter alleen vooraan.
Waar het paneel van de coach dezelfde zin heeft, hetzelfde Engels.

## Woordenlijst

| Nederlands | Engels |
|---|---|
| laadpaal, laadbeurt | charger, session |
| thuisbatterij, accu | home battery, battery |
| accustand (van een auto) | charge level |
| zon, het net | solar, grid |
| klaar om, laden tot | ready by, charge to |
| vaatwasser, wasmachine, droger | dishwasher, washing machine, dryer |
| vriezer, koelkast | freezer, fridge |
| rolluik | shutter |
| afval, ophaaldag | waste, collection day |
| Niet bereikbaar | Unavailable |
| Leeg laten: ... | Leave empty: ... |
| Eigen afbeelding | Own image |
| Opslaan, Annuleren, Toevoegen, Verwijderen | Save, Cancel, Add, Remove |
| container (afval), Staat buiten | bin, Put out |
| infoscherm | info screen |

## Tekst van de coach in een andere taal (sinds 0.83.0)

De coach schrijft zijn eigen tekst (de toestand, `reason`, `later`), in de taal
van zijn installatie. Sinds coach v0.140.2 staat die taal als attribuut `taal`
op elke sensor ("nl" of "en"; gezien in een echte dump op 21 oktober 2026,
`tests/js/vaste-invoer/coach-0.140.2-taal.json`).

- **De kaart houdt de taal van de gebruiker.** Automatisch volgt dus NIET de
  coach. In een Engels huis met een Nederlandse coach zou dat een Nederlands
  dashboard geven, en dat is het omgekeerde van wat Automatisch belooft.
- **Spreekt de coach een andere taal** (`spreektAnders` in `coach-logica.js`),
  dan valt zijn tekst weg en gebruikt de kaart zijn eigen woord:
  - de toestand wordt het woord bij de `stand` (batterij, laadpaal);
  - `reason` verdwijnt (batterij en laadpaal), en de airco valt terug op het
    woord bij de stand;
  - `later` telt niet, en de programmakaart rekent "tomorrow" of de dag zelf
    uit `klaar_om`.
- **Zonder het attribuut** (een coach van vóór v0.140.2) blijft alles zoals het
  was.

## Wat er af is

Per ronde bijgewerkt; `npm run check:taal` toont alleen wat in een `t()` staat,
dus deze lijst is wat er NAGELOPEN is.

- **0.81.0:** de basis, de laadpaalkaart, de batterijkaart, de programmakaart
  (vaatwasser, wasmachine, droger) en de meldingen van `coach-logica.js`.
- **0.82.0:** alle andere kaarten en editors, de badges, de gedeelde kiezers,
  de wekker, het infoscherm en het beheer, en de serverkant.
- **0.83.0:** tekst van een coach in een andere taal (zie hierboven), en een
  enkelvoud bij één: "1 lamp", "1 blok", "gisteren" in plaats van "1 dagen
  geleden". `check:taal` zag een `tn()` niet als het getal met een haakje
  begon; dat doet hij nu wel.

## De serverkant (sinds 0.82.0)

`custom_components/domotiapp_lovelace/taal.py` is het tegenstuk van
`src/taal.js`, net als bij de coach: `t(hass, nl, **waarden)`, `tn`, en
`taal_van(hass)`. Het Engels staat in `engels/*.json`. `taal_van` volgt
dezelfde keuze; bij Automatisch kijkt hij naar `hass.config.language`, de taal
van de INSTALLATIE. De kaarten kijken naar `hass.language`, de taal van de
GEBRUIKER. Bij een installatie in het Nederlands met één gebruiker in het
Engels zijn de kaarten van die gebruiker dus Engels en de pushmeldingen
Nederlands. Wie dat niet wil, zet de keuze vast.

Wat de server vertaalt:
- de afvalmelding (titel, tekst, de knop "Put out" en de proef);
- de tekst van de wekker en zijn regel "volgende keer";
- de fouten bij het boeken van een ruimte;
- de vaste foutteksten van de commando's.

Een `tests/test_taal_server.py` eist dat elke zin in een `t()` in de
Python-bron Engels heeft.

**In de tests** zet een autouse-fixture in `tests/conftest.py` de taal van
Home Assistant op "nl". Het testharnas zet hem namelijk op "en", en dan zou
Automatisch alle bestaande Nederlandse toetsen Engels maken.
