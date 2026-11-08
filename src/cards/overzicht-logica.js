/**
 * De overzichtskaart: wat er rechts onder het weer staat.
 *
 * De eigenaar, 8 november 2026: "ik ben toch niet tevreden met die header kaart. Ik wil een nieuwe kaart maken. Voor ipad
 * links komen dan de favorieten en rechts moet een soort info scherm komen met weer en belangrijke dingen".
 *
 * "Belangrijk" is hier een lijst regels, en een regel staat er alleen als er iets te melden is (Vormregels: statusregels
 * weglaten als er niets te melden is). De volgorde is die van de urgentie:
 *
 *   1. alarm      een gekozen melder (rook, gas, koolmonoxide, lekkage, hitte) of alarmsysteem dat afgaat
 *   2. open       wat de installateur onder "Let op" zette en nu open of niet op slot staat
 *   3. agenda     de afspraken van nu tot en met `agenda_dagen` dagen vooruit (standaard een week)
 *   4. batterij   een gekozen batterij onder de grens
 *
 * **Alles wat erop staat is gekozen in de editor.** Tot 0.115.0 zocht de kaart zelf alle melders en alle batterijen in
 * huis bij elkaar. De eigenaar, 8 november 2026: "nu pakt hij alle batterij sensoren ik wil dat je alles moet kiezen in de
 * GUI editor". Niets meer uit zichzelf dus, ook de melders niet. En de agenda keek tot dan alleen naar vandaag en morgen;
 * bij hem stond de eerstvolgende afspraak weken later, en dan lijkt de agenda kapot.
 *
 * Afval, lampen die aan zijn en wie er thuis is stonden er in 0.112.0 ook, en zijn er in 0.113.0 met opzet af. De eigenaar:
 * "Afval heb ik links bij favorieten al staan (...) Lampen aan ook niet dat is een badge. Wie er thuis is ook niet dat is de
 * person kaart". Wat al op een eigen kaart of badge staat, hoort hier niet nog een keer. Zet ze niet terug zonder het te vragen.
 *
 * Alleen taal.js en ha.js als import, zodat het in een gewone Node-test past.
 */

import { daysBetween, domainOf, relativeDay } from "../ha.js";
import { nt, t } from "../taal.js";

/** Zoveel regels van één soort, daarna "en n meer". */
export const MAX_PER_SOORT = 3;

/** Standaard: een batterij onder 15% staat erbij. */
export const BATTERIJ_GRENS = 15;

export function groet(d) {
  const h = d.getHours();
  if (h < 6) return t("Goedenacht");
  if (h < 12) return t("Goedemorgen");
  if (h < 18) return t("Goedemiddag");
  return t("Goedenavond");
}

/** De soorten melders die een alarm zijn, met het woord en het icoon. */
export const ALARMEN = {
  smoke: { woord: nt("Rook"), icoon: "smoke" },
  gas: { woord: nt("Gas"), icoon: "gas" },
  carbon_monoxide: { woord: nt("Koolmonoxide"), icoon: "co" },
  moisture: { woord: nt("Lekkage"), icoon: "drop" },
  heat: { woord: nt("Hitte"), icoon: "flame" },
};

/**
 * Wat er van de gekozen melders nu alarm slaat.
 * @returns {Array<{id: string, woord: string, icoon: string}>}
 */
