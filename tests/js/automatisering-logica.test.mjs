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

describe("het voorbeeld (0.95.0)", () => {
  const states = {
    "light.a": { state: "on", attributes: { brightness: 77 } },
    "light.b": { state: "off", attributes: {} },
    "light.c": { state: "on", attributes: {} },
    "light.weg": { state: "unavailable", attributes: {} },
  };

  it("NIEUW GEDRAG: de beginstand: aan met helderheid, uit, en een lamp die er niet is", () => {
    assert.deepEqual(L.lampStand(states["light.a"]), { aan: true, helderheid: 77 });
    assert.deepEqual(L.lampStand(states["light.b"]), { aan: false, helderheid: null });
    assert.equal(L.lampStand(states["light.weg"]), null);
    assert.equal(L.lampStand(undefined), null);
  });

  it("NIEUW GEDRAG: de doelen: percentage, gewoon aan, en niets voor een lamp die weg is", () => {
    assert.deepEqual(
      L.voorbeeldDoelen(["light.a", "light.b", "light.c", "light.weg"], { "light.a": 50 }, (id) => id !== "light.c", states),
      { "light.a": 50, "light.b": 100, "light.c": null }
    );
  });

  it("NIEUW GEDRAG: alles op 50% is één aanroep, een aan-uit-lamp zonder helderheid", () => {
    assert.deepEqual(L.voorbeeldOproepen({ "light.a": 50, "light.b": 50, "light.c": null }), [
      ["light", "turn_on", { entity_id: ["light.a", "light.b"], brightness_pct: 50 }],
      ["light", "turn_on", { entity_id: ["light.c"] }],
    ]);
  });

  it("NIEUW GEDRAG: een schuif verzetten stuurt alleen wat veranderde", () => {
    assert.deepEqual(L.voorbeeldOproepen({ "light.a": 60, "light.b": 50 }, { "light.a": 50, "light.b": 50 }), [
      ["light", "turn_on", { entity_id: ["light.a"], brightness_pct: 60 }],
    ]);
    assert.deepEqual(L.voorbeeldOproepen({ "light.c": null }, { "light.c": null }), []);
  });

  it("NIEUW GEDRAG: terug: uit weer uit, aan op zijn eigen helderheid, en verder niets", () => {
    assert.deepEqual(
      L.terugOproepen({
        "light.a": { aan: true, helderheid: 77 },
        "light.b": { aan: false, helderheid: null },
        "light.c": { aan: true, helderheid: null },
        "light.weg": null,
      }),
      [
        ["light", "turn_off", { entity_id: ["light.b"] }],
        ["light", "turn_on", { entity_id: ["light.a"], brightness: 77 }],
      ]
    );
    assert.deepEqual(L.terugOproepen({}), []);
  });
});

describe("de naam en het overzicht (0.96.0)", () => {
  const lampen = [];
  const naamVan = (id) => id.replace("light.", "");

  it("NIEUW GEDRAG: tot drie lampen op naam, daarna een telling", () => {
    assert.equal(L.lampenKort({ lampen: ["light.a", "light.b", "light.c"] }, lampen, naamVan), "a, b, c");
    assert.equal(L.lampenKort({ lampen: ["light.a", "light.b", "light.c", "light.d"] }, lampen, naamVan), "a, b en 2 andere");
    assert.equal(
      L.lampenKort({ lampen: Array.from({ length: 55 }, (_, i) => `light.l${i}`) }, lampen, naamVan),
      "l0, l1 en 53 andere"
    );
  });

  it("NIEUW GEDRAG: de kop is de naam, en zonder naam de lampen", () => {
    assert.equal(L.regelKop({ naam: "Avond beneden", lampen: ["light.a"] }, lampen, naamVan), "Avond beneden");
    assert.equal(L.regelKop({ naam: "   ", lampen: ["light.a"] }, lampen, naamVan), "a");
    assert.equal(L.regelKop({ lampen: ["light.a"] }, lampen, naamVan), "a");
  });

  it("NIEUW GEDRAG: de naam gaat mee naar de server, en een lege niet", () => {
    const basis = { lampen: ["light.a"], dagen: [0], aan: null, uit: { soort: "tijd", tijd: "23:00" } };
    assert.equal(L.naarServer({ ...basis, naam: "  Avond beneden " }).naam, "Avond beneden");
    assert.equal("naam" in L.naarServer({ ...basis, naam: "  " }), false);
    assert.equal("naam" in L.naarServer(basis), false);
  });
});

