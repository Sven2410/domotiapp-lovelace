# Muziek op de automatiseringskaart (0.101.0)

2 november 2026, tak `fase-148/muziek-automatisering`. Via de beheersessie van de eigenaar zelf, en daarna van hem rechtstreeks, op de
vraag wat hij in de mediakaart miste: *"ik bedoeldeee de optie dat de klant in de automatisering kaart ook media kan afspelen. Nu heb je
verlichting en rolluiken als het goed is maar ik wil ook media er bij als dat kan snap je me?"*. En eerder: *"Bouw het maar op music
assistant dat werkt met de wekker ook al."*

## Samenvatting

**Speakers van Music Assistant zijn de derde soort op de automatiseringskaart**, naast lampen en rolluiken. Ze werken net zo:

| Waar | Wat |
|---|---|
| de editor | een veld *Speakers die de klant kan kiezen*, alleen spelers van Music Assistant, met een eigen naam per speaker |
| een regel | de klant kiest speakers en zoekt in Music Assistant wat er speelt (een afspeellijst, een zender of een nummer), met een volume. Aan is afspelen, uit is stoppen |
| een favoriet | Afspelen (met wat en hoe hard) of Stoppen, en een vinkje **Muziek uit** voor bijvoorbeeld Woning verlaten |
| de kaart | "Afspelen om 07:00 · stoppen om 08:00 · Ochtend · Werkdagen", met een muzieknootje in plaats van een lamp |
| de server | toetst de speakers zoals de lampen (alleen wat op een kaart staat), zet eerst het volume en speelt dan af via `music_assistant.play_media`, dezelfde dienst als het zoekscherm van de mediakaart |

Lampen, rolluiken en speakers mogen in één regel: om 07:00 de keukenlamp op 60% en de radio op 25%.

**Drie keuzes die ik zelf maakte:**

- **Gemiste muziek begint niet alsnog.** Een lamp die om 07:00 aan moest, gaat na een herstart om half acht alsnog aan. Muziek niet,
  als hij meer dan vijf minuten te laat is: een wekkerlijst die om half tien ineens begint, is erger dan stilte. Stoppen wordt wel
  ingehaald.
- **Eén ding per regel, voor alle speakers samen, met één volume.** Ze spelen hetzelfde, maar niet gekoppeld: koppelen kan alleen
  tussen spelers van hetzelfde merk, en een regel die halverwege mislukt omdat het er twee zijn, is erger.
- **Het voorbeeld laat de speakers met rust.** Wat er speelde, is daarna niet terug te zetten.

## Gemeten

In de testinstance, met een nagebootste Music Assistant (twee spelers, zoeken en `play_media`, niet in git; zie `CLAUDE.md`,
Testmateriaal). Als gewone gebruiker (Receptie), met echte kliks en toetsen. `isTrusted` is `true` op alle kliks en op beide spaties
(in "ochtend v" en in "Muziek ochtend"). Bundel in de pagina gelijk aan schijf (`a5e443d06ecd`, en na de luidspreker bij het volume
`63bd27075ab4`). Geen fouten in de pagina.

**Een regel, op een laptop:**

| Stap | Uitkomst |
|---|---|
| plusje | kop "Lampen, rolluiken en speakers", met de speakers Keuken en Badkamer in de lijst |
| Keuken gekozen | blok Muziek met zoekveld en volume 25%. De koppen worden Afspelen en Stoppen. Opslaan kan niet: "Kies wat er moet spelen." Geen knop Voorbeeld |
| "ochtend v" getypt | één treffer: Ochtend vrolijk |
| gekozen | hoes, naam en Afspeellijst, met Wijzigen. Opslaan kan |
| volume vijf tikken omhoog | 30% |
| aan om 22:10, geen uit, opgeslagen | op de server: `helderheden {keuken: 30}`, `media` met de uri `library://playlist/13` |
| de rij op de kaart | "Afspelen om 22:10 · Ochtend vrolijk · Elke dag" |
| om 22:10, zonder iets te doen | Keuken speelt `library://playlist/13` op 0,3. Badkamer is niet aangeraakt |

**Twee favorieten**, op een laptop (1366) en een telefoon (390, aanraking):

| | Laptop | Telefoon |
|---|---|---|
| vinkjes | Alle lampen uit, Rolluiken dicht, Rolluiken open, Muziek uit | hetzelfde |
| "diner": Badkamer, Diner jazz, tik halverwege de schuif | 51%, Badkamer speelt `playlist/14` op 0,51 | hetzelfde |
| "stil": vinkje Muziek uit ("2 speakers") | beide speakers 0, geen `media`; na de tik staan ze allebei stil | hetzelfde |
| breedte | vak 363-1003, niets steekt uit | vak 16-374, gekozen 31-359, schuif 101-359, `scrollWidth` 390 |

Beide favorieten zijn daarna weer verwijderd, net als de proefregel.

**Proeven.**

- Python: 13 nieuwe in `tests/automatisering/test_speakers.py`. Op 0.100.2 falen er 9, omdat die server een speaker weigert. Er slagen
  er 3 op 0.100.2: de REGRESSIEWACHT, plus twee die daar alleen slagen omdat die versie speakers helemaal niet kent. Dat staat bij
  die twee in de docstring.
- JS: 17 nieuwe in `tests/js/automatisering-speakers.test.mjs`. Op 0.100.2 falen er 14; de 3 die slagen zijn REGRESSIEWACHT.
- Alles: JS 2256 en Python 1038 groen, plus `verify`, `check:registratie`, `check:css`, `check:controls` en `check:taal`.

## Wat niet lukte

- **Niet met een echte Music Assistant gemeten.** De nep doet `search` en `play_media` zoals de echte (dezelfde dienstnamen en
  velden als het zoekscherm van de mediakaart, dat bij de eigenaar thuis werkt), maar dat een echte speler op `volume_set` en daarna
  `play_media` met `enqueue: replace` goed reageert, zie ik pas bij hem.
- **Op de kaart staat bij een speaker geen lijst favorieten om uit te kiezen**, alleen zoeken. De bibliotheek gaat via de client van
  de echte integratie, en die is niet na te bootsen. Zoeken vindt ook wat in de bibliotheek staat.

## Aannames

- "Media" is muziek, radio en podcasts via Music Assistant, op de speakers die de beheerder op de kaart zet. Een tv of een Apple TV
  staat er niet bij; de editor biedt alleen spelers van Music Assistant aan.
- Uit is stoppen (`media_stop`), niet pauzeren of de speaker uitzetten.
- Een regel zonder `media`, op een speaker die erbij kwam nadat hij gemaakt is, speelt verder waar hij was (`media_play`). Het scherm
  laat zo'n regel niet opslaan zonder keuze.

## git status --porcelain

Leeg na de commit.
