/**
 * Van de kaartconfig naar de regels van de integratie — NIEUW GEDRAG.
 *
 * Gevraagd op 27 augustus 2026: een snapshotsysteem bij de camerakaart, met een
 * rustperiode en gekozen ontvangers.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  camerasVan,
  meldersVan,
  regelsVoorKaart,
  teVersturen,
  verschilt,
} from "../../src/cards/bewaking-logica.js";

const OPRIT = "camera.oprit";
const TUIN = "camera.tuin";
const PERSOON = "binary_sensor.oprit_person";
const VOERTUIG = "binary_sensor.oprit_vehicle";
const TUINMELDER = "binary_sensor.tuin_person";

/** Twee Reolinks: elk een camera met zijn eigen melders op hetzelfde apparaat. */
const HASS = {
  entities: {
    [OPRIT]: { device_id: "dev-oprit" },
    [PERSOON]: { device_id: "dev-oprit" },
    [VOERTUIG]: { device_id: "dev-oprit" },
    [TUIN]: { device_id: "dev-tuin" },
    [TUINMELDER]: { device_id: "dev-tuin" },
  },
};

const BASIS = {
  camera: OPRIT,
  motion_sensors: [PERSOON, VOERTUIG],
  snapshots: true,
};

describe("camerasVan en meldersVan", () => {
  it("zet de hoofdcamera vooraan en gooit dubbelen weg", () => {
    assert.deepEqual(
      camerasVan({ camera: OPRIT, cameras: [TUIN, OPRIT] }),
      [OPRIT, TUIN]
    );
  });

  it("neemt het oude enkele melderveld mee", () => {
    assert.deepEqual(
      meldersVan({ motion_sensors: [PERSOON], motion: VOERTUIG }),
      [PERSOON, VOERTUIG]
    );
  });
});

describe("regelsVoorKaart — NIEUW GEDRAG", () => {
  it("maakt één regel per camera", () => {
    const regels = regelsVoorKaart(HASS, {
      ...BASIS,
      cameras: [TUIN],
      motion_sensors: [PERSOON, VOERTUIG, TUINMELDER],
    });

    assert.deepEqual(
      regels.map((r) => r.camera),
      [OPRIT, TUIN]
    );
    assert.deepEqual(regels[0].melders, [PERSOON, VOERTUIG]);
    assert.deepEqual(regels[1].melders, [TUINMELDER]);
  });

  it("gebruikt de standaarden als er niets is ingevuld", () => {
    const [regel] = regelsVoorKaart(HASS, BASIS);
    assert.equal(regel.rustperiode, 60);
    assert.equal(regel.wachttijd, 0);
    assert.deepEqual(regel.ontvangers, []);
    assert.equal(regel.alleen_afwezig, false);
  });

  it("neemt de naam per melder over uit de editor", () => {
    const [regel] = regelsVoorKaart(HASS, {
      ...BASIS,
      [`melder:${PERSOON}`]: "Persoon",
      [`melder:${VOERTUIG}`]: "   ",
    });
    // Een leeg veld levert geen naam op; dan valt de server terug op HA zelf.
    assert.deepEqual(regel.namen, { [PERSOON]: "Persoon" });
  });

  it("staat uit als het vinkje uit staat", () => {
    const [regel] = regelsVoorKaart(HASS, { ...BASIS, snapshots: false });
    assert.equal(regel.aan, false);
    // De regel wordt WEL gestuurd: anders blijft de oude aan de serverkant staan.
    assert.deepEqual(regel.melders, [PERSOON, VOERTUIG]);
  });

  it("staat uit als er geen melder bij die camera hoort", () => {
    const regels = regelsVoorKaart(HASS, {
      ...BASIS,
      cameras: [TUIN],
      motion_sensors: [PERSOON],
    });
    assert.equal(regels[0].aan, true);
    assert.equal(regels[1].aan, false);
    assert.deepEqual(regels[1].melders, []);
  });

  it("laat alleen personen door als ontvanger", () => {
    const [regel] = regelsVoorKaart(HASS, {
      ...BASIS,
      snapshot_ontvangers: ["person.sven", "notify.mobile_app_iets", "light.aan"],
    });
    assert.deepEqual(regel.ontvangers, ["person.sven"]);
  });

  it("valt terug op de standaard bij een onzinnig getal", () => {
    const [regel] = regelsVoorKaart(HASS, {
      ...BASIS,
      snapshot_rustperiode: "geen getal",
      snapshot_wachttijd: -5,
    });
    assert.equal(regel.rustperiode, 60);
    assert.equal(regel.wachttijd, 0);
  });
});

describe("verschilt en teVersturen — NIEUW GEDRAG", () => {
  it("stuurt niets als de server het al zo heeft staan", () => {
    const [regel] = regelsVoorKaart(HASS, BASIS);
    assert.deepEqual(teVersturen(HASS, BASIS, { [OPRIT]: regel }), []);
  });

  it("negeert velden die alleen de server kent", () => {
    const [regel] = regelsVoorKaart(HASS, BASIS);
    const opServer = { ...regel, diensten: { "person.sven": "notify.iets" } };
    assert.equal(verschilt(regel, opServer), false);
  });

  it("stuurt wel als er iets veranderd is", () => {
    const [regel] = regelsVoorKaart(HASS, BASIS);
    const gewijzigd = { ...BASIS, snapshot_rustperiode: 120 };
    const uit = teVersturen(HASS, gewijzigd, { [OPRIT]: regel });
    assert.equal(uit.length, 1);
    assert.equal(uit[0].rustperiode, 120);
  });

  it("stuurt als de server de camera nog helemaal niet kent", () => {
    assert.equal(teVersturen(HASS, BASIS, {}).length, 1);
  });

  it("ziet een melder die erbij komt", () => {
    const [regel] = regelsVoorKaart(HASS, { ...BASIS, motion_sensors: [PERSOON] });
    assert.equal(teVersturen(HASS, BASIS, { [OPRIT]: regel }).length, 1);
  });
});
