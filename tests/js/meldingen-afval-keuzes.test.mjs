/**
 * Afval per persoon op de meldingenkaart (0.87.0). **NIEUW GEDRAG**.
 *
 * Gevraagd op 25 oktober 2026, na hetzelfde voor de robotstofzuiger: *"ja doe
 * dat ook voor afval"*. Wanneer (de avond ervoor, de ochtend zelf) en welke
 * bakken. Met `import *`, zodat dit bestand ook tegen de code van vóór deze
 * ronde laadt en daar faalt op wat er gebeurt.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import * as logica from "../../src/cards/meldingen-logica.js";

const fn = (naam) => {
  assert.equal(typeof logica[naam], "function", `${naam} bestaat niet`);
  return logica[naam];
};

const KAART = { afval: true, afval_morgen: "sensor.afval_morgen", afval_vandaag: "sensor.afval_vandaag" };
const ANNA = "person.anna";
const NU = new Date(2026, 9, 25, 12, 0);

describe("afvalKeuze()", () => {
  it("niets gekozen: allebei de momenten en alle bakken", () => {
    assert.deepEqual(fn("afvalKeuze")(KAART, { keuzes: {} }, ANNA), { momenten: ["morgen", "vandaag"], bakkenNiet: [] });
  });

  it("alleen de momenten met een sensor", () => {
    assert.deepEqual(fn("afvalMomenten")({ afval_morgen: "sensor.x" }), ["morgen"]);
  });

  it("een keuze blijft binnen de kaart", () => {
    const stand = { keuzes: { [ANNA]: { momenten: ["vandaag", "onzin"], bakken_niet: ["Papier"] } } };
    assert.deepEqual(fn("afvalKeuze")(KAART, stand, ANNA), { momenten: ["vandaag"], bakkenNiet: ["Papier"] });
  });
});

describe("afvalBakken()", () => {
  it("eerst de editor, dan wat de server zag, zonder dubbelen", () => {
    assert.deepEqual(
      fn("afvalBakken")({ afval_bakken: ["papier", "PMD"] }, { bakken: ["Papier", "GFT"] }),
      ["Papier", "PMD", "GFT"]
    );
    assert.deepEqual(fn("afvalBakken")({}, undefined), []);
  });
});

describe("nieuwNiet()", () => {
  it("een bak uit en weer aan; alles aan is null", () => {
    assert.deepEqual(fn("nieuwNiet")([], "Papier", false), ["Papier"]);
    assert.deepEqual(fn("nieuwNiet")(["Papier", "GFT"], "papier", true), ["GFT"]);
    assert.equal(fn("nieuwNiet")(["Papier"], "Papier", true), null);
  });
});

describe("afvalRegel() per persoon", () => {
  const stand = (keuze) => ({ bekend: true, keuzes: { [ANNA]: keuze } });

  it("geen 'melding om' voor wie de avond ervoor niets krijgt", () => {
    const algemeen = fn("afvalRegel")({ config: KAART, stand: stand({}), morgen: "GFT", persoon: ANNA, nu: NU });
    assert.equal(algemeen, "Morgen GFT · melding om 19:30");
    assert.equal(
      fn("afvalRegel")({ config: KAART, stand: stand({ momenten: ["vandaag"] }), morgen: "GFT", persoon: ANNA, nu: NU }),
      "Morgen GFT"
    );
    assert.equal(
      fn("afvalRegel")({ config: KAART, stand: stand({ bakken_niet: ["gft"] }), morgen: "GFT", persoon: ANNA, nu: NU }),
      "Morgen GFT"
    );
  });

  it("alleen de gekozen momenten in de uitleg", () => {
    assert.equal(
      fn("afvalRegel")({ config: KAART, stand: stand({ momenten: ["vandaag"] }), persoon: ANNA, nu: NU }),
      "De ochtend zelf om 07:30"
    );
    assert.equal(
      fn("afvalRegel")({ config: KAART, stand: stand({ momenten: [] }), persoon: ANNA, nu: NU }),
      "Niets gekozen om te melden"
    );
  });

  it("REGRESSIEWACHT: zonder persoon zoals het was", () => {
    assert.equal(
      fn("afvalRegel")({ config: KAART, stand: { bekend: true }, nu: NU }),
      "De avond ervoor om 19:30 en de ochtend zelf om 07:30"
    );
  });
});
