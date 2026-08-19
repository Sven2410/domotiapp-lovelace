# Een code op de alarmpaneelkaart

Ronde van 19 augustus 2026, direct na de drie nieuwe kaarten. De vraag: *"ik wil
dat ik een code moet aanmaken en invoeren. Bij uitschakelen wel een code en bij
inschakelen niet"*, gevolgd door *"ik ga niet alarmo gebruiken"*.

---

## 1. Wat er op de installatie stond (uitgelezen, alleen lezen)

| Paneel | `code_format` | `code_arm_required` | `supported_features` |
|---|---|---|---|
| `alarm_control_panel.alarm` (Alarmo) | `number` | `True` | 26 = afwezig, trigger, custom bypass — **geen thuismodus** |
| `alarm_control_panel.meterkast_kopo` | `None` | `False` | 7 = thuis, afwezig, nacht |
| `alarm_control_panel.kopos_dream_machine_pro_alarm_manager` | `None` | `False` | 2 = afwezig |

Twee dingen volgden daaruit, en allebei zijn ze gemeld:

- Alarmo kón het al (code, en "code bij inschakelen" uit te zetten), maar hij
  gebruikt Alarmo niet.
- Zijn andere twee panelen kennen **geen** code. Dus moest de code ergens anders
  vandaan komen.

## 2. Waar de code staat, en waarom daar

**In DomotiApp zelf, aan de serverkant, gehasht.** `paneelcode.py` bewaart hem
met PBKDF2-HMAC-SHA256 (210.000 rondes, eigen salt per wijziging) in
`.storage/domotiapp_lovelace.panel_code`. Instellen gaat via de options flow van
de integratie — *Configureren → Alarmcode* — en die staat achter HA's eigen
admin-controle.

Wat er **niet** is gebouwd, en waarom niet:

- **Geen code in de kaartconfig.** Die staat in het dashboard van de klant, is
  met een rechterklik te lezen, staat in elke backup en gaat mee als je het
  dashboard exporteert.
- **Geen code in de bundel of in een `!secret`.** Zelfde bezwaar, andere plek.

En wat het **wel en niet is**, letterlijk zo opgeschreven in de code, in de
options flow en in de README: dit is een slot op de kaart, niet op Home
Assistant. Wie in HA kan inloggen, kan `alarm_control_panel.alarm_disarm` ook via
de ontwikkelaarstools aanroepen. Het houdt tegen dat iemand die langsloopt het
alarm van de muur af uitzet. Wil je een slot dat ook tegen een ingelogde
gebruiker beschermt, dan hoort de code in het alarmsysteem zelf — en dat kan deze
kaart ook, want dan staat `code_format` op de entiteit en stuurt hij hem door.

**Raden**: vijf misgeslagen pogingen binnen een minuut en er gaat een minuut lang
niets meer doorheen, ook niet de juiste code (anders is de teller te omzeilen
door tussendoor te blijven proberen). De teller staat in het geheugen — een
herstart is duurder dan vijf pogingen.

## 3. Twee bronnen, één kaart

De kaart kiest zelf waar de code vandaan komt:

1. **Het paneel** (`code_format` staat) → codepaneel, en de ingetikte code gaat
   mee met de service. Of er bij inschakelen ook een code nodig is, zegt het
   paneel met `code_arm_required`.
2. **DomotiApp** (geen `code_format`, wel een code ingesteld) → codepaneel, de
   code gaat naar de server om gecontroleerd te worden, en pas daarna volgt de
   opdracht — zonder code, want het paneel kent er geen.

Bij allebei geldt: **uitschakelen vraagt om de code, inschakelen niet.** Dat is
de standaard; met de kaartinstelling *Code bij inschakelen* is het per kaart om
te zetten naar altijd of nooit.

Verder toont de kaart nu alleen de standen die het paneel aankan
(`supported_features`) — bij Alarmo verdwijnt daardoor de knop **Thuis**, precies
zoals die daar op dit moment ook niet bestaat, en hij komt vanzelf terug zodra de
modus daar aangezet wordt.

## 4. Het codepaneel

Hele scherm, toetsen van 72 pixels, bolletjes in plaats van cijfers. Bediening
met de vinger én met het toetsenbord (cijfers, backspace, Enter, Escape). Bij een
paneel met `code_format: text` verschijnt een tekstveld in plaats van het
cijferblok.

