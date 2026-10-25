# 0.85.0: meldingen van de robotstofzuiger

Gevraagd op 25 oktober 2026: *"we hebben nu afvalmeldingen. Ik wil ook
meldingen van de robotstofzuiger kunnen instellen."* Eerst voor de twee
Dreames bij een klant (HACS `dreame_vacuum`, Tasshack v2.0.2): een X50 Ultra
Complete en een L40s Pro Ultra.

## Wat het doet

De meldingenkaart heeft naast Afvalmeldingen een tweede soort:
**Robotstofzuiger**. In de editor:

- een schakelaar **Robotstofzuiger**;
- daaronder (uitklapblok *Robots en meldingen*) de **robots**;
- en **Waarover**, met vier vinkjes, standaard allemaal aan.

| Waarover | Wanneer | Op de telefoon (titel = de robot) |
|---|---|---|
| Klaar met schoonmaken | de taak (`task_status`) gaat van schoonmaken naar `completed` | "Klaar met schoonmaken: 51 m² in 52 min." |
| Storing | de sensor `error` is iets anders dan "geen fout" | "Storing: Dweilpad verwijderd" (de beschrijving van Dreame zelf) |
| Water en stofzak | schoonwatertank, waterwaarschuwing, vuilwatertank of stofzak niet in orde | "De vuilwatertank is vol of niet geplaatst. Leeg hem." |
| Onderhoud | een onderdeel (`<onderdeel>_left`, %) zakt tot 10 % | "Hoofdborstel: nog 10 %. Tijd om te vervangen of schoon te maken." |

Per persoon staat er in de pop-up achter het potlood een vinkje
*Robotstofzuiger*, net als bij afval. Daaronder staat wat er komt:
"Klaar, storing, tanks en onderhoud · X50 Ultra Complete en dreame boven".

Een storing, een tank of een onderdeel is een TOESTAND. De melding komt één keer
als het begint, met een tag per robot en per ding. Is het weer in orde, dan
haalt de integratie hem van de telefoons (`clear_notification`). Twee sensoren
die hetzelfde zeggen (de schoonwatertank en de waterwaarschuwing) geven één
melding.

"Klaar" wacht tien tellen, zodat het oppervlak en de duur van de beurt er al
staan. Een waarde die uit `unavailable` komt, is een robot die opnieuw
verbindt: dat wordt onthouden maar niet gemeld.

De proefknop in de pop-up stuurt nu per soort een proef. Voor de stofzuiger is
dat "Klaar" van de eerste robot, met de cijfers van zijn laatste beurt.

## Waarom op de sensoren en niet op de gebeurtenissen van Dreame

`dreame_vacuum` vuurt zelf gebeurtenissen af op de bus:
`dreame_vacuum_task_status`, `_error`, `_warning`, `_low_water`,
`_consumable` en `_information` (zie `coordinator.py` van Tasshack v2.0.2).
Die komen ook als de meldingen van de integratie zelf uit staan. Toch kijkt
deze ronde naar de sensoren:

- **Ze staan in de echte dumps van beide robots**
  (`tests/js/vaste-invoer/dreame-*.json`), met hun `translation_key`'s en
  waarden. De gebeurtenissen nog niet. Dezelfde afspraak als bij de coach: er
  gaat niets uit dat leunt op iets wat niet in een echte dump heeft gestaan.
- **De rol zit in de `translation_key`**, net als op de stofzuigerkaart. Een
  volgend merk is een regel in `ROLLEN` (`meldingen/stofzuiger.py`), geen
  nieuwe luisteraar.

De WAARDEN die geen dump liet zien (`low_water`, `not_installed_or_full`,
`check`, de namen van de taken) komen uit de bron van Tasshack v2.0.2,
`dreame/types.py`: `DreameVacuumTaskStatus`, `CleanWaterTankStatus`,
`DirtyWaterTankStatus`, `DustBagStatus` en `LowWaterWarning`.

Er ligt een vraag bij de beheersessie van die klant om de geschiedenis van deze
sensoren en, als het kan, een paar echte gebeurtenissen uit te lezen.

## Gemeten

**In Home Assistant zelf**, op de nieuwe testinstance op de mini-pc (8127).
Daar staat een nagebootste L40s met dezelfde entiteiten als de dump. De
meldingenkaart op `kaart-test/meldingen` heeft de stofzuiger aan. De melding
voor `dev` gaat naar `notify.persistent_notification`, de manier uit CLAUDE.md
om zonder telefoon te proeven.

- Vuilwatertank op `not_installed_or_full` gezet (`POST /api/states`): in Home
  Assistant verscheen *"dreame boven | De vuilwatertank is vol of niet
  geplaatst. Leeg hem."*
