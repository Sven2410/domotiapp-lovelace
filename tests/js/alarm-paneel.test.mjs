/**
 * Het alarmpaneel: welke knoppen, en wanneer een code.
 *
 * Dit is het deel waar een fout niet lelijk is maar gevaarlijk. Een kaart die
 * denkt dat er geen code nodig is stuurt een opdracht die geweigerd wordt, en
 * een kaart die om een code vraagt waar er geen is, zet iemand vast voor zijn
 * eigen alarm. Vandaar dat beide beslissingen pure functies zijn met deze tests
 * eronder.
 *
 * NIEUW GEDRAG: `alarm-logica.js` bestond niet vóór deze ronde.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  KENMERK,
  STANDEN,
  beschikbareStanden,
  codeSoort,
  heeftCodeNodig,
  standVan,
} from "../../src/cards/alarm-logica.js";

const paneel = (attributes = {}) => ({
  entity_id: "alarm_control_panel.huis",
  state: "disarmed",
  attributes,
});

const sleutels = (lijst) => lijst.map((s) => s.sleutel);

describe("beschikbareStanden()", () => {
  it("een paneel dat alles kan, krijgt alle drie", () => {
    const st = paneel({ supported_features: KENMERK.ARM_HOME | KENMERK.ARM_AWAY });
    assert.deepEqual(sleutels(beschikbareStanden(st)), ["disarmed", "armed_away", "armed_home"]);
  });

  it("Alarmo zonder thuismodus krijgt geen knop Thuis", () => {
    // 26 = ARM_AWAY | TRIGGER | ARM_CUSTOM_BYPASS -- precies wat er op de
    // installatie van de eigenaar stond.
    const st = paneel({ supported_features: 26 });
    assert.deepEqual(sleutels(beschikbareStanden(st)), ["disarmed", "armed_away"]);
  });

  it("uitschakelen kan altijd, ook zonder enig kenmerk voor iets anders", () => {
    const st = paneel({ supported_features: KENMERK.TRIGGER });
    assert.deepEqual(sleutels(beschikbareStanden(st)), ["disarmed"]);
  });

  it("een paneel dat niets meldt houdt alle knoppen: niets weten is geen reden om de bediening weg te halen", () => {
    assert.deepEqual(sleutels(beschikbareStanden(paneel())), sleutels(STANDEN));
    assert.deepEqual(sleutels(beschikbareStanden(null)), sleutels(STANDEN));
  });
});

describe("heeftCodeNodig() — een paneel met een eigen code", () => {
  const metCode = (extra = {}) => paneel({ code_format: "number", ...extra });

  it("uitschakelen vraagt altijd om de code", () => {
    assert.equal(heeftCodeNodig(metCode({ code_arm_required: false }), "disarmed"), true);
  });

  it("inschakelen volgt het paneel", () => {
    assert.equal(heeftCodeNodig(metCode({ code_arm_required: true }), "armed_away"), true);
    assert.equal(heeftCodeNodig(metCode({ code_arm_required: false }), "armed_away"), false);
  });

  it("zegt het paneel er niets over, dan is het veilige antwoord: wel een code", () => {
    assert.equal(heeftCodeNodig(metCode(), "armed_home"), true);
  });

  it("de kaartinstelling kan het overrulen, beide kanten op", () => {
    const st = metCode({ code_arm_required: false });
    assert.equal(heeftCodeNodig(st, "armed_away", "altijd"), true);
    assert.equal(heeftCodeNodig(metCode({ code_arm_required: true }), "armed_away", "nooit"), false);
  });

  it("maar nooit voor uitschakelen -- dat is de hele reden dat er een code is", () => {
    assert.equal(heeftCodeNodig(metCode(), "disarmed", "nooit"), true);
  });
});

describe("heeftCodeNodig() — een code van DomotiApp zelf", () => {
  it("vraagt bij uitschakelen om de code", () => {
    assert.equal(heeftCodeNodig(paneel(), "disarmed", "paneel", true), true);
  });

  it("en bij inschakelen niet: inschakelen is nooit het gevaarlijke deel", () => {
    assert.equal(heeftCodeNodig(paneel(), "armed_away", "paneel", true), false);
    assert.equal(heeftCodeNodig(paneel(), "armed_home", "paneel", true), false);
  });

  it("tenzij je dat expliciet zo instelt", () => {
    assert.equal(heeftCodeNodig(paneel(), "armed_away", "altijd", true), true);
  });
});

describe("heeftCodeNodig() — helemaal geen code", () => {
  it("vraagt nergens om, ook niet bij uitschakelen", () => {
    assert.equal(heeftCodeNodig(paneel(), "disarmed"), false);
    assert.equal(heeftCodeNodig(paneel(), "armed_away", "altijd"), false);
    assert.equal(heeftCodeNodig(null, "disarmed", "paneel", false), false);
  });
});

describe("codeSoort() en standVan()", () => {
  it("leest het codeformaat van het paneel", () => {
    assert.equal(codeSoort(paneel({ code_format: "number" })), "number");
    assert.equal(codeSoort(paneel({ code_format: "text" })), "text");
    assert.equal(codeSoort(paneel()), null);
  });

  it("koppelt een sleutel aan zijn dienst", () => {
    assert.equal(standVan("disarmed").dienst, "alarm_disarm");
    assert.equal(standVan("armed_away").dienst, "alarm_arm_away");
    assert.equal(standVan("armed_home").dienst, "alarm_arm_home");
    assert.equal(standVan("bestaat_niet"), undefined);
  });
});
