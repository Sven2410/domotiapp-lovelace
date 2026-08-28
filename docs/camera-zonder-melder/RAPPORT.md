# Een camera zonder bewegingsmelder hoort niet in het filter

**Uitgave 0.30.2 — 28 augustus 2026**

> "Voorkant staat bij mij er nog bij terwijl ik geen bewegingsmelder heb
> gekoppeld aan die camera, hoe kan dat?"
>
> "Ja maar dan wel universeel, want niet iedereen heeft de naam Voorkant, snap
> je. Je moet kijken naar de bewegingsmelders."

---

## Wat ik in 0.30.1 verkeerd begrepen heb

In 0.30.1 stond hier als aanname: *"Voorkant is bij hem een MELDER en geen
camera."* Dat was fout. Voorkant is een **camera**, en hij stond in de
camerakeuze van het filter terwijl er geen enkele bewegingsmelder aan hangt.

Wat er in 0.30.1 gerepareerd is, klopte wel en blijft staan: een melder die op
geen enkel woord matchte werd stilzwijgend "Beweging" en kreeg daar een
filterknop voor. Alleen was dát niet zijn klacht.

## Wat er nu gebeurt

De camerakeuze van het filter toont alleen de camera's waar **een
bewegingsmelder aan hangt**. Geen namen, geen lijstje, geen uitzondering: de
kaart kijkt naar de melders, precies zoals hij zegt.

Welke melder bij welke camera hoort, wordt al bepaald in `camera-logica.js` en
dat is niet veranderd:

1. wat je zelf in de editor koos bij *"↳ hoort bij welke camera"*;
2. anders: hetzelfde APPARAAT — een Reolink is één apparaat met zijn camera en
   zijn `_person`, `_vehicle` en `_pet` eraan, dus daar hoef je niets in te
   vullen;
3. vindt hij niets, dan hoort die melder bij ALLE camera's — en dan staan ze er
   ook allemaal, want dan kan elke camera een beeld opleveren.

Het is dezelfde toets die de serverkant al gebruikt om een bewakingsregel aan of
uit te zetten (`regelsVoorKaart`: `aan: eigen.length > 0`). Een camera zonder
melder maakt nooit een snapshot; een filterknop die alleen "niets" kan opleveren
is geen keuze maar een valstrik.

**Twee dingen die er expres bij horen:**

- **De rij waarin je KIEST welke camera je bekijkt verandert niet.** Voorkant
  staat daar gewoon in — je wilt hem kunnen bekijken, je kunt er alleen niet op
  filteren. Op de schermafdruk staan die twee rijen onder elkaar en verschillen
  ze precies daarin.
- **Een camera die nog beelden in de timeline heeft blijft filterbaar**, ook als
  zijn melder inmiddels weg is. Anders staan er beelden in de strook waar je niet
  meer bij kunt.
- Blijft er één camera over, dan verdwijnt de rij helemaal. "Alle" naast één naam
  is geen keuze. Stond er een filter aan die wegvalt, dan gaat die uit — anders
  blijf je met een lege strook zitten zonder knop om dat mee terug te draaien.

---

## Wat er gemeten is, in een echte browser

Zijn geval nagebouwd op de testinstance: **drie camera's**, waarvan de derde
("Voorkant") geen enkele melder heeft. De andere vijf melders hangen aan Oprit,
één aan Tuin.

**Verse code:**

```
/domotiapp_lovelace/domotiapp-lovelace.js?v=c1a774694511
608988 bytes   sha256 c1a774694511b1e0009d25eb988a83c3a2361bbc2e040373217d580cdc0a9909
op schijf:     c1a774694511b1e0009d25eb988a83c3a2361bbc2e040373217d580cdc0a9909
```

**De twee rijen naast elkaar, van de echte kaart op het dashboard:**

```
kijkrij  (welke camera zie ik):   Oprit · Tuin · Voorkant
filterrij(waarop kan ik filteren): Alle · Oprit · Tuin
soortknoppen:                      mens · dier · voertuig · aanbellen · ontgrendeling
beelden in de timeline:            13
```

**Met een echte klik** (`isTrusted: true`, pad
`button[cam:camera.demo_camera] › div › div`) op "Oprit" in de filterrij: de
strook houdt zes beelden over, allemaal van Oprit, en de rij blijft
`Alle · Oprit · Tuin`.

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
npm test                   889 groen (5 nieuw — NIEUW GEDRAG)
npm run check:css          OK
npm run check:registratie  OK
npm run verify             OK — bundel actueel
```

De vijf nieuwe proeven staan op `camerasVoorFilter`: een camera zonder melder
valt weg, de kaartvolgorde blijft, één melder die bij allemaal hoort houdt alle
camera's, een camera met beelden blijft staan, en zonder melders is de lijst
leeg.

## Wat niet lukte, en wat dat kostte

**Home Assistant bouwde in dit browserprofiel een halfuur lang geen enkele view
meer** — valkuil 21. Geen fout in de console, `hui-root` zonder `hui-view`, en
`hui-sections-view` niet eens gedefinieerd. Dat is drie keer verkeerd
gediagnosticeerd voordat het duidelijk werd:

1. eerst leek het aan het nieuwe dashboardconfig te liggen (was het niet: een
   vers aangemaakt dashboard deed hetzelfde);
2. toen aan de sections-view (was het niet: een masonry-view deed hetzelfde);
3. toen aan de kaart (was het niet: dezelfde kaart met dezelfde config
   rechtstreeks in de pagina gehangen, met de echte `hass`, tekende zich
   probleemloos — inclusief de goede filterrij).

Wat het verhielp: de service worker en de caches wissen, en een vers tabblad.
Het automatisch gegenereerde dashboard "Thuis" bleef al die tijd wél bouwen, en
dat was het aanknopingspunt: als één dashboard het doet en de rest niet, ligt
het niet aan de kaart.

Aan `CLAUDE.md` is bij valkuil 21 toegevoegd dat het wissen van de service
worker ook de WEG ERUIT kan zijn, niet alleen de oorzaak.

## Aannames

Geen aannames gedaan; hij heeft in twee zinnen precies gezegd wat er moest
gebeuren en waarop gekeken moest worden.

## `git status --porcelain`

```
M  CLAUDE.md
M  custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
M  custom_components/domotiapp_lovelace/manifest.json
AM docs/camera-zonder-melder/RAPPORT.md
M  src/cards/camera-card.js
M  src/cards/camera-filters.js
M  tests/js/camera-filters.test.mjs
```
