/**
 * De geplande start op de vaatwasserkaart.
 *
 * Op 26 september 2026 werd de vaatwasser thuis om 12:16 vrijgegeven, plande
 * DomotiApp Coach 14:00, en ging hij om 13:12 met de hand aan: op de kaart
 * stond nergens dat er een plan was. De coach meldt dat moment sindsdien in
 * `sensor.domotiapp_coach_vaatwasser_start_om` -- een tijdstip zolang hij wacht,
 * `unknown` zodra hij draait of niet vrijgegeven is -- met de vrijgaveschakelaar
 * in het attribuut `release_switch`.
 *
 * Alles hier is NIEUW GEDRAG, behalve de tests die met REGRESSIEWACHT beginnen:
 * die toetsen dat een plan NIET wint van iets belangrijkers, en dat deed de
 * oude code vanzelf.
 *
 * De module wordt als geheel geïmporteerd en niet per naam: dan valt tegen de
 * oude code elke test op zijn eigen reden om, in plaats van het hele bestand op
 * één ontbrekende export.
 *
 * Tijden staan in LOKALE tijd (`new Date(j, m, d, u, min)`), zodat de uitkomst
 * niet afhangt van de tijdzone van de machine die de test draait.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as V from "../../src/cards/vaatwasser-logica.js";

const S = (state, attributes = {}, entity_id = "sensor.x") => ({ entity_id, state, attributes });

/** Zaterdag 26 september 2026, 12:16 -- het moment van de vrijgave. */
const NU = new Date(2026, 8, 26, 12, 16);
const OM = (dag, u, m = 0) => new Date(2026, 8, dag, u, m);

describe("NIEUW GEDRAG: het startmoment lezen", () => {
  it("leest het tijdstip van de coach, met zone", () => {
    const coach = S("2026-09-26T12:00:00+00:00", { device_class: "timestamp" });
    const nu = new Date("2026-09-26T10:16:00Z");
    assert.equal(+V.startMoment(coach, nu), +new Date("2026-09-26T12:00:00Z"));
  });

  it("ziet niets zolang de coach niets gepland heeft", () => {
    // Zo staat de sensor als hij draait of niet vrijgegeven is.
    for (const st of [null, S("unknown"), S("unavailable"), S(""), S("straks")]) {
      assert.equal(V.startMoment(st, NU), null);
    }
  });

  it("laat een moment dat voorbij is vallen, met een minuut marge", () => {
    assert.equal(V.startMoment(S(OM(26, 11, 0).toISOString()), NU), null);
    // 30 seconden na het startsein meldt de machine misschien nog geen
    // "draait"; de tekst mag dan blijven staan.
    const net = new Date(+NU - 30_000);
    assert.equal(+V.startMoment(S(net.toISOString()), NU), +net);
  });

  it("leest een input_datetime als lokale tijd", () => {
    const st = S("2026-09-26 14:00:00", { has_date: true, has_time: true }, "input_datetime.start");
    assert.equal(+V.startMoment(st, NU), +OM(26, 14));
  });

  it("leest een kale klok als vandaag, of morgen als hij al voorbij is", () => {
    assert.equal(+V.startMoment(S("14:00"), NU), +OM(26, 14));
    assert.equal(+V.startMoment(S("14:00:00", {}, "time.start"), NU), +OM(26, 14));
    // Een nachtelijke start wordt 's avonds gepland.
    assert.equal(+V.startMoment(S("02:00"), OM(26, 22)), +OM(27, 2));
  });

  it("verzint geen tijd bij een klok die niet bestaat", () => {
    assert.equal(V.startMoment(S("25:00"), NU), null);
    assert.equal(V.startMoment(S("12:75"), NU), null);
  });
});

describe("NIEUW GEDRAG: het startmoment in woorden", () => {
  it("zegt vandaag zonder dag", () => {
    assert.equal(V.startTekst(OM(26, 14), NU), "Start om 14:00");
    assert.equal(V.startTekst(OM(26, 9, 5), OM(26, 8)), "Start om 09:05");
  });

  it("zegt morgen op de kalender en niet in uren", () => {
    // Om 23:00 is 02:00 morgen, ook al is het maar drie uur.
    assert.equal(V.startTekst(OM(27, 2), OM(26, 23)), "Start morgen om 02:00");
  });

  it("noemt binnen een week de dag, en daarna de datum", () => {
    assert.equal(V.startTekst(OM(29, 14), NU), "Start dinsdag om 14:00");
    assert.equal(V.startTekst(new Date(2026, 9, 5, 14), NU), "Start 5 okt om 14:00");
  });

  it("zegt niets zonder moment", () => {
    assert.equal(V.startTekst(null, NU), "");
  });
});

