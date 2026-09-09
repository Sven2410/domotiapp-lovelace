# Infoscherm ronde 3: installatie in de kaart, mededelingen als reeks, verjaardagen

**Datum:** 10 september 2026
**Uitgave:** 0.38.0
**Tak:** `fase-43/infoscherm-ronde-3`

## Wat er gevraagd is

Twee berichten van de eigenaar op 10 september 2026, na het proberen van
0.37.0, met zes schermafdrukken erbij. Uit elkaar getrokken:

| # | vraag | waar het zit |
|---|---|---|
| 1 | het blok Installatie helemaal weg; weer, lampen enz. via de GUI-editor van de kaart | schermkaart: editor terug met weer, lampen, agenda's, kioskaccounts; de kaart stuurt zijn config naar de opslag |
| 2 | bij Medewerkers komt er tekst door het vinkje heen te staan | beheer: de tekst kwam in het knopje zelf terecht (valkuil 50) |
| 3 | drag-en-drop in plaats van pijltjes | beheer: een greep per medewerker, echte pointer-events |
| 4 | een tijd kiezen bij een mededeling, niet alleen een datum | `van` en `tot` als datum-met-tijd; server en scherm rekenen op de minuut |
| 5 | "Mededeling" wordt "Mededelingen", met een teller ("1 van 2") | kop van het blok |
| 6 | automatisch doorschuiven, instelbaar bij de mededelingen | `scherm.mededeling_interval`, veld in het blok Mededelingen |
| 7 | op de iPad zelf kunnen vegen; daarna de klok opnieuw | scroll-snap-baan; een echte scroll zet de klok opnieuw |
| 8 | mededelingen niet blauw, gewoon de kleuren van de andere blokken; icoon links weg | CSS |
| 9 | "Nieuws van het pand" helemaal weg; dat zijn mededelingen | blok en opslag weg; oude berichten worden bij het laden mededelingen |
| 10 | een verjaardagskalender die het beheer kan vullen, ook op het scherm | nieuw onderdeel `verjaardagen`, blok en pagina Verjaardagen |
| 11 | "Praktijk en openingstijden" wordt "Openingstijden"; naam, adres en welkomsteksten weg | beheer en opslag |
| 12 | twee blokken van dezelfde maat ruilen als het ene op het andere wordt losgelaten | indeling |
| 13 | in een blok van twee bij twee passen geen vier personen en geen vier lampen | dichte tegels voordat er iets wegvalt |
| 14 | nachtstand er helemaal uit | weg, ook uit de opslag en SPEC 20 |
| 15 | de schakelaar "afbeeldingen bij het nieuws" weg; altijd aan | weg |
| 16 | "om middernacht iedereen op afwezig" weg | de klok aan de serverkant is weg |
| 17 | de receptie moet iemand achteraf aan- of afwezig kunnen zetten; "nu doet dat schuifje niks" | gemeten: het opslaan werkte al, het LABEL was kapot (punt 2); nu met een echte klik bewezen |
| 18 | "na het nieuws van het pand" weghalen; gewoon elk kwartier | hulptekst bij de nieuwsbronnen |
| 19 | het weer moet zichtbaar zijn in één kolom | containerquery: icoon en getal kleiner, uren weg |
| 20 | het welkomblok instelbaar: wat er staat, of alleen een logo | tekst, logo in het blok, openingsregel: drie instellingen |
| 21 | na "Alles bekijken", iemand omzetten en terug is alle inhoud even weg | het raster werd gemeten terwijl hij `display: none` was (zie hieronder) |

De geplakte tekst en de eerste zes afbeeldingen uit het eerste bericht zijn bij
mij niet binnengekomen; de zes schermafdrukken uit het derde bericht wel, en
die dekken de punten 2, 13, 19, 20 en 21. Zie *Aannames*.

## Wat er gebouwd is

### De schermkaart (`src/cards/infoscherm-card.js`)

