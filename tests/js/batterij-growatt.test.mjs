/**
 * De thuisbatterijkaart bij een batterij die de coach ALLEEN UITLEEST (15 oktober 2026).
 *
 * Gevraagd voor een Growatt ARK 15.3H bij een klant: "naast Anker moet ook
 * Growatt erop, met type en productfoto". De coach stuurt een Growatt nooit
 * (de keuze van de eigenaar), en zet vanaf v0.123.0 op de sensor `coach`:
 *
 * - `alleen_lezen: true`, en dan `stand` "stil", `plan` leeg en `soc` null;
 * - `capaciteit` in kWh: eerst een sensor, anders wat de installateur intypte;
 * - zoals altijd `accu_fabrikant` en `accu_model` uit het register. Bij een
 *   Growatt MIX is dat "Growatt" en "": de integratie zet geen model.
 *
 * Zo beschreven door de coach-sessie op 15 oktober 2026. De sensoren van de
 * batterij zelf komen uit een echte dump van die klant
 * (`vaste-invoer/growatt-mix-ark.json`, ingekort, met vervangen namen).
 *
 * NIEUW GEDRAG, behalve wat met REGRESSIEWACHT begint.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as B from "../../src/cards/batterij-logica.js";

const GROWATT = JSON.parse(readFileSync(new URL("./vaste-invoer/growatt-mix-ark.json", import.meta.url), "utf8"));
const BASIS = "/domotiapp_lovelace/afbeeldingen/";

/** De sensoren van de omvormer, op translation_key. */
const sensor = (sleutel) => GROWATT.entiteiten.find((e) => e.translation_key === sleutel);
const SOC = sensor("mix_statement_of_charge");
const LADEN = sensor("mix_battery_charge");
const ONTLADEN = sensor("mix_battery_discharge_kw");

/** De sensor van de coach zoals v0.123.0 hem voor een Growatt beschrijft. */
const coachSensor = (extra = {}) => ({
  entity_id: "sensor.accu_coach",
  state: "",
  attributes: {
    contract: 1,
    type: "thuisbatterij",
    brand: "growatt",
    alleen_lezen: true,
    stand: "stil",
    accu_fabrikant: "Growatt",
    accu_model: "",
    capaciteit: 15.3,
    soc: null,
    reason: "",
    plan: [],
    override: null,
    leeg_tot: null,
    vakantie: true,
    vakantie_max: 50,
    reserve: null,
    ondergrens: null,
    entiteiten: { soc: SOC.entity_id, charge_power: LADEN.entity_id, discharge_power: ONTLADEN.entity_id },
    ...extra,
  },
});

/** Een `hass.states` met de sensoren uit de dump, en wat de proef erover zet. */
function toestanden(over = {}) {
  const uit = {};
  for (const e of GROWATT.entiteiten) uit[e.entity_id] = { entity_id: e.entity_id, state: e.state, attributes: e.attributes };
  for (const [id, state] of Object.entries(over)) uit[id] = { ...uit[id], state };
  return (id) => uit[id];
}

describe("REGRESSIEWACHT: de dump van de Growatt zelf", () => {
  it("heeft geen model en meldt laden en ontladen in kW", () => {
    assert.equal(GROWATT.apparaat.manufacturer, "Growatt");
    assert.equal(GROWATT.apparaat.model, null);
    assert.equal(SOC.attributes.unit_of_measurement, "%");
    assert.equal(LADEN.attributes.unit_of_measurement, "kW");
    assert.equal(ONTLADEN.attributes.unit_of_measurement, "kW");
    // En dezelfde in W ernaast, zoals een SPH hem alleen heeft.
    assert.equal(sensor("mix_battery_discharge_w").attributes.unit_of_measurement, "W");
  });
});

