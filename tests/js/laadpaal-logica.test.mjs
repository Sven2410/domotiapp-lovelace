/**
 * De laadpaalkaart met DomotiApp Coach: wat hij zegt, los van hoe hij eruitziet.
 *
 * NIEUW GEDRAG: `src/cards/laadpaal-logica.js` bestond niet vóór deze ronde.
 *
 * De attributen zijn die van contract 1 (coach v0.110.0), plus `soc_geschat` en
 * `actieradius_km`, die er op 11 oktober 2026 bij kwamen. De toestand van de
 * sensor is tekst die de kaart TOONT maar waar hij niets uit afleidt (valkuil
 * 67); de tests hieronder zetten er daarom telkens iets anders in dan de stand.
 *
 * Tijden staan in LOKALE tijd (`new Date(j, m, d, u, min)`), zodat de uitkomst
 * niet afhangt van de tijdzone van de machine die de test draait. Waar de
 * coach een ISO-tekst levert, wordt die uit zo'n lokale tijd gemaakt.
 *
 * De module wordt als geheel geïmporteerd: dan valt tegen de oude code elke
 * test op zijn eigen reden om.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as L from "../../src/cards/laadpaal-logica.js";

/** Zondag 11 oktober 2026, 20:00. */
const NU = new Date(2026, 9, 11, 20, 0);
const OM = (dag, u, m = 0) => new Date(2026, 9, dag, u, m);
const iso = (d) => d.toISOString();

const S = (state, attributes = {}) => ({ entity_id: "sensor.oprit_coach", state, attributes });

describe("NIEUW GEDRAG: wat de coach over de laadpaal zegt", () => {
  it("leest de stand uit de attributen en toont de tekst met een hoofdletter", () => {
    const st = S("laadt op zon", {
      stand: "laadt_zon",
      soc: 62.4,
      target_percent: 80,
      doel_beurt: true,
      modus: "zon",
      modus_beurt: true,
      pauze: false,
      expected_done: iso(OM(12, 6, 40)),
      kwh_needed: 18.2,
      brand: "easee",
      reason: "De zon levert genoeg.",
    });
    const s = L.laadpaalStand(st);
    assert.equal(s.stand, "laadt_zon");
    assert.equal(s.tekst, "Laadt op zon");
    assert.equal(s.soc, 62.4);
    assert.equal(s.doel, 80);
    assert.equal(s.doelBeurt, true);
    assert.equal(s.modus, "zon");
    assert.equal(s.modusBeurt, true);
    assert.equal(+s.klaarVerwacht, +OM(12, 6, 40));
    assert.equal(s.merk, "easee");
    assert.equal(s.reden, "De zon levert genoeg.");
  });

  it("beslist niets op de tekst: een andere tekst geeft dezelfde stand", () => {
    const a = L.laadpaalStand(S("wacht tot 20:00", { stand: "wacht" }));
    const b = L.laadpaalStand(S("even geduld", { stand: "wacht" }));
    assert.equal(a.stand, b.stand);
    assert.deepEqual(L.standVorm(a.stand), L.standVorm(b.stand));
  });

  it("valt zonder tekst terug op het woord van de stand", () => {
    assert.equal(L.laadpaalStand(S("unknown", { stand: "geen_auto" })).tekst, "Geen auto");
    assert.equal(L.laadpaalStand(S("", { stand: "vol" })).tekst, "Vol");
  });

  it("weet niets als de sensor er niet is of niet bereikbaar", () => {
    assert.equal(L.laadpaalStand(null), null);
    assert.equal(L.laadpaalStand(S("unavailable", { stand: "laadt" })), null);
  });

  it("neemt alleen echte booleans als ja, en een lege tekst niet als nul", () => {
    const s = L.laadpaalStand(S("x", { pauze: "true", soc: "", schema_aan: 1 }));
    assert.equal(s.pauze, false);
    assert.equal(s.soc, null);
    assert.equal(s.schemaAan, false);
  });

  it("geeft elke stand een icoon en een kleur, en rood en groen alleen aan status", () => {
    for (const [sleutel, vorm] of Object.entries(L.STANDEN)) {
      assert.ok(vorm.icoon, sleutel);
      if (vorm.tone === "good") assert.equal(sleutel, "vol");
      if (vorm.tone === "bad") assert.equal(sleutel, "storing");
    }
    assert.equal(L.standVorm("laadt_zon").tone, "solar");
    assert.equal(L.standVorm("iets_nieuws").tone, "neutral");
  });
});

