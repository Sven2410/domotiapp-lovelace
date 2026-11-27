/**
 * De brandstofkaart (0.143.0): van prijs naar bord. **NIEUW GEDRAG**: `brandstof-logica.js` bestaat op 0.142.0 niet.
 * Het lezen van de bron staat aan de serverkant (tests/test_brandstof.py).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as B from "../../src/cards/brandstof-logica.js";

describe("de brandstofkaart", () => {
  it("een prijs op een bord: de laatste cijfer apart", () => {
    assert.deepEqual(B.prijsDelen(2.377), { hoofd: "2,37", staart: "7" });
    assert.deepEqual(B.prijsDelen(2.42), { hoofd: "2,42", staart: "0" });
    assert.deepEqual(B.prijsDelen(1.335), { hoofd: "1,33", staart: "5" });
    assert.equal(B.prijsDelen(null), null);
    assert.equal(B.prijsTekst(2.42), "€ 2,420 per liter");
  });

  it("de trend tegenover gisteren, in centen zoals de bron: duurder rood, goedkoper groen", () => {
    assert.deepEqual(B.trend(0.002), { richting: "op", tekst: "+0,2 ct", toon: "bad" });
    assert.deepEqual(B.trend(0.017), { richting: "op", tekst: "+1,7 ct", toon: "bad" });
    assert.deepEqual(B.trend(-0.031), { richting: "af", tekst: "−3,1 ct", toon: "good" });
    assert.equal(B.trend(0).richting, "gelijk");
    assert.equal(B.trend(null), null);
  });

  it("zeven segmenten: welke staafjes aan staan, en een komma als puntje", () => {
    assert.equal(B.segmenten("8"), "abcdefg");
    assert.equal(B.segmenten("1"), "bc");
    assert.equal(B.segmenten("€"), null);
    const svg = B.cijferSvg("2,37");
    assert.equal((svg.match(/class="aan"/g) ?? []).length, 5 + 1 + 5 + 3);
    assert.equal((svg.match(/class="uit"/g) ?? []).length, 3 * 7 - 13);
    assert.match(svg, /^<svg class="cijfers" viewBox="-1 0 [\d.]+ 20"/);
  });

  it("het lijntje: van oud naar nieuw over de hele breedte; een vlakke reeks in het midden", () => {
    const pad = B.lijnPad([["2026-11-25", 2.373], ["2026-11-26", 2.375], ["2026-11-27", 2.377]], 100, 24);
    assert.equal(pad, "M0.00 22.00 L50.00 12.00 L100.00 2.00");
    assert.equal(B.lijnPad([["a", 1.335], ["b", 1.335]], 100, 24), "M0.00 12.00 L100.00 12.00");
    assert.equal(B.lijnPad([["a", 1]]), "");
  });

  it("welke brandstoffen: de keuze, anders de vier van de eigenaar", () => {
    assert.deepEqual(B.gekozen({}), ["euro95", "diesel", "lpg", "super"]);
    assert.deepEqual(B.gekozen({ brandstoffen: ["lpg", "lpg", "diesel"] }), ["lpg", "diesel"]);
    assert.equal(B.datumRegel("2026-11-27", "nl-NL"), "Landelijke adviesprijs van 27 nov");
    assert.equal(B.datumRegel(null, "nl-NL"), "Landelijke adviesprijs");
  });
});
