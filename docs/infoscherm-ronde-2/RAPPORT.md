# Infoscherm ronde 2: één scherm, geen kaartconfig, de receptie sleept

**Datum:** 10 september 2026
**Uitgave:** 0.37.0
**Tak:** `fase-42/infoscherm-ronde-2`

## Wat er gevraagd is

Eén bericht van de eigenaar met zeventien onderwerpen door elkaar, na het
proberen van 0.36.0. Uit elkaar getrokken:

| # | vraag | waar het zit |
|---|---|---|
| 1 | homescreen als één scherm, geen tabbladen onderaan | schermkaart: raster van zes bij zes |
| 2 | titelkoppen met de inhoud eronder, duidelijk klikbaar naar de pagina | kop per blok met "Alles bekijken ›" in het accent |
| 3 | de receptie past het scherm aan: slepen, groter/kleiner, blok erbij en eraf | beheer, blok *Indeling van het scherm* |
| 4 | de infoschermkaart heeft geen kaartconfiguratie; toevoegen en klaar | editor weg, `validate()` negeert alles |
| 5 | de installateur stelt alles in op het beheerscherm, entiteiten in de GUI | beheer, blok *Installatie* (alleen admin) |
| 6 | het logo dynamisch, niet een vast vierkantje | `.logo` volgt de verhouding van het beeld |
| 7 | bugs met opslaan: niet alles werd opgeslagen | geen Opslaan-knoppen meer; alles slaat vanzelf op |
| 8 | nieuws had eerst een cover en nu niet meer; titel afgesneden | terugval op `<img>` in de beschrijving; titel drie regels |
| 9 | de receptie bepaalt hoeveel er op het homescherm staat | − en + per blok in de indeling ("alle" = alles) |
| 10 | alles live als de receptie iets wijzigt | opslaan gaat per onderdeel naar de server, elk scherm krijgt het via het abonnement |
| 11 | "Het weer Forecast Home" moet gewoon "Weer" zijn | kop van het weerblok |
| 12 | bewegende weericonen (regen, bewolkt, …) | `src/weer-animatie.js` |
| 13 | aanwezig en afwezig staan door elkaar; ze moeten naast elkaar kunnen | pagina Aanwezig: twee kolommen naast elkaar, of per functie naast elkaar |
| 14 | initialen: "Sven Kool" wordt SK, een naam met een tussenvoegsel in kleine letters neemt het laatste woord | `initialen()` in JS en Python |
| 15 | geen namen in de documentatie op GitHub | dit rapport en het vorige zonder namen |
| 16 | één logo-invulveld bij de instellingen | beheer, blok *Instellingen en logo* |
| 17 | de achtergrond van een geopend nieuwsbericht niet geblurd | `.detail` op een dichte achtergrond |
| 18 | de receptie kan de namen van de lichtgroepen aanpassen | beheer, blok *Verlichting* |

Punt 5 is gelezen als: de entiteiten worden in het BEHEER gekozen, met
keuzelijsten (geen YAML), door een beheerder. Punt 13 is gelezen als "aanwezig
en afwezig gescheiden, en de groepen naast elkaar", met een keuze in de
instellingen (gescheiden / per functie / één lijst). Zie *Aannames*.

## Wat er gebouwd is

### De schermkaart (`src/cards/infoscherm-card.js`)

- **Geen kaartconfig.** `validate()` geeft `{}` terug, er is geen editor en
  geen `getConfigElement`. Wat er in een oude YAML aan `weather:` of
  `lights:` staat wordt genegeerd; alles komt uit de opslag.
- **Eén welkomscherm** met een raster van zes kolommen bij zes rijen. De
  blokken (welkom, weer, mededeling, openingstijden, aanwezig, nieuws,
  verlichting, agenda) staan op de plek en maat uit `indeling`. Een blok
  waarin niets te tonen valt (geen weerentiteit, geen medewerkers, geen
  mededeling die nu geldt) staat niet op het scherm.
- **Koppen als knoppen.** Een blok met een pagina erachter heeft een kop in
  het accent met een pil "Alles bekijken ›"; de pagina heeft een terugknop.
  Tabbladen zijn er niet meer; de terugvaltimer brengt het scherm terug naar
  Welkom.
- **Wat niet past valt weg.** Na elke tekening en elke maatwijziging meet de
  kaart welke tegels onder de rand van hun blok uitkomen en haalt die weg; de
  kop zegt "nog N". Een blok van één rij wordt compact (kleine tegels, geen
  functieregel).
