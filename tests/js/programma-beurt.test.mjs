/**
 * Wasmachine en droger: alleen uitlezen, en de laatste beurt als hij uit
 * staat. **NIEUW GEDRAG** (16 oktober 2026, 0.78.0), op de REGRESSIEWACHTEN na.
 *
 * De eigenaar, na de eerste echte beurten bij een klant: *"wasmachines en
 * drogers moeten alleen read only en info kaarten zijn ik wil ook dan de
 * laatste beurt als geschiedenis op de kaart zien tot dat hij aan staat dan de
 * live data zien"*.
 *
 * `vaste-invoer/miele-beurten.json` is de geschiedenis van die dag, door een
 * beheersessie uit de recorder gehaald. De beurten zoals die sessie ze uit de
 * dump las (lokale tijd):
 * - wasmachine: Katoen 30 °C, 09:00-10:10, 0,3 kWh, 46 L (met een afgebroken
 *   start om 08:59 en een korte pauze); Katoen 30 °C, 10:27-11:33, 0,2 kWh,
 *   33 L; Express 20, 40 °C, 12:48-13:09, 0,2 kWh, 17 L. Om 12:17 even aan
 *   zonder programma.
 * - droger: Katoen normaal, 10:25-11:27, 0,4 kWh; Katoen normaal, 11:50-12:17,
 *   0,1 kWh (zonder klaarzetten, meteen aan de knop); Katoen extra droog,
 *   12:25-12:50, 0,2 kWh.
 *
 * De toetsen kappen de dag af op een moment dat de machine uit stond, en
 * kijken of de kaart dan die beurt vindt.
 *
 * Sinds 0.78.1 is de duur het verschil tussen de klokken op de statusregel.
 * Bij de klant stond er "12:48 – 13:09" boven "22 min" (de seconden
 * afgerond). Daardoor zijn de derde beurt van allebei een minuut korter dan in
 * 0.78.0; de toets daarvoor staat onderaan.
 *
 * Sinds 0.78.2 is een onderbreking een pauze, en eindigt een beurt waar hij
 * ophield te draaien. Ook die toets staat onderaan.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as P from "../../src/cards/programma-logica.js";
import * as V from "../../src/cards/vaatwasser-logica.js";

const DAG = JSON.parse(readFileSync(new URL("./vaste-invoer/miele-beurten.json", import.meta.url), "utf8"));
const APPARAAT = JSON.parse(readFileSync(new URL("./vaste-invoer/miele-was-droog-vries.json", import.meta.url), "utf8"));
// Lui en met `?.`: op de oude code bestaat `reeksenUitRest` niet, en dan
// hoort elke toets apart te falen in plaats van het hele bestand.
const ALLE = P.reeksenUitRest?.(DAG.history) ?? {};
/** Een reeks rechtstreeks uit de dump, zonder de code die getoetst wordt. */
const RUW = (id) =>
  DAG.history.find((r) => r[0].entity_id === id).map((x) => ({ s: x.state, t: Date.parse(x.last_changed) }));

/** De dag tot en met dit moment (lokale tijd, "10:20" of "12:24:30"). */
function tot(klok) {
  const grens = Date.parse(`2026-10-16T${klok.length === 5 ? `${klok}:00` : klok}+02:00`);
  return Object.fromEntries(Object.entries(ALLE).map(([id, r]) => [id, r.filter((x) => x.t <= grens)]));
}

const WAS = {
  status: "sensor.wasmachine",
  programma: "sensor.wasmachine_programma",
  energie: "sensor.wasmachine_energieverbruik",
  water: "sensor.wasmachine_waterverbruik",
  temperatuur: "sensor.wasmachine_temperatuur",
};
const DROOG = {
  status: "sensor.wasdroger",
  programma: "sensor.wasdroger_programma",
  energie: "sensor.wasdroger_energieverbruik",
  droogtegraad: "sensor.wasdroger_droogtegraad",
};
// De opties staan niet in de geschiedenis (Home Assistant bewaart ze niet);
// de kaart geeft die van de toestand van nu mee.
const OPTIES = APPARAAT.states["sensor.wasmachine"].attributes.options;

const kort = (d) => {
  const z = new Date(d.getTime() + 2 * 3_600_000);
  return `${String(z.getUTCHours()).padStart(2, "0")}:${String(z.getUTCMinutes()).padStart(2, "0")}`;
};
const beurt = (rollen, klok) => {
  const b = P.laatsteBeurt(tot(klok), rollen, OPTIES);
  return b && { van: kort(b.start), tot: kort(b.eind), min: b.minuten, programma: b.programma, energie: b.energie, water: b.water, temperatuur: b.temperatuur, droogtegraad: b.droogtegraad };
};