describe("rolluiken (0.97.0)", () => {
  const KAART_R = {
    lampen: ["light.a"],
    rolluiken: ["cover.x", { entity: "cover.y", name: "Serre" }, "light.geen", "cover.x"],
    omgekeerd: ["cover.y"],
  };

  it("NIEUW GEDRAG: rolluiken op de kaart, met naam en omgekeerde motor", () => {
    assert.deepEqual(L.lampenUit(KAART_R), [
      { entity: "light.a", naam: "", aanUit: false },
      { entity: "cover.x", naam: "", rolluik: true, omgekeerd: false },
      { entity: "cover.y", naam: "Serre", rolluik: true, omgekeerd: true },
    ]);
  });

  it("NIEUW GEDRAG: een schuif alleen als het rolluik zijn stand kent", () => {
    assert.equal(L.magDimmen("cover.x", [], { attributes: { supported_features: 15 } }), true);
    assert.equal(L.magDimmen("cover.x", [], { attributes: { supported_features: 11 } }), false);
    assert.equal(L.magDimmen("cover.x", [], undefined), true);
  });

  it("NIEUW GEDRAG: de rij zegt open en dicht bij alleen rolluiken, en aan en uit als er ook een lamp is", () => {
    const basis = regel({ lampen: ["cover.x"], aan: { soort: "tijd", tijd: "08:00" }, uit: { soort: "tijd", tijd: "20:00" } });
    assert.match(L.regelTekst(basis), /^Open om 08:00 · dicht om 20:00/);
    assert.match(L.regelTekst({ ...basis, aan: null }), /^Dicht om 20:00/);
    assert.match(L.regelTekst({ ...basis, lampen: ["cover.x", "light.a"] }), /^Aan om 08:00 · uit om 20:00/);
  });

  it("NIEUW GEDRAG: het voorbeeld gebruikt de diensten van een rolluik, ook omgekeerd", () => {
    assert.deepEqual(L.voorbeeldOproepen({ "cover.x": 40, "cover.y": 40 }, {}, ["cover.y"]), [
      ["cover", "set_cover_position", { entity_id: ["cover.x"], position: 40 }],
      ["cover", "set_cover_position", { entity_id: ["cover.y"], position: 60 }],
    ]);
    assert.deepEqual(L.voorbeeldOproepen({ "cover.x": 0, "cover.y": 0 }, {}, ["cover.y"]), [
      ["cover", "close_cover", { entity_id: ["cover.x"] }],
      ["cover", "open_cover", { entity_id: ["cover.y"] }],
    ]);
    assert.deepEqual(L.voorbeeldOproepen({ "cover.x": 100, "cover.z": null }), [
      ["cover", "open_cover", { entity_id: ["cover.x", "cover.z"] }],
    ]);
  });

  it("NIEUW GEDRAG: terug naar de stand zoals Home Assistant hem meldde", () => {
    const op = (state, attributes = {}) => ({ entity_id: "cover.x", state, attributes });
    assert.deepEqual(L.lampStand(op("open", { current_position: 70 })), { rolluik: true, aan: true, positie: 70 });
    assert.deepEqual(L.lampStand(op("closed")), { rolluik: true, aan: false, positie: null });
    assert.deepEqual(
      L.terugOproepen({
        "cover.x": { rolluik: true, aan: true, positie: 70 },
        "cover.y": { rolluik: true, aan: true, positie: null },
        "cover.z": { rolluik: true, aan: false, positie: null },
      }),
      [
        ["cover", "set_cover_position", { entity_id: ["cover.x"], position: 70 }],
        ["cover", "open_cover", { entity_id: ["cover.y"] }],
        ["cover", "close_cover", { entity_id: ["cover.z"] }],
      ]
    );
  });

  it("NIEUW GEDRAG: de stand op de knop: 0 is uit, of dicht bij alleen rolluiken", () => {
    assert.equal(L.niveauTekst(50), "50%");
    assert.equal(L.niveauTekst(0), "Uit");
    assert.equal(L.niveauTekst(0, true), "Dicht");
    assert.equal(L.alleenRolluiken(["cover.x"]), true);
    assert.equal(L.alleenRolluiken(["cover.x", "light.a"]), false);
    assert.equal(L.alleenRolluiken([]), false);
  });
});