describe("NIEUW GEDRAG: wat de coach over een batterij zegt die hij alleen uitleest", () => {
  it("leest alleen_lezen, de capaciteit en de entiteiten van de klant", () => {
    const s = B.batterijStand(coachSensor());
    assert.equal(s.alleenLezen, true);
    assert.equal(s.capaciteit, 15.3);
    assert.equal(s.fabrikant, "Growatt");
    assert.equal(s.model, "");
    assert.equal(s.entiteiten.soc, SOC.entity_id);
  });

  it("een batterij die de coach stuurt, of een coach van vóór 0.123.0, is niet alleen lezen", () => {
    assert.equal(B.batterijStand(coachSensor({ alleen_lezen: false })).alleenLezen, false);
    const { alleen_lezen: _a, capaciteit: _c, ...oud } = coachSensor().attributes;
    const s = B.batterijStand({ state: "Nul op de meter", attributes: oud });
    assert.equal(s.alleenLezen, false);
    assert.equal(s.capaciteit, null);
  });
});

describe("NIEUW GEDRAG: de accustand en het vermogen uit de sensoren van de batterij", () => {
  it("toont de stand van de dump: 15% en stil", () => {
    const s = B.uitgelezenStand(B.batterijStand(coachSensor()), toestanden());
    assert.equal(s.soc, 15);
    assert.equal(s.stand, "stil");
    assert.equal(s.tekst, "Stil");
    assert.equal(s.vermogen, 0);
  });

  it("toont het ontladen met het vermogen, zoals om 19:00 bij de klant (6,1 kW)", () => {
    const [, kw] = GROWATT.geschiedenis.accu_ontladen_kw.find(([, v]) => v === "6.1");
    const s = B.uitgelezenStand(B.batterijStand(coachSensor()), toestanden({ [ONTLADEN.entity_id]: kw, [SOC.entity_id]: "20" }));
    assert.equal(s.stand, "ontladen");
    assert.equal(s.tekst, "Ontladen · 6,1 kW");
    assert.equal(s.soc, 20);
    assert.equal(B.standVorm(s.stand).icoon, "arrowDown");
  });

  it("toont het laden, en rekent watt om naar kW", () => {
    const st = toestanden({ [LADEN.entity_id]: "2.34" });
    assert.equal(B.uitgelezenStand(B.batterijStand(coachSensor()), st).tekst, "Laden · 2,3 kW");

    const w = sensor("mix_battery_discharge_w");
    const sph = coachSensor({ entiteiten: { soc: SOC.entity_id, discharge_power: w.entity_id } });
    const s = B.uitgelezenStand(B.batterijStand(sph), toestanden({ [w.entity_id]: "4734" }));
    assert.equal(s.tekst, "Ontladen · 4,7 kW");
  });

  it("noemt minder dan 50 W stil", () => {
    const s = B.uitgelezenStand(B.batterijStand(coachSensor()), toestanden({ [ONTLADEN.entity_id]: "0.04" }));
    assert.equal(s.stand, "stil");
  });

  it("zegt dat het vermogen onbekend is als de cloud niets geeft, en raadt geen stand", () => {
    const s = B.uitgelezenStand(
      B.batterijStand(coachSensor()),
      toestanden({ [LADEN.entity_id]: "unavailable", [ONTLADEN.entity_id]: "unavailable", [SOC.entity_id]: "unknown" })
    );
    assert.equal(s.tekst, "Vermogen onbekend");
    assert.equal(s.stand, "");
    assert.equal(s.soc, null);
  });

  it("leest geen vermogen met een onbekende eenheid: dat kan een factor duizend schelen", () => {
    assert.equal(B.kilowatt({ state: "5", attributes: { unit_of_measurement: "kW" } }), 5);
    assert.equal(B.kilowatt({ state: "500", attributes: { unit_of_measurement: "W" } }), 0.5);
    assert.equal(B.kilowatt({ state: "5", attributes: {} }), null);
    assert.equal(B.kilowatt({ state: "unavailable", attributes: { unit_of_measurement: "kW" } }), null);
    assert.equal(B.kilowatt(null), null);
  });

  it("heeft geen knoppen, plan, vakantiestand of grenzen, ook als de vakantiestand nog aan staat", () => {
    const rollen = { vol_laden: "button.v", leegladen: "button.l", terug_naar_plan: "button.p" };
    const s = B.uitgelezenStand(B.batterijStand(coachSensor({ override: "vol", vakantie: true })), toestanden());
    assert.deepEqual(B.opdrachtKnoppen(s, rollen), []);
    assert.deepEqual(s.plan, []);
    assert.equal(B.grenzenTekst(s), "");
    assert.equal(s.reden, "");
  });

  it("laat een batterij die de coach stuurt zoals de coach hem meldt", () => {
    const stuurt = B.batterijStand(coachSensor({ alleen_lezen: false, stand: "ontladen", soc: 64, override: "vol" }));
    const s = B.uitgelezenStand(stuurt, toestanden({ [LADEN.entity_id]: "3" }));
    assert.equal(s, stuurt);
    assert.equal(s.soc, 64);
    assert.equal(B.opdrachtKnoppen(s, { vol_laden: "button.v", terug_naar_plan: "button.p" }).length, 2);
  });
});

