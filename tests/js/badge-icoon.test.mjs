/**
 * Waar het icoon van een badge vandaan komt, en welke kleurnaam wat betekent.
 *
 * NIEUW GEDRAG (17 september 2026). `src/badges/template-badge.js` bestond niet
 * vóór deze ronde; op de code van ervoor faalt dit bestand met
 * ERR_MODULE_NOT_FOUND.
 *
 * ## Waarom dit twee dingen toetst en geen browser nodig heeft
 *
 * **Het icoon** komt uit twee velden. De eigenaar wilde kunnen kiezen uit onze
 * eigen set ("zorg wel dat ik de icons kan kiezen uit onze eigen icon
 * bibliotheek"), en tegelijk moest zijn bestaande YAML blijven werken -- daar
 * staat de Jinja gewoon in `icon`. Dat zijn drie gevallen die door elkaar
 * lopen, en geen enkele ervan geeft een fout als hij verkeerd valt: je krijgt
 * dan het verkeerde icoon of geen icoon, zonder dat er iets in de console
 * verschijnt.
 *
 * **De kleurnaam** is er ingeslopen bij het meten op de echte instance: het
 * veld heeft een Nederlandse hulptekst, `toneValue` kent alleen Engelse
 * sleutels, en "goed" gaf daardoor stilzwijgend het accent in plaats van groen.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { heeftAanUit, icoonBron, kleurnaam } from "../../src/badges/badge-logica.js";

describe("icoonBron", () => {
  it("gebruikt wat de kiezer schreef", () => {
    assert.equal(icoonBron({ icon: "bulb" }), "bulb");
    assert.equal(icoonBron({ icon: "mdi:fire" }), "mdi:fire");
  });

  it("laat het sjabloonveld winnen van het gekozen icoon", () => {
    assert.equal(
      icoonBron({ icon: "bulb", icon_template: "{% if x %}mdi:fire{% endif %}" }),
      "{% if x %}mdi:fire{% endif %}",
    );
  });

  it("negeert een sjabloonveld dat alleen witruimte bevat", () => {
    // Een veld dat je leegmaakt houdt in ha-form makkelijk een spatie of een
    // regeleinde over; dat mag het gekozen icoon niet wegdrukken.
    assert.equal(icoonBron({ icon: "bulb", icon_template: "   \n " }), "bulb");
    assert.equal(icoonBron({ icon: "bulb", icon_template: "" }), "bulb");
  });

  it("laat Jinja die in `icon` staat gewoon staan (zijn bestaande YAML)", () => {
    // Dit is letterlijk de vorm uit de mushroom-badges van de eigenaar.
    const yaml = {
      icon: "{% set s = states(entity) %}{% if s == 'disarmed' %}mdi:alarm-light-off{% else %}mdi:alarm-light{% endif %}",
    };
    assert.equal(icoonBron(yaml), yaml.icon);
  });

  it("geeft lege tekst als er niets is", () => {
    // Geen icoon is een geldige badge: alleen een getal is ook een badge.
    assert.equal(icoonBron({}), "");
    assert.equal(icoonBron(null), "");
    assert.equal(icoonBron(undefined), "");
  });
});

describe("heeftAanUit", () => {
  it("zegt ja voor wat echt aan of uit kan", () => {
    assert.equal(heeftAanUit("light.woonkamer"), true);
    assert.equal(heeftAanUit("binary_sensor.rook"), true);
    assert.equal(heeftAanUit("lock.voordeur"), true);
  });

  it("zegt nee voor een keuzelijst en een sensor", () => {
    // Dit is de fout die op de testinstance zichtbaar werd: een vaatwasser op
    // "Run" stond gedempt alsof hij uit was.
    assert.equal(heeftAanUit("input_select.vaatwasser_status"), false);
    assert.equal(heeftAanUit("sensor.verbruik"), false);
    assert.equal(heeftAanUit("input_number.rest"), false);
  });

  it("valt niet over niets", () => {
    assert.equal(heeftAanUit(undefined), false);
    assert.equal(heeftAanUit(""), false);
  });
});

describe("kleurnaam", () => {
  it("vertaalt de Nederlandse statusnamen uit de hulptekst", () => {
    assert.equal(kleurnaam("goed"), "good");
    assert.equal(kleurnaam("let op"), "warn");
    assert.equal(kleurnaam("kritiek"), "bad");
  });

  it("trekt zich niets aan van hoofdletters en witruimte", () => {
    // Een sjabloon met `{% if %}` erin levert vrijwel altijd witruimte op.
    assert.equal(kleurnaam("  Goed \n"), "good");
    assert.equal(kleurnaam("KRITIEK"), "bad");
  });

  it("laat de Engelse sleutels ongemoeid", () => {
    assert.equal(kleurnaam("good"), "good");
    assert.equal(kleurnaam("accent"), "accent");
    assert.equal(kleurnaam("solar"), "solar");
  });

  it("laat een kleur die geen naam is ongewijzigd door", () => {
    assert.equal(kleurnaam("#ff0000"), "#ff0000");
    assert.equal(kleurnaam("var(--dac-good)"), "var(--dac-good)");
  });

  it("geeft lege tekst voor leeg, zodat de toestand het overneemt", () => {
    assert.equal(kleurnaam(""), "");
    assert.equal(kleurnaam("   "), "");
    assert.equal(kleurnaam(undefined), "");
    assert.equal(kleurnaam(null), "");
  });
});
