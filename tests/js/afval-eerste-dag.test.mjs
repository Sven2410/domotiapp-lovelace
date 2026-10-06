/**
 * Twee bakken op dezelfde dag lichten allebei op.
 *
 * NIEUW GEDRAG, gemeld op 6 oktober 2026 met een schermafdruk: *"nu 2
 * afvaltypes morgen aan de straat moeten en er is maar 1 gehighlight"*. Op de
 * afvalkaart stond Restafval uitgelicht en Papier eronder met "morgen 7 okt";
 * op het infoscherm gebeurde hetzelfde. `src/cards/afval-logica.js` bestond
 * niet vóór deze ronde; op de code van ervoor faalt dit bestand met
 * ERR_MODULE_NOT_FOUND.
 *
 * De gegevens hieronder zijn die van de eigenaar op die dag, uitgelezen uit
 * zijn Home Assistant (Mijnafvalwijzer, via Afvalbeheer).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { eersteOphaaldag } from "../../src/cards/afval-logica.js";
import { afvalKomend, afvalLijst } from "../../src/cards/infoscherm-afval.js";
import { opsomming } from "../../src/cards/meldingen-logica.js";

const NU = new Date(2026, 9, 6, 21, 0); // dinsdag 6 oktober 2026, 21:00

const staten = {
  "sensor.mijnafvalwijzer_restafval": { state: "07-10-2026", attributes: {} },
  "sensor.mijnafvalwijzer_gft": { state: "15-10-2026", attributes: {} },
  "sensor.mijnafvalwijzer_papier": { state: "07-10-2026", attributes: {} },
  "sensor.mijnafvalwijzer_pmd": { state: "13-10-2026", attributes: {} },
};
const namen = {
  "sensor.mijnafvalwijzer_restafval": "Afvalbeheer Mijnafvalwijzer Restafval",
  "sensor.mijnafvalwijzer_gft": "Afvalbeheer Mijnafvalwijzer GFT",
  "sensor.mijnafvalwijzer_papier": "Afvalbeheer Mijnafvalwijzer Papier",
  "sensor.mijnafvalwijzer_pmd": "Afvalbeheer Mijnafvalwijzer PMD",
};

const lijst = afvalLijst(Object.keys(staten), (id) => staten[id], (id) => namen[id], NU);
const dagen = (r) => r.dagen;

describe("eersteOphaaldag", () => {
  it("geeft beide bakken van morgen, niet alleen de eerste", () => {
    const eerst = eersteOphaaldag(afvalKomend(lijst), dagen);
    assert.deepEqual(
      eerst.map((r) => r.naam),
      ["Restafval", "Papier"],
    );
    assert.equal(opsomming(eerst.map((r) => r.naam)), "Restafval en Papier");
  });

  it("laat wat later komt in de lijst staan", () => {
    const komend = afvalKomend(lijst);
    const eerst = eersteOphaaldag(komend, dagen);
    const rest = komend.filter((r) => !eerst.includes(r));
    assert.deepEqual(rest.map((r) => r.naam), ["PMD", "GFT"]);
  });

  it("geeft één bak als hij alleen komt (REGRESSIEWACHT)", () => {
    const komend = [
      { naam: "GFT", dagen: 1 },
      { naam: "PMD", dagen: 7 },
    ];
    assert.deepEqual(eersteOphaaldag(komend, dagen).map((r) => r.naam), ["GFT"]);
  });

  it("neemt drie bakken op één dag allemaal mee", () => {
    const komend = [
      { naam: "GFT", dagen: 0 },
      { naam: "PMD", dagen: 0 },
      { naam: "Papier", dagen: 0 },
      { naam: "Restafval", dagen: 3 },
    ];
    assert.deepEqual(eersteOphaaldag(komend, dagen).map((r) => r.naam), ["GFT", "PMD", "Papier"]);
  });

  it("geeft een lege lijst als er niets komt", () => {
    assert.deepEqual(eersteOphaaldag([], dagen), []);
    assert.deepEqual(eersteOphaaldag(undefined, dagen), []);
  });

  it("werkt ook met de sleutel van de afvalkaart (days)", () => {
    const komend = [
      { label: "Restafval", days: 1 },
      { label: "Papier", days: 1 },
      { label: "PMD", days: 7 },
    ];
    assert.deepEqual(
      eersteOphaaldag(komend, (i) => i.days).map((i) => i.label),
      ["Restafval", "Papier"],
    );
  });
});
