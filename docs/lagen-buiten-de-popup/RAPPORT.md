# In een pop-up is "vast aan het scherm" niet vast aan het scherm

**Uitgave 0.31.2 — 28 augustus 2026**

Drie schermafdrukken uit zijn eigen huis, met drie zinnen:

> "Ik zie geen pijltje?" (het opslagscherm)
>
> "En als ik op vandaag klik wordt hij blauw en gebeurt er niets."
>
> "En ik zie geen pijltje?" (het vergrote beeld)

---

## Eén oorzaak voor alle drie

Op zijn dashboard staat de camerakaart **in een pop-up van bubble-card**. Op de
testinstance stond hij gewoon op een dashboard, en daar werkte alles.

Het verschil zit in één regel CSS die niet van ons is: **een pop-up die
openschuift heeft een `transform`.** En zodra een voorouder een `transform` (of
een `filter`, of een `backdrop-filter`) heeft, is `position: fixed` niet meer vast
aan het venster maar aan díé voorouder. Die wordt dan het referentievlak.

Wat dat opleverde:

| wat | waarom |
|---|---|
| geen terugknop in het opslagscherm | het scherm vulde de pop-up in plaats van het venster, met zijn kop erbuiten |
| geen terugknop op het vergrote beeld | idem |
| dagenlijst opende niet | hij werd op vensterkoördinaten gezet, maar tegen het vlak van de pop-up gerekend — dus buiten beeld. Je zag alleen de knop blauw worden |

**Dit stond al sinds 26 augustus in `src/vraag.js` opgeschreven**, met precies
dezelfde oplossing en dezelfde reden. Die kennis stond in het ene bestand en is
niet toegepast in het andere; nu staat hij ook in `CLAUDE.md`, als valkuil 34.

## Wat er veranderd is

**Het opslagscherm en het vergrote beeld zijn uit de kaart gehaald** en zijn een
eigen element geworden (`src/cards/camera-archief.js`) dat aan `document.body`
hangt — net als de bevestigingsvraag en het mediazoekscherm. Daar is geen
voorouder meer die het referentievlak kan verzetten.

Dat lost meteen een tweede ding op: het vergrote beeld en de lijst zitten nu in
hetzelfde element, dus ze kunnen elkaar niet meer per ongeluk afdekken. In 0.31.1
was dat wél gebeurd (z-index 9 tegen 10).

**De dagenlijst is juist de andere kant op gegaan: van `fixed` terug naar
`absolute`.** Fixed leek slimmer — het ontsnapt aan elke `overflow` — maar het is
precies het ding dat in een pop-up omvalt. Absoluut binnen de filterrij hangt hij
aan de kaart en schuift hij netjes mee.

Daarvoor moest de kaart wel loslaten wat hij vasthield: **`overflow: hidden` is
van `.card` af.** Dat stond er om het beeld binnen de ronde hoeken te houden, en
knipte de dagenlijst af (vier van de zeven dagen). Het beeld rondt nu zijn eigen
bovenhoeken af.

## Twee dingen die tijdens het meten misgingen

**1. De lijst sloot zichzelf.** Om hem in een scrollende pop-up helemaal in beeld
te krijgen is er een `scrollIntoView({block: "nearest"})` bij gekomen. Maar er
stond nog een luisteraar uit de vorige ronde die het menu bij elke scroll sloot —
en `scrollIntoView` is zelf een scroll. Je klikte, de lijst kwam en verdween in
dezelfde tel. Die luisteraar hoorde bij de vaste stand en is eruit.

**2. `check:css` blokkeerde de build.** Alweer een backtick in een
CSS-commentaar. Dertig seconden, geen kapotte bundel. Dat is de tweede keer op
één dag dat die bewaker zich terugverdient.

---

## Wat er gemeten is, in een echte browser

**Zijn situatie nagebouwd**: de kaart in een container met
`transform: translateY(0px)`, `position: fixed` en `overflow: auto` — precies wat
een bubble-card pop-up is. Zonder die transform was er niets te zien geweest.

**Verse code:**

```
/domotiapp_lovelace/domotiapp-lovelace.js?v=fe03588db221
622726 bytes   sha256 fe03588db2212558e991ad6f4d7486e8f1ca7d15472e3cce41a36d17630288c7
op schijf:     fe03588db2212558e991ad6f4d7486e8f1ca7d15472e3cce41a36d17630288c7
```

**Elke klik echt**, alle `isTrusted: true`, met hun `composedPath()`:

| klik | pad | gevolg |
|---|---|---|
| op "Vandaag" | `button.datum` | de lijst opent **binnen de pop-up**, met alle zeven dagen zichtbaar |
| op "Gisteren" | `span › button[kies] › div.dagmenu` | dag wordt "Gisteren", lijst dicht, strook toont de beelden van 27 aug |
| opslagicoon | `span.opslag` | het scherm vult het **venster** en niet de pop-up, met "‹ Terug" linksboven |
| op een miniatuur | `button.kiek` | het beeld opent erboven, met zijn eigen "Terug" |
| "Terug" op het beeld | `span › button.terug › div.groot` | beeld dicht, opslagscherm blijft staan |
| "Terug" in het scherm | `span › button.terug › div.kop` | terug op het dashboard, scrollen weer vrij |

**Het bewijs dat het scherm buiten de pop-up hangt**, uitgelezen terwijl de
pop-up openstond:

```
hangtAanBody: true
schermRect:   958 × 827
venster:      958 × 827
```

Even groot als het venster, terwijl de pop-up 520 breed is.

**En de kaart zelf is niet stukgegaan door het weghalen van `overflow: hidden`:**
`overflow` staat op `visible`, het beeld houdt zijn ronde bovenhoeken (20px,
nagemeten en op een uitsnede bekeken), en de inhoud past nog steeds:
`scrollHeight 579 <= hoogte 581`.

**Geen fouten in de console.**

## Proeven

```
npm test                   898 groen
npm run check:css          OK
npm run check:registratie  OK
npm run verify             OK — bundel actueel
```

## Wat niet lukte

Niets. Wel viel op dat de dashboardviews van Home Assistant deze sessie
herhaaldelijk niet bouwden in dit browserprofiel (valkuil 21); de metingen zijn
gedaan met de opstelling die daar beschreven staat — de echte kaart met de echte
`hass` in de pagina — die voor dit onderwerp bovendien beter past, want zo is de
pop-up na te bouwen.

## Aannames

- **Een pop-up van een derde partij mag scrollen.** De dagenlijst hangt aan de
  kaart en schuift mee; past hij niet, dan schuift de pop-up hem in beeld. Hem
  ook aan `document.body` hangen zou betekenen dat hij bij het scrollen los boven
  het dashboard blijft staan, en dat is erger.
- **Het opslagscherm hoort het hele venster te vullen**, ook als de kaart in een
  pop-up van 520 pixels staat. Het is een archief met beelden erin; een
  bladzijde van een pop-up is daar te klein voor.

## `git status --porcelain`

```
M  CLAUDE.md
M  custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
M  custom_components/domotiapp_lovelace/manifest.json
AM docs/lagen-buiten-de-popup/RAPPORT.md
A  src/cards/camera-archief.js
M  src/cards/camera-card.js
```
