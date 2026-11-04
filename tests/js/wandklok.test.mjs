/**
 * De klok van Home Assistant op het infoscherm, niet die van het toestel (0.105.0). NIEUW GEDRAG.
 *
 * Deze proeven draaien met elke tijdzone van de machine; de kern is dat de uitkomst daar niet van afhangt.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { afsprakenUit } from "../../src/cards/ruimtes-logica.js";
import { naarWand, vanWand } from "../../src/wandklok.js";

const velden = (d) => [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()];

describe("de wandklok", () => {
  it("toont de tijd van Home Assistant, wat het toestel ook vindt", () => {
    // 4 november 2026, 08:30 UTC: in Amsterdam 09:30, in Londen 08:30, in Lissabon 08:30.
    const d = new Date("2026-11-04T08:30:00Z");
    assert.deepEqual(velden(naarWand(d, "Europe/Amsterdam")), [2026, 11, 4, 9, 30]);
    assert.deepEqual(velden(naarWand(d, "Europe/London")), [2026, 11, 4, 8, 30]);
    assert.deepEqual(velden(naarWand(d, "America/New_York")), [2026, 11, 4, 3, 30]);
  });

  it("in de zomer een uur later in Amsterdam", () => {
    assert.deepEqual(velden(naarWand(new Date("2026-07-01T08:30:00Z"), "Europe/Amsterdam")), [2026, 7, 1, 10, 30]);
  });

  it("over middernacht is het een andere dag", () => {
    assert.deepEqual(velden(naarWand(new Date("2026-11-04T23:30:00Z"), "Europe/Amsterdam")), [2026, 11, 5, 0, 30]);
  });

  it("vanWand is het omgekeerde, ook rond het verzetten van de klok", () => {
    for (const iso of ["2026-11-04T08:30:00Z", "2026-03-29T00:30:00Z", "2026-03-29T01:30:00Z", "2026-10-25T02:30:00Z"]) {
      const d = new Date(iso);
      assert.equal(vanWand(naarWand(d, "Europe/Amsterdam"), "Europe/Amsterdam").toISOString(), d.toISOString(), iso);
    }
  });

  it("02:30 op 25 oktober bestaat twee keer: terug geeft er een van, met dezelfde kloktijd", () => {
    for (const iso of ["2026-10-25T00:30:00Z", "2026-10-25T01:30:00Z"]) {
      const wand = naarWand(new Date(iso), "Europe/Amsterdam");
      const terug = vanWand(wand, "Europe/Amsterdam");
      assert.ok(["2026-10-25T00:30:00.000Z", "2026-10-25T01:30:00.000Z"].includes(terug.toISOString()), iso);
      assert.deepEqual(velden(naarWand(terug, "Europe/Amsterdam")), velden(wand));
    }
  });

  it("middernacht in Amsterdam is 23:00 UTC de dag ervoor", () => {
    const wand = naarWand(new Date("2026-11-04T08:30:00Z"), "Europe/Amsterdam");
    const middernacht = new Date(wand.getFullYear(), wand.getMonth(), wand.getDate());
    assert.equal(vanWand(middernacht, "Europe/Amsterdam").toISOString(), "2026-11-03T23:00:00.000Z");
  });

  it("een afspraak van een ruimte staat op de klok van Home Assistant; een hele dag blijft middernacht", () => {
    const [vergadering, heleDag] = afsprakenUit(
      [
        { start: "2026-11-04T09:30:00+01:00", end: "2026-11-04T10:30:00+01:00", summary: "Overleg" },
        { start: "2026-11-05", end: "2026-11-06", summary: "Dicht" },
      ],
      "Europe/Amsterdam"
    );
    assert.deepEqual([velden(vergadering.start), velden(vergadering.eind)], [[2026, 11, 4, 9, 30], [2026, 11, 4, 10, 30]]);
    assert.deepEqual(velden(heleDag.start), [2026, 11, 5, 0, 0]);
    assert.equal(heleDag.heleDag, true);
  });

  it("zonder tijdzone, of met een onbekende, blijft het tijdstip wat het was", () => {
    const d = new Date("2026-11-04T08:30:00Z");
    assert.equal(naarWand(d, undefined).getTime(), d.getTime());
    assert.equal(naarWand(d, "Mars/Olympus").getTime(), d.getTime());
    assert.equal(vanWand(d, "").getTime(), d.getTime());
  });
});
