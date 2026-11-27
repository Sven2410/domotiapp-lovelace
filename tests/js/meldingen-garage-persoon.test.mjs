/**
 * De garagedeur per persoon in de pop-up (0.145.0). **NIEUW GEDRAG**: `garageKeuzes` en de rest bestaan op 0.144.2 niet.
 * Dezelfde regels als `voor_persoon` in meldingen/garage.py (tests/meldingen/test_garage_per_persoon.py).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as M from "../../src/cards/meldingen-logica.js";

const STAND = { bekend: true, garage: { contact: "binary_sensor.garagedeur", open: false, minuten: 5, herhaal: 60, avond: "22:00" }, keuzes: {} };
const BRAM = "person.bram";
const gekozen = (groep) => groep.opties.filter((o) => o.aan).map((o) => o.id);

describe("de garagedeur per persoon", () => {
  it("wie niets koos, krijgt de kaart", () => {
    assert.deepEqual(M.garageKeuze(STAND, BRAM), { minuten: 5, herhaal: 60, avond: "22:00" });
    const [minuten, herhaal, avond] = M.garageKeuzes(STAND, BRAM);
    assert.deepEqual(minuten.opties.map((o) => o.naam), ["5 min", "10 min", "15 min", "30 min", "1 uur"]);
    assert.deepEqual(gekozen(minuten), ["5"]);
    assert.deepEqual(herhaal.opties.map((o) => o.naam), ["Niet herhalen", "15 min", "30 min", "1 uur", "2 uur"]);
    assert.deepEqual(gekozen(herhaal), ["60"]);
    assert.deepEqual(avond.opties.map((o) => o.naam), ["Geen", "21:00", "22:00", "23:00"]);
    assert.deepEqual(gekozen(avond), ["22:00"]);
    // Elke groep: één waarde uit een rijtje.
    assert.ok([minuten, herhaal, avond].every((g) => g.enkel));
  });

  it("wat iemand koos, en wat niet deugt laat de kaart staan", () => {
    const stand = { ...STAND, keuzes: { [BRAM]: { garage_minuten: ["15"], garage_herhaal: ["0"], garage_avond: ["uit"] } } };
    assert.deepEqual(M.garageKeuze(stand, BRAM), { minuten: 15, herhaal: 0, avond: null });
    assert.deepEqual(M.garageKeuzes(stand, BRAM).map(gekozen), [["15"], ["0"], ["uit"]]);
    const raar = { ...STAND, keuzes: { [BRAM]: { garage_minuten: ["x"], garage_herhaal: [], garage_avond: ["25:00"] } } };
    assert.deepEqual(M.garageKeuze(raar, BRAM), { minuten: 5, herhaal: 60, avond: "22:00" });
  });

  it("een standaard die niet in het rijtje staat, komt erbij, en geen avond op de kaart is Geen", () => {
    const stand = { ...STAND, garage: { ...STAND.garage, minuten: 45, herhaal: 90, avond: null } };
    const [minuten, herhaal, avond] = M.garageKeuzes(stand, BRAM);
    assert.deepEqual(minuten.opties.map((o) => o.id), ["5", "10", "15", "30", "45", "60"]);
    assert.equal(herhaal.opties.find((o) => o.id === "90").naam, "1 uur 30 min");
    assert.deepEqual(gekozen(avond), ["uit"]);
  });

  it("de standaard kiezen haalt de keuze weg, zodat hij de kaart blijft volgen", () => {
    assert.equal(M.nieuweGarageKeuze(STAND, "garage_minuten", "5"), null);
    assert.deepEqual(M.nieuweGarageKeuze(STAND, "garage_minuten", "30"), ["30"]);
    assert.equal(M.nieuweGarageKeuze(STAND, "garage_avond", "22:00"), null);
    assert.deepEqual(M.nieuweGarageKeuze(STAND, "garage_avond", "uit"), ["uit"]);
    const zonderAvond = { ...STAND, garage: { ...STAND.garage, avond: null } };
    assert.equal(M.nieuweGarageKeuze(zonderAvond, "garage_avond", "uit"), null);
  });

  it("de regel onder de garagedeur noemt de eigen minuten", () => {
    const stand = { ...STAND, keuzes: { [BRAM]: { garage_minuten: ["30"] } } };
    assert.equal(M.garageRegel({ stand, persoon: BRAM }), "Dicht · melding na 30 min open");
    // REGRESSIEWACHT: zonder persoon de kaart.
    assert.equal(M.garageRegel({ stand }), "Dicht · melding na 5 min open");
  });
});
