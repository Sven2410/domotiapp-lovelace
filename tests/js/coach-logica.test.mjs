/**
 * Een kaart vindt zijn apparaat van DomotiApp Coach, en de entiteiten erbij.
 *
 * NIEUW GEDRAG: `src/cards/coach-logica.js` bestond niet vóór deze ronde.
 *
 * Afgesproken met de coach-sessie op 11 oktober 2026 (contract 1, coach
 * v0.110.0): per apparaat één HA-apparaat met fabrikant "DomotiApp Coach" en
 * een vaste soortnaam als model; de rol van elke entiteit staat in zijn
 * `translation_key`. Die laatste komt in `hass.entities[id]` mee naar de
 * frontend -- gemeten in het image 2026.8 (helpers/entity_registry.py zet "tk"
 * en "pl" in de display-entry, de frontend maakt er `translation_key` en
 * `platform` van).
 *
 * De vormen van `hass.devices` en `hass.entities` hieronder zijn die van de
 * frontend van 2026.8, met alleen de velden die de kaart leest.
 *
 * De module wordt als geheel geïmporteerd: dan valt tegen de oude code elke
 * test op zijn eigen reden om, in plaats van het hele bestand op één import.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as C from "../../src/cards/coach-logica.js";

const apparaat = (name, model, extra = {}) => ({
  name,
  name_by_user: null,
  manufacturer: "DomotiApp Coach",
  model,
  ...extra,
});

const entiteit = (device_id, translation_key, platform = "domotiapp_coach") => ({
  device_id,
  translation_key,
  platform,
});

/** Een huis met een vaatwasser en een laadpaal van de coach, en een vreemde vaatwasser. */
const HUIS = {
  devices: {
    vw: apparaat("Vaatwasser", "Vaatwasser"),
    lp: apparaat("Oprit", "Laadpaal"),
    bosch: { name: "Vaatwasser keuken", manufacturer: "BSH", model: "SMV4" },
  },
  entities: {
    "sensor.vaatwasser_start": entiteit("vw", "start"),
    "binary_sensor.vaatwasser_vrijgegeven": entiteit("vw", "vrijgegeven"),
    "button.vaatwasser_ingeruimd_morgen_starten": entiteit("vw", "ingeruimd_morgen"),
    "button.vaatwasser_ingeruimd_nu_starten": entiteit("vw", "ingeruimd_nu"),
    "button.vaatwasser_vrijgave_intrekken": entiteit("vw", "vrijgave_intrekken"),
    // Een entiteit van een ANDERE integratie aan hetzelfde apparaat: geen rol.
    "sensor.vaatwasser_iets": entiteit("vw", "start", "template"),
    // Van de coach, maar zonder sleutel: een coach van vóór contract 1.
    "sensor.vaatwasser_oud": { device_id: "vw", platform: "domotiapp_coach" },
    "sensor.oprit_coach": entiteit("lp", "coach"),
  },
};

describe("NIEUW GEDRAG: de apparaten van de coach", () => {
  it("vindt alleen apparaten van de coach, met een model dat bij de kaart hoort", () => {
    const lijst = C.coachApparaten(HUIS, C.PROGRAMMA_MODELLEN);
    assert.deepEqual(lijst, [{ id: "vw", naam: "Vaatwasser", model: "Vaatwasser" }]);
  });

  it("noemt een apparaat zoals de klant het hernoemde, en sorteert op die naam", () => {
    const hass = {
      devices: {
        a: apparaat("Wasmachine", "Wasmachine", { name_by_user: "Was zolder" }),
        b: apparaat("Droger", "Droger"),
      },
    };
    assert.deepEqual(
      C.coachApparaten(hass, C.PROGRAMMA_MODELLEN).map((a) => a.naam),
      ["Droger", "Was zolder"]
    );
  });

  it("geeft een lege lijst zonder register", () => {
    assert.deepEqual(C.coachApparaten({}, C.PROGRAMMA_MODELLEN), []);
    assert.deepEqual(C.coachApparaten(null, C.PROGRAMMA_MODELLEN), []);
  });
});

