/**
 * De indeling van een kaart binnen een tabblad — NIEUW GEDRAG.
 *
 * Zie de kop van `src/cards/tab-indeling.js`: dit is het rekenwerk achter het
 * tabblad "Indeling" van de kaartdialoog, dat tot nu toe een getal wegschreef
 * dat niemand las.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  KOLOMMEN,
  grenzenVan,
  indelingVoorKaart,
  pasIndelingToe,
} from "../../src/cards/tab-indeling.js";

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

/**
 * De klem tegen de grenzen van de kaart zelf — NIEUW GEDRAG.
 *
 * Gemeld op 27 augustus 2026 met een schermafdruk waarop zes thermostaten door
 * elkaar heen liepen. Nagemeten op de installatie van de eigenaar: twaalf
 * klimaatkaarten in een tabblad met `{columns: 6, rows: 1}` in hun config, en
 * `layout: "gestapeld"` erbij. Die vorm tekent drie rasterrijen.
 */
describe("indelingVoorKaart — de klem tegen de kaart zelf — NIEUW GEDRAG", () => {
  it("klemt een te laag rijaantal op tot de ondergrens van de kaart", () => {
    // Dit is letterlijk de config van zijn dashboard.
    const uit = indelingVoorKaart({ columns: 6, rows: 1 }, { min_rows: 3, rows: "auto" });
    assert.equal(uit.height, "184px"); // 3 rijen: 3*64-8
    assert.equal(uit.gridColumn, "span 6");
  });

  it("klemt een te hoog rijaantal terug naar de bovengrens", () => {
    const uit = indelingVoorKaart({ rows: 5 }, { max_rows: 1 });
    assert.equal(uit.height, "56px");
  });

  it("laat een rijaantal dat binnen de grenzen valt met rust", () => {
    assert.equal(indelingVoorKaart({ rows: 2 }, { min_rows: 1, max_rows: 4 }).height, "120px");
  });

  it("klemt ook de breedte, want die grenzen bestaan net zo goed", () => {
    assert.equal(indelingVoorKaart({ columns: 2 }, { min_columns: 4 }).gridColumn, "span 4");
    assert.equal(indelingVoorKaart({ columns: 12 }, { max_columns: 6 }).gridColumn, "span 6");
  });

  it("zonder grenzen blijft alles precies zoals het was", () => {
    assert.deepEqual(indelingVoorKaart({ columns: 6, rows: 1 }, null), {
      gridColumn: "span 6",
      height: "56px",
    });
  });

  it("trekt zich niets aan van onzin als grens", () => {
    assert.equal(indelingVoorKaart({ rows: 2 }, { min_rows: "veel", max_rows: null }).height, "120px");
  });

  it("geeft de klem door via pasIndelingToe", () => {
    const el = { style: {} };
    pasIndelingToe(el, { columns: 6, rows: 1 }, { min_rows: 3 });
    assert.equal(el.style.height, "184px");
  });
});

describe("grenzenVan — NIEUW GEDRAG", () => {
  it("leest getGridOptions van het kaartelement in de hui-card", () => {
    const hui = { _element: { getGridOptions: () => ({ min_rows: 3 }) } };
    assert.deepEqual(grenzenVan(hui), { min_rows: 3 });
  });

  it("valt terug op de shadow root als _element er niet is", () => {
    const hui = { shadowRoot: { firstElementChild: { getGridOptions: () => ({ max_rows: 1 }) } } };
    assert.deepEqual(grenzenVan(hui), { max_rows: 1 });
  });

  it("geeft null als het element er nog niet is, zodat de aanroeper wacht", () => {
    assert.equal(grenzenVan(null), null);
    assert.equal(grenzenVan({}), null);
    assert.equal(grenzenVan({ _element: {} }), null);
  });

  it("laat een kaart van iemand anders die gooit de tab niet slopen", () => {
    const hui = { _element: { getGridOptions: () => { throw new Error("boem"); } } };
    assert.equal(grenzenVan(hui), null);
  });
});
