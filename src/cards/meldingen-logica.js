/**
 * Wat de meldingenkaart zegt, los van hoe hij eruitziet.
 *
 * Het versturen gebeurt aan de serverkant (`custom_components/.../meldingen/`),
 * want om 07:30 heeft niemand een dashboard open. De kaart laat zien wie er aan
 * staat en wat er komt. Voor dat laatste leest hij dezelfde afvalsensoren, met
 * DEZELFDE regels als `meldingen/afval.py`: wat de kaart "Morgen GFT" noemt,
 * hoort de telefoon ook zo te zeggen.
 *
 * Geen DOM en geen `hass`, zodat het in een gewone Node-test past.
 */

/** Wat een ophaalsensor zegt als er niets is. Zie `GEEN` in afval.py. */
const GEEN = new Set([
  "", "geen", "none", "unknown", "unavailable", "-", "nee", "niets", "no",
  "false", "off", "0", "geen afval", "geen ophaling",
]);

const NAMEN = {
  gft: "GFT", pmd: "PMD", kca: "KCA", pbd: "PBD",
  papier: "Papier", "oud papier": "Oud papier", restafval: "Restafval", rest: "Restafval",
  textiel: "Textiel", kerstbomen: "Kerstbomen", kerstboom: "Kerstboom", glas: "Glas",
  plastic: "Plastic", grofvuil: "Grofvuil", snoeiafval: "Snoeiafval",
};

const GEEN_SOORT = /^[\d\s:./-]+$/;
const SCHEIDING = /\s*(?:,|;|\/|&|\+|\ben\b|\band\b)\s*/i;

/** De soorten afval in deze toestand, netjes geschreven. Leeg = niets. */
export function afvalSoorten(toestand) {
  const tekst = String(toestand ?? "").trim();
  if (GEEN.has(tekst.toLowerCase()) || GEEN_SOORT.test(tekst)) return [];
  const uit = [];
  for (const ruw of tekst.split(SCHEIDING)) {
    const stuk = ruw.trim();
    if (!stuk || GEEN.has(stuk.toLowerCase()) || GEEN_SOORT.test(stuk)) continue;
    let naam = NAMEN[stuk.toLowerCase()];
    if (!naam) naam = stuk[0] === stuk[0].toUpperCase() ? stuk : stuk[0].toUpperCase() + stuk.slice(1);
    if (!uit.includes(naam)) uit.push(naam);
  }
  return uit;
}

/** "GFT", "GFT en Papier", "GFT, PMD en Papier". */
export function opsomming(namen) {
  if (!namen?.length) return "";
  if (namen.length === 1) return namen[0];
  return `${namen.slice(0, -1).join(", ")} en ${namen[namen.length - 1]}`;
}

/** "19:30:00" of "7:30" als "19:30" / "07:30", of "". */
export function tijdKort(tijd) {
  const m = String(tijd ?? "").match(/^\s*(\d{1,2}):(\d{2})/);
  if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) return "";
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

/** Een datum als "2026-09-27", in lokale tijd -- zo schrijft de server hem ook. */
export const isoDag = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * De regel onder de titel: wat er komt, en of het al buiten staat.
 *
 * Leeg als er vandaag en morgen niets opgehaald wordt. Een zin die zegt dat er
 * niets is, maakt de kaart alleen hoger (zie CLAUDE.md, *Vormregels*).
 *
 * @param {object} p
 * @param {string} [p.vandaag]  de toestand van de sensor voor vandaag
 * @param {string} [p.morgen]   idem voor morgen
 * @param {string} [p.tijdMorgen] wanneer de avondmelding komt
 * @param {{datum: string}|null} [p.buiten] van de server: wie tikte "Staat buiten"
 * @param {string} [p.door]     de naam van wie dat deed
 * @param {Date} [p.nu]
 */
export function kopRegel({ vandaag, morgen, tijdMorgen, buiten, door, nu = new Date() } = {}) {
  const v = afvalSoorten(vandaag);
  const m = afvalSoorten(morgen);
  const morgenDag = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate() + 1);
  const staatBuiten = (dag) =>
    buiten?.datum === isoDag(dag) ? ` · staat buiten${door ? ` (${door})` : ""}` : "";

  if (v.length) return `Vandaag ${opsomming(v)}${staatBuiten(nu)}`;
  if (m.length) {
    const gezet = staatBuiten(morgenDag);
    if (gezet) return `Morgen ${opsomming(m)}${gezet}`;
    const tijd = tijdKort(tijdMorgen);
    return `Morgen ${opsomming(m)}${tijd ? ` · melding om ${tijd}` : ""}`;
  }
  return "";
}

/**
 * Staat deze persoon aan? Wie de server nog niet kent: ja.
 *
 * Zo staat hij ook aan de serverkant (`MeldingOpslag.aan`). Een nieuwe persoon
 * die je toevoegt, wil je een melding laten krijgen -- anders had je hem niet
 * toegevoegd.
 */
export const staatAan = (stand, persoon) => stand?.aan?.[persoon] ?? true;

/** De personen uit de config: alleen `person.*`, zonder dubbelen. */
export function personenUit(config) {
  const lijst = Array.isArray(config?.personen)
    ? config.personen
    : typeof config?.personen === "string"
      ? [config.personen]
      : [];
  return [...new Set(lijst.filter((p) => typeof p === "string" && p.startsWith("person.")))];
}

/** Het id waaronder de server deze melding kent. Zie `melding_uit` in kaarten.py. */
export const meldingId = (config) => String(config?.id || config?.soort || "afval").trim() || "afval";
