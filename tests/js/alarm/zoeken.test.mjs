/**
 * Zoeken op naam bij de speaker en het wake-up light — NIEUW GEDRAG.
 *
 * Gevraagd op 29 september 2026: *"ik wil bij de wakeuplight ook kunnen zoeken
 * op naam nu heb ik bij een ander huishouden heel veel lampen entitien in een
 * scroll menu. Ook bij de speaker selecteren"*.
 *
 * Pure logica, geen browser (CLAUDE.md). Met `import *`, zodat dit bestand ook
 * tegen de code van vóór deze ronde laadt en daar faalt op wat er gebeurt.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import * as logica from "../../../src/alarm/editorlogica.js";

const zoek = (...a) => {
  assert.equal(typeof logica.zoekEntiteiten, "function", "zoekEntiteiten bestaat niet");
  return logica.zoekEntiteiten(...a).map((e) => e.entity_id);
};

const LAMPEN = [
  { entity_id: "light.plafond_slaapkamer", name: "Plafond slaapkamer" },
  { entity_id: "light.slaapkamer_bedlamp", name: "Slaapkamer bedlamp" },
  { entity_id: "light.plafond_keuken", name: "Plafond keuken" },
  { entity_id: "light.cafe_hoek", name: "Café hoek" },
  { entity_id: "light.hue_color_lamp_7", name: "Leeslamp" },
];

describe("zoekEntiteiten() — NIEUW GEDRAG", () => {
  it("zonder zoekterm: de hele lijst, in dezelfde volgorde", () => {
    assert.deepEqual(zoek(LAMPEN, ""), LAMPEN.map((l) => l.entity_id));
    assert.deepEqual(zoek(LAMPEN, "   "), LAMPEN.map((l) => l.entity_id));
  });

  it("zoekt op een deel van de naam", () => {
    assert.deepEqual(zoek(LAMPEN, "keuken"), ["light.plafond_keuken"]);
  });

  it("elk woord moet passen, in willekeurige volgorde", () => {
    assert.deepEqual(zoek(LAMPEN, "slaap plafond"), ["light.plafond_slaapkamer"]);
  });

  it("wat met de zoekterm begint staat bovenaan", () => {
    assert.deepEqual(zoek(LAMPEN, "slaap"), ["light.slaapkamer_bedlamp", "light.plafond_slaapkamer"]);
  });

  it("hoofdletters en accenten maken niet uit", () => {
    assert.deepEqual(zoek(LAMPEN, "CAFE"), ["light.cafe_hoek"]);
    assert.deepEqual(zoek(LAMPEN, "café"), ["light.cafe_hoek"]);
  });

  it("vindt ook op het entity_id, voor een lamp met een nietszeggende naam", () => {
    assert.deepEqual(zoek(LAMPEN, "hue_color"), ["light.hue_color_lamp_7"]);
  });

  it("niets gevonden is een lege lijst, en een kapotte lijst ook", () => {
    assert.deepEqual(zoek(LAMPEN, "garage"), []);
    assert.deepEqual(zoek(undefined, "x"), []);
    assert.deepEqual(zoek([{ entity_id: "light.x" }], "light"), ["light.x"]);
  });
});
