/**
 * De robotstofzuiger voor één kamer: wat de kamerkaart moet zeggen, los van hoe
 * hij eruitziet.
 *
 * Gevraagd op 27 november 2026, via de beheersessie: in elke kamer-pop-up een
 * knop die alleen die kamer laat stofzuigen, en laat zien of de robot daar nu
 * bezig is. De eigenaar erbij: "het moet niet fout gaan!"
 *
 * WAAROM OP NAAM EN KAART, EN NIET OP HET NUMMER
 *
 * `dreame_vacuum` geeft per kaart een lijst kamers
 * (`rooms: {"Begane grond": [{id, name, ...}], "Kaart 2": [...]}`) en zegt in
 * `selected_map` op welke kaart de robot nu staat. Een robot die meerdere
 * verdiepingen kent heeft per verdieping een kaart, en de NUMMERS lopen per
 * kaart opnieuw: in de echte gegevens van 27 november 2026 was segment 2 op de
 * ene kaart het kantoor en op de andere "Room 2". En maakt de robot een kaart
 * opnieuw, dan kunnen alle nummers verschuiven. Een knop met alleen een nummer
 * zuigt dan zonder melding een andere kamer.
 *
 * Dus kiest de kaart de kamer op NAAM, binnen een gekozen KAART:
 * - starten kan alleen als `selected_map` die kaart is;
 * - en als elke naam precies één keer op die kaart staat. Het nummer dat
 *   erbij hoort gaat naar de robot.
 * Anders staat de knop uit, met de reden erbij. Een nummer in de config
 * (`{naam, id}`) is alleen een hint: staat de naam er niet meer, dan zegt de
 * kaart welke kamer nu dat nummer heeft. Kiezen doet hij er nooit mee.
 *
 * WANNEER LOOPT ER EEN BEURT
 *
 * Niet alleen als de toestand `cleaning` is. Tijdens één kamerbeurt wisselt de
 * toestand een paar keer tussen `cleaning`, `returning` en `docked`: dan wast
 * het station de dweilpads. `started` en `active_segments` blijven al die tijd
 * staan, en vallen pas aan het eind weg (de geschiedenis van een echte
 * kamerbeurt, 27 november 2026). In een tweede proef die dag stond hij midden
 * in een beurt op `paused` in het station, met `active_segments` nog gezet, en
 * reed hij met `running: false`. Een kaart die op de toestand afgaat, zegt
 * midden in een beurt "in het station" en biedt Start aan. En `current_segment`
 * blijft na de beurt op de laatste kamer staan; die telt alleen als hij echt
 * rijdt.
 *
 * Geen DOM en geen `hass`-methodes: dit hoort in een gewone Node-test.
 */

import { t } from "../taal.js";

