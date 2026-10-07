/**
 * De woorden in het uitgelichte vlak van de afvalkaart.
 *
 * Gemeld op 7 oktober 2026 met een schermafdruk van zijn telefoon: *"op mobiel
 * niet helemaal lekker als er meerdere afvaltypes zijn staat door elkaar"*.
 * "Restafval en Papier" liep dwars door "nu aan de weg" heen. In een vak van
 * 354 pixels breed (zijn telefoon) nagemeten: 49,5 pixels overlap.
 *
 * Past de naam niet naast de telling, dan verhuist die naar de regel erboven:
 * "VANDAAG · NU AAN DE WEG". Hier staat WAT er dan komt te staan; OF het past
 * meet de kaart in de browser.
 *
 * De module wordt als geheel geïmporteerd en niet per naam: dan valt tegen de
 * oude code elke test op zijn eigen reden om, en niet het hele bestand op één
 * ontbrekende export.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as A from "../../src/cards/afval-logica.js";

describe("REGRESSIEWACHT: de woorden rechts in het vlak, zoals ze al waren (nu in een functie)", () => {
  it("vandaag: nu aan de weg", () => {
    const w = A.heroWoorden(0);
    assert.equal(w.n, "nu");
    assert.equal(w.u, "aan de weg");
  });

  it("morgen: 1 dag, enkelvoud", () => {
    const w = A.heroWoorden(1);
    assert.equal(w.n, "1");
    assert.equal(w.u, "dag");
  });

  it("later: het aantal dagen", () => {
    const w = A.heroWoorden(6);
    assert.equal(w.n, "6");
    assert.equal(w.u, "dagen");
  });
});

describe("NIEUW GEDRAG: wat er bovenaan bij komt als het rechts niet past", () => {
  it("vandaag is het nieuws: nu aan de weg", () => {
    assert.equal(A.heroWoorden(0).bij, "nu aan de weg");
  });

  it("morgen en overmorgen zegt de regel zelf al", () => {
    // "MORGEN · 1 DAG" en "OVERMORGEN · OVER 2 DAGEN" zeggen twee keer
    // hetzelfde.
    assert.equal(A.heroWoorden(1).bij, "");
    assert.equal(A.heroWoorden(2).bij, "");
  });

  it("daarna: over hoeveel dagen, want er staat alleen een dag", () => {
    // Bovenaan staat dan "dinsdag" of "di 13 okt".
    assert.equal(A.heroWoorden(3).bij, "over 3 dagen");
    assert.equal(A.heroWoorden(8).bij, "over 8 dagen");
  });
});
