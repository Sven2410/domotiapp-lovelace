# 0.66.0: het lichte thema gelijk aan het paneel van de Coach

## De vraag

Sinds 0.54.0 hebben de kaarten een licht thema: een zachtgrijs vlak op de
pagina, met een haarlijn. Het paneel van de Coach kreeg in v0.113.0 een eigen
licht thema, met witte tegels met een rand en net andere kleuren. Gevraagd op
14 oktober 2026 of kaarten en paneel in licht hetzelfde moeten zijn. De
eigenaar: *"ja gelijktrekken"*.

## Wat er veranderd is

**De lichte set is die van de Coach.** Bron: `lightTokens` in
`domotiapp-coach/.../frontend/src/theme.js`, gelezen op origin/main
(v0.119.1). De set zelf is van v0.113.0.

| Token | Was (0.54.0 tot 0.65.1) | Nu, gelijk aan de Coach |
|---|---|---|
| `--dac-bg` (grond van een scherm over de pagina) | `#f6f5f2` | `#f1f0ec` |
| `--dac-surface` (het kaartvlak) | `rgba(20,20,10,.045)`, zachtgrijs | `#ffffff`, wit |
| `--dac-surface-hi` | `rgba(20,20,10,.08)` | `rgba(20,20,15,.045)` |
| `--dac-border` / `-hi` | `rgba(20,20,10,.11/.22)` | `rgba(20,20,15,.11/.22)` |
| `--dac-ink` | `#1a1a17` | `#1c1b18` |
| `--dac-ink-2` / `-3` | 0,68 / 0,50 | 0,74 / 0,60 (meer contrast) |
| `--dac-accent-hi` | `#0672a8` | `#0a6aa6` |
| `--dac-accent-glow` | `rgba(2,111,161,.22)` | `rgba(10,106,166,.20)` |
| `--dac-good` / `warn` / `bad` | `#0b850b` / `#b07400` / `#c62f2f` | `#0a8a0a` / `#946200` / `#c63131` |
| `--dac-tint` (bij de Coach `--dac-veil`) | `20, 20, 10` | `20, 20, 15` |

`--dac-bg-raise`, `--dac-accent` en `--dac-accent-soft` waren al gelijk.

**Eén bewuste afwijking: geen slagschaduw.** De Coach geeft een tegel in licht
een zachte slagschaduw. Hier heeft een kaart in donker al sinds 0.14.0 geen
slagschaduw (valkuil 22): onder een kaart van één rij werd dat een vlek, en
drie kaarten onder elkaar gaven banden. Dat geldt op wit net zo; de rand doet
het werk.

**Een nieuw token: `--dac-hover`.** Zeven hover-regels kleurden een vlak zonder
eigen rand met `var(--dac-surface)`:

- een regel in het menu van de navbalk, en een knop in de navbalk;
- een rij op de entiteitenkaart;
- een persoon;
- "toevoegen" op de tabbladenkaart;
- het dagmenu van de camera;
- een knop in de bevestigingsvraag.

In licht is dat wit op een witte kaart, en dan zie je de hover niet meer. Ze
zijn nu `var(--dac-hover)`. In donker is dat `var(--dac-surface)`, precies wat
er stond; in licht is het `var(--dac-surface-hi)`, de tint van de Coach.

**Bewaker 6 in `check:css`**: een vlak met `var(--dac-surface)` als achtergrond
moet een rand hebben. Kennis in CLAUDE.md is geen bewaking (valkuil 34).
Tegen de bron van 0.65.1 vindt hij precies de zeven:

```
  - src/cards/camera-card.js:394: var(--dac-surface) als achtergrond zonder rand -- in licht is dat wit op wit
  - src/cards/entities-card.js:158: ...
  - src/cards/navbar-card.js:218: ...
  - src/cards/navbar-card.js:306: ...
  - src/cards/person-card.js:95: ...
  - src/cards/tabs-card.js:195: ...
  - src/vraag.js:89: ...
```

