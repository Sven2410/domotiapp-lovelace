# Een dagenlijst in plaats van een kalender, en twee terugknoppen

**Uitgave 0.31.1 — 28 augustus 2026**

> "Verwijder dat bericht beneden van de opslag, zeg alleen dat ze een week
> bewaard worden etc. Dat www folder enz eruit halen, die tekst. En ik heb geen
> terug knopje om uit het menu te gaan. Hetzelfde als ik een snapshot aanklik,
> dan moet ik er buiten klikken — moet de klant maar net weten. Ik wil geen
> kalender trouwens, gewoon op vandaag klikken en dan kalender, maar nu staat er
> een hele kalender. Ik wil gewoon de kalender van een week terug, want dat wordt
> ook maar zo gebruikt. Beelden van 3 weken geleden zijn toch al gewist, dus
> onnodig een hele kalender."

Vier dingen, allemaal binnen een uur na 0.31.0.

---

## 1. Geen kalender meer, maar de zeven dagen die er zijn

Het kalendericoon is weg. **Eén tik op de dag** — "Vandaag", "Gisteren", "wo 26
aug" — opent een lijstje van zeven dagen, met erachter hoeveel beelden er die dag
liggen:

```
Vandaag      3
Gisteren     5
wo 26 aug    —
di 25 aug    —
ma 24 aug    —
zo 23 aug    —
za 22 aug    —
```

Zeven, en geen dag meer: de bewakingsmotor bewaart een week, dus een dag
daarbuiten aanwijzen levert per definitie een lege strook op. Zijn redenering
klopt en staat nu als constante in de code, met de opmerking erbij dat die mee
moet als de bewaartermijn ooit verandert.

**Het aantal erachter is wat je in een kalender komt zoeken.** Je ziet in één
blik op welke dag er iets staat, zonder te klikken.

Twee dingen die er tijdens het meten bij kwamen:

- **De lijst wordt niet meer afgeknipt.** Hij hing eerst binnen de kaart, en die
  staat op `overflow: hidden` voor de ronde hoeken van het beeld: van de zeven
  dagen waren er vier te zien. Hij hangt nu vast aan het venster, klapt omhoog
  als hij onderaan niet past, en gaat dicht zodra je scrollt.
- Tikken buiten de lijst sluit hem, en de dagknop licht op zolang hij openstaat.

## 2. Een terugknop, en niet een kruisje

> "Ik heb geen terug knopje om uit het menu te gaan."

Er stond wel een kruisje rechtsboven, maar dat moet je maar net zien — en het
opslagscherm ligt over je hele dashboard, dus wie het niet vindt zit vast. Nu
staat er **linksboven een knop met een pijl en het woord "Terug"**.

## 3. Hetzelfde op een vergroot beeld

> "Hetzelfde als ik een snapshot aanklik, dan moet ik er buiten klikken — moet de
> klant maar net weten."

Klopt. Buiten het beeld tikken sluit het nog steeds, maar er staat nu ook een
**"Terug"** linksboven.

**En daar kwam een fout mee boven water.** Het vergrote beeld opende *achter* het
opslagscherm — `z-index` 9 tegen 10. Je klikte op een snapshot en er gebeurde
zichtbaar niets. Nu ligt het beeld erboven (14 tegen 12), en sluiten brengt je
terug in het opslagscherm in plaats van naar het dashboard.

## 4. De tekst onderaan is één regel

Weg:

> De beelden staan als losse jpeg's in `<config>/domotiapp_lovelace/beelden/`,
> niet in `www/` — daar zou iedereen op je netwerk erbij kunnen zonder in te
> loggen...

Ervoor in de plaats:

> Snapshots blijven een week staan en verdwijnen daarna vanzelf, oudste eerst.
> Per camera worden er hoogstens 500 bewaard.

Terecht: waar de bestanden staan is iets voor wie de integratie installeert, niet
voor wie naar zijn oprit kijkt. Dat verhaal staat in
`docs/opslagscherm-en-verwijderen/RAPPORT.md` en in de helptekst van de editor.

---

## Wat er gemeten is, in een echte browser

**Verse code:**

```
/domotiapp_lovelace/domotiapp-lovelace.js?v=e1680317a61c
622517 bytes   sha256 e1680317a61c8bc2ef57e582886b227fc2611ab69d2dcff9b5f45fb95780d733
op schijf:     e1680317a61c8bc2ef57e582886b227fc2611ab69d2dcff9b5f45fb95780d733
```

