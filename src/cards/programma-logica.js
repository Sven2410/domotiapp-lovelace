/**
 * Een apparaat met een programma: vaatwasser, wasmachine en droger.
 *
 * Gevraagd op 15 oktober 2026, via de beheersessie, voor een klant met een
 * Miele-wasmachine (WWI880) en -droger (TWH780WP): de vaatwasserkaart wordt de
 * kaart voor alle apparaten met een programma, met merk, type en foto, Miele
 * eerst. Op het dashboard nog steeds een kaart per apparaat. Wat erop moet,
 * naast status, programma, fase en resterende tijd: start, pauze en stop,
 * TwinDos, het verbruik met zijn verwachting, en wanneer hij start. De eigenaar:
 * *"Bouw alleen de noodzakelijke dingen die de integratie toelaat."* Dus geen
 * toerental en geen droogtegraad.
 *
 * HOE DE KAART DE REST VINDT
 *
 * Je kiest de statussensor. Wat verder bij hetzelfde apparaat hoort, van
 * dezelfde integratie, zoekt de kaart op `translation_key` (`ROLLEN`). Zo werkt
 * de Miele-integratie van Home Assistant (gemeten in een dump van 2026.10.1).
 * Een veld dat in de editor is ingevuld gaat voor; zie `metApparaatVelden`.
 *
 * Twee dingen uit de broncode van Miele (`sensor.py`), niet geraden:
 * - `start` is een tijdstip: bij een lopend programma het moment waarop het
 *   begon, bij een uitgestelde start het moment waarop het straks begint. Een
 *   moment in het verleden telt voor "Start om" niet mee (`startMoment`).
 * - `finish` is nu plus de resterende tijd plus het uitstel.
 *
 * Geen DOM en geen `hass` in de rekenfuncties: dit hoort in een gewone
 * Node-test. `apparaatRollen` leest alleen het register uit `hass`.
 */

import { getalTekst } from "./laadpaal-logica.js";

/**
 * De entiteiten van het apparaat per rol, op `domein:translation_key`.
 *
 * Het domein hoort erbij: Miele heeft een KNOP `start` (starten) en een SENSOR
 * `start` (de starttijd).
 */
export const ROLLEN = {
  "sensor:status": "status",
  "sensor:remaining_time": "rest",
  "sensor:elapsed_time": "verstreken",
  "sensor:finish": "eind",
  "sensor:start": "startOm",
  "sensor:start_time": "startIn",
  "sensor:program_id": "programma",
  "sensor:program_phase": "fase",
  "button:start": "start",
  "button:pause": "pauze",
  "button:stop": "stop",
  "sensor:twin_dos_1_level": "twinDos1",
  "sensor:twin_dos_2_level": "twinDos2",
  "sensor:energy_consumption": "energie",
  "sensor:energy_forecast": "energieVerwacht",
  "sensor:water_consumption": "water",
  "sensor:water_forecast": "waterVerwacht",
};

/**
 * De entiteiten die bij de statussensor horen, per rol: `{rest: "sensor.x", ...}`.
 *
 * Alleen van hetzelfde apparaat EN dezelfde integratie: een klant kan een
 * eigen entiteit aan het apparaat hangen. Bij twee met dezelfde sleutel wint
 * de eerste op entity_id, zodat dezelfde invoer altijd dezelfde uitkomst geeft.
 * Een uitgeschakelde entiteit staat niet in `hass.entities`, en telt dus niet.
 *
 * De deur heeft bij Miele GEEN `translation_key`: die vindt de kaart aan zijn
 * `device_class` (`door`). Sinds 0.71.0, op verzoek van de eigenaar: *"ik wil
 * ook de deurstatus op de wasmachine droger en de vriezer zien"*.
 *
 * @param {object} hass
 * @param {string} statusId
 * @returns {Record<string, string>}
 */
