# Een regel uit `stand` kan terug in `opslaan` (0.104.1)

3 november 2026, tak `fase-152/stand-terug-opslaan`. Gemeld door de beheersessie van de eigenaar. Die zette drie vakantieregels om naar
één regel met onderdelen. Ze haalde de regel daarvoor uit `automatisering/stand` en stuurde hem terug naar `automatisering/opslaan`.
Dat gaf `invalid_format`: "extra keys not allowed @ data['regel']['actief']". Zonder `actief` ging het goed.

## Samenvatting

- **`opslaan` neemt `actief` aan.** Elke andere sleutel uit `stand` nam hij al aan, dus een regel kan nu ongewijzigd terug.
- **Staat `actief` erin, dan geldt die waarde**, net als bij `automatisering/actief`. Het veld negeren zou betekenen dat `actief: false`
  stil niets doet.
- **Zonder `actief` blijft de regel zoals hij stond**, en een nieuwe regel staat aan. Zo stuurt de kaart het altijd, en daar verandert
  niets aan.

## Gemeten

**De proeven:** 2 nieuwe in `tests/automatisering/test_onderdelen.py`.

| | op deze tak | op 0.104.0 |
|---|---|---|
| `test_een_regel_uit_stand_kan_ongewijzigd_terug` | groen | rood: "extra keys not allowed @ data['regel']['actief']" |
| `test_actief_in_opslaan_telt` | groen | rood: dezelfde fout |
| alles | 1086 Python, 2285 JS, allemaal groen | |

**In de testinstance**, als gewone gebruiker (Receptie), over de websocket. Er zijn twee proefregels gemaakt: "Proef delen" met twee
onderdelen, en "Proef plat" die uit staat. Beide kwamen uit `stand` ongewijzigd terug in `opslaan`, met `success` en geen fout. De
stand erna was gelijk aan die ervoor. Daarna zijn ze weggehaald; er staan nu 0 regels.

## Wat niet lukte

Niets.

## Aannames

- Wie `actief` meestuurt, bedoelt die waarde. De kaart stuurt het veld niet mee.

## git status --porcelain

```
(schoon na de commit)
```
