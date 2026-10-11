/**
 * De vaatwasserkaart tegen de ECHTE coach v0.110.0.
 *
 * `vaste-invoer/coach-0.110.0-vaatwasser.json` is de dump die de coach-sessie
 * op 11 oktober 2026 om 20:21 uit de Home Assistant van de eigenaar haalde
 * (2026.10.1), na de eerste ronde na de herstart. Geanonimiseerd: de entity_ids
 * van zijn eigen apparaten zijn vervangen door algemene namen; die van de coach
 * zelf en de translation_keys zijn echt.
 *
 * Dit is precies de toets die bij 0.47.0 ontbrak: die kaart was gebouwd tegen
 * een nagebootste sensor, en de echte zag er een dag later anders uit (valkuil
 * 67). De nep-coach van deze ronde volgde het contract zoals het was
 * afgesproken; de dump liet twee dingen zien die daar niet in stonden:
 *
 * - `entiteiten.program` is het ACTIEVE programma, een sensor. De keuzelijst
 *   staat in `entiteiten.program_select`.
 * - `entiteiten.status` bestaat: de bedrijfsstatus van de machine.
 *
 * NIEUW GEDRAG: de drie tests over de velden (die falen op 86bea87). De rest
 * is REGRESSIEWACHT: die toetst dat wat al gebouwd was ook met de echte coach
 * werkt.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as C from "../../src/cards/coach-logica.js";
import * as V from "../../src/cards/vaatwasser-logica.js";

const DUMP = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.110.0-vaatwasser.json", import.meta.url), "utf8"));

/**
 * Een `hass` zoals de frontend hem heeft, gebouwd uit de dump.
 *
 * Met het lege apparaat dat er bij hem nog staat: "DomotiApp Coach" met
 * fabrikant "DomotiApp" (identifier `coach`, opruimen faalde in 0.110.0 en
 * gaat mee in 0.111.0). Daar hangt niets meer aan, en de kaart mag het niet
 * voor een vaatwasser aanzien.
 */
function hassUitDump() {
  const devices = {
    vw: { name: "Vaatwasser", name_by_user: null, manufacturer: "DomotiApp Coach", model: "Vaatwasser" },
    oud: { name: "DomotiApp Coach", name_by_user: null, manufacturer: "DomotiApp", model: null },
  };
  const entities = {};
  const states = {};
  for (const e of DUMP) {
    assert.equal(e.device_manufacturer, "DomotiApp Coach");
    assert.equal(e.device_model, "Vaatwasser");
    entities[e.entity_id] = { device_id: "vw", platform: "domotiapp_coach", translation_key: e.translation_key };
    states[e.entity_id] = { entity_id: e.entity_id, state: e.state, attributes: e.attributes };
  }
  return { devices, entities, states };
}

/** Zondag 11 oktober 2026, 20:21: het moment van de dump. */
const NU = new Date(2026, 9, 11, 20, 21);

describe("REGRESSIEWACHT: de kaart vindt de echte coach", () => {
  const hass = hassUitDump();

  it("kiest de vaatwasser, en niet het oude lege apparaat van de coach", () => {
    assert.deepEqual(C.kiesApparaat(hass, "", C.PROGRAMMA_MODELLEN, "Vaatwasser"), { id: "vw", reden: "enige" });
  });

  it("vindt alle vijf de rollen op hun translation_key", () => {
    assert.deepEqual(C.coachRollen(hass, "vw"), {
      start: "sensor.domotiapp_coach_vaatwasser_start_om",
      vrijgegeven: "binary_sensor.vaatwasser_vrijgegeven",
      // De entity_id zegt "goedkoopste moment" en niet "morgen": daarom de
      // sleutel en niet de naam.
      ingeruimd_morgen: "button.vaatwasser_ingeruimd_goedkoopste_moment",
      ingeruimd_nu: "button.vaatwasser_ingeruimd_nu_starten",
      vrijgave_intrekken: "button.vaatwasser_vrijgave_intrekken",
    });
  });

  it("leest contract 1 en de stand, met 'morgen' van de coach", () => {
    const st = hass.states["sensor.domotiapp_coach_vaatwasser_start_om"];
    assert.equal(C.contractVan(st), 1);
    const c = V.coachStand(st);
    assert.equal(c.stand, "niet_vrijgegeven");
    assert.equal(c.vrijgegeven, false);
    assert.equal(c.later, "morgen");
    assert.equal(+c.klaarOm, +new Date("2026-10-12T14:30:00Z"));
    assert.equal(V.coachMelding({ reden: "enige" }, C.contractVan(st)), "");
  });

  it("zet Morgen starten en Nu starten neer, op de echte knoppen", () => {
    const hassD = hassUitDump();
    const c = V.coachStand(hassD.states["sensor.domotiapp_coach_vaatwasser_start_om"]);
    const k = V.coachKnoppen({ coach: c, rollen: C.coachRollen(hassD, "vw"), nu: NU });
    assert.deepEqual(
      k.map((x) => [x.label, x.entity]),
      [
        ["Morgen starten", "button.vaatwasser_ingeruimd_goedkoopste_moment"],
        ["Nu starten", "button.vaatwasser_ingeruimd_nu_starten"],
      ]
    );
  });

  it("ziet geen geplande start zolang er niets gepland is", () => {
    assert.equal(V.startMoment(hass.states["sensor.domotiapp_coach_vaatwasser_start_om"], NU), null);
  });
});

describe("NIEUW GEDRAG: de velden die de echte coach invult", () => {
  const hass = hassUitDump();
  const entiteiten = C.klantEntiteiten(hass.states["sensor.domotiapp_coach_vaatwasser_start_om"]);

  it("neemt de keuzelijst voor het programma, en niet de sensor met het actieve programma", () => {
    const v = V.metCoachVelden({}, entiteiten);
    assert.equal(v.program, "select.vaatwasser_geselecteerd_programma");
  });

  it("neemt de statussensor van de coach over", () => {
    const v = V.metCoachVelden({}, entiteiten);
    assert.deepEqual(v, {
      status: "sensor.vaatwasser_bedrijfsstatus",
      remaining: "sensor.vaatwasser_resterende_tijd",
      door: "binary_sensor.vaatwasser_deur",
      start: "button.vaatwasser_start",
      stop: "button.vaatwasser_stop",
      program: "select.vaatwasser_geselecteerd_programma",
    });
  });
});

describe("NIEUW GEDRAG: een programma dat geen keuzelijst is, wordt geen keuzelijst", () => {
  it("laat het veld leeg als de coach alleen een sensor voor het programma heeft", () => {
    const v = V.metCoachVelden({}, { program: "sensor.actief_programma" });
    assert.equal(v.program, undefined);
  });

  it("REGRESSIEWACHT: neemt een input_select als programma wel", () => {
    const v = V.metCoachVelden({}, { program: "input_select.programma" });
    assert.equal(v.program, "input_select.programma");
  });
});
