/**
 * Van een sleutel uit een keuzelijst naar een naam die een mens leest.
 *
 * WAAROM DIT BESTAAT
 *
 * Een `select`-entiteit meldt zijn opties als SLEUTELS, niet als woorden. De
 * vaatwasser van de eigenaar meldt `dishcare_dishwasher_program_kurz_60`, en
 * dat stond op 26 augustus 2026 letterlijk zo in de uitklaplijst op zijn kaart.
 * Zijn reactie was kort: "ik wil gewoon normale nederlandse namen".
 *
 * DE VOLGORDE WAARIN EEN NAAM GEZOCHT WORDT
 *
 * 1. **Home Assistant zelf.** `hass.formatEntityState(stateObj, optie)` geeft de
 *    vertaling die de integratie meelevert, in de taal van de gebruiker. Die is
 *    per definitie beter dan wat wij verzinnen: hij komt van de fabrikant en
 *    volgt de taalinstelling. Dat gebeurt in de kaart, niet hier -- dit bestand
 *    blijft zonder `hass` zodat het in een gewone Node-test past.
 * 2. **Ons eigen woordenboek**, als Home Assistant de sleutel onvertaald
 *    teruggeeft. Home Connect levert niet voor elke integratie en elke taal een
 *    vertaling mee, en dan sta je met Duits in een Nederlands huis.
 * 3. **Opschonen.** Wat er dan nog over is, wordt leesbaar gemaakt: het
 *    voorvoegsel eraf, streepjes eruit, een hoofdletter erop.
 *
 * Stap 3 alleen zou al genoeg zijn geweest om van de klacht af te zijn --
 * "Kurz 60" leest een stuk beter dan `dishcare_dishwasher_program_kurz_60`.
 * Maar Kurz is geen Nederlands, en de kaart hangt in een Nederlands huis.
 */

/**
 * Woorden die in een programmasleutel voorkomen, met hun Nederlandse naam.
 *
 * Duits én Engels, want BSH (Bosch, Siemens, Neff) noemt zijn programma's in
 * het Duits en de rest van de wereld in het Engels. De sleutels staan op kleine
 * letters en zonder scheidingsteken; `woordenVan()` maakt daar hetzelfde van,
 * hoe de integratie het ook opschrijft.
 *
 * Dit is expres een lijst van WOORDEN en niet van hele programmanamen. Elke
 * fabrikant zet ze anders achter elkaar (`eco_50`, `eco50`, `Eco50`,
 * `dishcare_dishwasher_program_eco_50`), en een lijst van hele namen zou bij de
 * eerste machine die net iets anders heet weer niets vinden.
 */
const WOORDEN = {
  // ---- de programma's zelf
  auto: "automatisch",
  automatic: "automatisch",
  eco: "eco",
  intensiv: "intensief",
  intensive: "intensief",
  kurz: "kort",
  quick: "snel",
  express: "snel",
  speed: "snel",
  glas: "glas",
  glass: "glas",
  delicate: "fijn",
  normal: "normaal",
  night: "nacht",
  silence: "stil",
  quiet: "stil",
  hygiene: "hygiëne",
  hygienic: "hygiëne",
  favorite: "favoriet",
  favourite: "favoriet",
  steam: "stoom",
  fresh: "fris",
  care: "verzorging",
  machinecare: "machineverzorging",
  machine: "machine",
  prerinse: "voorspoelen",
  rinse: "spoelen",
  presoak: "voorweken",
  soak: "weken",
  wash: "wassen",
  dry: "drogen",
  half: "half",
  load: "belading",
  mixed: "gemengd",
  maximum: "maximaal",
  cleaning: "reinigen",
  clean: "reinigen",
  pots: "pannen",
  chef: "chef",
  kitchen: "keuken",
  party: "feest",
  daily: "dagelijks",
  super: "super",
  turbo: "turbo",
  energy: "energie",
  saving: "zuinig",
  // ---- standen die geen programma zijn maar wel in zo'n lijst staan
  off: "uit",
  on: "aan",
  none: "geen",
  standby: "stand-by",
  ready: "gereed",
  pause: "pauze",
  stop: "stop",
  start: "start",
  finished: "klaar",
  low: "laag",
  medium: "midden",
  high: "hoog",
};

