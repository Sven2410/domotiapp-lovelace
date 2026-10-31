/**
 * Een airco, zoals hij op de airco-kaart en op het infoscherm staat.
 *
 * Gevraagd op 13 oktober 2026: *"Ik wil dat je hem universeel bouwt dat elke
 * airco werkt."* Aanleiding waren twee Mitsubishi's via MELCloud Home bij een
 * klant: een climate-entiteit met veel attributen, en daaromheen een rij
 * sensoren en schakelaars op hetzelfde apparaat.
 *
 * UNIVERSEEL BETEKENT: LEZEN WAT DE ENTITEIT AANBIEDT
 *
 * Wat elke airco in Home Assistant gemeen heeft is de climate-entiteit, en
 * die zegt zelf wat hij kan: `hvac_modes`, `fan_modes`, `swing_modes`,
 * `swing_horizontal_modes`, `preset_modes`, een doel (`temperature`) of een
 * bereik (`target_temp_low`/`_high`), en `supported_features`. De kaart toont
 * alleen wat er staat, en vertaalt alleen de woorden. Gemeten op drie soorten:
 *
 * | | standen | ventilator | lamellen | doel |
 * |---|---|---|---|---|
 * | MELCloud Home | off heat cool auto dry fan_only | auto, speed_1..5 | position_1..5 + left..right | `temperature` |
 * | demo `climate.hvac` | idem | on_low on_high auto_low auto_high off | 1 2 3 + rangefull | `temperature` |
 * | demo `climate.ecobee` | off cool heat_cool auto dry fan_only | idem | 1 2 3 | bereik 21-24 |
 * | Cozytouch (Atlantic) | off auto cool heat fan_only dry | low medium high auto quiet | up middle_up middle_down down on | `temperature`, `null` bij uit en fan_only |
 *
 * MELCloud meldt GEEN `hvac_action`: de kaart weet dus niet of de compressor
 * draait, alleen wat er gevraagd is. Is `hvac_action` er wel, dan gaat die
 * voor (zie `aircoStand`).
 *
 * Cozytouch meldt die ook niet, en `current_temperature` is er altijd `null`
 * (zo gebouwd, gezien op 31 oktober 2026 in tien dagen geschiedenis). De
 * kamertemperatuur komt daar dus uit een sensor die de installateur kiest.
 *
 * DE REST VAN HET APPARAAT
 *
 * Een kamertemperatuur, een energiemeter of een storingsmelder staat bij de
 * meeste integraties als eigen entiteit op hetzelfde APPARAAT. Die vindt
 * `apparaatDelen` zelf, op apparaat en `device_class`, zodat de installateur
 * alleen de airco hoeft te kiezen.
 *
 * Geen DOM en geen `hass`-aanroepen: dit hoort in een gewone Node-test.
 */

import { huidigeStand, standLabel, standOproep, standen, volgendDoel } from "./hvac-logica.js";
// Voor de tegels van de airco-kaart (onderaan dit bestand).
import { formatteer } from "./hvac-logica.js";
import { locale, nt, t, tc } from "../taal.js";
// Voor de coach (helemaal onderaan).
import { coachApparaten, coachRollen, contractVan, spreektAnders } from "./coach-logica.js";

/** `ClimateEntityFeature` van Home Assistant. */
export const FUNCTIE = {
  DOEL: 1,
  BEREIK: 2,
  VOCHT: 4,
  VENTILATOR: 8,
  PRESET: 16,
  LAMELLEN: 32,
  UIT: 128,
  AAN: 256,
  LAMELLEN_HORIZONTAAL: 512,
};

const leeg = (s) => s == null || s === "" || s === "unknown" || s === "unavailable";
const domeinVan = (id) => String(id ?? "").split(".")[0];

/** Een getal, of null. `Number(null)` is 0, en dat is geen meting. */
export function getal(ruw) {
  if (ruw == null || ruw === "" || leeg(ruw)) return null;
  const n = Number(ruw);
  return Number.isFinite(n) ? n : null;
}

/** Kan deze entiteit dit? */
export const kan = (st, functie) => (Number(st?.attributes?.supported_features) & functie) === functie;

const lijst = (arr) => (Array.isArray(arr) ? arr.filter((x) => typeof x === "string" && x !== "") : []);

/* ------------------------------------------------------------- woorden */

const STAND = {
  off: nt("Uit"),
  heat: nt("Verwarmen"),
  cool: nt("Koelen"),
  heat_cool: nt("Auto"),
  auto: nt("Auto"),
  dry: nt("Drogen"),
  fan_only: nt("Ventileren"),
};

const ACTIE = {
  heating: nt("Verwarmt"),
  preheating: nt("Verwarmt voor"),
  defrosting: nt("Ontdooit"),
  cooling: nt("Koelt"),
  drying: nt("Droogt"),
  fan: nt("Ventileert"),
  idle: nt("Standby"),
  off: nt("Uit"),
};

/** De stand (`hvac_mode`) in het Nederlands. */
export const standNaam = (stand) => (STAND[stand] ? t(STAND[stand]) : standLabel(stand));

/**
 * Wat de airco DOET, als één woord voor de kleur en het icoon.
 *
 *   warm | koud | droog | lucht | auto | stil | uit | dood
 *
 * `hvac_action` gaat voor als hij er is: een airco op Auto die koelt is koud.
 */
function soortVan(stand, actie) {
  switch (actie) {
    case "heating":
    case "preheating":
    case "defrosting":
      return "warm";
    case "cooling":
      return "koud";
    case "drying":
      return "droog";
    case "fan":
      return "lucht";
    case "idle":
      return "stil";
    default:
      break;
  }
  switch (stand) {
    case "heat":
      return "warm";
    case "cool":
      return "koud";
    case "dry":
      return "droog";
    case "fan_only":
      return "lucht";
    default:
      return "auto";
  }
}

