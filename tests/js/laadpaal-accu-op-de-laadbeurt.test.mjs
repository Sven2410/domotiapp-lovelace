/**
 * Op de laadbeurt ook wat er uit de thuisbatterij kwam (0.60.1).
 *
 * De coach levert `sessie.accu_kwh` sinds 0.112.0; in de echte dump van
 * 0.112.1 was dat 0,263 kWh van de 15,53. De eigenaar op 11 oktober 2026, op de
 * vraag of dat erbij moest: ja.
 *
 * NIEUW GEDRAG: de eerste twee tests falen op 0.60.0. De derde is een
 * REGRESSIEWACHT: zonder accu verandert de regel niet.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as L from "../../src/cards/laadpaal-logica.js";

const EUR = (n) => `€ ${n}`;
const DUMP = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.112.1-laadpaal.json", import.meta.url), "utf8"));
const SESSIE = DUMP.find((e) => e.entity_id === "sensor.laadpaal_coach").attributes.sessie;

describe("NIEUW GEDRAG: wat er uit de thuisbatterij kwam", () => {
  it("staat na de zon, in de echte laadbeurt van 11 oktober", () => {
    assert.equal(SESSIE.accu_kwh, 0.263);
    assert.equal(
      L.sessieTekst(SESSIE, new Date("2026-10-11T22:53:00+02:00")).tekst,
      `15,5 kWh · 2,1 kWh zon · 0,3 kWh accu · ${EUR("3,19")} net · ${EUR("3,64")} incl. zon`
    );
  });

  it("staat er ook zonder zon", () => {
    assert.equal(L.sessieTekst({ actief: true, kwh: 6, accu_kwh: 1.24 }).tekst, "6 kWh · 1,2 kWh accu");
  });

  it("REGRESSIEWACHT: valt weg bij nul en als de coach het niet levert", () => {
    assert.equal(L.sessieTekst({ actief: true, kwh: 6, accu_kwh: 0 }).tekst, "6 kWh");
    assert.equal(L.sessieTekst({ actief: true, kwh: 6, accu_kwh: null }).tekst, "6 kWh");
    assert.equal(L.sessieTekst({ actief: true, kwh: 6 }).tekst, "6 kWh");
  });
});