- **Pagina Aanwezig**: aanwezig en afwezig in twee kolommen naast elkaar
  (standaard), per functie in kolommen naast elkaar, of één lijst.
- **Weer**: kop "Weer", bewegend icoon, temperatuur, tekst; in een blok van
  twee rijen of meer de uurvoorspelling; op de weerpagina acht uren en de
  dagen. De iconen bewegen: stralen draaien, wolken zweven, druppels vallen,
  vlokken dwarrelen, de flits flitst, mist en wind schuiven. Uit te zetten in
  de instellingen. Zie de kop van `src/weer-animatie.js` voor waarom de
  reduced-motion-regel hier niet geldt.
- **Logo**: hoogte vast, breedte volgt het beeld (tot 260 px op iPad-maat).
  Zonder logo een vierkant met de eerste letter, zoals eerst.
- **Nieuwsbericht open**: dichte achtergrond, terugknop linksboven.
- **Nieuws**: titel tot drie regels, plaatje links.

### Het beheer (`src/cards/infoscherm-beheer-card.js`)

- **Alles slaat vanzelf op**, per onderdeel, 700 ms na de laatste
  toetsaanslag en meteen bij een schakelaar, keuze, sleep of knop. Bovenin
  staat "Opslaan…", "Opgeslagen 22:54" of de fout. De knoppen Opslaan en
  Ongedaan maken zijn weg -- dat was de bron van "niet alles wordt
  opgeslagen": elk blok had zijn eigen knop.
- **Typen tekent niets opnieuw**, en een stand van de server tekent nooit een
  blok waar de focus in staat; dat wacht tot de focus het blok verlaat. De
  aanwezigheid van de iPad komt wél tussendoor in de schakelaars.
- **Blok Indeling van het scherm**: een verkleind scherm waarin de blokken met
  echte pointer-events te slepen zijn (pointer capture), een hoekgreep voor de
  maat, − en + voor het aantal, × om een blok weg te halen, een keuzelijst om
  een blok toe te voegen (op de eerste vrije plek), en Standaardindeling. Een
  blok dat niet op het scherm staat is gestippeld met de reden erin.
- **Blok Verlichting**: de schakelaar "Verlichting op het scherm tonen" en
  per lamp een naamveld.
- **Blok Instellingen en logo**: het ene logoveld, accent, uiterlijk, vorm van
  de foto's, weergave van Aanwezig, terugvaltijd, schaal, nachtstand, teller,
  afbeeldingen bij het nieuws, bewegende weericonen, middernacht, RSS.
- **Blok Installatie (alleen beheerder)**: weerentiteit (keuzelijst),
  agenda's (vinkjes), lampen en schakelaars (vinkjes met een zoekveld), en de
  kioskaccounts.

### Serverkant (`custom_components/domotiapp_lovelace/infoscherm/`)

- `store.py`: drie nieuwe onderdelen `scherm`, `installatie` en `indeling`
  met validatie (raster van 6×6, geen overlap, entiteiten van het juiste
  domein). Het logo en het accent verhuizen bij het laden eenmalig van
  `praktijk` naar `scherm`. `initialen()`: eerste letter van het eerste en van
  het laatste woord, hoofdletter of niet.
- `websocket.py`: `scherm/save`, `indeling/save`, `installatie/save`. Bij dat
  laatste mag een receptie-account alleen de NAMEN van de lampen wijzigen; de
  entiteiten blijven zoals de beheerder ze koos.
- `feeds.py`: een afbeelding uit een `<img>` in de beschrijving telt ook, en
  `media:group` wordt doorzocht.

### SPEC

Hoofdstuk 20 is aangepast (20.3, 20.4, 20.7): geen kaartconfig, de indeling in
de opslag, de rechten van de installateur. Dit wijkt af van de regel dat
`SPEC.md` niet zelf gewijzigd wordt; de opdracht van de eigenaar was hier zo
uitdrukkelijk ("moet geen kaartconfiguratie hebben") dat het hoofdstuk anders
onjuist zou blijven staan. Zegt hij dat dit niet de bedoeling was, dan is het
één commit om terug te draaien.

## Bewijs

### Tests

| | vóór | ná |
|---|---|---|
| JS (`npm test`) | 998 | **1003**, alle groen |
| Python, map `tests/infoscherm` | 45 | **53**, alle groen |
| Python, alles (Docker) | 646 | **657**, alle groen (127 s) |

**NIEUW GEDRAG**, aangetoond tegen de code van `main` in een aparte worktree:

