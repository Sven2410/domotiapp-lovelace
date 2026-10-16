/**
 * Ruimtes op het infoscherm: van de afspraken in een agenda naar "vrij" of
 * "bezet tot 14:00", de tijdlijn van vandaag, en wat er nog te boeken valt.
 *
 * Gevraagd op 16 oktober 2026: *"kunnen we iets maken voor een planning van
 * ruimtes. (...) een spreekruimte kleine vergader ruimte etc etc?"* Per ruimte
 * een agenda in Home Assistant (de keuze van de eigenaar). Op het scherm staat
 * alleen vrij of bezet en de tijd: *"Alleen Vrij/Bezet + tijd"*, want in een
 * wachtkamer kijken bezoekers mee. De titel van een afspraak komt dus nergens
 * op het scherm; alleen het beheer toont hem.
 *
 * Zonder DOM, zodat het in een gewone unittest kan (tests/js/ruimtes-logica).
 * De afspraken komen van `calendar/event/subscribe` van Home Assistant; zie
 * `afsprakenUit` voor de vorm.
 */

import { DAGNAMEN, dagSleutel, isoDatum, isoDatumTijd, klok } from "./infoscherm-logica.js";

/** De duren om uit te kiezen op het scherm, in minuten. */
export const DUREN = [30, 60, 90, 120];
/** Begintijden op het scherm gaan per kwartier. */
export const STAP = 15;
/** Zoveel dagen vooruit toont het beheer. */
export const DAGEN_VOORUIT = 14;

const MAANDEN_KORT = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

export const dagBegin = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const plusDagen = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const plusMinuten = (d, m) => new Date(d.getTime() + m * 60000);

/** Zoals de server een tijdstip wil: lokaal, "2026-10-16T14:00". */
export const lokaal = isoDatumTijd;

/**
 * Een datum of tijdstip zoals Home Assistant het stuurt. Een kale datum
 * ("2026-10-17") is een hele dag en hoort LOKAAL om middernacht te beginnen;
 * `new Date("2026-10-17")` zou hem in UTC lezen.
 */
