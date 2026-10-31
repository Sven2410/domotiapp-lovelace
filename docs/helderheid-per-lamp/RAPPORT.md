# 0.94.0: helderheid per lamp op de automatiseringskaart

Gevraagd op 31 oktober 2026, via een beheersessie: per lamp een eigen helderheid. De woorden
van de eigenaar: *"dat moet separaat kunnen"*.

## Samenvatting

**In het scherm** staat onder Helderheid per gekozen lamp een eigen schuif, met de naam en het
percentage. Een lamp die erbij komt, begint op wat er het laatst is ingesteld. Op de rij staat
één waarde, of een bereik als de lampen verschillen: "Aan om 16:29 · 29-72% · Elke dag".
Vakantieregels werken hetzelfde.

**Geen schuif** krijgt een lamp die alleen aan en uit kan, en een lamp in het nieuwe editorveld
**Alleen aan en uit**. Dat is voor een dimblokje met vaste lampen, dat zich als dimbaar meldt.
Eén veld in plaats van een vinkje per lamp, want er kunnen 55 lampen op de kaart staan. De
kiezer toont alleen de lampen van de kaart. In de YAML: `alleen_aan_uit: [entity_id]`.

**Op de server** is `helderheden: {entity_id: pct}` erbij gekomen.

| Regel | Gedrag |
|---|---|
| met `helderheden` | elke lamp zijn eigen waarde. Lampen met dezelfde waarde gaan in één aanroep, zodat ze ook echt tegelijk aangaan |
| lamp niet in `helderheden` | gaat aan zonder helderheid |
| zonder `helderheden` (van vóór 0.94.0) | de ene `helderheid` geldt voor alle lampen, zoals het was |

Een telefoon die de oude bundel nog vasthoudt kan gewoon blijven opslaan: het oude bericht is
nog geldig. Uit blijft één aanroep voor alle lampen.

## Gemeten

Testinstance op de mini-pc (HA 2026.8.1), headless Chromium met Playwright. De klant is het
account `Receptie` (geen beheerder), op 393 breed met echte tikken (`isTrusted: true`). De `?v=`
van de geladen bundel (`c3ba73877305`) was gelijk aan de sha256 op schijf.

| Stap | Uitkomst |
|---|---|
| beheerder kiest in de echte kiezer de kleurtemperatuurlamp bij Alleen aan en uit | `alleen_aan_uit` in de YAML; de kiezer toont alleen de vier lampen van de kaart |
| klant kiest vier lampen | twee schuiven: de aan/uit-lamp en de lamp op alleen aan en uit krijgen er geen |
| tik op 30% en 70% van de schuiven | 29% en 72% |
| opslaan | `{"light.test_lamp_dim":29,"light.test_lamp_rgb":72}`, vier lampen |
| de rij | "Aan om 16:29 · 29-72% · Elke dag" |
| opnieuw openen | 29% en 72% staan er nog |
| **wachten tot 16:29** | **dim aan op 74 en rgb aan op 184 (29% en 72% van 255); de aan/uit-lamp aan** |
| de lamp op alleen aan en uit | aan op 128, zijn eigen laatste stand, geen helderheid vanuit de regel |
| een regel van vóór 0.94.0 (`helderheid: 35`) | de rij zegt 35%, het scherm toont 35% bij beide lampen |

**Proeven:** 11 nieuwe Python-tests en 5 nieuwe JS-tests, plus twee bestaande JS-tests aangepast
aan de nieuwe vorm. Op de code van vóór deze ronde falen 5 Python-tests en 7 JS-tests; de overige
nieuwe Python-tests zijn REGRESSIEWACHT of toetsen wat het schema al weigerde, en slagen daar ook.
JS 2156 en Python 1000 groen; `verify`, `check:registratie`, `check:css`, `check:controls` en
`check:taal` groen.

## Wat niet lukte

- **Niet op een echte installatie gemeten.** Dat doet de beheersessie na de uitgave, met een
  proefregel van twee lampen op verschillende helderheid.
- **Vakantieregels met verschillende helderheden** zijn niet apart in de browser gemeten; ze
  gebruiken dezelfde code.
- **Niet gemeten:** het scherm in donker met veel lampen; het vak scrolt, en dat is niet bekeken.

## Aannames

- Geen schuif "alles tegelijk". De vraag was juist per lamp. Bij veel lampen helpt dat een nieuwe
  lamp begint op de laatst ingestelde waarde.
- `alleen_aan_uit` staat op de automatiseringskaart zelf. De kaart leest het vinkje van de
  lichtkaart niet: dat zijn twee aparte kaarten op misschien andere dashboards.

## git status --porcelain

Leeg na de commit van deze ronde.