export function apparaatRollen(hass, statusId) {
  const reg = hass?.entities?.[statusId];
  if (!reg?.device_id) return {};
  const uit = {};
  for (const id of Object.keys(hass.entities).sort()) {
    const e = hass.entities[id];
    if (e?.device_id !== reg.device_id || e.platform !== reg.platform) continue;
    const domein = id.split(".")[0];
    if (domein === "binary_sensor" && hass.states?.[id]?.attributes?.device_class === "door") {
      uit.deur ??= id;
      continue;
    }
    if (!e.translation_key) continue;
    const rol = ROLLEN[`${domein}:${e.translation_key}`];
    if (rol && !(rol in uit)) uit[rol] = id;
  }
  return uit;
}

/** De velden van de kaart die het apparaat invult, met de rollen op volgorde van voorkeur. */
const VELDEN_UIT_APPARAAT = [
  ["remaining", ["rest", "eind"]],
  ["start", ["start"]],
  ["pause", ["pauze"]],
  ["stop", ["stop"]],
  ["planned_start", ["startOm"]],
];

/** Welke velden het apparaat levert, voor de editor (`editorVelden`). Voortgang rekent de kaart uit. */
export function veldenVanApparaat(rollen) {
  const uit = VELDEN_UIT_APPARAAT.filter(([, r]) => r.some((x) => rollen?.[x])).map(([v]) => v);
  if (rollen?.verstreken && rollen?.rest) uit.push("progress");
  return uit;
}

/**
 * De config met de velden van het apparaat in de lege plekken.
 *
 * Wat ingevuld is gaat voor, net als `afwijken` bij de coach: de klant heeft
 * er dan bewust iets anders neergezet.
 *
 * @param {object} config (al met de coach erbij, zie `metCoachVelden`)
 * @param {Record<string, string>} rollen uit `apparaatRollen()`
 */
export function metApparaatVelden(config, rollen) {
  const uit = { ...config };
  for (const [veld, voorkeur] of VELDEN_UIT_APPARAAT) {
    if (uit[veld]) continue;
    const id = voorkeur.map((r) => rollen?.[r]).find(Boolean);
    if (id) uit[veld] = id;
  }
  return uit;
}

const LEEG = new Set(["", "unknown", "unavailable"]);

