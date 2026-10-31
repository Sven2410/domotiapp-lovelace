/**
 * Wat alleen de airco-KAART uit airco-logica.js nodig heeft: de standknoppen,
 * wanneer de ventilator knoppen krijgt, de tegels en de foto.
 *
 * NIEUW GEDRAG: `SOORT_TOON`, `standKnoppen`, `standKnopOproep`,
 * `alsKnoppen`, `aircoFeiten`, `AIRCO_FOTOS`, `fotoBijAirco` en
 * `aircoAfbeelding` bestonden niet vóór 13 oktober 2026. Tegen de bron van
 * daarvoor faalt dit bestand bij het importeren ("does not provide an export
 * named").
 *
 * De invoer is dezelfde als in airco-logica.test.mjs: de echte MELCloud
 * Home-dump van een klant, en de drie demo-airco's van de testinstance.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  AIRCO_FOTOS,
  SOORT_ICOON,
  SOORT_TOON,
  aircoAfbeelding,
  aircoFeiten,
  alsKnoppen,
  apparaatDelen,
  fotoBijAirco,
  keuzesVan,
  standKnopOproep,
  standKnoppen,
} from "../../src/cards/airco-logica.js";

const dump = JSON.parse(readFileSync(new URL("./vaste-invoer/melcloud-home-airco.json", import.meta.url), "utf8"));
const raam = dump.states["climate.kantoor_raam"];
const hassDump = { states: dump.states, entities: dump.entities, devices: dump.devices };

// Zoals ze in de testinstance staan (GET /api/states, 13 oktober 2026).
const hvac = {
  entity_id: "climate.hvac",
  state: "cool",
  attributes: {
    hvac_modes: ["off", "heat", "cool", "auto", "dry", "fan_only"],
    min_temp: 7,
    max_temp: 35,
    fan_modes: ["on_low", "on_high", "auto_low", "auto_high", "off"],
    swing_modes: ["auto", "1", "2", "3", "off"],
    swing_horizontal_modes: ["auto", "rangefull", "off"],
    current_temperature: 22,
    temperature: 21,
    current_humidity: 54.2,
    fan_mode: "on_high",
    hvac_action: "cooling",
    swing_mode: "off",
    swing_horizontal_mode: "auto",
    friendly_name: "Hvac",
    supported_features: 943,
  },
};
const heatpump = {
  entity_id: "climate.heatpump",
  state: "heat",
  attributes: {
    hvac_modes: ["heat", "off"],
    min_temp: 7,
    max_temp: 35,
    current_temperature: 25,
    temperature: 20,
    hvac_action: "heating",
    friendly_name: "HeatPump",
    supported_features: 385,
  },
};
const ecobee = {
  entity_id: "climate.ecobee",
  state: "heat_cool",
  attributes: {
    hvac_modes: ["off", "cool", "heat_cool", "auto", "dry", "fan_only"],
    min_temp: 7,
    max_temp: 35,
    fan_modes: ["on_low", "on_high", "auto_low", "auto_high", "off"],
    preset_modes: ["home", "eco", "away"],
    swing_modes: ["auto", "1", "2", "3", "off"],
    current_temperature: 23,
    target_temp_high: 24,
    target_temp_low: 21,
    fan_mode: "auto_low",
    preset_mode: "home",
    swing_mode: "auto",
    friendly_name: "Ecobee",
    supported_features: 442,
  },
};
const zet = (st, state, attributes = {}) => ({ ...st, state, attributes: { ...st.attributes, ...attributes } });
const labels = (knoppen) => knoppen.map((k) => k.label);
const gekozen = (knoppen) => knoppen.filter((k) => k.gekozen).map((k) => k.waarde);

/* ------------------------------------------------------------- de kleur */

describe("SOORT_TOON: alleen de chip draagt de toestand", () => {
  it("warm is zon, koud/droog/lucht is blauw, auto is het accent, de rest neutraal", () => {
    assert.equal(SOORT_TOON.warm, "solar");
    assert.equal(SOORT_TOON.koud, "water");
    assert.equal(SOORT_TOON.droog, "water");
    assert.equal(SOORT_TOON.lucht, "water");
    assert.equal(SOORT_TOON.auto, "accent");
    for (const s of ["stil", "uit", "dood"]) assert.equal(SOORT_TOON[s], "neutral");
  });

  it("elke soort met een icoon heeft ook een kleur, en nooit rood of groen", () => {
    for (const soort of Object.keys(SOORT_ICOON)) assert.ok(SOORT_TOON[soort], soort);
    for (const toon of Object.values(SOORT_TOON)) assert.ok(!["good", "bad", "warn"].includes(toon), toon);
  });
});

