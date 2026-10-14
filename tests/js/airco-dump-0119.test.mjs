/**
 * De airco-kaart tegen coach v0.119.0, de eerste coach die een airco stuurt.
 *
 * `vaste-invoer/coach-0.119.0-airco.json` kwam op 14 oktober 2026 van de
 * coach-sessie. **Het is GEEN dump van een echte installatie.** Bij de
 * eigenaar thuis hangt geen airco, en nergens hangt er nog een aan de coach.
 * De dump komt uit de nagebouwde Home Assistant van de proeven van de coach:
 * - de echte entiteitklassen van v0.119.0;
 * - een climate met de attributen zoals ze bij een klantwoning met twee
 *   cloud-airco's gemeten zijn;
 * - entity_id's zoals Home Assistant ze maakt bij een apparaat "Airco
 *   woonkamer".
 *
 * Er staan twee momenten in: aan op zon, en door de bewoner bediend.
 *
 * De afspraak (kop van `coach-logica.js`) is dat er niets uitgaat dat een
 * attribuut van de coach leest voordat het in een echte dump heeft gestaan.
 * Kan iets niet in een dump gezien worden, dan lees je de bron van de coach op
 * dat moment. Dat is hier gedaan, tag v0.119.0:
 * - `AircoCoachSensor` in sensor.py;
 * - `DoeltemperatuurNumber` in number.py;
 * - `AircoSchakelaar` in switch.py;
 * - `apparaat_info`, `airco_stand` en `met_zone` in entiteit.py.
 *
 * Wat erin staat, staat in `docs/airco-coach/RAPPORT.md`. Komt er een echte
 * dump, dan hoort die hier naast.
 *
 * Twee dingen die deze dump laat zien en het contract niet zei:
 *
 * - de number heet `number.airco_woonkamer_gewenste_temperatuur` (van zijn
 *   naam "Gewenste temperatuur"), niet `..._doeltemperatuur`. De kaart zoekt
 *   op translation_key;
 * - `bewoner_tot` is null als hij niet geldt, en `dynamisch` is hier false
 *   (vast contract): dan geen knop Alleen op zon.
 *
 * REGRESSIEWACHT, allemaal: 0.65.0 is gebouwd op wat de coach-sessie over deze
 * vorm zei, vóór deze dump. Op 0.64.0 falen ze, op één na: de vorm van de dump
 * zelf.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as A from "../../src/cards/airco-logica.js";
import { COACH_PLATFORM } from "../../src/cards/coach-logica.js";

const DUMP = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.119.0-airco.json", import.meta.url), "utf8"));
const ZON = DUMP.aan_op_zon;
const rol = (moment, sleutel) => moment.entiteiten.find((e) => e.translation_key === sleutel);

/** Een hass zoals Home Assistant hem aan de kaart geeft, met dit moment als apparaat. */
function hassVan(moment) {
  // In het moment "bewoner" staan alleen de sensor en de climate; de number en
  // de switches zijn dan dezelfde als bij "aan op zon" (zei de coach-sessie).
  const entiteiten = [...ZON.entiteiten.filter((e) => !moment.entiteiten.some((m) => m.entity_id === e.entity_id)), ...moment.entiteiten];
  const klimaat = { ...ZON.klimaat, ...moment.klimaat, attributes: { ...ZON.klimaat.attributes, ...moment.klimaat.attributes } };
  return {
    states: Object.fromEntries([...entiteiten, klimaat].map((e) => [e.entity_id, e])),
    entities: Object.fromEntries([
      ...entiteiten.map((e) => [e.entity_id, { entity_id: e.entity_id, device_id: "ac", platform: COACH_PLATFORM, translation_key: e.translation_key }]),
      [klimaat.entity_id, { entity_id: klimaat.entity_id, device_id: "unit", platform: "melcloud_home", translation_key: null }],
    ]),
    devices: {
      ac: { id: "ac", ...DUMP.apparaat },
      unit: { id: "unit", name: "Airco woonkamer", manufacturer: "Mitsubishi Electric", model: "" },
    },
  };
}

