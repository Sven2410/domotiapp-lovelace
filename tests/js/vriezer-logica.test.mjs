/**
 * De vriezerkaart, tegen de Miele FNS 7710 E uit de dump van een klant
 * (15 oktober 2026, `vaste-invoer/miele-was-droog-vries.json`).
 *
 * NIEUW GEDRAG: vriezer-logica.js bestond niet vóór deze ronde. Wat met
 * REGRESSIEWACHT begint toetst de dump zelf.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as Z from "../../src/cards/vriezer-logica.js";
import { productAfbeelding, typeBijApparaat } from "../../src/cards/productfoto.js";

const DUMP = JSON.parse(readFileSync(new URL("./vaste-invoer/miele-was-droog-vries.json", import.meta.url), "utf8"));

function hassUitDump(over = {}) {
  const entities = Object.fromEntries(Object.entries(DUMP.entities).filter(([, e]) => !e.disabled_by));
  const states = structuredClone(DUMP.states);
  for (const [id, state] of Object.entries(over)) states[id] = { ...states[id], entity_id: id, state };
  return { devices: DUMP.devices, entities, states };
}

const standVan = (hass) => {
  const d = Z.vriezerDelen(hass, "climate.vriezer");
  const st = (id) => (id ? hass.states[id] : null);
  return Z.vriezerStand(hass.states["climate.vriezer"], {
    temperatuur: st(d.temperatuur),
    deur: st(d.deur),
    storing: st(d.storing),
    melding: st(d.melding),
  });
};

describe("REGRESSIEWACHT: de vriezer in de dump", () => {
  it("heeft een climate met -28 tot -15 in hele graden, en twee spookzones", () => {
    const a = DUMP.states["climate.vriezer"].attributes;
    assert.deepEqual([a.min_temp, a.max_temp, a.target_temp_step, a.current_temperature, a.temperature], [-28, -15, 1, -18, -18]);
    assert.equal(DUMP.states["climate.vriezer_zone_2"].attributes.current_temperature, null);
    assert.equal(DUMP.states["climate.vriezer_zone_3"].attributes.min_temp, 7);
  });
});

describe("NIEUW GEDRAG: de vriezerkaart", () => {
  it("vindt de temperatuur, de deur, de storing en de melding van hetzelfde apparaat", () => {
    assert.deepEqual(Z.vriezerDelen(hassUitDump(), "climate.vriezer"), {
      temperatuur: "sensor.vriezer_temperatuur",
      deur: "binary_sensor.vriezer_deur",
      storing: "binary_sensor.vriezer_probleem",
      melding: "binary_sensor.vriezer_notificatie_actief",
    });
  });

  it("neemt de supervriesschakelaar en de modus niet mee", () => {
    const d = Z.vriezerDelen(hassUitDump(), "climate.vriezer");
    assert.ok(!Object.values(d).some((id) => /supervriezen|modus/.test(id)));
  });

  it("toont de stand van de dump: -18 °C, ingesteld op -18, niets te melden", () => {
    const s = standVan(hassUitDump());
    assert.equal(s.temperatuur, -18);
    assert.equal(s.doel, -18);
    assert.deepEqual([s.min, s.max, s.stap], [-28, -15, 1]);
    assert.equal(Z.gradenTekst(s.temperatuur), "-18 °C");
    assert.deepEqual(Z.vriezerMelding(s), { tekst: "", tone: "neutral" });
  });

  it("leest de temperatuur van de sensor, met een tiende erbij", () => {
    const s = standVan(hassUitDump({ "sensor.vriezer_temperatuur": "-17.6" }));
    assert.equal(s.temperatuur, -17.6);
    assert.equal(Z.gradenTekst(s.temperatuur), "-17,6 °C");
  });

  it("meldt een open deur eerst, dan een storing, dan een melding", () => {
    const melding = (over) => Z.vriezerMelding(standVan(hassUitDump(over)));
    assert.deepEqual(melding({ "binary_sensor.vriezer_deur": "on", "binary_sensor.vriezer_probleem": "on" }), { tekst: "Deur open", tone: "warn" });
    assert.deepEqual(melding({ "binary_sensor.vriezer_probleem": "on" }), { tekst: "Storing", tone: "bad" });
    assert.deepEqual(melding({ "binary_sensor.vriezer_notificatie_actief": "on" }), { tekst: "Melding op de vriezer", tone: "warn" });
  });

  it("zegt niet bereikbaar als de climate weg is", () => {
    const s = standVan(hassUitDump({ "climate.vriezer": "unavailable" }));
    assert.equal(s, null);
    assert.equal(Z.vriezerMelding(s).tekst, "Niet bereikbaar");
  });

  it("stapt in hele graden binnen -28 en -15", () => {
    const s = standVan(hassUitDump());
    assert.equal(Z.volgendDoel(s, -18, -1), -19);
    assert.equal(Z.volgendDoel(s, -18, 1), -17);
    assert.equal(Z.volgendDoel(s, -28, -1), null);
    assert.equal(Z.volgendDoel(s, -15, 1), null);
    assert.deepEqual(Z.doelOproep("climate.vriezer", -19), ["climate", "set_temperature", { entity_id: "climate.vriezer", temperature: -19 }]);
  });

  it("kiest bij het toevoegen geen spookzone", () => {
    const h = hassUitDump();
    assert.equal(Z.isEchteZone(h.states["climate.vriezer"]), true);
    assert.equal(Z.isEchteZone(h.states["climate.vriezer_zone_2"]), false);
  });

  it("herkent de FNS 7710 E aan model_id, met de foto", () => {
    const h = hassUitDump();
    const apparaat = h.devices[h.entities["climate.vriezer"].device_id];
    assert.deepEqual(typeBijApparaat(apparaat, Z.VRIEZERS), { merk: "miele", model: "fns_7710_e" });
    assert.equal(productAfbeelding({ merk: "auto" }, apparaat, Z.VRIEZERS), "/domotiapp_lovelace/afbeeldingen/vriezers/miele-fns-7710-e.webp");
  });
});