**Elke handeling met een echte klik**, alle `isTrusted: true`, met hun
`composedPath()`:

| klik | pad | gevolg |
|---|---|---|
| op "Vandaag" | `button.datum › div.rij` | de lijst opent met **zeven** dagen: Vandaag 3, Gisteren 5, en vijf dagen met "—" |
| op "Gisteren" | `span › button[kies]` | dag wordt "Gisteren", lijst dicht, strook toont de 5 beelden van 27 aug |
| opslagicoon | `span.opslag` | het scherm opent, met linksboven "‹ Terug" |
| op een miniatuur | `img › button.kiek › div.dagraster` | het beeld opent **boven** het opslagscherm, met "Oprit · Auto oprit · vr 28 aug 11:22" eronder |
| "Terug" op het beeld | `span › button.gterug › div.groot` | het beeld sluit, het opslagscherm blijft staan |
| "Terug" in het scherm | `span › button.aterug › div.akop` | terug op het dashboard, en het scrollen van de pagina is weer vrij |

**De voettekst, uitgelezen uit de kaart:**

```
Snapshots blijven een week staan en verdwijnen daarna vanzelf, oudste eerst.
Per camera worden er hoogstens 500 bewaard.
```

**Er staat geen kalendericoon en geen datumveld meer in de kaart** —
`querySelector(".kalender")` en `querySelector(".datumveld")` geven allebei
`null`.

**Inhoud past in de kaart**, en **geen fouten in de console**.

## Proeven

```
npm test                   898 groen
npm run check:css          OK
npm run check:registratie  OK
npm run verify             OK — bundel actueel
```

Eén test minder dan in 0.31.0: `alsDatumveld`/`uitDatumveld` zijn met de kalender
meegegaan. Ze hadden geen gebruiker meer, en een geteste functie die nergens
wordt aangeroepen is een geteste functie die niets bewijst.

## De bewaker van vanochtend heeft zich meteen bewezen

In 0.31.0 is `check:css` bij `npm run build` gezet, omdat een backtick in een
CSS-commentaar de hele bundel had omgegooid. Bij het schrijven van deze ronde
gebeurde precies hetzelfde — `` `fixed` ``, `` `absolute` `` en
`` `overflow: hidden` `` in een nieuw commentaar — en nu **stopte het bouwen
meteen**:

```
Een backtick in een CSS-commentaar sluit het sjabloon af. Haal hem weg --
aanhalen doe je in CSS-commentaar zonder backticks.
```

Geen kapotte bundel, geen leeg dashboard, geen halfuur zoeken. Dertig seconden.

## Wat niet lukte

**Home Assistant bouwde opnieuw geen views** in dit browserprofiel (valkuil 21):
`hui-view` werd niet eens aangemaakt terwijl de Lovelace-config gewoon geladen
was, en `hui-sections-view` bleef ongedefinieerd. Service worker wissen, vers
tabblad én een herstart van de container hielpen deze keer niet meteen; na de
volgende herstart wel.

De meting is intussen doorgegaan met de opstelling die vanochtend bij valkuil 21
is opgeschreven: de echte kaart met de echte `hass` rechtstreeks in de pagina
gehangen. Dat wees meteen uit dat het niet aan de kaart lag — onze kaart was
gewoon geregistreerd — en er kan met een echte klik in geklikt worden. De tabel
hierboven is daarna alsnog op de gewone dashboardkaart gemeten.

## Aannames

- **Zeven dagen is de lijst, ook als er ooit langer bewaard wordt.** De constante
  staat in `camera-card.js` met een opmerking dat hij gelijk hoort te lopen met
  `MAX_LEEFTIJD` aan de serverkant. Verandert die, dan moet deze mee.
- **Een dag zonder beelden blijft aanwijsbaar**, gedempt en met een streepje. Hem
  weglaten zou de lijst per dag van lengte laten veranderen.

## `git status --porcelain`

```
M  CLAUDE.md
M  custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
M  custom_components/domotiapp_lovelace/manifest.json
AM docs/dagenlijst-en-terugknoppen/RAPPORT.md
M  src/cards/camera-card.js
M  src/cards/camera-filters.js
M  tests/js/camera-filters.test.mjs
```
