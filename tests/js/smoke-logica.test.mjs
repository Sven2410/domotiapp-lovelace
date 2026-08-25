/**
 * De rangorde van de rookmelderkaart.
 *
 * Eén regel op de kaart moet zeggen wat er aan de hand is, en er kunnen vijf
 * dingen tegelijk waar zijn: de melder gaat af, de batterij is leeg, de sensor
 * is weg. Welke wint is geen smaak maar veiligheid, en daarom staat die
 * volgorde in een eigen bestand met deze tests eronder.
 *
 * NIEUW GEDRAG: `smoke-logica.js` bestond niet vóór deze ronde.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  BATTERIJ_LAAG,
  SOORTEN,
  batterijPct,
  rustWoord,
  toestand,
} from "../../src/cards/smoke-logica.js";

const st = (entity_id, state) => ({ entity_id, state, attributes: {} });

/** Bouw een leesfunctie uit een plat object van sleutel -> state. */
const lezer = (kaart) => (sleutel) => kaart[sleutel] ?? null;

const soort = (...sleutels) => SOORTEN.filter((s) => sleutels.includes(s.sleutel));

describe("wat er op een pil staat als er niets aan de hand is — GEWIJZIGD GEDRAG", () => {
  // Er stond overal "Rustig". Naast het woord "Rook" is dat geen antwoord op de
  // vraag die de pil stelt: er is geen rook, dus daar hoort "Geen" te staan.
  // Gevraagd door de eigenaar op 25 augustus 2026.
  const van = (sleutel) => SOORTEN.find((x) => x.sleutel === sleutel);

  it("zegt Geen bij rook en bij koolmonoxide", () => {
    assert.equal(rustWoord(van("smoke")), "Geen");
    assert.equal(rustWoord(van("co")), "Geen");
  });

  it("zegt Normaal bij warmte, want warmte is er altijd", () => {
    assert.equal(rustWoord(van("heat")), "Normaal");
  });

  it("valt terug op Rustig voor iets zonder eigen woord", () => {
    assert.equal(rustWoord({ sleutel: "iets" }), "Rustig");
    assert.equal(rustWoord(null), "Rustig");
  });
});

describe("de iconen van de soorten — GEWIJZIGD GEDRAG", () => {
  const van = (sleutel) => SOORTEN.find((x) => x.sleutel === sleutel);

  it("geeft koolmonoxide zijn eigen icoon in plaats van een waarschuwingsdriehoek", () => {
    // Een driehoek met uitroepteken zegt "let op" en niet "CO". Op een kaart
    // waar rook, warmte en batterij naast elkaar staan is dat verschil het punt.
    assert.equal(van("co").icoon, "co");
  });

  it("laat rook de rook houden", () => {
    assert.equal(van("smoke").icoon, "smoke");
  });
});

describe("toestand()", () => {
  it("rustig is rustig", () => {
    const nu = toestand(
      soort("smoke", "battery"),
      lezer({ smoke: st("binary_sensor.rook", "off"), battery: st("sensor.batterij", "88") })
    );
    assert.equal(nu.soort, "goed");
    assert.equal(nu.tekst, "Alles rustig");
    assert.equal(nu.tone, "good");
    // GEWIJZIGD GEDRAG: in rust toont de kop het APPARAAT, niet een rookpluim.
    // Een pluim naast "Alles rustig" leest als rook die er niet is.
    assert.equal(nu.icoon, "smokeDetector");
  });

  it("rook verslaat alles", () => {
    const nu = toestand(
      soort("smoke", "co", "battery"),
      lezer({
        smoke: st("binary_sensor.rook", "on"),
        co: st("binary_sensor.co", "on"),
        battery: st("sensor.batterij", "3"),
      })
    );
    assert.equal(nu.soort, "alarm");
    assert.equal(nu.tekst, "Rook gedetecteerd");
    assert.equal(nu.tone, "bad");
  });

  it("koolmonoxide en warmte melden zichzelf, elk met hun eigen zin", () => {
    assert.equal(
      toestand(soort("co"), lezer({ co: st("binary_sensor.co", "on") })).tekst,
      "Koolmonoxide gedetecteerd"
    );
    assert.equal(
      toestand(soort("heat"), lezer({ heat: st("binary_sensor.warmte", "on") })).tekst,
      "Te warm"
    );
  });

  it("een lege batterij verslaat 'alles rustig', want een melder die niet kan melden is geen melder", () => {
    const nu = toestand(
      soort("smoke", "battery"),
      lezer({ smoke: st("binary_sensor.rook", "off"), battery: st("sensor.batterij", "11") })
    );
    assert.equal(nu.soort, "batterij");
    assert.equal(nu.tekst, "Batterij bijna leeg (11%)");
    assert.equal(nu.tone, "warn");
  });

  it("maar rook verslaat een lege batterij weer", () => {
    const nu = toestand(
      soort("smoke", "battery"),
      lezer({ smoke: st("binary_sensor.rook", "on"), battery: st("sensor.batterij", "2") })
    );
    assert.equal(nu.soort, "alarm");
  });

  it("precies op de grens telt als bijna leeg", () => {
    const nu = toestand(
      soort("smoke", "battery"),
      lezer({
        smoke: st("binary_sensor.rook", "off"),
        battery: st("sensor.batterij", String(BATTERIJ_LAAG)),
      })
    );
    assert.equal(nu.soort, "batterij");
  });

  it("alles weg is niet hetzelfde als rustig", () => {
    const nu = toestand(
      soort("smoke", "battery"),
      lezer({
        smoke: st("binary_sensor.rook", "unavailable"),
        battery: st("sensor.batterij", "unavailable"),
      })
    );
    assert.equal(nu.soort, "weg");
    assert.equal(nu.tekst, "Niet bereikbaar");
  });

  it("één weggevallen sensor is nog geen kapotte melder", () => {
    const nu = toestand(
      soort("smoke", "temperature"),
      lezer({
        smoke: st("binary_sensor.rook", "off"),
        temperature: st("sensor.temp", "unavailable"),
      })
    );
    assert.equal(nu.soort, "goed");
  });

  it("alleen metingen ingevuld: dan belooft de kaart niets", () => {
    const nu = toestand(
      soort("temperature", "battery"),
      lezer({ temperature: st("sensor.temp", "21.4"), battery: st("sensor.batterij", "90") })
    );
    assert.equal(nu.soort, "meting");
    assert.equal(nu.tekst, "");
  });
});

describe("batterijPct()", () => {
  it("leest een percentage", () => {
    assert.equal(batterijPct(st("sensor.batterij", "73")), 73);
  });

  it("een binaire 'bijna leeg'-sensor telt als nul zodra hij aanslaat", () => {
    assert.equal(batterijPct(st("binary_sensor.batterij_laag", "on")), 0);
    assert.equal(batterijPct(st("binary_sensor.batterij_laag", "off")), null);
  });

  it("en onzin levert niets op in plaats van NaN", () => {
    assert.equal(batterijPct(st("sensor.batterij", "onbekend")), null);
    assert.equal(batterijPct(st("sensor.batterij", "unavailable")), null);
    assert.equal(batterijPct(null), null);
  });
});
