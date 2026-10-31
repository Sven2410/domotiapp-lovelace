/**
 * Zoeken in de getekende iconenset, op wat je zoekt in plaats van op hoe het
 * bestand het noemt.
 *
 * De kiezer toonde honderd iconen in elf groepen en verder niets. Dat werkt
 * zolang je weet in welke groep iets zit; zodra je een woord in je hoofd hebt
 * -- "slapen", "wasmachine", "gordijn" -- sta je te scannen. Erger nog: de
 * sleutels zijn Engels (`bulb`, `shutter`, `bin`) en de kaarten zijn Nederlands,
 * dus het woord dat je intypt is precies het woord dat er niet staat.
 *
 * Daarom staat hier per icoon een lijstje woorden waarmee je het mag vinden,
 * en niet alleen zijn naam. Het eerste woord is tegelijk de Nederlandse naam
 * die de kiezer eronder zet. Nederlands en Engels door elkaar, met opzet: de
 * eigenaar typt Nederlands, de sleutels zijn Engels, en beide moeten raak zijn.
 *
 * Geen DOM en geen `hass` in dit bestand -- dit is precies het soort logica dat
 * in een gewone Node-test hoort, en de kiezer eromheen is dat niet.
 *
 * NIEUW ICOON TOEVOEGEN? Drie plekken: `icons.js` (de tekening), `GROEPEN`
 * hieronder (waar hij in het raster staat) en `TERMEN` (waarmee hij te vinden
 * is). Vergeet je de derde, dan is hij alleen op zijn Engelse sleutel te
 * vinden -- dat is wat `ontbrekendeTermen()` bewaakt, en waar de test op valt.
 */

import { nt, t } from "../taal.js";

/**
 * De volgorde van het raster. Gegroepeerd zodat je kunt scannen in plaats van
 * lezen; een icoon mag in twee groepen staan als het in allebei hoort.
 */
