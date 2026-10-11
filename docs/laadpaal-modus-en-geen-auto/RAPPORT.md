# 0.59.1: laadpaal, Planning is geen knop en zonder auto geen percentage

## De vraag

Op 11 oktober 2026 rond 23:30 heeft de eigenaar 0.59.0 geprobeerd, met coach
0.112.2. De coach-sessie gaf door wat hij zag:

- Met het schema uit stonden er vier modusknoppen, afgekapt tot "Plann..." en
  "Conti...". Op de pc was dat al zo, op de telefoon nog erger. Zijn vraag:
  *"wat is de knop planning"*.
- *"waarom staat er 77%"*, terwijl er geen auto aan de paal hing. De Ford gaf
  om 21:39 77% door, vlak voordat de kabel eruit ging.

Zijn twee beslissingen, via de coach-sessie:

1. **Planning is geen knop meer.** Het is wat het schema aanzet. Coach 0.112.3
   maakt `modus_keuzes` met een planning voor vandaag `["snel"]` en zonder
   `["snel", "continu", "zon"]`. Naast de knoppen staat een regel: "Planning ·
   klaar om 06:00", of "Goedkoopst" als `modus_actief` "planning" is maar de
   planning vandaag niet geldt. Nog een keer de knop kiezen die aan staat, zet
   hem terug naar de voorkeur. Dat doet de coach; de kaart stuurt altijd al de
   optie van de knop.
2. **Geen auto: geen percentage, geen balk en geen "→ 80%".** Ze komen terug
   zodra er een auto aan hangt (elke andere stand).

## Wat er veranderd is

- `MODI` heeft geen Planning meer: Snel, Continu, Zon. Dat geldt ook voor een
  coach van vóór 0.112.3, die Planning nog in `modus_keuzes` heeft.
- `modusRegel()` geeft de regel:
  - met een planning voor vandaag "Planning", met de tijd uit
    `klaar_om_volgende` (anders de time-entiteit);
  - zonder planning "Goedkoopst";
  - staat er een andere knop aan, dan geen regel.

  Een coach zonder `modus_actief` krijgt alleen "Planning", want of die vandaag
  geldt is dan niet bekend.
- Op de kaart staat de regel naast de knop als er één knop is (Snel), en op een
  eigen regel boven de knoppen als er drie zijn.
- `laadpaalStand()` geeft bij `geen_auto` geen `soc` en geen `actieradius`.
  Daarmee vallen het getal, "→ 80%", de kilometers en de balk weg.
- Drie knoppen op 280: in Home Assistant gemeten vóór de wijziging, en
  "Continu" vroeg 43 px terwijl hij er 40 kreeg. Onder 310 px vallen de iconen
  op de drie modusknoppen weg. Bij vier knoppen vielen eerst de woorden weg
  (onder 360 px); die regel is er niet meer.

## Bewijs

### Tests

`laadpaal-modus-en-geen-auto.test.mjs`, 13 tests. Tegen de code van 0.59.0
(`git archive` van main, met dit testbestand erbij) falen er tien:

```
▶ NIEUW GEDRAG: Planning is geen knop meer
  ✖ zonder modus_keuzes: Snel, Continu en Zon
  ✔ REGRESSIEWACHT: coach 0.112.3 met een planning voor vandaag: alleen Snel, en die staat uit
  ✖ coach 0.112.1 met een planning voor vandaag: ook alleen Snel
  ✔ REGRESSIEWACHT: geen planning en de voorkeur Goedkoopst: drie knoppen en geen enkele aan
▶ NIEUW GEDRAG: de regel naast de knoppen
  ✖ (alle zes)
▶ NIEUW GEDRAG: zonder auto geen percentage
  ✖ geen_auto: geen accustand en geen actieradius, ook al geeft de coach ze door
  ✔ REGRESSIEWACHT: met een auto staan ze er weer
  ✖ de echte dump van 0.112.1: geen 77%
ℹ pass 3
ℹ fail 10
```

