/** Het Engels van de wekkerkaart en haar editor (sinds 0.83.0). */
export const WEKKER = {
  // alarm-card.js: de kaartkiezer en de config-editor
  "DomotiApp Wekker": "DomotiApp Alarm Clock",
  "Wekkerkaart van DomotiApp.": "Alarm clock card from DomotiApp.",
  "Persoon": "Person",
  "Achtergrond weglaten": "Hide background",
  "Elke persoon heeft zijn eigen wekkerlijst. De kaart toont alleen de wekkers van de gekozen persoon.":
    "Each person has their own list of alarms. The card shows only the alarms of the chosen person.",

  // alarm-card.js: de kaart
  "Wekkers ophalen…": "Loading alarms…",
  "De opdracht is niet gelukt.": "That did not work.",
  "Wekker toevoegen": "Add alarm",
  "Wekker {naam} bewerken": "Edit alarm {naam}",
  "Wekker {naam} aan of uit": "Alarm {naam} on or off",
  "Wekker {naam} verwijderen": "Remove alarm {naam}",
  "Annuleren": "Cancel",
  "Verwijderen": "Remove",
  "Begrepen": "Got it",

  // weergave.js
  "Geen wekkers ingesteld": "No alarms set",
  "Eenmalig": "Once",
  "Eenmalig — afgelopen": "Once, passed",
  "Geen wekker actief": "No alarm active",
  "Stoppen": "Stop",
  "Er is een melding over deze wekker, maar de tekst ontbreekt.":
    "There is a message about this alarm, but its text is missing.",
  "Wekker": "Alarm",
  "en": "and",

  // kaartconfig.js
  "Kies een persoon in de kaartinstellingen.": "Choose a person in the card settings.",
  "De gekozen persoon is niet gevonden.": "The chosen person was not found.",
  "De opgeslagen wekkers van deze persoon zijn onleesbaar.": "The saved alarms of this person cannot be read.",
  "De kaartconfig ontbreekt of is geen object.": "The card config is missing or is not an object.",
  "'person' moet een entity-ID zijn, zoals person.bram.": "'person' must be an entity ID, such as person.bram.",
  "'{person}' zit niet in het domein {domein}. Kies een persoon, zoals person.bram.":
    "'{person}' is not in the {domein} domain. Choose a person, such as person.bram.",
  "Er ging iets mis bij het ophalen van de wekkers.": "Something went wrong while loading the alarms.",

  // bevestiging.js
  "Wil je de wekker \"{naam}\" van {tijd} verwijderen?": "Remove the alarm \"{naam}\" at {tijd}?",
  "Wil je de wekker \"{naam}\" verwijderen?": "Remove the alarm \"{naam}\"?",
  "Wil je de wekker van {tijd} verwijderen?": "Remove the alarm at {tijd}?",
  "Wil je deze wekker verwijderen?": "Remove this alarm?",

  // editorlogica.js
  "Let op: deze tijd bestaat twee nachten per jaar niet, of twee keer. Bij de overgang naar zomertijd wordt het uur van 02:00 tot 03:00 overgeslagen; die nacht gaat deze wekker niet af. Bij de overgang naar wintertijd komt dat uur twee keer voorbij; die nacht gaat hij twee keer af. Kies een tijd vóór 02:00 of ná 03:00 als dat een probleem is.":
    "Note: two nights a year this time does not exist, or happens twice. When summer time starts, the hour from 02:00 to 03:00 is skipped; that night this alarm does not go off. When summer time ends, that hour passes twice; that night it goes off twice. Choose a time before 02:00 or after 03:00 if that is a problem.",
  "Dit geluid stopt van zichzelf. Een los nummer is na een paar minuten voorbij; daarna is het stil. Kies een afspeellijst of een radiostation als de wekker moet blijven spelen tot je hem uitzet.":
    "This sound stops by itself. A single track is over after a few minutes; then it is quiet. Choose a playlist or a radio station if the alarm should keep playing until you turn it off.",
  "Zoeken duurt te lang. Probeer het opnieuw.": "Searching is taking too long. Try again.",
  "alles": "everything",
  "een naam": "a name",
  "een geldige tijd": "a valid time",
  "een speaker": "a speaker",
  "een geluid": "a sound",
  "een volume tussen 1 en 100": "a volume between 1 and 100",
  "De lijst met lampen is niet op te halen.": "The list of lights cannot be loaded.",
  "De lijst met speakers is niet op te halen.": "The list of speakers cannot be loaded.",
  "Het label '{label}' bestaat nog niet. De beheerder moet dat label aanmaken en op de lampen zetten die als wekker mogen dienen.":
    "The label '{label}' does not exist yet. The administrator has to create that label and put it on the lights that may be used for an alarm.",
  "Het label '{label}' bestaat nog niet. De beheerder moet dat label aanmaken en op de speakers zetten die als wekker mogen dienen.":
    "The label '{label}' does not exist yet. The administrator has to create that label and put it on the speakers that may be used for an alarm.",
  "De entiteiten met het label '{label}' zijn geen lampen.": "The entities with the label '{label}' are not lights.",
  "De gelabelde speakers zijn geen Music Assistant-speakers, of ze kunnen geen volume instellen.":
    "The labelled speakers are not Music Assistant speakers, or they cannot set a volume.",
  "Er zijn nog geen lampen met het label '{label}'.": "There are no lights with the label '{label}' yet.",
  "Er zijn nog geen speakers met het label '{label}'.": "There are no speakers with the label '{label}' yet.",

  // editor.js
  "Alles": "All",
  "Afspeellijsten": "Playlists",
  "Radio": "Radio",
  "Artiesten": "Artists",
  "Albums": "Albums",
  "Nummers": "Tracks",
  "Podcasts": "Podcasts",
  "Kies eerst een speaker en een geluid.": "Choose a speaker and a sound first.",
  "Het voorbeeld kon niet starten.": "The preview could not start.",
  "Zoeken is mislukt.": "Search failed.",
  "Er ontbreekt nog {wat}.": "Still missing: {wat}.",
  "Opslaan is mislukt.": "Saving failed.",
  "Niets gevonden.": "Nothing found.",
  "Wekker bewerken": "Edit alarm",
  "Nieuwe wekker": "New alarm",
  "Tijd": "Time",
  "Herhaling": "Repeat",
  "Geen dag aangevinkt: deze wekker gaat één keer af, de eerstvolgende keer dat die tijd voorbijkomt.":
    "No day ticked: this alarm goes off once, the next time that time comes round.",
  "Deze wekker herhaalt zich op de aangevinkte dagen.": "This alarm repeats on the ticked days.",
  "Naam": "Name",
  "Bijvoorbeeld: Werk": "For example: Work",
  "Speaker": "Speaker",
  "Kies een speaker…": "Choose a speaker…",
  "Zoek een speaker op naam": "Search for a speaker by name",
  "Geluid": "Sound",
  "Zoek media": "Search media",
  "Soort": "Type",
  "Zoeken": "Search",
  "Volume: {pct}%": "Volume: {pct}%",
  "Het niveau waar de wekker in twintig seconden naartoe groeit.": "The level the alarm builds up to in twenty seconds.",
  "Wake-up light (optioneel)": "Wake-up light (optional)",
  "Geen lamp": "No light",
  "Zoek een lamp op naam": "Search for a light by name",
  "Helderheid: {pct}%": "Brightness: {pct}%",
  "Voorbeeld stoppen": "Stop preview",
  "Voorbeeld": "Preview",
  "Opslaan": "Save",
};
