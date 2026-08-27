/**
 * Het rekenwerk van de autokaart, zonder DOM.
 *
 * Gevraagd op 27 augustus 2026: *"Dan wil ik een autokaart hebben voor auto's
 * die in HA kunnen. Kunnen selecteren brandstof, hybride of elektrisch.
 * Actieradiusbalk en laadtoestandbalk, verschillende sensoren die ik kan
 * invullen. Afbeelding uploaden van de auto etc etc, maak hem universeel en
 * zoveel mogelijk opties om in te vullen. Wel minimalistische GUI-editor."*
 *
 * "Universeel" is hier het hele punt en meteen het lastigste. Elke
 * auto-integratie meldt zijn eigen eenheden: de een geeft de actieradius in
 * kilometers, de ander in mijlen; de een geeft het tankniveau in procenten, de
 * ander in liters; en een laadstatus heet bij iedereen anders. Dat allemaal
 * gladstrijken is het werk van dit bestand, en het is precies het soort werk
 * waar een fout stil in blijft -- een balk die op 100% blijft staan ziet er
 * prima uit.
 */

/** De drie aandrijvingen. Ze bepalen welke balken er op de kaart staan. */
export const AANDRIJVING = {
  fuel: { label: "Brandstof", icoon: "petrol" },
  hybrid: { label: "Hybride", icoon: "leaf" },
  electric: { label: "Elektrisch", icoon: "bolt" },
};

/** Heeft deze auto een accu die je oplaadt? */
export const heeftAccu = (soort) => soort === "electric" || soort === "hybrid";

/** Heeft deze auto een tank? */
export const heeftTank = (soort) => soort === "fuel" || soort === "hybrid";

/**
 * De woorden waarmee een auto zegt dat hij aan de lader hangt.
 *
 * Per integratie anders, en soms is het een `binary_sensor` (on/off), soms een
 * `sensor` met een woord erin. Allebei komen hier binnen.
 */
const LAADT = ["charging", "charge", "fast_charging", "dc_charging", "on", "true", "laden"];
const KLAAR = ["complete", "completed", "fully_charged", "full", "done", "finished"];
const AAN_LADER = ["connected", "plugged", "plugged_in", "cable_connected", "ready_to_charge"];
// De stekker zit er niet in. Zijn Ford meldt dat als `NOT_PLUGGED_IN`, gemeten
// op zijn eigen installatie op 27 augustus 2026 -- en zonder dat woord viel het
// door naar "iets dat we niet kennen", waarna er niets op de kaart stond. Dat
// was precies zijn melding: *"als ik daar de laadstatus in vul, die staat nu op
// NOT_PLUGGED_IN, dan zie ik niks."*
const LOS = [
  "not_plugged_in",
  "not_plugged",
  "notpluggedin",
  "unplugged",
  "disconnected",
  "not_charging",
  "notcharging",
  "off",
  "false",
  "idle",
  "no",
];

/**
 * Wat de auto met laden aan het doen is.
 *
 * @returns {"charging"|"complete"|"connected"|"idle"|null}
 */
export function laadStand(st) {
  const ruw = String(st?.state ?? "").trim().toLowerCase();
  if (!ruw || ruw === "unavailable" || ruw === "unknown") return null;
  if (LAADT.includes(ruw)) return "charging";
  if (KLAAR.includes(ruw)) return "complete";
  if (AAN_LADER.includes(ruw)) return "connected";
  if (LOS.includes(ruw)) return "idle";
  // Iets dat we niet kennen, maar de auto meldt wel íéts. Dat is nadrukkelijk
  // niet hetzelfde als "niet aan de lader": het woord komt dan zelf op de kaart,
  // want een veld dat je invult hoort iets te laten zien.
  return "onbekend";
}

/**
 * Het woord dat bij deze laadstand op de kaart komt.
 *
 * Kennen we de stand niet, dan is dat het woord van de sensor zelf, leesbaar
 * gemaakt: `NOT_PLUGGED_IN` wordt "Not plugged in". Zo staat er altijd iets, ook
 * bij een integratie met woorden die wij niet kennen -- en dan is meteen te zien
 * wélk woord er ontbreekt, in plaats van dat de kaart leeg blijft.
 */
export function laadTekst(stand, st) {
  if (stand && stand !== "onbekend") return LAADWOORD[stand] ?? "";
  const ruw = String(st?.state ?? "").trim();
  if (!ruw || ruw === "unavailable" || ruw === "unknown") return "";
  const woorden = ruw.replace(/[_-]+/g, " ").toLowerCase();
  return woorden.charAt(0).toUpperCase() + woorden.slice(1);
}

