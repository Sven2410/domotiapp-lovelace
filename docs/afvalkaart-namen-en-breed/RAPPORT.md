# De afvalkaart: namen, verdwenen bakken, en over de breedte

Ronde van 27 augustus 2026 — uitgave **0.25.0**. Drie meldingen over dezelfde
kaart, waarvan twee bij een KLANT en niet bij hemzelf.

---

## 1. "Ik zie volledige namen"

Met twee schermafdrukken naast elkaar. Bij zijn klant:

```
Circulus Circulus Restafval
Circulus Circulus Papier
```

Bij hemzelf gewoon `Restafval`, `Papier`, `GFT`, `PMD`.

### Waar die dubbele naam vandaan komt

Home Assistant stelt de weergavenaam samen uit de naam van het APPARAAT en die
van de entiteit. Heet het apparaat "Circulus" en de entiteit "Circulus
Restafval", dan wordt de `friendly_name` dus "Circulus Circulus Restafval". Bij
Mijnafvalwijzer valt dat toevallig goed uit, bij Circulus niet.

### Waarom er geen lijstje bij is gekomen

Er stond al zo'n lijstje: `afvalbeheer|afvalwijzer|mijnafvalwijzer` werd
weggeknipt. Die aanpak werkt precies tot de volgende gemeente — en dan staat het
er weer. Elke klant zou een regel erbij betekenen in een lijst die per definitie
achterloopt.

### Wat er wél werkt: het gedeelde begin weghalen

Op één kaart staan de bakken van één gemeente. Wat ze in hun naam DELEN is dus
geen informatie:

```
Circulus Circulus Restafval  ->  Restafval
Circulus Circulus PMD        ->  PMD
Circulus Circulus Papier     ->  Papier
Circulus Circulus GFT        ->  GFT
```

En bij Mijnafvalwijzer, waar de namen niets delen, verandert er niets. Geen lijst
om bij te houden.

Twee grenzen, allebei getest: er blijft **altijd minstens één woord** staan (twee
bakken die net zo heten als het voorvoegsel houden hun naam), en bij één sensor
valt er niets te vergelijken — dan blijft alleen het opruimen van een herhaald
woord over.

De kleurstalen in de editor gebruiken dezelfde inkorting. Anders staat er "Kleur
voor Circulus Circulus Restafval" boven een staal dat op de kaart bij "Restafval"
hoort.

---

## 2. "En ik mis de helft"

Dit was het ernstigste van de drie. Bij zijn klant stonden vier sensoren in de
editor en twee bakken op de kaart.

De oorzaak: een sensor zonder bruikbare datum werd **weggefilterd**. Dat leest als
een kaart die stuk is — je vult vier bakken in, je ziet er twee, en er staat
nergens waarom.

Nu verdwijnt er niets meer. De bakken met een datum staan bovenaan op volgorde;
wat er niet te plaatsen valt staat daaronder, gedempt, met de reden erbij:

| wat er is | wat er staat |
|---|---|
| geen leesbare datum | *geen datum* |
| een datum die voorbij is | *is geweest* |
| de sensor bestaat niet | *sensor ontbreekt* |

Dat laatste is meteen de diagnose die hij anders zelf had moeten zoeken.

**De uitgelichte bak blijft de eerstvolgende die écht nog komt** — een bak zonder
datum hoort daar niet te staan, ook al staat hij in de lijst.

---

## 3. Over de breedte

> *"Ook wil ik de afvalkaart over de breedte kunnen maken en een stuk minder
> hoog, om veel meer ruimte te besparen."*

Er is een tweede vorm bij: **Over de breedte**. Alle bakken naast elkaar in
plaats van onder elkaar, zonder de uitgelichte kop. De eerstvolgende licht op
tussen de andere; zonder dat verschil zijn het vier gelijke vakjes en moet je de
datums lezen om te zien welke er woensdag uit moet.

### Gemeten in een echte browser

Twee keer dezelfde vier bakken, naast elkaar op één dashboard:

```
LIJSTVORM:   248px   (4 rasterrijen)
BREDE VORM:   56px   (1 rasterrij)
```

**Dat is 192 pixels minder**, met alle vier de bakken nog zichtbaar:

```
PMD        dinsdag      <- eerstvolgende, uitgelicht
Restafval  ma 7 sep
Papier     vr 2 okt
GFT        geen datum   <- gedempt
```

Boven de vier bakken breekt het raster af naar een tweede rij; de kaart geeft dan
twee rasterrijen op.

---

## Wat niet lukte

- **Er is niet op de installatie van de klant zelf gemeten.** Die is hier niet
  bereikbaar. De situatie is nagebouwd met sensoren die precies dezelfde namen en
  toestanden dragen als op zijn schermafdruk — inclusief de twee zonder datum.
- **Wat de Circulus-sensoren precies in hun state hebben staan is niet bekend.**
  Dat PMD en GFT bij hem ontbraken kán dus ook een datumnotatie zijn die de
  parser niet leest, in plaats van een lege waarde. Met deze ronde is dat
  zichtbaar: er staat nu *geen datum* achter, en dan is het meteen duidelijk waar
  het aan ligt. Komt dat voor, dan is de volgende stap die notatie opvragen.

## Aannames

- De bakken op één kaart horen bij één gemeente. Zet iemand er twee gemeentes op
  (een tweede huis), dan wordt er niets ingekort — de namen delen dan niets, en
  dat is precies goed.

## Tellingen

- **833 JS-tests** groen; `check:css` en `check:registratie` OK.
- Versie 0.25.0.

## git status --porcelain

Zie de PR; de werkmap is bij het uitbrengen schoon.
