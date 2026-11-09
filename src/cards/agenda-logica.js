/**
 * De agendakaart: van de afspraken in Home Assistant naar dagen op de kaart, en van het formulier naar een afspraak.
 *
 * De eigenaar, 8 november 2026: "Ik wil dat de klant ook zelf een agenda kan aanmaken en evenementen etc kan maken. Of een
 * bestaande toevoegen zoals google of apple".
 *
 * Welke agenda's op de kaart staan: die de installateur in de editor koos (`agendas`), plus die de klant zelf via de kaart
 * toevoegde. Dat laatste weet de server (`agenda.py`), want de klant kan het dashboard niet wijzigen.
 *
 * Wat een agenda kan, zegt Home Assistant in `supported_features`: maken (1), weghalen (2) en wijzigen (4). Een Lokale
 * agenda kan alles; een Google-agenda met de volledige koppeling maken en weghalen; iCloud (CalDAV) alleen maken; een
 * externe agenda (het iCal-adres van Google) niets: die is alleen te lezen.
 *
 * Zonder DOM, zodat het in een gewone unittest past (`tests/js/agenda-logica.test.mjs`).
 */

import { daysBetween, relativeDay } from "../ha.js";
import { locale, nt, t } from "../taal.js";
import { vanWand } from "../wandklok.js";
import { isoDatum, klok } from "./infoscherm-logica.js";
import { dagBegin, moment, plusDagen } from "./ruimtes-logica.js";

/** Standaard twee weken vooruit. */
export const DAGEN_STANDAARD = 14;
export const DAGEN_MAX = 60;

/** De bits van `supported_features` van een agenda in Home Assistant (CalendarEntityFeature). */
export const MAKEN = 1;
export const WEGHALEN = 2;
export const WIJZIGEN = 4;

/** Per agenda een eigen kleur, uit de identiteitskleuren (rood en groen zijn voor status). */
export const KLEUREN = ["house", "solar", "teal", "magenta", "pink", "water"];

/** Wat een agenda kan, uit zijn toestand. */
export function kan(st) {
  const f = Number(st?.attributes?.supported_features) || 0;
  return { maken: Boolean(f & MAKEN), weghalen: Boolean(f & WEGHALEN), wijzigen: Boolean(f & WIJZIGEN) };
}

/** De agenda's op de kaart: eerst die uit de editor, dan wat de klant toevoegde, elk één keer. */
export function agendasVan(config, toegevoegd) {
  const lijst = (w) => (Array.isArray(w) ? w : w ? [w] : []).filter((x) => typeof x === "string" && x.startsWith("calendar."));
  const uitServer = (toegevoegd ?? []).flatMap((a) => lijst(a?.entiteiten));
  return [...new Set([...lijst(config?.agendas), ...uitServer])];
}

/**
 * Per agenda wat de kaart en het scherm moeten weten: naam, kleur (een sleutel uit TONES), wat hij kan, of de klant hem
 * via de kaart toevoegde (dan kan hij hem ook weer weghalen), en waar hij vandaan komt (`herkomst`): de soort waarmee de
 * klant hem toevoegde (`nieuw`, `google`, `apple`), anders de integratie van Home Assistant (`caldav`, `google`, ...).
 */
export function agendaInfo(states, ids, toegevoegd, naamVan = (id) => id, platformVan = () => null) {
  return ids.map((id, i) => {
    const via = (toegevoegd ?? []).find((a) => (a?.entiteiten ?? []).includes(id)) ?? null;
    return {
      id,
      naam: naamVan(id),
      toon: KLEUREN[i % KLEUREN.length],
      kan: kan(states?.[id]),
      toegevoegd: via,
      herkomst: via?.soort ?? platformVan(id) ?? null,
    };
  });
}

