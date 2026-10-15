/**
 * Wat een warmtepompboilerkaart moet zeggen, los van hoe hij eruitziet.
 *
 * Gevraagd op 15 oktober 2026, via de beheersessie: een kaart voor de
 * WARMTEPOMPBOILER, het tapwater. Uitdrukkelijk niet algemeen: een warmtepomp
 * voor de verwarming wordt later een eigen kaart. Merk, type en foto zoals bij
 * de andere kaarten (productfoto.js); het eerste type is de LG WH27S (270
 * liter), met de core-integratie `lg_thinq`.
 *
 * Wat erop staat koos de eigenaar zelf: naast de foto en de watertemperatuur
 * - de temperatuur instellen (35 tot 60 graden, stap 1);
 * - de stand kiezen, met zijn woorden: Warmtepomp, Auto, Turbo en Vakantie;
 * - een grafiek van de watertemperatuur over de afgelopen 24 uur.
 *
 * WAT LG MELDT (de dump van 15 oktober 2026, `vaste-invoer/lg-wh27s.json`)
 *
 * Vijf entiteiten, meer niet:
 * - `water_heater`: de stand (`operation_mode`) en het doel;
 * - een select `current_job_mode`: dezelfde stand in de namen van LG;
 * - een number `target_temperature`: hetzelfde doel;
 * - een sensor `current_temperature`;
 * - een binary_sensor `water_heater_operation_mode` (device_class power):
 *   aan of uit, alleen te lezen.
 *
 * Geen energie, geen vermogen, geen aan/uit-knop, en niet te zien of de
 * compressor of het element draait. De kaart beweert daar dus ook niets over.
 *
 * De kaart stuurt de `water_heater` en niet de select of de number: dat zijn
 * de diensten van Home Assistant zelf, en die werken bij elk merk.
 *
 * Geen DOM en geen `hass`-methodes: dit hoort in een gewone Node-test.
 */

import { energiePunten, energieReeks, verdunReeks, vloeiendPad } from "./infoscherm-logica.js";
import { merkKeuzes as merken, productAfbeelding, typeBijApparaat as typeBij, typeKeuzes as types } from "./productfoto.js";
import { isVertaald } from "./programmanaam.js";

const domeinVan = (id) => String(id ?? "").split(".")[0];

const LEEG = new Set(["", "unknown", "unavailable"]);

/** Heeft deze entiteit iets te zeggen? */
export const heeftWaarde = (st) => Boolean(st) && !LEEG.has(String(st.state ?? ""));

function getal(x) {
  if (x === null || x === undefined || x === "" || typeof x === "boolean") return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

const NL = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 1 });
/** Een temperatuur als tekst, zonder eenheid: "58", "57,5". */
export const graden = (n) => (n == null ? "" : NL.format(Math.round(n * 10) / 10));

/* ---------------------------------------------------- de rest van het apparaat */

/**
 * Per domein: welke `translation_key` welke rol heeft. De sleutels zijn die
 * van `lg_thinq`.
 */
export const ROLLEN = {
  sensor: { current_temperature: "water" },
  binary_sensor: { water_heater_operation_mode: "aan" },
};

/**
 * De andere entiteiten van hetzelfde apparaat, per rol. Op APPARAAT en
 * `translation_key`; zonder die sleutel nog op `device_class`: een
 * temperatuursensor is het water, een power-sensor is aan of uit.
 */
export function boilerDelen(hass, boilerId) {
  const uit = {};
  const toestel = hass?.entities?.[boilerId]?.device_id;
  if (!toestel) return uit;
  for (const [id, reg] of Object.entries(hass.entities)) {
    if (id === boilerId || reg?.device_id !== toestel || reg?.hidden) continue;
    const st = hass.states?.[id];
    if (!st) continue;
    const domein = domeinVan(id);
    const rol = ROLLEN[domein]?.[String(reg.translation_key ?? "")];
    if (rol) {
      uit[rol] = id;
      continue;
    }
    const dc = st.attributes?.device_class;
    if (domein === "sensor" && dc === "temperature") uit.water ??= id;
    else if (domein === "binary_sensor" && dc === "power") uit.aan ??= id;
  }
  return uit;
}

