/**
 * Het veld "Hoe vol is de auto nu?" op de laadpaalkaart (coach 0.117.0).
 *
 * De eigenaar op 14 oktober 2026, met de integratie van zijn auto even uit
 * Home Assistant: de coach vroeg "Geef de accustand door op de laadpaalkaart",
 * "maar ik kan nergens de accustand doorgeven." In de coach zelf kwam het veld
 * in 0.116.2; op deze kaart via de number `accustand` met de attributen
 * `vragen`, `wacht` en `sensor` (afgesproken met de coach-sessie die dag).
 *
 * NIEUW GEDRAG: elke test hier faalt op 0.63.1, want `accustandVeld` en
 * `accustandInvoer` bestaan daar niet.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as L from "../../src/cards/laadpaal-logica.js";

const N = (state, attributes = {}) => ({
  entity_id: "number.oprit_accustand",
  state,
  attributes: { min: 0, max: 100, step: 1, mode: "box", unit_of_measurement: "%", ...attributes },
});

describe("NIEUW GEDRAG: wanneer het veld er staat", () => {
  it("alleen als de coach erom vraagt", () => {
    assert.equal(L.accustandVeld(N("unknown", { vragen: false })), null);
    assert.equal(L.accustandVeld(N("unknown", {})), null);
    assert.notEqual(L.accustandVeld(N("unknown", { vragen: true })), null);
  });

  it("niet bij een coach zonder deze entiteit, en niet als hij onbereikbaar is", () => {
    assert.equal(L.accustandVeld(null), null);
    assert.equal(L.accustandVeld(undefined), null);
    assert.equal(L.accustandVeld(N("unavailable", { vragen: true })), null);
  });

  it("vragen moet echt waar zijn, niet een tekst", () => {
    assert.equal(L.accustandVeld(N("unknown", { vragen: "true" })), null);
  });
});

describe("NIEUW GEDRAG: de waarde in het veld", () => {
  it("zonder opgave leeg", () => {
    const v = L.accustandVeld(N("unknown", { vragen: true }));
    assert.equal(v.waarde, "");
    assert.equal(v.opgegeven, false);
  });

  it("na een opgave de stand van de coach, afgerond", () => {
    assert.equal(L.accustandVeld(N("40", { vragen: true })).waarde, "40");
    assert.equal(L.accustandVeld(N("41.6", { vragen: true })).waarde, "42");
    assert.equal(L.accustandVeld(N("0", { vragen: true })).waarde, "0");
    assert.equal(L.accustandVeld(N("0", { vragen: true })).opgegeven, true);
  });

  it("een lege toestand is geen opgave van 0", () => {
    assert.equal(L.accustandVeld(N("", { vragen: true })).opgegeven, false);
  });
});

describe("NIEUW GEDRAG: de uitleg, gelijk aan de coachkaart", () => {
  const LOOPT = "Dit loopt mee met wat de paal erin doet. Zegt de auto iets anders, vul dat in en druk op Doorgeven.";
  const STIL = "De auto geeft zijn accustand nu niet door. ";
  const WACHT = "Hier wacht de coach op. Zonder dit gaat hij uit van een lege accu.";
  const ANDERS = "Geef dit door, dan kan de coach het gunstigste moment kiezen.";

  it("auto met een sensor die zwijgt, de coach wacht", () => {
    assert.equal(L.accustandVeld(N("unknown", { vragen: true, wacht: true, sensor: true })).uitleg, STIL + WACHT);
  });

  it("auto met een sensor die zwijgt, de coach wacht niet", () => {
    assert.equal(L.accustandVeld(N("unknown", { vragen: true, wacht: false, sensor: true })).uitleg, STIL + ANDERS);
  });

  it("auto zonder sensor: zonder de eerste zin", () => {
    assert.equal(L.accustandVeld(N("unknown", { vragen: true, wacht: true, sensor: false })).uitleg, WACHT);
    assert.equal(L.accustandVeld(N("unknown", { vragen: true, wacht: false, sensor: false })).uitleg, ANDERS);
  });

  it("zonder het attribuut sensor ook zonder de eerste zin", () => {
    assert.equal(L.accustandVeld(N("unknown", { vragen: true, wacht: true })).uitleg, WACHT);
  });

  it("na een opgave altijd hetzelfde, ook als de coach nog wacht", () => {
    assert.equal(L.accustandVeld(N("40", { vragen: true, wacht: true, sensor: true })).uitleg, LOOPT);
    assert.equal(L.accustandVeld(N("40", { vragen: true })).uitleg, LOOPT);
  });

  it("geen gedachtestreepjes in tekst die de klant leest", () => {
    for (const attributen of [{ wacht: true, sensor: true }, { wacht: false }, {}]) {
      for (const state of ["unknown", "40"]) {
        const tekst = L.accustandVeld(N(state, { vragen: true, ...attributen })).uitleg;
        assert.doesNotMatch(tekst, /[–—]| - |--/);
      }
    }
  });
});

describe("NIEUW GEDRAG: wat er naar de coach gaat", () => {
  const st = N("unknown", { vragen: true });

  it("een heel getal zoals het is", () => {
    assert.equal(L.accustandInvoer("40", st), 40);
    assert.equal(L.accustandInvoer(" 7 ", st), 7);
    assert.equal(L.accustandInvoer("0", st), 0);
    assert.equal(L.accustandInvoer("100", st), 100);
  });

  it("afgerond op de stap, ook met een komma", () => {
    assert.equal(L.accustandInvoer("40.4", st), 40);
    assert.equal(L.accustandInvoer("40,6", st), 41);
  });

  it("binnen min en max: Home Assistant weigert erbuiten", () => {
    assert.equal(L.accustandInvoer("140", st), 100);
    assert.equal(L.accustandInvoer("-5", st), 0);
  });

  it("leeg of geen getal: niets", () => {
    assert.equal(L.accustandInvoer("", st), null);
    assert.equal(L.accustandInvoer("   ", st), null);
    assert.equal(L.accustandInvoer("veertig", st), null);
    assert.equal(L.accustandInvoer(undefined, st), null);
  });

  it("zonder min, max en stap: 0 tot 100, hele procenten", () => {
    assert.equal(L.accustandInvoer("120", null), 100);
    assert.equal(L.accustandInvoer("33.3", { attributes: {} }), 33);
  });
});