- `task_status` van `segment_cleaning` naar `completed`: na 12 tellen
  *"dreame boven | Klaar met schoonmaken: 51 m² in 52 min."*

**In een echte browser** (Chromium van Playwright, headless, 393 breed), met
echte kliks:

- Pop-up van `dev`: regel "Robotstofzuiger" met *"Klaar, storing, tanks en
  onderhoud · Dreame boven en X50 Ultra Complete"*.
- Klik op het vinkje: `aria-checked` van `true` naar `false`, en weer terug.
- Proefknop: *"Verstuurd naar dev: “Proef · dreame boven”."*
- Alle kliks `isTrusted: true`, geen fouten in de console.
- Bundel `?v=64895f68d010`, gelijk aan de sha256 op schijf.

De editor (1280 breed, via *Dashboard bewerken* en een muisklik op de kaart)
toonde:

- de schakelaar Robotstofzuiger aan;
- het blok *Robots en meldingen* met beide robots;
- vier vinkjes, allemaal aan.

Een muisklik op het vinkje "Storing" (`isTrusted: true`) maakte de keuze
`["klaar","station","onderhoud"]`. Niet opgeslagen.

Er is in deze ronde geen tekstveld bij gekomen, dus er is geen spatie te typen.

## Toetsen

- `tests/meldingen/test_stofzuiger.py`, **NIEUW GEDRAG**, 22 gevallen, op de
  dump van de L40s: apparaat, `translation_key`'s en toestanden zoals daar.
  Klaar (en een plattegrond maken is geen beurt), een storing die komt en weer
  weggaat, dezelfde storing niet twee keer, de vuilwatertank, tank plus
  waarschuwing als één melding, een onderdeel op de grens en niet opnieuw bij
  verder zakken, niets na opnieuw verbinden, wie uit staat, alleen wat
  gekozen is, Engels, een weggehaalde kaart, de proef, en de klok die geen
  stofzuigermelding stuurt. Op de oude code:

  ```
  E   ImportError: cannot import name 'stofzuiger' from 'custom_components.domotiapp_lovelace.meldingen'
  !!!!!!!!!!!!!!!!!!!! Interrupted: 1 error during collection !!!!!!!!!!!!!!!!!!!!
  ```

- `tests/js/meldingen-stofzuiger.test.mjs`, 9 gevallen, waarvan 2 als
  **REGRESSIEWACHT** gelabeld: een oude afvalkaart krijgt geen stofzuiger
  erbij, en het id. Op de oude code: `# pass 2  # fail 7`.

Totaal: 2063 JS-tests en 925 Python-tests groen; `verify`,
`check:registratie`, `check:css`, `check:controls` en `check:taal` groen.

## Samenvatting

Op de meldingenkaart kan nu per persoon een vinkje Robotstofzuiger aan. De
integratie stuurt een melding als een robot klaar is, een storing heeft, water
of een lege tank nodig heeft, of als een onderdeel op is. Wat er gemeld wordt
kies je in de editor.

## Wat niet lukte

- Niet bij de klant zelf gemeten: die Home Assistant is alleen ter plekke te
  bereiken, en de mini-pc staat op een ander netwerk. De vraag staat bij de
  beheersessie op de Mac.
- Niet op een echte telefoon gezien. De vorm van de melding (titel, tekst,
  `tag`, `group`) is die van de afvalmelding, die op zijn telefoon werkt.
  `clear_notification` is in de toetsen nagekeken, niet op een telefoon.

- In PR #145 (de testinstance op de mini-pc, alleen CLAUDE.md) stond het
  NAS-pad met de naam van de machine erin, en die bevat de voornaam van de
  eigenaar. Gevonden bij de grep op namen voor deze PR, en hier uit CLAUDE.md
  gehaald. In de geschiedenis van #145 staat hij nog; die is niet herschreven,
  net als in valkuil 71.

## Aannames

- De waarden die niet in een dump stonden, komen uit `types.py` van Tasshack
  v2.0.2: de versie bij de klant.
- "Klaar" kijkt naar `task_status`. Tijdens het wassen van de dweilpads
  midden in een beurt blijft die op de schoonmaaktaak staan. Dat volgt uit de
  bron (`_task_status_changed` meldt daar ook pas bij `cleanup_completed`),
  maar ik heb het niet in een echte beurt gezien.
- De grens voor onderhoud is 10 %, dezelfde als waar het balkje op de
  stofzuigerkaart oranje wordt. Dreame zelf meldt pas bij 5 %.

## git status --porcelain

```
(zie de PR; na de commit leeg)
```
