# Ruimtes boeken op het infoscherm (0.73.0)

16 oktober 2026. De vraag van de eigenaar:

> *"kunnen we iets maken voor een planning van ruimtes. Bij [een klant]
> hebben we bijvoorbeeld een spreekruimte kleine vergader ruimte etc etc?"*

Drie keuzes die hij daarna maakte:

| vraag | zijn antwoord |
|---|---|
| waar staan de boekingen | **een agenda per ruimte in Home Assistant** ("oke 1 dan"), niet een eigen lijst |
| wat staat er op het scherm | **alleen vrij of bezet en de tijd**, geen namen of onderwerpen |
| wie boekt | in het beheer, en *"ook op de ipad zelf maar dat toevoegen moet dan wel eerst met een ingestelde code die de medewerkers krijgen"* |

Met in deze ronde ook een tekstwijziging van een beheersessie (zie onder).

## Wat er gebouwd is

### De installateur

In de kaarteditor van het beheer staat een veld **Ruimtes om te boeken (een
agenda per ruimte)** (`rooms`), met uitleg hoe je een Lokale agenda aanmaakt.
Elke agenda die boekingen aanneemt werkt; een agenda die dat niet doet (een
feestdagenagenda, Google zonder schrijfrecht) geeft bij boeken "Kies een
Lokale agenda".

### Het scherm

- **Blok Ruimtes** (via Indeling, Blok toevoegen): per ruimte de naam en
  "Bezet tot 15:00", "Vrij tot 14:30" of "Vrij". Aansluitende boekingen tellen
  samen. Alleen het icoon draagt de toestand: groen vrij, rood bezet. In de kop
  "1 van 2 vrij".
- **Pagina Ruimtes**: per ruimte de dag als tijdlijn (de openingstijden van
  vandaag, anders 8 tot 18 uur, ruimer als er eerder of later iets is), een
  lijn voor nu, en de tijden van vandaag als regel eronder. Nooit een titel.
- **Boeken** (alleen als er een code is): begintijd (nu, of per kwartier, met
  − en +), duur (30 min, 1 uur, 1,5 uur, 2 uur; wat over een andere boeking of
  middernacht heen gaat is grijs), en de code op een eigen cijferblok, zodat
  het toetsenbord van de iPad niet over de helft van het scherm schuift.

### Het beheer

Een blok **Ruimtes** met:
- een nieuwe boeking (ruimte, datum, van, tot, omschrijving die alleen in de
  agenda komt);
- de boekingen van de komende twee weken, met Vrijgeven;
- de **code** voor het scherm (vier tot acht cijfers; leeg = boeken op het
  scherm uit);
- de namen en de volgorde van de ruimtes, net als bij de lampen en airco's.

### De server

- `infoscherm/ruimtes/boek`: kijkt de code na als die er is (en altijd bij
  een kioskaccount), weigert een overlap onder één slot (twee mensen die
  tegelijk boeken krijgen niet allebei de ruimte), en schrijft met
  `async_create_event` in de agenda. In de omschrijving staat waar en door wie.
  Vijf verkeerde codes: vijf minuten niet.
- `infoscherm/ruimtes/vrijgeven` en `infoscherm/ruimtes/code`: alleen voor wie
  mag beheren.
- De code staat NIET in de stand, want die gaat ook naar de iPad. `get` geeft
  hem alleen aan wie mag beheren; het scherm weet alleen `boeken_op_scherm`.
- Lezen gaat niet via ons: scherm en beheer abonneren zich met
  `calendar/event/subscribe` van Home Assistant (er sinds 2026.8, onze
  ondergrens). Een boeking uit de agenda van Home Assistant zelf staat er dus
  ook meteen. Bestaat een agenda net na een herstart nog niet (`not_found`),
  dan wordt het later opnieuw gevraagd (`ookBij` in `BlijvendAbonnement`).

`SPEC.md` 20.4, 20.7 en 20.8 zijn bijgewerkt, net als bij de airco's.

## Bewijs in een echte browser