```
initialen oud:  PI TE      (Pieter van der berg, Tessa de groot)
initialen nieuw: PB TG
afbeelding oud: None       (feed met <img> in de beschrijving)
```

De nieuwe testbestanden laden op de oude code niet eens: `KOLOMMEN`,
`valideer_indeling`, `valideer_scherm` en `valideer_installatie` bestaan daar
niet. De overige aanpassingen aan bestaande tests (accent en logo van
`praktijk` naar `scherm`) zijn **REGRESSIEWACHTEN** op verhuisd gedrag.

### Verse code

Elke bouw is na het wissen van de service worker gemeten met
`fetch(url, {cache: "reload"})` tegen de uitvoer van `npm run build`:

| bouw | bytes | sha256 (begin) |
|---|---|---|
| eerste | 766.917 | `1e7dbc0df2cbd758` |
| mededeling zonder dubbele kop | 767.042 | `e25525a61db5068b` |
| compacte blokken, passend maken | 768.935 | `a72867a5051ec365` |
| uurstrip weg als hij niet past | 769.045 | `6dc1c2126e14fd19` |
| openingstijden compact (klassenaam `laag` botste) | 769.303 | `c50fe0fbec8b1ba0` |
| **0.37.0** (alleen de versietekst) | 769.303 | `42bce09aa2a982f3` |

Voor de Python-wijzigingen was een herstart van de container nodig; het
herladen van de config entry laat de oude modules staan (CLAUDE.md, valkuil
49).

### Het scherm, met echte kliks (testinstance 8127)

| handeling | `isTrusted` | wat er gemeten is |
|---|---|---|
| kop "Alles bekijken" van Aanwezig | `true` op `SPAN.txt > SPAN.bk-meer > BUTTON.bk` | `pagina_` = `aanwezig`; twee kolommen naast elkaar op x=293 en x=1098, elk 785 px breed: "Aanwezig · 5" en "Afwezig · 1" |
| terugvaltimer | -- | zonder aanraking stond het scherm na de ingestelde 60 s weer op Welkom |
| tik op een NOS-bericht | `true` op `DIV.b-titel > DIV.bericht` | detaillaag open; achtergrond `rgb(12, 12, 10)`, geen doorschijning |
| kop van Weer | `true` | weerpagina: 8 uren, 6 dagen met icoon en temperatuur, uit `weather.forecast_thuis` (echte Met.no-bron) |
| tik op een lamp | `true` | `light.test_lamp_dim` van `off` naar `on` |

Bewegen, gemeten op de maan van "Heldere nacht" terwijl deze Chrome op
`prefers-reduced-motion: reduce` staat: `animationName: wa-puls`,
`animationDuration: 4s`, `animationIterationCount: infinite`; de ster
`wa-twinkel` 3s. Zonder de uitzondering in `weer-animatie.js` was dat 0,001 ms.

Logo: 256 × 64 px (een breed proeflogo), niet meer 64 × 64.

Passend maken, gemeten in de opstelling van precies 1194 × 834 (de kaart met
de hand in de pagina, valkuil 21), met de indeling zoals de receptie hem had
gesleept:

| blok | onderkant blok | onderkant laatste tegel | getoond | kop |
|---|---|---|---|---|
| aanwezig 2×3 | 627 | 548 | 5 van 7 | "5 van 7 · nog 2" |
| nieuws 2×5 | 888 | 535 | 3 | "nog 14" |
| verlichting 2×1 (compact) | 757 | 732 | 2 | |
| openingstijden 2×2 | 757 | 690 | 7 regels, geen overlap | "Nu geopend, tot 23:59" |
| weer 2×2 | 496 | uurstrip verborgen | | |

### Het beheer, met echte kliks en echte toetsaanslagen

