# Rapport — alles getest op de echte instance

Branch `fase-19/wekkernaam-en-release`, 20 augustus 2026, later op de dag.

De vorige ronde (`docs/entiteitenkaart-slikt-de-knop/RAPPORT.md`) sloot af met
één openstaand punt: de testinstance was niet opgestart, dus de kaartkiezer ín
Home Assistant en de editor door `hui-dialog-edit-card` heen waren ongemeten.
Dit rapport sluit dat af.

---

## 0. De instance stond er niet — en wat er op 8127 wél draaide

Op poort 8127 draaide een container `ha-scene` die
`C:\dev\domotiapp-scene\.ha-dev-config` mountte, met de integratie
`domotiapp_scene` erin. **Onze integratie zat er dus niet in.** Er was helemaal
geen compose-project `domotiapp-lovelace-dev`, en `.ha-dev-config/` bestond niet
in deze repo.

Twee dingen zijn daarom veranderd:

- **`.ha-dev-config/` is aangelegd** door de config van `domotiapp-scene` te
  kopiëren zonder database, logboeken, `deps/` en `custom_components/`. Daar
  zitten dezelfde testlampen en light groups in die `CLAUDE.md` beschrijft, en de
  ingelogde sessie komt mee — er hoefde geen wachtwoord aan te pas te komen.
- **De container heet nu `ha-lovelace`.** Beide compose-bestanden gebruikten
  `container_name: ha-scene`, en dan weigert Docker de tweede met een
  naamconflict. Dat is de reden dat er een container van een ánder project op
  onze poort stond zonder dat dat opviel.

De oude `ha-scene` is gestopt en niet verwijderd; `docker start ha-scene` zet hem
terug, maar dan is poort 8127 weer bezet.

`domotiapp_scene` staat nog als config entry in de gekopieerde opslag en meldt
zich als `not_loaded`, want die integratie is hier niet gemount. Dat is
onschadelijk en met opzet zo gelaten.

---

## 1. Verse code bewezen, op de echte laadroute

De lader onder `/api/domotiapp_lovelace/loader.js` geeft de bundel-URL met de
hash erin. Opgehaald met `cache: "reload"`:

| | |
|---|---|
| bytes | **277.918** |
| sha256 | `02e2fc70878a255b55ce98ec8e822f3dea1460998eab724dc0b6afcf3fd98e7f` |
| gelijk aan `npm run build` op schijf | **ja** |

Na `npm run build` is de config entry herladen vóór het harde herladen in de
browser (valkuil 2). De service worker is eerst afgemeld.

---

## 2. De kaartkiezer

13 kaarten, en precies de twee die weg moesten zijn ook echt weg:

```
DomotiApp Header, Separator, Verlichting, Klimaat, Entiteiten, Mediaspeler,
Rookmelder, Weersvoorspelling, Rolluiken, Personen, Afvalkalender, Scene, Wekker
```

- `domotiapp-button-card` — **niet meer geregistreerd**
- `domotiapp-alarm-panel-card` — **niet meer geregistreerd**
- "DomotiApp Alarm" heet nu **"DomotiApp Wekker"**

Een verse `DomotiApp Entiteiten` uit de kiezer toont in het voorbeeld de
uitlegkaart ("Nog niets gekozen — Voeg een rij toe en kies daar entiteiten in")
in plaats van "Ongeldige configuratie", en de editor opent met precies één knop:
*Rij toevoegen*. Eén klik daarop geeft één rij, open, "2 kolommen · nog leeg",
met beide plekken opengeklapt.

---

## 3. De hoogtes, in het echte raster

Dit is wat de werkbank níét kon meten. In een sections-view staan de kaarten in
HA's raster (56px per rij, 8px ertussen) en rekken ze zich op tot de rij die ze
vragen. Alle tien de entiteitenkaarten en de personenkaart:

```
person/-/-                    56px vs 56px   OK
entities/card/row+row        120px vs 120px  OK
entities/card/tile+row       184px vs 184px  OK
entities/items/compact        56px vs 56px   OK
entities/card/tile           120px vs 120px  OK
entities/items/tile          120px vs 120px  OK
entities/card/row+row        120px vs 120px  OK
entities/card/row+row+row    184px vs 184px  OK
entities/items/row            56px vs 56px   OK
entities/card/row             56px vs 56px   OK
```

