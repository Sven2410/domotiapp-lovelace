/**
 * De thuisbatterijkaart met DomotiApp Coach: wat hij zegt, los van hoe hij eruitziet.
 *
 * NIEUW GEDRAG: `src/cards/batterij-logica.js` bestond niet vóór deze ronde.
 *
 * De attributen zijn die van contract 1 zoals de coach-sessie ze op
 * 11 oktober 2026 beschreef (v0.112.0), met de antwoorden op twee vragen
 * erbij: `plan[].kw` is het verwachte gemiddelde (laden positief, ontladen
 * negatief, ook bij "nul" niet nul), een blok kan een kwartier zijn, en
 * `opgeleverd_*` is None zolang het nog niet bekend is. De echte dump van
 * v0.112.1 staat in `batterij-dump-0112.test.mjs`.
 *
 * Tijden in LOKALE tijd, zodat de uitkomst niet van de tijdzone afhangt.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as B from "../../src/cards/batterij-logica.js";

/** Zondag 11 oktober 2026, 20:00. */
const NU = new Date(2026, 9, 11, 20, 0);
const OM = (dag, u, m = 0) => new Date(2026, 9, dag, u, m);
const iso = (d) => d.toISOString();
const S = (state, attributes = {}) => ({ entity_id: "sensor.thuisbatterij_coach", state, attributes });

describe("NIEUW GEDRAG: wat de coach over de batterij zegt", () => {
  it("leest de stand uit de attributen en toont de tekst zoals hij is", () => {
    const s = B.batterijStand(
      S("Nul op de meter", {
        stand: "nul_op_de_meter",
        zelf: true,
        soc: 64.4,
        temperatuur: 21.3,
        override: null,
        leeg_tot: 30,
        vakantie: false,
        vakantie_max: 60,
        reserve: null,
        ondergrens: 10,
        opgeleverd_sinds: "2026-03-01",
      })
    );
    assert.equal(s.stand, "nul_op_de_meter");
    assert.equal(s.tekst, "Nul op de meter");
    assert.equal(s.zelf, true);
    assert.equal(s.soc, 64.4);
    assert.equal(s.override, null);
    assert.equal(s.leegTot, 30);
    assert.equal(s.reserve, null);
    assert.equal(s.sinds, "2026-03-01");
  });

  it("beslist niets op de tekst: een andere tekst geeft dezelfde vorm", () => {
    const a = B.batterijStand(S("Laden van het net", { stand: "laden" }));
    const b = B.batterijStand(S("iets anders", { stand: "laden" }));
    assert.deepEqual(B.standVorm(a.stand), B.standVorm(b.stand));
  });

  it("valt zonder tekst terug op het woord van de stand", () => {
    assert.equal(B.batterijStand(S("unknown", { stand: "stil" })).tekst, "Stil");
  });

  it("weet niets als de sensor er niet is of niet bereikbaar", () => {
    assert.equal(B.batterijStand(null), null);
    assert.equal(B.batterijStand(S("unavailable", { stand: "laden" })), null);
  });

  it("kent alleen vol en leeg als opdracht", () => {
    assert.equal(B.batterijStand(S("x", { override: "vol" })).override, "vol");
    assert.equal(B.batterijStand(S("x", { override: "iets" })).override, null);
  });

  it("geeft zonneladen de kleur van zon, en geen enkele stand rood of groen", () => {
    assert.equal(B.standVorm("zonneladen").tone, "solar");
    for (const v of Object.values(B.STANDEN)) assert.ok(!["good", "bad"].includes(v.tone));
  });
});

describe("NIEUW GEDRAG: de knoppen voor een opdracht", () => {
  const ROLLEN = { vol_laden: "button.vol", leegladen: "button.leeg", terug_naar_plan: "button.plan" };
  const knoppen = (override) =>
    B.opdrachtKnoppen(B.batterijStand(S("x", { override })), ROLLEN).map((k) => k.rol + (k.aan ? "*" : ""));

  it("biedt Vol laden en Leegladen aan zonder opdracht, zonder Terug naar het plan", () => {
    assert.deepEqual(knoppen(null), ["vol", "leeg"]);
  });

  it("zet de lopende opdracht aan en biedt dan Terug naar het plan", () => {
    assert.deepEqual(knoppen("vol"), ["vol*", "leeg", "plan"]);
    assert.deepEqual(knoppen("leeg"), ["vol", "leeg*", "plan"]);
  });

  it("zet geen knop neer voor een entiteit die de coach niet levert", () => {
    const k = B.opdrachtKnoppen(B.batterijStand(S("x", {})), { leegladen: "button.leeg" });
    assert.deepEqual(k.map((x) => x.rol), ["leeg"]);
  });
});