/**
 * Waarom een afspraak hier niet te wijzigen is, en waar het wel kan; `null` als hij hier te wijzigen is.
 *
 * De eigenaar, 9 november 2026, met een agenda uit iCloud: "aanmaken werkt wel trouwens maar wijzigen niet van een
 * bestaande uit apple agenda". Home Assistant kan in een CalDAV-agenda alleen maken (`supported_features` 1). Dat zeggen
 * we dan ook, met waar het wel kan, in plaats van "alleen te lezen".
 */
export function nietTeWijzigen(info) {
  if (info?.kan?.wijzigen) return null;
  if (info?.herkomst === "apple") return t("Een afspraak in iCloud kan Home Assistant niet wijzigen of verwijderen. Dat doe je in de Agenda-app op je iPhone, iPad of Mac.");
  if (info?.herkomst === "caldav") return t("Een afspraak in deze agenda kan Home Assistant niet wijzigen of verwijderen. Dat doe je in de app van de agenda zelf; bij iCloud is dat de Agenda-app op je iPhone, iPad of Mac.");
  if (info?.kan?.maken) return t("In deze agenda kun je hier wel afspraken maken, maar niet wijzigen. Dat doe je in de app van de agenda zelf.");
  return t("Deze agenda is hier alleen te lezen. Wijzig de afspraak waar hij vandaan komt, zoals in Google Agenda.");
}

/** Een getal van 1 tot en met 60, anders 14. */
export function dagenUit(waarde) {
  const n = Math.round(Number(waarde));
  return waarde !== "" && waarde != null && Number.isFinite(n) ? Math.min(Math.max(1, n), DAGEN_MAX) : DAGEN_STANDAARD;
}

/**
 * De afspraken uit een bericht van `calendar/event/subscribe`, met de agenda erbij. Een tijdstip komt terug als wandtijd in
 * de tijdzone van Home Assistant (zie src/wandklok.js); een hele dag als lokale middernacht.
 */
export function afsprakenVan(events, tz, agenda) {
  return (events ?? [])
    .map((ev) => {
      const start = moment(ev?.start, tz);
      const eind = moment(ev?.end, tz);
      if (!start || !eind || eind <= start) return null;
      return {
        agenda,
        start,
        eind,
        heleDag: ev.all_day === true || /^\d{4}-\d{2}-\d{2}$/.test(String(ev.start)),
        titel: ev.summary ?? "",
        plaats: ev.location ?? "",
        omschrijving: ev.description ?? "",
        uid: ev.uid ?? null,
        recurrence_id: ev.recurrence_id ?? null,
        herhaalt: Boolean(ev.rrule || ev.recurrence_id),
      };
    })
    .filter(Boolean);
}

/**
 * De eerstvolgende afspraak uit de TOESTAND van een agenda, zonder grens in de tijd. Home Assistant zet de lopende of
 * eerstvolgende afspraak in de attributen (`message`, `start_time`, `end_time`, `all_day`, `location`, `description`),
 * met de tijden als "2026-12-17 19:00:00" in zijn eigen tijdzone: dat is al wandtijd. Er staat geen `uid` bij, dus het
 * scherm toont hem zonder Wijzigen en Verwijderen. `null` als er geen is.
 */
export function volgendeUitToestand(st, agenda) {
  const at = st?.attributes;
  if (!at?.start_time || !at?.end_time) return null;
  const wand = (s) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(String(s));
    return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] ?? 0)) : null;
  };
  const start = wand(at.start_time);
  const eind = wand(at.end_time);
  if (!start || !eind || eind <= start) return null;
  return {
    agenda,
    start,
    eind,
    heleDag: at.all_day === true,
    titel: at.message ?? "",
    plaats: at.location ?? "",
    omschrijving: at.description ?? "",
    uid: null,
    recurrence_id: null,
    herhaalt: false,
  };
}

const hoofdletter = (s) => (s ? s[0].toLocaleUpperCase(locale()) + s.slice(1) : s);

/** "Vandaag", "Morgen", "Overmorgen", en verder "Donderdag 19 november". */
export function dagKop(dag, nu) {
  if (daysBetween(nu, dag) <= 2) return hoofdletter(relativeDay(dag, nu));
  return hoofdletter(dag.toLocaleDateString(locale(), { weekday: "long", day: "numeric", month: "long" }));
}

