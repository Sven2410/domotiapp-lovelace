/**
 * Een icoon van Home Assistant in een chip of een stip: de tekening zo groot
 * als het vak.
 *
 * REGRESSIEWACHT, en hij faalt op 0.80.0. Een `mdi:`-icoon wordt een
 * `<ha-icon>` (zie `resolve` in `icons.js`), en de tekening daarin is zo groot
 * als `--mdc-icon-size`, standaard 24px. Een regel die alleen `width` en
 * `height` zet, maakt het VAK kleiner en laat de tekening op 24px staan. Gemeten
 * op 19 oktober 2026, met `mdi:sofa` op elke plek waar een icoon gekozen kan
 * worden: bij de vaatwasser, de rookmelder en de hvac-kaart een tekening van
 * 24 in een vak van 20, dus 2px te laag en 2px te ver naar rechts. Bij de grote
 * hoes van de mediakaart stond hij als 24px in de hoek van een vak van 64.
 *
 * De chip en de stip zijn de plekken waar het icoon uit de config komt. Elke
 * regel die daar een icoon een maat geeft, geeft daarom ook `--mdc-icon-size`.
 * Voor onze eigen tekeningen maakt het niets uit: dat zijn svg's zonder die
 * variabele.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const MAP = new URL("../../src/cards/", import.meta.url);

/** De regels die een icoon in een chip of stip een breedte en hoogte geven. */
function maatRegels(css) {
  const uit = [];
  for (const m of css.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
    const kiezer = m[1].trim().split("\n").pop().trim();
    const lijf = m[2];
    if (!/\.(chip|stip)\b[^,{]*\s(\.icon|ha-icon)\b/.test(kiezer)) continue;
    if (!/(^|[;\s])width\s*:/.test(lijf) || !/(^|[;\s])height\s*:/.test(lijf)) continue;
    uit.push({ kiezer, mdi: /--mdc-icon-size\s*:/.test(lijf) });
  }
  return uit;
}

describe("een icoon in een chip of een stip", () => {
  it("REGRESSIEWACHT: elke maat zet ook --mdc-icon-size", () => {
    const fout = [];
    let geteld = 0;
    for (const naam of readdirSync(MAP).filter((n) => n.endsWith(".js"))) {
      for (const r of maatRegels(readFileSync(new URL(naam, MAP), "utf8"))) {
        geteld++;
        if (!r.mdi) fout.push(`${naam}: ${r.kiezer}`);
      }
    }
    // Vindt de zoekopdracht niets meer, dan bewaakt hij ook niets meer.
    assert.ok(geteld >= 20, `maar ${geteld} regels gevonden`);
    assert.deepEqual(fout, []);
  });

  it("de wacht vangt het ook echt: de chip van de vaatwasser in 0.80.0", () => {
    const css = `\n    .chip { width: 40px; height: 40px; }\n    .chip .icon { width: 20px; height: 20px; }\n`;
    assert.deepEqual(maatRegels(css), [{ kiezer: ".chip .icon", mdi: false }]);
  });

  it("en laat een goede regel en een chip zonder icoon met rust", () => {
    const css = `\n    .chip .icon, .chip ha-icon { width: 20px; height: 20px; --mdc-icon-size: 20px; }\n    .chip.pic img { width: 100%; height: 100%; }\n`;
    assert.deepEqual(maatRegels(css), [{ kiezer: ".chip .icon, .chip ha-icon", mdi: true }]);
  });
});
