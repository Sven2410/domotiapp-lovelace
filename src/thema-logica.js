/**
 * Licht of donker: de beslissing, zonder DOM.
 *
 * Dit bestand kent geen element en geen `hass`, zodat het in een gewone
 * unittest te draaien is (CLAUDE.md: geen jsdom). Het meten en het zetten van
 * het attribuut staat in thema.js.
 *
 * ## Waarom we METEN en niet `hass.themes.darkMode` lezen
 *
 * Dat was de voor de hand liggende bron, en hij klopt niet. Home Assistant zet
 * `darkMode` op `false` voor ELK gekozen thema dat geen `modes:` heeft -- ook
 * als dat thema zwart is met witte letters. Het thema van de eigenaar is er zo
 * een: achtergrond #2c2c2e, tekst #FFF, geen `modes`. Wie `darkMode` volgt,
 * zet op zijn donkere dashboard lichte kaarten neer.
 *
 * Wat wel klopt is wat er op het scherm staat: de tekstkleur van het thema. Is
 * die licht, dan is de ondergrond donker, wat het thema daar verder ook over
 * beweert. `darkMode` is alleen nog het vangnet voor als er niets te meten valt.
 *
 * ## De instelling
 *
 * Bij de integratie staat een keuze: `auto` (volg Home Assistant), `licht` of
 * `donker`. De laatste twee winnen van de meting. Dat is er voor een dashboard
 * met een foto als achtergrond, waar de tekstkleur van het thema niets zegt
 * over wat er achter de kaart ligt.
 */

export const INSTELLINGEN = ["auto", "licht", "donker"];

/** De globale waar de lader de instelling in zet. Zie loader.py. */
export const GLOBALE = "__domotiappLovelaceThema";

/** Een geldige instelling, of `null`. */
export const alsInstelling = (waarde) => (INSTELLINGEN.includes(waarde) ? waarde : null);

/**
 * De instelling uit het antwoord van de lader.
 *
 * Een lader van vóór 0.54.0 noemt hem niet; dat is `null` en geen fout.
 */
export function instellingUit(tekst) {
  const gevonden = /__domotiappLovelaceThema\s*=\s*"([a-z]+)"/.exec(String(tekst ?? ""));
  return gevonden ? alsInstelling(gevonden[1]) : null;
}

const NAMEN = { white: [255, 255, 255, 1], black: [0, 0, 0, 1], transparent: [0, 0, 0, 0] };

const kanaal = (tekst, max = 255) => {
  const t = String(tekst).trim();
  if (t === "none") return 0;
  const getal = Number.parseFloat(t);
  if (!Number.isFinite(getal)) return NaN;
  return t.endsWith("%") ? (getal / 100) * max : getal;
};

/**
 * Een kleur zoals `getComputedStyle` hem teruggeeft, als `[r, g, b, a]`.
 *
 * Kent `rgb()` en `rgba()` in beide schrijfwijzen, `color(srgb ...)` (wat een
 * `color-mix()` oplevert), `#hex`, en de drie namen die een thema in de
 * praktijk gebruikt. Al het andere is `null`: liever niet weten dan gokken.
 */
export function leesKleur(tekst) {
  const t = String(tekst ?? "").trim().toLowerCase();
  if (!t) return null;
  if (NAMEN[t]) return [...NAMEN[t]];

  const hex = /^#([0-9a-f]{3,8})$/.exec(t);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
    if (h.length !== 6 && h.length !== 8) return null;
    const getallen = [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16));
    const alfa = h.length === 8 ? Number.parseInt(h.slice(6, 8), 16) / 255 : 1;
    return [...getallen, alfa];
  }

  const rgb = /^rgba?\(([^)]+)\)$/.exec(t);
  if (rgb) {
    const delen = rgb[1].split(/[\s,/]+/).filter(Boolean);
    if (delen.length < 3) return null;
    const [r, g, b] = delen.slice(0, 3).map((d) => kanaal(d, 255));
    const a = delen.length > 3 ? kanaal(delen[3], 1) : 1;
    return [r, g, b, a].every(Number.isFinite) ? [r, g, b, a] : null;
  }

  const srgb = /^color\(srgb\s+([^)]+)\)$/.exec(t);
  if (srgb) {
    const delen = srgb[1].split(/[\s/]+/).filter(Boolean);
    if (delen.length < 3) return null;
    const [r, g, b] = delen.slice(0, 3).map((d) => kanaal(d, 1) * 255);
    const a = delen.length > 3 ? kanaal(delen[3], 1) : 1;
    return [r, g, b, a].every(Number.isFinite) ? [r, g, b, a] : null;
  }

  return null;
}

