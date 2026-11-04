/**
 * Wat de coach zegt dat bij de paal te zetten is (coach v0.197.0: `velden` en `modus_bron`).
 *
 * Met Zonder accustand in de goedkope uren geeft de coach `velden: ["modus", "pauze"]`; dan horen Schema, Klaar om en
 * Laden tot niet op de kaart, ook met het vinkje van 0.107.0 aan.
 *
 * NIEUW GEDRAG, behalve waar REGRESSIEWACHT staat.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as L from "../../src/cards/laadpaal-logica.js";

const stand = (attributes) => L.laadpaalStand({ entity_id: "sensor.oprit_coach", state: "x", attributes: { stand: "wacht", ...attributes } });
const VELDEN = ["schema", "klaar_om", "laden_tot"];

describe("veldVanCoach", () => {
  it("goedkope uren: alleen de modus en de pauze, dus geen van de drie", () => {
    const s = stand({ velden: ["modus", "pauze"] });
    for (const v of VELDEN) assert.equal(L.veldVanCoach(s, v), false, v);
  });

  it("anders: alle drie", () => {
    const s = stand({ velden: ["klaar_tijd", "doel", "schema", "modus", "pauze"] });
    for (const v of VELDEN) assert.equal(L.veldVanCoach(s, v), true, v);
  });

  it("de namen van de coach horen bij de juiste velden", () => {
    const s = stand({ velden: ["doel"] });
    assert.deepEqual(VELDEN.map((v) => L.veldVanCoach(s, v)), [false, false, true]);
    assert.deepEqual(VELDEN.map((v) => L.veldVanCoach(stand({ velden: ["klaar_tijd"] }), v)), [false, true, false]);
  });

  it("REGRESSIEWACHT: een coach zonder velden (van voor v0.197.0), of geen stand: alles", () => {
    for (const v of VELDEN) {
      assert.equal(L.veldVanCoach(stand({}), v), true);
      assert.equal(L.veldVanCoach(null, v), true);
    }
  });
});

describe("modus_bron", () => {
  it("wordt gelezen", () => {
    assert.equal(stand({ modus_actief: "snel", modus_bron: "app" }).modusBron, "app");
    assert.equal(stand({ modus_bron: "" }).modusBron, "");
    assert.equal(stand({}).modusBron, "");
  });
});

describe("de echte dump van coach v0.197.0 (een paal in de goedkope uren, zonder auto)", () => {
  const [dump] = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.197.0-laadpaal.json", import.meta.url), "utf8"));
  const s = L.laadpaalStand(dump);

  it("velden en modus_bron staan er in de vorm die de kaart leest", () => {
    assert.deepEqual(s.velden, ["modus", "pauze"]);
    assert.equal(s.modusBron, "");
  });

  it("Schema, Klaar om en Laden tot vallen weg", () => {
    for (const v of VELDEN) assert.equal(L.veldVanCoach(s, v), false, v);
  });

  it("REGRESSIEWACHT: de modus blijft wat hij was", () => {
    assert.equal(s.modusActief, "planning");
    assert.deepEqual(s.modusKeuzes, ["snel", "continu", "zon"]);
  });
});
