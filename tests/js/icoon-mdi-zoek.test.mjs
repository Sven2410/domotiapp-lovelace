/**
 * Zoeken in alle iconen van Home Assistant, voor de favorieten (0.98.0).
 *
 * De eigenaar, 31 oktober 2026: "ik wil gewoon alle mogelijke icons hebben".
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { zoekMdi } from "../../src/editor/icoon-zoek.js";

const LIJST = [
  { name: "account", keywords: ["person", "user"] },
  { name: "washing-machine", keywords: ["laundry"] },
  { name: "washing-machine-alert", keywords: ["laundry"] },
  { name: "tumble-dryer", keywords: ["laundry", "dry"] },
  { name: "robot", keywords: ["bot"] },
  { name: "robot-mower", keywords: ["lawn"] },
];

describe("zoekMdi", () => {
  it("NIEUW GEDRAG: zonder vraag de hele lijst", () => {
    assert.equal(zoekMdi(LIJST, "").length, LIJST.length);
    assert.equal(zoekMdi(LIJST, "   ").length, LIJST.length);
  });

  it("NIEUW GEDRAG: de naam gaat voor de trefwoorden, de kortste bovenaan", () => {
    assert.deepEqual(zoekMdi(LIJST, "robot"), ["robot", "robot-mower"]);
    assert.deepEqual(zoekMdi(LIJST, "laundry"), ["tumble-dryer", "washing-machine", "washing-machine-alert"]);
  });

  it("NIEUW GEDRAG: elk woord moet passen, ook met mdi: ervoor en in een andere schrijfwijze", () => {
    assert.deepEqual(zoekMdi(LIJST, "washing alert"), ["washing-machine-alert"]);
    assert.deepEqual(zoekMdi(LIJST, "mdi:Washing-Machine"), ["washing-machine", "washing-machine-alert"]);
    assert.deepEqual(zoekMdi(LIJST, "bestaatniet"), []);
  });

  it("NIEUW GEDRAG: geen lijst is geen fout", () => {
    assert.deepEqual(zoekMdi(null, "robot"), []);
  });
});
