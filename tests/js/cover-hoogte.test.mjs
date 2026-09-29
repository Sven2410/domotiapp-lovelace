/**
 * De hoogte van de rolluikkaart, en of de schuif daarin meetelt.
 *
 * NIEUW GEDRAG: `kaartHoogte` bestond niet vóór deze ronde, en de kaart telde
 * de schuif mee zodra het rolluik een positie kon zetten -- ook met
 * `show_position: false`. Deze suite valt op de code van vóór de fix om met
 * een ontbrekende export; dat staat in het rapport.
 *
 * Gemeten op 30 september 2026: vier rolluiken met de schuif uit stonden in een
 * pop-up op 120px, met een lege helft onder elke regel.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { kaartHoogte } from "../../src/cards/cover-logica.js";

// Zoals `rowsFor` in base.js: 56px per rij, 8px ertussen.
const rijen = (px) => Math.max(1, Math.ceil((px + 8) / (56 + 8)));

describe("kaartHoogte", () => {
  it("NIEUW GEDRAG: de schuif uit telt niet mee, ook als het rolluik een positie kan zetten", () => {
    assert.equal(kaartHoogte({ aantal: 1, kanPositie: true, toonPositie: false }), 54);
    assert.equal(rijen(kaartHoogte({ aantal: 1, kanPositie: true, toonPositie: false })), 1);
  });

  it("REGRESSIEWACHT: met de schuif aan blijft het twee rijen", () => {
    assert.equal(kaartHoogte({ aantal: 1, kanPositie: true, toonPositie: true }), 84);
    assert.equal(rijen(kaartHoogte({ aantal: 1, kanPositie: true })), 2);
  });

  it("REGRESSIEWACHT: zonder positie is er nooit een schuif", () => {
    assert.equal(kaartHoogte({ aantal: 1, kanPositie: false, toonPositie: true }), 54);
    assert.equal(kaartHoogte({ aantal: 3, kanPositie: false }), 138);
  });

  it("REGRESSIEWACHT: een lege lijst telt als één regel", () => {
    assert.equal(kaartHoogte({ aantal: 0, kanPositie: false }), 54);
  });
});
