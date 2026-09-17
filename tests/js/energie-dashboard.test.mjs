/**
 * Het energiedashboard van Home Assistant uitlezen.
 *
 * NIEUW GEDRAG (17 september 2026). `src/cards/energie-dashboard.js` bestond
 * niet vóór deze ronde; op de code van ervoor faalt dit bestand met
 * ERR_MODULE_NOT_FOUND.
 *
 * ## Waarom dit stuk los staat en zonder browser getoetst wordt
 *
 * Het is optelwerk over tijdvakken, en dat gaat stilletjes fout. Een staaf die
 * in het verkeerde uur valt, een teruglevering die van het verbruik wordt
 * afgetrokken in plaats van apart geteld, een meter die is teruggezet: geen van
 * die gevallen geeft een fout. Je krijgt een grafiek die er prima uitziet en
 * die niet klopt.
 *
 * ## De vorm van de gegevens
 *
 * Gemeten tegen HA 2026.8.1, en dat is niet dezelfde vorm als overal
 * gedocumenteerd staat: **`flow_from` en `flow_to` bestaan daar niet meer.**
 * Een grid-aansluiting draagt `stat_energy_from` en `stat_energy_to` zelf. De
 * oude vorm wordt nog wel gelezen, want een opslag die niet is omgezet heeft
 * hem -- en daar staat hieronder een test op.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  bronnenUit,
  heeftBronnen,
  kosten,
  samenvatting,
  staafLabel,
  statistiekIds,
  staven,
  totaalVoor,
  totalen,
  toonGeld,
  toonWaarde,
  vastePrijzen,
  venster,
  vensterNaam,
  vulAan,
} from "../../src/cards/energie-dashboard.js";

/* De vorm die HA 2026.8.1 teruggeeft op energy/get_prefs. */
const PREFS_NIEUW = {
  energy_sources: [
    {
      type: "grid",
      stat_energy_from: "sensor.net_in",
      stat_energy_to: "sensor.net_uit",
      number_energy_price: 0.28,
      cost_adjustment_day: 0,
      name: "Aansluiting",
    },
    { type: "solar", stat_energy_from: "sensor.zon", config_entry_solar_forecast: null },
    { type: "battery", stat_energy_from: "sensor.accu_uit", stat_energy_to: "sensor.accu_in" },
    { type: "gas", stat_energy_from: "sensor.gas", number_energy_price: 1.45 },
    { type: "water", stat_energy_from: "sensor.water", number_energy_price: 1.2 },
  ],
  device_consumption: [
    { stat_consumption: "sensor.wasmachine", name: "Wasmachine" },
    { stat_consumption: "sensor.vaatwasser" },
  ],
};

/* De vorm van vóór 2026.8, die een niet-omgezette opslag nog heeft. */
const PREFS_OUD = {
  energy_sources: [
    {
      type: "grid",
      flow_from: [{ stat_energy_from: "sensor.net_in", number_energy_price: 0.3 }],
      flow_to: [{ stat_energy_to: "sensor.net_uit" }],
      cost_adjustment_day: 0,
    },
  ],
  device_consumption: [],
};

