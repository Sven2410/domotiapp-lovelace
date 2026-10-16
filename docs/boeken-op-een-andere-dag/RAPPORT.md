# Op de iPad boeken voor een andere dag (0.77.0)

16 oktober 2026. De vraag van de eigenaar (via de coach-sessie doorgestuurd,
want hij kwam daar per ongeluk binnen):

> *"ik wil ook dat je een datum kan kiezen om te boeken nu is het alleen
> vandaag op de ipad"*

Tot nu toe kende het boekscherm op het infoscherm alleen de kwartieren van
vandaag, vanaf nu. De server nam al boekingen tot een jaar vooruit aan; het zat
alleen in het scherm vast. Het scherm las bovendien alleen de afspraken van
vandaag, dus het wist niet wat er morgen al stond.

## Wat er gebouwd is

In het boekscherm staat boven *Vanaf* een regel **Dag**, met een pijl terug en
een pijl vooruit: "Vandaag", "Morgen", "zondag 18 okt", tot twee weken vooruit.
Dat is net zo ver als het beheer de boekingen toont, zodat wat op de iPad
geboekt wordt daar ook in de lijst staat.

- **Op een andere dag begint Vanaf bij de eerste openingstijd van die dag**,
  of om 8 uur als er geen openingstijden zijn. Zonder dat stond hij morgen op
  middernacht, 32 tikken van negen uur vandaan. Er is daar geen "Nu".
- **Een andere dag kiezen houdt de tijd vast.** Wie om 14:00 wilde en naar
  morgen gaat, staat morgen op 14:00. Is die tijd bezet, dan het eerste kwartier
  erna dat vrij is, en niet de opening. Vanaf "Nu" naar morgen gaat wel naar de
  opening. Terug naar vandaag met een tijd die al voorbij is, geeft "Nu".
- **Onder de naam staat op een andere dag wat er al geboekt is**: "Morgen al
  geboekt: 10:00 – 11:00", of "Zondag 18 okt is nog niets geboekt." Alleen
  tijden, zoals overal op het scherm. Vandaag staat er wat er al stond ("Vrij",
  "Bezet tot 15:00").
- **Na het boeken** zegt het scherm "Spreekruimte is geboekt, morgen van
  11:00 tot 12:00". Vandaag blijft het "van ... tot ...".
- **Een tijd die bezet is**: "Op deze tijd is de ruimte bezet. Kies een andere
  tijd of een andere dag." Tot nu toe stond er "Kies een later tijdstip".
- **Dag en Vanaf staan recht onder elkaar.** Het vak met de waarde is voor
  allebei even breed, zodat de knop rechts niet per dag verspringt.

Het scherm leest de agenda's nu twee weken vooruit in plaats van één dag. Alles
wat vandaag toont knipt zelf de dag eruit: de status, het blok, en de tijdlijn
op de pagina. Een boeking van morgen maakt vandaag niet "Vrij tot 10:00". Dat
was al zo getoetst (`ruimteStatus`), en is nu ook in de browser nagemeten.

De pagina Ruimtes blijft vandaag tonen; zie *Wat niet lukte*.

Code:
- `src/cards/ruimtes-logica.js`: `boekDagen`, `openingVan`, `keuzeOpDag`,
  `dagBezet`, `geboektTekst` en `passendeDuur` erbij. `beginKeuzes` kent een
  dag, en `eersteKeuze` een `vanaf`.
- `src/cards/infoscherm-card.js`: het abonnement, de regel Dag en
  `boekKeuzes_`.

`passendeDuur` is de regel die eerst in de kaart zelf stond, voor de stappen
Eerder en Later. Een andere dag kiezen heeft dezelfde regel nodig.

**Begintijden op een andere dag gaan op de klok**, niet in minuten opgeteld. Op
25 oktober gaat de klok een uur terug. Met optellen zou 02:00 dan twee keer in
de lijst staan, en zou Later tussen die twee heen en weer springen.

`SPEC.md` 20.7 is bijgewerkt.

## Bewijs in een echte browser

Testinstance, als het **kioskaccount** (`iPad wachtkamer`) op
`ipad.localhost:8127`, venster 1920 × 911.

Verse code: `?v=830362bf9a55`, en de sha256 van een verse fetch was gelijk aan
die op schijf (1.178.186 bytes). Daarna is alleen het versienummer naar 0.77.0
gegaan.

**Kliks.** Alle kliks zijn echte kliks, `isTrusted: true`: 16 in de eerste
ronde, 17 in de tweede. De route: de kop van het blok Ruimtes, Boeken bij de
Spreekruimte, de pijl naar morgen, acht keer Later, het cijferblok (4, 8, 2,
1) en Boeken.

Wat een waarnemer op het boekscherm vastlegde (tijd in ms, dan status | dag |
vanaf | regel eronder):

