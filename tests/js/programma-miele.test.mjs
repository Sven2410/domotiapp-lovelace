/**
 * De kaart voor vaatwasser, wasmachine en droger, met Miele (15 oktober 2026).
 *
 * `vaste-invoer/miele-was-droog-vries.json` komt uit een dump van een klant
 * (core-integratie miele, HA 2026.10.1, met serienummers en registry-ids
 * vervangen). Wasmachine en droger stonden UIT, de knoppen start, pauze en
 * stop waren door de integratie uitgeschakeld. Bij de klant zijn ze daarna
 * aangezet; dan staan ze op `unavailable` zolang de machine uit staat.
 *
 * Een draaiend programma stond niet in de dump. De toetsen daarvoor zetten de
 * toestanden zelf, met de sleutels uit de opties van de dump.
 *
 * NIEUW GEDRAG, behalve wat met REGRESSIEWACHT begint.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as P from "../../src/cards/programma-logica.js";
import * as V from "../../src/cards/vaatwasser-logica.js";
import { productAfbeelding, typeBijApparaat } from "../../src/cards/productfoto.js";

const DUMP = JSON.parse(readFileSync(new URL("./vaste-invoer/miele-was-droog-vries.json", import.meta.url), "utf8"));
const BASIS = "/domotiapp_lovelace/afbeeldingen/";

/**
 * Een `hass` zoals de frontend hem heeft: zonder uitgeschakelde entiteiten
 * (die staan niet in `hass.entities`), of met de knoppen aan, zoals bij de
 * klant na de beheersessie.
 */
function hassUitDump({ knoppenAan = false, over = {} } = {}) {
  const entities = {};
  for (const [id, e] of Object.entries(DUMP.entities)) {
    if (e.disabled_by && !(knoppenAan && id.startsWith("button."))) continue;
    entities[id] = e;
  }
  const states = structuredClone(DUMP.states);
  if (knoppenAan) {
    for (const id of Object.keys(entities)) {
      if (id.startsWith("button.")) states[id] = { entity_id: id, state: "unavailable", attributes: {} };
    }
  }
  for (const [id, state] of Object.entries(over)) states[id] = { ...states[id], entity_id: id, state };
  return { devices: DUMP.devices, entities, states };
}

const st = (hass, id) => hass.states[id] ?? null;
const apparaatVan = (hass, id) => hass.devices[hass.entities[id].device_id];

describe("REGRESSIEWACHT: de dump van Miele", () => {
  it("zet de soort in model en het type in model_id", () => {
    const h = hassUitDump();
    assert.deepEqual(
      ["sensor.wasmachine", "sensor.wasdroger", "sensor.vriezer"].map((id) => {
        const a = apparaatVan(h, id);
        return [a.manufacturer, a.model, a.model_id];
      }),
      [
        ["Miele", "Washing machine", "WWI880"],
        ["Miele", "Tumble dryer", "TWH780WP"],
        ["Miele", "Freezer", "FNS 7710 E"],
      ]
    );
  });

  it("heeft een statussensor met vaste sleutels, en de wasmachine staat uit", () => {
    const s = DUMP.states["sensor.wasmachine"];
    assert.equal(s.state, "off");
    assert.ok(s.attributes.options.includes("in_use"));
    assert.ok(s.attributes.options.includes("program_ended"));
  });
});

