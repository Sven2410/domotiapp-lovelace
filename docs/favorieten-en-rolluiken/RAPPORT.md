# Favorieten en rolluiken op de automatiseringskaart (0.97.0)

31 oktober 2026, tak `fase-140/favorieten`. Bouwt voort op #160 (0.96.0), omdat beide het invulscherm
raken; #160 zit hier dus in. Twee wensen van de eigenaar:

- *"rolluiken mogen er ook in"*.
- Doorgegeven door een beheersessie: *"ik wil een nieuwe kaart. Een favorietrn kaart. Zoals nu woning
  verlaten etc maar dat kan de klant zelf in de automatisering kaart aanmaken. Heeft die 3 knoppen
  aangemaakt dan 2 naast elkaar en de ander over de volle breedte snap je alles goed mooi uitlijnen"*, en
  *"Heb je nog geen favorieten gemaakt moet er komen te staan iets van maak je favorieten in de woning
  instellingen zoiets"*.

## Samenvatting

**De favorietenkaart** (`custom:domotiapp-favorieten-card`) toont de knoppen die de klant maakt, elk van
één rasterrij. Twee naast elkaar, een oneven laatste over de volle breedte. Een tik voert de favoriet uit op
de server, en het icoon licht even op. Zonder favorieten staat er "Nog geen favorieten. Maak ze in de
woninginstellingen."; met de instelling `pad` is dat een link. De kaart brengt geen scheiding mee: daar is de
separatorkaart voor.

**Op de automatiseringskaart** staat een blok Favorieten, met `favorieten: false` uit te zetten. Een favoriet
heeft een naam (verplicht), een icoon uit een vast rijtje, en lampen en rolluiken in groepen, net als een regel.
Bij een favoriet kan een groep ook op **Uit** (rolluiken: **Dicht**), want "woning verlaten" is juist dat.
De knop Voorbeeld werkt hier ook. Favorieten hebben geen moment en geen dagen.

**Rolluiken** kiest de beheerder in het editorveld `rolluiken`, met `omgekeerd` voor een motor die andersom is
aangesloten, net als op de rolluikkaart. In een regel is aan **open op de gekozen stand** (100 is helemaal open)
en uit **dicht**. Een rolluik dat zijn stand niet kent, gaat alleen open en dicht. Bij alleen rolluiken zeggen
het scherm en de rij Open en Dicht; met ook een lamp erin Aan of open, Uit of dicht. Lampen en rolluiken mogen in
dezelfde regel of favoriet.

**Alles kiezen** staat vanaf zes lampen boven de lijst, en geldt voor wat de zoekbalk en de ruimte tonen. Zonder
die knop is "woning verlaten" 55 keer tikken.

**Op de server:** de favorieten staan in dezelfde opslag als de regels, dus ze overleven een herstart. De grens
is dezelfde: alleen wat op een automatiseringskaart staat, getoetst bij opslaan en bij uitvoeren. Elke gebruiker
mag ze maken en gebruiken.

## Gemeten

Testinstance, gewone gebruiker op 393 breed met echte tikken, `isTrusted: true`, geen fouten in de pagina. Bundel
op schijf en geladen gelijk.

| Proef | Uitkomst |
|---|---|
| lege kaart | de tekst, 377 × 56, een tik gaat naar `pad` |
| favoriet zonder naam | "Geef de favoriet een naam.", Opslaan uit |
| Alles kiezen | 9 gekozen, de knop wordt Niets kiezen |
| kop bij lampen en rolluiken / alleen rolluiken | Helderheid en stand / Openingsstand; de knop zegt Uit / Dicht |
| Voorbeeld op een favoriet | Kitchen en Ceiling 50%, na stoppen 71% en 30% |
| **Film kijken** (lampen op 50%) | Kitchen en Ceiling 50%, aan-uit-lamp aan, rolluiken ongemoeid |
| **Slapen** (twee dicht, Serre 39%) | Hall en Kitchen dicht, Serre gaat naar de stand |
| **Woning verlaten** (alles op Uit) | alle lampen uit, alle rolluiken dicht |
| rolluikregel, open om 21:05 op 61%, dicht om 21:06 | 21:05 open (stand 60 en open), 21:06 allebei dicht |
| editor, rolluik kiezen met de echte kiezer | `rolluiken: [{entity, name}, entity]` in de YAML, Motor omgekeerd verschijnt, de naam blijft |

De demo-rolluiken lopen in stappen van 10, dus 39 en 61 worden daar 30 en 60. De server stuurt de juiste stand; de
proeven kijken daarnaar.

**De uitlijning, gemeten** (links, boven, breed, hoog ten opzichte van de kaart):

| Aantal | Knoppen | Kaart |
|---|---|---|
| 3 | `0,0,185,56` `193,0,185,56` `0,64,377,56` | 377 × 120 |
| 5 | `0,0,185,56` `193,0,185,56` `0,64,185,56` `193,64,185,56` `0,128,377,56` | 377 × 184 |

Tussenruimte 8, hoogtes op het raster (56, 120, 184). De chip staat 10 van boven en 10 van onder.

**Proeven.** Nieuw: `tests/automatisering/test_favorieten_rolluiken.py` en twee blokken in
`tests/js/automatisering-logica.test.mjs`, ook een herstart met favorieten. De tellingen staan in de PR. In de
browser kwam één fout boven die geen proef ving: het scherm viel om op een favoriet zonder `dagen`. Die is
gerepareerd.

## Wat niet lukte

- **Niet op een echte installatie, en niet op een echt rolluik.** De metingen zijn op de demo-rolluiken van Home
  Assistant.
- **Volgorde van de knoppen:** op volgorde van maken, er is geen slepen. Niet gevraagd.
- **Een favoriet kan alleen lampen en rolluiken.** Niet gevraagd is een scène, script of airco.
- **Een favoriet stopt een lopende beweging niet apart,** en een tik op een rolluik dat al beweegt, is een gewone
  nieuwe opdracht.

## Aannames

- "Woning instellingen" is geen vaste plek: bij elke klant kan die anders heten, dus de tekst is algemeen en het
  pad staat op de kaart.
- De keuze van de iconen, en dat die vast is. Een zoeker staat in de editor van een beheerder, niet in dit scherm
  van de klant.
- Een poort of garagedeur is ook een `cover`. Die kan de beheerder in `rolluiken` zetten, en dan gaat hij open op
  een regel of een tik. Dat is zijn keuze; de kaart houdt hem niet tegen.
- Standaardfavorieten komen niet mee.

## git status --porcelain

Leeg na de commit.
