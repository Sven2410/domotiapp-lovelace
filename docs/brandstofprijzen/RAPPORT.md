# De brandstofkaart: adviesprijzen als prijsborden — 0.143.0

## Waarom

De eigenaar, 27 november 2026, via zijn beheersessie. De HACS-integratie voor brandstofprijzen werkte niet meer: alle
sensoren stonden op unknown. Hij vroeg: *"kan jij zelf niet met lovelace iets maken? Dus een brandstofprijzen kaart van
NL?"*

Daarna gaf hij nog drie dingen mee:
- een voorbeeld van een Duitse kaart: *"kan die het zo maken bijvoorbeeld? In de style van een tankstation etc"*;
- over prijzen per pomp: *"nee ik wil de adviesprijzen want je kan toch niet elke pomp in Nederland pakken of wel?"*;
- en: *"oke ik wil alleen een map dan met tankstations en dan gewoon de gemiddelde adviesprijs bovenaan"*.

Deze ronde bouwt de prijsborden. De kaart met de tankstations komt in de volgende.

## De bron

UnitedConsumers publiceert de Gemiddelde Landelijke Adviesprijs (GLA) per dag. robots.txt staat het lezen toe. Gelezen
op 27 november 2026; de pagina's staan ingekort in `tests/js/vaste-invoer/unitedconsumers-*.html`:

- **De lijstpagina** heeft per brandstof een link `/tanken/brandstofprijzen/product/<slug>` met de naam in `title`, en
  daarna de prijs ("€ 2,377"). Onderaan staat de datum van het overzicht.
  - Er staan zeven brandstoffen, ook Super MLV en de premiums. De beheersessie zag er eerst vier.
  - De oude integratie zocht op een markering die weg is. De klassen zijn gehasht en veranderen, dus hier wordt op de
    link gelezen.
- **Een productpagina** heeft een jaar dagprijzen als JSON, tot en met gisteren. Daaruit komen gisteren, het verschil en
  het lijntje.
  - Het verschil klopt met dat van de site: Euro95 +0,2 cent, Diesel +1,7 cent.

## Wat er gebouwd is

**`brandstof.py` (de server):**
- **Ophalen** gebeurt alleen als een kaart erom vraagt (`domotiapp_lovelace/brandstof/prijzen`), en dan hooguit eens per
  uur. Een installatie zonder kaart haalt niets op, en tien tablets halen het één keer op.
- **De productpagina's** worden eens per dag opgehaald. Binnen de dag alleen een die nog ontbrak.
- **Bewaren:** alles staat in de opslag, dus na een herstart staan de laatste prijzen er meteen.
- **Bij een fout** blijven de oude prijzen staan, met de fout erbij, en volgt er na vijf minuten een nieuwe poging. Ook
  een pagina zonder prijzen (de site veranderd) is een fout.
- **Geen adres van de kaart**, net als bij het nieuws. Een slug van de pagina wordt alleen gebruikt als hij uit letters,
  cijfers en streepjes bestaat.

**`domotiapp-brandstof-card` (de kaart):**
- **Kop:** "Brandstofprijzen · Landelijke adviesprijs van 27 nov".
- **Per brandstof een bord:**
  - de naam;
  - de trend tegenover gisteren: rood ▲ duurder, groen ▼ goedkoper, = gelijk. Dat zijn statuskleuren;
  - de prijs in cijfers van zeven segmenten, met de laatste cijfer klein en hoog: "€ 2,37⁷". De cijfers zijn eigen SVG,
    zonder webfont, en de uitgezette staafjes zijn zwak zichtbaar, zoals op een echt bord;
  - een lijntje van de laatste 30 dagen.
- **Onderaan:** "Bron: UnitedConsumers". Is de laatste poging mislukt, dan zegt de kop "Niet bijgewerkt".
- **Editor:**
  - titel en icoon;
  - welke brandstoffen. Standaard Euro95, Diesel, LPG en Super; alle zeven kunnen;
  - het lijntje aan of uit.
- **Verversen:** de kaart vraagt bij het tekenen, als de pagina weer zichtbaar wordt, en elk half uur. Na een herstart
  probeert hij het opnieuw (valkuil 28).

Het voorbeeld van de eigenaar had een rij per tankstation met adres en "open". Dat zit er niet in: hij koos de adviesprijs.
Het ontwerp is eigen werk, in de vormtaal van de kaarten.

## Proeven

**NIEUW GEDRAG.** Beide bestanden vallen op main om, omdat de modules daar niet bestaan:

