/**
 * Wat een vriezerkaart moet zeggen, los van hoe hij eruitziet.
 *
 * Gevraagd op 15 oktober 2026, via de beheersessie, voor een Miele FNS 7710 E
 * bij een klant: een eigen kaart met de temperatuur, het instellen ervan, en
 * deur en melding. Supervriezen en de modus (normaal, party, sabbat) wil de
 * eigenaar NIET op de kaart.
 *
 * Je kiest de climate van de vriezer. Wat verder bij hetzelfde apparaat hoort
 * zoekt de kaart zelf (`vriezerDelen`), net als de airco-kaart: een
 * temperatuursensor, de deur, en de twee meldingen van Miele (`probleem`,
 * zonder `translation_key`, en `notification_active`).
 *
 * Miele maakt bij deze vriezer ook `climate.vriezer_zone_2` en `_zone_3`, met
 * een bereik van 7 tot 35 en geen temperatuur: spookzones, een FNS 7710 E heeft
 * één vak. De kaart kiest bij het toevoegen daarom een climate MET een
 * temperatuur (`isEchteZone`).
 *
 * Geen DOM en geen `hass` in de rekenfuncties: dit hoort in een gewone Node-test.
 */

import { getalTekst } from "./laadpaal-logica.js";

const LEEG = new Set(["", "unknown", "unavailable"]);

function getal(x) {
  if (x === null || x === undefined || x === "") return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

/** Een zone met een eigen temperatuur. Miele's spookzones hebben er geen. */
export const isEchteZone = (st) => st?.attributes?.current_temperature != null;

/**
 * De delen van het apparaat bij deze climate.
 *
 * @param {object} hass
 * @param {string} climateId
 * @returns {{temperatuur?: string, deur?: string, storing?: string, melding?: string}}
 */
export function vriezerDelen(hass, climateId) {
  const uit = {};
  const reg = hass?.entities?.[climateId];
  if (!reg?.device_id) return uit;
  for (const id of Object.keys(hass.entities).sort()) {
    const e = hass.entities[id];
    if (id === climateId || e?.device_id !== reg.device_id || e.hidden) continue;
    const st = hass.states?.[id];
    if (!st) continue;
    const domein = id.split(".")[0];
    const dc = st.attributes?.device_class;
    if (domein === "sensor" && dc === "temperature") uit.temperatuur ??= id;
    else if (domein === "binary_sensor" && dc === "door") uit.deur ??= id;
    else if (domein === "binary_sensor" && e.translation_key === "notification_active") uit.melding ??= id;
    else if (domein === "binary_sensor" && dc === "problem") uit.storing ??= id;
  }
  return uit;
}

/**
 * Hoe de vriezer erbij staat.
 *
 * De temperatuur komt eerst van de sensor (die meldt tienden: -18,0), anders
 * van de climate zelf.
 *
 * @param {object|null} st de state van de climate
 * @param {{temperatuur?: object, deur?: object, storing?: object, melding?: object}} delen de states
 */
export function vriezerStand(st, delen = {}) {
  if (!st || st.state === "unavailable") return null;
  const a = st.attributes ?? {};
  const sensor = delen.temperatuur && !LEEG.has(String(delen.temperatuur.state)) ? getal(delen.temperatuur.state) : null;
  return {
    temperatuur: sensor ?? getal(a.current_temperature),
    doel: getal(a.temperature),
    min: getal(a.min_temp) ?? -28,
    max: getal(a.max_temp) ?? -15,
    stap: getal(a.target_temp_step) ?? 1,
    eenheid: String(delen.temperatuur?.attributes?.unit_of_measurement ?? "°C"),
    deurOpen: delen.deur?.state === "on",
    storing: delen.storing?.state === "on",
    melding: delen.melding?.state === "on",
  };
}

/** Een temperatuur als tekst: "-18 °C", met een komma waar een decimaal staat. */
export const gradenTekst = (n, eenheid = "°C") => (n == null ? "" : `${getalTekst(Math.round(n * 10) / 10)} ${eenheid}`);

/**
 * De regel onder de naam, of "" als er niets te melden is (Vormregels:
 * statusregels weglaten als er niets te melden is).
 *
 * Een open deur eerst: daar kun je nu iets aan doen. Dan een storing, dan een
 * melding van het apparaat zelf.
 *
 * @returns {{tekst: string, tone: string}}
 */
export function vriezerMelding(s) {
  if (!s) return { tekst: "Niet bereikbaar", tone: "neutral" };
  if (s.deurOpen) return { tekst: "Deur open", tone: "warn" };
  if (s.storing) return { tekst: "Storing", tone: "bad" };
  if (s.melding) return { tekst: "Melding op de vriezer", tone: "warn" };
  return { tekst: "", tone: "neutral" };
}

/**
 * De volgende doeltemperatuur na een tik op − of +, of null als dat niet kan.
 *
 * Op het rooster van de stap, binnen min en max: -28 tot -15 in hele graden
 * bij Miele.
 *
 * @param {ReturnType<typeof vriezerStand>} s
 * @param {number} van de waarde die er nu staat (de getikte, als die er is)
 * @param {-1|1} richting
 */
export function volgendDoel(s, van, richting) {
  if (!s || van == null) return null;
  const stap = s.stap > 0 ? s.stap : 1;
  const volgende = Math.round((van + richting * stap) / stap) * stap;
  if (volgende < s.min - 1e-9 || volgende > s.max + 1e-9) return null;
  return Math.round(volgende * 10) / 10;
}

/** De aanroep die de doeltemperatuur zet. */
export const doelOproep = (climateId, waarde) => ["climate", "set_temperature", { entity_id: climateId, temperature: waarde }];

/**
 * Merk en type met een productfoto (zie productfoto.js). Miele zet het type in
 * `model_id`. Productfoto van Miele, met toestemming van de eigenaar als
 * installateur (15 oktober 2026). De foto toont de vriezer met de deur open,
 * zo levert Miele hem aan.
 */
export const VRIEZERS = {
  miele: {
    label: "Miele",
    fabrikant: "miele",
    modellen: {
      fns_7710_e: { label: "FNS 7710 E", pad: "vriezers/miele-fns-7710-e.webp", codes: ["FNS 7710 E"] },
    },
  },
};
