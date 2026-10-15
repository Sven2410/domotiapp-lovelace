/**
 * De robotstofzuigerkaart (15 oktober 2026), tegen de echte dumps van twee
 * Dreames bij een klant: een X50 Ultra Complete (dreame.vacuum.r5048h) en een
 * L40s Pro Ultra (dreame.vacuum.r9419h). Allebei met de HACS-integratie
 * `dreame_vacuum`, en allebei op het moment van uitlezen in het station: de X50
 * droogde zijn pads, de r9419h was opgeladen.
 *
 * NIEUW GEDRAG: stofzuiger-logica.js bestond niet vóór deze ronde. Tegen de
 * bron van daarvoor faalt dit bestand bij het importeren ("Cannot find
 * module").
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  AFBEELDINGEN_BASIS,
  STOFZUIGERS,
  actieveKamers,
  bedieningKnoppen,
  blokAan,
  cleanGeniusAan,
  duurTekst,
  kaartBeeld,
  kamersVan,
  keuzeRij,
  keuzeRijen,
  merkKeuzes,
  naamVan,
  onderhoudLijst,
  stationStand,
  stofzuigerAfbeelding,
  stofzuigerDelen,
  stofzuigerStand,
  typeBijApparaat,
  typeKeuzes,
  zuigkrachtVanStofzuiger,
} from "../../src/cards/stofzuiger-logica.js";

const lees = (naam) => JSON.parse(readFileSync(new URL(`./vaste-invoer/${naam}`, import.meta.url), "utf8"));
const x50 = lees("dreame-x50-ultra-complete.json");
const boven = lees("dreame-r9419h.json");
const X50 = "vacuum.x50_ultra_complete";
const BOVEN = "vacuum.dreame_boven";

/** Een kopie van de dump met een paar toestanden anders. */
function met(dump, wijzigingen) {
  const states = { ...dump.states };
  for (const [id, w] of Object.entries(wijzigingen)) {
    const oud = states[id];
    states[id] = { ...oud, ...w, attributes: { ...(oud?.attributes ?? {}), ...(w.attributes ?? {}) } };
  }
  return { ...dump, states };
}

/** Wat Home Assistant zou doen zonder vertaling: de sleutel terug. */
const zonderVertaling = (st, waarde) => waarde ?? st.state;