```
# Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../oud-main/src/cards/brandstof-logica.js'
E   ImportError: cannot import name 'brandstof' from 'custom_components.domotiapp_lovelace'
```

`tests/test_brandstof.py` heeft tien proeven:

- **Lezen:** de echte lijst van 27 november geeft zeven brandstoffen met naam en prijs, en de datum. De reeks van Euro95
  geeft 365 dagen. Wat de kaart krijgt: Euro95 gisteren 2,375 en +0,002; Diesel zonder reeks heeft geen gisteren.
- **Een vreemde slug** (`..%2F..%2Fadmin`) wordt geen adres.
- **Ophalen:**
  - eens per uur de lijst, eens per dag de reeksen;
  - een ontbrekende reeks wordt binnen de dag alleen zelf opnieuw gevraagd;
  - bij een fout blijven de prijzen staan, met een nieuwe poging na vijf minuten. Een verbouwde pagina is ook een fout;
  - na een herstart komen de prijzen uit de opslag, zonder op te halen;
  - het commando werkt.
- **De kaart en de server** kennen dezelfde zeven brandstoffen.

`tests/js/brandstof.test.mjs` heeft vijf proeven:

- het bord: de laatste cijfer apart;
- de trend in centen;
- de staafjes per cijfer en de komma;
- het lijntje;
- de keuze en de datumregel.

Alles samen: 2602 JS-proeven en 1250 Python-proeven groen, plus `verify`, `check:registratie`, `check:controls`, `check:css`
en `check:taal`. Twee dingen vingen de bewakers:

- `--mdc-icon-size` ontbrak bij het icoon in de kop (valkuil 77);
- een lege prijs gaf "0,00".

## In de browser gemeten

De testinstance haalde de echte prijzen van UnitedConsumers op. Op `kaart-test` staat een view `brandstof` met de kaart
zoals hij standaard is, en een met alle zeven brandstoffen.

**390 breed**, met `isMobile` en `hasTouch`, in donker en licht. Bundel `e41b484cbdbd`, gelijk aan schijf.

- **Borden:** twee naast elkaar, elk 170 breed. `scrollWidth` is gelijk aan `clientWidth`: 348/348 voor het vak en 390/390
  voor de pagina.
- **Cijfers:** 71×30, de staart 16 hoog en bovenaan uitgelijnd. Elke prijs past in zijn bord, en elk bord heeft een lijntje.
- **Kaart:** 312 hoog (vijf rasterrijen); die met zeven borden is 568 (negen).
- **Wat er stond:** "Euro95 ▲+0,2 ct | € 2,377", "Diesel ▲+1,7 ct | € 2,420", "LPG =gelijk | € 1,335",
  "Super ▲+0,5 ct | € 2,579".
- **Fouten in de console:** geen.

Op **1180 breed** steekt niets uit en zijn er geen fouten.

## Samenvatting

Er is een eigen brandstofkaart:
- de landelijke adviesprijzen als prijsborden zoals bij een tankstation;
- de trend tegenover gisteren en een lijntje van een maand;
- het ophalen doet de integratie, alleen als er een kaart kijkt en hooguit eens per uur. De prijzen overleven een herstart.

## Wat niet lukte

- **De editor** is niet met tikken gemeten. Het zijn gewone velden van Home Assistant (tekst, keuzelijst, schakelaar).
- **Niet bij de eigenaar zelf gezien.** De beheersessie zet de kaart in plaats van de oude rij zodra de uitrol hem erop zet.
  De oude YAML-integratie haalt de eigenaar zelf weg.
- **De kaart met de tankstations** komt in de volgende ronde.

## Aannames

- De datum van het overzicht is de dag van de prijs. Gisteren is de laatste dag in de reeks daarvoor.
- Eens per uur is vaak genoeg voor een prijs die eens per dag verandert. Dat is ook wat de beheersessie voorstelde.

## `git status --porcelain`

(vlak voor het vastleggen)

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/__init__.py
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/i18n/en.js
 M src/index.js
?? custom_components/domotiapp_lovelace/brandstof.py
?? docs/brandstofprijzen/
?? src/cards/brandstof-card.js
?? src/cards/brandstof-logica.js
?? src/i18n/en/brandstof.js
?? tests/js/brandstof.test.mjs
?? tests/js/vaste-invoer/unitedconsumers-euro95-2026-11-27.html
?? tests/js/vaste-invoer/unitedconsumers-lijst-2026-11-27.html
?? tests/test_brandstof.py
```
