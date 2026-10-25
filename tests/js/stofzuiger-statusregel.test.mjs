/**
 * De statusregel in de kop van de stofzuigerkaart: leesbaar op een telefoon.
 *
 * NIEUW GEDRAG, en hij faalt op 0.84.3. De regel was één regel met `nowrap`,
 * en het woord en het detail kapten elk apart af. Op een iPhone in staande
 * stand (een kaart van ruim 338 CSS-pixels, met de foto ernaast 187 voor de
 * tekst) stond er zo "Adding w... · Living Room · ...": twee afgekapte stukken
 * die samen niets zeiden. Gemeld op 25 oktober 2026 met een schermafdruk.
 *
 * Nu lopen woord en detail als gewone tekst door, over hoogstens twee regels,
 * met een harde spatie vóór elk puntje en elke eenheid. Gemeten op de werkbank
 * (`dev/stofzuiger.html`) met de dump van de L40s: de kop blijft 62 hoog op
 * 338 breed. Dat het afbreekt is in Chrome te meten, maar niet in node; deze
 * toets bewaakt de CSS en de harde spaties.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const bron = readFileSync(new URL("../../src/cards/stofzuiger-card.js", import.meta.url), "utf8");

/** Het lijf van de eerste CSS-regel met precies deze kiezer. */
function lijf(kiezer) {
  const m = [...bron.matchAll(/([^{}]*)\{([^{}]*)\}/g)].find((r) => r[1].trim().split("\n").pop().trim() === kiezer);
  return m ? m[2] : null;
}

describe("stofzuigerkaart: de statusregel", () => {
  it("woord en detail staan samen in één regel die over twee regels mag", () => {
    assert.match(bron, /<span class="regel"><span class="woord"><\/span><span class="detail" hidden><\/span><\/span>/);
    const regel = lijf(".st .regel");
    assert.ok(regel, "er is een regel voor .st .regel");
    assert.match(regel, /-webkit-line-clamp:\s*2/);
    assert.doesNotMatch(regel, /nowrap/);
  });

  it("woord en detail kappen niet elk apart af", () => {
    for (const k of [".st .woord", ".st .detail"]) {
      const l = lijf(k);
      if (l) assert.doesNotMatch(l, /nowrap|text-overflow/, `${k} kapt niet af`);
    }
  });

  it("het puntje hangt aan wat ervoor staat, het getal aan zijn %", () => {
    assert.match(lijf(".st .detail::before") ?? "", /content:\s*"\\\\00a0· "/);
    const vervang = bron.match(/s\.detail\.replace\((\/[^/]+\/g), "\\u00a0\$1"\)/);
    assert.ok(vervang, "het detail krijgt harde spaties");
    const re = new RegExp(vervang[1].slice(1, -2), "g");
    assert.equal("Living Room · 12 %".replace(re, "\u00a0$1"), "Living Room\u00a0· 12\u00a0%");
  });
});
