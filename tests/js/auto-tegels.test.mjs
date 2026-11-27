/**
 * De extra tegels op de autokaart (0.142.0). Gemeld op 27 november 2026 met de bus van de eigenaar: een tijdstip stond
 * er als ISO-tekst en de stekker als "CONNECTED". **NIEUW GEDRAG**: `tegelWaarde` bestaat op 0.141.0 niet.
 *
 * De naam op de tegel (het entity_id in plaats van de naam) zit in de kaart zelf en is in de browser gemeten; zie
 * docs/auto-laden-en-accu/RAPPORT.md.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { tegelWaarde } from "../../src/cards/auto-logica.js";

const LADEN = JSON.parse(readFileSync(new URL("./vaste-invoer/fordpass-laden.json", import.meta.url), "utf8"));
const tz = "Europe/Amsterdam";
const nu = new Date("2026-11-27T17:00:00Z");

describe("de waarde op een extra tegel", () => {
  it("een tijdstip op de klok van Home Assistant: vandaag, gisteren", () => {
    const st = (state, attributes = {}) => ({ state, attributes });
    assert.equal(tegelWaarde(st("2026-11-27T15:50:12+00:00"), { tz, nu }), "vandaag 16:50");
    assert.equal(tegelWaarde(st("2026-11-26T07:05:00+00:00", { device_class: "timestamp" }), { tz, nu }), "gisteren 08:05");
    // Een getal blijft een getal, met de eenheid.
    assert.equal(tegelWaarde(st("500", { unit_of_measurement: "km" }), { tz, nu }), "500 km");
    assert.equal(tegelWaarde(st("12.34"), { tz, nu }), "12.3");
  });

  it("de stekker uit de dump: de vertaling van Home Assistant, anders leesbaar", () => {
    const stekker = LADEN.toestand.stekker;
    assert.equal(stekker.state, "CONNECTED");
    assert.equal(tegelWaarde(stekker, { opmaak: () => "Aangesloten" }), "Aangesloten");
    assert.equal(tegelWaarde(stekker, { opmaak: (s) => s.state }), "Connected");
    assert.equal(tegelWaarde(stekker), "Connected");
    assert.equal(tegelWaarde(LADEN.toestand.laden), "In progress");
    // Gewone tekst blijft zoals hij is.
    assert.equal(tegelWaarde({ state: "Voorbeeldstraat 1", attributes: {} }), "Voorbeeldstraat 1");
  });
});