function moment(waarde) {
  if (waarde instanceof Date) return waarde;
  const s = String(waarde ?? "");
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * De afspraken uit een bericht van `calendar/event/subscribe`, op begintijd.
 * Een afspraak van Home Assistant is `{start, end, summary, uid,
 * recurrence_id, all_day, ...}`, met een datum voor een hele dag en een
 * tijdstip met tijdzone voor de rest.
 */
export function afsprakenUit(events) {
  return (events ?? [])
    .map((ev) => {
      const start = moment(ev?.start);
      const eind = moment(ev?.end);
      if (!start || !eind || eind <= start) return null;
      return {
        start,
        eind,
        heleDag: ev.all_day === true || /^\d{4}-\d{2}-\d{2}$/.test(String(ev.start)),
        uid: ev.uid ?? null,
        recurrence_id: ev.recurrence_id ?? null,
        titel: ev.summary ?? "",
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.start - b.start);
}

/**
 * Vrij of bezet op `nu`.
 *
 * Bezet: `tot` is het eind van de HELE bezetting, ook als er aansluitend een
 * volgende boeking begint -- "bezet tot 12:00" en niet "tot 11:00" als om 11:00
 * de volgende begint, want om 11:00 is hij niet vrij. Loopt dat door tot
 * middernacht (of is het een hele dag), dan `restVanDeDag`.
 *
 * Vrij: `tot` is het begin van de volgende boeking VANDAAG, of null.
 */
export function ruimteStatus(afspraken, nu) {
  const lijst = (afspraken ?? []).filter((a) => a.eind > nu);
  const middernacht = plusDagen(dagBegin(nu), 1);
  const bezig = lijst.filter((a) => a.start <= nu);
  if (bezig.length) {
    let tot = new Date(Math.max(...bezig.map((a) => a.eind.getTime())));
    for (let verder = true; verder; ) {
      verder = false;
      for (const a of lijst) {
        if (a.start <= tot && a.eind > tot) {
          tot = a.eind;
          verder = true;
        }
      }
    }
    return { bezet: true, tot, restVanDeDag: tot >= middernacht };
  }
  const volgende = lijst.find((a) => a.start > nu && a.start < middernacht);
  return { bezet: false, tot: volgende ? volgende.start : null, restVanDeDag: !volgende };
}

/** "Bezet tot 14:00", "Bezet, de rest van de dag", "Vrij tot 15:00" of "Vrij". */
export function statusTekst(status) {
  if (status.bezet) return status.restVanDeDag ? "Bezet, de rest van de dag" : `Bezet tot ${klok(status.tot)}`;
  return status.tot ? `Vrij tot ${klok(status.tot)}` : "Vrij";
}

/** "2 van 3 vrij", voor de kop van het blok. */
export function vrijTeller(statussen) {
  const n = statussen.length;
  if (!n) return "";
  const vrij = statussen.filter((s) => !s.bezet).length;
  return n === 1 ? (vrij ? "vrij" : "bezet") : `${vrij} van ${n} vrij`;
}

/* ------------------------------------------------------------ de tijdlijn */

const uurVan = (tekst) => {
  const [u, m] = String(tekst).split(":").map(Number);
  return u + (m || 0) / 60;
};

/**
 * Van welk uur tot welk uur de tijdlijn van een dag loopt. De openingstijden
 * als die er zijn (`tijden` zoals `tijdenOp` ze geeft), anders 8 tot 18 uur.
 * Ruimer als er eerder of later iets geboekt is; een hele dag telt daarbij
 * niet mee, die vult de lijn toch al.
 */
export function dagVenster(afspraken, dag, tijden = []) {
  let van = 8;
  let tot = 18;
  if (tijden?.length) {
    van = Math.floor(Math.min(...tijden.map(([a]) => uurVan(a))));
    tot = Math.ceil(Math.max(...tijden.map(([, b]) => uurVan(b))));
  }
  const begin = dagBegin(dag);
  const eind = plusDagen(begin, 1);
  for (const a of afspraken ?? []) {
    if (a.heleDag || a.eind <= begin || a.start >= eind) continue;
    van = Math.min(van, a.start <= begin ? 0 : a.start.getHours());
    tot = Math.max(tot, a.eind >= eind ? 24 : a.eind.getHours() + (a.eind.getMinutes() > 0 ? 1 : 0));
  }
  return { van, tot: Math.max(tot, van + 1) };
}

/**
 * De boekingen als balken op de tijdlijn, in procenten van links. Wat buiten
 * het venster valt wordt afgeknipt; wat er helemaal buiten valt, is er niet.
 */
export function balken(afspraken, dag, venster) {
  const begin = dagBegin(dag).getTime();
  const a0 = begin + venster.van * 3600000;
  const a1 = begin + venster.tot * 3600000;
  const breed = a1 - a0;
  return (afspraken ?? [])
    .filter((a) => a.start.getTime() < a1 && a.eind.getTime() > a0)
    .map((a) => {
      const s = Math.max(a.start.getTime(), a0);
      const e = Math.min(a.eind.getTime(), a1);
      return {
        links: ((s - a0) / breed) * 100,
        breedte: ((e - s) / breed) * 100,
        tekst: a.heleDag ? "hele dag" : `${klok(a.start)} – ${klok(a.eind)}`,
        afspraak: a,
      };
    });
}

/** Waar `nu` op de tijdlijn staat, in procenten; null als het erbuiten valt. */
export function nuPositie(nu, dag, venster) {
  const begin = dagBegin(dag).getTime();
  const a0 = begin + venster.van * 3600000;
  const a1 = begin + venster.tot * 3600000;
  const t = nu.getTime();
  return t < a0 || t > a1 ? null : ((t - a0) / (a1 - a0)) * 100;
}

/** De uren onder de tijdlijn: elk uur, of om de twee als het er veel zijn. */
export function uurStrepen(venster) {
  const stap = venster.tot - venster.van > 12 ? 2 : 1;
  const uit = [];
  for (let u = venster.van; u <= venster.tot; u += stap) {
    uit.push({ uur: u, links: ((u - venster.van) / (venster.tot - venster.van)) * 100 });
  }
  return uit;
}

/* ------------------------------------------------------------ boeken op het scherm */

/** Is de ruimte vrij van `start` tot `eind`? Aansluiten mag. */
export const isVrij = (afspraken, start, eind) => !(afspraken ?? []).some((a) => a.start < eind && a.eind > start);

/** "30 min", "1 uur", "1,5 uur", "2 uur". */
export function duurLabel(minuten) {
  if (minuten < 60) return `${minuten} min`;
  const uren = minuten / 60;
  return `${String(uren).replace(".", ",")} uur`;
}

/**
 * De begintijden om uit te kiezen: "Nu", en daarna elk kwartier tot
 * middernacht. Vandaag, want het scherm toont vandaag.
 */
export function beginKeuzes(nu) {
  const uit = [{ waarde: "nu", tijd: new Date(Math.floor(nu.getTime() / 60000) * 60000), label: "Nu" }];
  const t = new Date(nu);
  t.setSeconds(0, 0);
  t.setMinutes(t.getMinutes() - (t.getMinutes() % STAP) + STAP);
  const middernacht = plusDagen(dagBegin(nu), 1);
  for (let k = t; k < middernacht; k = plusMinuten(k, STAP)) {
    uit.push({ waarde: lokaal(k), tijd: k, label: klok(k) });
  }
  return uit;
}

/**
 * Per duur of hij past vanaf `start`: niet over een andere boeking heen, en
 * niet over middernacht (het scherm toont één dag).
 */
export function duurKeuzes(afspraken, start, duren = DUREN) {
  const middernacht = plusDagen(dagBegin(start), 1);
  return duren.map((minuten) => {
    const eind = plusMinuten(start, minuten);
    return { minuten, label: duurLabel(minuten), eind, kan: eind <= middernacht && isVrij(afspraken, start, eind) };
  });
}

/**
 * Waar het boekscherm mee opent: de eerste begintijd waarop de kortste duur
 * past (nu, als de ruimte vrij is), en de langste duur die daar dan past, tot
 * een uur. Null als er vandaag niets meer kan.
 */
export function eersteKeuze(afspraken, keuzes, duren = DUREN) {
  const begin = keuzes.find((k) => duurKeuzes(afspraken, k.tijd, [duren[0]])[0].kan);
  if (!begin) return null;
  const passend = duurKeuzes(afspraken, begin.tijd, duren).filter((d) => d.kan && d.minuten <= 60);
  return { begin: begin.waarde, minuten: passend.length ? passend[passend.length - 1].minuten : duren[0] };
}

/* ------------------------------------------------------------ het beheer */

/** "Vandaag", "Morgen", "zaterdag 18 okt". */
export function dagLabel(dag, nu) {
  const iso = isoDatum(dag);
  if (iso === isoDatum(nu)) return "Vandaag";
  if (iso === isoDatum(plusDagen(nu, 1))) return "Morgen";
  return `${DAGNAMEN[dagSleutel(dag)]} ${dag.getDate()} ${MAANDEN_KORT[dag.getMonth()]}`;
}

/**
 * De boekingen van alle ruimtes per dag, voor het beheer. `ruimtes` is
 * `[{entity, naam, afspraken}]`. Wat voorbij is valt weg; een afspraak over
 * meerdere dagen staat op de dag dat hij begint (of vandaag, als hij al loopt).
 */
export function perDag(ruimtes, nu, dagen = DAGEN_VOORUIT) {
  const begin = dagBegin(nu);
  const grens = plusDagen(begin, dagen);
  const groepen = new Map();
  for (const r of ruimtes ?? []) {
    for (const a of r.afspraken ?? []) {
      if (a.eind <= nu || a.start >= grens) continue;
      const dag = a.start < begin ? begin : dagBegin(a.start);
      const sleutel = isoDatum(dag);
      if (!groepen.has(sleutel)) groepen.set(sleutel, { dag, label: dagLabel(dag, nu), boekingen: [] });
      groepen.get(sleutel).boekingen.push({ entity: r.entity, naam: r.naam, afspraak: a });
    }
  }
  return [...groepen.values()]
    .sort((a, b) => a.dag - b.dag)
    .map((g) => ({ ...g, boekingen: g.boekingen.sort((a, b) => a.afspraak.start - b.afspraak.start) }));
}

/** "09:00 – 10:30", of "hele dag". */
export const tijdTekst = (a) => (a.heleDag ? "hele dag" : `${klok(a.start)} – ${klok(a.eind)}`);

/**
 * Wat het beheer in het formulier heeft staan, nagekeken voordat het naar de
 * server gaat. `{datum: "2026-10-17", van: "10:00", tot: "11:30"}` wordt
 * `{start, eind}` in de vorm die de server wil, of `{fout}`.
 */
export function controleerFormulier(form) {
  const { datum, van, tot } = form ?? {};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum ?? "") || !/^\d{2}:\d{2}$/.test(van ?? "") || !/^\d{2}:\d{2}$/.test(tot ?? "")) {
    return { fout: "Vul een datum, een begintijd en een eindtijd in." };
  }
  if (tot <= van) return { fout: "De eindtijd moet na de begintijd liggen." };
  return { start: `${datum}T${van}`, eind: `${datum}T${tot}` };
}

export { klok };