describe("stofzuigerDelen: de rest van het apparaat, op translation_key", () => {
  it("vindt bij de X50 alles wat de kaart toont", () => {
    const d = stofzuigerDelen(x50, X50);
    assert.equal(d.toestand, "sensor.x50_ultra_complete_state");
    assert.equal(d.fout, "sensor.x50_ultra_complete_error");
    assert.equal(d.batterij, "sensor.x50_ultra_complete_battery_level");
    assert.equal(d.laden, "binary_sensor.x50_ultra_complete_charging_state");
    assert.equal(d.kamerNu, "sensor.x50_ultra_complete_current_room");
    assert.equal(d.drogenVoortgang, "sensor.x50_ultra_complete_drying_progress");
    assert.equal(d.drogenRest, "sensor.x50_ultra_complete_drying_left");
    assert.equal(d.modus, "select.x50_ultra_complete_cleaning_mode");
    assert.equal(d.zuigkracht, "select.x50_ultra_complete_suction_level");
    assert.equal(d.vochtigheid, "select.x50_ultra_complete_mop_pad_humidity");
    assert.equal(d.wassenKnop, "button.x50_ultra_complete_self_clean");
    assert.equal(d.drogenKnop, "button.x50_ultra_complete_manual_drying");
    assert.equal(d.legenKnop, "button.x50_ultra_complete_start_auto_empty");
    assert.equal(d.schoonwater, "sensor.x50_ultra_complete_clean_water_tank_status");
    assert.equal(d.vuilwater, "sensor.x50_ultra_complete_dirty_water_tank_status");
    assert.equal(d.stofzak, "sensor.x50_ultra_complete_dust_bag_status");
  });

  it("de instellingen (de schakelaars, de taal, de laadgrens) komen er niet in", () => {
    const d = stofzuigerDelen(x50, X50);
    const gevonden = new Set(Object.values(d).filter((v) => typeof v === "string"));
    assert.ok(![...gevonden].some((id) => id.startsWith("switch.")), "geen enkele schakelaar");
    assert.ok(!gevonden.has("select.x50_ultra_complete_voice_assistant_language"));
    assert.ok(!gevonden.has("select.x50_ultra_complete_battery_charge_level"));
    assert.equal(d.cleangenius, "select.x50_ultra_complete_cleangenius");
  });

  it("neemt de LIVE kaart, niet een opgeslagen of de wifikaart", () => {
    assert.equal(stofzuigerDelen(x50, X50).kaart, "camera.x50_ultra_complete_map");
    assert.equal(stofzuigerDelen(boven, BOVEN).kaart, "camera.dreame_boven_map");
  });

  it("vindt bij de tweede Dreame hetzelfde, al heet alles anders", () => {
    const d = stofzuigerDelen(boven, BOVEN);
    assert.equal(d.toestand, "sensor.dreame_boven_state");
    assert.equal(d.batterij, "sensor.dreame_boven_battery_level");
    assert.equal(d.modus, "select.dreame_boven_cleaning_mode");
    assert.equal(d.wassenKnop, "button.dreame_boven_self_clean");
  });

  it("kiest de knop self_clean en niet de schakelaar met dezelfde sleutel", () => {
    assert.ok(x50.states["switch.x50_ultra_complete_self_clean"], "de dump heeft ook een switch self_clean");
    assert.equal(stofzuigerDelen(x50, X50).wassenKnop, "button.x50_ultra_complete_self_clean");
  });

  it("onderhoud: de zes onderdelen in procenten, op volgorde, met hun resttijd", () => {
    const d = stofzuigerDelen(x50, X50);
    assert.deepEqual(
      d.onderhoud.map((o) => o.tk),
      ["main_brush_left", "side_brush_left", "filter_left", "sensor_dirty_left", "wheel_dirty_left", "scale_inhibitor_left"],
    );
    assert.equal(d.restTijd.main_brush_left, "sensor.x50_ultra_complete_main_brush_time_left");
    // drying_left is een duur en geen onderdeel.
    assert.ok(!d.onderhoud.some((o) => o.tk === "drying_left"));
  });

  it("zonder apparaat: niets, en geen fout", () => {
    assert.deepEqual(stofzuigerDelen({ entities: {}, states: {} }, X50), { onderhoud: [], restTijd: {} });
    assert.deepEqual(stofzuigerDelen(undefined, X50), { onderhoud: [], restTijd: {} });
  });
});

describe("naamVan: niet de friendly_name met de dubbele naam", () => {
  it("X50: de naam van het apparaat", () => {
    assert.equal(x50.states[X50].attributes.friendly_name, "X50 Ultra Complete  X50 Ultra Complete");
    assert.equal(naamVan(x50, X50), "X50 Ultra Complete");
  });
  it("r9419h: de naam van het apparaat", () => {
    assert.equal(naamVan(boven, BOVEN), "dreame boven");
  });
  it("een ingevulde naam gaat voor", () => {
    assert.equal(naamVan(x50, X50, "Beneden"), "Beneden");
  });
});

