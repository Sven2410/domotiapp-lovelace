# Tabbladen, met de keuze per apparaat

25 augustus 2026.

> "Dan wil ik dat je ook een navigatiekaart maakt die ik kan gebruiken in een
> bubble kaart. Ik gebruik nu simple tabs integratie als je die kan zien. Ik wil
> dat zelfde principe ook in mijn thema. Wel apparaat afhankelijk dus als ik van
> woning naar weer switch moet hij niet op een andere telefoon naar weer
> switchen. Als het goed is kan dat gewoon ook zonder iets in de GUI in te
> stellen voor apparaat afhankelijk"

---

## Wat er nu staat

`custom:domotiapp-tabs-card`: een rij tabbladen met per tab een kaart erachter.
De rij is een pil in de vormtaal van de familie; de actieve tab draagt de
accentkleur, want je moet kunnen zien waar je bent.

## Zijn bestaande config werkt

Zijn `simple-tabs` uitgelezen van het echte dashboard:

```yaml
type: custom:simple-tabs
default_tab: 1
tabs:
  - title: Woning
    icon: mdi:home-thermometer-outline
    card: { type: vertical-stack, cards: [...] }
  - title: Weer
    icon: mdi:weather-sunny-alert
    card: { type: vertical-stack, cards: [...] }
```

Die vorm is aangehouden. `title` werkt naast `name`, `card` naast `cards`, en
een `mdi:`-icoon werkt naast een van ons. Alleen het `type` hoeft om. Een lijst
onder `cards` wordt een `vertical-stack`; één kaart in die lijst blijft gewoon
die kaart, want een stack van één is een stack die niets doet.

## De eis die de vorm bepaalt: de keuze hoort bij het apparaat

Dat sluit alles uit wat server-side is. Een `input_select` per apparaat is voor
iedereen gelijk; een sleutel die hij zelf invult is precies het instellen dat er
niet mocht zijn. Wat overblijft is `localStorage`: per browser, overleeft een
herlading, en er is niets voor in te vullen.

**De sleutel wordt afgeleid uit de namen van de tabs.** Een Lovelace-kaartconfig
heeft geen id, en de namen zijn wat een kaart identificeert. Twee
tabbladenkaarten op één dashboard krijgen dus verschillende sleutels, en
dezelfde kaart vindt zichzelf terug na een herlading. Hernoem je een tab, dan
begint elk apparaat één keer opnieuw bij de eerste — dat is de prijs, en die is
lager dan een veld dat iemand moet invullen. Het staat ook zo in de editor.

## Gemeten in de echte instance

```
klik op "Weer"          isTrusted: true
actief daarna           Woning:false  Weer:true  Muziek:false
localStorage            dac-tabs:woning|weer|muziek = "1"

na een volledige herlading
  actief                Woning:false  Weer:true  Muziek:false     <- onthouden

na het wissen van de opslag (= een vers apparaat)
  actief                Woning:true   Weer:false Muziek:false     <- de standaard
  localStorage          null                                      <- niets weggeschreven
```

Dat laatste is de andere helft van de eis: een apparaat dat nog nooit gekozen
heeft, krijgt de standaard en niet de keuze van een ander. De unittests toetsen
hetzelfde met twee losse opslagobjecten naast elkaar.

En de hoogte:

```
kaart met de tab "Weer" open   376px = 6 rasterrijen (6*56 + 5*8)
opgegeven min_rows             6
gat met de kaart eronder       8px, precies de rastertussenruimte
```

De kaart groeit dus mee met de tab die openstaat, en loopt niet over zijn
buurman heen — dezelfde gemeten ondergrens als in de vorige ronde.

## Drie keuzes in de bouw, met hun reden

**De kindkaarten worden lui gebouwd.** Zes tabs is zes kaarten die je bijna
nooit ziet, en elke kaart abonneert zich op zijn eigen entiteiten. Een tab wordt
gebouwd bij zijn eerste bezoek en daarna bewaard: wisselen blijft gratis, en wat
je nooit opent kost niets.

**`set hass` is overschreven.** `DacCard` roept `paint()` alleen aan als een
entiteit uit `watched()` verandert. Deze kaart heeft er zelf geen — maar zijn
kinderen wel, en die moeten elke nieuwe `hass` krijgen. Zonder dat staat er een
tabbladenkaart met kaarten erin die nooit meer bijwerken.

**De rij tabs schuift in plaats van af te breken.** Een tweede regel knoppen zou
de hoogte van de kaart bij elke wissel veranderen.

## De fout die hier gemaakt en gemeten is

`bouw_()` zet een `null` in de kindermap als bouw-vlag, zodat twee kliks vlak
achter elkaar niet twee keer bouwen. De `set hass` liep daar overheen:
`TypeError: Cannot set properties of null (setting 'hass')`, en de hele view
bleef leeg. Gevonden in de console van de echte instance, niet in een test —
een lege view ziet er precies zo uit als een view die nog aan het bouwen is.

## Wat de editor wel en niet kan

Wel: een tab bijmaken, hernoemen, een icoon geven, verplaatsen, weggooien; de
standaardtab, de uitlijning, namen aan of uit, achtergrond weglaten en de kleur.

Niet: de kaart kiezen die in een tab zit. Home Assistant heeft daar een
component voor — dezelfde kaartkiezer als in de bewerkdialoog — maar die is
intern en niet aan te roepen zonder je vast te maken aan een versie. Een half
nagemaakte kaartkiezer zou minder kunnen dan de echte en bij de eerste wijziging
in Home Assistant breken. De inhoud van een tab gaat dus via **Code-editor
weergeven**, en dat staat er met zoveel woorden bij in plaats van dat je het
moet ontdekken. Bij het bewerken van naam of icoon blijft de kaart in die tab
gewoon staan.

## Tests

```
npm test                   454 tests, 454 pass, 0 fail
npm run check:registratie  OK
npm run check:controls     OK
npm run verify             OK
```

`tests/js/tabs-logica.test.mjs` is nieuw (**NIEUW GEDRAG**) en toetst onder meer
de twee apparaten naast elkaar, een onthouden tab die niet meer bestaat, rommel
in de opslag, en een `localStorage` die gooit zoals in een privé-venster.

## Wat niet lukte

- Twee **echte** apparaten naast elkaar zijn niet getest; er is één browser.
  De ene helft is in de browser gemeten (onthouden over een herlading) en de
  andere met een gewiste opslag (een vers apparaat krijgt de standaard). De
  unittest zet twee losse opslagobjecten naast elkaar en toetst precies dat
  onderscheid.

## Aannames

- `default_tab` telt vanaf **1**. Dat is wat iemand bedoelt met "de tweede tab".
  Of `simple-tabs` het net zo telt, is niet na te gaan zonder zijn bron; staat
  jouw kaart straks op de verkeerde tab, dan is het dat getal.
- De inhoud van een tab wordt in deze editor niet bewerkt maar wél bewaard: een
  naamswijziging gooit de kaart erin niet weg.
