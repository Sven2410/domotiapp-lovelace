# Voorstel: DomotiApp Infoscherm

*Geschreven op 9 september 2026, op verzoek van de eigenaar. **Later die dag
goedgekeurd en gebouwd als 0.36.0**; hoofdstuk 20 staat sindsdien in `SPEC.md`
met zijn antwoorden op de beslispunten erin verwerkt, en de meting staat in
`RAPPORT.md`. De tekst hieronder is het voorstel zoals het was. Beslispunten staan aan het eind. Het schermontwerp staat op
https://claude.ai/code/artifact/03ee2c3c-3224-4182-8e46-ca963efb6a8c (iPad-pagina's
Welkom, Aanwezig en Verlichting, en het beheerscherm van de receptie).*

## 1. Waar het om gaat

Tandartspraktijken en woon-zorginstellingen vragen om een informatiescherm:
een iPad van 11 inch in de wachtruimte, in kioskmodus, met het logo van de
praktijk, de tijd, het weer, wie er vandaag aanwezig is, nieuws van het pand,
en de verlichting van de ruimte.

Wat het NIET is: een dashboard. Niemand in de wachtkamer kent Home Assistant,
en dat hoort ook zo te blijven. Home Assistant is de motor en verder
onzichtbaar. De receptioniste beheert de inhoud vanaf haar eigen computer, in
een browser, zonder ooit een kaartconfig te zien.

## 2. Kaart of integratie: allebei, in dit ene pakket

Het antwoord op de vraag van de eigenaar is: **een serverkant in de bestaande
integratie plus twee kaarten**, precies zoals de camerakaart zijn `bewaking/`
heeft en de scenekaart zijn `store.py`. Geen losse nieuwe integratie, want
sinds 20 augustus 2026 komt er geen kaart meer in een aparte repo, en de klant
installeert één ding via HACS.

Waarom het niet zónder serverkant kan, in één zin: **wie de inhoud beheert is
een gewone gebruiker, en een gewone gebruiker kan geen dashboardconfig
opslaan.** Namen, aanwezigheid, nieuws en het logo kunnen dus niet in de
kaartconfig wonen. Ze wonen in een eigen `Store`, bereikbaar via eigen
WebSocket-commando's die voor iedere ingelogde gebruiker openstaan. Dat is
dezelfde redenering als SPEC 14, waar `scenes/save` om dezelfde reden niet
admin-only is.

## 3. Drie accounts, twee dashboards

| account | rol in HA | ziet | doet |
|---|---|---|---|
| installateur (de eigenaar) | beheerder | alles | kaarten plaatsen, entiteiten kiezen, de kioskgebruiker aanwijzen |
| receptie | gewone gebruiker | dashboard **Beheer** | namen, nieuws, mededelingen, logo, openingstijden |
| kiosk (de iPad) | gewone gebruiker | dashboard **Infoscherm** | aanwezigheid tikken, verlichting schakelen; verder niets |

Beide dashboards zijn gewone Lovelace-dashboards. **Infoscherm** is één
`panel`-view met één kaart die het hele scherm vult. **Beheer** is een view
met de beheerkaart, en desgewenst een paar gewone kaarten (de verlichting, de
thermostaat) voor de receptie.

**Dichttimmeren.** Wat Home Assistant zelf biedt: een gewone gebruiker ziet
geen instellingen en geen ontwikkelhulpmiddelen, en een dashboard kan op
"alleen beheerders" staan. Het standaarddashboard **Overzicht** blijft voor een
gewone gebruiker echter zichtbaar in de zijbalk, en de zijbalk zelf ook. Twee
maatregelen, die allebei in de testinstance nagemeten worden voordat ze in de
SPEC komen:

- Op de iPad verbergt de infoschermkaart zelf de kop en de zijbalk van Home
  Assistant zodra `kiosk: true` in zijn config staat. Dat is wat het
  HACS-onderdeel kiosk-mode ook doet; we hebben het dan niet als extra
  installatiestap bij de klant nodig. Daaroverheen komt Begeleide Toegang van
  iOS, zodat de iPad de app niet kan verlaten.
