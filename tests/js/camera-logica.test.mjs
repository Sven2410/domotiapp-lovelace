/**
 * Welke bewegingsmelder hoort bij welke camera — NIEUW GEDRAG.
 *
 * Gevraagd op 27 augustus 2026: *"er moet iets bedacht worden op de
 * bewegingsmelders als ik meerdere camera's heb."* Tot dan hoorden alle melders
 * bij alle camera's: wisselde je naar de tuin, dan zag je nog steeds het merkje
 * van de oprit.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { apparaatVan, cameraVanMelder, hoortBij } from "../../src/cards/camera-logica.js";

const OPRIT = "camera.oprit";
const TUIN = "camera.tuin";
const LOS = "camera.losse_cam";

/** Een Reolink is één apparaat met de camera én zijn melders eraan. */
const HASS = {
  entities: {
    [OPRIT]: { device_id: "dev-oprit" },
    "binary_sensor.oprit_person": { device_id: "dev-oprit" },
    "binary_sensor.oprit_vehicle": { device_id: "dev-oprit" },
    [TUIN]: { device_id: "dev-tuin" },
    "binary_sensor.tuin_person": { device_id: "dev-tuin" },
    // Een losse melder die nergens bij hoort — een sjabloonsensor bijvoorbeeld.
    "binary_sensor.eigen_melder": {},
    // En een camera zonder registratie.
    [LOS]: {},
  },
};

const CAMS = [OPRIT, TUIN];

describe("apparaatVan — NIEUW GEDRAG", () => {
  it("leest het apparaat dat Home Assistant meegeeft", () => {
    assert.equal(apparaatVan(HASS, OPRIT), "dev-oprit");
  });

  it("geeft null als er geen apparaat bekend is", () => {
    assert.equal(apparaatVan(HASS, "binary_sensor.eigen_melder"), null);
    assert.equal(apparaatVan(HASS, "bestaat.niet"), null);
    assert.equal(apparaatVan({}, OPRIT), null);
  });
});

describe("cameraVanMelder — NIEUW GEDRAG", () => {
  it("koppelt vanzelf op APPARAAT — bij een Reolink hoef je niets in te vullen", () => {
    assert.equal(cameraVanMelder(HASS, "binary_sensor.oprit_person", CAMS), OPRIT);
    assert.equal(cameraVanMelder(HASS, "binary_sensor.oprit_vehicle", CAMS), OPRIT);
    assert.equal(cameraVanMelder(HASS, "binary_sensor.tuin_person", CAMS), TUIN);
  });

  it("wat je zelf koos wint van het apparaat", () => {
    assert.equal(cameraVanMelder(HASS, "binary_sensor.oprit_person", CAMS, TUIN), TUIN);
  });

  it("een gekozen camera die niet meer op de kaart staat telt niet", () => {
    // Anders hoort de melder bij een camera die er niet is, en zie je hem nooit.
    assert.equal(cameraVanMelder(HASS, "binary_sensor.eigen_melder", CAMS, "camera.weg"), null);
  });

  it("geen apparaat bekend? Dan hoort hij bij ALLEMAAL", () => {
    // Met opzet: een melder die je hebt ingesteld en die nergens verschijnt is
    // erger dan eentje die een keer te vaak verschijnt.
    assert.equal(cameraVanMelder(HASS, "binary_sensor.eigen_melder", CAMS), null);
  });

  it("twee camera's op één apparaat laat de vraag open", () => {
    // Een dual-lens camera. Dan is "bij allemaal" eerlijker dan de eerste pakken.
    const duo = {
      entities: {
        "camera.a": { device_id: "dev-duo" },
        "camera.b": { device_id: "dev-duo" },
        "binary_sensor.duo_person": { device_id: "dev-duo" },
      },
    };
    assert.equal(cameraVanMelder(duo, "binary_sensor.duo_person", ["camera.a", "camera.b"]), null);
  });
});

describe("hoortBij — NIEUW GEDRAG", () => {
  it("toont een gekoppelde melder alleen bij zijn eigen camera", () => {
    assert.equal(hoortBij(HASS, "binary_sensor.oprit_person", CAMS, null, OPRIT), true);
    assert.equal(hoortBij(HASS, "binary_sensor.oprit_person", CAMS, null, TUIN), false);
  });

  it("toont een ongekoppelde melder overal", () => {
    assert.equal(hoortBij(HASS, "binary_sensor.eigen_melder", CAMS, null, OPRIT), true);
    assert.equal(hoortBij(HASS, "binary_sensor.eigen_melder", CAMS, null, TUIN), true);
  });

  it("volgt wat je zelf hebt gekozen", () => {
    assert.equal(hoortBij(HASS, "binary_sensor.eigen_melder", CAMS, TUIN, TUIN), true);
    assert.equal(hoortBij(HASS, "binary_sensor.eigen_melder", CAMS, TUIN, OPRIT), false);
  });

  it("met één camera op de kaart verandert er niets", () => {
    // De koppeling mag geen melder wegdrukken op een kaart met één camera.
    assert.equal(hoortBij(HASS, "binary_sensor.oprit_person", [OPRIT], null, OPRIT), true);
    assert.equal(hoortBij(HASS, "binary_sensor.tuin_person", [OPRIT], null, OPRIT), true);
  });
});
