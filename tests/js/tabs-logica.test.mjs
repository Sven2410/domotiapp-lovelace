/**
 * Tabbladen, en de keuze die bij het APPARAAT hoort.
 *
 * NIEUW GEDRAG: `src/cards/tabs-logica.js` bestond niet vóór deze ronde.
 *
 * De eis die de vorm bepaalt: schakelt de eigenaar op zijn telefoon van Woning
 * naar Weer, dan mag de tablet in de gang op Woning blijven staan -- en er mag
 * niets voor ingesteld hoeven worden. Dat betekent `localStorage` met een
 * sleutel die de kaart zelf afleidt, en dat is precies wat hier getoetst wordt:
 *
 * - Twee tabbladenkaarten op één dashboard mogen elkaars keuze niet
 *   overschrijven, en dezelfde kaart moet zichzelf terugvinden na een
 *   herlading.
 * - Een onthouden keuze die niet meer bestaat -- een tab die weg is -- mag geen
 *   lege kaart opleveren.
 * - `localStorage` gooit in een privé-venster. Dat is geen fout in de kaart.
 * - De configvorm van `simple-tabs` (`title`, `card`) moet blijven werken naast
 *   die van ons (`name`, `cards`), want zijn bestaande config wordt overgezet.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  SLEUTEL_VOORVOEGSEL,
  TABS_MAX,
  asTab,
  gevuld,
  leesKeuze,
  openTab,
  schrijfKeuze,
  sleutelVoor,
  standaardTab,
  tabsVan,
} from "../../src/cards/tabs-logica.js";

/** Een nagemaakte localStorage. */
const opslag = (start = {}) => {
  const map = new Map(Object.entries(start));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    _map: map,
  };
};

/** Een opslag die gooit, zoals een privé-venster doet. */
const stukkeOpslag = () => ({
  getItem() { throw new Error("SecurityError"); },
  setItem() { throw new Error("SecurityError"); },
});

const TABS = [
  { name: "Woning", icon: "house", cards: [{ type: "vertical-stack", cards: [] }] },
  { name: "Weer", icon: "cloudSun", cards: [{ type: "weather-forecast" }] },
];

describe("een tab uit de config", () => {
  it("neemt de vorm van simple-tabs over", () => {
    // Dit is letterlijk wat er in zijn dashboard staat. `card` (enkelvoud) komt
    // er als lijst van één uit; die spelling moet blijven werken.
    const t = asTab({ title: "Woning", icon: "mdi:home-thermometer-outline", card: { type: "vertical-stack", cards: [1] } });
    assert.equal(t.name, "Woning");
    assert.equal(t.icon, "mdi:home-thermometer-outline");
    assert.deepEqual(t.cards, [{ type: "vertical-stack", cards: [1] }]);
  });

  it("neemt ook onze eigen vorm", () => {
    assert.equal(asTab({ name: "Weer" }).name, "Weer");
  });

  it("laat `name` winnen van `title` als er allebei staat", () => {
    assert.equal(asTab({ name: "Ons", title: "Hun" }).name, "Ons");
  });

  it("houdt een lijst kaarten een lijst", () => {
    // NIEUW GEDRAG (26 augustus 2026). Hiervoor werd een lijst tot één
    // `vertical-stack` samengevouwen, en dan kon je er in de editor geen kaart
    // meer bij zetten zonder eerst zelf een stack te maken.
    const t = asTab({ name: "Meer", cards: [{ type: "a" }, { type: "b" }] });
    assert.deepEqual(t.cards, [{ type: "a" }, { type: "b" }]);
  });

  it("laat een lijst van één een lijst van één", () => {
    assert.deepEqual(asTab({ cards: [{ type: "a" }] }).cards, [{ type: "a" }]);
  });

  it("laat `cards` winnen van `card` als er allebei staat", () => {
    // Anders zou een config die in deze editor is bijgewerkt terugvallen op de
    // kaart die er vóór het bijwerken in zat.
    const t = asTab({ card: { type: "oud" }, cards: [{ type: "nieuw" }] });
    assert.deepEqual(t.cards, [{ type: "nieuw" }]);
  });

  it("gooit rommel uit de lijst", () => {
    assert.deepEqual(asTab({ cards: [null, "tekst", 3, { type: "a" }] }).cards, [{ type: "a" }]);
  });

  it("maakt van rommel lege velden in plaats van undefined", () => {
    assert.deepEqual(asTab(null), { name: "", icon: "", cards: [] });
    assert.deepEqual(asTab({ name: 3, icon: [] }), { name: "", icon: "", cards: [] });
  });

  it("noemt een tab gevuld zodra er iets in staat", () => {
    assert.equal(gevuld({ name: "Woning" }), true);
    assert.equal(gevuld({ icon: "house" }), true);
    assert.equal(gevuld({ cards: [{ type: "a" }] }), true);
    assert.equal(gevuld({ name: "  ", icon: "", cards: [] }), false);
    assert.equal(gevuld(null), false);
  });

  it("kapt een onbeheersbaar lange lijst af en gooit lege plekken eruit", () => {
    const veel = Array.from({ length: 20 }, (_, i) => ({ name: `T${i}` }));
    assert.equal(tabsVan({ tabs: veel }).length, TABS_MAX);
    assert.equal(tabsVan({ tabs: [{ name: "A" }, {}, { name: "B" }] }).length, 2);
  });

  it("levert een lege lijst als er geen tabs zijn", () => {
    for (const c of [{}, { tabs: null }, { tabs: "geen lijst" }, null]) {
      assert.deepEqual(tabsVan(c), []);
    }
  });
});

