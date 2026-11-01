# De ruimtes op één rij die opzij veegt, en één keer Uit (0.100.0)

1 november 2026, tak `fase-145/ruimtes-opzij`. De eigenaar: *"Ik wil een swipable mogelijheid van links naar rechts voor de
ruimtes. Mensen gaan toch meer de zoekfunctie gebruiken. zo houden we weer veel meer ruimte over."* En met een schermafdruk van
de helderheid: *"En waarom staat hier 2x off?"*

## Samenvatting

**De ruimtes staan op één rij die opzij veegt.** In 0.96.0 ging zo'n rij er juist uit, omdat een muiswiel op een laptop niet opzij
kan. Daarom kan het nu op alle vier de manieren:

| Waarmee | Wat er gebeurt |
|---|---|
| vinger | gewoon vegen; aan het einde gaat de veeg niet door naar de pagina |
| touchpad | gewoon opzij vegen; dat laten we met rust |
| muiswiel | boven de rij schuift hij opzij, en aan het einde scrolt het scherm verder |
| muis | slepen, ook vanaf een knop, en dat kiest die knop dan niet |

- **Zonder balk is de vervaagde rand het teken dat er meer staat.** Hij staat alleen aan de kant waar er nog wat komt.
- **Wie het scherm scrolt en met de muis over de rij komt, blijft scrollen.** Anders blijft het wiel in de rij hangen. Waar het wiel
  begon telt, tot het even stilstaat.
- **Een half zichtbare knop schuift na een tik helemaal in beeld.**
- **Typen in de zoekbalk haalt de gekozen ruimte terug in beeld**, want de zoekbalk zoekt binnen die ruimte.

**De dubbele Off was geen fout in de tekst, maar twee dingen die hetzelfde zeiden.** Links staat de stand, die Uit zegt bij 0%. Rechts
staat de knop om op uit te zetten, sinds 0.97.0. Staat de groep al op uit, dan is die knop nu weg. Zijn plek blijft leeg, want
anders wordt de schuif breder onder je vinger. Bij rolluiken ging het net zo, met Dicht.

## Gemeten

In de testinstance, als gewone gebruiker, met 55 lampen in 21 ruimtes. Bundel op schijf en in de pagina zijn gelijk (`84ba7750014e`
voor de rij, `96e58b7cc9d0` na de Uit-knop). Echte muis, toetsen en aanraking, `isTrusted` is `true`, geen fouten in de pagina.

**De ruimte die het oplevert**, op 1366 × 768:

| | Met de CSS van 0.99.0 | Nu |
|---|---|---|
| hoogte van de ruimtes | 128 px | 44 px, en daarvan is 8 px de marge voor de focusring |
| hoogte van het hele scherm | 1199 px | 1115 px |

Op de telefoon scheelt het meer, maar dat is niet naast elkaar gemeten.

**De rij**, stand van `scrollLeft`, met 1154 px te schuiven:

| Wat | Rij | Scherm (`scrollTop`) | Keuze |
|---|---|---|---|
| wiel 100 boven de rij | 0 → 100 | blijft 0 | Alle |
| wiel door tot het einde | 1154 | 397, scrolt door | Alle |
| wiel terug | 0 | 0 | Alle |
| wiel begon op de zoekbalk, daarna over de rij | blijft 0 | 30 → 150 | Alle |
| slepen 240 px, begonnen op een knop | 240 | 0 | Alle, er is niets gekozen |
| klik op een knop die 31 px uitstak (Keuken) | 299 | 0 | Keuken, 28 px van de rand, 4 lampen |
| Tab, twaalf keer | 386, knop in beeld | | de ring heeft 4 px boven en onder, en wordt dus niet afgesneden |

De rand: `false, true` aan het begin, `true, true` in het midden, `true, false` aan het einde.

**Zoeken met echte toetsen:** met Keuken gekozen en de rij teruggeschoven `lamp 1` getypt, met een spatie (`isTrusted` op de keydown is
`true`). De tekst klopt, de focus blijft in het veld, en Keuken staat weer in beeld.

**Telefoon**, 390 × 844, met aanraking: geen horizontale scroll op de pagina, de rij blijft binnen het vak (27 tot 363 in een vak van
16 tot 374). Een veeg van 220 px over `Input.dispatchTouchEvent` schuift 292 px, met naloop. De pagina scrolt niet mee (`scrollTop` 0). Een tik op
Eetkamer kiest die, met 3 lampen.

**Licht:** `dac-thema` is `licht`, en de rij vervaagt daar net zo goed; dat kan ook niet anders, want het masker werkt op de doorzichtigheid
en niet op een kleur. Op de schermafdruk gezien.

**Uit**, op een telefoonbreedte, op een favoriet met Alle lampen uit:

| Wat | Links | Knop rechts | Schuif (x, breedte) |
|---|---|---|---|
| begin | Uit | weg | 102, 197 |
| schuif omhoog | 12% | terug | 102, 197 |
| schuif op de helft | 50% | terug | 102, 197 |
| tik op de knop Uit | Uit | weg | 102, 197 |
| met de hand terug naar 0 | Uit | weg | 102, 197 |

**Proeven.** 7 nieuwe in JS, NIEUW GEDRAG: op 0.99.0 falen ze alle 7 (62 geslaagd, 7 gefaald in dat bestand), omdat `wielOpzij`,
`wielBeurt`, `randenVan` en `schuifNaar` daar niet bestaan. De knop Uit heeft geen eigen unittest: dat is CSS met één regel die hem aan-
en uitzet, en die is hierboven in de browser gemeten. Op de oude versie staat de fout op de schermafdruk van de eigenaar.

Alles: JS 2233 en Python 1026 groen, `verify`, `check:registratie`, `check:css`, `check:controls` en `check:taal` groen.

## Wat niet lukte

- **Niet op een echte iPhone gemeten.** De aanraking is die van Chromium in telefoonstand. `-webkit-mask-image` staat er voor Safari
  bij, maar dat de rand daar vervaagt en dat de veeg daar niet de pagina meeneemt, heb ik niet gezien. De eigenaar test op zijn iPhone.
- **Een touchpad is niet nagespeeld.** Opzij vegen gaat daar via de browser zelf. Dat de code dat met rust laat, staat in de unittest.

## Aannames

- De lampenlijst blijft even hoog. De gewonnen ruimte gaat naar een korter scherm, niet naar een langere lijst.
- De ruimtes houden hun volgorde: Alle, daarna op naam. Er komt geen knop om de rij door te schuiven; muiswiel en slepen zijn genoeg.
- De regel in `CLAUDE.md` over geen scrollrij opzij is vervangen door de nieuwe, met de reden dat wiel en slepen moeten blijven.

## git status --porcelain

Leeg na de commit.
