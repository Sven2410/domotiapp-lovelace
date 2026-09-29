# De meldingenkaart wordt een algemeen meldingenscherm (0.50.0)

Gevraagd op 26 september 2026, na 0.48.0: *"Ik wil een algemeen meldingen
scherm zoals je nu hebt bij afvalmeldingen. Maar als je op het potlootje klikt
daar staat nu een schakelaar dus dat moet veranderen in potlootje, Dat hij dan
een pop up opent van die persoon en dat je dan vinkjes kan aan en uit zetten.
Nu staat daar alleen afval meldingen dan maar in de toekomst moeten er meerdere
dingen bij komen. Afvalmeldingen met het icon moet dan bovenaan ook weg. Dus
puur een kaart met de personen en het potlootje."*

## Wat er veranderd is

| 0.48.0 | 0.50.0 |
|---|---|
| kop met icoon, "Afvalmeldingen" en "Morgen GFT · melding om 19:30" | **weg**: alleen de personen |
| per persoon een schakelaar | per persoon een **potlood**; de hele rij opent ook |
| — | **pop-up van die persoon**: per soort melding een vinkje, met eronder wat er komt |
| de kaart WAS één soort (`soort: afval`) | de kaart is algemeen; in de editor per soort een **schakelaar met een uitklapblok** |

**Op de kaart** draagt alleen het icoon de toestand: de foto of het icoon van
een persoon dimt als hij niets krijgt. "Geen telefoon gevonden" blijft op de
rij staan, want dat is een storing en geen status.

**De pop-up** (`src/cards/meldingen-scherm.js`) hangt aan `document.body`
(valkuil 34: de eigenaar zet deze kaart in een bubble-card-pop-up, en die
schuift open met een transform). Erin staan:

- de persoon, met foto;
- als er geen telefoon is: een waarschuwing dat hij niets krijgt, ook niet met
  een vinkje;
