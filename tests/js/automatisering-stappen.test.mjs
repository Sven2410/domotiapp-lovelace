/**
 * Een favoriet met stappen: na een tijd nog iets aan of uit (0.122.0).
 *
 * NIEUW GEDRAG: op 0.121.0 bestaan `stappenVan`, `stapNa`, `nieuweStap`, `stapTekst` en `favorietOnder` niet, en stuurt
 * `favorietNaarServer` geen `daarna` mee. Het voorbeeld is Slapen van de eigenaar: beneden uit en de overloop aan, en tien
 * minuten later de overloop weer uit.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as L from "../../src/cards/automatisering-logica.js";

const SLAPEN = {
  id: "f1",
  favoriet: true,
  naam: "Slapen",
  icoon: "sleep",
  lampen: ["light.woonkamer", "light.overloop"],
  helderheden: { "light.woonkamer": 0, "light.overloop": 40 },
  daarna: [{ na: 10, lampen: ["light.overloop"], helderheden: { "light.overloop": 0 } }],
};

describe("de stappen van een favoriet", () => {
  it("zijn de tik zelf, en wat daarna komt", () => {
    const [tik, later] = L.stappenVan(SLAPEN);
    assert.deepEqual(tik, { lampen: SLAPEN.lampen, helderheden: SLAPEN.helderheden });
    assert.deepEqual(later, SLAPEN.daarna[0]);
  });

  it("is er één zonder daarna — REGRESSIEWACHT", () => {
    assert.equal(L.stappenVan({ ...SLAPEN, daarna: undefined }).length, 1);
  });

  it("begint een nieuwe stap met uit wat de vorige aan zette", () => {
    assert.deepEqual(L.nieuweStap(L.stappenVan(SLAPEN)[0]), {
      na: 10,
      lampen: ["light.overloop"],
      helderheden: { "light.overloop": 0 },
    });
    assert.deepEqual(L.nieuweStap(undefined), { na: 10, lampen: [], helderheden: {} });
  });

  it("zet de stapper op vaste stappen, binnen de grenzen", () => {
    assert.equal(L.stapNa(10, 1), 15);
    assert.equal(L.stapNa(10, -1), 5);
    assert.equal(L.stapNa(7, 1), 10);
    assert.equal(L.stapNa(7, -1), 5);
    assert.equal(L.stapNa(1, -1), 1);
    assert.equal(L.stapNa(1440, 1), 1440);
  });

  it("zegt wanneer en wat", () => {
    const [tik, later] = L.stappenVan(SLAPEN);
    assert.equal(L.stapTekst(tik, true), "Meteen · aan en uit");
    assert.equal(L.stapTekst(later), "Na 10 min · uit");
    assert.equal(L.stapTekst({ na: 90, lampen: ["cover.raam"], helderheden: { "cover.raam": 0 } }), "Na 1 uur 30 min · dicht");
    assert.equal(L.stapTekst({ na: 60, lampen: ["light.a"], helderheden: {} }), "Na 1 uur · aan");
  });

  it("noemt in de lijst ook wat er later komt", () => {
    const lampen = [{ entity: "light.woonkamer", naam: "Woonkamer" }, { entity: "light.overloop", naam: "Overloop" }];
    assert.equal(L.favorietOnder(SLAPEN, lampen), "Woonkamer, Overloop · na 10 min uit");
    assert.equal(L.favorietOnder({ ...SLAPEN, daarna: [] }, lampen), "Woonkamer, Overloop");
  });
});

describe("naar de server", () => {
  it("stuurt de stappen mee met hun na", () => {
    const uit = L.favorietNaarServer(SLAPEN);
    assert.deepEqual(uit, {
      id: "f1",
      naam: "Slapen",
      icoon: "sleep",
      lampen: SLAPEN.lampen,
      helderheden: SLAPEN.helderheden,
      daarna: [{ na: 10, lampen: ["light.overloop"], helderheden: { "light.overloop": 0 } }],
    });
  });

  it("laat daarna weg zonder stappen — REGRESSIEWACHT", () => {
    assert.equal("daarna" in L.favorietNaarServer({ ...SLAPEN, daarna: [] }), false);
  });

  it("geeft een lamp zonder schuif op aan geen helderheid, ook in een stap", () => {
    const fav = { ...SLAPEN, daarna: [{ na: 5, lampen: ["light.aanuit"], helderheden: { "light.aanuit": 100 } }] };
    const uit = L.favorietNaarServer(fav, (id) => id !== "light.aanuit");
    assert.deepEqual(uit.daarna[0].helderheden, {});
  });
});

describe("nakijken", () => {
  it("zegt welke stap nog niet kan", () => {
    const fav = { ...SLAPEN, daarna: [{ na: 10, lampen: [], helderheden: {} }] };
    assert.equal(L.waaromNiet(fav), "Stap 2: Kies minstens één lamp.");
    assert.equal(L.waaromNiet(SLAPEN), null);
  });

  it("zegt het zonder stapnummer bij één stap — REGRESSIEWACHT", () => {
    assert.equal(L.waaromNiet({ ...SLAPEN, lampen: [], daarna: [] }), "Kies minstens één lamp.");
  });
});
