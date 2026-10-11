/**
 * De laadpaalkaart tegen de ECHTE coach v0.112.1.
 *
 * `vaste-invoer/coach-0.112.1-laadpaal.json` is de dump die de coach-sessie op
 * 11 oktober 2026 om 22:53 uit de Home Assistant van de eigenaar haalde, kort
 * na een herstart. Geanonimiseerd: het serienummer van de paal en dat van de
 * auto zijn vervangen door "laadpaal" en "auto"; `plan` is ingekort tot drie
 * blokken.
 *
 * Wat deze dump liet zien:
 *
 * - `paal_fabrikant` "Easee" en `paal_model` "Charge Max": de foto kan op
 *   merk EN model, niet alleen op `brand`.
 * - Bij `geen_auto` staan `plan`, `expected_done` (23:02) en `kwh_needed`
 *   er nog. Dat is de vooruitblik voor als er nu een auto aan ging, met de
 *   laatst bekende accustand (77%). Geen plan om te tonen.
 * - `modus` "zon" terwijl `modus_actief` "planning" is, en alleen Planning en
 *   Snel doen nu iets: het schema geldt vandaag.
 * - `sessie` met `kosten_net` en `accu_kwh` erbij.
 *
 * NIEUW GEDRAG: de tests over de vooruitblik en de foto (die falen op de stand
 * van vóór deze dump). De rest is REGRESSIEWACHT.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as C from "../../src/cards/coach-logica.js";
import * as L from "../../src/cards/laadpaal-logica.js";

const DUMP = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.112.1-laadpaal.json", import.meta.url), "utf8"));

/** Een `hass` zoals de frontend hem heeft, gebouwd uit de dump. */
function hassUitDump() {
  const devices = { lp: { name: "Laadpaal", name_by_user: null, manufacturer: "DomotiApp Coach", model: "Laadpaal" } };
  const entities = {};
  const states = {};
  for (const e of DUMP) {
    assert.equal(e.device_manufacturer, "DomotiApp Coach");
    assert.equal(e.device_model, "Laadpaal");
    entities[e.entity_id] = { device_id: "lp", platform: "domotiapp_coach", translation_key: e.translation_key };
    states[e.entity_id] = { entity_id: e.entity_id, state: e.state, attributes: e.attributes };
  }
  return { devices, entities, states };
}

/** Het moment van de dump: zondag 11 oktober 2026, 22:53 in Nederland. */
const NU = new Date("2026-10-11T22:53:00+02:00");
const B = L.AFBEELDINGEN_BASIS;
const EUR = (n) => `€ ${n}`;
const klok = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

const hass = hassUitDump();
const st = hass.states["sensor.laadpaal_coach"];

describe("NIEUW GEDRAG: zonder auto geen vooruitblik op de kaart", () => {
  it("REGRESSIEWACHT: de coach rekent wel door: plan, 23:02 en 0,6 kWh staan in de dump", () => {
    // Zo staat het er echt; zonder dit zegt de test hieronder niets.
    assert.equal(st.attributes.stand, "geen_auto");
    assert.equal(st.attributes.plan.length, 3);
    assert.equal(st.attributes.expected_done, "2026-10-11T23:02:00+02:00");
    assert.ok(st.attributes.kwh_needed > 0);
  });

  it("toont geen 'verwacht klaar' en geen 'nog x kWh'", () => {
    const s = L.laadpaalStand(st);
    assert.equal(s.klaarVerwacht, null);
    assert.equal(s.kwhNodig, null);
  });

  it("toont geen plan", () => {
    const b = L.planBalk(L.laadpaalStand(st).plan, NU);
    assert.ok(!b || b.blokken.length === 0);
  });

  it("REGRESSIEWACHT: toont ze wel zodra er een auto aan hangt", () => {
    const s = L.laadpaalStand({ ...st, attributes: { ...st.attributes, stand: "wacht" } });
    assert.equal(+s.klaarVerwacht, +new Date("2026-10-11T23:02:00+02:00"));
    assert.ok(s.kwhNodig > 0);
    assert.equal(L.planBalk(s.plan, NU).blokken.length, 2);
  });
});

