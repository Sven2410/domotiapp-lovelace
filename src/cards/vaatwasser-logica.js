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

/*
 * DE GEPLANDE START
 *
 * Een energiebeheerder -- bij de eigenaar is dat DomotiApp Coach -- zet de
 * vaatwasser aan op het goedkoopste moment, en meldt dat moment in een sensor.
 * Op 26 september 2026 werd de vaatwasser thuis om 12:16 vrijgegeven, plande de
 * coach 14:00, en ging hij om 13:12 met de hand aan: op de kaart stond nergens
 * dat er een plan was.
 *
 * De sensor van de coach staat op `unknown` zodra hij draait of niet meer
 * vrijgegeven is. Zolang hij wacht is de toestand sinds v0.100.1 van de coach
 * TEKST -- "om 14:00", "morgen om 09:00", "zondag om 09:00" of "nu" -- en staat
 * het tijdstip in het attribuut `start`. In v0.100.0 was de toestand zelf het
 * tijdstip, en daartegen is deze kaart in 0.47.0 gebouwd; een dag later zag hij
 * het plan niet meer (gemeld op 7 oktober 2026). Andere systemen doen het met
 * een `input_datetime` of een kale klok; alles wordt gelezen.
 */

/** Hoe ver een gepland moment voorbij mag zijn voordat het niet meer telt. */
const START_MARGE_MS = 60_000;

/**
 * Een datum met tijd als `Date`, of null als het er geen is.
 *
 * Met zone (de coach, `datetime`) is het één moment; zonder zone
 * (`input_datetime`) is het lokale tijd, en dat is precies hoe een ISO-tekst
 * met een T erin en zonder zone gelezen wordt.
 */
function tijdstip(s) {
  const vol = String(s ?? "").trim().match(/^(\d{4}-\d{2}-\d{2})[T ](\d{1,2}:\d{2}.*)$/);
  if (!vol) return null;
  const d = new Date(`${vol[1]}T${vol[2].padStart(5, "0")}`);
  return Number.isNaN(+d) ? null : d;
}

/**
 * Het moment waarop hij straks start, als `Date`, of null.
 *
 * Een moment dat al voorbij is telt niet: dan is het plan uitgevoerd of
 * vervallen, en "Start om 14:00" om kwart over drie is een leugen. Er zit een
 * minuut marge op, zodat de tekst niet wegvalt in de seconden tussen het
 * startsein en de statussensor die "draait" meldt.
 *
 * Waar het vandaan komt, in deze volgorde:
 *
 *   1. het attribuut `start` (de coach): daar staat het tijdstip, en de
 *      toestand is dan tekst die de kaart niet hoeft te ontleden;
 *   2. "nu" (de coach start hem op dit moment): dan is het moment nu;
 *   3. de toestand zelf: een tijdstip, of een kale klok ("02:00") -- vandaag,
 *      of morgen als dat al voorbij is, want een nachtelijke start wordt
 *      's avonds gepland.
 *
 * Een toestand `unknown` of `unavailable` wint van alles: dan is er niets
 * gepland, wat er ook nog in de attributen staat.
 *
 * @param {object|null} st de state van de sensor
 * @param {Date} nu wordt meegegeven zodat de test niet van de klok afhangt
 */
export function startMoment(st, nu = new Date()) {
  if (!st) return null;
  const s = String(st.state ?? "").trim();
  if (!s || s === "unknown" || s === "unavailable") return null;
  const telt = (d) => (+d < +nu - START_MARGE_MS ? null : d);

  const uitAttribuut = tijdstip(st.attributes?.start);
  if (uitAttribuut) return telt(uitAttribuut);

  if (/^(nu|now)$/i.test(s)) return new Date(+nu);

  const uitToestand = tijdstip(s);
  if (uitToestand) return telt(uitToestand);

  const klok = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (klok) {
    const u = Number(klok[1]);
    const m = Number(klok[2]);
    if (u > 23 || m > 59) return null;
    const d = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate(), u, m);
    if (+d < +nu - START_MARGE_MS) d.setDate(d.getDate() + 1);
    return d;
  }

  return null;
}

