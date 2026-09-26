# DomotiApp Meldingen: afvalherinneringen met een schakelaar per persoon

**Ronde van 26 september 2026.** Branch `fase-53/meldingen`, uitgave 0.48.0.

## Wat er gevraagd is

> "dan wil ik ook een nieuwe kaart hebben. De Domotiapp meldingen. Dat is een
> kaart waar je personen kan invullen in de GUI en dat op een scherm een
> schakelaar toont om de meldingen aan of uit te zetten. (...) In de GUI wil ik
> dan een keuzelijst hebben wat voor meldingen kaart het is. Voor nu doen we
> alleen de optie Afval meldingen. Nu heb ik daar een blueprint voor draaien
> maar dat is eigenlijk voor elke afval meldingen hetzelfde. Alleen de opties die
> ik moet invullen is afval vandaag afval morgen tijd vandaag en tijd morgen. en
> dan gewoon de personen toevoegen. (...) kijk of je snapt wat ik bedoel en of je
> hem nog beter kan maken"

Erbij zaten een schermafdruk van zijn huidige kaart (vijf rijen, elk een
`input_boolean`) en de automatisering "Afval Notificaties": om 19:30 en 07:30
een melding naar vijf vaste `notify`-entiteiten, maar alleen als de sensor
precies `papier`, `gft`, `pmd` of `restafval` zei.

## Hoe het nu werkt

**De kaart verstuurt niets. Dat doet de integratie.** Om 07:30 heeft niemand
een dashboard open. De kaart laat zien wie er aan staat en zet dat om; het
versturen gebeurt aan de serverkant (`custom_components/.../meldingen/`).

**De instellingen staan in de kaart, en de server leest ze uit de dashboards.**
Je vult alles in de editor in: soort, afvalsensoren, tijden en personen. De
server leest die uit de opgeslagen dashboards. Daardoor:

- zijn er **geen helpers meer nodig**. Wie je toevoegt staat aan; de schakelaar
  op de kaart is de enige plek;
- **verstuurt een verwijderde kaart niets meer**. Bij elke melding wordt eerst
  opnieuw gelezen;
- is dezelfde kaart op de telefoon én de tablet **één melding**. De personen
  van beide tellen mee;
- hoeft een **kioskaccount zonder beheerdersrechten** niets weg te schrijven om
  zijn eigen schakelaar om te zetten.

### De editor

| veld | wat |
|---|---|
| **Soort melding** | keuzelijst, voorlopig alleen *Afval* |
| **Titel** | leeg = "Afvalmeldingen" |
| **Afval morgen** + **Melding de avond ervoor** | de sensor die zegt wat er morgen komt, standaard om 19:30. Sensor leeg = geen avondmelding |
| **Afval vandaag** + **Melding op de dag zelf** | idem voor de ochtend, standaard 07:30 |
| **Personen** | `person.*`, zoveel als je wilt |

### Wat er beter is dan de automatisering

| zijn automatisering | nu |
|---|---|
| zes vaste plekken voor een persoon | onbeperkt |
| per persoon een `notify`-entiteit en een `input_boolean` invullen | een **persoon** kiezen; de telefoon wordt erbij gezocht, de schakelaar zit in de kaart |
| alleen `papier`, `gft`, `pmd`, `restafval` | **alles is afval behalve "niets"**: textiel, kerstbomen en "gft, papier" op één dag vallen niet meer stil weg |
| "Er moet voor morgen gft worden neergezet!" | "**Morgen GFT**" / "Morgen wordt GFT opgehaald. Zet de container vanavond aan de straat." |
| avond en ochtend komen allebei, ook als hij al buiten staat | knop **"Staat buiten"** in de melding. De ochtendmelding vervalt, de avondmelding verdwijnt bij de anderen, en de kaart zegt wie het deed |
| twee losse meldingen op het scherm | de ochtendmelding **vervangt** die van de avond (zelfde `tag`) |
| iemand zonder telefoon krijgt stil niets | de rij zegt **"Geen telefoon gevonden"** |

### De kaart

- Kop met het icoon, de titel en eronder wat er komt: *"Morgen GFT · melding om
  19:30"*, *"Vandaag PMD"*, *"Morgen GFT · staat buiten (Sven)"*. Komt er niets,
  dan staat er ook niets (vormregel: statusregels weglaten).
- Per persoon een rij: foto (of het persoonsicoon), naam, schakelaar. De hele
  rij is klikbaar. Alleen het icoon draagt de toestand: een foto wordt grijs
  als hij uit staat.
- In de editor, vóór het opslaan: *"Actief zodra het dashboard is opgeslagen"*.

### Waarom de telefoon bij een persoon gezocht wordt, en niet als notify-entiteit

Zijn automatisering gebruikte `notify.send_message` met de notify-ENTITEIT
(`notify.iphone_van_sven`). Die neemt alleen een titel en een tekst, dus geen
knop en geen tag. De knop "Staat buiten" en het vervangen van de avondmelding
kunnen alleen via de notify-DIENST van de companion-app
(`notify.mobile_app_iphone_van_sven`). Die wordt bij de persoon gezocht, net
als bij de camerakaart. Wie het anders wil (een Telegram-bot, een tweede
telefoon), zet in de YAML:

