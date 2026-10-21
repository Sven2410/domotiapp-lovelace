/**
 * Wat een kaart voor een gewone printer (papier, geen 3D) moet zeggen, los van
 * hoe hij eruitziet.
 *
 * Gevraagd op 21 oktober 2026, via de beheersessie, voor een HP OfficeJet Pro
 * 9730e bij een klant: merk en productfoto net als de andere productkaarten,
 * en daarop de status, de inkt per kleur en het aantal afdrukken.
 *
 * Eerst de integratie IPP (core), want die spreekt elke netwerkprinter. Wat
 * die geeft (dump in `tests/js/vaste-invoer/ipp-hp-officejet-pro-9730e.json`):
 *
 * - de printer zelf: een sensor met `translation_key: printer`, toestand
 *   `idle`, `printing` of `stopped`, en in de attributen `state_message`;
 * - per patroon een sensor met `translation_key: marker`, in procenten, met
 *   `marker_low_level` (bij HP 20) en `marker_type`. De NAAM van het patroon
 *   komt uit het antwoord van de printer: bij deze HP black, cyan, magenta en
 *   yellow, maar een laserprinter zegt "black toner" en een fotoprinter kan een
 *   fotozwart of een lichte cyaan hebben. De kleur zoeken we daarom op
 *   woorden (`inktKleur`), en een patroon dat we niet kennen komt er gewoon bij
 *   met zijn eigen naam en een neutrale balk;
 * - de tellers `impressions_completed`, `monochrome_impressions_completed` en
 *   `color_impressions_completed` (diagnostisch, maar ze staan aan).
 *
 * Je kiest de statussensor; wat verder bij hetzelfde apparaat hoort zoekt de
 * kaart zelf (`printerDelen`), net als de vriezerkaart.
 *
 * Geen DOM en geen `hass` in de rekenfuncties: dit hoort in een gewone Node-test.
 */

import { nt, t } from "../taal.js";

const LEEG = new Set(["", "unknown", "unavailable"]);