/** Het icoon bij een soort. Alleen namen uit `icons.js`. */
export const SOORT_ICOON = {
  warm: "flame",
  koud: "snowflake",
  droog: "drop",
  lucht: "fan",
  auto: "airco",
  stil: "airco",
  uit: "airco",
  dood: "airco",
};

/* -------------------------------------------------------------- de stand */

/**
 * Alles wat een scherm over één airco wil zeggen, in één object.
 *
 * @param {object|null} st de climate-state
 * @param {{sensor?: object|null, reserve?: object|null}} [meting]
 *   `sensor` is een temperatuursensor die de installateur koos: die wint van
 *   het apparaat. `reserve` is er een van hetzelfde apparaat (zie
 *   `apparaatDelen`): die telt alleen als het apparaat zelf niets meldt.
 */
export function aircoStand(st, { sensor = null, reserve = null } = {}) {
  const a = st?.attributes ?? {};
  const beschikbaar = !!st && !leeg(st.state);
  const stand = beschikbaar ? st.state : "";
  const aan = beschikbaar && stand !== "off";
  const actieRuw = leeg(a.hvac_action) ? null : a.hvac_action;
  // Een airco die uit staat, staat uit -- ook als de integratie nog een oude
  // actie meldt.
  const actie = aan && actieRuw && actieRuw !== "off" ? actieRuw : null;

  const laag = getal(a.target_temp_low);
  const hoog = getal(a.target_temp_high);
  const enkel = getal(a.temperature);
  // Een bereik als er geen enkel doel is, of als de stand er een is waarin het
  // bereik geldt. Ecobee meldt allebei; op heat_cool telt het bereik.
  const bereik = laag != null && hoog != null && (enkel == null || stand === "heat_cool");

  const huidig = getal(sensor?.state) ?? getal(a.current_temperature) ?? getal(reserve?.state);

  return {
    beschikbaar,
    aan,
    stand,
    standNaam: beschikbaar ? standNaam(stand) : "",
    actie,
    actieNaam: actie ? (ACTIE[actie] ? t(ACTIE[actie]) : standLabel(actie)) : "",
    soort: !beschikbaar ? "dood" : !aan ? "uit" : soortVan(stand, actie),
    huidig,
    doel: bereik ? null : enkel,
    laag: bereik ? laag : null,
    hoog: bereik ? hoog : null,
    vocht: getal(a.current_humidity),
  };
}

/**
 * Hoe de airco er nu bij staat, in een paar woorden.
 *
 *   "Niet bereikbaar" | "Uit" | "Koelt" | "Standby · Koelen" | "Koelen"
 *
 * Met `hvac_action` zegt hij wat hij doet; zonder alleen wat er gevraagd is.
 * Standby noemt de stand erbij, want "Standby" alleen zegt niet of hij straks
 * gaat koelen of verwarmen.
 */
export function statusTekst(s) {
  if (!s.beschikbaar) return t("Niet bereikbaar");
  if (!s.aan) return t("Uit");
  if (s.actie === "idle") return `${t("Standby")} · ${s.standNaam}`;
  return s.actieNaam || s.standNaam;
}

/**
 * Het doel als tekst, zonder graadteken als er geen doel is.
 *
 * @param {object} s uit `aircoStand`
 * @param {(n: number) => string} fmt een getal op zijn Nederlands
 * @returns {string} "22°", "21–24°" of ""
 */
export function doelTekst(s, fmt) {
  if (s.laag != null && s.hoog != null) return `${fmt(s.laag)}–${fmt(s.hoog)}°`;
  if (s.doel != null) return `${fmt(s.doel)}°`;
  return "";
}

/** Een graad zoals een mens hem leest: 21, 21,5. */
export const graden = (n, taal = locale()) =>
  Number(n).toLocaleString(taal, { minimumFractionDigits: n % 1 ? 1 : 0, maximumFractionDigits: 1 });

/* ------------------------------------------------------------ aan en uit */

/** De standen die een airco AAN zet, in volgorde van voorkeur. */
const AAN_VOORKEUR = ["heat_cool", "auto", "cool", "heat", "dry", "fan_only"];

/**
 * Aan- of uitzetten, als `[domein, service, data]`, of null.
 *
 * `climate.turn_on` laat de airco verdergaan in de stand van daarnet, en dat is
 * wat een mens van een aan-knop verwacht. Die service bestaat alleen als de
 * entiteit het zegt (`FUNCTIE.AAN`); anders kiezen we zelf een stand.
 */
export function aanUitOproep(st, aan) {
  if (!st || leeg(st.state)) return null;
  const id = st.entity_id;
  const modes = lijst(st.attributes?.hvac_modes);
  if (aan) {
    if (kan(st, FUNCTIE.AAN)) return ["climate", "turn_on", { entity_id: id }];
    const stand = AAN_VOORKEUR.find((m) => modes.includes(m)) ?? modes.find((m) => m !== "off");
    return stand ? ["climate", "set_hvac_mode", { entity_id: id, hvac_mode: stand }] : null;
  }
  if (kan(st, FUNCTIE.UIT)) return ["climate", "turn_off", { entity_id: id }];
  return modes.includes("off") ? ["climate", "set_hvac_mode", { entity_id: id, hvac_mode: "off" }] : null;
}

/* ------------------------------------------------------------- de standen */

/**
 * De standen om uit te kiezen, ZONDER Uit: daar is de aan-knop voor. Wat er
 * overblijft is wat een mens kiest als de airco aan staat.
 */
