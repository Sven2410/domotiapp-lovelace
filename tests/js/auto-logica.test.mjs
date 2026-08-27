/**
 * Het rekenwerk van de autokaart — NIEUW GEDRAG.
 *
 * Gevraagd op 27 augustus 2026: brandstof, hybride of elektrisch, met een
 * actieradiusbalk en een laadtoestandbalk. "Universeel" is hier het lastige
 * woord: elke auto-integratie meldt zijn eigen eenheden en zijn eigen woorden.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  AANDRIJVING,
  afstand,
  alsDuur,
  heeftAccu,
  heeftTank,
  laadStand,
  ladenTot,
  niveau,
  pct,
  statusregel,
} from "../../src/cards/auto-logica.js";

const s = (state, attributes = {}) => ({ state, attributes });

describe("de drie aandrijvingen — NIEUW GEDRAG", () => {
  it("een hybride heeft allebei", () => {
    assert.equal(heeftAccu("hybrid"), true);
    assert.equal(heeftTank("hybrid"), true);
  });

  it("elektrisch heeft geen tank en brandstof geen accu", () => {
    assert.equal(heeftTank("electric"), false);
    assert.equal(heeftAccu("fuel"), false);
  });

  it("alle drie staan er, met een label en een icoon", () => {
    for (const soort of ["fuel", "hybrid", "electric"]) {
      assert.ok(AANDRIJVING[soort].label);
      assert.ok(AANDRIJVING[soort].icoon);
    }
  });
});

describe("pct — NIEUW GEDRAG", () => {
  it("neemt een percentage zoals het is", () => {
    assert.equal(pct(s("64", { unit_of_measurement: "%" })), 64);
    assert.equal(pct(s("64.6", { unit_of_measurement: "%" })), 65);
  });

  it("rekent liters om als er een tankinhoud bij staat", () => {
    // Een Toyota meldt zijn tank in liters. Zonder deze omrekening staat de balk
    // van een halfvolle tank van 55 liter op 28%.
    assert.equal(pct(s("27.5", { unit_of_measurement: "L" }), 55), 50);
  });

  it("rekent kWh om als er een accu-inhoud bij staat", () => {
    assert.equal(pct(s("39", { unit_of_measurement: "kWh" }), 78), 50);
  });

  it("negeert de inhoud als de sensor al procenten meldt", () => {
    assert.equal(pct(s("50", { unit_of_measurement: "%" }), 78), 50);
  });

  it("blijft binnen 0 en 100", () => {
    assert.equal(pct(s("120", { unit_of_measurement: "%" })), 100);
    assert.equal(pct(s("-2", { unit_of_measurement: "%" })), 0);
  });

  it("geeft null bij een sensor die niets meldt", () => {
    assert.equal(pct(s("unknown")), null);
    assert.equal(pct(null), null);
  });
});

describe("afstand — NIEUW GEDRAG", () => {
  it("houdt de eenheid van de sensor aan", () => {
    // Wie zijn HA op mijlen heeft staan, wil mijlen zien.
    assert.deepEqual(afstand(s("214", { unit_of_measurement: "mi" })), {
      waarde: 214,
      eenheid: "mi",
    });
  });

  it("valt terug op km als de sensor niets zegt", () => {
    assert.equal(afstand(s("340")).eenheid, "km");
  });

  it("geeft null bij niets", () => {
    assert.equal(afstand(s("unavailable")), null);
  });
});

describe("laadStand — NIEUW GEDRAG", () => {
  it("kent de woorden die integraties gebruiken", () => {
    assert.equal(laadStand(s("charging")), "charging");
    assert.equal(laadStand(s("fast_charging")), "charging");
    assert.equal(laadStand(s("on")), "charging");
    assert.equal(laadStand(s("fully_charged")), "complete");
    assert.equal(laadStand(s("connected")), "connected");
    assert.equal(laadStand(s("off")), "idle");
    assert.equal(laadStand(s("not_charging")), "idle");
  });

  it("geeft null als er niets bekend is", () => {
    assert.equal(laadStand(s("unavailable")), null);
    assert.equal(laadStand(null), null);
  });
});

describe("niveau — NIEUW GEDRAG", () => {
  it("wordt oranje onder de 20 en rood onder de 10", () => {
    assert.equal(niveau(64).toon, "good");
    assert.equal(niveau(20).toon, "warn");
    assert.equal(niveau(11).toon, "warn");
    assert.equal(niveau(10).toon, "bad");
    assert.equal(niveau(3).toon, "bad");
  });

  it("geeft null als er geen stand is", () => {
    assert.equal(niveau(null), null);
  });
});

describe("ladenTot en alsDuur — NIEUW GEDRAG", () => {
  const nu = Date.parse("2026-08-27T20:00:00Z");

  it("leest minuten, een klok en een tijdstip", () => {
    assert.equal(ladenTot(s("95"), nu), 95);
    assert.equal(ladenTot(s("1:35:00"), nu), 95);
    assert.equal(
      ladenTot(s("2026-08-27T21:35:00Z", { device_class: "timestamp" }), nu),
      95
    );
  });

  it("schrijft het leesbaar op", () => {
    assert.equal(alsDuur(95), "1 u 35");
    assert.equal(alsDuur(35), "35 min");
    assert.equal(alsDuur(null), "");
  });
});

describe("statusregel — NIEUW GEDRAG", () => {
  const basis = {
    open: false,
    slot: "locked",
    laden: null,
    laadMinuten: null,
    radius: null,
    aandrijving: "electric",
  };

  it("wat openstaat gaat vóór alles", () => {
    const r = statusregel({ ...basis, open: true, laden: "charging" });
    assert.equal(r.tekst, "Er staat iets open");
    assert.equal(r.toon, "warn");
  });

  it("niet op slot komt daarna, en vóór het laden", () => {
    const r = statusregel({ ...basis, slot: "unlocked", laden: "charging" });
    assert.equal(r.tekst, "Niet op slot");
  });

  it("laden vertelt hoe lang het nog duurt", () => {
    const r = statusregel({ ...basis, laden: "charging", laadMinuten: 95 });
    assert.equal(r.tekst, "Aan het laden · nog 1 u 35");
    assert.equal(r.toon, "accent");
  });

  it("zonder iets bijzonders staat er hoe ver hij nog komt", () => {
    const r = statusregel({ ...basis, radius: { waarde: 340, eenheid: "km" } });
    assert.equal(r.tekst, "Nog 340 km");
  });

  it("en anders alleen wat voor auto het is", () => {
    assert.equal(statusregel(basis).tekst, "Elektrisch");
  });
});
