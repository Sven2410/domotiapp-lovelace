/** Het Engels van de klimaatkaart, de rolluikkaart en de HVAC-kaart (sinds 0.82.0). */
export const KLIMAAT = {
  // climate-card.js
  "DomotiApp Klimaat": "DomotiApp Climate",
  "Thermostaat, losse temperatuur- en vochtsensor, of allebei.": "Thermostat, separate temperature and humidity sensor, or both.",
  "Kies een thermostaat, of een temperatuursensor.": "Choose a thermostat, or a temperature sensor.",
  "Meer info": "More info",
  "Vochtigheid": "Humidity",
  "Lager": "Lower",
  "Hoger": "Higher",
  "Ontvochtigt": "Drying",
  "Rij (één rasterrij hoog)": "Row (one grid row high)",
  "Onder elkaar (past op een telefoon)": "Stacked (fits on a phone)",
  "Thermostaat (optioneel)": "Thermostat (optional)",
  "Temperatuursensor (optioneel)": "Temperature sensor (optional)",
  "Vochtigheidssensor (optioneel)": "Humidity sensor (optional)",
  "Vorm": "Layout",
  "Stap van de knoppen": "Button step",
  "Leeg laten voor een kaart die alleen meet. Met thermostaat komen de stelknoppen erbij.":
    "Leave empty for a card that only measures. With a thermostat, the set buttons are added.",
  "Wint van de meting van de thermostaat zelf. Handig als er een betere sensor in de kamer hangt.":
    "Takes precedence over the thermostat's own reading. Useful when there is a better sensor in the room.",
  "Onder elkaar zet de metingen als twee tegels neer met de stelknop over de volle breedte eronder. Bedoeld voor een smalle kolom of een pop-up, waar de rij-vorm de naam en de meting samendrukt.":
    "Stacked shows the readings as two tiles with the set buttons across the full width below. Meant for a narrow column or a pop-up, where the row layout squeezes the name and the reading.",
  "Leeg laten volgt de thermostaat, en anders een halve graad.": "Leave empty to follow the thermostat, otherwise half a degree.",

  // cover-card.js en cover-logica.js
  "DomotiApp Rolluiken": "DomotiApp Shutters",
  "Open, stop en dicht, met een eigen icoon voor open en dicht.": "Open, stop and close, with an icon of your own for open and closed.",
  "Kies minstens één rolluik of zonnescherm.": "Choose at least one shutter or awning.",
  "Openen": "Open",
  "Sluiten": "Close",
  "Gaat open": "Opening",
  "Gaat dicht": "Closing",
  "{pct}% open": "{pct}% open",
  "Positie": "Position",
  "Icoon als het open staat": "Icon when open",
  "Icoon als het dicht is": "Icon when closed",
  "Naam voor {naam}": "Name for {naam}",
  "{naam} is een poort": "{naam} is a gate",
  "{naam} omgekeerd aangesloten": "{naam} wired in reverse",
  "Rolluiken": "Shutters",
  "Stopknop tonen": "Show stop button",
  "Status tonen": "Show state",
  "Melden ze hun stand terug, dan komt er vanzelf een schuif bij. Zo niet, dan blijven het open, stop en dicht, en volgt het icoon de knop die je indrukt. Per rolluik kun je hieronder een eigen naam zetten.":
    "If they report their position, a slider is added automatically. If not, it stays open, stop and close, and the icon follows the button you press. Below you can give each shutter its own name.",
  "Zet pijltjes om in Openen en Sluiten, en geeft een poorticoon. Een poort schuift opzij, dus omhoog en omlaag zeggen er niets over.":
    "Turns the arrows into Open and Close, and shows a gate icon. A gate slides sideways, so up and down say nothing about it.",
  "Voor een motor die andersom is aangesloten: open wordt dicht en dicht wordt open. De knoppen, de status en de schuif draaien samen om.":
    "For a motor that is wired the other way round: open becomes closed and closed becomes open. The buttons, the status and the slider are reversed together.",
  "Haalt de regel Open, Dicht of het percentage onder de naam weg. Niet bereikbaar blijft altijd staan.":
    "Removes the Open, Closed or percentage line below the name. Unavailable is always shown.",

  // hvac-card.js
  "DomotiApp HVAC": "DomotiApp HVAC",
  "Airco, warmtepomp, ventilatie of boiler: status, metingen als tegels, de standen van het apparaat, doeltemperatuur en boost.":
    "Air conditioner, heat pump, ventilation or water heater: status, readings as tiles, the modes of the device, target temperature and boost.",
  "Kies de soort en minstens één entiteit: het apparaat zelf, of een sensor.":
    "Choose the type and at least one entity: the device itself, or a sensor.",
  "Ventilator": "Fan",
  "Modus": "Mode",
  "doel": "target",
  "Soort apparaat": "Device type",
  "Stap van de temperatuurknoppen": "Temperature button step",
  "Bepaalt welke velden hieronder staan, het icoon, en hoe de statusregel leest.":
    "Determines which fields appear below, the icon, and how the status line reads.",
  "Leeg laten geeft de naam van het apparaat, of anders \"{naam}\".": "Leave empty for the name of the device, or otherwise \"{naam}\".",
  "Leeg laten volgt het apparaat: een halve graad bij een climate, een hele bij een boiler.":
    "Leave empty to follow the device: half a degree for a climate, a whole degree for a water heater.",

  // hvac-logica.js: de velden
  "Apparaat (climate)": "Device (climate)",
  "De climate-entiteit. Daar komen de standen en de temperatuurknoppen vandaan. Leeg laten mag: dan toont de kaart alleen de sensoren.":
    "The climate entity. The modes and the temperature buttons come from it. May be left empty: the card then only shows the sensors.",
  "Ventilatie-unit": "Ventilation unit",
  "Een fan-entiteit (standen of percentage), of een keuzelijst met de standen. Leeg laten mag.":
    "A fan entity (presets or percentage), or a select with the modes. May be left empty.",
  "Boiler (water_heater of climate)": "Water heater (water_heater or climate)",
  "Daar komen de doeltemperatuur en de bedrijfsstanden vandaan. Leeg laten mag.":
    "The target temperature and the operation modes come from it. May be left empty.",
  "Binnentemperatuur": "Indoor temperature",
  "Wint van de meting van het apparaat zelf.": "Takes precedence over the device's own reading.",
  "Buitentemperatuur": "Outdoor temperature",
  "Luchtvochtigheid": "Humidity",
  "CO₂": "CO₂",
  "Kleurt oranje boven 1200 ppm en rood boven 1600.": "Turns orange above 1200 ppm and red above 1600.",
  "Luchtkwaliteit (VOC)": "Air quality (VOC)",
  "Energie vandaag": "Energy today",
  "Aanvoertemperatuur": "Flow temperature",
  "Retourtemperatuur": "Return temperature",
  "Tapwatertemperatuur": "Hot water temperature",
  "Watertemperatuur": "Water temperature",
  "Wint van de meting van de boiler zelf.": "Takes precedence over the water heater's own reading.",
  "Toevoertemperatuur": "Supply temperature",
  "Afvoertemperatuur": "Exhaust temperature",
  "COP": "COP",
  "Rendement: geleverde warmte gedeeld door verbruikte stroom.": "Efficiency: heat delivered divided by electricity used.",
  "Thermisch vermogen": "Thermal power",
  "Compressor": "Compressor",
  "Een toerental of percentage, of een aan/uit-sensor.": "A speed or percentage, or an on/off sensor.",
  "Debiet": "Flow rate",
  "Waterdruk": "Water pressure",
  "Een sensor met een woord als toestand (Verwarmen, Tapwater, Stand 2). Komt in de regel onder de naam.":
    "A sensor with a word as its state (Heating, Hot water, Level 2). Appears in the line below the name.",
  "Een binary_sensor die aan gaat bij een storing. De kaart kleurt dan rood, wat er verder ook aan de hand is.":
    "A binary_sensor that turns on when there is a fault. The card then turns red, whatever else is going on.",
  "Filter": "Filter",
  "Een binary_sensor die aan gaat als het filter vervangen moet worden, of een sensor met de dagen tot vervanging.":
    "A binary_sensor that turns on when the filter needs replacing, or a sensor with the days until replacement.",
  "Bypass": "Bypass",
  "Verwarmt (aan/uit)": "Heating (on/off)",
  "Een binary_sensor die aan is zolang de boiler opwarmt.": "A binary_sensor that is on while the water heater is heating.",
  "Bedrijfsmodus (keuzelijst)": "Operation mode (select)",
  "Een keuzelijst van de integratie, bijvoorbeeld Verwarmen / Koelen / Auto. Verschijnt als uitklaplijst op de kaart.":
    "A select from the integration, for example Heat / Cool / Auto. Appears as a drop-down list on the card.",
  "Boost": "Boost",
  "Een schakelaar wordt een schuifschakelaar op de kaart; een knop of script een drukknop.":
    "A switch becomes a toggle on the card; a button or script becomes a push button.",

  // hvac-logica.js: de soorten
  "Airco": "Air conditioner",
  "Warmtepomp": "Heat pump",
  "Ventilatie (WTW)": "Ventilation (MVHR)",
  "Ventilatie": "Ventilation",
  "Boiler / warm water": "Water heater / hot water",
  "Boiler": "Water heater",

  // hvac-logica.js: standen en toestanden, waar Home Assistant ze heeft in zijn woorden
  "Verwarmen": "Heat",
  "Koelen": "Cool",
  "Auto": "Auto",
  "Drogen": "Dry",
  "Ventileren": "Fan only",
  "Verwarmt": "Heating",
  "Koelt": "Cooling",
  "Droogt": "Drying",
  "Ventileert": "Fan",
  "Standby": "Idle",
  "Voorverwarmt": "Preheating",
  "Ontdooit": "Defrosting",
  "Laag": "Low",
  "Laagst": "Lowest",
  "Min": "Min",
  "Hoog": "High",
  "Hoogst": "Highest",
  "Max": "Max",
  "Turbo": "Turbo",
  "Nacht": "Sleep",
  "Afwezig": "Away",
  "Thuis": "Home",
  "Eco": "Eco",
  "Comfort": "Comfort",
  "Feest": "Party",
  "Elektrisch": "Electric",
  "Gas": "Gas",
  "Veel vraag": "High demand",
  "Stand": "Mode",
  "Ja": "Yes",
  "Nee": "No",
  "Vervangen": "Replace",
  "Schoon": "Clean",
  "Filter vervangen": "Replace filter",

  // Met context (tc): elders hebben deze woorden een ander Engels.
  "Stil|stand": "Quiet",
  "Midden|stand": "Medium",
  "Dicht|knop": "Close",
};
