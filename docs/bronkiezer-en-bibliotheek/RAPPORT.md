# Rapport — de bronkiezer en de Music Assistant-bibliotheek

Branch `fase-21/bronkiezer-en-ma-bibliotheek`, 20 augustus 2026, avond.

Twee opdrachten:

1. **Een zender kiezen op de mediakaart.** Het Ziggo-kastje van opa en oma stond
   op het dashboard, en om van zender te wisselen moest je op de hoes tikken, de
   meer-info-dialoog van Home Assistant openen en daar het uitklapmenu "Bron"
   zoeken. De geluidsbalk mocht ingekort worden om ruimte te maken.
2. **Een Spotify-achtige omgeving in de mediakaart**: favorieten en
   afspeellijsten die je zelf kunt maken, vullen en weggooien.

---

## 0. Wat er van de productie-HA gelezen is

Op verzoek, en alleen lezend. `CLAUDE.md` verbood dat ("ook niet gelezen"); die
regel is in deze ronde versoepeld tot **lezen mag als de eigenaar erom vraagt,
schrijven nooit** — met zijn instemming.

Uitgelezen over de websocket: het dashboard `domotiapp-cards` en de staat van
`media_player.opaenoma`. Geen enkele service aangeroepen.

**`supported_features: 154547`** ontleed:

| Bit | Kenmerk |
|---|---|
| 1, 2 | PAUSE, SEEK |
| 16, 32 | PREVIOUS_TRACK, NEXT_TRACK |
| 128, 256 | TURN_ON, TURN_OFF |
| 512 | PLAY_MEDIA |
| **2048** | **SELECT_SOURCE** |
| 4096, 16384 | STOP, PLAY |
| 131072 | BROWSE_MEDIA |

Het kastje kan dus **geen volume** — dat is de reden dat er op zijn kaart
`volume_entity: media_player.arc_woonkamer_1e` staat: de Sonos Arc levert het
geluid. Dát is de "geluidsbalk" die ingekort mocht worden.

Het levert **233 bronnen**: tv-zenders, radiozenders én apps (Netflix, Disney+,
Viaplay). Dat aantal bepaalt het ontwerp.

---

## 1. De bronkiezer

`src/media/bronkiezer.js`: een scherm over de volle breedte met een zoekveld,
één kolom met grote regels, en de zender die nu aanstaat bovenaan met een
"NU"-markering.

**Geen uitklapmenu.** Met 233 bronnen is een `<select>` een lijst waar je
doorheen scrollt tot je iets herkent. Met een zoekveld typ je "npo ra" en houd
je er één over.

**Geen raster met hoesjes** zoals het zoekscherm van Music Assistant: een zender
heeft geen hoes, en dan is een raster van lege vakjes erger dan een lijst.

Op de kaart staat de knop **op de volumeregel**, met de naam van de zender erop.
Gemeten in de werkbank: de geluidsbalk krimpt naar 185px, de knop is 78px. Heeft
een speler geen volume-entiteit maar wél bronnen, dan draagt die regel alleen de
bronknop. Kan de speler geen bron kiezen, dan verschijnt hij niet.

Instelling: *Bronknop tonen* (`show_source`), standaard aan.

---

## 2. De bibliotheek van Music Assistant

### Waarom dit niet met de zes MA-acties kon

De HA-integratie van Music Assistant heeft precies zes acties: `get_library`,
`get_queue`, `play_announcement`, `play_media`, `search`, `transfer_queue`. Geen
daarvan maakt een favoriet, laat staan een afspeellijst. Beheren zit alleen in de
eigen API van de MA-server.

**Rechtstreeks verbinden kan niet meer.** Uitgeprobeerd tegen zijn server
(2.9.13, schema 31) op `192.168.1.88:8095`:

```
music/tracks/library_items  ->  {"error_code": 20,
   "details": "Authentication required. Please send auth command first."}
```

Dan zou elke klant een token moeten aanmaken en beheren.

**Home Assistant heeft die verbinding al.** In
`homeassistant/components/music_assistant/__init__.py` staat
`entry.runtime_data = MusicAssistantEntryData(mass, listen_task)`, en `mass` is
een ingelogde `MusicAssistantClient`. Die lenen we.

Gecontroleerd in de HA-container welke methoden de meegeleverde client
(1.4.3) heeft — niet aangenomen maar opgevraagd:

```
add_item_to_favorites        JA      create_playlist          JA
remove_item_from_favorites   JA      remove_playlist          JA
add_playlist_tracks          JA      get_library_playlists    JA
remove_playlist_tracks       JA      get_playlist_tracks      JA
```

**Het risico staat in de code benoemd**: `runtime_data` is een veld van HA zelf.
`ma.client()` haalt het met `getattr` op en geeft `MANietBeschikbaar` als het er
niet is, zodat de kaart een leesbare melding toont in plaats van een
`AttributeError` diep in een scherm. Daar staan drie tests op.

### Wat erin zit

Zeven WebSocket-commando's: `media/library`, `media/favorite`,
`media/playlist/create`, `/remove`, `/tracks`, `/add_tracks`, `/remove_tracks`.

Op het scherm drie tabbladen: **Zoeken · Favorieten · Afspeellijsten**.

- Favorieten per soort (afspeellijsten, radio, nummers, albums, artiesten).
- Een hartje op elke regel, ook op zoekresultaten.
- Afspeellijsten maken, openen, nummers eruit halen, en de lijst weggooien
  (twee keer tikken om te bevestigen — geen dialoog, die staat op een tablet in
  kioskmodus achter het scherm).
