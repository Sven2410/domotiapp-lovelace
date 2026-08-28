# Het opslagscherm, verwijderen, en de datumkiezer die te veel tikken kostte

**Uitgave 0.31.0 — 28 augustus 2026**

Vier meldingen in één sessie:

> "Dan wil ik een soort opslag icoontje waar we alle snapshots kunnen zien met de
> datum, want dat kan toch ook als je de timeline doorscrollt in de tijd. En dan
> een verwijder snapshots knop of iets dat ik handmatig ook kan verwijderen. En
> waar wordt alles opgeslagen en hoe groot zal het bestand etc worden?"

> "En ik kan niet scrollen op de timeline op PC, op telefoon kan het wel."

> "Op telefoon klapt er geen kalender uit om terug te kijken, en eerst staat hij
> op pc op alles, daarna op vandaag, en dan pas kan ik er nog een keer op klikken
> om de datum te selecteren. Ik wil een kalender icon: als ik daarop klik kan je
> de datum selecteren, en het vak van vandaag moet vandaag of de datum laten
> zien."

---

## 1. Waar staat het, en hoe groot wordt het

Dit stond nergens opgeschreven, en het is nu ook in de kaart zelf te lezen —
onderaan het opslagscherm, want het antwoord verandert elke dag.

**Waar.** Eén jpeg per snapshot in `<config>/domotiapp_lovelace/beelden/`.

- **Niet in `www/`**, waar de meeste kaarten hun plaatjes zetten: alles daar
  serveert Home Assistant uit op `/local/...` **zonder inloggen**. Dit zijn
  beelden van de voordeur van een klant.
- **Niet in `.storage/`**: daar hoort JSON, en een volledige back-up neemt die
  map altijd mee — een week camerabeelden in elke back-up is niet wat iemand
  bedoelt als hij op "back-up maken" drukt.
- Ze gaan naar buiten via `/api/domotiapp_lovelace/beeld/<id>`, met een
  handtekening in de URL die twee uur meegaat.

Het lijstje eromheen — welk beeld, welke camera, welke melder, hoe laat, hoeveel
bytes — staat wél in `.storage/domotiapp_lovelace.beelden`. Dat is JSON van
hooguit een paar honderd kB.

**Hoe groot.** Twee grenzen, allebei uit de ronde van 27 augustus:

| grens | waarde |
|---|---|
| leeftijd | 7 dagen |
| aantal per camera | 500 |

Bij ~150 kB per jpeg is dat **ongeveer 75 MB per camera**, dus met vier camera's
zo'n 300 MB in het slechtste geval. In de praktijk minder: die 500 haal je alleen
met veel beweging. Op de testinstance stond er na dertien detecties 2 MB.

## 2. Het opslagscherm

Rechts in de dagrij staat nu een **opslagicoon**. Eén tik en je ziet alles wat er
ligt, **per dag**, met datum, aantal en omvang:

```
Snapshots   13 beelden · 2 MB                    [Alles wissen] [×]

Vandaag     4 · 539 kB                              [Wis deze dag]
Gisteren    5 · 758 kB                              [Wis deze dag]
ma 24 aug   4 · 538 kB                              [Wis deze dag]
```

Het toont **alles**, ongefilterd. De filters op de kaart zijn er om iets terug te
vinden; dit scherm is er om te zien wat er ligt — en om het weg te gooien. Een
filter dat stilletjes meeloopt zou betekenen dat "Alles wissen" niet alles wist.

## 3. Verwijderen, met de hand

Drie manieren, elk met een vraag ervoor:

- **Eén beeld**: een kruisje in de hoek van de miniatuur.
- **Een hele dag**: "Wis deze dag" naast de datum.
- **Alles**: rechtsboven.

De vraag komt uit `src/vraag.js` en niet uit `dialog-box` van Home Assistant —
die is op een vers geladen dashboard gewoon niet gedefinieerd (valkuil 26). En
weggegooid beeld komt niet terug, dus dit is precies het geval waar een vraag
voor is.

