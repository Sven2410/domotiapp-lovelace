# 0.56.0 — De integratie levert de achtergrond van het dashboard mee

## De vraag

7 oktober 2026, via de beheersessie, op verzoek van de eigenaar: de
standaardafbeeldingen van het DomotiApp-dashboard moesten bij elke klant met de
hand in `/config/www`. De integratie moet ze zelf leveren, net als de bundel, op
een vast adres, zodat elke klant ze lokaal heeft, ook zonder internet.

Gevraagd waren zes bestanden: de achtergrond van de eigenaar en vijf logo's
(Eredivisie, Premier League, Bundesliga, La Liga, Formule 1). Met de opmerking
erbij: de repo is publiek, en de logo's zijn merken van de bonden en van F1;
lever die niet zonder overleg mee, maar in elk geval de achtergrond.

**Deze ronde levert alleen de achtergrond.** De logo's liggen bij de eigenaar;
zie *Wat niet lukte*.

## Wat er veranderd is

| | |
|---|---|
| de map | `custom_components/domotiapp_lovelace/afbeeldingen/` |
| het adres | `/domotiapp_lovelace/afbeeldingen/` |
| het bestand | `achtergrond.png`, 1920x1080, 10.642 bytes, byte voor byte de achtergrond van de eigenaar (sha256 begint met `6d0cdc85735fe6fd`; geen tekst in de metadata) |
| in een dashboard | `background: { image: /domotiapp_lovelace/afbeeldingen/achtergrond.png }` op een view |

In `__init__.py` staat de map als tweede `StaticPathConfig` naast de bundel,
onder dezelfde bewaking tegen dubbel registreren.

**Zonder cacheheaders, met opzet.** Met `cache_headers=True` zet Home Assistant
`Cache-Control: public, max-age=2678400` (31 dagen). Voor de bundel is dat
goed, want die krijgt bij elke wijziging een nieuwe `?v=`. Deze adressen staan
vast in dashboards van klanten, dus een vervangen afbeelding zou een maand de
oude blijven. Nu stuurt de server een ETag en een Last-Modified, en vraagt de
browser of zijn kopie nog klopt.

**De adressen zijn een belofte.** `VASTE_NAMEN` in `tests/test_afbeeldingen.py`
noemt elke naam die in een dashboard kan staan; een hernoemd of verdwenen
bestand laat die test vallen. Ook in `const.py` en `CLAUDE.md`.

## Bewijs

### De nieuwe toetsen falen op de oude code

`tests/test_afbeeldingen.py` tegen de code van vóór deze ronde (geen map, geen
constante, geen route):

```
PASSED tests/test_afbeeldingen.py::test_regressiewacht_de_map_toont_geen_inhoud
PASSED tests/test_afbeeldingen.py::test_regressiewacht_niet_buiten_de_map
FAILED tests/test_afbeeldingen.py::test_het_adres_staat_vast - AssertionError...
FAILED tests/test_afbeeldingen.py::test_de_afbeelding_is_meegeleverd[achtergrond.png]
FAILED tests/test_afbeeldingen.py::test_de_afbeelding_wordt_geserveerd[achtergrond.png]
FAILED tests/test_afbeeldingen.py::test_geen_maand_in_de_browsercache - Asser...

E       AssertionError: assert None == '/domotiapp_lovelace/afbeeldingen'
E       AssertionError: /app/custom_components/domotiapp_lovelace/afbeeldingen/achtergrond.png ontbreekt
E       AssertionError: assert 404 == 200
E       AssertionError: assert (None or None)
4 failed, 2 passed in 1.98s
```

Op de nieuwe code: 6 van 6 groen.

| Toets | Soort |
|---|---|
| het adres staat vast | **NIEUW GEDRAG** |
| de afbeelding is meegeleverd | **NIEUW GEDRAG** |
| de afbeelding wordt geserveerd (zonder token, `image/png`, gelijk aan de repo) | **NIEUW GEDRAG** |
| geen maand in de browsercache | **NIEUW GEDRAG** |
| de map toont geen inhoud | **REGRESSIEWACHT**: zonder map was het ook 404 |
| niet buiten de map | **REGRESSIEWACHT**: idem |

### Op de testinstance, over HTTP