**Nul afwijkingen.** De `AFWIJKING`-meldingen die de werkbank gaf waren dus
inderdaad een artefact van het meten buiten een raster, precies zoals vermoed.

---

## 4. De editor door `hui-dialog-edit-card` heen

Alle handelingen zijn **echte kliks en toetsen**; `isTrusted` is per event
uitgelezen via een capture-listener op `window` die `composedPath()` leest.

| Handeling | `isTrusted` | Gevolg |
|---|---|---|
| Vormknop "Rij" (rij stond op Tegel) | true | voorbeeld werd meteen drie pillen, kop werd "3 kolommen · …", rij bleef open |
| Typen in het naamveld, mét spatie | true op de spatie-keydown | **acht aanslagen, alle acht aangekomen**: veld werd `Woning en tuin`, cursor op 14, veld hield focus |
| Opslaan | true | opgeslagen config klopt (zie hieronder) |

**De console bleef leeg.** Geen `Cannot add property name, object is not
extensible`, geen enkele fout. Dat is de lus waar v0.1.8 en v0.1.9 op stukliepen,
nu voor het eerst gemeten waar hij werkelijk gebeurt.

Wat er werd weggeschreven:

```yaml
type: custom:domotiapp-entities-card
surface: items
rows:
  - columns: 3
    items:
      - name: Woning en tuin        # geen entiteit: een navigatieknop
        icon: house
        tone: house
        tap_action: { action: navigate, navigation_path: /kaart-test/vormen }
      - entity: light.testlampen
        name: Lampen
        icon: bulb
      - entity: light.test_lamp_rgb
        name: Ledstrip
        toggle: true
```

`layout: tile` is verdwenen omdat de vorm terug op "Rij" stond — de standaard
wordt niet weggeschreven. De plek zónder entiteit heeft de hele editorronde
overleefd.

---

## 5. Alle kaarten samen

Een tweede view met alle veertien kaarttypes erop. Alles tekent, en de console
bevat exact één regel: onze eigen versiebanner. Geen fouten, geen
"Configuratiefout", geen ontbrekende custom elements.

De uitlegkaart doet het waar hij hoort: de afvalkaart zonder sensoren zegt "Kies
minstens één afvalsensor", de wekkerkaart zonder persoon zegt "Kies een persoon
in de kaartinstellingen".

---

## 6. Wat niet lukte

**Eén fout gezien die niet te reproduceren was.** Tijdens het klikken door de
kaartkiezer verscheen `Uncaught TypeError: Cannot read properties of undefined
(reading 'config')` in de foutvanger. Daarna zes gerichte pogingen gedaan om hem
terug te krijgen — een verse kaart openen, een lege rij toevoegen, kolommen
wijzigen, de kaartkiezer twee keer openen en alle 29 voorbeelden laten tekenen —
en hij kwam niet terug. Er is dus **geen stack** en er is niet vast te stellen
of hij uit onze code kwam of uit die van Home Assistant. Vermeld omdat hij er
was, niet weggelaten omdat hij niet paste.

---

## 7. Een bevinding die niet in de opdracht zat

**Vijf kaarten vragen `rows: "auto"` en vallen daardoor niet op het raster:**

| Kaart | Gemeten hoogte |
|---|---|
| Verlichting (dimbaar) | 93px |
| Verlichting (aan/uit) | 56px |
| Mediaspeler | 130px |
| Weersvoorspelling | 103px |
| Scene en Wekker | `rows: "auto"`, hier 56px |

`rows: "auto"` is een geldige HA-instelling — de kaart bepaalt zelf zijn hoogte —
maar hij botst met de afspraak dat een DomotiApp-kaart dezelfde hoogte haalt als
een Mushroom-kaart ernaast. Een lichtkaart van 93px naast een kaart van 120px in
dezelfde kolom stapt. Niet aangeraakt: dit stond niet in de opdracht.

---

## 8. Aannames

- **De testconfig is gekopieerd uit `domotiapp-scene`** in plaats van vers
  opgezet. Vers opzetten had onboarding gevraagd, en een account aanmaken doe ik
  niet. De gekopieerde config heeft de testlampen die `CLAUDE.md` beschrijft.
- **De oude `ha-scene`-container is gestopt, niet verwijderd.**
- **Het testdashboard `kaart-test` blijft staan** op de dev-instance. Het is
  gitignored materiaal en handig voor de volgende ronde.

---

## 9. `git status --porcelain`

```
(leeg)
```
