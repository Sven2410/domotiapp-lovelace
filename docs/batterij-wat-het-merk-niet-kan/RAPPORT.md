# Batterijkaart: wat het merk niet kan, staat er niet (0.100.2)

2 november 2026, tak `fase-147/batterij-merk`. Gemeld door de beheersessie bij een klant met een Growatt, met de woorden van de
eigenaar: *"ik zie op de batterij kaart nog steeds charge en discharge staan. Maar growatt wil je dat helemaal niet. ... als ik het merk
heb geselecteerd dat die functie niet kan dat hij die functie dan niet laat zien op de kaart."*

## Samenvatting

**Een knop die de coach op niet beschikbaar zet, staat niet meer op de kaart.** Sinds coach v0.150.0 stuurt de coach een Growatt met
een laadschema. `alleen_lezen` is dan `false`, dus de kaart toonde de bediening. Maar vol laden, leegladen, terug naar het plan, leegladen
tot en de vakantiestand kan de coach bij dat merk niet. Die zet hij op `unavailable` (`AccuBediening` in zijn `entiteit.py`, op
`BATTERIJ_SCHEMA`). Leegladen tot en de vakantiestand verdwenen daardoor al. De twee knoppen bleven staan, want `opdrachtKnoppen` keek alleen
of er een entiteit wás.

| Wat | Voor | Nu |
|---|---|---|
| Vol laden, Leegladen, Naar plan | staan er, en doen niets | weg zodra de coach ze op niet beschikbaar zet |
| Leegladen tot | weg als het getal niet beschikbaar is | ook weg als de knop Leegladen niet beschikbaar is, want het getal hoort bij die knop |
| Vakantiestand | weg als hij niet beschikbaar is | hetzelfde |

**Geen eigen lijst per merk in de kaart.** Welk merk wat kan, weet de coach, en hij meldt het per entiteit. Een tweede lijst hier zou uit de pas
lopen zodra de coach bij een merk meer kan; zo ging het in oktober al een keer (Growatt eerst alleen uitlezen, een week later sturen).
Het merk dat de installateur bij de coach kiest, bepaalt dus wat de kaart toont. Een kaart zonder bediening wordt vanzelf korter.

**Een herstart.** Dan is de sensor van de coach ook weg, en staat er geen bediening. Komt een knop een tel later terug dan de sensor, dan
verschijnt hij een tel later; dat is beter dan een knop die niets doet.

## Gemeten

In de testinstance, view `batterij`, met de nagebootste coach. Bundel in de pagina `?v=1f5d9a3442fe`, gelijk aan de sha256 op schijf. De
vijf entiteiten van de Thuisbatterij zijn met `POST /api/states` op `unavailable` gezet en daarna teruggezet. Geen fouten in de pagina.

| Kaart | Knoppen | Leegladen tot | Vakantiestand | Hoogte |
|---|---|---|---|---|
| Solarbank, alles beschikbaar | Vol laden, Leegladen | staat er | staat er | 568 px |
| zelfde, alles niet beschikbaar | geen | weg | weg | 376 px, op een rasterrij |
| teruggezet | Vol laden, Leegladen | staat er | staat er | 568 px |
| Growatt die de coach alleen uitleest | geen | weg | weg | 120 px, ongewijzigd |

Op de schermafdruk zie je geen gat waar de knoppen stonden.

**Proeven.** 6 nieuwe in `tests/js/batterij-growatt.test.mjs`. Op 0.100.1 falen de 4 NIEUW GEDRAG-proeven (`bedienbaar` bestaat daar niet,
en de knoppen bleven staan). De 2 REGRESSIEWACHT-proeven slagen daar ook: een knop die beschikbaar is blijft staan, en zonder toestand blijft
het zoals het was.

Alles: JS 2239 en Python 1026 groen, `verify`, `check:registratie`, `check:css`, `check:controls` en `check:taal` groen.

## Wat niet lukte

- **Niet bij de klant zelf gezien.** De toestanden komen van de beheersessie (alle vijf `unavailable`, `alleen_lezen` false, stand
  Nul op de meter). De beheersessie kijkt na de installatie.

## Aannames

- Een entiteit van de coach die op `unavailable` staat, is iets wat hij bij dit merk niet kan. Dat geldt voor de bediening van de batterij:
  de coach zet die zelf op beschikbaar of niet, en ze hangen niet aan een apparaat dat weg kan vallen.
- Een knop zonder toestand (het register kent hem, Home Assistant niet) staat er ook niet: indrukken doet dan niets.

## git status --porcelain

Leeg na de commit.