Op deze tak is hij stil.

**`LICHT_VLAK`** in `thema-logica.js` (waartegen de lampkleur gerekend wordt)
is nu wit.

**Wat niet meedoet: het infoscherm.** Dat heeft een eigen lichte uitvoering
met een eigen keuze Uiterlijk in het beheer, en hangt bij een klant aan de
muur. Er is gevraagd naar de kaarten, en het infoscherm is daarom niet
aangeraakt.

## Een gevolg om te weten: Licht vastzetten maakt de kaart nu dicht

Tot 0.65.1 stond in CLAUDE.md dat Licht of Donker vastzetten de kaart niet dicht
maakt. Een foto als achtergrond kwam door de kaart heen; daar is vastzetten
voor. Met een wit kaartvlak is dat in licht niet meer zo:

- **Licht vastgezet op een donkere pagina:** een witte kaart, goed leesbaar.
  Eerst was die daar bijna onzichtbaar.
- **Licht vastgezet op een foto:** een witte kaart, zonder de foto erdoor.

Donker vastzetten blijft doorschijnend. Dit volgt uit "gelijktrekken" en
staat zo in CLAUDE.md. Wil de eigenaar de foto ook in licht door de kaart zien,
dan is dat een eigen keuze (een witte kaart op bijvoorbeeld 85%). Dan wijkt hij
weer af van het paneel.

## Bewijs

### Tests

`tests/js/thema-contrast.test.mjs`:

- **NIEUW GEDRAG (0.66.0), "de lichte waarden zijn die van de Coach":** elke
  waarde uit de tabel hierboven naast die van de Coach.
  - Daarbij: de schaduw blijft `none` (REGRESSIEWACHT, met opzet anders), en
    een hover is in licht `var(--dac-surface-hi)`.
  - Drie tokens waren al gelijk; die tests heten REGRESSIEWACHT.
- **"de kaart is wit, en de rand zet hem af van een witte pagina"** vervangt
  "de kaart is te onderscheiden van wit" uit 0.54.0. Die beschreef het
  zachtgrijze vlak, en dat is met opzet weg.
- **De contrasttests** (`ink` 7:1, `ink-2` 4,5:1, accent, status, lamp)
  slagen allemaal tegen het witte vlak.
- **REGRESSIEWACHT donker:** er is `--dac-hover: var(--dac-surface)` bij
  gekomen.

Tegen 0.65.1 (`git archive main src tests`, main = 10bde55):

```
ℹ tests 57
ℹ pass 40
ℹ fail 17
  ✖ --dac-accent-glow is rgba(10, 106, 166, 0.20), net als in het paneel
  ✖ --dac-accent-hi is #0a6aa6, net als in het paneel
  ✖ --dac-bad is #c63131, net als in het paneel
  ✖ --dac-bg is #f1f0ec, net als in het paneel
  ✖ --dac-border is rgba(20, 20, 15, 0.11), net als in het paneel
  ✖ --dac-border-hi is rgba(20, 20, 15, 0.22), net als in het paneel
  ✖ --dac-good is #0a8a0a, net als in het paneel
  ✖ --dac-hover is var(--dac-surface)
  ✖ --dac-ink is #1c1b18, net als in het paneel
  ✖ --dac-ink-2 is rgba(28, 27, 24, 0.74), net als in het paneel
  ✖ --dac-ink-3 is rgba(28, 27, 24, 0.60), net als in het paneel
  ✖ --dac-surface is #ffffff, net als in het paneel
  ✖ --dac-surface-hi is rgba(20, 20, 15, 0.045), net als in het paneel
  ✖ --dac-tint is 20, 20, 15, net als in het paneel
  ✖ --dac-warn is #946200, net als in het paneel
  ✖ NIEUW GEDRAG (0.66.0): de kaart is wit, en de rand zet hem af van een witte pagina
  ✖ een hover zonder eigen rand is in licht een tint, geen wit op wit
```

