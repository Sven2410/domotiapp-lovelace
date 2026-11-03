/**
 * Een regel met onderdelen, elk met eigen lampen en tijden (0.102.0). De eigenaar, 3 november 2026: "ik wil dat dat kan
 * in 1 regel dus eigenlijk een automatisering net als in HA".
 *
 * NIEUW GEDRAG, behalve wat met REGRESSIEWACHT begint.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as L from "../../src/cards/automatisering-logica.js";

const om = (tijd) => ({ soort: "tijd", tijd });
const KL = "cover.keuken_links";
const KV = "cover.keuken_voor";
const WL = "cover.wk_links";
const WR = "cover.wk_rechts";
const ELKE_DAG = [0, 1, 2, 3, 4, 5, 6];
const DELEN = [
  { id: "c", lampen: [WL, WR], helderheden: {}, aan: om("11:30"), uit: om("20:00") },
  { id: "a", lampen: [KL], helderheden: {}, aan: om("09:30"), uit: om("14:30") },
  { lampen: [KV], helderheden: {}, aan: om("09:30"), uit: om("20:00") },
];
const REGEL = { naam: "Vakantie rolluiken", vakantie: true, dagen: ELKE_DAG, lampen: [WL, WR, KL, KV], delen: DELEN };

describe("de onderdelen van een regel", () => {
  it("een regel met `delen` heeft die als onderdelen", () => {
    assert.equal(L.onderdelenVan(REGEL), DELEN);
  });

  it("REGRESSIEWACHT: een regel zonder `delen` is één onderdeel, met wat er bij een onderdeel hoort", () => {
    const oud = { id: "r1", naam: "Avond", lampen: ["light.a"], helderheid: 60, aan: om("18:00"), uit: null, dagen: [0] };
    assert.deepEqual(L.onderdelenVan(oud), [{ lampen: ["light.a"], helderheid: 60, aan: om("18:00"), uit: null }]);
  });

  it("deelVolgorde zet ze op tijd, met de zon er ongeveer tussen", () => {
    const zon = { aan: { soort: "zonsondergang", verschil: -30 } };
    const volgorde = [DELEN[0], zon, DELEN[1], { uit: om("06:00") }].sort((a, b) => L.deelVolgorde(a) - L.deelVolgorde(b));
    assert.deepEqual(volgorde.map(L.deelVolgorde), [360, 570, 690, 1110]);
  });
});

describe("naar de server", () => {
  it("meer onderdelen gaan als `delen`, op tijd gezet, met hun id als ze er een hebben", () => {
    const uit = L.naarServer(REGEL);
    assert.deepEqual(Object.keys(uit), ["naam", "delen", "dagen", "vakantie"]);
    assert.deepEqual(
      uit.delen.map((d) => [d.id, d.lampen, d.aan.tijd]),
      [
        ["a", [KL], "09:30"],
        [undefined, [KV], "09:30"],
        ["c", [WL, WR], "11:30"],
      ]
    );
    // Rolluiken zonder stand krijgen geen helderheid: dimt zegt nee.
    assert.deepEqual(L.naarServer(REGEL, () => false).delen[0].helderheden, {});
  });

  it("één onderdeel gaat als gewone regel, zonder `delen` en zonder het id van het onderdeel", () => {
    const uit = L.naarServer({ id: "r1", dagen: [2, 0], vakantie: false, delen: [DELEN[1]] });
    assert.deepEqual(uit, {
      id: "r1",
      lampen: [KL],
      helderheden: { [KL]: 100 },
      aan: om("09:30"),
      uit: om("14:30"),
      dagen: [0, 2],
      vakantie: false,
    });
  });

  it("REGRESSIEWACHT: een regel van voor 0.102.0 gaat er net zo uit", () => {
    const oud = { id: "r1", lampen: ["light.a", "light.b"], helderheid: 60, aan: om("18:00"), dagen: [0], vakantie: false };
    assert.deepEqual(L.naarServer(oud, (id) => id === "light.a"), {
      id: "r1",
      lampen: ["light.a", "light.b"],
      helderheden: { "light.a": 60 },
      aan: om("18:00"),
      uit: null,
      dagen: [0],
      vakantie: false,
    });
  });
});

describe("wat er nog ontbreekt", () => {
  it("noemt het onderdeel als er meer zijn", () => {
    const regel = { dagen: ELKE_DAG, delen: [DELEN[0], { lampen: [], aan: om("10:00") }] };
    assert.equal(L.waaromNiet(regel), "Onderdeel 2: Kies minstens één lamp.");
    const zonderMoment = { dagen: ELKE_DAG, delen: [DELEN[0], { lampen: [KV], aan: null, uit: null }] };
    assert.equal(L.waaromNiet(zonderMoment), "Onderdeel 2: Kies wanneer hij aan of uit gaat.");
    assert.equal(L.waaromNiet({ ...REGEL, dagen: [] }), "Kies minstens één dag.");
    assert.equal(L.waaromNiet(REGEL), null);
  });

  it("REGRESSIEWACHT: zonder onderdelen dezelfde zinnen als altijd", () => {
    assert.equal(L.waaromNiet({ lampen: [], aan: om("10:00"), dagen: [0] }), "Kies minstens één lamp.");
    assert.equal(L.waaromNiet({ lampen: ["light.a"], aan: null, uit: null, dagen: [0] }), "Kies wanneer hij aan of uit gaat.");
    assert.equal(L.waaromNiet({ favoriet: true, naam: " ", lampen: ["light.a"] }), "Geef de favoriet een naam.");
  });
});

describe("de tekst op de kaart", () => {
  it("een regel met onderdelen noemt alle momenten, een keer elk, op volgorde", () => {
    assert.equal(L.regelTekst(REGEL), "Open om 09:30 en 11:30 · dicht om 14:30 en 20:00 · Elke dag");
  });

  it("met lampen en de zon erbij", () => {
    const regel = {
      dagen: [5, 6],
      delen: [
        { lampen: ["light.a"], aan: { soort: "zonsondergang", verschil: 0 }, uit: om("23:00") },
        { lampen: [KL], aan: om("08:00"), uit: null },
      ],
    };
    assert.equal(L.regelTekst(regel), "Aan om 08:00 en bij zonsondergang · uit om 23:00 · Weekend");
  });

  it("een onderdeel in een zin, zonder de dagen", () => {
    assert.equal(L.deelTekst(DELEN[1]), "Open om 09:30 · dicht om 14:30");
    assert.equal(L.deelTekst({ lampen: [KL], uit: om("20:00") }), "Dicht om 20:00");
  });

  it("REGRESSIEWACHT: een gewone regel leest als altijd", () => {
    const regel = { lampen: ["light.a"], helderheid: 60, aan: { soort: "zonsondergang", verschil: -30 }, uit: om("23:00"), dagen: ELKE_DAG };
    assert.equal(L.regelTekst(regel), "Aan 30 min voor zonsondergang · uit om 23:00 · 60% · Elke dag");
  });

  it("een nieuwe regel begint als een nieuw onderdeel", () => {
    const { aan, uit } = L.nieuweRegel([]);
    assert.deepEqual({ aan, uit }, { aan: L.nieuwOnderdeel().aan, uit: L.nieuwOnderdeel().uit });
  });
});
