/**
 * Wat er rechts op de overzichtskaart staat onder het weer.
 *
 * NIEUW GEDRAG (8 november 2026; afval, lampen en thuis eruit op dezelfde dag, 0.113.0). `overzicht-logica.js` bestond niet vóór deze ronde; op de code van ervoor faalt dit
 * bestand bij het importeren. Zijn woorden: "links komen dan de favorieten en rechts moet een soort info scherm komen met
 * weer en belangrijke dingen".
 *
 * NIEUW GEDRAG in 0.115.0: melders en batterijen alleen als ze gekozen zijn ("ik wil dat je alles moet kiezen in de GUI
 * editor"), en de agenda een instelbaar aantal dagen vooruit, standaard een week. Die tests falen op 0.114.1.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  AGENDA_DAGEN,
  alarmen,
  batterijenLeeg,
  beperk,
  groet,
  komendeAfspraken,
  afspraakWanneer,
  openWoord,
  regels,
  staatOpen,
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
  const melders = ["binary_sensor.rook_keuken", "binary_sensor.lek_wasmachine", "binary_sensor.rook_zolder", "alarm_control_panel.huis", "alarm_control_panel.schuur"];

  it("van de gekozen melders wat afgaat", () => {
    const states = huis(
      st("binary_sensor.rook_keuken", "on", { device_class: "smoke" }),
      st("binary_sensor.lek_wasmachine", "on", { device_class: "moisture" }),
      st("binary_sensor.rook_zolder", "off", { device_class: "smoke" }),
      st("binary_sensor.achterdeur", "on", { device_class: "door" }),
      st("alarm_control_panel.huis", "triggered"),
      st("alarm_control_panel.schuur", "armed_away")
    );
    assert.deepEqual(
      alarmen(states, melders).map((a) => [a.id, a.woord]),
      [
        ["alarm_control_panel.huis", "Alarm gaat af"],
        ["binary_sensor.lek_wasmachine", "Lekkage"],
        ["binary_sensor.rook_keuken", "Rook"],
      ]
    );
  });

  it("niets uit zichzelf: een melder die afgaat maar niet gekozen is, staat er niet", () => {
    const states = huis(st("binary_sensor.rook_keuken", "on", { device_class: "smoke" }), st("alarm_control_panel.huis", "triggered"));
    assert.deepEqual(alarmen(states, []), []);
    assert.deepEqual(alarmen(states, ["binary_sensor.rook_keuken", "binary_sensor.weg"]).map((a) => a.id), ["binary_sensor.rook_keuken"]);
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

describe("batterijenLeeg", () => {
  const states = huis(
    st("sensor.melder_badkamer_batterij", "8", { device_class: "battery", unit_of_measurement: "%" }),
    st("sensor.knop_gang_batterij", "4", { device_class: "battery", unit_of_measurement: "%" }),
    st("sensor.deur_batterij", "60", { device_class: "battery", unit_of_measurement: "%" }),
    st("sensor.telefoon_bram_batterij", "3", { device_class: "battery", unit_of_measurement: "%" }),
    st("sensor.kapot_batterij", "unavailable", { device_class: "battery", unit_of_measurement: "%" }),
    st("binary_sensor.slot_batterij", "on", { device_class: "battery" })
  );
  const gekozen = ["sensor.melder_badkamer_batterij", "sensor.knop_gang_batterij", "sensor.deur_batterij", "sensor.kapot_batterij", "binary_sensor.slot_batterij"];

  it("van de gekozen de leegste eerst, een melder zonder getal vooraan", () => {
    assert.deepEqual(
      batterijenLeeg(states, gekozen, 15).map((b) => [b.id, b.pct]),
      [
        ["binary_sensor.slot_batterij", null],
        ["sensor.knop_gang_batterij", 4],
        ["sensor.melder_badkamer_batterij", 8],
      ]
    );
  });

  it("niets uit zichzelf: een lege batterij die niet gekozen is, staat er niet", () => {
    assert.deepEqual(batterijenLeeg(states, [], 15), []);
    assert.deepEqual(batterijenLeeg(states, ["sensor.telefoon_bram_batterij"], 15).map((b) => b.id), ["sensor.telefoon_bram_batterij"]);
  });

  it("0 zet het uit", () => {
    assert.deepEqual(batterijenLeeg(states, gekozen, 0), []);
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

  it("standaard een week vooruit, op begintijd, een hele dag vooraan", () => {
    assert.equal(AGENDA_DAGEN, 7);
    assert.deepEqual(
      komendeAfspraken([...lijst, a("Over een week", new Date(2026, 10, 15, 9), new Date(2026, 10, 15, 10))], NU).map((x) => x.titel),
      ["Verjaardag", "Voetbal", "Eten", "Tandarts", "Overmorgen"]
    );
  });

  it("zoveel dagen als ingesteld: 2 is vandaag en morgen, 60 haalt een afspraak van weken later", () => {
    assert.deepEqual(komendeAfspraken(lijst, NU, 2).map((x) => x.titel), ["Verjaardag", "Voetbal", "Eten", "Tandarts"]);
    assert.deepEqual(komendeAfspraken(lijst, NU, 1).map((x) => x.titel), ["Verjaardag", "Voetbal", "Eten"]);
    const later = a("Kerstdiner", new Date(2026, 11, 17, 18), new Date(2026, 11, 17, 21));
    assert.deepEqual(komendeAfspraken([later], NU).map((x) => x.titel), []);
    assert.deepEqual(komendeAfspraken([later], NU, 60).map((x) => x.titel), ["Kerstdiner"]);
  });

  it("zegt wanneer", () => {
    const [verjaardag, voetbal, eten, tandarts, overmorgen] = komendeAfspraken(lijst, NU);
    assert.equal(afspraakWanneer(overmorgen, NU), "overmorgen 09:00");
    assert.equal(afspraakWanneer(a("Kerstdiner", new Date(2026, 11, 17, 18), new Date(2026, 11, 17, 21)), NU), "do 17 dec 18:00");
    assert.equal(afspraakWanneer(verjaardag, NU), "vandaag");
    assert.equal(afspraakWanneer(voetbal, NU), "nu, tot 15:00");
    assert.equal(afspraakWanneer(eten, NU), "18:00");
    assert.equal(afspraakWanneer(tandarts, NU), "morgen 09:00");
  });
});

describe("beperk", () => {
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
  });

  it("in de volgorde van de urgentie", () => {
    const uit = regels({
      nu: NU,
      naamVan,
      alarmen: [{ id: "binary_sensor.rook_keuken", woord: "Rook", icoon: "smoke" }],
      open: [st("lock.voordeur", "unlocked")],
      afspraken: [{ titel: "Tandarts", start: new Date(2026, 10, 9, 9), eind: new Date(2026, 10, 9, 10), heleDag: false, agenda: "calendar.gezin" }],
      batterijen: [{ id: "sensor.knop", pct: 4 }],
    });
    assert.deepEqual(
      uit.map((r) => [r.soort, r.toon, r.tekst, r.bij ?? null]),
      [
        ["alarm", "bad", "Rookmelder keuken", "Rook"],
        ["open", "warn", "Voordeur", "niet op slot"],
        ["agenda", "accent", "Tandarts", "morgen 09:00"],
        ["batterij", "warn", "sensor.knop", "4%"],
      ]
    );
    assert.equal(uit.find((r) => r.soort === "agenda").entity, "calendar.gezin");
  });

  it("afval, lampen en wie er thuis is staan er niet op, ook niet als ze worden meegegeven", () => {
    // NIEUW GEDRAG in 0.113.0: de eigenaar heeft die al op een eigen kaart of badge. Faalt op 0.112.0.
    const uit = regels({
      nu: NU,
      afval: [{ id: "sensor.gft", naam: "GFT", datum: new Date(2026, 10, 9), dagen: 1 }],
      lampen: 3,
      thuis: ["Bram"],
    });
    assert.deepEqual(uit, []);
  });
});