const DAGEN = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
const MAANDEN = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

/** Het aantal kalenderdagen tussen twee momenten, in lokale tijd. */
const dagenTussen = (van, tot) =>
  Math.round(
    (new Date(tot.getFullYear(), tot.getMonth(), tot.getDate()) -
      new Date(van.getFullYear(), van.getMonth(), van.getDate())) /
      86_400_000
  );

/**
 * Dat moment als iets wat een mens zegt: "Start om 14:00".
 *
 * Vandaag zonder dag, morgen als "morgen", binnen een week met de naam van de
 * dag en daarna met een datum. Op de KALENDER gerekend en niet in uren: om
 * 23:00 is 02:00 morgen, ook al is het maar drie uur.
 *
 * Is het moment er (de "nu" van de coach, of de minuut marge erna), dan "Start
 * nu": "Start om 12:15" om 12:15:30 leest als iets dat nog moet komen.
 */
export function startTekst(moment, nu = new Date()) {
  if (!moment) return "";
  if (+moment <= +nu) return "Start nu";
  const klok = `${String(moment.getHours()).padStart(2, "0")}:${String(moment.getMinutes()).padStart(2, "0")}`;
  const dagen = dagenTussen(nu, moment);
  if (dagen <= 0) return `Start om ${klok}`;
  if (dagen === 1) return `Start morgen om ${klok}`;
  if (dagen < 7) return `Start ${DAGEN[moment.getDay()]} om ${klok}`;
  return `Start ${moment.getDate()} ${MAANDEN[moment.getMonth()]} om ${klok}`;
}

/**
 * De startsensor van DomotiApp Coach bij deze vrijgaveschakelaar, of "".
 *
 * De coach zet de schakelaar waarmee je de vaatwasser vrijgeeft in het
 * attribuut `release_switch` van zijn sensor, juist zodat een kaart die de
 * schakelaar al kent -- hier het veld Slimme sturing -- de sensor zelf kan
 * vinden. Zo werkt de kaart thuis zonder dat er iets ingevuld hoeft te worden;
 * het veld Geplande start gaat voor.
 *
 * @param {object} states `hass.states`
 * @param {string} schakelaar de entiteit uit het veld Slimme sturing
 */
export function vindStartSensor(states, schakelaar) {
  if (!states || !schakelaar) return "";
  const ids = Object.keys(states)
    .filter((id) => id.startsWith("sensor.") && states[id]?.attributes?.release_switch === schakelaar)
    .sort();
  return ids[0] ?? "";
}

/*
 * IN COMBINATIE MET DE COACH
 *
 * De eigenaar op 11 oktober 2026: de knoppen "Ingeruimd, morgen starten",
 * "Ingeruimd, nu starten" en "Handmatige besturing" uit het coachpaneel moeten
 * ook op de vaatwasserkaart, achter een vinkje in de editor. Zonder coach is
 * het de gewone kaart.
 *
 * De woorden zijn die van het paneel (`views/overview.js` in domotiapp-coach),
 * zodat het op beide plekken hetzelfde heet. Daar is de vrijgave EEN knop die
 * wisselt: "Ingeruimd" zet hem aan, "Vrijgegeven" erop drukken trekt hem in.
 * En pas als de klaar-tijd van vandaag voorbij is, staat er "morgen" bij.
 *
 * Wat de coach zegt komt uit de attributen van zijn startsensor (contract 1):
 * `stand` (niet_vrijgegeven | gepland | start_nu | draait | klaar),
 * `vrijgegeven`, `nu`, `later`, `klaar_om` en `type`. Nooit uit de toestand:
 * die is voor mensen en mag veranderen (valkuil 67).
 *
 * `later` is het woord dat het paneel erbij zet ("morgen", "maandag") als de
 * klaar-tijd van vandaag gemist is, en anders null -- letterlijk `besluit.later`
 * uit de coach, zodat kaart en paneel niet uiteen kunnen lopen. Een sensor
 * zonder dat attribuut valt terug op `klaar_om`.
 */

