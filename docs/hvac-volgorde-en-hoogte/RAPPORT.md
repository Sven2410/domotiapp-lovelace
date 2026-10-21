# 0.83.1: de HVAC-kaart, vaste volgorde van de standen en geen lege band

## Aanleiding

Op 21 oktober 2026 meldde de beheersessie van een klant twee dingen op de
HVAC-kaart (soort airco), met acht Daikin-airco's (`daikin_onecta`) onder
elkaar, op 0.83.0:

- **De volgorde van de standknoppen verschilt per airco.** De ene geeft "Off,
  Auto, Dry, Cool, Heat, Fan only", de andere "Off, Fan only, Heat, Cool,
  Auto, Dry". De kaart nam de volgorde van `hvac_modes` over, en die verschilt
  per toestel.
- **Een kaart zonder tegels heeft een lege band boven de kop.**

## Gemeten bij de klant (alleen gelezen, niets aangeklikt)

| Kaart | Hoogte | Kop vanaf de bovenkant | Wat erin staat |
|---|---|---|---|
| zonder tegels (3×) | 248 | 39 | kop 40, standen 32,5, doel 40, ventilator 33 |
| met tegels (3×) | 248 | 12 | idem, plus tegels 47 |

Zonder tegels is de inhoud 145,5 + 3 × 8 (gap) + 2 × 8 (padding) + 2 (rand) =
**187,5**. Dat is 3,5 te veel voor drie rasterrijen (184), dus werd het vier
(248). De inhoud staat dan in het midden, met 39 leeg erboven en eronder.

## Wat er veranderd is

- **De standen staan in de volgorde van Home Assistant** (`HVACMode`): Uit,
  Verwarmen, Koelen, Warm/koud, Auto, Drogen, Ventileren. Een onbekende stand
  komt erachter, in de volgorde van het apparaat. Dat staat in `standen()` in
  `hvac-logica.js`, en de airco-kaart gebruikt dezelfde functie, dus ook daar.
- **Padding en gap van de HVAC-kaart zijn 7 in plaats van 8.** Zonder tegels is
  hij nu 182,5, en dat past op drie rijen. Met tegels blijft hij vier rijen. Een
  kaart met alleen de kop is nu precies één rij (56); met 8 was dat 58, en dus
  twee rijen.

## Bewijs

**Tests.** 2040 JS-tests en 901 Python-tests zijn groen, net als `verify`,
`check:registratie`, `check:controls`, `check:css` en `check:taal`. Nieuw zijn
`tests/js/hvac-hoogte.test.mjs` en een toets in `hvac-logica.test.mjs`; een
bestaande toets volgt de nieuwe volgorde. Tegen `main` (uit `git archive`):

```
✖ kop, standen, doel en ventilator passen op drie rijen
  AssertionError: inhoud 187.5   actual: 248, expected: 184
✖ een climate: de hvac_modes, vertaald
    actual: [ 'Uit', 'Koelen', 'Verwarmen', 'Ventileren' ]
✖ een climate: de standen in de volgorde van Home Assistant, niet van het apparaat
    actual: [ 'off', 'auto', 'dry', 'cool', 'heat', 'fan_only' ]
ℹ pass 41
ℹ fail 3
```

**In Chrome, op de werkbank in het Engels**, met de attributen van de echte
Daikin van de klant. Er stonden twee kaarten in een vak van 440 breed: één met
de `hvac_modes` van de ene airco en één met die van de andere.

| | sha256 van de bundel | Hoogte | Kop op | Knoppen |
|---|---|---|---|---|
| main (eigen poort) | `1e70f5253d8681ab` | 248 en 248 | 39,25 | twee verschillende volgordes |
| 0.83.1 | `c633d92e56910036` (gelijk aan schijf) | 184 en 184 | 8,75 | allebei Off, Heat, Cool, Auto, Dry, Fan only |

Main geeft dus precies wat bij de klant gemeten is. Een echte klik op "Heat"
(`isTrusted=true`) stuurt `climate.set_hvac_mode` met `hvac_mode: "heat"`.
De knop doet dus nog wat erop staat, ook nu de volgorde anders is.

## Wat niet lukte

- **Bij de klant zelf** is 0.83.1 niet gemeten. Dat kan pas als de eigenaar
  heeft bijgewerkt en herstart.
- **In het Nederlands** lopen de knoppen in een vak van 420 breed over twee
  regels (standen 71 hoog). Dan blijft de kaart vier rijen, en dat is terecht:
  de inhoud is dan hoger. Dat was op 0.83.0 net zo.

## Aannames

- **De volgorde is die van Home Assistant (`HVACMode`)**, met Uit voorop. Dat
  is ook de volgorde waarin de meeste toestellen het al gaven, zodat bestaande
  dashboards zo min mogelijk verschuiven.
- **Eén pixel minder ruimte** tussen de delen is niet te zien. Een lege band
  van 39 pixels wel.

## git status --porcelain

```
(leeg na de commit van dit rapport)
```