/**
 * De afspraken per dag, van nu tot `dagen` dagen vooruit. Wat al begonnen is, staat onder vandaag; elke afspraak één
 * keer, op de dag waarop hij (voor ons) begint. Een hele dag gaat voor, daarna op begintijd.
 * @returns {Array<{dag: Date, sleutel: string, afspraken: Array}>}
 */
export function perDag(afspraken, nu, dagen = DAGEN_STANDAARD) {
  const vandaag = dagBegin(nu);
  const tot = plusDagen(vandaag, dagen);
  const dagenMap = new Map();
  for (const a of afspraken ?? []) {
    if (!(a.eind > nu) || !(a.start < tot)) continue;
    const dag = a.start < vandaag ? vandaag : dagBegin(a.start);
    const sleutel = isoDatum(dag);
    if (!dagenMap.has(sleutel)) dagenMap.set(sleutel, { dag, sleutel, afspraken: [] });
    dagenMap.get(sleutel).afspraken.push(a);
  }
  const uit = [...dagenMap.values()].sort((a, b) => a.dag - b.dag);
  for (const d of uit) {
    d.afspraken.sort((a, b) => Number(b.heleDag) - Number(a.heleDag) || a.start - b.start || a.titel.localeCompare(b.titel));
  }
  return uit;
}

/** De tijd op een dag: "hele dag", "09:00 – 10:00", of "tot 10:00" als hij eerder begon. */
export function tijdOp(a, dag) {
  if (a.heleDag) return t("hele dag");
  const eindVandaag = plusDagen(dag, 1);
  if (a.start < dag) return a.eind < eindVandaag ? t("tot {tijd}", { tijd: klok(a.eind) }) : t("hele dag");
  return a.eind <= eindVandaag ? `${klok(a.start)} – ${klok(a.eind)}` : t("vanaf {tijd}", { tijd: klok(a.start) });
}

/** Wanneer, voluit, voor het scherm met één afspraak: "Donderdag 19 november, 09:00 – 10:00". */
export function wanneerVoluit(a) {
  const datum = (d) => hoofdletter(d.toLocaleDateString(locale(), { weekday: "long", day: "numeric", month: "long" }));
  if (a.heleDag) {
    const laatste = plusDagen(a.eind, -1);
    return laatste > a.start ? `${datum(a.start)} – ${datum(laatste)}` : `${datum(a.start)}, ${t("hele dag")}`;
  }
  return isoDatum(a.start) === isoDatum(a.eind)
    ? `${datum(a.start)}, ${klok(a.start)} – ${klok(a.eind)}`
    : `${datum(a.start)} ${klok(a.start)} – ${datum(a.eind)} ${klok(a.eind)}`;
}

/* ----------------------------------------------------------------- de kalender */

/*
 * De agenda helemaal, per dag, per maand en per jaar. De eigenaar, 9 november 2026: "voor de calendar wil ik een optie
 * hebben om de calender helemaal te laten zien per dag per maand en per jaar". Alle datums hier zijn wandtijd (de klok van
 * Home Assistant, zie src/wandklok.js).
 */

export const WEERGAVEN = ["dag", "maand", "jaar"];

/** De eerste dag van de week: 1 is maandag, 0 zondag. Uit het profiel van Home Assistant, anders uit de taal. */
export function eersteWeekdag(hassLocale, taal) {
  const namen = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const gekozen = namen.indexOf(hassLocale?.first_weekday);
  if (gekozen >= 0) return gekozen;
  try {
    const l = new Intl.Locale(hassLocale?.language || taal || "nl");
    const info = typeof l.getWeekInfo === "function" ? l.getWeekInfo() : l.weekInfo;
    if (info?.firstDay) return info.firstDay % 7;
  } catch {
    /* een onbekende taal: maandag */
  }
  return 1;
}

