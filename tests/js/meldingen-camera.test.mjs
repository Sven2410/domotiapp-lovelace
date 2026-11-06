/**
 * De camera op de meldingenkaart (0.109.0): per persoon welke camera's en waarover.
 *
 * De eigenaar op 6 november 2026: "Ik wil per persoon kunnen aanvinken wie welke meldingen krijgt."
 *
 * NIEUW GEDRAG, behalve waar REGRESSIEWACHT staat.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as M from "../../src/cards/meldingen-logica.js";
import { regelsVoorKaart } from "../../src/cards/bewaking-logica.js";

const OPRIT = "camera.oprit";
const TUIN = "camera.tuin";
const BRAM = "person.bram";

/** Zoals de server hem stuurt (`stand` in meldingen/websocket.py). */
const STAND = {
  bekend: true,
  cameras: [OPRIT, TUIN],
  soorten: ["mens", "voertuig", "aanbellen"],
  aan: { [BRAM]: true },
  keuzes: { [BRAM]: { cameras: [OPRIT], soorten: ["mens", "voertuig", "aanbellen"] } },
};

describe("de soort Camera", () => {
  it("staat aan met camera: true", () => {
    assert.deepEqual(M.soortenVan({ camera: true, afval: false }).map((s) => s.id), ["camera"]);
    assert.equal(M.meldingId({}, "camera"), "camera");
  });

  it("REGRESSIEWACHT: een kaart zonder camera heeft hem niet", () => {
    assert.deepEqual(M.soortenVan({ soort: "afval" }).map((s) => s.id), ["afval"]);
  });
});

describe("cameraKeuze en nieuweCameraKeuze", () => {
  it("leest wat de server uitrekende, binnen wat er te kiezen is", () => {
    assert.deepEqual(M.cameraKeuze(STAND, BRAM), { cameras: [OPRIT], soorten: ["mens", "voertuig", "aanbellen"] });
    const weg = { ...STAND, cameras: [TUIN] };
    assert.deepEqual(M.cameraKeuze(weg, BRAM).cameras, []);
  });

  it("camera's gaan altijd als hele lijst, ook als alles aan staat", () => {
    assert.deepEqual(M.nieuweCameraKeuze(STAND, BRAM, "cameras", TUIN, true), [OPRIT, TUIN]);
    assert.deepEqual(M.nieuweCameraKeuze(STAND, BRAM, "cameras", OPRIT, false), []);
  });

  it("soorten: alles is weer null, minder is een lijst", () => {
    assert.deepEqual(M.nieuweCameraKeuze(STAND, BRAM, "soorten", "mens", false), ["voertuig", "aanbellen"]);
    const zonder = { ...STAND, keuzes: { [BRAM]: { cameras: [OPRIT], soorten: ["voertuig"] } } };
    assert.deepEqual(M.nieuweCameraKeuze(zonder, BRAM, "soorten", "mens", true), ["mens", "voertuig"]);
    const bijna = { ...STAND, keuzes: { [BRAM]: { cameras: [OPRIT], soorten: ["mens", "voertuig"] } } };
    assert.equal(M.nieuweCameraKeuze(bijna, BRAM, "soorten", "aanbellen", true), null);
  });
});

describe("cameraRegel", () => {
  const naam = (id) => ({ [OPRIT]: "Oprit", [TUIN]: "Tuin" })[id];

  it("zegt waarover en van welke camera", () => {
    assert.equal(M.cameraRegel({ stand: STAND, persoon: BRAM, naam }), "Mens, voertuig en aanbellen · Oprit");
    assert.equal(M.cameraRegel({ stand: STAND, naam }), "Mens, voertuig en aanbellen · Oprit en Tuin");
  });

  it("zegt wat er ontbreekt", () => {
    assert.equal(M.cameraRegel({ stand: { ...STAND, bekend: false } }), "Actief zodra het dashboard is opgeslagen");
    assert.equal(M.cameraRegel({ stand: { bekend: true, cameras: [] } }), "Nog geen camera met snapshots en meldingen");
    const niets = { ...STAND, keuzes: { [BRAM]: { cameras: [], soorten: ["mens"] } } };
    assert.equal(M.cameraRegel({ stand: niets, persoon: BRAM, naam }), "Niets gekozen om te melden");
  });
});

describe("de camerakaart stuurt de soort per melder mee", () => {
  const PERSOON = "binary_sensor.oprit_person";
  const BEL = "event.voordeur_ding";
  const LOS = "binary_sensor.oprit_iets";
  const hass = {
    entities: {},
    states: {
      [BEL]: { attributes: { friendly_name: "Voordeur", device_class: "doorbell" } },
      [LOS]: { attributes: { friendly_name: "Iets" } },
    },
  };

  it("geraden, of zoals in de editor gekozen; zonder soort staat hij er niet in", () => {
    const [regel] = regelsVoorKaart(hass, { camera: OPRIT, snapshots: true, motion_sensors: [PERSOON, BEL, LOS] });
    assert.deepEqual(regel.soorten, { [PERSOON]: "mens", [BEL]: "aanbellen" });
    const [gekozen] = regelsVoorKaart(hass, {
      camera: OPRIT,
      snapshots: true,
      motion_sensors: [PERSOON, LOS],
      [`meldersoort:${LOS}`]: "dier",
      [`meldersoort:${PERSOON}`]: "onzin",
    });
    assert.deepEqual(gekozen.soorten, { [PERSOON]: "mens", [LOS]: "dier" });
  });
});
