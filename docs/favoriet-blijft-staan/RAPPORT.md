# Rapport — een favoriet die blijft staan, en een achtergrond die stilstaat

Branch `fase-favorieten/blijft-staan-en-scrollslot`, 21 augustus 2026.

De twee meldingen die na 0.8.0 zijn blijven liggen:

1. **"Als ik favorieten maak slaat hij ze niet op. Druk ik op het hartje en ga
   naar een andere tab en weer terug, dan is hij geen favoriet meer."**
2. **"Open ik de searchbar vanaf de kaart en ik scroll op een leeg veld, dan zie
   ik de background dus HA scrollen."**

Allebei gerepareerd. Alles hieronder is gemeten, niet beredeneerd.

---

## 1. De favoriet die niet bleef staan — drie oorzaken, niet één

### 1a. Het favorietenblad opende ALTIJD op afspeellijsten

Het zoekblad praat in enkelvoud (`track`), de bibliotheek in meervoud
(`tracks`), en `haalFavorieten_()` vergeleek die twee rechtstreeks:

```js
this.bibSoort_ = BIB_SOORTEN.some(([w]) => w === this.soort_) ? this.soort_ : "playlists";
```

Alleen `radio` heet in allebei hetzelfde. Uitgedraaid op de code van vóór de fix:

```
(alles)   -> favorietenblad toont: playlists
track     -> favorietenblad toont: playlists
album     -> favorietenblad toont: playlists
artist    -> favorietenblad toont: playlists
playlist  -> favorietenblad toont: playlists
radio     -> favorietenblad toont: radio
```

Wie een nummer favoriet maakte en naar Favorieten ging, keek dus naar favoriete
AFSPEELLIJSTEN. Het nummer stond er wél — alleen niet in de lijst waar hij naar
keek. Dat is precies wat "hij slaat het niet op" van buiten af oplevert.

**Fix:** het blad opent op de soort die je zojuist favoriet maakte
(`bibSoortNa()`), met het antwoord van de serverkant als beste bron.

### 1b. Een zoekresultaat kwam altijd met een leeg hartje binnen

`ma.treffers()` liet `favorite` en het bibliotheeknummer vallen. Music Assistant
zoekt óók in zijn eigen bibliotheek, dus een nummer dat je een minuut eerder
favoriet maakte kwam terug alsof het nooit gebeurd was.

**Fix:** allebei de velden gaan mee. Het bibliotheeknummer alléén als de treffer
echt uit de bibliotheek komt (`provider == "library"`) — bij een Spotify-treffer
is `item_id` het nummer van Spotify, en een hartje uitzetten gaat op
bibliotheeknummer.

### 1c. De twee tabbladen deelden één veld, en vergiftigden elkaar

`soort_` diende zowel het zoekfilter als de bibliotheekkeuze, en `treffers_`
bevatte "wat er op het scherm staat". Naar Favorieten en terug betekende dus:
zoekresultaten weg, en een zoekfilter dat op `tracks` stond — een waarde die de
zoekopdracht van MA niet kent.

**Fix:** gescheiden velden (`soort_` voor zoeken, `bibSoort_` voor de
bibliotheek) en de zoekresultaten worden apart bewaard en teruggezet.

---

## 2. De achtergrond die meescrolde

De lijsten hadden `overscroll-behavior: contain`, maar de LAAG zelf scrollt niet.
Scroll je daar, dan gaat de beweging naar de eerstvolgende scrollbare voorouder —
en omdat het scherm in `document.body` hangt, is dat de pagina zelf.

**Fix:** `src/scrollslot.js` zet de body vast (`position: fixed` met de
scrollpositie in `top`, want `overflow: hidden` houdt iOS niet tegen), en geeft
hem bij het sluiten weer vrij op de plek waar je was.

---

## 3. De metingen in een echte browser

Werkbank `dev/preview.html` op een verse poort (8231), venster vooraan
(`visibilityState: "visible"`), verse bundel (`bevatScrollSlot: true` uit een
`fetch(..., {cache:'reload'})`).

### 3.1 Het scrollslot, met en zonder — dezelfde tien scrollklikken

| | achtergrond `top` | `window.scrollY` |
|---|---|---|
| scherm open, slot aan, vóór het scrollen | −1291 | 0 (body vast op `top: -2057px`) |
| **na 10 echte scrollklikken** | **−1291** | **0** |
| slot losgelaten (= de code van vóór de fix), vóór het scrollen | −1291 | 2057 |
| **na diezelfde 10 scrollklikken** | **−2291** | **3057** |