/** Het begin van de week waarin `d` valt. */
export function weekBegin(d, eerste = 1) {
  const dag = dagBegin(d);
  return plusDagen(dag, -((dag.getDay() - eerste + 7) % 7));
}

/** De 42 dagen (zes weken) van het maandblad waarin `d` valt, van de eerste dag van de eerste week. */
export function maandRaster(d, eerste = 1) {
  const begin = weekBegin(new Date(d.getFullYear(), d.getMonth(), 1), eerste);
  return Array.from({ length: 42 }, (_, i) => plusDagen(begin, i));
}

/** Wat er voor een weergave opgehaald moet worden: van `van` tot `tot` (niet erbij). */
export function kalenderBereik(weergave, d, eerste = 1) {
  if (weergave === "dag") return { van: dagBegin(d), tot: plusDagen(dagBegin(d), 1) };
  if (weergave === "jaar") return { van: new Date(d.getFullYear(), 0, 1), tot: new Date(d.getFullYear() + 1, 0, 1) };
  const raster = maandRaster(d, eerste);
  return { van: raster[0], tot: plusDagen(raster[41], 1) };
}

/** Een dag, een maand of een jaar verder (of terug). 31 januari plus een maand is 28 februari, niet 3 maart. */
export function verschuif(weergave, d, stap) {
  if (weergave === "dag") return plusDagen(dagBegin(d), stap);
  const jaar = d.getFullYear() + (weergave === "jaar" ? stap : 0);
  const maand = d.getMonth() + (weergave === "maand" ? stap : 0);
  const laatste = new Date(jaar, maand + 1, 0).getDate();
  return new Date(jaar, maand, Math.min(d.getDate(), laatste));
}

/** De afspraken die (een deel van) deze dag beslaan: een hele dag eerst, dan op begintijd. */
export function opDag(afspraken, dag) {
  const van = dagBegin(dag);
  const tot = plusDagen(van, 1);
  return (afspraken ?? [])
    .filter((a) => a.start < tot && a.eind > van)
    .sort((a, b) => Number(b.heleDag) - Number(a.heleDag) || a.start - b.start || String(a.titel).localeCompare(String(b.titel)));
}

/** "Maandag 9 november 2026", "November 2026" of "2026". */
export function kalenderTitel(weergave, d) {
  if (weergave === "jaar") return String(d.getFullYear());
  if (weergave === "maand") return hoofdletter(d.toLocaleDateString(locale(), { month: "long", year: "numeric" }));
  return hoofdletter(d.toLocaleDateString(locale(), { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
}

/** De korte namen van de weekdagen, vanaf de eerste: "ma", "di", ... 1 november 2026 is een zondag. */
export function weekdagNamen(eerste = 1, vorm = "short") {
  return Array.from({ length: 7 }, (_, i) => new Date(2026, 10, 1 + ((eerste + i) % 7)).toLocaleDateString(locale(), { weekday: vorm }));
}

/* ----------------------------------------------------------------- het formulier */

const tijd = (s) => /^\d{2}:\d{2}$/.test(String(s ?? ""));
const datum = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s ?? ""));
const opDatum = (s) => {
  const [j, m, d] = s.split("-").map(Number);
  return new Date(j, m - 1, d);
};
const metTijd = (d, hhmm) => {
  const [u, m] = hhmm.split(":").map(Number);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), u, m);
};

/**
 * Een nieuw formulier: vandaag, het volgende hele uur, een uur lang, in de eerste agenda die het kan. Met een andere `dag`
 * (gekozen in de kalender) om 9 uur op die dag.
 */
export function nieuwFormulier(nu, agenda, dag = null) {
  const andereDag = dag && isoDatum(dag) !== isoDatum(nu);
  const begin = andereDag ? new Date(dag.getFullYear(), dag.getMonth(), dag.getDate(), 9) : new Date(nu.getFullYear(), nu.getMonth(), nu.getDate(), nu.getHours() + 1);
  const eind = new Date(begin.getTime() + 3600000);
  return {
    titel: "",
    agenda: agenda ?? "",
    heleDag: false,
    datum: isoDatum(begin),
    totDatum: isoDatum(begin),
    van: klok(begin),
    tot: isoDatum(eind) === isoDatum(begin) ? klok(eind) : "23:59",
    plaats: "",
    omschrijving: "",
  };
}

