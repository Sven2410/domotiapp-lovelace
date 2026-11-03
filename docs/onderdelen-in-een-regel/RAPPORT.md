# Onderdelen in één regel (0.102.0)

3 november 2026, tak `fase-149/onderdelen`. Via de beheersessie van de eigenaar, met zijn eigen woorden erbij. Hij had voor de
vakantiestand van de rolluiken drie regels voor één idee, omdat een regel maar één aan en één uit heeft voor al zijn rolluiken:
*"ik wil dat dat kan in 1 regel dus eigenlijk een automatisering net als in HA. Die kan je editen snap je dus dan krijg je 1 vakantie
regel met de rolluiken ... en maak het overzichtelijk"*.

## Samenvatting

**Een regel kan nu uit onderdelen bestaan.** Elk onderdeel heeft eigen lampen, rolluiken of speakers, een eigen stand en een eigen
aan of open en uit of dicht. Naam, dagen, vakantie en de schakelaar zijn van de hele regel. Zijn drie regels worden zo één:

| Onderdeel | Open | Dicht |
|---|---|---|
| Keuken links | 09:30 | 14:30 |
| Keuken voor | 09:30 | 20:00 |
| Woonkamer links en rechts | 11:30 | 20:00 |

Op de kaart staat dat als één rij: *"Vakantie rolluiken" · "Open om 09:30 en 11:30 · dicht om 14:30 en 20:00 · Elke dag"*.

**In het scherm** staat bij één onderdeel alles zoals het was, met onderaan een knop *Onderdeel toevoegen, met eigen tijden*. Bij
meer onderdelen staat bovenaan de lijst *Onderdelen*, een rij per onderdeel met wat het doet ("Open om 09:30 · dicht om 14:30") en een
prullenbak. Het gekozen onderdeel heeft een rand, en daaronder staat in een vak met dezelfde rand *Onderdeel 2*: de lampen, de stand,
het voorbeeld en de tijden van dat ene. Tikken op een andere rij wisselt. Ontbreekt er iets, dan zegt het scherm welk onderdeel:
*"Onderdeel 3: Kies minstens één lamp."*. Bij opslaan komen de onderdelen op tijd te staan.

**Wat per onderdeel gaat:** het inhalen na een herstart (aan tot 4 uur terug, uit tot 24 uur), de verschuiving van een vakantieregel
(elk onderdeel zijn eigen, tot 15 minuten), en het vangnet van de pauze (een onderdeel dat zijn lamp aan zette, doet zijn uit ook
tijdens de vakantie).

**Drie keuzes die ik zelf maakte:**

