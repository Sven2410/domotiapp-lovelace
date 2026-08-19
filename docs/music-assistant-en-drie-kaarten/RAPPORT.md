# Music Assistant op de mediakaart, en drie nieuwe kaarten

Ronde van 19 augustus 2026. Twee stukken werk in één bundel:

1. **Music Assistant** op de mediaspelerkaart: zoeken over het hele scherm,
   speakers groeperen, en alle knoppen die de speler aankan (shuffle, herhalen).
2. **Drie nieuwe kaarten**: rookmelder, alarmpaneel en weersvoorspelling.

---

## 1. Wat er vooraf is uitgezocht

De vraag was hoe Music Assistant werkt. Uitgelezen in plaats van aangenomen, op
de installatie van de eigenaar zelf (**alleen lezen**: `/api/states`, het label-,
entity-, device- en area-registry, en `/api/services`; geen enkele service
aangeroepen):

| Wat | Bevinding |
|---|---|
| Zoeken | `music_assistant.search` — `config_entry_id`, `name`, `media_type[]`, `limit`; geeft een antwoord terug in zeven emmers |
| Bibliotheek | `music_assistant.get_library` — per soort, met favorieten, paginering en sortering |
| Afspelen | `music_assistant.play_media` — `media_id`, `media_type`, `enqueue` (play/replace/next/replace_next/add), `radio_mode` |
| Groeperen | `media_player.join` / `unjoin` met `group_members` |
| Shuffle en herhalen | `media_player.shuffle_set` en `repeat_set` (off/all/one) |

En over de installatie zelf: **alle acht gelabelde MA-speakers melden
`GROUPING`**, en **geen enkele MA-entiteit heeft `TURN_ON`/`TURN_OFF`** — die zit
alleen op de native entiteiten (`media_player.slaapkamer_sven` van Cast wél,
`media_player.arc_sven` van Sonos niet). Dat is precies wat de eigenaar zei, en
de kaart leest het al per speler uit.

## 2. Wat er gebouwd is

### Serverkant

- **`ma.py`** — alles wat met Music Assistant te maken heeft op één plek: de
  config-entry opzoeken, `search` aanroepen met een time-out van 10 s, en het
  antwoord platslaan. De wekkerkant deed dit al en gebruikt nu hetzelfde
  bestand; wat daar bij blijft is `endless` per treffer, want dat hangt aan de
  providerlijst die alleen de wekker aangaat.
- **`labels.py`** — een labelnaam naar `label_id` naar entiteiten, uitgerold over
  entiteit, apparaat én gebied. Ook door de wekker gebruikt.
- **`media/`** — twee WebSocket-commando's: `media/search` en `media/speakers`.
  Meer niet, met opzet: afspelen, groeperen, shuffle en herhalen zijn gewone
  service-aanroepen op een entiteit, en die doet de kaart zelf. Alleen deze twee
  kunnen dat niet — zoeken vraagt de config-entry, de speakerlijst vraagt de
  registry's.

**Een eigen label: `Music Assistant Media`.** Dat is de keuze van de eigenaar en
hij is niet willekeurig: op de wekker horen alleen de speakers waar je 's ochtends
wakker van wilt worden, op de mediakaart horen ook de tv en de speaker in de gym.
Twee lijsten, twee labels. Bestaat het label niet, dan zegt het zoekscherm welk
label er geplakt moet worden in plaats van een lege balk te tonen.

### De kaart

Een derde regel: **shuffle**, **herhalen** (uit → alles → één, met een eigen
icoon voor "dit nummer"), **zoeken** en **speakers**. Ze staan apart van
vorige/afspelen/volgende omdat je die drie aanraakt terwijl je luistert en deze
vier gebruikt om iets in te stellen of te kiezen. Zoeken en groeperen verschijnen
alleen bij een speler van Music Assistant (`mass_player_type`), groeperen
bovendien alleen als de speler `GROUPING` meldt.

### Het zoekscherm

Vult het hele scherm, hangt aan `document.body` (een `position: fixed` binnen een
dashboardkolom lijnt uit tegen die kolom, niet tegen het scherm). Eén zoekveld,
zes filterknoppen, resultaten met hoesjes, en onderin de gelabelde speakers om
mee te spelen.

- **Tikken speelt meteen af** (`enqueue: replace`) en sluit het scherm — je wilde
  muziek, geen scherm.
