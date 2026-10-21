/**
 * De printerkaart (papier) tegen de dump van een HP OfficeJet Pro 9730e via IPP.
 *
 * NIEUW GEDRAG: `kantoorprinter-logica.js` bestond niet vóór 0.84.0
 * (21 oktober 2026). Bewaakt wordt wat op een dashboard stil misgaat: een
 * patroon dat de verkeerde kleur krijgt of wegvalt, een teller die niet
 * gevonden wordt, en "bijna op" dat niet verschijnt.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, describe, it } from "node:test";

import { inktKleur, inktStanden, printerDelen, printerMelding, printerStand } from "../../src/cards/kantoorprinter-logica.js";
import { _reset } from "../../src/taal.js";

const DUMP = JSON.parse(readFileSync(new URL("./vaste-invoer/ipp-hp-officejet-pro-9730e.json", import.meta.url), "utf8"));
const P = "sensor.hp_officejet_pro_9730e_series";

/** Een hass zoals Home Assistant hem geeft: states, entities en devices. */
function hassUit(dump, extra = {}) {
  const states = {};
  const entities = {};
  for (const s of dump.states) {
    const { translation_key, entity_category, ...st } = s;
    states[s.entity_id] = st;
    entities[s.entity_id] = { entity_id: s.entity_id, device_id: "printer", translation_key, entity_category };
  }
  return { states: { ...states, ...extra.states }, entities: { ...entities, ...extra.entities }, devices: { printer: dump.device } };
}

const stand = (hass) => {
  const d = printerDelen(hass, P);
  const st = (id) => hass.states[id];
  return printerStand(st(P), { patronen: d.patronen.map(st), totaal: st(d.totaal), zwartwit: st(d.zwartwit), kleur: st(d.kleur) }, hass.devices.printer.name);
};

afterEach(() => _reset());

describe("printerkaart: de dump van een HP OfficeJet Pro 9730e (IPP)", () => {
  it("vindt de vier patronen en de drie tellers bij hetzelfde apparaat", () => {
    const d = printerDelen(hassUit(DUMP), P);
    assert.equal(d.patronen.length, 4);
    assert.equal(d.totaal, `${P}_impressions_completed`);
    assert.equal(d.zwartwit, `${P}_monochrome_impressions_completed`);
    assert.equal(d.kleur, `${P}_color_impressions_completed`);
  });

  it("de patronen in de vaste volgorde, met hun kleur en procent", () => {
    _reset({ instelling: "nl" });
    const s = stand(hassUit(DUMP));
    assert.deepEqual(
      s.inkt.map((i) => [i.label, i.procent, i.laag]),
      [["Zwart", 30, false], ["Cyaan", 50, false], ["Magenta", 50, false], ["Geel", 60, false]],
    );
    assert.equal(s.afdrukken, 994);
    assert.equal(s.zwartwit, 199);
    assert.equal(s.kleur, 795);
    assert.deepEqual(printerMelding(s), { regels: ["Klaar voor gebruik"], tone: "neutral" });
  });

  it("in het Engels", () => {
    _reset({ instelling: "en" });
    const s = stand(hassUit(DUMP));
    assert.deepEqual(s.inkt.map((i) => i.label), ["Black", "Cyan", "Magenta", "Yellow"]);
    assert.deepEqual(printerMelding(s).regels, ["Ready"]);
  });

  it("op of onder marker_low_level is bijna op, en de chip let op", () => {
    _reset({ instelling: "nl" });
    const zwart = DUMP.states.find((s) => s.entity_id === `${P}_black_cartridge`);
    const hass = hassUit(DUMP, { states: { [zwart.entity_id]: { ...zwart, state: "20" } } });
    const s = stand(hass);
    assert.equal(s.inkt[0].laag, true);
    assert.deepEqual(printerMelding(s), { regels: ["Klaar voor gebruik", "Zwart bijna op"], tone: "warn" });
  });

  it("gestopt is rood, met wat de printer er zelf over zegt", () => {
    _reset({ instelling: "nl" });
    const p = DUMP.states[0];
    const hass = hassUit(DUMP, { states: { [P]: { ...p, state: "stopped", attributes: { ...p.attributes, state_message: "Media Empty" } } } });
    assert.deepEqual(printerMelding(stand(hass)), { regels: ["Gestopt · Media Empty"], tone: "bad" });
  });

  it("een uitgeschakelde of onbereikbare printer", () => {
    _reset({ instelling: "nl" });
    const p = DUMP.states[0];
    const hass = hassUit(DUMP, { states: { [P]: { ...p, state: "unavailable" } } });
    assert.equal(stand(hass), null);
    assert.deepEqual(printerMelding(null), { regels: ["Niet bereikbaar"], tone: "neutral" });
  });
});

describe("andere printers: andere patronen", () => {
  it("een laserprinter, een fotozwart en een lichte cyaan", () => {
    assert.equal(inktKleur("black toner")?.sleutel, "zwart");
    assert.equal(inktKleur("Photo Black ink")?.sleutel, "fotozwart");
    assert.equal(inktKleur("", "sensor.epson_light_cyan_ink")?.sleutel, "lichtcyaan");
    assert.equal(inktKleur("", "sensor.epson_cyan_ink")?.sleutel, "cyaan");
    assert.equal(inktKleur("waste ink box"), null);
  });

  it("een onbekend patroon komt achteraan, met zijn eigen naam en zonder kleur", () => {
    _reset({ instelling: "nl" });
    const st = (id, naam, w) => ({ entity_id: id, state: String(w), attributes: { friendly_name: `Epson ${naam}`, marker_low_level: 10 } });
    const lijst = inktStanden([st("sensor.e_waste", "Waste ink box", 80), st("sensor.e_yellow", "Yellow ink", 5), st("sensor.e_black", "Black ink", "unknown")], "Epson");
    assert.deepEqual(
      lijst.map((i) => [i.label, i.procent, i.laag, Boolean(i.kleur)]),
      [["Zwart", null, false, true], ["Geel", 5, true, true], ["Waste ink box", 80, false, false]],
    );
  });
});

// NIEUW GEDRAG (0.84.2): zonder grid_options kwam de kaart bij een klant op de
// halve breedte van een pop-up, en vier patronen passen dan alleen als getal.
describe("printerkaart: standaardbreedte", () => {
  it("volle breedte, zoals de andere kaarten met een rij tegels", () => {
    const bron = readFileSync(new URL("../../src/cards/kantoorprinter-card.js", import.meta.url), "utf8");
    assert.match(bron.match(/getGridOptions\(\) \{[\s\S]*?\}/)[0], /columns: 12,/);
  });
});
