/** Het Engels van de entiteitenkaart en haar editor (sinds 0.82.0). */
export const ENTITEITEN = {
  // entities-card.js
  "DomotiApp Entiteiten": "DomotiApp Entities",
  "Entiteiten in rijen, elk met een eigen kolomindeling en vorm: regel, tegel of compacte pil. Ook voor een losse knop.":
    "Entities in rows, each with its own columns and shape: row, tile or compact pill. Also for a single button.",
  "Voeg een rij toe en kies daar entiteiten in.": "Add a row and choose entities in it.",
  "{naam} schakelen": "Toggle {naam}",
  "{naam} aan of uit": "{naam} on or off",
  "{naam} instellen": "Set {naam}",
  "{naam} kiezen": "Choose {naam}",
  "Icoon": "Icon",

  // toggle.js
  "Aan of uit": "On or off",

  // entities-editor.js: de kaart
  "Naam van de kaart (optioneel)": "Card name (optional)",
  "Waar het kaartvlak zit": "Card background",
  "Waar de status staat": "Where the state goes",
  "Om de hele kaart": "Around the whole card",
  "Alleen een rand, geen vulling": "Border only, no fill",
  "Geen vlak": "No background",
  "Onder de naam": "Below the name",
  "Rechts op de regel": "On the right of the row",
  "Een kop boven de entiteiten. Laat leeg voor geen kop -- de kaart is dan een rasterrij lager.":
    "A heading above the entities. Leave empty for no heading; the card is then one grid row shorter.",
  "Alleen een rand geeft een doorzichtige kaart die nog wel een vorm heeft; geen vlak laat de plekken los op het dashboard staan.":
    "Border only gives a transparent card that still has a shape; no background leaves the items loose on the dashboard.",
  "Rechts is de vorm van de entiteitenkaart van Home Assistant: de waarden komen onder elkaar uit. Regels met een schakelaar of een tijdveld tonen geen tekst, en op een tegel staat de status altijd onder de naam.":
    "Right is the layout of the Home Assistant entities card: the values line up below each other. Rows with a switch or a time field show no text, and on a tile the state is always below the name.",

  // entities-editor.js: rijen
  "Een rij is een regel op de kaart, met een, twee of drie entiteiten naast elkaar. Elke rij heeft zijn eigen indeling en zijn eigen vorm. Een rij van een kolom is een losse knop.":
    "A row is a line on the card, with one, two or three entities side by side. Each row has its own columns and its own shape. A row of one column is a single button.",
  "Rij toevoegen": "Add row",
  "Rij {n}": "Row {n}",
  "{n} entiteit in deze rij": "{n} entity in this row",
  "{n} entiteiten in deze rij": "{n} entities in this row",
  "Rij dupliceren": "Duplicate row",
  "Rij verwijderen": "Remove row",
  "Vorm van deze rij": "Shape of this row",
  "Rij": "Row",
  "Tegel": "Tile",
  "Compact": "Compact",
  "Beeld": "Picture",
  "Uitlijning": "Alignment",
  "Links": "Left",
  "Midden": "Centre",
  "Grootte van de afbeelding": "Image size",
  "In pixels. Groot genoeg om een QR-code te scannen begint rond de 160.":
    "In pixels. Large enough to scan a QR code starts at about 160.",
  "Kop boven kolom {n}": "Heading above column {n}",
  "Laat leeg voor geen koppen. Handig als er twee dingen naast elkaar staan die allebei een naam verdienen.":
    "Leave empty for no headings. Useful when two things side by side both deserve a name.",
  "{n} kolom": "{n} column",
  "{n} kolommen": "{n} columns",
  "nog leeg": "still empty",
  "met kolomkoppen": "with column headings",

  // entities-editor.js: plekken
  "Knop": "Button",
  "Plek {n} in de rij": "Place {n} in the row",
  "Deze plek leegmaken": "Clear this place",
  "Kies een entiteit": "Choose an entity",
  "Zonder entiteit: een navigatieknop": "Without entity: a navigation button",
  "Entiteit": "Entity",
  "Mag leeg blijven: zonder entiteit wordt dit een navigatieknop. Geef hem dan een naam, een icoon en een tikactie.":
    "May stay empty: without an entity this becomes a navigation button. Then give it a name, an icon and a tap action.",
  "Naam (overschrijft die van de entiteit)": "Name (overrides the entity's)",
  "Schakelaar tonen": "Show switch",
  "Icoon tonen": "Show icon",
  "Naam tonen": "Show name",
  "Status tonen": "Show state",
  "Tikken op het icoon": "Tap on the icon",
  "Vasthouden op het icoon": "Hold on the icon",
  "Tikken op de regel": "Tap on the row",
  "Vasthouden op de regel": "Hold on the row",
  "Dubbeltikken op de regel": "Double tap on the row",
  "Het icoon en de regel zijn twee knoppen: het icoon schakelt, de regel opent of navigeert.":
    "The icon and the row are two buttons: the icon toggles, the row opens or navigates.",
  "Een schuifschakelaar in plaats van de statustekst. Alleen voor wat twee standen heeft: een lamp, een stopcontact, een schakelaar.":
    "A toggle switch instead of the state text. Only for things with two positions: a light, a socket, a switch.",
  "Een tijd of datum -- een input_datetime, of een klok van een apparaat -- verschijnt hier als een veld dat je meteen kunt zetten. Uit haalt met de tekst ook dat veld weg.":
    "A time or date (an input_datetime, or a clock of a device) appears here as a field you can set straight away. Off removes that field along with the text.",
  "Laat dit op geen actie staan als je het niet gebruikt: een regel die op dubbeltikken wacht, reageert trager op een gewone tik.":
    "Leave this on no action if you don't use it: a row that waits for a double tap responds more slowly to a single tap.",
};
