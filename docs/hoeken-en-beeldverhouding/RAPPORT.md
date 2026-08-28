# De ronding onderin terug, en een vaste beeldverhouding voor een stack

**Uitgave 0.32.0 — 28 augustus 2026**

> "Is hier een oplossing voor? In een vertical stack met horizontal stack heb ik
> geen ronding onderin, en de linker onderste camera is groter — zie je dat? In
> een bubble pop-up is het goed dat hij zijn grootte aanpast, maar in zo'n
> vertical stack wil ik alles hetzelfde hebben."

Twee dingen, en het eerste is een fout van mij.

---

## 1. De ronding onderin — een fout uit 0.31.2

In 0.31.2 is `overflow: hidden` van de kaart af gehaald. Dat moest, want het
knipte de dagenlijst af. Maar het was óók wat het beeld binnen de ronde hoeken
hield: sindsdien rondde het beeld alleen nog **bovenlangs** af.

Op een kaart met een tijdlijn eronder viel dat niet op — daar is het beeld de
onderkant niet. Op een kaart zonder tijdlijn, zoals in zijn stack, wel: dan ís
het beeld de hele kaart en waren de onderhoeken vierkant.

**Nu rondt het beeld alle vier de hoeken af zodra er niets onder staat.** De
kaart zet dat kenmerk zelf, in `paintVorm_()`, want alleen daar is bekend wat er
op dit moment zichtbaar is — de kiezerrij, de filters en de strook kunnen alle
drie verborgen zijn.

## 2. Alle camera's even hoog in een stack

**Waarom ze verschillen.** Sinds 0.26.0 volgt de kaart zijn camera, met opzet:
daarvóór stond er een vaste 16:9 met `cover`, en dan sneed hij bij zijn oprit de
boven- en onderkant eraf. Dat was zijn eigen melding.

Maar dat betekent ook: drie camera's naast elkaar met drie verschillende
beeldverhoudingen worden drie verschillende hoogtes. In een pop-up is dat prima —
daar staat er één. In een `horizontal-stack` staan ze naast elkaar, en dan valt
het meteen op.

**Er is nu een instelling "Beeldverhouding"** in de editor van de camerakaart:

| keuze | wat het doet |
|---|---|
| **Volgt de camera** | de standaard, en er verandert niets aan bestaande kaarten |
| 16:9 (breed) | |
| 4:3 | |
| 3:2 | |
| Vierkant | |

Kies je er een, dan vult het beeld dat vak en wordt er bijgesneden. Dat is dan
een keuze van de klant en geen aanname van ons — precies andersom dan in 0.26.0,
waar het bijsnijden er ongevraagd was.

Zet je in een stack overal dezelfde verhouding, dan zijn de kaarten even hoog.

---

## Wat er gemeten is, in een echte browser

**Verse code:**

```
/domotiapp_lovelace/domotiapp-lovelace.js?v=5e3bd4f8c60f
625348 bytes   sha256 5e3bd4f8c60fbfa0ff79eb5c851dbde1a30a8a386b71a00b3c783df061459313
op schijf:     5e3bd4f8c60fbfa0ff79eb5c851dbde1a30a8a386b71a00b3c783df061459313
```

**Zijn opstelling nagebouwd**: twee rijen van drie camerakaarten naast elkaar,
gelijk verdeeld — wat een `horizontal-stack` doet. De bovenste rij staat op
"Volgt de camera", de onderste op 16:9.

De drie democamera's leveren alle drie 16:9, en dan is er niets te zien. In de
middelste kaart van elke rij staat daarom een beeld van **4:3**; de kaart legt er
zijn eigen CSS omheen, en dat is wat hier getoetst wordt.

**Volgt de camera** — dit is zijn klacht:

```
Oprit     268 × 152
Tuin      268 × 202   <- 4:3, dus hoger dan de rest
Voorkant  268 × 152
```

**Op 16:9** — dit is de oplossing:

```
Oprit     268 × 152    aspect-ratio: 16 / 9
Tuin      268 × 152    aspect-ratio: 16 / 9
Voorkant  268 × 152    aspect-ratio: 16 / 9
```

Alle drie precies even hoog, met het 4:3-beeld bijgesneden.

**De hoeken, uitgelezen uit `getComputedStyle`** op alle zes de kaarten:

```
borderTopLeftRadius     20px
borderBottomLeftRadius  20px
alleenbeeld             true
```

Vóór deze ronde was de onderste 0px op een kaart zonder tijdlijn.

Op de schermafdruk is allebei in één blik te zien: in de bovenste rij steekt de
middelste kaart eruit, in de onderste rij staan ze gelijk, en alle zes hebben
ronde hoeken rondom.

**Geen fouten in de console.**

## Proeven

```
npm test                   898 groen
npm run check:css          OK
npm run check:registratie  OK
npm run verify             OK — bundel actueel
```

## Wat niet lukte

**Home Assistant bouwde opnieuw geen views** in dit browserprofiel (valkuil 21),
dus de stack is nagebouwd met de echte kaartelementen in een flexrij in plaats
van met HA's eigen `horizontal-stack`. Voor deze meting maakt dat niets uit: een
horizontal-stack ís een rij met gelijke kolommen, en wat hier getoetst wordt is
hoe hóóg de kaart zichzelf maakt bij een gegeven breedte.

## Aannames

- **De standaard blijft "Volgt de camera".** Een bestaande kaart verandert niet
  van vorm door deze uitgave. Wie zijn stack recht wil hebben, zet het per kaart
  aan.
- **Bijsnijden hoort bij een vaste verhouding.** Een beeld van 4:3 in een vak van
  16:9 verliest boven en onder. Dat is de prijs van gelijke hoogtes, en hij vraagt
  er expliciet om — anders was 0.26.0 nooit teruggedraaid.

## `git status --porcelain`

```
M  CLAUDE.md
M  custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
M  custom_components/domotiapp_lovelace/manifest.json
AM docs/hoeken-en-beeldverhouding/RAPPORT.md
M  src/cards/camera-card.js
```
