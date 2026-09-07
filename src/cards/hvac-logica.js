/**
 * Wat een HVAC-kaart moet zeggen en kunnen, los van hoe hij eruitziet.
 *
 * Gevraagd op 7 september 2026: *"ik wil een kaart voor een airco, warmtepomp,
 * ventilatie etc. Dat is allemaal 1 kaart en je kan kiezen wat het is. Hij heet
 * DomotiApp HVAC. Zoveel mogelijk opties kunnen kiezen als sensoren etc, maak
 * wat logisch is per apparaat."*
 *
 * Dus: één kaart, en de SOORT bepaalt welke velden de editor aanbiedt, welk
 * icoon erop staat en hoe de statusregel leest. Wat de vier soorten delen is
 * de vorm -- een kop met status, tegels met metingen, een rij standen, een
 * temperatuurstelknop -- en wat ze niet delen staat in `SOORTEN` hieronder.
 *
 * Geen DOM en geen `hass`: dit hoort in een gewone Node-test, en de rest van de
 * kaart niet. De kaart geeft states door en krijgt tekst en service-aanroepen
 * terug.
 *
 * ## Waarom de standen uit de ENTITEIT komen en niet uit een lijstje
 *
 * Een airco heeft `hvac_modes`, een ventilatie-unit `preset_modes` of een
 * percentage, een boiler een `operation_list`, en een warmtepomp van de ene
 * fabrikant een `select` met "Verwarmen/Koelen/Auto" waar een andere niets
 * heeft. Een vast lijstje per soort zou bij de helft van de klanten knoppen
 * tonen die het apparaat niet kent. De kaart leest daarom wat de entiteit
 * aanbiedt en vertaalt alleen de woorden.
 */

/** Het domein van een entiteit, zonder iets uit ha.js nodig te hebben. */
const domeinVan = (entityId) => String(entityId ?? "").split(".")[0];

const leeg = (s) => s == null || s === "" || s === "unknown" || s === "unavailable";

/* ------------------------------------------------------------ de soorten */

/**
 * Een veld in de editor, en wat het op de kaart doet.
 *
 *   key       de sleutel in de config
 *   label     wat er in de editor staat
 *   domeinen  welke entiteiten de kiezer aanbiedt
 *   rol       hoofd | tegel | status | storing | filter | keuze | boost | verwarmt
 *   eenheid   de standaardeenheid als de sensor er zelf geen meldt
 *   hulp      de uitleg onder het veld
 */
const TEMP = { domeinen: ["sensor"], device_class: "temperature", rol: "tegel", eenheid: "°C" };

