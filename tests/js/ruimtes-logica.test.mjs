/**
 * Ruimtes op het infoscherm: vrij of bezet, de tijdlijn en wat er te boeken
 * valt. Alles **NIEUW GEDRAG** (16 oktober 2026): het bestand
 * `src/cards/ruimtes-logica.js` bestond vóór deze ronde niet.
 *
 * Gevraagd op 16 oktober 2026: *"kunnen we iets maken voor een planning van
 * ruimtes"*, met per ruimte een agenda in Home Assistant, en op het scherm
 * *"Alleen Vrij/Bezet + tijd"*.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  afsprakenUit,
  balken,
  beginKeuzes,
  controleerFormulier,
  dagLabel,
  dagVenster,
  duurKeuzes,
  duurLabel,
  eersteKeuze,
  isVrij,
  lokaal,
  nuPositie,
  perDag,
  ruimteStatus,
  statusTekst,
  tijdTekst,
  uurStrepen,
  vrijTeller,
} from "../../src/cards/ruimtes-logica.js";

/** Vandaag (16 oktober 2026, een vrijdag) om dit uur, lokaal. */
const om = (u, m = 0, dag = 16) => new Date(2026, 9, dag, u, m);
const afspraak = (van, tot, extra = {}) => ({ start: van, eind: tot, heleDag: false, uid: "x", recurrence_id: null, titel: "", ...extra });

describe("afsprakenUit: wat Home Assistant stuurt", () => {
  it("leest tijdstippen met een zone, en sorteert op begin", () => {
    const lijst = afsprakenUit([
      { start: "2026-10-16T14:00:00+02:00", end: "2026-10-16T15:00:00+02:00", summary: "Later", uid: "b", all_day: false },
      { start: "2026-10-16T09:00:00+02:00", end: "2026-10-16T10:30:00+02:00", summary: "Eerst", uid: "a", all_day: false },
    ]);
    assert.deepEqual(lijst.map((a) => a.uid), ["a", "b"]);
    assert.equal(lijst[0].start.getTime(), Date.UTC(2026, 9, 16, 7, 0));
    assert.equal(lijst[0].titel, "Eerst");
    assert.equal(lijst[0].heleDag, false);
  });

  it("een hele dag begint LOKAAL om middernacht, niet in UTC", () => {
    const [a] = afsprakenUit([{ start: "2026-10-17", end: "2026-10-18", summary: "Schilder", all_day: true }]);
    assert.equal(a.start.getTime(), new Date(2026, 9, 17).getTime());
    assert.equal(a.eind.getTime(), new Date(2026, 9, 18).getTime());
    assert.equal(a.heleDag, true);
  });

  it("laat weg wat niet te lezen is of geen duur heeft", () => {
    assert.deepEqual(afsprakenUit([{ start: "onzin", end: "2026-10-16T10:00:00+02:00" }]), []);
    assert.deepEqual(afsprakenUit([{ start: "2026-10-16T10:00:00+02:00", end: "2026-10-16T10:00:00+02:00" }]), []);
    assert.deepEqual(afsprakenUit(null), []);
  });

  it("houdt uid en recurrence_id vast, die zijn nodig om vrij te geven", () => {
    const [a] = afsprakenUit([
      { start: "2026-10-16T09:00:00+02:00", end: "2026-10-16T10:00:00+02:00", uid: "u1", recurrence_id: "20261016T090000" },
    ]);
    assert.equal(a.uid, "u1");
    assert.equal(a.recurrence_id, "20261016T090000");
  });
});