describe("NIEUW GEDRAG: de accustand van de auto", () => {
  it("toont hele procenten, en ± als de coach hem schat", () => {
    assert.equal(L.socTekst(L.laadpaalStand(S("x", { soc: 62.4 }))), "62%");
    assert.equal(L.socTekst(L.laadpaalStand(S("x", { soc: 62.6, soc_geschat: true }))), "± 63%");
    assert.equal(L.socTekst(L.laadpaalStand(S("x", {}))), "");
  });

  it("leest de actieradius", () => {
    assert.equal(L.laadpaalStand(S("x", { actieradius_km: 287 })).actieradius, 287);
    assert.equal(L.laadpaalStand(S("x", { actieradius_km: null })).actieradius, null);
  });
});

describe("NIEUW GEDRAG: de knoppen voor de modus", () => {
  const select = (state, options = ["planning", "snel", "continu", "zon"]) => ({
    entity_id: "select.oprit_modus",
    state,
    attributes: { options },
  });

  it("zet de drie knoppen neer en wijst aan welke aan staat (Planning is sinds 0.59.1 geen knop)", () => {
    const k = L.modusKnoppen(select("zon"));
    assert.deepEqual(k.map((x) => x.sleutel), ["snel", "continu", "zon"]);
    assert.deepEqual(k.map((x) => x.aan), [false, false, true]);
  });

  it("laat een stand weg die de select niet aanbiedt", () => {
    assert.deepEqual(
      L.modusKnoppen(select("snel", ["planning", "snel"])).map((x) => x.sleutel),
      ["snel"]
    );
  });

  it("geeft geen knoppen zonder select of als hij niet bereikbaar is", () => {
    assert.deepEqual(L.modusKnoppen(null), []);
    assert.deepEqual(L.modusKnoppen(select("unavailable")), []);
  });
});

describe("NIEUW GEDRAG: het laadplan als balk", () => {
  const blok = (van, tot, extra = {}) => ({
    start: iso(van),
    end: iso(tot),
    charging: true,
    kw: 7.4,
    kwh: 7.4,
    solar_kwh: 0,
    price: 0.21,
    why: "goedkoop",
    ...extra,
  });

  it("begint bij nu en laat wat voorbij is weg", () => {
    const b = L.planBalk(
      [blok(OM(11, 17), OM(11, 18)), blok(OM(11, 19, 30), OM(11, 20, 30)), blok(OM(12, 2), OM(12, 4))],
      NU
    );
    assert.equal(+b.van, +NU);
    assert.equal(b.blokken.length, 2);
    // Het lopende blok begint bij nu.
    assert.equal(b.blokken[0].links, 0);
  });

  it("is minstens zes uur breed, en loopt tot het eind van het plan", () => {
    const kort = L.planBalk([blok(OM(11, 20, 30), OM(11, 21))], NU);
    assert.equal(+kort.tot, +OM(12, 2));
    const lang = L.planBalk([blok(OM(12, 6), OM(12, 7, 30))], NU);
    assert.equal(+lang.tot, +OM(12, 7, 30));
  });

  it("is hooguit een etmaal breed", () => {
    const b = L.planBalk([blok(OM(13, 6), OM(13, 7))], NU);
    assert.equal(+b.tot, +OM(12, 20));
    assert.equal(b.blokken.length, 0);
  });

  it("rekent de plek van een blok in procenten van de balk", () => {
    // Venster 20:00 - 02:00 (zes uur): 23:00 - 00:30 is 50% tot 75%.
    const b = L.planBalk([blok(OM(11, 23), OM(12, 0, 30)), blok(OM(12, 1), OM(12, 2), { charging: false })], NU);
    assert.equal(b.blokken.length, 1);
    assert.equal(b.blokken[0].links, 50);
    assert.equal(b.blokken[0].breedte, 25);
  });

  it("kleurt een blok naar wat het meeste levert", () => {
    const b = L.planBalk(
      [blok(OM(11, 21), OM(11, 22), { kwh: 4, solar_kwh: 3 }), blok(OM(11, 22), OM(11, 23), { kwh: 4, solar_kwh: 1 })],
      NU
    );
    assert.deepEqual(b.blokken.map((x) => x.soort), ["zon", "net"]);
    assert.equal(b.blokken[0].zonDeel, 0.75);
  });

  it("zet 'nu' vooraan en hele uren eronder, zonder ze op elkaar te zetten", () => {
    const b = L.planBalk([blok(OM(12, 6), OM(12, 7, 30))], NU);
    assert.equal(b.tikken[0].tekst, "nu");
    for (const t of b.tikken.slice(1)) assert.match(t.tekst, /^\d{2}:00$/);
    assert.ok(b.tikken.length <= 6);
  });

  it("geeft niets als er geen plan is", () => {
    assert.equal(L.planBalk([], NU), null);
    assert.equal(L.planBalk([blok(OM(11, 10), OM(11, 11))], NU), null);
    assert.equal(L.planBalk(undefined, NU), null);
  });
});

