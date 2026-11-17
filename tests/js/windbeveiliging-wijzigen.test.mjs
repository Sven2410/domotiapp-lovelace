/**
 * De windbeveiliging wijzigen op de automatiseringskaart (0.134.0). De eigenaar tikte op de rij en kreeg de windsensor;
 * hij wilde hem wijzigen, net als een regel. Zie de kop van `automatisering/wind.py` en `automatisering-wind-scherm.js`.
 *
 * NIEUW GEDRAG.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as L from "../../src/cards/automatisering-logica.js";
import { _reset } from "../../src/taal.js";

const WIND = {
  aan: true,
  sensor: "sensor.windstoten",
  max: 30,
  schermen: ["cover.keuken", "cover.terras"],
  kiesbaar: ["cover.kantoor", "cover.keuken", "cover.terras"],
  omgekeerd: ["cover.keuken"],
  bron: "kaart",
  laatst: null,
};

describe("wat het dialoog wijzigt", () => {
  it("komt uit de stand: wie niet meedoet, en omgekeerd per scherm", () => {
    assert.deepEqual(L.windConcept(WIND), {
      aan: true,
      sensor: "sensor.windstoten",
      max: 30,
      zonder: ["cover.kantoor"],
      omgekeerd: { "cover.kantoor": false, "cover.keuken": true, "cover.terras": false },
    });
    assert.equal(L.windConcept({ ...WIND, aan: false }).aan, false);
  });

  it("gaat zo naar de server", () => {
    const c = L.windConcept(WIND);
    assert.deepEqual(L.windNaarServer(c), {
      aan: true,
      sensor: "sensor.windstoten",
      max: 30,
      zonder: ["cover.kantoor"],
      omgekeerd: { "cover.kantoor": false, "cover.keuken": true, "cover.terras": false },
    });
  });

  it("de grens stapt naar het volgende veelvoud van 5, tussen 5 en 100", () => {
    assert.equal(L.stapGrens(30, 1), 35);
    assert.equal(L.stapGrens(30, -1), 25);
    assert.equal(L.stapGrens(32, 1), 35);
    assert.equal(L.stapGrens(32, -1), 30);
    assert.equal(L.stapGrens(100, 1), 100);
    assert.equal(L.stapGrens(5, -1), 5);
  });

  it("aan zonder sensor kan niet", () => {
    _reset({ instelling: "nl" });
    assert.equal(L.windWaaromNiet({ aan: true, sensor: null }), "Kies een windsensor.");
    assert.equal(L.windWaaromNiet({ aan: false, sensor: null }), "");
    assert.equal(L.windWaaromNiet({ aan: true, sensor: "sensor.x" }), "");
  });
});

describe("de sensoren om uit te kiezen", () => {
  const states = {
    "sensor.windstoten": { state: "3", attributes: { device_class: "wind_speed", unit_of_measurement: "m/s" } },
    "sensor.auto": { state: "50", attributes: { device_class: "speed", unit_of_measurement: "km/h" } },
    "sensor.regen": { state: "2", attributes: { device_class: "speed", unit_of_measurement: "mm/h" } },
    "sensor.temperatuur": { state: "12", attributes: { device_class: "temperature" } },
    "sensor.oud": { state: "1", attributes: {} },
  };
  const namen = { "sensor.windstoten": "Windstoten", "sensor.auto": "Auto", "sensor.oud": "Oud" };

  it("een windsnelheid of een snelheid, geen neerslag; de gekozen voorop", () => {
    assert.deepEqual(L.windSensoren(states, "sensor.windstoten", (id) => namen[id]), ["sensor.windstoten", "sensor.auto"]);
    assert.deepEqual(L.windSensoren(states, "sensor.oud", (id) => namen[id]), ["sensor.oud", "sensor.auto", "sensor.windstoten"]);
  });
});

describe("de namen van de sensoren", () => {
  it("twee met dezelfde naam krijgen hun entity_id erachter", () => {
    const namen = { "sensor.ws_speed": "Weerstation Speed", "sensor.ws_speed_2": "Weerstation Speed", "sensor.anemo": "Anemometer" };
    const uit = L.sensorNamen(Object.keys(namen), (id) => namen[id]);
    assert.equal(uit.get("sensor.ws_speed"), "Weerstation Speed (ws_speed)");
    assert.equal(uit.get("sensor.ws_speed_2"), "Weerstation Speed (ws_speed_2)");
    assert.equal(uit.get("sensor.anemo"), "Anemometer");
  });
});

describe("de rij op de kaart", () => {
  it("zegt het als de beveiliging uit staat", () => {
    _reset({ instelling: "nl" });
    const b = L.windBlok({ ...WIND, aan: false }, {}, (id) => id);
    assert.equal(b.soort, "uit");
    assert.equal(b.kop, "Staat uit");
    assert.equal(b.uitleg, "De zonneschermen rollen ook bij harde wind uit.");
    assert.ok(!b.regels.includes("Nog niet ingegrepen"));
  });

  it("staat er ook als er geen scherm meedoet", () => {
    _reset({ instelling: "nl" });
    const b = L.windBlok({ ...WIND, schermen: [] }, { "sensor.windstoten": { state: "1", attributes: { unit_of_measurement: "m/s" } } }, (id) => id);
    assert.ok(b);
    assert.ok(b.regels.includes("Er doet geen scherm mee."));
  });
});

describe("de kaart en het dialoog", () => {
  const kaart = readFileSync(new URL("../../src/cards/automatisering-card.js", import.meta.url), "utf8");
  const scherm = readFileSync(new URL("../../src/cards/automatisering-wind-scherm.js", import.meta.url), "utf8");

  it("een tik op de rij opent het dialoog, niet de sensor", () => {
    assert.match(kaart, /toonWindScherm\(this, this\.stand_\.wind\)/);
    assert.doesNotMatch(kaart, /moreInfo\(this, sensor\)/);
    assert.match(kaart, /`\$\{COMMANDO\}\/wind_opslaan`/);
  });

  it("de windsensor staat als knop in het dialoog", () => {
    assert.match(scherm, /data-k="sensorinfo:"/);
    assert.match(scherm, /moreInfo\(kaart, sensor\)/);
  });

  it("alleen een beheerder kan wijzigen", () => {
    assert.match(scherm, /magWijzigen_\(\) \{\s*return this\.bron\?\.hass\?\.user\?\.is_admin === true;/);
    assert.match(scherm, /if \(!this\.magWijzigen_\(\)\) return;/);
  });
});
