/**
 * De airco-kaart tegen coach v0.119.1: "Aan op" in plaats van "Alleen op zon".
 *
 * `vaste-invoer/coach-0.119.1-airco.json` kwam op 14 oktober 2026 van de
 * coach-sessie. Net als de dump van v0.119.0 (zie `airco-dump-0119.test.mjs`)
 * is hij **NAGEBOUWD**: de echte entiteitklassen in de Home Assistant van de
 * proeven van de coach, want er hangt nog nergens een echte airco aan de
 * coach. Twee momenten: "aan op zon" (de climate op cool) en "bewoner" (de
 * bewoner zette hem zelf op heat). In het tweede verandert alleen de sensor.
 *
 * Daarom ook de bron gelezen, tag v0.119.1:
 * - `AanOpSelect` in select.py: translation_key `aan_op`, opties
 *   `AIRCO_AAN_OP = ("zon", "goedkoop", "beide")` uit planner.py, keuze
 *   `run_on` en anders "zon";
 * - `AircoCoachSensor` in sensor.py: `"aan_op": st.get("run_on") or "zon"`;
 * - switch.py: alleen `pauze`. De switch `alleen_zon` is weg.
 *
 * De climate staat niet in deze dump. Volgens de coach-sessie is hij gelijk
 * aan die van v0.119.0 (`entiteiten` verandert niet); die wordt hier gebruikt.
 *
 * REGRESSIEWACHT, allemaal: 0.65.1 is gebouwd op wat de coach-sessie over deze
 * vorm zei, vóór deze dump. Op 0.65.0 falen de tests die "Aan op" lezen. De
 * rest slaagt daar ook: 0.65.0 valt met dit contract terug op alleen Pauze.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as A from "../../src/cards/airco-logica.js";
import { COACH_PLATFORM } from "../../src/cards/coach-logica.js";

const lees = (naam) => JSON.parse(readFileSync(new URL(`./vaste-invoer/${naam}`, import.meta.url), "utf8"));
const DUMP = lees("coach-0.119.1-airco.json");
const KLIMAAT = lees("coach-0.119.0-airco.json").aan_op_zon.klimaat;
const rol = (lijst, sleutel) => lijst.find((e) => e.translation_key === sleutel);

/** Een hass met de entiteiten van dit moment; wat erin ontbreekt komt van "aan op zon". */
function hassVan(moment, { dynamisch } = {}) {
  let lijst = [...DUMP.aan_op_zon.filter((e) => !moment.some((m) => m.entity_id === e.entity_id)), ...moment];
  if (dynamisch !== undefined) {
    // Een dynamisch contract staat niet in de dump; dezelfde sensor met dat ene attribuut anders.
    lijst = lijst.map((e) => (e.translation_key === "coach" ? { ...e, attributes: { ...e.attributes, dynamisch } } : e));
  }
  return {
    states: Object.fromEntries([...lijst, KLIMAAT].map((e) => [e.entity_id, e])),
    entities: Object.fromEntries([
      ...lijst.map((e) => [e.entity_id, { entity_id: e.entity_id, device_id: "ac", platform: COACH_PLATFORM, translation_key: e.translation_key }]),
      [KLIMAAT.entity_id, { entity_id: KLIMAAT.entity_id, device_id: "unit", platform: "melcloud_home", translation_key: null }],
    ]),
    devices: {
      ac: { id: "ac", name: "Airco woonkamer", manufacturer: "DomotiApp Coach", model: "Airco" },
      unit: { id: "unit", name: "Airco woonkamer", manufacturer: "Mitsubishi Electric", model: "" },
    },
  };
}

const coachVan = (hass) => {
  const c = A.aircoCoach(hass, "climate.airco_woonkamer");
  return { c, s: A.aircoCoachStand(hass.states[c.rollen.coach]) };
};

describe("REGRESSIEWACHT: de airco-kaart tegen coach 0.119.1 (nagebouwd, geen echte installatie)", () => {
  it("zo staat het erin: een select aan_op met drie opties, aan_op op de sensor, geen switch alleen_zon", () => {
    const sel = rol(DUMP.aan_op_zon, "aan_op");
    assert.equal(sel.entity_id, "select.airco_woonkamer_aan_op");
    assert.equal(sel.state, "zon");
    assert.deepEqual(sel.attributes.options, ["zon", "goedkoop", "beide"]);
    assert.equal(rol(DUMP.aan_op_zon, "coach").attributes.aan_op, "zon");
    assert.equal(rol(DUMP.aan_op_zon, "alleen_zon"), undefined);
    assert.equal("alleen_zon" in rol(DUMP.aan_op_zon, "coach").attributes, false);
  });

  it("vindt de coach en zijn rollen: aan_op erbij, alleen_zon weg", () => {
    const { c } = coachVan(hassVan(DUMP.aan_op_zon));
    assert.deepEqual(c.rollen, {
      aan_op: "select.airco_woonkamer_aan_op",
      coach: "sensor.airco_woonkamer_coach",
      doeltemperatuur: "number.airco_woonkamer_gewenste_temperatuur",
      pauze: "switch.airco_woonkamer_pauze",
    });
  });

  it("vast contract (zo staat het in de dump): geen Aan op, alleen Pauze, en de zin van de coach", () => {
    const hass = hassVan(DUMP.aan_op_zon);
    const { c, s } = coachVan(hass);
    assert.equal(s.aanOp, "zon");
    assert.equal(A.aanOpKeuzes(hass.states[c.rollen.aan_op], s), null);
    assert.deepEqual(A.coachKnoppen(hass, c.rollen, s).map((k) => k.rol), ["pauze"]);
    assert.equal(A.coachRegel(s), "Er is 1,5 kW zon over. Hij gaat koelen naar 23 °C; het is nu 26,5 °C.");
  });

  it("dynamisch contract: Aan op met de drie opties uit de select, en kiezen gaat naar die select", () => {
    const hass = hassVan(DUMP.aan_op_zon, { dynamisch: true });
    const { c, s } = coachVan(hass);
    const k = A.aanOpKeuzes(hass.states[c.rollen.aan_op], s);
    assert.equal(k.gekozen, "zon");
    assert.deepEqual(k.opties.map((o) => o.label), ["Zon", "Goedkoop", "Beide"]);
    assert.deepEqual(A.aanOpOproep(hass.states[c.rollen.aan_op], "beide"), [
      "select",
      "select_option",
      { entity_id: "select.airco_woonkamer_aan_op", option: "beide" },
    ]);
  });

  it("het doel gaat nog steeds naar de number van de coach", () => {
    const hass = hassVan(DUMP.aan_op_zon);
    const { c } = coachVan(hass);
    const n = hass.states[c.rollen.doeltemperatuur];
    const st = A.metCoachDoel(KLIMAAT, n);
    assert.deepEqual(A.doelInstelling(st), { soort: "enkel", min: 7, max: 35, stap: 0.5, doel: 23 });
    assert.deepEqual(A.doelOproepVoor(st, n, { doel: 22.5 }), [
      "number",
      "set_value",
      { entity_id: "number.airco_woonkamer_gewenste_temperatuur", value: 22.5 },
    ]);
  });

  it("door de bewoner bediend: de zin van de coach, de coach blijft te vinden", () => {
    const { c, s } = coachVan(hassVan(DUMP.bewoner));
    assert.equal(c.id, "ac");
    assert.equal(s.stand, "bewoner");
    assert.equal(+s.bewonerTot, Date.UTC(2026, 6, 14, 22, 0, 0));
    assert.equal(A.coachRegel(s), "Je zette hem zelf aan of uit, dus de coach blijft er vandaag vanaf.");
  });
});