describe("bronnenUit", () => {
  it("leest de vorm van 2026.8", () => {
    const b = bronnenUit(PREFS_NIEUW);
    const paren = b.map((x) => `${x.rol}:${x.statistiek}`);
    assert.deepEqual(paren, [
      "verbruik:sensor.net_in",
      "teruglevering:sensor.net_uit",
      "zon:sensor.zon",
      "accu_uit:sensor.accu_uit",
      "accu_in:sensor.accu_in",
      "gas:sensor.gas",
      "water:sensor.water",
      "apparaat:sensor.wasmachine",
      "apparaat:sensor.vaatwasser",
    ]);
  });

  it("leest ook de OUDE vorm met flow_from en flow_to", () => {
    // Een klant die nog niet is overgestapt; zijn opslag heeft die vorm nog.
    const b = bronnenUit(PREFS_OUD);
    assert.deepEqual(b.map((x) => `${x.rol}:${x.statistiek}`), [
      "verbruik:sensor.net_in",
      "teruglevering:sensor.net_uit",
    ]);
  });

  it("neemt de naam over die de klant zelf gaf", () => {
    const b = bronnenUit(PREFS_NIEUW);
    assert.equal(b.find((x) => x.rol === "verbruik").naam, "Aansluiting");
    assert.equal(b.find((x) => x.rol === "teruglevering").naam, "Aansluiting terug");
    assert.equal(b.find((x) => x.statistiek === "sensor.wasmachine").naam, "Wasmachine");
  });

  it("valt terug op de rolnaam als er geen eigen naam is", () => {
    const b = bronnenUit(PREFS_NIEUW);
    assert.equal(b.find((x) => x.rol === "zon").naam, "Zonnepanelen");
    // Een apparaat zonder naam houdt zijn statistiek-id: beter dan "Apparaat"
    // als er er drie zijn.
    assert.equal(b.find((x) => x.statistiek === "sensor.vaatwasser").naam, "sensor.vaatwasser");
  });

  it("slaat lege en ontbrekende statistieken over", () => {
    const b = bronnenUit({
      energy_sources: [
        { type: "grid", stat_energy_from: "sensor.a", stat_energy_to: null, cost_adjustment_day: 0 },
        { type: "solar", stat_energy_from: "" },
        { type: "onbekend", stat_energy_from: "sensor.x" },
      ],
      device_consumption: [{ stat_consumption: null }],
    });
    assert.deepEqual(b.map((x) => x.statistiek), ["sensor.a"]);
  });

  it("valt niet om op niets", () => {
    assert.deepEqual(bronnenUit(null), []);
    assert.deepEqual(bronnenUit({}), []);
    assert.deepEqual(bronnenUit({ energy_sources: null }), []);
  });

  it("vraagt elke statistiek maar één keer op", () => {
    const ids = statistiekIds(bronnenUit(PREFS_NIEUW));
    assert.equal(ids.length, new Set(ids).size);
    assert.equal(ids.length, 9);
  });

  it("weet of er iets te tonen is", () => {
    assert.equal(heeftBronnen(bronnenUit(PREFS_NIEUW)), true);
    // Alleen apparaten is geen energiedashboard om een overzicht van te maken.
    assert.equal(
      heeftBronnen(bronnenUit({ energy_sources: [], device_consumption: [{ stat_consumption: "sensor.a" }] })),
      false,
    );
  });
});

describe("venster", () => {
  const nu = new Date(2026, 8, 17, 14, 30); // donderdag 17 september 2026

  it("een dag loopt van middernacht tot middernacht", () => {
    const v = venster("dag", 0, nu);
    assert.equal(v.van.getDate(), 17);
    assert.equal(v.van.getHours(), 0);
    assert.equal(v.tot.getDate(), 18);
    assert.equal(v.periode, "hour");
  });

  it("de week begint op maandag", () => {
    const v = venster("week", 0, nu);
    assert.equal(v.van.getDay(), 1, "maandag");
    assert.equal(v.van.getDate(), 14);
    assert.equal(v.tot.getDate(), 21);
  });

  it("een maand loopt van de eerste tot de eerste", () => {
    const v = venster("maand", 0, nu);
    assert.equal(v.van.getDate(), 1);
    assert.equal(v.van.getMonth(), 8);
    assert.equal(v.tot.getMonth(), 9);
  });

  it("een jaar loopt van 1 januari tot 1 januari", () => {
    const v = venster("jaar", 0, nu);
    assert.equal(v.van.getFullYear(), 2026);
    assert.equal(v.van.getMonth(), 0);
    assert.equal(v.tot.getFullYear(), 2027);
    assert.equal(v.periode, "month");
  });

  it("gaat terug in de tijd", () => {
    assert.equal(venster("dag", -1, nu).van.getDate(), 16);
    assert.equal(venster("week", -1, nu).van.getDate(), 7);
    assert.equal(venster("maand", -1, nu).van.getMonth(), 7);
    assert.equal(venster("jaar", -1, nu).van.getFullYear(), 2025);
  });

  it("loopt over een maandgrens heen", () => {
    const begin = new Date(2026, 8, 2, 9, 0); // woensdag 2 september
    const v = venster("week", 0, begin);
    assert.equal(v.van.getMonth(), 7, "augustus");
    assert.equal(v.van.getDate(), 31);
  });

  it("loopt TOT het einde van de periode en niet tot nu", () => {
    // Anders krimpt de grafiek van vandaag gedurende de dag, en lijkt het alsof
    // er minder verbruikt is dan gisteren terwijl de dag nog niet om is.
    const v = venster("dag", 0, nu);
    assert.ok(v.tot > nu);
  });
});

