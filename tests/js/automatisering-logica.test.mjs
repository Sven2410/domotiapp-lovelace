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

describe("zoeken en filteren in de lampen (0.94.0)", () => {
  const lampen = ["light.a", "light.b", "light.c", "light.d"].map((entity) => ({ entity, naam: "" }));
  const namen = { "light.a": "Spot bank", "light.b": "Tafellamp", "light.c": "Café spot", "light.d": "Lamp zonder plek" };
  const naamVan = (id) => namen[id];
  const hass = {
    entities: {
      "light.a": { area_id: "woon" },
      "light.b": { area_id: "keuken" },
      // De ruimte kan ook op het apparaat staan.
      "light.c": { area_id: null, device_id: "x" },
      "light.d": {},
    },
    devices: { x: { area_id: "woon" } },
    areas: { woon: { name: "Woonkamer" }, keuken: { name: "Keuken" } },
  };
  const ids = (lijst) => lijst.map((l) => l.entity);

  it("NIEUW GEDRAG: de ruimte van de entiteit, anders van zijn apparaat", () => {
    assert.equal(L.ruimteVan(hass, "light.a"), "woon");
    assert.equal(L.ruimteVan(hass, "light.c"), "woon");
    assert.equal(L.ruimteVan(hass, "light.d"), "");
    assert.equal(L.ruimteVan(null, "light.a"), "");
  });

  it("NIEUW GEDRAG: de ruimtes op naam, en Geen ruimte als laatste", () => {
    assert.deepEqual(L.ruimtesVan(lampen, hass).map((r) => r.id), ["keuken", "woon", ""]);
    assert.deepEqual(L.ruimtesVan(lampen.slice(0, 1), hass).map((r) => r.naam), ["Woonkamer"]);
  });

  it("NIEUW GEDRAG: filteren op ruimte; null is alles, leeg is zonder ruimte", () => {
    assert.deepEqual(ids(L.lampenGefilterd(lampen, { ruimte: "woon" }, naamVan, hass)), ["light.a", "light.c"]);
    assert.deepEqual(ids(L.lampenGefilterd(lampen, { ruimte: "" }, naamVan, hass)), ["light.d"]);
    assert.equal(L.lampenGefilterd(lampen, {}, naamVan, hass).length, 4);
  });

  it("NIEUW GEDRAG: zoeken zonder hoofdletters en accenten, ook met een spatie en op de ruimte", () => {
    assert.deepEqual(ids(L.lampenGefilterd(lampen, { zoek: "CAFE" }, naamVan, hass)), ["light.c"]);
    assert.deepEqual(ids(L.lampenGefilterd(lampen, { zoek: "spot bank" }, naamVan, hass)), ["light.a"]);
    assert.deepEqual(ids(L.lampenGefilterd(lampen, { zoek: "spot woon" }, naamVan, hass)), ["light.a", "light.c"]);
    assert.deepEqual(ids(L.lampenGefilterd(lampen, { zoek: "  " }, naamVan, hass)).length, 4);
    assert.deepEqual(L.lampenGefilterd(lampen, { zoek: "garage" }, naamVan, hass), []);
  });

  it("NIEUW GEDRAG: zoeken en een ruimte tellen samen", () => {
    assert.deepEqual(ids(L.lampenGefilterd(lampen, { zoek: "spot", ruimte: "keuken" }, naamVan, hass)), []);
  });
});

describe("helderheid in groepen (0.94.0)", () => {
  it("NIEUW GEDRAG: lampen met dezelfde waarde staan samen, aan-uit-lampen niet", () => {
    assert.deepEqual(
      L.groepenUit(["light.a", "light.b", "light.c", "light.d"], { "light.a": 50, "light.b": 20, "light.c": 50 }, (id) => id !== "light.d"),
      [
        { pct: 50, lampen: ["light.a", "light.c"] },
        { pct: 20, lampen: ["light.b"] },
      ]
    );
  });

  it("NIEUW GEDRAG: een lamp zonder waarde staat op 100%", () => {
    assert.deepEqual(L.groepenUit(["light.a"], {}), [{ pct: 100, lampen: ["light.a"] }]);
  });

  it("NIEUW GEDRAG: een lamp erbij doet dezelfde helderheid als de actieve groep", () => {
    const { groepen, actief } = L.metLamp([{ pct: 50, lampen: ["light.a"] }, { pct: 20, lampen: ["light.b"] }], 0, "light.c");
    assert.equal(actief, 0);
    assert.deepEqual(L.helderhedenUit(groepen), { "light.a": 50, "light.c": 50, "light.b": 20 });
  });

  it("NIEUW GEDRAG: de eerste lamp begint op 100%", () => {
    assert.deepEqual(L.metLamp([], 0, "light.a"), { groepen: [{ pct: 100, lampen: ["light.a"] }], actief: 0 });
  });

  it("NIEUW GEDRAG: Nieuwe helderheid geeft een lege actieve groep, en de volgende lamp komt daarin", () => {
    const start = [{ pct: 50, lampen: ["light.a"] }];
    const nieuw = L.nieuweGroep(start, 0);
    assert.equal(nieuw.actief, 1);
    assert.deepEqual(nieuw.groepen[1], { pct: 50, lampen: [] });
    // Een lege groep telt niet mee: er gaat niets naar de server.
    assert.deepEqual(L.helderhedenUit(nieuw.groepen), { "light.a": 50 });
    nieuw.groepen[1] = { ...nieuw.groepen[1], pct: 20 };
    const erbij = L.metLamp(nieuw.groepen, nieuw.actief, "light.b");
    assert.deepEqual(L.helderhedenUit(erbij.groepen), { "light.a": 50, "light.b": 20 });
  });

  it("NIEUW GEDRAG: geen tweede lege groep naast de eerste", () => {
    const leeg = L.nieuweGroep([{ pct: 50, lampen: ["light.a"] }], 0);
    const nogEens = L.nieuweGroep(leeg.groepen, 0);
    assert.equal(nogEens.groepen.length, 2);
    assert.equal(nogEens.actief, 1);
  });

  it("NIEUW GEDRAG: de laatste lamp eruit haalt de groep weg, en de actieve blijft dezelfde", () => {
    const groepen = [{ pct: 50, lampen: ["light.a"] }, { pct: 20, lampen: ["light.b"] }, { pct: 70, lampen: ["light.c"] }];
    const uit = L.zonderLamp(groepen, 2, "light.a");
    assert.deepEqual(uit.groepen.map((g) => g.pct), [20, 70]);
    assert.equal(uit.groepen[uit.actief].pct, 70);
  });

  it("NIEUW GEDRAG: de actieve groep leeg maken valt terug op de laatste", () => {
    const uit = L.zonderLamp([{ pct: 50, lampen: ["light.a"] }, { pct: 20, lampen: ["light.b"] }], 1, "light.b");
    assert.deepEqual(uit, { groepen: [{ pct: 50, lampen: ["light.a"] }], actief: 0 });
  });

  it("NIEUW GEDRAG: een net gemaakte lege groep blijft staan als er een andere lamp weggaat", () => {
    const uit = L.zonderLamp([{ pct: 50, lampen: ["light.a", "light.b"] }, { pct: 50, lampen: [] }], 1, "light.a");
    assert.equal(uit.groepen.length, 2);
    assert.equal(uit.actief, 1);
  });

  it("NIEUW GEDRAG: de laatste lamp eruit laat geen groepen achter", () => {
    assert.deepEqual(L.zonderLamp([{ pct: 50, lampen: ["light.a"] }], 0, "light.a"), { groepen: [], actief: 0 });
  });
});
