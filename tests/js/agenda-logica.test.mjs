/**
 * De agendakaart: dagen, tijden, wat een agenda kan, en van het formulier naar een afspraak.
 *
 * NIEUW GEDRAG (8 november 2026, 0.116.0). `agenda-logica.js` bestond niet vóór deze ronde; op de code van ervoor faalt
 * dit bestand bij het importeren. De eigenaar: "Ik wil dat de klant ook zelf een agenda kan aanmaken en evenementen etc
 * kan maken. Of een bestaande toevoegen zoals google of apple".
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  afspraakUit,
  afsprakenVan,
  agendaInfo,
  agendasVan,
  dagenUit,
  dagKop,
  eersteWeekdag,
  formulierVan,
  kalenderBereik,
  kalenderTitel,
  maandRaster,
  nietTeWijzigen,
  opDag,
  watKan,
  verschuif,
  weekBegin,
  weekdagNamen,
  googleAdres,
  kan,
  nieuwFormulier,
  perDag,
  tijdOp,
  wanneerVoluit,
  volgendeUitToestand,
} from "../../src/cards/agenda-logica.js";

// zondag 8 november 2026, 14:30, in Amsterdam (de testmachine kan in een andere zone staan: daarom tz).
const TZ = "Europe/Amsterdam";
const NU = new Date(2026, 10, 8, 14, 30);
const a = (titel, start, eind, extra = {}) => ({ titel, start, eind, heleDag: false, agenda: "calendar.gezin", ...extra });

describe("agendasVan", () => {
  it("eerst de editor, dan wat de klant toevoegde, elk één keer", () => {
    const toegevoegd = [{ entiteiten: ["calendar.werk", "calendar.gezin"] }, { entiteiten: ["calendar.icloud_thuis"] }];
    assert.deepEqual(agendasVan({ agendas: ["calendar.gezin", "sensor.niet"] }, toegevoegd), ["calendar.gezin", "calendar.werk", "calendar.icloud_thuis"]);
    assert.deepEqual(agendasVan({}, undefined), []);
  });
});

describe("agendaInfo", () => {
  it("naam, een eigen kleur per agenda, wat hij kan, en of de klant hem toevoegde", () => {
    const states = { "calendar.gezin": { attributes: { supported_features: 7 } }, "calendar.feestdagen": { attributes: {} } };
    const uit = agendaInfo(states, ["calendar.gezin", "calendar.feestdagen"], [{ entry_id: "e1", entiteiten: ["calendar.gezin"] }], (id) => id.slice(9));
    assert.deepEqual(
      uit.map((x) => [x.naam, x.toon, x.kan.wijzigen, x.toegevoegd?.entry_id ?? null]),
      [
        ["gezin", "house", true, "e1"],
        ["feestdagen", "solar", false, null],
      ]
    );
  });
});

describe("kan", () => {
  it("leest supported_features van Home Assistant", () => {
    assert.deepEqual(kan({ attributes: { supported_features: 7 } }), { maken: true, weghalen: true, wijzigen: true });
    assert.deepEqual(kan({ attributes: { supported_features: 3 } }), { maken: true, weghalen: true, wijzigen: false });
    assert.deepEqual(kan({ attributes: { supported_features: 1 } }), { maken: true, weghalen: false, wijzigen: false });
    assert.deepEqual(kan({ attributes: {} }), { maken: false, weghalen: false, wijzigen: false });
  });
});

describe("dagenUit", () => {
  it("1 tot en met 60, anders 14", () => {
    assert.equal(dagenUit(undefined), 14);
    assert.equal(dagenUit(0), 1);
    assert.equal(dagenUit(99), 60);
    assert.equal(dagenUit("7"), 7);
  });
});

describe("afsprakenVan", () => {
  it("een hele dag op lokale middernacht, een tijdstip in de tijd van Home Assistant", () => {
    const [dag, tijd] = afsprakenVan(
      [
        { start: "2026-11-10", end: "2026-11-11", summary: "Verjaardag Mien" },
        { start: "2026-11-09T08:00:00+00:00", end: "2026-11-09T09:00:00+00:00", summary: "Tandarts", location: "Dorpsstraat 1", uid: "u1" },
        { start: "kapot", end: "2026-11-09T09:00:00+00:00" },
      ],
      TZ,
      "calendar.gezin"
    );
    assert.equal(dag.heleDag, true);
    assert.deepEqual([dag.start.getDate(), dag.start.getHours()], [10, 0]);
    assert.deepEqual([tijd.start.getHours(), tijd.plaats, tijd.uid, tijd.agenda], [9, "Dorpsstraat 1", "u1", "calendar.gezin"]);
  });
});

describe("perDag", () => {
  const lijst = [
    a("Al geweest", new Date(2026, 10, 8, 9), new Date(2026, 10, 8, 10)),
    a("Loopt nog", new Date(2026, 10, 8, 14), new Date(2026, 10, 8, 16)),
    a("Vakantie", new Date(2026, 10, 6), new Date(2026, 10, 10), { heleDag: true }),
    a("Tandarts", new Date(2026, 10, 9, 9), new Date(2026, 10, 9, 10)),
    a("Over drie weken", new Date(2026, 10, 29, 10), new Date(2026, 10, 29, 11)),
  ];

  it("van nu tot zoveel dagen vooruit, wat al begon onder vandaag, een hele dag voorop", () => {
    const dagen = perDag(lijst, NU, 14);
    assert.deepEqual(
      dagen.map((d) => [d.sleutel, d.afspraken.map((x) => x.titel)]),
      [
        ["2026-11-08", ["Vakantie", "Loopt nog"]],
        ["2026-11-09", ["Tandarts"]],
      ]
    );
    assert.deepEqual(perDag(lijst, NU, 30).at(-1).afspraken.map((x) => x.titel), ["Over drie weken"]);
  });

  it("de kop: vandaag, morgen, overmorgen, daarna de datum voluit", () => {
    assert.equal(dagKop(new Date(2026, 10, 8), NU), "Vandaag");
    assert.equal(dagKop(new Date(2026, 10, 9), NU), "Morgen");
    assert.equal(dagKop(new Date(2026, 10, 10), NU), "Overmorgen");
    assert.equal(dagKop(new Date(2026, 10, 19), NU), "Donderdag 19 november");
  });
});

describe("tijdOp en wanneerVoluit", () => {
  const dag = new Date(2026, 10, 9);
  it("hele dag, van tot, tot, of vanaf", () => {
    assert.equal(tijdOp(a("x", new Date(2026, 10, 9), new Date(2026, 10, 10), { heleDag: true }), dag), "hele dag");
    assert.equal(tijdOp(a("x", new Date(2026, 10, 9, 9), new Date(2026, 10, 9, 10, 30)), dag), "09:00 – 10:30");
    assert.equal(tijdOp(a("x", new Date(2026, 10, 8, 22), new Date(2026, 10, 9, 2)), dag), "tot 02:00");
    assert.equal(tijdOp(a("x", new Date(2026, 10, 9, 22), new Date(2026, 10, 10, 2)), dag), "vanaf 22:00");
  });

  it("voluit, ook een hele dag van meer dagen", () => {
    assert.equal(wanneerVoluit(a("x", new Date(2026, 10, 9, 9), new Date(2026, 10, 9, 10))), "Maandag 9 november, 09:00 – 10:00");
    assert.equal(wanneerVoluit(a("x", new Date(2026, 10, 9), new Date(2026, 10, 10), { heleDag: true })), "Maandag 9 november, hele dag");
    assert.equal(wanneerVoluit(a("x", new Date(2026, 10, 9), new Date(2026, 10, 12), { heleDag: true })), "Maandag 9 november – Woensdag 11 november");
  });
});

describe("het formulier", () => {
  it("een nieuw formulier begint op het volgende hele uur, een uur lang", () => {
    const f = nieuwFormulier(NU, "calendar.gezin");
    assert.deepEqual([f.datum, f.van, f.tot, f.agenda, f.heleDag], ["2026-11-08", "15:00", "16:00", "calendar.gezin", false]);
  });

  it("een afspraak met tijden gaat als UTC uit de tijd van Home Assistant, met plaats en omschrijving", () => {
    const f = { ...nieuwFormulier(NU, "calendar.gezin"), titel: "  Tandarts Anna ", datum: "2026-11-20", van: "09:00", tot: "09:30", plaats: "Dorpsstraat 1" };
    assert.deepEqual(afspraakUit(f, TZ), {
      event: { summary: "Tandarts Anna", dtstart: "2026-11-20T08:00:00.000Z", dtend: "2026-11-20T08:30:00.000Z", location: "Dorpsstraat 1" },
    });
  });

  it("een hele dag gaat als datum, met het eind de dag na de laatste", () => {
    const f = { ...nieuwFormulier(NU, "calendar.gezin"), titel: "Vakantie", heleDag: true, datum: "2026-12-24", totDatum: "2026-12-26" };
    assert.deepEqual(afspraakUit(f, TZ).event, { summary: "Vakantie", dtstart: "2026-12-24", dtend: "2026-12-27" });
  });

  it("zegt wat er mist of niet klopt", () => {
    const f = nieuwFormulier(NU, "calendar.gezin");
    assert.deepEqual(afspraakUit({ ...f, titel: " " }, TZ), { fout: "Geef de afspraak een titel.", veld: "titel" });
    assert.equal(afspraakUit({ ...f, titel: "x", agenda: "" }, TZ).veld, "agenda");
    assert.equal(afspraakUit({ ...f, titel: "x", van: "10:00", tot: "09:00" }, TZ).fout, "Het eind ligt voor het begin.");
    assert.equal(afspraakUit({ ...f, titel: "x", heleDag: true, datum: "2026-12-26", totDatum: "2026-12-24" }, TZ).veld, "totDatum");
  });

  it("wijzigen begint met wat er stond, en levert hetzelfde weer op", () => {
    const tandarts = a("Tandarts", new Date(2026, 10, 20, 9), new Date(2026, 10, 20, 9, 30), { plaats: "Dorpsstraat 1" });
    const f = formulierVan(tandarts);
    assert.deepEqual([f.datum, f.van, f.tot, f.plaats], ["2026-11-20", "09:00", "09:30", "Dorpsstraat 1"]);
    const vakantie = formulierVan(a("Vakantie", new Date(2026, 11, 24), new Date(2026, 11, 27), { heleDag: true }));
    assert.deepEqual(afspraakUit(vakantie, TZ).event, { summary: "Vakantie", dtstart: "2026-12-24", dtend: "2026-12-27" });
  });
});

describe("googleAdres", () => {
  it("alleen een iCal-adres van Google Agenda, net als de server", () => {
    const geheim = "https://calendar.google.com/calendar/ical/bram.visser%40gmail.com/private-0123456789abcdef/basic.ics";
    assert.equal(googleAdres(geheim), geheim);
    assert.equal(googleAdres(geheim.replace("https://", "webcal://")), geheim);
    assert.equal(googleAdres("https://calendar.google.com/calendar/embed?src=x"), null);
    assert.equal(googleAdres("http://192.168.1.1/basic.ics"), null);
  });
});

// NIEUW GEDRAG in 0.117.1; faalt op 0.117.0 (volgendeUitToestand bestond niet). De vorm is die van state_attributes in
// homeassistant/components/calendar/__init__.py (2026.8): de tijden in de tijdzone van Home Assistant, zonder zone erbij.
describe("volgendeUitToestand", () => {
  it("leest de eerstvolgende afspraak uit de attributen, als wandtijd", () => {
    const st = { state: "off", attributes: { message: "Kerstborrel", all_day: false, start_time: "2026-12-17 19:00:00", end_time: "2026-12-17 23:00:00", location: "Kantoor", description: "" } };
    const a = volgendeUitToestand(st, "calendar.werk");
    assert.equal(a.titel, "Kerstborrel");
    assert.equal(a.agenda, "calendar.werk");
    assert.equal(a.plaats, "Kantoor");
    assert.equal(a.uid, null);
    assert.equal(a.heleDag, false);
    assert.deepEqual([a.start.getMonth(), a.start.getDate(), a.start.getHours()], [11, 17, 19]);
    assert.equal(a.eind.getHours(), 23);
  });

  it("een hele dag", () => {
    const a = volgendeUitToestand({ attributes: { message: "Pasen", all_day: true, start_time: "2027-03-28 00:00:00", end_time: "2027-03-29 00:00:00" } }, "calendar.x");
    assert.equal(a.heleDag, true);
    assert.equal(a.start.getDate(), 28);
  });

  it("geen afspraak, of iets onleesbaars, is null", () => {
    assert.equal(volgendeUitToestand({ state: "off", attributes: { friendly_name: "Werk" } }, "calendar.x"), null);
    assert.equal(volgendeUitToestand(undefined, "calendar.x"), null);
    assert.equal(volgendeUitToestand({ attributes: { message: "x", start_time: "morgen", end_time: "overmorgen" } }, "calendar.x"), null);
  });
});

// NIEUW GEDRAG in 0.118.0; faalt op 0.117.1 bij het importeren (kalenderBereik en de rest bestonden niet). De eigenaar,
// 9 november 2026: "voor de calendar wil ik een optie hebben om de calender helemaal te laten zien per dag per maand en per
// jaar", en over iCloud: "aanmaken werkt wel trouwens maar wijzigen niet van een bestaande uit apple agenda".
describe("de kalender", () => {
  const iso = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

  it("de eerste dag van de week: uit het profiel, anders uit de taal, anders maandag", () => {
    assert.equal(eersteWeekdag({ first_weekday: "sunday" }, "nl"), 0);
    assert.equal(eersteWeekdag({ first_weekday: "monday" }, "en"), 1);
    assert.equal(eersteWeekdag({ first_weekday: "language", language: "nl" }, "nl"), 1);
    assert.equal(eersteWeekdag(undefined, "nl"), 1);
  });

  it("het maandblad van november 2026: zes weken, van maandag 26 oktober tot en met zondag 6 december", () => {
    const raster = maandRaster(new Date(2026, 10, 9), 1);
    assert.equal(raster.length, 42);
    assert.deepEqual([iso(raster[0]), iso(raster[41])], ["2026-10-26", "2026-12-6"]);
    assert.equal(iso(maandRaster(new Date(2026, 10, 9), 0)[0]), "2026-11-1");
    assert.equal(iso(weekBegin(new Date(2026, 10, 15, 12), 1)), "2026-11-9");
  });

  it("wat er per weergave opgehaald wordt", () => {
    const d = new Date(2026, 10, 9, 14, 30);
    const r = (w) => Object.values(kalenderBereik(w, d, 1)).map(iso);
    assert.deepEqual(r("dag"), ["2026-11-9", "2026-11-10"]);
    assert.deepEqual(r("maand"), ["2026-10-26", "2026-12-7"]);
    assert.deepEqual(r("jaar"), ["2026-1-1", "2027-1-1"]);
  });

  it("verder en terug, zonder over een korte maand heen te schieten", () => {
    assert.equal(iso(verschuif("dag", new Date(2026, 11, 31), 1)), "2027-1-1");
    assert.equal(iso(verschuif("maand", new Date(2027, 0, 31), 1)), "2027-2-28");
    assert.equal(iso(verschuif("maand", new Date(2026, 0, 15), -1)), "2025-12-15");
    assert.equal(iso(verschuif("jaar", new Date(2028, 1, 29), 1)), "2029-2-28");
  });

  it("per dag: wat die dag (deels) beslaat, de hele dag eerst; een hele dag eindigt om middernacht", () => {
    const vakantie = a("Vakantie", new Date(2026, 11, 24), new Date(2026, 11, 27), { heleDag: true });
    const nacht = a("Nachtdienst", new Date(2026, 11, 26, 22), new Date(2026, 11, 27, 6));
    const borrel = a("Borrel", new Date(2026, 11, 26, 17), new Date(2026, 11, 26, 19));
    const lijst = [nacht, borrel, vakantie];
    assert.deepEqual(opDag(lijst, new Date(2026, 11, 26)).map((x) => x.titel), ["Vakantie", "Borrel", "Nachtdienst"]);
    assert.deepEqual(opDag(lijst, new Date(2026, 11, 27)).map((x) => x.titel), ["Nachtdienst"]);
    assert.deepEqual(opDag(lijst, new Date(2026, 11, 23)), []);
  });

  it("de titel en de weekdagen", () => {
    const d = new Date(2026, 10, 9);
    assert.equal(kalenderTitel("jaar", d), "2026");
    assert.equal(kalenderTitel("maand", d), "November 2026");
    assert.equal(kalenderTitel("dag", d), "Maandag 9 november 2026");
    assert.deepEqual(weekdagNamen(1), ["ma", "di", "wo", "do", "vr", "za", "zo"]);
    assert.equal(weekdagNamen(0)[0], "zo");
  });

  it("een nieuwe afspraak op een dag uit de kalender begint om 9 uur; vandaag op het volgende hele uur", () => {
    const f = nieuwFormulier(NU, "calendar.gezin", new Date(2026, 11, 3));
    assert.deepEqual([f.datum, f.van, f.tot], ["2026-12-03", "09:00", "10:00"]);
    assert.equal(nieuwFormulier(NU, "calendar.gezin", new Date(2026, 10, 8)).van, "15:00");
  });
});

describe("nietTeWijzigen en watKan", () => {
  const st = (f) => ({ attributes: { supported_features: f } });
  const states = { "calendar.thuis": st(1), "calendar.werk": st(1), "calendar.gezin": st(7), "calendar.feestdagen": st(0), "calendar.google": st(3) };
  const info = agendaInfo(states, Object.keys(states), [{ soort: "apple", entiteiten: ["calendar.thuis"] }], (id) => id, (id) => (id === "calendar.werk" ? "caldav" : null));
  const [thuis, werk, gezin, feestdagen, google] = info;
  const los = { uid: "abc", herhaalt: false };
  const reeks = { uid: "abc", herhaalt: true, recurrence_id: "20261107T140000Z" };

  it("de herkomst: de soort waarmee de klant hem toevoegde, anders het platform", () => {
    assert.deepEqual(info.map((x) => x.herkomst), ["apple", "caldav", null, null, null]);
  });

  // NIEUW GEDRAG (0.119.0); faalt op 0.118.1 bij het importeren (watKan bestond niet). De eigenaar, 9 november 2026, op de
  // vraag of een afspraak uit iCloud dan niet te verwijderen is: "ja doe maar".
  it("iCloud: wijzigen en verwijderen via onze server, behalve een herhalende afspraak", () => {
    assert.deepEqual(watKan(thuis, los), { wijzigen: true, weghalen: true, serverWijzigen: true, serverWeghalen: true });
    assert.deepEqual(watKan(werk, los), { wijzigen: true, weghalen: true, serverWijzigen: true, serverWeghalen: true });
    assert.deepEqual(watKan(thuis, reeks), { wijzigen: false, weghalen: false, serverWijzigen: false, serverWeghalen: false });
    assert.equal(watKan(thuis, { uid: null }).weghalen, false);
    assert.equal(nietTeWijzigen(thuis, los), null);
    assert.match(nietTeWijzigen(thuis, reeks), /herhalende afspraak uit iCloud .* Agenda-app op je iPhone/);
    assert.match(nietTeWijzigen(werk, reeks), /app van de agenda zelf/);
  });

  it("de rest langs Home Assistant zelf, met wat die kan", () => {
    assert.deepEqual(watKan(gezin, los), { wijzigen: true, weghalen: true, serverWijzigen: false, serverWeghalen: false });
    assert.deepEqual(watKan(google, los), { wijzigen: false, weghalen: true, serverWijzigen: false, serverWeghalen: false });
    assert.deepEqual(watKan(feestdagen, los), { wijzigen: false, weghalen: false, serverWijzigen: false, serverWeghalen: false });
    assert.equal(nietTeWijzigen(gezin, los), null);
    assert.match(nietTeWijzigen(google, los), /afspraken maken, maar niet wijzigen/);
    assert.match(nietTeWijzigen(feestdagen, los), /alleen te lezen/);
  });
});
