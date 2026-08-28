# Alleen de filters die je zelf hebt ingesteld

**Uitgave 0.30.1 — 28 augustus 2026**

Twee meldingen op 0.30.0, allebei binnen een uur na het uitbrengen:

> "Je hebt Voorkant erbij gezet als filter maar die heb ik helemaal niet
> gedefinieerd als beweging. Ik wil alleen dat je de filters laat zien die ook
> gedefinieerd zijn in de GUI met beweging, snap je?"

> "En dat 25 van de 31 mag wel weg, is niet relevant."

---

## 1. Geen knop voor iets dat niemand heeft ingesteld

**Wat er misging.** De kaart raadt de soort van een melder uit zijn naam:
`_person` wordt mens, `_vehicle` wordt voertuig, `_pet` wordt dier. Matchte er
niets, dan viel hij terug op **Beweging** — en daar verscheen dan een zesde
filterknop voor. Zijn melder "Voorkant" matchte nergens op, kreeg die soort er
stilzwijgend bij, en dus stond er een knop die hij nooit had aangezet.

Dat is precies het verkeerde soort behulpzaam. Raden mag je werk uit handen
nemen; het mag geen instelling verzinnen en die vervolgens als knop tonen.

**Twee dingen veranderd:**

1. **`raadSoort` geeft niets terug als er niets te herkennen valt.** Geen
   terugval meer op Beweging. Die soort bestaat nog wél — je kiest hem zelf in
   de editor bij *"↳ wat ziet hij"* — maar hij komt er niet meer vanzelf in. De
   editor zaait ook alleen nog wat hij werkelijk uit de naam kan afleiden; vindt
   hij niets, dan blijft dat vakje leeg. Een leeg vakje is eerlijker dan een
   ingevuld vakje dat niemand heeft ingevuld.
2. **De filterrij toont precies de soorten die aan een melder hangen.** Geen
   vaste rij van vijf meer waarvan er drie gedempt staan. Hangt er niets, dan is
   er ook geen rij.

**Wat er met zo'n melder zonder soort gebeurt.** Zijn beelden staan gewoon in de
strook zolang je niet filtert. Zodra je een soortknop indrukt vallen ze eruit —
ze horen immers bij geen enkele knop. Wil je ze wél kunnen aanvinken, dan kies je
in de editor een soort voor die melder, en dan verschijnt die knop vanzelf.

Dit gaat wel in tegen wat hij eerder vroeg (*"ik wil 5 icons hebben"*): staan er
maar drie soorten ingesteld, dan staan er nu drie knoppen. Deze regel is de
nieuwste en wint.

## 2. De teller is weg

"13 van 13" naast de dagkiezer is eruit. Je ziet de beelden zelf al staan.

---

## Wat er gemeten is, in een echte browser

Testinstance op poort 8127, met echte snapshots van de bewakingsmotor.

**Verse code:**

```
/domotiapp_lovelace/domotiapp-lovelace.js?v=9f7c53423151
608493 bytes   sha256 9f7c5342315172b6215394a3ad3a2732297d7c97f0944528e99877db02ecc914
op schijf:     9f7c5342315172b6215394a3ad3a2732297d7c97f0944528e99877db02ecc914
```

**Zijn geval nagespeeld.** Op de testkaart hangt `binary_sensor.beweging_tuin`,
die net als zijn "Voorkant" op geen enkel woord matcht. Wat de kaart er nu van
maakt:

```
persoon_oprit   -> mens
auto_oprit      -> voertuig
huisdier_tuin   -> dier
deurbel         -> aanbellen
slot_voordeur   -> ontgrendeling
beweging_tuin   -> null          <- geen soort, dus geen knop

knoppen in de rij: mens(2)  dier(1)  voertuig(4)  aanbellen(2)  ontgrendeling(2)
```

Vijf knoppen, precies de vijf die zijn ingesteld. Vóór deze uitgave stond er een
zesde "Beweging" bij.

**En de teller bestaat niet meer:** `document.querySelector(".totaal")` geeft
`null`.

**Met een echte klik** (`isTrusted: true`, pad
`svg › button[mens] › div`):

| | |
|---|---|
| filter Mens aan | strook toont alleen "Persoon oprit" (Oprit en Tuin) — de twee beelden van `beweging_tuin` vallen eruit |
| filter Mens uit | alle 13 beelden terug, inclusief "Beweging tuin" |

**Uitlijning, gemeten:**

```
kaart        357 .. 857
dagrij       368 .. 846
soorten      368 .. 846
camerakeuze  368 .. 846
1e miniatuur 368 .. 472
```

**Inhoud past in de kaart:** `scrollHeight 579 <= hoogte 581`.

**Geen fouten in de console.**

## Proeven

```
npm test                   884 groen (8 nieuw — NIEUW GEDRAG)
npm run check:css          OK
npm run check:registratie  OK
npm run verify             OK — bundel actueel
```

De acht nieuwe proeven staan op `soortenVoorFilter` en op een beeld zonder
soort. Twee bestaande proeven zijn omgedraaid: `raadSoort` gaf "beweging" terug
waar hij nu `null` geeft, en dat was precies het gedrag dat gemeld werd.

## Wat niet lukte

Niets.

## Aannames

- **"Voorkant" is bij hem een MELDER en geen camera.** Zijn zin ("niet
  gedefinieerd als beweging") laat geen andere lezing toe: een camera definieer
  je niet als beweging. Klopt dat toch niet, dan gaat het over de camerarij en
  is dat één regel.
- **De vaste volgorde blijft.** Staan er drie soorten ingesteld, dan staan ze in
  de volgorde mens · dier · voertuig · aanbellen · ontgrendeling · beweging, met
  de ontbrekende eruit. Zo verspringen de knoppen niet als er later eentje
  bijkomt.

## `git status --porcelain`

```
M  custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
M  custom_components/domotiapp_lovelace/manifest.json
AM docs/alleen-gedefinieerde-filters/RAPPORT.md
M  src/cards/camera-card.js
M  src/cards/camera-filters.js
M  tests/js/camera-filters.test.mjs
```