describe("NIEUW GEDRAG: welk apparaat de kaart volgt", () => {
  const modellen = C.PROGRAMMA_MODELLEN;

  it("neemt het apparaat dat in de editor gekozen is", () => {
    assert.deepEqual(C.kiesApparaat(HUIS, "vw", modellen), { id: "vw", reden: "gekozen" });
  });

  it("pakt geen ander als het gekozen apparaat weg is, maar zegt het", () => {
    assert.deepEqual(C.kiesApparaat(HUIS, "weg", modellen), { id: "weg", reden: "weg" });
  });

  it("neemt zonder keuze de enige vaatwasser, ook met een wasmachine ernaast", () => {
    const hass = {
      devices: { vw: apparaat("Vaatwasser", "Vaatwasser"), wm: apparaat("Was", "Wasmachine") },
    };
    assert.deepEqual(C.kiesApparaat(hass, "", modellen, "Vaatwasser"), { id: "vw", reden: "enige" });
  });

  it("neemt zonder vaatwasser het enige apparaat met een programma", () => {
    const hass = { devices: { wm: apparaat("Was", "Wasmachine") } };
    assert.deepEqual(C.kiesApparaat(hass, "", modellen, "Vaatwasser"), { id: "wm", reden: "enige" });
  });

  it("laat de klant kiezen als er twee vaatwassers zijn", () => {
    const hass = {
      devices: { a: apparaat("Keuken", "Vaatwasser"), b: apparaat("Bijkeuken", "Vaatwasser") },
    };
    assert.deepEqual(C.kiesApparaat(hass, "", modellen, "Vaatwasser"), { id: null, reden: "meerdere" });
  });

  it("zegt dat er geen is als de coach geen apparaat met een programma heeft", () => {
    const hass = { devices: { lp: apparaat("Oprit", "Laadpaal") } };
    assert.deepEqual(C.kiesApparaat(hass, "", modellen, "Vaatwasser"), { id: null, reden: "geen" });
  });
});

describe("NIEUW GEDRAG: de entiteiten per rol", () => {
  it("koppelt elke rol aan zijn entiteit, via translation_key", () => {
    assert.deepEqual(C.coachRollen(HUIS, "vw"), {
      start: "sensor.vaatwasser_start",
      vrijgegeven: "binary_sensor.vaatwasser_vrijgegeven",
      ingeruimd_morgen: "button.vaatwasser_ingeruimd_morgen_starten",
      ingeruimd_nu: "button.vaatwasser_ingeruimd_nu_starten",
      vrijgave_intrekken: "button.vaatwasser_vrijgave_intrekken",
    });
  });

  it("overleeft een hernoemde entiteit: de rol zit in de sleutel, niet in de naam", () => {
    const hass = { entities: { "sensor.iets_heel_anders": entiteit("vw", "start") } };
    assert.deepEqual(C.coachRollen(hass, "vw"), { start: "sensor.iets_heel_anders" });
  });

  it("geeft een vaste uitkomst als twee entiteiten dezelfde sleutel dragen", () => {
    const hass = {
      entities: { "sensor.b": entiteit("vw", "start"), "sensor.a": entiteit("vw", "start") },
    };
    assert.deepEqual(C.coachRollen(hass, "vw"), { start: "sensor.a" });
  });

  it("geeft niets zonder apparaat", () => {
    assert.deepEqual(C.coachRollen(HUIS, null), {});
    assert.deepEqual(C.coachRollen({}, "vw"), {});
  });
});

describe("NIEUW GEDRAG: het contract en de eigen entiteiten van de klant", () => {
  const S = (attributes) => ({ entity_id: "sensor.x", state: "om 14:00", attributes });

  it("leest het contract als een heel getal, en 0 als het er niet is", () => {
    assert.equal(C.contractVan(S({ contract: 1 })), 1);
    assert.equal(C.contractVan(S({})), 0);
    assert.equal(C.contractVan(null), 0);
    assert.equal(C.contractVan(S({ contract: 0 })), 0);
    assert.equal(C.contractVan(S({ contract: 1.5 })), 0);
  });

  it("neemt uit `entiteiten` alleen wat op een entity_id lijkt", () => {
    const st = S({
      entiteiten: {
        door: "binary_sensor.klep",
        start: "button.start",
        leeg: "",
        raar: "geen entiteit",
        getal: 3,
      },
    });
    assert.deepEqual(C.klantEntiteiten(st), { door: "binary_sensor.klep", start: "button.start" });
  });

  it("geeft een leeg object zonder `entiteiten`", () => {
    assert.deepEqual(C.klantEntiteiten(S({})), {});
    assert.deepEqual(C.klantEntiteiten(S({ entiteiten: "x" })), {});
    assert.deepEqual(C.klantEntiteiten(null), {});
  });
});
