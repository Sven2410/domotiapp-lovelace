# DomotiApp Infoscherm: het wachtkamerscherm en het beheer

**Datum:** 9 september 2026
**Uitgave:** 0.36.0
**Tak:** `fase-41/infoscherm`

## Wat er gevraagd is

De eigenaar kreeg aanvragen van tandartsen en woon-zorginstellingen voor een
informatiescherm. Na het voorstel (`VOORSTEL.md`, PR #60) kwamen de
antwoorden op de vijf beslispunten en de opdracht:

1. *"Ipad draait gewoon een normale gebruiker met de integratie kiosk-mode
   zijbalk en header weg. Puur info waar op getikt kan worden etc zoals
   aanwezigheid."* Dus geen code op de iPad.
2. Verlichting: *"Optie mag de receptie bijvoorbeeld bepalen, soms hangt een
   tablet aan de muur in een kantoor waar alleen medewerkers zitten."*
3. Nieuws: *"Ik wil zoveel mogelijk opties hebben."*
4. Foto's of initialen: *"Beide opties."*
5. Merk: *"Op de Ipad niet laten zien van domotiapp. Op de beheerders scherm
   wel iets."*

En: *"Maak hem echt zo uitgebreid mogelijk met alle mogelijke opties wat jij
denkt mooi en leuk en functioneel te zijn."* Dat is als goedkeuring van het
voorstel gelezen; hoofdstuk 20 staat nu in `SPEC.md`.

## Wat er gebouwd is

### Serverkant: `custom_components/domotiapp_lovelace/infoscherm/`

| bestand | wat |
|---|---|
| `store.py` | één `Store` met praktijk, personen, mededelingen, nieuws, instellingen en bestanden; validatie per onderdeel, kapotte onderdelen worden overgeslagen en niet meegesleept |
| `websocket.py` | elf commando's (`get`, `subscribe`, `aanwezig`, vijf `*/save`, `bestand/verwijder`, `feeds/ververs`, `gebruikers`) met de rechtenregel: kioskaccounts tikken alleen, admins wijzen de kioskaccounts aan |
| `http.py` | uploaden (multipart, soort uit de inhoud, 4 MB) en uitserveren met `requires_auth`, SVG in een sandbox |
| `bestanden.py` | de bestanden op schijf onder de configuratiemap, ULID langs een witte lijst |
| `feeds.py` | RSS 2.0 / RSS 1.0 / Atom, elk kwartier, HTML eruit, afbeelding erbij |
| `__init__.py` | opzet, feedlezer, en de middernachtklok die iedereen op afwezig zet |

### Kaartkant

**`domotiapp-infoscherm-card`** (het scherm, `src/cards/infoscherm-card.js`):
beeldvullend in een `panel`-view, alles schaalt met de breedte (`--s`). Vijf
pagina's: Welkom (logo, naam, adres, klok, wisselende welkomsttekst, weer met
uurvoorspelling, mededeling van de dag, openingstijden met "nu geopend tot"),
Aanwezig (tegels met foto of initialen, tikken zet om, teller "5 van 6"),
Nieuws (eigen berichten vóór de feeds, vastgezet bovenaan, tikken opent het
hele bericht), Verlichting (lampen en schakelaars, lampkleur in de chip) en
Agenda (afspraken van vandaag uit gekozen agenda's). Verder: terug naar Welkom
na een instelbare tijd, carrousel, nachtstand buiten de openingstijden met
"Gesloten · morgen open om 07:00", een lichte uitvoering, ronde of vierkante
foto's, groeperen per functie, schaal voor een tv, en een merkje bij een
verbroken verbinding. Tweeëntwintig instellingen in de editor.

**`domotiapp-infoscherm-beheer-card`** (`src/cards/infoscherm-beheer-card.js`):
vijf uitklapblokken met elk een eigen Opslaan: Medewerkers (naam, functie,
foto, aanwezig, volgorde), Mededeling van de dag (met van/tot), Nieuws van het
pand (titel, tekst, afbeelding, van/tot, vastzetten), Praktijk (naam, adres,
welkomsteksten, logo, accentkleur, openingstijden met twee vakken per dag,
afwijkende dagen) en Instellingen (middernacht, verlichting tonen, RSS-bronnen
met "Nu ophalen" en de fout per bron, en voor admins de kioskaccounts). Typen
tekent niets opnieuw; een blok dat vuil is wordt niet door de server
overschreven.

**`src/infoscherm-client.js`**: de commando's, het abonnement, uploaden en een
blob-cache voor de bestanden. **`src/cards/infoscherm-logica.js`**: het
rekenwerk zonder DOM (openingstijden, geldigheid, nieuwsvolgorde, klok), met
19 tests.

## Bewijs

### Tests

| | vóór | ná |
|---|---|---|
| JS (`npm test`) | 979 | **998**, alle groen; 19 nieuw in `tests/js/infoscherm-logica.test.mjs` |
| Python (Docker) | 604 | **646**: eerste volledige run 645 groen en 1 rood (zie hieronder), daarna gerepareerd en `tests/infoscherm` opnieuw groen |

Alles **NIEUW GEDRAG**: `infoscherm/` en de drie JS-bestanden bestonden niet.
De ene rode test (`test_een_abonnee_krijgt_elke_wijziging`) nam aan dat het
eerste event een `stand` was; bij het opstarten meldt de feedlezer eerst zijn
lege lijst als `feeds`. De test zoekt nu het `stand`-event. Twee echte fouten
die de tests vingen vóórdat er een browser aan te pas kwam:

- **`id` als parameternaam van een WS-commando botst met het berichtnummer
  van Home Assistant.** `bestand/verwijder` kreeg `KeyError: 'result'`.
  Hernoemd naar `persoon` en `bestand`.
- De `-x`-run stopte daar; de rest kwam pas in de volledige run.

### Verse code

Bij elke bouw gemeten met `fetch(url, {cache: "reload"})` na het wissen van de
service worker, tegen de uitvoer van `npm run build`:

| bouw | bytes | sha256 (begin) |
|---|---|---|
| eerste | 732.633 | `7c8b40d43d5dbc61` |
| `[hidden]` en hoogte | 732.999 | `04187cbbbc4e39b3` |
| hoogte in de ResizeObserver | 733.041 | `f823c15d9f7b5a63` |
| abonnement zonder `isConnected` | 733.146 | `7d3991580e86bc9b` |
| tegels als `div` | 733.654 | `1e0c08b63a070c35` |
| containerquery | 733.847 | `f8b996929097591b` |
| **0.36.0** (alleen het versienummer) | 733.847 | `690419add0ef0f34` |

De browsermetingen zijn op de bouw met `f8b99692` gedaan; 0.36.0 verschilt
daarvan alleen in de versietekst.

### Het scherm, met echte kliks (testinstance 8127, tabblad zichtbaar)

| handeling | `isTrusted` | wat er gemeten is |
|---|---|---|
| tab Aanwezig | `true` op `BUTTON.tab` | `pagina_` = `aanwezig`; zes tegels van 520×109 met 14 px ertussen |
| tik op Sanne Koster | `true` op `BUTTON.persoon` | WS `aanwezig {persoon, aanwezig: true}` verstuurd; server: `aanwezig: true`; kop "5 van 6 aanwezig" |
| terugvaltimer | -- | 108 s na de laatste tik stond `pagina_` weer op `welkom` (ingesteld: 60 s) |
| tab Nieuws, tik op een bericht | `true` | detaillaag `open`, titel en tekst erin; Sluiten sluit hem |
| tab Verlichting, tik op Test Lamp Dim | `true` op `.lamp` | `homeassistant.toggle` aangeroepen; toestand `off`; tegel "Uit" |
| nachtstand | -- | na woensdag 07:00–12:00 in het beheer: laag `open`, "Gesloten · morgen open om 07:00"; een tik sluit hem 54 s |
| abonnement | -- | openingstijden en een tweede mededeling uit het beheer stonden binnen een seconde op het scherm, zonder herladen |
| NOS-feed | -- | 15 berichten met afbeeldingen, na de reparatie hieronder |

Hoogte: `--hoogte` = `calc(100dvh - 56px)`, scherm 855 px in een venster van
911 px, tabs onderaan in beeld. Logo: `<img>` van 256×256 uit een `blob:`-URL,
70×70 op het scherm.

### Het beheer, met echte toetsaanslagen

- Klik in het naamveld van de eerste medewerker, End, en getypt ` Jr`: keydown
  van de spatie `isTrusted: true`, waarde `Marieke de Vries Jr`, werkkopie
  gelijk, blok vuil, **focus nog in het veld** (er is niets opnieuw getekend).
- Klik op Opslaan (`isTrusted: true` op `BUTTON.knop acc vuil`): server heeft
  `Marieke de Vries Jr`, initialen `MJ`, en `aanwezig` bleef `true` (het beheer
  overschrijft de iPad niet).
- In een kolom van 500 px: `grid-template-columns` `44px 344px 0px`, het
  naamveld 344 px breed (containerquery).

### De editor van de beheerkaart (ha-form, dialoog zichtbaar)

Titel-veld: geklikt, End, ` 2` en ` 3` getypt. Keydown van de spatie
`isTrusted: true` op `INPUT`, per aanslag een `config-changed`, het voorbeeld
ernaast toonde "Infoscherm De Molen 2 3", focus bleef in het veld. Daarna
geannuleerd.

### Wat het meten opleverde (zeven reparaties)

1. **Een `[hidden]`-vak stond gewoon in beeld.** `.vak { display: flex }` wint
   van het `[hidden]` van de browser; `[hidden] { display: none !important }`
   erbij.
2. **De tabs vielen onder de rand.** `100dvh` telt de kop van HA niet af. De
   kaart meet nu zijn eigen bovenkant en trekt die af -- in de ResizeObserver,
   want bij het bouwen is die bovenkant nog 0 (valkuil 25).
3. **Het abonnement kwam nooit aan.** `wire()` draait terwijl `isConnected`
   nog false is, en een toets daarop zei het abonnement meteen weer op. De
   tik op een naam werkte (eigen aanroep), een wijziging uit het beheer nooit.
   Nu een "dood"-vlag uit de teardown in plaats van `isConnected`. De
   weerkaart heeft dezelfde toets nog; zie *Wat niet lukte*.
4. **De NOS-feed kwam half aan:** "unclosed CDATA section". `content.read(n)`
   geeft wat er toevallig binnen is; nu `iter_chunked` tot het einde.
5. **De samenvatting schoof over de titel.** Een `<button>` is in Chrome geen
   echte flexcontainer. De tegels zijn nu `<div role="button" tabindex="0">`.
6. **Smalle kolom, brede mediaquery.** De beheerkaart staat in een kolom van
   500 px in een venster van 1920; de mediaquery zag het venster. Nu een
   containerquery.
7. **`id` als WS-parameter** (zie Tests).

## Wat niet lukte

- **Uploaden via de bestandskiezer is niet met de browsertool te bedienen**
  (native kiezer, zie CLAUDE.md). De uploadroute is bewezen met de
  Python-tests (soort uit de inhoud, 4 MB, kiosk 403, anoniem 401) en vanuit
  de paginacontext met `fetch` + `FormData`; het logo en de foto die zo zijn
  geplaatst staan op het scherm. De knop "Logo kiezen" zelf opent alleen de
  kiezer en is niet verder gemeten.
- **De uurvoorspelling is niet gezien:** de demo-weerbron van de testinstance
  geeft geen uurvoorspelling, dus het vak bleef leeg (en verborgen). De code
  is die van de weerkaart.
- **De agendapagina, de carrousel, de lichte uitvoering en het groeperen per
  functie zijn niet in de browser gemeten.** De logica erachter zit in de
  unittests; de pagina's zelf niet in de testconfig.
- **De middernachtreset is alleen in de Python-test bewezen**, niet door een
  nacht te wachten.
- **De weerkaart (`forecast-card.js`) heeft dezelfde `isConnected`-toets** als
  reparatie 3. Niet aangeraakt: buiten deze ronde, en daar hangt het
  abonnement aan een gewone view waar de volgorde anders kan liggen. Wel
  gemeld in CLAUDE.md.
- **Twee keer een leeg scherm dat geen fout was:** de view had zijn kaart nog
  niet gebouwd (valkuil 9), en één keer stond het tabblad verborgen achter een
  ander tabblad van hetzelfde Chrome-venster; de `^{TAB}`-omweg uit CLAUDE.md
  bracht hem in één stap naar voren.

## Aannames

- Een iPad van 11 inch in landschap is 1194×834 CSS-pixels; dat is de maat
  waarop `--s` = 1.
- kiosk-mode haalt de kop en de zijbalk weg; de kaart doet dat niet zelf. Dat
  is wat de eigenaar zei en het is niet nagemeten met die integratie.
- De NOS-feed (`https://feeds.nos.nl/nosnieuwsalgemeen`) is het voorbeeld in
  de hulptekst; welke bron een klant wil is aan de receptie.
- De praktijknaam en de medewerkers in de testinstance zijn verzonnen.

## `git status --porcelain`

Zie het commit; bij het schrijven van dit rapport stonden alleen de bestanden
van deze ronde open.