describe("welk tabblad standaard openstaat", () => {
  it("telt vanaf 1, zoals een mens het zegt", () => {
    assert.equal(standaardTab({ default_tab: 1 }, 3), 0);
    assert.equal(standaardTab({ default_tab: 2 }, 3), 1);
    assert.equal(standaardTab({ default_tab: 3 }, 3), 2);
  });

  it("valt terug op de eerste bij onzin of buiten bereik", () => {
    for (const n of [0, -1, 4, "twee", null, undefined, NaN]) {
      assert.equal(standaardTab({ default_tab: n }, 3), 0);
    }
  });

  it("blijft 0 als er geen tabs zijn", () => {
    assert.equal(standaardTab({ default_tab: 2 }, 0), 0);
  });
});

describe("de sleutel waaronder een apparaat zijn keuze bewaart", () => {
  it("is stabiel voor dezelfde kaart", () => {
    assert.equal(sleutelVoor(TABS), sleutelVoor(TABS.map((t) => ({ ...t }))));
  });

  it("trekt zich niets aan van hoofdletters", () => {
    assert.equal(
      sleutelVoor([{ name: "Woning" }, { name: "Weer" }]),
      sleutelVoor([{ name: "WONING" }, { name: "weer" }])
    );
  });

  it("verschilt tussen twee kaarten met andere tabs", () => {
    // Twee tabbladenkaarten op één dashboard mogen elkaars keuze niet
    // overschrijven.
    assert.notEqual(
      sleutelVoor([{ name: "Woning" }, { name: "Weer" }]),
      sleutelVoor([{ name: "Muziek" }, { name: "Licht" }])
    );
  });

  it("werkt ook zonder namen, op het icoon of de positie", () => {
    const s = sleutelVoor([{ icon: "house" }, {}]);
    assert.ok(s.startsWith(SLEUTEL_VOORVOEGSEL));
    assert.notEqual(s, sleutelVoor([{ icon: "bulb" }, {}]));
  });
});

describe("onthouden en terugvinden", () => {
  it("bewaart en leest de keuze van dit apparaat", () => {
    const o = opslag();
    const s = sleutelVoor(TABS);
    assert.equal(schrijfKeuze(o, s, 1), true);
    assert.equal(leesKeuze(o, s, 2), 1);
  });

  it("geeft null als er nog niets onthouden is", () => {
    assert.equal(leesKeuze(opslag(), sleutelVoor(TABS), 2), null);
  });

  it("vergeet een keuze die niet meer bestaat", () => {
    // De tab is weg; een index van 5 in een kaart met 2 tabs zou een lege kaart
    // opleveren.
    const o = opslag({ [sleutelVoor(TABS)]: "5" });
    assert.equal(leesKeuze(o, sleutelVoor(TABS), 2), null);
  });

  it("negeert rommel in de opslag", () => {
    for (const rommel of ["", "eerste", "1.5", "-1", "{}"]) {
      const o = opslag({ x: rommel });
      assert.equal(leesKeuze(o, "x", 3), null, `"${rommel}" hoort niets op te leveren`);
    }
  });

  it("valt niet om als de browser de opslag dichthoudt", () => {
    // Een privé-venster gooit op localStorage. Dat is geen fout in de kaart.
    const o = stukkeOpslag();
    assert.equal(leesKeuze(o, "x", 3), null);
    assert.equal(schrijfKeuze(o, "x", 1), false);
    assert.equal(openTab({ default_tab: 2 }, TABS, o), 1, "dan geldt de standaard nog steeds");
  });

  it("valt niet om zonder opslag", () => {
    assert.equal(leesKeuze(null, "x", 3), null);
    assert.equal(schrijfKeuze(null, "x", 1), true);
  });
});

describe("welk tabblad er opengaat", () => {
  it("neemt wat dit apparaat onthouden heeft", () => {
    const o = opslag({ [sleutelVoor(TABS)]: "1" });
    assert.equal(openTab({ default_tab: 1 }, TABS, o), 1, "het onthouden wint van de standaard");
  });

  it("neemt de standaard als dit apparaat nog niets weet", () => {
    assert.equal(openTab({ default_tab: 2 }, TABS, opslag()), 1);
  });

  it("houdt twee apparaten uit elkaar", () => {
    // Precies de eis: de telefoon staat op Weer, de tablet blijft op Woning.
    const telefoon = opslag();
    const tablet = opslag();
    schrijfKeuze(telefoon, sleutelVoor(TABS), 1);
    assert.equal(openTab({}, TABS, telefoon), 1);
    assert.equal(openTab({}, TABS, tablet), 0);
  });
});