describe("NIEUW GEDRAG: het weekschema, met maandag op plek 0", () => {
  it("vertaalt JavaScripts zondag-eerst naar de maandag-eerst van de coach", () => {
    assert.equal(L.vandaagIndex(new Date(2026, 9, 12)), 0); // maandag
    assert.equal(L.vandaagIndex(new Date(2026, 9, 11)), 6); // zondag
    assert.equal(L.vandaagIndex(new Date(2026, 9, 17)), 5); // zaterdag
  });

  it("zet zeven dagen neer en wijst vandaag aan", () => {
    const dagen = Array.from({ length: 7 }, (_, i) => ({ aan: i < 5, klaar_om: "07:30:00" }));
    const w = L.weekSchema(dagen, NU);
    assert.deepEqual(w.map((d) => d.dag), ["ma", "di", "wo", "do", "vr", "za", "zo"]);
    assert.deepEqual(w.map((d) => d.aan), [true, true, true, true, true, false, false]);
    assert.equal(w[0].klaarOm, "07:30");
    assert.deepEqual(w.map((d) => d.vandaag), [false, false, false, false, false, false, true]);
  });

  it("geeft niets bij een schema dat niet uit zeven dagen bestaat", () => {
    assert.deepEqual(L.weekSchema([{ aan: true }], NU), []);
    assert.deepEqual(L.weekSchema(null, NU), []);
  });
});

describe("NIEUW GEDRAG: de laadbeurt", () => {
  it("zegt bij een lopende beurt sinds wanneer, en wat het tot nu kostte", () => {
    const t = L.sessieTekst({ begin: iso(OM(11, 18, 2)), einde: null, kwh: 12.4, kosten: 2.1, zon_kwh: 8.1, soc_begin: 30 }, NU);
    assert.equal(t.kop, "Deze laadbeurt");
    assert.equal(t.tijd, "sinds 18:02");
    // Tussen € en het bedrag staat een harde spatie (U+00A0): zo breekt het
    // bedrag niet af aan het eind van een regel.
    assert.equal(t.tekst, "12,4 kWh · 8,1 kWh zon · €\u00a02,10 incl. zon");
  });

  it("noemt een afgelopen beurt de vorige, met begin en eind", () => {
    const t = L.sessieTekst({ begin: iso(OM(10, 18, 2)), einde: iso(OM(10, 22, 40)), kwh: 20, kosten: 4 }, NU);
    assert.equal(t.kop, "Vorige laadbeurt");
    assert.equal(t.tijd, "gisteren 18:02 – 22:40");
  });

  it("laat weg wat er niet is, in plaats van een nul", () => {
    const t = L.sessieTekst({ begin: iso(OM(11, 18)), einde: null, kwh: 3 }, NU);
    assert.equal(t.tekst, "3 kWh");
    assert.equal(L.sessieTekst(null, NU), null);
  });
});

describe("NIEUW GEDRAG: vermogen en de stapper", () => {
  const W = (state, unit = "W") => ({ state, attributes: { unit_of_measurement: unit } });

  it("schrijft het vermogen in kW, uit W of kW", () => {
    assert.equal(L.vermogenTekst(W("7400")), "7,4 kW");
    assert.equal(L.vermogenTekst(W("11", "kW")), "11 kW");
    assert.equal(L.vermogenTekst(W("0")), "");
    assert.equal(L.vermogenTekst(W("unavailable")), "");
  });

  it("stapt in de stap van de entiteit en blijft tussen min en max", () => {
    const n = (state) => ({ state, attributes: { min: 10, max: 100, step: 5 } });
    assert.equal(L.stapWaarde(n("80"), 1), 85);
    assert.equal(L.stapWaarde(n("80"), -1), 75);
    assert.equal(L.stapWaarde(n("100"), 1), null);
    assert.equal(L.stapWaarde(n("10"), -1), null);
    assert.equal(L.stapWaarde(n("unavailable"), 1), null);
  });
});