describe("vensterNaam", () => {
  const nu = new Date(2026, 8, 17, 14, 30);

  it("zegt vandaag en gisteren", () => {
    assert.equal(vensterNaam("dag", 0, nu), "Vandaag");
    assert.equal(vensterNaam("dag", -1, nu), "Gisteren");
    assert.equal(vensterNaam("dag", -3, nu), "14 september");
  });

  it("zegt deze en vorige week", () => {
    assert.equal(vensterNaam("week", 0, nu), "Deze week");
    assert.equal(vensterNaam("week", -1, nu), "Vorige week");
    assert.match(vensterNaam("week", -2, nu), /sep/);
  });

  it("noemt de maand, met het jaar erbij als het een ander jaar is", () => {
    assert.equal(vensterNaam("maand", 0, nu), "Deze maand");
    assert.equal(vensterNaam("maand", -1, nu), "augustus");
    assert.equal(vensterNaam("maand", -9, nu), "december 2025");
  });

  it("noemt het jaar", () => {
    assert.equal(vensterNaam("jaar", 0, nu), "Dit jaar");
    assert.equal(vensterNaam("jaar", -1, nu), "2025");
  });
});

/* Twee uur aan statistieken, zoals de recorder ze teruggeeft. */
const U = (n) => new Date(2026, 8, 17, n).getTime();
const STATS = {
  "sensor.net_in": [
    { start: U(10), end: U(11), sum: 100, state: 100, change: 2 },
    { start: U(11), end: U(12), sum: 103, state: 103, change: 3 },
  ],
  "sensor.net_uit": [
    { start: U(10), end: U(11), sum: 50, state: 50, change: 1.5 },
    { start: U(11), end: U(12), sum: 50.5, state: 50.5, change: 0.5 },
  ],
  "sensor.zon": [
    { start: U(10), end: U(11), sum: 200, state: 200, change: 4 },
    { start: U(11), end: U(12), sum: 206, state: 206, change: 6 },
  ],
  "sensor.accu_uit": [{ start: U(11), end: U(12), sum: 10, state: 10, change: 1 }],
  "sensor.accu_in": [{ start: U(10), end: U(11), sum: 8, state: 8, change: 2 }],
  "sensor.gas": [{ start: U(10), end: U(11), sum: 300, state: 300, change: 0.4 }],
  "sensor.water": [],
  "sensor.wasmachine": [{ start: U(11), end: U(12), sum: 5, state: 5, change: 0.8 }],
  "sensor.vaatwasser": [],
};

