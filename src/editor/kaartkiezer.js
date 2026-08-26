/**
 * Een kaart kiezen en bewerken, binnen de editor van een andere kaart.
 *
 * WAAROM DIT ER IS
 *
 * De tabbladenkaart bewaart een hele kaart per tab. Tot 26 augustus 2026 kon je
 * die alleen via "Code-editor weergeven" invullen, en dat stond zo in het
 * rapport van die ronde: de kaartkiezer van Home Assistant is intern, en een
 * half nagemaakte zou minder kunnen dan de echte. De eigenaar was daar niet
 * tevreden mee -- "Kan je de tablad editor niet zo maken dat ik Kaarten kan
 * toevoegen zoals de gewone Home Assistant UI editor? Bubble kaart heeft dat
 * ook namelijk" -- en hij heeft gelijk: YAML typen is geen editor.
 *
 * WAT ER GEMETEN IS, EN WAT DAARUIT VOLGT
 *
 * In een echte bewerkdialoog (Home Assistant 2026.8, 26 augustus 2026):
 *
 *   customElements.get("hui-card-element-editor")  ->  wél gedefinieerd
 *   customElements.get("hui-card-picker")          ->  NIET gedefinieerd
 *   customElements.get("hui-dialog-create-card")   ->  NIET gedefinieerd
 *
 * De EDITOR van een kaart is er dus wel zodra je een kaart bewerkt -- dat is
 * precies het element dat onze eigen editor draagt -- maar de KIEZER wordt pas
 * geladen als je in een sectie op "+" drukt, en die is van binnen niet aan te
 * roepen zonder je vast te maken aan een chunknaam die per versie verandert.
 *
 * Daarom deze taakverdeling:
 *
 *   kiezen   -> deze lijst. Hij komt uit `window.customCards` (dat is de eigen
 *               registratie van elke custom kaart, ook de onze) plus een korte
 *               lijst met de ingebouwde kaarttypes van Home Assistant.
 *   bewerken -> `hui-card-element-editor`, het echte ding, met de GUI van de
 *               kaart zelf en de knop naar de code-editor erin.
 *
 * Alleen het KIEZEN is dus nagemaakt, en dat is een lijst met namen -- geen
 * scherm dat kan verouderen. Zodra Home Assistant zijn kiezer wél beschikbaar
 * maakt, wordt hij hier gebruikt: `hakiezer()` kijkt daar eerst.
 *
 * DE VAL DIE HIER ZIT
 *
 * `hui-card-element-editor` vuurt `config-changed`, en dat is precies de
 * gebeurtenis waarmee ONZE editor zijn eigen config doorgeeft aan de dialoog.
 * Laat je hem doorborrelen, dan denkt Home Assistant dat de tabbladenkaart
 * ineens een `tile`-kaart is en overschrijft hij de hele config. Vandaar
 * `stopPropagation()` op alles wat uit de binnenste editor komt.
 */

/**
 * De ingebouwde kaarttypes van Home Assistant, met hun Nederlandse naam.
 *
 * Met opzet een KORTE lijst: dit is wat mensen in een tabblad zetten. De namen
 * zelf zijn al jaren stabiel (`tile`, `entities`, `markdown`); ze verzinnen is
 * dus geen gok. Wat er niet in staat is nog steeds bereikbaar via de
 * code-editor van `hui-card-element-editor`, en dat is één klik verder.
 */
