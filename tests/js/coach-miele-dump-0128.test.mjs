/**
 * De programmakaart met de ECHTE coach v0.128.0, bij een Miele-wasmachine en
 * -droger die de coach alleen uitleest (16 oktober 2026, 0.79.0).
 *
 * `vaste-invoer/coach-0.128.0-wasmachine-droger.json` komt van de beheersessie
 * bij dezelfde klant als `coach-0.124.0-wasmachine-droger.json`, na de
 * installatie van v0.128.0. Wat erin staat:
 *
 * - `alleen_lezen: true` op beide startsensors, met `rule` "read-only";
 * - de drie knoppen en `vrijgegeven` van de coach op `unavailable`;
 * - in `entiteiten` nog steeds de start- en stopknop van Miele. Die zijn bij
 *   de klant in het register uitgeschakeld, en staan dus niet in
 *   `hass.states`.
 *
 * Waarom de kaart verandert: de eigenaar zei via de coach-sessie dat
 * wasmachines en drogers *"in de toekomst ja wel"* gestuurd worden. Dan komen
 * de knoppen van de coach terug, maar alleen als de coach dat zelf zegt.
 *
 * Het geval "mag sturen" staat niet in een dump. Het komt uit de bron van de
 * coach (v0.128.0): `alleen_lezen` is `not controllable`, en uit hetzelfde
 * vinkje volgt dat de knoppen beschikbaar zijn (`ProgrammaBediening` in
 * `entiteit.py`). De toets die dat nabootst, draait aan precies die twee
 * dingen en verder niets.
 *
 * NIEUW GEDRAG, behalve wat met REGRESSIEWACHT begint.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as C from "../../src/cards/coach-logica.js";
import * as P from "../../src/cards/programma-logica.js";
import * as V from "../../src/cards/vaatwasser-logica.js";

const DUMP = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.128.0-wasmachine-droger.json", import.meta.url), "utf8"));
const OUD = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.124.0-wasmachine-droger.json", import.meta.url), "utf8"));
const MIELE = JSON.parse(readFileSync(new URL("./vaste-invoer/miele-was-droog-vries.json", import.meta.url), "utf8"));

/**
 * Een `hass` met de Miele-apparaten en de twee apparaten van de coach, zoals
 * bij de klant: de start- en stopknoppen van Miele uitgeschakeld.
 *
 * @param {(st: object) => object} [aanpassen] om "mag sturen" na te bootsen
 */
function hassUitDump(aanpassen = (s) => s) {
  const devices = {
    ...MIELE.devices,
    wm: { name: "Wasmachine", name_by_user: null, manufacturer: C.COACH_FABRIKANT, model: "Wasmachine" },
    dr: { name: "Droger", name_by_user: null, manufacturer: C.COACH_FABRIKANT, model: "Droger" },
  };
  const entities = Object.fromEntries(
    Object.entries(MIELE.entities).filter(([id, e]) => !e.disabled_by && !id.startsWith("button."))
  );
  const states = Object.fromEntries(Object.entries(structuredClone(MIELE.states)).filter(([id]) => !id.startsWith("button.")));
  for (const e of DUMP.entiteiten) {
    const id = e.entity_id;
    const apparaat = id.includes("wasmachine") ? "wm" : "dr";
    entities[id] = { device_id: apparaat, platform: C.COACH_PLATFORM, translation_key: e.translation_key };
    states[id] = aanpassen({ entity_id: id, state: e.state, attributes: e.attributes });
  }
  return { devices, entities, states };
}

/**
 * "Mag sturen" aan, zoals de bron van de coach het doet: `alleen_lezen` false
 * op de startsensor, en de knoppen en `vrijgegeven` beschikbaar. Een knop die
 * nooit gedrukt is staat op `unknown`.
 */
const magSturen = (s) => {
  if (s.attributes.alleen_lezen === true) return { ...s, attributes: { ...s.attributes, alleen_lezen: false, rule: "", reason: "" } };
  if (s.state !== "unavailable") return s;
  return { ...s, state: s.entity_id.startsWith("binary_sensor.") ? "off" : "unknown" };
};

/** Wat de kaart met de coach aan op een wasmachine of droger zou tonen. */
function kaart(hass, deviceId) {
  const keuze = C.kiesApparaat(hass, deviceId, C.PROGRAMMA_MODELLEN, "Vaatwasser");
  const rollen = C.coachRollen(hass, keuze.id);
  const startSt = hass.states[rollen.start] ?? null;
  const velden = V.metCoachVelden({ coach: true, coach_device: deviceId }, C.klantEntiteiten(startSt));
  const soort = P.apparaatSoort(hass.devices[hass.entities[velden.status]?.device_id]);
  const mag = P.welkeKnoppen?.(soort, startSt) ?? { eigen: true, coach: true };
  const beschikbaar = (id) => P.knopKan(hass.states[id] ?? null);
  const knoppen = mag.coach ? V.coachKnoppen({ coach: V.coachStand(startSt), rollen, beschikbaar }) : [];
  const eigen = mag.eigen ? ["start", "stop"].filter((k) => beschikbaar(velden[k])) : [];
  return { soort, startSt, mag, knoppen: knoppen.map((k) => k.label), eigen };
}