describe("favorieten (0.97.0)", () => {
  const states = { "light.a": { state: "on", attributes: {} }, "light.b": { state: "off", attributes: {} } };

  it("NIEUW GEDRAG: een favoriet heeft een naam nodig en een lamp, maar geen moment of dagen", () => {
    const f = L.nieuweFavoriet([{ entity: "light.a" }]);
    assert.equal(L.waaromNiet(f), "Geef de favoriet een naam.");
    assert.equal(L.waaromNiet({ ...f, naam: "  " }), "Geef de favoriet een naam.");
    assert.equal(L.waaromNiet({ ...f, naam: "Slapen" }), null);
    assert.equal(L.waaromNiet({ ...f, naam: "Slapen", lampen: [] }), "Kies minstens één lamp.");
  });

  it("NIEUW GEDRAG: naar de server: 0 blijft, en iets zonder schuif op een stand is gewoon aan", () => {
    const uit = L.favorietNaarServer(
      { id: "f", naam: " Slapen ", icoon: "sleep", lampen: ["light.a", "light.b", "light.c", "light.d"], helderheden: { "light.a": 0, "light.b": 40, "light.c": 0 } },
      (id) => id !== "light.c" && id !== "light.d"
    );
    assert.deepEqual(uit, {
      id: "f",
      naam: "Slapen",
      icoon: "sleep",
      lampen: ["light.a", "light.b", "light.c", "light.d"],
      helderheden: { "light.a": 0, "light.b": 40, "light.c": 0 },
    });
  });

  it("NIEUW GEDRAG: het voorbeeld zet 0 uit, ook bij een lamp zonder schuif", () => {
    const doelen = L.voorbeeldDoelen(["light.a", "light.b"], { "light.a": 0, "light.b": 40 }, () => false, states);
    assert.deepEqual(doelen, { "light.a": 0, "light.b": null });
    assert.deepEqual(L.voorbeeldOproepen(doelen), [
      ["light", "turn_off", { entity_id: ["light.a"] }],
      ["light", "turn_on", { entity_id: ["light.b"] }],
    ]);
  });

  it("NIEUW GEDRAG: op de automatiseringskaart alleen wat een lamp van die kaart heeft", () => {
    const f = [{ id: "1", lampen: ["light.a"] }, { id: "2", lampen: ["light.z"] }];
    assert.deepEqual(L.favorietenVoor(f, [{ entity: "light.a" }]).map((x) => x.id), ["1"]);
  });
});