/* --------------------------------------------------------- de standen */

describe("standKnoppen", () => {
  it("MELCloud, uit: Uit voorop, dan de vijf standen, en Uit is gekozen", () => {
    const k = standKnoppen(raam);
    assert.deepEqual(labels(k), ["Uit", "Verwarmen", "Koelen", "Auto", "Drogen", "Ventileren"]);
    assert.deepEqual(gekozen(k), ["off"]);
  });

  it("MELCloud op koelen: Koelen is gekozen, Uit niet", () => {
    assert.deepEqual(gekozen(standKnoppen(zet(raam, "cool"))), ["cool"]);
  });

  it("de demo-hvac koelt: Koelen gekozen", () => {
    assert.deepEqual(gekozen(standKnoppen(hvac)), ["cool"]);
  });

  it("een warmtepomp die alleen kan verwarmen: twee knoppen", () => {
    const k = standKnoppen(heatpump);
    assert.deepEqual(labels(k), ["Uit", "Verwarmen"]);
    assert.deepEqual(gekozen(k), ["heat"]);
  });

  it("ecobee heeft heat_cool EN auto: dan heet heat_cool Warm/koud, geen twee keer Auto", () => {
    const k = standKnoppen(ecobee);
    assert.deepEqual(labels(k), ["Uit", "Koelen", "Warm/koud", "Auto", "Drogen", "Ventileren"]);
    assert.equal(new Set(labels(k)).size, k.length);
    assert.deepEqual(gekozen(k), ["heat_cool"]);
  });

  it("heat_cool zonder auto blijft gewoon Auto", () => {
    const k = standKnoppen(zet(ecobee, "heat_cool", { hvac_modes: ["off", "cool", "heat_cool"] }));
    assert.deepEqual(labels(k), ["Uit", "Koelen", "Auto"]);
  });

  it("onbereikbaar: de knoppen blijven staan, er is niets gekozen", () => {
    const dood = { entity_id: "climate.kantoor_raam", state: "unavailable", attributes: { hvac_modes: raam.attributes.hvac_modes, supported_features: 937 } };
    const k = standKnoppen(dood);
    assert.equal(k.length, 6);
    assert.deepEqual(gekozen(k), []);
  });

  it("Uit staat er alleen als de airco uit kan", () => {
    const zonderUit = zet(heatpump, "heat", { hvac_modes: ["heat", "cool"], supported_features: 1 });
    assert.deepEqual(labels(standKnoppen(zonderUit)), ["Verwarmen", "Koelen"]);
  });

  it("geen climate, of niets: geen knoppen", () => {
    assert.deepEqual(standKnoppen(null), []);
    assert.deepEqual(standKnoppen({ entity_id: "fan.x", state: "on", attributes: { hvac_modes: ["off", "cool"] } }), []);
  });
});

describe("standKnopOproep", () => {
  it("Uit zet uit (turn_off als de entiteit dat kan)", () => {
    assert.deepEqual(standKnopOproep(zet(raam, "cool"), "off"), ["climate", "turn_off", { entity_id: "climate.kantoor_raam" }]);
  });

  it("Uit zonder turn_off: de stand off", () => {
    const st = zet(raam, "cool", { supported_features: 1 });
    assert.deepEqual(standKnopOproep(st, "off"), ["climate", "set_hvac_mode", { entity_id: "climate.kantoor_raam", hvac_mode: "off" }]);
  });

  it("een stand kiezen zet hem ook aan", () => {
    assert.deepEqual(standKnopOproep(raam, "cool"), ["climate", "set_hvac_mode", { entity_id: "climate.kantoor_raam", hvac_mode: "cool" }]);
  });
});

/* -------------------------------------------------------- de ventilator */

