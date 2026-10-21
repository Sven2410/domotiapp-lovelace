/**
 * De taal van de kaarten: Nederlands of Engels (sinds 0.81.0).
 *
 * De eigenaar op 21 oktober 2026, toen de coach Engels werd: de kaarten ook.
 * Eén taal per installatie, net als bij DomotiApp Coach: onder Configureren,
 * Uiterlijk staat Taal (`auto`, `nl` of `en`). Automatisch neemt de taal van
 * Home Assistant: Engels als die met "en" begint, anders Nederlands.
 *
 * ## Hoe het werkt
 *
 * Overgenomen van het paneel van de coach (`i18n.js` daar), zodat er één
 * manier is. Het Nederlands blijft in de bron staan en is de sleutel:
 *
 * ```js
 * t("Nog niets gekozen")
 * t("{n} van {totaal} aan", { n, totaal })
 * tn(n, "{n} lamp", "{n} lampen")
 * ```
 *
 * In het Engels zoekt `t` de zin op in `EN` (i18n/en.js); wat daar niet staat
 * blijft Nederlands. Daardoor blijft elke toets die Nederlandse tekst narekent
 * gelden, en is een zin zonder Engels te vinden met `npm run check:taal`.
 *
 * ## Wanneer de taal bekend is
 *
 * De keuze komt van de LADER (loader.py), net als het thema, en de taal van
 * Home Assistant komt met `hass`. Een kaart tekent zijn tekst één keer, in
 * `template()`. Verandert de taal, dan bouwt hij zich opnieuw op: wie zich
 * aanmeldt met `volgTaal` krijgt dan een seintje. Daarom ook nooit `t()` bij het
 * laden van een module: een tabel met namen houdt het Nederlands (gemerkt met
 * `nt`) en vertaalt waar hij getoond wordt.
 *
 * Dit bestand kent geen DOM, zodat het in een gewone unittest draait.
 */

import { EN } from "./i18n/en.js";

export const TALEN = ["auto", "nl", "en"];

/** De globale waar de lader de keuze in zet. Zie loader.py. */
export const GLOBALE = "__domotiappLovelaceTaal";

const alsInstelling = (waarde) => (TALEN.includes(waarde) ? waarde : null);

let instelling_ = alsInstelling(globalThis[GLOBALE]) ?? "auto";
let haTaal_ = "";
let taal_ = "nl";
const volgers = new Set();

/**
 * De keuze uit het antwoord van de lader. Een lader van vóór 0.81.0 noemt hem
 * niet; dat is `null` en geen fout.
 */
export function taalUit(tekst) {
  const gevonden = /__domotiappLovelaceTaal\s*=\s*"([a-z]+)"/.exec(String(tekst ?? ""));
  return gevonden ? alsInstelling(gevonden[1]) : null;
}

/** De taal uit de keuze, en bij automatisch uit die van Home Assistant. */
export function taalVoor(instelling, haTaal) {
  if (instelling === "nl" || instelling === "en") return instelling;
  return String(haTaal ?? "").toLowerCase().startsWith("en") ? "en" : "nl";
}

function herbereken() {
  const nieuw = taalVoor(instelling_, haTaal_);
  if (nieuw === taal_) return false;
  taal_ = nieuw;
  for (const fn of [...volgers]) {
    try {
      fn(nieuw);
    } catch (fout) {
      // Eén kaart die struikelt mag de rest niet in de oude taal laten staan.
      console.error(fout);
    }
  }
  return true;
}

/** De taal van nu: "nl" of "en". */
export const taal = () => taal_;

/** De keuze bij de integratie: "auto", "nl" of "en". */
export const instelling = () => instelling_;

/** Een nieuwe keuze van de integratie (uit de lader). Geeft true als de taal wisselde. */
export function zetInstelling(waarde) {
  const geldig = alsInstelling(waarde);
  if (!geldig) return false;
  instelling_ = geldig;
  return herbereken();
}

/** De taal van Home Assistant, uit `hass`. Geeft true als de taal wisselde. */
export function zieHass(hass) {
  const ha = hass?.locale?.language ?? hass?.language;
  if (!ha || ha === haTaal_) return false;
  haTaal_ = ha;
  return herbereken();
}

/**
 * Laat `fn` weten dat de taal wisselde. Geeft de functie terug die het
 * seintje weer opzegt.
 */
export function volgTaal(fn) {
  volgers.add(fn);
  return () => volgers.delete(fn);
}

/** De notatie van getallen en datums bij de taal. Engels als in Groot-Brittannië: 24 uur. */
export const locale = () => (taal_ === "en" ? "en-GB" : "nl-NL");

const vul = (zin, waarden) =>
  waarden ? zin.replace(/\{(\w+)\}/g, (heel, naam) => (naam in waarden ? String(waarden[naam]) : heel)) : zin;

/** Een zin in de taal van nu, met de waarden tussen accolades ingevuld. */
export function t(nl, waarden) {
  return vul(taal_ === "en" ? (EN[nl] ?? nl) : nl, waarden);
}

/**
 * Een naam in een tabel die bij het laden van de module al vastligt: `nt`
 * laat hem Nederlands en merkt hem voor `check:taal`. Vertaald wordt hij waar
 * hij getoond wordt, met `t(item.naam)`.
 */
export const nt = (nl) => nl;

/** Enkelvoud of meervoud: `tn(n, "{n} lamp", "{n} lampen")`. */
export const tn = (n, een, meer, waarden = {}) => t(Number(n) === 1 ? een : meer, { n, ...waarden });

/** Een getal met de decimalen en het scheidingsteken van de taal: 1,5 of 1.5. */
export function getal(waarde, decimalen = 1) {
  const n = Number(waarde);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString(locale(), {
    minimumFractionDigits: decimalen,
    maximumFractionDigits: decimalen,
    useGrouping: false,
  });
}

/** Alleen voor de toetsen: begin opnieuw, zonder volgers. */
export function _reset({ instelling = "auto", ha = "" } = {}) {
  volgers.clear();
  instelling_ = instelling;
  haTaal_ = ha;
  taal_ = taalVoor(instelling_, haTaal_);
}
