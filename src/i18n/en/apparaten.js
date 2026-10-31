/**
 * Het Engels van airco, robotstofzuiger en warmtepompboiler (sinds 0.83.0).
 *
 * De standen staan zo dicht mogelijk bij het Engels van Home Assistant voor die
 * integratie: MELCloud en de climate van Home Assistant voor de airco, Dreame
 * (`dreame_vacuum`) voor de stofzuiger. De zinnen van de coach bij de airco
 * volgen het paneel van DomotiApp Coach ("Running on solar").
 */
export const APPARATEN = {
  // airco-logica.js: standen en wat hij doet
  "Verwarmt voor": "Preheating",
  "Warm/koud": "Heat/Cool",

  // airco-logica.js: ventilator
  "Midden-laag": "Medium low",
  "Midden-hoog": "Medium high",
  "Krachtig": "Powerful",
  "Sterk": "Strong",
  "Diffuus": "Diffuse",
  "Gericht": "Focus",
  "Auto laag": "Auto low",
  "Auto hoog": "Auto high",

  // airco-logica.js: lamellen
  "Lamellen": "Vanes",
  "Zwaaien": "Swing",
  "Vast": "Fixed",
  "Beide": "Both",
  "Op en neer": "Vertical",
  "Opzij": "Horizontal",
  "Links-midden": "Left centre",
  "Rechts-midden": "Right centre",
  "Breed": "Wide",
  "Gespreid": "Split",
  "Boven": "Top",
  "Onder": "Bottom",
  "Midden-boven": "Upper middle",
  "Midden-onder": "Lower middle",
  "Activiteit": "Activity",
  "Basis": "Basic",
  "Weekprogramma": "Weekly schedule",
  "Tijdelijk": "Temporary",

  // airco-logica.js: tegels
  "Deze maand": "This month",
  "Dit jaar": "This year",
  "Verbruik": "Consumption",
  "Buiten": "Outdoor",

  // airco-logica.js: de coach
  "Aan op zon.": "Running on solar.",
  "Aan op een goedkoop uur.": "Running in a cheap hour.",
  "Op temperatuur.": "At temperature.",
  "Wacht op zon.": "Waiting for solar.",
  "Zelf bediend.": "Controlled by you.",
  "Zelf bediend. De coach doet weer mee vanaf {klok}.": "Controlled by you. The coach takes over again from {klok}.",
  "De coach is gepauzeerd.": "The coach is paused.",
  "De coach mist een meting.": "The coach is missing a reading.",
  "Wacht op een goedkoop uur.": "Waiting for a cheap hour.",
  "Wacht op zon of een goedkoop uur.": "Waiting for solar or a cheap hour.",
  "middernacht": "midnight",
  "Goedkoop": "Cheap",
  "Zon over": "Spare solar",
  "Goedkope uren": "Cheap hours",
  "Zon en goedkope uren": "Solar and cheap hours",

  // airco-card.js
  "laag": "low",
  "hoog": "high",
  "Doeltemperatuur": "Target temperature",
  "Ondergrens": "Lower limit",
  "Bovengrens": "Upper limit",
  "{naam} lager": "{naam} down",
  "{naam} hoger": "{naam} up",
  "{naam} {graden} graden": "{naam} {graden} degrees",
  "Kies een airco (climate-entiteit).": "Choose an air conditioner (climate entity).",
  "binnen": "indoor",
  "storing": "fault",
  "Aanzetten": "Turn on",
  "Aan op": "Run on",
  "Aan op {wat}": "Run on {wat}",
  "Kamertemperatuur": "Room temperature",
  "Energieverbruik": "Energy consumption",
  "De climate-entiteit van de airco. Kamertemperatuur, vochtigheid, vermogen, energie en een storing van hetzelfde apparaat zoekt de kaart zelf. Stuurt DomotiApp Coach deze airco, dan vindt de kaart dat ook zelf: het doel gaat dan naar de coach, met Aan op en Pauze erbij.":
    "The climate entity of the air conditioner. The card finds room temperature, humidity, power, energy and a fault on the same device itself. If DomotiApp Coach controls this air conditioner, the card finds that too: the target then goes to the coach, with Run on and Pause added.",
  "Leeg laten: de naam van de airco in Home Assistant.": "Leave empty: the name of the air conditioner in Home Assistant.",
  "Automatisch toont een foto bij merk en model van de airco als die er is, en anders het icoon. Een tik op de foto of het icoon zet de airco aan of uit.":
    "Automatic shows a photo for the make and model of the air conditioner if there is one, and otherwise the icon. A tap on the photo or the icon turns the air conditioner on or off.",
  "Een externe temperatuursensor, voor elk merk airco. Die gaat voor wat de airco zelf meet, en is de enige bron bij een airco die geen kamertemperatuur doorgeeft. Leeg laten: wat de airco zelf meet.":
    "An external temperature sensor, for any brand of air conditioner. It takes priority over what the unit measures itself, and is the only source for a unit that reports no room temperature. Leave empty: what the unit measures itself.",
  "Leeg laten: de energiesensor van hetzelfde apparaat, als die er is.": "Leave empty: the energy sensor of the same device, if there is one.",
  "DomotiApp Airco": "DomotiApp Air Conditioner",
  "Een airco van elk merk: aan en uit, de stand, de doeltemperatuur, ventilator en lamellen, met kamertemperatuur en verbruik van hetzelfde apparaat. Met DomotiApp Coach ook op zon en goedkope uren.":
    "An air conditioner of any make: on and off, the mode, the target temperature, fan and vanes, with room temperature and consumption from the same device. With DomotiApp Coach also on solar and cheap hours.",

  // stofzuiger-logica.js: wat de robot doet (Dreame)
  "Zuigt": "Sweeping",
  "Dweilt": "Mopping",
  "Zuigt en dweilt": "Sweeping and mopping",
  "Terug naar het station": "Returning to dock",
  "Laadt op": "Charging",
  "Laadt slim op": "Smart charging",
  "Opgeladen": "Charged",
  "Droogt de dweilpads": "Drying the mop pads",
  "Wast de dweilpads": "Washing the mop pads",
  "Wassen gepauzeerd": "Washing paused",
  "Terug om de pads te wassen": "Returning to wash the pads",
  "Terug om de pads te plaatsen": "Returning to fit the pads",
  "Terug om de pads af te doen": "Returning to remove the pads",
  "Terug om te legen": "Returning to empty",
  "Leegt de stofbak": "Emptying the dust bin",
  "Vult water bij": "Adding water",
  "Controleert het water": "Checking the water",
  "Maakt een plattegrond": "Building a map",
  "Wordt bijgewerkt": "Updating",
  "Station wordt hersteld": "Resetting the station",
  "Op afstand bestuurd": "Remote control",
  "Tweede ronde": "Second pass",
  "Maakt een plek schoon": "Spot cleaning",
  "Komt eraan": "On its way",
  "Volgt iemand": "Following someone",
  "Snelkoppeling": "Shortcut",
  "Bewaakt": "Monitoring",
  "Bewaken gepauzeerd": "Monitoring paused",
  "Maakt schoon": "Cleaning",
  "In het station": "Docked",
  "Staat stil": "Idle",
  "{u} uur {m} min": "{u} h {m} min",
  "{n} dag": "{n} day",
  "{n} dagen": "{n} days",

  // stofzuiger-logica.js: bediening
  "Pauzeren": "Pause",
  "Hervatten": "Resume",
  "Naar station": "Return to dock",
  "Start {n} kamer": "Start {n} room",
  "Start {n} kamers": "Start {n} rooms",

  // stofzuiger-logica.js: keuzes
  "Routine": "Routine",
  "Grondig": "Deep",
  "Zuigen": "Sweeping",
  "Dweilen": "Mopping",
  "Zuigen en dweilen": "Sweeping and mopping",
  "Dweilen na zuigen": "Mopping after sweeping",
  "Allebei": "Both",
  "Na zuigen": "After sweeping",
  "Zuigkracht": "Suction",
  "Standaard": "Standard",
  "Iets droog": "Slightly dry",
  "Vochtig": "Moist",
  "Nat": "Wet",

  // stofzuiger-logica.js: station en onderhoud
  "Schoon water": "Clean water",
  "Vuil water": "Dirty water",
  "Stofzak": "Dust bag",
  "Niet geplaatst": "Not installed",
  "Bijna leeg": "Low",
  "Vol of weg": "Full or missing",
  "Controleren": "Check",
  "Op": "Empty",
  "Te weinig": "Too little",
  "In orde": "OK",
  "Reinigen": "Self-clean",
  "Leegzuigen": "Auto-empty",
  "Hoofdborstel": "Main brush",
  "Zijborstel": "Side brush",
  "Sensoren": "Sensors",

  // stofzuiger-logica.js en stofzuiger-card.js: de blokken
  "Kaart van het huis": "Map of the home",
  "Kamers": "Rooms",
  "Stand, zuigkracht, dweilen en CleanGenius": "Mode, suction, mopping and CleanGenius",
  "Station": "Station",
  "Onderhoud": "Maintenance",

  // stofzuiger-card.js
  "Kies een robotstofzuiger (vacuum-entiteit).": "Choose a robot vacuum (vacuum entity).",
  "Bediening": "Controls",
  "Wis keuze": "Clear selection",
  "storing: {fout}": "fault: {fout}",
  "laadt op": "charging",
  "accu": "battery",
  "CleanGenius kiest zelf de zuigkracht en hoe nat hij dweilt.": "CleanGenius chooses the suction and how wet it mops by itself.",
  "Robotstofzuiger": "Robot vacuum",
  "Verbergen": "Hide",
  "De vacuum-entiteit. Accu, status, storing, kamers, keuzes, station, onderhoud en de kaart van hetzelfde apparaat zoekt de kaart zelf.":
    "The vacuum entity. The card finds battery, status, fault, rooms, options, station, maintenance and the map on the same device itself.",
  "Automatisch toont de productfoto als het type bekend is, en anders het icoon. Een tik op de foto of het icoon doet wat de eerste knop doet: starten, pauzeren of hervatten.":
    "Automatic shows the product photo if the type is known, and otherwise the icon. A tap on the photo or the icon does what the first button does: start, pause or resume.",
  "Leeg laten: de live kaart van dezelfde stofzuiger.": "Leave empty: the live map of the same vacuum.",
  "Vink aan wat niet op de kaart hoeft. Een blok waar niets voor gevonden is, staat er sowieso niet.":
    "Tick what does not need to be on the card. A block for which nothing was found is not shown anyway.",
  "DomotiApp Robotstofzuiger": "DomotiApp Robot Vacuum",
  "Een robotstofzuiger met zijn station: starten per kamer, schoonmaken en zuigkracht, de kaart van het huis, het station en het onderhoud. Met een productfoto per merk en type.":
    "A robot vacuum with its station: start per room, cleaning and suction, the map of the home, the station and maintenance. With a product photo per brand and type.",

  // boiler-logica.js
  "Zuinig: alleen de warmtepomp.": "Economical: only the heat pump.",
  "Kiest zelf tussen de warmtepomp en het element.": "Chooses between the heat pump and the element by itself.",
  "Snel: de warmtepomp en het element samen.": "Fast: the heat pump and the element together.",
  "Houdt het water warm op een laag pitje.": "Keeps the water warm on a low setting.",

  // boiler-card.js
  "Kies een boiler (water_heater-entiteit).": "Choose a water heater (water_heater entity).",
  "water": "water",
  "water {graden} graden": "water {graden} degrees",
  "Temperatuur lager": "Temperature down",
  "Temperatuur hoger": "Temperature up",
  "Afgelopen 24 uur": "Last 24 hours",
  "Nog geen metingen": "No readings yet",
  "{min}° tot {max}°": "{min}° to {max}°",
  "Watertemperatuur van de afgelopen 24 uur: laagste {min} graden, hoogste {max} graden, nu {nu} graden":
    "Water temperature over the last 24 hours: lowest {min} degrees, highest {max} degrees, now {nu} degrees",
  "Watertemperatuur van de afgelopen 24 uur: nog geen metingen": "Water temperature over the last 24 hours: no readings yet",
  "Grafiek van de afgelopen 24 uur": "Graph of the last 24 hours",
  "De water_heater van de warmtepompboiler. De temperatuursensor van hetzelfde apparaat zoekt de kaart zelf.":
    "The water_heater of the heat pump water heater. The card finds the temperature sensor on the same device itself.",
  "Leeg laten: de naam van het apparaat. Heet dat alleen \"Water Heater\", dan staat er Boiler.":
    "Leave empty: the name of the device. If that is just \"Water Heater\", the card says Water heater.",
  "Leeg laten: de temperatuursensor van de boiler zelf. Die staat ook in de grafiek.":
    "Leave empty: the temperature sensor of the water heater itself. It is also shown in the graph.",
  "DomotiApp Warmtepompboiler": "DomotiApp Heat Pump Water Heater",
  "De warmtepompboiler voor het tapwater: de watertemperatuur, het doel, de stand (Warmtepomp, Auto, Turbo, Vakantie) en een grafiek van de afgelopen 24 uur.":
    "The heat pump water heater for hot tap water: the water temperature, the target, the mode (Heat pump, Auto, Turbo, Holiday) and a graph of the last 24 hours.",
};
