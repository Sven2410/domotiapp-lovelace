/**
 * Knoppen op de laadpaalkaart per kaart uitvinken (0.88.0).
 *
 * De eigenaar op 31 oktober 2026: *"ik wil op de laadpaalkaart diverse opties
 * kunnen deselecteren. Zoals solar charging etc"*, per kaart in Lovelace, voor
 * Snel, Continu, Zon en Pauze.
 *
 * NIEUW GEDRAG, behalve waar REGRESSIEWACHT staat.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as L from "../../src/cards/laadpaal-logica.js";

const SELECT = (state) => ({ entity_id: "select.oprit_modus", state, attributes: { options: ["planning", "snel", "continu", "zon"] } });
const stand = (attributes) => L.laadpaalStand({ entity_id: "sensor.oprit_coach", state: "x", attributes: { stand: "wacht", ...attributes } });
const ALLE = { modus_keuzes: ["snel", "continu", "zon"], modus_actief: "planning" };
const sleutels = (k) => k.map((x) => x.sleutel);

describe("modusKnoppen met de keuze van de kaart", () => {
  it("REGRESSIEWACHT: zonder keuze blijven alle knoppen staan", () => {
    assert.deepEqual(sleutels(L.modusKnoppen(SELECT("planning"), stand(ALLE))), ["snel", "continu", "zon"]);
  });

  it("een uitgevinkte knop valt weg", () => {
    assert.deepEqual(sleutels(L.modusKnoppen(SELECT("planning"), stand(ALLE), ["snel", "continu", "pauze"])), ["snel", "continu"]);
  });

  it("een aangevinkte knop die de coach nu niet aanbiedt, komt er niet bij", () => {
    const s = stand({ modus_keuzes: ["snel"], modus_actief: "planning", planning_nu: true });
    assert.deepEqual(sleutels(L.modusKnoppen(SELECT("planning"), s, ["snel", "zon"])), ["snel"]);
  });

  it("alles uitgevinkt: geen knoppen", () => {
    assert.deepEqual(L.modusKnoppen(SELECT("planning"), stand(ALLE), []), []);
  });
});

describe("modusRegel: een uitgevinkte stand die toch aan staat", () => {
  it("zegt wat er geldt", () => {
    const r = L.modusRegel(SELECT("planning"), stand({ ...ALLE, modus_actief: "zon" }), null, ["snel"]);
    assert.equal(r.woord, "Zon");
    assert.equal(r.icoon, "sun");
    assert.equal(r.tijd, "");
  });

  it("REGRESSIEWACHT: met de knop op de kaart zegt de knop het, en is er geen regel", () => {
    const s = stand({ ...ALLE, modus_actief: "zon" });
    assert.equal(L.modusRegel(SELECT("planning"), s, null, ["zon"]), null);
    assert.equal(L.modusRegel(SELECT("planning"), s), null);
  });

  it("REGRESSIEWACHT: de regel voor de planning blijft zoals hij was", () => {
    assert.equal(L.modusRegel(SELECT("planning"), stand(ALLE), null, []).woord, "Goedkoopst");
  });
});

describe("kaartKnoppen", () => {
  it("geen lijst is allemaal, een lege lijst is geen enkele", () => {
    assert.equal(L.kaartKnoppen({}), null);
    assert.equal(L.kaartKnoppen(null), null);
    assert.equal(L.kaartKnoppen({ knoppen: "zon" }), null);
    assert.deepEqual(L.kaartKnoppen({ knoppen: [] }), []);
    assert.equal(L.knopOpKaart(null, "pauze"), true);
    assert.equal(L.knopOpKaart([], "pauze"), false);
    assert.equal(L.knopOpKaart(["pauze"], "pauze"), true);
  });

  it("de vier knoppen waar hij om vroeg, en de modi horen erbij", () => {
    assert.deepEqual(sleutels(L.KAARTKNOPPEN), ["snel", "continu", "zon", "pauze"]);
    for (const m of L.MODI) assert.ok(L.KAARTKNOPPEN.some((k) => k.sleutel === m.sleutel));
  });
});

describe("zonderVolleKnoppen: wat de YAML in gaat", () => {
  it("alles aangevinkt is geen sleutel, in welke volgorde ook", () => {
    assert.deepEqual(L.zonderVolleKnoppen({ name: "x", knoppen: ["pauze", "zon", "continu", "snel"] }), { name: "x" });
  });

  it("een keuze blijft staan, ook de lege", () => {
    assert.deepEqual(L.zonderVolleKnoppen({ knoppen: ["snel"] }), { knoppen: ["snel"] });
    assert.deepEqual(L.zonderVolleKnoppen({ knoppen: [] }), { knoppen: [] });
  });

  it("een config zonder knoppen blijft zoals hij is", () => {
    const c = { name: "x" };
    assert.equal(L.zonderVolleKnoppen(c), c);
  });
});

describe("de kaart gebruikt de keuze", () => {
  const bron = readFileSync(new URL("../../src/cards/laadpaal-card.js", import.meta.url), "utf8");

  it("voor de modi, de regel en de pauzeknop", () => {
    assert.match(bron, /modusKnoppen\(modusSt, s, keuze\)/);
    assert.match(bron, /modusRegel\(modusSt, s, stateOf\(this\.hass, r\.klaar_om\), keuze\)/);
    assert.match(bron, /knopOpKaart\(keuze, "pauze"\) \? r\.pauze : null/);
  });
});