describe("NIEUW GEDRAG: het plan als staafjes rond een nullijn", () => {
  const blok = (van, tot, kw, actie = "nul") => ({ start: iso(van), end: iso(tot), actie, kw, price: 0.2, soc_eind: 50 });

  it("zet laden omhoog en ontladen omlaag, ook bij nul op de meter", () => {
    const p = B.planStaven([blok(OM(11, 21), OM(11, 22), 1.2), blok(OM(11, 22), OM(11, 23), -0.6)], NU);
    assert.deepEqual(p.staven.map((s) => s.richting), ["laden", "ontladen"]);
    assert.equal(p.staven[0].hoogte, 100);
    assert.equal(p.staven[1].hoogte, 50);
  });

  it("rekent de breedte uit start en eind: een kwartier is een kwartier", () => {
    // Venster 20:00 - 02:00 (zes uur): een kwartier is 1/24 van de balk.
    const p = B.planStaven([blok(OM(11, 21), OM(11, 21, 15), 1, "laden")], NU);
    assert.ok(Math.abs(p.staven[0].breedte - 100 / 24) < 1e-9);
  });

  it("laat stille blokken en wat voorbij is weg", () => {
    const p = B.planStaven(
      [blok(OM(11, 18), OM(11, 19), 2), blok(OM(11, 21), OM(11, 22), 0, "stil"), blok(OM(11, 22), OM(11, 23), 1)],
      NU
    );
    assert.equal(p.staven.length, 1);
  });

  it("deelt niet door nul bij een plan van alleen stil", () => {
    const p = B.planStaven([blok(OM(11, 21), OM(11, 22), 0, "stil")], NU);
    assert.equal(p.staven.length, 0);
    assert.ok(p.max > 0);
  });

  it("geeft niets zonder plan", () => {
    assert.equal(B.planStaven([], NU), null);
    assert.equal(B.planStaven(undefined, NU), null);
  });
});

describe("NIEUW GEDRAG: wat hij opleverde, en de grenzen", () => {
  it("laat weg wat de coach nog niet weet, in plaats van een nul", () => {
    const s = B.batterijStand(S("x", { opgeleverd_vandaag: null, opgeleverd_maand: null, opgeleverd_totaal: 140, opgeleverd_sinds: null }));
    assert.equal(B.opgeleverdTekst(s), "€ 140,00");
  });

  it("noemt vandaag, deze maand en het totaal met de datum", () => {
    const s = B.batterijStand(S("x", { opgeleverd_vandaag: 0.42, opgeleverd_maand: 12.3, opgeleverd_totaal: 140, opgeleverd_sinds: "2026-03-01" }));
    assert.equal(B.opgeleverdTekst(s), "vandaag € 0,42 · deze maand € 12,30 · € 140,00 sinds 1 mrt 2026");
  });

  it("zet de ondergrens, de reserve en de vakantiegrens op een regel", () => {
    const s = B.batterijStand(S("x", { ondergrens: 10, reserve: 20, vakantie: true, vakantie_max: 60 }));
    assert.equal(B.grenzenTekst(s), "ondergrens 10% · reserve 20% · vakantie tot 60%");
    const zonder = B.batterijStand(S("x", { ondergrens: 10, reserve: null, vakantie: false, vakantie_max: 60 }));
    assert.equal(B.grenzenTekst(zonder), "ondergrens 10%");
  });

  it("schrijft de temperatuur met een komma", () => {
    assert.equal(B.temperatuurTekst(B.batterijStand(S("x", { temperatuur: 21.34 }))), "21,3 °C");
    assert.equal(B.temperatuurTekst(B.batterijStand(S("x", { temperatuur: null }))), "");
  });
});

describe("NIEUW GEDRAG: de foto", () => {
  const BASIS = "/domotiapp_lovelace/afbeeldingen/";

  it("neemt zonder keuze de foto bij het model dat de coach meldt, en anders niets", () => {
    assert.equal(B.batterijAfbeelding(undefined, { model: "Anker SOLIX Solarbank Max AC" }), `${BASIS}thuisbatterijen/anker-solarbank-max-ac.webp`);
    assert.equal(B.batterijAfbeelding(undefined, null), "");
  });

  it("neemt het gekozen model, een eigen afbeelding of niets", () => {
    assert.equal(B.batterijAfbeelding("anker_solarbank_max_ac_uitbreiding", null), `${BASIS}thuisbatterijen/anker-solarbank-max-ac-uitbreiding.webp`);
    assert.equal(B.batterijAfbeelding("eigen", null, "/local/accu.png"), "/local/accu.png");
    assert.equal(B.batterijAfbeelding("geen", null, "/local/accu.png"), "");
  });

  it("heeft voor elk model een pad onder thuisbatterijen/", () => {
    for (const f of Object.values(B.BATTERIJ_FOTOS)) assert.match(f.pad, /^thuisbatterijen\/[a-z0-9-]+\.webp$/);
  });
});

describe("NIEUW GEDRAG: de melding noemt de coach die deze kaart nodig heeft", () => {
  it("zegt 0.112.1 voor de batterij, en blijft 0.110.0 voor de rest", async () => {
    const C = await import("../../src/cards/coach-logica.js");
    assert.match(C.coachMelding({ reden: "geen" }, 0, "0.112.1"), /0\.112\.1/);
    assert.match(C.coachMelding({ reden: "enige" }, 0, "0.112.1"), /bij naar 0\.112\.1/);
    assert.match(C.coachMelding({ reden: "geen" }, 0), /0\.110\.0/);
  });
});

describe("NIEUW GEDRAG: een kort woord voor een smalle kaart", () => {
  it("maakt van 'Terug naar het plan' 'Naar plan'", () => {
    const k = B.opdrachtKnoppen(B.batterijStand(S("x", { override: "vol" })), { vol_laden: "b.v", leegladen: "b.l", terug_naar_plan: "b.p" });
    assert.equal(k.find((x) => x.rol === "plan").kort, "Naar plan");
  });
});