describe("kant-en-klare favorieten met vinkjes (0.98.0)", () => {
  const LAMPEN = L.lampenUit({
    lampen: ["light.woon", "light.keuken", { entity: "light.tuin", name: "Tuin" }, "light.oprit"],
    rolluiken: ["cover.a", "cover.b"],
  });
  const buiten = (id) => id === "light.tuin" || id === "light.oprit";
  const vinkjes = (f) => Object.fromEntries(L.favorietVinkjes(f, LAMPEN, buiten).map((v) => [v.sleutel, v.aan]));
  const sjabloon = (s) => L.FAVORIET_SJABLONEN.find((x) => x.sleutel === s);

  it("NIEUW GEDRAG: Woning verlaten is alles uit behalve de buitenverlichting, en die staat er niet in", () => {
    const f = L.favorietUitSjabloon(sjabloon("verlaten"), LAMPEN, buiten);
    assert.deepEqual(f.lampen, ["light.woon", "light.keuken"]);
    assert.deepEqual(f.helderheden, { "light.woon": 0, "light.keuken": 0 });
    assert.equal(f.naam, "Woning verlaten");
    assert.equal(f.icoon, "homeLeave");
    const v = vinkjes(f);
    assert.equal(v.alleUit, true);
    assert.equal(v.behalveBuiten, true);
    assert.equal(v.rolluikenDicht, false);
    const telling = (x) => L.favorietVinkjes(x, LAMPEN, buiten).find((w) => w.sleutel === "alleUit").tekst;
    assert.equal(telling(f), "2 lampen");
    assert.equal(telling(L.metVinkje(f, LAMPEN, buiten, "behalveBuiten", false)), "4 lampen");
  });

  it("NIEUW GEDRAG: het vinkje behalve uit zet de buitenlampen er alsnog bij, op uit", () => {
    const f = L.metVinkje(L.favorietUitSjabloon(sjabloon("verlaten"), LAMPEN, buiten), LAMPEN, buiten, "behalveBuiten", false);
    assert.equal(f.helderheden["light.tuin"], 0);
    assert.equal(f.helderheden["light.oprit"], 0);
    assert.equal(vinkjes(f).alleUit, true);
    assert.equal(vinkjes(f).behalveBuiten, false);
  });

  it("NIEUW GEDRAG: een vinkje raakt alleen zijn eigen deel; een lamp die je zelf zette blijft staan", () => {
    const eigen = { favoriet: true, lampen: ["light.woon"], helderheden: { "light.woon": 40 } };
    const f = L.metVinkje(eigen, LAMPEN, buiten, "rolluikenDicht", true);
    assert.equal(f.helderheden["light.woon"], 40);
    assert.equal(f.helderheden["cover.a"], 0);
    assert.deepEqual(L.metVinkje(f, LAMPEN, buiten, "rolluikenDicht", false).lampen, ["light.woon"]);
    assert.equal(vinkjes(eigen).alleUit, false);
  });

  it("NIEUW GEDRAG: dicht en open sluiten elkaar uit, want ze zetten hetzelfde rolluik", () => {
    let f = L.metVinkje({ lampen: [], helderheden: {} }, LAMPEN, buiten, "rolluikenDicht", true);
    f = L.metVinkje(f, LAMPEN, buiten, "rolluikenOpen", true);
    assert.equal(vinkjes(f).rolluikenOpen, true);
    assert.equal(vinkjes(f).rolluikenDicht, false);
    assert.equal(f.lampen.filter((id) => id === "cover.a").length, 1);
  });

  it("NIEUW GEDRAG: de vinkjes volgen uit de favoriet, dus ook een eerder opgeslagen favoriet heeft ze", () => {
    const opgeslagen = { lampen: ["light.woon", "light.keuken", "cover.a", "cover.b"], helderheden: { "light.woon": 0, "light.keuken": 0, "cover.a": 0, "cover.b": 0 } };
    const v = vinkjes(opgeslagen);
    assert.equal(v.alleUit, true);
    assert.equal(v.behalveBuiten, true);
    assert.equal(v.rolluikenDicht, true);
  });

  it("NIEUW GEDRAG: wat op de kaart niets kan, staat er niet; alleen binnenlampen geeft alleen Alle lampen uit", () => {
    const alleenBinnen = L.lampenUit({ lampen: ["light.woon", "light.keuken"] });
    const niemand = () => false;
    assert.deepEqual(L.favorietVinkjes({ lampen: [] }, alleenBinnen, niemand).map((v) => v.sleutel), ["alleUit"]);
    assert.deepEqual(L.sjablonenVoor(alleenBinnen, niemand).map((s) => s.sleutel), ["verlaten", "slapen", "allesuit"]);
    assert.deepEqual(L.sjablonenVoor(LAMPEN, buiten).map((s) => s.sleutel), ["verlaten", "slapen", "thuis", "ochtend", "allesuit"]);
  });

  it("NIEUW GEDRAG: buiten herkent de verdieping, de ruimte en de naam, zonder de rest mee te nemen", () => {
    const hass = {
      floors: { b: { floor_id: "b", name: "Outside" }, e: { floor_id: "e", name: "Begane grond" } },
      areas: { porch: { name: "Entrance", floor_id: "b" }, tuin: { name: "Achtertuin" }, keuken: { name: "Keuken", floor_id: "e" } },
      entities: { "light.a": { area_id: "porch" }, "light.b": { area_id: "tuin" }, "light.c": { area_id: "keuken" }, "light.d": { device_id: "x" } },
      devices: { x: { area_id: "keuken" } },
    };
    assert.equal(L.isBuiten("light.a", hass), true);
    assert.equal(L.isBuiten("light.b", hass), true);
    assert.equal(L.isBuiten("light.c", hass), false);
    assert.equal(L.isBuiten("light.d", hass, "Buitenlamp"), true);
    assert.equal(L.isBuiten("light.d", hass, "Plafondlamp"), false);
  });

  it("NIEUW GEDRAG: een sjabloon gaat als gewone favoriet naar de server, zonder vinkjes", () => {
    const f = L.favorietUitSjabloon(sjabloon("slapen"), LAMPEN, buiten);
    const uit = L.favorietNaarServer(f, () => true);
    assert.deepEqual(Object.keys(uit).sort(), ["helderheden", "icoon", "lampen", "naam"]);
    assert.equal(uit.helderheden["light.tuin"], 0);
    assert.equal(uit.helderheden["cover.a"], 0);
  });
});