/**
 * Namen die een integratie zelf verzint en die niets zeggen. LG noemt elke
 * boiler "Water Heater"; de kaart zegt dan "Boiler" (voorstel van de
 * beheersessie, 15 oktober 2026). Een naam die de klant zelf gaf, gaat altijd
 * voor.
 */
const STANDAARDNAMEN = new Set(["water heater", "waterheater", "boiler", "heat pump water heater"]);

/** De naam op de kaart als je zelf niets invult. */
export function naamVan(hass, id, ingevuld) {
  if (ingevuld) return String(ingevuld);
  const reg = hass?.entities?.[id];
  const apparaat = reg?.device_id ? hass?.devices?.[reg.device_id] : null;
  const kandidaten = [reg?.name, apparaat?.name_by_user, apparaat?.name, hass?.states?.[id]?.attributes?.friendly_name];
  for (const k of kandidaten) {
    const n = String(k ?? "").replace(/\s+/g, " ").trim();
    if (n && !STANDAARDNAMEN.has(n.toLowerCase())) return n;
  }
  return "Boiler";
}

/* -------------------------------------------------------------- de standen */

/**
 * De standen, in de volgorde en met de woorden van de eigenaar.
 *
 * De waarden zijn die van de `water_heater` van Home Assistant. LG vertaalt
 * zijn eigen namen daarnaartoe: `turbo` wordt `performance`, `auto` wordt
 * `eco` (de beheersessie, 15 oktober 2026). `uitleg` staat onder de knoppen,
 * voor de stand die gekozen is.
 */
export const STANDEN = [
  { waarde: "heat_pump", label: "Warmtepomp", uitleg: "Zuinig: alleen de warmtepomp." },
  { waarde: "eco", label: "Auto", uitleg: "Kiest zelf tussen de warmtepomp en het element." },
  { waarde: "performance", label: "Turbo", uitleg: "Snel: de warmtepomp en het element samen." },
  { waarde: "vacation", label: "Vakantie", uitleg: "Houdt het water warm op een laag pitje." },
];

/** Standen die LG niet heeft, maar Home Assistant wel kent. Zelfde rij, achteraan. */
const ANDERE_STANDEN = {
  off: "Uit",
  electric: "Elektrisch",
  high_demand: "Veel vraag",
  gas: "Gas",
};

/**
 * De knoppen: alleen de standen die de boiler kent, in de vaste volgorde.
 * Een stand die er niet in staat, komt achteraan met zijn eigen naam.
 *
 * @returns {Array<{waarde: string, label: string, uitleg: string, gekozen: boolean}>}
 */
export function standKnoppen(st, vertaal) {
  const lijst = Array.isArray(st?.attributes?.operation_list) ? st.attributes.operation_list.map(String) : [];
  if (lijst.length < 2) return [];
  const nu = String(st?.attributes?.operation_mode ?? st?.state ?? "");
  const bekend = STANDEN.filter((s) => lijst.includes(s.waarde));
  const rest = lijst
    .filter((w) => !STANDEN.some((s) => s.waarde === w))
    .map((w) => {
      const ha = vertaal ? String(vertaal(st, w) ?? "") : "";
      const label = ANDERE_STANDEN[w] || (isVertaald(w, ha) ? ha : w.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()));
      return { waarde: w, label, uitleg: "" };
    });
  return [...bekend, ...rest].map((s) => ({ ...s, gekozen: s.waarde === nu }));
}

/** De dienst voor een stand, of null als de boiler hem niet kent. */
export function standOproep(st, waarde) {
  const lijst = st?.attributes?.operation_list ?? [];
  if (!st || !lijst.includes(waarde)) return null;
  return ["water_heater", "set_operation_mode", { entity_id: st.entity_id, operation_mode: waarde }];
}

/* ------------------------------------------------------------------ de kop */

/**
 * Alles wat de kop nodig heeft.
 *
 * `soort` stuurt de kleur van de chip: Turbo is warm (het element staat bij),
 * de andere standen het accent, en vakantie en uit zijn neutraal.
 */
