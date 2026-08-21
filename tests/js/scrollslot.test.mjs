/**
 * Het scrollslot onder het zoekscherm.
 *
 * NIEUW GEDRAG: `src/scrollslot.js` bestond niet vóór deze ronde.
 *
 * De melding was: "open ik de searchbar vanaf de kaart en ik scroll op een leeg
 * veld, dan zie ik de background dus HA scrollen". De lijsten hadden
 * `overscroll-behavior: contain`, maar de laag zelf scrollt niet -- en dan gaat
 * de beweging naar de pagina eronder.
 *
 * Wat hier vastligt is niet de CSS maar de boekhouding eromheen: wat er bewaard
 * en teruggezet wordt, dat de bezoeker op zijn plek terugkomt, en dat twee
 * schermen elkaars slot niet slopen. Dat laatste is de stille variant: dan
 * scrollt het dashboard daarna nooit meer, zonder een foutmelding.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { zetScrollSlot } from "../../src/scrollslot.js";

/** Een body met een stijl die zich als de echte gedraagt: leeg is "". */
const nepDoc = (stijl = {}) => ({
  body: {
    dataset: {},
    style: { position: "", top: "", left: "", right: "", width: "", overflow: "", ...stijl },
  },
  documentElement: { scrollTop: 0 },
});

const nepWin = (y = 0) => {
  const win = { scrollY: y, gescrold: null };
  win.scrollTo = (x, naar) => {
    win.gescrold = naar;
  };
  return win;
};

describe("zetScrollSlot()", () => {
  it("zet de pagina vast op de plek waar je stond", () => {
    const doc = nepDoc();
    zetScrollSlot(doc, nepWin(840));
    assert.equal(doc.body.style.position, "fixed");
    assert.equal(doc.body.style.top, "-840px");
    assert.equal(doc.body.style.overflow, "hidden");
  });

  it("de sleutel zet alles terug en scrolt je terug", () => {
    const doc = nepDoc();
    const win = nepWin(840);
    const los = zetScrollSlot(doc, win);
    los();
    assert.equal(doc.body.style.position, "");
    assert.equal(doc.body.style.top, "");
    assert.equal(doc.body.style.overflow, "");
    assert.equal(win.gescrold, 840, "zonder terugscrollen springt HA naar boven");
  });

  it("stijlen die er al stonden overleven het", () => {
    const doc = nepDoc({ overflow: "auto", width: "1200px" });
    const los = zetScrollSlot(doc, nepWin());
    los();
    assert.equal(doc.body.style.overflow, "auto");
    assert.equal(doc.body.style.width, "1200px");
  });

  it("twee keer loslaten mag -- sluit() en disconnectedCallback doen het allebei", () => {
    const doc = nepDoc({ overflow: "auto" });
    const win = nepWin(200);
    const los = zetScrollSlot(doc, win);
    los();
    win.gescrold = null;
    los();
    assert.equal(doc.body.style.overflow, "auto");
    assert.equal(win.gescrold, null, "de tweede keer mag niet opnieuw scrollen");
  });

  it("een tweede slot doet niets, en laat het eerste heel", () => {
    // Anders bewaart het tweede scherm `position: fixed` als "oorspronkelijk"
    // en staat het dashboard na het sluiten voorgoed stil.
    const doc = nepDoc({ overflow: "auto" });
    const win = nepWin(300);
    const eerste = zetScrollSlot(doc, win);
    const tweede = zetScrollSlot(doc, win);
    tweede();
    assert.equal(doc.body.style.position, "fixed", "het eerste slot moet blijven staan");
    eerste();
    assert.equal(doc.body.style.position, "");
    assert.equal(doc.body.style.overflow, "auto");
    assert.equal(win.gescrold, 300);
  });

  it("na loslaten kan er opnieuw op slot", () => {
    const doc = nepDoc();
    zetScrollSlot(doc, nepWin(10))();
    zetScrollSlot(doc, nepWin(20));
    assert.equal(doc.body.style.top, "-20px");
  });

  it("zonder body gebeurt er niets, in plaats van een fout", () => {
    assert.doesNotThrow(() => zetScrollSlot({}, nepWin())());
    assert.doesNotThrow(() => zetScrollSlot(undefined, undefined)());
  });
});
