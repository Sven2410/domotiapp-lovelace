/**
 * Het rekenwerk van de sleeptimer — NIEUW GEDRAG.
 *
 * Gevraagd op 27 augustus 2026. Wat hier getoetst wordt is het deel waar een
 * fout stil blijft: een klok die verkeerd leest, of een veld dat een typefout
 * als een geldig getal aanneemt. Het aftellen zelf zit in Home Assistant (zie
 * `custom_components/domotiapp_lovelace/media/sleeptimer.py`) en het scherm zit
 * in `src/media/sleeptimer.js` — dat laatste is een custom element en hoort
 * daarom niet in een Node-test (valkuil 27).
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  FADE_STANDAARD,
  SNELKEUZES,
  alsKlok,
  minutenUit,
} from "../../src/media/sleeptimer-logica.js";

describe("alsKlok — NIEUW GEDRAG", () => {
  it("toont minuten en seconden zonder een uur dat nul is", () => {
    assert.equal(alsKlok(552), "9:12");
    assert.equal(alsKlok(60), "1:00");
    assert.equal(alsKlok(9), "0:09");
  });

  it("toont het uur zodra er een is, en vult de minuten dan aan", () => {
    assert.equal(alsKlok(3870), "1:04:30");
    assert.equal(alsKlok(3600), "1:00:00");
  });

  it("gaat niet onder nul", () => {
    assert.equal(alsKlok(-5), "0:00");
    assert.equal(alsKlok(0), "0:00");
  });
});

describe("minutenUit — NIEUW GEDRAG", () => {
  it("neemt een heel getal aan", () => {
    assert.equal(minutenUit("30"), 30);
    assert.equal(minutenUit("  45 "), 45);
  });

  it("weigert een typefout in plaats van er een getal van te maken", () => {
    // `parseInt` zou hier 30, 3 en 12 van maken, en dan zet je een timer die je
    // niet bedoelde zonder dat er iets te zien is.
    assert.equal(minutenUit("30 minuten"), null);
    assert.equal(minutenUit("3.9"), null);
    assert.equal(minutenUit("12u"), null);
    assert.equal(minutenUit(""), null);
    assert.equal(minutenUit(null), null);
  });

  it("weigert wat buiten de grenzen valt", () => {
    assert.equal(minutenUit("0"), null);
    assert.equal(minutenUit("721"), null);
    assert.equal(minutenUit("720"), 720);
    assert.equal(minutenUit("1"), 1);
  });

  it("kan andere grenzen krijgen, want het fadeveld mag wél nul zijn", () => {
    assert.equal(minutenUit("0", { min: 0, max: 600 }), 0);
    assert.equal(minutenUit("601", { min: 0, max: 600 }), null);
  });
});

describe("de standaardwaarden — REGRESSIEWACHT", () => {
  it("de snelkeuzes lopen op en passen binnen de grenzen van de server", () => {
    assert.deepEqual(SNELKEUZES, [...SNELKEUZES].sort((a, b) => a - b));
    for (const m of SNELKEUZES) assert.notEqual(minutenUit(String(m)), null);
  });

  it("faden duurt standaard een halve minuut", () => {
    assert.equal(FADE_STANDAARD, 30);
  });
});
