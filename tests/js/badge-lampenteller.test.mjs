/**
 * De lampenteller op de badge — NIEUW GEDRAG.
 *
 * Gevraagd op 29 september 2026: *"Ik wil daar een optie kunnen aanvinken in de
 * GUI van dat het een light counter is. En dat ik dan verlichting kan uitsluiten
 * dat hij niet moet meenemen."*
 *
 * Zijn oude badge telde met `states.light | selectattr('state','eq','on') |
 * list | count`. Dat telt een lichtgroep als een extra lamp, en er was geen
 * manier om een lamp over te slaan zonder het sjabloon zelf te herschrijven.
 *
 * Pure logica, dus geen browser (CLAUDE.md). Met `import *`, zodat dit bestand
 * ook tegen de code van vóór deze ronde laadt en daar faalt op wat er gebeurt.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import * as badge from "../../src/badges/badge-logica.js";

const lamp = (id, state, attributes = {}) => ({
  entity_id: id,
  state,
  attributes: { friendly_name: id.split(".")[1], ...attributes },
});

/** Een huis in het klein: drie spots in een groep, een Hue-kamer, en ruis. */
const HUIS = Object.fromEntries(
  [
    lamp("light.spot_1", "on"),
    lamp("light.spot_2", "on"),
    lamp("light.spot_3", "off"),
    lamp("light.woonkamer", "on", { entity_id: ["light.spot_1", "light.spot_2", "light.spot_3"] }),
    lamp("light.hue_keuken", "on", { is_hue_group: true }),
    lamp("light.keuken_eiland", "on"),
    lamp("light.nachtlampje", "on"),
    lamp("light.schuur", "unavailable"),
    lamp("switch.ledstrip", "on"),
    lamp("sensor.lichtsterkte", "on"),
  ].map((st) => [st.entity_id, st]),
);

const tel = (...a) => {
  assert.equal(typeof badge.lampenAan, "function", "lampenAan bestaat niet");
  return badge.lampenAan(...a);
};

describe("lampenAan() — NIEUW GEDRAG", () => {
  it("telt de lampen die aan staan, zonder groepen", () => {
    assert.deepEqual(tel(HUIS), [
      "light.keuken_eiland",
      "light.nachtlampje",
      "light.spot_1",
      "light.spot_2",
    ]);
  });

  it("slaat over wat hij moet overslaan", () => {
    assert.deepEqual(tel(HUIS, ["light.nachtlampje"]), [
      "light.keuken_eiland",
      "light.spot_1",
      "light.spot_2",
    ]);
  });

  it("een uitgesloten lamp die niet bestaat, doet niets", () => {
    // Een lamp die hij ooit uitsloot en daarna weghaalde uit Home Assistant.
    assert.equal(tel(HUIS, ["light.bestaat_niet"]).length, 4);
  });

  it("telt geen onbereikbare lamp, geen schakelaar en geen sensor", () => {
    const ids = tel(HUIS);
    for (const niet of ["light.schuur", "switch.ledstrip", "sensor.lichtsterkte"]) {
      assert.equal(ids.includes(niet), false, niet);
    }
  });

  it("nul lampen is nul, geen fout", () => {
    assert.deepEqual(tel({}), []);
    assert.deepEqual(tel(undefined), []);
    assert.deepEqual(tel(HUIS, undefined), tel(HUIS));
    assert.deepEqual(tel(HUIS, "light.nachtlampje"), tel(HUIS), "geen lijst: niets uitsluiten");
  });
});

describe("isLampgroep() — NIEUW GEDRAG", () => {
  it("herkent een lichtgroep van Home Assistant en een kamer van Hue", () => {
    assert.equal(typeof badge.isLampgroep, "function", "isLampgroep bestaat niet");
    assert.equal(badge.isLampgroep(HUIS["light.woonkamer"]), true);
    assert.equal(badge.isLampgroep(HUIS["light.hue_keuken"]), true);
    assert.equal(badge.isLampgroep(HUIS["light.spot_1"]), false);
    // Een lege groep (valkuil 3: unavailable, zonder entity_id) telt hoe dan
    // ook niet, want hij staat niet aan.
    assert.equal(badge.isLampgroep(lamp("light.lege_groep", "unavailable")), false);
  });
});