describe("stofzuigerStand: de kop", () => {
  it("X50 in het station: de sensor zegt dat hij droogt, met voortgang en resttijd", () => {
    const s = stofzuigerStand(x50, X50, stofzuigerDelen(x50, X50), zonderVertaling);
    assert.equal(s.activiteit, "docked");
    assert.equal(s.tekst, "Droogt de dweilpads");
    assert.equal(s.detail, "33 % · nog 2 uur");
    assert.equal(s.batterij, 55);
    assert.equal(s.laadt, true);
    assert.equal(s.fout, "");
    assert.equal(s.soort, "stil");
  });

  it("r9419h opgeladen in het station, zonder detail", () => {
    const s = stofzuigerStand(boven, BOVEN, stofzuigerDelen(boven, BOVEN), zonderVertaling);
    assert.equal(s.tekst, "Opgeladen");
    assert.equal(s.detail, "");
    assert.equal(s.batterij, 100);
  });

  it("de batterij komt NIET uit battery_charge_level (dat is de laadgrens)", () => {
    const h = met(x50, { "sensor.x50_ultra_complete_battery_level": { state: "unavailable" } });
    const s = stofzuigerStand(h, X50, stofzuigerDelen(h, X50));
    assert.equal(h.states[X50].attributes.battery_charge_level, 100);
    assert.equal(s.batterij, 55, "valt terug op het attribuut battery");
  });

  it("bezig: de kamer en de voortgang", () => {
    const h = met(x50, {
      [X50]: { state: "cleaning" },
      "sensor.x50_ultra_complete_state": { state: "sweeping_and_mopping" },
      "sensor.x50_ultra_complete_cleaning_progress": { state: "45" },
    });
    const s = stofzuigerStand(h, X50, stofzuigerDelen(h, X50));
    assert.equal(s.tekst, "Zuigt en dweilt");
    assert.equal(s.detail, "Eetkamer · 45 %");
    assert.equal(s.soort, "schoon");
    assert.equal(s.bezig, true);
  });

  it("een fout blijft staan, met de beschrijving van de integratie", () => {
    const h = met(x50, {
      "sensor.x50_ultra_complete_error": { state: "main_brush_jammed", attributes: { description: "Hoofdborstel zit vast" } },
    });
    const s = stofzuigerStand(h, X50, stofzuigerDelen(h, X50));
    assert.equal(s.fout, "Hoofdborstel zit vast");
    assert.equal(s.soort, "storing");
  });

  it("no_error is geen fout, ook al heeft hij een beschrijving", () => {
    assert.equal(x50.states["sensor.x50_ultra_complete_error"].attributes.description, "Geen fout");
    assert.equal(stofzuigerStand(x50, X50, stofzuigerDelen(x50, X50)).fout, "");
  });

  it("een idle-sensor in het station zegt In het station, niet Staat stil", () => {
    const h = met(boven, { "sensor.dreame_boven_state": { state: "idle" } });
    assert.equal(stofzuigerStand(h, BOVEN, stofzuigerDelen(h, BOVEN)).tekst, "In het station");
  });

  it("een onbekende sensorwaarde: eerst Home Assistant, dan de sleutel als woorden", () => {
    const h = met(boven, { "sensor.dreame_boven_state": { state: "iets_nieuws" } });
    const delen = stofzuigerDelen(h, BOVEN);
    assert.equal(stofzuigerStand(h, BOVEN, delen, () => "Iets heel nieuws").tekst, "Iets heel nieuws");
    assert.equal(stofzuigerStand(h, BOVEN, delen, zonderVertaling).tekst, "In het station");
  });

  it("onbereikbaar", () => {
    const h = met(x50, { [X50]: { state: "unavailable" } });
    const s = stofzuigerStand(h, X50, stofzuigerDelen(h, X50));
    assert.equal(s.beschikbaar, false);
    assert.equal(s.tekst, "Niet bereikbaar");
    assert.equal(s.soort, "dood");
  });

  it("een stofzuiger van een ander merk, zonder apparaat: alleen zijn eigen toestand", () => {
    const st = { entity_id: "vacuum.ander", state: "returning", attributes: { battery_level: 80 } };
    const s = stofzuigerStand({ states: { "vacuum.ander": st } }, "vacuum.ander", {});
    assert.equal(s.tekst, "Terug naar het station");
    assert.equal(s.batterij, 80);
    assert.equal(s.soort, "terug");
  });
});

describe("duurTekst", () => {
  it("minuten, uren, en allebei", () => {
    assert.equal(duurTekst(27), "27 min");
    assert.equal(duurTekst(120), "2 uur");
    assert.equal(duurTekst(90), "1 uur 30 min");
    assert.equal(duurTekst("x"), "");
  });
});

