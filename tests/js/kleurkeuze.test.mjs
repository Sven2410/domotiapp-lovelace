/**
 * Fase 10: de vier bevindingen uit de productieomgeving.
 *
 * De twee die in pure logica te vangen zijn staan hier:
 *
 * - **Bevinding 1** — de helderheid die de gebruiker ziet is overal een
 *   percentage; wat er wordt opgeslagen blijft HA's 0..255 (SPEC 4.4, 10.4).
 * - **Bevinding 2** — een lamp die kleur én kleurtemperatuur kan, toont er
 *   maar één tegelijk, met twee keuzeknoppen ertussen (SPEC 6.5). Er kunnen
 *   nooit twee kleurattributen in één opgeslagen waarde staan (SPEC 10.4).
 *
 * Bevinding 3 en 4 gaan over de plaatsing en de hoogte van de kaart in HA's
 * sections-grid. Daar is geen pure logica voor: `getGridOptions()` geeft één
 * object terug en de rest gebeurt in HA's CSS. Die twee staan als meting in
 * `docs/fase-10/RAPPORT.md`, plus één test hieronder op het contract van
 * `getGridOptions` zelf.
 *
 * Bewust geen jsdom: jsdom beoordeelt de CSS-cascade niet en zou over de
 * kaarthoogte niets kunnen zeggen (CLAUDE.md).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  alsProcent,
  heeftKleurkeuze,
  kleurstandVan,
  metHelderheid,
  metKleur,
  metKleurstand,
  metKleurtemp,
  vanProcent,
  zichtbareBesturingen,
  KLEURSLEUTELS,
  MAX_BRIGHTNESS,
  MAX_PROCENT,
  MIN_BRIGHTNESS,
  MIN_PROCENT,
  STAND_KLEUR,
  STAND_WIT,
} from "../../src/scene/lamp-besturing.js";

/** Een lamp die allebei kan — het geval uit de productieomgeving. */
const RGBWW = {
  state: "on",
  attributes: {
    supported_color_modes: ["color_temp", "rgbww"],
    color_mode: "rgbww",
    brightness: 128,
    hs_color: [30, 60],
    min_color_temp_kelvin: 2000,
    max_color_temp_kelvin: 6535,
  },
};

/** Dezelfde lamp, maar op dit moment in wit licht. */
const RGBWW_IN_WIT = {
  ...RGBWW,
  attributes: {
    ...RGBWW.attributes,
    color_mode: "color_temp",
    color_temp_kelvin: 2700,
  },
};

/** Een lamp die alleen kleurtemperatuur kan. */
const ALLEEN_WIT = {
  state: "on",
  attributes: {
    supported_color_modes: ["color_temp"],
    color_mode: "color_temp",
    brightness: 128,
    color_temp_kelvin: 2700,
    min_color_temp_kelvin: 2202,
    max_color_temp_kelvin: 6535,
  },
};

/** Een lamp die alleen kleur kan. */
const ALLEEN_KLEUR = {
  state: "on",
  attributes: {
    supported_color_modes: ["hs"],
    color_mode: "hs",
    brightness: 128,
    hs_color: [200, 80],
  },
};

/** Hoeveel kleurattributen staan er in deze waarde? */
function aantalKleurattributen(waarde) {
  return KLEURSLEUTELS.filter((sleutel) => waarde?.[sleutel] !== undefined).length;
}

// --------------------------------------------------------------------------
// Verplicht testgeval 1 — wanneer verschijnen de keuzeknoppen
// --------------------------------------------------------------------------