describe("alsKnoppen: knoppen of een keuzelijst", () => {
  it("MELCloud (Auto 1 2 3 4 5) wordt knoppen", () => {
    const o = keuzesVan(raam, "ventilator");
    assert.deepEqual(o.map((x) => x.label), ["Auto", "1", "2", "3", "4", "5"]);
    assert.equal(alsKnoppen(o), true);
  });

  it("de demo (Laag Hoog Auto laag Auto hoog Uit) is te lang: een keuzelijst", () => {
    const o = keuzesVan(hvac, "ventilator");
    assert.equal(o.length, 5);
    assert.equal(alsKnoppen(o), false);
  });

  it("Auto Laag Midden Hoog past nog", () => {
    const o = ["Auto", "Laag", "Midden", "Hoog"].map((label) => ({ waarde: label, label }));
    assert.equal(alsKnoppen(o), true);
  });

  it("meer dan zes is altijd een lijst, en één of geen keuze is niets", () => {
    const zeven = ["1", "2", "3", "4", "5", "6", "7"].map((label) => ({ waarde: label, label }));
    assert.equal(alsKnoppen(zeven), false);
    assert.equal(alsKnoppen([{ waarde: "auto", label: "Auto" }]), false);
    assert.equal(alsKnoppen([]), false);
    assert.equal(alsKnoppen(undefined), false);
  });
});

/* ------------------------------------------------------------- tegels */

describe("aircoFeiten", () => {
  it("MELCloud: alleen de energie van deze maand, van hetzelfde apparaat", () => {
    const delen = apparaatDelen(hassDump, "climate.kantoor_raam");
    const t = aircoFeiten(hassDump, raam, { delen });
    assert.deepEqual(t, [
      { sleutel: "energie", label: "Deze maand", waarde: "0,0", eenheid: "kWh", id: "sensor.kantoor_raam_energy_consumed_monthly" },
    ]);
  });

  it("de demo-hvac zonder apparaat: de vochtigheid uit de entiteit zelf", () => {
    const t = aircoFeiten({ states: { "climate.hvac": hvac }, entities: {} }, hvac, {});
    assert.deepEqual(t, [{ sleutel: "vocht", label: "Vochtigheid", waarde: "54", eenheid: "%", id: "climate.hvac" }]);
  });

  it("de warmtepomp heeft niets te melden: geen tegels", () => {
    assert.deepEqual(aircoFeiten({ states: {}, entities: {} }, heatpump, {}), []);
  });

  it("alle vier, in deze volgorde: energie, vermogen, vochtigheid, buiten", () => {
    const states = {
      "sensor.e": { entity_id: "sensor.e", state: "12.34", attributes: { unit_of_measurement: "kWh" } },
      "sensor.p": { entity_id: "sensor.p", state: "640", attributes: { unit_of_measurement: "W" } },
      "sensor.v": { entity_id: "sensor.v", state: "61", attributes: { unit_of_measurement: "%" } },
      "sensor.b": { entity_id: "sensor.b", state: "8.25", attributes: { unit_of_measurement: "°C" } },
    };
    const delen = { energie: "sensor.e", vermogen: "sensor.p", vocht: "sensor.v", buiten: "sensor.b" };
    const t = aircoFeiten({ states, entities: { "sensor.e": { translation_key: "energy_today" } } }, hvac, { delen });
    assert.deepEqual(t.map((x) => x.sleutel), ["energie", "vermogen", "vocht", "buiten"]);
    assert.deepEqual(t.map((x) => `${x.waarde} ${x.eenheid}`), ["12,3 kWh", "640 W", "61 %", "8,3 °C"]);
    assert.equal(t[0].label, "Vandaag");
    // De sensor gaat voor de vochtigheid die de airco zelf meldt (54,2).
    assert.equal(t[2].id, "sensor.v");
  });

  it("de energiesensor uit de editor wint van die van het apparaat", () => {
    const states = {
      "sensor.apparaat": { entity_id: "sensor.apparaat", state: "1", attributes: { unit_of_measurement: "kWh" } },
      "sensor.gekozen": { entity_id: "sensor.gekozen", state: "2", attributes: { unit_of_measurement: "kWh" } },
    };
    const t = aircoFeiten({ states, entities: {} }, heatpump, { delen: { energie: "sensor.apparaat" }, energie: "sensor.gekozen" });
    assert.deepEqual(t.map((x) => x.id), ["sensor.gekozen"]);
  });

  it("een sensor zonder getal geeft geen tegel", () => {
    const states = {
      "sensor.e": { entity_id: "sensor.e", state: "unavailable", attributes: {} },
      "sensor.b": { entity_id: "sensor.b", state: "unknown", attributes: {} },
    };
    assert.deepEqual(aircoFeiten({ states, entities: {} }, heatpump, { delen: { energie: "sensor.e", buiten: "sensor.b" } }), []);
  });

  it("zonder eenheid valt hij terug op wat er hoort", () => {
    const states = { "sensor.e": { entity_id: "sensor.e", state: "3", attributes: {} } };
    const [t] = aircoFeiten({ states, entities: {} }, heatpump, { delen: { energie: "sensor.e" } });
    assert.equal(t.eenheid, "kWh");
    assert.equal(t.label, "Verbruik");
  });
});