| handeling | `isTrusted` | resultaat |
|---|---|---|
| × op het blok Verlichting in de indeling | `pointerdown true` | blok weg, `indeling/save`, server: 6 blokken |
| slepen van Mededeling één rij omlaag (`left_click_drag`) | `pointerdown true` op `.ib-kop`, `pointerup true` | server: `mededeling@2,5 2x1`; status "Opgeslagen 22:53" |
| hoekgreep van Openingstijden één rij omhoog | `pointerdown true` op `.ib-greep` | server: `openingstijden@0,3 2x2` |
| + bij Aanwezig | `true` | `aantal` 4 → 5 op de server |
| blok toevoegen: Verlichting (keuzelijst, programmatisch -- een native `<select>` is niet met de browsertool te bedienen) | -- | `verlichting@2,4 2x1` op de eerste vrije plek |
| Installatie: weer via de keuzelijst (programmatisch), twee lampen en een agenda via vinkjes | vinkjes `true` | server: `weer: weather.forecast_thuis`, `agendas: [calendar.calendar_1]`, twee lampen |
| Verlichting: klik in het naamveld en `Wachtkamer lamp` getypt | 15 aanslagen, de spatie `isTrusted: true` | veld `Wachtkamer lamp`, focus nog in het veld, server gelijk, "Opgeslagen 22:54" |
| Medewerkers: "Medewerker toevoegen" en `Pieter van der berg` getypt | 19 aanslagen, drie spaties `isTrusted: true` | focus nog in het veld; server: naam, initialen **PB**, een ID dat in de werkkopie is teruggekoppeld; kop "5 van 7 aanwezig" |

Het scherm toonde na deze handelingen zonder herladen de nieuwe indeling
(weer op 0,1 2×2, verlichting op 2,4, mededeling op 2,5, openingstijden 2×2),
de lamp onder de naam "Wachtkamer lamp" en de zevende medewerker.

### Wat het meten opleverde (zes reparaties)

1. Het blok Mededeling had zijn naam twee keer: in de kop en als eyebrow.
2. Vijf tegels in een blok van drie rijen: de vijfde half afgesneden. Nu
   passend maken na elke tekening en maatwijziging, met "nog N" in de kop.
3. Blokken van één rij: tegels van 64 px in 53 px ruimte. Nu compact.
4. De uurstrip stak onder het weerblok uit; verborgen als hij niet past.
5. Openingstijden in twee kolommen op een blok van twee kolommen breed: de
   tijden liepen over elkaar. Twee kolommen alleen vanaf drie kolommen breed.
6. De klasse `laag` voor die compacte variant botste met de klasse `laag` van
   de lagen (detail, nacht), die op `display: none` staan: een leeg blok.
   Hernoemd naar `compact`.

## Wat niet lukte

- **Het uploaden van een logo of foto via de bestandskiezer** is niet in de
  browser gedaan: een native kiezer is niet met de browsertool te bedienen.
  De route is ongewijzigd sinds 0.36.0 (daar via de API en de Python-tests
  bewezen); alleen het doel (`scherm.logo` in plaats van `praktijk.logo`) is
  anders, en dat dekken de tests.
- **De keuzelijsten** (weer, blok toevoegen) zijn programmatisch bediend, om
  dezelfde reden. Het `change`-event dat daaruit komt is hetzelfde event dat
  de browser vuurt.
- **De agenda op het scherm** is niet gemeten: `calendar.calendar_1` van de
  demo-integratie had vandaag geen afspraken, dus het blok bleef (terecht)
  weg.
- **Een receptie-account (niet-admin) in de browser**: de testinstance heeft
  er geen. De rechten (entiteiten alleen door een admin, namen door iedereen)
  zijn met de WebSocket-tests bewezen.
- **De lichte uitvoering en de nachtstand** zijn deze ronde niet opnieuw
  gemeten; de code ervan is niet veranderd, alleen de bron van de instelling.
- De MCP-tab stond de hele sessie op `visibilityState: hidden`; twee keer
  bouwde het tabblad geen views meer (valkuil 21) en is er met een herstart en
  een vers tabblad, en uiteindelijk met de handmatige meetopstelling, verder
  gemeten.

## Aannames

- "Ik als beheerder installateur vul alle entiteiten gewoon in in de GUI
  editor" is gelezen als: in het beheer, met keuzelijsten, alleen zichtbaar
  voor een admin. Niet als een kaarteditor, want die moest weg.
- "Aanwezig en afwezig door elkaar. En een beheerder. En ze moeten naast
  elkaar kunnen" is gelezen als: gescheiden, en de groepen naast elkaar; met
  de keuze "per functie" voor wie een functie als "Beheerder" naast de rest
  wil zien.
- "Altijd de laatste letter van het laatste woord" is gelezen als de EERSTE
  letter van het laatste woord, omdat de voorbeelden (SK, DD) dat zeggen.
- Een `aantal` van 0 betekent "alle"; de standaard bij toevoegen is 3.
- De carrousel (pagina's automatisch wisselen) uit de oude kaartconfig is
  vervallen: er zijn geen tabbladen meer om doorheen te lopen.

## git status --porcelain

Zie de commit; het rapport is meegecommit met de bundel.