- **Een onderdeel is een paar aan en uit, geen losse stap.** De beheersessie stelde losse stappen voor ("een tijd, welke rolluiken,
  wat ze doen"). Met paren blijft het inhalen kloppen zoals het nu is: stond Home Assistant uit tijdens zowel open als dicht, dan wordt
  het alleen dicht. Met losse stappen zou de motor per rolluik moeten uitzoeken welke stap het laatst was, en die regel zou alleen
  nieuw zijn om dit op te lossen. Voor zijn rolluiken is het bovendien hoe hij het zelf opschreef: per rolluik open en dicht.
- **Dagen zijn van de hele regel.** Zijn drie regels hebben allemaal elke dag. Zijn er onderdelen die op andere dagen moeten, dan is
  dat nog steeds een tweede regel.
- **Er hoeft niets omgezet te worden.** Een regel met één onderdeel blijft in de opslag staan zoals voor 0.102.0, zonder `delen`, en
  de server maakt van één onderdeel ook weer zo'n regel. Een bestaande regel is dus vanzelf een regel met één onderdeel, met hetzelfde
  id, en daarmee dezelfde verschuiving en hetzelfde `brandt`. Een stap terug naar 0.101.0 laat alleen de regels met meer onderdelen
  liggen; die voert hij niet uit.

## De vorm

```json
{"id": "…", "naam": "Vakantie rolluiken", "vakantie": true, "dagen": [0,1,2,3,4,5,6], "actief": true,
 "lampen": ["cover.a", "cover.b", "cover.c", "cover.d"], "aan": null, "uit": null,
 "delen": [
   {"id": "c40ddeb6", "lampen": ["cover.a"], "helderheden": {}, "aan": {"soort": "tijd", "tijd": "09:30"}, "uit": {"soort": "tijd", "tijd": "14:30"}},
   …
 ]}
```

`lampen` bovenaan is alles uit de onderdelen samen; dat zet de server zelf. Daarop zoekt de kaart welke regels bij hem horen, en
daarop toetst de server bij een wijziging welke lampen er al in stonden. Een onderdeel houdt zijn id bij opnieuw opslaan.

## Gemeten

In de testinstance, als gewone gebruiker (Receptie), met echte kliks en toetsen (Playwright). `isTrusted` is `true` op alle 15
kliks en op de spatie in "Rolluiken overdag". De bundel in de pagina was die op schijf (`b430ac182a34`). Geen fouten in de pagina.

| Stap | Uitkomst |
|---|---|
| nieuwe regel, Hal, open 09:30, dicht 14:30 | geen lijst; onderaan *Onderdeel toevoegen, met eigen tijden* |
| die knop | lijst met twee rijen, *Onderdeel 2* gekozen en leeg; fout *"Onderdeel 2: Kies minstens één lamp."*, Opslaan uit |
| Living Room Window, open 11:30, dicht 20:00 | rij 2: "Open om 11:30 · dicht om 20:00", Opslaan aan |
| tik op rij 1 | *Onderdeel 1*, Hal gekozen, 09:30 en 14:30 staan er weer |
| derde erbij, en weer weg | *Onderdeel 3* met dezelfde fout; na de prullenbak weer *Onderdeel 2* gekozen, fout weg |
| opslaan | `delen` met twee onderdelen, elk met een eigen id; `lampen` bovenaan beide; `aan` en `uit` bovenaan `null` |
| de kaart | "Rolluiken overdag" · "Open om 09:30 en 11:30 · dicht om 14:30 en 20:00 · Elke dag" · "Hal, Living Room Window" |
| op 390 breed opnieuw geopend | twee rijen, op tijd, onderdeel 1 gekozen |
| rij 2 weg, opslaan | een gewone regel: geen `delen`, `lampen`, `aan` en `uit` bovenaan, hetzelfde id |

**Posities** (`getBoundingClientRect`, links en rechts in CSS-pixels):

| | 1366 breed | 390 breed |
|---|---|---|
| het scherm | 363 – 1003 | 16 – 374 |
| de rijen | 378 – 988 | 31 – 359 |
| het vak van het onderdeel | 378 – 988 | |
| overloop van het scherm | 0 | 0 |
| tekst in een rij afgekapt | | nee, nee |

De rijen en het vak eronder lopen precies gelijk. De prullenbak staat op 945 – 981, 7 pixels van de rand van de rij. Schermafdrukken
staan in de kladmap van de sessie, niet in de repo.

**De proeven:** 14 nieuwe in `tests/automatisering/test_onderdelen.py` en 13 nieuwe in `tests/js/automatisering-onderdelen.test.mjs`,
naast de bestaande.

| | op deze tak | op 0.101.0 |
|---|---|---|
| Python, nieuw | 14 groen | 11 rood, 3 groen |
| JS, nieuw | 13 groen | 10 rood, 3 groen |
| alles | 1052 Python, 2269 JS, allemaal groen | |

Op 0.101.0 blijven groen:
- de regressiewachten "een regel zonder onderdelen slaat op zoals altijd", "een regel van voor 0.102.0 gaat er net zo uit", "zonder
  onderdelen dezelfde zinnen" en "een gewone regel leest als altijd";
- "een regel met onderdelen die uit staat doet niets": die doet daar ook niets, maar omdat de motor hem niet kent;
- "een onderdeel zonder moment weigert de server": die weigert daar elke `delen` ("extra keys not allowed").

Twee proeven met REGRESSIEWACHT in de naam vallen op 0.101.0 wel om: `delen_van` en `onderdelenVan` bestaan daar niet. Wat ze bewaken
(een regel zonder onderdelen is zichzelf, met zijn eigen id) is precies het oude gedrag.

## Wat niet lukte

- Niet op een echte Home Assistant met echte rolluiken beproefd. De beheersessie zet zijn drie regels na de uitgave om naar één, en
  kijkt het daar na; echt schakelen doet de eigenaar zelf.
- Niet in de Chrome van de eigenaar gemeten maar met Playwright, headless; echte kliks en toetsen, geen synthetische.

## Aannames

- Dagen voor de hele regel zijn genoeg; zie boven.
- Op tijd zetten doet de kaart bij opslaan, met de zon als ongeveer 07:00 en 19:00. Een onderdeel bij zonsondergang staat dus tussen
  18:30 en 19:30, ook in juni. Het gaat alleen om de volgorde in de lijst.

## git status --porcelain

```
(schoon na de commit)
```
