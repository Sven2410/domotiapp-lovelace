/**
 * Gesloten is gesloten en opruimen, uit de echte coach v0.230.0 (`vaste-invoer/coach-0.230.0-gesloten.json`), door de
 * logica en de bron van de kaart. Na 30 dagen dicht haalt de coach de foto's weg en zet hij `bijlagen_weg` op het
 * bericht; de kaart zegt dan "Foto verwijderd" in plaats van een leeg vak.
 *
 * NIEUW GEDRAG: "het scherm" (op 0.129.0 kent de kaart `bijlagen_weg` niet, en gaat de getypte tekst niet mee).
 * REGRESSIEWACHT: "coach v0.230.0", want 0.129.0 kende `klaar` en `ticket_gesloten` al; die proeven houden de kaart gelijk
 * aan wat de coach nu echt geeft.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as B from "../../src/cards/bot-logica.js";
import { _reset } from "../../src/taal.js";

const DUMP = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.230.0-gesloten.json", import.meta.url), "utf8"));
const BRON = readFileSync(new URL("../../src/cards/bot-scherm.js", import.meta.url), "utf8");

describe("REGRESSIEWACHT coach v0.230.0: gesloten is gesloten", () => {
  it("een gesloten ticket is Gesloten, en heeft een tijd van sluiten", () => {
    _reset();
    assert.equal(DUMP.gesloten_ticket.stand, "klaar");
    assert.equal(B.loopt(DUMP.gesloten_ticket), false);
    assert.equal(B.standEtiket(DUMP.gesloten_ticket.stand).tekst, "Gesloten");
    assert.ok(DUMP.gesloten_ticket.gesloten);
  });

  it("reply en answer op een gesloten ticket: ticket_gesloten, en de kaart zegt dezelfde zin", () => {
    _reset();
    for (const fout of [DUMP.fout_reply_gesloten, DUMP.fout_answer_gesloten]) {
      assert.equal(fout.code, "ticket_gesloten");
      assert.equal(B.foutTekst(fout), fout.message);
    }
  });

  it("na een dag dicht staat het ticket niet meer in de lijst; heropend is gesloten weg", () => {
    assert.deepEqual(DUMP.list_na_3_uur_ids, [1]);
    assert.deepEqual(DUMP.list_na_2_dagen_ids, []);
    assert.equal(DUMP.heropend.gesloten, undefined);
    assert.equal(B.loopt(DUMP.heropend), true);
  });

  it("na 31 dagen: geen bijlagen meer, wel bijlagen_weg", () => {
    const [eerst] = DUMP.gesloten_ticket.berichten;
    const [na] = DUMP.ticket_na_31_dagen.berichten;
    assert.equal(eerst.bijlagen.length, 1);
    assert.equal(na.bijlagen, undefined);
    assert.equal(na.bijlagen_weg, true);
  });
});

describe("NIEUW GEDRAG het scherm", () => {
  it("zegt Foto verwijderd bij bijlagen_weg", () => {
    assert.match(BRON, /if \(b\.bijlagen_weg\) \{/);
    assert.match(BRON, /weg\.lastChild\.textContent = t\("Foto verwijderd"\);/);
  });

  it("Nieuw ticket bij een gesloten ticket neemt de getypte tekst mee", () => {
    assert.match(BRON, /this\.naar_\("nieuw"\);\n\s+this\.\$\('\.schrijf\[data-voor="nieuw"\] textarea'\)\.value = tekst;\n\s+if \(SOORTEN/);
  });
});
