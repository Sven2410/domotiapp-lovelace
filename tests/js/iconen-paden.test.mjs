/**
 * Onze iconen als gevulde paden, voor `ha-icon` (0.99.0). Zie `scripts/iconen-naar-paden.py`.
 *
 * NIEUW GEDRAG: het bestand bestond niet. Dat de vorm er hetzelfde uitziet als de tekening is gemeten in een
 * browser, beeldpunt voor beeldpunt, en staat in het rapport; dat kan hier niet zonder browser.
 */

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { TERMEN } from "../../src/editor/icoon-zoek.js";
import { icons } from "../../src/icons.js";

const paden = JSON.parse(readFileSync("custom_components/domotiapp_lovelace/afbeeldingen/iconen.json", "utf8"));
const getekend = Object.keys(icons).filter((k) => icons[k].startsWith("<svg"));

describe("afbeeldingen/iconen.json", () => {
  it("NIEUW GEDRAG: elk getekend icoon staat erin, en niets anders", () => {
    assert.deepEqual(Object.keys(paden).sort(), [...getekend].sort());
  });

  it("NIEUW GEDRAG: het pad hoort bij de tekening van nu; zo niet, draai scripts/iconen-naar-paden.py", () => {
    const oud = getekend.filter((k) => paden[k].h !== createHash("sha1").update(icons[k]).digest("hex").slice(0, 10));
    assert.deepEqual(oud, []);
  });

  it("NIEUW GEDRAG: elk pad is een gesloten vorm die binnen het vak valt", () => {
    for (const k of getekend) {
      const d = paden[k].d;
      assert.match(d, /^M/, k);
      assert.match(d, /z$/, k);
      assert.ok(!/[A-LN-Za-km-y]/.test(d.replace(/[zZ]/g, "")), `${k}: alleen M, l en z`);
    }
  });

  it("NIEUW GEDRAG: de zoekwoorden zijn die van de kiezer", () => {
    for (const k of getekend) assert.deepEqual(paden[k].w, TERMEN[k] ?? [], k);
  });

  it("NIEUW GEDRAG: er is een wijnglas", () => {
    assert.ok(paden.wijnglas.d.length > 0);
    assert.ok(paden.wijnglas.w.includes("liquor"));
  });
});
