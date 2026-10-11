/**
 * De vaatwasserkaart in combinatie met DomotiApp Coach.
 *
 * De eigenaar op 11 oktober 2026: de knoppen "Ingeruimd, morgen starten",
 * "Ingeruimd, nu starten" en "Handmatige besturing" uit het coachpaneel moeten
 * ook op de vaatwasserkaart, met een vinkje in de editor.
 *
 * Alles hier is NIEUW GEDRAG: de functies bestonden niet vóór deze ronde.
 *
 * De attributen zijn die van contract 1 (coach v0.110.0). De toestand van de
 * sensor staat er telkens bij als TEKST die de kaart niet leest -- valkuil 67:
 * de vorige keer is de kaart gebouwd tegen een toestand die een dag later
 * anders werd.
 *
 * Tijden staan in LOKALE tijd (`new Date(j, m, d, u, min)`), zodat de uitkomst
 * niet afhangt van de tijdzone van de machine die de test draait.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as V from "../../src/cards/vaatwasser-logica.js";

/** Zondag 11 oktober 2026, 10:00. */
const NU = new Date(2026, 9, 11, 10, 0);

const ROLLEN = {
  start: "sensor.vaatwasser_start",
  ingeruimd_morgen: "button.ingeruimd_morgen",
  ingeruimd_nu: "button.ingeruimd_nu",
  vrijgave_intrekken: "button.intrekken",
};

/** Een stand zoals `coachStand` hem teruggeeft. */
const stand = (extra = {}) => ({
  stand: "niet_vrijgegeven",
  vrijgegeven: false,
  nu: false,
  klaarOm: new Date(2026, 9, 11, 16, 30),
  type: "vaatwasser",
  ...extra,
});

const knoppen = (coach, extra = {}) =>
  V.coachKnoppen({ coach, rollen: ROLLEN, nu: NU, ...extra }).map((k) => [k.rol, k.label, k.entity, k.aan]);

describe("NIEUW GEDRAG: wat de coach zegt, uit de attributen", () => {
  it("leest stand, vrijgave en klaar-tijd, en niet de toestand", () => {
    const st = {
      entity_id: "sensor.vaatwasser_start",
      state: "morgen om 09:00",
      attributes: {
        stand: "gepland",
        vrijgegeven: true,
        nu: false,
        klaar_om: "2026-10-12T16:30:00+02:00",
        type: "vaatwasser",
      },
    };
    const c = V.coachStand(st);
    assert.equal(c.stand, "gepland");
    assert.equal(c.vrijgegeven, true);
    assert.equal(c.nu, false);
    assert.equal(+c.klaarOm, +new Date("2026-10-12T14:30:00Z"));
    assert.equal(c.type, "vaatwasser");

    // Dezelfde attributen met een andere tekst: dezelfde uitkomst.
    assert.deepEqual(V.coachStand({ ...st, state: "om 9 uur morgen, of zo" }), c);
  });

  it("neemt alleen echte booleans als ja", () => {
    const c = V.coachStand({ state: "", attributes: { vrijgegeven: "true", nu: 1 } });
    assert.equal(c.vrijgegeven, false);
    assert.equal(c.nu, false);
    assert.equal(c.klaarOm, null);
  });

  it("weet niets als de sensor er niet is of niet bereikbaar", () => {
    assert.equal(V.coachStand(null), null);
    assert.equal(V.coachStand({ state: "unavailable", attributes: { stand: "gepland" } }), null);
  });
});

describe("NIEUW GEDRAG: een status uit de coach, voor wie geen statussensor heeft", () => {
  it("draait als de coach zegt dat hij draait, en is klaar als hij klaar is", () => {
    assert.equal(V.soortVan(V.statusUitCoach(stand({ stand: "draait" })).state), V.SOORT.DRAAIT);
    assert.equal(V.soortVan(V.statusUitCoach(stand({ stand: "klaar" })).state), V.SOORT.AF);
  });

  it("staat klaar om te starten in de andere standen", () => {
    for (const s of ["niet_vrijgegeven", "gepland", "start_nu"]) {
      assert.equal(V.soortVan(V.statusUitCoach(stand({ stand: s })).state), V.SOORT.KLAAR, s);
    }
  });

  it("geeft niets zonder stand", () => {
    assert.equal(V.statusUitCoach(null), null);
    assert.equal(V.statusUitCoach(stand({ stand: "" })), null);
  });
});

