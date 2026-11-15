/**
 * Gesloten is gesloten (0.129.0). De eigenaar, 15 november 2026: "als een ticket gesloten is moet je niet meer opnieuw
 * kunnen typen en de klant moet ook goed kunnen zien wat open staat en gesloten is".
 *
 * NIEUW GEDRAG: op 0.128.0 bestaat `standEtiket` niet, staan open en gesloten tickets door elkaar, en heeft een gesloten
 * ticket een veld om te typen. Hoe het eruitziet staat in `docs/gesloten-is-gesloten/RAPPORT.md`.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as B from "../../src/cards/bot-logica.js";
import { _reset } from "../../src/taal.js";

const DUMP = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.220.0-tickets.json", import.meta.url), "utf8"));
const BRON = readFileSync(new URL("../../src/cards/bot-scherm.js", import.meta.url), "utf8");

describe("het etiket van de stand", () => {
  it("Open, In behandeling of Gesloten, voor elke stand van het contract", () => {
    _reset();
    assert.deepEqual(["nieuw", "in_behandeling", "bij_beheerder", "klaar"].map((s) => B.standEtiket(s)), [
      { tekst: "Open", soort: "open" },
      { tekst: "In behandeling", soort: "bezig" },
      { tekst: "In behandeling", soort: "bezig" },
      { tekst: "Gesloten", soort: "dicht" },
    ]);
    // Een stand die de kaart niet kent is in behandeling, net als bij standNaam.
    assert.equal(B.standEtiket("iets_nieuws").soort, "bezig");
  });

  it("de standen uit de echte dump van coach v0.220.0", () => {
    const standen = DUMP.list.tickets.map((x) => B.standEtiket(x.stand).soort);
    assert.ok(standen.every((s) => ["open", "bezig", "dicht"].includes(s)));
  });

  it("in het Engels", () => {
    _reset({ instelling: "en" });
    assert.deepEqual(["nieuw", "in_behandeling", "klaar"].map((s) => B.standEtiket(s).tekst), ["Open", "In progress", "Closed"]);
    _reset();
  });

  it("de fout ticket_gesloten in een zin", () => {
    _reset();
    assert.equal(B.foutTekst({ code: "ticket_gesloten", message: "x" }), "Dit ticket is gesloten. Is het er weer? Maak dan een nieuw ticket.");
  });
});

describe("het scherm", () => {
  it("zet open en gesloten tickets apart, gesloten ingeklapt tenzij er iets ongelezens in staat", () => {
    assert.match(BRON, /const lopend = tickets\.filter\(loopt\);/);
    assert.match(BRON, /if \(dicht\.some\(\(x\) => ongelezen\(x, uid\)\)\) this\.geslotenOpen_ = true;/);
    assert.match(BRON, /if \(this\.geslotenOpen_\) delen\.push\(\.\.\.dicht\.map/);
  });

  it("een gesloten ticket heeft geen veld, wel de zin en Nieuw ticket met dezelfde soort", () => {
    assert.match(BRON, /this\.\$\('\.schrijf\[data-voor="ticket"\]'\)\.hidden = dicht;/);
    assert.match(BRON, /this\.\$\("\.ticket-stand \.dicht"\)\.hidden = !dicht;/);
    assert.match(BRON, /this\.soort_ = soort;/);
  });
});