describe("totalen", () => {
  const bronnen = bronnenUit(PREFS_NIEUW);

  it("telt `change` op en niet het verschil tussen de sums", () => {
    // sum is de meterstand sinds het begin der tijden; change is wat er in dit
    // uur doorheen ging.
    assert.equal(totalen(bronnen, STATS)["sensor.net_in"], 5);
    assert.equal(totalen(bronnen, STATS)["sensor.zon"], 10);
  });

  it("geeft 0 voor een bron zonder rijen", () => {
    assert.equal(totalen(bronnen, STATS)["sensor.water"], 0);
    assert.equal(totalen(bronnen, {})["sensor.net_in"], 0);
  });

  it("laat een teruggezette meter geen negatief totaal geven", () => {
    // Een nieuwe omvormer of een sensor die opnieuw begint: change kan dan één
    // keer negatief zijn. Een grafiek met -4000 kWh erin is onbruikbaar.
    const kapot = { "sensor.zon": [{ start: U(10), change: -4000 }, { start: U(11), change: 3 }] };
    assert.equal(totalen(bronnen, kapot)["sensor.zon"], 0);
  });

  it("telt meerdere bronnen met dezelfde rol bij elkaar op", () => {
    const twee = bronnenUit({
      energy_sources: [
        { type: "solar", stat_energy_from: "sensor.zon" },
        { type: "solar", stat_energy_from: "sensor.zon2" },
      ],
      device_consumption: [],
    });
    const s = { "sensor.zon": [{ start: U(10), change: 4 }], "sensor.zon2": [{ start: U(10), change: 6 }] };
    assert.equal(totaalVoor(twee, s, "zon"), 10);
  });
});

describe("samenvatting", () => {
  const bronnen = bronnenUit(PREFS_NIEUW);
  const s = samenvatting(bronnen, STATS);

  it("houdt verbruik en teruglevering uit elkaar", () => {
    assert.equal(s.netIn, 5);
    assert.equal(s.netUit, 2);
  });

  it("rekent eigen verbruik uit als opwek min teruglevering", () => {
    assert.equal(s.zon, 10);
    assert.equal(s.eigen, 8);
  });

  it("telt het totale verbruik op uit net, accu en eigen zon", () => {
    // 5 van het net + 1 uit de accu + 8 eigen zon
    assert.equal(s.verbruikt, 14);
  });

  it("laat eigen verbruik nooit negatief worden", () => {
    // Bij een thuisaccu kan de teruglevering in een uur groter zijn dan de
    // opwek in datzelfde uur.
    const raar = { ...STATS, "sensor.net_uit": [{ start: U(10), change: 99 }] };
    assert.equal(samenvatting(bronnen, raar).eigen, 0);
  });

  it("rekent uit hoeveel er niet van het net kwam", () => {
    // (8 eigen + 1 accu) / 14 = 64%
    assert.equal(s.zelfvoorzienend, 64);
  });

  it("zegt niets in plaats van 0 als er geen verbruik is", () => {
    const leeg = samenvatting(bronnen, {});
    assert.equal(leeg.verbruikt, 0);
    assert.equal(leeg.zelfvoorzienend, null);
  });

  it("houdt gas en water apart van de stroom", () => {
    assert.equal(s.gas, 0.4);
    assert.equal(s.water, 0);
  });
});

