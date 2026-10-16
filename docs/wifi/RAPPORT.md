# Wifi voor gasten: een kaart en een blok op het infoscherm (0.74.0)

16 oktober 2026. De vraag van de eigenaar:

> *"en ik wil een wifi gastennetwerk kaart hebben dat ook op het dashboard kan
> ik heb een qr code van unifi als entiteit namelijk"*

## Wat UniFi geeft, en wat niet

Gemeten met een echte dump bij een klant (Home Assistant 2026.10.1, gemaakt
door een beheersessie, alleen gelezen). Geanonimiseerd vaste testinvoer:
`tests/js/vaste-invoer/unifi-wlan-qr.json`.

- Per wifi-netwerk een `image` met `translation_key: wlan_qr_code`: een PNG
  van ongeveer 300 bytes. UniFi maakt hem alleen met een beheerdersaccount,
  en uitgeschakeld; hij moet met de hand aan.
- Het apparaat heet zoals het netwerk (model "UniFi WLAN"). Dat is de enige
  plek waar de netwerknaam staat; `friendly_name` heeft de vertaalde
  "QR-code" erachter.
- **Het wachtwoord staat nergens** als entiteit of attribuut, alleen in de
  QR-code. Wie het als tekst wil tonen, typt het in.
- `entity_picture` draagt een token dat ongeveer elke vijf minuten wisselt.

## Wat er gebouwd is

### De kaart DomotiApp Wifi (`domotiapp-wifi-card`)

- **Wat erop staat:** de QR-code, de netwerknaam (uit UniFi, of een eigen
  naam), en als je het invult het wachtwoord.
- **Tikken:** de code staat groot in beeld, om aan een gast te laten zien.
  Dat scherm hangt aan `document.body`, dus het werkt ook in een pop-up
  (valkuil 34).
- **Maat:** drie rasterrijen (184 px), de hele sectie breed. Op een halve
  sectie wordt de code kleiner. De code is 148 px: precies de PNG van UniFi,
  dus niets opgeschaald.
- **Een nieuwe kaart** kiest zelf de QR-code van een gastnetwerk als die er is.

### Het infoscherm

- **Installateur:** in de kaarteditor van het beheer, *Wifi voor gasten (de
  QR-code)* (`wifi`).
- **Receptie:** in het beheer een blok **Wifi voor gasten**, met de code ter
  controle, de *Netwerknaam op het scherm* (leeg = die uit UniFi) en het
  *Wachtwoord op het scherm* (leeg = alleen de code).
- **Scherm:** een blok **Wifi** (via Indeling, Blok toevoegen) met de code, de
  naam en het wachtwoord. Daarachter een pagina met de code groot en de uitleg
  ("Open de camera van uw telefoon (...)").

`SPEC.md` 20.4 en 20.7 zijn bijgewerkt.

## Een fout die we met de dump vóór waren

Home Assistant verandert `entity_picture` alleen als het token wisselt, niet
als het beeld verandert (`ENTITY_IMAGE_URL` in `components/image`). Maakt
iemand in UniFi een nieuw wachtwoord, dan bleef het adres dus tot vijf minuten
hetzelfde. Een `<img>` met hetzelfde adres haalt niets opnieuw op, en het
scherm zou een code tonen waarmee je niet meer binnenkomt. Daarom zet
`qrAdres` de toestand erachter (`&v=`; de toestand van een image is het
tijdstip van het laatste beeld). `image_proxy` kijkt alleen naar `token`.

Nagemeten op het scherm (kioskaccount): een nieuw wachtwoord via de nep-UniFi.
Binnen 2,5 seconden had de code een ander adres en andere pixels, met hetzelfde
token en een andere `v`. Zonder `v` was het adres gelijk gebleven.

## Bewijs in een echte browser

Testinstance met een nagebootste UniFi (`nep_unifi`, niet in git): twee
netwerken, model "UniFi WLAN", `image` met `wlan_qr_code`, een PNG van `segno`
op schaal 4, zoals UniFi hem maakt. `image_proxy` gaf 200, `image/png`, 312
bytes; bij de klant waren het er 306. Verse code: `?v=` gelijk aan de sha256 op
schijf na elke build (`ef10453be87b`, `9240ccedd4ca`, `1979c85b15c7`).

