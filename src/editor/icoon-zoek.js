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

/**
 * De volgorde van het raster. Gegroepeerd zodat je kunt scannen in plaats van
 * lezen; een icoon mag in twee groepen staan als het in allebei hoort.
 */
export const GROEPEN = [
  ["Woning", ["house", "homeLeave", "homeStatus", "homeThermo", "floorB", "floor1", "floor2", "garage", "door", "window", "stairs", "grid"]],
  ["Kamers", ["bed", "bedDouble", "wardrobe", "hanger", "sofa", "lounge", "eettafel", "kitchen", "shower", "toilet", "desk", "speelkamer", "garage", "storage"]],
  ["Buiten", ["tree", "parasol", "veranda", "fence", "gate", "sun", "awning", "gras", "kruiden", "car", "beach"]],
  ["Rolluiken", ["shutter", "shutterOpen", "awning", "gate", "gateOpen", "garageOpen", "garageClosed", "arrowUp", "arrowDown", "stop"]],
  ["Licht en stroom", ["bulb", "bulbGroup", "switchOn", "power", "plug", "bolt", "battery"]],
  ["Personen", ["person", "people", "away", "dier"]],
  ["Apparaten", ["tv", "speaker", "camera", "cctv", "car", "van", "washer", "dishwasher", "koelkast", "oven", "magnetron", "printer", "printer3d", "fan", "airco", "radio", "boiler"]],
  ["Media", ["play", "pause", "next", "prev", "volume", "volumeMute", "shuffle", "repeat", "repeatOne", "search", "speakers", "music"]],
  ["Afval", ["bin", "binWheeled", "calendar"]],
  ["Verwarming en klimaat", ["floorHeating", "heatPump", "circulatiepomp", "boiler", "thermo", "homeThermo", "celsius", "gas", "pressure", "refill"]],
  ["Auto en tanken", ["car", "petrol", "diesel", "gas", "fuelStation", "raceCar", "plug"]],
  ["Weer", ["sun", "cloud", "cloudSun", "rain", "snow", "fog", "wind", "drop", "uv", "sunrise", "sunset", "thermo"]],
  ["Weermetingen", ["humidity", "lux", "windSpeed", "rainfall", "weatherCode", "forecast", "weatherStation", "rainRadar", "pollenradar", "uv", "pressure", "thermo"]],
  ["Status", ["shield", "lock", "lockOpen", "key", "wifi", "smoke", "smokeDetector", "co", "warning", "check", "handmatig", "close", "clock", "gaugeArrow", "bell", "pressure", "refill", "sleep", "siren", "sirenOff", "homeStatus"]],
  ["Cijfers", ["een", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen", "tien"]],
  ["Sport en vrije tijd", ["football", "sports", "dumbbell", "raceCar", "beach"]],
  ["Overig", ["star", "moon", "leaf", "cog", "qr", "keuzelijst", "dots", "plus", "minus", "chevronRight", "chevronDown", "question", "pencil", "domotitech"]],
];

/**
 * Waarmee een icoon te vinden is. Het EERSTE woord is de naam die eronder komt.
 *
 * Ruim opgezet: liever een woord te veel dan een zoekopdracht die niets
 * oplevert. Een icoon dat je niet vindt bestaat niet.
 */
export const TERMEN = {
  /* Woning */
  house: ["huis", "woning", "thuis", "home", "hal", "gang", "entree", "overzicht"],
  floorB: ["begane grond", "beneden", "vloer", "verdieping", "etage", "ground floor"],
  floor1: ["1e verdieping", "eerste", "boven", "vloer", "etage", "first floor"],
  floor2: ["2e verdieping", "tweede", "zolder", "vloer", "etage", "second floor"],
  garage: ["garage", "schuur", "carport", "berging"],
  door: ["deur", "voordeur", "achterdeur", "toegang", "door", "opening"],
  window: ["raam", "venster", "ruit", "window", "kozijn"],
  stairs: ["trap", "overloop", "traphal", "stairs", "treden", "boven"],
  grid: ["raster", "kamers", "overzicht", "tegels", "menu", "grid", "apps"],

  /* Kamers */
  floorHeating: ["vloerverwarming", "vloer", "verwarming", "vloerverwarmingg", "leidingen", "cv", "warm", "underfloor", "floor heating"],
  heatPump: ["warmtepomp", "pomp", "buitenunit", "heat pump", "verwarming", "koelen", "airco", "hybride"],
  qr: ["qr", "qr-code", "qrcode", "code", "scan", "wifi code", "streepjescode", "gast"],
  siren: ["sirene", "alarm", "alarmsirene", "geluid", "brandalarm", "siren", "aan"],
  sirenOff: ["sirene uit", "alarm uit", "sirene uitzetten", "stil", "dempen", "siren off", "uitschakelen"],
  petrol: ["benzine", "tanken", "brandstof", "pomp", "benzinepomp", "petrol", "euro 95", "brandstofpomp"],
  diesel: ["diesel", "tanken", "brandstof", "pomp", "dieselpomp", "druppel"],
  gas: ["gas", "aardgas", "vlam", "gasverbruik", "gasmeter", "brander", "gaskachel"],
  fuelStation: ["tankstation", "tanken", "pompstation", "benzinestation", "luifel", "fuel station", "brandstof"],
  homeThermo: ["klimaat", "klimaat in de woning", "woning thermometer", "binnentemperatuur", "temperatuur", "huis thermometer", "verwarming", "thermostaat"],
  homeStatus: ["woning status", "status", "huis status", "alles in orde", "huisstatus", "woning", "controle", "check"],
  lounge: ["lounge", "fauteuil", "stoel", "zithoek", "loungestoel", "zitkamer", "relax"],
  dumbbell: ["sportschool", "halter", "gewicht", "fitness", "gym", "dumbbell", "krachttraining", "sporten"],
  storage: ["opslag", "dozen", "berging", "zolder", "kelder", "opbergen", "voorraad", "storage", "kast"],
  celsius: ["celsius", "graden", "temperatuur", "graad", "c", "thermometer", "warmte"],
  domotitech: ["domotitech", "logo", "merk", "website", "domoti", "domotica"],
  beach: ["strand", "zee", "golven", "kust", "vakantie", "zon en zee", "beach", "zomer", "water"],
  sleep: ["slapen", "zzz", "slaapstand", "nachtmodus", "slaap", "sleep", "rust", "nacht", "welterusten", "dutje"],
  boiler: ["ketel", "cv", "cv-ketel", "boiler", "verwarming", "ketelstatus", "boiler status", "vlam", "warmte"],
  pressure: ["druk", "bar", "waterdruk", "manometer", "meter", "pressure", "keteldruk", "spanning"],
  bell: ["notificatie", "melding", "bel", "meldingen", "alert", "waarschuwing", "notification", "bericht"],
  refill: ["bijvullen", "water bijvullen", "vullen", "water", "peil", "niveau", "reservoir", "refill", "aanvullen"],
  football: ["voetbal", "bal", "voetballen", "sport", "wedstrijd", "football", "soccer", "eredivisie"],
  sports: ["sport", "sporten", "sportief", "bewegen", "tennis", "racket", "wedstrijd", "sports", "verschillende sporten"],
  raceCar: ["formule 1", "f1", "racewagen", "raceauto", "autosport", "race", "grand prix", "verstappen", "circuit"],
  cctv: ["camera", "bewakingscamera", "cctv", "beveiliging", "toezicht", "surveillance", "buitencamera", "beveiligingscamera"],
  bed: ["slaapkamer", "bed", "slapen", "slaap", "sleep", "bedroom", "nacht", "welterusten", "logeerkamer"],
  bedDouble: ["tweepersoonsbed", "2 persoonsbed", "bed", "slaapkamer", "slapen", "sleep", "double bed", "twee personen", "ouderslaapkamer", "nacht"],
  wardrobe: ["kledingkast", "kast", "garderobe", "kleding", "wardrobe", "closet", "inloopkast", "slaapkamer"],
  hanger: ["kleerhanger", "hanger", "kleding", "kleren", "garderobe", "wasgoed", "kledingkast", "outfit"],
  sofa: ["woonkamer", "bank", "sofa", "zithoek", "salon", "living", "livingroom", "couch"],
  kitchen: ["keuken", "koken", "pan", "kitchen", "cooking", "eten", "fornuis", "kookplaat"],
  shower: ["badkamer", "douche", "shower", "bad", "bathroom", "wassen", "sanitair"],
  toilet: ["wc", "toilet", "sanitair", "badkamer", "restroom", "plee"],
  desk: ["kantoor", "werkkamer", "bureau", "desk", "office", "computer", "monitor", "beeldscherm"],
  speelkamer: ["speelkamer", "kinderkamer", "speelgoed", "kinderen", "kind", "beer", "teddybeer", "knuffel", "spelen", "playroom", "speelhoek"],

  /* Buiten */
  tree: ["tuin", "boom", "buiten", "garden", "tree", "achtertuin", "voortuin", "groen", "natuur"],
  parasol: ["terras", "buiten", "parasol", "tuin", "balkon", "veranda", "zonnescherm", "outdoor", "patio"],
  fence: ["erf", "hek", "buiten", "tuin", "schutting", "oprit", "poort", "fence", "omheining"],

  /* Rolluiken */
  shutter: ["rolluik", "gordijn", "zonwering", "shutter", "screen", "jaloezie", "dicht", "gesloten", "cover"],
  shutterOpen: ["rolluik open", "gordijn open", "zonwering", "shutter", "cover", "omhoog"],
  awning: ["zonnescherm", "luifel", "markies", "awning", "terras", "zonwering", "buiten"],
  gate: ["poort", "hek", "toegangspoort", "oprit", "inrit", "gate", "schuifpoort", "draaipoort", "erf", "dicht", "gesloten"],
  gateOpen: ["poort open", "poort", "hek open", "gate open", "oprit", "toegang", "geopend", "open"],
  garageOpen: ["garagedeur open", "garage", "deur open", "omhoog", "geopend"],
  garageClosed: ["garagedeur dicht", "garage", "deur dicht", "gesloten", "omlaag"],
  arrowUp: ["omhoog", "pijl omhoog", "open", "up", "boven", "openen", "stijgen"],
  arrowDown: ["omlaag", "pijl omlaag", "dicht", "down", "beneden", "sluiten", "dalen"],
  stop: ["stop", "stoppen", "halt", "vierkant", "square"],

  /* Licht en stroom */
  bulb: ["lamp", "licht", "verlichting", "peer", "light", "bulb", "spot", "schemerlamp"],
  bulbGroup: ["lampen", "lichtgroep", "verlichting", "groep", "lights", "alle lampen"],
  switchOn: ["schakelaar", "knop", "switch", "aan uit", "toggle", "aanuit"],
  power: ["aan uit", "power", "stroom", "uitknop", "aanknop", "standby"],
  plug: ["stopcontact", "stekker", "plug", "socket", "outlet", "smart plug"],
  bolt: ["stroom", "energie", "bliksem", "elektriciteit", "verbruik", "power", "energy", "watt", "kwh"],
  battery: ["batterij", "accu", "battery", "lading", "opladen", "percentage"],

  /* Personen */
  person: ["persoon", "iemand", "gebruiker", "person", "wie", "profiel", "aanwezig"],
  people: ["personen", "mensen", "gezin", "iedereen", "familie", "people", "gasten"],
  away: ["weg", "afwezig", "niet thuis", "away", "vertrokken", "uit huis"],
  dier: ["dier", "huisdier", "hond", "kat", "poot", "pootafdruk", "pet", "animal", "beest"],
  homeLeave: ["woning verlaten", "verlaten", "weggaan", "vertrekken", "huis uit", "afsluiten", "de deur uit", "leave", "exit", "weg", "huis"],

  /* Apparaten */
  tv: ["televisie", "tv", "scherm", "kijken", "netflix", "mediaspeler", "chromecast"],
  speaker: ["speaker", "luidspreker", "boxje", "geluid", "audio", "sonos"],
  camera: ["camera", "beveiliging", "bewaking", "cctv", "deurbel", "opname", "beeld"],
  car: ["auto", "wagen", "car", "laadpaal", "opladen", "voertuig", "oprit", "buiten"],
  washer: ["wasmachine", "was", "wassen", "washer", "wasdroger", "droger", "laundry", "wasruimte"],
  dishwasher: ["vaatwasser", "afwas", "vaat", "dishwasher", "afwasmachine"],
  van: ["bus", "bedrijfsbus", "bestelbus", "bestelwagen", "busje", "transit", "auto", "van", "camper", "werkbus"],
  handmatig: ["handmatig", "hand", "zelf", "met de hand", "bedienen", "tikken", "manueel", "handbediening", "override"],
  koelkast: ["koelkast", "koeling", "vriezer", "diepvries", "fridge", "keuken", "vriescombinatie"],
  oven: ["oven", "bakoven", "fornuis", "keuken", "bakken", "stoomoven"],
  magnetron: ["magnetron", "microgolf", "opwarmen", "keuken", "combimagnetron"],
  eettafel: ["eettafel", "tafel", "eten", "eetkamer", "diner", "keukentafel", "stoelen"],
  veranda: ["veranda", "overkapping", "terrasoverkapping", "afdak", "carport", "buiten", "tuinkamer"],
  pollenradar: ["pollen", "pollenradar", "hooikoorts", "allergie", "stuifmeel", "radar", "verwachting"],
  gras: ["gras", "graspollen", "grasmaaier", "gazon", "hooikoorts", "pollen", "tuin"],
  kruiden: ["kruiden", "kruidpollen", "bijvoet", "onkruid", "plant", "pollen", "hooikoorts"],
  circulatiepomp: ["circulatiepomp", "pomp", "cv", "cv-pomp", "verwarming", "circulatie", "vloerverwarming"],
  printer: ["printer", "printen", "papier", "print"],
  printer3d: ["3d printer", "3d-printer", "bambu", "prusa", "filament", "printer", "nozzle", "printen"],
  fan: ["ventilator", "fan", "ventilatie", "afzuiging", "wtw", "luchtverversing", "koelen"],
  airco: ["airco", "airconditioning", "koeling", "warmtepomp", "klimaat", "verwarming", "hvac"],
  radio: ["radio", "zender", "fm", "stream", "muziek", "antenne"],

  /* Media */
  play: ["afspelen", "play", "start", "spelen", "muziek", "starten"],
  pause: ["pauze", "pause", "pauzeren", "stil", "onderbreken"],
  next: ["volgende", "next", "verder", "vooruit", "overslaan", "skip"],
  prev: ["vorige", "previous", "terug", "achteruit", "prev"],
  volume: ["volume", "geluid", "harder", "luid", "audio", "sound"],
  volumeMute: ["stil", "mute", "gedempt", "geluid uit", "dempen"],
  shuffle: ["willekeurig", "shuffle", "husselen", "door elkaar", "random"],
  repeat: ["herhalen", "repeat", "loop", "opnieuw", "herhaling"],
  repeatOne: ["een herhalen", "repeat one", "herhalen", "loop", "dit nummer"],
  search: ["zoeken", "zoek", "search", "vergrootglas", "vinden", "opzoeken"],
  speakers: ["speakers", "groep", "multiroom", "luidsprekers", "audio", "koppelen"],
  music: ["muziek", "noot", "music", "nummer", "liedje", "spotify", "audio"],

  /* Afval */
  bin: ["afval", "vuilnis", "prullenbak", "bak", "container", "waste", "trash", "kliko"],
  binWheeled: ["kliko", "container", "afval", "vuilnisbak", "rolcontainer", "ophaaldag", "waste"],
  calendar: ["agenda", "kalender", "datum", "afspraak", "planning", "calendar", "dag"],

  /* Weer */
  sun: ["zon", "zonnig", "helder", "sun", "zonnepanelen", "dag", "weer", "buiten"],
  cloud: ["bewolkt", "wolk", "cloud", "betrokken", "grijs", "weer"],
  cloudSun: ["halfbewolkt", "wolk", "zon", "weer", "wisselend", "partly cloudy"],
  rain: ["regen", "buien", "nat", "rain", "neerslag", "weer", "paraplu"],
  snow: ["sneeuw", "winter", "vorst", "snow", "koud", "ijs", "weer"],
  fog: ["mist", "nevel", "fog", "zicht", "weer"],
  wind: ["wind", "waait", "storm", "bries", "windkracht", "weer"],
  drop: ["druppel", "vocht", "luchtvochtigheid", "water", "regen", "humidity", "nat", "lekkage"],
  uv: ["uv", "uv index", "zon", "straling", "zonkracht", "huid"],
  humidity: ["vochtigheid", "luchtvochtigheid", "vocht", "humidity", "procent", "rv", "hygrometer", "weer"],
  lux: ["lux", "lichtsterkte", "helderheid", "verlichtingssterkte", "illuminance", "lichtsensor", "lichtmeter", "lumen"],
  windSpeed: ["windsnelheid", "wind", "windkracht", "beaufort", "anemometer", "wind speed", "km/u", "storm", "weer"],
  rainfall: ["regen", "neerslag", "regenmeter", "millimeter", "mm", "rainfall", "buien", "hoeveelheid", "weer"],
  weatherCode: ["weercode", "code", "weather code", "weertype", "conditie", "weer"],
  forecast: ["voorspelling", "verwachting", "forecast", "vooruitzicht", "morgen", "weerbericht", "weer"],
  weatherStation: ["weerstation", "station", "meetstation", "weather station", "mast", "anemometer", "weer"],
  rainRadar: ["buienradar", "regenradar", "radar", "buien", "neerslagradar", "rain radar", "weer"],
  sunrise: ["zonsopkomst", "opkomst", "ochtend", "sunrise", "dageraad", "vroeg"],
  sunset: ["zonsondergang", "ondergang", "avond", "sunset", "schemer"],
  thermo: ["temperatuur", "thermometer", "graden", "warm", "koud", "thermostaat", "klimaat", "verwarming"],

  /* Status */
  shield: ["beveiliging", "schild", "alarm", "veilig", "bescherming", "shield", "security"],
  lock: ["slot", "op slot", "vergrendeld", "gesloten", "lock", "sleutel", "dicht", "beveiligd"],
  lockOpen: ["slot open", "ontgrendeld", "geopend", "unlock", "los", "open"],
  key: ["sleutel", "key", "toegang", "code", "wachtwoord", "slot"],
  wifi: ["wifi", "netwerk", "internet", "verbinding", "router", "signaal", "wlan"],
  smoke: ["rookmelder", "rook", "brand", "smoke", "melder", "vuur", "alarm"],
  smokeDetector: ["rookmelder", "melder", "rook", "brand", "smoke detector", "detector", "plafond", "alarm"],
  co: ["koolmonoxide", "co", "gas", "melder", "cv", "kachel", "carbon monoxide", "vergiftiging"],
  warning: ["waarschuwing", "let op", "attentie", "warning", "uitroepteken", "storing", "probleem"],
  check: ["goed", "vinkje", "in orde", "klaar", "check", "gelukt"],
  close: ["sluiten", "kruis", "dicht", "annuleren", "close", "weg"],
  clock: ["klok", "tijd", "uur", "wekker", "timer", "clock", "wanneer"],
  gaugeArrow: ["meter", "wijzer", "stand", "gauge", "niveau", "druk", "snelheid"],

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
  star: ["ster", "favoriet", "star", "belangrijk", "voorkeur", "top"],
  moon: ["maan", "nacht", "slapen", "donker", "moon", "nachtstand", "avond"],
  leaf: ["blad", "groen", "eco", "duurzaam", "plant", "natuur", "besparen", "tuin"],
  keuzelijst: ["keuzelijst", "keuze", "lijst", "modus", "stand", "programma", "dropdown", "select", "kiezen", "opties"],
  cog: ["instellingen", "tandwiel", "beheer", "settings", "configuratie", "opties", "systeem"],
  dots: ["meer", "drie puntjes", "menu", "opties", "extra", "overig", "more"],
  plus: ["plus", "meer", "erbij", "toevoegen", "hoger", "omhoog", "add"],
  minus: ["min", "minder", "eraf", "lager", "verwijderen", "omlaag"],
  chevronRight: ["pijl rechts", "verder", "volgende", "chevron", "open", "meer"],
  chevronDown: ["pijl omlaag", "uitklappen", "openklappen", "chevron", "meer", "dropdown"],
  question: ["vraagteken", "onbekend", "hulp", "help", "vraag", "geen idee"],
  pencil: ["potlood", "bewerken", "wijzigen", "aanpassen", "edit", "pen", "instellen"],
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
  return [[`${treffers.length} gevonden`, treffers.map((t) => t.sleutel)]];
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
