/**
 * De helderheid op de kaarten blijft tussen 0 en 100 % (0.131.0). Bij een klant toonde de lichtkaart "Hanglamp
 * 89864600%": een Shelly Dimmer Gen3 (firmware 2.2.0) begon na een update zonder geldige helderheid, en Home Assistant
 * gaf `brightness: 229154730` door. De eigenaar: "begrens het helderheidspercentage in de kaarten tot 0–100 %".
 *
 * NIEUW GEDRAG: op 0.130.0 bestaat `helderheidProcent` niet, en rekenen de drie kaarten zelf, zonder bovengrens.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { helderheidProcent } from "../../src/cards/light-logica.js";

const bron = (pad) => readFileSync(new URL(`../../src/cards/${pad}`, import.meta.url), "utf8");

describe("helderheidProcent", () => {
  it("rekent een geldige helderheid om, en een brandende lamp staat op minstens 1 %", () => {
    assert.deepEqual([0, 1, 3, 128, 254, 255].map(helderheidProcent), [1, 1, 1, 50, 100, 100]);
  });

  it("geeft geen getal bij wat geen meting is: de waarden van de Shelly, en alles buiten 0 tot 255", () => {
    for (const ruw of [229154730, 89864600, 2147483647, -2147483648, 256, -1, Number.NaN, Infinity, null, undefined, "128"]) {
      assert.equal(helderheidProcent(ruw), null, String(ruw));
    }
  });
});

describe("de kaarten", () => {
  it("rekenen niet meer zelf, maar via helderheidProcent", () => {
    for (const kaart of ["light-card.js", "entities-card.js", "infoscherm-card.js"]) {
      const s = bron(kaart);
      assert.match(s, /import \{[^}]*helderheidProcent[^}]*\} from "\.\/light-logica\.js";/, kaart);
      assert.doesNotMatch(s, /brightness\s*(\?\?\s*0\))?\s*\/\s*255/, kaart);
    }
  });

  it("de lichtkaart zegt Aan als er geen bruikbare helderheid is, en zet de schuif vol", () => {
    const s = bron("light-card.js");
    assert.match(s, /const pct = \(brightness\) => helderheidProcent\(brightness\) \?\? 100;/);
    assert.match(s, /this\.text\("\.v", on \? \(bekend \? `\$\{v\}%` : t\("Aan"\)\) : t\("Uit"\)\);/);
  });
});
