/**
 * De airco-kaart met DomotiApp Coach (contract afgesproken op 14 oktober 2026).
 *
 * De eigenaar koos die dag: de coach zet de airco aan en uit op zon of een
 * goedkoop uur, met de temperatuur die de bewoner op de kaart koos. De kaart
 * schrijft dat doel dan naar de number `doeltemperatuur` van de coach, niet
 * naar de climate. Zie het coachdeel onderaan `airco-logica.js`.
 *
 * Gebouwd op wat de coach-sessie over de vorm schreef, VOOR de uitgave van
 * die coach. De echte dump komt erbij als vaste invoer voordat dit uitgaat.
 *
 * NIEUW GEDRAG: elke test hier faalt op 0.64.0, want `aircoCoach`,
 * `aircoCoachStand`, `coachRegel`, `metCoachDoel`, `doelOproepVoor` en
 * `coachKnoppen` bestaan daar niet.
 *
 * Sinds 0.65.1 (coach v0.119.1) is de schakelaar "Alleen op zon" de keuze
 * "Aan op": zon, goedkope uren of beide. Negen tests daarvan falen op 0.65.0
 * (`aanOpKeuzes` en `aanOpOproep` bestaan daar niet, en `aircoCoachStand` en
 * `coachRegel` kennen `aan_op` niet). Twee slagen daar ook en zijn dus
 * REGRESSIEWACHT voor 0.65.0: alleen Pauze als knop (0.65.0 zocht de switch
 * `alleen_zon`, die er niet meer is), en de wachtzin bij een vast contract.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as A from "../../src/cards/airco-logica.js";
import { COACH_FABRIKANT, COACH_PLATFORM } from "../../src/cards/coach-logica.js";

const KLIMAAT = {
  entity_id: "climate.kantoor",
  state: "off",
  attributes: {
    hvac_modes: ["off", "heat", "cool", "auto", "dry", "fan_only"],
    min_temp: 7,
    max_temp: 35,
    target_temp_step: 1,
    temperature: 21,
    current_temperature: 19.5,
    supported_features: 1 | 128 | 256,
  },
};

const COACH = (attributen = {}) => ({
  entity_id: "sensor.kantoor_airco_coach",
  state: "Wacht op zon",
  attributes: {
    contract: 1,
    type: "airco",
    stand: "uit",
    modus: "heat",
    reason: "",
    dynamisch: true,
    aan_op: "zon",
    klimaat: "climate.kantoor",
    ruimte: "Kantoor",
    ...attributen,
  },
});

const DOEL = (state = "22.5", attributen = {}) => ({
  entity_id: "number.kantoor_airco_doeltemperatuur",
  state,
  attributes: { min: 7, max: 35, step: 0.5, mode: "box", unit_of_measurement: "°C", ...attributen },
});

const SCHAKEL = (id, state) => ({ entity_id: id, state, attributes: {} });

const AAN_OP = (state = "zon", options = ["zon", "goedkoop", "beide"]) => ({
  entity_id: "select.kantoor_airco_aan_op",
  state,
  attributes: { options },
});

/** Een hass met één airco van de coach, plus een laadpaal die er niet bij hoort. */
function maakHass({ coach = COACH(), doel = DOEL(), aanOp = AAN_OP(), pauze = "off" } = {}) {
  const states = {
    "climate.kantoor": KLIMAAT,
    "sensor.kantoor_airco_coach": coach,
    "number.kantoor_airco_doeltemperatuur": doel,
    "select.kantoor_airco_aan_op": aanOp,
    "switch.kantoor_airco_pauze": SCHAKEL("switch.kantoor_airco_pauze", pauze),
    "sensor.oprit_coach": { entity_id: "sensor.oprit_coach", state: "Laadt", attributes: { contract: 1, klimaat: "climate.kantoor" } },
  };
  const rol = (id, device_id, translation_key, platform = COACH_PLATFORM) => [id, { entity_id: id, device_id, platform, translation_key }];
  return {
    states,
    entities: Object.fromEntries([
      rol("climate.kantoor", "unit", null, "melcloud_home"),
      rol("sensor.kantoor_airco_coach", "ac", "coach"),
      rol("number.kantoor_airco_doeltemperatuur", "ac", "doeltemperatuur"),
      rol("select.kantoor_airco_aan_op", "ac", "aan_op"),
      rol("switch.kantoor_airco_pauze", "ac", "pauze"),
      rol("sensor.oprit_coach", "lp", "coach"),
    ]),
    devices: {
      unit: { id: "unit", name: "Kantoor", manufacturer: "Mitsubishi Electric", model: "" },
      ac: { id: "ac", name: "Airco kantoor", manufacturer: COACH_FABRIKANT, model: "Airco" },
      lp: { id: "lp", name: "Oprit", manufacturer: COACH_FABRIKANT, model: "Laadpaal" },
    },
  };
}