export const LAADWOORD = {
  charging: "Aan het laden",
  complete: "Volgeladen",
  connected: "Aan de lader",
  idle: "Niet aan de lader",
};

/**
 * Een percentage tussen 0 en 100, of null.
 *
 * Accepteert ook een sensor die niet in procenten meldt maar in liters, mits er
 * een maximum bij staat. Dat is geen zeldzaamheid: een Volkswagen meldt zijn
 * tank in procenten, een Toyota in liters.
 */
export function pct(st, max) {
  const n = Number(st?.state);
  if (!Number.isFinite(n)) return null;

  const eenheid = String(st?.attributes?.unit_of_measurement ?? "").toLowerCase();
  const grens = Number(max);
  if (eenheid !== "%" && Number.isFinite(grens) && grens > 0) {
    return Math.max(0, Math.min(100, Math.round((n / grens) * 100)));
  }
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * De actieradius met zijn eenheid, of null.
 *
 * De eenheid komt van de sensor zelf en wordt niet omgerekend: wie zijn Home
 * Assistant op mijlen heeft staan, wil mijlen zien. Hem stil naar kilometers
 * omrekenen zou een getal opleveren dat nergens anders in huis zo staat.
 */
export function afstand(st) {
  const n = Number(st?.state);
  if (!Number.isFinite(n)) return null;
  return {
    waarde: Math.round(n),
    eenheid: st?.attributes?.unit_of_measurement ?? "km",
  };
}

/**
 * Hoe vol is de accu of de tank, als getal én als balkstand.
 *
 * De grens waaronder het opvalt is 20%: dat is waar vrijwel elke auto zelf ook
 * begint te piepen. Onder de 10% wordt het kritiek. Rood en oranje zijn hier
 * status en geen identiteit, en dat mag (zie theme.js).
 */
export function niveau(procent) {
  if (procent === null || procent === undefined) return null;
  const toon = procent <= 10 ? "bad" : procent <= 20 ? "warn" : "good";
  return { procent, toon };
}

/**
 * Hoeveel minuten er nog geladen moet worden, of null.
 *
 * Dezelfde drie vormen als bij de printer: minuten, een klok, of het tijdstip
 * waarop hij klaar is.
 */
export function ladenTot(st, nu = Date.now()) {
  const ruw = String(st?.state ?? "").trim();
  if (!ruw || ruw === "unavailable" || ruw === "unknown") return null;

  if (st?.attributes?.device_class === "timestamp" || /[T ]\d{2}:\d{2}/.test(ruw)) {
    const t = Date.parse(ruw);
    if (Number.isFinite(t)) return Math.max(0, Math.round((t - nu) / 60000));
  }
  if (/^\d+:\d{2}(:\d{2})?$/.test(ruw)) {
    const d = ruw.split(":").map(Number);
    const [u, m] = d.length === 3 ? d : [0, d[0]];
    return u * 60 + m;
  }
  const n = Number(ruw);
  if (!Number.isFinite(n)) return null;
  const eenheid = String(st?.attributes?.unit_of_measurement ?? "").toLowerCase();
  if (eenheid === "h" || eenheid.startsWith("hour")) return Math.round(n * 60);
  if (eenheid === "s" || eenheid.startsWith("sec")) return Math.round(n / 60);
  return Math.round(n);
}

/** "2 u 15" of "45 min". */
export function alsDuur(minuten) {
  if (minuten === null || minuten === undefined) return "";
  const m = Math.max(0, Math.round(minuten));
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} u ${String(m % 60).padStart(2, "0")}`;
}

/**
 * De regel onder de naam: wat is er op dit moment het vermelden waard?
 *
 * De rangorde doet ertoe, want er past er maar één. Van boven naar beneden:
 * een auto die openstaat is belangrijker dan een auto die laadt, en die is
 * belangrijker dan hoe ver hij nog komt. Dezelfde afweging als bij de
 * vaatwasser: wat je moet WETEN gaat voor wat je wilt weten.
 *
 * @param {object} gegevens
 * @returns {{tekst: string, toon: string}}
 */
export function statusregel({ open, slot, laden, laadMinuten, radius, aandrijving }) {
  if (open) return { tekst: "Er staat iets open", toon: "warn" };
  if (slot === "unlocked") return { tekst: "Niet op slot", toon: "warn" };

  if (laden === "charging") {
    const bij = laadMinuten ? ` · nog ${alsDuur(laadMinuten)}` : "";
    return { tekst: `${LAADWOORD.charging}${bij}`, toon: "accent" };
  }
  if (laden === "complete") return { tekst: LAADWOORD.complete, toon: "good" };
  if (laden === "connected") return { tekst: LAADWOORD.connected, toon: "neutral" };

  if (radius) return { tekst: `Nog ${radius.waarde} ${radius.eenheid}`, toon: "neutral" };
  return { tekst: AANDRIJVING[aandrijving]?.label ?? "", toon: "neutral" };
}

/* ------------------------------------------------------------------ locatie
 *
 * Gevraagd op 27 augustus 2026: *"mijn 'waar staat de auto'-sensor is een
 * coordinaat: {lat: 51.92909, lon: 6.07115, alt: 15.0}. Kan je dat converteren
 * naar thuis of afwezig? Bepaal dat met de ingestelde locatie van Home
 * Assistant. Maak hem universeel dat hij ook kan uitlezen als een sensor wel
 * thuis of afwezig toont."*
 *
 * Drie vormen komen dus binnen, en alle drie worden ze gelezen:
 *
 * 1. een `device_tracker` of sensor die gewoon `home` / `not_home` zegt;
 * 2. dezelfde in woorden -- `Thuis`, `Away`, of de naam van een zone;
 * 3. een coordinaat, als state of in de attributen.
 *
 * Bij een coordinaat rekenen we de afstand tot de locatie van Home Assistant
 * uit. Dat is precies wat hij vroeg, en het is ook de enige bron die altijd
 * klopt: een zone kan verplaatst zijn, `hass.config` is waar het huis staat.
 */

/** Hoe dicht je bij huis moet staan om "thuis" te heten, in meters. */
export const THUIS_STRAAL_M = 100;

const THUIS_WOORDEN = ["home", "thuis", "at_home", "athome"];
const WEG_WOORDEN = ["not_home", "away", "afwezig", "weg", "not home", "nothome"];

/**
 * De afstand tussen twee punten op aarde, in meters.
 *
 * Haversine. Op deze afstanden zou een platte benadering ook voldoen, maar dit
 * is even kort en het klopt overal.
 */
export function afstandM(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Haal een coordinaat uit een entiteit, of null.
 *
 * Twee plekken: de attributen (zoals een `device_tracker` het doet) en de state
 * zelf. Dat laatste is wat zijn sensor doet -- er staat letterlijk een dict in,
 * en afhankelijk van de integratie met dubbele of enkele aanhalingstekens. Dus
 * niet `JSON.parse`, maar de getallen eruit lezen.
 */
export function coordinaatVan(st) {
  const a = st?.attributes ?? {};
  const lat = Number(a.latitude ?? a.lat);
  const lon = Number(a.longitude ?? a.lon ?? a.lng);
  if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };

  const ruw = String(st?.state ?? "");
  // De aanhalingstekens moeten mee. Zijn sensor levert letterlijk
  // {'lat': 51.92909, 'lon': 6.07115, 'alt': 15.0} -- met een apostrof TUSSEN
  // de naam en de dubbele punt. Zonder die toevoeging matcht er niets en valt
  // de kaart terug op "we weten het niet", precies zoals bij de eerste meting.
  const mLat = ruw.match(/(?:lat|latitude)["']?\s*[:=]\s*(-?\d+(?:\.\d+)?)/i);
  const mLon = ruw.match(/(?:lon|lng|longitude)["']?\s*[:=]\s*(-?\d+(?:\.\d+)?)/i);
  if (mLat && mLon) return { lat: Number(mLat[1]), lon: Number(mLon[1]) };
  return null;
}

/**
 * Staat de auto thuis?
 *
 * @param {object|null} st de locatie-entiteit
 * @param {object} hass om `hass.config.latitude/longitude` te kunnen lezen
 * @param {number} straal hoe ruim "thuis" is, in meters
 * @returns {{thuis: boolean|null, tekst: string, meters: number|null}}
 *   `thuis: null` betekent: we weten het niet. Dat is iets anders dan afwezig.
 */
export function locatie(st, hass, straal = THUIS_STRAAL_M) {
  if (!st) return { thuis: null, tekst: "", meters: null };

  const ruw = String(st.state ?? "").trim();
  const klein = ruw.toLowerCase();
  if (klein === "unavailable" || klein === "unknown" || !ruw) {
    return { thuis: null, tekst: "", meters: null };
  }

  // 1 en 2: een woord. Dit gaat vóór het coordinaat, want een tracker die
  // "home" zegt weet dat beter dan wij met een straal eromheen -- die kent de
  // zone zoals de gebruiker hem heeft ingesteld.
  if (THUIS_WOORDEN.includes(klein)) return { thuis: true, tekst: "Thuis", meters: null };
  if (WEG_WOORDEN.includes(klein)) return { thuis: false, tekst: "Afwezig", meters: null };

  // 3: een coordinaat.
  const punt = coordinaatVan(st);
  const thuisLat = Number(hass?.config?.latitude);
  const thuisLon = Number(hass?.config?.longitude);
  if (punt && Number.isFinite(thuisLat) && Number.isFinite(thuisLon)) {
    const m = afstandM(punt.lat, punt.lon, thuisLat, thuisLon);
    const thuis = m <= straal;
    return {
      thuis,
      tekst: thuis ? "Thuis" : "Afwezig",
      meters: Math.round(m),
    };
  }

  // Een zonenaam, of iets anders dat de integratie zegt. Dat is geen "thuis",
  // maar het is wel informatie -- en die hoort op de kaart in plaats van niets.
  // De hoofdletter erop, want een zone heet "werk" en niet "Werk".
  return { thuis: false, tekst: ruw.charAt(0).toUpperCase() + ruw.slice(1), meters: null };
}

/* ------------------------------------------------- deuren, ramen en het slot
 *
 * Gemeld op 27 augustus 2026: *"bij ramen filter je alleen op binaire sensor,
 * maar mijn bus geeft een normale sensor, een status LOCKED bijvoorbeeld."*
 *
 * Read-only nagemeten op zijn installatie, en het was alle drie raak. Zijn Ford
 * Transit Connect levert:
 *
 *     sensor..._doorstatus       = "Closed"
 *     sensor..._windowposition   = "Closed"
 *     sensor..._doorlock         = "LOCKED"
 *
 * Geen `binary_sensor`, geen `lock` -- gewone sensoren met een Engels woord
 * erin. De kaart keek naar `isOn()`, en dat is voor geen van drieën waar. Dus
 * meldde hij nooit iets, ook niet als er wél iets openstond.
 */

const OPEN_WOORDEN = ["open", "opened", "ajar", "unlatched", "on", "true", "unlocked"];
const DICHT_WOORDEN = [
  "closed",
  "close",
  "shut",
  "secured",
  "locked",
  "off",
  "false",
  "not_open",
];

/**
 * Staat dit open?
 *
 * @returns {boolean|null} null betekent: we weten het niet. Dat is iets anders
 *   dan dicht, en de kaart hoort er dan ook niets over te zeggen.
 */
export function staatOpen(st) {
  const ruw = String(st?.state ?? "").trim().toLowerCase();
  if (!ruw || ruw === "unavailable" || ruw === "unknown") return null;
  if (OPEN_WOORDEN.includes(ruw)) return true;
  if (DICHT_WOORDEN.includes(ruw)) return false;
  // Een Ford meldt bij een open deur welke deur het is ("Driver Door Ajar").
  // Zo'n zin hoort als OPEN te tellen, niet als onbekend.
  if (/(^|[^a-z])(ajar|open)([^a-z]|$)/.test(ruw)) return true;
  return null;
}

/**
 * Zit hij op slot?
 *
 * @returns {boolean|null}
 */
export function opSlot(st) {
  const ruw = String(st?.state ?? "").trim().toLowerCase();
  if (!ruw || ruw === "unavailable" || ruw === "unknown") return null;

  const domein = String(st?.entity_id ?? "").split(".")[0];
  if (domein === "lock") {
    if (ruw === "locked") return true;
    if (ruw === "unlocked" || ruw === "open" || ruw === "opening") return false;
    return null; // jammed, locking, unlocking -- daar valt niets zinnigs over te zeggen
  }

  // Een `binary_sensor` met device_class `lock` volgt de afspraak van Home
  // Assistant: ON betekent ONTGRENDELD. Dat is precies andersom dan je zou
  // gokken, en het is de reden dat dit hier apart staat.
  if (st?.attributes?.device_class === "lock") {
    if (ruw === "on") return false;
    if (ruw === "off") return true;
  }

  if (["locked", "lock", "secured", "closed", "off", "false"].includes(ruw)) return true;
  if (["unlocked", "unlock", "open", "unsecured", "on", "true"].includes(ruw)) return false;
  return null;
}

/**
 * Kan deze entiteit ook echt op slot gezet worden, of is het alleen een melding?
 *
 * Zijn `sensor..._doorlock` vertelt de stand maar neemt geen opdrachten aan. Een
 * knop die niets doet is erger dan geen knop -- dan wordt het een tegel.
 */
export function slotIsBedienbaar(entityId) {
  return String(entityId ?? "").split(".")[0] === "lock";
}