describe("NIEUW GEDRAG: de sensor van de coach zelf vinden", () => {
  const states = {
    "input_boolean.schakelaar_vaatwasser": S("on", {}, "input_boolean.schakelaar_vaatwasser"),
    "sensor.domotiapp_coach_vaatwasser_start_om": S("unknown", {
      device_class: "timestamp",
      release_switch: "input_boolean.schakelaar_vaatwasser",
    }),
    "sensor.domotiapp_coach_wasmachine_start_om": S("unknown", {
      device_class: "timestamp",
      release_switch: "input_boolean.schakelaar_wasmachine",
    }),
  };

  it("vindt hem via de schakelaar uit het veld Slimme sturing", () => {
    assert.equal(
      V.vindStartSensor(states, "input_boolean.schakelaar_vaatwasser"),
      "sensor.domotiapp_coach_vaatwasser_start_om"
    );
  });

  it("pakt niet de sensor van een ander apparaat", () => {
    assert.equal(
      V.vindStartSensor(states, "input_boolean.schakelaar_wasmachine"),
      "sensor.domotiapp_coach_wasmachine_start_om"
    );
    assert.equal(V.vindStartSensor(states, "switch.iets_anders"), "");
  });

  it("zoekt niet zonder schakelaar", () => {
    assert.equal(V.vindStartSensor(states, ""), "");
    assert.equal(V.vindStartSensor(null, "input_boolean.schakelaar_vaatwasser"), "");
  });
});

describe("de rangorde met een plan erbij", () => {
  const deurOpen = { entity_id: "binary_sensor.deur", state: "on", attributes: {} };
  const start = OM(26, 14);

  it("NIEUW GEDRAG: zegt wanneer hij start in plaats van klaar om te starten", () => {
    const t = V.toestand({ status: S("Ready"), start, nu: NU });
    assert.equal(t.tekst, "Start om 14:00");
    assert.equal(t.tone, "accent");
    assert.equal(t.waarschuwing, "");
  });

  it("NIEUW GEDRAG: ook als de machine op uit staat", () => {
    assert.equal(V.toestand({ status: S("Inactive"), start, nu: NU }).tekst, "Start om 14:00");
  });

  it("NIEUW GEDRAG: houdt een open klep erbij, want daarmee gaat het plan mis", () => {
    const t = V.toestand({ status: S("Ready"), deur: deurOpen, start, nu: NU });
    assert.equal(t.tekst, "Start om 14:00");
    assert.equal(t.waarschuwing, "Klep open");
  });

  it("NIEUW GEDRAG: een klokmoment gaat voor de aftelling van een uitgestelde start", () => {
    const t = V.toestand({ status: S("DelayedStart"), rest: 104, start, nu: NU });
    assert.equal(t.tekst, "Start om 14:00");
  });

  it("REGRESSIEWACHT: een draaiende machine draait, plan of geen plan", () => {
    assert.equal(V.toestand({ status: S("Run"), rest: 84, start, nu: NU }).tekst, "Draait · nog 1 u 24 min");
  });

  it("REGRESSIEWACHT: een afgelopen programma en een storing winnen van het plan", () => {
    assert.equal(V.toestand({ status: S("Finished"), start, nu: NU }).tekst, "Programma klaar");
    assert.equal(V.toestand({ status: S("Error"), start, nu: NU }).tekst, "Storing");
  });

  it("REGRESSIEWACHT: een machine die weg is, is weg", () => {
    // Een plan voor een machine die niet bereikbaar is gaat niet door; de kaart
    // hoort dan de storing te laten zien en niet te doen alsof alles klopt.
    assert.equal(V.toestand({ status: S("unavailable"), start, nu: NU }).tekst, "Niet bereikbaar");
  });

  it("REGRESSIEWACHT: zonder plan verandert er niets", () => {
    assert.equal(V.toestand({ status: S("Ready") }).tekst, "Klaar om te starten");
    assert.equal(V.toestand({ status: S("DelayedStart"), rest: 150 }).tekst, "Start over 2 u 30 min");
  });
});