describe("REGRESSIEWACHT: de airco-kaart tegen coach 0.119.0 (nagebouwd, geen echte installatie)", () => {
  it("zo staat het erin: model Airco, klimaat als tekst, echte booleans, een tijdstip met zone of null", () => {
    assert.equal(DUMP.apparaat.manufacturer, "DomotiApp Coach");
    assert.equal(DUMP.apparaat.model, "Airco");
    const a = rol(ZON, "coach").attributes;
    assert.equal(a.klimaat, ZON.klimaat.entity_id);
    assert.equal(a.dynamisch, false);
    assert.equal(a.bewoner_tot, null);
    assert.equal(rol(DUMP.bewoner, "coach").attributes.bewoner_tot, "2026-07-15T00:00:00+02:00");
    const n = rol(ZON, "doeltemperatuur");
    assert.deepEqual([n.state, n.attributes.min, n.attributes.max, n.attributes.step], ["23.0", 7, 35, 0.5]);
  });

  it("vindt de coach bij de climate, en de number op translation_key", () => {
    const c = A.aircoCoach(hassVan(ZON), "climate.airco_woonkamer");
    assert.equal(c.id, "ac");
    assert.deepEqual(c.rollen, {
      alleen_zon: "switch.airco_woonkamer_alleen_op_zon",
      coach: "sensor.airco_woonkamer_coach",
      doeltemperatuur: "number.airco_woonkamer_gewenste_temperatuur",
      pauze: "switch.airco_woonkamer_pauze",
    });
    assert.equal(A.aircoCoach(hassVan(ZON), "climate.slaapkamer"), null);
  });

  it("aan op zon: de zin van de coach, en het doel van de number", () => {
    const s = A.aircoCoachStand(rol(ZON, "coach"));
    assert.equal(s.stand, "zon");
    assert.equal(s.modus, "cool");
    assert.equal(A.coachRegel(s), "Er is 1,5 kW zon over, dus hij gaat koelen naar 23 °C; het is nu 26,5 °C.");
    const st = A.metCoachDoel(ZON.klimaat, rol(ZON, "doeltemperatuur"));
    assert.deepEqual(A.doelInstelling(st), { soort: "enkel", min: 7, max: 35, stap: 0.5, doel: 23 });
  });

  it("een tik op + gaat naar de number van de coach, niet naar de airco", () => {
    const st = A.metCoachDoel(ZON.klimaat, rol(ZON, "doeltemperatuur"));
    const inst = A.doelInstelling(st);
    const nieuw = A.volgendeWaarde(inst, "doel", inst.doel, 1);
    assert.deepEqual(A.doelOproepVoor(st, rol(ZON, "doeltemperatuur"), { doel: nieuw }), [
      "number",
      "set_value",
      { entity_id: "number.airco_woonkamer_gewenste_temperatuur", value: 23.5 },
    ]);
  });

  it("vast contract: alleen Pauze, geen Alleen op zon", () => {
    const hass = hassVan(ZON);
    const c = A.aircoCoach(hass, "climate.airco_woonkamer");
    const knoppen = A.coachKnoppen(hass, c.rollen, A.aircoCoachStand(hass.states[c.rollen.coach]));
    assert.deepEqual(knoppen.map((k) => [k.rol, k.id, k.aan]), [["pauze", "switch.airco_woonkamer_pauze", false]]);
  });

  it("door de bewoner bediend: de zin van de coach, en het tijdstip waarop hij weer meedoet", () => {
    const s = A.aircoCoachStand(rol(DUMP.bewoner, "coach"));
    assert.equal(s.stand, "bewoner");
    assert.equal(s.modus, "heat");
    assert.equal(+s.bewonerTot, Date.UTC(2026, 6, 14, 22, 0, 0));
    assert.equal(A.coachRegel(s), "Je zette hem zelf aan of uit, dus de coach blijft er vandaag vanaf.");
    // De coach is in dit moment nog steeds te vinden: hij blijft er alleen vanaf.
    assert.equal(A.aircoCoach(hassVan(DUMP.bewoner), "climate.airco_woonkamer")?.id, "ac");
  });

  it("geen gedachtestreepjes in de zinnen van de coach die de kaart toont", () => {
    for (const moment of [ZON, DUMP.bewoner]) {
      assert.doesNotMatch(A.coachRegel(A.aircoCoachStand(rol(moment, "coach"))), /[–—]| - |--/);
    }
  });
});