describe("NIEUW GEDRAG: de coach bij een airco vinden", () => {
  it("aan het attribuut klimaat van zijn sensor coach, zonder iets te kiezen", () => {
    const hass = maakHass();
    const c = A.aircoCoach(hass, "climate.kantoor");
    assert.equal(c.id, "ac");
    assert.equal(c.rollen.coach, "sensor.kantoor_airco_coach");
    assert.equal(c.rollen.doeltemperatuur, "number.kantoor_airco_doeltemperatuur");
    assert.equal(c.rollen.aan_op, "select.kantoor_airco_aan_op");
    assert.equal(c.rollen.pauze, "switch.kantoor_airco_pauze");
  });

  it("niet bij een andere airco", () => {
    assert.equal(A.aircoCoach(maakHass(), "climate.slaapkamer"), null);
    assert.equal(A.aircoCoach(maakHass(), ""), null);
  });

  it("alleen een apparaat met model Airco: een laadpaal met hetzelfde attribuut telt niet", () => {
    const hass = maakHass();
    delete hass.devices.ac;
    assert.equal(A.aircoCoach(hass, "climate.kantoor"), null);
  });

  it("een coach die onbereikbaar is stuurt niets: dan een gewone airco-kaart", () => {
    const hass = maakHass({ coach: { entity_id: "sensor.kantoor_airco_coach", state: "unavailable", attributes: {} } });
    assert.equal(A.aircoCoach(hass, "climate.kantoor"), null);
  });

  it("zonder coach en zonder register: null, geen fout", () => {
    assert.equal(A.aircoCoach({ states: { "climate.kantoor": KLIMAAT }, entities: {}, devices: {} }, "climate.kantoor"), null);
    assert.equal(A.aircoCoach(undefined, "climate.kantoor"), null);
  });
});

describe("NIEUW GEDRAG: wat de coach zegt", () => {
  it("de attributen, en alleen echte waarden", () => {
    const s = A.aircoCoachStand(COACH({ stand: "zon", modus: "cool", reason: " Er is zon over. ", bewoner_tot: null }));
    assert.equal(s.contract, 1);
    assert.equal(s.stand, "zon");
    assert.equal(s.modus, "cool");
    assert.equal(s.reden, "Er is zon over.");
    assert.equal(s.dynamisch, true);
    assert.equal(s.aanOp, "zon");
    assert.equal(s.bewonerTot, null);
    assert.equal(s.ruimte, "Kantoor");
  });

  it("dynamisch moet echt waar zijn; een onbekende modus is geen modus", () => {
    const s = A.aircoCoachStand(COACH({ dynamisch: "true", modus: "auto" }));
    assert.equal(s.dynamisch, false);
    assert.equal(s.modus, "");
    assert.equal(A.aircoCoachStand(COACH({ dynamisch: undefined })).dynamisch, false);
  });

  it("bewoner_tot als tijdstip", () => {
    const s = A.aircoCoachStand(COACH({ stand: "bewoner", bewoner_tot: "2026-10-15T00:00:00+02:00" }));
    assert.equal(+s.bewonerTot, +new Date("2026-10-15T00:00:00+02:00"));
    assert.equal(A.aircoCoachStand(COACH({ bewoner_tot: "middernacht" })).bewonerTot, null);
  });

  it("onbereikbaar of geen sensor: null", () => {
    assert.equal(A.aircoCoachStand(null), null);
    assert.equal(A.aircoCoachStand({ state: "unavailable", attributes: { stand: "zon" } }), null);
  });
});

