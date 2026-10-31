# Twee kant-en-klare favorieten, en de buitenverlichting als vinkje (0.98.2)

31 oktober 2026, tak `fase-143/twee-sjablonen`. De eigenaar, doorgegeven door de beheersessie: *"exept outdoorlights moet een
aanvink optie zijn nu staat die bij pre programmed favorites bij leave home. Ik wil maar 2 voor gemaakt efavorieten. Alles uit
en woning verlaten. WOning verlaten is dan standaard buitenverlichting niet uit. ALles uit is ook de buitenverlichting uit. Zo
houden we de kaart overzichtelijk en kan de klant daarna gewoon zelf zijn eigen favorieten maken"*.

## Samenvatting

| Wat | 0.98.1 | Nu |
|---|---|---|
| Sjablonen | Woning verlaten, Slapen, Thuiskomen, Dagstand, Alles uit | **Woning verlaten** en **Alles uit**, plus Zelf maken |
| Regel onder Woning verlaten | "Alle lampen uit · Behalve de buitenverlichting": dat las als vast onderdeel | "Alle lampen uit. Je kiest zelf of de buitenverlichting meedoet." |
| Regel onder Alles uit | "Alle lampen uit" | "Alle lampen uit, ook de buitenverlichting." |
| Woning verlaten, standaard | buiten niet uit | hetzelfde: het vinkje staat aan |
| Alles uit, standaard | buiten uit | hetzelfde: het vinkje staat uit |

**Het vinkje zelf bestond al in 0.98.0**, in de stap na het kiezen, en is niet veranderd: een echt selectievakje van 23 × 23,
ingesprongen onder Alle lampen uit. De klacht ging over de tekst bij het sjabloon, en die is weg. Het vinkje staat ook bij Zelf
maken, zodra Alle lampen uit aan staat.

**Favorieten die al bestaan, blijven gewoon staan,** ook als ze uit een sjabloon kwamen dat er nu niet meer is: wat er is
opgeslagen, zijn lampen en standen. Op een kaart met alleen rolluiken staat alleen Zelf maken.

## Gemeten

Testinstance, 55 lampen waarvan 9 in de ruimte `Buiten`, 3 rolluiken. Gewone gebruiker op een laptop, kliks `isTrusted: true`,
geen fouten in de pagina. Bundel op schijf en geladen `badea045ef39`.

| Proef | Vinkjes en lampen |
|---|---|
| Woning verlaten kiezen | [x] Alle lampen uit, [x] Behalve de buitenverlichting, 46 gekozen |
| Behalve uitvinken | [ ] Behalve, 55 gekozen |
| weer aanvinken | [x] Behalve, 46 gekozen |
| Alles uit kiezen | [x] Alle lampen uit, [ ] Behalve, 55 gekozen |
| Zelf maken | lege naam, lampen open, niets aangevinkt |
| daar Alle lampen uit, dan Behalve | het vinkje verschijnt, en is aan te zetten |
| opslaan | Woning verlaten 46 lampen, 0 buiten; Alles uit 55 lampen, 9 buiten |
| tik op Woning verlaten | binnen uit, buiten blijft aan |
| tik op Alles uit | binnen uit, buiten uit |
| favorietenkaart | twee knoppen naast elkaar, elk 246 × 56 |

**Proeven.** Op 0.98.1 falen 3 proeven (NIEUW GEDRAG: de twee sjablonen, de lijst per kaart en de regel onder een sjabloon). De
proeven dat Alles uit ook buiten uitzet, dat Behalve ook bij een eigen favoriet een vinkje is en dat een sjabloon als gewone
favoriet naar de server gaat, slagen daar ook: die zijn REGRESSIEWACHT, want dat gedrag was er al. JS 2221 en Python 1024 groen,
`verify`, `check:registratie`, `check:css`, `check:controls` en `check:taal` groen.

## Wat niet lukte

- **Niet op een echte installatie.** Dat doet de beheersessie na de uitgave.
- **Een echt rolluik.** Dat beproeft de eigenaar bij hem thuis.

## Aannames

- "Alles uit" gaat over de lampen, zoals de eigenaar het omschrijft: de rolluiken staan bij beide sjablonen niet aangevinkt, en
  zijn een vinkje verderop.
- De andere vinkjes (Buitenverlichting aan of uit, Rolluiken dicht of open) blijven in het scherm staan; de wens ging over het
  aantal sjablonen. Zijn ze te veel, dan is dat één regel.
- De stap met de keuze blijft, ook met twee sjablonen, zodat Zelf maken er even duidelijk naast staat.

## git status --porcelain

Leeg na de commit.
