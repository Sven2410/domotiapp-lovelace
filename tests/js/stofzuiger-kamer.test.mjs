/**
 * De robotstofzuiger voor één kamer: de kamer op naam en kaart, nooit op een
 * kaal nummer, en geen stille vervanging van een lopende beurt.
 *
 * De vaste invoer is de echte stand van twee Dreames bij een klant op
 * 27 november 2026, met een kamerbeurt erin (geanonimiseerd).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  beurtKamers,
  beurtLoopt,
  gewensteKamers,
  kamerBeurt,
  kamerDoel,
  kamerKnop,
  kamerNamen,
  kaartenVan,
  nogGeldig,
} from "../../src/cards/stofzuiger-kamer-logica.js";

const dump = JSON.parse(readFileSync(new URL("./vaste-invoer/dreame-kamers-meerdere-kaarten.json", import.meta.url)));

/** Een toestand zoals in `hass.states`, uit een regel van de dump. */
const alsToestand = (entity_id, regel, rooms) => {
  const { state, ...attributes } = regel;
  return { entity_id, state, attributes: { rooms, ...attributes } };
};
const X50 = "vacuum.x50_ultra_complete";
const BOVEN = "vacuum.dreame_boven";
const x50 = (extra = {}) => ({ ...alsToestand(X50, dump.nu[X50]), ...extra });
const boven = () => alsToestand(BOVEN, dump.nu[BOVEN]);
const metAttr = (st, attrs, state = st.state) => ({ ...st, state, attributes: { ...st.attributes, ...attrs } });
const MET = { segmentDienst: true };

describe("de kamer op naam en kaart", () => {
  it("NIEUW GEDRAG: de echte X50 met drie kaarten: Kitchen op de begane grond is 13", () => {
    assert.deepEqual(Object.keys(kaartenVan(x50())), ["Begane grond", "Map 2", "Map 3"]);
    const d = kamerDoel(x50(), { kaart: "Begane grond", kamers: ["Kitchen"] }, MET);
    assert.equal(d.ok, true);
    assert.deepEqual(d.kamers, [{ id: 13, naam: "Kitchen" }]);
  });

  it("NIEUW GEDRAG: hetzelfde nummer op een andere kaart is een andere kamer, en dan staat de knop uit", () => {
    // Office is 2 op de begane grond; op Map 2 is 2 "Room 2".
    const opMap2 = metAttr(x50(), { selected_map: "Map 2" });
    const d = kamerDoel(opMap2, { kaart: "Begane grond", kamers: [{ naam: "Office", id: 2 }] }, MET);
    assert.equal(d.ok, false);
    assert.equal(d.ernstig, false);
    assert.match(d.reden, /andere kaart \(Map 2\)/);
    assert.deepEqual(d.kamers, []);
  });

  it("NIEUW GEDRAG: een hernoemde kamer start niets, en het nummer zegt alleen wie er nu staat", () => {
    const rooms = structuredClone(x50().attributes.rooms);
    rooms["Begane grond"].find((r) => r.id === 2).name = "Werkkamer";
    const d = kamerDoel(metAttr(x50(), { rooms }), { kaart: "Begane grond", kamers: [{ naam: "Office", id: 2 }] }, MET);
    assert.equal(d.ok, false);
    assert.equal(d.ernstig, true);
    assert.match(d.reden, /Office staat niet meer op de kaart; nummer 2 is nu Werkkamer/);
  });

  it("NIEUW GEDRAG: nummers die verschuiven: de naam wint, niet de hint", () => {
    const rooms = structuredClone(x50().attributes.rooms);
    for (const r of rooms["Begane grond"]) r.id += 20;
    const d = kamerDoel(metAttr(x50(), { rooms }), { kaart: "Begane grond", kamers: [{ naam: "Kitchen", id: 13 }] }, MET);
    assert.deepEqual(d.kamers, [{ id: 33, naam: "Kitchen" }]);
  });

  it("NIEUW GEDRAG: een naam die twee keer op de kaart staat start niets", () => {
    const rooms = structuredClone(x50().attributes.rooms);
    rooms["Begane grond"].push({ id: 40, name: "kitchen " });
    const d = kamerDoel(metAttr(x50(), { rooms }), { kaart: "Begane grond", kamers: ["Kitchen"] }, MET);
    assert.equal(d.ok, false);
    assert.match(d.reden, /2 keer/);
  });

  it("NIEUW GEDRAG: twee kamers in één kaart, en allebei moeten kloppen", () => {
    const goed = kamerDoel(boven(), { kaart: "Map 1", kamers: ["Anna", "Bathroom Anna"] }, MET);
    assert.deepEqual(goed.kamers, [{ id: 7, naam: "Anna" }, { id: 6, naam: "Bathroom Anna" }]);
    const half = kamerDoel(boven(), { kaart: "Map 1", kamers: ["Anna", "Bathroom Zolder"] }, MET);
    assert.equal(half.ok, false);
    assert.deepEqual(half.kamers, []);
  });

  it("NIEUW GEDRAG: zonder kaart, met een kaart die weg is, zonder selected_map, zonder dienst of onbereikbaar: niets", () => {
    const geval = (st, config, opties = MET) => kamerDoel(st, config, opties);
    assert.match(geval(x50(), { kamers: ["Kitchen"] }).reden, /Kies in de editor een kaart/);
    assert.match(geval(x50(), { kaart: "Zolder", kamers: ["Kitchen"] }).reden, /Kaart Zolder bestaat niet meer/);
    assert.match(geval(metAttr(x50(), { selected_map: null }), { kaart: "Begane grond", kamers: ["Kitchen"] }).reden, /niet op welke kaart/);
    assert.match(geval(x50(), { kaart: "Begane grond", kamers: ["Kitchen"] }, {}).reden, /geen losse kamers/);
    assert.match(geval({ ...x50(), state: "unavailable" }, { kaart: "Begane grond", kamers: ["Kitchen"] }).reden, /Niet bereikbaar/);
    assert.match(geval(x50(), { kaart: "Begane grond" }).reden, /Kies in de editor een kamer/);
    for (const g of [geval(x50(), { kamers: ["Kitchen"] }), geval(x50(), { kaart: "Zolder", kamers: ["Kitchen"] })]) assert.deepEqual(g.kamers, []);
  });

  it("NIEUW GEDRAG: een robot met een kale lijst kent geen kaarten", () => {
    const st = { entity_id: "vacuum.ander", state: "docked", attributes: { rooms: [{ id: 3, name: "Hal" }] } };
    assert.deepEqual(kamerDoel(st, { kamers: ["Hal"] }, MET).kamers, [{ id: 3, naam: "Hal" }]);
    assert.equal(kamerDoel(st, { kaart: "Begane grond", kamers: ["Hal"] }, MET).ok, false);
  });

  it("NIEUW GEDRAG: de config: tekst, {naam, id} en `kamer`, zonder dubbele", () => {
    assert.deepEqual(gewensteKamers({ kamers: ["Keuken", { naam: "Hal", id: "4" }, "keuken", ""] }), [
      { naam: "Keuken", id: null },
      { naam: "Hal", id: 4 },
    ]);
    assert.deepEqual(gewensteKamers({ kamer: "Keuken" }), [{ naam: "Keuken", id: null }]);
    assert.equal(kamerNamen(["Keuken"]), "Keuken");
    assert.equal(kamerNamen([{ naam: "Anna" }, { naam: "Bad" }]), "Anna en Bad");
  });
});

