/**
 * De taal van de coach (attribuut `taal`, coach v0.140.2) tegen de ECHTE dump.
 *
 * `vaste-invoer/coach-0.140.2-taal.json` is de dump die de coach-sessie op
 * 21 oktober 2026 rond 11:12 UTC maakte bij een klant: een batterij die de
 * coach alleen uitleest (Growatt), en een wasmachine en droger. Alle drie
 * dragen `taal: "nl"`. "en" is in het echt nog niet gezien; dat is alleen een
 * vergelijking, geen nieuwe vorm.
 *
 * De regel (zie `spreektAnders` in coach-logica.js): de kaart houdt de taal van
 * de gebruiker. Spreekt de coach een andere taal, dan valt zijn tekst weg en
 * staat er het woord van de kaart bij de stand.
 *
 * NIEUW GEDRAG: alles hieronder faalt op de code van vóór deze ronde, behalve
 * wat met REGRESSIEWACHT begint.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, describe, it } from "node:test";

import * as A from "../../src/cards/airco-logica.js";
import * as B from "../../src/cards/batterij-logica.js";
import * as C from "../../src/cards/coach-logica.js";
import * as L from "../../src/cards/laadpaal-logica.js";
import * as V from "../../src/cards/vaatwasser-logica.js";
import { _reset } from "../../src/taal.js";

const DUMP = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.140.2-taal.json", import.meta.url), "utf8"));
const st = (id) => DUMP.states.find((s) => s.entity_id === id);
const metAttr = (s, extra) => ({ ...s, attributes: { ...s.attributes, ...extra } });

afterEach(() => _reset());

describe("coach v0.140.2: het attribuut taal", () => {
  it("REGRESSIEWACHT: alle drie de sensors dragen taal nl, met contract 1", () => {
    assert.equal(DUMP.states.length, 3);
    for (const s of DUMP.states) {
      assert.equal(s.attributes.taal, "nl", s.entity_id);
      assert.equal(s.attributes.contract, 1, s.entity_id);
    }
  });

  it("spreektAnders: alleen bij een bekende, andere taal", () => {
    const bat = st("sensor.thuisbatterij_coach");
    _reset({ instelling: "nl" });
    assert.equal(C.spreektAnders(bat), false);
    _reset({ instelling: "en" });
    assert.equal(C.spreektAnders(bat), true);
    assert.equal(C.spreektAnders(metAttr(bat, { taal: "en" })), false);
    assert.equal(C.spreektAnders(metAttr(bat, { taal: "en-GB" })), false);
    // Een coach van vóór v0.140.2 zegt niets, en dan blijft alles zoals het was.
    const { taal, ...zonder } = bat.attributes;
    assert.equal(C.spreektAnders({ ...bat, attributes: zonder }), false);
    assert.equal(C.spreektAnders(null), false);
  });
});

describe("batterij: de tekst van een Nederlandse coach op een Engelse kaart", () => {
  const bat = st("sensor.thuisbatterij_coach");

  it("REGRESSIEWACHT: Nederlands op Nederlands blijft de tekst van de coach", () => {
    _reset({ instelling: "nl" });
    assert.equal(B.batterijStand(bat).tekst, "Alleen uitlezen");
  });

  it("Engels: het woord van de stand, en geen reden", () => {
    _reset({ instelling: "en" });
    const s = B.batterijStand(metAttr(bat, { reason: "Hij laadt op zon." }));
    assert.equal(s.tekst, "Idle");
    assert.equal(s.reden, "");
  });
});

describe("programmakaart: het woord later", () => {
  const was = st("sensor.wasmachine_start");
  const morgen = new Date(Date.now() + 36 * 3600 * 1000);
  const plan = metAttr(was, { later: "morgen", klaar_om: morgen.toISOString() });

  it("REGRESSIEWACHT: in dezelfde taal is het het woord van de coach", () => {
    _reset({ instelling: "nl" });
    assert.equal(V.coachStand(plan).later, "morgen");
  });

  it("in een andere taal rekent de kaart het zelf uit klaar_om", () => {
    _reset({ instelling: "en" });
    assert.equal(V.coachStand(plan).later, undefined);
    const knop = V.coachKnoppen({ coach: V.coachStand(plan), rollen: { ingeruimd_morgen: "switch.x" } })[0];
    assert.doesNotMatch(knop.label, /morgen/);
  });
});

describe("laadpaal en airco: dezelfde regel (zelfde attribuut, nagebootst op hun sensor)", () => {
  it("laadpaal: geen Nederlandse zin en toestand op een Engelse kaart", () => {
    const stand = Object.keys(L.STANDEN)[0];
    const paal = { entity_id: "sensor.laadpaal_coach", state: "Wacht op zon", attributes: { contract: 1, taal: "nl", stand, reason: "Er is geen zon." } };
    _reset({ instelling: "nl" });
    assert.equal(L.laadpaalStand(paal).reden, "Er is geen zon.");
    assert.equal(L.laadpaalStand(paal).tekst, "Wacht op zon");
    _reset({ instelling: "en" });
    assert.equal(L.laadpaalStand(paal).reden, "");
    assert.notEqual(L.laadpaalStand(paal).tekst, "Wacht op zon");
  });

  it("airco: de regel valt terug op het woord bij de stand", () => {
    const airco = { entity_id: "sensor.airco_coach", state: "Aan", attributes: { contract: 1, taal: "nl", stand: "zon", reason: "Aan op zon, 2,1 kW over." } };
    _reset({ instelling: "en" });
    assert.equal(A.coachRegel(A.aircoCoachStand(airco)), "Running on solar.");
    _reset({ instelling: "nl" });
    assert.equal(A.coachRegel(A.aircoCoachStand(airco)), "Aan op zon, 2,1 kW over.");
  });
});

// De tweede dump, van dezelfde klant 27 minuten later: de coach op English
// (11:39 UTC), Home Assistant zelf nog op nl. Daarmee is "en" in het echt gezien.
const EN = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.140.2-taal-en.json", import.meta.url), "utf8"));
const en = (id) => EN.states.find((s) => s.entity_id === id);

describe("coach v0.140.2 op English (echte dump)", () => {
  it("REGRESSIEWACHT: alle drie dragen taal en, en de stand blijft een sleutel", () => {
    assert.deepEqual(EN.states.map((s) => [s.attributes.taal, s.attributes.stand]), [
      ["en", "stil"],
      ["en", "niet_vrijgegeven"],
      ["en", "draait"],
    ]);
  });

  it("Engelse kaart, Engelse coach: de tekst van de coach staat er gewoon", () => {
    _reset({ instelling: "en" });
    const bat = en("sensor.thuisbatterij_coach");
    assert.equal(C.spreektAnders(bat), false);
    assert.equal(B.batterijStand(bat).tekst, "Read only");
  });

  it("Nederlandse kaart, Engelse coach: het Nederlandse woord bij de stand", () => {
    _reset({ instelling: "nl" });
    const bat = en("sensor.thuisbatterij_coach");
    assert.equal(C.spreektAnders(bat), true);
    assert.equal(B.batterijStand(bat).tekst, "Stil");
  });
});
