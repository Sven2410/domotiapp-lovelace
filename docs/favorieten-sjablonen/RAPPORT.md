# Vette titels, ruimere ruimtes, kant-en-klare favorieten en alle iconen (0.98.0)

31 oktober 2026, tak `fase-141/favorieten-sjablonen`. De eigenaar, na het bekijken van 0.97.0 bij een klant,
doorgegeven door de beheersessie: *"bij holiday mode staat een icon en favorites niet. automations is vergedrukt en mist
ook een icon. Alle titels moeten vet gedrukt zijn en een icon hebben. ik vind de ruimtes te klein scrollen. Ik wil dat je
ook al voor gedefineerde favorieten hebt en dat je dingen kan aanvinken etc. Zoals Woning verlaten. En dan een vinkje alles
uit behalve buitenverlichting bijvoorbeeld. Dat soort scenarios. Het moet overzichtelijk zijn maar wel duidelijk voor de
klant"*. En erachteraan: *"maar de klant moet zelf ook gewoon een favoriet kunnen maken. En ik wil gewoon alle mogelijke
icons hebben"*.

## Samenvatting

| Wens | Was | Nu |
|---|---|---|
| Titels | Automatiseringen 500 zonder icoon, Favorieten en Vakantieregels 400 in grijs zonder icoon, Vakantiemodus 500 met icoon | alle vier 700, 14 px, met icoon, tekst op dezelfde lijn. Ook in het scherm: elke kop vet met een icoon |
| Ruimtes te klein | ruimtes 102 hoog, lampen 226, scherm 560 breed | ruimtes minstens 186 (30% van het venster), lampen minstens 260 (42%), scherm 640 breed |
| Kant-en-klare favorieten | bestond niet | het plusje vraagt eerst: een van vijf sjablonen, of Zelf maken |
| Vinkjes | bestond niet | Alle lampen uit, Behalve de buitenverlichting, Buitenverlichting aan of uit, Rolluiken dicht of open |
| Zelf maken | was de enige weg | blijft, met dezelfde vinkjes en de lampen meteen open |
| Alle iconen | 11 om uit te kiezen | onze eigen set (172) plus alle 7447 van Home Assistant, met zoeken |

**De sjablonen, en die heb ik zelf gekozen:**

| Sjabloon | Vinkjes die aan staan |
|---|---|
| Woning verlaten | Alle lampen uit, Behalve de buitenverlichting |
| Slapen | Alle lampen uit, Rolluiken dicht |
| Thuiskomen | Buitenverlichting aan, Rolluiken open |
| Goedemorgen | Buitenverlichting uit, Rolluiken open |
| Alles uit | Alle lampen uit |

Wat op een kaart niets kan, staat er niet: zonder buitenlampen en rolluiken zijn Thuiskomen en Goedemorgen weg. Een sjabloon
is een begin: naam, icoon, vinkjes en losse lampen zijn daarna gewoon te wijzigen. Na het kiezen staan de lampen ingeklapt
achter **Lampen aanpassen (39 gekozen)**, want met 55 lampen is dat anders een muur.

**Een vinkje is geen eigen gegeven.** Of hij aan staat, volgt uit de lampen en standen van de favoriet. De server is niet
veranderd, op één grens na, en een favoriet die er al was krijgt dezelfde vinkjes. Een vinkje raakt alleen zijn eigen deel:
een lamp die je zelf op 40% zette, blijft daar staan als je de rolluiken aanvinkt.

**Wat buiten is, leest de kaart uit de verdieping, de ruimte en de naam,** op woorden in het Nederlands en het Engels
(buiten, tuin, terras, oprit, gevel, outside, garden, terrace en zo). Onder het vinkje staat wat hij vond: "Tuin Spots, Tuin
Plafond en 14 andere".

**Een fout erbij.** De server nam een icoonnaam van hooguit 40 tekens aan, en de langste is 46. Nu 60.

**De knop Voorbeeld** staat nu los van de schuiven, zodat hij er ook is als de lampen ingeklapt zijn.

## Gemeten

Testinstance met een nagebootst huis (`nep_huis`, niet in git): 55 dimbare lampen in 21 ruimtes, de verdieping `Outside`,
drie rolluiken. Gewone gebruiker, op een laptop van 1366 × 768 en een telefoon van 393 breed. Bundel op schijf en geladen
`bcddfe427906`. Kliks en toetsen `isTrusted: true`, geen fouten in de pagina.

**Titels, gemeten op de kaart:**