Eén ontwerpkeuze die het noemen waard is: **een paneel dat een verkeerde code
stil weigert.** Dat doen er meer dan één — de service slaagt en er verandert
niets. De kaart kijkt daarom na de opdracht drie seconden of de toestand ook echt
verandert, en meldt anders "Het paneel deed niets. Klopt de code?" in plaats van
te doen alsof het gelukt is.

## 5. Tests

`npm test`: **282 groen** (was 267). Nieuw: `tests/js/alarm-paneel.test.mjs` —
welke knoppen een paneel krijgt (inclusief het masker 26 van zijn eigen Alarmo)
en wanneer er een code nodig is, in alle combinaties van bron en instelling.

Python: `tests/test_paneelcode.py`, tien tests. De belangrijkste is de eerste:
**de code komt in geen enkel veld van het opslagbestand voor.** Verder: nieuw
salt bij elke wijziging, wissen, de pogingsteller (ook over de websocket, met een
eigen foutcode), dat de teller leegloopt na een goede poging, dat een niet-admin
mag controleren maar niet instellen, en dat het hashen de event loop niet
blokkeert.

## 6. Browsermeting — en wat er niet lukte

Er staat een nieuwe proefpagina in de repo: `dev/alarmcode.html`. Die is er
omdat de grote werkbank tijdens deze ronde **onder de klikken vandaan schoof**:
de kaarten erboven veranderen van hoogte terwijl abonnementen binnenkomen, en een
positie die je opmeet klopt een seconde later niet meer. De proefpagina heeft een
vaste hoogte en het logboek staat eronder in plaats van als vaste balk erover.

**Wat er niet lukte: de meting met echte kliks.** Het Chrome-venster stond
geminimaliseerd (`document.visibilityState === "hidden"`), en dan landt er geen
enkele klik van de browsertool — dat is eerst vastgesteld en daarna pas
omzeild. De hele doorloop is dus met **nagebootste** pointer- en clickevents
gemeten. Dat bewijst de bedrading, niet de knop; CLAUDE.md vraagt terecht om het
echte werk. Dat staat open en wordt overgedaan zodra het venster vooraan staat.

Wat de nabootsing wél liet zien, van begin tot eind:

| Stap | Uitkomst |
|---|---|
| Paneel met eigen code, inschakelen | `alarm_arm_away` zonder code, geen codepaneel (`code_arm_required: false`) |
| Uitschakelen | Codepaneel opent, kop "Paneel met eigen code", actie "Uitschakelen", OK uit zolang er niets staat |
| Vier cijfers | Vier gevulde bolletjes |
| Verkeerde code (0000) | `alarm_disarm {code:"0000"}`, paneel weigert stil → **"Het paneel deed niets. Klopt de code?"**, invoer gewist, scherm blijft open |
| Goede code (1234) | `alarm_disarm {code:"1234"}` → uitgeschakeld, scherm sluit |
| Paneel zonder eigen code, inschakelen | `alarm_arm_home` zonder code, geen codepaneel |
| Uitschakelen, verkeerde code | Alleen `panel/code/verify` → **"Die code klopt niet."** — en géén `alarm_disarm`: er gaat niets naar het paneel voordat de code klopt |
| Goede code (4711) | `verify` → daarna `alarm_disarm` **zonder** code → uitgeschakeld, scherm sluit |

## 7. Aannames

- **Eén code voor het hele huis**, niet per kaart of per paneel. Wie er twee wil,
  moet het zeggen; de opslag kan het aan.
- **De code is minimaal vier tekens.** Korter is geen code maar een formaliteit.
- **Vergeten code = nieuwe code instellen.** Uitlezen kan niet, en dat is de
  bedoeling.
- **De code van DomotiApp vraagt niets bij inschakelen**, ook niet in de stand
  "volg het paneel": inschakelen is nooit het gevaarlijke deel. Wie het anders
  wil, zet *Code bij inschakelen* op "altijd".

## 8. `git status --porcelain`

```
 M README.md
 M custom_components/domotiapp_lovelace/__init__.py
 M custom_components/domotiapp_lovelace/config_flow.py
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/strings.json
 M custom_components/domotiapp_lovelace/translations/en.json
 M custom_components/domotiapp_lovelace/translations/nl.json
 M dev/preview.html
 M src/cards/alarm-panel-card.js
 M src/index.js
?? custom_components/domotiapp_lovelace/paneelcode.py
?? dev/alarmcode.html
?? docs/alarmcode/RAPPORT.md
?? src/cards/alarm-logica.js
?? src/codepad.js
?? tests/js/alarm-paneel.test.mjs
?? tests/test_paneelcode.py
```