describe("REGRESSIEWACHT: de dag van Miele in de recorder", () => {
  it("de status loopt off, programmed, in_use, program_ended, off", () => {
    const s = RUW("sensor.wasmachine").map((x) => x.s);
    assert.deepEqual(s.slice(0, 2), ["off", "programmed"]);
    assert.ok(s.includes("in_use") && s.includes("program_ended") && s.includes("program_interrupted"));
    assert.equal(s.at(-1), "off");
  });

  it("bij off is alles tegelijk weg: dat is waarom de kaart terug moet kijken", () => {
    const uitOm = RUW("sensor.wasmachine").find((x, i) => x.s === "off" && i > 0).t;
    for (const id of [WAS.programma, WAS.energie, WAS.water, WAS.temperatuur]) {
      // Tegelijk is hier binnen een paar milliseconden: elke sensor is een eigen regel.
      const op = RUW(id).find((x) => Math.abs(x.t - uitOm) < 2_000);
      assert.ok(op, id);
      assert.ok(["unknown", "no_program"].includes(op.s), `${id}: ${op.s}`);
    }
  });
});

describe("de laatste beurt van de wasmachine", () => {
  it("de eerste: de afgebroken start van 08:59 telt niet, de pauze wel", () => {
    assert.deepEqual(beurt(WAS, "10:20"), {
      van: "09:00",
      tot: "10:10",
      min: 70,
      programma: "cottons",
      energie: 0.3,
      water: 46,
      temperatuur: 30,
      droogtegraad: null,
    });
  });

  it("de tweede, ook nadat hij om 12:17 even aan was zonder programma", () => {
    const tweede = { van: "10:27", tot: "11:33", min: 66, programma: "cottons", energie: 0.2, water: 33, temperatuur: 30, droogtegraad: null };
    assert.deepEqual(beurt(WAS, "12:00"), tweede);
    assert.deepEqual(beurt(WAS, "12:20"), tweede);
  });

  it("de derde, aan het eind van de dag", () => {
    assert.deepEqual(beurt(WAS, "17:30"), {
      van: "12:48",
      tot: "13:09",
      min: 21,
      programma: "express_20",
      energie: 0.2,
      water: 17,
      temperatuur: 40,
      droogtegraad: null,
    });
  });

  it("geen beurt terwijl hij draait, en niet voor de eerste", () => {
    assert.equal(P.laatsteBeurt(tot("09:30"), WAS, OPTIES), null);
    assert.equal(P.laatsteBeurt(tot("08:00"), WAS, OPTIES), null);
    assert.equal(P.laatsteBeurt({}, WAS, OPTIES), null);
  });
});

describe("de laatste beurt van de droger", () => {
  it("de eerste, de tweede (zonder klaarzetten) en de derde", () => {
    assert.deepEqual(beurt(DROOG, "11:40"), { van: "10:25", tot: "11:27", min: 62, programma: "cottons", energie: 0.4, water: null, temperatuur: null, droogtegraad: "normal" });
    assert.deepEqual(beurt(DROOG, "12:24:30"), { van: "11:50", tot: "12:17", min: 27, programma: "cottons", energie: 0.1, water: null, temperatuur: null, droogtegraad: "normal" });
    assert.deepEqual(beurt(DROOG, "17:30"), { van: "12:25", tot: "12:50", min: 25, programma: "cottons", energie: 0.2, water: null, temperatuur: null, droogtegraad: "extra_dry" });
  });
});

describe("een beurt die met de hand gestopt is", () => {
  it("eindigt waar hij ophield te draaien, ook zonder program_ended", () => {
    const r = { "sensor.w": [{ s: "off", t: 0 }, { s: "programmed", t: 60_000 }, { s: "in_use", t: 120_000 }, { s: "off", t: 720_000 }] };
    const b = P.laatsteBeurt(r, { status: "sensor.w" }, OPTIES);
    assert.equal(b.start.getTime(), 120_000);
    assert.equal(b.eind.getTime(), 720_000);
    assert.equal(b.minuten, 10);
  });
});

describe("wat Home Assistant over de websocket stuurt", () => {
  it("reeksenUitWs: seconden naar milliseconden, lc gaat voor lu, op tijd", () => {
    const r = P.reeksenUitWs({ "sensor.w": [{ s: "on", lu: 20, lc: 15 }, { s: "off", lu: 10.5 }] });
    assert.deepEqual(r, { "sensor.w": [{ s: "off", t: 10_500 }, { s: "on", t: 15_000 }] });
  });
});

