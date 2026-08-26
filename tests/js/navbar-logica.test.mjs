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
  SUB_MAX,
  VOORAF,
  actieVoor,
  asItem,
  gevuld,
  heeftSub,
  itemsVan,
  klemBalk,
  subVan,
  verdeel,
  voegSubToe,
  voorafOp,
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
      // Sinds 27 augustus 2026 mag een knop een hele actieconfig dragen, voor
      // knoppen die iets DOEN in plaats van ergens heen te gaan.
      action: null,
      // Sinds 26 augustus 2026 draagt elke knop een (meestal lege) lijst
      // subknoppen mee.
      items: [],
    });
  });

  it("neemt de spelling van Home Assistant en van de HACS-navbar over", () => {
    assert.equal(asItem({ url: "/a" }).path, "/a");
    assert.equal(asItem({ navigation_path: "/b" }).path, "/b");
    // `path` wint, want dat is de onze.
    assert.equal(asItem({ path: "/c", url: "/a" }).path, "/c");
  });

  it("maakt van rommel lege velden in plaats van undefined", () => {
    assert.deepEqual(asItem({ name: 42, icon: null }), {
      name: "",
      icon: "",
      path: "",
      action: null,
      items: [],
    });
    assert.deepEqual(asItem(null), { name: "", icon: "", path: "", action: null, items: [] });
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

/**
 * Subknoppen: een knop die een menu opent boven zichzelf.
 *
 * NIEUW GEDRAG (26 augustus 2026). De eigenaar miste "extra navigatie knoppen
 * die boven de geklikte icon openen". Wat hier bewaakt wordt is de grens
 * eromheen: één laag diep, een dak op het aantal, en een half ingevulde
 * subknop die wel in de editor staat en niet op de kaart.
 */
describe("subknoppen", () => {
  it("leest ze uit de config", () => {
    const item = asItem({
      name: "Licht",
      icon: "bulb",
      items: [
        { name: "Woonkamer", path: "/lovelace/woonkamer" },
        { name: "Keuken", path: "/lovelace/keuken" },
      ],
    });
    assert.equal(item.items.length, 2);
    assert.equal(heeftSub(item), true);
    assert.deepEqual(namen(subVan(item)), ["Woonkamer", "Keuken"]);
  });

  it("gaat maar EEN laag diep", () => {
    // Een menu in een menu in een balk van vijf knoppen is geen navigatie meer.
    const item = asItem({
      name: "Licht",
      items: [{ name: "Boven", items: [{ name: "Zolder", path: "/zolder" }] }],
    });
    assert.deepEqual(item.items[0].items, []);
  });

  it("kapt af op SUB_MAX", () => {
    const veel = Array.from({ length: SUB_MAX + 5 }, (_, i) => ({ name: `s${i}`, path: `/s${i}` }));
    assert.equal(asItem({ name: "Licht", items: veel }).items.length, SUB_MAX);
  });

  it("laat een lege subknop niet op de kaart komen", () => {
    const item = asItem({
      name: "Licht",
      items: [{ name: "Woonkamer", path: "/w" }, {}, { name: "", icon: "", path: "" }],
    });
    // In de editor staan er drie -- je bent er een aan het maken.
    assert.equal(item.items.length, 3);
    // Op de kaart staat er een.
    assert.equal(subVan(item).length, 1);
  });

  it("noemt een knop zonder subknoppen ook zo", () => {
    assert.equal(heeftSub(asItem({ name: "Thuis", path: "/" })), false);
    assert.equal(heeftSub(asItem("/alleen-een-pad")), false);
    assert.equal(heeftSub(null), false);
    assert.deepEqual(subVan(undefined), []);
  });

  it("laat rommel in items geen fout worden", () => {
    assert.deepEqual(asItem({ name: "x", items: "geen lijst" }).items, []);
    assert.deepEqual(asItem({ name: "x", items: [null, 3] }).items.length, 2);
    assert.deepEqual(subVan(asItem({ name: "x", items: [null, 3] })), []);
  });

  it("draagt ze mee door itemsVan heen", () => {
    const uit = itemsVan({ items: [{ name: "Licht", items: [{ name: "Keuken", path: "/k" }] }] });
    assert.equal(subVan(uit[0]).length, 1);
  });
});

/**
 * De kant-en-klare subknoppen.
 *
 * Ze staan hier en niet in de editor omdat het data is: een naam, een icoon en
 * wat de knop doet. Een typefout in `homeassistant.restart` merk je anders pas
 * als je erop drukt -- en dan is het te laat om er nog achter te komen dat er
 * niets gebeurt.
 */
describe("kant-en-klare subknoppen", () => {
  it("levert DomotiTech met het logo en het adres erop", () => {
    const knop = voorafOp("domotitech").maak();
    assert.equal(knop.icon, "domotitech");
    assert.equal(knop.path, "https://domotitech.nl");
    // En hij komt er als url uit, niet als navigatie binnen het dashboard.
    assert.deepEqual(actieVoor(knop), { action: "url", url_path: "https://domotitech.nl" });
  });

  it("laat Herstart de dienst aanroepen, met een vraag ervoor", () => {
    const knop = voorafOp("herstart").maak();
    const actie = actieVoor(knop);
    assert.equal(actie.action, "perform-action");
    assert.equal(actie.perform_action, "homeassistant.restart");
    // Zonder bevestiging is dit een knop waar je per ongeluk op drukt.
    assert.ok(actie.confirmation?.text?.length > 0);
  });

  it("geeft elke keer een VERS object", () => {
    // Home Assistant bevriest wat het krijgt. Twee knoppen die hetzelfde object
    // delen zijn twee knoppen die je nooit meer los kunt aanpassen.
    const a = voorafOp("herstart").maak();
    const b = voorafOp("herstart").maak();
    assert.notEqual(a, b);
    assert.notEqual(a.action, b.action);
  });

  it("kent geen id die niet bestaat", () => {
    assert.equal(voorafOp("bestaat-niet"), null);
    assert.ok(VOORAF.length >= 2);
  });

  it("zet een kant-en-klare knop bovenaan en een lege onderaan", () => {
    const lijst = [{ name: "Auto" }, { name: "Sport" }];
    const boven = voegSubToe(lijst, { name: "DomotiTech" }, true);
    assert.equal(boven.plek, 0);
    assert.equal(boven.lijst[0].name, "DomotiTech");
    const onder = voegSubToe(lijst, { name: "Nieuw" }, false);
    assert.equal(onder.plek, 2);
    assert.equal(onder.lijst[2].name, "Nieuw");
    // En de oorspronkelijke lijst blijft met rust gelaten.
    assert.equal(lijst.length, 2);
  });

  it("duwt er niets af als de lijst vol zit", () => {
    const vol = Array.from({ length: SUB_MAX }, (_, i) => ({ name: `k${i}` }));
    const uit = voegSubToe(vol, { name: "erbij" }, true);
    assert.equal(uit.plek, -1);
    assert.equal(uit.lijst.length, SUB_MAX);
    assert.equal(uit.lijst[0].name, "k0");
  });

  it("noemt een knop met alleen een actie gevuld", () => {
    // Anders verdwijnt Herstart uit de balk: hij heeft geen pad, en dat was de
    // enige toets die er stond.
    assert.equal(gevuld({ name: "", icon: "", path: "", action: { action: "toggle" } }), true);
  });

  it("laat een actie winnen van een pad", () => {
    const knop = { path: "/lovelace/a", action: { action: "toggle", entity: "light.x" } };
    assert.deepEqual(actieVoor(knop), { action: "toggle", entity: "light.x" });
  });

  it("blijft een kaal pad accepteren", () => {
    // REGRESSIEWACHT: `actieVoor` werd het eerst met een string aangeroepen.
    assert.deepEqual(actieVoor("/lovelace/keuken"), {
      action: "navigate",
      navigation_path: "/lovelace/keuken",
    });
  });
});
