/**
 * Coach Assist is bezig, uit een echte installatie met coach v0.249.0 (`vaste-invoer/coach-0.249.0-coach-assist-bezig.json`):
 * `tickets/busy` op het gesprek, twee minuten, en weer uit, met `tickets/list` ervoor, tijdens en erna. Namen, user_id's en
 * de tekst van de berichten zijn verzonnen, de rest is echt.
 *
 * Wat de dump laat zien en de bron van v0.243.0 niet zei: `bezig` staat bij `list` op het gesprek (niet in `tickets`), na
 * minuten 0 is de sleutel helemaal weg (geen `null`), en `tickets/read` geeft `{}` terug. Dat laatste raakt de kaart niet:
 * die gebruikt het antwoord van `read` niet.
 *
 * NIEUW GEDRAG: `bezigTot` bestaat op 0.139.0 niet.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as B from "../../src/cards/bot-logica.js";

const DUMP = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.249.0-coach-assist-bezig.json", import.meta.url), "utf8"));
const op = (iso) => Date.parse(iso);
const TIJDENS = op("2026-11-27T11:48:30+01:00");

describe("NIEUW GEDRAG coach v0.249.0: Coach Assist is bezig", () => {
  it("de vorm: {sinds, tot} met tijdzone, op het gesprek in list en in het antwoord op busy", () => {
    const { bezig } = DUMP.lijst_bezig.gesprek;
    assert.deepEqual(Object.keys(bezig).sort(), ["sinds", "tot"]);
    assert.match(bezig.tot, /[+-]\d\d:\d\d$/);
    assert.deepEqual(DUMP.busy_aan.bezig, bezig);
    assert.equal(op(bezig.tot) - op(bezig.sinds), 2 * 60 * 1000);
  });

  it("list tijdens busy: de kaart ziet het gesprek bezig tot `tot`, en daarna niet meer", () => {
    const stand = B.verwerk(null, DUMP.lijst_bezig);
    assert.equal(stand.gesprek.id, B.GESPREK);
    assert.equal(B.bezigTot(stand.gesprek, TIJDENS), op(DUMP.lijst_bezig.gesprek.bezig.tot));
    assert.equal(B.bezigTot(stand.gesprek, op(DUMP.lijst_bezig.gesprek.bezig.tot) + 1), null);
  });

  it("list ervoor en erna, en busy met 0 minuten: de sleutel is weg, en de kaart ziet niets", () => {
    for (const g of [DUMP.lijst_voor.gesprek, DUMP.lijst_na.gesprek, DUMP.busy_uit]) {
      assert.equal("bezig" in g, false);
      assert.equal(B.bezigTot(g, TIJDENS), null);
    }
  });

  it("het hele ticket als bericht (zoals subscribe en busy het geven): bezig erbij en weer weg", () => {
    let stand = B.verwerk(null, DUMP.lijst_voor);
    assert.equal(B.bezigTot(stand.gesprek, TIJDENS), null);
    stand = B.verwerk(stand, { ticket: DUMP.busy_aan });
    assert.equal(B.bezigTot(stand.gesprek, TIJDENS), op(DUMP.busy_aan.bezig.tot));
    assert.equal(stand.gesprek.berichten.length, DUMP.lijst_voor.gesprek.berichten.length);
    stand = B.verwerk(stand, { ticket: DUMP.busy_uit });
    assert.equal(B.bezigTot(stand.gesprek, TIJDENS), null);
  });

  it("read geeft {} terug", () => {
    assert.deepEqual(DUMP.read_bezig, {});
    assert.deepEqual(DUMP.read_na, {});
  });
});
