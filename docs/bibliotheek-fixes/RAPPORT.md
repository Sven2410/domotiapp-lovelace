# Rapport — de twee meldingen over de bibliotheek

Branch `fase-22/bibliotheek-fixes`, 20 augustus 2026, laat.

De eigenaar installeerde 0.7.0 en meldde twee dingen:

1. "Ik kan geen nummers toevoegen aan een afspeellijst."
2. "Als ik een nummer als favoriet maak dan speelt hij gelijk af."

Hij gaf toestemming om zijn eigen Home Assistant te bedienen om het te testen,
met als voorwaarde: alleen `One SL Sven` als speaker en niet te hard. **Er is
niets afgespeeld** — geen enkele meting hier had geluid nodig.

---

## 1. Wat er op zijn installatie gemeten is

Alle commando's rechtstreeks over de WebSocket aangeroepen, tegen zijn eigen HA
(0.7.0, geladen) en zijn Music Assistant (2.9.13).

| Commando | Uitkomst |
|---|---|
| `media/library` (playlists) | **werkt** — 39 lijsten, met `is_editable` per stuk |
| `media/library` (tracks) | **werkt** |
| `media/favorite` aan en uit | **werkt**, met controle dat het nummer daarna écht in de favorieten stond |
| `media/playlist/create` | **werkt** |
| `media/playlist/add_tracks` | **werkt**, maar niet meteen zichtbaar |
| `media/playlist/remove_tracks` | **werkt**, maar niet meteen zichtbaar |
| `media/playlist/remove` | **faalt**: `InsufficientPermissions: Admin access required` |

---

## 2. Drie oorzaken, geen ervan wat het leek

### a. Toevoegen wérkte — je zag het alleen niet

Twee dingen bij elkaar, allebei in Music Assistant zelf:

- `add_playlist_tracks` **zet een achtergrondtaak klaar** en antwoordt meteen.
  De client zegt het letterlijk: *"Creates background tasks to process the
  action."* Er komt geen bevestiging dat het gelukt is.
- `get_playlist_tracks` **cachet**, en heeft daar een `force_refresh` voor die
  wij niet meegaven.

Gemeten op zijn installatie: drie nummers toegevoegd aan een verse testlijst,
direct daarna **0 nummers** in de lijst, even later **alle drie**:

```
3. Toevoegen      -> {'added': 3}
4. Terugkijken    -> 0 nummers
   (later)        -> @1 '20 Seconds'  @2 '9/11'  @3 'Airplane Mode'
```

Hetzelfde bij verwijderen: `remove_tracks` gaf 3 → 2, maar pas na een paar
seconden.

**Opgelost met drie dingen.** `force_refresh=True` bij het ophalen; een zichtbare
melding ("… toegevoegd aan …") in plaats van niets; en na een wijziging wordt de
lijst opnieuw opgehaald na 0,9 en nog eens na 2,5 seconde.

### b. Het hartje startte de muziek

`stopPropagation()` houdt alleen de **ouders** tegen. `bindActions` hangt zijn
click-luisteraar aan **hetzelfde element** als de handler van het hartje, en
daar doet `stopPropagation` niets tegen — dat vraagt
`stopImmediatePropagation()`.

Dat de handler van het hartje als eerste geregistreerd staat (in `bouw_()`, vóór
`teken_()`) is wat hem de kans geeft de andere te stoppen.

**Mijn verificatie hiervan was vorige ronde fout.** Ik controleerde
`window.__diensten?.some?.(...)` op een variabele die op die pagina niet bestond;
`!undefined` is `true`, dus las de meting als "geen muziek gestart" terwijl er
niets gemeten werd. Nu gemeten op het scherm zelf: **nul service-aanroepen** bij
een echte klik op het hartje.

### c. Een afspeellijst verwijderen kan niet, en dat is geen bug van ons

```
music_assistant_models.errors.InsufficientPermissions: Admin access required
```

Music Assistant laat `music/playlists/remove` alleen aan een **beheerder** toe,
en de verbinding die Home Assistant heeft is dat niet. Dat kwam als "Unknown
error" op het scherm.

Dat is nu een leesbare melding: *"Music Assistant staat dit alleen toe aan een
beheerder. Verwijderen van een afspeellijst kan daarom niet vanaf de kaart; dat
gaat via Music Assistant zelf."* De knop blijft staan — een knop die stilletjes
verdwijnt laat niemand weten waarom iets niet kan.

En **elke** onbekende fout uit MA wordt nu een leesbare melding in plaats van
"Unknown error"; de oorspronkelijke tekst gaat mee voor in het logboek.

---

## 3. Nog een vondst: posities beginnen bij 1

Uitgelezen op zijn lijst van twaalf nummers: de posities zijn **1 tot en met
12**. Onze terugval telde vanaf 0. Dat is nooit misgegaan omdat MA zelf altijd
een positie meestuurt, maar zodra hij dat niet doet, haalt een tik op het
kruisje het nummer erbóven weg.

---

## 4. Wat ik op zijn installatie heb aangeraakt

Volledig verantwoord, want het is zijn productiesysteem:

- **Afspeellijst `🤠` (id 13):** één nummer toegevoegd en daarna één positie
  verwijderd. Netto **geen verandering** — nagekeken: de lijst heeft nog steeds
  dezelfde twaalf nummers, met 'One More' op plek 12. Dit was een **fout van
  mij**: ik ruimde op via "de laatste positie" in plaats van het nummer dat ik
  had toegevoegd. Dat het goed afliep is geluk geweest, niet zorgvuldigheid.
- **Een eigen testlijst** "DomotiApp test (mag weg)" gemaakt, gevuld en een
  nummer eruit gehaald. **Die staat er nog** (id 40, met 2 nummers), want
  verwijderen mag niet. Weg te gooien in Music Assistant zelf.
- **Eén nummer favoriet gemaakt en meteen weer afgevinkt** ('20 Seconds'), met
  controle ertussen.
- Niets afgespeeld, geen volume aangeraakt, geen speaker benaderd.

---

## 5. Tests

Vier erbij in `tests/media/test_bibliotheek.py`, elk op een van de gevonden
oorzaken:

- `force_refresh=True` wordt meegegeven bij het ophalen van de nummers;
- posities beginnen bij 1;
- `InsufficientPermissions` wordt een melding met het woord "beheerder" en
  nadrukkelijk niet "Unknown error";
- een onbekende fout komt met zijn eigen tekst door in plaats van te ontsnappen.

**325 JS-tests, 516 Python-tests**, alle groen.

---

## 6. Wat niet gelukt is

**De schermkant is alleen op de werkbank gemeten**, niet op zijn HA — daar draait
0.7.0 en deze fixes zitten in 0.7.1. De serverkant is wél op zijn echte Music
Assistant gemeten, want die commando's zaten al in 0.7.0.

**Het weggooien van een afspeellijst blijft onmogelijk** zolang de verbinding van
Home Assistant geen beheerrechten heeft in Music Assistant. Of dat te veranderen
is, is niet uitgezocht.

---

## 7. Aannames

- **De knop om een lijst te verwijderen blijft staan**, met een melding die
  uitlegt waarom het niet kan. Weghalen zou de vraag "waar is die knop?"
  opleveren in plaats van een antwoord.
- **Na een wijziging wordt twee keer opnieuw opgehaald** (0,9 en 2,5 seconde).
  Die getallen komen uit de meting op zijn installatie, waar het een paar
  seconden duurde. Duurt het langer, dan ververst opnieuw openen de lijst.

---

## 8. `git status --porcelain`

```
(leeg)
```
