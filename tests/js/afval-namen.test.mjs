/**
 * De namen op de afvalkaart korter maken — NIEUW GEDRAG.
 *
 * Gemeld op 27 augustus 2026 met twee schermafdrukken naast elkaar: bij één van
 * zijn klanten stond er "Circulus Circulus Restafval" waar bij hemzelf gewoon
 * "Restafval" staat.
 *
 * Home Assistant stelt de weergavenaam samen uit de naam van het APPARAAT en die
 * van de entiteit. Heet het apparaat "Circulus" en de entiteit "Circulus
 * Restafval", dan wordt dat "Circulus Circulus Restafval".
 *
 * De oude oplossing was een lijstje bekende integraties wegknippen
 * (`afvalbeheer|afvalwijzer|mijnafvalwijzer`). Dat werkt tot de volgende
 * gemeente, en dan staat het er weer.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { gedeeldBegin, korteNamen, zonderHerhaling } from "../../src/cards/afval-namen.js";

describe("zonderHerhaling — NIEUW GEDRAG", () => {
  it("haalt een woord weg dat direct achter zichzelf staat", () => {
    assert.equal(zonderHerhaling("Circulus Circulus Restafval"), "Circulus Restafval");
  });

  it("trekt zich niets aan van hoofdletters", () => {
    assert.equal(zonderHerhaling("Circulus circulus PMD"), "Circulus PMD");
  });

  it("laat een naam zonder herhaling met rust", () => {
    assert.equal(zonderHerhaling("Restafval"), "Restafval");
    assert.equal(zonderHerhaling("Papier en karton"), "Papier en karton");
  });

  it("valt niet over niets", () => {
    assert.equal(zonderHerhaling(""), "");
    assert.equal(zonderHerhaling(null), "");
  });
});

describe("gedeeldBegin — NIEUW GEDRAG", () => {
  it("telt de woorden die alle namen delen", () => {
    assert.equal(gedeeldBegin(["Circulus Restafval", "Circulus PMD", "Circulus GFT"]), 1);
  });

  it("nul als ze niets delen", () => {
    assert.equal(gedeeldBegin(["Restafval", "GFT", "Papier", "PMD"]), 0);
  });

  it("laat altijd minstens één woord staan", () => {
    // Anders verdwijnt de naam van een bak die net zo heet als het voorvoegsel.
    assert.equal(gedeeldBegin(["Restafval", "Restafval"]), 0);
    assert.equal(gedeeldBegin(["Circulus Rest", "Circulus Rest"]), 1);
  });

  it("met één naam valt er niets te vergelijken", () => {
    assert.equal(gedeeldBegin(["Circulus Restafval"]), 0);
    assert.equal(gedeeldBegin([]), 0);
  });
});

describe("korteNamen — de twee klanten naast elkaar — NIEUW GEDRAG", () => {
  it("Circulus: de dubbele gemeentenaam gaat eraf", () => {
    // Dit is letterlijk wat er bij zijn klant op de kaart stond.
    const uit = korteNamen([
      "Circulus Circulus Restafval",
      "Circulus Circulus PMD",
      "Circulus Circulus Papier",
      "Circulus Circulus GFT",
    ]);
    assert.deepEqual(uit, ["Restafval", "PMD", "Papier", "GFT"]);
  });

  it("Mijnafvalwijzer: er verandert niets", () => {
    // Bij hemzelf stond het al goed, en dat moet zo blijven.
    const namen = ["Restafval", "GFT", "Papier", "PMD"];
    assert.deepEqual(korteNamen(namen), namen);
  });

  it("een enkel gedeeld woord gaat er ook af", () => {
    assert.deepEqual(
      korteNamen(["Gemeente Restafval", "Gemeente GFT"]),
      ["Restafval", "GFT"]
    );
  });

  it("laat de laatste naam nooit leeg worden", () => {
    // Twee bakken die precies hetzelfde heten: dan blijft er staan wat er stond.
    assert.deepEqual(korteNamen(["Restafval", "Restafval"]), ["Restafval", "Restafval"]);
  });

  it("met één sensor blijft alleen het opruimen van een herhaling over", () => {
    assert.deepEqual(korteNamen(["Circulus Circulus Restafval"]), ["Circulus Restafval"]);
    assert.deepEqual(korteNamen(["Restafval"]), ["Restafval"]);
  });

  it("raakt namen met meer woorden niet kwijt", () => {
    assert.deepEqual(
      korteNamen(["Circulus Papier en karton", "Circulus Groente fruit en tuinafval"]),
      ["Papier en karton", "Groente fruit en tuinafval"]
    );
  });
});
