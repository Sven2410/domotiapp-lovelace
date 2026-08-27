# De kaart die stond te trillen, de rondingen die er niet waren, en de auto

Ronde van 27 augustus 2026 — uitgave **0.22.0**. Zeven meldingen, allemaal van
dezelfde dag, direct na 0.21.0.

---

## 1. "Alles is vierkant"

> *"En gebruik rondingen, nu is alles vierkant, het moet in de style van alle
> andere kaarten. Ook de 3D-printerkaart moet in dezelfde style."*

Dit was één typefout, elf keer gemaakt.

De themavariabelen heten `--dac-radius` (20px) en `--dac-radius-sm` (12px). In de
drie nieuwe kaarten, het sleeptimerscherm **én de gestapelde klimaatkaart** stond
`--dac-radius-s`. Die bestaat niet.

En dat is precies het vervelende: **CSS klaagt daar niet over.** Een `var()` die
nergens naar wijst maakt de hele regel ongeldig, de eigenschap valt weg, en er is
geen fout in de console, geen waarschuwing bij het bouwen, niets. Elke
`border-radius` deed het stil niet.

Gerepareerd op alle elf plekken — inclusief de klimaattegels, die er dus sinds
0.19.0 ook al vierkant bij stonden.

### Er is nu een bewaker

`npm run check:css` controleert sinds deze ronde ook dat **elke `var(--dac-...)`
die gebruikt wordt echt bestaat**. Wat een kaart zelf definieert telt mee (de
personenkaart zet zijn eigen `--dac-ring`), en wat JavaScript zet ook
(`--dac-raster` wordt gemeten, niet in het thema gezet).

Bewijs dat hij de fout van vanochtend vangt:

```
$ node scripts/check-css.mjs
FOUT in de CSS van de kaarten:
  - src/cards/auto-card.js: var(--dac-radius-s) bestaat niet in theme.js
```

---

## 2. De printerkaart die stond te trillen

> *"Ik kan geen video maken, maar in mijn 3D-printerpopup shaked de
> 3D-printerkaart de hele tijd, dat lijkt me niet goed."*

Terecht, en dit was de lastigste van de zeven omdat hij zich niet zomaar liet
reproduceren.

### Wat het is

Zijn pop-up is een **Bubble Card** (er staan er veertig in zijn dashboard) met een
vaste breedte van 540px. Daarin ontstaat deze lus:

1. De kaart wordt hoger dan de pop-up → er komt een scrollbar.
2. Die scrollbar neemt breedte weg.
3. Het camerabeeld heeft een `aspect-ratio` van 16:9 — smaller betekent dus
   **lager**.
4. Nu past de kaart weer → de scrollbar verdwijnt → breder → hoger → terug naar 1.

Wat die lus van een rimpeling in een schok verandert is `rasterhoogte.js` zelf:
dat rondt de hoogte af op 56, 120, 184, 248… Eén pixel verschil rond een grens
wordt daar een sprong van **64 pixels**. De kaart springt geen haartje maar een
hele rasterrij op en neer.

De kop van dat bestand beweerde nog dat de lus niet weg kón lopen. Dat klopt
zolang alleen de hoogte verandert — niet als de breedte meebeweegt.

### Het is gereproduceerd

In de testinstance, met de printerkaart in een vak dat zich als een pop-up
gedraagt. Eerst het omslagpunt gezocht:

| breedte | rasterhoogte |
|---|---|
| 500px | 504px |
| 540px | 504px |
| **564px** | **568px** ← hier slaat hij om |
| 580px | 568px |

Toen de scrollbar-lus daaromheen gelegd (breed → 568 wil, past niet → 16px
smaller → 504 → past → weer breed):

```
VÓÓR:  568, 504, 568, 504, 568, 504, …    50 metingen, blijft eeuwig doorgaan
```

### De reparatie

