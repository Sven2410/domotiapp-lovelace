/**
 * De lichtsterkte als moment (0.103.0). De eigenaar, 3 november 2026: "ik wil dat de klant ook lichtsterkte kan gebruiken als
 * voorwaarde ipv zonsondergang bijvoorbeeld", en: "hij moet dan vragen waarvan je de lichtsterkte wilt pakken".
 *
 * NIEUW GEDRAG, behalve wat met REGRESSIEWACHT begint.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as L from "../../src/cards/automatisering-logica.js";

const LUX = "sensor.weerstation_lichtsterkte";
const donker = (lux = 100) => ({ soort: "licht", sensor: LUX, lux, richting: "donker" });
const licht = (lux = 200) => ({ soort: "licht", sensor: LUX, lux, richting: "licht" });

describe("een moment op de lichtsterkte", () => {
  it("metSoort maakt er een met de sensor van de kaart, en zonder sensor niets", () => {
    assert.deepEqual(L.metSoort("licht", { sensor: LUX, richting: "licht" }), { soort: "licht", sensor: LUX, lux: L.LUX_STANDAARD, richting: "licht" });
    assert.equal(L.metSoort("licht", {}), null);
  });

  it("REGRESSIEWACHT: metSoort voor tijd, zon en geen blijft wat het was", () => {
    assert.deepEqual(L.metSoort("tijd"), { soort: "tijd", tijd: "18:00" });
    assert.deepEqual(L.metSoort("zonsopkomst"), { soort: "zonsopkomst", verschil: 0 });
    assert.equal(L.metSoort("geen"), null);
  });

  it("een lamp gaat aan als het donker wordt, een rolluik open als het licht wordt; uit andersom", () => {
    assert.equal(L.standaardRichting("aan", ["light.a"]), "donker");
    assert.equal(L.standaardRichting("uit", ["light.a"]), "licht");
    assert.equal(L.standaardRichting("aan", ["cover.a"]), "licht");
    assert.equal(L.standaardRichting("uit", ["cover.a"]), "donker");
  });

  it("de stapper loopt over vaste stappen, ook vanaf een waarde ertussen, en blijft binnen de grens", () => {
    assert.equal(L.stapLux(100, 1), 200);
    assert.equal(L.stapLux(100, -1), 50);
    assert.equal(L.stapLux(150, 1), 200);
    assert.equal(L.stapLux(150, -1), 100);
    assert.equal(L.stapLux(1, -1), 1);
    assert.equal(L.stapLux(50000, 1), 50000);
  });
});

describe("de tekst", () => {
  it("zegt wanneer, met de grens", () => {
    assert.equal(L.momentTekst(donker(100)), "als het donker wordt (onder 100 lx)");
    assert.equal(L.momentTekst(licht(2000)), "als het licht wordt (boven 2.000 lx)");
  });

  it("in een regel en een onderdeel", () => {
    const regel = { lampen: ["light.a"], aan: donker(), uit: { soort: "tijd", tijd: "23:00" }, dagen: [0, 1, 2, 3, 4, 5, 6] };
    assert.equal(L.regelTekst(regel), "Aan als het donker wordt (onder 100 lx) · uit om 23:00 · Elke dag");
    assert.equal(L.deelTekst({ lampen: ["cover.a"], aan: licht(), uit: donker(20) }), "Open als het licht wordt (boven 200 lx) · dicht als het donker wordt (onder 20 lx)");
  });

  it("met onderdelen staan de momenten op het licht achter de tijden", () => {
    const regel = {
      dagen: [0, 1, 2, 3, 4, 5, 6],
      delen: [
        { lampen: ["cover.a"], aan: licht(), uit: null },
        { lampen: ["cover.b"], aan: { soort: "tijd", tijd: "09:30" }, uit: null },
      ],
    };
    assert.equal(L.regelTekst(regel), "Open om 09:30 en als het licht wordt (boven 200 lx) · Elke dag");
  });

  it("deelVolgorde zet licht 's ochtends en donker 's avonds", () => {
    assert.equal(L.deelVolgorde({ aan: licht() }), 480);
    assert.equal(L.deelVolgorde({ aan: donker() }), 1080);
  });
});

describe("naar de server", () => {
  it("het moment gaat ongewijzigd mee, en het kan opgeslagen worden", () => {
    const regel = { lampen: ["light.a"], aan: donker(50), uit: null, dagen: [0], vakantie: false };
    assert.equal(L.waaromNiet(regel), null);
    assert.deepEqual(L.naarServer(regel).aan, donker(50));
  });
});
