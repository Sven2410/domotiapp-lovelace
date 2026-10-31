/**
 * Wat de weerstationkaart zegt, los van hoe hij eruitziet.
 *
 * Gevraagd op 31 oktober 2026; de inhoud kwam van de beheersessie. Eerst de Shelly
 * BLU Weather Station (SBWS-90CM) via BTHome, de dump staat in
 * `tests/js/vaste-invoer/shelly-blu-weerstation.json`. De kaart werkt op ROLLEN, dus
 * een ander station kan ook, en elke rol is in de editor met de hand te kiezen.
 *
 * DE ROLLEN VIND JE OP HET APPARAAT, NIET OP DE NAAM
 *
 * Dezelfde sensor heet bij de ene installatie `sensor.weather_station_uv_index` en bij
 * de andere `sensor.weerstation_uv_index`. Dus: wat bij hetzelfde apparaat hoort, op
 * `translation_key` en `device_class`.
 *
 * TWEE WINDSENSOREN MET DEZELFDE NAAM
 *
 * BTHome geeft wind en windstoot allebei de naam "Speed", dezelfde `device_class` en
 * geen `translation_key`. Alleen `_2` onderscheidt ze, en in de geschiedenis is `_2`
 * altijd de hoogste. De laagste index is dus de wind, en als ze ooit andersom blijken
 * te staan, draait `weerStand` ze om: een stoot is nooit lager dan de wind.
 */

import { locale, nt, t } from "../taal.js";

const leeg = (s) => s == null || s === "" || s === "unknown" || s === "unavailable";

/** Een getal, of null. `Number(null)` is 0, en dat is geen meting. */
export function getal(ruw) {
  if (leeg(ruw)) return null;
  const n = Number(ruw);
  return Number.isFinite(n) ? n : null;
}

const fmt = (n, decimalen = 0) =>
  n.toLocaleString(locale(), { minimumFractionDigits: decimalen, maximumFractionDigits: decimalen });

/** De sleutels in de config waarmee een rol met de hand gekozen wordt. */
export const ROLLEN = ["vocht", "dauwpunt", "wind", "windstoot", "richting", "regent", "neerslag", "uv", "licht", "druk", "batterij"];

const natuurlijk = (a, b) => a.length - b.length || a.localeCompare(b);

/** De andere entiteiten op het apparaat van deze sensor, de laagste index eerst. */
export function burenVan(hass, id) {
  const apparaat = hass?.entities?.[id]?.device_id;
  if (!apparaat) return [];
  return Object.values(hass.entities)
    .filter((e) => e.device_id === apparaat && e.entity_id !== id)
    .sort((a, b) => natuurlijk(a.entity_id, b.entity_id));
}

/**
 * De rol van elke entiteit op het apparaat van deze temperatuursensor.
 *
 * @param {object} hass met `entities` en `states`
 * @param {string} id de temperatuursensor
 * @param {object} [config] een rol die hier staat, gaat voor
 * @param {object[]} [buren] uit `burenVan`, als die al bekend zijn
 * @returns {Record<string, string>} rol -> entity_id
 */
export function weerRollen(hass, id, config = {}, buren = burenVan(hass, id)) {
  const uit = {};
  const winden = [];
  for (const e of buren) {
    const domein = e.entity_id.split(".")[0];
    const dc = hass.states?.[e.entity_id]?.attributes?.device_class;
    const tk = e.translation_key;
    if (domein === "binary_sensor") {
      if (dc === "moisture") uit.regent ??= e.entity_id;
      continue;
    }
    if (domein !== "sensor") continue;
    if (tk === "dew_point") uit.dauwpunt ??= e.entity_id;
    else if (tk === "direction" || tk === "wind_direction") uit.richting ??= e.entity_id;
    else if (tk === "uv_index") uit.uv ??= e.entity_id;
    else if (dc === "humidity") uit.vocht ??= e.entity_id;
    else if (dc === "pressure" || dc === "atmospheric_pressure") uit.druk ??= e.entity_id;
    else if (dc === "speed" || dc === "wind_speed") winden.push(e.entity_id);
    else if (dc === "precipitation" || dc === "precipitation_intensity") uit.neerslag ??= e.entity_id;
    else if (dc === "illuminance") uit.licht ??= e.entity_id;
    else if (dc === "battery") uit.batterij ??= e.entity_id;
  }
  if (winden[0]) uit.wind = winden[0];
  if (winden[1]) uit.windstoot = winden[1];
  for (const rol of ROLLEN) if (config?.[rol]) uit[rol] = config[rol];
  return uit;
}

/* ------------------------------------------------------------------- wind */

const NAAR_MS = { "m/s": 1, "km/h": 1 / 3.6, mph: 0.44704, kn: 0.514444, knots: 0.514444 };

/** De bovengrens van elke Beaufort-kracht in m/s (de WMO-tabel). Daarboven is het 12. */
const BEAUFORT = [0.3, 1.6, 3.4, 5.5, 8.0, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7];

export function beaufort(ms) {
  const i = BEAUFORT.findIndex((grens) => ms < grens);
  return i === -1 ? 12 : i;
}

export const WIND_EENHEDEN = [
  { value: "auto", label: nt("Zoals de sensor het meldt") },
  { value: "kmh", label: "km/h" },
  { value: "ms", label: "m/s" },
  { value: "bft", label: nt("Beaufort") },
];

