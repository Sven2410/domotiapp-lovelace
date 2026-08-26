# De klimaatkaart onder elkaar, een rij dupliceren, en negen weericonen

Uitgave **0.19.0**. Drie wensen die de eigenaar in de nacht van 26 op 27
augustus 2026 los aanleverde, plus twee valkuilen die deze sessie boven kwamen.

---

## 1. De klimaatkaart onder elkaar

**Wat hij vroeg:** *"bij de klimaat kaart wil ik de optie hebben om hem onder
elkaar te zetten anders past het niet op telefoon"*, met een schermafdruk van
zijn eigen klimaat-pop-up erbij: twee tegels naast elkaar met temperatuur en
vochtigheid, en de instelrij eronder.

**Wat het geworden is.** Een veld **Vorm** in de editor, naast de bestaande
velden en op hetzelfde niveau (geen weergave-blok):

| | |
|---|---|
| Rij (één rasterrij hoog) | de bestaande vorm, en de standaard |
| Onder elkaar (past op een telefoon) | kop, twee tegels, stelknop over de volle breedte |

De rij-vorm blijft de standaard en is niet veranderd. Bewust géén kaart die uit
zichzelf van vorm wisselt bij een smalle kolom: dan leest hetzelfde dashboard op
twee schermen anders, en dat is niet aan de kaart om te beslissen.

In de gestapelde vorm meldt de regel onder de naam alleen nog wat de ketel doet
("Uit", "Verwarmt") -- de getallen staan in de tegels. Een tegel zonder meting
verdwijnt, en de overgebleven tegel neemt dan de volle breedte.

### Gemeten in een echte browser

Op de werkbank (`dev/preview.html`), met `getBoundingClientRect()` en niet op
het oog:

```
kaart:                        379 x 184
tegelsGelijkBreed:            true      (172 en 172)
gatTussenTegels:              8
tegelsSamen:                  353
stelknopBreedte:              353
stelknopEvenBreedAlsTegels:   true
volgorde (y):                 kop 1137 -> tegels 1185 -> stelknop 1243
onderElkaar:                  true
```

En de hoogtes vallen op HA's rasterrijen:

| kaart | hoogte | rijen |
|---|---|---|
| rij-vorm (onveranderd) | 56px | 1 |
| gestapeld, met thermostaat | **184px** | 3 |
| gestapeld, alleen metend | **120px** | 2 |

Dat laatste is niet vanzelf gegaan en is het vermelden waard. De kaart stond op
`rows: 1, max_rows: 1` -- een vast getal, precies waar valkuil 8 en 12 voor
waarschuwen. Zonder ingrijpen kwam de gestapelde vorm op **168px** uit: tussen
twee rasterrijen in, en dus over de buurman heen. De gestapelde vorm geeft nu
`rows: "auto"` op met een GEMETEN ondergrens, en `meetRaster` duwt hem naar 184.

**Wat daarbij opviel:** de allereerste `paint()` meet nul, want de opmaak is dan
nog niet rond. `meetRaster` heeft daar een herkansing via
`requestAnimationFrame` voor -- en die staat in een VERBORGEN tabblad stil.
De eerste meting gaf daardoor een lege `--dac-raster`, en dat leek een fout in
de kaart. Na een afgedwongen `paint()` stond er gewoon `184px`. Het is dus geen
bug, maar het is wel een reden om nooit een conclusie te trekken uit een meting
in een achtergrondtabblad.

---

## 2. Een rij dupliceren op de entiteitenkaart

Een knop naast de prullenbak in de kop van elke rij. Hij kopieert de rij --
kolommen, vorm, uitlijning, kolomkoppen en alle plekken erin -- en zet hem er
direct onder, meteen opengeklapt.

Drie dingen die daarbij nodig waren:

- **Diep kopiëren** (`structuredClone`). Een ondiepe kopie zou twee rijen op
  dezelfde item-objecten laten wijzen, en dan verandert de ene mee met de andere.
- **De onthouden open-standen meeschuiven.** De editor onthoudt per uitklapblok
  of het openstaat, met sleutels als `r2` en `r2i1`. Die sleutels zijn nummers,
  dus zonder correctie erft de nieuwe rij de stand van zijn buurman. Dat
  rekenwerk staat nu los in `src/editor/entities-rijen.js` als `schuifOpen()`,
  met acht tests -- de scheiding waar valkuil 23 om vroeg.
