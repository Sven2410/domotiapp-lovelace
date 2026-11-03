# Zonneschermen en de wind (0.104.0)

3 november 2026, tak `fase-151/zonneschermen`. Via de beheersessie van de eigenaar. Hij wil de zonneschermen op de automatiseringskaart
kunnen kiezen. De beheersessie had ze daar eerst bewust niet op gezet: een regel die bij storm uitrolt, is schade. Ze stelde daarom een
windgrens voor, die je niet kunt omzeilen: niet uitrollen boven de grens, of als de windsensor niets zegt.

## Samenvatting

**Zonneschermen zijn een eigen lijst op de kaart**, naast lampen, rolluiken en speakers. Voor de motor zijn het rolluiken: aan is
uitrollen (open), uit is inrollen (dicht), en een scherm dat zijn stand niet kent (zoals Somfy io, die `unknown` zegt) gaat gewoon open en
dicht.

| Waar | Wat |
|---|---|
| de editor | *Zonneschermen die de klant kan kiezen*, en zodra er een is: *Windsensor* (sensoren met `device_class` `wind_speed` of `speed`) en *Windgrens* in km/h (leeg is 30) |
| het scherm | de kop zegt "Lampen, rolluiken, zonneschermen en speakers", met het icoon van een zonnescherm in de lijst |
| een favoriet | een eigen vinkje **Zonneschermen in**. *Rolluiken dicht* laat ze met rust |
| het voorbeeld | laat de zonneschermen met rust: het kent de windgrens niet |

**De windgrens** (`automatisering/wind.py`):

- **Niet uitrollen boven de grens**, voor een regel en een favoriet. Een rolluik in dezelfde regel gaat gewoon open.
- **Niet uitrollen zonder bruikbare meting**: `unavailable`, `unknown`, geen getal, of een eenheid die geen snelheid is.
- **Inrollen gaat altijd.**
- **Intrekken zodra de wind boven de grens komt**, één keer, bij het overschrijden. Daarna niets meer tot de wind weer onder de grens is
  geweest: wie bij harde wind zelf een scherm uitrolt, wordt niet elke minuut overruled.
- **Na een herstart bij harde wind** gaan ze één keer in. Wat er tijdens de herstart gebeurde, weet niemand.
- **De eenheid** komt van de sensor en wordt omgerekend: 10 m/s is 36 km/h.
- **Zonder windsensor is er geen grens.** Dat is de keuze van de beheerder; de hulptekst in de editor zegt het erbij.

**En een fout die al sinds de favorieten bestond.** Typen in het naamveld werkte de knop Opslaan niet bij. Wie bij een nieuwe favoriet
de naam als LAATSTE typte, zag Opslaan grijs blijven met "Geef de favoriet een naam." eronder, tot hij ergens anders tikte. Het kwam
boven bij het meten van deze ronde. Hersteld in `invoer_` van het scherm.

**Twee keuzes die ik zelf maakte:**

- **Eén windsensor voor het hele huis**, net als de vakantiestand: die van de eerste kaart die er een heeft.
- **30 km/h als standaard.** Dat is windkracht 5, en net boven wat een gewoon knikarmscherm aankan (windkracht 4 is 20 tot 28 km/h).
  Kan het scherm meer, dan zet de beheerder het hoger.

## Gemeten

In de testinstance. Het demo-`cover.kitchen_window` speelt het zonnescherm (open, dicht en stop, geen stand, net als Somfy io). De
windstoten komen van het nagebootste weerstation (`sensor.weather_station_speed_2`, in m/s); zie `CLAUDE.md`, Testmateriaal.

**Het scherm, als gewone gebruiker** (Receptie, echte kliks en toetsen, bundel in de pagina gelijk aan schijf). `isTrusted` is `true` op
alle 6 kliks en op de spatie in "Scherm in". Geen fouten in de pagina.

| Stap | Uitkomst |
|---|---|
| nieuwe regel | kop "Lampen, rolluiken, zonneschermen en speakers"; "Zonnescherm keuken" met het zonneschermicoon |
| nieuwe favoriet | vinkjes: Alle lampen uit, Rolluiken dicht (2 rolluiken), Rolluiken open, **Zonneschermen in (1 zonnescherm)**, Muziek uit |
| Zonneschermen in, naam als laatste | Opslaan aan, geen foutregel. **Vóór de reparatie:** Opslaan grijs, "Geef de favoriet een naam." |
| opslaan | `lampen: ["cover.kitchen_window"], helderheden: {"cover.kitchen_window": 0}` |

**De wind, in de testinstance zelf** (de motor, met zijn log op info):

| Tijd | Wind | Wat er gebeurde |
|---|---|---|
| 12:50:11 | 2 m/s | scherm open |
| 12:51:10 | 10 m/s | log: "Wind 36.0 km/h boven de grens van 30.0: zonneschermen in"; **scherm dicht** |
| | 11 en 13 m/s | niets meer: het intrekken gebeurde één keer |
| 12:51:24 | 13 m/s | favoriet "Scherm uit" (op 100%): log "rolt niet uit: wind 46.8 km/h, grens 30.0"; scherm bleef dicht |
| | 2 m/s | dezelfde favoriet: **scherm open** |

**De editor**, als beheerder, met de echte `ha-form` en de echte `hass`:

- Zonder zonneschermen staan *Windsensor* en *Windgrens* er niet.
- Met een zonnescherm staan ze direct eronder, met de labels en hulpteksten van hierboven.
- Halen de schermen weg, dan schrijft de editor ook `wind_sensor` en `wind_max` niet meer weg.

Die editor hing ik met de hand in de pagina, buiten de dialoog van Home Assistant (valkuil 21). Daarbij geeft `ha-form` een fout
`Cannot read properties of undefined (reading 'localize')`. Dat ligt aan de opstelling, niet aan de nieuwe velden: met alleen lampen
geeft dezelfde opstelling hem ook (14 keer, met de schermen 19).

**De proeven:** 16 nieuwe in `tests/automatisering/test_zonneschermen.py` en 7 nieuwe in
`tests/js/automatisering-zonneschermen.test.mjs`.

| | op deze tak | op 0.103.0 |
|---|---|---|
| Python, nieuw | 16 groen | 15 rood, 1 groen (de regressiewacht) |
| JS, nieuw | 7 groen | 4 rood, 3 groen (de drie regressiewachten) |
| alles | 1084 Python, 2285 JS, allemaal groen | |

Een proef die alleen zegt dat er NIET uitgerold wordt, slaagde eerst ook op 0.103.0: die kent het scherm niet, en rolt dus nooit uit. Die
proeven rollen daarom daarna bij rustig weer wél uit.

## Wat niet lukte

- Niet in het echt beproefd met de Somfy-schermen. De beheersessie zet de windsensor en de schermen op de kaart; echt schakelen doet de
  eigenaar zelf.
- De editor is niet in de kaartdialoog van Home Assistant bediend, alleen buiten de dialoog gemeten (zie hierboven).
- De naamfout is niet met een proef vastgelegd. Hij zit in het scherm, en dat meten we in een echte browser, niet met jsdom.

## Aannames

- Zonneschermen houden de woorden *open* en *dicht* in een regel ("Open om 12:00 · dicht om 18:00"), net als Home Assistant zelf.
- Voor intrekken telt alleen de sensor van de kaart. Een eigen windautomaat van het scherm (zoals een Eolis bij Somfy) werkt daar los
  van, en beide mogen.

## git status --porcelain

```
(schoon na de commit)
```