describe("bedieningKnoppen", () => {
  const rollen = (lijst) => lijst.map((k) => k.rol);

  it("in het station: starten, en naar het station (grijs)", () => {
    const k = bedieningKnoppen(x50.states[X50]);
    assert.deepEqual(rollen(k), ["start", "station"]);
    assert.deepEqual(k[0].oproep, ["vacuum", "start", { entity_id: X50 }]);
    assert.equal(k[1].uit, true);
    assert.deepEqual(k[1].oproep, ["vacuum", "return_to_base", { entity_id: X50 }]);
  });

  it("bezig: pauzeren", () => {
    const k = bedieningKnoppen({ ...x50.states[X50], state: "cleaning" });
    assert.deepEqual(rollen(k), ["pauze", "station"]);
    assert.deepEqual(k[0].oproep, ["vacuum", "pause", { entity_id: X50 }]);
    assert.equal(k[1].uit, false);
  });

  it("terug naar het station: pauzeren, en Naar station grijs", () => {
    const k = bedieningKnoppen({ ...x50.states[X50], state: "returning" });
    assert.deepEqual(rollen(k), ["pauze", "station"]);
    assert.equal(k[1].uit, true);
  });

  it("gepauzeerd: hervatten", () => {
    const k = bedieningKnoppen({ ...x50.states[X50], state: "paused" });
    assert.deepEqual(rollen(k), ["hervat", "station"]);
  });

  it("geen Zoeken, al kan de X50 het (de eigenaar noemde het niet)", () => {
    assert.ok((x50.states[X50].attributes.supported_features & 512) !== 0);
    assert.ok(!bedieningKnoppen(x50.states[X50]).some((k) => k.rol === "zoek"));
  });

  it("een stofzuiger zonder pauze: stoppen in plaats van pauzeren", () => {
    const st = { entity_id: "vacuum.x", state: "cleaning", attributes: { supported_features: 8 | 16 | 8192 } };
    assert.deepEqual(rollen(bedieningKnoppen(st)), ["stop", "station"]);
  });

  it("kamers gekozen: start alleen die, met vacuum_clean_segment", () => {
    const k = bedieningKnoppen(x50.states[X50], { kamers: [13, 15], segmentDienst: true });
    assert.equal(k[0].label, "Start 2 kamers");
    assert.deepEqual(k[0].oproep, ["dreame_vacuum", "vacuum_clean_segment", { entity_id: X50, segments: [13, 15] }]);
    assert.equal(bedieningKnoppen(x50.states[X50], { kamers: [13], segmentDienst: true })[0].label, "Start 1 kamer");
  });

  it("kamers gekozen maar geen dienst: gewoon starten", () => {
    assert.equal(bedieningKnoppen(x50.states[X50], { kamers: [13] })[0].rol, "start");
  });

  it("onbereikbaar: alles grijs", () => {
    const k = bedieningKnoppen({ ...x50.states[X50], state: "unavailable" });
    assert.ok(k.every((x) => x.uit));
  });

  it("zonder featureflags: geen knoppen", () => {
    assert.deepEqual(bedieningKnoppen({ entity_id: "vacuum.x", state: "docked", attributes: {} }), []);
  });
});

describe("kamers", () => {
  it("X50: alleen de kamers van de actieve kaart (Kaart 1 van 3)", () => {
    const k = kamersVan(x50.states[X50]);
    assert.equal(x50.states[X50].attributes.selected_map, "Kaart 1");
    assert.equal(k.length, 9);
    assert.deepEqual(k[1], { id: 2, naam: "Kantoor", icoon: "mdi:monitor-shimmer" });
  });

  it("r9419h: één kaart met zes kamers", () => {
    assert.deepEqual(kamersVan(boven.states[BOVEN]).map((k) => k.id), [1, 2, 4, 5, 6, 7]);
  });

  it("een lijst zonder kaarten werkt ook, en rommel valt weg", () => {
    const st = { attributes: { rooms: [{ id: 3, name: "Hal" }, { id: null, name: "x" }, { id: 4, name: "" }] } };
    assert.deepEqual(kamersVan(st), [{ id: 3, naam: "Hal", icoon: "" }]);
    assert.deepEqual(kamersVan({ attributes: {} }), []);
  });

  it("actief: de gekozen segmenten, en anders de huidige, alleen tijdens een beurt", () => {
    assert.deepEqual([...actieveKamers(x50.states[X50])], []);
    const bezig = { ...x50.states[X50], state: "cleaning" };
    assert.deepEqual([...actieveKamers(bezig)], [15]);
    const twee = { ...bezig, attributes: { ...bezig.attributes, active_segments: [13, 15] } };
    assert.deepEqual([...actieveKamers(twee)], [13, 15]);
  });
});