/* --------------------------------------------------------------- foto */

describe("de foto", () => {
  const mitsubishi = dump.devices.apparaat_airco_1;
  const FOTOS = {
    mitsubishi: { label: "Mitsubishi", pad: "aircos/mitsubishi.webp", merk: "mitsubishi" },
    mitsubishi_ln: { label: "Mitsubishi LN", pad: "aircos/mitsubishi-ln.webp", merk: "mitsubishi", model: "msz-ln" },
  };

  it("NIEUW GEDRAG (0.63.1): de Mitsubishi Premium is te kiezen, maar Automatisch kiest hem niet", () => {
    // Zijn keuze op 13 oktober 2026: "Alleen als ik hem kies". MELCloud geeft
    // geen model door, en een witte Mitsubishi mag geen zwarte unit worden.
    assert.deepEqual(Object.keys(AIRCO_FOTOS), ["mitsubishi_premium_onyx", "fujitsu_general"]);
    assert.equal(fotoBijAirco(mitsubishi), null);
    assert.equal(aircoAfbeelding("auto", mitsubishi, ""), "");
    assert.equal(aircoAfbeelding(undefined, mitsubishi, ""), "");
    assert.equal(
      aircoAfbeelding("mitsubishi_premium_onyx", mitsubishi, ""),
      "/domotiapp_lovelace/afbeeldingen/aircos/mitsubishi-premium-onyx-black.webp"
    );
  });

  it("op merk, en een passend model gaat voor", () => {
    assert.equal(fotoBijAirco(mitsubishi, FOTOS), "mitsubishi"); // model is null in de dump
    assert.equal(fotoBijAirco({ manufacturer: "Mitsubishi Electric", model: "MSZ-LN25VG" }, FOTOS), "mitsubishi_ln");
    assert.equal(fotoBijAirco({ manufacturer: "Daikin", model: "FTXM25R" }, FOTOS), null);
    assert.equal(fotoBijAirco(null, FOTOS), null);
  });

  it("automatisch: de foto bij het apparaat, of de eigen afbeelding als die er is", () => {
    const ln = { manufacturer: "Mitsubishi Electric", model: "MSZ-LN25VG" };
    assert.equal(aircoAfbeelding("auto", ln, "", FOTOS), "/domotiapp_lovelace/afbeeldingen/aircos/mitsubishi-ln.webp");
    assert.equal(aircoAfbeelding("auto", ln, "/local/mijn.png", FOTOS), "/local/mijn.png");
  });

  it("een gekozen model, eigen, en geen", () => {
    assert.equal(aircoAfbeelding("mitsubishi", null, "", FOTOS), "/domotiapp_lovelace/afbeeldingen/aircos/mitsubishi.webp");
    assert.equal(aircoAfbeelding("eigen", mitsubishi, "/local/a.png", FOTOS), "/local/a.png");
    assert.equal(aircoAfbeelding("eigen", mitsubishi, "", FOTOS), "");
    assert.equal(aircoAfbeelding("geen", mitsubishi, "/local/a.png", FOTOS), "");
  });

  it("een keuze die geen foto is, wordt er geen", () => {
    assert.equal(aircoAfbeelding("constructor", null, ""), "");
    assert.equal(aircoAfbeelding("bestaat_niet", null, "/local/a.png"), "/local/a.png");
  });
});
