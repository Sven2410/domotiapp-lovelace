/**
 * De tabbladenkaart krimpt weer na een wissel naar een korter tabblad.
 *
 * NIEUW GEDRAG (0.84.1). `meetRaster` telt de hoogte van de kinderen van de
 * kaart op, en de kaart is minstens zo hoog als die meting (`--dac-raster`).
 * Groeit een kind mee met de kaart (`flex-grow`), dan meet de kaart zichzelf:
 * hij kan dan alleen groeien. Gemeten bij een klant op 21 oktober 2026: van
 * een tabblad van 1130 naar een van 1002, en de kaart bleef 1208 hoog.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { it } from "node:test";

const bron = readFileSync(new URL("../../src/cards/tabs-card.js", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

it("het vak met de tabbladen groeit niet mee met de kaart", () => {
  const regel = bron.match(/\.vakken\s*\{([^}]*)\}/)[1];
  const flex = regel.match(/flex:\s*([\d.]+)/);
  const grow = regel.match(/flex-grow:\s*([\d.]+)/);
  assert.equal(Number((grow ?? flex)[1]), 0, regel.trim());
});