Na `docker restart ha-lovelace` (Python gewijzigd, valkuil 49), zonder token:

```
HTTP/1.1 200 OK
Content-Type: image/png
Etag: "18dc3c33623f4474-2992"
Last-Modified: Wed, 07 Oct 2026 11:35:44 GMT
Content-Length: 10642
(geen Cache-Control)

sha256 opgehaald:  6d0cdc85735fe6fd...
sha256 in de repo: 6d0cdc85735fe6fd...

/domotiapp_lovelace/afbeeldingen                      -> 403
/domotiapp_lovelace/afbeeldingen/                     -> 403
/domotiapp_lovelace/afbeeldingen/..%2Fmanifest.json   -> 400
/domotiapp_lovelace/afbeeldingen/bestaatniet.png      -> 404
```

### In Chrome, als achtergrond van een view

Op de werkbank (`kaart-test/navbalk`) de achtergrond gezet zoals een
beheersessie dat straks doet:

```yaml
background:
  image: /domotiapp_lovelace/afbeeldingen/achtergrond.png
  size: cover
  alignment: center
  repeat: no-repeat
  attachment: fixed
```

Naar die view gegaan met een echte klik op het tabblad
(`isTrusted: true`, pad `slot < div < #document-fragment < ha-tab-group-tab`),
en daarna gemeten wat Home Assistants eigen `hui-view-background` tekent:

```
element           hui-view-background (fixed-background)
background-image  url("/domotiapp_lovelace/afbeeldingen/achtergrond.png")
size              cover
position          50% 50%
repeat            no-repeat
vlak              0,0 1920x911
opgehaald         200, 10642 bytes, initiator css
```

Een losse `<img>` met hetzelfde adres laadde ook: 1920x1080.

Een schermafdruk laat hier niets zien: de achtergrond is net zo bijna-zwart als
de standaardachtergrond van de testinstance. De meting hierboven is het bewijs.

### Tellingen

- JS: 1342 toetsen, alle groen (geen JS gewijzigd; de bundel is opnieuw
  gebouwd voor het versienummer).
- Python: 754 toetsen, alle groen (lokaal in Docker, `python:3.14-slim`).
- `verify`, `check:registratie`, `check:controls`, `check:css`: OK.
- Bundel 898.147 bytes.

## Samenvatting

De integratie serveert nu zelf de achtergrond van het DomotiApp-dashboard op
`/domotiapp_lovelace/afbeeldingen/achtergrond.png`, zonder inloggen, uit de
eigen installatie. Na deze update hoeft die bij geen klant meer in
`/config/www`. Het adres is vast en wordt door een test bewaakt.

## Wat niet lukte

- **De vijf logo's zitten er niet in.** Het zijn merken (en tekeningen) van de
  Eredivisie, de Premier League, de Bundesliga, LaLiga en de Formule 1. Deze
  repo is publiek en HACS deelt hem met iedereen; wat er eenmaal in de
  geschiedenis staat krijg je er niet meer uit. Dat is een beslissing van de
  eigenaar, en die ligt bij hem.
- **De vijf competitiesensoren** (een tweede vraag van de beheersessie, met
  het logo als `entity_picture`) zijn daarom ook nog niet gebouwd: zonder logo
  is er niets om te tonen.
- Het testtabblad stond verborgen; de view bouwde pas na een tweede poging
  (valkuil 66). Niet op een telefoon bekeken, en niet op een installatie van
  een klant.

## Aannames

- Dat `afbeeldingen` als map en `achtergrond.png` als naam goed zijn. De
  beheersessie stelde precies die namen voor.
- Dat de achtergrond geen cacheheaders hoort te hebben. Het kost een kleine
  vraag per pagina (antwoord 304 als hij klopt), en voorkomt een maand oude
  afbeelding na een vervanging.
- Dat de achtergrond van de eigenaar zelf is, zoals de beheersessie zei. Het is
  een effen vlak zonder tekst of metadata.

## git status --porcelain

Vlak voor de commit:

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/__init__.py
 M custom_components/domotiapp_lovelace/const.py
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
?? custom_components/domotiapp_lovelace/afbeeldingen/
?? docs/afbeeldingen-meeleveren/
?? tests/test_afbeeldingen.py
```
