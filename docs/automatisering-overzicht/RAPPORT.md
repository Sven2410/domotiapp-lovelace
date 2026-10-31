# Automatiseringskaart: naam, scheidingen, overzicht en ruimtes op een laptop (0.96.0)

31 oktober 2026, tak `fase-139/automatisering-overzicht`. De eigenaar, doorgegeven door een andere
sessie: *"op laptop kan je niet door de kamers scrollen en ik wil dat je duidelijk separators maakt
nu is alles zo dicht op elkaar. En ik wil dat je een automatisering een naam kan geven. Heb je veel
lampen geselecteerd dan wordt het heel on overzichtelijk in het overzicht"*.

## Samenvatting

| Wens | Oorzaak | Nu |
|---|---|---|
| Kamers scrollen op een laptop | de rij ruimtes scrolde opzij, met verborgen balk; een muiswiel doet dat niet | de ruimtes lopen door op meerdere regels en scrollen omlaag, tot 102 px hoog, met een halve regel als teken dat er meer is |
| Duidelijke scheidingen | alleen 14 px tussen de blokken | een lijn tussen elk blok in het scherm en boven de knoppen, vette koppen, een rand om de lampenlijst, en een lijn tussen de rijen op de kaart |
| Een naam | bestond niet | veld Naam bovenaan, hooguit 60 tekens, mag leeg; `naam` in de regel |
| Veel lampen in het overzicht | de rij noemde elke lamp | tot drie op naam, daarna "Kitchen, Ceiling en 11 andere" |

**Op de rij:** de kop is de naam, en zonder naam de lampen. Met een naam staan de lampen kort op een
derde regel. De lampen in een groep onder Helderheid scrollen na 100 px.

**Twee dingen erbij:**
- Het scherm is op een breed scherm 560 breed in plaats van 420, zodat er meer ruimtes en lampen op
  een regel passen. Op een telefoon verandert er niets.
- Een regel mocht hooguit 50 lampen hebben, en een kaart kan er meer hebben (bij een klant 55). Dat gaf
  een fout bij opslaan. Nu 200. De toets of een lamp op de kaart staat blijft gelden.

## Gemeten

Testinstance, gewone gebruiker, bundel op schijf en geladen `b07a60e29fae`, kliks en toetsen
`isTrusted: true`, geen fouten in de pagina. Dertien lampen in dertien ruimtes.

**Laptop, 1366 × 768, met muis:**

| Proef | Uitkomst |
|---|---|
| ruimtes voor het scrollen | 102 hoog, inhoud 120, opzij 0 |
| muiswiel boven de ruimtes | `scrollTop` 0 → 18, de laatste ruimte (Terrace) in beeld |
| klik op Terrace | één lamp in de lijst, de scrollstand blijft |
| naam typen "Avond beneden e", twee keer terug | `"Avond beneden"`, spatie `isTrusted: true`, focus blijft in het veld, geen zoeker van Home Assistant open |
| dertien lampen kiezen | de naam blijft, teller "13 gekozen", groep 100 hoog met inhoud 127 |
| lijnen | elk blok na Naam: rand 1px, 14 px boven |

| Rij | Kop | Derde regel | Hoog |
|---|---|---|---|
| met naam, 13 lampen | Avond beneden | Kitchen Lights, Ceiling Lights en 11 andere | 60 |
| zonder naam, 2 lampen | Kitchen Lights, Ceiling Lights | | 55 |
| zonder naam, 7 lampen | Bed Light, Decorative Lights en 5 andere | | 48 |

De kaart is 248 hoog, op het raster. De regel opnieuw openen geeft de naam terug; leeg maken en opslaan
haalt hem weg, en de kop wordt de lampen.

**Telefoon, 393 breed:** vak van 16 tot 377, geen overloop in het vak of de pagina.

**Proeven.** Nieuw: 3 in JS en 3 in Python. Op de vorige stand falen de 3 in JS en 2 in Python (NIEUW
GEDRAG). De derde in Python, de te lange naam, slaagt daar ook: de oude server weigerde elke naam. Die is
dus een REGRESSIEWACHT. JS 2199 en Python 1005 groen.

## Wat niet lukte

- **Niet op een echte installatie,** en niet met 21 ruimtes en 55 lampen. Dertien is wat de testinstance
  heeft.
- **Een laptop met alleen een touchpad is niet apart gemeten.** Het wiel en een touchpad geven dezelfde
  scroll omlaag.

## Aannames

- "Het overzicht" is de lijst regels op de kaart. De lampen in de groepen zijn ook korter gemaakt, voor
  het geval de wens daarover ging.
- "Separators" gelden voor het scherm en voor de rijen op de kaart.
- Automatisch een naam verzinnen hoort er niet bij: zonder naam blijft het de lampen.

## git status --porcelain

Leeg na de commit.
