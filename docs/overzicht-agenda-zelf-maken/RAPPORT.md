# 0.117.0: de agenda op het overzicht, en daar zelf een afspraak of agenda maken

De eigenaar, 9 november 2026, over de overzichtskaart op zijn eigen dashboard (doorgegeven door de beheersessie):
"Zie jij op mijn ontwikkeldashbaord de agenda op de nieuwe overzicht kaart? (...) En ik kan niet zelf een agenda maken
hoe kan dat?"

## Wat er aan de hand was

- **De agenda.** De kaart kijkt standaard een week vooruit. Die week stond er bij hem niets in: de eerstvolgende afspraak
  was op 17 december. Een regel staat er alleen als er iets te melden is, dus kwam er helemaal niets, en dat las als een
  agenda die het niet doet. De beheersessie had dat al nagelezen: de Google-agenda gaf van 9 tot 17 november een lege lijst.
- **Zelf maken.** Afspraken maken en agenda's toevoegen kon alleen op de agendakaart, en die staat niet op dat dashboard.
  De overzichtskaart kon alleen een afspraak openen.

De derde vraag, "Woning verlaten" en "Alles uit" die nog op het overzicht staan, gaat over favorieten in zijn installatie.
De kaart toont wat er staat. Dat pakt de beheersessie op.

## Wat er veranderd is

- **Een lege week toont de eerstvolgende afspraak**, tot twee maanden vooruit (`afsprakenOpKaart`), bijvoorbeeld
  "Kerstborrel · do 17 dec" met de begintijd erachter. Daarvoor haalt de kaart de agenda's nu 60 dagen vooruit op. Wat er in de week wel staat,
  blijft zoals het was.
- **Onder de regels staan twee knoppen, dezelfde als op de agendakaart:** "Agenda's" (welke er zijn, wat ze kunnen,
  toevoegen en weghalen) en "+ Afspraak". Ze openen hetzelfde scherm. Is er nog geen agenda om in te schrijven, dan opent
  "+ Afspraak" eerst Agenda toevoegen.
- **Editor:** "Agenda's toevoegen" (`agenda_toevoegen`, standaard aan). Uit betekent: geen agenda toevoegen of weghalen,
  en "+ Afspraak" alleen als een agenda op de kaart dat kan. De knoppen staan er niet als de kaart geen agenda heeft en
  toevoegen uit staat.
- **Server:** een gewone gebruiker mag een agenda toevoegen als er een agendakaart staat met toevoegen aan, of nu ook een
  overzichtskaart met `agenda_toevoegen` aan (`async_mag` in `agenda.py`).

## Gemeten

**Unittests (NIEUW GEDRAG).**

- `tests/js/overzicht-logica.test.mjs`, "een lege week: de eerstvolgende afspraak daarna, tot twee maanden vooruit". Op
  0.116.0 faalt hij bij het importeren:
  `does not provide an export named 'AGENDA_VOORUIT'`.
- `tests/test_agenda.py`, "een gewone gebruiker mag het ook vanaf de overzichtskaart". Op 0.116.0:
  `ImportError: cannot import name 'OVERZICHT_TYPE'`.

**Testinstance** (Playwright, view `overzicht`). De bundel die geladen was, was die op schijf (`6d1ffdeaace3`). Alle 23
kliks en toetsaanslagen waren `isTrusted: true`, met 2 spaties getypt in de titel. De kaart stond tijdelijk zonder agenda
in de editor en alleen op vandaag, zodat alleen de toegevoegde agenda's meetelden (Werk Bram, Feestdagen NL). Na afloop is
de config teruggezet.

| stap | uitkomst |
|---|---|
| lege dag | regel "Sinterklaasavond · za 5 dec", knoppen Agenda's en Afspraak rechtsonder (16 px van de rand, zoals de regels) |
| Agenda's | het scherm Agenda's: Werk Bram "lezen en schrijven", Feestdagen NL "alleen lezen", beide met Weghalen, en Agenda toevoegen |
| + Afspraak, getypt "Etentje bij Tom" | formulier in Werk Bram, opgeslagen; op de kaart "Etentje bij Tom · 16:00" in plaats van Sinterklaasavond |
| tik op de afspraak, Verwijderen, de vraag | weg; Sinterklaasavond staat er weer |
| telefoon (390), licht | knoppen onder de regels, rechts, in het vlak |

De kaart bleef op het raster (440, op de telefoon 504). Geen fouten in de console.

JS-tests 2366 groen, Python 1121 groen, alle bewakers groen.

## Samenvatting

Staat er deze week niets in de agenda, dan toont het overzicht de eerstvolgende afspraak. Op het overzicht kan de klant nu
zelf een afspraak maken en een agenda toevoegen (nieuw, Google of Apple), met dezelfde knoppen en hetzelfde scherm als de
agendakaart. In de editor is dat toevoegen uit te zetten.

## Wat niet lukte

- Niet op zijn eigen dashboard nagemeten; dat mag alleen gelezen worden. Daar zou het "Kerstborrel" moeten worden.
- Een gewone gebruiker is getoetst in de Python-test, niet in de browser.

## Aannames

- Twee maanden vooruit is genoeg voor "de eerstvolgende"; daarna staat er niets.
- Toevoegen staat standaard aan, net als op de agendakaart: de eigenaar wil dat de klant het zelf kan.

## git status --porcelain

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/agenda.py
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/overzicht-card.js
 M src/cards/overzicht-logica.js
 M src/i18n/en/overzicht.js
 M tests/js/overzicht-logica.test.mjs
 M tests/test_agenda.py
?? docs/overzicht-agenda-zelf-maken/
```