describe("REGRESSIEWACHT: de echte coach v0.128.0 bij een wasmachine en droger zonder sturen", () => {
  it("zet alleen_lezen op true en de regel op read-only, met contract 1", () => {
    for (const id of ["sensor.wasmachine_start", "sensor.droger_start"]) {
      const a = DUMP.entiteiten.find((e) => e.entity_id === id).attributes;
      assert.deepEqual([a.alleen_lezen, a.rule, a.contract, a.vrijgegeven], [true, "read-only", 1, false], id);
    }
  });

  it("zet de drie knoppen en vrijgegeven op niet beschikbaar", () => {
    const sleutels = DUMP.entiteiten.filter((e) => e.state === "unavailable").map((e) => e.translation_key);
    assert.deepEqual(sleutels.sort(), [
      "ingeruimd_morgen",
      "ingeruimd_morgen",
      "ingeruimd_nu",
      "ingeruimd_nu",
      "vrijgave_intrekken",
      "vrijgave_intrekken",
      "vrijgegeven",
      "vrijgegeven",
    ]);
  });

  it("noemt in entiteiten nog de start- en stopknop van Miele, ook al zijn die bij de klant uitgeschakeld", () => {
    const e = DUMP.entiteiten.find((x) => x.entity_id === "sensor.wasmachine_start").attributes.entiteiten;
    assert.deepEqual([e.start, e.stop], ["button.wasmachine_starten", "button.wasmachine_stoppen"]);
  });

  it("de oude dump (v0.124.0) had geen alleen_lezen", () => {
    assert.equal("alleen_lezen" in OUD.coach_entiteiten[0].state.attributes, false);
  });
});

describe("NIEUW GEDRAG (0.79.0): de knoppen van de coach volgen of hij mag sturen", () => {
  it("de dump: geen enkele knop op de wasmachine en de droger", () => {
    const hass = hassUitDump();
    for (const id of ["wm", "dr"]) {
      const k = kaart(hass, id);
      assert.deepEqual([k.mag, k.knoppen, k.eigen], [{ eigen: false, coach: false }, [], []], id);
    }
  });

  it("mag sturen: Mag draaien en Nu starten, en nog steeds geen eigen knoppen van Miele", () => {
    const hass = hassUitDump(magSturen);
    for (const id of ["wm", "dr"]) {
      const k = kaart(hass, id);
      assert.deepEqual([k.mag, k.knoppen, k.eigen], [{ eigen: false, coach: true }, ["Mag draaien", "Nu starten"], []], id);
    }
  });

  it("een oudere coach zonder alleen_lezen stuurt niet, ook al zijn zijn knoppen beschikbaar", () => {
    const st = OUD.coach_entiteiten.find((x) => x.registry.entity_id === "sensor.wasmachine_start").state;
    assert.equal(P.coachStuurt(st), false);
    assert.deepEqual(P.welkeKnoppen("wasmachine", st), { eigen: false, coach: false });
  });

  it("alleen expliciet false telt: geen sensor, geen attribuut, of iets anders dan een boolean is niet sturen", () => {
    const met = (v) => ({ state: "unknown", attributes: { alleen_lezen: v } });
    assert.equal(P.coachStuurt(null), false);
    assert.equal(P.coachStuurt({ state: "unknown", attributes: {} }), false);
    assert.equal(P.coachStuurt(met(true)), false);
    assert.equal(P.coachStuurt(met("false")), false);
    assert.equal(P.coachStuurt(met(false)), true);
  });

  it("een knop die niet beschikbaar is staat er niet, ook bij een vaatwasser", () => {
    const coach = { stand: "niet_vrijgegeven", vrijgegeven: false, nu: false, type: "vaatwasser" };
    const rollen = { ingeruimd_morgen: "button.a", ingeruimd_nu: "button.b" };
    const knoppen = V.coachKnoppen({ coach, rollen, beschikbaar: (id) => id === "button.b" });
    assert.deepEqual(knoppen.map((k) => k.label), ["Nu starten"]);
  });
});

describe("REGRESSIEWACHT: de vaatwasser houdt al zijn knoppen", () => {
  it("eigen en coach, ongeacht de startsensor", () => {
    assert.deepEqual(P.welkeKnoppen?.("vaatwasser", null) ?? { eigen: true, coach: true }, { eigen: true, coach: true });
  });

  it("coachKnoppen zonder beschikbaar geeft wat hij altijd gaf", () => {
    const coach = { stand: "niet_vrijgegeven", vrijgegeven: false, nu: false, type: "wasmachine" };
    const rollen = { ingeruimd_morgen: "button.a", ingeruimd_nu: "button.b" };
    assert.deepEqual(V.coachKnoppen({ coach, rollen }).map((k) => [k.label, k.entity]), [
      ["Mag draaien", "button.a"],
      ["Nu starten", "button.b"],
    ]);
  });
});
