/**
 * Wat een vaatwasserkaart moet zeggen, los van hoe hij eruitziet.
 *
 * Er zitten drie dingen in die op een dashboard stilletjes fout gaan en die je
 * pas merkt als de vaat er al uit had gemoeten:
 *
 * 1. **De resterende tijd komt in vier vormen binnen.** Home Connect meldt een
 *    tijdstip (`device_class: timestamp`), andere integraties melden minuten,
 *    seconden, of een klok als "1:24:00". Reken je er één verkeerd, dan staat
 *    er "nog 84 uur" of "nog 1 minuut" terwijl hij anderhalf uur draait.
 * 2. **De toestand is een woord van de fabrikant.** `Run`, `run`, `Ready`,
 *    `DelayedStart`, `Finished`. Er is geen standaard; wat er wél is, is dat ze
 *    zich in een handvol groepen laten indelen, en dat is wat de kaart nodig
 *    heeft om te weten of hij moet animeren.
 * 3. **De rangorde.** Een open klep verslaat "klaar om te starten", en een
 *    draaiende machine verslaat een open klep -- want dan is die klep net
 *    dichtgedaan en loopt de sensor achter.
 *
 * Geen DOM en geen `hass`: dit hoort in een gewone Node-test, en de rest van de
 * kaart niet.
 */

/** Hoe de toestand van de machine heet, ongeacht wie hem meldt. */
export const SOORT = {
  UIT: "uit",
  KLAAR: "klaar", // klaar om te starten
  UITGESTELD: "uitgesteld",
  DRAAIT: "draait",
  PAUZE: "pauze",
  AF: "af", // programma afgelopen
  FOUT: "fout",
  ONBEKEND: "onbekend",
};

/**
 * De woorden die integraties gebruiken, per soort.
 *
 * Op kleine letters en op HELE WOORDEN vergeleken; zie soortVan hieronder voor
 * waarom dat laatste geen netjesheid is. De volgorde telt: de eerste treffer
 * wint, dus een storing verslaat alles en "uit" komt onderaan.
 */
const WOORDEN = [
  [SOORT.FOUT, ["error", "fout", "aborting", "afgebroken"]],
  [SOORT.DRAAIT, ["run", "active", "washing", "drying", "rinsing", "bezig", "draait", "on"]],
  [SOORT.PAUZE, ["pause", "paused", "pauze", "onderbroken"]],
  [SOORT.UITGESTELD, ["delayedstart", "delayed", "scheduled", "uitgesteld", "wachten"]],
  [SOORT.AF, ["finished", "complete", "done", "klaar met", "afgelopen"]],
  [SOORT.KLAAR, ["ready", "idle", "standby", "klaar", "gereed"]],
  [SOORT.UIT, ["off", "inactive", "uit"]],
];

/** Waar de kaart de machine als draaiend beschouwt. */
export const DRAAIT_SOORTEN = new Set([SOORT.DRAAIT]);

/**
 * De soort van een toestandswoord.
 *
 * Op HELE WOORDEN vergeleken en niet op "bevat", en dat is niet netjesheid maar
 * een gemeten fout: `Inactive` bevat `active`, en met "bevat" stond een
 * uitgeschakelde vaatwasser vrolijk te animeren alsof hij draaide. `off` bevat
 * om dezelfde reden `on`.
 *
 * De toestand wordt daarom op niet-letters geknipt: Home Connect meldt
 * `BSH.Common.EnumType.OperationState.Run` in zijn ruwe vorm en `Run` in zijn
 * nette, en allebei leveren het woord `run` op. Termen met een spatie erin
 * worden nog wel op de hele tekst getoetst -- die zijn er juist om een
 * woordcombinatie te vangen.
 */
export function soortVan(state) {
  const s = String(state ?? "").toLowerCase().trim();
  if (!s || s === "unknown" || s === "unavailable") return SOORT.ONBEKEND;
  const woordenIn = s.split(/[^a-z0-9]+/).filter(Boolean);
  for (const [soort, woorden] of WOORDEN) {
    for (const w of woorden) {
      if (w.includes(" ") ? s.includes(w) : woordenIn.includes(w)) return soort;
    }
  }
  return SOORT.ONBEKEND;
}

/** Draait hij? Eén plek, zodat de animatie en de tekst het niet oneens kunnen zijn. */
export const draait = (statusSt) => DRAAIT_SOORTEN.has(soortVan(statusSt?.state));

/**
 * Hoeveel minuten er nog te gaan zijn, of null.
 *
 * @param {object|null} st de state van de resterende-tijdsensor
 * @param {Date} nu wordt meegegeven zodat de test niet van de klok afhangt
 */
export function restMinuten(st, nu = new Date()) {
  if (!st) return null;
  const s = String(st.state ?? "").trim();
  if (!s || s === "unknown" || s === "unavailable") return null;
  const a = st.attributes ?? {};

  // 1. Een tijdstip: dat is het MOMENT waarop hij klaar is, niet een duur.
  //    Home Connect doet dit, en het is de vorm die het vaakst fout gaat.
  if (a.device_class === "timestamp" || /^\d{4}-\d{2}-\d{2}[T ]/.test(s)) {
    const eind = new Date(s);
    if (Number.isNaN(+eind)) return null;
    return Math.max(0, Math.round((eind - nu) / 60000));
  }

  // 2. Een klok: "1:24:00" of "01:24".
  const klok = s.match(/^(\d{1,3}):(\d{2})(?::(\d{2}))?$/);
  if (klok) {
    return Number(klok[1]) * 60 + Number(klok[2]) + (klok[3] ? Math.round(Number(klok[3]) / 60) : 0);
  }

  // 3. Een getal, met de eenheid uit de attributen.
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  const eenheid = String(a.unit_of_measurement ?? "min").toLowerCase();
  if (eenheid.startsWith("s")) return Math.round(n / 60);
  if (eenheid.startsWith("h") || eenheid.startsWith("u")) return Math.round(n * 60);
  return Math.round(n);
}

