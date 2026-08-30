/**
 * De rolluikkaart: poort, omgekeerd aangesloten, en een statusregel die weg mag.
 *
 * NIEUW GEDRAG voor alles wat met `poort`, `invert` en `toon` te maken heeft:
 * `src/cards/cover-logica.js` bestond niet vóór deze ronde, en de kaart kende
 * geen van de drie. Deze hele suite valt op de code van vóór de fix om met
 * `ERR_MODULE_NOT_FOUND` -- dat is meegemeten en staat in het rapport.
 *
 * REGRESSIEWACHT voor de rest: zonder die drie instellingen hoort er precies
 * uit te komen wat de kaart er vóór deze ronde inline uitrekende. Dat is de
 * enige manier om te weten dat de inversie er niet stiekem altijd in zit.
 *
 * Waarom de inversie HEEL is en niet half: zou alleen de aflezing omdraaien,
 * dan zou je op "Openen" drukken en "Dicht" zien verschijnen. Dat is geen
 * instelling maar een defect. Vandaar dat hier zowel de dienst als de toestand
 * als de positie als de statusregel getoetst wordt, en wel op dezelfde invoer.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  BIT_VOOR_DIENST,
  F,
  dienstVoor,
  getoondeStand,
  isOmgekeerd,
  isPoort,
  keerPositie,
  knopTekst,
  optie,
  standaardIconen,
  statusTekst,
  toestandUit,
} from "../../src/cards/cover-logica.js";

describe("per rolluik of voor de hele kaart", () => {
  it("laat de regel winnen van de kaart", () => {
    assert.equal(optie({ poort: true }, { poort: false }, "poort"), true);
    assert.equal(optie({ poort: false }, { poort: true }, "poort"), false);
  });

  it("valt terug op de kaart als de regel zwijgt", () => {
    assert.equal(isPoort({ entity: "cover.a" }, { poort: true }), true);
    assert.equal(isOmgekeerd({ entity: "cover.a" }, { invert: true }), true);
  });

  it("staat standaard uit — REGRESSIEWACHT", () => {
    assert.equal(isPoort({ entity: "cover.a" }, {}), false);
    assert.equal(isOmgekeerd({ entity: "cover.a" }, {}), false);
  });
});

describe("de knoppen van een poort — NIEUW GEDRAG", () => {
  it("zet er woorden op in plaats van pijlen", () => {
    assert.deepEqual(knopTekst(true), { open: "Openen", close: "Sluiten" });
  });

  it("laat een rolluik met rust — REGRESSIEWACHT", () => {
    assert.deepEqual(knopTekst(false), { open: "Open", close: "Dicht" });
  });
});

describe("welke dienst een knop aanroept", () => {
  it("doet gewoon wat er op staat — REGRESSIEWACHT", () => {
    assert.equal(dienstVoor("open", false), "open_cover");
    assert.equal(dienstVoor("close", false), "close_cover");
    assert.equal(dienstVoor("stop", false), "stop_cover");
  });

  it("draait open en dicht om als de motor omgekeerd hangt — NIEUW GEDRAG", () => {
    assert.equal(dienstVoor("open", true), "close_cover");
    assert.equal(dienstVoor("close", true), "open_cover");
  });

  it("laat stop met rust, want stop kent geen richting", () => {
    assert.equal(dienstVoor("stop", true), "stop_cover");
  });

  it("koppelt elke dienst aan de feature-bit die hij nodig heeft", () => {
    // Hierdoor grijst de OPEN-knop van een omgekeerde motor uit op CLOSE, en
    // niet op OPEN. Zonder die stap zou een motor die alleen dicht kan, een
    // werkende knop tonen die niets doet.
    assert.equal(BIT_VOOR_DIENST[dienstVoor("open", true)], F.CLOSE);
    assert.equal(BIT_VOOR_DIENST[dienstVoor("open", false)], F.OPEN);
    assert.equal(BIT_VOOR_DIENST[dienstVoor("stop", false)], F.STOP);
  });
});

describe("de toestand omdraaien", () => {
  it("laat hem staan als er niets om te draaien valt — REGRESSIEWACHT", () => {
    for (const s of ["open", "closed", "opening", "closing", "unknown", "unavailable"]) {
      assert.equal(toestandUit(s, false), s);
    }
  });

  it("draait open, dicht en allebei de bewegingen om — NIEUW GEDRAG", () => {
    assert.equal(toestandUit("open", true), "closed");
    assert.equal(toestandUit("closed", true), "open");
    assert.equal(toestandUit("opening", true), "closing");
    assert.equal(toestandUit("closing", true), "opening");
  });

  it("weet niets beters te doen met een toestand die geen richting heeft", () => {
    assert.equal(toestandUit("unknown", true), "unknown");
    assert.equal(toestandUit("unavailable", true), "unavailable");
  });
});

describe("de positie omdraaien", () => {
  it("laat hem staan zonder inversie — REGRESSIEWACHT", () => {
    assert.equal(keerPositie(0, false), 0);
    assert.equal(keerPositie(37, false), 37);
    assert.equal(keerPositie(100, false), 100);
  });

  it("telt hem af van honderd — NIEUW GEDRAG", () => {
    assert.equal(keerPositie(0, true), 100);
    assert.equal(keerPositie(30, true), 70);
    assert.equal(keerPositie(100, true), 0);
  });

  it("werkt beide kanten op, want dat is dezelfde som", () => {
    // De kaart gebruikt hem van de entiteit naar de schuif én terug. Zou dat
    // niet dezelfde functie zijn, dan zou er ooit één vergeten worden.
    for (const p of [0, 1, 42, 99, 100]) {
      assert.equal(keerPositie(keerPositie(p, true), true), p);
    }
  });

  it("valt niet over een positie die er niet is", () => {
    assert.equal(keerPositie(null, true), null);
    assert.equal(keerPositie(undefined, true), undefined);
  });
});

describe("welk icoon er brandt", () => {
  it("laat de gemeten positie winnen — REGRESSIEWACHT", () => {
    assert.equal(getoondeStand({ state: "closed", positie: 40 }), "open");
    assert.equal(getoondeStand({ state: "open", positie: 0 }), "closed");
  });

  it("neemt daarna de gemelde toestand — REGRESSIEWACHT", () => {
    assert.equal(getoondeStand({ state: "open", positie: null }), "open");
    assert.equal(getoondeStand({ state: "closed", positie: null }), "closed");
  });

  it("valt terug op wat je zojuist indrukte — REGRESSIEWACHT", () => {
    assert.equal(getoondeStand({ state: "unknown", positie: null, aanname: "open" }), "open");
  });

  it("gokt dicht als niemand iets weet — REGRESSIEWACHT", () => {
    assert.equal(getoondeStand({ state: "unknown", positie: null }), "closed");
    assert.equal(getoondeStand({ state: "opening", positie: null }), "closed");
  });
});

describe("de statusregel", () => {
  it("zegt wat de motor meldt — REGRESSIEWACHT", () => {
    assert.equal(statusTekst({ state: "open", positie: null }), "Open");
    assert.equal(statusTekst({ state: "closed", positie: null }), "Dicht");
    assert.equal(statusTekst({ state: "opening", positie: null }), "Gaat open");
    assert.equal(statusTekst({ state: "closing", positie: null }), "Gaat dicht");
    assert.equal(statusTekst({ state: "open", positie: 60 }), "60% open");
    assert.equal(statusTekst({ dood: true, state: "unavailable" }), "Niet bereikbaar");
  });

  it("blijft leeg als er niets te melden valt — REGRESSIEWACHT", () => {
    assert.equal(statusTekst({ state: "unknown", positie: null }), "");
  });

  it("gaat weg als hij verborgen is — NIEUW GEDRAG", () => {
    assert.equal(statusTekst({ state: "open", positie: null, toon: false }), "");
    assert.equal(statusTekst({ state: "closed", positie: null, toon: false }), "");
    assert.equal(statusTekst({ state: "open", positie: 60, toon: false }), "");
    assert.equal(statusTekst({ state: "opening", positie: null, toon: false }), "");
  });

  it("houdt een storing altijd zichtbaar — NIEUW GEDRAG", () => {
    // Verbergen gaat over Open, Dicht en het percentage. Een rolluik dat er
    // niet is, is geen status maar een defect; dat stilzwijgend weglaten zou
    // een kaart opleveren die net doet alsof alles in orde is.
    assert.equal(statusTekst({ dood: true, state: "unavailable", toon: false }), "Niet bereikbaar");
  });
});

describe("welk icoon een cover standaard draagt", () => {
  it("houdt de bestaande drie — REGRESSIEWACHT", () => {
    assert.deepEqual(standaardIconen({}), { open: "shutterOpen", closed: "shutter" });
    assert.deepEqual(standaardIconen({ device_class: "garage" }), {
      open: "garageOpen",
      closed: "garageClosed",
    });
    assert.deepEqual(standaardIconen({ device_class: "awning" }), {
      open: "awning",
      closed: "awning",
    });
    assert.deepEqual(standaardIconen({ device_class: "blind" }), {
      open: "awning",
      closed: "awning",
    });
  });

  it("geeft een poort zijn eigen icoon — NIEUW GEDRAG", () => {
    assert.deepEqual(standaardIconen({}, true), { open: "gateOpen", closed: "gate" });
  });

  it("herkent device_class gate zonder dat er iets aangevinkt is — NIEUW GEDRAG", () => {
    // Het VINKJE doet dit bewust niet andersom: een aangevinkt vakje dat de
    // config niet noemt, staat in de editor leeg terwijl de kaart zich anders
    // gedraagt, en dan lijkt aanvinken niets te doen.
    assert.deepEqual(standaardIconen({ device_class: "gate" }), {
      open: "gateOpen",
      closed: "gate",
    });
  });
});

describe("de drie samen, op één rolluik", () => {
  /**
   * Een poort aan een omgekeerd aangesloten motor, met de status verborgen.
   * Home Assistant meldt `closed`; in het echt staat de poort open.
   */
  const cover = { entity: "cover.poort", poort: true, invert: true };
  const config = { show_state: false };

  it("leest de toestand om", () => {
    const state = toestandUit("closed", isOmgekeerd(cover, config));
    assert.equal(state, "open");
    assert.equal(getoondeStand({ state, positie: null }), "open");
  });

  it("stuurt de knop Sluiten naar open_cover", () => {
    assert.equal(dienstVoor("close", isOmgekeerd(cover, config)), "open_cover");
  });

  it("zet Openen en Sluiten op de knoppen", () => {
    assert.deepEqual(knopTekst(isPoort(cover, config)), { open: "Openen", close: "Sluiten" });
  });

  it("laat de statusregel leeg", () => {
    const state = toestandUit("closed", isOmgekeerd(cover, config));
    assert.equal(statusTekst({ state, positie: null, toon: config.show_state !== false }), "");
  });
});