const KERN = [
  ["tile", "Tegel"],
  ["entities", "Entiteiten"],
  ["button", "Knop"],
  ["gauge", "Meter"],
  ["history-graph", "Geschiedenis"],
  ["statistic", "Statistiek"],
  ["sensor", "Sensorgrafiek"],
  ["light", "Lamp"],
  ["thermostat", "Thermostaat"],
  ["humidifier", "Luchtbevochtiger"],
  ["media-control", "Mediaspeler"],
  ["weather-forecast", "Weersverwachting"],
  ["markdown", "Tekst (Markdown)"],
  ["picture", "Afbeelding"],
  ["picture-entity", "Afbeelding met entiteit"],
  ["glance", "Overzicht"],
  ["area", "Ruimte"],
  ["alarm-panel", "Alarmpaneel"],
  ["calendar", "Agenda"],
  ["todo-list", "Takenlijst"],
  ["map", "Kaart"],
  ["iframe", "Webpagina"],
  ["vertical-stack", "Stapel (onder elkaar)"],
  ["horizontal-stack", "Stapel (naast elkaar)"],
  ["grid", "Raster"],
  ["conditional", "Voorwaardelijk"],
];

/** Alles waaruit gekozen kan worden, custom kaarten eerst. */
export function kaartsoorten() {
  const custom = (window.customCards ?? [])
    .filter((c) => c && typeof c.type === "string")
    .map((c) => ({
      type: `custom:${c.type}`,
      naam: c.name || c.type,
      uitleg: c.description || "",
      eigen: true,
    }));

  // De onze bovenaan: dit is de editor van een DomotiApp-kaart, en wie hier
  // een tabblad vult, vult het meestal met een kaart uit dezelfde familie.
  custom.sort((a, b) => {
    const eigenA = a.type.startsWith("custom:domotiapp-") ? 0 : 1;
    const eigenB = b.type.startsWith("custom:domotiapp-") ? 0 : 1;
    return eigenA - eigenB || a.naam.localeCompare(b.naam, "nl");
  });

  return [...custom, ...KERN.map(([type, naam]) => ({ type, naam, uitleg: "", eigen: false }))];
}

/** Filtert op naam, type en omschrijving; leeg geeft alles. */
export function filterSoorten(soorten, zoek) {
  const q = String(zoek ?? "").trim().toLowerCase();
  if (!q) return soorten;
  return soorten.filter((s) =>
    `${s.naam} ${s.type} ${s.uitleg}`.toLowerCase().includes(q),
  );
}

/**
 * Een bruikbare beginconfig voor een gekozen kaarttype.
 *
 * Home Assistant laadt zijn kaarten lui, dus de klasse van een kerntype bestaat
 * hier meestal nog niet. `loadCardHelpers().createCardElement` dwingt die
 * lading af -- dezelfde weg die de tabbladenkaart zelf gebruikt om zijn inhoud
 * te tekenen -- en dan is `getStubConfig` er wél. Lukt dat niet, dan is een kaal
 * `{type}` het antwoord: de editor eronder vraagt gewoon wat er nog mist.
 */
export async function beginConfig(type, hass) {
  const kaal = { type };
  try {
    const helpers = await window.loadCardHelpers?.();
    // Alleen om de klasse te laten laden; het element zelf gooien we weg.
    try {
      helpers?.createCardElement?.(kaal);
    } catch {
      // Een kaart die op een lege config gooit, is precies waarom we hem niet
      // gebruiken maar alleen willen dat zijn klasse geladen is.
    }
    const tag = type.startsWith("custom:") ? type.slice(7) : `hui-${type}-card`;
    const klasse = customElements.get(tag);
    const stub = await klasse?.getStubConfig?.(
      hass,
      Object.keys(hass?.states ?? {}),
      [],
    );
    if (stub && typeof stub === "object") return { ...stub, type };
  } catch {
    // Niets aan te doen: dan begint de kaart leeg en vult de editor hem aan.
  }
  return kaal;
}

/** Is de echte kaarteditor van Home Assistant er? */
export const heeftKaartEditor = () => Boolean(customElements.get("hui-card-element-editor"));

/**
 * De kiezer van Home Assistant zelf, als die er is.
 *
 * Hij wordt geladen zodra iemand in een sectie op "+" heeft gedrukt. Is dat in
 * deze sessie gebeurd, dan is hij er en gebruiken we hem -- dan krijg je de
 * echte kiezer met voorbeelden. Zo niet, dan onze lijst.
 */
export const hakiezer = () => customElements.get("hui-card-picker") ?? null;