export function aircoStanden(st) {
  if (domeinVan(st?.entity_id) !== "climate") return [];
  const opties = standen(st).filter((o) => o.waarde !== "off");
  // `heat_cool` heet "Auto", maar een entiteit met OOK `auto` kreeg zo twee
  // knoppen Auto naast elkaar (de demo-ecobee, gezien op 13 oktober 2026).
  // Dan heet heat_cool "Warm/koud", want dat is wat hij doet: onder de ene
  // grens verwarmen, boven de andere koelen. Kort, omdat het in een knop
  // van een smalle kaart moet passen.
  const beide = opties.some((o) => o.waarde === "auto") && opties.some((o) => o.waarde === "heat_cool");
  return opties.map((o) => ({
    ...o,
    label: beide && o.waarde === "heat_cool" ? t("Warm/koud") : standNaam(o.waarde),
  }));
}

/** De stand die nu oplicht, of "" (ook als hij uit staat). */
export function gekozenStand(st) {
  const opties = aircoStanden(st);
  return huidigeStand(st, opties);
}

/** Een stand kiezen. Een airco die uit staat gaat daarmee ook aan. */
export const standKiezen = (st, stand) => standOproep(st, stand);

/* ----------------------------------------------------------------- het doel */

/** De stap van de stelknop: wat de entiteit zegt, anders een halve graad (°F: een hele). */
export function doelStap(st, eenheid = "°C") {
  const stap = Number(st?.attributes?.target_temp_step);
  if (Number.isFinite(stap) && stap > 0) return stap;
  return String(eenheid).includes("F") ? 1 : 0.5;
}

/**
 * Wat er te stellen valt: één doel, twee (een bereik), of niets.
 *
 * Een airco op Ventileren heeft bij de meeste merken wel een `temperature`,
 * maar die doet dan niets. Toch tonen: Home Assistant laat hem ook zien, en
 * wie terugzet naar Koelen wil weten waar hij staat.
 *
 * @returns {null | {soort: "enkel"|"bereik", min: number, max: number, stap: number,
 *                   doel?: number, laag?: number, hoog?: number}}
 */
export function doelInstelling(st, eenheid = "°C") {
  const s = aircoStand(st);
  if (!s.beschikbaar) return null;
  const a = st.attributes ?? {};
  const min = getal(a.min_temp) ?? 7;
  const max = getal(a.max_temp) ?? 35;
  const stap = doelStap(st, eenheid);
  if (s.laag != null && s.hoog != null) return { soort: "bereik", min, max, stap, laag: s.laag, hoog: s.hoog };
  if (s.doel != null) return { soort: "enkel", min, max, stap, doel: s.doel };
  return null;
}

/**
 * Het doel één tik verder. `welk` is "doel", "laag" of "hoog".
 *
 * Bij een bereik blijven laag en hoog minstens één stap uit elkaar; Home
 * Assistant weigert anders bij sommige integraties zonder dat je het ziet.
 */
export function volgendeWaarde(inst, welk, van, richting) {
  if (!inst) return null;
  const basis = Number.isFinite(van) ? van : inst[welk];
  const nieuw = volgendDoel({ min: inst.min, max: inst.max, stap: inst.stap, doel: inst[welk] }, basis, richting);
  if (inst.soort !== "bereik") return nieuw;
  if (welk === "laag") return Math.min(nieuw, (inst.hoog ?? inst.max) - inst.stap);
  if (welk === "hoog") return Math.max(nieuw, (inst.laag ?? inst.min) + inst.stap);
  return nieuw;
}

/**
 * Het doel opsturen. Bij een bereik gaan laag en hoog SAMEN, want
 * `climate.set_temperature` wil op zo'n entiteit allebei.
 *
 * @param {object} st
 * @param {{doel?: number, laag?: number, hoog?: number}} waarden
 */
export function doelOproep(st, waarden) {
  if (!st || leeg(st.state)) return null;
  const id = st.entity_id;
  if (Number.isFinite(waarden?.laag) && Number.isFinite(waarden?.hoog)) {
    return ["climate", "set_temperature", { entity_id: id, target_temp_low: waarden.laag, target_temp_high: waarden.hoog }];
  }
  if (Number.isFinite(waarden?.doel)) return ["climate", "set_temperature", { entity_id: id, temperature: waarden.doel }];
  return null;
}

/* ------------------------------------------- ventilator, lamellen, presets */

const VENTILATOR = {
  auto: nt("Auto"),
  low: nt("Laag"),
  lowest: nt("Laagst"),
  min: nt("Min"),
  quiet: nt("Stil"),
  silent: nt("Stil"),
  silence: nt("Stil"),
  medium: nt("Midden"),
  mid: nt("Midden"),
  middle: nt("Midden"),
  medium_low: nt("Midden-laag"),
  medium_high: nt("Midden-hoog"),
  high: nt("Hoog"),
  highest: nt("Hoogst"),
  max: nt("Max"),
  turbo: nt("Turbo"),
  powerful: nt("Krachtig"),
  strong: nt("Sterk"),
  diffuse: nt("Diffuus"),
  focus: nt("Gericht"),
  on: nt("Aan"),
  off: nt("Uit"),
  on_low: nt("Laag"),
  on_high: nt("Hoog"),
  auto_low: nt("Auto laag"),
  auto_high: nt("Auto hoog"),
};

const LAMEL = {
  auto: nt("Auto"),
  swing: nt("Zwaaien"),
  on: nt("Zwaaien"),
  off: nt("Vast"),
  both: nt("Beide"),
  vertical: nt("Op en neer"),
  horizontal: nt("Opzij"),
  left: nt("Links"),
  left_centre: nt("Links-midden"),
  left_center: nt("Links-midden"),
  centre: nt("Midden"),
  center: nt("Midden"),
  middle: nt("Midden"),
  right_centre: nt("Rechts-midden"),
  right_center: nt("Rechts-midden"),
  right: nt("Rechts"),
  wide: nt("Breed"),
  rangefull: nt("Breed"),
  split: nt("Gespreid"),
  top: nt("Boven"),
  up: nt("Boven"),
  highest: nt("Hoogst"),
  high: nt("Hoog"),
  middle_up: nt("Midden-boven"),
  middle_vertical: nt("Midden"),
  middle_down: nt("Midden-onder"),
  low: nt("Laag"),
  lowest: nt("Laagst"),
  bottom: nt("Onder"),
  down: nt("Onder"),
};