describe("staven", () => {
  const bronnen = bronnenUit(PREFS_NIEUW);
  const v = { van: U(9), tot: U(13) };

  it("maakt één staaf per tijdvak, op volgorde", () => {
    // Het venster loopt van 9 tot 13 uur, dus vier staven -- ook de twee
    // waarin niets gemeten is (zie vulAan).
    const st = staven(bronnen, STATS, v);
    assert.equal(st.length, 4);
    assert.ok(st.every((r, i) => i === 0 || r.start > st[i - 1].start), "op volgorde");
  });

  it("zet per staaf de rollen uit elkaar", () => {
    const st = staven(bronnen, STATS, v);
    const bij = (uur) => st.find((r) => r.start === U(uur));
    assert.equal(bij(10).rollen.verbruik, 2);
    assert.equal(bij(10).rollen.zon, 4);
    assert.equal(bij(10).rollen.teruglevering, 1.5);
    assert.equal(bij(11).rollen.accu_uit, 1);
    // En de uren zonder meting staan er leeg bij, niet als gat.
    assert.deepEqual(bij(9).rollen, {});
  });

  it("laat rijen buiten het venster liggen", () => {
    // Anders lopen de laatste uren van gisteren in de grafiek van vandaag.
    const st = staven(bronnen, STATS, { van: U(11), tot: U(12) });
    assert.equal(st.length, 1);
    assert.equal(st[0].rollen.verbruik, 3);
    // Het uur ervoor (change 2) hoort er niet bij te staan.
    assert.ok(!st.some((r) => r.rollen.verbruik === 2));
  });

  it("vult het venster aan met lege tijdvakken", () => {
    // Zonder dit is een dag om 01:00 twee staven van een half scherm breed, en
    // versmalt elke staaf gedurende de dag doordat er steeds meer bijkomen.
    const dag = { van: new Date(2026, 8, 17).getTime(), tot: new Date(2026, 8, 18).getTime() };
    const st = staven(bronnen, STATS, dag);
    assert.equal(st.length, 24, "een dag heeft 24 uur, ook de uren die nog moeten komen");
    assert.equal(st[0].start, dag.van);
    // De twee uren met gegevens staan op hun eigen plek.
    assert.equal(st[10].rollen.verbruik, 2);
    assert.equal(st[11].rollen.verbruik, 3);
    // En de rest is leeg, niet weg.
    assert.deepEqual(st[0].rollen, {});
  });

  it("geeft nog steeds iets terug als er niets gemeten is", () => {
    const dag = { van: new Date(2026, 8, 17).getTime(), tot: new Date(2026, 8, 18).getTime() };
    // Een dag zonder enige meting is 24 lege staven en geen lege grafiek: dan
    // zie je dat er niets verbruikt is in plaats van dat er niets geladen is.
    assert.equal(staven(bronnen, {}, dag).length, 24);
  });
});

describe("vulAan", () => {
  const van = new Date(2026, 8, 17).getTime();
  const tot = new Date(2026, 8, 18).getTime();

  it("vult een dag met 24 uur", () => {
    const rijen = [
      { start: van + 10 * 3600000, rollen: { verbruik: 1 } },
      { start: van + 11 * 3600000, rollen: { verbruik: 2 } },
    ];
    assert.equal(vulAan(rijen, { van, tot, periode: "hour" }).length, 24);
  });

  it("laat de gevonden waarden staan", () => {
    const rijen = [{ start: van + 5 * 3600000, rollen: { zon: 7 } }];
    const uit = vulAan(rijen, { van, tot, periode: "hour" });
    assert.equal(uit.find((r) => r.start === van + 5 * 3600000).rollen.zon, 7);
  });

  it("gooit niets weg dat buiten het raster valt", () => {
    // Een nacht waarin de klok verzet wordt geeft een tijdvak dat niet op het
    // uurraster valt. Liever een staaf te veel dan een meting die verdwijnt.
    const rijen = [
      { start: van, rollen: { verbruik: 1 } },
      { start: van + 3600000, rollen: { verbruik: 1 } },
      { start: van + 90 * 60000, rollen: { verbruik: 9 } },
    ];
    const uit = vulAan(rijen, { van, tot, periode: "hour" });
    assert.ok(uit.some((r) => r.start === van + 90 * 60000));
    assert.ok(uit.every((r, i) => i === 0 || r.start >= uit[i - 1].start), "op volgorde");
  });

  it("rekent maanden op de KALENDER en niet in milliseconden", () => {
    // De eerste versie leidde de stap af uit de gevonden rijen: het kleinste
    // gat. Februari is de kortste maand, dus die stap werd 28 dagen, en daar
    // passen er 13,04 in een jaar -- gemeten op de testinstance: veertien
    // staven op een jaar.
    const jaar = {
      van: new Date(2026, 0, 1).getTime(),
      tot: new Date(2027, 0, 1).getTime(),
      periode: "month",
    };
    const uit = vulAan([{ start: jaar.van, rollen: { verbruik: 3 } }], jaar);
    assert.equal(uit.length, 12);
    assert.equal(new Date(uit[11].start).getMonth(), 11, "december");
  });

  it("vult een maand met echte dagen, ook een schrikkelmaand", () => {
    const feb = {
      van: new Date(2028, 1, 1).getTime(),
      tot: new Date(2028, 2, 1).getTime(),
      periode: "day",
    };
    assert.equal(vulAan([], feb).length, 29);
  });

  it("stopt bij 400 staven in plaats van een muur te bouwen", () => {
    // Een jaar met uurstappen zou 8760 staven zijn; dan klopt de periode niet.
    const jaar = {
      van: new Date(2026, 0, 1).getTime(),
      tot: new Date(2027, 0, 1).getTime(),
      periode: "hour",
    };
    assert.equal(vulAan([], jaar).length, 400);
  });

  it("valt niet om op een onzinnig venster", () => {
    const rijen = [{ start: van, rollen: {} }];
    assert.equal(vulAan(rijen, {}).length, 1);
    assert.equal(vulAan(rijen, { van: tot, tot: van }).length, 1);
  });
});