describe("NIEUW GEDRAG: de foto van een Growatt ARK", () => {
  const ark = `${BASIS}thuisbatterijen/growatt-ark-15-3h.webp`;

  it("herkent bij de klant de ARK 15.3H aan de capaciteit die de installateur intypte", () => {
    const s = B.batterijStand(coachSensor());
    assert.equal(B.fotoBijAccu(s), "growatt_ark_15_3h");
    assert.equal(B.batterijAfbeelding("auto", s), ark);
  });

  it("neemt het getal van de datasheet ook (15,36), en een model met ARK erin", () => {
    assert.equal(B.fotoBijAccu({ fabrikant: "Growatt", capaciteit: 15.36 }), "growatt_ark_15_3h");
    assert.equal(B.fotoBijAccu({ fabrikant: "Growatt", model: "ARK 15.3H" }), "growatt_ark_15_3h");
    assert.equal(B.fotoBijAccu({ fabrikant: "Growatt", model: "ARK-15,3H", capaciteit: 12 }), "growatt_ark_15_3h");
  });

  it("REGRESSIEWACHT: geeft geen foto bij twijfel: 12 kWh gemeten is geen heel aantal modules", () => {
    assert.equal(B.fotoBijAccu({ fabrikant: "Growatt", capaciteit: 12 }), null);
    assert.equal(B.batterijAfbeelding("auto", { fabrikant: "Growatt", capaciteit: 12 }), "");
  });

  it("REGRESSIEWACHT: geeft een ARK met een ander aantal modules geen foto, want die is hoger of lager", () => {
    assert.equal(B.fotoBijAccu({ fabrikant: "Growatt", capaciteit: 7.68 }), null);
    assert.equal(B.fotoBijAccu({ fabrikant: "Growatt", capaciteit: 25.6 }), null);
    assert.equal(B.fotoBijAccu({ fabrikant: "Growatt", model: "ARK 7.6H", capaciteit: 15.3 }), null);
  });

  it("REGRESSIEWACHT: geeft een Growatt zonder capaciteit geen foto, en een ander merk met 15,3 kWh ook niet", () => {
    assert.equal(B.fotoBijAccu({ fabrikant: "Growatt", model: "", capaciteit: null }), null);
    assert.equal(B.fotoBijAccu({ fabrikant: "BYD", capaciteit: 15.36 }), null);
  });

  it("is in de editor te kiezen, met het merk in de naam", () => {
    assert.equal(B.BATTERIJ_FOTOS.growatt_ark_15_3h.label, "Growatt ARK 15.3H");
    assert.equal(B.batterijAfbeelding("growatt_ark_15_3h", null), ark);
  });

  it("REGRESSIEWACHT: de Anker houdt zijn foto", () => {
    assert.equal(B.fotoBijAccu({ fabrikant: "Anker", model: "Anker SOLIX Solarbank Max AC" }), "anker_solarbank_max_ac");
  });
});
