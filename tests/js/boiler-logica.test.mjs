/**
 * De warmtepompboilerkaart (15 oktober 2026), tegen de echte dump van een LG
 * WH27S bij een klant: core-integratie `lg_thinq`, vijf entiteiten, op dat
 * moment in Turbo (`performance`) op 58 graden.
 *
 * NIEUW GEDRAG: boiler-logica.js en productfoto.js bestonden niet vóór deze
 * ronde. Tegen de bron van daarvoor faalt dit bestand bij het importeren
 * ("Cannot find module").
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  BOILERS,
  STANDEN,
  boilerAfbeelding,
  boilerDelen,
  boilerStand,
  breedteVan,
  doelInstelling,
  doelOproep,
  grafiekPaden,
  graden,
  merkKeuzes,
  naamVan,
  schaal,
  standKnoppen,
  standOproep,
  tijdLabels,
  typeBijApparaat,
  typeKeuzes,
  uitersten,
  volgendDoel,
  waardeOp,
  waterReeks,
} from "../../src/cards/boiler-logica.js";
import { AFBEELDINGEN_BASIS, metType } from "../../src/cards/productfoto.js";

const lg = JSON.parse(readFileSync(new URL("./vaste-invoer/lg-wh27s.json", import.meta.url), "utf8"));
const ID = "water_heater.water_heater";
const st = lg.states[ID];
const apparaat = Object.values(lg.devices)[0];

function met(wijzigingen) {
  const states = { ...lg.states };
  for (const [id, w] of Object.entries(wijzigingen)) {
    states[id] = { ...states[id], ...w, attributes: { ...(states[id]?.attributes ?? {}), ...(w.attributes ?? {}) } };
  }
  return { ...lg, states };
}

describe("boilerDelen: de rest van het apparaat", () => {
  it("vindt de temperatuursensor en aan/uit op translation_key", () => {
    assert.deepEqual(boilerDelen(lg, ID), {
      water: "sensor.water_heater_current_temperature",
      aan: "binary_sensor.water_heater_vermogen",
    });
  });

  it("zonder apparaat: niets, en geen fout", () => {
    assert.deepEqual(boilerDelen({ entities: {}, states: {} }, ID), {});
  });
});

describe("naamVan", () => {
  it("'Water Heater' is de naam van de integratie: dan Boiler", () => {
    assert.equal(apparaat.name, "Water Heater");
    assert.equal(st.attributes.friendly_name, "Water Heater");
    assert.equal(naamVan(lg, ID), "Boiler");
  });
  it("een naam die de klant zelf gaf, gaat voor", () => {
    const h = { ...lg, devices: { [apparaat.id]: { ...apparaat, name_by_user: "Boiler zolder" } } };
    assert.equal(naamVan(h, ID), "Boiler zolder");
    assert.equal(naamVan(lg, ID, "Warm water"), "Warm water");
  });
});

describe("boilerStand: de kop", () => {
  it("de dump: Turbo, 58 graden, aan, warm", () => {
    assert.deepEqual(boilerStand(lg, ID, boilerDelen(lg, ID)), {
      beschikbaar: true,
      aan: true,
      stand: "performance",
      tekst: "Turbo",
      water: 58,
      soort: "turbo",
    });
  });

  it("uit volgens de power-sensor: Uit, neutraal", () => {
    const h = met({ "binary_sensor.water_heater_vermogen": { state: "off" } });
    const s = boilerStand(h, ID, boilerDelen(h, ID));
    assert.equal(s.tekst, "Uit");
    assert.equal(s.soort, "uit");
  });

  it("de watertemperatuur komt van de sensor, en anders van de boiler zelf", () => {
    const h = met({ "sensor.water_heater_current_temperature": { state: "unavailable" } });
    assert.equal(boilerStand(h, ID, boilerDelen(h, ID)).water, 58);
    const h2 = met({ "sensor.water_heater_current_temperature": { state: "51" } });
    assert.equal(boilerStand(h2, ID, boilerDelen(h2, ID)).water, 51);
  });

  it("onbereikbaar", () => {
    const h = met({ [ID]: { state: "unavailable" } });
    const s = boilerStand(h, ID, boilerDelen(h, ID));
    assert.equal(s.tekst, "Niet bereikbaar");
    assert.equal(s.soort, "dood");
  });
});

describe("de standen", () => {
  it("de vier van de eigenaar, in zijn volgorde, met Turbo gekozen", () => {
    assert.deepEqual(st.attributes.operation_list, ["heat_pump", "vacation", "performance", "eco"]);
    assert.deepEqual(
      standKnoppen(st).map((k) => [k.label, k.gekozen]),
      [["Warmtepomp", false], ["Auto", false], ["Turbo", true], ["Vakantie", false]],
    );
  });

  it("de woorden van LG naar die van Home Assistant: turbo is performance, auto is eco", () => {
    const opties = lg.states["select.water_heater_bedrijfsmodus"].attributes.options;
    assert.deepEqual(opties, ["heat_pump", "vacation", "turbo", "auto"]);
    assert.equal(STANDEN.find((s) => s.label === "Turbo").waarde, "performance");
    assert.equal(STANDEN.find((s) => s.label === "Auto").waarde, "eco");
  });

  it("de dienst is die van de water_heater", () => {
    assert.deepEqual(standOproep(st, "heat_pump"), [
      "water_heater",
      "set_operation_mode",
      { entity_id: ID, operation_mode: "heat_pump" },
    ]);
    assert.equal(standOproep(st, "turbo"), null, "de LG-naam is geen stand van de water_heater");
  });

  it("een stand die niet in de lijst staat, komt achteraan", () => {
    const ander = { ...st, attributes: { ...st.attributes, operation_list: ["eco", "electric", "off"] } };
    assert.deepEqual(standKnoppen(ander).map((k) => k.label), ["Auto", "Elektrisch", "Uit"]);
  });

  it("één stand is geen keuze", () => {
    assert.deepEqual(standKnoppen({ ...st, attributes: { ...st.attributes, operation_list: ["eco"] } }), []);
  });
});

describe("het doel", () => {
  it("35 tot 60 in stappen van 1, nu 58", () => {
    assert.deepEqual(doelInstelling(st), { doel: 58, min: 35, max: 60, stap: 1 });
  });
  it("omhoog en omlaag, en niet voorbij de grens", () => {
    const inst = doelInstelling(st);
    assert.equal(volgendDoel(inst, 58, 1), 59);
    assert.equal(volgendDoel(inst, 60, 1), 60);
    assert.equal(volgendDoel(inst, 35, -1), 35);
  });
  it("de dienst", () => {
    assert.deepEqual(doelOproep(st, 55), ["water_heater", "set_temperature", { entity_id: ID, temperature: 55 }]);
  });
  it("graden zonder eenheid", () => {
    assert.equal(graden(58), "58");
    assert.equal(graden(57.5), "57,5");
  });
});

describe("de grafiek", () => {
  const nu = Date.parse("2026-10-15T19:00:00+02:00");
  const uur = 3600000;
  // Zoals history_during_period ze geeft met minimal_response (lu in seconden).
  const rij = (urenTerug, s) => ({ s: String(s), lu: (nu - urenTerug * uur) / 1000 });
  const rijen = [rij(30, 55), rij(20, 52), rij(14, 46), rij(12, 55), rij(3, 49), rij(1, 58), { s: "unavailable", lu: (nu - 0.5 * uur) / 1000 }];

  it("24 uur tot nu, met de meting van vóór het venster vooraan en de laatste tot nu", () => {
    const r = waterReeks(rijen, nu);
    assert.equal(r.van, nu - 24 * uur);
    assert.equal(r.tot, nu);
    assert.deepEqual(r.punten[0], { t: nu - 24 * uur, v: 55 });
    assert.deepEqual(r.punten.at(-1), { t: nu, v: 58 });
    assert.ok(!r.punten.some((p) => Number.isNaN(p.v)), "unavailable valt weg");
  });

  it("de y-as: hele vijftallen, met het doel erbinnen, minstens 10 hoog", () => {
    const r = waterReeks(rijen, nu);
    assert.deepEqual(schaal(r, 58), { min: 45, max: 60, lijnen: [45, 50, 55, 60] });
    const vlak = { punten: [{ t: 0, v: 58 }, { t: 1, v: 58 }] };
    assert.deepEqual(schaal(vlak, 58), { min: 50, max: 60, lijnen: [50, 55, 60] });
    assert.deepEqual(schaal({ punten: [] }), { min: 0, max: 0, lijnen: [] });
  });

  it("de paden blijven in het vak, ook met vaste grenzen", () => {
    const r = waterReeks(rijen, nu);
    const { lijn, vlak } = grafiekPaden(r, schaal(r, 58), { w: 1000, h: 300 });
    assert.match(lijn, /^M0\.0,/);
    const ys = [...lijn.matchAll(/[ ,]([\d.-]+)(?= |$)/g)].map((m) => Number(m[1]));
    assert.ok(ys.every((y) => y >= 0 && y <= 300), "geen enkel punt buiten het vak");
    assert.match(vlak, / Z$/);
  });

  it("geen paden zonder twee punten", () => {
    assert.deepEqual(grafiekPaden({ punten: [] }, { min: 40, max: 60 }), { lijn: "", vlak: "" });
  });

  it("de tijden: elke zes uur op het hele uur, niet tegen de rand", () => {
    const r = waterReeks(rijen, nu);
    const l = tijdLabels(r);
    assert.ok(l.length >= 3 && l.length <= 4);
    for (const x of l) {
      assert.equal(new Date(x.t).getHours() % 6, 0);
      assert.equal(new Date(x.t).getMinutes(), 0);
      assert.ok(x.x >= 0.06 && x.x <= 0.94);
      assert.match(x.label, /^\d\d:00$/);
    }
  });

  it("de kruisdraad: de laatste meting op of vóór het moment", () => {
    const r = waterReeks(rijen, nu);
    assert.equal(waardeOp(r, nu - 13 * uur).v, 46);
    assert.equal(waardeOp(r, nu - 2 * uur).v, 49);
    assert.equal(waardeOp(r, nu).v, 58);
    assert.equal(breedteVan(nu, r), 1);
  });

  it("de uitersten", () => {
    assert.deepEqual(uitersten(waterReeks(rijen, nu)), { min: 46, max: 58 });
    assert.equal(uitersten({ punten: [] }), null);
  });
});

describe("merk, type en foto", () => {
  it("de WH27S wordt herkend, ook met (DEVICE_WATER_HEATER) achter de code", () => {
    assert.equal(apparaat.manufacturer, "LGE");
    assert.equal(apparaat.model, "WHT_056905_WW (DEVICE_WATER_HEATER)");
    assert.deepEqual(typeBijApparaat(apparaat), { merk: "lg", model: "wh27s" });
  });

  it("de WH27S heeft nog geen foto: dan het icoon, en geen adres dat 404 geeft", () => {
    assert.equal(BOILERS.lg.modellen.wh27s.pad, undefined);
    assert.equal(boilerAfbeelding({}, apparaat), "");
    assert.equal(boilerAfbeelding({ merk: "lg", model: "wh27s" }, apparaat), "");
  });

  it("een type MET een pad krijgt zijn foto (zo komt de WH27S straks)", () => {
    const lijst = { lg: { ...BOILERS.lg, modellen: { wh27s: { ...BOILERS.lg.modellen.wh27s, pad: "warmtepompboilers/lg-wh27s.webp" } } } };
    assert.equal(boilerAfbeelding({}, apparaat, lijst), `${AFBEELDINGEN_BASIS}warmtepompboilers/lg-wh27s.webp`);
  });

  it("een andere LG-code: geen foto, liever dan een verkeerde", () => {
    assert.equal(typeBijApparaat({ manufacturer: "LGE", model: "WHT_999999_WW" }), null);
  });

  it("de editor: merk, type, en altijd een type bij een merk uit de lijst", () => {
    assert.deepEqual(merkKeuzes().map((k) => k.value), ["auto", "lg", "eigen", "geen"]);
    assert.deepEqual(typeKeuzes("lg"), [{ value: "wh27s", label: "WH27S (270 liter)" }]);
    assert.deepEqual(metType({ merk: "lg" }, apparaat, BOILERS), { merk: "lg", model: "wh27s" });
    assert.deepEqual(metType({ merk: "auto", model: "wh27s" }, apparaat, BOILERS), { merk: "auto" });
  });
});
