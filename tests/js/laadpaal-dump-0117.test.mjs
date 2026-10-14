/**
 * Het veld "Hoe vol is de auto nu?" tegen de ECHTE coach v0.117.0.
 *
 * `vaste-invoer/coach-0.117.0-laadpaal.json` is de dump die de coach-sessie op
 * 14 oktober 2026 om 16:20 uit de Home Assistant van de eigenaar haalde, een
 * halve minuut na de herstart met v0.117.0. De integratie van de auto stond
 * uit, de eigenaar gaf om 15:38 16% op, en de stand was meegelopen naar 21.
 * Geanonimiseerd door de coach-sessie: de accusensor van de auto heet
 * `sensor.auto_soc`, en het serienummer van de paal in de entity_id's is
 * `laadpaal`.
 *
 * Twee dingen die alleen een echte dump laat zien:
 *
 * - de entity_id is `number.laadpaal_accustand_auto`, niet `..._accustand`:
 *   Home Assistant maakt hem van de naam "Accustand auto". De kaart zoekt op
 *   `translation_key`, en dat moet hier blijken;
 * - de toestand is een kommagetal als tekst, "21.0".
 *
 * REGRESSIEWACHT, allemaal: 0.64.0 is gebouwd op wat de coach-sessie over deze
 * vorm zei, en deze dump bevestigt dat. Op 0.63.1 falen er vier (daar bestaan
 * `accustandVeld` en `accustandInvoer` niet); de vorm van de dump, het zoeken
 * op translation_key en de schatting in de kop slagen daar ook, want dat deed
 * de kaart al.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as C from "../../src/cards/coach-logica.js";
import * as L from "../../src/cards/laadpaal-logica.js";

const DUMP = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.117.0-laadpaal.json", import.meta.url), "utf8"));
const rol = (sleutel) => DUMP.find((e) => e.translation_key === sleutel);

/** Een hass zoals Home Assistant hem aan de kaart geeft, met de dump als apparaat. */
const HASS = {
  states: Object.fromEntries(DUMP.map((e) => [e.entity_id, e])),
  entities: Object.fromEntries(
    DUMP.map((e) => [
      e.entity_id,
      { entity_id: e.entity_id, device_id: "lp", platform: C.COACH_PLATFORM, translation_key: e.translation_key },
    ])
  ),
  devices: { lp: { id: "lp", name: "Laadpaal", manufacturer: C.COACH_FABRIKANT, model: "Laadpaal" } },
};

const LOOPT = "Dit loopt mee met wat de paal erin doet. Zegt de auto iets anders, vul dat in en druk op Doorgeven.";

describe("REGRESSIEWACHT: de laadpaalkaart tegen coach 0.117.0", () => {
  it("zo staat het er echt: echte booleans, een kommagetal als toestand, 0 tot 100 per 1", () => {
    const a = rol("accustand").attributes;
    assert.equal(a.vragen, true);
    assert.equal(a.wacht, false);
    assert.equal(a.sensor, true);
    assert.equal(rol("accustand").state, "21.0");
    assert.deepEqual([a.min, a.max, a.step], [0, 100, 1]);
  });

  it("vindt de number op translation_key, ook al heet hij number.laadpaal_accustand_auto", () => {
    const keuze = C.kiesApparaat(HASS, "", L.LAADPAAL_MODELLEN, "Laadpaal");
    assert.equal(keuze.reden, "enige");
    assert.equal(C.coachRollen(HASS, keuze.id).accustand, "number.laadpaal_accustand_auto");
  });

  it("toont het veld met de stand van de coach en de uitleg na een opgave", () => {
    assert.deepEqual(L.accustandVeld(rol("accustand")), { waarde: "21", opgegeven: true, uitleg: LOOPT });
  });

  it("de kop zegt hetzelfde getal, als schatting", () => {
    assert.equal(L.socTekst(L.laadpaalStand(rol("coach"))), "± 21%");
  });

  it("wat er naar de coach gaat, binnen het bereik van de echte entiteit", () => {
    const st = rol("accustand");
    assert.equal(L.accustandInvoer("45", st), 45);
    assert.equal(L.accustandInvoer("140", st), 100);
    assert.equal(L.accustandInvoer("12,6", st), 13);
  });

  it("zonder opgave (dezelfde entiteit, toestand unknown): de zin over de sensor en dan 'Geef dit door'", () => {
    // Afgeleid van de dump: alleen de toestand is anders. Zo staat hij tussen
    // het insteken en de eerste opgave, met `wacht` en `sensor` zoals hier.
    const st = { ...rol("accustand"), state: "unknown" };
    assert.deepEqual(L.accustandVeld(st), {
      waarde: "",
      opgegeven: false,
      uitleg: "De auto geeft zijn accustand nu niet door. Geef dit door, dan kan de coach het gunstigste moment kiezen.",
    });
  });

  it("een coach zonder deze entiteit (0.112.3): geen veld", () => {
    const oud = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.112.3-laadpaal.json", import.meta.url), "utf8"));
    assert.equal(oud.some((e) => e.translation_key === "accustand"), false);
    assert.equal(L.accustandVeld(undefined), null);
  });
});
