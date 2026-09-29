/**
 * De energiegrafiek van het infoscherm toont VANDAAG — NIEUW GEDRAG (0.53.0).
 *
 * Open vraag sinds 10 september 2026: de afgelopen 24 uur, of vandaag vanaf
 * middernacht? Zijn antwoord op 29 september 2026: *"Energiegrafiek vanaf
 * middenacht."* De as loopt van middernacht tot middernacht en de lijn stopt
 * bij nu, zoals het energiedashboard van Home Assistant het tekent.
 *
 * Pure logica, geen browser (CLAUDE.md). Met `import *`, zodat dit bestand ook
 * tegen de code van vóór deze ronde laadt en daar faalt op wat er gebeurt.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import * as logica from "../../src/cards/infoscherm-logica.js";

const UUR = 3600000;
const fn = (naam) => {
  assert.equal(typeof logica[naam], "function", `${naam} bestaat niet`);
  return logica[naam];
};

// 29 september 2026, 14:30 lokale tijd.
const nu = new Date(2026, 8, 29, 14, 30).getTime();
const middernacht = new Date(2026, 8, 29).getTime();
const morgen = new Date(2026, 8, 30).getTime();

describe("dagVenster()", () => {
  it("is vandaag, van middernacht tot middernacht", () => {
    const { van, tot } = fn("dagVenster")(nu);
    assert.equal(van, middernacht);
    assert.equal(tot, morgen);
  });

  it("om 00:00 precies begint de nieuwe dag", () => {
    assert.equal(fn("dagVenster")(morgen).van, morgen);
  });

  it("de dag dat de klok verzet wordt begint en eindigt ook om middernacht", () => {
    // 25 oktober 2026: in Nederland een dag van 25 uur. Wat de tijdzone van
    // de testmachine ook is: de randen vallen op 00:00.
    const { van, tot } = fn("dagVenster")(new Date(2026, 9, 25, 12).getTime());
    assert.equal(new Date(van).getHours(), 0);
    assert.equal(new Date(tot).getHours(), 0);
    assert.ok([23, 24, 25].includes((tot - van) / UUR));
  });
});

describe("energieReeks() met een dagvenster", () => {
  // Het venster zelf meegegeven en niet via dagVenster: dan faalt dit op de
  // oude code op wat de reeks DOET, en niet op een ontbrekende functie.
  const dag = () => ({ van: middernacht, tot: morgen });

  it("vermogen: de as loopt tot middernacht, de lijn tot nu", () => {
    const punten = [
      { t: middernacht - 2 * UUR, v: 50 }, // gisteravond
      { t: middernacht + 3 * UUR, v: 100 },
      { t: nu - UUR, v: 300 },
    ];
    const r = logica.energieReeks(punten, { nu, ...dag() });
    assert.equal(r.van, middernacht);
    assert.equal(r.tot, morgen);
    // De meting van gisteravond is de waarde waarmee de dag begint.
    assert.deepEqual(r.punten[0], { t: middernacht, v: 50 });
    // En de lijn stopt bij nu, niet om middernacht.
    assert.deepEqual(r.punten[r.punten.length - 1], { t: nu, v: 300 });
    assert.ok(r.punten.every((p) => p.t <= nu));
  });

  it("teller: verbruik per uur vanaf middernacht, geen uren na nu", () => {
    const punten = [];
    for (let u = -2; u <= 14; u += 1) punten.push({ t: middernacht + u * UUR + 30 * 60000, v: 1000 + u });
    const r = logica.energieReeks(punten, { nu, tellerstand: true, ...dag() });
    assert.ok(r.punten.length > 0);
    assert.equal(r.punten[0].t, middernacht);
    assert.ok(r.punten.every((p) => p.t >= middernacht && p.t < nu));
  });
});

describe("verdunReeks() trekt de lijn niet door na nu", () => {
  it("geen punten na nu, en het laatste punt staat op nu", () => {
    const punten = [];
    for (let t = middernacht; t <= nu; t += 10 * 60000) punten.push({ t, v: 200 });
    // Een reeks zoals de kaart hem sinds 0.53.0 maakt: de as tot morgen,
    // de metingen tot nu.
    const r = { punten, van: middernacht, tot: morgen, nu, perUur: false };
    const dun = logica.verdunReeks(r, 48);
    assert.equal(dun.punten[dun.punten.length - 1].t, nu);
    assert.ok(dun.punten.every((p) => p.t <= nu), "er staan punten na nu");
  });
});