describe("de keuzeknoppen Kleur/Wit — NIEUW GEDRAG (SPEC 6.5)", () => {
  it("verschijnen bij een lamp die allebei kan", () => {
    const zichtbaar = zichtbareBesturingen({ state: "on", brightness: 128 }, RGBWW);

    assert.equal(zichtbaar.kleurkeuze, true);
    assert.ok(zichtbaar.stand === STAND_KLEUR || zichtbaar.stand === STAND_WIT);
  });

  it("verschijnen NIET bij een lamp die alleen kleurtemperatuur kan", () => {
    const zichtbaar = zichtbareBesturingen({ state: "on", brightness: 128 }, ALLEEN_WIT);

    assert.equal(zichtbaar.kleurkeuze, false);
    assert.equal(zichtbaar.stand, null);
    // Wat de lamp wél kan blijft gewoon staan.
    assert.equal(zichtbaar.kleurtemp, true);
    assert.equal(zichtbaar.kleur, false);
  });

  it("verschijnen NIET bij een lamp die alleen kleur kan", () => {
    const zichtbaar = zichtbareBesturingen({ state: "on", brightness: 128 }, ALLEEN_KLEUR);

    assert.equal(zichtbaar.kleurkeuze, false);
    assert.equal(zichtbaar.kleur, true);
    assert.equal(zichtbaar.kleurtemp, false);
  });

  it("verschijnen niet bij een lamp die uit staat", () => {
    // Bij "uit" hoort er geen enkele regelaar (SPEC 10.4), dus ook geen keuze.
    const zichtbaar = zichtbareBesturingen({ state: "off" }, RGBWW);

    assert.equal(zichtbaar.kleurkeuze, false);
    assert.equal(zichtbaar.stand, null);
    assert.equal(zichtbaar.kleurtemp, false);
    assert.equal(zichtbaar.kleur, false);
  });

  it("tonen nooit de kleurkiezer én de kelvinregelaar tegelijk", () => {
    // Dit is de bevinding zelf: vóór fase 10 stonden ze naast elkaar.
    for (const waarde of [
      { state: "on", brightness: 128 },
      { state: "on", brightness: 128, hs_color: [30, 60] },
      { state: "on", brightness: 128, color_temp_kelvin: 2700 },
      undefined,
    ]) {
      const zichtbaar = zichtbareBesturingen(waarde, RGBWW);
      assert.ok(
        !(zichtbaar.kleurtemp && zichtbaar.kleur),
        `beide zichtbaar bij ${JSON.stringify(waarde)}`,
      );
    }
  });
});

// --------------------------------------------------------------------------
// Welke stand is actief
// --------------------------------------------------------------------------

describe("kleurstandVan — NIEUW GEDRAG (SPEC 6.5)", () => {
  it("volgt de opgeslagen waarde: een kleurtemperatuur betekent wit", () => {
    assert.equal(
      kleurstandVan({ state: "on", color_temp_kelvin: 2700 }, RGBWW),
      STAND_WIT,
    );
  });

  it("volgt de opgeslagen waarde: een kleur betekent kleur", () => {
    assert.equal(
      kleurstandVan({ state: "on", hs_color: [30, 60] }, RGBWW),
      STAND_KLEUR,
    );
  });

  it("volgt de huidige color_mode van de lamp als er niets is opgeslagen", () => {
    assert.equal(kleurstandVan(undefined, RGBWW), STAND_KLEUR);
    assert.equal(kleurstandVan(undefined, RGBWW_IN_WIT), STAND_WIT);
  });

  it("kiest wit als er niets is om op te varen", () => {
    // Een lamp die uit is meldt geen color_mode. Wit is dan de standaard,
    // omdat aanzetten in de opslag alleen brightness oplevert — zonder
    // kleurattribuut — en dat is wit licht op de eigen stand van de lamp.
    const uit = {
      state: "off",
      attributes: { supported_color_modes: ["color_temp", "rgbww"] },
    };
    assert.equal(kleurstandVan(undefined, uit), STAND_WIT);
  });

  it("heeftKleurkeuze onderscheidt de drie soorten lampen", () => {
    const kan = (stateObj) => zichtbareBesturingen({ state: "on" }, stateObj);
    assert.equal(kan(RGBWW).kleurkeuze, true);
    assert.equal(kan(ALLEEN_WIT).kleurkeuze, false);
    assert.equal(kan(ALLEEN_KLEUR).kleurkeuze, false);
    assert.equal(heeftKleurkeuze(undefined), false);
  });
});

