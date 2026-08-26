/**
 * De herkansing die "Unknown command." opvangt.
 *
 * NIEUW GEDRAG. Zie de kop van `src/herkansing.js` voor de meting in een echte
 * instance: `unknown_command` is niet stuk, het is te vroeg.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  Herkansing,
  TRAGE_WACHTTIJD,
  Verbindingswacht,
  WACHTTIJDEN,
  nogNietGereed,
} from "../../src/herkansing.js";

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

  it("geeft false zodra de wachttijden op zijn, zodat de kaart de fout mag tonen", () => {
    const k = nepKlok();
    const h = new Herkansing(() => {}, { ...k, wachttijden: [10], traag: 999 });
    assert.equal(h.plan(), true);
    k.tik();
    assert.equal(h.plan(), false);
  });

  it("BLIJFT daarna doorvragen op de trage wachttijd — opgeven bestaat niet", () => {
    const k = nepKlok();
    let pogingen = 0;
    const h = new Herkansing(() => (pogingen += 1), { ...k, wachttijden: [10], traag: 999 });

    h.plan();
    assert.equal(k.tik(), 10);

    // Tien keer verder: elke keer wordt er opnieuw gepland, op de trage tijd.
    for (let i = 0; i < 10; i += 1) {
      assert.equal(h.plan(), false, "de kaart hoort de fout te tonen");
      assert.equal(k.tik(), 999, "maar er hoort wél een volgende poging te staan");
    }
    assert.equal(pogingen, 11);
  });

  it("herstelt zich ook nog uit de trage staart", () => {
    const k = nepKlok();
    const h = new Herkansing(() => {}, { ...k, wachttijden: [10], traag: 999 });
    h.plan();
    k.tik();
    h.plan();
    k.tik();
    // Het antwoord komt alsnog: terug naar de korte wachttijd.
    h.herstel();
    assert.equal(h.plan(), true);
    assert.equal(k.wachtrij.at(-1).ms, 10);
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

  it("laat de kaart ruim een minuut laden voordat hij een fout toont", () => {
    const totaal = WACHTTIJDEN.reduce((a, b) => a + b, 0);
    assert.ok(totaal >= 60000, `slechts ${totaal}ms`);
    // En niet veel langer: minutenlang naar een laadanimatie kijken terwijl er
    // iets echt mis is, is geen eerlijk scherm.
    assert.ok(totaal <= 90000, `${totaal}ms is te lang om te blijven laden`);
  });

  it("de trage wachttijd is er, en is niet zo kort dat het pollen wordt", () => {
    assert.ok(TRAGE_WACHTTIJD >= 30000, `${TRAGE_WACHTTIJD}ms vraagt te vaak`);
  });
});

describe("Verbindingswacht — NIEUW GEDRAG", () => {
  it("meldt niets bij de eerste ronde: dat is geen herverbinding", () => {
    const v = new Verbindingswacht();
    assert.equal(v.herverbonden({ connected: true }), false);
  });

  it("meldt de herverbinding precies één keer", () => {
    const v = new Verbindingswacht();
    v.herverbonden({ connected: true });
    assert.equal(v.herverbonden({ connected: false }), false, "weg is geen herverbinding");
    assert.equal(v.herverbonden({ connected: true }), true, "en nu is hij terug");
    assert.equal(v.herverbonden({ connected: true }), false, "maar niet nog een keer");
  });

  it("merkt een tweede herstart net zo goed op", () => {
    const v = new Verbindingswacht();
    v.herverbonden({ connected: false });
    assert.equal(v.herverbonden({ connected: true }), true);
    v.herverbonden({ connected: false });
    assert.equal(v.herverbonden({ connected: true }), true);
  });

  it("houdt een hass zonder `connected` voor verbonden — de werkbank en oudere frontends", () => {
    const v = new Verbindingswacht();
    assert.equal(v.herverbonden({}), false);
    assert.equal(v.herverbonden({}), false);
    assert.equal(v.herverbonden(undefined), false);
  });
});
