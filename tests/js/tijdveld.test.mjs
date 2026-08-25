/**
 * Een tijd of datum zetten vanaf de regel zelf.
 *
 * NIEUW GEDRAG: `tijdveld.js` bestond niet vóór deze ronde. Een `input_datetime`
 * op de entiteitenkaart toonde alleen zijn waarde; wie hem wilde verzetten moest
 * langs het venster van Home Assistant.
 *
 * Wat hier getoetst wordt is precies wat op een dashboard stilletjes fout gaat
 * en pas opvalt als de wekker niet afgaat:
 *
 * - Vier domeinen spellen hetzelfde moment anders. `input_datetime` zegt
 *   "2026-08-25 07:30:00", `datetime` zegt hetzelfde in UTC mét zone.
 * - `has_date` en `has_time` bepalen welk veld erbij hoort. Ontbreken ze, dan
 *   moet de toestand zelf nog leesbaar zijn -- anders valt de kaart terug op
 *   geen veld en is de bediening weg.
 * - Elk domein heeft zijn eigen service en zijn eigen sleutel. Een `time`-
 *   entiteit met `input_datetime.set_datetime` bedienen doet niets, zonder fout
 *   op de kaart.
 * - Een entiteit die nog nooit gezet is staat op `unknown`. Daar hoort een leeg
 *   veld bij en geen verzonnen middernacht.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  TIJD_DOMEINEN,
  kanTijdZetten,
  tijdSoort,
  veldTijd,
  veldWaarde,
  zetOproep,
  zoneVan,
} from "../../src/cards/tijdveld.js";

const S = (entity_id, state, attributes = {}) => ({ entity_id, state, attributes });

describe("welke entiteit een veld krijgt", () => {
  it("kent de vier domeinen die een moment dragen", () => {
    assert.equal(kanTijdZetten("input_datetime.wektijd"), true);
    assert.equal(kanTijdZetten("time.wekker"), true);
    assert.equal(kanTijdZetten("date.vakantie"), true);
    assert.equal(kanTijdZetten("datetime.afspraak"), true);
    assert.equal(TIJD_DOMEINEN.size, 4);
  });

  it("laat de rest met rust", () => {
    for (const id of ["sensor.tijd", "light.spots", "input_number.uur", "", undefined]) {
      assert.equal(kanTijdZetten(id), false);
    }
  });
});

describe("welk veld erbij hoort", () => {
  it("leest has_date en has_time van een input_datetime", () => {
    assert.equal(
      tijdSoort(S("input_datetime.wektijd", "07:30:00", { has_date: false, has_time: true })),
      "time"
    );
    assert.equal(
      tijdSoort(S("input_datetime.vakantie", "2026-08-25", { has_date: true, has_time: false })),
      "date"
    );
    assert.equal(
      tijdSoort(
        S("input_datetime.afspraak", "2026-08-25 07:30:00", { has_date: true, has_time: true })
      ),
      "datetime-local"
    );
  });

  it("valt zonder die attributen terug op de toestand zelf", () => {
    assert.equal(tijdSoort(S("input_datetime.wektijd", "07:30:00")), "time");
    assert.equal(tijdSoort(S("input_datetime.vakantie", "2026-08-25")), "date");
    assert.equal(tijdSoort(S("input_datetime.afspraak", "2026-08-25 07:30:00")), "datetime-local");
  });

  it("geeft de domeinen time, date en datetime hun eigen veld", () => {
    assert.equal(tijdSoort(S("time.wekker", "07:30:00")), "time");
    assert.equal(tijdSoort(S("date.vakantie", "2026-08-25")), "date");
    assert.equal(tijdSoort(S("datetime.afspraak", "2026-08-25T05:30:00+00:00")), "datetime-local");
  });

  it("geeft niets terug voor wat geen moment draagt", () => {
    assert.equal(tijdSoort(null), null);
    assert.equal(tijdSoort(S("sensor.tijd", "07:30:00")), null);
    assert.equal(tijdSoort(S("input_datetime.raar", "vandaag")), null);
    // Een helper zonder datum en zonder tijd bestaat niet in Home Assistant,
    // maar een kaart hoort er niet op om te vallen.
    assert.equal(
      tijdSoort(S("input_datetime.leeg", "", { has_date: false, has_time: false })),
      null
    );
  });
});

describe("wat er in het veld staat", () => {
  it("knipt de seconden eraf", () => {
    assert.equal(veldWaarde(S("input_datetime.wektijd", "07:30:00", { has_time: true })), "07:30");
    assert.equal(veldWaarde(S("time.wekker", "7:05:00")), "07:05");
  });

  it("geeft een datum ongewijzigd door", () => {
    assert.equal(veldWaarde(S("date.vakantie", "2026-08-25")), "2026-08-25");
  });

  it("zet datum en tijd om naar wat het veld wil zien", () => {
    assert.equal(
      veldWaarde(S("input_datetime.afspraak", "2026-08-25 07:30:00", { has_date: true, has_time: true })),
      "2026-08-25T07:30"
    );
  });

  it("rekent het datetime-domein om naar lokale tijd", () => {
    // Een moment dat hier is opgebouwd uit lokale onderdelen moet er ook weer
    // lokaal uitkomen, in welke tijdzone de machine ook staat.
    const lokaal = new Date(2026, 7, 25, 7, 30);
    const st = S("datetime.afspraak", lokaal.toISOString());
    assert.equal(veldWaarde(st), "2026-08-25T07:30");
  });

  it("laat het veld leeg bij een entiteit die nog nooit gezet is", () => {
    assert.equal(veldWaarde(S("time.wekker", "unknown")), "");
    assert.equal(veldWaarde(S("time.wekker", "unavailable")), "");
    assert.equal(veldWaarde(null), "");
  });
});

describe("wat er naar Home Assistant gaat", () => {
  it("zet een tijd op een input_datetime met set_datetime", () => {
    assert.deepEqual(zetOproep("input_datetime.wektijd", "time", "07:30"), [
      "input_datetime",
      "set_datetime",
      { entity_id: "input_datetime.wektijd", time: "07:30:00" },
    ]);
  });

  it("zet een tijd op een time-entiteit met zijn eigen dienst", () => {
    assert.deepEqual(zetOproep("time.wekker", "time", "07:30"), [
      "time",
      "set_value",
      { entity_id: "time.wekker", time: "07:30:00" },
    ]);
  });

  it("doet hetzelfde voor een datum", () => {
    assert.deepEqual(zetOproep("input_datetime.vakantie", "date", "2026-08-25"), [
      "input_datetime",
      "set_datetime",
      { entity_id: "input_datetime.vakantie", date: "2026-08-25" },
    ]);
    assert.deepEqual(zetOproep("date.vakantie", "date", "2026-08-25"), [
      "date",
      "set_value",
      { entity_id: "date.vakantie", date: "2026-08-25" },
    ]);
  });

  it("stuurt datum en tijd samen als één waarde", () => {
    assert.deepEqual(zetOproep("input_datetime.afspraak", "datetime-local", "2026-08-25T07:30"), [
      "input_datetime",
      "set_datetime",
      { entity_id: "input_datetime.afspraak", datetime: "2026-08-25 07:30:00" },
    ]);
  });

  it("stuurt het datetime-domein een moment mét zone", () => {
    const [domein, dienst, data] = zetOproep(
      "datetime.afspraak",
      "datetime-local",
      "2026-08-25T07:30"
    );
    assert.equal(domein, "datetime");
    assert.equal(dienst, "datetime.set_value".split(".")[1]);
    // De zone is die van deze machine; wat telt is dat hij er staat en dat het
    // moment lokaal 07:30 is.
    assert.equal(data.datetime.slice(0, 19), "2026-08-25T07:30:00");
    assert.match(data.datetime.slice(19), /^[+-]\d{2}:\d{2}$/);
    assert.equal(data.datetime.slice(19), zoneVan(new Date(2026, 7, 25, 7, 30)));
  });

  it("stuurt niets bij een leeg of onleesbaar veld", () => {
    assert.equal(zetOproep("input_datetime.wektijd", "time", ""), null);
    assert.equal(zetOproep("input_datetime.wektijd", "time", "kwart over"), null);
    assert.equal(zetOproep("input_datetime.wektijd", null, "07:30"), null);
    assert.equal(zetOproep("sensor.tijd", "time", "07:30"), null);
  });
});

describe("de twee hulpjes", () => {
  it("schrijft een moment zoals het veld het wil", () => {
    assert.equal(veldTijd(new Date(2026, 0, 5, 9, 4)), "2026-01-05T09:04");
  });

  it("schrijft een zone met twee cijfers en een teken", () => {
    assert.match(zoneVan(new Date(2026, 7, 25, 7, 30)), /^[+-]\d{2}:\d{2}$/);
  });
});