export function boilerStand(hass, id, delen = {}) {
  const st = hass?.states?.[id];
  const a = st?.attributes ?? {};
  const beschikbaar = Boolean(st) && st.state !== "unavailable";
  const waterSt = delen.water ? hass?.states?.[delen.water] : null;
  const water = heeftWaarde(waterSt) ? getal(waterSt.state) : getal(a.current_temperature);
  const aanSt = delen.aan ? hass?.states?.[delen.aan] : null;
  const stand = String(a.operation_mode ?? st?.state ?? "");
  const aan = aanSt && heeftWaarde(aanSt) ? aanSt.state === "on" : stand !== "off";
  const def = STANDEN.find((s) => s.waarde === stand);
  let tekst = def?.label || ANDERE_STANDEN[stand] || "";
  if (!aan) tekst = "Uit";
  if (!beschikbaar) tekst = "Niet bereikbaar";

  let soort = "aan";
  if (!beschikbaar) soort = "dood";
  else if (!aan || stand === "off") soort = "uit";
  else if (stand === "performance") soort = "turbo";
  else if (stand === "vacation") soort = "vakantie";

  return { beschikbaar, aan, stand, tekst, water, soort };
}

/** Van een soort naar een kleurnaam uit `TONES`. */
export const SOORT_TOON = { aan: "accent", turbo: "solar", vakantie: "neutral", uit: "neutral", dood: "neutral" };

/* ------------------------------------------------------------------ het doel */

/**
 * Het doel en zijn grenzen, of null als de boiler geen doel heeft.
 *
 * @returns {{doel: number, min: number, max: number, stap: number}|null}
 */
export function doelInstelling(st) {
  const a = st?.attributes ?? {};
  const doel = getal(a.temperature);
  if (!st || st.state === "unavailable" || doel == null) return null;
  const min = getal(a.min_temp) ?? 35;
  const max = getal(a.max_temp) ?? 60;
  const stap = getal(a.target_temp_step) || 1;
  return { doel, min, max: Math.max(min, max), stap };
}

/** Een stap omhoog of omlaag, binnen de grenzen en op het raster van de stap. */
export function volgendDoel(inst, huidig, richting) {
  if (!inst) return huidig;
  const v = Math.round((huidig + richting * inst.stap) / inst.stap) * inst.stap;
  return Math.min(inst.max, Math.max(inst.min, Math.round(v * 10) / 10));
}

/** De dienst voor een nieuw doel. */
export const doelOproep = (st, doel) => ["water_heater", "set_temperature", { entity_id: st.entity_id, temperature: doel }];

/* -------------------------------------------------------------- de grafiek */

/** Hoe lang de grafiek terugkijkt. */
export const VENSTER_UREN = 24;

/**
 * De punten uit de recorder (`history/history_during_period`) als reeks van
 * de afgelopen 24 uur tot nu: met de laatste meting van vóór het venster
 * vooraan, en de laatste waarde doorgetrokken tot nu.
 */
export function waterReeks(rijen, nu) {
  return energieReeks(energiePunten(rijen), { nu, venster: VENSTER_UREN });
}

/**
 * Het bereik van de y-as: hele vijftallen rond de metingen en het doel, met
 * een beetje lucht, en minstens 10 graden hoog. Zo staat 58 niet tegen de rand
 * en wordt een verschil van één graad geen berg.
 *
 * @returns {{min: number, max: number, lijnen: number[]}}
 */
export function schaal(reeks, doel = null) {
  const waarden = (reeks?.punten ?? []).map((p) => p.v);
  if (doel != null) waarden.push(doel);
  if (!waarden.length) return { min: 0, max: 0, lijnen: [] };
  let min = Math.floor((Math.min(...waarden) - 1) / 5) * 5;
  let max = Math.ceil((Math.max(...waarden) + 1) / 5) * 5;
  if (max - min < 10) {
    const midden = (min + max) / 2;
    min = Math.floor((midden - 5) / 5) * 5;
    max = min + 10;
  }
  const stap = max - min > 20 ? 10 : 5;
  const lijnen = [];
  for (let v = Math.ceil(min / stap) * stap; v <= max; v += stap) lijnen.push(v);
  return { min, max, lijnen };
}

