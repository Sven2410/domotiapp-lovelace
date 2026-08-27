# Een icoon voor "woning verlaten"

Ronde van 27 augustus 2026 — uitgave **0.24.0**. Eén icoon.

> *"Ik wil een woning-verlaten-icoon hebben."*

## Waarom `away` het niet was

Dat bestond al, maar het is een PERSOON die weggaat: een figuurtje met een pijl.
Dat is het goede beeld voor een bewoner die niet thuis is — `person.sven` op
`not_home`.

Dit gaat over het huis zelf: de knop of de scene waarmee je vertrekt, en die
alles uitzet en het alarm scherpstelt. Daar hoort het huis in beeld, niet een
persoon.

## Wat het geworden is

`homeLeave`: het huis links en compleet, met een pijl die er aan de rechterkant
uit gaat. Hij staat in de icoonkiezer onder **Woning**, naast `house` en
`homeStatus`, en is te vinden op "woning verlaten", "verlaten", "weggaan",
"vertrekken", "huis uit", "afsluiten", "de deur uit", "leave" en "exit".

## Gemeten in een echte browser

Naast zijn buren gezet op een entiteitenkaart en op ware grootte bekeken:
`homeLeave` naast `house`, `away` en `homeStatus`. Het huis blijft herkenbaar en
de pijl leest als "naar buiten" — ook op 20 pixels, de maat waarop hij op een
kaart staat.

Dat is geen overbodige stap: een icoon dat als tekening klopt kan op kaartformaat
alsnog een vlek zijn. De bewaker op de icoonset controleert alleen dát er een
tekening, een plek in het raster en zoekwoorden zijn — niet of het leest.

## Wat niet lukte

Niets.

## Aannames

- Hij wil dit voor een knop of scene, niet voor een persoonsstatus. Gaat het toch
  om een bewoner die weg is, dan is `away` de betere.

## Tellingen

- **819 JS-tests** groen; `check:css` en `check:registratie` OK.
- Versie 0.24.0.

## git status --porcelain

Zie de PR; de werkmap is bij het uitbrengen schoon.
