/**
 * De thuisbatterijkaart tegen de ECHTE coach v0.112.1.
 *
 * `vaste-invoer/coach-0.112.1-batterij.json` is de dump die de coach-sessie op
 * 11 oktober 2026 om 22:53 uit de Home Assistant van de eigenaar haalde, kort
 * na een herstart. Alleen de apparaatnaam van de batterij is vervangen door
 * "thuisbatterij".
 *
 * Wat deze dump liet zien:
 *
 * - `accu_fabrikant` "Anker" en `accu_model` "Anker SOLIX Solarbank Max AC":
 *   het model draagt het merk zelf ook. Automatisch kan de foto kiezen.
 * - `plan` is een lege lijst. Dat is geen fout: thuis is het een vast contract
 *   en het rendement van de batterij is onbekend, dus valt er niets te plannen.
 * - `leeg_tot` op de sensor is null, de number zegt 5. De number is de
 *   instelling; de sensor noemt alleen het doel van een lopende leegbeurt.
 * - De number gaat van 0 tot 100, maar de ondergrens is 5.
 * - De knoppen staan op "unknown" tot de eerste druk.
 *
 * NIEUW GEDRAG: de foto en de ondergrens bij Leegladen (die falen op de stand
 * van vóór deze dump). De rest is REGRESSIEWACHT.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as B from "../../src/cards/batterij-logica.js";
import * as C from "../../src/cards/coach-logica.js";
import * as L from "../../src/cards/laadpaal-logica.js";

const DUMP = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.112.1-batterij.json", import.meta.url), "utf8"));

/** Een `hass` zoals de frontend hem heeft, gebouwd uit de dump. */
function hassUitDump() {
  const devices = { bt: { name: "Thuisbatterij", name_by_user: null, manufacturer: "DomotiApp Coach", model: "Thuisbatterij" } };
  const entities = {};
  const states = {};
  for (const e of DUMP) {
    assert.equal(e.device_manufacturer, "DomotiApp Coach");
    assert.equal(e.device_model, "Thuisbatterij");
    entities[e.entity_id] = { device_id: "bt", platform: "domotiapp_coach", translation_key: e.translation_key };
    states[e.entity_id] = { entity_id: e.entity_id, state: e.state, attributes: e.attributes };
  }
  return { devices, entities, states };
}

/** Het moment van de dump: zondag 11 oktober 2026, 22:53 in Nederland. */
const NU = new Date("2026-10-11T22:53:00+02:00");
const BASIS = "/domotiapp_lovelace/afbeeldingen/";
const EUR = (n) => `€ ${n}`;

const hass = hassUitDump();
const rollen = C.coachRollen(hass, "bt");
const st = hass.states["sensor.batterij_coach"];
const stand = B.batterijStand(st);

describe("NIEUW GEDRAG: de foto op merk en model van de batterij", () => {
  it("leest fabrikant en model zoals de coach ze meldt", () => {
    assert.equal(stand.fabrikant, "Anker");
    assert.equal(stand.model, "Anker SOLIX Solarbank Max AC");
  });

  it("neemt bij hem thuis de Solarbank Max AC", () => {
    assert.equal(B.fotoBijAccu(stand), "anker_solarbank_max_ac");
    assert.equal(B.batterijAfbeelding("auto", stand), `${BASIS}thuisbatterijen/anker-solarbank-max-ac.webp`);
  });

  it("geeft een andere Solarbank geen foto, want die ziet er anders uit", () => {
    const ander = { fabrikant: "Anker", model: "Anker SOLIX Solarbank 2 E1600 Pro" };
    assert.equal(B.fotoBijAccu(ander), null);
    assert.equal(B.batterijAfbeelding("auto", ander), "");
  });

  it("toont zonder merk niets, en niet stilletjes de Solarbank", () => {
    assert.equal(B.batterijAfbeelding("auto", { fabrikant: "", model: "" }), "");
    assert.equal(B.batterijAfbeelding("auto", { fabrikant: "Zendure", model: "SolarFlow 2400 AC" }), "");
  });

  it("laat een gekozen foto en een eigen afbeelding voorgaan", () => {
    assert.equal(B.batterijAfbeelding("anker_solarbank_max_ac_uitbreiding", stand), `${BASIS}thuisbatterijen/anker-solarbank-max-ac-uitbreiding.webp`);
    assert.equal(B.batterijAfbeelding("auto", stand, "/local/accu.png"), "/local/accu.png");
  });
});

