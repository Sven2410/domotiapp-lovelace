/**
 * De vriezerkaart, tegen de Miele FNS 7710 E uit de dump van een klant
 * (15 oktober 2026, `vaste-invoer/miele-was-droog-vries.json`), en sinds
 * 0.80.0 tegen de Miele K 7747 C van dezelfde klant (18 oktober 2026,
 * `vaste-invoer/miele-koelkast.json`).
 *
 * NIEUW GEDRAG: vriezer-logica.js bestond niet vóór 0.70.0, de koelkast niet
 * vóór 0.80.0. Wat met REGRESSIEWACHT begint toetst de dump zelf.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as Z from "../../src/cards/vriezer-logica.js";
import { productAfbeelding, typeBijApparaat } from "../../src/cards/productfoto.js";

const lees = (naam) => JSON.parse(readFileSync(new URL(`./vaste-invoer/${naam}`, import.meta.url), "utf8"));
const DUMP = lees("miele-was-droog-vries.json");
const KOELKAST = lees("miele-koelkast.json");

function hassUitDump(over = {}, dump = DUMP) {
  const entities = Object.fromEntries(Object.entries(dump.entities).filter(([, e]) => !e.disabled_by));
  const states = structuredClone(dump.states);
  for (const [id, state] of Object.entries(over)) states[id] = { ...states[id], entity_id: id, state };
  return { devices: dump.devices, entities, states };
}

const standVan = (hass, climate = "climate.vriezer") => {
  const d = Z.vriezerDelen(hass, climate);
  const st = (id) => (id ? hass.states[id] : null);
  const soort = Z.koelSoort(hass.states[climate], hass.entities[climate]);
  return Z.vriezerStand(
    hass.states[climate],
    {
      temperatuur: st(d.temperatuur),
      deur: st(d.deur),
      storing: st(d.storing),
      melding: st(d.melding),
    },
    soort,
  );
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

  it("toont de stand van de dump: -18 °C, ingesteld op -18, en de deur dicht", () => {
    const s = standVan(hassUitDump());
    assert.equal(s.temperatuur, -18);
    assert.equal(s.doel, -18);
    assert.deepEqual([s.min, s.max, s.stap], [-28, -15, 1]);
    assert.equal(Z.gradenTekst(s.temperatuur), "-18 °C");
    // Sinds 0.71.0 staat de deur er altijd, ook dicht (de wens van de eigenaar).
    assert.deepEqual(Z.vriezerMelding(s), { tekst: "Deur dicht", regels: ["Deur dicht"], tone: "neutral" });
  });

  it("leest de temperatuur van de sensor, met een tiende erbij", () => {
    const s = standVan(hassUitDump({ "sensor.vriezer_temperatuur": "-17.6" }));
    assert.equal(s.temperatuur, -17.6);
    assert.equal(Z.gradenTekst(s.temperatuur), "-17,6 °C");
  });

  it("meldt een open deur eerst, dan een storing, dan een melding, en de dichte deur achteraan", () => {
    const melding = (over) => Z.vriezerMelding(standVan(hassUitDump(over)));
    assert.deepEqual(melding({ "binary_sensor.vriezer_deur": "on", "binary_sensor.vriezer_probleem": "on" }), { tekst: "Deur open · Storing", regels: ["Deur open", "Storing"], tone: "bad" });
    assert.deepEqual(melding({ "binary_sensor.vriezer_deur": "on" }), { tekst: "Deur open", regels: ["Deur open"], tone: "warn" });
    assert.deepEqual(melding({ "binary_sensor.vriezer_probleem": "on" }), { tekst: "Storing · Deur dicht", regels: ["Storing", "Deur dicht"], tone: "bad" });
    assert.deepEqual(melding({ "binary_sensor.vriezer_notificatie_actief": "on" }), { tekst: "Melding op de vriezer · Deur dicht", regels: ["Melding op de vriezer", "Deur dicht"], tone: "warn" });
    // Zonder deursensor geen woord over de deur.
    assert.deepEqual(melding({ "binary_sensor.vriezer_deur": "unavailable" }), { tekst: "", regels: [], tone: "neutral" });
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
    assert.deepEqual(typeBijApparaat(apparaat, Z.KOELEN_EN_VRIEZEN), { merk: "miele", model: "fns_7710_e" });
    assert.equal(productAfbeelding({ merk: "auto" }, apparaat, Z.KOELEN_EN_VRIEZEN), "/domotiapp_lovelace/afbeeldingen/vriezers/miele-fns-7710-e.webp");
  });

  it("heet een vriezer, ook in de melding", () => {
    const h = hassUitDump();
    assert.equal(Z.koelSoort(h.states["climate.vriezer"], h.entities["climate.vriezer"]), "vriezer");
  });
});

describe("REGRESSIEWACHT: de koelkast in de dump", () => {
  it("heeft een climate van 3 tot 9 in hele graden, en twee spookzones op -328", () => {
    const a = KOELKAST.states["climate.koelkast"].attributes;
    assert.deepEqual([a.min_temp, a.max_temp, a.target_temp_step, a.current_temperature, a.temperature], [3, 9, 1, 5, 5]);
    assert.equal(KOELKAST.entities["climate.koelkast"].translation_key, "refrigerator");
    for (const z of ["climate.koelkast_zone_2", "climate.koelkast_zone_3"]) {
      assert.equal(KOELKAST.states[z].attributes.current_temperature, -328);
      assert.equal(KOELKAST.states[z].attributes.temperature, -328);
    }
  });
});

describe("NIEUW GEDRAG: de spookzones op -328", () => {
  it("kiest bij het toevoegen geen spookzone, ook niet met -328 als temperatuur", () => {
    const h = hassUitDump({}, KOELKAST);
    assert.equal(Z.isEchteZone(h.states["climate.koelkast"]), true);
    assert.equal(Z.isEchteZone(h.states["climate.koelkast_zone_2"]), false);
    assert.equal(Z.isEchteZone(h.states["climate.koelkast_zone_3"]), false);
  });

  it("doet dat ook bij de vriezer, die op 18 oktober ook -328 gaf", () => {
    const zone = structuredClone(DUMP.states["climate.vriezer_zone_2"]);
    zone.attributes.current_temperature = -328;
    zone.attributes.temperature = -328;
    assert.equal(Z.isEchteZone(zone), false);
  });

  it("toont op een spookzone geen -328 en geen instelknop", () => {
    // Zonder de sensor van het apparaat erbij: het gaat om wat de climate zegt.
    const s = Z.vriezerStand(KOELKAST.states["climate.koelkast_zone_2"], {}, "koelkast");
    assert.equal(s.temperatuur, null);
    assert.equal(s.doel, null);
  });
});

describe("NIEUW GEDRAG: de koelkast", () => {
  const koelkast = (over = {}) => standVan(hassUitDump(over, KOELKAST), "climate.koelkast");

  it("is een koelkast: Miele zegt het in de translation_key", () => {
    const h = hassUitDump({}, KOELKAST);
    assert.equal(Z.koelSoort(h.states["climate.koelkast"], h.entities["climate.koelkast"]), "koelkast");
    assert.equal(Z.SOORTNAAM.koelkast, "Koelkast");
  });

  it("is bij een ander merk een koelkast als hij boven nul in te stellen is", () => {
    const st = (min, max) => ({ state: "cool", attributes: { min_temp: min, max_temp: max } });
    assert.equal(Z.koelSoort(st(2, 8), { translation_key: null }), "koelkast");
    assert.equal(Z.koelSoort(st(-24, -16), { translation_key: null }), "vriezer");
    // Zonder bereik blijft het een vriezer, zoals de kaart was.
    assert.equal(Z.koelSoort({ state: "cool", attributes: {} }, null), "vriezer");
  });

  it("vindt de temperatuur, de deur, de storing en de melding, en niet superkoelen of de modus", () => {
    const d = Z.vriezerDelen(hassUitDump({}, KOELKAST), "climate.koelkast");
    assert.deepEqual(d, {
      temperatuur: "sensor.koelkast_temperatuur",
      deur: "binary_sensor.koelkast_deur",
      storing: "binary_sensor.koelkast_probleem",
      melding: "binary_sensor.koelkast_notificatie_actief",
    });
    assert.ok(!Object.values(d).some((id) => /superkoelen|modus/.test(id)));
  });

  it("toont de stand van de dump: 5 °C, ingesteld op 5, en de deur dicht", () => {
    const s = koelkast();
    assert.equal(s.soort, "koelkast");
    assert.equal(s.temperatuur, 5);
    assert.equal(s.doel, 5);
    assert.deepEqual([s.min, s.max, s.stap], [3, 9, 1]);
    assert.equal(Z.gradenTekst(s.temperatuur), "5 °C");
    assert.deepEqual(Z.vriezerMelding(s), { tekst: "Deur dicht", regels: ["Deur dicht"], tone: "neutral" });
  });

  it("zegt bij een melding dat die op de koelkast staat", () => {
    assert.deepEqual(Z.vriezerMelding(koelkast({ "binary_sensor.koelkast_notificatie_actief": "on" })), {
      tekst: "Melding op de koelkast · Deur dicht",
      regels: ["Melding op de koelkast", "Deur dicht"],
      tone: "warn",
    });
    assert.deepEqual(Z.vriezerMelding(koelkast({ "binary_sensor.koelkast_deur": "on" })).regels, ["Deur open"]);
  });

  it("stapt in hele graden binnen 3 en 9", () => {
    const s = koelkast();
    assert.equal(Z.volgendDoel(s, 5, -1), 4);
    assert.equal(Z.volgendDoel(s, 5, 1), 6);
    assert.equal(Z.volgendDoel(s, 3, -1), null);
    assert.equal(Z.volgendDoel(s, 9, 1), null);
    assert.deepEqual(Z.doelOproep("climate.koelkast", 4), ["climate", "set_temperature", { entity_id: "climate.koelkast", temperature: 4 }]);
  });

  it("herkent de K 7747 C aan model_id, met de foto", () => {
    const h = hassUitDump({}, KOELKAST);
    const apparaat = h.devices[h.entities["climate.koelkast"].device_id];
    assert.deepEqual(typeBijApparaat(apparaat, Z.KOELEN_EN_VRIEZEN), { merk: "miele", model: "k_7747_c" });
    assert.equal(productAfbeelding({ merk: "auto" }, apparaat, Z.KOELEN_EN_VRIEZEN), "/domotiapp_lovelace/afbeeldingen/koelkasten/miele-k-7747-c.webp");
  });
});
