/**
 * De lichtkaart: een dimbare lamp als schakelaar (0.89.1).
 *
 * Gevraagd op 31 oktober 2026, via een beheersessie: een dimblokje met lampen die
 * niet kunnen dimmen meldt `brightness`, en dan tekende de kaart altijd een schuif.
 *
 * NIEUW GEDRAG, behalve waar REGRESSIEWACHT staat. Op de code van vóór deze ronde
 * bestaat `light-logica.js` niet.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { isDimmable, lampBesturing } from "../../src/cards/light-logica.js";

const lamp = (...modes) => ({ state: "on", attributes: { supported_color_modes: modes } });

describe("lampBesturing", () => {
  it("met de keuze een schakelaar, ook als de lamp kan dimmen", () => {
    assert.equal(lampBesturing(lamp("brightness"), { schakelaar: true }), "toggle");
    assert.equal(lampBesturing(lamp("hs", "color_temp"), { schakelaar: true }), "toggle");
  });

  it("REGRESSIEWACHT: zonder de keuze volgt het de lamp", () => {
    assert.equal(lampBesturing(lamp("brightness")), "range");
    assert.equal(lampBesturing(lamp("brightness"), { schakelaar: false }), "range");
    assert.equal(lampBesturing(lamp("onoff")), "toggle");
    assert.equal(lampBesturing(null), "toggle");
  });

  it("REGRESSIEWACHT: een lamp die er niet is heeft geen bediening, wat de keuze ook is", () => {
    assert.equal(lampBesturing(lamp("brightness"), { dood: true }), "none");
    assert.equal(lampBesturing(lamp("brightness"), { dood: true, schakelaar: true }), "none");
  });

  it("alleen true telt: een stukje tekst in de YAML verandert niets", () => {
    assert.equal(lampBesturing(lamp("brightness"), { schakelaar: "nee" }), "range");
  });

  it("REGRESSIEWACHT: wat dimbaar is", () => {
    assert.equal(isDimmable(lamp("onoff")), false);
    assert.equal(isDimmable(lamp("white")), true);
  });
});

describe("de kaart en de editor gebruiken het", () => {
  const bron = readFileSync(new URL("../../src/cards/light-card.js", import.meta.url), "utf8");

  it("de kaart beslist met de keuze uit de config", () => {
    assert.match(bron, /lampBesturing\(st, \{ dood: dead, schakelaar: c\.schakelaar \}\)/);
  });

  it("de editor heeft een vinkje", () => {
    assert.match(bron, /name: "schakelaar", selector: sel\.bool\(\)/);
  });
});
