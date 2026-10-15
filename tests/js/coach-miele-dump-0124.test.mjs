/**
 * De programmakaart met de ECHTE coach v0.124.0, met een Miele-wasmachine en
 * -droger (15 oktober 2026).
 *
 * `vaste-invoer/coach-0.124.0-wasmachine-droger.json` is de dump die de
 * beheersessie bij een klant maakte, net nadat wasmachine en droger daar in de
 * coach waren gezet. De machines stonden uit, de deur van de wasmachine stond
 * open. De Miele-kant komt uit `vaste-invoer/miele-was-droog-vries.json`, van
 * dezelfde klant.
 *
 * Wat deze dump liet zien:
 *
 * - het contract van de vaatwasser, met `type` "wasmachine" en "droger";
 * - in `entiteiten` de Miele-sensoren zelf: status, program (een SENSOR),
 *   remaining, door, start, stop, plus remote_start en energy;
 * - het apparaat van de droger heet in de coach "Droger", bij Miele "Wasdroger".
 *
 * REGRESSIEWACHT: de kaart hoefde voor deze coach niet te veranderen (0.71.0 was
 * er al op gebouwd), dus deze tests slagen ook op de code van vóór de dump. Ze
 * leggen vast dat het zo blijft.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as C from "../../src/cards/coach-logica.js";
import * as P from "../../src/cards/programma-logica.js";
import * as V from "../../src/cards/vaatwasser-logica.js";

const COACH = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.124.0-wasmachine-droger.json", import.meta.url), "utf8"));
const MIELE = JSON.parse(readFileSync(new URL("./vaste-invoer/miele-was-droog-vries.json", import.meta.url), "utf8"));

/** Een `hass` met de Miele-apparaten en de twee apparaten van de coach. */
function hassUitDumps() {
  const devices = {
    ...MIELE.devices,
    wm: { name: "Wasmachine", name_by_user: null, manufacturer: C.COACH_FABRIKANT, model: "Wasmachine" },
    dr: { name: "Droger", name_by_user: null, manufacturer: C.COACH_FABRIKANT, model: "Droger" },
  };
  const entities = Object.fromEntries(Object.entries(MIELE.entities).filter(([, e]) => !e.disabled_by));
  const states = structuredClone(MIELE.states);
  for (const { registry, state } of COACH.coach_entiteiten) {
    const id = registry.entity_id;
    entities[id] = { device_id: id.includes("wasmachine") ? "wm" : "dr", platform: C.COACH_PLATFORM, translation_key: registry.translation_key };
    states[id] = state;
  }
  return { devices, entities, states };
}

const hass = hassUitDumps();
const st = (id) => hass.states[id] ?? null;

/** Wat de kaart doet met de coach aan, voor het gekozen apparaat: de velden, de rollen, de knoppen. */
function kaart(deviceId) {
  const keuze = C.kiesApparaat(hass, deviceId, C.PROGRAMMA_MODELLEN, "Vaatwasser");
  const rollen = C.coachRollen(hass, keuze.id);
  const startSt = st(rollen.start);
  const velden = V.metCoachVelden({ coach: true, coach_device: deviceId }, C.klantEntiteiten(startSt));
  const apparaat = P.apparaatRollen(hass, velden.status);
  return { keuze, rollen, startSt, velden: P.metApparaatVelden(velden, apparaat), apparaat };
}

describe("REGRESSIEWACHT: de echte coach v0.124.0 met een Miele-wasmachine en -droger", () => {
  it("vindt geen enkel apparaat vanzelf: er zijn er twee, dus kies je er een in de editor", () => {
    assert.equal(C.kiesApparaat(hass, "", C.PROGRAMMA_MODELLEN, "Vaatwasser").reden, "meerdere");
    assert.equal(kaart("wm").keuze.reden, "gekozen");
  });

  it("vindt de startsensor en de drie knoppen van de coach", () => {
    const { rollen, startSt } = kaart("wm");
    assert.equal(rollen.start, "sensor.wasmachine_start");
    assert.equal(rollen.ingeruimd_morgen, "button.wasmachine_ingeruimd_goedkoopste_moment");
    assert.equal(rollen.ingeruimd_nu, "button.wasmachine_ingeruimd_nu_starten");
    assert.equal(rollen.vrijgave_intrekken, "button.wasmachine_vrijgave_intrekken");
    assert.equal(C.coachMelding({ reden: "gekozen" }, C.contractVan(startSt)), "");
  });

  it("biedt Mag draaien en Nu starten aan, met de woorden van het paneel", () => {
    const { rollen, startSt } = kaart("wm");
    const coach = V.coachStand(startSt);
    assert.equal(coach.type, "wasmachine");
    assert.equal(coach.stand, "niet_vrijgegeven");
    const knoppen = V.coachKnoppen({ coach, rollen });
    assert.deepEqual(knoppen.map((k) => [k.label, k.entity]), [
      ["Mag draaien", "button.wasmachine_ingeruimd_goedkoopste_moment"],
      ["Nu starten", "button.wasmachine_ingeruimd_nu_starten"],
    ]);
  });

  it("neemt status, resterende tijd, deur, start en stop van de coach, maar het programma niet: dat is een sensor", () => {
    const { velden } = kaart("wm");
    assert.equal(velden.status, "sensor.wasmachine");
    assert.equal(velden.remaining, "sensor.wasmachine_resterende_tijd");
    assert.equal(velden.door, "binary_sensor.wasmachine_deur");
    assert.equal(velden.start, "button.wasmachine_starten");
    assert.equal(velden.stop, "button.wasmachine_stoppen");
    assert.equal(velden.program, undefined);
  });

  it("vindt via de status van de coach de rest van het Miele-apparaat: de fase en de tegels", () => {
    const { apparaat } = kaart("wm");
    assert.equal(apparaat.fase, "sensor.wasmachine_programmafase");
    const tegels = P.programmaTegels({ rollen: apparaat, st, deurWoord: "Deur" }).map((t) => `${t.label}: ${t.waarde}`);
    assert.deepEqual(tegels.slice(0, 2), ["Deur: Open", "Programma: Geen"]);
  });

  it("zegt met de coach aan Deur open zolang de machine uit staat, net als Klep open bij de vaatwasser", () => {
    const { velden } = kaart("wm");
    const t = V.toestand({ status: st(velden.status), deur: st(velden.door), deurWoord: "Deur" });
    assert.deepEqual([t.tekst, t.tone], ["Deur open", "warn"]);
  });

  it("vindt bij de droger de Miele-sensoren van de Wasdroger, ook al heet hij in de coach Droger", () => {
    const { velden, apparaat } = kaart("dr");
    assert.equal(hass.devices.dr.name, "Droger");
    assert.equal(velden.status, "sensor.wasdroger");
    assert.equal(apparaat.programma, "sensor.wasdroger_programma");
    assert.equal(V.coachStand(st("sensor.droger_start")).type, "droger");
  });
});