const VELDEN = {
  hoofd_climate: {
    key: "entity",
    label: "Apparaat (climate)",
    domeinen: ["climate"],
    rol: "hoofd",
    hulp: "De climate-entiteit. Daar komen de standen en de temperatuurknoppen vandaan. Leeg laten mag: dan toont de kaart alleen de sensoren.",
  },
  hoofd_ventilatie: {
    key: "entity",
    label: "Ventilatie-unit",
    domeinen: ["fan", "select", "input_select", "climate"],
    rol: "hoofd",
    hulp: "Een fan-entiteit (standen of percentage), of een keuzelijst met de standen. Leeg laten mag.",
  },
  hoofd_boiler: {
    key: "entity",
    label: "Boiler (water_heater of climate)",
    domeinen: ["water_heater", "climate"],
    rol: "hoofd",
    hulp: "Daar komen de doeltemperatuur en de bedrijfsstanden vandaan. Leeg laten mag.",
  },
  temperature: { key: "temperature", label: "Binnentemperatuur", ...TEMP, hulp: "Wint van de meting van het apparaat zelf." },
  outdoor: { key: "outdoor", label: "Buitentemperatuur", ...TEMP },
  humidity: {
    key: "humidity",
    label: "Luchtvochtigheid",
    domeinen: ["sensor"],
    device_class: "humidity",
    rol: "tegel",
    eenheid: "%",
  },
  co2: { key: "co2", label: "CO₂", domeinen: ["sensor"], rol: "tegel", eenheid: "ppm", hulp: "Kleurt oranje boven 1200 ppm en rood boven 1600." },
  voc: { key: "voc", label: "Luchtkwaliteit (VOC)", domeinen: ["sensor"], rol: "tegel" },
  power: { key: "power", label: "Vermogen", domeinen: ["sensor"], device_class: "power", rol: "tegel", eenheid: "W" },
  energy: { key: "energy", label: "Energie vandaag", domeinen: ["sensor"], device_class: "energy", rol: "tegel", eenheid: "kWh" },
  flow_temp: { key: "flow_temp", label: "Aanvoertemperatuur", ...TEMP },
  return_temp: { key: "return_temp", label: "Retourtemperatuur", ...TEMP },
  dhw_temp: { key: "dhw_temp", label: "Tapwatertemperatuur", ...TEMP },
  water_temp: { key: "water_temp", label: "Watertemperatuur", ...TEMP, hulp: "Wint van de meting van de boiler zelf." },
  supply_temp: { key: "supply_temp", label: "Toevoertemperatuur", ...TEMP },
  exhaust_temp: { key: "exhaust_temp", label: "Afvoertemperatuur", ...TEMP },
  cop: { key: "cop", label: "COP", domeinen: ["sensor"], rol: "tegel", hulp: "Rendement: geleverde warmte gedeeld door verbruikte stroom." },
  thermal: { key: "thermal", label: "Thermisch vermogen", domeinen: ["sensor"], rol: "tegel", eenheid: "kW" },
  compressor: {
    key: "compressor",
    label: "Compressor",
    domeinen: ["sensor", "binary_sensor"],
    rol: "tegel",
    hulp: "Een toerental of percentage, of een aan/uit-sensor.",
  },
  flow_rate: { key: "flow_rate", label: "Debiet", domeinen: ["sensor"], rol: "tegel", eenheid: "l/min" },
  pressure: { key: "pressure", label: "Waterdruk", domeinen: ["sensor"], rol: "tegel", eenheid: "bar" },
  status: {
    key: "status",
    label: "Statussensor",
    domeinen: ["sensor"],
    rol: "status",
    hulp: "Een sensor met een woord als toestand (Verwarmen, Tapwater, Stand 2). Komt in de regel onder de naam.",
  },
  fault: {
    key: "fault",
    label: "Storing",
    domeinen: ["binary_sensor"],
    rol: "storing",
    hulp: "Een binary_sensor die aan gaat bij een storing. De kaart kleurt dan rood, wat er verder ook aan de hand is.",
  },
  filter: {
    key: "filter",
    label: "Filter",
    domeinen: ["binary_sensor", "sensor"],
    rol: "filter",
    hulp: "Een binary_sensor die aan gaat als het filter vervangen moet worden, of een sensor met de dagen tot vervanging.",
  },
  bypass: { key: "bypass", label: "Bypass", domeinen: ["binary_sensor"], rol: "tegel" },
  heating: {
    key: "heating",
    label: "Verwarmt (aan/uit)",
    domeinen: ["binary_sensor"],
    rol: "verwarmt",
    hulp: "Een binary_sensor die aan is zolang de boiler opwarmt.",
  },
  mode: {
    key: "mode",
    label: "Bedrijfsmodus (keuzelijst)",
    domeinen: ["select", "input_select"],
    rol: "keuze",
    hulp: "Een keuzelijst van de integratie, bijvoorbeeld Verwarmen / Koelen / Auto. Verschijnt als uitklaplijst op de kaart.",
  },
  boost: {
    key: "boost",
    label: "Boost",
    domeinen: ["switch", "input_boolean", "button", "input_button", "script"],
    rol: "boost",
    hulp: "Een schakelaar wordt een schuifschakelaar op de kaart; een knop of script een drukknop.",
  },
};

/**
 * De vier soorten, en welke velden erbij horen. De volgorde is de volgorde
 * in de editor én van de tegels op de kaart.
 */