Twee van de drie regressiewachten werkten al dankzij het filter op
`modus_keuzes`. Bestaande tests die vier knoppen of "77%" verwachtten, zijn
omgezet naar het nieuwe gedrag. `npm test` 1483 groen, in UTC en in
Nederlandse tijd; verify, registratie, controls en css groen.

### In een echte browser

**Niet in Home Assistant gemeten.** De testinstance is om 23:03 met de hele
projectmap verloren gegaan; zie valkuil 68 en *Wat niet lukte*. Daarom een
nieuwe proefopstelling, `dev/laadpaal.html`: de echte bundel, de echte kaart,
de echte dump van 0.112.1 als `hass`, op 500, 320 en 280 px, en elke aanroep in
een logboek. Geserveerd met `python -m http.server` vanuit de repo-map.

| Situatie | Breedte | Knoppen | Regel | Getal / balk | Hoogte |
|---|---|---|---|---|---|
| 1. echte dump: geen auto, planning | 500 / 320 / 280 | Snel | "Planning · klaar om 06:00", naast Snel | weg / weg | 312 / 312 / 376 |
| 2. auto aan, planning | 500 / 320 / 280 | Snel | idem | 41% → 80% / ja | 440 / 440 / 504 |
| 3. geen planning, Goedkoopst | 500 / 320 / 280 | Snel · Continu · Zon | "Goedkoopst", erboven | 41% / ja | 504 / 504 / 504 |

Op de breedtes van de coach-sessie:

| | 320 | 280 |
|---|---|---|
| knopbreedte | 93 | 79 |
| "Continu" nodig / zichtbaar | 45 / 45 | 45 / 45 |
| iconen | ja | nee |
| afgekapt | niets | niets |

Alle hoogtes vallen op het raster. Twee echte kliks, allebei `isTrusted: true`:

- Snel in situatie 1 → `select.select_option {"entity_id":"select.laadpaal_modus","option":"snel"}`
- Continu in situatie 3 op 280 → idem met `"option":"continu"`

**Het font:** Roboto staat niet op deze pc, en de proefopstelling viel terug
op Segoe UI. Dat is breder: "Continu" is daar 45 px, in Home Assistant (dat zijn
eigen Roboto meebrengt) 43. Wat hier past, past daar dus ook.

## Samenvatting

Planning is geen knop meer. Wat er zonder knop geldt, staat als regel naast de
knoppen: "Planning · klaar om 06:00" of "Goedkoopst". Er zijn hooguit drie
knoppen, en die passen op 320 en 280 zonder afkappen. Zonder auto aan de paal
staat er geen percentage meer.

## Wat niet lukte

- **Niet in Home Assistant zelf gemeten**, alleen in de proefopstelling. De
  testinstance is weg (valkuil 68). Hoe hij terugkomt is de keuze van de
  eigenaar; daarna hoort deze kaart er nog een keer doorheen.
- **De foto is in de proefopstelling niet te zien**: die komt van de integratie
  (`/domotiapp_lovelace/afbeeldingen/`), en die draait daar niet. Aan de foto is
  niets veranderd.
- **Coach 0.112.3 is nog niet in een echte dump gezien.** De kaart leest geen
  nieuw attribuut, alleen een andere inhoud van `modus_keuzes`. Die vorm komt
  van de coach-sessie, en de kaart werkt ook met de vorm van 0.112.1.

## Aannames

- Dat "naast de knop Snel" bij drie knoppen een regel erboven mag zijn. Naast
  drie knoppen past de regel niet op 280.
- Dat bij "Goedkoopst" de klok het goede icoon is (wachten op goedkope uren),
  en bij "Planning" de kalender.

## git status --porcelain

Vóór het vastleggen:

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/laadpaal-card.js
 M src/cards/laadpaal-logica.js
 M tests/js/laadpaal-dump-0112.test.mjs
 M tests/js/laadpaal-dump.test.mjs
 M tests/js/laadpaal-logica.test.mjs
?? dev/laadpaal.html
?? docs/laadpaal-modus-en-geen-auto/
?? tests/js/laadpaal-modus-en-geen-auto.test.mjs
```