const getal = (v) => {
  if (v === null || v === undefined || v === "" || typeof v === "boolean") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** Twee namen zijn dezelfde als ze na spaties en hoofdletters gelijk zijn. */
const sleutel = (naam) => String(naam ?? "").normalize("NFC").replace(/\s+/g, " ").trim().toLocaleLowerCase();

/** De kamers uit de config: een tekst of `{naam, id}`, en `kamer` als korte vorm. */
export function gewensteKamers(config = {}) {
  const ruw = Array.isArray(config.kamers) ? config.kamers : config.kamer != null ? [config.kamer] : [];
  const uit = [];
  for (const k of ruw) {
    const naam = String((k && typeof k === "object" ? k.naam ?? k.name : k) ?? "").trim();
    if (!naam || uit.some((x) => sleutel(x.naam) === sleutel(naam))) continue;
    const id = k && typeof k === "object" ? getal(k.id) : null;
    uit.push({ naam, id });
  }
  return uit;
}

/** Een kamer uit de lijst van de robot, of null als hij geen nummer of naam heeft. */
const kamerUit = (r) => {
  const id = getal(r?.id);
  const naam = String(r?.name ?? "").trim();
  return id == null || !naam ? null : { id, naam };
};

/**
 * De kaarten die de robot meldt: `{naam: kamers}`. Een robot die een kale lijst
 * geeft (een andere integratie) heeft één kaart zonder naam: `{"": kamers}`.
 */
export function kaartenVan(st) {
  const rooms = st?.attributes?.rooms;
  const uit = {};
  if (Array.isArray(rooms)) uit[""] = rooms.map(kamerUit).filter(Boolean);
  else if (rooms && typeof rooms === "object") {
    for (const [naam, lijst] of Object.entries(rooms)) if (Array.isArray(lijst)) uit[naam] = lijst.map(kamerUit).filter(Boolean);
  }
  return uit;
}

/** De naam van de kaart in de config zoals de robot hem schrijft, of null. */
const kaartNaam = (kaarten, gewenst) => Object.keys(kaarten).find((k) => sleutel(k) === sleutel(gewenst)) ?? null;

/**
 * Welke kamers de robot moet doen, of waarom niet.
 *
 * @param {object} st de stofzuiger
 * @param {{kaart?: string, kamers?: Array<string|{naam: string, id?: number}>, kamer?: string}} config
 * @param {{segmentDienst?: boolean}} [opties] of Home Assistant `vacuum_clean_segment` kent
 * @returns {{ok: boolean, reden: string, ernstig: boolean, kaart: string, kamers: Array<{id: number, naam: string}>}}
 *   `ernstig` is een fout in de instelling (de kamer is weg), geen gewone stand
 *   (de robot staat op een andere verdieping).
 */
export function kamerDoel(st, config = {}, { segmentDienst = false } = {}) {
  const nee = (reden, ernstig = false) => ({ ok: false, reden, ernstig, kaart: "", kamers: [] });
  const gewenst = gewensteKamers(config);
  if (!gewenst.length) return nee(t("Kies in de editor een kamer."), true);
  if (!st || st.state === "unavailable") return nee(t("Niet bereikbaar"));
  if (!segmentDienst) return nee(t("Deze robot kan geen losse kamers doen."), true);

  const kaarten = kaartenVan(st);
  const namen = Object.keys(kaarten);
  if (!namen.length) return nee(t("De robot meldt geen kamers."), true);

  // Een kale lijst kent geen kaarten: dan mag er ook geen kaart gekozen zijn.
  let kaart = "";
  if (namen.length === 1 && namen[0] === "") {
    if (String(config.kaart ?? "").trim()) return nee(t("De robot meldt geen kaarten."), true);
  } else {
    if (!String(config.kaart ?? "").trim()) return nee(t("Kies in de editor een kaart."), true);
    kaart = kaartNaam(kaarten, config.kaart);
    if (kaart == null) return nee(t("Kaart {kaart} bestaat niet meer.", { kaart: config.kaart }), true);
    const nu = st.attributes?.selected_map;
    if (nu == null || String(nu).trim() === "") return nee(t("De robot meldt niet op welke kaart hij staat."));
    if (sleutel(nu) !== sleutel(kaart)) return nee(t("Robot staat op een andere kaart ({kaart}).", { kaart: String(nu) }));
  }

  const lijst = kaarten[kaart];
  const kamers = [];
  for (const w of gewenst) {
    const zelfde = lijst.filter((k) => sleutel(k.naam) === sleutel(w.naam));
    if (zelfde.length > 1) return nee(t("Kamer {naam} staat {n} keer op de kaart.", { naam: w.naam, n: zelfde.length }), true);
    if (!zelfde.length) {
      const opDiePlek = w.id != null ? lijst.find((k) => k.id === w.id) : null;
      return nee(
        opDiePlek
          ? t("Kamer {naam} staat niet meer op de kaart; nummer {id} is nu {ander}.", { naam: w.naam, id: w.id, ander: opDiePlek.naam })
          : t("Kamer {naam} staat niet meer op de kaart.", { naam: w.naam }),
        true,
      );
    }
    kamers.push(zelfde[0]);
  }
  return { ok: true, reden: "", ernstig: false, kaart, kamers };
}

/** De segmenten waar de robot in deze beurt mee bezig is, als getallen. */
const segmentenVan = (a) => (Array.isArray(a?.active_segments) ? a.active_segments.map(getal).filter((n) => n != null) : []);

/**
 * Loopt er een beurt, ook als hij even in het station de dweilpads wast?
 * Zie de kop: `started` en `active_segments` blijven de hele beurt staan.
 */
export function beurtLoopt(st) {
  if (!st || st.state === "unavailable") return false;
  const a = st.attributes ?? {};
  if (["cleaning", "paused", "returning"].includes(st.state)) return true;
  // `running` alleen zegt niets: in een echte kamerbeurt stond hij op false
  // terwijl de robot reed. Elk van deze vlaggen telt dus op zich.
  return [a.started, a.running, a.paused, a.segment_cleaning].includes(true) || segmentenVan(a).length > 0;
}

/**
 * De kamers waar deze beurt over gaat: `active_segments`, en anders de kamer
 * waar hij nu rijdt. `current_segment` blijft na de beurt staan, dus die telt
 * alleen als hij echt schoonmaakt of gepauzeerd staat.
 */
export function beurtKamers(st) {
  const a = st?.attributes ?? {};
  if (!beurtLoopt(st)) return new Set();
  const lijst = segmentenVan(a);
  if (lijst.length) return new Set(lijst);
  const nu = getal(a.current_segment);
  return nu != null && (st.state === "cleaning" || st.state === "paused") ? new Set([nu]) : new Set();
}

/**
 * Wat de robot nu doet, gezien vanuit deze kamer.
 *
 * - `hier`: de beurt gaat (ook) over deze kamer. Dat kan alleen als hij op de
 *   kaart van deze kamer staat; een nummer op een andere kaart is een andere
 *   kamer.
 * - `elders`: er loopt een beurt, maar niet hier. `waar` zegt welke kamers, als
 *   die op zijn huidige kaart te vinden zijn.
 * - `vrij`: er loopt geen beurt.
 *
 * @returns {{soort: "dood"|"hier"|"elders"|"vrij", pauze: boolean, waar: string}}
 */
export function kamerBeurt(st, doel) {
  if (!st || st.state === "unavailable") return { soort: "dood", pauze: false, waar: "" };
  if (!beurtLoopt(st)) return { soort: "vrij", pauze: false, waar: "" };
  const pauze = st.state === "paused" || st.attributes?.paused === true;
  const bezig = beurtKamers(st);
  if (doel?.ok && doel.kamers.some((k) => bezig.has(k.id))) return { soort: "hier", pauze, waar: "" };
  const kaarten = kaartenVan(st);
  const nu = st.attributes?.selected_map;
  const kaart = nu != null && String(nu).trim() !== "" ? kaartNaam(kaarten, nu) : "";
  const lijst = (kaart != null && kaarten[kaart]) || [];
  const waar = [...bezig].map((id) => lijst.find((k) => k.id === id)?.naam).filter(Boolean);
  return { soort: "elders", pauze, waar: waar.join(", ") };
}

/** "Keuken", "Keuken en Bijkeuken", "Keuken, Gang en Hal". */
export function kamerNamen(kamers) {
  const n = kamers.map((k) => (typeof k === "string" ? k : k.naam));
  return n.length <= 1 ? n.join("") : t("{lijst} en {laatste}", { lijst: n.slice(0, -1).join(", "), laatste: n.at(-1) });
}

/**
 * De knop van de kamerkaart.
 *
 * Tijdens een beurt HIER pauzeren of hervatten. Anders starten, en dat vraagt
 * altijd eerst: bij een beurt ergens anders met de vraag of die beurt
 * afgebroken mag worden. Een stille vervanging is er niet.
 *
 * @returns {{rol: string, label: string, icoon: string, uit: boolean, oproep: Array|null, vraag: object|null}}
 */
export function kamerKnop(st, doel, beurt, { robot = "", namen = "" } = {}) {
  const id = st?.entity_id;
  if (beurt.soort === "hier") {
    return beurt.pauze
      ? { rol: "hervat", label: t("Hervatten"), icoon: "play", uit: false, oproep: ["vacuum", "start", { entity_id: id }], vraag: null }
      : { rol: "pauze", label: t("Pauzeren"), icoon: "pause", uit: false, oproep: ["vacuum", "pause", { entity_id: id }], vraag: null };
  }
  const oproep = doel.ok
    ? ["dreame_vacuum", "vacuum_clean_segment", { entity_id: id, segments: doel.kamers.map((k) => k.id) }]
    : null;
  const vraag =
    beurt.soort === "elders"
      ? {
          title: t("Lopende beurt afbreken?"),
          text: beurt.waar
            ? t("{robot} is nu bezig in {waar}. Als je {kamers} start, breekt hij die beurt af.", { robot, waar: beurt.waar, kamers: namen })
            : t("{robot} is nu met een andere beurt bezig. Als je {kamers} start, breekt hij die beurt af.", { robot, kamers: namen }),
          confirmText: t("Afbreken en starten"),
        }
      : {
          title: t("{kamers} stofzuigen?", { kamers: namen }),
          text: t("{robot} gaat {kamers} schoonmaken.", { robot, kamers: namen }),
          confirmText: t("Starten"),
        };
  return { rol: "start", label: t("Starten"), icoon: "play", uit: !doel.ok || beurt.soort === "dood", oproep, vraag };
}

/**
 * Mag de start na de vraag nog door? Tussen de vraag en het ja kan de robot
 * van kaart wisselen, een beurt beginnen of klaar zijn. Alleen als het doel nog
 * hetzelfde is en de beurt nog dezelfde soort, gaat hij door; anders tekent de
 * kaart de nieuwe stand en stelt de klant de vraag opnieuw.
 */
export function nogGeldig(eerder, nu) {
  return (
    Boolean(eerder?.oproep) &&
    Boolean(nu?.oproep) &&
    eerder.rol === "start" &&
    nu.rol === "start" &&
    !nu.uit &&
    JSON.stringify(eerder.oproep) === JSON.stringify(nu.oproep) &&
    eerder.vraag?.confirmText === nu.vraag?.confirmText
  );
}
