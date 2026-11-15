/**
 * Het pakket uit de echte coach v0.225.0 (`vaste-invoer/coach-0.225.0-pakket.json`), door de logica van de kaart. De
 * regel van 12 oktober 2026: er gaat niets uit dat een veld van de coach leest dat niet in een echte dump stond.
 *
 * NIEUW GEDRAG: op 0.127.0 kent de kaart `pakket` niet.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as B from "../../src/cards/bot-logica.js";
import { _reset } from "../../src/taal.js";

const DUMP = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.225.0-pakket.json", import.meta.url), "utf8"));
const NU = new Date("2026-11-15T20:00:00+01:00");
const lijst = (pakket) => ({ contract: 1, gesprek: B.leegGesprek(), tickets: [], pakket });

describe("het pakket van coach v0.225.0", () => {
  it("staat altijd in list en in het eerste event, ook als null", () => {
    assert.deepEqual(DUMP.list_sleutels, ["contract", "gesprek", "pakket", "tickets"]);
    assert.deepEqual(DUMP.subscribe_eerste_sleutels, ["contract", "gesprek", "pakket", "tickets"]);
    assert.equal(B.verwerk(null, lijst(DUMP.list_zonder_pakket)).pakket, null);
    const p = B.pakketOver(B.verwerk(null, lijst(DUMP.list_pakket)), NU);
    assert.deepEqual(p, { naam: "DomotiCare", vragen: DUMP.list_pakket.vragen_over, tickets: DUMP.list_pakket.tickets_over,
      opnieuw: new Date(DUMP.list_pakket.opnieuw).getTime() });
  });

  it("na een vraag staat het pakket naast het gesprek, en de kaart neemt het over", () => {
    assert.deepEqual(DUMP.event_na_vraag.sleutels, ["pakket", "ticket"]);
    const stand = B.verwerk(null, lijst(DUMP.list_pakket));
    const bij = B.verwerk(stand, { ticket: { id: DUMP.event_na_vraag.ticket_id, berichten: [] }, pakket: DUMP.event_na_vraag.pakket });
    assert.equal(B.pakketOver(bij, NU).vragen, DUMP.list_pakket.vragen_over - 1);
  });

  it("na set_plan komt het pakket alleen, en zonder pakket is dat null", () => {
    const stand = B.verwerk(null, lijst(DUMP.list_pakket));
    assert.equal(B.pakketOver(B.verwerk(stand, DUMP.event_na_set_plan), NU).naam, "DomotiCare Plus");
    assert.deepEqual(DUMP.event_geen_pakket, { pakket: null });
    assert.equal(B.pakketOver(B.verwerk(stand, DUMP.event_geen_pakket), NU), null);
  });

  it("op 0 zijn vragen en tickets op, en de fouten worden de zinnen van de kaart", () => {
    _reset();
    const p = B.pakketOver({ pakket: DUMP.pakket_op_stand }, NU);
    assert.deepEqual([p.vragen, p.tickets], [0, 0]);
    assert.equal(B.foutTekst(DUMP.fout_vraag_op), DUMP.fout_vraag_op.message);
    assert.equal(B.foutTekst(DUMP.fout_ticket_op, { nieuw: true }), DUMP.fout_ticket_op.message);
  });

  it("Onbeperkt heeft geen grens, en Geen DomotiCare herkent de kaart", () => {
    const o = B.pakketOver({ pakket: DUMP.onbeperkt }, NU);
    assert.deepEqual([o.naam, o.vragen, o.tickets], ["DomotiCare Onbeperkt", null, null]);
    assert.equal(B.zonderAssist({ pakket: DUMP.onbeperkt }), false);
    assert.equal(B.zonderAssist({ pakket: DUMP.geen_pakket }), true);
    // De zin van de kaart volgt de afspraak na v0.225.0 ("Ja zonder care wel een storing melden"); v0.225.0 zelf zegt
    // nog alleen de eerste zin.
    assert.equal(DUMP.fout_geen_vraag.code, "geen_coach_assist");
    assert.ok(B.foutTekst(DUMP.fout_geen_vraag).startsWith(DUMP.fout_geen_vraag.message));
  });
});