/**
 * De velden van de kaart die de coach kan invullen: per veld de sleutels in
 * `entiteiten`, op volgorde van voorkeur, en welke domeinen er mogen.
 *
 * Gemeten aan de echte coach v0.110.0 (dump van 11 oktober 2026, zie
 * tests/js/vaste-invoer): `program` is daar het ACTIEVE programma, een sensor,
 * en de keuzelijst heet `program_select`. Een sensor als programmakeuze geeft
 * een uitklaplijst waarmee niets te kiezen valt -- daarom de domeinen. En
 * `status` levert de coach ook, al stond het niet in het contract.
 */
const VELDEN_UIT_COACH = [
  ["status", ["status"]],
  ["remaining", ["remaining"]],
  ["door", ["door"]],
  ["start", ["start"]],
  ["stop", ["stop"]],
  ["program", ["program_select", "program"], ["select", "input_select"]],
];

/**
 * De config, met de lege velden ingevuld uit wat de klant bij de coach koos.
 *
 * Een veld dat in de editor is ingevuld gaat voor: dat is de uitweg als de
 * coach iets anders gebruikt dan wat er op de kaart hoort.
 *
 * @param {object} config
 * @param {Record<string, string>} entiteiten uit `klantEntiteiten()`
 */
export function metCoachVelden(config, entiteiten) {
  const uit = { ...config };
  for (const [veld, sleutels, domeinen] of VELDEN_UIT_COACH) {
    if (uit[veld]) continue;
    const id = sleutels
      .map((k) => entiteiten?.[k])
      .find((x) => x && (!domeinen || domeinen.includes(x.split(".")[0])));
    if (id) uit[veld] = id;
  }
  return uit;
}

/**
 * Wat de coach over dit apparaat zegt, uit de attributen van zijn startsensor.
 *
 * @param {object|null} st
 * `later` is `undefined` als de sensor het attribuut niet heeft, en "" als de
 * coach zegt dat er niets gemist is: dat verschil bepaalt of `klaar_om` nog
 * meetelt.
 *
 * @returns {{stand: string, vrijgegeven: boolean, nu: boolean, later: string|undefined, klaarOm: Date|null, type: string}|null}
 */
export function coachStand(st) {
  const a = st?.attributes;
  if (!a || st.state === "unavailable") return null;
  return {
    stand: String(a.stand ?? ""),
    vrijgegeven: a.vrijgegeven === true,
    nu: a.nu === true,
    later: "later" in a ? String(a.later ?? "") : undefined,
    klaarOm: tijdstip(a.klaar_om),
    type: String(a.type ?? ""),
  };
}

/**
 * Een statussensor voor wie er geen heeft, uit de stand van de coach.
 *
 * Niet elke klant heeft een sensor die "Run" of "Ready" zegt; de coach weet
 * aan het vermogen of hij draait. Een sensor die er wél is gaat voor -- die
 * kent ook pauze en storing, en de coach niet.
 */
export function statusUitCoach(coach) {
  if (!coach?.stand) return null;
  const woord = coach.stand === "draait" ? "run" : coach.stand === "klaar" ? "finished" : "ready";
  return { entity_id: "", state: woord, attributes: {} };
}

/**
 * De knoppen van de coach op de kaart, in volgorde.
 *
 * Een knop zonder entiteit staat er niet: een coach die een knop (nog) niet
 * levert, krijgt geen knop die niets doet. Zolang hij draait is er niets vrij
 * te geven; dan blijft alleen Handmatig over (en dat is de kaart zelf).
 *
 * @param {object} p
 * @param {ReturnType<typeof coachStand>} p.coach
 * @param {Record<string, string>} p.rollen uit `coachRollen()`
 * @param {boolean} [p.loopt] draait hij volgens de statussensor?
 * @param {Date} [p.nu]
 * @returns {{rol: string, entity: string, label: string, aria: string, aan: boolean}[]}
 */
