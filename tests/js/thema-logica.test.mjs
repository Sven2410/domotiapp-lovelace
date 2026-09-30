/**
 * Licht of donker: de beslissing — NIEUW GEDRAG (0.54.0).
 *
 * Gevraagd op 30 september 2026: *"kan je er ook nog een light theme van maken?
 * Nu hebben we een dark theme. En dan als we de integratie toevoegen dat je de
 * optie krijgt of light of dark theme of heb je een andere oplossing?"*
 *
 * De andere oplossing is: meten. De kaart leest aan de tekstkleur van het thema
 * van Home Assistant af of het dashboard licht of donker is, en de keuze bij de
 * integratie wint daarvan. Dit bestand toetst die beslissing; het meten zelf
 * gebeurt in een browser (docs/licht-thema/RAPPORT.md).
 *
 * Pure logica, dus geen browser (CLAUDE.md). Vóór deze ronde bestond
 * src/thema-logica.js niet; de tests die een bestaande functie raken
 * (`lightTone`, `lampKleur`) staan daarom apart onderaan, met `import *`, zodat
 * ze ook tegen de oude code laden en daar falen op wat er gebeurt.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import * as badge from "../../src/badges/badge-logica.js";
import * as ha from "../../src/ha.js";
import {
  GLOBALE,
  LAMP_PLAFOND,
  LICHT_VLAK,
  contrast,
  gemetenThema,
  helderheid,
  instellingUit,
  lampkleurVoor,
  leesKleur,
  themaVoor,
} from "../../src/thema-logica.js";
import { hashUit } from "../../src/verouderd.js";

describe("gemetenThema() — aflezen aan de tekstkleur van het thema", () => {
  it("lichte tekst betekent een donker dashboard", () => {
    assert.equal(gemetenThema({ tekst: "rgb(225, 225, 225)" }), "donker");
    assert.equal(gemetenThema({ tekst: "rgb(255, 255, 255)" }), "donker");
  });

  it("donkere tekst betekent een licht dashboard", () => {
    assert.equal(gemetenThema({ tekst: "rgb(33, 33, 33)" }), "licht");
    assert.equal(gemetenThema({ tekst: "rgb(20, 20, 19)" }), "licht");
  });

  it("de meting wint van darkMode: een donker thema zonder `modes` meldt darkMode false", () => {
    // Het thema van de eigenaar: achtergrond #2c2c2e, tekst #FFF, geen modes.
    // Home Assistant zet darkMode daarvoor op false. Wie dat volgt, zet op zijn
    // donkere dashboard lichte kaarten neer.
    assert.equal(gemetenThema({ tekst: "rgb(255, 255, 255)", darkMode: false }), "donker");
    assert.equal(gemetenThema({ tekst: "rgb(33, 33, 33)", darkMode: true }), "licht");
  });

  it("valt terug op darkMode als er niets te meten is", () => {
    // Doorzichtig is de terugvalwaarde van de meetprop: de variabele bestaat
    // hier niet.
    assert.equal(gemetenThema({ tekst: "rgba(0, 0, 0, 0)", darkMode: true }), "donker");
    assert.equal(gemetenThema({ tekst: "rgba(0, 0, 0, 0)", darkMode: false }), "licht");
    assert.equal(gemetenThema({ tekst: "", darkMode: false }), "licht");
  });

  it("weet het niet als er niets te meten is en darkMode ontbreekt", () => {
    assert.equal(gemetenThema({ tekst: "rgba(0, 0, 0, 0)" }), null);
    assert.equal(gemetenThema({}), null);
    assert.equal(gemetenThema(), null);
  });

  it("leest wat een color-mix() oplevert", () => {
    assert.equal(gemetenThema({ tekst: "color(srgb 0.9 0.9 0.88)" }), "donker");
    assert.equal(gemetenThema({ tekst: "color(srgb 0.1 0.1 0.1 / 0.9)" }), "licht");
  });
});

describe("themaVoor() — de instelling wint van de meting", () => {
  it("licht en donker winnen altijd", () => {
    for (const gemeten of ["licht", "donker", null]) {
      assert.equal(themaVoor("licht", gemeten), "licht");
      assert.equal(themaVoor("donker", gemeten), "donker");
    }
  });

  it("auto volgt de meting", () => {
    assert.equal(themaVoor("auto", "licht"), "licht");
    assert.equal(themaVoor("auto", "donker"), "donker");
  });

  it("zonder meting blijft het donker, zoals het altijd was", () => {
    assert.equal(themaVoor("auto", null), "donker");
    assert.equal(themaVoor(undefined, null), "donker");
    assert.equal(themaVoor("onzin", "licht"), "licht");
  });
});

describe("instellingUit() — de keuze uit het antwoord van de lader", () => {
  const lader = (thema) =>
    `globalThis.${GLOBALE}="${thema}";\nimport("/domotiapp_lovelace/domotiapp-lovelace.js?v=abc123def456");\n`;

  it("leest de drie keuzes", () => {
    for (const thema of ["auto", "licht", "donker"]) assert.equal(instellingUit(lader(thema)), thema);
  });

  it("een lader van voor 0.54.0 noemt hem niet, en dat is geen fout", () => {
    assert.equal(instellingUit('import("/domotiapp_lovelace/domotiapp-lovelace.js?v=abc123def456");\n'), null);
    assert.equal(instellingUit(""), null);
    assert.equal(instellingUit(null), null);
  });

  it("laat geen onbekende waarde door", () => {
    assert.equal(instellingUit(lader("paars")), null);
  });

  it("REGRESSIEWACHT: de hash is nog steeds uit hetzelfde antwoord te lezen", () => {
    // verouderd.js leest de hash uit deze tekst. Komt er door de themaregel
    // iets tussen, dan herlaadt een verouderde pagina zich niet meer.
    assert.equal(hashUit(lader("licht")), "abc123def456");
  });
});

describe("leesKleur() — wat getComputedStyle teruggeeft", () => {
  it("rgb en rgba, met komma's en met spaties", () => {
    assert.deepEqual(leesKleur("rgb(1, 2, 3)"), [1, 2, 3, 1]);
    assert.deepEqual(leesKleur("rgba(1, 2, 3, 0.5)"), [1, 2, 3, 0.5]);
    assert.deepEqual(leesKleur("rgb(1 2 3 / 50%)"), [1, 2, 3, 0.5]);
  });

  it("hex in drie, zes en acht tekens", () => {
    assert.deepEqual(leesKleur("#fff"), [255, 255, 255, 1]);
    assert.deepEqual(leesKleur("#026FA1"), [2, 111, 161, 1]);
    assert.deepEqual(leesKleur("#00000080").slice(0, 3), [0, 0, 0]);
  });

  it("liever niet weten dan gokken", () => {
    assert.equal(leesKleur("oklch(0.7 0.1 200)"), null);
    assert.equal(leesKleur("var(--iets)"), null);
    assert.equal(leesKleur(""), null);
    assert.equal(leesKleur(undefined), null);
  });
});

describe("lampkleurVoor() — een lampkleur die op een lichte kaart te zien is", () => {
  it("in donker komt de kleur er ongewijzigd uit", () => {
    assert.deepEqual(lampkleurVoor([255, 244, 229], false), [255, 244, 229]);
    assert.deepEqual(lampkleurVoor([255, 255, 0], false), [255, 255, 0]);
  });

  it("bijna wit geeft null: de aanroeper valt terug op het lampgeel", () => {
    // Wit donkerder maken geeft grijs, en een grijze lamp leest als uit.
    assert.equal(lampkleurVoor([255, 244, 229], true), null);
    assert.equal(lampkleurVoor([255, 255, 255], true), null);
  });

  it("een lamp op een kleurtemperatuur maakt wit licht, wat zijn rgb ook zegt", () => {
    // 2700 K volgens Home Assistant. Donkerder gemaakt is dat karamel, en op
    // de schuif een modderkleur (gemeten op 30 september 2026).
    assert.equal(lampkleurVoor([255, 169, 87], true, "color_temp"), null);
    assert.equal(lampkleurVoor([255, 0, 0], true, "brightness"), null);
    // In donker verandert er niets aan.
    assert.deepEqual(lampkleurVoor([255, 169, 87], false, "color_temp"), [255, 169, 87]);
  });

  it("een lamp in een kleurmodus mag pastel zijn", () => {
    const roze = lampkleurVoor([255, 170, 210], true, "hs");
    assert.ok(roze && roze[0] > roze[2] && roze[2] > roze[1], String(roze));
    assert.equal(lampkleurVoor([255, 244, 229], true, "hs"), null, "bijna wit blijft wit");
  });

  it("zonder modus beslist de kleur zelf, met een ruimere grens", () => {
    // Het gemiddelde van een rij warme lampen op de badge.
    assert.equal(lampkleurVoor([255, 206, 166], true), null);
    const oranje = lampkleurVoor([255, 147, 44], true);
    assert.ok(oranje && oranje[0] > oranje[1] && oranje[1] > oranje[2], String(oranje));
  });

  it("een kleur die te licht is wordt donkerder, met dezelfde tint", () => {
    const geel = lampkleurVoor([255, 255, 0], true);
    assert.ok(helderheid(geel) <= LAMP_PLAFOND + 0.005, `helderheid ${helderheid(geel)}`);
    assert.equal(geel[0], geel[1], "rood en groen blijven gelijk");
    assert.equal(geel[2], 0);
    assert.ok(contrast(geel, LICHT_VLAK) >= 2.5, `contrast ${contrast(geel, LICHT_VLAK)}`);
  });

  it("een kleur die al donker genoeg is blijft staan", () => {
    assert.deepEqual(lampkleurVoor([255, 0, 0], true), [255, 0, 0]);
    assert.deepEqual(lampkleurVoor([0, 0, 255], true), [0, 0, 255]);
  });

  it("geen kleur is geen kleur", () => {
    assert.equal(lampkleurVoor(null, true), null);
    assert.equal(lampkleurVoor([1, 2], false), null);
    assert.equal(lampkleurVoor(["a", "b", "c"], false), null);
  });
});

describe("de kaarten geven het thema door aan de lampkleur", () => {
  const lamp = (rgb, extra = {}) => ({ state: "on", attributes: { rgb_color: rgb, ...extra } });

  it("lightTone: zonder tweede argument ongewijzigd (REGRESSIEWACHT)", () => {
    assert.equal(ha.lightTone(lamp([255, 244, 229])), "rgb(255,244,229)");
    assert.equal(ha.lightTone(lamp([255, 0, 0])), "rgb(255,0,0)");
    assert.equal(ha.lightTone({ state: "off", attributes: { rgb_color: [1, 2, 3] } }), null);
    assert.equal(ha.lightTone(lamp([255, 0, 0], { entity_id: ["light.a"] })), null);
  });

  it("lightTone: op een lichte kaart valt een witte lamp terug op het lampgeel", () => {
    assert.equal(ha.lightTone(lamp([255, 244, 229]), true), null);
    assert.equal(ha.lightTone(lamp([255, 255, 0]), true), "rgb(161,161,0)");
    assert.equal(ha.lightTone(lamp([255, 169, 87], { color_mode: "color_temp" }), true), null);
    assert.equal(ha.lightTone(lamp([255, 169, 87], { color_mode: "color_temp" })), "rgb(255,169,87)");
  });

  it("lampKleur van de badge: hetzelfde, voor het gemiddelde van de lampen", () => {
    const states = { "light.a": lamp([255, 244, 229]), "light.b": lamp([255, 250, 240]) };
    assert.equal(badge.lampKleur(states, ["light.a", "light.b"]), "rgb(255,247,235)");
    assert.equal(badge.lampKleur(states, ["light.a", "light.b"], true), null);
  });
});