describe("NIEUW GEDRAG: Leegladen gaat niet onder de ondergrens", () => {
  const nummer = hass.states["number.batterij_leegladen_tot"];

  it("REGRESSIEWACHT: de number zelf zou naar 0 gaan, hij loopt van 0 tot 100", () => {
    // Zo staat het er echt; zonder dit zegt de test hieronder niets.
    assert.equal(nummer.attributes.min, 0);
    assert.equal(L.stapWaarde(nummer, -1), 0);
  });

  it("met de ondergrens erbij staat − uit op 5%, en gaat + naar 10%", () => {
    const n = B.leegTotMetGrens(nummer, stand);
    assert.equal(L.stapWaarde(n, -1), null);
    assert.equal(L.stapWaarde(n, 1), 10);
  });

  it("zonder ondergrens blijft de number zoals hij is", () => {
    assert.equal(B.leegTotMetGrens(nummer, { ...stand, ondergrens: null }), nummer);
  });
});

describe("REGRESSIEWACHT: de rest van de kaart tegen coach 0.112.1", () => {
  it("vindt de batterij en zijn zes rollen", () => {
    assert.deepEqual(C.kiesApparaat(hass, "", B.BATTERIJ_MODELLEN, "Thuisbatterij"), { id: "bt", reden: "enige" });
    assert.deepEqual(rollen, {
      coach: "sensor.batterij_coach",
      vol_laden: "button.batterij_nu_vol_laden",
      leegladen: "button.batterij_nu_leegladen",
      terug_naar_plan: "button.batterij_terug_naar_het_plan",
      vakantiestand: "switch.batterij_vakantiestand",
      leeg_tot: "number.batterij_leegladen_tot",
    });
    assert.equal(C.contractVan(st), 1);
  });

  it("leest de stand: nul op de meter, 5%, 21 °C, de batterij doet het zelf", () => {
    assert.equal(stand.stand, "nul_op_de_meter");
    assert.equal(stand.tekst, "Nul op de meter");
    assert.equal(B.standVorm(stand.stand).icoon, "house");
    assert.equal(stand.soc, 5);
    assert.equal(stand.zelf, true);
    assert.equal(B.temperatuurTekst(stand), "21 °C");
  });

  it("toont geen plan als het leeg is", () => {
    assert.deepEqual(stand.plan, []);
    assert.equal(B.planStaven(stand.plan, NU), null);
  });

  it("noemt alleen de ondergrens: geen reserve, vakantiestand uit", () => {
    assert.equal(B.grenzenTekst(stand), "ondergrens 5%");
    assert.equal(stand.vakantie, false);
    assert.equal(stand.vakantieMax, 50);
  });

  it("zegt wat hij opleverde, ook een vandaag van nul", () => {
    assert.equal(B.opgeleverdTekst(stand), `vandaag ${EUR("0,00")} · deze maand ${EUR("1,05")} · ${EUR("4,04")} sinds 28 sep 2026`);
  });

  it("biedt Vol laden en Leegladen, en geen Terug naar het plan zonder opdracht", () => {
    assert.equal(stand.override, null);
    assert.equal(stand.leegTot, null);
    assert.deepEqual(B.opdrachtKnoppen(stand, rollen).map((k) => [k.rol, k.aan]), [["vol", false], ["leeg", false]]);
  });
});
