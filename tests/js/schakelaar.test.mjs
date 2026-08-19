/**
 * Waar mag een schuifschakelaar op, en waar niet?
 *
 * De knopkaart en de entiteitenkaart kunnen er een dragen. Dat is een keuze in
 * de editor, maar geen vrije keuze: een schakelaar belooft twee standen die
 * blijven staan. Een scene, een script of een sensor heeft geen "uit" om naartoe
 * te schuiven, en een schakelaar die daar staat is geen instelling maar een
 * kaart die liegt. Vandaar dat de kaarten hem daar weglaten, ook als de config
 * erom vraagt -- en vandaar deze test.
 *
 * De DOM-kant (schuiven, loslaten, toetsenbord) is in de browser gemeten; zie
 * het rapport van deze ronde. Geen jsdom (CLAUDE.md).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { kanSchakelen } from "../../src/ha.js";

describe("kanSchakelen()", () => {
  it("twee standen die blijven staan: ja", () => {
    for (const id of [
      "light.keuken",
      "switch.tuinpomp",
      "fan.slaapkamer",
      "input_boolean.slapen",
      "automation.avondroutine",
      "siren.sirene",
      "humidifier.bevochtiger",
      "remote.tv",
      "water_heater.boiler",
    ]) {
      assert.equal(kanSchakelen(id), true, id);
    }
  });

  it("iets zonder uit-stand: nee", () => {
    for (const id of [
      "scene.avond",
      "script.alles_uit",
      "button.herstart",
      "input_button.bel",
      "sensor.temperatuur",
      "binary_sensor.deur",
      "cover.rolluik",
      "climate.woonkamer",
      "media_player.sonos",
      "person.sven",
      "weather.buienradar",
    ]) {
      assert.equal(kanSchakelen(id), false, id);
    }
  });

  it("en niets is ook nee, in plaats van een fout", () => {
    assert.equal(kanSchakelen(undefined), false);
    assert.equal(kanSchakelen(""), false);
    assert.equal(kanSchakelen("kapot"), false);
  });
});
