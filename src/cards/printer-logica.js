/**
 * Het rekenwerk van de 3D-printerkaart, zonder DOM.
 *
 * Gevraagd op 27 augustus 2026 voor een Bambu Lab X1D met een AMS 2 Pro. Wat
 * hier staat is alles waar een fout in stil blijft: welke stand de printer heeft,
 * hoe lang het nog duurt, en welke kleur er in een tray zit.
 *
 * WAAROM DE KLEUR VAN EEN TRAY REKENWERK IS
 *
 * De eigenaar vroeg: *"Haal uit de attributen de kleur van de tray."* Bambu
 * levert die als een hexwaarde, en niet één die je zomaar in CSS kunt zetten:
 * het is `RRGGBBAA` met een alfakanaal dat vrijwel altijd `FF` is, soms zonder
 * hekje, soms met, en soms in kleine letters. Een `background: ${kleur}` daarop
 * levert een tray zonder kleur op -- geen fout, gewoon niets. Vandaar dat het
 * hier binnenkomt en getoetst wordt.
 */

/** De standen die een printer kan hebben, en hoe wij ze noemen. */
export const STANDEN = {
  idle: { woord: "Klaar voor gebruik", toon: "neutral" },
  printing: { woord: "Aan het printen", toon: "accent" },
  paused: { woord: "Gepauzeerd", toon: "warn" },
  finished: { woord: "Klaar", toon: "good" },
  failed: { woord: "Mislukt", toon: "bad" },
  offline: { woord: "Offline", toon: "neutral" },
  prepare: { woord: "Voorbereiden", toon: "accent" },
  unknown: { woord: "Onbekend", toon: "neutral" },
};

/**
 * De woorden die een printer voor zijn stand gebruikt.
 *
 * Bambu meldt `RUNNING`/`IDLE`/`FINISH`/`FAILED`/`PAUSE`/`PREPARE`, Octoprint
 * `Printing`/`Operational`, Klipper weer iets anders. Ze staan hier allemaal op
 * dezelfde noemer, want de klant kiest de integratie en niet wij.
 */
const WOORDEN = {
  idle: ["idle", "operational", "standby", "ready", "on", "off"],
  printing: ["printing", "running", "run", "print", "busy", "active"],
  paused: ["pause", "paused", "pausing"],
  finished: ["finish", "finished", "complete", "completed", "done", "success"],
  failed: ["failed", "fail", "error", "cancelled", "canceled", "stopped"],
  prepare: ["prepare", "preparing", "heating", "slicing", "init"],
  offline: ["offline", "unavailable", "unknown", "disconnected"],
};

/**
 * Welke stand deze statussensor meldt.
 *
 * @param {object|null} st de statusentiteit
 * @returns {keyof STANDEN}
 */
export function stand(st) {
  const ruw = String(st?.state ?? "").trim().toLowerCase();
  if (!ruw) return "unknown";
  if (ruw === "unavailable" || ruw === "none") return "offline";
  for (const [naam, woorden] of Object.entries(WOORDEN)) {
    if (woorden.includes(ruw)) return naam;
  }
  // Niet herkend maar wel iets: dan is "onbekend" eerlijker dan een gok, en de
  // kaart toont het woord van de sensor zelf ernaast.
  return "unknown";
}

/** Draait er op dit moment een print? */
export function draait(st) {
  const s = stand(st);
  return s === "printing" || s === "prepare";
}

/**
 * De voortgang als heel getal tussen 0 en 100, of null.
 *
 * Null en niet 0: het verschil tussen "nog niets gedaan" en "we weten het niet"
 * is precies het verschil tussen een lege balk en geen balk.
 */
