/**
 * De laadpaalkaart na de eerste proef bij de eigenaar (0.59.1).
 *
 * Op 11 oktober 2026 rond 23:30, met 0.59.0 en coach 0.112.2, zag hij twee
 * dingen (doorgegeven door de coach-sessie):
 *
 * - vier afgekapte modusknoppen ("Plann...", "Conti..."), en de vraag "wat is
 *   de knop planning". Planning is geen knop: het is wat het schema aanzet.
 *   Dat staat nu als regel naast de knoppen: "Planning · klaar om 06:00", of
 *   "Goedkoopst" als de planning vandaag niet geldt.
 * - "waarom staat er 77%" terwijl er geen auto aan hing. De coach geeft de
 *   laatst bekende stand door; zonder auto toont de kaart hem niet.
 *
 * Coach 0.112.3 maakt `modus_keuzes` ["snel"] met een planning voor vandaag,
 * en ["snel", "continu", "zon"] zonder. De kaart filtert daar al op.
 *
 * NIEUW GEDRAG: tien tests falen op 0.59.0. Drie zijn REGRESSIEWACHT: twee
 * werkten al door het filter op `modus_keuzes`, en een met een auto aan de paal.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as L from "../../src/cards/laadpaal-logica.js";

const S = (attributes) => ({ entity_id: "sensor.oprit_coach", state: "x", attributes: { stand: "wacht", ...attributes } });
const SELECT = (state) => ({ entity_id: "select.oprit_modus", state, attributes: { options: ["planning", "snel", "continu", "zon"] } });
const TIJD = (state) => ({ entity_id: "time.oprit_klaar_om", state, attributes: {} });
const klok = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
const knoppen = (k) => k.map((x) => x.sleutel + (x.aan ? "*" : ""));

describe("NIEUW GEDRAG: Planning is geen knop meer", () => {
  it("zonder modus_keuzes: Snel, Continu en Zon", () => {
    assert.deepEqual(knoppen(L.modusKnoppen(SELECT("zon"))), ["snel", "continu", "zon*"]);
  });

  it("REGRESSIEWACHT: coach 0.112.3 met een planning voor vandaag: alleen Snel, en die staat uit", () => {
    const s = L.laadpaalStand(S({ modus: "zon", modus_actief: "planning", modus_keuzes: ["snel"], planning_nu: true }));
    assert.deepEqual(knoppen(L.modusKnoppen(SELECT("planning"), s)), ["snel"]);
  });

  it("coach 0.112.1 met een planning voor vandaag: ook alleen Snel", () => {
    const s = L.laadpaalStand(S({ modus: "zon", modus_actief: "planning", modus_keuzes: ["planning", "snel"], planning_nu: true }));
    assert.deepEqual(knoppen(L.modusKnoppen(SELECT("planning"), s)), ["snel"]);
  });

  it("REGRESSIEWACHT: geen planning en de voorkeur Goedkoopst: drie knoppen en geen enkele aan", () => {
    const s = L.laadpaalStand(S({ modus: "planning", modus_actief: "planning", modus_keuzes: ["snel", "continu", "zon"], planning_nu: false }));
    assert.deepEqual(knoppen(L.modusKnoppen(SELECT("planning"), s)), ["snel", "continu", "zon"]);
  });
});

describe("NIEUW GEDRAG: de regel naast de knoppen", () => {
  it("met een planning: 'Planning' en de tijd uit klaar_om_volgende", () => {
    const volgende = "2026-10-12T06:00:00+02:00";
    const s = L.laadpaalStand(S({ modus_actief: "planning", planning_nu: true, klaar_om_volgende: volgende }));
    // De klok van wie kijkt: CI draait in UTC.
    assert.deepEqual(L.modusRegel(SELECT("planning"), s, TIJD("07:30:00")), { icoon: "calendar", woord: "Planning", tijd: klok(new Date(volgende)) });
  });

  it("zonder klaar_om_volgende de tijd van de time-entiteit", () => {
    const s = L.laadpaalStand(S({ modus_actief: "planning", planning_nu: true }));
    assert.equal(L.modusRegel(SELECT("planning"), s, TIJD("06:30:00")).tijd, "06:30");
    assert.equal(L.modusRegel(SELECT("planning"), s, null).tijd, "");
  });

  it("de planning geldt vandaag niet: 'Goedkoopst', zonder tijd", () => {
    const s = L.laadpaalStand(S({ modus_actief: "planning", planning_nu: false, klaar_om_volgende: "2026-10-12T06:00:00+02:00" }));
    assert.deepEqual(L.modusRegel(SELECT("planning"), s, TIJD("06:00:00")), { icoon: "clock", woord: "Goedkoopst", tijd: "" });
  });

  it("staat er een knop aan, dan zegt die het en is er geen regel", () => {
    for (const actief of ["snel", "continu", "zon"]) {
      const s = L.laadpaalStand(S({ modus_actief: actief, planning_nu: true }));
      assert.equal(L.modusRegel(SELECT(actief), s), null);
    }
  });

  it("een coach zonder modus_actief: alleen 'Planning', want of hij vandaag geldt is niet bekend", () => {
    assert.deepEqual(L.modusRegel(SELECT("planning"), L.laadpaalStand(S({}))), { icoon: "calendar", woord: "Planning", tijd: "" });
  });

  it("geen regel zonder select", () => {
    const s = L.laadpaalStand(S({ modus_actief: "planning", planning_nu: true }));
    assert.equal(L.modusRegel(null, s), null);
    assert.equal(L.modusRegel(SELECT("unavailable"), s), null);
  });
});

describe("NIEUW GEDRAG: zonder auto geen percentage", () => {
  it("geen_auto: geen accustand en geen actieradius, ook al geeft de coach ze door", () => {
    const s = L.laadpaalStand(S({ stand: "geen_auto", soc: 77, actieradius_km: 310 }));
    assert.equal(L.socTekst(s), "");
    assert.equal(s.soc, null);
    assert.equal(s.actieradius, null);
  });

  it("REGRESSIEWACHT: met een auto staan ze er weer", () => {
    const s = L.laadpaalStand(S({ stand: "wacht", soc: 77, actieradius_km: 310 }));
    assert.equal(L.socTekst(s), "77%");
    assert.equal(s.actieradius, 310);
  });

  it("de echte dump van 0.112.1: geen 77%", () => {
    const dump = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.112.1-laadpaal.json", import.meta.url), "utf8"));
    const st = dump.find((e) => e.entity_id === "sensor.laadpaal_coach");
    assert.equal(st.attributes.soc, 77);
    assert.equal(L.socTekst(L.laadpaalStand(st)), "");
  });
});
