/**
 * De HVAC-kaart bij een climate zonder `hvac_action` (0.88.1).
 *
 * Een beheersessie op 31 oktober 2026: een Daikin Onecta op `cool`, doel 18,5
 * en kamer 20, stond op de kaart als "Standby", grijs en zonder gloed. De
 * integratie meldt geen `hvac_action`, en de kaart maakte daar "idle" van. De
 * eigenaar wil dan de stand zien, met de gloed.
 *
 * NIEUW GEDRAG, behalve waar REGRESSIEWACHT staat.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { statusRegel } from "../../src/cards/hvac-logica.js";

const airco = (state, attributes = {}) => ({ entity_id: "climate.eetkamer", state, attributes });
const regel = (hoofd, rest = {}) => statusRegel({ soort: "airco", hoofd, ...rest });

describe("zonder hvac_action zegt de stand het", () => {
  for (const [stand, tekst, tone] of [
    ["cool", "Koelen", "water"],
    ["heat", "Verwarmen", "solar"],
    ["dry", "Drogen", "water"],
    ["fan_only", "Ventileren", "water"],
    ["heat_cool", "Auto", "accent"],
    ["auto", "Auto", "accent"],
  ]) {
    it(`${stand}: ${tekst}, en hij gloeit`, () => {
      const r = regel(airco(stand, { temperature: 18.5, current_temperature: 20 }));
      assert.equal(r.tekst, tekst);
      assert.equal(r.tone, tone);
      assert.equal(r.bezig, true);
    });
  }

  it("een lege of onbekende hvac_action is er geen", () => {
    assert.equal(regel(airco("cool", { hvac_action: null })).tekst, "Koelen");
    assert.equal(regel(airco("cool", { hvac_action: "" })).tekst, "Koelen");
    assert.equal(regel(airco("cool", { hvac_action: "unknown" })).tekst, "Koelen");
  });

  it("REGRESSIEWACHT: uit is Uit, grijs en zonder gloed", () => {
    const r = regel(airco("off"));
    assert.deepEqual([r.tekst, r.tone, r.bezig], ["Uit", "neutral", false]);
  });

  it("een stand die de kaart niet kent gloeit niet", () => {
    const r = regel(airco("eco_stand"));
    assert.deepEqual([r.tekst, r.tone, r.bezig], ["Eco stand", "neutral", false]);
  });

  it("de statussensor staat erachter, net als bij een actie", () => {
    const status = { entity_id: "sensor.s", state: "Tapwater", attributes: {} };
    assert.equal(regel(airco("heat"), { status }).tekst, "Verwarmen · Tapwater");
  });
});

describe("REGRESSIEWACHT: een echte hvac_action gaat voor", () => {
  for (const [stand, actie, tekst, tone, bezig] of [
    ["cool", "cooling", "Koelt", "water", true],
    ["cool", "idle", "Standby", "neutral", false],
    ["heat", "heating", "Verwarmt", "solar", true],
    ["heat", "preheating", "Voorverwarmt", "solar", true],
    ["heat", "defrosting", "Ontdooit", "neutral", true],
    ["auto", "cooling", "Koelt", "water", true],
    ["off", "off", "Uit", "neutral", false],
  ]) {
    it(`${stand} met ${actie}: ${tekst}`, () => {
      const r = regel(airco(stand, { hvac_action: actie }));
      assert.deepEqual([r.tekst, r.tone, r.bezig], [tekst, tone, bezig]);
    });
  }
});

describe("REGRESSIEWACHT: de rangorde blijft", () => {
  it("een storing verslaat de stand, en niet bereikbaar blijft dat", () => {
    const fault = { entity_id: "binary_sensor.f", state: "on", attributes: {} };
    assert.equal(regel(airco("cool"), { fault }).tekst, "Storing");
    assert.equal(regel(airco("unavailable")).tekst, "Niet bereikbaar");
  });
});
