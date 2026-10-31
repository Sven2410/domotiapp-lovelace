/**
 * De airco-kaart op een echte Atlantic via Cozytouch, uitgelezen op 31 oktober
 * 2026 (`vaste-invoer/cozytouch-atlantic-airco.json`, geanonimiseerd).
 *
 * NIEUW GEDRAG: de kamertemperatuur, de woorden voor lamellen en presets, en de
 * foto. REGRESSIEWACHT: wat de kaart al goed deed met deze attributen.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  AIRCO_FOTOS,
  FUNCTIE,
  aanUitOproep,
  aircoAfbeelding,
  aircoStand,
  alsKnoppen,
  apparaatDelen,
  doelInstelling,
  fotoBijAirco,
  kan,
  keuzeOproep,
  keuzesVan,
  standKnoppen,
  statusTekst,
} from "../../src/cards/airco-logica.js";

const dump = JSON.parse(readFileSync(new URL("./vaste-invoer/cozytouch-atlantic-airco.json", import.meta.url), "utf8"));
const klimaat = dump.climate;

const hass = {
  states: Object.fromEntries(
    [klimaat, ...dump.entiteiten].map((e) => [e.entity_id, { entity_id: e.entity_id, state: e.state, attributes: e.attributes }])
  ),
  entities: Object.fromEntries(
    [klimaat, ...dump.entiteiten].map((e) => [
      e.entity_id,
      { entity_id: e.entity_id, device_id: dump.apparaat.id, translation_key: e.translation_key, platform: "cozytouch" },
    ])
  ),
};

/** De climate in een andere stand, zoals Cozytouch hem dan meldt. */
const inStand = (state, temperature) => ({
  ...klimaat,
  state,
  attributes: { ...klimaat.attributes, temperature },
});

const labels = (st, soort) => keuzesVan(st, soort).map((o) => o.label);

describe("Cozytouch: de kamertemperatuur", () => {
  test("NIEUW GEDRAG: de ingestelde minimumtemperatuur is geen kamertemperatuur", () => {
    assert.equal(apparaatDelen(hass, klimaat.entity_id).kamer, undefined);
  });

  test("NIEUW GEDRAG: de kaart zegt dus niets over binnen, en verzint geen getal", () => {
    const delen = apparaatDelen(hass, klimaat.entity_id);
    const reserve = delen.kamer ? hass.states[delen.kamer] : null;
    assert.equal(aircoStand(klimaat, { reserve }).huidig, null);
  });

  test("REGRESSIEWACHT: een gekozen sensor wint, dat is de weg voor deze airco", () => {
    const sensor = { state: "20.0", attributes: {} };
    assert.equal(aircoStand(klimaat, { sensor }).huidig, 20);
  });

  test("REGRESSIEWACHT: een gewone kamersensor op een apparaat blijft gevonden worden", () => {
    const h = {
      states: {
        "climate.x": { entity_id: "climate.x", state: "off", attributes: {} },
        "sensor.x_room_temperature": { state: "21", attributes: { device_class: "temperature" } },
      },
      entities: {
        "climate.x": { device_id: "a" },
        "sensor.x_room_temperature": { device_id: "a", translation_key: "room_temperature" },
      },
    };
    assert.equal(apparaatDelen(h, "climate.x").kamer, "sensor.x_room_temperature");
  });

  test("NIEUW GEDRAG: ook een doel of een grens van een ander merk telt niet als kamer", () => {
    for (const naam of ["target_temperature", "setpoint_temperature", "maximum_temperature"]) {
      const id = `sensor.x_${naam}`;
      const h = {
        states: { "climate.x": { state: "off", attributes: {} }, [id]: { state: "28", attributes: { device_class: "temperature" } } },
        entities: { "climate.x": { device_id: "a" }, [id]: { device_id: "a" } },
      };
      assert.equal(apparaatDelen(h, "climate.x").kamer, undefined, naam);
    }
  });
});