```
 9606  Vrij | Vandaag | Nu | Van 17:17 tot 18:17
 9731  Morgen al geboekt: 10:00 – 11:00 | Morgen | 08:00 | Van 08:00 tot 09:00
 ...
10706  Morgen al geboekt: 10:00 – 11:00 | Morgen | 10:00 | Op deze tijd is de ruimte bezet. Kies een andere tijd of een andere dag.
11850  Zondag 18 okt is nog niets geboekt. | zondag 18 okt | 10:00 | Van 10:00 tot 11:00
11973  Morgen al geboekt: 10:00 – 11:00 | Morgen | 11:00 | Van 11:00 tot 12:00
24139  Spreekruimte is geboekt | morgen van 11:00 tot 12:00
28139  (dicht)
```

Wat dat laat zien:
- **Een andere dag:** de pijl naar morgen springt naar 08:00. De testinstance
  heeft op zaterdag geen openingstijden, dus 8 uur.
- **Een bezette tijd:** om 10:00 staan alle duren uit.
- **Heen en terug:** naar zondag houdt 10:00 vast; terug naar morgen geeft
  11:00, het eerste kwartier erna dat vrij is.
- **De bevestiging** staat precies 4000 ms. De eerste keer leek het boekscherm
  te vroeg dicht te gaan; dat was de schermafdruk die later kwam dan die vier
  seconden. De waarnemer liet het zien.

**In de agenda van Home Assistant** (`calendar.spreekruimte`), daarna gelezen
als beheerder:

```
2026-10-17T10:00:00+02:00  2026-10-17T11:00:00+02:00  Geboekt op het infoscherm
2026-10-17T11:00:00+02:00  2026-10-17T12:00:00+02:00  Geboekt op het infoscherm
```

**Vandaag blijft vandaag.** Op de pagina Ruimtes ("Vandaag") had de
Spreekruimte twee balken, met de tijden 14:00 – 15:00 en 15:00 – 16:00, en niet
die van morgen. Het blok zei "Spreekruimte: Vrij" (17:20), en niet "Vrij tot
10:00".

**Maten** (`getBoundingClientRect`, schaal `--s` 1,025):

| wat | gemeten |
|---|---|
| knoppen Dag, links / rechts | x 292,9 / 612,7 |
| knoppen Vanaf, links / rechts | x 292,9 / 612,7 |
| vak van de waarde, Dag en Vanaf | allebei 225,5 breed |
| langste daglabel, "donderdag 29 okt" | 207,9 breed (vóór de reparatie hieronder stond Dag op 220 en Vanaf op 130, en verschoof de rechterknop: 527 tegen 451 in de schermafdruk) |
| ruimte onder de laatste regel, links / rechts | 215,6 / 250,8 pixels |
| scrollhoogte van kolommen en laag | gelijk aan de hoogte (730/730, 855/855) |

De schaal van het scherm is `min(breedte/1194, hoogte/834)`. In dit venster is
de hoogte de grens, en dat is het krapste geval. Op een iPad is de breedte de
grens, en dan is er naar verhouding meer hoogte. Wat hier past, past daar dus
ook.

## Tests

`tests/js/ruimtes-andere-dag.test.mjs`, 19 tests. Die zijn alle 19 NIEUW
GEDRAG, behalve vier REGRESSIEWACHTEN:
- **Vandaag blijft hetzelfde:** "Nu" en dan elk kwartier.
- **De duur bij een andere begintijd** (drie tests). Dat stond eerst in de
  kaart; op de oude code falen die drie alleen omdat de functie daar nog niet
  los bestond.

Gedraaid tegen de oude code (`git archive main`, de testfile erin):

```
ℹ pass 1
ℹ fail 18
```

De ene die slaagt is de regressiewacht "vandaag blijft het Nu en dan elk
kwartier". Ook gedraaid met `TZ=UTC` en `TZ=America/New_York`: 19 van 19.

## Controles

- `npm run build` (met `check:css`), `verify`, `check:registratie`,
  `check:controls`: groen.
- `npm test`: 1949 tests, alle groen.
- Python: zie de PR. Er is aan de serverkant niets veranderd.

## Samenvatting

Op de iPad kies je nu de dag, van vandaag tot twee weken vooruit. Op een andere
dag begint hij bij de opening, houdt hij de tijd vast als je van dag wisselt, en
staat erbij wat er die dag al geboekt is. Wat vandaag toont, blijft vandaag.

## Wat niet lukte

Niets. Niet gebouwd, met opzet: de pagina Ruimtes toont alleen vandaag, er is
geen pijl naar morgen. De vraag ging over boeken, en in het boekscherm staat nu
wat er die dag al geboekt is. Wil de eigenaar op de pagina zelf door de dagen
bladeren, dan is dat een volgende ronde.

## Aannames

- **Twee weken vooruit**, net als het beheer. Verder vooruit kan in het beheer
  (met een datumveld). Op de iPad zou dat veel tikken op de pijl zijn.
- **Een pijl per dag en geen kalender.** Hetzelfde soort knop als Vanaf, en
  geen invoerveld: een datumkiezer van de browser haalt op een iPad een eigen
  scherm tevoorschijn.
- **Een dag zonder openingstijden (dicht) kan gewoon geboekt worden**, vanaf
  8 uur. De server keek ook nooit naar de openingstijden.

## `git status --porcelain`

Schoon na de commit.
