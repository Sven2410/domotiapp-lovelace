/**
 * Het ruimteblok op het infoscherm: wanneer het er is.
 *
 * NIEUW GEDRAG (16 oktober 2026): vóór deze ronde bestond het blok niet, gaf
 * `blokOntbreekt("ruimtes", ...)` "Onbekend blok", en had het scherm geen
 * pagina Ruimtes.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  BLOK_INFO,
  BLOK_SOORTEN,
  LIJSTBLOKKEN,
  blokOntbreekt,
  paginas,
  ruimtesZichtbaar,
  standaardIndeling,
} from "../../src/cards/infoscherm-logica.js";

const ruimtes = { ruimtes: [{ entity: "calendar.spreekruimte", naam: "" }] };

describe("het ruimteblok", () => {
  it("is een blok met een pagina erachter en een aantal, en schaalt als een lijst", () => {
    assert.ok(BLOK_SOORTEN.includes("ruimtes"));
    assert.equal(BLOK_INFO.ruimtes.pagina, "ruimtes");
    assert.equal(BLOK_INFO.ruimtes.aantal, true);
    assert.equal(BLOK_INFO.ruimtes.icoon, "door");
    assert.ok(LIJSTBLOKKEN.has("ruimtes"));
  });

  it("staat er als de installateur ruimtes koos", () => {
    assert.equal(ruimtesZichtbaar({ installatie: ruimtes }), true);
    assert.equal(ruimtesZichtbaar({ installatie: { ruimtes: [] } }), false);
    // Een stand van vóór deze ronde heeft de sleutel niet.
    assert.equal(ruimtesZichtbaar({ installatie: {} }), false);
  });

  it("de pagina komt na het klimaat", () => {
    const stand = {
      personen: [],
      installatie: { ...ruimtes, klimaat: [{ entity: "climate.a", naam: "" }] },
      instellingen: {},
    };
    assert.deepEqual(paginas(stand, []), ["welkom", "klimaat", "ruimtes"]);
    assert.deepEqual(paginas({ ...stand, installatie: { klimaat: stand.installatie.klimaat } }, []), ["welkom", "klimaat"]);
  });

  it("blokOntbreekt zegt waarom het er niet staat", () => {
    assert.match(blokOntbreekt("ruimtes", { installatie: {} }, [], new Date()), /Geen ruimtes/);
    assert.equal(blokOntbreekt("ruimtes", { installatie: ruimtes }, [], new Date()), null);
  });

  it("REGRESSIEWACHT: de standaardindeling blijft zoals hij was, zonder ruimteblok", () => {
    assert.ok(!standaardIndeling().blokken.some((b) => b.soort === "ruimtes"));
  });
});
