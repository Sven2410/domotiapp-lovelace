# Onze iconen overal: `dai:` in `ha-icon` (0.99.0)

31 oktober 2026, tak `fase-144/iconset`. De eigenaar: *"mdi icons gebruiken we niet alleen onze icons"*, en op de vraag van de
beheersessie of alle `mdi:` op een dashboard om moeten: *"Ja, alles vervangen"*. De beheersessie liep vast op 35 iconen in de
kop van `custom:bubble-card`-pop-ups: die kaart tekent met `ha-icon`, en daar tekende `bed` of `dai:bed` niets.

## Samenvatting

**`dai:bed` werkt nu overal waar `ha-icon` gebruikt wordt:** in de kaarten van Home Assistant zelf, en in kaarten van anderen
die `ha-icon` gebruiken. Het zijn dezelfde namen als op onze eigen kaarten, die `dai:` al kenden.

| Vraag | Antwoord |
|---|---|
| Hoe meldt de set zich aan? | `window.customIcons.dai` met `getIcon` en `getIconList`, de ingang van Home Assistant zelf |
| Lijntekeningen en `ha-svg-icon`? | dat kent alleen een gevulde vorm. `scripts/iconen-naar-paden.py` maakt van elke lijn de omtrek |
| Waar staan de vormen? | `afbeeldingen/iconen.json`, 260 kB (69 kB gezipt), pas opgehaald als er een `dai:`-icoon gevraagd wordt |
| Waarom in de lader en niet in de bundel? | `ha-icon` zet bij een onbekende set `_legacy` en probeert het niet opnieuw. De lader draait eerst |
| Het logo `domotitech`? | zit er niet in: dat is een plaatje |

**Erbij: een wijnglas** (`wijnglas`, ook te vinden op glas, wijn, drank, bar, kelder, liquor), want voor de Liquor room hadden we
niets. Nu 173 iconen, waarvan 172 als vorm.

## Gemeten

**De vorm tegen de tekening.** Elk icoon twee keer getekend op 96 × 96 en de beeldpunten geteld die verschillen, in een browser:

| | |
|---|---|
| iconen | 172 |
| slechtste | `handmatig` 0,06%, `parasol` 0,05% van de beeldpunten met inkt |
| de andere 170 | 0% |
| leeg | geen |

**In de testinstance,** gewone gebruiker, koude start in een vers profiel en daarna herladen, met kaarten van Home Assistant zelf.
Geen fouten in de pagina.

| Kaart en icoon | Koud | Herladen |
|---|---|---|
| tile `dai:sofa` | pad klopt, 24 px | pad klopt |
| tile `dai:wijnglas` | pad klopt, 24 px | pad klopt |
| button `dai:bed` | pad klopt | pad klopt |
| button `dai:shutterOpen` | pad klopt | pad klopt |
| button `dai:bestaatniet` | leeg, geen fout | leeg, geen fout |
| button `mdi:robot` | getekend, dus niets kapot | getekend |
| onze separator `dai:wijnglas` | getekend | getekend |

"Pad klopt" betekent: de `d` in `ha-svg-icon` is gelijk aan die in het bestand. De kleur volgt de kaart (de kleur van de lamp op een
tile, blauw op een knop), en dat is op de schermafdruk gezien.

- Op een pagina zonder `dai:`-icoon gaat het bestand niet over de lijn: 0 verzoeken.
- `getIconList` geeft 172 iconen met hun zoekwoorden.

**Proeven.** NIEUW GEDRAG: 5 in JS, 2 in Python, en die falen op 0.98.2 omdat het bestand en de set daar niet bestaan. De hash in
het adres heet `?h=` en niet `?v=`: `test_de_lader_bevat_nog_steeds_precies_een_hash` viel eerst om op een tweede `?v=`, en
terecht, want een oudere bundel leest dat veld. De uitkomst van de hele ronde staat in de PR.

## Wat niet lukte

- **Bubble Card zelf staat niet op de testinstance.** Dat die kaart `ha-icon` gebruikt, komt van de beheersessie, die het bij de
  klant beproeft.
- **De kiezer van Home Assistant zelf is niet geopend.** `getIconList` geeft de lijst terug, maar of `dai:` daar in de zoeklijst
  verschijnt, heb ik niet gezien. Typen kan altijd.
- **Een `ha-icon` die rendert vóór de lader klaar is, blijft leeg tot de pagina herlaadt.** Niet gezien, koud en herladen, op een
  kleine testinstance. De lader staat in de HTML, en een dashboard wacht op de websocket.
- **Op een telefoon in de app niet gemeten.**

## Aannames

- De naam `dai:` in plaats van het voorgestelde `domotiapp:`: dezelfde naam als op onze eigen kaarten, zodat er geen twee schrijfwijzen
  zijn.
- De `mdi:`-mogelijkheid in onze kaarteditors blijft: die verwijderen zou bestaande dashboards leeg maken.

## git status --porcelain

Leeg na de commit.