- Voor de receptie zetten we het dashboard Beheer als standaard in haar profiel,
  en zetten we in Overzicht niets neer. Wat ze dan nog kan aanklikken is een
  lege pagina.

**Wie mag wat, op de server.** In de options flow wijst de installateur de
kioskgebruiker(s) aan. Die gebruikers mogen alleen aanwezigheid omzetten. Alle
andere ingelogde gebruikers mogen alles beheren. Een aparte code op de iPad is
daarmee niet meer nodig voor het beheer; hij blijft als optie bestaan, zie het
beslispunt in hoofdstuk 7.

## 4. Het scherm (kaart `domotiapp-infoscherm-card`)

iPad 11 inch in landschap is 1194 × 834 CSS-pixels. De kaart is beeldvullend,
en dat is de eerste kaart van de familie buiten het raster van 56px. Dat hoort
in de SPEC te staan als uitzondering, want de vormregel is er niet voor niets:
hij bestaat voor kaarten die naast andere kaarten in een kolom staan, en deze
kaart staat nooit naast iets.

Vier pagina's, onderaan als tabs, en na een instelbare tijd zonder aanraking
(standaard 60 seconden) terug naar de eerste:

| pagina | inhoud |
|---|---|
| **Welkom** | logo, naam van de praktijk, welkomsttekst, klok en datum, weer nu plus de komende uren, de mededeling van de dag, openingstijden |
| **Aanwezig** | de medewerkers als tegels met foto of initialen en functie; tikken op de naam zet aanwezig of afwezig |
| **Nieuws** | berichten van het pand, en optioneel een externe bron (RSS) |
| **Verlichting** | de lampen of groepen die de installateur gekozen heeft; tikken schakelt |

Wat er WEL en NIET van de bestaande vormtaal blijft:

- Achtergrond, inkt en de radius van 20/12 blijven die van DomotiApp. Dat is
  het product.
- Het **accent is dat van de klant**, instelbaar in de editor. Dit is de enige
  kaart waar dat mag, om dezelfde reden als de kleur op de afvalkaart: hier is
  de kleur identiteit van de praktijk, niet van de knop. De regel "alleen het
  icoon draagt de toestand" blijft gelden: een aanwezige medewerker krijgt een
  gevulde chip, een afwezige een lege.
- Typografie schaalt met de kaartbreedte, want vanaf een stoel op drie meter
  moet de klok leesbaar zijn. De HA-font, geen webfonts.
- Geen hover, geen secondewijzer; de klok tikt op de minuut zoals de kopkaart.
- Een lichte en een donkere variant, want een wachtkamer is overdag licht. Dat
  loopt via de HA-themavariabelen, dus via het thema van de kioskgebruiker.

Aanwezigheid: tikken op een naam vraagt geen bevestiging en geen code. De
eigenaar heeft dat zo gevraagd. Om middernacht gaat iedereen op afwezig
(instelbaar), zodat het scherm 's ochtends niet liegt.

Verlichting: gewone `light`- en `switch`-entiteiten, schakelen met een
service-aanroep vanuit de kaart, precies als op de entiteitenkaart. De
kioskgebruiker heeft daar in Home Assistant gewoon rechten voor.

## 5. Het beheer (kaart `domotiapp-infoscherm-beheer-card`)

Een gewone kaart in het dashboard Beheer, `rows: "auto"`. Alles wat de
receptie mag veranderen staat hier, en niets wat de installateur hoort te
doen. Ze ziet nooit een YAML en nooit een entiteit.

| blok | wat |
|---|---|
| **Medewerkers** | lijst met naam, functie, foto; toevoegen, bewerken, verwijderen, volgorde; aanwezigheid ook hier omzetten |
| **Mededeling van de dag** | één tekstregel die op de welkompagina staat, met een einddatum |
| **Nieuws** | berichten met titel, tekst, eventueel een afbeelding, geldig van en tot; de kaart toont alleen wat nu geldig is |
| **Praktijk** | naam, welkomsttekst, openingstijden per dag, logo uploaden |