export const GROEPEN = [
  [nt("Woning"), ["house", "homeLeave", "homeStatus", "homeThermo", "floorB", "floor1", "floor2", "garage", "door", "window", "stairs", "grid"]],
  [nt("Kamers"), ["bed", "bedDouble", "wardrobe", "hanger", "sofa", "lounge", "eettafel", "kitchen", "shower", "toilet", "desk", "speelkamer", "garage", "storage"]],
  [nt("Buiten"), ["tree", "parasol", "veranda", "fence", "gate", "sun", "awning", "gras", "kruiden", "car", "beach"]],
  [nt("Rolluiken"), ["shutter", "shutterOpen", "awning", "gate", "gateOpen", "garageOpen", "garageClosed", "arrowUp", "arrowDown", "stop"]],
  [nt("Navigatie"), ["arrowLeft", "arrowRight", "arrowUp", "arrowDown", "chevronLeft", "chevronRight", "chevronDown", "house", "grid", "close"]],
  [nt("Licht en stroom"), ["bulb", "bulbGroup", "switchOn", "power", "plug", "bolt", "battery"]],
  [nt("Personen"), ["person", "people", "away", "dier"]],
  [nt("Apparaten"), ["tv", "speaker", "camera", "cctv", "car", "van", "washer", "dishwasher", "stofzuiger", "koelkast", "oven", "magnetron", "printer", "printer3d", "fan", "airco", "radio", "boiler"]],
  [nt("Media"), ["play", "pause", "next", "prev", "volume", "volumeMute", "shuffle", "repeat", "repeatOne", "search", "speakers", "music"]],
  [nt("Afval"), ["bin", "binWheeled", "calendar"]],
  [nt("Verwarming en klimaat"), ["airco", "flame", "snowflake", "floorHeating", "heatPump", "circulatiepomp", "boiler", "thermo", "homeThermo", "celsius", "gas", "pressure", "refill"]],
  [nt("Auto en tanken"), ["car", "petrol", "diesel", "gas", "fuelStation", "raceCar", "plug"]],
  [nt("Weer"), ["sun", "cloud", "cloudSun", "rain", "snow", "fog", "wind", "drop", "uv", "sunrise", "sunset", "thermo"]],
  [nt("Weermetingen"), ["humidity", "lux", "windSpeed", "rainfall", "weatherCode", "forecast", "weatherStation", "rainRadar", "pollenradar", "uv", "pressure", "thermo"]],
  [nt("Status"), ["shield", "alarmOff", "alarmPartial", "alarmOn", "lock", "lockOpen", "key", "wifi", "smoke", "smokeDetector", "co", "warning", "check", "handmatig", "close", "clock", "gaugeArrow", "bell", "bellOff", "pressure", "refill", "sleep", "siren", "sirenOff", "homeStatus"]],
  [nt("Cijfers"), ["een", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen", "tien"]],
  [nt("Sport en vrije tijd"), ["football", "sports", "dumbbell", "raceCar", "beach"]],
  [nt("Overig"), ["star", "moon", "leaf", "cog", "qr", "keuzelijst", "dots", "plus", "minus", "chevronRight", "chevronDown", "question", "pencil", "domotitech"]],
];

/**
 * Waarmee een icoon te vinden is. Het EERSTE woord is de naam die eronder komt.
 *
 * Ruim opgezet: liever een woord te veel dan een zoekopdracht die niets
 * oplevert. Een icoon dat je niet vindt bestaat niet.
 */
export const TERMEN = {
  /* Woning */
  house: [nt("huis"), "woning", "thuis", "home", "hal", "gang", "entree", "overzicht", "house", "hall", "overview"],
  floorB: [nt("begane grond"), "beneden", "vloer", "verdieping", "etage", "ground floor", "downstairs"],
  floor1: [nt("1e verdieping"), "eerste", "boven", "vloer", "etage", "first floor", "1st floor", "upstairs", "floor"],
  floor2: [nt("2e verdieping"), "tweede", "zolder", "vloer", "etage", "second floor", "2nd floor", "attic", "loft", "floor"],
  garage: [nt("garage"), "schuur", "carport", "berging", "shed"],
  door: [nt("deur"), "voordeur", "achterdeur", "toegang", "door", "opening", "front door", "back door", "entrance"],
  window: [nt("raam"), "venster", "ruit", "window", "kozijn"],
  stairs: [nt("trap"), "overloop", "traphal", "stairs", "treden", "boven", "landing", "staircase"],
  grid: [nt("raster"), "kamers", "overzicht", "tegels", "menu", "grid", "apps", "overview", "rooms", "tiles"],

  /* Kamers */
  floorHeating: [nt("vloerverwarming"), "vloer", "verwarming", "vloerverwarmingg", "leidingen", "cv", "warm", "underfloor", "floor heating", "underfloor heating", "heating"],
  heatPump: [nt("warmtepomp"), "pomp", "buitenunit", "heat pump", "verwarming", "koelen", "airco", "hybride", "heating", "cooling"],
  qr: [nt("qr"), "qr-code", "qrcode", "code", "scan", "wifi code", "streepjescode", "gast", "qr code", "guest"],
  siren: [nt("sirene"), "alarm", "alarmsirene", "geluid", "brandalarm", "siren", "aan", "sound"],
  sirenOff: [nt("sirene uit"), "alarm uit", "sirene uitzetten", "stil", "dempen", "siren off", "uitschakelen", "mute", "silent"],
  petrol: [nt("benzine"), "tanken", "brandstof", "pomp", "benzinepomp", "petrol", "euro 95", "brandstofpomp", "fuel", "pump", "gasoline"],
  diesel: [nt("diesel"), "tanken", "brandstof", "pomp", "dieselpomp", "druppel", "fuel", "pump"],
  gas: [nt("gas"), "aardgas", "vlam", "gasverbruik", "gasmeter", "brander", "gaskachel", "natural gas", "gas meter", "flame"],
  fuelStation: [nt("tankstation"), "tanken", "pompstation", "benzinestation", "luifel", "fuel station", "brandstof", "petrol station", "gas station", "fuel"],
  homeThermo: [nt("klimaat"), "klimaat in de woning", "woning thermometer", "binnentemperatuur", "temperatuur", "huis thermometer", "verwarming", "thermostaat", "climate", "indoor temperature", "thermostat", "heating", "temperature"],
  homeStatus: [nt("woning status"), "status", "huis status", "alles in orde", "huisstatus", "woning", "controle", "check", "home status", "all good", "home"],
  lounge: [nt("lounge"), "fauteuil", "stoel", "zithoek", "loungestoel", "zitkamer", "relax", "armchair", "chair"],
  dumbbell: [nt("sportschool"), "halter", "gewicht", "fitness", "gym", "dumbbell", "krachttraining", "sporten", "weights", "workout"],
  storage: [nt("opslag"), "dozen", "berging", "zolder", "kelder", "opbergen", "voorraad", "storage", "kast", "boxes", "attic", "basement", "cupboard"],
  celsius: [nt("celsius"), "graden", "temperatuur", "graad", "c", "thermometer", "warmte", "degrees", "temperature"],
  domotitech: [nt("domotitech"), "logo", "merk", "website", "domoti", "domotica", "brand"],
  beach: [nt("strand"), "zee", "golven", "kust", "vakantie", "zon en zee", "beach", "zomer", "water", "sea", "holiday", "summer", "coast"],
  sleep: [nt("slapen"), "zzz", "slaapstand", "nachtmodus", "slaap", "sleep", "rust", "nacht", "welterusten", "dutje", "night", "rest", "bedtime"],
  boiler: [nt("ketel"), "cv", "cv-ketel", "boiler", "verwarming", "ketelstatus", "boiler status", "vlam", "warmte", "heating", "central heating", "flame"],
  pressure: [nt("druk"), "bar", "waterdruk", "manometer", "meter", "pressure", "keteldruk", "spanning", "water pressure", "gauge"],
  bell: [nt("notificatie"), "melding", "bel", "meldingen", "alert", "waarschuwing", "notification", "bericht", "bell", "message"],
  bellOff: [nt("meldingen uit"), "stil", "niet storen", "geen meldingen", "bel uit", "mute", "gedempt", "notificaties uit", "notifications off", "do not disturb", "silent", "bell off"],
  refill: [nt("bijvullen"), "water bijvullen", "vullen", "water", "peil", "niveau", "reservoir", "refill", "aanvullen", "top up", "water level"],
  football: [nt("voetbal"), "bal", "voetballen", "sport", "wedstrijd", "football", "soccer", "eredivisie", "match", "ball"],
  sports: [nt("sport"), "sporten", "sportief", "bewegen", "tennis", "racket", "wedstrijd", "sports", "verschillende sporten", "match"],
  raceCar: [nt("formule 1"), "f1", "racewagen", "raceauto", "autosport", "race", "grand prix", "verstappen", "circuit", "formula 1", "racing", "race car"],
  cctv: [nt("camera"), "bewakingscamera", "cctv", "beveiliging", "toezicht", "surveillance", "buitencamera", "beveiligingscamera", "security camera", "security"],
  bed: [nt("slaapkamer"), "bed", "slapen", "slaap", "sleep", "bedroom", "nacht", "welterusten", "logeerkamer", "night"],
  bedDouble: [nt("tweepersoonsbed"), "2 persoonsbed", "bed", "slaapkamer", "slapen", "sleep", "double bed", "twee personen", "ouderslaapkamer", "nacht", "bedroom"],
  wardrobe: [nt("kledingkast"), "kast", "garderobe", "kleding", "wardrobe", "closet", "inloopkast", "slaapkamer", "clothes", "bedroom"],
  hanger: [nt("kleerhanger"), "hanger", "kleding", "kleren", "garderobe", "wasgoed", "kledingkast", "outfit", "clothes", "coat hanger", "laundry"],
  sofa: [nt("woonkamer"), "bank", "sofa", "zithoek", "salon", "living", "livingroom", "couch", "living room", "lounge"],
  kitchen: [nt("keuken"), "koken", "pan", "kitchen", "cooking", "eten", "fornuis", "kookplaat", "cook"],
  shower: [nt("badkamer"), "douche", "shower", "bad", "bathroom", "wassen", "sanitair", "bath"],
  toilet: [nt("wc"), "toilet", "sanitair", "badkamer", "restroom", "plee", "loo", "bathroom"],
  desk: [nt("kantoor"), "werkkamer", "bureau", "desk", "office", "computer", "monitor", "beeldscherm", "study", "work"],
  speelkamer: [nt("speelkamer"), "kinderkamer", "speelgoed", "kinderen", "kind", "beer", "teddybeer", "knuffel", "spelen", "playroom", "speelhoek", "kids", "children", "toys", "teddy bear", "nursery"],

  /* Buiten */
  tree: [nt("tuin"), "boom", "buiten", "garden", "tree", "achtertuin", "voortuin", "groen", "natuur", "backyard", "outdoor"],
  parasol: [nt("terras"), "buiten", "parasol", "tuin", "balkon", "veranda", "zonnescherm", "outdoor", "patio", "terrace", "balcony"],
  fence: [nt("erf"), "hek", "buiten", "tuin", "schutting", "oprit", "poort", "fence", "omheining", "yard", "gate", "garden"],

  /* Rolluiken */
  shutter: [nt("rolluik"), "gordijn", "zonwering", "shutter", "screen", "jaloezie", "dicht", "gesloten", "cover", "blind", "curtain", "roller shutter", "closed"],
  shutterOpen: [nt("rolluik open"), "gordijn open", "zonwering", "shutter", "cover", "omhoog", "shutter open", "blind open", "curtain open"],
  awning: [nt("zonnescherm"), "luifel", "markies", "awning", "terras", "zonwering", "buiten", "sunshade", "patio"],
  gate: [nt("poort"), "hek", "toegangspoort", "oprit", "inrit", "gate", "schuifpoort", "draaipoort", "erf", "dicht", "gesloten", "driveway", "closed"],
  gateOpen: [nt("poort open"), "poort", "hek open", "gate open", "oprit", "toegang", "geopend", "open", "driveway", "gate"],
  garageOpen: [nt("garagedeur open"), "garage", "deur open", "omhoog", "geopend", "garage door open", "door open", "open"],
  garageClosed: [nt("garagedeur dicht"), "garage", "deur dicht", "gesloten", "omlaag", "garage door closed", "door closed", "closed"],
  arrowUp: [nt("omhoog"), "pijl omhoog", "open", "up", "boven", "openen", "stijgen", "arrow up"],
  arrowDown: [nt("omlaag"), "pijl omlaag", "dicht", "down", "beneden", "sluiten", "dalen", "arrow down", "close"],
  stop: [nt("stop"), "stoppen", "halt", "vierkant", "square"],

  /* Licht en stroom */
  bulb: [nt("lamp"), "licht", "verlichting", "peer", "light", "bulb", "spot", "schemerlamp", "lighting"],
  bulbGroup: [nt("lampen"), "lichtgroep", "verlichting", "groep", "lights", "alle lampen", "lamps", "light group", "all lights"],
  switchOn: [nt("schakelaar"), "knop", "switch", "aan uit", "toggle", "aanuit", "on off"],
  power: [nt("aan uit"), "power", "stroom", "uitknop", "aanknop", "standby", "on off"],
  plug: [nt("stopcontact"), "stekker", "plug", "socket", "outlet", "smart plug"],
  bolt: [nt("stroom"), "energie", "bliksem", "elektriciteit", "verbruik", "power", "energy", "watt", "kwh", "electricity", "usage"],
  battery: [nt("batterij"), "accu", "battery", "lading", "opladen", "percentage", "charge", "charging"],

  /* Personen */
  person: [nt("persoon"), "iemand", "gebruiker", "person", "wie", "profiel", "aanwezig", "user", "profile", "someone"],
  people: [nt("personen"), "mensen", "gezin", "iedereen", "familie", "people", "gasten", "family", "everyone", "guests"],
  away: [nt("weg"), "afwezig", "niet thuis", "away", "vertrokken", "uit huis", "not home", "out", "gone"],
  dier: [nt("dier"), "huisdier", "hond", "kat", "poot", "pootafdruk", "pet", "animal", "beest", "dog", "cat", "paw"],
  homeLeave: [nt("woning verlaten"), "verlaten", "weggaan", "vertrekken", "huis uit", "afsluiten", "de deur uit", "leave", "exit", "weg", "huis", "leave home", "away", "home"],

  /* Apparaten */
  tv: [nt("televisie"), "tv", "scherm", "kijken", "netflix", "mediaspeler", "chromecast", "television", "screen"],
  speaker: [nt("speaker"), "luidspreker", "boxje", "geluid", "audio", "sonos", "sound"],
  camera: [nt("camera"), "beveiliging", "bewaking", "cctv", "deurbel", "opname", "beeld", "security", "doorbell"],
  car: [nt("auto"), "wagen", "car", "laadpaal", "opladen", "voertuig", "oprit", "buiten", "vehicle", "charger", "driveway"],
  washer: [nt("wasmachine"), "was", "wassen", "washer", "wasdroger", "droger", "laundry", "wasruimte", "washing machine", "dryer"],
  dishwasher: [nt("vaatwasser"), "afwas", "vaat", "dishwasher", "afwasmachine", "dishes", "kitchen"],
  stofzuiger: [nt("robotstofzuiger"), "stofzuiger", "robot", "zuigen", "dweilen", "vacuum", "dreame", "roomba", "robot vacuum", "hoover", "mop"],
  van: [nt("bus"), "bedrijfsbus", "bestelbus", "bestelwagen", "busje", "transit", "auto", "van", "camper", "werkbus", "vehicle"],
  handmatig: [nt("handmatig"), "hand", "zelf", "met de hand", "bedienen", "tikken", "manueel", "handbediening", "override", "manual"],
  koelkast: [nt("koelkast"), "koeling", "vriezer", "diepvries", "fridge", "keuken", "vriescombinatie", "freezer", "refrigerator", "kitchen"],
  oven: [nt("oven"), "bakoven", "fornuis", "keuken", "bakken", "stoomoven", "baking", "cooker", "kitchen"],
  magnetron: [nt("magnetron"), "microgolf", "opwarmen", "keuken", "combimagnetron", "microwave", "kitchen"],
  eettafel: [nt("eettafel"), "tafel", "eten", "eetkamer", "diner", "keukentafel", "stoelen", "dining table", "table", "dining room", "dinner"],
  veranda: [nt("veranda"), "overkapping", "terrasoverkapping", "afdak", "carport", "buiten", "tuinkamer", "canopy", "porch", "outdoor"],
  pollenradar: [nt("pollen"), "pollenradar", "hooikoorts", "allergie", "stuifmeel", "radar", "verwachting", "hay fever", "allergy", "pollen radar"],
  gras: [nt("gras"), "graspollen", "grasmaaier", "gazon", "hooikoorts", "pollen", "tuin", "grass", "lawn", "garden"],
  kruiden: [nt("kruiden"), "kruidpollen", "bijvoet", "onkruid", "plant", "pollen", "hooikoorts", "herbs", "weeds"],
  circulatiepomp: [nt("circulatiepomp"), "pomp", "cv", "cv-pomp", "verwarming", "circulatie", "vloerverwarming", "circulation pump", "pump", "heating"],
  printer: [nt("printer"), "printen", "papier", "print", "paper"],
  printer3d: [nt("3d printer"), "3d-printer", "bambu", "prusa", "filament", "printer", "nozzle", "printen"],
  fan: [nt("ventilator"), "fan", "ventilatie", "afzuiging", "wtw", "luchtverversing", "koelen", "ventilation", "extractor", "cooling"],
  airco: [nt("airco"), "airconditioning", "koeling", "warmtepomp", "klimaat", "verwarming", "hvac", "air con", "air conditioning", "cooling", "heat pump", "climate"],
  flame: [nt("vlam"), "verwarmen", "warm", "vuur", "haard", "heat", "flame", "stoken", "fire", "fireplace", "heating"],
  snowflake: [nt("sneeuwvlok"), "koelen", "koud", "vorst", "cool", "snowflake", "ijs", "cold", "frost", "ice"],
  radio: [nt("radio"), "zender", "fm", "stream", "muziek", "antenne", "station", "music"],

  /* Media */
  play: [nt("afspelen"), "play", "start", "spelen", "muziek", "starten", "music"],
  pause: [nt("pauze"), "pause", "pauzeren", "stil", "onderbreken"],
  next: [nt("volgende"), "next", "verder", "vooruit", "overslaan", "skip", "forward"],
  prev: [nt("vorige"), "previous", "terug", "achteruit", "prev", "back"],
  volume: [nt("volume"), "geluid", "harder", "luid", "audio", "sound", "loud"],
  volumeMute: [nt("stil"), "mute", "gedempt", "geluid uit", "dempen", "silent", "sound off"],
  shuffle: [nt("willekeurig"), "shuffle", "husselen", "door elkaar", "random"],
  repeat: [nt("herhalen"), "repeat", "loop", "opnieuw", "herhaling"],
  repeatOne: [nt("een herhalen"), "repeat one", "herhalen", "loop", "dit nummer", "repeat"],
  search: [nt("zoeken"), "zoek", "search", "vergrootglas", "vinden", "opzoeken", "magnifier", "find"],
  speakers: [nt("speakers"), "groep", "multiroom", "luidsprekers", "audio", "koppelen", "group"],
  music: [nt("muziek"), "noot", "music", "nummer", "liedje", "spotify", "audio", "song", "note"],

  /* Afval */
  bin: [nt("afval"), "vuilnis", "prullenbak", "bak", "container", "waste", "trash", "kliko", "bin", "rubbish"],
  binWheeled: [nt("kliko"), "container", "afval", "vuilnisbak", "rolcontainer", "ophaaldag", "waste", "wheelie bin", "bin", "collection day"],
  calendar: [nt("agenda"), "kalender", "datum", "afspraak", "planning", "calendar", "dag", "date", "appointment"],

  /* Weer */
  sun: [nt("zon"), "zonnig", "helder", "sun", "zonnepanelen", "dag", "weer", "buiten", "sunny", "clear", "solar", "weather"],
  cloud: [nt("bewolkt"), "wolk", "cloud", "betrokken", "grijs", "weer", "cloudy", "weather"],
  cloudSun: [nt("halfbewolkt"), "wolk", "zon", "weer", "wisselend", "partly cloudy", "weather"],
  rain: [nt("regen"), "buien", "nat", "rain", "neerslag", "weer", "paraplu", "showers", "wet", "weather"],
  snow: [nt("sneeuw"), "winter", "vorst", "snow", "koud", "ijs", "weer", "cold", "weather"],
  fog: [nt("mist"), "nevel", "fog", "zicht", "weer", "weather"],
  wind: [nt("wind"), "waait", "storm", "bries", "windkracht", "weer", "breeze", "weather"],
  drop: [nt("druppel"), "vocht", "luchtvochtigheid", "water", "regen", "humidity", "nat", "lekkage", "drop", "leak"],
  uv: [nt("uv"), "uv index", "zon", "straling", "zonkracht", "huid", "sun"],
  humidity: [nt("vochtigheid"), "luchtvochtigheid", "vocht", "humidity", "procent", "rv", "hygrometer", "weer", "weather"],
  lux: [nt("lux"), "lichtsterkte", "helderheid", "verlichtingssterkte", "illuminance", "lichtsensor", "lichtmeter", "lumen", "brightness", "light sensor"],
  windSpeed: [nt("windsnelheid"), "wind", "windkracht", "beaufort", "anemometer", "wind speed", "km/u", "storm", "weer", "weather"],
  rainfall: [nt("regen"), "neerslag", "regenmeter", "millimeter", "mm", "rainfall", "buien", "hoeveelheid", "weer", "rain", "rain gauge", "weather"],
  weatherCode: [nt("weercode"), "code", "weather code", "weertype", "conditie", "weer", "weather"],
  forecast: [nt("voorspelling"), "verwachting", "forecast", "vooruitzicht", "morgen", "weerbericht", "weer", "weather", "tomorrow"],
  weatherStation: [nt("weerstation"), "station", "meetstation", "weather station", "mast", "anemometer", "weer", "weather"],
  rainRadar: [nt("buienradar"), "regenradar", "radar", "buien", "neerslagradar", "rain radar", "weer", "weather"],
  sunrise: [nt("zonsopkomst"), "opkomst", "ochtend", "sunrise", "dageraad", "vroeg", "morning"],
  sunset: [nt("zonsondergang"), "ondergang", "avond", "sunset", "schemer", "evening", "dusk"],
  thermo: [nt("temperatuur"), "thermometer", "graden", "warm", "koud", "thermostaat", "klimaat", "verwarming", "temperature", "thermostat", "heating"],

  /* Status */
  shield: [nt("beveiliging"), "schild", "alarm", "veilig", "bescherming", "shield", "security", "safe"],
  lock: [nt("slot"), "op slot", "vergrendeld", "gesloten", "lock", "sleutel", "dicht", "beveiligd", "locked", "closed"],
  lockOpen: [nt("slot open"), "ontgrendeld", "geopend", "unlock", "los", "open", "unlocked", "lock open"],
  key: [nt("sleutel"), "key", "toegang", "code", "wachtwoord", "slot", "access", "password"],
  wifi: [nt("wifi"), "netwerk", "internet", "verbinding", "router", "signaal", "wlan", "network"],
  smoke: [nt("rookmelder"), "rook", "brand", "smoke", "melder", "vuur", "alarm", "smoke detector", "fire"],
  smokeDetector: [nt("rookmelder"), "melder", "rook", "brand", "smoke detector", "detector", "plafond", "alarm", "smoke", "fire"],
  co: [nt("koolmonoxide"), "co", "gas", "melder", "cv", "kachel", "carbon monoxide", "vergiftiging", "detector"],
  warning: [nt("waarschuwing"), "let op", "attentie", "warning", "uitroepteken", "storing", "probleem", "attention", "fault", "problem"],
  check: [nt("goed"), "vinkje", "in orde", "klaar", "check", "gelukt", "done", "ok", "good"],
  close: [nt("sluiten"), "kruis", "dicht", "annuleren", "close", "weg", "cross", "cancel"],
  clock: [nt("klok"), "tijd", "uur", "wekker", "timer", "clock", "wanneer", "time"],
  gaugeArrow: [nt("meter"), "wijzer", "stand", "gauge", "niveau", "druk", "snelheid", "level", "speed"],

  /* Cijfers */
  een: ["1", "een", "eerste", "one"],
  twee: ["2", "twee", "tweede", "two"],
  drie: ["3", "drie", "derde", "three"],
  vier: ["4", "vier", "vierde", "four"],
  vijf: ["5", "vijf", "vijfde", "five"],
  zes: ["6", "zes", "zesde", "six"],
  zeven: ["7", "zeven", "zevende", "seven"],
  acht: ["8", "acht", "achtste", "eight"],
  negen: ["9", "negen", "negende", "nine"],
  tien: ["10", "tien", "tiende", "ten"],

  /* Overig */
  star: [nt("ster"), "favoriet", "star", "belangrijk", "voorkeur", "top", "favourite", "favorite"],
  moon: [nt("maan"), "nacht", "slapen", "donker", "moon", "nachtstand", "avond", "night", "dark", "evening"],
  leaf: [nt("blad"), "groen", "eco", "duurzaam", "plant", "natuur", "besparen", "tuin", "leaf", "green", "garden"],
  keuzelijst: [nt("keuzelijst"), "keuze", "lijst", "modus", "stand", "programma", "dropdown", "select", "kiezen", "opties", "list", "mode", "options"],
  cog: [nt("instellingen"), "tandwiel", "beheer", "settings", "configuratie", "opties", "systeem", "cog", "gear", "options"],

  /* Navigatie. "terug" staat voorop bij de pijl naar links, want dat is
     waarvoor je hem zoekt. */
  arrowLeft: [nt("terug"), "pijl links", "links", "vorige", "back", "arrow left", "left"],
  arrowRight: [nt("verder"), "pijl rechts", "rechts", "volgende", "next", "arrow right", "forward", "right"],
  chevronLeft: [nt("pijltje links"), "links", "terug", "inklappen", "chevron left", "left", "back"],

  /* De drie standen van een alarmsysteem. De Nederlandse woorden staan voorop
     omdat dat is wat er op de badge komt te staan; "armed_away" en
     "armed_custom_bypass" staan erbij omdat dat de toestanden zijn die je in
     het sjabloon uitschrijft, en dan is dat het woord dat je in je hoofd hebt. */
  alarmOff: [nt("alarm uit"), "alarm uitgeschakeld", "uitgeschakeld", "ontwapend", "disarmed", "alarm", "beveiliging", "shield", "alarm off"],
  alarmPartial: [nt("alarm deels"), "deelinschakeling", "1e schil", "eerste schil", "thuis", "nachtstand", "armed home", "armed_custom_bypass", "bypass", "alarm", "beveiliging", "alarm partial", "part armed", "night"],
  alarmOn: [nt("alarm aan"), "alarm ingeschakeld", "volledig aan", "ingeschakeld", "armed", "armed_away", "afwezig", "alarm", "beveiliging", "alarm on", "armed away"],
  dots: [nt("meer"), "drie puntjes", "menu", "opties", "extra", "overig", "more", "options"],
  plus: [nt("plus"), "meer", "erbij", "toevoegen", "hoger", "omhoog", "add", "more", "up"],
  minus: [nt("min"), "minder", "eraf", "lager", "verwijderen", "omlaag", "minus", "remove", "less", "down"],
  chevronRight: [nt("pijl rechts"), "verder", "volgende", "chevron", "open", "meer", "arrow right", "next", "more"],
  chevronDown: [nt("pijl omlaag"), "uitklappen", "openklappen", "chevron", "meer", "dropdown", "arrow down", "expand"],
  question: [nt("vraagteken"), "onbekend", "hulp", "help", "vraag", "geen idee", "question mark", "unknown", "question"],
  pencil: [nt("potlood"), "bewerken", "wijzigen", "aanpassen", "edit", "pen", "instellen", "pencil", "change"],
};

/**
 * Alles naar een schrijfwijze: kleine letters, zonder accenten, zonder
 * dubbele spaties. Anders vindt "cafe" de "cafe" met accent niet, en "Slapen"
 * de "slapen" niet.
 */
export const normaliseer = (tekst) =>
  String(tekst ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Hoe goed dit icoon bij een zoekwoord past. 0 is niet.
 *
 * Drie treden, en de reden dat het er drie zijn: wie "bed" typt wil het bed
 * bovenaan, niet een ander icoon waar "bed" toevallig middenin een woord zit.
 * Een term die precies gelijk is wint van een term die ermee begint, en die
 * wint weer van een term waar het ergens in zit.
 */
export function scoreWoord(sleutel, woord) {
  // De Nederlandse naam staat vooraan in TERMEN; de sleutel zelf hangt er
  // achteraan, want die is Engels en is de laatste waar iemand op zoekt.
  const termen = [...(TERMEN[sleutel] ?? []).map(normaliseer), normaliseer(sleutel)];
  let beste = 0;
  for (let i = 0; i < termen.length; i++) {
    const term = termen[i];
    if (!term) continue;
    let trede = 0;
    // Een term als "begane grond" is twee woorden; die tellen ook los mee,
    // anders vindt "grond" de begane grond niet.
    for (const deel of [term, ...term.split(" ")]) {
      if (deel === woord) trede = Math.max(trede, 3);
      else if (deel.startsWith(woord)) trede = Math.max(trede, 2);
      else if (deel.includes(woord)) trede = Math.max(trede, 1);
    }
    // Waar de term staat weegt mee, maar nooit zoveel dat hij een tree
    // overspringt. "buiten" is voor de parasol het tweede woord en voor de
    // auto het achtste: allebei raak, maar niet even raak.
    if (trede) beste = Math.max(beste, trede + 0.5 / (1 + i));
    if (beste >= 3.5) break;
  }
  return beste;
}

/**
 * De score van een icoon voor de hele zoekopdracht, of 0.
 *
 * ELK woord moet raak zijn. "lamp keuken" hoort niet elke lamp en elke keuken
 * op te leveren maar alleen wat aan allebei voldoet -- en levert dat niets op,
 * dan is een leeg antwoord eerlijker dan honderd iconen.
 */
export function scoreIcoon(sleutel, woorden) {
  let som = 0;
  for (const woord of woorden) {
    const s = scoreWoord(sleutel, woord);
    if (!s) return 0;
    som += s;
  }
  return som;
}

/**
 * Zoeken in de hele bibliotheek van Home Assistant: `iconList.json`, `{name, keywords}` per icoon.
 * Elk woord moet in de naam of de trefwoorden staan; de naam gaat voor. Die lijst is Engels, en onze
 * eigen set hierboven vangt het Nederlands.
 *
 * @returns {string[]} de namen zonder `mdi:`, de beste bovenaan
 */
export function zoekMdi(lijst, vraag) {
  const woorden = normaliseer(String(vraag ?? "").replace(/^\s*mdi:/i, "")).split(" ").filter(Boolean);
  if (!woorden.length) return (lijst ?? []).map((i) => i.name);
  const treffers = [];
  for (const icoon of lijst ?? []) {
    const naam = normaliseer(icoon.name);
    const trefwoorden = normaliseer((icoon.keywords ?? []).join(" "));
    let score = 0;
    for (const woord of woorden) {
      let hier = 0;
      if (naam === woord) hier = 4;
      else if (naam.startsWith(woord)) hier = 3;
      else if (naam.includes(woord)) hier = 2;
      else if (trefwoorden.includes(woord)) hier = 1;
      if (!hier) {
        score = 0;
        break;
      }
      score += hier;
    }
    if (score) treffers.push({ naam: icoon.name, score });
  }
  treffers.sort((a, b) => b.score - a.score || a.naam.length - b.naam.length || a.naam.localeCompare(b.naam));
  return treffers.map((x) => x.naam);
}

/** De naam die onder een icoon hoort. Valt terug op de sleutel zelf. */
export const naamVan = (sleutel) => TERMEN[sleutel]?.[0] ?? sleutel;

/** Elke sleutel die ergens in het raster staat, zonder dubbelen. */
export function alleSleutels(groepen = GROEPEN) {
  const uit = [];
  for (const [, keys] of groepen) for (const k of keys) if (!uit.includes(k)) uit.push(k);
  return uit;
}

/**
 * Wat de kiezer moet tekenen: dezelfde groepenvorm, gefilterd.
 *
 * Zonder zoekopdracht komen de groepen ongewijzigd terug -- het raster is dan
 * wat het altijd was. Met zoekopdracht komt er een groep uit, op volgorde van
 * hoe goed het past. Groepen aanhouden tijdens het zoeken zou drie koppen met
 * elk een icoon geven, en dat leest slechter dan een rij van drie.
 */
export function zoekIconen(vraag, groepen = GROEPEN) {
  const woorden = normaliseer(vraag).split(" ").filter(Boolean);
  if (!woorden.length) return groepen;

  const treffers = [];
  for (const sleutel of alleSleutels(groepen)) {
    const score = scoreIcoon(sleutel, woorden);
    if (score) treffers.push({ sleutel, score });
  }
  // Bij gelijke score alfabetisch op de Nederlandse naam, zodat dezelfde
  // zoekopdracht altijd dezelfde volgorde geeft.
  treffers.sort(
    (a, b) => b.score - a.score || naamVan(a.sleutel).localeCompare(naamVan(b.sleutel))
  );
  return [[t("{n} gevonden", { n: treffers.length }), treffers.map((treffer) => treffer.sleutel)]];
}

/**
 * Iconen die getekend zijn maar geen zoekwoorden hebben, of andersom.
 *
 * Bestaat voor de test. Een icoon zonder termen is alleen op zijn Engelse
 * sleutel te vinden en is daarmee in de praktijk onvindbaar; een naam in het
 * raster zonder tekening levert een lege plek op.
 */
export function ontbrekendeTermen(getekend) {
  const inRaster = alleSleutels();
  return {
    zonderTermen: inRaster.filter((k) => !TERMEN[k]?.length),
    zonderTekening: inRaster.filter((k) => !getekend.includes(k)),
    nietInRaster: getekend.filter((k) => !inRaster.includes(k)),
  };
}
