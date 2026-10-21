/**
 * Wat een vriezerkaart moet zeggen, los van hoe hij eruitziet. Sinds 0.80.0
 * ook een koelkast.
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
 * temperatuur (`isEchteZone`). "Geen temperatuur" was in de dump van
 * 15 oktober 2026 `null`; op 18 oktober stond er bij dezelfde klant -328, bij
 * de vriezer en bij de koelkast (Miele's "geen waarde" is -32768 honderdsten).
 * Een temperatuur onder het absolute nulpunt telt daarom als geen
 * (`graden`).
 *
 * DE KOELKAST (sinds 0.80.0)
 *
 * Gevraagd op 18 oktober 2026, via de beheersessie, voor een Miele K 7747 C
 * bij dezelfde klant: "net als de vriezer". Dus dezelfde kaart: temperatuur,
 * instellen, deur en melding, en superkoelen en de modus NIET. Wat verschilt
 * is alleen hoe hij heet (`koelSoort`): de naam als het apparaat er geen
 * heeft, en de zin bij een melding. Het `type` bleef
 * `domotiapp-vriezer-card`, net als bij de vaatwasserkaart die ook de
 * wasmachine werd.
 *
 * Geen DOM en geen `hass` in de rekenfuncties: dit hoort in een gewone Node-test.
 */

import { getalTekst } from "./laadpaal-logica.js";
import { nt, t } from "../taal.js";

const LEEG = new Set(["", "unknown", "unavailable"]);

function getal(x) {
  if (x === null || x === undefined || x === "") return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

/** Het absolute nulpunt, in °C. Wat eronder ligt is geen meting. */
const NULPUNT = -273.15;

/** Een temperatuur, of null als er geen is: leeg, of Miele's -328. */
function graden(x) {
  const n = getal(x);
  return n != null && n > NULPUNT ? n : null;
}

/** Een zone met een eigen temperatuur. Miele's spookzones hebben er geen. */
export const isEchteZone = (st) => graden(st?.attributes?.current_temperature) != null;

/**
 * Koelkast of vriezer.
 *
 * Miele zegt het in de `translation_key` van de climate (`refrigerator`,
 * `freezer`). Een ander merk zegt het met het bereik: een koelkast stel je
 * boven nul in (de K 7747 C van 3 tot 9), een vriezer eronder (de FNS 7710 E
 * van -28 tot -15). Zonder bereik blijft het een vriezer, zoals de kaart was.
 *
 * @param {object|null} st de state van de climate
 * @param {object|null} reg de climate uit `hass.entities`
 * @returns {"koelkast"|"vriezer"}
 */
export function koelSoort(st, reg) {
  const sleutel = reg?.translation_key;
  if (sleutel === "refrigerator") return "koelkast";
  if (sleutel === "freezer") return "vriezer";
  const max = graden(st?.attributes?.max_temp);
  return max != null && max > 0 ? "koelkast" : "vriezer";
}

/** Hoe de soort heet: als naam, en in een zin ("op de koelkast"). */
export const SOORTNAAM = { koelkast: nt("Koelkast"), vriezer: nt("Vriezer") };

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
 * @param {"koelkast"|"vriezer"} soort zie `koelSoort`
 */
export function vriezerStand(st, delen = {}, soort = "vriezer") {
  if (!st || st.state === "unavailable") return null;
  const a = st.attributes ?? {};
  const sensor = delen.temperatuur && !LEEG.has(String(delen.temperatuur.state)) ? graden(delen.temperatuur.state) : null;
  return {
    soort,
    temperatuur: sensor ?? graden(a.current_temperature),
    doel: graden(a.temperature),
    min: getal(a.min_temp) ?? (soort === "koelkast" ? 3 : -28),
    max: getal(a.max_temp) ?? (soort === "koelkast" ? 9 : -15),
    stap: getal(a.target_temp_step) ?? 1,
    eenheid: String(delen.temperatuur?.attributes?.unit_of_measurement ?? "°C"),
    deurOpen: delen.deur?.state === "on",
    deurBekend: delen.deur?.state === "on" || delen.deur?.state === "off",
    storing: delen.storing?.state === "on",
    melding: delen.melding?.state === "on",
  };
}

/** Een temperatuur als tekst: "-18 °C", met een komma waar een decimaal staat. */
export const gradenTekst = (n, eenheid = "°C") => (n == null ? "" : `${getalTekst(Math.round(n * 10) / 10)} ${eenheid}`);

/**
 * De regel onder de naam.
 *
 * De deur staat er ALTIJD, ook dicht. De eigenaar op 15 oktober 2026: *"ik wil
 * ook de deurstatus op de wasmachine droger en de vriezer zien"*. Tot 0.71.0
 * stond hier alleen iets als er iets mis was (Vormregels: een statusregel
 * weglaten als er niets te melden is); zijn wens gaat voor.
 *
 * Een open deur eerst: daar kun je nu iets aan doen. Dan een storing, dan een
 * melding van het apparaat zelf, en een dichte deur achteraan. De kleur is die
 * van het ergste. Op de kaart staat elk deel op een eigen regel (`regels`):
 * achter elkaar ("Storing · deur dicht") liep het op een halve kaart over
 * drie regels.
 *
 * @returns {{tekst: string, regels: string[], tone: string}}
 */
export function vriezerMelding(s) {
  if (!s) return { tekst: t("Niet bereikbaar"), regels: [t("Niet bereikbaar")], tone: "neutral" };
  const regels = [];
  if (s.deurOpen) regels.push(t("Deur open"));
  if (s.storing) regels.push(t("Storing"));
  if (s.melding) regels.push(s.soort === "koelkast" ? t("Melding op de koelkast") : t("Melding op de vriezer"));
  if (s.deurBekend && !s.deurOpen) regels.push(t("Deur dicht"));
  const tone = s.storing ? "bad" : s.deurOpen || s.melding ? "warn" : "neutral";
  return { tekst: regels.join(" · "), regels, tone };
}

/**
 * De volgende doeltemperatuur na een tik op − of +, of null als dat niet kan.
 *
 * Op het rooster van de stap, binnen min en max: -28 tot -15 in hele graden
 * bij de vriezer van Miele, 3 tot 9 bij de koelkast.
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
 * `model_id`. Productfoto's van Miele, met toestemming van de eigenaar als
 * installateur (15 oktober 2026). Ze tonen het apparaat met de deur open, zo
 * levert Miele ze aan. Koelkasten en vriezers staan in één lijst, met de
 * soort in het label: het is één kaart.
 */
export const KOELEN_EN_VRIEZEN = {
  miele: {
    label: "Miele",
    fabrikant: "miele",
    modellen: {
      fns_7710_e: { label: nt("FNS 7710 E (vriezer)"), pad: "vriezers/miele-fns-7710-e.webp", codes: ["FNS 7710 E"] },
      k_7747_c: { label: nt("K 7747 C (koelkast)"), pad: "koelkasten/miele-k-7747-c.webp", codes: ["K 7747 C"] },
    },
  },
};
