# Een lampenteller op de badge (0.49.0)

29 september 2026. De vraag: *"en je hebt een domotiapp badge kaart gemaakt. Ik
wil daar een optie kunnen aanvinken in de GUI van dat het een light counter is.
En dat ik dan verlichting kan uitsluiten dat hij niet moet meenemen snap je. Ik
weet niet of dat kan?"*

Dat kan, en zo ziet het eruit.

## Wat er is bijgekomen

In de editor van **DomotiApp Badge** staat bovenaan een schakelaar
**Lampenteller**. Staat die aan:

- wordt de onderste regel van de badge het aantal lampen dat aan staat;
- licht het icoon op in het accent zodra er één brandt, en is het gedempt als
  alles uit is;
- zegt de tooltip (met de muis erboven) WELKE lampen het zijn;
- verschijnt eronder een uitklapblok **Niet meetellen** met een veld **Lampen
  die hij overslaat**, waarin je zoveel lampen kiest als je wilt;
- verdwijnen de velden *Entiteit* en *Onderste regel*, want een teller wijst
  niet naar één ding en heeft geen eigen onderste regel. Wat erin stond blijft
  bewaard, voor als het vinkje er weer af gaat.

Zet je hem aan, dan vult de editor de kop ("Lampen aan") en het icoon (lamp) in
als die nog leeg waren. Dat gebeurt in de editor en niet in de badge, zodat je
de kop daarna gewoon kunt wissen. Een leeg veld wordt uit de config geschrapt
(valkuil 55), en als de badge zelf "Lampen aan" zou verzinnen bij een lege kop,
kreeg je hem nooit meer weg.

In de YAML:

```yaml
type: custom:domotiapp-template-badge
light_counter: true
label: Lampen aan
icon: bulb
light_exclude:
  - light.nachtlampje
```

### Wat hij telt

Een lamp telt mee als hij `on` is, niet in de uitsluitlijst staat, en geen
**groep** is. Een lichtgroep van Home Assistant (herkenbaar aan
`attributes.entity_id`) en een kamer of zone van Hue (`is_hue_group`) tellen
niet mee, anders telt een lamp in een groep dubbel. Zijn oude badge
(`states.light | selectattr('state','eq','on') | list | count`) telde die groepen
wél. In de testinstance scheelt dat 16 tegen 12: vier groepen.

Een lamp die `unavailable` is, telt niet: hij staat niet aan.

Het tellen gebeurt in de browser, uit `hass.states`, en niet via een sjabloon in
Home Assistant. De badge let op alle lampen, dus hij werkt zich bij zodra er
ergens een lamp omgaat.

## Bewijs

### Unittests (`tests/js/badge-lampenteller.test.mjs`)

Zes tests op `lampenAan` en `isLampgroep` in `badge-logica.js`, met een klein
huis: drie spots in een groep, een Hue-kamer, een onbereikbare lamp, een
schakelaar en een sensor. Op de code van vóór deze ronde falen ze alle zes:

```
  ✖ telt de lampen die aan staan, zonder groepen
  AssertionError [ERR_ASSERTION]: lampenAan bestaat niet
  ✖ slaat over wat hij moet overslaan
  ✖ een uitgesloten lamp die niet bestaat, doet niets
  ✖ telt geen onbereikbare lamp, geen schakelaar en geen sensor
  ✖ nul lampen is nul, geen fout
  ✖ herkent een lichtgroep van Home Assistant en een kamer van Hue
ℹ pass 0
ℹ fail 6
```

Dit is nieuw gedrag; de functies bestonden niet. Op de nieuwe code 6 van 6 groen,
de hele suite **1215 JS-tests, alle groen.**

### De badge zelf, in de testinstance

Verse bundel: 864.125 bytes, sha256 gelijk aan die op schijf (service worker en
caches gewist, config entry herladen).

De badge met de hand in de pagina gehangen, met de echte `hass` (valkuil 21), en
vergeleken met een telling uit `hass.states`:

| badge | kop | telling | icoon | kleur |
|---|---|---|---|---|
| teller | Lampen aan | **12** | bulb | `rgb(25, 143, 217)` (accent-hi) |
| teller zonder `light.test_lamp_aanuit` | Zonder ledstrip | **11** | bulb | accent-hi |
| teller zonder kop en zonder icoon | (geen) | **12** | bulb (vanzelf) | accent-hi |

Eigen telling zonder groepen: 12. Zoals het oude sjabloon telde: 16. Alle drie
36px hoog, de maat van Home Assistants eigen badge.

Meebewegen, met echte service-aanroepen:

