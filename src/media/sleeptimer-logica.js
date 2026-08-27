/**
 * Het rekenwerk van de sleeptimer, zonder DOM.
 *
 * Apart van `sleeptimer.js`, en daar is een harde reden voor: dat bestand is een
 * `class ... extends HTMLElement` op modulescope, en dat gooit in een gewone
 * Node-test de halve testsuite om (valkuil 27). Wat hier staat is te toetsen
 * zonder browser, en dat is precies het deel waar een fout in stil blijft: een
 * klok die "0:09:12" toont of een veld dat "3.9" als 3 minuten leest.
 */

/** De knoppen die er altijd staan. Wat erbuiten valt, typ je zelf. */
export const SNELKEUZES = [15, 30, 45, 60, 90];

/** Zo lang faden we standaard uit. Zie sleeptimer.py voor de grenzen. */
export const FADE_STANDAARD = 30;

/**
 * Hoeveel er nog te gaan is, als "1:04:30" of "9:12".
 *
 * Uren blijven weg zolang ze nul zijn: "0:09:12" leest als een defect.
 */
export function alsKlok(seconden) {
  const s = Math.max(0, Math.round(seconden));
  const u = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = u ? String(m).padStart(2, "0") : String(m);
  return `${u ? `${u}:` : ""}${mm}:${String(r).padStart(2, "0")}`;
}

/**
 * De minuten uit een ingetypt veld, of null.
 *
 * Niet `parseInt`: die maakt van "30 minuten" gewoon 30 en van "3.9" een 3. Wat
 * er in dit veld hoort te staan is een heel getal, en al het andere is een
 * typefout die je moet zien, niet een getal dat je krijgt.
 */
export function minutenUit(tekst, { min = 1, max = 720 } = {}) {
  const schoon = String(tekst ?? "").trim();
  if (!/^\d+$/.test(schoon)) return null;
  const n = Number(schoon);
  return n >= min && n <= max ? n : null;
}
