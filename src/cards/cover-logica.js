/**
 * Het rekenwerk achter de rolluikkaart, zonder DOM en zonder `hass`.
 *
 * Losgetrokken op 30 augustus 2026, toen er drie dingen bijkwamen die je niet
 * met een schermafdruk bewijst: een poort in plaats van een rolluik, een motor
 * die omgekeerd is aangesloten, en een statusregel die weg mag. Dat eerste is
 * vorm, maar die tweede is een KEUZE PER RICHTING -- welke dienst er wordt
 * aangeroepen, welke toestand er getoond wordt, wat er in de schuif staat -- en
 * dat is precies het soort logica dat in een gewone Node-test hoort en niet in
 * een browser (zie CLAUDE.md, "Geen jsdom-tests die een browser nabootsen").
 *
 * De inversie is met opzet HEEL: knoppen, toestand, schuif en statusregel gaan
 * samen om. Zou alleen de aflezing omdraaien, dan zou je op "Openen" drukken en
 * "Dicht" zien verschijnen -- dat is geen instelling maar een defect. En zou
 * alleen de knop omdraaien, dan zou het rolluik goed bewegen en de kaart het
 * verkeerd melden. Wie zijn motor omgekeerd heeft aangesloten wil dat de kaart
 * doet alsof dat niet zo is.
 */

/** De bits van `supported_features` op een cover-entiteit. */
export const F = { OPEN: 1, CLOSE: 2, SET_POSITION: 4, STOP: 8 };

/** Welke feature-bit een dienst nodig heeft. */
export const BIT_VOOR_DIENST = {
  open_cover: F.OPEN,
  close_cover: F.CLOSE,
  stop_cover: F.STOP,
};

/**
 * Een instelling die per rolluik mag, en anders van de kaart komt.
 *
 * `poort` en `invert` zijn eigenschappen van het APPARAAT -- een poort blijft
 * een poort, ook als er een rolluik naast op dezelfde kaart staat -- dus staan
 * ze per regel in de config. De kaart mag ze alsnog voor alles tegelijk zetten;
 * dat is de weg voor wie het in de YAML doet.
 */
export const optie = (cover = {}, config = {}, sleutel) => cover[sleutel] ?? config[sleutel];

/** Toont deze regel woorden op de knoppen in plaats van pijlen? */
export const isPoort = (cover, config) => Boolean(optie(cover, config, "poort"));

/** Is deze motor omgekeerd aangesloten? */
export const isOmgekeerd = (cover, config) => Boolean(optie(cover, config, "invert"));

/**
 * Wat een rolluik draagt als de config geen icoon noemt.
 *
 * `device_class: "gate"` kiest het poorticoon vanzelf. Het VINKJE doet dat
 * bewust niet andersom: een selectievakje dat aangevinkt hoort te staan omdat
 * de entiteit toevallig iets zegt, staat in de editor leeg terwijl de kaart
 * zich anders gedraagt -- en dan lijkt aanvinken niets te doen.
 */
export function standaardIconen(attrs = {}, poort = false) {
  if (poort || attrs.device_class === "gate") return { open: "gateOpen", closed: "gate" };
  switch (attrs.device_class) {
    case "garage":
      return { open: "garageOpen", closed: "garageClosed" };
    case "awning":
    case "blind":
      return { open: "awning", closed: "awning" };
    default:
      return { open: "shutterOpen", closed: "shutter" };
  }
}

/** Wat er op de twee knoppen staat. Een poort schuift opzij; een pijl omhoog liegt daarover. */
export const knopTekst = (poort) =>
  poort ? { open: "Openen", close: "Sluiten" } : { open: "Open", close: "Dicht" };

/** De toestand zoals Home Assistant hem meldt, omgedraaid als het moet. */
const OMGEKEERD = { open: "closed", closed: "open", opening: "closing", closing: "opening" };
export const toestandUit = (state, omgekeerd) =>
  omgekeerd ? (OMGEKEERD[state] ?? state) : state;

/**
 * Een positie omdraaien.
 *
 * Werkt beide kanten op -- van de entiteit naar de schuif en terug -- want
 * `100 - (100 - p)` is `p`. Eén functie dus, en geen tweede die hetzelfde doet
 * en waarvan er straks één vergeten wordt.
 */
export const keerPositie = (pos, omgekeerd) =>
  omgekeerd && pos != null ? 100 - pos : pos;

/** Welke dienst een knop aanroept. */
export function dienstVoor(actie, omgekeerd) {
  if (actie === "stop") return "stop_cover";
  const open = actie === "open";
  return (omgekeerd ? !open : open) ? "open_cover" : "close_cover";
}

/**
 * Welk van de twee iconen er hoort te staan.
 *
 * Wat de motor meldt, anders wat je zojuist indrukte, anders dicht. Dat laatste
 * is de rustige gok: een opgelicht icoon trekt aandacht, en aandacht trekken
 * voor iets wat niemand weet is erger dan het even mis hebben in de andere
 * richting.
 */
export function getoondeStand({ state, positie, aanname }) {
  if (positie != null) return positie > 0 ? "open" : "closed";
  if (state === "open" || state === "closed") return state;
  return aanname ?? "closed";
}

/**
 * De regel onder de naam. Leeg is een geldig antwoord.
 *
 * Geen terugkoppeling betekent geen statusregel: een zin die zegt dat er niets
 * bekend is, is nog steeds een zin die de rij hoger maakt.
 */
export function statusTekst({ dood, state, positie, toon = true }) {
  if (dood) return "Niet bereikbaar";
  if (!toon) return "";
  if (state === "opening") return "Gaat open";
  if (state === "closing") return "Gaat dicht";
  if (positie != null) return `${positie}% open`;
  if (state === "open") return "Open";
  if (state === "closed") return "Dicht";
  return "";
}