/**
 * De lijn en het vlak, in een vak van `w` bij `h`, vloeiend en zonder lussen:
 * eerst op een gelijk rooster van een kwartier (valkuil 56).
 */
export function grafiekPaden(reeks, bereik, { w = 1000, h = 300 } = {}) {
  if ((reeks?.punten ?? []).length < 2 || !(bereik?.max > bereik?.min)) return { lijn: "", vlak: "" };
  const glad = verdunReeks(reeks, VENSTER_UREN * 4);
  const { lijn, vlak } = vloeiendPad(glad, { w, h, min: bereik.min, max: bereik.max });
  return { lijn, vlak };
}

/** Waar een waarde staat, van 0 (onder) tot 1 (boven). */
export const hoogteVan = (v, bereik) => (v - bereik.min) / (bereik.max - bereik.min);

/** Waar een tijdstip staat, van 0 (links) tot 1 (rechts). */
export const breedteVan = (t, reeks) => (t - reeks.van) / (reeks.tot - reeks.van);

/**
 * De tijden onder de grafiek: elke zes uur op het hele uur (00:00, 06:00,
 * 12:00, 18:00), in de tijdzone van het scherm. Een label dicht tegen een rand
 * valt weg; daar past het niet.
 *
 * @returns {Array<{t: number, label: string, x: number}>}
 */
export function tijdLabels(reeks) {
  if (!reeks || !(reeks.tot > reeks.van)) return [];
  const uit = [];
  const d = new Date(reeks.van);
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  for (; d.getTime() < reeks.tot; d.setHours(d.getHours() + 1)) {
    if (d.getHours() % 6 !== 0) continue;
    const x = breedteVan(d.getTime(), reeks);
    if (x < 0.06 || x > 0.94) continue;
    uit.push({ t: d.getTime(), label: `${String(d.getHours()).padStart(2, "0")}:00`, x });
  }
  return uit;
}

/**
 * De gemeten waarde op een tijdstip: de laatste meting op of vóór dat moment.
 * Een boiler meldt alleen als de temperatuur verandert, dus tot de volgende
 * melding stond hij nog zo. Voor de kruisdraad: die springt naar een echte
 * meting, niet naar de gladde lijn.
 *
 * @returns {{t: number, v: number}|null}
 */
export function waardeOp(reeks, t) {
  const p = reeks?.punten ?? [];
  let uit = null;
  for (const q of p) {
    if (q.t > t) break;
    uit = q;
  }
  return uit ?? p[0] ?? null;
}

/** "14:20". */
export const klokTijd = (t) => {
  const d = new Date(t);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/** De laagste en hoogste meting in het venster, of null. */
export function uitersten(reeks) {
  const w = (reeks?.punten ?? []).map((p) => p.v);
  return w.length ? { min: Math.min(...w), max: Math.max(...w) } : null;
}

/* --------------------------------------------------------------- foto's */

/**
 * De merken en hun types. De regels staan in productfoto.js.
 *
 * Het eerste type is de LG WH27S (270 liter): het woord van de eigenaar op
 * 15 oktober 2026, want de code WHT_056905 staat nergens online. Een
 * fabrieksfoto van LG mag, met zijn toestemming als installateur.
 *
 * De WH27S heeft nog GEEN `pad`: de foto was er bij de uitgave van 0.68.0 nog
 * niet. Zonder pad toont de kaart het icoon, zonder een adres dat 404 geeft.
 * Komt de foto, dan hier `pad: "warmtepompboilers/lg-wh27s.webp"` erbij, en
 * die naam in `VASTE_WEBP`.
 */
export const BOILERS = {
  lg: {
    label: "LG",
    fabrikant: "lg",
    modellen: {
      wh27s: {
        label: "WH27S (270 liter)",
        codes: ["WHT_056905_WW"],
      },
    },
  },
};

export const typeBijApparaat = (apparaat, lijst = BOILERS) => typeBij(apparaat, lijst);
export const boilerAfbeelding = (config, apparaat, lijst = BOILERS) => productAfbeelding(config, apparaat, lijst);
export const merkKeuzes = (lijst = BOILERS) => merken(lijst);
export const typeKeuzes = (merk, lijst = BOILERS) => types(merk, lijst);
