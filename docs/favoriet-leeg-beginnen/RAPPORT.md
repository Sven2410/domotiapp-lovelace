# Een nieuwe favoriet begint leeg (0.100.1)

1 november 2026, tak `fase-146/leeg-beginnen`. De eigenaar: *"ik wil toch geen voorgedefineerde opties. Gewoon leeg begeinnen dan
heeft de klant alles in eigen hand"*.

## Samenvatting

**De eerste stap met Woning verlaten, Alles uit en Zelf maken is weg.** Het plusje bij Favorieten opent meteen het scherm: naam, icoon,
de vinkjes en de lampen, allemaal leeg. De code, de stijl en de vertalingen van de sjablonen zijn er ook uit, dus er blijft niets van
over dat per ongeluk terugkomt.

| Wat | Hoe het nu is |
|---|---|
| een nieuwe favoriet | geen naam, geen lamp gekozen, geen vinkje aan; het icoon is de ster |
| de vinkjes | blijven, allemaal uit. De eigenaar vroeg er zelf om, en ze zetten alleen iets klaar als je ze aanklikt |
| een favoriet die al bestaat | blijft staan en opent zoals hij was, ook als hij uit een sjabloon kwam |

## Gemeten

In de testinstance, als gewone gebruiker, met 55 lampen. Bundel op schijf en in de pagina gelijk (`ea3b8425933f`). Echte kliks en toetsen,
`isTrusted` is `true`, geen fouten in de pagina.

| Stap | Uitkomst |
|---|---|
| plusje bij Favorieten | "Nieuwe favoriet", 0 sjablonen, koppen Naam, Icoon, Wat moet er gebeuren?, Lampen en rolluiken |
| leeg scherm | naam leeg, 0 lampen gekozen, alle vinkjes uit, Opslaan staat er maar kan nog niet: "Geef de favoriet een naam." |
| naam typen | "Film kijken", met een spatie (`isTrusted` op de keydown is `true`) |
| lamp en vinkje Alle lampen uit | Opslaan kan, geen melding |
| Opslaan | de favoriet staat op de server, naast de twee die er al waren; het proefje is daarna weer verwijderd |
| bestaande Woning verlaten openen | "Favoriet wijzigen", vinkjes Alle lampen uit en Behalve de buitenverlichting aan, 46 lampen, Opslaan kan |

**Proeven.** Het bestand op 0.100.0: 68 geslaagd, 1 gefaald. Die ene is NIEUW GEDRAG: de sjablonen bestaan niet meer. De andere zijn
REGRESSIEWACHT: de vinkjes moesten blijven doen wat ze deden, en die proeven gingen eerst via een sjabloon. Dat een nieuwe favoriet leeg
begint, is ook een REGRESSIEWACHT, want `nieuweFavoriet` was al leeg; alleen de stap ervoor is weg, en die is hierboven in de browser gemeten.

Alles: JS 2233 en Python 1026 groen, `verify`, `check:registratie`, `check:css`, `check:controls` en `check:taal` groen.

## Wat niet lukte

Niets.

## Aannames

- **De vinkjes horen niet bij "voorgedefinieerde opties".** Ze staan uit tot de klant ze aanklikt. Bedoelde de eigenaar ze wel, dan zijn
  ze er in een volgende ronde zo uit.
- Staan er bij een klant favorieten die uit een sjabloon kwamen, dan blijven die staan. Weghalen doet de klant of een beheersessie.
- Op een kaart met precies één lamp staat die lamp al gekozen, zoals altijd al. Daar valt niets anders te kiezen.

## git status --porcelain

Leeg na de commit.
