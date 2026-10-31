/**
 * De badge met de soort Weerstation (gevraagd op 31 oktober 2026).
 *
 * NIEUW GEDRAG: de soort bestond niet.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { BADGE_SOORTEN, SOORT_STANDAARD, badgeSoort, temperatuurTekst } from "../../src/badges/badge-logica.js";

const sensor = (state, eenheid = "°C") => ({ state, attributes: { unit_of_measurement: eenheid } });

describe("de soort", () => {
  it("is een soort, met een kop en een icoon", () => {
    assert.ok(BADGE_SOORTEN.includes("weerstation"));
    assert.equal(badgeSoort({ mode: "weerstation" }), "weerstation");
    assert.equal(SOORT_STANDAARD.weerstation.icon, "thermo");
    assert.ok(SOORT_STANDAARD.weerstation.label);
  });
});

describe("temperatuurTekst", () => {
  it("hoogstens één decimaal, met de komma en de eenheid van de sensor", () => {
    assert.equal(temperatuurTekst(sensor("15.6")), "15,6 °C");
    assert.equal(temperatuurTekst(sensor("15.62")), "15,6 °C");
    assert.equal(temperatuurTekst(sensor("22")), "22 °C");
    assert.equal(temperatuurTekst(sensor("-3.04")), "-3 °C");
    assert.equal(temperatuurTekst(sensor("68.5", "°F")), "68,5 °F");
    assert.equal(temperatuurTekst({ state: "20", attributes: {} }), "20 °C");
  });

  it("geen getal is geen temperatuur", () => {
    assert.equal(temperatuurTekst(sensor("unavailable")), null);
    assert.equal(temperatuurTekst(sensor("unknown")), null);
    assert.equal(temperatuurTekst(null), null);
  });
});

describe("de badge en de editor", () => {
  const bron = readFileSync(new URL("../../src/badges/template-badge.js", import.meta.url), "utf8");

  it("staat in de keuzelijst, en het kiesveld zoekt temperatuursensoren", () => {
    assert.match(bron, /value: "weerstation"/);
    assert.match(bron, /device_class: "temperature"/);
  });

  it("het kleurveld blijft werken", () => {
    assert.match(bron, /uitkomst && soort !== "weerstation"/);
  });
});
