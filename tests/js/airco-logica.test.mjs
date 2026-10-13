/**
 * Een airco, universeel: wat de kaart en het infoscherm ervan lezen, en welke
 * service ze aanroepen.
 *
 * NIEUW GEDRAG: `src/cards/airco-logica.js` bestond niet vóór 13 oktober 2026.
 *
 * De invoer is echt: de MELCloud Home-dump komt uit de installatie van een
 * klant (geanonimiseerd, `vaste-invoer/melcloud-home-airco.json`), en de drie
 * andere zijn de demo-airco's van Home Assistant 2026.8 zoals ze in de
 * testinstance staan. Samen dekken ze een airco zonder `hvac_action`, een met,
 * een die alleen kan verwarmen, en een met een bereik in plaats van een doel.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  FUNCTIE,
  aanUitOproep,
  aircoStand,
  aircoStanden,
  apparaatDelen,
  doelInstelling,
  doelOproep,
  doelTekst,
  energieLabel,
  gekozenStand,
  graden,
  kan,
  keuzeNu,
  keuzeOproep,
  keuzesVan,
  lamelLabel,
  statusTekst,
  ventilatorLabel,
  volgendeWaarde,
} from "../../src/cards/airco-logica.js";

const dump = JSON.parse(readFileSync(new URL("./vaste-invoer/melcloud-home-airco.json", import.meta.url), "utf8"));
const raam = dump.states["climate.kantoor_raam"];
const hass = { states: dump.states, entities: dump.entities, devices: dump.devices };

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
    target_temp_high: null,
    target_temp_low: null,
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
const aan = (st, stand) => ({ ...st, state: stand });

describe("de stand van een airco", () => {
  it("MELCloud, uit: geen actie, wel de kamer en het doel", () => {
    const s = aircoStand(raam);
    assert.equal(s.beschikbaar, true);
    assert.equal(s.aan, false);
    assert.equal(s.soort, "uit");
    assert.equal(s.huidig, 17.5);
    assert.equal(s.doel, 24);
    assert.equal(statusTekst(s), "Uit");
  });

  it("MELCloud zonder hvac_action: de stand zegt wat er gevraagd is", () => {
    const s = aircoStand(aan(raam, "cool"));
    assert.equal(s.actie, null);
    assert.equal(s.soort, "koud");
    assert.equal(statusTekst(s), "Koelen");
    assert.equal(statusTekst(aircoStand(aan(raam, "heat"))), "Verwarmen");
    assert.equal(statusTekst(aircoStand(aan(raam, "fan_only"))), "Ventileren");
    assert.equal(aircoStand(aan(raam, "auto")).soort, "auto");
  });

  it("met hvac_action wint wat hij DOET, en standby noemt de stand erbij", () => {
    assert.equal(statusTekst(aircoStand(hvac)), "Koelt");
    assert.equal(statusTekst(aircoStand(heatpump)), "Verwarmt");
    const auto = { ...hvac, state: "auto", attributes: { ...hvac.attributes, hvac_action: "heating" } };
    assert.equal(aircoStand(auto).soort, "warm");
    const stil = { ...hvac, attributes: { ...hvac.attributes, hvac_action: "idle" } };
    assert.equal(statusTekst(aircoStand(stil)), "Standby · Koelen");
    assert.equal(aircoStand(stil).soort, "stil");
  });

  it("een oude actie bij een airco die uit staat telt niet", () => {
    const s = aircoStand({ ...hvac, state: "off" });
    assert.equal(s.actie, null);
    assert.equal(statusTekst(s), "Uit");
  });

  it("onbereikbaar of weg", () => {
    assert.equal(statusTekst(aircoStand({ ...raam, state: "unavailable" })), "Niet bereikbaar");
    assert.equal(aircoStand(null).soort, "dood");
  });

  it("een bereik in plaats van een doel (ecobee)", () => {
    const s = aircoStand(ecobee);
    assert.equal(s.doel, null);
    assert.deepEqual([s.laag, s.hoog], [21, 24]);
    assert.equal(doelTekst(s, (n) => graden(n)), "21–24°");
    assert.equal(doelTekst(aircoStand(raam), (n) => graden(n)), "24°");
  });

  it("de gekozen sensor wint, de sensor van het apparaat is reserve", () => {
    const sensor = { state: "19.2" };
    assert.equal(aircoStand(raam, { sensor }).huidig, 19.2);
    assert.equal(aircoStand(raam, { reserve: sensor }).huidig, 17.5);
    const zonder = { ...raam, attributes: { ...raam.attributes, current_temperature: null } };
    assert.equal(aircoStand(zonder, { reserve: sensor }).huidig, 19.2);
    assert.equal(aircoStand(zonder).huidig, null);
  });

  it("graden zoals een mens ze leest", () => {
    assert.equal(graden(21), "21");
    assert.equal(graden(21.5), "21,5");
  });
});

describe("aan en uit", () => {
  it("MELCloud kan turn_on en turn_off (937 = met AAN en UIT)", () => {
    assert.equal(kan(raam, FUNCTIE.AAN), true);
    assert.deepEqual(aanUitOproep(raam, true), ["climate", "turn_on", { entity_id: "climate.kantoor_raam" }]);
    assert.deepEqual(aanUitOproep(raam, false), ["climate", "turn_off", { entity_id: "climate.kantoor_raam" }]);
  });

  it("zonder turn_on kiest de kaart zelf een stand, en zonder turn_off de stand Uit", () => {
    const oud = { ...raam, attributes: { ...raam.attributes, supported_features: 1 } };
    assert.deepEqual(aanUitOproep(oud, true), ["climate", "set_hvac_mode", { entity_id: "climate.kantoor_raam", hvac_mode: "auto" }]);
    assert.deepEqual(aanUitOproep(oud, false), ["climate", "set_hvac_mode", { entity_id: "climate.kantoor_raam", hvac_mode: "off" }]);
    const alleenWarm = { ...heatpump, attributes: { ...heatpump.attributes, supported_features: 1 } };
    assert.deepEqual(aanUitOproep(alleenWarm, true)[2].hvac_mode, "heat");
  });

  it("niets bij een onbereikbare airco", () => {
    assert.equal(aanUitOproep({ ...raam, state: "unavailable" }, true), null);
  });
});

describe("de standen", () => {
  it("zonder Uit, in het Nederlands, in de volgorde van de entiteit", () => {
    assert.deepEqual(
      aircoStanden(raam).map((o) => o.label),
      ["Verwarmen", "Koelen", "Auto", "Drogen", "Ventileren"]
    );
    assert.deepEqual(aircoStanden(heatpump).map((o) => o.waarde), ["heat"]);
  });

  it("NIEUW GEDRAG: heat_cool naast auto heet Warm/koud, niet twee keer Auto", () => {
    assert.deepEqual(
      aircoStanden(ecobee).map((o) => o.label),
      ["Koelen", "Warm/koud", "Auto", "Drogen", "Ventileren"]
    );
    const alleen = { ...ecobee, attributes: { ...ecobee.attributes, hvac_modes: ["off", "heat_cool"] } };
    assert.deepEqual(aircoStanden(alleen).map((o) => o.label), ["Auto"]);
  });

  it("de gekozen stand licht op, en uit is geen stand", () => {
    assert.equal(gekozenStand(hvac), "cool");
    assert.equal(gekozenStand(raam), "");
  });
});

describe("het doel", () => {
  it("een halve graad per tik, binnen min en max", () => {
    const inst = doelInstelling(raam);
    assert.deepEqual(inst, { soort: "enkel", min: 7, max: 35, stap: 0.5, doel: 24 });
    assert.equal(volgendeWaarde(inst, "doel", null, 1), 24.5);
    assert.equal(volgendeWaarde(inst, "doel", 24.5, 1), 25);
    assert.equal(volgendeWaarde({ ...inst, doel: 35 }, "doel", null, 1), 35);
    assert.deepEqual(doelOproep(raam, { doel: 22.5 }), [
      "climate",
      "set_temperature",
      { entity_id: "climate.kantoor_raam", temperature: 22.5 },
    ]);
  });

  it("de stap van de entiteit gaat voor, en Fahrenheit tikt in hele graden", () => {
    const stap = { ...raam, attributes: { ...raam.attributes, target_temp_step: 1 } };
    assert.equal(doelInstelling(stap).stap, 1);
    assert.equal(doelInstelling(raam, "°F").stap, 1);
  });

  it("bij een bereik gaan laag en hoog samen, en ze schuiven niet over elkaar", () => {
    const inst = doelInstelling(ecobee);
    assert.equal(inst.soort, "bereik");
    assert.equal(volgendeWaarde(inst, "laag", 23.5, 1), 23.5);
    assert.equal(volgendeWaarde(inst, "hoog", 21.5, -1), 21.5);
    assert.deepEqual(doelOproep(ecobee, { laag: 20, hoog: 24 }), [
      "climate",
      "set_temperature",
      { entity_id: "climate.ecobee", target_temp_low: 20, target_temp_high: 24 },
    ]);
  });

  it("geen doel, geen stelknop", () => {
    const zonder = { ...raam, attributes: { ...raam.attributes, temperature: null } };
    assert.equal(doelInstelling(zonder), null);
    assert.equal(doelInstelling({ ...raam, state: "unavailable" }), null);
  });
});

describe("ventilator, lamellen en programma", () => {
  it("MELCloud: Auto en vijf standen als cijfers", () => {
    assert.deepEqual(
      keuzesVan(raam, "ventilator").map((o) => o.label),
      ["Auto", "1", "2", "3", "4", "5"]
    );
    assert.equal(keuzeNu(raam, "ventilator"), "auto");
    assert.deepEqual(keuzeOproep(raam, "ventilator", "speed_3"), [
      "climate",
      "set_fan_mode",
      { entity_id: "climate.kantoor_raam", fan_mode: "speed_3" },
    ]);
  });

  it("MELCloud: lamellen op en neer en opzij", () => {
    assert.deepEqual(
      keuzesVan(raam, "lamellen").map((o) => o.label),
      ["Auto", "Zwaaien", "1", "2", "3", "4", "5"]
    );
    assert.deepEqual(
      keuzesVan(raam, "lamellen_opzij").map((o) => o.label),
      ["Auto", "Zwaaien", "Links", "Links-midden", "Midden", "Rechts-midden", "Rechts"]
    );
    assert.deepEqual(keuzeOproep(raam, "lamellen_opzij", "left"), [
      "climate",
      "set_swing_horizontal_mode",
      { entity_id: "climate.kantoor_raam", swing_horizontal_mode: "left" },
    ]);
  });

  it("de demo-woorden van Home Assistant", () => {
    assert.deepEqual(
      keuzesVan(hvac, "ventilator").map((o) => o.label),
      ["Laag", "Hoog", "Auto laag", "Auto hoog", "Uit"]
    );
    assert.deepEqual(
      keuzesVan(hvac, "lamellen_opzij").map((o) => o.label),
      ["Auto", "Breed", "Vast"]
    );
    assert.deepEqual(
      keuzesVan(ecobee, "preset").map((o) => o.label),
      ["Thuis", "Eco", "Afwezig"]
    );
  });

  it("een waarde die de airco niet kent gaat niet naar Home Assistant", () => {
    assert.equal(keuzeOproep(raam, "ventilator", "turbo"), null);
    assert.equal(keuzeOproep(heatpump, "ventilator", "auto"), null);
    assert.deepEqual(keuzesVan(heatpump, "lamellen"), []);
  });

  it("onbekende woorden houden hun eigen naam", () => {
    assert.equal(ventilatorLabel("Nanoe X"), "Nanoe X");
    assert.equal(lamelLabel("position_12"), "12");
  });
});

describe("de rest van het apparaat", () => {
  it("MELCloud: de kamertemperatuur, de energie en de storing op hetzelfde apparaat", () => {
    assert.deepEqual(apparaatDelen(hass, "climate.kantoor_raam"), {
      kamer: "sensor.kantoor_raam_room_temperature",
      energie: "sensor.kantoor_raam_energy_consumed_monthly",
      storing: "binary_sensor.kantoor_raam_error",
    });
    // En niet die van de andere airco.
    assert.equal(apparaatDelen(hass, "climate.kantoor_deur").kamer, "sensor.kantoor_deur_room_temperature");
  });

  it("de energie telt per maand", () => {
    const id = "sensor.kantoor_raam_energy_consumed_monthly";
    assert.equal(energieLabel(id, dump.entities[id]), "Deze maand");
    assert.equal(energieLabel("sensor.airco_energie", {}), "Verbruik");
  });

  it("een buitenvoeler is geen kamertemperatuur, en zonder apparaat is er niets", () => {
    const h = {
      entities: {
        "climate.x": { device_id: "d" },
        "sensor.x_outdoor_temperature": { device_id: "d", translation_key: "outdoor_temperature" },
        "sensor.x_inside": { device_id: "d" },
      },
      states: {
        "sensor.x_outdoor_temperature": { state: "9", attributes: { device_class: "temperature" } },
        "sensor.x_inside": { state: "21", attributes: { device_class: "temperature" } },
      },
    };
    assert.deepEqual(apparaatDelen(h, "climate.x"), { buiten: "sensor.x_outdoor_temperature", kamer: "sensor.x_inside" });
    assert.deepEqual(apparaatDelen(h, "climate.zonder"), {});
  });
});
