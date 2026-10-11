/**
 * De laadpaalkaart tegen de ECHTE coach v0.112.3.
 *
 * `vaste-invoer/coach-0.112.3-laadpaal.json` is de dump die de coach-sessie op
 * 11 oktober 2026 om 23:49 uit de Home Assistant van de eigenaar haalde, na de
 * update naar 0.112.3. Alleen de sensor en de select; de serienummers van paal
 * en auto zijn vervangen, het plan is ingekort tot drie blokken.
 *
 * Wat 0.112.3 anders doet: `modus_keuzes` is `["snel"]` als de planning
 * vandaag geldt (in 0.112.1 was dat `["planning", "snel"]`). Planning is sinds
 * 0.59.1 geen knop meer op de kaart, maar een regel ernaast.
 *
 * REGRESSIEWACHT, allemaal: 0.59.1 is gebouwd op wat de coach-sessie over deze
 * vorm zei, en deze dump bevestigt dat.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as L from "../../src/cards/laadpaal-logica.js";

const DUMP = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.112.3-laadpaal.json", import.meta.url), "utf8"));
const st = DUMP.find((e) => e.entity_id === "sensor.laadpaal_coach");
const select = DUMP.find((e) => e.entity_id === "select.laadpaal_modus");
const stand = L.laadpaalStand(st);

/** Het moment van de dump: zondag 11 oktober 2026, 23:49 in Nederland. */
const NU = new Date("2026-10-11T23:49:00+02:00");
const klok = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

describe("REGRESSIEWACHT: de laadpaalkaart tegen coach 0.112.3", () => {
  it("zo staat het er echt: alleen Snel te kiezen, de planning geldt, de paal zelf op zon", () => {
    assert.deepEqual(st.attributes.modus_keuzes, ["snel"]);
    assert.equal(st.attributes.modus_actief, "planning");
    assert.equal(st.attributes.planning_nu, true);
    assert.equal(st.attributes.modus, "zon");
  });

  it("toont alleen de knop Snel, en die staat uit", () => {
    assert.deepEqual(L.modusKnoppen(select, stand).map((k) => [k.sleutel, k.aan]), [["snel", false]]);
  });

  it("zet 'Planning · klaar om' en de tijd ernaast", () => {
    // De klok van wie kijkt: CI draait in UTC.
    assert.deepEqual(L.modusRegel(select, stand), {
      icoon: "calendar",
      woord: "Planning",
      tijd: klok(new Date("2026-10-12T06:00:00+02:00")),
    });
  });

  it("zonder auto: geen percentage, geen 'verwacht klaar' en geen plan", () => {
    assert.equal(L.socTekst(stand), "");
    assert.equal(stand.klaarVerwacht, null);
    assert.equal(stand.kwhNodig, null);
    const b = L.planBalk(stand.plan, NU);
    assert.ok(!b || b.blokken.length === 0);
  });

  it("de foto blijft de Charge Max", () => {
    assert.equal(L.fotoBijPaal(stand), "easee_charge_max_pro");
  });
});