**Aan de serverkant** is er een nieuw commando `bewaking/verwijder`. Het loopt
langs dezelfde weg als het automatische opruimen: uit de index, van schijf, en
een bericht naar elke open kaart — zodat een tweede tabblad de miniatuur ook ziet
verdwijnen. De index wordt hier **meteen** weggeschreven en niet vertraagd: dit is
een handeling van een mens, en die verwacht dat het weg is.

**Er is met opzet geen "verwijder alles"-opdracht aan de serverkant.** Wie wist,
stuurt de ID's die hij bedoelt. Zo kan een verdwaald commando nooit meer weghalen
dan er op het scherm stond.

## 4. De datumkiezer: één tik in plaats van drie

Hij had gelijk over alle drie de dingen.

- **Het vak zegt nu welke dag je ziet** — "Vandaag", "Gisteren" of "wo 26 aug" —
  en is geen knop meer. De kaart begint op vandaag en niet op "alles".
- **Er staat een kalendericoon naast.** Eén tik opent de kiezer.
- **Op een telefoon werkt dat ook.** Het echte `<input type="date">` ligt
  onzichtbaar óver dat icoon, dus de tik landt op het veld zelf en het toestel
  opent zijn eigen kalender. `showPicker()` — dat op een pc nodig is — heeft op
  Android niet overal toestemming; een veld dat de tik zelf opvangt heeft die
  toestemming niet nodig.

**En de pijlen springen naar de eerstvolgende dag waar iets STAAT.** Per dag
stappen betekent op een rustige week vier keer klikken voor niets. Is er in die
richting niets meer, dan staat de pijl uit.

**De tellers op de soortknoppen volgen nu de dag die je ziet.** Ze telden de hele
voorraad: er stond 4 op de knop en er kwamen er 2 tevoorschijn als je hem
indrukte. Een getal dat niet klopt met wat de knop doet is geen informatie maar
een raadsel.

## 5. Scrollen op de pc

> "Ik kan niet scrollen op de timeline op PC, op telefoon kan het wel."

Klopt, en het is geen fout in de strook: op een telefoon veeg je opzij, en een
muiswiel draait omhoog en omlaag — precies de kant die de strook niet op kan. De
scrollbalk staat er bovendien niet, want vier grijze streepjes onder een kaart is
geen vormgeving.

Verticaal wielen schuift nu horizontaal, op de timeline én op de andere rijen die
opzij scrollen (de camerakeuze, de presets). Alleen zolang er wat te schuiven
valt: staat de strook aan het eind, dan mag de **pagina** het wiel weer hebben —
anders blijft je dashboard onder je muis hangen.

---

## Wat er gemeten is, in een echte browser

Testinstance op poort 8127, met echte snapshots van de bewakingsmotor. Om drie
dagen te hebben zijn negen van de dertien beelden in de index op een oudere dag
gezet (HA gestopt, `.storage`-index bijgewerkt, HA gestart); de beelden zelf en
de hele keten eromheen zijn echt.

**Verse code:**

```
/domotiapp_lovelace/domotiapp-lovelace.js?v=b46fc33d26db
619582 bytes   sha256 b46fc33d26db772a3a815518f1ba093912206cd76e9d329674a528daa134dee8
op schijf:     b46fc33d26db772a3a815518f1ba093912206cd76e9d329674a528daa134dee8
```

**Elke handeling met echte kliks en echte toetsaanslagen**, alle met
`isTrusted: true` en hun `composedPath()` erbij:

