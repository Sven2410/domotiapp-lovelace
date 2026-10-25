/**
 * De robotstofzuiger op de meldingenkaart (0.85.0). **NIEUW GEDRAG**, op
 * twee REGRESSIEWACHTEN na (gelabeld): die slagen ook op de oude code.
 *
 * Gevraagd op 25 oktober 2026: *"we hebben nu afvalmeldingen. Ik wil ook
 * meldingen van de robotstofzuiger kunnen instellen."* Het versturen doet de
 * server (meldingen/stofzuiger.py, met eigen toetsen); hier staat wat de kaart
 * zegt. Met `import *`, zodat dit bestand ook tegen de code van vóór deze ronde
 * laadt en daar faalt op wat er gebeurt.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import * as logica from "../../src/cards/meldingen-logica.js";

const fn = (naam) => {
  assert.equal(typeof logica[naam], "function", `${naam} bestaat niet`);
  return logica[naam];
};

const KAART = { afval: false, stofzuiger: true, stofzuigers: ["vacuum.dreame_boven"] };

describe("de soort robotstofzuiger", () => {
  it("staat aan met zijn schakelaar, met naam en icoon", () => {
    assert.deepEqual(
      fn("soortenVan")(KAART).map((s) => [s.id, s.naam, s.icoon]),
      [["stofzuiger", "Robotstofzuiger", "stofzuiger"]]
    );
    assert.deepEqual(fn("soortenVan")({ ...KAART, afval: true }).map((s) => s.id), ["afval", "stofzuiger"]);
  });

  it("REGRESSIEWACHT: een oude afvalkaart krijgt er geen stofzuiger bij", () => {
    assert.deepEqual(fn("soortenVan")({ soort: "afval" }).map((s) => s.id), ["afval"]);
  });

  it("REGRESSIEWACHT: heeft het id dat de server gebruikt", () => {
    // `stofzuiger_uit` in kaarten.py: altijd "stofzuiger", ook met een eigen id.
    assert.equal(fn("meldingId")({ id: "huis" }, "stofzuiger"), "stofzuiger");
  });
});

describe("stofzuigerGebeurtenissen()", () => {
  it("zonder keuze alles, in de volgorde van de server", () => {
    assert.deepEqual(fn("stofzuigerGebeurtenissen")(KAART), ["klaar", "storing", "station", "onderhoud"]);
  });

  it("met een keuze alleen die, in de vaste volgorde", () => {
    assert.deepEqual(
      fn("stofzuigerGebeurtenissen")({ stofzuiger_meldingen: ["onderhoud", "klaar", "onzin"] }),
      ["klaar", "onderhoud"]
    );
  });
});

describe("stofzuigerRegel()", () => {
  it("wat er gemeld wordt, en van welke robots", () => {
    assert.equal(
      fn("stofzuigerRegel")({ config: KAART, stand: { bekend: true }, namen: ["X50 Ultra Complete", "dreame boven"] }),
      "Klaar, storing, tanks en onderhoud · X50 Ultra Complete en dreame boven"
    );
  });

  it("zegt wat er ontbreekt", () => {
    assert.equal(fn("stofzuigerRegel")({ config: { stofzuiger: true }, stand: { bekend: true } }), "Nog geen stofzuiger gekozen");
    assert.equal(
      fn("stofzuigerRegel")({ config: KAART, stand: { bekend: false } }),
      "Actief zodra het dashboard is opgeslagen"
    );
  });

  it("met één keuze geen opsomming", () => {
    assert.equal(
      fn("stofzuigerRegel")({ config: { ...KAART, stofzuiger_meldingen: ["storing"] }, namen: ["dreame boven"] }),
      "Storing · dreame boven"
    );
  });
});

describe("stofzuigersUit()", () => {
  it("alleen vacuum.*, zonder dubbelen", () => {
    assert.deepEqual(
      fn("stofzuigersUit")({ stofzuigers: ["vacuum.a", "sensor.b", "vacuum.a", "vacuum.c"] }),
      ["vacuum.a", "vacuum.c"]
    );
    assert.deepEqual(fn("stofzuigersUit")({ stofzuigers: "vacuum.a" }), ["vacuum.a"]);
    assert.deepEqual(fn("stofzuigersUit")({}), []);
  });
});
