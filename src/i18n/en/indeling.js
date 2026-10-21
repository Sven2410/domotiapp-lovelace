/** Het Engels van kopkaart, navbalk, tabbladen, separator en terugknop (sinds 0.82.0). */
export const INDELING = {
  // header-card.js: de begroeting en de weerdetails
  "Goedenacht": "Good night",
  "Goedemorgen": "Good morning",
  "Goedemiddag": "Good afternoon",
  "Goedenavond": "Good evening",
  "Wind": "Wind",
  "UV-index": "UV index",
  "Neerslag": "Precipitation",
  "Luchtdruk": "Pressure",
  "Zonsopkomst": "Sunrise",
  "Zonsondergang": "Sunset",
  "N": "N",
  "NO": "NE",
  "O": "E",
  "ZO": "SE",
  "Z": "S",
  "ZW": "SW",
  "W": "W",
  "NW": "NW",

  // header-card.js: de editor
  "Weer (temperatuur, wind)": "Weather (temperature, wind)",
  "Tweede weerbron (UV-index)": "Second weather source (UV index)",
  "Neerslagsensor": "Precipitation sensor",
  "Accentlijn tonen": "Show accent line",
  "Verbergen onder breedte (px)": "Hide below width (px)",
  "Alleen voor de UV-index. Handig als je hoofdbron die niet meelevert.":
    "Only for the UV index. Useful if your main source does not provide it.",
  "Een sensor in mm of mm/h, bijvoorbeeld neerslagintensiteit of regen laatste uur.":
    "A sensor in mm or mm/h, for example precipitation intensity or rain in the last hour.",
  "768 verbergt de header op telefoons en houdt hem op tablets en desktops. 0 zet het uit.":
    "768 hides the header on phones and keeps it on tablets and desktops. 0 turns this off.",
  "Leeg laten voor de naam van de ingelogde gebruiker.": "Leave empty for the name of the logged-in user.",
  "DomotiApp Header": "DomotiApp Header",
  "Smalle strip met begroeting, weer en klok. Verbergt zichzelf op telefoons.":
    "Slim strip with greeting, weather and clock. Hides itself on phones.",

  // navbar-card.js
  "Voeg knoppen toe in de editor: een naam, een icoon en waar hij heen gaat.":
    "Add buttons in the editor: a name, an icon and where it goes.",
  "Licht": "Lights",
  "Media": "Media",
  "DomotiApp Navbalk": "DomotiApp Navbar",
  "Vaste navigatiebalk onderaan het scherm, met een meer-menu voor wat er in de breedte niet bij past. 2 tot 6 knoppen in de balk.":
    "Fixed navigation bar at the bottom of the screen, with a more menu for what does not fit. 2 to 6 buttons in the bar.",

  // navbar-logica.js: de kant-en-klare subknoppen
  "Opent domotitech.nl in een nieuw tabblad, met het logo erop.": "Opens domotitech.nl in a new tab, with the logo on it.",
  "Herstart Home Assistant": "Restart Home Assistant",
  "Roept homeassistant.restart aan, met een bevestiging ervoor.": "Calls homeassistant.restart, with a confirmation first.",
  "Herstart": "Restart",
  "Weet je het zeker?": "Are you sure?",
  "Weet je het zeker dat je Home Assistant wilt herstarten?": "Are you sure you want to restart Home Assistant?",

  // navbar-editor.js
  "Achter de meer-knop": "Behind the more button",
  "Elke knop heeft een naam, een icoon en een pad -- bijvoorbeeld /lovelace/keuken voor een view op dit dashboard, of #keuken voor een pop-up. Wat er niet meer in de balk past valt vanzelf achter de meer-knop rechts.":
    "Each button has a name, an icon and a path, for example /lovelace/kitchen for a view on this dashboard, or #kitchen for a pop-up. Whatever no longer fits in the bar moves behind the more button on the right.",
  "Knop toevoegen": "Add button",
  "Knoppen in de balk": "Buttons in the bar",
  "Namen onder de iconen": "Names below the icons",
  "De meer-knop telt zelf mee. Staan er meer knoppen dan dit, dan komen de eerste {n} in de balk en valt de rest achter \"Meer\".":
    "The more button counts as one. With more buttons than this, the first {n} go in the bar and the rest go behind \"More\".",
  "Uit geeft een rij kale iconen. Dan passen er meer naast elkaar op een telefoon.":
    "Off gives a row of plain icons. More of them then fit side by side on a phone.",
  "Haalt de pil onder de balk weg: alleen de iconen blijven over, zwevend boven het dashboard.":
    "Removes the pill under the bar: only the icons remain, floating above the dashboard.",
  "Nieuwe knop": "New button",
  "Zonder naam": "No name",
  "{icoon} -- nog geen pad": "{icoon}, no path yet",
  "Nog geen pad": "No path yet",
  "Omhoog": "Move up",
  "Omlaag": "Move down",
  "Verwijderen": "Remove",
  "Waar gaat hij heen": "Where does it go",
  "/lovelace/keuken voor een view, #keuken voor een pop-up van bubble-card, of een https-adres voor iets buiten Home Assistant.":
    "/lovelace/kitchen for a view, #kitchen for a bubble-card pop-up, or an https address for something outside Home Assistant.",
  "Deze knop heeft subknoppen en klapt dus open in plaats van ergens heen te gaan; zijn eigen pad wordt niet gebruikt.":
    "This button has sub-buttons, so it opens a menu instead of going somewhere; its own path is not used.",
  "Subknoppen": "Sub-buttons",
  "Hangt hier iets onder, dan klapt deze knop een menu open BOVEN zichzelf in plaats van ergens heen te gaan. Valt de knop zelf achter de meer-knop, dan staan zijn subknoppen daar ingesprongen onder hem.":
    "If anything is listed here, this button opens a menu ABOVE itself instead of going somewhere. If the button itself is behind the more button, its sub-buttons are indented below it there.",
  "Subknop toevoegen": "Add sub-button",
  "Lege subknop": "Empty sub-button",
  "Zelf een naam, een icoon en een pad invullen.": "Fill in a name, an icon and a path yourself.",
  "Nieuwe subknop": "New sub-button",
  "Roept {actie} aan": "Calls {actie}",
  "Deze knop voert een actie uit ({actie}) en gaat dus nergens heen. Weg met de knop rechtsboven.":
    "This button performs an action ({actie}), so it does not go anywhere. Remove it with the button at the top right.",
  "Menu met {n} knop": "Menu with {n} button",
  "Menu met {n} knoppen": "Menu with {n} buttons",

  // tabs-card.js
  "Voeg tabbladen toe: elk met een naam, een icoon en een kaart erin.":
    "Add tabs: each with a name, an icon and a card inside.",
  "Tab {n}": "Tab {n}",
  "Deze tab heeft nog geen kaart.": "This tab has no card yet.",
  "Deze kaart kon niet geladen worden: {fout}": "This card could not be loaded: {fout}",
  "Kaart toevoegen": "Add card",
  "Woning": "Home",
  "Weer": "Weather",
  "DomotiApp Tabbladen": "DomotiApp Tabs",
  "Meerdere kaarten achter tabbladen, met een rij knoppen erboven. De gekozen tab wordt per apparaat onthouden.":
    "Several cards behind tabs, with a row of buttons above them. The chosen tab is remembered per device.",

  // tabs-editor.js
  "een kaart": "a card",
  "Nog geen kaart": "No card yet",
  "Tabblad toevoegen": "Add tab",
  "Verdeeld over de breedte": "Spread across the width",
  "Rechts": "Right",
  "Welk tabblad staat open op een nieuw apparaat": "Which tab is open on a new device",
  "Uitlijning van de rij": "Alignment of the row",
  "Namen naast de iconen": "Names next to the icons",
  "Telt vanaf 1. Dit geldt alleen zolang een apparaat nog niets gekozen heeft — daarna onthoudt elk apparaat zijn eigen tabblad, en dat van je telefoon staat los van dat van de tablet.":
    "Counts from 1. This only applies until a device has chosen something; after that each device remembers its own tab, and your phone's is separate from the tablet's.",
  "Haalt het vlak onder de kaart weg. De rij tabbladen houdt zijn eigen pil.":
    "Removes the surface under the card. The row of tabs keeps its own pill.",
  "Tabblad {n}": "Tab {n}",
  "Deze naam bepaalt ook onder welke sleutel een apparaat zijn keuze onthoudt. Hernoem je hem, dan begint elk apparaat één keer opnieuw bij het eerste tabblad.":
    "This name also sets the key under which a device remembers its choice. If you rename it, each device starts again once at the first tab.",
  "Inhoud: <b>{inhoud}</b> — aan te passen via Code-editor weergeven.":
    "Content: <b>{inhoud}</b>. Change it with Show code editor.",
  "<b>{inhoud}</b> — te bewerken in het voorbeeld hiernaast: slepen om te verplaatsen, het potlood om te bewerken.":
    "<b>{inhoud}</b>. Edit it in the preview alongside: drag to move, the pencil to edit.",
  "Nog geen kaart — voeg er een toe in het voorbeeld hiernaast.": "No card yet. Add one in the preview alongside.",
  "Kaart": "Card",
  "Configuratie": "Config",
  "Zichtbaarheid": "Visibility",
  "Indeling": "Layout",
  "Zoek een kaart...": "Search for a card...",
  "Niets gevonden. Kies iets anders, of gebruik de code-editor.": "Nothing found. Choose something else, or use the code editor.",
  "{n} kaart": "{n} card",
  "{n} kaarten": "{n} cards",

  // separator-card.js
  "Nieuwe sectie": "New section",
  "Icoon links": "Icon on the left",
  "Icoon bij de waarde rechts": "Icon next to the value on the right",
  "Lijn tonen": "Show line",
  "Waarde rechts (optioneel)": "Value on the right (optional)",
  "Toont de status van deze entiteit rechts van de lijn, bijvoorbeeld een temperatuur of een aantal.":
    "Shows the state of this entity to the right of the line, for example a temperature or a count.",
  "DomotiApp Separator": "DomotiApp Separator",
  "Sectiekop met icoon en vervagende lijn.": "Section heading with an icon and a fading line.",

  // terug-card.js, terug-badge.js, terug-logica.js
  "Terug": "Back",
  "Naar {pad}": "To {pad}",
  "Tekst ernaast (optioneel)": "Text next to it (optional)",
  "Het pad waar je altijd op uitkomt, bijvoorbeeld /dashboard/thuis. Begint het met een # dan opent hij een pop-up op de huidige view. Laat je het leeg, dan gaat hij één stap terug in de geschiedenis — net als de terugknop van je browser.":
    "The path you always end up on, for example /dashboard/home. If it starts with a #, it opens a pop-up on the current view. If you leave it empty, it goes one step back in the history, just like the back button of your browser.",
  "Laat leeg voor alleen het pijltje. Dat is meestal genoeg en het scheelt breedte.":
    "Leave empty for just the arrow. That is usually enough and it saves width.",
  "Laat leeg voor alleen het pijltje. Dat is meestal genoeg en het scheelt breedte in de kop.":
    "Leave empty for just the arrow. That is usually enough and it saves width in the header.",
  "Waar de knop binnen de kaart staat. De kaart zelf is doorzichtig.":
    "Where the button sits within the card. The card itself is transparent.",
  "Haalt de pil helemaal weg: geen vulling, geen rand en geen binnenmarge. Dan staat er alleen nog een pijltje met tekst.":
    "Removes the pill completely: no fill, no border and no padding. Only an arrow with text remains.",
  "DomotiApp Terug": "DomotiApp Back",
  "Een terugknop die je overal kunt neerzetten, ook in een pop-up: naar een vaste plek die je zelf opgeeft, of één stap terug als je niets invult.":
    "A back button you can place anywhere, including in a pop-up: to a fixed place you choose, or one step back if you leave it empty.",
  "Een pijltje terug in de kop van je view: naar een vaste plek die je zelf opgeeft, of één stap terug als je niets invult.":
    "A back arrow in the header of your view: to a fixed place you choose, or one step back if you leave it empty.",
};
