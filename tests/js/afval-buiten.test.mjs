/**
 * "Staat buiten" op de afvalkaart.
 *
 * NIEUW GEDRAG (12 oktober 2026). `buitenTekst` bestond niet vóór deze ronde;
 * op de code van ervoor faalt dit bestand bij het importeren. Zijn woorden:
 * "op de afvalkaart wil je juist hebben staan door wie die aan de straat is
 * gezet".
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buitenTekst } from "../../src/cards/afval-logica.js";

const MORGEN = new Date(2026, 9, 13); // dinsdag 13 oktober 2026
const namen = { "person.sven": "Sven Kool", "person.lieke": "Lieke" };
const naamVan = (p) => namen[p] ?? p;

describe("buitenTekst", () => {
  it("noemt de voornaam van wie op de knop tikte", () => {
    assert.equal(buitenTekst({ datum: "2026-10-13", door: "person.sven" }, MORGEN, naamVan), "Staat buiten · Sven");
  });

  it("zonder bekende persoon alleen 'Staat buiten'", () => {
    assert.equal(buitenTekst({ datum: "2026-10-13", door: null }, MORGEN, naamVan), "Staat buiten");
  });

  it("een melding voor een andere ophaaldag telt niet", () => {
    assert.equal(buitenTekst({ datum: "2026-10-06", door: "person.lieke" }, MORGEN, naamVan), null);
  });

  it("niets van de server: niets", () => {
    assert.equal(buitenTekst(null, MORGEN, naamVan), null);
    assert.equal(buitenTekst({ datum: "2026-10-13" }, null, naamVan), null);
  });
});
