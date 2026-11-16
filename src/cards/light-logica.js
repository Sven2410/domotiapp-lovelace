/**
 * Welke bediening de lichtkaart tekent, los van hoe hij eruitziet.
 *
 * Een dimblokje meldt `brightness`, ook als de lampen erachter niet kunnen
 * dimmen. Bij een klant zat er zo'n blokje voor vaste spots, met minimum en
 * maximum op 99 en 100%: een schuif doet daar niets. Daarom kan de kaart sinds
 * 0.89.1 ook een schakelaar tonen (`schakelaar: true`). De lamp zelf kan dat niet
 * melden, dus dat is een keuze van wie de kaart instelt.
 */

/**
 * De helderheid van een lamp als percentage, of `null` als hij geen bruikbare meting meldt.
 *
 * Home Assistant geeft `brightness` door zonder controle. Een Shelly Dimmer Gen3 (firmware 2.2.0) kan na een
 * firmware-update zonder geldige helderheid beginnen (-2147483648 of 2147483647), en dimmen met de knop rekent daar
 * verder mee. Bij een klant stond er zo "89864600%" op de lichtkaart (16 november 2026). De eigenaar: "begrens het
 * helderheidspercentage in de kaarten tot 0–100 %". Wat buiten 0 tot 255 ligt is geen meting: dan geen getal (de kaart
 * zegt "Aan"), en nooit meer dan 100 %. Een lamp die brandt staat op minstens 1 %.
 */
export function helderheidProcent(brightness) {
  if (typeof brightness !== "number" || !Number.isFinite(brightness) || brightness < 0 || brightness > 255) return null;
  return Math.max(1, Math.round((brightness / 255) * 100));
}

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
