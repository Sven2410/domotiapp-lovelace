/**
 * Het klimaatblok op het infoscherm: wanneer het er is, en wanneer de pagina
 * erachter mag bedienen.
 *
 * NIEUW GEDRAG (13 oktober 2026): vóór deze ronde bestond het blok niet, en
 * gaf `blokOntbreekt("klimaat", ...)` "Onbekend blok".
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  BLOK_INFO,
  BLOK_SOORTEN,
  LIJSTBLOKKEN,
  blokOntbreekt,
  klimaatBedienbaar,
  klimaatZichtbaar,
  paginas,
  standaardIndeling,
} from "../../src/cards/infoscherm-logica.js";

const aircos = { klimaat: [{ entity: "climate.raam", naam: "Raam" }] };

describe("het klimaatblok", () => {
  it("is een blok met een pagina erachter en een aantal, en schaalt als een lijst", () => {
    assert.ok(BLOK_SOORTEN.includes("klimaat"));
    assert.equal(BLOK_INFO.klimaat.pagina, "klimaat");
    assert.equal(BLOK_INFO.klimaat.aantal, true);
    assert.ok(LIJSTBLOKKEN.has("klimaat"));
  });

  it("staat er als de installateur airco's koos en de receptie het niet uitzette", () => {
    assert.equal(klimaatZichtbaar({ installatie: aircos, instellingen: {} }), true);
    assert.equal(klimaatZichtbaar({ installatie: aircos, instellingen: { klimaat_tonen: false } }), false);
    assert.equal(klimaatZichtbaar({ installatie: { klimaat: [] }, instellingen: {} }), false);
    // Een stand van vóór deze ronde heeft de sleutel niet.
    assert.equal(klimaatZichtbaar({ installatie: {}, instellingen: {} }), false);
  });

  it("de pagina komt na de verlichting", () => {
    const stand = {
      personen: [],
      installatie: { ...aircos, verlichting: [{ entity: "light.a", naam: "" }] },
      instellingen: {},
    };
    assert.deepEqual(paginas(stand, []), ["welkom", "verlichting", "klimaat"]);
    assert.deepEqual(paginas({ ...stand, instellingen: { klimaat_tonen: false } }, []), ["welkom", "verlichting"]);
  });

  it("blokOntbreekt zegt waarom het er niet staat", () => {
    assert.match(blokOntbreekt("klimaat", { installatie: {} }, [], new Date()), /Geen airco/);
    assert.match(
      blokOntbreekt("klimaat", { installatie: aircos, instellingen: { klimaat_tonen: false } }, [], new Date()),
      /uit in het beheer/
    );
    assert.equal(blokOntbreekt("klimaat", { installatie: aircos, instellingen: {} }, [], new Date()), null);
  });

  it("bedienen mag, tenzij de receptie het uitzette", () => {
    assert.equal(klimaatBedienbaar({ instellingen: {} }), true);
    assert.equal(klimaatBedienbaar({}), true);
    assert.equal(klimaatBedienbaar({ instellingen: { klimaat_bedienen: false } }), false);
  });

  it("REGRESSIEWACHT: de standaardindeling blijft zoals hij was, zonder klimaatblok", () => {
    // Het raster is vol (36 van 36 cellen). Het blok komt er bij een klant via
    // Indeling, "Blok toevoegen".
    assert.ok(!standaardIndeling().blokken.some((b) => b.soort === "klimaat"));
  });
});