describe("keuzes", () => {
  it("X50, CleanGenius uit: CleanGenius, stand, zuigkracht en dweilen", () => {
    const rijen = keuzeRijen(x50, X50, stofzuigerDelen(x50, X50), zonderVertaling);
    assert.deepEqual(rijen.map((r) => r.soort), ["cleangenius", "modus", "zuigkracht", "vochtigheid"]);
    assert.equal(cleanGeniusAan(rijen), false);
    assert.deepEqual(rijen[0].opties.map((o) => o.label), ["Uit", "Routine", "Grondig"]);
    rijen.shift();
    const modus = rijen[0];
    assert.equal(modus.gekozen, "sweeping_and_mopping");
    assert.deepEqual(modus.opties.map((o) => o.label), ["Zuigen", "Dweilen", "Allebei", "Na zuigen"]);
    assert.equal(modus.opties[2].voluit, "Zuigen en dweilen");
    assert.deepEqual(rijen[1].opties.map((o) => o.label), ["Stil", "Standaard", "Sterk", "Turbo"]);
    assert.deepEqual(rijen[2].opties.map((o) => o.label), ["Iets droog", "Vochtig", "Nat"]);
    assert.deepEqual(modus.oproep("mopping"), [
      "select",
      "select_option",
      { entity_id: "select.x50_ultra_complete_cleaning_mode", option: "mopping" },
    ]);
  });

  it("alleen zuigen: geen rij voor het dweilen", () => {
    const h = met(x50, { "select.x50_ultra_complete_cleaning_mode": { state: "sweeping" } });
    const rijen = keuzeRijen(h, X50, stofzuigerDelen(h, X50));
    assert.ok(!rijen.some((r) => r.soort === "vochtigheid"));
  });

  it("een select die unavailable is komt er niet op, en de zuigkracht van de stofzuiger dan ook niet", () => {
    const h = met(x50, { "select.x50_ultra_complete_suction_level": { state: "unavailable" } });
    assert.equal(keuzeRij(h.states["select.x50_ultra_complete_suction_level"], "zuigkracht"), null);
    const rijen = keuzeRijen(h, X50, stofzuigerDelen(h, X50));
    assert.ok(!rijen.some((r) => r.soort === "zuigkracht"));
  });

  it("L40s, CleanGenius op Routine (zoals in de dump): alleen CleanGenius en zijn eigen stand", () => {
    const rijen = keuzeRijen(boven, BOVEN, stofzuigerDelen(boven, BOVEN), zonderVertaling);
    assert.deepEqual(rijen.map((r) => r.soort), ["cleangenius", "cgModus"]);
    assert.equal(rijen[0].gekozen, "routine_cleaning");
    assert.equal(cleanGeniusAan(rijen), true);
    assert.equal(rijen[1].naam, "Stand");
    assert.deepEqual(rijen[1].opties.map((o) => [o.label, o.voluit]), [
      ["Allebei", "Zuigen en dweilen"],
      ["Na zuigen", "Dweilen na zuigen"],
    ]);
  });

  it("L40s met CleanGenius uit: de gewone drie rijen komen terug", () => {
    const opties = (lijst) => ({ attributes: { options: lijst } });
    const h = met(boven, {
      "select.dreame_boven_cleangenius": { state: "off" },
      "select.dreame_boven_cleangenius_mode": { state: "unavailable", ...opties(["unavailable"]) },
      "select.dreame_boven_cleaning_mode": {
        state: "sweeping_and_mopping",
        ...opties(["sweeping", "mopping", "sweeping_and_mopping", "mopping_after_sweeping"]),
      },
      "select.dreame_boven_suction_level": { state: "standard", ...opties(["quiet", "standard", "strong", "turbo"]) },
      "select.dreame_boven_mop_pad_humidity": { state: "moist", ...opties(["slightly_dry", "moist", "wet"]) },
    });
    assert.deepEqual(
      keuzeRijen(h, BOVEN, stofzuigerDelen(h, BOVEN)).map((r) => r.soort),
      ["cleangenius", "modus", "zuigkracht", "vochtigheid"],
    );
  });

  it("een merk zonder select: de zuigkracht van de stofzuiger zelf", () => {
    const st = {
      entity_id: "vacuum.ander",
      state: "docked",
      attributes: { supported_features: 32, fan_speed_list: ["silent", "standard", "max"], fan_speed: "max" },
    };
    const rij = zuigkrachtVanStofzuiger(st);
    assert.deepEqual(rij.opties.map((o) => o.label), ["Stil", "Standaard", "Max"]);
    assert.deepEqual(rij.oproep("silent"), ["vacuum", "set_fan_speed", { entity_id: "vacuum.ander", fan_speed: "silent" }]);
    assert.deepEqual(
      keuzeRijen({ states: { "vacuum.ander": st } }, "vacuum.ander", {}).map((r) => r.soort),
      ["zuigkracht"],
    );
  });
});

