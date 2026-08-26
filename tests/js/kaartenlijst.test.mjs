/**
 * Wat een menukeuze of een sleepbeweging met de kaartenlijst van een tab doet.
 *
 * NIEUW GEDRAG: `src/editor/kaartenlijst.js` bestond niet vóór deze ronde. Op
 * de code van ervoor faalt dit bestand met ERR_MODULE_NOT_FOUND; die uitvoer
 * staat in docs/kaarten-bewerken-als-in-ha/RAPPORT.md.
 *
 * Waarom dit stuk los staat van de rest: het is indexrekenwerk, en dat gaat
 * stilletjes fout. Verplaatsen naar een plek die er niet is, dupliceren van de
 * laatste kaart, een menu dat een pad meestuurt van een kaart die er niet meer
 * is omdat je hem net verwijderd had. Geen van die gevallen valt in een browser
 * te zien vóórdat hij misgaat.
 *
 * Wat hier NIET getoetst wordt: dat er echt gesleept kan worden, en dat het
 * menu van Home Assistant deze gebeurtenissen afvuurt. Dat eerste is een
 * bediening (en die is in de browser gemeten), dat tweede is HA's eigen code.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { naarKlembord, pasToe } from "../../src/editor/kaartenlijst.js";

const kaarten = () => [{ type: "a" }, { type: "b" }, { type: "c" }];
const soorten = (lijst) => lijst.map((k) => k.type);

describe("verplaatsen", () => {
  it("zet een kaart op zijn nieuwe plek", () => {
    assert.deepEqual(soorten(pasToe(kaarten(), "verplaats", { van: 0, naar: 2 })), ["b", "c", "a"]);
    assert.deepEqual(soorten(pasToe(kaarten(), "verplaats", { van: 2, naar: 0 })), ["c", "a", "b"]);
    assert.deepEqual(soorten(pasToe(kaarten(), "verplaats", { van: 1, naar: 2 })), ["a", "c", "b"]);
  });

  it("doet niets als er niets verschuift", () => {
    assert.equal(pasToe(kaarten(), "verplaats", { van: 1, naar: 1 }), null);
  });

  it("weigert een plek die er niet is", () => {
    assert.equal(pasToe(kaarten(), "verplaats", { van: 0, naar: 3 }), null);
    assert.equal(pasToe(kaarten(), "verplaats", { van: -1, naar: 1 }), null);
    assert.equal(pasToe(kaarten(), "verplaats", { van: 5, naar: 0 }), null);
    assert.equal(pasToe(kaarten(), "verplaats", {}), null);
  });

  it("laat de oorspronkelijke lijst met rust", () => {
    const bron = kaarten();
    pasToe(bron, "verplaats", { van: 0, naar: 2 });
    assert.deepEqual(soorten(bron), ["a", "b", "c"]);
  });
});

describe("dupliceren", () => {
  it("zet de kopie meteen achter het origineel", () => {
    assert.deepEqual(soorten(pasToe(kaarten(), "dupliceer", { index: 0 })), ["a", "a", "b", "c"]);
    assert.deepEqual(soorten(pasToe(kaarten(), "dupliceer", { index: 1 })), ["a", "b", "b", "c"]);
  });

  it("kan ook de laatste dupliceren", () => {
    assert.deepEqual(soorten(pasToe(kaarten(), "dupliceer", { index: 2 })), ["a", "b", "c", "c"]);
  });

  it("maakt een ECHTE kopie en geen tweede verwijzing", () => {
    // Home Assistant bevriest wat er langskomt. Twee verwijzingen naar één
    // bevroren config betekent dat de tweede kaart nooit meer los aan te passen
    // is -- en dat merk je pas als je hem probeert te bewerken.
    const uit = pasToe([{ type: "a", opties: { n: 1 } }], "dupliceer", { index: 0 });
    assert.notEqual(uit[0], uit[1]);
    assert.notEqual(uit[0].opties, uit[1].opties);
    assert.deepEqual(uit[0], uit[1]);
  });

  it("doet niets bij een index die er niet is", () => {
    assert.equal(pasToe(kaarten(), "dupliceer", { index: 9 }), null);
    assert.equal(pasToe(kaarten(), "dupliceer", {}), null);
  });
});

describe("verwijderen", () => {
  it("haalt de goede kaart eruit", () => {
    assert.deepEqual(soorten(pasToe(kaarten(), "verwijder", { index: 1 })), ["a", "c"]);
    assert.deepEqual(soorten(pasToe(kaarten(), "verwijder", { index: 2 })), ["a", "b"]);
  });

  it("mag de laatste kaart weghalen", () => {
    assert.deepEqual(pasToe([{ type: "a" }], "verwijder", { index: 0 }), []);
  });

  it("doet niets bij een index die er niet is", () => {
    assert.equal(pasToe(kaarten(), "verwijder", { index: 3 }), null);
    assert.equal(pasToe([], "verwijder", { index: 0 }), null);
  });
});

describe("rasterinstellingen", () => {
  it("voegt toe zonder de rest weg te gooien", () => {
    const uit = pasToe([{ type: "a", grid_options: { columns: 6 } }], "rooster", {
      index: 0,
      rooster: { rows: 2 },
    });
    assert.deepEqual(uit[0].grid_options, { columns: 6, rows: 2 });
    assert.equal(uit[0].type, "a");
  });

  it("overschrijft wat er al stond", () => {
    const uit = pasToe([{ type: "a", grid_options: { columns: 6 } }], "rooster", {
      index: 0,
      rooster: { columns: 12 },
    });
    assert.deepEqual(uit[0].grid_options, { columns: 12 });
  });

  it("doet niets zonder rasterinstellingen", () => {
    assert.equal(pasToe(kaarten(), "rooster", { index: 0 }), null);
  });
});

describe("onbekende acties en rommel", () => {
  it("geeft null bij iets wat we niet kennen", () => {
    assert.equal(pasToe(kaarten(), "dansen", { index: 0 }), null);
  });

  it("valt niet om op een lijst die geen lijst is", () => {
    assert.equal(pasToe(null, "verwijder", { index: 0 }), null);
    assert.equal(pasToe(undefined, "verplaats", { van: 0, naar: 1 }), null);
  });
});

describe("het klembord", () => {
  it("schrijft de config weg onder de sleutel die Home Assistant leest", () => {
    const opslag = {};
    globalThis.sessionStorage = {
      setItem: (k, v) => {
        opslag[k] = v;
      },
    };
    try {
      assert.equal(naarKlembord({ type: "tile", entity: "light.a" }), true);
      assert.deepEqual(JSON.parse(opslag.dashboardCardClipboard), {
        type: "tile",
        entity: "light.a",
      });
    } finally {
      delete globalThis.sessionStorage;
    }
  });

  it("valt niet om als de browser sessionStorage dichthoudt", () => {
    // Een privévenster gooit hier. Dat is geen reden om de editor te laten
    // vallen -- kopiëren lukt dan gewoon niet.
    globalThis.sessionStorage = {
      setItem: () => {
        throw new Error("dicht");
      },
    };
    try {
      assert.equal(naarKlembord({ type: "tile" }), false);
    } finally {
      delete globalThis.sessionStorage;
    }
  });
});
