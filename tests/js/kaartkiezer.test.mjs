/**
 * De kaartkiezer in de tabbladeneditor.
 *
 * NIEUW GEDRAG: `src/editor/kaartkiezer.js` bestond niet vóór deze ronde. Op de
 * code van ervoor faalt dit bestand met ERR_MODULE_NOT_FOUND; die uitvoer staat
 * in docs/feedback-26-augustus/RAPPORT.md.
 *
 * Wat hier getoetst wordt is het rekenwerk, niet het scherm: welke kaarten er
 * in de lijst komen, in welke volgorde, wat het zoekveld overhoudt, en wat er
 * uit de knop komt als je een type kiest. De lijst zelf komt uit
 * `window.customCards`, en dat is een globale die in een Node-test gewoon te
 * zetten is -- precies daarom staat dit stuk los van de editor.
 */

import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  beginConfig,
  filterSoorten,
  heeftKaartEditor,
  kaartsoorten,
} from "../../src/editor/kaartkiezer.js";

/** Een minimale `window`, want dit bestand leest er twee dingen uit. */
function nepWindow(customCards, extra = {}) {
  globalThis.window = { customCards, ...extra };
  globalThis.customElements = extra.customElements ?? { get: () => undefined };
}

beforeEach(() => nepWindow([]));
afterEach(() => {
  delete globalThis.window;
  delete globalThis.customElements;
});

describe("kaartsoorten", () => {
  it("zet de kaarten van DomotiApp bovenaan, dan de andere custom kaarten, dan de kern", () => {
    nepWindow([
      { type: "bubble-card", name: "Bubble Card" },
      { type: "domotiapp-tabs-card", name: "DomotiApp Tabbladen" },
      { type: "mushroom-light-card", name: "Mushroom Light" },
    ]);
    const namen = kaartsoorten().map((s) => s.type);
    assert.equal(namen[0], "custom:domotiapp-tabs-card");
    assert.deepEqual(namen.slice(1, 3), ["custom:bubble-card", "custom:mushroom-light-card"]);
    // En daarna de ingebouwde types, zonder voorvoegsel.
    assert.equal(namen[3], "tile");
    assert.ok(namen.includes("entities"));
    assert.ok(namen.includes("markdown"));
  });

  it("zet er custom: voor, want zo heet een custom kaart in een config", () => {
    nepWindow([{ type: "bubble-card", name: "Bubble Card" }]);
    assert.equal(kaartsoorten()[0].type, "custom:bubble-card");
  });

  it("valt niet om zonder customCards", () => {
    nepWindow(undefined);
    const soorten = kaartsoorten();
    assert.ok(soorten.length > 10);
    assert.ok(soorten.every((s) => !s.eigen));
  });

  it("slaat rommel in customCards over", () => {
    nepWindow([null, { naam: "geen type" }, { type: 42 }, { type: "goed-card", name: "Goed" }]);
    const custom = kaartsoorten().filter((s) => s.eigen);
    assert.deepEqual(
      custom.map((s) => s.type),
      ["custom:goed-card"],
    );
  });

  it("valt terug op het type als er geen naam is", () => {
    nepWindow([{ type: "naamloos-card" }]);
    assert.equal(kaartsoorten()[0].naam, "naamloos-card");
  });
});

describe("filterSoorten", () => {
  const soorten = [
    { naam: "DomotiApp Vaatwasser", type: "custom:domotiapp-dishwasher-card", uitleg: "Status en programma" },
    { naam: "Tegel", type: "tile", uitleg: "" },
    { naam: "Tekst (Markdown)", type: "markdown", uitleg: "" },
  ];

  it("geeft alles terug bij een leeg zoekveld", () => {
    assert.equal(filterSoorten(soorten, "").length, 3);
    assert.equal(filterSoorten(soorten, "   ").length, 3);
    assert.equal(filterSoorten(soorten, null).length, 3);
  });

  it("zoekt op naam, op type en op omschrijving", () => {
    assert.deepEqual(filterSoorten(soorten, "vaatwas").map((s) => s.type), [
      "custom:domotiapp-dishwasher-card",
    ]);
    assert.deepEqual(filterSoorten(soorten, "markdown").map((s) => s.naam), ["Tekst (Markdown)"]);
    assert.deepEqual(filterSoorten(soorten, "programma").map((s) => s.type), [
      "custom:domotiapp-dishwasher-card",
    ]);
  });

  it("trekt zich niets aan van hoofdletters", () => {
    assert.equal(filterSoorten(soorten, "TEGEL").length, 1);
  });

  it("geeft een lege lijst als er niets past", () => {
    assert.deepEqual(filterSoorten(soorten, "vliegtuig"), []);
  });
});

describe("beginConfig", () => {
  it("geeft een kale config als de kaartklasse er niet is", async () => {
    assert.deepEqual(await beginConfig("tile", {}), { type: "tile" });
  });

  it("gebruikt getStubConfig van de kaart als die er is", async () => {
    const klasse = {
      getStubConfig: (hass, entiteiten) => ({ entity: entiteiten[0] }),
    };
    nepWindow([], { customElements: { get: (tag) => (tag === "hui-tile-card" ? klasse : undefined) } });
    const uit = await beginConfig("tile", { states: { "light.keuken": {} } });
    assert.deepEqual(uit, { entity: "light.keuken", type: "tile" });
  });

  it("zoekt een custom kaart op zijn eigen tagnaam", async () => {
    const klasse = { getStubConfig: () => ({ tabs: [] }) };
    nepWindow([], {
      customElements: { get: (tag) => (tag === "domotiapp-tabs-card" ? klasse : undefined) },
    });
    assert.deepEqual(await beginConfig("custom:domotiapp-tabs-card", {}), {
      tabs: [],
      type: "custom:domotiapp-tabs-card",
    });
  });

  it("laat het type altijd staan, ook als de stub er zelf een zet", async () => {
    // Een kaart die in zijn stub een ANDER type teruggeeft zou de keuze van de
    // gebruiker overschrijven. Het gekozen type wint.
    const klasse = { getStubConfig: () => ({ type: "iets-anders", entity: "light.a" }) };
    nepWindow([], { customElements: { get: () => klasse } });
    const uit = await beginConfig("tile", {});
    assert.equal(uit.type, "tile");
  });

  it("overleeft een getStubConfig die gooit", async () => {
    const klasse = {
      getStubConfig: () => {
        throw new Error("kapot");
      },
    };
    nepWindow([], { customElements: { get: () => klasse } });
    assert.deepEqual(await beginConfig("tile", {}), { type: "tile" });
  });

  it("valt niet om zonder hass", async () => {
    assert.deepEqual(await beginConfig("markdown", undefined), { type: "markdown" });
  });
});

describe("heeftKaartEditor", () => {
  it("meldt of de editor van Home Assistant geladen is", () => {
    nepWindow([], { customElements: { get: (tag) => (tag === "hui-card-element-editor" ? {} : undefined) } });
    assert.equal(heeftKaartEditor(), true);
    nepWindow([], { customElements: { get: () => undefined } });
    assert.equal(heeftKaartEditor(), false);
  });
});
