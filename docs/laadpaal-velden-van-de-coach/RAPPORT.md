# De laadpaalkaart volgt wat de coach zegt dat te zetten is (0.108.0)

4 november 2026, tak `fase-157/laadpaal-velden-van-de-coach`. Vervolg op 0.107.0. Coach v0.197.0 geeft twee attributen
erbij op de sensor van de laadpaal (CONTRACT blijft 1):

- `velden`: wat de bewoner bij deze paal kan zetten. Met Zonder accustand, in de goedkope uren (`goedkoop_blok`), is dat
  `["modus", "pauze"]`. Anders is het `["klaar_tijd", "doel", "schema", "modus", "pauze"]` (`paal_velden` in `entiteit.py`
  van de coach).
- `modus_bron`: `"app"` als Snel uit de app van de paal kwam (een hervat in de Easee-app terwijl de coach wachtte), anders
  `""`.

## Samenvatting

- **Schema, Klaar om en Laden tot vallen vanzelf weg als de coach ze niet noemt** (`veldVanCoach`). Dat geldt ook met het
  vinkje van 0.107.0 aan. Een coach zonder `velden` (van vóór v0.197.0) geeft alles, zoals het was.
  - Klaar om neemt de week en de tijd achter "Planning" mee, net als bij het vinkje.
  - De namen van de coach zijn `klaar_tijd`, `doel` en `schema`; die van de kaart `klaar_om`, `laden_tot` en `schema`.
- **Snel uit de app staat erbij**, in de zin onder de knoppen: "Snel uit de app van de paal: geldt tot de kabel eruit gaat."

## De echte dump

Van een klant op coach v0.197.0, kort na de installatie (4 november 2026): een Easee Charge Max in de goedkope uren,
zonder auto. Geanonimiseerd (geen device-id, unique_id of context) in
`tests/js/vaste-invoer/coach-0.197.0-laadpaal.json`, met drie proeven erop:

- `velden: ["modus", "pauze"]`, en `modus_bron: ""`;
- daaruit volgt dat Schema, Klaar om en Laden tot wegvallen;
- `modus_actief` blijft `planning`, met de keuzes `snel`, `continu` en `zon` (REGRESSIEWACHT).

Daar staan ook `target_percent: null` en zeven dagen met `klaar_om: "14:51"`, terwijl `schema_aan` en `per_dag` uit
staan. Die klaar-tijd kwam zonder deze ronde dus op de kaart, terwijl hij niet gold.

## Gemeten

**De proeven.** `tests/js/laadpaal-velden-van-de-coach.test.mjs`: 8 nieuw (6 NIEUW GEDRAG, 2 REGRESSIEWACHT), waarvan 3 op de echte
dump. Op 0.107.0 falen er 7; de REGRESSIEWACHT op de modus slaagt daar ook, zoals bedoeld.

| | |
|---|---|
| JS | alle groen |
| `verify`, `check:taal`, `check:css`, `check:controls`, `check:registratie` | groen |

**In de testinstance**, met Playwright headless, op view `laadpaal-knoppen`. De kaart staat daar zonder `velden` in zijn
config. `sensor.oprit_coach` van de nagebootste coach kreeg de attributen even met `POST /api/states`, en daarna weer de
oude. De bundel in de pagina (`171a9168a8f0`) was gelijk aan die op schijf, en er waren geen fouten.

| sensor | Schema | Klaar om | Laden tot | Pauze | regel | zin |
|---|---|---|---|---|---|---|
| geen `velden` (oude coach) | staat er | staat er | staat er | staat er | "Planning · klaar om 07:30" | |
| alle vijf | staat er | staat er | staat er | staat er | "Planning · klaar om 07:30" | |
| `["modus", "pauze"]` | weg | weg | weg | staat er | "Planning" | |
| idem, Snel uit de app | weg | weg | weg | staat er | | "Snel uit de app van de paal: geldt tot de kabel eruit gaat." |

## Wat niet lukte

- `modus_bron: "app"` is nog niet in het echt gezien. Het staat in de bron van de coach (`sensor.py`, v0.197.0) en is
  in de testinstance gemeten.
- "Nu laden" vooraan als de coach wacht, met wanneer hij anders begint, staat ook in de werkbon. Het is hier niet
  gebouwd: Snel staat er al, en een knop die van naam wisselt is een eigen ronde.

## Aannames

- `velden` is de bron, niet `goedkoop_blok`. Zo hoeft de kaart niet te weten welke stand welke velden heeft.

## git status --porcelain

```
(schoon na de commit)
```
