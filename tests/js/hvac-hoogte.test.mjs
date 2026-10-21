/**
 * De HVAC-kaart zonder tegels past op drie rasterrijen (184).
 *
 * NIEUW GEDRAG (0.83.1). Gemeten op 21 oktober 2026 bij een klant, op een
 * Daikin zonder vochtigheid of buitentemperatuur: kop 40, standen 32,5, doel 40
 * en ventilator 33, plus een rand van 1 boven en onder. Met padding en gap op 8
 * was dat 187,5, dus vier rijen (248), met een lege band boven de kop.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { it } from "node:test";

import { opRaster } from "../../src/rasterhoogte.js";

const bron = readFileSync(new URL("../../src/cards/hvac-card.js", import.meta.url), "utf8");
const blok = bron.match(/\n    \.card \{([\s\S]*?)\n    \}/)[1].replace(/\/\*[\s\S]*?\*\//g, "");
const px = (re) => Number(blok.match(re)[1]);

it("kop, standen, doel en ventilator passen op drie rijen", () => {
  const padding = px(/padding:\s*([\d.]+)px/);
  const gap = px(/gap:\s*([\d.]+)px/);
  const inhoud = 40 + 32.5 + 40 + 33 + 3 * gap + 2 * padding + 2;
  assert.equal(opRaster(inhoud), 184, `inhoud ${inhoud}`);
  // Met tegels erbij (47 hoog) blijft het vier rijen, en alleen de kop één.
  assert.equal(opRaster(inhoud + 47 + gap), 248);
  assert.equal(opRaster(40 + 2 * padding + 2), 56);
});