describe("de woorden en de tegels", () => {
  const h = {
    devices: APPARAAT.devices,
    entities: Object.fromEntries(Object.entries(APPARAAT.entities).filter(([, e]) => !e.disabled_by)),
    states: APPARAAT.states,
  };
  const st = (id) => h.states[id] ?? null;
  const VERTAAL = { cottons: "Katoen", express_20: "Express 20", normal: "Normaal", extra_dry: "Extra droog" };
  const fmt = (s) => VERTAAL[s.state] ?? s.state;
  const rollen = (id) => P.apparaatRollen(h, id, { ...P.ROLLEN, ...P.BEURT_ROLLEN });

  it("wanneer: vandaag, gisteren, of de dag", () => {
    const b = { start: new Date(2026, 9, 16, 12, 48), eind: new Date(2026, 9, 16, 13, 9) };
    assert.equal(P.beurtWanneer(b, new Date(2026, 9, 16, 18)), "vandaag 12:48 – 13:09");
    assert.equal(P.beurtWanneer(b, new Date(2026, 9, 17, 0, 5)), "gisteren 12:48 – 13:09");
    assert.equal(P.beurtWanneer(b, new Date(2026, 9, 19, 9)), "vr 16 okt 12:48 – 13:09");
  });

  it("duur", () => {
    assert.deepEqual([22, 60, 70, 126].map(P.duurTekst), ["22 min", "1 uur", "1 u 10 min", "2 u 6 min"]);
  });

  it("de wasmachine: acht tegels, net als live, met de deur en TwinDos van nu", () => {
    const r = rollen("sensor.wasmachine");
    const b = P.laatsteBeurt(tot("17:30"), { ...WAS }, OPTIES);
    const tegels = P.beurtTegels({ rollen: { ...r, status: "sensor.wasmachine" }, beurt: b, st, fmt });
    assert.deepEqual(
      tegels.map((t) => `${t.label}: ${t.waarde}`),
      // Deur en TwinDos uit de toestand van NU (de oudere dump: open, 95 en 100).
      ["Deur: Open", "Programma: Express 20", "Temperatuur: 40 °C", "Duur: 21 min", "Energie: 0,2 kWh", "Water: 17 L", "TwinDos 1: 95%", "TwinDos 2: 100%"]
    );
    assert.equal(tegels.length, P.programmaTegels({ rollen: r, st, fmt }).length);
  });

  it("de droger: vijf tegels, net als live", () => {
    const r = rollen("sensor.wasdroger");
    const b = P.laatsteBeurt(tot("17:30"), { ...DROOG }, OPTIES);
    const tegels = P.beurtTegels({ rollen: { ...r, status: "sensor.wasdroger" }, beurt: b, st, fmt });
    assert.deepEqual(
      tegels.map((t) => `${t.label}: ${t.waarde}`),
      ["Deur: Dicht", "Programma: Katoen", "Droogtegraad: Extra droog", "Duur: 25 min", "Energie: 0,2 kWh"]
    );
    assert.equal(tegels.length, P.programmaTegels({ rollen: r, st, fmt }).length);
  });

  it("een tegel opent de sensor waar de geschiedenis staat", () => {
    const r = rollen("sensor.wasmachine");
    const b = P.laatsteBeurt(tot("17:30"), { ...WAS }, OPTIES);
    const ids = Object.fromEntries(P.beurtTegels({ rollen: { ...r, status: "sensor.wasmachine" }, beurt: b, st, fmt }).map((t) => [t.sleutel, t.id]));
    assert.equal(ids.programma, "sensor.wasmachine_programma");
    assert.equal(ids.duur, "sensor.wasmachine");
    assert.equal(ids.water, "sensor.wasmachine_waterverbruik");
  });

  it("REGRESSIEWACHT: zonder tweede argument vindt apparaatRollen wat hij altijd vond", () => {
    assert.equal(P.apparaatRollen(h, "sensor.wasmachine").temperatuur, undefined);
    assert.equal(rollen("sensor.wasmachine").temperatuur, "sensor.wasmachine_temperatuur");
    assert.equal(rollen("sensor.wasdroger").droogtegraad, "sensor.wasdroger_droogtegraad");
  });
});

describe("alleen uitlezen", () => {
  it("wasmachine en droger, de vaatwasser niet", () => {
    assert.deepEqual(["wasmachine", "droger", "vaatwasser"].map((s) => P.ALLEEN_LEZEN.has(s)), [true, true, false]);
  });

  it("geen velden voor knoppen in de editor van een wasmachine of droger", () => {
    const apparaat = ["remaining", "start", "pause", "stop", "planned_start", "progress"];
    assert.deepEqual(V.editorVelden({ coach: false, entiteiten: {}, apparaat }).zichtbaar, ["status", "program", "door", "smart"]);
    assert.deepEqual(V.editorVelden({ coach: false, entiteiten: {}, apparaat, alleenLezen: true }).zichtbaar, ["status", "door"]);
    const metCoach = V.editorVelden({ coach: true, entiteiten: { start: "button.x", stop: "button.y" }, apparaat: [], alleenLezen: true });
    assert.ok(![...metCoach.zichtbaar, ...metCoach.afwijken].some((v) => ["program", "start", "pause", "stop", "smart"].includes(v)));
  });
});