| handeling | pad | gevolg |
|---|---|---|
| pijl terug | `svg › button.pijl[dag-1] › div.rij` | "Vandaag" → "Gisteren", 5 beelden van 27 aug, tellers dier 1 / aanbellen 2 / ontgrendeling 2 |
| opslagicoon | `span.opslag` | het scherm opent: 13 beelden · 2 MB, drie dagen met hun omvang |
| kruisje op een miniatuur | `svg › span.weg` | vraag "Weet je zeker dat je dit beeld van Auto oprit wilt verwijderen?" |
| Verwijderen | `button.ja › div.knoppen` | 13 → 12 in de kaart, in het scherm **én op de server**; "Vandaag" van 4 · 539 kB naar 3 · 312 kB |
| "Wis deze dag" | `button › div.dagkop` | vraag over 4 beelden van ma 24 aug; daarna 12 → 8 en die dag is weg |
| wiel over de strook | `wheel isTrusted, deltaY 200` | `scrollLeft` van 0 naar 66 (het maximum), en `window.scrollY` bleef 0 |
| kalendericoon | | de kalender van de browser opent op de dag die je ziet (schermafdruk) |
| datum intypen | acht toetsen, alle `isTrusted` | veld `2026-08-24`, vak "ma 24 aug", strook "Niets binnen dit filter." |

**Ook op schijf gecontroleerd** na het wissen: 12 bestanden in
`.ha-dev-config/domotiapp_lovelace/beelden/` en 12 regels in de index. Het
bestand is er werkelijk af.

**Uitlijning, gemeten:**

```
kaart        838 .. 1338
dagrij       849 .. 1327
soorten      849 .. 1327
camerakeuze  849 .. 1327
```

**Inhoud past in de kaart:** `scrollHeight 545 <= hoogte 547`.
**Geen fouten in de console** na een verse lading.

## Proeven

```
npm test                   899 groen (10 nieuw)
python -m pytest           597 groen (4 nieuw, in tests/bewaking/test_websocket.py)
npm run check:css          OK
npm run check:registratie  OK
npm run verify             OK — bundel actueel
```

## Wat er misging, en wat eraan gedaan is

**Valkuil 16 opnieuw, en deze keer viel de hele bundel om.** Er stond
`` `.groot` `` in een CSS-commentaar. Alle CSS staat in een sjabloonliteral, dus
die backtick sloot de string af en maakte er een tagged template van: het bouwde,
het laadde, en toen stond er `TypeError: "...".groot is not a function` en was er
**geen enkele kaart geregistreerd**. Het dashboard bleef leeg.

De bewaker `check:css` vangt dit — hij is er precies voor gebouwd. Alleen was hij
niet gedraaid: bouwen en controleren waren twee opdrachten, en alleen de eerste
hoort bij het meten.

**Daarom draait `npm run check:css` nu bij elke `npm run build`.** Dat is de hele
reparatie: deze klasse fout kan niet meer in een browser terechtkomen omdat
iemand vergeet een bewaker te draaien.

## Aannames

- **Het opslagscherm toont álles en luistert niet naar de filters.** Zie punt 2.
- **Een verwijderde dag blijft weg**; er is geen prullenbak. Dat is wat "weg is
  weg" in de vraag belooft.
- **De kaart haalt sinds deze ronde de HELE voorraad op** in plaats van de eerste
  zestig. Nodig om te weten welke dagen er zijn, en het is goedkoper dan het
  klinkt: er worden alleen miniaturen getekend voor de dag die je ziet. Vóór deze
  ronde stonden er zestig `<img>` in de strook, nu een handvol.

## `git status --porcelain`

```
M  CLAUDE.md
M  custom_components/domotiapp_lovelace/bewaking/motor.py
M  custom_components/domotiapp_lovelace/bewaking/websocket.py
M  custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
M  custom_components/domotiapp_lovelace/manifest.json
AM docs/opslagscherm-en-verwijderen/RAPPORT.md
M  package.json
M  scripts/check-css.mjs
M  src/cards/camera-card.js
M  src/cards/camera-filters.js
M  tests/bewaking/test_websocket.py
M  tests/js/camera-filters.test.mjs
```