`stabielDoel()` in `rasterhoogte.js` herkent de pendel en zet hem vast op de
**grootste** van de twee. Groot en niet klein, want een kaart die te klein staat
schildert over zijn buurman heen (valkuil 12); een rasterrij te veel kost
hoogstens wat lege ruimte. De vergrendeling gaat er vanzelf weer af zodra de
inhoud écht iets anders wordt.

Dezelfde lus, met de reparatie erin:

```
NA:    568, 504, 568, 568, 568, 568, …    vast na twee wisselingen
       laatste vijftien metingen: allemaal 568px
```

Dit geldt voor **alle** kaarten die kunnen groeien, niet alleen de printer.

### Eén ding dat eerst niet werkte

De eerste versie herkende een pendel als "elke meting verschilt van de vorige".
In de echte browser bleek `meetRaster` een paar keer dezelfde waarde te meten
voordat hij omslaat — `[568, 568, 504, 504, 568]` — waardoor de detectie nooit
aansloeg en de demping ernaast stond te kijken terwijl de kaart doorschudde. Nu
wordt er op **wisselingen** geteld, met een terugblik van twaalf.

---

## 3. De foto van de auto liet zich niet uploaden

> *"Ik kan geen foto uploaden voor de auto."*

De autokaart had `{ image: {} }` in zijn schema — de selector waarmee Home
Assistant zijn picture-kaart een uploadknop geeft. Gemeten in de testinstance:

```
customElements.get("ha-selector-text")     -> gedefinieerd
customElements.get("ha-selector-entity")   -> gedefinieerd
customElements.get("ha-selector-boolean")  -> gedefinieerd
customElements.get("ha-selector-select")   -> gedefinieerd
customElements.get("ha-selector-number")   -> gedefinieerd
customElements.get("ha-selector-image")    -> undefined, ook na 8 seconden
```

`ha-selector` zet het element wél in de DOM — `<ha-selector-image id="selector">`
staat er — maar de klasse komt nooit, en het vak is **nul pixels hoog**. Geen
fout, geen knop, niets. Dezelfde val als valkuil 26 met `dialog-box`.

Er staat nu een **eigen fotokiezer**: een voorbeeldje, een tekstveld voor wie zijn
foto al in `/local/` heeft, een knop *Kies een bestand* die naar
`/api/image/upload` uploadt, en *Wissen*. Precies wat `ha-picture-upload` doet,
maar dan met een element dat er altijd is.

---

## 4. De locatie: een coördinaat naar thuis of afwezig

> *"Mijn 'waar staat de auto'-sensor is een coördinaat:
> {'lat': 51.92909, 'lon': 6.07115, 'alt': 15.0}. Kan je dat converteren naar
> thuis of afwezig? Bepaal dat met de ingestelde locatie van Home Assistant. Maak
> hem universeel dat hij ook kan uitlezen als een sensor wel thuis of afwezig
> toont."*

Alle vier de vormen worden nu gelezen:

1. een tracker die `home` / `not_home` zegt;
2. hetzelfde in woorden — `Thuis`, `Away`, of een zonenaam;
3. een coördinaat in de attributen (`latitude` / `longitude`);
4. een coördinaat in de state zelf — zijn geval.

Bij een coördinaat wordt de afstand tot `hass.config` uitgerekend (haversine) en
vergeleken met een straal van standaard 100 meter, instelbaar in de editor.

Met zijn eigen gegevens, read-only nagemeten (zijn HA staat op 51.9291212 /
6.0712106):

```
ZIJN sensor  -> {"thuis":true,"tekst":"Thuis","meters":5}
Amsterdam    -> {"thuis":false,"tekst":"Afwezig","meters":94331}
tracker home -> {"thuis":true,"tekst":"Thuis","meters":null}
zone werk    -> {"thuis":false,"tekst":"Werk","meters":null}
```

**Eén detail dat het bijna niet deed:** in zijn sensor staat een apostrof tússen
de naam en de dubbele punt (`'lat': 51.92909`). Zonder daarop te rekenen matcht
er niets.

