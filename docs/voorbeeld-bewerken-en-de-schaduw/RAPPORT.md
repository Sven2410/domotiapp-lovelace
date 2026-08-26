# De editor naar het voorbeeld, en de schaduw die geen thema was

Vier meldingen, waarvan één die al sinds 0.10.0 onder een verkeerde naam
rondliep.

| Melding | Wat het was |
|---|---|
| "die drie puntjes en het potloodje werken niet dan wordt ik er weer uit gegooid" | elke toetsaanslag bouwde de héle editor opnieuw op |
| "kan je die editor etc niet rechts maken in het voorbeeld? Dat heeft Bubble Card ook" | gedaan: de kaartenlijst staat nu in het voorbeeld |
| "zie je die schaduw onder de cards? Ik heb het thema uitgezet en (…) dan is het er nogsteeds" | onze eigen `--dac-shadow`, niet zijn thema |
| "de scene kaart mist ook de achtergrond weg halen" | het vinkje stond in elke editor behalve die ene |

---

## 1. Waarom je eruit werd gegooid

Niet het potlood en niet het menu. Het was dit, in `bewerkVak_`:

```js
editor.addEventListener("config-changed", (e) => {
  …
  clearTimeout(this.hertekenen_);
  this.hertekenen_ = setTimeout(() => this.build_(), 700);   // <-- hier
});
```

Elke toetsaanslag in de editor van een kaart in een tabblad zette een timer die
700 ms later `build_()` aanriep — en `build_()` gooit de héle editor weg en zet
hem opnieuw op. Met een verse `hui-card-element-editor`, dus zonder focus, en
met de schuifbalk terug bovenaan. Wie een naam typt, wordt drie tellen later
teruggezet naar het begin van het formulier.

Datzelfde gold voor het potlood: `bewerk` riep `build_()` aan, de schuifbalk
sprong naar boven, en het bewerkblok opende ergens ver daaronder. Dat leest als
"hij doet niets".

Nu:

- **bij een wijziging in een kaart gebeurt er niets meer in de editor.** Het
  hoeft ook niet: het VOORBEELD wordt door Home Assistant zelf opnieuw getekend
  zodra de config verandert, en daar staat de lijst nu.
- **bij het potlood** wordt alleen het bewerkblok gezet (`toonBewerkVak_`), het
  tabblad opengeklapt, en het blok in beeld gescrold.

## 2. De lijst staat in het voorbeeld

Zoals bij Bubble Card: links de instellingen, rechts de tab zoals hij wordt —
met de overlay van Home Assistant om elke kaart, sleepbaar, en met
"＋ Kaart toevoegen" eronder.

Dat kon omdat de KAART zelf kan zien dat hij in een bewerkdialoog staat. Hij
zoekt dan de editor op die bij die dialoog hoort (`bewerkerVan`) en meldt daar
wat het menu of een sleepbeweging opleverde; de editor houdt de config bij. De
verwijzing loopt met opzet van de kaart naar de editor en niet andersom: Home
Assistant bouwt die twee los van elkaar op, en wie er eerst is verschilt per
keer.

Gemeten in een echte bewerkdialoog:

```
overlays in het voorbeeld   2   (hui-card-edit-mode)
kaarten erin                domotiapp-entities-card, hui-tile-card
ha-sortable                 1
knop "Kaart toevoegen"      aanwezig
```

**Eén fout die dit opleverde en die eruit is.** `kaartenLijst` riep
`maakKaart(config)` aan met één argument, terwijl de kaart de al gebouwde
elementen op INDEX wilde teruggeven. Resultaat: `elementen[undefined]`, geen
enkele kaart in het voorbeeld, alleen de knop. Zichtbaar op de eerste
schermafdruk van deze ronde; de index gaat nu mee.

## 3. De schaduw was van ons

Hij verdacht zijn thema, zette het uit, en de vlek bleef staan. Dat klopte: het
is `--dac-shadow`, en die stond op

```
0 1px 0 rgba(255,255,255,0.04) inset,
0 18px 40px -24px rgba(0,0,0,0.9)
```

Die tweede regel is een slagschaduw van 18 pixels naar beneden met 40 pixels
onscherpte. Op een kaart van drie rijen valt dat weg. Op een kaart van ÉÉN rij —
een entiteitenkaart met een regel erin, een rolluikkaart — zit die schaduw net zo
hoog als de kaart zelf, en dan is het geen schaduw meer maar een donkere vlek
eronder. Staan er drie van die kaarten onder elkaar, dan tellen de vlekken op.

