/**
 * De locatie en de laadstatus van de autokaart — NIEUW GEDRAG.
 *
 * Gemeld op 27 augustus 2026, met zijn eigen gegevens erbij:
 *
 *   *"mijn 'waar staat de auto'-sensor is een coordinaat:
 *   {'lat': 51.92909, 'lon': 6.07115, 'alt': 15.0}. Kan je dat converteren naar
 *   thuis of afwezig? Bepaal dat met de ingestelde locatie van Home Assistant.
 *   Maak hem universeel dat hij ook kan uitlezen als een sensor wel thuis of
 *   afwezig toont."*
 *
 *   *"Wat doet laadstatus? Want als ik daar sensor…elvehcharging in vul, die
 *   staat nu op NOT_PLUGGED_IN, dan zie ik niks."*
 *
 * Beide waarden staan hieronder letterlijk in de tests. Zijn Home Assistant
 * staat op 51.9291212 / 6.0712106 — read-only nagemeten — en dat is vijf meter
 * van die autocoordinaat.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  THUIS_STRAAL_M,
  afstandM,
  coordinaatVan,
  laadStand,
  laadTekst,
  locatie,
} from "../../src/cards/auto-logica.js";

/** Zijn Home Assistant, zoals gemeten op 27 augustus 2026. */
const HASS = { config: { latitude: 51.9291212, longitude: 6.0712106 } };

/** Zijn sensor, letterlijk zoals hij hem opstuurde. */
const ZIJN_SENSOR = {
  state: "{'lat': 51.92909, 'lon': 6.07115, 'alt': 15.0}",
  attributes: {},
};

describe("coordinaatVan — NIEUW GEDRAG", () => {
  it("leest zijn eigen sensor, mét de apostrofs", () => {
    // De apostrof zit TUSSEN de naam en de dubbele punt. Zonder daarop te
    // rekenen matcht er niets en valt de kaart terug op "we weten het niet".
    assert.deepEqual(coordinaatVan(ZIJN_SENSOR), { lat: 51.92909, lon: 6.07115 });
  });

  it("leest ook JSON en losse attributen", () => {
    assert.deepEqual(coordinaatVan({ state: '{"lat": 52.1, "lon": 5.2}' }), {
      lat: 52.1,
      lon: 5.2,
    });
    assert.deepEqual(coordinaatVan({ state: "x", attributes: { latitude: 52.1, longitude: 5.2 } }), {
      lat: 52.1,
      lon: 5.2,
    });
    assert.deepEqual(coordinaatVan({ state: "lat=52.1 lng=5.2" }), { lat: 52.1, lon: 5.2 });
  });

  it("geeft null als er geen coordinaat in zit", () => {
    assert.equal(coordinaatVan({ state: "home" }), null);
    assert.equal(coordinaatVan(null), null);
  });
});

describe("afstandM — REGRESSIEWACHT", () => {
  it("rekent de afstand tussen twee punten in meters", () => {
    // Deventer-ish naar Amsterdam is ongeveer 94 km.
    const m = afstandM(51.9291212, 6.0712106, 52.37, 4.89);
    assert.ok(m > 90000 && m < 100000, `verwacht ~94 km, kreeg ${Math.round(m)} m`);
  });

  it("hetzelfde punt is nul", () => {
    assert.equal(Math.round(afstandM(51.9, 6.07, 51.9, 6.07)), 0);
  });
});

describe("locatie — de vier vormen — NIEUW GEDRAG", () => {
  it("zijn coordinaat is THUIS, op vijf meter", () => {
    const uit = locatie(ZIJN_SENSOR, HASS);
    assert.equal(uit.thuis, true);
    assert.equal(uit.tekst, "Thuis");
    assert.ok(uit.meters <= 10, `verwacht een paar meter, kreeg ${uit.meters}`);
  });

  it("een coordinaat ver weg is afwezig, met de afstand erbij", () => {
    const uit = locatie({ state: "{lat: 52.37, lon: 4.89}" }, HASS);
    assert.equal(uit.thuis, false);
    assert.equal(uit.tekst, "Afwezig");
    assert.ok(uit.meters > 90000);
  });

  it("een tracker die home zegt wordt geloofd, zonder rekenwerk", () => {
    // Die kent de zone zoals de gebruiker hem heeft ingesteld; dat weet hij
    // beter dan wij met een straal eromheen.
    assert.deepEqual(locatie({ state: "home" }, HASS), {
      thuis: true,
      tekst: "Thuis",
      meters: null,
    });
    assert.equal(locatie({ state: "not_home" }, HASS).tekst, "Afwezig");
    assert.equal(locatie({ state: "Thuis" }, HASS).thuis, true);
  });

  it("een zonenaam blijft staan zoals hij heet", () => {
    const uit = locatie({ state: "werk" }, HASS);
    assert.equal(uit.tekst, "Werk");
    assert.equal(uit.thuis, false);
  });

  it("niets weten is niet hetzelfde als afwezig", () => {
    // `thuis: null` -- de kaart hoort dan geen "Afwezig" te tonen.
    assert.equal(locatie({ state: "unknown" }, HASS).thuis, null);
    assert.equal(locatie({ state: "unavailable" }, HASS).thuis, null);
    assert.equal(locatie(null, HASS).thuis, null);
  });

  it("de straal is instelbaar", () => {
    const dichtbij = { state: "{lat: 51.9295, lon: 6.0712}" };
    assert.equal(locatie(dichtbij, HASS, 100).thuis, true);
    assert.equal(locatie(dichtbij, HASS, 10).thuis, false);
    assert.equal(THUIS_STRAAL_M, 100);
  });

  it("zonder locatie in Home Assistant wordt er niets gegokt", () => {
    const uit = locatie(ZIJN_SENSOR, { config: {} });
    assert.equal(uit.thuis, false);
    assert.equal(uit.meters, null);
  });
});

describe("laadStand met zijn eigen sensor — NIEUW GEDRAG", () => {
  it("NOT_PLUGGED_IN is 'niet aan de lader' en niet 'onbekend'", () => {
    // Dit is de melding: het veld was ingevuld en er stond niets op de kaart.
    assert.equal(laadStand({ state: "NOT_PLUGGED_IN" }), "idle");
    assert.equal(laadTekst("idle", { state: "NOT_PLUGGED_IN" }), "Niet aan de lader");
  });

  it("een woord dat we niet kennen komt er zelf op te staan", () => {
    // Beter dan een lege kaart: zo is meteen te zien wélk woord ontbreekt.
    assert.equal(laadStand({ state: "WAITING_FOR_SCHEDULE" }), "onbekend");
    assert.equal(
      laadTekst("onbekend", { state: "WAITING_FOR_SCHEDULE" }),
      "Waiting for schedule"
    );
  });

  it("de standen die we wél kennen houden hun eigen woord", () => {
    assert.equal(laadTekst("charging", { state: "CHARGING" }), "Aan het laden");
    assert.equal(laadTekst("complete", { state: "FULLY_CHARGED" }), "Volgeladen");
    assert.equal(laadTekst("connected", { state: "PLUGGED_IN" }), "Aan de lader");
  });

  it("zonder sensor staat er niets", () => {
    assert.equal(laadStand(null), null);
    assert.equal(laadTekst(null, null), "");
    assert.equal(laadTekst("onbekend", { state: "unknown" }), "");
  });
});