describe("ruimteStatus en statusTekst", () => {
  it("vrij zonder boekingen", () => {
    const s = ruimteStatus([], om(10));
    assert.equal(s.bezet, false);
    assert.equal(statusTekst(s), "Vrij");
  });

  it("vrij tot de volgende boeking van vandaag", () => {
    const s = ruimteStatus([afspraak(om(14), om(15))], om(10));
    assert.equal(statusTekst(s), "Vrij tot 14:00");
  });

  it("een boeking van morgen maakt vandaag niet korter", () => {
    assert.equal(statusTekst(ruimteStatus([afspraak(om(9, 0, 17), om(10, 0, 17))], om(10))), "Vrij");
  });

  it("bezet tot het eind van de boeking", () => {
    const s = ruimteStatus([afspraak(om(9), om(10, 30))], om(10));
    assert.equal(s.bezet, true);
    assert.equal(statusTekst(s), "Bezet tot 10:30");
  });

  it("aansluitende en overlappende boekingen tellen samen: bezet tot het eind van de laatste", () => {
    const lijst = [afspraak(om(9), om(11)), afspraak(om(11), om(12)), afspraak(om(11, 30), om(12, 45)), afspraak(om(14), om(15))];
    assert.equal(statusTekst(ruimteStatus(lijst, om(10))), "Bezet tot 12:45");
  });

  it("op het eindmoment is hij weer vrij", () => {
    assert.equal(statusTekst(ruimteStatus([afspraak(om(9), om(10))], om(10))), "Vrij");
  });

  it("een hele dag, of bezet tot na middernacht: de rest van de dag", () => {
    const dag = afspraak(new Date(2026, 9, 16), new Date(2026, 9, 17), { heleDag: true });
    assert.equal(statusTekst(ruimteStatus([dag], om(10))), "Bezet, de rest van de dag");
    assert.equal(statusTekst(ruimteStatus([afspraak(om(20), om(2, 0, 17))], om(21))), "Bezet, de rest van de dag");
  });

  it("vrijTeller voor de kop van het blok", () => {
    assert.equal(vrijTeller([{ bezet: false }, { bezet: true }, { bezet: false }]), "2 van 3 vrij");
    assert.equal(vrijTeller([{ bezet: true }]), "bezet");
    assert.equal(vrijTeller([{ bezet: false }]), "vrij");
    assert.equal(vrijTeller([]), "");
  });
});

describe("de tijdlijn", () => {
  it("standaard van 8 tot 18, of de openingstijden", () => {
    assert.deepEqual(dagVenster([], om(10)), { van: 8, tot: 18 });
    assert.deepEqual(dagVenster([], om(10), [["08:30", "12:00"], ["13:00", "17:15"]]), { van: 8, tot: 18 });
    assert.deepEqual(dagVenster([], om(10), [["09:00", "17:00"]]), { van: 9, tot: 17 });
  });

  it("ruimer als er eerder of later geboekt is; een hele dag telt niet mee", () => {
    const lijst = [afspraak(om(7, 30), om(8, 30)), afspraak(om(18), om(19, 15))];
    assert.deepEqual(dagVenster(lijst, om(10)), { van: 7, tot: 20 });
    const dag = afspraak(new Date(2026, 9, 16), new Date(2026, 9, 17), { heleDag: true });
    assert.deepEqual(dagVenster([dag], om(10)), { van: 8, tot: 18 });
  });

  it("balken in procenten, afgeknipt aan de randen", () => {
    const venster = { van: 8, tot: 18 };
    const [a, b] = balken([afspraak(om(9), om(10)), afspraak(om(17), om(19))], om(10), venster);
    assert.equal(a.links, 10);
    assert.equal(a.breedte, 10);
    assert.equal(a.tekst, "09:00 – 10:00");
    assert.equal(b.links, 90);
    assert.equal(b.breedte, 10);
    assert.equal(balken([afspraak(om(6), om(7))], om(10), venster).length, 0);
  });

  it("de nu-lijn, en niets als nu buiten het venster valt", () => {
    assert.equal(nuPositie(om(13), om(10), { van: 8, tot: 18 }), 50);
    assert.equal(nuPositie(om(7), om(10), { van: 8, tot: 18 }), null);
  });

  it("uurstrepen per uur, of per twee als het een lange dag is", () => {
    assert.equal(uurStrepen({ van: 8, tot: 18 }).length, 11);
    assert.deepEqual(uurStrepen({ van: 0, tot: 24 }).map((s) => s.uur).slice(0, 3), [0, 2, 4]);
  });
});

