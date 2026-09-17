/**
 * De afvalkalender van het infoscherm.
 *
 * NIEUW GEDRAG (17 september 2026). `src/cards/infoscherm-afval.js` bestond
 * niet vóór deze ronde; op de code van ervoor faalt dit bestand met
 * ERR_MODULE_NOT_FOUND.
 *
 * ## Waarom dit stuk een test verdient
 *
 * Twee dingen gaan hier stil fout. **Waar de datum staat** verschilt per
 * integratie -- in de toestand, of in een van drie attributen -- en een bak die
 * daardoor "geen datum" krijgt verdwijnt zonder een woord. En **de sortering**:
 * wat al geweest is hoort achteraan, niet vooraan, en een bak die nergens op
 * staat hoort niet stil te verdwijnen maar met een reden te blijven staan.
 *
 * Een lege plek in een rij van vier bakken leest in een wachtruimte als kapot.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { afvalKomend, afvalLijst, afvalWanneer } from "../../src/cards/infoscherm-afval.js";

const NU = new Date(2026, 8, 17, 14, 0); // donderdag 17 september 2026

/** Een nagebootste `hass.states`. */
const lezer = (staten) => (id) => staten[id];
const namen = (kaart) => (id) => kaart[id] ?? id;

describe("afvalLijst", () => {
  const staten = {
    "sensor.afval_gft": { state: "2026-09-18", attributes: {} },
    "sensor.afval_rest": { state: "2026-09-25", attributes: {} },
    "sensor.afval_papier": { state: "2026-09-01", attributes: {} },
  };
  const kaart = {
    "sensor.afval_gft": "Afval GFT",
    "sensor.afval_rest": "Afval Restafval",
    "sensor.afval_papier": "Afval Papier",
  };
  const lijst = afvalLijst(Object.keys(staten), lezer(staten), namen(kaart), NU);

  it("zet wat er nog komt vooraan, op datum", () => {
    assert.deepEqual(lijst.map((r) => r.naam), ["GFT", "Restafval", "Papier"]);
    assert.equal(lijst[0].dagen, 1);
    assert.equal(lijst[1].dagen, 8);
  });

  it("kort de namen in op wat ze DELEN", () => {
    // "Afval " staat voor alle drie en is dus geen informatie. Zonder dit
    // leest een rij van vier bakken als vier keer hetzelfde woord.
    assert.ok(lijst.every((r) => !r.naam.startsWith("Afval")));
  });

  it("laat wat voorbij is staan, met een reden, achteraan", () => {
    const papier = lijst[2];
    assert.equal(papier.reden, "voorbij");
    assert.ok(papier.dagen < 0);
  });

  it("noemt een sensor die niet bestaat in plaats van hem weg te laten", () => {
    const l = afvalLijst(["sensor.weg"], lezer({}), namen({}), NU);
    assert.equal(l.length, 1);
    assert.equal(l[0].reden, "bestaat niet");
  });

  it("leest de datum ook uit de attributen", () => {
    // Afvalbeheer (Circulus en zo'n dertig gemeenten) zet hem in
    // `Year_month_day_date`; andere integraties in `date` of `next_date`.
    const varianten = {
      "sensor.a": { state: "Woensdag", attributes: { Year_month_day_date: "2026-09-23" } },
      "sensor.b": { state: "onbekend", attributes: { date: "2026-09-24" } },
      "sensor.c": { state: "x", attributes: { next_date: "2026-09-25" } },
    };
    const l = afvalLijst(Object.keys(varianten), lezer(varianten), namen({}), NU);
    assert.equal(l.filter((r) => !r.reden).length, 3);
    assert.deepEqual(l.map((r) => r.dagen), [6, 7, 8]);
  });

  it("leest de Nederlandse datumvorm met een woord ervoor", () => {
    // "Vandaag, 07-09-2026" -- dat is valkuil 40: new Date() leest dat
    // Amerikaans. parseDate in ha.js vangt dat af, en dat moet hier ook gelden.
    const v = { "sensor.a": { state: "Woensdag, 23-09-2026", attributes: {} } };
    const l = afvalLijst(["sensor.a"], lezer(v), namen({}), NU);
    assert.equal(l[0].reden, null);
    assert.equal(l[0].dagen, 6);
  });

  it("zegt geen datum als er niets bruikbaars staat", () => {
    const v = { "sensor.a": { state: "Geen ophaaldag bekend", attributes: {} } };
    const l = afvalLijst(["sensor.a"], lezer(v), namen({}), NU);
    assert.equal(l[0].reden, "geen datum");
  });

  it("rekent vanaf MIDDERNACHT en niet vanaf dit moment", () => {
    // Anders is een bak die vanochtend om 07:00 opgehaald is "gisteren", en
    // staat een ophaaldag van vandaag om 14:00 op nul komma iets dagen.
    const v = { "sensor.a": { state: "2026-09-17", attributes: {} } };
    const l = afvalLijst(["sensor.a"], lezer(v), namen({}), NU);
    assert.equal(l[0].dagen, 0);
    assert.equal(l[0].reden, null, "vandaag is niet voorbij");
  });

  it("valt niet om op een lege lijst", () => {
    assert.deepEqual(afvalLijst([], lezer({}), namen({}), NU), []);
    assert.deepEqual(afvalLijst(null, lezer({}), namen({}), NU), []);
  });
});

describe("afvalKomend", () => {
  it("houdt alleen over wat er nog aankomt", () => {
    const lijst = [
      { naam: "GFT", reden: null },
      { naam: "Papier", reden: "voorbij" },
      { naam: "Rest", reden: null },
    ];
    assert.deepEqual(afvalKomend(lijst).map((r) => r.naam), ["GFT", "Rest"]);
  });

  it("valt niet om op niets", () => {
    assert.deepEqual(afvalKomend(null), []);
  });
});

describe("afvalWanneer", () => {
  it("zegt vandaag en morgen", () => {
    assert.match(afvalWanneer({ datum: new Date(2026, 8, 17), dagen: 0, reden: null }, NU), /andaag/);
    assert.match(afvalWanneer({ datum: new Date(2026, 8, 18), dagen: 1, reden: null }, NU), /orgen/);
  });

  it("zegt niets over een bak die er niet is", () => {
    assert.equal(afvalWanneer({ reden: "voorbij" }, NU), "");
    assert.equal(afvalWanneer(null, NU), "");
  });
});
