# Zoeken op naam bij de speaker en het wake-up light (0.52.0)

Gevraagd op 29 september 2026: *"ik wil bij de wakeuplight ook kunnen zoeken op
naam nu heb ik bij een ander huishouden heel veel lampen entitien in een scroll
menu. Ook bij de speaker selecteren"*.

## Wat er veranderd is

In de wekker-editor (het scherm waar je een wekker instelt, in de wekkerkaart)
waren **Speaker** en **Wake-up light** een gewone keuzelijst (`<select>`). Met
zestig lampen is dat een scrollmenu waarin je je lamp zoekt door te lezen.

Nu is het een keuzeveld met zoeken:

- het veld toont wat er gekozen is, en ziet eruit als de andere velden;
- tik erop, en er verschijnen een **zoekveld** (met de focus erin) en de
  **lijst** eronder;
- typen filtert op **naam en entity_id**; meerdere woorden mogen, in elke
  volgorde ("slaap plafond" vindt "Plafond slaapkamer"), en hoofdletters en
  accenten maken niet uit. Wat met de zoekterm begint, staat bovenaan;
- achter elke naam staat klein het entity_id: bij drie lampen die "Plafond"
  heten is dat het verschil;
- **Enter** kiest de bovenste treffer, en een tik op een regel kiest die;
- **Escape** sluit alleen de lijst, niet de hele wekker. Met de lijst dicht
  annuleert Escape de wekker, zoals eerst;
- bij het wake-up light staat **Geen lamp** bovenaan zolang er niet gezocht
  wordt;
- de huidige keuze staat gemarkeerd in de lijst.

De lijst is dezelfde als die van het zoeken naar een geluid in hetzelfde
scherm (maximaal 260px, daarna scrollen). Het filter staat los in
`zoekEntiteiten` in `src/alarm/editorlogica.js`.

## Bewijs

### Unittests (`tests/js/alarm/zoeken.test.mjs`)

7 tests: hele lijst zonder zoekterm, een deel van de naam, meerdere woorden in
willekeurige volgorde, begin bovenaan, hoofdletters en accenten, zoeken op
entity_id, en niets gevonden / een kapotte lijst. Op de code van vóór deze
ronde falen ze alle 7 (`zoekEntiteiten bestaat niet`: dit is nieuw). Hele suite:
**1248 JS-tests groen.**

### In een echte browser, met echte kliks

Testinstance, de echte wekkerkaart met `person.dev`. Het label "Verlichting
Wekker" is aangemaakt en op alle 18 lampen gezet. Draaiende code gecontroleerd
op de `?v=` in de module-URL (`0421ec4905bd`, gelijk aan schijf) en op de
nieuwe methode in de editor (zie valkuil 15: de sha256 alleen bleek niet genoeg).
Het tabblad is naar voren gehaald met toestemming van de eigenaar. Elke klik en
toets gelogd, allemaal `isTrusted: true`:

| stap | uitkomst |
|---|---|
| plusje: nieuwe wekker | editor open; het veld Wake-up light zegt "Geen lamp" |
| veld aantikken | zoekveld met focus, lijst met "Geen lamp" (gemarkeerd) en 18 lampen met hun entity_id |
| "lamp kleur" getypt (spatie `isTrusted`) | 2 van de 18 over: Test Lamp Kleur En Wit, Test Lamp Kleurtemp |
| Enter | Test Lamp Kleur En Wit gekozen, lijst dicht, helderheidsschuif verschijnt |
| opnieuw open, "ceil", Ceiling Lights aangeklikt | gekozen |
| opnieuw open, Escape | alleen de lijst dicht; de editor blijft open en de keuze staat |
| opnieuw open (Ceiling Lights gemarkeerd), Geen lamp aangeklikt | geen lamp, schuif weg |
| speaker: veld aantikken, "slaap li" getypt, Slaapkamer Lieke aangeklikt | gekozen (1 van 12) |
| Escape met de lijst dicht | de wekker sluit, zoals eerst |

Het keuzeveld staat op dezelfde plek en breedte als het naamveld (links 584,
breed 466) en is 40px hoog, net als de keuzelijst die er eerst stond.

**De speakerlijst is nagebootst.** De server laat alleen speakers van Music
Assistant toe (platform `music_assistant`), en die zijn er in de testinstance
niet. Daarom kreeg de échte editor in de kaart een lijst van twaalf speakers
met de hand. Het veld, het zoeken en de kliks zijn echt. Het is hetzelfde
onderdeel als bij de lampen (`_kiezer`).

Het toetsenlogboek bevat alleen mijn eigen aanslagen.

## Samenvatting

- Speaker en wake-up light in de wekker zijn doorzoekbaar op naam en entity_id.
- Enter kiest de bovenste treffer, en Escape sluit alleen de lijst.
- CLAUDE.md, valkuil 15: een gelijke sha256 bewijst niet dat de nieuwe code
  draait. Controleer de `?v=` of een nieuwe methode.

## Wat niet lukte

- **Echte Music Assistant-speakers** zijn niet getest, want die zijn er in de
  testinstance niet (zie hierboven).
- **Het tabblad van de eigenaar terugzetten** lukte aan het eind niet: toen
  stond zijn Claude-venster vooraan, en de focus opnieuw overnemen terwijl hij
  daar mogelijk typt, heb ik niet gedaan. Zijn Chrome-venster toont nog het
  testtabblad; één keer Ctrl+Shift+Tab daarin brengt het zijne terug.

- **CI viel eerst om** op `check:controls`: die telt `<select` in de bron,
  ook in commentaar, en ik had in twee commentaarregels "in plaats van een
  <select>" geschreven. Herschreven, en alle zes de CI-controles lokaal
  gedraaid. Omdat één van die regels in een CSS-sjabloon staat, veranderde de
  bundel daardoor met 6 bytes (`0421ec…` gemeten, `6b2d3c…` uitgebracht); alleen
  die commentaartekst verschilt. `check:controls` staat nu ook in *Commando's*
  in CLAUDE.md.

## Aannames

- Dat zoeken op het entity_id ook mag. Hij vroeg "op naam", maar bij een lamp
  met een naam als "Hue color lamp 7" is het entity_id soms het enige houvast.
  Het staat klein en rechts, en de naam gaat voor.

## git status --porcelain

Bij het schrijven van dit rapport, vóór de commit:

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/alarm/editor.js
 M src/alarm/editorlogica.js
?? docs/wekker-zoeken/
?? tests/js/alarm/zoeken.test.mjs
```
