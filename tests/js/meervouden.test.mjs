// Een telling van één krijgt een enkelvoud (sinds 0.83.0).
//
// NIEUW GEDRAG. Tot 0.82.0 stond er "1 dagen geleden", "1 lampen" en "1 blokken"
// in het beheer, "1 beelden" bij de camera (in het Engels "1 images") en
// "1 nieuwsbron(nen)". Bij het Engels van 0.82.0 is dat met opzet zo gelaten,
// want het Nederlands moest toen letterlijk gelijk blijven.

import { strict as assert } from "node:assert";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { afterEach, test } from "node:test";

import { relativeDay } from "../../src/ha.js";
import { _reset } from "../../src/taal.js";

afterEach(() => _reset());

test("gisteren is gisteren, en niet 1 dagen geleden", () => {
  const nu = new Date(2026, 9, 21, 12, 0);
  _reset({ instelling: "nl" });
  assert.equal(relativeDay(new Date(2026, 9, 20, 9, 0), nu), "gisteren");
  assert.equal(relativeDay(new Date(2026, 9, 18, 9, 0), nu), "3 dagen geleden");
  _reset({ instelling: "en" });
  assert.equal(relativeDay(new Date(2026, 9, 20, 9, 0), nu), "yesterday");
});

test("geen (en) of (nen) achter een woord in een zin voor mensen", () => {
  const fout = [];
  const loop = (map) => {
    for (const naam of readdirSync(map)) {
      const pad = `${map}/${naam}`;
      if (statSync(pad).isDirectory()) {
        if (naam !== "i18n") loop(pad);
      } else if (naam.endsWith(".js")) {
        for (const m of readFileSync(pad, "utf8").matchAll(/\bt\(\s*"([^"]*\w\((?:n?en|s)\)[^"]*)"/g)) fout.push(`${naam}: ${m[1]}`);
      }
    }
  };
  loop(new URL("../../src", import.meta.url).pathname);
  assert.deepEqual(fout, []);
});
