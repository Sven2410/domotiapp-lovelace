/**
 * De vaatwasserkaart: tijd, toestand en rangorde.
 *
 * NIEUW GEDRAG: `src/cards/vaatwasser-logica.js` bestond niet vóór deze ronde.
 *
 * Drie dingen die op een dashboard stilletjes fout gaan en die je pas merkt als
 * de vaat er al uit had gemoeten:
 *
 * - De resterende tijd komt in vier vormen binnen. Home Connect meldt een
 *   TIJDSTIP en geen duur; reken je dat als minuten, dan staat er "nog 1970 uur".
 * - De toestand is een woord van de fabrikant, in willekeurige spelling. `Run`,
 *   `run`, `BSH.Common.EnumType.OperationState.Run`.
 * - De rangorde: een draaiende machine verslaat een klepsensor die achterloopt,
 *   en een open klep verslaat "klaar om te starten".
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  SOORT,
  bezig,
  draait,
  drukOproep,
  klepOpen,
  restMinuten,
  restTekst,
  soortVan,
  toestand,
  voortgangPct,
} from "../../src/cards/vaatwasser-logica.js";

const S = (state, attributes = {}) => ({ entity_id: "sensor.x", state, attributes });
const NU = new Date("2026-08-25T18:00:00Z");

describe("de toestand van de machine", () => {
  it("herkent de spelling van Home Connect, ruw en net", () => {
    assert.equal(soortVan("Run"), SOORT.DRAAIT);
    assert.equal(soortVan("run"), SOORT.DRAAIT);
    assert.equal(soortVan("BSH.Common.EnumType.OperationState.Run"), SOORT.DRAAIT);
  });

  it("kent de rest van de standen", () => {
    assert.equal(soortVan("Ready"), SOORT.KLAAR);
    assert.equal(soortVan("Finished"), SOORT.AF);
    assert.equal(soortVan("Pause"), SOORT.PAUZE);
    assert.equal(soortVan("DelayedStart"), SOORT.UITGESTELD);
    assert.equal(soortVan("Inactive"), SOORT.UIT);
    assert.equal(soortVan("Error"), SOORT.FOUT);
  });

  it("laat 'off' geen 'on' worden", () => {
    // "on" staat in de draait-lijst en zit letterlijk in "off". Zonder de juiste
    // volgorde zou een uitgeschakelde vaatwasser staan te animeren.
    assert.equal(soortVan("off"), SOORT.UIT);
    assert.equal(soortVan("Off"), SOORT.UIT);
  });

  it("noemt niets onbekend in plaats van iets te verzinnen", () => {
    for (const s of ["", null, undefined, "unknown", "unavailable", "zwabberstand"]) {
      assert.equal(soortVan(s), SOORT.ONBEKEND);
    }
  });

  it("draait alleen als hij draait", () => {
    assert.equal(draait(S("Run")), true);
    assert.equal(draait(S("Pause")), false);
    assert.equal(draait(S("Finished")), false);
    assert.equal(draait(null), false);
  });
});

describe("de resterende tijd, in vier vormen", () => {
  it("leest een TIJDSTIP als het moment waarop hij klaar is", () => {
    // Dit is de vorm die het vaakst fout gaat: geen duur maar een moment.
    const st = S("2026-08-25T19:24:00Z", { device_class: "timestamp" });
    assert.equal(restMinuten(st, NU), 84);
  });

  it("herkent een tijdstip ook zonder device_class", () => {
    assert.equal(restMinuten(S("2026-08-25T18:30:00Z"), NU), 30);
  });

  it("geeft nul en niet negatief als dat moment al voorbij is", () => {
    assert.equal(restMinuten(S("2026-08-25T17:00:00Z", { device_class: "timestamp" }), NU), 0);
  });

  it("leest een klok", () => {
    assert.equal(restMinuten(S("1:24:00"), NU), 84);
    assert.equal(restMinuten(S("01:24"), NU), 84);
    assert.equal(restMinuten(S("0:45:30"), NU), 46);
  });

  it("leest een getal met zijn eenheid", () => {
    assert.equal(restMinuten(S("84", { unit_of_measurement: "min" }), NU), 84);
    assert.equal(restMinuten(S("5040", { unit_of_measurement: "s" }), NU), 84);
    assert.equal(restMinuten(S("1.5", { unit_of_measurement: "h" }), NU), 90);
    assert.equal(restMinuten(S("2", { unit_of_measurement: "u" }), NU), 120);
  });

  it("gaat uit van minuten als er geen eenheid bij staat", () => {
    assert.equal(restMinuten(S("84"), NU), 84);
  });

  it("geeft null als er niets te lezen valt", () => {
    for (const st of [null, S(""), S("unknown"), S("unavailable"), S("straks")]) {
      assert.equal(restMinuten(st, NU), null);
    }
  });
});

describe("hoe die tijd op de kaart komt", () => {
  it("zegt het zoals een mens het zegt", () => {
    assert.equal(restTekst(24), "nog 24 min");
    assert.equal(restTekst(84), "nog 1 u 24 min");
    assert.equal(restTekst(120), "nog 2 uur");
    assert.equal(restTekst(60), "nog 1 uur");
  });

  it("zegt Klaar in plaats van nul minuten", () => {
    assert.equal(restTekst(0), "Klaar");
    assert.equal(restTekst(-5), "Klaar");
  });

  it("zegt niets als er niets bekend is", () => {
    assert.equal(restTekst(null), "");
    assert.equal(restTekst(undefined), "");
  });
});

describe("de voortgang", () => {
  it("leest een percentage", () => {
    assert.equal(voortgangPct(S("42")), 42);
    assert.equal(voortgangPct(S("42.6")), 43);
  });

  it("klemt buiten bereik in plaats van een balk over de rand te laten lopen", () => {
    assert.equal(voortgangPct(S("140")), 100);
    assert.equal(voortgangPct(S("-3")), 0);
  });

  it("geeft null zonder sensor of zonder getal", () => {
    for (const st of [null, S(""), S("unknown"), S("halverwege")]) {
      assert.equal(voortgangPct(st), null);
    }
  });
});

describe("de rangorde", () => {
  const deurOpen = { entity_id: "binary_sensor.deur", state: "on", attributes: {} };
  const deurDicht = { entity_id: "binary_sensor.deur", state: "off", attributes: {} };

  it("laat een draaiende machine winnen van een klepsensor die achterloopt", () => {
    // De klep is net dichtgedaan; de sensor meldt nog "open". Er staat dan
    // "Draait" en niet "Klep open".
    const t = toestand({ status: S("Run"), deur: deurOpen, rest: 84 });
    assert.equal(t.soort, SOORT.DRAAIT);
    assert.equal(t.tekst, "Draait · nog 1 u 24 min");
  });

  it("laat een open klep winnen van klaar om te starten", () => {
    const t = toestand({ status: S("Ready"), deur: deurOpen });
    assert.equal(t.tekst, "Klep open");
    assert.equal(t.tone, "warn");
  });

  it("zegt klaar om te starten met de klep dicht", () => {
    const t = toestand({ status: S("Ready"), deur: deurDicht });
    assert.equal(t.tekst, "Klaar om te starten");
  });

  it("valt bij het draaien terug op het percentage als er geen tijd is", () => {
    assert.equal(toestand({ status: S("Run"), pct: 40 }).tekst, "Draait · 40%");
    assert.equal(toestand({ status: S("Run") }).tekst, "Draait");
  });

  it("meldt een uitgestelde start met de tijd erbij", () => {
    assert.equal(toestand({ status: S("DelayedStart"), rest: 150 }).tekst, "Start over 2 u 30 min");
  });

  it("meldt een afgelopen programma als goed nieuws", () => {
    const t = toestand({ status: S("Finished"), deur: deurDicht });
    assert.equal(t.tekst, "Programma klaar");
    assert.equal(t.tone, "good");
  });

  it("meldt een storing als kritiek, ook met de klep dicht", () => {
    const t = toestand({ status: S("Error"), deur: deurDicht });
    assert.equal(t.tone, "bad");
  });

  it("doet niet alsof er niets aan de hand is als de sensor weg is", () => {
    const t = toestand({ status: S("unavailable") });
    assert.equal(t.tekst, "Niet bereikbaar");
  });

  it("leest de klep alleen als hij aanstaat", () => {
    assert.equal(klepOpen(deurOpen), true);
    assert.equal(klepOpen(deurDicht), false);
    assert.equal(klepOpen(null), false);
  });
});

describe("wanneer er een balk hoort te staan", () => {
  it("staat er zolang er een programma loopt, wacht of gepauzeerd is", () => {
    assert.equal(bezig(SOORT.DRAAIT), true);
    assert.equal(bezig(SOORT.PAUZE), true);
    assert.equal(bezig(SOORT.UITGESTELD), true);
  });

  it("staat er niet als er niets loopt", () => {
    // Een balk op 38% naast het woord "Uit" leest als "gepauzeerd op 38%",
    // terwijl de sensor gewoon zijn laatste waarde vasthoudt.
    for (const s of [SOORT.UIT, SOORT.KLAAR, SOORT.AF, SOORT.FOUT, SOORT.ONBEKEND]) {
      assert.equal(bezig(s), false, s);
    }
  });
});

describe("op een knop drukken", () => {
  it("kiest de service die bij het domein hoort", () => {
    assert.deepEqual(drukOproep("button.start"), ["button", "press", { entity_id: "button.start" }]);
    assert.deepEqual(drukOproep("input_button.start"), [
      "input_button",
      "press",
      { entity_id: "input_button.start" },
    ]);
    assert.deepEqual(drukOproep("script.start"), [
      "script",
      "turn_on",
      { entity_id: "script.start" },
    ]);
    assert.deepEqual(drukOproep("switch.start"), [
      "homeassistant",
      "turn_on",
      { entity_id: "switch.start" },
    ]);
    assert.deepEqual(drukOproep("automation.start"), [
      "automation",
      "trigger",
      { entity_id: "automation.start" },
    ]);
  });

  it("drukt niet op iets waar niet op te drukken valt", () => {
    for (const id of ["sensor.tijd", "binary_sensor.deur", "", null, undefined]) {
      assert.equal(drukOproep(id), null);
    }
  });
});