/**
 * Voorvoegsels die niets zeggen over het programma zelf.
 *
 * `dishcare_dishwasher_program_` is het pad naar de lijst, niet de naam van de
 * keuze. Alles tot en met het laatste "program" mag weg.
 *
 * Gulzig (`.*`) en niet zuinig: in dezelfde sleutel staat zowel "dishwasher"
 * als "program", en het is de LAATSTE die het einde van het pad markeert. En er
 * staat geen woordgrens voor: een underscore telt in een reguliere expressie
 * als woordteken, dus `\bprogram` vindt niets in `..._program_...`. Dat kostte
 * een testronde.
 */
const VOORVOEGSEL = /^.*program(?:me)?[_.\- ]/i;

/** Een temperatuur is een getal tussen deze twee; alles eronder is een variant. */
const TEMP_MIN = 30;
const TEMP_MAX = 95;

/**
 * De sleutel in losse woorden, ongeacht hoe hij geschreven staat.
 *
 * `Dishcare.Dishwasher.Program.Eco50`, `dishcare_dishwasher_program_eco_50` en
 * `eco-50` moeten hetzelfde opleveren. Daarom wordt er op drie dingen gesplitst:
 * scheidingstekens, de overgang van kleine naar HOOFDletter (camelCase), en de
 * overgang van letter naar cijfer -- anders blijft `Eco50` één woord en vindt
 * het woordenboek niets.
 */
export function woordenVan(sleutel) {
  return String(sleutel ?? "")
    .replace(VOORVOEGSEL, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([a-zA-Z])(\d)/g, "$1 $2")
    .replace(/(\d)([a-zA-Z])/g, "$1 $2")
    .split(/[\s_.\-]+/)
    .filter(Boolean);
}

/**
 * De Nederlandse naam van een keuze, of een opgeschoonde versie ervan.
 *
 * Een getal in het temperatuurbereik krijgt er "°C" achter: `kurz_60` is een
 * programma van zestig graden en niet programma nummer zestig. Een lager getal
 * blijft staan zoals het is -- `auto_1`, `auto_2` en `auto_3` zijn drie
 * varianten en geen temperaturen van een graad.
 */
export function programmaNaam(sleutel) {
  const woorden = woordenVan(sleutel);
  if (!woorden.length) return "";

  const uit = [];
  for (let i = 0; i < woorden.length; i++) {
    const woord = woorden[i];
    const klein = woord.toLowerCase();

    if (/^\d+$/.test(klein)) {
      const n = Number(klein);
      uit.push(n >= TEMP_MIN && n <= TEMP_MAX ? `${n} °C` : klein);
      continue;
    }

    // Eerst het PAAR, dan het losse woord. `pre_rinse` is voorspoelen en niet
    // "pre spoelen", en `machine_care` is machineverzorging en niet "machine
    // verzorging". Waar het paar niets oplevert blijven de woorden los, en dan
    // wordt `night_wash` gewoon "Nacht wassen" -- dat leest prima.
    const volgende = woorden[i + 1]?.toLowerCase();
    const paar = volgende ? WOORDEN[klein + volgende] : undefined;
    if (paar) {
      uit.push(paar);
      i++;
      continue;
    }

    uit.push(WOORDEN[klein] ?? woord);
  }

  // Alleen de EERSTE letter van de hele naam wordt een hoofdletter, en daarom
  // staat het woordenboek op kleine letters. Anders wordt `night_wash` "Nacht
  // Wassen": twee woorden die allebei hun eigen hoofdletter meebrengen leest
  // als een titel, en dit is een programmanaam.
  const zin = uit.join(" ");
  return zin.charAt(0).toUpperCase() + zin.slice(1);
}

/**
 * Heeft Home Assistant deze optie echt vertaald, of gaf hij de sleutel terug?
 *
 * `formatEntityState` valt terug op de toestand zelf als er geen vertaling is,
 * en soms op een opgepoetste versie ervan. Om dat te herkennen wordt er
 * vergeleken op de KALE letters en cijfers: `Dishcare Dishwasher Program Kurz
 * 60` en `dishcare_dishwasher_program_kurz_60` zijn dan hetzelfde, en
 * `Kort 60 °C` niet.
 */
export function isVertaald(sleutel, weergave) {
  const kaal = (t) =>
    String(t ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  const w = kaal(weergave);
  return Boolean(w) && w !== kaal(sleutel);
}

/**
 * De naam die op de kaart komt.
 *
 * @param {string} sleutel   de optie zoals de entiteit hem meldt
 * @param {string} [weergave] wat `hass.formatEntityState` ervan maakte
 */
export function keuzeNaam(sleutel, weergave) {
  if (isVertaald(sleutel, weergave)) return String(weergave);
  return programmaNaam(sleutel) || String(sleutel ?? "");
}