export const SOORTEN = {
  airco: {
    label: "Airco",
    naam: "Airco",
    icoon: "airco",
    velden: ["hoofd_climate", "temperature", "outdoor", "humidity", "power", "energy", "fault"],
  },
  warmtepomp: {
    label: "Warmtepomp",
    naam: "Warmtepomp",
    icoon: "heatPump",
    velden: [
      "hoofd_climate",
      "status",
      "fault",
      "flow_temp",
      "return_temp",
      "outdoor",
      "dhw_temp",
      "cop",
      "power",
      "thermal",
      "energy",
      "compressor",
      "flow_rate",
      "pressure",
      "mode",
      "boost",
    ],
  },
  ventilatie: {
    label: "Ventilatie (WTW)",
    naam: "Ventilatie",
    icoon: "fan",
    velden: [
      "hoofd_ventilatie",
      "status",
      "fault",
      "co2",
      "humidity",
      "voc",
      "temperature",
      "outdoor",
      "supply_temp",
      "exhaust_temp",
      "filter",
      "bypass",
      "power",
      "boost",
    ],
  },
  boiler: {
    label: "Boiler / warm water",
    naam: "Boiler",
    icoon: "boiler",
    velden: ["hoofd_boiler", "water_temp", "heating", "power", "energy", "fault", "mode", "boost"],
  },
};

export const SOORT_STANDAARD = "airco";

/** De definitie van een soort; een onbekende soort valt terug op de airco. */
export const soortDef = (soort) => SOORTEN[soort] ?? SOORTEN[SOORT_STANDAARD];

/** De velden van een soort, uitgeschreven. */
export const veldenVan = (soort) => soortDef(soort).velden.map((k) => VELDEN[k]);

/** De velden van een bepaalde rol. */
export const veldenMetRol = (soort, rol) => veldenVan(soort).filter((v) => v.rol === rol);

/* --------------------------------------------------------------- woorden */

const HVAC_MODE = {
  off: "Uit",
  heat: "Verwarmen",
  cool: "Koelen",
  heat_cool: "Auto",
  auto: "Auto",
  dry: "Drogen",
  fan_only: "Ventileren",
};

const HVAC_ACTION = {
  heating: "Verwarmt",
  cooling: "Koelt",
  drying: "Droogt",
  fan: "Ventileert",
  idle: "Standby",
  off: "Uit",
  preheating: "Voorverwarmt",
  defrosting: "Ontdooit",
};

/** Standen zoals fabrikanten ze noemen, in het Nederlands. */
const STAND = {
  off: "Uit",
  on: "Aan",
  auto: "Auto",
  low: "Laag",
  lowest: "Laagst",
  min: "Min",
  minimum: "Min",
  medium: "Midden",
  mid: "Midden",
  middle: "Midden",
  high: "Hoog",
  highest: "Hoogst",
  max: "Max",
  maximum: "Max",
  boost: "Boost",
  turbo: "Turbo",
  quiet: "Stil",
  silent: "Stil",
  silence: "Stil",
  sleep: "Nacht",
  night: "Nacht",
  away: "Afwezig",
  home: "Thuis",
  eco: "Eco",
  comfort: "Comfort",
  party: "Feest",
  holiday: "Vakantie",
  // water_heater
  electric: "Elektrisch",
  gas: "Gas",
  heat_pump: "Warmtepomp",
  high_demand: "Veel vraag",
  performance: "Snel",
  // climate hvac_modes, als ze hier langskomen
  ...HVAC_MODE,
};

/** Een stand als een mens hem zegt. Onbekende woorden houden hun eigen naam. */
export function standLabel(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  const kern = s.toLowerCase().replace(/[\s-]+/g, "_");
  if (STAND[kern]) return STAND[kern];
  // "fan_only" -> "Fan only"; "stand 2" blijft "Stand 2".
  const los = s.replace(/_/g, " ");
  return los.charAt(0).toUpperCase() + los.slice(1);
}

/* ---------------------------------------------------------------- tegels */

/**
 * Hoeveel cijfers achter de komma een meting krijgt.
 *
 * Per eenheid, want dat is wat een mens verwacht: 21,4 °C maar 640 ppm en 1.250
 * W. Zonder eenheid: een groot getal heel, een klein getal met een decimaal.
 */
export function cijfers(eenheid, waarde) {
  const e = String(eenheid ?? "").toLowerCase();
  const n = Math.abs(Number(waarde));
  if (e.includes("°") || e === "c" || e === "f") return 1;
  if (e === "%" || e === "ppm" || e === "w" || e === "hz" || e === "rpm" || e === "ppb") return 0;
  if (e === "kwh" || e === "kw" || e === "bar" || e === "l/min" || e === "m³/h") return n >= 100 ? 0 : 1;
  if (!e) return n >= 100 ? 0 : n >= 10 ? 1 : 2;
  return n >= 100 ? 0 : 1;
}

