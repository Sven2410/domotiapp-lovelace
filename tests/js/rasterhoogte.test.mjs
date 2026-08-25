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

import { ROW_GAP, ROW_H, gemetenRijen, opRaster } from "../../src/rasterhoogte.js";

/** De hoogtes waar Home Assistant zijn rijen op zet. */
const RIJ = (n) => n * ROW_H + (n - 1) * ROW_GAP;

describe("gemetenRijen() — de ondergrens die een kaart opgeeft — NIEUW GEDRAG", () => {
  /**
   * Een nagemaakt vak met alleen wat gemetenRijen leest: de weggeschreven
   * meting van meetRaster. Geen DOM nodig, en dat is precies waarom die meting
   * op een style-eigenschap staat en niet in een gesloten variabele.
   */
  const vak = (raster) => ({
    style: { getPropertyValue: (naam) => (naam === "--dac-raster" ? raster : "") },
  });

  it("rekent elke rasterhoogte terug naar zijn aantal rijen", () => {
    assert.equal(gemetenRijen(vak("56px")), 1);
    assert.equal(gemetenRijen(vak("120px")), 2);
    assert.equal(gemetenRijen(vak("184px")), 3);
    assert.equal(gemetenRijen(vak("248px")), 4);
    assert.equal(gemetenRijen(vak("632px")), 10);
  });

  it("is de omkering van opRaster, voor elk aantal rijen", () => {
    for (let n = 1; n <= 12; n++) {
      const px = n * ROW_H + (n - 1) * ROW_GAP;
      assert.equal(gemetenRijen(vak(`${px}px`)), n, `${px}px hoort ${n} rijen te zijn`);
    }
  });

  it("geeft null als er nog niets gemeten is", () => {
    // Dan valt de kaart terug op zijn eigen schatting; een 1 verzinnen zou de
    // ondergrens juist weer te laag zetten -- en dat is de fout die dit
    // voorkomt.
    for (const leeg of [vak(""), vak("0px"), vak("geen getal"), vak(undefined), {}, null, undefined]) {
      assert.equal(gemetenRijen(leeg), null);
    }
  });

  it("laat een mediakaart van 184px niet als 2 rijen doorgaan", () => {
    // Dit is het gemeten geval van 25 augustus 2026: grid_options {rows: 2} gaf
    // een vak van 120px terwijl de kaart 184px tekende, en die 64px liepen over
    // de kaart eronder. De ondergrens hoort 3 te zijn, zodat Home Assistant de
    // 2 omhoog klemt.
    assert.equal(gemetenRijen(vak("184px")), 3);
    assert.ok(gemetenRijen(vak("184px")) > 2);
  });
});

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
