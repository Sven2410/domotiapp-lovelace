/**
 * Het icoon van een binary_sensor zonder eigen icoon: naar device_class, en bij
 * een garagedeur en een slot naar de toestand. Een magneetcontact op een
 * garagedeur stond tot 0.138.0 als schild op de kaart.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { defaultIcon, icons } from "../../src/icons.js";

describe("het icoon van een binary_sensor", () => {
  it("NIEUW GEDRAG: een garagedeur is open of dicht", () => {
    assert.equal(defaultIcon("binary_sensor.garage", { device_class: "garage_door" }, "on"), "garageOpen");
    assert.equal(defaultIcon("binary_sensor.garage", { device_class: "garage_door" }, "off"), "garageClosed");
    assert.equal(defaultIcon("binary_sensor.garage", { device_class: "garage_door" }, "unavailable"), "garageClosed");
  });

  it("NIEUW GEDRAG: deur, opening, raam en slot hebben hun eigen tekening", () => {
    assert.equal(defaultIcon("binary_sensor.voordeur", { device_class: "door" }, "on"), "door");
    assert.equal(defaultIcon("binary_sensor.luik", { device_class: "opening" }, "off"), "door");
    assert.equal(defaultIcon("binary_sensor.raam", { device_class: "window" }, "on"), "window");
    assert.equal(defaultIcon("binary_sensor.slot", { device_class: "lock" }, "on"), "lockOpen");
    assert.equal(defaultIcon("binary_sensor.slot", { device_class: "lock" }, "off"), "lock");
  });

  it("REGRESSIEWACHT: rook blijft rook, de rest blijft het schild, ook zonder toestand", () => {
    assert.equal(defaultIcon("binary_sensor.rook", { device_class: "smoke" }), "smoke");
    assert.equal(defaultIcon("binary_sensor.beweging", { device_class: "motion" }, "on"), "shield");
    assert.equal(defaultIcon("binary_sensor.x"), "shield");
  });

  it("REGRESSIEWACHT: elk icoon dat eruit komt bestaat", () => {
    for (const naam of ["garageOpen", "garageClosed", "door", "window", "lock", "lockOpen", "smoke", "shield"]) {
      assert.ok(icons[naam], naam);
    }
  });
});
