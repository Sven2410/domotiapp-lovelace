# De windbeveiliging wijzigen op de kaart (0.134.0)

De eigenaar, 17 november 2026, via zijn beheersessie. Hij tikte op de rij Windbeveiliging en kreeg het scherm van de
windsensor. Hij wil de windbeveiliging daar wijzigen, net als een gewone automatisering: met het dialoog dat een regel ook
krijgt.

De beheersessie noemde wat erin hoort:
- de grens, de sensor, welke zonneschermen meedoen, en per scherm omgekeerd;
- misschien aan of uit.

Twee eisen erbij:
- bij de eigenaar staat dezelfde kaart op twee dashboards, en die moeten gelijk blijven;
- zijn huidige waarden moeten meekomen.

## Wat er veranderd is

**Een tik op de rij opent het dialoog Windbeveiliging** (`src/cards/automatisering-wind-scherm.js`). Het heeft dezelfde
vorm en hetzelfde stijlblad als het scherm van een regel. Van boven naar beneden:
- de wind van nu, de uitleg en de laatste ingreep;
- de knop **Windsensor bekijken**, die het scherm van de sensor opent;
- **Windbeveiliging aan**. Uit is geen windgrens: de schermen rollen dan ook bij harde wind uit;
- **Windgrens**: een stapper in stappen van 5 km/h, tussen 5 en 100;
- **Windsensor**: de sensoren die een windsnelheid kunnen zijn, met hun meting erbij. Twee met dezelfde naam krijgen hun
  entity_id erachter. Een Shelly-weerstation heeft er twee die "Speed" heten, en anders zie je niet welke de windstoten is;
- **Zonneschermen**: per scherm "Doet mee met de windbeveiliging" en "Motor omgekeerd". Die laatste geldt ook voor de
  regels. Bij een scherm dat zich niet als zonnescherm meldt, staat de waarschuwing erbij.

**Waar het staat.** In de opslag van de integratie (`wind_instelling`), voor het hele huis. Twee dashboards met dezelfde
kaart blijven zo vanzelf gelijk, en de motor kende al één windsensor voor het hele huis.

Wat er in de opslag staat, gaat voor de kaartconfig:
- `zonder` is een uitsluitlijst: de zonneschermen van de kaarten die NIET meedoen. Een scherm dat later in de editor op
  een kaart komt, is dus meteen beschermd.
- `omgekeerd` staat per scherm. Een scherm dat er niet in staat, volgt de kaart.
- Alleen schermen die als zonnescherm op een kaart staan, tellen. Een ander rolluik omkeren kan dus niet via de wind.

**De overgang gaat vanzelf.** Zolang er niets is opgeslagen, geldt de kaartconfig, zoals in 0.133.0. Het dialoog opent
met die waarden. De eerste keer Opslaan zet ze in de opslag. Bij de eigenaar komt dus mee:
- de windstoten-sensor;
- 30 km/h;
- vier schermen, waarvan drie omgekeerd.

**Alleen een beheerder kan opslaan.** `automatisering/wind_opslaan` heeft `require_admin`: uitzetten of de grens hoog
zetten is een scherm in de storm. Een gewone gebruiker ziet hetzelfde dialoog om te lezen:
- alles staat uit;
- er is geen Opslaan, en de knop eronder heet Sluiten;
- erboven staat "Alleen een beheerder kan de windbeveiliging wijzigen."

De windsensor bekijken kan iedereen. Aan zonder sensor kan niet opslaan ("Kies een windsensor.").

**Op de kaart.** Staat de beveiliging uit, dan zegt de rij "Staat uit" en is het icoon grijs. Doet er geen scherm mee,
dan blijft de rij staan, zodat je ze weer aan kunt zetten.

## Gemeten

Playwright, 390 en 320 breed, `isMobile` en `hasTouch`. Verse code: `?v=bd6907a18af8`, gelijk aan de sha256 op schijf, na
het herladen van de entry. Gemeten op view `automatisering` van `kaart-test`, als beheerder (`dev`) en als gewone
gebruiker (`receptie`).

**Als beheerder:**
- Een tik op de rij kwam aan met `isTrusted: true`. Het dialoog ging open, en niet het scherm van de sensor.
- Zonder opslag (`bron: kaart`) stonden de waarden van de kaart erin: 30 km/h, de windstoten, Zonnescherm keuken doet
  mee, niet omgekeerd.
- Een tik op plus gaf 35 km/h. Een tik op Motor omgekeerd zette dat vinkje aan. Opslaan sloot het dialoog.
- De stand van de server zei daarna `bron: opslag`, `max: 35`, `omgekeerd: ["cover.kitchen_window"]`.
- Windsensor bekijken sloot het dialoog en opende het scherm van `sensor.weather_station_speed_2`.