- per soort een regel met een vinkje. Onder Afvalmeldingen staat wat eerst in
  de kop van de kaart stond ("Morgen GFT · melding om 19:30", of "staat buiten
  (Sven)"), en anders wanneer de melding komt ("De avond ervoor om 19:30 en de
  ochtend zelf om 07:30");
- staat er geen enkele soort aan op de kaart, dan zegt de pop-up dat, en waar
  je het aanzet.

Een vinkje werkt meteen, zonder Opslaan, net als de schakelaar eerst. Sluiten
kan met het kruisje, door naast het vak te tikken, of met Escape.

**De editor** heeft Personen, en daaronder een schakelaar **Afvalmeldingen** met
het blok **Sensoren en tijden** eronder: dezelfde vorm als de presets van de
camera (vormregels in CLAUDE.md). Een volgende soort wordt een volgend paar. De
velden Soort, Titel en Icoon zijn weg: die hoorden bij de kop.

## Oude kaarten blijven werken

Zijn kaart uit 0.48.0 heeft `soort: afval` en geen `afval: true`. Aan beide
kanten geldt dezelfde regel (`soortAan` in `meldingen-logica.js`, `soort_aan` in
`kaarten.py`): een `afval: true/false` beslist, en staat die er niet, dan wint
`soort`, met afval als standaard. De melding houdt hetzelfde id (`afval`, of het
eigen `id`), en daaronder staat bij hem al opgeslagen wie er aan en uit staat.
Na de update verandert er voor zijn huishouden dus niets.

De editor toont zo'n oude kaart met de schakelaar aan. Zodra hij er iets aan
wijzigt, wordt `afval: true` weggeschreven en verdwijnt `soort`.

## Twee fouten die bij het meten boven kwamen

1. **Een kaart met één persoon was 58px hoog.** Rij 40 + binnenmarge 2 × 8 +
   rand 2 = 58, en `rasterhoogte.js` rondt dat af naar 120: twee rasterrijen voor
   één persoon. In 0.48.0 viel dat niet op, want toen stond er altijd een kop
   boven. Nu 7px binnenmarge, net als de mediakaart. Gemeten: **56 / 120 / 184**
   bij één, twee en drie personen.
2. **De tweede keer openen bleef de lijst leeg.** `open()` maakte de lijst leeg,
   maar onthield nog dat hij de regels al gebouwd had. Bij een tweede persoon
   met dezelfde soorten werd dan niets opnieuw gebouwd. Gerepareerd, en daarna
   vier keer achter elkaar gemeten (Lieke, dev, een kaart zonder soorten, en
   weer Lieke): alle vier goed.

## Bewijs

### Unittests

`tests/js/meldingen-soorten.test.mjs`, 13 tests. Op de code van vóór deze ronde
falen er 11. "Afval houdt het id dat het had" slaagt daar ook, en is gelabeld
als REGRESSIEWACHT. De andere falen deels op een ontbrekende functie, en bij
"een andere soort heeft zijn eigen id" op gedrag (de oude `meldingId` gaf
`tweede-adres` terug).

`tests/meldingen/test_kaarten.py`, 5 tests erbij:

| test | label |
|---|---|
| `afval: false` op de kaart verstuurt niets | NIEUW GEDRAG, faalt op de oude code (die gaf gewoon een melding) |
| `afval: true` zonder `soort` | NIEUW GEDRAG |
| `soort_aan` leest zoals de kaart | NIEUW GEDRAG |
| een eigen `id` blijft het id | REGRESSIEWACHT |
| een kaart van vóór de schakelaar blijft afval | REGRESSIEWACHT |

Totaal: **1227 JS-tests** groen, **56 Python-tests** in `tests/meldingen` groen
(in Docker, want op Windows draait Home Assistant niet).

### In een echte browser

Testinstance, HA 2026.8, view `kaart-test/meldingen`: links een kaart met de
config uit 0.48.0 (`soort: afval`, twee personen, `diensten` voor `person.dev`),
rechts een kaart met `afval: false`. De afvalsensoren zijn via
`POST /api/states` neergezet (morgen "gft", vandaag "geen"). Container herstart
voor de Python-wijziging (valkuil 49), bundel vers (sha256 gelijk aan schijf).

Zonder kliks, met de kaart met de hand in de pagina gehangen (valkuil 21):

- oude config: de server kent hem (`bekend: true`), de kop is weg, dev heeft
  een telefoon, Lieke niet ("Geen telefoon gevonden");
- kaart zonder soorten: dev gedimd;
- hoogtes 56 / 120 / 184.

Met echte kliks, nadat de eigenaar zei het tabblad naar voren te halen. Elke
klik is gelogd met een capture-luisteraar (`isTrusted: true`):

| stap | uitkomst |
|---|---|
| potlood van Lieke | pop-up aan `body`: Lieke, de waarschuwing, Afvalmeldingen met vinkje, "Morgen GFT · melding om 19:30" |
| vinkje uit | `aria-checked="false"`; de SERVER heeft `person.lieke: false` (eigen abonnement); rij op de kaart `aan=false` |
| kruisje | dicht; Lieke's icoon grijs, de storing blijft staan |
| tik op de naam "dev" (niet op het potlood) | pop-up van dev, vinkje aan, geen waarschuwing, focus op het vak en niet op het vinkje (valkuil 18) |
| Escape (echte toets) | dicht |
| potlood van Lieke, tik op de TEKST van de regel | weer aan; server en kaart volgen |
| naast het vak tikken | dicht |
| bewerkmodus: kaart openen | editor: Personen, schakelaar Afvalmeldingen aan, blok eronder |
| schakelaar uit | `afval: false`, `soort` weg, blok weg, voorbeeld gedimd; geen genest blok in de config (valkuil 33) |
| schakelaar aan | blok terug, sensoren nog ingevuld |
| Annuleren | editor dicht, oude config ongewijzigd |

In de bewerkmodus opent een tik op de kaart de pop-up NIET: die tik gaat naar
de bewerklaag van Home Assistant, zoals het hoort.

Het toetsenlogboek bevat alleen mijn eigen Escape; er is niets van de eigenaar
onderschept (valkuil 59).

## Samenvatting

- De meldingenkaart toont alleen nog de personen, met per persoon een potlood.
- Het potlood opent een pop-up van die persoon, met per soort een vinkje.
  Voorlopig één soort: Afvalmeldingen.
- In de editor: per soort een schakelaar met zijn instellingen eronder.
- Kaarten uit 0.48.0 werken ongewijzigd door, ook aan de serverkant.
- Twee fouten bij het meten gevonden en gerepareerd: een kaart met één persoon
  was twee rijen hoog, en de pop-up bleef leeg bij de tweede persoon.

## Wat niet lukte

- **De melding zelf is niet verstuurd.** Deze ronde verandert niets aan het
  versturen (`motor.py` is ongewijzigd), en de tests daarvan zijn groen. Een
  echte melding op een telefoon is niet gemeten.
- **De kop "Sensoren en tijden"** is na de klikproef hernoemd (eerst stond daar
  nog eens "Afvalmeldingen"). Dat is alleen een tekst, en hij staat in de bundel,
  maar hij is niet opnieuw in de editor bekeken.
- **Het tabblad naar voren halen**: in het andere Chrome-venster van de eigenaar
  (niet het Coach-venster) is daarbij 25 keer Ctrl+Tab gedaan voordat het
  goede venster gevonden werd. Daar kan nu een ander tabblad vooraan staan dan
  eerst. In het Coach-venster is zijn eigen tabblad teruggezet.

## Aannames

- Dat de hele rij de pop-up mag openen en niet alleen het potlood. Het potlood
  is een doel van 34 pixels, en op de rij is verder niets te doen.
- Dat een vinkje meteen moet gelden, zonder Opslaan. Dat deed de schakelaar ook.
- Dat de titel en het icoon van de oude kop weg mogen uit de editor. Ze stonden
  alleen in die kop, en die wilde hij weg.

## git status --porcelain

Bij het schrijven van dit rapport, vóór de commit:

```
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M custom_components/domotiapp_lovelace/meldingen/kaarten.py
 M src/cards/meldingen-card.js
 M src/cards/meldingen-logica.js
 M tests/meldingen/test_kaarten.py
?? docs/meldingenscherm/
?? src/cards/meldingen-scherm.js
?? tests/js/meldingen-soorten.test.mjs
```