describe("loopt er een beurt", () => {
  it("NIEUW GEDRAG: de echte kamerbeurt, ook als hij tussendoor in het station de pads wast", () => {
    const rooms = dump.nu[X50].rooms;
    const verloop = dump.geschiedenis_kamerbeurt.map((r) => [r.tijd.slice(11, 19), r.state, beurtLoopt(alsToestand(X50, r, rooms))]);
    assert.deepEqual(verloop, [
      ["06:00:00", "docked", false],
      ["08:00:03", "cleaning", true],
      ["08:22:52", "returning", true],
      ["08:23:53", "cleaning", true],
      ["08:26:18", "docked", true], // de pads wassen, midden in de beurt
      ["08:26:19", "cleaning", true],
      ["08:47:02", "returning", true],
      ["08:48:10", "docked", false],
      ["08:48:35", "cleaning", true], // het station maakt schoon: voorzichtig, telt als bezig
      ["08:50:13", "docked", false],
    ]);
    const wassen = alsToestand(X50, dump.geschiedenis_kamerbeurt[4], rooms);
    assert.deepEqual([...beurtKamers(wassen)], [15]);
  });

  it("NIEUW GEDRAG: de tweede echte proef: rijden met running false, en gepauzeerd in het station is nog een beurt", () => {
    // Zoals gemeten op 27 november 2026, segment 12, daarna een stop.
    const rijdt = metAttr(x50(), { status: "room_cleaning", active_segments: [12], segment_cleaning: true, running: false }, "cleaning");
    const pauzeInStation = metAttr(x50(), { status: "charging", active_segments: [12], segment_cleaning: true, running: false }, "paused");
    const naStop = metAttr(x50(), { status: "charging", active_segments: null, segment_cleaning: false, task_type: 0 }, "docked");
    assert.deepEqual([rijdt, pauzeInStation, naStop].map(beurtLoopt), [true, true, false]);
    const toilet = kamerDoel(pauzeInStation, { kaart: "Begane grond", kamers: ["Social toilet"] }, MET);
    assert.deepEqual(kamerBeurt(pauzeInStation, toilet), { soort: "hier", pauze: true, waar: "" });
    // Alleen een vlag, zonder segmenten en in het station: ook een beurt.
    for (const vlag of ["started", "running", "paused", "segment_cleaning"]) assert.equal(beurtLoopt(metAttr(x50(), { [vlag]: true })), true, vlag);
  });

  it("NIEUW GEDRAG: na de beurt blijft current_segment staan, en dat is geen beurt", () => {
    // In de echte stand 'nu' staat hij in het station met current_segment 15.
    assert.equal(x50().attributes.current_segment, 15);
    assert.equal(beurtLoopt(x50()), false);
    assert.deepEqual([...beurtKamers(x50())], []);
  });

  it("NIEUW GEDRAG: de live kamerbeurt: hier in de eetkamer, elders in de keuken", () => {
    const live = alsToestand(X50, dump.live_tijdens_kamerbeurt, dump.nu[X50].rooms);
    const eet = kamerDoel(live, { kaart: "Begane grond", kamers: ["Dining Room"] }, MET);
    assert.deepEqual(kamerBeurt(live, eet), { soort: "hier", pauze: false, waar: "" });
    const keuken = kamerDoel(live, { kaart: "Begane grond", kamers: ["Kitchen"] }, MET);
    assert.deepEqual(kamerBeurt(live, keuken), { soort: "elders", pauze: false, waar: "Dining Room" });
  });

  it("NIEUW GEDRAG: een nummer op een andere kaart is nooit 'hier'", () => {
    // Hij doet segment 2 op Map 2 (Room 2); de kamerkaart van Office (2, begane grond) is niet bezig.
    const st = metAttr(x50(), { selected_map: "Map 2", active_segments: [2], started: true }, "cleaning");
    const office = kamerDoel(st, { kaart: "Begane grond", kamers: ["Office"] }, MET);
    assert.equal(kamerBeurt(st, office).soort, "elders");
    assert.equal(kamerBeurt(st, office).waar, "Room 2");
  });
});

