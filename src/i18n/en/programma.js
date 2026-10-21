/**
 * Het Engels van de programmakaart: vaatwasser, wasmachine en droger (sinds
 * 0.81.0). Waar het paneel van DomotiApp Coach dezelfde zin heeft, staat hier
 * hetzelfde Engels. Namen van programma's en fasen komen van Home Assistant en
 * staan hier dus niet.
 */
export const PROGRAMMA = {
  // programma-logica.js: de soorten
  "Vaatwasser": "Dishwasher",
  "Wasmachine": "Washing machine",
  "Droger": "Dryer",
  "Klep": "Door",
  "Deur": "Door",
  "WWI880 (wasmachine)": "WWI880 (washing machine)",
  "TWH780WP (warmtepompdroger)": "TWH780WP (heat pump dryer)",

  // programma-logica.js: de tegels
  "Open": "Open",
  "Dicht": "Closed",
  "Geen": "None",
  "Programma": "Programme",
  "Fase": "Phase",
  "Energie": "Energy",
  "Energie verwacht": "Energy expected",
  "Water": "Water",
  "Water verwacht": "Water expected",
  "Temperatuur": "Temperature",
  "Droogtegraad": "Drying level",
  "Duur": "Duration",
  "morgen {klok}": "tomorrow {klok}",
  "vandaag {klok}": "today {klok}",
  "{u} u {m} min": "{u} h {m} min",
  "{u} uur": "{u} h",

  // vaatwasser-logica.js: de woorden van Miele en de toestand
  "Aan": "On",
  "Instellingen": "Settings",
  "Spoelstop": "Rinse hold",
  "Onderbroken": "Interrupted",
  "Klaar": "Done",
  "nog {duur}": "{duur} left",
  "Draait": "Running",
  "Uit": "Off",
  "Programma klaar": "Programme finished",
  "Uitgestelde start": "Delayed start",
  "Klaar om te starten": "Ready to start",
  "{deur} open": "{deur} open",
  "Start nu": "Starting now",
  "Start om {klok}": "Starts at {klok}",
  "Start morgen om {klok}": "Starts tomorrow at {klok}",
  "Start {dag} om {klok}": "Starts {dag} at {klok}",
  "Start {datum} om {klok}": "Starts {datum} at {klok}",
  "Start over {duur}": "Starts in {duur}",

  // vaatwasser-logica.js: de knoppen van de coach
  "Mag draaien": "OK to run",
  "Vrijgegeven": "Released",
  "Vrijgegeven. Druk om de vrijgave in te trekken.": "Released. Press to withdraw the release.",
  "{dag} starten": "Start {dag}",
  "{kort}, {dag} starten": "{kort}, start {dag}",
  "{kort}, nu starten": "{kort}, start now",
  "Toch nu starten": "Start now anyway",
  "Nu": "Now",
  "morgen": "tomorrow",

  // dishwasher-card.js
  "Kies minstens een statussensor. Resterende tijd, voortgang, programma en de knoppen mogen daarna.":
    "Choose at least a status sensor. Remaining time, progress, programme and the buttons can follow.",
  "Ingeruimd": "Loaded",
  "Nu starten": "Start now",
  "Handmatig": "Manual",
  "Handmatige besturing": "Manual control",
  "Slim": "Smart",
  "Start": "Start",
  "Stop": "Stop",
  "laatste beurt {wanneer}": "last cycle {wanneer}",

  // dishwasher-card.js: de editor
  "Icoon (zonder foto)": "Icon (without photo)",
  "Merk": "Brand",
  "Type": "Type",
  "In combinatie met DomotiApp Coach": "Together with DomotiApp Coach",
  "Apparaat bij de coach": "Appliance in the coach",
  "Afwijken van de coach": "Differ from the coach",
  "Statussensor": "Status sensor",
  "Resterende tijd": "Remaining time",
  "Voortgang (0-100%)": "Progress (0-100%)",
  "Programmakeuze": "Programme selection",
  "Start / pauze": "Start / pause",
  "Klep- of deursensor": "Door sensor",
  "Slimme sturing": "Smart control",
  "Leest bij de coach wanneer hij gaat starten. Mag de coach hem sturen (het vinkje bij de coach), dan staan zijn knoppen erbij: Mag draaien en Nu starten. De eigen knoppen van de machine staan op een wasmachine of droger niet op de kaart.":
    "Reads from the coach when it will start. If the coach may control it (the tick box in the coach), its buttons are shown too: OK to run and Start now. The machine's own buttons are not on the card for a washing machine or dryer.",
  "Zet de knoppen van de coach op de kaart: Ingeruimd, Nu starten en Handmatig. Daarvoor is coach 0.110.0 of nieuwer nodig. Wat de coach al weet (status, programma, knoppen, klep) haalt de kaart daar vandaan; die velden staan hieronder dan niet meer.":
    "Puts the coach's buttons on the card: Loaded, Start now and Manual. This needs coach 0.110.0 or newer. What the coach already knows (status, programme, buttons, door) the card takes from there; those fields are then no longer shown below.",
  "Leeg laten: de vaatwasser van de coach, als er precies één is.":
    "Leave empty: the coach's dishwasher, if there is exactly one.",
  "Kies zelf andere sensoren of knoppen dan de coach gebruikt. Wat je daar invult gaat voor; wat je leeg laat, komt van de coach.":
    "Choose other sensors or buttons than the coach uses. What you fill in there takes priority; what you leave empty comes from the coach.",
  "Automatisch toont de productfoto als het type bekend is, en anders het icoon.":
    "Automatic shows the product photo if the type is known, and otherwise the icon.",
  "Het type bepaalt de productfoto.": "The type determines the product photo.",
  "Een knop die het programma pauzeert. Staat alleen op de kaart als hij te drukken is.":
    "A button that pauses the programme. Only shown on the card when it can be pressed.",
  "De sensor die Run, Ready, Finished of iets in die geest meldt. De kaart vertaalt dat zelf. Bij Miele zoekt de kaart de rest van het apparaat zelf: resterende tijd, programma en fase, TwinDos, verbruik en de geplande start, en bij een vaatwasser start, pauze en stop. Een wasmachine of droger heeft geen eigen knoppen, en toont als hij uit staat de laatste beurt.":
    "The sensor that reports Run, Ready, Finished or similar. The card translates that itself. With Miele the card finds the rest of the appliance itself: remaining time, programme and phase, TwinDos, consumption and the planned start, and for a dishwasher start, pause and stop. A washing machine or dryer has no buttons of its own, and shows the last cycle when it is off.",
  "Een tijdstip, een aantal minuten of een klok als 1:24:00 — alle drie worden gelezen. Een tijdstip is het moment waarop hij klaar is, geen duur.":
    "A timestamp, a number of minutes or a clock like 1:24:00; all three are read. A timestamp is the moment it will be done, not a duration.",
  "Zonder deze sensor is er geen stand, en schuift er een streepje heen en weer zolang hij draait.":
    "Without this sensor there is no position, and a small bar slides back and forth while it runs.",
  "Een keuzelijst met de programma's. Verschijnt als uitklaplijst op de kaart.":
    "A select with the programmes. Appears as a drop-down list on the card.",
  "Een knop, een script of een schakelaar — de kaart kiest zelf de juiste service.":
    "A button, a script or a switch; the card picks the right service itself.",
  "Idem. Deze knop is rood, want hij onderbreekt iets dat loopt.":
    "The same. This button is red, because it interrupts something that is running.",
  "Staat de klep open, dan zegt de kaart dat in plaats van 'klaar om te starten'.":
    "If the door is open, the card says so instead of 'ready to start'.",
  "De input_boolean van je eigen slimme sturing. De knop licht op als hij aanstaat.":
    "The input_boolean of your own smart control. The button lights up when it is on.",
  "DomotiApp Vaatwasser, wasmachine en droger": "DomotiApp Dishwasher, washing machine and dryer",
  "Een apparaat met een programma: status, resterende tijd met voortgangsbalk, programma en de knoppen, met een productfoto per merk en type. Bij Miele vindt hij de rest van het apparaat zelf.":
    "An appliance with a programme: status, remaining time with a progress bar, programme and the buttons, with a product photo per brand and type. With Miele it finds the rest of the appliance itself.",
};
