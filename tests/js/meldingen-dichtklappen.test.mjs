/**
 * De keuzes in de pop-up van de meldingenkaart klappen dicht (0.111.0).
 *
 * De eigenaar op 6 november 2026: "ik wil de meldingen kunnen dichtklappen dadelijk staat alles heel veel onder elkaar en
 * wordt het onoverzichtelijk".
 *
 * NIEUW GEDRAG.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { klapStand } from "../../src/cards/meldingen-logica.js";

const KEUZES = [{ groep: "cameras", kop: "Van welke camera", opties: [] }];

describe("klapStand", () => {
  it("dicht tot je op het pijltje tikt", () => {
    assert.deepEqual(klapStand({ aan: true, keuzes: KEUZES }, false), { pijl: true, keuzes: false });
    assert.deepEqual(klapStand({ aan: true, keuzes: KEUZES }, true), { pijl: true, keuzes: true });
  });

  it("geen pijltje als de soort uit staat, laadt of niets te kiezen heeft", () => {
    for (const soort of [{ aan: false, keuzes: KEUZES }, { aan: true, laden: true, keuzes: KEUZES }, { aan: true, keuzes: [] }, {}]) {
      assert.deepEqual(klapStand(soort, true), { pijl: false, keuzes: false });
    }
  });
});