describe("NIEUW GEDRAG: de foto op merk en model van de paal", () => {
  it("leest fabrikant en model zoals de coach ze meldt", () => {
    const s = L.laadpaalStand(st);
    assert.equal(s.fabrikant, "Easee");
    assert.equal(s.model, "Charge Max");
  });

  it("neemt bij hem thuis de Charge Max", () => {
    assert.equal(L.fotoBijPaal(L.laadpaalStand(st)), "easee_charge_max_pro");
    assert.equal(L.laadpaalAfbeelding("auto", L.laadpaalStand(st)), `${B}laadpalen/easee-charge-max-pro.webp`);
  });

  it("verfijnt op het model: een Charge Up en een Eve Double", () => {
    assert.equal(L.fotoBijPaal({ fabrikant: "Easee", model: "Charge Up" }), "easee_charge_up");
    assert.equal(L.fotoBijPaal({ fabrikant: "Easee", model: "Easee Charge Up" }), "easee_charge_up");
    assert.equal(L.fotoBijPaal({ fabrikant: "Alfen B.V.", model: "Eve Double Plus" }), "alfen_eve_double_plus");
    assert.equal(L.fotoBijPaal({ fabrikant: "Alfen", model: "Eve Single Pro-line" }), "alfen_eve_single_plus");
    assert.equal(
      L.laadpaalAfbeelding("auto", { fabrikant: "Easee", model: "Charge Up", merk: "easee" }),
      `${B}laadpalen/easee-charge-up.webp`
    );
  });

  it("de fabrikant gaat voor `brand`, en zonder fabrikant telt `brand`", () => {
    assert.equal(L.fotoBijPaal({ fabrikant: "Alfen", model: "", merk: "easee" }), "alfen_eve_single_plus");
    assert.equal(L.fotoBijPaal({ fabrikant: "", model: "", merk: "easee" }), "easee_charge_max_pro");
  });

  it("een merk zonder foto geeft geen foto, en geen verkeerde", () => {
    assert.equal(L.fotoBijPaal({ fabrikant: "Zaptec", model: "Go" }), null);
    assert.equal(L.laadpaalAfbeelding("auto", { fabrikant: "Zaptec", model: "Go" }), "");
    assert.equal(L.fotoBijPaal(null), null);
  });
});

describe("REGRESSIEWACHT: de rest van de kaart tegen coach 0.112.1", () => {
  it("vindt de laadpaal en zijn zes rollen", () => {
    assert.deepEqual(C.kiesApparaat(hass, "", L.LAADPAAL_MODELLEN, "Laadpaal"), { id: "lp", reden: "enige" });
    assert.deepEqual(Object.keys(C.coachRollen(hass, "lp")).sort(), ["coach", "klaar_om", "laden_tot", "modus", "pauze", "schema"]);
    assert.equal(C.contractVan(st), 1);
  });

  it("zegt 'Geen auto' in rust, met de laatst bekende accustand", () => {
    const s = L.laadpaalStand(st);
    assert.equal(s.tekst, "Geen auto");
    assert.equal(L.standVorm(s.stand).tone, "neutral");
    assert.equal(L.socTekst(s), "77%");
  });

  it("biedt Planning en Snel aan, met Planning aan, al staat de paal op zon", () => {
    const k = L.modusKnoppen(hass.states["select.laadpaal_modus"], L.laadpaalStand(st));
    assert.deepEqual(k.map((m) => [m.sleutel, m.aan]), [["planning", true], ["snel", false]]);
  });

  it("meldt de vorige laadbeurt met beide bedragen", () => {
    const sessie = L.laadpaalStand(st).sessie;
    const t = L.sessieTekst(sessie, NU);
    assert.equal(t.kop, "Vorige laadbeurt");
    assert.equal(t.tekst, `15,5 kWh · 2,1 kWh zon · ${EUR("3,19")} net · ${EUR("3,64")} incl. zon`);
    assert.equal(t.accu, "4% → 80%");
    // De klok van wie kijkt: CI draait in UTC.
    assert.equal(t.tijd, `${klok(new Date(sessie.begin))} – ${klok(new Date(sessie.einde))}`);
  });
});
