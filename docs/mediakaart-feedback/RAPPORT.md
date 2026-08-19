# Zes dingen aan de mediakaart, na de eerste blik erop

Ronde van 19 augustus 2026, direct na de alarmcode. Zes punten uit de feedback,
alle zes gebouwd.

---

## 1. De speakerknop is weg

Naast de zoekknop stond een tweede knop voor het groeperen. Dat bleek dubbelop:
het zoekscherm toont de speakers onderin, dus wie op zoeken tikt komt ze vanzelf
tegen. Eén knop, één scherm.

## 2. Wat dat tweede icoontje doet

Dat is **herhalen**, en hij heeft drie standen:

| Uiterlijk | Betekenis |
|---|---|
| stil (grijs) | uit — de wachtrij speelt af en stopt |
| gekleurd | de hele wachtrij blijft herhalen |
| gekleurd met een **1** erin | alleen het nummer dat nu speelt blijft herhalen |

De derde stand werd aangezien voor "een lus met een streep erdoor", en dat is
een terechte lezing: de 1 was een kaal streepje van vier pixels. Hij is
opnieuw getekend — nu met een uitgespaard vlak eromheen, een schuine aanzet en
een voetje, zodat het op 16 pixels als een cijfer leest. De knop draagt
bovendien een voorleeslabel dat de stand uitspreekt ("Herhalen: dit nummer").

## 3. Volume per gegroepeerde speaker

De voet van het zoekscherm is nu een lijst met een regel per speaker. Wie
meespeelt heeft daar **zijn eigen volumeschuif** naast staan, met het
percentage erachter. Dat is geen luxe: in een groep staat de een in de keuken
naast je en de ander twee kamers verderop.

Een speaker die geen volume kan instellen krijgt de tekst "geen volumeregeling"
in plaats van een schuif die nergens op aankomt.

## 4. Gelijk volume bij het koppelen

Dit is het punt met de scherpste rand, en hij is precies zo gebouwd als
gevraagd: zodra een speaker bij de groep komt, krijgt hij **het volume van de
speler waar hij bij komt**. Eerst `media_player.join`, dan meteen
`media_player.volume_set` met het huidige niveau.

De reden staat in de code: een speaker die uit een vorige sessie op vol volume
staat, begint bij het koppelen op vol volume — in een slaapkamer, om elf uur 's
avonds, en een kleine speaker kan er stuk van gaan. Wat je hoort hoort te zijn
wat de schuif aangeeft.

Gemeten: de woonkamerspeaker op 100 % gezet, gekoppeld aan de keuken (28 %), en
in het logboek staan achter elkaar `join` en `volume_set 0.28`. Daarna staan
beide regels op 28 %.

## 5. Bredere zoekbalk met het woord erin

Het veld is 56 pixels hoog en loopt over de volle breedte (1691 px op dit
scherm), met de hint *"Zoeken naar een nummer, album, artiest of afspeellijst"*
en een knop **Zoeken** ernaast. Typen-en-wachten werkt nog steeds; de knop is
er voor wie wil zien dát er iets gebeurt.

## 6. Geluid van een andere entiteit (de soundbar)

Nieuwe, optionele instelling **"Geluid van"** op de mediakaart. Zit het geluid
ergens anders dan het beeld — een tv met een soundbar eronder — kies daar dan de
speler die het volume regelt. De schuif, dempen en de plus/min-knoppen gaan dan
naar die entiteit; de rest van de kaart blijft over de speler zelf gaan.

Gemeten op een tv zonder eigen volumeregeling met een soundbar op 22 %: de kaart
toont de titel van de tv en de volumeregel van de soundbar, op 22 %.

---

## Tests

`npm test`: **286 groen** (was 282). De tests op de derde regel zijn meegegaan
met het verdwijnen van de speakerknop, en er staat een set bij op `geluidsSpeler`
— de keuze tussen de speler zelf en de ingevulde geluidsentiteit.

## Wat er misging tijdens het meten

De schuif in een speakerregel kreeg via `sliderHtml("spreker")` dezelfde
klassenaam als de regel eromheen. Gevolg: hij erfde de pilvorm mét rand, en hij
kwam mee uit `querySelectorAll(".spreker")` — in de meting zichtbaar als zes
"regels" waarvan er twee leeg waren. Opgelost door de schuif geen eigen klasse
te geven; de opmaak gaat al via `.spreker .slider`. Daarna opnieuw gemeten: vier
regels, elk 38 px, en alleen de meespelende speaker heeft een schuif.

## Wat niet lukte

**Opnieuw geen meting met echte kliks**: het Chrome-venster stond nog steeds
niet vooraan (`document.visibilityState === "hidden"`), en dan landt er geen
enkele klik van de browsertool. Alles hierboven is met nagebootste pointer- en
clickevents gemeten. Dat bewijst de bedrading, niet de knop — en het staat nog
steeds open om over te doen zodra het venster zichtbaar is.
