/** Het Engels van de camerakaart (sinds 0.83.0). */
export const CAMERA = {
  // camera-filters.js: de soorten en de dagen
  "Mens": "Person",
  "Dier": "Animal",
  "Voertuig": "Vehicle",
  "Aanbellen": "Doorbell",
  "Ontgrendeling": "Unlock",
  "Beweging": "Motion",
  "Vandaag": "Today",
  "Gisteren": "Yesterday",
  "gisteren": "yesterday",

  // camera-card.js: het beeld en de filters
  "Volgt de camera": "Follows the camera",
  "16:9 (breed)": "16:9 (wide)",
  "Vierkant": "Square",
  "Omhoog|draaien": "Up",
  "Omlaag|draaien": "Down",
  "Kies een camera. Presets, richtingsknoppen en een bewegingsmelder mogen daarna.":
    "Choose a camera. Presets, direction buttons and a motion sensor can come after.",
  "Meldingen staan aan; tik om ze uit te zetten": "Notifications are on; tap to turn them off",
  "Meldingen staan uit; tik om ze weer aan te zetten": "Notifications are off; tap to turn them back on",
  "Dag terug": "Previous day",
  "Dag verder": "Next day",
  "Meldingen uit": "Notifications off",
  "Alle snapshots": "All snapshots",
  "Alle": "All",
  "Camera": "Camera",
  "Deze camera is niet bereikbaar": "This camera is unavailable",
  "Niets binnen dit filter.": "Nothing matches this filter.",
  "Nog geen beelden.": "No images yet.",
  "{naam} om {klok}": "{naam} at {klok}",
  "Snapshots verwijderen": "Remove snapshots",
  "Weet je zeker dat je {wat} wilt verwijderen? Weg is weg.":
    "Are you sure you want to remove {wat}? This cannot be undone.",

  // camera-archief.js: het opslagscherm
  "Snapshots": "Snapshots",
  "Alles wissen": "Clear all",
  "Snapshots blijven een week staan en verdwijnen daarna vanzelf, oudste eerst. Per camera worden er hoogstens 500 bewaard.":
    "Snapshots are kept for a week and then disappear by themselves, oldest first. At most 500 are kept per camera.",
  "dit beeld van {naam}": "this image from {naam}",
  "de camera": "the camera",
  "dit beeld": "this image",
  // Altijd een of meer; het Nederlands zegt ook bij één "beelden".
  "{n} beelden van {dag}": "the images from {dag} ({n})",
  "alle {n} beelden": "all images ({n})",
  "{n} beelden · {grootte}": "{n} images · {grootte}",
  "Zonder datum": "No date",
  "Wis deze dag": "Clear this day",
  "Verwijder": "Remove",
  "Er liggen geen snapshots.": "There are no snapshots.",

  // camera-card.js: de editor
  "Bij alle camera's": "With all cameras",
  "Presets en draaien": "Presets and pan/tilt",
  "Snapshots en meldingen": "Snapshots and notifications",
  "Naam voor {naam}": "Name for {naam}",
  "↳ hoort bij welke camera": "↳ belongs to which camera",
  "↳ wat ziet hij": "↳ what does it detect",
  "Altijd live": "Always live",
  "Beeldverhouding": "Aspect ratio",
  "Presets (keuzelijst)": "Presets (dropdown)",
  "Presets als losse knoppen": "Presets as separate buttons",
  "Bewegingsmelder": "Motion sensor",
  "Bewegingsmelders": "Motion sensors",
  "Draaien: omhoog": "Pan/tilt: up",
  "Draaien: omlaag": "Pan/tilt: down",
  "Draaien: links": "Pan/tilt: left",
  "Draaien: rechts": "Pan/tilt: right",
  "Nog meer camera's op deze kaart": "More cameras on this card",
  "Snapshots en timeline": "Snapshots and timeline",
  "Rustperiode per melder (seconden)": "Cooldown per sensor (seconds)",
  "Wachten voor het beeld (seconden)": "Delay before the image (seconds)",
  "Wie krijgt een melding": "Who gets a notification",
  "Alleen melden als er niemand thuis is": "Only notify when nobody is home",
  "Schakelaar: meldingen uit": "Switch: notifications off",
  "Schakelaar omgekeerd: aan = meldingen aan": "Switch inverted: on = notifications on",
  "Bepaalt onder welke filterknop zijn beelden in de timeline vallen, en welk icoon er op het beeld staat als hij afgaat. Hij wordt geraden uit de naam — een Reolink klopt vanzelf.":
    "Decides under which filter button its images fall in the timeline, and which icon appears on the image when it triggers. It is guessed from the name; a Reolink is right straight away.",
  "Laat dit op 'alle camera's' staan als je het niet weet. De kaart koppelt een melder vanzelf aan de camera waar hij op hetzelfde apparaat zit — bij een Reolink hoeft je dus niets in te vullen.":
    "Leave this on 'all cameras' if you are not sure. The card links a sensor to the camera on the same device by itself, so with a Reolink there is nothing to fill in.",
  "Op de kaart staat een beeld dat zichzelf ververst. Inzoomen doe je met twee vingers, met het scrollwiel of met een dubbeltik; een gewone tik opent hem groot. Er staan geen knoppen op het beeld.":
    "The card shows an image that refreshes itself. Zoom in with two fingers, the scroll wheel or a double tap; a single tap opens it full size. There are no buttons on the image.",
  "De naam van de camera zelf. Hij staat linksboven op het beeld, en ook in de rij eronder als je meer camera's op deze kaart hebt staan.":
    "The name of the camera itself. It appears at the top left of the image, and in the row below if there are more cameras on this card.",
  "De stream staat dan altijd open. Mooier, maar op een dashboard met zes camera's zijn dat zes streams die de hele dag doorlopen.":
    "The stream then stays open all the time. Nicer, but on a dashboard with six cameras that is six streams running all day.",
  "De `select` van je camera-integratie — Reolink en ONVIF leveren die. De kaart maakt van elke optie een knop, onderin het beeld, dus een preset die je in de camera-app toevoegt verschijnt er vanzelf bij.":
    "The `select` of your camera integration; Reolink and ONVIF provide one. The card turns each option into a button at the bottom of the image, so a preset you add in the camera app appears by itself.",
  "Voor integraties die geen keuzelijst maar losse knoppen leveren, zoals Amcrest en Dahua. Ze mogen naast de keuzelijst staan.":
    "For integrations that provide separate buttons instead of a dropdown, such as Amcrest and Dahua. They can sit next to the dropdown.",
  "Het oude enkele veld. Gebruik liever Bewegingsmelders hierboven; deze blijft werken voor kaarten die hem al hebben.":
    "The old single field. Use Motion sensors above instead; this one keeps working for cards that already have it.",
  "Zolang er een aanstaat komt er een merkje op het beeld. Kies er gerust meerdere: een Reolink meldt persoon, voertuig en huisdier los van elkaar, en dan zie je wélke het is. Een deurbel (`event`) en een slot (`lock`) mogen er ook bij. Per melder kun je hieronder een naam en een soort invullen — die soort bepaalt onder welke filterknop hij in de timeline valt.":
    "While one is on, a badge appears on the image. Feel free to choose several: a Reolink reports person, vehicle and pet separately, and then you see which one it is. A doorbell (`event`) and a lock (`lock`) can be added too. For each sensor you can enter a name and a type below; the type decides under which filter button it falls in the timeline.",
  "De vier richtingsknoppen van je integratie. Vul je er geen in, dan komt het draaikruis er niet.":
    "The four direction buttons of your integration. If you fill in none, the direction pad does not appear.",
  "Onder het beeld komt dan een rij met namen om tussen te wisselen; de camera waar je naar kijkt licht op. Handig voor de camera's die bij elkaar horen — voordeur, oprit, achtertuin. Per camera kun je hieronder een eigen naam invullen.":
    "A row of names then appears below the image to switch between them; the camera you are watching lights up. Handy for cameras that belong together: front door, driveway, back garden. You can enter a name for each camera below.",
  "Bij elke detectie legt Home Assistant een beeld vast en zet dat onder de kaart in een strook, met filters erboven op dag, soort en camera — ook als er nergens een scherm aanstaat. Beelden blijven een week staan; daarboven wijkt vanzelf de oudste. Staat dit uit, dan wordt er niets vastgelegd en niets bewaard.":
    "On every detection Home Assistant captures an image and puts it in a strip below the card, with filters above it for day, type and camera, even when no screen is on anywhere. Images are kept for a week; beyond that the oldest makes way by itself. When this is off, nothing is captured and nothing is kept.",
  "Hoe lang dezelfde melder daarna met rust wordt gelaten. Dit is het antwoord op tien meldingen achter elkaar. De klok loopt PER MELDER: meldt je camera persoon, voertuig en huisdier apart, dan houden die elkaar niet tegen — een auto die de oprit op rijdt en de bestuurder die uitstapt leveren allebei een beeld op. Nul betekent: alles vastleggen.":
    "How long the same sensor is left alone afterwards. This is the answer to ten notifications in a row. The clock runs PER SENSOR: if your camera reports person, vehicle and pet separately, they do not block each other, so a car pulling into the driveway and the driver getting out both produce an image. Zero means: capture everything.",
  "Wacht zoveel seconden na de detectie voordat het beeld genomen wordt. Op nul krijg je het moment zelf; op een of twee seconden staat degene meestal beter in beeld dan met zijn rug ernaartoe. Deze wachttijd verandert niets aan de rustperiode.":
    "Waits this many seconds after the detection before the image is taken. At zero you get the moment itself; at one or two seconds the person is usually better in view than with their back to the camera. This delay does not change the cooldown.",
  "De personen die een melding op hun telefoon krijgen, met het beeld erbij. De kaart zoekt zelf de mobiele app van die persoon op. Buitenshuis heeft de telefoon een extern adres nodig (Nabu Casa of een eigen domein) om de foto te laden; zonder dat komt de melding wél aan, maar zonder plaatje.":
    "The people who get a notification on their phone, with the image. The card looks up that person's mobile app by itself. Away from home the phone needs an external address (Nabu Casa or your own domain) to load the photo; without it the notification still arrives, but without the picture.",
  "Dan blijft de telefoon stil zolang er iemand thuis is. Het beeld komt nog steeds in de timeline te staan — alleen de melding blijft achterwege. Dit scheelt in de praktijk meer meldingen dan de rustperiode.":
    "The phone then stays silent while anyone is home. The image still goes into the timeline; only the notification is skipped. In practice this saves more notifications than the cooldown.",
  "Een helper (input_boolean) of schakelaar. Staat hij aan, dan gaat er geen melding naar de telefoon; het beeld komt wél in de timeline. De kaart krijgt er een belknop bij in de rij boven de timeline om hem om te zetten, en hij is ook in een automatisering te gebruiken (bijvoorbeeld: aan als de poetsploeg er is).":
    "A helper (input_boolean) or switch. While it is on, no notification goes to the phone; the image does go into the timeline. The card gets a bell button in the row above the timeline to toggle it, and it can be used in an automation too (for example: on while the cleaners are in).",
  "Voor een helper die al andersom in gebruik is: aan betekent dan dat de meldingen AAN staan, en uit houdt de telefoon stil. De belknop op de kaart draait mee.":
    "For a helper that is already used the other way round: on then means notifications are ON, and off keeps the phone silent. The bell button on the card follows along.",
  "Standaard volgt de kaart zijn camera, zodat er geen beeld af gaat. Staan er meerdere camerakaarten naast elkaar in een stack, kies dan overal dezelfde verhouding — dan zijn ze even hoog. Er wordt dan wel bijgesneden.":
    "By default the card follows its camera, so nothing is cut off. If several camera cards sit side by side in a stack, choose the same ratio for all of them so they are the same height. The image is then cropped.",
  "Eén vinkje voor de hele bediening: de presetknoppen in het beeld en het draaikruis linksonder. Zet je het uit, dan blijft alles wat je gekozen hebt gewoon staan — het is alleen weg van het beeld.":
    "One tick for all the controls: the preset buttons on the image and the direction pad at the bottom left. Turn it off and everything you chose stays as it is; it is just gone from the image.",

  // De kaartkiezer
  "DomotiApp Camera": "DomotiApp Camera",
  "Live beeld met inzoomen en schuiven, de presets van je camera als knoppen, een draaikruis en een merkje zodra er beweging is.":
    "Live view with zoom and pan, your camera's presets as buttons, a direction pad and a badge as soon as there is motion.",
};
