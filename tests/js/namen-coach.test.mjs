/**
 * De namen van 13 november 2026 (de eigenaar): COACH is het systeem, Coach Assist de digitale hulp, DomotiTech het
 * bedrijf. NIEUW GEDRAG: op 0.124.1 zeggen de kaarten "DomotiApp Coach" en "de DomotiTech Bot", en vindt een kaart een
 * apparaat met de fabrikant "COACH" niet.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as B from "../../src/cards/bot-logica.js";
import * as C from "../../src/cards/coach-logica.js";
import { _reset, t } from "../../src/taal.js";

describe("de fabrikant: de oude naam en de nieuwe", () => {
  // De werkplaats zet de fabrikant pas om als elke klant een lovelace heeft die beide kent.
  const devices = {
    oud: { name: "Oprit", manufacturer: "DomotiApp Coach", model: "Laadpaal" },
    nieuw: { name: "Carport", manufacturer: "COACH", model: "Laadpaal" },
    ander: { name: "Wallbox", manufacturer: "Easee", model: "Laadpaal" },
  };

  it("vindt een apparaat onder elk van de twee", () => {
    assert.deepEqual(C.coachApparaten({ devices }, ["Laadpaal"]).map((a) => a.id), ["nieuw", "oud"]);
  });

  it("zet allebei in de filter van de apparaatkiezer, voor elk model", () => {
    assert.deepEqual(C.coachFilter(["Vaatwasser", "Wasmachine"]), [
      { manufacturer: "DomotiApp Coach", model: "Vaatwasser" },
      { manufacturer: "DomotiApp Coach", model: "Wasmachine" },
      { manufacturer: "COACH", model: "Vaatwasser" },
      { manufacturer: "COACH", model: "Wasmachine" },
    ]);
  });

  it("houdt de oude naam: die staat bij elke klant", () => {
    assert.ok(C.COACH_FABRIKANTEN.includes("DomotiApp Coach"));
  });
});

describe("wie een bericht schreef", () => {
  it("noemt een antwoord Coach Assist, ook een oud met de naam DomotiTech", () => {
    assert.equal(B.afzender({ van: "domotitech", naam: "DomotiTech" }), "Coach Assist");
    assert.equal(B.afzender({ van: "domotitech", naam: "Coach Assist" }), "Coach Assist");
    assert.equal(B.afzender({ van: "domotitech" }), "Coach Assist");
  });

  it("laat de naam van een bewoner staan, en een bericht van de klant zonder naam leeg", () => {
    assert.equal(B.afzender({ van: "klant", naam: "Anna" }), "Anna");
    assert.equal(B.afzender({ van: "klant" }), "");
  });
});

describe("wat de klant leest", () => {
  it("zegt COACH en Coach Assist, ook in het Engels", () => {
    _reset();
    assert.equal(B.tegelRegel({ coach: false, stand: null }), "Heeft COACH nodig");
    assert.equal(C.coachMelding({ reden: "geen" }, 0, "0.112.1"), "Geen apparaat van COACH gevonden. Daarvoor is COACH 0.112.1 of nieuwer nodig.");
    _reset({ instelling: "en" });
    assert.equal(t("Vraag het Coach Assist"), "Ask Coach Assist");
    assert.equal(B.tegelRegel({ coach: true, teOud: true, stand: null }), "Update COACH");
    _reset();
  });

  // Alleen wat een mens leest: de zinnen in t(), nt() en tc(), en het Engels. Commentaar, kaarttypes en bestandsnamen
  // blijven zoals ze zijn.
  it("bevat nergens nog DomotiApp Coach, de DomotiTech Bot of de bot", () => {
    const zinnen = [];
    const lees = (map) => {
      for (const e of readdirSync(new URL(map, import.meta.url), { withFileTypes: true })) {
        const pad = new URL(map + e.name + (e.isDirectory() ? "/" : ""), import.meta.url);
        if (e.isDirectory()) lees(map + e.name + "/");
        else if (e.name.endsWith(".js")) {
          const bron = readFileSync(pad, "utf8");
          for (const m of bron.matchAll(/\b(?:t|nt|tc|tn)\(\s*(?:"[^"]*",\s*)?"([^"]+)"/g)) zinnen.push(m[1]);
          if (map.includes("/i18n/")) for (const m of bron.matchAll(/"([^"]+)"/g)) zinnen.push(m[1]);
        }
      }
    };
    lees("../../src/");
    assert.ok(zinnen.length > 1000, `te weinig zinnen gevonden: ${zinnen.length}`);
    const fout = zinnen.filter((z) => !z.endsWith(".js") && /DomotiApp Coach(?! Assist)|DomotiTech Bot|\b[Bb]ot\b/.test(z));
    assert.deepEqual(fout, []);
  });
});