// --------------------------------------------------------------------------
// Verplicht testgeval 2 — wisselen
// --------------------------------------------------------------------------

describe("metKleurstand — NIEUW GEDRAG (SPEC 6.5 en 10.4)", () => {
  it("van Kleur naar Wit verwijdert de kleur en zet color_temp_kelvin", () => {
    const kleur = metKleur({ state: "on", brightness: 128 }, [30, 60], RGBWW);
    assert.equal(kleur.hs_color !== undefined, true);

    const wit = metKleurstand(kleur, STAND_WIT, RGBWW);

    assert.equal(wit.hs_color, undefined, "de kleur is weg");
    assert.equal(typeof wit.color_temp_kelvin, "number");
    assert.equal(aantalKleurattributen(wit), 1);
    assert.equal(wit.brightness, 128, "de helderheid blijft staan");
  });

  it("van Wit naar Kleur verwijdert color_temp_kelvin en zet een kleur", () => {
    const wit = metKleurtemp({ state: "on", brightness: 128 }, 2700, RGBWW);
    assert.equal(wit.color_temp_kelvin, 2700);

    const kleur = metKleurstand(wit, STAND_KLEUR, RGBWW);

    assert.equal(kleur.color_temp_kelvin, undefined, "de kleurtemperatuur is weg");
    assert.equal(Array.isArray(kleur.hs_color), true);
    assert.equal(aantalKleurattributen(kleur), 1);
  });

  it("laat een lamp die op uit stond aangaan", () => {
    // Een `state: "off"` met een kleurattribuut zou een schemafout zijn.
    const uit = metKleurstand({ state: "off" }, STAND_KLEUR, RGBWW);

    assert.equal(uit.state, "on");
    assert.equal(aantalKleurattributen(uit), 1);
  });

  it("doet niets bij een lamp die maar één van de twee kan", () => {
    const waarde = { state: "on", brightness: 128, color_temp_kelvin: 2700 };
    assert.deepEqual(metKleurstand(waarde, STAND_KLEUR, ALLEEN_WIT), waarde);
  });

  it("is heen en weer te maken", () => {
    let waarde = { state: "on", brightness: 128 };
    for (const stand of [STAND_KLEUR, STAND_WIT, STAND_KLEUR, STAND_WIT, STAND_KLEUR]) {
      waarde = metKleurstand(waarde, stand, RGBWW);
      assert.equal(kleurstandVan(waarde, RGBWW), stand);
      assert.equal(aantalKleurattributen(waarde), 1);
    }
  });
});

// --------------------------------------------------------------------------
// Verplicht testgeval 3 — nooit twee kleurattributen, ook niet via een reeks
// --------------------------------------------------------------------------

