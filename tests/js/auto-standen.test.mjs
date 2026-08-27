/**
 * Deuren, ramen en het portierslot van de autokaart — NIEUW GEDRAG.
 *
 * Gemeld op 27 augustus 2026: *"bij ramen filter je alleen op binaire sensor,
 * maar mijn bus geeft een normale sensor, een status LOCKED bijvoorbeeld."*
 *
 * Read-only nagemeten op zijn installatie, en het was alle drie raak. Zijn Ford
 * Transit Connect levert gewone sensoren met een Engels woord erin:
 *
 *     sensor..._doorstatus       = "Closed"
 *     sensor..._windowposition   = "Closed"
 *     sensor..._doorlock         = "LOCKED"
 *
 * De kaart keek naar `isOn()`, en dat is voor geen van drieën waar — ook niet
 * als er wél iets openstaat.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { opSlot, slotIsBedienbaar, staatOpen } from "../../src/cards/auto-logica.js";

const st = (state, attributes = {}, entity_id = "sensor.x") => ({ state, attributes, entity_id });

describe("staatOpen — zijn eigen sensoren — NIEUW GEDRAG", () => {
  it("leest de woorden van zijn Ford", () => {
    assert.equal(staatOpen(st("Closed")), false);
    assert.equal(staatOpen(st("Open")), true);
  });

  it("leest een hele zin, want een Ford noemt de deur erbij", () => {
    // "Driver Door Ajar" hoort als OPEN te tellen, niet als onbekend.
    assert.equal(staatOpen(st("Driver Door Ajar")), true);
    assert.equal(staatOpen(st("Tailgate Open")), true);
  });

  it("trapt niet in een woord dat toevallig 'open' bevat", () => {
    assert.equal(staatOpen(st("Openbaar")), null);
  });

  it("een binary_sensor blijft gewoon werken", () => {
    assert.equal(staatOpen(st("on")), true);
    assert.equal(staatOpen(st("off")), false);
  });

  it("niets weten is niet hetzelfde als dicht", () => {
    // De kaart hoort dan niets te melden in plaats van "alles dicht".
    assert.equal(staatOpen(st("unknown")), null);
    assert.equal(staatOpen(st("unavailable")), null);
    assert.equal(staatOpen(null), null);
  });
});

describe("opSlot — NIEUW GEDRAG", () => {
  it("leest zijn LOCKED", () => {
    assert.equal(opSlot(st("LOCKED")), true);
    assert.equal(opSlot(st("UNLOCKED")), false);
  });

  it("een echte lock-entiteit volgt zijn eigen standen", () => {
    assert.equal(opSlot(st("locked", {}, "lock.voordeur")), true);
    assert.equal(opSlot(st("unlocked", {}, "lock.voordeur")), false);
    // Klemt of is bezig: daar valt niets zinnigs over te zeggen.
    assert.equal(opSlot(st("jammed", {}, "lock.voordeur")), null);
    assert.equal(opSlot(st("locking", {}, "lock.voordeur")), null);
  });

  it("een binary_sensor met device_class lock is ANDERSOM", () => {
    // De afspraak van Home Assistant: ON betekent ONTGRENDELD. Dat is precies
    // andersom dan je zou gokken, en daarom staat het apart in de code.
    assert.equal(opSlot(st("on", { device_class: "lock" }, "binary_sensor.slot")), false);
    assert.equal(opSlot(st("off", { device_class: "lock" }, "binary_sensor.slot")), true);
  });

  it("geeft null als er niets bekend is", () => {
    assert.equal(opSlot(st("unknown")), null);
    assert.equal(opSlot(null), null);
  });
});

describe("slotIsBedienbaar — NIEUW GEDRAG", () => {
  it("alleen een echte lock-entiteit neemt opdrachten aan", () => {
    assert.equal(slotIsBedienbaar("lock.voordeur"), true);
    // Zijn sensor vertelt de stand maar doet niets. Een knop die niets doet is
    // erger dan geen knop -- en op deze kaart staan er sowieso geen meer.
    assert.equal(slotIsBedienbaar("sensor.fcq_wf0cxxsk1sx003660_doorlock"), false);
    assert.equal(slotIsBedienbaar("binary_sensor.slot"), false);
    assert.equal(slotIsBedienbaar(undefined), false);
  });
});