/** Een getal als tekst, in de Nederlandse notatie. */
export function formatteer(waarde, eenheid, taal = "nl") {
  const n = Number(waarde);
  if (!Number.isFinite(n)) return "--";
  const d = cijfers(eenheid, n);
  return n.toLocaleString(taal, { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** Aan/uit-woorden per veld, zodat een binaire tegel iets zinnigs zegt. */
const BINAIR = {
  bypass: ["Open", "Dicht"],
  compressor: ["Aan", "Uit"],
  heating: ["Ja", "Nee"],
  filter: ["Vervangen", "Schoon"],
};

/**
 * Eén tegel: label, waarde en eenheid, plus een oordeel waar dat hoort.
 *
 * `let` is de status-kleur van de tegel: "warn" of "bad", of leeg. Alleen CO₂
 * en het filter krijgen een oordeel; een temperatuur is een feit.
 */
export function tegel(veld, st, taal = "nl") {
  if (!veld || !st) return null;
  const s = String(st.state ?? "").trim();
  const eenheid = st.attributes?.unit_of_measurement ?? veld.eenheid ?? "";

  // Een aan/uit-sensor: een woord in plaats van een getal.
  if (domeinVan(st.entity_id) === "binary_sensor") {
    const [aan, uit] = BINAIR[veld.key] ?? ["Aan", "Uit"];
    const dood = leeg(s);
    const isAan = s === "on";
    return {
      key: veld.key,
      label: veld.label.replace(/\s*\(.*\)$/, ""),
      waarde: dood ? "--" : isAan ? aan : uit,
      eenheid: "",
      let: veld.key === "filter" && isAan ? "warn" : "",
    };
  }

  const n = Number(s);
  const getal = !leeg(s) && Number.isFinite(n);
  let oordeel = "";
  if (veld.key === "co2" && getal) oordeel = n >= 1600 ? "bad" : n >= 1200 ? "warn" : "";
  if (veld.key === "filter" && getal) oordeel = n <= 0 ? "warn" : "";

  return {
    key: veld.key,
    label: veld.label.replace(/\s*\(.*\)$/, ""),
    waarde: getal ? formatteer(n, eenheid, taal) : leeg(s) ? "--" : s,
    eenheid: getal ? eenheid : "",
    let: oordeel,
  };
}

/**
 * Alle tegels van deze kaart, in de volgorde van de soort.
 *
 * @param {string} soort
 * @param {object} config
 * @param {(entityId: string) => object|null} lees geeft de state van een entiteit
 */
export function tegels(soort, config, lees, taal = "nl") {
  const uit = [];
  for (const veld of veldenVan(soort)) {
    if (veld.rol !== "tegel" && veld.rol !== "filter") continue;
    const id = config?.[veld.key];
    if (!id) continue;
    const t = tegel(veld, lees(id) ?? { entity_id: id, state: "unavailable", attributes: {} }, taal);
    if (t) uit.push(t);
  }
  return uit;
}

/* ----------------------------------------------------------- statusregel */

/**
 * Wat het apparaat doet, en welke kleur daarbij hoort.
 *
 * De rangorde staat hier en niet in een `paint()`:
 *
 *   1. Een storing verslaat alles. Rood, hoe warm de kamer ook is.
 *   2. Een hoofdentiteit die niet bereikbaar is, is dat. Grijs.
 *   3. Wat het apparaat doet: verwarmt (oranje), koelt (blauw), ventileert
 *      (blauw), standby of uit (grijs).
 *   4. Een statussensor vult aan of vervangt, als er verder niets bekend is.
 *   5. Een filter dat vervangen moet worden hangt er als waarschuwing achter,
 *      want dat is geen toestand maar een klus.
 *
 * @returns {{tekst: string, tone: string, bezig: boolean, waarschuwing: string}}
 */
export function statusRegel({ soort, hoofd, status, fault, filter, heating } = {}) {
  const waarschuwing = filterWaarschuwing(filter);

  if (fault && fault.state === "on") {
    return { tekst: "Storing", tone: "bad", bezig: false, waarschuwing };
  }

  if (hoofd && leeg(hoofd.state)) {
    return { tekst: "Niet bereikbaar", tone: "neutral", bezig: false, waarschuwing };
  }

  const extra = status && !leeg(status.state) ? standLabel(status.state) : "";
  const domein = domeinVan(hoofd?.entity_id);

  if (hoofd && domein === "climate") {
    const a = hoofd.attributes ?? {};
    const actie = a.hvac_action ?? (hoofd.state === "off" ? "off" : "idle");
    const woord = HVAC_ACTION[actie] ?? standLabel(actie);
    const tone = actie === "heating" || actie === "preheating" ? "solar" : ["cooling", "drying", "fan"].includes(actie) ? "water" : "neutral";
    const bezig = tone !== "neutral" || actie === "defrosting";
    // Bij een warmtepomp zegt de statussensor vaak méér dan hvac_action
    // ("Tapwater", "Ontdooien"): dan staat die erachter.
    const tekst = extra && extra !== woord ? `${woord} · ${extra}` : woord;
    return { tekst, tone, bezig, waarschuwing };
  }

  if (hoofd && domein === "fan") {
    const a = hoofd.attributes ?? {};
    if (hoofd.state === "off") return { tekst: "Uit", tone: "neutral", bezig: false, waarschuwing };
    const stand = a.preset_mode
      ? standLabel(a.preset_mode)
      : Number.isFinite(Number(a.percentage))
        ? `${Math.round(Number(a.percentage))}%`
        : "Aan";
    const tekst = extra && extra !== stand ? `${stand} · ${extra}` : `Ventileert · ${stand}`;
    return { tekst, tone: "water", bezig: true, waarschuwing };
  }

  if (hoofd && domein === "water_heater") {
    const a = hoofd.attributes ?? {};
    const stand = standLabel(hoofd.state);
    const warmt = heating ? heating.state === "on" : a.operation_mode !== "off" && hoofd.state !== "off" && a.hvac_action === "heating";
    if (hoofd.state === "off") return { tekst: "Uit", tone: "neutral", bezig: false, waarschuwing };
    const tekst = warmt ? `Verwarmt · ${stand}` : stand;
    return { tekst, tone: warmt ? "solar" : "neutral", bezig: warmt, waarschuwing };
  }

  if (hoofd && (domein === "select" || domein === "input_select")) {
    const stand = standLabel(hoofd.state);
    const uit = /^(uit|off)$/i.test(hoofd.state);
    return { tekst: uit ? "Uit" : `Stand · ${stand}`, tone: uit ? "neutral" : "water", bezig: !uit, waarschuwing };
  }

  // Geen hoofdentiteit: dan zeggen de losse sensoren het.
  if (heating && heating.state === "on") {
    return { tekst: extra ? `Verwarmt · ${extra}` : "Verwarmt", tone: "solar", bezig: true, waarschuwing };
  }
  if (extra) return { tekst: extra, tone: "neutral", bezig: false, waarschuwing };
  return { tekst: soortDef(soort).naam, tone: "neutral", bezig: false, waarschuwing };
}

/** "Filter vervangen", of leeg. Een sensor met dagen telt af naar nul. */
export function filterWaarschuwing(filter) {
  if (!filter || leeg(filter.state)) return "";
  if (domeinVan(filter.entity_id) === "binary_sensor") return filter.state === "on" ? "Filter vervangen" : "";
  const n = Number(filter.state);
  if (Number.isFinite(n) && n <= 0) return "Filter vervangen";
  return "";
}

/* --------------------------------------------------------------- standen */

/** De vier stappen waarin een ventilator zonder standen wordt bediend. */
const PCT_STAPPEN = [
  ["0", "Uit"],
  ["33", "Laag"],
  ["66", "Midden"],
  ["100", "Hoog"],
];

/**
 * De standen waaruit gekozen kan worden op de hoofdentiteit.
 *
 * De waarde is wat straks naar de service gaat; het label is Nederlands. Bij
 * een ventilator zonder `preset_modes` worden het vier percentages, afgerond
 * op wat het apparaat kan (`percentage_step`).
 *
 * @returns {Array<{waarde: string, label: string}>}
 */
export function standen(hoofd) {
  if (!hoofd) return [];
  const a = hoofd.attributes ?? {};
  const domein = domeinVan(hoofd.entity_id);
  const lijst = (arr) => (Array.isArray(arr) ? arr.filter((x) => typeof x === "string" && x !== "") : []);

  if (domein === "climate") return lijst(a.hvac_modes).map((m) => ({ waarde: m, label: HVAC_MODE[m] ?? standLabel(m) }));
  if (domein === "water_heater") return lijst(a.operation_list).map((m) => ({ waarde: m, label: standLabel(m) }));
  if (domein === "select" || domein === "input_select") return lijst(a.options).map((m) => ({ waarde: m, label: standLabel(m) }));
  if (domein === "fan") {
    const presets = lijst(a.preset_modes);
    if (presets.length) return presets.map((m) => ({ waarde: m, label: standLabel(m) }));
    if (a.percentage != null || a.percentage_step != null) {
      const stap = Number(a.percentage_step) || 1;
      return PCT_STAPPEN.map(([p, label]) => ({
        waarde: String(Math.min(100, Math.round(Number(p) / stap) * stap)),
        label,
      }));
    }
    return [
      { waarde: "off", label: "Uit" },
      { waarde: "on", label: "Aan" },
    ];
  }
  return [];
}

/** Welke stand nu geldt, als een van de waarden uit `standen()`. */
export function huidigeStand(hoofd, opties = standen(hoofd)) {
  if (!hoofd || leeg(hoofd.state)) return "";
  const a = hoofd.attributes ?? {};
  const domein = domeinVan(hoofd.entity_id);
  if (domein === "fan") {
    if (a.preset_mode && opties.some((o) => o.waarde === a.preset_mode)) return a.preset_mode;
    if (hoofd.state === "off") return opties.some((o) => o.waarde === "0") ? "0" : "off";
    const pct = Number(a.percentage);
    if (Number.isFinite(pct) && opties.length) {
      // De dichtstbijzijnde stap: 40% licht "Laag" (33) op en niet niets.
      let beste = opties[0];
      for (const o of opties) if (Math.abs(Number(o.waarde) - pct) < Math.abs(Number(beste.waarde) - pct)) beste = o;
      return beste.waarde;
    }
    return hoofd.state === "on" ? "on" : "";
  }
  return opties.some((o) => o.waarde === hoofd.state) ? hoofd.state : "";
}

/**
 * De service-aanroep die een stand kiest, als `[domein, service, data]`.
 *
 * `null` als er niets te kiezen valt. Bij een ventilator op percentages is de
 * waarde een getal-als-tekst, en nul betekent uitzetten.
 */
export function standOproep(hoofd, waarde) {
  if (!hoofd) return null;
  const id = hoofd.entity_id;
  const v = String(waarde ?? "");
  if (!v) return null;
  const domein = domeinVan(id);
  switch (domein) {
    case "climate":
      return ["climate", "set_hvac_mode", { entity_id: id, hvac_mode: v }];
    case "water_heater":
      return ["water_heater", "set_operation_mode", { entity_id: id, operation_mode: v }];
    case "select":
    case "input_select":
      return [domein, "select_option", { entity_id: id, option: v }];
    case "fan": {
      const presets = hoofd.attributes?.preset_modes;
      if (Array.isArray(presets) && presets.includes(v)) return ["fan", "set_preset_mode", { entity_id: id, preset_mode: v }];
      if (v === "off") return ["fan", "turn_off", { entity_id: id }];
      if (v === "on") return ["fan", "turn_on", { entity_id: id }];
      const pct = Number(v);
      if (!Number.isFinite(pct)) return null;
      return pct <= 0 ? ["fan", "turn_off", { entity_id: id }] : ["fan", "set_percentage", { entity_id: id, percentage: pct }];
    }
    default:
      return null;
  }
}

/* ------------------------------------------------------ ventilatorsnelheid */

/** De ventilatorstanden van een airco (`fan_modes` op de climate-entiteit). */
export function ventilatorStanden(hoofd) {
  const lijst = hoofd?.attributes?.fan_modes;
  if (domeinVan(hoofd?.entity_id) !== "climate" || !Array.isArray(lijst)) return [];
  return lijst.filter((m) => typeof m === "string" && m).map((m) => ({ waarde: m, label: standLabel(m) }));
}

export function ventilatorOproep(hoofd, waarde) {
  const v = String(waarde ?? "");
  if (!hoofd || !v || !ventilatorStanden(hoofd).some((o) => o.waarde === v)) return null;
  return ["climate", "set_fan_mode", { entity_id: hoofd.entity_id, fan_mode: v }];
}

/* ------------------------------------------------------------- het doel */

/**
 * Het temperatuurbereik van de stelknop, of null als er niets te stellen is.
 *
 * Een climate-entiteit stelt in halve graden, een boiler in hele -- tenzij
 * de entiteit zelf iets anders zegt. Een airco in de stand "uit" of
 * "ventileren" heeft geen doeltemperatuur, en dan komt er null en geen knop.
 */
export function doelBereik(hoofd, stapConfig) {
  if (!hoofd || leeg(hoofd.state)) return null;
  const a = hoofd.attributes ?? {};
  const domein = domeinVan(hoofd.entity_id);
  if (domein !== "climate" && domein !== "water_heater") return null;
  const doel = Number(a.temperature);
  if (!Number.isFinite(doel)) return null;
  const stap = Number(stapConfig) || Number(a.target_temp_step) || (domein === "water_heater" ? 1 : 0.5);
  return {
    min: Number(a.min_temp ?? (domein === "water_heater" ? 30 : 5)),
    max: Number(a.max_temp ?? (domein === "water_heater" ? 70 : 35)),
    stap,
    doel,
    huidig: Number.isFinite(Number(a.current_temperature)) ? Number(a.current_temperature) : null,
  };
}

/** Het volgende doel na één tik, binnen het bereik en op de stap. */
export function volgendDoel(bereik, van, richting) {
  if (!bereik) return null;
  const basis = Number.isFinite(van) ? van : bereik.doel;
  const ruw = basis + richting * bereik.stap;
  const opStap = Math.round(ruw / bereik.stap) * bereik.stap;
  // Afronden op de stap kan 20.500000001 geven; twee decimalen is genoeg.
  const net = Math.round(opStap * 100) / 100;
  return Math.min(bereik.max, Math.max(bereik.min, net));
}

export function doelOproep(hoofd, temperatuur) {
  if (!hoofd || !Number.isFinite(temperatuur)) return null;
  const domein = domeinVan(hoofd.entity_id);
  if (domein !== "climate" && domein !== "water_heater") return null;
  return [domein, "set_temperature", { entity_id: hoofd.entity_id, temperature: temperatuur }];
}

/* ---------------------------------------------------------------- boost */

/** Is deze boost een schakelaar (met een stand) of een knop (zonder)? */
export const boostIsSchakelaar = (entityId) => ["switch", "input_boolean"].includes(domeinVan(entityId));

/**
 * De aanroep voor de boost: een schakelaar gaat aan of uit, een knop wordt
 * ingedrukt. Dezelfde domeinen als de start/stop van de vaatwasser.
 */
export function boostOproep(entityId, aan = true) {
  const id = String(entityId ?? "");
  const domein = domeinVan(id);
  switch (domein) {
    case "switch":
    case "input_boolean":
      return ["homeassistant", aan ? "turn_on" : "turn_off", { entity_id: id }];
    case "button":
    case "input_button":
      return [domein, "press", { entity_id: id }];
    case "script":
      return ["script", "turn_on", { entity_id: id }];
    default:
      return null;
  }
}

/* ---------------------------------------------------------- de meting */

/**
 * De temperatuur die in de kop staat: de aangewezen sensor wint van wat het
 * apparaat over zichzelf zegt, net als op de klimaatkaart.
 */
export function huidigeTemperatuur(hoofd, sensor) {
  const s = Number(sensor?.state);
  if (sensor && !leeg(sensor.state) && Number.isFinite(s)) return s;
  // `Number(null)` is 0, en dat is geen meting. De demo-boiler van Home
  // Assistant meldt `current_temperature: null` en stond zo op "0,0 °C" --
  // gezien in de testinstance op 7 september 2026.
  const ruw = hoofd?.attributes?.current_temperature;
  if (ruw == null || ruw === "") return null;
  const h = Number(ruw);
  return Number.isFinite(h) ? h : null;
}