export function voortgangPct(st) {
  const n = Number(st?.state);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Een temperatuur als afgerond getal met zijn eenheid, of null.
 */
export function temperatuur(st) {
  const n = Number(st?.state);
  if (!Number.isFinite(n)) return null;
  return {
    waarde: Math.round(n),
    eenheid: st?.attributes?.unit_of_measurement ?? "°C",
  };
}

/**
 * Hoeveel minuten er nog te gaan zijn, of null.
 *
 * Drie vormen worden gelezen, want alle drie komen ze voor bij een printer:
 * een aantal minuten (Bambu), een klok als `1:24:00` (Octoprint in uren), en een
 * tijdstip (een `timestamp`-sensor met het moment waarop hij klaar is). Dat
 * laatste is een EINDTIJD en geen duur -- ze verwarren kost je een kaart die
 * "nog 2.941.204 minuten" meldt.
 */
export function restMinuten(st, nu = Date.now()) {
  const ruw = String(st?.state ?? "").trim();
  if (!ruw || ruw === "unavailable" || ruw === "unknown") return null;

  const klasse = st?.attributes?.device_class;
  if (klasse === "timestamp" || /[T ]\d{2}:\d{2}/.test(ruw)) {
    const t = Date.parse(ruw);
    if (Number.isFinite(t)) return Math.max(0, Math.round((t - nu) / 60000));
  }

  // Een klok: 1:24:00 of 24:00.
  if (/^\d+:\d{2}(:\d{2})?$/.test(ruw)) {
    const delen = ruw.split(":").map(Number);
    const [u, m] = delen.length === 3 ? delen : [0, delen[0]];
    return u * 60 + m;
  }

  const n = Number(ruw);
  if (!Number.isFinite(n)) return null;
  // Een sensor in uren meldt dat in zijn eenheid. Zonder deze omrekening wordt
  // "nog 2 uur" gelezen als twee minuten.
  const eenheid = String(st?.attributes?.unit_of_measurement ?? "").toLowerCase();
  if (eenheid === "h" || eenheid === "u" || eenheid.startsWith("hour")) return Math.round(n * 60);
  if (eenheid === "s" || eenheid.startsWith("sec")) return Math.round(n / 60);
  return Math.round(n);
}

/** "2 u 15" of "45 min", of niets. */
export function alsDuur(minuten) {
  if (minuten === null || minuten === undefined) return "";
  const m = Math.max(0, Math.round(minuten));
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} u ${String(m % 60).padStart(2, "0")}`;
}

/**
 * Hoe laat hij klaar is, als "21:40" — of niets.
 *
 * De eindtijd is bruikbaarder dan de resterende tijd zodra het langer dan een
 * uur duurt, en een print duurt bijna altijd langer dan een uur.
 */
export function klaarOm(minuten, nu = new Date()) {
  if (minuten === null || minuten === undefined) return "";
  const eind = new Date(nu.getTime() + minuten * 60000);
  return `${String(eind.getHours()).padStart(2, "0")}:${String(eind.getMinutes()).padStart(2, "0")}`;
}

/**
 * De kleur van een filamenttray als iets dat CSS begrijpt, of null.
 *
 * Bambu levert `RRGGBBAA`. Het alfakanaal moet eraf: `#FFFFFFFF` is in CSS geen
 * wit maar wit-met-alfa-1 -- dat klopt toevallig, maar `#00000000` is dan
 * volledig doorzichtig zwart en dus onzichtbaar. En een tray zonder filament
 * meldt vaak juist die waarde.
 *
 * Accepteert ook een naam ("red") en een `rgb()`; wie zijn eigen sensor bouwt
 * hoort niet vast te lopen op ons formaat.
 */
const GEEN_KLEUR = new Set([
  "unknown",
  "unavailable",
  "none",
  "null",
  "empty",
  "leeg",
  "off",
  "unload",
  "unloaded",
]);

export function trayKleur(ruw) {
  if (typeof ruw !== "string") return null;
  const tekst = ruw.trim();
  if (!tekst) return null;

  const hex = tekst.replace(/^#/, "");
  if (/^[0-9a-f]{8}$/i.test(hex)) {
    // De alfa telt alleen als hij écht doorzichtig is; alles daarboven is de
    // gewone `FF` van Bambu en zou de kleur onnodig laten vervagen.
    const alfa = parseInt(hex.slice(6), 16);
    if (alfa < 16) return null;
    return `#${hex.slice(0, 6).toUpperCase()}`;
  }
  if (/^[0-9a-f]{6}$/i.test(hex)) return `#${hex.toUpperCase()}`;
  if (/^[0-9a-f]{3}$/i.test(hex)) return `#${hex.toUpperCase()}`;
  // Een naam of een rgb()-notatie geven we door zoals hij is; de browser weet
  // er raad mee en wij hoeven geen kleurenwoordenboek te onderhouden.
  //
  // Maar NIET de woorden waarmee een entiteit zegt dat hij niets weet. Die zijn
  // geen kleur, en de browser maakt er stil `transparent` van -- of erger,
  // `unknown` blijft staan en de tray krijgt de kleur van wat eronder ligt.
  // Zonder deze lijst werd een tray met `state: "unknown"` een gekleurde tray.
  if (GEEN_KLEUR.has(tekst.toLowerCase())) return null;
  if (/^[a-z]+$/i.test(tekst) || /^rgba?\(/i.test(tekst)) return tekst;
  return null;
}

/**
 * Alles wat we van één tray weten.
 *
 * De kleur mag uit drie plekken komen, en dat is geen luxe: welke integratie de
 * klant draait bepaalt waar hij staat. De Bambu-integratie zet hem als attribuut
 * `color` op de tray-entiteit, sommige templates zetten hem in de state zelf, en
 * wie het handmatig doet zet hem in de editor.
 *
 * @param {object|null} st de entiteit van deze tray
 * @param {object} instel wat er in de config staat voor deze tray
 */
export function tray(st, instel = {}) {
  const attr = st?.attributes ?? {};
  const kleur =
    trayKleur(instel.color) ??
    trayKleur(attr.color) ??
    trayKleur(attr.filament_color) ??
    trayKleur(attr.tray_color) ??
    // De state alleen als hij ECHT een kleur is. Bij de meeste integraties staat
    // daar het soort filament ("PLA"), en dat is een geldige kleurnaam voor
    // niemand behalve een reguliere expressie.
    (/^#?[0-9a-f]{3,8}$/i.test(String(st?.state ?? "")) ? trayKleur(st.state) : null) ??
    null;

  const soort =
    instel.label ||
    attr.type ||
    attr.filament_type ||
    attr.tray_type ||
    (st && !trayKleur(st.state) ? st.state : "") ||
    "";

  // Een tray die leeg is meldt dat op allerlei manieren; alles wat geen kleur
  // én geen soort heeft telt als leeg.
  const leeg = !kleur && !String(soort).trim();
  const rest = Number(attr.remain ?? attr.remaining);

  return {
    kleur,
    soort: String(soort).trim(),
    leeg,
    rest: Number.isFinite(rest) && rest >= 0 && rest <= 100 ? Math.round(rest) : null,
  };
}