De 40 die daar slagen zijn de tests van 0.54.0, plus vier gelabelde
regressiewachten.

Op deze tak: **1711 JS-tests groen**. `npm run verify`, `check:registratie`,
`check:css` (met bewaker 6) en `check:controls` zijn OK.

### In Home Assistant

De testinstance, view `thema` op `kaart-test` (36 kaarten, alle soorten), met
het lichte standaardthema van Home Assistant:

- **Voor** (bundel `?v=901a5abcb271`, 0.65.1): zachtgrijze kaarten op de
  pagina.
- **Na** (bundel `?v=589dc1e37726`, de sha256 van de gebouwde bundel): witte
  kaarten met een rand. Er waren twee schermafdrukken. Die staan niet in de
  repo: er staan beelden van de demo-mediaspelers op.
- **Gemeten op een kaart:**
  - het kaartvlak is `rgb(255, 255, 255)`;
  - de rand is `rgba(20, 20, 15, 0.11)`;
  - er is geen `box-shadow`;
  - `--dac-ink` is `#1c1b18`, `--dac-warn` `#946200` en `--dac-accent-hi`
    `#0a6aa6`.
- **Wit op wit, nagezocht in de pagina** (41 elementen van de familie, allemaal
  `dac-thema="licht"`): elk element met een witte achtergrond, groter dan
  14 px, zonder rand en zonder schaduw. Gevonden: **geen enkel**.
- **Hover, met een echte muis** op "Licht" in de navbalk: de knop krijgt
  `rgba(20, 20, 15, 0.043)` (de overgang naar 0,045). Die hover is te zien.
- **Donker daarna, ter controle:**
  - het kaartvlak is `rgba(255, 255, 255, 0.04)` en de rand
    `rgba(232, 228, 222, 0.1)`;
  - de haarlijn bovenlangs staat er nog;
  - `--dac-hover` is `rgba(255, 255, 255, 0.038)`, het kaartvlak zoals het
    stond.

  Niets verschoven.

Het thema van de testinstance staat weer op het standaard donkere.

## Samenvatting

- In licht zijn de kaarten nu wit met een rand, met de kleuren van het
  coach-paneel, op de slagschaduw na (valkuil 22).
- Een nieuw token `--dac-hover`, zodat een hover in licht te zien blijft.
- Bewaker 6 in `check:css` houdt wit op wit tegen.
- Donker is niet veranderd.
- Licht vastzetten maakt de kaart nu dicht: dat staat hierboven, voor de
  eigenaar.
- 1711 JS-tests zijn groen; in Home Assistant gemeten in licht en donker.

## Wat niet lukte

- **Het paneel van de Coach** staat niet in de testinstance (daar draait een
  nep-coach), dus kaart en paneel stonden niet naast elkaar in beeld. De
  gelijkheid is aangetoond op de waarden: de test, en de gemeten kleuren.
- **Niet elk onderdeel is in een open toestand bekeken.** Het submenu van de
  navbalk, de bevestigingsvraag en het mediazoekscherm zijn niet geopend. Wel
  geldt bewaker 6 voor de hele bron, en het hoveren in het submenu gebruikt
  dezelfde `--dac-hover`.
- Niet op een telefoon gemeten.

## Aannames

- Dat "gelijktrekken" over de kaarten gaat en niet over het infoscherm, dat een
  eigen instelling heeft.
- Dat de slagschaduw van de Coach hier niet hoort, om de reden die de eigenaar
  zelf ooit gaf (de vlekken onder kaarten van één rij).

## git status --porcelain

Vóór de commit:

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M scripts/check-css.mjs
 M src/cards/camera-card.js
 M src/cards/entities-card.js
 M src/cards/navbar-card.js
 M src/cards/person-card.js
 M src/cards/tabs-card.js
 M src/thema-logica.js
 M src/theme.js
 M src/vraag.js
 M tests/js/thema-contrast.test.mjs
?? docs/licht-als-de-coach/
```

Na de commit: leeg.