const lineair = (v) => {
  const s = Math.min(255, Math.max(0, v)) / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

/** De relatieve helderheid volgens WCAG, 0 (zwart) tot 1 (wit). */
export const helderheid = ([r, g, b]) =>
  0.2126 * lineair(r) + 0.7152 * lineair(g) + 0.0722 * lineair(b);

/** De contrastverhouding volgens WCAG, 1 tot 21. */
export function contrast(a, b) {
  const [hoog, laag] = [helderheid(a), helderheid(b)].sort((x, y) => y - x);
  return (hoog + 0.05) / (laag + 0.05);
}

/** Een kleur met alfa op een dichte ondergrond gelegd. */
export const opOndergrond = ([r, g, b, a = 1], [or, og, ob]) => [
  or + (r - or) * a,
  og + (g - og) * a,
  ob + (b - ob) * a,
];

/**
 * De grens tussen "lichte tekst" en "donkere tekst".
 *
 * 0,18 is het punt waarop een kleur evenveel contrast heeft met wit als met
 * zwart. Tekst die lichter is dan dat staat dus op een donkere ondergrond --
 * anders was hij daar niet te lezen.
 */
const MIDDEN = 0.18;

/**
 * Wat het thema van Home Assistant is, afgelezen aan zijn tekstkleur.
 *
 * @param {object} meting
 * @param {string} [meting.tekst]   de berekende tekstkleur van het thema
 * @param {boolean} [meting.darkMode]  `hass.themes.darkMode`, alleen als vangnet
 * @returns {"licht"|"donker"|null}  `null` als er niets te meten viel
 */
export function gemetenThema({ tekst, darkMode } = {}) {
  const kleur = leesKleur(tekst);
  // Een doorzichtige tekstkleur is geen tekstkleur: dat is de terugvalwaarde
  // van de meetprop, en betekent dat de variabele hier niet bestaat.
  if (kleur && kleur[3] > 0.5) return helderheid(kleur) > MIDDEN ? "donker" : "licht";
  if (darkMode === true) return "donker";
  if (darkMode === false) return "licht";
  return null;
}

/**
 * Het thema dat een kaart draagt.
 *
 * De instelling wint. Staat die op `auto` (of is hij nog niet bekend), dan
 * geldt de meting; viel er niets te meten, dan blijft het donker, zoals het
 * altijd was.
 *
 * @returns {"licht"|"donker"}
 */
export function themaVoor(instelling, gemeten) {
  if (instelling === "licht" || instelling === "donker") return instelling;
  return gemeten === "licht" ? "licht" : "donker";
}

/* ------------------------------------------------------------ lampkleur */

/** Het lichte kaartvlak op wit: rgba(20, 20, 10, .045) over #fff. */
export const LICHT_VLAK = [244.4, 244.4, 244];

/**
 * De donkerste helderheid die een lampkleur op een lichte kaart mag hebben.
 *
 * 0,33 geeft 2,5:1 tegen het lichte kaartvlak. Dat is minder dan de 3:1 die
 * voor tekst zou gelden, en met opzet: het is een icoon in een chip die
 * dezelfde kleur als vulling en rand draagt, met de naam en de stand ernaast.
 * Donkerder dan dit wordt geel bruin, en dan herken je de lamp niet meer.
 */
export const LAMP_PLAFOND = 0.33;

/**
 * Hoe ver rood, groen en blauw uit elkaar moeten liggen voordat een lichte
 * kleur als KLEUR telt en niet als een soort wit.
 *
 * Home Assistant rekent een kleurtemperatuur om naar rgb: 2700 K is
 * (255, 169, 87), verschil 168, en dat is oranje genoeg om oranje te tonen.
 * 4000 K is (255, 206, 166), verschil 89: dat is wit, en wordt lampgeel.
 */
export const WIT_GRENS = 120;

/** Dezelfde grens voor een lamp die zelf zegt dat hij kleur maakt. */
export const BIJNA_WIT = 48;

/** De kleurmodi van Home Assistant waarin een lamp wit licht maakt. */
export const WITTE_MODI = new Set(["color_temp", "white", "brightness", "onoff"]);

/**
 * Een lampkleur die op een LICHTE kaart te zien is.
 *
 * Een lamp draagt de kleur die hij maakt. Op een donkere kaart werkt dat met
 * elke kleur; op een lichte niet, want de meeste lampen maken iets dat dicht
 * bij wit ligt. Twee gevallen:
 *
 * - **Wit licht, koud of warm**: `null`. De aanroeper valt dan terug op het
 *   lampgeel van het thema. Wit donkerder maken geeft grijs en warm wit
 *   donkerder maken geeft bruin -- gemeten op 30 september 2026 met een lamp op
 *   halve kleurtemperatuur: rgb(186, 149, 105), een modderkleurige schuif. Een
 *   grijze of bruine lamp leest als een lamp waar iets mee is.
 *
 *   Of een lamp wit licht maakt zegt hij zelf, in `color_mode`. Een lamp op
 *   een kleurtemperatuur meldt wel een `rgb_color`, maar dat is de
 *   omrekening van Home Assistant en geen kleur die iemand gekozen heeft. Is
 *   de modus niet bekend (het gemiddelde van een rij lampen op de badge), dan
 *   beslist de kleur zelf: liggen rood, groen en blauw dicht bij elkaar, dan
 *   is het wit.
 * - **Een echte kleur die te licht is**: dezelfde tint, donkerder, tot hij het
 *   plafond haalt. De verhouding tussen rood, groen en blauw blijft gelijk.
 *
 * In donker komt de kleur er ongewijzigd uit.
 *
 * @param {number[]} rgb  `[r, g, b]` zoals Home Assistant hem meldt
 * @param {boolean} licht
 * @param {string} [kleurmodus]  `attributes.color_mode` van de lamp
 * @returns {number[]|null}
 */
export function lampkleurVoor(rgb, licht, kleurmodus) {
  if (!Array.isArray(rgb) || rgb.length < 3) return null;
  const kleur = rgb.slice(0, 3).map(Number);
  if (!kleur.every(Number.isFinite)) return null;
  if (!licht) return kleur;

  const hoogste = Math.max(...kleur);
  const laagste = Math.min(...kleur);
  if (WITTE_MODI.has(kleurmodus)) return null;
  // Een lamp in een kleurmodus mag pastel zijn; alleen wat echt bijna wit is
  // valt weg. Zonder modus is de grens ruimer, want dan kan het warm wit zijn.
  const grens = kleurmodus ? BIJNA_WIT : WIT_GRENS;
  if (hoogste - laagste < grens && hoogste > 170) return null;

  const h = helderheid(kleur);
  if (h <= LAMP_PLAFOND) return kleur;

  // Schalen in lineair licht houdt de tint gelijk. Eén stap is genoeg: de
  // helderheid is lineair in de drie lineaire kanalen.
  const factor = LAMP_PLAFOND / h;
  const terug = (v) => {
    const l = lineair(v) * factor;
    const s = l <= 0.0031308 ? l * 12.92 : 1.055 * l ** (1 / 2.4) - 0.055;
    return Math.round(s * 255);
  };
  return kleur.map(terug);
}