describe("Cozytouch: de woorden", () => {
  test("NIEUW GEDRAG: de lamellen in het Nederlands, zonder Engels op de kaart", () => {
    assert.deepEqual(labels(klimaat, "lamellen"), ["Boven", "Midden-boven", "Midden-onder", "Onder", "Zwaaien"]);
  });

  test("NIEUW GEDRAG: de presets in het Nederlands, en none is Geen", () => {
    assert.deepEqual(labels(klimaat, "preset"), ["Geen", "Activiteit", "Eco", "Boost", "Basis", "Weekprogramma", "Tijdelijk"]);
  });

  test("REGRESSIEWACHT: de ventilator past als knoppen, Stil erbij", () => {
    const opties = keuzesVan(klimaat, "ventilator");
    assert.deepEqual(opties.map((o) => o.label), ["Laag", "Midden", "Hoog", "Auto", "Stil"]);
    assert.equal(alsKnoppen(opties), true);
  });

  test("REGRESSIEWACHT: er zijn geen lamellen opzij", () => {
    assert.deepEqual(keuzesVan(klimaat, "lamellen_opzij"), []);
  });

  test("REGRESSIEWACHT: een keuze gaat met de eigen waarde van de integratie de deur uit", () => {
    assert.deepEqual(keuzeOproep(klimaat, "lamellen", "middle_up"), [
      "climate",
      "set_swing_mode",
      { entity_id: klimaat.entity_id, swing_mode: "middle_up" },
    ]);
    assert.deepEqual(keuzeOproep(klimaat, "preset", "none"), [
      "climate",
      "set_preset_mode",
      { entity_id: klimaat.entity_id, preset_mode: "none" },
    ]);
  });
});

describe("Cozytouch: de stand en het doel", () => {
  test("REGRESSIEWACHT: zes standknoppen op de vaste volgorde, Uit voorop, en uit is de gekozen", () => {
    const knoppen = standKnoppen(klimaat);
    assert.deepEqual(knoppen.map((k) => k.waarde), ["off", "heat", "cool", "auto", "dry", "fan_only"]);
    assert.equal(knoppen.find((k) => k.gekozen).waarde, "off");
  });

  test("REGRESSIEWACHT: zonder hvac_action zegt hij wat er gevraagd is", () => {
    const s = aircoStand(inStand("heat", 21));
    assert.equal(s.actie, null);
    assert.equal(statusTekst(s), "Verwarmen");
  });

  test("REGRESSIEWACHT: geen doel bij uit (null), en wel een doel met stap 0,5 in heat", () => {
    assert.equal(doelInstelling(klimaat), null);
    const inst = doelInstelling(inStand("heat", 21));
    assert.deepEqual([inst.doel, inst.stap, inst.min, inst.max], [21, 0.5, 16, 30]);
  });

  test("REGRESSIEWACHT: de grenzen komen van de entiteit, ook als ze per stand wisselen", () => {
    const koelen = { ...klimaat, state: "cool", attributes: { ...klimaat.attributes, temperature: 24, min_temp: 18 } };
    assert.equal(doelInstelling(koelen).min, 18);
  });

  test("REGRESSIEWACHT: aan en uit via turn_on en turn_off (supported_features 441)", () => {
    assert.equal(kan(klimaat, FUNCTIE.AAN), true);
    assert.equal(kan(klimaat, FUNCTIE.UIT), true);
    assert.deepEqual(aanUitOproep(klimaat, true), ["climate", "turn_on", { entity_id: klimaat.entity_id }]);
    assert.deepEqual(aanUitOproep(inStand("heat", 21), false), ["climate", "turn_off", { entity_id: klimaat.entity_id }]);
  });
});

describe("Cozytouch: de foto", () => {
  test("NIEUW GEDRAG: het apparaat uit de dump (Atlantic, zonder type) krijgt de foto", () => {
    assert.equal(fotoBijAirco(dump.apparaat), "fujitsu_general");
    assert.equal(aircoAfbeelding("auto", dump.apparaat), "/domotiapp_lovelace/afbeeldingen/aircos/fujitsu-general.webp");
  });

  test("NIEUW GEDRAG: ook een apparaat dat wel Fujitsu heet", () => {
    assert.equal(fotoBijAirco({ manufacturer: "Fujitsu General", model: "ASYG12" }), "fujitsu_general");
    assert.equal(fotoBijAirco({ manufacturer: "FUJITSU" }), "fujitsu_general");
  });

  test("REGRESSIEWACHT: een ander merk krijgt hem niet, en Mitsubishi blijft alleen op keuze", () => {
    assert.equal(fotoBijAirco({ manufacturer: "Daikin" }), null);
    assert.equal(fotoBijAirco({ manufacturer: "Mitsubishi Electric" }), null);
  });

  test("REGRESSIEWACHT: Geen en een eigen afbeelding winnen van de merkfoto", () => {
    assert.equal(aircoAfbeelding("geen", dump.apparaat), "");
    assert.equal(aircoAfbeelding("auto", dump.apparaat, "/local/x.png"), "/local/x.png");
    assert.equal(aircoAfbeelding("eigen", dump.apparaat), "");
  });

  test("NIEUW GEDRAG: de foto staat er en is te kiezen", () => {
    assert.ok(readFileSync(new URL(`../../custom_components/domotiapp_lovelace/afbeeldingen/${AIRCO_FOTOS.fujitsu_general.pad}`, import.meta.url)).length > 0);
  });
});
