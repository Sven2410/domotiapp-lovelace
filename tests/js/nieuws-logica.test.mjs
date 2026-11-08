/**
 * De nieuwskaart: welke bronnen bovenaan staan en wat er gekozen blijft.
 *
 * NIEUW GEDRAG (8 november 2026). `nieuws-logica.js` bestond niet vóór deze ronde; op de code van ervoor faalt dit bestand
 * bij het importeren. Dat de bronnen en rubrieken gelijk zijn aan die van de server, toetst `tests/test_nieuws.py`.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AANTAL_MAX, BRONNEN, RUBRIEKEN, aantalUit, bronnenUit, keuze, rubriekenVan, veiligeLink } from "../../src/cards/nieuws-logica.js";

describe("bronnenUit", () => {
  it("zonder keuze allemaal, met NOS voorop", () => {
    assert.deepEqual(bronnenUit(undefined), Object.keys(BRONNEN));
    assert.equal(bronnenUit([])[0], "nos");
  });

  it("alleen wat bestaat, elk één keer, in de volgorde van de config", () => {
    assert.deepEqual(bronnenUit(["ad", "bestaatniet", "nos", "ad"]), ["ad", "nos"]);
    assert.deepEqual(bronnenUit("nu"), ["nu"]);
  });
});

describe("keuze", () => {
  const bronnen = ["nos", "ad", "telegraaf"];

  it("begint bij de eerste bron, Algemeen", () => {
    assert.deepEqual(keuze(bronnen, undefined, undefined), { bron: "nos", rubriek: "algemeen" });
  });

  it("houdt de rubriek bij een andere bron die hem ook heeft", () => {
    assert.deepEqual(keuze(bronnen, "ad", "sport"), { bron: "ad", rubriek: "sport" });
  });

  it("valt terug op Algemeen bij een bron zonder die rubriek", () => {
    assert.deepEqual(keuze(bronnen, "telegraaf", "sport"), { bron: "telegraaf", rubriek: "algemeen" });
  });

  it("een bron die niet bovenaan staat wordt de eerste", () => {
    assert.deepEqual(keuze(bronnen, "nu", "tech"), { bron: "nos", rubriek: "tech" });
  });
});

describe("de lijsten", () => {
  it("elke rubriek van elke bron heeft een naam, en elke bron heeft Algemeen vooraan", () => {
    for (const [sleutel, bron] of Object.entries(BRONNEN)) {
      assert.equal(rubriekenVan(sleutel)[0], "algemeen", sleutel);
      for (const r of bron.rubrieken) assert.ok(RUBRIEKEN[r], `${sleutel}/${r}`);
    }
    assert.deepEqual(rubriekenVan("bestaatniet"), []);
  });
});

describe("aantalUit en veiligeLink", () => {
  it("een heel getal van 1 tot en met het maximum, anders 10", () => {
    assert.equal(aantalUit(undefined), 10);
    assert.equal(aantalUit(""), 10);
    assert.equal(aantalUit(0), 1);
    assert.equal(aantalUit(99), AANTAL_MAX);
    assert.equal(aantalUit("5"), 5);
  });

  it("alleen http en https", () => {
    assert.equal(veiligeLink("https://nos.nl/1"), "https://nos.nl/1");
    assert.equal(veiligeLink("javascript:alert(1)"), null);
    assert.equal(veiligeLink(undefined), null);
  });
});
