# 0.84.1: de tabbladenkaart krimpt weer na een wissel

## Aanleiding

Op 21 oktober 2026 stuurde de eigenaar een schermafdruk van een pop-up bij een
klant: twee robotstofzuigers in een tabbladenkaart, per tabblad een
verticale stapel met de stofzuigerkaart en een terugknop. Zijn vraag:
*"waarom zoveel ruimte tussen back en die onderderste omlijning?"*

## Gemeten bij de klant

Ik heb in een eigen tabblad gemeten en daarbij alleen tussen de twee tabbladen
gewisseld. Er is niets aan de stofzuigers veranderd.

| Stap | Kaart | Inhoud van het tabblad | Leeg onder de inhoud |
|---|---|---|---|
| geladen op Ground floor (met plattegrond) | 1208 | 1130 | 17 |
| echte klik op 1st floor | **1208** | 1002 | **145** |

**Oorzaak.** `.vakken` (het vak met de tabbladen) stond op `flex: 1 1 auto`
en vulde dus de kaart. `meetRaster` telt de hoogte van de kinderen van de
kaart op, en de kaart is minstens zo hoog als die meting. Na een wissel mat de
kaart dus het uitgerekte vak, en daarmee zichzelf. Hij kon alleen groeien,
nooit krimpen.

## Wat er veranderd is

`.vakken` staat op `flex: 0 1 auto`: niet groeien, wel krimpen.

## Bewijs

- **Bij de klant, in mijn tabblad.** Ik zette dezelfde regel (`flex-grow: 0`)
  alleen in het geheugen van de pagina en wisselde daarna met echte kliks
  (`isTrusted=true`) naar Ground floor en terug. 1st floor werd toen **1080**
  hoog, met 17 leeg (eerst 1208, met 145 leeg). Herladen haalt de proef weer
  weg.
- **Test:** `tests/js/tabs-krimpen.test.mjs`. Tegen `main`:

  ```
  AssertionError: flex: 1 1 auto; min-height: 0; display: block;
    actual: 1, expected: 0
  ℹ fail 1
  ```
- **Bewakers en tests:** 2049 JS-tests, `verify`, `check:registratie`,
  `check:controls`, `check:css` en `check:taal` zijn groen. De Python-tests
  draaien in CI; er is geen Python veranderd.

## Wat niet lukte

- **De gebouwde bundel zelf** is niet bij de klant gemeten. Dat kan pas na
  het bijwerken. Wel is precies die CSS-regel daar live geprobeerd.
- **Lege ruimte in de stofzuigerkaart zelf.** Er zit ook nog zo'n 47 px leeg
  binnen de stofzuigerkaart: de inhoud is 905, en dat wordt naar boven
  afgerond op de rasterrij (952). Dat is de vormregel "hoogte valt op HA's
  rasterrijen". In een stapel in een pop-up heeft dat weinig zin, maar ik heb
  het niet veranderd zonder de eigenaar.

## Aannames

- **Krimpen mag** (`flex-shrink` 1, zoals het was): een kaart die door een
  vaste rijhoogte kleiner gehouden wordt, gedraagt zich zoals voorheen.

## git status --porcelain

```
(leeg na de commit van dit rapport)
```
