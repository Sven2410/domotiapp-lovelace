/**
 * De indeling van een kaart binnen een tabblad — NIEUW GEDRAG.
 *
 * Zie de kop van `src/cards/tab-indeling.js`: dit is het rekenwerk achter het
 * tabblad "Indeling" van de kaartdialoog, dat tot nu toe een getal wegschreef
 * dat niemand las.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { KOLOMMEN, indelingVoorKaart, pasIndelingToe } from "../../src/cards/tab-indeling.js";

describe("indelingVoorKaart — NIEUW GEDRAG", () => {
  it("zonder keuze staat een kaart op de hele breedte, net als eerst", () => {
    assert.deepEqual(indelingVoorKaart(undefined), { gridColumn: `span ${KOLOMMEN}` });
    assert.deepEqual(indelingVoorKaart({}), { gridColumn: `span ${KOLOMMEN}` });
  });

  it("'full' is hetzelfde als de hele breedte", () => {
    assert.deepEqual(indelingVoorKaart({ columns: "full" }), { gridColumn: `span ${KOLOMMEN}` });
  });

  it("een halve tab is zes van de twaalf kolommen", () => {
    assert.equal(indelingVoorKaart({ columns: 6 }).gridColumn, "span 6");
  });

  it("klemt een onmogelijk aantal kolommen binnen het raster", () => {
    assert.equal(indelingVoorKaart({ columns: 0 }).gridColumn, "span 1");
    assert.equal(indelingVoorKaart({ columns: -3 }).gridColumn, "span 1");
    assert.equal(indelingVoorKaart({ columns: 99 }).gridColumn, `span ${KOLOMMEN}`);
  });

  it("valt terug op de hele breedte bij onzin", () => {
    assert.equal(indelingVoorKaart({ columns: "breed" }).gridColumn, `span ${KOLOMMEN}`);
    assert.equal(indelingVoorKaart({ columns: null }).gridColumn, `span ${KOLOMMEN}`);
  });

  it("een gekozen aantal rijen wordt de hoogte van HA's raster", () => {
    // 56px per rij, 8px ertussen — zie valkuil 8.
    assert.equal(indelingVoorKaart({ rows: 1 }).height, "56px");
    assert.equal(indelingVoorKaart({ rows: 2 }).height, "120px");
    assert.equal(indelingVoorKaart({ rows: 3 }).height, "184px");
    assert.equal(indelingVoorKaart({ rows: 4 }).height, "248px");
  });

  it("'auto' geeft GEEN vaste hoogte — anders steekt een groeikaart eruit", () => {
    assert.equal(indelingVoorKaart({ rows: "auto" }).height, undefined);
    assert.equal(indelingVoorKaart({ columns: 6, rows: "auto" }).height, undefined);
  });

  it("laat een onzinnig rijgetal met rust", () => {
    assert.equal(indelingVoorKaart({ rows: 0 }).height, undefined);
    assert.equal(indelingVoorKaart({ rows: "twee" }).height, undefined);
  });
});

describe("pasIndelingToe — NIEUW GEDRAG", () => {
  const nepElement = () => ({ style: {} });

  it("zet de plek in het raster op het element", () => {
    const el = nepElement();
    pasIndelingToe(el, { columns: 4, rows: 2 });
    assert.equal(el.style.gridColumn, "span 4");
    assert.equal(el.style.height, "120px");
  });

  it("maakt een vaste hoogte weer leeg als die is weggehaald", () => {
    const el = nepElement();
    pasIndelingToe(el, { rows: 2 });
    pasIndelingToe(el, { rows: "auto" });
    assert.equal(el.style.height, "");
  });

  it("valt niet over een element dat er niet is", () => {
    assert.doesNotThrow(() => pasIndelingToe(null, { columns: 3 }));
    assert.doesNotThrow(() => pasIndelingToe({}, { columns: 3 }));
  });
});
