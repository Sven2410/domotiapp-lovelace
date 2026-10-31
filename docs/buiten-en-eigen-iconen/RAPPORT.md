# Buiten is de ruimte, alleen onze iconen, Dagstand (0.98.1)

31 oktober 2026, tak `fase-142/buiten-en-eigen-iconen`. De eigenaar, op 0.98.0: *"voor buitenlampen heb ik een fix je
gebruikt gewoon de ruimte waar de lampen in staat snap je? (...) er standaard bij een HA installatie buiten aangemaakt wordt
en daar de buitenverlichting in gezet wordt. mdi icons gebruiken we niet alleen onze icons."* En via de beheersessie:
*"Goedemorgen moet worden dagstand"*.

## Samenvatting

| Wat | 0.98.0 | Nu |
|---|---|---|
| Wat buitenverlichting is | woorden in de verdieping, de ruimte en de naam van de lamp | alleen de ruimte: `Buiten`, of `Outside` / `Outdoor(s)` in het Engels. De ruimte van het apparaat telt ook |
| Iconen op een favoriet | onze set plus 7447 van Home Assistant | alleen onze 172, allemaal te zien en te zoeken in het Nederlands en Engels |
| Sjabloon overdag | Goedemorgen | **Dagstand** (Engels: Day mode) |
| De stand ophalen | alleen met een abonnement | ook eenmalig: `domotiapp_lovelace/automatisering/stand`, gevraagd door de beheersessie omdat zijn gereedschap geen gebeurtenissen kan lezen |

Teruggedraaid met de iconen: het ophalen van de lijst van Home Assistant, `zoekMdi` en de hogere grens op de naam (weer 40).
Een favoriet die al een `mdi:`-icoon heeft, blijft dat tonen. De kiezer in de kaarteditors, voor wie een dashboard inricht, is
niet veranderd: daar staan `mdi:`-iconen in bestaande dashboards.

## Gemeten

Testinstance, 55 lampen: 9 in de ruimte `Buiten`, 7 in `Oprit` en `Gevel`, de rest binnen. Gewone gebruiker, kliks en toetsen
`isTrusted: true`, geen fouten in de pagina. Bundel op schijf en geladen `158071a4ce45`.

| Proef | Uitkomst |
|---|---|
| Woning verlaten kiezen | Alle lampen uit (46 lampen), Behalve de buitenverlichting: "Tuin Spots, Tuin Plafond en 7 andere" |
| Opslaan | 46 lampen, 0 uit de ruimte `Buiten`, 7 uit `Oprit` en `Gevel` |
| tik op de knop | binnen uit, oprit uit, ruimte `Buiten` blijft aan |
| de hele iconenkiezer | 172 iconen, 0 `mdi:`, 0 `ha-icon` |
| zoeken "was machine", spatie `isTrusted: true` | `washer`, `dishwasher`, de focus blijft in het veld |
| zoeken "slapen" | `sleep`, `moon`, `bed`, `bedDouble` |
| zoeken "robot" | `stofzuiger`; die kiezen en opslaan werkt |
| zoeken "bestaatniet" | "Geen icoon gevonden." |
| de sjablonen | Woning verlaten, Slapen, Thuiskomen, Dagstand, Alles uit, Zelf maken |
| `automatisering/stand` als gewone gebruiker | `regels`, `favorieten`, `vakantie`, `gekoppeld` |

**Proeven.** Op 0.98.0 falen de proef voor de ruimte (daar telde een lamp in `Tuin` of op een verdieping `Outside` als buiten),
Dagstand, de lijst sjablonen en `automatisering/stand`, allemaal NIEUW GEDRAG. JS 2218 en Python 1024 groen, `verify`,
`check:registratie`, `check:css`, `check:controls` en `check:taal` groen.

**In het echt, op 0.98.0:** de beheersessie heeft bij een klant tien favorieten opgeslagen en uitgevoerd op echte Plejd-lampen,
met toestemming van de eigenaar. 199 van de 199 lampen kwamen goed uit, binnen 3% van de gekozen waarde, zonder meldingen in
het systeemlog. Dat ging over de server, niet over het scherm; dat is in deze ronde alleen op de testinstance gemeten.

## De separator bij een klant

De eigenaar wil de separator boven de kaart houden, met een passende naam en een icoon uit onze set. Mijn keuze: **Smart home**
met `homeStatus`, in de taal van dat dashboard. Hij dekt de hele kaart (automatiseringen, favorieten, vakantie) en is niet
hetzelfde woord als de titel eronder. Getekend op de testinstance. Het dashboard zelf is voor de beheersessie.

## Wat niet lukte

- **Niet op een echte installatie.** De beheersessie heeft het gebied `Outside` bij de klant al nagelopen op 0.98.0 en vond de
  zes lampen daar; dat gebied telt ook hier als buiten, maar 0.98.1 staat er nog niet.
- **Een echt rolluik.** Dat beproeft de eigenaar bij hem thuis.

## Aannames

- Engelse installaties noemen die ruimte `Outside`, `Outdoor` of `Outdoors`. Andere namen tellen niet: zet de lampen in de ruimte.
- Een klant zonder die ruimte krijgt geen vinkjes voor buiten, en Dagstand en Thuiskomen alleen als er rolluiken zijn.

## git status --porcelain

Leeg na de commit.