```yaml
diensten:
  person.bertus: notify.mobile_app_ipad_van_bertus
```

---

## Het bewijs uit de browser

Testinstance (HA 2026.8.1, poort 8127), echte browser. Het tabblad stond
tijdens deze meting op `hidden`: de eigenaar keek op dat moment Ziggo GO in
Chrome, en het tabblad is met opzet niet omgeschakeld. Valkuil 40 zegt dat
kliks dan wél aankomen, en dat is hieronder met `isTrusted` aangetoond.

### Verse code

```
na de laatste wijziging   861.807 bytes   sha256 591282d1...   op schijf én in de browser
config entry herladen     200 {"require_restart":false}
```

Python veranderde deze ronde, dus de container is herstart (valkuil 49).

### Het testmateriaal

- `person.dev` (de ingelogde gebruiker) en `person.lieke` (nieuw, zonder
  telefoon).
- `sensor.mijnafvalwijzer_vandaag` = `Geen`, `sensor.mijnafvalwijzer_morgen` =
  `gft`.
- `diensten: {person.dev: notify.persistent_notification}`: de testinstance
  heeft geen companion-app, dus de melding voor dev komt als melding in Home
  Assistant zelf binnen.

### De kaart, na het opslaan van het dashboard

```
kop       "Afvalmeldingen"
regel     "Morgen GFT · melding om 19:30"
rijen     person.dev    aan   (telefoon: persistent_notification)
          person.lieke  aan   "Geen telefoon gevonden"
stand     {"bekend": true, "aan": {}, "buiten": null, ...}
hoogte    184   (drie rasterrijen)
```

### Omzetten, met echte kliks

```
click  isTrusted=true  (1302,253)  button.toggle <- div.rij        schakelaar van Lieke
  kaart   person.lieke aan=false
  server  {"person.lieke": false}          (via een tweede, losse abonnee)

click  isTrusted=true  (931,246)   span.pn <- span.txt <- div.rij  de naam van Lieke
  kaart   person.lieke aan=true
  server  {"person.lieke": true}
```

### Echt versturen, op de minuut

De avondmelding is op 21:54 gezet (dashboard opgeslagen om 21:52:58). De kaart
zei meteen "melding om 21:54", want `lovelace_updated` liet de server opnieuw
lezen.

```
21:54:00.434  persistent notification  "Morgen GFT"
              "Morgen wordt GFT opgehaald. Zet de container vanavond aan de straat."
21:54:00.434  WARNING  Geen telefoon gevonden voor person.lieke; die krijgt geen afvalmelding
stand         verstuurd.morgen = "2026-09-26"
```

### "Staat buiten"

Precies zoals de companion-app het meldt, als de ingelogde gebruiker:

```
fire_event  mobile_app_notification_action  {action: "DOMOTIAPP_AFVAL_BUITEN|afval|2026-09-27"}
  stand.buiten  {"datum": "2026-09-27", "door": "person.dev", "om": "2026-09-26T21:54:23+02:00"}
  kop           "Morgen GFT · staat buiten (dev)"
```

Na een volledige herlading van de pagina stond dat er nog, net als wie er aan
stond.

### De editor, met echte toetsaanslagen en spaties

Het tabblad was verborgen, en dan laadt `hui-dialog-edit-card` niet (valkuil
40). De editor is daarom met de hand in de pagina gehangen (de omweg uit
valkuil 21): het echte `domotiapp-meldingen-card-editor` met HA's echte
`ha-form`. Klik in het titelveld, dan typen:

```
click    isTrusted=true  (560,298)  input.control <- wa-input <- ha-input   focus = dat INPUT
keydown  A f v a l SPATIE t h u i s          allemaal isTrusted=true
         11 aanslagen -> 11 config-changed, name: "Afval thuis"
```

Daarna de echo van Home Assistant nagedaan: elke `config-changed` gaat terug
door `setConfig`, zoals de echte dialoog doet (valkuil 23). Verder getypt:

```
keydown  SPATIE e n SPATIE s t r a a t      allemaal isTrusted=true
         10 aanslagen -> 10 config-changed, name: "Afval thuis en straat"
         zelfde INPUT-element, focus bleef erin
```

In de config staan `tijd_morgen: "19:30:00"` en `tijd_vandaag: "07:30:00"` al
ingevuld (de standaardwaarden uit de editor), `soort: "afval"`, en geen genest
blok.

### Achtergrond weglaten

De basis van elke editor biedt "Achtergrond weglaten". Dat deed op deze kaart
eerst niets; tijdens het meten gezien en gerepareerd. Nagemeten met `bare: true`:

```
background  rgba(0, 0, 0, 0) / none
box-shadow  none
```

---

## Tests

**Python, `tests/meldingen/`, 51 tests:**

