// De tabel die een editor aan merkKeuzes/typeKeuzes/productAfbeelding/metType
// geeft, moet in dat bestand bestaan (sinds 0.82.0).
//
// NIEUW GEDRAG. De vriezereditor riep sinds hij bestond merkKeuzes(VRIEZERS)
// aan, en VRIEZERS bestond niet (de tabel heet KOELEN_EN_VRIEZEN). Het bouwde
// gewoon -- esbuild kent geen ongedefinieerde namen -- en de editor viel om met
// "ReferenceError: VRIEZERS is not defined" zodra hij zijn velden opbouwde.
// Gevonden toen de kaart Engels werd. Een kaart kan in Node niet geladen worden
// (geen jsdom, zie CLAUDE.md), dus dit leest de bron.

import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

const MAP = new URL("../../src/cards/", import.meta.url);

test("elke tabel die aan de productfotofuncties gegeven wordt, bestaat in dat bestand", () => {
  const fout = [];
  for (const naam of readdirSync(MAP).filter((n) => n.endsWith(".js"))) {
    const bron = readFileSync(new URL(naam, MAP), "utf8");
    const gebruikt = new Set();
    for (const m of bron.matchAll(/\b(?:merkKeuzes|typeKeuzes|productAfbeelding|metType)\(([^()]*)\)/g)) {
      for (const deel of m[1].split(",")) {
        const id = deel.trim();
        if (/^[A-Z][A-Z0-9_]+$/.test(id)) gebruikt.add(id);
      }
    }
    for (const id of gebruikt) {
      const bekend = new RegExp(`\\b(?:const|let|var|function)\\s+${id}\\b|import\\s*\\{[^}]*\\b${id}\\b[^}]*\\}`).test(bron);
      if (!bekend) fout.push(`${naam}: ${id}`);
    }
  }
  assert.deepEqual(fout, []);
});
