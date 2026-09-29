/**
 * Kleuren op de badge, en de soorten Energie en Alarm — NIEUW GEDRAG (0.51.0).
 *
 * Gevraagd op 29 september 2026: *"bij die badges kan ik de kleur niet instellen
 * nu is de lampen blauw maar die wil ik de kleur van de verlichting hebben (...)
 * Dan wil ik ook een optie ipv lampenteller voor energie (...) <0 tm 1000w (1kw)
 * is groen 1kw tot 5kw is oranje en daarboven rood (...) Alarm badge ook.
 * Uitgeschakeld en ingeschakeld en deelingeschakeld ook de kleuren in kunnen
 * vullen. status zelf invullen die ik uit de atributen haal (...) DIe kleur
 * dinges werkt nu niet namelijk"*
 *
 * Pure logica, geen browser (CLAUDE.md). Met `import *`, zodat dit bestand ook
 * tegen de code van vóór deze ronde laadt en daar faalt op wat er gebeurt.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import * as badge from "../../src/badges/badge-logica.js";

const fn = (naam) => {
  assert.equal(typeof badge[naam], "function", `${naam} bestaat niet`);
  return badge[naam];
};

describe("kleurCss() — waarom het kleurveld niet werkte", () => {
  it("kent de namen van Mushroom, waar zijn badges vandaan kwamen", () => {
    const k = fn("kleurCss");
    assert.equal(k("red"), "var(--dac-bad)");
    assert.equal(k("green"), "var(--dac-good)");
    assert.equal(k("amber"), "var(--dac-warn)");
    assert.equal(k("orange"), "var(--dac-solar)");
    assert.equal(k("grey"), "var(--dac-ink-3)");
    assert.equal(k("blue"), "var(--dac-accent-hi)");
  });

  it("kent de keuzes uit de lijst in de editor", () => {
    const k = fn("kleurCss");
    for (const [sleutel] of badge.KLEUREN) assert.ok(k(sleutel), `${sleutel} geeft geen kleur`);
    // Blauw is het accent, het blauw van het merk -- niet het identiteitsblauw.
    assert.equal(k("blauw"), "var(--dac-accent-hi)");
    assert.equal(k("lamp"), "var(--dac-lit)");
  });

  it("laat #hex, rgb() en var() door, en hoofdletters maken niet uit", () => {
    const k = fn("kleurCss");
    assert.equal(k("#FF8800"), "#FF8800");
    assert.equal(k("rgb(1, 2, 3)"), "rgb(1, 2, 3)");
    assert.equal(k("  Rood "), "var(--dac-bad)");
    assert.equal(k("Let op"), "var(--dac-warn)");
  });

  it("een gewone CSS-naam alleen als de browser hem kent", () => {
    const k = fn("kleurCss");
    assert.equal(k("olive", () => true), "olive");
    assert.equal(k("onzin", () => false), null);
  });

  it("niets is niets, en geen terugval op blauw", () => {
    assert.equal(fn("kleurCss")(""), null);
    assert.equal(fn("kleurCss")(undefined), null);
  });
});

describe("lampKleur() — de lampenteller in de kleur van de verlichting", () => {
  const states = {
    "light.a": { attributes: { rgb_color: [255, 170, 90] } },
    "light.b": { attributes: { rgb_color: [255, 180, 100] } },
    "light.c": { attributes: {} },
  };

  it("het gemiddelde van de lampen die een kleur melden", () => {
    assert.equal(fn("lampKleur")(states, ["light.a", "light.b", "light.c"]), "rgb(255,175,95)");
  });

  it("null als geen enkele lamp een kleur meldt", () => {
    assert.equal(fn("lampKleur")(states, ["light.c"]), null);
    assert.equal(fn("lampKleur")(states, []), null);
  });
});

describe("badgeSoort()", () => {
  it("leest mode, en light_counter uit 0.49.0 is een lampenteller", () => {
    const s = fn("badgeSoort");
    assert.equal(s({ mode: "energy" }), "energy");
    assert.equal(s({ mode: "alarm" }), "alarm");
    assert.equal(s({ light_counter: true }), "lights");
    assert.equal(s({ mode: "tekst" }), "");
    assert.equal(s({}), "");
  });
});

describe("vermogen() en energieBand() — zijn voorbeeld", () => {
  const sensor = (state, unit = "W") => ({ state: String(state), attributes: { unit_of_measurement: unit } });
  const config = { mode: "energy" };

  it("schrijft het zoals zijn badge het nu doet, en boven 1 kW in kW", () => {
    const v = fn("vermogen");
    assert.equal(v(sensor(-411)).tekst, "-411 W");
    assert.equal(v(sensor(4217)).tekst, "4,2 kW");
    assert.equal(v(sensor(1.25, "kW")).tekst, "1,3 kW");
    assert.equal(v(sensor(1.25, "kW")).watt, 1250);
    assert.equal(v(sensor("unavailable")), null);
  });

  it("<0 t/m 1000 W groen, tot en met 5 kW oranje, daarboven rood", () => {
    const band = (w) => badge.energieKleur(fn("energieBand")(w, config), config);
    assert.equal(band(-411), "groen");
    assert.equal(band(1000), "groen");
    assert.equal(band(1001), "oranje");
    assert.equal(band(5000), "oranje");
    assert.equal(band(5001), "rood");
  });

  it("met zijn eigen grenzen en kleuren", () => {
    const eigen = { mode: "energy", energy_green_max: 500, energy_orange_max: 2000, energy_color_high: "geel" };
    const band = (w) => badge.energieKleur(fn("energieBand")(w, eigen), eigen);
    assert.equal(band(600), "oranje");
    assert.equal(band(2500), "geel");
  });
});

describe("alarmStand() — de status zelf invullen", () => {
  const alarm = (state, attributes = {}) => ({ state, attributes });

  it("herkent de standaardstatussen van Home Assistant", () => {
    const stand = (st) => fn("alarmStand")(st, { mode: "alarm" }).stand?.stand;
    assert.equal(stand(alarm("disarmed")), "disarmed");
    assert.equal(stand(alarm("armed_home")), "partial");
    assert.equal(stand(alarm("armed_night")), "partial");
    assert.equal(stand(alarm("armed_away")), "armed");
    assert.equal(stand(alarm("triggered")), undefined);
  });

  it("leest de status uit een attribuut als hij dat vraagt, met zijn eigen waarden", () => {
    const config = {
      mode: "alarm",
      alarm_attribute: "arm_mode",
      alarm_disarmed: "Uit",
      alarm_partial: "Nacht, Thuis",
      alarm_armed: "Weg",
    };
    const { waarde, stand } = fn("alarmStand")(alarm("on", { arm_mode: "thuis" }), config);
    assert.equal(waarde, "thuis");
    assert.equal(stand.stand, "partial");
    assert.equal(stand.tekst, "Deels ingeschakeld");
    assert.equal(badge.alarmKleur(stand, config), "oranje");
  });

  it("de kleuren per stand, en zijn eigen keuze wint", () => {
    const standaard = { mode: "alarm" };
    const uit = fn("alarmStand")(alarm("disarmed"), standaard).stand;
    const aan = fn("alarmStand")(alarm("armed_away"), standaard).stand;
    assert.equal(badge.alarmKleur(uit, standaard), "groen");
    assert.equal(badge.alarmKleur(aan, standaard), "rood");
    assert.equal(badge.alarmKleur(uit, { mode: "alarm", alarm_disarmed_color: "grijs" }), "grijs");
  });
});
