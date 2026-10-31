/**
 * Welke bediening de lichtkaart tekent, los van hoe hij eruitziet.
 *
 * Een dimblokje meldt `brightness`, ook als de lampen erachter niet kunnen
 * dimmen. Bij een klant zat er zo'n blokje voor vaste spots, met minimum en
 * maximum op 99 en 100%: een schuif doet daar niets. Daarom kan de kaart sinds
 * 0.89.1 ook een schakelaar tonen (`schakelaar: true`). De lamp zelf kan dat niet
 * melden, dus dat is een keuze van wie de kaart instelt.
 */

const DIMMABLE = new Set(["brightness", "color_temp", "hs", "rgb", "rgbw", "rgbww", "xy", "white"]);

const modesOf = (st) => st?.attributes?.supported_color_modes ?? [];

export const isDimmable = (st) => modesOf(st).some((m) => DIMMABLE.has(m));

/**
 * @param {object|null} st de state van de lamp
 * @param {{dood?: boolean, schakelaar?: boolean}} [opties]
 * @returns {"none"|"range"|"toggle"}
 */
export function lampBesturing(st, { dood = false, schakelaar = false } = {}) {
  if (dood) return "none";
  return isDimmable(st) && schakelaar !== true ? "range" : "toggle";
}
