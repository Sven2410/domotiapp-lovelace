/** Het Engels van de mediakaart en het mediazoekscherm (sinds 0.82.0). */
export const MEDIA = {
  // media-card.js: de knoppen
  "Vorige": "Previous",
  "Afspelen of pauzeren": "Play or pause",
  "Stoppen": "Stop",
  "Volgende": "Next",
  "Willekeurig afspelen": "Shuffle",
  "Herhalen": "Repeat",
  "Herhalen: uit": "Repeat: off",
  "Herhalen: alles": "Repeat: all",
  "Herhalen: dit nummer": "Repeat: this track",
  "Zoeken in Music Assistant": "Search Music Assistant",
  "Sleeptimer": "Sleep timer",
  "{naam} afspelen of pauzeren": "Play or pause {naam}",
  "Speaker kiezen. Nu: {naam}": "Choose speaker. Now: {naam}",

  // media-card.js: volume en bron
  "Dempen": "Mute",
  "Zachter": "Quieter",
  "Harder": "Louder",
  "Volume": "Volume",
  "Gedempt": "Muted",
  "Bron": "Source",
  "Bron kiezen, nu {naam}": "Choose source, now {naam}",
  "Kies uit {n} bron": "Choose from {n} source",
  "Kies uit {n} bronnen": "Choose from {n} sources",

  // media-card.js: onvolledige config
  "Zet er een mediaspeler in, of wacht tot Home Assistant er een meldt.":
    "Add a media player, or wait until Home Assistant reports one.",
  "Kies een mediaspeler.": "Choose a media player.",

  // media-card.js: de editor
  "Mediaspeler": "Media player",
  "Naam (overschrijft die van de speler)": "Name (overrides the player's name)",
  "Algemene mediaspeler": "General media player",
  "Welke speakers je mag kiezen": "Speakers to choose from",
  "Vorm": "Layout",
  "Rij (één rasterrij hoog)": "Row (one grid row high)",
  "Groot (telefoonformaat, grote knoppen)": "Large (phone size, big buttons)",
  "Geluid van (optioneel)": "Sound from (optional)",
  "Albumhoes tonen": "Show album art",
  "Knoppen tonen": "Show buttons",
  "Volume tonen": "Show volume",
  "Bronknop tonen": "Show source button",
  "Doorspelen na een nummer": "Keep playing after a track",
  "Speakers om mee te groeperen": "Speakers to group with",
  "Zoeken en groeperen tonen": "Show search and grouping",
  "Sleeptimer tonen": "Show sleep timer",
  "Tikken op de kaart": "Tap on the card",
  "Vasthouden op de kaart": "Hold on the card",
  "Welke knoppen er verschijnen leest de kaart uit de speler zelf: wat hij niet kan, komt er niet op.":
    "The card reads which buttons to show from the player itself: what it can't do won't appear.",
  "De kaart krijgt er een balk bij waarmee je kiest waar de muziek heen gaat. De speler hierboven is de standaard; de keuze wordt per apparaat onthouden, dus je telefoon en de tablet in de gang kunnen op iets anders staan.":
    "The card gets a bar for choosing where the music goes. The player above is the default; the choice is remembered per device, so your phone and the tablet in the hall can be set to something different.",
  "Laat je dit leeg, dan staan de speakers van Music Assistant in de lijst -- geen televisies of streamers, want daar stuur je geen muziek naartoe. Vul je er zelf een paar in, dan is dat de lijst, wat er ook in staat.":
    "Leave empty: the list shows the Music Assistant speakers, not televisions or streamers, as you don't send music there. Fill in a few yourself and that is the list, whatever is in it.",
  "Groot is bedoeld voor een pop-up of een kolom waar de kaart alle ruimte krijgt: grote hoes, grote knoppen.":
    "Large is meant for a pop-up or a column where the card gets all the space: big cover, big buttons.",
  "Zit het geluid ergens anders dan het beeld — een tv met een soundbar eronder — kies dan hier de speler die het volume regelt. Leeg laten betekent: de speler zelf.":
    "If the sound comes from somewhere other than the picture, such as a TV with a soundbar, choose the player that controls the volume here. Leave empty: the player itself.",
  "Speelt er iets met een hoes, dan vult die de chip. Een eigen icoon gaat voor.":
    "When something with a cover is playing, it fills the chip. Your own icon comes first.",
  "De volumeregel verschijnt zodra er iets speelt en verdwijnt als de speler uit gaat.":
    "The volume row appears as soon as something plays and disappears when the player turns off.",
  "Zet er een knop bij waarmee je instelt hoe lang de muziek nog mag doorspelen. De laatste seconden zakt het volume weg, daarna pauzeert de speler en gaat het volume terug naar waar het stond. De timer loopt in Home Assistant zelf, dus hij telt gewoon door als je je telefoon weglegt.":
    "Adds a button to set how long the music keeps playing. In the last seconds the volume fades out, then the player pauses and the volume returns to where it was. The timer runs in Home Assistant itself, so it keeps counting when you put your phone away.",
  "De speakers die onderin het zoekscherm staan om samen te laten spelen. Laat je dit leeg op een algemene mediaspeler, dan zijn dat dezelfde speakers als in de keuzelijst; op een gewone kaart valt hij terug op het label \"Music Assistant Media\" in Home Assistant.":
    "The speakers at the bottom of the search screen, to play together. Leave empty on a general media player and they are the same speakers as in the list; on a regular card it falls back to the label \"Music Assistant Media\" in Home Assistant.",
  "Zoals Spotify: is het gekozen nummer klaar, dan zoekt Music Assistant er zelf muziek bij in plaats van te stoppen. Staat dit uit, dan kan het nog steeds per keer via het menu bij een treffer.":
    "Like Spotify: when the chosen track ends, Music Assistant finds more music itself instead of stopping. When this is off, you can still do it each time from the menu on a result.",
  "Voor een tv-ontvanger of een versterker met ingangen: een knop met de zender die nu aanstaat, die een zoekbaar overzicht opent. Kan de speler geen bron kiezen, dan verschijnt hij niet.":
    "For a TV box or an amplifier with inputs: a button showing the current channel, which opens a searchable list. If the player can't select a source, it doesn't appear.",
  "De zoekknop opent Music Assistant over het hele scherm. Alleen bij een speler van Music Assistant; groeperen komt erbij als de speler dat aankan.":
    "The search button opens Music Assistant full screen. Only for a Music Assistant player; grouping is added when the player supports it.",

  // media-card.js: de kaartkiezer
  "DomotiApp Mediaspeler": "DomotiApp Media player",
  "Wat er speelt, de knoppen die de speler aankan, en het volume.":
    "What's playing, the buttons the player supports, and the volume.",

  // media-logica.js
  "Stand-by": "Standby",

  // bibliotheek.js en zoekscherm.js: soorten
  "Alles": "All",
  "Nummer": "Track",
  "Nummers": "Tracks",
  "Album": "Album",
  "Albums": "Albums",
  "Artiest": "Artist",
  "Artiesten": "Artists",
  "Afspeellijst": "Playlist",
  "Afspeellijsten": "Playlists",
  "Radio": "Radio",
  "Radiozender": "Radio station",
  "Podcast": "Podcast",
  "Luisterboek": "Audiobook",
  "Dit item kan niet favoriet gemaakt worden.": "This item can't be made a favourite.",

  // zoekscherm.js
  "Sluiten": "Close",
  "Zoeken": "Search",
  "Favorieten": "Favourites",
  "Terug": "Back",
  "Deze afspeellijst verwijderen": "Remove this playlist",
  "Nieuwe afspeellijst": "New playlist",
  "Naam van de afspeellijst": "Playlist name",
  "Naam van de nieuwe afspeellijst": "Name of the new playlist",
  "Maken": "Create",
  "Zoeken naar een nummer, album, artiest of afspeellijst": "Search for a track, album, artist or playlist",
  "Speelt af op": "Playing on",
  "Zoek in Music Assistant": "Search Music Assistant",
  "Typ een naam en kies uit alles wat je bibliotheek en je providers kennen: nummers, albums, artiesten, afspeellijsten en radio.":
    "Type a name and choose from everything your library and providers know: tracks, albums, artists, playlists and radio.",
  "Typ een naam en kies uit alles wat je bibliotheek en je providers kennen.":
    "Type a name and choose from everything your library and providers know.",
  "Zoeken…": "Searching…",
  "Home Assistant start nog op": "Home Assistant is still starting",
  "Zodra DomotiApp klaar is met opstarten, wordt er vanzelf gezocht.":
    "As soon as DomotiApp has finished starting, the search runs by itself.",
  "Zoeken lukte niet": "Search failed",
  "Music Assistant gaf geen antwoord.": "Music Assistant didn't respond.",
  "Ophalen…": "Loading…",
  "Ophalen lukte niet": "Loading failed",
  "Je favorieten uit Music Assistant.": "Your favourites from Music Assistant.",
  "Nog geen favorieten": "No favourites yet",
  "Zoek iets op en tik op het hartje om het hier te zetten.": "Search for something and tap the heart to add it here.",
  "Dat lukte niet": "That didn't work",
  "Je afspeellijsten uit Music Assistant.": "Your playlists from Music Assistant.",
  "Nog geen afspeellijsten": "No playlists yet",
  "Maak er een met de knop hierboven.": "Create one with the button above.",
  "Deze lijst is leeg": "This playlist is empty",
  "Zoek iets op en kies 'Aan afspeellijst toevoegen'.": "Search for something and choose 'Add to playlist'.",
  "Maken lukte niet": "Creating failed",
  "Afspeellijst verwijderen?": "Remove playlist?",
  "\"{naam}\" wordt uit Music Assistant gehaald. De nummers zelf blijven gewoon in je bibliotheek staan.":
    "\"{naam}\" will be removed from Music Assistant. The tracks themselves stay in your library.",
  "Verwijderen": "Remove",
  "\"{naam}\" verwijderd": "\"{naam}\" removed",
  "Verwijderen lukte niet": "Removing failed",
  "\"{naam}\" uit de lijst gehaald": "\"{naam}\" removed from the playlist",
  "Aan welke lijst?": "Which playlist?",
  "Geen bewerkbare lijst. Maak er eerst een.": "No editable playlist. Create one first.",
  "\"{naam}\" toegevoegd aan \"{lijst}\"": "\"{naam}\" added to \"{lijst}\"",
  "Toevoegen lukte niet": "Adding failed",
  "Niets gevonden": "Nothing found",
  "Probeer een andere naam of een ander soort.": "Try a different name or type.",
  "Favoriet": "Favourite",
  "Uit deze afspeellijst halen": "Remove from this playlist",
  "Meer met {naam}": "More for {naam}",
  "Nu afspelen": "Play now",
  "Afspelen en doorgaan": "Play and keep going",
  "Hierna afspelen": "Play next",
  "Achteraan in de wachtrij": "Add to end of queue",
  "Uit favorieten": "Remove from favourites",
  "Favoriet maken": "Add to favourites",
  "Aan afspeellijst toevoegen": "Add to playlist",
  "Afspeellijst verwijderen": "Remove playlist",
  "Plak het label <b>{label}</b> op je speakers om ze hier samen te laten spelen.":
    "Put the label <b>{label}</b> on your speakers to play them together here.",
  "Deze speler": "This player",
  "Laat deze speaker meespelen": "Let this speaker join in",
  "Deze speaker laat zich niet koppelen": "This speaker can't be grouped",
  "geen volumeregeling": "no volume control",
  "Volume {naam}": "Volume {naam}",
  "gedempt": "muted",

  // bronkiezer.js
  "Zoek een zender of app": "Search for a channel or app",
  "Bron kiezen": "Choose source",
  "Nu: {naam}": "Now: {naam}",
  "{n} van {totaal}": "{n} of {totaal}",
  "{n} bron": "{n} source",
  "{n} bronnen": "{n} sources",
  "Niets gevonden.": "Nothing found.",
  "NU": "NOW",

  // sleeptimer.js
  "Of typ het zelf": "Or type it yourself",
  "Minuten": "Minutes",
  "minuten": "minutes",
  "Uitfaden aan het eind": "Fade out at the end",
  "Seconden uitfaden": "Seconds to fade out",
  "seconden": "seconds",
  "Timer stoppen": "Stop timer",
  "Starten": "Start",
  "Opnieuw instellen": "Set again",
  "De laatste {n} seconden zakt het volume weg, daarna pauzeert de muziek en gaat het volume terug.":
    "In the last {n} seconds the volume fades out, then the music pauses and the volume returns.",
  "Aan het eind pauzeert de muziek.": "At the end the music pauses.",
  "Vul een heel aantal minuten in, tussen 1 en 720.": "Enter a whole number of minutes, between 1 and 720.",
  "De sleeptimer kon niet gezet worden. Is DomotiApp Lovelace klaar met opstarten?":
    "The sleep timer couldn't be set. Has DomotiApp Lovelace finished starting?",

  // spelerkiezer.js
  "Speaker kiezen": "Choose speaker",
  "Zoek een speaker": "Search for a speaker",
  "{wat} · speelt mee": "{wat} · joined",
  "Laat deze speaker niet meer meespelen": "Stop this speaker playing along",
  "Speelt mee — tik om los te koppelen": "Playing along, tap to ungroup",
  "Laat meespelen met wat er nu speelt": "Play along with what's playing now",
  "MEE": "IN",
  "ERBIJ": "ADD",
  "{n} speaker": "{n} speaker",
  "{n} speakers": "{n} speakers",
};