describe("NIEUW GEDRAG: de status van Miele", () => {
  const S = (state) => ({ state, attributes: { options: DUMP.states["sensor.wasmachine"].attributes.options } });

  it("leest on als Aan en niet als draaien", () => {
    assert.deepEqual(V.statusDuiding(S("on")), { soort: V.SOORT.KLAAR, woord: "Aan" });
    assert.equal(V.draait(S("on")), false);
    assert.equal(V.toestand({ status: S("on") }).tekst, "Aan");
  });

  it("kent elke stand van een wasmachine", () => {
    const soort = (s) => V.statusDuiding(S(s)).soort;
    assert.equal(soort("off"), V.SOORT.UIT);
    assert.equal(soort("programmed"), V.SOORT.KLAAR);
    assert.equal(soort("waiting_to_start"), V.SOORT.UITGESTELD);
    assert.equal(soort("in_use"), V.SOORT.DRAAIT);
    assert.equal(soort("pause"), V.SOORT.PAUZE);
    assert.equal(soort("rinse_hold"), V.SOORT.PAUZE);
    assert.equal(soort("program_ended"), V.SOORT.AF);
    assert.equal(soort("failure"), V.SOORT.FOUT);
    assert.equal(soort("program_interrupted"), V.SOORT.FOUT);
    assert.equal(soort("not_connected"), V.SOORT.ONBEKEND);
    assert.equal(soort("unavailable"), V.SOORT.ONBEKEND);
  });

  it("zegt het in woorden op de kaart", () => {
    assert.equal(V.toestand({ status: S("off") }).tekst, "Uit");
    assert.equal(V.toestand({ status: S("programmed") }).tekst, "Klaar om te starten");
    assert.equal(V.toestand({ status: S("in_use"), rest: 72 }).tekst, "Draait · nog 1 u 12 min");
    assert.equal(V.toestand({ status: S("rinse_hold") }).tekst, "Spoelstop");
    assert.equal(V.toestand({ status: S("program_interrupted") }).tekst, "Programma onderbroken");
    assert.equal(V.toestand({ status: S("program_ended") }).tekst, "Programma klaar");
  });

  it("noemt de deur van een wasmachine een deur", () => {
    const deur = { state: "on" };
    assert.equal(V.toestand({ status: S("off"), deur, deurWoord: "Deur" }).tekst, "Deur open");
    assert.equal(V.toestand({ status: S("pause"), deur, deurWoord: "Deur" }).waarschuwing, "Deur open");
  });

  it("REGRESSIEWACHT: zonder Miele-opties is on nog steeds draaien, en een vaatwasser heeft een klep", () => {
    assert.equal(V.draait({ state: "on" }), true);
    assert.equal(V.toestand({ status: { state: "Ready" }, deur: { state: "on" } }).tekst, "Klep open");
  });
});

