/**
 * De tankstations op de brandstofkaart (0.144.0): van het meegeleverde bestand naar zoeken. **NIEUW GEDRAG**: dit
 * bestaat op 0.143.0 niet. De invoer is het echte bestand (`gegevens/tankstations-nl.json`, OpenStreetMap, ODbL).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as B from "../../src/cards/brandstof-logica.js";

const DATA = JSON.parse(readFileSync(new URL("../../custom_components/domotiapp_lovelace/gegevens/tankstations-nl.json", import.meta.url), "utf8"));
const STATIONS = DATA.stations.map((rij) => B.stationUit(rij, DATA.velden));
const UTRECHT = { lat: 52.09, lon: 5.12 };
const kort = (s) => `${B.stationNaam(s)} | ${s.plaats}`;

describe("de tankstations", () => {
  it("een rij wordt een station, met de brandstoffen in woorden", () => {
    const s = B.stationUit([52.0, 5.8, "Esso Arnhem Slenkweg", "Esso", "Slenkweg 1", "6816VX", "Arnhem", "24/7", "d9l"], DATA.velden);
    assert.deepEqual(s, {
      lat: 52, lon: 5.8, naam: "Esso Arnhem Slenkweg", merk: "Esso", adres: "Slenkweg 1", postcode: "6816VX", plaats: "Arnhem",
      open: "24/7", brandstoffen: ["Diesel", "Euro95", "LPG"],
    });
    assert.equal(B.stationNaam({ naam: "", merk: "" }), "Tankstation");
    assert.equal(B.openingstijden("24/7"), "Dag en nacht open");
    assert.equal(B.openingstijden("Mo-Su 06:00-23:00"), "Open: ma-zo 06:00-23:00");
    assert.equal(B.openingstijden("PH,Mo-Su 07:00-21:00"), "Open: feestdagen, ma-zo 07:00-21:00");
    assert.equal(B.openingstijden("Mo-Fr 06:00-22:00; Sa,Su 08:00-20:00; PH off"), "Open: ma-vr 06:00-22:00; za, zo 08:00-20:00; feestdagen dicht");
    assert.equal(B.openingstijden(""), "");
    assert.equal(B.routeLink(s), "https://www.google.com/maps/dir/?api=1&destination=52,5.8");
  });

  it("zoeken: elk woord moet voorkomen, in elke volgorde, zonder accenten of leestekens", () => {
    const esso = B.zoekStations(STATIONS, "arnhem esso", { max: 3 }).map(kort);
    assert.ok(esso.length === 3 && esso.every((x) => x.startsWith("Esso") && x.endsWith("Arnhem")), esso.join(", "));
    assert.deepEqual(B.zoekStations(STATIONS, "esso   ARNHEM", { max: 3 }).map(kort), esso);
    const bosch = B.zoekStations(STATIONS, "s hertogenbosch", { max: 50 });
    assert.ok(bosch.length > 5 && bosch.every((s) => s.plaats === "'s-Hertogenbosch"));
    assert.deepEqual(B.zoekStations(STATIONS, "   "), []);
    assert.deepEqual(B.zoekStations(STATIONS, "bestaatnietxyz"), []);
  });

  it("bij gelijke stand het dichtst bij huis: met een huis in Utrecht eerst een TinQ in Utrecht", () => {
    assert.equal(kort(B.zoekStations(STATIONS, "tinq", { max: 1, bij: UTRECHT })[0]), "TinQ | Utrecht");
  });

  it("een merk telt zwaarder dan een straat met dezelfde naam", () => {
    const uit = B.zoekStations([
      { naam: "Tango", merk: "Tango", adres: "Dorpsstraat 1", plaats: "Ergens", postcode: "" },
      { naam: "BP", merk: "BP", adres: "Tangostraat 2", plaats: "Ergens", postcode: "" },
    ], "tango").map((s) => s.merk);
    assert.deepEqual(uit, ["Tango", "BP"]);
  });

  it("NIEUW GEDRAG (0.144.1): weet OpenStreetMap het niet, dan staat er onbekend", () => {
    const leeg = STATIONS.find((x) => !x.open && !x.brandstoffen.length && x.plaats);
    assert.ok(leeg, "er is een station zonder openingstijden en brandstoffen");
    assert.deepEqual(B.stationRegels(leeg), {
      open: { tekst: "Openingstijden onbekend", bekend: false },
      brandstoffen: { soorten: [], tekst: "Brandstoffen onbekend", bekend: false },
    });
    const vol = STATIONS.find((x) => x.open === "24/7" && x.brandstoffen.includes("LPG"));
    const regels = B.stationRegels(vol);
    assert.deepEqual(regels.open, { tekst: "Dag en nacht open", bekend: true });
    assert.ok(regels.brandstoffen.bekend && regels.brandstoffen.soorten.includes("LPG") && regels.brandstoffen.tekst === "");
  });
});