/** De presets die `standLabel` niet kent (Cozytouch); de rest kent hij wel. */
const PRESET = {
  none: nt("Geen"),
  activity: nt("Activiteit"),
  basic: nt("Basis"),
  prog: nt("Weekprogramma"),
  override: nt("Tijdelijk"),
};

/** Een preset in het Nederlands; wat hier niet staat, doet `standLabel`. */
export function presetLabel(m) {
  const kern = String(m ?? "").trim().toLowerCase();
  return PRESET[kern] ? t(PRESET[kern]) : standLabel(m);
}

/** Een stand met een nummer: "speed_3", "position_2", "level 4", "3". */
const genummerd = (s) => {
  const m = /^(?:speed|position|pos|level|stand|stage|fan|swing)?[_\s-]*(\d+)$/i.exec(String(s).trim());
  return m ? m[1] : null;
};

/** Een stand van de ventilator in het Nederlands; een nummer blijft een nummer. */
export function ventilatorLabel(m) {
  const kern = String(m ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  // Met het context-Engels van een stand: "Stil" is hier "Quiet", "Midden" "Medium".
  if (VENTILATOR[kern]) return tc("stand", VENTILATOR[kern]);
  return genummerd(m) ?? standLabel(m);
}

/** Een stand van de lamellen in het Nederlands. */
export function lamelLabel(m) {
  const kern = String(m ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (LAMEL[kern]) return t(LAMEL[kern]);
  return genummerd(m) ?? standLabel(m);
}

/**
 * De vier soorten keuzes naast de stand, elk met waar ze vandaan komen en
 * welke service ze zet. De volgorde is die op de kaart.
 */
export const KEUZES = {
  ventilator: {
    naam: nt("Ventilator"),
    lijst: "fan_modes",
    nu: "fan_mode",
    service: "set_fan_mode",
    veld: "fan_mode",
    label: ventilatorLabel,
  },
  lamellen: {
    naam: nt("Lamellen"),
    lijst: "swing_modes",
    nu: "swing_mode",
    service: "set_swing_mode",
    veld: "swing_mode",
    label: lamelLabel,
  },
  lamellen_opzij: {
    naam: nt("Opzij"),
    lijst: "swing_horizontal_modes",
    nu: "swing_horizontal_mode",
    service: "set_swing_horizontal_mode",
    veld: "swing_horizontal_mode",
    label: lamelLabel,
  },
  preset: {
    naam: nt("Programma"),
    lijst: "preset_modes",
    nu: "preset_mode",
    service: "set_preset_mode",
    veld: "preset_mode",
    label: presetLabel,
  },
};

/**
 * De keuzes van één soort, of [] als de airco ze niet heeft.
 *
 * @returns {Array<{waarde: string, label: string}>}
 */
export function keuzesVan(st, soort) {
  const def = KEUZES[soort];
  if (!def || domeinVan(st?.entity_id) !== "climate") return [];
  return lijst(st.attributes?.[def.lijst]).map((m) => ({ waarde: m, label: def.label(m) }));
}

/** Wat er nu gekozen is, of "". */
export function keuzeNu(st, soort) {
  const def = KEUZES[soort];
  const nu = def ? st?.attributes?.[def.nu] : null;
  return typeof nu === "string" ? nu : "";
}

/** De service-aanroep voor een keuze, of null als de waarde er niet bij hoort. */
export function keuzeOproep(st, soort, waarde) {
  const def = KEUZES[soort];
  const v = String(waarde ?? "");
  if (!def || !v || !keuzesVan(st, soort).some((o) => o.waarde === v)) return null;
  return ["climate", def.service, { entity_id: st.entity_id, [def.veld]: v }];
}

/* ------------------------------------------------- de rest van het apparaat */

const BUITEN = /outdoor|outside|exterior|buiten|ambient_out/i;
const STORING = /error|fault|storing|problem|alarm|defect/i;
/**
 * Wel een `temperature`-sensor, maar geen meting van de kamer: een grens of een
 * doel. `thermostat_temperature_z1` is van Cozytouch en stond op 31 oktober 2026
 * tien dagen op dezelfde waarde, ook terwijl de airco verwarmde.
 */
const GEEN_KAMER = /target|setpoint|temperature_adjustment|minimum|maximum|thermostat_temperature_z\d/i;

/**
 * De andere entiteiten van hetzelfde apparaat die iets over de airco zeggen.
 *
 * Op APPARAAT en `device_class`, met opzet niet op naam: een kamer-
 * temperatuursensor heet bij MELCloud "room_temperature", bij Daikin "inside"
 * en bij een ander weer anders, maar is altijd een `temperature`-sensor aan
 * hetzelfde apparaat. Alleen BUITEN, GEEN_KAMER en STORING kijken naar de
 * sleutel, omdat een buitenvoeler ook een temperatuur is, een ingestelde grens
 * ook (Cozytouch: `temperature_adjustment_min`), en een storing niet altijd de
 * klasse `problem` draagt (MELCloud: `error`, zonder klasse).
 *
 * @param {object} hass
 * @param {string} climateId
 * @returns {{kamer?: string, buiten?: string, vocht?: string, vermogen?: string,
 *            energie?: string, storing?: string}}
 */
export function apparaatDelen(hass, climateId) {
  const uit = {};
  const toestel = hass?.entities?.[climateId]?.device_id;
  if (!toestel) return uit;
  for (const [id, reg] of Object.entries(hass.entities)) {
    if (id === climateId || reg?.device_id !== toestel || reg?.hidden) continue;
    const st = hass.states?.[id];
    if (!st) continue;
    const domein = domeinVan(id);
    const dc = st.attributes?.device_class;
    const sleutel = `${reg.translation_key ?? ""} ${id}`;
    if (domein === "sensor") {
      if (dc === "temperature") {
        if (BUITEN.test(sleutel)) uit.buiten ??= id;
        else if (!GEEN_KAMER.test(sleutel)) uit.kamer ??= id;
      } else if (dc === "humidity") uit.vocht ??= id;
      else if (dc === "power") uit.vermogen ??= id;
      else if (dc === "energy") uit.energie ??= id;
    } else if (domein === "binary_sensor") {
      if (dc === "problem" || STORING.test(sleutel)) uit.storing ??= id;
    }
  }
  return uit;
}

/** Hoe een energiesensor heet op de kaart: over welke periode hij telt. */
export function energieLabel(id, reg) {
  const s = `${reg?.translation_key ?? ""} ${id ?? ""}`.toLowerCase();
  if (/month|maand/.test(s)) return t("Deze maand");
  if (/today|daily|dag|vandaag/.test(s)) return t("Vandaag");
  if (/year|jaar/.test(s)) return t("Dit jaar");
  return t("Verbruik");
}

/* ======================================================================
 * Wat alleen de airco-KAART nodig heeft (13 oktober 2026). Alles hierboven
 * deelt hij met het infoscherm; dit staat erachter zodat dat zo blijft.
 * ==================================================================== */

/**
 * Van een soort (zie `aircoStand`) naar een kleurnaam uit `TONES`.
 *
 * Alleen de chip draagt die kleur (Vormregels). Warm is zon, koud, drogen en
 * ventileren zijn het blauw van grid-in -- dezelfde afspraak als op de
 * klimaat- en de HVAC-kaart. Auto is het accent: hij doet iets, maar wat
 * zegt de entiteit niet. Stil, uit en onbereikbaar zijn neutraal.
 */
export const SOORT_TOON = {
  warm: "solar",
  koud: "water",
  droog: "water",
  lucht: "water",
  auto: "accent",
  stil: "neutral",
  uit: "neutral",
  dood: "neutral",
};

/**
 * De standen als knoppen op de kaart: Uit voorop, dan wat de entiteit kan.
 *
 * Uit staat er als de airco uit KAN (`turn_off` of de stand `off`), ook als
 * hij onbereikbaar is: dan staan de knoppen er grijs en weet je wat er was.
 *
 * De woorden komen uit `aircoStanden`, ook "Warm/koud" voor `heat_cool`
 * naast `auto`.
 *
 * @returns {Array<{waarde: string, label: string, gekozen: boolean}>}
 */
export function standKnoppen(st) {
  if (domeinVan(st?.entity_id) !== "climate") return [];
  const opties = aircoStanden(st);
  const kanUit = kan(st, FUNCTIE.UIT) || lijst(st.attributes?.hvac_modes).includes("off");
  const knoppen = [...(kanUit ? [{ waarde: "off", label: t("Uit") }] : []), ...opties];
  const nu = leeg(st.state) ? "" : st.state === "off" ? "off" : gekozenStand(st);
  return knoppen.map((k) => ({ waarde: k.waarde, label: k.label, gekozen: k.waarde === nu }));
}

/** Wat een tik op een standknop opstuurt: Uit zet uit, de rest kiest een stand. */
export function standKnopOproep(st, waarde) {
  if (waarde === "off") return aanUitOproep(st, false);
  return standKiezen(st, waarde);
}

/**
 * Passen deze keuzes als knoppen op één regel, of wordt het een keuzelijst?
 *
 * Hooguit zes, en samen niet te veel letters. MELCloud ("Auto 1 2 3 4 5")
 * past op 280 pixels; de demo-airco ("Laag Hoog Auto laag Auto hoog Uit")
 * heeft vijf keuzes maar 29 letters, en wordt op een telefoon vijf
 * afgekapte woorden. Eén keuze is geen keuze: die komt nergens.
 */
export function alsKnoppen(opties, { max = 6, letters = 24 } = {}) {
  if (!Array.isArray(opties) || opties.length < 2 || opties.length > max) return false;
  return opties.reduce((n, o) => n + String(o?.label ?? "").length, 0) <= letters;
}

/**
 * De tegels onder de bediening, alleen wat er is: energie, vermogen,
 * vochtigheid, buitentemperatuur. De kamertemperatuur staat al in de kop.
 *
 * Een sensor zonder getal (onbereikbaar, nog niets gemeten) geeft geen tegel:
 * een vak met "--" zegt niets wat de rest van de kaart niet al zegt.
 *
 * @param {object} hass
 * @param {object|null} st de climate-state (voor `current_humidity`)
 * @param {{delen?: object, energie?: string}} bronnen
 *   `delen` uit `apparaatDelen`; `energie` is de sensor uit de editor, die wint.
 * @returns {Array<{sleutel: string, label: string, waarde: string, eenheid: string, id: string}>}
 */
export function aircoFeiten(hass, st, { delen = {}, energie = "" } = {}, taal = locale()) {
  const uit = [];
  const lees = (id) => (id ? hass?.states?.[id] ?? null : null);
  const tegel = (sleutel, id, label, standaard) => {
    const s = lees(id);
    const n = getal(s?.state);
    if (n == null) return false;
    const eenheid = s.attributes?.unit_of_measurement ?? standaard;
    uit.push({ sleutel, label, waarde: formatteer(n, eenheid, taal), eenheid, id });
    return true;
  };

  const energieId = energie || delen.energie || "";
  tegel("energie", energieId, energieLabel(energieId, hass?.entities?.[energieId]), "kWh");
  tegel("vermogen", delen.vermogen, t("Vermogen"), "W");
  if (!tegel("vocht", delen.vocht, t("Vochtigheid"), "%")) {
    const v = getal(st?.attributes?.current_humidity);
    if (v != null) {
      uit.push({ sleutel: "vocht", label: t("Vochtigheid"), waarde: formatteer(v, "%", taal), eenheid: "%", id: st.entity_id });
    }
  }
  tegel("buiten", delen.buiten, t("Buiten"), "°C");
  return uit;
}

/* ------------------------------------------------------------- de foto */

const AFBEELDINGEN_BASIS = "/domotiapp_lovelace/afbeeldingen/";

/**
 * Productfoto's per model, net als `LAADPAAL_FOTOS`. Productfoto's van de
 * fabrikant, gebruikt met toestemming van de eigenaar als installateur
 * (Mitsubishi Electric: 13 oktober 2026). De bron staat in `_ref/aircos`; hier
 * staat een bijgesneden WebP onder `afbeeldingen/aircos/`. Die adressen staan
 * straks in dashboards: alleen aanvullen, nooit hernoemen.
 *
 * `merk` (één naam of een lijst) en `model` worden als STUK van de tekst gezocht
 * in de fabrikant en het model van het apparaat (kleine letters). Zonder `model`
 * is het de foto voor dat merk als er geen betere is. Zonder `merk` kiest
 * Automatisch hem NOOIT: dan moet hij in de editor gekozen worden.
 *
 * De Premium in Onyx Black heeft met opzet geen `merk`. MELCloud Home geeft
 * geen model door, en een Mitsubishi kan ook een witte of zilveren unit zijn.
 * Op merk zou elke Mitsubishi als een zwarte Premium verschijnen. Zijn keuze
 * op 13 oktober 2026: "Alleen als ik hem kies".
 *
 * Fujitsu General heeft wel een `merk`, en ook Atlantic: de eigenaar kent de
 * twee units op 31 oktober 2026 als Fujitsu, maar Cozytouch noemt ze Atlantic
 * met model "Air Conditioner (<kamer>)", dus op het type is er niets te kiezen.
 * Een unit die er anders uitziet zet je in de editor op Geen of Eigen.
 */
export const AIRCO_FOTOS = {
  mitsubishi_premium_onyx: {
    label: "Mitsubishi Electric Premium (Onyx Black)",
    pad: "aircos/mitsubishi-premium-onyx-black.webp",
  },
  fujitsu_general: {
    label: "Fujitsu General",
    merk: ["fujitsu", "atlantic"],
    pad: "aircos/fujitsu-general.webp",
  },
};

/**
 * Welke foto er bij een apparaat hoort, of null. Een foto met een passend
 * model gaat voor een die alleen op het merk past.
 *
 * @param {{manufacturer?: string, model?: string}|null} apparaat uit `hass.devices`
 */
export function fotoBijAirco(apparaat, fotos = AIRCO_FOTOS) {
  const fabrikant = String(apparaat?.manufacturer ?? "").toLowerCase();
  const model = String(apparaat?.model ?? "").toLowerCase();
  if (!fabrikant) return null;
  let opMerk = null;
  for (const [sleutel, f] of Object.entries(fotos ?? {})) {
    const merken = [f?.merk].flat().filter(Boolean);
    if (!merken.some((m) => fabrikant.includes(String(m).toLowerCase()))) continue;
    if (f.model) {
      if (model && model.includes(String(f.model).toLowerCase())) return sleutel;
    } else {
      opMerk ??= sleutel;
    }
  }
  return opMerk;
}

/**
 * Het adres van de afbeelding op de kaart, of "" (dan staat er een chip).
 *
 * Dezelfde afspraak als `laadpaalAfbeelding`:
 * - `geen`: geen afbeelding;
 * - `eigen`: de eigen afbeelding (leeg als er geen is);
 * - een sleutel uit `AIRCO_FOTOS`: die foto;
 * - `auto` (of niets): een eigen afbeelding als die er is, anders de foto bij
 *   merk en model van het apparaat, anders niets.
 */
export function aircoAfbeelding(keuze, apparaat, eigen = "", fotos = AIRCO_FOTOS) {
  if (keuze === "geen") return "";
  if (keuze === "eigen") return eigen || "";
  const lijstFotos = fotos ?? {};
  const foto = lijstFotos[keuze] ?? (!eigen ? lijstFotos[fotoBijAirco(apparaat, lijstFotos)] : null);
  if (foto?.pad) return AFBEELDINGEN_BASIS + foto.pad;
  return eigen || "";
}

/* ======================================================================
 * DomotiApp Coach (14 oktober 2026)
 *
 * De eigenaar koos die dag wat de coach met een airco mag: hem aan- en
 * uitzetten op zon die over is of op een goedkoop uur, met de temperatuur die
 * de bewoner op de KAART koos, en zelf kiezen tussen verwarmen en koelen.
 * Zet de bewoner hem zelf aan of uit, dan blijft de coach er tot middernacht
 * af. Ventilator en lamellen raakt hij nooit aan.
 *
 * Diezelfde avond stelde hij bij (coach v0.119.1): *"goedkoop uur mag de
 * bewoner zelf kiezen dus 3 opties of op zon of goedkope uren of beide"*. De
 * schakelaar "Alleen op zon" van 0.65.0 is daarmee een keuze uit drie
 * geworden.
 *
 * Het contract, afgesproken met de coach-sessie (contract blijft 1):
 *
 * | rol | wat |
 * |---|---|
 * | apparaat | fabrikant DomotiApp Coach, model "Airco", een per airco |
 * | sensor `coach` | `klimaat` (de climate), `stand`, `modus`, `reason`, `dynamisch`, `aan_op`, `bewoner_tot`, `ruimte` |
 * | number `doeltemperatuur` | wat de bewoner wil; min, max en step zijn die van de climate |
 * | select `aan_op` | `zon`, `goedkoop` of `beide`: waarop de coach hem aanzet (sinds v0.119.1) |
 * | switch `pauze` | de coach doet niets |
 *
 * Coach v0.119.0 had in plaats van de select een switch `alleen_zon`. Er hing
 * toen nog nergens een airco aan de coach, en die switch leest deze kaart
 * niet meer.
 *
 * WAAR HET DOEL HEEN GAAT
 *
 * Stuurt een coach de airco, dan schrijft de kaart het doel naar de number en
 * NIET naar de climate. De coach is de enige die de climate schrijft: staat de
 * airco aan, dan zet hij het nieuwe doel er meteen op; staat hij uit, dan
 * bewaart hij het voor de volgende keer dat hij hem aanzet. Schreef de kaart
 * de climate, dan zette de coach bij het aanzetten het oude doel terug.
 *
 * Een temperatuur op de afstandsbediening of in de app van de airco neemt de
 * coach over in de number: wie het laatst bewoog wint.
 *
 * `metCoachDoel` maakt daarom van de climate een climate met het doel van de
 * coach erin. Alles wat het doel tekent of verzet (`aircoStand`,
 * `doelInstelling`, `volgendeWaarde`) werkt daarmee zonder te weten dat er een
 * coach is; alleen het OPSTUREN kiest (`doelOproepVoor`).
 *
 * WAT DE KAART NIET DOET
 *
 * Hij beslist niets op de toestandstekst (valkuil 67) of op `reason`: die zin
 * is om te tonen. Wat hij kiest, kiest hij op `stand` en `dynamisch`.
 * ==================================================================== */

/** De modellen van de coach die een airco zijn. */
export const AIRCO_MODELLEN = ["Airco"];

/**
 * De apparaten van de coach met model Airco, elk met zijn rollen.
 *
 * Los van `aircoCoach`, zodat een kaart dit kan vasthouden zolang het register
 * gelijk blijft: het register verandert zelden, de toestanden elke seconde.
 *
 * @returns {{id: string, rollen: Record<string, string>}[]}
 */
export function coachAircos(hass) {
  return coachApparaten(hass, AIRCO_MODELLEN).map((a) => ({ id: a.id, rollen: coachRollen(hass, a.id) }));
}

/**
 * Het coach-apparaat dat deze airco stuurt, of null.
 *
 * Gevonden aan het attribuut `klimaat` van zijn sensor `coach`, zodat er in de
 * editor niets extra te kiezen is: wie de airco kiest, krijgt de coach erbij.
 * Is die sensor onbereikbaar, dan is er geen `klimaat` en werkt de kaart als
 * een gewone airco-kaart. Dat is goed: een coach die er niet is, stuurt niets.
 *
 * @param {object} hass
 * @param {string} climateId
 * @param {{id: string, rollen: Record<string, string>}[]} [aircos] uit `coachAircos`
 * @returns {{id: string, rollen: Record<string, string>}|null}
 */
export function aircoCoach(hass, climateId, aircos = coachAircos(hass)) {
  if (!climateId) return null;
  for (const a of aircos ?? []) {
    const st = a?.rollen?.coach ? hass?.states?.[a.rollen.coach] : null;
    if (st && st.state !== "unavailable" && st.attributes?.klimaat === climateId) return a;
  }
  return null;
}

/** Een tijdstip met zone als `Date`, of null. */
function moment(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(s)) return null;
  const d = new Date(s);
  return Number.isNaN(+d) ? null : d;
}

/**
 * Wat de coach over de airco zegt, uit de attributen van zijn sensor.
 *
 * @param {object|null} st de state van de sensor `coach`
 * @returns {null | {contract: number, stand: string, modus: ""|"heat"|"cool",
 *                   reden: string, dynamisch: boolean, aanOp: string, bewonerTot: Date|null, ruimte: string}}
 */
export function aircoCoachStand(st) {
  const a = st?.attributes;
  if (!a || st.state === "unavailable") return null;
  return {
    contract: contractVan(st),
    stand: typeof a.stand === "string" ? a.stand : "",
    modus: a.modus === "heat" || a.modus === "cool" ? a.modus : "",
    // Een zin in een andere taal valt weg; `coachRegel` geeft dan het woord bij de stand.
    reden: typeof a.reason === "string" && !spreektAnders(st) ? a.reason.trim() : "",
    // Alleen echt waar telt: zonder dit attribuut zijn er geen goedkope uren.
    dynamisch: a.dynamisch === true,
    // Waarop de coach hem aanzet (v0.119.1); "" bij een coach zonder.
    aanOp: typeof a.aan_op === "string" ? a.aan_op : "",
    bewonerTot: moment(a.bewoner_tot),
    ruimte: typeof a.ruimte === "string" ? a.ruimte : "",
  };
}

/**
 * Per stand het woord als de coach geen zin meestuurt. De coach stuurt er
 * altijd een (`reason`), net als bij de laadpaal; dit is het vangnet.
 */
export const COACH_STANDEN = {
  zon: nt("Aan op zon."),
  goedkoop: nt("Aan op een goedkoop uur."),
  op_temperatuur: nt("Op temperatuur."),
  uit: nt("Wacht op zon."),
  bewoner: nt("Zelf bediend."),
  pauze: nt("De coach is gepauzeerd."),
  geen_meting: nt("De coach mist een meting."),
};

/** "middernacht" of "14:30". */
function klok(d) {
  if (d.getHours() === 0 && d.getMinutes() === 0) return t("middernacht");
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * De regel van de coach op de kaart: zijn eigen zin, en anders een woord bij
 * de stand. Leeg zonder coach, en bij een stand die deze kaart niet kent:
 * een nieuwe stand is toevoegen, en dan zegt de kaart liever niets dan iets
 * verkeerds.
 *
 * Bij wachten zegt hij waarop: wat de bewoner bij "Aan op" koos. Zonder
 * dynamisch contract zijn er geen goedkope uren, en wacht hij op zon.
 *
 * @param {ReturnType<typeof aircoCoachStand>} s
 */
export function coachRegel(s) {
  if (!s) return "";
  if (s.reden) return s.reden;
  if (s.stand === "bewoner") {
    return s.bewonerTot
      ? t("Zelf bediend. De coach doet weer mee vanaf {klok}.", { klok: klok(s.bewonerTot) })
      : t(COACH_STANDEN.bewoner);
  }
  if (s.stand === "uit" && s.dynamisch) {
    if (s.aanOp === "goedkoop") return t("Wacht op een goedkoop uur.");
    if (s.aanOp === "beide") return t("Wacht op zon of een goedkoop uur.");
  }
  return COACH_STANDEN[s.stand] ? t(COACH_STANDEN[s.stand]) : "";
}

/**
 * De drie keuzes van "Aan op", met een kort woord voor de knop en de naam
 * zoals de coach hem gebruikt. Kort, want drie knoppen moeten op een kaart van
 * 280 pixels passen: "Zon en goedkope uren" past daar niet in een knop.
 */
export const AAN_OP = {
  zon: { label: nt("Zon"), naam: nt("Zon over") },
  goedkoop: { label: nt("Goedkoop"), naam: nt("Goedkope uren") },
  beide: { label: nt("Beide"), naam: nt("Zon en goedkope uren") },
};

/**
 * De keuze "Aan op" voor de kaart, of null als er niets te kiezen is.
 *
 * Alleen bij een dynamisch contract: bij een vast contract is geen uur
 * goedkoper dan een ander, en kiest de coach dus altijd zon. De opties komen
 * uit de select zelf; een optie die deze kaart niet kent staat er met zijn
 * eigen naam bij, zodat een keuze die de coach later toevoegt niet verdwijnt.
 *
 * @param {object|null} st de select `aan_op`
 * @param {ReturnType<typeof aircoCoachStand>} s
 * @returns {null | {id: string, gekozen: string, opties: Array<{waarde: string, label: string, naam: string}>}}
 */
export function aanOpKeuzes(st, s) {
  if (!s?.dynamisch || !st || leeg(st.state)) return null;
  const opties = lijst(st.attributes?.options).map((w) => ({
    waarde: w,
    label: AAN_OP[w] ? t(AAN_OP[w].label) : standLabel(w),
    naam: AAN_OP[w] ? t(AAN_OP[w].naam) : standLabel(w),
  }));
  if (opties.length < 2) return null;
  return { id: st.entity_id, gekozen: st.state, opties };
}

/** Een keuze van "Aan op" opsturen, of null als die er niet bij hoort. */
export function aanOpOproep(st, waarde) {
  if (!st || leeg(st.state) || !lijst(st.attributes?.options).includes(waarde)) return null;
  return ["select", "select_option", { entity_id: st.entity_id, option: waarde }];
}

/**
 * De climate met het doel van de coach erin, of de climate zoals hij is.
 *
 * Het doel wordt `temperature`, en de grenzen die van de number. Een bereik
 * (`target_temp_low`/`_high`) valt weg: de coach kiest zelf verwarmen of
 * koelen, en heeft dus één doel. Weet de number niets (de climate zei bij de
 * eerste keer zelf niets), dan blijft de climate zoals hij is.
 *
 * @param {object|null} st de climate
 * @param {object|null} doelSt de number `doeltemperatuur`
 */
export function metCoachDoel(st, doelSt) {
  const doel = getal(doelSt?.state);
  if (!st || doel == null) return st;
  const n = doelSt.attributes ?? {};
  const a = { ...(st.attributes ?? {}), temperature: doel };
  delete a.target_temp_low;
  delete a.target_temp_high;
  if (getal(n.min) != null) a.min_temp = getal(n.min);
  if (getal(n.max) != null) a.max_temp = getal(n.max);
  if (getal(n.step) > 0) a.target_temp_step = getal(n.step);
  return { ...st, attributes: a };
}

/**
 * Het doel opsturen: naar de coach als die er is, anders naar de airco.
 *
 * @param {object|null} st de climate
 * @param {object|null} doelSt de number `doeltemperatuur`, of null zonder coach
 * @param {{doel?: number, laag?: number, hoog?: number}} waarden
 */
export function doelOproepVoor(st, doelSt, waarden) {
  if (doelSt?.entity_id && doelSt.state !== "unavailable" && Number.isFinite(waarden?.doel)) {
    return ["number", "set_value", { entity_id: doelSt.entity_id, value: waarden.doel }];
  }
  return doelOproep(st, waarden);
}

/**
 * De schakelaars van de coach onder het doel: Pauze, als die er is.
 *
 * In 0.65.0 stond hier ook "Alleen op zon" (switch `alleen_zon` van coach
 * v0.119.0). Sinds v0.119.1 is dat de keuze "Aan op" (`aanOpKeuzes`), en die
 * switch bestaat niet meer.
 *
 * @param {object} hass
 * @param {Record<string, string>} rollen
 * @param {ReturnType<typeof aircoCoachStand>} s
 * @returns {Array<{rol: string, id: string, aan: boolean, label: string, icoon: string}>}
 */
export function coachKnoppen(hass, rollen, s) {
  const uit = [];
  const knop = (rol, label, icoon) => {
    const st = rollen?.[rol] ? hass?.states?.[rollen[rol]] : null;
    if (!st || st.state === "unavailable") return;
    uit.push({ rol, id: st.entity_id, aan: st.state === "on", label, icoon });
  };
  if (s) knop("pauze", t("Pauze"), "pause");
  return uit;
}