describe("NIEUW GEDRAG: de afbeelding van de paal", () => {
  const B = L.AFBEELDINGEN_BASIS;

  it("neemt het gekozen model", () => {
    assert.equal(L.laadpaalAfbeelding("alfen_eve_double_plus", { merk: "easee" }), `${B}laadpalen/alfen-eve-double-plus.webp`);
  });

  it("kiest zonder keuze de foto bij het merk van een coach van vóór 0.112.1 (alleen brand)", () => {
    assert.equal(L.laadpaalAfbeelding("", { merk: "easee" }), `${B}laadpalen/easee-charge-max-pro.webp`);
    assert.equal(L.laadpaalAfbeelding(undefined, { merk: "alfen" }), `${B}laadpalen/alfen-eve-single-plus.webp`);
    assert.equal(L.laadpaalAfbeelding("", { merk: "" }), "");
  });

  it("laat een eigen afbeelding voorgaan als er niets gekozen is", () => {
    assert.equal(L.laadpaalAfbeelding("", { merk: "easee" }, "/local/paal.jpg"), "/local/paal.jpg");
    assert.equal(L.laadpaalAfbeelding("eigen", { merk: "easee" }, "/local/paal.jpg"), "/local/paal.jpg");
    assert.equal(L.laadpaalAfbeelding("eigen", { merk: "easee" }, ""), "");
  });

  it("toont niets als dat gekozen is", () => {
    assert.equal(L.laadpaalAfbeelding("geen", { merk: "easee" }, "/local/paal.jpg"), "");
  });

  it("heeft voor elk model een pad onder laadpalen/", () => {
    for (const foto of Object.values(L.LAADPAAL_FOTOS)) assert.match(foto.pad, /^laadpalen\/[a-z0-9-]+\.webp$/);
  });
});

describe("NIEUW GEDRAG: de modus die echt geldt (coach 0.111.1)", () => {
  const select = (state) => ({ entity_id: "select.oprit_modus", state, attributes: { options: ["planning", "snel", "continu", "zon"] } });
  const stand = (extra) => L.laadpaalStand(S("x", { stand: "wacht", ...extra }));

  it("wijst de modus aan die de coach actief noemt, niet de voorkeur van de paal", () => {
    // Zijn situatie op 11 oktober 2026: de paal op zon, het schema aan.
    const k = L.modusKnoppen(select("zon"), stand({ modus: "zon", modus_actief: "planning", modus_keuzes: ["planning", "snel"], planning_nu: true }));
    assert.deepEqual(k.map((x) => x.sleutel + (x.aan ? "*" : "")), ["snel"]);
  });

  it("laat zonder planning alle drie zien", () => {
    const k = L.modusKnoppen(select("zon"), stand({ modus_actief: "zon", modus_keuzes: ["planning", "snel", "continu", "zon"], planning_nu: false }));
    assert.deepEqual(k.map((x) => x.sleutel + (x.aan ? "*" : "")), ["snel", "continu", "zon*"]);
  });

  it("volgt de select bij een coach die de nieuwe attributen nog niet heeft", () => {
    const k = L.modusKnoppen(select("zon"), stand({}));
    assert.deepEqual(k.map((x) => x.sleutel + (x.aan ? "*" : "")), ["snel", "continu", "zon*"]);
  });

  it("leest planning_nu als echte boolean", () => {
    assert.equal(stand({ planning_nu: true }).planningNu, true);
    assert.equal(stand({ planning_nu: "true" }).planningNu, false);
  });
});

describe("NIEUW GEDRAG: de kosten alleen van het net (coach 0.112.0)", () => {
  it("zet het bedrag uit het verslag vooraan, en dat met zon erachter", () => {
    const t = L.sessieTekst({ actief: true, kwh: 15, kosten: 3.59, kosten_net: 3.13, zon_kwh: 2.1 }, NU);
    assert.match(t.tekst, /^15 kWh · 2,1 kWh zon · €\s3,13 net · €\s3,59 incl\. zon$/);
  });

  it("laat het weg bij een coach die het niet levert", () => {
    const t = L.sessieTekst({ actief: true, kwh: 15, kosten: 3.59 }, NU);
    assert.doesNotMatch(t.tekst, / net/);
  });
});