/** Een getal uit een toestand, of null. */
function getal(st) {
  const s = String(st?.state ?? "").trim();
  if (LEEG.has(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Een knop staat er alleen als hij te drukken is.
 *
 * Miele maakt een knop pas beschikbaar als die actie kan (de beheersessie,
 * 15 oktober 2026): starten alleen met "start op afstand" aan, pauzeren alleen
 * als hij draait. Een knop die `unavailable` is, doet niets. Een knop die nog
 * nooit gedrukt is staat op `unknown`, en die telt wel.
 */
export const knopKan = (st) => Boolean(st) && st.state !== "unavailable";

/**
 * De voortgang uit verstreken en resterende tijd, in procenten, of null.
 *
 * Miele heeft geen voortgangssensor, maar wel allebei de tijden, en samen zijn
 * ze de duur van het programma. Dat is geen schatting: de balk zegt hoeveel
 * van de tijd die de machine zelf noemt voorbij is.
 *
 * @param {number|null} verstreken minuten
 * @param {number|null} rest minuten
 */
export function voortgangUitTijden(verstreken, rest) {
  if (verstreken == null || rest == null || verstreken < 0 || rest < 0) return null;
  const totaal = verstreken + rest;
  if (totaal <= 0) return null;
  return Math.min(100, Math.max(0, Math.round((verstreken / totaal) * 100)));
}

/** Het moment uit "start over 3 uur" (`start_time`, in uren), of null. Voor als er geen tijdstip is. */
export function startUitDuur(st, nu = new Date()) {
  const uren = getal(st);
  if (uren == null || uren <= 0) return null;
  const eenheid = String(st.attributes?.unit_of_measurement ?? "h").toLowerCase();
  const minuten = eenheid.startsWith("min") ? uren : eenheid.startsWith("s") ? uren / 60 : uren * 60;
  return new Date(+nu + Math.round(minuten) * 60_000);
}

/*
 * DE TEGELS (sinds 0.71.0)
 *
 * De eigenaar op 15 oktober 2026, met 0.70.0 bij de klant: *"ik wil ook de
 * deurstatus op de wasmachine droger en de vriezer zien. Ook programma etc"*.
 * Met de machine uit stond er alleen "Uit". Dus een rij tegels die er ALTIJD
 * staat, met een streepje waar niets is, in de vorm van de tegels op de
 * airco-kaart: de waarde groot, het label eronder, en een tik opent de sensor.
 *
 * Wasmachine: deur, programma, fase, klaar om, energie, water, TwinDos 1 en 2
 * (twee rijen van vier). Droger: deur, programma, fase, klaar om, energie. De
 * resterende tijd staat niet in een tegel: die staat al in de statusregel
 * ("Draait · nog 1 u 30 min"), en met een tegel erbij werd de kaart een rij
 * hoger.
 */

/** Waarden die zeggen dat er niets loopt. */
const NIETS = new Set(["no_program", "not_running"]);

/** Wat er in een tegel staat als er niets te melden is. */
export const STREEP = "–";

/** Een woord in de taal van Home Assistant, of een leesbaar gemaakte sleutel. */
function woordVan(st, fmt) {
  const s = String(st?.state ?? "");
  const vertaald = fmt?.(st);
  if (vertaald && vertaald !== s) return vertaald;
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
}

const KLOK = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

/** "14:35", "morgen 00:13", of een streep. Op de kalender, niet in uren. */
function klaarOmTekst(st, nu) {
  const s = String(st?.state ?? "");
  if (LEEG.has(s)) return STREEP;
  const d = new Date(s);
  if (Number.isNaN(+d)) return STREEP;
  const dag = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const dagen = Math.round((dag(d) - dag(nu)) / 86_400_000);
  if (dagen === 0) return KLOK(d);
  if (dagen === 1) return `morgen ${KLOK(d)}`;
  return `${d.getDate()}-${d.getMonth() + 1} ${KLOK(d)}`;
}

/**
 * Energie of water: het verbruik zodra er iets verbruikt is, en daarvoor de
 * verwachting van Miele ("Energieverbruik voorspelling" in Home Assistant).
 * Vóór de start is de verwachting het nieuws, daarna het verbruik.
 */
function verbruikTegel(sleutel, naam, verbruikSt, verwachtSt, maak) {
  const n = getal(verbruikSt);
  const p = getal(verwachtSt);
  if (n != null && n > 0) return { sleutel, label: naam, waarde: maak(n), id: verbruikSt.entity_id };
  if (p != null) return { sleutel, label: `${naam} verwacht`, waarde: `${Math.round(p)}%`, id: verwachtSt.entity_id };
  if (n != null) return { sleutel, label: naam, waarde: maak(n), id: verbruikSt.entity_id };
  return { sleutel, label: naam, waarde: STREEP, id: verbruikSt?.entity_id ?? verwachtSt?.entity_id ?? "" };
}

/**
 * De tegels van een apparaat met een programma, in vaste volgorde. Een tegel
 * staat er alleen als het apparaat die entiteit heeft; een waarde die er niet
 * is wordt een streep, geen lege plek.
 *
 * @param {object} p
 * @param {Record<string, string>} p.rollen uit `apparaatRollen()`
 * @param {(id: string) => object|null} p.st de state bij een entity_id
 * @param {(st: object) => string} [p.fmt] `hass.formatEntityState`
 * @param {string} [p.deurWoord] "Deur" of "Klep"
 * @param {Date} [p.nu]
 * @returns {{sleutel: string, label: string, waarde: string, id: string}[]}
 */
export function programmaTegels({ rollen = {}, st, fmt, deurWoord = "Deur", nu = new Date() }) {
  const uit = [];
  const lees = (rol) => (rollen[rol] ? st(rollen[rol]) ?? null : null);
  const leeg = (s) => !s || LEEG.has(String(s.state ?? ""));

  if (rollen.deur) {
    const s = lees("deur");
    const waarde = leeg(s) ? STREEP : s.state === "on" ? "Open" : "Dicht";
    uit.push({ sleutel: "deur", label: deurWoord, waarde, id: rollen.deur });
  }
  if (rollen.programma) {
    const s = lees("programma");
    const waarde = leeg(s) ? STREEP : s.state === "no_program" ? "Geen" : woordVan(s, fmt);
    uit.push({ sleutel: "programma", label: "Programma", waarde, id: rollen.programma });
  }
  if (rollen.fase) {
    const s = lees("fase");
    const waarde = leeg(s) || NIETS.has(String(s.state)) ? STREEP : woordVan(s, fmt);
    uit.push({ sleutel: "fase", label: "Fase", waarde, id: rollen.fase });
  }
  if (rollen.eind) {
    uit.push({ sleutel: "klaar", label: "Klaar om", waarde: klaarOmTekst(lees("eind"), nu), id: rollen.eind });
  }
  if (rollen.energie || rollen.energieVerwacht) {
    const kwh = (n) => `${getalTekst(Math.round(n * 10) / 10)} kWh`;
    uit.push(verbruikTegel("energie", "Energie", lees("energie"), lees("energieVerwacht"), kwh));
  }
  if (rollen.water || rollen.waterVerwacht) {
    const liter = (n) => `${getalTekst(Math.round(n))} L`;
    uit.push(verbruikTegel("water", "Water", lees("water"), lees("waterVerwacht"), liter));
  }
  for (const [rol, label] of [
    ["twinDos1", "TwinDos 1"],
    ["twinDos2", "TwinDos 2"],
  ]) {
    if (!rollen[rol]) continue;
    const n = getal(lees(rol));
    uit.push({ sleutel: rol, label, waarde: n == null ? STREEP : `${Math.round(n)}%`, id: rollen[rol] });
  }
  return uit;
}

/**
 * Wat voor apparaat het is, aan het apparaat in Home Assistant: "vaatwasser",
 * "wasmachine" of "droger". Miele zet de soort in `model` ("Washing machine",
 * "Tumble dryer"); zonder apparaat is het een vaatwasser, zoals altijd.
 */
export function apparaatSoort(apparaat) {
  const m = `${apparaat?.model ?? ""}`.toLowerCase();
  if (/dish|vaatwas|spül/.test(m)) return "vaatwasser";
  if (/dryer|droger|trockner/.test(m)) return "droger";
  if (/wash|wasmachine|waschmaschine/.test(m)) return "wasmachine";
  return "vaatwasser";
}

/** Per soort: de naam als er niets anders is, het icoon, en hoe de deur heet. */
export const SOORTEN = {
  vaatwasser: { naam: "Vaatwasser", icoon: "dishwasher", deur: "Klep" },
  wasmachine: { naam: "Wasmachine", icoon: "washer", deur: "Deur" },
  droger: { naam: "Droger", icoon: "washer", deur: "Deur" },
};

/**
 * De merken en types met een productfoto (zie productfoto.js).
 *
 * Miele zet het type in `model_id`. Productfoto's van Miele, met toestemming
 * van de eigenaar als installateur (15 oktober 2026). De paden komen in
 * dashboards zodra iemand er een kiest: alleen aanvullen, nooit hernoemen.
 */
export const PROGRAMMA_APPARATEN = {
  miele: {
    label: "Miele",
    fabrikant: "miele",
    modellen: {
      wwi880: { label: "WWI880 (wasmachine)", pad: "wasmachines/miele-wwi880.webp", codes: ["WWI880"] },
      twh780wp: { label: "TWH780WP (warmtepompdroger)", pad: "wasdrogers/miele-twh780wp.webp", codes: ["TWH780WP"] },
    },
  },
};