describe("kosten", () => {
  const bronnen = bronnenUit(PREFS_NIEUW);

  it("gebruikt de vaste prijs uit de voorkeuren", () => {
    const prijzen = vastePrijzen(PREFS_NIEUW);
    assert.equal(prijzen["sensor.net_in"], 0.28);
    assert.equal(prijzen["sensor.gas"], 1.45);
    // 5 kWh * 0,28 + 0,4 m3 * 1,45 + water 0
    const k = kosten(bronnen, STATS, prijzen);
    assert.equal(k.bedrag, 1.98);
  });

  it("leest de prijs ook uit de oude flow_from-vorm", () => {
    assert.equal(vastePrijzen(PREFS_OUD)["sensor.net_in"], 0.3);
  });

  it("zegt dat het onvolledig is als een bron geen prijs heeft", () => {
    const k = kosten(bronnen, STATS, { "sensor.net_in": 0.28 });
    // Gas heeft verbruik maar geen prijs in dit rijtje.
    assert.equal(k.compleet, false);
  });

  it("noemt zich compleet als alles wat verbruikt is een prijs heeft", () => {
    const alleen = bronnenUit({
      energy_sources: [{ type: "grid", stat_energy_from: "sensor.net_in", cost_adjustment_day: 0, number_energy_price: 0.28 }],
      device_consumption: [],
    });
    assert.equal(kosten(alleen, STATS, { "sensor.net_in": 0.28 }).compleet, true);
  });

  it("rekent teruglevering niet als kosten", () => {
    // Die levert geld óp; dat apart uitrekenen vergt de compensatieprijs, en
    // die staat niet altijd ingevuld.
    const k = kosten(bronnen, STATS, { "sensor.net_uit": 9 });
    assert.equal(k.bedrag, 0);
  });
});

describe("weergave", () => {
  it("toont een hoeveelheid met zoveel cijfers als zinnig is", () => {
    assert.equal(toonWaarde(1234.5), "1.235 kWh");
    assert.equal(toonWaarde(12.345), "12,3 kWh");
    assert.equal(toonWaarde(1.234), "1,23 kWh");
    assert.equal(toonWaarde(0.4, "m³"), "0,40 m³");
  });

  it("toont een bedrag in euro's", () => {
    assert.match(toonGeld(1.98), /1,98/);
    assert.match(toonGeld(1.98), /€/);
  });

  it("zet het juiste label onder een staaf", () => {
    const d = new Date(2026, 8, 17, 14).getTime();
    assert.equal(staafLabel(d, "dag"), "14");
    assert.equal(staafLabel(d, "week"), "do");
    assert.equal(staafLabel(d, "maand"), "17");
    assert.equal(staafLabel(d, "jaar"), "sep");
  });
});