export function alarmen(states, gekozen = []) {
  const uit = [];
  for (const id of new Set(gekozen)) {
    const st = states?.[id];
    if (!st) continue;
    const domein = domainOf(st.entity_id);
    if (domein === "binary_sensor" && st.state === "on" && ALARMEN[st.attributes?.device_class]) {
      const a = ALARMEN[st.attributes.device_class];
      uit.push({ id: st.entity_id, woord: t(a.woord), icoon: a.icoon });
    } else if (domein === "alarm_control_panel" && st.state === "triggered") {
      uit.push({ id: st.entity_id, woord: t("Alarm gaat af"), icoon: "siren" });
    }
  }
  return uit.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Staat dit open, aan of niet op slot? Voor de lijst "Let op".
 *
 * Een deur die dichtgaat is nog open; een slot dat vastzit (`jammed`) is niet op slot.
 */
export function staatOpen(st) {
  if (!st) return false;
  const s = st.state;
  switch (domainOf(st.entity_id)) {
    case "lock":
      return s === "unlocked" || s === "open" || s === "opening" || s === "unlocking" || s === "jammed";
    case "cover":
    case "valve":
      return s === "open" || s === "opening" || s === "closing";
    default:
      return s === "on" || s === "open";
  }
}

/** Het woord achter de naam: "open", "niet op slot" of "aan". */
export function openWoord(st) {
  const domein = domainOf(st?.entity_id);
  if (domein === "lock") return st.state === "jammed" ? t("klemt") : t("niet op slot");
  if (domein === "binary_sensor" || domein === "cover" || domein === "valve") return t("open");
  return st?.state === "open" ? t("open") : t("aan");
}

/** Het icoon van een open ding: een slot, een garage, een raam of een deur. */
export function openIcoon(st) {
  const domein = domainOf(st?.entity_id);
  const klasse = st?.attributes?.device_class;
  if (domein === "lock") return "lockOpen";
  if (klasse === "garage_door" || klasse === "garage") return "garageOpen";
  if (klasse === "window") return "window";
  if (klasse === "gate") return "gateOpen";
  if (domein === "cover") return "shutterOpen";
  return "door";
}

/**
 * Van de gekozen batterijen die onder de grens, de leegste eerst. Een sensor in procenten of een melder die "batterij
 * bijna leeg" zegt (een binary_sensor die aan staat).
 */
export function batterijenLeeg(states, gekozen, grens) {
  if (!(grens > 0)) return [];
  const uit = [];
  for (const id of new Set(gekozen ?? [])) {
    const st = states?.[id];
    if (!st) continue;
    const domein = domainOf(st.entity_id);
    if (domein === "sensor") {
      const pct = Number(st.state);
      if (st.state === "" || !Number.isFinite(pct) || pct >= grens) continue;
      uit.push({ id: st.entity_id, pct });
    } else if (domein === "binary_sensor" && st.state === "on") {
      uit.push({ id: st.entity_id, pct: null });
    }
  }
  return uit.sort((a, b) => (a.pct ?? -1) - (b.pct ?? -1) || a.id.localeCompare(b.id));
}

/** Standaard een week vooruit. */
export const AGENDA_DAGEN = 7;
export const AGENDA_DAGEN_MAX = 60;

/** Het einde van het venster: middernacht na `dagen` dagen, waarbij 1 alleen vandaag is. */
export function agendaTot(nu, dagen = AGENDA_DAGEN) {
  return new Date(nu.getFullYear(), nu.getMonth(), nu.getDate() + dagen);
}

/**
 * De afspraken die ertoe doen: wat nu loopt en wat er nog komt, tot en met `dagen` dagen vooruit (1 is alleen vandaag).
 * @param {Array<{start: Date, eind: Date, heleDag: boolean, titel: string, agenda?: string}>} afspraken
 */
export function komendeAfspraken(afspraken, nu, dagen = AGENDA_DAGEN) {
  const tot = agendaTot(nu, dagen);
  return (afspraken ?? [])
    .filter((a) => a.eind > nu && a.start < tot)
    .sort((a, b) => a.start - b.start || Number(b.heleDag) - Number(a.heleDag));
}

const twee = (n) => String(n).padStart(2, "0");
const klok = (d) => `${twee(d.getHours())}:${twee(d.getMinutes())}`;

/** "nu, tot 15:00", "14:30", "morgen 09:00", "morgen", "vandaag", of verder weg "donderdag 09:00" en "do 17 dec". */
export function afspraakWanneer(a, nu) {
  const dag = daysBetween(nu, a.start);
  if (a.heleDag) return dag <= 0 ? t("vandaag") : relativeDay(a.start, nu);
  if (a.start <= nu) return t("nu, tot {tijd}", { tijd: klok(a.eind) });
  if (dag === 0) return klok(a.start);
  return `${relativeDay(a.start, nu)} ${klok(a.start)}`;
}

/** Knip een soort af op `max` regels, met "en n meer" als laatste. */
export function beperk(rijen, max = MAX_PER_SOORT) {
  if (rijen.length <= max) return rijen;
  const rest = rijen.length - (max - 1);
  return [...rijen.slice(0, max - 1), { soort: rijen[0].soort, toon: "neutral", icoon: "dots", tekst: t("en {n} meer", { n: rest }) }];
}

/**
 * Alle regels, in volgorde. Wat er binnenkomt is al gelezen; hier wordt alleen gekozen en verwoord.
 *
 * @param {object} p
 * @param {Date} p.nu
 * @param {Array} p.alarmen          uit `alarmen`
 * @param {Array} p.open             toestanden van "Let op" die open staan
 * @param {Array} p.afspraken        uit `komendeAfspraken`
 * @param {Array} p.batterijen       uit `batterijenLeeg`
 * @param {(id: string) => string} p.naamVan
 */
export function regels({ nu, alarmen: alarm = [], open = [], afspraken = [], batterijen = [], naamVan = (id) => id }) {
  const uit = [];

  for (const a of alarm) {
    uit.push({ soort: "alarm", toon: "bad", icoon: a.icoon, tekst: naamVan(a.id), bij: a.woord, entity: a.id });
  }

  uit.push(
    ...beperk(open.map((st) => ({ soort: "open", toon: "warn", icoon: openIcoon(st), tekst: naamVan(st.entity_id), bij: openWoord(st), entity: st.entity_id })))
  );

  uit.push(
    ...beperk(afspraken.map((a) => ({ soort: "agenda", toon: "accent", icoon: "calendar", tekst: a.titel || t("Afspraak"), bij: afspraakWanneer(a, nu), entity: a.agenda, afspraak: a })))
  );

  uit.push(
    ...beperk(batterijen.map((b) => ({ soort: "batterij", toon: "warn", icoon: "battery", tekst: naamVan(b.id), bij: b.pct == null ? t("bijna leeg") : `${Math.round(b.pct)}%`, entity: b.id })))
  );

  return uit;
}