describe("station", () => {
  it("X50 droogt: tanks en stofzak in orde, drie knoppen, Drogen staat aan", () => {
    const s = stationStand(x50, X50, stofzuigerDelen(x50, X50));
    assert.deepEqual(
      s.tanks.map((t) => [t.naam, t.tekst, t.ok]),
      [["Schoon water", "In orde", true], ["Vuil water", "In orde", true], ["Stofzak", "In orde", true]],
    );
    assert.deepEqual(
      s.knoppen.map((k) => [k.label, k.actief]),
      [["Reinigen", false], ["Drogen", true], ["Leegzuigen", false]],
    );
  });

  it("r9419h: ook een station met tanks, stofzak en drie knoppen", () => {
    const s = stationStand(boven, BOVEN, stofzuigerDelen(boven, BOVEN));
    assert.equal(s.tanks.length, 3);
    assert.equal(s.knoppen.length, 3);
  });

  it("een volle vuilwatertank, en te weinig water bij de schoonwatertank", () => {
    const h = met(x50, {
      "sensor.x50_ultra_complete_dirty_water_tank_status": { state: "not_installed_or_full" },
      "sensor.x50_ultra_complete_low_water_warning": { state: "no_water_left" },
    });
    const s = stationStand(h, X50, stofzuigerDelen(h, X50));
    assert.deepEqual(
      s.tanks.map((t) => [t.naam, t.tekst, t.ok]),
      [["Schoon water", "Op", false], ["Vuil water", "Vol of weg", false], ["Stofzak", "In orde", true]],
    );
  });

  it("een knop die unavailable is staat er niet", () => {
    const h = met(x50, { "button.x50_ultra_complete_start_auto_empty": { state: "unavailable" } });
    assert.deepEqual(stationStand(h, X50, stofzuigerDelen(h, X50)).knoppen.map((k) => k.label), ["Reinigen", "Drogen"]);
  });
});

describe("onderhoud", () => {
  it("X50: de vier die de eigenaar noemde, met procenten en resttijd; niet de wielen en de antikalk", () => {
    const l = onderhoudLijst(x50, stofzuigerDelen(x50, X50));
    assert.deepEqual(
      l.map((o) => [o.naam, o.procent, o.rest]),
      [
        ["Hoofdborstel", 67, "8 dagen"],
        ["Zijborstel", 51, "4 dagen"],
        ["Filter", 35, "2 dagen"],
        ["Sensoren", 78, "23 uur"],
      ],
    );
    assert.ok(l.every((o) => o.toon === null));
  });

  it("r9419h: dezelfde vier", () => {
    assert.deepEqual(
      onderhoudLijst(boven, stofzuigerDelen(boven, BOVEN)).map((o) => o.naam),
      ["Hoofdborstel", "Zijborstel", "Filter", "Sensoren"],
    );
  });

  it("onder de grens let op, op nul rood", () => {
    const h = met(x50, {
      "sensor.x50_ultra_complete_filter_left": { state: "8" },
      "sensor.x50_ultra_complete_side_brush_left": { state: "0" },
    });
    const l = onderhoudLijst(h, stofzuigerDelen(h, X50));
    assert.equal(l.find((o) => o.naam === "Filter").toon, "warn");
    assert.equal(l.find((o) => o.naam === "Zijborstel").toon, "bad");
  });
});

