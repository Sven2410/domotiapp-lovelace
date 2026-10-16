/**
 * Het wifiblok op het infoscherm: wanneer het er is.
 *
 * NIEUW GEDRAG (16 oktober 2026): vóór deze ronde bestond het blok niet, gaf
 * `blokOntbreekt("wifi", ...)` "Onbekend blok", en had het scherm geen
 * pagina Wifi.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { BLOK_INFO, BLOK_SOORTEN, LIJSTBLOKKEN, blokOntbreekt, paginas, standaardIndeling } from "../../src/cards/infoscherm-logica.js";

describe("het wifiblok", () => {
  it("is een blok met een pagina erachter, zonder aantal, en schaalt als geheel", () => {
    assert.ok(BLOK_SOORTEN.includes("wifi"));
    assert.equal(BLOK_INFO.wifi.pagina, "wifi");
    assert.equal(BLOK_INFO.wifi.aantal, false);
    assert.equal(BLOK_INFO.wifi.icoon, "wifi");
    assert.ok(!LIJSTBLOKKEN.has("wifi"));
  });

  it("staat er als de installateur een QR-code koos, en de pagina ook", () => {
    const stand = { personen: [], installatie: { wifi: "image.gastnetwerk_qr_code" }, instellingen: {} };
    assert.equal(blokOntbreekt("wifi", stand, [], new Date()), null);
    assert.deepEqual(paginas(stand, []), ["welkom", "wifi"]);
    assert.match(blokOntbreekt("wifi", { installatie: {} }, [], new Date()), /Geen QR-code/);
    assert.deepEqual(paginas({ installatie: { wifi: null } }, []), ["welkom"]);
  });

  it("REGRESSIEWACHT: de standaardindeling blijft zoals hij was, zonder wifiblok", () => {
    assert.ok(!standaardIndeling().blokken.some((b) => b.soort === "wifi"));
  });
});