describe("NIEUW GEDRAG: de regel van de coach op de kaart", () => {
  const regel = (attributen) => A.coachRegel(A.aircoCoachStand(COACH(attributen)));

  it("de zin van de coach gaat voor", () => {
    assert.equal(regel({ stand: "zon", reason: "Er is 1,4 kW zon over." }), "Er is 1,4 kW zon over.");
  });

  it("zonder zin een woord bij de stand", () => {
    assert.equal(regel({ stand: "zon" }), "Aan op zon.");
    assert.equal(regel({ stand: "goedkoop" }), "Aan op een goedkoop uur.");
    assert.equal(regel({ stand: "op_temperatuur" }), "Op temperatuur.");
    assert.equal(regel({ stand: "pauze" }), "De coach is gepauzeerd.");
    assert.equal(regel({ stand: "geen_meting" }), "De coach mist een meting.");
  });

  it("wachten: op wat de bewoner bij Aan op koos", () => {
    assert.equal(regel({ stand: "uit", aan_op: "zon" }), "Wacht op zon.");
    assert.equal(regel({ stand: "uit", aan_op: "goedkoop" }), "Wacht op een goedkoop uur.");
    assert.equal(regel({ stand: "uit", aan_op: "beide" }), "Wacht op zon of een goedkoop uur.");
  });

  it("REGRESSIEWACHT op 0.65.0: wachten bij een vast contract is altijd op zon, want er is geen goedkoop uur", () => {
    assert.equal(regel({ stand: "uit", dynamisch: false, aan_op: "beide" }), "Wacht op zon.");
    assert.equal(regel({ stand: "uit", dynamisch: false, aan_op: "goedkoop" }), "Wacht op zon.");
  });

  it("zelf bediend: tot wanneer de coach eraf blijft", () => {
    // Een tijdstip zonder zone is lokale tijd: zo test het op elke machine gelijk.
    assert.equal(
      regel({ stand: "bewoner", bewoner_tot: "2026-10-15T00:00:00" }),
      "Zelf bediend. De coach doet weer mee vanaf middernacht."
    );
    assert.equal(regel({ stand: "bewoner", bewoner_tot: "2026-10-14T14:30:00" }), "Zelf bediend. De coach doet weer mee vanaf 14:30.");
    assert.equal(regel({ stand: "bewoner" }), "Zelf bediend.");
  });

  it("een stand die de kaart niet kent: niets, en zonder coach ook niets", () => {
    assert.equal(regel({ stand: "nieuw_iets" }), "");
    assert.equal(A.coachRegel(null), "");
  });

  it("geen gedachtestreepjes in tekst die de klant leest", () => {
    for (const stand of [...Object.keys(A.COACH_STANDEN), "bewoner"]) {
      for (const extra of [{}, { bewoner_tot: "2026-10-15T00:00:00" }, { dynamisch: false }, { aan_op: "goedkoop" }, { aan_op: "beide" }]) {
        assert.doesNotMatch(regel({ stand, ...extra }), /[–—]| - |--/);
      }
    }
  });
});

describe("NIEUW GEDRAG: het doel komt van de coach", () => {
  it("de climate krijgt het doel en de grenzen van de number", () => {
    const st = A.metCoachDoel(KLIMAAT, DOEL("23", { min: 16, max: 30, step: 0.5 }));
    assert.equal(st.attributes.temperature, 23);
    assert.equal(st.attributes.min_temp, 16);
    assert.equal(st.attributes.max_temp, 30);
    assert.equal(st.attributes.target_temp_step, 0.5);
    // De rest van de airco blijft zoals hij is.
    assert.equal(st.state, "off");
    assert.equal(st.entity_id, "climate.kantoor");
    assert.deepEqual(st.attributes.hvac_modes, KLIMAAT.attributes.hvac_modes);
    // En het origineel is niet aangeraakt.
    assert.equal(KLIMAAT.attributes.temperature, 21);
  });

  it("ook als de airco uit staat is er een doel om te stellen", () => {
    const inst = A.doelInstelling(A.metCoachDoel(KLIMAAT, DOEL("22.5")));
    assert.deepEqual(inst, { soort: "enkel", min: 7, max: 35, stap: 0.5, doel: 22.5 });
    assert.equal(A.volgendeWaarde(inst, "doel", 22.5, 1), 23);
  });

  it("een airco met een bereik krijgt één doel: de coach kiest verwarmen of koelen", () => {
    const bereik = {
      ...KLIMAAT,
      state: "heat_cool",
      attributes: { ...KLIMAAT.attributes, temperature: null, target_temp_low: 20, target_temp_high: 24 },
    };
    const st = A.metCoachDoel(bereik, DOEL("22"));
    assert.equal(A.doelInstelling(st).soort, "enkel");
    assert.equal(A.aircoStand(st).doel, 22);
  });

  it("weet de number niets, dan blijft de climate zoals hij is", () => {
    assert.equal(A.metCoachDoel(KLIMAAT, DOEL("unknown")), KLIMAAT);
    assert.equal(A.metCoachDoel(KLIMAAT, null), KLIMAAT);
    assert.equal(A.metCoachDoel(null, DOEL()), null);
  });
});