describe("NIEUW GEDRAG: de rest van het apparaat bij de statussensor", () => {
  it("vindt bij de wasmachine tijden, programma, fase, TwinDos en verbruik", () => {
    const r = P.apparaatRollen(hassUitDump(), "sensor.wasmachine");
    assert.deepEqual(r, {
      status: "sensor.wasmachine",
      rest: "sensor.wasmachine_resterende_tijd",
      verstreken: "sensor.wasmachine_verstreken_tijd",
      eind: "sensor.wasmachine_eindtijd",
      startOm: "sensor.wasmachine_starttijd",
      startIn: "sensor.wasmachine_start_in",
      programma: "sensor.wasmachine_programma",
      fase: "sensor.wasmachine_programmafase",
      twinDos1: "sensor.wasmachine_twindos_1_niveau",
      twinDos2: "sensor.wasmachine_twindos_2_niveau",
      energie: "sensor.wasmachine_energieverbruik",
      energieVerwacht: "sensor.wasmachine_energieverbruik_voorspelling",
      water: "sensor.wasmachine_waterverbruik",
      waterVerwacht: "sensor.wasmachine_waterverbruik_voorspelling",
    });
  });

  it("vindt de knoppen pas als ze aan staan, met de knop start en niet de sensor start", () => {
    const r = P.apparaatRollen(hassUitDump({ knoppenAan: true }), "sensor.wasmachine");
    assert.equal(r.start, "button.wasmachine_starten");
    assert.equal(r.pauze, "button.wasmachine_pauzeren");
    assert.equal(r.stop, "button.wasmachine_stoppen");
    assert.equal(r.startOm, "sensor.wasmachine_starttijd");
  });

  it("vindt bij de droger geen water, geen TwinDos en geen droogtegraad", () => {
    const r = P.apparaatRollen(hassUitDump(), "sensor.wasdroger");
    assert.equal(r.programma, "sensor.wasdroger_programma");
    assert.equal(r.water, undefined);
    assert.equal(r.twinDos1, undefined);
    assert.ok(!Object.values(r).includes("sensor.wasdroger_droogtegraad"));
  });

  it("neemt niets van een ander apparaat, en niets zonder apparaat", () => {
    const r = P.apparaatRollen(hassUitDump(), "sensor.wasmachine");
    assert.ok(Object.values(r).every((id) => id.includes("wasmachine")));
    assert.deepEqual(P.apparaatRollen(hassUitDump(), "sensor.bestaat_niet"), {});
  });

  it("vult de lege velden, en een ingevuld veld gaat voor", () => {
    const r = P.apparaatRollen(hassUitDump({ knoppenAan: true }), "sensor.wasmachine");
    const c = P.metApparaatVelden({ status: "sensor.wasmachine", stop: "script.eigen_stop" }, r);
    assert.equal(c.remaining, "sensor.wasmachine_resterende_tijd");
    assert.equal(c.start, "button.wasmachine_starten");
    assert.equal(c.pause, "button.wasmachine_pauzeren");
    assert.equal(c.stop, "script.eigen_stop");
    assert.equal(c.planned_start, "sensor.wasmachine_starttijd");
    assert.deepEqual(P.veldenVanApparaat(r).sort(), ["pause", "planned_start", "progress", "remaining", "start", "stop"]);
  });

  it("haalt die velden uit de editor", () => {
    const r = P.apparaatRollen(hassUitDump({ knoppenAan: true }), "sensor.wasmachine");
    const v = V.editorVelden({ coach: false, entiteiten: {}, apparaat: P.veldenVanApparaat(r) });
    assert.deepEqual(v.zichtbaar, ["status", "program", "door", "smart"]);
  });
});

