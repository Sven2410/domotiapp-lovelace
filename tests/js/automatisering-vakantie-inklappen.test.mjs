/**
 * De vakantieregels staan er pas als de vakantiemodus aan staat (0.110.0).
 *
 * De eigenaar op 6 november 2026: "als vakantiemodus uit staat moet hij alle regels verbergen tot je hem aan zet en dan
 * kan je hem openklappen".
 *
 * NIEUW GEDRAG.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { vakantieOpen } from "../../src/cards/automatisering-logica.js";

describe("vakantieOpen", () => {
  it("open als de vakantiemodus aan staat", () => {
    assert.equal(vakantieOpen({ vakantie: true, regels: [] }), true);
  });

  it("dicht als hij uit staat, of als de server nog niets zei", () => {
    assert.equal(vakantieOpen({ vakantie: false, regels: [{ id: "a", vakantie: true }] }), false);
    assert.equal(vakantieOpen(null), false);
    assert.equal(vakantieOpen({}), false);
  });
});