Het logo: een `<input type="file">` in de beheerkaart, PNG, JPG of SVG tot
2 MB, gepost naar een eigen HTTP-route en opgeslagen onder
`.storage/domotiapp_lovelace/infoscherm/`. Bewust niet als data-URI in de
kaartconfig: dan gaat een bestand van tientallen kilobytes bij elke
toetsaanslag door `setConfig` en de editor (valkuil 23). De HA-editor van de
infoschermkaart krijgt dezelfde uploadknop, zodat de installateur het bij het
plaatsen al kan doen.

## 6. De serverkant (subpakket `infoscherm/`)

Opzet zoals `bewaking/`: `store.py`, `websocket.py`, `http.py`, `const.py`.

**Opslag**, één `Store` met versie, sleutel `domotiapp_lovelace.infoscherm`:

```
praktijk      naam, welkomsttekst, accent, logo (bestandsnaam), openingstijden
personen[]    id, naam, functie, foto, aanwezig, volgorde
mededeling    tekst, geldig_tot
nieuws[]      id, titel, tekst, afbeelding, geldig_van, geldig_tot
instellingen  reset_middernacht, terug_na_seconden, rss_url
```

Validatie en foutgedrag als in SPEC 18.2: wat niet valideert wordt bewaard en
gemeld, en blokkeert de rest niet.

**WebSocket-commando's**, allemaal onder `domotiapp_lovelace/infoscherm/`:

| commando | wie | wat |
|---|---|---|
| `get` | iedereen | alles wat het scherm en het beheer nodig hebben |
| `subscribe` | iedereen | duwt wijzigingen naar alle open schermen, zodat een tik op de iPad meteen op de pc te zien is en andersom |
| `aanwezig` | iedereen, ook kiosk | één persoon aan of af |
| `personen/save`, `nieuws/save`, `mededeling/save`, `praktijk/save` | iedereen behalve de kioskgebruiker | beheer |
| `nieuws/delete`, `personen/delete` | idem | |

**HTTP-routes** met `requires_auth`: upload van logo en foto's, en het
uitserveren ervan met een ondertekende URL, hetzelfde patroon als de
snapshots in `bewaking/http.py`.

**Wat er in een latere ronde bij kan, zonder de opzet te veranderen:**

- Een `binary_sensor` per medewerker, zodat een automatisering de lampen uit
  kan doen als de laatste weg is. Dat is het moment waarop dit ook voor Home
  Assistant zelf een integratie wordt.
- De nieuwsfeed van buiten: de server haalt een RSS-bron elk kwartier op en
  zet hem naast het eigen nieuws.

**Herkansing.** Deze commando's bestaan pas als de config entry is opgezet
(valkuil 28), en een iPad die de hele nacht aanstaat is precies het toestel
dat als eerste terug is na een herstart. Beide kaarten gebruiken
`nogNietGereed` uit `src/herkansing.js`.

## 7. Beslispunten voor de eigenaar

1. **Een code op de iPad zelf: nog gewenst?** Het eerste idee was bewerken op
   het scherm achter een code. Met het beheerdashboard op de pc is dat niet
   meer nodig. Voorstel: in de eerste ronde weglaten, en als optie terugbrengen
   als een klant erom vraagt.
2. **Verlichting open of afgeschermd?** Een bezoeker in de wachtkamer kan dan
   de lampen uitdoen. Voorstel: de pagina Verlichting is er alleen als de
   installateur er lampen in zet, en standaard staat hij open.
3. **Nieuws van buiten: welke bron?** NOS, regionaal, of alleen eigen nieuws.
   Voorstel: eerste ronde alleen eigen nieuws, RSS in ronde twee.
4. **Foto's van medewerkers of initialen?** Foto's zijn mooier en zijn ook wat
   een tandarts op zijn website heeft. Voorstel: allebei, foto als hij er is.