| Titel | Gewicht | Maat | Tekst begint op x | Icoon |
|---|---|---|---|---|
| Automatiseringen | 700 | 14 px | 620 | ja |
| Favorieten | 700 | 14 px | 620 | ja |
| Vakantiemodus | 700 | 14 px | 620 | ja |
| Vakantieregels | 700 | 14 px | 620 | ja |

**Ruimtes en lampen, 21 ruimtes en 58 keuzes:**

| Scherm | Ruimtes hoog | Inhoud | Lampen hoog | Inhoud |
|---|---|---|---|---|
| laptop | 162 | 162, alles in beeld op 4 regels | 322 | 682 |
| telefoon | 255 | 288 | 357 | 1438 |

**Woning verlaten, van begin tot eind:**

| Proef | Uitkomst |
|---|---|
| sjabloon kiezen | naam "Woning verlaten", icoon `homeLeave`, Alle lampen uit (39 lampen) en Behalve de buitenverlichting aan |
| Rolluiken dicht aanvinken, Voorbeeld | binnenlamp 50% wordt uit, buitenlamp blijft 50% |
| Voorbeeld stoppen | binnenlamp weer 50%, buitenlamp 50% |
| zoeken "washing machine", spatie `isTrusted: true` | 4 treffers, de focus blijft in het veld |
| zoeken "slapen" | `sleep`, `moon`, `bed`, `bedDouble`: onze eigen woorden werken |
| zoeken "robot", `mdi:robot` kiezen | getekend op 18 px, en bovenaan de rij gezet |
| Opslaan | 42 lampen en rolluiken, 0 buiten, 3 rolluiken, alles op 0, geen vinkjes in de opslag |
| favorietenkaart | `mdi:robot` getekend, knop 56 hoog |
| tik op de knop | binnen uit, buiten blijft 60%, rolluiken gaan dicht |
| opnieuw openen | dezelfde vinkjes, de lampen ingeklapt |
| Behalve uit | 58 gekozen: de buitenlampen staan erbij |

**Zelf maken:** lege naam, Opslaan uit met "Geef de favoriet een naam.", lampenlijst open. Naam "Film kijken" met spatie
`isTrusted: true`, ruimte Tuin geeft 5 lampen, één kiezen en opslaan: `["Film kijken","star",1]`.

**Telefoon:** vak van 16 tot 377, geen overloop in het vak of de pagina. **Licht:** met het oog nagekeken op de kaart en het
scherm; het vinkje en de iconen zijn te zien.

**De separator van de beheersessie:** `mdi:robot` tekent gewoon, 16 × 16, tekst 600. Dat was dus niet de oorzaak.

**Proeven.** Tegen de oude code (`git archive HEAD`, de nieuwe proeven erin) falen alle 8 van de vinkjes, de zoekproeven
omdat `zoekMdi` niet bestaat, en in Python de lange naam, allemaal NIEUW GEDRAG. JS 2221 en Python 1024 groen, `verify`,
`check:registratie`, `check:css`, `check:controls` en `check:taal` groen.

## Wat niet lukte

- **Niet op een echte installatie.** De ruimtes van de klant zijn nagebootst, en een echt rolluik zit er nog steeds niet bij.
- **Het woord "vergedrukt" heb ik niet gezien.** Ik heb het gelezen als: niet vet en anders dan de rest. Dat is nu weg, maar
  of het dat was, ziet de eigenaar pas op zijn eigen scherm.
- **De iconen van Home Assistant zijn alleen op Engels te vinden.** Hun trefwoorden zijn Engels. "wasmachine" vindt die van
  ons, niet `mdi:washing-machine`.
- **Een lamp met een naam die niets zegt, in een ruimte die niets zegt, telt als binnen.** Dan staat er bij Behalve de
  buitenverlichting niets, of te weinig. De klant kan de lamp met de hand kiezen; instellen op de kaart kan niet.
- **`/static/mdi/iconList.json` is intern bij Home Assistant.** Verdwijnt het, dan zegt de kiezer dat en blijft onze set.

## Aannames

- Vijf sjablonen zijn genoeg om te beginnen, en dit zijn de goede. Zeg het als het er andere moeten zijn: het is één lijst.
- Bij Woning verlaten staat Rolluiken dicht niet aan, want dat noemde de eigenaar niet, en overdag wil niet iedereen dat.
- "Behalve" betekent: die lampen raakt de knop niet aan. Ze gaan dus niet aan, ze blijven zoals ze staan.
- "Alle titels" geldt voor de kaart en het scherm, niet voor de andere kaarten in de familie.

## git status --porcelain

Leeg na de commit.