- Via vasthouden: "Favoriet maken" en "Aan afspeellijst toevoegen".

**Twee vormen van een favoriet**, en dat is de eis van MA: aanzetten gaat op
**uri**, uitzetten op **bibliotheeknummer plus soort**. Dat staat in één functie
(`favorietBericht`) met zes tests eronder, in plaats van verspreid over een
klikafhandelaar.

---

## 3. Twee bugs die het meten opleverde

**1. Het zoekveld was niet meer het eerste `input`-element.** Het naamveld van
een nieuwe afspeellijst staat er in de DOM vóór, en `this.$("input")` pakte
voortaan dát veld. Gevolg: typen in het naamveld vuurde zoekopdrachten af, en de
focus bij het openen landde op het verkeerde veld. Alle drie de plekken gebruiken
nu `.zoek input`.

**2. `teken_()` hing bij elke hertekening een klikluisteraar bij.** Na twee
hertekeningen verwijderde één tik op het kruisje **twee** nummers uit een
afspeellijst. Dat is exact de val die in dit project al eerder tijd heeft gekost
(zie de regel over `wire()` in `base.js`). De luisteraars staan nu in `bouw_()`,
één keer.

Beide zijn gevonden door te meten, niet door te lezen.

Daarnaast twee kleinere: de bronkiezer focuste zijn zoekveld vóórdat
`toonBronkiezer` de focus naar de host verplaatste (toetsen kwamen aan maar
landden in de body), en `[hidden]` verloor het van `display: flex`, waardoor de
zoekbalk op het favorietenblad bleef staan.

---

## 4. Meting met echte kliks

Werkbank op een lokale server, Chrome vooraan (`visibilityState: "visible"`).
Alle `isTrusted`-waarden uitgelezen via een capture-listener op `window`.

| Handeling | `isTrusted` | Gevolg |
|---|---|---|
| Klik op de bronknop | true | scherm opent, 27 bronnen, "RTL 4" bovenaan met NU |
| Typen "npo ra" (mét spatie) | true | "1 van 27", alleen NPO Radio 2 |
| Klik op die zender | true | `media_player.select_source` met `source: "NPO Radio 2"`, scherm dicht |
| Klik op tab Favorieten | true | zoekbalk verdwijnt, soortknoppen worden bibliotheeksoorten |
| Klik op soort Radio | true | `media/library` met `kind: radio, favorite: true` |
| Klik op het hartje | true | `media/favorite` met `favorite:false, kind:"radio", library_item_id:"11"`; item verdwijnt; **geen muziek gestart** |
| Typen "Zondag ochtend" + Enter | true | `media/playlist/create`, lijst verschijnt in het overzicht |
| Klik op een afspeellijst | true | kop wordt "Ochtend", twee nummers met een kruisje |
| Klik op een kruisje, ná twee extra hertekeningen | true | **precies één** nummer weg ("Says"), "Re" blijft |

Console leeg bij alles.

De werkbank kreeg er een kleine Music Assistant bij: favorieten en
afspeellijsten met échte staat, zodat een hartje dat je zet ook werkelijk in het
favorietenblad verschijnt. Een vast lijstje zou alleen toetsen of er íets
getekend wordt.

---

## 5. Tests

- `tests/js/bibliotheek.test.mjs` — 12 beweringen, vooral op de twee vormen van
  een favoriet en op `soortVan` (MA praat enkelvoud, onze commando's meervoud,
  en `radio` is de uitzondering die maakt dat er een tabel staat en geen `+ "s"`).
- `tests/js/media-extra.test.mjs` — 7 erbij op `bronVoor`, met
  `supported_features: 154547` en het echte gedrag van het kastje erin.
- `tests/media/test_bibliotheek.py` — 18 stuks, waaronder drie op de geleende
  client (geen MA, hernoemd `runtime_data`, client zonder `music`) en één die
  vastlegt dat `favorite: false` "alles" betekent en niet "alleen
  niet-favorieten".

Totaal: **325 JS-tests, 512 Python-tests**, alle groen.

---

## 6. Wat niet gelukt is

**Niet getest tegen de echte Music Assistant.** De eigenaar wilde dat wel, maar
het kan nog niet: de nieuwe commando's zitten in ónze integratie, en op zijn HA
draait 0.6.1 zonder die commando's. Volgorde wordt: releasen, installeren, dan
meten.

**Twee handelingen niet met echte kliks gemeten**: een afspeellijst weggooien
(de twee-tikken-bevestiging) en "Aan afspeellijst toevoegen" uit het
vasthoudmenu. De commando's erachter zijn wel afgedekt met Python-tests; het
klikbewijs ontbreekt.

**De grote mediakaart (`layout: groot`) is niet opnieuw gemeten** na deze
wijzigingen.

---

## 7. Aannames

- **De bronknop staat op de volumeregel**, ook als er geen volume is. Dat is wat
  de eigenaar vroeg ("de geluidsbalk mag ingekort worden om ruimte te maken");
  het alternatief — een eigen regel — zou de kaart een rasterrij hoger maken.
- **Een nieuwe afspeellijst krijgt geen provider mee**, zodat MA hem in zijn
  eigen bibliotheek zet. Dat is waar een lijst hoort die je hier maakt.
- **Lijsten die niet bewerkbaar zijn** (Spotify) mag je wel zien en afspelen,
  maar de prullenbak verschijnt er niet bij.
- **Het hartje verschijnt niet in een geopende afspeellijst.** Daar is het
  kruisje de handeling die je wilt, en twee knoppen naast elkaar op een regel
  van 52px is er een te veel.

---

## 8. `git status --porcelain`

```
(leeg)
```
