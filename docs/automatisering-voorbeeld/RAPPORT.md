# Een voorbeeld op de automatiseringskaart (0.95.0)

31 oktober 2026, tak `fase-138/automatisering-voorbeeld`. De eigenaar: *"ik wil ook een
voorbeeld dat ik kan zien wat die automatisering is dus bijvoobeeld ingesteld op 50% dat alles
naar 50% gaat als je op voorbeeld klikt"*.

## Samenvatting

In het invulscherm staat onder Helderheid de knop **Voorbeeld**. Die zet de gekozen lampen meteen
zoals de regel ze straks zet: elke groep op zijn eigen helderheid, een lamp die alleen aan en uit
kan gewoon aan.

- **De knop wordt Voorbeeld stoppen**, en de lampen gaan terug zoals ze stonden: wat uit stond weer
  uit, wat aan stond op zijn eigen helderheid. De kleur raakt het voorbeeld niet aan.
- **Dat gebeurt ook bij sluiten, Annuleren en Opslaan.** Opslaan zet de regel neer; hij gaat pas af
  op zijn tijd.
- **Tijdens een voorbeeld volgen de lampen het scherm:** een schuif (na 250 ms stil), een lamp
  erbij, een lamp eruit. Die laatste gaat terug zoals hij stond.
- **Zonder moment Aan is er geen voorbeeld.** Een regel die alleen uitzet heeft geen knop, en Aan op
  Geen zetten stopt een lopend voorbeeld.

Het draait in de browser, met gewone `light.turn_on` en `light.turn_off`, niet in de motor. Het is
een proef van wie kijkt, en geen regel.

## Gemeten

Als gewone gebruiker (Receptie) op 393 breed, echte tikken, `isTrusted: true`, op de testinstance.
Bundel op schijf en geladen `a87a49ffd6e1`. Begin: Ceiling aan op 30%, de rest uit.

| Proef | Ceiling | Kitchen | Bed | aan-uit-lamp |
|---|---|---|---|---|
| lampen gekozen, schuif op 51%, nog geen voorbeeld | 30% | uit | uit | uit |
| **Voorbeeld** | 51% | 51% | uit | aan |
| schuif naar 82% | 82% | 82% | uit | aan |
| Bed erbij | 82% | 82% | 82% | aan |
| Kitchen eruit | 82% | **uit** | 82% | aan |
| **Voorbeeld stoppen** | **30%** | uit | uit | uit |
| meteen weer Voorbeeld | 82% | uit | 82% | aan |
| kruisje | **30%** | uit | uit | uit |
| nieuw scherm, Kitchen, Voorbeeld | 30% | 100% | uit | uit |
| Aan op Geen | 30% | uit | uit | uit |
| Voorbeeld, dan Opslaan | 30% | uit | uit | uit |

Geen fouten in de pagina.

**Proeven.** 5 nieuwe, allemaal NIEUW GEDRAG; op de vorige stand falen ze, want de functies bestaan
daar niet. De uitkomst van de hele ronde staat in de PR.

## Wat niet lukte

- **Niet op een echte installatie.** Bij een lamp die traag meldt, of een dimmer met overgangstijd,
  is het niet gemeten.
- **Gaat de pagina dicht tijdens een voorbeeld, dan blijven de lampen staan.** Telefoon op slot in
  de app, tabblad weg, netwerk weg: dan is er niemand om ze terug te zetten. Er is geen timer. Ik
  heb dat niet op de server gezet, want een proef hoort niet in de motor, en een timer zou de lampen
  uitzetten terwijl je nog staat te kijken.
- **Met 55 lampen niet gemeten.** Elke waarde is één aanroep met alle lampen erin, dus dat zijn er
  niet 55, maar de installatie zelf kan er een moment over doen.

## Aannames

- Terugzetten is wat de eigenaar wil; hij noemde alleen het aangaan. Lampen die aan blijven na een
  proef lijkt me niet de bedoeling.
- Een lamp die onderweg door iemand anders is verzet, gaat bij stoppen terug naar hoe hij stond bij
  het begin van het voorbeeld.

## git status --porcelain

Leeg na de commit.