5. **Naam.** DomotiApp Infoscherm, en in de kaartkiezer "DomotiApp Infoscherm"
   en "DomotiApp Infoscherm Beheer".

## 8. Rondes

| ronde | uitgave | inhoud |
|---|---|---|
| 1 | 0.36.0 | `infoscherm/` met store en commando's; infoschermkaart met Welkom, Aanwezig en Verlichting; beheerkaart met Medewerkers, Mededeling en Praktijk inclusief logo; kioskmodus |
| 2 | 0.37.0 | Nieuws in beheer en op het scherm; openingstijden; reset om middernacht |
| 3 | 0.38.0 | RSS-bron; `binary_sensor` per medewerker; de code op het scherm als optie |

Elke ronde wordt in de testinstance nagemeten met echte kliks, en het scherm
zelf in een `div` van 1194 × 834 met de kaart met de hand in de pagina gehangen
(valkuil 21 en 40), want het browservenster verkleinen mag niet.

---

## 20. Infoscherm (het SPEC-hoofdstuk, ter goedkeuring)

*Dit is de tekst die, na goedkeuring, als hoofdstuk 20 in `SPEC.md` komt.
Alles hieronder is bindend zodra het daar staat.*

### 20.1 Doel

Een beeldvullend informatiescherm voor een wachtruimte, op een tablet in
kioskmodus, plus een beheerkaart waarmee een gewone gebruiker de inhoud
onderhoudt zonder Home Assistant te zien.

### 20.2 Uitzondering op de rasterregel

`domotiapp-infoscherm-card` is de enige kaart die niet op rasterrijen van 56px
staat. Hij vult zijn view (`panel`) en wordt nooit naast een andere kaart
geplaatst. `domotiapp-infoscherm-beheer-card` is een gewone groeikaart en volgt
de rasterregel.

### 20.3 Uitzondering op de kleurregel

De infoschermkaart heeft een instelbaar accent, omdat de identiteit hier die
van de klant is. De toestandsregel blijft: alleen de chip van een medewerker of
een lamp draagt de toestand, nooit het hele vlak.

### 20.4 Opslag en rechten

Inhoud staat in `Store` `domotiapp_lovelace.infoscherm`, niet in de kaartconfig.
Rechten:

| handeling | wie |
|---|---|
| lezen, abonneren, aanwezigheid omzetten | iedere ingelogde gebruiker |
| personen, nieuws, mededeling, praktijk en logo wijzigen | iedere ingelogde gebruiker die niet als kioskgebruiker is aangewezen |
| kioskgebruiker aanwijzen | admin, via de options flow |

Een kioskgebruiker die een beheercommando stuurt krijgt `unauthorized`; de
kaart toont dan niets, want het beheer staat op zo'n scherm niet in beeld.

### 20.5 Bestanden

Logo en foto's gaan via een HTTP-route met `requires_auth` naar
`.storage/domotiapp_lovelace/infoscherm/` en worden met een ondertekende URL
uitgeserveerd. Toegestaan: PNG, JPG, SVG, ten hoogste 2 MB. Bestandsnamen komen
uit een ULID langs een witte lijst, zoals bij de snapshots.

### 20.6 Kioskmodus

Met `kiosk: true` verbergt de infoschermkaart de kop en de zijbalk van Home
Assistant in zijn eigen tabblad. Dit vervangt geen Begeleide Toegang; het
zorgt alleen dat er niets van Home Assistant in beeld staat.

### 20.7 Foutgedrag

- Commando's die nog niet bestaan na een herstart worden opnieuw geprobeerd
  (`nogNietGereed`).
- Valt de verbinding weg, dan blijft het scherm zijn laatste inhoud tonen en
  toont het een klein merkje; het gaat niet op zwart.
- Een onleesbare store blokkeert het scherm niet: wat wel leesbaar is wordt
  getoond, en de rest wordt gemeld in het herstelcentrum, als in SPEC 18.2.
