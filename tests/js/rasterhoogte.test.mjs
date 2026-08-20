/**
 * De rasterhoogte: waar een kaart op uit hoort te komen.
 *
 * NIEUW GEDRAG: `rasterhoogte.js` bestond niet vóór deze ronde. Vijf kaarten
 * kwamen op 93, 103 of 130 pixels uit — allemaal ergens tussen twee rasterrijen
 * van Home Assistant in, waardoor de kaart eronder op een halve rij begon.
 *
 * Alleen `opRaster` staat hier. `inhoudsHoogte` en `volgRaster` lezen de DOM en
 * horen daarom in de browser gemeten te worden, niet in jsdom — zie de regel
 * daarover in `CLAUDE.md`.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ROW_GAP, ROW_H, opRaster } from "../../src/rasterhoogte.js";

/** De hoogtes waar Home Assistant zijn rijen op zet. */
const RIJ = (n) => n * ROW_H + (n - 1) * ROW_GAP;

describe("opRaster()", () => {
  it("de rijmaten zijn 56, 120, 184 en 248", () => {
    assert.deepEqual([1, 2, 3, 4].map(RIJ), [56, 120, 184, 248]);
  });

  it("laat een hoogte die al klopt met rust", () => {
    for (const n of [1, 2, 3, 4, 8]) {
      assert.equal(opRaster(RIJ(n)), RIJ(n), `${n} rijen`);
    }
  });

  it("rondt op naar de eerstvolgende rij, nooit naar beneden", () => {
    // Precies de drie hoogtes die gemeten zijn op de echte instance.
    assert.equal(opRaster(93), 120, "lampkaart met kleurstrips");
    assert.equal(opRaster(103), 120, "weersvoorspelling");
    assert.equal(opRaster(130), 184, "mediakaart met drie regels");
  });

  it("één pixel te veel kost een hele rij", () => {
    assert.equal(opRaster(56), 56);
    assert.equal(opRaster(57), 120);
    assert.equal(opRaster(120), 120);
    assert.equal(opRaster(121), 184);
  });

  it("de tussenruimte telt mee, dus 64 past nog op één rij", () => {
    // Een kaart van 56 plus 8 tussenruimte eindigt precies waar rij 2 begint.
    // Daarom mag 57 tot en met 64 niet naar beneden vallen maar wél naar 120:
    // afronden gebeurt op de kaarthoogte, niet op de rijafstand.
    assert.equal(opRaster(64), 120);
  });

  it("niets en onzin worden nog altijd één rij", () => {
    assert.equal(opRaster(0), ROW_H);
    assert.equal(opRaster(-40), ROW_H);
    assert.equal(opRaster(1), ROW_H);
  });

  it("groeit door voor een kaart die veel hoger wordt", () => {
    // De wekkerkaart met zes wekkers, de mediakaart in telefoonformaat.
    assert.equal(opRaster(300), RIJ(5));
    assert.equal(opRaster(504), RIJ(8));
  });
});
