/**
 * Het logo van COACH op de kaarten die over de coach gaan. De eigenaar, 13 november 2026: "Dat logo moet op alles
 * komen te staan." NIEUW GEDRAG: op 0.125.0 bestaat het icoon `coach` niet.
 *
 * De kaarten zelf laden we niet buiten een browser; die proeven lezen de bron, net als `bot-scroll.test.mjs`. Hoe het
 * eruitziet en dat de kaarten er niet hoger van worden, staat gemeten in `docs/coach-logo/RAPPORT.md`.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { coachMerk, coachMerkCss, icons, resolve } from "../../src/icons.js";
import { GROEPEN, TERMEN } from "../../src/editor/icoon-zoek.js";

const bron = (pad) => readFileSync(new URL(`../../src/${pad}`, import.meta.url), "utf8");

describe("het icoon coach", () => {
  it("is het bestand zelf, een PNG in zijn eigen kleuren", () => {
    const m = icons.coach.match(/^<img class="icon" alt="" aria-hidden="true" src="data:image\/png;base64,([A-Za-z0-9+/=]+)">$/);
    assert.ok(m, "geen img met een PNG");
    const png = Buffer.from(m[1], "base64");
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    // Breedte en hoogte uit de IHDR: vierkant, 96 px.
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [96, 96]);
  });

  it("is te kiezen in de icoonkiezer, en te vinden op coach en logo", () => {
    assert.ok(GROEPEN.some(([, namen]) => namen.includes("coach")));
    assert.ok(TERMEN.coach.includes("logo"));
    assert.equal(resolve("dai:coach"), icons.coach);
  });

  it("heeft een merkje met de naam voor een schermlezer, en kan verborgen beginnen", () => {
    assert.match(coachMerk(), /^<span class="coachmerk" role="img" aria-label="COACH"><img /);
    assert.match(coachMerk(true), /aria-label="COACH" hidden>/);
    assert.match(coachMerkCss, /\.coachmerk\[hidden\] \{ display: none; \}/);
  });
});

describe("waar het logo staat", () => {
  it("staat voor de zin van de coach op de laadpaal, de batterij en de airco", () => {
    for (const kaart of ["laadpaal-card.js", "batterij-card.js", "airco-card.js"]) {
      const s = bron(`cards/${kaart}`);
      assert.match(s, /<span class="reden"(?: hidden)?>\$\{coachMerk\(\)\}<span class="rt"><\/span><\/span>/, kaart);
      assert.match(s, /this\.text\("\.reden \.rt",/, kaart);
      assert.match(s, /\$\{coachMerkCss\}/, kaart);
    }
  });

  it("staat in de statusregel van de vaatwasser, alleen als de coach hem volgt", () => {
    const s = bron("cards/dishwasher-card.js");
    assert.match(s, /\$\{coachMerk\(true\)\}<span class="sw">/);
    assert.match(s, /this\.\$\("\.st \.coachmerk"\)\.hidden = !coach;/);
  });

  it("is het icoon van Coach Assist, op de tegel en in de kop van het scherm", () => {
    assert.match(bron("cards/bot-card.js"), /resolve\(this\.config\.icon \|\| "coach", "coach"\)/);
    assert.match(bron("cards/bot-scherm.js"), /<span class="ico">\$\{resolve\("coach"\)\}<\/span>/);
  });
});