| bestand | wat |
|---|---|
| `test_afval.py` | welke toestanden afval zijn, de namen, de zinnen, de tijden |
| `test_kaarten.py` | de kaart vinden in stapels, voorwaardelijke kaarten en pop-ups; twee kaarten = één melding; **tegen de echte Lovelace** |
| `test_motor.py` | om 19:30 naar wie aan staat, niet naar wie uit staat, niet bij "Geen", niet twee keer, "Staat buiten" slaat de ochtend over en wist bij de rest, een weggehaalde kaart verstuurt niets, een nieuwe tijd telt meteen, de echte klok van HA, de proef |
| `test_websocket.py` | de stand en elke wijziging bij de abonnee; omzetten mag een kioskaccount, een proef alleen een beheerder |

**JS, `tests/js/meldingen-logica.test.mjs`, 14 tests:** dezelfde afvalgevallen
als aan de serverkant (kaart en telefoon zeggen hetzelfde), de kopregel, wie er
aan staat, en het id.

**Tegen `main`** (in een losse worktree):

```
node --test tests/js/meldingen-logica.test.mjs
  Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../src/cards/meldingen-logica.js'
pytest tests/meldingen
  E   ModuleNotFoundError: No module named 'custom_components.domotiapp_lovelace.meldingen'
```

Alles is **NIEUW GEDRAG**; er bestond niets van.

**Het geheel:** 1199 JS-tests en 721 Python-tests groen. `verify`,
`check:registratie` en `check:css` zijn groen.

---

## Samenvatting

- Nieuwe kaart **DomotiApp Meldingen**, met als soort voorlopig **Afval**.
  Personen kies je in de editor; op de kaart zet ieder zijn eigen meldingen aan
  of uit.
- De integratie verstuurt om 19:30 (morgen) en 07:30 (vandaag), instelbaar, naar
  wie aan staat. De instellingen leest hij uit de dashboards; helpers zijn niet
  meer nodig.
- Beter dan de automatisering: onbeperkt personen, geen vaste lijst met bakken,
  nette zinnen, een knop "Staat buiten" die de ochtendmelding laat vervallen, en
  een rij die zegt als iemand geen telefoon heeft.

## Wat niet lukte

- **De tijd- en personenkiezer in de editor zijn niet met echte kliks bediend.**
  In het verborgen tabblad laadden HA's kiezers niet (`ha-entity-picker` bleef
  leeg, valkuil 40), en het tabblad naar voren halen zou zijn Ziggo GO-tabblad
  hebben omgeschakeld. Het tekstveld wél, met spaties. De tijdkiezer
  (`{time: {}}`) is **nieuw in dit pakket**, dus dat is het eerste om na te
  kijken: kies een tijd en kijk of de kop "melding om ..." meeverandert.
- **Er is geen echte telefoon geraakt.** De testinstance heeft geen
  companion-app. Het versturen is echt gebeurd (via
  `notify.persistent_notification`), en het vinden van de telefoon bij een
  persoon is dezelfde code als bij de camera, die thuis al meldingen stuurt.
  Maar de knop "Staat buiten" op een echt scherm en het wissen bij de anderen
  zijn alleen in de tests en met een nagebootst event gezien.
- **Geen schermafdruk in dit rapport.** Het tabblad was verborgen, en
  `captureScreenshot` liep dan na 30 seconden vast.

## Aannames

- **Eén afvalmelding per installatie.** Het id is de soort (`afval`), zodat de
  kaart op de telefoon en op de tablet dezelfde melding is. Wie er twee wil
  (twee adressen), zet in de YAML een eigen `id:`.
- **Wie je toevoegt, staat aan.** Zo stond het in zijn automatisering ook: een
  persoon die je toevoegt, wil je een melding laten krijgen.
- **"Staat buiten" laat alleen de ochtendmelding vervallen** van de dag
  waarvoor getikt werd, en haalt de melding weg bij de anderen. Wie het tikte
  ziet hem al niet meer.
- **Zijn huidige automatisering en helpers blijven staan** tot hij ze zelf
  uitzet. Anders krijgt hij het dubbel; zie hieronder.

## Wat hij thuis moet doen

1. Updaten naar 0.48.0 en Home Assistant herstarten (er is Python bij gekomen).
2. De kaart toevoegen: *DomotiApp Meldingen*, tabblad **"Per kaart"**.
3. `sensor.mijnafvalwijzer_morgen` en `_vandaag` kiezen, de personen erbij, en
   het dashboard **opslaan** (tot dan zegt de kaart "Actief zodra het dashboard
   is opgeslagen").
4. Staat er bij iemand **"Geen telefoon gevonden"**, dan heeft die persoon geen
   companion-app als apparaat. Dat is bij hem mogelijk Bertus met de iPad; zie
   `diensten:` hierboven.
5. **De automatisering "Afval Notificaties" uitzetten**, anders komt alles
   dubbel. De vijf `input_boolean.afval_notificatie_*` zijn daarna niet meer
   nodig.

## git status --porcelain

Vóór de commit:

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/__init__.py
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/index.js
?? custom_components/domotiapp_lovelace/meldingen/
?? docs/meldingen-afval/
?? src/cards/meldingen-card.js
?? src/cards/meldingen-logica.js
?? tests/js/meldingen-logica.test.mjs
?? tests/meldingen/
```

Na de commit leeg.