- **De editor is terug, met alleen de installatie:** weerentiteit, lampen en
  schakelaars, agenda's, en (alleen voor een beheerder) de kioskaccounts als
  vinkjeslijst uit de gebruikerslijst van Home Assistant. Al het andere blijft
  in het beheer.
- **De kaart stuurt zijn config naar de opslag** (`installatie/sync`) zodra
  een beheerder hem met die config ziet: in de editor of op het dashboard.
  Alleen bij verschil, en dezelfde payload nooit twee keer. Zo kent het
  beheer de lampen (voor de namen) en de server de kioskaccounts. De kaart
  tekent uit zijn EIGEN config; de lampnamen komen uit de opslag. Een
  kioskaccount stuurt niets.
- **Mededelingen als reeks:** een baan met scroll-snap, één mededeling per
  scherm, stippen eronder, "2 van 3" in de kop. Een klok schuift door na de
  ingestelde tijd (standaard 10 s, minstens 3); een scroll die niet van de
  klok zelf komt zet hem opnieuw. Het vlak heeft de kleur van de andere
  blokken, zonder icoon. Tekst met regeleinden blijft staan.
- **Verjaardagen:** blok en pagina. Vandaag eerst ("Vandaag jarig · wordt
  36"), dan morgen, dan op datum; de leeftijd is wat iemand WORDT en blijft
  weg als het jaar niet getoond mag worden. In een blok van één kolom staat de
  datum onder de naam.
- **Welkomblok:** tekst (leeg = geen), logo in het blok (dan niet ook in de
  kop) en de openingsregel, elk apart aan of uit.
- **Weer in één kolom:** onder een blokbreedte van 240 px staan icoon en
  getal kleiner, met de tekst eronder, en zonder uurvoorspelling.
- **Dichte tegels:** past de gewone lijst niet in het blok, dan krijgt het blok
  `dicht` (de compacte tegels van een blok van één rij) en pas daarna valt er
  iets weg. Zeven medewerkers in een blok van twee bij twee.
- **De terugkeer knippert niet meer.** `pasAlleBij_` meet niet als het
  raster verborgen is, en `gaNaar_("welkom")` meet opnieuw zodra het raster
  weer in beeld is.
- **Weg:** de nachtstand, de nieuwsschakelaar, de welkomsttekst-carrousel, de
  naam en het adres in de kop.

### Het beheer (`src/cards/infoscherm-beheer-card.js`)

- Blokken: Medewerkers, Mededelingen, Verjaardagen, Openingstijden, Indeling
  van het scherm, Verlichting, Instellingen en logo. Installatie en Nieuws
  van het pand zijn weg.
- **Medewerkers:** een greep links; slepen met echte pointer-events, de rij
  volgt de vinger, loslaten slaat op. De pijltjes zijn weg. De schakelaar
  aan/afwezig heeft zijn tekst weer naast het knopje.
- **Mededelingen:** een tekstvak van meer regels, *Vanaf* en *Tot en met* als
  datum met tijd, en onderaan het veld *Elke mededeling blijft staan
  (seconden)*.
- **Verjaardagen:** naam, geboortedatum, *Leeftijd tonen*.
- **Openingstijden:** alleen nog de tabel en de afwijkende dagen.
- **Indeling:** twee blokken van dezelfde maat ruilen van plek; tijdens het
  slepen kleurt zo'n plek niet rood.
- **Instellingen en logo:** nachtstand, nieuwsafbeeldingen en middernacht
  weg; het welkomblok erbij (tekst, logo in het blok, openingsregel); de
  hulptekst bij de nieuwsbronnen zegt alleen nog "elk kwartier".

### De serverkant (`infoscherm/`)

- `store.py`: `verjaardagen` erbij; mededelingen met `_datum_tijd`; `praktijk`
  alleen nog openingstijden en uitzonderingen; `scherm` met
  `mededeling_interval`, `welkom_tekst`, `welkom_logo`, `welkom_onder` en
  zonder `nachtstand` en `nieuws_afbeeldingen`; `instellingen` zonder
  `reset_middernacht`; `async_zet_installatie_van_kaart` (namen blijven,
  kioskaccounts gaan mee, `gewijzigd` in het antwoord). Bij het laden worden
  oude berichten van het pand mededelingen en gaat de eerste welkomsttekst
  naar `welkom_tekst`; daarna wordt de opslag zonder `nieuws` weggeschreven.
- `websocket.py`: `verjaardagen/save` erbij, `nieuws/save` weg,
  `installatie/sync` (alleen admin; een stand gaat alleen rond bij verschil).
- `__init__.py`: de middernachtklok is weg.

### SPEC 20

Aangepast op de opdracht van de eigenaar: 20.4 (opslag en rechten: de
installatie in de kaartconfig, de onderdelen, de migratie) en 20.7 (gedrag:
mededelingen, verjaardagen, welkomblok, dichte tegels, ruilen; nachtstand en
middernacht eruit). Zegt hij dat dat niet de bedoeling was, dan is het één
commit terug.

## Bewijs

### Verse code

Bundel op schijf en zoals de testinstance hem uitserveert, na het wissen van
de service worker en de caches en met `cache: "reload"`:

| | bytes | sha256 |
|---|---|---|
| eerste meting | 775.692 | `083b9167c07b…` (schijf gelijk) |
| na de reparatie van het slepen | 776.210 | `32b3a9fa34b1…` (schijf gelijk) |

Python gewijzigd, dus `docker restart ha-lovelace` (valkuil 49); de opslag
kwam terug zonder `nieuws`, met de twee oude berichten als mededelingen 2 en
3 en met `welkom_tekst: "Welkom, neemt u plaats."` uit de oude
welkomsteksten.

### De view bouwde niet, dus de kaarten hangen met de hand in de pagina

Na het wissen van de service worker bouwde Home Assistant in dit tabblad geen
enkele view meer (`hui-panel-view` niet eens gedefinieerd, valkuil 21), ook
niet in een vers tabblad, en het tabblad stond de hele sessie op
`visibilityState: hidden`. Beide kaarten zijn daarom met `createElement`,
`setConfig` en de echte `hass` in `document.body` gehangen (de meetopstelling
uit valkuil 21), met een lusje dat `hass` doorgeeft. Alle kliks hieronder
zijn echte kliks van de browsertool, gevangen met een capture-luisteraar op
`window`.

### Schermkaart

- **Sync van de kaartconfig.** Kaart met `weather: weather.forecast_thuis`,
  vijf lampen en één agenda; daarna in de opslag: dezelfde weerentiteit, de
  vijf lampen (de naam "Wachtkamer lamp" van `light.test_lamp_dim` bleef
  staan, de rest leeg), de agenda.
- **Mededelingen schuiven vanzelf.** Interval 10 s; op t=0 "1 van 3", op
  t=16,3 s index 1, `scrollLeft` 291 bij `clientWidth` 291, "2 van 3", de
  tweede stip actief.
- **Vegen.** Een echte scroll naar rechts (`isTrusted`) in de baan: index 2,
  `scrollLeft` 581, "3 van 3", en de klok opnieuw gestart.
- **Een mededeling met een verlopen tijd** (`tot: 2026-09-10T00:30` om 01:02)
  staat in de opslag (4) en niet op het scherm (3 van 3).
- **De terugkeer.** Klik op "Alles bekijken" van Aanwezig (`isTrusted`, pad
  `SPAN.txt > SPAN.bk-meer > BUTTON.bk`), klik op de eerste medewerker (pad
  `DIV.p-functie > DIV.p-tekst > DIV.persoon`), klik op Terug. Direct daarna
  gemeten: pagina `welkom`, in elk blok 0 verborgen tegels (Aanwezig 5 van
  5, Nieuws 3 van 3, Openingstijden 7 van 7, Mededelingen 3 van 3;
  Verlichting 1 verborgen, en dat is de derde lamp in een blok van één rij).
  De medewerker staat op Aanwezig, ook op de server.
- **Dichte tegels.** Aanwezig op 2×2 met "toon 10": klasse `dicht`, 7 van 7
  zichtbaar, laatste tegel onder op 424 px bij een vak dat tot 446 loopt.
  Verlichting 2×2 met "toon 4": 4 van 4 zichtbaar (626 bij 687), kop "nog 1".
- **Weer in één kolom** (blok 141 px breed): icoon, 13° en de tekst
  "Heldere nacht · 89% vochtig · wind 10 km/h" allemaal binnen het vak, de
  uren weg.
- **Verjaardagen.** Blok 1×2 met "toon 3": Marieke (vandaag, wordt 36),
  Jeroen (morgen, wordt 41), Lotte (za 3 okt, zonder leeftijd); kop "1
  vandaag jarig · nog 1". Klik op de kop (`isTrusted`): pagina "Wie is er
  binnenkort jarig" met vier tegels in de goede volgorde. In de eerste meting
  stond de naam in het smalle blok niet in beeld; sindsdien staat de datum
  daar onder de naam.

### Beheer

- Zeven blokken, geen Installatie en geen Nieuws. Openingstijden heeft alleen
  nog `ot_*`- en `u_*`-velden. Instellingen heeft `welkom_tekst`,
  `welkom_logo` en `welkom_onder` en geen `nachtstand`, `nieuws_afbeeldingen`
  of `reset_middernacht`.
- **De schakelaar.** Echte klik op de schakelaar van de tweede medewerker
  (pad `INPUT > SPAN.schakel > LABEL.vink`): label "Aanwezig", het binnenste
  span van de schakelaar leeg, op de server `aanwezig: true`, "Opgeslagen
  01:03".
- **Slepen.** Echte sleep van de greep van rij 1 naar y=430: pointerdown,
  vier pointermoves en een pointerup (alle `isTrusted`); DOM, werkkopie én
  server: Jeroen, Sanne, Marieke, Lotte, … De eerste versie (pointer capture
  op de greep) bleef na één stap hangen: valkuil 51.
- **Typen.** In het tekstvak van de eerste mededeling, aan het eind, met
  echte toetsaanslagen " Tot ziens": de keydown van de spatie `isTrusted:
  true` op `data-veld="tekst"`, elf aanslagen, het veld hield de focus, de
  server heeft "…gesloten. Tot ziens".
- **Verjaardag toevoegen.** Naam "Piet Jansen" met echte toetsaanslagen (de
  spatie `isTrusted`), datum "15092001" in het datumveld: veld `2001-09-15`,
  op de server "Piet Jansen 2001-09-15".
- **Ruilen.** Echte sleep van Weer (1×2 op x=0) op Verjaardagen (1×2 op
  x=1): werkkopie en server `weer x=1`, `verjaardagen x=0`.
- De velden *Vanaf* en *Tot en met* zijn `datetime-local`; het intervalveld
  staat op 10 met `data-s="scherm"`.

### Editor

Met de hand in de pagina gehangen (`domotiapp-infoscherm-card-editor`, echte
`hass`): schema `weather:entity`, `lights:entity`, `calendars:entity`,
`kiosk_users:select` met "dev (beheerder)" uit de gebruikerslijst; labels
Weerentiteit, Lampen en schakelaars op het scherm, Agenda's, Kioskaccounts.
Echte klik op het kioskvinkje: `config-changed` met `kiosk_users:
["435ee0d1…"]`.

### Tests

- JS: 1008 groen (`npm test`); `npm run verify` en `npm run check:registratie`
  OK.
- Python: 662 geslaagd in Docker na de correctie van de sync-test (het
  stand-event gaat vóór het resultaat de deur uit, zoals de abonneetest al
  zei); daarvoor 2 gefaald: die test, en de middernachttest die nu weg is.
- **NIEUW GEDRAG** tegen de code van vóór deze ronde (`git stash` op `src`
  en `custom_components`): de JS-testmodule laadt niet (`SyntaxError`: de
  nieuwe exports bestaan niet), en `tests/infoscherm/test_store.py` laadt
  niet (`ImportError: cannot import name 'valideer_verjaardag'`). De nieuwe
  tests: `geldigNu` met een tijd, `isoDatumTijd`, `komendeVerjaardagen`,
  `paginas` met verjaardagen, `test_een_mededeling_mag_een_tijdstip_dragen`,
  `test_een_verjaardag_heeft_een_naam_en_een_datum`,
  `test_scherm_kent_het_welkomblok…`,
  `test_oud_nieuws_van_het_pand_wordt_een_mededeling`,
  `test_de_kaart_stuurt_zijn_installatie_en_de_namen_blijven`,
  `test_verjaardagen_save`, `test_installatie_sync_alleen_admin…`.
- **REGRESSIEWACHT:** `test_de_receptie_zet_iemand_achteraf_aanwezig_via_personen_save`
  (slaagde ook op de oude code: het opslaan werkte, het label niet).

## Samenvatting

Eenentwintig punten, alle gedaan. De installatie zit weer in de kaarteditor
en de kaart stuurt hem naar de opslag; de mededelingen zijn een schuivende
reeks met tijden; er is een verjaardagenblok; nachtstand, middernachtregel,
nieuwsschakelaar, nieuws van het pand, naam, adres en welkomsteksten zijn
weg; de vier gemelde fouten (tekst door het vinkje, de knipperende
terugkeer, het weer in één kolom, vier tegels in twee bij twee) zijn gemeten
en verholpen. Uitgave 0.38.0.

## Wat niet lukte

- De view van Home Assistant bouwde in dit tabblad niet meer na het wissen
  van de service worker, en het tabblad bleef verborgen. Alles is daarom
  gemeten met de kaarten met de hand in de pagina (valkuil 21). Wat daarmee
  NIET is gemeten: de kaart in HA's eigen `hui-panel-view` en de editor in
  HA's bewerkdialoog. De entiteitenkiezers in de editor zijn die van Home
  Assistant zelf en zijn hier niet aangeklikt.
- Het automatisch doorschuiven is één stap gemeten (naar "2 van 3"), niet
  een hele ronde terug naar 1.
- De lichte uitvoering en een niet-admin account zijn niet in de browser
  bekeken (code ongewijzigd, behalve dat het kioskveld in de editor alleen
  voor een beheerder verschijnt).

## Aannames

- De geplakte tekst en de eerste zes afbeeldingen uit het eerste bericht zijn
  niet binnengekomen; alleen de laatste zin ("en installatie helemaal weg…")
  en de zes schermafdrukken uit het derde bericht. Staat er in die tekst iets
  dat hier niet in zit, dan is dat de volgende ronde.
- "Installatie helemaal weg, via de GUI editor" is gelezen als: weer, lampen,
  agenda's ÉN de kioskaccounts in de kaarteditor; de kioskaccounts stonden in
  hetzelfde blok.
- "Nieuws van het pand mag helemaal weg, dat moet gewoon mededelingen worden"
  is gelezen als: het blok en de opslag weg, oude berichten eenmalig
  overgenomen als mededeling (titel als eerste regel), de afbeelding vervalt.
- De instelling voor de tijd per mededeling staat in het blok Mededelingen van
  het beheer (zoals gevraagd) maar in de opslag onder `scherm`, naast de
  andere scherminstellingen.
- Het welkomblok: drie losse schakelaars (tekst, logo, openingsregel) in
  plaats van een keuzelijst; "alleen een logo" is dan tekst leeg en
  openingsregel uit.
- De verjaardagenlijst staat los van de medewerkers ("iedereen"), met een
  vinkje *Leeftijd tonen* zodat een geboortejaar niet op het scherm hoeft.

```
git status --porcelain
(zie de commit; leeg na het committen)
```