Testinstance (poort 8127), twee Lokale agenda's (`calendar.spreekruimte`,
`calendar.kleine_vergaderruimte`). Het beheer als `dev` op `localhost:8127`,
het scherm als het kioskaccount `iPad wachtkamer` op `ipad.localhost:8127`,
naast elkaar. Verse code: `?v=` gelijk aan de sha256 op schijf, na elke
build opnieuw nagekeken (`3d623146efb5`, `6b41fb94d3c0`, `b816a883daa8`).

**De code instellen**, met echte toetsaanslagen, er met opzet een letter en een
spatie tussen:

```
4:true 8:true a:true 2:true " ":true 1:true   (key:isTrusted, veld code)
veld "4821", server "4821", boeken_op_scherm true, status "Opgeslagen 14:08"
```

**Boeken in het beheer**: Spreekruimte vandaag 14:00–15:00, omschrijving
"Overleg team zorg" getypt (twee spaties, allebei `isTrusted: true`). In de
agenda van Home Assistant (REST `calendars/calendar.spreekruimte`):

```
14:00-15:00 Overleg team zorg / Geboekt in het beheer van het infoscherm door dev.
```

Dubbel boeken (14:30–15:30 in dezelfde ruimte): geweigerd, naast de knop in het
rood "Deze ruimte is dan al bezet, van 14:00 tot 15:00.", de ingevulde tijden
blijven staan. Dezelfde tijd in de Kleine vergaderruimte: "Kleine
vergaderruimte is geboekt, 14:30 tot 15:30." in het groen.

**Het scherm als kioskaccount**: blok "1 van 2 vrij", Spreekruimte "Bezet tot
15:00" (rood icoon), Kleine vergaderruimte "Vrij tot 14:30" (groen). De code
staat niet in de stand van de iPad (`JSON.stringify(stand).includes("4821")`
is `false`).

**Boeken op het scherm**: Boeken bij de Spreekruimte opent op 15:00 (het eerste
kwartier na de bezetting) met 1 uur. Eerst 1111: "De code klopt niet.", stippen
leeg. Dan 4821: "Spreekruimte is geboekt, van 15:00 tot 16:00". Alle twaalf
kliks `isTrusted: true`:

```
bk r-boek cijfer1 cijfer1 cijfer1 cijfer1 boek cijfer4 cijfer8 cijfer2 cijfer1 boek
```

In de agenda: `15:00-16:00 Geboekt op het infoscherm / Geboekt op het
infoscherm door iPad wachtkamer.` Het beheer in het ANDERE tabblad toonde hem
zonder herladen. Op het scherm daarna "Bezet tot 16:00": 14–15 en 15–16 samen.

**Vrijgeven in het beheer** (eigen bevestigingsvraag, echte kliks): de
agenda van de Kleine vergaderruimte leeg, en het scherm in het andere tabblad
vanzelf op "Vrij", "Vandaag nog niets geboekt.".

**De tijdlijn, gemeten** (CSS-pixels vanaf de linkerkant van de lijn van
1554,7 breed, venster 7 tot 24 uur):

| | gemeten | verwacht |
|---|---|---|
| begin balk 14:00 | 640,4 | 640,2 |
| begin balk 15:00 | 731,7 | 731,6 (midden van het label "15") |
| breedte van een uur | 91,3 | 91,3 (binnenmaat 1552,7 / 17) |
| nu-lijn | 663,8 | 663 (op de minuut) |

Beide ruimtes: lijn links op 310,6 en 1554,7 breed, dus 15 uur staat bij allebei
op dezelfde plek.

**Licht** (Uiterlijk van het scherm tijdelijk op licht, daarna terug op donker):
pagina en boekscherm nagekeken op een schermafdruk.

## Twee dingen die bij het meten boven kwamen en gerepareerd zijn

1. **De tijd stond IN de balk**, en een uur is op een dag van zeventien 75 tot
   90 pixels: er stond "14:00 – 15:..." met de nu-lijn er dwars doorheen. De
   balk heeft nu geen tekst meer; de tijden staan als regel onder de lijn.
