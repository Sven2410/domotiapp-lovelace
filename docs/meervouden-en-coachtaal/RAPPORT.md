# 0.83.0: meervouden, de taal van de coach, en de navbalk in de kaartkiezer

## Aanleiding

Op 21 oktober 2026, na 0.82.0, vroeg de eigenaar drie dingen:

- de meervouden repareren die al niet klopten ("1 lampen", "1 dagen geleden");
- in zijn eigen browser meten, op een dashboard Ontwikkeling van een
  installatie die hij beheert;
- met de beheersessie en de coach-sessie samen de hele installatie op Engels
  zetten, want *"iedereen hier thuis spreekt engels"*.

Ook binnen: de coach-sessie stuurde twee echte dumps van coach v0.140.2 met het
attribuut `taal`, van dezelfde klant:
- om 11:12 UTC, met "nl";
- om 11:39 UTC, nadat de coach op English was gezet. Dat was met akkoord van
  de eigenaar, en Home Assistant zelf stond toen nog op nl.

## Wat er gebouwd is

**Tekst van de coach in een andere taal.** De keuze die ik heb gemaakt: de kaart
houdt de taal van de gebruiker, ook bij Automatisch. Het plan was eerst dat
Automatisch de coach zou volgen. Maar bij precies deze installatie (Home
Assistant Engels, de coach nog Nederlands) had dat Nederlandse kaarten in een
Engels huis gegeven. In plaats daarvan:
- spreekt de coach een andere taal (`spreektAnders` in `coach-logica.js`), dan
  komt zijn tekst niet op de kaart;
- de kaart zet er dan zijn eigen woord bij de stand neer.

| Kaart | Tekst van de coach | Bij een andere taal |
|---|---|---|
| thuisbatterij | toestand, `reason` | het woord bij de stand ("Idle"), geen reden |
| laadpaal | toestand, `reason` | het woord bij de stand, geen reden |
| airco | `reason` | het woord bij de stand ("Running on solar.") |
| programmakaart | `later` op de knop | uit `klaar_om` ("tomorrow", of de dag) |

Een coach zonder het attribuut (van vóór v0.140.2) geeft hetzelfde als altijd.
De regel staat in `docs/taal.md` en als regel 7 bij "Nederlands en Engels" in
CLAUDE.md.

**Meervouden.** Een telling van één krijgt nu een enkelvoud.

| Was | Is | Waar |
|---|---|---|
| 1 dagen geleden | gisteren | `relativeDay` in `ha.js` |
| 1 blokken, 1 lampen | 1 blok, 1 lamp | het beheer van het infoscherm |
| 1 nieuwsbron(nen), 1 bericht(en) opgehaald | 1 nieuwsbron, 1 bericht opgehaald | idem |
| 1 beelden (Engels: 1 images) | 1 beeld (1 image) | het opslagscherm van de camera |
| Kies uit 1 bronnen | Kies uit 1 bron | de mediakaart |

**Een gat in `check:taal`.** Begon het getal in een `tn()` met een haakje
(`tn((w.lijst ?? []).length, ...)`), dan zag de controle die zin helemaal niet.
Daardoor meldde hij de nieuwe zinnen in het beheer eerst niet, terwijl er nog
geen Engels voor was. Na de reparatie meldde hij zes zinnen zonder Engels. Die
zijn aangevuld.

**De navbalk in de kaartkiezer.** Gezien bij het meten in Home Assistant: het
voorbeeld van de navbalk in de kaartkiezer zweefde onderin over de kiezer
heen, over de knop Cancel. De balk herkent een editor of een voorbeeld aan de
tagnamen erboven (`edit` of `preview`). In de kiezer staat hij onder
`hui-card-picker` → `div.preview`, en dat herkende hij niet. Gemeten:
- `position: fixed`;
- de voorouders `div.preview`, `hui-card-picker`, `hui-dialog-create-card`.

`picker` hoort er nu bij (`isBewerkTag` in `navbar-logica.js`).

## Bewijs

**Tests.**
- Alles groen: 2038 JS-tests en 901 Python-tests. `verify`,
  `check:registratie`, `check:controls`, `check:css` en `check:taal`
  ("Alles vertaald.") zijn OK.
- **Nieuw:** `tests/js/coach-taal-dump-01402.test.mjs` (11),
  `tests/js/meervouden.test.mjs` (2), en een toets in
  `navbar-logica.test.mjs`. Tegen de code van `main` (uit `git archive`):

  ```
  ✖ spreektAnders: alleen bij een bekende, andere taal
  ✖ Engels: het woord van de stand, en geen reden
  ✖ in een andere taal rekent de kaart het zelf uit klaar_om
  ✖ laadpaal: geen Nederlandse zin en toestand op een Engelse kaart
  ✖ airco: de regel valt terug op het woord bij de stand
  ✖ gisteren is gisteren, en niet 1 dagen geleden
  ✖ geen (en) of (nen) achter een woord in een zin voor mensen
  ✖ Engelse kaart, Engelse coach: de tekst van de coach staat er gewoon
  ✖ Nederlandse kaart, Engelse coach: het Nederlandse woord bij de stand
  ℹ pass 4
  ℹ fail 9
  ✖ isBewerkTag: editor, voorbeeld en kaartkiezer, en verder niets
    TypeError: isBewerkTag is not a function
  ```

  De vier die slagen zijn **REGRESSIEWACHT**: de twee dumps zelf, en Nederlands
  bij een Nederlandse coach. Voor de navbalk is de fout op main alleen "bestaat
  niet". Daarom staat de oude regex er los naast:
  `oude regex op hui-card-picker: false · nieuwe: true`.