describe("NIEUW GEDRAG: het doel gaat naar de coach, niet naar de airco", () => {
  it("met een coach: number.set_value op doeltemperatuur", () => {
    assert.deepEqual(A.doelOproepVoor(KLIMAAT, DOEL(), { doel: 23 }), [
      "number",
      "set_value",
      { entity_id: "number.kantoor_airco_doeltemperatuur", value: 23 },
    ]);
  });

  it("zonder coach, of met een number die onbereikbaar is: zoals altijd naar de climate", () => {
    const naarAirco = ["climate", "set_temperature", { entity_id: "climate.kantoor", temperature: 23 }];
    assert.deepEqual(A.doelOproepVoor(KLIMAAT, null, { doel: 23 }), naarAirco);
    assert.deepEqual(A.doelOproepVoor(KLIMAAT, DOEL("unavailable"), { doel: 23 }), naarAirco);
  });
});

describe("NIEUW GEDRAG op 0.64.0, REGRESSIEWACHT op 0.65.0: de knoppen van de coach", () => {
  const knoppen = (opties, attributen) => {
    const hass = maakHass({ coach: COACH(attributen), ...opties });
    const c = A.aircoCoach(hass, "climate.kantoor");
    return A.coachKnoppen(hass, c.rollen, A.aircoCoachStand(hass.states[c.rollen.coach]));
  };

  it("Pauze, met zijn stand; Alleen op zon is er niet meer", () => {
    assert.deepEqual(knoppen({ pauze: "on" }).map((k) => [k.rol, k.aan, k.label]), [["pauze", true, "Pauze"]]);
    assert.deepEqual(knoppen({}, { dynamisch: false }).map((k) => k.rol), ["pauze"]);
  });

  it("een schakelaar die er niet is of onbereikbaar is: geen knop", () => {
    assert.deepEqual(knoppen({ pauze: "unavailable" }), []);
    const hass = maakHass();
    assert.deepEqual(A.coachKnoppen(hass, {}, A.aircoCoachStand(COACH())), []);
    assert.deepEqual(A.coachKnoppen(hass, A.aircoCoach(hass, "climate.kantoor").rollen, null), []);
  });
});

describe("NIEUW GEDRAG: Aan op, zon, goedkope uren of beide (coach v0.119.1)", () => {
  const keuze = (aanOp = AAN_OP(), attributen = {}) => A.aanOpKeuzes(aanOp, A.aircoCoachStand(COACH(attributen)));

  it("drie knoppen met een kort woord, en de gekozen", () => {
    const k = keuze(AAN_OP("goedkoop"));
    assert.equal(k.id, "select.kantoor_airco_aan_op");
    assert.equal(k.gekozen, "goedkoop");
    assert.deepEqual(
      k.opties.map((o) => [o.waarde, o.label, o.naam]),
      [
        ["zon", "Zon", "Zon over"],
        ["goedkoop", "Goedkoop", "Goedkope uren"],
        ["beide", "Beide", "Zon en goedkope uren"],
      ]
    );
  });

  it("niet bij een vast contract: dan is er geen goedkoop uur om te kiezen", () => {
    assert.equal(keuze(AAN_OP(), { dynamisch: false }), null);
    assert.equal(keuze(AAN_OP(), { dynamisch: undefined }), null);
  });

  it("niet zonder select, en niet als hij onbereikbaar is of maar één keuze heeft", () => {
    assert.equal(keuze(null), null);
    assert.equal(keuze(AAN_OP("unavailable")), null);
    assert.equal(keuze(AAN_OP("zon", ["zon"])), null);
    assert.equal(A.aanOpKeuzes(AAN_OP(), null), null);
  });

  it("een keuze die de kaart niet kent blijft staan, met zijn eigen naam", () => {
    const k = keuze(AAN_OP("zon", ["zon", "goedkoop", "beide", "nacht"]));
    assert.equal(k.opties.length, 4);
    assert.equal(k.opties[3].waarde, "nacht");
    assert.ok(k.opties[3].label);
  });

  it("kiezen is select.select_option op de select van de coach", () => {
    assert.deepEqual(A.aanOpOproep(AAN_OP(), "beide"), [
      "select",
      "select_option",
      { entity_id: "select.kantoor_airco_aan_op", option: "beide" },
    ]);
  });

  it("een keuze die er niet bij hoort, of een select die er niet is: niets", () => {
    assert.equal(A.aanOpOproep(AAN_OP(), "altijd"), null);
    assert.equal(A.aanOpOproep(null, "zon"), null);
    assert.equal(A.aanOpOproep(AAN_OP("unavailable"), "zon"), null);
  });

  it("geen gedachtestreepjes in de woorden", () => {
    for (const o of Object.values(A.AAN_OP)) {
      assert.doesNotMatch(`${o.label} ${o.naam}`, /[–—]| - |--/);
    }
  });
});