- **Vasthouden geeft de keuze**: nu / hierna / achteraan in de wachtrij. Het
  scherm blijft dan open, want daar ben je aan het stapelen.
- Elke zoekopdracht krijgt een nummer; alleen het antwoord op de laatste wordt
  getekend. Een trage provider mag geen oud resultaat over een nieuw heen leggen.

### De drie nieuwe kaarten

- **Rookmelder** (`domotiapp-smoke-card`) — rook, koolmonoxide, warmte,
  temperatuur en batterij, alle vijf optioneel. Eén regel zegt wat er aan de hand
  is, de metingen staan eronder als pillen. De rangorde staat in
  `smoke-logica.js` met eigen tests: rook verslaat een lege batterij, een lege
  batterij verslaat "alles rustig", en alles onbereikbaar is niet hetzelfde als
  rustig. Alleen metingen ingevuld? Dan belooft de kaart niets.
- **Alarmpaneel** (`domotiapp-alarm-panel-card`) — entiteit invullen, drie
  knoppen: Uitgeschakeld, Afwezig, Thuis. De knop van de huidige stand is
  ingedrukt en draagt kleur. Geen code-veld: een pincode op een dashboardkaart is
  een pincode die op tafel ligt.
- **Weersvoorspelling** (`domotiapp-forecast-card`) — weerentiteit invullen, klaar.
  Vandaag groot, de dagen (of uren) erna op een rij met hoge en lage temperatuur
  en neerslagkans. De voorspelling komt via `weather/subscribe_forecast`, want
  sinds HA 2023.9 staat hij niet meer in de attributen. Kan een bron geen
  uurvoorspelling, dan zegt de kaart dat.

**Rood en groen** worden op de rookmelder- en alarmpaneelkaart wél gebruikt. Dat
is de uitzondering waar de regel voor bedoeld is: dit ís status, geen identiteit.
Ze komen nooit alleen — er staat altijd een icoon en een woord bij.

Zeven iconen erbij (`search`, `shuffle`, `repeat`, `repeatOne`, `speakers`, en de
eerdere media-iconen), allemaal op dezelfde 1.6px-lijn en in de icoonkiezer.

---

## 3. Tests

`npm test`: **267 groen** (was 243). Drie nieuwe bestanden, alle drie **NIEUW
GEDRAG** — de code bestond vóór deze ronde niet:

| Bestand | Wat |
|---|---|
| `tests/js/media-extra.test.mjs` | welke knoppen de derde regel krijgt, de rondgang van herhalen, het herkennen van een MA-speler |
| `tests/js/smoke-logica.test.mjs` | de rangorde van de rookmelder, en beide vormen van een batterijsensor |
| `tests/media/test_websocket.py` | `media/speakers` met en zonder label, met een Sonos-entiteit die afvalt, en dat het **wekkerlabel hier niet telt**; `media/search` zonder MA en met een limiet buiten de grenzen |

De Python-tests zijn **niet lokaal gedraaid** (zie §5); CI draait ze bij de PR.

---

## 4. Browsermeting

Werkbank `dev/preview.html` in Chrome. Verse code bewezen:
`fetch(..., {cache:'reload'})` gaf dezelfde sha256 als `npm run build` op schijf
schreef. Elke handeling hieronder is een **echte klik of toets**; `isTrusted` is
per stuk uitgelezen via een capture-listener op `window` die `composedPath()`
leest.

| Handeling | `isTrusted` | Gevolg |
|---|---|---|
| Klik shuffle | true | `media_player.shuffle_set {shuffle:true}`, knop ingedrukt |
| Klik herhalen (2×) | true | `repeat_set` → `all`, daarna → `one`; icoon wordt `repeatOne`, label "Herhalen: dit nummer" |
| Klik zoeken | true | Het scherm opent op de juiste speler |
| Typen "nils frahm" | true (ook de spatie) | Veld houdt de tekst, cursor op 10, vijf treffers met de juiste ondertitels |
| Klik op een treffer | true | `music_assistant.play_media` met `enqueue: replace`, scherm sluit |
| Menu-item "Hierna afspelen" | true | `play_media` met `enqueue: next`, scherm blijft open |
| Klik op een speaker | true | `media_player.join` met `group_members`, chip springt op meespelen |
| Klik op diezelfde speaker | true | `media_player.unjoin` op dát lid — de juiste kant op |
| Escape | true | Scherm sluit |
| Klik "Afwezig" op het alarmpaneel | true | `alarm_control_panel.alarm_arm_away`, status en ingedrukte knop volgen |

