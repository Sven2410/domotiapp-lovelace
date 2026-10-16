/**
 * Boeken op een andere dag dan vandaag, op het scherm. **NIEUW GEDRAG**
 * (16 oktober 2026, 0.77.0), op de twee REGRESSIEWACHTEN na (zie daar).
 *
 * Gevraagd: *"ik wil ook dat je een datum kan kiezen om te boeken nu is het
 * alleen vandaag op de ipad"*. Tot deze ronde kende het boekscherm alleen de
 * kwartieren van vandaag, vanaf nu.
 *
 * Met `import * as R` en niet met losse namen: op de oude code bestaan de
 * meeste functies niet, en dan valt zo elke toets apart om in plaats van het
 * hele bestand op de import.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as R from "../../src/cards/ruimtes-logica.js";

/** 16 oktober 2026 is een vrijdag; `om(u, m, dag)` is lokaal. */
const om = (u, m = 0, dag = 16) => new Date(2026, 9, dag, u, m);
const afspraak = (van, tot, extra = {}) => ({ start: van, eind: tot, heleDag: false, uid: "x", recurrence_id: null, titel: "", ...extra });

describe("de dagen om uit te kiezen", () => {
  it("vandaag en de dertien dagen erna, even ver als het beheer toont", () => {
    const dagen = R.boekDagen(om(15, 7));
    assert.equal(dagen.length, 14);
    assert.equal(dagen.length, R.DAGEN_VOORUIT);
    assert.deepEqual(
      dagen.slice(0, 4).map((d) => [d.waarde, d.label]),
      [
        ["2026-10-16", "Vandaag"],
        ["2026-10-17", "Morgen"],
        ["2026-10-18", "zondag 18 okt"],
        ["2026-10-19", "maandag 19 okt"],
      ]
    );
    assert.equal(dagen.at(-1).waarde, "2026-10-29");
  });

  it("over de maandgrens heen", () => {
    assert.equal(R.boekDagen(om(9, 0, 30)).at(2).waarde, "2026-11-01");
  });
});

describe("de begintijden op een andere dag", () => {
  it("elk kwartier van de hele dag, zonder Nu", () => {
    const k = R.beginKeuzes(om(15, 7), om(0, 0, 17));
    assert.equal(k.length, 96);
    assert.deepEqual(k.slice(0, 3).map((x) => x.label), ["00:00", "00:15", "00:30"]);
    assert.equal(k[36].waarde, "2026-10-17T09:00");
    assert.equal(k.at(-1).label, "23:45");
    assert.ok(!k.some((x) => x.waarde === "nu"));
  });

  it("de nacht dat de klok een uur terug gaat (25 oktober): geen dubbele tijd", () => {
    const k = R.beginKeuzes(om(10), om(0, 0, 25));
    assert.equal(new Set(k.map((x) => x.waarde)).size, k.length);
    for (let i = 1; i < k.length; i++) assert.ok(k[i].label > k[i - 1].label, `${k[i - 1].label} ${k[i].label}`);
  });

  it("REGRESSIEWACHT: vandaag blijft het Nu en dan elk kwartier", () => {
    assert.deepEqual(R.beginKeuzes(om(22, 7), om(0)).map((x) => x.label), ["Nu", "22:15", "22:30", "22:45", "23:00", "23:15", "23:30", "23:45"]);
  });
});

