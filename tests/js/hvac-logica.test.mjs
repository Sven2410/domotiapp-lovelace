/**
 * De HVAC-kaart: soorten, tegels, statusregel, standen en het doel.
 *
 * NIEUW GEDRAG: `src/cards/hvac-logica.js` bestond niet vóór deze ronde
 * (7 september 2026).
 *
 * Wat hier bewaakt wordt is het soort fout dat op een dashboard stilletjes
 * misgaat: een standknop die de verkeerde service aanroept (en dus niets doet,
 * zonder fout), een ventilator op 40% waar géén stand oplicht, een storing die
 * onder "Verwarmt" verdwijnt, en 640 ppm dat als 640,0 verschijnt.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  SOORTEN,
  boostIsSchakelaar,
  boostOproep,
  cijfers,
  doelBereik,
  doelOproep,
  filterWaarschuwing,
  formatteer,
  huidigeStand,
  huidigeTemperatuur,
  soortDef,
  standLabel,
  standOproep,
  standen,
  statusRegel,
  tegel,
  tegels,
  veldenMetRol,
  veldenVan,
  ventilatorOproep,
  ventilatorStanden,
  volgendDoel,
} from "../../src/cards/hvac-logica.js";

const st = (entity_id, state, attributes = {}) => ({ entity_id, state, attributes });

describe("de soorten", () => {
  it("zijn er vier, elk met een hoofdveld dat 'entity' heet", () => {
    assert.deepEqual(Object.keys(SOORTEN), ["airco", "warmtepomp", "ventilatie", "boiler"]);
    for (const soort of Object.keys(SOORTEN)) {
      const hoofd = veldenMetRol(soort, "hoofd");
      assert.equal(hoofd.length, 1, soort);
      assert.equal(hoofd[0].key, "entity", soort);
    }
  });

  it("hebben unieke sleutels per soort, anders overschrijft een veld een ander", () => {
    for (const soort of Object.keys(SOORTEN)) {
      const keys = veldenVan(soort).map((v) => v.key);
      assert.equal(new Set(keys).size, keys.length, soort);
    }
  });

  it("vallen bij een onbekende soort terug op de airco", () => {
    assert.equal(soortDef("koelkast").naam, "Airco");
    assert.equal(soortDef(undefined).icoon, "airco");
  });

  it("de warmtepomp biedt de meeste metingen", () => {
    assert.ok(veldenMetRol("warmtepomp", "tegel").length >= 10);
    assert.ok(veldenMetRol("ventilatie", "tegel").some((v) => v.key === "co2"));
  });
});

describe("standLabel", () => {
  it("vertaalt de woorden van fabrikanten", () => {
    assert.equal(standLabel("low"), "Laag");
    assert.equal(standLabel("High"), "Hoog");
    assert.equal(standLabel("fan_only"), "Ventileren");
    assert.equal(standLabel("heat_pump"), "Warmtepomp");
    assert.equal(standLabel("Away"), "Afwezig");
  });

  it("laat een onbekend woord heel, met een hoofdletter", () => {
    assert.equal(standLabel("stand 2"), "Stand 2");
    assert.equal(standLabel("tapwater"), "Tapwater");
    assert.equal(standLabel("some_mode"), "Some mode");
    assert.equal(standLabel(""), "");
  });
});

describe("cijfers en formatteer", () => {
  it("geeft per eenheid het aantal decimalen dat een mens verwacht", () => {
    assert.equal(cijfers("°C", 21.43), 1);
    assert.equal(cijfers("ppm", 640), 0);
    assert.equal(cijfers("W", 1250), 0);
    assert.equal(cijfers("kWh", 3.456), 1);
    assert.equal(cijfers("kWh", 123.4), 0);
    assert.equal(cijfers("", 4.567), 2); // een COP zonder eenheid
    assert.equal(cijfers("", 45.67), 1);
  });

  it("schrijft Nederlands", () => {
    assert.equal(formatteer(21.43, "°C"), "21,4");
    assert.equal(formatteer(1250, "W"), "1.250");
    assert.equal(formatteer("abc", "W"), "--");
  });
});

describe("tegel en tegels", () => {
  const veld = (key) => veldenVan("ventilatie").find((v) => v.key === key);

  it("leest een getal met de eenheid van de sensor", () => {
    const t = tegel(veld("co2"), st("sensor.co2", "640", { unit_of_measurement: "ppm" }));
    assert.deepEqual(t, { key: "co2", label: "CO₂", waarde: "640", eenheid: "ppm", let: "" });
  });

  it("valt terug op de eenheid van het veld", () => {
    const t = tegel(veld("temperature"), st("sensor.t", "21.44"));
    assert.equal(t.waarde, "21,4");
    assert.equal(t.eenheid, "°C");
  });

  it("oordeelt over CO2 en over het filter, en over niets anders", () => {
    assert.equal(tegel(veld("co2"), st("sensor.co2", "1250")).let, "warn");
    assert.equal(tegel(veld("co2"), st("sensor.co2", "1700")).let, "bad");
    assert.equal(tegel(veld("filter"), st("binary_sensor.f", "on")).let, "warn");
    assert.equal(tegel(veld("filter"), st("binary_sensor.f", "on")).waarde, "Vervangen");
    assert.equal(tegel(veld("filter"), st("sensor.f", "0", { unit_of_measurement: "d" })).let, "warn");
    assert.equal(tegel(veld("humidity"), st("sensor.h", "95")).let, "");
  });

  it("zegt Open of Dicht bij de bypass", () => {
    assert.equal(tegel(veld("bypass"), st("binary_sensor.b", "on")).waarde, "Open");
    assert.equal(tegel(veld("bypass"), st("binary_sensor.b", "off")).waarde, "Dicht");
  });

  it("toont -- voor een sensor die niet bereikbaar is, maar laat hem niet weg", () => {
    const lees = (id) => (id === "sensor.co2" ? st(id, "unavailable") : null);
    const uit = tegels("ventilatie", { co2: "sensor.co2", humidity: "sensor.weg" }, lees);
    assert.equal(uit.length, 2);
    assert.equal(uit[0].waarde, "--");
    assert.equal(uit[1].waarde, "--");
  });

  it("houdt de volgorde van de soort aan, niet die van de config", () => {
    const lees = (id) => st(id, "1");
    const uit = tegels("warmtepomp", { power: "sensor.p", flow_temp: "sensor.a", cop: "sensor.c" }, lees);
    assert.deepEqual(
      uit.map((t) => t.key),
      ["flow_temp", "cop", "power"]
    );
  });
});

describe("statusRegel", () => {
  const airco = (state, attributes) => st("climate.airco", state, attributes);

  it("laat een storing alles verslaan", () => {
    const r = statusRegel({
      soort: "warmtepomp",
      hoofd: airco("heat", { hvac_action: "heating" }),
      fault: st("binary_sensor.storing", "on"),
    });
    assert.equal(r.tekst, "Storing");
    assert.equal(r.tone, "bad");
  });

  it("zegt Niet bereikbaar bij een dode hoofdentiteit", () => {
    const r = statusRegel({ soort: "airco", hoofd: airco("unavailable") });
    assert.equal(r.tekst, "Niet bereikbaar");
    assert.equal(r.tone, "neutral");
  });

  it("leest hvac_action van een climate, met de juiste kleur", () => {
    assert.deepEqual(statusRegel({ hoofd: airco("cool", { hvac_action: "cooling" }) }).tone, "water");
    assert.equal(statusRegel({ hoofd: airco("cool", { hvac_action: "cooling" }) }).tekst, "Koelt");
    assert.equal(statusRegel({ hoofd: airco("heat", { hvac_action: "heating" }) }).tone, "solar");
    assert.equal(statusRegel({ hoofd: airco("heat", { hvac_action: "idle" }) }).tekst, "Standby");
    assert.equal(statusRegel({ hoofd: airco("off") }).tekst, "Uit");
  });

  it("zet de statussensor van een warmtepomp erachter", () => {
    const r = statusRegel({
      soort: "warmtepomp",
      hoofd: airco("heat", { hvac_action: "heating" }),
      status: st("sensor.status", "tapwater"),
    });
    assert.equal(r.tekst, "Verwarmt · Tapwater");
  });

  it("leest een ventilator op preset of op percentage", () => {
    const fan = (state, attributes) => st("fan.wtw", state, attributes);
    assert.equal(statusRegel({ hoofd: fan("on", { preset_mode: "low" }) }).tekst, "Ventileert · Laag");
    assert.equal(statusRegel({ hoofd: fan("on", { percentage: 66 }) }).tekst, "Ventileert · 66%");
    assert.equal(statusRegel({ hoofd: fan("off") }).tekst, "Uit");
    assert.equal(statusRegel({ hoofd: fan("on", { percentage: 66 }) }).bezig, true);
  });

  it("leest een boiler, met de verwarmt-sensor als die er is", () => {
    const wh = st("water_heater.boiler", "eco", { temperature: 55 });
    assert.equal(statusRegel({ hoofd: wh }).tekst, "Eco");
    assert.equal(statusRegel({ hoofd: wh, heating: st("binary_sensor.v", "on") }).tekst, "Verwarmt · Eco");
    assert.equal(statusRegel({ hoofd: wh, heating: st("binary_sensor.v", "on") }).tone, "solar");
  });

  it("leest een keuzelijst als hoofdentiteit", () => {
    const sel = st("select.stand", "Stand 2", { options: ["Uit", "Stand 1", "Stand 2"] });
    assert.equal(statusRegel({ hoofd: sel }).tekst, "Stand · Stand 2");
    assert.equal(statusRegel({ hoofd: st("select.stand", "Uit") }).tekst, "Uit");
  });

  it("doet het ook zonder hoofdentiteit", () => {
    assert.equal(statusRegel({ soort: "ventilatie" }).tekst, "Ventilatie");
    assert.equal(statusRegel({ soort: "ventilatie", status: st("sensor.s", "stand 3") }).tekst, "Stand 3");
    assert.equal(statusRegel({ soort: "boiler", heating: st("binary_sensor.v", "on") }).tekst, "Verwarmt");
  });

  it("hangt het filter er als waarschuwing achter, in elke toestand", () => {
    const filter = st("binary_sensor.filter", "on");
    assert.equal(statusRegel({ hoofd: airco("heat", { hvac_action: "heating" }), filter }).waarschuwing, "Filter vervangen");
    assert.equal(statusRegel({ hoofd: airco("unavailable"), filter }).waarschuwing, "Filter vervangen");
    assert.equal(filterWaarschuwing(st("sensor.filter", "12")), "");
    assert.equal(filterWaarschuwing(st("sensor.filter", "0")), "Filter vervangen");
    assert.equal(filterWaarschuwing(st("binary_sensor.filter", "off")), "");
  });
});

describe("standen, huidigeStand en standOproep", () => {
  it("een climate: de hvac_modes, vertaald", () => {
    const cl = st("climate.a", "cool", { hvac_modes: ["off", "cool", "heat", "fan_only"] });
    assert.deepEqual(
      standen(cl).map((s) => s.label),
      ["Uit", "Koelen", "Verwarmen", "Ventileren"]
    );
    assert.equal(huidigeStand(cl), "cool");
    assert.deepEqual(standOproep(cl, "heat"), ["climate", "set_hvac_mode", { entity_id: "climate.a", hvac_mode: "heat" }]);
  });

  it("een boiler: de operation_list", () => {
    const wh = st("water_heater.b", "eco", { operation_list: ["eco", "performance", "off"] });
    assert.deepEqual(
      standen(wh).map((s) => s.label),
      ["Eco", "Snel", "Uit"]
    );
    assert.deepEqual(standOproep(wh, "performance"), [
      "water_heater",
      "set_operation_mode",
      { entity_id: "water_heater.b", operation_mode: "performance" },
    ]);
  });

  it("een keuzelijst: de opties, met het juiste domein in de service", () => {
    const sel = st("input_select.stand", "Laag", { options: ["Laag", "Midden", "Hoog"] });
    assert.equal(standen(sel).length, 3);
    assert.equal(huidigeStand(sel), "Laag");
    assert.deepEqual(standOproep(sel, "Hoog"), ["input_select", "select_option", { entity_id: "input_select.stand", option: "Hoog" }]);
    assert.equal(standOproep(st("select.s", "a", { options: ["a"] }), "a")[0], "select");
  });

  it("een ventilator met presets", () => {
    const fan = st("fan.wtw", "on", { preset_modes: ["low", "medium", "high", "auto"], preset_mode: "medium" });
    assert.deepEqual(
      standen(fan).map((s) => s.label),
      ["Laag", "Midden", "Hoog", "Auto"]
    );
    assert.equal(huidigeStand(fan), "medium");
    assert.deepEqual(standOproep(fan, "high"), ["fan", "set_preset_mode", { entity_id: "fan.wtw", preset_mode: "high" }]);
  });

  it("een ventilator op percentage: vier stappen, en de dichtstbijzijnde licht op", () => {
    const fan = st("fan.wtw", "on", { percentage: 40, percentage_step: 1 });
    assert.deepEqual(
      standen(fan).map((s) => s.waarde),
      ["0", "33", "66", "100"]
    );
    assert.equal(huidigeStand(fan), "33");
    assert.deepEqual(standOproep(fan, "66"), ["fan", "set_percentage", { entity_id: "fan.wtw", percentage: 66 }]);
    assert.deepEqual(standOproep(fan, "0"), ["fan", "turn_off", { entity_id: "fan.wtw" }]);
  });

  it("een ventilator met grove stappen rondt de stappen af op wat hij kan", () => {
    const fan = st("fan.wtw", "on", { percentage: 50, percentage_step: 25 });
    assert.deepEqual(
      standen(fan).map((s) => s.waarde),
      ["0", "25", "75", "100"]
    );
    assert.equal(huidigeStand(fan), "25");
  });

  it("een uitgeschakelde ventilator licht Uit op", () => {
    const fan = st("fan.wtw", "off", { percentage: 0, percentage_step: 1 });
    assert.equal(huidigeStand(fan), "0");
  });

  it("geeft null voor wat niet kan", () => {
    assert.equal(standOproep(null, "x"), null);
    assert.equal(standOproep(st("climate.a", "cool"), ""), null);
    assert.equal(standOproep(st("sensor.a", "1"), "x"), null);
    assert.deepEqual(standen(st("sensor.a", "1")), []);
    assert.equal(huidigeStand(st("climate.a", "unavailable", { hvac_modes: ["off"] })), "");
  });
});

describe("de ventilatorsnelheid van een airco", () => {
  const cl = st("climate.a", "cool", { fan_modes: ["auto", "low", "high"], fan_mode: "low" });
  it("leest fan_modes", () => {
    assert.deepEqual(
      ventilatorStanden(cl).map((s) => s.label),
      ["Auto", "Laag", "Hoog"]
    );
    assert.deepEqual(ventilatorOproep(cl, "high"), ["climate", "set_fan_mode", { entity_id: "climate.a", fan_mode: "high" }]);
  });
  it("weigert een stand die de airco niet kent", () => {
    assert.equal(ventilatorOproep(cl, "turbo"), null);
    assert.deepEqual(ventilatorStanden(st("fan.x", "on", { fan_modes: ["a"] })), []);
  });
});

describe("het doel", () => {
  it("een climate stelt in halve graden binnen zijn bereik", () => {
    const cl = st("climate.a", "heat", { temperature: 20, min_temp: 7, max_temp: 30, current_temperature: 19.5 });
    const b = doelBereik(cl);
    assert.deepEqual(b, { min: 7, max: 30, stap: 0.5, doel: 20, huidig: 19.5 });
    assert.equal(volgendDoel(b, 20, 1), 20.5);
    assert.equal(volgendDoel(b, 29.8, 1), 30);
    assert.equal(volgendDoel(b, 7, -1), 7);
  });

  it("een boiler stelt in hele graden, en volgt zijn eigen stap als hij die meldt", () => {
    assert.equal(doelBereik(st("water_heater.b", "eco", { temperature: 55 })).stap, 1);
    assert.equal(doelBereik(st("water_heater.b", "eco", { temperature: 55, target_temp_step: 5 })).stap, 5);
    assert.equal(doelBereik(st("climate.a", "heat", { temperature: 20 }), 0.1).stap, 0.1);
  });

  it("heeft geen doel zonder temperatuur, en niet voor een ventilator", () => {
    assert.equal(doelBereik(st("climate.a", "fan_only", {})), null);
    assert.equal(doelBereik(st("climate.a", "unavailable", { temperature: 20 })), null);
    assert.equal(doelBereik(st("fan.a", "on", { temperature: 20 })), null);
  });

  it("stuurt naar het juiste domein", () => {
    assert.deepEqual(doelOproep(st("climate.a", "heat"), 21), ["climate", "set_temperature", { entity_id: "climate.a", temperature: 21 }]);
    assert.deepEqual(doelOproep(st("water_heater.b", "eco"), 60), ["water_heater", "set_temperature", { entity_id: "water_heater.b", temperature: 60 }]);
    assert.equal(doelOproep(st("fan.a", "on"), 21), null);
    assert.equal(doelOproep(st("climate.a", "heat"), NaN), null);
  });

  it("rondt netjes af: geen 20,500000001", () => {
    const b = { min: 5, max: 35, stap: 0.1, doel: 20.2 };
    assert.equal(volgendDoel(b, 20.2, 1), 20.3);
  });
});

describe("de boost", () => {
  it("is een schakelaar bij een switch en een knop bij de rest", () => {
    assert.equal(boostIsSchakelaar("switch.boost"), true);
    assert.equal(boostIsSchakelaar("input_boolean.boost"), true);
    assert.equal(boostIsSchakelaar("button.boost"), false);
    assert.equal(boostIsSchakelaar("script.boost"), false);
  });

  it("kiest de service per domein", () => {
    assert.deepEqual(boostOproep("switch.b", true), ["homeassistant", "turn_on", { entity_id: "switch.b" }]);
    assert.deepEqual(boostOproep("switch.b", false), ["homeassistant", "turn_off", { entity_id: "switch.b" }]);
    assert.deepEqual(boostOproep("button.b"), ["button", "press", { entity_id: "button.b" }]);
    assert.deepEqual(boostOproep("input_button.b"), ["input_button", "press", { entity_id: "input_button.b" }]);
    assert.deepEqual(boostOproep("script.b"), ["script", "turn_on", { entity_id: "script.b" }]);
    assert.equal(boostOproep("sensor.b"), null);
  });
});

describe("huidigeTemperatuur", () => {
  it("laat de aangewezen sensor winnen van het apparaat", () => {
    const cl = st("climate.a", "heat", { current_temperature: 19 });
    assert.equal(huidigeTemperatuur(cl, st("sensor.t", "21.5")), 21.5);
    assert.equal(huidigeTemperatuur(cl, st("sensor.t", "unavailable")), 19);
    assert.equal(huidigeTemperatuur(cl, null), 19);
    assert.equal(huidigeTemperatuur(null, null), null);
  });

  it("leest current_temperature: null NIET als nul graden", () => {
    // De demo-boiler van Home Assistant stond zo op "0,0 °C".
    const wh = st("water_heater.b", "eco", { current_temperature: null });
    assert.equal(huidigeTemperatuur(wh, null), null);
    assert.equal(huidigeTemperatuur(st("climate.a", "heat", { current_temperature: 0 }), null), 0);
  });
});
