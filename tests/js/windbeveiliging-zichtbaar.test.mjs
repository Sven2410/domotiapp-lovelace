/**
 * De windbeveiliging op de automatiseringskaart (0.132.0). De eigenaar zag zijn zonneschermen bij een windstoot omlaag gaan
 * en wist niet waarom: de beveiliging stond alleen in de editor. Zie de kop van `automatisering/wind.py`.
 *
 * NIEUW GEDRAG, behalve wat met REGRESSIEWACHT begint.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as L from "../../src/cards/automatisering-logica.js";
import { _reset } from "../../src/taal.js";

const SENSOR = "sensor.weerstation_windstoten";
const meting = (state, unit = "m/s") => ({ state: String(state), attributes: { unit_of_measurement: unit } });
const WIND = {
  sensor: SENSOR,
  max: 30,
  schermen: ["cover.keuken", "cover.woonkamer"],
  laatst: null,
};
const namen = { [SENSOR]: "Windstoten", "cover.keuken": "Keuken", "cover.woonkamer": "Woonkamer" };
const naamVan = (id) => namen[id] ?? id;
const NU = new Date(2026, 10, 17, 16, 0);

describe("de wind in km/h", () => {
  it("rekent om zoals de server", () => {
    assert.equal(L.windKmh(meting(10)), 36);
    assert.equal(L.windKmh(meting(25, "km/h")), 25);
    assert.ok(Math.abs(L.windKmh(meting(10, "kn")) - 18.52) < 1e-9);
  });

  it("geeft null zonder bruikbare meting", () => {
    for (const s of [undefined, meting("unavailable"), meting("unknown"), meting(""), meting(-1), meting(2, "mm/h"), { state: "2", attributes: {} }, meting(3, "Beaufort")]) {
      assert.equal(L.windKmh(s), null, JSON.stringify(s));
    }
  });
});

describe("het blok Windbeveiliging", () => {
  it("is er niet zonder zonneschermen", () => {
    assert.equal(L.windBlok(null, {}), null);
    assert.equal(L.windBlok({ ...WIND, schermen: [] }, {}), null);
  });

  it("zegt de wind, de grens, de sensor en de schermen", () => {
    _reset({ instelling: "nl" });
    const b = L.windBlok(WIND, { [SENSOR]: meting(3.3) }, naamVan, NU);
    assert.equal(b.soort, "rustig");
    assert.equal(b.kop, "Wind 12 km/h");
    assert.equal(b.uitleg, "Boven 30 km/h gaan de zonneschermen in en rollen ze niet uit.");
    assert.deepEqual(b.regels, ["Sensor: Windstoten", "Schermen: Keuken, Woonkamer", "Nog niet ingegrepen"]);
  });

  it("zegt het als het te hard waait", () => {
    _reset({ instelling: "nl" });
    const b = L.windBlok(WIND, { [SENSOR]: meting(11.4) }, naamVan, NU);
    assert.equal(b.soort, "te_hard");
    assert.equal(b.kop, "Wind 41 km/h: te hard");
    assert.equal(b.uitleg, "Boven 30 km/h rollen de zonneschermen niet uit.");
  });

  it("zegt het zonder meting en zonder sensor", () => {
    _reset({ instelling: "nl" });
    const geen = L.windBlok(WIND, { [SENSOR]: meting("unavailable") }, naamVan, NU);
    assert.equal(geen.soort, "geen_meting");
    assert.equal(geen.kop, "Geen windmeting");
    const zonder = L.windBlok({ ...WIND, sensor: null }, {}, naamVan, NU);
    assert.equal(zonder.soort, "geen_sensor");
    assert.equal(zonder.uitleg, "De zonneschermen hebben geen windgrens.");
    assert.deepEqual(zonder.regels, ["Schermen: Keuken, Woonkamer"]);
  });

  it("zegt wanneer hij voor het laatst ingreep", () => {
    _reset({ instelling: "nl" });
    const op = new Date(2026, 10, 17, 14, 40).toISOString();
    const in_ = L.windBlok({ ...WIND, laatst: { op, kmh: 41.04, wat: "ingetrokken", schermen: [] } }, { [SENSOR]: meting(2) }, naamVan, NU);
    assert.equal(in_.regels.at(-1), "Laatst ingetrokken: vandaag 14:40, bij 41 km/h");
    const gisteren = new Date(2026, 10, 16, 12, 0).toISOString();
    const tegen = L.windBlok({ ...WIND, laatst: { op: gisteren, kmh: null, wat: "niet_uitgerold", schermen: [] } }, { [SENSOR]: meting(2) }, naamVan, NU);
    assert.equal(tegen.regels.at(-1), "Laatst tegengehouden: gisteren 12:00, zonder windmeting");
  });

  it("spreekt Engels", () => {
    _reset({ instelling: "en" });
    const b = L.windBlok(WIND, { [SENSOR]: meting(11.4) }, naamVan, NU);
    assert.equal(b.kop, "Wind 41 km/h: too strong");
    assert.deepEqual(b.regels, ["Sensor: Windstoten", "Awnings: Keuken, Woonkamer", "Has not stepped in yet"]);
    _reset({ instelling: "nl" });
  });
});

describe("de waarschuwing in de editor", () => {
  const states = {
    "cover.knikarm": { state: "open", attributes: { device_class: "blind" } },
    "cover.zonder": { state: "open", attributes: {} },
    "cover.awning": { state: "open", attributes: { device_class: "awning" } },
    "cover.al_om": { state: "open", attributes: { device_class: "blind" } },
  };

  it("noemt de schermen die zich niet als zonnescherm melden en niet omgekeerd staan", () => {
    assert.deepEqual(
      L.verdachteSchermen([{ entity: "cover.knikarm", name: "Keuken" }, "cover.zonder", "cover.awning", "cover.al_om", "cover.weg"], ["cover.al_om"], states),
      ["cover.knikarm", "cover.zonder"]
    );
    assert.deepEqual(L.verdachteSchermen(undefined, undefined, states), []);
  });
});

describe("de kaart en de editor", () => {
  const bron = readFileSync(new URL("../../src/cards/automatisering-card.js", import.meta.url), "utf8");

  it("de kaart tekent het blok uit de stand, en kijkt naar de windsensor", () => {
    assert.match(bron, /class="wind" hidden/);
    assert.match(bron, /this\.tekenWind_\(stand\.wind\)/);
    assert.match(bron, /this\.stand_\?\.wind\?\.sensor/);
  });

  it("REGRESSIEWACHT: de editor biedt Motor omgekeerd ook voor zonneschermen aan", () => {
    assert.match(bron, /const rolluiken = \[\.\.\.\(this\.config_\?\.rolluiken \?\? \[\]\), \.\.\.\(this\.config_\?\.zonneschermen \?\? \[\]\)\]/);
  });

  it("de uitleg bij Motor omgekeerd noemt zonneschermen en waarschuwt", () => {
    assert.match(bron, /omgekeerd: this\.omgekeerdUitleg_\(\)/);
    assert.match(bron, /verdachteSchermen\(this\.config_\?\.zonneschermen/);
  });
});
