/**
 * De laadpaalkaart tegen de ECHTE coach v0.111.0.
 *
 * `vaste-invoer/coach-0.111.0-laadpaal.json` is de dump die de coach-sessie op
 * 11 oktober 2026 rond 20:55 uit de Home Assistant van de eigenaar haalde, net
 * nadat zijn auto vol was (80%). Geanonimiseerd: het serienummer van de paal en
 * een stuk van het chassisnummer van de auto zijn vervangen door "laadpaal" en
 * "auto"; `plan` is ingekort tot de eerste drie blokken.
 *
 * Wat de dump liet zien dat niet in het contract stond: `sessie.actief` (waar
 * zolang de kabel erin zit, ook als hij vol is) en `sessie.soc_eind`. En dat
 * `sessie.kosten` de zon meetelt tegen wat die anders had opgeleverd, zodat het
 * een ander bedrag is dan het verslag op zijn telefoon (alleen het net).
 *
 * NIEUW GEDRAG: de tests over de laadbeurt (die falen op de stand vóór de
 * dump). De rest is REGRESSIEWACHT: wat al gebouwd was werkt ook met de
 * echte coach.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as C from "../../src/cards/coach-logica.js";
import * as L from "../../src/cards/laadpaal-logica.js";

const DUMP = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.111.0-laadpaal.json", import.meta.url), "utf8"));

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

/** Zondag 11 oktober 2026, 20:55: het moment van de dump. */
const NU = new Date(2026, 9, 11, 20, 55);

describe("REGRESSIEWACHT: de laadpaalkaart vindt de echte coach", () => {
  const hass = hassUitDump();
  const rollen = C.coachRollen(hass, "lp");
  const st = hass.states["sensor.laadpaal_coach"];

  it("kiest de laadpaal en vindt alle zes de rollen op hun translation_key", () => {
    assert.deepEqual(C.kiesApparaat(hass, "", L.LAADPAAL_MODELLEN, "Laadpaal"), { id: "lp", reden: "enige" });
    assert.deepEqual(rollen, {
      coach: "sensor.laadpaal_coach",
      modus: "select.laadpaal_modus",
      pauze: "switch.laadpaal_pauze",
      schema: "switch.laadpaal_schema",
      klaar_om: "time.laadpaal_klaar_om",
      laden_tot: "number.laadpaal_laden_tot",
    });
    assert.equal(C.contractVan(st), 1);
  });

  it("leest de stand: vol, 80%, Easee, zonder actieradius en zonder schatting", () => {
    const s = L.laadpaalStand(st);
    assert.equal(s.stand, "vol");
    assert.equal(s.tekst, "Vol");
    assert.equal(L.standVorm(s.stand).tone, "good");
    assert.equal(L.socTekst(s), "80%");
    assert.equal(s.doel, 80);
    assert.equal(s.actieradius, null);
    assert.equal(s.merk, "easee");
    assert.equal(s.klaarVerwacht, null);
  });

  it("toont geen plan als er niets te laden valt", () => {
    const b = L.planBalk(L.laadpaalStand(st).plan, NU);
    assert.ok(!b || b.blokken.length === 0);
  });

  it("biedt de vier modi aan, met laden tot 80 in stappen van 5", () => {
    assert.deepEqual(L.modusKnoppen(hass.states["select.laadpaal_modus"]).map((m) => m.sleutel), ["planning", "snel", "continu", "zon"]);
    assert.equal(L.stapWaarde(hass.states["number.laadpaal_laden_tot"], 1), 85);
    assert.equal(L.stapWaarde(hass.states["number.laadpaal_laden_tot"], -1), 75);
  });

  it("neemt de foto van de Easee als er niets gekozen is", () => {
    assert.equal(
      L.laadpaalAfbeelding("auto", L.laadpaalStand(st).merk),
      "/domotiapp_lovelace/afbeeldingen/laadpalen/easee-charge-max-pro.webp"
    );
  });

  it("vindt de vermogenssensor van de klant in `entiteiten`", () => {
    assert.equal(C.klantEntiteiten(st).power, "sensor.laadpaal_vermogen");
  });
});

describe("NIEUW GEDRAG: de laadbeurt zoals de echte coach hem meldt", () => {
  const sessie = hassUitDump().states["sensor.laadpaal_coach"].attributes.sessie;

  it("REGRESSIEWACHT: noemt hem 'deze laadbeurt' zolang de kabel erin zit, ook als hij vol is", () => {
    const t = L.sessieTekst(sessie, NU);
    assert.equal(t.kop, "Deze laadbeurt");
    assert.equal(t.tijd, "sinds 12:08");
  });

  it("zegt van hoeveel naar hoeveel procent", () => {
    assert.equal(L.sessieTekst(sessie, NU).accu, "4% → 80%");
  });

  it("noemt de kosten 'incl. zon': het is niet het bedrag uit het verslag", () => {
    assert.equal(L.sessieTekst(sessie, NU).tekst, "12,5 kWh · 2,1 kWh zon · € 3,59 incl. zon");
  });

  it("noemt hem de vorige als de kabel eruit is, ook zonder einde", () => {
    assert.equal(L.sessieTekst({ ...sessie, actief: false }, NU).kop, "Vorige laadbeurt");
  });
});
