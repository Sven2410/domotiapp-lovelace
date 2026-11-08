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
  formulierVan,
  googleAdres,
  kan,
  nieuwFormulier,
  perDag,
  tijdOp,
  wanneerVoluit,
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
