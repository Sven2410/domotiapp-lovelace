/** Het Engels van vriezer en koelkast, 3D-printer, printer, auto en wifi (sinds 0.83.0). */
export const APPARATUUR = {
  // kantoorprinter-logica.js en -card.js (sinds 0.84.0)
  "Gestopt": "Stopped",
  "Fotozwart": "Photo black",
  "Zwart": "Black",
  "Lichtcyaan": "Light cyan",
  "Cyaan": "Cyan",
  "Lichtmagenta": "Light magenta",
  "{inkt} bijna op": "{inkt} running low",
  "{inkt}, bijna op": "{inkt}, running low",
  "Kies de statussensor van de printer.": "Choose the status sensor of the printer.",
  "afdrukken": "pages",
  "Printer": "Printer",
  "{zwartwit} zwart-wit, {kleur} in kleur": "{zwartwit} black and white, {kleur} in colour",
  "De sensor met de status van de printer (Klaar, Printen, Gestopt), van de integratie Internet Printing Protocol (IPP). De inkt en het aantal afdrukken van hetzelfde apparaat zoekt de kaart zelf.":
    "The sensor with the status of the printer (Idle, Printing, Stopped), from the Internet Printing Protocol (IPP) integration. The card finds the ink and the page count of the same device itself.",
  "DomotiApp Printer": "DomotiApp Printer",
  "Een printer voor papier: of hij klaar is, de inkt per kleur en het aantal afdrukken. Met een productfoto per merk en type.":
    "A paper printer: whether it is ready, the ink per colour and the number of pages printed. With a product photo per brand and model.",

  // vriezer-logica.js
  "Koelkast": "Fridge",
  "Vriezer": "Freezer",
  "Deur open": "Door open",
  "Deur dicht": "Door closed",
  "Melding op de koelkast": "Alert on the fridge",
  "Melding op de vriezer": "Alert on the freezer",
  "FNS 7710 E (vriezer)": "FNS 7710 E (freezer)",
  "K 7747 C (koelkast)": "K 7747 C (fridge)",

  // vriezer-card.js
  "Kies de climate van de koelkast of de vriezer.": "Choose the climate entity of the fridge or the freezer.",
  "Instellen op": "Set to",
  "Instellen op {graden}": "Set to {graden}",
  "Kouder": "Colder",
  "Minder koud": "Less cold",
  "Koelkast of vriezer": "Fridge or freezer",
  "De climate van de koelkast of de vriezer. Kies het vak met een temperatuur: Miele maakt er ook twee zonder (zone 2 en 3), en die hebben geen vak. Deur, storing en melding van hetzelfde apparaat zoekt de kaart zelf.":
    "The climate entity of the fridge or the freezer. Choose the compartment with a temperature: Miele also creates two without one (zone 2 and 3), and those are not real compartments. The card finds the door, fault and alert of the same appliance itself.",
  "Leeg laten: de naam van het apparaat in Home Assistant.": "Leave empty: the name of the device in Home Assistant.",
  "DomotiApp Koelkast en vriezer": "DomotiApp Fridge and freezer",
  "De koelkast of de vriezer: de temperatuur, waar hij op staat, en of de deur open staat of er een melding is. Met een productfoto per merk en type.":
    "The fridge or the freezer: the temperature, what it is set to, and whether the door is open or there is an alert. With a product photo per brand and type.",

  // printer-logica.js
  "Klaar voor gebruik": "Ready",
  "Aan het printen": "Printing",
  "Mislukt": "Failed",
  "Offline": "Offline",
  "Voorbereiden": "Preparing",
  "{uur} u {min}": "{uur} h {min}",

  // printer-card.js
  "Kies minstens een printstatus. Camera, voortgang, temperaturen, de deur en de trays van de AMS mogen daarna.":
    "Choose at least a print status. Camera, progress, temperatures, the door and the AMS trays can follow.",
  "Printer aan of uit": "Printer on or off",
  "Printer uitzetten?": "Turn off the printer?",
  "Er loopt een print. Uitzetten breekt hem af, en dat is niet terug te draaien.":
    "A print is running. Turning off aborts it, and that cannot be undone.",
  "Er loopt een print ({pct}% klaar). Uitzetten breekt hem af, en dat is niet terug te draaien.":
    "A print is running ({pct}% done). Turning off aborts it, and that cannot be undone.",
  "Weet je zeker dat je de printer wilt uitzetten?": "Are you sure you want to turn off the printer?",
  "Uitzetten": "Turn off",
  "Aan laten": "Keep on",
  "3D-printer": "3D printer",
  "nog {duur}, klaar om {klok}": "{duur} left, done at {klok}",
  "nog {duur} · klaar om {klok}": "{duur} left · done at {klok}",
  "Printer uitzetten": "Turn off printer",
  "Printer aanzetten": "Turn on printer",
  "Camera": "Camera",
  "Toon voorbeeld": "Show preview",
  "Toon camera": "Show camera",
  "Wat de printer aan het maken is": "What the printer is making",
  "Nog geen voorbeeld": "No preview yet",
  "Bezig": "Busy",
  "Nozzle": "Nozzle",
  "Bed": "Bed",
  "Tray {n}": "Tray {n}",
  "leeg": "empty",
  "gevuld": "loaded",
  "nog {pct}%": "{pct}% left",
  "(in gebruik)": "(in use)",
  "Tray {n}: kleur met de hand": "Tray {n}: colour by hand",
  "Tray {n}: naam met de hand": "Tray {n}: name by hand",
  "Printstatus": "Print status",
  "Aan/uit-schakelaar": "On/off switch",
  "Printvoortgang (0-100%)": "Print progress (0-100%)",
  "Eindtijd of resterende tijd": "End time or remaining time",
  "Nozzletemperatuur": "Nozzle temperature",
  "Bedtemperatuur": "Bed temperature",
  "Deur van de printer": "Printer door",
  "Altijd live beeld": "Always live view",
  "Voorbeeld van de print": "Print preview",
  "De sensor die meldt wat hij doet. RUNNING, IDLE, FINISH, PAUSE en FAILED worden herkend, en die van Octoprint en Klipper ook.":
    "The sensor that reports what it is doing. RUNNING, IDLE, FINISH, PAUSE and FAILED are recognised, and those of Octoprint and Klipper too.",
  "Zetten en uitzetten. Bij UITzetten vraagt de kaart eerst of je het zeker weet — en loopt er een print, dan staat erbij hoe ver hij was.":
    "Turn on and off. When turning OFF, the card first asks if you are sure, and if a print is running it says how far it got.",
  "Een aantal minuten, een klok als 1:24:00 of het tijdstip waarop hij klaar is: alle drie worden gelezen. De kaart toont beide — hoe lang nog én hoe laat.":
    "A number of minutes, a clock like 1:24:00 or the time it will be done: all three are read. The card shows both: how long to go and at what time.",
  "Het live beeld van de printer. Staat er ook een voorbeeld ingesteld, dan komt er een knop om te wisselen.":
    "The live view of the printer. If a preview is also set, a button to switch appears.",
  "Normaal ververst het beeld een paar keer per minuut en gaat hij alleen echt live zolang er een print loopt. Met deze knop staat de stream altijd aan — mooier, maar het kost een verbinding die de hele dag openstaat.":
    "Normally the picture refreshes a few times a minute and only goes truly live while a print is running. With this switch the stream is always on: nicer, but it keeps a connection open all day.",
  "De `image`-entiteit met de plaat van wat hij aan het maken is.": "The `image` entity with the plate of what it is making.",
  "De vier trays van de AMS. De kaart haalt de kleur en het soort filament uit de attributen van de entiteit; Bambu levert die als hexwaarde. Lukt dat niet, vul dan hieronder zelf een kleur in.":
    "The four AMS trays. The card takes the colour and the filament type from the attributes of the entity; Bambu provides them as a hex value. If that does not work, enter a colour yourself below.",
  "Alleen nodig als de entiteit zijn kleur niet meelevert. Een hexwaarde (#FF6B00) of een kleurnaam.":
    "Only needed if the entity does not provide its colour. A hex value (#FF6B00) or a colour name.",
  "DomotiApp 3D-printer": "DomotiApp 3D printer",
  "Live camerabeeld of het voorbeeld, voortgang met eindtijd, temperaturen, de deur en de vier trays van de AMS met hun echte kleur.":
    "Live camera view or the preview, progress with end time, temperatures, the door and the four AMS trays in their real colour.",

  // auto-logica.js
  "Brandstof": "Fuel",
  "Hybride": "Hybrid",
  "Aan het laden": "Charging",
  "Volgeladen": "Fully charged",
  "Aan de lader": "Plugged in",
  "Niet aan de lader": "Not plugged in",
  "Er staat iets open": "Something is open",
  "Niet op slot": "Unlocked",
  "Nog {afstand}": "{afstand} left",

  // auto-card.js
  "Auto|voertuig": "Car",
  "Kies de aandrijving en vul minstens één sensor in — de accu, de tank of de actieradius.":
    "Choose the drivetrain and fill in at least one sensor: the battery, the tank or the range.",
  "De auto": "The car",
  "Accu": "Battery",
  "Tank": "Tank",
  "Actieradius": "Range",
  "Waar hij staat": "Location",
  "Laadstatus": "Charging status",
  "Op slot": "Locked",
  "Portierslot": "Door lock",
  "Deuren": "Doors",
  "Ramen": "Windows",
  "Voorverwarmen": "Preconditioning",
  "Kilometerstand": "Odometer",
  "Laadvermogen": "Charging power",
  "Foto van de auto": "Photo of the car",
  "Klein, naast de naam": "Small, next to the name",
  "Groot, over de hele breedte": "Large, across the full width",
  "Aandrijving": "Drivetrain",
  "Hoe groot staat de foto": "Photo size",
  "Accupercentage": "Battery percentage",
  "Accu-inhoud (kWh), als de sensor geen procenten geeft": "Battery capacity (kWh), if the sensor does not report a percentage",
  "Klaar met laden om / nog te gaan": "Charging done at / time to go",
  "Tankniveau": "Fuel level",
  "Tankinhoud (liter), als de sensor geen procenten geeft": "Tank capacity (litres), if the sensor does not report a percentage",
  "Deuren open": "Doors open",
  "Ramen open": "Windows open",
  "Voorverwarmen (alleen uitlezen)": "Preconditioning (read only)",
  "Hoe dichtbij is thuis (meter)": "How close counts as home (metres)",
  "Extra sensoren als tegel": "Extra sensors as tiles",
  "Bepaalt welke balken er op de kaart komen — een accu, een tank, of allebei — en welke velden je hieronder ziet.":
    "Determines which bars appear on the card (a battery, a tank, or both) and which fields you see below.",
  "Kies een bestand of sleep er een op. Home Assistant zet hem in zijn eigen media-opslag; je kunt ook een pad als /local/auto.png intypen.":
    "Choose a file or drop one here. Home Assistant puts it in its own media storage; you can also type a path such as /local/auto.png.",
  "In de eenheid van de sensor zelf. De kaart rekent niets om: staat je Home Assistant op mijlen, dan zie je mijlen.":
    "In the unit of the sensor itself. The card converts nothing: if your Home Assistant uses miles, you see miles.",
  "Alleen nodig als je accusensor in kWh meldt in plaats van in procenten. Dan rekent de kaart het percentage zelf uit.":
    "Only needed if your battery sensor reports kWh instead of a percentage. The card then works out the percentage itself.",
  "Alleen nodig als je tanksensor in liters meldt in plaats van in procenten.":
    "Only needed if your tank sensor reports litres instead of a percentage.",
  "Een aantal minuten, een klok of het tijdstip waarop hij vol is — alle drie worden gelezen.":
    "A number of minutes, a clock or the time it will be full: all three are read.",
  "Staat er iets open, dan zegt de kaart dat en gaat al het andere even opzij. Een binary_sensor mag, maar een gewone sensor met een woord erin ook — Closed, Open, Ajar en LOCKED worden allemaal gelezen.":
    "If something is open, the card says so and everything else steps aside. A binary_sensor works, but so does a regular sensor with a word in it: Closed, Open, Ajar and LOCKED are all read.",
  "Alleen uitlezen: deze kaart bedient niets. Een lock-entiteit mag, maar ook een sensor die LOCKED of UNLOCKED meldt.":
    "Read only: this card controls nothing. A lock entity works, but so does a sensor that reports LOCKED or UNLOCKED.",
  "Een device_tracker die home of not_home meldt, of een sensor met een coordinaat — beide worden gelezen. Bij een coordinaat rekent de kaart de afstand tot de locatie van je Home Assistant uit en maakt daar Thuis of Afwezig van.":
    "A device_tracker that reports home or not_home, or a sensor with a coordinate: both are read. With a coordinate, the card works out the distance to the location of your Home Assistant and turns that into Home or Away.",
  "Alleen van belang bij een sensor met een coordinaat. Binnen deze afstand van je huis heet de auto thuis. Leeg laten is 100 meter — ruim genoeg voor een oprit of een parkeerplaats om de hoek.":
    "Only relevant for a sensor with a coordinate. Within this distance of your home, the car counts as home. Leave empty for 100 metres: enough for a driveway or a parking space around the corner.",
  "Alles wat je verder nog kwijt wilt: bandenspanning, buitentemperatuur, de volgende beurt. Ze komen als tegels onderaan te staan, met de naam uit Home Assistant.":
    "Anything else you want to show: tyre pressure, outside temperature, the next service. They appear as tiles at the bottom, with the name from Home Assistant.",
  "DomotiApp Auto": "DomotiApp Car",
  "Brandstof, hybride of elektrisch: accu- en tankbalk, actieradius, laadstatus, het slot en zoveel eigen sensoren als je kwijt wilt — met een foto van de auto erbij.":
    "Fuel, hybrid or electric: battery and tank bars, range, charging status, the lock and as many of your own sensors as you like, with a photo of the car.",

  // wifi-logica.js
  "Kies de QR-code van het wifi-netwerk.": "Choose the QR code of the wifi network.",
  "Deze QR-code bestaat niet. In UniFi Network staat hij standaard uit: zet hem aan bij de entiteiten van het netwerk.":
    "This QR code does not exist. In UniFi Network it is off by default: enable it in the entities of the network.",
  "De QR-code is niet bereikbaar.": "The QR code is unavailable.",
  "Deze entiteit heeft geen afbeelding.": "This entity has no image.",

  // wifi-card.js en wifi-groot.js
  "Wifi voor gasten": "Guest wifi",
  "Kies de QR-code van het wifi-netwerk (bij UniFi Network: de entiteit QR-code van het netwerk).":
    "Choose the QR code of the wifi network (in UniFi Network: the QR code entity of the network).",
  "QR-code van de wifi": "Wifi QR code",
  "Wachtwoord": "Password",
  "Scan de code met de camera van je telefoon.": "Scan the code with your phone's camera.",
  "{titel}: {naam}. Tik om de QR-code groot te tonen.": "{titel}: {naam}. Tap to show the QR code full screen.",
  "QR-code van het wifi-netwerk": "QR code of the wifi network",
  "Netwerknaam": "Network name",
  "Wachtwoord (als tekst erbij)": "Password (shown as text)",
  "Kopje": "Heading",
  "Bij UniFi Network heeft elk wifi-netwerk een entiteit QR-code. Die staat standaard UIT (en is er alleen met een beheerdersaccount in UniFi): zet hem aan bij de entiteiten van het netwerk.":
    "In UniFi Network every wifi network has a QR code entity. It is OFF by default (and only exists with an administrator account in UniFi): enable it in the entities of the network.",
  "Leeg laten: de naam van het netwerk uit UniFi.": "Leave empty: the name of the network from UniFi.",
  "UniFi geeft het wachtwoord niet door aan Home Assistant; het zit alleen in de QR-code. Vul het hier in als je het ook als tekst wilt tonen, voor wie niet kan scannen. Wordt het in UniFi vernieuwd, dan past de QR-code zich aan, deze tekst niet.":
    "UniFi does not pass the password to Home Assistant; it is only in the QR code. Enter it here if you also want to show it as text, for anyone who cannot scan. If it is renewed in UniFi, the QR code updates, this text does not.",
  "Leeg laten: \"{titel}\".": "Leave empty: \"{titel}\".",
  "Richt de camera van je telefoon op de code. Tik om te sluiten.": "Point your phone's camera at the code. Tap to close.",
  "DomotiApp Wifi": "DomotiApp Wifi",
  "De QR-code van een wifi-netwerk (bijvoorbeeld het gastnetwerk van UniFi), met de netwerknaam. Tik erop en de code staat groot in beeld.":
    "The QR code of a wifi network (for example the UniFi guest network), with the network name. Tap it and the code fills the screen.",
};
