/**
 * Een badge meldt zich in een ANDER register dan een kaart.
 *
 * NIEUW GEDRAG (17 september 2026). `meldBadgeInKiezer` bestond niet vóór deze
 * ronde; op de code van ervoor faalt dit bestand op de import.
 *
 * Waarom dit een test verdient en niet alleen een meting in de browser: het
 * verschil tussen `window.customCards` en `window.customBadges` is één letter en
 * levert geen enkele fout op als je het verkeerd hebt. Een badge die in
 * `customCards` belandt verschijnt netjes in de KAARTkiezer, is daar niet te
 * gebruiken, en ontbreekt in de badgekiezer -- zonder dat er ergens iets
 * roods staat. Gemeten tegen HA 2026.8.1: `window.customBadges` bestaat daar al
 * als lege array, dus een verkeerd register valt ook niet op doordat er iets
 * ontbreekt.
 *
 * Wat hier NIET getoetst wordt: dat Home Assistant de badge daadwerkelijk
 * tekent. Dat is in een echte browser gemeten -- zie het rapport van deze ronde.
 */

import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import { meldBadgeInKiezer } from "../../src/registratie.js";

describe("meldBadgeInKiezer", () => {
  beforeEach(() => {
    globalThis.window = { customCards: [], customBadges: [] };
  });

  it("zet de badge in customBadges en NIET in customCards", () => {
    meldBadgeInKiezer({ type: "domotiapp-test-badge", name: "Test", description: "x" });

    assert.equal(window.customBadges.length, 1);
    assert.equal(window.customBadges[0].type, "domotiapp-test-badge");
    assert.equal(window.customCards.length, 0, "een badge hoort niet in de kaartkiezer");
  });

  it("maakt de lijst aan als Home Assistant hem nog niet heeft", () => {
    globalThis.window = {};
    meldBadgeInKiezer({ type: "a", name: "A" });
    assert.equal(window.customBadges.length, 1);
  });

  it("meldt zich niet twee keer aan", () => {
    // HACS en een handmatige resource die naar hetzelfde bestand wijzen: dat
    // gebeurt een keer, en het mag geen dubbele regel in de kiezer opleveren.
    meldBadgeInKiezer({ type: "a", name: "A" });
    meldBadgeInKiezer({ type: "a", name: "A opnieuw" });

    assert.equal(window.customBadges.length, 1);
    assert.equal(window.customBadges[0].name, "A", "de eerste blijft staan");
  });

  it("laat een badge van iemand anders met rust", () => {
    window.customBadges.push({ type: "custom:mushroom-template-badge", name: "Mushroom" });
    meldBadgeInKiezer({ type: "domotiapp-template-badge", name: "DomotiApp Badge" });

    assert.deepEqual(
      window.customBadges.map((b) => b.type),
      ["custom:mushroom-template-badge", "domotiapp-template-badge"],
    );
  });

  it("vult de velden die de kiezer laat zien", () => {
    meldBadgeInKiezer({ type: "a", name: "A", description: "Uitleg" });
    const badge = window.customBadges[0];

    assert.equal(badge.name, "A");
    assert.equal(badge.description, "Uitleg");
    assert.equal(badge.preview, true, "zonder voorbeeld is de kiezer een lijst namen");
    assert.match(badge.documentationURL, /github\.com/);
  });
});