- **De dumps** staan als `tests/js/vaste-invoer/coach-0.140.2-taal.json` en
  `coach-0.140.2-taal-en.json`. Het serienummer van de omvormer is vervangen
  door "serienr"; context en ids zijn eruit. In het Engels:
  - de toestand van de batterij is "Read only";
  - de stand blijft een sleutel (`stil`, `draait`);
  - `reason` is Engels.

**In Home Assistant zelf** (in de browser van de eigenaar, op het dashboard
Ontwikkeling van een klantinstallatie, met 0.82.0):
- **Verse code:** de `?v=` was `4c0eefcb15ab`, gelijk aan de bundel van 0.82.0
  op schijf.
- **Alleen in mijn tabblad Engels.** Eerst heb ik het Engels alleen in mijn
  tabblad aangezet: het antwoord van de lader in de pagina omgezet, de
  installatie niet. Alle 8 kaarten bouwden zich om:
  - twee robotstofzuigers, de boiler en de thuisbatterij;
  - wasmachine en droger;
  - vriezer en koelkast.

  Wat Nederlands bleef komt niet van de kaarten zelf: namen van Dreame, Miele
  en de coach, en de kamernamen.
- **Daarna echt.** De beheersessie zette Home Assistant, het profiel van de
  gebruiker en Uiterlijk → Taal op Engels. Na een verse lading, zonder enige
  omweg in de pagina, zijn alle 8 kaarten Engels. De lader zegt `"en"`, en dat
  kwam aan zonder de integratie te herladen.
- **De vriezereditor** gaat open, in het Engels, met het voorbeeld ernaast (in
  0.81.0 viel hij om).
- **De kaartkiezer** toont Engelse namen: "DomotiApp 3D printer", "Air
  Conditioner", "Alarm Clock".
- **Opgeruimd.** Een klik in de bewerkmodus voegde per ongeluk een lege sectie
  toe. Die is weggehaald, en het dashboard heeft weer 8 secties met elk 2
  kaarten. De beheersessie heeft het in het spoor van de klant gezet.

**Op de werkbank in Chrome** (0.83.0):
- **Verse code:** 1.346.448 bytes, sha256 `1e70f5253d8681ab`, gelijk aan schijf.
- **Nederlands tegen main:** 63 van de 64 kaarten zijn letter voor letter
  gelijk aan de bundel van main (`4c0eefcb15ab7374`, op een eigen poort). Het
  ene verschil is de klok op de kopkaart (12:38 tegen 12:39).
- **Geen telling van één** met een meervoud meer op de pagina.

## Nagemeten na het bijwerken (21 oktober 2026)

De eigenaar werkte de klant bij naar 0.83.0 en herstartte. Daarna, op
Development (de dashboardnaam is inmiddels vertaald):
- **Verse code:** de `?v=` is `1e70f5253d86`, gelijk aan de bundel van 0.83.0.
- **De coach staat op English** (`taal: "en"` op alle drie de sensors), net
  als het profiel. De kaarten tonen de tekst van de coach gewoon. Wat er
  staat: "Washing machine · Off · last cycle today", "Tumble dryer ·
  Programme finished", Miele met "Cottons" en "Anti-crease".
- **Nog Nederlands:** alleen "Thuisbatterij". Dat is de apparaatnaam die de
  coach zelf invult, en de eigenaar beslist daarover.
- **De navbalk in de kaartkiezer** staat nu in zijn vak: `position: relative`,
  de balk 281×62 binnen een vak van 281×186. Daarvoor was het `fixed`,
  onderin over de kiezer. Kiezer gesloten zonder iets toe te voegen; het
  dashboard is ongewijzigd (8 secties met elk 2 kaarten).
- **Gezien, niet van ons:** de X50 toont na de herstart het grijze "geen
  kaart"-plaatje. Dat is het beeld dat `camera.x50_ultra_complete_map` zelf
  levert (527×387). De kamers staan wel in zijn attributen. De integratie van
  Dreame heeft zijn plattegrond dan nog niet; de kaart toont wat hij krijgt.

## Wat niet lukte

- **Het opslagscherm van de camera en het beheer** zijn alleen in de logica en
  de bron gemeten; ze staan niet op de werkbank en niet bij de klant. (De
  navbalk is na het bijwerken alsnog gemeten, zie hierboven.)
- **Een Nederlandse kaart naast een Engelse coach** is alleen getoetst tegen de
  dump. Bij de klant zijn de kaart en de coach allebei Engels.

## Aannames

- **De kaart volgt nooit de coach.** Dat wijkt af van wat ik de coach-sessie
  eerder schreef ("Automatisch volgt de coach"). Om de reden hierboven heb ik
  het omgedraaid.
- **De reden weglaten is beter dan een zin in een andere taal.** De stand staat
  er wel, dus de kaart zegt nog steeds wat de batterij of de laadpaal doet.
- **"gisteren" in plaats van "1 dag geleden"**, omdat er voor de toekomst al
  "morgen" staat.

## git status --porcelain

```
(leeg na de commit van dit rapport)
```
