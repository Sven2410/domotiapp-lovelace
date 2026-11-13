/**
 * Het botscherm zet de pagina eronder vast (0.124.1). NIEUW GEDRAG: in 0.124.0 scrolde de pagina mee.
 *
 * De eigenaar, 13 november 2026, op zijn iPhone: "ik kan de achtergrond scrollen als de bot geopend is, dat moet ook
 * niet". Het slot zelf staat getoetst in `scrollslot.test.mjs`; dit toetst dat het scherm het ook zet en weer loslaat.
 * Een scherm is een custom element, en dat laden we hier niet (geen jsdom), dus dit leest de bron. Dat de pagina in een
 * echte browser stil blijft staan, met echte veegbewegingen op 390 breed, staat in `docs/bot-scroll/RAPPORT.md`.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const BRON = readFileSync(new URL("../../src/cards/bot-scherm.js", import.meta.url), "utf8");
const methode = (naam) => {
  const begin = BRON.indexOf(`\n  ${naam}(`);
  assert.ok(begin > 0, naam);
  return BRON.slice(begin, BRON.indexOf("\n  }\n", begin));
};

describe("het botscherm en de pagina eronder", () => {
  it("zet het slot bij openen, één keer", () => {
    assert.match(BRON, /import \{ zetScrollSlot \} from "\.\.\/scrollslot\.js";/);
    assert.match(methode("open"), /this\.scrollLos_ \?\?= zetScrollSlot\(\);/);
  });

  it("laat het los bij sluiten en als het scherm uit de pagina gaat", () => {
    assert.match(methode("sluit"), /this\.scrollLos_\?\.\(\);/);
    assert.match(methode("disconnectedCallback"), /this\.scrollLos_\?\.\(\);/);
  });

  it("houdt het scrollen in de lijst en de gesprekken", () => {
    for (const sel of [".lijst", ".berichten", ".nieuw-stand"]) {
      const regel = BRON.split("\n").find((r) => r.trimStart().startsWith(`${sel} {`));
      assert.match(regel ?? "", /overscroll-behavior: contain/, sel);
    }
  });
});
