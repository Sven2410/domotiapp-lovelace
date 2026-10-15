/**
 * `lijnPad` en `vloeiendPad` met een vast bereik (15 oktober 2026).
 *
 * De energiegrafiek van het infoscherm tekent vanaf nul. De warmtepompboiler
 * tekent 40 tot 65 graden: vanaf nul zou een lijn tussen 44 en 60 graden in
 * de bovenste kwart van het vak kruipen.
 *
 * NIEUW GEDRAG: vóór deze ronde negeerden beide functies `min` en `max`, en
 * zakte het laagste punt niet naar de onderrand.
 * REGRESSIEWACHT: zonder `min` en `max` blijft het zoals het was (vanaf nul).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { lijnPad, vloeiendPad } from "../../src/cards/infoscherm-logica.js";

const reeks = {
  van: 0,
  tot: 100,
  punten: [
    { t: 0, v: 45 },
    { t: 50, v: 60 },
    { t: 100, v: 50 },
  ],
};

/** De y van elk hoekpunt, uit een pad met alleen M en L. */
const ys = (pad) => [...pad.matchAll(/[ML][\d.]+,([\d.]+)/g)].map((m) => Number(m[1]));

describe("lijnPad met een vast bereik", () => {
  it("NIEUW GEDRAG: 40 tot 65 vult het vak, 45 staat dicht bij de onderrand", () => {
    const { lijn, min, max } = lijnPad(reeks, { w: 100, h: 100, min: 40, max: 65 });
    assert.equal(min, 40);
    assert.equal(max, 65);
    assert.deepEqual(ys(lijn), [80, 20, 60]);
  });

  it("NIEUW GEDRAG: vloeiendPad geeft het bereik door", () => {
    const { min, max } = vloeiendPad(reeks, { w: 100, h: 100, min: 40, max: 65 });
    assert.deepEqual([min, max], [40, 65]);
  });

  it("REGRESSIEWACHT: zonder bereik vanaf nul, met de piek op 95%", () => {
    const { lijn, min, max } = lijnPad(reeks, { w: 100, h: 100 });
    assert.equal(min, 0);
    assert.ok(Math.abs(max - 60 / 0.95) < 1e-9);
    assert.equal(ys(lijn)[1], 5);
  });
});