describe("NIEUW GEDRAG: wat er op de kaart staat", () => {
  it("toont een knop alleen als hij te drukken is", () => {
    const h = hassUitDump({ knoppenAan: true });
    assert.equal(P.knopKan(st(h, "button.wasmachine_starten")), false);
    assert.equal(P.knopKan({ state: "unknown" }), true);
    assert.equal(P.knopKan(null), false);
  });

  it("zegt niets over programma en fase als de machine uit staat", () => {
    const h = hassUitDump();
    assert.equal(st(h, "sensor.wasmachine_programma").state, "no_program");
    assert.equal(P.programmaRegel(st(h, "sensor.wasmachine_programma"), st(h, "sensor.wasmachine_programmafase")), "");
  });

  it("toont programma en fase in de woorden van Home Assistant", () => {
    const h = hassUitDump({ over: { "sensor.wasmachine_programma": "cottons", "sensor.wasmachine_programmafase": "main_wash" } });
    const nl = { cottons: "Katoen", main_wash: "Wassen" };
    const fmt = (s) => nl[s.state] ?? s.state;
    assert.equal(P.programmaRegel(st(h, "sensor.wasmachine_programma"), st(h, "sensor.wasmachine_programmafase"), fmt), "Katoen · Wassen");
    // Zonder vertaling leesbaar, en niet weggelaten.
    assert.equal(P.programmaRegel(st(h, "sensor.wasmachine_programma"), st(h, "sensor.wasmachine_programmafase")), "Cottons · Main wash");
  });

  it("toont TwinDos zoals in de dump", () => {
    const h = hassUitDump();
    assert.equal(P.twinDosTekst(st(h, "sensor.wasmachine_twindos_1_niveau"), st(h, "sensor.wasmachine_twindos_2_niveau")), "TwinDos 95% · 100%");
    assert.equal(P.twinDosTekst(null, null), "");
  });

  it("toont het verbruik alleen met een waarde: uit staat er niets", () => {
    const h = hassUitDump();
    const v = (h2) =>
      P.verbruikTekst({
        energie: st(h2, "sensor.wasmachine_energieverbruik"),
        energieVerwacht: st(h2, "sensor.wasmachine_energieverbruik_voorspelling"),
        water: st(h2, "sensor.wasmachine_waterverbruik"),
        waterVerwacht: st(h2, "sensor.wasmachine_waterverbruik_voorspelling"),
      });
    assert.equal(v(h), "");
    const loopt = hassUitDump({
      over: {
        "sensor.wasmachine_energieverbruik": "0.94",
        "sensor.wasmachine_energieverbruik_voorspelling": "60",
        "sensor.wasmachine_waterverbruik": "48.2",
        "sensor.wasmachine_waterverbruik_voorspelling": "70",
      },
    });
    assert.equal(v(loopt), "Energie 0,9 kWh (verwachting 60%) · Water 48 L (verwachting 70%)");
    const alleenVerwacht = hassUitDump({ over: { "sensor.wasmachine_energieverbruik_voorspelling": "60" } });
    assert.equal(v(alleenVerwacht), "Energieverwachting 60%");
  });

  it("rekent de voortgang uit verstreken en resterende tijd", () => {
    assert.equal(P.voortgangUitTijden(30, 90), 25);
    assert.equal(P.voortgangUitTijden(null, 90), null);
    assert.equal(P.voortgangUitTijden(0, 0), null);
  });

  it("leest Start in als een moment, in uren", () => {
    const nu = new Date(2026, 9, 15, 22, 0);
    const d = P.startUitDuur({ state: "3", attributes: { unit_of_measurement: "h" } }, nu);
    assert.equal(+d - +nu, 3 * 3_600_000);
    assert.equal(P.startUitDuur({ state: "0", attributes: { unit_of_measurement: "h" } }, nu), null);
    assert.equal(P.startUitDuur({ state: "unknown", attributes: {} }, nu), null);
  });

  it("kent de soort aan het apparaat: geen vaatwasser op een wasmachine", () => {
    const h = hassUitDump();
    assert.equal(P.apparaatSoort(apparaatVan(h, "sensor.wasmachine")), "wasmachine");
    assert.equal(P.apparaatSoort(apparaatVan(h, "sensor.wasdroger")), "droger");
    assert.equal(P.apparaatSoort(null), "vaatwasser");
    assert.equal(P.SOORTEN.wasmachine.deur, "Deur");
    assert.equal(P.SOORTEN.vaatwasser.icoon, "dishwasher");
  });
});

describe("NIEUW GEDRAG: merk, type en foto van Miele", () => {
  it("herkent het type aan model_id", () => {
    const h = hassUitDump();
    assert.deepEqual(typeBijApparaat(apparaatVan(h, "sensor.wasmachine"), P.PROGRAMMA_APPARATEN), { merk: "miele", model: "wwi880" });
    assert.deepEqual(typeBijApparaat(apparaatVan(h, "sensor.wasdroger"), P.PROGRAMMA_APPARATEN), { merk: "miele", model: "twh780wp" });
  });

  it("toont bij Automatisch de foto van dat type", () => {
    const h = hassUitDump();
    assert.equal(productAfbeelding({ merk: "auto" }, apparaatVan(h, "sensor.wasmachine"), P.PROGRAMMA_APPARATEN), `${BASIS}wasmachines/miele-wwi880.webp`);
    assert.equal(productAfbeelding({}, apparaatVan(h, "sensor.wasdroger"), P.PROGRAMMA_APPARATEN), `${BASIS}wasdrogers/miele-twh780wp.webp`);
  });

  it("REGRESSIEWACHT: een vaatwasser van een ander merk krijgt geen foto", () => {
    assert.equal(productAfbeelding({ merk: "auto" }, { manufacturer: "Bosch", model: "SMV6ZCX49E" }, P.PROGRAMMA_APPARATEN), "");
  });
});