De onderste twee regels zijn de melding, in dezelfde sessie gereproduceerd: de
achtergrond schoof 1000 pixels weg terwijl het scherm openstond.

Sluiten zet alles terug: `position` leeg, vlag weg, `scrollY: 2057` — precies waar
hij stond, geen sprong naar boven.

### 3.2 De favoriet, met echte kliks en echte toetsen

Alle kliks `isTrusted: true`, alle toetsen ook — inclusief de spatie in
"nils frahm" (`{"key":" ","isTrusted":true}`).

1. Zoeken op `nils frahm` → 6 treffers, één WS-aanroep.
2. **"Says" staat al in zijn bibliotheek en komt binnen met een gevuld hartje**
   (`favorite: true`, `library_item_id: "21"`, `aria-pressed="true"`). Dat is 1b.
3. Hartje op "nils frahm in de ochtend" → `media/favorite uri=library://track/7`,
   en `bibSoort_` wordt `"tracks"`.
   **`window.__diensten` blijft leeg: het hartje start geen muziek** — de fix van
   0.7.1 staat nog overeind.
4. Naar Favorieten → `{"type":"media/library","kind":"tracks","favorite":true}`,
   de knop **Nummers** is ingedrukt, en de lijst toont het zojuist toegevoegde
   nummer naast "Says". Vóór de fix was dit `kind: "playlists"` geweest.
5. Terug naar Zoeken → de zes zoekresultaten staan er weer, het filter staat weer
   op **Alles**, en het hartje van regel 4 staat nog aan.

Stap 4 en 5 samen zijn letterlijk zijn zin: hartje, andere tab, en weer terug.

---

## 4. Tests

- **JS: 346** (was 332). Nieuw: `tests/js/scrollslot.test.mjs` (7, **NIEUW
  GEDRAG**) en de brug tussen de twee soortenlijsten plus `bibSoortNa()` in
  `tests/js/bibliotheek.test.mjs`.
- **Python: 526** (was 523). Drie tests op `ma.treffers()`.
- **Aantoonbaar falend op de oude code** — dezelfde drie tests met `ma.py` van
  `main`:

```
FAILED tests/media/test_bibliotheek.py::test_treffers_dragen_het_hartje_mee
FAILED tests/media/test_bibliotheek.py::test_treffer_van_een_provider_leent_geen_bibliotheeknummer
FAILED tests/media/test_bibliotheek.py::test_treffers_zonder_die_velden_blijven_werken
3 failed, 29 deselected in 0.54s
```
  met als oorzaak `KeyError: 'favorite'` en `KeyError: 'library_item_id'`.

  De JS-tests zijn NIEUW GEDRAG: `zetScrollSlot`, `bibSoortNa` en `ZOEK_SOORTEN`
  bestonden niet en de bestanden zouden op de oude code niet eens laden. Wat de
  oude code wél deed staat hierboven onder 1a, uitgedraaid.

---

## Samenvatting

Twee meldingen, drie oorzaken en één nieuw moduletje. De favorieten-melding was
niet één bug maar drie, en de zichtbaarste ervan (het blad opende op
afspeellijsten) was ook de goedkoopste om te vinden.

## Wat niet lukte

**De echte Music Assistant van de eigenaar is deze ronde niet aangeraakt.** Alle
metingen staan op de werkbank met een nagebootste MA. Eén ding kan daardoor niet
hier bewezen worden: dat het zoekantwoord van zíjn MA de velden `favorite`,
`provider` en `item_id` echt meedraagt. Draagt het ze niet, dan verandert er niets
ten opzichte van nu (hartje uit op een zoekresultaat); de rest van de fix staat
daar los van.

## Aannames

- De serialisatie van `music_assistant.search` draagt per item `favorite`,
  `provider` en `item_id` mee, zoals de modellen van MA die kennen. De code
  verdraagt het als ze ontbreken; daar staat een test op.
- Dat de achtergrond de PAGINA is en geen kader binnen HA, volgt uit waar het
  scherm hangt: een kind van `body` kan zijn scroll alleen aan het venster
  doorgeven. Dat is op de werkbank bevestigd en niet op zijn dashboard.

## `git status --porcelain`

Zie de PR; de werkboom is schoon op het moment van mergen.
