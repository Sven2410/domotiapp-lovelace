# De brede afvalkaart, opnieuw

Ronde van 27 augustus 2026 — uitgave **0.26.0**. Eén melding, met een
schermafdruk erbij en drie woorden: *"ziet er niet uit."*

Dat ging over de brede vorm die een halfuur eerder in 0.25.0 was uitgebracht. Hij
had gelijk, en er zaten twee dingen fout — waarvan één een echte fout en één een
overtreding van een regel die dit project zelf al had opgeschreven.

---

## 1. Een lappendeken van gekleurde vlakken

Elke bak kreeg een eigen vlak: een achtergrond in zijn fractiekleur, een rand,
en de eerstvolgende nog een vollere kleur erbovenop. Vier bakken naast elkaar
werden zo vier verschillend gekleurde blokken.

Dat botst met een vormregel die in `CLAUDE.md` staat sinds 17 augustus:

> **Alleen het icoon draagt de toestand**, niet het hele kaartvlak. Een kolom van
> acht aanstaande knoppen wordt anders een muur in plaats van een rij.

Precies dat, maar dan horizontaal. De regel stond er, en hij is bij het bouwen
van deze vorm niet toegepast.

### Wat het geworden is

De stip draagt de kleur, de tekst is neutraal, en er is geen vlak en geen rand
meer. De eerstvolgende bak valt op door twee dingen die niets kosten: zijn naam
staat als enige in VOLLE inkt, en zijn stip krijgt een ring — hetzelfde teken dat
de lampkaart gebruikt.

---

## 2. De kaart liep 16 pixels over

Dit was de echte fout, en hij was meetbaar:

```
kaart_hoogte:  56px
inhoud_wil:    71px
LOOPT_OVER:    true      -> 16px over de onderrand
```

De titel stond BOVEN de bakken. Titel (22) + tussenruimte (8) + de rij (31) plus
padding paste niet in één rasterrij — en omdat de brede vorm een vaste rijhoogte
opgeeft, groeide de kaart niet mee maar liep hij eruit. Dat is valkuil 12: de
kaart schildert over zijn buurman.

### Wat het geworden is

De titel staat nu NAAST de bakken. Dat past wél, en het is bovendien precies wat
hij vroeg — zo min mogelijk hoogte:

```
kaart_hoogte:  56px
inhoud_wil:    54px
LOOPT_OVER:    false
```

Ter vergelijking staat de lijstvorm met dezelfde vier bakken op **248px**.

---

## Wat hieruit te leren valt

De vorige ronde is uitgebracht op een meting die klopte — 248px werd 56px, en dat
was waar. Maar er is toen alleen naar de HOOGTE gekeken en niet naar hoe het
eruitzag; de schermafdruk die er wél was, is niet met de vormregels ernaast
gelegd.

Een gemeten getal is geen bewijs dat iets goed is. `LOOPT_OVER` had die avond ook
gemeten kunnen worden, en die had de fout meteen laten zien.

## Wat niet lukte

Niets. Beide punten zijn gemeten vóór en ná.

## Aannames

- Geen. De vormregel stond al in `CLAUDE.md`; die is nu toegepast in plaats van
  opnieuw bedacht.

## Tellingen

- **833 JS-tests** groen; `check:css` en `check:registratie` OK.
- Versie 0.26.0.

## git status --porcelain

Zie de PR; de werkmap is bij het uitbrengen schoon.
