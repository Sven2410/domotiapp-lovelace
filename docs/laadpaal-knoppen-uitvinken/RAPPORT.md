# 0.88.0: knoppen op de laadpaalkaart per kaart uitvinken

Gevraagd op 31 oktober 2026, via een coach-sessie: *"ik wil op de laadpaalkaart
diverse opties kunnen deselecteren. Zoals solar charging etc"*. De eigenaar koos
daarbij: per kaart in Lovelace, voor Snel, Continu, Zon en Pauze. Het paneel van
de coach houdt alle knoppen; aan de coach verandert niets.

## Samenvatting

**In de editor** staat een blok **Knoppen op deze kaart** met vier vinkjes. Alles
staat standaard aan, dus een bestaande kaart verandert niet.

| Wat | Hoe |
|---|---|
| de config | `knoppen: [snel, continu]`. Geen sleutel is allemaal, een lege lijst is geen enkele |
| alles aangevinkt | de sleutel gaat uit de YAML (`zonderVolleKnoppen`), zodat een knop die er later bijkomt er vanzelf op staat |
| de modi | een filter bovenop `modus_keuzes` in `modusKnoppen`. Een aangevinkte knop die de coach nu niet aanbiedt, komt er dus niet bij |
| Pauze | de schakelaar krijgt geen entiteit als hij is uitgevinkt, en valt weg zoals een paal zonder pauze |
| Schema | blijft staan: daar is niet om gevraagd |

**Staat een uitgevinkte stand toch aan** (gezet in het paneel van de coach), dan
zegt de kaart dat:
- een modus staat als regel boven de knoppen (`modusRegel`), bijvoorbeeld "Zon";
- pauze staat in de zin eronder: "Pauze: geldt tot de kabel eruit gaat."

**Alles uitgevinkt:** de knoppen zijn weg, maar de regel die zegt wat er geldt
("Goedkoopst", "Planning · klaar om 07:30") blijft staan. Die regel is geen knop.
De vraag zei "dan verdwijnt de rij"; alleen het knoppendeel verdwijnt.

## Gemeten

In de testinstance op de mini-pc (HA 2026.8.1, nagebootste coach), headless
Chromium met Playwright en echte muiskliks en tikken. De `?v=` van de geladen
bundel (`211281140731`) was gelijk aan de sha256 op schijf.

Via het echte potlood, de kaartoverlay en de knop Opslaan, telkens daarna herladen:

| Stap | Opgeslagen | Knoppen op de kaart | Regel |
|---|---|---|---|
| geen keuze | geen `knoppen` | snel, continu, zon, pauze, schema | Goedkoopst |
| Zon en Pauze uit | `[snel, continu]` | snel, continu, schema | Goedkoopst |
| ook Snel en Continu uit | `[]` | schema | Goedkoopst |
| alles weer aan | geen `knoppen` | snel, continu, zon, pauze, schema | Goedkoopst |

Met `[snel, continu]`:

| Handeling | Uitkomst |
|---|---|
| klik op Continu | `select.oprit_modus` wordt `continu`, de knop staat aan, geen regel |
| Zon gezet buiten de kaart om | regel "Zon", noot "Zon: geldt tot de kabel eruit gaat." |
| pauze gezet buiten de kaart om | noot "Pauze: geldt tot de kabel eruit gaat." |

Op 393 breed (`isMobile`), met een tik: `isTrusted: true`, `select.oprit_modus`
wordt `snel`, en `scrollWidth` blijft 393.

| Knoppen | Breedte per knop | Hoogte van `.modi` |
|---|---|---|
| drie | 111,7 | 64 |
| twee | 170,5 | 64 |
| één | 73, naast de regel | 38 |
| geen | geen | 20 |

**De meting van "geen" vond een fout:** de rij was eerst 26 hoog bij een regel van
20, 6 px gat door het lege knoppenvak. Opgelost met `.knoppen:empty`, daarna
opnieuw gemeten: 20. De kaarthoogte bleef overal 376, en (376 + 8) / 64 valt op
het raster. Geen paginafouten.

**Proeven:**
- `tests/js/laadpaal-knoppen-uitvinken.test.mjs`: 13 tests, waarvan 9 NIEUW GEDRAG
  die falen op de code van vóór deze ronde (`# pass 4`, `# fail 9`), en 4 die daar
  slagen: de drie als REGRESSIEWACHT gelabelde en "een aangevinkte knop die de
  coach nu niet aanbiedt".
- JS 2088 groen (was 2075), Python 943 groen.
- `verify`, `check:registratie`, `check:css`, `check:controls` en `check:taal` groen.

## Wat niet lukte

- **`npm test` draait niet op de mini-pc:** Node 20.20.2 vult de glob in
  `package.json` niet in ("Could not find"). CI draait 24.18.1 en heeft er geen
  last van. Hier gedraaid met `node --test $(find tests/js -name '*.test.mjs')`.
  Niet in deze ronde aangepast.
- **Niet gemeten in Chrome van de eigenaar,** maar headless, zoals de vorige
  rondes op de mini-pc.
- **`isTrusted` is alleen getoond op de tik op de kaart.** Het logboek van de
  editorkliks ging verloren bij het herladen; die kliks gingen wel via dezelfde
  muisroute van Playwright, en de config veranderde erdoor.
- **Niet gemeten:** het lichte thema (geen nieuwe kleuren) en de Engelse editor
  (`check:taal` wel groen).

## Aannames

- "Dan verdwijnt de rij" gaat over de knoppen, niet over de regel die zegt wat er
  geldt. Zie Samenvatting.
- De uitgevinkte knop blijft ook weg als hij aan staat: er is dan op deze kaart
  geen knop om hem uit te zetten, dat kan in het paneel van de coach. Dat stond zo
  in de vraag.

## git status --porcelain

Leeg na de commit van deze ronde.
