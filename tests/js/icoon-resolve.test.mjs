/**
 * Welke naam welk icoon oplevert.
 *
 * NIEUW GEDRAG voor `dai:` (17 september 2026). Op de code van ervoor faalt de
 * eerste `dai:`-test: die naam bevat een dubbele punt, viel daardoor in de
 * `<ha-icon>`-tak, en `<ha-icon icon="dai:bulb">` tekent niets — **zonder fout
 * en zonder log**. Dat is precies waarom hier een test op staat en niet alleen
 * een meting in de browser: een icoon dat niet verschijnt ziet er hetzelfde uit
 * als een icoon dat je niet hebt ingesteld.
 *
 * REGRESSIEWACHT voor de rest: een kale naam en een `mdi:`-naam deden het al en
 * moeten het blijven doen. De eigenaar dacht dat onze eigen iconen niet in een
 * sjabloon konden ("werkt nu alleen met de MDI icons van HA"); ze konden wel,
 * er was alleen geen manier om te weten hoe ze heetten. De vorm mag dus niet
 * stilletjes veranderen nu er een tweede manier bij is.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DAI, icons, resolve } from "../../src/icons.js";

const isEigen = (html) => html.startsWith("<svg");
const isHaIcon = (html) => html.startsWith("<ha-icon");

describe("resolve: waar een icoonnaam vandaan komt", () => {
  it("geeft onze tekening bij een kale naam (REGRESSIEWACHT)", () => {
    assert.ok(isEigen(resolve("bulb")));
    assert.equal(resolve("bulb"), icons.bulb);
  });

  it("geeft onze tekening bij dai: (NIEUW GEDRAG)", () => {
    assert.ok(isEigen(resolve("dai:bulb")));
    assert.equal(resolve("dai:bulb"), icons.bulb);
  });

  it("laat dai: NIET bij ha-icon belanden", () => {
    // Dit is de hele reden van de volgorde in resolve: `dai:bulb` bevat een
    // dubbele punt en zou anders `<ha-icon icon="dai:bulb">` worden.
    assert.equal(isHaIcon(resolve("dai:bulb")), false);
  });

  it("geeft ha-icon bij mdi: (REGRESSIEWACHT)", () => {
    const uit = resolve("mdi:washing-machine");
    assert.ok(isHaIcon(uit));
    assert.match(uit, /icon="mdi:washing-machine"/);
  });

  it("valt terug als de dai:-naam niet bestaat", () => {
    assert.equal(resolve("dai:bestaatniet", "shield"), icons.shield);
  });

  it("valt terug op de opgegeven naam bij leeg", () => {
    assert.equal(resolve("", "shield"), icons.shield);
    assert.equal(resolve(null, "shield"), icons.shield);
    assert.equal(resolve(undefined, "shield"), icons.shield);
  });

  it("het voorvoegsel is één plek en geen losse string", () => {
    assert.equal(DAI, "dai:");
  });
});

describe("de iconen die deze ronde zijn bijgekomen", () => {
  it("kent de drie alarmstanden", () => {
    for (const naam of ["alarmOff", "alarmPartial", "alarmOn"]) {
      assert.ok(icons[naam], `${naam} ontbreekt`);
      assert.ok(isEigen(icons[naam]), `${naam} is geen eigen tekening`);
    }
  });

  it("tekent de drie alarmstanden op dezelfde lijndikte als de rest", () => {
    // Een 2px icoon naast een 1.6px icoon is de zichtbaarste manier om een set
    // te laten ophouden een set te zijn; zie de kop van icons.js.
    for (const naam of ["alarmOff", "alarmPartial", "alarmOn", "cog"]) {
      assert.match(icons[naam], /stroke-width="1\.6"/, `${naam} wijkt af`);
    }
  });

  it("geeft de drie standen elk een eigen tekening", () => {
    const set = new Set([icons.alarmOff, icons.alarmPartial, icons.alarmOn]);
    assert.equal(set.size, 3, "twee standen zien er hetzelfde uit");
  });

  it("cog is een tandwiel en geen zon meer", () => {
    // De oude tekening was een cirkel met acht LOSSE straaltjes: acht keer
    // `M`…`v2.2` in één pad, en verder niets. Een tandwiel is één gesloten pad
    // met tanden erin, plus het gat in het midden.
    assert.match(icons.cog, /Z"/, "het tandwielpad is niet gesloten");
    assert.match(icons.cog, /<circle cx="12" cy="12" r="3\.1"\/>/, "het gat ontbreekt");
    assert.ok(
      !/M12 3\.4v2\.2/.test(icons.cog),
      "de straaltjes van de oude zon staan er nog in",
    );
  });

  it("cog blijft te vinden op het woord tandwiel", async () => {
    const { zoekIconen } = await import("../../src/editor/icoon-zoek.js");
    // zoekIconen geeft GROEPEN terug -- [[kop, sleutels]] -- en niet een platte
    // lijst. Dat is wat het raster verwacht.
    const plat = (v) => zoekIconen(v).flatMap(([, sleutels]) => sleutels);
    assert.ok(plat("tandwiel").includes("cog"));
    assert.ok(plat("instellingen").includes("cog"));
  });

  it("de alarmstanden zijn op hun Nederlandse woorden te vinden", async () => {
    const { zoekIconen } = await import("../../src/editor/icoon-zoek.js");
    const plat = (v) => zoekIconen(v).flatMap(([, sleutels]) => sleutels);
    assert.ok(plat("deelinschakeling").includes("alarmPartial"));
    assert.ok(plat("uitgeschakeld").includes("alarmOff"));
    assert.ok(plat("ingeschakeld").includes("alarmOn"));
    // En op de toestand die je in het sjabloon uitschrijft.
    assert.ok(plat("armed_away").includes("alarmOn"));
    // Alle drie komen boven bij het woord waar ze van zijn.
    assert.equal(plat("alarm").slice(0, 3).sort().join(","), "alarmOff,alarmOn,alarmPartial");
  });
});