Dat is precies wat hij beschreef: "die schaduw komt alleen als ik een
entiteiten kaart gebruik met maar 1 rij en 1 kolom", en later hetzelfde voor de
rolluikkaart.

Weg. Wat er blijft is de haarlijn bovenlangs. Gemeten, op een kaart op het
dashboard:

```
vóór  rgba(255,255,255,0.04) 0px 1px 0px 0px inset, rgba(0,0,0,0.9) 0px 18px 40px -24px
ná    rgba(255,255,255,0.04) 0px 1px 0px 0px inset
```

De zwevende dingen houden hun schaduw wél: de navbalk, zijn menu en het
mediazoekscherm liggen ergens BOVEN de pagina, en daar is een schaduw geen
decoratie maar de enige aanwijzing dat er iets voor iets anders hangt.

Dit is een bewuste afwijking van de tokens van de Coach. Verandert daar de
schaduw, dan blijft deze regel staan; dat staat er ook bij.

## 4. De scenekaart kreeg zijn vinkje

`bare` zat al in de kaart maar in geen enkel scherm — de scene-editor is met de
hand geschreven (geen `DacEditor`) en werd overgeslagen toen elke andere kaart
het vinkje kreeg. Nu staat het er, met dezelfde tekst als overal.

---

## Tests

```
npm test                   546 tests, 546 pass, 0 fail
npm run check:registratie  OK
npm run check:controls     OK
npm run check:css          OK
npm run verify             OK   (0.14.0, 428942 bytes)
```

Geen nieuwe unittests: er is geen nieuwe logica bij gekomen. Wat er veranderde
is een weggehaalde herbouw, een verplaatste lijst, een tokenwaarde en een veld
in een schema — geen van vieren te vangen zonder browser, en de browser is waar
ze gemeten zijn.

`npm run check:css` verdiende vandaag zijn bestaan: hij ving mijn eigen backtick
in het nieuwe commentaar bij `--dac-shadow`, vóór de bouw.

## Wat niet lukte

**De testinstance heeft me twee uur op een dwaalspoor gezet, en dat hoort hier
te staan.** Na het wissen van de service worker en de caches (valkuil 15) stopt
Home Assistant in dat tabblad met het opnieuw opbouwen van views: `hui-root`
krijgt geen `_curView` meer en het scherm blijft leeg. Elke conclusie die daarna
uit een leeg scherm getrokken wordt, is onzin — en ik heb er twee getrokken die
onjuist waren:

- "de rookmelderkaart sloopt de hele view" (nee — na een herstart van de
  container tekende diezelfde kaart gewoon);
- "de navbalkkaart sloopt de hele view" (nee — idem).

Wat wél waar is en nu als valkuil 21 in CLAUDE.md staat: **na zo'n wisoperatie
is alleen een herstart van de container mét een vers tabblad nog betrouwbaar**,
en **rechtstreeks naar `?edit=1` navigeren geeft in deze build een lege view** —
de bewerkmodus moet je met het potlood aanzetten.

**En daardoor is er één ding niet met een echte klik gemeten**: het openen van
de bewerkdialoog via het potlood van de kaart wilde in de laatste sessie niet
meer aanslaan. De dialoog is toen geopend door `ll-edit-card` op de sectie af te
vuren — de weg die Home Assistant zelf gebruikt, maar een SYNTHETISCHE
gebeurtenis. Wat daarna in beeld stond (de overlays, de sortable, de knop) is
wel echt gemeten, en het potlood is eerder vandaag met een echte klik gebruikt
in dezelfde dialoog. **Het is geen bewijs van de bediening.**

**Ook niet apart aangeklikt:** het nieuwe vinkje op de scenekaart. Het is
hetzelfde `ha-form`-veld met dezelfde selector als op de veertien andere
kaarten, waar het wél gemeten is.

## Aannames

- **Bewerken opent geen tweede dialoog.** Bubble Card doet dat wel, met een
  flinke machinerie om zijn eigen dialoog daarna terug te halen. Hier opent het
  bewerkblok in de linkerkolom, waar de instellingen ook staan.
- **De schaduw mag helemaal weg en hoeft niet kleiner.** Een kaart in deze
  familie heeft een rand; die zegt al waar hij begint en ophoudt.

## `git status --porcelain`

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/tabs-card.js
 M src/editor/kaartenlijst.js
 M src/editor/tabs-editor.js
 M src/scene/editor.js
 M src/theme.js
?? docs/voorbeeld-bewerken-en-de-schaduw/
```