2. **Na een stap terug en weer vooruit** sprong de duur van 1 naar 2 uur
   (de langste die paste). Nu de langste tot een uur, net als bij het openen.
   Nagemeten: 15:30 met 1 uur, − naar 15:15 (alles grijs, "Op deze tijd is de
   ruimte bezet"), + terug naar 15:30 met 1 uur.

En één die bij het meten zelf misging, geen fout van de kaart: een klik op een
tijdveld landde op het minutendeel. Staat als valkuil 73 in CLAUDE.md.

## De tekst bij bezette sportsensoren

Van de beheersessie, gemeten bij een klant: na het weghalen van de oude
sjabloonhelpers was **opnieuw laden** van DomotiApp Lovelace genoeg; een
herstart van Home Assistant hoeft niet. Dat stond al in een test
(`test_vrij_gemaakt_komt_hij_alsnog`, met `async_reload`). De logregel in
`sensor.py` en de reparatiemelding (nl en en) noemen nu eerst opnieuw laden,
met waar dat zit, en dan pas herstarten.

## Tests

- **NIEUW GEDRAG**, `tests/infoscherm/test_ruimtes.py` (34): opslag, code
  buiten de stand, rechten, boeken met en zonder code, te vaak een verkeerde
  code, overlap, een hele dag, onmogelijke tijden, een agenda die niet kan
  boeken, vrijgeven, en dat een kioskaccount `calendar/event/subscribe` mag en
  een nieuwe boeking meteen binnenkrijgt. De agenda is een echte
  `CalendarEntity` in het echte agenda-component, met de afspraken in een
  lijst. Op de code van `main`: de test laadt niet eens (`MAX_RUIMTES` en
  `ruimtes.py` bestaan niet).
- **NIEUW GEDRAG**, `tests/js/ruimtes-logica.test.mjs` (29): vrij of bezet,
  aansluitende boekingen, een hele dag, de tijdlijn, begintijden en duren,
  het beheer per dag. Groen in de lokale tijdzone én met `TZ=UTC`.
- **NIEUW GEDRAG**, `tests/js/infoscherm-ruimtes.test.mjs` (5) en vijf in
  `tests/js/infoscherm-client.test.mjs` (`AgendaAbonnement`, `boekRuimte`),
  met één **REGRESSIEWACHT** (het gewone abonnement herhaalt `not_found`
  niet). Op `main`: de module en de exports bestaan niet.

Alles: zie onder Controles.

## Controles

- `npm run build`, `verify`, `check:registratie`, `check:css`,
  `check:controls`: groen.
- `npm test`: 1909 tests, alle groen.
- Python: 855 tests, alle groen (lokaal in Docker). Eén bestaande test vergeleek de installatie precies en kreeg er `"ruimtes": []` bij, met een regel commentaar, net als bij de airco's.

## Samenvatting

Een ruimte is een agenda in Home Assistant. Het scherm toont per ruimte vrij
of bezet en tot wanneer. Medewerkers boeken op de iPad met de code van de
receptie, en de receptie boekt en geeft vrij in het beheer. Alles loopt live,
ook wat er in de agenda van Home Assistant zelf gebeurt.

## Wat niet lukte

Niets. Wat bewust niet gebouwd is:
- **Vrijgeven op de iPad.** Hij vroeg om toevoegen met een code. Wie op de
  iPad iets verkeerd boekt, vraagt het de receptie.
- **Herhalende boekingen in het beheer.** Een herhalende afspraak die in de
  agenda van Home Assistant is gemaakt, wordt wél getoond, en Vrijgeven
  haalt dan alleen die ene keer weg.

## Aannames

- Dat een boeking op de iPad zonder naam mag ("Geboekt op het infoscherm"):
  de code is gedeeld, dus er is geen naam te weten. In de omschrijving staat
  het account dat de iPad gebruikt.
- Dat de duurkeuzes 30 min, 1 uur, 1,5 uur en 2 uur genoeg zijn op de iPad;
  langer kan in het beheer.
- Dat de code alleen cijfers is (vier tot acht): de iPad toont een cijferblok.

## `git status --porcelain`

Schoon na de commit.
