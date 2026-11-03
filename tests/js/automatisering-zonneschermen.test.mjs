/**
 * Zonneschermen op de automatiseringskaart (0.104.0). De eigenaar wil ze kunnen kiezen; de windgrens staat aan de serverkant
 * (`automatisering/wind.py`).
 *
 * NIEUW GEDRAG, behalve wat met REGRESSIEWACHT begint.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as L from "../../src/cards/automatisering-logica.js";

const KAART = {
  lampen: ["light.a"],
  rolluiken: ["cover.rolluik"],
  zonneschermen: [{ entity: "cover.scherm", name: "Terras" }, "cover.scherm2", "light.verkeerd"],
  omgekeerd: ["cover.scherm2"],
};
const LAMPEN = L.lampenUit(KAART);
const buiten = () => false;

describe("zonneschermen op de kaart", () => {
  it("komen uit `zonneschermen`, als rolluik dat een zonnescherm is, alleen cover", () => {
    assert.deepEqual(
      LAMPEN.filter((l) => l.zonnescherm),
      [
        { entity: "cover.scherm", naam: "Terras", rolluik: true, zonnescherm: true, omgekeerd: false },
        { entity: "cover.scherm2", naam: "", rolluik: true, zonnescherm: true, omgekeerd: true },
      ]
    );
  });

  it("de kop noemt ze apart", () => {
    assert.equal(L.lijstKopVan(LAMPEN), "Lampen, rolluiken en zonneschermen");
    assert.equal(L.lijstKopVan(L.lampenUit({ zonneschermen: ["cover.x"] })), "Zonneschermen");
  });

  it("REGRESSIEWACHT: een kaart zonder zonneschermen houdt dezelfde lijst en kop", () => {
    const zonder = L.lampenUit({ lampen: ["light.a"], rolluiken: ["cover.b"] });
    assert.deepEqual(zonder.map((l) => l.entity), ["light.a", "cover.b"]);
    assert.equal(L.lijstKopVan(zonder), "Lampen en rolluiken");
  });
});

describe("een favoriet", () => {
  it("heeft een vinkje Zonneschermen in, los van de rolluiken", () => {
    const leeg = { favoriet: true, lampen: [], helderheden: {} };
    const v = L.favorietVinkjes(leeg, LAMPEN, buiten);
    assert.ok(v.some((x) => x.sleutel === "zonneschermenIn" && x.tekst === "2 zonneschermen"));
    assert.equal(v.find((x) => x.sleutel === "rolluikenDicht").tekst, "1 rolluik");
    const aan = L.metVinkje(leeg, LAMPEN, buiten, "zonneschermenIn", true);
    assert.deepEqual(aan.helderheden, { "cover.scherm": 0, "cover.scherm2": 0 });
    assert.ok(L.favorietVinkjes(aan, LAMPEN, buiten).find((x) => x.sleutel === "zonneschermenIn").aan);
    assert.deepEqual(L.metVinkje(aan, LAMPEN, buiten, "zonneschermenIn", false).lampen, []);
  });

  it("REGRESSIEWACHT: Rolluiken dicht laat de zonneschermen met rust", () => {
    const dicht = L.metVinkje({ favoriet: true, lampen: [], helderheden: {} }, LAMPEN, buiten, "rolluikenDicht", true);
    assert.deepEqual(dicht.lampen, ["cover.rolluik"]);
  });
});

describe("het voorbeeld", () => {
  it("laat een zonnescherm met rust: het kent de windgrens niet", () => {
    const states = { "cover.scherm": { state: "closed" }, "cover.rolluik": { state: "closed" } };
    const doelen = L.voorbeeldDoelen(["cover.scherm", "cover.rolluik"], { "cover.scherm": 100, "cover.rolluik": 100 }, () => false, states, ["cover.scherm"]);
    assert.deepEqual(doelen, { "cover.rolluik": null });
  });

  it("REGRESSIEWACHT: zonder lijst zonneschermen als voorheen", () => {
    const states = { "cover.rolluik": { state: "closed" } };
    assert.deepEqual(L.voorbeeldDoelen(["cover.rolluik"], { "cover.rolluik": 40 }, () => true, states), { "cover.rolluik": 40 });
  });
});