/** Een windsnelheid in de gekozen eenheid. Een onbekende eenheid blijft zoals hij is. */
export function windTekst(st, eenheid = "auto") {
  const n = getal(st?.state);
  if (n == null) return null;
  const van = String(st?.attributes?.unit_of_measurement ?? "m/s");
  const factor = NAAR_MS[van];
  if (eenheid === "auto" || factor === undefined) return `${fmt(n, 1)} ${van}`;
  const ms = n * factor;
  if (eenheid === "bft") return `${beaufort(ms)} Bft`;
  if (eenheid === "kmh") return `${fmt(ms * 3.6, 0)} km/h`;
  return `${fmt(ms, 1)} m/s`;
}

const WINDSTREKEN = [nt("N"), nt("NO"), nt("O"), nt("ZO"), nt("Z"), nt("ZW"), nt("W"), nt("NW")];

/** 104 -> "O". Acht windstreken, zoals de kaart ze laat zien. */
export function windstreek(graden) {
  const g = getal(graden);
  if (g == null) return "";
  return t(WINDSTREKEN[Math.round((((g % 360) + 360) % 360) / 45) % 8]);
}

/* -------------------------------------------------------------------- uv */

/** De schaal van de WHO. Hier is de kleur een oordeel, dus de statuskleuren. */
const UV = [
  { tot: 3, woord: nt("Laag"), tone: "good" },
  { tot: 6, woord: nt("Matig"), tone: "warn" },
  { tot: 8, woord: nt("Hoog"), tone: "solar" },
  { tot: 11, woord: nt("Zeer hoog"), tone: "bad" },
  { tot: Infinity, woord: nt("Extreem"), tone: "magenta" },
];

/** @returns {{woord: string, tone: string}|null} */
export function uvSchaal(waarde) {
  const n = getal(waarde);
  if (n == null) return null;
  const stap = UV.find((u) => Math.round(n) < u.tot);
  return { woord: t(stap.woord), tone: stap.tone };
}

/* ------------------------------------------------------------------ druk */

/** Zoveel moet de druk veranderen om van stijgen of dalen te spreken, in hPa over 3 uur. */
const TREND_GRENS = 1;
/** Korter dan dit aan metingen zegt nog niets over de richting. */
const TREND_MIN_MS = 3600000;

/** Uit de geschiedenis: `[{s, lu}]`, zoals `history/history_during_period` het geeft. */
export function drukTrend(punten) {
  const goed = (punten ?? [])
    .map((p) => ({ n: getal(p?.s), op: Number(p?.lu ?? p?.lc) * 1000 }))
    .filter((p) => p.n != null && Number.isFinite(p.op))
    .sort((a, b) => a.op - b.op);
  if (goed.length < 2) return null;
  const eerste = goed[0];
  const laatste = goed[goed.length - 1];
  if (laatste.op - eerste.op < TREND_MIN_MS) return null;
  const verschil = laatste.n - eerste.n;
  if (verschil >= TREND_GRENS) return "stijgt";
  if (verschil <= -TREND_GRENS) return "daalt";
  return "gelijk";
}

export const trendWoord = (trend) =>
  ({ stijgt: t("stijgend"), daalt: t("dalend"), gelijk: t("gelijk") })[trend] ?? "";

/* ----------------------------------------------------------------- samen */

/** Onder dit percentage komt de waarschuwing; daarboven zegt de batterij niets. */
export const BATTERIJ_LAAG = 20;

const metEenheid = (st, decimalen) => {
  const n = getal(st?.state);
  if (n == null) return null;
  const eenheid = st?.attributes?.unit_of_measurement;
  return `${fmt(n, decimalen)}${eenheid ? ` ${eenheid}` : ""}`;
};

/**
 * Alles wat de kaart tekent. Een veld is null als de sensor er niet is of niets meldt;
 * zijn tegel of regel valt dan weg.
 */
export function weerStand(hass, id, rollen, { windEenheid = "auto" } = {}) {
  const st = (rol) => hass?.states?.[rollen[rol]] ?? null;
  const hoofd = hass?.states?.[id] ?? null;

  let wind = st("wind");
  let stoot = st("windstoot");
  const [w, s] = [getal(wind?.state), getal(stoot?.state)];
  if (w != null && s != null && w > s) [wind, stoot] = [stoot, wind];

  const uvWaarde = getal(st("uv")?.state);
  const batterij = getal(st("batterij")?.state);
  const druk = st("druk");
  const drukEenheid = String(druk?.attributes?.unit_of_measurement ?? "");
  const drukN = getal(druk?.state);

  return {
    bereikbaar: getal(hoofd?.state) != null,
    temperatuur: metEenheid(hoofd, 1),
    vocht: metEenheid(st("vocht"), 0),
    dauwpunt: metEenheid(st("dauwpunt"), 1),
    wind: windTekst(wind, windEenheid),
    windEntiteit: wind?.entity_id ?? rollen.wind ?? null,
    stoot: windTekst(stoot, windEenheid),
    richting: getal(st("richting")?.state),
    streek: windstreek(st("richting")?.state),
    regent: st("regent")?.state === "on",
    neerslag: metEenheid(st("neerslag"), 1),
    uv: uvWaarde == null ? null : fmt(uvWaarde, Number.isInteger(uvWaarde) ? 0 : 1),
    uvSchaal: uvSchaal(uvWaarde),
    licht: metEenheid(st("licht"), 0),
    // mbar en hPa zijn hetzelfde, en hPa is wat een weerbericht zegt.
    druk:
      drukN == null ? null : `${fmt(drukN, Number.isInteger(drukN) ? 0 : 1)} ${drukEenheid === "mbar" ? "hPa" : drukEenheid}`.trim(),
    batterijLaag: batterij != null && batterij < BATTERIJ_LAAG ? Math.round(batterij) : null,
  };
}
