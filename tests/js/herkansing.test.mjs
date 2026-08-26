/**
 * De herkansing die "Unknown command." opvangt.
 *
 * NIEUW GEDRAG. Zie de kop van `src/herkansing.js` voor de meting in een echte
 * instance: `unknown_command` is niet stuk, het is te vroeg.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { Herkansing, WACHTTIJDEN, nogNietGereed } from "../../src/herkansing.js";

/** Een klok die niet loopt, zodat een test hem zelf mag verzetten. */
function nepKlok() {
  const wachtrij = [];
  return {
    klok: (fn, ms) => {
      wachtrij.push({ fn, ms });
      return wachtrij.length;
    },
    stopKlok: (id) => {
      if (wachtrij[id - 1]) wachtrij[id - 1].gestopt = true;
    },
    /** Laat de eerste openstaande poging afgaan. */
    tik() {
      const volgende = wachtrij.find((t) => !t.gestopt && !t.gedaan);
      assert.ok(volgende, "er stond geen poging klaar");
      volgende.gedaan = true;
      volgende.fn();
      return volgende.ms;
    },
    wachtrij,
  };
}

describe("nogNietGereed — NIEUW GEDRAG", () => {
  it("herkent 'unknown_command' — de opstartwedloop van de schermafdruk", () => {
    assert.equal(nogNietGereed({ code: "unknown_command", message: "Unknown command." }), true);
  });

  it("herkent onze eigen 'niet geladen' bij not_allowed", () => {
    assert.equal(
      nogNietGereed({ code: "not_allowed", message: "DomotiApp Lovelace is niet geladen" }),
      true,
    );
  });

  it("laat een rechtenfout met rust: nog een keer vragen maakt dat niet beter", () => {
    assert.equal(nogNietGereed({ code: "not_allowed", message: "Unauthorized" }), false);
  });

  it("laat een onleesbare opslag met rust", () => {
    assert.equal(nogNietGereed({ code: "home_assistant_error", message: "kapot" }), false);
  });

  it("laat een lichtgroep die niet bestaat met rust", () => {
    assert.equal(nogNietGereed({ code: "not_found", message: "weg" }), false);
  });

  it("valt niet over een fout zonder code", () => {
    assert.equal(nogNietGereed(undefined), false);
    assert.equal(nogNietGereed(new Error("stuk")), false);
  });
});

describe("Herkansing — NIEUW GEDRAG", () => {
  it("probeert het opnieuw, met oplopende tussenpozen", () => {
    const k = nepKlok();
    let pogingen = 0;
    const h = new Herkansing(() => (pogingen += 1), { ...k, wachttijden: [10, 20, 30] });

    assert.equal(h.plan(), true);
    assert.equal(k.tik(), 10);
    assert.equal(pogingen, 1);

    assert.equal(h.plan(), true);
    assert.equal(k.tik(), 20);
    assert.equal(pogingen, 2);

    assert.equal(h.plan(), true);
    assert.equal(k.tik(), 30);
    assert.equal(pogingen, 3);
  });

  it("geeft false zodra de pogingen op zijn, zodat de kaart de fout mag tonen", () => {
    const k = nepKlok();
    const h = new Herkansing(() => {}, { ...k, wachttijden: [10] });
    assert.equal(h.plan(), true);
    k.tik();
    assert.equal(h.plan(), false);
  });

  it("plant er niet twee tegelijk — hass komt per seconde langs", () => {
    const k = nepKlok();
    const h = new Herkansing(() => {}, { ...k, wachttijden: [10, 20, 30] });
    h.plan();
    h.plan();
    h.plan();
    assert.equal(k.wachtrij.length, 1);
    assert.equal(h.poging, 1);
  });

  it("begint na een geslaagde poging weer bij de kortste wachttijd", () => {
    const k = nepKlok();
    const h = new Herkansing(() => {}, { ...k, wachttijden: [10, 20, 30] });
    h.plan();
    k.tik();
    h.plan();
    k.tik();
    h.herstel();
    h.plan();
    assert.equal(k.wachtrij.at(-1).ms, 10);
  });

  it("stopt de klok als de kaart van het scherm gaat", () => {
    const k = nepKlok();
    let pogingen = 0;
    const h = new Herkansing(() => (pogingen += 1), { ...k, wachttijden: [10] });
    h.plan();
    h.stop();
    assert.equal(k.wachtrij[0].gestopt, true);
    assert.equal(pogingen, 0);
  });

  it("wacht bij elkaar ruim twee minuten — genoeg voor een grote installatie", () => {
    const totaal = WACHTTIJDEN.reduce((a, b) => a + b, 0);
    assert.ok(totaal >= 120000, `slechts ${totaal}ms`);
  });
});