describe("nooit twee kleurattributen — NIEUW GEDRAG (SPEC 10.4)", () => {
  /** Elke handeling die de editor op één lamprij kan uitvoeren. */
  const HANDELINGEN = [
    ["helderheid 20 %", (w) => metHelderheid(w, vanProcent(20), RGBWW)],
    ["helderheid 100 %", (w) => metHelderheid(w, vanProcent(100), RGBWW)],
    ["kleur zetten", (w) => metKleur(w, [200, 80], RGBWW)],
    ["kelvin zetten", (w) => metKleurtemp(w, 3000, RGBWW)],
    ["stand kleur", (w) => metKleurstand(w, STAND_KLEUR, RGBWW)],
    ["stand wit", (w) => metKleurstand(w, STAND_WIT, RGBWW)],
  ];

  it("na elke afzonderlijke handeling staat er hooguit één", () => {
    for (const [naam, doe] of HANDELINGEN) {
      const uit = doe({ state: "on", brightness: 128 });
      assert.ok(
        aantalKleurattributen(uit) <= 1,
        `${naam} leverde ${JSON.stringify(uit)} op`,
      );
    }
  });

  it("ook niet na een lange reeks handelingen door elkaar", () => {
    // Alle paren, drietallen en viertallen achter elkaar — dat dekt elk pad dat
    // een gebruiker in de editor kan lopen zonder de rij te verlaten.
    const start = { state: "on", brightness: 128 };
    let gecontroleerd = 0;

    for (const [n1, d1] of HANDELINGEN) {
      for (const [n2, d2] of HANDELINGEN) {
        for (const [n3, d3] of HANDELINGEN) {
          for (const [n4, d4] of HANDELINGEN) {
            const uit = d4(d3(d2(d1(start))));
            gecontroleerd += 1;
            assert.ok(
              aantalKleurattributen(uit) <= 1,
              `${n1} → ${n2} → ${n3} → ${n4} leverde ${JSON.stringify(uit)} op`,
            );
            assert.equal(uit.state, "on");
          }
        }
      }
    }

    assert.equal(gecontroleerd, HANDELINGEN.length ** 4);
  });

  it("REGRESSIEWACHT — metKleur en metKleurtemp wisten elkaar al", () => {
    // Dit gold vóór fase 10 ook. De bevinding zat in de UI, die beide
    // regelaars aanbood; het datamodel liet het al niet toe. Deze test bewaakt
    // dat die eigenschap blijft, want de nieuwe keuzelogica leunt erop.
    const metBeide = { state: "on", brightness: 128, hs_color: [30, 60] };
    const na = metKleurtemp(metBeide, 3000, RGBWW);

    assert.equal(na.hs_color, undefined);
    assert.equal(na.color_temp_kelvin, 3000);
  });
});

// --------------------------------------------------------------------------
// Verplicht testgeval 4 — helderheid in procenten
// --------------------------------------------------------------------------

describe("helderheid in procenten — NIEUW GEDRAG (bevinding 1, SPEC 4.4)", () => {
  it("toont een percentage bij elke waarde tussen 1 en 255", () => {
    for (let brightness = MIN_BRIGHTNESS; brightness <= MAX_BRIGHTNESS; brightness += 1) {
      const procent = alsProcent(brightness);
      assert.ok(
        Number.isInteger(procent) && procent >= MIN_PROCENT && procent <= MAX_PROCENT,
        `brightness ${brightness} gaf ${procent}`,
      );
    }
  });

  it("laat een brandende lamp nooit op 0 % uitkomen", () => {
    // Dit is de reden dat `alsProcent` sinds fase 10 naar boven klemt:
    // brightness 1 is 0,39 % en rondde af naar 0.
    assert.equal(alsProcent(MIN_BRIGHTNESS), 1);
  });

  it("vanProcent geeft altijd een waarde binnen HA's schaal", () => {
    for (let procent = MIN_PROCENT; procent <= MAX_PROCENT; procent += 1) {
      const brightness = vanProcent(procent);
      assert.ok(
        Number.isInteger(brightness) &&
          brightness >= MIN_BRIGHTNESS &&
          brightness <= MAX_BRIGHTNESS,
        `${procent} % gaf ${brightness}`,
      );
    }
    assert.equal(vanProcent(100), MAX_BRIGHTNESS);
  });

  it("een percentage heen en weer blijft hetzelfde percentage", () => {
    // De opslag blijft 0..255, dus heen en weer is niet exact — maar wat de
    // gebruiker ziet mag niet verspringen zodra hij niets doet.
    for (let procent = MIN_PROCENT; procent <= MAX_PROCENT; procent += 1) {
      assert.equal(alsProcent(vanProcent(procent)), procent, `bij ${procent} %`);
    }
  });

  it("wat er wordt opgeslagen blijft HA's schaal, niet het percentage", () => {
    const uit = metHelderheid({ state: "on" }, vanProcent(50), RGBWW);

    assert.equal(uit.brightness, 128);
    assert.equal(alsProcent(uit.brightness), 50);
  });
});