describe("NIEUW GEDRAG: de knoppen van de coach", () => {
  it("biedt Ingeruimd en Nu starten aan zolang hij niet vrijgegeven is", () => {
    assert.deepEqual(knoppen(stand()), [
      ["vrijgave", "Ingeruimd", "button.ingeruimd_morgen", false],
      ["nu", "Nu starten", "button.ingeruimd_nu", false],
    ]);
  });

  it("zegt 'Morgen starten' als de klaar-tijd van vandaag voorbij is", () => {
    // Na 16:30 geeft de coach de klaar-tijd van morgen.
    const [vrij, nu] = V.coachKnoppen({
      coach: stand({ klaarOm: new Date(2026, 9, 12, 16, 30) }),
      rollen: ROLLEN,
      nu: NU,
    });
    assert.equal(vrij.label, "Morgen starten");
    assert.equal(vrij.aria, "Ingeruimd, morgen starten");
    assert.equal(nu.aria, "Ingeruimd, nu starten");
  });

  it("noemt de dag als de volgende klaar-tijd verder weg is", () => {
    // Het schema heeft maandag geen klaar-tijd: dan is de volgende dinsdag.
    const [vrij] = V.coachKnoppen({ coach: stand({ klaarOm: new Date(2026, 9, 13, 7, 0) }), rollen: ROLLEN, nu: NU });
    assert.equal(vrij.label, "Dinsdag starten");
  });

  it("zegt gewoon Ingeruimd zonder klaar-tijd", () => {
    const [vrij] = V.coachKnoppen({ coach: stand({ klaarOm: null }), rollen: ROLLEN, nu: NU });
    assert.equal(vrij.label, "Ingeruimd");
  });

  it("wordt 'Vrijgegeven' en trekt dan in, met Toch nu starten ernaast", () => {
    const k = V.coachKnoppen({ coach: stand({ stand: "gepland", vrijgegeven: true }), rollen: ROLLEN, nu: NU });
    assert.deepEqual(
      k.map((x) => [x.rol, x.label, x.entity, x.aan]),
      [
        ["vrijgave", "Vrijgegeven", "button.intrekken", true],
        ["nu", "Nu starten", "button.ingeruimd_nu", false],
      ]
    );
    assert.equal(k[1].aria, "Toch nu starten");
  });

  it("laat Nu starten weg als hij al nu start", () => {
    assert.deepEqual(knoppen(stand({ stand: "start_nu", vrijgegeven: true, nu: true })), [
      ["vrijgave", "Vrijgegeven", "button.intrekken", true],
    ]);
  });

  it("biedt niets aan zolang hij draait, volgens de coach of volgens de statussensor", () => {
    assert.deepEqual(knoppen(stand({ stand: "draait" })), []);
    assert.deepEqual(knoppen(stand(), { loopt: true }), []);
  });

  it("zet geen knop neer voor een entiteit die de coach niet levert", () => {
    const k = V.coachKnoppen({ coach: stand(), rollen: { ingeruimd_nu: "button.nu" }, nu: NU });
    assert.deepEqual(k.map((x) => x.rol), ["nu"]);
  });

  it("zegt Mag draaien bij een wasmachine, net als het paneel", () => {
    const [vrij, nu] = V.coachKnoppen({ coach: stand({ type: "wasmachine" }), rollen: ROLLEN, nu: NU });
    assert.equal(vrij.label, "Mag draaien");
    assert.equal(nu.aria, "Mag draaien, nu starten");
  });

  it("biedt na een afgelopen programma weer Ingeruimd aan", () => {
    assert.deepEqual(
      knoppen(stand({ stand: "klaar" })).map((k) => k[1]),
      ["Ingeruimd", "Nu starten"]
    );
  });

  it("weet zonder stand van niets", () => {
    assert.deepEqual(knoppen(null), []);
  });
});

describe("NIEUW GEDRAG: de velden die de coach invult", () => {
  it("vult lege velden uit wat de klant bij de coach koos", () => {
    const uit = V.metCoachVelden(
      { name: "Keuken", start: "" },
      { start: "button.start", stop: "button.stop", door: "binary_sensor.klep", power: "sensor.w" }
    );
    assert.deepEqual(uit, {
      name: "Keuken",
      start: "button.start",
      stop: "button.stop",
      door: "binary_sensor.klep",
    });
  });

  it("laat een veld uit de editor staan", () => {
    const uit = V.metCoachVelden({ door: "binary_sensor.eigen" }, { door: "binary_sensor.klep" });
    assert.equal(uit.door, "binary_sensor.eigen");
  });

  it("verandert de config zelf niet", () => {
    const config = Object.freeze({ name: "x" });
    V.metCoachVelden(config, { start: "button.start" });
    assert.deepEqual(config, { name: "x" });
  });
});

describe("NIEUW GEDRAG: waarom de knoppen er niet staan", () => {
  it("zegt het als er geen coach-apparaat is, als het er meer zijn en als het weg is", () => {
    assert.match(V.coachMelding({ reden: "geen" }, 0), /0\.110\.0/);
    assert.match(V.coachMelding({ reden: "meerdere" }, 0), /Kies in de editor/);
    assert.match(V.coachMelding({ reden: "weg" }, 0), /bestaat niet meer/);
  });

  it("vraagt om een nieuwere coach als zijn sensor geen contract heeft", () => {
    assert.match(V.coachMelding({ reden: "enige" }, 0), /Werk DomotiApp Coach bij/);
  });

  it("zegt niets als alles er is", () => {
    assert.equal(V.coachMelding({ reden: "gekozen" }, 1), "");
    assert.equal(V.coachMelding({ reden: "enige" }, 1), "");
  });
});