describe("waar het boekscherm op een andere dag begint", () => {
  it("de opening van die dag, anders 8 uur", () => {
    assert.equal(R.openingVan(om(0, 0, 17), [["13:00", "17:00"], ["08:30", "12:00"]]).getTime(), om(8, 30, 17).getTime());
    assert.equal(R.openingVan(om(0, 0, 18), []).getTime(), om(8, 0, 18).getTime());
  });

  it("eersteKeuze met vanaf: vanaf de opening, en een uur", () => {
    const keuzes = R.beginKeuzes(om(15, 7), om(0, 0, 17));
    assert.deepEqual(R.eersteKeuze([], keuzes, { vanaf: om(8, 30, 17) }), { begin: "2026-10-17T08:30", minuten: 60 });
    // Om half negen is er al iets: het eerste kwartier erna.
    const lijst = [afspraak(om(8, 0, 17), om(10, 0, 17))];
    assert.deepEqual(R.eersteKeuze(lijst, keuzes, { vanaf: om(8, 30, 17) }), { begin: "2026-10-17T10:00", minuten: 60 });
  });

  it("dezelfde tijd als die vrij is, met dezelfde duur", () => {
    const keuzes = R.beginKeuzes(om(10), om(0, 0, 17));
    assert.deepEqual(R.keuzeOpDag([], keuzes, { vorige: om(14), minuten: 90, vanaf: om(8, 0, 17) }), {
      begin: "2026-10-17T14:00",
      minuten: 90,
    });
  });

  it("is die tijd bezet, dan het eerste kwartier erna, en niet de opening", () => {
    const keuzes = R.beginKeuzes(om(10), om(0, 0, 17));
    const lijst = [afspraak(om(13, 30, 17), om(15, 0, 17))];
    assert.deepEqual(R.keuzeOpDag(lijst, keuzes, { vorige: om(14), minuten: 60, vanaf: om(8, 0, 17) }), {
      begin: "2026-10-17T15:00",
      minuten: 60,
    });
  });

  it("vanaf Nu naar morgen: de opening", () => {
    const keuzes = R.beginKeuzes(om(10), om(0, 0, 17));
    assert.equal(R.keuzeOpDag([], keuzes, { vorige: null, minuten: 60, vanaf: om(8, 30, 17) }).begin, "2026-10-17T08:30");
  });

  it("terug naar vandaag terwijl die tijd al voorbij is: Nu", () => {
    const keuzes = R.beginKeuzes(om(15, 7));
    assert.equal(R.keuzeOpDag([], keuzes, { vorige: om(10, 0, 17), minuten: 60 }).begin, "nu");
  });

  it("de hele dag bezet: de opening zonder duur", () => {
    const keuzes = R.beginKeuzes(om(10), om(0, 0, 17));
    const lijst = [afspraak(om(0, 0, 17), om(0, 0, 18), { heleDag: true })];
    assert.deepEqual(R.keuzeOpDag(lijst, keuzes, { vorige: om(14), minuten: 60, vanaf: om(8, 0, 17) }), {
      begin: "2026-10-17T08:00",
      minuten: null,
    });
  });
});

describe("wat het boekscherm over een andere dag zegt", () => {
  it("niets geboekt", () => {
    assert.equal(R.dagBezet([], om(0, 0, 17), om(10)), "Morgen is nog niets geboekt.");
    assert.equal(R.dagBezet([], om(0, 0, 20), om(10)), "Dinsdag 20 okt is nog niets geboekt.");
  });

  it("alleen de tijden van die dag, geen titels", () => {
    const lijst = [
      afspraak(om(10), om(11), { titel: "Vandaag" }),
      afspraak(om(10, 0, 17), om(11, 0, 17), { titel: "Gesprek met Bram Visser" }),
      afspraak(om(14, 0, 17), om(15, 30, 17)),
    ];
    const tekst = R.dagBezet(lijst, om(0, 0, 17), om(10));
    assert.equal(tekst, "Morgen al geboekt: 10:00 – 11:00, 14:00 – 15:30");
    assert.ok(!tekst.includes("Bram"));
  });

  it("een hele dag, en een boeking die over middernacht loopt", () => {
    assert.equal(R.dagBezet([afspraak(om(0, 0, 17), om(0, 0, 18), { heleDag: true })], om(0, 0, 17), om(10)), "Morgen al geboekt: de hele dag");
    assert.equal(R.dagBezet([afspraak(om(22, 0, 16), om(2, 0, 17))], om(0, 0, 17), om(10)), "Morgen al geboekt: 00:00 – 02:00");
  });

  it("na het boeken: de dag erbij als het niet vandaag is", () => {
    assert.equal(R.geboektTekst(om(10), om(11), om(9)), "van 10:00 tot 11:00");
    assert.equal(R.geboektTekst(om(10, 0, 17), om(11, 0, 17), om(9)), "morgen van 10:00 tot 11:00");
    assert.equal(R.geboektTekst(om(10, 0, 20), om(11, 0, 20), om(9)), "dinsdag 20 okt van 10:00 tot 11:00");
  });
});

/**
 * REGRESSIEWACHT: welke duur er overblijft na een stap Eerder of Later. Dat
 * stond tot deze ronde in de kaart zelf (`boekActie_`) en is verhuisd, omdat
 * een andere dag kiezen dezelfde regel nodig heeft. Op de oude code faalt
 * hij alleen omdat de functie daar nog niet los bestond.
 */
describe("REGRESSIEWACHT: de duur bij een andere begintijd", () => {
  it("de gekozen duur blijft als hij past", () => {
    assert.equal(R.passendeDuur([], om(10), 120), 120);
  });

  it("past hij niet, dan de langste tot een uur", () => {
    assert.equal(R.passendeDuur([afspraak(om(11, 30), om(12))], om(10), 120), 60);
    assert.equal(R.passendeDuur([afspraak(om(10, 30), om(12))], om(10), 120), 30);
  });

  it("past er niets, dan null", () => {
    assert.equal(R.passendeDuur([afspraak(om(10), om(12))], om(10), 60), null);
  });
});
