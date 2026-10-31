/**
 * De automatiseringskaart: wat hij zegt en wat hij controleert (0.89.0).
 *
 * Alles NIEUW GEDRAG: de kaart bestond niet vóór deze ronde.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as L from "../../src/cards/automatisering-logica.js";

const KAART = { lampen: [{ entity: "light.a", name: "Woonkamer" }, "light.b", "switch.c", "light.a", 5] };
const regel = (extra = {}) => ({
  id: "r",
  lampen: ["light.a"],
  helderheid: 100,
  aan: { soort: "tijd", tijd: "07:00" },
  uit: null,
  dagen: [0, 1, 2, 3, 4, 5, 6],
  ...extra,
});

describe("lampenUit", () => {
  it("houdt alleen lampen over, één keer, met hun naam", () => {
    assert.deepEqual(L.lampenUit(KAART), [
      { entity: "light.a", naam: "Woonkamer", aanUit: false },
      { entity: "light.b", naam: "", aanUit: false },
    ]);
    assert.deepEqual(L.lampenUit({}), []);
    assert.deepEqual(L.lampenUit(null), []);
  });
});

describe("regelsVoor", () => {
  const lampen = L.lampenUit(KAART);
  const regels = [
    regel({ id: "gewoon" }),
    regel({ id: "vakantie", vakantie: true }),
    regel({ id: "ander", lampen: ["light.zolder"] }),
    regel({ id: "half", lampen: ["light.zolder", "light.b"] }),
  ];
  it("scheidt de groepen, en toont wat op deze kaart hoort", () => {
    assert.deepEqual(L.regelsVoor(regels, lampen, false).map((r) => r.id), ["gewoon", "half"]);
    assert.deepEqual(L.regelsVoor(regels, lampen, true).map((r) => r.id), ["vakantie"]);
    assert.deepEqual(L.regelsVoor(null, lampen, false), []);
  });
});

describe("kanDimmen", () => {
  it("alleen aan en uit kan niet dimmen; onbekend weet het niet", () => {
    assert.equal(L.kanDimmen({ attributes: { supported_color_modes: ["onoff"] } }), false);
    assert.equal(L.kanDimmen({ attributes: { supported_color_modes: ["brightness"] } }), true);
    assert.equal(L.kanDimmen({ attributes: {} }), true);
    assert.equal(L.kanDimmen(undefined), true);
  });
});

describe("de tekst op de kaart", () => {
  it("een moment", () => {
    assert.equal(L.momentTekst({ soort: "tijd", tijd: "07:00" }), "om 07:00");
    assert.equal(L.momentTekst({ soort: "zonsondergang", verschil: 0 }), "bij zonsondergang");
    assert.equal(L.momentTekst({ soort: "zonsopkomst", verschil: -30 }), "30 min voor zonsopkomst");
    assert.equal(L.momentTekst({ soort: "zonsondergang", verschil: 90 }), "1 uur 30 min na zonsondergang");
    assert.equal(L.momentTekst({ soort: "zonsopkomst", verschil: 60 }), "1 uur na zonsopkomst");
    assert.equal(L.momentTekst(null), "");
  });

  it("de hele regel", () => {
    assert.equal(
      L.regelTekst(regel({ aan: { soort: "zonsondergang", verschil: 0 }, uit: { soort: "tijd", tijd: "23:00" }, helderheid: 60 })),
      "Aan bij zonsondergang · uit om 23:00 · 60% · Elke dag"
    );
    assert.equal(L.regelTekst(regel({ aan: null, uit: { soort: "tijd", tijd: "23:00" }, helderheid: 60 })), "Uit om 23:00 · Elke dag");
    assert.equal(L.regelTekst(regel({ dagen: [0, 1, 2, 3, 4] })), "Aan om 07:00 · Werkdagen");
    assert.equal(L.regelTekst(regel({ dagen: [6, 5] })), "Aan om 07:00 · Weekend");
  });

  it("losse dagen beginnen op maandag, in volgorde", () => {
    const namen = L.dagNamen();
    assert.equal(namen.length, 7);
    assert.equal(namen[0], "ma");
    assert.equal(namen[6], "zo");
    assert.equal(L.dagenTekst([2, 0]), "ma, wo");
  });

  it("de stapper", () => {
    assert.equal(L.verschilTekst(0), "Op dat moment");
    assert.equal(L.verschilTekst(-30), "30 min ervoor");
    assert.equal(L.verschilTekst(75), "1 uur 15 min erna");
    assert.equal(L.stapVerschil(0, -1), -15);
    assert.equal(L.stapVerschil(L.VERSCHIL_MAX, 1), L.VERSCHIL_MAX);
    assert.equal(L.stapVerschil(-L.VERSCHIL_MAX, -1), -L.VERSCHIL_MAX);
    assert.equal(L.stapVerschil(undefined, 1), 15);
  });

  it("de namen: de kaart eerst, en een lamp die er niet meer op staat houdt een naam", () => {
    const lampen = L.lampenUit(KAART);
    assert.equal(L.lampenTekst(regel({ lampen: ["light.a", "light.b"] }), lampen, () => "Eigen naam"), "Woonkamer, Eigen naam");
    assert.equal(L.lampenTekst(regel({ lampen: ["light.weg"] }), lampen), "light.weg");
  });
});

describe("een nieuwe regel", () => {
  it("heeft een lamp als er maar één is, en geen als er te kiezen valt", () => {
    assert.deepEqual(L.nieuweRegel([{ entity: "light.a" }]).lampen, ["light.a"]);
    assert.deepEqual(L.nieuweRegel(L.lampenUit(KAART)).lampen, []);
    assert.equal(L.nieuweRegel([], true).vakantie, true);
    assert.equal(L.nieuweRegel([]).vakantie, false);
  });

  it("met een lamp erbij is hij meteen op te slaan", () => {
    assert.equal(L.waaromNiet(L.nieuweRegel([{ entity: "light.a" }])), null);
  });
});

describe("waaromNiet", () => {
  it("zegt wat er ontbreekt", () => {
    assert.match(L.waaromNiet(regel({ lampen: [] })), /lamp/);
    assert.match(L.waaromNiet(regel({ aan: null, uit: null })), /aan of uit/);
    assert.match(L.waaromNiet(regel({ dagen: [] })), /dag/);
    assert.match(L.waaromNiet(regel({ aan: { soort: "tijd", tijd: "" } })), /tijd/);
    assert.match(L.waaromNiet(regel({ uit: { soort: "tijd", tijd: "" } })), /tijd/);
    assert.equal(L.waaromNiet(regel()), null);
    assert.equal(L.waaromNiet(regel({ aan: null, uit: { soort: "zonsopkomst", verschil: 15 } })), null);
  });
});

describe("kleine hulpjes", () => {
  it("wissel, metSoort en naarServer", () => {
    assert.deepEqual(L.wissel([1, 2], 2), [1]);
    assert.deepEqual(L.wissel([1], 2), [1, 2]);
    assert.equal(L.metSoort("geen"), null);
    assert.deepEqual(L.metSoort("tijd"), { soort: "tijd", tijd: "18:00" });
    assert.deepEqual(L.metSoort("zonsopkomst"), { soort: "zonsopkomst", verschil: 0 });
    const uit = L.naarServer(regel({ id: undefined, dagen: [6, 0], actief: false, extra: 1 }));
    assert.deepEqual(uit, {
      lampen: ["light.a"],
      helderheden: { "light.a": 100 },
      aan: { soort: "tijd", tijd: "07:00" },
      uit: null,
      dagen: [0, 6],
      vakantie: false,
    });
    assert.equal(L.naarServer(regel()).id, "r");
  });
});

describe("de helderheid per lamp (0.94.0)", () => {
  const twee = { lampen: ["light.a", "light.b"] };

  it("een oude regel met één helderheid geldt voor al zijn lampen", () => {
    assert.deepEqual(L.startHelderheden({ ...twee, helderheid: 35 }), { "light.a": 35, "light.b": 35 });
    assert.deepEqual(L.startHelderheden(twee), { "light.a": 100, "light.b": 100 });
  });

  it("een nieuwe regel houdt zijn eigen waarden", () => {
    assert.deepEqual(L.startHelderheden({ ...twee, helderheid: 35, helderheden: { "light.a": 60 } }), { "light.a": 60 });
  });

  it("naar de server: alleen wat dimt, en een lamp zonder waarde op 100", () => {
    const r = { ...regel(twee), helderheden: { "light.a": 60 } };
    assert.deepEqual(L.naarServer(r).helderheden, { "light.a": 60, "light.b": 100 });
    assert.deepEqual(L.naarServer(r, (id) => id === "light.b").helderheden, { "light.b": 100 });
    assert.equal("helderheid" in L.naarServer(r), false);
  });

  it("de tekst: één waarde, een bereik, of niets", () => {
    assert.equal(L.helderheidTekst({ helderheden: { a: 60, b: 60 } }), "60%");
    assert.equal(L.helderheidTekst({ helderheden: { a: 20, b: 60 } }), "20-60%");
    assert.equal(L.helderheidTekst({ helderheden: { a: 100 } }), "");
    assert.equal(L.helderheidTekst({ helderheden: {} }), "");
    assert.equal(L.helderheidTekst({ helderheid: 40 }), "40%");
    assert.equal(L.regelTekst(regel({ helderheden: { "light.a": 20, "light.b": 60 } })), "Aan om 07:00 · 20-60% · Elke dag");
  });

  it("alleen aan en uit: de lamp kan wel dimmen, maar krijgt geen schuif", () => {
    const lampen = L.lampenUit({ lampen: ["light.a", "light.b"], alleen_aan_uit: ["light.b"] });
    const dim = { attributes: { supported_color_modes: ["brightness"] } };
    assert.equal(L.magDimmen("light.a", lampen, dim), true);
    assert.equal(L.magDimmen("light.b", lampen, dim), false);
    assert.equal(L.magDimmen("light.a", lampen, { attributes: { supported_color_modes: ["onoff"] } }), false);
  });
});
