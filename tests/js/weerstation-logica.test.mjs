/**
 * De weerstationkaart, op de echte dump van een Shelly BLU Weather Station via BTHome.
 *
 * NIEUW GEDRAG: de kaart bestond niet vóór deze ronde.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as L from "../../src/cards/weerstation-logica.js";

const dump = JSON.parse(readFileSync(new URL("./vaste-invoer/shelly-blu-weerstation.json", import.meta.url), "utf8"));
const ID = "sensor.weather_station_temperature";
const hass = (extra = {}) => ({
  entities: Object.fromEntries(dump.entities.map((e) => [e.entity_id, e])),
  states: { ...dump.states, ...extra },
});
// Met de attributen uit de dump: een sensor houdt zijn device_class ook als hij wegvalt.
const st = (id, state, eenheid) => ({
  entity_id: id,
  state,
  attributes: { ...dump.states[id]?.attributes, ...(eenheid ? { unit_of_measurement: eenheid } : {}) },
});

describe("de rollen op het apparaat", () => {
  it("vindt alles op de echte dump, en de stekker en de spanning horen er niet bij", () => {
    assert.deepEqual(L.weerRollen(hass(), ID), {
      regent: "binary_sensor.weather_station_moisture",
      licht: "sensor.weather_station_illuminance",
      uv: "sensor.weather_station_uv_index",
      richting: "sensor.weather_station_direction",
      batterij: "sensor.weather_station_battery",
      druk: "sensor.weather_station_pressure",
      dauwpunt: "sensor.weather_station_dew_point",
      vocht: "sensor.weather_station_humidity",
      neerslag: "sensor.weather_station_precipitation",
      wind: "sensor.weather_station_speed",
      windstoot: "sensor.weather_station_speed_2",
    });
  });

  it("het dauwpunt is geen tweede temperatuur", () => {
    const r = L.weerRollen(hass(), ID);
    assert.equal(r.dauwpunt, "sensor.weather_station_dew_point");
  });

  it("werkt ook met andere namen: alleen het apparaat telt", () => {
    const h = {
      entities: {
        "sensor.buiten_t": { entity_id: "sensor.buiten_t", device_id: "x" },
        "sensor.a": { entity_id: "sensor.a", device_id: "x", translation_key: "uv_index" },
        "sensor.b": { entity_id: "sensor.b", device_id: "y", translation_key: "dew_point" },
      },
      states: {},
    };
    assert.deepEqual(L.weerRollen(h, "sensor.buiten_t"), { uv: "sensor.a" });
  });

  it("de buren apart: zo hoeft de kaart niet bij elke wijziging alle entiteiten door te lopen", () => {
    const h = hass();
    const buren = L.burenVan(h, ID);
    assert.equal(buren.length, 12);
    assert.deepEqual(L.weerRollen(h, ID, {}, buren), L.weerRollen(h, ID));
    assert.deepEqual(L.burenVan({ entities: {} }, "sensor.los"), []);
  });

  it("een rol in de config gaat voor, en zonder apparaat telt alleen de config", () => {
    assert.equal(L.weerRollen(hass(), ID, { wind: "sensor.eigen" }).wind, "sensor.eigen");
    assert.deepEqual(L.weerRollen({ entities: {}, states: {} }, "sensor.los", { druk: "sensor.d" }), { druk: "sensor.d" });
  });
});

describe("weerStand op de dump", () => {
  it("zegt wat er op de kaart hoort", () => {
    const s = L.weerStand(hass(), ID, L.weerRollen(hass(), ID));
    assert.equal(s.bereikbaar, true);
    assert.equal(s.temperatuur, "24,7 °C");
    assert.equal(s.vocht, "39 %");
    assert.equal(s.dauwpunt, "9,8 °C");
    assert.equal(s.wind, "0,9 m/s");
    assert.equal(s.stoot, "0,9 m/s");
    assert.equal(s.richting, 104);
    assert.equal(s.streek, "O");
    assert.equal(s.regent, false);
    assert.equal(s.neerslag, "0,0 mm");
    assert.equal(s.uv, "5");
    assert.deepEqual(s.uvSchaal, { woord: "Matig", tone: "warn" });
    assert.equal(s.licht, "78.000 lx");
    assert.equal(s.druk, "1.011,8 hPa");
    assert.equal(s.batterijLaag, null);
  });

  it("regen, een lege batterij en een sensor die wegvalt", () => {
    const h = hass({
      "binary_sensor.weather_station_moisture": st("binary_sensor.weather_station_moisture", "on"),
      "sensor.weather_station_battery": st("sensor.weather_station_battery", "12", "%"),
      "sensor.weather_station_pressure": st("sensor.weather_station_pressure", "unavailable", "mbar"),
      "sensor.weather_station_uv_index": st("sensor.weather_station_uv_index", "unknown"),
    });
    const s = L.weerStand(h, ID, L.weerRollen(h, ID));
    assert.equal(s.regent, true);
    assert.equal(s.batterijLaag, 12);
    assert.equal(s.druk, null);
    assert.equal(s.uv, null);
    assert.equal(s.uvSchaal, null);
  });

  it("de hoofdsensor weg is niet bereikbaar", () => {
    const h = hass({ [ID]: st(ID, "unavailable", "°C") });
    assert.equal(L.weerStand(h, ID, L.weerRollen(h, ID)).bereikbaar, false);
  });

  it("wind en stoot verkeerd om worden rechtgezet: een stoot is nooit lager", () => {
    const h = hass({
      "sensor.weather_station_speed": st("sensor.weather_station_speed", "4", "m/s"),
      "sensor.weather_station_speed_2": st("sensor.weather_station_speed_2", "1.5", "m/s"),
    });
    const s = L.weerStand(h, ID, L.weerRollen(h, ID));
    assert.equal(s.wind, "1,5 m/s");
    assert.equal(s.stoot, "4,0 m/s");
    assert.equal(s.windEntiteit, "sensor.weather_station_speed_2");
  });
});

describe("de wind", () => {
  const w = st("x", "10", "m/s");
  it("in de gekozen eenheid", () => {
    assert.equal(L.windTekst(w), "10,0 m/s");
    assert.equal(L.windTekst(w, "kmh"), "36 km/h");
    assert.equal(L.windTekst(w, "ms"), "10,0 m/s");
    assert.equal(L.windTekst(w, "bft"), "5 Bft");
    assert.equal(L.windTekst(st("x", "36", "km/h"), "ms"), "10,0 m/s");
    assert.equal(L.windTekst(st("x", "unknown", "m/s"), "kmh"), null);
  });
  it("een onbekende eenheid blijft staan zoals hij is", () => {
    assert.equal(L.windTekst(st("x", "3", "bananen"), "kmh"), "3,0 bananen");
  });
  it("Beaufort volgt de tabel", () => {
    assert.deepEqual([0, 0.3, 1.5, 3.4, 10.7, 32.6, 32.7, 50].map(L.beaufort), [0, 1, 1, 3, 5, 11, 12, 12]);
  });
  it("de windstreek", () => {
    assert.deepEqual([0, 22, 23, 90, 104, 180, 270, 337, 338, 360, -90].map(L.windstreek), ["N", "N", "NO", "O", "O", "Z", "W", "NW", "N", "N", "W"]);
    assert.equal(L.windstreek("unknown"), "");
  });
});

describe("de UV-schaal van de WHO", () => {
  it("heeft de vijf banden", () => {
    const woord = (n) => L.uvSchaal(n).woord;
    assert.deepEqual([0, 2, 3, 5, 6, 7, 8, 10, 11, 14].map(woord), ["Laag", "Laag", "Matig", "Matig", "Hoog", "Hoog", "Zeer hoog", "Zeer hoog", "Extreem", "Extreem"]);
    assert.equal(L.uvSchaal(2.4).tone, "good");
    assert.equal(L.uvSchaal(2.6).tone, "warn");
    assert.equal(L.uvSchaal(null), null);
  });
});

describe("de trend van de luchtdruk", () => {
  const t0 = 1800000000;
  const p = (uur, s) => ({ s: String(s), lu: t0 + uur * 3600 });
  it("stijgend, dalend of gelijk over het venster", () => {
    assert.equal(L.drukTrend([p(0, 1010), p(1, 1011), p(3, 1012)]), "stijgt");
    assert.equal(L.drukTrend([p(0, 1012), p(3, 1010.5)]), "daalt");
    assert.equal(L.drukTrend([p(0, 1012), p(3, 1012.5)]), "gelijk");
  });
  it("te weinig of te kort zegt niets", () => {
    assert.equal(L.drukTrend([]), null);
    assert.equal(L.drukTrend(null), null);
    assert.equal(L.drukTrend([p(0, 1010)]), null);
    assert.equal(L.drukTrend([p(0, 1010), p(0.5, 1015)]), null);
    assert.equal(L.drukTrend([p(0, "unavailable"), p(3, 1015)]), null);
  });
  it("de volgorde telt niet, en het woord hoort erbij", () => {
    assert.equal(L.drukTrend([p(3, 1012), p(0, 1010)]), "stijgt");
    assert.equal(L.trendWoord("daalt"), "dalend");
    assert.equal(L.trendWoord(null), "");
  });
});

describe("merk, type en foto", () => {
  const FOTO = "/domotiapp_lovelace/afbeeldingen/weerstations/shelly-blu-weather-station.webp";
  // Zoals BTHome hem in hass.devices zet: geen fabrikant, en een algemeen model.
  const BTHOME = { manufacturer: null, model: "BTHome sensor", model_id: null };

  it("Automatisch kiest bij BTHome geen foto: daar staat niets over het merk", () => {
    assert.equal(L.weerstationAfbeelding({}, BTHOME), "");
    assert.equal(L.weerstationAfbeelding({ merk: "auto" }, BTHOME), "");
  });

  it("Automatisch herkent hem wel als het apparaat het meldt", () => {
    assert.equal(L.weerstationAfbeelding({}, { manufacturer: "Shelly", model: "SBWS-90CM" }), FOTO);
  });

  it("zelf gekozen: de foto, een eigen, of geen", () => {
    assert.equal(L.weerstationAfbeelding({ merk: "shelly" }, BTHOME), FOTO);
    assert.equal(L.weerstationAfbeelding({ merk: "shelly", model: "blu_weather_station" }, BTHOME), FOTO);
    assert.equal(L.weerstationAfbeelding({ merk: "eigen", image: "/local/x.png" }, BTHOME), "/local/x.png");
    assert.equal(L.weerstationAfbeelding({ merk: "eigen" }, BTHOME), "");
    assert.equal(L.weerstationAfbeelding({ merk: "geen", image: "/local/x.png" }, BTHOME), "");
  });

  it("de foto staat in de repo, op de plek die de lijst noemt", () => {
    const pad = L.WEERSTATIONS.shelly.modellen.blu_weather_station.pad;
    const inhoud = readFileSync(new URL(`../../custom_components/domotiapp_lovelace/afbeeldingen/${pad}`, import.meta.url));
    assert.equal(inhoud.subarray(8, 12).toString(), "WEBP");
  });
});
