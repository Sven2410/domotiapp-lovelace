/**
 * Schema, Klaar om en Laden tot op de laadpaalkaart per kaart uitvinken (0.107.0).
 *
 * De eigenaar op 4 november 2026, over een klant die in de goedkope uren laadt zonder auto: "ik wil er niet in hebben dat
 * ik dat kan aanvinken. alleen nu starten bijvoorbeeld."
 *
 * NIEUW GEDRAG, behalve waar REGRESSIEWACHT staat.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as L from "../../src/cards/laadpaal-logica.js";

describe("veldOpKaart", () => {
  it("de drie velden bestaan, in de volgorde van de kaart", () => {
    assert.deepEqual(
      L.KAARTVELDEN.map((k) => k.sleutel),
      ["schema", "klaar_om", "laden_tot"]
    );
  });

  it("REGRESSIEWACHT: zonder lijst staat alles op de kaart, ook met uitgevinkte knoppen", () => {
    for (const sleutel of ["schema", "klaar_om", "laden_tot"]) {
      assert.equal(L.veldOpKaart({}, sleutel), true);
      assert.equal(L.veldOpKaart({ knoppen: ["snel"] }, sleutel), true);
      assert.equal(L.veldOpKaart(null, sleutel), true);
    }
  });

  it("een uitgevinkt veld staat er niet", () => {
    const config = { velden: ["laden_tot"] };
    assert.equal(L.veldOpKaart(config, "schema"), false);
    assert.equal(L.veldOpKaart(config, "klaar_om"), false);
    assert.equal(L.veldOpKaart(config, "laden_tot"), true);
    assert.equal(L.veldOpKaart({ velden: [] }, "laden_tot"), false);
  });
});

describe("zonderVolleVelden: wat de YAML in gaat", () => {
  it("alles aangevinkt is geen lijst", () => {
    assert.deepEqual(L.zonderVolleVelden({ name: "x", velden: ["laden_tot", "schema", "klaar_om"] }), { name: "x" });
  });

  it("iets uitgevinkt blijft staan", () => {
    assert.deepEqual(L.zonderVolleVelden({ velden: ["laden_tot"] }), { velden: ["laden_tot"] });
    assert.deepEqual(L.zonderVolleVelden({ velden: [] }), { velden: [] });
  });

  it("REGRESSIEWACHT: de knoppen blijven erbuiten", () => {
    assert.deepEqual(L.zonderVolleVelden({ knoppen: ["snel"] }), { knoppen: ["snel"] });
  });
});