describe("de knop", () => {
  const opties = { robot: "X50", namen: "Kitchen" };

  it("NIEUW GEDRAG: vrij: starten met het nummer van de naam, en altijd eerst een vraag", () => {
    const st = x50();
    const d = kamerDoel(st, { kaart: "Begane grond", kamers: ["Kitchen"] }, MET);
    const k = kamerKnop(st, d, kamerBeurt(st, d), opties);
    assert.equal(k.uit, false);
    assert.deepEqual(k.oproep, ["dreame_vacuum", "vacuum_clean_segment", { entity_id: X50, segments: [13] }]);
    assert.equal(k.vraag.confirmText, "Starten");
  });

  it("NIEUW GEDRAG: een beurt elders wordt niet stil vervangen: de vraag zegt dat hij afbreekt", () => {
    const live = alsToestand(X50, dump.live_tijdens_kamerbeurt, dump.nu[X50].rooms);
    const d = kamerDoel(live, { kaart: "Begane grond", kamers: ["Kitchen"] }, MET);
    const k = kamerKnop(live, d, kamerBeurt(live, d), opties);
    assert.equal(k.vraag.title, "Lopende beurt afbreken?");
    assert.match(k.vraag.text, /bezig in Dining Room/);
    assert.equal(k.vraag.confirmText, "Afbreken en starten");
  });

  it("NIEUW GEDRAG: bezig hier: pauzeren, gepauzeerd hier: hervatten", () => {
    const live = alsToestand(X50, dump.live_tijdens_kamerbeurt, dump.nu[X50].rooms);
    const d = kamerDoel(live, { kaart: "Begane grond", kamers: ["Dining Room"] }, MET);
    assert.equal(kamerKnop(live, d, kamerBeurt(live, d), opties).rol, "pauze");
    const pauze = metAttr(live, { paused: true }, "paused");
    assert.equal(kamerKnop(pauze, d, kamerBeurt(pauze, d), opties).rol, "hervat");
  });

  it("NIEUW GEDRAG: een doel dat niet klopt geeft een knop die uit staat en geen oproep", () => {
    const st = metAttr(x50(), { selected_map: "Map 2" });
    const d = kamerDoel(st, { kaart: "Begane grond", kamers: ["Kitchen"] }, MET);
    const k = kamerKnop(st, d, kamerBeurt(st, d), opties);
    assert.equal(k.uit, true);
    assert.equal(k.oproep, null);
  });

  it("NIEUW GEDRAG: na de vraag alleen door als er niets veranderde", () => {
    const config = { kaart: "Begane grond", kamers: ["Kitchen"] };
    const knop = (st) => {
      const d = kamerDoel(st, config, MET);
      return kamerKnop(st, d, kamerBeurt(st, d), opties);
    };
    const eerder = knop(x50());
    assert.equal(nogGeldig(eerder, knop(x50())), true);
    // Van kaart gewisseld terwijl de vraag openstond.
    assert.equal(nogGeldig(eerder, knop(metAttr(x50(), { selected_map: "Map 2" }))), false);
    // Een beurt begonnen terwijl de vraag openstond: dan was het de verkeerde vraag.
    assert.equal(nogGeldig(eerder, knop(metAttr(x50(), { active_segments: [15], started: true }, "cleaning"))), false);
    // De nummers verschoven terwijl de vraag openstond.
    const rooms = structuredClone(x50().attributes.rooms);
    for (const r of rooms["Begane grond"]) r.id += 20;
    assert.equal(nogGeldig(eerder, knop(metAttr(x50(), { rooms }))), false);
  });
});
