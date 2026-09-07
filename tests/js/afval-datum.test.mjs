/**
 * De datum van een afvalsensor lezen, ook als er een woord voor staat.
 *
 * NIEUW GEDRAG, gemeld op 7 september 2026 met een schermafdruk van een klant:
 * op een kaart met vier bakken stond "is geweest" bij restafval en "geen datum"
 * bij GFT, terwijl de sensoren gewoon een datum als toestand hadden:
 *
 *     Circulus Restafval   "Vandaag, 07-09-2026"
 *     Circulus GFT         "Maandag, 14-09-2026"
 *
 * Bij de eigenaar zelf ging het goed: Mijnafvalwijzer geeft "18-08-2026" zonder
 * dagnaam, en dat patroon stond vooraan. Afvalbeheer (Circulus) zet er een
 * dagnaam voor, de eigen parser sloeg dan niet aan, en de terugval op
 * `new Date()` las "07-09-2026" als 9 juli en "14-09-2026" als ongeldig.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseDate } from "../../src/ha.js";

const ymd = (d) => (d ? `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}` : null);

describe("parseDate: de datum ergens in de tekst", () => {
  it("leest een kale dag-maand-jaar (REGRESSIEWACHT)", () => {
    assert.equal(ymd(parseDate("18-08-2026")), "2026-8-18");
    assert.equal(ymd(parseDate("2026-08-18")), "2026-8-18");
  });

  it("leest de Circulus-vorm met een dagnaam ervoor", () => {
    assert.equal(ymd(parseDate("Vandaag, 07-09-2026")), "2026-9-7");
    assert.equal(ymd(parseDate("Maandag, 14-09-2026")), "2026-9-14");
    assert.equal(ymd(parseDate("Morgen, 08-09-2026")), "2026-9-8");
  });

  it("leest de samenvattende sensoren, met de fractie erachter", () => {
    assert.equal(ymd(parseDate("Vandaag, 07-09-2026: Restafval")), "2026-9-7");
  });

  it("laat de Amerikaanse lezing nergens meer toe", () => {
    // 07-09 is 7 september, nooit 9 juli. Ook niet met een woord ervoor.
    assert.equal(parseDate("Vandaag, 07-09-2026").getMonth(), 8);
    assert.equal(parseDate("07-09-2026").getMonth(), 8);
  });

  it("leest een jaar-maand-dag met tijd erachter", () => {
    assert.equal(ymd(parseDate("2026-09-14T00:00:00")), "2026-9-14");
  });

  it("geeft null voor wat geen datum is", () => {
    assert.equal(parseDate("Geen"), null);
    assert.equal(parseDate("unknown"), null);
    assert.equal(parseDate(""), null);
    assert.equal(parseDate(null), null);
  });
});
