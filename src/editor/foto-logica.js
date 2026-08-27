/**
 * Het rekenwerk van de fotokiezer, zonder DOM.
 *
 * Apart van `foto-picker.js`, en om dezelfde reden als bij de sleeptimer: dat
 * bestand is een `class ... extends HTMLElement` op modulescope, en dat gooit in
 * een gewone Node-test de halve testsuite om (valkuil 27).
 *
 * Waarom die kiezer er überhaupt is, staat in de kop van `foto-picker.js`.
 */

/** Wat Home Assistant aanneemt. Groter dan dit is een foto van een fototoestel. */
export const MAX_BYTES = 12 * 1024 * 1024;

const TOEGESTAAN = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"];

/**
 * De URL waarop een geüploade afbeelding te zien is.
 *
 * Apart en getoetst, want dit pad is niet te raden: `/api/image/serve/<id>` gaat
 * langs de authenticatie van Home Assistant, en zonder `/original` krijg je een
 * verkleinde versie.
 */
export function serveerUrl(id) {
  return `/api/image/serve/${id}/original`;
}

/**
 * Mag dit bestand geüpload worden?
 *
 * @returns {string|null} de klacht, of null als het goed is
 */
export function keurBestand(bestand) {
  if (!bestand) return "Geen bestand gekozen.";
  if (!TOEGESTAAN.includes(bestand.type)) {
    return "Kies een afbeelding: PNG, JPEG, GIF, WebP of SVG.";
  }
  if (bestand.size > MAX_BYTES) {
    return `Deze afbeelding is ${Math.round(bestand.size / 1024 / 1024)} MB. Home Assistant neemt er tot ${MAX_BYTES / 1024 / 1024} MB aan.`;
  }
  return null;
}