- **Een getekend icoon in plaats van een glyph**, want het teken voor
  "dupliceren" (U+29C9) ontbreekt op genoeg systemen om een leeg vakje te
  worden. En hij wordt niet rood bij hover: dupliceren is geen weggooien.

---

## 3. Negen weericonen

Gevraagd: vochtigheid, lux, windsnelheid, weercode, UV-index, voorspelling,
regen, weerstation, buienradar.

**Vier daarvan bestonden al** en zijn niet opnieuw getekend -- ze waren alleen
lastig te vinden:

| gevraagd | bestond al als |
|---|---|
| UV-index | `uv` |
| regen | `rain` |
| wind | `wind` |
| vocht (algemeen) | `drop` |

**Zeven nieuw getekend**, op dezelfde lijndikte 1.6 als de rest van de set:

`humidity` (druppel met procentteken -- een lekkage is geen percentage, vandaar
naast `drop`), `lux` (licht dat op een meetvlak valt), `windSpeed` (wind met een
meter eronder), `weatherCode`, `forecast`, `rainfall` (de regenmeter),
`weatherStation`, `rainRadar`.

Er is een groep **Weermetingen** bijgekomen in de icoonkiezer, en elk icoon is
te vinden op de woorden die hij zelf gebruikt. Dat is met twaalf tests
vastgelegd, want de sleutels zijn Engels en hij typt Nederlands:

```
vindt humidity op "vochtigheid"        vindt forecast op "voorspelling"
vindt lux op "lichtsterkte"            vindt rainfall op "regenmeter"
vindt windSpeed op "windsnelheid"      vindt weatherStation op "weerstation"
vindt weatherCode op "weercode"        vindt rainRadar op "buienradar"
```

---

## 4. Twee valkuilen in CLAUDE.md

- **30. "De server is bij" zegt niets over wat een client draait.** De les van
  0.18.0, zodat de volgende sessie niet opnieuw de serverkant gaat controleren
  bij een melding die "al opgelost" hoort te zijn.
- **31. esbuild gooit commentaar weg**, dus een commentaarwijziging geeft een
  byte-identieke bundel en dezelfde hash. Dat kostte een ronde bij het naspelen
  van een verouderde pagina.

---

## Wat NIET gelukt is

**De drie wijzigingen zijn niet op een echt Home Assistant-dashboard bekeken.**
Het Chrome-tabblad was opnieuw niet actief te krijgen, en Home Assistant bouwt
in een verborgen tabblad geen views (`hui-root` bleef weg, `hui-card` bleef 0).
Na drie pogingen is daarmee gestopt.

Wat er wél is: de gemeten posities en hoogtes hierboven komen uit een echte
Chrome op de werkbank, niet uit jsdom, en de rij-vorm is aantoonbaar onveranderd
op 56px. Wat er niet is: de duplicatieknop met een échte klik aangetoond, en de
gestapelde kaart náást een Mushroom-kaart in dezelfde kolom.

**Voor de volgende sessie: vraag de eigenaar om het tabblad vooraan te zetten.**
Dat is één handeling en het lost drie ronden aan gepruts op; CLAUDE.md zegt al
dat hij dat zonder morren doet.

---

## Aannames

Geen aannames gedaan.

## Tellingen

- 657 JS-tests (was 637), alle groen -- 20 nieuw: 12 voor de iconen, 8 voor
  `schuifOpen`
- 527 Python-tests, alle groen
- Bundel 488.065 bytes, sha256 `435bf674…`, versie 0.19.0
- 152 getekende iconen (was 145)

## git status --porcelain

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M dev/preview.html
 M src/cards/climate-card.js
 M src/editor/entities-editor.js
 M src/editor/entities-rijen.js
 M src/editor/icoon-zoek.js
 M src/icons.js
 M tests/js/entiteiten-rijen.test.mjs
 M tests/js/icoon-zoek.test.mjs
?? docs/klimaat-gestapeld-rij-dupliceren-en-negen-iconen/RAPPORT.md
```
