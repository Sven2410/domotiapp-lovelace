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
  if (ruw === "off" || ruw === "false" || ruw === "disconnected" || ruw === "not_charging") {
    return "idle";
  }
  // Iets dat we niet kennen, maar de auto meldt wel iets. De kaart toont dat
  // woord dan zelf; een gok zou een laadicoon geven bij een auto die stilstaat.
  return "idle";
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
