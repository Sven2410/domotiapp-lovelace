/**
 * Een stand kiezen vanaf de regel zelf.
 *
 * NIEUW GEDRAG: `src/cards/keuzeveld.js` bestond niet vóór deze ronde. Een
 * `input_select` op de entiteitenkaart toonde alleen zijn huidige stand; wie een
 * andere wilde moest langs het venster van Home Assistant. Dit is hetzelfde
 * principe als het tijdveld uit 0.9.0, voor alles met een lijst standen.
 *
 * Wat hier getoetst wordt is wat op een dashboard stilletjes fout gaat:
 *
 * - Twee domeinen met dezelfde vorm en een ANDERE service.
 *   `input_select.select_option` op een `select`-entiteit doet niets, zonder
 *   fout op de kaart.
 * - Een entiteit zonder opties. Dat gebeurt echt: `unavailable` verliest zijn
 *   attributen. Daar hoort geen lege uitklapper te staan die nergens heen gaat.
 * - Een toestand die niet in de lijst voorkomt -- vlak nadat iemand de opties
 *   van een helper heeft aangepast. Dan is "niets geselecteerd" eerlijker dan de
 *   eerste optie tonen alsof die gekozen is.
 * - Een keuze die de entiteit niet kent hoort niet verstuurd te worden.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  KEUZE_DOMEINEN,
  huidigeKeuze,
  kanKiezen,
  keuzes,
  kiesOproep,
} from "../../src/cards/keuzeveld.js";

const S = (entity_id, state, attributes = {}) => ({ entity_id, state, attributes });

const DRIE = ["Thuis", "Weg", "Nacht"];

describe("welke entiteit een keuzelijst krijgt", () => {
  it("kent de twee domeinen met een lijst standen", () => {
    assert.equal(kanKiezen("input_select.modus"), true);
    assert.equal(kanKiezen("select.wasprogramma"), true);
    assert.equal(KEUZE_DOMEINEN.size, 2);
  });

  it("laat de rest met rust", () => {
    for (const id of ["light.spots", "sensor.modus", "input_text.notitie", "", undefined]) {
      assert.equal(kanKiezen(id), false);
    }
  });
});

describe("wat er in de lijst staat", () => {
  it("leest de opties uit de attributen", () => {
    assert.deepEqual(keuzes(S("input_select.modus", "Thuis", { options: DRIE })), DRIE);
    assert.deepEqual(keuzes(S("select.programma", "Eco", { options: ["Eco", "Kort"] })), [
      "Eco",
      "Kort",
    ]);
  });

  it("geeft een lege lijst als de entiteit er geen meldt", () => {
    // Een unavailable entiteit verliest zijn attributen. Dat is het geval waar
    // de kaart doorheen moet kijken.
    assert.deepEqual(keuzes(S("input_select.modus", "unavailable", {})), []);
    assert.deepEqual(keuzes(S("input_select.modus", "Thuis", { options: "geen lijst" })), []);
    assert.deepEqual(keuzes(null), []);
  });

  it("gooit rommel uit de lijst in plaats van het te tonen", () => {
    assert.deepEqual(keuzes(S("input_select.m", "a", { options: ["a", "", null, 3, "b"] })), [
      "a",
      "b",
    ]);
  });

  it("geeft niets terug voor een entiteit die geen lijst hoort te hebben", () => {
    assert.deepEqual(keuzes(S("light.spots", "on", { options: DRIE })), []);
  });
});

describe("wat er nu gekozen staat", () => {
  it("is de toestand, als die in de lijst staat", () => {
    assert.equal(huidigeKeuze(S("input_select.modus", "Weg", { options: DRIE })), "Weg");
  });

  it("is leeg bij unknown en unavailable", () => {
    for (const s of ["unknown", "unavailable", ""]) {
      assert.equal(huidigeKeuze(S("input_select.modus", s, { options: DRIE })), "");
    }
  });

  it("is leeg als de toestand niet meer in de lijst voorkomt", () => {
    // Dit is de toestand vlak nadat iemand de opties van de helper heeft
    // aangepast. De eerste optie tonen zou een keuze verzinnen.
    assert.equal(huidigeKeuze(S("input_select.modus", "Vakantie", { options: DRIE })), "");
  });
});

describe("de service-aanroep", () => {
  it("gebruikt het domein van de entiteit, niet dat van de helper", () => {
    assert.deepEqual(kiesOproep("input_select.modus", "Weg", DRIE), [
      "input_select",
      "select_option",
      { entity_id: "input_select.modus", option: "Weg" },
    ]);
    assert.deepEqual(kiesOproep("select.programma", "Eco", ["Eco"]), [
      "select",
      "select_option",
      { entity_id: "select.programma", option: "Eco" },
    ]);
  });

  it("stuurt niets bij een lege keuze", () => {
    for (const leeg of ["", null, undefined]) {
      assert.equal(kiesOproep("input_select.modus", leeg, DRIE), null);
    }
  });

  it("stuurt niets bij een keuze die de entiteit niet kent", () => {
    assert.equal(kiesOproep("input_select.modus", "Vakantie", DRIE), null);
  });

  it("vertrouwt de aanroeper als er geen lijst wordt meegegeven", () => {
    // Zonder lijst valt er niets te toetsen; dan is weigeren erger dan sturen.
    assert.deepEqual(kiesOproep("input_select.modus", "Weg"), [
      "input_select",
      "select_option",
      { entity_id: "input_select.modus", option: "Weg" },
    ]);
  });

  it("stuurt niets voor een domein zonder keuzelijst", () => {
    assert.equal(kiesOproep("light.spots", "Weg", DRIE), null);
  });
});
