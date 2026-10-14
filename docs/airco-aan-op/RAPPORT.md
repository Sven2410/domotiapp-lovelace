# 0.65.1: "Aan op" op de airco-kaart (wacht op coach v0.119.1)

## De vraag

Op de avond van 14 oktober 2026, na 0.65.0, stelde de eigenaar de coach bij.
Dit kwam via de coach-sessie, met zijn eigen woorden:

- *"de airco moet alleen bijverwarmen of koelen bij overschot he! niet gewoon
  aan om de temperatuur te regelen"*. Dat gaat over wat de coach doet, niet
  over de kaart.
- *"goedkoop uur mag de bewoner zelf kiezen dus 3 opties of op zon of goedkope
  uren of beide"*.
- *"Bij apparaten toevoegen alleen nog de optie Mitsubishi Electric kunnen
  kiezen"*. Dat gaat over het toevoegen van een apparaat in de coach, niet over
  de kaart.

Het contract verandert in coach v0.119.1 (contract blijft 1):

| Wat | Hoe |
|---|---|
| **weg** | de switch `alleen_zon`, en het attribuut `alleen_zon` op de sensor |
| **erbij** | een select `aan_op` (translation_key `aan_op`), opties `zon`, `goedkoop` en `beide`, standaard `zon`. In de coach: "Aan op", met "Zon over", "Goedkope uren" en "Zon en goedkope uren". Schrijven met `select.select_option` |
| **erbij op de sensor** | `aan_op`, de huidige keuze |
| **blijft** | `dynamisch`. Bij false (vast contract) is geen uur goedkoper; verbergen of uitleggen mocht ik kiezen |
| `stand` | dezelfde lijst; `goedkoop` alleen als de bewoner goedkoop of beide koos |

Er hing nog nergens een airco aan de coach, dus de switch weghalen raakt
niemand.

## Wat 0.65.0 hiervan merkt

De coach-sessie verwachtte dat de knop "Alleen op zon" gewoon wegvalt. Dat
klopt, en nagekeken:

- 0.65.0 zocht de rol `alleen_zon`, en die is er in het nieuwe contract niet.
- Laat Home Assistant de oude switch als onbereikbaar in het register staan
  (zo gaat het met een entiteit die uit een integratie verdwijnt), dan
  slaat 0.65.0 hem over. Een onbereikbare schakelaar geeft geen knop.

Gemeten met de logica van 0.65.0 (`git archive main src`, main = 0f7453e)
tegen de vorm uit de dump van v0.119.1:

```
{"dynamisch":false,"oudeSwitchInRegister":false,"knoppen":["Pauze"],"aanOp":"bestaat niet","regel":"Er is 1,5 kW zon over, ..."}
{"dynamisch":true,"oudeSwitchInRegister":false,"knoppen":["Pauze"],"aanOp":"bestaat niet","regel":"Er is 1,5 kW zon over, ..."}
{"dynamisch":true,"oudeSwitchInRegister":true,"knoppen":["Pauze"],"aanOp":"bestaat niet","regel":"Er is 1,5 kW zon over, ..."}
```

0.65.0 toont dus alleen Pauze, zonder fout, met de zin van de coach. Er komt
alleen niets voor de keuze "Aan op" in de plaats; dat doet 0.65.1. Ook in de
testinstance gezien: de oude switch staat daar na de herstart als
`unavailable` in het register, en de kaart toont toch alleen Pauze.

## Wat er veranderd is

**"Aan op", drie knoppen op een regel**, onder het doel en boven Pauze. Ze
hebben de vorm van de ventilator: een kopje en dan gelijke knoppen.

| Knop | Naam in de coach (aria-label en tooltip) |
|---|---|
| Zon | Zon over |
| Goedkoop | Goedkope uren |
| Beide | Zon en goedkope uren |

De woorden op de knoppen zijn kort, want drie knoppen moeten op 280 px passen.
"Zon en goedkope uren" past daar niet in een knop. De opties komen uit de
select zelf. Een optie die de kaart niet kent, blijft staan met zijn eigen
naam, zodat een keuze die de coach later toevoegt niet verdwijnt.

**Alleen bij een dynamisch contract.** Bij een vast contract is geen uur
goedkoper, en kiest de coach altijd zon. Verbergen is hier eerlijker dan een
keuze tonen die niets doet. Dezelfde regel gold voor "Alleen op zon" in 0.65.0.

**"Alleen op zon" is weg** (`coachKnoppen` geeft alleen Pauze nog).

**De wachtzin volgt de keuze.** Dit is alleen het vangnet; de coach stuurt
altijd een eigen zin:

- `zon`: "Wacht op zon.";
- `goedkoop`: "Wacht op een goedkoop uur.";
- `beide`: "Wacht op zon of een goedkoop uur.";
- bij een vast contract altijd "Wacht op zon.".

**Het infoscherm** heeft geen knoppen van de coach, alleen het doel, en blijft
zoals in 0.65.0.

## Bewijs

### Tests

`tests/js/airco-coach.test.mjs`, aangepast en uitgebreid tot 31 tests. Er zijn
twee groepen bij gekomen of veranderd, allebei **NIEUW GEDRAG**:

- **"de knoppen van de coach":** alleen Pauze. De oude tests over "Alleen op
  zon" zijn vervangen, want die beschreven het contract van v0.119.0.