function getal(x) {
  if (x === null || x === undefined || x === "") return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

/** De standen van IPP, en hoe wij ze noemen. */
export const STANDEN = {
  idle: { woord: nt("Klaar voor gebruik"), tone: "neutral" },
  printing: { woord: nt("Aan het printen"), tone: "accent" },
  stopped: { woord: nt("Gestopt"), tone: "bad" },
};

/**
 * De kleuren van inkt en toner, in de volgorde op de kaart.
 *
 * De kleur zelf is hier de INHOUD van het patroon, net als de bak op de
 * afvalkaart en de tray op de 3D-printerkaart: geen identiteit en geen status.
 * Wie een patroon zoekt, zoekt de kleur.
 *
 * Zwart is de inkt van het thema (`--dac-ink-2`): een zwarte balk is op een
 * donkere kaart niet te zien, en het woord ernaast zegt al welke het is.
 */
export const INKTEN = [
  { sleutel: "fotozwart", woorden: ["photo black", "photo_black", "fotozwart"], woord: nt("Fotozwart"), kleur: "var(--dac-ink-2)" },
  { sleutel: "zwart", woorden: ["black", "zwart", "matte", "pigment"], woord: nt("Zwart"), kleur: "var(--dac-ink-2)" },
  { sleutel: "lichtcyaan", woorden: ["light cyan", "light_cyan", "photo cyan"], woord: nt("Lichtcyaan"), kleur: "#7fd3f0" },
  { sleutel: "cyaan", woorden: ["cyan", "cyaan"], woord: nt("Cyaan"), kleur: "#00a0dc" },
  { sleutel: "lichtmagenta", woorden: ["light magenta", "light_magenta", "photo magenta"], woord: nt("Lichtmagenta"), kleur: "#f49ac8" },
  { sleutel: "magenta", woorden: ["magenta"], woord: nt("Magenta"), kleur: "#e0007a" },
  { sleutel: "geel", woorden: ["yellow", "geel"], woord: nt("Geel"), kleur: "#f5d000" },
  { sleutel: "grijs", woorden: ["gray", "grey", "grijs"], woord: nt("Grijs"), kleur: "#8a8a8a" },
];

/**
 * Welke inkt dit patroon is, of null.
 *
 * Gezocht in de naam en in de entity_id, want IPP zet de naam van de printer
 * in allebei ("..._black_cartridge"). "Photo black" voor "black", en "light
 * cyan" voor "cyan": de langere eerst, daarom staan ze zo in `INKTEN`.
 */
export function inktKleur(naam, entityId = "") {
  const tekst = `${String(naam ?? "")} ${String(entityId ?? "").replace(/_/g, " ")}`.toLowerCase();
  return INKTEN.find((i) => i.woorden.some((w) => tekst.includes(w.replace(/_/g, " ")))) ?? null;
}

/**
 * De delen van het apparaat bij deze statussensor.
 *
 * @param {object} hass
 * @param {string} printerId
 * @returns {{patronen: string[], totaal?: string, zwartwit?: string, kleur?: string}}
 */
export function printerDelen(hass, printerId) {
  const uit = { patronen: [] };
  const reg = hass?.entities?.[printerId];
  if (!reg?.device_id) return uit;
  for (const id of Object.keys(hass.entities).sort()) {
    const e = hass.entities[id];
    if (id === printerId || e?.device_id !== reg.device_id || e.hidden) continue;
    if (!hass.states?.[id] || !id.startsWith("sensor.")) continue;
    const sleutel = e.translation_key;
    if (sleutel === "marker") uit.patronen.push(id);
    else if (sleutel === "impressions_completed") uit.totaal ??= id;
    else if (sleutel === "monochrome_impressions_completed") uit.zwartwit ??= id;
    else if (sleutel === "color_impressions_completed") uit.kleur ??= id;
  }
  return uit;
}

/** De naam van een patroon zonder de naam van de printer ervoor. */
function patroonNaam(st, apparaatNaam) {
  const vol = String(st?.attributes?.friendly_name ?? "").trim();
  const voor = String(apparaatNaam ?? "").trim();
  const kaal = voor && vol.toLowerCase().startsWith(voor.toLowerCase()) ? vol.slice(voor.length).trim() : vol;
  return kaal || String(st?.entity_id ?? "").split(".")[1] || "";
}

/**
 * De patronen zoals ze op de kaart komen, in de volgorde van `INKTEN` en
 * onbekende erachter.
 *
 * @param {object[]} states de states van de patronen
 * @param {string} apparaatNaam de naam van de printer, om van de entiteitnaam af te halen
 * @returns {Array<{id: string, label: string, kleur: string, procent: number|null, laag: boolean}>}
 */
export function inktStanden(states, apparaatNaam = "") {
  const plek = (inkt) => (inkt ? INKTEN.indexOf(inkt) : INKTEN.length);
  return (states ?? [])
    .filter(Boolean)
    .map((st, i) => {
      const naam = patroonNaam(st, apparaatNaam);
      const inkt = inktKleur(naam, st.entity_id);
      const procent = LEEG.has(String(st.state)) ? null : getal(st.state);
      const grens = getal(st.attributes?.marker_low_level);
      return {
        id: st.entity_id,
        label: inkt ? t(inkt.woord) : naam,
        kleur: inkt?.kleur ?? "",
        procent: procent == null ? null : Math.max(0, Math.min(100, procent)),
        laag: procent != null && grens != null && procent <= grens,
        plek: plek(inkt),
        i,
      };
    })
    .sort((a, b) => a.plek - b.plek || a.i - b.i)
    .map(({ plek: _p, i: _i, ...rest }) => rest);
}

/**
 * Hoe de printer erbij staat.
 *
 * @param {object|null} st de statussensor
 * @param {{patronen?: object[], totaal?: object, zwartwit?: object, kleur?: object}} delen de states
 * @param {string} apparaatNaam
 */
export function printerStand(st, delen = {}, apparaatNaam = "") {
  if (!st || LEEG.has(String(st.state))) return null;
  const ruw = String(st.state).toLowerCase();
  const teller = (s) => (s && !LEEG.has(String(s.state)) ? getal(s.state) : null);
  return {
    stand: ruw,
    // Een stand die IPP (nog) niet kent, houdt zijn eigen woord.
    bekend: ruw in STANDEN,
    ruw: String(st.state),
    // Tekst van de printer zelf (bij "stopped" bijvoorbeeld een papierstoring),
    // in de taal van de printer: we vertalen hem niet.
    bericht: String(st.attributes?.state_message ?? "").trim(),
    inkt: inktStanden(delen.patronen ?? [], apparaatNaam),
    afdrukken: teller(delen.totaal),
    zwartwit: teller(delen.zwartwit),
    kleur: teller(delen.kleur),
  };
}

/**
 * De regels onder de naam, en de kleur van de chip.
 *
 * Eerst de stand, dan wat de printer er zelf over zegt als hij gestopt is, dan
 * de patronen die bijna op zijn. Bijna op is "let op": je kunt nog printen.
 *
 * @returns {{regels: string[], tone: string}}
 */
export function printerMelding(s) {
  if (!s) return { regels: [t("Niet bereikbaar")], tone: "neutral" };
  const regels = [s.bekend ? t(STANDEN[s.stand].woord) : s.ruw.charAt(0).toUpperCase() + s.ruw.slice(1)];
  if (s.stand === "stopped" && s.bericht) regels[0] += ` · ${s.bericht}`;
  const laag = s.inkt.filter((i) => i.laag);
  if (laag.length === 1) regels.push(t("{inkt} bijna op", { inkt: laag[0].label }));
  else if (laag.length > 1) regels.push(t("{inkt} bijna op", { inkt: laag.map((i) => i.label).join(", ") }));
  const tone = s.stand === "stopped" ? "bad" : laag.length ? "warn" : s.stand === "printing" ? "accent" : "neutral";
  return { regels, tone };
}

/**
 * Merk en type met een productfoto (zie productfoto.js). IPP zet de reeks in
 * `model` ("HP OfficeJet Pro 9730 Series"), zonder de e, en `model_id` is leeg.
 * De foto komt erbij zodra hij er is; tot dan staat hier alleen het merk niet.
 */
export const PRINTERS = {};
