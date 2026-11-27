/**
 * De berichten van de auto (0.141.0), uit de echte dump van FordPass (`vaste-invoer/fordpass-berichten.json`): live
 * met `json_src` (de eerste 6 van 8), uit de recorder met alleen de platte `msgNNN_`, en na het wissen. VIN en
 * messageId zijn vervangen, de rest is echt. Alles **NIEUW GEDRAG**: `auto-berichten.js` bestaat op 0.140.1 niet.
 * Het versturen staat aan de serverkant (tests/meldingen/test_auto.py).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as A from "../../src/cards/auto-berichten.js";
import { autoRegel, autosUit, soortenVan } from "../../src/cards/meldingen-logica.js";

const DUMP = JSON.parse(readFileSync(new URL("./vaste-invoer/fordpass-berichten.json", import.meta.url), "utf8"));
const SENSOR = DUMP.live_8.entity_id;
const KNOP = DUMP.knop_alles.entity_id;
const AUTO_PY = readFileSync(new URL("../../custom_components/domotiapp_lovelace/meldingen/auto.py", import.meta.url), "utf8");

/** Een `hass` met de auto als apparaat, zoals FordPass hem zet. De uitgeschakelde knop staat niet in `entities`. */
function hassMet(toestand, { platform = "fordpass", knop = true } = {}) {
  const ent = (entity_id, translation_key) => ({ entity_id, translation_key, platform, device_id: "bus" });
  return {
    entities: {
      [SENSOR]: ent(SENSOR, DUMP.sensor_register.translation_key),
      ...(knop ? { [KNOP]: ent(KNOP, DUMP.knop_alles_register.translation_key) } : {}),
      "sensor.fordpass_voorbeeld_odometer": ent("sensor.fordpass_voorbeeld_odometer", "odometer"),
      "button.ander_apparaat": { entity_id: "button.ander_apparaat", translation_key: "msgdeleteall", platform, device_id: "ander" },
    },
    states: { [SENSOR]: { entity_id: SENSOR, ...toestand }, ...(knop ? { [KNOP]: DUMP.knop_alles } : {}) },
  };
}

describe("FordPass: de twee vormen", () => {
  it("live met json_src: 6 berichten, de nieuwste eerst, met gelezen", () => {
    const b = A.berichtenVan(hassMet(DUMP.live_8), SENSOR);
    assert.equal(b.length, 6);
    assert.equal(b[0].onderwerp, "Waarschuwing controlesysteem bandenspanning");
    assert.equal(b[0].datum, Date.UTC(2026, 10, 10, 6, 50, 4));
    assert.equal(b[0].gelezen, false);
    assert.match(b[0].tekst, /^Het Controlesysteem Bandenspanning/);
    assert.ok(b.every((x, i) => i === 0 || b[i - 1].datum >= x.datum));
  });

  it("uit de recorder alleen plat: 8, en de sleutels zijn dezelfde als live", () => {
    const plat = A.berichtenVan(hassMet(DUMP.geschiedenis_8), SENSOR);
    const live = A.berichtenVan(hassMet(DUMP.live_8), SENSOR);
    assert.equal(plat.length, 8);
    assert.deepEqual(plat.slice(0, 6).map((x) => x.sleutel), live.map((x) => x.sleutel));
    assert.equal(plat[1].datum, Date.UTC(2026, 10, 8, 21, 44, 53));
    assert.equal(plat[0].gelezen, null);
  });

  it("na het wissen geen berichten, bij een herstart niets te zeggen", () => {
    assert.deepEqual(A.berichtenVan(hassMet(DUMP.nu_0), SENSOR), []);
    assert.equal(A.aantalVan(hassMet(DUMP.nu_0), SENSOR), 0);
    assert.equal(A.berichtenVan(hassMet(DUMP.herstart), SENSOR), null);
    assert.equal(A.aantalVan(hassMet(DUMP.herstart), SENSOR), null);
    // Een aantal zonder één leesbaar bericht: de attributen zijn er nog niet.
    assert.equal(A.berichtenVan(hassMet({ state: "8", attributes: {} }), SENSOR), null);
  });

  it("het aantal is de toestand: 8 bij live, ook al las de dump er 6", () => {
    assert.equal(A.aantalVan(hassMet(DUMP.live_8), SENSOR), 8);
  });
});