**Als gewone gebruiker:**
- Hetzelfde dialoog, met de zin "Alleen een beheerder kan de windbeveiliging wijzigen."
- Alle vinkjes en knoppen staan uit, Opslaan is weg en de knop eronder heet Sluiten.
- Een tik op plus deed niets: de grens bleef 30.

**Breedte en tekst:**
- Het vak is 356 = 356 op 390, en 286 = 286 op 320. De pagina is 390 = 390 en 320 = 320.
- In de eerste versie waren de uitleg onder de vinkjes en het eind van een sensornaam afgekapt. Dat is gezien op de
  schermafdruk en gerepareerd: die tekst loopt nu door. De meting telt nu nul afgekapte teksten op beide breedtes.

Geen paginafouten. Eén keer verscheen er een fout direct na een herstart van de testinstance: een import van de vorige
`?v=`. Bij de meting daarna, zonder herstart, was hij er niet.

Na de meting is de testinstance teruggezet naar 30 km/h, niet omgekeerd. De instelling staat nu in de opslag.

## Proeven

`tests/automatisering/test_zonneschermen.py` kreeg 8 proeven, NIEUW GEDRAG:
- zonder opslag geldt de kaart;
- een beheerder wijzigt grens, wie meedoet en omgekeerd, en dat geldt meteen;
- uit is geen windgrens;
- een nieuw scherm op de kaart doet meteen mee;
- alleen wat op een kaart staat telt;
- aan zonder sensor kan niet;
- een gewone gebruiker krijgt `unauthorized`;
- de instelling overleeft een herstart.

`tests/js/windbeveiliging-wijzigen.test.mjs` heeft 11 proeven, NIEUW GEDRAG:
- `windConcept`, `windNaarServer`, `stapGrens`, `windWaaromNiet`, `windSensoren` en `sensorNamen`;
- de rij bij uit en zonder schermen;
- door de bron te lezen: de tik opent het dialoog, de sensor staat als knop erin, en alleen een beheerder kan wijzigen.

Tegen de code van main: JS `pass 0, fail 7` (het bestand had er toen 7), en de 8 nieuwe Python-proeven falen.

Alles bij elkaar:
- 2535 JS-proeven en 1178 Python-proeven, groen;
- `verify`, `check:registratie`, `check:controls`, `check:css` en `check:taal`, groen.

## Samenvatting

0.134.0 opent bij een tik op Windbeveiliging een dialoog zoals bij een regel: aan of uit, grens, sensor, en per scherm
meedoen en omgekeerd. Het staat in de opslag, voor het hele huis, zodat twee dashboards gelijk blijven. Tot de eerste keer
Opslaan geldt de kaart, dus de waarden van de eigenaar komen vanzelf mee. Alleen een beheerder kan het wijzigen.

## Wat niet lukte

- **Niet op een echte installatie met vier schermen gezien.** In de testinstance staat één demomarkies.
- **Alleen in het lichte thema gemeten.**

## Aannames

- **Alleen een beheerder kan wijzigen.** Een klant die de beveiliging uitzet of de grens op 100 zet, riskeert schade. Wil
  de eigenaar dat een klant bijvoorbeeld de grens wél zelf kan zetten, dan is dat een kleine wijziging.
- De velden in de kaarteditor blijven bestaan. Hun uitleg zegt nu dat wat een beheerder op de kaart wijzigt, voorgaat.
- Er is geen knop om terug te gaan naar de kaartconfig. Opnieuw opslaan met de gewenste waarden doet hetzelfde.
- Versie 0.134.0: iets nieuws op het scherm.

## git status --porcelain

```
 M CLAUDE.md
 M custom_components/domotiapp_lovelace/automatisering/motor.py
 M custom_components/domotiapp_lovelace/automatisering/store.py
 M custom_components/domotiapp_lovelace/automatisering/websocket.py
 M custom_components/domotiapp_lovelace/automatisering/wind.py
 M custom_components/domotiapp_lovelace/engels/automatisering.json
 M custom_components/domotiapp_lovelace/frontend/domotiapp-lovelace.js
 M custom_components/domotiapp_lovelace/manifest.json
 M src/cards/automatisering-card.js
 M src/cards/automatisering-logica.js
 M src/cards/automatisering-scherm.js
 M src/i18n/en/automatisering.js
 M tests/automatisering/test_zonneschermen.py
?? docs/windbeveiliging-wijzigen/
?? src/cards/automatisering-wind-scherm.js
?? tests/js/windbeveiliging-wijzigen.test.mjs
```