/** Een formulier om deze afspraak te wijzigen. */
export function formulierVan(a) {
  return {
    titel: a.titel,
    agenda: a.agenda,
    heleDag: a.heleDag,
    datum: isoDatum(a.start),
    totDatum: isoDatum(a.heleDag ? plusDagen(a.eind, -1) : a.start),
    van: a.heleDag ? "09:00" : klok(a.start),
    tot: a.heleDag ? "10:00" : klok(a.eind),
    plaats: a.plaats ?? "",
    omschrijving: a.omschrijving ?? "",
  };
}

/** Een veld dat niet leeg mag zijn, zoals de kaart hem toont: een vertaalde zin, of null. */
export const MELDINGEN = {
  titel: nt("Geef de afspraak een titel."),
  agenda: nt("Kies een agenda."),
  datum: nt("Kies een datum."),
  tijd: nt("Kies een begin- en eindtijd."),
  volgorde: nt("Het eind ligt voor het begin."),
};

/**
 * Van het formulier naar wat `calendar/event/create` en `update` willen, of een fout.
 *
 * Een hele dag gaat als datum, met het eind de dag ná de laatste (zo telt Home Assistant). Een tijdstip gaat als UTC: het
 * is wandtijd in de tijdzone van Home Assistant (`tz`), niet die van het toestel.
 * @returns {{event: object} | {fout: string, veld: string}}
 */
export function afspraakUit(f, tz) {
  const titel = String(f?.titel ?? "").trim();
  if (!titel) return { fout: t(MELDINGEN.titel), veld: "titel" };
  if (!f.agenda) return { fout: t(MELDINGEN.agenda), veld: "agenda" };
  if (!datum(f.datum)) return { fout: t(MELDINGEN.datum), veld: "datum" };
  const event = { summary: titel };
  if (f.heleDag) {
    const eerste = opDatum(f.datum);
    const laatste = datum(f.totDatum) ? opDatum(f.totDatum) : eerste;
    if (laatste < eerste) return { fout: t(MELDINGEN.volgorde), veld: "totDatum" };
    event.dtstart = isoDatum(eerste);
    event.dtend = isoDatum(plusDagen(laatste, 1));
  } else {
    if (!tijd(f.van) || !tijd(f.tot)) return { fout: t(MELDINGEN.tijd), veld: tijd(f.van) ? "tot" : "van" };
    const dag = opDatum(f.datum);
    const begin = metTijd(dag, f.van);
    const eind = metTijd(dag, f.tot);
    if (eind <= begin) return { fout: t(MELDINGEN.volgorde), veld: "tot" };
    event.dtstart = vanWand(begin, tz).toISOString();
    event.dtend = vanWand(eind, tz).toISOString();
  }
  const plaats = String(f.plaats ?? "").trim();
  const omschrijving = String(f.omschrijving ?? "").trim();
  if (plaats) event.location = plaats;
  if (omschrijving) event.description = omschrijving;
  return { event };
}

/**
 * Het iCal-adres van Google Agenda, net als de server het toetst (`google_adres` in agenda.py): alleen
 * calendar.google.com, het geheime adres of een openbare agenda. `webcal://` mag ook.
 */
export function googleAdres(rauw) {
  if (typeof rauw !== "string") return null;
  let adres = rauw.trim();
  if (adres.startsWith("webcal://")) adres = `https://${adres.slice("webcal://".length)}`;
  return /^https:\/\/calendar\.google\.com\/calendar\/ical\/[^/\s?#]+\/(?:private-[0-9a-f]+|public)\/basic\.ics$/.test(adres) ? adres : null;
}