- **"Aan op" (7 tests):** de drie knoppen, verborgen bij een vast contract,
  verborgen zonder select, een onbekende optie, `select.select_option`, een
  keuze die er niet bij hoort, en geen gedachtestreepjes.

Daarnaast vraagt de wachtzin nu naar `aan_op`.

Tegen 0.65.0 (dezelfde map, `git archive main src tests`), falen er 9 van de 31:

```
ℹ tests 31
ℹ pass 22
ℹ fail 9
  ✖ de attributen, en alleen echte waarden
  ✖ wachten: op wat de bewoner bij Aan op koos
  ✖ drie knoppen met een kort woord, en de gekozen
  ✖ niet bij een vast contract: dan is er geen goedkoop uur om te kiezen
  ✖ niet zonder select, en niet als hij onbereikbaar is of maar één keuze heeft
  ✖ een keuze die de kaart niet kent blijft staan, met zijn eigen naam
  ✖ kiezen is select.select_option op de select van de coach
  ✖ een keuze die er niet bij hoort, of een select die er niet is: niets
  ✖ geen gedachtestreepjes in de woorden
```

De 22 die op 0.65.0 slagen zijn de tests van 0.65.0 zelf, plus twee die
daar ook slagen en daarom als **REGRESSIEWACHT** gelabeld zijn:

- alleen Pauze als knop: 0.65.0 zocht de switch `alleen_zon`, en die is er
  niet meer;
- de wachtzin bij een vast contract.

`tests/js/airco-dump-0119.test.mjs` (de dump van v0.119.0) slaagt nog
helemaal. Bij een vast contract staat daar alleen Pauze, en dat blijft zo.

Op deze tak: **1685 JS-tests groen**. `npm run verify`, `check:registratie`,
`check:css` en `check:controls` zijn OK.

### In Home Assistant

De nep-coach (`.ha-dev-config/.../airco.py`, niet in git) staat op het contract
van v0.119.1:

- de switch `alleen_zon` is eruit;
- de select `aan_op` (zon, goedkoop, beide) en het attribuut `aan_op` zijn
  erbij.

Na de herstart stond de oude switch als `unavailable` in het register,
precies zoals bij een klant na de update.

- **Verse code:** de geladen bundel had `?v=901a5abcb271`, de sha256 van de
  gebouwde bundel. Eerst een schermafdruk, dan pas klikken (valkuil 47).
- **Op de kaart:** "Aan op" met Zon gekozen, en alleen Pauze. De oude switch
  zit in de rollen, maar geeft geen knop.
- **Echte klik op "Goedkoop"** (`isTrusted: true`, aria-label "Aan op goedkope
  uren"): één `select.select_option` "goedkoop". De select en het attribuut
  van de sensor stonden daarna op goedkoop, en de knop lichtte op.
- **De wachtzin** zonder zin van de nep-coach: "Wacht op een goedkoop uur.",
  "Wacht op zon of een goedkoop uur." en "Wacht op zon.", per keuze.
- **Vast contract:** "Aan op" weg, alleen Pauze, hoogte 504.
- **Uitlijning:** de knoppen van "Aan op" lopen van x=711 tot 1057, net als de
  standen erboven (711 tot 1057). Ze zijn alle drie 113 breed.
- **280 px:** alle drie 81 breed, geen tekst afgekapt, niets scrolt, hoogte
  568.
- **Hoogtes:** 568 met "Aan op" en 504 zonder, allebei rasterrijen.
- **Licht thema:** leesbaar, de gekozen knop in het accent. Daarna is het
  thema teruggezet op donker.

## Wat er nog moet voor de uitgave

Coach v0.119.1 is nog niet uit. Zodra hij uit is:

1. de dump (nagebouwd, net als die van v0.119.0) als
   `tests/js/vaste-invoer/coach-0.119.1-airco.json`, met een test;
2. de bron van de coach op tag v0.119.1 lezen:
   - de select `aan_op` (translation_key en opties);
   - het attribuut `aan_op` op de sensor;
   - dat de switch `alleen_zon` weg is;
3. dan mergen en 0.65.1 uitbrengen.

## Samenvatting

- "Alleen op zon" is "Aan op" geworden: Zon, Goedkoop of Beide, als drie
  knoppen, alleen bij een dynamisch contract.
- 0.65.0 valt netjes terug op alleen Pauze, ook met de oude switch onbereikbaar
  in het register. Nagekeken met de logica van 0.65.0 en in de testinstance.
- De wachtzin van de kaart volgt de keuze.
- 1685 JS-tests zijn groen.
- Gemeten met een echte klik, op 280 px, licht en donker.
- **Nog niet uitgebracht:** wacht op coach v0.119.1 en zijn dump.

## Wat niet lukte

- Niet tegen de echte coach v0.119.1 gemeten, want die is er nog niet. Wel
  tegen de nep-coach op het nieuwe contract.
- Niet op een iPhone of een echte iPad gemeten.

## Aannames

- De volgorde van de opties is die van de select: zon, goedkoop, beide. De
  kaart sorteert niet.
- "Aan op" hoort niet op het infoscherm. Dat scherm hangt in een wachtkamer en
  bedient alleen de temperatuur; om de keuze is niet gevraagd.

## git status --porcelain

Vóór de commit van de kaart:

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/airco-card.js
 M src/cards/airco-logica.js
 M tests/js/airco-coach.test.mjs
?? docs/airco-aan-op/
```

Na die commit: leeg.
