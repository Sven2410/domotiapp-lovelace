// De taal van de kaarten (sinds 0.81.0). Alles hier is NIEUW GEDRAG: vóór
// deze ronde was er geen taal.js en waren de kaarten alleen Nederlands.

import { strict as assert } from "node:assert";
import { afterEach, test } from "node:test";

import { _reset, getal, instelling, locale, t, taal, tc, taalUit, taalVoor, tn, volgTaal, zetInstelling, zieHass } from "../../src/taal.js";
import { EN } from "../../src/i18n/en.js";
import { sessieTekst } from "../../src/cards/laadpaal-logica.js";
import { controle } from "../../scripts/check-taal.mjs";

afterEach(() => _reset());

test("automatisch volgt Home Assistant: Engels alleen als die met en begint", () => {
  assert.equal(taalVoor("auto", "en"), "en");
  assert.equal(taalVoor("auto", "en-GB"), "en");
  assert.equal(taalVoor("auto", "nl"), "nl");
  assert.equal(taalVoor("auto", "de"), "nl");
  assert.equal(taalVoor("auto", ""), "nl");
  assert.equal(taalVoor("nl", "en"), "nl");
  assert.equal(taalVoor("en", "nl"), "en");
});

test("t zoekt de zin op, vult waarden in, en laat een onbekende zin Nederlands", () => {
  _reset({ instelling: "en" });
  assert.equal(t("Laden tot"), "Charge to");
  assert.equal(t("Laden tot {pct}%, {min} tot {max}", { pct: 80, min: 10, max: 100 }), "Charge to 80%, 10 to 100");
  assert.equal(t("Een zin die er niet in staat"), "Een zin die er niet in staat");
  _reset({ instelling: "nl" });
  assert.equal(t("Laden tot {pct}%, {min} tot {max}", { pct: 80, min: 10, max: 100 }), "Laden tot 80%, 10 tot 100");
});

test("tc kiest het Engels bij de context, en anders het gewone", () => {
  _reset({ instelling: "en" });
  assert.equal(tc("stand", "Stil"), "Quiet");
  assert.equal(t("Stil"), "Idle");
  assert.equal(tc("onbekend", "Stil"), "Idle");
  _reset({ instelling: "nl" });
  assert.equal(tc("stand", "Stil"), "Stil");
});

test("een ontbrekende waarde wordt leeg, niet undefined", () => {
  assert.equal(t("Wekker {naam} bewerken", { naam: undefined }), "Wekker  bewerken");
  assert.equal(t("Wekker {naam} bewerken", { naam: null }), "Wekker  bewerken");
  assert.equal(t("{n} van {totaal}", { n: 0, totaal: 3 }), "0 van 3");
});

test("tn kiest enkelvoud of meervoud", () => {
  assert.equal(tn(1, "{n} lamp", "{n} lampen"), "1 lamp");
  assert.equal(tn(3, "{n} lamp", "{n} lampen"), "3 lampen");
});

test("getal en locale volgen de taal", () => {
  assert.equal(getal(1.5), "1,5");
  assert.equal(locale(), "nl-NL");
  _reset({ instelling: "en" });
  assert.equal(getal(1.5), "1.5");
  assert.equal(locale(), "en-GB");
});

test("een andere taal van Home Assistant of een andere keuze geeft één seintje", () => {
  const gezien = [];
  volgTaal((nieuw) => gezien.push(nieuw));
  assert.equal(zieHass({ language: "nl" }), false);
  assert.equal(zieHass({ language: "en", locale: { language: "en" } }), true);
  assert.equal(zieHass({ language: "en", locale: { language: "en" } }), false);
  assert.equal(zetInstelling("nl"), true);
  assert.equal(zetInstelling("onzin"), false);
  assert.equal(instelling(), "nl");
  assert.deepEqual(gezien, ["en", "nl"]);
  assert.equal(taal(), "nl");
});

test("de keuze uit het antwoord van de lader; een oude lader noemt hem niet", () => {
  const lader = 'globalThis.__domotiappLovelaceThema="auto";\nglobalThis.__domotiappLovelaceTaal="en";\nimport("/x.js?v=1");';
  assert.equal(taalUit(lader), "en");
  assert.equal(taalUit('globalThis.__domotiappLovelaceThema="auto";'), null);
  assert.equal(taalUit('globalThis.__domotiappLovelaceTaal="xx";'), null);
});

test("de laadbeurt in het Engels: woorden, bedragen en dagnamen", () => {
  _reset({ instelling: "en" });
  const nu = new Date(2026, 9, 21, 20, 0);
  const uit = sessieTekst(
    { actief: false, begin: new Date(2026, 9, 18, 18, 2).toISOString(), einde: new Date(2026, 9, 18, 21, 30).toISOString(), kwh: 12.4, zon_kwh: 3, kosten_net: 3.13, kosten: 3.59 },
    nu,
  );
  assert.equal(uit.kop, "Previous session");
  assert.equal(uit.tekst, "12.4 kWh · 3 kWh solar · €3.13 grid · €3.59 incl. solar");
  assert.match(uit.tijd, /^Sunday 18:02 /);
});

test("elke zin in een t() heeft Engels, met dezelfde waarden en zonder gedachtestreepje", async () => {
  const uit = await controle();
  assert.deepEqual(uit.ontbreekt, {});
  assert.deepEqual(uit.verschillend, []);
  assert.deepEqual(uit.scheef, []);
  assert.deepEqual(uit.streep, []);
  assert.ok(Object.keys(EN).length > 100);
});
