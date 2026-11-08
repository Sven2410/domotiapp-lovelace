/**
 * Wat er rechts op de overzichtskaart staat onder het weer.
 *
 * NIEUW GEDRAG (8 november 2026). `overzicht-logica.js` bestond niet vóór deze ronde; op de code van ervoor faalt dit
 * bestand bij het importeren. Zijn woorden: "links komen dan de favorieten en rechts moet een soort info scherm komen met
 * weer en belangrijke dingen".
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  alarmen,
  batterijenLeeg,
  beperk,
  groet,
  komendeAfspraken,
  afspraakWanneer,
  lampenAan,
  openWoord,
  opsomming,
  regels,
  staatOpen,
  wieThuis,
} from "../../src/cards/overzicht-logica.js";

const st = (entity_id, state, attributes = {}) => ({ entity_id, state, attributes });
const huis = (...lijst) => Object.fromEntries(lijst.map((s) => [s.entity_id, s]));

// zondag 8 november 2026, 14:30
const NU = new Date(2026, 10, 8, 14, 30);

describe("groet", () => {
  it("volgt het uur", () => {
    assert.equal(groet(new Date(2026, 10, 8, 5)), "Goedenacht");
    assert.equal(groet(new Date(2026, 10, 8, 6)), "Goedemorgen");
    assert.equal(groet(new Date(2026, 10, 8, 12)), "Goedemiddag");
    assert.equal(groet(new Date(2026, 10, 8, 18)), "Goedenavond");
  });
});

describe("alarmen", () => {
  it("vindt elke rook-, gas- en lekmelder die afgaat, zonder dat er iets gekozen is", () => {
    const states = huis(
      st("binary_sensor.rook_keuken", "on", { device_class: "smoke" }),
      st("binary_sensor.lek_wasmachine", "on", { device_class: "moisture" }),
      st("binary_sensor.rook_zolder", "off", { device_class: "smoke" }),
      st("binary_sensor.achterdeur", "on", { device_class: "door" }),
      st("alarm_control_panel.huis", "triggered"),
      st("alarm_control_panel.schuur", "armed_away")
    );
    assert.deepEqual(
      alarmen(states).map((a) => [a.id, a.woord]),
      [
        ["alarm_control_panel.huis", "Alarm gaat af"],
        ["binary_sensor.lek_wasmachine", "Lekkage"],
        ["binary_sensor.rook_keuken", "Rook"],
      ]
    );
  });

  it("slaat verborgen entiteiten over", () => {
    const states = huis(st("binary_sensor.rook_test", "on", { device_class: "smoke" }));
    assert.deepEqual(alarmen(states, (id) => id === "binary_sensor.rook_test"), []);
  });
});

describe("staatOpen en openWoord", () => {
  it("een slot is open als het niet op slot is, ook als het klemt", () => {
    assert.equal(staatOpen(st("lock.voordeur", "unlocked")), true);
    assert.equal(staatOpen(st("lock.voordeur", "jammed")), true);
    assert.equal(staatOpen(st("lock.voordeur", "locked")), false);
    assert.equal(openWoord(st("lock.voordeur", "unlocked")), "niet op slot");
    assert.equal(openWoord(st("lock.voordeur", "jammed")), "klemt");
  });

  it("een deur die dichtgaat is nog open", () => {
    assert.equal(staatOpen(st("cover.garagedeur", "closing")), true);
    assert.equal(staatOpen(st("cover.garagedeur", "closed")), false);
    assert.equal(staatOpen(st("binary_sensor.raam", "on", { device_class: "window" })), true);
    assert.equal(staatOpen(st("binary_sensor.raam", "unavailable")), false);
    assert.equal(openWoord(st("binary_sensor.raam", "on")), "open");
  });

  it("een entiteit die niet bestaat staat niet open", () => {
    assert.equal(staatOpen(undefined), false);
  });
});

describe("lampenAan", () => {
  it("telt lampen die aan zijn, zonder lichtgroepen", () => {
    const states = huis(
      st("light.bank", "on"),
      st("light.tafel", "on"),
      st("light.gang", "off"),
      st("light.woonkamer", "on", { entity_id: ["light.bank", "light.tafel"] }),
      st("switch.koffie", "on")
    );
    assert.equal(lampenAan(states), 2);
  });
});

describe("batterijenLeeg", () => {
  const states = huis(
    st("sensor.melder_badkamer_batterij", "8", { device_class: "battery", unit_of_measurement: "%" }),
    st("sensor.knop_gang_batterij", "4", { device_class: "battery", unit_of_measurement: "%" }),
    st("sensor.deur_batterij", "60", { device_class: "battery", unit_of_measurement: "%" }),
    st("sensor.telefoon_bram_batterij", "3", { device_class: "battery", unit_of_measurement: "%" }),
    st("sensor.kapot_batterij", "unavailable", { device_class: "battery", unit_of_measurement: "%" }),
    st("binary_sensor.slot_batterij", "on", { device_class: "battery" })
  );
  const telefoon = (id) => id.includes("telefoon");

  it("de leegste eerst, een melder zonder getal vooraan, telefoons niet", () => {
    assert.deepEqual(
      batterijenLeeg(states, 15, { telefoon }).map((b) => [b.id, b.pct]),
      [
        ["binary_sensor.slot_batterij", null],
        ["sensor.knop_gang_batterij", 4],
        ["sensor.melder_badkamer_batterij", 8],
      ]
    );
  });

  it("0 zet het uit", () => {
    assert.deepEqual(batterijenLeeg(states, 0, { telefoon }), []);
  });
});

describe("wieThuis", () => {
  const states = huis(st("person.bram", "home"), st("person.anna", "not_home"), st("person.tom", "home"));

  it("zonder lijst iedereen, op entity_id", () => {
    assert.deepEqual(wieThuis(states, []), ["person.bram", "person.tom"]);
  });

  it("met een lijst in die volgorde", () => {
    assert.deepEqual(wieThuis(states, ["person.tom", "person.anna", "person.bram"]), ["person.tom", "person.bram"]);
  });
});

describe("afspraken", () => {
  const a = (titel, start, eind, heleDag = false) => ({ titel, start, eind, heleDag });
  const lijst = [
    a("Overmorgen", new Date(2026, 10, 10, 9), new Date(2026, 10, 10, 10)),
    a("Tandarts", new Date(2026, 10, 9, 9), new Date(2026, 10, 9, 10)),
    a("Al geweest", new Date(2026, 10, 8, 9), new Date(2026, 10, 8, 10)),
    a("Voetbal", new Date(2026, 10, 8, 14), new Date(2026, 10, 8, 15)),
    a("Verjaardag", new Date(2026, 10, 8), new Date(2026, 10, 9), true),
    a("Eten", new Date(2026, 10, 8, 18), new Date(2026, 10, 8, 20)),
  ];

  it("van nu tot en met morgen, op begintijd, een hele dag vooraan", () => {
    assert.deepEqual(
      komendeAfspraken(lijst, NU).map((x) => x.titel),
      ["Verjaardag", "Voetbal", "Eten", "Tandarts"]
    );
  });

  it("zegt wanneer", () => {
    const [verjaardag, voetbal, eten, tandarts] = komendeAfspraken(lijst, NU);
    assert.equal(afspraakWanneer(verjaardag, NU), "vandaag");
    assert.equal(afspraakWanneer(voetbal, NU), "nu, tot 15:00");
    assert.equal(afspraakWanneer(eten, NU), "18:00");
    assert.equal(afspraakWanneer(tandarts, NU), "morgen 09:00");
  });
});

describe("opsomming en beperk", () => {
  it("met 'en' voor de laatste", () => {
    assert.equal(opsomming([]), "");
    assert.equal(opsomming(["GFT"]), "GFT");
    assert.equal(opsomming(["GFT", "Papier"]), "GFT en Papier");
    assert.equal(opsomming(["GFT", "Papier", "Rest"]), "GFT, Papier en Rest");
  });

  it("drie regels van een soort, daarna 'en n meer'", () => {
    const vijf = [1, 2, 3, 4, 5].map((n) => ({ soort: "open", tekst: `Raam ${n}` }));
    assert.deepEqual(beperk(vijf).map((r) => r.tekst), ["Raam 1", "Raam 2", "en 3 meer"]);
    assert.equal(beperk(vijf.slice(0, 3)).length, 3);
  });
});

describe("regels", () => {
  const naamVan = (id) => ({ "binary_sensor.rook_keuken": "Rookmelder keuken", "lock.voordeur": "Voordeur", "sensor.gft": "GFT" })[id] ?? id;

  it("alleen wat er te melden is: niets is een lege lijst", () => {
    assert.deepEqual(regels({ nu: NU, naamVan }), []);
    assert.deepEqual(regels({ nu: NU, naamVan, lampen: 0 }), []);
  });

  it("in de volgorde van de urgentie", () => {
    const uit = regels({
      nu: NU,
      naamVan,
      alarmen: [{ id: "binary_sensor.rook_keuken", woord: "Rook", icoon: "smoke" }],
      open: [st("lock.voordeur", "unlocked")],
      afspraken: [{ titel: "Tandarts", start: new Date(2026, 10, 9, 9), eind: new Date(2026, 10, 9, 10), heleDag: false, agenda: "calendar.gezin" }],
      afval: [
        { id: "sensor.gft", naam: "GFT", datum: new Date(2026, 10, 9), dagen: 1 },
        { id: "sensor.papier", naam: "Papier", datum: new Date(2026, 10, 9), dagen: 1 },
        { id: "sensor.rest", naam: "Rest", datum: new Date(2026, 10, 12), dagen: 4 },
      ],
      batterijen: [{ id: "sensor.knop", pct: 4 }],
      lampen: 3,
      thuis: ["Bram", "Anna"],
    });
    assert.deepEqual(
      uit.map((r) => [r.soort, r.toon, r.tekst, r.bij ?? null]),
      [
        ["alarm", "bad", "Rookmelder keuken", "Rook"],
        ["open", "warn", "Voordeur", "niet op slot"],
        ["agenda", "accent", "Tandarts", "morgen 09:00"],
        ["afval", "warn", "GFT en Papier", "morgen"],
        ["batterij", "warn", "sensor.knop", "4%"],
        ["lampen", "lit", "3 lampen aan", null],
        ["thuis", "accent", "Bram en Anna", "thuis"],
      ]
    );
    assert.equal(uit.find((r) => r.soort === "agenda").entity, "calendar.gezin");
  });

  it("afval verder dan een week weg staat er niet; binnen de week zonder waarschuwing", () => {
    const bak = (dagen) => [{ id: "sensor.gft", naam: "GFT", datum: new Date(2026, 10, 8 + dagen), dagen }];
    assert.equal(regels({ nu: NU, afval: bak(7) }).length, 0);
    assert.equal(regels({ nu: NU, afval: bak(3) })[0].toon, "neutral");
    assert.equal(regels({ nu: NU, afval: bak(0) })[0].bij, "vandaag");
  });

  it("niemand thuis is ook iets om te zeggen, en een lamp is enkelvoud", () => {
    assert.deepEqual(regels({ nu: NU, thuis: [] }).map((r) => r.tekst), ["Niemand thuis"]);
    assert.deepEqual(regels({ nu: NU, lampen: 1 }).map((r) => r.tekst), ["1 lamp aan"]);
  });
});
