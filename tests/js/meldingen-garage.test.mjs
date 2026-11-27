/**
 * De garagedeur in de meldingenkaart (0.139.0): de regel en de knoppen in de pop-up. Alles
 * **NIEUW GEDRAG**. Het versturen staat aan de serverkant (tests/meldingen/test_garage.py).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { garageKnoppen, garageRegel, negeerNaam, soortenVan } from "../../src/cards/meldingen-logica.js";

const stand = (garage) => ({ bekend: true, garage: { contact: "binary_sensor.garagedeur", negeer: [15, 60, 240], minuten: 5, ...garage } });
const tijd = (iso) => iso.slice(11, 16);

describe("de garagedeur in de pop-up", () => {
  it("staat als soort op de kaart als `garage: true`", () => {
    assert.deepEqual(soortenVan({ afval: false, garage: true }).map((s) => s.id), ["garage"]);
    assert.deepEqual(soortenVan({ afval: true }).map((s) => s.id), ["afval"]);
  });

  it("de regel: open, genegeerd door wie en tot hoe laat, dicht, niet bereikbaar", () => {
    assert.equal(garageRegel({ stand: stand({ open: true, open_sinds: "2026-11-27T14:05:00+01:00" }), tijd }), "Open sinds 14:05");
    assert.equal(
      garageRegel({
        stand: stand({ open: true, negeer_tot: "2026-11-27T16:30:00+01:00", negeer_door: "person.anna" }),
        tijd,
        naam: () => "Anna",
      }),
      "Open · genegeerd tot 16:30 door Anna",
    );
    assert.equal(garageRegel({ stand: stand({ open: false }), tijd }), "Dicht · melding na 5 min open");
    assert.equal(garageRegel({ stand: stand({ open: null }), tijd }), "Contact niet bereikbaar");
    assert.equal(garageRegel({ stand: { bekend: true, garage: { contact: "" } } }), "Nog geen contact gekozen");
    assert.equal(garageRegel({ stand: { bekend: false } }), "Actief zodra het dashboard is opgeslagen");
  });

  it("de knoppen: negeren zolang hij open staat, weer melden tijdens negeren, en dicht niets", () => {
    assert.deepEqual(garageKnoppen(stand({ open: true })), [
      { id: "negeer:15", naam: "Negeer 15 min" },
      { id: "negeer:60", naam: "Negeer 1 uur" },
      { id: "negeer:240", naam: "Negeer 4 uur" },
    ]);
    assert.deepEqual(garageKnoppen(stand({ open: true, negeer_tot: "2026-11-27T16:30:00+01:00" })), [
      { id: "hervat", naam: "Weer melden" },
    ]);
    assert.deepEqual(garageKnoppen(stand({ open: false })), []);
    assert.deepEqual(garageKnoppen({ bekend: false }), []);
    assert.equal(negeerNaam(90), "Negeer 90 min");
  });
});