**Het beheer** (als `dev`): het blok Wifi begint dicht. De code staat erin
(148 px breed geladen). *Wifi voor patiënten* en *welkom bij ons 2026* zijn
getypt met vijf spaties, alle vijf `isTrusted: true`. Op de server, en de
teller in de kop zegt "Wifi voor patiënten".

**Het scherm** (als het kioskaccount):

| | gemeten |
|---|---|
| code in het blok | 168,3 × 168,3, geladen (148 px), `image-rendering: pixelated` |
| ruimte boven en onder de code | 11,5 en 11,5 |
| code op de pagina (na een echte klik op Alles bekijken) | 421,5 × 421,5 |
| ruimte boven en onder op de pagina | 130,7 en 130,7 |

**De kaart** (`kaart-test`, view `wifi`, vijf varianten):

| variant | hoogte | code |
|---|---|---|
| gewoon | 184 | 148 × 148, 18 boven en onder |
| met naam en wachtwoord | 184 | 148 × 148 |
| een QR die niet bestaat | 184 | vak met uitleg |
| zonder entiteit | 184 | de uitlegkaart |
| zes kolommen breed | 184 | 112 × 112 |

De tweede kaart begint op 272 = 80 + 184 + 8. Tik (echte klik): de code groot,
520 × 520, scherp, aan `document.body`. Tik ernaast: dicht. In het lichte thema
van Home Assistant nagekeken op een schermafdruk.

## Wat er bij het meten misging en gerepareerd is

1. **Zes kolommen breed** was te smal: de tekst naast de code werd een strookje
   ("Ga...", en het kopje op drie regels), en de kaart werd hoger dan drie
   rijen. Nu standaard de hele sectie, en op een halve een kleinere code.
2. **186 in plaats van 184**: 152 plus marge plus rand. De code is nu 148, de
   maat van de PNG zelf.
3. **312 hoog (vijf rijen)**: `meetRaster` telt de kinderen van het vak onder
   elkaar op, en de code en de tekst stonden naast elkaar als twee kinderen.
   Nu staan ze in één rij. Staat als valkuil 74 in CLAUDE.md.

## Tests

- **NIEUW GEDRAG**, `tests/js/wifi-logica.test.mjs` (10), op de echte dump:
  herkennen, netwerknaam (apparaat, eigen naam, hernoemd, zonder apparaat, in
  het Engels), het adres met het token van nu en de versie, een nieuw beeld
  met hetzelfde token, wat de kaart zegt zonder code, en welke code een nieuwe
  kaart kiest. Op `main`: de module bestaat niet.
- **NIEUW GEDRAG**, `tests/js/infoscherm-wifi.test.mjs` (3), met één
  **REGRESSIEWACHT** (de standaardindeling); die slaagt op `main`, de andere
  twee niet.
- **NIEUW GEDRAG**, `tests/infoscherm/test_wifi.py` (9). Alle negen falen op
  `main`.

## Controles

- `npm run build`, `verify`, `check:registratie`, `check:css`,
  `check:controls`: groen.
- `npm test`: 1922 tests, alle groen.
- Python: 864 tests, alle groen (lokaal in Docker).

## Samenvatting

De QR-code van het gastnetwerk staat nu op een gewoon dashboard (met tikken
voor groot) en op het infoscherm (blok en pagina). De naam komt uit UniFi, het
wachtwoord als tekst alleen als iemand het intypt, want UniFi geeft het niet
door. Een nieuw wachtwoord in UniFi staat meteen als nieuwe code op het
scherm.

## Wat niet lukte

Niets. Het wachtwoord automatisch tonen kan niet via Home Assistant: het staat
alleen in de QR-code. Het kan wel uit de integratie van UniFi zelf gelezen
worden (`x_passphrase` van het netwerk), maar dat is binnenwerk van een andere
integratie en breekt bij een update. Daarom niet gedaan; zeg het als je het
toch wilt.

## Aannames

- Dat het wachtwoord als tekst niet verborgen hoeft (geen oogje): het is het
  GASTnetwerk, en de code bevat het toch al. Op het infoscherm en de kaart
  staat het alleen als iemand het invult.
- Dat de kaart standaard de hele sectie breed mag zijn.

## `git status --porcelain`

Schoon na de commit.