describe("boeken op het scherm", () => {
  it("de begintijden: Nu, en dan elk kwartier tot middernacht", () => {
    const k = beginKeuzes(om(22, 7));
    assert.deepEqual(k.map((x) => x.label), ["Nu", "22:15", "22:30", "22:45", "23:00", "23:15", "23:30", "23:45"]);
    assert.equal(k[1].waarde, "2026-10-16T22:15");
    // Precies op een kwartier: het volgende kwartier, want "Nu" is dit moment al.
    assert.equal(beginKeuzes(om(10, 15))[1].label, "10:30");
  });

  it("een duur past niet over een andere boeking heen, en niet over middernacht", () => {
    const lijst = [afspraak(om(11), om(12))];
    const d = duurKeuzes(lijst, om(10));
    assert.deepEqual(d.map((x) => [x.minuten, x.kan]), [[30, true], [60, true], [90, false], [120, false]]);
    assert.deepEqual(duurKeuzes([], om(23)).map((x) => x.kan), [true, true, false, false]);
  });

  it("aansluiten mag", () => {
    assert.equal(isVrij([afspraak(om(10), om(11))], om(11), om(12)), true);
    assert.equal(isVrij([afspraak(om(10), om(11))], om(10, 59), om(12)), false);
  });

  it("het boekscherm opent op Nu met een uur als dat past", () => {
    const keuzes = beginKeuzes(om(10, 2));
    assert.deepEqual(eersteKeuze([], keuzes), { begin: "nu", minuten: 60 });
    // Over 45 minuten is er iets: dan een half uur.
    assert.deepEqual(eersteKeuze([afspraak(om(10, 47), om(12))], keuzes), { begin: "nu", minuten: 30 });
  });

  it("is hij nu bezet, dan het eerste kwartier waarop het kan", () => {
    const keuzes = beginKeuzes(om(10, 2));
    assert.deepEqual(eersteKeuze([afspraak(om(9), om(11, 20))], keuzes), { begin: "2026-10-16T11:30", minuten: 60 });
  });

  it("niets meer vandaag: null", () => {
    assert.equal(eersteKeuze([afspraak(om(23), om(0, 0, 17))], beginKeuzes(om(22, 50))), null);
  });

  it("duurLabel", () => {
    assert.deepEqual([30, 60, 90, 120].map(duurLabel), ["30 min", "1 uur", "1,5 uur", "2 uur"]);
  });

  it("lokaal is de vorm die de server wil, zonder zone", () => {
    assert.equal(lokaal(om(9, 5)), "2026-10-16T09:05");
  });
});

describe("het beheer", () => {
  it("dagLabel", () => {
    assert.equal(dagLabel(om(0), om(10)), "Vandaag");
    assert.equal(dagLabel(om(0, 0, 17), om(10)), "Morgen");
    assert.equal(dagLabel(om(0, 0, 20), om(10)), "dinsdag 20 okt");
  });

  it("perDag: per dag, op tijd, zonder wat voorbij is en zonder wat te ver weg is", () => {
    const ruimtes = [
      { entity: "calendar.a", naam: "Spreekruimte", afspraken: [afspraak(om(8), om(9)), afspraak(om(14), om(15)), afspraak(om(9, 0, 17), om(10, 0, 17))] },
      { entity: "calendar.b", naam: "Vergaderruimte", afspraken: [afspraak(om(11), om(12)), afspraak(om(9, 0, 30), om(10, 0, 30))] },
    ];
    const dagen = perDag(ruimtes, om(10));
    assert.deepEqual(dagen.map((d) => d.label), ["Vandaag", "Morgen"]);
    assert.deepEqual(dagen[0].boekingen.map((b) => [b.naam, tijdTekst(b.afspraak)]), [
      ["Vergaderruimte", "11:00 – 12:00"],
      ["Spreekruimte", "14:00 – 15:00"],
    ]);
  });

  it("een boeking die al loopt staat bij vandaag", () => {
    const dagen = perDag([{ entity: "calendar.a", naam: "A", afspraken: [afspraak(om(9), om(11))] }], om(10));
    assert.equal(dagen[0].label, "Vandaag");
  });

  it("controleerFormulier", () => {
    assert.deepEqual(controleerFormulier({ datum: "2026-10-17", van: "10:00", tot: "11:30" }), {
      start: "2026-10-17T10:00",
      eind: "2026-10-17T11:30",
    });
    assert.match(controleerFormulier({ datum: "", van: "10:00", tot: "11:00" }).fout, /datum/);
    assert.match(controleerFormulier({ datum: "2026-10-17", van: "11:00", tot: "10:00" }).fout, /na de begintijd/);
  });
});