export function coachKnoppen({ coach, rollen, loopt = false, nu = new Date() }) {
  if (!coach || loopt || coach.stand === "draait") return [];
  const kort = !coach.type || coach.type === "vaatwasser" ? "Ingeruimd" : "Mag draaien";
  const knoppen = [];

  if (coach.vrijgegeven) {
    knoppen.push({
      rol: "vrijgave",
      entity: rollen.vrijgave_intrekken,
      label: "Vrijgegeven",
      aria: "Vrijgegeven. Druk om de vrijgave in te trekken.",
      aan: true,
    });
  } else {
    const later = coach.later ?? laterWoord(coach.klaarOm, nu);
    knoppen.push({
      rol: "vrijgave",
      entity: rollen.ingeruimd_morgen,
      label: later ? `${later[0].toUpperCase()}${later.slice(1)} starten` : kort,
      aria: later ? `${kort}, ${later} starten` : kort,
      aan: false,
    });
  }

  if (!coach.nu) {
    knoppen.push({
      rol: "nu",
      entity: rollen.ingeruimd_nu,
      label: "Nu starten",
      aria: coach.vrijgegeven ? "Toch nu starten" : `${kort}, nu starten`,
      aan: false,
    });
  }

  return knoppen.filter((k) => k.entity);
}

/**
 * "morgen", "maandag", of "" als de klaar-tijd vandaag is.
 *
 * Alleen voor een sensor zonder `later`. Het paneel zet er "morgen" bij zodra
 * de klaar-tijd van vandaag voorbij is; de coach geeft dan de klaar-tijd van
 * morgen als `klaar_om`. Dat wijkt af op een dag zonder klaar-tijd (dan zegt
 * dit "morgen" en het paneel niets), en daarom gaat `later` voor. Op de
 * KALENDER gerekend, net als `startTekst`.
 */
function laterWoord(klaarOm, nu) {
  if (!klaarOm) return "";
  const dagen = dagenTussen(nu, klaarOm);
  if (dagen <= 0) return "";
  if (dagen === 1) return "morgen";
  return dagen < 7 ? DAGEN[klaarOm.getDay()] : "";
}

/**
 * Wat de kaart zegt als de coach aan staat en er toch niets te volgen is, of "".
 *
 * Zonder deze zin blijft de rij met knoppen gewoon leeg, en dan lijkt de kaart
 * kapot terwijl er een coach van vóór v0.110.0 draait.
 *
 * @param {{reden: string}} keuze uit `kiesApparaat()`
 * @param {number} contract uit `contractVan()` op de startsensor
 */
export function coachMelding(keuze, contract) {
  if (keuze.reden === "geen")
    return "Geen apparaat van DomotiApp Coach gevonden. Daarvoor is coach 0.110.0 of nieuwer nodig.";
  if (keuze.reden === "meerdere") return "Kies in de editor welk apparaat van de coach deze kaart volgt.";
  if (keuze.reden === "weg") return "Het gekozen apparaat van de coach bestaat niet meer.";
  if (!contract) return "Werk DomotiApp Coach bij naar 0.110.0 of nieuwer.";
  return "";
}

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
 *   4. Een geplande start verslaat "klaar om te starten" en "uit", maar een
 *      open klep blijft erbij staan: daarmee gaat het plan straks mis.
 *      "Programma klaar" en "Niet bereikbaar" winnen van het plan -- de vaat
 *      is schoon, of de machine is weg, en dat is het nieuws.
 *
 * @param {Date|null} [start] het geplande startmoment uit `startMoment`
 * @param {Date} [nu]
 * @returns {{soort: string, tekst: string, tone: string, waarschuwing: string}}
 */
export function toestand({ status, deur, rest, pct, start = null, nu = new Date() } = {}) {
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
    // Een klokmoment uit de sensor gaat voor een aftelling van de machine:
    // "Start om 14:00" is wat je wilt weten, "over 2 u 13 min" moet je
    // uitrekenen.
    let tekst = "Uitgestelde start";
    if (start) tekst = startTekst(start, nu);
    else if (rest != null) tekst = `Start over ${restTekst(rest).replace(/^nog /, "")}`;
    return { soort, tekst, tone: "accent", waarschuwing: open ? "Klep open" : "" };
  }

  if (start && (soort === SOORT.KLAAR || soort === SOORT.UIT)) {
    return { soort, tekst: startTekst(start, nu), tone: "accent", waarschuwing: open ? "Klep open" : "" };
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