describe("de kaart van het huis", () => {
  it("het plaatje van de live kaart, met zijn token", () => {
    assert.match(kaartBeeld(x50, "camera.x50_ultra_complete_map"), /^\/api\/camera_proxy\/camera\.x50_ultra_complete_map\b/);
    assert.equal(kaartBeeld(x50, ""), "");
  });
});

describe("merk, type en foto", () => {
  const apparaat = (dump) => Object.values(dump.devices)[0];

  it("de X50 wordt herkend aan zijn modelcode", () => {
    assert.deepEqual(typeBijApparaat(apparaat(x50)), { merk: "dreame", model: "x50_ultra_complete" });
  });

  it("de r9419h is de L40s Pro Ultra (de eigenaar, 15 oktober 2026)", () => {
    assert.deepEqual(typeBijApparaat(apparaat(boven)), { merk: "dreame", model: "l40s_pro_ultra" });
    assert.equal(
      stofzuigerAfbeelding({}, apparaat(boven)),
      `${AFBEELDINGEN_BASIS}robotstofzuigers/dreame-l40s-pro-ultra.webp`,
    );
  });

  it("een onbekende Dreame: geen foto, liever dan een verkeerde", () => {
    const onbekend = { manufacturer: "Dreametech™", model: "dreame.vacuum.r9999" };
    assert.equal(typeBijApparaat(onbekend), null);
    assert.equal(stofzuigerAfbeelding({}, onbekend), "");
  });

  it("Dreame gekozen zonder type, op de L40s: zijn eigen foto, niet de eerste van de lijst", () => {
    assert.match(stofzuigerAfbeelding({ merk: "dreame" }, apparaat(boven)), /dreame-l40s-pro-ultra\.webp$/);
  });

  it("Automatisch geeft de X50 zijn foto", () => {
    assert.equal(
      stofzuigerAfbeelding({ merk: "auto" }, apparaat(x50)),
      `${AFBEELDINGEN_BASIS}robotstofzuigers/dreame-x50-ultra-complete.webp`,
    );
  });

  it("merk en type gekozen: die foto, ook bij een onbekend apparaat", () => {
    const pad = stofzuigerAfbeelding({ merk: "dreame", model: "x50_ultra_complete" }, apparaat(boven));
    assert.match(pad, /dreame-x50-ultra-complete\.webp$/);
    // Merk zonder type: het eerste type van dat merk.
    assert.equal(stofzuigerAfbeelding({ merk: "dreame" }, null), pad);
  });

  it("eigen en geen", () => {
    assert.equal(stofzuigerAfbeelding({ merk: "eigen", image: "/local/robot.png" }, apparaat(x50)), "/local/robot.png");
    assert.equal(stofzuigerAfbeelding({ merk: "eigen" }, apparaat(x50)), "");
    assert.equal(stofzuigerAfbeelding({ merk: "geen", image: "/local/robot.png" }, apparaat(x50)), "");
  });

  it("elk type heeft een pad onder robotstofzuigers/ en een label", () => {
    for (const m of Object.values(STOFZUIGERS)) {
      for (const t of Object.values(m.modellen)) {
        assert.match(t.pad, /^robotstofzuigers\/[a-z0-9-]+\.webp$/);
        assert.ok(t.label);
      }
    }
  });

  it("de keuzes in de editor: geen lege waarde (valkuil 55)", () => {
    assert.deepEqual(merkKeuzes().map((k) => k.value), ["auto", "dreame", "eigen", "geen"]);
    assert.deepEqual(typeKeuzes("dreame"), [
      { value: "x50_ultra_complete", label: "X50 Ultra Complete" },
      { value: "l40s_pro_ultra", label: "L40s Pro Ultra" },
    ]);
    assert.deepEqual(typeKeuzes("eigen"), []);
    assert.ok([...merkKeuzes(), ...typeKeuzes("dreame")].every((k) => k.value));
  });
});

describe("blokken", () => {
  it("alles staat aan, tenzij het in verberg staat", () => {
    assert.equal(blokAan({}, "kaart"), true);
    assert.equal(blokAan({ verberg: ["onderhoud"] }, "onderhoud"), false);
    assert.equal(blokAan({ verberg: ["onderhoud"] }, "kaart"), true);
  });
});