Een tracker die zélf `home` zegt wordt geloofd zonder rekenwerk — die kent de
zone zoals de gebruiker hem heeft ingesteld, en dat weet hij beter dan wij met
een straal eromheen.

---

## 5. De laadstatus deed niets

> *"Wat doet laadstatus? Want als ik daar sensor…elvehcharging in vul, die staat
> nu op NOT_PLUGGED_IN, dan zie ik niks."*

Twee fouten tegelijk, en allebei terecht.

**Het woord was onbekend.** Read-only gemeten op zijn installatie: de sensor staat
op `NOT_PLUGGED_IN`. Dat stond niet in de lijst, dus viel het door naar de
verzamelbak — en die werd niet getoond.

**En "niet aan de lader" stond nergens.** De statusregel toont alleen wat er aan
de hand ís; is er niets aan de hand, dan valt hij door naar de actieradius. Een
veld dat je invult hoort iets te laten zien.

Nu:

- `NOT_PLUGGED_IN` en zijn familie worden herkend als "niet aan de lader";
- de laadstatus staat **altijd** als tegel op de kaart zodra je het veld invult;
- een woord dat we níét kennen komt er zelf op te staan, leesbaar gemaakt:
  `WAITING_FOR_SCHEDULE` wordt "Waiting for schedule". Beter dan een lege kaart,
  en meteen is te zien wélk woord er ontbreekt.

---

## 6. De tracker stond buiten de kaart

> *"En die voertuigtracker wordt buiten de kaart rechts gezet, dat is niet de
> bedoeling. De kaart mag best langer worden maar niet breder."*

De knoppenrij rechtsboven stond op `flex: 0 0 auto` — die kromp niet mee en duwde
zichzelf naar buiten.

Drie dingen veranderd, en het derde is de echte:

1. de kop mag afbreken (`flex-wrap`), dus de knoppen gaan eronder in plaats van
   eruit;
2. de tegels vullen de breedte die er ís en vallen vanzelf op een tweede rij;
3. **de locatie is geen knop meer maar een tegel.** Waar de auto staat is iets om
   te lézen. Tikken opent nog steeds de kaart van Home Assistant.

Plus `overflow: hidden` op de kaart als vangnet.

Gemeten na afloop: `scrollWidth` 498, `clientWidth` 498, en geen enkel element
steekt buiten de kaartrand uit.

---

## Wat niet lukte

- **De shake is niet in zijn eigen pop-up gemeten.** Bubble Card staat niet in de
  testinstance. De lus is nagebouwd met dezelfde ingrediënten — vaste breedte,
  scrollbar, `aspect-ratio` — en dáár is hij gereproduceerd én gerepareerd. Of
  zijn pop-up precies dezelfde lus had, is een aanname; dat het mechanisme klopt
  en nu gedempt is, is gemeten.
- **De fotokiezer is niet met een echte upload beproefd.** Er is geen manier om
  vanuit de browsertool een bestand te kiezen. Wat wél is aangetoond: dat HA's
  eigen selector nul pixels hoog blijft, wat de aanleiding was.
- **Het restpercentage en de actieve tray van de AMS** zijn nog steeds niet
  visueel geverifieerd — daar is een entiteit mét attributen voor nodig.

## Aannames

- **Zijn pop-up gedraagt zich als het nagebouwde vak**: vaste breedte, en een
  scrollbar zodra de inhoud niet past.
- **De trays 2 tot en met 4 hebben dezelfde attributen als tray 1.**
- De thuis-straal van 100 meter is ruim genoeg voor zijn oprit. Klopt dat niet,
  dan is het één veld in de editor.

## Tellingen

- **797 JS-tests** groen, **538 Python-tests** groen.
- `verify`, `check:css` (nu vier bewakers) en `check:registratie`: alle drie OK.
- Versie 0.22.0.

## git status --porcelain

Zie de PR; de werkmap is bij het uitbrengen schoon.