/**
 * Die minuten als iets wat een mens zegt.
 *
 * Geen "0 min": als er niets meer te gaan is, is hij klaar, en dat is een ander
 * bericht dan een tijd van nul.
 */
export function restTekst(minuten) {
  if (minuten == null) return "";
  if (minuten <= 0) return "Klaar";
  if (minuten < 60) return `nog ${minuten} min`;
  const u = Math.floor(minuten / 60);
  const m = minuten % 60;
  return m ? `nog ${u} u ${m} min` : `nog ${u} uur`;
}

/**
 * De voortgang in procenten, of null.
 *
 * Is er geen voortgangssensor maar wél een resterende tijd en een totale duur,
 * dan valt er niets te rekenen -- de totale duur weten we niet. Daarom geen
 * schatting: een balk die van 40% naar 15% springt omdat het programma langer
 * bleek, is erger dan geen balk.
 */
export function voortgangPct(st) {
  if (!st) return null;
  const s = String(st.state ?? "").trim();
  // `Number("")` is 0, en `Number(" ")` ook. Zonder deze toets toont een sensor
  // die nog niets weet een balk op nul in plaats van geen balk -- en dat leest
  // als "hij is net begonnen".
  if (!s || s === "unknown" || s === "unavailable") return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return Math.min(100, Math.max(0, Math.round(n)));
}

/** Staat de klep open? */
export const klepOpen = (st) => Boolean(st) && st.state === "on";

/**
 * Loopt er een programma?
 *
 * Ruimer dan `draait`: gepauzeerd en uitgesteld zijn ook "er staat een
 * programma klaar of open". Dit bepaalt of de voortgangsbalk er hoort te staan.
 * Een balk op 38% naast het woord "Uit" leest als "gepauzeerd op 38%", en dat
 * is precies wat er niet aan de hand is -- de sensor houdt gewoon zijn laatste
 * waarde vast.
 */
export const bezig = (soort) =>
  soort === SOORT.DRAAIT || soort === SOORT.PAUZE || soort === SOORT.UITGESTELD;

/**
 * Wat de kaart als toestand toont.
 *
 * De rangorde staat hier en niet in een `paint()`, want dat is precies waar je
 * er per ongeluk eentje omdraait:
 *
 *   1. Draait hij, dan draait hij. Een klepsensor die nog "open" meldt loopt
 *      dan achter op de werkelijkheid.
 *   2. Een open klep verslaat "klaar om te starten": hij gaat zo niet starten.
 *   3. Een fout verslaat de rest van de rusttoestanden.
 *
 * @returns {{soort: string, tekst: string, tone: string, waarschuwing: string}}
 */
export function toestand({ status, deur, rest, pct } = {}) {
  const soort = soortVan(status?.state);
  const open = klepOpen(deur);

  if (soort === SOORT.DRAAIT) {
    const stukjes = [];
    if (rest != null) stukjes.push(restTekst(rest));
    else if (pct != null) stukjes.push(`${pct}%`);
    return {
      soort,
      // Een echte punt en geen twee streepjes: dit is tekst voor op het scherm,
      // niet voor in een commentaarblok.
      tekst: stukjes.length ? `Draait · ${stukjes.join(" ")}` : "Draait",
      tone: "accent",
      waarschuwing: "",
    };
  }

  if (soort === SOORT.PAUZE) {
    return { soort, tekst: "Gepauzeerd", tone: "warn", waarschuwing: open ? "Klep open" : "" };
  }

  if (soort === SOORT.FOUT) {
    return { soort, tekst: "Storing", tone: "bad", waarschuwing: open ? "Klep open" : "" };
  }

  if (soort === SOORT.AF) {
    return { soort, tekst: "Programma klaar", tone: "good", waarschuwing: "" };
  }

  if (soort === SOORT.UITGESTELD) {
    return {
      soort,
      tekst: rest != null ? `Start over ${restTekst(rest).replace(/^nog /, "")}` : "Uitgestelde start",
      tone: "accent",
      waarschuwing: open ? "Klep open" : "",
    };
  }

  if (open) {
    return { soort, tekst: "Klep open", tone: "warn", waarschuwing: "" };
  }

  if (soort === SOORT.UIT) return { soort, tekst: "Uit", tone: "neutral", waarschuwing: "" };
  if (soort === SOORT.KLAAR)
    return { soort, tekst: "Klaar om te starten", tone: "neutral", waarschuwing: "" };

  return { soort: SOORT.ONBEKEND, tekst: "Niet bereikbaar", tone: "neutral", waarschuwing: "" };
}

/**
 * De service-aanroep waarmee je op deze knop drukt, als `[domein, service, data]`.
 *
 * Een start- of stopknop is bij de ene integratie een `button`, bij de andere
 * een `script` en bij een derde een `switch`. Ze hebben alle drie een andere
 * service, en de verkeerde doet niets -- zonder fout op de kaart.
 */
export function drukOproep(entityId) {
  const id = String(entityId ?? "");
  const domein = id.split(".")[0];
  switch (domein) {
    case "button":
      return ["button", "press", { entity_id: id }];
    case "input_button":
      return ["input_button", "press", { entity_id: id }];
    case "script":
      return ["script", "turn_on", { entity_id: id }];
    case "scene":
      return ["scene", "turn_on", { entity_id: id }];
    case "switch":
    case "input_boolean":
      return ["homeassistant", "turn_on", { entity_id: id }];
    case "automation":
      return ["automation", "trigger", { entity_id: id }];
    default:
      return null;
  }
}