describe("per merk", () => {
  it("een merk dat we niet kennen: geen lijst en geen knop, wel het aantal", () => {
    const h = hassMet(DUMP.live_8, { platform: "iets_anders" });
    assert.equal(A.merkVan(h, SENSOR), null);
    assert.equal(A.berichtenVan(h, SENSOR), null);
    assert.equal(A.wisKnopVan(h, SENSOR), null);
    assert.equal(A.aantalVan(h, SENSOR), 8);
  });

  it("de wisknop: die van hetzelfde apparaat met de translation_key van het merk, of wat er ingevuld is", () => {
    assert.equal(A.wisKnopVan(hassMet(DUMP.live_8), SENSOR), KNOP);
    assert.equal(A.wisKnopVan(hassMet(DUMP.live_8, { knop: false }), SENSOR), null);
    const h = hassMet(DUMP.live_8);
    h.states["input_button.wis"] = { state: "unknown" };
    assert.equal(A.wisKnopVan(h, SENSOR, "input_button.wis"), "input_button.wis");
    assert.equal(A.wisKnopVan(h, SENSOR, "button.bestaat_niet"), null);
    assert.deepEqual(A.drukDienst(KNOP), ["button", "press"]);
    assert.deepEqual(A.drukDienst("input_button.wis"), ["input_button", "press"]);
    assert.equal(A.drukDienst("light.x"), null);
  });

  it("de naam is die van het apparaat, niet die van de sensor", () => {
    const h = hassMet(DUMP.live_8);
    h.entities[SENSOR].name = "Berichten";
    h.devices = { bus: { name: "Ford Transit Connect", name_by_user: "Bus" } };
    assert.equal(A.autoNaamVan(h, SENSOR), "Bus");
    delete h.devices.bus.name_by_user;
    assert.equal(A.autoNaamVan(h, SENSOR), "Ford Transit Connect");
    delete h.devices;
    assert.equal(A.autoNaamVan(h, SENSOR), SENSOR);
  });

  it("de editor stelt de berichtensensoren van bekende merken voor", () => {
    assert.deepEqual(A.berichtSensoren(hassMet(DUMP.live_8)), [SENSOR]);
    assert.deepEqual(A.berichtSensoren(hassMet(DUMP.live_8, { platform: "iets_anders" })), []);
  });

  it("MERKEN is aan beide kanten gelijk: platform, sensor en wisknop", () => {
    for (const [platform, merk] of Object.entries(A.MERKEN)) {
      const regel = AUTO_PY.match(new RegExp(`"${platform}": Merk\\("([^"]+)", _lees_\\w+, sensor="([^"]+)", wis_knop=(None|"([^"]+)")\\)`));
      assert.ok(regel, `${platform} staat niet in MERKEN van auto.py`);
      assert.equal(regel[1], merk.naam);
      assert.equal(regel[2], merk.sensor);
      assert.equal(regel[4] ?? null, merk.wisKnop ?? null);
    }
    const inPython = [...AUTO_PY.matchAll(/^ {4}"(\w+)": Merk\(/gm)].map((m) => m[1]);
    assert.deepEqual(inPython.sort(), Object.keys(A.MERKEN).sort());
  });
});

describe("datum en tekst", () => {
  it("fordDatum: maand eerst, AM en PM, en een onmogelijke datum", () => {
    assert.equal(A.fordDatum("12/01/2026 12:05:00 AM"), Date.UTC(2026, 11, 1, 0, 5));
    assert.equal(A.fordDatum("12/01/2026 12:05:00 PM"), Date.UTC(2026, 11, 1, 12, 5));
    assert.equal(A.fordDatum("02/30/2026 01:00:00 AM"), null);
    assert.equal(A.fordDatum("2026-11-10T06:50:04Z"), null);
  });

  it("platteTekst: zonder tags, met regeleindes, zoals platte_tekst aan de serverkant", () => {
    assert.equal(A.platteTekst("Het is tijd voor een <b>onderhoudsbeurt</b>.<br>Maak een afspraak."), "Het is tijd voor een onderhoudsbeurt.\nMaak een afspraak.");
    assert.equal(A.platteTekst("A &amp; B &#39;x&#39;"), "A & B 'x'");
  });
});

describe("de meldingenkaart", () => {
  it("Autoberichten is een soort, met de sensoren uit auto_berichten", () => {
    assert.deepEqual(soortenVan({ afval: false, auto: true }).map((s) => s.id), ["auto"]);
    assert.deepEqual(autosUit({ auto_berichten: [SENSOR, SENSOR, "light.x"] }), [SENSOR]);
    assert.deepEqual(autosUit({ auto_berichten: SENSOR }), [SENSOR]);
  });

  it("de regel in de pop-up", () => {
    assert.equal(autoRegel({ config: {}, stand: { bekend: true } }), "Nog geen auto gekozen");
    assert.equal(autoRegel({ config: { auto_berichten: [SENSOR] }, stand: { bekend: false } }), "Actief zodra het dashboard is opgeslagen");
    assert.equal(autoRegel({ config: { auto_berichten: [SENSOR] }, stand: { bekend: true }, namen: ["Bus"] }), "Bij elk nieuw bericht van Bus");
  });
});
