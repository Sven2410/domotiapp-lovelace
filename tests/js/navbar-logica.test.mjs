/**
 * De navbalk: wat in de balk past en wat achter "Meer" valt.
 *
 * NIEUW GEDRAG: `src/cards/navbar-logica.js` bestond niet vóór deze ronde. Er
 * was geen navigatiekaart in de familie.
 *
 * Wat hier getoetst wordt is het rekenwerk dat op een telefoon stilletjes
 * misgaat en er op een breed scherm prima uitziet:
 *
 * - De meer-knop is zelf ook een knop en neemt een plek in de balk in. Bij
 *   "toon er vier" en vijf knoppen worden het er drie plus de meer-knop, niet
 *   vier plus de meer-knop -- anders staan er vijf dingen in een balk die er
 *   vier breed is en vallen ze over elkaar.
 * - Past alles, dan is er geen meer-knop. Een menu met niets erin is een knop
 *   die niets doet.
 * - Een pad is een view, een pop-up of een adres buiten Home Assistant, en alle
 *   drie horen te werken zonder dat iemand een keuzelijst invult.
 * - Een half ingevulde knop verdwijnt niet uit de editor, maar een lege plek
 *   komt ook niet op de kaart.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  BALK_MAX,
  BALK_MIN,
  BALK_STANDAARD,
  ITEMS_MAX,
  actieVoor,
  asItem,
  gevuld,
  itemsVan,
  klemBalk,
  verdeel,
} from "../../src/cards/navbar-logica.js";

/** n knoppen, genummerd, zodat de volgorde in een assert te lezen is. */
const knoppen = (n) =>
  Array.from({ length: n }, (_, i) => ({ name: `k${i}`, icon: "house", path: `/p${i}` }));

const namen = (lijst) => lijst.map((i) => i.name);

describe("het aantal in de balk", () => {
  it("houdt zich aan de grenzen", () => {
    assert.equal(klemBalk(1), BALK_MIN);
    assert.equal(klemBalk(99), BALK_MAX);
    assert.equal(klemBalk(4), 4);
  });

  it("valt terug op de standaard bij onzin", () => {
    for (const onzin of [undefined, null, "", "veel", NaN, {}]) {
      assert.equal(klemBalk(onzin), BALK_STANDAARD);
    }
  });

  it("rondt een half getal af in plaats van het te laten staan", () => {
    assert.equal(klemBalk(3.4), 3);
    assert.equal(klemBalk("5"), 5);
  });
});

describe("verdelen over balk en meer-menu", () => {
  it("zet alles in de balk als het past, en maakt dan géén meer-knop", () => {
    const uit = verdeel(knoppen(4), 4);
    assert.equal(uit.balk.length, 4);
    assert.deepEqual(uit.meer, []);
    assert.equal(uit.heeftMeer, false);
  });

  it("rekent de meer-knop mee als een plek in de balk", () => {
    // Vijf knoppen bij "toon er vier": drie in de balk, twee erachter.
    const uit = verdeel(knoppen(5), 4);
    assert.deepEqual(namen(uit.balk), ["k0", "k1", "k2"]);
    assert.deepEqual(namen(uit.meer), ["k3", "k4"]);
    assert.equal(uit.heeftMeer, true);
    assert.equal(uit.balk.length + 1, 4, "balk plus meer-knop is precies het maximum");
  });

  it("houdt de volgorde aan zoals hij in de config staat", () => {
    const uit = verdeel(knoppen(9), 3);
    assert.deepEqual(namen(uit.balk), ["k0", "k1"]);
    assert.deepEqual(namen(uit.meer), ["k2", "k3", "k4", "k5", "k6", "k7", "k8"]);
  });

  it("houdt bij het kleinste aantal nog één knop in de balk over", () => {
    const uit = verdeel(knoppen(6), BALK_MIN);
    assert.equal(uit.balk.length, 1);
    assert.equal(uit.meer.length, 5);
  });

  it("laat lege plekken buiten de kaart", () => {
    const uit = verdeel([...knoppen(2), { name: "", icon: "", path: "" }], 4);
    assert.equal(uit.balk.length, 2);
    assert.equal(uit.heeftMeer, false);
  });

  it("valt niet om op een lege of ontbrekende lijst", () => {
    for (const leeg of [[], null, undefined]) {
      const uit = verdeel(leeg, 4);
      assert.deepEqual(uit, { balk: [], meer: [], heeftMeer: false });
    }
  });
});

describe("een knop uit de config", () => {
  it("leest een string als een kaal pad", () => {
    assert.deepEqual(asItem("/lovelace/keuken"), {
      name: "",
      icon: "",
      path: "/lovelace/keuken",
    });
  });

  it("neemt de spelling van Home Assistant en van de HACS-navbar over", () => {
    assert.equal(asItem({ url: "/a" }).path, "/a");
    assert.equal(asItem({ navigation_path: "/b" }).path, "/b");
    // `path` wint, want dat is de onze.
    assert.equal(asItem({ path: "/c", url: "/a" }).path, "/c");
  });

  it("maakt van rommel lege velden in plaats van undefined", () => {
    assert.deepEqual(asItem({ name: 42, icon: null }), { name: "", icon: "", path: "" });
    assert.deepEqual(asItem(null), { name: "", icon: "", path: "" });
  });

  it("noemt een knop gevuld zodra er iets in staat", () => {
    assert.equal(gevuld({ name: "Hal", icon: "", path: "" }), true);
    assert.equal(gevuld({ name: "", icon: "house", path: "" }), true);
    assert.equal(gevuld({ name: "", icon: "", path: "/x" }), true);
    assert.equal(gevuld({ name: "  ", icon: "", path: "" }), false);
    assert.equal(gevuld(null), false);
  });

  it("kapt een onbeheersbaar lange lijst af", () => {
    const uit = itemsVan({ items: knoppen(50) });
    assert.equal(uit.length, ITEMS_MAX);
  });

  it("levert een lege lijst als er geen items zijn", () => {
    for (const config of [{}, { items: null }, { items: "geen lijst" }, null]) {
      assert.deepEqual(itemsVan(config), []);
    }
  });
});

describe("wat een tik doet", () => {
  it("navigeert naar een view op dit dashboard", () => {
    assert.deepEqual(actieVoor("/lovelace/keuken"), {
      action: "navigate",
      navigation_path: "/lovelace/keuken",
    });
  });

  it("navigeert ook naar een pop-up van bubble-card", () => {
    assert.deepEqual(actieVoor("#keuken"), {
      action: "navigate",
      navigation_path: "#keuken",
    });
  });

  it("opent een adres buiten Home Assistant als url", () => {
    assert.deepEqual(actieVoor("https://domoti.app"), {
      action: "url",
      url_path: "https://domoti.app",
    });
    assert.equal(actieVoor("mailto:sven@example.com").action, "url");
  });

  it("doet niets bij een leeg pad, en meldt dat als zodanig", () => {
    for (const leeg of ["", "   ", null, undefined]) {
      assert.deepEqual(actieVoor(leeg), { action: "none" });
    }
  });
});