**Eén gevonden fout, en hij is gerepareerd.** Escape sloot het scherm niet. De
oorzaak was niet de toets maar de focus: de speakerlijst werd bij elke
toestandswijziging opnieuw getekend, en dan verdwijnt de knop waar de focus op
stond. Escape kwam daarna nooit meer bij het scherm aan. Twee dingen aangepast:
Escape hangt nu aan het document, en de speakerlijst wordt alleen nog hertekend
als er werkelijk iets aan verandert. Daarna opnieuw gemeten: openen met een echte
klik, sluiten met een echte Escape — beide goed.

**Wat de tool niet kon**: ingedrukt houden. Het menu is daarom geopend met een
nagebootste `pointerdown` + `click` van 620 ms; het **menu-item zelf** is met een
echte klik bediend. De hold-herkenning zelf staat in `bindActions` en is in een
eerdere ronde met echte kliks gemeten.

**Gemeten toestanden** (niet op het oog): rookmelder met batterij op 12 % meldt
"Batterij bijna leeg (12%)", met rook aan "Rook gedetecteerd" plus het pulserende
icoon, met alleen rook 56px hoog; alarmpanelen tonen de juiste ingedrukte knop en
"ALARM" bij `triggered`; de weerkaart toont dagen én uren, en meldt netjes
"Deze weerbron geeft geen uurvoorspelling" als de bron dat niet kan.

---

## 5. Wat niet lukte

- **De Python-tests draaien niet op Windows** (HA importeert `fcntl`) en Docker
  Desktop stond uit, dus de nieuwe `tests/media/test_websocket.py` en de
  refactor van de wekkerkant zijn lokaal niet gedraaid. CI doet dat wel, en de
  PR wacht daarop.
- **Niet in een echte Home Assistant gemeten.** De werkbank bootst `hass`,
  `ha-form`, de bevriezing en nu ook `connection.subscribeMessage` na, maar niet
  de sections-layout en niet Music Assistant zelf. Wat er dus nog nagekeken moet
  worden op de installatie: of `music_assistant.play_media` met deze
  `media_id`/`media_type`-combinatie doet wat we verwachten, en hoe de
  zoekresultaten van de échte bibliotheek eruitzien.
- **Bladeren door de bibliotheek zit er niet in.** De eigenaar koos "zoeken over
  alles"; `get_library` is uitgezocht en beschreven, maar niet gebouwd.

## 6. Aannames

- **Het nieuwe label heet `Music Assistant Media`.** De eigenaar koos "een nieuw
  label naast het bestaande" maar noemde geen naam. Dit staat als constante in
  `media/const.py`.
- **Tikken op een treffer sluit het scherm, vasthouden niet.** Dat volgt uit de
  keuze "meteen afspelen, vasthouden voor de keuze".
- **Het zoekscherm hoort bij één speler tegelijk.** Er is er één per pagina; welke
  speler hij bedient wordt bij het openen meegegeven.
- **De rookmelderkaart claimt twee rasterrijen zodra er meer dan één entiteit in
  staat.** De pillenregel schuift horizontaal in plaats van af te breken, zodat
  de inhoud binnen die twee rijen blijft.

## 7. `git status --porcelain`

```
 M README.md
 M custom_components/domotiapp_lovelace/__init__.py
 M custom_components/domotiapp_lovelace/alarm/const.py
 M custom_components/domotiapp_lovelace/alarm/entiteiten.py
 M custom_components/domotiapp_lovelace/alarm/websocket.py
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M dev/preview.html
 M src/cards/media-card.js
 M src/cards/media-logica.js
 M src/editor/icon-picker.js
 M src/icons.js
 M src/index.js
?? custom_components/domotiapp_lovelace/labels.py
?? custom_components/domotiapp_lovelace/ma.py
?? custom_components/domotiapp_lovelace/media/
?? docs/music-assistant-en-drie-kaarten/RAPPORT.md
?? src/cards/alarm-panel-card.js
?? src/cards/forecast-card.js
?? src/cards/smoke-card.js
?? src/cards/smoke-logica.js
?? src/media/
?? tests/js/media-extra.test.mjs
?? tests/js/smoke-logica.test.mjs
?? tests/media/
```
