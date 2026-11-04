# Schema, Klaar om en Laden tot per laadpaalkaart uitvinken (0.107.0)

4 november 2026, tak `fase-156/laadpaal-velden-uitvinken`. Een wens van de eigenaar, via de coach-sessie van een klant.
Die klant laadt in de stand zonder accustand, in de goedkope uren, en heeft geen autoprofiel. Daar tellen de klaar-tijd en
het laaddoel niet. Toch stonden "Schedule", "Ready by 14:51" en "Charge to 100%" op de kaart. De eigenaar: "dit heb ik
helemaal niet bij [de klant] dus waarom staat dat wel in lovelace? ... ik wil er niet in hebben dat ik dat kan aanvinken.
alleen nu starten bijvoorbeeld."

## Samenvatting

- **Een tweede keuzelijst in de editor: Instellingen op deze kaart**, met Schema, Klaar om en Laden tot. Ze staat onder
  Knoppen op deze kaart (sinds 0.88.0: Snel, Continu, Zon, Pauze).
- **Uitgevinkt staat het niet op de kaart.**
  - Klaar om neemt de week mee, want die is Klaar om per dag.
  - Klaar om neemt ook de tijd achter "Planning" mee.
  - Het paneel van de coach houdt ze allemaal.
- **Een eigen sleutel `velden`, niet in `knoppen`.** Een kaart die al een knop had uitgevinkt, heeft een lijst `knoppen`
  zonder deze drie. In dezelfde lijst zou die kaart ze dus meteen kwijt zijn. Geen `velden` is alles, en alles aangevinkt
  gaat de YAML niet in (`zonderVolleVelden`), net als bij de knoppen.
- **Voor de klant zelf** betekent dit:
  - Knoppen: alleen Snel. Dat is "nu starten".
  - Instellingen: niets aangevinkt.
  - Wat dan nog staat, is de regel van de modus ("Goedkoopst"). Dat is een stand, geen keuze, en hij klopt daar: de coach
    laadt in de goedkoopste uren.

Of de kaart dit vanzelf kan zien, hangt af van de coach. Aan zijn attributen is het nu niet te zien: hij geeft
`goedkoop_blok` niet door. De coach-sessie vraagt de eigenaar of dat erbij mag. Daarna kan de kaart het vanzelf weglaten.

## Gemeten

**De proeven.** `tests/js/laadpaal-velden-uitvinken.test.mjs`: 6 nieuw (4 NIEUW GEDRAG, 2 REGRESSIEWACHT). Op 0.106.0
falen ze alle 6, omdat de functies er niet zijn.

| | |
|---|---|
| JS | 2304 groen |
| Python | 1094 groen |
| `verify`, `check:taal`, `check:css`, `check:controls`, `check:registratie` | groen |

**In de testinstance**, met Playwright headless, op view `laadpaal-knoppen` met de nagebootste coach. De bundel in de
pagina (`f30154dd2c87`) was gelijk aan die op schijf.

| | Schema | Klaar om | Laden tot | Pauze | regel |
|---|---|---|---|---|---|
| kaart zonder lijst | staat er | staat er | staat er | staat er | "Planning · klaar om 07:30" |
| na het uitvinken | weg | weg | staat er | staat er | "Planning" |

De editor is de echte `ha-form`. Schema en Klaar om zijn met echte kliks uitgevinkt (`isTrusted: true`, op 604 en 644).
De editor gaf daarna `velden: ["laden_tot"]` door. In een eerdere poging klikte de meting per ongeluk op Laden tot. Ook
die ging uit, en ook die viel weg van de kaart.

## Wat niet lukte

- De editor is gemeten met de hand in de pagina gehangen, niet in de dialoog van Home Assistant. De kiezers voor een
  apparaat en een entiteit gaven daar fouten over `localize`, omdat ze buiten de dialoog staan.
- De week (`per_dag`) staat in de nagebootste coach niet aan. Dat hij met Klaar om meegaat, staat alleen in de code.

## Aannames

- "Goedkoopst" blijft staan. Het is geen instelling maar wat de coach doet.
- Klaar om neemt de week en de tijd in de regel mee. Wie de klaar-tijd niet wil, wil hem nergens.

## git status --porcelain

```
(schoon na de commit)
```
