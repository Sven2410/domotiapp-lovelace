/** Het Engels van afval, personen, weer, rookmelder en meldingen (sinds 0.82.0). */
export const MELDINGEN = {
  // afval-logica.js
  "aan de weg": "at the kerb",
  "nu aan de weg": "at the kerb now",
  "over {n} dagen": "in {n} days",
  "dag": "day",
  "dagen": "days",
  "Staat buiten · {naam}": "Put out · {naam}",
  "Staat buiten": "Put out",

  // waste-card.js
  "geen datum": "no date",
  "is geweest": "has passed",
  "sensor ontbreekt": "sensor missing",
  "vandaag": "today",
  "Kies minstens één afvalsensor waarvan de status een datum is.": "Choose at least one waste sensor whose state is a date.",
  "Geen ophaaldata gevonden. Controleer of de gekozen sensoren een datum als toestand hebben.":
    "No collection dates found. Check that the chosen sensors have a date as their state.",
  "Afvalkalender": "Waste calendar",
  "Kleur voor {naam}": "Colour for {naam}",
  "Lijst (eerstvolgende uitgelicht)": "List (next one highlighted)",
  "Over de breedte (veel lager)": "Full width (much lower)",
  "Afvalsensoren": "Waste sensors",
  "Eerstvolgende uitlichten": "Highlight the next one",
  "Overige data tonen": "Show other dates",
  "Over de breedte zet alle bakken naast elkaar in plaats van onder elkaar. Vier bakken passen dan op één rasterrij in plaats van vier — dat scheelt bijna tweehonderd pixels. De eerstvolgende licht op.":
    "Full width puts all bins side by side instead of below each other. Four bins then fit on one grid row instead of four, which saves almost two hundred pixels. The next one is highlighted.",
  "Sensoren waarvan de status een datum is, bijvoorbeeld 18-08-2026. De kaart sorteert zelf; laat een kleur leeg om de bakkleur op de naam te laten kiezen.":
    "Sensors whose state is a date, for example 18-08-2026. The card sorts them itself; leave a colour empty to let the name choose the bin colour.",
  "DomotiApp Afvalkalender": "DomotiApp Waste Calendar",
  "Eerstvolgende ophaling als hero, de rest eronder. Kleur per fractie.":
    "The next collection up front, the rest below. A colour per waste type.",

  // person-card.js
  "Onbekend": "Unknown",
  "Kies minstens één persoon.": "Choose at least one person.",
  "Personen": "People",
  "Thuis is groen, weg is rood, geen melding is oranje. Per persoon kun je hieronder een eigen naam zetten.":
    "Home is green, away is red, no report is orange. You can set a name of your own for each person below.",
  "DomotiApp Personen": "DomotiApp People",
  "Wie er thuis is, compact. Het hele huishouden in één kaart.": "Who is home, compact. The whole household in one card.",

  // forecast-card.js
  "Kies een weerentiteit.": "Choose a weather entity.",
  "Geen verbinding voor de voorspelling.": "No connection for the forecast.",
  "Deze weerbron geeft geen uurvoorspelling.": "This weather source has no hourly forecast.",
  "Deze weerbron geeft geen dagvoorspelling.": "This weather source has no daily forecast.",
  "Nog geen voorspelling ontvangen…": "No forecast received yet…",
  "Per dag": "Daily",
  "Per uur": "Hourly",
  "Weerentiteit": "Weather entity",
  "Naam (overschrijft die van de weerbron)": "Name (overrides the weather source's)",
  "Voorspelling": "Forecast",
  "Hoeveel punten": "How many points",
  "Nu-regel tonen": "Show current conditions",
  "Meer hoeft er niet ingevuld te worden: de kaart leest zelf uit wat je weerbron levert.":
    "Nothing else needs filling in: the card reads what your weather source provides.",
  "Niet elke weerbron kan allebei. Kan hij het niet, dan zegt de kaart dat in plaats van leeg te blijven.":
    "Not every weather source can do both. If it can't, the card says so instead of staying empty.",
  "DomotiApp Weersvoorspelling": "DomotiApp Weather Forecast",
  "Vandaag groot, de dagen erna op een rij. Eén entiteit invullen.":
    "Today large, the days after in a row. Fill in one entity.",

  // weer-animatie.js: de namen van Home Assistant
  "Zonnig": "Sunny",
  "Heldere nacht": "Clear, night",
  "Half bewolkt": "Partly cloudy",
  "Bewolkt": "Cloudy",
  "Regen": "Rainy",
  "Stortregen": "Pouring",
  "Hagel": "Hail",
  "Onweer": "Lightning",
  "Onweer met regen": "Lightning, rainy",
  "Sneeuw": "Snowy",
  "Natte sneeuw": "Snowy, rainy",
  "Mist": "Fog",
  "Winderig": "Windy",
  "Winderig en bewolkt": "Windy, cloudy",
  "Uitzonderlijk weer": "Exceptional",

  // smoke-logica.js
  "Rook": "Smoke",
  "Rook gedetecteerd": "Smoke detected",
  "Koolmonoxide": "Carbon monoxide",
  "Koolmonoxide gedetecteerd": "Carbon monoxide detected",
  "Warmte": "Heat",
  "Te warm": "Too hot",
  "Normaal": "Normal",
  "Batterij": "Battery",
  "Rustig": "Quiet",
  "Batterij bijna leeg ({pct}%)": "Battery low ({pct}%)",
  "Alles rustig": "All clear",

  // smoke-card.js
  "Kies minstens één entiteit: rook, koolmonoxide, warmte, temperatuur of batterij.":
    "Choose at least one entity: smoke, carbon monoxide, heat, temperature or battery.",
  "onbekend": "unknown",
  "Alarm": "Alarm",
  "Naam (overschrijft die van de melder)": "Name (overrides the detector's)",
  "Tikken op de kaart": "Tap on the card",
  "Vasthouden op de kaart": "Hold on the card",
  "Alle vijf zijn optioneel: vul in wat je melder heeft. Wat je leeg laat, komt niet op de kaart.":
    "All five are optional: fill in what your detector has. Whatever you leave empty stays off the card.",
  "Een percentage of een 'batterij bijna leeg'-sensor. Onder de 20% meldt de kaart het uit zichzelf.":
    "A percentage or a 'battery low' sensor. Below 20% the card reports it by itself.",
  "DomotiApp Rookmelder": "DomotiApp Smoke Detector",
  "Rook, koolmonoxide, warmte, temperatuur en batterij — alles optioneel.":
    "Smoke, carbon monoxide, heat, temperature and battery, all optional.",

  // meldingen-logica.js
  "staat buiten ({door})": "put out ({door})",
  "staat buiten": "put out",
  "Vandaag {wat}": "Today {wat}",
  "Morgen {wat}": "Tomorrow {wat}",
  "melding verstuurd": "notification sent",
  "melding om {tijd}": "notification at {tijd}",
  "Afvalmeldingen": "Waste notifications",
  "Actief zodra het dashboard is opgeslagen": "Active once the dashboard is saved",
  "Nog geen afvalsensor gekozen": "No waste sensor chosen yet",
  "de avond ervoor om {tijd}": "the evening before at {tijd}",
  "de ochtend zelf om {tijd}": "the morning itself at {tijd}",
  "Verstuurd naar {naam}: “{titel}”. Kijk op de telefoon.": "Sent to {naam}: “{titel}”. Check the phone.",
  "Niet verstuurd: geen werkende telefoon gevonden voor {naam}.": "Not sent: no working phone found for {naam}.",
  "Niet verstuurd.": "Not sent.",

  // meldingen-card.js
  "Geen telefoon gevonden. Zonder de app van Home Assistant krijgt {naam} niets, ook niet met een vinkje.":
    "No phone found. Without the Home Assistant app, {naam} gets nothing, even with a tick.",
  "Proef mislukt: {fout}": "Test failed: {fout}",
  "Geen telefoon gevonden": "No phone found",
  "Meldingen van {naam} instellen": "Set notifications for {naam}",
  "Sensoren en tijden": "Sensors and times",
  "Afval morgen": "Waste tomorrow",
  "Melding de avond ervoor": "Notification the evening before",
  "Afval vandaag": "Waste today",
  "Melding op de dag zelf": "Notification on the day itself",
  "Wie er op de kaart staat. Met het potlood kiest ieder zelf welke meldingen hij krijgt. De telefoon wordt bij de persoon gezocht (de app van Home Assistant); vindt de kaart er geen, dan staat dat op de rij.":
    "Who is on the card. With the pencil, everyone chooses which notifications they get. The phone is looked up from the person (the Home Assistant app); if the card finds none, the row says so.",
  "Een herinnering om de container buiten te zetten: de avond ervoor en de ochtend zelf, met een knop 'Staat buiten' in de melding.":
    "A reminder to put the bin out: the evening before and the morning itself, with a 'Put out' button in the notification.",
  "De sensor die zegt wat er MORGEN opgehaald wordt, zoals sensor.mijnafvalwijzer_morgen. Leeg laten: geen melding de avond ervoor.":
    "The sensor that says what is collected TOMORROW, such as sensor.mijnafvalwijzer_morgen. Leave empty: no notification the evening before.",
  "Standaard 19:30.": "Default 19:30.",
  "De sensor die zegt wat er VANDAAG opgehaald wordt. Leeg laten: geen melding op de dag zelf.":
    "The sensor that says what is collected TODAY. Leave empty: no notification on the day itself.",
  "Standaard 07:30. Vervalt als iemand de avond ervoor in de melding op 'Staat buiten' tikte.":
    "Default 07:30. Skipped if someone tapped 'Put out' in the notification the evening before.",
  "DomotiApp Meldingen": "DomotiApp Notifications",
  "De personen van het huis, met per persoon een potlood: kies welke herinneringen hij op zijn telefoon krijgt. Voorlopig: afval.":
    "The people of the house, each with a pencil: choose which reminders they get on their phone. For now: waste.",

  // meldingen-scherm.js
  "Meldingen op de telefoon": "Notifications on the phone",
  "Stuur een proefmelding": "Send a test notification",
  "Op deze kaart staan nog geen meldingen aan. Zet ze aan in de editor van de kaart.":
    "No notifications are switched on for this card yet. Switch them on in the card's editor.",
  "{soort} voor {naam}: aan": "{soort} for {naam}: on",
  "{soort} voor {naam}: uit": "{soort} for {naam}: off",
  "Versturen…": "Sending…",
};