```
begin                  12 / 11 / 12   accent
test_lamp_dim uit      11 / 10 / 11   accent
alles uit               0 /  0 /  0   rgba(232, 228, 222, 0.38)  (ink-3, gedempt)
alles terug            12 / 11 / 12   accent
```

In de kop van de view (sections-view, na het zichtbaar maken van het tabblad):
"Lampen aan 12" en "Zonder ledstrip 11".

### De editor, met echte kliks

Via de gewone weg: potlood rechtsboven, driepuntsmenu van de badge,
*Bewerken*. Elke klik en elke aanslag is gelogd met een capture-luisteraar op
`window`:

| stap | wat er aankwam | uitkomst |
|---|---|---|
| schakelaar uit | klik `isTrusted: true` op `ha-switch` | `light_counter: false`; Entiteit en Onderste regel verschijnen, het blok verdwijnt |
| kop wissen | `Ctrl+A`, `Delete`, `isTrusted: true` op `textarea` | `label` weg uit de config |
| schakelaar aan | klik `isTrusted: true` op `ha-switch` | `label: "Lampen aan"` komt vanzelf terug; blok *Niet meetellen* verschijnt |
| lamp uitsluiten | klik in het veld, "Ceiling Li" getypt (spatie `isTrusted: true`), resultaat aangeklikt | `light_exclude: ["light.ceiling_lights"]`; voorbeeld van 12 naar 11 |
| spatie in de kop | `End`, " in huis" getypt, beide spaties `isTrusted: true` op `textarea` | `label: "Lampen aan in huis"`; 8 aanslagen, 16 `config-changed` (2 per aanslag, de dialoog geeft ze door), geen enkele verloren |
| Opslaan | klik `isTrusted: true` op `ha-button` | opgeslagen config hieronder |

Wat er in het dashboard staat na opslaan:

```json
{
  "type": "custom:domotiapp-template-badge",
  "light_counter": true,
  "label": "Lampen aan in huis",
  "icon": "bulb",
  "light_exclude": ["light.ceiling_lights"],
  "tap_action": {"action": "more-info"}
}
```

Plat, zonder genest blok (valkuil 33). In de kop: "Lampen aan in huis 11".

Het toetsenlogboek bevat alleen mijn eigen aanslagen
(`a|Delete|Ceiling Li|End| in huis`); er is niets van de eigenaar onderschept
(valkuil 59). De enige fout in de console kwam van de Grammarly-extensie.

## Samenvatting

- De badge heeft een schakelaar **Lampenteller** en een blok **Niet meetellen**.
- Hij telt lampen die aan staan, zonder groepen en zonder wat je uitsluit, en de
  tooltip noemt ze bij naam.
- Kop en icoon worden bij het aanzetten ingevuld en blijven daarna gewoon
  wisbaar.
- CLAUDE.md, valkuil 21: een derde bijstelling. Een verborgen tabblad bouwde
  hier helemaal geen view, ook niet na een herstart. Zichtbaar maken loste het
  meteen op.

## Wat niet lukte

- **Een tik op de teller doet niets.** De editor zet standaard
  `tap_action: more-info` in de config, en zonder entiteit is er niets om te
  tonen. Er verschijnt geen fout en er gaat niets open. Zo gedroeg elke badge
  zonder entiteit zich al, dus het is in deze ronde niet veranderd. Als hij wil
  dat een tik ergens heen gaat (een pop-up met de lampen), is dat één instelling
  bij *Bij tikken*.
- Het eerste deel van de meting is met de badge met de hand in de pagina gedaan.
  Het tabblad stond toen verborgen en Home Assistant bouwde daar geen view
  (valkuil 21). Het tweede deel, in de kop van de view en in de editor, is gedaan
  nadat het tabblad zichtbaar was gemaakt. Dat mocht van de eigenaar.

## Aannames

- Dat groepen niet mee moeten tellen. Hij vroeg het niet, maar zijn eigen
  sjabloon telde ze wél. Een lamp die in een groep zit, zou dan twee keer
  tellen. Wil hij een groep toch als één lamp laten tellen (en de leden niet),
  dan is dat een uitbreiding.
- Dat "Lampen aan" als kop en de lamp als icoon goede startwaarden zijn. Ze
  staan in de velden en zijn meteen aan te passen.

## git status --porcelain

Bij het schrijven van dit rapport, vóór de commit:

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/badges/badge-logica.js
 M src/badges/template-badge.js
?? docs/lampenteller-badge/
?? tests/js/badge-lampenteller.test.mjs
```