describe("NIEUW GEDRAG (0.78.1): de duur is het verschil tussen de klokken op de statusregel", () => {
  const klokMinuten = (k) => Number(k.slice(0, 2)) * 60 + Number(k.slice(3));

  it("bij alle zes de beurten van de dump", () => {
    const zes = [
      beurt(WAS, "10:20"),
      beurt(WAS, "12:20"),
      beurt(WAS, "17:30"),
      beurt(DROOG, "11:40"),
      beurt(DROOG, "12:24:30"),
      beurt(DROOG, "17:30"),
    ];
    for (const b of zes) assert.equal(b.min, klokMinuten(b.tot) - klokMinuten(b.van), `${b.van} – ${b.tot}`);
  });

  it("12:48:07 tot 13:09:42 is 21 min, ook al is dat 21,6 minuut", () => {
    // Lokale tijd, zoals de statusregel hem toont: dan klopt het in elke tijdzone (ook in CI).
    const t = (u, m, s) => new Date(2026, 9, 16, u, m, s).getTime();
    const r = { "sensor.w": [{ s: "off", t: t(12, 0, 0) }, { s: "in_use", t: t(12, 48, 7) }, { s: "program_ended", t: t(13, 9, 42) }, { s: "off", t: t(13, 20, 0) }] };
    const b = P.laatsteBeurt(r, { status: "sensor.w" }, OPTIES);
    assert.equal(P.beurtWanneer(b, new Date(b.start.getTime() + 3_600_000)), "vandaag 12:48 – 13:09");
    assert.equal(b.minuten, 21);
  });

  it("over een minuutgrens heen is minstens 1 min, binnen één minuut 0", () => {
    const t = (k) => Date.parse(`2026-10-16T${k}+02:00`);
    const loop = (van, tot_) => P.laatsteBeurt({ "sensor.w": [{ s: "in_use", t: t(van) }, { s: "off", t: t(tot_) }] }, { status: "sensor.w" }, OPTIES);
    assert.equal(loop("17:49:50", "17:50:15").minuten, 1);
    assert.equal(loop("17:49:05", "17:49:55").minuten, 0);
  });
});

describe("0.78.2: een beurt eindigt waar hij ophield te draaien", () => {
  // Lokale tijd, net als hierboven: dan klopt de klok in elke tijdzone.
  const t = (u, m) => new Date(2026, 9, 16, u, m, 0).getTime();
  const reeks = (...stappen) => ({ "sensor.w": stappen.map(([s, u, m]) => ({ s, t: t(u, m) })) });
  const loop = (...stappen) => P.laatsteBeurt(reeks(...stappen), { status: "sensor.w" }, OPTIES);
  const klok = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const vanTot = (b) => b && `${klok(b.start)} – ${klok(b.eind)} (${b.minuten} min)`;

  it("NIEUW GEDRAG: gepauzeerd en daarna uit telt tot de pauze, niet tot uit", () => {
    const b = loop(["off", 9, 0], ["in_use", 9, 10], ["pause", 9, 40], ["off", 10, 30]);
    assert.equal(vanTot(b), "09:10 – 09:40 (30 min)");
  });

  it("NIEUW GEDRAG: zolang hij onderbroken staat, is er geen laatste beurt", () => {
    assert.equal(loop(["off", 9, 0], ["in_use", 9, 10], ["program_interrupted", 9, 40]), null);
  });

  it("REGRESSIEWACHT: onderbroken en daarna uit telt tot de onderbreking, zoals toen het een storing was", () => {
    const b = loop(["off", 9, 0], ["in_use", 9, 10], ["program_interrupted", 9, 40], ["off", 10, 30]);
    assert.equal(vanTot(b), "09:10 – 09:40 (30 min)");
  });

  it("REGRESSIEWACHT: een onderbreking of pauze middenin hoort bij de beurt", () => {
    const een = loop(["off", 9, 0], ["in_use", 9, 10], ["program_interrupted", 9, 20], ["in_use", 9, 25], ["program_ended", 10, 0], ["off", 10, 5]);
    const twee = loop(["off", 9, 0], ["in_use", 9, 10], ["pause", 9, 20], ["in_use", 9, 25], ["program_ended", 10, 0], ["off", 10, 5]);
    assert.equal(vanTot(een), "09:10 – 10:00 (50 min)");
    assert.equal(vanTot(twee), "09:10 – 10:00 (50 min)");
  });

  it("REGRESSIEWACHT: gepauzeerd is nog geen laatste beurt", () => {
    assert.equal(loop(["off", 9, 0], ["in_use", 9, 10], ["pause", 9, 40]), null);
  });

  it("REGRESSIEWACHT: de afgebroken start van 08:59 in de dump telt nog steeds niet", () => {
    assert.equal(beurt(WAS, "10:20").van, "09:00");
  });
});
