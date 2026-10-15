/**
 * De thuisbatterijkaart tegen de ECHTE coach v0.123.0, met een Growatt.
 *
 * `vaste-invoer/coach-0.123.0-batterij-growatt.json` is de dump die de
 * beheersessie op 15 oktober 2026 om 21:33 maakte bij een klant, kort nadat de
 * accu daar op merk Growatt was gezet (alleen uitlezen, capaciteit 15.3). Het
 * serienummer van de omvormer is vervangen door "serienr".
 *
 * Wat deze dump liet zien:
 *
 * - de toestand van de coach-sensor is leeg, `stand` is "stil", `soc` null;
 * - `alleen_lezen` true en `capaciteit` 15.3, zoals afgesproken;
 * - `accu_fabrikant` "Growatt" en `accu_model` leeg: het type staat nergens;
 * - de knoppen, Leegladen tot en de vakantiestand bestaan WEL bij deze accu;
 * - de Growatt zelf: 15% en 0 kW laden en ontladen ('s nachts, op zijn
 *   ondergrens), in % en kW.
 *
 * NIEUW GEDRAG: alles hieronder faalt op de code van vóór deze ronde, behalve
 * wat met REGRESSIEWACHT begint (dat toetst de dump zelf).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as B from "../../src/cards/batterij-logica.js";
import * as C from "../../src/cards/coach-logica.js";

const DUMP = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.123.0-batterij-growatt.json", import.meta.url), "utf8"));
const BASIS = "/domotiapp_lovelace/afbeeldingen/";

/** Een `hass` zoals de frontend hem heeft, gebouwd uit de dump; `over` zet een Growatt-sensor anders. */
function hassUitDump(over = {}) {
  const devices = { bt: { name: "Thuisbatterij", name_by_user: null, manufacturer: "DomotiApp Coach", model: "Thuisbatterij" } };
  const entities = {};
  const states = {};
  for (const { registry, state } of DUMP.coach_entiteiten) {
    entities[registry.entity_id] = { device_id: "bt", platform: registry.platform, translation_key: registry.translation_key };
    states[registry.entity_id] = state;
  }
  for (const s of DUMP.growatt_sensoren) {
    const attributes = { unit_of_measurement: s.unit, device_class: s.device_class };
    if (s.state_class) attributes.state_class = s.state_class;
    states[s.entity_id] = { entity_id: s.entity_id, state: over[s.entity_id] ?? s.state, attributes };
  }
  return { devices, entities, states };
}

const hass = hassUitDump();
const rollen = C.coachRollen(hass, "bt");
const coachSt = hass.states[rollen.coach];
const stand = (h = hass) => B.uitgelezenStand(B.batterijStand(h.states[rollen.coach]), (id) => h.states[id]);

describe("REGRESSIEWACHT: de dump van coach 0.123.0 met een Growatt", () => {
  it("vindt het apparaat en al zijn rollen, ook de knoppen", () => {
    assert.equal(C.kiesApparaat(hass, "", ["Thuisbatterij"], "Thuisbatterij").reden, "enige");
    assert.deepEqual(Object.keys(rollen).sort(), ["coach", "leeg_tot", "leegladen", "terug_naar_plan", "vakantiestand", "vol_laden"]);
    assert.equal(C.coachMelding({ reden: "enige" }, C.contractVan(coachSt), "0.112.1"), "");
  });

  it("zegt zelf niets over lading of stand: dat staat in de sensoren van de Growatt", () => {
    assert.equal(coachSt.state, "");
    assert.equal(coachSt.attributes.soc, null);
    assert.equal(coachSt.attributes.stand, "stil");
    assert.deepEqual(Object.keys(coachSt.attributes.entiteiten), ["soc", "charge_power", "discharge_power", "accu_in", "accu_out"]);
  });
});

describe("NIEUW GEDRAG: de kaart bij deze Growatt", () => {
  it("leest alleen_lezen, de capaciteit en het merk", () => {
    const s = B.batterijStand(coachSt);
    assert.equal(s.alleenLezen, true);
    assert.equal(s.capaciteit, 15.3);
    assert.equal(s.fabrikant, "Growatt");
    assert.equal(s.model, "");
  });

  it("toont de lading van de Growatt zelf: 15%, stil, zonder vermogen", () => {
    const s = stand();
    assert.equal(s.soc, 15);
    assert.equal(s.stand, "stil");
    assert.equal(s.tekst, "Stil");
    assert.equal(B.vermogenTekst(s), "");
  });

  it("toont geen knoppen, geen plan en geen grenzen, ook al bestaan de knoppen", () => {
    const s = stand();
    assert.ok(rollen.vol_laden && rollen.leegladen);
    assert.deepEqual(B.opdrachtKnoppen(s, rollen), []);
    assert.deepEqual(s.plan, []);
    assert.equal(B.grenzenTekst(s), "");
    assert.equal(B.opgeleverdTekst(s), "");
  });

  it("herkent de ARK 15.3H aan de capaciteit, en toont zijn foto", () => {
    const s = B.batterijStand(coachSt);
    assert.equal(B.fotoBijAccu(s), "growatt_ark_15_3h");
    assert.equal(B.batterijAfbeelding("auto", s), `${BASIS}thuisbatterijen/growatt-ark-15-3h.webp`);
  });

  it("toont het laden zodra de Growatt dat meldt, in kW zoals in de dump", () => {
    const h = hassUitDump({ "sensor.serienr_accu_wordt_geladen": "2.3", "sensor.serienr_state_of_charge": "41" });
    const s = stand(h);
    assert.equal(s.tekst, "Laden");
    assert.equal(B.vermogenTekst(s), "2,3 kW");
    assert.equal(s.soc, 41);
  });
});
